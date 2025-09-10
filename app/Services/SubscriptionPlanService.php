<?php

namespace App\Services;

use App\Models\SubscriptionPlan;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

class SubscriptionPlanService extends BaseService
{
    /**
     * Get the model instance for this service
     */
    protected function getModel(): Model
    {
        return new SubscriptionPlan();
    }

    /**
     * Get all subscription plans with optional filters
     */
    public function getAllPlans(
        ?Request $request = null,
        array $filters = []
    ): Collection {
        $query = $this->getModel()->newQuery();

        // Apply filters
        if (isset($filters['tier'])) {
            $query->tier($filters['tier']);
        }

        if (isset($filters['is_popular'])) {
            $query->where('is_popular', $filters['is_popular']);
        }

        if (isset($filters['is_custom'])) {
            $query->where('is_custom', $filters['is_custom']);
        }

        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        // Apply sorting
        $query->ordered();

        return $query->get();
    }

    /**
     * Get popular plans
     */
    public function getPopularPlans(): Collection
    {
        return Cache::remember('subscription_plans_popular', 3600, function () {
            $popularPlans = $this->getModel()->popular()->ordered()->get();

            // If no popular plans found, return the first 3 active plans as fallback
            if ($popularPlans->isEmpty()) {
                $popularPlans = $this->getModel()
                    ->where('status', 'active')
                    ->ordered()
                    ->limit(3)
                    ->get();
            }

            return $popularPlans;
        });
    }

    /**
     * Clear popular plans cache
     */
    public function clearPopularPlansCache(): void
    {
        Cache::forget('subscription_plans_popular');
    }

    /**
     * Get plans by tier
     */
    public function getPlansByTier(string $tier): Collection
    {
        return $this->getModel()->tier($tier)->ordered()->get();
    }

    /**
     * Get custom plans
     */
    public function getCustomPlans(): Collection
    {
        return $this->getModel()->custom()->ordered()->get();
    }

    /**
     * Create subscription plan with validation
     */
    public function createPlan(array $data): SubscriptionPlan
    {
        try {
            DB::beginTransaction();

            // Validate unique name
            if ($this->getModel()->where('name', $data['name'])->exists()) {
                throw new \Exception('Subscription plan name already exists');
            }

            // Set default values
            $data['sort_order'] = $data['sort_order'] ?? $this->getNextSortOrder();
            $data['status'] = $data['status'] ?? 'active';

            $plan = $this->getModel()->create($data);

            // Clear cache
            $this->clearPlanCache();

            DB::commit();

            Log::info('Subscription plan created', [
                'plan_id' => $plan->id,
                'name' => $plan->name
            ]);

            return $plan->fresh();
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error creating subscription plan', [
                'error' => $e->getMessage(),
                'data' => $data
            ]);
            throw $e;
        }
    }

    /**
     * Update subscription plan
     */
    public function updatePlan(string $id, array $data): ?SubscriptionPlan
    {
        try {
            DB::beginTransaction();

            $plan = $this->getById($id);

            if (!$plan) {
                return null;
            }

            // Check if name is being changed and if it's unique
            if (isset($data['name']) && $data['name'] !== $plan->name) {
                if ($this->getModel()->where('name', $data['name'])->where('id', '!=', $id)->exists()) {
                    throw new \Exception('Subscription plan name already exists');
                }
            }

            $plan->update($data);

            // Clear cache
            $this->clearPlanCache();

            DB::commit();

            Log::info('Subscription plan updated', [
                'plan_id' => $plan->id,
                'name' => $plan->name
            ]);

            return $plan->fresh();
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error updating subscription plan', [
                'error' => $e->getMessage(),
                'id' => $id,
                'data' => $data
            ]);
            throw $e;
        }
    }

    /**
     * Delete subscription plan
     */
    public function deletePlan(string $id): bool
    {
        try {
            DB::beginTransaction();

            $plan = $this->getById($id);

            if (!$plan) {
                return false;
            }

            // Check if plan is being used by any organization
            if ($plan->organizations()->exists()) {
                throw new \Exception('Cannot delete plan that is being used by organizations');
            }

            // Check if plan has active subscriptions
            if ($plan->subscriptions()->where('status', 'active')->exists()) {
                throw new \Exception('Cannot delete plan that has active subscriptions');
            }

            $deleted = $plan->delete();

            if ($deleted) {
                // Clear cache
                $this->clearPlanCache();

                Log::info('Subscription plan deleted', [
                    'plan_id' => $plan->id,
                    'name' => $plan->name
                ]);
            }

            DB::commit();

            return $deleted;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error deleting subscription plan', [
                'error' => $e->getMessage(),
                'id' => $id
            ]);
            throw $e;
        }
    }

    /**
     * Toggle plan popularity
     */
    public function togglePopular(string $id): ?SubscriptionPlan
    {
        $plan = $this->getById($id);

        if (!$plan) {
            return null;
        }

        $plan->update(['is_popular' => !$plan->is_popular]);

        // Clear cache
        $this->clearPlanCache();

        return $plan->fresh();
    }

    /**
     * Update plan sort order
     */
    public function updateSortOrder(array $sortData): bool
    {
        try {
            DB::beginTransaction();

            foreach ($sortData as $item) {
                if (isset($item['id']) && isset($item['sort_order'])) {
                    $this->getModel()
                        ->where('id', $item['id'])
                        ->update(['sort_order' => $item['sort_order']]);
                }
            }

            // Clear cache
            $this->clearPlanCache();

            DB::commit();

            return true;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error updating plan sort order', [
                'error' => $e->getMessage(),
                'data' => $sortData
            ]);
            throw $e;
        }
    }

    /**
     * Get next sort order
     */
    private function getNextSortOrder(): int
    {
        $maxOrder = $this->getModel()->max('sort_order');
        return ($maxOrder ?? 0) + 1;
    }

    /**
     * Clear plan cache
     */
    private function clearPlanCache(): void
    {
        Cache::forget('subscription_plans_popular');
        Cache::forget('subscription_plans_all');
    }

    /**
     * Validate plan features
     */
    public function validatePlanFeatures(array $features): bool
    {
        $validFeatures = [
            'ai_chat',
            'knowledge_base',
            'multi_channel',
            'api_access',
            'analytics',
            'custom_branding',
            'priority_support',
            'white_label',
            'advanced_analytics',
            'custom_integrations'
        ];

        foreach ($features as $feature => $enabled) {
            if (!in_array($feature, $validFeatures)) {
                return false;
            }
        }

        return true;
    }

    /**
     * Get plan statistics
     */
    public function getPlanStatistics(): array
    {
        return [
            'total_plans' => $this->getModel()->count(),
            'active_plans' => $this->getModel()->where('status', 'active')->count(),
            'popular_plans' => $this->getModel()->where('is_popular', true)->count(),
            'custom_plans' => $this->getModel()->where('is_custom', true)->count(),
            'plans_by_tier' => $this->getModel()
                ->selectRaw('tier, COUNT(*) as count')
                ->groupBy('tier')
                ->pluck('count', 'tier')
                ->toArray()
        ];
    }

    /**
     * Get popular plans (alias for getPopularPlans)
     */
    public function popular(): Collection
    {
        return $this->getPopularPlans();
    }

    /**
     * Get plans by tier (alias for getPlansByTier)
     */
    public function byTier(string $tier): Collection
    {
        return $this->getPlansByTier($tier);
    }

    /**
     * Get custom plans (alias for getCustomPlans)
     */
    public function custom(): Collection
    {
        return $this->getCustomPlans();
    }

    /**
     * Get plan analytics
     */
    public function analytics(array $filters = []): array
    {
        $query = $this->getModel()->newQuery();

        // Apply filters
        if (!empty($filters['tier'])) {
            $query->where('tier', $filters['tier']);
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        // Plan performance metrics
        $planPerformance = $query->clone()
            ->withCount('subscriptions')
            ->withSum('subscriptions', 'unit_amount')
            ->get()
            ->map(function ($plan) {
                return [
                    'plan_id' => $plan->id,
                    'plan_name' => $plan->name,
                    'tier' => $plan->tier,
                    'subscription_count' => $plan->subscriptions_count,
                    'total_revenue' => (float) $plan->subscriptions_sum_unit_amount,
                    'average_revenue_per_subscription' => $plan->subscriptions_count > 0
                        ? (float) $plan->subscriptions_sum_unit_amount / $plan->subscriptions_count
                        : 0,
                ];
            });

        // Revenue trends by plan
        $revenueTrends = $query->clone()
            ->join('subscriptions', 'subscription_plans.id', '=', 'subscriptions.plan_id')
            ->selectRaw('subscription_plans.name as plan_name, DATE_TRUNC(\'month\', subscriptions.created_at) as month, SUM(subscriptions.unit_amount) as revenue')
            ->where('subscriptions.created_at', '>=', now()->subMonths(12))
            ->where('subscriptions.status', 'success')
            ->groupBy('subscription_plans.name', 'month')
            ->orderBy('month')
            ->get()
            ->groupBy('plan_name')
            ->map(function ($planData) {
                return $planData->map(function ($item) {
                    return [
                        'month' => $item->month->format('Y-m'),
                        'revenue' => (float) $item->revenue,
                    ];
                });
            });

        // Plan conversion rates
        $conversionRates = $query->clone()
            ->withCount(['subscriptions as total_subscriptions'])
            ->withCount(['subscriptions as successful_subscriptions' => function ($query) {
                $query->where('status', 'success');
            }])
            ->get()
            ->map(function ($plan) {
                $conversionRate = $plan->total_subscriptions > 0
                    ? ($plan->successful_subscriptions / $plan->total_subscriptions) * 100
                    : 0;

                return [
                    'plan_id' => $plan->id,
                    'plan_name' => $plan->name,
                    'total_subscriptions' => $plan->total_subscriptions,
                    'successful_subscriptions' => $plan->successful_subscriptions,
                    'conversion_rate' => round($conversionRate, 2),
                ];
            });

        return [
            'plan_performance' => $planPerformance,
            'revenue_trends' => $revenueTrends,
            'conversion_rates' => $conversionRates,
            'generated_at' => now()->toISOString(),
        ];
    }

    /**
     * Export plans data
     */
    public function export(array $filters = []): array
    {
        $plans = $this->getAllPlans(null, $filters);

        $exportData = [];
        foreach ($plans as $plan) {
            $exportData[] = [
                'id' => $plan->id,
                'name' => $plan->name,
                'display_name' => $plan->display_name,
                'description' => $plan->description,
                'tier' => $plan->tier,
                'unit_amount' => $plan->unit_amount,
                'currency' => $plan->currency,
                'billing_cycle' => $plan->billing_cycle,
                'features' => json_encode($plan->features ?? []),
                'limits' => json_encode($plan->limits ?? []),
                'is_popular' => $plan->is_popular ? 'Yes' : 'No',
                'is_custom' => $plan->is_custom ? 'Yes' : 'No',
                'status' => $plan->status,
                'sort_order' => $plan->sort_order,
                'created_at' => $plan->created_at->format('Y-m-d H:i:s'),
                'updated_at' => $plan->updated_at->format('Y-m-d H:i:s'),
            ];
        }

        return [
            'data' => $exportData,
            'total_records' => count($exportData),
            'exported_at' => now()->toISOString(),
        ];
    }

    /**
     * Get plans with subscription count
     */
    public function withSubscriptionCount(array $filters = []): Collection
    {
        $query = $this->getModel()->newQuery();

        // Apply filters
        if (!empty($filters['tier'])) {
            $query->where('tier', $filters['tier']);
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        return $query->withCount('subscriptions')->ordered()->get();
    }

    /**
     * Get popular plans with statistics
     */
    public function popularWithStats(): Collection
    {
        return $this->getModel()
            ->popular()
            ->withCount('subscriptions')
            ->withSum('subscriptions', 'unit_amount')
            ->ordered()
            ->get();
    }

    /**
     * Get plans by tier with features
     */
    public function byTierWithFeatures(string $tier): Collection
    {
        return $this->getModel()
            ->tier($tier)
            ->withCount('subscriptions')
            ->ordered()
            ->get();
    }

    /**
     * Compare plans
     */
    public function comparison(array $planIds): array
    {
        $plans = $this->getModel()->whereIn('id', $planIds)->ordered()->get();

        $comparison = [];
        foreach ($plans as $plan) {
            $comparison[] = [
                'id' => $plan->id,
                'name' => $plan->name,
                'display_name' => $plan->display_name,
                'tier' => $plan->tier,
                'unit_amount' => $plan->unit_amount,
                'currency' => $plan->currency,
                'billing_cycle' => $plan->billing_cycle,
                'features' => $plan->features ?? [],
                'limits' => $plan->limits ?? [],
                'is_popular' => $plan->is_popular,
                'subscription_count' => $plan->subscriptions_count ?? 0,
            ];
        }

        return $comparison;
    }

    /**
     * Get plan recommendations
     */
    public function recommendations(array $filters = []): Collection
    {
        $query = $this->getModel()->where('status', 'active');

        // Recommend based on current plan
        if (!empty($filters['current_plan_id'])) {
            $currentPlan = $this->getById($filters['current_plan_id']);
            if ($currentPlan) {
                // Recommend higher tier plans
                $query->where('tier', '>', $currentPlan->tier);
            }
        }

        // Recommend based on usage pattern
        if (!empty($filters['usage_pattern'])) {
            switch ($filters['usage_pattern']) {
                case 'high':
                    $query->where('tier', 'enterprise');
                    break;
                case 'medium':
                    $query->where('tier', 'professional');
                    break;
                case 'low':
                    $query->where('tier', 'basic');
                    break;
            }
        }

        return $query->withCount('subscriptions')->ordered()->limit(3)->get();
    }

    /**
     * Get plan features
     */
    public function features(string $id): ?array
    {
        $plan = $this->getById($id);
        return $plan ? $plan->features : null;
    }

    /**
     * Get plan pricing
     */
    public function pricing(string $id): ?array
    {
        $plan = $this->getById($id);
        if (!$plan) {
            return null;
        }

        return [
            'id' => $plan->id,
            'name' => $plan->name,
            'unit_amount' => $plan->unit_amount,
            'currency' => $plan->currency,
            'billing_cycle' => $plan->billing_cycle,
            'discount_amount' => $plan->discount_amount ?? 0,
            'tax_amount' => $plan->tax_amount ?? 0,
            'total_amount' => $plan->unit_amount - ($plan->discount_amount ?? 0) + ($plan->tax_amount ?? 0),
        ];
    }

    /**
     * Get plan subscriptions
     */
    public function subscriptions(string $id, array $filters = []): Collection
    {
        $plan = $this->getById($id);
        if (!$plan) {
            return collect();
        }

        $query = $plan->subscriptions();

        // Apply filters
        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['organization_id'])) {
            $query->where('organization_id', $filters['organization_id']);
        }

        return $query->with('organization')->latest()->get();
    }

    /**
     * Get plan usage statistics
     */
    public function usageStats(string $id): ?array
    {
        $plan = $this->getById($id);
        if (!$plan) {
            return null;
        }

        $subscriptions = $plan->subscriptions;
        $activeSubscriptions = $subscriptions->where('status', 'success');
        $trialSubscriptions = $subscriptions->where('status', 'pending');

        return [
            'plan_id' => $id,
            'plan_name' => $plan->name,
            'total_subscriptions' => $subscriptions->count(),
            'active_subscriptions' => $activeSubscriptions->count(),
            'trial_subscriptions' => $trialSubscriptions->count(),
            'total_revenue' => $activeSubscriptions->sum('unit_amount'),
            'average_revenue_per_subscription' => $activeSubscriptions->avg('unit_amount'),
            'conversion_rate' => $subscriptions->count() > 0
                ? round(($activeSubscriptions->count() / $subscriptions->count()) * 100, 2)
                : 0,
        ];
    }

    /**
     * Toggle plan status
     */
    public function toggleStatus(string $id): ?SubscriptionPlan
    {
        $plan = $this->getById($id);
        if (!$plan) {
            return null;
        }

        $newStatus = $plan->status === 'active' ? 'inactive' : 'active';
        $plan->update(['status' => $newStatus]);

        // Clear cache
        $this->clearPlanCache();

        return $plan->fresh();
    }

    /**
     * Duplicate a plan
     */
    public function duplicate(string $id, array $data = []): ?SubscriptionPlan
    {
        $originalPlan = $this->getById($id);
        if (!$originalPlan) {
            return null;
        }

        $duplicateData = $originalPlan->toArray();
        unset($duplicateData['id'], $duplicateData['created_at'], $duplicateData['updated_at']);

        // Override with provided data
        $duplicateData = array_merge($duplicateData, $data);

        // Ensure unique name
        if (!isset($data['name'])) {
            $duplicateData['name'] = $originalPlan->name . ' (Copy)';
        }

        // Ensure unique display name
        if (!isset($data['display_name'])) {
            $duplicateData['display_name'] = $originalPlan->display_name . ' (Copy)';
        }

        return $this->createPlan($duplicateData);
    }

    /**
     * Bulk create plans
     */
    public function bulkCreate(array $plansData): array
    {
        $created = 0;
        $failed = 0;
        $results = [];

        foreach ($plansData as $planData) {
            try {
                $plan = $this->createPlan($planData);
                $created++;
                $results[] = [
                    'success' => true,
                    'plan' => $plan,
                ];
            } catch (\Exception $e) {
                $failed++;
                $results[] = [
                    'success' => false,
                    'error' => $e->getMessage(),
                    'data' => $planData,
                ];
            }
        }

        return [
            'created' => $created,
            'failed' => $failed,
            'total' => count($plansData),
            'results' => $results,
        ];
    }

    /**
     * Bulk update plans
     */
    public function bulkUpdatePlans(array $plansData): array
    {
        $updated = 0;
        $failed = 0;
        $results = [];

        foreach ($plansData as $planData) {
            try {
                if (!isset($planData['id'])) {
                    throw new \Exception('Plan ID is required for bulk update');
                }

                $plan = $this->updatePlan($planData['id'], collect($planData)->except('id')->toArray());
                if ($plan) {
                    $updated++;
                    $results[] = [
                        'success' => true,
                        'plan' => $plan,
                    ];
                } else {
                    $failed++;
                    $results[] = [
                        'success' => false,
                        'error' => 'Plan not found',
                        'id' => $planData['id'],
                    ];
                }
            } catch (\Exception $e) {
                $failed++;
                $results[] = [
                    'success' => false,
                    'error' => $e->getMessage(),
                    'data' => $planData,
                ];
            }
        }

        return [
            'updated' => $updated,
            'failed' => $failed,
            'total' => count($plansData),
            'results' => $results,
        ];
    }
}
