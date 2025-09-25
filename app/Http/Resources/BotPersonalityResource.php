<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BotPersonalityResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'organization_id' => $this->organization_id,
            'name' => $this->name,
            'description' => $this->description,
            'personality_traits' => $this->personality_traits,
            'communication_style' => $this->communication_style,
            'tone' => $this->tone,
            'language' => $this->language,
            'greeting_message' => $this->greeting_message,
            'fallback_message' => $this->fallback_message,
            'escalation_message' => $this->escalation_message,
            'ai_model_id' => $this->ai_model_id,
            'temperature' => $this->temperature,
            'max_tokens' => $this->max_tokens,
            'system_prompt' => $this->system_prompt,
            'knowledge_base_ids' => $this->knowledge_base_ids,
            'workflow_session_id' => $this->workflow_session_id,
            'is_active' => $this->is_active,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
