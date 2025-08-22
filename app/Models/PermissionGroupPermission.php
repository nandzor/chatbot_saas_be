<?php

namespace App\Models;

use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PermissionGroupPermission extends Model
{
    use HasFactory, HasUuid;

    protected $table = 'permission_group_permissions';

    protected $fillable = [
        'group_id',
        'permission_id',
    ];

    protected $casts = [
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
     * Get the permission group.
     */
    public function group(): BelongsTo
    {
        return $this->belongsTo(PermissionGroup::class, 'group_id');
    }

    /**
     * Get the permission.
     */
    public function permission(): BelongsTo
    {
        return $this->belongsTo(Permission::class);
    }

    /**
     * Get the organization through the group.
     */
    public function getOrganizationAttribute()
    {
        return $this->group?->organization;
    }

    /**
     * Get permission display.
     */
    public function getPermissionDisplayAttribute(): string
    {
        return $this->permission->resource . '.' . $this->permission->action;
    }

    /**
     * Get group display.
     */
    public function getGroupDisplayAttribute(): string
    {
        return $this->group->display_name ?? $this->group->name;
    }

    /**
     * Create a new permission group assignment.
     */
    public static function assignPermission(PermissionGroup $group, Permission $permission): self
    {
        return static::firstOrCreate([
            'group_id' => $group->id,
            'permission_id' => $permission->id,
        ]);
    }

    /**
     * Remove permission from group.
     */
    public static function removePermission(PermissionGroup $group, Permission $permission): bool
    {
        return static::where('group_id', $group->id)
                    ->where('permission_id', $permission->id)
                    ->delete();
    }

    /**
     * Scope for specific group.
     */
    public function scopeForGroup($query, $groupId)
    {
        return $query->where('group_id', $groupId);
    }

    /**
     * Scope for specific permission.
     */
    public function scopeForPermission($query, $permissionId)
    {
        return $query->where('permission_id', $permissionId);
    }

    /**
     * Scope for specific organization through group.
     */
    public function scopeForOrganization($query, $organizationId)
    {
        return $query->whereHas('group', function ($query) use ($organizationId) {
            $query->where('organization_id', $organizationId);
        });
    }

    /**
     * Order by creation date.
     */
    public function scopeByCreatedDate($query, string $direction = 'desc')
    {
        return $query->orderBy('created_at', $direction);
    }
}
