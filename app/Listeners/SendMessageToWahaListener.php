<?php

namespace App\Listeners;

use App\Events\MessageSent;
use App\Services\Waha\WahaService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class SendMessageToWahaListener implements ShouldQueue
{
    use InteractsWithQueue;

    protected WahaService $wahaService;

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
            $message = $event->message;
            $session = $event->session;

            // Generate unique processing key to prevent duplicate processing
            $processingKey = 'waha_processing_' . $message->id;

            // Check if this message is already being processed (using cache lock)
            if (Cache::has($processingKey)) {
                Log::info('Message already being processed by WAHA listener, skipping duplicate', [
                    'session_id' => $session->id,
                    'message_id' => $message->id,
                    'processing_key' => $processingKey,
                    'cache_driver' => config('cache.default')
                ]);
                return;
            }

            // Set processing lock for 60 seconds
            Cache::put($processingKey, true, 60);

            Log::info('WAHA listener processing lock set', [
                'session_id' => $session->id,
                'message_id' => $message->id,
                'processing_key' => $processingKey,
                'lock_set_at' => now()->toISOString()
            ]);

            // Prevent duplicate processing by checking if message already has WAHA metadata
            if (isset($message->metadata['waha_sent_via'])) {
                Log::info('Message already processed by WAHA listener, skipping duplicate', [
                    'session_id' => $session->id,
                    'message_id' => $message->id,
                    'waha_sent_via' => $message->metadata['waha_sent_via']
                ]);
                Cache::forget($processingKey);
                return;
            }

            // Check if session has WAHA integration
            $sessionData = $session->session_data ?? [];
            $wahaSessionName = $sessionData['session_name'] ?? null;

            if (!$wahaSessionName) {
                Log::info('No WAHA session name found for session', [
                    'session_id' => $session->id,
                    'session_data' => $sessionData
                ]);
                return;
            }

            // Get customer phone number
            $customerPhone = $sessionData['phone_number'] ?? null;
            if (!$customerPhone) {
                Log::warning('No customer phone number found for WAHA message', [
                    'session_id' => $session->id,
                    'session_data' => $sessionData
                ]);
                return;
            }

            // Only send if message is from agent (not from customer or bot)
            if ($message->sender_type !== 'agent') {
                Log::info('Skipping WAHA send for non-agent message', [
                    'session_id' => $session->id,
                    'sender_type' => $message->sender_type
                ]);
                return;
            }

            // Get message content
            $messageContent = $message->content ?? $message->message_text ?? '';

            if (empty($messageContent)) {
                Log::warning('No message content found for WAHA send', [
                    'session_id' => $session->id,
                    'message_id' => $message->id,
                    'content' => $message->content,
                    'message_text' => $message->message_text
                ]);
                return;
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
                    'session_id' => $session->id,
                    'waha_session' => $wahaSessionName,
                    'message_id' => $message->id,
                    'waha_message_id' => $wahaMessageId
                ]);

                // Update message with WAHA response
                $message->update([
                    'metadata' => array_merge($message->metadata ?? [], [
                        'waha_message_id' => $wahaMessageId,
                        'waha_timestamp' => $result['timestamp'] ?? null,
                        'waha_sent_at' => now()->toISOString(),
                        'waha_sent_via' => 'event_listener',
                        'waha_response' => $result
                    ])
                ]);
            } else {
                Log::warning('Failed to send message to WAHA via event listener', [
                    'session_id' => $session->id,
                    'waha_session' => $wahaSessionName,
                    'message_id' => $message->id,
                    'result' => $result
                ]);

                // Update message with error status
                $message->update([
                    'metadata' => array_merge($message->metadata ?? [], [
                        'waha_error' => 'Invalid response format',
                        'waha_failed_at' => now()->toISOString(),
                        'waha_sent_via' => 'event_listener_failed',
                        'waha_response' => $result
                    ])
                ]);
            }

            // Clear processing lock
            Cache::forget($processingKey);

        } catch (\Exception $e) {
            // Clear processing lock on exception
            $processingKey = 'waha_processing_' . $event->message->id;
            Cache::forget($processingKey);

            Log::error('Exception while sending message to WAHA via event listener', [
                'session_id' => $event->session->id,
                'message_id' => $event->message->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
        }
    }
}
