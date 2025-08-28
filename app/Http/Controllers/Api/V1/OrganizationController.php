<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\Organization\CreateOrganizationRequest;
use App\Http\Requests\Organization\UpdateOrganizationRequest;
use App\Services\OrganizationService;
use App\Http\Resources\OrganizationResource;
use App\Http\Resources\OrganizationCollection;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class OrganizationController extends BaseApiController
{
    protected OrganizationService $organizationService;

    public function __construct(OrganizationService $organizationService)
    {
        $this->organizationService = $organizationService;
    }

    /**
     * Get all organizations
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $filters = $request->only([
                'status', 'subscription_status', 'business_type',
                'industry', 'company_size', 'has_active_subscription'
            ]);

            $organizations = $this->organizationService->getAllOrganizations($request, $filters);

            return $this->successResponse(
                'Daftar organisasi berhasil diambil',
                new OrganizationCollection($organizations)
            );
        } catch (\Exception $e) {
            Log::error('Error fetching organizations', [
                'error' => $e->getMessage(),
                'user_id' => $this->getCurrentUser()?->id ?? 'unknown'
            ]);

            return $this->errorResponse(
                'Gagal mengambil daftar organisasi',
                500
            );
        }
    }

    /**
     * Get active organizations
     */
    public function active(): JsonResponse
    {
        try {
            $organizations = $this->organizationService->getActiveOrganizations();

            return $this->successResponse(
                'Daftar organisasi aktif berhasil diambil',
                new OrganizationCollection($organizations)
            );
        } catch (\Exception $e) {
            Log::error('Error fetching active organizations', [
                'error' => $e->getMessage(),
                'user_id' => $this->getCurrentUser()?->id ?? 'unknown'
            ]);

            return $this->errorResponse(
                'Gagal mengambil daftar organisasi aktif',
                500
            );
        }
    }

    /**
     * Get trial organizations
     */
    public function trial(): JsonResponse
    {
        try {
            $organizations = $this->organizationService->getTrialOrganizations();

            return $this->successResponse(
                'Daftar organisasi dalam masa trial berhasil diambil',
                new OrganizationCollection($organizations)
            );
        } catch (\Exception $e) {
            Log::error('Error fetching trial organizations', [
                'error' => $e->getMessage(),
                'user_id' => $this->getCurrentUser()?->id ?? 'unknown'
            ]);

            return $this->errorResponse(
                'Gagal mengambil daftar organisasi dalam masa trial',
                500
            );
        }
    }

    /**
     * Get expired trial organizations
     */
    public function expiredTrial(): JsonResponse
    {
        try {
            $organizations = $this->organizationService->getExpiredTrialOrganizations();

            return $this->successResponse(
                'Daftar organisasi dengan trial yang berakhir berhasil diambil',
                new OrganizationCollection($organizations)
            );
        } catch (\Exception $e) {
            Log::error('Error fetching expired trial organizations', [
                'error' => $e->getMessage(),
                'user_id' => $this->getCurrentUser()?->id ?? 'unknown'
            ]);

            return $this->errorResponse(
                'Gagal mengambil daftar organisasi dengan trial yang berakhir',
                500
            );
        }
    }

    /**
     * Get organizations by business type
     */
    public function byBusinessType(string $businessType): JsonResponse
    {
        try {
            $organizations = $this->organizationService->getOrganizationsByBusinessType($businessType);

            return $this->successResponse(
                "Daftar organisasi tipe bisnis {$businessType} berhasil diambil",
                new OrganizationCollection($organizations)
            );
        } catch (\Exception $e) {
            Log::error('Error fetching organizations by business type', [
                'error' => $e->getMessage(),
                'business_type' => $businessType,
                'user_id' => $this->getCurrentUser()?->id ?? 'unknown'
            ]);

            return $this->errorResponse(
                'Gagal mengambil daftar organisasi berdasarkan tipe bisnis',
                500
            );
        }
    }

    /**
     * Get organizations by industry
     */
    public function byIndustry(string $industry): JsonResponse
    {
        try {
            $organizations = $this->organizationService->getOrganizationsByIndustry($industry);

            return $this->successResponse(
                "Daftar organisasi industri {$industry} berhasil diambil",
                new OrganizationCollection($organizations)
            );
        } catch (\Exception $e) {
            Log::error('Error fetching organizations by industry', [
                'error' => $e->getMessage(),
                'industry' => $industry,
                'user_id' => $this->getCurrentUser()?->id ?? 'unknown'
            ]);

            return $this->errorResponse(
                'Gagal mengambil daftar organisasi berdasarkan industri',
                500
            );
        }
    }

    /**
     * Get organizations by company size
     */
    public function byCompanySize(string $companySize): JsonResponse
    {
        try {
            $organizations = $this->organizationService->getOrganizationsByCompanySize($companySize);

            return $this->successResponse(
                "Daftar organisasi ukuran perusahaan {$companySize} berhasil diambil",
                new OrganizationCollection($organizations)
            );
        } catch (\Exception $e) {
            Log::error('Error fetching organizations by company size', [
                'error' => $e->getMessage(),
                'company_size' => $companySize,
                'user_id' => $this->getCurrentUser()?->id ?? 'unknown'
            ]);

            return $this->errorResponse(
                'Gagal mengambil daftar organisasi berdasarkan ukuran perusahaan',
                500
            );
        }
    }

    /**
     * Get organization by ID
     */
    public function show(string $id): JsonResponse
    {
        try {
            $organization = $this->organizationService->getOrganizationById($id, [
                'subscriptionPlan', 'users', 'roles', 'permissions'
            ]);

            if (!$organization) {
                return $this->errorResponse(
                    'Organisasi tidak ditemukan',
                    404
                );
            }

            return $this->successResponse(
                'Detail organisasi berhasil diambil',
                new OrganizationResource($organization)
            );
        } catch (\Exception $e) {
            Log::error('Error fetching organization', [
                'error' => $e->getMessage(),
                'organization_id' => $id,
                'user_id' => $this->getCurrentUser()?->id ?? 'unknown'
            ]);

            return $this->errorResponse(
                'Gagal mengambil detail organisasi',
                500
            );
        }
    }

    /**
     * Get organization by code
     */
    public function showByCode(string $orgCode): JsonResponse
    {
        try {
            $organization = $this->organizationService->getOrganizationByCode($orgCode);

            if (!$organization) {
                return $this->errorResponse(
                    'Organisasi tidak ditemukan',
                    404
                );
            }

            return $this->successResponse(
                'Detail organisasi berhasil diambil',
                new OrganizationResource($organization)
            );
        } catch (\Exception $e) {
            Log::error('Error fetching organization by code', [
                'error' => $e->getMessage(),
                'org_code' => $orgCode,
                'user_id' => $this->getCurrentUser()?->id ?? 'unknown'
            ]);

            return $this->errorResponse(
                'Gagal mengambil detail organisasi',
                500
            );
        }
    }

    /**
     * Create organization
     */
    public function store(CreateOrganizationRequest $request): JsonResponse
    {
        try {
            $organization = $this->organizationService->createOrganization($request->validated());

            return $this->createdResponse(
                new OrganizationResource($organization),
                'Organisasi berhasil dibuat'
            );
        } catch (\Exception $e) {
            Log::error('Error creating organization', [
                'error' => $e->getMessage(),
                'data' => $request->validated(),
                'user_id' => $this->getCurrentUser()?->id ?? 'unknown'
            ]);

            return $this->errorResponse(
                'Gagal membuat organisasi: ' . $e->getMessage(),
                422
            );
        }
    }

    /**
     * Update organization
     */
    public function update(UpdateOrganizationRequest $request, string $id): JsonResponse
    {
        try {
            $organization = $this->organizationService->updateOrganization($id, $request->validated());

            if (!$organization) {
                return $this->errorResponse(
                    'Organisasi tidak ditemukan',
                    404
                );
            }

            return $this->successResponse(
                'Organisasi berhasil diperbarui',
                new OrganizationResource($organization)
            );
        } catch (\Exception $e) {
            Log::error('Error updating organization', [
                'error' => $e->getMessage(),
                'organization_id' => $id,
                'data' => $request->validated(),
                'user_id' => $this->getCurrentUser()?->id ?? 'unknown'
            ]);

            return $this->errorResponse(
                'Gagal memperbarui organisasi: ' . $e->getMessage(),
                422
            );
        }
    }

    /**
     * Delete organization
     */
    public function destroy(string $id): JsonResponse
    {
        try {
            $deleted = $this->organizationService->deleteOrganization($id);

            if (!$deleted) {
                return $this->errorResponse(
                    'Organisasi tidak ditemukan',
                    404
                );
            }

            return $this->successResponse(
                'Organisasi berhasil dihapus'
            );
        } catch (\Exception $e) {
            Log::error('Error deleting organization', [
                'error' => $e->getMessage(),
                'organization_id' => $id,
                'user_id' => $this->getCurrentUser()?->id ?? 'unknown'
            ]);

            return $this->errorResponse(
                'Gagal menghapus organisasi: ' . $e->getMessage(),
                422
            );
        }
    }

    /**
     * Get organization statistics
     */
    public function statistics(): JsonResponse
    {
        try {
            $stats = $this->organizationService->getOrganizationStatistics();

            return $this->successResponse(
                'Statistik organisasi berhasil diambil',
                $stats
            );
        } catch (\Exception $e) {
            Log::error('Error fetching organization statistics', [
                'error' => $e->getMessage(),
                'user_id' => $this->getCurrentUser()?->id ?? 'unknown'
            ]);

            return $this->errorResponse(
                'Gagal mengambil statistik organisasi',
                500
            );
        }
    }

    /**
     * Get organization users
     */
    public function users(string $id): JsonResponse
    {
        try {
            $users = $this->organizationService->getOrganizationUsers($id);

            if (empty($users)) {
                return $this->errorResponse(
                    'Organisasi tidak ditemukan',
                    404
                );
            }

            return $this->successResponse(
                'Daftar pengguna organisasi berhasil diambil',
                $users
            );
        } catch (\Exception $e) {
            Log::error('Error fetching organization users', [
                'error' => $e->getMessage(),
                'organization_id' => $id,
                'user_id' => $this->getCurrentUser()?->id ?? 'unknown'
            ]);

            return $this->errorResponse(
                'Gagal mengambil daftar pengguna organisasi',
                500
            );
        }
    }

    /**
     * Add user to organization
     */
    public function addUser(Request $request, string $id): JsonResponse
    {
        try {
            $request->validate([
                'user_id' => 'required|string|exists:users,id',
                'role' => 'nullable|string|in:admin,manager,member,viewer'
            ]);

            $success = $this->organizationService->addUserToOrganization(
                $id,
                $request->user_id,
                $request->role ?? 'member'
            );

            if (!$success) {
                return $this->errorResponse(
                    'Organisasi atau pengguna tidak ditemukan',
                    404
                );
            }

            return $this->successResponse(
                'Pengguna berhasil ditambahkan ke organisasi'
            );
        } catch (\Exception $e) {
            Log::error('Error adding user to organization', [
                'error' => $e->getMessage(),
                'organization_id' => $id,
                'user_id' => $request->user_id,
                'admin_user_id' => $this->getCurrentUser()?->id ?? 'unknown'
            ]);

            return $this->errorResponse(
                'Gagal menambahkan pengguna ke organisasi: ' . $e->getMessage(),
                422
            );
        }
    }

    /**
     * Remove user from organization
     */
    public function removeUser(string $id, string $userId): JsonResponse
    {
        try {
            $success = $this->organizationService->removeUserFromOrganization($id, $userId);

            if (!$success) {
                return $this->errorResponse(
                    'Organisasi atau pengguna tidak ditemukan',
                    404
                );
            }

            return $this->successResponse(
                'Pengguna berhasil dihapus dari organisasi'
            );
        } catch (\Exception $e) {
            Log::error('Error removing user from organization', [
                'error' => $e->getMessage(),
                'organization_id' => $id,
                'user_id' => $userId,
                'admin_user_id' => $this->getCurrentUser()?->id ?? 'unknown'
            ]);

            return $this->errorResponse(
                'Gagal menghapus pengguna dari organisasi: ' . $e->getMessage(),
                422
            );
        }
    }

    /**
     * Update organization subscription
     */
    public function updateSubscription(Request $request, string $id): JsonResponse
    {
        try {
            $request->validate([
                'subscription_plan_id' => 'nullable|string|exists:subscription_plans,id',
                'subscription_status' => 'nullable|string|in:trial,active,inactive,suspended,cancelled',
                'trial_ends_at' => 'nullable|date|after:now',
                'subscription_starts_at' => 'nullable|date',
                'subscription_ends_at' => 'nullable|date|after:subscription_starts_at',
                'billing_cycle' => 'nullable|string|in:monthly,quarterly,yearly'
            ]);

            $organization = $this->organizationService->updateSubscription($id, $request->all());

            if (!$organization) {
                return $this->errorResponse(
                    'Organisasi tidak ditemukan',
                    404
                );
            }

            return $this->successResponse(
                'Berlangganan organisasi berhasil diperbarui',
                new OrganizationResource($organization)
            );
        } catch (\Exception $e) {
            Log::error('Error updating organization subscription', [
                'error' => $e->getMessage(),
                'organization_id' => $id,
                'data' => $request->all(),
                'user_id' => $this->getCurrentUser()?->id ?? 'unknown'
            ]);

            return $this->errorResponse(
                'Gagal memperbarui berlangganan organisasi: ' . $e->getMessage(),
                422
            );
        }
    }
}
