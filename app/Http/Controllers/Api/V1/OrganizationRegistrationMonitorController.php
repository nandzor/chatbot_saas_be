<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\BaseApiController;
use App\Services\OrganizationRegistrationMonitor;
use App\Services\OrganizationRegistrationLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Carbon\Carbon;

class OrganizationRegistrationMonitorController extends BaseApiController
{
    protected OrganizationRegistrationMonitor $monitor;
    protected OrganizationRegistrationLogger $logger;

    public function __construct(
        OrganizationRegistrationMonitor $monitor,
        OrganizationRegistrationLogger $logger
    ) {
        $this->monitor = $monitor;
        $this->logger = $logger;
    }

    /**
     * Get organization registration health status.
     */
    public function getHealthStatus(): JsonResponse
    {
        try {
            $health = $this->monitor->monitorRegistrationHealth();

            return $this->successResponse(
                'Health status retrieved successfully',
                $health,
                200
            );
        } catch (\Exception $e) {
            return $this->errorResponseWithDebug(
                'Failed to retrieve health status',
                500,
                ['error' => 'An unexpected error occurred'],
                $e
            );
        }
    }

    /**
     * Get organization registration dashboard data.
     */
    public function getDashboardData(): JsonResponse
    {
        try {
            $dashboardData = $this->monitor->getDashboardData();

            return $this->successResponse(
                'Dashboard data retrieved successfully',
                $dashboardData,
                200
            );
        } catch (\Exception $e) {
            return $this->errorResponseWithDebug(
                'Failed to retrieve dashboard data',
                500,
                ['error' => 'An unexpected error occurred'],
                $e
            );
        }
    }

    /**
     * Get registration statistics.
     */
    public function getRegistrationStatistics(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'start_date' => 'sometimes|date',
                'end_date' => 'sometimes|date|after_or_equal:start_date',
            ]);

            $startDate = $request->input('start_date') 
                ? Carbon::parse($request->input('start_date'))
                : now()->subDays(30);
            
            $endDate = $request->input('end_date')
                ? Carbon::parse($request->input('end_date'))
                : now();

            $statistics = $this->logger->getRegistrationStatistics($startDate, $endDate);

            return $this->successResponse(
                'Registration statistics retrieved successfully',
                $statistics,
                200
            );
        } catch (\Exception $e) {
            return $this->errorResponseWithDebug(
                'Failed to retrieve registration statistics',
                500,
                ['error' => 'An unexpected error occurred'],
                $e
            );
        }
    }

    /**
     * Get performance metrics.
     */
    public function getPerformanceMetrics(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'start_date' => 'sometimes|date',
                'end_date' => 'sometimes|date|after_or_equal:start_date',
            ]);

            $startDate = $request->input('start_date')
                ? Carbon::parse($request->input('start_date'))
                : now()->subDays(7);
            
            $endDate = $request->input('end_date')
                ? Carbon::parse($request->input('end_date'))
                : now();

            $metrics = $this->logger->getPerformanceMetrics($startDate, $endDate);

            return $this->successResponse(
                'Performance metrics retrieved successfully',
                $metrics,
                200
            );
        } catch (\Exception $e) {
            return $this->errorResponseWithDebug(
                'Failed to retrieve performance metrics',
                500,
                ['error' => 'An unexpected error occurred'],
                $e
            );
        }
    }

    /**
     * Get recent security events.
     */
    public function getRecentSecurityEvents(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'limit' => 'sometimes|integer|min:1|max:100',
            ]);

            $limit = $request->input('limit', 50);
            $events = $this->logger->getRecentSecurityEvents($limit);

            return $this->successResponse(
                'Recent security events retrieved successfully',
                $events,
                200
            );
        } catch (\Exception $e) {
            return $this->errorResponseWithDebug(
                'Failed to retrieve recent security events',
                500,
                ['error' => 'An unexpected error occurred'],
                $e
            );
        }
    }

    /**
     * Clean up expired data.
     */
    public function cleanupExpiredData(): JsonResponse
    {
        try {
            $results = $this->monitor->cleanupExpiredData();

            return $this->successResponse(
                'Expired data cleanup completed successfully',
                $results,
                200
            );
        } catch (\Exception $e) {
            return $this->errorResponseWithDebug(
                'Failed to cleanup expired data',
                500,
                ['error' => 'An unexpected error occurred'],
                $e
            );
        }
    }

    /**
     * Get system alerts.
     */
    public function getSystemAlerts(): JsonResponse
    {
        try {
            $health = $this->monitor->monitorRegistrationHealth();
            $alerts = $health['alerts'] ?? [];

            return $this->successResponse(
                'System alerts retrieved successfully',
                [
                    'alerts' => $alerts,
                    'total_alerts' => count($alerts),
                    'critical_alerts' => count(array_filter($alerts, fn($alert) => $alert['severity'] === 'critical')),
                    'warning_alerts' => count(array_filter($alerts, fn($alert) => $alert['severity'] === 'warning')),
                ],
                200
            );
        } catch (\Exception $e) {
            return $this->errorResponseWithDebug(
                'Failed to retrieve system alerts',
                500,
                ['error' => 'An unexpected error occurred'],
                $e
            );
        }
    }

    /**
     * Get registration trends.
     */
    public function getRegistrationTrends(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'period' => 'sometimes|string|in:hourly,daily,weekly,monthly',
                'days' => 'sometimes|integer|min:1|max:365',
            ]);

            $period = $request->input('period', 'daily');
            $days = $request->input('days', 30);
            $startDate = now()->subDays($days);

            $trends = $this->getTrendsData($startDate, $period);

            return $this->successResponse(
                'Registration trends retrieved successfully',
                $trends,
                200
            );
        } catch (\Exception $e) {
            return $this->errorResponseWithDebug(
                'Failed to retrieve registration trends',
                500,
                ['error' => 'An unexpected error occurred'],
                $e
            );
        }
    }

    /**
     * Get trends data.
     */
    private function getTrendsData(Carbon $startDate, string $period): array
    {
        // This would typically query the database for trends
        // For now, return placeholder data
        return [
            'period' => $period,
            'start_date' => $startDate->toISOString(),
            'end_date' => now()->toISOString(),
            'data' => [
                'registrations' => [],
                'verifications' => [],
                'approvals' => [],
            ],
        ];
    }
}
