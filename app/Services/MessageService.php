<?php

namespace App\Services;

use App\Models\Message;
use App\Models\ChatSession;
use App\Events\MessageProcessed;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class MessageService
{
    /**
     * Send a message in a conversation
     */
    public function sendMessage(string $sessionId, string $organizationId, array $data): Message
    {
        return DB::transaction(function () use ($sessionId, $organizationId, $data) {
            // Validate session exists and belongs to organization
            $session = ChatSession::where('id', $sessionId)
                ->where('organization_id', $organizationId)
                ->first();

            if (!$session) {
                throw new \Exception('Session not found or access denied');
            }

            // Create the message
            $message = Message::create([
                'id' => Str::uuid(),
                'session_id' => $sessionId,
                'organization_id' => $organizationId,
                'sender_type' => $data['sender_type'],
                'sender_id' => $data['sender_id'] ?? null,
                'sender_name' => $data['sender_name'] ?? null,
                'message_text' => $data['message_text'],
                'message_type' => $data['message_type'] ?? 'text',
                'media_url' => $data['media_url'] ?? null,
                'media_type' => $data['media_type'] ?? null,
                'media_size' => $data['media_size'] ?? null,
                'media_metadata' => $data['media_metadata'] ?? [],
                'thumbnail_url' => $data['thumbnail_url'] ?? null,
                'quick_replies' => $data['quick_replies'] ?? null,
                'buttons' => $data['buttons'] ?? null,
                'template_data' => $data['template_data'] ?? null,
                'reply_to_message_id' => $data['reply_to_message_id'] ?? null,
                'metadata' => $data['metadata'] ?? [],
                'created_at' => now(),
            ]);

            // Update session statistics
            $this->updateSessionStats($session, $data['sender_type']);

            // Update session activity
            $session->updateActivity();

            // Fire message processed event for real-time updates
            event(new MessageProcessed($session, $message, ['status' => 'sent']));

            Log::info('Message sent successfully', [
                'message_id' => $message->id,
                'session_id' => $sessionId,
                'sender_type' => $data['sender_type']
            ]);

            return $message->fresh(['customer', 'agent']);
        });
    }

    /**
     * Update session statistics after sending message
     */
    private function updateSessionStats(ChatSession $session, string $senderType): void
    {
        $session->increment('total_messages');

        switch ($senderType) {
            case 'customer':
                $session->increment('customer_messages');
                break;
            case 'bot':
                $session->increment('bot_messages');
                break;
            case 'agent':
                $session->increment('agent_messages');
                break;
        }

        // Set first response time if this is the first non-customer message
        if (!$session->first_response_at && $senderType !== 'customer') {
            $firstResponseTime = $session->started_at->diffInSeconds(now());
            $session->update([
                'first_response_at' => now(),
                'response_time_avg' => $firstResponseTime
            ]);
        }
    }

    /**
     * Mark message as read
     */
    public function markAsRead(string $messageId, string $organizationId): Message
    {
        $message = Message::where('id', $messageId)
            ->where('organization_id', $organizationId)
            ->first();

        if (!$message) {
            throw new \Exception('Message not found or access denied');
        }

        if (!$message->is_read) {
            $message->markAsRead();

            // Fire read event for real-time updates
            event(new \App\Events\MessageReadEvent($message, $message->chatSession));
        }

        return $message;
    }

    /**
     * Mark message as delivered
     */
    public function markAsDelivered(string $messageId, string $organizationId): Message
    {
        $message = Message::where('id', $messageId)
            ->where('organization_id', $organizationId)
            ->first();

        if (!$message) {
            throw new \Exception('Message not found or access denied');
        }

        $message->markAsDelivered();

        return $message;
    }

    /**
     * Mark message as failed
     */
    public function markAsFailed(string $messageId, string $organizationId, ?string $reason = null): Message
    {
        $message = Message::where('id', $messageId)
            ->where('organization_id', $organizationId)
            ->first();

        if (!$message) {
            throw new \Exception('Message not found or access denied');
        }

        $message->markAsFailed($reason);

        return $message;
    }

    /**
     * Get message with relationships
     */
    public function getMessage(string $messageId, string $organizationId): ?Message
    {
        return Message::where('id', $messageId)
            ->where('organization_id', $organizationId)
            ->with(['customer', 'agent', 'replyTo', 'chatSession'])
            ->first();
    }

    /**
     * Search messages in a session
     */
    public function searchMessages(string $sessionId, string $query, array $filters = [], int $perPage = 20)
    {
        $queryBuilder = Message::where('session_id', $sessionId)
            ->where('message_text', 'LIKE', "%{$query}%");

        // Apply filters
        if (!empty($filters['sender_type'])) {
            $queryBuilder->where('sender_type', $filters['sender_type']);
        }

        if (!empty($filters['message_type'])) {
            $queryBuilder->where('message_type', $filters['message_type']);
        }

        if (!empty($filters['date_from'])) {
            $queryBuilder->where('created_at', '>=', $filters['date_from']);
        }

        if (!empty($filters['date_to'])) {
            $queryBuilder->where('created_at', '<=', $filters['date_to']);
        }

        return $queryBuilder
            ->with(['customer', 'agent', 'botPersonality'])
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);
    }

    /**
     * Get message statistics for a session
     */
    public function getMessageStats(string $sessionId, string $organizationId): array
    {
        $messages = Message::where('session_id', $sessionId)
            ->where('organization_id', $organizationId)
            ->get();

        return [
            'total_messages' => $messages->count(),
            'customer_messages' => $messages->where('sender_type', 'customer')->count(),
            'bot_messages' => $messages->where('sender_type', 'bot')->count(),
            'agent_messages' => $messages->where('sender_type', 'agent')->count(),
            'unread_messages' => $messages->where('is_read', false)->count(),
            'failed_messages' => $messages->whereNotNull('failed_at')->count(),
            'avg_response_time' => $this->calculateAvgResponseTime($messages),
        ];
    }

    /**
     * Calculate average response time
     */
    private function calculateAvgResponseTime($messages): ?float
    {
        $responseTimes = [];
        $lastCustomerMessage = null;

        foreach ($messages->sortBy('created_at') as $message) {
            if ($message->sender_type === 'customer') {
                $lastCustomerMessage = $message;
            } elseif ($lastCustomerMessage && in_array($message->sender_type, ['bot', 'agent'])) {
                $responseTime = $lastCustomerMessage->created_at->diffInSeconds($message->created_at);
                $responseTimes[] = $responseTime;
                $lastCustomerMessage = null;
            }
        }

        return !empty($responseTimes) ? array_sum($responseTimes) / count($responseTimes) : null;
    }

    /**
     * Send typing indicator
     */
    public function sendTypingIndicator(string $sessionId, string $organizationId, string $userId, string $userName, bool $isTyping = true): void
    {
        try {
            $typingKey = "typing_users_session_{$sessionId}";
            $typingUsers = cache()->get($typingKey, []);

            if ($isTyping) {
                // Add or update typing indicator
                $typingUsers[$userId] = [
                    'user_name' => $userName,
                    'is_typing' => true,
                    'timestamp' => now()->timestamp
                ];
            } else {
                // Remove typing indicator
                unset($typingUsers[$userId]);
            }

            // Store in cache for 1 minute
            cache()->put($typingKey, $typingUsers, 60);

            // Broadcast typing indicator event
            broadcast(new \App\Events\TypingIndicatorEvent(
                $sessionId,
                $organizationId,
                $userId,
                $userName,
                $isTyping
            ));

            // Send typing indicator to WAHA if session is WhatsApp
            $this->sendTypingIndicatorToWaha($sessionId, $isTyping);

        } catch (\Exception $e) {
            Log::error('Failed to send typing indicator', [
                'session_id' => $sessionId,
                'user_id' => $userId,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Send typing indicator to WAHA
     */
    private function sendTypingIndicatorToWaha(string $sessionId, bool $isTyping): void
    {
        try {
            // Get session information
            $session = \App\Models\ChatSession::with(['customer', 'channelConfig'])->find($sessionId);
            if (!$session) {
                Log::warning('Session not found for typing indicator', ['session_id' => $sessionId]);
                return;
            }

            // Check if session is WhatsApp
            if ($session->channelConfig && $session->channelConfig->channel === 'whatsapp') {
                $wahaSessionId = $session->channelConfig->settings['waha_session_id'] ?? null;
                $customerPhone = $session->customer->phone ?? null;

                if ($wahaSessionId && $customerPhone) {
                    // Initialize WAHA service
                    $wahaService = new \App\Services\Waha\WahaService();
                    
                    // Send typing indicator to WAHA
                    $wahaService->sendTypingIndicator($wahaSessionId, $customerPhone, $isTyping);
                    
                    Log::info('Typing indicator sent to WAHA', [
                        'session_id' => $sessionId,
                        'waha_session_id' => $wahaSessionId,
                        'customer_phone' => $customerPhone,
                        'is_typing' => $isTyping
                    ]);
                } else {
                    Log::warning('Missing WAHA session ID or customer phone for typing indicator', [
                        'session_id' => $sessionId,
                        'waha_session_id' => $wahaSessionId,
                        'customer_phone' => $customerPhone
                    ]);
                }
            }

        } catch (\Exception $e) {
            Log::error('Failed to send typing indicator to WAHA', [
                'session_id' => $sessionId,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Get unread message count for a session
     */
    public function getUnreadCount(string $sessionId): int
    {
        return Message::where('session_id', $sessionId)
            ->where('is_read', false)
            ->where('sender_type', '!=', 'agent') // Don't count agent messages as unread
            ->count();
    }

    /**
     * Get session messages with relations
     */
    public function getSessionMessages(string $sessionId, $request, array $filters = [], array $relations = [])
    {
        $query = Message::where('session_id', $sessionId);

        // Apply filters
        if (!empty($filters['sender_type'])) {
            $query->where('sender_type', $filters['sender_type']);
        }

        if (!empty($filters['message_type'])) {
            $query->where('message_type', $filters['message_type']);
        }

        if (!empty($filters['date_from'])) {
            $query->where('created_at', '>=', $filters['date_from']);
        }

        if (!empty($filters['date_to'])) {
            $query->where('created_at', '<=', $filters['date_to']);
        }

        if (!empty($filters['search'])) {
            $query->where('message_text', 'LIKE', "%{$filters['search']}%");
        }

        // Add relations
        if (!empty($relations)) {
            $query->with($relations);
        }

        $perPage = $request->get('per_page', 20);
        $sortBy = $request->get('sort_by', 'created_at');
        $sortDirection = $request->get('sort_direction', 'asc');

        return $query
            ->orderBy($sortBy, $sortDirection)
            ->paginate($perPage);
    }

    /**
     * Get typing users for a session
     */
    public function getTypingUsers(string $sessionId): array
    {
        try {
            // Get typing indicators from cache or database
            $typingKey = "typing_users_session_{$sessionId}";
            $typingUsers = cache()->get($typingKey, []);

            // Filter out expired typing indicators (older than 5 seconds)
            $currentTime = now()->timestamp;
            $validTypingUsers = [];

            foreach ($typingUsers as $userId => $typingData) {
                if (isset($typingData['timestamp']) && ($currentTime - $typingData['timestamp']) < 5) {
                    $validTypingUsers[] = [
                        'user_id' => $userId,
                        'user_name' => $typingData['user_name'] ?? 'Unknown User',
                        'is_typing' => $typingData['is_typing'] ?? false,
                        'timestamp' => $typingData['timestamp']
                    ];
                }
            }

            // Clean up expired entries
            if (count($validTypingUsers) !== count($typingUsers)) {
                $cleanedTypingUsers = [];
                foreach ($validTypingUsers as $user) {
                    $cleanedTypingUsers[$user['user_id']] = [
                        'user_name' => $user['user_name'],
                        'is_typing' => $user['is_typing'],
                        'timestamp' => $user['timestamp']
                    ];
                }
                cache()->put($typingKey, $cleanedTypingUsers, 60); // Cache for 1 minute
            }

            return $validTypingUsers;

        } catch (\Exception $e) {
            Log::error('Failed to get typing users', [
                'session_id' => $sessionId,
                'error' => $e->getMessage()
            ]);
            return [];
        }
    }

}
