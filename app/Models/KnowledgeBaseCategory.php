<?php

namespace App\Models;

use App\Traits\BelongsToOrganization;
use App\Traits\HasStatus;
use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class KnowledgeBaseCategory extends Model
{
    use HasFactory, HasUuid, BelongsToOrganization, HasStatus;

    protected $table = 'knowledge_base_categories';

    protected $fillable = [
        'organization_id',
        'parent_id',
        'name',
        'slug',
        'description',
        'icon',
        'color',
        'order_index',
        'is_public',
        'is_featured',
        'is_system_category',
        'supports_articles',
        'supports_qa',
        'supports_faq',
        'meta_title',
        'meta_description',
        'meta_keywords',
        'total_content_count',
        'article_count',
        'qa_count',
        'view_count',
        'search_count',
        'is_ai_trainable',
        'ai_category_embeddings',
        'ai_processing_priority',
        'auto_categorize',
        'category_rules',
        'metadata',
        'status',
    ];

    protected $casts = [
        'is_public' => 'boolean',
        'is_featured' => 'boolean',
        'is_system_category' => 'boolean',
        'supports_articles' => 'boolean',
        'supports_qa' => 'boolean',
        'supports_faq' => 'boolean',
        'meta_keywords' => 'array',
        'is_ai_trainable' => 'boolean',
        'ai_category_embeddings' => 'array',
        'auto_categorize' => 'boolean',
        'category_rules' => 'array',
        'metadata' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the parent category.
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(KnowledgeBaseCategory::class, 'parent_id');
    }

    /**
     * Get the child categories.
     */
    public function children(): HasMany
    {
        return $this->hasMany(KnowledgeBaseCategory::class, 'parent_id');
    }

    /**
     * Get all descendant categories.
     */
    public function descendants(): HasMany
    {
        return $this->children()->with('descendants');
    }

    /**
     * Get the knowledge base items in this category.
     */
    public function knowledgeBaseItems(): HasMany
    {
        return $this->hasMany(KnowledgeBaseItem::class, 'category_id');
    }

    /**
     * Get the published knowledge base items.
     */
    public function publishedItems(): HasMany
    {
        return $this->knowledgeBaseItems()
                    ->where('status', 'active')
                    ->where('workflow_status', 'published');
    }

    /**
     * Get the articles in this category.
     */
    public function articles(): HasMany
    {
        return $this->knowledgeBaseItems()
                    ->whereIn('content_type', ['article', 'guide', 'tutorial']);
    }

    /**
     * Get the Q&A collections in this category.
     */
    public function qaCollections(): HasMany
    {
        return $this->knowledgeBaseItems()
                    ->where('content_type', 'qa_collection');
    }

    /**
     * Get the FAQ items in this category.
     */
    public function faqs(): HasMany
    {
        return $this->knowledgeBaseItems()
                    ->where('content_type', 'faq');
    }

    /**
     * Check if category is a root category.
     */
    public function isRoot(): bool
    {
        return is_null($this->parent_id);
    }

    /**
     * Check if category has children.
     */
    public function hasChildren(): bool
    {
        return $this->children()->count() > 0;
    }

    /**
     * Check if category supports specific content type.
     */
    public function supportsContentType(string $type): bool
    {
        return match ($type) {
            'article', 'guide', 'tutorial' => $this->supports_articles,
            'qa_collection' => $this->supports_qa,
            'faq' => $this->supports_faq,
            default => false,
        };
    }

    /**
     * Get the category path (breadcrumb).
     */
    public function getPathAttribute(): array
    {
        $path = [];
        $category = $this;

        while ($category) {
            array_unshift($path, [
                'id' => $category->id,
                'name' => $category->name,
                'slug' => $category->slug,
            ]);
            $category = $category->parent;
        }

        return $path;
    }

    /**
     * Get the full category name with path.
     */
    public function getFullNameAttribute(): string
    {
        $names = collect($this->path)->pluck('name');
        return $names->join(' › ');
    }

    /**
     * Scope for root categories.
     */
    public function scopeRoot($query)
    {
        return $query->whereNull('parent_id');
    }

    /**
     * Scope for public categories.
     */
    public function scopePublic($query)
    {
        return $query->where('is_public', true);
    }

    /**
     * Scope for featured categories.
     */
    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }

    /**
     * Scope for system categories.
     */
    public function scopeSystem($query)
    {
        return $query->where('is_system_category', true);
    }

    /**
     * Scope for categories that support articles.
     */
    public function scopeSupportingArticles($query)
    {
        return $query->where('supports_articles', true);
    }

    /**
     * Scope for categories that support Q&A.
     */
    public function scopeSupportingQA($query)
    {
        return $query->where('supports_qa', true);
    }

    /**
     * Scope for categories that support FAQ.
     */
    public function scopeSupportingFAQ($query)
    {
        return $query->where('supports_faq', true);
    }

    /**
     * Scope for AI trainable categories.
     */
    public function scopeAiTrainable($query)
    {
        return $query->where('is_ai_trainable', true);
    }

    /**
     * Order by sort order.
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('order_index')->orderBy('name');
    }

    /**
     * Scope for categories with content.
     */
    public function scopeWithContent($query)
    {
        return $query->where('total_content_count', '>', 0);
    }
}
