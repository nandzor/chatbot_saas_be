<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AgentResource extends JsonResource
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
            'user_id' => $this->user_id,
            'name' => $this->name,
            'email' => $this->email,
            'phone' => $this->phone,
            'avatar_url' => $this->avatar_url,
            'specialization' => $this->specialization,
            'languages' => $this->languages,
            'timezone' => $this->timezone,
            'working_hours' => $this->working_hours,
            'max_concurrent_chats' => $this->max_concurrent_chats,
            'current_active_chats' => $this->current_active_chats,
            'is_available' => $this->is_available,
            'is_online' => $this->is_online,
            'last_activity_at' => $this->last_activity_at?->toISOString(),
            'total_chats_handled' => $this->total_chats_handled,
            'avg_response_time' => $this->avg_response_time,
            'satisfaction_rating' => $this->satisfaction_rating,
            'skills' => $this->skills,
            'preferences' => $this->preferences,
            'status' => $this->status,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
