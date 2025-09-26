<?php

namespace App\Http\Resources\Conversation;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MessageResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'session_id' => $this->session_id,
            'sender' => [
                'type' => $this->sender_type,
                'id' => $this->sender_id,
                'name' => $this->sender_name,
            ],
            'content' => [
                'text' => $this->message_text,
                'type' => $this->message_type,
                'media_url' => $this->media_url,
                'media_type' => $this->media_type,
                'media_size' => $this->media_size,
            ],
            'status' => [
                'is_read' => $this->is_read,
                'read_at' => $this->read_at?->toISOString(),
                'delivered_at' => $this->delivered_at?->toISOString(),
                'failed_at' => $this->failed_at?->toISOString(),
            ],
            'ai_analysis' => [
                'intent' => $this->intent,
                'confidence_score' => $this->confidence_score,
                'sentiment_score' => $this->sentiment_score,
                'sentiment_label' => $this->sentiment_label,
                'ai_generated' => $this->ai_generated,
            ],
            'metadata' => $this->metadata,
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
