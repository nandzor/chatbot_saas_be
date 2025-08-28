<?php

namespace App\Services;

use App\Models\Organization;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class OrganizationService extends BaseService
{
    /**
     * Get the model for the service.
     */
    protected function getModel(): Model
    {
        return new Organization();
    }

    /**
     * Get all organizations with optional filters
     */
    public function getAllOrganizations(
        ?Request $request = null,
        array $filters = []
    ): Collection|LengthAwarePaginator {
        $query = $this->getModel()->newQuery();

        // Apply filters
        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (isset($filters['subscription_status'])) {
            $query->where('subscription_status', $filters['subscription_status']);
        }

        if (isset($filters['business_type'])) {
            $query->where('business_type', $filters['business_type']);
        }

        if (isset($filters['industry'])) {
            $query->where('industry', $filters['industry']);
        }

        if (isset($filters['company_size'])) {
            $query->where('company_size', $filters['company_size']);
        }

        if (isset($filters['has_active_subscription'])) {
            if ($filters['has_active_subscription']) {
                $query->withActiveSubscription();
            } else {
                $query->whereNotIn('subscription_status', ['active', 'trial']);
            }
        }

        // Apply relations
        $query->with(['subscriptionPlan', 'users']);

        // Apply sorting
        if ($request) {
            $this->applySorting($query, $request);
        }

        // Return paginated or all results
        if ($request && $request->has('per_page')) {
            $perPage = min(100, max(1, (int) $request->get('per_page', 15)));
            return $query->paginate($perPage);
        }

        return $query->get();
    }

    /**
     * Get organization by ID with relations
     */
    public function getOrganizationById(string $id, array $relations = []): ?Organization
    {
        $query = $this->getModel()->newQuery();

        if (!empty($relations)) {
            $query->with($relations);
        }

        return $query->find($id);
    }

    /**
     * Get organization by org_code
     */
    public function getOrganizationByCode(string $orgCode): ?Organization
    {
        return $this->getModel()->where('org_code', $orgCode)->first();
    }

    /**
     * Create organization with validation
     */
    public function createOrganization(array $data): Organization
    {
        try {
            DB::beginTransaction();

            // Generate org_code if not provided
            if (!isset($data['org_code'])) {
                $data['org_code'] = $this->generateOrgCode($data['name']);
            }

            // Set default values
            $data['status'] = $data['status'] ?? 'active';
            $data['subscription_status'] = $data['subscription_status'] ?? 'trial';
            $data['currency'] = $data['currency'] ?? 'IDR';
            $data['timezone'] = $data['timezone'] ?? 'Asia/Jakarta';
            $data['locale'] = $data['locale'] ?? 'id';

            // Set trial period if not provided
            if (!isset($data['trial_ends_at']) && $data['subscription_status'] === 'trial') {
                $data['trial_ends_at'] = now()->addDays(14);
            }

            $organization = $this->getModel()->create($data);

            // Clear cache
            $this->clearOrganizationCache();

            DB::commit();

            Log::info('Organization created', [
                'organization_id' => $organization->id,
                'name' => $organization->name,
                'org_code' => $organization->org_code
            ]);

            return $organization->fresh();
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error creating organization', [
                'error' => $e->getMessage(),
                'data' => $data
            ]);
            throw $e;
        }
    }

    /**
     * Update organization
     */
    public function updateOrganization(string $id, array $data): ?Organization
    {
        try {
            DB::beginTransaction();

            $organization = $this->getById($id);

            if (!$organization) {
                return null;
            }

            // Check if org_code is being changed and if it's unique
            if (isset($data['org_code']) && $data['org_code'] !== $organization->org_code) {
                if ($this->getModel()->where('org_code', $data['org_code'])->where('id', '!=', $id)->exists()) {
                    throw new \Exception('Organization code already exists');
                }
            }

            $organization->update($data);

            // Clear cache
            $this->clearOrganizationCache();

            DB::commit();

            Log::info('Organization updated', [
                'organization_id' => $organization->id,
                'name' => $organization->name,
                'updated_fields' => array_keys($data)
            ]);

            return $organization->fresh();
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error updating organization', [
                'error' => $e->getMessage(),
                'id' => $id,
                'data' => $data
            ]);
            throw $e;
        }
    }

    /**
     * Delete organization
     */
    public function deleteOrganization(string $id): bool
    {
        try {
            DB::beginTransaction();

            $organization = $this->getById($id);

            if (!$organization) {
                return false;
            }

            // Check if organization has users
            if ($organization->users()->exists()) {
                throw new \Exception('Cannot delete organization that has users');
            }

            // Check if organization has active subscriptions
            if ($organization->subscriptions()->where('status', 'active')->exists()) {
                throw new \Exception('Cannot delete organization that has active subscriptions');
            }

            $deleted = $organization->delete();

            if ($deleted) {
                // Clear cache
                $this->clearOrganizationCache();

                Log::info('Organization deleted', [
                    'organization_id' => $organization->id,
                    'name' => $organization->name
                ]);
            }

            DB::commit();

            return $deleted;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error deleting organization', [
                'error' => $e->getMessage(),
                'id' => $id
            ]);
            throw $e;
        }
    }

    /**
     * Get organizations with active subscriptions
     */
    public function getActiveOrganizations(): Collection
    {
        return Cache::remember('organizations_active', 1800, function () {
            return $this->getModel()
                ->withActiveSubscription()
                ->with(['subscriptionPlan', 'users'])
                ->get();
        });
    }

    /**
     * Get organizations in trial
     */
    public function getTrialOrganizations(): Collection
    {
        return $this->getModel()
            ->inTrial()
            ->with(['subscriptionPlan', 'users'])
            ->get();
    }

    /**
     * Get organizations with expired trial
     */
    public function getExpiredTrialOrganizations(): Collection
    {
        return $this->getModel()
            ->trialExpired()
            ->with(['subscriptionPlan', 'users'])
            ->get();
    }

    /**
     * Get organization statistics
     */
    public function getOrganizationStatistics(): array
    {
        return Cache::remember('organization_statistics', 3600, function () {
            return [
                'total_organizations' => $this->getModel()->count(),
                'active_organizations' => $this->getModel()->where('status', 'active')->count(),
                'inactive_organizations' => $this->getModel()->where('status', 'inactive')->count(),
                'trial_organizations' => $this->getModel()->inTrial()->count(),
                'expired_trial_organizations' => $this->getModel()->trialExpired()->count(),
                'organizations_with_users' => $this->getModel()->whereHas('users')->count(),
                'organizations_without_users' => $this->getModel()->whereDoesntHave('users')->count(),
                'business_type_stats' => $this->getModel()
                    ->selectRaw('business_type, COUNT(*) as count')
                    ->groupBy('business_type')
                    ->pluck('count', 'business_type')
                    ->toArray(),
                'industry_stats' => $this->getModel()
                    ->selectRaw('industry, COUNT(*) as count')
                    ->groupBy('industry')
                    ->pluck('count', 'industry')
                    ->toArray(),
                'company_size_stats' => $this->getModel()
                    ->selectRaw('company_size, COUNT(*) as count')
                    ->groupBy('company_size')
                    ->pluck('count', 'company_size')
                    ->toArray(),
                'subscription_status_stats' => $this->getModel()
                    ->selectRaw('subscription_status, COUNT(*) as count')
                    ->groupBy('subscription_status')
                    ->pluck('count', 'subscription_status')
                    ->toArray()
            ];
        });
    }

    /**
     * Get organization users
     */
    public function getOrganizationUsers(string $id): array
    {
        $organization = $this->getOrganizationById($id, ['users']);

        if (!$organization) {
            return [];
        }

        return [
            'organization' => [
                'id' => $organization->id,
                'name' => $organization->name,
                'org_code' => $organization->org_code,
            ],
            'users' => $organization->users->map(function ($user) {
                return [
                    'id' => $user->id,
                    'email' => $user->email,
                    'full_name' => $user->full_name,
                    'username' => $user->username,
                    'role' => $user->role,
                    'status' => $user->status,
                    'created_at' => $user->created_at?->toISOString(),
                ];
            }),
            'total_users' => $organization->users->count(),
        ];
    }

    /**
     * Add user to organization
     */
    public function addUserToOrganization(string $organizationId, string $userId, string $role = 'member'): bool
    {
        try {
            DB::beginTransaction();

            $organization = $this->getById($organizationId);
            $user = User::find($userId);

            if (!$organization || !$user) {
                return false;
            }

            // Check if user is already in organization
            if ($organization->users()->where('id', $userId)->exists()) {
                throw new \Exception('User is already a member of this organization');
            }

            // Add user to organization
            $user->update(['organization_id' => $organizationId]);

            Log::info('User added to organization', [
                'organization_id' => $organizationId,
                'user_id' => $userId,
                'role' => $role
            ]);

            DB::commit();

            return true;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error adding user to organization', [
                'error' => $e->getMessage(),
                'organization_id' => $organizationId,
                'user_id' => $userId
            ]);
            throw $e;
        }
    }

    /**
     * Remove user from organization
     */
    public function removeUserFromOrganization(string $organizationId, string $userId): bool
    {
        try {
            DB::beginTransaction();

            $organization = $this->getById($organizationId);
            $user = User::find($userId);

            if (!$organization || !$user) {
                return false;
            }

            // Remove user from organization
            $user->update(['organization_id' => null]);

            Log::info('User removed from organization', [
                'organization_id' => $organizationId,
                'user_id' => $userId
            ]);

            DB::commit();

            return true;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error removing user from organization', [
                'error' => $e->getMessage(),
                'organization_id' => $organizationId,
                'user_id' => $userId
            ]);
            throw $e;
        }
    }

    /**
     * Update organization subscription
     */
    public function updateSubscription(string $id, array $subscriptionData): ?Organization
    {
        try {
            DB::beginTransaction();

            $organization = $this->getById($id);

            if (!$organization) {
                return null;
            }

            $organization->update($subscriptionData);

            // Clear cache
            $this->clearOrganizationCache();

            DB::commit();

            Log::info('Organization subscription updated', [
                'organization_id' => $organization->id,
                'subscription_data' => $subscriptionData
            ]);

            return $organization->fresh();
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error updating organization subscription', [
                'error' => $e->getMessage(),
                'id' => $id,
                'data' => $subscriptionData
            ]);
            throw $e;
        }
    }

    /**
     * Generate unique organization code
     */
    private function generateOrgCode(string $name): string
    {
        $baseCode = Str::upper(Str::slug($name, ''));
        $code = $baseCode;
        $counter = 1;

        while ($this->getModel()->where('org_code', $code)->exists()) {
            $code = $baseCode . $counter;
            $counter++;
        }

        return $code;
    }

    /**
     * Clear organization cache
     */
    private function clearOrganizationCache(): void
    {
        Cache::forget('organizations_active');
        Cache::forget('organization_statistics');
    }

    /**
     * Validate organization data
     */
    public function validateOrganizationData(array $data): bool
    {
        $requiredFields = ['name', 'email'];
        
        foreach ($requiredFields as $field) {
            if (!isset($data[$field]) || empty($data[$field])) {
                return false;
            }
        }

        return true;
    }

    /**
     * Get organizations by business type
     */
    public function getOrganizationsByBusinessType(string $businessType): Collection
    {
        return $this->getModel()
            ->where('business_type', $businessType)
            ->with(['subscriptionPlan', 'users'])
            ->get();
    }

    /**
     * Get organizations by industry
     */
    public function getOrganizationsByIndustry(string $industry): Collection
    {
        return $this->getModel()
            ->where('industry', $industry)
            ->with(['subscriptionPlan', 'users'])
            ->get();
    }

    /**
     * Get organizations by company size
     */
    public function getOrganizationsByCompanySize(string $companySize): Collection
    {
        return $this->getModel()
            ->where('company_size', $companySize)
            ->with(['subscriptionPlan', 'users'])
            ->get();
    }
}
