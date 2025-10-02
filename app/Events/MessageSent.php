<?php

namespace App\Events;

use App\Models\Message;
use App\Models\ChatSession;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MessageSent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public string $messageId = '';
    public string $sessionId = '';
    public array $data = [];

    // Store message data directly to avoid serialization issues
    public array $messageData = [];
    public array $sessionData = [];

    /**
     * Create a new event instance.
     */
    public function __construct(Message $message, ChatSession $session, array $data = [])
    {
        $this->messageId = $message->id;
        $this->sessionId = $session->id;
        $this->data = $data;

        // Store message data as array to avoid serialization issues
        $this->messageData = [
            'id' => $message->id,
            'sender_type' => $message->sender_type,
            'sender_name' => $message->sender_name,
            'content' => $message->content,
            'message_type' => $message->message_type,
            'is_read' => $message->is_read,
            'created_at' => $message->created_at,
        ];

        $this->sessionData = [
            'id' => $session->id,
            'organization_id' => $session->organization_id,
            'session_data' => $session->session_data ?? [],
            'metadata' => $session->metadata ?? [],
        ];
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('conversation.' . $this->sessionId),
        ];
    }

    /**
     * Get the data to broadcast.
     *
     * @return array
     */
    public function broadcastWith(): array
    {
        return [
            'event' => 'MessageSent',
            'message_id' => $this->messageData['id'],
            'session_id' => $this->sessionData['id'],
            'sender_type' => $this->messageData['sender_type'],
            'sender_name' => $this->messageData['sender_name'],
            'message_content' => $this->messageData['content'],
            'content' => $this->messageData['content'],
            'text' => $this->messageData['content'],
            'body' => $this->messageData['content'],
            'message_type' => $this->messageData['message_type'],
            'type' => $this->messageData['message_type'],
            'is_read' => $this->messageData['is_read'],
            'created_at' => $this->messageData['created_at'],
            'sent_at' => $this->messageData['created_at'],
            'timestamp' => $this->messageData['created_at'],
            'from_me' => $this->messageData['sender_type'] === 'agent',
            'metadata' => $this->data
        ];
    }
}
