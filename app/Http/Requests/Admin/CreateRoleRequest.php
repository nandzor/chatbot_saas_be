<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CreateRoleRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return auth()->check() && auth()->user()->hasPermission('roles.create');
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => 'required|string|max:100',
            'code' => [
                'required',
                'string',
                'max:50',
                'alpha_dash',
                Rule::unique('roles', 'code')->whereNull('deleted_at'),
            ],
            'display_name' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            
            // Role Configuration
            'scope' => [
                'nullable',
                'string',
                Rule::in(['global', 'organization', 'department', 'team', 'personal']),
            ],
            'level' => 'integer|min:1|max:100',
            'is_system_role' => 'boolean',
            'is_default' => 'boolean',
            
            // Inheritance
            'parent_role_id' => 'nullable|uuid|exists:roles,id',
            'inherits_permissions' => 'boolean',
            
            // Access Control
            'max_users' => 'nullable|integer|min:1',
            
            // UI/UX
            'color' => 'nullable|string|max:7|regex:/^#[0-9A-F]{6}$/i',
            'icon' => 'nullable|string|max:50',
            'badge_text' => 'nullable|string|max:20',
            
            // Organization
            'organization_id' => [
                'required',
                'uuid',
                'exists:organizations,id',
            ],
            
            // Permissions
            'permissions' => 'nullable|array',
            'permissions.*' => 'uuid|exists:permissions,id',
            
            // System fields
            'metadata' => 'nullable|array',
            'status' => [
                'nullable',
                'string',
                Rule::in(['active', 'inactive', 'suspended', 'deleted', 'pending', 'draft', 'published', 'archived']),
            ],
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
            'name.required' => 'Role name is required.',
            'name.max' => 'Role name cannot exceed 100 characters.',
            'code.required' => 'Role code is required.',
            'code.unique' => 'This role code is already taken.',
            'code.alpha_dash' => 'Role code can only contain letters, numbers, dashes, and underscores.',
            'display_name.max' => 'Display name cannot exceed 255 characters.',
            'scope.in' => 'Please select a valid scope.',
            'level.integer' => 'Level must be a number.',
            'level.min' => 'Level must be at least 1.',
            'level.max' => 'Level cannot exceed 100.',
            'parent_role_id.exists' => 'Selected parent role does not exist.',
            'max_users.integer' => 'Maximum users must be a number.',
            'max_users.min' => 'Maximum users must be at least 1.',
            'color.regex' => 'Please provide a valid hex color code (e.g., #FF0000).',
            'icon.max' => 'Icon name cannot exceed 50 characters.',
            'badge_text.max' => 'Badge text cannot exceed 20 characters.',
            'organization_id.required' => 'Organization is required.',
            'organization_id.exists' => 'Selected organization does not exist.',
            'permissions.*.exists' => 'One or more selected permissions do not exist.',
            'status.in' => 'Please select a valid status.',
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
            'name' => 'role name',
            'code' => 'role code',
            'display_name' => 'display name',
            'organization_id' => 'organization',
            'parent_role_id' => 'parent role',
            'max_users' => 'maximum users',
            'badge_text' => 'badge text',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Set default values
        $this->merge([
            'is_system_role' => $this->boolean('is_system_role', false),
            'is_default' => $this->boolean('is_default', false),
            'inherits_permissions' => $this->boolean('inherits_permissions', true),
            'scope' => $this->scope ?? 'organization',
            'level' => $this->level ?? 1,
            'status' => $this->status ?? 'active',
            'color' => $this->color ?? '#6B7280',
            'metadata' => $this->metadata ?? [],
        ]);
    }
}
