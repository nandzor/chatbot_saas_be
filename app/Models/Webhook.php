<?php

namespace App\Models;

use App\Traits\BelongsToOrganization;
use App\Traits\HasStatus;
use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Webhook extends Model
{
    use HasFactory, HasUuid, BelongsToOrganization, HasStatus;

    protected $table = 'webhooks';

    protected $fillable = [
        'organization_id',
        'name',
        'url',
        'events',
        'secret',
        'headers',
        'is_active',
        'last_triggered_at',
        'last_success_at',
        'last_failure_at',
        'failure_count',
        'max_retries',
        'status',
    ];

    protected $casts = [
        'events' => 'array',
        'headers' => 'array',
        'is_active' => 'boolean',
        'last_triggered_at' => 'datetime',
        'last_success_at' => 'datetime',
        'last_failure_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    protected $hidden = [
        'secret',
    ];

    /**
     * Get the webhook deliveries.
     */
    public function deliveries(): HasMany
    {
        return $this->hasMany(WebhookDelivery::class);
    }

    /**
     * Get successful deliveries.
     */
    public function successfulDeliveries(): HasMany
    {
        return $this->deliveries()->where('is_success', true);
    }

    /**
     * Get failed deliveries.
     */
    public function failedDeliveries(): HasMany
    {
        return $this->deliveries()->where('is_success', false);
    }

    /**
     * Get recent deliveries.
     */
    public function recentDeliveries(int $limit = 10): HasMany
    {
        return $this->deliveries()->latest('created_at')->limit($limit);
    }

    /**
     * Check if webhook is active.
     */
    public function isActive(): bool
    {
        return $this->is_active && $this->status === 'active';
    }

    /**
     * Check if webhook has failed recently.
     */
    public function hasRecentFailures(): bool
    {
        return $this->failure_count > 0 &&
               $this->last_failure_at &&
               $this->last_failure_at->isAfter($this->last_success_at);
    }

    /**
     * Check if webhook is healthy.
     */
    public function isHealthy(): bool
    {
        if (!$this->isActive()) {
            return false;
        }

        // No recent failures
        if ($this->hasRecentFailures()) {
            return false;
        }

        // Has recent successful delivery
        if ($this->last_success_at && $this->last_success_at->isAfter(now()->subHours(24))) {
            return true;
        }

        // No deliveries yet but webhook is new
        if (!$this->last_triggered_at && $this->created_at->isAfter(now()->subHour())) {
            return true;
        }

        return false;
    }

    /**
     * Get webhook health status.
     */
    public function getHealthStatusAttribute(): string
    {
        if (!$this->isActive()) {
            return 'inactive';
        }

        if ($this->isHealthy()) {
            return 'healthy';
        }

        if ($this->hasRecentFailures()) {
            return 'failing';
        }

        return 'unknown';
    }

    /**
     * Get health status color.
     */
    public function getHealthStatusColorAttribute(): string
    {
        return match ($this->health_status) {
            'healthy' => 'green',
            'failing' => 'red',
            'inactive' => 'gray',
            default => 'yellow',
        };
    }

    /**
     * Get success rate percentage.
     */
    public function getSuccessRateAttribute(): float
    {
        $totalDeliveries = $this->deliveries()->count();

        if ($totalDeliveries === 0) {
            return 0;
        }

        $successfulDeliveries = $this->successfulDeliveries()->count();
        return round(($successfulDeliveries / $totalDeliveries) * 100, 2);
    }

    /**
     * Check if webhook listens to specific event.
     */
    public function listensToEvent(string $event): bool
    {
        return in_array($event, $this->events ?? []);
    }

    /**
     * Add event to webhook.
     */
    public function addEvent(string $event): void
    {
        $events = $this->events ?? [];

        if (!in_array($event, $events)) {
            $events[] = $event;
            $this->update(['events' => $events]);
        }
    }

    /**
     * Remove event from webhook.
     */
    public function removeEvent(string $event): void
    {
        $events = $this->events ?? [];
        $events = array_filter($events, fn($e) => $e !== $event);
        $this->update(['events' => array_values($events)]);
    }

    /**
     * Add custom header.
     */
    public function addHeader(string $key, string $value): void
    {
        $headers = $this->headers ?? [];
        $headers[$key] = $value;
        $this->update(['headers' => $headers]);
    }

    /**
     * Remove custom header.
     */
    public function removeHeader(string $key): void
    {
        $headers = $this->headers ?? [];
        unset($headers[$key]);
        $this->update(['headers' => $headers]);
    }

    /**
     * Record successful delivery.
     */
    public function recordSuccess(): void
    {
        $this->update([
            'last_triggered_at' => now(),
            'last_success_at' => now(),
            'failure_count' => 0,
        ]);
    }

    /**
     * Record failed delivery.
     */
    public function recordFailure(): void
    {
        $this->update([
            'last_triggered_at' => now(),
            'last_failure_at' => now(),
        ]);

        $this->increment('failure_count');
    }

    /**
     * Reset failure count.
     */
    public function resetFailures(): void
    {
        $this->update(['failure_count' => 0]);
    }

    /**
     * Activate webhook.
     */
    public function activate(): void
    {
        $this->update(['is_active' => true]);
    }

    /**
     * Deactivate webhook.
     */
    public function deactivate(): void
    {
        $this->update(['is_active' => false]);
    }

    /**
     * Test webhook with sample payload.
     */
    public function test(array $payload = []): WebhookDelivery
    {
        $testPayload = $payload ?: [
            'event_type' => 'webhook.test',
            'data' => [
                'message' => 'This is a test webhook delivery',
                'timestamp' => now()->toISOString(),
            ],
            'webhook_id' => $this->id,
        ];

        return WebhookDelivery::create([
            'webhook_id' => $this->id,
            'event_type' => 'webhook.test',
            'payload' => $testPayload,
            'attempt_number' => 1,
        ]);
    }

    /**
     * Generate webhook secret.
     */
    public static function generateSecret(): string
    {
        return 'whsec_' . bin2hex(random_bytes(32));
    }

    /**
     * Scope for active webhooks.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true)
                    ->where('status', 'active');
    }

    /**
     * Scope for webhooks listening to specific event.
     */
    public function scopeListeningToEvent($query, string $event)
    {
        return $query->whereJsonContains('events', $event);
    }

    /**
     * Scope for healthy webhooks.
     */
    public function scopeHealthy($query)
    {
        return $query->where('is_active', true)
                    ->where('status', 'active')
                    ->where(function ($query) {
                        $query->where('failure_count', 0)
                              ->orWhere('last_success_at', '>', 'last_failure_at');
                    });
    }

    /**
     * Scope for failing webhooks.
     */
    public function scopeFailing($query)
    {
        return $query->where('is_active', true)
                    ->where('failure_count', '>', 0)
                    ->where('last_failure_at', '>', 'last_success_at');
    }

    /**
     * Scope for webhooks with recent activity.
     */
    public function scopeWithRecentActivity($query, int $hours = 24)
    {
        return $query->where('last_triggered_at', '>', now()->subHours($hours));
    }

    /**
     * Order by last triggered.
     */
    public function scopeByLastTriggered($query, string $direction = 'desc')
    {
        return $query->orderBy('last_triggered_at', $direction);
    }

    /**
     * Order by success rate.
     */
    public function scopeBySuccessRate($query, string $direction = 'desc')
    {
        return $query->withCount(['deliveries', 'successfulDeliveries'])
                    ->orderByRaw('(successful_deliveries_count / NULLIF(deliveries_count, 0)) ' . $direction);
    }

    /**
     * Search webhooks.
     */
    public function scopeSearch($query, string $term)
    {
        return $query->where(function ($query) use ($term) {
            $query->where('name', 'LIKE', "%{$term}%")
                  ->orWhere('url', 'LIKE', "%{$term}%")
                  ->orWhereJsonContains('events', $term);
        });
    }
}
