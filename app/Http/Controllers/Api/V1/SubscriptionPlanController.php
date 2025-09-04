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
}
