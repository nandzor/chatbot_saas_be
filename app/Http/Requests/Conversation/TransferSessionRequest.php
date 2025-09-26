<?php

namespace App\Http\Requests\Conversation;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class TransferSessionRequest extends FormRequest
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
            'agent_id' => [
                'required',
                'string',
                'exists:agents,id'
            ],
            'reason' => [
                'nullable',
                'string',
                'max:500'
            ],
            'notes' => [
                'nullable',
                'string',
                'max:1000'
            ],
            'priority' => [
                'nullable',
                'string',
                Rule::in(['low', 'normal', 'high', 'urgent'])
            ],
            'notify_agent' => [
                'nullable',
                'boolean'
            ]
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'agent_id.required' => 'Target agent is required.',
            'agent_id.exists' => 'Selected agent does not exist.',
            'reason.max' => 'Transfer reason cannot exceed 500 characters.',
            'notes.max' => 'Transfer notes cannot exceed 1000 characters.',
            'priority.in' => 'Priority must be one of: low, normal, high, urgent.'
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'agent_id' => 'target agent',
            'reason' => 'transfer reason',
            'notes' => 'transfer notes',
            'priority' => 'priority',
            'notify_agent' => 'notify agent'
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Set default values
        if (!$this->has('notify_agent')) {
            $this->merge(['notify_agent' => true]);
        }

        if (!$this->has('priority')) {
            $this->merge(['priority' => 'normal']);
        }
    }
}
