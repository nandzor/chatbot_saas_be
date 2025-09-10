<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SystemConfigurationResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'category' => $this->category,
            'category_display_name' => $this->category_display_name,
            'key' => $this->key,
            'key_display_name' => $this->key_display_name,
            'value' => $this->value,
            'typed_value' => $this->typed_value,
            'display_value' => $this->display_value,
            'type' => $this->type,
            'description' => $this->description,
            'is_public' => $this->is_public,
            'is_editable' => $this->is_editable,
            'validation_rules' => $this->validation_rules,
            'options' => $this->options,
            'default_value' => $this->default_value,
            'sort_order' => $this->sort_order,
            'is_boolean' => $this->is_boolean,
            'is_numeric' => $this->is_numeric,
            'is_json' => $this->is_json,
            'created_at' => $this->created_at->toISOString(),
            'updated_at' => $this->updated_at->toISOString(),
        ];
    }
}
