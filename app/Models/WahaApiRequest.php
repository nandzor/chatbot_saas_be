<?php

namespace App\Models;

use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class WahaApiRequest extends Model
{
    use HasFactory, HasUuid;

    protected $table = 'waha_api_requests';

    protected $fillable = [
        'session_id',
        'organization_id',
        'method',
        'endpoint',
        'request_headers',
        'request_body',
        'response_status',
        'response_headers',
        'response_body',
        'response_time_ms',
        'error_type',
        'error_message',
        'is_success',
        'operation_type',
        'reference_id',
        'retry_count',
        'retry_after',
    ];

    protected $casts = [
        'request_headers' => 'array',
        'response_status' => 'integer',
        'response_headers' => 'array',
        'response_time_ms' => 'integer',
        'is_success' => 'boolean',
        'retry_count' => 'integer',
        'retry_after' => 'integer',
    ];

    public function session(): BelongsTo
    {
        return $this->belongsTo(WahaSession::class, 'session_id');
    }

    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }
}
