<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ConversationResource extends JsonResource
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
            'session_token' => $this->session_token,
            'session_type' => $this->session_type,

            // Customer information
            'customer' => $this->whenLoaded('customer', function () {
                return [
                    'id' => $this->customer->id,
                    'name' => $this->customer->name,
                    'email' => $this->customer->email,
                    'phone' => $this->customer->phone,
                ];
            }),
            'customer_id' => $this->customer_id,

            // Agent information
            'agent' => $this->whenLoaded('agent', function () {
                return [
                    'id' => $this->agent->id,
                    'name' => $this->agent->name,
                    'email' => $this->agent->email,
                ];
            }),
            'agent_id' => $this->agent_id,

            // Bot information
            'bot_personality' => $this->whenLoaded('botPersonality', function () {
                return [
                    'id' => $this->botPersonality->id,
                    'name' => $this->botPersonality->name,
                    'display_name' => $this->botPersonality->display_name,
                ];
            }),
            'bot_personality_id' => $this->bot_personality_id,

            // Channel information
            'channel_config' => $this->whenLoaded('channelConfig', function () {
                return [
                    'id' => $this->channelConfig->id,
                    'name' => $this->channelConfig->name,
                    'channel_type' => $this->channelConfig->channel_type,
                ];
            }),
            'channel_config_id' => $this->channel_config_id,

            // Session status
            'is_active' => $this->is_active,
            'is_bot_session' => $this->is_bot_session,
            'is_resolved' => $this->is_resolved,

            // Timestamps
            'started_at' => $this->started_at,
            'ended_at' => $this->ended_at,
            'last_activity_at' => $this->last_activity_at,
            'first_response_at' => $this->first_response_at,

            // Handover information
            'handover_reason' => $this->handover_reason,
            'handover_at' => $this->handover_at,

            // Statistics
            'total_messages' => $this->total_messages,
            'customer_messages' => $this->customer_messages,
            'bot_messages' => $this->bot_messages,
            'agent_messages' => $this->agent_messages,

            // Performance metrics
            'response_time_avg' => $this->response_time_avg,
            'resolution_time' => $this->resolution_time,
            'wait_time' => $this->wait_time,

            // Feedback
            'satisfaction_rating' => $this->satisfaction_rating,
            'feedback_text' => $this->feedback_text,
            'feedback_tags' => $this->feedback_tags,
            'csat_submitted_at' => $this->csat_submitted_at,

            // Classification
            'intent' => $this->intent,
            'category' => $this->category,
            'subcategory' => $this->subcategory,
            'priority' => $this->priority,
            'tags' => $this->tags,

            // Resolution
            'resolved_at' => $this->resolved_at,
            'resolution_type' => $this->resolution_type,
            'resolution_notes' => $this->resolution_notes,

            // AI Analysis
            'sentiment_analysis' => $this->sentiment_analysis,
            'ai_summary' => $this->ai_summary,
            'topics_discussed' => $this->topics_discussed,

            // Additional data
            'session_data' => $this->session_data,
            'metadata' => $this->metadata,

            // Messages (if loaded)
            'messages' => $this->whenLoaded('messages', function () {
                return $this->messages->map(function ($message) {
                    return [
                        'id' => $message->id,
                        'sender_type' => $message->sender_type,
                        'sender_id' => $message->sender_id,
                        'message_type' => $message->message_type,
                        'content' => $message->content,
                        'created_at' => $message->created_at,
                    ];
                });
            }),

            // Computed fields
            'duration' => $this->getDuration(),
            'status' => $this->getStatus(),
            'response_time_rating' => $this->getResponseTimeRating(),
            'satisfaction_rating_text' => $this->getSatisfactionRatingText(),
        ];
    }

    /**
     * Get conversation duration in minutes
     */
    private function getDuration(): ?int
    {
        if (!$this->started_at) {
            return null;
        }

        $endTime = $this->ended_at ?? now();
        return $this->started_at->diffInMinutes($endTime);
    }

    /**
     * Get conversation status
     */
    private function getStatus(): string
    {
        if ($this->is_resolved) {
            return 'resolved';
        }

        if ($this->is_active) {
            return 'active';
        }

        if ($this->ended_at) {
            return 'ended';
        }

        return 'unknown';
    }

    /**
     * Get response time rating
     */
    private function getResponseTimeRating(): string
    {
        if (!$this->response_time_avg) {
            return 'unknown';
        }

        if ($this->response_time_avg < 1) {
            return 'excellent';
        } elseif ($this->response_time_avg < 3) {
            return 'good';
        } elseif ($this->response_time_avg < 5) {
            return 'average';
        }

        return 'poor';
    }

    /**
     * Get satisfaction rating text
     */
    private function getSatisfactionRatingText(): string
    {
        if (!$this->satisfaction_rating) {
            return 'not_rated';
        }

        if ($this->satisfaction_rating >= 4.5) {
            return 'excellent';
        } elseif ($this->satisfaction_rating >= 3.5) {
            return 'good';
        } elseif ($this->satisfaction_rating >= 2.5) {
            return 'average';
        } elseif ($this->satisfaction_rating >= 1.5) {
            return 'poor';
        }

        return 'very_poor';
    }
}
