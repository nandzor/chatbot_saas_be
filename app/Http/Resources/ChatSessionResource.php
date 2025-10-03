<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ChatSessionResource extends JsonResource
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
            'customer_id' => $this->customer_id,
            'channel_config_id' => $this->channel_config_id,
            'agent_id' => $this->agent_id,
            'session_token' => $this->session_token,
            'session_type' => $this->session_type,
            'started_at' => $this->started_at?->toISOString(),
            'ended_at' => $this->ended_at?->toISOString(),
            'last_activity_at' => $this->last_activity_at?->toISOString(),
            'first_response_at' => $this->first_response_at?->toISOString(),
            'is_active' => $this->is_active,
            'is_bot_session' => $this->is_bot_session,
            'handover_reason' => $this->handover_reason,
            'handover_at' => $this->handover_at?->toISOString(),
            'total_messages' => $this->total_messages,
            'customer_messages' => $this->customer_messages,
            'bot_messages' => $this->bot_messages,
            'agent_messages' => $this->agent_messages,
            'response_time_avg' => $this->response_time_avg,
            'resolution_time' => $this->resolution_time,
            'wait_time' => $this->wait_time,
            'satisfaction_rating' => $this->satisfaction_rating,
            'feedback_text' => $this->feedback_text,
            'feedback_tags' => $this->feedback_tags,
            'csat_submitted_at' => $this->csat_submitted_at?->toISOString(),
            'intent' => $this->intent,
            'category' => $this->category,
            'subcategory' => $this->subcategory,
            'priority' => $this->priority,
            'tags' => $this->tags,
            'is_resolved' => $this->is_resolved,
            'resolved_at' => $this->resolved_at?->toISOString(),
            'resolution_type' => $this->resolution_type,
            'resolution_notes' => $this->resolution_notes,
            'sentiment_analysis' => $this->sentiment_analysis,
            'ai_summary' => $this->ai_summary,
            'topics_discussed' => $this->topics_discussed,
            'last_message' => $this->lastMessage() ? [
                'id' => $this->lastMessage()->id,
                'body' => $this->lastMessage()->message_text ?? $this->lastMessage()->content,
                'timestamp' => $this->lastMessage()->created_at?->toISOString(),
                'from_me' => $this->lastMessage()->sender_type === 'agent' || $this->lastMessage()->sender_type === 'bot',
                'type' => $this->lastMessage()->message_type ?? 'text'
            ] : null,
            'session_data' => $this->session_data,
            'metadata' => $this->metadata,
            'duration' => $this->duration,
            'satisfaction_percentage' => $this->satisfaction_percentage,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),

            // Relationships
            'customer' => new CustomerResource($this->whenLoaded('customer')),
            'agent' => new AgentResource($this->whenLoaded('agent')),
            'bot_personality' => new BotPersonalityResource($this->whenLoaded('botPersonality')),
            'channel_config' => new ChannelConfigResource($this->whenLoaded('channelConfig')),
            'messages' => MessageResource::collection($this->whenLoaded('messages')),
        ];
    }
}
