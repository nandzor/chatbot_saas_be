<?php

namespace App\Services;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use Illuminate\Http\Request;

abstract class BaseService
{
    /**
     * Get the model instance for this service
     */
    abstract protected function getModel(): Model;

    /**
     * Get model class name
     */
    protected function getModelClass(): string
    {
        return get_class($this->getModel());
    }

    /**
     * Get all records with optional pagination
     */
    public function getAll(
        Request $request = null,
        array $filters = [],
        array $relations = [],
        array $select = ['*']
    ): Collection|LengthAwarePaginator {
        $query = $this->getModel()->newQuery();

        // Apply relations
        if (!empty($relations)) {
            $query->with($relations);
        }

        // Apply select
        if ($select !== ['*']) {
            $query->select($select);
        }

        // Apply filters
        $this->applyFilters($query, $filters);

        // Apply sorting
        if ($request) {
            $this->applySorting($query, $request);
        }

        // Return paginated or all results
        if ($request && $request->has('per_page')) {
            $perPage = min(100, max(1, (int) $request->get('per_page', 15)));
            return $query->paginate($perPage);
        }

        return $query->get();
    }

    /**
     * Get record by ID with optional relations
     */
    public function getById(string $id, array $relations = []): ?Model
    {
        $query = $this->getModel()->newQuery();

        if (!empty($relations)) {
            $query->with($relations);
        }

        return $query->find($id);
    }

    /**
     * Get record by field value
     */
    public function getByField(string $field, mixed $value, array $relations = []): ?Model
    {
        $query = $this->getModel()->newQuery();

        if (!empty($relations)) {
            $query->with($relations);
        }

        return $query->where($field, $value)->first();
    }

    /**
     * Create new record
     */
    public function create(array $data): Model
    {
        try {
            DB::beginTransaction();

            $model = $this->getModel()->create($data);

            // Handle relations if provided
            if (isset($data['relations'])) {
                $this->handleRelations($model, $data['relations']);
            }

            DB::commit();

            $this->logAction('created', $model, $data);

            return $model->fresh();
        } catch (\Exception $e) {
            DB::rollBack();
            $this->logError('Error creating record', $e, $data);
            throw $e;
        }
    }

    /**
     * Update existing record
     */
    public function update(string $id, array $data): ?Model
    {
        try {
            DB::beginTransaction();

            $model = $this->getById($id);

            if (!$model) {
                return null;
            }

            $model->update($data);

            // Handle relations if provided
            if (isset($data['relations'])) {
                $this->handleRelations($model, $data['relations']);
            }

            DB::commit();

            $this->logAction('updated', $model, $data);

            return $model->fresh();
        } catch (\Exception $e) {
            DB::rollBack();
            $this->logError('Error updating record', $e, ['id' => $id, 'data' => $data]);
            throw $e;
        }
    }

    /**
     * Delete record
     */
    public function delete(string $id): bool
    {
        try {
            DB::beginTransaction();

            $model = $this->getById($id);

            if (!$model) {
                return false;
            }

            $deleted = $model->delete();

            DB::commit();

            if ($deleted) {
                $this->logAction('deleted', $model);
            }

            return $deleted;
        } catch (\Exception $e) {
            DB::rollBack();
            $this->logError('Error deleting record', $e, ['id' => $id]);
            throw $e;
        }
    }

    /**
     * Soft delete record (if supported)
     */
    public function softDelete(string $id): bool
    {
        try {
            $model = $this->getById($id);

            if (!$model || !method_exists($model, 'delete')) {
                return false;
            }

            $deleted = $model->delete();

            if ($deleted) {
                $this->logAction('soft_deleted', $model);
            }

            return $deleted;
        } catch (\Exception $e) {
            $this->logError('Error soft deleting record', $e, ['id' => $id]);
            throw $e;
        }
    }

    /**
     * Restore soft deleted record
     */
    public function restore(string $id): bool
    {
        try {
            $model = $this->getModel()->withTrashed()->find($id);

            if (!$model) {
                return false;
            }

            $restored = $model->restore();

            if ($restored) {
                $this->logAction('restored', $model);
            }

            return $restored;
        } catch (\Exception $e) {
            $this->logError('Error restoring record', $e, ['id' => $id]);
            throw $e;
        }
    }

    /**
     * Search records
     */
    public function search(
        string $term,
        array $fields = ['name', 'description'],
        array $filters = [],
        int $limit = 15
    ): Collection {
        $query = $this->getModel()->newQuery();

        // Apply search
        $query->where(function ($q) use ($term, $fields) {
            foreach ($fields as $field) {
                $q->orWhere($field, 'like', "%{$term}%");
            }
        });

        // Apply additional filters
        $this->applyFilters($query, $filters);

        return $query->limit($limit)->get();
    }

    /**
     * Get records with pagination
     */
    public function getPaginated(
        Request $request,
        array $filters = [],
        array $relations = [],
        array $select = ['*']
    ): LengthAwarePaginator {
        $query = $this->getModel()->newQuery();

        // Apply relations
        if (!empty($relations)) {
            $query->with($relations);
        }

        // Apply select
        if ($select !== ['*']) {
            $query->select($select);
        }

        // Apply filters
        $this->applyFilters($query, $filters);

        // Apply sorting
        $this->applySorting($query, $request);

        // Get pagination parameters
        $perPage = min(100, max(1, (int) $request->get('per_page', 15)));
        $page = max(1, (int) $request->get('page', 1));

        return $query->paginate($perPage, ['*'], 'page', $page);
    }

    /**
     * Get count with filters
     */
    public function getCount(array $filters = []): int
    {
        $query = $this->getModel()->newQuery();
        $this->applyFilters($query, $filters);
        return $query->count();
    }

    /**
     * Check if record exists
     */
    public function exists(string $id): bool
    {
        return $this->getModel()->where('id', $id)->exists();
    }

    /**
     * Get multiple records by IDs
     */
    public function getByIds(array $ids, array $relations = []): Collection
    {
        $query = $this->getModel()->newQuery();

        if (!empty($relations)) {
            $query->with($relations);
        }

        return $query->whereIn('id', $ids)->get();
    }

    /**
     * Bulk update records
     */
    public function bulkUpdate(array $ids, array $data): int
    {
        try {
            DB::beginTransaction();

            $updated = $this->getModel()->whereIn('id', $ids)->update($data);

            DB::commit();

            $this->logAction('bulk_updated', null, ['ids' => $ids, 'data' => $data, 'count' => $updated]);

            return $updated;
        } catch (\Exception $e) {
            DB::rollBack();
            $this->logError('Error bulk updating records', $e, ['ids' => $ids, 'data' => $data]);
            throw $e;
        }
    }

    /**
     * Bulk delete records
     */
    public function bulkDelete(array $ids): int
    {
        try {
            DB::beginTransaction();

            $deleted = $this->getModel()->whereIn('id', $ids)->delete();

            DB::commit();

            $this->logAction('bulk_deleted', null, ['ids' => $ids, 'count' => $deleted]);

            return $deleted;
        } catch (\Exception $e) {
            DB::rollBack();
            $this->logError('Error bulk deleting records', $e, ['ids' => $ids]);
            throw $e;
        }
    }

    /**
     * Apply filters to query
     */
    protected function applyFilters($query, array $filters): void
    {
        foreach ($filters as $field => $value) {
            if ($value !== null && $value !== '') {
                if (is_array($value)) {
                    $query->whereIn($field, $value);
                } else {
                    $query->where($field, $value);
                }
            }
        }
    }

    /**
     * Apply sorting to query
     */
    protected function applySorting($query, Request $request): void
    {
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');

        if (in_array($sortOrder, ['asc', 'desc'])) {
            $query->orderBy($sortBy, $sortOrder);
        }
    }

    /**
     * Handle model relations
     */
    protected function handleRelations(Model $model, array $relations): void
    {
        foreach ($relations as $relation => $data) {
            if (method_exists($model, $relation)) {
                if (is_array($data) && isset($data['sync'])) {
                    $model->$relation()->sync($data['sync']);
                } elseif (is_array($data) && isset($data['attach'])) {
                    $model->$relation()->attach($data['attach']);
                } elseif (is_array($data) && isset($data['detach'])) {
                    $model->$relation()->detach($data['detach']);
                }
            }
        }
    }

    /**
     * Cache result with TTL
     */
    protected function cacheResult(string $key, callable $callback, int $ttl = 300): mixed
    {
        return Cache::remember($key, $ttl, $callback);
    }

    /**
     * Clear cache by pattern
     */
    protected function clearCache(string $pattern): void
    {
        $keys = Cache::get($pattern) ?: [];
        foreach ($keys as $key) {
            Cache::forget($key);
        }
    }

    /**
     * Log service actions
     */
    protected function logAction(string $action, ?Model $model = null, array $context = []): void
    {
        $logData = array_merge($context, [
            'action' => $action,
            'model' => $this->getModelClass(),
            'model_id' => $model ? $model->id : null,
            'user_id' => auth()->id(),
            'timestamp' => now()->toISOString(),
        ]);

        Log::info("Service action: {$action}", $logData);
    }

    /**
     * Log service errors
     */
    protected function logError(string $message, \Throwable $exception, array $context = []): void
    {
        $logData = array_merge($context, [
            'message' => $message,
            'exception' => $exception->getMessage(),
            'file' => $exception->getFile(),
            'line' => $exception->getLine(),
            'model' => $this->getModelClass(),
            'user_id' => auth()->id(),
            'timestamp' => now()->toISOString(),
        ]);

        Log::error($message, $logData);
    }

    /**
     * Validate data against model rules
     */
    protected function validateData(array $data, array $rules = []): array
    {
        if (empty($rules) && method_exists($this->getModel(), 'getValidationRules')) {
            $rules = $this->getModel()->getValidationRules();
        }

        if (!empty($rules)) {
            $validator = validator($data, $rules);
            $validator->validate();
        }

        return $data;
    }

    /**
     * Get model statistics
     */
    public function getStatistics(array $filters = []): array
    {
        $query = $this->getModel()->newQuery();
        $this->applyFilters($query, $filters);

        return [
            'total' => $query->count(),
            'active' => $query->where('is_active', true)->count(),
            'inactive' => $query->where('is_active', false)->count(),
            'created_today' => $query->whereDate('created_at', today())->count(),
            'updated_today' => $query->whereDate('updated_at', today())->count(),
        ];
    }
}
