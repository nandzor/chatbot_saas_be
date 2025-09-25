<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CustomerResource extends JsonResource
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
            'external_id' => $this->external_id,
            'name' => $this->name,
            'first_name' => $this->first_name,
            'last_name' => $this->last_name,
            'email' => $this->email,
            'phone' => $this->phone,
            'channel' => $this->channel,
            'channel_user_id' => $this->channel_user_id,
            'avatar_url' => $this->avatar_url,
            'language' => $this->language,
            'timezone' => $this->timezone,
            'profile_data' => $this->profile_data,
            'preferences' => $this->preferences,
            'tags' => $this->tags,
            'segments' => $this->segments,
            'source' => $this->source,
            'utm_data' => $this->utm_data,
            'last_interaction_at' => $this->last_interaction_at?->toISOString(),
            'total_interactions' => $this->total_interactions,
            'total_messages' => $this->total_messages,
            'avg_response_time' => $this->avg_response_time,
            'satisfaction_score' => $this->satisfaction_score,
            'interaction_patterns' => $this->interaction_patterns,
            'interests' => $this->interests,
            'purchase_history' => $this->purchase_history,
            'sentiment_history' => $this->sentiment_history,
            'intent_patterns' => $this->intent_patterns,
            'engagement_score' => $this->engagement_score,
            'notes' => $this->notes,
            'status' => $this->status,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
