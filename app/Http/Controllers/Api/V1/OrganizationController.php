<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\Organization\CreateOrganizationRequest;
use App\Http\Requests\Organization\UpdateOrganizationRequest;
use App\Http\Requests\ClientManagement\BulkActionRequest;
use App\Http\Requests\OrganizationSettingsRequest;
use App\Services\OrganizationService;
use App\Services\ClientManagementService;
use App\Http\Resources\OrganizationResource;
use App\Http\Resources\OrganizationCollection;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class OrganizationController extends BaseApiController
{
    protected OrganizationService $organizationService;
    protected ClientManagementService $clientManagementService;

    public function __construct(
        OrganizationService $organizationService,
        ClientManagementService $clientManagementService
    ) {
        parent::__construct();
        $this->organizationService = $organizationService;
        $this->clientManagementService = $clientManagementService;
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

    /**
     * Get organization statistics (Advanced)
     */
    public function statistics(): JsonResponse
    {
        try {
            $statistics = $this->clientManagementService->getStatistics();

            return $this->successResponse(
                message: 'Statistics retrieved successfully',
                data: $statistics,
                meta: [
                    'generated_at' => now()->toISOString(),
                    'cache_ttl' => 300 // 5 minutes
                ]
            );
        } catch (\Exception $e) {
            return $this->errorResponseWithDebug(
                message: 'Failed to retrieve statistics',
                statusCode: 500,
                errors: $e->getMessage(),
                exception: $e
            );
        }
    }

    /**
     * Bulk actions on organizations (Advanced)
     */
    public function bulkAction(BulkActionRequest $request): JsonResponse
    {
        try {
            $result = $this->clientManagementService->bulkAction(
                $request->input('action'),
                $request->input('organization_ids', [])
            );

            return $this->batchResponse(
                results: $result,
                message: 'Bulk action completed successfully'
            );
        } catch (\Exception $e) {
            return $this->errorResponseWithDebug(
                message: 'Failed to perform bulk action',
                statusCode: 500,
                errors: $e->getMessage(),
                exception: $e
            );
        }
    }

    /**
     * Export organizations (Advanced)
     */
    public function export(Request $request): JsonResponse
    {
        try {
            $params = $request->only([
                'format',
                'filters',
                'columns'
            ]);

            $exportData = $this->clientManagementService->exportOrganizations($params);

            return $this->successResponse(
                message: 'Export data prepared successfully',
                data: $exportData,
                meta: [
                    'export_format' => $params['format'] ?? 'json',
                    'exported_at' => now()->toISOString(),
                    'total_records' => $exportData['total'] ?? 0
                ]
            );
        } catch (\Exception $e) {
            return $this->errorResponseWithDebug(
                message: 'Failed to export organizations',
                statusCode: 500,
                errors: $e->getMessage(),
                exception: $e
            );
        }
    }

    /**
     * Import organizations (Advanced)
     */
    public function import(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'file' => 'required|file|mimes:csv,xlsx,xls|max:10240',
                'mapping' => 'required|array'
            ]);

            $result = $this->clientManagementService->importOrganizations(
                $request->file('file'),
                $request->input('mapping')
            );

            return $this->batchResponse(
                results: $result,
                message: 'Organizations imported successfully'
            );
        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->validationErrorResponse($e->errors());
        } catch (\Exception $e) {
            return $this->errorResponseWithDebug(
                message: 'Failed to import organizations',
                statusCode: 500,
                errors: $e->getMessage(),
                exception: $e
            );
        }
    }

    /**
     * Get organization activity logs (Advanced)
     */
    public function activityLogs(string $id, Request $request): JsonResponse
    {
        try {
            $params = $request->only(['page', 'per_page', 'date_from', 'date_to']);
            $logs = $this->clientManagementService->getOrganizationActivityLogs($id, $params);

            return $this->successResponse(
                message: 'Activity logs retrieved successfully',
                data: $logs['data'],
                meta: [
                    'organization_id' => $id,
                    'pagination' => $logs['pagination'],
                    'filters_applied' => array_filter($params, fn($value) => !empty($value))
                ]
            );
        } catch (\Exception $e) {
            return $this->errorResponseWithDebug(
                message: 'Failed to retrieve activity logs',
                statusCode: 500,
                errors: $e->getMessage(),
                exception: $e
            );
        }
    }

    /**
     * Update organization status (Advanced)
     */
    public function updateStatus(Request $request, string $id): JsonResponse
    {
        try {
            $request->validate([
                'status' => 'required|in:active,trial,suspended,inactive'
            ]);

            $organization = $this->clientManagementService->updateOrganizationStatus(
                $id,
                $request->input('status')
            );

            if (!$organization) {
                return $this->notFoundResponse('Organization', $id);
            }

            return $this->updatedResponse(
                data: $organization,
                message: 'Organization status updated successfully',
                meta: [
                    'organization_id' => $id,
                    'new_status' => $request->input('status'),
                    'updated_at' => now()->toISOString()
                ]
            );
        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->validationErrorResponse($e->errors());
        } catch (\Exception $e) {
            return $this->errorResponseWithDebug(
                message: 'Failed to update organization status',
                statusCode: 500,
                errors: $e->getMessage(),
                exception: $e
            );
        }
    }

    /**
     * Get organization settings
     */
    public function getSettings($organizationId): JsonResponse
    {
        try {
            $settings = $this->organizationService->getOrganizationSettings($organizationId);

            return $this->successResponse(
                'Organization settings retrieved successfully',
                $settings
            );
        } catch (\Exception $e) {
            return $this->errorResponseWithDebug(
                message: 'Failed to get organization settings',
                statusCode: 500,
                errors: $e->getMessage(),
                exception: $e
            );
        }
    }

    /**
     * Save organization settings
     */
    public function saveSettings(OrganizationSettingsRequest $request, $organizationId): JsonResponse
    {
        try {
            $settings = $request->validated();
            $result = $this->organizationService->saveOrganizationSettings($organizationId, $settings);

            return $this->successResponse(
                'Organization settings saved successfully',
                $result
            );
        } catch (\Exception $e) {
            return $this->errorResponseWithDebug(
                message: 'Failed to save organization settings',
                statusCode: 500,
                errors: $e->getMessage(),
                exception: $e
            );
        }
    }

    /**
     * Test webhook
     */
    public function testWebhook(Request $request, $organizationId): JsonResponse
    {
        try {
            $webhookUrl = $request->input('url');
            $result = $this->organizationService->testWebhook($organizationId, $webhookUrl);

            return $this->successResponse(
                'Webhook test successful',
                $result
            );
        } catch (\Exception $e) {
            return $this->errorResponseWithDebug(
                message: 'Webhook test failed',
                statusCode: 500,
                errors: $e->getMessage(),
                exception: $e
            );
        }
    }

    /**
     * Get organization analytics
     */
    public function getAnalytics(Request $request, $organizationId): JsonResponse
    {
        try {
            $params = $request->only(['time_range', 'start_date', 'end_date']);
            $analytics = $this->organizationService->getOrganizationAnalytics($organizationId, $params);

            return $this->successResponse(
                'Organization analytics retrieved successfully',
                $analytics
            );
        } catch (\Exception $e) {
            return $this->errorResponseWithDebug(
                message: 'Failed to get organization analytics',
                statusCode: 500,
                errors: $e->getMessage(),
                exception: $e
            );
        }
    }

    /**
     * Get organization roles
     */
    public function getRoles($organizationId): JsonResponse
    {
        try {
            $roles = $this->organizationService->getOrganizationRoles($organizationId);

            return $this->successResponse(
                'Organization roles retrieved successfully',
                $roles
            );
        } catch (\Exception $e) {
            return $this->errorResponseWithDebug(
                message: 'Failed to get organization roles',
                statusCode: 500,
                errors: $e->getMessage(),
                exception: $e
            );
        }
    }

    /**
     * Save role permissions
     */
    public function saveRolePermissions(Request $request, $organizationId, $roleId): JsonResponse
    {
        try {
            $permissions = $request->input('permissions', []);
            $result = $this->organizationService->saveRolePermissions($organizationId, $roleId, $permissions);

            return $this->successResponse(
                'Role permissions saved successfully',
                $result
            );
        } catch (\Exception $e) {
            return $this->errorResponseWithDebug(
                message: 'Failed to save role permissions',
                statusCode: 500,
                errors: $e->getMessage(),
                exception: $e
            );
        }
    }

    /**
     * Save all permissions
     */
    public function saveAllPermissions(Request $request, $organizationId): JsonResponse
    {
        try {
            $rolePermissions = $request->input('rolePermissions', []);
            $result = $this->organizationService->saveAllPermissions($organizationId, $rolePermissions);

            return $this->successResponse(
                'All permissions saved successfully',
                $result
            );
        } catch (\Exception $e) {
            return $this->errorResponseWithDebug(
                message: 'Failed to save all permissions',
                statusCode: 500,
                errors: $e->getMessage(),
                exception: $e
            );
        }
    }

    /**
     * Login as admin
     */
    public function loginAsAdmin(Request $request): JsonResponse
    {
        try {
            $organizationId = $request->input('organization_id');
            $organizationName = $request->input('organization_name');

            // Generate temporary admin token
            $token = $this->organizationService->generateAdminToken($organizationId);

            return $this->successResponse(
                'Admin token generated successfully',
                [
                    'token' => $token,
                    'organization_id' => $organizationId,
                    'organization_name' => $organizationName,
                    'redirect_url' => "/admin/organizations/{$organizationId}/dashboard"
                ]
            );
        } catch (\Exception $e) {
            return $this->errorResponseWithDebug(
                message: 'Failed to generate admin token',
                statusCode: 500,
                errors: $e->getMessage(),
                exception: $e
            );
        }
    }

    /**
     * Force password reset
     */
    public function forcePasswordReset(Request $request): JsonResponse
    {
        try {
            $organizationId = $request->input('organization_id');
            $email = $request->input('email');
            $organizationName = $request->input('organization_name');

            $result = $this->organizationService->forcePasswordReset($organizationId, $email, $organizationName);

            return $this->successResponse(
                'Password reset email sent successfully',
                $result
            );
        } catch (\Exception $e) {
            return $this->errorResponseWithDebug(
                message: 'Failed to send password reset email',
                statusCode: 500,
                errors: $e->getMessage(),
                exception: $e
            );
        }
    }
}
