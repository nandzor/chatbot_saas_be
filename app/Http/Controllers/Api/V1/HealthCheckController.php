<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\BaseApiController;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redis;
use Illuminate\Support\Facades\Storage;

class HealthCheckController extends BaseApiController
{
    /**
     * Basic health check endpoint.
     */
    public function basic(): JsonResponse
    {
        return $this->successResponse(
            'Application is healthy',
            [
                'status' => 'healthy',
                'timestamp' => now()->toISOString(),
                'version' => config('app.version', '1.0.0'),
                'environment' => config('app.env'),
            ]
        );
    }

    /**
     * Detailed health check with system components.
     */
    public function detailed(): JsonResponse
    {
        $checks = [
            'database' => $this->checkDatabase(),
            'cache' => $this->checkCache(),
            'redis' => $this->checkRedis(),
            'storage' => $this->checkStorage(),
            'queue' => $this->checkQueue(),
            'payment_gateways' => $this->checkPaymentGateways(),
        ];

        $overallStatus = $this->determineOverallStatus($checks);

        return $this->successResponse(
            'Detailed health check completed',
            [
                'status' => $overallStatus,
                'timestamp' => now()->toISOString(),
                'version' => config('app.version', '1.0.0'),
                'environment' => config('app.env'),
                'checks' => $checks,
            ]
        );
    }

    /**
     * Database health check.
     */
    protected function checkDatabase(): array
    {
        try {
            $startTime = microtime(true);
            DB::connection()->getPdo();
            $responseTime = round((microtime(true) - $startTime) * 1000, 2);

            // Check if we can perform a simple query
            $result = DB::select('SELECT 1 as test');

            return [
                'status' => 'healthy',
                'response_time_ms' => $responseTime,
                'connection' => 'active',
                'query_test' => 'passed',
            ];
        } catch (\Exception $e) {
            return [
                'status' => 'unhealthy',
                'error' => $e->getMessage(),
                'connection' => 'failed',
            ];
        }
    }

    /**
     * Cache health check.
     */
    protected function checkCache(): array
    {
        try {
            $startTime = microtime(true);
            $testKey = 'health_check_' . uniqid();
            $testValue = 'test_value_' . time();

            // Test cache write
            Cache::put($testKey, $testValue, 60);

            // Test cache read
            $retrievedValue = Cache::get($testKey);

            // Test cache delete
            Cache::forget($testKey);

            $responseTime = round((microtime(true) - $startTime) * 1000, 2);

            return [
                'status' => 'healthy',
                'response_time_ms' => $responseTime,
                'write_test' => 'passed',
                'read_test' => $retrievedValue === $testValue ? 'passed' : 'failed',
                'delete_test' => 'passed',
                'driver' => config('cache.default'),
            ];
        } catch (\Exception $e) {
            return [
                'status' => 'unhealthy',
                'error' => $e->getMessage(),
                'driver' => config('cache.default'),
            ];
        }
    }

    /**
     * Redis health check.
     */
    protected function checkRedis(): array
    {
        try {
            $startTime = microtime(true);

            // Test Redis connection
            Redis::ping();

            // Test Redis operations
            $testKey = 'health_check_redis_' . uniqid();
            $testValue = 'test_value_' . time();

            Redis::set($testKey, $testValue, 'EX', 60);
            $retrievedValue = Redis::get($testKey);
            Redis::del($testKey);

            $responseTime = round((microtime(true) - $startTime) * 1000, 2);

            return [
                'status' => 'healthy',
                'response_time_ms' => $responseTime,
                'ping_test' => 'passed',
                'write_test' => 'passed',
                'read_test' => $retrievedValue === $testValue ? 'passed' : 'failed',
                'delete_test' => 'passed',
            ];
        } catch (\Exception $e) {
            return [
                'status' => 'unhealthy',
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Storage health check.
     */
    protected function checkStorage(): array
    {
        try {
            $startTime = microtime(true);
            $testFileName = 'health_check_' . uniqid() . '.txt';
            $testContent = 'Health check test content - ' . time();

            // Test file write
            Storage::put($testFileName, $testContent);

            // Test file read
            $retrievedContent = Storage::get($testFileName);

            // Test file exists
            $fileExists = Storage::exists($testFileName);

            // Test file delete
            Storage::delete($testFileName);

            $responseTime = round((microtime(true) - $startTime) * 1000, 2);

            return [
                'status' => 'healthy',
                'response_time_ms' => $responseTime,
                'write_test' => 'passed',
                'read_test' => $retrievedContent === $testContent ? 'passed' : 'failed',
                'exists_test' => $fileExists ? 'passed' : 'failed',
                'delete_test' => 'passed',
                'driver' => config('filesystems.default'),
            ];
        } catch (\Exception $e) {
            return [
                'status' => 'unhealthy',
                'error' => $e->getMessage(),
                'driver' => config('filesystems.default'),
            ];
        }
    }

    /**
     * Queue health check.
     */
    protected function checkQueue(): array
    {
        try {
            $startTime = microtime(true);

            // Test queue connection
            $queue = app('queue');
            $connection = $queue->connection();

            $responseTime = round((microtime(true) - $startTime) * 1000, 2);

            return [
                'status' => 'healthy',
                'response_time_ms' => $responseTime,
                'connection_test' => 'passed',
                'driver' => config('queue.default'),
            ];
        } catch (\Exception $e) {
            return [
                'status' => 'unhealthy',
                'error' => $e->getMessage(),
                'driver' => config('queue.default'),
            ];
        }
    }

    /**
     * Payment gateways health check.
     */
    protected function checkPaymentGateways(): array
    {
        $gateways = config('payment.supported_gateways', []);
        $results = [];

        foreach ($gateways as $gateway) {
            try {
                $config = config("payment.{$gateway}");

                if (!$config) {
                    $results[$gateway] = [
                        'status' => 'unhealthy',
                        'error' => 'Configuration not found',
                    ];
                    continue;
                }

                // Check if required configuration keys exist
                $requiredKeys = $this->getRequiredConfigKeys($gateway);
                $missingKeys = [];

                foreach ($requiredKeys as $key) {
                    if (empty($config[$key])) {
                        $missingKeys[] = $key;
                    }
                }

                if (!empty($missingKeys)) {
                    $results[$gateway] = [
                        'status' => 'unhealthy',
                        'error' => 'Missing configuration: ' . implode(', ', $missingKeys),
                    ];
                } else {
                    $results[$gateway] = [
                        'status' => 'healthy',
                        'configuration' => 'complete',
                    ];
                }
            } catch (\Exception $e) {
                $results[$gateway] = [
                    'status' => 'unhealthy',
                    'error' => $e->getMessage(),
                ];
            }
        }

        return $results;
    }

    /**
     * Get required configuration keys for a gateway.
     */
    protected function getRequiredConfigKeys(string $gateway): array
    {
        return match ($gateway) {
            'stripe' => ['secret_key', 'public_key'],
            'midtrans' => ['server_key', 'client_key'],
            'xendit' => ['secret_key', 'public_key'],
            default => [],
        };
    }

    /**
     * Determine overall system status.
     */
    protected function determineOverallStatus(array $checks): string
    {
        $criticalChecks = ['database', 'cache'];
        $hasUnhealthyCritical = false;
        $hasUnhealthy = false;

        foreach ($checks as $checkName => $checkResult) {
            if (isset($checkResult['status']) && $checkResult['status'] === 'unhealthy') {
                if (in_array($checkName, $criticalChecks)) {
                    $hasUnhealthyCritical = true;
                } else {
                    $hasUnhealthy = true;
                }
            }
        }

        if ($hasUnhealthyCritical) {
            return 'unhealthy';
        } elseif ($hasUnhealthy) {
            return 'degraded';
        } else {
            return 'healthy';
        }
    }

    /**
     * Get system metrics.
     */
    public function metrics(): JsonResponse
    {
        $metrics = [
            'system' => [
                'memory_usage' => $this->getMemoryUsage(),
                'disk_usage' => $this->getDiskUsage(),
                'uptime' => $this->getUptime(),
            ],
            'application' => [
                'version' => config('app.version', '1.0.0'),
                'environment' => config('app.env'),
                'debug_mode' => config('app.debug'),
                'timezone' => config('app.timezone'),
            ],
            'database' => [
                'connection_count' => $this->getDatabaseConnectionCount(),
                'slow_queries' => $this->getSlowQueriesCount(),
            ],
            'cache' => [
                'hit_rate' => $this->getCacheHitRate(),
                'memory_usage' => $this->getCacheMemoryUsage(),
            ],
        ];

        return $this->successResponse(
            'System metrics retrieved',
            $metrics
        );
    }

    /**
     * Get memory usage.
     */
    protected function getMemoryUsage(): array
    {
        $memoryUsage = memory_get_usage(true);
        $memoryPeak = memory_get_peak_usage(true);
        $memoryLimit = ini_get('memory_limit');

        return [
            'current' => $this->formatBytes($memoryUsage),
            'peak' => $this->formatBytes($memoryPeak),
            'limit' => $memoryLimit,
            'usage_percentage' => $this->getMemoryUsagePercentage($memoryUsage, $memoryLimit),
        ];
    }

    /**
     * Get disk usage.
     */
    protected function getDiskUsage(): array
    {
        $totalSpace = disk_total_space('/');
        $freeSpace = disk_free_space('/');
        $usedSpace = $totalSpace - $freeSpace;

        return [
            'total' => $this->formatBytes($totalSpace),
            'used' => $this->formatBytes($usedSpace),
            'free' => $this->formatBytes($freeSpace),
            'usage_percentage' => round(($usedSpace / $totalSpace) * 100, 2),
        ];
    }

    /**
     * Get system uptime.
     */
    protected function getUptime(): string
    {
        if (function_exists('sys_getloadavg')) {
            $uptime = shell_exec('uptime -p 2>/dev/null');
            return trim($uptime) ?: 'Unknown';
        }

        return 'Unknown';
    }

    /**
     * Get database connection count.
     */
    protected function getDatabaseConnectionCount(): int
    {
        try {
            $result = DB::select("SHOW STATUS LIKE 'Threads_connected'");
            return $result[0]->Value ?? 0;
        } catch (\Exception $e) {
            return 0;
        }
    }

    /**
     * Get slow queries count.
     */
    protected function getSlowQueriesCount(): int
    {
        try {
            $result = DB::select("SHOW STATUS LIKE 'Slow_queries'");
            return $result[0]->Value ?? 0;
        } catch (\Exception $e) {
            return 0;
        }
    }

    /**
     * Get cache hit rate.
     */
    protected function getCacheHitRate(): float
    {
        // This would need to be implemented based on your cache driver
        return 0.0;
    }

    /**
     * Get cache memory usage.
     */
    protected function getCacheMemoryUsage(): string
    {
        // This would need to be implemented based on your cache driver
        return '0 MB';
    }

    /**
     * Format bytes to human readable format.
     */
    protected function formatBytes(int $bytes): string
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        $bytes = max($bytes, 0);
        $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
        $pow = min($pow, count($units) - 1);

        $bytes /= pow(1024, $pow);

        return round($bytes, 2) . ' ' . $units[$pow];
    }

    /**
     * Get memory usage percentage.
     */
    protected function getMemoryUsagePercentage(int $current, string $limit): float
    {
        $limitBytes = $this->parseMemoryLimit($limit);
        if ($limitBytes <= 0) {
            return 0;
        }

        return round(($current / $limitBytes) * 100, 2);
    }

    /**
     * Parse memory limit string to bytes.
     */
    protected function parseMemoryLimit(string $limit): int
    {
        $limit = trim($limit);
        $last = strtolower($limit[strlen($limit) - 1]);
        $limit = (int) $limit;

        switch ($last) {
            case 'g':
                $limit *= 1024;
            case 'm':
                $limit *= 1024;
            case 'k':
                $limit *= 1024;
        }

        return $limit;
    }
}
