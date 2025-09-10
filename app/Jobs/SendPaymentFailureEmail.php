<?php

namespace App\Jobs;

use App\Models\PaymentTransaction;
use App\Models\Organization;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class SendPaymentFailureEmail implements ShouldQueue
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
    public int $timeout = 60;

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
            $organization = Organization::find($this->payment->organization_id);

            if (!$organization) {
                Log::channel('payment')->warning('Organization not found for payment failure email', [
                    'payment_id' => $this->payment->id,
                    'organization_id' => $this->payment->organization_id,
                ]);
                return;
            }

            // Check if organization has email notifications enabled
            if (!$this->shouldSendEmail($organization)) {
                Log::channel('payment')->info('Payment failure email skipped - notifications disabled', [
                    'payment_id' => $this->payment->id,
                    'organization_id' => $organization->id,
                ]);
                return;
            }

            // Send email notification
            Mail::to($organization->email)
                ->send(new \App\Mail\PaymentFailureMail($this->payment, $organization));

            Log::channel('payment')->info('Payment failure email sent', [
                'payment_id' => $this->payment->id,
                'organization_id' => $organization->id,
                'email' => $organization->email,
                'amount' => $this->payment->amount,
                'currency' => $this->payment->currency,
                'failure_reason' => $this->payment->failure_reason,
            ]);

        } catch (\Exception $e) {
            Log::channel('payment')->error('Failed to send payment failure email', [
                'payment_id' => $this->payment->id,
                'organization_id' => $this->payment->organization_id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            throw $e;
        }
    }

    /**
     * Check if email should be sent.
     */
    protected function shouldSendEmail(Organization $organization): bool
    {
        // Check if email notifications are enabled
        $settings = $organization->settings ?? [];
        $emailNotifications = $settings['notifications']['email'] ?? true;

        return $emailNotifications;
    }

    /**
     * Handle a job failure.
     */
    public function failed(\Throwable $exception): void
    {
        Log::channel('payment')->error('Payment failure email job failed', [
            'payment_id' => $this->payment->id,
            'error' => $exception->getMessage(),
            'attempts' => $this->attempts(),
        ]);
    }
}
