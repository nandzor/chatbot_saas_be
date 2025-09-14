<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Collection;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Http\Request;

class UserService extends BaseService
{
    /**
     * Get the model for the service.
     */
    protected function getModel(): Model
    {
        return new User();
    }


    /**
     * Create a new user.
     */
    public function createUser(array $data): User
    {
        return DB::transaction(function () use ($data) {
            $userData = [
                'full_name' => $data['full_name'],
                'email' => $data['email'],
                'username' => $data['username'] ?? $this->generateUsername($data['email']),
                'password_hash' => Hash::make($data['password_hash']),
                'role' => $data['role'],
                'organization_id' => $data['organization_id'],
                'is_email_verified' => $data['is_email_verified'] ?? false,
                'is_phone_verified' => $data['is_phone_verified'] ?? false,
                'two_factor_enabled' => $data['two_factor_enabled'] ?? false,
                'status' => $data['status'] ?? 'pending',
                'phone' => $data['phone'] ?? null,
                'bio' => $data['bio'] ?? null,
                'department' => $data['department'] ?? null,
                'job_title' => $data['job_title'] ?? null,
                'location' => $data['location'] ?? null,
                'timezone' => $data['timezone'] ?? 'UTC',
                'avatar_url' => $data['avatar_url'] ?? null,
                'permissions' => $data['permissions'] ?? [],
                'metadata' => $data['metadata'] ?? [],
            ];

            /** @var User $user */
            $user = $this->create($userData);

            // Assign default role if specified
            if (isset($data['role_id'])) {
                $this->assignRole($user, $data['role_id']);
            }

            return $user;
        });
    }

    /**
     * Generate username from email.
     */
    private function generateUsername(string $email): string
    {
        $baseUsername = strtolower(explode('@', $email)[0]);
        $username = $baseUsername;
        $counter = 1;

        while (User::where('username', $username)->exists()) {
            $username = $baseUsername . $counter;
            $counter++;
        }

        return $username;
    }

    /**
     * Update user profile.
     */
    public function updateProfile(string $userId, array $data): bool
    {
        return DB::transaction(function () use ($userId, $data) {
            $updateData = [];

            // Basic information
            if (isset($data['full_name'])) {
                $updateData['full_name'] = $data['full_name'];
            }

            if (isset($data['email'])) {
                $updateData['email'] = $data['email'];
            }

            if (isset($data['username'])) {
                $updateData['username'] = $data['username'];
            }

            if (isset($data['role'])) {
                $updateData['role'] = $data['role'];
            }

            if (isset($data['organization_id'])) {
                $updateData['organization_id'] = $data['organization_id'];
            }

            // Contact information
            if (isset($data['phone'])) {
                $updateData['phone'] = $data['phone'];
            }

            // Profile information
            if (isset($data['bio'])) {
                $updateData['bio'] = $data['bio'];
            }

            if (isset($data['department'])) {
                $updateData['department'] = $data['department'];
            }

            if (isset($data['job_title'])) {
                $updateData['job_title'] = $data['job_title'];
            }

            if (isset($data['location'])) {
                $updateData['location'] = $data['location'];
            }

            if (isset($data['timezone'])) {
                $updateData['timezone'] = $data['timezone'];
            }

            if (isset($data['avatar_url'])) {
                $updateData['avatar_url'] = $data['avatar_url'];
            }

            // Status and verification
            if (isset($data['status'])) {
                $updateData['status'] = $data['status'];
            }

            if (isset($data['is_email_verified'])) {
                $updateData['is_email_verified'] = $data['is_email_verified'];
            }

            if (isset($data['is_phone_verified'])) {
                $updateData['is_phone_verified'] = $data['is_phone_verified'];
            }

            if (isset($data['two_factor_enabled'])) {
                $updateData['two_factor_enabled'] = $data['two_factor_enabled'];
            }

            // Permissions and metadata
            if (isset($data['permissions'])) {
                $updateData['permissions'] = $data['permissions'];
            }

            if (isset($data['metadata'])) {
                $updateData['metadata'] = $data['metadata'];
            }

            $result = $this->update($userId, $updateData);
            return $result !== null;
        });
    }

    /**
     * Change user password.
     */
    public function changePassword(string $userId, string $newPassword): bool
    {
        $result = $this->update($userId, [
            'password' => Hash::make($newPassword),
        ]);
        return $result !== null;
    }

    /**
     * Activate or deactivate user.
     */
    public function toggleUserStatus(string $userId): bool
    {
        $user = $this->getById($userId);
        if (!$user) {
            return false;
        }

        $newStatus = $user->status === 'active' ? 'inactive' : 'active';
        $result = $this->update($userId, [
            'status' => $newStatus,
        ]);
        return $result !== null;
    }

    /**
     * Get active users.
     */
    public function getActiveUsers(): Collection
    {
        return User::active()->get();
    }

    /**
     * Get verified users.
     */
    public function getVerifiedUsers(): Collection
    {
        return User::verified()->get();
    }

    /**
     * Get users with specific role.
     * Note: Will be implemented when Spatie Permission supports Laravel 12
     */
    public function getUsersByRole(string $role): Collection
    {
        // return User::role($role)->get();
        // For now, return empty collection
        return collect();
    }

    /**
     * Search users by name or email.
     */
    public function searchUsers(string $query, array $filters = []): LengthAwarePaginator
    {
        $queryBuilder = User::where('full_name', 'ILIKE', "%{$query}%")
            ->orWhere('email', 'ILIKE', "%{$query}%");

        // Apply filters
        if (isset($filters['status'])) {
            $queryBuilder->where('status', $filters['status']);
        }

        if (isset($filters['role'])) {
            $queryBuilder->where('role', $filters['role']);
        }

        if (isset($filters['organization_id'])) {
            $queryBuilder->where('organization_id', $filters['organization_id']);
        }

        return $queryBuilder->paginate($filters['limit'] ?? 20);
    }

    /**
     * Get user statistics.
     */
    public function getUserStatistics(): array
    {
        return [
            'total_users' => User::count(),
            'active_users' => User::where('status', 'active')->count(),
            'verified_users' => User::where('is_email_verified', true)->count(),
            'inactive_users' => User::where('status', 'inactive')->count(),
            'unverified_users' => User::where('is_email_verified', false)->count(),
            'suspended_users' => User::where('status', 'suspended')->count(),
        ];
    }

    /**
     * Bulk update users.
     */
    public function bulkUpdateUsers(array $userIds, array $data): int
    {
        return User::whereIn('id', $userIds)->update($data);
    }

    /**
     * Soft delete user (deactivate).
     */
    public function softDeleteUser(string $userId): bool
    {
        $result = $this->update($userId, [
            'deleted_at' => now(),
        ]);
        return $result !== null;
    }

    /**
     * Restore soft deleted user.
     */
    public function restoreUser(string $userId): bool
    {
        $result = $this->update($userId, [
            'deleted_at' => null,
        ]);
        return $result !== null;
    }

    /**
     * Get user by email.
     */
    public function getUserByEmail(string $email): ?User
    {
        return User::where('email', $email)->first();
    }

    /**
     * Get all users with pagination, filters, and search.
     */
    public function getAllUsers(
        Request $request,
        array $filters = [],
        array $relations = [],
        array $select = []
    ): LengthAwarePaginator {
        $query = User::query();

        // Apply filters
        if (isset($filters['status']) && $filters['status'] !== 'all') {
            $query->where('status', $filters['status']);
        }

        if (isset($filters['role']) && $filters['role'] !== 'all') {
            $query->where('role', $filters['role']);
        }

        if (isset($filters['organization_id']) && $filters['organization_id'] !== 'all') {
            $query->where('organization_id', $filters['organization_id']);
        }

        // Apply search
        if ($request->has('search')) {
            $search = $request->get('search');
            $query->where(function ($q) use ($search) {
                $q->where('full_name', 'ILIKE', "%{$search}%")
                  ->orWhere('email', 'ILIKE', "%{$search}%");
            });
        }

        // Apply sorting
        $sortField = $request->get('sort', 'created_at');
        $sortOrder = $request->get('order', 'desc');
        $query->orderBy($sortField, $sortOrder);

        // Load relations
        if (!empty($relations)) {
            $query->with($relations);
        }

        // Select fields
        if (!empty($select)) {
            $query->select($select);
        }

        // Apply pagination
        $perPage = $request->get('per_page', 15);
        return $query->paginate($perPage);
    }

    /**
     * Check if email exists.
     */
    public function emailExists(string $email, ?string $excludeUserId = null): bool
    {
        $query = User::where('email', $email);

        if ($excludeUserId) {
            $query->where('id', '!=', $excludeUserId);
        }

        return $query->exists();
    }

    /**
     * Check if username exists.
     */
    public function usernameExists(string $username, ?string $excludeUserId = null): bool
    {
        $query = User::where('username', $username);

        if ($excludeUserId) {
            $query->where('id', '!=', $excludeUserId);
        }

        return $query->exists();
    }

    /**
     * Assign role to user.
     */
    public function assignRole(User $user, string $roleId): bool
    {
        try {
            // This would be implemented when role system is fully integrated
            // For now, just update the role field
            $user->update(['role' => $roleId]);
            return true;
        } catch (\Exception $e) {
            return false;
        }
    }

    /**
     * Remove role from user.
     */
    public function removeRole(User $user, string $roleId): bool
    {
        try {
            // This would be implemented when role system is fully integrated
            return true;
        } catch (\Exception $e) {
            return false;
        }
    }

    /**
     * Get users by organization.
     */
    public function getUsersByOrganization(string $organizationId, array $filters = []): LengthAwarePaginator
    {
        $query = User::where('organization_id', $organizationId);

        // Apply filters
        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (isset($filters['role'])) {
            $query->where('role', $filters['role']);
        }

        if (isset($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('full_name', 'ILIKE', "%{$search}%")
                  ->orWhere('email', 'ILIKE', "%{$search}%")
                  ->orWhere('username', 'ILIKE', "%{$search}%");
            });
        }

        // Apply sorting
        $sortField = $filters['sort'] ?? 'created_at';
        $sortOrder = $filters['order'] ?? 'desc';
        $query->orderBy($sortField, $sortOrder);

        // Apply pagination
        $perPage = $filters['per_page'] ?? 15;
        return $query->paginate($perPage);
    }

    /**
     * Clone user with new email.
     */
    public function cloneUser(User $user, string $newEmail, array $overrides = []): User
    {
        return DB::transaction(function () use ($user, $newEmail, $overrides) {
            $userData = $user->toArray();

            // Remove fields that shouldn't be cloned
            unset($userData['id'], $userData['created_at'], $userData['updated_at'], $userData['deleted_at']);

            // Override with new email and any other overrides
            $userData['email'] = $newEmail;
            $userData['username'] = $this->generateUsername($newEmail);
            $userData['status'] = 'pending';
            $userData['is_email_verified'] = false;
            $userData['login_count'] = 0;
            $userData['last_login_at'] = null;
            $userData['last_login_ip'] = null;
            $userData['failed_login_attempts'] = 0;
            $userData['locked_until'] = null;

            // Apply any overrides
            $userData = array_merge($userData, $overrides);

            return $this->create($userData);
        });
    }

    /**
     * Get user activity summary.
     */
    public function getUserActivitySummary(string $userId): array
    {
        $user = $this->getById($userId);

        if (!$user) {
            return [];
        }

        return [
            'login_count' => $user->login_count,
            'last_login_at' => $user->last_login_at,
            'last_login_ip' => $user->last_login_ip,
            'failed_login_attempts' => $user->failed_login_attempts,
            'is_locked' => $user->isLocked(),
            'active_sessions' => $user->active_sessions->count(),
            'created_at' => $user->created_at,
            'updated_at' => $user->updated_at,
        ];
    }

    /**
     * Get user sessions.
     */
    public function getUserSessions(string $userId): array
    {
        $user = $this->getById($userId);

        if (!$user) {
            return [];
        }

        $sessions = $user->userSessions()
            ->orderBy('last_activity_at', 'desc')
            ->get()
            ->map(function ($session) {
                return [
                    'id' => $session->id,
                    'session_token' => $session->session_token,
                    'ip_address' => $session->ip_address,
                    'user_agent' => $session->user_agent,
                    'device_info' => $session->device_info,
                    'location_info' => $session->location_info,
                    'is_active' => $session->is_active,
                    'last_activity_at' => $session->last_activity_at,
                    'expires_at' => $session->expires_at,
                    'created_at' => $session->created_at,
                    'status' => $session->isValid() ? 'active' : ($session->isExpired() ? 'expired' : 'inactive'),
                    'device_type' => $this->getDeviceType($session->user_agent),
                    'browser_info' => $this->getBrowserInfo($session->user_agent),
                    'location' => $this->formatLocation($session->location_info),
                ];
            })
            ->toArray();

        return [
            'sessions' => $sessions,
            'total_sessions' => count($sessions),
            'active_sessions' => count(array_filter($sessions, fn($s) => $s['status'] === 'active')),
            'expired_sessions' => count(array_filter($sessions, fn($s) => $s['status'] === 'expired')),
        ];
    }

    /**
     * Get device type from user agent.
     */
    private function getDeviceType(?string $userAgent): string
    {
        if (!$userAgent) return 'Unknown';

        $ua = strtolower($userAgent);
        if (strpos($ua, 'mobile') !== false || strpos($ua, 'android') !== false || strpos($ua, 'iphone') !== false) {
            return 'Mobile';
        }
        if (strpos($ua, 'tablet') !== false || strpos($ua, 'ipad') !== false) {
            return 'Tablet';
        }
        return 'Desktop';
    }

    /**
     * Get browser information from user agent.
     */
    private function getBrowserInfo(?string $userAgent): array
    {
        if (!$userAgent) return ['name' => 'Unknown', 'version' => 'Unknown'];

        $ua = strtolower($userAgent);
        $browser = 'Unknown';
        $version = 'Unknown';

        if (strpos($ua, 'chrome') !== false) {
            $browser = 'Chrome';
            preg_match('/chrome\/(\d+)/', $ua, $matches);
            $version = $matches[1] ?? 'Unknown';
        } elseif (strpos($ua, 'firefox') !== false) {
            $browser = 'Firefox';
            preg_match('/firefox\/(\d+)/', $ua, $matches);
            $version = $matches[1] ?? 'Unknown';
        } elseif (strpos($ua, 'safari') !== false) {
            $browser = 'Safari';
            preg_match('/version\/(\d+)/', $ua, $matches);
            $version = $matches[1] ?? 'Unknown';
        } elseif (strpos($ua, 'edge') !== false) {
            $browser = 'Edge';
            preg_match('/edge\/(\d+)/', $ua, $matches);
            $version = $matches[1] ?? 'Unknown';
        }

        return [
            'name' => $browser,
            'version' => $version,
            'full_ua' => $userAgent
        ];
    }

    /**
     * Format location information.
     */
    private function formatLocation(?array $locationInfo): string
    {
        if (!$locationInfo) return 'Unknown';

        $parts = [];
        if (isset($locationInfo['city'])) $parts[] = $locationInfo['city'];
        if (isset($locationInfo['region'])) $parts[] = $locationInfo['region'];
        if (isset($locationInfo['country'])) $parts[] = $locationInfo['country'];

        return empty($parts) ? 'Unknown' : implode(', ', $parts);
    }

    /**
     * Get user permissions (from roles and direct assignments).
     */
    public function getUserPermissions(string $userId, array $filters = []): array
    {
        $user = $this->getById($userId);

        if (!$user) {
            return [];
        }

        // Get permissions from roles
        $rolePermissions = collect();
        if ($user->relationLoaded('roles')) {
            $rolePermissions = $user->roles->flatMap(function ($role) {
                return $role->permissions ?? collect();
            });
        } else {
            $rolePermissions = $user->roles()->with('permissions')->get()
                ->flatMap(function ($role) {
                    return $role->permissions ?? collect();
                });
        }

        // Get direct permissions from user.permissions field (JSON array)
        $directPermissions = collect();
        if ($user->permissions && is_array($user->permissions)) {
            // Get permission details for direct permissions
            $permissionCodes = $user->permissions;
            $directPermissions = \App\Models\Permission::whereIn('code', $permissionCodes)
                ->where('status', 'active')
                ->get();
        }

        // Merge and deduplicate permissions
        $allPermissions = $rolePermissions->merge($directPermissions)->unique('id');

        // Apply filters
        if (isset($filters['category']) && $filters['category'] !== 'all') {
            $allPermissions = $allPermissions->filter(function ($permission) use ($filters) {
                return $permission->category === $filters['category'];
            });
        }

        if (isset($filters['active_only']) && $filters['active_only']) {
            $allPermissions = $allPermissions->filter(function ($permission) {
                return $permission->status === 'active';
            });
        }

        // Format response
        return $allPermissions->map(function ($permission) use ($user) {
            $isDirectPermission = $user->permissions && is_array($user->permissions) &&
                                 in_array($permission->code, $user->permissions);

            return [
                'id' => $permission->id,
                'name' => $permission->name,
                'code' => $permission->code,
                'display_name' => $permission->display_name,
                'description' => $permission->description,
                'category' => $permission->category,
                'group_name' => $permission->group_name,
                'resource' => $permission->resource,
                'action' => $permission->action,
                'scope' => $permission->scope,
                'is_dangerous' => $permission->is_dangerous,
                'requires_approval' => $permission->requires_approval,
                'is_direct' => $isDirectPermission,
                'is_inherited' => !$isDirectPermission,
                'risk_level' => $this->getRiskLevel($permission),
                'is_active' => $permission->status === 'active',
                'created_at' => $permission->created_at,
                'updated_at' => $permission->updated_at,
            ];
        })->values()->toArray();
    }

    /**
     * Get risk level for permission.
     */
    private function getRiskLevel($permission): string
    {
        if ($permission->is_dangerous) {
            return 'critical';
        }

        if ($permission->requires_approval) {
            return 'high';
        }

        if (in_array($permission->action, ['delete', 'manage', 'execute'])) {
            return 'high';
        }

        if (in_array($permission->action, ['update', 'approve', 'publish'])) {
            return 'medium';
        }

        return 'low';
    }
}
