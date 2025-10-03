<?php

namespace App\Listeners;

use App\Events\WhatsAppMessageReceived;
use App\Jobs\ProcessWhatsAppMessageJob;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Redis;
use Illuminate\Support\Facades\Cache;

class ProcessWhatsAppMessageListener implements ShouldQueue
{
    use InteractsWithQueue;

    /**
     * The number of times the listener may be attempted.
     */
    public int $tries = 1;

    /**
     * The maximum number of seconds the listener can run.
     */
    public int $timeout = 30;

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
    public function handle(WhatsAppMessageReceived $event): void
    {
        try {
            Log::info('WhatsApp message received event handled', [
                'organization_id' => $event->organizationId,
                'message_id' => $event->messageData['message_id'] ?? 'unknown',
                'from' => $event->messageData['from'] ?? 'unknown',
                'received_at' => $event->receivedAt,
            ]);

            // DUPLICATE DETECTION DISABLED - Allow all messages to be processed
            // This fixes the issue where messages were being skipped due to duplicate detection
            Log::info('Processing WhatsApp message event (duplicate detection disabled)', [
                'organization_id' => $event->organizationId,
                'message_id' => $event->messageData['message_id'] ?? 'unknown',
                'from' => $event->messageData['from'] ?? 'unknown'
            ]);

            // ENHANCED DUPLICATE PREVENTION FOR JOB DISPATCH
            $messageId = $event->messageData['message_id'] ?? 'unknown';
            $from = $event->messageData['from'] ?? 'unknown';
            $lockKey = "process_whatsapp_message:{$event->organizationId}:{$messageId}";

            // Use atomic Cache lock to prevent race conditions
            $lock = Cache::lock($lockKey, 60);

            if (!$lock->get()) {
                Log::info('Message processing lock could not be acquired, skipping duplicate', [
                    'organization_id' => $event->organizationId,
                    'message_id' => $messageId,
                    'from' => $from
                ]);
                return;
            }

            try {
                Log::info('Proceeding with message processing (lock acquired)', [
                    'organization_id' => $event->organizationId,
                    'message_id' => $messageId
                ]);

                // Dispatch job to process the message asynchronously
                ProcessWhatsAppMessageJob::dispatch($event->messageData, $event->organizationId)
                    ->onQueue('whatsapp-messages')
                    ->delay(now()->addSeconds(1)); // Small delay to prevent overwhelming the system

                Log::info('WhatsApp message processing job dispatched', [
                    'organization_id' => $event->organizationId,
                    'message_id' => $messageId,
                ]);

                // Release lock after successful dispatch
                $lock->release();

            } catch (\Exception $e) {
                // Release lock on error
                $lock->release();
                throw $e;
            }

        } catch (\Exception $e) {
            Log::error('Failed to handle WhatsApp message received event', [
                'organization_id' => $event->organizationId,
                'message_id' => $event->messageData['message_id'] ?? 'unknown',
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            // Re-throw exception to trigger retry mechanism
            throw $e;
        }
    }

    /**
     * Check if this message has already been processed
     */
    private function isMessageAlreadyProcessed(array $messageData, string $organizationId): bool
    {
        if (!isset($messageData['message_id'])) {
            return false;
        }

        $messageId = $messageData['message_id'];
        $redisKey = "whatsapp_message_processed:{$organizationId}:{$messageId}";

        // Check Redis first for fast duplicate detection
        if (Redis::exists($redisKey)) {
            return true;
        }

        // Check database as fallback
        $exists = \App\Models\Message::where('metadata->waha_message_id', $messageId)
            ->where('organization_id', $organizationId)
            ->exists();

        if ($exists) {
            // Mark in Redis for future fast lookups (expire in 1 hour)
            Redis::setex($redisKey, 3600, '1');
            return true;
        }

        // Mark as being processed in Redis to prevent race conditions
        Redis::setex($redisKey, 300, 'processing'); // 5 minutes
        return false;
    }

    /**
     * Handle a job failure.
     */
    public function failed(WhatsAppMessageReceived $event, \Throwable $exception): void
    {
        Log::error('WhatsApp message listener failed permanently', [
            'organization_id' => $event->organizationId,
            'message_id' => $event->messageData['message_id'] ?? 'unknown',
            'error' => $exception->getMessage(),
            'attempts' => $this->attempts(),
        ]);
    }
}
