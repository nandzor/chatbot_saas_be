<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ChatbotResource extends JsonResource
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
            'name' => $this->name,
            'code' => $this->code,
            'display_name' => $this->display_name,
            'description' => $this->description,

            // AI Model Configuration
            'ai_model' => $this->whenLoaded('aiModel', function () {
                return [
                    'id' => $this->aiModel->id,
                    'name' => $this->aiModel->name,
                    'provider' => $this->aiModel->provider,
                    'model_name' => $this->aiModel->model_name,
                    'is_active' => $this->aiModel->is_active
                ];
            }),
            'ai_model_id' => $this->ai_model_id,

            // Language & Communication
            'language' => $this->language,
            'tone' => $this->tone,
            'communication_style' => $this->communication_style,
            'formality_level' => $this->formality_level,

            // UI Customization
            'avatar_url' => $this->avatar_url,
            'color_scheme' => $this->color_scheme,

            // Messages & Responses
            'greeting_message' => $this->greeting_message,
            'farewell_message' => $this->farewell_message,
            'error_message' => $this->error_message,
            'waiting_message' => $this->waiting_message,
            'transfer_message' => $this->transfer_message,
            'fallback_message' => $this->fallback_message,

            // AI Configuration
            'system_message' => $this->system_message,
            'personality_traits' => $this->personality_traits,
            'custom_vocabulary' => $this->custom_vocabulary,
            'response_templates' => $this->response_templates,
            'conversation_starters' => $this->conversation_starters,

            // Behavior Settings
            'response_delay_ms' => $this->response_delay_ms,
            'typing_indicator' => $this->typing_indicator,
            'max_response_length' => $this->max_response_length,
            'enable_small_talk' => $this->enable_small_talk,
            'confidence_threshold' => $this->confidence_threshold,

            // Learning & Training
            'learning_enabled' => $this->learning_enabled,
            'training_data_sources' => $this->training_data_sources,
            'last_trained_at' => $this->last_trained_at,

            // Performance Metrics
            'total_conversations' => $this->total_conversations,
            'total_messages' => $this->total_messages,
            'avg_response_time' => $this->avg_response_time,
            'satisfaction_score' => $this->satisfaction_score,
            'last_activity_at' => $this->last_activity_at,

            // Status & Configuration
            'is_active' => $this->is_active,
            'status' => $this->status,

            // Channel Configurations
            'channel_configs' => $this->whenLoaded('channelConfigs', function () {
                return $this->channelConfigs->map(function ($config) {
                    return [
                        'id' => $config->id,
                        'name' => $config->name,
                        'channel_type' => $config->channel_type,
                        'is_active' => $config->is_active,
                        'status' => $config->status
                    ];
                });
            }),

            // Organization Information
            'organization' => $this->whenLoaded('organization', function () {
                return [
                    'id' => $this->organization->id,
                    'name' => $this->organization->name,
                    'org_code' => $this->organization->org_code
                ];
            }),

            // Timestamps
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,

            // Additional computed fields
            'is_configured' => $this->isConfigured(),
            'training_status' => $this->getTrainingStatus(),
            'performance_metrics' => $this->getPerformanceMetrics()
        ];
    }

    /**
     * Check if chatbot is properly configured
     */
    private function isConfigured(): bool
    {
        return !empty($this->greeting_message) &&
               !empty($this->fallback_message) &&
               !empty($this->ai_model_id);
    }

    /**
     * Get training status
     */
    private function getTrainingStatus(): string
    {
        if (!$this->last_trained_at) {
            return 'not_trained';
        }

        $daysSinceTraining = $this->last_trained_at->diffInDays(now());

        if ($daysSinceTraining > 30) {
            return 'outdated';
        } elseif ($daysSinceTraining > 7) {
            return 'needs_refresh';
        }

        return 'up_to_date';
    }

    /**
     * Get performance metrics
     */
    private function getPerformanceMetrics(): array
    {
        return [
            'response_time_rating' => $this->getResponseTimeRating(),
            'satisfaction_rating' => $this->getSatisfactionRating(),
            'usage_level' => $this->getUsageLevel()
        ];
    }

    /**
     * Get response time rating
     */
    private function getResponseTimeRating(): string
    {
        if (!$this->avg_response_time) {
            return 'unknown';
        }

        if ($this->avg_response_time < 1) {
            return 'excellent';
        } elseif ($this->avg_response_time < 3) {
            return 'good';
        } elseif ($this->avg_response_time < 5) {
            return 'average';
        }

        return 'poor';
    }

    /**
     * Get satisfaction rating
     */
    private function getSatisfactionRating(): string
    {
        if (!$this->satisfaction_score) {
            return 'unknown';
        }

        if ($this->satisfaction_score >= 4.5) {
            return 'excellent';
        } elseif ($this->satisfaction_score >= 3.5) {
            return 'good';
        } elseif ($this->satisfaction_score >= 2.5) {
            return 'average';
        }

        return 'poor';
    }

    /**
     * Get usage level
     */
    private function getUsageLevel(): string
    {
        if (!$this->total_conversations) {
            return 'unused';
        }

        if ($this->total_conversations > 1000) {
            return 'high';
        } elseif ($this->total_conversations > 100) {
            return 'medium';
        }

        return 'low';
    }
}
