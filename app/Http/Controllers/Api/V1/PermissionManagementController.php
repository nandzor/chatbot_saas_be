<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\V1\BaseController;
use App\Http\Requests\Permission\CreatePermissionRequest;
use App\Http\Requests\Permission\UpdatePermissionRequest;
use App\Http\Requests\Permission\CreatePermissionGroupRequest;
use App\Http\Requests\Permission\AssignPermissionsRequest;
use App\Http\Resources\Permission\PermissionResource;
use App\Http\Resources\Permission\PermissionCollection;
use App\Http\Resources\Permission\PermissionGroupResource;
use App\Http\Resources\Permission\PermissionGroupCollection;
use App\Services\PermissionManagementService;
use App\Exceptions\InvalidPermissionException;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;

class PermissionManagementController extends BaseController
{
    /**
     * The permission management service.
     */
    protected PermissionManagementService $permissionService;

    /**
     * Create a new controller instance.
     */
    public function __construct(PermissionManagementService $permissionService)
    {
        $this->permissionService = $permissionService;
    }

    /**
     * Get all permissions for the organization.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $organizationId = Auth::user()->organization_id;
            
            $filters = $request->only([
                'category', 'resource', 'is_system', 'is_visible', 'status'
            ]);

            $permissions = $this->permissionService->getOrganizationPermissions($organizationId, $filters);

            return $this->successResponse(
                new PermissionCollection($permissions),
                'Permissions retrieved successfully'
            );
        } catch (\Exception $e) {
            Log::error('Failed to retrieve permissions', [
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
                'organization_id' => Auth::user()->organization_id ?? null
            ]);

            return $this->errorResponse(
                'Failed to retrieve permissions',
                $e->getMessage(),
                500
            );
        }
    }

    /**
     * Get a specific permission by ID.
     */
    public function show(string $permissionId): JsonResponse
    {
        try {
            $organizationId = Auth::user()->organization_id;
            
            $permission = $this->permissionService->getPermissionById($permissionId, $organizationId);

            if (!$permission) {
                return $this->errorResponse(
                    'Permission not found',
                    'The requested permission does not exist or you do not have access to it',
                    404
                );
            }

            return $this->successResponse(
                new PermissionResource($permission),
                'Permission retrieved successfully'
            );
        } catch (\Exception $e) {
            Log::error('Failed to retrieve permission', [
                'error' => $e->getMessage(),
                'permission_id' => $permissionId,
                'user_id' => Auth::id()
            ]);

            return $this->errorResponse(
                'Failed to retrieve permission',
                $e->getMessage(),
                500
            );
        }
    }

    /**
     * Create a new permission.
     */
    public function store(CreatePermissionRequest $request): JsonResponse
    {
        try {
            $organizationId = Auth::user()->organization_id;
            
            $permission = $this->permissionService->createPermission(
                $request->validated(),
                $organizationId
            );

            Log::info('Permission created successfully', [
                'permission_id' => $permission->id,
                'created_by' => Auth::id(),
                'organization_id' => $organizationId
            ]);

            return $this->successResponse(
                new PermissionResource($permission),
                'Permission created successfully',
                201
            );
        } catch (InvalidPermissionException $e) {
            return $this->errorResponse(
                'Invalid permission data',
                $e->getMessage(),
                422
            );
        } catch (\Exception $e) {
            Log::error('Failed to create permission', [
                'error' => $e->getMessage(),
                'data' => $request->validated(),
                'user_id' => Auth::id()
            ]);

            return $this->errorResponse(
                'Failed to create permission',
                'An unexpected error occurred while creating the permission',
                500
            );
        }
    }

    /**
     * Update an existing permission.
     */
    public function update(UpdatePermissionRequest $request, string $permissionId): JsonResponse
    {
        try {
            $organizationId = Auth::user()->organization_id;
            
            $permission = $this->permissionService->updatePermission(
                $permissionId,
                $request->validated(),
                $organizationId
            );

            Log::info('Permission updated successfully', [
                'permission_id' => $permission->id,
                'updated_by' => Auth::id(),
                'organization_id' => $organizationId
            ]);

            return $this->successResponse(
                new PermissionResource($permission),
                'Permission updated successfully'
            );
        } catch (InvalidPermissionException $e) {
            return $this->errorResponse(
                'Invalid permission data',
                $e->getMessage(),
                422
            );
        } catch (\Exception $e) {
            Log::error('Failed to update permission', [
                'error' => $e->getMessage(),
                'permission_id' => $permissionId,
                'data' => $request->validated(),
                'user_id' => Auth::id()
            ]);

            return $this->errorResponse(
                'Failed to update permission',
                'An unexpected error occurred while updating the permission',
                500
            );
        }
    }

    /**
     * Delete a permission.
     */
    public function destroy(string $permissionId): JsonResponse
    {
        try {
            $organizationId = Auth::user()->organization_id;
            
            $deleted = $this->permissionService->deletePermission($permissionId, $organizationId);

            if (!$deleted) {
                return $this->errorResponse(
                    'Permission not found',
                    'The requested permission does not exist or you do not have access to it',
                    404
                );
            }

            Log::info('Permission deleted successfully', [
                'permission_id' => $permissionId,
                'deleted_by' => Auth::id(),
                'organization_id' => $organizationId
            ]);

            return $this->successResponse(
                null,
                'Permission deleted successfully'
            );
        } catch (InvalidPermissionException $e) {
            return $this->errorResponse(
                'Cannot delete permission',
                $e->getMessage(),
                422
            );
        } catch (\Exception $e) {
            Log::error('Failed to delete permission', [
                'error' => $e->getMessage(),
                'permission_id' => $permissionId,
                'user_id' => Auth::id()
            ]);

            return $this->errorResponse(
                'Failed to delete permission',
                'An unexpected error occurred while deleting the permission',
                500
            );
        }
    }

    /**
     * Get permissions for a specific role.
     */
    public function getRolePermissions(string $roleId): JsonResponse
    {
        try {
            $organizationId = Auth::user()->organization_id;
            
            $permissions = $this->permissionService->getRolePermissions($roleId, $organizationId);

            return $this->successResponse(
                new PermissionCollection($permissions),
                'Role permissions retrieved successfully'
            );
        } catch (\Exception $e) {
            Log::error('Failed to retrieve role permissions', [
                'error' => $e->getMessage(),
                'role_id' => $roleId,
                'user_id' => Auth::id()
            ]);

            return $this->errorResponse(
                'Failed to retrieve role permissions',
                'An unexpected error occurred while retrieving role permissions',
                500
            );
        }
    }

    /**
     * Assign permissions to a role.
     */
    public function assignPermissionsToRole(AssignPermissionsRequest $request, string $roleId): JsonResponse
    {
        try {
            $organizationId = Auth::user()->organization_id;
            
            $success = $this->permissionService->assignPermissionsToRole(
                $roleId,
                $request->validated()['permission_ids'],
                $organizationId,
                Auth::id()
            );

            if (!$success) {
                return $this->errorResponse(
                    'Failed to assign permissions',
                    'An error occurred while assigning permissions to the role',
                    500
                );
            }

            Log::info('Permissions assigned to role successfully', [
                'role_id' => $roleId,
                'permission_count' => count($request->validated()['permission_ids']),
                'assigned_by' => Auth::id(),
                'organization_id' => $organizationId
            ]);

            return $this->successResponse(
                null,
                'Permissions assigned to role successfully'
            );
        } catch (InvalidPermissionException $e) {
            return $this->errorResponse(
                'Invalid permission assignment',
                $e->getMessage(),
                422
            );
        } catch (\Exception $e) {
            Log::error('Failed to assign permissions to role', [
                'error' => $e->getMessage(),
                'role_id' => $roleId,
                'permission_ids' => $request->validated()['permission_ids'],
                'user_id' => Auth::id()
            ]);

            return $this->errorResponse(
                'Failed to assign permissions',
                'An unexpected error occurred while assigning permissions to the role',
                500
            );
        }
    }

    /**
     * Remove permissions from a role.
     */
    public function removePermissionsFromRole(AssignPermissionsRequest $request, string $roleId): JsonResponse
    {
        try {
            $organizationId = Auth::user()->organization_id;
            
            $success = $this->permissionService->removePermissionsFromRole(
                $roleId,
                $request->validated()['permission_ids'],
                $organizationId
            );

            if (!$success) {
                return $this->errorResponse(
                    'Failed to remove permissions',
                    'An error occurred while removing permissions from the role',
                    500
                );
            }

            Log::info('Permissions removed from role successfully', [
                'role_id' => $roleId,
                'permission_count' => count($request->validated()['permission_ids']),
                'removed_by' => Auth::id(),
                'organization_id' => $organizationId
            ]);

            return $this->successResponse(
                null,
                'Permissions removed from role successfully'
            );
        } catch (InvalidPermissionException $e) {
            return $this->errorResponse(
                'Invalid permission removal',
                $e->getMessage(),
                422
            );
        } catch (\Exception $e) {
            Log::error('Failed to remove permissions from role', [
                'error' => $e->getMessage(),
                'role_id' => $roleId,
                'permission_ids' => $request->validated()['permission_ids'],
                'user_id' => Auth::id()
            ]);

            return $this->errorResponse(
                'Failed to remove permissions',
                'An unexpected error occurred while removing permissions from the role',
                500
            );
        }
    }

    /**
     * Get permission groups for the organization.
     */
    public function getPermissionGroups(): JsonResponse
    {
        try {
            $organizationId = Auth::user()->organization_id;
            
            $groups = $this->permissionService->getPermissionGroups($organizationId);

            return $this->successResponse(
                new PermissionGroupCollection($groups),
                'Permission groups retrieved successfully'
            );
        } catch (\Exception $e) {
            Log::error('Failed to retrieve permission groups', [
                'error' => $e->getMessage(),
                'user_id' => Auth::id()
            ]);

            return $this->errorResponse(
                'Failed to retrieve permission groups',
                'An unexpected error occurred while retrieving permission groups',
                500
            );
        }
    }

    /**
     * Create a new permission group.
     */
    public function createPermissionGroup(CreatePermissionGroupRequest $request): JsonResponse
    {
        try {
            $organizationId = Auth::user()->organization_id;
            
            $group = $this->permissionService->createPermissionGroup(
                $request->validated(),
                $organizationId
            );

            Log::info('Permission group created successfully', [
                'group_id' => $group->id,
                'created_by' => Auth::id(),
                'organization_id' => $organizationId
            ]);

            return $this->successResponse(
                new PermissionGroupResource($group),
                'Permission group created successfully',
                201
            );
        } catch (InvalidPermissionException $e) {
            return $this->errorResponse(
                'Invalid permission group data',
                $e->getMessage(),
                422
            );
        } catch (\Exception $e) {
            Log::error('Failed to create permission group', [
                'error' => $e->getMessage(),
                'data' => $request->validated(),
                'user_id' => Auth::id()
            ]);

            return $this->errorResponse(
                'Failed to create permission group',
                'An unexpected error occurred while creating the permission group',
                500
            );
        }
    }

    /**
     * Check if user has specific permission.
     */
    public function checkUserPermission(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'resource' => 'required|string',
                'action' => 'required|string',
                'scope' => 'sometimes|string|in:global,organization,department,team,personal'
            ]);

            $organizationId = Auth::user()->organization_id;
            $userId = Auth::id();
            
            $hasPermission = $this->permissionService->userHasPermission(
                $userId,
                $organizationId,
                $request->resource,
                $request->action,
                $request->scope ?? 'organization'
            );

            return $this->successResponse([
                'has_permission' => $hasPermission,
                'resource' => $request->resource,
                'action' => $request->action,
                'scope' => $request->scope ?? 'organization'
            ], 'Permission check completed successfully');
        } catch (\Exception $e) {
            Log::error('Failed to check user permission', [
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
                'request_data' => $request->all()
            ]);

            return $this->errorResponse(
                'Failed to check permission',
                'An unexpected error occurred while checking the permission',
                500
            );
        }
    }

    /**
     * Get user's permissions.
     */
    public function getUserPermissions(): JsonResponse
    {
        try {
            $organizationId = Auth::user()->organization_id;
            $userId = Auth::id();
            
            $permissions = $this->permissionService->getUserPermissions($userId, $organizationId);

            return $this->successResponse(
                new PermissionCollection($permissions),
                'User permissions retrieved successfully'
            );
        } catch (\Exception $e) {
            Log::error('Failed to retrieve user permissions', [
                'error' => $e->getMessage(),
                'user_id' => Auth::id()
            ]);

            return $this->errorResponse(
                'Failed to retrieve user permissions',
                'An unexpected error occurred while retrieving user permissions',
                500
            );
        }
    }
}
