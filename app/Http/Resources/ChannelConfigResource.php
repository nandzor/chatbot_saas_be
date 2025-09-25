<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ChannelConfigResource extends JsonResource
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
            'personality_id' => $this->personality_id,
            'channel' => $this->channel,
            'channel_name' => $this->channel_name,
            'webhook_url' => $this->webhook_url,
            'api_credentials' => $this->api_credentials,
            'settings' => $this->settings,
            'is_active' => $this->is_active,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
