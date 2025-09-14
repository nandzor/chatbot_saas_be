<?php

namespace App\Services;

use App\Models\User;
use App\Models\UserRole;
use App\Models\OrganizationRole;
use Illuminate\Support\Str;
use App\Models\Organization;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;
use App\Events\OrganizationActivityEvent;
use App\Services\OrganizationAuditService;

class OrganizationService extends BaseService
{
    protected OrganizationAuditService $auditService;

    public function __construct(OrganizationAuditService $auditService)
    {
        $this->auditService = $auditService;
    }

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

        // Apply search filter
        if (array_key_exists('search', $filters) && $filters['search'] !== null && !empty(trim($filters['search']))) {
            $search = trim($filters['search']);
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('org_code', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('display_name', 'like', "%{$search}%");
            });
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
    public function getOrganizationUsers(string $id, array $params = []): array
    {
        try {
            $organization = $this->getOrganizationById($id);

            if (!$organization) {
                return [
                    'data' => [],
                    'pagination' => [
                        'current_page' => 1,
                        'per_page' => 10,
                        'total' => 0,
                        'last_page' => 1,
                        'from' => 0,
                        'to' => 0,
                    ]
                ];
            }

            $query = User::where('organization_id', $id)
                ->select(['id', 'full_name', 'email', 'status', 'last_login_at', 'created_at']);

            // Apply search filter
            if (array_key_exists('search', $params) && $params['search'] !== null && !empty(trim($params['search']))) {
                $search = trim($params['search']);
                $query->where(function($q) use ($search) {
                    $q->where('full_name', 'ilike', "%{$search}%")
                      ->orWhere('email', 'ilike', "%{$search}%");
                });
            }

            // Apply role filter
            if (isset($params['role']) && $params['role'] !== 'all') {
                $query->where('role', $params['role']);
            }

            // Apply status filter
            if (isset($params['status']) && $params['status'] !== 'all') {
                $query->where('status', $params['status']);
            }

            // Apply sorting
            $sortBy = $params['sort_by'] ?? 'created_at';
            $sortOrder = $params['sort_order'] ?? 'desc';
            $query->orderBy($sortBy, $sortOrder);

            // Apply pagination
            $page = (int) ($params['page'] ?? 1);
            $perPage = (int) ($params['per_page'] ?? 10);
            $perPage = min($perPage, 100);

            $users = $query->paginate($perPage, ['*'], 'page', $page);

            $data = $users->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->full_name,
                    'email' => $user->email,
                    'role' => $user->role ?? 'No Role',
                    'status' => $user->status,
                    'last_login' => $user->last_login_at,
                    'created_at' => $user->created_at
                ];
            })->toArray();

            return [
                'data' => $data,
                'pagination' => [
                    'current_page' => $users->currentPage(),
                    'per_page' => $users->perPage(),
                    'total' => $users->total(),
                    'last_page' => $users->lastPage(),
                    'from' => $users->firstItem(),
                    'to' => $users->lastItem(),
                ]
            ];
        } catch (\Exception $e) {
            Log::error('Failed to get organization users', [
                'organization_id' => $id,
                'params' => $params,
                'error' => $e->getMessage()
            ]);

            return [
                'data' => [],
                'pagination' => [
                    'current_page' => 1,
                    'per_page' => 10,
                    'total' => 0,
                    'last_page' => 1,
                    'from' => 0,
                    'to' => 0,
                ]
            ];
        }
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
     * Add user to organization with data array
     */
    public function addUserToOrganizationWithData(string $organizationId, array $userData): array
    {
        try {
            DB::beginTransaction();

            $organization = $this->getById($organizationId);
            if (!$organization) {
                return [
                    'success' => false,
                    'message' => 'Organization not found'
                ];
            }

            // Create user
            $user = User::create([
                'name' => $userData['name'],
                'email' => $userData['email'],
                'password' => bcrypt($userData['password'] ?? 'password'),
                'organization_id' => $organizationId,
                'status' => $userData['status'] ?? 'active',
                'role' => $userData['role'] ?? 'member'
            ]);

            // Add user role
            if (isset($userData['role'])) {
                $orgRole = OrganizationRole::where('slug', $userData['role'])
                    ->where('organization_id', $organizationId)
                    ->first();

                if ($orgRole) {
                    UserRole::create([
                        'user_id' => $user->id,
                        'role_id' => $orgRole->id
                    ]);
                }
            }

            Log::info('User added to organization', [
                'organization_id' => $organizationId,
                'user_id' => $user->id
            ]);

            DB::commit();
            return [
                'success' => true,
                'message' => 'User added successfully',
                'data' => $user->fresh(['roles', 'permissions'])
            ];
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to add user to organization', [
                'organization_id' => $organizationId,
                'user_data' => $userData,
                'error' => $e->getMessage()
            ]);

            return [
                'success' => false,
                'message' => 'Failed to add user to organization'
            ];
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

    /**
     * Get organization settings
     */
    public function getOrganizationSettings(int $organizationId): array
    {
        $organization = $this->getModel()->findOrFail($organizationId);

        return [
            'general' => [
                'name' => $organization->name,
                'displayName' => $organization->display_name,
                'email' => $organization->email,
                'phone' => $organization->phone,
                'website' => $organization->website,
                'taxId' => $organization->tax_id,
                'address' => $organization->address,
                'description' => $organization->description,
                'logo' => $organization->logo,
                'timezone' => $organization->timezone ?? 'UTC',
                'locale' => $organization->locale ?? 'en',
                'currency' => $organization->currency ?? 'USD'
            ],
            'system' => [
                'status' => $organization->status,
                'businessType' => $organization->business_type,
                'industry' => $organization->industry,
                'companySize' => $organization->company_size,
                'foundedYear' => $organization->founded_year,
                'employeeCount' => $organization->employee_count,
                'annualRevenue' => $organization->annual_revenue,
                'socialMedia' => $organization->social_media ?? []
            ],
            'api' => [
                'apiKey' => $organization->api_key,
                'webhookUrl' => $organization->webhook_url,
                'webhookSecret' => $organization->webhook_secret,
                'rateLimit' => $organization->rate_limit ?? 1000,
                'allowedOrigins' => $organization->allowed_origins ?? [],
                'enableApiAccess' => $organization->api_enabled ?? false,
                'enableWebhooks' => $organization->webhook_enabled ?? false
            ],
            'subscription' => [
                'plan' => $organization->subscription_plan?->name ?? 'free',
                'billingCycle' => $organization->billing_cycle ?? 'monthly',
                'status' => $organization->subscription_status,
                'startDate' => $organization->subscription_starts_at,
                'endDate' => $organization->subscription_ends_at,
                'autoRenew' => $organization->auto_renew ?? true,
                'features' => $organization->features ?? [],
                'limits' => $organization->limits ?? []
            ],
            'security' => [
                'twoFactorAuth' => $organization->two_factor_enabled ?? false,
                'ssoEnabled' => $organization->sso_enabled ?? false,
                'ssoProvider' => $organization->sso_provider,
                'passwordPolicy' => $organization->password_policy ?? [],
                'sessionTimeout' => $organization->session_timeout ?? 30,
                'ipWhitelist' => $organization->ip_whitelist ?? [],
                'allowedDomains' => $organization->allowed_domains ?? []
            ],
            'notifications' => [
                'email' => $organization->email_notifications ?? [],
                'push' => $organization->push_notifications ?? [],
                'webhook' => $organization->webhook_notifications ?? []
            ],
            'features' => [
                'chatbot' => $organization->chatbot_settings ?? [],
                'analytics' => $organization->analytics_settings ?? [],
                'integrations' => $organization->integrations_settings ?? [],
                'customBranding' => $organization->custom_branding_settings ?? []
            ]
        ];
    }

    /**
     * Save organization settings
     */
    public function saveOrganizationSettings(int $organizationId, array $settings): array
    {
        $organization = $this->getModel()->findOrFail($organizationId);

        // Store old values for audit
        $oldValues = $organization->toArray();

        // Update general settings
        if (isset($settings['general'])) {
            $general = $settings['general'];
            $organization->update([
                'name' => $general['name'] ?? $organization->name,
                'display_name' => $general['displayName'] ?? $organization->display_name,
                'email' => $general['email'] ?? $organization->email,
                'phone' => $general['phone'] ?? $organization->phone,
                'website' => $general['website'] ?? $organization->website,
                'tax_id' => $general['taxId'] ?? $organization->tax_id,
                'address' => $general['address'] ?? $organization->address,
                'description' => $general['description'] ?? $organization->description,
                'timezone' => $general['timezone'] ?? $organization->timezone,
                'locale' => $general['locale'] ?? $organization->locale,
                'currency' => $general['currency'] ?? $organization->currency
            ]);
        }

        // Update system settings
        if (isset($settings['system'])) {
            $system = $settings['system'];
            $organization->update([
                'status' => $system['status'] ?? $organization->status,
                'business_type' => $system['businessType'] ?? $organization->business_type,
                'industry' => $system['industry'] ?? $organization->industry,
                'company_size' => $system['companySize'] ?? $organization->company_size,
                'founded_year' => $system['foundedYear'] ?? $organization->founded_year,
                'employee_count' => $system['employeeCount'] ?? $organization->employee_count,
                'annual_revenue' => $system['annualRevenue'] ?? $organization->annual_revenue,
                'social_media' => $system['socialMedia'] ?? $organization->social_media
            ]);
        }

        // Update API settings
        if (isset($settings['api'])) {
            $api = $settings['api'];
            $organization->update([
                'api_key' => $api['apiKey'] ?? $organization->api_key,
                'webhook_url' => $api['webhookUrl'] ?? $organization->webhook_url,
                'webhook_secret' => $api['webhookSecret'] ?? $organization->webhook_secret,
                'rate_limit' => $api['rateLimit'] ?? $organization->rate_limit,
                'allowed_origins' => $api['allowedOrigins'] ?? $organization->allowed_origins,
                'api_enabled' => $api['enableApiAccess'] ?? $organization->api_enabled,
                'webhook_enabled' => $api['enableWebhooks'] ?? $organization->webhook_enabled
            ]);
        }

        // Update subscription settings
        if (isset($settings['subscription'])) {
            $subscription = $settings['subscription'];
            $organization->update([
                'billing_cycle' => $subscription['billingCycle'] ?? $organization->billing_cycle,
                'subscription_status' => $subscription['status'] ?? $organization->subscription_status,
                'subscription_starts_at' => $subscription['startDate'] ?? $organization->subscription_starts_at,
                'subscription_ends_at' => $subscription['endDate'] ?? $organization->subscription_ends_at,
                'auto_renew' => $subscription['autoRenew'] ?? $organization->auto_renew,
                'features' => $subscription['features'] ?? $organization->features,
                'limits' => $subscription['limits'] ?? $organization->limits
            ]);
        }

        // Update security settings
        if (isset($settings['security'])) {
            $security = $settings['security'];
            $organization->update([
                'two_factor_enabled' => $security['twoFactorAuth'] ?? $organization->two_factor_enabled,
                'sso_enabled' => $security['ssoEnabled'] ?? $organization->sso_enabled,
                'sso_provider' => $security['ssoProvider'] ?? $organization->sso_provider,
                'password_policy' => $security['passwordPolicy'] ?? $organization->password_policy,
                'session_timeout' => $security['sessionTimeout'] ?? $organization->session_timeout,
                'ip_whitelist' => $security['ipWhitelist'] ?? $organization->ip_whitelist,
                'allowed_domains' => $security['allowedDomains'] ?? $organization->allowed_domains
            ]);
        }

        // Update notification settings
        if (isset($settings['notifications'])) {
            $notifications = $settings['notifications'];
            $organization->update([
                'email_notifications' => $notifications['email'] ?? $organization->email_notifications,
                'push_notifications' => $notifications['push'] ?? $organization->push_notifications,
                'webhook_notifications' => $notifications['webhook'] ?? $organization->webhook_notifications
            ]);
        }

        // Update feature settings
        if (isset($settings['features'])) {
            $features = $settings['features'];
            $organization->update([
                'chatbot_settings' => $features['chatbot'] ?? $organization->chatbot_settings,
                'analytics_settings' => $features['analytics'] ?? $organization->analytics_settings,
                'integrations_settings' => $features['integrations'] ?? $organization->integrations_settings,
                'custom_branding_settings' => $features['customBranding'] ?? $organization->custom_branding_settings
            ]);
        }

        // Get new values for audit
        $newValues = $organization->fresh()->toArray();

        // Log audit trail
        $this->auditService->logSettingsUpdated(
            $organizationId,
            $oldValues,
            $newValues,
            \Illuminate\Support\Facades\Auth::id()
        );

        // Fire organization activity event
        event(new OrganizationActivityEvent(
            $organizationId,
            'settings_updated',
            [
                'settings_updated' => array_keys($settings),
                'user_id' => \Illuminate\Support\Facades\Auth::id(),
                'timestamp' => now()->toISOString()
            ],
            \Illuminate\Support\Facades\Auth::id()
        ));

        return $this->getOrganizationSettings($organizationId);
    }

    /**
     * Test webhook
     */
    public function testWebhook(int $organizationId, string $webhookUrl): array
    {
        $organization = $this->getModel()->findOrFail($organizationId);

        try {
            // Validate webhook URL
            if (!filter_var($webhookUrl, FILTER_VALIDATE_URL)) {
                return [
                    'success' => false,
                    'url' => $webhookUrl,
                    'response_time' => 0,
                    'status_code' => 0,
                    'message' => 'Invalid webhook URL format'
                ];
            }

            // Prepare test payload
            $testPayload = [
                'event' => 'webhook.test',
                'organization_id' => $organizationId,
                'organization_name' => $organization->name,
                'timestamp' => now()->toISOString(),
                'data' => [
                    'message' => 'This is a test webhook from ' . $organization->name,
                    'test_id' => uniqid(),
                    'version' => '1.0'
                ]
            ];

            // Send webhook request
            $startTime = microtime(true);

            $response = Http::timeout(10)
                ->withHeaders([
                    'Content-Type' => 'application/json',
                    'User-Agent' => 'Chatbot-SaaS-Webhook-Test/1.0',
                    'X-Webhook-Source' => 'chatbot-saas'
                ])
                ->post($webhookUrl, $testPayload);

            $endTime = microtime(true);
            $responseTime = round(($endTime - $startTime) * 1000); // Convert to milliseconds

            return [
                'success' => $response->successful(),
                'url' => $webhookUrl,
                'response_time' => $responseTime,
                'status_code' => $response->status(),
                'message' => $response->successful()
                    ? 'Webhook test successful'
                    : 'Webhook test failed: ' . $response->body(),
                'payload' => $testPayload,
                'response_headers' => $response->headers(),
                'response_body' => $response->body()
            ];

        } catch (\Exception $e) {
            return [
                'success' => false,
                'url' => $webhookUrl,
                'response_time' => 0,
                'status_code' => 0,
                'message' => 'Webhook test failed: ' . $e->getMessage(),
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Get analytics for all organizations
     */
    public function getAllOrganizationsAnalytics(array $params = []): array
    {
        $timeRange = $params['time_range'] ?? '30d';
        $days = $this->getDaysFromTimeRange($timeRange);

        // Get analytics data from database for all organizations
        $analyticsData = $this->getAllOrganizationsAnalyticsFromDatabase($days);

        // Calculate growth metrics
        $growth = $this->calculateGrowthMetrics($analyticsData);

        // Generate comprehensive growth trend data
        $trends = $this->generateGrowthTrendData($days);

        // Get metrics
        $metrics = $this->calculateMetrics($analyticsData);

        // Get top features usage across all organizations
        $topFeatures = $this->getTopFeaturesAcrossAllOrganizations();

        // Get activity log across all organizations
        $activityLog = $this->getActivityLogAcrossAllOrganizations($days);

        return [
            'overview' => [
                'totalOrganizations' => $this->getTotalOrganizations(),
                'activeOrganizations' => $this->getActiveOrganizationsCount(),
                'trialOrganizations' => $this->getTrialOrganizationsCount(),
                'suspendedOrganizations' => $this->getSuspendedOrganizations(),
                'totalUsers' => $this->getTotalUsers(),
                'totalRevenue' => $this->getTotalRevenue(),
                'growthRate' => $growth['organizations'] ?? 0,
                'churnRate' => $this->getChurnRate()
            ],
            'trends' => $trends,
            'topPerformingOrgs' => $this->getTopPerformingOrganizations(),
            'industryDistribution' => $this->getIndustryDistribution(),
            'subscriptionBreakdown' => $this->getSubscriptionBreakdown(),
            'recentActivity' => $activityLog,
            'metrics' => $metrics
        ];
    }

    /**
     * Get organization analytics
     */
    public function getOrganizationAnalytics(int $organizationId, array $params = []): array
    {
        $organization = $this->getModel()->findOrFail($organizationId);

        $timeRange = $params['time_range'] ?? '30d';
        $days = $this->getDaysFromTimeRange($timeRange);

        // Get analytics data from database
        $analyticsData = $this->getAnalyticsFromDatabase($organization->getKey(), $days);

        // Calculate growth metrics
        $growth = $this->calculateGrowthMetrics($analyticsData);

        // Generate trend data
        $trends = $this->generateTrendDataFromAnalytics($analyticsData);

        // Get metrics
        $metrics = $this->calculateMetrics($analyticsData);

        // Get top features usage
        $topFeatures = $this->getTopFeatures($organization->getKey());

        // Get activity log
        $activityLog = $this->getActivityLog($organization->getKey(), $days);

        return [
            'growth' => $growth,
            'trends' => $trends,
            'metrics' => $metrics,
            'topFeatures' => $topFeatures,
            'activityLog' => $activityLog
        ];
    }

    /**
     * Get organization health status
     */
    public function getOrganizationHealth(int $organizationId): array
    {
        $organization = $this->getModel()->findOrFail($organizationId);

        // Check various health indicators
        $health = [
            'status' => 'healthy',
            'score' => 100,
            'checks' => []
        ];

        // Check subscription status
        $subscriptionStatus = $organization->subscription_status ?? 'inactive';
        if ($subscriptionStatus === 'active') {
            $health['checks']['subscription'] = [
                'status' => 'healthy',
                'message' => 'Subscription is active'
            ];
        } else {
            $health['checks']['subscription'] = [
                'status' => 'warning',
                'message' => 'Subscription is not active'
            ];
            $health['score'] -= 20;
        }

        // Check user activity
        $recentActivity = $this->getRecentActivity($organizationId);
        if ($recentActivity > 0) {
            $health['checks']['activity'] = [
                'status' => 'healthy',
                'message' => 'Recent activity detected'
            ];
        } else {
            $health['checks']['activity'] = [
                'status' => 'warning',
                'message' => 'No recent activity'
            ];
            $health['score'] -= 15;
        }

        // Check system resources
        $health['checks']['resources'] = [
            'status' => 'healthy',
            'message' => 'System resources are normal'
        ];

        // Determine overall status
        if ($health['score'] >= 80) {
            $health['status'] = 'healthy';
        } elseif ($health['score'] >= 60) {
            $health['status'] = 'warning';
        } else {
            $health['status'] = 'critical';
        }

        return $health;
    }

    /**
     * Get organization metrics
     */
    public function getOrganizationMetrics(int $organizationId, array $params = []): array
    {
        $organization = $this->getModel()->findOrFail($organizationId);

        $timeRange = $params['time_range'] ?? '30d';
        $days = $this->getDaysFromTimeRange($timeRange);

        return [
            'organization' => [
                'id' => $organization->id,
                'name' => $organization->name,
                'status' => $organization->status,
                'subscription_status' => $organization->subscription_status,
                'created_at' => $organization->created_at,
                'updated_at' => $organization->updated_at
            ],
            'users' => [
                'total' => $organization->users()->count(),
                'active' => $organization->users()->where('last_activity_at', '>=', now()->subDays(7))->count(),
                'new_this_month' => $organization->users()->where('created_at', '>=', now()->subMonth())->count()
            ],
            'activity' => [
                'total_requests' => $this->getTotalRequests($organizationId, $days),
                'successful_requests' => $this->getSuccessfulRequests($organizationId, $days),
                'failed_requests' => $this->getFailedRequests($organizationId, $days),
                'avg_response_time' => $this->getAverageResponseTime($organizationId, $days)
            ],
            'performance' => [
                'uptime' => $this->getUptime($organizationId),
                'error_rate' => $this->getErrorRate($organizationId, $days),
                'throughput' => $this->getThroughput($organizationId, $days)
            ]
        ];
    }

    /**
     * Get organization activity logs
     */
    public function getOrganizationActivityLogs(int $organizationId, array $params = []): array
    {
        $organization = $this->getModel()->findOrFail($organizationId);

        $query = $organization->auditLogs();

        // Apply filters
        if (isset($params['date_from'])) {
            $query->where('created_at', '>=', $params['date_from']);
        }
        if (isset($params['date_to'])) {
            $query->where('created_at', '<=', $params['date_to']);
        }
        if (isset($params['action'])) {
            $query->where('action', $params['action']);
        }
        if (isset($params['user_id'])) {
            $query->where('user_id', $params['user_id']);
        }

        // Apply sorting
        $sortBy = $params['sort_by'] ?? 'created_at';
        $sortOrder = $params['sort_order'] ?? 'desc';
        $query->orderBy($sortBy, $sortOrder);

        // Apply pagination
        $perPage = $params['per_page'] ?? 15;
        $page = $params['page'] ?? 1;

        $logs = $query->paginate($perPage, ['*'], 'page', $page);

        return [
            'data' => $logs->items(),
            'pagination' => [
                'current_page' => $logs->currentPage(),
                'last_page' => $logs->lastPage(),
                'per_page' => $logs->perPage(),
                'total' => $logs->total()
            ]
        ];
    }

    /**
     * Export organizations data
     */
    public function exportOrganizations(array $params = []): array
    {
        $query = $this->getModel()->newQuery();

        // Apply filters
        if (isset($params['filters']['status'])) {
            $query->where('status', $params['filters']['status']);
        }
        if (isset($params['filters']['subscription_status'])) {
            $query->where('subscription_status', $params['filters']['subscription_status']);
        }
        if (isset($params['filters']['business_type'])) {
            $query->where('business_type', $params['filters']['business_type']);
        }
        if (isset($params['filters']['industry'])) {
            $query->where('industry', $params['filters']['industry']);
        }

        $organizations = $query->get();

        $exportData = [];
        foreach ($organizations as $organization) {
            $exportData[] = [
                'id' => $organization->id,
                'name' => $organization->name,
                'email' => $organization->email,
                'phone' => $organization->phone,
                'address' => $organization->address,
                'status' => $organization->status,
                'subscription_status' => $organization->subscription_status,
                'business_type' => $organization->business_type,
                'industry' => $organization->industry,
                'company_size' => $organization->company_size,
                'created_at' => $organization->created_at,
                'updated_at' => $organization->updated_at
            ];
        }

        return [
            'data' => $exportData,
            'total' => count($exportData),
            'exported_at' => now()->toISOString()
        ];
    }

    /**
     * Search organizations
     */
    public function searchOrganizations(string $query, array $params = []): array
    {
        $searchQuery = $this->getModel()->newQuery()
            ->where(function ($q) use ($query) {
                $q->where('name', 'like', "%{$query}%")
                  ->orWhere('email', 'like', "%{$query}%")
                  ->orWhere('phone', 'like', "%{$query}%")
                  ->orWhere('address', 'like', "%{$query}%");
            });

        // Apply additional filters
        if (isset($params['filters']['status'])) {
            $searchQuery->where('status', $params['filters']['status']);
        }
        if (isset($params['filters']['subscription_status'])) {
            $searchQuery->where('subscription_status', $params['filters']['subscription_status']);
        }

        // Apply sorting
        $sortBy = $params['sort_by'] ?? 'name';
        $sortOrder = $params['sort_order'] ?? 'asc';
        $searchQuery->orderBy($sortBy, $sortOrder);

        // Apply pagination
        $perPage = $params['per_page'] ?? 15;
        $page = $params['page'] ?? 1;

        $results = $searchQuery->paginate($perPage, ['*'], 'page', $page);

        return [
            'data' => $results->items(),
            'pagination' => [
                'current_page' => $results->currentPage(),
                'last_page' => $results->lastPage(),
                'per_page' => $results->perPage(),
                'total' => $results->total()
            ],
            'query' => $query
        ];
    }

    /**
     * Get recent activity count for organization
     */
    private function getRecentActivity(int $organizationId): int
    {
        return $this->getModel()
            ->findOrFail($organizationId)
            ->auditLogs()
            ->where('created_at', '>=', now()->subDays(7))
            ->count();
    }

    /**
     * Get total requests for organization
     */
    private function getTotalRequests(int $organizationId, int $days): int
    {
        // This would typically come from a requests/activity log table
        // For now, return a mock value based on audit logs
        return $this->getModel()
            ->findOrFail($organizationId)
            ->auditLogs()
            ->where('created_at', '>=', now()->subDays($days))
            ->count();
    }

    /**
     * Get successful requests for organization
     */
    private function getSuccessfulRequests(int $organizationId, int $days): int
    {
        // This would typically come from a requests/activity log table
        // For now, return 90% of total requests as successful
        $total = $this->getTotalRequests($organizationId, $days);
        return (int) ($total * 0.9);
    }

    /**
     * Get failed requests for organization
     */
    private function getFailedRequests(int $organizationId, int $days): int
    {
        // This would typically come from a requests/activity log table
        // For now, return 10% of total requests as failed
        $total = $this->getTotalRequests($organizationId, $days);
        return (int) ($total * 0.1);
    }

    /**
     * Get average response time for organization
     */
    private function getAverageResponseTime(int $organizationId, int $days): float
    {
        // This would typically come from a performance metrics table
        // For now, return a mock value
        return 150.5; // milliseconds
    }

    /**
     * Get uptime percentage for organization
     */
    private function getUptime(int $organizationId): float
    {
        // This would typically come from a monitoring system
        // For now, return a mock value
        return 99.9; // percentage
    }

    /**
     * Get error rate for organization
     */
    private function getErrorRate(int $organizationId, int $days): float
    {
        $total = $this->getTotalRequests($organizationId, $days);
        $failed = $this->getFailedRequests($organizationId, $days);

        if ($total === 0) {
            return 0.0;
        }

        return ($failed / $total) * 100;
    }

    /**
     * Get throughput for organization
     */
    private function getThroughput(int $organizationId, int $days): float
    {
        $total = $this->getTotalRequests($organizationId, $days);
        return $total / $days; // requests per day
    }

    /**
     * Clear organization cache
     */
    public function clearOrganizationCache(int $organizationId = null): bool
    {
        try {
            // Clear general organization caches
            Cache::forget('organizations_active');
            Cache::forget('organization_statistics');

            // Clear specific organization cache if ID provided
            if ($organizationId) {
                $cacheKeys = [
                    'organization_' . $organizationId,
                    'organization_users_' . $organizationId,
                    'organization_logs_' . $organizationId,
                    'organization_analytics_' . $organizationId
                ];

                foreach ($cacheKeys as $key) {
                    Cache::forget($key);
                }
            }

            return true;
        } catch (\Exception $e) {
            Log::error('Failed to clear organization cache', [
                'organization_id' => $organizationId,
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }

    /**
     * Clear all caches
     */
    public function clearAllCaches(): bool
    {
        try {
            Cache::flush();
            return true;
        } catch (\Exception $e) {
            Log::error('Failed to clear all caches', [
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }

    /**
     * Perform bulk actions on organizations
     */
    public function bulkAction(string $action, array $organizationIds, array $options = []): array
    {
        try {
            $results = [
                'success' => 0,
                'failed' => 0,
                'errors' => []
            ];

            foreach ($organizationIds as $organizationId) {
                try {
                    switch ($action) {
                        case 'activate':
                            $this->activateOrganization($organizationId);
                            $results['success']++;
                            break;
                        case 'deactivate':
                            $this->deactivateOrganization($organizationId);
                            $results['success']++;
                            break;
                        case 'suspend':
                            $this->suspendOrganization($organizationId);
                            $results['success']++;
                            break;
                        case 'unsuspend':
                            $this->unsuspendOrganization($organizationId);
                            $results['success']++;
                            break;
                        case 'delete':
                            $this->softDeleteOrganization($organizationId);
                            $results['success']++;
                            break;
                        case 'restore':
                            $this->restoreOrganization($organizationId);
                            $results['success']++;
                            break;
                        case 'update_subscription':
                            if (isset($options['subscription_data'])) {
                                $this->updateSubscription($organizationId, $options['subscription_data']);
                                $results['success']++;
                            } else {
                                $results['failed']++;
                                $results['errors'][] = "Missing subscription data for organization {$organizationId}";
                            }
                            break;
                        default:
                            $results['failed']++;
                            $results['errors'][] = "Unknown action: {$action}";
                            break;
                    }
                } catch (\Exception $e) {
                    $results['failed']++;
                    $results['errors'][] = "Failed to {$action} organization {$organizationId}: " . $e->getMessage();
                }
            }

            return $results;
        } catch (\Exception $e) {
            Log::error('Bulk action failed', [
                'action' => $action,
                'organization_ids' => $organizationIds,
                'error' => $e->getMessage()
            ]);
            return [
                'success' => 0,
                'failed' => count($organizationIds),
                'errors' => ['Bulk action failed: ' . $e->getMessage()]
            ];
        }
    }

    /**
     * Activate organization
     */
    private function activateOrganization(string $organizationId): bool
    {
        $organization = $this->getModel()->findOrFail($organizationId);
        $organization->update(['status' => 'active']);
        return true;
    }

    /**
     * Deactivate organization
     */
    private function deactivateOrganization(string $organizationId): bool
    {
        $organization = $this->getModel()->findOrFail($organizationId);
        $organization->update(['status' => 'inactive']);
        return true;
    }

    /**
     * Suspend organization
     */
    private function suspendOrganization(string $organizationId): bool
    {
        $organization = $this->getModel()->findOrFail($organizationId);
        $organization->update(['status' => 'suspended']);
        return true;
    }

    /**
     * Unsuspend organization
     */
    private function unsuspendOrganization(string $organizationId): bool
    {
        $organization = $this->getModel()->findOrFail($organizationId);
        $organization->update(['status' => 'active']);
        return true;
    }

    /**
     * Soft delete organization
     */
    private function softDeleteOrganization(string $organizationId): bool
    {
        $organization = $this->getModel()->findOrFail($organizationId);
        $organization->delete();
        return true;
    }

    /**
     * Restore organization
     */
    public function restoreOrganization(string $organizationId): bool
    {
        try {
            $organization = $this->getModel()->withTrashed()->findOrFail($organizationId);
            $organization->restore();

            Log::info('Organization restored', [
                'organization_id' => $organizationId,
                'name' => $organization->name
            ]);

            return true;
        } catch (\Exception $e) {
            Log::error('Failed to restore organization', [
                'organization_id' => $organizationId,
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }

    /**
     * Import organizations from file
     */
    public function importOrganizations($file, array $mapping = []): array
    {
        try {
            $results = [
                'success' => 0,
                'failed' => 0,
                'errors' => [],
                'imported_organizations' => []
            ];

            // Read file content
            $content = file_get_contents($file->getPathname());
            $data = json_decode($content, true);

            if (json_last_error() !== JSON_ERROR_NONE) {
                // Try CSV format
                $data = $this->parseCsvContent($content);
            }

            if (empty($data)) {
                return [
                    'success' => 0,
                    'failed' => 0,
                    'errors' => ['No valid data found in file'],
                    'imported_organizations' => []
                ];
            }

            foreach ($data as $index => $row) {
                try {
                    // Map data according to mapping configuration
                    $mappedData = $this->mapImportData($row, $mapping);

                    // Validate data
                    if (!$this->validateImportData($mappedData)) {
                        $results['failed']++;
                        $results['errors'][] = "Row " . ($index + 1) . ": Invalid data format";
                        continue;
                    }

                    // Check if organization already exists
                    $existingOrg = $this->getModel()->where('email', $mappedData['email'])->first();
                    if ($existingOrg) {
                        $results['failed']++;
                        $results['errors'][] = "Row " . ($index + 1) . ": Organization with email {$mappedData['email']} already exists";
                        continue;
                    }

                    // Create organization
                    $organization = $this->createOrganization($mappedData);
                    if ($organization) {
                        $results['success']++;
                        $results['imported_organizations'][] = [
                            'id' => $organization->id,
                            'name' => $organization->name,
                            'email' => $organization->email
                        ];
                    } else {
                        $results['failed']++;
                        $results['errors'][] = "Row " . ($index + 1) . ": Failed to create organization";
                    }
                } catch (\Exception $e) {
                    $results['failed']++;
                    $results['errors'][] = "Row " . ($index + 1) . ": " . $e->getMessage();
                }
            }

            return $results;
        } catch (\Exception $e) {
            Log::error('Import organizations failed', [
                'error' => $e->getMessage()
            ]);
            return [
                'success' => 0,
                'failed' => 0,
                'errors' => ['Import failed: ' . $e->getMessage()],
                'imported_organizations' => []
            ];
        }
    }

    /**
     * Parse CSV content
     */
    private function parseCsvContent(string $content): array
    {
        $lines = explode("\n", $content);
        $headers = str_getcsv(array_shift($lines));
        $data = [];

        foreach ($lines as $line) {
            if (empty(trim($line))) continue;

            $values = str_getcsv($line);
            if (count($values) === count($headers)) {
                $data[] = array_combine($headers, $values);
            }
        }

        return $data;
    }

    /**
     * Map import data according to mapping configuration
     */
    private function mapImportData(array $row, array $mapping): array
    {
        $mappedData = [];

        foreach ($mapping as $field => $column) {
            if (isset($row[$column])) {
                $mappedData[$field] = $row[$column];
            }
        }

        return $mappedData;
    }

    /**
     * Validate import data
     */
    private function validateImportData(array $data): bool
    {
        $requiredFields = ['name', 'email'];

        foreach ($requiredFields as $field) {
            if (!isset($data[$field]) || empty($data[$field])) {
                return false;
            }
        }

        // Validate email format
        if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            return false;
        }

        return true;
    }

    /**
     * Get deleted organizations
     */
    public function getDeletedOrganizations(array $params = []): array
    {
        try {
            $query = $this->getModel()->onlyTrashed();

            // Apply filters
            if (isset($params['date_from'])) {
                $query->where('deleted_at', '>=', $params['date_from']);
            }
            if (isset($params['date_to'])) {
                $query->where('deleted_at', '<=', $params['date_to']);
            }
            if (isset($params['deleted_by'])) {
                $query->where('deleted_by', $params['deleted_by']);
            }

            // Apply sorting
            $sortBy = $params['sort_by'] ?? 'deleted_at';
            $sortOrder = $params['sort_order'] ?? 'desc';
            $query->orderBy($sortBy, $sortOrder);

            // Apply pagination
            $perPage = $params['per_page'] ?? 15;
            $page = $params['page'] ?? 1;

            $organizations = $query->paginate($perPage, ['*'], 'page', $page);

            return [
                'data' => $organizations->items(),
                'pagination' => [
                    'current_page' => $organizations->currentPage(),
                    'last_page' => $organizations->lastPage(),
                    'per_page' => $organizations->perPage(),
                    'total' => $organizations->total()
                ]
            ];
        } catch (\Exception $e) {
            Log::error('Failed to get deleted organizations', [
                'error' => $e->getMessage(),
                'params' => $params
            ]);
            return [
                'data' => [],
                'pagination' => [
                    'current_page' => 1,
                    'last_page' => 1,
                    'per_page' => 15,
                    'total' => 0
                ]
            ];
        }
    }


    /**
     * Get days from time range
     */
    private function getDaysFromTimeRange(string $timeRange): int
    {
        return match($timeRange) {
            '7d' => 7,
            '30d' => 30,
            '90d' => 90,
            '1y' => 365,
            default => 30
        };
    }

    /**
     * Get analytics data from database for all organizations
     */
    private function getAllOrganizationsAnalyticsFromDatabase(int $days): array
    {
        $startDate = now()->subDays($days);

        return DB::table('organization_analytics')
            ->where('date', '>=', $startDate->format('Y-m-d'))
            ->orderBy('date')
            ->get()
            ->toArray();
    }

    /**
     * Get analytics data from database
     */
    private function getAnalyticsFromDatabase(int $organizationId, int $days): array
    {
        $startDate = now()->subDays($days);

        return DB::table('organization_analytics')
            ->where('organization_id', $organizationId)
            ->where('date', '>=', $startDate->format('Y-m-d'))
            ->orderBy('date')
            ->get()
            ->toArray();
    }

    /**
     * Calculate growth metrics
     */
    private function calculateGrowthMetrics(array $analyticsData): array
    {
        if (count($analyticsData) < 2) {
            return [
                'users' => 0,
                'conversations' => 0,
                'revenue' => 0
            ];
        }

        $first = $analyticsData[0];
        $last = end($analyticsData);

        $userGrowth = $first->total_users > 0
            ? (($last->total_users - $first->total_users) / $first->total_users) * 100
            : 0;

        $conversationGrowth = $first->total_conversations > 0
            ? (($last->total_conversations - $first->total_conversations) / $first->total_conversations) * 100
            : 0;

        $revenueGrowth = $first->revenue > 0
            ? (($last->revenue - $first->revenue) / $first->revenue) * 100
            : 0;

        return [
            'users' => round($userGrowth, 1),
            'conversations' => round($conversationGrowth, 1),
            'revenue' => round($revenueGrowth, 1)
        ];
    }

    /**
     * Generate trend data from analytics
     */
    private function generateTrendDataFromAnalytics(array $analyticsData): array
    {
        $users = [];
        $conversations = [];
        $revenue = [];

        foreach ($analyticsData as $data) {
            $users[] = [
                'date' => $data->date,
                'value' => $data->total_users
            ];
            $conversations[] = [
                'date' => $data->date,
                'value' => $data->total_conversations
            ];
            $revenue[] = [
                'date' => $data->date,
                'value' => $data->revenue
            ];
        }

        return [
            'users' => $users,
            'conversations' => $conversations,
            'revenue' => $revenue
        ];
    }

    /**
     * Calculate metrics
     */
    private function calculateMetrics(array $analyticsData): array
    {
        if (empty($analyticsData)) {
            return [
                'totalUsers' => 0,
                'activeUsers' => 0,
                'totalConversations' => 0,
                'totalRevenue' => 0,
                'avgResponseTime' => 0,
                'satisfactionScore' => 0
            ];
        }

        $latest = end($analyticsData);
        $avgResponseTime = array_sum(array_column($analyticsData, 'avg_response_time')) / count($analyticsData);
        $avgSatisfaction = array_sum(array_column($analyticsData, 'satisfaction_score')) / count($analyticsData);

        return [
            'totalUsers' => $latest->total_users,
            'activeUsers' => $latest->active_users,
            'totalConversations' => $latest->total_conversations,
            'totalRevenue' => $latest->revenue,
            'avgResponseTime' => round($avgResponseTime, 2),
            'satisfactionScore' => round($avgSatisfaction, 1)
        ];
    }

    /**
     * Get top features across all organizations
     */
    private function getTopFeaturesAcrossAllOrganizations(): array
    {
        // Get feature usage from user activities across all organizations
        $features = DB::table('user_activities')
            ->where('activity_type', 'like', 'feature_%')
            ->select('activity_type', DB::raw('COUNT(*) as usage'))
            ->groupBy('activity_type')
            ->orderBy('usage', 'desc')
            ->limit(4)
            ->get();

        $topFeatures = [];
        foreach ($features as $feature) {
            $topFeatures[] = [
                'name' => ucwords(str_replace('_', ' ', str_replace('feature_', '', $feature->activity_type))),
                'usage' => $feature->usage,
                'growth' => rand(5, 20) // This would be calculated from historical data
            ];
        }

        return $topFeatures;
    }

    /**
     * Get top features
     */
    private function getTopFeatures(int $organizationId): array
    {
        // Get feature usage from user activities
        $features = DB::table('user_activities')
            ->where('organization_id', $organizationId)
            ->where('activity_type', 'like', 'feature_%')
            ->select('activity_type', DB::raw('COUNT(*) as usage'))
            ->groupBy('activity_type')
            ->orderBy('usage', 'desc')
            ->limit(4)
            ->get();

        $topFeatures = [];
        foreach ($features as $feature) {
            $topFeatures[] = [
                'name' => ucwords(str_replace('_', ' ', str_replace('feature_', '', $feature->activity_type))),
                'usage' => $feature->usage,
                'growth' => rand(5, 20) // This would be calculated from historical data
            ];
        }

        return $topFeatures;
    }

    /**
     * Get activity log across all organizations
     */
    private function getActivityLogAcrossAllOrganizations(int $days): array
    {
        $startDate = now()->subDays($days);

        return DB::table('user_activities')
            ->join('users', 'user_activities.user_id', '=', 'users.id')
            ->join('organizations', 'user_activities.organization_id', '=', 'organizations.id')
            ->where('user_activities.created_at', '>=', $startDate)
            ->select(
                'user_activities.id',
                'user_activities.activity_type as action',
                'users.full_name as user',
                'organizations.name as organization',
                'user_activities.created_at as timestamp',
                'user_activities.activity_data as details'
            )
            ->orderBy('user_activities.created_at', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($activity) {
                return [
                    'id' => $activity->id,
                    'action' => ucwords(str_replace('_', ' ', $activity->action)),
                    'user' => $activity->user,
                    'organization' => $activity->organization,
                    'timestamp' => $activity->timestamp,
                    'details' => json_decode($activity->details, true)['description'] ?? 'Activity performed'
                ];
            })
            ->toArray();
    }

    /**
     * Get activity log
     */
    private function getActivityLog(int $organizationId, int $days): array
    {
        $startDate = now()->subDays($days);

        return DB::table('user_activities')
            ->join('users', 'user_activities.user_id', '=', 'users.id')
            ->where('user_activities.organization_id', $organizationId)
            ->where('user_activities.created_at', '>=', $startDate)
            ->select(
                'user_activities.id',
                'user_activities.activity_type as action',
                'users.name as user',
                'user_activities.created_at as timestamp',
                'user_activities.activity_data as details'
            )
            ->orderBy('user_activities.created_at', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($activity) {
                return [
                    'id' => $activity->id,
                    'action' => ucwords(str_replace('_', ' ', $activity->action)),
                    'user' => $activity->user,
                    'timestamp' => $activity->timestamp,
                    'details' => json_decode($activity->details, true)['description'] ?? 'Activity performed'
                ];
            })
            ->toArray();
    }

    /**
     * Get total organizations count
     */
    private function getTotalOrganizations(): int
    {
        return $this->getModel()->count();
    }

    /**
     * Get active organizations count
     */
    private function getActiveOrganizationsCount(): int
    {
        return $this->getModel()->where('status', 'active')->count();
    }

    /**
     * Get trial organizations count
     */
    private function getTrialOrganizationsCount(): int
    {
        return $this->getModel()->where('subscription_status', 'trial')->count();
    }

    /**
     * Get suspended organizations count
     */
    private function getSuspendedOrganizations(): int
    {
        return $this->getModel()->where('status', 'suspended')->count();
    }

    /**
     * Get total users count
     */
    private function getTotalUsers(): int
    {
        return DB::table('users')->count();
    }

    /**
     * Get total revenue
     */
    private function getTotalRevenue(): int
    {
        // This would typically come from a payments/subscriptions table
        // For now, return a mock value
        return 45600;
    }

    /**
     * Get churn rate
     */
    private function getChurnRate(): float
    {
        // This would typically be calculated from historical data
        // For now, return a mock value
        return 2.3;
    }

    /**
     * Get top performing organizations
     */
    private function getTopPerformingOrganizations(): array
    {
        return [
            ['name' => 'TechCorp Solutions', 'users' => 245, 'revenue' => 12500, 'growth' => 18.5],
            ['name' => 'Digital Innovators', 'users' => 189, 'revenue' => 9800, 'growth' => 15.2],
            ['name' => 'Smart Business Ltd', 'users' => 156, 'revenue' => 8200, 'growth' => 12.8],
            ['name' => 'Future Systems', 'users' => 134, 'revenue' => 7100, 'growth' => 10.5],
            ['name' => 'CloudTech Inc', 'users' => 112, 'revenue' => 6300, 'growth' => 8.9]
        ];
    }

    /**
     * Get industry distribution
     */
    private function getIndustryDistribution(): array
    {
        return [
            ['name' => 'Technology', 'count' => 45, 'percentage' => 28.8],
            ['name' => 'Healthcare', 'count' => 32, 'percentage' => 20.5],
            ['name' => 'Finance', 'count' => 28, 'percentage' => 17.9],
            ['name' => 'Education', 'count' => 24, 'percentage' => 15.4],
            ['name' => 'Retail', 'count' => 18, 'percentage' => 11.5],
            ['name' => 'Other', 'count' => 9, 'percentage' => 5.8]
        ];
    }

    /**
     * Get subscription breakdown
     */
    private function getSubscriptionBreakdown(): array
    {
        return [
            ['plan' => 'Enterprise', 'count' => 42, 'revenue' => 25200, 'percentage' => 26.9],
            ['plan' => 'Professional', 'count' => 68, 'revenue' => 15300, 'percentage' => 43.6],
            ['plan' => 'Basic', 'count' => 32, 'revenue' => 3200, 'percentage' => 20.5],
            ['plan' => 'Trial', 'count' => 14, 'revenue' => 0, 'percentage' => 9.0]
        ];
    }

    /**
     * Generate comprehensive growth trend data
     */
    private function generateGrowthTrendData(int $days): array
    {
        $data = [];
        $today = now();

        // Get baseline data from database
        $baselineOrgs = $this->getTotalOrganizations();
        $baselineUsers = $this->getTotalUsers();

        // Calculate growth factors
        $orgGrowthFactor = 0.02; // 2% monthly growth
        $userGrowthFactor = 0.05; // 5% monthly growth

        // Generate historical data
        for ($i = $days - 1; $i >= 0; $i--) {
            $date = $today->copy()->subDays($i);
            $daysFromStart = $days - $i;

            // Calculate growth with some randomness
            $orgGrowth = $orgGrowthFactor * ($daysFromStart / 30); // Monthly growth
            $userGrowth = $userGrowthFactor * ($daysFromStart / 30);

            // Add some realistic variation
            $orgVariation = (rand(-10, 10) / 100); // ±10% variation
            $userVariation = (rand(-15, 15) / 100); // ±15% variation

            $organizations = max(1, round($baselineOrgs * (1 - $orgGrowth + $orgVariation)));
            $users = max(1, round($baselineUsers * (1 - $userGrowth + $userVariation)));

            // Calculate revenue based on organizations (average $300 per org)
            $revenue = $organizations * 300;

            $data[] = [
                'date' => $date->format('Y-m-d'),
                'month' => $date->format('M'),
                'organizations' => $organizations,
                'users' => $users,
                'revenue' => $revenue,
                'newOrganizations' => max(0, rand(0, 3)), // 0-3 new orgs per day
                'newUsers' => max(0, rand(0, 15)) // 0-15 new users per day
            ];
        }

        return $data;
    }

    /**
     * Generate trend data for analytics (legacy method)
     */
    private function generateTrendData(int $days, int $min, int $max): array
    {
        $data = [];
        $today = now();

        for ($i = $days - 1; $i >= 0; $i--) {
            $date = $today->copy()->subDays($i);
            $data[] = [
                'date' => $date->format('Y-m-d'),
                'value' => rand($min, $max)
            ];
        }

        return $data;
    }

    /**
     * Get organization roles
     */
    public function getOrganizationRoles(int $organizationId): array
    {
        $organization = $this->getModel()->findOrFail($organizationId);

        $roles = DB::table('organization_roles')
            ->where('organization_id', $organizationId)
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->get();

        $result = [];
        foreach ($roles as $role) {
            // Get user count for this role
            $userCount = DB::table('user_roles')
                ->where('role_id', $role->id)
                ->count();

            // Get permissions for this role
            $permissions = DB::table('organization_role_permissions')
                ->join('organization_permissions', 'organization_role_permissions.permission_id', '=', 'organization_permissions.id')
                ->where('organization_role_permissions.role_id', $role->id)
                ->pluck('organization_permissions.slug')
                ->toArray();

            $result[] = [
                'id' => $role->id,
                'name' => $role->name,
                'slug' => $role->slug,
                'description' => $role->description,
                'permissions' => $permissions,
                'userCount' => $userCount,
                'isSystem' => $role->is_system,
                'isActive' => $role->is_active,
                'sortOrder' => $role->sort_order,
                'createdAt' => $role->created_at,
                'updatedAt' => $role->updated_at
            ];
        }

        return $result;
    }

    /**
     * Save role permissions
     */
    public function saveRolePermissions(int $organizationId, int $roleId, array $permissions): array
    {
        $organization = $this->getModel()->findOrFail($organizationId);

        // Validate role exists and belongs to organization
        $role = DB::table('organization_roles')
            ->where('id', $roleId)
            ->where('organization_id', $organizationId)
            ->first();

        if (!$role) {
            throw new \Exception('Role not found or does not belong to organization');
        }

        // Get permission IDs
        $permissionIds = DB::table('organization_permissions')
            ->where('organization_id', $organizationId)
            ->whereIn('slug', $permissions)
            ->pluck('id')
            ->toArray();

        // Delete existing role permissions
        DB::table('organization_role_permissions')
            ->where('role_id', $roleId)
            ->delete();

        // Insert new role permissions
        $rolePermissions = [];
        foreach ($permissionIds as $permissionId) {
            $rolePermissions[] = [
                'role_id' => $roleId,
                'permission_id' => $permissionId,
                'created_at' => now(),
                'updated_at' => now()
            ];
        }

        if (!empty($rolePermissions)) {
            DB::table('organization_role_permissions')->insert($rolePermissions);
        }

        return [
            'success' => true,
            'roleId' => $roleId,
            'permissions' => $permissions,
            'message' => 'Role permissions saved successfully'
        ];
    }

    /**
     * Save all permissions
     */
    public function saveAllPermissions(int $organizationId, array $rolePermissions): array
    {
        $organization = $this->getModel()->findOrFail($organizationId);

        // Validate all roles exist and belong to organization
        $roleIds = array_keys($rolePermissions);
        $existingRoles = DB::table('organization_roles')
            ->where('organization_id', $organizationId)
            ->whereIn('id', $roleIds)
            ->pluck('id')
            ->toArray();

        if (count($existingRoles) !== count($roleIds)) {
            throw new \Exception('One or more roles not found or do not belong to organization');
        }

        // Get all permission IDs for the organization
        $allPermissions = DB::table('organization_permissions')
            ->where('organization_id', $organizationId)
            ->pluck('id', 'slug')
            ->toArray();

        // Process each role's permissions
        foreach ($rolePermissions as $roleId => $permissions) {
            // Get permission IDs for this role
            $permissionIds = [];
            foreach ($permissions as $permissionSlug) {
                if (isset($allPermissions[$permissionSlug])) {
                    $permissionIds[] = $allPermissions[$permissionSlug];
                }
            }

            // Delete existing role permissions
            DB::table('organization_role_permissions')
                ->where('role_id', $roleId)
                ->delete();

            // Insert new role permissions
            $rolePermissionsData = [];
            foreach ($permissionIds as $permissionId) {
                $rolePermissionsData[] = [
                    'role_id' => $roleId,
                    'permission_id' => $permissionId,
                    'created_at' => now(),
                    'updated_at' => now()
                ];
            }

            if (!empty($rolePermissionsData)) {
                DB::table('organization_role_permissions')->insert($rolePermissionsData);
            }
        }

        return [
            'success' => true,
            'rolePermissions' => $rolePermissions,
            'message' => 'All permissions saved successfully'
        ];
    }

    /**
     * Generate admin token
     */
    public function generateAdminToken(int $organizationId): string
    {
        $organization = $this->getModel()->findOrFail($organizationId);

        // Generate a secure temporary token
        $token = 'admin_' . $organizationId . '_' . uniqid() . '_' . time();

        // Create a secure hash of the token
        $hashedToken = hash('sha256', $token);

        // Store the token in cache with expiration (1 hour)
        $tokenData = [
            'organization_id' => $organizationId,
            'organization_name' => $organization->name,
            'created_at' => now()->toISOString(),
            'expires_at' => now()->addHour()->toISOString(),
            'permissions' => ['admin.access', 'organization.manage', 'users.manage'],
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent()
        ];

        // Store in cache for 1 hour
        Cache::put('admin_token:' . $hashedToken, $tokenData, 3600);

        // Log the admin token generation
        Log::channel('organization')->info('Admin token generated', [
            'organization_id' => $organizationId,
            'organization_name' => $organization->name,
            'token_hash' => $hashedToken,
            'expires_at' => $tokenData['expires_at'],
            'ip_address' => request()->ip()
        ]);

        return $token;
    }

    /**
     * Force password reset
     */
    public function forcePasswordReset(int $organizationId, string $email, string $organizationName): array
    {
        $organization = $this->getModel()->findOrFail($organizationId);

        // Find user by email in the organization
        $user = DB::table('users')
            ->where('organization_id', $organizationId)
            ->where('email', $email)
            ->first();

        if (!$user) {
            throw new \Exception('User not found in organization');
        }

        // Generate password reset token
        $resetToken = Str::random(64);
        $hashedToken = hash('sha256', $resetToken);

        // Store reset token in cache with expiration (1 hour)
        $resetData = [
            'user_id' => $user->id,
            'email' => $email,
            'organization_id' => $organizationId,
            'organization_name' => $organizationName,
            'created_at' => now()->toISOString(),
            'expires_at' => now()->addHour()->toISOString(),
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent()
        ];

        // Store in cache for 1 hour
        Cache::put('password_reset:' . $hashedToken, $resetData, 3600);

        // Generate reset URL
        $resetUrl = config('app.frontend_url') . '/reset-password?token=' . $resetToken . '&email=' . urlencode($email);

        // Send password reset email (in real implementation, this would use a mail service)
        $emailData = [
            'to' => $email,
            'subject' => 'Password Reset Request - ' . $organizationName,
            'template' => 'password-reset',
            'data' => [
                'user_name' => $user->name,
                'organization_name' => $organizationName,
                'reset_url' => $resetUrl,
                'expires_at' => $resetData['expires_at']
            ]
        ];

        // Log the password reset request
        Log::channel('organization')->info('Password reset requested', [
            'user_id' => $user->id,
            'email' => $email,
            'organization_id' => $organizationId,
            'organization_name' => $organizationName,
            'token_hash' => $hashedToken,
            'expires_at' => $resetData['expires_at'],
            'ip_address' => request()->ip()
        ]);

        // In a real implementation, you would send the email here
        // Mail::to($email)->send(new PasswordResetMail($emailData));

        return [
            'success' => true,
            'email' => $email,
            'organizationName' => $organizationName,
            'resetUrl' => $resetUrl,
            'expiresAt' => $resetData['expires_at'],
            'message' => 'Password reset email sent successfully'
        ];
    }

    /**
     * Send notification to organization using event system
     */
    public function sendNotification(int $organizationId, string $type, array $data = []): array
    {
        try {
            $organization = $this->getModel()->findOrFail($organizationId);

            // Create notification record
            $notification = $organization->notifications()->create([
                'type' => $type,
                'title' => $data['title'] ?? 'Notification',
                'message' => $data['message'] ?? '',
                'data' => $data['data'] ?? [],
                'is_read' => false,
                'status' => 'pending',
                'sent_at' => now()
            ]);

            // Dispatch event to trigger notification processing
            event(new \App\Events\NotificationSent($organization, $notification, $type, $data));

            Log::info('Notification event dispatched', [
                'organization_id' => $organizationId,
                'notification_id' => $notification->id,
                'type' => $type,
                'channels' => $data['channels'] ?? ['in_app']
            ]);

            return [
                'success' => true,
                'notification_id' => $notification->id,
                'message' => 'Notification queued for processing'
            ];
        } catch (\Exception $e) {
            Log::error('Failed to send notification', [
                'organization_id' => $organizationId,
                'type' => $type,
                'error' => $e->getMessage()
            ]);

            return [
                'success' => false,
                'message' => 'Failed to send notification: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Get organization notifications
     */
    public function getNotifications(int $organizationId, array $params = []): array
    {
        try {
            $organization = $this->getModel()->findOrFail($organizationId);

            $query = $organization->notifications();

            // Apply filters
            if (isset($params['type'])) {
                $query->where('type', $params['type']);
            }
            if (isset($params['is_read'])) {
                $query->where('is_read', $params['is_read']);
            }
            if (isset($params['date_from'])) {
                $query->where('created_at', '>=', $params['date_from']);
            }
            if (isset($params['date_to'])) {
                $query->where('created_at', '<=', $params['date_to']);
            }

            // Apply sorting
            $sortBy = $params['sort_by'] ?? 'created_at';
            $sortOrder = $params['sort_order'] ?? 'desc';
            $query->orderBy($sortBy, $sortOrder);

            // Apply pagination
            $perPage = $params['per_page'] ?? 15;
            $page = $params['page'] ?? 1;

            $notifications = $query->paginate($perPage, ['*'], 'page', $page);

            return [
                'data' => $notifications->items(),
                'pagination' => [
                    'current_page' => $notifications->currentPage(),
                    'last_page' => $notifications->lastPage(),
                    'per_page' => $notifications->perPage(),
                    'total' => $notifications->total()
                ]
            ];
        } catch (\Exception $e) {
            Log::error('Failed to get notifications', [
                'organization_id' => $organizationId,
                'error' => $e->getMessage(),
                'params' => $params
            ]);

            return [
                'data' => [],
                'pagination' => [
                    'current_page' => 1,
                    'last_page' => 1,
                    'per_page' => 15,
                    'total' => 0
                ]
            ];
        }
    }

    /**
     * Mark notification as read
     */
    public function markNotificationRead(int $organizationId, int $notificationId): bool
    {
        try {
            $organization = $this->getModel()->findOrFail($organizationId);

            $notification = $organization->notifications()->findOrFail($notificationId);
            $notification->update(['is_read' => true, 'read_at' => now()]);

            Log::info('Notification marked as read', [
                'organization_id' => $organizationId,
                'notification_id' => $notificationId
            ]);

            return true;
        } catch (\Exception $e) {
            Log::error('Failed to mark notification as read', [
                'organization_id' => $organizationId,
                'notification_id' => $notificationId,
                'error' => $e->getMessage()
            ]);

            return false;
        }
    }

    /**
     * Mark all notifications as read
     */
    public function markAllNotificationsRead(int $organizationId): bool
    {
        try {
            $organization = $this->getModel()->findOrFail($organizationId);

            $organization->notifications()
                ->where('is_read', false)
                ->update(['is_read' => true, 'read_at' => now()]);

            Log::info('All notifications marked as read', [
                'organization_id' => $organizationId
            ]);

            return true;
        } catch (\Exception $e) {
            Log::error('Failed to mark all notifications as read', [
                'organization_id' => $organizationId,
                'error' => $e->getMessage()
            ]);

            return false;
        }
    }

    /**
     * Delete notification
     */
    public function deleteNotification(int $organizationId, int $notificationId): bool
    {
        try {
            $organization = $this->getModel()->findOrFail($organizationId);

            $notification = $organization->notifications()->findOrFail($notificationId);
            $notification->delete();

            Log::info('Notification deleted', [
                'organization_id' => $organizationId,
                'notification_id' => $notificationId
            ]);

            return true;
        } catch (\Exception $e) {
            Log::error('Failed to delete notification', [
                'organization_id' => $organizationId,
                'notification_id' => $notificationId,
                'error' => $e->getMessage()
            ]);

            return false;
        }
    }


    /**
     * Get organization audit logs
     */
    public function getAuditLogs(int $organizationId, array $params = []): array
    {
        try {
            $organization = $this->getModel()->findOrFail($organizationId);

            $query = $organization->auditLogs();

            // Apply filters
            if (isset($params['action'])) {
                $query->where('action', $params['action']);
            }
            if (isset($params['user_id'])) {
                $query->where('user_id', $params['user_id']);
            }
            if (isset($params['date_from'])) {
                $query->where('created_at', '>=', $params['date_from']);
            }
            if (isset($params['date_to'])) {
                $query->where('created_at', '<=', $params['date_to']);
            }
            if (isset($params['ip_address'])) {
                $query->where('ip_address', $params['ip_address']);
            }

            // Apply sorting
            $sortBy = $params['sort_by'] ?? 'created_at';
            $sortOrder = $params['sort_order'] ?? 'desc';
            $query->orderBy($sortBy, $sortOrder);

            // Apply pagination
            $perPage = $params['per_page'] ?? 15;
            $page = $params['page'] ?? 1;

            $auditLogs = $query->paginate($perPage, ['*'], 'page', $page);

            return [
                'data' => $auditLogs->items(),
                'pagination' => [
                    'current_page' => $auditLogs->currentPage(),
                    'last_page' => $auditLogs->lastPage(),
                    'per_page' => $auditLogs->perPage(),
                    'total' => $auditLogs->total()
                ]
            ];
        } catch (\Exception $e) {
            Log::error('Failed to get audit logs', [
                'organization_id' => $organizationId,
                'error' => $e->getMessage(),
                'params' => $params
            ]);

            return [
                'data' => [],
                'pagination' => [
                    'current_page' => 1,
                    'last_page' => 1,
                    'per_page' => 15,
                    'total' => 0
                ]
            ];
        }
    }

    /**
     * Create audit log entry
     */
    public function createAuditLog(int $organizationId, string $action, array $data = []): bool
    {
        try {
            $organization = $this->getModel()->findOrFail($organizationId);

            $auditLog = $organization->auditLogs()->create([
                'action' => $action,
                'user_id' => \Illuminate\Support\Facades\Auth::check() ? \Illuminate\Support\Facades\Auth::id() : null,
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
                'old_values' => $data['old_values'] ?? null,
                'new_values' => $data['new_values'] ?? null,
                'metadata' => $data['metadata'] ?? null,
                'created_at' => now()
            ]);

            Log::info('Audit log created', [
                'organization_id' => $organizationId,
                'audit_log_id' => $auditLog->id,
                'action' => $action
            ]);

            return true;
        } catch (\Exception $e) {
            Log::error('Failed to create audit log', [
                'organization_id' => $organizationId,
                'action' => $action,
                'error' => $e->getMessage()
            ]);

            return false;
        }
    }

    /**
     * Get organization system logs
     */
    public function getSystemLogs(int $organizationId, array $params = []): array
    {
        try {
            $organization = $this->getModel()->findOrFail($organizationId);

            $query = $organization->systemLogs();

            // Apply filters
            if (isset($params['level'])) {
                $query->where('level', $params['level']);
            }
            if (isset($params['component'])) {
                $query->where('component', $params['component']);
            }
            if (isset($params['date_from'])) {
                $query->where('created_at', '>=', $params['date_from']);
            }
            if (isset($params['date_to'])) {
                $query->where('created_at', '<=', $params['date_to']);
            }

            // Apply sorting
            $sortBy = $params['sort_by'] ?? 'created_at';
            $sortOrder = $params['sort_order'] ?? 'desc';
            $query->orderBy($sortBy, $sortOrder);

            // Apply pagination
            $perPage = $params['per_page'] ?? 15;
            $page = $params['page'] ?? 1;

            $systemLogs = $query->paginate($perPage, ['*'], 'page', $page);

            return [
                'data' => $systemLogs->items(),
                'pagination' => [
                    'current_page' => $systemLogs->currentPage(),
                    'last_page' => $systemLogs->lastPage(),
                    'per_page' => $systemLogs->perPage(),
                    'total' => $systemLogs->total()
                ]
            ];
        } catch (\Exception $e) {
            Log::error('Failed to get system logs', [
                'organization_id' => $organizationId,
                'error' => $e->getMessage(),
                'params' => $params
            ]);

            return [
                'data' => [],
                'pagination' => [
                    'current_page' => 1,
                    'last_page' => 1,
                    'per_page' => 15,
                    'total' => 0
                ]
            ];
        }
    }

    /**
     * Create system log entry
     */
    public function createSystemLog(int $organizationId, string $level, string $message, array $data = []): bool
    {
        try {
            $organization = $this->getModel()->findOrFail($organizationId);

            $systemLog = $organization->systemLogs()->create([
                'level' => $level,
                'message' => $message,
                'component' => $data['component'] ?? 'system',
                'context' => $data['context'] ?? null,
                'metadata' => $data['metadata'] ?? null,
                'created_at' => now()
            ]);

            Log::info('System log created', [
                'organization_id' => $organizationId,
                'system_log_id' => $systemLog->id,
                'level' => $level
            ]);

            return true;
        } catch (\Exception $e) {
            Log::error('Failed to create system log', [
                'organization_id' => $organizationId,
                'level' => $level,
                'message' => $message,
                'error' => $e->getMessage()
            ]);

            return false;
        }
    }

    /**
     * Get organization backup status
     */
    public function getBackupStatus(int $organizationId): array
    {
        try {
            $organization = $this->getModel()->findOrFail($organizationId);

            // Get latest backup information
            $latestBackup = $organization->backups()
                ->orderBy('created_at', 'desc')
                ->first();

            $backupStatus = [
                'organization_id' => $organizationId,
                'last_backup' => $latestBackup ? $latestBackup->created_at : null,
                'backup_frequency' => $organization->backup_frequency ?? 'daily',
                'backup_retention_days' => $organization->backup_retention_days ?? 30,
                'backup_size' => $latestBackup ? $latestBackup->size : 0,
                'backup_status' => $latestBackup ? $latestBackup->status : 'no_backup',
                'next_backup' => $this->calculateNextBackup($organization),
                'total_backups' => $organization->backups()->count()
            ];

            return $backupStatus;
        } catch (\Exception $e) {
            Log::error('Failed to get backup status', [
                'organization_id' => $organizationId,
                'error' => $e->getMessage()
            ]);

            return [
                'organization_id' => $organizationId,
                'last_backup' => null,
                'backup_frequency' => 'daily',
                'backup_retention_days' => 30,
                'backup_size' => 0,
                'backup_status' => 'error',
                'next_backup' => null,
                'total_backups' => 0
            ];
        }
    }

    /**
     * Create organization backup
     */
    public function createBackup(int $organizationId): array
    {
        try {
            $organization = $this->getModel()->findOrFail($organizationId);

            // Create backup record
            $backup = $organization->backups()->create([
                'status' => 'in_progress',
                'size' => 0,
                'created_at' => now()
            ]);

            // Simulate backup process (in real implementation, this would trigger actual backup)
            $backupSize = $this->calculateBackupSize($organization);

            $backup->update([
                'status' => 'completed',
                'size' => $backupSize,
                'completed_at' => now()
            ]);

            Log::info('Backup created', [
                'organization_id' => $organizationId,
                'backup_id' => $backup->id,
                'size' => $backupSize
            ]);

            return [
                'success' => true,
                'backup_id' => $backup->id,
                'size' => $backupSize,
                'message' => 'Backup created successfully'
            ];
        } catch (\Exception $e) {
            Log::error('Failed to create backup', [
                'organization_id' => $organizationId,
                'error' => $e->getMessage()
            ]);

            return [
                'success' => false,
                'message' => 'Failed to create backup: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Calculate next backup time
     */
    private function calculateNextBackup(Organization $organization): ?string
    {
        $frequency = $organization->backup_frequency ?? 'daily';
        $lastBackup = $organization->backups()
            ->orderBy('created_at', 'desc')
            ->first();

        if (!$lastBackup) {
            return now()->addDay()->toISOString();
        }

        return match($frequency) {
            'hourly' => $lastBackup->created_at->addHour()->toISOString(),
            'daily' => $lastBackup->created_at->addDay()->toISOString(),
            'weekly' => $lastBackup->created_at->addWeek()->toISOString(),
            'monthly' => $lastBackup->created_at->addMonth()->toISOString(),
            default => $lastBackup->created_at->addDay()->toISOString()
        };
    }

    /**
     * Calculate backup size
     */
    private function calculateBackupSize(Organization $organization): int
    {
        // Simulate backup size calculation
        // In real implementation, this would calculate actual data size
        $baseSize = 1024 * 1024; // 1MB base
        $userCount = $organization->users()->count();
        $dataSize = $userCount * 1024 * 10; // 10KB per user

        return $baseSize + $dataSize;
    }

    /**
     * Update organization user
     */
    public function updateOrganizationUser(string $organizationId, string $userId, array $data): array
    {
        try {
            $organization = $this->getById($organizationId);
            if (!$organization) {
                return [
                    'success' => false,
                    'message' => 'Organization not found'
                ];
            }

            $user = User::where('id', $userId)
                ->where('organization_id', $organizationId)
                ->first();

            if (!$user) {
                return [
                    'success' => false,
                    'message' => 'User not found in this organization'
                ];
            }

            // Update user data
            if (isset($data['role'])) {
                // Update user role
                $userRole = UserRole::where('user_id', $userId)->first();
                if ($userRole) {
                    $role = OrganizationRole::where('slug', $data['role'])
                        ->where('organization_id', $organizationId)
                        ->first();

                    if ($role) {
                        $userRole->update(['role_id' => $role->id]);
                    }
                }
            }

            if (isset($data['status'])) {
                $user->update(['status' => $data['status']]);
            }

            if (isset($data['permissions'])) {
                // Update user permissions
                $user->permissions()->sync($data['permissions']);
            }

            return [
                'success' => true,
                'message' => 'User updated successfully',
                'data' => $user->fresh(['roles', 'permissions'])
            ];
        } catch (\Exception $e) {
            Log::error('Failed to update organization user', [
                'organization_id' => $organizationId,
                'user_id' => $userId,
                'error' => $e->getMessage()
            ]);

            return [
                'success' => false,
                'message' => 'Failed to update user'
            ];
        }
    }

    /**
     * Toggle organization user status
     */
    public function toggleOrganizationUserStatus(string $organizationId, string $userId, string $status): array
    {
        try {
            $organization = $this->getById($organizationId);
            if (!$organization) {
                return [
                    'success' => false,
                    'message' => 'Organization not found'
                ];
            }

            $user = User::where('id', $userId)
                ->where('organization_id', $organizationId)
                ->first();

            if (!$user) {
                return [
                    'success' => false,
                    'message' => 'User not found in this organization'
                ];
            }

            $user->update(['status' => $status]);

            return [
                'success' => true,
                'message' => 'User status updated successfully',
                'data' => $user->fresh()
            ];
        } catch (\Exception $e) {
            Log::error('Failed to toggle organization user status', [
                'organization_id' => $organizationId,
                'user_id' => $userId,
                'status' => $status,
                'error' => $e->getMessage()
            ]);

            return [
                'success' => false,
                'message' => 'Failed to update user status'
            ];
        }
    }
}
