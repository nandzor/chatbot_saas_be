<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\Admin\CreateRoleRequest;
use App\Http\Requests\Admin\UpdateRoleRequest;
use App\Http\Resources\Admin\RoleResource;
use App\Http\Resources\Admin\RoleCollection;
use App\Services\Admin\RoleManagementService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;

class RoleManagementController extends BaseApiController
{
    protected RoleManagementService $roleService;

    public function __construct()
    {
        $this->roleService = new RoleManagementService();
    }

    /**
     * Get paginated list of roles with filters and search.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $filters = $request->only([
                'search', 'scope', 'is_system_role', 'organization_id'
            ]);

            $roles = $this->roleService->getPaginatedRoles(
                page: $request->get('page', 1),
                perPage: $request->get('per_page', 15),
                filters: $filters,
                sortBy: $request->get('sort_by', 'created_at'),
                sortOrder: $request->get('sort_order', 'desc')
            );

            return $this->successResponse(
                'Roles retrieved successfully',
                new RoleCollection($roles)
            );
        } catch (\Exception $e) {
            Log::error('Role management index error', [
                'error' => $e->getMessage(),
                'user_id' => Auth::id()
            ]);

            return $this->errorResponse(
                'Failed to retrieve roles',
                ['error' => 'An unexpected error occurred'],
                500
            );
        }
    }

    /**
     * Get specific role details.
     */
    public function show(string $roleId): JsonResponse
    {
        try {
            $role = $this->roleService->getRoleWithDetails($roleId);

            if (!$role) {
                return $this->errorResponse(
                    'Role not found',
                    ['error' => 'The specified role does not exist'],
                    404
                );
            }

            return $this->successResponse(
                'Role details retrieved successfully',
                new RoleResource($role)
            );
        } catch (\Exception $e) {
            Log::error('Role management show error', [
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
                'role_id' => $roleId
            ]);

            return $this->errorResponse(
                'Failed to retrieve role details',
                ['error' => 'An unexpected error occurred'],
                500
            );
        }
    }

    /**
     * Create a new role.
     */
    public function store(CreateRoleRequest $request): JsonResponse
    {
        try {
            $roleData = $request->validated();

            $role = $this->roleService->createRole($roleData, Auth::user());

            Log::info('Role created by admin', [
                'admin_id' => Auth::id(),
                'new_role_id' => $role->id,
                'name' => $role->name
            ]);

            return $this->successResponse(
                'Role created successfully',
                new RoleResource($role),
                201
            );
        } catch (\Exception $e) {
            Log::error('Role management store error', [
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
                'data' => $request->validated()
            ]);

            return $this->errorResponse(
                'Failed to create role',
                ['error' => 'An unexpected error occurred'],
                500
            );
        }
    }

    /**
     * Update role information.
     */
    public function update(UpdateRoleRequest $request, string $roleId): JsonResponse
    {
        try {
            $roleData = $request->validated();

            $role = $this->roleService->updateRole($roleId, $roleData, Auth::user());

            if (!$role) {
                return $this->errorResponse(
                    'Role not found',
                    ['error' => 'The specified role does not exist'],
                    404
                );
            }

            Log::info('Role updated by admin', [
                'admin_id' => Auth::id(),
                'role_id' => $roleId,
                'updated_fields' => array_keys($roleData)
            ]);

            return $this->successResponse(
                'Role updated successfully',
                new RoleResource($role)
            );
        } catch (\Exception $e) {
            Log::error('Role management update error', [
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
                'role_id' => $roleId
            ]);

            return $this->errorResponse(
                'Failed to update role',
                ['error' => 'An unexpected error occurred'],
                500
            );
        }
    }

    /**
     * Delete role.
     */
    public function destroy(string $roleId): JsonResponse
    {
        try {
            $result = $this->roleService->deleteRole($roleId, Auth::user());

            if (!$result) {
                return $this->errorResponse(
                    'Role not found',
                    ['error' => 'The specified role does not exist'],
                    404
                );
            }

            Log::info('Role deleted by admin', [
                'admin_id' => Auth::id(),
                'role_id' => $roleId
            ]);

            return $this->successResponse(
                'Role deleted successfully',
                null
            );
        } catch (\Exception $e) {
            Log::error('Role management destroy error', [
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
                'role_id' => $roleId
            ]);

            return $this->errorResponse(
                'Failed to delete role',
                ['error' => 'An unexpected error occurred'],
                500
            );
        }
    }

    /**
     * Assign permissions to role.
     */
    public function assignPermissions(Request $request, string $roleId): JsonResponse
    {
        try {
            $request->validate([
                'permissions' => 'required|array',
                'permissions.*' => 'uuid|exists:permissions,id',
            ]);

            $permissionIds = $request->input('permissions');

            $role = $this->roleService->assignPermissionsToRole($roleId, $permissionIds, Auth::user());

            if (!$role) {
                return $this->errorResponse(
                    'Role not found',
                    ['error' => 'The specified role does not exist'],
                    404
                );
            }

            Log::info('Permissions assigned to role by admin', [
                'admin_id' => Auth::id(),
                'role_id' => $roleId,
                'permission_count' => count($permissionIds)
            ]);

            return $this->successResponse(
                'Permissions assigned successfully',
                new RoleResource($role)
            );
        } catch (\Exception $e) {
            Log::error('Role management assign permissions error', [
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
                'role_id' => $roleId
            ]);

            return $this->errorResponse(
                'Failed to assign permissions',
                ['error' => 'An unexpected error occurred'],
                500
            );
        }
    }

    /**
     * Remove permissions from role.
     */
    public function removePermissions(Request $request, string $roleId): JsonResponse
    {
        try {
            $request->validate([
                'permissions' => 'required|array',
                'permissions.*' => 'uuid|exists:permissions,id',
            ]);

            $permissionIds = $request->input('permissions');

            $role = $this->roleService->removePermissionsFromRole($roleId, $permissionIds, Auth::user());

            if (!$role) {
                return $this->errorResponse(
                    'Role not found',
                    ['error' => 'The specified role does not exist'],
                    404
                );
            }

            Log::info('Permissions removed from role by admin', [
                'admin_id' => Auth::id(),
                'role_id' => $roleId,
                'permission_count' => count($permissionIds)
            ]);

            return $this->successResponse(
                'Permissions removed successfully',
                new RoleResource($role)
            );
        } catch (\Exception $e) {
            Log::error('Role management remove permissions error', [
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
                'role_id' => $roleId
            ]);

            return $this->errorResponse(
                'Failed to remove permissions',
                ['error' => 'An unexpected error occurred'],
                500
            );
        }
    }

    /**
     * Get role statistics.
     */
    public function statistics(): JsonResponse
    {
        try {
            $stats = $this->roleService->getRoleStatistics();

            return $this->successResponse(
                'Role statistics retrieved successfully',
                $stats
            );
        } catch (\Exception $e) {
            Log::error('Role management statistics error', [
                'error' => $e->getMessage(),
                'user_id' => Auth::id()
            ]);

            return $this->errorResponse(
                'Failed to retrieve role statistics',
                ['error' => 'An unexpected error occurred'],
                500
            );
        }
    }

    /**
     * Clone role with permissions.
     */
    public function clone(Request $request, string $roleId): JsonResponse
    {
        try {
            $request->validate([
                'name' => 'required|string|max:100',
                'code' => 'required|string|max:50|unique:roles,code',
                'display_name' => 'nullable|string|max:255',
                'description' => 'nullable|string',
            ]);

            $newRoleData = $request->only(['name', 'code', 'display_name', 'description']);

            $newRole = $this->roleService->cloneRole($roleId, $newRoleData, Auth::user());

            if (!$newRole) {
                return $this->errorResponse(
                    'Role not found',
                    ['error' => 'The specified role does not exist'],
                    404
                );
            }

            Log::info('Role cloned by admin', [
                'admin_id' => Auth::id(),
                'original_role_id' => $roleId,
                'new_role_id' => $newRole->id
            ]);

            return $this->successResponse(
                'Role cloned successfully',
                new RoleResource($newRole),
                201
            );
        } catch (\Exception $e) {
            Log::error('Role management clone error', [
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
                'role_id' => $roleId
            ]);

            return $this->errorResponse(
                'Failed to clone role',
                ['error' => 'An unexpected error occurred'],
                500
            );
        }
    }
}
