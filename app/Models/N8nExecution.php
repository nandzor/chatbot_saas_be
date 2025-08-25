<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class N8nExecution extends Model
{
    use HasFactory;

    protected $table = 'n8n_executions';
    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';

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
        'input_data' => 'array',
        'output_data' => 'array',
        'execution_data' => 'array',
        'error_details' => 'array',
        'node_executions' => 'array',
        'failed_nodes' => 'array',
        'trigger_data' => 'array',
        'webhook_response' => 'array',
        'metadata' => 'array',
        'started_at' => 'datetime',
        'finished_at' => 'datetime',
        'duration_ms' => 'integer',
        'retry_count' => 'integer',
        'max_retries' => 'integer',
        'memory_usage_mb' => 'integer',
        'cpu_usage_percent' => 'decimal:2',
    ];

    /**
     * Get the organization that owns this execution
     */
    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class, 'organization_id');
    }

    /**
     * Get the workflow that this execution belongs to
     */
    public function workflow(): BelongsTo
    {
        return $this->belongsTo(N8nWorkflow::class, 'workflow_id');
    }

    /**
     * Get the parent execution if this is a sub-workflow execution
     */
    public function parentExecution(): BelongsTo
    {
        return $this->belongsTo(N8nExecution::class, 'parent_execution_id');
    }

    /**
     * Get child executions if this is a parent execution
     */
    public function childExecutions(): HasMany
    {
        return $this->hasMany(N8nExecution::class, 'parent_execution_id');
    }

    /**
     * Scope for successful executions
     */
    public function scopeSuccessful($query)
    {
        return $query->where('status', 'success');
    }

    /**
     * Scope for failed executions
     */
    public function scopeFailed($query)
    {
        return $query->where('status', 'failed');
    }

    /**
     * Scope for running executions
     */
    public function scopeRunning($query)
    {
        return $query->where('status', 'running');
    }

    /**
     * Scope for executions by status
     */
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope for executions by mode
     */
    public function scopeByMode($query, $mode)
    {
        return $query->where('mode', $mode);
    }

    /**
     * Check if execution is successful
     */
    public function isSuccessful(): bool
    {
        return $this->status === 'success';
    }

    /**
     * Check if execution failed
     */
    public function isFailed(): bool
    {
        return $this->status === 'failed';
    }

    /**
     * Check if execution is running
     */
    public function isRunning(): bool
    {
        return $this->status === 'running';
    }

    /**
     * Check if execution is a retry
     */
    public function isRetry(): bool
    {
        return $this->retry_count > 0;
    }

    /**
     * Check if execution can be retried
     */
    public function canRetry(): bool
    {
        return $this->retry_count < $this->max_retries;
    }

    /**
     * Get execution duration in human readable format
     */
    public function getDurationHumanAttribute(): string
    {
        if (!$this->duration_ms) {
            return 'N/A';
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
     * Get execution summary
     */
    public function getSummaryAttribute(): array
    {
        return [
            'id' => $this->execution_id,
            'status' => $this->status,
            'mode' => $this->mode,
            'duration' => $this->duration_human,
            'started_at' => $this->started_at?->format('Y-m-d H:i:s'),
            'finished_at' => $this->finished_at?->format('Y-m-d H:i:s'),
            'has_error' => !empty($this->error_message),
            'retry_count' => $this->retry_count,
            'node_count' => count($this->node_executions ?? []),
            'failed_nodes' => count($this->failed_nodes ?? []),
        ];
    }

    /**
     * Get performance metrics
     */
    public function getPerformanceMetricsAttribute(): array
    {
        return [
            'duration_ms' => $this->duration_ms,
            'duration_human' => $this->duration_human,
            'memory_usage_mb' => $this->memory_usage_mb,
            'cpu_usage_percent' => $this->cpu_usage_percent,
            'node_count' => count($this->node_executions ?? []),
            'failed_nodes' => count($this->failed_nodes ?? []),
        ];
    }

    /**
     * Get error summary
     */
    public function getErrorSummaryAttribute(): array
    {
        if (empty($this->error_message)) {
            return [];
        }

        return [
            'message' => $this->error_message,
            'details' => $this->error_details,
            'retry_count' => $this->retry_count,
            'max_retries' => $this->max_retries,
            'can_retry' => $this->canRetry(),
            'failed_nodes' => $this->failed_nodes,
        ];
    }

    /**
     * Calculate execution duration
     */
    public function calculateDuration(): void
    {
        if ($this->started_at && $this->finished_at) {
            $this->duration_ms = $this->started_at->diffInMilliseconds($this->finished_at);
            $this->save();
        }
    }

    /**
     * Mark execution as finished
     */
    public function markAsFinished(string $status = 'success', ?string $errorMessage = null): void
    {
        $this->update([
            'status' => $status,
            'finished_at' => now(),
            'error_message' => $errorMessage,
        ]);

        $this->calculateDuration();
    }

    /**
     * Increment retry count
     */
    public function incrementRetryCount(): void
    {
        $this->increment('retry_count');
    }

    /**
     * Reset retry count
     */
    public function resetRetryCount(): void
    {
        $this->update(['retry_count' => 0]);
    }
}
