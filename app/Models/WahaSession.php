<?php

namespace App\Models;

use App\Traits\HasUuid;
use App\Traits\HasStatus;
use App\Traits\BelongsToOrganization;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Carbon\Carbon;

/**
 * WAHA (WhatsApp HTTP API) Session Model
 *
 * Manages WhatsApp sessions through WAHA API integration
 * Handles authentication, health monitoring, and session management
 *
 * @property string $id
 * @property string $organization_id
 * @property string $channel_config_id
 * @property string $session_name
 * @property string $waha_instance_url
 * @property string|null $waha_api_key
 * @property string|null $phone_number
 * @property string|null $business_name
 * @property string|null $business_description
 * @property string|null $business_category
 * @property string|null $business_website
 * @property string|null $business_email
 * @property string $status (waha_session_status enum)
 * @property string|null $qr_code
 * @property Carbon|null $qr_expires_at
 * @property bool $is_authenticated
 * @property Carbon|null $last_seen_at
 * @property string|null $wa_version
 * @property string|null $platform
 * @property int|null $battery_level
 * @property bool $is_connected
 * @property string|null $connection_state
 * @property string|null $webhook_url
 * @property array $webhook_events
 * @property string|null $webhook_secret
 * @property array $features
 * @property array $rate_limits
 * @property string $health_status
 * @property Carbon|null $last_health_check
 * @property int $error_count
 * @property string|null $last_error
 * @property int $restart_count
 * @property int $total_messages_sent
 * @property int $total_messages_received
 * @property int $total_media_sent
 * @property int $total_media_received
 * @property float $uptime_percentage
 * @property array $config
 * @property array $metadata
 * @property string $status_type
 * @property Carbon $created_at
 * @property Carbon $updated_at
 *
 * @property-read Organization $organization
 * @property-read ChannelConfig $channelConfig
 * @property-read \Illuminate\Database\Eloquent\Collection|WahaContact[] $contacts
 * @property-read \Illuminate\Database\Eloquent\Collection|WahaGroup[] $groups
 * @property-read \Illuminate\Database\Eloquent\Collection|WahaMessage[] $messages
 * @property-read \Illuminate\Database\Eloquent\Collection|WahaWebhookEvent[] $webhookEvents
 * @property-read \Illuminate\Database\Eloquent\Collection|WahaApiRequest[] $apiRequests
 * @property-read \Illuminate\Database\Eloquent\Collection|WahaRateLimit[] $rateLimits

 */
class WahaSession extends Model
{
    use HasFactory, HasUuid, HasStatus, BelongsToOrganization;

    protected $table = 'waha_sessions';

    protected $fillable = [
        'organization_id',
        'channel_config_id',
        'session_name',
        'waha_instance_url',
        'waha_api_key',
        'phone_number',
        'instance_id',
        'business_name',
        'business_description',
        'business_category',
        'business_website',
        'business_email',
        'status',
        'qr_code',
        'qr_expires_at',
        'is_authenticated',
        'last_seen_at',
        'wa_version',
        'platform',
        'battery_level',
        'is_connected',
        'connection_state',
        'webhook_url',
        'webhook_secret',
        'features',
        'rate_limits',
        'health_status',
        'last_health_check',
        'error_count',
        'last_error',
        'restart_count',
        'total_messages_sent',
        'total_messages_received',
        'total_media_sent',
        'total_media_received',
        'uptime_percentage',
        'config',
        'metadata',
        'status_type',
    ];

    protected $casts = [
        'qr_expires_at' => 'datetime',
        'is_authenticated' => 'boolean',
        'last_seen_at' => 'datetime',
        'battery_level' => 'integer',
        'is_connected' => 'boolean',
        'features' => 'array',
        'rate_limits' => 'array',
        'last_health_check' => 'datetime',
        'error_count' => 'integer',
        'restart_count' => 'integer',
        'total_messages_sent' => 'integer',
        'total_messages_received' => 'integer',
        'total_media_sent' => 'integer',
        'total_media_received' => 'integer',
        'uptime_percentage' => 'decimal:2',
        'config' => 'array',
        'metadata' => 'array',
    ];

    protected $hidden = [
        'waha_api_key',
        'webhook_secret',
        'qr_code',
    ];

    /**
     * WAHA Session Status Constants
     */
    const STATUS_STARTING = 'starting';
    const STATUS_SCAN_QR = 'scan_qr';
    const STATUS_WORKING = 'working';
    const STATUS_FAILED = 'failed';
    const STATUS_STOPPED = 'stopped';
    const STATUS_STOPPING = 'stopping';

    /**
     * Health Status Constants
     */
    const HEALTH_HEALTHY = 'healthy';
    const HEALTH_WARNING = 'warning';
    const HEALTH_CRITICAL = 'critical';
    const HEALTH_UNKNOWN = 'unknown';

    /**
     * Webhook Event Types Constants
     */
    const WEBHOOK_MESSAGE = 'message';
    const WEBHOOK_MESSAGE_ANY = 'message.any';
    const WEBHOOK_MESSAGE_ACK = 'message.ack';
    const WEBHOOK_STATE_CHANGE = 'state.change';
    const WEBHOOK_GROUP_JOIN = 'group.join';
    const WEBHOOK_GROUP_LEAVE = 'group.leave';
    const WEBHOOK_PRESENCE_UPDATE = 'presence.update';
    const WEBHOOK_CALL = 'call';
    const WEBHOOK_SESSION_STATUS = 'session.status';

    /**
     * Default Features Configuration
     */
    const DEFAULT_FEATURES = [
        'multidevice' => true,
        'groups' => true,
        'broadcast' => false,
        'business' => false,
        'media_upload' => true,
        'voice_messages' => true,
        'location_sharing' => true,
        'contact_sharing' => true,
    ];

    /**
     * Default Rate Limits Configuration
     */
    const DEFAULT_RATE_LIMITS = [
        'messages_per_minute' => 20,
        'messages_per_hour' => 1000,
        'media_per_minute' => 5,
        'media_per_hour' => 100,
    ];

    /**
     * Boot the model
     */
    protected static function boot(): void
    {
        parent::boot();

        static::creating(function (WahaSession $session) {
            if (empty($session->features)) {
                $session->features = self::DEFAULT_FEATURES;
            }
            if (empty($session->rate_limits)) {
                $session->rate_limits = self::DEFAULT_RATE_LIMITS;
            }
        });
    }

    // === RELATIONSHIPS ===

    /**
     * Get the organization that owns this WAHA session
     */
    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    /**
     * Get the channel configuration associated with this session
     */
    public function channelConfig(): BelongsTo
    {
        return $this->belongsTo(ChannelConfig::class);
    }

    /**
     * Get all contacts for this WAHA session
     */
    public function contacts(): HasMany
    {
        return $this->hasMany(WahaContact::class, 'session_id');
    }

    /**
     * Get all groups for this WAHA session
     */
    public function groups(): HasMany
    {
        return $this->hasMany(WahaGroup::class, 'session_id');
    }

    /**
     * Get all messages for this WAHA session
     */
    public function messages(): HasMany
    {
        return $this->hasMany(WahaMessage::class, 'session_id');
    }

    /**
     * Get all webhook events for this session
     */
    public function webhookEvents(): HasMany
    {
        return $this->hasMany(WahaWebhookEvent::class, 'session_id');
    }

    /**
     * Get all API requests for this session
     */
    public function apiRequests(): HasMany
    {
        return $this->hasMany(WahaApiRequest::class, 'session_id');
    }

    /**
     * Get all rate limit records for this session
     */
    public function rateLimits(): HasMany
    {
        return $this->hasMany(WahaRateLimit::class, 'session_id');
    }
    /**
     * Scope for active sessions
     */
    public function scopeActive($query)
    {
        return $query->where('status_type', 'active');
    }

    /**
     * Scope for authenticated sessions
     */
    public function scopeAuthenticated($query)
    {
        return $query->where('is_authenticated', true);
    }

    /**
     * Scope for connected sessions
     */
    public function scopeConnected($query)
    {
        return $query->where('is_connected', true);
    }

    /**
     * Scope for sessions with working status
     */
    public function scopeWorking($query)
    {
        return $query->where('status', self::STATUS_WORKING);
    }

    /**
     * Scope for healthy sessions
     */
    public function scopeHealthy($query)
    {
        return $query->where('health_status', self::HEALTH_HEALTHY);
    }

    /**
     * Scope for sessions by phone number
     */
    public function scopeByPhoneNumber($query, string $phoneNumber)
    {
        return $query->where('phone_number', $phoneNumber);
    }

    // === ACCESSORS & MUTATORS ===

    /**
     * Get the formatted phone number
     */
    protected function formattedPhoneNumber(): Attribute
    {
        return Attribute::make(
            get: fn (?string $value) => $this->phone_number ?
                '+' . ltrim($this->phone_number, '+') : null
        );
    }

    /**
     * Check if QR code is expired
     */
    protected function isQrExpired(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->qr_expires_at && $this->qr_expires_at->isPast()
        );
    }

    /**
     * Get session uptime status
     */
    protected function uptimeStatus(): Attribute
    {
        return Attribute::make(
            get: function () {
                if ($this->uptime_percentage >= 99) return 'excellent';
                if ($this->uptime_percentage >= 95) return 'good';
                if ($this->uptime_percentage >= 85) return 'fair';
                return 'poor';
            }
        );
    }

    /**
     * Check if session needs attention
     */
    protected function needsAttention(): Attribute
    {
        return Attribute::make(
            get: function () {
                return $this->error_count > 5 ||
                       $this->health_status === self::HEALTH_CRITICAL ||
                       ($this->last_health_check && $this->last_health_check->diffInMinutes() > 10) ||
                       !$this->is_connected;
            }
        );
    }

    // === HELPER METHODS ===

    /**
     * Check if session is operational
     */
    public function isOperational(): bool
    {
        return $this->status === self::STATUS_WORKING &&
               $this->is_authenticated &&
               $this->is_connected &&
               $this->health_status === self::HEALTH_HEALTHY;
    }

    /**
     * Check if session can send messages
     */
    public function canSendMessages(): bool
    {
        return $this->isOperational() &&
               !$this->isRateLimited('messages_per_minute');
    }

    /**
     * Check if session can send media
     */
    public function canSendMedia(): bool
    {
        return $this->isOperational() &&
               !$this->isRateLimited('media_per_minute') &&
               ($this->features['media_upload'] ?? false);
    }

    /**
     * Check if rate limited for specific type
     */
    public function isRateLimited(string $limitType): bool
    {
        $currentLimit = $this->rateLimits()
            ->where('limit_type', $limitType)
            ->where('is_exceeded', true)
            ->where('reset_at', '>', now())
            ->exists();

        return $currentLimit;
    }

    /**
     * Get current rate limit usage
     */
    public function getRateLimitUsage(string $limitType): array
    {
        $windowStart = match($limitType) {
            'messages_per_minute', 'media_per_minute' => now()->startOfMinute(),
            'messages_per_hour', 'media_per_hour' => now()->startOfHour(),
            default => now()->startOfMinute(),
        };

        $rateLimit = $this->rateLimits()
            ->where('limit_type', $limitType)
            ->where('window_start', $windowStart)
            ->first();

        if (!$rateLimit) {
            return [
                'current_count' => 0,
                'limit_threshold' => $this->rate_limits[$limitType] ?? 0,
                'percentage' => 0,
                'is_exceeded' => false,
            ];
        }

        $percentage = $rateLimit->limit_threshold > 0 ?
            ($rateLimit->current_count / $rateLimit->limit_threshold) * 100 : 0;

        return [
            'current_count' => $rateLimit->current_count,
            'limit_threshold' => $rateLimit->limit_threshold,
            'percentage' => round($percentage, 2),
            'is_exceeded' => $rateLimit->is_exceeded,
            'reset_at' => $rateLimit->reset_at,
        ];
    }

    /**
     * Update session health status
     */
    public function updateHealthStatus(string $healthStatus, ?string $errorMessage = null): bool
    {
        $data = [
            'health_status' => $healthStatus,
            'last_health_check' => now(),
        ];

        if ($errorMessage) {
            $data['last_error'] = $errorMessage;
            $data['error_count'] = $this->error_count + 1;
        } elseif ($healthStatus === self::HEALTH_HEALTHY) {
            $data['error_count'] = 0;
        }

        return $this->update($data);
    }

    /**
     * Update session statistics
     */
    public function updateStats(array $stats): bool
    {
        $allowedStats = [
            'total_messages_sent',
            'total_messages_received',
            'total_media_sent',
            'total_media_received',
            'uptime_percentage',
        ];

        $updateData = array_intersect_key($stats, array_flip($allowedStats));

        return $this->update($updateData);
    }

    /**
     * Restart session (increment restart count)
     */
    public function restart(): bool
    {
        return $this->update([
            'restart_count' => $this->restart_count + 1,
            'status' => self::STATUS_STARTING,
            'is_connected' => false,
            'error_count' => 0,
        ]);
    }

    /**
     * Mark session as authenticated
     */
    public function markAsAuthenticated(): bool
    {
        return $this->update([
            'is_authenticated' => true,
            'status' => self::STATUS_WORKING,
            'qr_code' => null,
            'qr_expires_at' => null,
        ]);
    }

    /**
     * Set QR code for authentication
     */
    public function setQrCode(string $qrCode, int $expiryMinutes = 5): bool
    {
        return $this->update([
            'qr_code' => $qrCode,
            'qr_expires_at' => now()->addMinutes($expiryMinutes),
            'status' => self::STATUS_SCAN_QR,
        ]);
    }

    /**
     * Update connection status
     */
    public function updateConnectionStatus(bool $isConnected, ?string $connectionState = null): bool
    {
        $data = [
            'is_connected' => $isConnected,
            'last_seen_at' => now(),
        ];

        if ($connectionState) {
            $data['connection_state'] = $connectionState;
        }

        if ($isConnected) {
            $data['health_status'] = self::HEALTH_HEALTHY;
            $data['error_count'] = 0;
        }

        return $this->update($data);
    }

    /**
     * Get session activity summary
     */
    public function getActivitySummary(): array
    {
        return [
            'session_name' => $this->session_name,
            'phone_number' => $this->formatted_phone_number,
            'status' => $this->status,
            'health_status' => $this->health_status,
            'is_operational' => $this->isOperational(),
            'uptime_percentage' => $this->uptime_percentage,
            'total_messages' => $this->total_messages_sent + $this->total_messages_received,
            'total_media' => $this->total_media_sent + $this->total_media_received,
            'last_seen' => $this->last_seen_at?->diffForHumans(),
            'error_count' => $this->error_count,
            'restart_count' => $this->restart_count,
        ];
    }

    /**
     * Get webhook configuration
     */
    public function getWebhookConfig(): array
    {
        return [
            'url' => $this->webhook_url,
            'events' => ['message', 'session.status'],
            'secret' => $this->webhook_secret ? '***' : null,
        ];
    }
}
