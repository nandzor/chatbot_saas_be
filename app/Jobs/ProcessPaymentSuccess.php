<?php

namespace App\Jobs;

use App\Models\PaymentTransaction;
use App\Models\BillingInvoice;
use App\Models\Subscription;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class ProcessPaymentSuccess implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected PaymentTransaction $payment;

    /**
     * The number of times the job may be attempted.
     */
    public int $tries = 3;

    /**
     * The maximum number of seconds the job can run.
     */
    public int $timeout = 120;

    /**
     * Create a new job instance.
     */
    public function __construct(PaymentTransaction $payment)
    {
        $this->payment = $payment;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        try {
            Log::channel('payment')->info('Processing successful payment', [
                'payment_id' => $this->payment->id,
                'organization_id' => $this->payment->organization_id,
                'amount' => $this->payment->amount,
                'currency' => $this->payment->currency,
            ]);

            DB::transaction(function () {
                // Update related billing invoice if exists
                $this->updateBillingInvoice();

                // Update subscription if exists
                $this->updateSubscription();

                // Send success notification
                $this->sendSuccessNotification();

                // Log successful payment
                $this->logSuccessfulPayment();
            });

            Log::channel('payment')->info('Payment success processing completed', [
                'payment_id' => $this->payment->id,
            ]);

        } catch (\Exception $e) {
            Log::channel('payment')->error('Failed to process payment success', [
                'payment_id' => $this->payment->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            throw $e;
        }
    }

    /**
     * Update related billing invoice.
     */
    protected function updateBillingInvoice(): void
    {
        if ($this->payment->invoice_id) {
            $invoice = BillingInvoice::find($this->payment->invoice_id);

            if ($invoice && $invoice->status !== 'paid') {
                $invoice->update([
                    'status' => 'paid',
                    'paid_date' => now(),
                    'payment_method' => $this->payment->gateway,
                    'payment_reference' => $this->payment->gateway_transaction_id,
                ]);

                Log::channel('billing')->info('Billing invoice marked as paid', [
                    'invoice_id' => $invoice->id,
                    'payment_id' => $this->payment->id,
                    'amount' => $invoice->total_amount,
                ]);
            }
        }
    }

    /**
     * Update subscription if exists.
     */
    protected function updateSubscription(): void
    {
        if ($this->payment->subscription_id) {
            $subscription = Subscription::find($this->payment->subscription_id);

            if ($subscription) {
                // Update subscription status based on payment
                $newStatus = $this->determineSubscriptionStatus($subscription);

                if ($newStatus !== $subscription->status) {
                    $subscription->update([
                        'status' => $newStatus,
                        'current_period_start' => now(),
                        'current_period_end' => $this->calculateNextPeriodEnd($subscription),
                    ]);

                    Log::channel('billing')->info('Subscription status updated', [
                        'subscription_id' => $subscription->id,
                        'payment_id' => $this->payment->id,
                        'new_status' => $newStatus,
                    ]);
                }
            }
        }
    }

    /**
     * Determine new subscription status.
     */
    protected function determineSubscriptionStatus(Subscription $subscription): string
    {
        // If subscription was suspended or cancelled, reactivate it
        if (in_array($subscription->status, ['suspended', 'cancelled'])) {
            return 'active';
        }

        // If subscription was past_due, make it active
        if ($subscription->status === 'past_due') {
            return 'active';
        }

        // Keep current status if it's already active
        return $subscription->status;
    }

    /**
     * Calculate next period end date.
     */
    protected function calculateNextPeriodEnd(Subscription $subscription): \DateTime
    {
        $startDate = now();

        return match ($subscription->billing_cycle) {
            'monthly' => $startDate->copy()->addMonth(),
            'yearly' => $startDate->copy()->addYear(),
            'weekly' => $startDate->copy()->addWeek(),
            'daily' => $startDate->copy()->addDay(),
            default => $startDate->copy()->addMonth(),
        };
    }

    /**
     * Send success notification.
     */
    protected function sendSuccessNotification(): void
    {
        // Dispatch email notification job
        SendPaymentSuccessEmail::dispatch($this->payment);

        // Log notification dispatch
        Log::channel('payment')->info('Payment success notification dispatched', [
            'payment_id' => $this->payment->id,
            'organization_id' => $this->payment->organization_id,
        ]);
    }

    /**
     * Log successful payment.
     */
    protected function logSuccessfulPayment(): void
    {
        Log::channel('audit')->info('Payment completed successfully', [
            'payment_id' => $this->payment->id,
            'organization_id' => $this->payment->organization_id,
            'amount' => $this->payment->amount,
            'currency' => $this->payment->currency,
            'gateway' => $this->payment->gateway,
            'gateway_transaction_id' => $this->payment->gateway_transaction_id,
            'timestamp' => now(),
        ]);
    }

    /**
     * Handle a job failure.
     */
    public function failed(\Throwable $exception): void
    {
        Log::channel('payment')->error('Payment success processing job failed', [
            'payment_id' => $this->payment->id,
            'error' => $exception->getMessage(),
            'attempts' => $this->attempts(),
        ]);
    }
}
