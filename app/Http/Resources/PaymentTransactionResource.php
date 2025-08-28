<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PaymentTransactionResource extends JsonResource
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
            'transaction_id' => $this->transaction_id,
            'external_transaction_id' => $this->external_transaction_id,
            'reference_number' => $this->reference_number,

            // Organization Info
            'organization' => [
                'id' => $this->organization->id ?? null,
                'name' => $this->organization->name ?? 'N/A',
                'slug' => $this->organization->slug ?? 'N/A',
            ],

            // Subscription & Plan Info
            'subscription' => [
                'id' => $this->subscription->id ?? null,
                'status' => $this->subscription->status ?? 'N/A',
                'billing_cycle' => $this->subscription->billing_cycle ?? 'N/A',
                'plan' => [
                    'id' => $this->subscription->plan->id ?? null,
                    'name' => $this->subscription->plan->name ?? 'N/A',
                    'display_name' => $this->subscription->plan->display_name ?? 'N/A',
                    'tier' => $this->subscription->plan->tier ?? 'N/A',
                ] ?? null,
            ] ?? null,

            // Invoice Info
            'invoice' => [
                'id' => $this->invoice->id ?? null,
                'invoice_number' => $this->invoice->invoice_number ?? 'N/A',
                'status' => $this->invoice->status ?? 'N/A',
            ] ?? null,

            // Payment Details
            'amount' => $this->amount,
            'currency' => $this->currency,
            'amount_formatted' => $this->amount_formatted,
            'net_amount' => $this->net_amount,
            'net_amount_formatted' => $this->net_amount_formatted,
            'exchange_rate' => $this->exchange_rate,
            'amount_original' => $this->amount_original,
            'currency_original' => $this->currency_original,

            // Payment Method & Gateway
            'payment_method' => $this->payment_method,
            'payment_gateway' => $this->payment_gateway,
            'payment_channel' => $this->payment_channel,
            'payment_type' => $this->payment_type,

            // Card/Account Details (masked for security)
            'card_last_four' => $this->card_last_four,
            'card_brand' => $this->card_brand,
            'account_name' => $this->account_name,
            'account_number_masked' => $this->account_number_masked,

            // Transaction Status
            'status' => $this->status,
            'status_color' => $this->status_color ?? 'light',
            'gateway_status' => $this->gateway_status,
            'gateway_message' => $this->gateway_message,

            // Timing
            'initiated_at' => $this->initiated_at?->toISOString(),
            'authorized_at' => $this->authorized_at?->toISOString(),
            'captured_at' => $this->captured_at?->toISOString(),
            'settled_at' => $this->settled_at?->toISOString(),
            'failed_at' => $this->failed_at?->toISOString(),
            'processing_time' => $this->processing_time,
            'processing_time_human' => $this->processing_time_human,

            // Fees & Charges
            'gateway_fee' => $this->gateway_fee,
            'platform_fee' => $this->platform_fee,
            'processing_fee' => $this->processing_fee,
            'tax_amount' => $this->tax_amount,
            'total_fees' => $this->total_fees,
            'fee_percentage' => $this->fee_percentage,

            // Refund Information
            'refund_amount' => $this->refund_amount,
            'refunded_at' => $this->refunded_at?->toISOString(),
            'refund_reason' => $this->refund_reason,
            'refund_percentage' => $this->refund_percentage,

            // Security & Risk
            'fraud_score' => $this->fraud_score,
            'risk_assessment' => $this->risk_assessment,
            'ip_address' => $this->ip_address,
            'user_agent' => $this->user_agent,
            'is_high_risk' => $this->isHighRisk(),

            // Gateway Response
            'gateway_response' => $this->gateway_response,

            // Additional Info
            'notes' => $this->notes,
            'metadata' => $this->metadata,

            // Timestamps
            'created_at' => $this->created_at->toISOString(),
            'updated_at' => $this->updated_at->toISOString(),

            // Computed Properties
            'is_completed' => $this->isCompleted(),
            'is_pending' => $this->isPending(),
            'is_processing' => $this->isProcessing(),
            'is_failed' => $this->isFailed(),
            'is_refunded' => $this->isRefunded(),
            'is_cancelled' => $this->isCancelled(),
            'is_recurring' => $this->isRecurring(),
            'is_refund' => $this->isRefund(),
        ];
    }
}
