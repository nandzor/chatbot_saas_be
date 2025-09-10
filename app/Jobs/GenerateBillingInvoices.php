<?php

namespace App\Jobs;

use App\Models\BillingInvoice;
use App\Models\Subscription;
use App\Models\Organization;
use App\Services\BillingInvoiceService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class GenerateBillingInvoices implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected ?int $organizationId;
    protected ?int $subscriptionId;
    protected string $billingCycle;

    /**
     * The number of times the job may be attempted.
     */
    public int $tries = 3;

    /**
     * The maximum number of seconds the job can run.
     */
    public int $timeout = 300;

    /**
     * Create a new job instance.
     */
    public function __construct(?int $organizationId = null, ?int $subscriptionId = null, string $billingCycle = 'monthly')
    {
        $this->organizationId = $organizationId;
        $this->subscriptionId = $subscriptionId;
        $this->billingCycle = $billingCycle;
    }

    /**
     * Execute the job.
     */
    public function handle(BillingInvoiceService $billingService): void
    {
        try {
            Log::channel('billing')->info('Starting billing invoice generation', [
                'organization_id' => $this->organizationId,
                'subscription_id' => $this->subscriptionId,
                'billing_cycle' => $this->billingCycle,
            ]);

            $invoicesGenerated = 0;

            if ($this->subscriptionId) {
                // Generate invoice for specific subscription
                $invoicesGenerated = $this->generateSubscriptionInvoice($billingService);
            } elseif ($this->organizationId) {
                // Generate invoices for specific organization
                $invoicesGenerated = $this->generateOrganizationInvoices($billingService);
            } else {
                // Generate invoices for all active subscriptions
                $invoicesGenerated = $this->generateAllInvoices($billingService);
            }

            Log::channel('billing')->info('Billing invoice generation completed', [
                'invoices_generated' => $invoicesGenerated,
                'organization_id' => $this->organizationId,
                'subscription_id' => $this->subscriptionId,
                'billing_cycle' => $this->billingCycle,
            ]);

        } catch (\Exception $e) {
            Log::channel('billing')->error('Failed to generate billing invoices', [
                'organization_id' => $this->organizationId,
                'subscription_id' => $this->subscriptionId,
                'billing_cycle' => $this->billingCycle,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            throw $e;
        }
    }

    /**
     * Generate invoice for specific subscription.
     */
    protected function generateSubscriptionInvoice(BillingInvoiceService $billingService): int
    {
        $subscription = Subscription::find($this->subscriptionId);

        if (!$subscription) {
            Log::channel('billing')->warning('Subscription not found for invoice generation', [
                'subscription_id' => $this->subscriptionId,
            ]);
            return 0;
        }

        if (!$this->shouldGenerateInvoice($subscription)) {
            Log::channel('billing')->info('Skipping invoice generation for subscription', [
                'subscription_id' => $subscription->id,
                'reason' => 'Invoice not due or already exists',
            ]);
            return 0;
        }

        try {
            $invoice = $billingService->createInvoice([
                'organization_id' => $subscription->organization_id,
                'subscription_id' => $subscription->id,
                'billing_cycle' => $subscription->billing_cycle,
                'amount' => $subscription->unit_amount,
                'currency' => $subscription->currency,
            ]);

            Log::channel('billing')->info('Invoice generated for subscription', [
                'invoice_id' => $invoice->id,
                'subscription_id' => $subscription->id,
                'amount' => $invoice->total_amount,
                'currency' => $invoice->currency,
            ]);

            // Dispatch notification job
            SendInvoiceGeneratedEmail::dispatch($invoice);

            return 1;
        } catch (\Exception $e) {
            Log::channel('billing')->error('Failed to generate invoice for subscription', [
                'subscription_id' => $subscription->id,
                'error' => $e->getMessage(),
            ]);
            return 0;
        }
    }

    /**
     * Generate invoices for specific organization.
     */
    protected function generateOrganizationInvoices(BillingInvoiceService $billingService): int
    {
        $organization = Organization::find($this->organizationId);

        if (!$organization) {
            Log::channel('billing')->warning('Organization not found for invoice generation', [
                'organization_id' => $this->organizationId,
            ]);
            return 0;
        }

        $subscriptions = Subscription::where('organization_id', $organization->id)
            ->where('status', 'active')
            ->get();

        $invoicesGenerated = 0;

        foreach ($subscriptions as $subscription) {
            if ($this->shouldGenerateInvoice($subscription)) {
                try {
                    $invoice = $billingService->createInvoice([
                        'organization_id' => $subscription->organization_id,
                        'subscription_id' => $subscription->id,
                        'billing_cycle' => $subscription->billing_cycle,
                        'amount' => $subscription->unit_amount,
                        'currency' => $subscription->currency,
                    ]);

                    $invoicesGenerated++;

                    Log::channel('billing')->info('Invoice generated for organization subscription', [
                        'invoice_id' => $invoice->id,
                        'organization_id' => $organization->id,
                        'subscription_id' => $subscription->id,
                        'amount' => $invoice->total_amount,
                    ]);

                    // Dispatch notification job
                    SendInvoiceGeneratedEmail::dispatch($invoice);

                } catch (\Exception $e) {
                    Log::channel('billing')->error('Failed to generate invoice for organization subscription', [
                        'organization_id' => $organization->id,
                        'subscription_id' => $subscription->id,
                        'error' => $e->getMessage(),
                    ]);
                }
            }
        }

        return $invoicesGenerated;
    }

    /**
     * Generate invoices for all active subscriptions.
     */
    protected function generateAllInvoices(BillingInvoiceService $billingService): int
    {
        $subscriptions = Subscription::where('status', 'active')
            ->where('billing_cycle', $this->billingCycle)
            ->get();

        $invoicesGenerated = 0;

        foreach ($subscriptions as $subscription) {
            if ($this->shouldGenerateInvoice($subscription)) {
                try {
                    $invoice = $billingService->createInvoice([
                        'organization_id' => $subscription->organization_id,
                        'subscription_id' => $subscription->id,
                        'billing_cycle' => $subscription->billing_cycle,
                        'amount' => $subscription->unit_amount,
                        'currency' => $subscription->currency,
                    ]);

                    $invoicesGenerated++;

                    Log::channel('billing')->info('Invoice generated for active subscription', [
                        'invoice_id' => $invoice->id,
                        'subscription_id' => $subscription->id,
                        'organization_id' => $subscription->organization_id,
                        'amount' => $invoice->total_amount,
                    ]);

                    // Dispatch notification job
                    SendInvoiceGeneratedEmail::dispatch($invoice);

                } catch (\Exception $e) {
                    Log::channel('billing')->error('Failed to generate invoice for active subscription', [
                        'subscription_id' => $subscription->id,
                        'organization_id' => $subscription->organization_id,
                        'error' => $e->getMessage(),
                    ]);
                }
            }
        }

        return $invoicesGenerated;
    }

    /**
     * Check if invoice should be generated for subscription.
     */
    protected function shouldGenerateInvoice(Subscription $subscription): bool
    {
        // Check if subscription is active
        if ($subscription->status !== 'active') {
            return false;
        }

        // Check if billing cycle matches
        if ($subscription->billing_cycle !== $this->billingCycle) {
            return false;
        }

        // Check if current period is ending soon (within 7 days)
        $currentPeriodEnd = $subscription->current_period_end;
        if (!$currentPeriodEnd || now()->addDays(7)->isBefore($currentPeriodEnd)) {
            return false;
        }

        // Check if invoice already exists for this period
        $existingInvoice = BillingInvoice::where('subscription_id', $subscription->id)
            ->where('period_start', $subscription->current_period_start)
            ->where('period_end', $subscription->current_period_end)
            ->first();

        if ($existingInvoice) {
            return false;
        }

        return true;
    }

    /**
     * Handle a job failure.
     */
    public function failed(\Throwable $exception): void
    {
        Log::channel('billing')->error('Billing invoice generation job failed', [
            'organization_id' => $this->organizationId,
            'subscription_id' => $this->subscriptionId,
            'billing_cycle' => $this->billingCycle,
            'error' => $exception->getMessage(),
            'attempts' => $this->attempts(),
        ]);
    }
}
