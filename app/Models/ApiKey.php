<?php

namespace App\Models;

use App\Traits\BelongsToOrganization;
use App\Traits\HasStatus;
use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ApiKey extends Model
{
    use HasFactory, HasUuid, BelongsToOrganization, HasStatus;

    protected $fillable = [
        'organization_id',
        'name',
        'key_hash',
        'key_prefix',
        'scopes',
        'permissions',
        'rate_limit_per_minute',
        'rate_limit_per_hour',
        'rate_limit_per_day',
        'last_used_at',
        'total_requests',
        'expires_at',
        'allowed_ips',
        'user_agent_restrictions',
        'status',
        'created_by',
    ];

    protected $casts = [
        'scopes' => 'array',
        'permissions' => 'array',
        'last_used_at' => 'datetime',
        'expires_at' => 'datetime',
        'allowed_ips' => 'array',
        'user_agent_restrictions' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    protected $hidden = [
        'key_hash',
    ];

    /**
     * Get the user who created this API key.
     */
    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the rate limit records for this API key.
     */
    public function rateLimits(): HasMany
    {
        return $this->hasMany(ApiRateLimit::class);
    }

    /**
     * Check if the API key is expired.
     */
    public function isExpired(): bool
    {
        return $this->expires_at && $this->expires_at->isPast();
    }

    /**
     * Check if the API key is valid.
     */
    public function isValid(): bool
    {
        return $this->isActive() && !$this->isExpired();
    }

    /**
     * Check if the API key has a specific scope.
     */
    public function hasScope(string $scope): bool
    {
        return in_array($scope, $this->scopes ?? []);
    }

    /**
     * Check if the API key has a specific permission.
     */
    public function hasPermission(string $permission): bool
    {
        return isset($this->permissions[$permission]) && $this->permissions[$permission];
    }

    /**
     * Check if IP address is allowed.
     */
    public function isIpAllowed(string $ipAddress): bool
    {
        if (empty($this->allowed_ips)) {
            return true; // No restrictions
        }

        return in_array($ipAddress, $this->allowed_ips);
    }

    /**
     * Check if user agent is allowed.
     */
    public function isUserAgentAllowed(string $userAgent): bool
    {
        if (empty($this->user_agent_restrictions)) {
            return true; // No restrictions
        }

        foreach ($this->user_agent_restrictions as $pattern) {
            if (fnmatch($pattern, $userAgent)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Record API key usage.
     */
    public function recordUsage(): void
    {
        $this->increment('total_requests');
        $this->update(['last_used_at' => now()]);
    }

    /**
     * Get the display key (prefix + masked).
     */
    public function getDisplayKeyAttribute(): string
    {
        return $this->key_prefix . str_repeat('*', 20);
    }

    /**
     * Scope for expired API keys.
     */
    public function scopeExpired($query)
    {
        return $query->whereNotNull('expires_at')
                    ->where('expires_at', '<', now());
    }

    /**
     * Scope for valid API keys.
     */
    public function scopeValid($query)
    {
        return $query->where('status', 'active')
                    ->where(function ($query) {
                        $query->whereNull('expires_at')
                              ->orWhere('expires_at', '>', now());
                    });
    }

    /**
     * Scope for API keys with specific scope.
     */
    public function scopeWithScope($query, string $scope)
    {
        return $query->whereJsonContains('scopes', $scope);
    }
}
