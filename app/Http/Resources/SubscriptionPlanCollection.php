<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\ResourceCollection;

class SubscriptionPlanCollection extends ResourceCollection
{
    /**
     * Transform the resource collection into an array.
     *
     * @return array<int|string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'data' => $this->collection,
            'meta' => [
                'total' => $this->collection->count(),
                'tiers' => $this->collection->groupBy('tier')->map->count(),
                'popular_count' => $this->collection->where('is_popular', true)->count(),
                'custom_count' => $this->collection->where('is_custom', true)->count(),
                'active_count' => $this->collection->where('status', 'active')->count(),
            ],
        ];
    }
}
