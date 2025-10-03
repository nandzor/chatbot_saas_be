<?php

namespace App\Events;

use App\Models\ChatSession;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class SessionTransferred implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $session;
    public $organizationId;
    public $transferData;

    /**
     * Create a new event instance.
     */
    public function __construct(ChatSession $session, $fromAgent, $toAgent, $reason = null)
    {
        $this->session = $session;
        $this->organizationId = $session->organization_id;
        $this->transferData = [
            'from_agent_id' => $fromAgent,
            'to_agent_id' => $toAgent,
            'reason' => $reason,
            'transferred_at' => now()->toISOString(),
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
            'event' => 'SessionTransferred',
            'session_id' => $this->session->id,
            'organization_id' => $this->organizationId,
            'from_agent_id' => $this->transferData['from_agent_id'],
            'to_agent_id' => $this->transferData['to_agent_id'],
            'reason' => $this->transferData['reason'],
            'transferred_at' => $this->transferData['transferred_at'],
            'timestamp' => now()->toISOString(),
        ];
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'SessionTransferred';
    }
}
