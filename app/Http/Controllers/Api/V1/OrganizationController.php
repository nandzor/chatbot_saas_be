<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\Organization\CreateOrganizationRequest;
use App\Http\Requests\Organization\UpdateOrganizationRequest;
use App\Http\Requests\ClientManagement\BulkActionRequest;
use App\Http\Requests\ClientManagement\ImportOrganizationsRequest;
use App\Http\Requests\ClientManagement\ExportOrganizationsRequest;
use App\Http\Requests\OrganizationSettingsRequest;
use App\Services\OrganizationService;
use App\Services\ClientManagementService;
use App\Http\Resources\OrganizationResource;
use App\Http\Resources\OrganizationCollection;
use App\Traits\OrganizationControllerTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

/**
 * OrganizationController - Hybrid Controller
 *
 * This controller serves both super admin and organization users:
 * - Super Admin: Uses ClientManagementService for platform-wide operations
 * - Organization Users: Uses OrganizationService for organization-specific operations
 *
 * @package App\Http\Controllers\Api\V1
 */
class OrganizationController extends BaseApiController
{
    use OrganizationControllerTrait;

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
     * Check if current user is super admin
     */
    protected function isSuperAdmin(): bool
    {
        $user = $this->getCurrentUser();
        return $user && $user instanceof \App\Models\User && $user->hasRole('super_admin');
    }

    /**
     * Get all organizations with advanced filtering
     *
     * Super Admin: Gets all organizations via ClientManagementService
     * Organization Users: Gets their own organization via OrganizationService
     */
    public function index(Request $request): JsonResponse
    {
        $filters = $request->only([
            'status', 'subscription_status', 'business_type',
            'industry', 'company_size', 'has_active_subscription',
            'search', 'sort_by', 'sort_order', 'page', 'per_page',
            'date_from', 'date_to', 'plan_id'
        ]);

        return $this->handleOrganizationList($request, $filters);
    }

    /**
     * Get active organizations
     *
     * Super Admin: Gets all active organizations
     * Organization Users: Gets their own organization if active
     */
    public function active(): JsonResponse
    {
        return $this->handleOrganizationList(request(), ['status' => 'active']);
    }

    /**
     * Get trial organizations
     *
     * Super Admin: Gets all trial organizations
     * Organization Users: Gets their own organization if trial
     */
    public function trial(): JsonResponse
    {
        return $this->handleOrganizationList(request(), ['subscription_status' => 'trial']);
    }

    /**
     * Get expired trial organizations
     *
     * Super Admin: Gets all expired trial organizations
     * Organization Users: Gets their own organization if expired trial
     */
    public function expiredTrial(): JsonResponse
    {
        return $this->handleOrganizationList(request(), ['subscription_status' => 'expired']);
    }

    /**
     * Get organizations by business type
     *
     * Super Admin: Gets all organizations by business type
     * Organization Users: Gets their own organization if matches business type
     */
    public function byBusinessType(string $businessType): JsonResponse
    {
        return $this->handleOrganizationList(request(), ['business_type' => $businessType]);
    }

    /**
     * Get organizations by industry
     *
     * Super Admin: Gets all organizations by industry
     * Organization Users: Gets their own organization if matches industry
     */
    public function byIndustry(string $industry): JsonResponse
    {
        return $this->handleOrganizationList(request(), ['industry' => $industry]);
    }

    /**
     * Get organizations by company size
     *
     * Super Admin: Gets all organizations by company size
     * Organization Users: Gets their own organization if matches company size
     */
    public function byCompanySize(string $companySize): JsonResponse
    {
        return $this->handleOrganizationList(request(), ['company_size' => $companySize]);
    }

    /**
     * Get organization by ID
     *
     * Super Admin: Gets any organization via ClientManagementService
     * Organization Users: Gets their own organization via OrganizationService
     */
    public function show(string $id): JsonResponse
    {
        return $this->handleOrganizationDetails($id);
    }

    /**
     * Get organization by code
     *
     * Super Admin: Gets any organization by code
     * Organization Users: Gets their own organization by code
     */
    public function showByCode(string $orgCode): JsonResponse
    {
        try {
            $organization = $this->organizationService->getOrganizationByCode($orgCode);

            if (!$organization) {
                return $this->errorResponse('Organisasi tidak ditemukan', 404);
            }

            // Check if user has access to this organization
            if (!$this->isSuperAdmin()) {
                $user = $this->getCurrentUser();
                if (!$user || $user->organization_id !== $organization->id) {
                    return $this->errorResponse('Akses ditolak', 403);
                }
            }

            return $this->successResponse(
                'Detail organisasi berhasil diambil',
                new OrganizationResource($organization)
            );
        } catch (\Exception $e) {
            return $this->handleException($e, 'fetching organization by code', ['org_code' => $orgCode]);
        }
    }

    /**
     * Create new organization
     *
     * Super Admin: Can create any organization
     * Organization Users: Cannot create organizations (restricted)
     */
    public function store(CreateOrganizationRequest $request): JsonResponse
    {
        if (!$this->isSuperAdmin()) {
            return $this->errorResponse(
                'Akses ditolak. Hanya admin yang dapat membuat organisasi',
                403
            );
        }

        return $this->handleOrganizationCreation($request->validated());
    }

    /**
     * Update organization
     *
     * Super Admin: Can update any organization
     * Organization Users: Can only update their own organization
     */
    public function update(UpdateOrganizationRequest $request, string $id): JsonResponse
    {
        return $this->handleOrganizationUpdate($id, $request->validated());
    }

    /**
     * Delete organization
     *
     * Super Admin: Can delete any organization
     * Organization Users: Cannot delete organizations (restricted)
     */
    public function destroy(string $id): JsonResponse
    {
        if (!$this->isSuperAdmin()) {
            return $this->errorResponse(
                'Akses ditolak. Hanya admin yang dapat menghapus organisasi',
                403
            );
        }

        return $this->handleOrganizationDeletion($id);
    }

    /**
     * Get organization users
     *
     * Super Admin: Gets users of any organization
     * Organization Users: Gets users of their own organization
     */
    public function users(string $id): JsonResponse
    {
        return $this->handleOrganizationUsers($id);
    }

    /**
     * Add user to organization
     *
     * Super Admin: Can add user to any organization
     * Organization Users: Can add user to their own organization
     */
    public function addUser(Request $request, string $id): JsonResponse
    {
        try {
            $request->validate([
                'user_id' => 'required|exists:users,id',
                'role' => 'string|in:admin,member'
            ]);

            $success = $this->organizationService->addUserToOrganization(
                $id,
                $request->user_id,
                $request->role ?? 'member'
            );

            if (!$success) {
                return $this->errorResponse('Gagal menambahkan user ke organisasi', 400);
            }

            return $this->successResponse('User berhasil ditambahkan ke organisasi');
        } catch (\Exception $e) {
            return $this->handleException($e, 'adding user to organization', [
                'id' => $id,
                'user_id' => $request->user_id
            ]);
        }
    }

    /**
     * Remove user from organization
     *
     * Super Admin: Can remove user from any organization
     * Organization Users: Can remove user from their own organization
     */
    public function removeUser(string $id, string $userId): JsonResponse
    {
        try {
            $success = $this->organizationService->removeUserFromOrganization($id, $userId);

            if (!$success) {
                return $this->errorResponse('Gagal menghapus user dari organisasi', 400);
            }

            return $this->successResponse('User berhasil dihapus dari organisasi');
        } catch (\Exception $e) {
            return $this->handleException($e, 'removing user from organization', [
                'id' => $id,
                'user_id' => $userId
            ]);
        }
    }

    /**
     * Update organization subscription
     *
     * Super Admin: Can update subscription of any organization
     * Organization Users: Can update subscription of their own organization
     */
    public function updateSubscription(Request $request, string $id): JsonResponse
    {
        try {
            $request->validate([
                'plan_id' => 'required|exists:subscription_plans,id',
                'status' => 'required|in:active,trial,suspended,expired',
                'start_date' => 'date',
                'end_date' => 'date|after:start_date'
            ]);

            $organization = $this->organizationService->updateSubscription($id, $request->all());

            if (!$organization) {
                return $this->errorResponse('Organisasi tidak ditemukan', 404);
            }

            return $this->successResponse(
                'Subscription organisasi berhasil diperbarui',
                new OrganizationResource($organization)
            );
        } catch (\Exception $e) {
            return $this->handleException($e, 'updating subscription', [
                'id' => $id,
                'data' => $request->all()
            ]);
        }
    }

    /**
     * Get organization statistics
     *
     * Super Admin: Gets platform-wide statistics
     * Organization Users: Gets organization-specific statistics
     */
    public function getStatistics(): JsonResponse
    {
        return $this->handleOrganizationStatistics();
    }

    /**
     * Bulk actions on organizations
     *
     * Super Admin: Can perform bulk actions on any organizations
     * Organization Users: Cannot perform bulk actions (restricted)
     */
    public function bulkAction(BulkActionRequest $request): JsonResponse
    {
        if (!$this->isSuperAdmin()) {
            return $this->errorResponse(
                'Akses ditolak. Hanya admin yang dapat melakukan bulk action',
                403
            );
        }

        return $this->handleBulkAction(
            $request->action,
            $request->organization_ids,
            $request->options ?? []
        );
    }

    /**
     * Export organizations
     *
     * Super Admin: Can export all organizations
     * Organization Users: Can export their own organization
     */
    public function export(ExportOrganizationsRequest $request): JsonResponse
    {
        $params = $request->only(['format', 'filters', 'columns']);
        return $this->handleOrganizationExport($params);
    }

    /**
     * Import organizations
     *
     * Super Admin: Can import organizations
     * Organization Users: Cannot import organizations (restricted)
     */
    public function import(ImportOrganizationsRequest $request): JsonResponse
    {
        if (!$this->isSuperAdmin()) {
            return $this->errorResponse(
                'Akses ditolak. Hanya admin yang dapat melakukan import',
                403
            );
        }

        return $this->handleOrganizationImport(
            $request->file('file'),
            $request->input('mapping')
        );
    }

    /**
     * Get organization activity logs
     *
     * Super Admin: Gets activity logs of any organization
     * Organization Users: Gets activity logs of their own organization
     */
    public function activityLogs(string $id, Request $request): JsonResponse
    {
        $params = $request->only([
            'date_from', 'date_to', 'action', 'user_id',
            'page', 'per_page', 'sort_by', 'sort_order'
        ]);

        return $this->handleOrganizationActivityLogs($id, $params);
    }

    /**
     * Update organization status
     *
     * Super Admin: Can update status of any organization
     * Organization Users: Cannot update organization status (restricted)
     */
    public function updateStatus(Request $request, string $id): JsonResponse
    {
        if (!$this->isSuperAdmin()) {
            return $this->errorResponse(
                'Akses ditolak. Hanya admin yang dapat mengubah status organisasi',
                403
            );
        }

        $request->validate([
            'status' => 'required|in:active,trial,suspended,inactive'
        ]);

        return $this->handleOrganizationStatusUpdate($id, $request->status);
    }

    /**
     * Get organization settings
     *
     * Super Admin: Gets settings of any organization
     * Organization Users: Gets settings of their own organization
     */
    public function getSettings($organizationId): JsonResponse
    {
        return $this->handleOrganizationSettingsById($organizationId);
    }

    /**
     * Save organization settings
     *
     * Super Admin: Can save settings of any organization
     * Organization Users: Can save settings of their own organization
     */
    public function saveSettings(OrganizationSettingsRequest $request, $organizationId): JsonResponse
    {
        return $this->handleOrganizationSettingsById($organizationId, $request->validated());
    }

    /**
     * Test organization webhook
     *
     * Super Admin: Can test webhook of any organization
     * Organization Users: Can test webhook of their own organization
     */
    public function testWebhook(Request $request, $organizationId): JsonResponse
    {
        $request->validate(['webhook_url' => 'required|url']);
        return $this->handleWebhookTestById($organizationId, $request->webhook_url);
    }

    /**
     * Get all organizations analytics
     *
     * Super Admin: Gets platform-wide analytics
     * Organization Users: Gets analytics of their own organization
     */
    public function getAllOrganizationsAnalytics(Request $request): JsonResponse
    {
        $params = $request->only(['time_range', 'date_from', 'date_to', 'group_by']);
        return $this->handleAllOrganizationsAnalytics($params);
    }

    /**
     * Get organization analytics
     *
     * Super Admin: Gets analytics of any organization
     * Organization Users: Gets analytics of their own organization
     */
    public function getAnalytics(Request $request, $organizationId): JsonResponse
    {
        $params = $request->only(['time_range', 'date_from', 'date_to', 'group_by']);
        return $this->handleOrganizationAnalytics($organizationId, $params);
    }

    /**
     * Get organization roles
     *
     * Super Admin: Gets roles of any organization
     * Organization Users: Gets roles of their own organization
     */
    public function getRoles($organizationId): JsonResponse
    {
        return $this->handleOrganizationRolesById($organizationId);
    }

    /**
     * Save role permissions
     *
     * Super Admin: Can save role permissions of any organization
     * Organization Users: Can save role permissions of their own organization
     */
    public function saveRolePermissions(Request $request, $organizationId, $roleId): JsonResponse
    {
        try {
            $permissions = $request->input('permissions', []);
            $result = $this->organizationService->saveRolePermissions($organizationId, $roleId, $permissions);

            return $this->successResponse('Permission role berhasil disimpan', $result);
        } catch (\Exception $e) {
            return $this->handleException($e, 'saving role permissions', [
                'organization_id' => $organizationId,
                'role_id' => $roleId,
                'permissions' => $permissions
            ]);
        }
    }

    /**
     * Save all permissions
     *
     * Super Admin: Can save all permissions of any organization
     * Organization Users: Can save all permissions of their own organization
     */
    public function saveAllPermissions(Request $request, $organizationId): JsonResponse
    {
        $rolePermissions = $request->input('role_permissions', []);
        return $this->handleOrganizationRolesById($organizationId, $rolePermissions);
    }

    /**
     * Login as admin
     *
     * Super Admin: Can login as admin of any organization
     * Organization Users: Cannot login as admin (restricted)
     */
    public function loginAsAdmin(Request $request): JsonResponse
    {
        if (!$this->isSuperAdmin()) {
            return $this->errorResponse(
                'Akses ditolak. Hanya super admin yang dapat login sebagai admin',
                403
            );
        }

        try {
            $request->validate(['organization_id' => 'required|exists:organizations,id']);
            $token = $this->organizationService->generateAdminToken($request->organization_id);

            return $this->successResponse('Token admin berhasil dibuat', ['admin_token' => $token]);
        } catch (\Exception $e) {
            return $this->handleException($e, 'generating admin token', [
                'organization_id' => $request->organization_id
            ]);
        }
    }

    /**
     * Force password reset
     *
     * Super Admin: Can force password reset for any organization
     * Organization Users: Cannot force password reset (restricted)
     */
    public function forcePasswordReset(Request $request): JsonResponse
    {
        if (!$this->isSuperAdmin()) {
            return $this->errorResponse(
                'Akses ditolak. Hanya super admin yang dapat memaksa reset password',
                403
            );
        }

        try {
            $request->validate([
                'organization_id' => 'required|exists:organizations,id',
                'email' => 'required|email',
                'organization_name' => 'required|string'
            ]);

            $result = $this->organizationService->forcePasswordReset(
                $request->organization_id,
                $request->email,
                $request->organization_name
            );

            return $this->successResponse('Reset password berhasil dipaksa', $result);
        } catch (\Exception $e) {
            return $this->handleException($e, 'forcing password reset', $request->all());
        }
    }

    /**
     * Search organizations
     *
     * Super Admin: Can search all organizations
     * Organization Users: Can search their own organization
     */
    public function search(Request $request): JsonResponse
    {
        return $this->handleOrganizationSearch($request);
    }

    /**
     * Get organization health status
     *
     * Super Admin: Gets health status of any organization
     * Organization Users: Gets health status of their own organization
     */
    public function health(string $id): JsonResponse
    {
        return $this->handleOrganizationHealth($id);
    }

    /**
     * Get organization analytics
     *
     * Super Admin: Gets analytics of any organization
     * Organization Users: Gets analytics of their own organization
     */
    public function analytics(string $id, Request $request): JsonResponse
    {
        $params = $request->only(['time_range', 'date_from', 'date_to', 'group_by']);
        return $this->handleOrganizationAnalytics($id, $params);
    }

    /**
     * Get organization metrics
     *
     * Super Admin: Gets metrics of any organization
     * Organization Users: Gets metrics of their own organization
     */
    public function metrics(string $id, Request $request): JsonResponse
    {
        $params = $request->only(['time_range', 'date_from', 'date_to', 'group_by']);
        return $this->handleOrganizationMetrics($id, $params);
    }

    /**
     * Get deleted organizations
     *
     * Super Admin: Gets all deleted organizations
     * Organization Users: Cannot access deleted organizations (restricted)
     */
    public function deleted(Request $request): JsonResponse
    {
        if (!$this->isSuperAdmin()) {
            return $this->errorResponse(
                'Akses ditolak. Hanya admin yang dapat melihat organisasi yang dihapus',
                403
            );
        }

        $params = $request->only(['date_from', 'date_to', 'deleted_by', 'page', 'per_page']);
        return $this->handleDeletedOrganizations($params);
    }

    /**
     * Restore deleted organization
     *
     * Super Admin: Can restore any deleted organization
     * Organization Users: Cannot restore organizations (restricted)
     */
    public function restore(string $id): JsonResponse
    {
        if (!$this->isSuperAdmin()) {
            return $this->errorResponse(
                'Akses ditolak. Hanya admin yang dapat restore organisasi',
                403
            );
        }

        return $this->handleOrganizationRestore($id);
    }

    /**
     * Clear organization cache
     *
     * Super Admin: Can clear any organization cache
     * Organization Users: Cannot clear cache (restricted)
     */
    public function clearCache(string $organizationId = null): JsonResponse
    {
        if (!$this->isSuperAdmin()) {
            return $this->errorResponse(
                'Akses ditolak. Hanya admin yang dapat menghapus cache',
                403
            );
        }

        return $this->handleCacheOperations($organizationId);
    }

    /**
     * Send notification to organization
     *
     * Super Admin: Can send notification to any organization
     * Organization Users: Can send notification to their own organization
     */
    public function sendNotification(Request $request, string $id): JsonResponse
    {
        $data = $request->validate([
            'type' => 'required|string|max:100',
            'title' => 'required|string|max:255',
            'message' => 'required|string',
            'channels' => 'array|in:in_app,email,webhook',
            'priority' => 'string|in:low,normal,high,urgent',
            'send_email' => 'boolean',
            'email_template' => 'string|max:100',
            'email_subject' => 'string|max:255',
            'broadcast' => 'boolean',
            'data' => 'array'
        ]);

        return $this->handleSendNotification($id, $data['type'], $data);
    }

    /**
     * Get notification templates
     *
     * Super Admin: Gets all available templates
     * Organization Users: Gets templates for their organization
     */
    public function getNotificationTemplates(): JsonResponse
    {
        try {
            $templateService = app(\App\Services\NotificationTemplateService::class);
            $templates = $templateService->getAvailableTypes();

            return $this->successResponse('Notification templates retrieved successfully', $templates);
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to retrieve notification templates: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get notification template details
     *
     * Super Admin: Gets template details for any organization
     * Organization Users: Gets template details for their organization
     */
    public function getNotificationTemplate(string $type): JsonResponse
    {
        try {
            $templateService = app(\App\Services\NotificationTemplateService::class);
            $organization = $this->getCurrentOrganization();

            $template = $templateService->getTemplate($type, $organization);

            return $this->successResponse('Notification template retrieved successfully', $template);
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to retrieve notification template: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get notification analytics
     *
     * Super Admin: Gets analytics for any organization
     * Organization Users: Gets analytics for their own organization
     */
    public function getNotificationAnalytics(Request $request, string $id = null): JsonResponse
    {
        try {
            $analyticsService = app(\App\Services\NotificationAnalyticsService::class);
            $params = $request->only(['date_from', 'date_to', 'group_by']);

            if ($this->isSuperAdmin() && $id) {
                // Super admin can view any organization's analytics
                $analytics = $analyticsService->getOrganizationAnalytics((int) $id, $params);
                $message = 'Notification analytics retrieved successfully (Admin View)';
            } else {
                // Organization users can only view their own analytics
                $organizationId = $this->getCurrentOrganization()?->id;
                if (!$organizationId) {
                    return $this->errorResponse('Organization not found', 404);
                }

                $analytics = $analyticsService->getOrganizationAnalytics($organizationId, $params);
                $message = 'Notification analytics retrieved successfully';
            }

            return $this->successResponse($message, $analytics);
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to retrieve notification analytics: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get platform notification analytics
     *
     * Super Admin: Gets platform-wide analytics
     * Organization Users: Not allowed (restricted)
     */
    public function getPlatformNotificationAnalytics(Request $request): JsonResponse
    {
        if (!$this->isSuperAdmin()) {
            return $this->errorResponse('Akses ditolak. Hanya admin yang dapat melihat analytics platform', 403);
        }

        try {
            $analyticsService = app(\App\Services\NotificationAnalyticsService::class);
            $params = $request->only(['date_from', 'date_to', 'group_by']);

            $analytics = $analyticsService->getPlatformAnalytics($params);

            return $this->successResponse('Platform notification analytics retrieved successfully', $analytics);
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to retrieve platform analytics: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Clear notification cache
     *
     * Super Admin: Can clear any organization's cache
     * Organization Users: Can clear their own organization's cache
     */
    public function clearNotificationCache(string $id = null): JsonResponse
    {
        try {
            $templateService = app(\App\Services\NotificationTemplateService::class);
            $analyticsService = app(\App\Services\NotificationAnalyticsService::class);

            if ($this->isSuperAdmin() && $id) {
                // Super admin can clear any organization's cache
                $organization = \App\Models\Organization::findOrFail($id);
                $templateService->clearTemplateCache(null, $organization);
                $analyticsService->clearAnalyticsCache($organization->id);
                $message = 'Notification cache cleared successfully (Admin View)';
            } else {
                // Organization users can only clear their own cache
                $organization = $this->getCurrentOrganization();
                if (!$organization) {
                    return $this->errorResponse('Organization not found', 404);
                }

                $templateService->clearTemplateCache(null, $organization);
                $analyticsService->clearAnalyticsCache($organization->id);
                $message = 'Notification cache cleared successfully';
            }

            return $this->successResponse($message);
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to clear notification cache: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Schedule notification for future delivery
     *
     * Super Admin: Can schedule notifications for any organization
     * Organization Users: Can schedule notifications for their own organization
     */
    public function scheduleNotification(Request $request, string $id): JsonResponse
    {
        try {
            $data = $request->validate([
                'type' => 'required|string|max:100',
                'title' => 'required|string|max:255',
                'message' => 'required|string',
                'scheduled_at' => 'required|date|after:now',
                'timezone' => 'string|max:50',
                'channels' => 'array|in:in_app,email,webhook,sms,push',
                'priority' => 'string|in:low,normal,high,urgent',
                'data' => 'array'
            ]);

            $schedulerService = app(\App\Services\NotificationSchedulerService::class);

            $result = $schedulerService->scheduleNotification(
                (int) $id,
                $data['type'],
                $data,
                \Carbon\Carbon::parse($data['scheduled_at']),
                $data['timezone'] ?? 'UTC'
            );

            if ($result['success']) {
                return $this->successResponse($result['message'], $result);
            } else {
                return $this->errorResponse($result['message'], 400);
            }
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to schedule notification: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get scheduled notifications
     *
     * Super Admin: Gets scheduled notifications for any organization
     * Organization Users: Gets scheduled notifications for their own organization
     */
    public function getScheduledNotifications(Request $request, string $id): JsonResponse
    {
        try {
            $params = $request->only(['type', 'date_from', 'date_to', 'limit', 'offset']);

            $schedulerService = app(\App\Services\NotificationSchedulerService::class);
            $notifications = $schedulerService->getScheduledNotifications((int) $id, $params);

            return $this->successResponse('Scheduled notifications retrieved successfully', $notifications);
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to retrieve scheduled notifications: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Cancel scheduled notification
     *
     * Super Admin: Can cancel any scheduled notification
     * Organization Users: Can cancel their own organization's scheduled notifications
     */
    public function cancelScheduledNotification(string $id, string $notificationId): JsonResponse
    {
        try {
            $schedulerService = app(\App\Services\NotificationSchedulerService::class);

            $success = $schedulerService->cancelScheduledNotification((int) $notificationId, (int) $id);

            if ($success) {
                return $this->successResponse('Scheduled notification cancelled successfully');
            } else {
                return $this->errorResponse('Scheduled notification not found or already processed', 404);
            }
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to cancel scheduled notification: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get notification preferences
     *
     * Super Admin: Gets preferences for any organization
     * Organization Users: Gets preferences for their own organization
     */
    public function getNotificationPreferences(string $id): JsonResponse
    {
        try {
            $preferencesService = app(\App\Services\NotificationPreferencesService::class);
            $preferences = $preferencesService->getOrganizationPreferences((int) $id);

            return $this->successResponse('Notification preferences retrieved successfully', $preferences);
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to retrieve notification preferences: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Update notification preferences
     *
     * Super Admin: Can update preferences for any organization
     * Organization Users: Can update preferences for their own organization
     */
    public function updateNotificationPreferences(Request $request, string $id): JsonResponse
    {
        try {
            $preferences = $request->validate([
                'channels' => 'array',
                'channels.*.enabled' => 'boolean',
                'channels.*.types' => 'array',
                'quiet_hours' => 'array',
                'quiet_hours.enabled' => 'boolean',
                'quiet_hours.start' => 'string',
                'quiet_hours.end' => 'string',
                'quiet_hours.timezone' => 'string',
                'rate_limiting' => 'array',
                'rate_limiting.enabled' => 'boolean',
                'rate_limiting.max_per_hour' => 'integer|min:1|max:1000',
                'rate_limiting.max_per_day' => 'integer|min:1|max:10000'
            ]);

            $preferencesService = app(\App\Services\NotificationPreferencesService::class);
            $updatedPreferences = $preferencesService->updateOrganizationPreferences((int) $id, $preferences);

            return $this->successResponse('Notification preferences updated successfully', $updatedPreferences);
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to update notification preferences: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Mark notification as read
     *
     * Super Admin: Can mark any notification as read
     * Organization Users: Can mark their own organization's notifications as read
     */
    public function markNotificationAsRead(Request $request, string $id, string $notificationId): JsonResponse
    {
        try {
            $notification = \App\Models\Notification::where('id', $notificationId)
                ->where('organization_id', $id)
                ->firstOrFail();

            $notification->update([
                'is_read' => true,
                'read_at' => now(),
                'user_agent' => $request->header('User-Agent'),
                'ip_address' => $request->ip()
            ]);

            return $this->successResponse('Notification marked as read successfully');
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to mark notification as read: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get browser notifications for organization
     *
     * Organization Users: Gets pending browser notifications
     */
    public function getBrowserNotifications(string $id): JsonResponse
    {
        try {
            $cacheKeys = \Illuminate\Support\Facades\Cache::getRedis()->keys("browser_notification_org_{$id}_notif_*");
            $notifications = [];

            foreach ($cacheKeys as $key) {
                $notification = \Illuminate\Support\Facades\Cache::get(str_replace(config('cache.prefix') . ':', '', $key));
                if ($notification) {
                    $notifications[] = $notification;
                    \Illuminate\Support\Facades\Cache::forget(str_replace(config('cache.prefix') . ':', '', $key));
                }
            }

            return $this->successResponse('Browser notifications retrieved successfully', $notifications);
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to retrieve browser notifications: ' . $e->getMessage(), 500);
        }
    }
}
