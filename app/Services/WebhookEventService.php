<?php

namespace App\Services;

use App\Models\WebhookEvent;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class WebhookEventService
{
    /**
     * Create a new webhook event
     */
    public function create(array $data): WebhookEvent
    {
        try {
            return DB::transaction(function () use ($data) {
                $webhookEvent = WebhookEvent::create($data);

                Log::info('Webhook event created', [
                    'webhook_event_id' => $webhookEvent->id,
                    'gateway' => $webhookEvent->gateway,
                    'event_type' => $webhookEvent->event_type,
                ]);

                return $webhookEvent;
            });
        } catch (\Exception $e) {
            Log::error('Failed to create webhook event', [
                'error' => $e->getMessage(),
                'data' => $data,
            ]);
            throw $e;
        }
    }

    /**
     * Update webhook event
     */
    public function update(WebhookEvent $webhookEvent, array $data): WebhookEvent
    {
        try {
            return DB::transaction(function () use ($webhookEvent, $data) {
                $webhookEvent->update($data);

                Log::info('Webhook event updated', [
                    'webhook_event_id' => $webhookEvent->id,
                    'changes' => $data,
                ]);

                return $webhookEvent->fresh();
            });
        } catch (\Exception $e) {
            Log::error('Failed to update webhook event', [
                'webhook_event_id' => $webhookEvent->id,
                'error' => $e->getMessage(),
                'data' => $data,
            ]);
            throw $e;
        }
    }

    /**
     * Delete webhook event
     */
    public function delete(WebhookEvent $webhookEvent): bool
    {
        try {
            return DB::transaction(function () use ($webhookEvent) {
                $webhookEvent->delete();

                Log::info('Webhook event deleted', [
                    'webhook_event_id' => $webhookEvent->id,
                ]);

                return true;
            });
        } catch (\Exception $e) {
            Log::error('Failed to delete webhook event', [
                'webhook_event_id' => $webhookEvent->id,
                'error' => $e->getMessage(),
            ]);
            throw $e;
        }
    }

    /**
     * Retry webhook event
     */
    public function retry(WebhookEvent $webhookEvent): WebhookEvent
    {
        try {
            return DB::transaction(function () use ($webhookEvent) {
                if (!$webhookEvent->can_retry) {
                    throw new \Exception('Webhook event cannot be retried');
                }

                $webhookEvent->markForRetry();

                Log::info('Webhook event retry initiated', [
                    'webhook_event_id' => $webhookEvent->id,
                    'retry_count' => $webhookEvent->retry_count,
                ]);

                return $webhookEvent->fresh();
            });
        } catch (\Exception $e) {
            Log::error('Failed to retry webhook event', [
                'webhook_event_id' => $webhookEvent->id,
                'error' => $e->getMessage(),
            ]);
            throw $e;
        }
    }

    /**
     * Bulk retry webhook events
     */
    public function bulkRetry(array $webhookEventIds): array
    {
        $results = [];

        try {
            foreach ($webhookEventIds as $id) {
                try {
                    $webhookEvent = WebhookEvent::findOrFail($id);
                    $this->retry($webhookEvent);
                    $results[$id] = true;
                } catch (\Exception $e) {
                    $results[$id] = false;
                    Log::error('Failed to retry webhook event in bulk operation', [
                        'webhook_event_id' => $id,
                        'error' => $e->getMessage(),
                    ]);
                }
            }

            return $results;
        } catch (\Exception $e) {
            Log::error('Failed to bulk retry webhook events', [
                'error' => $e->getMessage(),
                'webhook_event_ids' => $webhookEventIds,
            ]);
            throw $e;
        }
    }

    /**
     * Get webhook event statistics
     */
    public function getStatistics(array $filters = []): array
    {
        try {
            $query = WebhookEvent::query();

            // Apply filters
            if (isset($filters['gateway'])) {
                $query->byGateway($filters['gateway']);
            }

            if (isset($filters['event_type'])) {
                $query->byEventType($filters['event_type']);
            }

            if (isset($filters['organization_id'])) {
                $query->byOrganization($filters['organization_id']);
            }

            if (isset($filters['date_from'])) {
                $query->where('created_at', '>=', $filters['date_from']);
            }

            if (isset($filters['date_to'])) {
                $query->where('created_at', '<=', $filters['date_to']);
            }

            // Get statistics
            $stats = [
                'total' => $query->count(),
                'by_status' => $query->selectRaw('status, COUNT(*) as count')
                    ->groupBy('status')
                    ->pluck('count', 'status')
                    ->toArray(),
                'by_gateway' => $query->selectRaw('gateway, COUNT(*) as count')
                    ->groupBy('gateway')
                    ->pluck('count', 'gateway')
                    ->toArray(),
                'by_event_type' => $query->selectRaw('event_type, COUNT(*) as count')
                    ->groupBy('event_type')
                    ->pluck('count', 'event_type')
                    ->toArray(),
                'by_hour' => $query->selectRaw('DATE_FORMAT(created_at, "%Y-%m-%d %H:00:00") as hour, COUNT(*) as count')
                    ->groupBy('hour')
                    ->orderBy('hour')
                    ->pluck('count', 'hour')
                    ->toArray(),
                'success_rate' => 0,
                'average_retry_count' => 0,
            ];

            // Calculate success rate
            $total = $stats['total'];
            if ($total > 0) {
                $processed = $stats['by_status']['processed'] ?? 0;
                $stats['success_rate'] = ($processed / $total) * 100;
            }

            // Calculate average retry count
            if ($total > 0) {
                $avgRetry = $query->avg('retry_count');
                $stats['average_retry_count'] = round($avgRetry, 2);
            }

            return $stats;
        } catch (\Exception $e) {
            Log::error('Failed to get webhook event statistics', [
                'error' => $e->getMessage(),
                'filters' => $filters,
            ]);
            throw $e;
        }
    }

    /**
     * Get webhook event logs
     */
    public function getLogs(WebhookEvent $webhookEvent): array
    {
        try {
            // This would typically fetch logs from a logging system
            // For now, we'll return basic information
            $logs = [
                'webhook_event' => [
                    'id' => $webhookEvent->id,
                    'gateway' => $webhookEvent->gateway,
                    'event_type' => $webhookEvent->event_type,
                    'status' => $webhookEvent->status,
                    'created_at' => $webhookEvent->created_at,
                    'processed_at' => $webhookEvent->processed_at,
                    'retry_count' => $webhookEvent->retry_count,
                    'error_message' => $webhookEvent->error_message,
                ],
                'processing_logs' => [
                    [
                        'timestamp' => $webhookEvent->created_at,
                        'level' => 'info',
                        'message' => 'Webhook event received',
                        'data' => [
                            'gateway' => $webhookEvent->gateway,
                            'event_type' => $webhookEvent->event_type,
                        ],
                    ],
                ],
            ];

            // Add processing logs if processed
            if ($webhookEvent->processed_at) {
                $logs['processing_logs'][] = [
                    'timestamp' => $webhookEvent->processed_at,
                    'level' => 'info',
                    'message' => 'Webhook event processed successfully',
                ];
            }

            // Add error logs if failed
            if ($webhookEvent->error_message) {
                $logs['processing_logs'][] = [
                    'timestamp' => $webhookEvent->updated_at,
                    'level' => 'error',
                    'message' => 'Webhook event processing failed',
                    'data' => [
                        'error' => $webhookEvent->error_message,
                        'retry_count' => $webhookEvent->retry_count,
                    ],
                ];
            }

            // Add retry logs
            if ($webhookEvent->retry_count > 0) {
                for ($i = 1; $i <= $webhookEvent->retry_count; $i++) {
                    $logs['processing_logs'][] = [
                        'timestamp' => $webhookEvent->updated_at,
                        'level' => 'warning',
                        'message' => "Webhook event retry attempt {$i}",
                    ];
                }
            }

            return $logs;
        } catch (\Exception $e) {
            Log::error('Failed to get webhook event logs', [
                'webhook_event_id' => $webhookEvent->id,
                'error' => $e->getMessage(),
            ]);
            throw $e;
        }
    }

    /**
     * Process webhook event
     */
    public function process(WebhookEvent $webhookEvent): bool
    {
        try {
            return DB::transaction(function () use ($webhookEvent) {
                // Mark as processing
                $webhookEvent->update(['status' => 'processing']);

                // Simulate webhook processing
                // In real implementation, this would call the appropriate service
                $success = $this->simulateWebhookProcessing($webhookEvent);

                if ($success) {
                    $webhookEvent->markAsProcessed();
                } else {
                    $webhookEvent->markAsFailed('Processing failed');
                }

                return $success;
            });
        } catch (\Exception $e) {
            Log::error('Failed to process webhook event', [
                'webhook_event_id' => $webhookEvent->id,
                'error' => $e->getMessage(),
            ]);

            $webhookEvent->markAsFailed($e->getMessage());
            return false;
        }
    }

    /**
     * Simulate webhook processing
     */
    protected function simulateWebhookProcessing(WebhookEvent $webhookEvent): bool
    {
        // Simulate processing time
        usleep(100000); // 0.1 second

        // Simulate success/failure based on retry count
        // Higher retry count = lower success rate
        $successRate = max(0.1, 1 - ($webhookEvent->retry_count * 0.2));

        return mt_rand() / mt_getrandmax() < $successRate;
    }

    /**
     * Get webhook events ready for retry
     */
    public function getReadyForRetry(): \Illuminate\Database\Eloquent\Collection
    {
        try {
            return WebhookEvent::readyForRetry()->get();
        } catch (\Exception $e) {
            Log::error('Failed to get webhook events ready for retry', [
                'error' => $e->getMessage(),
            ]);
            throw $e;
        }
    }

    /**
     * Process all webhook events ready for retry
     */
    public function processReadyForRetry(): array
    {
        $results = [];

        try {
            $webhookEvents = $this->getReadyForRetry();

            foreach ($webhookEvents as $webhookEvent) {
                try {
                    $success = $this->process($webhookEvent);
                    $results[$webhookEvent->id] = $success;
                } catch (\Exception $e) {
                    $results[$webhookEvent->id] = false;
                    Log::error('Failed to process webhook event in batch', [
                        'webhook_event_id' => $webhookEvent->id,
                        'error' => $e->getMessage(),
                    ]);
                }
            }

            return $results;
        } catch (\Exception $e) {
            Log::error('Failed to process webhook events ready for retry', [
                'error' => $e->getMessage(),
            ]);
            throw $e;
        }
    }

    /**
     * Clean up old webhook events
     */
    public function cleanup(int $daysOld = 30): int
    {
        try {
            $cutoffDate = now()->subDays($daysOld);

            $deletedCount = WebhookEvent::where('created_at', '<', $cutoffDate)
                ->where('status', 'processed')
                ->delete();

            Log::info('Webhook events cleaned up', [
                'deleted_count' => $deletedCount,
                'cutoff_date' => $cutoffDate,
            ]);

            return $deletedCount;
        } catch (\Exception $e) {
            Log::error('Failed to cleanup webhook events', [
                'error' => $e->getMessage(),
                'days_old' => $daysOld,
            ]);
            throw $e;
        }
    }
}
