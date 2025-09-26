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
            'organization_id' => $this->organization_id,

            // Sender information
            'sender' => [
                'type' => $this->sender_type,
                'id' => $this->sender_id,
                'name' => $this->sender_name,
                'avatar' => $this->getSenderAvatar(),
            ],

            // Message content
            'content' => [
                'text' => $this->message_text,
                'type' => $this->message_type,
                'media_url' => $this->media_url,
                'media_type' => $this->media_type,
                'media_size' => $this->media_size,
                'media_size_human' => $this->human_readable_media_size,
                'thumbnail_url' => $this->thumbnail_url,
                'quick_replies' => $this->quick_replies,
                'buttons' => $this->buttons,
                'template_data' => $this->template_data,
            ],

            // Message status
            'status' => [
                'is_read' => $this->is_read,
                'read_at' => $this->read_at?->toISOString(),
                'delivered_at' => $this->delivered_at?->toISOString(),
                'failed_at' => $this->failed_at?->toISOString(),
                'failed_reason' => $this->failed_reason,
                'is_edited' => $this->is_edited ?? false,
                'edited_at' => $this->edited_at?->toISOString(),
            ],

            // AI analysis
            'ai_analysis' => [
                'intent' => $this->intent,
                'entities' => $this->entities,
                'confidence_score' => $this->confidence_score,
                'confidence_percentage' => $this->confidence_percentage,
                'sentiment_score' => $this->sentiment_score,
                'sentiment_label' => $this->sentiment_label,
                'sentiment_text' => $this->sentiment_text,
                'emotion_scores' => $this->emotion_scores,
                'ai_generated' => $this->ai_generated,
                'ai_model_used' => $this->ai_model_used,
            ],

            // WhatsApp specific data
            'whatsapp' => $this->getWhatsAppData(),

            // Reply information
            'reply' => [
                'is_reply' => $this->isReply(),
                'reply_to_message_id' => $this->reply_to_message_id,
                'thread_id' => $this->thread_id,
            ],

            // Context and metadata
            'context' => $this->context,
            'metadata' => $this->metadata,
            'processing_time_ms' => $this->processing_time_ms,
            'processing_time_human' => $this->processing_time_human,

            // Timestamps
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }

    /**
     * Get sender avatar URL
     */
    private function getSenderAvatar(): ?string
    {
        if ($this->sender_type === 'customer' && $this->relationLoaded('customer')) {
            return $this->customer?->avatar_url;
        }

        if ($this->sender_type === 'agent' && $this->relationLoaded('agent')) {
            return $this->agent?->avatar_url;
        }

        if ($this->sender_type === 'bot' && $this->relationLoaded('botPersonality')) {
            return $this->botPersonality?->avatar_url;
        }

        return null;
    }

    /**
     * Get WhatsApp specific data
     */
    private function getWhatsAppData(): array
    {
        $wahaData = $this->metadata['waha_data'] ?? [];

        return [
            'waha_message_id' => $wahaData['waha_message_id'] ?? null,
            'waha_session' => $wahaData['waha_session'] ?? null,
            'waha_event_id' => $wahaData['waha_event_id'] ?? null,
            'from_me' => $wahaData['from_me'] ?? false,
            'source' => $wahaData['source'] ?? null,
            'participant' => $wahaData['participant'] ?? null,
            'ack' => $wahaData['ack'] ?? null,
            'ack_name' => $wahaData['ack_name'] ?? null,
            'has_media' => $wahaData['has_media'] ?? false,
            'media' => $wahaData['media'] ?? null,
            'phone_number' => $wahaData['phone_number'] ?? null,
            'timestamp' => $wahaData['timestamp'] ?? null,
            'raw_data' => $wahaData['raw_data'] ?? null,
        ];
    }
}
