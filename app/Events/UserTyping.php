<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class UserTyping implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $userId;
    public $userName;
    public $organizationId;
    public $sessionId;
    public $isTyping;

    /**
     * Create a new event instance.
     */
    public function __construct($userId, $userName, $organizationId, $sessionId = null, $isTyping = true)
    {
        $this->userId = $userId;
        $this->userName = $userName;
        $this->organizationId = $organizationId;
        $this->sessionId = $sessionId;
        $this->isTyping = $isTyping;
    }

    /**
     * Get the channels the event should broadcast on.
     */
    public function broadcastOn(): array
    {
        $channels = [
            new PresenceChannel('presence-organization.' . $this->organizationId),
        ];

        // Also broadcast to specific conversation if sessionId provided
        if ($this->sessionId) {
            $channels[] = new PrivateChannel('conversation.' . $this->sessionId);
        }

        return $channels;
    }

    /**
     * Get the data to broadcast.
     */
    public function broadcastWith(): array
    {
        return [
            'event' => 'UserTyping',
            'user_id' => $this->userId,
            'user_name' => $this->userName,
            'organization_id' => $this->organizationId,
            'session_id' => $this->sessionId,
            'is_typing' => $this->isTyping,
            'timestamp' => now()->toISOString(),
        ];
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'UserTyping';
    }
}
