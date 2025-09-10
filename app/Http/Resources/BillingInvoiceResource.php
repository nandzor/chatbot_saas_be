<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BillingInvoiceResource extends JsonResource
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
            'invoice_number' => $this->invoice_number,
            'external_invoice_id' => $this->external_invoice_id,

            // Organization Info
            'organization' => [
                'id' => $this->organization->id ?? null,
                'name' => $this->organization->name ?? 'N/A',
                'display_name' => $this->organization->display_name ?? 'N/A',
                'email' => $this->organization->email ?? 'N/A',
            ],

            // Subscription Info
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

            // Invoice Details
            'status' => $this->status,
            'status_color' => $this->getStatusColor(),
            'invoice_date' => $this->invoice_date?->toISOString(),
            'due_date' => $this->due_date?->toISOString(),
            'paid_date' => $this->paid_date?->toISOString(),

            // Amounts
            'subtotal' => (float) $this->subtotal,
            'tax_amount' => (float) $this->tax_amount,
            'discount_amount' => (float) $this->discount_amount,
            'total_amount' => (float) $this->total_amount,
            'currency' => $this->currency,
            'total_amount_formatted' => $this->getFormattedAmount(),

            // Billing Information
            'billing_cycle' => $this->billing_cycle,
            'period_start' => $this->period_start?->toISOString(),
            'period_end' => $this->period_end?->toISOString(),
            'period_duration' => $this->getPeriodDuration(),

            // Payment Information
            'payment_method' => $this->payment_method,
            'payment_gateway' => $this->payment_gateway,
            'payment_reference' => $this->payment_reference,
            'payment_status' => $this->getPaymentStatus(),

            // Customer Information
            'customer' => [
                'name' => $this->customer_name,
                'email' => $this->customer_email,
                'address' => $this->customer_address,
                'phone' => $this->customer_phone,
            ],

            // Additional Information
            'notes' => $this->notes,
            'metadata' => $this->metadata,

            // Timestamps
            'created_at' => $this->created_at->toISOString(),
            'updated_at' => $this->updated_at->toISOString(),

            // Computed Properties
            'is_paid' => $this->isPaid(),
            'is_overdue' => $this->isOverdue(),
            'is_pending' => $this->isPending(),
            'is_draft' => $this->isDraft(),
            'is_cancelled' => $this->isCancelled(),
            'days_until_due' => $this->getDaysUntilDue(),
            'days_overdue' => $this->getDaysOverdue(),
        ];
    }

    /**
     * Get status color for UI display.
     */
    private function getStatusColor(): string
    {
        return match ($this->status) {
            'paid' => 'success',
            'overdue' => 'danger',
            'pending' => 'warning',
            'draft' => 'secondary',
            'cancelled' => 'dark',
            'refunded' => 'info',
            default => 'light',
        };
    }

    /**
     * Get formatted amount with currency.
     */
    private function getFormattedAmount(): string
    {
        $currency = $this->currency;
        $amount = $this->total_amount;

        return match ($currency) {
            'IDR' => 'Rp ' . number_format($amount, 0, ',', '.'),
            'USD' => '$' . number_format($amount, 2, '.', ','),
            'EUR' => '€' . number_format($amount, 2, '.', ','),
            'SGD' => 'S$' . number_format($amount, 2, '.', ','),
            default => $currency . ' ' . number_format($amount, 2, '.', ','),
        };
    }

    /**
     * Get period duration in days.
     */
    private function getPeriodDuration(): ?int
    {
        if (!$this->period_start || !$this->period_end) {
            return null;
        }

        return $this->period_start->diffInDays($this->period_end);
    }

    /**
     * Get payment status.
     */
    private function getPaymentStatus(): string
    {
        if ($this->isPaid()) {
            return 'paid';
        }

        if ($this->isOverdue()) {
            return 'overdue';
        }

        if ($this->isPending()) {
            return 'pending';
        }

        return 'unknown';
    }

    /**
     * Check if invoice is paid.
     */
    private function isPaid(): bool
    {
        return $this->status === 'paid';
    }

    /**
     * Check if invoice is overdue.
     */
    private function isOverdue(): bool
    {
        return $this->status === 'overdue' ||
               ($this->status === 'pending' && $this->due_date && $this->due_date->isPast());
    }

    /**
     * Check if invoice is pending.
     */
    private function isPending(): bool
    {
        return $this->status === 'pending';
    }

    /**
     * Check if invoice is draft.
     */
    private function isDraft(): bool
    {
        return $this->status === 'draft';
    }

    /**
     * Check if invoice is cancelled.
     */
    private function isCancelled(): bool
    {
        return $this->status === 'cancelled';
    }

    /**
     * Get days until due date.
     */
    private function getDaysUntilDue(): ?int
    {
        if (!$this->due_date || $this->isPaid()) {
            return null;
        }

        return now()->diffInDays($this->due_date, false);
    }

    /**
     * Get days overdue.
     */
    private function getDaysOverdue(): ?int
    {
        if (!$this->due_date || !$this->isOverdue()) {
            return null;
        }

        return $this->due_date->diffInDays(now());
    }
}
