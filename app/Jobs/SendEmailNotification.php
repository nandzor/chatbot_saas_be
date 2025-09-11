<?php

namespace App\Jobs;

use App\Models\Organization;
use App\Models\Notification;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class SendEmailNotification implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public Organization $organization;
    public Notification $notification;
    public array $data;

    /**
     * The number of times the job may be attempted.
     */
    public int $tries = 3;

    /**
     * The maximum number of seconds the job can run.
     */
    public int $timeout = 30;

    /**
     * Create a new job instance.
     */
    public function __construct(Organization $organization, Notification $notification, array $data = [])
    {
        $this->organization = $organization;
        $this->notification = $notification;
        $this->data = $data;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        try {
            Log::info('Sending email notification', [
                'organization_id' => $this->organization->id,
                'notification_id' => $this->notification->id,
                'email' => $this->organization->email
            ]);

            // Check if email is configured
            if (!$this->organization->email) {
                Log::warning('Organization email not configured', [
                    'organization_id' => $this->organization->id
                ]);
                return;
            }

            // Prepare email data
            $emailData = [
                'organization' => $this->organization,
                'notification' => $this->notification,
                'data' => $this->data,
                'subject' => $this->data['email_subject'] ?? $this->notification->title,
                'template' => $this->data['email_template'] ?? 'notifications.default'
            ];

            // Send email using Laravel Mail
            Mail::send($emailData['template'], $emailData, function ($message) use ($emailData) {
                $message->to($this->organization->email, $this->organization->name)
                    ->subject($emailData['subject'])
                    ->from(
                        config('mail.from.address', 'noreply@example.com'),
                        config('mail.from.name', 'System Notification')
                    );
            });

            // Update notification status
            $this->notification->update([
                'email_sent_at' => now(),
                'email_status' => 'sent'
            ]);

            Log::info('Email notification sent successfully', [
                'organization_id' => $this->organization->id,
                'notification_id' => $this->notification->id
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to send email notification', [
                'organization_id' => $this->organization->id,
                'notification_id' => $this->notification->id,
                'error' => $e->getMessage()
            ]);

            // Update notification status
            $this->notification->update([
                'email_status' => 'failed',
                'email_error' => $e->getMessage()
            ]);

            throw $e;
        }
    }

    /**
     * Handle a job failure.
     */
    public function failed(\Throwable $exception): void
    {
        Log::error('Email notification job failed permanently', [
            'organization_id' => $this->organization->id,
            'notification_id' => $this->notification->id,
            'error' => $exception->getMessage()
        ]);

        $this->notification->update([
            'email_status' => 'failed',
            'email_error' => $exception->getMessage(),
            'email_failed_at' => now()
        ]);
    }
}
