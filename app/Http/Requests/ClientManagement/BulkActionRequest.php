<?php

namespace App\Http\Requests\ClientManagement;

use Illuminate\Foundation\Http\FormRequest;

class BulkActionRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Authorization handled by middleware
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'action' => 'required|in:activate,suspend,delete,export,import',
            'organization_ids' => 'required|array|min:1',
            'organization_ids.*' => 'required|string|exists:organizations,id',
            'reason' => 'nullable|string|max:500',
            'notify_users' => 'nullable|boolean'
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'action.required' => 'Action is required.',
            'action.in' => 'Invalid action. Allowed actions are: activate, suspend, delete, export, import.',
            'organization_ids.required' => 'At least one organization must be selected.',
            'organization_ids.array' => 'Organization IDs must be provided as an array.',
            'organization_ids.min' => 'At least one organization must be selected.',
            'organization_ids.*.required' => 'Organization ID is required.',
            'organization_ids.*.string' => 'Organization ID must be a string.',
            'organization_ids.*.exists' => 'One or more selected organizations do not exist.',
            'reason.max' => 'Reason may not be greater than 500 characters.'
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'action' => 'action',
            'organization_ids' => 'organization IDs',
            'organization_ids.*' => 'organization ID',
            'reason' => 'reason',
            'notify_users' => 'notify users'
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Ensure organization_ids is an array
        if ($this->has('organization_ids') && !is_array($this->organization_ids)) {
            $this->merge([
                'organization_ids' => [$this->organization_ids]
            ]);
        }
    }
}
