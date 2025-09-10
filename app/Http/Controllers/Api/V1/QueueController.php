<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\Redis;
use Illuminate\Support\Facades\DB;

class QueueController extends Controller
{
    /**
     * Get queue status and statistics
     */
    public function status(): JsonResponse
    {
        try {
            $status = [
                'queues' => [],
                'failed_jobs' => 0,
                'redis_connected' => false,
            ];

            // Check Redis connection
            try {
                Redis::ping();
                $status['redis_connected'] = true;
            } catch (\Exception $e) {
                $status['redis_connected'] = false;
            }

            // Get queue information
            $queues = ['default', 'high', 'low', 'emails', 'webhooks', 'billing'];

            foreach ($queues as $queueName) {
                try {
                    $size = Queue::size($queueName);
                    $status['queues'][$queueName] = [
                        'size' => $size,
                        'status' => $size > 0 ? 'pending' : 'empty',
                    ];
                } catch (\Exception $e) {
                    $status['queues'][$queueName] = [
                        'size' => 0,
                        'status' => 'error',
                        'error' => $e->getMessage(),
                    ];
                }
            }

            // Get failed jobs count
            try {
                $status['failed_jobs'] = DB::table('failed_jobs')->count();
            } catch (\Exception $e) {
                $status['failed_jobs'] = 0;
            }

            return response()->json([
                'data' => $status,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to get queue status', [
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'Failed to get queue status',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    /**
     * Get failed jobs
     */
    public function failedJobs(Request $request): JsonResponse
    {
        try {
            $query = DB::table('failed_jobs');

            // Apply filters
            if ($request->has('queue')) {
                $query->where('queue', $request->queue);
            }

            if ($request->has('connection')) {
                $query->where('connection', $request->connection);
            }

            if ($request->has('date_from')) {
                $query->where('failed_at', '>=', $request->date_from);
            }

            if ($request->has('date_to')) {
                $query->where('failed_at', '<=', $request->date_to);
            }

            // Apply sorting
            $sortBy = $request->get('sort_by', 'failed_at');
            $sortOrder = $request->get('sort_order', 'desc');
            $query->orderBy($sortBy, $sortOrder);

            // Pagination
            $perPage = $request->get('per_page', 15);
            $failedJobs = $query->paginate($perPage);

            // Decode payload for each job
            $failedJobs->getCollection()->transform(function ($job) {
                $job->payload = json_decode($job->payload, true);
                $job->exception = substr($job->exception, 0, 500) . '...'; // Truncate long exceptions
                return $job;
            });

            return response()->json([
                'data' => $failedJobs,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to fetch failed jobs', [
                'error' => $e->getMessage(),
                'filters' => $request->all(),
            ]);

            return response()->json([
                'message' => 'Failed to fetch failed jobs',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    /**
     * Retry failed job
     */
    public function retryJob(Request $request, string $id): JsonResponse
    {
        try {
            $result = Artisan::call('queue:retry', ['id' => $id]);

            if ($result === 0) {
                Log::info('Failed job retried', [
                    'job_id' => $id,
                ]);

                return response()->json([
                    'message' => 'Job retried successfully',
                ]);
            } else {
                return response()->json([
                    'message' => 'Failed to retry job',
                ], 500);
            }
        } catch (\Exception $e) {
            Log::error('Failed to retry job', [
                'job_id' => $id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'Failed to retry job',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    /**
     * Delete failed job
     */
    public function deleteFailedJob(Request $request, string $id): JsonResponse
    {
        try {
            $result = Artisan::call('queue:forget', ['id' => $id]);

            if ($result === 0) {
                Log::info('Failed job deleted', [
                    'job_id' => $id,
                ]);

                return response()->json([
                    'message' => 'Failed job deleted successfully',
                ]);
            } else {
                return response()->json([
                    'message' => 'Failed to delete job',
                ], 500);
            }
        } catch (\Exception $e) {
            Log::error('Failed to delete failed job', [
                'job_id' => $id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'Failed to delete failed job',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    /**
     * Retry all failed jobs
     */
    public function retryAllFailed(): JsonResponse
    {
        try {
            $result = Artisan::call('queue:retry', ['id' => 'all']);

            if ($result === 0) {
                Log::info('All failed jobs retried');

                return response()->json([
                    'message' => 'All failed jobs retried successfully',
                ]);
            } else {
                return response()->json([
                    'message' => 'Failed to retry all jobs',
                ], 500);
            }
        } catch (\Exception $e) {
            Log::error('Failed to retry all failed jobs', [
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'Failed to retry all failed jobs',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    /**
     * Clear all failed jobs
     */
    public function clearAllFailed(): JsonResponse
    {
        try {
            $result = Artisan::call('queue:flush');

            if ($result === 0) {
                Log::info('All failed jobs cleared');

                return response()->json([
                    'message' => 'All failed jobs cleared successfully',
                ]);
            } else {
                return response()->json([
                    'message' => 'Failed to clear all failed jobs',
                ], 500);
            }
        } catch (\Exception $e) {
            Log::error('Failed to clear all failed jobs', [
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'Failed to clear all failed jobs',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    /**
     * Restart queue workers
     */
    public function restartWorkers(): JsonResponse
    {
        try {
            $result = Artisan::call('queue:restart');

            if ($result === 0) {
                Log::info('Queue workers restarted');

                return response()->json([
                    'message' => 'Queue workers restarted successfully',
                ]);
            } else {
                return response()->json([
                    'message' => 'Failed to restart queue workers',
                ], 500);
            }
        } catch (\Exception $e) {
            Log::error('Failed to restart queue workers', [
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'Failed to restart queue workers',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    /**
     * Get queue statistics
     */
    public function statistics(Request $request): JsonResponse
    {
        try {
            $stats = [
                'total_jobs' => 0,
                'failed_jobs' => 0,
                'processed_jobs' => 0,
                'queues' => [],
                'job_types' => [],
                'performance' => [
                    'avg_processing_time' => 0,
                    'success_rate' => 0,
                ],
            ];

            // Get queue sizes
            $queues = ['default', 'high', 'low', 'emails', 'webhooks', 'billing'];

            foreach ($queues as $queueName) {
                try {
                    $size = Queue::size($queueName);
                    $stats['queues'][$queueName] = $size;
                    $stats['total_jobs'] += $size;
                } catch (\Exception $e) {
                    $stats['queues'][$queueName] = 0;
                }
            }

            // Get failed jobs count
            try {
                $stats['failed_jobs'] = DB::table('failed_jobs')->count();
            } catch (\Exception $e) {
                $stats['failed_jobs'] = 0;
            }

            // Calculate success rate
            if ($stats['total_jobs'] > 0) {
                $stats['performance']['success_rate'] =
                    (($stats['total_jobs'] - $stats['failed_jobs']) / $stats['total_jobs']) * 100;
            }

            // Get job types from failed jobs
            try {
                $jobTypes = DB::table('failed_jobs')
                    ->selectRaw('JSON_EXTRACT(payload, "$.displayName") as job_type, COUNT(*) as count')
                    ->groupBy('job_type')
                    ->get();

                foreach ($jobTypes as $jobType) {
                    $stats['job_types'][$jobType->job_type] = $jobType->count;
                }
            } catch (\Exception $e) {
                // Ignore if table doesn't exist or query fails
            }

            return response()->json([
                'data' => $stats,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to get queue statistics', [
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'Failed to get queue statistics',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    /**
     * Get queue health
     */
    public function health(): JsonResponse
    {
        try {
            $health = [
                'status' => 'healthy',
                'checks' => [],
                'timestamp' => now()->toISOString(),
            ];

            // Check Redis connection
            try {
                Redis::ping();
                $health['checks']['redis'] = [
                    'status' => 'healthy',
                    'message' => 'Redis connection is working',
                ];
            } catch (\Exception $e) {
                $health['checks']['redis'] = [
                    'status' => 'unhealthy',
                    'message' => 'Redis connection failed: ' . $e->getMessage(),
                ];
                $health['status'] = 'unhealthy';
            }

            // Check queue sizes
            $queues = ['default', 'high', 'low', 'emails', 'webhooks', 'billing'];
            $totalQueueSize = 0;

            foreach ($queues as $queueName) {
                try {
                    $size = Queue::size($queueName);
                    $totalQueueSize += $size;

                    if ($size > 1000) {
                        $health['checks'][$queueName] = [
                            'status' => 'warning',
                            'message' => "Queue {$queueName} has {$size} pending jobs",
                        ];
                        if ($health['status'] === 'healthy') {
                            $health['status'] = 'warning';
                        }
                    } else {
                        $health['checks'][$queueName] = [
                            'status' => 'healthy',
                            'message' => "Queue {$queueName} is normal ({$size} jobs)",
                        ];
                    }
                } catch (\Exception $e) {
                    $health['checks'][$queueName] = [
                        'status' => 'unhealthy',
                        'message' => "Queue {$queueName} check failed: " . $e->getMessage(),
                    ];
                    $health['status'] = 'unhealthy';
                }
            }

            // Check failed jobs
            try {
                $failedJobsCount = DB::table('failed_jobs')->count();

                if ($failedJobsCount > 100) {
                    $health['checks']['failed_jobs'] = [
                        'status' => 'warning',
                        'message' => "High number of failed jobs: {$failedJobsCount}",
                    ];
                    if ($health['status'] === 'healthy') {
                        $health['status'] = 'warning';
                    }
                } else {
                    $health['checks']['failed_jobs'] = [
                        'status' => 'healthy',
                        'message' => "Failed jobs count is normal: {$failedJobsCount}",
                    ];
                }
            } catch (\Exception $e) {
                $health['checks']['failed_jobs'] = [
                    'status' => 'unhealthy',
                    'message' => 'Failed jobs check failed: ' . $e->getMessage(),
                ];
                $health['status'] = 'unhealthy';
            }

            return response()->json([
                'data' => $health,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to get queue health', [
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'Failed to get queue health',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }
}
