<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreateConversationRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->hasPermission('conversations.create');
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'customer_id' => 'nullable|uuid|exists:customers,id',
            'agent_id' => 'nullable|uuid|exists:agents,id',
            'bot_personality_id' => 'nullable|uuid|exists:bot_personalities,id',
            'channel_config_id' => 'nullable|uuid|exists:channel_configs,id',
            'session_type' => 'required|string|in:customer,agent,bot,hybrid',
            'session_token' => 'nullable|string|max:255',
            'started_at' => 'nullable|date',
            'is_active' => 'nullable|boolean',
            'is_bot_session' => 'nullable|boolean',
            'priority' => 'nullable|string|in:low,medium,high,urgent',
            'category' => 'nullable|string|max:100',
            'subcategory' => 'nullable|string|max:100',
            'tags' => 'nullable|array',
            'tags.*' => 'string|max:50',
            'metadata' => 'nullable|array',
            'session_data' => 'nullable|array'
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'customer_id.uuid' => 'Customer ID must be a valid UUID.',
            'customer_id.exists' => 'Customer not found.',
            'agent_id.uuid' => 'Agent ID must be a valid UUID.',
            'agent_id.exists' => 'Agent not found.',
            'bot_personality_id.uuid' => 'Bot personality ID must be a valid UUID.',
            'bot_personality_id.exists' => 'Bot personality not found.',
            'channel_config_id.uuid' => 'Channel config ID must be a valid UUID.',
            'channel_config_id.exists' => 'Channel config not found.',
            'session_type.required' => 'Session type is required.',
            'session_type.in' => 'Session type must be one of: customer, agent, bot, hybrid.',
            'started_at.date' => 'Started at must be a valid date.',
            'priority.in' => 'Priority must be one of: low, medium, high, urgent.',
            'category.max' => 'Category cannot exceed 100 characters.',
            'subcategory.max' => 'Subcategory cannot exceed 100 characters.',
            'tags.*.max' => 'Each tag cannot exceed 50 characters.',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'customer_id' => 'customer ID',
            'agent_id' => 'agent ID',
            'bot_personality_id' => 'bot personality ID',
            'channel_config_id' => 'channel config ID',
            'session_type' => 'session type',
            'started_at' => 'started at',
            'is_active' => 'is active',
            'is_bot_session' => 'is bot session',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Set default values
        $this->merge([
            'session_type' => $this->session_type ?? 'customer',
            'is_active' => $this->is_active ?? true,
            'is_bot_session' => $this->is_bot_session ?? false,
            'started_at' => $this->started_at ?? now(),
            'priority' => $this->priority ?? 'medium',
        ]);
    }
}
