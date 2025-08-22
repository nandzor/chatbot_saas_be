<?php

namespace App\Models;

use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WebhookDelivery extends Model
{
    use HasFactory, HasUuid;

    protected $table = 'webhook_deliveries';

    protected $fillable = [
        'webhook_id',
        'event_type',
        'payload',
        'http_status',
        'response_body',
        'response_headers',
        'delivered_at',
        'response_time_ms',
        'attempt_number',
        'is_success',
        'error_message',
        'next_retry_at',
    ];

    protected $casts = [
        'payload' => 'array',
        'response_headers' => 'array',
        'delivered_at' => 'datetime',
        'is_success' => 'boolean',
        'next_retry_at' => 'datetime',
        'created_at' => 'datetime',
    ];

    public $timestamps = false; // Only has created_at from schema

    /**
     * Boot the model.
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (!$model->created_at) {
                $model->created_at = now();
            }
        });
    }

    /**
     * Get the webhook this delivery belongs to.
     */
    public function webhook(): BelongsTo
    {
        return $this->belongsTo(Webhook::class);
    }

    /**
     * Get the organization through the webhook.
     */
    public function getOrganizationAttribute()
    {
        return $this->webhook?->organization;
    }

    /**
     * Check if delivery was successful.
     */
    public function isSuccessful(): bool
    {
        return $this->is_success;
    }

    /**
     * Check if delivery failed.
     */
    public function isFailed(): bool
    {
        return !$this->is_success;
    }

    /**
     * Check if delivery is pending retry.
     */
    public function isPendingRetry(): bool
    {
        return !$this->is_success &&
               $this->next_retry_at &&
               $this->next_retry_at->isFuture();
    }

    /**
     * Check if delivery is ready for retry.
     */
    public function isReadyForRetry(): bool
    {
        return !$this->is_success &&
               $this->next_retry_at &&
               $this->next_retry_at->isPast() &&
               $this->attempt_number < ($this->webhook->max_retries ?? 3);
    }

    /**
     * Check if delivery has exhausted retries.
     */
    public function hasExhaustedRetries(): bool
    {
        return !$this->is_success &&
               $this->attempt_number >= ($this->webhook->max_retries ?? 3);
    }

    /**
     * Get delivery status.
     */
    public function getStatusAttribute(): string
    {
        if ($this->is_success) {
            return 'success';
        }

        if ($this->hasExhaustedRetries()) {
            return 'failed';
        }

        if ($this->isPendingRetry()) {
            return 'retrying';
        }

        return 'pending';
    }

    /**
     * Get status color.
     */
    public function getStatusColorAttribute(): string
    {
        return match ($this->status) {
            'success' => 'green',
            'failed' => 'red',
            'retrying' => 'yellow',
            'pending' => 'blue',
            default => 'gray',
        };
    }

    /**
     * Get HTTP status category.
     */
    public function getHttpStatusCategoryAttribute(): string
    {
        if (!$this->http_status) {
            return 'unknown';
        }

        return match (intval($this->http_status / 100)) {
            2 => 'success',
            3 => 'redirect',
            4 => 'client_error',
            5 => 'server_error',
            default => 'unknown',
        };
    }

    /**
     * Get response time in human readable format.
     */
    public function getResponseTimeHumanAttribute(): ?string
    {
        if (!$this->response_time_ms) {
            return null;
        }

        if ($this->response_time_ms < 1000) {
            return $this->response_time_ms . 'ms';
        }

        return round($this->response_time_ms / 1000, 2) . 's';
    }

    /**
     * Get time until next retry.
     */
    public function getTimeUntilRetryAttribute(): ?string
    {
        if (!$this->next_retry_at) {
            return null;
        }

        if ($this->next_retry_at->isPast()) {
            return 'Ready now';
        }

        return $this->next_retry_at->diffForHumans();
    }

    /**
     * Mark delivery as successful.
     */
    public function markAsSuccessful(int $httpStatus, string $responseBody = null, array $responseHeaders = [], int $responseTime = null): void
    {
        $this->update([
            'is_success' => true,
            'http_status' => $httpStatus,
            'response_body' => $responseBody,
            'response_headers' => $responseHeaders,
            'delivered_at' => now(),
            'response_time_ms' => $responseTime,
            'error_message' => null,
            'next_retry_at' => null,
        ]);

        // Update webhook success stats
        $this->webhook->recordSuccess();
    }

    /**
     * Mark delivery as failed.
     */
    public function markAsFailed(int $httpStatus = null, string $errorMessage = null, string $responseBody = null, array $responseHeaders = [], int $responseTime = null): void
    {
        $nextRetryAt = null;

        // Calculate next retry time if retries are available
        if ($this->attempt_number < ($this->webhook->max_retries ?? 3)) {
            $retryDelay = $this->calculateRetryDelay();
            $nextRetryAt = now()->addSeconds($retryDelay);
        }

        $this->update([
            'is_success' => false,
            'http_status' => $httpStatus,
            'response_body' => $responseBody,
            'response_headers' => $responseHeaders,
            'delivered_at' => now(),
            'response_time_ms' => $responseTime,
            'error_message' => $errorMessage,
            'next_retry_at' => $nextRetryAt,
        ]);

        // Update webhook failure stats
        $this->webhook->recordFailure();
    }

    /**
     * Calculate retry delay using exponential backoff.
     */
    private function calculateRetryDelay(): int
    {
        // Exponential backoff: 30s, 1m, 2m, 4m, 8m, etc.
        $baseDelay = 30; // 30 seconds
        return $baseDelay * pow(2, $this->attempt_number - 1);
    }

    /**
     * Create retry attempt.
     */
    public function createRetryAttempt(): self
    {
        return static::create([
            'webhook_id' => $this->webhook_id,
            'event_type' => $this->event_type,
            'payload' => $this->payload,
            'attempt_number' => $this->attempt_number + 1,
        ]);
    }

    /**
     * Get payload size in bytes.
     */
    public function getPayloadSizeAttribute(): int
    {
        return strlen(json_encode($this->payload ?? []));
    }

    /**
     * Get payload size in human readable format.
     */
    public function getPayloadSizeHumanAttribute(): string
    {
        $bytes = $this->payload_size;

        if ($bytes < 1024) {
            return $bytes . ' B';
        } elseif ($bytes < 1048576) {
            return round($bytes / 1024, 2) . ' KB';
        } else {
            return round($bytes / 1048576, 2) . ' MB';
        }
    }

    /**
     * Scope for successful deliveries.
     */
    public function scopeSuccessful($query)
    {
        return $query->where('is_success', true);
    }

    /**
     * Scope for failed deliveries.
     */
    public function scopeFailed($query)
    {
        return $query->where('is_success', false);
    }

    /**
     * Scope for deliveries pending retry.
     */
    public function scopePendingRetry($query)
    {
        return $query->where('is_success', false)
                    ->whereNotNull('next_retry_at')
                    ->where('next_retry_at', '>', now());
    }

    /**
     * Scope for deliveries ready for retry.
     */
    public function scopeReadyForRetry($query)
    {
        return $query->where('is_success', false)
                    ->whereNotNull('next_retry_at')
                    ->where('next_retry_at', '<=', now())
                    ->whereHas('webhook', function ($query) {
                        $query->whereRaw('webhook_deliveries.attempt_number < webhooks.max_retries');
                    });
    }

    /**
     * Scope for specific webhook.
     */
    public function scopeForWebhook($query, $webhookId)
    {
        return $query->where('webhook_id', $webhookId);
    }

    /**
     * Scope for specific event type.
     */
    public function scopeForEventType($query, string $eventType)
    {
        return $query->where('event_type', $eventType);
    }

    /**
     * Scope for specific HTTP status range.
     */
    public function scopeWithHttpStatus($query, int $min, int $max = null)
    {
        if ($max === null) {
            return $query->where('http_status', $min);
        }

        return $query->whereBetween('http_status', [$min, $max]);
    }

    /**
     * Scope for recent deliveries.
     */
    public function scopeRecent($query, int $hours = 24)
    {
        return $query->where('created_at', '>', now()->subHours($hours));
    }

    /**
     * Order by delivery time.
     */
    public function scopeByDeliveryTime($query, string $direction = 'desc')
    {
        return $query->orderBy('delivered_at', $direction);
    }

    /**
     * Order by attempt number.
     */
    public function scopeByAttemptNumber($query, string $direction = 'asc')
    {
        return $query->orderBy('attempt_number', $direction);
    }
}
