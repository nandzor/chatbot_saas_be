<?php

namespace App\Http\Requests\BotPersonality;

use App\Http\Requests\BaseRequest;
use Illuminate\Validation\Rule;

class UpdateBotPersonalityRequest extends BaseRequest
{
    public function authorize(): bool
    {
        $user = $this->user();
        if (!$user) {
            return false;
        }
        return in_array($user->role, ['org_admin', 'super_admin']) || $user->hasPermission('bot_personalities.update');
    }

    public function rules(): array
    {
        $orgId = $this->user()?->organization_id;
        $id = $this->route('id') ?? $this->route('bot_personality');

        return [
            'name' => [
                'sometimes', 'string', 'max:255',
                Rule::unique('bot_personalities', 'name')->where(fn($q) => $q->where('organization_id', $orgId))->ignore($id)
            ],
            'code' => [
                'sometimes', 'string', 'max:50',
                Rule::unique('bot_personalities', 'code')->where(fn($q) => $q->where('organization_id', $orgId))->ignore($id)
            ],
            'display_name' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'ai_model_id' => ['nullable', 'uuid', 'exists:ai_models,id'],
            'language' => ['sometimes', Rule::in(['indonesia', 'english', 'javanese', 'sundanese', 'balinese', 'minang', 'chinese', 'japanese', 'korean', 'spanish', 'french', 'german', 'arabic', 'thai', 'vietnamese'])],
            'tone' => ['nullable', 'string', 'max:50'],
            'communication_style' => ['nullable', 'string', 'max:50'],
            'formality_level' => ['nullable', 'string', Rule::in(['formal','informal'])],
            'avatar_url' => ['nullable', 'url', 'max:500'],
            'color_scheme' => ['nullable', 'array'],
            'color_scheme.primary' => ['nullable', 'string', 'max:7', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'color_scheme.secondary' => ['nullable', 'string', 'max:7', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'greeting_message' => ['nullable', 'string'],
            'farewell_message' => ['nullable', 'string'],
            'error_message' => ['nullable', 'string'],
            'waiting_message' => ['nullable', 'string'],
            'transfer_message' => ['nullable', 'string'],
            'fallback_message' => ['nullable', 'string'],
            'system_message' => ['nullable', 'string'],
            'personality_traits' => ['nullable', 'array'],
            'custom_vocabulary' => ['nullable', 'array'],
            'response_templates' => ['nullable', 'array'],
            'conversation_starters' => ['nullable', 'array'],
            'response_delay_ms' => ['nullable', 'integer', 'min:0', 'max:10000'],
            'typing_indicator' => ['nullable', 'boolean'],
            'max_response_length' => ['nullable', 'integer', 'min:1', 'max:5000'],
            'enable_small_talk' => ['nullable', 'boolean'],
            'confidence_threshold' => ['nullable', 'numeric', 'min:0', 'max:1'],
            'learning_enabled' => ['nullable', 'boolean'],
            'training_data_sources' => ['nullable', 'array'],
            'last_trained_at' => ['nullable', 'date'],
            'status' => ['nullable', 'string', Rule::in(['active', 'inactive', 'suspended', 'deleted', 'pending', 'draft', 'published', 'archived'])],
            // Workflow integration fields
            'n8n_workflow_id' => ['nullable', 'uuid', 'exists:n8n_workflows,id'],
            'waha_session_id' => ['nullable', 'uuid', 'exists:waha_sessions,id'],
            'knowledge_base_item_id' => ['nullable', 'uuid', 'exists:knowledge_base_items,id'],
        ];
    }

    public function messages(): array
    {
        return [
            'color_scheme.primary.regex' => 'Primary color must be a valid hex color code (e.g., #3B82F6).',
            'color_scheme.secondary.regex' => 'Secondary color must be a valid hex color code (e.g., #10B981).',
        ];
    }
}


