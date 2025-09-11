<?php

namespace App\Events;

use App\Models\Organization;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class OrganizationDeleted
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public string $organizationId;
    public string $organizationName;
    public string $organizationCode;
    public string $deletionType; // 'soft' or 'hard'
    public array $metadata;

    /**
     * Create a new event instance.
     */
    public function __construct(
        string $organizationId,
        string $organizationName,
        string $organizationCode,
        string $deletionType = 'soft',
        array $metadata = []
    ) {
        $this->organizationId = $organizationId;
        $this->organizationName = $organizationName;
        $this->organizationCode = $organizationCode;
        $this->deletionType = $deletionType;
        $this->metadata = $metadata;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('admin.organizations')
        ];
    }

    /**
     * Get the data to broadcast.
     */
    public function broadcastWith(): array
    {
        return [
            'organization_id' => $this->organizationId,
            'organization_name' => $this->organizationName,
            'organization_code' => $this->organizationCode,
            'deletion_type' => $this->deletionType,
            'deleted_at' => now(),
            'metadata' => $this->metadata
        ];
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'organization.deleted';
    }
}
