<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class WebhookEvent extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'organization_id',
        'subscription_id',
        'gateway',
        'event_type',
        'event_id',
        'status',
        'payload',
        'signature',
        'processed_at',
        'retry_count',
        'next_retry_at',
        'error_message',
        'metadata',
    ];

    protected $casts = [
        'payload' => 'array',
        'metadata' => 'array',
        'processed_at' => 'datetime',
        'next_retry_at' => 'datetime',
    ];

    protected $dates = [
        'processed_at',
        'next_retry_at',
        'created_at',
        'updated_at',
        'deleted_at',
    ];

    // Relationships
    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    public function subscription(): BelongsTo
    {
        return $this->belongsTo(Subscription::class);
    }

    // Scopes
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeProcessed($query)
    {
        return $query->where('status', 'processed');
    }

    public function scopeFailed($query)
    {
        return $query->where('status', 'failed');
    }

    public function scopeRetrying($query)
    {
        return $query->where('status', 'retrying');
    }

    public function scopeByGateway($query, string $gateway)
    {
        return $query->where('gateway', $gateway);
    }

    public function scopeByEventType($query, string $eventType)
    {
        return $query->where('event_type', $eventType);
    }

    public function scopeByOrganization($query, string $organizationId)
    {
        return $query->where('organization_id', $organizationId);
    }

    public function scopeReadyForRetry($query)
    {
        return $query->where('status', 'retrying')
            ->where('next_retry_at', '<=', now())
            ->where('retry_count', '<', 5);
    }

    // Accessors & Mutators
    public function getIsProcessedAttribute(): bool
    {
        return $this->status === 'processed';
    }

    public function getIsFailedAttribute(): bool
    {
        return $this->status === 'failed';
    }

    public function getIsPendingAttribute(): bool
    {
        return $this->status === 'pending';
    }

    public function getIsRetryingAttribute(): bool
    {
        return $this->status === 'retrying';
    }

    public function getCanRetryAttribute(): bool
    {
        return $this->status === 'failed' && $this->retry_count < 5;
    }

    public function getPayloadDataAttribute(): array
    {
        return $this->payload ?? [];
    }

    public function getGatewayDisplayNameAttribute(): string
    {
        return match ($this->gateway) {
            'stripe' => 'Stripe',
            'midtrans' => 'Midtrans',
            'xendit' => 'Xendit',
            default => ucfirst($this->gateway),
        };
    }

    public function getEventTypeDisplayNameAttribute(): string
    {
        return str_replace('_', ' ', ucwords($this->event_type, '_'));
    }

    // Helper Methods
    public function markAsProcessed(): void
    {
        $this->update([
            'status' => 'processed',
            'processed_at' => now(),
            'error_message' => null,
        ]);
    }

    public function markAsFailed(string $errorMessage): void
    {
        $this->update([
            'status' => 'failed',
            'error_message' => $errorMessage,
            'retry_count' => $this->retry_count + 1,
            'next_retry_at' => now()->addMinutes(pow(2, $this->retry_count)), // Exponential backoff
        ]);
    }

    public function markForRetry(): void
    {
        $this->update([
            'status' => 'retrying',
            'next_retry_at' => now()->addMinutes(pow(2, $this->retry_count)),
        ]);
    }

    public function incrementRetryCount(): void
    {
        $this->increment('retry_count');
    }

    public function getRetryDelayMinutes(): int
    {
        return pow(2, $this->retry_count); // Exponential backoff: 1, 2, 4, 8, 16 minutes
    }

    public function isExpired(): bool
    {
        return $this->retry_count >= 5;
    }

    public function getStatusColorAttribute(): string
    {
        return match ($this->status) {
            'pending' => 'yellow',
            'processed' => 'green',
            'failed' => 'red',
            'retrying' => 'blue',
            default => 'gray',
        };
    }

    public function getStatusIconAttribute(): string
    {
        return match ($this->status) {
            'pending' => 'clock',
            'processed' => 'check-circle',
            'failed' => 'x-circle',
            'retrying' => 'refresh-cw',
            default => 'help-circle',
        };
    }
}
