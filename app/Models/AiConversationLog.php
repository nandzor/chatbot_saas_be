<?php

namespace App\Models;

use App\Traits\BelongsToOrganization;
use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AiConversationLog extends Model
{
    use HasFactory, HasUuid, BelongsToOrganization;

    protected $table = 'ai_conversations_log';

    protected $fillable = [
        'organization_id',
        'session_id',
        'message_id',
        'ai_model_id',
        'prompt',
        'response',
        'response_time_ms',
        'token_count_input',
        'token_count_output',
        'cost_usd',
        'confidence_score',
        'user_feedback',
        'error_message',
        'retry_count',
    ];

    protected $casts = [
        'response_time_ms' => 'integer',
        'token_count_input' => 'integer',
        'token_count_output' => 'integer',
        'cost_usd' => 'decimal:6',
        'confidence_score' => 'decimal:2',
        'user_feedback' => 'integer',
        'retry_count' => 'integer',
        'created_at' => 'datetime',
    ];

    /**
     * Get the AI model used for this conversation.
     */
    public function aiModel(): BelongsTo
    {
        return $this->belongsTo(AiModel::class);
    }

    /**
     * Get the chat session this log belongs to.
     */
    public function chatSession(): BelongsTo
    {
        return $this->belongsTo(ChatSession::class, 'session_id');
    }

    /**
     * Get the message this log is related to.
     */
    public function message(): BelongsTo
    {
        return $this->belongsTo(Message::class);
    }

    /**
     * Check if the AI request was successful.
     */
    public function isSuccessful(): bool
    {
        return is_null($this->error_message) && !is_null($this->response);
    }

    /**
     * Check if the AI request failed.
     */
    public function isFailed(): bool
    {
        return !is_null($this->error_message);
    }

    /**
     * Check if there were retries.
     */
    public function hasRetries(): bool
    {
        return $this->retry_count > 0;
    }

    /**
     * Check if user feedback is positive.
     */
    public function isPositiveFeedback(): bool
    {
        return $this->user_feedback === 1;
    }

    /**
     * Check if user feedback is negative.
     */
    public function isNegativeFeedback(): bool
    {
        return $this->user_feedback === -1;
    }

    /**
     * Check if user feedback is neutral.
     */
    public function isNeutralFeedback(): bool
    {
        return $this->user_feedback === 0;
    }

    /**
     * Get response time in human readable format.
     */
    public function getResponseTimeHumanAttribute(): string
    {
        if ($this->response_time_ms < 1000) {
            return $this->response_time_ms . 'ms';
        }

        return round($this->response_time_ms / 1000, 2) . 's';
    }

    /**
     * Get total token count.
     */
    public function getTotalTokensAttribute(): int
    {
        return ($this->token_count_input ?? 0) + ($this->token_count_output ?? 0);
    }

    /**
     * Get cost in a more readable format.
     */
    public function getCostFormattedAttribute(): string
    {
        return '$' . number_format($this->cost_usd ?? 0, 4);
    }

    /**
     * Get confidence percentage.
     */
    public function getConfidencePercentageAttribute(): int
    {
        return round(($this->confidence_score ?? 0) * 100);
    }

    /**
     * Get efficiency score (tokens per second).
     */
    public function getEfficiencyScoreAttribute(): float
    {
        if (!$this->response_time_ms || $this->response_time_ms === 0) {
            return 0;
        }

        $tokensPerMs = $this->total_tokens / $this->response_time_ms;
        return round($tokensPerMs * 1000, 2); // tokens per second
    }

    /**
     * Record user feedback.
     */
    public function recordFeedback(int $feedback): void
    {
        $this->update(['user_feedback' => $feedback]);
    }

    /**
     * Mark as failed with error message.
     */
    public function markFailed(string $errorMessage): void
    {
        $this->update([
            'error_message' => $errorMessage,
        ]);
    }

    /**
     * Increment retry count.
     */
    public function incrementRetry(): void
    {
        $this->increment('retry_count');
    }

    /**
     * Get feedback text representation.
     */
    public function getFeedbackTextAttribute(): string
    {
        return match ($this->user_feedback) {
            1 => 'Positive',
            0 => 'Neutral',
            -1 => 'Negative',
            default => 'No feedback',
        };
    }

    /**
     * Create log entry for successful AI request.
     */
    public static function logSuccess(
        string $organizationId,
        string $aiModelId,
        string $prompt,
        string $response,
        int $responseTime,
        int $inputTokens = 0,
        int $outputTokens = 0,
        float $cost = 0,
        float $confidence = null,
        string $sessionId = null,
        string $messageId = null
    ): self {
        return static::create([
            'organization_id' => $organizationId,
            'ai_model_id' => $aiModelId,
            'session_id' => $sessionId,
            'message_id' => $messageId,
            'prompt' => $prompt,
            'response' => $response,
            'response_time_ms' => $responseTime,
            'token_count_input' => $inputTokens,
            'token_count_output' => $outputTokens,
            'cost_usd' => $cost,
            'confidence_score' => $confidence,
        ]);
    }

    /**
     * Create log entry for failed AI request.
     */
    public static function logFailure(
        string $organizationId,
        string $aiModelId,
        string $prompt,
        string $errorMessage,
        int $responseTime = 0,
        int $retryCount = 0,
        string $sessionId = null,
        string $messageId = null
    ): self {
        return static::create([
            'organization_id' => $organizationId,
            'ai_model_id' => $aiModelId,
            'session_id' => $sessionId,
            'message_id' => $messageId,
            'prompt' => $prompt,
            'error_message' => $errorMessage,
            'response_time_ms' => $responseTime,
            'retry_count' => $retryCount,
        ]);
    }

    /**
     * Scope for successful requests.
     */
    public function scopeSuccessful($query)
    {
        return $query->whereNull('error_message')
                    ->whereNotNull('response');
    }

    /**
     * Scope for failed requests.
     */
    public function scopeFailed($query)
    {
        return $query->whereNotNull('error_message');
    }

    /**
     * Scope for requests with retries.
     */
    public function scopeWithRetries($query)
    {
        return $query->where('retry_count', '>', 0);
    }

    /**
     * Scope for specific AI model.
     */
    public function scopeForModel($query, string $modelId)
    {
        return $query->where('ai_model_id', $modelId);
    }

    /**
     * Scope for positive feedback.
     */
    public function scopePositiveFeedback($query)
    {
        return $query->where('user_feedback', 1);
    }

    /**
     * Scope for negative feedback.
     */
    public function scopeNegativeFeedback($query)
    {
        return $query->where('user_feedback', -1);
    }

    /**
     * Scope for high confidence responses.
     */
    public function scopeHighConfidence($query, float $minConfidence = 0.8)
    {
        return $query->where('confidence_score', '>=', $minConfidence);
    }

    /**
     * Scope for slow responses.
     */
    public function scopeSlowResponses($query, int $maxResponseTime = 5000)
    {
        return $query->where('response_time_ms', '>', $maxResponseTime);
    }

    /**
     * Scope for expensive requests.
     */
    public function scopeExpensive($query, float $minCost = 0.01)
    {
        return $query->where('cost_usd', '>=', $minCost);
    }

    /**
     * Scope for date range.
     */
    public function scopeDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('created_at', [$startDate, $endDate]);
    }

    /**
     * Order by response time.
     */
    public function scopeByResponseTime($query, string $direction = 'asc')
    {
        return $query->orderBy('response_time_ms', $direction);
    }

    /**
     * Order by cost.
     */
    public function scopeByCost($query, string $direction = 'desc')
    {
        return $query->orderBy('cost_usd', $direction);
    }

    /**
     * Order by confidence.
     */
    public function scopeByConfidence($query, string $direction = 'desc')
    {
        return $query->orderBy('confidence_score', $direction);
    }

    /**
     * Search in prompt and response.
     */
    public function scopeSearch($query, string $term)
    {
        return $query->where(function ($query) use ($term) {
            $query->where('prompt', 'LIKE', "%{$term}%")
                  ->orWhere('response', 'LIKE', "%{$term}%");
        });
    }
}
