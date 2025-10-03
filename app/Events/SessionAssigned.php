<?php

namespace App\Events;

use App\Models\ChatSession;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class SessionAssigned implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $session;
    public $organizationId;
    public $assignedAgent;

    /**
     * Create a new event instance.
     */
    public function __construct(ChatSession $session, $fromAgent = null)
    {
        $this->session = $session;
        $this->organizationId = $session->organization_id;
        $this->assignedAgent = [
            'id' => $session->agent_id,
            'name' => $session->agent->name ?? 'Unassigned Agent',
            'assigned_at' => now()->toISOString(),
            'from_agent_id' => $fromAgent ?? null,
        ];
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
            'event' => 'SessionAssigned',
            'session_id' => $this->session->id,
            'organization_id' => $this->organizationId,
            'agent_id' => $this->session->agent_id,
            'assigned_at' => $this->assignedAgent['assigned_at'],
            'agent_name' => $this->assignedAgent['name'],
            'timestamp' => now()->toISOString(),
        ];
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'SessionAssigned';
    }
}
