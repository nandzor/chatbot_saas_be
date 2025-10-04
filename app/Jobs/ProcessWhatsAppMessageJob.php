<?php

namespace App\Jobs;

use App\Events\MessageProcessed;
use App\Services\WhatsAppMessageProcessor;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redis;

class ProcessWhatsAppMessageJob implements ShouldQueue
{
    use Queueable, InteractsWithQueue, SerializesModels;

    /**
     * The number of times the job may be attempted.
     */
    public int $tries = 3;

    /**
     * The maximum number of seconds the job can run.
     */
    public int $timeout = 120;

    /**
     * The message data from WAHA webhook
     */
    public array $messageData;

    /**
     * The organization ID
     */
    public string $organizationId;

    /**
     * The timestamp when job was created
     */
    public \Carbon\Carbon $createdAt;

    /**
     * Create a new job instance.
     */
    public function __construct(array $messageData, string $organizationId)
    {
        $this->messageData = $messageData;
        $this->organizationId = $organizationId;
        $this->createdAt = now();

        // Set queue name based on organization for better load balancing
        $this->onQueue('whatsapp-messages');
    }

    /**
     * Execute the job.
     */
    public function handle(WhatsAppMessageProcessor $messageProcessor): void
    {
        $startTime = microtime(true);

        try {
            Log::info('Processing WhatsApp message job started', [
                'organization_id' => $this->organizationId,
                'message_id' => $this->messageData['message_id'] ?? 'unknown',
                'from' => $this->messageData['from'] ?? 'unknown',
                'job_created_at' => $this->createdAt,
            ]);

            // Check for duplicate message processing
            if ($this->isDuplicateMessage()) {
                Log::warning('Duplicate message detected, skipping processing', [
                    'message_id' => $this->messageData['message_id'] ?? 'unknown',
                    'organization_id' => $this->organizationId,
                ]);
                return;
            }

            // Add organization_id to messageData before processing
            $messageDataWithOrg = $this->messageData;
            $messageDataWithOrg['organization_id'] = $this->organizationId;

            // Process the message without transaction to avoid silent rollbacks
            // The processIncomingMessage method already handles exceptions properly
            $result = $messageProcessor->processIncomingMessage($messageDataWithOrg);

            // Calculate processing time
            $processingTime = microtime(true) - $startTime;

            // Fire event for real-time updates
            if (isset($result['session_id']) && isset($result['message_id'])) {
                try {
                    $session = \App\Models\ChatSession::find($result['session_id']);
                    $message = \App\Models\Message::find($result['message_id']);

                    if ($session && $message) {
                        // Broadcast via BroadcastEventService for frontend realtime
                        $broadcastService = app(\App\Services\BroadcastEventService::class);
                        $broadcastResult = $broadcastService->broadcastMessageProcessed($session, $message, [
                            'processing_time' => $processingTime,
                            'response_sent' => $result['response_sent'] ?? false,
                            'bot_response' => $result['bot_response'] ?? null,
                            'source' => 'webhook',
                        ]);

                        Log::info('MessageProcessed broadcasted successfully', [
                            'session_id' => $result['session_id'],
                            'message_id' => $result['message_id'],
                            'processing_time' => $processingTime,
                            'broadcast_result' => $broadcastResult
                        ]);
                    } else {
                        Log::warning('Session or message not found for MessageProcessed event', [
                            'session_id' => $result['session_id'] ?? null,
                            'message_id' => $result['message_id'] ?? null,
                            'session_found' => $session ? 'yes' : 'no',
                            'message_found' => $message ? 'yes' : 'no'
                        ]);
                    }
                } catch (\Exception $e) {
                    Log::error('Failed to fire MessageProcessed event', [
                        'session_id' => $result['session_id'] ?? null,
                        'message_id' => $result['message_id'] ?? null,
                        'error' => $e->getMessage(),
                        'trace' => $e->getTraceAsString()
                    ]);
                    // Don't re-throw - this is not critical for message processing
                }
            } else {
                Log::warning('Missing session_id or message_id in result', [
                    'result_keys' => array_keys($result),
                    'session_id' => $result['session_id'] ?? null,
                    'message_id' => $result['message_id'] ?? null
                ]);
            }

            // Mark message as processed in Redis
            $this->markMessageAsProcessed();

            // Clean up processing key
            $this->cleanupProcessingKey();

            Log::info('WhatsApp message job completed successfully', [
                'organization_id' => $this->organizationId,
                'session_id' => $result['session_id'] ?? null,
                'message_id' => $result['message_id'] ?? null,
                'processing_time' => $processingTime,
                'response_sent' => $result['response_sent'] ?? false,
            ]);

        } catch (\Exception $e) {
            // Check if this is a duplicate key constraint violation
            if (str_contains($e->getMessage(), 'duplicate key value violates unique constraint')) {
                Log::warning('Duplicate key constraint violation detected, message may have been processed already', [
                    'organization_id' => $this->organizationId,
                    'message_id' => $this->messageData['message_id'] ?? 'unknown',
                    'error' => $e->getMessage(),
                    'attempt' => $this->attempts(),
                ]);

                // Mark as processed since it was already processed by another job
                $this->markMessageAsProcessed();

                // Clean up processing key
                $this->cleanupProcessingKey();

                Log::info('WhatsApp message job completed (duplicate key handled gracefully)', [
                    'organization_id' => $this->organizationId,
                    'message_id' => $this->messageData['message_id'] ?? 'unknown',
                ]);
                return; // Exit gracefully without throwing exception
            }

            Log::error('WhatsApp message job failed', [
                'organization_id' => $this->organizationId,
                'message_id' => $this->messageData['message_id'] ?? 'unknown',
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'attempt' => $this->attempts(),
            ]);

            // Re-throw exception to trigger retry mechanism
            throw $e;
        }
    }

    /**
     * Check if this message has already been processed
     */
    private function isDuplicateMessage(): bool
    {
        if (!isset($this->messageData['message_id'])) {
            return false;
        }

        return \App\Models\Message::where('metadata->whatsapp_message_id', $this->messageData['message_id'])
            ->where('organization_id', $this->organizationId)
            ->exists();
    }

    /**
     * Mark message as processed in Redis
     */
    private function markMessageAsProcessed(): void
    {
        if (isset($this->messageData['message_id'])) {
            $messageId = $this->messageData['message_id'];
            $redisKey = "whatsapp_message_processed:{$this->organizationId}:{$messageId}";

            // Mark as processed (expire in 1 hour)
            Redis::setex($redisKey, 3600, '1');
        }
    }

    /**
     * Handle a job failure.
     */
    public function failed(\Throwable $exception): void
    {
        Log::error('WhatsApp message job failed permanently', [
            'organization_id' => $this->organizationId,
            'message_id' => $this->messageData['message_id'] ?? 'unknown',
            'error' => $exception->getMessage(),
            'attempts' => $this->attempts(),
        ]);

        // You can add additional failure handling here, such as:
        // - Sending notification to administrators
        // - Storing failed message for manual review
        // - Updating metrics/analytics

        // Clean up processing key on failure
        $this->cleanupProcessingKey();
    }

    /**
     * Clean up processing key from Redis
     */
    private function cleanupProcessingKey(): void
    {
        try {
            $messageId = $this->messageData['message_id'] ?? 'unknown';
            $processingKey = "job_processing:{$this->organizationId}:{$messageId}";

            \Illuminate\Support\Facades\Redis::del($processingKey);

            \Illuminate\Support\Facades\Log::debug('Processing key cleaned up', [
                'organization_id' => $this->organizationId,
                'message_id' => $messageId,
                'processing_key' => $processingKey
            ]);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::warning('Failed to clean up processing key', [
                'organization_id' => $this->organizationId,
                'message_id' => $this->messageData['message_id'] ?? 'unknown',
                'error' => $e->getMessage()
            ]);
        }
    }
}
