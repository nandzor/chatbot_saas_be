<?php

namespace App\Models;

use App\Traits\BelongsToOrganization;
use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class AgentQueue extends Model
{
    use HasFactory, HasUuid, BelongsToOrganization, SoftDeletes;

    protected $fillable = [
        'organization_id',
        'agent_id',
        'chat_session_id',
        'queue_type',
        'priority',
        'status',
        'queued_at',
        'assigned_at',
        'started_at',
        'completed_at',
        'wait_time_seconds',
        'handling_time_seconds',
        'assignment_notes',
        'customer_context',
        'bot_context',
    ];

    protected $casts = [
        'queued_at' => 'datetime',
        'assigned_at' => 'datetime',
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
        'customer_context' => 'array',
        'bot_context' => 'array',
        'wait_time_seconds' => 'integer',
        'handling_time_seconds' => 'integer',
    ];

    /**
     * Get the agent assigned to this queue item.
     */
    public function agent(): BelongsTo
    {
        return $this->belongsTo(Agent::class);
    }

    /**
     * Get the chat session for this queue item.
     */
    public function chatSession(): BelongsTo
    {
        return $this->belongsTo(ChatSession::class);
    }

    /**
     * Get the organization for this queue item.
     */
    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    /**
     * Scope for pending queue items.
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope for assigned queue items.
     */
    public function scopeAssigned($query)
    {
        return $query->where('status', 'assigned');
    }

    /**
     * Scope for in-progress queue items.
     */
    public function scopeInProgress($query)
    {
        return $query->where('status', 'in_progress');
    }

    /**
     * Scope for completed queue items.
     */
    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    /**
     * Scope for high priority queue items.
     */
    public function scopeHighPriority($query)
    {
        return $query->whereIn('priority', ['high', 'urgent']);
    }

    /**
     * Scope for specific queue type.
     */
    public function scopeOfType($query, $type)
    {
        return $query->where('queue_type', $type);
    }

    /**
     * Calculate wait time in seconds.
     */
    public function calculateWaitTime(): int
    {
        if ($this->assigned_at && $this->queued_at) {
            return $this->assigned_at->diffInSeconds($this->queued_at);
        }
        return 0;
    }

    /**
     * Calculate handling time in seconds.
     */
    public function calculateHandlingTime(): int
    {
        if ($this->started_at && $this->completed_at) {
            return $this->completed_at->diffInSeconds($this->started_at);
        }
        return 0;
    }

    /**
     * Mark as assigned.
     */
    public function markAsAssigned(): void
    {
        $this->update([
            'status' => 'assigned',
            'assigned_at' => now(),
            'wait_time_seconds' => $this->calculateWaitTime(),
        ]);
    }

    /**
     * Mark as in progress.
     */
    public function markAsInProgress(): void
    {
        $this->update([
            'status' => 'in_progress',
            'started_at' => now(),
        ]);
    }

    /**
     * Mark as completed.
     */
    public function markAsCompleted(): void
    {
        $this->update([
            'status' => 'completed',
            'completed_at' => now(),
            'handling_time_seconds' => $this->calculateHandlingTime(),
        ]);
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
     * Get status color for UI.
     */
    public function getStatusColorAttribute(): string
    {
        return match($this->status) {
            'pending' => 'gray',
            'assigned' => 'blue',
            'in_progress' => 'yellow',
            'completed' => 'green',
            'cancelled' => 'red',
            default => 'gray',
        };
    }
}
