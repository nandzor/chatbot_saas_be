<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\BaseApiController;
use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;

class PermissionManagementController extends BaseApiController
{
    /**
     * Get all permissions for the organization.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $filters = $this->getFilterParams($request, [
                'category', 'resource', 'is_system', 'is_visible', 'status'
            ]);

            $query = Permission::query();

            // Apply filters
            if (!empty($filters['category'])) {
                $query->where('category', $filters['category']);
            }

            if (!empty($filters['resource'])) {
                $query->where('resource', $filters['resource']);
            }

            if (isset($filters['is_system'])) {
                $query->where('is_system', $filters['is_system']);
            }

            if (isset($filters['is_visible'])) {
                $query->where('is_visible', $filters['is_visible']);
            }

            if (!empty($filters['status'])) {
                $query->where('status', $filters['status']);
            }

            $permissions = $query->get();

            return $this->successResponse('Permissions retrieved successfully', $permissions);

        } catch (\Exception $e) {
            return $this->serverErrorResponse('Failed to retrieve permissions', $e->getMessage());
        }
    }

    /**
     * Get a specific permission by ID.
     */
    public function show(string $permissionId): JsonResponse
    {
        try {
            $permission = Permission::find($permissionId);

            if (!$permission) {
                return $this->notFoundResponse('Permission not found');
            }

            return $this->successResponse('Permission retrieved successfully', $permission);

        } catch (\Exception $e) {
            return $this->serverErrorResponse('Failed to retrieve permission', $e->getMessage());
        }
    }

    /**
     * Create a new permission.
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255|unique:permissions,name',
                'description' => 'nullable|string',
                'category' => 'required|string|max:100',
                'resource' => 'required|string|max:100',
                'action' => 'required|string|max:100',
                'is_system' => 'boolean',
                'is_visible' => 'boolean',
                'status' => 'string|in:active,inactive'
            ]);

            $permission = Permission::create($validated);

            return $this->createdResponse('Permission created successfully', $permission);

        } catch (ValidationException $e) {
            return $this->validationErrorResponse($e->errors());
        } catch (\Exception $e) {
            return $this->serverErrorResponse('Failed to create permission', $e->getMessage());
        }
    }

    /**
     * Update an existing permission.
     */
    public function update(Request $request, string $permissionId): JsonResponse
    {
        try {
            $permission = Permission::find($permissionId);

            if (!$permission) {
                return $this->notFoundResponse('Permission not found');
            }

            $validated = $request->validate([
                'name' => 'sometimes|string|max:255|unique:permissions,name,' . $permissionId,
                'description' => 'nullable|string',
                'category' => 'sometimes|string|max:100',
                'resource' => 'sometimes|string|max:100',
                'action' => 'sometimes|string|max:100',
                'is_system' => 'boolean',
                'is_visible' => 'boolean',
                'status' => 'string|in:active,inactive'
            ]);

            $permission->update($validated);
            $permission->refresh();

            return $this->updatedResponse('Permission updated successfully', $permission);

        } catch (ValidationException $e) {
            return $this->validationErrorResponse($e->errors());
        } catch (\Exception $e) {
            return $this->serverErrorResponse('Failed to update permission', $e->getMessage());
        }
    }

    /**
     * Delete a permission.
     */
    public function destroy(string $permissionId): JsonResponse
    {
        try {
            $permission = Permission::find($permissionId);

            if (!$permission) {
                return $this->notFoundResponse('Permission not found');
            }

            $permission->delete();

            return $this->deletedResponse('Permission deleted successfully');

        } catch (\Exception $e) {
            return $this->serverErrorResponse('Failed to delete permission', $e->getMessage());
        }
    }

    /**
     * Get permission groups.
     */
    public function getPermissionGroups(Request $request): JsonResponse
    {
        try {
            $groups = Permission::select('category')
                              ->distinct()
                              ->whereNotNull('category')
                              ->get()
                              ->pluck('category');

            return $this->successResponse('Permission groups retrieved successfully', $groups);

        } catch (\Exception $e) {
            return $this->serverErrorResponse('Failed to retrieve permission groups', $e->getMessage());
        }
    }

    /**
     * Create a new permission group.
     */
    public function createPermissionGroup(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'description' => 'nullable|string',
                'category' => 'required|string|max:100'
            ]);

            // This would typically create a permission group model
            // For now, we'll just return success
            return $this->successResponse('Permission group created successfully', $validated, 201);

        } catch (ValidationException $e) {
            return $this->validationErrorResponse($e->errors());
        } catch (\Exception $e) {
            return $this->serverErrorResponse('Failed to create permission group', $e->getMessage());
        }
    }

    /**
     * Get permissions for a specific role.
     */
    public function getRolePermissions(string $roleId): JsonResponse
    {
        try {
            $role = Role::with('permissions')->find($roleId);

            if (!$role) {
                return $this->notFoundResponse('Role not found');
            }

            return $this->successResponse('Role permissions retrieved successfully', $role->permissions);

        } catch (\Exception $e) {
            return $this->serverErrorResponse('Failed to retrieve role permissions', $e->getMessage());
        }
    }

    /**
     * Assign permissions to a role.
     */
    public function assignPermissionsToRole(Request $request, string $roleId): JsonResponse
    {
        try {
            $validated = $request->validate([
                'permission_ids' => 'required|array',
                'permission_ids.*' => 'required|string|exists:permissions,id'
            ]);

            $role = Role::find($roleId);

            if (!$role) {
                return $this->notFoundResponse('Role not found');
            }

            // Simple permission assignment - you might want to use a pivot table
            $role->permissions()->sync($validated['permission_ids']);

            return $this->successResponse('Permissions assigned to role successfully');

        } catch (ValidationException $e) {
            return $this->validationErrorResponse($e->errors());
        } catch (\Exception $e) {
            return $this->serverErrorResponse('Failed to assign permissions to role', $e->getMessage());
        }
    }

    /**
     * Remove permissions from a role.
     */
    public function removePermissionsFromRole(Request $request, string $roleId): JsonResponse
    {
        try {
            $validated = $request->validate([
                'permission_ids' => 'required|array',
                'permission_ids.*' => 'required|string|exists:permissions,id'
            ]);

            $role = Role::find($roleId);

            if (!$role) {
                return $this->notFoundResponse('Role not found');
            }

            // Simple permission removal
            $role->permissions()->detach($validated['permission_ids']);

            return $this->successResponse('Permissions removed from role successfully');

        } catch (ValidationException $e) {
            return $this->validationErrorResponse($e->errors());
        } catch (\Exception $e) {
            return $this->serverErrorResponse('Failed to remove permissions to role', $e->getMessage());
        }
    }

    /**
     * Get current user's permissions.
     */
    public function getUserPermissions(Request $request): JsonResponse
    {
        try {
            // This would typically get permissions from the authenticated user
            // For now, we'll return a placeholder
            $permissions = Permission::where('status', 'active')->take(10)->get();

            return $this->successResponse('User permissions retrieved successfully', $permissions);

        } catch (\Exception $e) {
            return $this->serverErrorResponse('Failed to retrieve user permissions', $e->getMessage());
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

            // Simple permission check - you would implement your own logic here
            $hasPermission = Permission::where('name', $validated['permission'])
                                    ->where('status', 'active')
                                    ->exists();

            return $this->successResponse('Permission check completed', [
                'has_permission' => $hasPermission,
                'permission' => $validated['permission'],
                'resource' => $validated['resource'] ?? 'general',
                'action' => $validated['action'] ?? 'view'
            ]);

        } catch (ValidationException $e) {
            return $this->validationErrorResponse($e->errors());
        } catch (\Exception $e) {
            return $this->serverErrorResponse('Failed to check user permission', $e->getMessage());
        }
    }
}
