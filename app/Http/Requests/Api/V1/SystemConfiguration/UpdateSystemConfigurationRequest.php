<?php

namespace App\Http\Requests\Api\V1\SystemConfiguration;

use Illuminate\Foundation\Http\FormRequest;

class UpdateSystemConfigurationRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'category' => 'sometimes|string|max:100',
            'key' => 'sometimes|string|max:100|unique:system_configurations,key,' . $this->route('systemConfiguration')->id,
            'value' => 'sometimes',
            'type' => 'sometimes|string|in:string,integer,float,boolean,json,array',
            'description' => 'nullable|string|max:500',
            'is_public' => 'sometimes|boolean',
            'is_editable' => 'sometimes|boolean',
            'validation_rules' => 'nullable|array',
            'options' => 'nullable|array',
            'default_value' => 'nullable|string|max:500',
            'sort_order' => 'sometimes|integer|min:0',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'category.max' => 'Category must not exceed 100 characters',
            'key.max' => 'Key must not exceed 100 characters',
            'key.unique' => 'Key already exists',
            'type.in' => 'Type must be one of: string, integer, float, boolean, json, array',
            'description.max' => 'Description must not exceed 500 characters',
            'is_public.boolean' => 'Is public must be a boolean',
            'is_editable.boolean' => 'Is editable must be a boolean',
            'validation_rules.array' => 'Validation rules must be an array',
            'options.array' => 'Options must be an array',
            'default_value.max' => 'Default value must not exceed 500 characters',
            'sort_order.integer' => 'Sort order must be an integer',
            'sort_order.min' => 'Sort order must be at least 0',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'is_public' => 'is public',
            'is_editable' => 'is editable',
            'validation_rules' => 'validation rules',
            'default_value' => 'default value',
            'sort_order' => 'sort order',
        ];
    }
}
