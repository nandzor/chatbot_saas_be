<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class WhatsAppMessageReceived
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * The message data from WAHA webhook
     */
    public array $messageData;

    /**
     * The organization ID
     */
    public string $organizationId;

    /**
     * The timestamp when message was received
     */
    public \Carbon\Carbon $receivedAt;

    /**
     * Create a new event instance.
     */
    public function __construct(array $messageData, string $organizationId)
    {
        $this->messageData = $messageData;
        $this->organizationId = $organizationId;
        $this->receivedAt = now();
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
        ];
    }
}
