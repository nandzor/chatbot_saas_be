<?php

namespace App\Models;

use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class N8nWorkflow extends Model
{
    use HasFactory;

    protected $table = 'n8n_workflows';
    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'organization_id',
        'workflow_id',
        'name',
        'description',
        'category',
        'tags',
        'workflow_data',
        'nodes',
        'connections',
        'settings',
        'trigger_type',
        'trigger_config',
        'schedule_expression',
        'version',
        'previous_version_id',
        'is_latest_version',
        'status',
        'is_enabled',
        'last_execution_at',
        'next_execution_at',
        'total_executions',
        'successful_executions',
        'failed_executions',
        'avg_execution_time',
        'created_by',
        'shared_with',
        'permissions',
        'webhook_url',
        'webhook_secret',
        'api_endpoints',
        'metadata',
        'created_at',
        'updated_at',
    ];

    protected $casts = [
        'tags' => 'array',
        'workflow_data' => 'array',
        'nodes' => 'array',
        'connections' => 'array',
        'settings' => 'array',
        'trigger_config' => 'array',
        'is_latest_version' => 'boolean',
        'is_enabled' => 'boolean',
        'last_execution_at' => 'datetime',
        'next_execution_at' => 'datetime',
        'shared_with' => 'array',
        'permissions' => 'array',
        'api_endpoints' => 'array',
        'metadata' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Boot the model
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (empty($model->id)) {
                $model->id = Str::uuid();
            }
        });
    }

    /**
     * Get the organization that owns this workflow
     */
    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class, 'organization_id');
    }

    /**
     * Get the user who created this workflow
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the previous version of this workflow
     */
    public function previousVersion(): BelongsTo
    {
        return $this->belongsTo(N8nWorkflow::class, 'previous_version_id');
    }

    /**
     * Get newer versions of this workflow
     */
    public function newerVersions(): HasMany
    {
        return $this->hasMany(N8nWorkflow::class, 'previous_version_id');
    }

    /**
     * Get the workflow executions
     */
    public function executions(): HasMany
    {
        return $this->hasMany(N8nExecution::class, 'workflow_id');
    }

    /**
     * Get successful executions
     */
    public function successfulExecutions(): HasMany
    {
        return $this->executions()->where('status', 'success');
    }

    /**
     * Get failed executions
     */
    public function failedExecutions(): HasMany
    {
        return $this->executions()->where('status', 'failed');
    }

    /**
     * Get recent executions
     */
    public function recentExecutions(int $limit = 10): HasMany
    {
        return $this->executions()->latest('created_at')->limit($limit);
    }

    /**
     * Scope for active workflows
     */
    public function scopeActive($query)
    {
        return $query->where('is_enabled', true);
    }

    /**
     * Scope for workflows by status
     */
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope for workflows by tag
     */
    public function scopeByTag($query, $tag)
    {
        return $query->whereJsonContains('tags', $tag);
    }

    /**
     * Scope for latest versions
     */
    public function scopeLatestVersions($query)
    {
        return $query->where('is_latest_version', true);
    }

    /**
     * Scope for specific trigger type
     */
    public function scopeWithTriggerType($query, string $triggerType)
    {
        return $query->where('trigger_type', $triggerType);
    }

    /**
     * Scope for scheduled workflows
     */
    public function scopeScheduled($query)
    {
        return $query->where('trigger_type', 'schedule')
                    ->whereNotNull('schedule_expression');
    }

    /**
     * Scope for webhook workflows
     */
    public function scopeWebhookTriggered($query)
    {
        return $query->where('trigger_type', 'webhook')
                    ->whereNotNull('webhook_url');
    }

    /**
     * Get workflow statistics
     */
    public function getStatisticsAttribute()
    {
        return [
            'total_executions' => $this->total_executions,
            'success_rate' => $this->total_executions > 0
                ? round(($this->successful_executions / $this->total_executions) * 100, 2)
                : 0,
            'failure_rate' => $this->total_executions > 0
                ? round(($this->failed_executions / $this->total_executions) * 100, 2)
                : 0,
            'average_time' => $this->avg_execution_time,
            'last_execution' => $this->last_execution_at,
        ];
    }

    /**
     * Check if workflow is active
     */
    public function isActive(): bool
    {
        return $this->status === 'active' && $this->is_enabled;
    }

    /**
     * Check if workflow is paused
     */
    public function isPaused(): bool
    {
        return $this->status === 'paused';
    }

    /**
     * Check if workflow has errors
     */
    public function hasErrors(): bool
    {
        return $this->status === 'error';
    }

    /**
     * Check if workflow is scheduled
     */
    public function isScheduled(): bool
    {
        return $this->trigger_type === 'schedule' && !is_null($this->schedule_expression);
    }

    /**
     * Check if workflow uses webhooks
     */
    public function usesWebhooks(): bool
    {
        return $this->trigger_type === 'webhook' && !is_null($this->webhook_url);
    }

    /**
     * Check if workflow is latest version
     */
    public function isLatestVersion(): bool
    {
        return $this->is_latest_version;
    }

    /**
     * Get success rate percentage
     */
    public function getSuccessRateAttribute(): float
    {
        if ($this->total_executions === 0) {
            return 0;
        }

        return round(($this->successful_executions / $this->total_executions) * 100, 2);
    }

    /**
     * Get execution status
     */
    public function getExecutionStatusAttribute(): string
    {
        if ($this->total_executions === 0) {
            return 'never_executed';
        }

        if ($this->success_rate >= 95) {
            return 'healthy';
        } elseif ($this->success_rate >= 80) {
            return 'warning';
        } else {
            return 'failing';
        }
    }

    /**
     * Get execution status color
     */
    public function getExecutionStatusColorAttribute(): string
    {
        return match ($this->execution_status) {
            'healthy' => 'green',
            'warning' => 'yellow',
            'failing' => 'red',
            'never_executed' => 'gray',
            default => 'gray',
        };
    }

    /**
     * Get average execution time in human readable format
     */
    public function getAvgExecutionTimeHumanAttribute(): ?string
    {
        if (!$this->avg_execution_time) {
            return null;
        }

        if ($this->avg_execution_time < 1000) {
            return $this->avg_execution_time . 'ms';
        } elseif ($this->avg_execution_time < 60000) {
            return round($this->avg_execution_time / 1000, 1) . 's';
        } else {
            return round($this->avg_execution_time / 60000, 1) . 'm';
        }
    }

    /**
     * Get node count
     */
    public function getNodeCountAttribute(): int
    {
        return count($this->nodes ?? []);
    }

    /**
     * Get connection count
     */
    public function getConnectionCountAttribute(): int
    {
        $connections = $this->connections ?? [];
        $count = 0;

        foreach ($connections as $nodeConnections) {
            foreach ($nodeConnections as $outputConnections) {
                $count += count($outputConnections);
            }
        }

        return $count;
    }

    /**
     * Check if user has permission
     */
    public function userHasPermission(User $user, string $permission): bool
    {
        if ($this->created_by === $user->id) {
            return true;
        }

        $permissions = $this->permissions ?? [];
        $userPermissions = $permissions[$permission] ?? [];

        return in_array($user->id, $userPermissions);
    }

    /**
     * Grant permission to user
     */
    public function grantPermission(User $user, string $permission): void
    {
        $permissions = $this->permissions ?? [];
        $userPermissions = $permissions[$permission] ?? [];

        if (!in_array($user->id, $userPermissions)) {
            $userPermissions[] = $user->id;
            $permissions[$permission] = $userPermissions;
            $this->update(['permissions' => $permissions]);
        }
    }

    /**
     * Revoke permission from user
     */
    public function revokePermission(User $user, string $permission): void
    {
        $permissions = $this->permissions ?? [];
        $userPermissions = $permissions[$permission] ?? [];

        $userPermissions = array_filter($userPermissions, fn($id) => $id !== $user->id);
        $permissions[$permission] = array_values($userPermissions);

        $this->update(['permissions' => $permissions]);
    }

    /**
     * Share workflow with user
     */
    public function shareWith(User $user): void
    {
        $sharedWith = $this->shared_with ?? [];

        if (!in_array($user->id, $sharedWith)) {
            $sharedWith[] = $user->id;
            $this->update(['shared_with' => $sharedWith]);
        }
    }

    /**
     * Unshare workflow with user
     */
    public function unshareWith(User $user): void
    {
        $sharedWith = $this->shared_with ?? [];
        $sharedWith = array_filter($sharedWith, fn($id) => $id !== $user->id);

        $this->update(['shared_with' => array_values($sharedWith)]);
    }

    /**
     * Activate workflow
     */
    public function activate(): void
    {
        $this->update([
            'status' => 'active',
            'is_enabled' => true,
        ]);
    }

    /**
     * Pause workflow
     */
    public function pause(): void
    {
        $this->update([
            'status' => 'paused',
            'is_enabled' => false,
        ]);
    }

    /**
     * Create new version
     */
    public function createNewVersion(array $changes = []): self
    {
        // Mark current version as not latest
        $this->update(['is_latest_version' => false]);

        // Create new version
        return static::create(array_merge(
            $this->only([
                'organization_id', 'workflow_id', 'name', 'description', 'category',
                'tags', 'workflow_data', 'nodes', 'connections', 'settings',
                'trigger_type', 'trigger_config', 'schedule_expression', 'created_by'
            ]),
            $changes,
            [
                'version' => $this->version + 1,
                'previous_version_id' => $this->id,
                'is_latest_version' => true,
                'total_executions' => 0,
                'successful_executions' => 0,
                'failed_executions' => 0,
                'avg_execution_time' => null,
            ]
        ));
    }

    /**
     * Update execution statistics
     */
    public function updateExecutionStats(string $status, int $duration): void
    {
        $this->increment('total_executions');

        if ($status === 'success') {
            $this->increment('successful_executions');
        } elseif ($status === 'failed') {
            $this->increment('failed_executions');
        }

        // Update average execution time
        if ($this->total_executions > 1) {
            $currentAvg = $this->avg_execution_time ?? 0;
            $newAvg = (($currentAvg * ($this->total_executions - 1)) + $duration) / $this->total_executions;
            $this->update(['avg_execution_time' => round($newAvg)]);
        } else {
            $this->update(['avg_execution_time' => $duration]);
        }

        $this->update(['last_execution_at' => now()]);
    }

    /**
     * Check if workflow is healthy
     */
    public function isHealthy(): bool
    {
        if ($this->total_executions === 0) {
            return true;
        }

        $failureRate = ($this->failed_executions / $this->total_executions) * 100;
        return $failureRate < 20; // Consider healthy if failure rate < 20%
    }

    /**
     * Get workflow health status
     */
    public function getHealthStatusAttribute(): string
    {
        if ($this->isHealthy()) {
            return 'healthy';
        }

        if ($this->failed_executions > 0 && $this->successful_executions === 0) {
            return 'critical';
        }

        return 'warning';
    }

    /**
     * Generate standardized workflow name with format: organization_id__count(001)
     */
    public static function generateWorkflowName(?string $organizationId = null, ?string $customName = null): string
    {
        // Use organization_id as base name, fallback to 'workflow' if not provided
        $baseName = $organizationId ? $organizationId : 'workflow';

        // If custom name provided, append it to base name
        if ($customName) {
            $cleanCustomName = strtolower(preg_replace('/[^a-zA-Z0-9]/', '', $customName));
            $baseName = $baseName . '_' . $cleanCustomName;
        }

        // Count existing workflows with similar name pattern for this organization
        $query = self::query();
        if ($organizationId) {
            $query->where('organization_id', $organizationId);
        }
        $count = $query->where('name', 'like', $baseName . '__%')->count();

        // Generate next number (001, 002, 003, etc.)
        $nextNumber = str_pad($count + 1, 3, '0', STR_PAD_LEFT);

        return $baseName . '__' . $nextNumber;
    }

    /**
     * Standardize N8N workflow payload for storage
     */
    public static function standardizePayload(array $n8nWorkflowData): array
    {
        return [
            'workflow_id' => $n8nWorkflowData['id'] ?? null,
            'name' => $n8nWorkflowData['name'] ?? 'Untitled Workflow',
            'description' => $n8nWorkflowData['description'] ?? null,
            'category' => $n8nWorkflowData['category'] ?? null,
            'tags' => $n8nWorkflowData['tags'] ?? [],
            'workflow_data' => $n8nWorkflowData ?: [],
            'nodes' => $n8nWorkflowData['nodes'] ?? [],
            'connections' => $n8nWorkflowData['connections'] ?? [],
            'settings' => $n8nWorkflowData['settings'] ?? [],
            'trigger_type' => $n8nWorkflowData['trigger_type'] ?? null,
            'trigger_config' => $n8nWorkflowData['trigger_config'] ?? [],
            'schedule_expression' => $n8nWorkflowData['schedule_expression'] ?? null,
            'version' => $n8nWorkflowData['version'] ?? 1,
            'previous_version_id' => $n8nWorkflowData['previous_version_id'] ?? null,
            'is_latest_version' => $n8nWorkflowData['is_latest_version'] ?? true,
            'status' => ($n8nWorkflowData['active'] ?? false) ? 'active' : 'inactive',
            'is_enabled' => $n8nWorkflowData['active'] ?? false,
            'last_execution_at' => isset($n8nWorkflowData['last_execution_at']) ?
                \Carbon\Carbon::parse($n8nWorkflowData['last_execution_at']) : null,
            'next_execution_at' => isset($n8nWorkflowData['next_execution_at']) ?
                \Carbon\Carbon::parse($n8nWorkflowData['next_execution_at']) : null,
            'total_executions' => $n8nWorkflowData['total_executions'] ?? 0,
            'successful_executions' => $n8nWorkflowData['successful_executions'] ?? 0,
            'failed_executions' => $n8nWorkflowData['failed_executions'] ?? 0,
            'avg_execution_time' => $n8nWorkflowData['avg_execution_time'] ?? null,
            'webhook_url' => $n8nWorkflowData['webhook_url'] ?? null,
            'webhook_secret' => $n8nWorkflowData['webhook_secret'] ?? null,
            'api_endpoints' => $n8nWorkflowData['api_endpoints'] ?? [],
            'metadata' => $n8nWorkflowData['metadata'] ?? [],
        ];
    }

    /**
     * Create or update workflow from N8N data
     */
    public static function createOrUpdateFromN8n(array $n8nWorkflowData, ?string $organizationId = null, ?string $createdBy = null, ?string $customName = null): self
    {
        $standardizedData = self::standardizePayload($n8nWorkflowData);

        // Add organization and creator info
        if ($organizationId) {
            $standardizedData['organization_id'] = $organizationId;
        }
        if ($createdBy) {
            $standardizedData['created_by'] = $createdBy;
        }

        // Find existing workflow by N8N ID
        $workflow = self::where('workflow_id', $standardizedData['workflow_id'])->first();

        if ($workflow) {
            // Update existing workflow
            Log::info('Updating existing workflow in database', [
                'database_id' => $workflow->id,
                'workflow_id' => $workflow->workflow_id
            ]);
            $workflow->update($standardizedData);
            return $workflow;
        } else {
            // Generate standardized workflow name for new workflow
            if ($organizationId) {
                $standardizedData['name'] = self::generateWorkflowName($organizationId, $customName);
            }

            // Log the standardized data
            Log::info('Creating new workflow in database with standardized name', [
                'workflow_id' => $standardizedData['workflow_id'],
                'original_name' => $n8nWorkflowData['name'] ?? 'Untitled Workflow',
                'standardized_name' => $standardizedData['name'],
                'organization_id' => $standardizedData['organization_id'] ?? null,
                'created_by' => $standardizedData['created_by'] ?? null,
                'custom_name' => $customName
            ]);

            $workflow = self::create($standardizedData);

            Log::info('Successfully created workflow in database', [
                'database_id' => $workflow->id,
                'workflow_id' => $workflow->workflow_id,
                'name' => $workflow->name,
                'created_at' => $workflow->created_at
            ]);

            return $workflow;
        }
    }

    /**
     * Convert to N8N API format
     */
    public function toN8nFormat(): array
    {
        return [
            'id' => $this->workflow_id,
            'name' => $this->name,
            'active' => $this->is_enabled,
            'nodes' => $this->nodes ?? [],
            'connections' => $this->connections ?? [],
            'settings' => $this->settings ?? [],
            'staticData' => $this->workflow_data['staticData'] ?? null,
            'shared' => $this->workflow_data['shared'] ?? [],
            'versionId' => $this->workflow_data['versionId'] ?? null,
            'isArchived' => $this->workflow_data['isArchived'] ?? false,
            'triggerCount' => $this->workflow_data['triggerCount'] ?? 0,
            'createdAt' => $this->workflow_data['createdAt'] ?? $this->created_at?->toISOString(),
            'updatedAt' => $this->workflow_data['updatedAt'] ?? $this->updated_at?->toISOString(),
        ];
    }

    /**
     * Validate workflow payload structure
     */
    public static function validatePayload(array $payload): array
    {
        $errors = [];

        // Required fields
        if (empty($payload['name'])) {
            $errors[] = 'Name is required';
        }

        // Validate nodes structure
        if (isset($payload['nodes']) && !is_array($payload['nodes'])) {
            $errors[] = 'Nodes must be an array';
        }

        // Validate connections structure
        if (isset($payload['connections']) && !is_array($payload['connections'])) {
            $errors[] = 'Connections must be an array';
        }

        // Validate settings structure
        if (isset($payload['settings']) && !is_array($payload['settings'])) {
            $errors[] = 'Settings must be an array';
        }

        // Validate staticData structure
        if (isset($payload['staticData']) && !is_array($payload['staticData'])) {
            $errors[] = 'StaticData must be an array';
        }

        // Validate shared structure
        if (isset($payload['shared']) && !is_array($payload['shared'])) {
            $errors[] = 'Shared must be an array';
        }

        return $errors;
    }

    /**
     * Get standardized workflow summary
     */
    public function getSummaryAttribute(): array
    {
        return [
            'id' => $this->id,
            'workflow_id' => $this->workflow_id,
            'name' => $this->name,
            'description' => $this->description,
            'category' => $this->category,
            'active' => $this->is_enabled,
            'status' => $this->status,
            'node_count' => count($this->nodes ?? []),
            'connection_count' => $this->connection_count,
            'total_executions' => $this->total_executions ?? 0,
            'successful_executions' => $this->successful_executions ?? 0,
            'failed_executions' => $this->failed_executions ?? 0,
            'success_rate' => $this->success_rate,
            'last_execution' => $this->last_execution_at,
            'created_by' => $this->created_by,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}


