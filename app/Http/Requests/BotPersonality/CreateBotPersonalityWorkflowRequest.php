<?php

namespace App\Http\Requests\BotPersonality;

use App\Http\Requests\BaseRequest;
use Illuminate\Validation\Rule;

class CreateBotPersonalityWorkflowRequest extends BaseRequest
{
    public function authorize(): bool
    {
        $user = $this->user();
        if (!$user) {
            return false;
        }
        // org_admin or super_admin can create workflow
        return in_array($user->role, ['org_admin', 'super_admin']) || $user->hasPermission('bot_personalities.manage');
    }

    public function rules(): array
    {
        $orgId = $this->user()?->organization_id;

        return [
            'waha_session_id' => [
                'required', 'uuid', 'exists:waha_sessions,id',
                // Ensure the waha session belongs to the user's organization
                Rule::exists('waha_sessions', 'id')->where(function ($query) use ($orgId) {
                    $query->where('organization_id', $orgId);
                })
            ],
            'knowledge_base_item_id' => [
                'required', 'uuid', 'exists:knowledge_base_items,id',
                // Ensure the knowledge base item belongs to the user's organization
                Rule::exists('knowledge_base_items', 'id')->where(function ($query) use ($orgId) {
                    $query->where('organization_id', $orgId);
                })
            ],
            'name' => [
                'nullable', 'string', 'max:255',
                Rule::unique('bot_personalities', 'name')->where(fn($q) => $q->where('organization_id', $orgId))
            ],
            'code' => [
                'nullable', 'string', 'max:50',
                Rule::unique('bot_personalities', 'code')->where(fn($q) => $q->where('organization_id', $orgId))
            ],
            'display_name' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'language' => ['nullable', Rule::in(['indonesia', 'english', 'javanese', 'sundanese', 'balinese', 'minang', 'chinese', 'japanese', 'korean', 'spanish', 'french', 'german', 'arabic', 'thai', 'vietnamese'])],
            'tone' => ['nullable', 'string', 'max:50'],
            'communication_style' => ['nullable', 'string', 'max:50'],
            'formality_level' => ['nullable', 'string', Rule::in(['formal','informal','casual','friendly'])],
            'greeting_message' => ['nullable', 'string'],
            'farewell_message' => ['nullable', 'string'],
            'personality_traits' => ['nullable', 'array'],
            'response_delay_ms' => ['nullable', 'integer', 'min:0', 'max:10000'],
            'typing_indicator' => ['nullable', 'boolean'],
            'max_response_length' => ['nullable', 'integer', 'min:1', 'max:5000'],
            'enable_small_talk' => ['nullable', 'boolean'],
            'confidence_threshold' => ['nullable', 'numeric', 'min:0', 'max:1'],
            'learning_enabled' => ['nullable', 'boolean'],
            'status' => ['nullable', 'string', Rule::in(['active', 'inactive', 'suspended', 'deleted', 'pending', 'draft', 'published', 'archived'])],
        ];
    }

    public function messages(): array
    {
        return [
            'waha_session_id.required' => 'WAHA session ID is required',
            'waha_session_id.exists' => 'The selected WAHA session does not exist or does not belong to your organization',
            'knowledge_base_item_id.required' => 'Knowledge base item ID is required',
            'knowledge_base_item_id.exists' => 'The selected knowledge base item does not exist or does not belong to your organization',
            'name.unique' => 'A bot personality with this name already exists in your organization',
            'code.unique' => 'A bot personality with this code already exists in your organization',
        ];
    }
}
