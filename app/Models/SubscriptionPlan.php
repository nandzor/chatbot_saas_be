<?php

namespace App\Models;

use App\Traits\HasStatus;
use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SubscriptionPlan extends Model
{
    use HasFactory, HasUuid, HasStatus;

    protected $table = 'subscription_plans';

    protected $fillable = [
        'name',
        'display_name',
        'description',
        'tier',
        'price_monthly',
        'price_quarterly',
        'price_yearly',
        'currency',
        'max_agents',
        'max_channels',
        'max_knowledge_articles',
        'max_monthly_messages',
        'max_monthly_ai_requests',
        'max_storage_gb',
        'max_api_calls_per_day',
        'features',
        'trial_days',
        'is_popular',
        'is_custom',
        'sort_order',
        'status',
    ];

    protected $casts = [
        'price_monthly' => 'decimal:2',
        'price_quarterly' => 'decimal:2',
        'price_yearly' => 'decimal:2',
        'features' => 'array',
        'is_popular' => 'boolean',
        'is_custom' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the organizations that use this subscription plan.
     */
    public function organizations(): HasMany
    {
        return $this->hasMany(Organization::class, 'subscription_plan_id');
    }

    /**
     * Get the subscriptions for this plan.
     */
    public function subscriptions(): HasMany
    {
        return $this->hasMany(Subscription::class, 'plan_id');
    }

    /**
     * Get active subscriptions for this plan.
     */
    public function activeSubscriptions(): HasMany
    {
        return $this->subscriptions()->where('status', 'success');
    }

    /**
     * Get trial subscriptions for this plan.
     */
    public function trialSubscriptions(): HasMany
    {
        return $this->subscriptions()->whereNotNull('trial_start')
                                   ->where('trial_end', '>', now());
    }

    /**
     * Get the subscription count for this plan.
     */
    public function getSubscriptionCount(): int
    {
        return $this->subscriptions()->count();
    }

    /**
     * Get the active subscription count for this plan.
     */
    public function getActiveSubscriptionCount(): int
    {
        return $this->activeSubscriptions()->count();
    }

    /**
     * Check if the plan is popular (has many subscriptions).
     */
    public function isPopular(int $threshold = 10): bool
    {
        return $this->getActiveSubscriptionCount() >= $threshold;
    }

    /**
     * Check if the plan is available for new subscriptions.
     */
    public function isAvailable(): bool
    {
        return $this->status === 'active' && $this->is_visible;
    }

    /**
     * Get the monthly price.
     */
    public function getMonthlyPrice(): float
    {
        if ($this->billing_cycle === 'monthly') {
            return $this->price;
        }

        if ($this->billing_cycle === 'yearly') {
            return $this->price / 12;
        }

        return $this->price;
    }

    /**
     * Get the yearly price.
     */
    public function getYearlyPrice(): float
    {
        if ($this->billing_cycle === 'yearly') {
            return $this->price;
        }

        if ($this->billing_cycle === 'monthly') {
            return $this->price * 12;
        }

        return $this->price;
    }

    /**
     * Get the savings percentage for yearly billing.
     */
    public function getYearlySavingsPercentage(): float
    {
        $monthlyPrice = $this->getMonthlyPrice();
        $yearlyPrice = $this->getYearlyPrice();

        if ($monthlyPrice <= 0) {
            return 0;
        }

        $yearlyEquivalent = $monthlyPrice * 12;
        return round((($yearlyEquivalent - $yearlyPrice) / $yearlyEquivalent) * 100, 2);
    }

    /**
     * Check if the plan has a specific feature.
     */
    public function hasFeature(string $feature): bool
    {
        return isset($this->features[$feature]) && $this->features[$feature] === true;
    }

    /**
     * Get the price for a specific billing cycle.
     */
    public function getPriceForCycle(string $cycle): ?float
    {
        return match ($cycle) {
            'monthly' => $this->price_monthly,
            'quarterly' => $this->price_quarterly,
            'yearly' => $this->price_yearly,
            default => null,
        };
    }

    /**
     * Scope for popular plans.
     */
    public function scopePopular($query)
    {
        return $query->where('is_popular', true);
    }

    /**
     * Scope for custom plans.
     */
    public function scopeCustom($query)
    {
        return $query->where('is_custom', true);
    }

    /**
     * Scope for specific tier.
     */
    public function scopeTier($query, string $tier)
    {
        return $query->where('tier', $tier);
    }

    /**
     * Order by sort order.
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order')->orderBy('price_monthly');
    }
}
