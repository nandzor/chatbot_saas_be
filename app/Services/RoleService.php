<?php

namespace App\Services;

use App\Models\Role;
use App\Models\User;
use App\Models\UserRole;
use App\Models\Permission;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Illuminate\Pagination\LengthAwarePaginator;

class RoleService extends BaseService
{
    /**
     * Get the model for the service.
     */
    protected function getModel(): \Illuminate\Database\Eloquent\Model
    {
        return new Role();
    }

    /**
     * Get roles with pagination and filters
     */
    public function getRoles(Request $request): LengthAwarePaginator
    {
        // Build optimized raw SQL query with efficient JOINs and subqueries
        $perPage = $request->get('per_page', 15);
        $page = $request->get('page', 1);
        $offset = ($page - 1) * $perPage;

        // Build WHERE conditions dynamically
        $whereConditions = [];
        $bindings = [];

        if ($request->filled('search')) {
            $search = $request->search;
            $whereConditions[] = "(r.name ILIKE ? OR r.code ILIKE ? OR r.display_name ILIKE ?)";
            $bindings = array_merge($bindings, ["%{$search}%", "%{$search}%", "%{$search}%"]);
        }

        if ($request->filled('scope')) {
            $whereConditions[] = "r.scope = ?";
            $bindings[] = $request->scope;
        }

        if ($request->filled('is_system_role')) {
            $whereConditions[] = "r.is_system_role = ?";
            $bindings[] = $request->boolean('is_system_role');
        }

        if ($request->filled('is_active')) {
            $whereConditions[] = "r.status = ?";
            $bindings[] = $request->boolean('is_active') ? 'active' : 'inactive';
        }

        $whereClause = !empty($whereConditions) ? 'WHERE ' . implode(' AND ', $whereConditions) : '';

        // Build ORDER BY clause
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $orderBy = "ORDER BY r.{$sortBy} {$sortOrder}";

        // Main query with efficient JOINs and subqueries including permission data
        $sql = "
            SELECT
                r.*,
                COALESCE(ur_counts.users_count, 0) as users_count,
                COALESCE(rp_counts.permissions_count, 0) as permissions_count,
                COALESCE(ur_active.current_users, 0) as current_users
            FROM roles r
            LEFT JOIN (
                SELECT
                    role_id,
                    COUNT(*) as users_count
                FROM user_roles
                GROUP BY role_id
            ) ur_counts ON r.id = ur_counts.role_id
            LEFT JOIN (
                SELECT
                    role_id,
                    COUNT(*) as permissions_count
                FROM role_permissions
                WHERE is_granted = true
                GROUP BY role_id
            ) rp_counts ON r.id = rp_counts.role_id
            LEFT JOIN (
                SELECT
                    role_id,
                    COUNT(*) as current_users
                FROM user_roles
                WHERE is_active = true
                AND (effective_until IS NULL OR effective_until > NOW())
                GROUP BY role_id
            ) ur_active ON r.id = ur_active.role_id
            {$whereClause}
            {$orderBy}
            LIMIT ? OFFSET ?
        ";

        // Add pagination bindings
        $bindings[] = $perPage;
        $bindings[] = $offset;

                // Execute the query
        $roles = DB::select($sql, $bindings);

        // Fetch permissions for all roles in a single query for efficiency
        $roleIds = collect($roles)->pluck('id')->toArray();
        $permissionsData = [];

        if (!empty($roleIds)) {
            $permissionsSql = "
                SELECT
                    rp.role_id,
                    p.id,
                    p.name,
                    p.code,
                    p.display_name,
                    p.description,
                    p.category,
                    p.resource,
                    p.action,
                    p.is_system_permission,
                    p.is_dangerous,
                    p.requires_approval,
                    p.is_visible,
                    p.sort_order,
                    p.metadata,
                    rp.is_granted,
                    rp.is_inherited,
                    rp.granted_at,
                    rp.granted_by
                FROM role_permissions rp
                INNER JOIN permissions p ON rp.permission_id = p.id
                WHERE rp.role_id IN (" . str_repeat('?,', count($roleIds) - 1) . "?)
                AND rp.is_granted = true
                ORDER BY rp.role_id, p.category, p.name
            ";

            $permissionsResult = DB::select($permissionsSql, $roleIds);

            // Group permissions by role_id
            foreach ($permissionsResult as $permission) {
                $permissionsData[$permission->role_id][] = [
                    'id' => $permission->id,
                    'name' => $permission->name,
                    'code' => $permission->code,
                    'display_name' => $permission->display_name,
                    'description' => $permission->description,
                    'category' => $permission->category,
                    'resource' => $permission->resource,
                    'action' => $permission->action,
                    'is_system_permission' => $permission->is_system_permission,
                    'is_dangerous' => $permission->is_dangerous,
                    'requires_approval' => $permission->requires_approval,
                    'is_visible' => $permission->is_visible,
                    'sort_order' => $permission->sort_order,
                    'metadata' => json_decode($permission->metadata, true) ?: [],
                    'is_granted' => $permission->is_granted,
                    'is_inherited' => $permission->is_inherited,
                    'granted_at' => $permission->granted_at,
                    'granted_by' => $permission->granted_by
                ];
            }
        }

        // Attach permissions to each role
        $roles = collect($roles)->map(function ($role) use ($permissionsData) {
            $role->permissions = $permissionsData[$role->id] ?? [];
            return $role;
        });

        // Get total count for pagination (without pagination bindings)
        $countBindings = array_slice($bindings, 0, -2);
        $countSql = "
            SELECT COUNT(*) as total
            FROM roles r
            {$whereClause}
        ";

        $totalResult = DB::select($countSql, $countBindings);
        $total = $totalResult[0]->total;

        // Create paginator manually
        $rolesCollection = collect($roles);

        return new LengthAwarePaginator(
            $rolesCollection,
            $total,
            $perPage,
            $page,
            [
                'path' => $request->url(),
                'pageName' => 'page',
            ]
        );
    }

    /**
     * Get role with details
     */
    public function getRoleWithDetails(string $id): ?Role
    {
        // Validate UUID format before database query
        if (!preg_match('/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i', $id)) {
            return null;
        }

        return Role::with([
            'permissions' => function ($query) {
                $query->wherePivot('is_granted', true);
            },
            'users' => function ($query) {
                $query->with('organization');
            }
        ])
        ->withCount(['users'])
        ->addSelect([
            'permissions_count' => DB::table('role_permissions')
                ->selectRaw('COUNT(*)')
                ->whereColumn('role_permissions.role_id', 'roles.id')
                ->where('role_permissions.is_granted', true)
        ])
        ->find($id);
    }

    /**
     * Create a new role
     */
    public function createRole(array $data): Role
    {
        // Generate UUID if not provided
        if (!isset($data['id'])) {
            $data['id'] = Str::uuid();
        }

        // Create role
        $role = Role::create($data);

        // Attach permissions if provided
        if (isset($data['permission_ids']) && is_array($data['permission_ids'])) {
            $role->permissions()->attach($data['permission_ids']);
        }

        // Log the action
        Log::info('Role created', [
            'role_id' => $role->id,
            'role_name' => $role->name,
            'created_by' => Auth::user()->id
        ]);

        return $role->load(['permissions', 'users']);
    }

    /**
     * Update an existing role
     */
    public function updateRole(string $id, array $data): ?Role
    {
        // Validate UUID format before database query
        if (!preg_match('/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i', $id)) {
            return null;
        }

        $role = Role::find($id);

        if (!$role) {
            return null;
        }

        // Prevent updating system roles
        if ($role->is_system_role) {
            throw new \Exception('System roles cannot be modified');
        }

        // Update role
        $role->update($data);

        // Update permissions if provided
        if (isset($data['permission_ids'])) {
            $role->permissions()->sync($data['permission_ids']);
        }

        // Log the action
        Log::info('Role updated', [
            'role_id' => $role->id,
            'role_name' => $role->name,
            'updated_by' => Auth::user()->id
        ]);

        return $role->load(['permissions', 'users']);
    }

    /**
     * Delete a role
     */
    public function deleteRole(string $id): bool
    {
        $role = Role::find($id);

        if (!$role) {
            return false;
        }

        // Prevent deleting system roles
        if ($role->is_system_role) {
            throw new \Exception('System roles cannot be deleted');
        }

        // Check if role has users
        if ($role->users()->count() > 0) {
            throw new \Exception('Cannot delete role with assigned users');
        }

        // Delete role
        $deleted = $role->delete();

        if ($deleted) {
            Log::info('Role deleted', [
                'role_id' => $role->id,
                'role_name' => $role->name,
                'deleted_by' => Auth::user()->id
            ]);
        }

        return $deleted;
    }

    /**
     * Get users by role
     */
    public function getUsersByRole(string $roleId): \Illuminate\Database\Eloquent\Collection
    {
        $role = Role::find($roleId);

        if (!$role) {
            return collect();
        }

        return $role->users()
            ->with(['organization', 'roles'])
            ->get();
    }

    /**
     * Assign role to users
     */
    public function assignRoleToUsers(string $roleId, array $userIds, array $options = []): array
    {
        $role = Role::find($roleId);

        if (!$role) {
            throw new \Exception('Role not found');
        }

        $users = User::whereIn('id', $userIds)->get();
        $assignedCount = 0;
        $alreadyAssignedCount = 0;
        $failedCount = 0;
        $assignedUsers = collect();

        foreach ($users as $user) {
            try {
                // Check if role is already assigned
                $existingAssignment = UserRole::where('user_id', $user->id)
                    ->where('role_id', $roleId)
                    ->first();

                if ($existingAssignment) {
                    $alreadyAssignedCount++;
                    continue;
                }

                // Assign role
                UserRole::create([
                    'id' => Str::uuid(),
                    'user_id' => $user->id,
                    'role_id' => $roleId,
                    'is_active' => $options['is_active'] ?? true,
                    'is_primary' => $options['is_primary'] ?? false,
                    'scope' => $options['scope'] ?? 'organization',
                    'scope_context' => $options['scope_context'] ?? ['organization_id' => $user->organization_id],
                    'effective_from' => $options['effective_from'] ?? now(),
                    'effective_until' => $options['effective_until'] ?? null,
                    'assigned_by' => Auth::user()->id,
                    'assigned_reason' => $options['assigned_reason'] ?? null
                ]);

                $assignedCount++;
                $assignedUsers->push($user);

                Log::info('Role assigned to user', [
                    'role_id' => $roleId,
                    'role_name' => $role->name,
                    'user_id' => $user->id,
                    'user_email' => $user->email,
                    'assigned_by' => Auth::user()->id
                ]);

            } catch (\Exception $e) {
                $failedCount++;
                Log::error('Failed to assign role to user', [
                    'role_id' => $roleId,
                    'user_id' => $user->id,
                    'error' => $e->getMessage()
                ]);
            }
        }

        return [
            'assigned_count' => $assignedCount,
            'already_assigned_count' => $alreadyAssignedCount,
            'failed_count' => $failedCount,
            'users' => $assignedUsers
        ];
    }

    /**
     * Revoke role from users
     */
    public function revokeRoleFromUsers(string $roleId, array $userIds): array
    {
        $role = Role::find($roleId);

        if (!$role) {
            throw new \Exception('Role not found');
        }

        $revokedCount = 0;
        $notAssignedCount = 0;
        $failedCount = 0;

        foreach ($userIds as $userId) {
            try {
                $userRole = UserRole::where('user_id', $userId)
                    ->where('role_id', $roleId)
                    ->first();

                if (!$userRole) {
                    $notAssignedCount++;
                    continue;
                }

                // Prevent revoking primary roles without replacement
                if ($userRole->is_primary) {
                    $otherPrimaryRoles = UserRole::where('user_id', $userId)
                        ->where('is_primary', true)
                        ->where('role_id', '!=', $roleId)
                        ->count();

                    if ($otherPrimaryRoles === 0) {
                        throw new \Exception('Cannot revoke primary role without replacement');
                    }
                }

                $userRole->delete();
                $revokedCount++;

                Log::info('Role revoked from user', [
                    'role_id' => $roleId,
                    'role_name' => $role->name,
                    'user_id' => $userId,
                    'revoked_by' => Auth::user()->id
                ]);

            } catch (\Exception $e) {
                $failedCount++;
                Log::error('Failed to revoke role from user', [
                    'role_id' => $roleId,
                    'user_id' => $userId,
                    'error' => $e->getMessage()
                ]);
            }
        }

        return [
            'revoked_count' => $revokedCount,
            'not_assigned_count' => $notAssignedCount,
            'failed_count' => $failedCount
        ];
    }

    /**
     * Get available roles for assignment
     */
    public function getAvailableRoles(): \Illuminate\Database\Eloquent\Collection
    {
        return Role::where('status', 'active')
            ->where('is_system_role', false)
            ->orderBy('name')
            ->get();
    }

    /**
     * Get role statistics
     */
    public function getRoleStatistics(): array
    {
        $totalRoles = Role::count();
        $activeRoles = Role::where('status', 'active')->count();
        $systemRoles = Role::where('is_system_role', true)->count();
        $customRoles = Role::where('is_system_role', false)->count();

        $rolesWithUsers = Role::has('users')->count();
        $rolesWithPermissions = Role::has('permissions')->count();

        $topRoles = Role::withCount('users')
            ->orderBy('users_count', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($role) {
                return [
                    'id' => $role->id,
                    'name' => $role->name,
                    'user_count' => $role->users_count
                ];
            });

        return [
            'total_roles' => $totalRoles,
            'active_roles' => $activeRoles,
            'system_roles' => $systemRoles,
            'custom_roles' => $customRoles,
            'roles_with_users' => $rolesWithUsers,
            'roles_with_permissions' => $rolesWithPermissions,
            'top_roles' => $topRoles
        ];
    }

    /**
     * Get permissions for role assignment
     */
    public function getPermissionsForRole(): \Illuminate\Database\Eloquent\Collection
    {
        return Permission::where('status', 'active')
            ->orderBy('category')
            ->orderBy('name')
            ->get()
            ->groupBy('category');
    }

    /**
     * Validate role assignment
     */
    public function validateRoleAssignment(string $roleId, array $userIds): array
    {
        $errors = [];
        $warnings = [];

        $role = Role::find($roleId);
        if (!$role) {
            $errors[] = 'Role not found';
            return compact('errors', 'warnings');
        }

        if (!$role->is_active) {
            $warnings[] = 'Role is inactive';
        }

        $users = User::whereIn('id', $userIds)->get();

        foreach ($users as $user) {
            // Check if user already has this role
            $existingRole = UserRole::where('user_id', $user->id)
                ->where('role_id', $roleId)
                ->first();

            if ($existingRole) {
                $warnings[] = "User {$user->email} already has this role";
            }

            // Check if user is active
            if ($user->status !== 'active') {
                $warnings[] = "User {$user->email} is not active";
            }
        }

        return compact('errors', 'warnings');
    }

    /**
     * Get permissions assigned to a role
     */
    public function getRolePermissions(string $roleId): array
    {
        $role = Role::with('permissions')->find($roleId);

        if (!$role) {
            return [];
        }

        return $role->permissions->map(function ($permission) {
            return [
                'id' => $permission->id,
                'name' => $permission->name,
                'code' => $permission->code,
                'description' => $permission->description,
                'category' => $permission->category,
                'resource' => $permission->resource,
                'action' => $permission->action,
                'is_system_permission' => $permission->is_system_permission,
                'is_visible' => $permission->is_visible,
                'risk_level' => $permission->risk_level,
                'created_at' => $permission->created_at,
                'updated_at' => $permission->updated_at,
                'pivot' => [
                    'is_granted' => $permission->pivot->is_granted ?? true,
                    'is_inherited' => $permission->pivot->is_inherited ?? false,
                    'granted_at' => $permission->pivot->granted_at ?? null,
                    'granted_by' => $permission->pivot->granted_by ?? null,
                ]
            ];
        })->toArray();
    }

    /**
     * Update permissions for a role
     */
    public function updateRolePermissions(string $roleId, array $permissionIds): bool
    {
        try {
            $role = Role::find($roleId);

            if (!$role) {
                return false;
            }

            // Sync permissions with the role
            $role->permissions()->sync(
                collect($permissionIds)->mapWithKeys(function ($permissionId) {
                    return [$permissionId => [
                        'is_granted' => true,
                        'is_inherited' => false,
                        'granted_at' => now(),
                        'granted_by' => Auth::id(),
                    ]];
                })->toArray()
            );

            // Log the action
            Log::info('Role permissions updated', [
                'role_id' => $roleId,
                'permission_count' => count($permissionIds),
                'updated_by' => Auth::id()
            ]);

            return true;

        } catch (\Exception $e) {
            Log::error('Failed to update role permissions', [
                'role_id' => $roleId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return false;
        }
    }
}
