<?php

namespace App\Services;

use App\Models\User;
use App\Models\Role;
use App\Models\Permission;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PermissionSyncService
{
    /**
     * Sync permissions for a specific user
     */
    public function syncUserPermissions(User $user, bool $force = false): array
    {
        try {
            $currentPermissions = $user->permissions ?? [];
            $rolePermissions = $this->getRolePermissions($user);

            // Merge permissions (role permissions take precedence)
            $mergedPermissions = array_merge($currentPermissions, $rolePermissions);

            // Only update if there are changes or force is true
            if ($force || $currentPermissions !== $mergedPermissions) {
                $user->update(['permissions' => $mergedPermissions]);

                Log::info('User permissions synced', [
                    'user_id' => $user->id,
                    'email' => $user->email,
                    'permissions_count' => count($mergedPermissions)
                ]);

                return [
                    'success' => true,
                    'user_id' => $user->id,
                    'email' => $user->email,
                    'permissions_added' => array_diff_key($mergedPermissions, $currentPermissions),
                    'permissions_removed' => array_diff_key($currentPermissions, $mergedPermissions),
                    'total_permissions' => count($mergedPermissions)
                ];
            }

            return [
                'success' => true,
                'user_id' => $user->id,
                'email' => $user->email,
                'message' => 'No changes needed',
                'total_permissions' => count($mergedPermissions)
            ];

        } catch (\Exception $e) {
            Log::error('Failed to sync user permissions', [
                'user_id' => $user->id,
                'email' => $user->email,
                'error' => $e->getMessage()
            ]);

            return [
                'success' => false,
                'user_id' => $user->id,
                'email' => $user->email,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Sync permissions for all users with a specific role
     */
    public function syncUsersByRole(string $role, bool $force = false): array
    {
        $users = User::where('role', $role)->get();
        $results = [];

        foreach ($users as $user) {
            $results[] = $this->syncUserPermissions($user, $force);
        }

        return [
            'success' => true,
            'role' => $role,
            'users_processed' => count($users),
            'results' => $results
        ];
    }

    /**
     * Sync permissions for all users
     */
    public function syncAllUsers(bool $force = false): array
    {
        $users = User::all();
        $results = [];
        $successCount = 0;
        $errorCount = 0;

        foreach ($users as $user) {
            $result = $this->syncUserPermissions($user, $force);
            $results[] = $result;

            if ($result['success']) {
                $successCount++;
            } else {
                $errorCount++;
            }
        }

        return [
            'success' => true,
            'total_users' => count($users),
            'success_count' => $successCount,
            'error_count' => $errorCount,
            'results' => $results
        ];
    }

    /**
     * Get permissions from user's roles
     */
    private function getRolePermissions(User $user): array
    {
        $permissions = [];

        // Get permissions from direct role field
        if ($user->role) {
            $role = Role::where('code', $user->role)->first();
            if ($role) {
                $rolePermissions = $role->permissions()
                    ->wherePivot('is_granted', true)
                    ->get();

                foreach ($rolePermissions as $permission) {
                    $permissions[$permission->code] = true;
                }
            }
        }

        // Get permissions from user_roles relationship
        if ($user->relationLoaded('roles') || $user->roles()->exists()) {
            $userRoles = $user->roles()->wherePivot('is_active', true)->get();

            foreach ($userRoles as $role) {
                $rolePermissions = $role->permissions()
                    ->wherePivot('is_granted', true)
                    ->get();

                foreach ($rolePermissions as $permission) {
                    $permissions[$permission->code] = true;
                }
            }
        }

        return $permissions;
    }

    /**
     * Compare user permissions with role permissions
     */
    public function compareUserPermissions(User $user): array
    {
        $currentPermissions = $user->permissions ?? [];
        $rolePermissions = $this->getRolePermissions($user);

        $added = array_diff_key($rolePermissions, $currentPermissions);
        $removed = array_diff_key($currentPermissions, $rolePermissions);
        $unchanged = array_intersect_key($currentPermissions, $rolePermissions);

        return [
            'user_id' => $user->id,
            'email' => $user->email,
            'current_permissions' => $currentPermissions,
            'role_permissions' => $rolePermissions,
            'added_permissions' => $added,
            'removed_permissions' => $removed,
            'unchanged_permissions' => $unchanged,
            'needs_sync' => !empty($added) || !empty($removed)
        ];
    }

    /**
     * Get sync statistics
     */
    public function getSyncStatistics(): array
    {
        $users = User::all();
        $needsSync = 0;
        $upToDate = 0;
        $errors = 0;

        foreach ($users as $user) {
            try {
                $comparison = $this->compareUserPermissions($user);
                if ($comparison['needs_sync']) {
                    $needsSync++;
                } else {
                    $upToDate++;
                }
            } catch (\Exception $e) {
                $errors++;
            }
        }

        return [
            'total_users' => count($users),
            'needs_sync' => $needsSync,
            'up_to_date' => $upToDate,
            'errors' => $errors
        ];
    }
}
