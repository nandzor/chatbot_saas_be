<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class OrganizationSettingsRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            // General settings
            'general.name' => 'sometimes|string|max:255',
            'general.displayName' => 'sometimes|string|max:255',
            'general.email' => 'sometimes|email|max:255',
            'general.phone' => 'sometimes|string|max:20',
            'general.website' => 'sometimes|url|max:255',
            'general.taxId' => 'sometimes|string|max:50',
            'general.address' => 'sometimes|string|max:500',
            'general.description' => 'sometimes|string|max:1000',
            'general.timezone' => 'sometimes|string|max:50',
            'general.locale' => 'sometimes|string|max:10',
            'general.currency' => 'sometimes|string|max:3',

            // System settings
            'system.status' => 'sometimes|in:active,inactive,suspended',
            'system.businessType' => 'sometimes|string|max:50',
            'system.industry' => 'sometimes|string|max:100',
            'system.companySize' => 'sometimes|string|max:50',
            'system.foundedYear' => 'sometimes|integer|min:1800|max:' . date('Y'),
            'system.employeeCount' => 'sometimes|integer|min:0|max:1000000',
            'system.annualRevenue' => 'sometimes|numeric|min:0',
            'system.socialMedia' => 'sometimes|array',
            'system.socialMedia.*' => 'string|max:255',

            // API settings
            'api.apiKey' => 'sometimes|string|max:255',
            'api.webhookUrl' => 'sometimes|url|max:255',
            'api.webhookSecret' => 'sometimes|string|max:255',
            'api.rateLimit' => 'sometimes|integer|min:1|max:100000',
            'api.allowedOrigins' => 'sometimes|array',
            'api.allowedOrigins.*' => 'string|max:255',
            'api.enableApiAccess' => 'sometimes|boolean',
            'api.enableWebhooks' => 'sometimes|boolean',

            // Subscription settings
            'subscription.plan' => 'sometimes|string|max:50',
            'subscription.billingCycle' => 'sometimes|in:monthly,yearly',
            'subscription.status' => 'sometimes|in:active,inactive,cancelled,expired',
            'subscription.startDate' => 'sometimes|date',
            'subscription.endDate' => 'sometimes|date|after:subscription.startDate',
            'subscription.autoRenew' => 'sometimes|boolean',
            'subscription.features' => 'sometimes|array',
            'subscription.limits' => 'sometimes|array',

            // Security settings
            'security.twoFactorAuth' => 'sometimes|boolean',
            'security.ssoEnabled' => 'sometimes|boolean',
            'security.ssoProvider' => 'sometimes|string|max:50',
            'security.passwordPolicy' => 'sometimes|array',
            'security.sessionTimeout' => 'sometimes|integer|min:5|max:480',
            'security.ipWhitelist' => 'sometimes|array',
            'security.ipWhitelist.*' => 'ip',
            'security.allowedDomains' => 'sometimes|array',
            'security.allowedDomains.*' => 'string|max:255',

            // Notification settings
            'notifications.email' => 'sometimes|array',
            'notifications.push' => 'sometimes|array',
            'notifications.webhook' => 'sometimes|array',

            // Feature settings
            'features.chatbot' => 'sometimes|array',
            'features.analytics' => 'sometimes|array',
            'features.integrations' => 'sometimes|array',
            'features.customBranding' => 'sometimes|array',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'general.name.required' => 'Organization name is required',
            'general.name.max' => 'Organization name cannot exceed 255 characters',
            'general.email.email' => 'Please provide a valid email address',
            'general.website.url' => 'Please provide a valid website URL',
            'general.phone.max' => 'Phone number cannot exceed 20 characters',
            'general.taxId.max' => 'Tax ID cannot exceed 50 characters',
            'general.address.max' => 'Address cannot exceed 500 characters',
            'general.description.max' => 'Description cannot exceed 1000 characters',
            'general.timezone.max' => 'Timezone cannot exceed 50 characters',
            'general.locale.max' => 'Locale cannot exceed 10 characters',
            'general.currency.max' => 'Currency code cannot exceed 3 characters',

            'system.status.in' => 'Status must be one of: active, inactive, suspended',
            'system.businessType.max' => 'Business type cannot exceed 50 characters',
            'system.industry.max' => 'Industry cannot exceed 100 characters',
            'system.companySize.max' => 'Company size cannot exceed 50 characters',
            'system.foundedYear.integer' => 'Founded year must be a valid year',
            'system.foundedYear.min' => 'Founded year cannot be before 1800',
            'system.foundedYear.max' => 'Founded year cannot be in the future',
            'system.employeeCount.integer' => 'Employee count must be a valid number',
            'system.employeeCount.min' => 'Employee count cannot be negative',
            'system.employeeCount.max' => 'Employee count cannot exceed 1,000,000',
            'system.annualRevenue.numeric' => 'Annual revenue must be a valid number',
            'system.annualRevenue.min' => 'Annual revenue cannot be negative',

            'api.webhookUrl.url' => 'Please provide a valid webhook URL',
            'api.rateLimit.integer' => 'Rate limit must be a valid number',
            'api.rateLimit.min' => 'Rate limit must be at least 1',
            'api.rateLimit.max' => 'Rate limit cannot exceed 100,000',

            'subscription.billingCycle.in' => 'Billing cycle must be monthly or yearly',
            'subscription.status.in' => 'Status must be one of: active, inactive, cancelled, expired',
            'subscription.startDate.date' => 'Start date must be a valid date',
            'subscription.endDate.date' => 'End date must be a valid date',
            'subscription.endDate.after' => 'End date must be after start date',

            'security.sessionTimeout.integer' => 'Session timeout must be a valid number',
            'security.sessionTimeout.min' => 'Session timeout must be at least 5 minutes',
            'security.sessionTimeout.max' => 'Session timeout cannot exceed 480 minutes',
            'security.ipWhitelist.*.ip' => 'Please provide valid IP addresses',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'general.name' => 'organization name',
            'general.displayName' => 'display name',
            'general.email' => 'email address',
            'general.phone' => 'phone number',
            'general.website' => 'website URL',
            'general.taxId' => 'tax ID',
            'general.address' => 'address',
            'general.description' => 'description',
            'general.timezone' => 'timezone',
            'general.locale' => 'locale',
            'general.currency' => 'currency',

            'system.status' => 'status',
            'system.businessType' => 'business type',
            'system.industry' => 'industry',
            'system.companySize' => 'company size',
            'system.foundedYear' => 'founded year',
            'system.employeeCount' => 'employee count',
            'system.annualRevenue' => 'annual revenue',
            'system.socialMedia' => 'social media',

            'api.apiKey' => 'API key',
            'api.webhookUrl' => 'webhook URL',
            'api.webhookSecret' => 'webhook secret',
            'api.rateLimit' => 'rate limit',
            'api.allowedOrigins' => 'allowed origins',
            'api.enableApiAccess' => 'API access',
            'api.enableWebhooks' => 'webhooks',

            'subscription.plan' => 'subscription plan',
            'subscription.billingCycle' => 'billing cycle',
            'subscription.status' => 'subscription status',
            'subscription.startDate' => 'start date',
            'subscription.endDate' => 'end date',
            'subscription.autoRenew' => 'auto renew',
            'subscription.features' => 'features',
            'subscription.limits' => 'limits',

            'security.twoFactorAuth' => 'two-factor authentication',
            'security.ssoEnabled' => 'SSO',
            'security.ssoProvider' => 'SSO provider',
            'security.passwordPolicy' => 'password policy',
            'security.sessionTimeout' => 'session timeout',
            'security.ipWhitelist' => 'IP whitelist',
            'security.allowedDomains' => 'allowed domains',

            'notifications.email' => 'email notifications',
            'notifications.push' => 'push notifications',
            'notifications.webhook' => 'webhook notifications',

            'features.chatbot' => 'chatbot features',
            'features.analytics' => 'analytics features',
            'features.integrations' => 'integration features',
            'features.customBranding' => 'custom branding features',
        ];
    }
}
