<?php

namespace App\Services\Admin;

use App\Models\Role;
use App\Models\Permission;
use App\Models\RolePermission;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class RoleManagementService
{
    /**
     * Get paginated roles with filters and search.
     */
    public function getPaginatedRoles(
        int $page = 1,
        int $perPage = 15,
        array $filters = [],
        string $sortBy = 'created_at',
        string $sortOrder = 'desc'
    ): LengthAwarePaginator {
        $query = Role::with([
            'organization',
            'permissions',
            'parent',
            'children',
            'users'
        ]);

        // Apply filters
        $this->applyFilters($query, $filters);

        // Apply sorting
        $query->orderBy($sortBy, $sortOrder);

        return $query->paginate($perPage, ['*'], 'page', $page);
    }

    /**
     * Get role with all details.
     */
    public function getRoleWithDetails(string $roleId): ?Role
    {
        return Role::with([
            'organization',
            'permissions',
            'parent',
            'children',
            'users',
            'rolePermissions.permission'
        ])->find($roleId);
    }

    /**
     * Create a new role.
     */
    public function createRole(array $roleData, User $admin): Role
    {
        DB::beginTransaction();

        try {
            // Generate UUID if not provided
            if (!isset($roleData['id'])) {
                $roleData['id'] = Str::uuid();
            }

            // Create role
            $role = Role::create($roleData);

            // Assign permissions if provided
            if (isset($roleData['permissions']) && is_array($roleData['permissions'])) {
                $this->assignPermissionsToRole($role, $roleData['permissions'], $admin);
            }

            DB::commit();

            Log::info('Role created successfully', [
                'role_id' => $role->id,
                'name' => $role->name,
                'created_by' => $admin->id
            ]);

            return $role->load(['organization', 'permissions', 'parent', 'children']);

        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Update role information.
     */
    public function updateRole(string $roleId, array $roleData, User $admin): ?Role
    {
        DB::beginTransaction();

        try {
            $role = Role::find($roleId);

            if (!$role) {
                return null;
            }

            // Prevent updating system roles
            if ($role->is_system_role) {
                throw new \Exception('Cannot update system roles');
            }

            // Update role
            $role->update($roleData);

            // Update permissions if provided
            if (isset($roleData['permissions']) && is_array($roleData['permissions'])) {
                $this->updateRolePermissions($role, $roleData['permissions'], $admin);
            }

            DB::commit();

            Log::info('Role updated successfully', [
                'role_id' => $role->id,
                'updated_by' => $admin->id,
                'updated_fields' => array_keys($roleData)
            ]);

            return $role->load(['organization', 'permissions', 'parent', 'children']);

        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Delete role.
     */
    public function deleteRole(string $roleId, User $admin): bool
    {
        $role = Role::find($roleId);

        if (!$role) {
            return false;
        }

        // Prevent deleting system roles
        if ($role->is_system_role) {
            throw new \Exception('Cannot delete system roles');
        }

        // Check if role has users
        if ($role->users()->count() > 0) {
            throw new \Exception('Cannot delete role that has assigned users');
        }

        // Delete role permissions
        $role->permissions()->detach();

        // Delete role
        $role->delete();

        Log::info('Role deleted successfully', [
            'role_id' => $role->id,
            'deleted_by' => $admin->id
        ]);

        return true;
    }

    /**
     * Assign permissions to role.
     */
    public function assignPermissionsToRole(string $roleId, array $permissionIds, User $admin): ?Role
    {
        $role = Role::find($roleId);

        if (!$role) {
            return null;
        }

        // Validate permissions exist
        $permissions = Permission::whereIn('id', $permissionIds)->get();
        
        if ($permissions->count() !== count($permissionIds)) {
            throw new \Exception('One or more permissions do not exist');
        }

        // Assign permissions
        foreach ($permissionIds as $permissionId) {
            RolePermission::updateOrCreate(
                [
                    'role_id' => $role->id,
                    'permission_id' => $permissionId
                ],
                [
                    'is_granted' => true,
                    'is_inherited' => false,
                    'granted_by' => $admin->id,
                    'granted_at' => now()
                ]
            );
        }

        Log::info('Permissions assigned to role', [
            'role_id' => $role->id,
            'permission_count' => count($permissionIds),
            'assigned_by' => $admin->id
        ]);

        return $role->load(['permissions', 'rolePermissions.permission']);
    }

    /**
     * Remove permissions from role.
     */
    public function removePermissionsFromRole(string $roleId, array $permissionIds, User $admin): ?Role
    {
        $role = Role::find($roleId);

        if (!$role) {
            return null;
        }

        // Remove permissions
        RolePermission::where('role_id', $role->id)
            ->whereIn('permission_id', $permissionIds)
            ->delete();

        Log::info('Permissions removed from role', [
            'role_id' => $role->id,
            'permission_count' => count($permissionIds),
            'removed_by' => $admin->id
        ]);

        return $role->load(['permissions', 'rolePermissions.permission']);
    }

    /**
     * Clone role with permissions.
     */
    public function cloneRole(string $roleId, array $newRoleData, User $admin): ?Role
    {
        DB::beginTransaction();

        try {
            $originalRole = Role::with('permissions')->find($roleId);

            if (!$originalRole) {
                return null;
            }

            // Create new role data
            $roleData = array_merge($originalRole->toArray(), $newRoleData);
            unset($roleData['id'], $roleData['created_at'], $roleData['updated_at']);

            // Create new role
            $newRole = $this->createRole($roleData, $admin);

            // Clone permissions
            $permissionIds = $originalRole->permissions->pluck('id')->toArray();
            if (!empty($permissionIds)) {
                $this->assignPermissionsToRole($newRole->id, $permissionIds, $admin);
            }

            DB::commit();

            Log::info('Role cloned successfully', [
                'original_role_id' => $originalRole->id,
                'new_role_id' => $newRole->id,
                'cloned_by' => $admin->id
            ]);

            return $newRole->load(['permissions', 'rolePermissions.permission']);

        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Get role statistics.
     */
    public function getRoleStatistics(): array
    {
        $totalRoles = Role::count();
        $systemRoles = Role::where('is_system_role', true)->count();
        $customRoles = Role::where('is_system_role', false)->count();
        $activeRoles = Role::where('status', 'active')->count();
        $inactiveRoles = Role::where('status', 'inactive')->count();

        // Scope statistics
        $scopeStats = DB::table('roles')
            ->select('scope', DB::raw('count(*) as count'))
            ->groupBy('scope')
            ->get()
            ->keyBy('scope');

        // Roles with users
        $rolesWithUsers = Role::whereHas('users')->count();
        $rolesWithoutUsers = Role::whereDoesntHave('users')->count();

        // Roles with permissions
        $rolesWithPermissions = Role::whereHas('permissions')->count();
        $rolesWithoutPermissions = Role::whereDoesntHave('permissions')->count();

        return [
            'total_roles' => $totalRoles,
            'system_roles' => $systemRoles,
            'custom_roles' => $customRoles,
            'active_roles' => $activeRoles,
            'inactive_roles' => $inactiveRoles,
            'scope_statistics' => $scopeStats,
            'roles_with_users' => $rolesWithUsers,
            'roles_without_users' => $rolesWithoutUsers,
            'roles_with_permissions' => $rolesWithPermissions,
            'roles_without_permissions' => $rolesWithoutPermissions,
            'last_updated' => now()->toISOString()
        ];
    }

    /**
     * Apply filters to query.
     */
    private function applyFilters(Builder $query, array $filters): void
    {
        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('code', 'like', "%{$search}%")
                  ->orWhere('display_name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
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
    }

    /**
     * Update role permissions.
     */
    private function updateRolePermissions(Role $role, array $permissionIds, User $admin): void
    {
        // Remove existing permissions
        $role->permissions()->detach();

        // Assign new permissions
        $this->assignPermissionsToRole($role->id, $permissionIds, $admin);
    }
}
