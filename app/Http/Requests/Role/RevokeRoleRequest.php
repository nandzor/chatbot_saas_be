<?php

namespace App\Http\Requests\Role;

use Illuminate\Foundation\Http\FormRequest;

class RevokeRoleRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return auth()->check() && auth()->user()->hasPermission('roles.revoke');
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
        ];
    }
}
