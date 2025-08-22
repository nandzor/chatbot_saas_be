<?php

namespace App\Models;

use App\Traits\BelongsToOrganization;
use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class UsageTracking extends Model
{
    use HasFactory, HasUuid, BelongsToOrganization;

    protected $table = 'usage_tracking';

    protected $fillable = [
        'organization_id',
        'date',
        'quota_type',
        'used_amount',
        'quota_limit',
        'overage_amount',
        'unit_cost',
        'total_cost',
    ];

    protected $casts = [
        'date' => 'date',
        'used_amount' => 'integer',
        'quota_limit' => 'integer',
        'overage_amount' => 'integer',
        'unit_cost' => 'decimal:4',
        'total_cost' => 'decimal:2',
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
        });
    }

    /**
     * Check if usage exceeds quota.
     */
    public function isOverQuota(): bool
    {
        return $this->quota_limit > 0 && $this->used_amount > $this->quota_limit;
    }

    /**
     * Check if usage is near quota limit.
     */
    public function isNearQuotaLimit(float $threshold = 0.9): bool
    {
        if ($this->quota_limit <= 0) {
            return false;
        }

        return ($this->used_amount / $this->quota_limit) >= $threshold;
    }

    /**
     * Get usage percentage.
     */
    public function getUsagePercentageAttribute(): float
    {
        if ($this->quota_limit <= 0) {
            return 0;
        }

        return round(($this->used_amount / $this->quota_limit) * 100, 2);
    }

    /**
     * Get remaining quota.
     */
    public function getRemainingQuotaAttribute(): int
    {
        if ($this->quota_limit <= 0) {
            return -1; // Unlimited
        }

        return max(0, $this->quota_limit - $this->used_amount);
    }

    /**
     * Get overage percentage.
     */
    public function getOveragePercentageAttribute(): float
    {
        if ($this->quota_limit <= 0 || $this->overage_amount <= 0) {
            return 0;
        }

        return round(($this->overage_amount / $this->quota_limit) * 100, 2);
    }

    /**
     * Get cost per unit used.
     */
    public function getCostPerUnitAttribute(): float
    {
        if ($this->used_amount === 0) {
            return 0;
        }

        return round($this->total_cost / $this->used_amount, 4);
    }

    /**
     * Calculate overage cost.
     */
    public function getOverageCostAttribute(): float
    {
        return $this->overage_amount * $this->unit_cost;
    }

    /**
     * Get quota status.
     */
    public function getQuotaStatusAttribute(): string
    {
        if ($this->quota_limit <= 0) {
            return 'unlimited';
        }

        $percentage = $this->usage_percentage;

        return match (true) {
            $percentage >= 100 => 'exceeded',
            $percentage >= 90 => 'critical',
            $percentage >= 75 => 'warning',
            $percentage >= 50 => 'moderate',
            default => 'safe',
        };
    }

    /**
     * Increment usage for organization and quota type.
     */
    public static function incrementUsage(
        string $organizationId,
        string $quotaType,
        int $amount = 1,
        Carbon $date = null,
        int $quotaLimit = 0,
        float $unitCost = 0
    ): self {
        $date = $date ?? now();

        $usage = static::firstOrCreate(
            [
                'organization_id' => $organizationId,
                'date' => $date->toDateString(),
                'quota_type' => $quotaType,
            ],
            [
                'used_amount' => 0,
                'quota_limit' => $quotaLimit,
                'overage_amount' => 0,
                'unit_cost' => $unitCost,
                'total_cost' => 0,
            ]
        );

        $newUsedAmount = $usage->used_amount + $amount;
        $newOverage = max(0, $newUsedAmount - $usage->quota_limit);
        $newTotalCost = $newUsedAmount * $usage->unit_cost;

        $usage->update([
            'used_amount' => $newUsedAmount,
            'overage_amount' => $newOverage,
            'total_cost' => $newTotalCost,
        ]);

        return $usage;
    }

    /**
     * Get usage summary for organization and date range.
     */
    public static function getUsageSummary(
        string $organizationId,
        Carbon $startDate,
        Carbon $endDate,
        string $quotaType = null
    ): array {
        $query = static::where('organization_id', $organizationId)
                      ->whereBetween('date', [$startDate, $endDate]);

        if ($quotaType) {
            $query->where('quota_type', $quotaType);
        }

        $records = $query->get();

        if ($records->isEmpty()) {
            return [];
        }

        $summary = [
            'total_used' => $records->sum('used_amount'),
            'total_quota' => $records->sum('quota_limit'),
            'total_overage' => $records->sum('overage_amount'),
            'total_cost' => $records->sum('total_cost'),
            'daily_breakdown' => $records->keyBy('date'),
        ];

        if ($quotaType) {
            $summary['quota_type'] = $quotaType;
        } else {
            $summary['by_quota_type'] = $records->groupBy('quota_type');
        }

        return $summary;
    }

    /**
     * Get current month usage for organization.
     */
    public static function getCurrentMonthUsage(string $organizationId, string $quotaType = null): array
    {
        $startDate = now()->startOfMonth();
        $endDate = now()->endOfMonth();

        return static::getUsageSummary($organizationId, $startDate, $endDate, $quotaType);
    }

    /**
     * Check if organization has exceeded quota for specific type.
     */
    public static function hasExceededQuota(
        string $organizationId,
        string $quotaType,
        Carbon $date = null
    ): bool {
        $date = $date ?? now();

        $usage = static::where('organization_id', $organizationId)
                      ->where('date', $date->toDateString())
                      ->where('quota_type', $quotaType)
                      ->first();

        return $usage && $usage->isOverQuota();
    }

    /**
     * Get overage cost for organization and date range.
     */
    public static function getOverageCost(
        string $organizationId,
        Carbon $startDate,
        Carbon $endDate,
        string $quotaType = null
    ): float {
        $query = static::where('organization_id', $organizationId)
                      ->whereBetween('date', [$startDate, $endDate])
                      ->where('overage_amount', '>', 0);

        if ($quotaType) {
            $query->where('quota_type', $quotaType);
        }

        return $query->get()->sum('overage_cost');
    }

    /**
     * Reset usage for organization and date.
     */
    public static function resetUsage(
        string $organizationId,
        string $quotaType,
        Carbon $date = null
    ): void {
        $date = $date ?? now();

        static::where('organization_id', $organizationId)
              ->where('quota_type', $quotaType)
              ->where('date', $date->toDateString())
              ->update([
                  'used_amount' => 0,
                  'overage_amount' => 0,
                  'total_cost' => 0,
              ]);
    }

    /**
     * Scope for specific quota type.
     */
    public function scopeQuotaType($query, string $type)
    {
        return $query->where('quota_type', $type);
    }

    /**
     * Scope for over quota records.
     */
    public function scopeOverQuota($query)
    {
        return $query->whereColumn('used_amount', '>', 'quota_limit')
                    ->where('quota_limit', '>', 0);
    }

    /**
     * Scope for records with overage.
     */
    public function scopeWithOverage($query)
    {
        return $query->where('overage_amount', '>', 0);
    }

    /**
     * Scope for near quota limit.
     */
    public function scopeNearLimit($query, float $threshold = 0.9)
    {
        return $query->whereRaw('used_amount >= (quota_limit * ?)', [$threshold])
                    ->where('quota_limit', '>', 0);
    }

    /**
     * Scope for current month.
     */
    public function scopeCurrentMonth($query)
    {
        return $query->whereBetween('date', [
            now()->startOfMonth(),
            now()->endOfMonth()
        ]);
    }

    /**
     * Scope for last month.
     */
    public function scopeLastMonth($query)
    {
        $lastMonth = now()->subMonth();
        return $query->whereBetween('date', [
            $lastMonth->startOfMonth(),
            $lastMonth->endOfMonth()
        ]);
    }

    /**
     * Scope for date range.
     */
    public function scopeDateRange($query, Carbon $startDate, Carbon $endDate)
    {
        return $query->whereBetween('date', [$startDate, $endDate]);
    }

    /**
     * Order by date.
     */
    public function scopeByDate($query, string $direction = 'desc')
    {
        return $query->orderBy('date', $direction);
    }

    /**
     * Order by usage amount.
     */
    public function scopeByUsage($query, string $direction = 'desc')
    {
        return $query->orderBy('used_amount', $direction);
    }

    /**
     * Order by cost.
     */
    public function scopeByCost($query, string $direction = 'desc')
    {
        return $query->orderBy('total_cost', $direction);
    }
}
