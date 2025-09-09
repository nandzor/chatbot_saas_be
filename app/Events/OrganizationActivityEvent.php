<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class OrganizationActivityEvent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $organizationId;
    public $activityType;
    public $activityData;
    public $userId;
    public $timestamp;

    /**
     * Create a new event instance.
     */
    public function __construct(
        string $organizationId,
        string $activityType,
        array $activityData,
        ?string $userId = null
    ) {
        $this->organizationId = $organizationId;
        $this->activityType = $activityType;
        $this->activityData = $activityData;
        $this->userId = $userId;
        $this->timestamp = now()->toISOString();
    }

    /**
     * Get the channels the event should broadcast on.
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('organization.' . $this->organizationId),
        ];
    }

    /**
     * Get the data to broadcast.
     */
    public function broadcastWith(): array
    {
        return [
            'organization_id' => $this->organizationId,
            'activity_type' => $this->activityType,
            'activity_data' => $this->activityData,
            'user_id' => $this->userId,
            'timestamp' => $this->timestamp,
        ];
    }

    /**
     * Get the broadcast event name.
     */
    public function broadcastAs(): string
    {
        return 'organization.activity';
    }
}
