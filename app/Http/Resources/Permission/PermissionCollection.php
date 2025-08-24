<?php

namespace App\Http\Resources\Permission;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\ResourceCollection;

class PermissionCollection extends ResourceCollection
{
    /**
     * Transform the resource collection into an array.
     */
    public function toArray(Request $request): array
    {
        return [
            'data' => $this->collection,
            'meta' => [
                'total' => $this->collection->count(),
                'categories' => $this->collection->groupBy('category')->keys(),
                'resources' => $this->collection->groupBy('resource')->keys(),
                'scopes' => $this->collection->groupBy('scope')->keys(),
                'system_permissions_count' => $this->collection->where('is_system_permission', true)->count(),
                'custom_permissions_count' => $this->collection->where('is_system_permission', false)->count(),
                'dangerous_permissions_count' => $this->collection->where('is_dangerous', true)->count(),
                'visible_permissions_count' => $this->collection->where('is_visible', true)->count(),
            ],
        ];
    }
}
