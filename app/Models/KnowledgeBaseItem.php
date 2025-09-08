<?php

namespace App\Models;

use App\Traits\BelongsToOrganization;
use App\Traits\HasStatus;
use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class KnowledgeBaseItem extends Model
{
    use HasFactory, HasUuid, BelongsToOrganization, HasStatus;

    protected $table = 'knowledge_base_items';

    protected $fillable = [
        'organization_id',
        'category_id',
        'title',
        'slug',
        'description',
        'content_type',
        'content',
        'summary',
        'excerpt',
        'tags',
        'keywords',
        'language',
        'difficulty_level',
        'priority',
        'estimated_read_time',
        'word_count',
        'meta_title',
        'meta_description',
        'featured_image_url',
        'is_featured',
        'is_public',
        'is_searchable',
        'is_ai_trainable',
        'requires_approval',
        'workflow_status',
        'approval_status',
        'author_id',
        'reviewer_id',
        'approved_by',
        'published_at',
        'last_reviewed_at',
        'approved_at',
        'view_count',
        'helpful_count',
        'not_helpful_count',
        'share_count',
        'comment_count',
        'search_hit_count',
        'ai_usage_count',
        'embeddings_data',
        'embeddings_vector',
        'search_vector',
        'ai_generated',
        'ai_confidence_score',
        'ai_last_processed_at',
        'version',
        'previous_version_id',
        'is_latest_version',
        'change_summary',
        'quality_score',
        'effectiveness_score',
        'last_effectiveness_update',
        'metadata',
        'configuration',
        'status',
    ];

    protected $casts = [
        'tags' => 'array',
        'keywords' => 'array',
        'is_featured' => 'boolean',
        'is_public' => 'boolean',
        'is_searchable' => 'boolean',
        'is_ai_trainable' => 'boolean',
        'requires_approval' => 'boolean',
        'published_at' => 'datetime',
        'last_reviewed_at' => 'datetime',
        'approved_at' => 'datetime',
        'embeddings_data' => 'array',
        'embeddings_vector' => 'array',
        'ai_generated' => 'boolean',
        'ai_confidence_score' => 'decimal:2',
        'ai_last_processed_at' => 'datetime',
        'is_latest_version' => 'boolean',
        'quality_score' => 'decimal:2',
        'effectiveness_score' => 'decimal:2',
        'last_effectiveness_update' => 'datetime',
        'metadata' => 'array',
        'configuration' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the category this item belongs to.
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(KnowledgeBaseCategory::class, 'category_id');
    }

    /**
     * Get the author of this item.
     */
    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'author_id');
    }

    /**
     * Get the reviewer of this item.
     */
    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewer_id');
    }

    /**
     * Get the user who approved this item.
     */
    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    /**
     * Get the Q&A items for this knowledge base item.
     */
    public function qaItems(): HasMany
    {
        return $this->hasMany(KnowledgeQaItem::class, 'knowledge_item_id');
    }

    /**
     * Get the active Q&A items.
     */
    public function activeQaItems(): HasMany
    {
        return $this->qaItems()->where('is_active', true);
    }

    /**
     * Get the primary Q&A items.
     */
    public function primaryQaItems(): HasMany
    {
        return $this->qaItems()->where('is_primary', true);
    }

    /**
     * Get the tags associated with this item.
     */
    public function knowledgeTags(): BelongsToMany
    {
        return $this->belongsToMany(KnowledgeBaseTag::class, 'knowledge_base_item_tags', 'knowledge_item_id', 'tag_id')
                    ->withPivot(['assigned_by', 'assigned_at', 'is_auto_assigned', 'confidence_score'])
                    ->withTimestamps();
    }

    /**
     * Get the manual tags (not auto-assigned).
     */
    public function manualTags(): BelongsToMany
    {
        return $this->knowledgeTags()->wherePivot('is_auto_assigned', false);
    }

    /**
     * Get the auto-assigned tags.
     */
    public function autoTags(): BelongsToMany
    {
        return $this->knowledgeTags()->wherePivot('is_auto_assigned', true);
    }

    /**
     * Get the source relationships (items that reference this item).
     */
    public function sourceRelationships(): HasMany
    {
        return $this->hasMany(KnowledgeBaseItemRelationship::class, 'target_item_id');
    }

    /**
     * Get the target relationships (items this item references).
     */
    public function targetRelationships(): HasMany
    {
        return $this->hasMany(KnowledgeBaseItemRelationship::class, 'source_item_id');
    }

    /**
     * Get related items through relationships.
     */
    public function relatedItems(): BelongsToMany
    {
        return $this->belongsToMany(
            KnowledgeBaseItem::class,
            'knowledge_base_item_relationships',
            'source_item_id',
            'target_item_id'
        )->withPivot(['relationship_type', 'strength', 'description', 'is_auto_discovered']);
    }

    /**
     * Get the previous version of this item.
     */
    public function previousVersion(): BelongsTo
    {
        return $this->belongsTo(KnowledgeBaseItem::class, 'previous_version_id');
    }

    /**
     * Get the next versions of this item.
     */
    public function nextVersions(): HasMany
    {
        return $this->hasMany(KnowledgeBaseItem::class, 'previous_version_id');
    }

    /**
     * Check if item is published.
     */
    public function isPublished(): bool
    {
        return $this->workflow_status === 'published' && $this->status === 'active';
    }

    /**
     * Check if item is approved.
     */
    public function isApproved(): bool
    {
        return $this->approval_status === 'approved';
    }

    /**
     * Check if item is a draft.
     */
    public function isDraft(): bool
    {
        return $this->workflow_status === 'draft';
    }

    /**
     * Check if item needs review.
     */
    public function needsReview(): bool
    {
        return $this->workflow_status === 'review';
    }

    /**
     * Check if item is an article type.
     */
    public function isArticle(): bool
    {
        return in_array($this->content_type, ['article', 'guide', 'tutorial']);
    }

    /**
     * Check if item is a Q&A collection.
     */
    public function isQaCollection(): bool
    {
        return $this->content_type === 'qa_collection';
    }

    /**
     * Check if item is FAQ.
     */
    public function isFaq(): bool
    {
        return $this->content_type === 'faq';
    }

    /**
     * Get the reading time in minutes.
     */
    public function getReadingTimeAttribute(): int
    {
        return $this->estimated_read_time ?: max(1, ceil(($this->word_count ?: 0) / 200));
    }

    /**
     * Get the effectiveness percentage.
     */
    public function getEffectivenessPercentageAttribute(): int
    {
        return round(($this->effectiveness_score ?: 0) * 100);
    }

    /**
     * Get the quality percentage.
     */
    public function getQualityPercentageAttribute(): int
    {
        return round(($this->quality_score ?: 0) * 100);
    }

    /**
     * Increment view count.
     */
    public function incrementViews(): void
    {
        $this->increment('view_count');
    }

    /**
     * Increment helpful count.
     */
    public function incrementHelpful(): void
    {
        $this->increment('helpful_count');
    }

    /**
     * Increment not helpful count.
     */
    public function incrementNotHelpful(): void
    {
        $this->increment('not_helpful_count');
    }

    /**
     * Scope for published items.
     */
    public function scopePublished($query)
    {
        return $query->where('workflow_status', 'published')
                    ->where('status', 'active');
    }

    /**
     * Scope for draft items.
     */
    public function scopeDrafts($query)
    {
        return $query->where('workflow_status', 'draft');
    }

    /**
     * Scope for items needing review.
     */
    public function scopeNeedsReview($query)
    {
        return $query->where('workflow_status', 'review');
    }

    /**
     * Scope for approved items.
     */
    public function scopeApproved($query)
    {
        return $query->where('approval_status', 'approved');
    }

    /**
     * Scope for public items.
     */
    public function scopePublic($query)
    {
        return $query->where('is_public', true);
    }

    /**
     * Scope for featured items.
     */
    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }

    /**
     * Scope for searchable items.
     */
    public function scopeSearchable($query)
    {
        return $query->where('is_searchable', true);
    }

    /**
     * Scope for AI trainable items.
     */
    public function scopeAiTrainable($query)
    {
        return $query->where('is_ai_trainable', true);
    }

    /**
     * Scope for specific content type.
     */
    public function scopeContentType($query, string $type)
    {
        return $query->where('content_type', $type);
    }

    /**
     * Scope for articles.
     */
    public function scopeArticles($query)
    {
        return $query->whereIn('content_type', ['article', 'guide', 'tutorial']);
    }

    /**
     * Scope for Q&A collections.
     */
    public function scopeQaCollections($query)
    {
        return $query->where('content_type', 'qa_collection');
    }

    /**
     * Scope for FAQ items.
     */
    public function scopeFaqs($query)
    {
        return $query->where('content_type', 'faq');
    }

    /**
     * Scope for specific language.
     */
    public function scopeLanguage($query, string $language)
    {
        return $query->where('language', $language);
    }

    /**
     * Scope for specific priority.
     */
    public function scopePriority($query, string $priority)
    {
        return $query->where('priority', $priority);
    }

    /**
     * Scope for latest versions.
     */
    public function scopeLatestVersions($query)
    {
        return $query->where('is_latest_version', true);
    }

    /**
     * Order by priority and creation date.
     */
    public function scopeOrdered($query)
    {
        return $query->orderByRaw("FIELD(priority, 'critical', 'high', 'medium', 'low')")
                    ->orderBy('created_at', 'desc');
    }

    /**
     * Search scope using full-text search.
     */
    public function scopeSearch($query, string $term)
    {
        return $query->whereRaw("MATCH(title, description, content) AGAINST(? IN NATURAL LANGUAGE MODE)", [$term])
                    ->orWhere('title', 'LIKE', "%{$term}%")
                    ->orWhere('description', 'LIKE', "%{$term}%");
    }

    /**
     * Scope for items by category.
     */
    public function scopeByCategory($query, string $categoryId)
    {
        return $query->where('category_id', $categoryId);
    }

    /**
     * Scope for items by author.
     */
    public function scopeByAuthor($query, string $authorId)
    {
        return $query->where('author_id', $authorId);
    }

    /**
     * Scope for items by workflow status.
     */
    public function scopeByWorkflowStatus($query, string $status)
    {
        return $query->where('workflow_status', $status);
    }

    /**
     * Scope for items by approval status.
     */
    public function scopeByApprovalStatus($query, string $status)
    {
        return $query->where('approval_status', $status);
    }

    /**
     * Scope for items by content type.
     */
    public function scopeByContentType($query, string $type)
    {
        return $query->where('content_type', $type);
    }

    /**
     * Scope for items by language.
     */
    public function scopeByLanguage($query, string $language)
    {
        return $query->where('language', $language);
    }

    /**
     * Scope for items by difficulty level.
     */
    public function scopeByDifficultyLevel($query, string $level)
    {
        return $query->where('difficulty_level', $level);
    }

    /**
     * Scope for items by tags.
     */
    public function scopeByTags($query, array $tagIds)
    {
        return $query->whereHas('knowledgeTags', function ($q) use ($tagIds) {
            $q->whereIn('tag_id', $tagIds);
        });
    }

    /**
     * Scope for items by keywords.
     */
    public function scopeByKeywords($query, array $keywords)
    {
        return $query->where(function ($q) use ($keywords) {
            foreach ($keywords as $keyword) {
                $q->orWhereJsonContains('keywords', $keyword);
            }
        });
    }

    /**
     * Scope for latest versions only.
     */
    public function scopeLatestVersions($query)
    {
        return $query->where('is_latest_version', true);
    }

    /**
     * Scope for active items only.
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Scope for items with specific priority.
     */
    public function scopeByPriority($query, string $priority)
    {
        return $query->where('priority', $priority);
    }

    /**
     * Scope for items created within date range.
     */
    public function scopeCreatedBetween($query, $startDate, $endDate)
    {
        return $query->whereBetween('created_at', [$startDate, $endDate]);
    }

    /**
     * Scope for items updated within date range.
     */
    public function scopeUpdatedBetween($query, $startDate, $endDate)
    {
        return $query->whereBetween('updated_at', [$startDate, $endDate]);
    }

    /**
     * Scope for items with minimum view count.
     */
    public function scopeMinViews($query, int $minViews)
    {
        return $query->where('view_count', '>=', $minViews);
    }

    /**
     * Scope for items with minimum quality score.
     */
    public function scopeMinQualityScore($query, float $minScore)
    {
        return $query->where('quality_score', '>=', $minScore);
    }

    /**
     * Scope for items with minimum effectiveness score.
     */
    public function scopeMinEffectivenessScore($query, float $minScore)
    {
        return $query->where('effectiveness_score', '>=', $minScore);
    }
}
