<?php

namespace App\Services\Admin;

use App\Models\Permission;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class PermissionManagementService
{
    /**
     * Get paginated permissions with filters and search.
     */
    public function getPaginatedPermissions(
        int $page = 1,
        int $perPage = 15,
        array $filters = [],
        string $sortBy = 'created_at',
        string $sortOrder = 'desc'
    ): LengthAwarePaginator {
        $query = Permission::with(['organization', 'roles']);

        // Apply filters
        $this->applyFilters($query, $filters);

        // Apply sorting
        $query->orderBy($sortBy, $sortOrder);

        return $query->paginate($perPage, ['*'], 'page', $page);
    }

    /**
     * Get permission with all details.
     */
    public function getPermissionWithDetails(string $permissionId): ?Permission
    {
        return Permission::with([
            'organization',
            'roles',
            'rolePermissions.role'
        ])->find($permissionId);
    }

    /**
     * Create a new permission.
     */
    public function createPermission(array $permissionData, User $admin): Permission
    {
        DB::beginTransaction();

        try {
            // Generate UUID if not provided
            if (!isset($permissionData['id'])) {
                $permissionData['id'] = Str::uuid();
            }

            // Create permission
            $permission = Permission::create($permissionData);

            DB::commit();

            Log::info('Permission created successfully', [
                'permission_id' => $permission->id,
                'name' => $permission->name,
                'created_by' => $admin->id
            ]);

            return $permission->load(['organization', 'roles']);

        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Update permission information.
     */
    public function updatePermission(string $permissionId, array $permissionData, User $admin): ?Permission
    {
        DB::beginTransaction();

        try {
            $permission = Permission::find($permissionId);

            if (!$permission) {
                return null;
            }

            // Prevent updating system permissions
            if ($permission->is_system_permission) {
                throw new \Exception('Cannot update system permissions');
            }

            // Update permission
            $permission->update($permissionData);

            DB::commit();

            Log::info('Permission updated successfully', [
                'permission_id' => $permission->id,
                'updated_by' => $admin->id,
                'updated_fields' => array_keys($permissionData)
            ]);

            return $permission->load(['organization', 'roles']);

        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Delete permission.
     */
    public function deletePermission(string $permissionId, User $admin): bool
    {
        $permission = Permission::find($permissionId);

        if (!$permission) {
            return false;
        }

        // Prevent deleting system permissions
        if ($permission->is_system_permission) {
            throw new \Exception('Cannot delete system permissions');
        }

        // Check if permission is assigned to roles
        if ($permission->roles()->count() > 0) {
            throw new \Exception('Cannot delete permission that is assigned to roles');
        }

        // Delete permission
        $permission->delete();

        Log::info('Permission deleted successfully', [
            'permission_id' => $permission->id,
            'deleted_by' => $admin->id
        ]);

        return true;
    }

    /**
     * Get permission statistics.
     */
    public function getPermissionStatistics(): array
    {
        $totalPermissions = Permission::count();
        $systemPermissions = Permission::where('is_system_permission', true)->count();
        $customPermissions = Permission::where('is_system_permission', false)->count();
        $activePermissions = Permission::where('status', 'active')->count();
        $inactivePermissions = Permission::where('status', 'inactive')->count();

        // Resource statistics
        $resourceStats = DB::table('permissions')
            ->select('resource', DB::raw('count(*) as count'))
            ->groupBy('resource')
            ->get()
            ->keyBy('resource');

        // Action statistics
        $actionStats = DB::table('permissions')
            ->select('action', DB::raw('count(*) as count'))
            ->groupBy('action')
            ->get()
            ->keyBy('action');

        // Scope statistics
        $scopeStats = DB::table('permissions')
            ->select('scope', DB::raw('count(*) as count'))
            ->groupBy('scope')
            ->get()
            ->keyBy('scope');

        // Permissions with roles
        $permissionsWithRoles = Permission::whereHas('roles')->count();
        $permissionsWithoutRoles = Permission::whereDoesntHave('roles')->count();

        return [
            'total_permissions' => $totalPermissions,
            'system_permissions' => $systemPermissions,
            'custom_permissions' => $customPermissions,
            'active_permissions' => $activePermissions,
            'inactive_permissions' => $inactivePermissions,
            'resource_statistics' => $resourceStats,
            'action_statistics' => $actionStats,
            'scope_statistics' => $scopeStats,
            'permissions_with_roles' => $permissionsWithRoles,
            'permissions_without_roles' => $permissionsWithoutRoles,
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

        if (!empty($filters['resource'])) {
            $query->where('resource', $filters['resource']);
        }

        if (!empty($filters['action'])) {
            $query->where('action', $filters['action']);
        }

        if (!empty($filters['scope'])) {
            $query->where('scope', $filters['scope']);
        }

        if (isset($filters['is_system_permission'])) {
            $query->where('is_system_permission', $filters['is_system_permission']);
        }

        if (!empty($filters['organization_id'])) {
            $query->where('organization_id', $filters['organization_id']);
        }
    }
}
