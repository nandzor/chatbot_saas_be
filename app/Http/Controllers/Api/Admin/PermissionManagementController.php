<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Resources\Admin\PermissionResource;
use App\Http\Resources\Admin\PermissionCollection;
use App\Services\Admin\PermissionManagementService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;

class PermissionManagementController extends BaseApiController
{
    protected PermissionManagementService $permissionService;

    public function __construct()
    {
        $this->permissionService = new PermissionManagementService();
    }

    /**
     * Get paginated list of permissions with filters and search.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $filters = $request->only([
                'search', 'resource', 'action', 'scope', 'is_system_permission', 'organization_id'
            ]);

            $permissions = $this->permissionService->getPaginatedPermissions(
                page: $request->get('page', 1),
                perPage: $request->get('per_page', 15),
                filters: $filters,
                sortBy: $request->get('sort_by', 'created_at'),
                sortOrder: $request->get('sort_order', 'desc')
            );

            return $this->successResponse(
                'Permissions retrieved successfully',
                new PermissionCollection($permissions)
            );
        } catch (\Exception $e) {
            Log::error('Permission management index error', [
                'error' => $e->getMessage(),
                'user_id' => Auth::id()
            ]);

            return $this->errorResponse(
                'Failed to retrieve permissions',
                ['error' => 'An unexpected error occurred'],
                500
            );
        }
    }

    /**
     * Get specific permission details.
     */
    public function show(string $permissionId): JsonResponse
    {
        try {
            $permission = $this->permissionService->getPermissionWithDetails($permissionId);

            if (!$permission) {
                return $this->errorResponse(
                    'Permission not found',
                    ['error' => 'The specified permission does not exist'],
                    404
                );
            }

            return $this->successResponse(
                'Permission details retrieved successfully',
                new PermissionResource($permission)
            );
        } catch (\Exception $e) {
            Log::error('Permission management show error', [
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
                'permission_id' => $permissionId
            ]);

            return $this->errorResponse(
                'Failed to retrieve permission details',
                ['error' => 'An unexpected error occurred'],
                500
            );
        }
    }

    /**
     * Create a new permission.
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'name' => 'required|string|max:100',
                'code' => 'required|string|max:100|unique:permissions,code',
                'display_name' => 'nullable|string|max:255',
                'description' => 'nullable|string',
                'resource' => 'required|string|in:users,agents,customers,chat_sessions,messages,knowledge_articles,knowledge_categories,bot_personalities,channel_configs,ai_models,workflows,analytics,billing,subscriptions,api_keys,webhooks,system_logs,organizations,roles,permissions',
                'action' => 'required|string|in:create,read,update,delete,execute,approve,publish,export,import,manage,view_all,view_own,edit_all,edit_own',
                'scope' => 'nullable|string|in:global,organization,department,team,personal',
                'category' => 'nullable|string|max:100',
                'group_name' => 'nullable|string|max:100',
                'is_dangerous' => 'boolean',
                'requires_approval' => 'boolean',
                'sort_order' => 'integer',
                'is_visible' => 'boolean',
            ]);

            $permissionData = $request->all();
            $permission = $this->permissionService->createPermission($permissionData, Auth::user());

            Log::info('Permission created by admin', [
                'admin_id' => Auth::id(),
                'new_permission_id' => $permission->id,
                'name' => $permission->name
            ]);

            return $this->successResponse(
                'Permission created successfully',
                new PermissionResource($permission),
                201
            );
        } catch (\Exception $e) {
            Log::error('Permission management store error', [
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
                'data' => $request->all()
            ]);

            return $this->errorResponse(
                'Failed to create permission',
                ['error' => 'An unexpected error occurred'],
                500
            );
        }
    }

    /**
     * Update permission information.
     */
    public function update(Request $request, string $permissionId): JsonResponse
    {
        try {
            $request->validate([
                'name' => 'sometimes|string|max:100',
                'display_name' => 'nullable|string|max:255',
                'description' => 'nullable|string',
                'category' => 'nullable|string|max:100',
                'group_name' => 'nullable|string|max:100',
                'is_dangerous' => 'boolean',
                'requires_approval' => 'boolean',
                'sort_order' => 'integer',
                'is_visible' => 'boolean',
            ]);

            $permissionData = $request->all();
            $permission = $this->permissionService->updatePermission($permissionId, $permissionData, Auth::user());

            if (!$permission) {
                return $this->errorResponse(
                    'Permission not found',
                    ['error' => 'The specified permission does not exist'],
                    404
                );
            }

            Log::info('Permission updated by admin', [
                'admin_id' => Auth::id(),
                'permission_id' => $permissionId,
                'updated_fields' => array_keys($permissionData)
            ]);

            return $this->successResponse(
                'Permission updated successfully',
                new PermissionResource($permission)
            );
        } catch (\Exception $e) {
            Log::error('Permission management update error', [
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
                'permission_id' => $permissionId
            ]);

            return $this->errorResponse(
                'Failed to update permission',
                ['error' => 'An unexpected error occurred'],
                500
            );
        }
    }

    /**
     * Delete permission.
     */
    public function destroy(string $permissionId): JsonResponse
    {
        try {
            $result = $this->permissionService->deletePermission($permissionId, Auth::user());

            if (!$result) {
                return $this->errorResponse(
                    'Permission not found',
                    ['error' => 'The specified permission does not exist'],
                    404
                );
            }

            Log::info('Permission deleted by admin', [
                'admin_id' => Auth::id(),
                'permission_id' => $permissionId
            ]);

            return $this->successResponse(
                'Permission deleted successfully',
                null
            );
        } catch (\Exception $e) {
            Log::error('Permission management destroy error', [
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
                'permission_id' => $permissionId
            ]);

            return $this->errorResponse(
                'Failed to delete permission',
                ['error' => 'An unexpected error occurred'],
                500
            );
        }
    }

    /**
     * Get permission statistics.
     */
    public function statistics(): JsonResponse
    {
        try {
            $stats = $this->permissionService->getPermissionStatistics();

            return $this->successResponse(
                'Permission statistics retrieved successfully',
                $stats
            );
        } catch (\Exception $e) {
            Log::error('Permission management statistics error', [
                'error' => $e->getMessage(),
                'user_id' => Auth::id()
            ]);

            return $this->errorResponse(
                'Failed to retrieve permission statistics',
                ['error' => 'An unexpected error occurred'],
                500
            );
        }
    }
}
