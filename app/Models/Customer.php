<?php

namespace App\Models;

use App\Traits\BelongsToOrganization;
use App\Traits\HasStatus;
use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Customer extends Model
{
    use HasFactory, HasUuid, BelongsToOrganization, HasStatus;

    protected $fillable = [
        'organization_id',
        'external_id',
        'name',
        'first_name',
        'last_name',
        'email',
        'phone',
        'channel',
        'channel_user_id',
        'avatar_url',
        'language',
        'timezone',
        'profile_data',
        'preferences',
        'tags',
        'segments',
        'source',
        'utm_data',
        'last_interaction_at',
        'total_interactions',
        'total_messages',
        'avg_response_time',
        'satisfaction_score',
        'interaction_patterns',
        'interests',
        'purchase_history',
        'sentiment_history',
        'intent_patterns',
        'engagement_score',
        'notes',
        'status',
    ];

    protected $casts = [
        'profile_data' => 'array',
        'preferences' => 'array',
        'tags' => 'array',
        'segments' => 'array',
        'utm_data' => 'array',
        'last_interaction_at' => 'datetime',
        'satisfaction_score' => 'decimal:2',
        'interaction_patterns' => 'array',
        'interests' => 'array',
        'purchase_history' => 'array',
        'sentiment_history' => 'array',
        'intent_patterns' => 'array',
        'engagement_score' => 'decimal:2',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the chat sessions for this customer.
     */
    public function chatSessions(): HasMany
    {
        return $this->hasMany(ChatSession::class);
    }

    /**
     * Get the active chat sessions.
     */
    public function activeChatSessions(): HasMany
    {
        return $this->chatSessions()->where('is_active', true);
    }

    /**
     * Get the customer's full name.
     */
    public function getFullNameAttribute(): string
    {
        if ($this->name) {
            return $this->name;
        }

        return trim($this->first_name . ' ' . $this->last_name) ?: 'Unknown Customer';
    }

    /**
     * Get the customer's initials.
     */
    public function getInitialsAttribute(): string
    {
        $name = $this->full_name;
        $words = explode(' ', $name);
        $initials = '';

        foreach ($words as $word) {
            $initials .= strtoupper(substr($word, 0, 1));
        }

        return $initials ?: 'UC';
    }

    /**
     * Check if customer has had recent interaction.
     */
    public function hasRecentInteraction(int $hours = 24): bool
    {
        return $this->last_interaction_at &&
               $this->last_interaction_at->isAfter(now()->subHours($hours));
    }

    /**
     * Get average satisfaction score as percentage.
     */
    public function getSatisfactionPercentageAttribute(): int
    {
        return round(($this->satisfaction_score ?? 0) * 20); // Convert 5-point scale to percentage
    }

    /**
     * Get engagement level based on score.
     */
    public function getEngagementLevelAttribute(): string
    {
        $score = $this->engagement_score ?? 0;

        return match (true) {
            $score >= 0.8 => 'high',
            $score >= 0.6 => 'medium',
            $score >= 0.4 => 'low',
            default => 'very_low',
        };
    }

    /**
     * Update interaction statistics.
     */
    public function updateInteractionStats(): void
    {
        $this->increment('total_interactions');
        $this->update(['last_interaction_at' => now()]);
    }

    /**
     * Add a tag to the customer.
     */
    public function addTag(string $tag): void
    {
        $tags = $this->tags ?? [];
        if (!in_array($tag, $tags)) {
            $tags[] = $tag;
            $this->update(['tags' => $tags]);
        }
    }

    /**
     * Remove a tag from the customer.
     */
    public function removeTag(string $tag): void
    {
        $tags = $this->tags ?? [];
        $tags = array_filter($tags, fn($t) => $t !== $tag);
        $this->update(['tags' => array_values($tags)]);
    }

    /**
     * Check if customer has a specific tag.
     */
    public function hasTag(string $tag): bool
    {
        return in_array($tag, $this->tags ?? []);
    }

    /**
     * Add customer to a segment.
     */
    public function addToSegment(string $segment): void
    {
        $segments = $this->segments ?? [];
        if (!in_array($segment, $segments)) {
            $segments[] = $segment;
            $this->update(['segments' => $segments]);
        }
    }

    /**
     * Remove customer from a segment.
     */
    public function removeFromSegment(string $segment): void
    {
        $segments = $this->segments ?? [];
        $segments = array_filter($segments, fn($s) => $s !== $segment);
        $this->update(['segments' => array_values($segments)]);
    }

    /**
     * Check if customer is in a specific segment.
     */
    public function inSegment(string $segment): bool
    {
        return in_array($segment, $this->segments ?? []);
    }

    /**
     * Record sentiment for this customer.
     */
    public function recordSentiment(string $sentiment, float $score): void
    {
        $history = $this->sentiment_history ?? [];
        $history[] = [
            'sentiment' => $sentiment,
            'score' => $score,
            'timestamp' => now()->toISOString(),
        ];

        // Keep only last 50 sentiment records
        if (count($history) > 50) {
            $history = array_slice($history, -50);
        }

        $this->update(['sentiment_history' => $history]);
    }

    /**
     * Get the latest sentiment.
     */
    public function getLatestSentiment(): ?array
    {
        $history = $this->sentiment_history ?? [];
        return end($history) ?: null;
    }

    /**
     * Scope for customers from specific channel.
     */
    public function scopeFromChannel($query, string $channel)
    {
        return $query->where('channel', $channel);
    }

    /**
     * Scope for customers with specific tag.
     */
    public function scopeWithTag($query, string $tag)
    {
        return $query->whereJsonContains('tags', $tag);
    }

    /**
     * Scope for customers in specific segment.
     */
    public function scopeInSegment($query, string $segment)
    {
        return $query->whereJsonContains('segments', $segment);
    }

    /**
     * Scope for customers with recent interactions.
     */
    public function scopeRecentlyActive($query, int $hours = 24)
    {
        return $query->where('last_interaction_at', '>=', now()->subHours($hours));
    }

    /**
     * Scope for high engagement customers.
     */
    public function scopeHighEngagement($query)
    {
        return $query->where('engagement_score', '>=', 0.8);
    }

    /**
     * Scope for satisfied customers.
     */
    public function scopeSatisfied($query)
    {
        return $query->where('satisfaction_score', '>=', 4);
    }

    /**
     * Order by last interaction.
     */
    public function scopeByLastInteraction($query)
    {
        return $query->orderBy('last_interaction_at', 'desc');
    }

    /**
     * Search customers by name, email, or phone.
     */
    public function scopeSearch($query, string $term)
    {
        return $query->where(function ($query) use ($term) {
            $query->where('name', 'LIKE', "%{$term}%")
                  ->orWhere('first_name', 'LIKE', "%{$term}%")
                  ->orWhere('last_name', 'LIKE', "%{$term}%")
                  ->orWhere('email', 'LIKE', "%{$term}%")
                  ->orWhere('phone', 'LIKE', "%{$term}%")
                  ->orWhere('channel_user_id', 'LIKE', "%{$term}%");
        });
    }
}
