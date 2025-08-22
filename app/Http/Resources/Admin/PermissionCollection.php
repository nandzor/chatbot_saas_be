<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\ResourceCollection;

class PermissionCollection extends ResourceCollection
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
                    'search', 'resource', 'action', 'scope', 'is_system_permission', 'organization_id'
                ]),
                'sort' => [
                    'by' => $request->get('sort_by', 'created_at'),
                    'order' => $request->get('sort_order', 'desc'),
                ],
            ],
        ];
    }
}
