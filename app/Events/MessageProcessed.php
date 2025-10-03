<?php

namespace App\Events;

use App\Models\ChatSession;
use App\Models\Message;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;

class MessageProcessed implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets;

    /**
     * The processing result
     */
    public array $result;

    /**
     * The organization ID
     */
    public string $organizationId;

    // Store data as arrays to avoid serialization issues
    public array $messageData;
    public array $sessionData;

    /**
     * Create a new event instance.
     */
    public function __construct(ChatSession $session, Message $message, array $result)
    {
        $this->result = $result;
        $this->organizationId = $session->organization_id;

        // Store data as arrays to avoid serialization issues
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
            new PrivateChannel('organization.' . $this->organizationId),
            new PrivateChannel('inbox.' . $this->organizationId),
            new PrivateChannel('conversation.' . $this->sessionData['id']),
        ];
    }

    /**
     * Get the data to broadcast.
     */
    public function broadcastWith(): array
    {
        return [
            'event' => 'MessageProcessed',
            'session_id' => $this->sessionData['id'],
            'message_id' => $this->messageData['id'],
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
            'result' => $this->result,
            'organization_id' => $this->organizationId,
        ];
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'MessageProcessed';
    }
}
