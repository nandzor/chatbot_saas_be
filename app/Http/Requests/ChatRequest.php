<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ChatRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Chat endpoint should be accessible to authenticated users
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'message' => 'required|string|max:2000',
            'session_id' => 'nullable|uuid|exists:chat_sessions,id',
            'customer_id' => 'nullable|uuid|exists:customers,id',
            'metadata' => 'nullable|array',
            'metadata.*' => 'nullable|string|max:500',

            // Optional context for better responses
            'context' => 'nullable|array',
            'context.previous_messages' => 'nullable|array',
            'context.previous_messages.*' => 'nullable|string|max:1000',
            'context.user_preferences' => 'nullable|array',
            'context.conversation_history' => 'nullable|array',

            // Optional parameters for response customization
            'response_type' => 'nullable|string|in:text,rich,interactive',
            'include_suggestions' => 'nullable|boolean',
            'max_response_length' => 'nullable|integer|min:50|max:2000',
            'language_override' => 'nullable|string|max:10'
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'message.required' => 'Message is required.',
            'message.max' => 'Message cannot exceed 2000 characters.',
            'session_id.uuid' => 'Session ID must be a valid UUID.',
            'session_id.exists' => 'Session not found.',
            'customer_id.uuid' => 'Customer ID must be a valid UUID.',
            'customer_id.exists' => 'Customer not found.',
            'metadata.*.max' => 'Metadata values cannot exceed 500 characters.',
            'context.previous_messages.*.max' => 'Previous messages cannot exceed 1000 characters.',
            'response_type.in' => 'Response type must be one of: text, rich, interactive.',
            'max_response_length.min' => 'Maximum response length must be at least 50 characters.',
            'max_response_length.max' => 'Maximum response length cannot exceed 2000 characters.',
            'language_override.max' => 'Language override cannot exceed 10 characters.'
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'session_id' => 'session ID',
            'customer_id' => 'customer ID',
            'response_type' => 'response type',
            'max_response_length' => 'maximum response length',
            'language_override' => 'language override'
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Set default values
        $this->merge([
            'response_type' => $this->response_type ?? 'text',
            'include_suggestions' => $this->include_suggestions ?? true,
            'max_response_length' => $this->max_response_length ?? 1000
        ]);

        // Trim message whitespace
        if ($this->has('message')) {
            $this->merge([
                'message' => trim($this->message)
            ]);
        }
    }
}
