<?php

namespace App\Models;

use App\Traits\BelongsToOrganization;
use App\Traits\HasStatus;
use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AiTrainingData extends Model
{
    use HasFactory, HasUuid, BelongsToOrganization, HasStatus;

    protected $table = 'ai_training_data';

    protected $fillable = [
        'organization_id',
        'source_type',
        'source_id',
        'input_text',
        'expected_output',
        'context',
        'intent',
        'entities',
        'is_validated',
        'validation_score',
        'human_reviewed',
        'reviewed_by',
        'reviewed_at',
        'language',
        'difficulty_level',
        'training_tags',
        'status',
    ];

    protected $casts = [
        'entities' => 'array',
        'is_validated' => 'boolean',
        'validation_score' => 'decimal:2',
        'human_reviewed' => 'boolean',
        'reviewed_at' => 'datetime',
        'training_tags' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the user who reviewed this training data.
     */
    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    /**
     * Get the source model based on source_type and source_id.
     */
    public function source()
    {
        return match ($this->source_type) {
            'conversation' => $this->belongsTo(ChatSession::class, 'source_id'),
            'knowledge_article' => $this->belongsTo(KnowledgeBaseItem::class, 'source_id'),
            'qa_item' => $this->belongsTo(KnowledgeQaItem::class, 'source_id'),
            default => null,
        };
    }

    /**
     * Check if training data is validated.
     */
    public function isValidated(): bool
    {
        return $this->is_validated;
    }

    /**
     * Check if training data has been human reviewed.
     */
    public function isHumanReviewed(): bool
    {
        return $this->human_reviewed;
    }

    /**
     * Check if training data is high quality.
     */
    public function isHighQuality(): bool
    {
        return $this->validation_score >= 0.8 && $this->is_validated;
    }

    /**
     * Get validation score as percentage.
     */
    public function getValidationPercentageAttribute(): int
    {
        return round(($this->validation_score ?? 0) * 100);
    }

    /**
     * Get quality level based on validation score.
     */
    public function getQualityLevelAttribute(): string
    {
        $score = $this->validation_score ?? 0;

        return match (true) {
            $score >= 0.9 => 'excellent',
            $score >= 0.8 => 'high',
            $score >= 0.6 => 'medium',
            $score >= 0.4 => 'low',
            default => 'poor',
        };
    }

    /**
     * Validate the training data.
     */
    public function validate(float $score, User $reviewer = null): void
    {
        $this->update([
            'is_validated' => true,
            'validation_score' => $score,
            'human_reviewed' => $reviewer ? true : false,
            'reviewed_by' => $reviewer?->id,
            'reviewed_at' => now(),
        ]);
    }

    /**
     * Mark as invalid.
     */
    public function markInvalid(User $reviewer = null): void
    {
        $this->update([
            'is_validated' => false,
            'validation_score' => 0,
            'human_reviewed' => $reviewer ? true : false,
            'reviewed_by' => $reviewer?->id,
            'reviewed_at' => now(),
            'status' => 'inactive',
        ]);
    }

    /**
     * Add training tags.
     */
    public function addTags(array $tags): void
    {
        $currentTags = $this->training_tags ?? [];
        $newTags = array_unique(array_merge($currentTags, $tags));
        $this->update(['training_tags' => $newTags]);
    }

    /**
     * Remove training tags.
     */
    public function removeTags(array $tags): void
    {
        $currentTags = $this->training_tags ?? [];
        $newTags = array_diff($currentTags, $tags);
        $this->update(['training_tags' => array_values($newTags)]);
    }

    /**
     * Check if has specific tag.
     */
    public function hasTag(string $tag): bool
    {
        return in_array($tag, $this->training_tags ?? []);
    }

    /**
     * Create training data from conversation.
     */
    public static function createFromConversation(ChatSession $session, string $input, string $output, array $metadata = []): self
    {
        return static::create([
            'organization_id' => $session->organization_id,
            'source_type' => 'conversation',
            'source_id' => $session->id,
            'input_text' => $input,
            'expected_output' => $output,
            'context' => $metadata['context'] ?? null,
            'intent' => $metadata['intent'] ?? null,
            'entities' => $metadata['entities'] ?? [],
            'language' => $metadata['language'] ?? 'indonesia',
            'difficulty_level' => $metadata['difficulty_level'] ?? 'basic',
            'training_tags' => $metadata['tags'] ?? [],
        ]);
    }

    /**
     * Create training data from knowledge article.
     */
    public static function createFromKnowledgeItem(KnowledgeBaseItem $item, string $input = null, string $output = null): self
    {
        return static::create([
            'organization_id' => $item->organization_id,
            'source_type' => 'knowledge_article',
            'source_id' => $item->id,
            'input_text' => $input ?? $item->title,
            'expected_output' => $output ?? $item->summary ?? $item->excerpt,
            'context' => $item->description,
            'intent' => $item->intent,
            'language' => $item->language,
            'difficulty_level' => $item->difficulty_level,
            'training_tags' => $item->tags ?? [],
        ]);
    }

    /**
     * Scope for validated training data.
     */
    public function scopeValidated($query)
    {
        return $query->where('is_validated', true);
    }

    /**
     * Scope for human reviewed data.
     */
    public function scopeHumanReviewed($query)
    {
        return $query->where('human_reviewed', true);
    }

    /**
     * Scope for high quality data.
     */
    public function scopeHighQuality($query, float $minScore = 0.8)
    {
        return $query->where('is_validated', true)
                    ->where('validation_score', '>=', $minScore);
    }

    /**
     * Scope for specific source type.
     */
    public function scopeSourceType($query, string $type)
    {
        return $query->where('source_type', $type);
    }

    /**
     * Scope for specific language.
     */
    public function scopeLanguage($query, string $language)
    {
        return $query->where('language', $language);
    }

    /**
     * Scope for specific difficulty level.
     */
    public function scopeDifficultyLevel($query, string $level)
    {
        return $query->where('difficulty_level', $level);
    }

    /**
     * Scope for data with specific tag.
     */
    public function scopeWithTag($query, string $tag)
    {
        return $query->whereJsonContains('training_tags', $tag);
    }

    /**
     * Scope for unreviewed data.
     */
    public function scopeUnreviewed($query)
    {
        return $query->where('human_reviewed', false);
    }

    /**
     * Order by validation score.
     */
    public function scopeByQuality($query)
    {
        return $query->orderBy('validation_score', 'desc')
                    ->orderBy('is_validated', 'desc');
    }

    /**
     * Search in input and output text.
     */
    public function scopeSearch($query, string $term)
    {
        return $query->where(function ($query) use ($term) {
            $query->where('input_text', 'LIKE', "%{$term}%")
                  ->orWhere('expected_output', 'LIKE', "%{$term}%")
                  ->orWhere('context', 'LIKE', "%{$term}%");
        });
    }
}
