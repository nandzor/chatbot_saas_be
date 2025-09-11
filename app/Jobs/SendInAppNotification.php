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
use Illuminate\Support\Facades\Cache;

class SendInAppNotification implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public Organization $organization;
    public Notification $notification;
    public array $data;

    /**
     * The number of times the job may be attempted.
     */
    public int $tries = 2;

    /**
     * The maximum number of seconds the job can run.
     */
    public int $timeout = 15;

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
            Log::info('Sending in-app notification', [
                'organization_id' => $this->organization->id,
                'notification_id' => $this->notification->id
            ]);

            // Update notification status
            $this->notification->update([
                'in_app_sent_at' => now(),
                'in_app_status' => 'sent'
            ]);

            // Clear notification cache for this organization
            $this->clearNotificationCache($this->organization->id);

            // If this is a real-time notification, you can broadcast it
            if (isset($this->data['broadcast']) && $this->data['broadcast']) {
                $this->broadcastNotification();
            }

            Log::info('In-app notification sent successfully', [
                'organization_id' => $this->organization->id,
                'notification_id' => $this->notification->id
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to send in-app notification', [
                'organization_id' => $this->organization->id,
                'notification_id' => $this->notification->id,
                'error' => $e->getMessage()
            ]);

            // Update notification status
            $this->notification->update([
                'in_app_status' => 'failed',
                'in_app_error' => $e->getMessage()
            ]);

            throw $e;
        }
    }

    /**
     * Clear notification cache for organization
     */
    private function clearNotificationCache(int $organizationId): void
    {
        $cacheKeys = [
            "notifications_org_{$organizationId}",
            "unread_notifications_org_{$organizationId}",
            "notification_count_org_{$organizationId}"
        ];

        foreach ($cacheKeys as $key) {
            Cache::forget($key);
        }
    }

    /**
     * Broadcast notification for real-time updates
     */
    private function broadcastNotification(): void
    {
        try {
            Log::info('Broadcasting notification for real-time update', [
                'organization_id' => $this->organization->id,
                'notification_id' => $this->notification->id,
                'channel' => 'organization.' . $this->organization->id
            ]);

            // Broadcast using Laravel Broadcasting
            if (config('broadcasting.default') !== 'null') {
                broadcast(new \App\Events\NotificationBroadcast(
                    $this->organization,
                    $this->notification,
                    [
                        'type' => $this->notification->type,
                        'title' => $this->notification->title,
                        'message' => $this->notification->message,
                        'data' => $this->notification->data,
                        'created_at' => $this->notification->created_at,
                        'is_read' => $this->notification->is_read
                    ]
                ));
            }

            // Also trigger browser notification if supported
            $this->triggerBrowserNotification();

        } catch (\Exception $e) {
            Log::error('Failed to broadcast notification', [
                'organization_id' => $this->organization->id,
                'notification_id' => $this->notification->id,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Trigger browser notification
     */
    private function triggerBrowserNotification(): void
    {
        try {
            // Store browser notification data in cache for client-side pickup
            $browserNotificationData = [
                'title' => $this->notification->title,
                'body' => $this->notification->message,
                'icon' => config('app.url') . '/favicon.ico',
                'tag' => 'notification-' . $this->notification->id,
                'data' => [
                    'notification_id' => $this->notification->id,
                    'organization_id' => $this->organization->id,
                    'type' => $this->notification->type,
                    'url' => $this->data['action_url'] ?? config('app.url') . '/dashboard'
                ]
            ];

            Cache::put(
                "browser_notification_org_{$this->organization->id}_notif_{$this->notification->id}",
                $browserNotificationData,
                300 // 5 minutes
            );

            Log::info('Browser notification data cached', [
                'organization_id' => $this->organization->id,
                'notification_id' => $this->notification->id
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to trigger browser notification', [
                'organization_id' => $this->organization->id,
                'notification_id' => $this->notification->id,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Handle a job failure.
     */
    public function failed(\Throwable $exception): void
    {
        Log::error('In-app notification job failed permanently', [
            'organization_id' => $this->organization->id,
            'notification_id' => $this->notification->id,
            'error' => $exception->getMessage()
        ]);

        $this->notification->update([
            'in_app_status' => 'failed',
            'in_app_error' => $exception->getMessage(),
            'in_app_failed_at' => now()
        ]);
    }
}
