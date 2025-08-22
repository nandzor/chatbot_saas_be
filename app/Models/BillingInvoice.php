<?php

namespace App\Models;

use App\Traits\BelongsToOrganization;
use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class BillingInvoice extends Model
{
    use HasFactory, HasUuid, BelongsToOrganization;

    protected $table = 'billing_invoices';

    protected $fillable = [
        'organization_id',
        'subscription_id',
        'invoice_number',
        'status',
        'subtotal',
        'tax_amount',
        'discount_amount',
        'total_amount',
        'currency',
        'invoice_date',
        'due_date',
        'paid_date',
        'payment_method',
        'transaction_id',
        'payment_gateway',
        'line_items',
        'billing_address',
        'metadata',
    ];

    protected $casts = [
        'subtotal' => 'decimal:2',
        'tax_amount' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'invoice_date' => 'datetime',
        'due_date' => 'datetime',
        'paid_date' => 'datetime',
        'line_items' => 'array',
        'billing_address' => 'array',
        'metadata' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the subscription this invoice belongs to.
     */
    public function subscription(): BelongsTo
    {
        return $this->belongsTo(Subscription::class);
    }

    /**
     * Get the payment transactions for this invoice.
     */
    public function paymentTransactions(): HasMany
    {
        return $this->hasMany(PaymentTransaction::class, 'invoice_id');
    }

    /**
     * Get the successful payment transaction.
     */
    public function successfulPayment()
    {
        return $this->paymentTransactions()
                    ->where('status', 'completed')
                    ->first();
    }

    /**
     * Check if invoice is paid.
     */
    public function isPaid(): bool
    {
        return $this->status === 'success' && !is_null($this->paid_date);
    }

    /**
     * Check if invoice is pending.
     */
    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    /**
     * Check if invoice is overdue.
     */
    public function isOverdue(): bool
    {
        return $this->status === 'pending' &&
               $this->due_date &&
               $this->due_date->isPast();
    }

    /**
     * Check if invoice is failed.
     */
    public function isFailed(): bool
    {
        return $this->status === 'failed';
    }

    /**
     * Get days until due (negative if overdue).
     */
    public function getDaysUntilDueAttribute(): ?int
    {
        if (!$this->due_date) {
            return null;
        }

        return now()->diffInDays($this->due_date, false);
    }

    /**
     * Get days overdue (0 if not overdue).
     */
    public function getDaysOverdueAttribute(): int
    {
        if (!$this->isOverdue()) {
            return 0;
        }

        return $this->due_date->diffInDays(now());
    }

    /**
     * Get the net amount (total - discount + tax).
     */
    public function getNetAmountAttribute(): float
    {
        return $this->subtotal - $this->discount_amount + $this->tax_amount;
    }

    /**
     * Get tax percentage.
     */
    public function getTaxPercentageAttribute(): float
    {
        if ($this->subtotal === 0) {
            return 0;
        }

        return round(($this->tax_amount / $this->subtotal) * 100, 2);
    }

    /**
     * Get discount percentage.
     */
    public function getDiscountPercentageAttribute(): float
    {
        if ($this->subtotal === 0) {
            return 0;
        }

        return round(($this->discount_amount / $this->subtotal) * 100, 2);
    }

    /**
     * Get total amount formatted.
     */
    public function getTotalAmountFormattedAttribute(): string
    {
        return $this->formatCurrency((float) $this->total_amount);
    }

    /**
     * Get subtotal formatted.
     */
    public function getSubtotalFormattedAttribute(): string
    {
        return $this->formatCurrency((float) $this->subtotal);
    }

    /**
     * Format currency based on invoice currency.
     */
    private function formatCurrency(float $amount): string
    {
        return match ($this->currency) {
            'IDR' => 'Rp ' . number_format($amount, 0, ',', '.'),
            'USD' => '$' . number_format($amount, 2),
            'EUR' => '€' . number_format($amount, 2),
            default => $this->currency . ' ' . number_format($amount, 2),
        };
    }

    /**
     * Mark invoice as paid.
     */
    public function markAsPaid(?string $paymentMethod = null, ?string $transactionId = null): void
    {
        $this->update([
            'status' => 'success',
            'paid_date' => now(),
            'payment_method' => $paymentMethod,
            'transaction_id' => $transactionId,
        ]);
    }

    /**
     * Mark invoice as failed.
     */
    public function markAsFailed(): void
    {
        $this->update(['status' => 'failed']);
    }

    /**
     * Add line item to invoice.
     */
    public function addLineItem(string $description, float $amount, int $quantity = 1, array $metadata = []): void
    {
        $lineItems = $this->line_items ?? [];

        $lineItems[] = [
            'description' => $description,
            'quantity' => $quantity,
            'unit_price' => $amount,
            'total' => $amount * $quantity,
            'metadata' => $metadata,
        ];

        $this->update(['line_items' => $lineItems]);
        $this->recalculateAmounts();
    }

    /**
     * Recalculate invoice amounts based on line items.
     */
    public function recalculateAmounts(): void
    {
        $lineItems = $this->line_items ?? [];
        $subtotal = collect($lineItems)->sum('total');
        $total = $subtotal - $this->discount_amount + $this->tax_amount;

        $this->update([
            'subtotal' => $subtotal,
            'total_amount' => $total,
        ]);
    }

    /**
     * Apply discount to invoice.
     */
    public function applyDiscount(float $discountAmount): void
    {
        $this->update(['discount_amount' => $discountAmount]);
        $this->recalculateAmounts();
    }

    /**
     * Apply tax to invoice.
     */
    public function applyTax(float $taxAmount): void
    {
        $this->update(['tax_amount' => $taxAmount]);
        $this->recalculateAmounts();
    }

    /**
     * Generate unique invoice number.
     */
    public static function generateInvoiceNumber(): string
    {
        $prefix = 'INV';
        $date = now()->format('Ymd');
        $sequence = static::whereDate('created_at', now())->count() + 1;

        return $prefix . '-' . $date . '-' . str_pad($sequence, 4, '0', STR_PAD_LEFT);
    }

    /**
     * Create invoice from subscription.
     */
    public static function createFromSubscription(Subscription $subscription, array $overrides = []): self
    {
        $defaults = [
            'organization_id' => $subscription->organization_id,
            'subscription_id' => $subscription->id,
            'invoice_number' => static::generateInvoiceNumber(),
            'status' => 'pending',
            'subtotal' => $subscription->unit_amount,
            'tax_amount' => $subscription->tax_amount ?? 0,
            'discount_amount' => $subscription->discount_amount ?? 0,
            'total_amount' => $subscription->unit_amount + ($subscription->tax_amount ?? 0) - ($subscription->discount_amount ?? 0),
            'currency' => $subscription->currency,
            'invoice_date' => now(),
            'due_date' => now()->addDays(7),
            'line_items' => [
                [
                    'description' => 'Subscription: ' . $subscription->plan->display_name,
                    'quantity' => 1,
                    'unit_price' => $subscription->unit_amount,
                    'total' => $subscription->unit_amount,
                    'period_start' => $subscription->current_period_start,
                    'period_end' => $subscription->current_period_end,
                ]
            ],
        ];

        return static::create(array_merge($defaults, $overrides));
    }

    /**
     * Scope for paid invoices.
     */
    public function scopePaid($query)
    {
        return $query->where('status', 'success')
                    ->whereNotNull('paid_date');
    }

    /**
     * Scope for pending invoices.
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope for overdue invoices.
     */
    public function scopeOverdue($query)
    {
        return $query->where('status', 'pending')
                    ->where('due_date', '<', now());
    }

    /**
     * Scope for failed invoices.
     */
    public function scopeFailed($query)
    {
        return $query->where('status', 'failed');
    }

    /**
     * Scope for invoices due within specified days.
     */
    public function scopeDueWithin($query, int $days)
    {
        return $query->where('status', 'pending')
                    ->whereBetween('due_date', [now(), now()->addDays($days)]);
    }

    /**
     * Scope for invoices from specific date range.
     */
    public function scopeDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('invoice_date', [$startDate, $endDate]);
    }

    /**
     * Scope for invoices above certain amount.
     */
    public function scopeAmountAbove($query, float $amount)
    {
        return $query->where('total_amount', '>=', $amount);
    }

    /**
     * Order by invoice date.
     */
    public function scopeByDate($query, string $direction = 'desc')
    {
        return $query->orderBy('invoice_date', $direction);
    }

    /**
     * Order by due date.
     */
    public function scopeByDueDate($query, string $direction = 'asc')
    {
        return $query->orderBy('due_date', $direction);
    }

    /**
     * Order by amount.
     */
    public function scopeByAmount($query, string $direction = 'desc')
    {
        return $query->orderBy('total_amount', $direction);
    }

    /**
     * Search by invoice number or organization name.
     */
    public function scopeSearch($query, string $term)
    {
        return $query->where(function ($query) use ($term) {
            $query->where('invoice_number', 'LIKE', "%{$term}%")
                  ->orWhereHas('organization', function ($q) use ($term) {
                      $q->where('name', 'LIKE', "%{$term}%");
                  });
        });
    }
}
