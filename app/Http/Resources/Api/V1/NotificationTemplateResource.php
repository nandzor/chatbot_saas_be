<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class NotificationTemplateResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'type' => $this->type,
            'type_display_name' => $this->type_display_name,
            'category' => $this->category,
            'category_display_name' => $this->category_display_name,
            'subject' => $this->subject,
            'body' => $this->body,
            'body_preview' => $this->body_preview,
            'variables' => $this->variables,
            'variable_count' => $this->variable_count,
            'settings' => $this->settings,
            'is_active' => $this->is_active,
            'status_color' => $this->status_color,
            'status_icon' => $this->status_icon,
            'language' => $this->language,
            'language_display_name' => $this->language_display_name,
            'version' => $this->version,
            'description' => $this->description,
            'metadata' => $this->metadata,
            'is_email' => $this->is_email,
            'is_sms' => $this->is_sms,
            'is_push' => $this->is_push,
            'is_webhook' => $this->is_webhook,
            'created_at' => $this->created_at->toISOString(),
            'updated_at' => $this->updated_at->toISOString(),
        ];
    }
}
