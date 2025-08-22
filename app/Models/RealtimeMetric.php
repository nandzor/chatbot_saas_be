<?php

namespace App\Models;

use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RealtimeMetric extends Model
{
    use HasFactory, HasUuid;

    protected $table = 'realtime_metrics';

    protected $fillable = [
        'organization_id',
        'metric_name',
        'metric_type',
        'namespace',
        'value',
        'unit',
        'labels',
        'dimensions',
        'source',
        'component',
        'instance_id',
        'aggregation_period',
        'aggregation_type',
        'timestamp',
        'context',
        'metadata',
    ];

    protected $casts = [
        'value' => 'decimal:6',
        'labels' => 'array',
        'dimensions' => 'array',
        'timestamp' => 'datetime',
        'context' => 'array',
        'metadata' => 'array',
        'created_at' => 'datetime',
    ];

    public $timestamps = false; // Only has created_at from schema

    /**
     * Boot the model.
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (!$model->created_at) {
                $model->created_at = now();
            }

            if (!$model->timestamp) {
                $model->timestamp = now();
            }
        });
    }

    /**
     * Get the organization this metric belongs to.
     */
    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    /**
     * Check if metric is a counter.
     */
    public function isCounter(): bool
    {
        return $this->metric_type === 'counter';
    }

    /**
     * Check if metric is a gauge.
     */
    public function isGauge(): bool
    {
        return $this->metric_type === 'gauge';
    }

    /**
     * Check if metric is a histogram.
     */
    public function isHistogram(): bool
    {
        return $this->metric_type === 'histogram';
    }

    /**
     * Check if metric is a summary.
     */
    public function isSummary(): bool
    {
        return $this->metric_type === 'summary';
    }

    /**
     * Get metric type display name.
     */
    public function getMetricTypeDisplayAttribute(): string
    {
        return match ($this->metric_type) {
            'counter' => 'Counter',
            'gauge' => 'Gauge',
            'histogram' => 'Histogram',
            'summary' => 'Summary',
            default => ucfirst($this->metric_type),
        };
    }

    /**
     * Get source display name.
     */
    public function getSourceDisplayAttribute(): string
    {
        return match ($this->source) {
            'system' => 'System',
            'application' => 'Application',
            'external' => 'External',
            default => ucfirst($this->source ?? 'Unknown'),
        };
    }

    /**
     * Get value with unit.
     */
    public function getValueWithUnitAttribute(): string
    {
        $value = $this->value;

        // Format large numbers
        if ($value >= 1000000000) {
            $value = round($value / 1000000000, 2) . 'B';
        } elseif ($value >= 1000000) {
            $value = round($value / 1000000, 2) . 'M';
        } elseif ($value >= 1000) {
            $value = round($value / 1000, 2) . 'K';
        } else {
            $value = number_format((float) $value, 2);
        }

        return $value . ($this->unit ? ' ' . $this->unit : '');
    }

    /**
     * Get full metric name with namespace.
     */
    public function getFullNameAttribute(): string
    {
        if ($this->namespace && $this->namespace !== 'default') {
            return $this->namespace . '.' . $this->metric_name;
        }

        return $this->metric_name;
    }

    /**
     * Get aggregation display.
     */
    public function getAggregationDisplayAttribute(): ?string
    {
        if (!$this->aggregation_period || !$this->aggregation_type) {
            return null;
        }

        return ucfirst($this->aggregation_type) . ' over ' . $this->aggregation_period;
    }

    /**
     * Get label by key.
     */
    public function getLabel(string $key, $default = null)
    {
        $labels = $this->labels ?? [];
        return $labels[$key] ?? $default;
    }

    /**
     * Get dimension by key.
     */
    public function getDimension(string $key, $default = null)
    {
        $dimensions = $this->dimensions ?? [];
        return $dimensions[$key] ?? $default;
    }

    /**
     * Check if metric has specific label.
     */
    public function hasLabel(string $key, $value = null): bool
    {
        $labels = $this->labels ?? [];

        if ($value === null) {
            return isset($labels[$key]);
        }

        return isset($labels[$key]) && $labels[$key] === $value;
    }

    /**
     * Check if metric has specific dimension.
     */
    public function hasDimension(string $key, $value = null): bool
    {
        $dimensions = $this->dimensions ?? [];

        if ($value === null) {
            return isset($dimensions[$key]);
        }

        return isset($dimensions[$key]) && $dimensions[$key] === $value;
    }

    /**
     * Get age of metric in seconds.
     */
    public function getAgeSecondsAttribute(): int
    {
        return now()->diffInSeconds($this->timestamp);
    }

    /**
     * Check if metric is recent.
     */
    public function isRecent(int $maxAgeSeconds = 300): bool
    {
        return $this->age_seconds <= $maxAgeSeconds;
    }

    /**
     * Record a metric.
     */
    public static function record(
        string $organizationId,
        string $metricName,
        string $metricType,
        float $value,
        array $options = []
    ): self {
        return static::create(array_merge([
            'organization_id' => $organizationId,
            'metric_name' => $metricName,
            'metric_type' => $metricType,
            'value' => $value,
            'namespace' => 'default',
            'source' => 'application',
        ], $options));
    }

    /**
     * Record a counter metric.
     */
    public static function recordCounter(
        string $organizationId,
        string $metricName,
        float $value = 1,
        array $labels = [],
        array $options = []
    ): self {
        return static::record($organizationId, $metricName, 'counter', $value, array_merge([
            'labels' => $labels,
        ], $options));
    }

    /**
     * Record a gauge metric.
     */
    public static function recordGauge(
        string $organizationId,
        string $metricName,
        float $value,
        array $labels = [],
        array $options = []
    ): self {
        return static::record($organizationId, $metricName, 'gauge', $value, array_merge([
            'labels' => $labels,
        ], $options));
    }

    /**
     * Scope for specific metric name.
     */
    public function scopeForMetric($query, string $metricName)
    {
        return $query->where('metric_name', $metricName);
    }

    /**
     * Scope for specific metric type.
     */
    public function scopeForType($query, string $metricType)
    {
        return $query->where('metric_type', $metricType);
    }

    /**
     * Scope for specific namespace.
     */
    public function scopeForNamespace($query, string $namespace)
    {
        return $query->where('namespace', $namespace);
    }

    /**
     * Scope for specific source.
     */
    public function scopeForSource($query, string $source)
    {
        return $query->where('source', $source);
    }

    /**
     * Scope for specific component.
     */
    public function scopeForComponent($query, string $component)
    {
        return $query->where('component', $component);
    }

    /**
     * Scope for metrics with specific label.
     */
    public function scopeWithLabel($query, string $key, $value = null)
    {
        if ($value === null) {
            return $query->whereJsonContains('labels', [$key => null])
                        ->orWhereRaw("JSON_UNQUOTE(JSON_EXTRACT(labels, '$.{$key}')) IS NOT NULL");
        }

        return $query->whereJsonContains('labels', [$key => $value]);
    }

    /**
     * Scope for recent metrics.
     */
    public function scopeRecent($query, int $minutes = 5)
    {
        return $query->where('timestamp', '>', now()->subMinutes($minutes));
    }

    /**
     * Scope for metrics within time range.
     */
    public function scopeBetweenDates($query, $startDate, $endDate)
    {
        return $query->whereBetween('timestamp', [$startDate, $endDate]);
    }

    /**
     * Scope for high values.
     */
    public function scopeHighValues($query, float $threshold)
    {
        return $query->where('value', '>', $threshold);
    }

    /**
     * Order by timestamp.
     */
    public function scopeByTimestamp($query, string $direction = 'desc')
    {
        return $query->orderBy('timestamp', $direction);
    }

    /**
     * Order by value.
     */
    public function scopeByValue($query, string $direction = 'desc')
    {
        return $query->orderBy('value', $direction);
    }

    /**
     * Group by metric name.
     */
    public function scopeGroupByMetric($query)
    {
        return $query->groupBy('metric_name');
    }

    /**
     * Aggregate metrics.
     */
    public function scopeAggregate($query, string $aggregationType, string $groupBy = null)
    {
        $aggregations = match ($aggregationType) {
            'sum' => 'SUM(value) as total',
            'avg' => 'AVG(value) as average',
            'min' => 'MIN(value) as minimum',
            'max' => 'MAX(value) as maximum',
            'count' => 'COUNT(*) as count',
            default => 'SUM(value) as total',
        };

        $query = $query->selectRaw($aggregations);

        if ($groupBy) {
            $query->groupBy($groupBy);
        }

        return $query;
    }
}
