<?php

namespace App\Models;

use App\Traits\BelongsToOrganization;
use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class KnowledgeQaItem extends Model
{
    use HasFactory, HasUuid, BelongsToOrganization;

    protected $table = 'knowledge_qa_items';

    protected $fillable = [
        'knowledge_item_id',
        'organization_id',
        'question',
        'answer',
        'question_variations',
        'answer_variations',
        'context',
        'intent',
        'confidence_level',
        'keywords',
        'search_keywords',
        'trigger_phrases',
        'conditions',
        'response_rules',
        'usage_count',
        'success_rate',
        'user_satisfaction',
        'last_used_at',
        'ai_confidence',
        'ai_embeddings',
        'ai_last_trained_at',
        'search_vector',
        'order_index',
        'is_primary',
        'is_active',
        'metadata',
    ];

    protected $casts = [
        'question_variations' => 'array',
        'answer_variations' => 'array',
        'keywords' => 'array',
        'search_keywords' => 'array',
        'trigger_phrases' => 'array',
        'conditions' => 'array',
        'response_rules' => 'array',
        'success_rate' => 'decimal:2',
        'user_satisfaction' => 'decimal:2',
        'last_used_at' => 'datetime',
        'ai_confidence' => 'decimal:2',
        'ai_embeddings' => 'array',
        'ai_last_trained_at' => 'datetime',
        'is_primary' => 'boolean',
        'is_active' => 'boolean',
        'metadata' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the knowledge base item this Q&A belongs to.
     */
    public function knowledgeBaseItem(): BelongsTo
    {
        return $this->belongsTo(KnowledgeBaseItem::class, 'knowledge_item_id');
    }

    /**
     * Check if Q&A matches the given question.
     */
    public function matchesQuestion(string $question): bool
    {
        // Check main question
        if (stripos($this->question, $question) !== false) {
            return true;
        }

        // Check question variations
        foreach ($this->question_variations ?? [] as $variation) {
            if (stripos($variation, $question) !== false) {
                return true;
            }
        }

        // Check trigger phrases
        foreach ($this->trigger_phrases ?? [] as $phrase) {
            if (stripos($question, $phrase) !== false) {
                return true;
            }
        }

        return false;
    }

    /**
     * Get a random answer variation or the main answer.
     */
    public function getRandomAnswer(): string
    {
        $answers = array_merge([$this->answer], $this->answer_variations ?? []);
        return $answers[array_rand($answers)];
    }

    /**
     * Record usage of this Q&A.
     */
    public function recordUsage(bool $successful = true, float $satisfaction = null): void
    {
        $this->increment('usage_count');
        $this->update(['last_used_at' => now()]);

        if ($successful !== null) {
            $totalUses = $this->usage_count;
            $currentSuccessRate = $this->success_rate ?? 0;
            $newSuccessRate = (($currentSuccessRate * ($totalUses - 1)) + ($successful ? 100 : 0)) / $totalUses;
            $this->update(['success_rate' => $newSuccessRate]);
        }

        if ($satisfaction !== null) {
            $totalUses = $this->usage_count;
            $currentSatisfaction = $this->user_satisfaction ?? 0;
            $newSatisfaction = (($currentSatisfaction * ($totalUses - 1)) + $satisfaction) / $totalUses;
            $this->update(['user_satisfaction' => $newSatisfaction]);
        }
    }

    /**
     * Get confidence level as percentage.
     */
    public function getConfidencePercentageAttribute(): int
    {
        return match ($this->confidence_level) {
            'high' => 90,
            'medium' => 70,
            'low' => 50,
            default => 0,
        };
    }

    /**
     * Scope for active Q&A items.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope for primary Q&A items.
     */
    public function scopePrimary($query)
    {
        return $query->where('is_primary', true);
    }

    /**
     * Scope for specific confidence level.
     */
    public function scopeConfidenceLevel($query, string $level)
    {
        return $query->where('confidence_level', $level);
    }

    /**
     * Scope for high confidence items.
     */
    public function scopeHighConfidence($query)
    {
        return $query->where('confidence_level', 'high');
    }

    /**
     * Order by usage and order index.
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('order_index')
                    ->orderBy('is_primary', 'desc')
                    ->orderBy('usage_count', 'desc');
    }

    /**
     * Search in questions and answers.
     */
    public function scopeSearch($query, string $term)
    {
        return $query->where(function ($query) use ($term) {
            $query->where('question', 'LIKE', "%{$term}%")
                  ->orWhere('answer', 'LIKE', "%{$term}%")
                  ->orWhereJsonContains('question_variations', $term)
                  ->orWhereJsonContains('keywords', $term)
                  ->orWhereJsonContains('search_keywords', $term);
        });
    }
}
