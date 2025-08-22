<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RoleResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'code' => $this->code,
            'display_name' => $this->display_name,
            'description' => $this->description,
            
            // Role Configuration
            'scope' => $this->scope,
            'level' => $this->level,
            'is_system_role' => $this->is_system_role,
            'is_default' => $this->is_default,
            
            // Inheritance
            'parent_role_id' => $this->parent_role_id,
            'inherits_permissions' => $this->inherits_permissions,
            
            // Access Control
            'max_users' => $this->max_users,
            'current_users' => $this->current_users,
            
            // UI/UX
            'color' => $this->color,
            'icon' => $this->icon,
            'badge_text' => $this->badge_text,
            
            // Organization
            'organization' => $this->whenLoaded('organization', function () {
                return [
                    'id' => $this->organization->id,
                    'name' => $this->organization->name,
                    'slug' => $this->organization->slug,
                    'status' => $this->organization->status,
                ];
            }),
            
            // Parent Role
            'parent' => $this->whenLoaded('parent', function () {
                return [
                    'id' => $this->parent->id,
                    'name' => $this->parent->name,
                    'code' => $this->parent->code,
                    'display_name' => $this->parent->display_name,
                ];
            }),
            
            // Child Roles
            'children' => $this->whenLoaded('children', function () {
                return $this->children->map(function ($child) {
                    return [
                        'id' => $child->id,
                        'name' => $child->name,
                        'code' => $child->code,
                        'display_name' => $child->display_name,
                        'level' => $child->level,
                    ];
                });
            }),
            
            // Permissions
            'permissions' => $this->whenLoaded('permissions', function () {
                return $this->permissions->map(function ($permission) {
                    return [
                        'id' => $permission->id,
                        'name' => $permission->name,
                        'code' => $permission->code,
                        'display_name' => $permission->display_name,
                        'resource' => $permission->resource,
                        'action' => $permission->action,
                        'scope' => $permission->scope,
                        'category' => $permission->category,
                        'group_name' => $permission->group_name,
                        'is_dangerous' => $permission->is_dangerous,
                        'requires_approval' => $permission->requires_approval,
                    ];
                });
            }),
            
            // Role Permissions (with pivot data)
            'role_permissions' => $this->whenLoaded('rolePermissions', function () {
                return $this->rolePermissions->map(function ($rolePermission) {
                    return [
                        'id' => $rolePermission->id,
                        'permission' => [
                            'id' => $rolePermission->permission->id,
                            'name' => $rolePermission->permission->name,
                            'code' => $rolePermission->permission->code,
                            'resource' => $rolePermission->permission->resource,
                            'action' => $rolePermission->permission->action,
                        ],
                        'is_granted' => $rolePermission->is_granted,
                        'is_inherited' => $rolePermission->is_inherited,
                        'conditions' => $rolePermission->conditions,
                        'constraints' => $rolePermission->constraints,
                        'granted_by' => $rolePermission->granted_by,
                        'granted_at' => $rolePermission->granted_at?->toISOString(),
                    ];
                });
            }),
            
            // Users
            'users' => $this->whenLoaded('users', function () {
                return $this->users->map(function ($user) {
                    return [
                        'id' => $user->id,
                        'email' => $user->email,
                        'full_name' => $user->full_name,
                        'username' => $user->username,
                        'role' => $user->role,
                        'status' => $user->status,
                        'pivot' => [
                            'is_active' => $user->pivot->is_active,
                            'is_primary' => $user->pivot->is_primary,
                            'scope' => $user->pivot->scope,
                            'effective_from' => $user->pivot->effective_from?->toISOString(),
                            'effective_until' => $user->pivot->effective_until?->toISOString(),
                        ],
                    ];
                });
            }),
            
            // System fields
            'metadata' => $this->metadata,
            'status' => $this->status,
            'created_at' => $this->created_at->toISOString(),
            'updated_at' => $this->updated_at->toISOString(),
            
            // Computed fields
            'is_active' => $this->status === 'active',
            'can_be_updated' => !$this->is_system_role,
            'can_be_deleted' => !$this->is_system_role && $this->users->count() === 0,
            'user_count' => $this->whenLoaded('users', function () {
                return $this->users->count();
            }),
            'permission_count' => $this->whenLoaded('permissions', function () {
                return $this->permissions->count();
            }),
            'child_role_count' => $this->whenLoaded('children', function () {
                return $this->children->count();
            }),
        ];
    }
}
