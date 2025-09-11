<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\ClientManagement\BulkActionRequest;
use App\Http\Requests\ClientManagement\ImportOrganizationsRequest;
use App\Http\Requests\ClientManagement\ExportOrganizationsRequest;
use App\Services\ClientManagementService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

/**
 * ClientManagementController - Dedicated Admin Controller
 *
 * This controller is exclusively for super admin operations:
 * - Platform-wide organization management
 * - Advanced admin features
 * - Bulk operations
 * - System monitoring and analytics
 *
 * @package App\Http\Controllers\Api\V1
 */
class ClientManagementController extends BaseApiController
{
    protected ClientManagementService $clientManagementService;

    public function __construct(ClientManagementService $clientManagementService)
    {
        parent::__construct();
        $this->clientManagementService = $clientManagementService;
    }

    /**
     * Get all organizations with advanced filtering (Admin only)
     *
     * This endpoint provides comprehensive organization management for super admins
     * with advanced filtering, sorting, and pagination capabilities.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $params = $request->only([
                'search', 'status', 'business_type', 'industry', 'company_size',
                'plan_id', 'subscription_status', 'date_from', 'date_to',
                'sort_by', 'sort_order', 'page', 'per_page'
            ]);

            $result = $this->clientManagementService->getOrganizations($params);

            return $this->successResponse(
                'Daftar organisasi berhasil diambil (Admin View)',
                $result
            );
        } catch (\Exception $e) {
            Log::error('Error fetching organizations in ClientManagement', [
                'error' => $e->getMessage(),
                'user_id' => $this->getCurrentUser()?->id ?? 'unknown',
                'params' => $params ?? []
            ]);

            return $this->errorResponse(
                'Gagal mengambil daftar organisasi',
                500
            );
        }
    }

    /**
     * Get organization details (Admin only)
     *
     * Provides detailed organization information including:
     * - Organization data
     * - User statistics
     * - Activity metrics
     * - Health status
     */
    public function show(string $id): JsonResponse
    {
        try {
            $organization = $this->clientManagementService->getOrganizationById($id);

            if (!$organization) {
                return $this->errorResponse('Organisasi tidak ditemukan', 404);
            }

            return $this->successResponse(
                'Detail organisasi berhasil diambil (Admin View)',
                $organization
            );
        } catch (\Exception $e) {
            Log::error('Error fetching organization in ClientManagement', [
                'organization_id' => $id,
                'error' => $e->getMessage(),
                'user_id' => $this->getCurrentUser()?->id ?? 'unknown'
            ]);

            return $this->errorResponse(
                'Gagal mengambil detail organisasi',
                500
            );
        }
    }

    /**
     * Create new organization (Admin only)
     *
     * Creates a new organization with full admin privileges
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'name' => 'required|string|max:255',
                'display_name' => 'nullable|string|max:255',
                'email' => 'required|email|unique:organizations,email',
                'business_type' => 'required|string',
                'industry' => 'required|string',
                'company_size' => 'required|string',
                'status' => 'nullable|in:active,trial,suspended,inactive',
                'subscription_status' => 'nullable|in:active,trial,expired,suspended'
            ]);

            $organization = $this->clientManagementService->createOrganization($request->all());

            return $this->successResponse(
                'Organisasi berhasil dibuat (Admin Create)',
                $organization,
                201
            );
        } catch (\Exception $e) {
            Log::error('Error creating organization in ClientManagement', [
                'error' => $e->getMessage(),
                'user_id' => $this->getCurrentUser()?->id ?? 'unknown',
                'data' => $request->all()
            ]);

            return $this->errorResponse(
                'Gagal membuat organisasi',
                500
            );
        }
    }

    /**
     * Update organization (Admin only)
     *
     * Updates organization with full admin privileges
     */
    public function update(Request $request, string $id): JsonResponse
    {
        try {
            $request->validate([
                'name' => 'sometimes|string|max:255',
                'display_name' => 'nullable|string|max:255',
                'email' => 'sometimes|email|unique:organizations,email,' . $id,
                'business_type' => 'sometimes|string',
                'industry' => 'sometimes|string',
                'company_size' => 'sometimes|string',
                'status' => 'sometimes|in:active,trial,suspended,inactive',
                'subscription_status' => 'sometimes|in:active,trial,expired,suspended'
            ]);

            $organization = $this->clientManagementService->updateOrganization($id, $request->all());

            if (!$organization) {
                return $this->errorResponse('Organisasi tidak ditemukan', 404);
            }

            return $this->successResponse(
                'Organisasi berhasil diperbarui (Admin Update)',
                $organization
            );
        } catch (\Exception $e) {
            Log::error('Error updating organization in ClientManagement', [
                'organization_id' => $id,
                'error' => $e->getMessage(),
                'user_id' => $this->getCurrentUser()?->id ?? 'unknown',
                'data' => $request->all()
            ]);

            return $this->errorResponse(
                'Gagal memperbarui organisasi',
                500
            );
        }
    }

    /**
     * Delete organization (Admin only)
     *
     * Permanently deletes organization from the system
     */
    public function destroy(string $id): JsonResponse
    {
        try {
            $success = $this->clientManagementService->deleteOrganization($id);

            if (!$success) {
                return $this->errorResponse('Organisasi tidak ditemukan', 404);
            }

            return $this->successResponse('Organisasi berhasil dihapus (Admin Delete)');
        } catch (\Exception $e) {
            Log::error('Error deleting organization in ClientManagement', [
                'organization_id' => $id,
                'error' => $e->getMessage(),
                'user_id' => $this->getCurrentUser()?->id ?? 'unknown'
            ]);

            return $this->errorResponse(
                'Gagal menghapus organisasi',
                500
            );
        }
    }

    /**
     * Soft delete organization (Admin only)
     *
     * Soft deletes organization for potential recovery
     */
    public function softDelete(string $id): JsonResponse
    {
        try {
            $result = $this->clientManagementService->softDeleteOrganization($id);

            if (!$result) {
                return $this->errorResponse('Organisasi tidak ditemukan atau tidak dapat dihapus', 404);
            }

            return $this->successResponse(
                'Organisasi berhasil dihapus sementara (Admin Soft Delete)',
                $result
            );
        } catch (\Exception $e) {
            Log::error('Error soft deleting organization in ClientManagement', [
                'organization_id' => $id,
                'error' => $e->getMessage(),
                'user_id' => $this->getCurrentUser()?->id ?? 'unknown'
            ]);

            return $this->errorResponse(
                'Gagal menghapus organisasi sementara',
                500
            );
        }
    }

    /**
     * Restore soft deleted organization (Admin only)
     *
     * Restores previously soft deleted organization
     */
    public function restore(string $id): JsonResponse
    {
        try {
            $result = $this->clientManagementService->restoreOrganization($id);

            if (!$result) {
                return $this->errorResponse('Organisasi tidak ditemukan atau tidak dapat di-restore', 404);
            }

            return $this->successResponse(
                'Organisasi berhasil di-restore (Admin Restore)',
                $result
            );
        } catch (\Exception $e) {
            Log::error('Error restoring organization in ClientManagement', [
                'organization_id' => $id,
                'error' => $e->getMessage(),
                'user_id' => $this->getCurrentUser()?->id ?? 'unknown'
            ]);

            return $this->errorResponse(
                'Gagal restore organisasi',
                500
            );
        }
    }

    /**
     * Update organization status (Admin only)
     *
     * Updates organization status with admin privileges
     */
    public function updateStatus(Request $request, string $id): JsonResponse
    {
        try {
            $request->validate([
                'status' => 'required|in:active,trial,suspended,inactive'
            ]);

            $organization = $this->clientManagementService->updateOrganizationStatus($id, $request->status);

            if (!$organization) {
                return $this->errorResponse('Organisasi tidak ditemukan', 404);
            }

            return $this->successResponse(
                'Status organisasi berhasil diperbarui (Admin Update)',
                $organization
            );
        } catch (\Exception $e) {
            Log::error('Error updating organization status in ClientManagement', [
                'organization_id' => $id,
                'status' => $request->status,
                'error' => $e->getMessage(),
                'user_id' => $this->getCurrentUser()?->id ?? 'unknown'
            ]);

            return $this->errorResponse(
                'Gagal memperbarui status organisasi',
                500
            );
        }
    }

    /**
     * Bulk actions on organizations (Admin only)
     *
     * Performs bulk operations on multiple organizations:
     * - Bulk status update
     * - Bulk delete
     * - Bulk export
     * - Bulk notification
     */
    public function bulkAction(BulkActionRequest $request): JsonResponse
    {
        try {
            $result = $this->clientManagementService->bulkAction(
                $request->action,
                $request->organization_ids,
                $request->options ?? []
            );

            return $this->successResponse(
                'Bulk action berhasil dijalankan (Admin Bulk Action)',
                $result
            );
        } catch (\Exception $e) {
            Log::error('Error executing bulk action in ClientManagement', [
                'action' => $request->action,
                'organization_ids' => $request->organization_ids,
                'error' => $e->getMessage(),
                'user_id' => $this->getCurrentUser()?->id ?? 'unknown'
            ]);

            return $this->errorResponse(
                'Gagal menjalankan bulk action',
                500
            );
        }
    }

    /**
     * Search organizations (Admin only)
     *
     * Advanced search across all organizations with:
     * - Full-text search
     * - Filtering capabilities
     * - Sorting options
     */
    public function search(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'query' => 'required|string|min:2',
                'filters' => 'array'
            ]);

            $params = $request->only(['filters', 'page', 'per_page', 'sort_by', 'sort_order']);

            $result = $this->clientManagementService->searchOrganizations($request->input('query'), $params);

            return $this->successResponse(
                'Pencarian organisasi berhasil (Admin Search)',
                $result
            );
        } catch (\Exception $e) {
            Log::error('Error searching organizations in ClientManagement', [
                'query' => $request->query,
                'filters' => $request->filters,
                'error' => $e->getMessage(),
                'user_id' => $this->getCurrentUser()?->id ?? 'unknown'
            ]);

            return $this->errorResponse(
                'Gagal melakukan pencarian organisasi',
                500
            );
        }
    }

    /**
     * Get platform statistics (Admin only)
     *
     * Provides comprehensive platform-wide statistics:
     * - Total organizations
     * - Active organizations
     * - User statistics
     * - Revenue metrics
     * - Growth trends
     */
    public function statistics(): JsonResponse
    {
        try {
            $statistics = $this->clientManagementService->getStatistics();

            return $this->successResponse(
                'Statistik platform berhasil diambil (Admin Statistics)',
                $statistics
            );
        } catch (\Exception $e) {
            Log::error('Error fetching platform statistics in ClientManagement', [
                'error' => $e->getMessage(),
                'user_id' => $this->getCurrentUser()?->id ?? 'unknown'
            ]);

            return $this->errorResponse(
                'Gagal mengambil statistik platform',
                500
            );
        }
    }

    /**
     * Get organization health status (Admin only)
     *
     * Provides detailed health analysis for organization:
     * - Health score
     * - Performance metrics
     * - Issue detection
     * - Recommendations
     */
    public function health(string $id): JsonResponse
    {
        try {
            $health = $this->clientManagementService->getOrganizationHealth($id);

            return $this->successResponse(
                'Status kesehatan organisasi berhasil diambil (Admin Health)',
                $health
            );
        } catch (\Exception $e) {
            Log::error('Error fetching organization health in ClientManagement', [
                'organization_id' => $id,
                'error' => $e->getMessage(),
                'user_id' => $this->getCurrentUser()?->id ?? 'unknown'
            ]);

            return $this->errorResponse(
                'Gagal mengambil status kesehatan organisasi',
                500
            );
        }
    }

    /**
     * Get organization analytics (Admin only)
     *
     * Provides detailed analytics for organization:
     * - User growth
     * - Activity metrics
     * - Performance data
     * - Trend analysis
     */
    public function analytics(string $id, Request $request): JsonResponse
    {
        try {
            $params = $request->only([
                'time_range', 'date_from', 'date_to', 'group_by'
            ]);

            $analytics = $this->clientManagementService->getOrganizationAnalytics($id, $params);

            return $this->successResponse(
                'Analytics organisasi berhasil diambil (Admin Analytics)',
                $analytics
            );
        } catch (\Exception $e) {
            Log::error('Error fetching organization analytics in ClientManagement', [
                'organization_id' => $id,
                'params' => $params,
                'error' => $e->getMessage(),
                'user_id' => $this->getCurrentUser()?->id ?? 'unknown'
            ]);

            return $this->errorResponse(
                'Gagal mengambil analytics organisasi',
                500
            );
        }
    }

    /**
     * Get organization metrics (Admin only)
     *
     * Provides detailed metrics for organization:
     * - Performance metrics
     * - Usage statistics
     * - Resource utilization
     * - Cost analysis
     */
    public function metrics(string $id, Request $request): JsonResponse
    {
        try {
            $params = $request->only([
                'time_range', 'date_from', 'date_to', 'group_by'
            ]);

            $metrics = $this->clientManagementService->getOrganizationMetrics($id, $params);

            return $this->successResponse(
                'Metrics organisasi berhasil diambil (Admin Metrics)',
                $metrics
            );
        } catch (\Exception $e) {
            Log::error('Error fetching organization metrics in ClientManagement', [
                'organization_id' => $id,
                'params' => $params,
                'error' => $e->getMessage(),
                'user_id' => $this->getCurrentUser()?->id ?? 'unknown'
            ]);

            return $this->errorResponse(
                'Gagal mengambil metrics organisasi',
                500
            );
        }
    }

    /**
     * Get deleted organizations (Admin only)
     *
     * Lists all soft-deleted organizations for potential recovery
     */
    public function deleted(Request $request): JsonResponse
    {
        try {
            $params = $request->only([
                'date_from', 'date_to', 'deleted_by', 'page', 'per_page'
            ]);

            $result = $this->clientManagementService->getDeletedOrganizations($params);

            return $this->successResponse(
                'Daftar organisasi yang dihapus berhasil diambil (Admin Deleted)',
                $result
            );
        } catch (\Exception $e) {
            Log::error('Error fetching deleted organizations in ClientManagement', [
                'params' => $params,
                'error' => $e->getMessage(),
                'user_id' => $this->getCurrentUser()?->id ?? 'unknown'
            ]);

            return $this->errorResponse(
                'Gagal mengambil daftar organisasi yang dihapus',
                500
            );
        }
    }

    /**
     * Export organizations (Admin only)
     *
     * Exports organization data in various formats:
     * - CSV
     * - Excel
     * - JSON
     */
    public function export(ExportOrganizationsRequest $request): JsonResponse
    {
        try {
            $params = $request->only([
                'format', 'filters', 'columns'
            ]);

            $exportData = $this->clientManagementService->exportOrganizations($params);

            return $this->successResponse(
                'Export organisasi berhasil (Admin Export)',
                $exportData
            );
        } catch (\Exception $e) {
            Log::error('Error exporting organizations in ClientManagement', [
                'params' => $params,
                'error' => $e->getMessage(),
                'user_id' => $this->getCurrentUser()?->id ?? 'unknown'
            ]);

            return $this->errorResponse(
                'Gagal melakukan export organisasi',
                500
            );
        }
    }

    /**
     * Import organizations (Admin only)
     *
     * Imports organization data from various formats:
     * - CSV
     * - Excel
     * - JSON
     */
    public function import(ImportOrganizationsRequest $request): JsonResponse
    {
        try {
            $result = $this->clientManagementService->importOrganizations(
                $request->file('file'),
                $request->input('mapping')
            );

            return $this->successResponse(
                'Import organisasi berhasil (Admin Import)',
                $result
            );
        } catch (\Exception $e) {
            Log::error('Error importing organizations in ClientManagement', [
                'file' => $request->file('file')?->getClientOriginalName(),
                'mapping' => $request->input('mapping'),
                'error' => $e->getMessage(),
                'user_id' => $this->getCurrentUser()?->id ?? 'unknown'
            ]);

            return $this->errorResponse(
                'Gagal melakukan import organisasi',
                500
            );
        }
    }

    /**
     * Get organization users (Admin only)
     *
     * Lists all users within an organization
     */
    public function users(string $id): JsonResponse
    {
        try {
            $users = $this->clientManagementService->getOrganizationUsers($id);

            return $this->successResponse(
                'Daftar user organisasi berhasil diambil (Admin Users)',
                $users
            );
        } catch (\Exception $e) {
            Log::error('Error fetching organization users in ClientManagement', [
                'organization_id' => $id,
                'error' => $e->getMessage(),
                'user_id' => $this->getCurrentUser()?->id ?? 'unknown'
            ]);

            return $this->errorResponse(
                'Gagal mengambil daftar user organisasi',
                500
            );
        }
    }

    /**
     * Get organization activity logs (Admin only)
     *
     * Lists all activity logs for an organization
     */
    public function activityLogs(string $id, Request $request): JsonResponse
    {
        try {
            $params = $request->only([
                'date_from', 'date_to', 'action', 'user_id',
                'page', 'per_page', 'sort_by', 'sort_order'
            ]);

            $result = $this->clientManagementService->getOrganizationActivityLogs($id, $params);

            return $this->successResponse(
                'Log aktivitas organisasi berhasil diambil (Admin Activity Logs)',
                $result
            );
        } catch (\Exception $e) {
            Log::error('Error fetching organization activity logs in ClientManagement', [
                'organization_id' => $id,
                'params' => $params,
                'error' => $e->getMessage(),
                'user_id' => $this->getCurrentUser()?->id ?? 'unknown'
            ]);

            return $this->errorResponse(
                'Gagal mengambil log aktivitas organisasi',
                500
            );
        }
    }

    /**
     * Clear organization cache (Admin only)
     *
     * Clears cached data for specific organization
     */
    public function clearCache(string $id): JsonResponse
    {
        try {
            $this->clientManagementService->clearOrganizationCache($id);

            return $this->successResponse(
                'Cache organisasi berhasil dihapus (Admin Cache Clear)',
                ['organization_id' => $id]
            );
        } catch (\Exception $e) {
            Log::error('Error clearing organization cache in ClientManagement', [
                'organization_id' => $id,
                'error' => $e->getMessage(),
                'user_id' => $this->getCurrentUser()?->id ?? 'unknown'
            ]);

            return $this->errorResponse(
                'Gagal menghapus cache organisasi',
                500
            );
        }
    }

    /**
     * Clear all caches (Admin only)
     *
     * Clears all cached data across the platform
     */
    public function clearAllCaches(): JsonResponse
    {
        try {
            $this->clientManagementService->clearAllCaches();

            return $this->successResponse(
                'Semua cache berhasil dihapus (Admin Cache Clear All)',
                ['cleared_at' => now()->toISOString()]
            );
        } catch (\Exception $e) {
            Log::error('Error clearing all caches in ClientManagement', [
                'error' => $e->getMessage(),
                'user_id' => $this->getCurrentUser()?->id ?? 'unknown'
            ]);

            return $this->errorResponse(
                'Gagal menghapus semua cache',
                500
            );
        }
    }
}
