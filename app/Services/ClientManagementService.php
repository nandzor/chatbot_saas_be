<?php

namespace App\Services;

use App\Models\Organization;
use App\Models\User;
use App\Models\ActivityLog;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class ClientManagementService
{
    /**
     * Get organizations with advanced filtering, sorting, and pagination
     */
    public function getOrganizations(array $params = []): array
    {
        $query = Organization::with(['users', 'subscriptionPlan']);

        // Apply filters
        if (!empty($params['search'])) {
            $search = $params['search'];
            $query->where(function (Builder $q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('org_code', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('display_name', 'like', "%{$search}%");
            });
        }

        if (!empty($params['status'])) {
            $query->where('status', $params['status']);
        }

        if (!empty($params['business_type'])) {
            $query->where('business_type', $params['business_type']);
        }

        if (!empty($params['industry'])) {
            $query->where('industry', $params['industry']);
        }

        if (!empty($params['company_size'])) {
            $query->where('company_size', $params['company_size']);
        }

        if (!empty($params['plan_id'])) {
            $query->where('subscription_plan_id', $params['plan_id']);
        }

        if (!empty($params['subscription_status'])) {
            $query->where('subscription_status', $params['subscription_status']);
        }

        if (!empty($params['date_from'])) {
            $query->whereDate('created_at', '>=', $params['date_from']);
        }

        if (!empty($params['date_to'])) {
            $query->whereDate('created_at', '<=', $params['date_to']);
        }

        // Apply sorting
        $sortBy = $params['sort_by'] ?? 'created_at';
        $sortOrder = $params['sort_order'] ?? 'desc';
        $query->orderBy($sortBy, $sortOrder);

        // Get pagination parameters
        $page = (int) ($params['page'] ?? 1);
        $perPage = (int) ($params['per_page'] ?? 15);
        $perPage = min($perPage, 100); // Limit max per page

        // Execute query with pagination
        $organizations = $query->paginate($perPage, ['*'], 'page', $page);

        // Transform data
        $transformedData = $organizations->map(function ($org) {
            return $this->transformOrganizationData($org);
        });

        return [
            'data' => $transformedData,
            'pagination' => [
                'current_page' => $organizations->currentPage(),
                'per_page' => $organizations->perPage(),
                'total' => $organizations->total(),
                'last_page' => $organizations->lastPage(),
                'from' => $organizations->firstItem(),
                'to' => $organizations->lastItem(),
                'has_more_pages' => $organizations->hasMorePages()
            ]
        ];
    }

    /**
     * Get organization statistics
     */
    public function getStatistics(): array
    {
        $totalOrganizations = Organization::count();
        $activeOrganizations = Organization::where('status', 'active')->count();
        $trialOrganizations = Organization::where('status', 'trial')->count();
        $suspendedOrganizations = Organization::where('status', 'suspended')->count();
        $inactiveOrganizations = Organization::where('status', 'inactive')->count();

        // Get growth statistics
        $thisMonth = Carbon::now()->startOfMonth();
        $lastMonth = Carbon::now()->subMonth()->startOfMonth();

        $newThisMonth = Organization::where('created_at', '>=', $thisMonth)->count();
        $newLastMonth = Organization::whereBetween('created_at', [$lastMonth, $thisMonth])->count();

        $growthRate = $newLastMonth > 0 ? (($newThisMonth - $newLastMonth) / $newLastMonth) * 100 : 0;

        // Get user statistics
        $totalUsers = User::count();
        $activeUsers = User::where('status', 'active')->count();

        // Get plan distribution
        $planDistribution = Organization::select('subscription_plan_id', DB::raw('count(*) as count'))
            ->groupBy('subscription_plan_id')
            ->get()
            ->mapWithKeys(function ($item) {
                return [$item->subscription_plan_id => $item->count];
            });

        // Get industry distribution
        $industryDistribution = Organization::select('industry', DB::raw('count(*) as count'))
            ->whereNotNull('industry')
            ->groupBy('industry')
            ->orderBy('count', 'desc')
            ->get()
            ->mapWithKeys(function ($item) {
                return [$item->industry => $item->count];
            });

        return [
            'total_organizations' => $totalOrganizations,
            'active_organizations' => $activeOrganizations,
            'trial_organizations' => $trialOrganizations,
            'suspended_organizations' => $suspendedOrganizations,
            'inactive_organizations' => $inactiveOrganizations,
            'total_users' => $totalUsers,
            'active_users' => $activeUsers,
            'new_this_month' => $newThisMonth,
            'growth_rate' => round($growthRate, 2),
            'plan_distribution' => $planDistribution,
            'industry_distribution' => $industryDistribution,
            'status_distribution' => [
                'active' => $activeOrganizations,
                'trial' => $trialOrganizations,
                'suspended' => $suspendedOrganizations,
                'inactive' => $inactiveOrganizations
            ]
        ];
    }

    /**
     * Get organization by ID
     */
    public function getOrganizationById(string $id): ?array
    {
        $organization = Organization::with(['users', 'subscriptionPlan', 'activityLogs'])
            ->find($id);

        if (!$organization) {
            return null;
        }

        return $this->transformOrganizationData($organization);
    }

    /**
     * Create new organization
     */
    public function createOrganization(array $data): array
    {
        DB::beginTransaction();

        try {
            // Generate unique org code if not provided
            if (empty($data['org_code'])) {
                $data['org_code'] = $this->generateOrgCode($data['name']);
            }

            // Set default values
            $data['status'] = $data['status'] ?? 'trial';
            $data['subscription_status'] = $data['subscription_status'] ?? 'trial';
            $data['timezone'] = $data['timezone'] ?? 'Asia/Jakarta';
            $data['locale'] = $data['locale'] ?? 'id';
            $data['currency'] = $data['currency'] ?? 'IDR';

            $organization = Organization::create($data);

            // Log activity
            $this->logActivity($organization->id, 'created', 'Organization created');

            DB::commit();

            return $this->transformOrganizationData($organization);
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Update organization
     */
    public function updateOrganization(string $id, array $data): ?array
    {
        $organization = Organization::find($id);

        if (!$organization) {
            return null;
        }

        DB::beginTransaction();

        try {
            $organization->update($data);

            // Log activity
            $this->logActivity($organization->id, 'updated', 'Organization updated');

            DB::commit();

            return $this->transformOrganizationData($organization->fresh());
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Delete organization
     */
    public function deleteOrganization(string $id): bool
    {
        $organization = Organization::find($id);

        if (!$organization) {
            return false;
        }

        DB::beginTransaction();

        try {
            // Log activity before deletion
            $this->logActivity($organization->id, 'deleted', 'Organization deleted');

            $organization->delete();

            DB::commit();

            return true;
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Update organization status
     */
    public function updateOrganizationStatus(string $id, string $status): ?array
    {
        $organization = Organization::find($id);

        if (!$organization) {
            return null;
        }

        DB::beginTransaction();

        try {
            $oldStatus = $organization->status;
            $organization->update(['status' => $status]);

            // Log activity
            $this->logActivity(
                $organization->id,
                'status_changed',
                "Status changed from {$oldStatus} to {$status}"
            );

            DB::commit();

            return $this->transformOrganizationData($organization->fresh());
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Bulk actions on organizations
     */
    public function bulkAction(string $action, array $organizationIds): array
    {
        $results = [
            'success' => 0,
            'failed' => 0,
            'errors' => []
        ];

        foreach ($organizationIds as $id) {
            try {
                switch ($action) {
                    case 'activate':
                        $this->updateOrganizationStatus($id, 'active');
                        break;
                    case 'suspend':
                        $this->updateOrganizationStatus($id, 'suspended');
                        break;
                    case 'delete':
                        $this->deleteOrganization($id);
                        break;
                    default:
                        throw new \InvalidArgumentException("Unknown action: {$action}");
                }
                $results['success']++;
            } catch (\Exception $e) {
                $results['failed']++;
                $results['errors'][] = [
                    'id' => $id,
                    'error' => $e->getMessage()
                ];
            }
        }

        return $results;
    }

    /**
     * Export organizations
     */
    public function exportOrganizations(array $params = []): array
    {
        $organizations = $this->getOrganizations($params);

        // Transform data for export
        $exportData = $organizations['data']->map(function ($org) {
            return [
                'ID' => $org['id'],
                'Name' => $org['name'],
                'Code' => $org['orgCode'],
                'Email' => $org['email'],
                'Phone' => $org['phone'],
                'Status' => $org['status'],
                'Business Type' => $org['businessType'],
                'Industry' => $org['industry'],
                'Company Size' => $org['companySize'],
                'Users Count' => $org['usersCount'],
                'Created At' => $org['createdAt'],
                'Updated At' => $org['updatedAt']
            ];
        });

        return [
            'data' => $exportData,
            'total' => $organizations['pagination']['total'],
            'exported_at' => now()->toISOString()
        ];
    }

    /**
     * Import organizations
     */
    public function importOrganizations($file, array $mapping): array
    {
        $results = [
            'success' => 0,
            'failed' => 0,
            'errors' => []
        ];

        // Read file and process data
        $data = $this->readImportFile($file);

        foreach ($data as $index => $row) {
            try {
                $organizationData = $this->mapImportData($row, $mapping);
                $this->createOrganization($organizationData);
                $results['success']++;
            } catch (\Exception $e) {
                $results['failed']++;
                $results['errors'][] = [
                    'row' => $index + 1,
                    'error' => $e->getMessage()
                ];
            }
        }

        return $results;
    }

    /**
     * Get organization users
     */
    public function getOrganizationUsers(string $id): array
    {
        $organization = Organization::with('users')->find($id);

        if (!$organization) {
            return [];
        }

        return $organization->users->map(function ($user) {
            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'status' => $user->status,
                'last_login' => $user->last_login_at,
                'created_at' => $user->created_at
            ];
        })->toArray();
    }

    /**
     * Get organization activity logs
     */
    public function getOrganizationActivityLogs(string $id, array $params = []): array
    {
        $query = ActivityLog::where('organization_id', $id)
            ->orderBy('created_at', 'desc');

        if (!empty($params['date_from'])) {
            $query->whereDate('created_at', '>=', $params['date_from']);
        }

        if (!empty($params['date_to'])) {
            $query->whereDate('created_at', '<=', $params['date_to']);
        }

        $page = (int) ($params['page'] ?? 1);
        $perPage = (int) ($params['per_page'] ?? 15);

        $logs = $query->paginate($perPage, ['*'], 'page', $page);

        return [
            'data' => $logs->items(),
            'pagination' => [
                'current_page' => $logs->currentPage(),
                'per_page' => $logs->perPage(),
                'total' => $logs->total(),
                'last_page' => $logs->lastPage()
            ]
        ];
    }

    /**
     * Transform organization data for API response
     */
    private function transformOrganizationData(Organization $organization): array
    {
        return [
            'id' => $organization->id,
            'orgCode' => $organization->org_code,
            'name' => $organization->name,
            'displayName' => $organization->display_name,
            'email' => $organization->email,
            'phone' => $organization->phone,
            'address' => $organization->address,
            'website' => $organization->website,
            'taxId' => $organization->tax_id,
            'businessType' => $organization->business_type,
            'industry' => $organization->industry,
            'companySize' => $organization->company_size,
            'timezone' => $organization->timezone,
            'locale' => $organization->locale,
            'currency' => $organization->currency,
            'subscriptionPlan' => $organization->subscriptionPlan,
            'subscriptionPlanId' => $organization->subscription_plan_id,
            'subscriptionStatus' => $organization->subscription_status,
            'trialEndsAt' => $organization->trial_ends_at,
            'subscriptionStartsAt' => $organization->subscription_starts_at,
            'subscriptionEndsAt' => $organization->subscription_ends_at,
            'billingCycle' => $organization->billing_cycle,
            'currentUsage' => $organization->current_usage,
            'themeConfig' => $organization->theme_config,
            'brandingConfig' => $organization->branding_config,
            'featureFlags' => $organization->feature_flags,
            'uiPreferences' => $organization->ui_preferences,
            'businessHours' => $organization->business_hours,
            'contactInfo' => $organization->contact_info,
            'socialMedia' => $organization->social_media,
            'securitySettings' => $organization->security_settings,
            'apiEnabled' => $organization->api_enabled,
            'webhookUrl' => $organization->webhook_url,
            'webhookSecret' => $organization->webhook_secret,
            'settings' => $organization->settings,
            'metadata' => $organization->metadata,
            'status' => $organization->status,
            'users' => $organization->users ?? [],
            'usersCount' => $organization->users ? $organization->users->count() : 0,
            'agentsCount' => $organization->agents_count ?? 0,
            'messagesSent' => $organization->messages_sent ?? 0,
            'createdAt' => $organization->created_at,
            'updatedAt' => $organization->updated_at,
            'deletedAt' => $organization->deleted_at
        ];
    }

    /**
     * Generate unique organization code
     */
    private function generateOrgCode(string $name): string
    {
        $prefix = strtoupper(substr(preg_replace('/[^A-Za-z0-9]/', '', $name), 0, 3));
        $counter = 1;

        do {
            $code = $prefix . str_pad($counter, 3, '0', STR_PAD_LEFT);
            $exists = Organization::where('org_code', $code)->exists();
            $counter++;
        } while ($exists && $counter < 1000);

        return $code;
    }

    /**
     * Log activity
     */
    private function logActivity(string $organizationId, string $action, string $description): void
    {
        ActivityLog::create([
            'organization_id' => $organizationId,
            'action' => $action,
            'description' => $description,
            'user_id' => auth()->id(),
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent()
        ]);
    }

    /**
     * Read import file
     */
    private function readImportFile($file): array
    {
        // Implementation depends on file type (CSV, Excel, etc.)
        // This is a simplified version
        return [];
    }

    /**
     * Map import data
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
}
