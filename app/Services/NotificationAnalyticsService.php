<?php

namespace App\Services;

use App\Models\Notification;
use App\Models\Organization;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class NotificationAnalyticsService
{
    /**
     * Get notification analytics for organization
     */
    public function getOrganizationAnalytics(int $organizationId, array $params = []): array
    {
        $cacheKey = "notification_analytics_org_{$organizationId}_" . md5(serialize($params));

        return Cache::remember($cacheKey, 300, function () use ($organizationId, $params) {
            return $this->buildOrganizationAnalytics($organizationId, $params);
        });
    }

    /**
     * Get platform-wide notification analytics
     */
    public function getPlatformAnalytics(array $params = []): array
    {
        $cacheKey = "notification_analytics_platform_" . md5(serialize($params));

        return Cache::remember($cacheKey, 300, function () use ($params) {
            return $this->buildPlatformAnalytics($params);
        });
    }

    /**
     * Build organization analytics
     */
    private function buildOrganizationAnalytics(int $organizationId, array $params): array
    {
        $dateFrom = $params['date_from'] ?? now()->subDays(30);
        $dateTo = $params['date_to'] ?? now();
        $groupBy = $params['group_by'] ?? 'day';

        $query = Notification::where('organization_id', $organizationId)
            ->whereBetween('created_at', [$dateFrom, $dateTo]);

        // Total notifications
        $totalNotifications = $query->count();

        // Notifications by status
        $statusBreakdown = $query->selectRaw('
            status,
            COUNT(*) as count,
            ROUND(COUNT(*) * 100.0 / ?, 2) as percentage
        ', [$totalNotifications])
            ->groupBy('status')
            ->get()
            ->keyBy('status');

        // Notifications by type
        $typeBreakdown = $query->selectRaw('
            type,
            COUNT(*) as count,
            ROUND(COUNT(*) * 100.0 / ?, 2) as percentage
        ', [$totalNotifications])
            ->groupBy('type')
            ->orderBy('count', 'desc')
            ->get();

        // Notifications by channel
        $channelStats = $this->getChannelStats($organizationId, $dateFrom, $dateTo);

        // Time series data
        $timeSeries = $this->getTimeSeriesData($organizationId, $dateFrom, $dateTo, $groupBy);

        // Delivery rates
        $deliveryRates = $this->getDeliveryRates($organizationId, $dateFrom, $dateTo);

        // Recent activity
        $recentActivity = $query->with('organization')
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        return [
            'summary' => [
                'total_notifications' => $totalNotifications,
                'date_range' => [
                    'from' => $dateFrom,
                    'to' => $dateTo
                ],
                'group_by' => $groupBy
            ],
            'status_breakdown' => $statusBreakdown,
            'type_breakdown' => $typeBreakdown,
            'channel_stats' => $channelStats,
            'time_series' => $timeSeries,
            'delivery_rates' => $deliveryRates,
            'recent_activity' => $recentActivity,
            'performance_metrics' => $this->getPerformanceMetrics($organizationId, $dateFrom, $dateTo)
        ];
    }

    /**
     * Build platform analytics
     */
    private function buildPlatformAnalytics(array $params): array
    {
        $dateFrom = $params['date_from'] ?? now()->subDays(30);
        $dateTo = $params['date_to'] ?? now();
        $groupBy = $params['group_by'] ?? 'day';

        $query = Notification::whereBetween('created_at', [$dateFrom, $dateTo]);

        // Total notifications
        $totalNotifications = $query->count();

        // Notifications by organization
        $organizationBreakdown = $query->join('organizations', 'notifications.organization_id', '=', 'organizations.id')
            ->selectRaw('
                organizations.id,
                organizations.name,
                organizations.code,
                COUNT(*) as notification_count,
                ROUND(COUNT(*) * 100.0 / ?, 2) as percentage
            ', [$totalNotifications])
            ->groupBy('organizations.id', 'organizations.name', 'organizations.code')
            ->orderBy('notification_count', 'desc')
            ->limit(20)
            ->get();

        // Global channel stats
        $globalChannelStats = $this->getGlobalChannelStats($dateFrom, $dateTo);

        // Global time series
        $globalTimeSeries = $this->getGlobalTimeSeriesData($dateFrom, $dateTo, $groupBy);

        // Top notification types
        $topTypes = $query->selectRaw('
            type,
            COUNT(*) as count,
            ROUND(COUNT(*) * 100.0 / ?, 2) as percentage
        ', [$totalNotifications])
            ->groupBy('type')
            ->orderBy('count', 'desc')
            ->limit(10)
            ->get();

        return [
            'summary' => [
                'total_notifications' => $totalNotifications,
                'total_organizations' => Organization::count(),
                'date_range' => [
                    'from' => $dateFrom,
                    'to' => $dateTo
                ],
                'group_by' => $groupBy
            ],
            'organization_breakdown' => $organizationBreakdown,
            'channel_stats' => $globalChannelStats,
            'time_series' => $globalTimeSeries,
            'top_types' => $topTypes,
            'performance_metrics' => $this->getGlobalPerformanceMetrics($dateFrom, $dateTo)
        ];
    }

    /**
     * Get channel statistics
     */
    private function getChannelStats(int $organizationId, $dateFrom, $dateTo): array
    {
        $query = Notification::where('organization_id', $organizationId)
            ->whereBetween('created_at', [$dateFrom, $dateTo]);

        $channels = ['email', 'webhook', 'in_app', 'sms', 'push'];
        $stats = [];

        foreach ($channels as $channel) {
            $sentCount = $query->whereNotNull("{$channel}_sent_at")->count();
            $failedCount = $query->where("{$channel}_status", 'failed')->count();
            $totalAttempts = $sentCount + $failedCount;

            $stats[$channel] = [
                'sent' => $sentCount,
                'failed' => $failedCount,
                'total_attempts' => $totalAttempts,
                'success_rate' => $totalAttempts > 0 ? round(($sentCount / $totalAttempts) * 100, 2) : 0,
                'failure_rate' => $totalAttempts > 0 ? round(($failedCount / $totalAttempts) * 100, 2) : 0
            ];
        }

        return $stats;
    }

    /**
     * Get global channel statistics
     */
    private function getGlobalChannelStats($dateFrom, $dateTo): array
    {
        $query = Notification::whereBetween('created_at', [$dateFrom, $dateTo]);

        $channels = ['email', 'webhook', 'in_app', 'sms', 'push'];
        $stats = [];

        foreach ($channels as $channel) {
            $sentCount = $query->whereNotNull("{$channel}_sent_at")->count();
            $failedCount = $query->where("{$channel}_status", 'failed')->count();
            $totalAttempts = $sentCount + $failedCount;

            $stats[$channel] = [
                'sent' => $sentCount,
                'failed' => $failedCount,
                'total_attempts' => $totalAttempts,
                'success_rate' => $totalAttempts > 0 ? round(($sentCount / $totalAttempts) * 100, 2) : 0,
                'failure_rate' => $totalAttempts > 0 ? round(($failedCount / $totalAttempts) * 100, 2) : 0
            ];
        }

        return $stats;
    }

    /**
     * Get time series data
     */
    private function getTimeSeriesData(int $organizationId, $dateFrom, $dateTo, string $groupBy): array
    {
        $dateFormat = match ($groupBy) {
            'hour' => '%Y-%m-%d %H:00:00',
            'day' => '%Y-%m-%d',
            'week' => '%Y-%u',
            'month' => '%Y-%m',
            default => '%Y-%m-%d'
        };

        return Notification::where('organization_id', $organizationId)
            ->whereBetween('created_at', [$dateFrom, $dateTo])
            ->selectRaw("
                DATE_FORMAT(created_at, '{$dateFormat}') as period,
                COUNT(*) as total,
                SUM(CASE WHEN status = 'sent' THEN 1 ELSE 0 END) as sent,
                SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed,
                SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending
            ")
            ->groupBy('period')
            ->orderBy('period')
            ->get();
    }

    /**
     * Get global time series data
     */
    private function getGlobalTimeSeriesData($dateFrom, $dateTo, string $groupBy): array
    {
        $dateFormat = match ($groupBy) {
            'hour' => '%Y-%m-%d %H:00:00',
            'day' => '%Y-%m-%d',
            'week' => '%Y-%u',
            'month' => '%Y-%m',
            default => '%Y-%m-%d'
        };

        return Notification::whereBetween('created_at', [$dateFrom, $dateTo])
            ->selectRaw("
                DATE_FORMAT(created_at, '{$dateFormat}') as period,
                COUNT(*) as total,
                SUM(CASE WHEN status = 'sent' THEN 1 ELSE 0 END) as sent,
                SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed,
                SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending
            ")
            ->groupBy('period')
            ->orderBy('period')
            ->get();
    }

    /**
     * Get delivery rates
     */
    private function getDeliveryRates(int $organizationId, $dateFrom, $dateTo): array
    {
        $query = Notification::where('organization_id', $organizationId)
            ->whereBetween('created_at', [$dateFrom, $dateTo]);

        $total = $query->count();

        if ($total === 0) {
            return [
                'overall_success_rate' => 0,
                'overall_failure_rate' => 0,
                'average_delivery_time' => 0,
                'channel_breakdown' => []
            ];
        }

        $sent = $query->where('status', 'sent')->count();
        $failed = $query->where('status', 'failed')->count();

        // Calculate average delivery time
        $avgDeliveryTime = $query->whereNotNull('sent_at')
            ->selectRaw('AVG(TIMESTAMPDIFF(SECOND, created_at, sent_at)) as avg_delivery_time')
            ->value('avg_delivery_time') ?? 0;

        return [
            'overall_success_rate' => round(($sent / $total) * 100, 2),
            'overall_failure_rate' => round(($failed / $total) * 100, 2),
            'average_delivery_time' => round($avgDeliveryTime, 2),
            'total_notifications' => $total,
            'successful_deliveries' => $sent,
            'failed_deliveries' => $failed
        ];
    }

    /**
     * Get performance metrics
     */
    private function getPerformanceMetrics(int $organizationId, $dateFrom, $dateTo): array
    {
        $query = Notification::where('organization_id', $organizationId)
            ->whereBetween('created_at', [$dateFrom, $dateTo]);

        // Peak hours analysis
        $peakHours = $query->selectRaw('
            HOUR(created_at) as hour,
            COUNT(*) as count
        ')
            ->groupBy('hour')
            ->orderBy('count', 'desc')
            ->limit(5)
            ->get();

        // Most active days
        $activeDays = $query->selectRaw('
            DAYNAME(created_at) as day_name,
            COUNT(*) as count
        ')
            ->groupBy('day_name')
            ->orderBy('count', 'desc')
            ->get();

        // Error analysis
        $errorAnalysis = $query->where('status', 'failed')
            ->selectRaw('
                error_message,
                COUNT(*) as count
            ')
            ->whereNotNull('error_message')
            ->groupBy('error_message')
            ->orderBy('count', 'desc')
            ->limit(10)
            ->get();

        return [
            'peak_hours' => $peakHours,
            'active_days' => $activeDays,
            'error_analysis' => $errorAnalysis,
            'total_errors' => $query->where('status', 'failed')->count()
        ];
    }

    /**
     * Get global performance metrics
     */
    private function getGlobalPerformanceMetrics($dateFrom, $dateTo): array
    {
        $query = Notification::whereBetween('created_at', [$dateFrom, $dateTo]);

        // Top organizations by notification volume
        $topOrganizations = $query->join('organizations', 'notifications.organization_id', '=', 'organizations.id')
            ->selectRaw('
                organizations.id,
                organizations.name,
                COUNT(*) as notification_count
            ')
            ->groupBy('organizations.id', 'organizations.name')
            ->orderBy('notification_count', 'desc')
            ->limit(10)
            ->get();

        // System health metrics
        $systemHealth = [
            'total_notifications' => $query->count(),
            'successful_deliveries' => $query->where('status', 'sent')->count(),
            'failed_deliveries' => $query->where('status', 'failed')->count(),
            'pending_deliveries' => $query->where('status', 'pending')->count(),
            'average_delivery_time' => $query->whereNotNull('sent_at')
                ->selectRaw('AVG(TIMESTAMPDIFF(SECOND, created_at, sent_at)) as avg_delivery_time')
                ->value('avg_delivery_time') ?? 0
        ];

        return [
            'top_organizations' => $topOrganizations,
            'system_health' => $systemHealth
        ];
    }

    /**
     * Clear analytics cache
     */
    public function clearAnalyticsCache(int $organizationId = null): void
    {
        if ($organizationId) {
            Cache::forget("notification_analytics_org_{$organizationId}_*");
        } else {
            Cache::forget("notification_analytics_platform_*");
        }

        Log::info('Notification analytics cache cleared', [
            'organization_id' => $organizationId
        ]);
    }
}
