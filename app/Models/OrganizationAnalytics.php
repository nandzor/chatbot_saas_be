<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrganizationAnalytics extends Model
{
    use HasFactory;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'organization_id',
        'metric_name',
        'metric_value',
        'metric_type',
        'date',
        'metadata'
    ];

    protected $casts = [
        'metric_value' => 'decimal:2',
        'date' => 'date',
        'metadata' => 'array'
    ];

    /**
     * Get the organization that owns the analytics.
     */
    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    /**
     * Scope to filter by organization.
     */
    public function scopeForOrganization($query, $organizationId)
    {
        return $query->where('organization_id', $organizationId);
    }

    /**
     * Scope to filter by metric name.
     */
    public function scopeForMetric($query, $metricName)
    {
        return $query->where('metric_name', $metricName);
    }

    /**
     * Scope to filter by date range.
     */
    public function scopeDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('date', [$startDate, $endDate]);
    }
}
