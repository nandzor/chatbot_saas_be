<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Carbon;

abstract class BaseResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        $data = $this->getResourceData($request);

        // Add common fields
        $data = $this->addCommonFields($data);

        // Add computed fields
        $data = $this->addComputedFields($data, $request);

        // Add conditional fields
        $data = $this->addConditionalFields($data, $request);

        return $data;
    }

    /**
     * Get the core resource data
     */
    abstract protected function getResourceData(Request $request): array;

    /**
     * Add common fields to all resources
     */
    protected function addCommonFields(array $data): array
    {
        $commonFields = [
            'id' => $this->id,
            'created_at' => $this->when($this->created_at, function () {
                return $this->created_at instanceof Carbon
                    ? $this->created_at->toISOString()
                    : $this->created_at;
            }),
            'updated_at' => $this->when($this->updated_at, function () {
                return $this->updated_at instanceof Carbon
                    ? $this->updated_at->toISOString()
                    : $this->updated_at;
            }),
        ];

        // Add soft delete fields if model supports it
        if (method_exists($this->resource, 'deleted_at') && $this->deleted_at) {
            $commonFields['deleted_at'] = $this->deleted_at instanceof Carbon
                ? $this->deleted_at->toISOString()
                : $this->deleted_at;
        }

        return array_merge($commonFields, $data);
    }

    /**
     * Add computed fields based on model attributes
     */
    protected function addComputedFields(array $data, Request $request): array
    {
        $computedFields = [];

        // Add status field if model has status
        if (isset($this->status)) {
            $computedFields['status'] = $this->status;
            $computedFields['is_active'] = $this->status === 'active';
        }

        // Add is_active field if model has is_active
        if (isset($this->is_active)) {
            $computedFields['is_active'] = (bool) $this->is_active;
        }

        // Add is_system field if model has is_system
        if (isset($this->is_system)) {
            $computedFields['is_system'] = (bool) $this->is_system;
        }

        // Add display_name if not already present
        if (!isset($data['display_name']) && isset($this->display_name)) {
            $computedFields['display_name'] = $this->display_name;
        }

        // Add description if not already present
        if (!isset($data['description']) && isset($this->description)) {
            $computedFields['description'] = $this->description;
        }

        return array_merge($data, $computedFields);
    }

    /**
     * Add conditional fields based on request context
     */
    protected function addConditionalFields(array $data, Request $request): array
    {
        $conditionalFields = [];

        // Add permissions if user is admin
        if ($request->user() && $request->user()->hasRole('admin')) {
            $conditionalFields['permissions'] = $this->getPermissions();
        }

        // Add audit fields if requested
        if ($request->boolean('include_audit')) {
            $conditionalFields['audit'] = $this->getAuditData();
        }

        // Add metadata if requested
        if ($request->boolean('include_metadata')) {
            $conditionalFields['metadata'] = $this->getMetadata();
        }

        return array_merge($data, $conditionalFields);
    }

    /**
     * Get permissions for the resource
     */
    protected function getPermissions(): array
    {
        $permissions = [];

        // Check if model has permissions
        if (method_exists($this->resource, 'permissions')) {
            $permissions['can_view'] = true;
            $permissions['can_edit'] = $this->canEdit();
            $permissions['can_delete'] = $this->canDelete();
            $permissions['can_restore'] = $this->canRestore();
        }

        return $permissions;
    }

    /**
     * Check if user can edit this resource
     */
    protected function canEdit(): bool
    {
        // System resources cannot be edited
        if (isset($this->is_system) && $this->is_system) {
            return false;
        }

        // Check if resource is active
        if (isset($this->is_active) && !$this->is_active) {
            return false;
        }

        return true;
    }

    /**
     * Check if user can delete this resource
     */
    protected function canDelete(): bool
    {
        // System resources cannot be deleted
        if (isset($this->is_system) && $this->is_system) {
            return false;
        }

        // Check if resource has dependencies
        if (method_exists($this->resource, 'hasDependencies')) {
            return !$this->resource->hasDependencies();
        }

        return true;
    }

    /**
     * Check if user can restore this resource
     */
    protected function canRestore(): bool
    {
        // Only soft-deleted resources can be restored
        if (!method_exists($this->resource, 'deleted_at') || !$this->deleted_at) {
            return false;
        }

        return true;
    }

    /**
     * Get audit data for the resource
     */
    protected function getAuditData(): array
    {
        $audit = [];

        // Add created by info
        if (isset($this->created_by)) {
            $audit['created_by'] = $this->created_by;
        }

        // Add updated by info
        if (isset($this->updated_by)) {
            $audit['updated_by'] = $this->updated_by;
        }

        // Add deleted by info
        if (method_exists($this->resource, 'deleted_by') && $this->deleted_by) {
            $audit['deleted_by'] = $this->deleted_by;
        }

        return $audit;
    }

    /**
     * Get metadata for the resource
     */
    protected function getMetadata(): array
    {
        $metadata = [];

        // Add model class
        $metadata['model_class'] = get_class($this->resource);

        // Add resource class
        $metadata['resource_class'] = get_class($this);

        // Add timestamps
        $metadata['timestamps'] = [
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];

        // Add soft delete info
        if (method_exists($this->resource, 'deleted_at')) {
            $metadata['soft_deletes'] = true;
            $metadata['deleted_at'] = $this->deleted_at;
        }

        return $metadata;
    }

    /**
     * Format date to ISO string
     */
    protected function formatDate($date): ?string
    {
        if (!$date) {
            return null;
        }

        if ($date instanceof Carbon) {
            return $date->toISOString();
        }

        return Carbon::parse($date)->toISOString();
    }

    /**
     * Format boolean value
     */
    protected function formatBoolean($value): bool
    {
        if (is_bool($value)) {
            return $value;
        }

        if (is_string($value)) {
            return in_array(strtolower($value), ['true', '1', 'yes', 'on']);
        }

        if (is_numeric($value)) {
            return $value > 0;
        }

        return false;
    }

    /**
     * Get relationship data safely
     */
    protected function getRelationshipData(string $relationship, string $resourceClass = null): mixed
    {
        if (!$this->resource->relationLoaded($relationship)) {
            return null;
        }

        $data = $this->resource->getRelation($relationship);

        if (!$data) {
            return null;
        }

        if ($resourceClass && class_exists($resourceClass)) {
            if (is_array($data) || $data instanceof \Illuminate\Support\Collection) {
                return $resourceClass::collection($data);
            }
            return new $resourceClass($data);
        }

        return $data;
    }

    /**
     * Get count of relationship safely
     */
    protected function getRelationshipCount(string $relationship): int
    {
        if ($this->resource->relationLoaded($relationship)) {
            $data = $this->resource->getRelation($relationship);
            return is_countable($data) ? count($data) : 0;
        }

        // Try to get count from model
        if (method_exists($this->resource, $relationship)) {
            return $this->resource->$relationship()->count();
        }

        return 0;
    }

    /**
     * Check if relationship is loaded
     */
    protected function isRelationshipLoaded(string $relationship): bool
    {
        return $this->resource->relationLoaded($relationship);
    }

    /**
     * Get resource type
     */
    protected function getResourceType(): string
    {
        return class_basename($this->resource);
    }

    /**
     * Get resource identifier
     */
    protected function getResourceIdentifier(): string
    {
        return $this->getResourceType() . '_' . $this->id;
    }
}
