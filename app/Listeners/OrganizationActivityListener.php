<?php

namespace App\Listeners;

use App\Events\OrganizationActivityEvent;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class OrganizationActivityListener implements ShouldQueue
{
    use InteractsWithQueue;

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
    public function handle(OrganizationActivityEvent $event): void
    {
        try {
            // Log the activity to database
            $this->logActivityToDatabase($event);

            // Log the activity to application logs
            $this->logActivityToLogs($event);

            // Update organization analytics
            $this->updateOrganizationAnalytics($event);

        } catch (\Exception $e) {
            Log::channel('organization')->error('Failed to process organization activity', [
                'error' => $e->getMessage(),
                'event_data' => $event->activityData,
                'organization_id' => $event->organizationId
            ]);
        }
    }

    /**
     * Log activity to database
     */
    private function logActivityToDatabase(OrganizationActivityEvent $event): void
    {
        DB::table('user_activities')->insert([
            'user_id' => $event->userId,
            'organization_id' => $event->organizationId,
            'activity_type' => $event->activityType,
            'activity_data' => json_encode($event->activityData),
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'created_at' => now(),
            'updated_at' => now()
        ]);
    }

    /**
     * Log activity to application logs
     */
    private function logActivityToLogs(OrganizationActivityEvent $event): void
    {
        Log::channel('organization')->info('Organization activity recorded', [
            'organization_id' => $event->organizationId,
            'activity_type' => $event->activityType,
            'user_id' => $event->userId,
            'activity_data' => $event->activityData,
            'timestamp' => $event->timestamp,
            'ip_address' => request()->ip()
        ]);
    }

    /**
     * Update organization analytics
     */
    private function updateOrganizationAnalytics(OrganizationActivityEvent $event): void
    {
        $today = now()->format('Y-m-d');

        // Get or create today's analytics record
        $analytics = DB::table('organization_analytics')
            ->where('organization_id', $event->organizationId)
            ->where('date', $today)
            ->first();

        if (!$analytics) {
            // Create new analytics record for today
            DB::table('organization_analytics')->insert([
                'organization_id' => $event->organizationId,
                'date' => $today,
                'total_activities' => 1,
                'unique_users' => $event->userId ? 1 : 0,
                'created_at' => now(),
                'updated_at' => now()
            ]);
        } else {
            // Update existing analytics record
            $updateData = [
                'total_activities' => $analytics->total_activities + 1,
                'updated_at' => now()
            ];

            // Update unique users count if user is provided
            if ($event->userId) {
                $userActivity = DB::table('user_activities')
                    ->where('organization_id', $event->organizationId)
                    ->where('date', $today)
                    ->where('user_id', $event->userId)
                    ->first();

                if (!$userActivity) {
                    $updateData['unique_users'] = $analytics->unique_users + 1;
                }
            }

            DB::table('organization_analytics')
                ->where('id', $analytics->id)
                ->update($updateData);
        }
    }
}
