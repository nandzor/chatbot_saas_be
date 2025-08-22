<?php

namespace App\Models;

use App\Traits\BelongsToOrganization;
use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class N8nWorkflow extends Model
{
    use HasFactory, HasUuid, BelongsToOrganization;

    protected $table = 'n8n_workflows';

    protected $fillable = [
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

    protected $hidden = [
        'webhook_secret',
    ];

    /**
     * Get the user who created this workflow.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the previous version of this workflow.
     */
    public function previousVersion(): BelongsTo
    {
        return $this->belongsTo(N8nWorkflow::class, 'previous_version_id');
    }

    /**
     * Get newer versions of this workflow.
     */
    public function newerVersions(): HasMany
    {
        return $this->hasMany(N8nWorkflow::class, 'previous_version_id');
    }

    /**
     * Get the workflow executions.
     */
    public function executions(): HasMany
    {
        return $this->hasMany(N8nExecution::class, 'workflow_id');
    }

    /**
     * Get successful executions.
     */
    public function successfulExecutions(): HasMany
    {
        return $this->executions()->where('status', 'success');
    }

    /**
     * Get failed executions.
     */
    public function failedExecutions(): HasMany
    {
        return $this->executions()->where('status', 'failed');
    }

    /**
     * Get recent executions.
     */
    public function recentExecutions(int $limit = 10): HasMany
    {
        return $this->executions()->latest('created_at')->limit($limit);
    }

    /**
     * Check if workflow is active.
     */
    public function isActive(): bool
    {
        return $this->status === 'active' && $this->is_enabled;
    }

    /**
     * Check if workflow is paused.
     */
    public function isPaused(): bool
    {
        return $this->status === 'paused';
    }

    /**
     * Check if workflow has errors.
     */
    public function hasErrors(): bool
    {
        return $this->status === 'error';
    }

    /**
     * Check if workflow is scheduled.
     */
    public function isScheduled(): bool
    {
        return $this->trigger_type === 'schedule' && !is_null($this->schedule_expression);
    }

    /**
     * Check if workflow uses webhooks.
     */
    public function usesWebhooks(): bool
    {
        return $this->trigger_type === 'webhook' && !is_null($this->webhook_url);
    }

    /**
     * Check if workflow is latest version.
     */
    public function isLatestVersion(): bool
    {
        return $this->is_latest_version;
    }

    /**
     * Get success rate percentage.
     */
    public function getSuccessRateAttribute(): float
    {
        if ($this->total_executions === 0) {
            return 0;
        }

        return round(($this->successful_executions / $this->total_executions) * 100, 2);
    }

    /**
     * Get execution status.
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
     * Get execution status color.
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
     * Get average execution time in human readable format.
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
     * Get node count.
     */
    public function getNodeCountAttribute(): int
    {
        return count($this->nodes ?? []);
    }

    /**
     * Get connection count.
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
     * Check if user has permission.
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
     * Grant permission to user.
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
     * Revoke permission from user.
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
     * Share workflow with user.
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
     * Unshare workflow with user.
     */
    public function unshareWith(User $user): void
    {
        $sharedWith = $this->shared_with ?? [];
        $sharedWith = array_filter($sharedWith, fn($id) => $id !== $user->id);

        $this->update(['shared_with' => array_values($sharedWith)]);
    }

    /**
     * Activate workflow.
     */
    public function activate(): void
    {
        $this->update([
            'status' => 'active',
            'is_enabled' => true,
        ]);
    }

    /**
     * Pause workflow.
     */
    public function pause(): void
    {
        $this->update([
            'status' => 'paused',
            'is_enabled' => false,
        ]);
    }

    /**
     * Create new version.
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
     * Update execution statistics.
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
     * Scope for active workflows.
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active')
                    ->where('is_enabled', true);
    }

    /**
     * Scope for latest versions.
     */
    public function scopeLatestVersions($query)
    {
        return $query->where('is_latest_version', true);
    }

    /**
     * Scope for specific trigger type.
     */
    public function scopeWithTriggerType($query, string $triggerType)
    {
        return $query->where('trigger_type', $triggerType);
    }

    /**
     * Scope for scheduled workflows.
     */
    public function scopeScheduled($query)
    {
        return $query->where('trigger_type', 'schedule')
                    ->whereNotNull('schedule_expression');
    }

    /**
     * Scope for webhook workflows.
     */
    public function scopeWebhookTriggered($query)
    {
        return $query->where('trigger_type', 'webhook')
                    ->whereNotNull('webhook_url');
    }

    /**
     * Scope for workflows created by user.
     */
    public function scopeCreatedBy($query, $userId)
    {
        return $query->where('created_by', $userId);
    }

    /**
     * Scope for workflows shared with user.
     */
    public function scopeSharedWith($query, $userId)
    {
        return $query->whereJsonContains('shared_with', $userId);
    }

    /**
     * Order by execution count.
     */
    public function scopeByExecutionCount($query, string $direction = 'desc')
    {
        return $query->orderBy('total_executions', $direction);
    }

    /**
     * Order by success rate.
     */
    public function scopeBySuccessRate($query, string $direction = 'desc')
    {
        return $query->orderByRaw('(successful_executions / NULLIF(total_executions, 0)) ' . $direction);
    }

    /**
     * Search workflows.
     */
    public function scopeSearch($query, string $term)
    {
        return $query->where(function ($query) use ($term) {
            $query->where('name', 'LIKE', "%{$term}%")
                  ->orWhere('description', 'LIKE', "%{$term}%")
                  ->orWhere('category', 'LIKE', "%{$term}%")
                  ->orWhereJsonContains('tags', $term);
        });
    }
}
