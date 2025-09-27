<?php

namespace App\Http\Resources\Conversation;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ConversationResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'organization_id' => $this->organization_id,

            // Customer information
            'customer' => [
                'id' => $this->customer->id ?? null,
                'name' => $this->customer->name ?? 'Unknown Customer',
                'phone' => $this->customer->phone ?? null,
                'email' => $this->customer->email ?? null,
                'avatar_url' => $this->customer->avatar_url ?? null,
                'status' => $this->customer->status ?? 'active',
                'created_at' => $this->customer->created_at?->toISOString(),
            ],

            // Agent information
            'agent' => $this->when($this->agent, function () {
                return [
                    'id' => $this->agent->id,
                    'name' => $this->agent->display_name ?? $this->agent->name,
                    'email' => $this->agent->user->email ?? null,
                    'avatar_url' => $this->agent->user->avatar_url ?? null,
                    'status' => $this->agent->status,
                    'availability_status' => $this->agent->availability_status,
                    'department' => $this->agent->department,
                    'job_title' => $this->agent->job_title,
                    'assigned_at' => $this->assigned_at?->toISOString(),
                ];
            }),

            // Session information
            'session_info' => [
                'session_token' => $this->session_token,
                'session_type' => $this->session_type,
                'status' => $this->status,
                'started_at' => $this->started_at?->toISOString(),
                'ended_at' => $this->ended_at?->toISOString(),
                'last_activity_at' => $this->last_activity_at?->toISOString(),
                'is_active' => $this->is_active,
                'is_bot_session' => $this->is_bot_session,
                'is_resolved' => $this->is_resolved,
                'resolution_type' => $this->resolution_type,
                'resolution_notes' => $this->resolution_notes,
                'waha_session_id' => $this->waha_session_id,
            ],

            // Message statistics
            'statistics' => [
                'total_messages' => $this->total_messages ?? 0,
                'customer_messages' => $this->customer_messages ?? 0,
                'bot_messages' => $this->bot_messages ?? 0,
                'agent_messages' => $this->agent_messages ?? 0,
                'unread_messages' => $this->unread_messages ?? 0,
                'response_time_avg' => $this->response_time_avg,
                'resolution_time' => $this->resolution_time,
                'first_response_time' => $this->first_response_time,
                'last_message_at' => $this->last_message_at?->toISOString(),
            ],

            // Classification and categorization
            'classification' => [
                'intent' => $this->intent,
                'category' => $this->category,
                'subcategory' => $this->subcategory,
                'priority' => $this->priority,
                'tags' => $this->tags ?? [],
                'language' => $this->language ?? 'id',
                'source' => $this->source ?? 'whatsapp',
            ],

            // AI analysis
            'ai_analysis' => [
                'sentiment_analysis' => $this->sentiment_analysis,
                'ai_summary' => $this->ai_summary,
                'topics_discussed' => $this->topics_discussed ?? [],
                'escalation_reason' => $this->escalation_reason,
                'escalated_at' => $this->escalated_at?->toISOString(),
            ],

            // WhatsApp specific data
            'whatsapp' => $this->getWhatsAppSessionData(),

            // Messages (when loaded)
            'messages' => $this->when($this->relationLoaded('messages'), function () {
                return MessageResource::collection($this->messages);
            }),

            // Recent messages preview (for list view)
            'recent_messages' => $this->when($request->get('include_recent', false), function () {
                return MessageResource::collection($this->messages()->latest()->limit(3)->get());
            }),

            // Timestamps
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }

    /**
     * Get WhatsApp session specific data
     */
    private function getWhatsAppSessionData(): array
    {
        $wahaData = $this->metadata['waha_session_data'] ?? [];

        return [
            'waha_session_id' => $this->waha_session_id,
            'waha_session_name' => $wahaData['session_name'] ?? null,
            'phone_number' => $wahaData['phone_number'] ?? null,
            'customer_phone' => $wahaData['customer_phone'] ?? null,
            'customer_name' => $wahaData['customer_name'] ?? null,
            'session_status' => $wahaData['status'] ?? 'active',
            'qr_code' => $wahaData['qr_code'] ?? null,
            'last_seen' => $wahaData['last_seen'] ?? null,
            'is_connected' => $wahaData['is_connected'] ?? false,
            'connection_status' => $wahaData['connection_status'] ?? 'disconnected',
        ];
    }
}
