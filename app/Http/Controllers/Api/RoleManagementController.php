<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Role\StoreRoleRequest;
use App\Http\Requests\Role\UpdateRoleRequest;
use App\Http\Requests\Role\AssignRoleRequest;
use App\Http\Requests\Role\RevokeRoleRequest;
use App\Http\Resources\Role\RoleResource;
use App\Http\Resources\Role\RoleCollection;
use App\Http\Resources\User\UserResource;
use App\Models\Role;
use App\Models\User;
use App\Models\UserRole;
use App\Services\RoleManagementService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class RoleManagementController extends Controller
{
    protected RoleManagementService $roleService;

    public function __construct(RoleManagementService $roleService)
    {
        $this->roleService = $roleService;
    }

    /**
     * Get all roles with pagination and filters
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $roles = $this->roleService->getRoles($request);

            return response()->json([
                'success' => true,
                'message' => 'Roles retrieved successfully',
                'data' => new RoleCollection($roles),
                'meta' => [
                    'total' => $roles->total(),
                    'per_page' => $roles->perPage(),
                    'current_page' => $roles->currentPage(),
                    'last_page' => $roles->lastPage(),
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Error retrieving roles: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve roles',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Get a specific role with its permissions and users
     */
    public function show(string $id): JsonResponse
    {
        try {
            $role = $this->roleService->getRoleWithDetails($id);

            if (!$role) {
                return response()->json([
                    'success' => false,
                    'message' => 'Role not found'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => 'Role retrieved successfully',
                'data' => new RoleResource($role)
            ]);
        } catch (\Exception $e) {
            Log::error('Error retrieving role: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve role',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Create a new role
     */
    public function store(StoreRoleRequest $request): JsonResponse
    {
        try {
            DB::beginTransaction();

            $role = $this->roleService->createRole($request->validated());

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Role created successfully',
                'data' => new RoleResource($role)
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error creating role: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to create role',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Update an existing role
     */
    public function update(UpdateRoleRequest $request, string $id): JsonResponse
    {
        try {
            DB::beginTransaction();

            $role = $this->roleService->updateRole($id, $request->validated());

            if (!$role) {
                return response()->json([
                    'success' => false,
                    'message' => 'Role not found'
                ], 404);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Role updated successfully',
                'data' => new RoleResource($role)
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error updating role: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to update role',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Delete a role
     */
    public function destroy(string $id): JsonResponse
    {
        try {
            DB::beginTransaction();

            $deleted = $this->roleService->deleteRole($id);

            if (!$deleted) {
                return response()->json([
                    'success' => false,
                    'message' => 'Role not found or cannot be deleted'
                ], 404);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Role deleted successfully'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error deleting role: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to delete role',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Get users assigned to a specific role
     */
    public function getUsers(string $roleId): JsonResponse
    {
        try {
            $users = $this->roleService->getUsersByRole($roleId);

            return response()->json([
                'success' => true,
                'message' => 'Users retrieved successfully',
                'data' => UserResource::collection($users),
                'meta' => [
                    'total' => $users->count(),
                    'role_id' => $roleId
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Error retrieving users for role: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve users for role',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Assign role to user(s)
     */
    public function assignRole(AssignRoleRequest $request): JsonResponse
    {
        try {
            DB::beginTransaction();

            $result = $this->roleService->assignRoleToUsers(
                $request->role_id,
                $request->user_ids,
                $request->validated()
            );

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Role assigned successfully',
                'data' => [
                    'assigned_count' => $result['assigned_count'],
                    'already_assigned_count' => $result['already_assigned_count'],
                    'failed_count' => $result['failed_count'],
                    'users' => UserResource::collection($result['users'])
                ]
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error assigning role: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to assign role',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Revoke role from user(s)
     */
    public function revokeRole(RevokeRoleRequest $request): JsonResponse
    {
        try {
            DB::beginTransaction();

            $result = $this->roleService->revokeRoleFromUsers(
                $request->role_id,
                $request->user_ids
            );

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Role revoked successfully',
                'data' => [
                    'revoked_count' => $result['revoked_count'],
                    'not_assigned_count' => $result['not_assigned_count'],
                    'failed_count' => $result['failed_count']
                ]
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error revoking role: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to revoke role',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Get available roles for assignment
     */
    public function getAvailableRoles(): JsonResponse
    {
        try {
            $roles = $this->roleService->getAvailableRoles();

            return response()->json([
                'success' => true,
                'message' => 'Available roles retrieved successfully',
                'data' => RoleResource::collection($roles)
            ]);
        } catch (\Exception $e) {
            Log::error('Error retrieving available roles: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve available roles',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Get role statistics
     */
    public function statistics(): JsonResponse
    {
        try {
            $stats = $this->roleService->getRoleStatistics();

            return response()->json([
                'success' => true,
                'message' => 'Role statistics retrieved successfully',
                'data' => $stats
            ]);
        } catch (\Exception $e) {
            Log::error('Error retrieving role statistics: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve role statistics',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }
}
