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

class ProcessPaymentFailure implements ShouldQueue
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
            Log::channel('payment')->info('Processing failed payment', [
                'payment_id' => $this->payment->id,
                'organization_id' => $this->payment->organization_id,
                'amount' => $this->payment->amount,
                'currency' => $this->payment->currency,
                'failure_reason' => $this->payment->failure_reason,
            ]);

            DB::transaction(function () {
                // Update related billing invoice if exists
                $this->updateBillingInvoice();

                // Update subscription if exists
                $this->updateSubscription();

                // Send failure notification
                $this->sendFailureNotification();

                // Log failed payment
                $this->logFailedPayment();
            });

            Log::channel('payment')->info('Payment failure processing completed', [
                'payment_id' => $this->payment->id,
            ]);

        } catch (\Exception $e) {
            Log::channel('payment')->error('Failed to process payment failure', [
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

            if ($invoice && $invoice->status !== 'overdue') {
                // Check if invoice is past due date
                if (now()->isAfter($invoice->due_date)) {
                    $invoice->update([
                        'status' => 'overdue',
                        'failure_reason' => $this->payment->failure_reason,
                    ]);

                    Log::channel('billing')->warning('Billing invoice marked as overdue', [
                        'invoice_id' => $invoice->id,
                        'payment_id' => $this->payment->id,
                        'failure_reason' => $this->payment->failure_reason,
                    ]);
                } else {
                    // Keep as pending if not past due
                    $invoice->update([
                        'failure_reason' => $this->payment->failure_reason,
                    ]);

                    Log::channel('billing')->info('Billing invoice failure reason updated', [
                        'invoice_id' => $invoice->id,
                        'payment_id' => $this->payment->id,
                        'failure_reason' => $this->payment->failure_reason,
                    ]);
                }
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
                // Update subscription status based on failure
                $newStatus = $this->determineSubscriptionStatus($subscription);

                if ($newStatus !== $subscription->status) {
                    $subscription->update([
                        'status' => $newStatus,
                        'failure_reason' => $this->payment->failure_reason,
                    ]);

                    Log::channel('billing')->warning('Subscription status updated due to payment failure', [
                        'subscription_id' => $subscription->id,
                        'payment_id' => $this->payment->id,
                        'new_status' => $newStatus,
                        'failure_reason' => $this->payment->failure_reason,
                    ]);
                }
            }
        }
    }

    /**
     * Determine new subscription status based on failure.
     */
    protected function determineSubscriptionStatus(Subscription $subscription): string
    {
        // If subscription is active, mark as past_due
        if ($subscription->status === 'active') {
            return 'past_due';
        }

        // If already past_due, consider suspension based on failure count
        if ($subscription->status === 'past_due') {
            $failureCount = PaymentTransaction::where('subscription_id', $subscription->id)
                ->where('status', 'failed')
                ->where('created_at', '>=', now()->subDays(30))
                ->count();

            // Suspend after 3 failures in 30 days
            if ($failureCount >= 3) {
                return 'suspended';
            }

            return 'past_due';
        }

        // Keep current status for other states
        return $subscription->status;
    }

    /**
     * Send failure notification.
     */
    protected function sendFailureNotification(): void
    {
        // Dispatch email notification job
        SendPaymentFailureEmail::dispatch($this->payment);

        // Log notification dispatch
        Log::channel('payment')->info('Payment failure notification dispatched', [
            'payment_id' => $this->payment->id,
            'organization_id' => $this->payment->organization_id,
        ]);
    }

    /**
     * Log failed payment.
     */
    protected function logFailedPayment(): void
    {
        Log::channel('audit')->warning('Payment failed', [
            'payment_id' => $this->payment->id,
            'organization_id' => $this->payment->organization_id,
            'amount' => $this->payment->amount,
            'currency' => $this->payment->currency,
            'gateway' => $this->payment->gateway,
            'gateway_transaction_id' => $this->payment->gateway_transaction_id,
            'failure_reason' => $this->payment->failure_reason,
            'timestamp' => now(),
        ]);

        // Log security event for repeated failures
        $recentFailures = PaymentTransaction::where('organization_id', $this->payment->organization_id)
            ->where('status', 'failed')
            ->where('created_at', '>=', now()->subHours(24))
            ->count();

        if ($recentFailures >= 5) {
            Log::channel('security')->warning('Multiple payment failures detected', [
                'organization_id' => $this->payment->organization_id,
                'failure_count_24h' => $recentFailures,
                'latest_payment_id' => $this->payment->id,
                'timestamp' => now(),
            ]);
        }
    }

    /**
     * Handle a job failure.
     */
    public function failed(\Throwable $exception): void
    {
        Log::channel('payment')->error('Payment failure processing job failed', [
            'payment_id' => $this->payment->id,
            'error' => $exception->getMessage(),
            'attempts' => $this->attempts(),
        ]);
    }
}
