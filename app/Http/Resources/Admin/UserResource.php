<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
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
            'email' => $this->email,
            'username' => $this->username,
            'full_name' => $this->full_name,
            'first_name' => $this->first_name,
            'last_name' => $this->last_name,
            'phone' => $this->phone,
            'avatar_url' => $this->avatar_url,
            'role' => $this->role,
            
            // Authentication & Security
            'is_email_verified' => $this->is_email_verified,
            'is_phone_verified' => $this->is_phone_verified,
            'two_factor_enabled' => $this->two_factor_enabled,
            'last_login_at' => $this->last_login_at?->toISOString(),
            'last_login_ip' => $this->last_login_ip,
            'login_count' => $this->login_count,
            'failed_login_attempts' => $this->failed_login_attempts,
            'locked_until' => $this->locked_until?->toISOString(),
            'password_changed_at' => $this->password_changed_at?->toISOString(),
            
            // Profile & Activity
            'bio' => $this->bio,
            'location' => $this->location,
            'department' => $this->department,
            'job_title' => $this->job_title,
            'skills' => $this->skills,
            'languages' => $this->languages,
            
            // API Access
            'api_access_enabled' => $this->api_access_enabled,
            'api_rate_limit' => $this->api_rate_limit,
            
            // Session Management
            'active_sessions' => $this->active_sessions,
            'max_concurrent_sessions' => $this->max_concurrent_sessions,
            
            // UI/UX Preferences
            'ui_preferences' => $this->ui_preferences,
            'dashboard_config' => $this->dashboard_config,
            'notification_preferences' => $this->notification_preferences,
            
            // Organization
            'organization' => $this->whenLoaded('organization', function () {
                return [
                    'id' => $this->organization->id,
                    'name' => $this->organization->name,
                    'slug' => $this->organization->slug,
                    'status' => $this->organization->status,
                ];
            }),
            
            // Roles & Permissions
            'roles' => $this->whenLoaded('roles', function () {
                return $this->roles->map(function ($role) {
                    return [
                        'id' => $role->id,
                        'name' => $role->name,
                        'code' => $role->code,
                        'display_name' => $role->display_name,
                        'description' => $role->description,
                        'scope' => $role->scope,
                        'level' => $role->level,
                        'color' => $role->color,
                        'icon' => $role->icon,
                        'permissions' => $role->whenLoaded('permissions', function () use ($role) {
                            return $role->permissions->map(function ($permission) {
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
                    ];
                });
            }),
            
            'user_roles' => $this->whenLoaded('userRoles', function () {
                return $this->userRoles->map(function ($userRole) {
                    return [
                        'id' => $userRole->id,
                        'role' => [
                            'id' => $userRole->role->id,
                            'name' => $userRole->role->name,
                            'code' => $userRole->role->code,
                            'display_name' => $userRole->role->display_name,
                        ],
                        'is_active' => $userRole->is_active,
                        'is_primary' => $userRole->is_primary,
                        'scope' => $userRole->scope,
                        'scope_context' => $userRole->scope_context,
                        'effective_from' => $userRole->effective_from?->toISOString(),
                        'effective_until' => $userRole->effective_until?->toISOString(),
                        'assigned_by' => $userRole->assigned_by,
                        'assigned_reason' => $userRole->assigned_reason,
                    ];
                });
            }),
            
            // User Sessions
            'user_sessions' => $this->whenLoaded('userSessions', function () {
                return $this->userSessions->map(function ($session) {
                    return [
                        'id' => $session->id,
                        'session_id' => $session->session_id,
                        'device_info' => $session->device_info,
                        'ip_address' => $session->ip_address,
                        'user_agent' => $session->user_agent,
                        'last_activity' => $session->last_activity?->toISOString(),
                        'is_active' => $session->is_active,
                        'created_at' => $session->created_at->toISOString(),
                    ];
                });
            }),
            
            // System fields
            'status' => $this->status,
            'created_at' => $this->created_at->toISOString(),
            'updated_at' => $this->updated_at->toISOString(),
            'deleted_at' => $this->deleted_at?->toISOString(),
            
            // Computed fields
            'is_active' => $this->status === 'active',
            'is_suspended' => $this->status === 'suspended',
            'is_deleted' => !is_null($this->deleted_at),
            'has_active_sessions' => !empty($this->active_sessions),
            'session_count' => count($this->active_sessions ?? []),
            'role_count' => $this->whenLoaded('roles', function () {
                return $this->roles->count();
            }),
            'permission_count' => $this->whenLoaded('roles', function () {
                return $this->roles->flatMap->permissions->unique('id')->count();
            }),
        ];
    }
}
