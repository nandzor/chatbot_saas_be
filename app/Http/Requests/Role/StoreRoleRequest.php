<?php

namespace App\Http\Requests\Role;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreRoleRequest extends FormRequest
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
     */
    public function rules(): array
    {
        return [
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('roles', 'name')->where(function ($query) {
                    return $query->where('organization_id', auth()->user()->organization_id);
                })
            ],
            'code' => [
                'required',
                'string',
                'max:100',
                'regex:/^[a-z_]+$/',
                Rule::unique('roles', 'code')->where(function ($query) {
                    return $query->where('organization_id', auth()->user()->organization_id);
                })
            ],
            'display_name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'level' => 'required|integer|min:1|max:100',
            'scope' => 'required|in:global,organization,department,team,personal',
            'is_active' => 'boolean',
            'is_system_role' => 'boolean',
            'permission_ids' => 'nullable|array',
            'permission_ids.*' => 'exists:permissions,id',
            'metadata' => 'nullable|array',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Role name is required.',
            'name.unique' => 'A role with this name already exists.',
            'code.required' => 'Role code is required.',
            'code.regex' => 'Role code must contain only lowercase letters and underscores.',
            'code.unique' => 'A role with this code already exists.',
            'display_name.required' => 'Display name is required.',
            'level.required' => 'Role level is required.',
            'level.min' => 'Role level must be at least 1.',
            'level.max' => 'Role level cannot exceed 100.',
            'scope.required' => 'Role scope is required.',
            'scope.in' => 'Invalid role scope.',
            'permission_ids.array' => 'Permissions must be an array.',
            'permission_ids.*.exists' => 'One or more selected permissions do not exist.',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        $this->merge([
            'organization_id' => auth()->user()->organization_id,
            'is_active' => $this->boolean('is_active', true),
            'is_system_role' => $this->boolean('is_system_role', false),
        ]);
    }
}
