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

class OrganizationUpdated
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public Organization $organization;
    public array $changes;
    public array $metadata;

    /**
     * Create a new event instance.
     */
    public function __construct(Organization $organization, array $changes = [], array $metadata = [])
    {
        $this->organization = $organization;
        $this->changes = $changes;
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
            new PrivateChannel('organization.' . $this->organization->id),
            new PrivateChannel('admin.organizations')
        ];
    }

    /**
     * Get the data to broadcast.
     */
    public function broadcastWith(): array
    {
        return [
            'organization_id' => $this->organization->id,
            'organization_name' => $this->organization->name,
            'organization_code' => $this->organization->org_code,
            'changes' => $this->changes,
            'updated_at' => $this->organization->updated_at,
            'metadata' => $this->metadata
        ];
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'organization.updated';
    }
}
