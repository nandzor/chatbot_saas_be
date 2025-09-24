<?php

namespace App\Http\Requests\BotPersonality;

use App\Http\Requests\BaseRequest;
use Illuminate\Validation\Rule;

class CreateBotPersonalityRequest extends BaseRequest
{
    public function authorize(): bool
    {
        $user = $this->user();
        if (!$user) {
            return false;
        }
        // org_admin or super_admin can create
        return in_array($user->role, ['org_admin', 'super_admin']) || $user->hasPermission('bot_personalities.create');
    }

    public function rules(): array
    {
        $orgId = $this->user()?->organization_id;

        return [
            'name' => [
                'required', 'string', 'max:255',
                Rule::unique('bot_personalities', 'name')->where(fn($q) => $q->where('organization_id', $orgId))
            ],
            'code' => [
                'required', 'string', 'max:50',
                Rule::unique('bot_personalities', 'code')->where(fn($q) => $q->where('organization_id', $orgId))
            ],
            'display_name' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'ai_model_id' => ['nullable', 'uuid', 'exists:ai_models,id'],
            'language' => ['required', Rule::in(['indonesia', 'english', 'javanese', 'sundanese', 'balinese', 'minang', 'chinese', 'japanese', 'korean', 'spanish', 'french', 'german', 'arabic', 'thai', 'vietnamese'])],
            'tone' => ['nullable', 'string', 'max:50'],
            'communication_style' => ['nullable', 'string', 'max:50'],
            'formality_level' => ['nullable', 'string', Rule::in(['formal','informal'])],
            'avatar_url' => ['nullable', 'url', 'max:500'],
            'color_scheme' => ['nullable', 'array'],
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
}


