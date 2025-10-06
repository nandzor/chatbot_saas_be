<?php

namespace App\Services\Waha;

use App\Models\Message;
use App\Models\ChatSession;
use App\Models\Customer;
use App\Models\BotPersonality;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redis;

class WahaWebhookService
{
    /**
     * Handle different types of WAHA webhook events
     */
    public function handleWahaWebhookEvent(array $payload, string $organizationId): array
    {
        $eventType = $payload['event'] ?? 'unknown';

        try {
            switch ($eventType) {
                case 'message':
                case 'message.any':
                    return $this->handleMessageEvent($payload, $organizationId);

                case 'message.reaction':
                    return $this->handleMessageReactionEvent($payload, $organizationId);

                case 'message.ack':
                    return $this->handleMessageAckEvent($payload, $organizationId);

                case 'message.revoked':
                    return $this->handleMessageRevokedEvent($payload, $organizationId);

                case 'message.edited':
                    return $this->handleMessageEditedEvent($payload, $organizationId);

                case 'group.v2.join':
                case 'group.v2.leave':
                case 'group.v2.update':
                case 'group.v2.participants':
                    return $this->handleGroupEvent($payload, $organizationId);

                case 'chat.archive':
                    return $this->handleChatArchiveEvent($payload, $organizationId);

                case 'presence.update':
                    return $this->handlePresenceUpdateEvent($payload, $organizationId);

                case 'poll.vote':
                    return $this->handlePollVoteEvent($payload, $organizationId);

                case 'call.received':
                case 'call.accepted':
                case 'call.rejected':
                    return $this->handleCallEvent($payload, $organizationId);

                default:
                    Log::info('Unhandled WAHA webhook event type', [
                        'event' => $eventType,
                        'organization_id' => $organizationId
                    ]);
                    return [
                        'success' => true,
                        'message' => 'Event type not handled but acknowledged'
                    ];
            }
        } catch (\Exception $e) {
            Log::error('Failed to handle WAHA webhook event', [
                'event' => $eventType,
                'organization_id' => $organizationId,
                'error' => $e->getMessage()
            ]);
            return [
                'success' => false,
                'message' => 'Failed to handle webhook event: ' . $e->getMessage(),
                'code' => 500
            ];
        }
    }

    /**
     * Handle message events
     */
    public function handleMessageEvent(array $payload, string $organizationId): array
    {
        // Extract message data from WAHA webhook format
        $messageData = $this->extractWahaMessageData($payload);

        if (!$messageData) {
            return [
                'success' => false,
                'message' => 'Invalid message format',
                'code' => 400
            ];
        }

        // Add organization_id to message data
        $messageData['organization_id'] = $organizationId;

        // Check if this is an outgoing message (from our system)
        $isOutgoing = $messageData['from_me'] ?? false;

        if ($isOutgoing) {
            // Handle outgoing message (from bot/agent)
            Log::info('Outgoing message detected', [
                'message_id' => $messageData['message_id'],
                'to' => $messageData['to'],
                'text' => $messageData['text'],
                'organization_id' => $organizationId
            ]);

            // Save outgoing message to database
            $this->saveOutgoingMessage($messageData, $organizationId);

            return [
                'success' => true,
                'message' => 'Outgoing message processed',
                'data' => [
                    'message_id' => $messageData['message_id'] ?? null,
                    'to' => $messageData['to'] ?? null,
                    'direction' => 'outgoing'
                ]
            ];
        } else {
            // Handle incoming message (from customer)
            Log::info('Incoming message detected', [
                'message_id' => $messageData['message_id'],
                'from' => $messageData['from'],
                'text' => $messageData['text'],
                'organization_id' => $organizationId
            ]);

            // Check for duplicate using database instead of Redis
            if ($this->isMessageAlreadyProcessed($messageData['message_id'], $organizationId)) {
                Log::warning('WhatsApp WAHA webhook already processed, skipping duplicate', [
                    'organization_id' => $organizationId,
                    'message_id' => $messageData['message_id'] ?? 'unknown',
                    'from' => $messageData['from'] ?? 'unknown',
                ]);

                return [
                    'success' => false,
                    'message' => 'Webhook already processed',
                    'data' => [
                        'message_id' => $messageData['message_id'] ?? null,
                        'from' => $messageData['from'] ?? null,
                        'status' => 'duplicate'
                    ]
                ];
            }

            // Log webhook processing for deduplication
            $this->logWebhookProcessing($messageData['message_id'], $organizationId, $messageData);

            // Realtime messaging disabled
            // event(new \App\Events\WhatsAppMessageReceived($messageData, $organizationId));

            return [
                'success' => true,
                'message' => 'Incoming message event processed',
                'data' => [
                    'message_id' => $messageData['message_id'] ?? null,
                    'from' => $messageData['from'] ?? null,
                    'direction' => 'incoming'
                ]
            ];
        }
    }

    /**
     * Extract message data from WAHA webhook payload
     */
    public function extractWahaMessageData(array $payload): ?array
    {
        try {
            // Standard WAHA webhook format (from documentation)
            if (isset($payload['event']) && in_array($payload['event'], ['message', 'message.any']) && isset($payload['payload'])) {
                $message = $payload['payload'];

                return [
                    'message_id' => is_array($message['id']) ? ($message['id']['_serialized'] ?? \Illuminate\Support\Str::uuid()) : ($message['id'] ?? \Illuminate\Support\Str::uuid()),
                    'from' => $message['from'] ?? null,
                    'to' => $message['to'] ?? null,
                    'text' => $message['body'] ?? null,
                    'message_type' => $this->determineMessageType($message),
                    'timestamp' => $message['timestamp'] ?? now()->timestamp,
                    'session_name' => $payload['session'] ?? null,
                    'customer_phone' => $this->extractPhoneNumber($message['from'] ?? null),
                    'customer_name' => $this->extractCustomerName($message),
                    'raw_data' => $payload,
                    'waha_message_id' => $message['id'] ?? null,
                    'waha_session' => $payload['session'] ?? null,
                    'waha_event_id' => $payload['id'] ?? null,
                    'from_me' => $message['fromMe'] ?? false,
                    'source' => $message['source'] ?? 'unknown',
                    'participant' => $message['participant'] ?? null,
                    'has_media' => $message['hasMedia'] ?? false,
                    'media' => $message['media'] ?? null,
                    'ack' => $message['ack'] ?? -1,
                    'ack_name' => $message['ackName'] ?? null,
                    'author' => $message['author'] ?? null,
                    'location' => $message['location'] ?? null,
                    'v_cards' => $message['vCards'] ?? [],
                    'reply_to' => $message['replyTo'] ?? null,
                    'me' => $payload['me'] ?? null,
                    'environment' => $payload['environment'] ?? null,
                ];
            }

            // Legacy WAHA format (backward compatibility)
            if (isset($payload['message']) && isset($payload['session'])) {
                $message = $payload['message'];

                return [
                    'message_id' => $message['id'] ?? \Illuminate\Support\Str::uuid(),
                    'from' => $message['from'] ?? null,
                    'to' => $message['to'] ?? null,
                    'text' => $message['text']['body'] ?? $message['body'] ?? null,
                    'message_type' => $message['type'] ?? 'text',
                    'timestamp' => $message['timestamp'] ?? now()->timestamp,
                    'session_name' => $payload['session'] ?? null,
                    'customer_phone' => $this->extractPhoneNumber($message['from'] ?? null),
                    'customer_name' => $message['contact']['name'] ?? null,
                    'raw_data' => $payload,
                    'waha_message_id' => $message['id'] ?? null,
                    'waha_session' => $payload['session'] ?? null,
                ];
            }

            return null;

        } catch (\Exception $e) {
            Log::error('Failed to extract WAHA message data', [
                'error' => $e->getMessage(),
                'payload' => $payload
            ]);
            return null;
        }
    }

    /**
     * Determine message type from WAHA message data
     */
    private function determineMessageType(array $message): string
    {
        if (isset($message['hasMedia']) && $message['hasMedia']) {
            if (isset($message['media']['mimetype'])) {
                $mimetype = $message['media']['mimetype'];
                if (str_starts_with($mimetype, 'image/')) return 'image';
                if (str_starts_with($mimetype, 'video/')) return 'video';
                if (str_starts_with($mimetype, 'audio/')) return 'audio';
                if (str_starts_with($mimetype, 'application/')) return 'document';
            }
            return 'media';
        }

        if (isset($message['location'])) return 'location';
        if (isset($message['vCards']) && !empty($message['vCards'])) return 'contact';
        if (isset($message['body']) && empty($message['body'])) return 'system';

        return 'text';
    }

    /**
     * Extract phone number from WAHA format
     */
    private function extractPhoneNumber(?string $from): ?string
    {
        if (!$from) return null;

        // Remove @c.us suffix if present
        return str_replace('@c.us', '', $from);
    }

    /**
     * Extract customer name from message data
     */
    private function extractCustomerName(array $message): ?string
    {
        // Try different possible locations for customer name
        if (isset($message['contact']['name'])) {
            return $message['contact']['name'];
        }

        if (isset($message['author'])) {
            return $message['author'];
        }

        if (isset($message['pushName'])) {
            return $message['pushName'];
        }

        // Check in _data.notifyName (real WAHA data)
        if (isset($message['_data']['notifyName'])) {
            return $message['_data']['notifyName'];
        }

        // Check in media._data.notifyName (real WAHA data structure)
        if (isset($message['media']['_data']['notifyName'])) {
            return $message['media']['_data']['notifyName'];
        }

        return null;
    }

    /**
     * Save outgoing message to database
     */
    public function saveOutgoingMessage(array $messageData, string $organizationId): void
    {
        try {
            // Extract and validate message data
            $messageInfo = $this->extractMessageInfo($messageData);
            if (!$messageInfo) {
                return;
            }

            // Check for duplicates using database lock
            if ($this->isDuplicateMessage($messageInfo, $organizationId)) {
                return;
            }

            // Find customer and session
            $customer = $this->findCustomerByPhone($messageInfo['phone'], $organizationId);
            if (!$customer) {
                return;
            }

            $session = $this->findActiveSession($customer->id, $organizationId);
            if (!$session) {
                return;
            }

            // Determine sender information
            $senderInfo = $this->determineSenderInfo($session, $organizationId);

            // Create the message
            $message = $this->createOutgoingMessage($messageData, $messageInfo, $session, $senderInfo, $organizationId);

            Log::info('Outgoing message saved successfully', [
                'message_id' => $message->id,
                'session_id' => $session->id,
                'sender_type' => $senderInfo['type'],
                'sender_name' => $senderInfo['name'],
                'content' => $message->message_text
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to save outgoing message', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'message_data' => $messageData
            ]);
        }
    }

    /**
     * Extract and validate message information from WAHA data
     */
    private function extractMessageInfo(array $messageData): ?array
    {
        $messageText = $messageData['text'] ?? '';
        $customerPhone = $messageData['to'] ?? '';
        $timestamp = $messageData['timestamp'] ?? null;

        if (empty($messageText) || empty($customerPhone)) {
            Log::warning('Cannot save outgoing message: missing required data', [
                'has_text' => !empty($messageText),
                'has_phone' => !empty($customerPhone),
                'message_data' => $messageData
            ]);
            return null;
        }

        return [
            'text' => $messageText,
            'phone' => $customerPhone,
            'timestamp' => $timestamp,
            'waha_message_id' => $messageData['message_id'] ?? null,
            'message_type' => $messageData['message_type'] ?? 'text'
        ];
    }

    /**
     * Check if message is duplicate using database lock
     */
    private function isDuplicateMessage(array $messageInfo, string $organizationId): bool
    {
        return DB::transaction(function() use ($messageInfo, $organizationId) {
            // Check by WAHA message ID first (most reliable)
            if ($messageInfo['waha_message_id']) {
                $existingByWahaId = Message::where('metadata->waha_message_id', $messageInfo['waha_message_id'])
                    ->lockForUpdate()
                    ->first();

                if ($existingByWahaId) {
                    Log::info('Outgoing message already exists (duplicate WAHA ID)', [
                        'waha_message_id' => $messageInfo['waha_message_id'],
                        'existing_message_id' => $existingByWahaId->id
                    ]);
                    return true;
                }
            }

            // Check by content and phone within last 30 seconds
            $existingByContent = Message::where('message_text', $messageInfo['text'])
                ->where('metadata->whatsapp->to', $messageInfo['phone'])
                ->where('created_at', '>=', now()->subSeconds(30))
                ->where('sender_type', 'bot')
                ->lockForUpdate()
                ->first();

            if ($existingByContent) {
                Log::info('Outgoing message already exists (duplicate content)', [
                    'message_text' => $messageInfo['text'],
                    'customer_phone' => $messageInfo['phone'],
                    'existing_message_id' => $existingByContent->id,
                    'existing_created_at' => $existingByContent->created_at
                ]);
                return true;
            }

            return false; // No duplicate found
        });
    }

    /**
     * Find customer by phone number
     */
    private function findCustomerByPhone(string $phone, string $organizationId): ?Customer
    {
        $customer = Customer::where('organization_id', $organizationId)
            ->where(function($query) use ($phone) {
                $query->where('phone', $phone)
                      ->orWhere('phone', str_replace('@c.us', '', $phone))
                      ->orWhere('phone', $phone . '@c.us');
            })
            ->first();

        if (!$customer) {
            Log::warning('Cannot save outgoing message: customer not found', [
                'phone' => $phone,
                'organization_id' => $organizationId
            ]);
        }

        return $customer;
    }

    /**
     * Find active session for customer
     */
    private function findActiveSession(string $customerId, string $organizationId): ?ChatSession
    {
        $session = ChatSession::where('organization_id', $organizationId)
            ->where('customer_id', $customerId)
            ->where('is_active', true)
            ->first();

        if (!$session) {
            Log::warning('Cannot save outgoing message: no active session found', [
                'customer_id' => $customerId,
                'organization_id' => $organizationId
            ]);
        }

        return $session;
    }

    /**
     * Determine sender information based on session and organization
     */
    private function determineSenderInfo(ChatSession $session, string $organizationId): array
    {
        // If session has assigned agent, use agent as sender
        if ($session->agent_id) {
            return [
                'type' => 'agent',
                'id' => $session->agent_id,
                'name' => $session->agent->display_name ?? 'Agent'
            ];
        }

        // Otherwise, use bot personality
        $botPersonality = BotPersonality::where('organization_id', $organizationId)
            ->where('status', 'active')
            ->where('is_default', true)
            ->first();

        if ($botPersonality) {
            return [
                'type' => 'bot',
                'id' => $botPersonality->id,
                'name' => $botPersonality->name
            ];
        }

        // Fallback to system bot
        return [
            'type' => 'bot',
            'id' => null,
            'name' => 'System Bot'
        ];
    }

    /**
     * Create outgoing message record
     */
    private function createOutgoingMessage(
        array $messageData,
        array $messageInfo,
        ChatSession $session,
        array $senderInfo,
        string $organizationId
    ): Message {
        return Message::create([
            'organization_id' => $organizationId,
            'session_id' => $session->id,
            'waha_session_id' => $messageData['waha_session'] ?? null,
            'sender_type' => $senderInfo['type'],
            'sender_id' => $senderInfo['id'],
            'sender_name' => $senderInfo['name'],
            'message_type' => $messageInfo['message_type'],
            'message_text' => $messageInfo['text'],
            'metadata' => [
                'whatsapp_message_id' => $messageInfo['waha_message_id'],
                'phone_number' => $messageInfo['phone'],
                'timestamp' => $messageInfo['timestamp'] ?? now()->timestamp,
                'raw_data' => $messageData['raw_data'] ?? null,
                'direction' => 'outgoing',
                'from_me' => true,
                'waha_message_id' => $messageInfo['waha_message_id']
            ],
            'is_read' => true, // Outgoing messages are considered read
            'read_at' => now(),
            'delivered_at' => now(),
            'created_at' => now()->addMilliseconds(rand(100, 500))
        ]);
    }

    /**
     * Handle message reaction events
     */
    private function handleMessageReactionEvent(array $payload, string $organizationId): array
    {
        Log::info('Message reaction event received', [
            'organization_id' => $organizationId,
            'payload' => $payload
        ]);

        // TODO: Implement message reaction handling
        return [
            'success' => true,
            'message' => 'Message reaction event processed'
        ];
    }

    /**
     * Handle message acknowledgment events
     */
    private function handleMessageAckEvent(array $payload, string $organizationId): array
    {
        Log::info('Message ACK event received', [
            'organization_id' => $organizationId,
            'payload' => $payload
        ]);

        // TODO: Implement message ACK handling
        return [
            'success' => true,
            'message' => 'Message ACK event processed'
        ];
    }

    /**
     * Handle message revoked events
     */
    private function handleMessageRevokedEvent(array $payload, string $organizationId): array
    {
        Log::info('Message revoked event received', [
            'organization_id' => $organizationId,
            'payload' => $payload
        ]);

        // TODO: Implement message revocation handling
        return [
            'success' => true,
            'message' => 'Message revoked event processed'
        ];
    }

    /**
     * Handle message edited events
     */
    private function handleMessageEditedEvent(array $payload, string $organizationId): array
    {
        Log::info('Message edited event received', [
            'organization_id' => $organizationId,
            'payload' => $payload
        ]);

        // TODO: Implement message edit handling
        return [
            'success' => true,
            'message' => 'Message edited event processed'
        ];
    }

    /**
     * Handle group events
     */
    private function handleGroupEvent(array $payload, string $organizationId): array
    {
        Log::info('Group event received', [
            'organization_id' => $organizationId,
            'event' => $payload['event'] ?? 'unknown',
            'payload' => $payload
        ]);

        // TODO: Implement group event handling
        return [
            'success' => true,
            'message' => 'Group event processed'
        ];
    }

    /**
     * Handle chat archive events
     */
    private function handleChatArchiveEvent(array $payload, string $organizationId): array
    {
        Log::info('Chat archive event received', [
            'organization_id' => $organizationId,
            'payload' => $payload
        ]);

        // TODO: Implement chat archive handling
        return [
            'success' => true,
            'message' => 'Chat archive event processed'
        ];
    }

    /**
     * Handle presence update events
     */
    private function handlePresenceUpdateEvent(array $payload, string $organizationId): array
    {
        Log::info('Presence update event received', [
            'organization_id' => $organizationId,
            'payload' => $payload
        ]);

        // TODO: Implement presence update handling
        return [
            'success' => true,
            'message' => 'Presence update event processed'
        ];
    }

    /**
     * Handle poll vote events
     */
    private function handlePollVoteEvent(array $payload, string $organizationId): array
    {
        Log::info('Poll vote event received', [
            'organization_id' => $organizationId,
            'payload' => $payload
        ]);

        // TODO: Implement poll vote handling
        return [
            'success' => true,
            'message' => 'Poll vote event processed'
        ];
    }

    /**
     * Handle call events
     */
    private function handleCallEvent(array $payload, string $organizationId): array
    {
        Log::info('Call event received', [
            'organization_id' => $organizationId,
            'event' => $payload['event'] ?? 'unknown',
            'payload' => $payload
        ]);

        // TODO: Implement call event handling
        return [
            'success' => true,
            'message' => 'Call event processed'
        ];
    }

    /**
     * Validate WAHA webhook signature
     */
    public function validateWahaWebhookSignature(\Illuminate\Http\Request $request): bool
    {
        // Check if webhook signature validation is enabled
        if (!config('waha.webhook.validate_signature', false)) {
            return true; // Skip validation if not configured
        }

        $signature = $request->header('X-WAHA-Signature');
        $payload = $request->getContent();
        $secret = config('waha.webhook.secret');

        if (!$signature || !$secret) {
            return false;
        }

        $expectedSignature = hash_hmac('sha256', $payload, $secret);
        return hash_equals($expectedSignature, $signature);
    }

    /**
     * Check if message is already processed using database
     * More memory efficient than Redis keys
     */
    private function isMessageAlreadyProcessed(string $messageId, string $organizationId): bool
    {
        try {
            // Check if message exists in database
            $existingMessage = \App\Models\Message::where('metadata->waha_message_id', $messageId)
                ->where('organization_id', $organizationId)
                ->first();

            if ($existingMessage) {
                Log::info('Message already exists in database', [
                    'message_id' => $messageId,
                    'organization_id' => $organizationId,
                    'existing_message_id' => $existingMessage->id
                ]);
                return true;
            }

            // Check if webhook was processed recently (last 5 minutes)
            $recentWebhook = \App\Models\WebhookLog::where('message_id', $messageId)
                ->where('organization_id', $organizationId)
                ->where('created_at', '>=', now()->subMinutes(5))
                ->where('status', 'processed')
                ->first();

            if ($recentWebhook) {
                Log::info('Webhook already processed recently', [
                    'message_id' => $messageId,
                    'organization_id' => $organizationId,
                    'webhook_log_id' => $recentWebhook->id
                ]);
                return true;
            }

            return false;

        } catch (\Exception $e) {
            Log::error('Failed to check message processing status', [
                'message_id' => $messageId,
                'organization_id' => $organizationId,
                'error' => $e->getMessage()
            ]);
            return false; // Allow processing if check fails
        }
    }

    /**
     * Log webhook processing for deduplication
     */
    private function logWebhookProcessing(string $messageId, string $organizationId, array $messageData): void
    {
        try {
            \App\Models\WebhookLog::create([
                'message_id' => $messageId,
                'organization_id' => $organizationId,
                'webhook_type' => 'whatsapp_waha',
                'status' => 'processed',
                'payload' => $messageData,
                'processed_at' => now()
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to log webhook processing', [
                'message_id' => $messageId,
                'organization_id' => $organizationId,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Clear expired webhook deduplication keys
     */
    public function clearExpiredWebhookKeys(): int
    {
        try {
            $pattern = 'whatsapp_waha_processed:*';
            $keys = Redis::keys($pattern);
            $clearedCount = 0;

            foreach ($keys as $key) {
                $ttl = Redis::ttl($key);
                // If TTL is -1 (no expiration) or -2 (expired), delete the key
                if ($ttl === -1 || $ttl === -2) {
                    Redis::del($key);
                    $clearedCount++;
                }
            }

            Log::info('Cleared expired webhook deduplication keys', [
                'cleared_count' => $clearedCount,
                'total_keys_checked' => count($keys)
            ]);

            return $clearedCount;

        } catch (\Exception $e) {
            Log::error('Failed to clear expired webhook keys', [
                'error' => $e->getMessage()
            ]);
            return 0;
        }
    }

    /**
     * Extract organization ID from session name
     */
    public function extractOrganizationFromSession(?string $sessionName): ?string
    {
        if (!$sessionName) {
            return null;
        }

        try {
            // Find organization by session name
            $wahaSession = \App\Models\WahaSession::where('session_name', $sessionName)->first();

            if ($wahaSession) {
                return $wahaSession->organization_id;
            }

            // Try to extract from session name pattern (e.g., "session_orgId_kbId")
            if (str_starts_with($sessionName, 'session_')) {
                $parts = explode('_', $sessionName);
                if (count($parts) >= 2) {
                    $potentialOrgId = $parts[1];
                    // Verify if this is a valid organization ID
                    $organization = \App\Models\Organization::find($potentialOrgId);
                    if ($organization) {
                        return $organization->id;
                    }
                }
            }

            return null;

        } catch (\Exception $e) {
            Log::error('Failed to extract organization from session', [
                'session_name' => $sessionName,
                'error' => $e->getMessage()
            ]);
            return null;
        }
    }
}
