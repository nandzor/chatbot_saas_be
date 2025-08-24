<?php

namespace App\Http\Requests\Permission;

use Illuminate\Foundation\Http\FormRequest;

class CreatePermissionGroupRequest extends FormRequest
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
            'code' => 'required|string|max:50|regex:/^[a-z_][a-z0-9_]*$/',
            'display_name' => 'sometimes|string|max:255',
            'description' => 'sometimes|nullable|string',
            'category' => 'sometimes|string|max:100',
            'parent_group_id' => 'sometimes|nullable|uuid|exists:permission_groups,id',
            'icon' => 'sometimes|nullable|string|max:50',
            'color' => 'sometimes|string|max:7|regex:/^#[0-9A-Fa-f]{6}$/',
            'sort_order' => 'sometimes|integer|min:0',
            'permission_ids' => 'sometimes|array',
            'permission_ids.*' => 'uuid|exists:permissions,id',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Group name is required.',
            'name.max' => 'Group name cannot exceed 100 characters.',
            'code.required' => 'Group code is required.',
            'code.max' => 'Group code cannot exceed 50 characters.',
            'code.regex' => 'Group code must contain only lowercase letters, numbers, and underscores, and start with a letter or underscore.',
            'parent_group_id.uuid' => 'Parent group ID must be a valid UUID.',
            'parent_group_id.exists' => 'Parent group does not exist.',
            'color.regex' => 'Color must be a valid hex color code (e.g., #FF0000).',
            'sort_order.integer' => 'Sort order must be a number.',
            'sort_order.min' => 'Sort order cannot be negative.',
            'permission_ids.array' => 'Permission IDs must be an array.',
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
            'name' => 'group name',
            'code' => 'group code',
            'display_name' => 'display name',
            'description' => 'description',
            'category' => 'category',
            'parent_group_id' => 'parent group',
            'icon' => 'icon',
            'color' => 'color',
            'permission_ids' => 'permission IDs',
        ];
    }
}
