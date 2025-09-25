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
            'customer_name' => $this->session->customer->name,
            'message_content' => $this->message->content,
            'message_type' => $this->message->message_type,
            'sent_at' => $this->message->sent_at,
            'result' => $this->result,
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
