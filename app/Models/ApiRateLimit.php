<?php

namespace App\Models;

use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ApiRateLimit extends Model
{
    use HasFactory, HasUuid;

    protected $table = 'api_rate_limits';

    protected $fillable = [
        'organization_id',
        'api_key_id',
        'ip_address',
        'endpoint',
        'method',
        'requests_count',
        'window_start',
        'window_duration_seconds',
    ];

    protected $casts = [
        'requests_count' => 'integer',
        'window_start' => 'datetime',
        'window_duration_seconds' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the organization this rate limit belongs to.
     */
    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    /**
     * Get the API key this rate limit is for.
     */
    public function apiKey(): BelongsTo
    {
        return $this->belongsTo(ApiKey::class);
    }

    /**
     * Check if rate limit window is still active.
     */
    public function isWindowActive(): bool
    {
        $windowEnd = $this->window_start->addSeconds($this->window_duration_seconds);
        return now()->isBefore($windowEnd);
    }

    /**
     * Check if rate limit window has expired.
     */
    public function isWindowExpired(): bool
    {
        return !$this->isWindowActive();
    }

    /**
     * Get window end time.
     */
    public function getWindowEndAttribute(): \Carbon\Carbon
    {
        return $this->window_start->addSeconds($this->window_duration_seconds);
    }

    /**
     * Get remaining time in window.
     */
    public function getRemainingTimeAttribute(): int
    {
        if ($this->isWindowExpired()) {
            return 0;
        }

        return $this->window_end->diffInSeconds(now());
    }

    /**
     * Get remaining time in human readable format.
     */
    public function getRemainingTimeHumanAttribute(): string
    {
        $seconds = $this->remaining_time;

        if ($seconds < 60) {
            return $seconds . 's';
        } elseif ($seconds < 3600) {
            return round($seconds / 60) . 'm';
        } else {
            return round($seconds / 3600, 1) . 'h';
        }
    }

    /**
     * Get rate limit type.
     */
    public function getTypeAttribute(): string
    {
        if ($this->api_key_id) {
            return 'api_key';
        } elseif ($this->ip_address) {
            return 'ip_address';
        } else {
            return 'organization';
        }
    }

    /**
     * Get rate limit identifier.
     */
    public function getIdentifierAttribute(): string
    {
        return match ($this->type) {
            'api_key' => 'API Key: ' . $this->apiKey->name,
            'ip_address' => 'IP: ' . $this->ip_address,
            'organization' => 'Org: ' . $this->organization->name,
            default => 'Unknown',
        };
    }

    /**
     * Get endpoint display.
     */
    public function getEndpointDisplayAttribute(): string
    {
        return strtoupper($this->method) . ' ' . $this->endpoint;
    }

    /**
     * Increment request count.
     */
    public function incrementRequests(int $count = 1): void
    {
        $this->increment('requests_count', $count);
    }

    /**
     * Reset rate limit window.
     */
    public function resetWindow(): void
    {
        $this->update([
            'requests_count' => 0,
            'window_start' => now(),
        ]);
    }

    /**
     * Check if rate limit is exceeded.
     */
    public function isExceeded(int $limit): bool
    {
        return $this->requests_count >= $limit;
    }

    /**
     * Record API request.
     */
    public static function recordRequest(
        string $organizationId,
        string $endpoint,
        string $method,
        string $apiKeyId = null,
        string $ipAddress = null,
        int $windowDuration = 60
    ): self {
        $key = [
            'organization_id' => $organizationId,
            'endpoint' => $endpoint,
            'method' => strtoupper($method),
        ];

        if ($apiKeyId) {
            $key['api_key_id'] = $apiKeyId;
        }

        if ($ipAddress) {
            $key['ip_address'] = $ipAddress;
        }

        $rateLimit = static::where($key)
                          ->where('window_start', '>', now()->subSeconds($windowDuration))
                          ->first();

        if ($rateLimit && $rateLimit->isWindowActive()) {
            $rateLimit->incrementRequests();
            return $rateLimit;
        }

        return static::create(array_merge($key, [
            'requests_count' => 1,
            'window_start' => now(),
            'window_duration_seconds' => $windowDuration,
        ]));
    }

    /**
     * Check if request is rate limited.
     */
    public static function isRateLimited(
        string $organizationId,
        string $endpoint,
        string $method,
        int $limit,
        int $windowDuration = 60,
        string $apiKeyId = null,
        string $ipAddress = null
    ): array {
        $rateLimit = static::recordRequest(
            $organizationId,
            $endpoint,
            $method,
            $apiKeyId,
            $ipAddress,
            $windowDuration
        );

        $isLimited = $rateLimit->isExceeded($limit);

        return [
            'limited' => $isLimited,
            'current_count' => $rateLimit->requests_count,
            'limit' => $limit,
            'remaining' => max(0, $limit - $rateLimit->requests_count),
            'reset_time' => $rateLimit->window_end->timestamp,
            'retry_after' => $isLimited ? $rateLimit->remaining_time : 0,
        ];
    }

    /**
     * Clean expired rate limit records.
     */
    public static function cleanExpired(): int
    {
        return static::where('window_start', '<', now()->subHours(24))->delete();
    }

    /**
     * Scope for active windows.
     */
    public function scopeActiveWindow($query, int $windowDuration = 60)
    {
        return $query->where('window_start', '>', now()->subSeconds($windowDuration));
    }

    /**
     * Scope for expired windows.
     */
    public function scopeExpiredWindow($query, int $windowDuration = 60)
    {
        return $query->where('window_start', '<=', now()->subSeconds($windowDuration));
    }

    /**
     * Scope for specific API key.
     */
    public function scopeForApiKey($query, $apiKeyId)
    {
        return $query->where('api_key_id', $apiKeyId);
    }

    /**
     * Scope for specific IP address.
     */
    public function scopeForIpAddress($query, string $ipAddress)
    {
        return $query->where('ip_address', $ipAddress);
    }

    /**
     * Scope for specific endpoint.
     */
    public function scopeForEndpoint($query, string $endpoint, string $method = null)
    {
        $query = $query->where('endpoint', $endpoint);

        if ($method) {
            $query->where('method', strtoupper($method));
        }

        return $query;
    }

    /**
     * Scope for high request counts.
     */
    public function scopeHighUsage($query, int $threshold = 100)
    {
        return $query->where('requests_count', '>=', $threshold);
    }

    /**
     * Order by request count.
     */
    public function scopeByRequestCount($query, string $direction = 'desc')
    {
        return $query->orderBy('requests_count', $direction);
    }

    /**
     * Order by window start.
     */
    public function scopeByWindowStart($query, string $direction = 'desc')
    {
        return $query->orderBy('window_start', $direction);
    }
}
