<?php

namespace App\Services;

use App\Models\OrganizationAuditLog;
use Illuminate\Support\Facades\Log;

class OrganizationAuditService
{
    /**
     * Log an organization action.
     */
    public function logAction(
        int $organizationId,
        string $action,
        ?int $userId = null,
        ?string $resourceType = null,
        ?int $resourceId = null,
        ?array $oldValues = null,
        ?array $newValues = null,
        ?array $metadata = null
    ): OrganizationAuditLog {
        try {
            $auditLog = OrganizationAuditLog::create([
                'organization_id' => $organizationId,
                'user_id' => $userId,
                'action' => $action,
                'resource_type' => $resourceType,
                'resource_id' => $resourceId,
                'old_values' => $oldValues,
                'new_values' => $newValues,
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
                'metadata' => $metadata,
            ]);

            // Log to application logs
            Log::channel('organization')->info('Organization audit log created', [
                'audit_log_id' => $auditLog->id,
                'organization_id' => $organizationId,
                'action' => $action,
                'user_id' => $userId,
                'resource_type' => $resourceType,
                'resource_id' => $resourceId,
            ]);

            return $auditLog;

        } catch (\Exception $e) {
            Log::channel('organization')->error('Failed to create organization audit log', [
                'error' => $e->getMessage(),
                'organization_id' => $organizationId,
                'action' => $action,
                'user_id' => $userId,
            ]);

            throw $e;
        }
    }

    /**
     * Log organization creation.
     */
    public function logOrganizationCreated(int $organizationId, array $organizationData, ?int $userId = null): OrganizationAuditLog
    {
        return $this->logAction(
            $organizationId,
            'created',
            $userId,
            'organization',
            $organizationId,
            null,
            $organizationData,
            ['created_via' => 'api']
        );
    }

    /**
     * Log organization update.
     */
    public function logOrganizationUpdated(
        int $organizationId,
        array $oldValues,
        array $newValues,
        ?int $userId = null
    ): OrganizationAuditLog {
        return $this->logAction(
            $organizationId,
            'updated',
            $userId,
            'organization',
            $organizationId,
            $oldValues,
            $newValues,
            ['updated_via' => 'api']
        );
    }

    /**
     * Log organization deletion.
     */
    public function logOrganizationDeleted(int $organizationId, array $organizationData, ?int $userId = null): OrganizationAuditLog
    {
        return $this->logAction(
            $organizationId,
            'deleted',
            $userId,
            'organization',
            $organizationId,
            $organizationData,
            null,
            ['deleted_via' => 'api']
        );
    }

    /**
     * Log user addition to organization.
     */
    public function logUserAdded(int $organizationId, int $userId, array $userData, ?int $addedBy = null): OrganizationAuditLog
    {
        return $this->logAction(
            $organizationId,
            'user_added',
            $addedBy,
            'user',
            $userId,
            null,
            $userData,
            ['added_via' => 'api']
        );
    }

    /**
     * Log user removal from organization.
     */
    public function logUserRemoved(int $organizationId, int $userId, array $userData, ?int $removedBy = null): OrganizationAuditLog
    {
        return $this->logAction(
            $organizationId,
            'user_removed',
            $removedBy,
            'user',
            $userId,
            $userData,
            null,
            ['removed_via' => 'api']
        );
    }

    /**
     * Log role assignment.
     */
    public function logRoleAssigned(
        int $organizationId,
        int $userId,
        int $roleId,
        array $roleData,
        ?int $assignedBy = null
    ): OrganizationAuditLog {
        return $this->logAction(
            $organizationId,
            'role_assigned',
            $assignedBy,
            'user_role',
            $userId,
            null,
            array_merge($roleData, ['role_id' => $roleId]),
            ['assigned_via' => 'api']
        );
    }

    /**
     * Log role removal.
     */
    public function logRoleRemoved(
        int $organizationId,
        int $userId,
        int $roleId,
        array $roleData,
        ?int $removedBy = null
    ): OrganizationAuditLog {
        return $this->logAction(
            $organizationId,
            'role_removed',
            $removedBy,
            'user_role',
            $userId,
            array_merge($roleData, ['role_id' => $roleId]),
            null,
            ['removed_via' => 'api']
        );
    }

    /**
     * Log settings update.
     */
    public function logSettingsUpdated(
        int $organizationId,
        array $oldSettings,
        array $newSettings,
        ?int $userId = null
    ): OrganizationAuditLog {
        return $this->logAction(
            $organizationId,
            'settings_updated',
            $userId,
            'organization_settings',
            $organizationId,
            $oldSettings,
            $newSettings,
            ['updated_via' => 'api']
        );
    }

    /**
     * Log permissions update.
     */
    public function logPermissionsUpdated(
        int $organizationId,
        array $oldPermissions,
        array $newPermissions,
        ?int $userId = null
    ): OrganizationAuditLog {
        return $this->logAction(
            $organizationId,
            'permissions_updated',
            $userId,
            'organization_permissions',
            $organizationId,
            $oldPermissions,
            $newPermissions,
            ['updated_via' => 'api']
        );
    }

    /**
     * Log status change.
     */
    public function logStatusChanged(
        int $organizationId,
        string $oldStatus,
        string $newStatus,
        ?int $userId = null
    ): OrganizationAuditLog {
        return $this->logAction(
            $organizationId,
            'status_changed',
            $userId,
            'organization',
            $organizationId,
            ['status' => $oldStatus],
            ['status' => $newStatus],
            ['changed_via' => 'api']
        );
    }

    /**
     * Get audit logs for organization.
     */
    public function getAuditLogs(
        int $organizationId,
        ?string $action = null,
        ?string $resourceType = null,
        ?int $userId = null,
        ?string $startDate = null,
        ?string $endDate = null,
        int $limit = 50,
        int $offset = 0
    ): array {
        $query = OrganizationAuditLog::forOrganization($organizationId);

        if ($action) {
            $query->forAction($action);
        }

        if ($resourceType) {
            $query->forResourceType($resourceType);
        }

        if ($userId) {
            $query->forUser($userId);
        }

        if ($startDate && $endDate) {
            $query->dateRange($startDate, $endDate);
        }

        $logs = $query->with(['user', 'organization'])
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->offset($offset)
            ->get();

        return $logs->toArray();
    }

    /**
     * Get audit log statistics.
     */
    public function getAuditLogStatistics(int $organizationId, ?string $startDate = null, ?string $endDate = null): array
    {
        $query = OrganizationAuditLog::forOrganization($organizationId);

        if ($startDate && $endDate) {
            $query->dateRange($startDate, $endDate);
        }

        $stats = $query->selectRaw('
            COUNT(*) as total_actions,
            COUNT(DISTINCT user_id) as unique_users,
            COUNT(DISTINCT action) as unique_actions,
            COUNT(DISTINCT resource_type) as unique_resource_types
        ')->first();

        $actionBreakdown = $query->selectRaw('action, COUNT(*) as count')
            ->groupBy('action')
            ->orderBy('count', 'desc')
            ->get();

        $resourceTypeBreakdown = $query->selectRaw('resource_type, COUNT(*) as count')
            ->groupBy('resource_type')
            ->orderBy('count', 'desc')
            ->get();

        return [
            'total_actions' => $stats->total_actions,
            'unique_users' => $stats->unique_users,
            'unique_actions' => $stats->unique_actions,
            'unique_resource_types' => $stats->unique_resource_types,
            'action_breakdown' => $actionBreakdown,
            'resource_type_breakdown' => $resourceTypeBreakdown,
        ];
    }
}
