<?php

namespace App\Events;

use App\Models\ChatSession;
use App\Models\Agent;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * SessionEscalated Event
 *
 * This event is fired when a chat session is escalated from bot to human agent.
 * It provides real-time updates to the frontend about escalation status.
 */
class SessionEscalated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public ChatSession $session;
    public Agent $agent;
    public string $reason;
    public array $triggers;
    public string $priority;
    public string $organizationId;

    /**
     * Create a new event instance.
     */
    public function __construct(
        ChatSession $session,
        Agent $agent,
        string $reason,
        array $triggers = [],
        string $priority = 'normal'
    ) {
        $this->session = $session;
        $this->agent = $agent;
        $this->reason = $reason;
        $this->triggers = $triggers;
        $this->priority = $priority;
        $this->organizationId = $session->organization_id;
    }

    /**
     * Get the channels the event should broadcast on.
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('organization.' . $this->organizationId),
            new PrivateChannel('inbox.' . $this->organizationId),
            new PrivateChannel('agent.' . $this->agent->id),
        ];
    }

    /**
     * Get the data to broadcast.
     */
    public function broadcastWith(): array
    {
        return [
            'session_id' => $this->session->id,
            'customer_id' => $this->session->customer_id,
            'customer_name' => $this->session->customer->name,
            'agent_id' => $this->agent->id,
            'agent_name' => $this->agent->display_name,
            'reason' => $this->reason,
            'triggers' => $this->triggers,
            'priority' => $this->priority,
            'escalated_at' => now()->toISOString(),
            'session_status' => 'escalated',
            'is_bot_session' => false,
        ];
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'session.escalated';
    }
}
