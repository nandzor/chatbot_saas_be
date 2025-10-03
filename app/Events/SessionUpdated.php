<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class SessionUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $session;
    public $eventType;
    public $data;

    /**
     * Create a new event instance.
     */
    public function __construct($session, string $eventType, array $data = [])
    {
        $this->session = $session;
        $this->eventType = $eventType;
        $this->data = $data;
    }

    /**
     * Get the channels the event should broadcast on.
     */
    public function broadcastOn(): array
    {
        $channels = [
            new PrivateChannel("conversation.{$this->session->id}")
        ];

        // Also broadcast to organization channel
        if ($this->session->organization_id) {
            $channels[] = new PrivateChannel("organization.{$this->session->organization_id}");
        }

        return $channels;
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'SessionUpdated';
    }

    /**
     * Get the data to broadcast.
     */
    public function broadcastWith(): array
    {
        return [
            'session' => [
                'id' => $this->session->id,
                'status' => $this->session->status,
                'assigned_to' => $this->session->assigned_to,
                'organization_id' => $this->session->organization_id,
            ],
            'event_type' => $this->eventType,
            'data' => $this->data,
            'timestamp' => now()->toISOString(),
        ];
    }
}
