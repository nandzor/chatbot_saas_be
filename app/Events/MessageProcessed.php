<?php

namespace App\Events;

use App\Models\ChatSession;
use App\Models\Message;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MessageProcessed implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * The chat session
     */
    public ChatSession $session;

    /**
     * The processed message
     */
    public Message $message;

    /**
     * The processing result
     */
    public array $result;

    /**
     * The organization ID
     */
    public string $organizationId;

    /**
     * Create a new event instance.
     */
    public function __construct(ChatSession $session, Message $message, array $result)
    {
        $this->session = $session;
        $this->message = $message;
        $this->result = $result;
        $this->organizationId = $session->organization_id;
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
            new PrivateChannel('conversation.' . $this->session->id),
        ];
    }

    /**
     * Get the data to broadcast.
     */
    public function broadcastWith(): array
    {
        return [
            'session_id' => $this->session->id,
            'message_id' => $this->message->id,
            'customer_name' => $this->session->customer->name ?? 'Unknown Customer',
            'message_content' => $this->message->message_text ?? $this->message->content,
            'message_type' => $this->message->message_type,
            'sender_type' => $this->message->sender_type,
            'sender_name' => $this->message->sender_name,
            'sent_at' => ($this->message->created_at ?? $this->message->sent_at)?->toISOString(),
            'is_read' => $this->message->is_read,
            'delivered_at' => $this->message->delivered_at?->toISOString(),
            'media_url' => $this->message->media_url,
            'media_type' => $this->message->media_type,
            'result' => $this->result,
            'organization_id' => $this->organizationId,
            'timestamp' => now()->toISOString(),
        ];
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'message.processed';
    }
}
