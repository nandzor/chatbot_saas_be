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
    public function markAsFailed(string $messageId, string $organizationId, string $reason = null): Message
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
    public function searchMessages(string $sessionId, string $organizationId, string $searchTerm): \Illuminate\Database\Eloquent\Collection
    {
        return Message::where('session_id', $sessionId)
            ->where('organization_id', $organizationId)
            ->where('message_text', 'LIKE', "%{$searchTerm}%")
            ->with(['customer', 'agent'])
            ->orderBy('created_at', 'desc')
            ->get();
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
        // Broadcast typing indicator event
        broadcast(new \App\Events\TypingIndicatorEvent(
            $sessionId,
            $organizationId,
            $userId,
            $userName,
            $isTyping
        ));
    }
}
