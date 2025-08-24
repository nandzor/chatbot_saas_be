<?php

namespace App\Http\Requests\Role;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateRoleRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return auth()->check() && auth()->user()->hasPermission('roles.update');
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        $roleId = $this->route('id');

        return [
            'name' => [
                'sometimes',
                'string',
                'max:255',
                Rule::unique('roles', 'name')->where(function ($query) {
                    return $query->where('organization_id', auth()->user()->organization_id);
                })->ignore($roleId)
            ],
            'code' => [
                'sometimes',
                'string',
                'max:100',
                'regex:/^[a-z_]+$/',
                Rule::unique('roles', 'code')->where(function ($query) {
                    return $query->where('organization_id', auth()->user()->organization_id);
                })->ignore($roleId)
            ],
            'display_name' => 'sometimes|string|max:255',
            'description' => 'nullable|string|max:1000',
            'level' => 'sometimes|integer|min:1|max:100',
            'scope' => 'sometimes|in:global,organization,department,team,personal',
            'is_active' => 'boolean',
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
            'name.unique' => 'A role with this name already exists.',
            'code.regex' => 'Role code must contain only lowercase letters and underscores.',
            'code.unique' => 'A role with this code already exists.',
            'level.min' => 'Role level must be at least 1.',
            'level.max' => 'Role level cannot exceed 100.',
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
            'is_active' => $this->boolean('is_active'),
        ]);
    }
}
