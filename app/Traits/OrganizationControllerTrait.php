<?php

namespace App\Traits;

use App\Services\OrganizationService;
use App\Services\ClientManagementService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

/**
 * Organization Controller Trait
 *
 * Provides common functionality for organization controllers
 * Implements DRY principle by centralizing common operations
 */
trait OrganizationControllerTrait
{
    protected OrganizationService $organizationService;
    protected ClientManagementService $clientManagementService;

    /**
     * Get appropriate service based on user role
     */
    protected function getServiceByRole(string $operation = 'read'): object
    {
        $isSuperAdmin = $this->isSuperAdmin();

        // For admin-only operations, always use ClientManagementService
        if (in_array($operation, ['create', 'delete', 'bulk_action', 'import', 'export_all'])) {
            return $this->clientManagementService;
        }

        // For read operations, use appropriate service based on role
        if ($isSuperAdmin) {
            return $this->clientManagementService;
        }

        return $this->organizationService;
    }

    /**
     * Handle organization list with role-based filtering
     */
    protected function handleOrganizationList(Request $request, array $filters = []): JsonResponse
    {
        try {
            $isSuperAdmin = $this->isSuperAdmin();

            if ($isSuperAdmin) {
                $result = $this->clientManagementService->getOrganizations($filters);
                $message = 'Daftar organisasi berhasil diambil (Admin View)';
            } else {
                $organizations = $this->organizationService->getAllOrganizations($request, $filters);
                $result = new \App\Http\Resources\OrganizationCollection($organizations);
                $message = 'Daftar organisasi berhasil diambil';
            }

            return $this->successResponse($message, $result);
        } catch (\Exception $e) {
            return $this->handleException($e, 'fetching organizations', $filters);
        }
    }

    /**
     * Handle organization details with role-based access
     */
    protected function handleOrganizationDetails(string $id): JsonResponse
    {
        try {
            $isSuperAdmin = $this->isSuperAdmin();

            if ($isSuperAdmin) {
                $organization = $this->clientManagementService->getOrganizationById($id);
                $message = 'Detail organisasi berhasil diambil (Admin View)';
            } else {
                $organization = $this->organizationService->getOrganizationById($id, [
                    'users', 'subscription', 'settings'
                ]);
                $organization = new \App\Http\Resources\OrganizationResource($organization);
                $message = 'Detail organisasi berhasil diambil';
            }

            if (!$organization) {
                return $this->errorResponse('Organisasi tidak ditemukan', 404);
            }

            return $this->successResponse($message, $organization);
        } catch (\Exception $e) {
            return $this->handleException($e, 'fetching organization', ['id' => $id]);
        }
    }

    /**
     * Handle organization creation (admin only)
     */
    protected function handleOrganizationCreation(array $data): JsonResponse
    {
        try {
            $organization = $this->organizationService->createOrganization($data);

            return $this->successResponse(
                'Organisasi berhasil dibuat',
                new \App\Http\Resources\OrganizationResource($organization),
                201
            );
        } catch (\Exception $e) {
            return $this->handleException($e, 'creating organization', $data);
        }
    }

    /**
     * Handle organization update with role-based access
     */
    protected function handleOrganizationUpdate(string $id, array $data): JsonResponse
    {
        try {
            $isSuperAdmin = $this->isSuperAdmin();
            $isOrganizationAdmin = request()->get('is_organization_admin', false);

            // Ensure organization admin can only update their own organization
            if (!$isSuperAdmin && $isOrganizationAdmin) {
                $userOrganizationId = request()->get('user_organization_id');
                if ($userOrganizationId != $id) {
                    return $this->errorResponse(
                        'Akses ditolak. Anda hanya dapat mengelola organisasi Anda sendiri',
                        403
                    );
                }
            }

            if ($isSuperAdmin) {
                $organization = $this->clientManagementService->updateOrganization($id, $data);
                $message = 'Organisasi berhasil diperbarui (Admin Update)';
            } else {
                $organization = $this->organizationService->updateOrganization($id, $data);
                $organization = new \App\Http\Resources\OrganizationResource($organization);
                $message = 'Organisasi berhasil diperbarui';
            }

            if (!$organization) {
                return $this->errorResponse('Organisasi tidak ditemukan', 404);
            }

            return $this->successResponse($message, $organization);
        } catch (\Exception $e) {
            return $this->handleException($e, 'updating organization', array_merge(['id' => $id], $data));
        }
    }

    /**
     * Handle organization deletion (admin only)
     */
    protected function handleOrganizationDeletion(string $id): JsonResponse
    {
        try {
            $success = $this->clientManagementService->deleteOrganization($id);

            if (!$success) {
                return $this->errorResponse('Organisasi tidak ditemukan', 404);
            }

            return $this->successResponse('Organisasi berhasil dihapus');
        } catch (\Exception $e) {
            return $this->handleException($e, 'deleting organization', ['id' => $id]);
        }
    }

    /**
     * Handle organization statistics with role-based data
     */
    protected function handleOrganizationStatistics(): JsonResponse
    {
        try {
            $isSuperAdmin = $this->isSuperAdmin();

            if ($isSuperAdmin) {
                $statistics = $this->clientManagementService->getStatistics();
                $message = 'Statistik platform berhasil diambil (Admin View)';
            } else {
                $statistics = $this->organizationService->getOrganizationStatistics();
                $message = 'Statistik organisasi berhasil diambil';
            }

            return $this->successResponse($message, $statistics);
        } catch (\Exception $e) {
            return $this->handleException($e, 'fetching statistics');
        }
    }

    /**
     * Handle organization search with role-based scope
     */
    protected function handleOrganizationSearch(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'query' => 'required|string|min:2',
                'filters' => 'array'
            ]);

            $params = $request->only(['filters', 'page', 'per_page', 'sort_by', 'sort_order']);
            $isSuperAdmin = $this->isSuperAdmin();

            if ($isSuperAdmin) {
                $result = $this->clientManagementService->searchOrganizations($request->input('query'), $params);
                $message = 'Pencarian organisasi berhasil (Admin Search)';
            } else {
                $result = $this->organizationService->searchOrganizations($request->input('query'), $params);
                $message = 'Pencarian organisasi berhasil';
            }

            return $this->successResponse($message, $result);
        } catch (\Exception $e) {
            return $this->handleException($e, 'searching organizations', $request->all());
        }
    }

    /**
     * Handle organization analytics with role-based scope
     */
    protected function handleOrganizationAnalytics(string $id, array $params = []): JsonResponse
    {
        try {
            $isSuperAdmin = $this->isSuperAdmin();

            if ($isSuperAdmin) {
                $analytics = $this->clientManagementService->getOrganizationAnalytics($id, $params);
                $message = 'Analytics organisasi berhasil diambil (Admin View)';
            } else {
                $analytics = $this->organizationService->getOrganizationAnalytics((int) $id, $params);
                $message = 'Analytics organisasi berhasil diambil';
            }

            return $this->successResponse($message, $analytics);
        } catch (\Exception $e) {
            return $this->handleException($e, 'fetching analytics', array_merge(['id' => $id], $params));
        }
    }

    /**
     * Handle all organizations analytics (special case for getAllOrganizationsAnalytics)
     */
    protected function handleAllOrganizationsAnalytics(array $params = []): JsonResponse
    {
        try {
            $isSuperAdmin = $this->isSuperAdmin();

            if ($isSuperAdmin) {
                $analytics = $this->clientManagementService->getStatistics();
                $message = 'Analytics platform berhasil diambil (Admin View)';
            } else {
                $analytics = $this->organizationService->getOrganizationStatistics();
                $message = 'Analytics organisasi berhasil diambil';
            }

            return $this->successResponse($message, $analytics);
        } catch (\Exception $e) {
            return $this->handleException($e, 'fetching all organizations analytics', $params);
        }
    }

    /**
     * Handle organization health check with role-based access
     */
    protected function handleOrganizationHealth(string $id): JsonResponse
    {
        try {
            $isSuperAdmin = $this->isSuperAdmin();

            if ($isSuperAdmin) {
                $health = $this->clientManagementService->getOrganizationHealth($id);
                $message = 'Status kesehatan organisasi berhasil diambil (Admin View)';
            } else {
                $health = $this->organizationService->getOrganizationHealth((int) $id);
                $message = 'Status kesehatan organisasi berhasil diambil';
            }

            return $this->successResponse($message, $health);
        } catch (\Exception $e) {
            return $this->handleException($e, 'fetching health status', ['id' => $id]);
        }
    }

    /**
     * Handle organization metrics with role-based access
     */
    protected function handleOrganizationMetrics(string $id, array $params = []): JsonResponse
    {
        try {
            $isSuperAdmin = $this->isSuperAdmin();

            if ($isSuperAdmin) {
                $metrics = $this->clientManagementService->getOrganizationMetrics($id, $params);
                $message = 'Metrics organisasi berhasil diambil (Admin View)';
            } else {
                $metrics = $this->organizationService->getOrganizationMetrics((int) $id, $params);
                $message = 'Metrics organisasi berhasil diambil';
            }

            return $this->successResponse($message, $metrics);
        } catch (\Exception $e) {
            return $this->handleException($e, 'fetching metrics', array_merge(['id' => $id], $params));
        }
    }

    /**
     * Handle organization export with role-based scope
     */
    protected function handleOrganizationExport(array $params): JsonResponse
    {
        try {
            $isSuperAdmin = $this->isSuperAdmin();

            if ($isSuperAdmin) {
                $exportData = $this->clientManagementService->exportOrganizations($params);
                $message = 'Export organisasi berhasil (Admin Export)';
            } else {
                $exportData = $this->organizationService->exportOrganizations($params);
                $message = 'Export organisasi berhasil';
            }

            return $this->successResponse($message, $exportData);
        } catch (\Exception $e) {
            return $this->handleException($e, 'exporting organizations', $params);
        }
    }

    /**
     * Handle organization import (admin only)
     */
    protected function handleOrganizationImport($file, array $mapping): JsonResponse
    {
        try {
            $isSuperAdmin = $this->isSuperAdmin();

            if ($isSuperAdmin) {
                $result = $this->clientManagementService->importOrganizations($file, $mapping);
            } else {
                $result = $this->organizationService->importOrganizations($file, $mapping);
            }

            return $this->successResponse('Import organisasi berhasil', $result);
        } catch (\Exception $e) {
            return $this->handleException($e, 'importing organizations', ['mapping' => $mapping]);
        }
    }

    /**
     * Handle bulk actions (admin only)
     */
    protected function handleBulkAction(string $action, array $organizationIds, array $options = []): JsonResponse
    {
        try {
            $isSuperAdmin = $this->isSuperAdmin();

            if ($isSuperAdmin) {
                $result = $this->clientManagementService->bulkAction($action, $organizationIds, $options);
            } else {
                $result = $this->organizationService->bulkAction($action, $organizationIds, $options);
            }

            return $this->successResponse('Bulk action berhasil dijalankan', $result);
        } catch (\Exception $e) {
            return $this->handleException($e, 'executing bulk action', [
                'action' => $action,
                'organization_ids' => $organizationIds,
                'options' => $options
            ]);
        }
    }

    /**
     * Handle organization users with role-based access
     */
    protected function handleOrganizationUsers(string $id): JsonResponse
    {
        try {
            $isSuperAdmin = $this->isSuperAdmin();
            $isOrganizationAdmin = request()->get('is_organization_admin', false);

            // Ensure organization admin can only access their own organization users
            if (!$isSuperAdmin && $isOrganizationAdmin) {
                $userOrganizationId = request()->get('user_organization_id');
                if ($userOrganizationId != $id) {
                    return $this->errorResponse(
                        'Akses ditolak. Anda hanya dapat mengakses user organisasi Anda sendiri',
                        403
                    );
                }
            }

            if ($isSuperAdmin) {
                $users = $this->clientManagementService->getOrganizationUsers($id);
                $message = 'Daftar user organisasi berhasil diambil (Admin View)';
            } else {
                $users = $this->organizationService->getOrganizationUsers($id);
                $message = 'Daftar user organisasi berhasil diambil';
            }

            return $this->successResponse($message, $users);
        } catch (\Exception $e) {
            return $this->handleException($e, 'fetching organization users', ['id' => $id]);
        }
    }

    /**
     * Handle organization activity logs with role-based access
     */
    protected function handleOrganizationActivityLogs(string $id, array $params = []): JsonResponse
    {
        try {
            $isSuperAdmin = $this->isSuperAdmin();

            if ($isSuperAdmin) {
                $logs = $this->clientManagementService->getOrganizationActivityLogs($id, $params);
                $message = 'Log aktivitas organisasi berhasil diambil (Admin View)';
            } else {
                $logs = $this->organizationService->getOrganizationActivityLogs((int) $id, $params);
                $message = 'Log aktivitas organisasi berhasil diambil';
            }

            return $this->successResponse($message, $logs);
        } catch (\Exception $e) {
            return $this->handleException($e, 'fetching activity logs', array_merge(['id' => $id], $params));
        }
    }

    /**
     * Handle organization settings with role-based access
     */
    protected function handleOrganizationSettings(int $organizationId, array $settings = null): JsonResponse
    {
        try {
            $isSuperAdmin = $this->isSuperAdmin();
            $isOrganizationAdmin = request()->get('is_organization_admin', false);

            // Ensure organization admin can only access their own organization settings
            if (!$isSuperAdmin && $isOrganizationAdmin) {
                $userOrganizationId = request()->get('user_organization_id');
                if ($userOrganizationId != $organizationId) {
                    return $this->errorResponse(
                        'Akses ditolak. Anda hanya dapat mengakses pengaturan organisasi Anda sendiri',
                        403
                    );
                }
            }

            if ($settings !== null) {
                // Save settings
                $result = $this->organizationService->saveOrganizationSettings($organizationId, $settings);
                $message = 'Pengaturan organisasi berhasil disimpan';
            } else {
                // Get settings
                $result = $this->organizationService->getOrganizationSettings($organizationId);
                $message = 'Pengaturan organisasi berhasil diambil';
            }

            return $this->successResponse($message, $result);
        } catch (\Exception $e) {
            return $this->handleException($e, 'handling organization settings', [
                'organization_id' => $organizationId,
                'settings' => $settings
            ]);
        }
    }

    /**
     * Handle organization settings by string ID (for compatibility)
     */
    protected function handleOrganizationSettingsById(string $organizationId, array $settings = null): JsonResponse
    {
        return $this->handleOrganizationSettings((int) $organizationId, $settings);
    }

    /**
     * Handle organization roles with role-based access
     */
    protected function handleOrganizationRoles(int $organizationId, array $roleData = null): JsonResponse
    {
        try {
            $isSuperAdmin = $this->isSuperAdmin();

            if ($roleData !== null) {
                // Save roles
                $result = $this->organizationService->saveAllPermissions($organizationId, $roleData);
                $message = 'Role organisasi berhasil disimpan';
            } else {
                // Get roles
                $result = $this->organizationService->getOrganizationRoles($organizationId);
                $message = 'Role organisasi berhasil diambil';
            }

            return $this->successResponse($message, $result);
        } catch (\Exception $e) {
            return $this->handleException($e, 'handling organization roles', [
                'organization_id' => $organizationId,
                'role_data' => $roleData
            ]);
        }
    }

    /**
     * Handle organization roles by string ID (for compatibility)
     */
    protected function handleOrganizationRolesById(string $organizationId, array $roleData = null): JsonResponse
    {
        return $this->handleOrganizationRoles((int) $organizationId, $roleData);
    }

    /**
     * Handle webhook testing with role-based access
     */
    protected function handleWebhookTest(int $organizationId, string $webhookUrl): JsonResponse
    {
        try {
            $result = $this->organizationService->testWebhook($organizationId, $webhookUrl);

            return $this->successResponse('Test webhook berhasil', $result);
        } catch (\Exception $e) {
            return $this->handleException($e, 'testing webhook', [
                'organization_id' => $organizationId,
                'webhook_url' => $webhookUrl
            ]);
        }
    }

    /**
     * Handle webhook testing by string ID (for compatibility)
     */
    protected function handleWebhookTestById(string $organizationId, string $webhookUrl): JsonResponse
    {
        return $this->handleWebhookTest((int) $organizationId, $webhookUrl);
    }

    /**
     * Handle deleted organizations (admin only)
     */
    protected function handleDeletedOrganizations(array $params = []): JsonResponse
    {
        try {
            $isSuperAdmin = $this->isSuperAdmin();

            if ($isSuperAdmin) {
                $result = $this->clientManagementService->getDeletedOrganizations($params);
            } else {
                $result = $this->organizationService->getDeletedOrganizations($params);
            }

            return $this->successResponse('Daftar organisasi yang dihapus berhasil diambil', $result);
        } catch (\Exception $e) {
            return $this->handleException($e, 'fetching deleted organizations', $params);
        }
    }

    /**
     * Handle organization restore (admin only)
     */
    protected function handleOrganizationRestore(string $id): JsonResponse
    {
        try {
            $isSuperAdmin = $this->isSuperAdmin();

            if ($isSuperAdmin) {
                $result = $this->clientManagementService->restoreOrganization($id);
            } else {
                $result = $this->organizationService->restoreOrganization($id);
            }

            if (!$result) {
                return $this->errorResponse('Organisasi tidak ditemukan atau tidak dapat di-restore', 404);
            }

            return $this->successResponse('Organisasi berhasil di-restore', $result);
        } catch (\Exception $e) {
            return $this->handleException($e, 'restoring organization', ['id' => $id]);
        }
    }

    /**
     * Handle send notification
     */
    protected function handleSendNotification(string $organizationId, string $type, array $data = []): JsonResponse
    {
        try {
            $isSuperAdmin = $this->isSuperAdmin();

            if ($isSuperAdmin) {
                $result = $this->clientManagementService->sendNotification((int) $organizationId, $type, $data);
            } else {
                $result = $this->organizationService->sendNotification((int) $organizationId, $type, $data);
            }

            if (!$result['success']) {
                return $this->errorResponse($result['message'], 400);
            }

            return $this->successResponse('Notifikasi berhasil dikirim', $result);
        } catch (\Exception $e) {
            return $this->handleException($e, 'sending notification', [
                'organization_id' => $organizationId,
                'type' => $type,
                'data' => $data
            ]);
        }
    }

    /**
     * Handle get notifications
     */
    protected function handleGetNotifications(string $organizationId, array $params = []): JsonResponse
    {
        try {
            $isSuperAdmin = $this->isSuperAdmin();

            if ($isSuperAdmin) {
                $result = $this->clientManagementService->getNotifications((int) $organizationId, $params);
            } else {
                $result = $this->organizationService->getNotifications((int) $organizationId, $params);
            }

            return $this->successResponse('Daftar notifikasi berhasil diambil', $result);
        } catch (\Exception $e) {
            return $this->handleException($e, 'fetching notifications', [
                'organization_id' => $organizationId,
                'params' => $params
            ]);
        }
    }

    /**
     * Handle mark notification as read
     */
    protected function handleMarkNotificationRead(string $organizationId, string $notificationId): JsonResponse
    {
        try {
            $isSuperAdmin = $this->isSuperAdmin();

            if ($isSuperAdmin) {
                $result = $this->clientManagementService->markNotificationRead((int) $organizationId, (int) $notificationId);
            } else {
                $result = $this->organizationService->markNotificationRead((int) $organizationId, (int) $notificationId);
            }

            if (!$result) {
                return $this->errorResponse('Notifikasi tidak ditemukan atau tidak dapat di-mark as read', 404);
            }

            return $this->successResponse('Notifikasi berhasil di-mark as read', $result);
        } catch (\Exception $e) {
            return $this->handleException($e, 'marking notification as read', [
                'organization_id' => $organizationId,
                'notification_id' => $notificationId
            ]);
        }
    }

    /**
     * Handle mark all notifications as read
     */
    protected function handleMarkAllNotificationsRead(string $organizationId): JsonResponse
    {
        try {
            $isSuperAdmin = $this->isSuperAdmin();

            if ($isSuperAdmin) {
                $result = $this->clientManagementService->markAllNotificationsRead((int) $organizationId);
            } else {
                $result = $this->organizationService->markAllNotificationsRead((int) $organizationId);
            }

            if (!$result) {
                return $this->errorResponse('Gagal menandai semua notifikasi sebagai dibaca', 400);
            }

            return $this->successResponse('Semua notifikasi berhasil di-mark as read', $result);
        } catch (\Exception $e) {
            return $this->handleException($e, 'marking all notifications as read', [
                'organization_id' => $organizationId
            ]);
        }
    }

    /**
     * Handle delete notification
     */
    protected function handleDeleteNotification(string $organizationId, string $notificationId): JsonResponse
    {
        try {
            $isSuperAdmin = $this->isSuperAdmin();

            if ($isSuperAdmin) {
                $result = $this->clientManagementService->deleteNotification((int) $organizationId, (int) $notificationId);
            } else {
                $result = $this->organizationService->deleteNotification((int) $organizationId, (int) $notificationId);
            }

            if (!$result) {
                return $this->errorResponse('Notifikasi tidak ditemukan atau tidak dapat dihapus', 404);
            }

            return $this->successResponse('Notifikasi berhasil dihapus', $result);
        } catch (\Exception $e) {
            return $this->handleException($e, 'deleting notification', [
                'organization_id' => $organizationId,
                'notification_id' => $notificationId
            ]);
        }
    }

    /**
     * Handle get audit logs
     */
    protected function handleGetAuditLogs(string $organizationId, array $params = []): JsonResponse
    {
        try {
            $isSuperAdmin = $this->isSuperAdmin();

            if ($isSuperAdmin) {
                $result = $this->clientManagementService->getAuditLogs((int) $organizationId, $params);
            } else {
                $result = $this->organizationService->getAuditLogs((int) $organizationId, $params);
            }

            return $this->successResponse('Daftar audit logs berhasil diambil', $result);
        } catch (\Exception $e) {
            return $this->handleException($e, 'fetching audit logs', [
                'organization_id' => $organizationId,
                'params' => $params
            ]);
        }
    }

    /**
     * Handle create audit log
     */
    protected function handleCreateAuditLog(string $organizationId, string $action, array $data = []): JsonResponse
    {
        try {
            $isSuperAdmin = $this->isSuperAdmin();

            if ($isSuperAdmin) {
                $result = $this->clientManagementService->createAuditLog((int) $organizationId, $action, $data);
            } else {
                $result = $this->organizationService->createAuditLog((int) $organizationId, $action, $data);
            }

            if (!$result) {
                return $this->errorResponse('Gagal membuat audit log', 400);
            }

            return $this->successResponse('Audit log berhasil dibuat', $result);
        } catch (\Exception $e) {
            return $this->handleException($e, 'creating audit log', [
                'organization_id' => $organizationId,
                'action' => $action,
                'data' => $data
            ]);
        }
    }

    /**
     * Handle get system logs
     */
    protected function handleGetSystemLogs(string $organizationId, array $params = []): JsonResponse
    {
        try {
            $isSuperAdmin = $this->isSuperAdmin();

            if ($isSuperAdmin) {
                $result = $this->clientManagementService->getSystemLogs((int) $organizationId, $params);
            } else {
                $result = $this->organizationService->getSystemLogs((int) $organizationId, $params);
            }

            return $this->successResponse('Daftar system logs berhasil diambil', $result);
        } catch (\Exception $e) {
            return $this->handleException($e, 'fetching system logs', [
                'organization_id' => $organizationId,
                'params' => $params
            ]);
        }
    }

    /**
     * Handle create system log
     */
    protected function handleCreateSystemLog(string $organizationId, string $level, string $message, array $data = []): JsonResponse
    {
        try {
            $isSuperAdmin = $this->isSuperAdmin();

            if ($isSuperAdmin) {
                $result = $this->clientManagementService->createSystemLog((int) $organizationId, $level, $message, $data);
            } else {
                $result = $this->organizationService->createSystemLog((int) $organizationId, $level, $message, $data);
            }

            if (!$result) {
                return $this->errorResponse('Gagal membuat system log', 400);
            }

            return $this->successResponse('System log berhasil dibuat', $result);
        } catch (\Exception $e) {
            return $this->handleException($e, 'creating system log', [
                'organization_id' => $organizationId,
                'level' => $level,
                'message' => $message,
                'data' => $data
            ]);
        }
    }

    /**
     * Handle get backup status
     */
    protected function handleGetBackupStatus(string $organizationId): JsonResponse
    {
        try {
            $isSuperAdmin = $this->isSuperAdmin();

            if ($isSuperAdmin) {
                $result = $this->clientManagementService->getBackupStatus((int) $organizationId);
            } else {
                $result = $this->organizationService->getBackupStatus((int) $organizationId);
            }

            return $this->successResponse('Status backup berhasil diambil', $result);
        } catch (\Exception $e) {
            return $this->handleException($e, 'fetching backup status', [
                'organization_id' => $organizationId
            ]);
        }
    }

    /**
     * Handle create backup
     */
    protected function handleCreateBackup(string $organizationId): JsonResponse
    {
        try {
            $isSuperAdmin = $this->isSuperAdmin();

            if ($isSuperAdmin) {
                $result = $this->clientManagementService->createBackup((int) $organizationId);
            } else {
                $result = $this->organizationService->createBackup((int) $organizationId);
            }

            if (!$result['success']) {
                return $this->errorResponse($result['message'], 400);
            }

            return $this->successResponse('Backup berhasil dibuat', $result);
        } catch (\Exception $e) {
            return $this->handleException($e, 'creating backup', [
                'organization_id' => $organizationId
            ]);
        }
    }

    /**
     * Handle organization soft delete (admin only)
     */
    protected function handleOrganizationSoftDelete(string $id): JsonResponse
    {
        try {
            $result = $this->clientManagementService->softDeleteOrganization($id);

            if (!$result) {
                return $this->errorResponse('Organisasi tidak ditemukan atau tidak dapat dihapus', 404);
            }

            return $this->successResponse('Organisasi berhasil dihapus sementara', $result);
        } catch (\Exception $e) {
            return $this->handleException($e, 'soft deleting organization', ['id' => $id]);
        }
    }

    /**
     * Handle organization status update (admin only)
     */
    protected function handleOrganizationStatusUpdate(string $id, string $status): JsonResponse
    {
        try {
            $organization = $this->clientManagementService->updateOrganizationStatus($id, $status);

            if (!$organization) {
                return $this->errorResponse('Organisasi tidak ditemukan', 404);
            }

            return $this->successResponse('Status organisasi berhasil diperbarui', $organization);
        } catch (\Exception $e) {
            return $this->handleException($e, 'updating organization status', [
                'id' => $id,
                'status' => $status
            ]);
        }
    }

    /**
     * Handle cache operations (admin only)
     */
    protected function handleCacheOperations(string $organizationId = null): JsonResponse
    {
        try {
            if ($organizationId) {
                $this->clientManagementService->clearOrganizationCache($organizationId);
                $message = 'Cache organisasi berhasil dihapus';
                $data = ['organization_id' => $organizationId];
            } else {
                $this->clientManagementService->clearAllCaches();
                $message = 'Semua cache berhasil dihapus';
                $data = ['cleared_at' => now()->toISOString()];
            }

            return $this->successResponse($message, $data);
        } catch (\Exception $e) {
            return $this->handleException($e, 'clearing cache', ['organization_id' => $organizationId]);
        }
    }

    /**
     * Centralized exception handling
     */
    protected function handleException(\Exception $e, string $operation, array $context = []): JsonResponse
    {
        Log::error("Error {$operation}", array_merge([
            'error' => $e->getMessage(),
            'user_id' => \Illuminate\Support\Facades\Auth::check() ? \Illuminate\Support\Facades\Auth::id() : 'unknown',
            'is_super_admin' => $this->isSuperAdmin()
        ], $context));

        return $this->errorResponse(
            "Gagal {$operation}",
            500
        );
    }

    /**
     * Check if user is super admin
     */
    protected function isSuperAdmin(): bool
    {
        $user = $this->getCurrentUser();
        return $user && $user instanceof \App\Models\User && $user->hasRole('super_admin');
    }

    /**
     * Check if user is organization admin
     */
    protected function isOrganizationAdmin(): bool
    {
        return request()->get('is_organization_admin', false);
    }

    /**
     * Check if user is organization member
     */
    protected function isOrganizationMember(): bool
    {
        return request()->get('is_organization_member', false);
    }

    /**
     * Get user role
     */
    protected function getUserRole(): string
    {
        return request()->get('user_role', 'unknown');
    }
}
