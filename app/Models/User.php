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
use Illuminate\Support\Facades\Log;
use Laravel\Sanctum\HasApiTokens;
use Tymon\JWTAuth\Contracts\JWTSubject;

class User extends Authenticatable implements JWTSubject
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
     * Get the user sessions for this user (alias for userSessions).
     */
    public function sessions(): HasMany
    {
        return $this->userSessions();
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
     * Scope a query to only include active users (overrides HasStatus trait).
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active')
                    ->where('is_email_verified', true)
                    ->whereNull('deleted_at')
                    ->where(function ($q) {
                        $q->whereNull('locked_until')
                          ->orWhere('locked_until', '<=', now());
                    });
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
        return $this->attributes['full_name'] ?: trim(($this->first_name ?? '') . ' ' . ($this->last_name ?? ''));
    }

    /**
     * Get the user's initials.
     */
    public function getInitialsAttribute(): string
    {
        $name = $this->attributes['full_name'] ?: trim(($this->first_name ?? '') . ' ' . ($this->last_name ?? ''));
        $words = explode(' ', trim($name));
        $initials = '';

        foreach ($words as $word) {
            if (!empty($word)) {
                $initials .= strtoupper(substr($word, 0, 1));
            }
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
     * Check if user can access organization feature.
     */
    public function canAccessFeature(string $feature): bool
    {
        return $this->organization?->hasFeature($feature) ?? false;
    }

    /**
     * Get user preference.
     */
    public function getPreference(string $key, mixed $default = null)
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
    public function getDashboardConfig(?string $key = null, mixed $default = null)
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
    public function recordLogin(?string $ipAddress = null): void
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
        try {
            $this->increment('failed_login_attempts');

            $maxAttempts = $this->getValidNumericConfig('auth.max_login_attempts', 5);
            $lockoutDuration = $this->getValidNumericConfig('auth.lockout_duration', 30);

            // Lock user after max failed attempts
            if ($this->failed_login_attempts >= $maxAttempts) {
                $lockoutTime = now()->addMinutes($lockoutDuration);

                $this->update([
                    'locked_until' => $lockoutTime,
                ]);

                Log::warning('User account locked due to failed login attempts', [
                    'user_id' => $this->id,
                    'email' => $this->email,
                    'failed_attempts' => $this->failed_login_attempts,
                    'locked_until' => $lockoutTime->toISOString()
                ]);
            }
        } catch (\Exception $e) {
            Log::error('Error recording failed login attempt: ' . $e->getMessage(), [
                'user_id' => $this->id,
                'email' => $this->email,
                'failed_attempts' => $this->failed_login_attempts
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

    /**
     * Get the identifier that will be stored in the subject claim of the JWT.
     */
    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    /**
     * Return a key value array, containing any custom claims to be added to the JWT.
     */
    public function getJWTCustomClaims(): array
    {
        return [
            'user_id' => $this->id,
            'email' => $this->email,
            'organization_id' => $this->organization_id,
            'role' => $this->role,
            'status' => $this->status,
            'email_verified' => $this->is_email_verified,
            'two_factor_enabled' => $this->two_factor_enabled,
            'iat' => now()->timestamp,
            'iss' => config('app.name'),
            'aud' => config('app.url'),
        ];
    }

    /**
     * Get all permissions for user through roles.
     */
    public function getAllPermissions()
    {
        if (!$this->relationLoaded('roles')) {
            $this->load('roles.permissions');
        }

        return $this->roles->flatMap(function ($role) {
            return $role->permissions;
        })->unique('id');
    }

    /**
     * Check if user has specific permission (using codes).
     */
    public function hasPermission(string $permissionCode): bool
    {
        // Super admin has all permissions
        if ($this->role === 'super_admin') {
            return true;
        }

        // Check direct permissions (stored as codes in permissions field)
        $directPermissions = $this->permissions ?? [];
        if (in_array($permissionCode, $directPermissions)) {
            return true;
        }

        // Check permissions from roles
        return $this->getAllPermissions()
                   ->contains('code', $permissionCode);
    }

    /**
     * Check if user has any of the given permissions.
     */
    public function hasAnyPermission(array $permissions): bool
    {
        $userPermissions = $this->getAllPermissions()->pluck('code')->toArray();

        return !empty(array_intersect($permissions, $userPermissions));
    }

    /**
     * Check if user has all of the given permissions.
     */
    public function hasAllPermissions(array $permissions): bool
    {
        $userPermissions = $this->getAllPermissions()->pluck('code')->toArray();

        return empty(array_diff($permissions, $userPermissions));
    }

    /**
     * Check if user has specific role.
     */
    public function hasRole(string $role): bool
    {
        if (!$this->relationLoaded('roles')) {
            $this->load('roles');
        }

        return $this->roles->contains('code', $role);
    }

    /**
     * Check if user has any of the given roles.
     */
    public function hasAnyRole(array $roles): bool
    {
        if (!$this->relationLoaded('roles')) {
            $this->load('roles');
        }

        $userRoles = $this->roles->pluck('code')->toArray();

        return !empty(array_intersect($roles, $userRoles));
    }

    /**
     * Get user's primary role.
     */
    public function getPrimaryRole()
    {
        if (!$this->relationLoaded('roles')) {
            $this->load('roles');
        }

        return $this->roles->where('pivot.is_primary', true)->first();
    }

    /**
     * Check if user is organization admin.
     */
    public function isOrgAdmin(): bool
    {
        return in_array($this->role, ['super_admin', 'org_admin']);
    }

    /**
     * Check if user is super admin.
     */
    public function isSuperAdmin(): bool
    {
        return $this->role === 'super_admin';
    }



    /**
     * Check if user needs password change.
     */
    public function needsPasswordChange(): bool
    {
        try {
            $passwordChangedAt = $this->getCarbonAttribute('password_changed_at');
            if (!$passwordChangedAt) {
                return false;
            }

            $maxAge = $this->getValidNumericConfig('auth.password_max_age', 90);

            // Create a copy of the Carbon instance to avoid modifying the original
            $expiryDate = $passwordChangedAt->copy()->addDays($maxAge);
            return $expiryDate->isPast();
        } catch (\Exception $e) {
            Log::warning('Error checking password change: ' . $e->getMessage(), [
                'user_id' => $this->id,
                'email' => $this->email,
                'max_age' => $maxAge ?? 'undefined'
            ]);
            return false;
        }
    }

    /**
     * Check if user account is active (overrides HasStatus trait).
     */
    public function isActive(): bool
    {
        try {
            $lockedUntil = $this->getCarbonAttribute('locked_until');

            return $this->status === 'active' &&
                   $this->is_email_verified &&
                   is_null($this->deleted_at) &&
                   (is_null($lockedUntil) || $lockedUntil <= now());
        } catch (\Exception $e) {
            Log::warning('Error checking user active status: ' . $e->getMessage(), [
                'user_id' => $this->id,
                'email' => $this->email
            ]);
            return false;
        }
    }

    /**
     * Check if user is locked.
     */
    public function isLocked(): bool
    {
        try {
            $lockedUntil = $this->getCarbonAttribute('locked_until');

            return !is_null($lockedUntil) && $lockedUntil > now();
        } catch (\Exception $e) {
            Log::warning('Error checking user locked status: ' . $e->getMessage(), [
                'user_id' => $this->id,
                'email' => $this->email
            ]);
            return false;
        }
    }

        /**
     * Safe Carbon attribute accessor with validation.
     */
    protected function getCarbonAttribute(string $attribute): ?\Carbon\Carbon
    {
        try {
            $value = $this->getAttribute($attribute);

            if (is_null($value)) {
                return null;
            }

            if ($value instanceof \Carbon\Carbon) {
                return $value;
            }

            if (is_string($value) && !empty(trim($value))) {
                return \Carbon\Carbon::parse($value);
            }

            if ($value instanceof \DateTime) {
                return \Carbon\Carbon::instance($value);
            }

            Log::warning("Unexpected type for {$attribute}: " . gettype($value), [
                'user_id' => $this->id ?? 'unknown',
                'attribute' => $attribute,
                'type' => gettype($value),
                'value' => is_scalar($value) ? $value : 'non-scalar'
            ]);

            return null;
        } catch (\Exception $e) {
            Log::warning("Error parsing Carbon attribute {$attribute}: " . $e->getMessage(), [
                'user_id' => $this->id ?? 'unknown',
                'attribute' => $attribute,
                'error' => $e->getMessage()
            ]);
            return null;
        }
    }

    /**
     * Get validated numeric config value.
     */
    protected function getValidNumericConfig(string $key, int $default): int
    {
        try {
            $value = config($key, $default);

            // Ensure it's numeric and convert to integer
            if (is_numeric($value)) {
                $intValue = (int) $value;
                // Ensure positive value for time-related configs
                return max(1, $intValue);
            }

            Log::warning("Invalid numeric config value for {$key}, using default", [
                'key' => $key,
                'value' => $value,
                'type' => gettype($value),
                'default' => $default
            ]);

            return $default;
        } catch (\Exception $e) {
            Log::error("Error getting config {$key}: " . $e->getMessage(), [
                'key' => $key,
                'default' => $default
            ]);
            return $default;
        }
    }

    /**
     * Check if user can access API.
     */
    public function canAccessApi(): bool
    {
        return $this->api_access_enabled && $this->isActive();
    }

    /**
     * Get user's active sessions.
     */
    public function getActiveSessionsAttribute()
    {
        return $this->userSessions()
                   ->where('is_active', true)
                   ->where('expires_at', '>', now())
                   ->get();
    }

    /**
     * Invalidate all user sessions.
     */
    public function invalidateAllSessions(): void
    {
        $this->userSessions()->update(['is_active' => false]);
        $this->tokens()->delete();
    }


}
