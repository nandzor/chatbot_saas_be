<?php

namespace App\Models;

use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RolePermission extends Model
{
    use HasFactory, HasUuid;

    protected $table = 'role_permissions';

    protected $fillable = [
        'role_id',
        'permission_id',
        'is_granted',
        'is_inherited',
        'conditions',
        'constraints',
        'granted_by',
        'granted_at',
        'metadata',
    ];

    protected $casts = [
        'is_granted' => 'boolean',
        'is_inherited' => 'boolean',
        'conditions' => 'array',
        'constraints' => 'array',
        'granted_at' => 'datetime',
        'metadata' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the role that owns this permission assignment.
     */
    public function role(): BelongsTo
    {
        return $this->belongsTo(Role::class);
    }

    /**
     * Get the permission assigned to the role.
     */
    public function permission(): BelongsTo
    {
        return $this->belongsTo(Permission::class);
    }

    /**
     * Get the user who granted this permission.
     */
    public function grantedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'granted_by');
    }

    /**
     * Check if permission is granted.
     */
    public function isGranted(): bool
    {
        return $this->is_granted;
    }

    /**
     * Check if permission is inherited from parent role.
     */
    public function isInherited(): bool
    {
        return $this->is_inherited;
    }

    /**
     * Check if permission is explicitly denied.
     */
    public function isDenied(): bool
    {
        return !$this->is_granted;
    }

    /**
     * Check if permission has specific condition.
     */
    public function hasCondition(string $condition): bool
    {
        $conditions = $this->conditions ?? [];
        return isset($conditions[$condition]);
    }

    /**
     * Get condition value.
     */
    public function getCondition(string $condition, $default = null)
    {
        $conditions = $this->conditions ?? [];
        return $conditions[$condition] ?? $default;
    }

    /**
     * Check if permission has specific constraint.
     */
    public function hasConstraint(string $constraint): bool
    {
        $constraints = $this->constraints ?? [];
        return isset($constraints[$constraint]);
    }

    /**
     * Get constraint value.
     */
    public function getConstraint(string $constraint, $default = null)
    {
        $constraints = $this->constraints ?? [];
        return $constraints[$constraint] ?? $default;
    }

    /**
     * Get permission status.
     */
    public function getStatusAttribute(): string
    {
        if ($this->is_granted) {
            return $this->is_inherited ? 'inherited' : 'granted';
        }

        return 'denied';
    }

    /**
     * Get permission status color.
     */
    public function getStatusColorAttribute(): string
    {
        return match ($this->status) {
            'granted' => 'green',
            'inherited' => 'blue',
            'denied' => 'red',
            default => 'gray',
        };
    }

    /**
     * Get permission display.
     */
    public function getPermissionDisplayAttribute(): string
    {
        return $this->permission->resource . '.' . $this->permission->action;
    }

    /**
     * Grant permission to role.
     */
    public function grant(User $grantedBy = null): void
    {
        $this->update([
            'is_granted' => true,
            'granted_by' => $grantedBy?->id,
            'granted_at' => now(),
        ]);
    }

    /**
     * Deny permission to role.
     */
    public function deny(User $grantedBy = null): void
    {
        $this->update([
            'is_granted' => false,
            'granted_by' => $grantedBy?->id,
            'granted_at' => now(),
        ]);
    }

    /**
     * Mark as inherited.
     */
    public function markAsInherited(): void
    {
        $this->update(['is_inherited' => true]);
    }

    /**
     * Mark as explicit (not inherited).
     */
    public function markAsExplicit(): void
    {
        $this->update(['is_inherited' => false]);
    }

    /**
     * Add condition to permission.
     */
    public function addCondition(string $key, $value): void
    {
        $conditions = $this->conditions ?? [];
        $conditions[$key] = $value;
        $this->update(['conditions' => $conditions]);
    }

    /**
     * Remove condition from permission.
     */
    public function removeCondition(string $key): void
    {
        $conditions = $this->conditions ?? [];
        unset($conditions[$key]);
        $this->update(['conditions' => $conditions]);
    }

    /**
     * Add constraint to permission.
     */
    public function addConstraint(string $key, $value): void
    {
        $constraints = $this->constraints ?? [];
        $constraints[$key] = $value;
        $this->update(['constraints' => $constraints]);
    }

    /**
     * Remove constraint from permission.
     */
    public function removeConstraint(string $key): void
    {
        $constraints = $this->constraints ?? [];
        unset($constraints[$key]);
        $this->update(['constraints' => $constraints]);
    }

    /**
     * Grant permission to role.
     */
    public static function grantPermission(
        Role $role,
        Permission $permission,
        bool $isInherited = false,
        array $conditions = [],
        array $constraints = [],
        User $grantedBy = null
    ): self {
        return static::updateOrCreate(
            [
                'role_id' => $role->id,
                'permission_id' => $permission->id,
            ],
            [
                'is_granted' => true,
                'is_inherited' => $isInherited,
                'conditions' => $conditions,
                'constraints' => $constraints,
                'granted_by' => $grantedBy?->id,
                'granted_at' => now(),
            ]
        );
    }

    /**
     * Deny permission to role.
     */
    public static function denyPermission(
        Role $role,
        Permission $permission,
        User $grantedBy = null
    ): self {
        return static::updateOrCreate(
            [
                'role_id' => $role->id,
                'permission_id' => $permission->id,
            ],
            [
                'is_granted' => false,
                'is_inherited' => false,
                'granted_by' => $grantedBy?->id,
                'granted_at' => now(),
            ]
        );
    }

    /**
     * Scope for granted permissions.
     */
    public function scopeGranted($query)
    {
        return $query->where('is_granted', true);
    }

    /**
     * Scope for denied permissions.
     */
    public function scopeDenied($query)
    {
        return $query->where('is_granted', false);
    }

    /**
     * Scope for inherited permissions.
     */
    public function scopeInherited($query)
    {
        return $query->where('is_inherited', true);
    }

    /**
     * Scope for explicit permissions.
     */
    public function scopeExplicit($query)
    {
        return $query->where('is_inherited', false);
    }

    /**
     * Scope for specific role.
     */
    public function scopeForRole($query, $roleId)
    {
        return $query->where('role_id', $roleId);
    }

    /**
     * Scope for specific permission.
     */
    public function scopeForPermission($query, $permissionId)
    {
        return $query->where('permission_id', $permissionId);
    }

    /**
     * Scope for permissions with conditions.
     */
    public function scopeWithConditions($query)
    {
        return $query->whereNotNull('conditions')
                    ->where('conditions', '!=', '[]');
    }

    /**
     * Scope for permissions with constraints.
     */
    public function scopeWithConstraints($query)
    {
        return $query->whereNotNull('constraints')
                    ->where('constraints', '!=', '[]');
    }

    /**
     * Order by granted date.
     */
    public function scopeByGrantedDate($query, string $direction = 'desc')
    {
        return $query->orderBy('granted_at', $direction);
    }
}
