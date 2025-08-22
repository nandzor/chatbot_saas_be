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

class PermissionGroup extends Model
{
    use HasFactory, HasUuid, BelongsToOrganization, HasStatus;

    protected $table = 'permission_groups';

    protected $fillable = [
        'organization_id',
        'name',
        'code',
        'display_name',
        'description',
        'category',
        'parent_group_id',
        'icon',
        'color',
        'sort_order',
        'status',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the parent permission group.
     */
    public function parentGroup(): BelongsTo
    {
        return $this->belongsTo(PermissionGroup::class, 'parent_group_id');
    }

    /**
     * Get the child permission groups.
     */
    public function childGroups(): HasMany
    {
        return $this->hasMany(PermissionGroup::class, 'parent_group_id');
    }

    /**
     * Get all descendant groups.
     */
    public function descendants()
    {
        return $this->childGroups()->with('descendants');
    }

    /**
     * Get the permissions in this group.
     */
    public function permissions(): BelongsToMany
    {
        return $this->belongsToMany(Permission::class, 'permission_group_permissions');
    }

    /**
     * Get the permission group permissions.
     */
    public function permissionGroupPermissions(): HasMany
    {
        return $this->hasMany(PermissionGroupPermission::class, 'group_id');
    }

    /**
     * Check if group has parent.
     */
    public function hasParent(): bool
    {
        return !is_null($this->parent_group_id);
    }

    /**
     * Check if group has children.
     */
    public function hasChildren(): bool
    {
        return $this->childGroups()->exists();
    }

    /**
     * Get group depth level.
     */
    public function getDepthAttribute(): int
    {
        $depth = 0;
        $parent = $this->parentGroup;

        while ($parent) {
            $depth++;
            $parent = $parent->parentGroup;
        }

        return $depth;
    }

    /**
     * Get group hierarchy path.
     */
    public function getHierarchyPathAttribute(): array
    {
        $path = [$this->name];
        $parent = $this->parentGroup;

        while ($parent) {
            array_unshift($path, $parent->name);
            $parent = $parent->parentGroup;
        }

        return $path;
    }

    /**
     * Get group hierarchy string.
     */
    public function getHierarchyStringAttribute(): string
    {
        return implode(' > ', $this->hierarchy_path);
    }

    /**
     * Get category display name.
     */
    public function getCategoryDisplayNameAttribute(): string
    {
        return match ($this->category) {
            'administration' => 'Administration',
            'content' => 'Content Management',
            'operations' => 'Operations',
            'insights' => 'Analytics & Insights',
            'security' => 'Security',
            'billing' => 'Billing & Finance',
            'api' => 'API Management',
            default => ucwords(str_replace('_', ' ', $this->category ?? 'General')),
        };
    }

    /**
     * Get permissions count.
     */
    public function getPermissionsCountAttribute(): int
    {
        return $this->permissions()->count();
    }

    /**
     * Get all permissions including from child groups.
     */
    public function getAllPermissions(): \Illuminate\Database\Eloquent\Collection
    {
        $permissions = $this->permissions;

        foreach ($this->childGroups as $childGroup) {
            $permissions = $permissions->merge($childGroup->getAllPermissions());
        }

        return $permissions->unique('id');
    }

    /**
     * Get all permissions count including child groups.
     */
    public function getAllPermissionsCountAttribute(): int
    {
        return $this->getAllPermissions()->count();
    }

    /**
     * Add permission to group.
     */
    public function addPermission(Permission $permission): void
    {
        if (!$this->permissions()->where('permission_id', $permission->id)->exists()) {
            $this->permissions()->attach($permission->id);
        }
    }

    /**
     * Remove permission from group.
     */
    public function removePermission(Permission $permission): void
    {
        $this->permissions()->detach($permission->id);
    }

    /**
     * Add multiple permissions to group.
     */
    public function addPermissions(array $permissionIds): void
    {
        $existingIds = $this->permissions()->pluck('permission_id')->toArray();
        $newIds = array_diff($permissionIds, $existingIds);

        if (!empty($newIds)) {
            $this->permissions()->attach($newIds);
        }
    }

    /**
     * Sync permissions with group.
     */
    public function syncPermissions(array $permissionIds): void
    {
        $this->permissions()->sync($permissionIds);
    }

    /**
     * Create a new permission group.
     */
    public static function createGroup(
        string $organizationId,
        string $name,
        string $code,
        string $category = 'general',
        array $options = []
    ): self {
        return static::create(array_merge([
            'organization_id' => $organizationId,
            'name' => $name,
            'code' => $code,
            'display_name' => $options['display_name'] ?? $name,
            'category' => $category,
            'sort_order' => $options['sort_order'] ?? 0,
        ], $options));
    }

    /**
     * Scope for root groups (no parent).
     */
    public function scopeRootGroups($query)
    {
        return $query->whereNull('parent_group_id');
    }

    /**
     * Scope for child groups.
     */
    public function scopeChildGroups($query)
    {
        return $query->whereNotNull('parent_group_id');
    }

    /**
     * Scope for specific category.
     */
    public function scopeForCategory($query, string $category)
    {
        return $query->where('category', $category);
    }

    /**
     * Scope for groups with permissions.
     */
    public function scopeWithPermissions($query)
    {
        return $query->has('permissions');
    }

    /**
     * Scope for groups without permissions.
     */
    public function scopeWithoutPermissions($query)
    {
        return $query->doesntHave('permissions');
    }

    /**
     * Order by sort order.
     */
    public function scopeBySortOrder($query)
    {
        return $query->orderBy('sort_order')->orderBy('name');
    }

    /**
     * Order by hierarchy.
     */
    public function scopeByHierarchy($query)
    {
        return $query->orderBy('parent_group_id')
                    ->orderBy('sort_order')
                    ->orderBy('name');
    }

    /**
     * Search groups.
     */
    public function scopeSearch($query, string $term)
    {
        return $query->where(function ($query) use ($term) {
            $query->where('name', 'LIKE', "%{$term}%")
                  ->orWhere('display_name', 'LIKE', "%{$term}%")
                  ->orWhere('description', 'LIKE', "%{$term}%")
                  ->orWhere('code', 'LIKE', "%{$term}%");
        });
    }
}
