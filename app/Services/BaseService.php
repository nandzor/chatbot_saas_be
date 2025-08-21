<?php

namespace App\Services;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Http\Request;

abstract class BaseService
{
    /**
     * The model instance.
     */
    protected Model $model;

    /**
     * Create a new service instance.
     */
    public function __construct()
    {
        $this->model = $this->getModel();
    }

    /**
     * Get the model for the service.
     */
    abstract protected function getModel(): Model;

    /**
     * Get all records.
     */
    public function getAll(array $columns = ['*']): Collection
    {
        return $this->model->all($columns);
    }

    /**
     * Get paginated records.
     */
    public function getPaginated(Request $request, int $perPage = 15): LengthAwarePaginator
    {
        return $this->model->paginate($perPage);
    }

    /**
     * Find a record by ID.
     */
    public function findById(int $id, array $columns = ['*']): ?Model
    {
        return $this->model->find($id, $columns);
    }

    /**
     * Find a record by ID or fail.
     */
    public function findByIdOrFail(int $id, array $columns = ['*']): Model
    {
        return $this->model->findOrFail($id, $columns);
    }

    /**
     * Create a new record.
     */
    public function create(array $data): Model
    {
        return $this->model->create($data);
    }

    /**
     * Update a record.
     */
    public function update(int $id, array $data): bool
    {
        $record = $this->findByIdOrFail($id);
        return $record->update($data);
    }

    /**
     * Delete a record.
     */
    public function delete(int $id): bool
    {
        $record = $this->findByIdOrFail($id);
        return $record->delete();
    }

    /**
     * Get records with specific conditions.
     */
    public function getWhere(array $conditions, array $columns = ['*']): Collection
    {
        return $this->model->where($conditions)->get($columns);
    }

    /**
     * Get the first record with specific conditions.
     */
    public function getFirstWhere(array $conditions, array $columns = ['*']): ?Model
    {
        return $this->model->where($conditions)->first($columns);
    }

    /**
     * Count records with specific conditions.
     */
    public function countWhere(array $conditions = []): int
    {
        if (empty($conditions)) {
            return $this->model->count();
        }

        return $this->model->where($conditions)->count();
    }

    /**
     * Check if a record exists with specific conditions.
     */
    public function exists(array $conditions): bool
    {
        return $this->model->where($conditions)->exists();
    }

    /**
     * Create multiple records.
     */
    public function createMany(array $data): Collection
    {
        return $this->model->newQuery()->create($data);
    }

    /**
     * Update multiple records.
     */
    public function updateMany(array $conditions, array $data): int
    {
        return $this->model->where($conditions)->update($data);
    }

    /**
     * Delete multiple records.
     */
    public function deleteMany(array $conditions): int
    {
        return $this->model->where($conditions)->delete();
    }
}
