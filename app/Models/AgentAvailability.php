<?php

namespace App\Models;

use App\Traits\BelongsToOrganization;
use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AgentAvailability extends Model
{
    use HasFactory, HasUuid, BelongsToOrganization;

    protected $fillable = [
        'agent_id',
        'organization_id',
        'status',
        'work_mode',
        'current_active_chats',
        'max_concurrent_chats',
        'working_hours',
        'break_schedule',
        'last_activity_at',
        'status_changed_at',
        'available_skills',
        'language_preferences',
        'channel_preferences',
        'total_chats_today',
        'total_resolved_today',
        'avg_response_time',
        'avg_resolution_time',
    ];

    protected $casts = [
        'working_hours' => 'array',
        'break_schedule' => 'array',
        'last_activity_at' => 'datetime',
        'status_changed_at' => 'datetime',
        'available_skills' => 'array',
        'language_preferences' => 'array',
        'channel_preferences' => 'array',
        'current_active_chats' => 'integer',
        'max_concurrent_chats' => 'integer',
        'total_chats_today' => 'integer',
        'total_resolved_today' => 'integer',
        'avg_response_time' => 'decimal:2',
        'avg_resolution_time' => 'decimal:2',
    ];

    /**
     * Get the agent for this availability record.
     */
    public function agent(): BelongsTo
    {
        return $this->belongsTo(Agent::class);
    }

    /**
     * Get the organization for this availability record.
     */
    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    /**
     * Scope for online agents.
     */
    public function scopeOnline($query)
    {
        return $query->where('status', 'online');
    }

    /**
     * Scope for available agents.
     */
    public function scopeAvailable($query)
    {
        return $query->where('work_mode', 'available')
                    ->where('status', 'online')
                    ->whereRaw('current_active_chats < max_concurrent_chats');
    }

    /**
     * Scope for busy agents.
     */
    public function scopeBusy($query)
    {
        return $query->where('status', 'busy');
    }

    /**
     * Scope for agents with specific skills.
     */
    public function scopeWithSkills($query, array $skills)
    {
        return $query->whereJsonContains('available_skills', $skills);
    }

    /**
     * Scope for agents available for specific channels.
     */
    public function scopeForChannel($query, string $channel)
    {
        return $query->whereJsonContains('channel_preferences', $channel);
    }

    /**
     * Check if agent is available for new chats.
     */
    public function isAvailable(): bool
    {
        return $this->status === 'online' 
            && $this->work_mode === 'available'
            && $this->current_active_chats < $this->max_concurrent_chats;
    }

    /**
     * Check if agent is at capacity.
     */
    public function isAtCapacity(): bool
    {
        return $this->current_active_chats >= $this->max_concurrent_chats;
    }

    /**
     * Update agent status.
     */
    public function updateStatus(string $status, string $workMode = null): void
    {
        $this->update([
            'status' => $status,
            'work_mode' => $workMode ?? $this->work_mode,
            'status_changed_at' => now(),
            'last_activity_at' => now(),
        ]);
    }

    /**
     * Increment active chats count.
     */
    public function incrementActiveChats(): void
    {
        $this->increment('current_active_chats');
        $this->update(['last_activity_at' => now()]);
    }

    /**
     * Decrement active chats count.
     */
    public function decrementActiveChats(): void
    {
        $this->decrement('current_active_chats');
        $this->update(['last_activity_at' => now()]);
    }

    /**
     * Reset daily counters.
     */
    public function resetDailyCounters(): void
    {
        $this->update([
            'total_chats_today' => 0,
            'total_resolved_today' => 0,
        ]);
    }

    /**
     * Update performance metrics.
     */
    public function updatePerformanceMetrics(int $responseTime, int $resolutionTime): void
    {
        $this->update([
            'avg_response_time' => $responseTime,
            'avg_resolution_time' => $resolutionTime,
            'last_activity_at' => now(),
        ]);
    }

    /**
     * Get status color for UI.
     */
    public function getStatusColorAttribute(): string
    {
        return match($this->status) {
            'online' => 'green',
            'busy' => 'yellow',
            'away' => 'orange',
            'offline' => 'red',
            default => 'gray',
        };
    }

    /**
     * Get work mode color for UI.
     */
    public function getWorkModeColorAttribute(): string
    {
        return match($this->work_mode) {
            'available' => 'green',
            'do_not_disturb' => 'red',
            'break' => 'yellow',
            'training' => 'blue',
            default => 'gray',
        };
    }

    /**
     * Get capacity percentage.
     */
    public function getCapacityPercentageAttribute(): float
    {
        if ($this->max_concurrent_chats === 0) {
            return 0;
        }
        return ($this->current_active_chats / $this->max_concurrent_chats) * 100;
    }

    /**
     * Check if agent is currently on break.
     */
    public function isOnBreak(): bool
    {
        if (!$this->break_schedule || $this->work_mode !== 'break') {
            return false;
        }

        $now = now();
        foreach ($this->break_schedule as $break) {
            $start = \Carbon\Carbon::parse($break['start']);
            $end = \Carbon\Carbon::parse($break['end']);
            
            if ($now->between($start, $end)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Check if agent is within working hours.
     */
    public function isWithinWorkingHours(): bool
    {
        if (!$this->working_hours) {
            return true; // No restrictions
        }

        $now = now();
        $dayOfWeek = strtolower($now->format('l')); // monday, tuesday, etc.
        
        if (!isset($this->working_hours[$dayOfWeek])) {
            return false;
        }

        $workingHours = $this->working_hours[$dayOfWeek];
        $currentTime = $now->format('H:i:s');
        
        return $currentTime >= $workingHours['start'] && $currentTime <= $workingHours['end'];
    }
}
