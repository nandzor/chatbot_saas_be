<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\ResourceCollection;

class UserCollection extends ResourceCollection
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
            'pagination' => [
                'current_page' => $this->currentPage(),
                'per_page' => $this->perPage(),
                'total' => $this->total(),
                'last_page' => $this->lastPage(),
                'from' => $this->firstItem(),
                'to' => $this->lastItem(),
                'has_more_pages' => $this->hasMorePages(),
            ],
            'meta' => [
                'filters' => $request->only([
                    'search', 'status', 'role', 'organization_id', 
                    'department', 'is_email_verified', 'two_factor_enabled'
                ]),
                'sort' => [
                    'by' => $request->get('sort_by', 'created_at'),
                    'order' => $request->get('sort_order', 'desc'),
                ],
            ],
        ];
    }
}
