<?php

namespace App\Models;

use App\Traits\BelongsToOrganization;
use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class AnalyticsDaily extends Model
{
    use HasFactory, HasUuid, BelongsToOrganization;

    protected $table = 'analytics_daily';

    protected $fillable = [
        'organization_id',
        'date',
        'total_sessions',
        'bot_sessions',
        'agent_sessions',
        'handover_count',
        'total_messages',
        'customer_messages',
        'bot_messages',
        'agent_messages',
        'unique_customers',
        'new_customers',
        'returning_customers',
        'active_agents',
        'avg_session_duration',
        'avg_response_time',
        'avg_resolution_time',
        'avg_wait_time',
        'first_response_time',
        'satisfaction_avg',
        'satisfaction_count',
        'resolution_rate',
        'escalation_rate',
        'ai_requests_count',
        'ai_success_rate',
        'ai_avg_confidence',
        'ai_cost_usd',
        'channel_breakdown',
        'top_intents',
        'top_articles',
        'top_searches',
        'agent_performance',
        'peak_hours',
        'hourly_distribution',
        'error_count',
        'bot_fallback_count',
        'usage_metrics',
    ];

    protected $casts = [
        'date' => 'date',
        'avg_session_duration' => 'integer',
        'avg_response_time' => 'integer',
        'avg_resolution_time' => 'integer',
        'avg_wait_time' => 'integer',
        'first_response_time' => 'integer',
        'satisfaction_avg' => 'decimal:2',
        'resolution_rate' => 'decimal:2',
        'escalation_rate' => 'decimal:2',
        'ai_success_rate' => 'decimal:2',
        'ai_avg_confidence' => 'decimal:2',
        'ai_cost_usd' => 'decimal:2',
        'channel_breakdown' => 'array',
        'top_intents' => 'array',
        'top_articles' => 'array',
        'top_searches' => 'array',
        'agent_performance' => 'array',
        'peak_hours' => 'array',
        'hourly_distribution' => 'array',
        'usage_metrics' => 'array',
        'created_at' => 'datetime',
    ];

    /**
     * Get bot session percentage.
     */
    public function getBotSessionPercentageAttribute(): float
    {
        if ($this->total_sessions === 0) {
            return 0;
        }

        return round(($this->bot_sessions / $this->total_sessions) * 100, 2);
    }

    /**
     * Get agent session percentage.
     */
    public function getAgentSessionPercentageAttribute(): float
    {
        if ($this->total_sessions === 0) {
            return 0;
        }

        return round(($this->agent_sessions / $this->total_sessions) * 100, 2);
    }

    /**
     * Get handover rate percentage.
     */
    public function getHandoverRateAttribute(): float
    {
        if ($this->total_sessions === 0) {
            return 0;
        }

        return round(($this->handover_count / $this->total_sessions) * 100, 2);
    }

    /**
     * Get customer retention rate.
     */
    public function getCustomerRetentionRateAttribute(): float
    {
        if ($this->unique_customers === 0) {
            return 0;
        }

        return round(($this->returning_customers / $this->unique_customers) * 100, 2);
    }

    /**
     * Get new customer rate.
     */
    public function getNewCustomerRateAttribute(): float
    {
        if ($this->unique_customers === 0) {
            return 0;
        }

        return round(($this->new_customers / $this->unique_customers) * 100, 2);
    }

    /**
     * Get satisfaction percentage.
     */
    public function getSatisfactionPercentageAttribute(): float
    {
        return round(($this->satisfaction_avg ?? 0) * 20, 2); // Convert 5-point scale to percentage
    }

    /**
     * Get AI efficiency score.
     */
    public function getAiEfficiencyScoreAttribute(): float
    {
        $successWeight = ($this->ai_success_rate ?? 0) * 0.4;
        $confidenceWeight = ($this->ai_avg_confidence ?? 0) * 100 * 0.4;
        $costWeight = max(0, 100 - ($this->ai_cost_usd ?? 0) * 1000) * 0.2; // Lower cost = better score

        return round($successWeight + $confidenceWeight + $costWeight, 2);
    }

    /**
     * Get messages per session average.
     */
    public function getMessagesPerSessionAttribute(): float
    {
        if ($this->total_sessions === 0) {
            return 0;
        }

        return round($this->total_messages / $this->total_sessions, 2);
    }

    /**
     * Get top performing channel.
     */
    public function getTopChannelAttribute(): ?string
    {
        $breakdown = $this->channel_breakdown ?? [];

        if (empty($breakdown)) {
            return null;
        }

        return array_keys($breakdown, max($breakdown))[0] ?? null;
    }

    /**
     * Get most common intent.
     */
    public function getTopIntentAttribute(): ?string
    {
        $intents = $this->top_intents ?? [];

        if (empty($intents)) {
            return null;
        }

        return $intents[0]['intent'] ?? null;
    }

    /**
     * Get peak hour of the day.
     */
    public function getPeakHourAttribute(): ?int
    {
        $hours = $this->peak_hours ?? [];

        if (empty($hours)) {
            return null;
        }

        return array_keys($hours, max($hours))[0] ?? null;
    }

    /**
     * Get average session duration in human readable format.
     */
    public function getAvgSessionDurationHumanAttribute(): string
    {
        $minutes = $this->avg_session_duration ?? 0;

        if ($minutes < 60) {
            return $minutes . ' min';
        }

        $hours = intval($minutes / 60);
        $remainingMinutes = $minutes % 60;

        return $hours . 'h ' . $remainingMinutes . 'm';
    }

    /**
     * Get average response time in human readable format.
     */
    public function getAvgResponseTimeHumanAttribute(): string
    {
        $seconds = $this->avg_response_time ?? 0;

        if ($seconds < 60) {
            return $seconds . 's';
        }

        return round($seconds / 60, 1) . 'm';
    }

    /**
     * Create or update analytics for a specific date.
     */
    public static function updateOrCreateForDate(string $organizationId, Carbon $date, array $data): self
    {
        return static::updateOrCreate(
            [
                'organization_id' => $organizationId,
                'date' => $date->toDateString(),
            ],
            $data
        );
    }

    /**
     * Get analytics summary for date range.
     */
    public static function getSummaryForDateRange(string $organizationId, Carbon $startDate, Carbon $endDate): array
    {
        $analytics = static::where('organization_id', $organizationId)
                          ->whereBetween('date', [$startDate, $endDate])
                          ->get();

        if ($analytics->isEmpty()) {
            return [];
        }

        return [
            'total_sessions' => $analytics->sum('total_sessions'),
            'total_messages' => $analytics->sum('total_messages'),
            'unique_customers' => $analytics->sum('unique_customers'),
            'avg_satisfaction' => $analytics->avg('satisfaction_avg'),
            'avg_resolution_rate' => $analytics->avg('resolution_rate'),
            'avg_ai_success_rate' => $analytics->avg('ai_success_rate'),
            'total_ai_cost' => $analytics->sum('ai_cost_usd'),
            'avg_handover_rate' => $analytics->avg('escalation_rate'),
            'daily_breakdown' => $analytics->keyBy('date'),
        ];
    }

    /**
     * Scope for specific date.
     */
    public function scopeForDate($query, Carbon $date)
    {
        return $query->whereDate('date', $date);
    }

    /**
     * Scope for date range.
     */
    public function scopeDateRange($query, Carbon $startDate, Carbon $endDate)
    {
        return $query->whereBetween('date', [$startDate, $endDate]);
    }

    /**
     * Scope for current month.
     */
    public function scopeCurrentMonth($query)
    {
        return $query->whereMonth('date', now()->month)
                    ->whereYear('date', now()->year);
    }

    /**
     * Scope for last month.
     */
    public function scopeLastMonth($query)
    {
        $lastMonth = now()->subMonth();
        return $query->whereMonth('date', $lastMonth->month)
                    ->whereYear('date', $lastMonth->year);
    }

    /**
     * Scope for current week.
     */
    public function scopeCurrentWeek($query)
    {
        return $query->whereBetween('date', [
            now()->startOfWeek(),
            now()->endOfWeek()
        ]);
    }

    /**
     * Scope for high satisfaction days.
     */
    public function scopeHighSatisfaction($query, float $minSatisfaction = 4.0)
    {
        return $query->where('satisfaction_avg', '>=', $minSatisfaction);
    }

    /**
     * Scope for high activity days.
     */
    public function scopeHighActivity($query, int $minSessions = 100)
    {
        return $query->where('total_sessions', '>=', $minSessions);
    }

    /**
     * Order by date.
     */
    public function scopeByDate($query, string $direction = 'desc')
    {
        return $query->orderBy('date', $direction);
    }

    /**
     * Order by total sessions.
     */
    public function scopeByActivity($query, string $direction = 'desc')
    {
        return $query->orderBy('total_sessions', $direction);
    }

    /**
     * Order by satisfaction.
     */
    public function scopeBySatisfaction($query, string $direction = 'desc')
    {
        return $query->orderBy('satisfaction_avg', $direction);
    }
}
