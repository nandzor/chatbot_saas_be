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
    public $tries = 1;

    /**
     * The maximum number of seconds the job can run.
     */
    public $timeout = 30;

    /**
     * Determine if the job should be deleted when models are missing.
     */
    public $deleteWhenMissingModels = true;

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
        // Initialize variables to avoid undefined variable errors
        $messageData = [];
        $sessionId = null;
        $sessionData = [];
        $processingKey = '';

        try {
            // Laravel serializes event data when queuing
            // message can be array, stdClass, or Model object
            if (is_array($event->message)) {
                $messageData = $event->message;
            } elseif ($event->message instanceof \stdClass) {
                $messageData = json_decode(json_encode($event->message), true);
            } elseif (method_exists($event->message, 'toArray')) {
                $messageData = $event->message->toArray();
            } else {
                $messageData = (array) $event->message;
            }

            // sessionId is a string, not an object
            $sessionId = is_string($event->sessionId) ? $event->sessionId :
                        (is_object($event->sessionId) ? $event->sessionId->id :
                        $event->sessionId);

            // Get session from database to get full session data
            $session = \App\Models\ChatSession::find($sessionId);
            if (!$session) {
                Log::warning('Session not found for WAHA listener', [
                    'session_id' => $sessionId,
                    'message_id' => $messageData['id'] ?? 'unknown'
                ]);
                return;
            }

            $sessionData = $session->toArray();
            $this->messageId = $messageData['id'] ?? 'unknown';

            // Check if message already has WAHA metadata (already processed)
            if (isset($messageData['metadata']['waha_sent_via']) ||
                isset($messageData['metadata']['waha_message_id'])) {
                Log::info('Message already sent to WAHA, skipping', [
                    'message_id' => $messageData['id'] ?? 'unknown',
                    'waha_sent_via' => $messageData['metadata']['waha_sent_via'] ?? 'unknown'
                ]);
                return;
            }

            Log::info('WAHA listener processing message', [
                'message_id' => $this->messageId,
                'session_id' => $sessionId,
                'organization_id' => $sessionData['organization_id'] ?? 'unknown'
            ]);

            // Generate unique processing key to prevent duplicate processing
            $processingKey = 'waha_processing_' . ($messageData['id'] ?? 'unknown');

            // Use atomic Cache lock for better reliability (prevents race conditions)
            $lock = Cache::lock($processingKey, 60);

            if (!$lock->get()) {
                Log::info('Message processing lock could not be acquired, skipping duplicate', [
                    'session_id' => $sessionId,
                    'message_id' => $messageData['id'] ?? 'unknown',
                    'processing_key' => $processingKey
                ]);
                return;
            }

            try {
                $this->processMessage($messageData, $sessionData, $processingKey);

                // Release lock after successful processing
                $lock->release();

            } catch (\Exception $e) {
                // Release lock on error
                $lock->release();
                throw $e;
            }

        } catch (\Exception $e) {
            Log::error('WAHA listener failed to process message', [
                'session_id' => isset($sessionId) ? $sessionId : 'unknown',
                'message_id' => isset($messageData) ? ($messageData['id'] ?? 'unknown') : 'unknown',
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
            $sessionMetadata = $sessionData['session_data'] ?? $sessionData;
            $wahaSessionName = $sessionMetadata['session_name'] ?? $sessionMetadata['name'] ?? null;

            if (!$wahaSessionName) {
                Log::info('No WAHA session name found for session', [
                    'session_id' => $sessionData['id'],
                    'session_data' => $sessionMetadata
                ]);
                return true;
            }

            // Get customer phone number
            $customerPhone = $sessionMetadata['phone_number'] ?? $sessionMetadata['customer_phone'] ?? null;
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
                'session_id' => $sessionData['id'] ?? 'unknown',
                'message_id' => $messageData['id'] ?? 'unknown',
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            throw $e;
        }
    }
}
