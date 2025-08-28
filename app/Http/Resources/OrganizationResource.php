<?php

namespace App\Http\Resources;

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
            'org_code' => $this->org_code,
            'name' => $this->name,
            'display_name' => $this->display_name,
            'email' => $this->email,
            'phone' => $this->phone,
            'address' => $this->address,
            'logo_url' => $this->logo_url,
            'favicon_url' => $this->favicon_url,
            'website' => $this->website,
            'tax_id' => $this->tax_id,
            'business_type' => $this->business_type,
            'industry' => $this->industry,
            'company_size' => $this->company_size,
            'timezone' => $this->timezone,
            'locale' => $this->locale,
            'currency' => $this->currency,
            'subscription' => [
                'plan' => $this->whenLoaded('subscriptionPlan', function () {
                    return [
                        'id' => $this->subscriptionPlan->id,
                        'name' => $this->subscriptionPlan->name,
                        'display_name' => $this->subscriptionPlan->display_name,
                        'tier' => $this->subscriptionPlan->tier,
                    ];
                }),
                'status' => $this->subscription_status,
                'trial_ends_at' => $this->trial_ends_at?->toISOString(),
                'subscription_starts_at' => $this->subscription_starts_at?->toISOString(),
                'subscription_ends_at' => $this->subscription_ends_at?->toISOString(),
                'billing_cycle' => $this->billing_cycle,
                'is_active' => $this->hasActiveSubscription(),
                'is_in_trial' => $this->isInTrial(),
                'has_trial_expired' => $this->hasTrialExpired(),
            ],
            'usage' => [
                'current' => $this->current_usage ?? [],
                'limits' => $this->whenLoaded('subscriptionPlan', function () {
                    return [
                        'max_agents' => $this->subscriptionPlan->max_agents,
                        'max_channels' => $this->subscriptionPlan->max_channels,
                        'max_knowledge_articles' => $this->subscriptionPlan->max_knowledge_articles,
                        'max_monthly_messages' => $this->subscriptionPlan->max_monthly_messages,
                        'max_monthly_ai_requests' => $this->subscriptionPlan->max_monthly_ai_requests,
                        'max_storage_gb' => $this->subscriptionPlan->max_storage_gb,
                        'max_api_calls_per_day' => $this->subscriptionPlan->max_api_calls_per_day,
                    ];
                }),
            ],
            'configuration' => [
                'theme' => $this->theme_config ?? [],
                'branding' => $this->branding_config ?? [],
                'feature_flags' => $this->feature_flags ?? [],
                'ui_preferences' => $this->ui_preferences ?? [],
                'business_hours' => $this->business_hours ?? [],
                'contact_info' => $this->contact_info ?? [],
                'social_media' => $this->social_media ?? [],
                'security_settings' => $this->security_settings ?? [],
                'settings' => $this->settings ?? [],
            ],
            'api' => [
                'enabled' => $this->api_enabled,
                'webhook_url' => $this->webhook_url,
                'webhook_secret' => $this->when($request->user()?->hasPermission('organizations.view_secrets'), $this->webhook_secret),
            ],
            'users' => $this->whenLoaded('users', function () {
                return $this->users->map(function ($user) {
                    return [
                        'id' => $user->id,
                        'email' => $user->email,
                        'full_name' => $user->full_name,
                        'username' => $user->username,
                        'role' => $user->role,
                        'status' => $user->status,
                        'created_at' => $user->created_at?->toISOString(),
                    ];
                });
            }),
            'metadata' => $this->metadata ?? [],
            'status' => $this->status,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
