<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateChatSessionRequest extends FormRequest
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
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'agent_id' => 'nullable|uuid|exists:agents,id',
            'priority' => 'nullable|string|in:low,medium,high,urgent',
            'intent' => 'nullable|string|max:255',
            'category' => 'nullable|string|max:255',
            'subcategory' => 'nullable|string|max:255',
            'tags' => 'nullable|array',
            'tags.*' => 'string|max:255',
            'session_data' => 'nullable|array',
            'metadata' => 'nullable|array',
            'is_active' => 'nullable|boolean',
            'is_bot_session' => 'nullable|boolean',
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
            'agent_id.uuid' => 'Agent ID must be a valid UUID.',
            'agent_id.exists' => 'Agent not found.',
            'priority.in' => 'Priority must be one of: low, medium, high, urgent.',
        ];
    }
}
