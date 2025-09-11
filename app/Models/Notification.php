<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Notification extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'organization_id',
        'type',
        'title',
        'message',
        'data',
        'is_read',
        'status',
        'sent_at',
        'email_sent_at',
        'email_status',
        'email_error',
        'email_failed_at',
        'webhook_sent_at',
        'webhook_status',
        'webhook_error',
        'webhook_failed_at',
        'webhook_response',
        'in_app_sent_at',
        'in_app_status',
        'in_app_error',
        'in_app_failed_at',
        'error_message',
        'failed_at',
        'sms_sent_at',
        'sms_status',
        'sms_error',
        'sms_failed_at',
        'sms_provider',
        'sms_message_id',
        'push_sent_at',
        'push_status',
        'push_error',
        'push_failed_at',
        'push_provider',
        'push_message_id',
        'push_success_count',
        'push_failure_count',
        'scheduled_at',
        'timezone',
        'cancelled_at',
        'read_at',
        'user_agent',
        'ip_address',
        'metadata',
        'correlation_id',
        'retry_count',
        'last_retry_at',
        'delivery_confirmed',
        'delivery_confirmed_at'
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'data' => 'array',
        'is_read' => 'boolean',
        'sent_at' => 'datetime',
        'email_sent_at' => 'datetime',
        'email_failed_at' => 'datetime',
        'webhook_sent_at' => 'datetime',
        'webhook_failed_at' => 'datetime',
        'in_app_sent_at' => 'datetime',
        'in_app_failed_at' => 'datetime',
        'failed_at' => 'datetime',
        'sms_sent_at' => 'datetime',
        'sms_failed_at' => 'datetime',
        'push_sent_at' => 'datetime',
        'push_failed_at' => 'datetime',
        'push_success_count' => 'integer',
        'push_failure_count' => 'integer',
        'scheduled_at' => 'datetime',
        'cancelled_at' => 'datetime',
        'read_at' => 'datetime',
        'last_retry_at' => 'datetime',
        'delivery_confirmed' => 'boolean',
        'delivery_confirmed_at' => 'datetime',
        'metadata' => 'array',
        'retry_count' => 'integer'
    ];

    /**
     * Get the organization that owns the notification.
     */
    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    /**
     * Scope a query to only include unread notifications.
     */
    public function scopeUnread($query)
    {
        return $query->where('is_read', false);
    }

    /**
     * Scope a query to only include read notifications.
     */
    public function scopeRead($query)
    {
        return $query->where('is_read', true);
    }

    /**
     * Scope a query to only include notifications by type.
     */
    public function scopeOfType($query, string $type)
    {
        return $query->where('type', $type);
    }

    /**
     * Scope a query to only include pending notifications.
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope a query to only include sent notifications.
     */
    public function scopeSent($query)
    {
        return $query->where('status', 'sent');
    }

    /**
     * Scope a query to only include failed notifications.
     */
    public function scopeFailed($query)
    {
        return $query->where('status', 'failed');
    }

    /**
     * Mark notification as read.
     */
    public function markAsRead(): bool
    {
        return $this->update(['is_read' => true]);
    }

    /**
     * Mark notification as unread.
     */
    public function markAsUnread(): bool
    {
        return $this->update(['is_read' => false]);
    }

    /**
     * Check if notification is read.
     */
    public function isRead(): bool
    {
        return $this->is_read;
    }

    /**
     * Check if notification is unread.
     */
    public function isUnread(): bool
    {
        return !$this->is_read;
    }

    /**
     * Get notification status.
     */
    public function getStatus(): string
    {
        return $this->status ?? 'pending';
    }

    /**
     * Check if notification is pending.
     */
    public function isPending(): bool
    {
        return $this->getStatus() === 'pending';
    }

    /**
     * Check if notification is sent.
     */
    public function isSent(): bool
    {
        return $this->getStatus() === 'sent';
    }

    /**
     * Check if notification is failed.
     */
    public function isFailed(): bool
    {
        return $this->getStatus() === 'failed';
    }
}
