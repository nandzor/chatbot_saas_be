<?php

namespace App\Http\Resources\Permission;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PermissionResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'code' => $this->code,
            'display_name' => $this->display_name,
            'description' => $this->description,
            'resource' => $this->resource,
            'action' => $this->action,
            'scope' => $this->scope,
            'conditions' => $this->conditions,
            'constraints' => $this->constraints,
            'category' => $this->category,
            'group_name' => $this->group_name,
            'is_system_permission' => $this->is_system_permission,
            'is_dangerous' => $this->is_dangerous,
            'requires_approval' => $this->requires_approval,
            'sort_order' => $this->sort_order,
            'is_visible' => $this->is_visible,
            'metadata' => $this->metadata,
            'status' => $this->status,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
            
            // Relationships
            'roles_count' => $this->whenLoaded('roles', function () {
                return $this->roles->count();
            }),
            'permission_groups_count' => $this->whenLoaded('permissionGroups', function () {
                return $this->permissionGroups->count();
            }),
            
            // Computed fields
            'full_permission' => $this->resource . '.' . $this->action,
            'is_modifiable' => !$this->is_system_permission,
            'is_deletable' => !$this->is_system_permission && $this->roles_count === 0,
        ];
    }
}
