<?php

namespace App\Events;

use App\Models\Message;
use App\Models\ChatSession;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MessageReadEvent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $message;
    public $session;
    public $organizationId;

    /**
     * Create a new event instance.
     */
    public function __construct(Message $message, ChatSession $session)
    {
        $this->message = $message;
        $this->session = $session;
        $this->organizationId = $session->organization_id;
    }

    /**
     * Get the channels the event should broadcast on.
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('organization.' . $this->organizationId),
            new PrivateChannel('conversation.' . $this->session->id),
        ];
    }

    /**
     * Get the data to broadcast.
     */
    public function broadcastWith(): array
    {
        return [
            'message' => [
                'id' => $this->message->id,
                'is_read' => $this->message->is_read,
                'read_at' => $this->message->read_at,
            ],
            'session' => [
                'id' => $this->session->id,
                'customer_id' => $this->session->customer_id,
                'agent_id' => $this->session->agent_id,
            ],
            'organization_id' => $this->organizationId,
            'timestamp' => now()->toISOString(),
        ];
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'MessageRead';
    }
}
