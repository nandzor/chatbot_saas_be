<?php

namespace App\Models;

use App\Traits\BelongsToOrganization;
use App\Traits\HasStatus;
use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Agent extends Model
{
    use HasFactory, HasUuid, BelongsToOrganization, HasStatus;

    protected $fillable = [
        'user_id',
        'organization_id',
        'agent_code',
        'display_name',
        'department',
        'job_title',
        'specialization',
        'bio',
        'max_concurrent_chats',
        'current_active_chats',
        'availability_status',
        'auto_accept_chats',
        'working_hours',
        'breaks',
        'time_off',
        'skills',
        'languages',
        'expertise_areas',
        'certifications',
        'performance_metrics',
        'rating',
        'total_handled_chats',
        'total_resolved_chats',
        'avg_response_time',
        'avg_resolution_time',
        'ai_suggestions_enabled',
        'ai_auto_responses_enabled',
        'points',
        'level',
        'badges',
        'achievements',
        'status',
    ];

    protected $casts = [
        'specialization' => 'array',
        'auto_accept_chats' => 'boolean',
        'working_hours' => 'array',
        'breaks' => 'array',
        'time_off' => 'array',
        'skills' => 'array',
        'languages' => 'array',
        'expertise_areas' => 'array',
        'certifications' => 'array',
        'performance_metrics' => 'array',
        'rating' => 'decimal:2',
        'ai_suggestions_enabled' => 'boolean',
        'ai_auto_responses_enabled' => 'boolean',
        'badges' => 'array',
        'achievements' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the user associated with this agent.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the chat sessions assigned to this agent.
     */
    public function chatSessions(): HasMany
    {
        return $this->hasMany(ChatSession::class);
    }

    /**
     * Get the active chat sessions for this agent.
     */
    public function activeChatSessions(): HasMany
    {
        return $this->chatSessions()->where('is_active', true);
    }

    /**
     * Get the resolved chat sessions for this agent.
     */
    public function resolvedChatSessions(): HasMany
    {
        return $this->chatSessions()->where('is_resolved', true);
    }

    /**
     * Check if agent is available for new chats.
     */
    public function isAvailable(): bool
    {
        return $this->availability_status === 'online' &&
               $this->current_active_chats < $this->max_concurrent_chats &&
               $this->isActive();
    }

    /**
     * Check if agent is online.
     */
    public function isOnline(): bool
    {
        return $this->availability_status === 'online';
    }

    /**
     * Check if agent is busy.
     */
    public function isBusy(): bool
    {
        return $this->availability_status === 'busy' ||
               $this->current_active_chats >= $this->max_concurrent_chats;
    }

    /**
     * Check if agent is offline.
     */
    public function isOffline(): bool
    {
        return $this->availability_status === 'offline';
    }

    /**
     * Check if agent can handle more chats.
     */
    public function canHandleMoreChats(): bool
    {
        return $this->current_active_chats < $this->max_concurrent_chats;
    }

    /**
     * Get agent's capacity percentage.
     */
    public function getCapacityPercentageAttribute(): int
    {
        if ($this->max_concurrent_chats === 0) {
            return 0;
        }

        return round(($this->current_active_chats / $this->max_concurrent_chats) * 100);
    }

    /**
     * Get agent's performance score.
     */
    public function getPerformanceScoreAttribute(): float
    {
        $metrics = $this->performance_metrics ?? [];
        $responseScore = ($metrics['response_time'] ?? 0) * 0.3;
        $resolutionScore = ($metrics['resolution_rate'] ?? 0) * 0.4;
        $satisfactionScore = ($metrics['satisfaction'] ?? 0) * 0.3;

        return round($responseScore + $resolutionScore + $satisfactionScore, 2);
    }

    /**
     * Get agent's current level badge.
     */
    public function getLevelBadgeAttribute(): string
    {
        return match (true) {
            $this->level >= 10 => 'Expert',
            $this->level >= 7 => 'Senior',
            $this->level >= 4 => 'Intermediate',
            default => 'Beginner',
        };
    }

    /**
     * Set agent availability status.
     */
    public function setAvailabilityStatus(string $status): void
    {
        $validStatuses = ['online', 'offline', 'busy', 'away'];

        if (in_array($status, $validStatuses)) {
            $this->update(['availability_status' => $status]);
        }
    }

    /**
     * Assign a chat to this agent.
     */
    public function assignChat(ChatSession $chatSession): bool
    {
        if (!$this->canHandleMoreChats()) {
            return false;
        }

        $chatSession->update(['agent_id' => $this->id]);
        $this->increment('current_active_chats');
        $this->increment('total_handled_chats');

        return true;
    }

    /**
     * Complete a chat for this agent.
     */
    public function completeChat(ChatSession $chatSession, bool $resolved = true): void
    {
        if ($chatSession->agent_id === $this->id) {
            $this->decrement('current_active_chats');

            if ($resolved) {
                $this->increment('total_resolved_chats');
            }
        }
    }

    /**
     * Update performance metrics.
     */
    public function updatePerformanceMetrics(array $metrics): void
    {
        $current = $this->performance_metrics ?? [];
        $updated = array_merge($current, $metrics);

        $this->update(['performance_metrics' => $updated]);
    }

    /**
     * Add points to agent.
     */
    public function addPoints(int $points): void
    {
        $this->increment('points', $points);

        // Check for level up (every 1000 points = 1 level)
        $newLevel = intval($this->points / 1000) + 1;
        if ($newLevel > $this->level) {
            $this->update(['level' => $newLevel]);
        }
    }

    /**
     * Award a badge to the agent.
     */
    public function awardBadge(string $badge): void
    {
        $badges = $this->badges ?? [];
        if (!in_array($badge, $badges)) {
            $badges[] = $badge;
            $this->update(['badges' => $badges]);
        }
    }

    /**
     * Check if agent has a specific skill.
     */
    public function hasSkill(string $skill): bool
    {
        return in_array($skill, $this->skills ?? []);
    }

    /**
     * Check if agent speaks a specific language.
     */
    public function speaksLanguage(string $language): bool
    {
        return in_array($language, $this->languages ?? []);
    }

    /**
     * Check if agent has expertise in a specific area.
     */
    public function hasExpertise(string $area): bool
    {
        return in_array($area, $this->expertise_areas ?? []);
    }

    /**
     * Scope for available agents.
     */
    public function scopeAvailable($query)
    {
        return $query->where('availability_status', 'online')
                    ->whereColumn('current_active_chats', '<', 'max_concurrent_chats')
                    ->where('status', 'active');
    }

    /**
     * Scope for online agents.
     */
    public function scopeOnline($query)
    {
        return $query->where('availability_status', 'online');
    }

    /**
     * Scope for agents with specific skill.
     */
    public function scopeWithSkill($query, string $skill)
    {
        return $query->whereJsonContains('skills', $skill);
    }

    /**
     * Scope for agents speaking specific language.
     */
    public function scopeSpeakingLanguage($query, string $language)
    {
        return $query->whereJsonContains('languages', $language);
    }

    /**
     * Scope for agents with expertise in specific area.
     */
    public function scopeWithExpertise($query, string $area)
    {
        return $query->whereJsonContains('expertise_areas', $area);
    }

    /**
     * Scope for high-rated agents.
     */
    public function scopeHighRated($query, float $minRating = 4.0)
    {
        return $query->where('rating', '>=', $minRating);
    }

    /**
     * Order by performance score.
     */
    public function scopeByPerformance($query)
    {
        return $query->orderBy('rating', 'desc')
                    ->orderBy('total_resolved_chats', 'desc');
    }

    /**
     * Order by availability and capacity.
     */
    public function scopeByAvailability($query)
    {
        return $query->orderByRaw("FIELD(availability_status, 'online', 'away', 'busy', 'offline')")
                    ->orderBy('current_active_chats', 'asc');
    }
}
