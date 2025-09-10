<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\SubscriptionPlan\CreateSubscriptionPlanRequest;
use App\Http\Requests\SubscriptionPlan\UpdateSubscriptionPlanRequest;
use App\Services\SubscriptionPlanService;
use App\Http\Resources\SubscriptionPlanResource;
use App\Http\Resources\SubscriptionPlanCollection;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class SubscriptionPlanController extends BaseApiController
{
    protected SubscriptionPlanService $subscriptionPlanService;

    public function __construct(SubscriptionPlanService $subscriptionPlanService)
    {
        $this->subscriptionPlanService = $subscriptionPlanService;
    }

    /**
     * Get all subscription plans
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $filters = $request->only(['tier', 'is_popular', 'is_custom', 'status']);

            $plans = $this->subscriptionPlanService->getAllPlans($request, $filters);

            return $this->successResponse(
                'Daftar paket berlangganan berhasil diambil',
                new SubscriptionPlanCollection($plans)
            );
        } catch (\Exception $e) {
            Log::error('Error fetching subscription plans', [
                'error' => $e->getMessage(),
                'user_id' => $this->getCurrentUser()?->id
            ]);

            return $this->errorResponse(
                'Gagal mengambil daftar paket berlangganan',
                500
            );
        }
    }

    /**
     * Get popular subscription plans
     */
    public function popular(): JsonResponse
    {
        try {
            $plans = $this->subscriptionPlanService->getPopularPlans();

            return $this->successResponse(
                'Daftar paket populer berhasil diambil',
                new SubscriptionPlanCollection($plans)
            );
        } catch (\Exception $e) {
            Log::error('Error fetching popular subscription plans', [
                'error' => $e->getMessage(),
                'user_id' => $this->getCurrentUser()?->id
            ]);

            return $this->errorResponse(
                'Gagal mengambil daftar paket populer',
                500
            );
        }
    }

    /**
     * Get plans by tier
     */
    public function byTier(string $tier): JsonResponse
    {
        try {
            $plans = $this->subscriptionPlanService->getPlansByTier($tier);

            return $this->successResponse(
                "Daftar paket tier {$tier} berhasil diambil",
                $plans
            );
        } catch (\Exception $e) {
            Log::error('Error fetching subscription plans by tier', [
                'error' => $e->getMessage(),
                'tier' => $tier,
                'user_id' => $this->getCurrentUser()?->id
            ]);

            return $this->errorResponse(
                'Gagal mengambil daftar paket berdasarkan tier',
                500
            );
        }
    }

    /**
     * Get custom plans
     */
    public function custom(): JsonResponse
    {
        try {
            $plans = $this->subscriptionPlanService->getCustomPlans();

            return $this->successResponse(
                'Daftar paket kustom berhasil diambil',
                $plans
            );
        } catch (\Exception $e) {
            Log::error('Error fetching custom subscription plans', [
                'error' => $e->getMessage(),
                'user_id' => $this->getCurrentUser()?->id
            ]);

            return $this->errorResponse(
                'Gagal mengambil daftar paket kustom',
                500
            );
        }
    }

    /**
     * Get subscription plan by ID
     */
    public function show(string $id): JsonResponse
    {
        try {
            $plan = $this->subscriptionPlanService->getById($id);

            if (!$plan) {
                return $this->errorResponse(
                    'Paket berlangganan tidak ditemukan',
                    404
                );
            }

            return $this->successResponse(
                'Detail paket berlangganan berhasil diambil',
                $plan
            );
        } catch (\Exception $e) {
            Log::error('Error fetching subscription plan', [
                'error' => $e->getMessage(),
                'plan_id' => $id,
                'user_id' => $this->getCurrentUser()?->id
            ]);

            return $this->errorResponse(
                'Gagal mengambil detail paket berlangganan',
                500
            );
        }
    }

    /**
     * Create new subscription plan
     */
    public function store(CreateSubscriptionPlanRequest $request): JsonResponse
    {
        try {
            $plan = $this->subscriptionPlanService->createPlan($request->validated());

            return $this->createdResponse(
                $plan,
                'Paket berlangganan berhasil dibuat'

            );
        } catch (\Exception $e) {
            Log::error('Error creating subscription plan', [
                'error' => $e->getMessage(),
                'data' => $request->validated(),
                'user_id' => $this->getCurrentUser()?->id ?? 'unknown'
            ]);

            return $this->errorResponse(
                'Gagal membuat paket berlangganan: ' . $e->getMessage(),
                422
            );
        }
    }

    /**
     * Update subscription plan
     */
    public function update(UpdateSubscriptionPlanRequest $request, string $id): JsonResponse
    {
        try {
            $plan = $this->subscriptionPlanService->updatePlan($id, $request->validated());

            if (!$plan) {
                return $this->errorResponse(
                    'Paket berlangganan tidak ditemukan',
                    404
                );
            }

            return $this->successResponse(
                'Paket berlangganan berhasil diperbarui',
                $plan
            );
        } catch (\Exception $e) {
            Log::error('Error updating subscription plan', [
                'error' => $e->getMessage(),
                'plan_id' => $id,
                'data' => $request->validated(),
                'user_id' => $this->getCurrentUser()?->id ?? 'unknown'
            ]);

            return $this->errorResponse(
                'Gagal memperbarui paket berlangganan: ' . $e->getMessage(),
                422
            );
        }
    }

    /**
     * Delete subscription plan
     */
    public function destroy(string $id): JsonResponse
    {
        try {
            $deleted = $this->subscriptionPlanService->deletePlan($id);

            if (!$deleted) {
                return $this->errorResponse(
                    'Paket berlangganan tidak ditemukan',
                    404
                );
            }

            return $this->successResponse(
                'Paket berlangganan berhasil dihapus',
                null

            );
        } catch (\Exception $e) {
            Log::error('Error deleting subscription plan', [
                'error' => $e->getMessage(),
                'plan_id' => $id,
                'user_id' => $this->getCurrentUser()?->id
            ]);

            return $this->errorResponse(
                'Gagal menghapus paket berlangganan: ' . $e->getMessage(),
                422
            );
        }
    }

    /**
     * Toggle plan popularity
     */
    public function togglePopular(string $id): JsonResponse
    {
        try {
            $plan = $this->subscriptionPlanService->togglePopular($id);

            if (!$plan) {
                return $this->errorResponse(
                    'Paket berlangganan tidak ditemukan',
                    404
                );
            }

            $status = $plan->is_popular ? 'ditandai sebagai populer' : 'dihapus dari populer';

            // Clear popular plans cache when popularity changes
            $this->subscriptionPlanService->clearPopularPlansCache();

            return $this->successResponse(
                "Paket berlangganan berhasil {$status}",
                $plan
            );
        } catch (\Exception $e) {
            Log::error('Error toggling subscription plan popularity', [
                'error' => $e->getMessage(),
                'plan_id' => $id,
                'user_id' => $this->getCurrentUser()?->id
            ]);

            return $this->errorResponse(
                'Gagal mengubah status populer paket berlangganan',
                500
            );
        }
    }

    /**
     * Update plan sort order
     */
    public function updateSortOrder(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'sort_data' => 'required|array',
                'sort_data.*.id' => 'required|string|exists:subscription_plans,id',
                'sort_data.*.sort_order' => 'required|integer|min:1'
            ]);

            $success = $this->subscriptionPlanService->updateSortOrder($request->sort_data);

            if (!$success) {
                return $this->errorResponse(
                    'Gagal memperbarui urutan paket berlangganan',
                    500
                );
            }

            return $this->successResponse(
                'Urutan paket berlangganan berhasil diperbarui',
                null

            );
        } catch (\Exception $e) {
            Log::error('Error updating subscription plan sort order', [
                'error' => $e->getMessage(),
                'data' => json_encode($request->all()),
                'user_id' => $this->getCurrentUser()?->id ?? 'unknown'
            ]);

            return $this->errorResponse(
                'Gagal memperbarui urutan paket berlangganan: ' . $e->getMessage(),
                422
            );
        }
    }

    /**
     * Get plan statistics
     */
    public function statistics(): JsonResponse
    {
        try {
            $stats = $this->subscriptionPlanService->getPlanStatistics();

            return $this->successResponse(
                'Statistik paket berlangganan berhasil diambil',
                $stats
            );
        } catch (\Exception $e) {
            Log::error('Error fetching subscription plan statistics', [
                'error' => $e->getMessage(),
                'user_id' => $this->getCurrentUser()?->id
            ]);

            return $this->errorResponse(
                'Gagal mengambil statistik paket berlangganan',
                500
            );
        }
    }

    /**
     * Get plan analytics
     */
    public function analytics(Request $request): JsonResponse
    {
        try {
            $filters = $request->only(['date_from', 'date_to', 'period']);
            $analytics = $this->subscriptionPlanService->analytics($filters);

            return $this->successResponse(
                'Analitik paket berlangganan berhasil diambil',
                $analytics
            );
        } catch (\Exception $e) {
            Log::error('Error fetching subscription plan analytics', [
                'error' => $e->getMessage(),
                'user_id' => $this->getCurrentUser()?->id
            ]);

            return $this->errorResponse(
                'Gagal mengambil analitik paket berlangganan',
                500
            );
        }
    }

    /**
     * Export subscription plans
     */
    public function export(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'format' => 'required|string|in:json,csv,xlsx',
                'filters' => 'nullable|array'
            ]);

            $exportData = $this->subscriptionPlanService->export($request->validated());

            return $this->successResponse(
                'Data paket berlangganan berhasil diekspor',
                $exportData
            );
        } catch (\Exception $e) {
            Log::error('Error exporting subscription plans', [
                'error' => $e->getMessage(),
                'user_id' => $this->getCurrentUser()?->id
            ]);

            return $this->errorResponse(
                'Gagal mengekspor data paket berlangganan',
                500
            );
        }
    }

    /**
     * Get plans with subscription count
     */
    public function withSubscriptionCount(Request $request): JsonResponse
    {
        try {
            $plans = $this->subscriptionPlanService->withSubscriptionCount($request->only(['tier', 'status']));

            return $this->successResponse(
                'Daftar paket dengan jumlah berlangganan berhasil diambil',
                $plans
            );
        } catch (\Exception $e) {
            Log::error('Error fetching plans with subscription count', [
                'error' => $e->getMessage(),
                'user_id' => $this->getCurrentUser()?->id
            ]);

            return $this->errorResponse(
                'Gagal mengambil daftar paket dengan jumlah berlangganan',
                500
            );
        }
    }

    /**
     * Get popular plans with statistics
     */
    public function popularWithStats(): JsonResponse
    {
        try {
            $plans = $this->subscriptionPlanService->popularWithStats();

            return $this->successResponse(
                'Daftar paket populer dengan statistik berhasil diambil',
                $plans
            );
        } catch (\Exception $e) {
            Log::error('Error fetching popular plans with stats', [
                'error' => $e->getMessage(),
                'user_id' => $this->getCurrentUser()?->id
            ]);

            return $this->errorResponse(
                'Gagal mengambil daftar paket populer dengan statistik',
                500
            );
        }
    }

    /**
     * Get plans by tier with features
     */
    public function byTierWithFeatures(string $tier): JsonResponse
    {
        try {
            $plans = $this->subscriptionPlanService->byTierWithFeatures($tier);

            return $this->successResponse(
                "Daftar paket tier {$tier} dengan fitur berhasil diambil",
                $plans
            );
        } catch (\Exception $e) {
            Log::error('Error fetching plans by tier with features', [
                'error' => $e->getMessage(),
                'tier' => $tier,
                'user_id' => $this->getCurrentUser()?->id
            ]);

            return $this->errorResponse(
                'Gagal mengambil daftar paket berdasarkan tier dengan fitur',
                500
            );
        }
    }

    /**
     * Get plan comparison
     */
    public function comparison(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'plan_ids' => 'required|array|min:2|max:5',
                'plan_ids.*' => 'required|string|exists:subscription_plans,id'
            ]);

            $comparison = $this->subscriptionPlanService->comparison($request->plan_ids);

            return $this->successResponse(
                'Perbandingan paket berhasil diambil',
                $comparison
            );
        } catch (\Exception $e) {
            Log::error('Error comparing subscription plans', [
                'error' => $e->getMessage(),
                'plan_ids' => $request->get('plan_ids'),
                'user_id' => $this->getCurrentUser()?->id
            ]);

            return $this->errorResponse(
                'Gagal membandingkan paket berlangganan',
                500
            );
        }
    }

    /**
     * Get plan recommendations
     */
    public function recommendations(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'organization_id' => 'nullable|uuid|exists:organizations,id',
                'current_plan_id' => 'nullable|string|exists:subscription_plans,id',
                'usage_pattern' => 'nullable|string|in:light,moderate,heavy'
            ]);

            $recommendations = $this->subscriptionPlanService->recommendations($request->validated());

            return $this->successResponse(
                'Rekomendasi paket berhasil diambil',
                $recommendations
            );
        } catch (\Exception $e) {
            Log::error('Error getting plan recommendations', [
                'error' => $e->getMessage(),
                'user_id' => $this->getCurrentUser()?->id
            ]);

            return $this->errorResponse(
                'Gagal mengambil rekomendasi paket',
                500
            );
        }
    }

    /**
     * Get plan features
     */
    public function features(string $id): JsonResponse
    {
        try {
            $features = $this->subscriptionPlanService->features($id);

            if (!$features) {
                return $this->errorResponse(
                    'Paket berlangganan tidak ditemukan',
                    404
                );
            }

            return $this->successResponse(
                'Fitur paket berhasil diambil',
                $features
            );
        } catch (\Exception $e) {
            Log::error('Error fetching plan features', [
                'error' => $e->getMessage(),
                'plan_id' => $id,
                'user_id' => $this->getCurrentUser()?->id
            ]);

            return $this->errorResponse(
                'Gagal mengambil fitur paket',
                500
            );
        }
    }

    /**
     * Get plan pricing
     */
    public function pricing(string $id): JsonResponse
    {
        try {
            $pricing = $this->subscriptionPlanService->pricing($id);

            if (!$pricing) {
                return $this->errorResponse(
                    'Paket berlangganan tidak ditemukan',
                    404
                );
            }

            return $this->successResponse(
                'Harga paket berhasil diambil',
                $pricing
            );
        } catch (\Exception $e) {
            Log::error('Error fetching plan pricing', [
                'error' => $e->getMessage(),
                'plan_id' => $id,
                'user_id' => $this->getCurrentUser()?->id
            ]);

            return $this->errorResponse(
                'Gagal mengambil harga paket',
                500
            );
        }
    }

    /**
     * Get plan subscriptions
     */
    public function subscriptions(string $id, Request $request): JsonResponse
    {
        try {
            $subscriptions = $this->subscriptionPlanService->subscriptions($id, $request->only(['status', 'organization_id']));

            return $this->successResponse(
                'Daftar berlangganan paket berhasil diambil',
                $subscriptions
            );
        } catch (\Exception $e) {
            Log::error('Error fetching plan subscriptions', [
                'error' => $e->getMessage(),
                'plan_id' => $id,
                'user_id' => $this->getCurrentUser()?->id
            ]);

            return $this->errorResponse(
                'Gagal mengambil daftar berlangganan paket',
                500
            );
        }
    }

    /**
     * Get plan usage statistics
     */
    public function usageStats(string $id): JsonResponse
    {
        try {
            $stats = $this->subscriptionPlanService->usageStats($id);

            if (!$stats) {
                return $this->errorResponse(
                    'Paket berlangganan tidak ditemukan',
                    404
                );
            }

            return $this->successResponse(
                'Statistik penggunaan paket berhasil diambil',
                $stats
            );
        } catch (\Exception $e) {
            Log::error('Error fetching plan usage stats', [
                'error' => $e->getMessage(),
                'plan_id' => $id,
                'user_id' => $this->getCurrentUser()?->id
            ]);

            return $this->errorResponse(
                'Gagal mengambil statistik penggunaan paket',
                500
            );
        }
    }

    /**
     * Toggle plan status
     */
    public function toggleStatus(string $id): JsonResponse
    {
        try {
            $plan = $this->subscriptionPlanService->toggleStatus($id);

            if (!$plan) {
                return $this->errorResponse(
                    'Paket berlangganan tidak ditemukan',
                    404
                );
            }

            $status = $plan->status === 'active' ? 'diaktifkan' : 'dinonaktifkan';

            return $this->successResponse(
                "Paket berlangganan berhasil {$status}",
                $plan
            );
        } catch (\Exception $e) {
            Log::error('Error toggling plan status', [
                'error' => $e->getMessage(),
                'plan_id' => $id,
                'user_id' => $this->getCurrentUser()?->id
            ]);

            return $this->errorResponse(
                'Gagal mengubah status paket berlangganan',
                500
            );
        }
    }

    /**
     * Duplicate plan
     */
    public function duplicate(Request $request, string $id): JsonResponse
    {
        try {
            $request->validate([
                'name' => 'required|string|max:255',
                'description' => 'nullable|string|max:1000'
            ]);

            $duplicatedPlan = $this->subscriptionPlanService->duplicate($id, $request->validated());

            if (!$duplicatedPlan) {
                return $this->errorResponse(
                    'Paket berlangganan tidak ditemukan',
                    404
                );
            }

            return $this->createdResponse(
                $duplicatedPlan,
                'Paket berlangganan berhasil diduplikasi'
            );
        } catch (\Exception $e) {
            Log::error('Error duplicating plan', [
                'error' => $e->getMessage(),
                'plan_id' => $id,
                'user_id' => $this->getCurrentUser()?->id
            ]);

            return $this->errorResponse(
                'Gagal menduplikasi paket berlangganan',
                500
            );
        }
    }

    /**
     * Bulk create plans
     */
    public function bulkCreate(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'plans' => 'required|array|min:1|max:10',
                'plans.*.name' => 'required|string|max:255',
                'plans.*.description' => 'nullable|string|max:1000',
                'plans.*.tier' => 'required|string|in:basic,premium,enterprise',
                'plans.*.price' => 'required|numeric|min:0',
                'plans.*.billing_cycle' => 'required|string|in:monthly,yearly'
            ]);

            $createdPlans = $this->subscriptionPlanService->bulkCreate($request->plans);

            return $this->createdResponse(
                $createdPlans,
                'Paket berlangganan berhasil dibuat secara massal'
            );
        } catch (\Exception $e) {
            Log::error('Error bulk creating plans', [
                'error' => $e->getMessage(),
                'user_id' => $this->getCurrentUser()?->id
            ]);

            return $this->errorResponse(
                'Gagal membuat paket berlangganan secara massal',
                500
            );
        }
    }

    /**
     * Bulk update plans
     */
    public function bulkUpdate(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'updates' => 'required|array|min:1',
                'updates.*.id' => 'required|string|exists:subscription_plans,id',
                'updates.*.data' => 'required|array'
            ]);

            $updatedPlans = $this->subscriptionPlanService->bulkUpdatePlans($request->updates);

            return $this->successResponse(
                'Paket berlangganan berhasil diperbarui secara massal',
                $updatedPlans
            );
        } catch (\Exception $e) {
            Log::error('Error bulk updating plans', [
                'error' => $e->getMessage(),
                'user_id' => $this->getCurrentUser()?->id
            ]);

            return $this->errorResponse(
                'Gagal memperbarui paket berlangganan secara massal',
                500
            );
        }
    }
}
