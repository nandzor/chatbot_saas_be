<?php

namespace App\Models;

use App\Traits\BelongsToOrganization;
use App\Traits\HasStatus;
use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ChannelConfig extends Model
{
    use HasFactory, HasUuid, BelongsToOrganization, HasStatus;

    protected $table = 'channel_configs';

    protected $fillable = [
        'organization_id',
        'channel',
        'channel_identifier',
        'name',
        'display_name',
        'description',
        'personality_id',
        'webhook_url',
        'api_key_encrypted',
        'api_secret_encrypted',
        'access_token_encrypted',
        'refresh_token_encrypted',
        'token_expires_at',
        'settings',
        'rate_limits',
        'widget_config',
        'theme_config',
        'supported_message_types',
        'features',
        'is_active',
        'health_status',
        'last_connected_at',
        'last_error',
        'connection_attempts',
        'total_messages_sent',
        'total_messages_received',
        'uptime_percentage',
        'status',
    ];

    protected $casts = [
        'token_expires_at' => 'datetime',
        'settings' => 'array',
        'rate_limits' => 'array',
        'widget_config' => 'array',
        'theme_config' => 'array',
        'supported_message_types' => 'array',
        'features' => 'array',
        'is_active' => 'boolean',
        'last_connected_at' => 'datetime',
        'uptime_percentage' => 'decimal:2',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    protected $hidden = [
        'api_key_encrypted',
        'api_secret_encrypted',
        'access_token_encrypted',
        'refresh_token_encrypted',
    ];

    /**
     * Get the bot personality for this channel.
     */
    public function personality(): BelongsTo
    {
        return $this->belongsTo(BotPersonality::class, 'personality_id');
    }

    /**
     * Get the chat sessions for this channel.
     */
    public function chatSessions(): HasMany
    {
        return $this->hasMany(ChatSession::class);
    }

    /**
     * Get the active chat sessions.
     */
    public function activeChatSessions(): HasMany
    {
        return $this->chatSessions()->where('is_active', true);
    }

    /**
     * Check if channel is active.
     */
    public function isActive(): bool
    {
        return $this->is_active && $this->status === 'active';
    }

    /**
     * Check if channel is connected.
     */
    public function isConnected(): bool
    {
        return $this->health_status === 'healthy' && $this->isActive();
    }

    /**
     * Check if channel has errors.
     */
    public function hasErrors(): bool
    {
        return !is_null($this->last_error);
    }

    /**
     * Check if token is expired.
     */
    public function isTokenExpired(): bool
    {
        return $this->token_expires_at && $this->token_expires_at->isPast();
    }

    /**
     * Check if channel supports specific message type.
     */
    public function supportsMessageType(string $type): bool
    {
        return in_array($type, $this->supported_message_types ?? []);
    }

    /**
     * Check if channel has specific feature.
     */
    public function hasFeature(string $feature): bool
    {
        $features = $this->features ?? [];
        return isset($features[$feature]) && $features[$feature] === true;
    }

    /**
     * Get rate limit for specific type.
     */
    public function getRateLimit(string $type): ?int
    {
        $limits = $this->rate_limits ?? [];
        return $limits[$type] ?? null;
    }

    /**
     * Get uptime percentage.
     */
    public function getUptimePercentageAttribute(): float
    {
        return round($this->attributes['uptime_percentage'] ?? 0, 2);
    }

    /**
     * Get health status color.
     */
    public function getHealthStatusColorAttribute(): string
    {
        return match ($this->health_status) {
            'healthy' => 'green',
            'warning' => 'yellow',
            'error' => 'red',
            default => 'gray',
        };
    }

    /**
     * Get channel type display name.
     */
    public function getChannelDisplayNameAttribute(): string
    {
        return match ($this->channel) {
            'whatsapp' => 'WhatsApp',
            'wordpress_sdk' => 'WordPress SDK',
            'telegram' => 'Telegram',
            'webchat' => 'Web Chat',
            'facebook' => 'Facebook Messenger',
            'instagram' => 'Instagram',
            'line' => 'LINE',
            'slack' => 'Slack',
            'discord' => 'Discord',
            'teams' => 'Microsoft Teams',
            'viber' => 'Viber',
            'wechat' => 'WeChat',
            default => ucfirst($this->channel),
        };
    }

    /**
     * Get connection status description.
     */
    public function getConnectionStatusAttribute(): string
    {
        if (!$this->is_active) {
            return 'Inactive';
        }

        return match ($this->health_status) {
            'healthy' => 'Connected',
            'warning' => 'Issues detected',
            'error' => 'Connection failed',
            default => 'Unknown',
        };
    }

    /**
     * Record successful connection.
     */
    public function recordConnection(): void
    {
        $this->update([
            'last_connected_at' => now(),
            'health_status' => 'healthy',
            'last_error' => null,
            'connection_attempts' => 0,
        ]);
    }

    /**
     * Record connection error.
     */
    public function recordError(string $error): void
    {
        $this->update([
            'health_status' => 'error',
            'last_error' => $error,
        ]);

        $this->increment('connection_attempts');
    }

    /**
     * Record message sent.
     */
    public function recordMessageSent(): void
    {
        $this->increment('total_messages_sent');
    }

    /**
     * Record message received.
     */
    public function recordMessageReceived(): void
    {
        $this->increment('total_messages_received');
    }

    /**
     * Update uptime percentage.
     */
    public function updateUptime(float $percentage): void
    {
        $this->update(['uptime_percentage' => $percentage]);
    }

    /**
     * Activate channel.
     */
    public function activate(): void
    {
        $this->update(['is_active' => true]);
    }

    /**
     * Deactivate channel.
     */
    public function deactivate(): void
    {
        $this->update(['is_active' => false]);
    }

    /**
     * Test connection.
     */
    public function testConnection(): bool
    {
        // Implementation would depend on specific channel requirements
        // This is a placeholder that always returns true
        $this->recordConnection();
        return true;
    }

    /**
     * Refresh access token if needed.
     */
    public function refreshTokenIfNeeded(): bool
    {
        if (!$this->isTokenExpired()) {
            return true;
        }

        // Implementation would depend on specific channel OAuth flow
        // This is a placeholder
        return false;
    }

    /**
     * Get widget embed code.
     */
    public function getWidgetEmbedCode(): ?string
    {
        if ($this->channel !== 'webchat') {
            return null;
        }

        $config = $this->widget_config ?? [];
        $theme = $this->theme_config ?? [];

        return sprintf(
            '<script src="/widget.js" data-channel-id="%s" data-config=\'%s\'></script>',
            $this->id,
            json_encode(array_merge($config, $theme))
        );
    }

    /**
     * Scope for active channels.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true)
                    ->where('status', 'active');
    }

    /**
     * Scope for connected channels.
     */
    public function scopeConnected($query)
    {
        return $query->where('is_active', true)
                    ->where('health_status', 'healthy');
    }

    /**
     * Scope for specific channel type.
     */
    public function scopeChannelType($query, string $channel)
    {
        return $query->where('channel', $channel);
    }

    /**
     * Scope for channels with errors.
     */
    public function scopeWithErrors($query)
    {
        return $query->whereNotNull('last_error');
    }

    /**
     * Scope for channels with expired tokens.
     */
    public function scopeExpiredTokens($query)
    {
        return $query->whereNotNull('token_expires_at')
                    ->where('token_expires_at', '<', now());
    }

    /**
     * Scope for high uptime channels.
     */
    public function scopeHighUptime($query, float $minUptime = 95.0)
    {
        return $query->where('uptime_percentage', '>=', $minUptime);
    }

    /**
     * Scope for low uptime channels.
     */
    public function scopeLowUptime($query, float $maxUptime = 90.0)
    {
        return $query->where('uptime_percentage', '<=', $maxUptime);
    }

    /**
     * Order by uptime percentage.
     */
    public function scopeByUptime($query, string $direction = 'desc')
    {
        return $query->orderBy('uptime_percentage', $direction);
    }

    /**
     * Order by message volume.
     */
    public function scopeByMessageVolume($query, string $direction = 'desc')
    {
        return $query->orderByRaw('(total_messages_sent + total_messages_received) ' . $direction);
    }

    /**
     * Search by name or channel identifier.
     */
    public function scopeSearch($query, string $term)
    {
        return $query->where(function ($query) use ($term) {
            $query->where('name', 'LIKE', "%{$term}%")
                  ->orWhere('display_name', 'LIKE', "%{$term}%")
                  ->orWhere('channel_identifier', 'LIKE', "%{$term}%")
                  ->orWhere('channel', 'LIKE', "%{$term}%");
        });
    }
}
