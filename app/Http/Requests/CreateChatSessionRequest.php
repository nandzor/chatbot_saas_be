<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreateChatSessionRequest extends FormRequest
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
            'customer_id' => 'required|uuid|exists:customers,id',
            'channel_config_id' => 'required|uuid|exists:channel_configs,id',
            'agent_id' => 'nullable|uuid|exists:agents,id',
            'session_type' => 'required|string|in:chat,voice,video,email',
            'priority' => 'nullable|string|in:low,medium,high,urgent',
            'intent' => 'nullable|string|max:255',
            'category' => 'nullable|string|max:255',
            'subcategory' => 'nullable|string|max:255',
            'tags' => 'nullable|array',
            'tags.*' => 'string|max:255',
            'session_data' => 'nullable|array',
            'metadata' => 'nullable|array',
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
            'customer_id.required' => 'Customer ID is required.',
            'customer_id.uuid' => 'Customer ID must be a valid UUID.',
            'customer_id.exists' => 'Customer not found.',
            'channel_config_id.required' => 'Channel configuration ID is required.',
            'channel_config_id.uuid' => 'Channel configuration ID must be a valid UUID.',
            'channel_config_id.exists' => 'Channel configuration not found.',
            'agent_id.uuid' => 'Agent ID must be a valid UUID.',
            'agent_id.exists' => 'Agent not found.',
            'session_type.required' => 'Session type is required.',
            'session_type.in' => 'Session type must be one of: chat, voice, video, email.',
            'priority.in' => 'Priority must be one of: low, medium, high, urgent.',
        ];
    }
}
