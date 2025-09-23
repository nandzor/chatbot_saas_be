<?php

namespace App\Models;

use App\Traits\BelongsToOrganization;
use App\Traits\HasStatus;
use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class BotPersonality extends Model
{
    use HasFactory, HasUuid, BelongsToOrganization, HasStatus;

    protected $table = 'bot_personalities';

    protected $fillable = [
        'organization_id',
        'name',
        'code',
        'display_name',
        'description',
        'ai_model_id',
        'language',
        'tone',
        'communication_style',
        'formality_level',
        'avatar_url',
        'color_scheme',
        'greeting_message',
        'farewell_message',
        'error_message',
        'waiting_message',
        'transfer_message',
        'fallback_message',
        'system_message',
        'personality_traits',
        'custom_vocabulary',
        'response_templates',
        'conversation_starters',
        'response_delay_ms',
        'typing_indicator',
        'max_response_length',
        'enable_small_talk',
        'confidence_threshold',
        'learning_enabled',
        'training_data_sources',
        'last_trained_at',
        'total_conversations',
        'avg_satisfaction_score',
        'success_rate',
        'is_default',
        'status',
        'n8n_workflow_id',
        'waha_session_id',
        'knowledge_base_item_id',
    ];

    protected $casts = [
        'color_scheme' => 'array',
        'personality_traits' => 'array',
        'custom_vocabulary' => 'array',
        'response_templates' => 'array',
        'conversation_starters' => 'array',
        'response_delay_ms' => 'integer',
        'typing_indicator' => 'boolean',
        'max_response_length' => 'integer',
        'enable_small_talk' => 'boolean',
        'confidence_threshold' => 'decimal:2',
        'learning_enabled' => 'boolean',
        'training_data_sources' => 'array',
        'last_trained_at' => 'datetime',
        'avg_satisfaction_score' => 'decimal:2',
        'success_rate' => 'decimal:2',
        'is_default' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the AI model used by this personality.
     */
    public function aiModel(): BelongsTo
    {
        return $this->belongsTo(AiModel::class);
    }

    /**
     * Get the channel configs using this personality.
     */
    public function channelConfigs(): HasMany
    {
        return $this->hasMany(ChannelConfig::class, 'personality_id');
    }

    /**
     * Get the n8n workflow associated with this personality.
     */
    public function n8nWorkflow(): BelongsTo
    {
        return $this->belongsTo(N8nWorkflow::class, 'n8n_workflow_id');
    }

    /**
     * Get the WhatsApp session associated with this personality.
     */
    public function wahaSession(): BelongsTo
    {
        return $this->belongsTo(WahaSession::class, 'waha_session_id');
    }

    /**
     * Get the knowledge base item associated with this personality.
     */
    public function knowledgeBaseItem(): BelongsTo
    {
        return $this->belongsTo(KnowledgeBaseItem::class, 'knowledge_base_item_id');
    }

    /**
     * Check if this personality has an n8n workflow configured.
     */
    public function hasN8nWorkflow(): bool
    {
        return !is_null($this->n8n_workflow_id);
    }

    /**
     * Check if this personality has a WhatsApp session configured.
     */
    public function hasWahaSession(): bool
    {
        return !is_null($this->waha_session_id);
    }

    /**
     * Check if this personality has a knowledge base item configured.
     */
    public function hasKnowledgeBaseItem(): bool
    {
        return !is_null($this->knowledge_base_item_id);
    }

    /**
     * Get the n8n workflow name if available.
     */
    public function getN8nWorkflowNameAttribute(): ?string
    {
        return $this->n8nWorkflow?->name;
    }

    /**
     * Get the WhatsApp session name if available.
     */
    public function getWahaSessionNameAttribute(): ?string
    {
        return $this->wahaSession?->name;
    }

    /**
     * Get the knowledge base item title if available.
     */
    public function getKnowledgeBaseItemTitleAttribute(): ?string
    {
        return $this->knowledgeBaseItem?->title;
    }

    /**
     * Check if this is the default personality.
     */
    public function isDefault(): bool
    {
        return $this->is_default;
    }

    /**
     * Check if learning is enabled.
     */
    public function isLearningEnabled(): bool
    {
        return $this->learning_enabled;
    }

    /**
     * Check if small talk is enabled.
     */
    public function isSmallTalkEnabled(): bool
    {
        return $this->enable_small_talk;
    }

    /**
     * Check if typing indicator is enabled.
     */
    public function hasTypingIndicator(): bool
    {
        return $this->typing_indicator;
    }

    /**
     * Get satisfaction score as percentage.
     */
    public function getSatisfactionPercentageAttribute(): int
    {
        return round(($this->avg_satisfaction_score ?? 0) * 20); // Convert 5-point scale to percentage
    }

    /**
     * Get success rate as percentage.
     */
    public function getSuccessRatePercentageAttribute(): int
    {
        return round($this->success_rate ?? 0);
    }

    /**
     * Get conversation performance score.
     */
    public function getPerformanceScoreAttribute(): float
    {
        $satisfactionWeight = ($this->avg_satisfaction_score ?? 0) * 20 * 0.6; // 60% weight
        $successWeight = ($this->success_rate ?? 0) * 0.4; // 40% weight

        return round($satisfactionWeight + $successWeight, 2);
    }

    /**
     * Get primary color from color scheme.
     */
    public function getPrimaryColorAttribute(): string
    {
        return $this->color_scheme['primary'] ?? '#3B82F6';
    }

    /**
     * Get secondary color from color scheme.
     */
    public function getSecondaryColorAttribute(): string
    {
        return $this->color_scheme['secondary'] ?? '#10B981';
    }

    /**
     * Get a random conversation starter.
     */
    public function getRandomConversationStarter(): ?string
    {
        $starters = $this->conversation_starters ?? [];

        if (empty($starters)) {
            return null;
        }

        return $starters[array_rand($starters)];
    }

    /**
     * Get response template for specific intent.
     */
    public function getResponseTemplate(string $intent): ?string
    {
        $templates = $this->response_templates ?? [];
        return $templates[$intent] ?? null;
    }

    /**
     * Check if personality has specific trait.
     */
    public function hasTrait(string $trait): bool
    {
        $traits = $this->personality_traits ?? [];
        return isset($traits[$trait]) && $traits[$trait] === true;
    }

    /**
     * Get custom vocabulary for specific category.
     */
    public function getVocabulary(string $category): array
    {
        $vocabulary = $this->custom_vocabulary ?? [];
        return $vocabulary[$category] ?? [];
    }

    /**
     * Update conversation statistics.
     */
    public function updateConversationStats(float $satisfactionScore = null, bool $successful = true): void
    {
        $this->increment('total_conversations');

        if ($satisfactionScore !== null) {
            $currentAvg = $this->avg_satisfaction_score ?? 0;
            $newAvg = (($currentAvg * ($this->total_conversations - 1)) + $satisfactionScore) / $this->total_conversations;
            $this->update(['avg_satisfaction_score' => $newAvg]);
        }

        if ($successful !== null) {
            $currentRate = $this->success_rate ?? 0;
            $newRate = (($currentRate * ($this->total_conversations - 1)) + ($successful ? 100 : 0)) / $this->total_conversations;
            $this->update(['success_rate' => $newRate]);
        }
    }

    /**
     * Set as default personality.
     */
    public function setAsDefault(): void
    {
        // Remove default from other personalities in the same organization
        static::where('organization_id', $this->organization_id)
              ->where('id', '!=', $this->id)
              ->update(['is_default' => false]);

        $this->update(['is_default' => true]);
    }

    /**
     * Add training data source.
     */
    public function addTrainingDataSource(string $source): void
    {
        $sources = $this->training_data_sources ?? [];
        if (!in_array($source, $sources)) {
            $sources[] = $source;
            $this->update(['training_data_sources' => $sources]);
        }
    }

    /**
     * Remove training data source.
     */
    public function removeTrainingDataSource(string $source): void
    {
        $sources = $this->training_data_sources ?? [];
        $sources = array_filter($sources, fn($s) => $s !== $source);
        $this->update(['training_data_sources' => array_values($sources)]);
    }

    /**
     * Mark as trained.
     */
    public function markAsTrained(): void
    {
        $this->update(['last_trained_at' => now()]);
    }

    /**
     * Get training freshness in days.
     */
    public function getTrainingFreshnessAttribute(): ?int
    {
        if (!$this->last_trained_at) {
            return null;
        }

        return $this->last_trained_at->diffInDays(now());
    }

    /**
     * Check if personality needs retraining.
     */
    public function needsRetraining(int $maxDays = 30): bool
    {
        if (!$this->learning_enabled) {
            return false;
        }

        $freshness = $this->training_freshness;
        return $freshness === null || $freshness > $maxDays;
    }

    /**
     * Scope for default personalities.
     */
    public function scopeDefault($query)
    {
        return $query->where('is_default', true);
    }

    /**
     * Scope for specific language.
     */
    public function scopeLanguage($query, string $language)
    {
        return $query->where('language', $language);
    }

    /**
     * Scope for learning-enabled personalities.
     */
    public function scopeLearningEnabled($query)
    {
        return $query->where('learning_enabled', true);
    }

    /**
     * Scope for high-performing personalities.
     */
    public function scopeHighPerformance($query, float $minScore = 80)
    {
        return $query->whereRaw('(avg_satisfaction_score * 20 * 0.6 + success_rate * 0.4) >= ?', [$minScore]);
    }

    /**
     * Scope for personalities needing retraining.
     */
    public function scopeNeedsRetraining($query, int $maxDays = 30)
    {
        return $query->where('learning_enabled', true)
                    ->where(function ($query) use ($maxDays) {
                        $query->whereNull('last_trained_at')
                              ->orWhere('last_trained_at', '<', now()->subDays($maxDays));
                    });
    }

    /**
     * Order by performance score.
     */
    public function scopeByPerformance($query)
    {
        return $query->orderByRaw('(avg_satisfaction_score * 20 * 0.6 + success_rate * 0.4) DESC');
    }

    /**
     * Order by conversation count.
     */
    public function scopeByUsage($query)
    {
        return $query->orderBy('total_conversations', 'desc');
    }

    /**
     * Search by name or description.
     */
    public function scopeSearch($query, string $term)
    {
        return $query->where(function ($query) use ($term) {
            $query->where('name', 'LIKE', "%{$term}%")
                  ->orWhere('display_name', 'LIKE', "%{$term}%")
                  ->orWhere('description', 'LIKE', "%{$term}%");
        });
    }

    /**
     * Scope for personalities with n8n workflow configured.
     */
    public function scopeWithN8nWorkflow($query)
    {
        return $query->whereNotNull('n8n_workflow_id');
    }

    /**
     * Scope for personalities with WhatsApp session configured.
     */
    public function scopeWithWahaSession($query)
    {
        return $query->whereNotNull('waha_session_id');
    }

    /**
     * Scope for personalities with knowledge base item configured.
     */
    public function scopeWithKnowledgeBaseItem($query)
    {
        return $query->whereNotNull('knowledge_base_item_id');
    }

    /**
     * Scope for personalities without n8n workflow.
     */
    public function scopeWithoutN8nWorkflow($query)
    {
        return $query->whereNull('n8n_workflow_id');
    }

    /**
     * Scope for personalities without WhatsApp session.
     */
    public function scopeWithoutWahaSession($query)
    {
        return $query->whereNull('waha_session_id');
    }

    /**
     * Scope for personalities without knowledge base item.
     */
    public function scopeWithoutKnowledgeBaseItem($query)
    {
        return $query->whereNull('knowledge_base_item_id');
    }

    /**
     * Scope for personalities with specific n8n workflow.
     */
    public function scopeWithN8nWorkflowId($query, string $workflowId)
    {
        return $query->where('n8n_workflow_id', $workflowId);
    }

    /**
     * Scope for personalities with specific WhatsApp session.
     */
    public function scopeWithWahaSessionId($query, string $sessionId)
    {
        return $query->where('waha_session_id', $sessionId);
    }

    /**
     * Scope for personalities with specific knowledge base item.
     */
    public function scopeWithKnowledgeBaseItemId($query, string $itemId)
    {
        return $query->where('knowledge_base_item_id', $itemId);
    }
}
