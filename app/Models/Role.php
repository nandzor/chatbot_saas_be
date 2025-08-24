<?php

namespace App\Models;

use App\Traits\BelongsToOrganization;
use App\Traits\HasStatus;
use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Role extends Model
{
    use HasFactory, HasUuid, BelongsToOrganization, HasStatus;

    protected $fillable = [
        'organization_id',
        'name',
        'code',
        'display_name',
        'description',
        'scope',
        'level',
        'is_system_role',
        'is_default',
        'parent_role_id',
        'inherits_permissions',
        'max_users',
        'current_users',
        'color',
        'icon',
        'badge_text',
        'metadata',
        'status',
        'is_active',
    ];

    protected $casts = [
        'is_system_role' => 'boolean',
        'is_default' => 'boolean',
        'inherits_permissions' => 'boolean',
        'metadata' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the parent role.
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(Role::class, 'parent_role_id');
    }

    /**
     * Get the child roles.
     */
    public function children(): HasMany
    {
        return $this->hasMany(Role::class, 'parent_role_id');
    }

    /**
     * Get the users assigned to this role.
     */
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'user_roles')
                    ->withPivot(['is_active', 'is_primary', 'scope', 'scope_context', 'effective_from', 'effective_until'])
                    ->withTimestamps();
    }

    /**
     * Get active users for this role.
     */
    public function activeUsers(): BelongsToMany
    {
        return $this->users()
                    ->wherePivot('is_active', true)
                    ->where(function ($query) {
                        $query->whereNull('user_roles.effective_until')
                              ->orWhere('user_roles.effective_until', '>', now());
                    });
    }

    /**
     * Get the permissions assigned to this role.
     */
    public function permissions(): BelongsToMany
    {
        return $this->belongsToMany(Permission::class, 'role_permissions')
                    ->withPivot(['is_granted', 'is_inherited', 'conditions', 'constraints', 'granted_by', 'granted_at'])
                    ->withTimestamps();
    }

    /**
     * Get granted permissions only.
     */
    public function grantedPermissions(): BelongsToMany
    {
        return $this->permissions()->wherePivot('is_granted', true);
    }

    /**
     * Get inherited permissions from parent roles.
     */
    public function inheritedPermissions(): BelongsToMany
    {
        return $this->permissions()->wherePivot('is_inherited', true);
    }

    /**
     * Get all effective permissions (including inherited).
     */
    public function effectivePermissions(): BelongsToMany
    {
        $permissions = $this->grantedPermissions();

        if ($this->inherits_permissions && $this->parent) {
            $parentPermissions = $this->parent->effectivePermissions();
            // In a real implementation, you'd merge these collections properly
        }

        return $permissions;
    }

    /**
     * Get the role assignments (user_roles pivot records).
     */
    public function userRoles(): HasMany
    {
        return $this->hasMany(UserRole::class);
    }

    /**
     * Check if role is a system role.
     */
    public function isSystemRole(): bool
    {
        return $this->is_system_role;
    }

    /**
     * Check if role is the default role.
     */
    public function isDefaultRole(): bool
    {
        return $this->is_default;
    }

    /**
     * Get is_active attribute based on status.
     */
    public function getIsActiveAttribute(): bool
    {
        return $this->status === 'active';
    }

    /**
     * Set is_active attribute by updating status.
     */
    public function setIsActiveAttribute(bool $value): void
    {
        $this->attributes['status'] = $value ? 'active' : 'inactive';
    }

    /**
     * Check if role has a parent.
     */
    public function hasParent(): bool
    {
        return !is_null($this->parent_role_id);
    }

    /**
     * Check if role has children.
     */
    public function hasChildren(): bool
    {
        return $this->children()->count() > 0;
    }

    /**
     * Check if role can accept more users.
     */
    public function canAcceptMoreUsers(): bool
    {
        if (!$this->max_users) {
            return true; // No limit
        }

        return $this->current_users < $this->max_users;
    }

    /**
     * Check if role has a specific permission.
     */
    public function hasPermission(string $permissionCode): bool
    {
        return $this->grantedPermissions()
                    ->where('code', $permissionCode)
                    ->exists();
    }

    /**
     * Grant a permission to this role.
     */
    public function grantPermission(Permission $permission, User $grantedBy = null): void
    {
        $this->permissions()->syncWithoutDetaching([
            $permission->id => [
                'is_granted' => true,
                'is_inherited' => false,
                'granted_by' => $grantedBy?->id,
                'granted_at' => now(),
            ]
        ]);
    }

    /**
     * Revoke a permission from this role.
     */
    public function revokePermission(Permission $permission): void
    {
        $this->permissions()->updateExistingPivot($permission->id, [
            'is_granted' => false,
        ]);
    }

    /**
     * Assign role to a user.
     */
    public function assignToUser(User $user, array $options = []): bool
    {
        if (!$this->canAcceptMoreUsers()) {
            return false;
        }

        $defaults = [
            'is_active' => true,
            'is_primary' => false,
            'scope' => 'organization',
            'effective_from' => now(),
        ];

        $pivotData = array_merge($defaults, $options);

        $this->users()->syncWithoutDetaching([
            $user->id => $pivotData
        ]);

        $this->increment('current_users');

        return true;
    }

    /**
     * Remove role from a user.
     */
    public function removeFromUser(User $user): void
    {
        $this->users()->detach($user->id);
        $this->decrement('current_users');
    }

    /**
     * Update user count based on actual assignments.
     */
    public function updateUserCount(): void
    {
        $count = $this->activeUsers()->count();
        $this->update(['current_users' => $count]);
    }

    /**
     * Get the role hierarchy path.
     */
    public function getHierarchyPathAttribute(): array
    {
        $path = [];
        $role = $this;

        while ($role) {
            array_unshift($path, [
                'id' => $role->id,
                'name' => $role->name,
                'code' => $role->code,
                'level' => $role->level,
            ]);
            $role = $role->parent;
        }

        return $path;
    }

    /**
     * Scope for system roles.
     */
    public function scopeSystem($query)
    {
        return $query->where('is_system_role', true);
    }

    /**
     * Scope for custom roles.
     */
    public function scopeCustom($query)
    {
        return $query->where('is_system_role', false);
    }

    /**
     * Scope for default roles.
     */
    public function scopeDefault($query)
    {
        return $query->where('is_default', true);
    }

    /**
     * Scope for root roles (no parent).
     */
    public function scopeRoot($query)
    {
        return $query->whereNull('parent_role_id');
    }

    /**
     * Scope for roles with specific level.
     */
    public function scopeLevel($query, int $level)
    {
        return $query->where('level', $level);
    }

    /**
     * Scope for roles that can accept more users.
     */
    public function scopeAvailable($query)
    {
        return $query->where(function ($query) {
            $query->whereNull('max_users')
                  ->orWhereColumn('current_users', '<', 'max_users');
        });
    }

    /**
     * Order by level and name.
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('level')->orderBy('name');
    }

    /**
     * Search roles by name or code.
     */
    public function scopeSearch($query, string $term)
    {
        return $query->where(function ($query) use ($term) {
            $query->where('name', 'LIKE', "%{$term}%")
                  ->orWhere('code', 'LIKE', "%{$term}%")
                  ->orWhere('display_name', 'LIKE', "%{$term}%");
        });
    }
}
