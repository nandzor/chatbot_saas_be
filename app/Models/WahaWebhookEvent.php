<?php

namespace App\Models;

use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class WahaWebhookEvent extends Model
{
    use HasFactory, HasUuid;

    protected $table = 'waha_webhook_events';

    protected $fillable = [
        'session_id',
        'organization_id',
        'event_type',
        'event_data',
        'is_processed',
        'processed_at',
        'processing_error',
        'retry_count',
        'message_id',
        'wa_message_id',
        'request_headers',
        'request_body',
        'user_agent',
        'ip_address',
        'response_status',
        'response_time_ms',
        'received_at',
    ];

    protected $casts = [
        'event_data' => 'array',
        'is_processed' => 'boolean',
        'processed_at' => 'datetime',
        'retry_count' => 'integer',
        'request_headers' => 'array',
        'response_status' => 'integer',
        'response_time_ms' => 'integer',
        'received_at' => 'datetime',
    ];

    public function session(): BelongsTo
    {
        return $this->belongsTo(WahaSession::class, 'session_id');
    }

    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    public function message(): BelongsTo
    {
        return $this->belongsTo(Message::class);
    }
}
