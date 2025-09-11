<?php

namespace App\Services;

use App\Models\Organization;
use App\Models\Notification;
use App\Events\NotificationSent;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use Carbon\Carbon;

class NotificationSchedulerService
{
    /**
     * Schedule a notification for future delivery
     */
    public function scheduleNotification(
        int $organizationId,
        string $type,
        array $data,
        Carbon $scheduledAt,
        string $timezone = 'UTC'
    ): array {
        try {
            $organization = Organization::findOrFail($organizationId);

            // Convert scheduled time to UTC
            $scheduledAtUtc = $scheduledAt->setTimezone('UTC');

            // Validate scheduled time
            if ($scheduledAtUtc->isPast()) {
                throw new \InvalidArgumentException('Cannot schedule notification in the past');
            }

            // Create notification record with scheduled status
            $notification = $organization->notifications()->create([
                'type' => $type,
                'title' => $data['title'] ?? 'Scheduled Notification',
                'message' => $data['message'] ?? '',
                'data' => $data['data'] ?? [],
                'is_read' => false,
                'status' => 'scheduled',
                'scheduled_at' => $scheduledAtUtc,
                'timezone' => $timezone,
                'created_at' => now(),
                'updated_at' => now()
            ]);

            Log::info('Notification scheduled', [
                'organization_id' => $organizationId,
                'notification_id' => $notification->id,
                'type' => $type,
                'scheduled_at' => $scheduledAtUtc->toISOString(),
                'timezone' => $timezone
            ]);

            return [
                'success' => true,
                'notification_id' => $notification->id,
                'scheduled_at' => $scheduledAtUtc->toISOString(),
                'message' => 'Notification scheduled successfully'
            ];

        } catch (\Exception $e) {
            Log::error('Failed to schedule notification', [
                'organization_id' => $organizationId,
                'type' => $type,
                'scheduled_at' => $scheduledAt->toISOString(),
                'error' => $e->getMessage()
            ]);

            return [
                'success' => false,
                'message' => 'Failed to schedule notification: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Process scheduled notifications that are due
     */
    public function processScheduledNotifications(): int
    {
        $processedCount = 0;

        try {
            // Get all notifications scheduled to be sent now or in the past
            $dueNotifications = Notification::where('status', 'scheduled')
                ->where('scheduled_at', '<=', now())
                ->with('organization')
                ->limit(100) // Process in batches
                ->get();

            foreach ($dueNotifications as $notification) {
                try {
                    $this->processScheduledNotification($notification);
                    $processedCount++;
                } catch (\Exception $e) {
                    Log::error('Failed to process scheduled notification', [
                        'notification_id' => $notification->id,
                        'organization_id' => $notification->organization_id,
                        'error' => $e->getMessage()
                    ]);

                    // Mark as failed
                    $notification->update([
                        'status' => 'failed',
                        'error_message' => $e->getMessage(),
                        'failed_at' => now()
                    ]);
                }
            }

            if ($processedCount > 0) {
                Log::info('Processed scheduled notifications', [
                    'count' => $processedCount
                ]);
            }

        } catch (\Exception $e) {
            Log::error('Failed to process scheduled notifications', [
                'error' => $e->getMessage()
            ]);
        }

        return $processedCount;
    }

    /**
     * Process individual scheduled notification
     */
    private function processScheduledNotification(Notification $notification): void
    {
        // Update status to pending
        $notification->update(['status' => 'pending']);

        // Prepare notification data
        $data = array_merge($notification->data ?? [], [
            'channels' => $notification->data['channels'] ?? ['in_app'],
            'priority' => $notification->data['priority'] ?? 'normal',
            'scheduled' => true,
            'original_scheduled_at' => $notification->scheduled_at->toISOString()
        ]);

        // Trigger notification event
        event(new NotificationSent(
            $notification->organization,
            $notification,
            $notification->type,
            $data
        ));

        Log::info('Scheduled notification triggered', [
            'notification_id' => $notification->id,
            'organization_id' => $notification->organization_id,
            'type' => $notification->type
        ]);
    }

    /**
     * Cancel scheduled notification
     */
    public function cancelScheduledNotification(int $notificationId, int $organizationId = null): bool
    {
        try {
            $query = Notification::where('id', $notificationId)
                ->where('status', 'scheduled');

            if ($organizationId) {
                $query->where('organization_id', $organizationId);
            }

            $notification = $query->first();

            if (!$notification) {
                return false;
            }

            $notification->update([
                'status' => 'cancelled',
                'cancelled_at' => now()
            ]);

            Log::info('Scheduled notification cancelled', [
                'notification_id' => $notificationId,
                'organization_id' => $notification->organization_id
            ]);

            return true;

        } catch (\Exception $e) {
            Log::error('Failed to cancel scheduled notification', [
                'notification_id' => $notificationId,
                'organization_id' => $organizationId,
                'error' => $e->getMessage()
            ]);

            return false;
        }
    }

    /**
     * Reschedule notification
     */
    public function rescheduleNotification(
        int $notificationId,
        Carbon $newScheduledAt,
        int $organizationId = null
    ): bool {
        try {
            $query = Notification::where('id', $notificationId)
                ->where('status', 'scheduled');

            if ($organizationId) {
                $query->where('organization_id', $organizationId);
            }

            $notification = $query->first();

            if (!$notification) {
                return false;
            }

            // Validate new scheduled time
            $newScheduledAtUtc = $newScheduledAt->setTimezone('UTC');
            if ($newScheduledAtUtc->isPast()) {
                throw new \InvalidArgumentException('Cannot reschedule notification in the past');
            }

            $notification->update([
                'scheduled_at' => $newScheduledAtUtc,
                'updated_at' => now()
            ]);

            Log::info('Notification rescheduled', [
                'notification_id' => $notificationId,
                'organization_id' => $notification->organization_id,
                'new_scheduled_at' => $newScheduledAtUtc->toISOString()
            ]);

            return true;

        } catch (\Exception $e) {
            Log::error('Failed to reschedule notification', [
                'notification_id' => $notificationId,
                'organization_id' => $organizationId,
                'new_scheduled_at' => $newScheduledAt->toISOString(),
                'error' => $e->getMessage()
            ]);

            return false;
        }
    }

    /**
     * Get scheduled notifications for organization
     */
    public function getScheduledNotifications(int $organizationId, array $params = []): array
    {
        $cacheKey = "scheduled_notifications_org_{$organizationId}_" . md5(serialize($params));

        return Cache::remember($cacheKey, 300, function () use ($organizationId, $params) {
            $query = Notification::where('organization_id', $organizationId)
                ->where('status', 'scheduled')
                ->orderBy('scheduled_at', 'asc');

            // Apply filters
            if (isset($params['type'])) {
                $query->where('type', $params['type']);
            }

            if (isset($params['date_from'])) {
                $query->where('scheduled_at', '>=', $params['date_from']);
            }

            if (isset($params['date_to'])) {
                $query->where('scheduled_at', '<=', $params['date_to']);
            }

            $limit = min($params['limit'] ?? 50, 100);
            $offset = $params['offset'] ?? 0;

            $notifications = $query->offset($offset)->limit($limit)->get();
            $total = $query->count();

            return [
                'notifications' => $notifications->map(function ($notification) {
                    return [
                        'id' => $notification->id,
                        'type' => $notification->type,
                        'title' => $notification->title,
                        'message' => $notification->message,
                        'data' => $notification->data,
                        'scheduled_at' => $notification->scheduled_at->toISOString(),
                        'timezone' => $notification->timezone,
                        'created_at' => $notification->created_at->toISOString(),
                        'time_until_send' => $notification->scheduled_at->diffForHumans(),
                        'is_overdue' => $notification->scheduled_at->isPast()
                    ];
                }),
                'total' => $total,
                'has_more' => ($offset + $limit) < $total
            ];
        });
    }

    /**
     * Get scheduling statistics
     */
    public function getSchedulingStatistics(int $organizationId = null): array
    {
        $cacheKey = $organizationId
            ? "scheduling_stats_org_{$organizationId}"
            : "scheduling_stats_platform";

        return Cache::remember($cacheKey, 600, function () use ($organizationId) {
            $query = Notification::query();

            if ($organizationId) {
                $query->where('organization_id', $organizationId);
            }

            $stats = [
                'scheduled_count' => $query->where('status', 'scheduled')->count(),
                'overdue_count' => $query->where('status', 'scheduled')
                    ->where('scheduled_at', '<', now())->count(),
                'cancelled_count' => $query->where('status', 'cancelled')->count(),
                'processed_today' => $query->whereDate('sent_at', today())
                    ->whereNotNull('scheduled_at')->count(),
                'upcoming_24h' => $query->where('status', 'scheduled')
                    ->whereBetween('scheduled_at', [now(), now()->addDay()])->count(),
                'upcoming_week' => $query->where('status', 'scheduled')
                    ->whereBetween('scheduled_at', [now(), now()->addWeek()])->count()
            ];

            return $stats;
        });
    }

    /**
     * Bulk schedule notifications
     */
    public function bulkScheduleNotifications(array $notifications): array
    {
        $results = [];
        $successCount = 0;
        $failureCount = 0;

        DB::beginTransaction();

        try {
            foreach ($notifications as $notificationData) {
                try {
                    $result = $this->scheduleNotification(
                        $notificationData['organization_id'],
                        $notificationData['type'],
                        $notificationData['data'],
                        Carbon::parse($notificationData['scheduled_at']),
                        $notificationData['timezone'] ?? 'UTC'
                    );

                    $results[] = $result;

                    if ($result['success']) {
                        $successCount++;
                    } else {
                        $failureCount++;
                    }
                } catch (\Exception $e) {
                    $results[] = [
                        'success' => false,
                        'message' => 'Failed to schedule: ' . $e->getMessage()
                    ];
                    $failureCount++;
                }
            }

            DB::commit();

            Log::info('Bulk scheduling completed', [
                'total' => count($notifications),
                'success' => $successCount,
                'failure' => $failureCount
            ]);

        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Bulk scheduling failed', [
                'error' => $e->getMessage()
            ]);

            throw $e;
        }

        return [
            'total' => count($notifications),
            'success' => $successCount,
            'failure' => $failureCount,
            'results' => $results
        ];
    }

    /**
     * Clear scheduling cache
     */
    public function clearSchedulingCache(int $organizationId = null): void
    {
        if ($organizationId) {
            Cache::forget("scheduled_notifications_org_{$organizationId}_*");
            Cache::forget("scheduling_stats_org_{$organizationId}");
        } else {
            Cache::forget("scheduling_stats_platform");
        }

        Log::info('Scheduling cache cleared', [
            'organization_id' => $organizationId
        ]);
    }
}
