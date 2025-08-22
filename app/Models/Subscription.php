<?php

namespace App\Models;

use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Subscription extends Model
{
    use HasFactory, HasUuid;

    protected $fillable = [
        'organization_id',
        'plan_id',
        'status',
        'billing_cycle',
        'current_period_start',
        'current_period_end',
        'trial_start',
        'trial_end',
        'unit_amount',
        'currency',
        'discount_amount',
        'tax_amount',
        'payment_method_id',
        'last_payment_date',
        'next_payment_date',
        'cancel_at_period_end',
        'canceled_at',
        'cancellation_reason',
        'metadata',
    ];

    protected $casts = [
        'current_period_start' => 'datetime',
        'current_period_end' => 'datetime',
        'trial_start' => 'datetime',
        'trial_end' => 'datetime',
        'unit_amount' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'tax_amount' => 'decimal:2',
        'last_payment_date' => 'datetime',
        'next_payment_date' => 'datetime',
        'cancel_at_period_end' => 'boolean',
        'canceled_at' => 'datetime',
        'metadata' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the organization that owns this subscription.
     */
    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    /**
     * Get the subscription plan for this subscription.
     */
    public function plan(): BelongsTo
    {
        return $this->belongsTo(SubscriptionPlan::class, 'plan_id');
    }

    /**
     * Get the billing invoices for this subscription.
     */
    public function billingInvoices(): HasMany
    {
        return $this->hasMany(BillingInvoice::class);
    }

    /**
     * Get the payment transactions for this subscription.
     */
    public function paymentTransactions(): HasMany
    {
        return $this->hasMany(PaymentTransaction::class);
    }

    /**
     * Check if subscription is active.
     */
    public function isActive(): bool
    {
        return $this->status === 'success' &&
               $this->current_period_end &&
               $this->current_period_end->isFuture();
    }

    /**
     * Check if subscription is in trial.
     */
    public function isInTrial(): bool
    {
        return $this->trial_start &&
               $this->trial_end &&
               now()->between($this->trial_start, $this->trial_end);
    }

    /**
     * Check if subscription is cancelled.
     */
    public function isCancelled(): bool
    {
        return $this->status === 'cancelled' || $this->canceled_at;
    }

    /**
     * Check if subscription will be cancelled at period end.
     */
    public function willCancelAtPeriodEnd(): bool
    {
        return $this->cancel_at_period_end;
    }

    /**
     * Check if subscription is past due.
     */
    public function isPastDue(): bool
    {
        return $this->current_period_end &&
               $this->current_period_end->isPast() &&
               $this->status !== 'success';
    }

    /**
     * Get the next billing amount.
     */
    public function getNextBillingAmount(): float
    {
        return $this->unit_amount - $this->discount_amount + $this->tax_amount;
    }

    /**
     * Scope for active subscriptions.
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'success')
                    ->where('current_period_end', '>', now());
    }

    /**
     * Scope for cancelled subscriptions.
     */
    public function scopeCancelled($query)
    {
        return $query->where('status', 'cancelled')
                    ->orWhereNotNull('canceled_at');
    }

    /**
     * Scope for subscriptions that will cancel at period end.
     */
    public function scopeCancellingAtPeriodEnd($query)
    {
        return $query->where('cancel_at_period_end', true);
    }

    /**
     * Scope for past due subscriptions.
     */
    public function scopePastDue($query)
    {
        return $query->where('current_period_end', '<', now())
                    ->where('status', '!=', 'success');
    }

    /**
     * Scope for subscriptions due for renewal.
     */
    public function scopeDueForRenewal($query)
    {
        return $query->where('next_payment_date', '<=', now()->addDay())
                    ->where('status', 'success')
                    ->where('cancel_at_period_end', false);
    }
}
