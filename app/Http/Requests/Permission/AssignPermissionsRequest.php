<?php

namespace App\Http\Requests\Permission;

use Illuminate\Foundation\Http\FormRequest;

class AssignPermissionsRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Authorization will be handled by middleware
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'permission_ids' => 'required|array|min:1',
            'permission_ids.*' => 'required|uuid|exists:permissions,id',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'permission_ids.required' => 'Permission IDs are required.',
            'permission_ids.array' => 'Permission IDs must be an array.',
            'permission_ids.min' => 'At least one permission ID must be provided.',
            'permission_ids.*.required' => 'Each permission ID is required.',
            'permission_ids.*.uuid' => 'Each permission ID must be a valid UUID.',
            'permission_ids.*.exists' => 'One or more permission IDs do not exist.',
        ];
    }

    /**
     * Get custom attribute names for validator errors.
     */
    public function attributes(): array
    {
        return [
            'permission_ids' => 'permission IDs',
        ];
    }
}
