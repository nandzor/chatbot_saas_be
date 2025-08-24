<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\Role\UpdateRoleRequest;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class RoleManagementController extends BaseApiController
{
    /**
     * Get paginated list of roles with filters and search.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $pagination = $this->getPaginationParams($request);
            $filters = $this->getFilterParams($request, [
                'search', 'scope', 'is_system_role', 'organization_id'
            ]);

            $query = Role::query();

            // Apply filters
            if (!empty($filters['search'])) {
                $query->where('name', 'like', '%' . $filters['search'] . '%');
            }

            if (!empty($filters['scope'])) {
                $query->where('scope', $filters['scope']);
            }

            if (isset($filters['is_system_role'])) {
                $query->where('is_system_role', $filters['is_system_role']);
            }

            if (!empty($filters['organization_id'])) {
                $query->where('organization_id', $filters['organization_id']);
            }

            $roles = $query->paginate($pagination['per_page'], ['*'], 'page', $pagination['page']);

            return $this->successResponse(
                'Roles retrieved successfully',
                $roles->items(),
                200,
                [
                    'pagination' => [
                        'current_page' => $roles->currentPage(),
                        'per_page' => $roles->perPage(),
                        'total' => $roles->total(),
                        'last_page' => $roles->lastPage()
                    ]
                ]
            );

        } catch (\Exception $e) {
            return $this->serverErrorResponse('Failed to retrieve roles', $e->getMessage());
        }
    }

    /**
     * Get specific role details.
     */
    public function show(string $roleId): JsonResponse
    {
        try {
            $role = Role::with(['users', 'permissions'])->find($roleId);

            if (!$role) {
                return $this->notFoundResponse('Role not found');
            }

            return $this->successResponse('Role retrieved successfully', $role);

        } catch (\Exception $e) {
            return $this->serverErrorResponse('Failed to retrieve role', $e->getMessage());
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
                'scope' => 'required|string|in:global,organization,user',
                'is_system_role' => 'boolean',
                'organization_id' => 'nullable|integer|exists:organizations,id'
            ]);

            $role = Role::create($validated);

            return $this->createdResponse('Role created successfully', $role);

        } catch (ValidationException $e) {
            return $this->validationErrorResponse($e->errors());
        } catch (\Exception $e) {
            return $this->serverErrorResponse('Failed to create role', $e->getMessage());
        }
    }

    /**
     * Update the specified role.
     */
    public function update(UpdateRoleRequest $request, string $roleId): JsonResponse
    {
        try {
            $role = Role::find($roleId);

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
            $role->update($validated);
            $role->refresh();

            // Log the update action
            $this->logApiAction('role_updated', [
                'role_id' => $role->id,
                'role_name' => $role->name,
                'updated_by' => $this->getCurrentUser()?->id,
                'changes' => $validated
            ]);

            // Return enhanced update response with role data in message field
            return $this->updatedResponse(
                data: 'Role updated successfully',
                message: json_encode($role->toArray()),
                meta: [
                    'execution_time_ms' => microtime(true) - LARAVEL_START,
                    'memory_usage_mb' => memory_get_usage(true) / 1024 / 1024,
                    'queries_count' => 0
                ]
            );

        } catch (ValidationException $e) {
            return $this->validationErrorResponse($e->errors());
        } catch (\Exception $e) {
            return $this->serverErrorResponse('Failed to update role', $e->getMessage());
        }
    }

    /**
     * Remove the specified role.
     */
    public function destroy(string $roleId): JsonResponse
    {
        try {
            $role = Role::find($roleId);

            if (!$role) {
                return $this->notFoundResponse('Role not found');
            }

            $role->delete();

            return $this->deletedResponse('Role deleted successfully');

        } catch (\Exception $e) {
            return $this->serverErrorResponse('Failed to delete role', $e->getMessage());
        }
    }

    /**
     * Get available roles for assignment.
     */
    public function getAvailableRoles(): JsonResponse
    {
        try {
            $roles = Role::where('is_system_role', false)
                        ->where('scope', '!=', 'global')
                        ->get(['id', 'name', 'description', 'scope']);

            return $this->successResponse('Available roles retrieved successfully', $roles);

        } catch (\Exception $e) {
            return $this->serverErrorResponse('Failed to retrieve available roles', $e->getMessage());
        }
    }

    /**
     * Get users assigned to a specific role.
     */
    public function getUsers(string $roleId): JsonResponse
    {
        try {
            $role = Role::with('users')->find($roleId);

            if (!$role) {
                return $this->notFoundResponse('Role not found');
            }

            return $this->successResponse('Role users retrieved successfully', $role->users);

        } catch (\Exception $e) {
            return $this->serverErrorResponse('Failed to retrieve role users', $e->getMessage());
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
                'role_id' => 'required|integer|exists:roles,id'
            ]);

            $user = User::find($validated['user_id']);
            $role = Role::find($validated['role_id']);

            if (!$user || !$role) {
                return $this->notFoundResponse('User or role not found');
            }

            // Simple role assignment - you might want to use a pivot table
            $user->role = $role->name;
            $user->save();

            return $this->successResponse('Role assigned to user successfully');

        } catch (ValidationException $e) {
            return $this->validationErrorResponse($e->errors());
        } catch (\Exception $e) {
            return $this->serverErrorResponse('Failed to assign role to user', $e->getMessage());
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
                'role_id' => 'required|integer|exists:roles,id'
            ]);

            $user = User::find($validated['user_id']);
            $role = Role::find($validated['role_id']);

            if (!$user || !$role) {
                return $this->notFoundResponse('User or role not found');
            }

            // Simple role revocation
            if ($user->role === $role->name) {
                $user->role = null;
                $user->save();
            }

            return $this->successResponse('Role revoked from user successfully');

        } catch (ValidationException $e) {
            return $this->validationErrorResponse($e->errors());
        } catch (\Exception $e) {
            return $this->serverErrorResponse('Failed to revoke role from user', $e->getMessage());
        }
    }

    /**
     * Get role statistics.
     */
    public function statistics(): JsonResponse
    {
        try {
            $statistics = [
                'total_roles' => Role::count(),
                'system_roles' => Role::where('is_system_role', true)->count(),
                'custom_roles' => Role::where('is_system_role', false)->count(),
                'global_roles' => Role::where('scope', 'global')->count(),
                'organization_roles' => Role::where('scope', 'organization')->count(),
                'user_roles' => Role::where('scope', 'user')->count(),
                'roles_with_users' => Role::has('users')->count()
            ];

            return $this->successResponse('Role statistics retrieved successfully', $statistics);

        } catch (\Exception $e) {
            return $this->serverErrorResponse('Failed to retrieve role statistics', $e->getMessage());
        }
    }
}
