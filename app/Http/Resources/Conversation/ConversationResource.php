<?php

namespace App\Http\Resources\Conversation;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ConversationResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'organization_id' => $this->organization_id,
            'customer' => [
                'id' => $this->customer->id ?? null,
                'name' => $this->customer->name ?? 'Unknown Customer',
                'phone' => $this->customer->phone ?? null,
                'email' => $this->customer->email ?? null,
                'avatar_url' => $this->customer->avatar_url ?? null,
            ],
            'agent' => $this->when($this->agent, function () {
                return [
                    'id' => $this->agent->id,
                    'name' => $this->agent->name,
                    'email' => $this->agent->email,
                    'avatar_url' => $this->agent->avatar_url,
                    'status' => $this->agent->status,
                ];
            }),
            'session_info' => [
                'session_token' => $this->session_token,
                'session_type' => $this->session_type,
                'started_at' => $this->started_at?->toISOString(),
                'ended_at' => $this->ended_at?->toISOString(),
                'last_activity_at' => $this->last_activity_at?->toISOString(),
                'is_active' => $this->is_active,
                'is_bot_session' => $this->is_bot_session,
                'is_resolved' => $this->is_resolved,
            ],
            'statistics' => [
                'total_messages' => $this->total_messages,
                'customer_messages' => $this->customer_messages,
                'bot_messages' => $this->bot_messages,
                'agent_messages' => $this->agent_messages,
                'response_time_avg' => $this->response_time_avg,
                'resolution_time' => $this->resolution_time,
            ],
            'classification' => [
                'intent' => $this->intent,
                'category' => $this->category,
                'subcategory' => $this->subcategory,
                'priority' => $this->priority,
                'tags' => $this->tags,
            ],
            'ai_analysis' => [
                'sentiment_analysis' => $this->sentiment_analysis,
                'ai_summary' => $this->ai_summary,
                'topics_discussed' => $this->topics_discussed,
            ],
            'messages' => $this->when($this->relationLoaded('messages'), function () {
                return MessageResource::collection($this->messages);
            }),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
