<?php

namespace App\Models;

use App\Traits\BelongsToOrganization;
use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class N8nExecution extends Model
{
    use HasFactory, HasUuid, BelongsToOrganization;

    protected $table = 'n8n_executions';

    protected $fillable = [
        'organization_id',
        'workflow_id',
        'execution_id',
        'parent_execution_id',
        'status',
        'mode',
        'started_at',
        'finished_at',
        'duration_ms',
        'input_data',
        'output_data',
        'execution_data',
        'error_message',
        'error_details',
        'retry_count',
        'max_retries',
        'node_executions',
        'failed_nodes',
        'memory_usage_mb',
        'cpu_usage_percent',
        'trigger_data',
        'webhook_response',
        'metadata',
    ];

    protected $casts = [
        'started_at' => 'datetime',
        'finished_at' => 'datetime',
        'duration_ms' => 'integer',
        'input_data' => 'array',
        'output_data' => 'array',
        'execution_data' => 'array',
        'error_details' => 'array',
        'retry_count' => 'integer',
        'max_retries' => 'integer',
        'node_executions' => 'array',
        'failed_nodes' => 'array',
        'memory_usage_mb' => 'integer',
        'cpu_usage_percent' => 'decimal:2',
        'trigger_data' => 'array',
        'webhook_response' => 'array',
        'metadata' => 'array',
        'created_at' => 'datetime',
    ];

    public $timestamps = false; // Only has created_at from schema

    /**
     * Boot the model.
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (!$model->created_at) {
                $model->created_at = now();
            }
        });
    }

    /**
     * Get the workflow this execution belongs to.
     */
    public function workflow(): BelongsTo
    {
        return $this->belongsTo(N8nWorkflow::class, 'workflow_id', 'workflow_id');
    }

    /**
     * Get the parent execution (for sub-workflows).
     */
    public function parentExecution(): BelongsTo
    {
        return $this->belongsTo(N8nExecution::class, 'parent_execution_id', 'execution_id');
    }

    /**
     * Check if execution is running.
     */
    public function isRunning(): bool
    {
        return $this->status === 'running';
    }

    /**
     * Check if execution was successful.
     */
    public function isSuccessful(): bool
    {
        return $this->status === 'success';
    }

    /**
     * Check if execution failed.
     */
    public function isFailed(): bool
    {
        return $this->status === 'failed';
    }

    /**
     * Check if execution was cancelled.
     */
    public function isCancelled(): bool
    {
        return $this->status === 'cancelled';
    }

    /**
     * Check if execution is waiting.
     */
    public function isWaiting(): bool
    {
        return $this->status === 'waiting';
    }

    /**
     * Check if execution timed out.
     */
    public function isTimedOut(): bool
    {
        return $this->status === 'timeout';
    }

    /**
     * Check if execution is completed.
     */
    public function isCompleted(): bool
    {
        return in_array($this->status, ['success', 'failed', 'cancelled', 'timeout']);
    }

    /**
     * Check if execution is a retry.
     */
    public function isRetry(): bool
    {
        return $this->retry_count > 0;
    }

    /**
     * Check if execution has sub-workflows.
     */
    public function hasSubWorkflows(): bool
    {
        return N8nExecution::where('parent_execution_id', $this->execution_id)->exists();
    }

    /**
     * Get duration in human readable format.
     */
    public function getDurationHumanAttribute(): ?string
    {
        if (!$this->duration_ms) {
            return null;
        }

        if ($this->duration_ms < 1000) {
            return $this->duration_ms . 'ms';
        } elseif ($this->duration_ms < 60000) {
            return round($this->duration_ms / 1000, 1) . 's';
        } else {
            return round($this->duration_ms / 60000, 1) . 'm';
        }
    }

    /**
     * Get memory usage in human readable format.
     */
    public function getMemoryUsageHumanAttribute(): ?string
    {
        if (!$this->memory_usage_mb) {
            return null;
        }

        if ($this->memory_usage_mb < 1024) {
            return $this->memory_usage_mb . 'MB';
        } else {
            return round($this->memory_usage_mb / 1024, 1) . 'GB';
        }
    }

    /**
     * Get execution performance score.
     */
    public function getPerformanceScoreAttribute(): float
    {
        $score = 100;

        // Deduct points for duration
        if ($this->duration_ms > 60000) { // > 1 minute
            $score -= 20;
        } elseif ($this->duration_ms > 30000) { // > 30 seconds
            $score -= 10;
        }

        // Deduct points for memory usage
        if ($this->memory_usage_mb > 1024) { // > 1GB
            $score -= 20;
        } elseif ($this->memory_usage_mb > 512) { // > 512MB
            $score -= 10;
        }

        // Deduct points for CPU usage
        if ($this->cpu_usage_percent > 80) {
            $score -= 15;
        } elseif ($this->cpu_usage_percent > 60) {
            $score -= 10;
        }

        // Deduct points for retries
        $score -= ($this->retry_count * 5);

        // Deduct points for failed nodes
        $failedNodeCount = count($this->failed_nodes ?? []);
        $score -= ($failedNodeCount * 10);

        return max(0, $score);
    }

    /**
     * Get execution status color.
     */
    public function getStatusColorAttribute(): string
    {
        return match ($this->status) {
            'success' => 'green',
            'failed' => 'red',
            'running' => 'blue',
            'waiting' => 'yellow',
            'cancelled' => 'gray',
            'timeout' => 'orange',
            default => 'gray',
        };
    }

    /**
     * Get execution mode display.
     */
    public function getModeDisplayAttribute(): string
    {
        return match ($this->mode) {
            'trigger' => 'Triggered',
            'manual' => 'Manual',
            'retry' => 'Retry',
            default => ucfirst($this->mode),
        };
    }

    /**
     * Get number of executed nodes.
     */
    public function getExecutedNodeCountAttribute(): int
    {
        return count($this->node_executions ?? []);
    }

    /**
     * Get number of failed nodes.
     */
    public function getFailedNodeCountAttribute(): int
    {
        return count($this->failed_nodes ?? []);
    }

    /**
     * Mark execution as started.
     */
    public function markAsStarted(): void
    {
        $this->update([
            'status' => 'running',
            'started_at' => now(),
        ]);
    }

    /**
     * Mark execution as successful.
     */
    public function markAsSuccessful(array $outputData = [], array $executionData = []): void
    {
        $finishedAt = now();
        $duration = $this->started_at ? $this->started_at->diffInRealMilliseconds($finishedAt) : 0;

        $this->update([
            'status' => 'success',
            'finished_at' => $finishedAt,
            'duration_ms' => $duration,
            'output_data' => $outputData,
            'execution_data' => $executionData,
            'error_message' => null,
            'error_details' => null,
        ]);

        // Update workflow statistics
        $this->workflow?->updateExecutionStats('success', $duration);
    }

    /**
     * Mark execution as failed.
     */
    public function markAsFailed(string $errorMessage = null, array $errorDetails = [], array $failedNodes = []): void
    {
        $finishedAt = now();
        $duration = $this->started_at ? $this->started_at->diffInRealMilliseconds($finishedAt) : 0;

        $this->update([
            'status' => 'failed',
            'finished_at' => $finishedAt,
            'duration_ms' => $duration,
            'error_message' => $errorMessage,
            'error_details' => $errorDetails,
            'failed_nodes' => $failedNodes,
        ]);

        // Update workflow statistics
        $this->workflow?->updateExecutionStats('failed', $duration);
    }

    /**
     * Cancel execution.
     */
    public function cancel(): void
    {
        $finishedAt = now();
        $duration = $this->started_at ? $this->started_at->diffInRealMilliseconds($finishedAt) : 0;

        $this->update([
            'status' => 'cancelled',
            'finished_at' => $finishedAt,
            'duration_ms' => $duration,
        ]);
    }

    /**
     * Update resource usage.
     */
    public function updateResourceUsage(int $memoryMb = null, float $cpuPercent = null): void
    {
        $updates = [];

        if ($memoryMb !== null) {
            $updates['memory_usage_mb'] = $memoryMb;
        }

        if ($cpuPercent !== null) {
            $updates['cpu_usage_percent'] = $cpuPercent;
        }

        if (!empty($updates)) {
            $this->update($updates);
        }
    }

    /**
     * Scope for running executions.
     */
    public function scopeRunning($query)
    {
        return $query->where('status', 'running');
    }

    /**
     * Scope for successful executions.
     */
    public function scopeSuccessful($query)
    {
        return $query->where('status', 'success');
    }

    /**
     * Scope for failed executions.
     */
    public function scopeFailed($query)
    {
        return $query->where('status', 'failed');
    }

    /**
     * Scope for completed executions.
     */
    public function scopeCompleted($query)
    {
        return $query->whereIn('status', ['success', 'failed', 'cancelled', 'timeout']);
    }

    /**
     * Scope for specific workflow.
     */
    public function scopeForWorkflow($query, $workflowId)
    {
        return $query->where('workflow_id', $workflowId);
    }

    /**
     * Scope for retry executions.
     */
    public function scopeRetries($query)
    {
        return $query->where('retry_count', '>', 0);
    }

    /**
     * Scope for long-running executions.
     */
    public function scopeLongRunning($query, int $thresholdMs = 300000) // 5 minutes
    {
        return $query->where('duration_ms', '>', $thresholdMs);
    }

    /**
     * Scope for high memory usage.
     */
    public function scopeHighMemoryUsage($query, int $thresholdMb = 512)
    {
        return $query->where('memory_usage_mb', '>', $thresholdMb);
    }

    /**
     * Scope for recent executions.
     */
    public function scopeRecent($query, int $hours = 24)
    {
        return $query->where('created_at', '>', now()->subHours($hours));
    }

    /**
     * Order by duration.
     */
    public function scopeByDuration($query, string $direction = 'desc')
    {
        return $query->orderBy('duration_ms', $direction);
    }

    /**
     * Order by memory usage.
     */
    public function scopeByMemoryUsage($query, string $direction = 'desc')
    {
        return $query->orderBy('memory_usage_mb', $direction);
    }

    /**
     * Order by performance score.
     */
    public function scopeByPerformance($query, string $direction = 'desc')
    {
        return $query->get()
                    ->sortBy('performance_score', SORT_REGULAR, $direction === 'desc')
                    ->values();
    }
}
