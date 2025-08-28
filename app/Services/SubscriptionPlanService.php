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
            return $this->getModel()->popular()->ordered()->get();
        });
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
}
