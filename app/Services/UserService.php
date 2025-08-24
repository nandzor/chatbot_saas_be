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
                'name' => $data['name'],
                'email' => $data['email'],
                'password' => Hash::make($data['password']),
                'is_active' => $data['is_active'] ?? true,
                'settings' => $data['settings'] ?? [],
            ];

            $user = $this->create($userData);

            // Note: Role assignment will be implemented when Spatie Permission supports Laravel 12
            // if (isset($data['role'])) {
            //     $user->assignRole($data['role']);
            // }

            return $user;
        });
    }

    /**
     * Update user profile.
     */
    public function updateProfile(int $userId, array $data): bool
    {
        $updateData = [];

        if (isset($data['name'])) {
            $updateData['name'] = $data['name'];
        }

        if (isset($data['email'])) {
            $updateData['email'] = $data['email'];
        }

        if (isset($data['profile_photo_url'])) {
            $updateData['profile_photo_url'] = $data['profile_photo_url'];
        }

        if (isset($data['settings'])) {
            $user = $this->getById($userId);
            if (!$user) {
                return false;
            }
            $settings = array_merge($user->settings ?? [], $data['settings']);
            $updateData['settings'] = $settings;
        }

        $result = $this->update($userId, $updateData);
        return $result !== null;
    }

    /**
     * Change user password.
     */
    public function changePassword(int $userId, string $newPassword): bool
    {
        $result = $this->update($userId, [
            'password' => Hash::make($newPassword),
        ]);
        return $result !== null;
    }

    /**
     * Activate or deactivate user.
     */
    public function toggleUserStatus(int $userId): bool
    {
        $user = $this->getById($userId);
        if (!$user) {
            return false;
        }

        $result = $this->update($userId, [
            'is_active' => !$user->is_active,
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
    public function searchUsers(string $query, int $perPage = 15): LengthAwarePaginator
    {
        return User::where('name', 'ILIKE', "%{$query}%")
            ->orWhere('email', 'ILIKE', "%{$query}%")
            ->paginate($perPage);
    }

    /**
     * Get user statistics.
     */
    public function getUserStatistics(): array
    {
        return [
            'total_users' => User::count(),
            'active_users' => User::active()->count(),
            'verified_users' => User::verified()->count(),
            'inactive_users' => User::where('is_active', false)->count(),
            'unverified_users' => User::whereNull('email_verified_at')->count(),
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
    public function softDeleteUser(int $userId): bool
    {
        $result = $this->update($userId, [
            'is_active' => false,
            'deleted_at' => now(),
        ]);
        return $result !== null;
    }

    /**
     * Restore soft deleted user.
     */
    public function restoreUser(int $userId): bool
    {
        $result = $this->update($userId, [
            'is_active' => true,
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
     * Check if email exists.
     */
    public function emailExists(string $email, ?int $excludeUserId = null): bool
    {
        $query = User::where('email', $email);

        if ($excludeUserId) {
            $query->where('id', '!=', $excludeUserId);
        }

        return $query->exists();
    }
}
