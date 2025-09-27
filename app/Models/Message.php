<?php

namespace App\Models;

use App\Traits\BelongsToOrganization;
use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Message extends Model
{
    use HasFactory, HasUuid, BelongsToOrganization;

    public $timestamps = false; // Disable automatic timestamps

    protected $fillable = [
        'session_id',
        'organization_id',
        'sender_type',
        'sender_id',
        'sender_name',
        'message_text',
        'message_type',
        'media_url',
        'media_type',
        'media_size',
        'media_metadata',
        'thumbnail_url',
        'quick_replies',
        'buttons',
        'template_data',
        'intent',
        'entities',
        'confidence_score',
        'ai_generated',
        'ai_model_used',
        'sentiment_score',
        'sentiment_label',
        'emotion_scores',
        'is_read',
        'read_at',
        'delivered_at',
        'failed_at',
        'failed_reason',
        'reply_to_message_id',
        'thread_id',
        'context',
        'processing_time_ms',
        'metadata',
        'waha_session_id',
        'created_at',
    ];

    protected $casts = [
        'media_metadata' => 'array',
        'quick_replies' => 'array',
        'buttons' => 'array',
        'template_data' => 'array',
        'entities' => 'array',
        'confidence_score' => 'decimal:2',
        'ai_generated' => 'boolean',
        'sentiment_score' => 'decimal:2',
        'emotion_scores' => 'array',
        'is_read' => 'boolean',
        'read_at' => 'datetime',
        'is_edited' => 'boolean',
        'edited_at' => 'datetime',
        'delivered_at' => 'datetime',
        'failed_at' => 'datetime',
        'context' => 'array',
        'metadata' => 'array',
        'created_at' => 'datetime',
    ];

    /**
     * Get the content attribute (alias for message_text).
     */
    public function getContentAttribute()
    {
        return $this->message_text;
    }

    /**
     * Get the chat session this message belongs to.
     */
    public function chatSession(): BelongsTo
    {
        return $this->belongsTo(ChatSession::class, 'session_id');
    }

    /**
     * Get the sender user (if sender is a user).
     */
    public function sender(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    /**
     * Get the customer (if sender is customer).
     */
    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class, 'sender_id');
    }

    /**
     * Get the agent (if sender is agent).
     */
    public function agent(): BelongsTo
    {
        return $this->belongsTo(Agent::class, 'sender_id');
    }

    /**
     * Get the bot personality (if sender is bot).
     */
    public function botPersonality(): BelongsTo
    {
        return $this->belongsTo(BotPersonality::class, 'sender_id');
    }

    /**
     * Get the message this is replying to.
     */
    public function replyTo(): BelongsTo
    {
        return $this->belongsTo(Message::class, 'reply_to_message_id');
    }

    /**
     * Check if message is from customer.
     */
    public function isFromCustomer(): bool
    {
        return $this->sender_type === 'customer';
    }

    /**
     * Check if message is from bot.
     */
    public function isFromBot(): bool
    {
        return $this->sender_type === 'bot';
    }

    /**
     * Check if message is from agent.
     */
    public function isFromAgent(): bool
    {
        return $this->sender_type === 'agent';
    }

    /**
     * Check if message is a system message.
     */
    public function isSystemMessage(): bool
    {
        return $this->sender_type === 'system';
    }

    /**
     * Check if message has media.
     */
    public function hasMedia(): bool
    {
        return !is_null($this->media_url);
    }

    /**
     * Check if message is a reply.
     */
    public function isReply(): bool
    {
        return !is_null($this->reply_to_message_id);
    }

    /**
     * Check if message has been read.
     */
    public function isRead(): bool
    {
        return $this->is_read;
    }

    /**
     * Check if message has been delivered.
     */
    public function isDelivered(): bool
    {
        return !is_null($this->delivered_at);
    }

    /**
     * Check if message delivery failed.
     */
    public function hasFailed(): bool
    {
        return !is_null($this->failed_at);
    }

    /**
     * Get media size in human readable format.
     */
    public function getHumanReadableMediaSizeAttribute(): ?string
    {
        if (!$this->media_size) {
            return null;
        }

        $bytes = $this->media_size;
        $units = ['B', 'KB', 'MB', 'GB'];

        for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
            $bytes /= 1024;
        }

        return round($bytes, 2) . ' ' . $units[$i];
    }

    /**
     * Get sentiment as text.
     */
    public function getSentimentTextAttribute(): string
    {
        return match ($this->sentiment_label) {
            'positive' => 'Positive',
            'negative' => 'Negative',
            'neutral' => 'Neutral',
            default => 'Unknown',
        };
    }

    /**
     * Get confidence percentage.
     */
    public function getConfidencePercentageAttribute(): int
    {
        return round(($this->confidence_score ?? 0) * 100);
    }

    /**
     * Mark message as read.
     */
    public function markAsRead(): void
    {
        if (!$this->is_read) {
            $this->update([
                'is_read' => true,
                'read_at' => now(),
            ]);
        }
    }

    /**
     * Mark message as delivered.
     */
    public function markAsDelivered(): void
    {
        if (!$this->delivered_at) {
            $this->update(['delivered_at' => now()]);
        }
    }

    /**
     * Mark message as failed.
     */
    public function markAsFailed(string $reason = null): void
    {
        $this->update([
            'failed_at' => now(),
            'failed_reason' => $reason,
        ]);
    }

    /**
     * Get processing time in human readable format.
     */
    public function getProcessingTimeHumanAttribute(): ?string
    {
        if (!$this->processing_time_ms) {
            return null;
        }

        if ($this->processing_time_ms < 1000) {
            return $this->processing_time_ms . 'ms';
        }

        return round($this->processing_time_ms / 1000, 2) . 's';
    }

    /**
     * Scope for messages from specific sender type.
     */
    public function scopeFromSenderType($query, string $senderType)
    {
        return $query->where('sender_type', $senderType);
    }

    /**
     * Scope for customer messages.
     */
    public function scopeFromCustomer($query)
    {
        return $query->where('sender_type', 'customer');
    }

    /**
     * Scope for bot messages.
     */
    public function scopeFromBot($query)
    {
        return $query->where('sender_type', 'bot');
    }

    /**
     * Scope for agent messages.
     */
    public function scopeFromAgent($query)
    {
        return $query->where('sender_type', 'agent');
    }

    /**
     * Scope for system messages.
     */
    public function scopeSystemMessages($query)
    {
        return $query->where('sender_type', 'system');
    }

    /**
     * Scope for messages with media.
     */
    public function scopeWithMedia($query)
    {
        return $query->whereNotNull('media_url');
    }

    /**
     * Scope for text messages only.
     */
    public function scopeTextOnly($query)
    {
        return $query->where('message_type', 'text')
                    ->whereNull('media_url');
    }

    /**
     * Scope for AI generated messages.
     */
    public function scopeAiGenerated($query)
    {
        return $query->where('ai_generated', true);
    }

    /**
     * Scope for messages with specific intent.
     */
    public function scopeWithIntent($query, string $intent)
    {
        return $query->where('intent', $intent);
    }

    /**
     * Scope for messages with specific sentiment.
     */
    public function scopeWithSentiment($query, string $sentiment)
    {
        return $query->where('sentiment_label', $sentiment);
    }

    /**
     * Scope for positive sentiment messages.
     */
    public function scopePositiveSentiment($query)
    {
        return $query->where('sentiment_label', 'positive');
    }

    /**
     * Scope for negative sentiment messages.
     */
    public function scopeNegativeSentiment($query)
    {
        return $query->where('sentiment_label', 'negative');
    }

    /**
     * Scope for unread messages.
     */
    public function scopeUnread($query)
    {
        return $query->where('is_read', false);
    }

    /**
     * Scope for failed messages.
     */
    public function scopeFailed($query)
    {
        return $query->whereNotNull('failed_at');
    }

    /**
     * Scope for messages within date range.
     */
    public function scopeDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('created_at', [$startDate, $endDate]);
    }

    /**
     * Order by creation time.
     */
    public function scopeByTime($query, string $direction = 'desc')
    {
        return $query->orderBy('created_at', $direction);
    }

    /**
     * Search in message text.
     */
    public function scopeSearch($query, string $term)
    {
        return $query->where('message_text', 'LIKE', "%{$term}%");
    }
}
