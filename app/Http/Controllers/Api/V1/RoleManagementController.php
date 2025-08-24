<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\V1\BaseController;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class RoleManagementController extends BaseController
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

            return $this->paginatedResponse(
                'Roles retrieved successfully',
                $roles->items(),
                [
                    'current_page' => $roles->currentPage(),
                    'per_page' => $roles->perPage(),
                    'total' => $roles->total(),
                    'last_page' => $roles->lastPage()
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
            return $this->validationErrorResponse($e);
        } catch (\Exception $e) {
            return $this->serverErrorResponse('Failed to create role', $e->getMessage());
        }
    }

    /**
     * Update the specified role.
     */
    public function update(Request $request, string $roleId): JsonResponse
    {
        try {
            $role = Role::find($roleId);

            if (!$role) {
                return $this->notFoundResponse('Role not found');
            }

            $validated = $request->validate([
                'name' => 'sometimes|string|max:255|unique:roles,name,' . $roleId,
                'description' => 'nullable|string',
                'scope' => 'sometimes|string|in:global,organization,user',
                'is_system_role' => 'boolean',
                'organization_id' => 'nullable|integer|exists:organizations,id'
            ]);

            $role->update($validated);
            $role->refresh();

            return $this->updatedResponse('Role updated successfully', $role);

        } catch (ValidationException $e) {
            return $this->validationErrorResponse($e);
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
            return $this->validationErrorResponse($e);
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
            return $this->validationErrorResponse($e);
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
