<?php

namespace App\Jobs;

use App\Models\BillingInvoice;
use App\Models\Organization;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class SendInvoiceGeneratedEmail implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected BillingInvoice $invoice;

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
    public function __construct(BillingInvoice $invoice)
    {
        $this->invoice = $invoice;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        try {
            $organization = Organization::find($this->invoice->organization_id);

            if (!$organization) {
                Log::channel('billing')->warning('Organization not found for invoice generated email', [
                    'invoice_id' => $this->invoice->id,
                    'organization_id' => $this->invoice->organization_id,
                ]);
                return;
            }

            // Check if organization has email notifications enabled
            if (!$this->shouldSendEmail($organization)) {
                Log::channel('billing')->info('Invoice generated email skipped - notifications disabled', [
                    'invoice_id' => $this->invoice->id,
                    'organization_id' => $organization->id,
                ]);
                return;
            }

            // Send email notification
            Mail::to($organization->email)
                ->send(new \App\Mail\InvoiceGeneratedMail($this->invoice, $organization));

            Log::channel('billing')->info('Invoice generated email sent', [
                'invoice_id' => $this->invoice->id,
                'organization_id' => $organization->id,
                'email' => $organization->email,
                'invoice_number' => $this->invoice->invoice_number,
                'amount' => $this->invoice->total_amount,
                'currency' => $this->invoice->currency,
                'due_date' => $this->invoice->due_date,
            ]);

        } catch (\Exception $e) {
            Log::channel('billing')->error('Failed to send invoice generated email', [
                'invoice_id' => $this->invoice->id,
                'organization_id' => $this->invoice->organization_id,
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
        Log::channel('billing')->error('Invoice generated email job failed', [
            'invoice_id' => $this->invoice->id,
            'error' => $exception->getMessage(),
            'attempts' => $this->attempts(),
        ]);
    }
}
