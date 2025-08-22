<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrganizationResource extends JsonResource
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
            'slug' => $this->slug,
            'description' => $this->description,

            // Organization Configuration
            'type' => $this->type,
            'industry' => $this->industry,
            'website' => $this->website,
            'email' => $this->email,
            'phone' => $this->phone,

            // Address Information
            'address' => $this->address,
            'city' => $this->city,
            'state' => $this->state,
            'country' => $this->country,
            'postal_code' => $this->postal_code,

            // Regional Settings
            'timezone' => $this->timezone,
            'currency' => $this->currency,
            'language' => $this->language,

            // Media
            'logo_url' => $this->logo_url,
            'banner_url' => $this->banner_url,

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
                            'role' => $user->pivot->role ?? null,
                            'joined_at' => $user->pivot->joined_at?->toISOString(),
                            'added_by' => $user->pivot->added_by ?? null,
                        ],
                    ];
                });
            }),

            // Roles
            'roles' => $this->whenLoaded('roles', function () {
                return $this->roles->map(function ($role) {
                    return [
                        'id' => $role->id,
                        'name' => $role->name,
                        'code' => $role->code,
                        'display_name' => $role->display_name,
                        'scope' => $role->scope,
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
                        'resource' => $permission->resource,
                        'action' => $permission->action,
                        'scope' => $permission->scope,
                    ];
                });
            }),

            // System fields
            'settings' => $this->settings,
            'metadata' => $this->metadata,
            'status' => $this->status,
            'created_at' => $this->created_at->toISOString(),
            'updated_at' => $this->updated_at->toISOString(),

            // Computed fields
            'is_active' => $this->status === 'active',
            'user_count' => $this->whenLoaded('users', function () {
                return $this->users->count();
            }),
            'role_count' => $this->whenLoaded('roles', function () {
                return $this->roles->count();
            }),
            'permission_count' => $this->whenLoaded('permissions', function () {
                return $this->permissions->count();
            }),
        ];
    }
}
