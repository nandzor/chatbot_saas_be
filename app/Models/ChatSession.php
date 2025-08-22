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
        'session_token',
        'session_type',
        'started_at',
        'ended_at',
        'last_activity_at',
        'first_response_at',
        'is_active',
        'is_bot_session',
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
        'priority',
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
     * Get the channel configuration for this chat session.
     */
    public function channelConfig(): BelongsTo
    {
        return $this->belongsTo(ChannelConfig::class);
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
}
