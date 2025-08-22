<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateUserRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return auth()->check() && auth()->user()->hasPermission('users.update');
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $userId = $this->route('user');

        return [
            // Basic Information
            'email' => [
                'sometimes',
                'email',
                'max:255',
                Rule::unique('users', 'email')
                    ->whereNull('deleted_at')
                    ->ignore($userId),
            ],
            'username' => [
                'sometimes',
                'string',
                'max:100',
                'alpha_dash',
                Rule::unique('users', 'username')
                    ->whereNull('deleted_at')
                    ->ignore($userId),
            ],
            'password' => [
                'nullable',
                'string',
                'min:8',
                'max:255',
                'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/',
            ],
            'full_name' => 'sometimes|string|max:255',
            'first_name' => 'nullable|string|max:100',
            'last_name' => 'nullable|string|max:100',
            'phone' => 'nullable|string|max:20',
            'avatar_url' => 'nullable|url|max:500',
            
            // Role & Organization
            'role' => [
                'sometimes',
                'string',
                Rule::in(['super_admin', 'org_admin', 'agent', 'customer', 'viewer', 'moderator', 'developer']),
            ],
            'organization_id' => [
                'sometimes',
                'uuid',
                'exists:organizations,id',
            ],
            
            // Profile Information
            'bio' => 'nullable|string|max:1000',
            'location' => 'nullable|string|max:255',
            'department' => 'nullable|string|max:100',
            'job_title' => 'nullable|string|max:100',
            'skills' => 'nullable|array',
            'skills.*' => 'string|max:100',
            'languages' => 'nullable|array',
            'languages.*' => 'string|max:50',
            
            // Authentication & Security
            'is_email_verified' => 'boolean',
            'is_phone_verified' => 'boolean',
            'two_factor_enabled' => 'boolean',
            'max_concurrent_sessions' => 'integer|min:1|max:10',
            
            // API Access
            'api_access_enabled' => 'boolean',
            'api_rate_limit' => 'integer|min:10|max:10000',
            
            // UI/UX Preferences
            'ui_preferences' => 'nullable|array',
            'ui_preferences.theme' => 'nullable|string|in:light,dark,auto',
            'ui_preferences.language' => 'nullable|string|in:en,id',
            'ui_preferences.timezone' => 'nullable|string|timezone',
            'ui_preferences.notifications' => 'nullable|array',
            'ui_preferences.notifications.email' => 'boolean',
            'ui_preferences.notifications.push' => 'boolean',
            
            'dashboard_config' => 'nullable|array',
            'notification_preferences' => 'nullable|array',
            
            // Status
            'status' => [
                'sometimes',
                'string',
                Rule::in(['active', 'inactive', 'suspended', 'pending']),
            ],
            
            // Roles Assignment
            'roles' => 'nullable|array',
            'roles.*' => 'uuid|exists:roles,id',
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'email.email' => 'Please provide a valid email address.',
            'email.unique' => 'This email address is already registered.',
            'username.unique' => 'This username is already taken.',
            'username.alpha_dash' => 'Username can only contain letters, numbers, dashes, and underscores.',
            'password.min' => 'Password must be at least 8 characters long.',
            'password.regex' => 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.',
            'role.in' => 'Please select a valid user role.',
            'organization_id.exists' => 'Selected organization does not exist.',
            'phone.max' => 'Phone number cannot exceed 20 characters.',
            'avatar_url.url' => 'Please provide a valid URL for avatar.',
            'bio.max' => 'Bio cannot exceed 1000 characters.',
            'location.max' => 'Location cannot exceed 255 characters.',
            'department.max' => 'Department cannot exceed 100 characters.',
            'job_title.max' => 'Job title cannot exceed 100 characters.',
            'skills.*.max' => 'Skill name cannot exceed 100 characters.',
            'languages.*.max' => 'Language name cannot exceed 50 characters.',
            'max_concurrent_sessions.min' => 'Maximum concurrent sessions must be at least 1.',
            'max_concurrent_sessions.max' => 'Maximum concurrent sessions cannot exceed 10.',
            'api_rate_limit.min' => 'API rate limit must be at least 10 requests per minute.',
            'api_rate_limit.max' => 'API rate limit cannot exceed 10,000 requests per minute.',
            'ui_preferences.theme.in' => 'Theme must be light, dark, or auto.',
            'ui_preferences.language.in' => 'Language must be en or id.',
            'ui_preferences.timezone.timezone' => 'Please provide a valid timezone.',
            'status.in' => 'Please select a valid status.',
            'roles.*.exists' => 'One or more selected roles do not exist.',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     *
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'email' => 'email address',
            'full_name' => 'full name',
            'first_name' => 'first name',
            'last_name' => 'last name',
            'organization_id' => 'organization',
            'job_title' => 'job title',
            'max_concurrent_sessions' => 'maximum concurrent sessions',
            'api_rate_limit' => 'API rate limit',
            'ui_preferences' => 'UI preferences',
            'dashboard_config' => 'dashboard configuration',
            'notification_preferences' => 'notification preferences',
        ];
    }
}
