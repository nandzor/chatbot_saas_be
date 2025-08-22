<?php

namespace App\Models;

use App\Traits\BelongsToOrganization;
use App\Traits\HasStatus;
use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens;
    use HasFactory;
    use Notifiable;
    use HasUuid;
    use BelongsToOrganization;
    use HasStatus;
    use SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'organization_id',
        'email',
        'username',
        'password_hash',
        'full_name',
        'first_name',
        'last_name',
        'phone',
        'avatar_url',
        'role',
        'is_email_verified',
        'is_phone_verified',
        'two_factor_enabled',
        'two_factor_secret',
        'backup_codes',
        'last_login_at',
        'last_login_ip',
        'login_count',
        'failed_login_attempts',
        'locked_until',
        'password_changed_at',
        'active_sessions',
        'max_concurrent_sessions',
        'ui_preferences',
        'dashboard_config',
        'notification_preferences',
        'bio',
        'location',
        'department',
        'job_title',
        'skills',
        'languages',
        'api_access_enabled',
        'api_rate_limit',
        'permissions',
        'status',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password_hash',
        'remember_token',
        'two_factor_secret',
        'backup_codes',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_email_verified' => 'boolean',
            'is_phone_verified' => 'boolean',
            'two_factor_enabled' => 'boolean',
            'backup_codes' => 'array',
            'last_login_at' => 'datetime',
            'last_login_ip' => 'string',
            'locked_until' => 'datetime',
            'password_changed_at' => 'datetime',
            'active_sessions' => 'array',
            'ui_preferences' => 'array',
            'dashboard_config' => 'array',
            'notification_preferences' => 'array',
            'skills' => 'array',
            'languages' => 'array',
            'api_access_enabled' => 'boolean',
            'permissions' => 'array',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
            'deleted_at' => 'datetime',
        ];
    }

    /**
     * Get the agent profile for this user (if user is an agent).
     */
    public function agent(): HasOne
    {
        return $this->hasOne(Agent::class);
    }

    /**
     * Get the user sessions for this user.
     */
    public function userSessions(): HasMany
    {
        return $this->hasMany(UserSession::class);
    }

    /**
     * Get the API keys created by this user.
     */
    public function createdApiKeys(): HasMany
    {
        return $this->hasMany(ApiKey::class, 'created_by');
    }

    /**
     * Get the audit logs for this user.
     */
    public function auditLogs(): HasMany
    {
        return $this->hasMany(AuditLog::class);
    }

    /**
     * Get the roles assigned to this user.
     */
    public function userRoles(): HasMany
    {
        return $this->hasMany(UserRole::class);
    }

    /**
     * Get the roles through user_roles pivot.
     */
    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class, 'user_roles')
                    ->withPivot(['is_active', 'is_primary', 'scope', 'scope_context', 'effective_from', 'effective_until'])
                    ->withTimestamps();
    }

    /**
     * Get active roles for this user.
     */
    public function activeRoles(): BelongsToMany
    {
        return $this->roles()
                    ->wherePivot('is_active', true)
                    ->where(function ($query) {
                        $query->whereNull('user_roles.effective_until')
                              ->orWhere('user_roles.effective_until', '>', now());
                    });
    }

    /**
     * Get the primary role for this user.
     */
    public function primaryRole(): BelongsTo
    {
        return $this->belongsTo(Role::class, 'role_id');
    }

    /**
     * Get the route key for the model.
     */
    public function getRouteKeyName(): string
    {
        return 'id';
    }

    /**
     * Scope a query to only include verified users.
     */
    public function scopeVerified($query)
    {
        return $query->where('is_email_verified', true);
    }

    /**
     * Scope for users with specific role.
     */
    public function scopeWithRole($query, string $role)
    {
        return $query->where('role', $role);
    }

    /**
     * Scope for agents.
     */
    public function scopeAgents($query)
    {
        return $query->where('role', 'agent');
    }

    /**
     * Scope for admin users.
     */
    public function scopeAdmins($query)
    {
        return $query->whereIn('role', ['super_admin', 'org_admin']);
    }

    /**
     * Scope for users with API access.
     */
    public function scopeWithApiAccess($query)
    {
        return $query->where('api_access_enabled', true);
    }

    /**
     * Scope for users with 2FA enabled.
     */
    public function scopeWith2FA($query)
    {
        return $query->where('two_factor_enabled', true);
    }

    /**
     * Scope for locked users.
     */
    public function scopeLocked($query)
    {
        return $query->whereNotNull('locked_until')
                    ->where('locked_until', '>', now());
    }

    /**
     * Get the user's full name.
     */
    public function getFullNameAttribute(): string
    {
        return $this->full_name ?: trim($this->first_name . ' ' . $this->last_name);
    }

    /**
     * Get the user's initials.
     */
    public function getInitialsAttribute(): string
    {
        $name = $this->full_name ?: trim($this->first_name . ' ' . $this->last_name);
        $words = explode(' ', $name);
        $initials = '';

        foreach ($words as $word) {
            $initials .= strtoupper(substr($word, 0, 1));
        }

        return $initials;
    }

    /**
     * Check if user has verified email.
     */
    public function hasVerifiedEmail(): bool
    {
        return $this->is_email_verified;
    }

    /**
     * Check if user has verified phone.
     */
    public function hasVerifiedPhone(): bool
    {
        return $this->is_phone_verified;
    }

    /**
     * Check if user has 2FA enabled.
     */
    public function hasTwoFactorEnabled(): bool
    {
        return $this->two_factor_enabled;
    }

    /**
     * Check if user is locked.
     */
    public function isLocked(): bool
    {
        return $this->locked_until && $this->locked_until->isFuture();
    }

    /**
     * Check if user is an agent.
     */
    public function isAgent(): bool
    {
        return $this->role === 'agent';
    }

    /**
     * Check if user is an admin.
     */
    public function isAdmin(): bool
    {
        return in_array($this->role, ['super_admin', 'org_admin']);
    }

    /**
     * Check if user has API access.
     */
    public function hasApiAccess(): bool
    {
        return $this->api_access_enabled;
    }

    /**
     * Check if user has a specific permission.
     */
    public function hasPermission(string $permission): bool
    {
        // Check direct permissions
        if (isset($this->permissions[$permission]) && $this->permissions[$permission]) {
            return true;
        }

        // Check role permissions
        return $this->activeRoles()
                    ->whereHas('permissions', function ($query) use ($permission) {
                        $query->where('code', $permission)
                              ->where('is_granted', true);
                    })
                    ->exists();
    }

    /**
     * Check if user can access organization feature.
     */
    public function canAccessFeature(string $feature): bool
    {
        return $this->organization?->hasFeature($feature) ?? false;
    }

    /**
     * Get user preference.
     */
    public function getPreference(string $key, $default = null)
    {
        return data_get($this->ui_preferences, $key, $default);
    }

    /**
     * Set user preference.
     */
    public function setPreference(string $key, $value): void
    {
        $preferences = $this->ui_preferences ?? [];
        data_set($preferences, $key, $value);
        $this->ui_preferences = $preferences;
        $this->save();
    }

    /**
     * Get dashboard configuration.
     */
    public function getDashboardConfig(string $key = null, $default = null)
    {
        if ($key) {
            return data_get($this->dashboard_config, $key, $default);
        }

        return $this->dashboard_config ?? [];
    }

    /**
     * Set dashboard configuration.
     */
    public function setDashboardConfig(string $key, $value): void
    {
        $config = $this->dashboard_config ?? [];
        data_set($config, $key, $value);
        $this->dashboard_config = $config;
        $this->save();
    }

    /**
     * Record user login.
     */
    public function recordLogin(string $ipAddress = null): void
    {
        $this->increment('login_count');
        $this->update([
            'last_login_at' => now(),
            'last_login_ip' => $ipAddress,
            'failed_login_attempts' => 0,
        ]);
    }

    /**
     * Record failed login attempt.
     */
    public function recordFailedLogin(): void
    {
        $this->increment('failed_login_attempts');

        // Lock user after 5 failed attempts for 15 minutes
        if ($this->failed_login_attempts >= 5) {
            $this->update([
                'locked_until' => now()->addMinutes(15),
            ]);
        }
    }

    /**
     * Unlock user account.
     */
    public function unlock(): void
    {
        $this->update([
            'locked_until' => null,
            'failed_login_attempts' => 0,
        ]);
    }

    /**
     * Get password attribute (compatibility).
     */
    public function getPasswordAttribute(): string
    {
        return $this->password_hash;
    }

    /**
     * Set password attribute (compatibility).
     */
    public function setPasswordAttribute(string $value): void
    {
        $this->attributes['password_hash'] = $value;
    }
}
