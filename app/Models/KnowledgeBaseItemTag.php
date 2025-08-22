<?php

namespace App\Models;

use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class KnowledgeBaseItemTag extends Model
{
    use HasFactory, HasUuid;

    protected $table = 'knowledge_base_item_tags';

    protected $fillable = [
        'knowledge_item_id',
        'tag_id',
        'assigned_by',
        'assigned_at',
        'is_auto_assigned',
        'confidence_score',
    ];

    protected $casts = [
        'assigned_at' => 'datetime',
        'is_auto_assigned' => 'boolean',
        'confidence_score' => 'decimal:2',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the knowledge base item.
     */
    public function knowledgeBaseItem(): BelongsTo
    {
        return $this->belongsTo(KnowledgeBaseItem::class, 'knowledge_item_id');
    }

    /**
     * Get the tag.
     */
    public function tag(): BelongsTo
    {
        return $this->belongsTo(KnowledgeBaseTag::class, 'tag_id');
    }

    /**
     * Get the user who assigned this tag.
     */
    public function assignedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_by');
    }

    /**
     * Scope for auto-assigned tags.
     */
    public function scopeAutoAssigned($query)
    {
        return $query->where('is_auto_assigned', true);
    }

    /**
     * Scope for manually assigned tags.
     */
    public function scopeManuallyAssigned($query)
    {
        return $query->where('is_auto_assigned', false);
    }

    /**
     * Scope for high confidence auto-assignments.
     */
    public function scopeHighConfidence($query)
    {
        return $query->where('is_auto_assigned', true)
                    ->where('confidence_score', '>=', 0.8);
    }
}
