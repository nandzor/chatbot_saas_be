<?php

namespace App\Http\Requests\ClientManagement;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateClientRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Authorization handled by middleware
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        $organizationId = $this->route('id');

        return [
            'name' => 'sometimes|required|string|max:255',
            'display_name' => 'nullable|string|max:255',
            'org_code' => [
                'nullable',
                'string',
                'max:50',
                Rule::unique('organizations', 'org_code')->ignore($organizationId)
            ],
            'email' => [
                'sometimes',
                'required',
                'email',
                'max:255',
                Rule::unique('organizations', 'email')->ignore($organizationId)
            ],
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:500',
            'website' => 'nullable|url|max:255',
            'tax_id' => 'nullable|string|max:50',
            'business_type' => 'nullable|string|max:100',
            'industry' => 'nullable|string|max:100',
            'company_size' => 'nullable|string|max:50',
            'timezone' => 'nullable|string|max:50',
            'locale' => 'nullable|string|max:10',
            'currency' => 'nullable|string|max:3',
            'subscription_plan_id' => 'nullable|exists:subscription_plans,id',
            'subscription_status' => 'nullable|in:trial,active,suspended,cancelled',
            'trial_ends_at' => 'nullable|date',
            'subscription_starts_at' => 'nullable|date',
            'subscription_ends_at' => 'nullable|date|after:subscription_starts_at',
            'billing_cycle' => 'nullable|in:monthly,yearly',
            'theme_config' => 'nullable|array',
            'branding_config' => 'nullable|array',
            'feature_flags' => 'nullable|array',
            'ui_preferences' => 'nullable|array',
            'business_hours' => 'nullable|array',
            'contact_info' => 'nullable|array',
            'social_media' => 'nullable|array',
            'security_settings' => 'nullable|array',
            'api_enabled' => 'nullable|boolean',
            'webhook_url' => 'nullable|url|max:255',
            'webhook_secret' => 'nullable|string|max:255',
            'settings' => 'nullable|array',
            'metadata' => 'nullable|array',
            'status' => 'nullable|in:active,trial,suspended,inactive'
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Organization name is required.',
            'name.max' => 'Organization name may not be greater than 255 characters.',
            'email.required' => 'Email address is required.',
            'email.email' => 'Please provide a valid email address.',
            'email.unique' => 'This email address is already registered.',
            'org_code.unique' => 'This organization code is already in use.',
            'website.url' => 'Please provide a valid website URL.',
            'subscription_plan_id.exists' => 'Selected subscription plan does not exist.',
            'subscription_status.in' => 'Invalid subscription status.',
            'subscription_ends_at.after' => 'Subscription end date must be after start date.',
            'billing_cycle.in' => 'Invalid billing cycle.',
            'status.in' => 'Invalid organization status.',
            'webhook_url.url' => 'Please provide a valid webhook URL.'
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'name' => 'organization name',
            'display_name' => 'display name',
            'org_code' => 'organization code',
            'email' => 'email address',
            'phone' => 'phone number',
            'address' => 'address',
            'website' => 'website URL',
            'tax_id' => 'tax ID',
            'business_type' => 'business type',
            'industry' => 'industry',
            'company_size' => 'company size',
            'timezone' => 'timezone',
            'locale' => 'locale',
            'currency' => 'currency',
            'subscription_plan_id' => 'subscription plan',
            'subscription_status' => 'subscription status',
            'trial_ends_at' => 'trial end date',
            'subscription_starts_at' => 'subscription start date',
            'subscription_ends_at' => 'subscription end date',
            'billing_cycle' => 'billing cycle',
            'theme_config' => 'theme configuration',
            'branding_config' => 'branding configuration',
            'feature_flags' => 'feature flags',
            'ui_preferences' => 'UI preferences',
            'business_hours' => 'business hours',
            'contact_info' => 'contact information',
            'social_media' => 'social media',
            'security_settings' => 'security settings',
            'api_enabled' => 'API enabled',
            'webhook_url' => 'webhook URL',
            'webhook_secret' => 'webhook secret',
            'settings' => 'settings',
            'metadata' => 'metadata',
            'status' => 'status'
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Clean and format data before validation
        if ($this->has('phone')) {
            $this->merge([
                'phone' => preg_replace('/[^0-9+\-\s()]/', '', $this->phone)
            ]);
        }

        if ($this->has('website') && !empty($this->website)) {
            $website = $this->website;
            if (!str_starts_with($website, 'http://') && !str_starts_with($website, 'https://')) {
                $website = 'https://' . $website;
            }
            $this->merge(['website' => $website]);
        }

        if ($this->has('org_code')) {
            $this->merge([
                'org_code' => strtoupper(preg_replace('/[^A-Za-z0-9]/', '', $this->org_code))
            ]);
        }
    }
}
