<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\BaseApiController;
use App\Services\OrganizationRegistrationOptimizer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrganizationRegistrationOptimizerController extends BaseApiController
{
    protected OrganizationRegistrationOptimizer $optimizer;

    public function __construct(OrganizationRegistrationOptimizer $optimizer)
    {
        $this->optimizer = $optimizer;
    }

    /**
     * Optimize database queries and performance.
     */
    public function optimizeDatabase(): JsonResponse
    {
        try {
            $results = $this->optimizer->optimizeDatabaseQueries();

            return $this->successResponse(
                'Database optimization completed successfully',
                $results,
                200
            );
        } catch (\Exception $e) {
            return $this->errorResponseWithDebug(
                'Failed to optimize database',
                500,
                ['error' => 'An unexpected error occurred'],
                $e
            );
        }
    }

    /**
     * Get database performance metrics.
     */
    public function getPerformanceMetrics(): JsonResponse
    {
        try {
            $metrics = $this->optimizer->getDatabasePerformanceMetrics();

            return $this->successResponse(
                'Database performance metrics retrieved successfully',
                $metrics,
                200
            );
        } catch (\Exception $e) {
            return $this->errorResponseWithDebug(
                'Failed to retrieve database performance metrics',
                500,
                ['error' => 'An unexpected error occurred'],
                $e
            );
        }
    }

    /**
     * Run database maintenance.
     */
    public function runMaintenance(): JsonResponse
    {
        try {
            $results = $this->optimizer->runDatabaseMaintenance();

            return $this->successResponse(
                'Database maintenance completed successfully',
                $results,
                200
            );
        } catch (\Exception $e) {
            return $this->errorResponseWithDebug(
                'Failed to run database maintenance',
                500,
                ['error' => 'An unexpected error occurred'],
                $e
            );
        }
    }

    /**
     * Get database health status.
     */
    public function getDatabaseHealth(): JsonResponse
    {
        try {
            $metrics = $this->optimizer->getDatabasePerformanceMetrics();
            
            // Determine health status based on metrics
            $health = $this->determineDatabaseHealth($metrics);

            return $this->successResponse(
                'Database health status retrieved successfully',
                [
                    'health' => $health,
                    'metrics' => $metrics,
                ],
                200
            );
        } catch (\Exception $e) {
            return $this->errorResponseWithDebug(
                'Failed to retrieve database health status',
                500,
                ['error' => 'An unexpected error occurred'],
                $e
            );
        }
    }

    /**
     * Determine database health status.
     */
    private function determineDatabaseHealth(array $metrics): array
    {
        $health = [
            'status' => 'healthy',
            'checks' => [],
            'recommendations' => [],
        ];

        try {
            // Check table sizes
            if (isset($metrics['table_sizes'])) {
                $health['checks']['table_sizes'] = $this->checkTableSizes($metrics['table_sizes']);
            }

            // Check index usage
            if (isset($metrics['index_usage'])) {
                $health['checks']['index_usage'] = $this->checkIndexUsage($metrics['index_usage']);
            }

            // Check connection stats
            if (isset($metrics['connection_stats'])) {
                $health['checks']['connection_stats'] = $this->checkConnectionStats($metrics['connection_stats']);
            }

            // Determine overall status
            $health['status'] = $this->determineOverallHealthStatus($health['checks']);

        } catch (\Exception $e) {
            $health['status'] = 'error';
            $health['error'] = $e->getMessage();
        }

        return $health;
    }

    /**
     * Check table sizes.
     */
    private function checkTableSizes(array $tableSizes): array
    {
        $check = [
            'status' => 'healthy',
            'message' => 'Table sizes are within normal range',
            'details' => $tableSizes,
        ];

        foreach ($tableSizes as $table => $size) {
            if (isset($size['size_bytes']) && $size['size_bytes'] > 100 * 1024 * 1024) { // 100MB
                $check['status'] = 'warning';
                $check['message'] = 'Some tables are larger than recommended';
                $check['recommendations'][] = "Consider archiving old data from {$table} table";
            }
        }

        return $check;
    }

    /**
     * Check index usage.
     */
    private function checkIndexUsage(array $indexUsage): array
    {
        $check = [
            'status' => 'healthy',
            'message' => 'Index usage is optimal',
            'details' => $indexUsage,
        ];

        $unusedIndexes = array_filter($indexUsage, function ($index) {
            return $index['scans'] === 0;
        });

        if (!empty($unusedIndexes)) {
            $check['status'] = 'warning';
            $check['message'] = 'Some indexes are not being used';
            $check['recommendations'][] = 'Consider removing unused indexes to improve write performance';
        }

        return $check;
    }

    /**
     * Check connection statistics.
     */
    private function checkConnectionStats(array $connectionStats): array
    {
        $check = [
            'status' => 'healthy',
            'message' => 'Connection statistics are normal',
            'details' => $connectionStats,
        ];

        if (isset($connectionStats['total_connections']) && $connectionStats['total_connections'] > 50) {
            $check['status'] = 'warning';
            $check['message'] = 'High number of database connections';
            $check['recommendations'][] = 'Consider optimizing connection pooling';
        }

        return $check;
    }

    /**
     * Determine overall health status.
     */
    private function determineOverallHealthStatus(array $checks): string
    {
        $statuses = array_column($checks, 'status');
        
        if (in_array('error', $statuses)) {
            return 'error';
        }
        
        if (in_array('warning', $statuses)) {
            return 'warning';
        }
        
        return 'healthy';
    }
}
