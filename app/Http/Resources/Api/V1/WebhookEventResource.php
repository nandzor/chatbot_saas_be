<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class WebhookEventResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'organization_id' => $this->organization_id,
            'subscription_id' => $this->subscription_id,
            'gateway' => $this->gateway,
            'gateway_display_name' => $this->gateway_display_name,
            'event_type' => $this->event_type,
            'event_type_display_name' => $this->event_type_display_name,
            'event_id' => $this->event_id,
            'status' => $this->status,
            'status_color' => $this->status_color,
            'status_icon' => $this->status_icon,
            'payload' => $this->payload,
            'payload_data' => $this->payload_data,
            'signature' => $this->signature,
            'processed_at' => $this->processed_at?->toISOString(),
            'retry_count' => $this->retry_count,
            'next_retry_at' => $this->next_retry_at?->toISOString(),
            'error_message' => $this->error_message,
            'metadata' => $this->metadata,
            'is_processed' => $this->is_processed,
            'is_failed' => $this->is_failed,
            'is_pending' => $this->is_pending,
            'is_retrying' => $this->is_retrying,
            'can_retry' => $this->can_retry,
            'retry_delay_minutes' => $this->getRetryDelayMinutes(),
            'is_expired' => $this->isExpired(),
            'created_at' => $this->created_at->toISOString(),
            'updated_at' => $this->updated_at->toISOString(),
            'deleted_at' => $this->deleted_at?->toISOString(),

            // Relationships
            'organization' => $this->whenLoaded('organization'),
            'subscription' => $this->whenLoaded('subscription'),
        ];
    }
}
