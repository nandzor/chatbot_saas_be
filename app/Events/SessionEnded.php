<?php

namespace App\Events;

use App\Models\ChatSession;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class SessionEnded implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $session;
    public $organizationId;
    public $endData;

    /**
     * Create a new event instance.
     */
    public function __construct(ChatSession $session, $reason = null, $endedBy = null)
    {
        $this->session = $session;
        $this->organizationId = $session->organization_id;
        $this->endData = [
            'reason' => $reason,
            'ended_by' => $endedBy,
            'ended_at' => now()->toISOString(),
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
            'event' => 'SessionEnded',
            'session_id' => $this->session->id,
            'organization_id' => $this->organizationId,
            'status' => 'ended',
            'ended_at' => $this->endData['ended_at'],
            'reason' => $this->endData['reason'],
            'ended_by' => $this->endData['ended_by'],
            'timestamp' => now()->toISOString(),
        ];
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'SessionEnded';
    }
}
