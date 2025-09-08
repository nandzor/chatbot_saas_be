<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MessageResource extends JsonResource
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
            'chat_session_id' => $this->chat_session_id,

            // Sender information
            'sender_type' => $this->sender_type,
            'sender_id' => $this->sender_id,
            'sender_name' => $this->getSenderName(),

            // Message content
            'message_type' => $this->message_type,
            'content' => $this->content,
            'content_preview' => $this->getContentPreview(),

            // Message status
            'status' => $this->status,
            'is_read' => $this->is_read,
            'read_at' => $this->read_at,
            'is_edited' => $this->is_edited,
            'edited_at' => $this->edited_at,

            // Message metadata
            'metadata' => $this->metadata,
            'attachments' => $this->getAttachments(),
            'reactions' => $this->getReactions(),

            // AI Analysis
            'sentiment_score' => $this->sentiment_score,
            'sentiment_label' => $this->getSentimentLabel(),
            'intent' => $this->intent,
            'entities' => $this->entities,
            'confidence_score' => $this->confidence_score,

            // Timestamps
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,

            // Computed fields
            'is_from_customer' => $this->sender_type === 'customer',
            'is_from_agent' => $this->sender_type === 'agent',
            'is_from_bot' => $this->sender_type === 'bot',
            'time_ago' => $this->created_at->diffForHumans(),
            'word_count' => $this->getWordCount(),
            'character_count' => strlen($this->content ?? ''),
        ];
    }

    /**
     * Get sender name
     */
    private function getSenderName(): ?string
    {
        switch ($this->sender_type) {
            case 'customer':
                return $this->whenLoaded('customer', function () {
                    return $this->customer->name ?? 'Customer';
                });
            case 'agent':
                return $this->whenLoaded('agent', function () {
                    return $this->agent->name ?? 'Agent';
                });
            case 'bot':
                return $this->whenLoaded('botPersonality', function () {
                    return $this->botPersonality->display_name ?? $this->botPersonality->name ?? 'Bot';
                });
            default:
                return ucfirst($this->sender_type);
        }
    }

    /**
     * Get content preview (first 100 characters)
     */
    private function getContentPreview(): string
    {
        if (!$this->content) {
            return '';
        }

        return strlen($this->content) > 100
            ? substr($this->content, 0, 100) . '...'
            : $this->content;
    }

    /**
     * Get attachments from metadata
     */
    private function getAttachments(): array
    {
        if (!$this->metadata || !isset($this->metadata['attachments'])) {
            return [];
        }

        return $this->metadata['attachments'];
    }

    /**
     * Get reactions from metadata
     */
    private function getReactions(): array
    {
        if (!$this->metadata || !isset($this->metadata['reactions'])) {
            return [];
        }

        return $this->metadata['reactions'];
    }

    /**
     * Get sentiment label
     */
    private function getSentimentLabel(): ?string
    {
        if (!$this->sentiment_score) {
            return null;
        }

        if ($this->sentiment_score >= 0.5) {
            return 'positive';
        } elseif ($this->sentiment_score <= -0.5) {
            return 'negative';
        }

        return 'neutral';
    }

    /**
     * Get word count
     */
    private function getWordCount(): int
    {
        if (!$this->content) {
            return 0;
        }

        return str_word_count(strip_tags($this->content));
    }
}
