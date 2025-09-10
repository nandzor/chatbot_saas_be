<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SubscriptionResource extends JsonResource
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
            'organization' => [
                'id' => $this->organization->id,
                'name' => $this->organization->name,
                'display_name' => $this->organization->display_name,
                'email' => $this->organization->email,
                'org_code' => $this->organization->org_code,
            ],
            'plan' => [
                'id' => $this->plan->id,
                'name' => $this->plan->name,
                'display_name' => $this->plan->display_name,
                'tier' => $this->plan->tier,
                'description' => $this->plan->description,
            ],
            'status' => $this->status,
            'billing_cycle' => $this->billing_cycle,
            'current_period_start' => $this->current_period_start?->toISOString(),
            'current_period_end' => $this->current_period_end?->toISOString(),
            'trial_start' => $this->trial_start?->toISOString(),
            'trial_end' => $this->trial_end?->toISOString(),
            'pricing' => [
                'unit_amount' => (float) $this->unit_amount,
                'currency' => $this->currency,
                'discount_amount' => (float) $this->discount_amount,
                'tax_amount' => (float) $this->tax_amount,
                'total_amount' => (float) ($this->unit_amount - $this->discount_amount + $this->tax_amount),
            ],
            'payment' => [
                'payment_method_id' => $this->payment_method_id,
                'last_payment_date' => $this->last_payment_date?->toISOString(),
                'next_payment_date' => $this->next_payment_date?->toISOString(),
            ],
            'cancellation' => [
                'cancel_at_period_end' => $this->cancel_at_period_end,
                'canceled_at' => $this->canceled_at?->toISOString(),
                'cancellation_reason' => $this->cancellation_reason,
            ],
            'metadata' => $this->metadata,
            'created_at' => $this->created_at->toISOString(),
            'updated_at' => $this->updated_at->toISOString(),
        ];
    }
}
