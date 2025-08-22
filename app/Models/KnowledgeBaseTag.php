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

class KnowledgeBaseTag extends Model
{
    use HasFactory, HasUuid, BelongsToOrganization, HasStatus;

    protected $table = 'knowledge_base_tags';

    protected $fillable = [
        'organization_id',
        'name',
        'slug',
        'description',
        'color',
        'icon',
        'tag_type',
        'parent_tag_id',
        'usage_count',
        'item_count',
        'is_system_tag',
        'is_auto_suggested',
        'auto_apply_rules',
        'status',
    ];

    protected $casts = [
        'is_system_tag' => 'boolean',
        'is_auto_suggested' => 'boolean',
        'auto_apply_rules' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the parent tag.
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(KnowledgeBaseTag::class, 'parent_tag_id');
    }

    /**
     * Get the child tags.
     */
    public function children(): HasMany
    {
        return $this->hasMany(KnowledgeBaseTag::class, 'parent_tag_id');
    }

    /**
     * Get the knowledge base items that have this tag.
     */
    public function knowledgeBaseItems(): BelongsToMany
    {
        return $this->belongsToMany(KnowledgeBaseItem::class, 'knowledge_base_item_tags', 'tag_id', 'knowledge_item_id')
                    ->withPivot(['assigned_by', 'assigned_at', 'is_auto_assigned', 'confidence_score'])
                    ->withTimestamps();
    }

    /**
     * Get manually assigned items.
     */
    public function manuallyAssignedItems(): BelongsToMany
    {
        return $this->knowledgeBaseItems()->wherePivot('is_auto_assigned', false);
    }

    /**
     * Get auto-assigned items.
     */
    public function autoAssignedItems(): BelongsToMany
    {
        return $this->knowledgeBaseItems()->wherePivot('is_auto_assigned', true);
    }

    /**
     * Check if tag is a root tag.
     */
    public function isRoot(): bool
    {
        return is_null($this->parent_tag_id);
    }

    /**
     * Check if tag has children.
     */
    public function hasChildren(): bool
    {
        return $this->children()->count() > 0;
    }

    /**
     * Check if tag should be auto-suggested.
     */
    public function shouldAutoSuggest(): bool
    {
        return $this->is_auto_suggested && $this->isActive();
    }

    /**
     * Increment usage count.
     */
    public function incrementUsage(): void
    {
        $this->increment('usage_count');
    }

    /**
     * Update item count.
     */
    public function updateItemCount(): void
    {
        $count = $this->knowledgeBaseItems()->count();
        $this->update(['item_count' => $count]);
    }

    /**
     * Get tag with full hierarchy path.
     */
    public function getPathAttribute(): array
    {
        $path = [];
        $tag = $this;

        while ($tag) {
            array_unshift($path, [
                'id' => $tag->id,
                'name' => $tag->name,
                'slug' => $tag->slug,
            ]);
            $tag = $tag->parent;
        }

        return $path;
    }

    /**
     * Get full tag name with hierarchy.
     */
    public function getFullNameAttribute(): string
    {
        $names = collect($this->path)->pluck('name');
        return $names->join(' › ');
    }

    /**
     * Scope for root tags.
     */
    public function scopeRoot($query)
    {
        return $query->whereNull('parent_tag_id');
    }

    /**
     * Scope for system tags.
     */
    public function scopeSystem($query)
    {
        return $query->where('is_system_tag', true);
    }

    /**
     * Scope for auto-suggested tags.
     */
    public function scopeAutoSuggested($query)
    {
        return $query->where('is_auto_suggested', true);
    }

    /**
     * Scope for specific tag type.
     */
    public function scopeType($query, string $type)
    {
        return $query->where('tag_type', $type);
    }

    /**
     * Scope for popular tags (by usage).
     */
    public function scopePopular($query, int $limit = 10)
    {
        return $query->orderBy('usage_count', 'desc')->limit($limit);
    }

    /**
     * Order by usage count.
     */
    public function scopeByUsage($query)
    {
        return $query->orderBy('usage_count', 'desc');
    }

    /**
     * Search tags by name.
     */
    public function scopeSearch($query, string $term)
    {
        return $query->where('name', 'LIKE', "%{$term}%")
                    ->orWhere('description', 'LIKE', "%{$term}%");
    }
}
