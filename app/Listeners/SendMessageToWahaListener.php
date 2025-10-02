<?php

namespace App\Listeners;

use App\Events\MessageSent;
use App\Models\Message;
use App\Services\Waha\WahaService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class SendMessageToWahaListener implements ShouldQueue
{
    use InteractsWithQueue;

    /**
     * The number of times the job may be attempted.
     */
    public $tries = 3;

    /**
     * The maximum number of seconds the job can run.
     */
    public $timeout = 30;

    protected WahaService $wahaService;
    protected $messageId;

    /**
     * Create the event listener.
     */
    public function __construct(WahaService $wahaService)
    {
        $this->wahaService = $wahaService;
    }

    /**
     * Handle the event.
     */
    public function handle(MessageSent $event): void
    {
        try {
            // Use array data instead of objects to avoid serialization issues
            $messageData = $event->messageData;
            $sessionData = $event->sessionData;
            $this->messageId = $messageData['id'];

            // Generate unique processing key to prevent duplicate processing
            $processingKey = 'waha_processing_' . $messageData['id'];

            // Use Redis-based lock instead of file-based lock for better reliability
            $lockAcquired = \Illuminate\Support\Facades\Redis::set($processingKey, 'processing', 'EX', 60, 'NX');

            if (!$lockAcquired) {
                Log::info('Message processing lock could not be acquired, skipping duplicate', [
                    'session_id' => $sessionData['id'],
                    'message_id' => $messageData['id'],
                    'processing_key' => $processingKey
                ]);
                return;
            }

            try {
                $this->processMessage($messageData, $sessionData, $processingKey);

                // Release lock after successful processing
                \Illuminate\Support\Facades\Redis::del($processingKey);

            } catch (\Exception $e) {
                // Release lock on error
                \Illuminate\Support\Facades\Redis::del($processingKey);
                throw $e;
            }

        } catch (\Exception $e) {
            Log::error('WAHA listener failed to process message', [
                'session_id' => $sessionData['id'],
                'message_id' => $messageData['id'],
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            throw $e;
        }
    }

    /**
     * Process the message with WAHA service
     */
    private function processMessage(array $messageData, array $sessionData, string $processingKey): bool
    {
        try {
            Log::info('WAHA listener processing message', [
                'session_id' => $sessionData['id'],
                'message_id' => $messageData['id'],
                'processing_key' => $processingKey,
                'lock_acquired_at' => now()->toISOString()
            ]);

            // Prevent duplicate processing by checking if message already has WAHA metadata
            if (isset($messageData['metadata']['waha_sent_via'])) {
                Log::info('Message already processed by WAHA listener, skipping duplicate', [
                    'session_id' => $sessionData['id'],
                    'message_id' => $messageData['id'],
                    'waha_sent_via' => $messageData['metadata']['waha_sent_via']
                ]);
                return true;
            }

            // Check if session has WAHA integration
            $sessionMetadata = $sessionData['session_data'] ?? [];
            $wahaSessionName = $sessionMetadata['session_name'] ?? null;

            if (!$wahaSessionName) {
                Log::info('No WAHA session name found for session', [
                    'session_id' => $sessionData['id'],
                    'session_data' => $sessionMetadata
                ]);
                return true;
            }

            // Get customer phone number
            $customerPhone = $sessionMetadata['phone_number'] ?? null;
            if (!$customerPhone) {
                Log::warning('No customer phone number found for WAHA message', [
                    'session_id' => $sessionData['id'],
                    'session_data' => $sessionMetadata
                ]);
                return true;
            }

            // Only send if message is from agent (not from customer or bot)
            if ($messageData['sender_type'] !== 'agent') {
                Log::info('Skipping WAHA send for non-agent message', [
                    'session_id' => $sessionData['id'],
                    'sender_type' => $messageData['sender_type']
                ]);
                return true;
            }

            // Get message content
            $messageContent = $messageData['content'] ?? '';

            if (empty($messageContent)) {
                Log::warning('No message content found for WAHA send', [
                    'session_id' => $sessionData['id'],
                    'message_id' => $messageData['id'],
                    'content' => $messageData['content']
                ]);
                return true;
            }

            // Send message to WAHA
            $result = $this->wahaService->sendTextMessage(
                $wahaSessionName,
                $customerPhone,
                $messageContent
            );

            // Check if result contains message data (successful response)
            if (isset($result['id']) || isset($result['_data']['id'])) {
                // Extract message ID from WAHA response
                $wahaMessageId = $result['id']['_serialized'] ??
                               $result['_data']['id']['_serialized'] ??
                               $result['id'] ??
                               null;

                Log::info('Message sent to WAHA successfully via event listener', [
                    'session_id' => $sessionData['id'],
                    'waha_session' => $wahaSessionName,
                    'message_id' => $messageData['id'],
                    'waha_message_id' => $wahaMessageId
                ]);

                // Update message with WAHA response
                Message::where('id', $messageData['id'])->update([
                    'metadata' => array_merge($messageData['metadata'] ?? [], [
                        'waha_message_id' => $wahaMessageId,
                        'waha_timestamp' => $result['timestamp'] ?? null,
                        'waha_sent_at' => now()->toISOString(),
                        'waha_sent_via' => 'event_listener',
                        'waha_response' => $result
                    ])
                ]);
            } else {
                Log::warning('Failed to send message to WAHA via event listener', [
                    'session_id' => $sessionData['id'],
                    'waha_session' => $wahaSessionName,
                    'message_id' => $messageData['id'],
                    'result' => $result
                ]);

                // Update message with error status
                Message::where('id', $messageData['id'])->update([
                    'metadata' => array_merge($messageData['metadata'] ?? [], [
                        'waha_error' => 'Invalid response format',
                        'waha_failed_at' => now()->toISOString(),
                        'waha_sent_via' => 'event_listener_failed',
                        'waha_response' => $result
                    ])
                ]);
            }

            return true;

        } catch (\Exception $e) {
            Log::error('Exception while processing message in WAHA listener', [
                'session_id' => $sessionData['id'],
                'message_id' => $messageData['id'],
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            throw $e;
        }
    }
}
