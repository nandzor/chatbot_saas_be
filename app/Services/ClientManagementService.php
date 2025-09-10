<?php

namespace App\Services;

use App\Models\Organization;
use App\Models\User;
use App\Models\AuditLog;
use App\Events\OrganizationCreated;
use App\Events\OrganizationUpdated;
use App\Events\OrganizationDeleted;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

/**
 * Client Management Service
 *
 * This service handles all client (organization) management operations including:
 * - CRUD operations for organizations
 * - Advanced filtering, sorting, and pagination
 * - Statistics and analytics
 * - Import/export functionality
 * - Activity logging and audit trails
 * - Bulk operations
 *
 * @package App\Services
 * @author Your Name
 * @version 1.0.0
 */
class ClientManagementService
{
    /**
     * Cache keys for different data types
     */
    private const CACHE_KEYS = [
        'statistics' => 'organization_statistics',
        'organization' => 'organization_',
        'users' => 'organization_users_',
        'logs' => 'organization_logs_'
    ];

    /**
     * Cache TTL in seconds
     */
    private const CACHE_TTL = [
        'statistics' => 300, // 5 minutes
        'organization' => 600, // 10 minutes
        'users' => 300, // 5 minutes
        'logs' => 180 // 3 minutes
    ];
    /**
     * Get organizations with advanced filtering, sorting, and pagination
     *
     * @param array $params Filtering and pagination parameters
     * @return array Paginated organizations with metadata
     * @throws \InvalidArgumentException When validation fails
     */
    public function getOrganizations(array $params = []): array
    {
        try {
            // Validate pagination parameters
            $validator = Validator::make($params, [
                'page' => 'sometimes|integer|min:1',
                'per_page' => 'sometimes|integer|min:1|max:100',
                'sort_by' => 'sometimes|string|in:name,email,created_at,updated_at,status',
                'sort_order' => 'sometimes|string|in:asc,desc',
                'search' => 'sometimes|string|max:255',
                'status' => 'sometimes|string|in:active,trial,suspended,inactive',
                'business_type' => 'sometimes|string|max:100',
                'industry' => 'sometimes|string|max:100',
                'company_size' => 'sometimes|string|max:50',
                'plan_id' => 'sometimes|uuid',
                'subscription_status' => 'sometimes|string|in:active,trial,expired,cancelled',
                'date_from' => 'sometimes|date',
                'date_to' => 'sometimes|date|after_or_equal:date_from'
            ]);

            if ($validator->fails()) {
                throw new \InvalidArgumentException('Invalid parameters: ' . implode(', ', $validator->errors()->all()));
            }

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
        } catch (\Exception $e) {
            Log::error('Failed to get organizations', [
                'params' => $params,
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }

    /**
     * Get organization statistics with caching
     *
     * @param bool $useCache Whether to use cached data
     * @return array Statistics data
     */
    public function getStatistics(bool $useCache = true): array
    {
        $cacheKey = 'organization_statistics';

        if ($useCache && Cache::has($cacheKey)) {
            return Cache::get($cacheKey);
        }

        try {
            // Use single query with conditional aggregation for better performance
            $statusCounts = Organization::selectRaw(
                'COUNT(*) as total,
                SUM(CASE WHEN status = \'active\' THEN 1 ELSE 0 END) as active,
                SUM(CASE WHEN status = \'trial\' THEN 1 ELSE 0 END) as trial,
                SUM(CASE WHEN status = \'suspended\' THEN 1 ELSE 0 END) as suspended,
                SUM(CASE WHEN status = \'inactive\' THEN 1 ELSE 0 END) as inactive'
            )->first();

            // Get user statistics with single query
            $userCounts = User::selectRaw(
                'COUNT(*) as total,
                SUM(CASE WHEN status = \'active\' THEN 1 ELSE 0 END) as active'
            )->first();

            // Get growth statistics
            $thisMonth = Carbon::now()->startOfMonth();
            $lastMonth = Carbon::now()->subMonth()->startOfMonth();

            $growthStats = Organization::selectRaw(
                'SUM(CASE WHEN created_at >= ? THEN 1 ELSE 0 END) as this_month,
                SUM(CASE WHEN created_at >= ? AND created_at < ? THEN 1 ELSE 0 END) as last_month',
                [$thisMonth, $lastMonth, $thisMonth]
            )->first();

            $growthRate = $growthStats->last_month > 0
                ? (($growthStats->this_month - $growthStats->last_month) / $growthStats->last_month) * 100
                : 0;

            // Get plan distribution with single query
            $planDistribution = Organization::select('subscription_plan_id', DB::raw('count(*) as count'))
                ->whereNotNull('subscription_plan_id')
                ->groupBy('subscription_plan_id')
                ->pluck('count', 'subscription_plan_id');

            // Get industry distribution with single query
            $industryDistribution = Organization::select('industry', DB::raw('count(*) as count'))
                ->whereNotNull('industry')
                ->groupBy('industry')
                ->orderBy('count', 'desc')
                ->pluck('count', 'industry');

            $statistics = [
                'total_organizations' => $statusCounts->total,
                'active_organizations' => $statusCounts->active,
                'trial_organizations' => $statusCounts->trial,
                'suspended_organizations' => $statusCounts->suspended,
                'inactive_organizations' => $statusCounts->inactive,
                'total_users' => $userCounts->total,
                'active_users' => $userCounts->active,
                'new_this_month' => $growthStats->this_month,
                'growth_rate' => round($growthRate, 2),
                'plan_distribution' => $planDistribution,
                'industry_distribution' => $industryDistribution,
                'status_distribution' => [
                    'active' => $statusCounts->active,
                    'trial' => $statusCounts->trial,
                    'suspended' => $statusCounts->suspended,
                    'inactive' => $statusCounts->inactive
                ],
                'cached_at' => now()->toISOString()
            ];

            // Cache for 5 minutes
            if ($useCache) {
                Cache::put($cacheKey, $statistics, self::CACHE_TTL['statistics']);
            }

            return $statistics;

        } catch (\Exception $e) {
            Log::error('Failed to get organization statistics', [
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }

    /**
     * Get organization by ID with caching
     *
     * @param string $id Organization ID
     * @param bool $useCache Whether to use cached data
     * @return array|null Organization data or null if not found
     */
    public function getOrganizationById(string $id, bool $useCache = true): ?array
    {
        $cacheKey = "organization_{$id}";

        if ($useCache && Cache::has($cacheKey)) {
            return Cache::get($cacheKey);
        }

        try {
            $organization = Organization::with(['users', 'subscriptionPlan'])
                ->find($id);

            if (!$organization) {
                return null;
            }

            $data = $this->transformOrganizationData($organization);

            // Cache for 10 minutes
            if ($useCache) {
                Cache::put($cacheKey, $data, self::CACHE_TTL['organization']);
            }

            return $data;

        } catch (\Exception $e) {
            Log::error('Failed to get organization by ID', [
                'id' => $id,
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }

    /**
     * Create new organization
     */
    public function createOrganization(array $data): array
    {
        // Sanitize and validate data
        $data = $this->sanitizeOrganizationData($data);
        $data = $this->validateOrganizationData($data, 'create');

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

            // Fire event
            event(new OrganizationCreated($organization, $data));

            DB::commit();

            return $this->transformOrganizationData($organization);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to create organization', [
                'data' => $data,
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }

    /**
     * Update organization
     */
    public function updateOrganization(string $id, array $data): ?array
    {
        $organization = Organization::findOrFail($id);

        if (!$organization) {
            return null;
        }

        // Sanitize and validate data
        $data = $this->sanitizeOrganizationData($data);
        $data = $this->validateOrganizationData($data, 'update', $id);

        DB::beginTransaction();

        try {
            $oldData = $organization->toArray();
            $organization->update($data);

            // Log activity with changes
            $changes = array_diff_assoc($data, $oldData);
            $this->logActivity(
                $organization->id,
                'updated',
                'Organization updated: ' . implode(', ', array_keys($changes))
            );

            // Fire event
            event(new OrganizationUpdated($organization, $changes, $data));

            DB::commit();

            return $this->transformOrganizationData($organization->fresh());
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to update organization', [
                'id' => $id,
                'data' => $data,
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }

    /**
     * Delete organization
     *
     * @param string $id Organization ID
     * @return bool Success status
     * @throws \Exception When deletion fails
     */
    public function deleteOrganization(string $id): bool
    {
        $organization = Organization::findOrFail($id);

        if (!$organization) {
            return false;
        }

        DB::beginTransaction();

        try {
            // Check if organization has active users
            if ($organization->users()->where('status', 'active')->exists()) {
                throw new \InvalidArgumentException('Cannot delete organization with active users');
            }

            // Log activity before deletion
            $this->logActivity($organization->id, 'deleted', 'Organization deleted');

            // Fire event before deletion
            event(new OrganizationDeleted(
                $organization->id,
                $organization->name,
                $organization->org_code,
                'hard',
                ['deleted_by' => Auth::id()]
            ));

            $organization->delete();

            DB::commit();

            return true;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to delete organization', [
                'id' => $id,
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }

    /**
     * Update organization status
     *
     * @param string $id Organization ID
     * @param string $status New status
     * @return array|null Updated organization data or null if not found
     * @throws \InvalidArgumentException When status is invalid
     * @throws \Exception When update fails
     */
    public function updateOrganizationStatus(string $id, string $status): ?array
    {
        // Validate status
        $validStatuses = ['active', 'trial', 'suspended', 'inactive'];
        if (!in_array($status, $validStatuses)) {
            throw new \InvalidArgumentException('Invalid status. Must be one of: ' . implode(', ', $validStatuses));
        }

        $organization = Organization::findOrFail($id);

        DB::beginTransaction();

        try {
            $oldStatus = $organization->status;

            // Prevent invalid status transitions
            if ($oldStatus === 'deleted' && $status !== 'inactive') {
                throw new \InvalidArgumentException('Cannot change status from deleted to ' . $status);
            }

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
            Log::error('Failed to update organization status', [
                'id' => $id,
                'status' => $status,
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }

    /**
     * Perform bulk actions on multiple organizations
     *
     * @param string $action Action to perform (activate, suspend, delete)
     * @param array $organizationIds Array of organization IDs
     * @param array $options Additional options for bulk operations
     * @return array Results with success/failure counts and errors
     * @throws \InvalidArgumentException When action is invalid
     */
    public function bulkAction(string $action, array $organizationIds, array $options = []): array
    {
        $validActions = ['activate', 'suspend', 'delete', 'inactivate'];

        if (!in_array($action, $validActions)) {
            throw new \InvalidArgumentException('Invalid action. Must be one of: ' . implode(', ', $validActions));
        }

        if (empty($organizationIds)) {
            throw new \InvalidArgumentException('No organization IDs provided');
        }

        $results = [
            'success' => 0,
            'failed' => 0,
            'skipped' => 0,
            'errors' => [],
            'warnings' => []
        ];

        $batchSize = $options['batch_size'] ?? 50;
        $continueOnError = $options['continue_on_error'] ?? true;

        // Process in batches to avoid memory issues
        $chunks = array_chunk($organizationIds, $batchSize);

        foreach ($chunks as $chunk) {
            DB::beginTransaction();

            try {
                foreach ($chunk as $id) {
                    try {
                        switch ($action) {
                            case 'activate':
                                $this->updateOrganizationStatus($id, 'active');
                                break;
                            case 'suspend':
                                $this->updateOrganizationStatus($id, 'suspended');
                                break;
                            case 'inactivate':
                                $this->updateOrganizationStatus($id, 'inactive');
                                break;
                            case 'delete':
                                $this->deleteOrganization($id);
                                break;
                        }
                        $results['success']++;

                    } catch (\Exception $e) {
                        $results['failed']++;
                        $results['errors'][] = [
                            'id' => $id,
                            'error' => $e->getMessage()
                        ];

                        if (!$continueOnError) {
                            throw $e;
                        }
                    }
                }

                DB::commit();

            } catch (\Exception $e) {
                DB::rollBack();

                if (!$continueOnError) {
                    Log::error('Bulk action failed', [
                        'action' => $action,
                        'chunk' => $chunk,
                        'error' => $e->getMessage()
                    ]);
                    throw $e;
                }
            }
        }

        return $results;
    }

    /**
     * Export organizations to CSV
     *
     * @param array $params Filtering parameters
     * @param string $format Export format (csv, excel)
     * @return array Export data with metadata
     * @throws \InvalidArgumentException When format is not supported
     */
    public function exportOrganizations(array $params = [], string $format = 'csv'): array
    {
        try {
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

            $result = [
                'data' => $exportData,
                'total' => $organizations['pagination']['total'],
                'exported_at' => now()->toISOString(),
                'format' => $format
            ];

            // Generate file if requested
            if (isset($params['generate_file']) && $params['generate_file']) {
                $result['file_path'] = $this->generateExportFile($exportData, $format);
            }

            return $result;
        } catch (\Exception $e) {
            Log::error('Failed to export organizations', [
                'params' => $params,
                'format' => $format,
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }

    /**
     * Generate export file
     */
    private function generateExportFile($data, string $format): string
    {
        $filename = 'organizations_export_' . now()->format('Y_m_d_H_i_s') . '.' . $format;
        $filepath = storage_path('app/exports/' . $filename);

        // Ensure directory exists
        if (!file_exists(dirname($filepath))) {
            mkdir(dirname($filepath), 0755, true);
        }

        switch ($format) {
            case 'csv':
                $this->generateCsvFile($data, $filepath);
                break;
            case 'excel':
                $this->generateExcelFile($data, $filepath);
                break;
            default:
                throw new \InvalidArgumentException('Unsupported export format: ' . $format);
        }

        return $filepath;
    }

    /**
     * Generate CSV file
     */
    private function generateCsvFile($data, string $filepath): void
    {
        $file = fopen($filepath, 'w');

        if ($file === false) {
            throw new \RuntimeException('Failed to create CSV file');
        }

        // Write headers
        if (!empty($data)) {
            fputcsv($file, array_keys($data->first()));

            // Write data
            foreach ($data as $row) {
                fputcsv($file, $row);
            }
        }

        fclose($file);
    }

    /**
     * Generate Excel file
     */
    private function generateExcelFile($data, string $filepath): void
    {
        // This would require PhpSpreadsheet package
        // For now, throw exception
        throw new \InvalidArgumentException('Excel export requires PhpSpreadsheet package');
    }

    /**
     * Import organizations from file
     *
     * @param \Illuminate\Http\UploadedFile $file Uploaded file
     * @param array $mapping Field mapping configuration
     * @param array $options Import options
     * @return array Import results with success/failure counts
     * @throws \InvalidArgumentException When file or mapping is invalid
     */
    public function importOrganizations($file, array $mapping, array $options = []): array
    {
        try {
            // Validate file
            if (!$file || !$file->isValid()) {
                throw new \InvalidArgumentException('Invalid file provided');
            }

            // Validate mapping
            $requiredFields = ['name', 'email'];
            foreach ($requiredFields as $field) {
                if (!isset($mapping[$field])) {
                    throw new \InvalidArgumentException("Required mapping field '{$field}' is missing");
                }
            }

            $results = [
                'success' => 0,
                'failed' => 0,
                'skipped' => 0,
                'errors' => [],
                'warnings' => []
            ];

            // Read file and process data
            $data = $this->readImportFile($file);

            if (empty($data)) {
                throw new \InvalidArgumentException('No data found in file');
            }

            $batchSize = $options['batch_size'] ?? 100;
            $skipDuplicates = $options['skip_duplicates'] ?? true;
            $updateExisting = $options['update_existing'] ?? false;

            // Process data in batches
            $chunks = array_chunk($data, $batchSize);

            foreach ($chunks as $chunkIndex => $chunk) {
                DB::beginTransaction();

                try {
                    foreach ($chunk as $index => $row) {
                        $rowNumber = ($chunkIndex * $batchSize) + $index + 1;

                        try {
                            $organizationData = $this->mapImportData($row, $mapping);

                            // Check for duplicates
                            if ($skipDuplicates && $this->isDuplicateOrganization($organizationData)) {
                                $results['skipped']++;
                                $results['warnings'][] = [
                                    'row' => $rowNumber,
                                    'message' => 'Duplicate organization skipped'
                                ];
                                continue;
                            }

                            // Check if organization exists for update
                            if ($updateExisting) {
                                $existing = Organization::where('email', $organizationData['email'])->first();
                                if ($existing) {
                                    $this->updateOrganization($existing->id, $organizationData);
                                    $results['success']++;
                                    continue;
                                }
                            }

                            $this->createOrganization($organizationData);
                            $results['success']++;

                        } catch (\Exception $e) {
                            $results['failed']++;
                            $results['errors'][] = [
                                'row' => $rowNumber,
                                'error' => $e->getMessage()
                            ];
                        }
                    }

                    DB::commit();

                } catch (\Exception $e) {
                    DB::rollBack();
                    throw $e;
                }
            }

            return $results;

        } catch (\Exception $e) {
            Log::error('Failed to import organizations', [
                'file' => $file->getClientOriginalName(),
                'mapping' => $mapping,
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }

    /**
     * Check if organization is duplicate
     */
    private function isDuplicateOrganization(array $data): bool
    {
        return Organization::where('email', $data['email'])
            ->orWhere('org_code', $data['org_code'] ?? '')
            ->exists();
    }

    /**
     * Get organization users with caching
     *
     * @param string $id Organization ID
     * @param bool $useCache Whether to use cached data
     * @return array Users data
     */
    public function getOrganizationUsers(string $id, bool $useCache = true): array
    {
        $cacheKey = "organization_users_{$id}";

        if ($useCache && Cache::has($cacheKey)) {
            return Cache::get($cacheKey);
        }

        try {
            $users = User::where('organization_id', $id)
                ->select(['id', 'name', 'email', 'role', 'status', 'last_login_at', 'created_at'])
                ->get();

            $data = $users->map(function ($user) {
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

            // Cache for 5 minutes
            if ($useCache) {
                Cache::put($cacheKey, $data, self::CACHE_TTL['users']);
            }

            return $data;

        } catch (\Exception $e) {
            Log::error('Failed to get organization users', [
                'id' => $id,
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }

    /**
     * Get organization activity logs with filtering and pagination
     *
     * @param string $id Organization ID
     * @param array $params Filtering parameters
     * @return array Paginated activity logs
     * @throws \InvalidArgumentException When validation fails
     */
    public function getOrganizationActivityLogs(string $id, array $params = []): array
    {
        try {
            // Validate parameters
            $validator = Validator::make($params, [
                'page' => 'sometimes|integer|min:1',
                'per_page' => 'sometimes|integer|min:1|max:100',
                'date_from' => 'sometimes|date',
                'date_to' => 'sometimes|date|after_or_equal:date_from',
                'action' => 'sometimes|string|max:50',
                'user_id' => 'sometimes|uuid'
            ]);

            if ($validator->fails()) {
                throw new \InvalidArgumentException('Invalid parameters: ' . implode(', ', $validator->errors()->all()));
            }

            $query = AuditLog::where('organization_id', $id)
                ->orderBy('created_at', 'desc');

            if (!empty($params['date_from'])) {
                $query->whereDate('created_at', '>=', $params['date_from']);
            }

            if (!empty($params['date_to'])) {
                $query->whereDate('created_at', '<=', $params['date_to']);
            }

            if (!empty($params['action'])) {
                $query->where('action', $params['action']);
            }

            if (!empty($params['user_id'])) {
                $query->where('user_id', $params['user_id']);
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
                    'last_page' => $logs->lastPage(),
                    'from' => $logs->firstItem(),
                    'to' => $logs->lastItem(),
                    'has_more_pages' => $logs->hasMorePages()
                ]
            ];

        } catch (\Exception $e) {
            Log::error('Failed to get organization activity logs', [
                'id' => $id,
                'params' => $params,
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }

    /**
     * Transform organization data for API response
     *
     * @param Organization $organization Organization model instance
     * @return array Transformed organization data
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
     *
     * @param string $name Organization name
     * @return string Unique organization code
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
        try {
            AuditLog::create([
                'organization_id' => $organizationId,
                'action' => $action,
                'description' => $description,
                'user_id' => Auth::check() ? Auth::id() : null,
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
                'resource_type' => 'Organization',
                'resource_id' => $organizationId,
                'resource_name' => $description,
                'severity' => 'info'
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to log activity', [
                'organization_id' => $organizationId,
                'action' => $action,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Read import file
     */
    private function readImportFile($file): array
    {
        try {
            $extension = $file->getClientOriginalExtension();

            switch (strtolower($extension)) {
                case 'csv':
                    return $this->readCsvFile($file);
                case 'xlsx':
                case 'xls':
                    return $this->readExcelFile($file);
                default:
                    throw new \InvalidArgumentException('Unsupported file format: ' . $extension);
            }
        } catch (\Exception $e) {
            Log::error('Failed to read import file', [
                'file' => $file->getClientOriginalName(),
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }

    /**
     * Read CSV file
     */
    private function readCsvFile($file): array
    {
        $data = [];
        $handle = fopen($file->getPathname(), 'r');

        if ($handle !== false) {
            $headers = fgetcsv($handle);

            while (($row = fgetcsv($handle)) !== false) {
                $data[] = array_combine($headers, $row);
            }

            fclose($handle);
        }

        return $data;
    }

    /**
     * Read Excel file
     */
    private function readExcelFile($file): array
    {
        // This would require PhpSpreadsheet package
        // For now, return empty array
        return [];
    }

    /**
     * Map import data from file row to organization data
     *
     * @param array $row File row data
     * @param array $mapping Field mapping configuration
     * @return array Mapped organization data
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
     * Validate organization data with comprehensive rules
     *
     * @param array $data Organization data
     * @param string $action Action being performed (create, update)
     * @param string|null $organizationId Organization ID for update operations
     * @return array Validated data
     * @throws \InvalidArgumentException When validation fails
     */
    public function validateOrganizationData(array $data, string $action = 'create', ?string $organizationId = null): array
    {
        $rules = $this->getValidationRules($action, $organizationId);

        $validator = Validator::make($data, $rules, $this->getValidationMessages());

        if ($validator->fails()) {
            throw new \InvalidArgumentException('Validation failed: ' . implode(', ', $validator->errors()->all()));
        }

        return $validator->validated();
    }

    /**
     * Get validation rules based on action
     *
     * @param string $action Action being performed
     * @param string|null $organizationId Organization ID for update operations
     * @return array Validation rules
     */
    private function getValidationRules(string $action, ?string $organizationId = null): array
    {
        $baseRules = [
            'name' => 'required|string|max:255|min:2',
            'display_name' => 'nullable|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:20|regex:/^[\+]?[0-9\s\-\(\)]+$/',
            'address' => 'nullable|string|max:500',
            'website' => 'nullable|url|max:255',
            'tax_id' => 'nullable|string|max:50',
            'business_type' => 'nullable|string|max:100|in:sole_proprietorship,partnership,corporation,llc,non_profit,other',
            'industry' => 'nullable|string|max:100',
            'company_size' => 'nullable|string|max:50|in:1-10,11-50,51-200,201-500,501-1000,1000+',
            'timezone' => 'nullable|string|max:50|in:Asia/Jakarta,Asia/Singapore,UTC,etc',
            'locale' => 'nullable|string|max:10|in:id,en,ms,th,vi',
            'currency' => 'nullable|string|max:3|in:IDR,USD,SGD,MYR,THB,VND',
            'subscription_plan_id' => 'nullable|uuid|exists:subscription_plans,id',
            'subscription_status' => 'nullable|string|in:active,trial,expired,cancelled',
            'status' => 'nullable|string|in:active,trial,suspended,inactive,deleted',
            'billing_cycle' => 'nullable|string|in:monthly,quarterly,yearly',
            'api_enabled' => 'nullable|boolean',
            'webhook_url' => 'nullable|url|max:500',
            'webhook_secret' => 'nullable|string|max:255',
            'theme_config' => 'nullable|array',
            'branding_config' => 'nullable|array',
            'feature_flags' => 'nullable|array',
            'ui_preferences' => 'nullable|array',
            'business_hours' => 'nullable|array',
            'contact_info' => 'nullable|array',
            'social_media' => 'nullable|array',
            'security_settings' => 'nullable|array',
            'settings' => 'nullable|array',
            'metadata' => 'nullable|array'
        ];

        if ($action === 'create') {
            $baseRules['org_code'] = 'nullable|string|max:50|unique:organizations,org_code';
            $baseRules['email'] = 'required|email|max:255|unique:organizations,email';
        } elseif ($action === 'update' && $organizationId) {
            $baseRules['org_code'] = 'sometimes|string|max:50|unique:organizations,org_code,' . $organizationId;
            $baseRules['email'] = 'sometimes|email|max:255|unique:organizations,email,' . $organizationId;
        }

        return $baseRules;
    }

    /**
     * Get custom validation messages
     *
     * @return array Validation messages
     */
    private function getValidationMessages(): array
    {
        return [
            'name.required' => 'Organization name is required',
            'name.min' => 'Organization name must be at least 2 characters',
            'name.max' => 'Organization name cannot exceed 255 characters',
            'email.required' => 'Email address is required',
            'email.email' => 'Please provide a valid email address',
            'email.unique' => 'This email address is already registered',
            'phone.regex' => 'Please provide a valid phone number',
            'website.url' => 'Please provide a valid website URL',
            'business_type.in' => 'Invalid business type selected',
            'company_size.in' => 'Invalid company size selected',
            'timezone.in' => 'Invalid timezone selected',
            'locale.in' => 'Invalid locale selected',
            'currency.in' => 'Invalid currency selected',
            'subscription_plan_id.exists' => 'Selected subscription plan does not exist',
            'subscription_status.in' => 'Invalid subscription status',
            'status.in' => 'Invalid organization status',
            'billing_cycle.in' => 'Invalid billing cycle',
            'webhook_url.url' => 'Please provide a valid webhook URL'
        ];
    }

    /**
     * Sanitize organization data
     *
     * @param array $data Raw organization data
     * @return array Sanitized data
     */
    public function sanitizeOrganizationData(array $data): array
    {
        $sanitized = [];

        foreach ($data as $key => $value) {
            if (is_string($value)) {
                // Trim whitespace
                $value = trim($value);

                // Remove potentially dangerous characters
                if (in_array($key, ['name', 'display_name', 'email', 'phone', 'address'])) {
                    $value = strip_tags($value);
                }

                // Convert empty strings to null for optional fields
                if (empty($value) && in_array($key, ['display_name', 'phone', 'address', 'website', 'tax_id'])) {
                    $value = null;
                }
            }

            $sanitized[$key] = $value;
        }

        return $sanitized;
    }

    /**
     * Clear cache for specific organization
     *
     * @param string $organizationId Organization ID
     * @return void
     */
    public function clearOrganizationCache(string $organizationId): void
    {
        $cacheKeys = [
            self::CACHE_KEYS['organization'] . $organizationId,
            self::CACHE_KEYS['users'] . $organizationId,
            self::CACHE_KEYS['logs'] . $organizationId
        ];

        foreach ($cacheKeys as $key) {
            Cache::forget($key);
        }
    }

    /**
     * Clear all organization caches
     *
     * @return void
     */
    public function clearAllCaches(): void
    {
        Cache::forget(self::CACHE_KEYS['statistics']);

        // Clear organization caches (this is a simplified approach)
        // In production, you might want to use cache tags for more efficient clearing
        $pattern = self::CACHE_KEYS['organization'] . '*';
        $this->clearCacheByPattern($pattern);

        $pattern = self::CACHE_KEYS['users'] . '*';
        $this->clearCacheByPattern($pattern);

        $pattern = self::CACHE_KEYS['logs'] . '*';
        $this->clearCacheByPattern($pattern);
    }

    /**
     * Clear cache by pattern (simplified implementation)
     *
     * @param string $pattern Cache key pattern
     * @return void
     */
    private function clearCacheByPattern(string $pattern): void
    {
        // This is a simplified implementation
        // In production, consider using cache tags or Redis SCAN
        try {
            $keys = Cache::getRedis()->keys($pattern);
            if (!empty($keys)) {
                Cache::getRedis()->del($keys);
            }
        } catch (\Exception $e) {
            Log::warning('Failed to clear cache by pattern', [
                'pattern' => $pattern,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Soft delete organization
     *
     * @param string $id Organization ID
     * @return bool Success status
     * @throws \Exception When deletion fails
     */
    public function softDeleteOrganization(string $id): bool
    {
        $organization = Organization::findOrFail($id);

        if (!$organization) {
            return false;
        }

        DB::beginTransaction();

        try {
            // Check if organization has active users
            if ($organization->users()->where('status', 'active')->exists()) {
                throw new \InvalidArgumentException('Cannot delete organization with active users');
            }

            // Update status to deleted instead of hard delete
            $organization->update([
                'status' => 'deleted',
                'deleted_at' => now()
            ]);

            // Log activity
            $this->logActivity($organization->id, 'soft_deleted', 'Organization soft deleted');

            // Fire event
            event(new OrganizationDeleted(
                $organization->id,
                $organization->name,
                $organization->org_code,
                'soft',
                ['deleted_by' => Auth::id()]
            ));

            // Clear cache
            $this->clearOrganizationCache($organization->id);

            DB::commit();

            return true;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to soft delete organization', [
                'id' => $id,
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }

    /**
     * Restore soft deleted organization
     *
     * @param string $id Organization ID
     * @return bool Success status
     * @throws \Exception When restoration fails
     */
    public function restoreOrganization(string $id): bool
    {
        $organization = Organization::withTrashed()->find($id);

        if (!$organization || !$organization->trashed()) {
            return false;
        }

        DB::beginTransaction();

        try {
            $organization->restore();
            $organization->update([
                'status' => 'trial',
                'deleted_at' => null
            ]);

            // Log activity
            $this->logActivity($organization->id, 'restored', 'Organization restored');

            // Clear cache
            $this->clearOrganizationCache($organization->id);

            DB::commit();

            return true;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to restore organization', [
                'id' => $id,
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }

    /**
     * Get deleted organizations
     *
     * @param array $params Filtering parameters
     * @return array Paginated deleted organizations
     */
    public function getDeletedOrganizations(array $params = []): array
    {
        try {
            $query = Organization::onlyTrashed()->with(['users', 'subscriptionPlan']);

            // Apply filters
            if (!empty($params['search'])) {
                $search = $params['search'];
                $query->where(function (Builder $q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('org_code', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
                });
            }

            if (!empty($params['deleted_from'])) {
                $query->whereDate('deleted_at', '>=', $params['deleted_from']);
            }

            if (!empty($params['deleted_to'])) {
                $query->whereDate('deleted_at', '<=', $params['deleted_to']);
            }

            // Apply sorting
            $sortBy = $params['sort_by'] ?? 'deleted_at';
            $sortOrder = $params['sort_order'] ?? 'desc';
            $query->orderBy($sortBy, $sortOrder);

            // Get pagination parameters
            $page = (int) ($params['page'] ?? 1);
            $perPage = (int) ($params['per_page'] ?? 15);
            $perPage = min($perPage, 100);

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
        } catch (\Exception $e) {
            Log::error('Failed to get deleted organizations', [
                'params' => $params,
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }

    /**
     * Search organizations with full-text search
     *
     * @param string $query Search query
     * @param array $params Additional parameters
     * @return array Search results
     */
    public function searchOrganizations(string $query, array $params = []): array
    {
        try {
            $searchQuery = Organization::with(['users', 'subscriptionPlan']);

            // Full-text search on multiple fields
            $searchQuery->where(function (Builder $q) use ($query) {
                $q->where('name', 'like', "%{$query}%")
                  ->orWhere('org_code', 'like', "%{$query}%")
                  ->orWhere('email', 'like', "%{$query}%")
                  ->orWhere('display_name', 'like', "%{$query}%")
                  ->orWhere('industry', 'like', "%{$query}%")
                  ->orWhere('business_type', 'like', "%{$query}%");
            });

            // Apply additional filters
            if (!empty($params['status'])) {
                $searchQuery->where('status', $params['status']);
            }

            if (!empty($params['industry'])) {
                $searchQuery->where('industry', $params['industry']);
            }

            // Apply sorting
            $sortBy = $params['sort_by'] ?? 'name';
            $sortOrder = $params['sort_order'] ?? 'asc';
            $searchQuery->orderBy($sortBy, $sortOrder);

            // Get pagination parameters
            $page = (int) ($params['page'] ?? 1);
            $perPage = (int) ($params['per_page'] ?? 15);
            $perPage = min($perPage, 100);

            // Execute query with pagination
            $organizations = $searchQuery->paginate($perPage, ['*'], 'page', $page);

            // Transform data
            $transformedData = $organizations->map(function ($org) {
                return $this->transformOrganizationData($org);
            });

            return [
                'data' => $transformedData,
                'query' => $query,
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
        } catch (\Exception $e) {
            Log::error('Failed to search organizations', [
                'query' => $query,
                'params' => $params,
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }

    /**
     * Get organization analytics
     *
     * @param string $id Organization ID
     * @param array $params Date range parameters
     * @return array Analytics data
     */
    public function getOrganizationAnalytics(string $id, array $params = []): array
    {
        try {
            $organization = Organization::findOrFail($id);

            if (!$organization) {
                throw new \InvalidArgumentException('Organization not found');
            }

            $dateFrom = $params['date_from'] ?? now()->subDays(30);
            $dateTo = $params['date_to'] ?? now();

            // Get user growth
            $userGrowth = User::where('organization_id', $id)
                ->whereBetween('created_at', [$dateFrom, $dateTo])
                ->selectRaw('DATE(created_at) as date, COUNT(*) as count')
                ->groupBy('date')
                ->orderBy('date')
                ->get();

            // Get activity logs
            $activityLogs = AuditLog::where('organization_id', $id)
                ->whereBetween('created_at', [$dateFrom, $dateTo])
                ->selectRaw('action, COUNT(*) as count')
                ->groupBy('action')
                ->get();

            // Get monthly statistics
            $monthlyStats = [
                'new_users' => User::where('organization_id', $id)
                    ->whereBetween('created_at', [$dateFrom, $dateTo])
                    ->count(),
                'total_activities' => AuditLog::where('organization_id', $id)
                    ->whereBetween('created_at', [$dateFrom, $dateTo])
                    ->count(),
                'active_users' => User::where('organization_id', $id)
                    ->where('status', 'active')
                    ->count()
            ];

            return [
                'organization_id' => $id,
                'date_range' => [
                    'from' => $dateFrom,
                    'to' => $dateTo
                ],
                'user_growth' => $userGrowth,
                'activity_breakdown' => $activityLogs,
                'monthly_stats' => $monthlyStats,
                'generated_at' => now()->toISOString()
            ];
        } catch (\Exception $e) {
            Log::error('Failed to get organization analytics', [
                'id' => $id,
                'params' => $params,
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }


    /**
     * Get organization health status
     *
     * @param string $id Organization ID
     * @return array Health status data
     */
    public function getOrganizationHealth(string $id): array
    {
        try {
            $organization = Organization::findOrFail($id);

            if (!$organization) {
                throw new \InvalidArgumentException('Organization not found');
            }

            $health = [
                'organization_id' => $id,
                'status' => 'healthy',
                'checks' => [],
                'overall_score' => 100,
                'last_checked' => now()->toISOString()
            ];

            // Check user activity
            $activeUsers = User::where('organization_id', $id)
                ->where('status', 'active')
                ->where('last_login_at', '>=', now()->subDays(30))
                ->count();

            $totalUsers = User::where('organization_id', $id)->count();
            $userActivityScore = $totalUsers > 0 ? ($activeUsers / $totalUsers) * 100 : 0;

            $health['checks']['user_activity'] = [
                'status' => $userActivityScore >= 50 ? 'good' : 'warning',
                'score' => $userActivityScore,
                'active_users' => $activeUsers,
                'total_users' => $totalUsers
            ];

            // Check recent activity
            $recentActivity = AuditLog::where('organization_id', $id)
                ->where('created_at', '>=', now()->subDays(7))
                ->count();

            $activityScore = min($recentActivity * 10, 100);
            $health['checks']['recent_activity'] = [
                'status' => $activityScore >= 30 ? 'good' : 'warning',
                'score' => $activityScore,
                'activities_last_7_days' => $recentActivity
            ];

            // Check subscription status
            $subscriptionScore = 100;
            if ($organization->subscription_status === 'expired') {
                $subscriptionScore = 0;
            } elseif ($organization->subscription_status === 'trial') {
                $subscriptionScore = 75;
            }

            $health['checks']['subscription'] = [
                'status' => $subscriptionScore >= 75 ? 'good' : 'warning',
                'score' => $subscriptionScore,
                'subscription_status' => $organization->subscription_status
            ];

            // Calculate overall score
            $scores = array_column($health['checks'], 'score');
            $health['overall_score'] = array_sum($scores) / count($scores);

            // Determine overall status
            if ($health['overall_score'] >= 80) {
                $health['status'] = 'healthy';
            } elseif ($health['overall_score'] >= 50) {
                $health['status'] = 'warning';
            } else {
                $health['status'] = 'critical';
            }

            return $health;

        } catch (\Exception $e) {
            Log::error('Failed to get organization health', [
                'id' => $id,
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }

    /**
     * Get organization metrics
     *
     * @param string $id Organization ID
     * @param array $params Date range parameters
     * @return array Metrics data
     */
    public function getOrganizationMetrics(string $id, array $params = []): array
    {
        try {
            $organization = Organization::findOrFail($id);

            if (!$organization) {
                throw new \InvalidArgumentException('Organization not found');
            }

            $dateFrom = $params['date_from'] ?? now()->subDays(30);
            $dateTo = $params['date_to'] ?? now();

            // User metrics
            $userMetrics = [
                'total_users' => User::where('organization_id', $id)->count(),
                'active_users' => User::where('organization_id', $id)->where('status', 'active')->count(),
                'new_users_this_period' => User::where('organization_id', $id)
                    ->whereBetween('created_at', [$dateFrom, $dateTo])
                    ->count(),
                'users_by_status' => User::where('organization_id', $id)
                    ->selectRaw('status, COUNT(*) as count')
                    ->groupBy('status')
                    ->pluck('count', 'status')
            ];

            // Activity metrics
            $activityMetrics = [
                'total_activities' => AuditLog::where('organization_id', $id)
                    ->whereBetween('created_at', [$dateFrom, $dateTo])
                    ->count(),
                'activities_by_type' => AuditLog::where('organization_id', $id)
                    ->whereBetween('created_at', [$dateFrom, $dateTo])
                    ->selectRaw('action, COUNT(*) as count')
                    ->groupBy('action')
                    ->pluck('count', 'action'),
                'daily_activities' => AuditLog::where('organization_id', $id)
                    ->whereBetween('created_at', [$dateFrom, $dateTo])
                    ->selectRaw('DATE(created_at) as date, COUNT(*) as count')
                    ->groupBy('date')
                    ->orderBy('date')
                    ->get()
            ];

            // Performance metrics
            $performanceMetrics = [
                'avg_response_time' => 0, // This would come from actual performance monitoring
                'uptime_percentage' => 99.9, // This would come from actual monitoring
                'error_rate' => 0.1 // This would come from actual error tracking
            ];

            return [
                'organization_id' => $id,
                'date_range' => [
                    'from' => $dateFrom,
                    'to' => $dateTo
                ],
                'user_metrics' => $userMetrics,
                'activity_metrics' => $activityMetrics,
                'performance_metrics' => $performanceMetrics,
                'generated_at' => now()->toISOString()
            ];

        } catch (\Exception $e) {
            Log::error('Failed to get organization metrics', [
                'id' => $id,
                'params' => $params,
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }

    /**
     * Send notification to organization
     */
    public function sendNotification(int $organizationId, string $type, array $data = []): array
    {
        try {
            $organization = Organization::findOrFail($organizationId);

            // Create notification record
            $notification = $organization->notifications()->create([
                'type' => $type,
                'title' => $data['title'] ?? 'Notification',
                'message' => $data['message'] ?? '',
                'data' => $data['data'] ?? [],
                'is_read' => false,
                'sent_at' => now()
            ]);

            // Send via email if configured
            if (isset($data['send_email']) && $data['send_email']) {
                $this->sendEmailNotification($organization, $notification, $data);
            }

            // Send via webhook if configured
            if ($organization->webhook_url) {
                $this->sendWebhookNotification($organization, $notification, $data);
            }

            Log::info('Notification sent to organization', [
                'organization_id' => $organizationId,
                'notification_id' => $notification->id,
                'type' => $type
            ]);

            return [
                'success' => true,
                'notification_id' => $notification->id,
                'message' => 'Notification sent successfully'
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
            $organization = Organization::findOrFail($organizationId);

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
            $organization = Organization::findOrFail($organizationId);

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
            $organization = Organization::findOrFail($organizationId);

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
            $organization = Organization::findOrFail($organizationId);

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
     * Send email notification
     */
    private function sendEmailNotification(Organization $organization, $notification, array $data): void
    {
        try {
            // This would integrate with your email service
            // For now, just log the action
            Log::info('Email notification sent', [
                'organization_id' => $organization->id,
                'notification_id' => $notification->id,
                'email' => $organization->email
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to send email notification', [
                'organization_id' => $organization->id,
                'notification_id' => $notification->id,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Send webhook notification
     */
    private function sendWebhookNotification(Organization $organization, $notification, array $data): void
    {
        try {
            $payload = [
                'event' => 'notification.sent',
                'organization_id' => $organization->id,
                'notification' => [
                    'id' => $notification->id,
                    'type' => $notification->type,
                    'title' => $notification->title,
                    'message' => $notification->message,
                    'data' => $notification->data,
                    'sent_at' => $notification->sent_at
                ],
                'timestamp' => now()->toISOString()
            ];

            // Send webhook
            $response = \Illuminate\Support\Facades\Http::timeout(10)->post($organization->webhook_url, $payload);

            if ($response->successful()) {
                Log::info('Webhook notification sent successfully', [
                    'organization_id' => $organization->id,
                    'notification_id' => $notification->id,
                    'webhook_url' => $organization->webhook_url
                ]);
            } else {
                Log::warning('Webhook notification failed', [
                    'organization_id' => $organization->id,
                    'notification_id' => $notification->id,
                    'webhook_url' => $organization->webhook_url,
                    'status_code' => $response->status()
                ]);
            }
        } catch (\Exception $e) {
            Log::error('Failed to send webhook notification', [
                'organization_id' => $organization->id,
                'notification_id' => $notification->id,
                'webhook_url' => $organization->webhook_url,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Get organization audit logs
     */
    public function getAuditLogs(int $organizationId, array $params = []): array
    {
        try {
            $organization = Organization::findOrFail($organizationId);

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
            $organization = Organization::findOrFail($organizationId);

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
            $organization = Organization::findOrFail($organizationId);

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
            $organization = Organization::findOrFail($organizationId);

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
            $organization = Organization::findOrFail($organizationId);

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
            $organization = Organization::findOrFail($organizationId);

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
}
