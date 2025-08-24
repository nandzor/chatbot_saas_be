<?php

namespace App\Http\Requests\Role;

use Illuminate\Foundation\Http\FormRequest;

class AssignRoleRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return auth()->check() && auth()->user()->hasPermission('roles.assign');
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'role_id' => 'required|exists:roles,id',
            'user_ids' => 'required|array|min:1',
            'user_ids.*' => 'exists:users,id',
            'is_active' => 'boolean',
            'is_primary' => 'boolean',
            'scope' => 'in:global,organization,department,team,personal',
            'scope_context' => 'nullable|string',
            'effective_from' => 'nullable|date',
            'effective_until' => 'nullable|date|after:effective_from',
            'assigned_reason' => 'nullable|string|max:500',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'role_id.required' => 'Role ID is required.',
            'role_id.exists' => 'Selected role does not exist.',
            'user_ids.required' => 'At least one user must be selected.',
            'user_ids.array' => 'Users must be an array.',
            'user_ids.min' => 'At least one user must be selected.',
            'user_ids.*.exists' => 'One or more selected users do not exist.',
            'scope.in' => 'Invalid scope value.',
            'effective_until.after' => 'Effective until date must be after effective from date.',
            'assigned_reason.max' => 'Assignment reason cannot exceed 500 characters.',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        $this->merge([
            'is_active' => $this->boolean('is_active', true),
            'is_primary' => $this->boolean('is_primary', false),
            'scope' => $this->get('scope', 'organization'),
        ]);
    }
}
