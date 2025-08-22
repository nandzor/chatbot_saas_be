<?php

namespace App\Models;

use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SystemLog extends Model
{
    use HasFactory, HasUuid;

    protected $table = 'system_logs';

    protected $fillable = [
        'organization_id',
        'level',
        'logger_name',
        'message',
        'formatted_message',
        'component',
        'service',
        'instance_id',
        'request_id',
        'session_id',
        'user_id',
        'ip_address',
        'user_agent',
        'error_code',
        'error_type',
        'stack_trace',
        'duration_ms',
        'memory_usage_mb',
        'cpu_usage_percent',
        'extra_data',
        'tags',
        'timestamp',
    ];

    protected $casts = [
        'duration_ms' => 'integer',
        'memory_usage_mb' => 'integer',
        'cpu_usage_percent' => 'decimal:2',
        'extra_data' => 'array',
        'tags' => 'array',
        'timestamp' => 'datetime',
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

            if (!$model->timestamp) {
                $model->timestamp = now();
            }
        });
    }

    /**
     * Get the organization this log belongs to.
     */
    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    /**
     * Get the user this log is associated with.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Check if log level is debug.
     */
    public function isDebug(): bool
    {
        return $this->level === 'debug';
    }

    /**
     * Check if log level is info.
     */
    public function isInfo(): bool
    {
        return $this->level === 'info';
    }

    /**
     * Check if log level is warning.
     */
    public function isWarning(): bool
    {
        return $this->level === 'warn';
    }

    /**
     * Check if log level is error.
     */
    public function isError(): bool
    {
        return $this->level === 'error';
    }

    /**
     * Check if log level is fatal.
     */
    public function isFatal(): bool
    {
        return $this->level === 'fatal';
    }

    /**
     * Check if log has error information.
     */
    public function hasError(): bool
    {
        return !is_null($this->error_code) || !is_null($this->error_type) || !is_null($this->stack_trace);
    }

    /**
     * Check if log has performance data.
     */
    public function hasPerformanceData(): bool
    {
        return !is_null($this->duration_ms) || !is_null($this->memory_usage_mb) || !is_null($this->cpu_usage_percent);
    }

    /**
     * Get log level color.
     */
    public function getLevelColorAttribute(): string
    {
        return match ($this->level) {
            'debug' => 'gray',
            'info' => 'blue',
            'warn' => 'yellow',
            'error' => 'red',
            'fatal' => 'purple',
            default => 'gray',
        };
    }

    /**
     * Get log level priority.
     */
    public function getLevelPriorityAttribute(): int
    {
        return match ($this->level) {
            'debug' => 1,
            'info' => 2,
            'warn' => 3,
            'error' => 4,
            'fatal' => 5,
            default => 0,
        };
    }

    /**
     * Get component display name.
     */
    public function getComponentDisplayAttribute(): string
    {
        return match ($this->component) {
            'api' => 'API',
            'worker' => 'Background Worker',
            'scheduler' => 'Task Scheduler',
            'webhook' => 'Webhook Handler',
            'queue' => 'Queue Processor',
            'auth' => 'Authentication',
            'database' => 'Database',
            'cache' => 'Cache',
            'storage' => 'File Storage',
            'email' => 'Email Service',
            'sms' => 'SMS Service',
            'ai' => 'AI Service',
            'chat' => 'Chat System',
            'knowledge' => 'Knowledge Base',
            'billing' => 'Billing System',
            default => ucfirst($this->component ?? 'Unknown'),
        };
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
     * Get age of log entry in human readable format.
     */
    public function getAgeHumanAttribute(): string
    {
        return $this->timestamp->diffForHumans();
    }

    /**
     * Get extra data by key.
     */
    public function getExtraData(string $key, $default = null)
    {
        $extraData = $this->extra_data ?? [];
        return $extraData[$key] ?? $default;
    }

    /**
     * Check if log has specific tag.
     */
    public function hasTag(string $tag): bool
    {
        $tags = $this->tags ?? [];
        return in_array($tag, $tags);
    }

    /**
     * Get truncated message.
     */
    public function getTruncatedMessageAttribute(): string
    {
        return strlen($this->message) > 100
            ? substr($this->message, 0, 100) . '...'
            : $this->message;
    }

    /**
     * Get error summary.
     */
    public function getErrorSummaryAttribute(): ?string
    {
        if (!$this->hasError()) {
            return null;
        }

        $parts = array_filter([
            $this->error_type,
            $this->error_code,
        ]);

        return implode(' - ', $parts) ?: 'Unknown Error';
    }

    /**
     * Log a message.
     */
    public static function log(
        string $level,
        string $message,
        array $context = [],
        string $organizationId = null
    ): self {
        return static::create(array_merge([
            'organization_id' => $organizationId,
            'level' => $level,
            'message' => $message,
            'formatted_message' => $message,
            'component' => $context['component'] ?? 'application',
            'service' => $context['service'] ?? null,
            'instance_id' => $context['instance_id'] ?? gethostname(),
            'extra_data' => $context['extra_data'] ?? [],
            'tags' => $context['tags'] ?? [],
        ], $context));
    }

    /**
     * Log debug message.
     */
    public static function debug(string $message, array $context = [], string $organizationId = null): self
    {
        return static::log('debug', $message, $context, $organizationId);
    }

    /**
     * Log info message.
     */
    public static function info(string $message, array $context = [], string $organizationId = null): self
    {
        return static::log('info', $message, $context, $organizationId);
    }

    /**
     * Log warning message.
     */
    public static function warning(string $message, array $context = [], string $organizationId = null): self
    {
        return static::log('warn', $message, $context, $organizationId);
    }

    /**
     * Log error message.
     */
    public static function error(string $message, array $context = [], string $organizationId = null): self
    {
        return static::log('error', $message, $context, $organizationId);
    }

    /**
     * Log fatal message.
     */
    public static function fatal(string $message, array $context = [], string $organizationId = null): self
    {
        return static::log('fatal', $message, $context, $organizationId);
    }

    /**
     * Log exception.
     */
    public static function logException(
        \Throwable $exception,
        array $context = [],
        string $organizationId = null
    ): self {
        return static::error($exception->getMessage(), array_merge($context, [
            'error_type' => get_class($exception),
            'error_code' => $exception->getCode(),
            'stack_trace' => $exception->getTraceAsString(),
        ]), $organizationId);
    }

    /**
     * Scope for specific level.
     */
    public function scopeLevel($query, string $level)
    {
        return $query->where('level', $level);
    }

    /**
     * Scope for minimum level.
     */
    public function scopeMinLevel($query, string $minLevel)
    {
        $priorities = [
            'debug' => 1,
            'info' => 2,
            'warn' => 3,
            'error' => 4,
            'fatal' => 5,
        ];

        $minPriority = $priorities[$minLevel] ?? 1;

        return $query->whereIn('level', array_keys(array_filter($priorities, fn($p) => $p >= $minPriority)));
    }

    /**
     * Scope for specific component.
     */
    public function scopeComponent($query, string $component)
    {
        return $query->where('component', $component);
    }

    /**
     * Scope for specific service.
     */
    public function scopeService($query, string $service)
    {
        return $query->where('service', $service);
    }

    /**
     * Scope for specific user.
     */
    public function scopeForUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Scope for specific request.
     */
    public function scopeForRequest($query, string $requestId)
    {
        return $query->where('request_id', $requestId);
    }

    /**
     * Scope for logs with errors.
     */
    public function scopeWithErrors($query)
    {
        return $query->where(function ($query) {
            $query->whereNotNull('error_code')
                  ->orWhereNotNull('error_type')
                  ->orWhereNotNull('stack_trace');
        });
    }

    /**
     * Scope for logs with performance data.
     */
    public function scopeWithPerformanceData($query)
    {
        return $query->where(function ($query) {
            $query->whereNotNull('duration_ms')
                  ->orWhereNotNull('memory_usage_mb')
                  ->orWhereNotNull('cpu_usage_percent');
        });
    }

    /**
     * Scope for slow operations.
     */
    public function scopeSlowOperations($query, int $thresholdMs = 1000)
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
     * Scope for recent logs.
     */
    public function scopeRecent($query, int $hours = 24)
    {
        return $query->where('timestamp', '>', now()->subHours($hours));
    }

    /**
     * Scope for logs with specific tag.
     */
    public function scopeWithTag($query, string $tag)
    {
        return $query->whereJsonContains('tags', $tag);
    }

    /**
     * Order by timestamp.
     */
    public function scopeByTimestamp($query, string $direction = 'desc')
    {
        return $query->orderBy('timestamp', $direction);
    }

    /**
     * Order by level priority.
     */
    public function scopeByLevel($query, string $direction = 'desc')
    {
        $priorities = [
            'debug' => 1,
            'info' => 2,
            'warn' => 3,
            'error' => 4,
            'fatal' => 5,
        ];

        return $query->orderByRaw(
            "CASE level " .
            "WHEN 'debug' THEN 1 " .
            "WHEN 'info' THEN 2 " .
            "WHEN 'warn' THEN 3 " .
            "WHEN 'error' THEN 4 " .
            "WHEN 'fatal' THEN 5 " .
            "ELSE 0 END " . $direction
        );
    }

    /**
     * Search logs.
     */
    public function scopeSearch($query, string $term)
    {
        return $query->where(function ($query) use ($term) {
            $query->where('message', 'LIKE', "%{$term}%")
                  ->orWhere('formatted_message', 'LIKE', "%{$term}%")
                  ->orWhere('error_type', 'LIKE', "%{$term}%")
                  ->orWhere('component', 'LIKE', "%{$term}%")
                  ->orWhere('service', 'LIKE', "%{$term}%");
        });
    }
}
