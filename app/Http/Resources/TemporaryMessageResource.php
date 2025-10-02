<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TemporaryMessageResource extends JsonResource
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
            'chat_session_id' => $this->chat_session_id,
            'organization_id' => $this->organization_id,
            'sender_type' => $this->sender_type,
            'sender_id' => $this->sender_id,
            'sender_name' => $this->sender_name,
            'content' => $this->content,
            'message_type' => $this->message_type,
            'status' => $this->status,
            'media_url' => $this->media_url,
            'media_type' => $this->media_type,
            'media_size' => $this->media_size,
            'media_metadata' => $this->media_metadata,
            'thumbnail_url' => $this->thumbnail_url,
            'quick_replies' => $this->quick_replies,
            'buttons' => $this->buttons,
            'template_data' => $this->template_data,
            'intent' => $this->intent,
            'entities' => $this->entities,
            'confidence_score' => $this->confidence_score,
            'ai_generated' => $this->ai_generated,
            'ai_model_used' => $this->ai_model_used,
            'sentiment_score' => $this->sentiment_score,
            'sentiment_label' => $this->sentiment_label,
            'emotion_scores' => $this->emotion_scores,
            'is_read' => $this->is_read,
            'read_at' => $this->read_at?->toISOString(),
            'is_edited' => $this->is_edited,
            'edited_at' => $this->edited_at?->toISOString(),
            'delivered_at' => $this->delivered_at?->toISOString(),
            'failed_at' => $this->failed_at?->toISOString(),
            'failed_reason' => $this->failed_reason,
            'reply_to_message_id' => $this->reply_to_message_id,
            'thread_id' => $this->thread_id,
            'context' => $this->context,
            'processing_time_ms' => $this->processing_time_ms,
            'metadata' => $this->metadata,
            'human_readable_media_size' => $this->human_readable_media_size,
            'sentiment_text' => $this->sentiment_text,
            'confidence_percentage' => $this->confidence_percentage,
            'processing_time_human' => $this->processing_time_human,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),

            // No relationships for temporary messages
            'is_temporary' => true,
        ];
    }
}
