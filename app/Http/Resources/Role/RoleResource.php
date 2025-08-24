<?php

namespace App\Http\Resources\Role;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RoleResource extends JsonResource
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
            'level' => $this->level,
            'scope' => $this->scope,
            'is_active' => $this->is_active,
            'is_system_role' => $this->is_system_role,
            'metadata' => $this->metadata,

            // Counts
            'users_count' => $this->when(isset($this->users_count), $this->users_count),
            'permissions_count' => $this->when(isset($this->permissions_count), $this->permissions_count),

            // Relationships
            'permissions' => $this->whenLoaded('permissions', function () {
                return $this->permissions->map(function ($permission) {
                    return [
                        'id' => $permission->id,
                        'name' => $permission->name,
                        'code' => $permission->code,
                        'display_name' => $permission->display_name,
                        'category' => $permission->category,
                        'resource' => $permission->resource,
                        'action' => $permission->action,
                    ];
                });
            }),

            'users' => $this->whenLoaded('users', function () {
                return $this->users->map(function ($user) {
                    return [
                        'id' => $user->id,
                        'email' => $user->email,
                        'full_name' => $user->full_name,
                        'username' => $user->username,
                        'status' => $user->status,
                        'organization' => $user->organization ? [
                            'id' => $user->organization->id,
                            'name' => $user->organization->name,
                        ] : null,
                        'pivot' => $user->pivot ? [
                            'is_active' => $user->pivot->is_active,
                            'is_primary' => $user->pivot->is_primary,
                            'scope' => $user->pivot->scope,
                            'effective_from' => $user->pivot->effective_from ? (is_string($user->pivot->effective_from) ? $user->pivot->effective_from : $user->pivot->effective_from->toISOString()) : null,
                            'effective_until' => $user->pivot->effective_until ? (is_string($user->pivot->effective_until) ? $user->pivot->effective_until : $user->pivot->effective_until->toISOString()) : null,
                        ] : null,
                    ];
                });
            }),

            // Timestamps
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
