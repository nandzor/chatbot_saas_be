<?php

namespace App\Models;

use App\Traits\BelongsToOrganization;
use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ChatSession extends Model
{
    use HasFactory, HasUuid, BelongsToOrganization;

    protected $fillable = [
        'organization_id',
        'customer_id',
        'channel_config_id',
        'agent_id',
        'assigned_agent_id',
        'session_token',
        'session_type',
        'started_at',
        'ended_at',
        'last_activity_at',
        'first_response_at',
        'is_active',
        'is_bot_session',
        'handling_mode',
        'session_status',
        'priority',
        'handover_reason',
        'handover_at',
        'total_messages',
        'customer_messages',
        'bot_messages',
        'agent_messages',
        'response_time_avg',
        'resolution_time',
        'wait_time',
        'satisfaction_rating',
        'feedback_text',
        'feedback_tags',
        'csat_submitted_at',
        'intent',
        'category',
        'subcategory',
        'tags',
        'is_resolved',
        'resolved_at',
        'resolution_type',
        'resolution_notes',
        'sentiment_analysis',
        'ai_summary',
        'topics_discussed',
        'session_data',
        'metadata',
        // Human Agent Integration fields
        'bot_personality_id',
        'waha_session_id',
        'bot_context',
        'last_bot_response_at',
        'bot_message_count',
        'requires_human',
        'human_requested_at',
        'assigned_at',
        'agent_started_at',
        'agent_ended_at',
        'agent_message_count',
        'response_time_seconds',
        'resolution_time_seconds',
        'escalated_from_agent_id',
        'transferred_to_agent_id',
        'escalation_reason',
        'transfer_notes',
        'customer_name',
        'customer_phone',
        'customer_email',
        'customer_metadata',
    ];

    protected $casts = [
        'started_at' => 'datetime',
        'ended_at' => 'datetime',
        'last_activity_at' => 'datetime',
        'first_response_at' => 'datetime',
        'handover_at' => 'datetime',
        'is_active' => 'boolean',
        'is_bot_session' => 'boolean',
        'csat_submitted_at' => 'datetime',
        'tags' => 'array',
        'is_resolved' => 'boolean',
        'resolved_at' => 'datetime',
        'sentiment_analysis' => 'array',
        'topics_discussed' => 'array',
        'session_data' => 'array',
        'metadata' => 'array',
        'feedback_tags' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        // Human Agent Integration casts
        'bot_context' => 'array',
        'last_bot_response_at' => 'datetime',
        'bot_message_count' => 'integer',
        'requires_human' => 'boolean',
        'human_requested_at' => 'datetime',
        'assigned_at' => 'datetime',
        'agent_started_at' => 'datetime',
        'agent_ended_at' => 'datetime',
        'agent_message_count' => 'integer',
        'response_time_seconds' => 'integer',
        'resolution_time_seconds' => 'integer',
        'customer_metadata' => 'array',
    ];

    /**
     * Get the customer for this chat session.
     */
    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    /**
     * Get the agent assigned to this chat session.
     */
    public function agent(): BelongsTo
    {
        return $this->belongsTo(Agent::class);
    }

    /**
     * Get the assigned agent for this chat session (human agent integration).
     */
    public function assignedAgent(): BelongsTo
    {
        return $this->belongsTo(Agent::class, 'assigned_agent_id');
    }

    /**
     * Get the bot personality for this chat session.
     */
    public function botPersonality(): BelongsTo
    {
        return $this->belongsTo(BotPersonality::class);
    }

    /**
     * Get the WAHA session for this chat session.
     */
    public function wahaSession(): BelongsTo
    {
        return $this->belongsTo(WahaSession::class);
    }

    /**
     * Get the escalated from agent.
     */
    public function escalatedFromAgent(): BelongsTo
    {
        return $this->belongsTo(Agent::class, 'escalated_from_agent_id');
    }

    /**
     * Get the transferred to agent.
     */
    public function transferredToAgent(): BelongsTo
    {
        return $this->belongsTo(Agent::class, 'transferred_to_agent_id');
    }

    /**
     * Get the channel configuration for this chat session.
     */
    public function channelConfig(): BelongsTo
    {
        return $this->belongsTo(ChannelConfig::class);
    }

    /**
     * Get the bot personality for this chat session.
     */
    public function botPersonality(): BelongsTo
    {
        return $this->belongsTo(BotPersonality::class);
    }

    /**
     * Get the messages for this chat session.
     */
    public function messages(): HasMany
    {
        return $this->hasMany(Message::class, 'session_id');
    }

    /**
     * Get customer messages only.
     */
    public function customerMessages(): HasMany
    {
        return $this->messages()->where('sender_type', 'customer');
    }

    /**
     * Get bot messages only.
     */
    public function botMessages(): HasMany
    {
        return $this->messages()->where('sender_type', 'bot');
    }

    /**
     * Get agent messages only.
     */
    public function agentMessages(): HasMany
    {
        return $this->messages()->where('sender_type', 'agent');
    }

    /**
     * Get the first message of the session.
     */
    public function firstMessage()
    {
        return $this->messages()->orderBy('created_at')->first();
    }

    /**
     * Get the last message of the session.
     */
    public function lastMessage()
    {
        return $this->messages()->orderBy('created_at', 'desc')->first();
    }

    /**
     * Check if session is currently active.
     */
    public function isActive(): bool
    {
        return $this->is_active;
    }

    /**
     * Check if session is resolved.
     */
    public function isResolved(): bool
    {
        return $this->is_resolved;
    }

    /**
     * Check if session is handled by bot only.
     */
    public function isBotSession(): bool
    {
        return $this->is_bot_session;
    }

    /**
     * Check if session has been handed over to agent.
     */
    public function hasHandover(): bool
    {
        return !is_null($this->agent_id) && !is_null($this->handover_at);
    }

    /**
     * Check if session has feedback.
     */
    public function hasFeedback(): bool
    {
        return !is_null($this->satisfaction_rating) || !is_null($this->feedback_text);
    }

    /**
     * Get session duration in minutes.
     */
    public function getDurationAttribute(): ?int
    {
        if (!$this->started_at || !$this->ended_at) {
            return null;
        }

        return $this->started_at->diffInMinutes($this->ended_at);
    }

    /**
     * Get waiting time before first response.
     */
    public function getWaitTimeAttribute(): ?int
    {
        if (!$this->started_at || !$this->first_response_at) {
            return null;
        }

        return $this->started_at->diffInSeconds($this->first_response_at);
    }

    /**
     * Get satisfaction rating as percentage.
     */
    public function getSatisfactionPercentageAttribute(): int
    {
        if (!$this->satisfaction_rating) {
            return 0;
        }

        return ($this->satisfaction_rating / 5) * 100;
    }

    /**
     * End the chat session.
     */
    public function endSession(string $resolutionType = null, string $notes = null): void
    {
        $updates = [
            'is_active' => false,
            'ended_at' => now(),
            'last_activity_at' => now(),
        ];

        if ($resolutionType) {
            $updates['resolution_type'] = $resolutionType;
            $updates['is_resolved'] = true;
            $updates['resolved_at'] = now();
        }

        if ($notes) {
            $updates['resolution_notes'] = $notes;
        }

        $this->update($updates);

        // Update agent's active chat count
        if ($this->agent) {
            $this->agent->completeChat($this, $this->is_resolved);
        }
    }

    /**
     * Handover session to an agent.
     */
    public function handoverToAgent(Agent $agent, string $reason = null): bool
    {
        if (!$agent->canHandleMoreChats()) {
            return false;
        }

        $this->update([
            'agent_id' => $agent->id,
            'is_bot_session' => false,
            'handover_at' => now(),
            'handover_reason' => $reason,
        ]);

        $agent->assignChat($this);

        return true;
    }

    /**
     * Record feedback for the session.
     */
    public function recordFeedback(int $rating, string $text = null, array $tags = []): void
    {
        $this->update([
            'satisfaction_rating' => $rating,
            'feedback_text' => $text,
            'feedback_tags' => $tags,
            'csat_submitted_at' => now(),
        ]);
    }

    /**
     * Update activity timestamp.
     */
    public function updateActivity(): void
    {
        $this->update(['last_activity_at' => now()]);
    }

    /**
     * Scope for active sessions.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope for resolved sessions.
     */
    public function scopeResolved($query)
    {
        return $query->where('is_resolved', true);
    }

    /**
     * Scope for bot sessions.
     */
    public function scopeBotSessions($query)
    {
        return $query->where('is_bot_session', true);
    }

    /**
     * Scope for agent sessions.
     */
    public function scopeAgentSessions($query)
    {
        return $query->where('is_bot_session', false)->whereNotNull('agent_id');
    }

    /**
     * Scope for sessions with handover.
     */
    public function scopeWithHandover($query)
    {
        return $query->whereNotNull('handover_at');
    }

    /**
     * Scope for sessions with feedback.
     */
    public function scopeWithFeedback($query)
    {
        return $query->whereNotNull('satisfaction_rating');
    }

    /**
     * Scope for sessions within date range.
     */
    public function scopeDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('started_at', [$startDate, $endDate]);
    }

    /**
     * Scope for sessions by channel.
     */
    public function scopeByChannel($query, string $channel)
    {
        return $query->whereHas('channelConfig', function ($q) use ($channel) {
            $q->where('channel', $channel);
        });
    }

    /**
     * Scope for high satisfaction sessions.
     */
    public function scopeHighSatisfaction($query, int $minRating = 4)
    {
        return $query->where('satisfaction_rating', '>=', $minRating);
    }

    /**
     * Scope for low satisfaction sessions.
     */
    public function scopeLowSatisfaction($query, int $maxRating = 2)
    {
        return $query->where('satisfaction_rating', '<=', $maxRating);
    }

    /**
     * Order by last activity.
     */
    public function scopeByLastActivity($query)
    {
        return $query->orderBy('last_activity_at', 'desc');
    }

    /**
     * Order by session start time.
     */
    public function scopeByStartTime($query)
    {
        return $query->orderBy('started_at', 'desc');
    }

    // ====================================================================
    // HUMAN AGENT INTEGRATION METHODS
    // ====================================================================

    /**
     * Check if session requires human intervention.
     */
    public function requiresHuman(): bool
    {
        return $this->requires_human;
    }

    /**
     * Check if session is assigned to a human agent.
     */
    public function isAssignedToAgent(): bool
    {
        return !is_null($this->assigned_agent_id);
    }

    /**
     * Check if session is being handled by a human agent.
     */
    public function isHandledByAgent(): bool
    {
        return $this->session_status === 'agent_handling';
    }

    /**
     * Check if session has been escalated.
     */
    public function isEscalated(): bool
    {
        return $this->session_status === 'escalated';
    }

    /**
     * Request human intervention.
     */
    public function requestHumanIntervention(string $reason = null): void
    {
        $this->update([
            'requires_human' => true,
            'human_requested_at' => now(),
            'session_status' => 'agent_assigned',
        ]);

        // Create queue entry for agent assignment
        AgentQueue::create([
            'organization_id' => $this->organization_id,
            'chat_session_id' => $this->id,
            'queue_type' => 'inbox',
            'priority' => $this->priority,
            'status' => 'pending',
            'queued_at' => now(),
            'assignment_notes' => $reason,
            'customer_context' => [
                'name' => $this->customer_name,
                'phone' => $this->customer_phone,
                'email' => $this->customer_email,
                'metadata' => $this->customer_metadata,
            ],
            'bot_context' => $this->bot_context,
        ]);
    }

    /**
     * Assign session to a human agent.
     */
    public function assignToAgent(Agent $agent): bool
    {
        if (!$agent->canHandleMoreChats()) {
            return false;
        }

        $this->update([
            'assigned_agent_id' => $agent->id,
            'assigned_at' => now(),
            'session_status' => 'agent_assigned',
        ]);

        // Update agent queue
        $queueItem = AgentQueue::where('chat_session_id', $this->id)
            ->where('status', 'pending')
            ->first();

        if ($queueItem) {
            $queueItem->update([
                'agent_id' => $agent->id,
                'status' => 'assigned',
                'assigned_at' => now(),
            ]);
        }

        // Update agent availability
        $agent->incrementActiveChats();

        return true;
    }

    /**
     * Start handling by human agent.
     */
    public function startAgentHandling(): void
    {
        $this->update([
            'session_status' => 'agent_handling',
            'agent_started_at' => now(),
        ]);

        // Update agent queue
        $queueItem = AgentQueue::where('chat_session_id', $this->id)
            ->where('agent_id', $this->assigned_agent_id)
            ->first();

        if ($queueItem) {
            $queueItem->markAsInProgress();
        }
    }

    /**
     * End agent handling.
     */
    public function endAgentHandling(): void
    {
        $this->update([
            'session_status' => 'resolved',
            'agent_ended_at' => now(),
            'is_resolved' => true,
            'resolved_at' => now(),
        ]);

        // Update agent queue
        $queueItem = AgentQueue::where('chat_session_id', $this->id)
            ->where('agent_id', $this->assigned_agent_id)
            ->first();

        if ($queueItem) {
            $queueItem->markAsCompleted();
        }

        // Update agent availability
        if ($this->assignedAgent) {
            $this->assignedAgent->decrementActiveChats();
        }
    }

    /**
     * Escalate session to another agent.
     */
    public function escalateToAgent(Agent $newAgent, string $reason): bool
    {
        if (!$newAgent->canHandleMoreChats()) {
            return false;
        }

        $oldAgent = $this->assignedAgent;

        $this->update([
            'escalated_from_agent_id' => $this->assigned_agent_id,
            'assigned_agent_id' => $newAgent->id,
            'escalation_reason' => $reason,
            'session_status' => 'escalated',
            'assigned_at' => now(),
        ]);

        // Update agent availability
        if ($oldAgent) {
            $oldAgent->decrementActiveChats();
        }
        $newAgent->incrementActiveChats();

        // Create new queue entry for escalation
        AgentQueue::create([
            'organization_id' => $this->organization_id,
            'agent_id' => $newAgent->id,
            'chat_session_id' => $this->id,
            'queue_type' => 'escalated',
            'priority' => 'high',
            'status' => 'assigned',
            'queued_at' => now(),
            'assigned_at' => now(),
            'assignment_notes' => "Escalated from {$oldAgent->display_name}: {$reason}",
        ]);

        return true;
    }

    /**
     * Transfer session to another agent.
     */
    public function transferToAgent(Agent $newAgent, string $notes = null): bool
    {
        if (!$newAgent->canHandleMoreChats()) {
            return false;
        }

        $oldAgent = $this->assignedAgent;

        $this->update([
            'transferred_to_agent_id' => $newAgent->id,
            'assigned_agent_id' => $newAgent->id,
            'transfer_notes' => $notes,
            'assigned_at' => now(),
        ]);

        // Update agent availability
        if ($oldAgent) {
            $oldAgent->decrementActiveChats();
        }
        $newAgent->incrementActiveChats();

        // Create new queue entry for transfer
        AgentQueue::create([
            'organization_id' => $this->organization_id,
            'agent_id' => $newAgent->id,
            'chat_session_id' => $this->id,
            'queue_type' => 'transferred',
            'priority' => $this->priority,
            'status' => 'assigned',
            'queued_at' => now(),
            'assigned_at' => now(),
            'assignment_notes' => $notes,
        ]);

        return true;
    }

    /**
     * Get session status color for UI.
     */
    public function getStatusColorAttribute(): string
    {
        return match($this->session_status) {
            'bot_handled' => 'blue',
            'agent_assigned' => 'yellow',
            'agent_handling' => 'green',
            'escalated' => 'orange',
            'resolved' => 'gray',
            'closed' => 'red',
            default => 'gray',
        };
    }

    /**
     * Get priority color for UI.
     */
    public function getPriorityColorAttribute(): string
    {
        return match($this->priority) {
            'urgent' => 'red',
            'high' => 'orange',
            'medium' => 'yellow',
            'low' => 'green',
            default => 'gray',
        };
    }

    /**
     * Get handling mode color for UI.
     */
    public function getHandlingModeColorAttribute(): string
    {
        return match($this->handling_mode) {
            'bot_only' => 'blue',
            'human_only' => 'green',
            'hybrid' => 'purple',
            default => 'gray',
        };
    }

    /**
     * Scope for sessions requiring human intervention.
     */
    public function scopeRequiresHuman($query)
    {
        return $query->where('requires_human', true);
    }

    /**
     * Scope for sessions assigned to agents.
     */
    public function scopeAssignedToAgents($query)
    {
        return $query->whereNotNull('assigned_agent_id');
    }

    /**
     * Scope for sessions by status.
     */
    public function scopeByStatus($query, string $status)
    {
        return $query->where('session_status', $status);
    }

    /**
     * Scope for sessions by priority.
     */
    public function scopeByPriority($query, string $priority)
    {
        return $query->where('priority', $priority);
    }

    /**
     * Scope for high priority sessions.
     */
    public function scopeHighPriority($query)
    {
        return $query->whereIn('priority', ['high', 'urgent']);
    }

    /**
     * Scope for sessions by handling mode.
     */
    public function scopeByHandlingMode($query, string $mode)
    {
        return $query->where('handling_mode', $mode);
    }
}
