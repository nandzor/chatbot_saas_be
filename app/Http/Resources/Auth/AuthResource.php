<?php

namespace App\Http\Resources\Auth;

use App\Http\Resources\User\UserResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AuthResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        return [
            'access_token' => $this->resource['access_token'],
            'refresh_token' => $this->when(
                isset($this->resource['refresh_token']),
                $this->resource['refresh_token']
            ),
            'token_type' => $this->resource['token_type'] ?? 'Bearer',
            'expires_in' => $this->resource['expires_in'],
            'expires_at' => now()->addSeconds($this->resource['expires_in'])->toISOString(),
            'refresh_expires_in' => $this->when(
                isset($this->resource['refresh_expires_in']),
                $this->resource['refresh_expires_in']
            ),
            'sanctum_token' => $this->when(
                isset($this->resource['sanctum_token']),
                $this->resource['sanctum_token']
            ),
            'user' => $this->when(
                isset($this->resource['user']),
                new UserResource($this->resource['user'])
            ),
            'session' => $this->when(
                isset($this->resource['session']),
                [
                    'id' => $this->resource['session']->id,
                    'device_info' => $this->resource['session']->device_info,
                    'location_info' => $this->resource['session']->location_info,
                    'ip_address' => $this->resource['session']->ip_address,
                    'created_at' => $this->resource['session']->created_at,
                    'expires_at' => $this->resource['session']->expires_at,
                ]
            ),
            'permissions' => $this->when(
                isset($this->resource['user']),
                $this->getUserPermissions($this->resource['user'])
            ),
            'organization' => $this->when(
                isset($this->resource['user']) && $this->resource['user']->organization,
                function() {
                    $org = $this->resource['user']->organization;
                    return $org ? [
                        'id' => $org->id,
                        'name' => $org->name,
                        'org_code' => $org->org_code,
                        'subscription_status' => $org->subscription_status,
                        'features' => $this->getOrganizationFeatures($org),
                    ] : null;
                }
            ),
            'security' => [
                'two_factor_enabled' => $this->when(
                    isset($this->resource['user']),
                    $this->resource['user']->two_factor_enabled ?? false
                ),
                'password_needs_change' => $this->when(
                    isset($this->resource['user']),
                    $this->needsPasswordChange($this->resource['user'])
                ),
                'login_count' => $this->when(
                    isset($this->resource['user']),
                    $this->resource['user']->login_count ?? 0
                ),
                'last_login_at' => $this->when(
                    isset($this->resource['user']) && $this->resource['user']->last_login_at,
                    $this->resource['user']->last_login_at->toISOString()
                ),
            ],
            'issued_at' => now()->toISOString(),
        ];
    }

    /**
     * Get user permissions.
     */
    protected function getUserPermissions($user): array
    {
        if (!$user) {
            return [];
        }

        try {
            // Get permissions from user's permissions field (array)
            $directPermissions = $user->permissions ?? [];

            // Get permissions from roles if available
            $rolePermissions = [];
            if (method_exists($user, 'getAllPermissions')) {
                $rolePermissions = $user->getAllPermissions()
                                       ->pluck('code')
                                       ->toArray();
            }

            // If no role permissions found, try to get from loaded roles
            if (empty($rolePermissions) && $user->relationLoaded('roles')) {
                $rolePermissions = $user->roles->flatMap(function ($role) {
                    return $role->permissions->pluck('code')->toArray();
                })->toArray();
            }

            // Merge and return unique permissions
            $allPermissions = array_merge($directPermissions, $rolePermissions);
            return array_values(array_unique($allPermissions));
        } catch (\Exception $e) {
            return $user->permissions ?? [];
        }
    }

    /**
     * Get organization features.
     */
    protected function getOrganizationFeatures($organization): array
    {
        if (!$organization) {
            return [];
        }

        try {
            return $organization->subscriptionPlan?->features ?? [];
        } catch (\Exception $e) {
            return [];
        }
    }

    /**
     * Check if password needs change.
     */
    protected function needsPasswordChange($user): bool
    {
        if (!$user || !$user->password_changed_at) {
            return false;
        }

        $maxAge = config('auth.password_max_age', 90); // days
        return $user->password_changed_at->addDays($maxAge)->isPast();
    }

    /**
     * Get additional resource information.
     */
    public function with(Request $request): array
    {
        return [
            'meta' => [
                'server_time' => now()->toISOString(),
                'api_version' => config('app.api_version', '1.0'),
                'environment' => app()->environment(),
            ],
        ];
    }
}
