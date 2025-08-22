<?php

namespace App\Models;

use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class WahaMessage extends Model
{
    use HasFactory, HasUuid;

    protected $table = 'waha_messages';

    protected $fillable = [
        'message_id',
        'session_id',
        'wa_message_id',
        'wa_chat_id',
        'wa_message_type',
        'message_status',
        'from_wa_id',
        'from_name',
        'is_from_me',
        'chat_type',
        'group_id',
        'body',
        'caption',
        'media_type',
        'media_url',
        'media_size',
        'media_filename',
        'media_mimetype',
        'media_sha256',
        'media_duration',
        'location_latitude',
        'location_longitude',
        'location_name',
        'location_address',
        'contact_vcard',
        'contact_name',
        'contact_phone',
        'quoted_message_id',
        'quoted_content',
        'is_forwarded',
        'forward_score',
        'reactions',
        'sent_at',
        'delivered_at',
        'read_at',
        'played_at',
        'error_code',
        'error_message',
        'retry_count',
        'metadata',
    ];

    protected $casts = [
        'is_from_me' => 'boolean',
        'media_size' => 'integer',
        'media_duration' => 'integer',
        'location_latitude' => 'decimal:8',
        'location_longitude' => 'decimal:8',
        'is_forwarded' => 'boolean',
        'forward_score' => 'integer',
        'reactions' => 'array',
        'sent_at' => 'datetime',
        'delivered_at' => 'datetime',
        'read_at' => 'datetime',
        'played_at' => 'datetime',
        'retry_count' => 'integer',
        'metadata' => 'array',
    ];

    public function message(): BelongsTo
    {
        return $this->belongsTo(Message::class);
    }

    public function session(): BelongsTo
    {
        return $this->belongsTo(WahaSession::class, 'session_id');
    }

    public function group(): BelongsTo
    {
        return $this->belongsTo(WahaGroup::class);
    }
}
