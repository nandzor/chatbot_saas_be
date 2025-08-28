<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SubscriptionPlanResource extends JsonResource
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
            'name' => $this->name,
            'display_name' => $this->display_name,
            'description' => $this->description,
            'tier' => $this->tier,
            'pricing' => [
                'monthly' => [
                    'price' => $this->price_monthly,
                    'currency' => $this->currency,
                ],
                'quarterly' => $this->price_quarterly ? [
                    'price' => $this->price_quarterly,
                    'currency' => $this->currency,
                ] : null,
                'yearly' => $this->price_yearly ? [
                    'price' => $this->price_yearly,
                    'currency' => $this->currency,
                ] : null,
            ],
            'limits' => [
                'max_agents' => $this->max_agents,
                'max_channels' => $this->max_channels,
                'max_knowledge_articles' => $this->max_knowledge_articles,
                'max_monthly_messages' => $this->max_monthly_messages,
                'max_monthly_ai_requests' => $this->max_monthly_ai_requests,
                'max_storage_gb' => $this->max_storage_gb,
                'max_api_calls_per_day' => $this->max_api_calls_per_day,
            ],
            'features' => $this->features ?? [],
            'trial_days' => $this->trial_days,
            'is_popular' => $this->is_popular,
            'is_custom' => $this->is_custom,
            'sort_order' => $this->sort_order,
            'status' => $this->status,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
