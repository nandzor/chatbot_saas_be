<?php

namespace App\Models;

use App\Traits\BelongsToOrganization;
use App\Traits\HasStatus;
use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AiModel extends Model
{
    use HasFactory, HasUuid, BelongsToOrganization, HasStatus;

    protected $table = 'ai_models';

    protected $fillable = [
        'organization_id',
        'name',
        'model_type',
        'api_endpoint',
        'api_key_encrypted',
        'model_version',
        'temperature',
        'max_tokens',
        'top_p',
        'frequency_penalty',
        'presence_penalty',
        'system_prompt',
        'context_prompt',
        'fallback_responses',
        'total_requests',
        'avg_response_time',
        'success_rate',
        'cost_per_request',
        'is_default',
        'status',
    ];

    protected $casts = [
        'temperature' => 'decimal:2',
        'max_tokens' => 'integer',
        'top_p' => 'decimal:2',
        'frequency_penalty' => 'decimal:2',
        'presence_penalty' => 'decimal:2',
        'fallback_responses' => 'array',
        'success_rate' => 'decimal:2',
        'cost_per_request' => 'decimal:6',
        'is_default' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    protected $hidden = [
        'api_key_encrypted',
    ];

    /**
     * Get the bot personalities using this AI model.
     */
    public function botPersonalities(): HasMany
    {
        return $this->hasMany(BotPersonality::class);
    }

    /**
     * Get the AI conversation logs for this model.
     */
    public function conversationLogs(): HasMany
    {
        return $this->hasMany(AiConversationLog::class);
    }

    /**
     * Check if this is the default model.
     */
    public function isDefault(): bool
    {
        return $this->is_default;
    }

    /**
     * Check if model is OpenAI based.
     */
    public function isOpenAI(): bool
    {
        return str_starts_with($this->model_type, 'gpt-');
    }

    /**
     * Check if model is Claude based.
     */
    public function isClaude(): bool
    {
        return str_starts_with($this->model_type, 'claude-');
    }

    /**
     * Check if model is Gemini based.
     */
    public function isGemini(): bool
    {
        return str_starts_with($this->model_type, 'gemini-');
    }

    /**
     * Get model configuration for API calls.
     */
    public function getConfigurationAttribute(): array
    {
        return [
            'model' => $this->model_type,
            'temperature' => $this->temperature,
            'max_tokens' => $this->max_tokens,
            'top_p' => $this->top_p,
            'frequency_penalty' => $this->frequency_penalty,
            'presence_penalty' => $this->presence_penalty,
        ];
    }

    /**
     * Get success rate as percentage.
     */
    public function getSuccessRatePercentageAttribute(): int
    {
        return round($this->success_rate ?? 0);
    }

    /**
     * Get average response time in human readable format.
     */
    public function getAvgResponseTimeHumanAttribute(): string
    {
        $time = $this->avg_response_time ?? 0;

        if ($time < 1000) {
            return $time . 'ms';
        }

        return round($time / 1000, 2) . 's';
    }

    /**
     * Record a request for performance tracking.
     */
    public function recordRequest(int $responseTime, bool $successful = true, float $cost = 0): void
    {
        $this->increment('total_requests');

        // Update average response time
        $totalRequests = $this->total_requests;
        $currentAvg = $this->avg_response_time ?? 0;
        $newAvg = (($currentAvg * ($totalRequests - 1)) + $responseTime) / $totalRequests;

        // Update success rate
        $currentSuccessRate = $this->success_rate ?? 0;
        $newSuccessRate = (($currentSuccessRate * ($totalRequests - 1)) + ($successful ? 100 : 0)) / $totalRequests;

        $this->update([
            'avg_response_time' => round($newAvg),
            'success_rate' => $newSuccessRate,
            'cost_per_request' => $cost > 0 ? $cost : $this->cost_per_request,
        ]);
    }

    /**
     * Get a random fallback response.
     */
    public function getRandomFallbackResponse(): ?string
    {
        $responses = $this->fallback_responses ?? [];

        if (empty($responses)) {
            return null;
        }

        return $responses[array_rand($responses)];
    }

    /**
     * Set as default model for the organization.
     */
    public function setAsDefault(): void
    {
        // Remove default from other models in the same organization
        static::where('organization_id', $this->organization_id)
              ->where('id', '!=', $this->id)
              ->update(['is_default' => false]);

        $this->update(['is_default' => true]);
    }

    /**
     * Scope for default models.
     */
    public function scopeDefault($query)
    {
        return $query->where('is_default', true);
    }

    /**
     * Scope for specific model type.
     */
    public function scopeModelType($query, string $type)
    {
        return $query->where('model_type', $type);
    }

    /**
     * Scope for OpenAI models.
     */
    public function scopeOpenAI($query)
    {
        return $query->where('model_type', 'LIKE', 'gpt-%');
    }

    /**
     * Scope for Claude models.
     */
    public function scopeClaude($query)
    {
        return $query->where('model_type', 'LIKE', 'claude-%');
    }

    /**
     * Scope for high-performing models.
     */
    public function scopeHighPerformance($query, float $minSuccessRate = 95)
    {
        return $query->where('success_rate', '>=', $minSuccessRate);
    }

    /**
     * Order by performance (success rate and response time).
     */
    public function scopeByPerformance($query)
    {
        return $query->orderBy('success_rate', 'desc')
                    ->orderBy('avg_response_time', 'asc');
    }
}
