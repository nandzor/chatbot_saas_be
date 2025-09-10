<?php

namespace App\Models;

use App\Traits\BelongsToOrganization;
use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PaymentTransaction extends Model
{
    use HasFactory, HasUuid, BelongsToOrganization;

    protected $table = 'payment_transactions';

    protected $fillable = [
        'organization_id',
        'subscription_id',
        'invoice_id',
        'transaction_id',
        'external_transaction_id',
        'reference_number',
        'amount',
        'currency',
        'exchange_rate',
        'amount_original',
        'currency_original',
        'payment_method',
        'payment_gateway',
        'payment_channel',
        'card_last_four',
        'card_brand',
        'account_name',
        'account_number_masked',
        'status',
        'payment_type',
        'initiated_at',
        'authorized_at',
        'captured_at',
        'settled_at',
        'failed_at',
        'gateway_response',
        'gateway_fee',
        'gateway_status',
        'gateway_message',
        'fraud_score',
        'risk_assessment',
        'ip_address',
        'user_agent',
        'platform_fee',
        'processing_fee',
        'tax_amount',
        'net_amount',
        'refund_amount',
        'refunded_at',
        'refund_reason',
        'notes',
        'metadata',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'exchange_rate' => 'decimal:6',
        'amount_original' => 'decimal:2',
        'gateway_response' => 'array',
        'gateway_fee' => 'decimal:2',
        'fraud_score' => 'decimal:2',
        'risk_assessment' => 'array',
        'platform_fee' => 'decimal:2',
        'processing_fee' => 'decimal:2',
        'tax_amount' => 'decimal:2',
        'net_amount' => 'decimal:2',
        'refund_amount' => 'decimal:2',
        'initiated_at' => 'datetime',
        'authorized_at' => 'datetime',
        'captured_at' => 'datetime',
        'settled_at' => 'datetime',
        'failed_at' => 'datetime',
        'refunded_at' => 'datetime',
        'metadata' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the subscription this transaction belongs to.
     */
    public function subscription(): BelongsTo
    {
        return $this->belongsTo(Subscription::class);
    }

    /**
     * Get the invoice this transaction is for.
     */
    public function invoice(): BelongsTo
    {
        return $this->belongsTo(BillingInvoice::class, 'invoice_id');
    }

    /**
     * Check if transaction is completed.
     */
    public function isCompleted(): bool
    {
        return $this->status === 'completed' && !is_null($this->captured_at);
    }

    /**
     * Check if transaction is pending.
     */
    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    /**
     * Check if transaction is processing.
     */
    public function isProcessing(): bool
    {
        return $this->status === 'processing';
    }

    /**
     * Check if transaction failed.
     */
    public function isFailed(): bool
    {
        return $this->status === 'failed' && !is_null($this->failed_at);
    }

    /**
     * Check if transaction is refunded.
     */
    public function isRefunded(): bool
    {
        return $this->status === 'refunded' || $this->refund_amount > 0;
    }

    /**
     * Check if transaction is cancelled.
     */
    public function isCancelled(): bool
    {
        return $this->status === 'cancelled';
    }

    /**
     * Check if transaction is recurring.
     */
    public function isRecurring(): bool
    {
        return $this->payment_type === 'recurring';
    }

    /**
     * Check if transaction is a refund.
     */
    public function isRefund(): bool
    {
        return $this->payment_type === 'refund';
    }

    /**
     * Check if fraud score is high.
     */
    public function isHighRisk(): bool
    {
        return $this->fraud_score >= 0.7;
    }

    /**
     * Get processing time in seconds.
     */
    public function getProcessingTimeAttribute(): ?int
    {
        if (!$this->initiated_at || !$this->captured_at) {
            return null;
        }

        return $this->initiated_at->diffInSeconds($this->captured_at);
    }

    /**
     * Get processing time in human readable format.
     */
    public function getProcessingTimeHumanAttribute(): ?string
    {
        $seconds = $this->processing_time;

        if (!$seconds) {
            return null;
        }

        if ($seconds < 60) {
            return $seconds . 's';
        }

        return round($seconds / 60, 1) . 'm';
    }

    /**
     * Get amount formatted.
     */
    public function getAmountFormattedAttribute(): string
    {
        return $this->formatCurrency((float) $this->amount, $this->currency);
    }

    /**
     * Get net amount formatted.
     */
    public function getNetAmountFormattedAttribute(): string
    {
        return $this->formatCurrency((float) ($this->net_amount ?? $this->amount), $this->currency);
    }

    /**
     * Get total fees.
     */
    public function getTotalFeesAttribute(): float
    {
        return ($this->gateway_fee ?? 0) + ($this->platform_fee ?? 0) + ($this->processing_fee ?? 0);
    }

    /**
     * Get fee percentage.
     */
    public function getFeePercentageAttribute(): float
    {
        if ($this->amount === 0) {
            return 0;
        }

        return round(($this->total_fees / $this->amount) * 100, 2);
    }

    /**
     * Get refund percentage.
     */
    public function getRefundPercentageAttribute(): float
    {
        if ($this->amount === 0) {
            return 0;
        }

        return round(($this->refund_amount / $this->amount) * 100, 2);
    }

    /**
     * Format currency based on transaction currency.
     */
    private function formatCurrency(float $amount, string $currency): string
    {
        return match ($currency) {
            'IDR' => 'Rp ' . number_format($amount, 0, ',', '.'),
            'USD' => '$' . number_format($amount, 2),
            'EUR' => '€' . number_format($amount, 2),
            default => $currency . ' ' . number_format($amount, 2),
        };
    }

    /**
     * Mark transaction as completed.
     */
    public function markAsCompleted(array $gatewayResponse = []): void
    {
        $this->update([
            'status' => 'completed',
            'captured_at' => now(),
            'gateway_response' => array_merge($this->gateway_response ?? [], $gatewayResponse),
        ]);

        // Update related invoice
        if ($this->invoice) {
            $this->invoice->markAsPaid($this->payment_method, $this->transaction_id);
        }
    }

    /**
     * Mark transaction as failed.
     */
    public function markAsFailed(?string $reason = null, array $gatewayResponse = []): void
    {
        $this->update([
            'status' => 'failed',
            'failed_at' => now(),
            'gateway_message' => $reason,
            'gateway_response' => array_merge($this->gateway_response ?? [], $gatewayResponse),
        ]);

        // Update related invoice
        if ($this->invoice) {
            $this->invoice->markAsFailed();
        }
    }

    /**
     * Process refund.
     */
    public function processRefund(?float $amount = null, ?string $reason = null): void
    {
        $refundAmount = $amount ?? $this->amount;

        $this->update([
            'refund_amount' => $refundAmount,
            'refunded_at' => now(),
            'refund_reason' => $reason,
            'status' => $refundAmount >= $this->amount ? 'refunded' : 'partially_refunded',
        ]);
    }

    /**
     * Update gateway response.
     */
    public function updateGatewayResponse(array $response): void
    {
        $this->update([
            'gateway_response' => array_merge($this->gateway_response ?? [], $response),
            'gateway_status' => $response['status'] ?? $this->gateway_status,
            'gateway_message' => $response['message'] ?? $this->gateway_message,
        ]);
    }

    /**
     * Calculate net amount after fees.
     */
    public function calculateNetAmount(): void
    {
        $netAmount = $this->amount - $this->total_fees - ($this->tax_amount ?? 0);
        $this->update(['net_amount' => max(0, $netAmount)]);
    }

    /**
     * Generate unique transaction ID.
     */
    public static function generateTransactionId(): string
    {
        $prefix = 'TXN';
        $timestamp = now()->timestamp;
        $random = str_pad(mt_rand(0, 9999), 4, '0', STR_PAD_LEFT);

        return $prefix . '-' . $timestamp . '-' . $random;
    }

    /**
     * Scope for completed transactions.
     */
    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed')
                    ->whereNotNull('captured_at');
    }

    /**
     * Scope for successful transactions.
     */
    public function scopeSuccessful($query)
    {
        return $query->where('status', 'successful');
    }

    /**
     * Scope for pending transactions.
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope for failed transactions.
     */
    public function scopeFailed($query)
    {
        return $query->where('status', 'failed');
    }

    /**
     * Scope for refunded transactions.
     */
    public function scopeRefunded($query)
    {
        return $query->where('status', 'refunded')
                    ->orWhere('refund_amount', '>', 0);
    }

    /**
     * Scope for recurring transactions.
     */
    public function scopeRecurring($query)
    {
        return $query->where('payment_type', 'recurring');
    }

    /**
     * Scope for one-time transactions.
     */
    public function scopeOneTime($query)
    {
        return $query->where('payment_type', 'one_time');
    }

    /**
     * Scope for specific status.
     */
    public function scopeByStatus($query, string $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope for specific payment gateway.
     */
    public function scopeGateway($query, string $gateway)
    {
        return $query->where('payment_gateway', $gateway);
    }

    /**
     * Scope for specific payment method.
     */
    public function scopePaymentMethod($query, string $method)
    {
        return $query->where('payment_method', $method);
    }

    /**
     * Scope for high-risk transactions.
     */
    public function scopeHighRisk($query, float $minScore = 0.7)
    {
        return $query->where('fraud_score', '>=', $minScore);
    }

    /**
     * Scope for transactions above certain amount.
     */
    public function scopeAmountAbove($query, float $amount)
    {
        return $query->where('amount', '>=', $amount);
    }

    /**
     * Scope for transactions within date range.
     */
    public function scopeDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('initiated_at', [$startDate, $endDate]);
    }

    /**
     * Order by transaction date.
     */
    public function scopeByDate($query, string $direction = 'desc')
    {
        return $query->orderBy('initiated_at', $direction);
    }

    /**
     * Order by amount.
     */
    public function scopeByAmount($query, string $direction = 'desc')
    {
        return $query->orderBy('amount', $direction);
    }

    /**
     * Search by transaction ID or reference number.
     */
    public function scopeSearch($query, string $term)
    {
        return $query->where(function ($query) use ($term) {
            $query->where('transaction_id', 'LIKE', "%{$term}%")
                  ->orWhere('external_transaction_id', 'LIKE', "%{$term}%")
                  ->orWhere('reference_number', 'LIKE', "%{$term}%");
        });
    }
}
