<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class InboxStatsResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'total_sessions' => $this->resource['total_sessions'] ?? 0,
            'active_sessions' => $this->resource['active_sessions'] ?? 0,
            'pending_sessions' => $this->resource['pending_sessions'] ?? 0,
            'resolved_sessions' => $this->resource['resolved_sessions'] ?? 0,
            'avg_response_time' => $this->resource['avg_response_time'] ?? 0,
            'satisfaction_rate' => $this->resource['satisfaction_rate'] ?? 0,
            'satisfaction_count' => $this->resource['satisfaction_count'] ?? 0,
            'total_messages' => $this->resource['total_messages'] ?? 0,
            'avg_session_duration' => $this->resource['avg_session_duration'] ?? 0,
            'handover_rate' => $this->resource['handover_rate'] ?? 0,
            'resolution_rate' => $this->resource['resolution_rate'] ?? 0,
        ];
    }
}
