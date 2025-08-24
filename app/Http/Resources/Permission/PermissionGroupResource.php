<?php

namespace App\Http\Resources\Permission;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PermissionGroupResource extends JsonResource
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
            'category' => $this->category,
            'parent_group_id' => $this->parent_group_id,
            'icon' => $this->icon,
            'color' => $this->color,
            'sort_order' => $this->sort_order,
            'status' => $this->status,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),

            // Relationships
            'parent_group' => new PermissionGroupResource($this->whenLoaded('parentGroup')),
            'children' => PermissionGroupResource::collection($this->whenLoaded('children')),
            'permissions' => PermissionResource::collection($this->whenLoaded('permissions')),
            'permissions_count' => $this->whenLoaded('permissions', function () {
                return $this->permissions->count();
            }),

            // Computed fields
            'has_children' => $this->whenLoaded('children', function () {
                return $this->children->count() > 0;
            }),
            'has_parent' => !is_null($this->parent_group_id),
            'is_empty' => $this->whenLoaded('permissions', function () {
                return $this->permissions->count() === 0;
            }),
        ];
    }
}
