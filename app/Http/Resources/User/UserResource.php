<?php

namespace App\Http\Resources\User;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    /**
     * Transform the resource into an array.
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
            'status' => $this->status,

            // Verification status
            'is_email_verified' => $this->is_email_verified,
            'is_phone_verified' => $this->is_phone_verified,

            // Security settings
            'two_factor_enabled' => $this->two_factor_enabled,
            'api_access_enabled' => $this->api_access_enabled,

            // Profile information
            'bio' => $this->bio,
            'location' => $this->location,
            'department' => $this->department,
            'job_title' => $this->job_title,
            'skills' => $this->skills,
            'languages' => $this->languages,

            // Preferences
            'ui_preferences' => $this->ui_preferences,
            'notification_preferences' => $this->notification_preferences,
            'dashboard_config' => $this->dashboard_config,

            // Activity information
            'login_count' => $this->login_count,
            'last_login_at' => $this->when(
                $this->last_login_at,
                $this->last_login_at?->toISOString()
            ),
            'last_login_ip' => $this->last_login_ip,

            // Organization information
            'organization' => $this->whenLoaded('organization', function () {
                return [
                    'id' => $this->organization->id,
                    'name' => $this->organization->name,
                    'org_code' => $this->organization->org_code,
                    'display_name' => $this->organization->display_name,
                    'subscription_status' => $this->organization->subscription_status,
                    'timezone' => $this->organization->timezone,
                    'locale' => $this->organization->locale,
                    'currency' => $this->organization->currency,
                ];
            }),

            // Active sessions
            'active_sessions' => $this->whenLoaded('sessions', function () {
                return $this->sessions->map(function ($session) {
                    return [
                        'id' => $session->id,
                        'ip_address' => $session->ip_address,
                        'device_info' => $session->device_info,
                        'last_activity_at' => $session->last_activity_at?->toISOString(),
                        'created_at' => $session->created_at?->toISOString(),
                    ];
                });
            }),

            // Role information (if RBAC is loaded)
            'roles' => $this->whenLoaded('roles', function () {
                return $this->roles->map(function ($role) {
                    return [
                        'id' => $role->id,
                        'name' => $role->name,
                        'code' => $role->code,
                        'display_name' => $role->display_name,
                        'level' => $role->level,
                        'scope' => $role->pivot->scope ?? null,
                        'is_primary' => $role->pivot->is_primary ?? false,
                    ];
                });
            }),

            // Permissions - use codes for frontend compatibility
            'permissions' => function () {
                try {
                    // Get permissions from user's permissions field (array of codes)
                    $directPermissions = $this->permissions ?? [];

                    // Get permissions from roles if available
                    $rolePermissions = [];
                    if (method_exists($this->resource, 'getAllPermissions')) {
                        $rolePermissions = $this->getAllPermissions()
                                               ->pluck('code')
                                               ->toArray();
                    }

                    // If no role permissions found, try to get from loaded roles
                    if (empty($rolePermissions) && $this->relationLoaded('roles')) {
                        $rolePermissions = $this->roles->flatMap(function ($role) {
                            return $role->permissions->pluck('code')->toArray();
                        })->toArray();
                    }

                    // Merge and return unique permission codes
                    $allPermissions = array_merge($directPermissions, $rolePermissions);
                    return array_values(array_unique($allPermissions));
                } catch (\Exception $e) {
                    return $this->permissions ?? [];
                }
            },

            // Timestamps
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),

            // Security information (for current user only)
            'security_info' => $this->when(
                $request->user() && $request->user()->id === $this->id,
                [
                    'failed_login_attempts' => $this->failed_login_attempts,
                    'locked_until' => $this->locked_until?->toISOString(),
                    'password_changed_at' => $this->password_changed_at?->toISOString(),
                    'max_concurrent_sessions' => $this->max_concurrent_sessions,
                    'api_rate_limit' => $this->api_rate_limit,
                ]
            ),
        ];
    }

    /**
     * Get additional resource information.
     */
    public function with(Request $request): array
    {
        return [
            'meta' => [
                'is_current_user' => $request->user() && $request->user()->id === $this->id,
                'can_edit' => $this->canEdit($request->user()),
                'can_delete' => $this->canDelete($request->user()),
            ],
        ];
    }

    /**
     * Check if user can edit this profile.
     */
    protected function canEdit($currentUser): bool
    {
        if (!$currentUser) {
            return false;
        }

        // User can edit their own profile
        if ($currentUser->id === $this->id) {
            return true;
        }

        // Admin users can edit other users
        return in_array($currentUser->role, ['super_admin', 'org_admin']);
    }

    /**
     * Check if user can delete this profile.
     */
    protected function canDelete($currentUser): bool
    {
        if (!$currentUser) {
            return false;
        }

        // Users cannot delete themselves
        if ($currentUser->id === $this->id) {
            return false;
        }

        // Only admin users can delete other users
        return in_array($currentUser->role, ['super_admin', 'org_admin']);
    }
}
