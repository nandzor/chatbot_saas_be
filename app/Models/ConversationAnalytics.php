<?php

namespace App\Models;

use App\Traits\BelongsToOrganization;
use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ConversationAnalytics extends Model
{
    use HasFactory, HasUuid, BelongsToOrganization;

    protected $fillable = [
        'chat_session_id',
        'organization_id',
        'sentiment_analysis',
        'intent_classification',
        'topic_extraction',
        'customer_satisfaction',
        'agent_performance',
        'bot_performance',
        'total_messages',
        'bot_messages',
        'agent_messages',
        'customer_messages',
        'response_time_avg',
        'resolution_time',
    ];

    protected $casts = [
        'sentiment_analysis' => 'array',
        'intent_classification' => 'array',
        'topic_extraction' => 'array',
        'customer_satisfaction' => 'array',
        'agent_performance' => 'array',
        'bot_performance' => 'array',
        'total_messages' => 'integer',
        'bot_messages' => 'integer',
        'agent_messages' => 'integer',
        'customer_messages' => 'integer',
        'response_time_avg' => 'integer',
        'resolution_time' => 'integer',
    ];

    /**
     * Get the chat session for this analytics record.
     */
    public function chatSession(): BelongsTo
    {
        return $this->belongsTo(ChatSession::class);
    }

    /**
     * Get the organization for this analytics record.
     */
    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    /**
     * Scope for recent analytics.
     */
    public function scopeRecent($query, int $days = 7)
    {
        return $query->where('created_at', '>=', now()->subDays($days));
    }

    /**
     * Scope for analytics by sentiment.
     */
    public function scopeBySentiment($query, string $sentiment)
    {
        return $query->whereJsonContains('sentiment_analysis->overall_sentiment', $sentiment);
    }

    /**
     * Scope for analytics by intent.
     */
    public function scopeByIntent($query, string $intent)
    {
        return $query->whereJsonContains('intent_classification->primary_intent', $intent);
    }

    /**
     * Calculate conversation efficiency score.
     */
    public function getEfficiencyScoreAttribute(): float
    {
        if ($this->total_messages === 0) {
            return 0;
        }

        $efficiencyFactors = [
            'message_ratio' => $this->getMessageRatioScore(),
            'response_time' => $this->getResponseTimeScore(),
            'resolution_time' => $this->getResolutionTimeScore(),
            'satisfaction' => $this->getSatisfactionScore(),
        ];

        return array_sum($efficiencyFactors) / count($efficiencyFactors);
    }

    /**
     * Get message ratio score (optimal is 1:1 customer to agent/bot ratio).
     */
    private function getMessageRatioScore(): float
    {
        if ($this->customer_messages === 0) {
            return 0;
        }

        $totalResponses = $this->bot_messages + $this->agent_messages;
        $ratio = $totalResponses / $this->customer_messages;
        
        // Optimal ratio is 1:1, score decreases as ratio deviates
        return max(0, 1 - abs($ratio - 1) * 0.5);
    }

    /**
     * Get response time score (faster is better).
     */
    private function getResponseTimeScore(): float
    {
        if (!$this->response_time_avg) {
            return 0.5; // Neutral score if no data
        }

        // Score based on response time in seconds
        if ($this->response_time_avg <= 30) {
            return 1.0; // Excellent
        } elseif ($this->response_time_avg <= 60) {
            return 0.8; // Good
        } elseif ($this->response_time_avg <= 120) {
            return 0.6; // Average
        } elseif ($this->response_time_avg <= 300) {
            return 0.4; // Poor
        } else {
            return 0.2; // Very poor
        }
    }

    /**
     * Get resolution time score (faster is better).
     */
    private function getResolutionTimeScore(): float
    {
        if (!$this->resolution_time) {
            return 0.5; // Neutral score if no data
        }

        // Score based on resolution time in minutes
        $resolutionMinutes = $this->resolution_time / 60;
        
        if ($resolutionMinutes <= 5) {
            return 1.0; // Excellent
        } elseif ($resolutionMinutes <= 15) {
            return 0.8; // Good
        } elseif ($resolutionMinutes <= 30) {
            return 0.6; // Average
        } elseif ($resolutionMinutes <= 60) {
            return 0.4; // Poor
        } else {
            return 0.2; // Very poor
        }
    }

    /**
     * Get satisfaction score.
     */
    private function getSatisfactionScore(): float
    {
        if (!$this->customer_satisfaction || !isset($this->customer_satisfaction['rating'])) {
            return 0.5; // Neutral score if no data
        }

        $rating = $this->customer_satisfaction['rating'];
        return $rating / 5.0; // Convert 1-5 scale to 0-1 scale
    }

    /**
     * Get overall sentiment score.
     */
    public function getOverallSentimentAttribute(): string
    {
        if (!$this->sentiment_analysis || !isset($this->sentiment_analysis['overall_sentiment'])) {
            return 'neutral';
        }

        return $this->sentiment_analysis['overall_sentiment'];
    }

    /**
     * Get primary intent.
     */
    public function getPrimaryIntentAttribute(): string
    {
        if (!$this->intent_classification || !isset($this->intent_classification['primary_intent'])) {
            return 'unknown';
        }

        return $this->intent_classification['primary_intent'];
    }

    /**
     * Get top topics discussed.
     */
    public function getTopTopicsAttribute(): array
    {
        if (!$this->topic_extraction || !isset($this->topic_extraction['topics'])) {
            return [];
        }

        return array_slice($this->topic_extraction['topics'], 0, 5);
    }

    /**
     * Get conversation type (bot vs human vs hybrid).
     */
    public function getConversationTypeAttribute(): string
    {
        if ($this->agent_messages > 0 && $this->bot_messages > 0) {
            return 'hybrid';
        } elseif ($this->agent_messages > 0) {
            return 'human';
        } else {
            return 'bot';
        }
    }

    /**
     * Get conversation complexity level.
     */
    public function getComplexityLevelAttribute(): string
    {
        if ($this->total_messages <= 5) {
            return 'simple';
        } elseif ($this->total_messages <= 15) {
            return 'moderate';
        } elseif ($this->total_messages <= 30) {
            return 'complex';
        } else {
            return 'very_complex';
        }
    }

    /**
     * Get sentiment color for UI.
     */
    public function getSentimentColorAttribute(): string
    {
        return match($this->getOverallSentimentAttribute()) {
            'positive' => 'green',
            'negative' => 'red',
            'neutral' => 'gray',
            default => 'gray',
        };
    }

    /**
     * Get efficiency badge for UI.
     */
    public function getEfficiencyBadgeAttribute(): string
    {
        $score = $this->getEfficiencyScoreAttribute();
        
        if ($score >= 0.8) {
            return 'excellent';
        } elseif ($score >= 0.6) {
            return 'good';
        } elseif ($score >= 0.4) {
            return 'average';
        } else {
            return 'poor';
        }
    }

    /**
     * Update analytics with new message data.
     */
    public function updateWithMessage(string $senderType, int $responseTime = null): void
    {
        $updates = [];
        
        // Update message counts
        $updates['total_messages'] = $this->total_messages + 1;
        
        switch ($senderType) {
            case 'customer':
                $updates['customer_messages'] = $this->customer_messages + 1;
                break;
            case 'bot':
                $updates['bot_messages'] = $this->bot_messages + 1;
                break;
            case 'agent':
                $updates['agent_messages'] = $this->agent_messages + 1;
                break;
        }
        
        // Update response time average
        if ($responseTime) {
            $currentAvg = $this->response_time_avg ?? 0;
            $totalResponses = $this->bot_messages + $this->agent_messages;
            $newAvg = (($currentAvg * $totalResponses) + $responseTime) / ($totalResponses + 1);
            $updates['response_time_avg'] = round($newAvg);
        }
        
        $this->update($updates);
    }

    /**
     * Generate summary insights.
     */
    public function generateInsights(): array
    {
        return [
            'efficiency_score' => $this->getEfficiencyScoreAttribute(),
            'conversation_type' => $this->getConversationTypeAttribute(),
            'complexity_level' => $this->getComplexityLevelAttribute(),
            'overall_sentiment' => $this->getOverallSentimentAttribute(),
            'primary_intent' => $this->getPrimaryIntentAttribute(),
            'top_topics' => $this->getTopTopicsAttribute(),
            'message_distribution' => [
                'customer' => $this->customer_messages,
                'bot' => $this->bot_messages,
                'agent' => $this->agent_messages,
            ],
            'performance_metrics' => [
                'avg_response_time' => $this->response_time_avg,
                'resolution_time' => $this->resolution_time,
                'total_messages' => $this->total_messages,
            ],
        ];
    }
}
