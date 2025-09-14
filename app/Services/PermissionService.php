<?php

namespace App\Services;

use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use App\Models\PermissionGroup;
use App\Models\RolePermission;
use App\Models\UserRole;
use App\Exceptions\PermissionDeniedException;
use App\Exceptions\InvalidPermissionException;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Database\Eloquent\Builder;

class PermissionService extends BaseService
{
    /**
     * Cache TTL for permission checks (5 minutes)
     */
    const CACHE_TTL = 300;

    /**
     * Cache key prefix for user permissions
     */
    const USER_PERMISSIONS_CACHE_PREFIX = 'user_permissions';

    /**
     * Cache key prefix for role permissions
     */
    const ROLE_PERMISSIONS_CACHE_PREFIX = 'role_permissions';

    /**
     * Get all permissions for an organization (null for global permissions)
     */
    public function getOrganizationPermissions(?string $organizationId, array $filters = []): Collection
    {
        $query = Permission::query();

        if ($organizationId !== null) {
            $query->where('organization_id', $organizationId);
        } else {
            $query->whereNull('organization_id');
        }

        // Apply filters
        if (isset($filters['category'])) {
            $query->where('category', $filters['category']);
        }

        if (isset($filters['resource'])) {
            $query->where('resource', $filters['resource']);
        }

        if (isset($filters['is_system'])) {
            $query->where('is_system_permission', $filters['is_system']);
        }

        if (isset($filters['is_visible'])) {
            $query->where('is_visible', $filters['is_visible']);
        }

        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        return $query->orderBy('sort_order')
                    ->orderBy('category')
                    ->orderBy('name')
                    ->get();
    }

    /**
     * Get paginated permissions for an organization
     */
    public function getPaginatedPermissions(?string $organizationId, array $filters = [])
    {
        $query = Permission::query();

        if ($organizationId !== null) {
            $query->where('organization_id', $organizationId);
        } else {
            $query->whereNull('organization_id');
        }

        // Apply filters
        if (isset($filters['category'])) {
            $query->where('category', $filters['category']);
        }

        if (isset($filters['resource'])) {
            $query->where('resource', $filters['resource']);
        }

        if (isset($filters['is_system'])) {
            $query->where('is_system_permission', $filters['is_system']);
        }

        if (isset($filters['is_visible'])) {
            $query->where('is_visible', $filters['is_visible']);
        }

        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        // Apply search
        if (isset($filters['search']) && !empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhere('category', 'like', "%{$search}%")
                  ->orWhere('resource', 'like', "%{$search}%");
            });
        }

        // Apply sorting
        $sortBy = $filters['sort_by'] ?? 'sort_order';
        $sortOrder = $filters['sort_order'] ?? 'asc';

        if (in_array($sortBy, ['name', 'description', 'category', 'resource', 'status', 'created_at', 'updated_at', 'sort_order'])) {
            $query->orderBy($sortBy, $sortOrder);
        } else {
            $query->orderBy('sort_order')->orderBy('category')->orderBy('name');
        }

        // Get pagination parameters
        $perPage = min((int) ($filters['per_page'] ?? 15), 100);
        $page = (int) ($filters['page'] ?? 1);

        return $query->paginate($perPage, ['*'], 'page', $page);
    }

    /**
     * Get permission by ID
     */
    public function getPermissionById(string $permissionId, ?string $organizationId): ?Permission
    {
        $query = Permission::where('id', $permissionId);

        if ($organizationId !== null) {
            $query->where('organization_id', $organizationId);
        } else {
            $query->whereNull('organization_id');
        }

        return $query->first();
    }

    /**
     * Create a new permission
     */
    public function createPermission(array $data, ?string $organizationId): Permission
    {
        $this->validatePermissionData($data);

        // Check if permission code already exists
        $query = Permission::query();

        if ($organizationId !== null) {
            $query->where('organization_id', $organizationId);
        } else {
            $query->whereNull('organization_id');
        }

        $existingPermission = $query->where('code', $data['code'])->first();

        if ($existingPermission) {
            throw new InvalidPermissionException("Permission code '{$data['code']}' already exists in this organization.");
        }

        DB::beginTransaction();
        try {
            $permission = Permission::create([
                'organization_id' => $organizationId,
                'name' => $data['name'],
                'code' => $data['code'],
                'display_name' => $data['display_name'] ?? $data['name'],
                'description' => $data['description'] ?? null,
                'resource' => $data['resource'],
                'action' => $data['action'],
                'scope' => $data['scope'] ?? 'organization',
                'conditions' => $data['conditions'] ?? [],
                'constraints' => $data['constraints'] ?? [],
                'category' => $data['category'] ?? 'general',
                'group_name' => $data['group_name'] ?? null,
                'is_system_permission' => $data['is_system_permission'] ?? false,
                'is_dangerous' => $data['is_dangerous'] ?? false,
                'requires_approval' => $data['requires_approval'] ?? false,
                'sort_order' => $data['sort_order'] ?? 0,
                'is_visible' => $data['is_visible'] ?? true,
                'metadata' => $data['metadata'] ?? [],
                'status' => 'active',
            ]);

            // Clear permission cache
            $this->clearPermissionCache($organizationId);

            DB::commit();
            Log::info("Permission created", ['permission_id' => $permission->id, 'organization_id' => $organizationId]);

            return $permission;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Failed to create permission", ['error' => $e->getMessage(), 'data' => $data]);
            throw $e;
        }
    }

        /**
     * Update an existing permission
     */
    public function updatePermission(string $permissionId, array $data, ?string $organizationId): Permission
    {
        $permission = $this->getPermissionById($permissionId, $organizationId);

        if (!$permission) {
            throw new InvalidPermissionException("Permission not found.");
        }

        if ($permission->is_system_permission) {
            throw new InvalidPermissionException("System permissions cannot be modified.");
        }

        $this->validatePermissionData($data, $permissionId);

        // Check if permission code already exists (excluding current permission)
        if (isset($data['code'])) {
            $query = Permission::query();

            if ($organizationId !== null) {
                $query->where('organization_id', $organizationId);
            } else {
                $query->whereNull('organization_id');
            }

            $existingPermission = $query->where('code', $data['code'])
                                      ->where('id', '!=', $permissionId)
                                      ->first();

            if ($existingPermission) {
                throw new InvalidPermissionException("Permission code '{$data['code']}' already exists in this organization.");
            }
        }

        DB::beginTransaction();
        try {
            $permission->update($data);

            // Clear permission cache
            $this->clearPermissionCache($organizationId);

            DB::commit();
            Log::info("Permission updated", ['permission_id' => $permission->id, 'organization_id' => $organizationId]);

            return $permission->fresh();
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Failed to update permission", ['error' => $e->getMessage(), 'permission_id' => $permissionId]);
            throw $e;
        }
    }

    /**
     * Delete a permission
     */
    public function deletePermission(string $permissionId, ?string $organizationId): bool
    {
        $permission = $this->getPermissionById($permissionId, $organizationId);

        if (!$permission) {
            throw new InvalidPermissionException("Permission not found.");
        }

        if ($permission->is_system_permission) {
            throw new InvalidPermissionException("System permissions cannot be deleted.");
        }

        // Check if permission is assigned to any roles
        $assignedRoles = RolePermission::where('permission_id', $permissionId)->count();
        if ($assignedRoles > 0) {
            throw new InvalidPermissionException("Cannot delete permission that is assigned to roles.");
        }

        DB::beginTransaction();
        try {
            $deleted = $permission->delete();

            if ($deleted) {
                // Clear permission cache
                $this->clearPermissionCache($organizationId);

                DB::commit();
                Log::info("Permission deleted", ['permission_id' => $permissionId, 'organization_id' => $organizationId]);
            }

            return $deleted;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Failed to delete permission", ['error' => $e->getMessage(), 'permission_id' => $permissionId]);
            throw $e;
        }
    }

    /**
     * Get permissions for a specific user
     */
    public function getUserPermissions(string $userId, ?string $organizationId, bool $useCache = true): Collection
    {
        $cacheKey = $this->getUserPermissionsCacheKey($userId, $organizationId);

        if ($useCache && Cache::has($cacheKey)) {
            return Cache::get($cacheKey);
        }

        $permissions = $this->fetchUserPermissions($userId, $organizationId);

        if ($useCache) {
            Cache::put($cacheKey, $permissions, self::CACHE_TTL);
        }

        return $permissions;
    }

    /**
     * Check if user has a specific permission
     */
    public function userHasPermission(string $userId, ?string $organizationId, string $resource, string $action, string $scope = 'organization'): bool
    {
        $permissions = $this->getUserPermissions($userId, $organizationId);

        return $permissions->contains(function ($permission) use ($resource, $action, $scope) {
            return $permission->resource === $resource &&
                   $permission->action === $action &&
                   $permission->scope === $scope;
        });
    }

    /**
     * Check if user has any of the specified permissions
     */
    public function userHasAnyPermission(string $userId, ?string $organizationId, array $permissions): bool
    {
        foreach ($permissions as $permission) {
            if ($this->userHasPermission($userId, $organizationId, $permission['resource'], $permission['action'], $permission['scope'] ?? 'organization')) {
                return true;
            }
        }
        return false;
    }

    /**
     * Check if user has all of the specified permissions
     */
    public function userHasAllPermissions(string $userId, ?string $organizationId, array $permissions): bool
    {
        foreach ($permissions as $permission) {
            if (!$this->userHasPermission($userId, $organizationId, $permission['resource'], $permission['action'], $permission['scope'] ?? 'organization')) {
                return false;
            }
        }
        return true;
    }

    /**
     * Assign permissions to a role
     */
    public function assignPermissionsToRole(string $roleId, array $permissionIds, string $organizationId, ?string $grantedBy = null): bool
    {
        $role = Role::where('id', $roleId)
                    ->where('organization_id', $organizationId)
                    ->first();

        if (!$role) {
            throw new InvalidPermissionException("Role not found.");
        }

        // Verify all permissions exist and belong to the organization
        $permissions = Permission::whereIn('id', $permissionIds)
                                ->where('organization_id', $organizationId)
                                ->get();

        if ($permissions->count() !== count($permissionIds)) {
            throw new InvalidPermissionException("One or more permissions not found or do not belong to this organization.");
        }

        DB::beginTransaction();
        try {
            // Remove existing permissions
            RolePermission::where('role_id', $roleId)->delete();

            // Assign new permissions
            $permissionData = [];
            foreach ($permissionIds as $permissionId) {
                $permissionData[] = [
                    'role_id' => $roleId,
                    'permission_id' => $permissionId,
                    'is_granted' => true,
                    'is_inherited' => false,
                    'granted_by' => $grantedBy,
                    'granted_at' => now(),
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }

            RolePermission::insert($permissionData);

            // Clear role permission cache
            $this->clearRolePermissionCache($roleId);

            DB::commit();
            Log::info("Permissions assigned to role", ['role_id' => $roleId, 'permission_count' => count($permissionIds)]);

            return true;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Failed to assign permissions to role", ['error' => $e->getMessage(), 'role_id' => $roleId]);
            throw $e;
        }
    }

    /**
     * Remove permissions from a role
     */
    public function removePermissionsFromRole(string $roleId, array $permissionIds, string $organizationId): bool
    {
        $role = Role::where('id', $roleId)
                    ->where('organization_id', $organizationId)
                    ->first();

        if (!$role) {
            throw new InvalidPermissionException("Role not found.");
        }

        DB::beginTransaction();
        try {
            $deleted = RolePermission::where('role_id', $roleId)
                                    ->whereIn('permission_id', $permissionIds)
                                    ->delete();

            if ($deleted > 0) {
                // Clear role permission cache
                $this->clearRolePermissionCache($roleId);

                DB::commit();
                Log::info("Permissions removed from role", ['role_id' => $roleId, 'permission_count' => $deleted]);
            }

            return $deleted > 0;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Failed to remove permissions from role", ['error' => $e->getMessage(), 'role_id' => $roleId]);
            throw $e;
        }
    }

    /**
     * Get permissions for a specific role
     */
    public function getRolePermissions(string $roleId, string $organizationId): Collection
    {
        $cacheKey = $this->getRolePermissionsCacheKey($roleId);

        if (Cache::has($cacheKey)) {
            return Cache::get($cacheKey);
        }

        $permissions = Role::with(['permissions' => function ($query) {
            $query->wherePivot('is_granted', true);
        }])
        ->where('id', $roleId)
        ->where('organization_id', $organizationId)
        ->first()
        ->permissions ?? collect();

        Cache::put($cacheKey, $permissions, self::CACHE_TTL);

        return $permissions;
    }

    /**
     * Get permission groups for an organization
     */
    public function getPermissionGroups(?string $organizationId): Collection
    {
        $query = PermissionGroup::query();

        if ($organizationId !== null) {
            $query->where('organization_id', $organizationId);
        } else {
            $query->whereNull('organization_id');
        }

        return $query->with('permissions')
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get();
    }

    /**
     * Create permission group
     */
    public function createPermissionGroup(array $data, ?string $organizationId): PermissionGroup
    {
        $this->validatePermissionGroupData($data);

        // Check if group code already exists
        $existingGroupQuery = PermissionGroup::where('code', $data['code']);
        if ($organizationId !== null) {
            $existingGroupQuery->where('organization_id', $organizationId);
        } else {
            $existingGroupQuery->whereNull('organization_id');
        }
        $existingGroup = $existingGroupQuery->first();

        if ($existingGroup) {
            throw new InvalidPermissionException("Permission group code '{$data['code']}' already exists in this organization.");
        }

        DB::beginTransaction();
        try {
            $group = PermissionGroup::create([
                'organization_id' => $organizationId,
                'name' => $data['name'],
                'code' => $data['code'],
                'display_name' => $data['display_name'] ?? $data['name'],
                'description' => $data['description'] ?? null,
                'category' => $data['category'] ?? 'general',
                'parent_group_id' => $data['parent_group_id'] ?? null,
                'icon' => $data['icon'] ?? null,
                'color' => $data['color'] ?? '#6B7280',
                'sort_order' => $data['sort_order'] ?? 0,
                'status' => 'active',
            ]);

            // Assign permissions to group if provided
            if (isset($data['permission_ids']) && is_array($data['permission_ids'])) {
                $this->assignPermissionsToGroup($group->id, $data['permission_ids'], $organizationId);
            }

            DB::commit();
            Log::info("Permission group created", ['group_id' => $group->id, 'organization_id' => $organizationId]);

            return $group;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Failed to create permission group", ['error' => $e->getMessage(), 'data' => $data]);
            throw $e;
        }
    }

    /**
     * Assign permissions to a group
     */
    public function assignPermissionsToGroup(string $groupId, array $permissionIds, ?string $organizationId): bool
    {
        $groupQuery = PermissionGroup::where('id', $groupId);
        if ($organizationId !== null) {
            $groupQuery->where('organization_id', $organizationId);
        } else {
            $groupQuery->whereNull('organization_id');
        }
        $group = $groupQuery->first();

        if (!$group) {
            throw new InvalidPermissionException("Permission group not found.");
        }

        // Verify all permissions exist and belong to the organization
        $permissionsQuery = Permission::whereIn('id', $permissionIds);
        if ($organizationId !== null) {
            $permissionsQuery->where('organization_id', $organizationId);
        } else {
            $permissionsQuery->whereNull('organization_id');
        }
        $permissions = $permissionsQuery->get();

        if ($permissions->count() !== count($permissionIds)) {
            throw new InvalidPermissionException("One or more permissions not found or do not belong to this organization.");
        }

        DB::beginTransaction();
        try {
            // Remove existing permissions
            $group->permissions()->detach();

            // Assign new permissions
            $group->permissions()->attach($permissionIds);

            DB::commit();
            Log::info("Permissions assigned to group", ['group_id' => $groupId, 'permission_count' => count($permissionIds)]);

            return true;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Failed to assign permissions to group", ['error' => $e->getMessage(), 'group_id' => $groupId]);
            throw $e;
        }
    }

    /**
     * Clear permission cache for a user
     */
    public function clearUserPermissionCache(string $userId, ?string $organizationId): void
    {
        $cacheKey = $this->getUserPermissionsCacheKey($userId, $organizationId);
        Cache::forget($cacheKey);
    }

    /**
     * Clear permission cache for an organization
     */
    public function clearPermissionCache(?string $organizationId): void
    {
        if ($organizationId !== null) {
            // Clear all user permission caches for the organization
            $users = User::where('organization_id', $organizationId)->pluck('id');

            foreach ($users as $userId) {
                $this->clearUserPermissionCache($userId, $organizationId);
            }
        } else {
            // Clear global permission caches for all users
            $users = User::all()->pluck('id');

            foreach ($users as $userId) {
                $this->clearUserPermissionCache($userId, null);
            }
        }
    }

    /**
     * Clear role permission cache
     */
    public function clearRolePermissionCache(string $roleId): void
    {
        $cacheKey = $this->getRolePermissionsCacheKey($roleId);
        Cache::forget($cacheKey);
    }

    /**
     * Validate permission data
     */
    private function validatePermissionData(array $data, ?string $permissionId = null): void
    {
        $rules = [
            'name' => 'required|string|max:100',
            'code' => 'required|string|max:100|regex:/^[a-z_][a-z0-9_]*$/',
            'resource' => 'required|string|max:100',
            'action' => 'required|string|max:100',
            'scope' => 'sometimes|string|in:global,organization,department,team,personal',
            'category' => 'sometimes|string|max:100',
            'sort_order' => 'sometimes|integer|min:0',
        ];

        $validator = validator($data, $rules);

        if ($validator->fails()) {
            throw new InvalidPermissionException($validator->errors()->first());
        }
    }

    /**
     * Validate permission group data
     */
    private function validatePermissionGroupData(array $data): void
    {
        $rules = [
            'name' => 'required|string|max:100',
            'code' => 'required|string|max:50|regex:/^[a-z_][a-z0-9_]*$/',
            'category' => 'sometimes|string|max:100',
            'sort_order' => 'sometimes|integer|min:0',
        ];

        $validator = validator($data, $rules);

        if ($validator->fails()) {
            throw new InvalidPermissionException($validator->errors()->first());
        }
    }

    /**
     * Fetch user permissions from database
     */
    private function fetchUserPermissions(string $userId, ?string $organizationId): Collection
    {
        $query = Permission::select([
                        'permissions.id',
                        'permissions.organization_id',
                        'permissions.name',
                        'permissions.code',
                        'permissions.display_name',
                        'permissions.description',
                        'permissions.resource',
                        'permissions.action',
                        'permissions.scope',
                        'permissions.category',
                        'permissions.group_name',
                        'permissions.is_system_permission',
                        'permissions.is_dangerous',
                        'permissions.requires_approval',
                        'permissions.sort_order',
                        'permissions.is_visible',
                        'permissions.status',
                        'permissions.created_at',
                        'permissions.updated_at'
                    ])
                        ->join('role_permissions', 'permissions.id', '=', 'role_permissions.permission_id')
                        ->join('user_roles', 'role_permissions.role_id', '=', 'user_roles.role_id')
                        ->join('roles', 'user_roles.role_id', '=', 'roles.id')
                        ->where('user_roles.user_id', $userId)
                        ->where('user_roles.is_active', true)
                        ->where('role_permissions.is_granted', true)
                        ->where('permissions.status', 'active')
                        ->where('roles.status', 'active')
                        ->where(function ($query) {
                            $query->whereNull('user_roles.effective_until')
                                  ->orWhere('user_roles.effective_until', '>', now());
                        });

        // Handle organization-specific or global permissions
        if ($organizationId !== null) {
            $query->where('roles.organization_id', $organizationId);
        } else {
            // For global permissions, we need to get permissions from global roles
            $query->whereNull('roles.organization_id');
        }

        return $query->distinct()->get();
    }

    /**
     * Get user permissions cache key
     */
    private function getUserPermissionsCacheKey(string $userId, ?string $organizationId): string
    {
        $orgId = $organizationId ?? 'global';
        return self::USER_PERMISSIONS_CACHE_PREFIX . ":{$orgId}:{$userId}";
    }

    /**
     * Get role permissions cache key
     */
    private function getRolePermissionsCacheKey(string $roleId): string
    {
        return self::ROLE_PERMISSIONS_CACHE_PREFIX . ":{$roleId}";
    }

    /**
     * Get the model for the service.
     */
    protected function getModel(): \Illuminate\Database\Eloquent\Model
    {
        return new Permission();
    }
}
