<?php

namespace App\Http\Requests\Role;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Auth;

class UpdateRoleRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        return Auth::check() && $user && $user->hasPermission('roles.update');
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        $roleId = $this->route('id');

        return [
            // Basic Information
            'name' => [
                'sometimes',
                'string',
                'max:255',
                Rule::unique('roles', 'name')->where(function ($query) {
                    return $query->where('organization_id', Auth::user()->organization_id);
                })->ignore($roleId)
            ],
            'code' => [
                'sometimes',
                'string',
                'max:100',
                'regex:/^[a-z0-9_]+$/',
                Rule::unique('roles', 'code')->where(function ($query) {
                    return $query->where('organization_id', Auth::user()->organization_id);
                })->ignore($roleId)
            ],
            'display_name' => 'sometimes|string|max:255',
            'description' => 'nullable|string|max:1000',

            // Role Configuration
            'scope' => [
                'sometimes',
                'string',
                Rule::in(['global', 'organization', 'department', 'team', 'personal']),
            ],
            'level' => 'sometimes|integer|min:1|max:100',
            'is_system_role' => 'boolean',
            'is_default' => 'boolean',
            'status' => [
                'sometimes',
                'string',
                Rule::in(['active', 'inactive', 'suspended', 'deleted', 'pending', 'draft', 'published', 'archived']),
            ],

            // Access Control
            'max_users' => 'nullable|integer|min:1',
            'inherits_permissions' => 'boolean',

            // Inheritance
            'parent_role_id' => 'nullable|uuid|exists:roles,id',

            // UI/UX
            'color' => 'nullable|string|max:7|regex:/^#[0-9A-F]{6}$/i',
            'icon' => 'nullable|string|max:50',
            'badge_text' => 'nullable|string|max:20',

            // Organization
            'organization_id' => 'nullable|uuid|exists:organizations,id',

            // Metadata
            'metadata' => 'nullable|array',
            'metadata.updated_via' => 'nullable|string|max:50',
            'metadata.updated_by' => 'nullable|string|max:100',
            'metadata.icon' => 'nullable|string|max:50',
            'metadata.badge_text' => 'nullable|string|max:20',
            'metadata.system_role' => 'nullable|boolean',
            'metadata.dangerous_role' => 'nullable|boolean',

            // Frontend compatibility field
            'is_active' => 'boolean',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Role name is required.',
            'name.max' => 'Role name cannot exceed 255 characters.',
            'name.unique' => 'A role with this name already exists.',
            'code.required' => 'Role code is required.',
            'code.max' => 'Role code cannot exceed 100 characters.',
            'code.regex' => 'Role code must contain only lowercase letters, numbers, and underscores.',
            'code.unique' => 'A role with this code already exists.',
            'display_name.max' => 'Display name cannot exceed 255 characters.',
            'description.max' => 'Description cannot exceed 1000 characters.',
            'scope.in' => 'Please select a valid scope.',
            'level.integer' => 'Level must be a number.',
            'level.min' => 'Level must be at least 1.',
            'level.max' => 'Level cannot exceed 100.',
            'status.in' => 'Please select a valid status.',
            'max_users.integer' => 'Maximum users must be a number.',
            'max_users.min' => 'Maximum users must be at least 1.',
            'parent_role_id.exists' => 'Selected parent role does not exist.',
            'color.regex' => 'Please provide a valid hex color code (e.g., #FF0000).',
            'icon.max' => 'Icon name cannot exceed 50 characters.',
            'badge_text.max' => 'Badge text cannot exceed 20 characters.',
            'organization_id.exists' => 'Selected organization does not exist.',
            'metadata.array' => 'Metadata must be an array.',
            'metadata.updated_via.max' => 'Updated via cannot exceed 50 characters.',
            'metadata.updated_by.max' => 'Updated by cannot exceed 100 characters.',
            'metadata.icon.max' => 'Metadata icon cannot exceed 50 characters.',
            'metadata.badge_text.max' => 'Metadata badge text cannot exceed 20 characters.',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'name' => 'role name',
            'code' => 'role code',
            'display_name' => 'display name',
            'description' => 'description',
            'scope' => 'scope',
            'level' => 'level',
            'is_system_role' => 'system role',
            'is_default' => 'default role',
            'status' => 'status',
            'max_users' => 'maximum users',
            'inherits_permissions' => 'inherit permissions',
            'parent_role_id' => 'parent role',
            'color' => 'color',
            'icon' => 'icon',
            'badge_text' => 'badge text',
            'organization_id' => 'organization',
            'metadata' => 'metadata',
            'is_active' => 'active status',
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
            'is_active' => $this->boolean('is_active', true),
        ]);

        // Handle metadata defaults
        if ($this->has('metadata') && is_array($this->metadata)) {
            $metadata = array_merge([
                'updated_via' => 'manual',
                'updated_by' => Auth::user()?->id ?? 'system',
            ], $this->metadata);

            $this->merge(['metadata' => $metadata]);
        }
    }
}
