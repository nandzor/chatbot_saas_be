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
            'error_message' => $this->error_message,
            'ai_model_id' => $this->ai_model_id,
            'system_message' => $this->system_message,
            'knowledge_base_item_id' => $this->knowledge_base_item_id,
            'workflow_session_id' => $this->waha_session_id,
            'n8n_workflow_id' => $this->n8n_workflow_id,
            'google_drive_integration_enabled' => $this->google_drive_integration_enabled,
            'status' => $this->status,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
