<?php

namespace App\Listeners;

use App\Events\NotificationSent;
use App\Jobs\SendEmailNotification;
use App\Jobs\SendWebhookNotification;
use App\Jobs\SendInAppNotification;
use App\Jobs\SendSmsNotification;
use App\Jobs\SendPushNotification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Log;

class ProcessNotification implements ShouldQueue
{
    use InteractsWithQueue;

    /**
     * The number of times the job may be attempted.
     */
    public int $tries = 3;

    /**
     * The maximum number of seconds the job can run.
     */
    public int $timeout = 60;

    /**
     * Create the event listener.
     */
    public function __construct()
    {
        //
    }

    /**
     * Handle the event.
     */
    public function handle(NotificationSent $event): void
    {
        try {
            $organization = $event->organization;
            $notification = $event->notification;
            $type = $event->type;
            $data = $event->data;

            Log::info('Processing notification', [
                'organization_id' => $organization->id,
                'notification_id' => $notification->id,
                'type' => $type,
                'channels' => $data['channels'] ?? ['in_app']
            ]);

            // Determine which channels to use
            $channels = $data['channels'] ?? ['in_app'];
            $priority = $data['priority'] ?? 'normal';

            // Send in-app notification (always)
            if (in_array('in_app', $channels)) {
                SendInAppNotification::dispatch($organization, $notification, $data)
                    ->onQueue($this->getQueueName($priority));
            }

            // Send email notification
            if (in_array('email', $channels) && isset($data['send_email']) && $data['send_email']) {
                SendEmailNotification::dispatch($organization, $notification, $data)
                    ->onQueue($this->getQueueName($priority));
            }

            // Send webhook notification
            if (in_array('webhook', $channels) && $organization->webhook_url) {
                SendWebhookNotification::dispatch($organization, $notification, $data)
                    ->onQueue($this->getQueueName($priority));
            }

            // Send SMS notification (if configured)
            if (in_array('sms', $channels) && (isset($data['phone_number']) || $organization->phone)) {
                SendSmsNotification::dispatch($organization, $notification, $data)
                    ->onQueue($this->getQueueName($priority));
            }

            // Send push notification (if configured)
            if (in_array('push', $channels) && isset($data['device_tokens']) && !empty($data['device_tokens'])) {
                SendPushNotification::dispatch($organization, $notification, $data)
                    ->onQueue($this->getQueueName($priority));
            }

            Log::info('Notification processing completed', [
                'organization_id' => $organization->id,
                'notification_id' => $notification->id,
                'channels_processed' => $channels
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to process notification', [
                'organization_id' => $event->organization->id,
                'notification_id' => $event->notification->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            // Re-throw the exception to trigger retry mechanism
            throw $e;
        }
    }

    /**
     * Get queue name based on priority
     */
    private function getQueueName(string $priority): string
    {
        return match ($priority) {
            'high' => 'notifications-high',
            'urgent' => 'notifications-urgent',
            'low' => 'notifications-low',
            default => 'notifications'
        };
    }

    /**
     * Handle a job failure.
     */
    public function failed(NotificationSent $event, \Throwable $exception): void
    {
        Log::error('Notification processing failed permanently', [
            'organization_id' => $event->organization->id,
            'notification_id' => $event->notification->id,
            'error' => $exception->getMessage(),
            'attempts' => $this->attempts()
        ]);

        // Mark notification as failed
        $event->notification->update([
            'status' => 'failed',
            'error_message' => $exception->getMessage(),
            'failed_at' => now()
        ]);
    }
}
