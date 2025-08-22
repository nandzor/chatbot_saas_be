<?php

namespace App\Models;

use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Request;

class AuditLog extends Model
{
    use HasFactory, HasUuid;

    protected $table = 'audit_logs';

    protected $fillable = [
        'organization_id',
        'user_id',
        'action',
        'resource_type',
        'resource_id',
        'resource_name',
        'old_values',
        'new_values',
        'changes',
        'ip_address',
        'user_agent',
        'api_key_id',
        'session_id',
        'description',
        'severity',
    ];

    protected $casts = [
        'old_values' => 'array',
        'new_values' => 'array',
        'changes' => 'array',
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
     * Get the organization this audit log belongs to.
     */
    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    /**
     * Get the user who performed the action.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the API key used for the action.
     */
    public function apiKey(): BelongsTo
    {
        return $this->belongsTo(ApiKey::class, 'api_key_id');
    }

    /**
     * Check if action was performed via API.
     */
    public function isApiAction(): bool
    {
        return !is_null($this->api_key_id);
    }

    /**
     * Check if action was performed by a user.
     */
    public function isUserAction(): bool
    {
        return !is_null($this->user_id);
    }

    /**
     * Check if action has recorded changes.
     */
    public function hasRecordedChanges(): bool
    {
        return !empty($this->changes);
    }

    /**
     * Get the actor (user or API key).
     */
    public function getActorAttribute(): string
    {
        if ($this->user) {
            return $this->user->full_name . ' (' . $this->user->email . ')';
        }

        if ($this->apiKey) {
            return 'API Key: ' . $this->apiKey->name;
        }

        return 'System';
    }

    /**
     * Get action description with context.
     */
    public function getActionDescriptionAttribute(): string
    {
        $base = ucfirst($this->action) . ' ' . $this->resource_type;

        if ($this->resource_name) {
            $base .= ': ' . $this->resource_name;
        }

        return $base;
    }

    /**
     * Get human-readable changes.
     */
    public function getChangesDescriptionAttribute(): string
    {
        if (empty($this->changes)) {
            return 'No changes recorded';
        }

        $descriptions = [];
        foreach ($this->changes as $field => $change) {
            if (is_array($change) && isset($change['old'], $change['new'])) {
                $descriptions[] = "{$field}: {$change['old']} → {$change['new']}";
            } else {
                $descriptions[] = "{$field}: {$change}";
            }
        }

        return implode(', ', $descriptions);
    }

    /**
     * Get severity level color.
     */
    public function getSeverityColorAttribute(): string
    {
        return match ($this->severity) {
            'critical' => 'red',
            'high' => 'orange',
            'medium' => 'yellow',
            'low' => 'blue',
            default => 'gray',
        };
    }

    /**
     * Log an action.
     */
    public static function logAction(
        string $action,
        string $resourceType,
        string $resourceId = null,
        string $resourceName = null,
        array $oldValues = [],
        array $newValues = [],
        string $description = null,
        string $severity = 'info',
        string $organizationId = null,
        string $userId = null,
        string $apiKeyId = null
    ): self {
        $changes = [];

        // Calculate changes
        if (!empty($oldValues) && !empty($newValues)) {
            foreach ($newValues as $key => $newValue) {
                $oldValue = $oldValues[$key] ?? null;
                if ($oldValue !== $newValue) {
                    $changes[$key] = [
                        'old' => $oldValue,
                        'new' => $newValue,
                    ];
                }
            }
        }

        return static::create([
            'organization_id' => $organizationId ?: (Auth::user()?->organization_id ?? null),
            'user_id' => $userId ?: (Auth::id() ?? null),
            'api_key_id' => $apiKeyId,
            'action' => $action,
            'resource_type' => $resourceType,
            'resource_id' => $resourceId,
            'resource_name' => $resourceName,
            'old_values' => $oldValues,
            'new_values' => $newValues,
            'changes' => $changes,
            'ip_address' => Request::ip(),
            'user_agent' => Request::userAgent(),
            'session_id' => session()->getId() ?? Request::session()?->getId(),
            'description' => $description,
            'severity' => $severity,
        ]);
    }

    /**
     * Log create action.
     */
    public static function logCreate(Model $model, array $attributes = []): self
    {
        return static::logAction(
            'create',
            class_basename($model),
            $model->getKey(),
            $model->name ?? $model->title ?? $model->id,
            [],
            $attributes ?: $model->getAttributes(),
            "Created {$model->getTable()} record"
        );
    }

    /**
     * Log update action.
     */
    public static function logUpdate(Model $model, array $oldValues, array $newValues = []): self
    {
        $newValues = $newValues ?: $model->getAttributes();

        return static::logAction(
            'update',
            class_basename($model),
            $model->getKey(),
            $model->name ?? $model->title ?? $model->id,
            $oldValues,
            $newValues,
            "Updated {$model->getTable()} record"
        );
    }

    /**
     * Log delete action.
     */
    public static function logDelete(Model $model): self
    {
        return static::logAction(
            'delete',
            class_basename($model),
            $model->getKey(),
            $model->name ?? $model->title ?? $model->id,
            $model->getAttributes(),
            [],
            "Deleted {$model->getTable()} record",
            'medium'
        );
    }

    /**
     * Log login action.
     */
    public static function logLogin(User $user, bool $successful = true): self
    {
        return static::logAction(
            'login',
            'User',
            $user->id,
            $user->full_name,
            [],
            ['successful' => $successful],
            $successful ? 'User logged in successfully' : 'Failed login attempt',
            $successful ? 'info' : 'medium',
            $user->organization_id,
            $user->id
        );
    }

    /**
     * Log logout action.
     */
    public static function logLogout(User $user): self
    {
        return static::logAction(
            'logout',
            'User',
            $user->id,
            $user->full_name,
            [],
            [],
            'User logged out',
            'info',
            $user->organization_id,
            $user->id
        );
    }

    /**
     * Scope for specific action.
     */
    public function scopeAction($query, string $action)
    {
        return $query->where('action', $action);
    }

    /**
     * Scope for specific resource type.
     */
    public function scopeResourceType($query, string $resourceType)
    {
        return $query->where('resource_type', $resourceType);
    }

    /**
     * Scope for specific user.
     */
    public function scopeByUser($query, string $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Scope for API actions.
     */
    public function scopeApiActions($query)
    {
        return $query->whereNotNull('api_key_id');
    }

    /**
     * Scope for user actions.
     */
    public function scopeUserActions($query)
    {
        return $query->whereNotNull('user_id');
    }

    /**
     * Scope for specific severity.
     */
    public function scopeSeverity($query, string $severity)
    {
        return $query->where('severity', $severity);
    }

    /**
     * Scope for high severity actions.
     */
    public function scopeHighSeverity($query)
    {
        return $query->whereIn('severity', ['critical', 'high']);
    }

    /**
     * Scope for date range.
     */
    public function scopeDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('created_at', [$startDate, $endDate]);
    }

    /**
     * Scope for today's actions.
     */
    public function scopeToday($query)
    {
        return $query->whereDate('created_at', now());
    }

    /**
     * Scope for actions with changes.
     */
    public function scopeWithChanges($query)
    {
        return $query->whereNotNull('changes')
                    ->where('changes', '!=', '[]');
    }

    /**
     * Order by creation time.
     */
    public function scopeByTime($query, string $direction = 'desc')
    {
        return $query->orderBy('created_at', $direction);
    }

    /**
     * Search in description and resource name.
     */
    public function scopeSearch($query, string $term)
    {
        return $query->where(function ($query) use ($term) {
            $query->where('description', 'LIKE', "%{$term}%")
                  ->orWhere('resource_name', 'LIKE', "%{$term}%")
                  ->orWhere('action', 'LIKE', "%{$term}%")
                  ->orWhere('resource_type', 'LIKE', "%{$term}%");
        });
    }
}
