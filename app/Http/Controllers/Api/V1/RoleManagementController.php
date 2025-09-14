<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\Role\UpdateRoleRequest;
use App\Services\RoleService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class RoleManagementController extends BaseApiController
{
    protected RoleService $roleService;

    public function __construct(RoleService $roleService)
    {
        $this->roleService = $roleService;
    }

    /**
     * Get paginated list of roles with filters and search.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $roles = $this->roleService->getRoles($request);

            return $this->successResponse(
                'Roles retrieved successfully',
                $roles,
                200,
                [
                    'execution_time_ms' => round((microtime(true) - LARAVEL_START) * 1000, 2),
                    'memory_usage_mb' => round(memory_get_usage(true) / 1024 / 1024, 2),
                    'queries_count' => 0
                ]
            );

        } catch (\Exception $e) {
            Log::error('Get roles error: ' . $e->getMessage(), [
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);

            return $this->errorResponseWithDebug(
                'Failed to retrieve roles',
                500,
                ['error' => 'An unexpected error occurred'],
                $e
            );
        }
    }

    /**
     * Get specific role details.
     */
    public function show(string $roleId): JsonResponse
    {
        try {
            // Validate roleId parameter
            if (empty($roleId)) {
                return $this->errorResponse('Role ID is required', null, 400);
            }

            // Validate UUID format
            if (!preg_match('/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i', $roleId)) {
                return $this->errorResponse('Invalid role ID format. Must be a valid UUID.', null, 400);
            }

            $role = $this->roleService->getRoleWithDetails($roleId);

            if (!$role) {
                return $this->notFoundResponse('Role not found');
            }

            return $this->successResponse('Role retrieved successfully', $role);

        } catch (\Exception $e) {
            Log::error('Get role error: ' . $e->getMessage(), [
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);

            return $this->errorResponseWithDebug(
                'Failed to retrieve role',
                500,
                ['error' => 'An unexpected error occurred'],
                $e
            );
        }
    }

    /**
     * Create a new role.
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255|unique:roles,name',
                'description' => 'nullable|string',
                'scope' => 'required|string|in:global,organization,department,team,personal',
                'is_system_role' => 'boolean',
                'organization_id' => 'nullable|integer|exists:organizations,id'
            ]);

            $role = $this->roleService->createRole($validated);

            return $this->createdResponse('Role created successfully', $role);

        } catch (ValidationException $e) {
            return $this->validationErrorResponse($e->errors());
        } catch (\Exception $e) {
            Log::error('Create role error: ' . $e->getMessage(), [
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);

            return $this->errorResponseWithDebug(
                'Failed to create role',
                500,
                ['error' => 'An unexpected error occurred'],
                $e
            );
        }
    }

    /**
     * Update the specified role.
     */
    public function update(UpdateRoleRequest $request, string $roleId): JsonResponse
    {
        try {
            // Validate roleId parameter
            if (empty($roleId)) {
                return $this->errorResponse('Role ID is required', null, 400);
            }

            // Validate UUID format
            if (!preg_match('/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i', $roleId)) {
                return $this->errorResponse('Invalid role ID format. Must be a valid UUID.', null, 400);
            }

            $role = $this->roleService->getRoleWithDetails($roleId);

            if (!$role) {
                return $this->notFoundResponse('Role not found');
            }

            // Get validated data from request
            $validated = $request->validated();

            // Handle status field mapping
            if (isset($validated['status'])) {
                // Keep status as is, no mapping needed since database uses 'status' field
            }

            // Handle is_active field mapping to status
            if (isset($validated['is_active'])) {
                $validated['status'] = $validated['is_active'] ? 'active' : 'inactive';
                unset($validated['is_active']);
            }

            // Update role
            $updatedRole = $this->roleService->updateRole($roleId, $validated);

            // Log the update action
            $this->logApiAction('role_updated', [
                'role_id' => $updatedRole->id,
                'role_name' => $updatedRole->name,
                'updated_by' => $this->getCurrentUser()?->id,
                'changes' => $validated
            ]);

            // Return enhanced update response with role data in message field
            return $this->updatedResponse(
                data: 'Role updated successfully',
                message: json_encode($updatedRole->toArray()),
                meta: [
                    'execution_time_ms' => microtime(true) - LARAVEL_START,
                    'memory_usage_mb' => memory_get_usage(true) / 1024 / 1024,
                    'queries_count' => 0
                ]
            );

        } catch (ValidationException $e) {
            return $this->validationErrorResponse($e->errors());
        } catch (\Exception $e) {
            Log::error('Update role error: ' . $e->getMessage(), [
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);

            return $this->errorResponseWithDebug(
                'Failed to update role',
                500,
                ['error' => 'An unexpected error occurred'],
                $e
            );
        }
    }

    /**
     * Remove the specified role.
     */
    public function destroy(string $roleId): JsonResponse
    {
        try {
            // Validate roleId parameter
            if (empty($roleId)) {
                return $this->errorResponse('Role ID is required', null, 400);
            }

            // Validate UUID format
            if (!preg_match('/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i', $roleId)) {
                return $this->errorResponse('Invalid role ID format. Must be a valid UUID.', null, 400);
            }

            $role = $this->roleService->getRoleWithDetails($roleId);

            if (!$role) {
                return $this->notFoundResponse('Role not found');
            }

            $this->roleService->deleteRole($roleId);

            return $this->deletedResponse('Role deleted successfully');

        } catch (\Exception $e) {
            Log::error('Delete role error: ' . $e->getMessage(), [
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);

            return $this->errorResponseWithDebug(
                'Failed to delete role',
                500,
                ['error' => 'An unexpected error occurred'],
                $e
            );
        }
    }

    /**
     * Get available roles for assignment.
     */
    public function getAvailableRoles(): JsonResponse
    {
        try {
            $roles = $this->roleService->getAvailableRoles();

            return $this->successResponse('Available roles retrieved successfully', $roles);

        } catch (\Exception $e) {
            Log::error('Get available roles error: ' . $e->getMessage(), [
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);

            return $this->errorResponseWithDebug(
                'Failed to retrieve available roles',
                500,
                ['error' => 'An unexpected error occurred'],
                $e
            );
        }
    }

    /**
     * Get users assigned to a specific role.
     */
    public function getUsers(string $roleId): JsonResponse
    {
        try {
            // Validate roleId parameter
            if (empty($roleId)) {
                return $this->errorResponse('Role ID is required', null, 400);
            }

            // Validate UUID format
            if (!preg_match('/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i', $roleId)) {
                return $this->errorResponse('Invalid role ID format. Must be a valid UUID.', null, 400);
            }

            $role = $this->roleService->getRoleWithDetails($roleId);

            if (!$role) {
                return $this->notFoundResponse('Role not found');
            }

            $users = $this->roleService->getUsersByRole($roleId);

            return $this->successResponse('Role users retrieved successfully', $users);

        } catch (\Exception $e) {
            Log::error('Get role users error: ' . $e->getMessage(), [
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);

            return $this->errorResponseWithDebug(
                'Failed to retrieve role users',
                500,
                ['error' => 'An unexpected error occurred'],
                $e
            );
        }
    }

    /**
     * Assign role to user.
     */
    public function assignRole(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'user_id' => 'required|integer|exists:users,id',
                'role_id' => 'required|string|exists:roles,id'
            ]);

            $success = $this->roleService->assignRoleToUsers($validated['role_id'], [$validated['user_id']]);

            if ($success) {
                return $this->successResponse('Role assigned to user successfully');
            }

            return $this->errorResponse('Failed to assign role to user', ['error' => 'Could not assign role']);

        } catch (ValidationException $e) {
            return $this->validationErrorResponse($e->errors());
        } catch (\Exception $e) {
            Log::error('Assign role error: ' . $e->getMessage(), [
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);

            return $this->errorResponseWithDebug(
                'Failed to assign role to user',
                500,
                ['error' => 'An unexpected error occurred'],
                $e
            );
        }
    }

    /**
     * Revoke role from user.
     */
    public function revokeRole(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'user_id' => 'required|integer|exists:users,id',
                'role_id' => 'required|string|exists:roles,id'
            ]);

            $success = $this->roleService->revokeRoleFromUsers($validated['role_id'], [$validated['user_id']]);

            if ($success) {
                return $this->successResponse('Role revoked from user successfully');
            }

            return $this->errorResponse('Failed to revoke role from user', ['error' => 'Could not revoke role']);

        } catch (ValidationException $e) {
            return $this->validationErrorResponse($e->errors());
        } catch (\Exception $e) {
            Log::error('Revoke role error: ' . $e->getMessage(), [
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);

            return $this->errorResponseWithDebug(
                'Failed to revoke role from user',
                500,
                ['error' => 'An unexpected error occurred'],
                $e
            );
        }
    }

    /**
     * Get permissions assigned to a specific role.
     */
    public function getPermissions(string $roleId): JsonResponse
    {
        try {
            // Validate roleId parameter
            if (empty($roleId)) {
                return $this->errorResponse('Role ID is required', null, 400);
            }

            // Validate UUID format
            if (!preg_match('/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i', $roleId)) {
                return $this->errorResponse('Invalid role ID format. Must be a valid UUID.', null, 400);
            }

            $role = $this->roleService->getRoleWithDetails($roleId);

            if (!$role) {
                return $this->notFoundResponse('Role not found');
            }

            $permissions = $this->roleService->getRolePermissions($roleId);

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
     * Update permissions for a role.
     */
    public function updatePermissions(Request $request, string $roleId): JsonResponse
    {
        try {
            // Validate roleId parameter
            if (empty($roleId)) {
                return $this->errorResponse('Role ID is required', null, 400);
            }

            $role = $this->roleService->getRoleWithDetails($roleId);

            if (!$role) {
                return $this->notFoundResponse('Role not found');
            }

            $validated = $request->validate([
                'permission_ids' => 'required|array',
                'permission_ids.*' => 'string|exists:permissions,id'
            ]);

            $success = $this->roleService->updateRolePermissions($roleId, $validated['permission_ids']);

            if ($success) {
                // Log the update action
                $this->logApiAction('role_permissions_updated', [
                    'role_id' => $roleId,
                    'permission_count' => count($validated['permission_ids']),
                    'updated_by' => $this->getCurrentUser()?->id
                ]);

                return $this->successResponse('Role permissions updated successfully');
            }

            return $this->errorResponse('Failed to update role permissions');

        } catch (ValidationException $e) {
            return $this->validationErrorResponse($e->errors());
        } catch (\Exception $e) {
            Log::error('Update role permissions error: ' . $e->getMessage(), [
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);

            return $this->errorResponseWithDebug(
                'Failed to update role permissions',
                500,
                ['error' => 'An unexpected error occurred'],
                $e
            );
        }
    }

    /**
     * Get role statistics.
     */
    public function statistics(): JsonResponse
    {
        try {
            $statistics = $this->roleService->getRoleStatistics();

            return $this->successResponse('Role statistics retrieved successfully', $statistics);

        } catch (\Exception $e) {
            Log::error('Get role statistics error: ' . $e->getMessage(), [
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);

            return $this->errorResponseWithDebug(
                'Failed to retrieve role statistics',
                500,
                ['error' => 'An unexpected error occurred'],
                $e
            );
        }
    }
}
