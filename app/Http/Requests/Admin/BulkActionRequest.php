<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class BulkActionRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return auth()->check() && auth()->user()->hasPermission('users.bulk_action');
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'action' => [
                'required',
                'string',
                'in:activate,deactivate,delete,restore,send_welcome_email',
            ],
            'user_ids' => [
                'required',
                'array',
                'min:1',
                'max:100',
            ],
            'user_ids.*' => [
                'required',
                'uuid',
                'exists:users,id',
            ],
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'action.required' => 'Action is required.',
            'action.in' => 'Please select a valid action.',
            'user_ids.required' => 'User IDs are required.',
            'user_ids.array' => 'User IDs must be an array.',
            'user_ids.min' => 'At least one user must be selected.',
            'user_ids.max' => 'Maximum 100 users can be processed at once.',
            'user_ids.*.required' => 'User ID is required.',
            'user_ids.*.uuid' => 'Invalid user ID format.',
            'user_ids.*.exists' => 'One or more selected users do not exist.',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     *
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'action' => 'bulk action',
            'user_ids' => 'user IDs',
        ];
    }
}
