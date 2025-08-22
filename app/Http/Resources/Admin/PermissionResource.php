<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PermissionResource extends JsonResource
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

            // Permission Configuration
            'resource' => $this->resource,
            'action' => $this->action,
            'scope' => $this->scope,
            'category' => $this->category,
            'group_name' => $this->group_name,

            // Security
            'is_dangerous' => $this->is_dangerous,
            'requires_approval' => $this->requires_approval,
            'is_system_permission' => $this->is_system_permission,

            // UI/UX
            'sort_order' => $this->sort_order,
            'is_visible' => $this->is_visible,

            // Organization
            'organization' => $this->whenLoaded('organization', function () {
                return [
                    'id' => $this->organization->id,
                    'name' => $this->organization->name,
                    'slug' => $this->organization->slug,
                ];
            }),

            // Roles
            'roles' => $this->whenLoaded('roles', function () {
                return $this->roles->map(function ($role) {
                    return [
                        'id' => $role->id,
                        'name' => $role->name,
                        'code' => $role->code,
                        'display_name' => $role->display_name,
                    ];
                });
            }),

            // Role Permissions (with pivot data)
            'role_permissions' => $this->whenLoaded('rolePermissions', function () {
                return $this->rolePermissions->map(function ($rolePermission) {
                    return [
                        'id' => $rolePermission->id,
                        'role' => [
                            'id' => $rolePermission->role->id,
                            'name' => $rolePermission->role->name,
                            'code' => $rolePermission->role->code,
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

            // System fields
            'conditions' => $this->conditions,
            'constraints' => $this->constraints,
            'status' => $this->status,
            'created_at' => $this->created_at->toISOString(),
            'updated_at' => $this->updated_at->toISOString(),

            // Computed fields
            'is_active' => $this->status === 'active',
            'can_be_updated' => !$this->is_system_permission,
            'can_be_deleted' => !$this->is_system_permission && $this->roles->count() === 0,
            'role_count' => $this->whenLoaded('roles', function () {
                return $this->roles->count();
            }),
        ];
    }
}
