<?php

namespace App\Models;

use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class KnowledgeBaseItemRelationship extends Model
{
    use HasFactory, HasUuid;

    protected $table = 'knowledge_base_item_relationships';

    protected $fillable = [
        'source_item_id',
        'target_item_id',
        'relationship_type',
        'strength',
        'description',
        'is_auto_discovered',
        'discovery_method',
        'discovery_confidence',
    ];

    protected $casts = [
        'strength' => 'decimal:2',
        'is_auto_discovered' => 'boolean',
        'discovery_confidence' => 'decimal:2',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the source knowledge base item.
     */
    public function sourceItem(): BelongsTo
    {
        return $this->belongsTo(KnowledgeBaseItem::class, 'source_item_id');
    }

    /**
     * Get the target knowledge base item.
     */
    public function targetItem(): BelongsTo
    {
        return $this->belongsTo(KnowledgeBaseItem::class, 'target_item_id');
    }

    /**
     * Get strength as percentage.
     */
    public function getStrengthPercentageAttribute(): int
    {
        return round(($this->strength ?? 0) * 100);
    }

    /**
     * Check if relationship is bidirectional.
     */
    public function isBidirectional(): bool
    {
        return in_array($this->relationship_type, ['related', 'alternative']);
    }

    /**
     * Scope for specific relationship type.
     */
    public function scopeType($query, string $type)
    {
        return $query->where('relationship_type', $type);
    }

    /**
     * Scope for auto-discovered relationships.
     */
    public function scopeAutoDiscovered($query)
    {
        return $query->where('is_auto_discovered', true);
    }

    /**
     * Scope for manual relationships.
     */
    public function scopeManual($query)
    {
        return $query->where('is_auto_discovered', false);
    }

    /**
     * Scope for strong relationships.
     */
    public function scopeStrong($query, float $threshold = 0.7)
    {
        return $query->where('strength', '>=', $threshold);
    }

    /**
     * Order by relationship strength.
     */
    public function scopeByStrength($query)
    {
        return $query->orderBy('strength', 'desc');
    }
}
