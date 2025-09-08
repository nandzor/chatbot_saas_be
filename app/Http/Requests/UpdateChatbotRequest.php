<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateChatbotRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->hasPermission('bots.update');
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $chatbotId = $this->route('id');
        $organizationId = $this->user()->organization_id;

        return [
            'name' => 'sometimes|string|max:255',
            'code' => [
                'sometimes',
                'string',
                'max:50',
                Rule::unique('bot_personalities', 'code')
                    ->where('organization_id', $organizationId)
                    ->ignore($chatbotId)
            ],
            'display_name' => 'nullable|string|max:255',
            'description' => 'nullable|string|max:1000',

            // AI Model Configuration
            'ai_model_id' => 'sometimes|uuid|exists:ai_models,id',

            // Language & Communication
            'language' => [
                'sometimes',
                Rule::in(['indonesia', 'english', 'javanese', 'sundanese', 'balinese', 'minang', 'chinese', 'japanese', 'korean', 'spanish', 'french', 'german', 'arabic', 'thai', 'vietnamese'])
            ],
            'tone' => 'nullable|string|max:50',
            'communication_style' => 'nullable|string|max:50',
            'formality_level' => 'nullable|string|in:formal,informal,casual,professional',

            // UI Customization
            'avatar_url' => 'nullable|url|max:500',
            'color_scheme' => 'nullable|array',
            'color_scheme.primary' => 'nullable|string|max:7|regex:/^#[0-9A-Fa-f]{6}$/',
            'color_scheme.secondary' => 'nullable|string|max:7|regex:/^#[0-9A-Fa-f]{6}$/',

            // Messages & Responses
            'greeting_message' => 'nullable|string|max:1000',
            'farewell_message' => 'nullable|string|max:1000',
            'error_message' => 'nullable|string|max:1000',
            'waiting_message' => 'nullable|string|max:1000',
            'transfer_message' => 'nullable|string|max:1000',
            'fallback_message' => 'nullable|string|max:1000',

            // AI Configuration
            'system_message' => 'nullable|string|max:2000',
            'personality_traits' => 'nullable|array',
            'custom_vocabulary' => 'nullable|array',
            'response_templates' => 'nullable|array',
            'conversation_starters' => 'nullable|array',
            'conversation_starters.*' => 'string|max:200',

            // Behavior Settings
            'response_delay_ms' => 'nullable|integer|min:0|max:10000',
            'typing_indicator' => 'nullable|boolean',
            'max_response_length' => 'nullable|integer|min:50|max:5000',
            'enable_small_talk' => 'nullable|boolean',
            'confidence_threshold' => 'nullable|numeric|min:0|max:1',

            // Learning & Training
            'learning_enabled' => 'nullable|boolean',
            'training_data_sources' => 'nullable|array',
            'training_data_sources.*' => 'string|max:100',

            // Status
            'is_active' => 'nullable|boolean',
            'status' => 'nullable|string|in:active,inactive,draft,published,archived'
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'name.max' => 'Chatbot name cannot exceed 255 characters.',
            'code.unique' => 'This chatbot code is already taken in your organization.',
            'ai_model_id.exists' => 'Selected AI model does not exist.',
            'language.in' => 'Selected language is not supported.',
            'formality_level.in' => 'Formality level must be one of: formal, informal, casual, professional.',
            'avatar_url.url' => 'Avatar URL must be a valid URL.',
            'color_scheme.primary.regex' => 'Primary color must be a valid hex color code.',
            'color_scheme.secondary.regex' => 'Secondary color must be a valid hex color code.',
            'response_delay_ms.min' => 'Response delay cannot be negative.',
            'response_delay_ms.max' => 'Response delay cannot exceed 10 seconds.',
            'max_response_length.min' => 'Maximum response length must be at least 50 characters.',
            'max_response_length.max' => 'Maximum response length cannot exceed 5000 characters.',
            'confidence_threshold.min' => 'Confidence threshold must be between 0 and 1.',
            'confidence_threshold.max' => 'Confidence threshold must be between 0 and 1.',
            'status.in' => 'Status must be one of: active, inactive, draft, published, archived.'
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'ai_model_id' => 'AI model',
            'color_scheme.primary' => 'primary color',
            'color_scheme.secondary' => 'secondary color',
            'response_delay_ms' => 'response delay',
            'max_response_length' => 'maximum response length',
            'confidence_threshold' => 'confidence threshold',
            'training_data_sources' => 'training data sources'
        ];
    }
}
