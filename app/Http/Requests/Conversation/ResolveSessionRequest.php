<?php

namespace App\Http\Requests\Conversation;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ResolveSessionRequest extends FormRequest
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
            'resolution_type' => [
                'required',
                'string',
                Rule::in([
                    'resolved',
                    'resolved_by_customer',
                    'resolved_by_agent',
                    'resolved_by_bot',
                    'escalated',
                    'abandoned',
                    'timeout',
                    'error',
                    'duplicate'
                ])
            ],
            'resolution_notes' => [
                'nullable',
                'string',
                'max:2000'
            ],
            'satisfaction_rating' => [
                'nullable',
                'integer',
                'between:1,5'
            ],
            'feedback_text' => [
                'nullable',
                'string',
                'max:1000'
            ],
            'feedback_tags' => [
                'nullable',
                'array',
                'max:10'
            ],
            'feedback_tags.*' => [
                'string',
                'max:50'
            ],
            'follow_up_required' => [
                'nullable',
                'boolean'
            ],
            'follow_up_date' => [
                'nullable',
                'date',
                'after:now'
            ],
            'escalation_reason' => [
                'nullable',
                'string',
                'max:500'
            ]
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'resolution_type.required' => 'Resolution type is required.',
            'resolution_type.in' => 'Invalid resolution type.',
            'resolution_notes.max' => 'Resolution notes cannot exceed 2000 characters.',
            'satisfaction_rating.between' => 'Satisfaction rating must be between 1 and 5.',
            'feedback_text.max' => 'Feedback text cannot exceed 1000 characters.',
            'feedback_tags.max' => 'Cannot have more than 10 feedback tags.',
            'feedback_tags.*.max' => 'Feedback tag cannot exceed 50 characters.',
            'follow_up_date.after' => 'Follow-up date must be in the future.',
            'escalation_reason.max' => 'Escalation reason cannot exceed 500 characters.'
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'resolution_type' => 'resolution type',
            'resolution_notes' => 'resolution notes',
            'satisfaction_rating' => 'satisfaction rating',
            'feedback_text' => 'feedback text',
            'feedback_tags' => 'feedback tags',
            'follow_up_required' => 'follow-up required',
            'follow_up_date' => 'follow-up date',
            'escalation_reason' => 'escalation reason'
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Set default values
        if (!$this->has('follow_up_required')) {
            $this->merge(['follow_up_required' => false]);
        }

        // If escalation type is selected, require escalation reason
        if ($this->get('resolution_type') === 'escalated' && !$this->has('escalation_reason')) {
            $this->merge(['escalation_reason' => 'Session escalated by agent']);
        }
    }
}
