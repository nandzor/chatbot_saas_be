<?php

namespace App\Jobs;

use App\Models\Organization;
use App\Models\Notification;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SendWebhookNotification implements ShouldQueue
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
            Log::info('Sending webhook notification', [
                'organization_id' => $this->organization->id,
                'notification_id' => $this->notification->id,
                'webhook_url' => $this->organization->webhook_url
            ]);

            // Check if webhook URL is configured
            if (!$this->organization->webhook_url) {
                Log::warning('Organization webhook URL not configured', [
                    'organization_id' => $this->organization->id
                ]);
                return;
            }

            // Prepare webhook payload
            $payload = [
                'event' => 'notification.sent',
                'timestamp' => now()->toISOString(),
                'organization' => [
                    'id' => $this->organization->id,
                    'name' => $this->organization->name,
                    'code' => $this->organization->code,
                    'email' => $this->organization->email,
                    'status' => $this->organization->status
                ],
                'notification' => [
                    'id' => $this->notification->id,
                    'type' => $this->notification->type,
                    'title' => $this->notification->title,
                    'message' => $this->notification->message,
                    'data' => $this->notification->data,
                    'created_at' => $this->notification->created_at->toISOString()
                ],
                'data' => $this->data
            ];

            // Add signature for security
            $signature = $this->generateSignature($payload);
            $payload['signature'] = $signature;

            // Send webhook request
            $response = Http::timeout(10)
                ->withHeaders([
                    'Content-Type' => 'application/json',
                    'User-Agent' => 'OrganizationBot/1.0',
                    'X-Webhook-Signature' => $signature
                ])
                ->post($this->organization->webhook_url, $payload);

            // Check response
            if ($response->successful()) {
                $this->notification->update([
                    'webhook_sent_at' => now(),
                    'webhook_status' => 'sent',
                    'webhook_response' => $response->body()
                ]);

                Log::info('Webhook notification sent successfully', [
                    'organization_id' => $this->organization->id,
                    'notification_id' => $this->notification->id,
                    'status_code' => $response->status()
                ]);
            } else {
                throw new \Exception('Webhook request failed with status: ' . $response->status());
            }

        } catch (\Exception $e) {
            Log::error('Failed to send webhook notification', [
                'organization_id' => $this->organization->id,
                'notification_id' => $this->notification->id,
                'error' => $e->getMessage()
            ]);

            // Update notification status
            $this->notification->update([
                'webhook_status' => 'failed',
                'webhook_error' => $e->getMessage()
            ]);

            throw $e;
        }
    }

    /**
     * Generate webhook signature for security
     */
    private function generateSignature(array $payload): string
    {
        $webhookSecret = $this->organization->webhook_secret ?? config('app.webhook_secret', 'default-secret');
        $payloadString = json_encode($payload);
        
        return 'sha256=' . hash_hmac('sha256', $payloadString, $webhookSecret);
    }

    /**
     * Handle a job failure.
     */
    public function failed(\Throwable $exception): void
    {
        Log::error('Webhook notification job failed permanently', [
            'organization_id' => $this->organization->id,
            'notification_id' => $this->notification->id,
            'error' => $exception->getMessage()
        ]);

        $this->notification->update([
            'webhook_status' => 'failed',
            'webhook_error' => $exception->getMessage(),
            'webhook_failed_at' => now()
        ]);
    }
}
