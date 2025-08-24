<?php

namespace App\Http\Requests\Permission;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CreatePermissionRequest extends FormRequest
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
            'name' => 'required|string|max:100',
            'code' => 'required|string|max:100|regex:/^[a-z_][a-z0-9_]*$/',
            'display_name' => 'sometimes|string|max:255',
            'description' => 'sometimes|nullable|string',
            'resource' => 'required|string|max:100',
            'action' => 'required|string|max:100',
            'scope' => 'sometimes|string|in:global,organization,department,team,personal',
            'conditions' => 'sometimes|array',
            'constraints' => 'sometimes|array',
            'category' => 'sometimes|string|max:100',
            'group_name' => 'sometimes|nullable|string|max:100',
            'is_system_permission' => 'sometimes|boolean',
            'is_dangerous' => 'sometimes|boolean',
            'requires_approval' => 'sometimes|boolean',
            'sort_order' => 'sometimes|integer|min:0',
            'is_visible' => 'sometimes|boolean',
            'metadata' => 'sometimes|array',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Permission name is required.',
            'name.max' => 'Permission name cannot exceed 100 characters.',
            'code.required' => 'Permission code is required.',
            'code.max' => 'Permission code cannot exceed 100 characters.',
            'code.regex' => 'Permission code must contain only lowercase letters, numbers, and underscores, and start with a letter or underscore.',
            'resource.required' => 'Resource is required.',
            'resource.max' => 'Resource cannot exceed 100 characters.',
            'action.required' => 'Action is required.',
            'action.max' => 'Action cannot exceed 100 characters.',
            'scope.in' => 'Scope must be one of: global, organization, department, team, personal.',
            'sort_order.integer' => 'Sort order must be a number.',
            'sort_order.min' => 'Sort order cannot be negative.',
        ];
    }

    /**
     * Get custom attribute names for validator errors.
     */
    public function attributes(): array
    {
        return [
            'name' => 'permission name',
            'code' => 'permission code',
            'display_name' => 'display name',
            'description' => 'description',
            'resource' => 'resource',
            'action' => 'action',
            'scope' => 'scope',
            'category' => 'category',
            'group_name' => 'group name',
        ];
    }
}
