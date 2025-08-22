<?php

namespace App\Traits;

use App\Models\Organization;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

trait BelongsToOrganization
{
    /**
     * Boot the BelongsToOrganization trait.
     */
    protected static function bootBelongsToOrganization(): void
    {
        static::creating(function ($model) {
            if (!$model->organization_id && auth()->check()) {
                $model->organization_id = auth()->user()->organization_id;
            }
        });
    }

    /**
     * Get the organization that owns the model.
     */
    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    /**
     * Scope a query to only include records for the specified organization.
     */
    public function scopeForOrganization(Builder $query, string $organizationId): Builder
    {
        return $query->where('organization_id', $organizationId);
    }

    /**
     * Scope a query to only include records for the current user's organization.
     */
    public function scopeForCurrentOrganization(Builder $query): Builder
    {
        if (auth()->check()) {
            return $query->where('organization_id', auth()->user()->organization_id);
        }

        return $query;
    }
}
