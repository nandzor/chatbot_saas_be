<?php

namespace App\Jobs;

use App\Models\BillingInvoice;
use App\Models\Subscription;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class ProcessOverdueInvoices implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * The number of times the job may be attempted.
     */
    public int $tries = 3;

    /**
     * The maximum number of seconds the job can run.
     */
    public int $timeout = 300;

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        try {
            Log::channel('billing')->info('Starting overdue invoice processing');

            $overdueInvoices = BillingInvoice::where('status', 'pending')
                ->where('due_date', '<', now())
                ->get();

            $processedCount = 0;

            foreach ($overdueInvoices as $invoice) {
                try {
                    $this->processOverdueInvoice($invoice);
                    $processedCount++;
                } catch (\Exception $e) {
                    Log::channel('billing')->error('Failed to process overdue invoice', [
                        'invoice_id' => $invoice->id,
                        'error' => $e->getMessage(),
                    ]);
                }
            }

            Log::channel('billing')->info('Overdue invoice processing completed', [
                'total_overdue' => $overdueInvoices->count(),
                'processed' => $processedCount,
            ]);

        } catch (\Exception $e) {
            Log::channel('billing')->error('Failed to process overdue invoices', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            throw $e;
        }
    }

    /**
     * Process individual overdue invoice.
     */
    protected function processOverdueInvoice(BillingInvoice $invoice): void
    {
        DB::transaction(function () use ($invoice) {
            // Mark invoice as overdue
            $invoice->update([
                'status' => 'overdue',
                'overdue_date' => now(),
            ]);

            Log::channel('billing')->warning('Invoice marked as overdue', [
                'invoice_id' => $invoice->id,
                'organization_id' => $invoice->organization_id,
                'subscription_id' => $invoice->subscription_id,
                'amount' => $invoice->total_amount,
                'currency' => $invoice->currency,
                'due_date' => $invoice->due_date,
                'overdue_days' => now()->diffInDays($invoice->due_date),
            ]);

            // Update related subscription if exists
            if ($invoice->subscription_id) {
                $this->updateSubscriptionForOverdue($invoice);
            }

            // Send overdue notification
            $this->sendOverdueNotification($invoice);

            // Log security event for overdue invoice
            $this->logOverdueSecurityEvent($invoice);
        });
    }

    /**
     * Update subscription status for overdue invoice.
     */
    protected function updateSubscriptionForOverdue(BillingInvoice $invoice): void
    {
        $subscription = Subscription::find($invoice->subscription_id);

        if (!$subscription) {
            return;
        }

        // Check if subscription should be suspended
        $overdueDays = now()->diffInDays($invoice->due_date);

        if ($overdueDays >= 7 && $subscription->status === 'active') {
            $subscription->update([
                'status' => 'past_due',
                'suspension_reason' => 'Payment overdue',
            ]);

            Log::channel('billing')->warning('Subscription marked as past due', [
                'subscription_id' => $subscription->id,
                'organization_id' => $subscription->organization_id,
                'invoice_id' => $invoice->id,
                'overdue_days' => $overdueDays,
            ]);
        } elseif ($overdueDays >= 30 && $subscription->status === 'past_due') {
            $subscription->update([
                'status' => 'suspended',
                'suspension_reason' => 'Payment overdue for 30+ days',
            ]);

            Log::channel('billing')->critical('Subscription suspended due to overdue payment', [
                'subscription_id' => $subscription->id,
                'organization_id' => $subscription->organization_id,
                'invoice_id' => $invoice->id,
                'overdue_days' => $overdueDays,
            ]);
        }
    }

    /**
     * Send overdue notification.
     */
    protected function sendOverdueNotification(BillingInvoice $invoice): void
    {
        // Dispatch email notification job
        SendOverdueInvoiceEmail::dispatch($invoice);

        // Log notification dispatch
        Log::channel('billing')->info('Overdue invoice notification dispatched', [
            'invoice_id' => $invoice->id,
            'organization_id' => $invoice->organization_id,
        ]);
    }

    /**
     * Log security event for overdue invoice.
     */
    protected function logOverdueSecurityEvent(BillingInvoice $invoice): void
    {
        $overdueDays = now()->diffInDays($invoice->due_date);

        // Log security event for long overdue invoices
        if ($overdueDays >= 30) {
            Log::channel('security')->warning('Long overdue invoice detected', [
                'invoice_id' => $invoice->id,
                'organization_id' => $invoice->organization_id,
                'subscription_id' => $invoice->subscription_id,
                'amount' => $invoice->total_amount,
                'currency' => $invoice->currency,
                'overdue_days' => $overdueDays,
                'timestamp' => now(),
            ]);
        }

        // Check for multiple overdue invoices from same organization
        $overdueCount = BillingInvoice::where('organization_id', $invoice->organization_id)
            ->where('status', 'overdue')
            ->count();

        if ($overdueCount >= 3) {
            Log::channel('security')->warning('Multiple overdue invoices from organization', [
                'organization_id' => $invoice->organization_id,
                'overdue_count' => $overdueCount,
                'latest_invoice_id' => $invoice->id,
                'timestamp' => now(),
            ]);
        }
    }

    /**
     * Handle a job failure.
     */
    public function failed(\Throwable $exception): void
    {
        Log::channel('billing')->error('Overdue invoice processing job failed', [
            'error' => $exception->getMessage(),
            'attempts' => $this->attempts(),
        ]);
    }
}
