<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class BotPersonalityResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'organization_id' => $this->organization_id,
            'name' => $this->name,
            'code' => $this->code,
            'display_name' => $this->display_name,
            'description' => $this->description,
            'ai_model_id' => $this->ai_model_id,
            'language' => $this->language,
            'tone' => $this->tone,
            'communication_style' => $this->communication_style,
            'formality_level' => $this->formality_level,
            'avatar_url' => $this->avatar_url,
            'color_scheme' => $this->color_scheme,
            'greeting_message' => $this->greeting_message,
            'farewell_message' => $this->farewell_message,
            'error_message' => $this->error_message,
            'waiting_message' => $this->waiting_message,
            'transfer_message' => $this->transfer_message,
            'fallback_message' => $this->fallback_message,
            'system_message' => $this->system_message,
            'personality_traits' => $this->personality_traits,
            'custom_vocabulary' => $this->custom_vocabulary,
            'response_templates' => $this->response_templates,
            'conversation_starters' => $this->conversation_starters,
            'response_delay_ms' => $this->response_delay_ms,
            'typing_indicator' => $this->typing_indicator,
            'max_response_length' => $this->max_response_length,
            'enable_small_talk' => $this->enable_small_talk,
            'confidence_threshold' => $this->confidence_threshold,
            'learning_enabled' => $this->learning_enabled,
            'training_data_sources' => $this->training_data_sources,
            'last_trained_at' => optional($this->last_trained_at)->toISOString(),
            'total_conversations' => $this->total_conversations,
            'avg_satisfaction_score' => $this->avg_satisfaction_score,
            'success_rate' => $this->success_rate,
            'is_default' => $this->is_default,
            'status' => $this->status,
            // Workflow integration fields
            'n8n_workflow_id' => $this->n8n_workflow_id,
            'waha_session_id' => $this->waha_session_id,
            'knowledge_base_item_id' => $this->knowledge_base_item_id,
            // Integration details for professional display
            'waha_session' => $this->when($this->relationLoaded('wahaSession'), [
                'id' => $this->wahaSession?->id,
                'session_name' => $this->wahaSession?->session_name,
                'status' => $this->wahaSession?->status,
                'phone_number' => $this->wahaSession?->phone_number,
            ]),
            'knowledge_base_item' => $this->when($this->relationLoaded('knowledgeBaseItem'), [
                'id' => $this->knowledgeBaseItem?->id,
                'title' => $this->knowledgeBaseItem?->title,
                'status' => $this->knowledgeBaseItem?->status,
                'category' => $this->knowledgeBaseItem?->category,
            ]),
            'created_at' => optional($this->created_at)->toISOString(),
            'updated_at' => optional($this->updated_at)->toISOString(),
        ];
    }
}


