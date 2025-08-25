<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\BaseApiController;
use App\Services\PermissionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class PermissionManagementController extends BaseApiController
{
    protected PermissionService $permissionService;

    public function __construct(PermissionService $permissionService)
    {
        $this->permissionService = $permissionService;
    }

    /**
     * Get all permissions for the organization.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $permissions = $this->permissionService->getOrganizationPermissions(
                $this->getCurrentOrganization()?->id,
                $request->all()
            );

            return $this->successResponse('Permissions retrieved successfully', $permissions);

        } catch (\Exception $e) {
            Log::error('Get permissions error: ' . $e->getMessage(), [
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);

            return $this->errorResponseWithDebug(
                'Failed to retrieve permissions',
                500,
                ['error' => 'An unexpected error occurred'],
                $e
            );
        }
    }

    /**
     * Get specific permission details.
     */
    public function show(string $permissionId): JsonResponse
    {
        try {
            // Validate permissionId parameter
            if (empty($permissionId)) {
                return $this->errorResponse('Permission ID is required', null, 400);
            }

            $permission = $this->permissionService->getPermissionById(
                $permissionId,
                $this->getCurrentOrganization()?->id
            );

            if (!$permission) {
                return $this->notFoundResponse('Permission not found');
            }

            return $this->successResponse('Permission retrieved successfully', $permission);

        } catch (\Exception $e) {
            Log::error('Get permission error: ' . $e->getMessage(), [
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);

            return $this->errorResponseWithDebug(
                'Failed to retrieve permission',
                500,
                ['error' => 'An unexpected error occurred'],
                $e
            );
        }
    }

    /**
     * Create a new permission.
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'code' => 'required|string|max:100',
                'description' => 'nullable|string',
                'resource' => 'required|string|max:100',
                'action' => 'required|string|max:100',
                'category' => 'required|string|max:100',
                'is_system_permission' => 'boolean',
                'is_visible' => 'boolean',
                'status' => 'string|in:active,inactive'
            ]);

            $permission = $this->permissionService->createPermission(
                $validated,
                $this->getCurrentOrganization()?->id
            );

            return $this->createdResponse('Permission created successfully', $permission);

        } catch (ValidationException $e) {
            return $this->validationErrorResponse($e->errors());
        } catch (\Exception $e) {
            Log::error('Create permission error: ' . $e->getMessage(), [
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);

            return $this->errorResponseWithDebug(
                'Failed to create permission',
                500,
                ['error' => 'An unexpected error occurred'],
                $e
            );
        }
    }

    /**
     * Update the specified permission.
     */
    public function update(Request $request, string $permissionId): JsonResponse
    {
        try {
            // Validate permissionId parameter
            if (empty($permissionId)) {
                return $this->errorResponse('Permission ID is required', null, 400);
            }

            $validated = $request->validate([
                'name' => 'sometimes|string|max:255',
                'description' => 'nullable|string',
                'is_visible' => 'boolean',
                'status' => 'string|in:active,inactive'
            ]);

            $updatedPermission = $this->permissionService->updatePermission(
                $permissionId,
                $validated,
                $this->getCurrentOrganization()?->id
            );

            return $this->successResponse('Permission updated successfully', $updatedPermission);

        } catch (ValidationException $e) {
            return $this->validationErrorResponse($e->errors());
        } catch (\Exception $e) {
            Log::error('Update permission error: ' . $e->getMessage(), [
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);

            return $this->errorResponseWithDebug(
                'Failed to update permission',
                500,
                ['error' => 'An unexpected error occurred'],
                $e
            );
        }
    }

    /**
     * Remove the specified permission.
     */
    public function destroy(string $permissionId): JsonResponse
    {
        try {
            // Validate permissionId parameter
            if (empty($permissionId)) {
                return $this->errorResponse('Permission ID is required', null, 400);
            }

            $success = $this->permissionService->deletePermission(
                $permissionId,
                $this->getCurrentOrganization()?->id
            );

            if (!$success) {
                return $this->errorResponse('Failed to delete permission', ['error' => 'Could not delete permission']);
            }

            return $this->deletedResponse('Permission deleted successfully');

        } catch (\Exception $e) {
            Log::error('Delete permission error: ' . $e->getMessage(), [
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);

            return $this->errorResponseWithDebug(
                'Failed to delete permission',
                500,
                ['error' => 'An unexpected error occurred'],
                $e
            );
        }
    }

    /**
     * Get permission groups.
     */
    public function getPermissionGroups(): JsonResponse
    {
        try {
            $groups = $this->permissionService->getPermissionGroups(
                $this->getCurrentOrganization()?->id
            );

            return $this->successResponse('Permission groups retrieved successfully', $groups);

        } catch (\Exception $e) {
            Log::error('Get permission groups error: ' . $e->getMessage(), [
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);

            return $this->errorResponseWithDebug(
                'Failed to retrieve permission groups',
                500,
                ['error' => 'An unexpected error occurred'],
                $e
            );
        }
    }

    /**
     * Create permission group.
     */
    public function createPermissionGroup(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'description' => 'nullable|string',
                'permission_ids' => 'array'
            ]);

            $group = $this->permissionService->createPermissionGroup(
                $validated,
                $this->getCurrentOrganization()?->id
            );

            return $this->createdResponse('Permission group created successfully', $group);

        } catch (ValidationException $e) {
            return $this->validationErrorResponse($e->errors());
        } catch (\Exception $e) {
            Log::error('Create permission group error: ' . $e->getMessage(), [
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);

            return $this->errorResponseWithDebug(
                'Failed to create permission group',
                500,
                ['error' => 'An unexpected error occurred'],
                $e
            );
        }
    }

    /**
     * Get permissions for a specific role.
     */
    public function getRolePermissions(string $roleId): JsonResponse
    {
        try {
            // Validate roleId parameter
            if (empty($roleId)) {
                return $this->errorResponse('Role ID is required', null, 400);
            }

            $permissions = $this->permissionService->getRolePermissions(
                $roleId,
                $this->getCurrentOrganization()?->id
            );

            return $this->successResponse('Role permissions retrieved successfully', $permissions);

        } catch (\Exception $e) {
            Log::error('Get role permissions error: ' . $e->getMessage(), [
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);

            return $this->errorResponseWithDebug(
                'Failed to retrieve role permissions',
                500,
                ['error' => 'An unexpected error occurred'],
                $e
            );
        }
    }

    /**
     * Assign permissions to a role.
     */
    public function assignPermissionsToRole(Request $request, string $roleId): JsonResponse
    {
        try {
            // Validate roleId parameter
            if (empty($roleId)) {
                return $this->errorResponse('Role ID is required', null, 400);
            }

            $validated = $request->validate([
                'permission_ids' => 'required|array',
                'permission_ids.*' => 'required|string|exists:permissions,id'
            ]);

            $success = $this->permissionService->assignPermissionsToRole(
                $roleId,
                $validated['permission_ids'],
                $this->getCurrentOrganization()?->id
            );

            if (!$success) {
                return $this->errorResponse('Failed to assign permissions to role', ['error' => 'Could not assign permissions']);
            }

            return $this->successResponse('Permissions assigned to role successfully');

        } catch (ValidationException $e) {
            return $this->validationErrorResponse($e->errors());
        } catch (\Exception $e) {
            Log::error('Assign permissions to role error: ' . $e->getMessage(), [
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);

            return $this->errorResponseWithDebug(
                'Failed to assign permissions to role',
                500,
                ['error' => 'An unexpected error occurred'],
                $e
            );
        }
    }

    /**
     * Remove permissions from a role.
     */
    public function removePermissionsFromRole(Request $request, string $roleId): JsonResponse
    {
        try {
            // Validate roleId parameter
            if (empty($roleId)) {
                return $this->errorResponse('Role ID is required', null, 400);
            }

            $validated = $request->validate([
                'permission_ids' => 'required|array',
                'permission_ids.*' => 'required|string|exists:permissions,id'
            ]);

            $success = $this->permissionService->removePermissionsFromRole(
                $roleId,
                $validated['permission_ids'],
                $this->getCurrentOrganization()?->id
            );

            if (!$success) {
                return $this->errorResponse('Failed to remove permissions from role', ['error' => 'Could not remove permissions']);
            }

            return $this->successResponse('Permissions removed from role successfully');

        } catch (ValidationException $e) {
            return $this->validationErrorResponse($e->errors());
        } catch (\Exception $e) {
            Log::error('Remove permissions from role error: ' . $e->getMessage(), [
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);

            return $this->errorResponseWithDebug(
                'Failed to remove permissions from role',
                500,
                ['error' => 'An unexpected error occurred'],
                $e
            );
        }
    }

    /**
     * Get current user's permissions.
     */
    public function getUserPermissions(Request $request): JsonResponse
    {
        try {
            $user = $this->getCurrentUser();
            if (!$user) {
                return $this->errorResponse('User not found', ['error' => 'Authenticated user not found'], 404);
            }

            $permissions = $this->permissionService->getUserPermissions(
                $user->id,
                $this->getCurrentOrganization()?->id
            );

            return $this->successResponse('User permissions retrieved successfully', $permissions);

        } catch (\Exception $e) {
            Log::error('Get user permissions error: ' . $e->getMessage(), [
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);

            return $this->errorResponseWithDebug(
                'Failed to retrieve user permissions',
                500,
                ['error' => 'An unexpected error occurred'],
                $e
            );
        }
    }

    /**
     * Check if user has specific permission.
     */
    public function checkUserPermission(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'permission' => 'required|string',
                'resource' => 'sometimes|string',
                'action' => 'sometimes|string'
            ]);

            $user = $this->getCurrentUser();
            if (!$user) {
                return $this->errorResponse('User not found', ['error' => 'Authenticated user not found'], 404);
            }

            $hasPermission = $this->permissionService->userHasPermission(
                $user->id,
                $this->getCurrentOrganization()?->id,
                $validated['resource'] ?? 'general',
                $validated['action'] ?? 'view'
            );

            return $this->successResponse('Permission check completed', [
                'has_permission' => $hasPermission,
                'permission' => $validated['permission'],
                'resource' => $validated['resource'] ?? 'general',
                'action' => $validated['action'] ?? 'view'
            ]);

        } catch (ValidationException $e) {
            return $this->validationErrorResponse($e->errors());
        } catch (\Exception $e) {
            Log::error('Check user permission error: ' . $e->getMessage(), [
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);

            return $this->errorResponseWithDebug(
                'Failed to check user permission',
                500,
                ['error' => 'An unexpected error occurred'],
                $e
            );
        }
    }
}
