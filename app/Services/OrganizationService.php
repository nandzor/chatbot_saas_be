<?php

namespace App\Services;

use App\Models\Organization;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class OrganizationService extends BaseService
{
    /**
     * Get the model for the service.
     */
    protected function getModel(): \Illuminate\Database\Eloquent\Model
    {
        return new Organization();
    }

    /**
     * Get paginated organizations with filters and search.
     */
    public function getPaginatedOrganizations(
        int $page = 1,
        int $perPage = 15,
        array $filters = [],
        string $sortBy = 'created_at',
        string $sortOrder = 'desc'
    ): LengthAwarePaginator {
        $query = Organization::with(['users', 'roles']);

        // Apply filters
        $this->applyFilters($query, $filters);

        // Apply sorting
        $query->orderBy($sortBy, $sortOrder);

        return $query->paginate($perPage, ['*'], 'page', $page);
    }

    /**
     * Get organization with all details.
     */
    public function getOrganizationWithDetails(string $organizationId): ?Organization
    {
        return Organization::with([
            'users',
            'roles',
            'permissions'
        ])->find($organizationId);
    }

    /**
     * Create a new organization.
     */
    public function createOrganization(array $organizationData, User $admin): Organization
    {
        DB::beginTransaction();

        try {
            // Generate UUID if not provided
            if (!isset($organizationData['id'])) {
                $organizationData['id'] = Str::uuid();
            }

            // Create organization
            $organization = Organization::create($organizationData);

            DB::commit();

            Log::info('Organization created successfully', [
                'organization_id' => $organization->id,
                'name' => $organization->name,
                'created_by' => $admin->id
            ]);

            return $organization->load(['users', 'roles']);

        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Update organization information.
     */
    public function updateOrganization(string $organizationId, array $organizationData, User $admin): ?Organization
    {
        DB::beginTransaction();

        try {
            $organization = Organization::find($organizationId);

            if (!$organization) {
                return null;
            }

            // Update organization
            $organization->update($organizationData);

            DB::commit();

            Log::info('Organization updated successfully', [
                'organization_id' => $organization->id,
                'updated_by' => $admin->id,
                'updated_fields' => array_keys($organizationData)
            ]);

            return $organization->load(['users', 'roles']);

        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Delete organization.
     */
    public function deleteOrganization(string $organizationId, User $admin): bool
    {
        $organization = Organization::find($organizationId);

        if (!$organization) {
            return false;
        }

        // Check if organization has users
        if ($organization->users()->count() > 0) {
            throw new \Exception('Cannot delete organization that has users');
        }

        // Delete organization
        $organization->delete();

        Log::info('Organization deleted successfully', [
            'organization_id' => $organization->id,
            'deleted_by' => $admin->id
        ]);

        return true;
    }

    /**
     * Get organization statistics.
     */
    public function getOrganizationStatistics(): array
    {
        $totalOrganizations = Organization::count();
        $activeOrganizations = Organization::where('status', 'active')->count();
        $inactiveOrganizations = Organization::where('status', 'inactive')->count();

        // Type statistics
        $typeStats = DB::table('organizations')
            ->select('type', DB::raw('count(*) as count'))
            ->groupBy('type')
            ->get()
            ->keyBy('type');

        // Country statistics
        $countryStats = DB::table('organizations')
            ->select('country', DB::raw('count(*) as count'))
            ->whereNotNull('country')
            ->groupBy('country')
            ->get()
            ->keyBy('country');

        // Organizations with users
        $organizationsWithUsers = Organization::whereHas('users')->count();
        $organizationsWithoutUsers = Organization::whereDoesntHave('users')->count();

        return [
            'total_organizations' => $totalOrganizations,
            'active_organizations' => $activeOrganizations,
            'inactive_organizations' => $inactiveOrganizations,
            'type_statistics' => $typeStats,
            'country_statistics' => $countryStats,
            'organizations_with_users' => $organizationsWithUsers,
            'organizations_without_users' => $organizationsWithoutUsers,
            'last_updated' => now()->toISOString()
        ];
    }

    /**
     * Get organization users.
     */
    public function getOrganizationUsers(string $organizationId): array
    {
        $organization = Organization::with('users')->find($organizationId);

        if (!$organization) {
            return [];
        }

        return [
            'organization' => [
                'id' => $organization->id,
                'name' => $organization->name,
                'slug' => $organization->slug,
            ],
            'users' => $organization->users->map(function ($user) {
                return [
                    'id' => $user->id,
                    'email' => $user->email,
                    'full_name' => $user->full_name,
                    'username' => $user->username,
                    'role' => $user->role,
                    'status' => $user->status,
                    'joined_at' => $user->pivot->created_at?->toISOString(),
                ];
            }),
            'total_users' => $organization->users->count(),
        ];
    }

    /**
     * Add user to organization.
     */
    public function addUserToOrganization(string $organizationId, string $userId, string $role, User $admin): bool
    {
        $organization = Organization::find($organizationId);
        $user = User::find($userId);

        if (!$organization || !$user) {
            return false;
        }

        // Check if user is already in organization
        if ($organization->users()->where('user_id', $userId)->exists()) {
            throw new \Exception('User is already a member of this organization');
        }

        // Add user to organization
        $organization->users()->attach($userId, [
            'role' => $role,
            'joined_at' => now(),
            'added_by' => $admin->id,
        ]);

        Log::info('User added to organization', [
            'organization_id' => $organizationId,
            'user_id' => $userId,
            'role' => $role,
            'added_by' => $admin->id
        ]);

        return true;
    }

    /**
     * Remove user from organization.
     */
    public function removeUserFromOrganization(string $organizationId, string $userId, User $admin): bool
    {
        $organization = Organization::find($organizationId);
        $user = User::find($userId);

        if (!$organization || !$user) {
            return false;
        }

        // Remove user from organization
        $organization->users()->detach($userId);

        Log::info('User removed from organization', [
            'organization_id' => $organizationId,
            'user_id' => $userId,
            'removed_by' => $admin->id
        ]);

        return true;
    }

}
