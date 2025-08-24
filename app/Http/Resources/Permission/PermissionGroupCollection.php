<?php

namespace App\Http\Resources\Permission;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\ResourceCollection;

class PermissionGroupCollection extends ResourceCollection
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
                'root_groups' => $this->collection->whereNull('parent_group_id')->count(),
                'child_groups' => $this->collection->whereNotNull('parent_group_id')->count(),
                'empty_groups' => $this->collection->filter(function ($group) {
                    return $group->permissions_count === 0;
                })->count(),
                'groups_with_permissions' => $this->collection->filter(function ($group) {
                    return $group->permissions_count > 0;
                })->count(),
            ],
        ];
    }
}
