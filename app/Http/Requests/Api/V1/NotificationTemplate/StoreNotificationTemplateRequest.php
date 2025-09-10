<?php

namespace App\Http\Requests\Api\V1\NotificationTemplate;

use Illuminate\Foundation\Http\FormRequest;

class StoreNotificationTemplateRequest extends FormRequest
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
            'name' => 'required|string|max:100|unique:notification_templates,name',
            'type' => 'required|string|in:email,sms,push,webhook',
            'category' => 'required|string|max:50',
            'subject' => 'nullable|string|max:255',
            'body' => 'required|string',
            'variables' => 'nullable|array',
            'variables.*' => 'string',
            'settings' => 'nullable|array',
            'is_active' => 'sometimes|boolean',
            'language' => 'sometimes|string|in:id,en',
            'version' => 'sometimes|string|max:20',
            'description' => 'nullable|string|max:500',
            'metadata' => 'nullable|array',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Name is required',
            'name.max' => 'Name must not exceed 100 characters',
            'name.unique' => 'Name already exists',
            'type.required' => 'Type is required',
            'type.in' => 'Type must be one of: email, sms, push, webhook',
            'category.required' => 'Category is required',
            'category.max' => 'Category must not exceed 50 characters',
            'subject.max' => 'Subject must not exceed 255 characters',
            'body.required' => 'Body is required',
            'variables.array' => 'Variables must be an array',
            'variables.*.string' => 'Each variable must be a string',
            'settings.array' => 'Settings must be an array',
            'is_active.boolean' => 'Is active must be a boolean',
            'language.in' => 'Language must be one of: id, en',
            'version.max' => 'Version must not exceed 20 characters',
            'description.max' => 'Description must not exceed 500 characters',
            'metadata.array' => 'Metadata must be an array',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'is_active' => 'is active',
        ];
    }
}
