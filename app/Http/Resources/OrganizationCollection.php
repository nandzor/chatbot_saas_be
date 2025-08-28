<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\ResourceCollection;

class OrganizationCollection extends ResourceCollection
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
                'business_types' => $this->collection->groupBy('business_type')->map->count(),
                'industries' => $this->collection->groupBy('industry')->map->count(),
                'company_sizes' => $this->collection->groupBy('company_size')->map->count(),
                'subscription_statuses' => $this->collection->groupBy('subscription_status')->map->count(),
                'active_organizations' => $this->collection->where('status', 'active')->count(),
                'trial_organizations' => $this->collection->where('subscription_status', 'trial')->count(),
                'organizations_with_users' => $this->collection->filter(function ($org) {
                    return $org->users && $org->users->count() > 0;
                })->count(),
            ],
        ];
    }
}
