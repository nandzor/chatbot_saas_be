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
                'username' => $data['username'],
                'password_hash' => Hash::make($data['password_hash']),
                'role' => $data['role'],
                'organization_id' => $data['organization_id'],
                'is_email_verified' => $data['is_email_verified'] ?? false,
                'status' => $data['status'] ?? 'active',
                'phone' => $data['phone'] ?? null,
                'bio' => $data['bio'] ?? null,
                'department' => $data['department'] ?? null,
                'job_title' => $data['job_title'] ?? null,
            ];

            $user = $this->create($userData);

            return $user;
        });
    }

    /**
     * Update user profile.
     */
    public function updateProfile(int $userId, array $data): bool
    {
        $updateData = [];

        if (isset($data['full_name'])) {
            $updateData['full_name'] = $data['full_name'];
        }

        if (isset($data['email'])) {
            $updateData['email'] = $data['email'];
        }

        if (isset($data['role'])) {
            $updateData['role'] = $data['role'];
        }

        if (isset($data['phone'])) {
            $updateData['phone'] = $data['phone'];
        }

        if (isset($data['bio'])) {
            $updateData['bio'] = $data['bio'];
        }

        if (isset($data['department'])) {
            $updateData['department'] = $data['department'];
        }

        if (isset($data['job_title'])) {
            $updateData['job_title'] = $data['job_title'];
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
        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (isset($filters['role'])) {
            $query->where('role', $filters['role']);
        }

        if (isset($filters['organization_id'])) {
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
    public function emailExists(string $email, ?int $excludeUserId = null): bool
    {
        $query = User::where('email', $email);

        if ($excludeUserId) {
            $query->where('id', '!=', $excludeUserId);
        }

        return $query->exists();
    }
}
