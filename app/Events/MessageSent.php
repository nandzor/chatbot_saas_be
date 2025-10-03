<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MessageSent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $message;
    public $sessionId;
    public $organizationId;

    /**
     * Create a new event instance.
     */
    public function __construct($message, $sessionId, $organizationId = null)
    {
        $this->message = $message;
        $this->sessionId = $sessionId;
        $this->organizationId = $organizationId;
    }

    /**
     * Get the channels the event should broadcast on.
     */
    public function broadcastOn(): array
    {
        $channels = [
            new PrivateChannel("conversation.{$this->getSessionId()}")
        ];

        // Also broadcast to organization channel for real-time updates
        if ($this->getOrganizationId()) {
            $channels[] = new PrivateChannel("organization.{$this->getOrganizationId()}");
        }

        return $channels;
    }

    /**
     * Get session ID as string
     */
    private function getSessionId(): string
    {
        if (is_string($this->sessionId)) {
            return $this->sessionId;
        } elseif (is_object($this->sessionId) && isset($this->sessionId->id)) {
            return $this->sessionId->id;
        } else {
            return 'unknown';
        }
    }

    /**
     * Get organization ID as string
     */
    private function getOrganizationId(): ?string
    {
        if (is_string($this->organizationId)) {
            return $this->organizationId;
        } elseif (is_array($this->organizationId) && isset($this->organizationId['organization_id'])) {
            return $this->organizationId['organization_id'];
        } elseif (is_object($this->organizationId) && isset($this->organizationId->organization_id)) {
            return $this->organizationId->organization_id;
        } else {
            return null;
        }
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'MessageSent';
    }

    /**
     * Get the data to broadcast.
     */
    public function broadcastWith(): array
    {
        return [
            'message' => $this->message,
            'session_id' => $this->sessionId,
            'timestamp' => now()->toISOString(),
        ];
    }
}
