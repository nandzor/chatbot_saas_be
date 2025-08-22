<?php

namespace App\Services\Admin;

use App\Models\User;
use App\Models\Role;
use App\Models\Organization;
use App\Models\UserRole;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class UserManagementService
{
    /**
     * Get paginated users with filters and search.
     */
    public function getPaginatedUsers(
        int $page = 1,
        int $perPage = 15,
        array $filters = [],
        string $sortBy = 'created_at',
        string $sortOrder = 'desc'
    ): LengthAwarePaginator {
        $query = User::with([
            'organization',
            'roles.permissions',
            'userRoles.role'
        ]);

        // Apply filters
        $this->applyFilters($query, $filters);

        // Apply sorting
        $query->orderBy($sortBy, $sortOrder);

        return $query->paginate($perPage, ['*'], 'page', $page);
    }

    /**
     * Get user with all details.
     */
    public function getUserWithDetails(string $userId): ?User
    {
        return User::with([
            'organization',
            'roles.permissions',
            'userRoles.role',
            'userSessions'
        ])->find($userId);
    }

    /**
     * Create a new user.
     */
    public function createUser(array $userData, User $admin): User
    {
        DB::beginTransaction();

        try {
            // Generate password if not provided
            if (!isset($userData['password'])) {
                $userData['password'] = Str::random(12);
            }

            // Hash password
            $userData['password_hash'] = Hash::make($userData['password']);

            // Create user
            $user = User::create($userData);

            // Assign roles if provided
            if (isset($userData['roles']) && is_array($userData['roles'])) {
                $this->assignRolesToUser($user, $userData['roles'], $admin);
            }

            // Send welcome email if requested
            if (isset($userData['send_welcome_email']) && $userData['send_welcome_email']) {
                $this->sendWelcomeEmail($user, $userData['password']);
            }

            DB::commit();

            Log::info('User created successfully', [
                'user_id' => $user->id,
                'email' => $user->email,
                'created_by' => $admin->id
            ]);

            return $user->load(['organization', 'roles', 'userRoles.role']);

        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Update user information.
     */
    public function updateUser(string $userId, array $userData, User $admin): ?User
    {
        DB::beginTransaction();

        try {
            $user = User::find($userId);

            if (!$user) {
                return null;
            }

            // Hash password if provided
            if (isset($userData['password'])) {
                $userData['password_hash'] = Hash::make($userData['password']);
                unset($userData['password']);
            }

            // Update user
            $user->update($userData);

            // Update roles if provided
            if (isset($userData['roles']) && is_array($userData['roles'])) {
                $this->updateUserRoles($user, $userData['roles'], $admin);
            }

            DB::commit();

            Log::info('User updated successfully', [
                'user_id' => $user->id,
                'updated_by' => $admin->id,
                'updated_fields' => array_keys($userData)
            ]);

            return $user->load(['organization', 'roles', 'userRoles.role']);

        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Delete user (soft delete).
     */
    public function deleteUser(string $userId, User $admin): bool
    {
        $user = User::find($userId);

        if (!$user) {
            return false;
        }

        // Prevent deleting super admin
        if ($user->role === 'super_admin') {
            throw new \Exception('Cannot delete super admin user');
        }

        // Revoke all sessions
        $this->revokeAllUserSessions($user);

        // Soft delete user
        $user->delete();

        Log::info('User deleted successfully', [
            'user_id' => $user->id,
            'deleted_by' => $admin->id
        ]);

        return true;
    }

    /**
     * Restore deleted user.
     */
    public function restoreUser(string $userId, User $admin): ?User
    {
        $user = User::withTrashed()->find($userId);

        if (!$user || !$user->trashed()) {
            return null;
        }

        $user->restore();

        Log::info('User restored successfully', [
            'user_id' => $user->id,
            'restored_by' => $admin->id
        ]);

        return $user->load(['organization', 'roles', 'userRoles.role']);
    }

    /**
     * Force delete user (permanent).
     */
    public function forceDeleteUser(string $userId, User $admin): bool
    {
        $user = User::withTrashed()->find($userId);

        if (!$user) {
            return false;
        }

        // Prevent deleting super admin
        if ($user->role === 'super_admin') {
            throw new \Exception('Cannot permanently delete super admin user');
        }

        // Revoke all sessions and tokens
        $this->revokeAllUserSessions($user);
        $this->revokeAllUserTokens($user);

        // Force delete user
        $user->forceDelete();

        Log::warning('User permanently deleted', [
            'user_id' => $user->id,
            'deleted_by' => $admin->id
        ]);

        return true;
    }

    /**
     * Perform bulk actions on users.
     */
    public function performBulkAction(string $action, array $userIds, User $admin): array
    {
        $successCount = 0;
        $failedCount = 0;
        $errors = [];

        foreach ($userIds as $userId) {
            try {
                switch ($action) {
                    case 'activate':
                        $this->activateUser($userId);
                        $successCount++;
                        break;

                    case 'deactivate':
                        $this->deactivateUser($userId);
                        $successCount++;
                        break;

                    case 'delete':
                        if ($this->deleteUser($userId, $admin)) {
                            $successCount++;
                        } else {
                            $failedCount++;
                            $errors[] = "Failed to delete user {$userId}";
                        }
                        break;

                    case 'restore':
                        if ($this->restoreUser($userId, $admin)) {
                            $successCount++;
                        } else {
                            $failedCount++;
                            $errors[] = "Failed to restore user {$userId}";
                        }
                        break;

                    case 'send_welcome_email':
                        $this->sendWelcomeEmailToUser($userId);
                        $successCount++;
                        break;

                    default:
                        $failedCount++;
                        $errors[] = "Unknown action: {$action}";
                        break;
                }
            } catch (\Exception $e) {
                $failedCount++;
                $errors[] = "Error processing user {$userId}: " . $e->getMessage();
            }
        }

        return [
            'action' => $action,
            'total_count' => count($userIds),
            'success_count' => $successCount,
            'failed_count' => $failedCount,
            'errors' => $errors
        ];
    }

    /**
     * Get user statistics.
     */
    public function getUserStatistics(): array
    {
        $totalUsers = User::count();
        $activeUsers = User::where('status', 'active')->count();
        $inactiveUsers = User::where('status', 'inactive')->count();
        $suspendedUsers = User::where('status', 'suspended')->count();
        $deletedUsers = User::onlyTrashed()->count();

        $verifiedUsers = User::where('is_email_verified', true)->count();
        $unverifiedUsers = User::where('is_email_verified', false)->count();
        $twoFactorEnabled = User::where('two_factor_enabled', true)->count();

        $recentUsers = User::where('created_at', '>=', now()->subDays(30))->count();
        $activeSessions = User::where('last_login_at', '>=', now()->subDays(7))->count();

        // Role statistics
        $roleStats = DB::table('users')
            ->select('role', DB::raw('count(*) as count'))
            ->groupBy('role')
            ->get()
            ->keyBy('role');

        return [
            'total_users' => $totalUsers,
            'active_users' => $activeUsers,
            'inactive_users' => $inactiveUsers,
            'suspended_users' => $suspendedUsers,
            'deleted_users' => $deletedUsers,
            'verified_users' => $verifiedUsers,
            'unverified_users' => $unverifiedUsers,
            'two_factor_enabled' => $twoFactorEnabled,
            'recent_users' => $recentUsers,
            'active_sessions' => $activeSessions,
            'role_statistics' => $roleStats,
            'last_updated' => now()->toISOString()
        ];
    }

    /**
     * Export users data.
     */
    public function exportUsers(array $filters, string $format = 'csv'): array
    {
        $query = User::with(['organization', 'roles']);

        // Apply filters
        $this->applyFilters($query, $filters);

        $users = $query->get();

        // Transform data for export
        $exportData = $users->map(function ($user) {
            return [
                'id' => $user->id,
                'email' => $user->email,
                'full_name' => $user->full_name,
                'username' => $user->username,
                'role' => $user->role,
                'status' => $user->status,
                'organization' => $user->organization?->name,
                'department' => $user->department,
                'job_title' => $user->job_title,
                'is_email_verified' => $user->is_email_verified ? 'Yes' : 'No',
                'two_factor_enabled' => $user->two_factor_enabled ? 'Yes' : 'No',
                'last_login_at' => $user->last_login_at?->format('Y-m-d H:i:s'),
                'created_at' => $user->created_at->format('Y-m-d H:i:s'),
                'updated_at' => $user->updated_at->format('Y-m-d H:i:s'),
            ];
        });

        return [
            'format' => $format,
            'total_records' => $exportData->count(),
            'data' => $exportData->toArray(),
            'exported_at' => now()->toISOString()
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
                $q->where('email', 'like', "%{$search}%")
                  ->orWhere('full_name', 'like', "%{$search}%")
                  ->orWhere('username', 'like', "%{$search}%")
                  ->orWhere('department', 'like', "%{$search}%");
            });
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['role'])) {
            $query->where('role', $filters['role']);
        }

        if (!empty($filters['organization_id'])) {
            $query->where('organization_id', $filters['organization_id']);
        }

        if (!empty($filters['department'])) {
            $query->where('department', $filters['department']);
        }

        if (isset($filters['is_email_verified'])) {
            $query->where('is_email_verified', $filters['is_email_verified']);
        }

        if (isset($filters['two_factor_enabled'])) {
            $query->where('two_factor_enabled', $filters['two_factor_enabled']);
        }
    }

    /**
     * Assign roles to user.
     */
    private function assignRolesToUser(User $user, array $roleIds, User $admin): void
    {
        foreach ($roleIds as $roleId) {
            UserRole::create([
                'user_id' => $user->id,
                'role_id' => $roleId,
                'is_active' => true,
                'is_primary' => false,
                'assigned_by' => $admin->id,
                'assigned_reason' => 'Assigned by admin during user creation'
            ]);
        }
    }

    /**
     * Update user roles.
     */
    private function updateUserRoles(User $user, array $roleIds, User $admin): void
    {
        // Remove existing roles
        $user->userRoles()->delete();

        // Assign new roles
        $this->assignRolesToUser($user, $roleIds, $admin);
    }

    /**
     * Activate user.
     */
    private function activateUser(string $userId): void
    {
        $user = User::find($userId);
        if ($user) {
            $user->update(['status' => 'active']);
        }
    }

    /**
     * Deactivate user.
     */
    private function deactivateUser(string $userId): void
    {
        $user = User::find($userId);
        if ($user) {
            $user->update(['status' => 'inactive']);
            $this->revokeAllUserSessions($user);
        }
    }

    /**
     * Revoke all user sessions.
     */
    private function revokeAllUserSessions(User $user): void
    {
        // Revoke Sanctum tokens
        $user->tokens()->delete();

        // Clear active sessions
        $user->update(['active_sessions' => []]);
    }

    /**
     * Revoke all user tokens.
     */
    private function revokeAllUserTokens(User $user): void
    {
        // Revoke refresh tokens
        DB::table('refresh_tokens')
            ->where('user_id', $user->id)
            ->update(['is_revoked' => true]);
    }

    /**
     * Send welcome email to user.
     */
    private function sendWelcomeEmail(User $user, string $password): void
    {
        // TODO: Implement email sending
        Log::info('Welcome email would be sent', [
            'user_id' => $user->id,
            'email' => $user->email
        ]);
    }

    /**
     * Send welcome email to existing user.
     */
    private function sendWelcomeEmailToUser(string $userId): void
    {
        $user = User::find($userId);
        if ($user) {
            $this->sendWelcomeEmail($user, '');
        }
    }
}
