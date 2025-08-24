<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\CreateUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Http\Resources\UserResource;
use App\Services\UserService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class UserController extends BaseApiController
{
    public function __construct(protected UserService $userService)
    {
        parent::__construct();
    }

    /**
     * Display a listing of users.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $pagination = $this->getPaginationParams($request);
            $filters = $this->getFilterParams($request, ['status', 'role', 'organization_id']);
            $search = $this->getSearchParams($request);
            $sort = $this->getSortParams($request, ['full_name', 'email', 'created_at', 'status'], 'created_at');

            $users = $this->userService->getAll(
                $request,
                $filters,
                ['organization', 'roles'],
                ['id', 'full_name', 'email', 'status', 'organization_id', 'created_at']
            );

            $this->logApiAction('users_listed', [
                'filters' => $filters,
                'search' => $search,
                'pagination' => $pagination
            ]);

            return $this->successResponseWithLog(
                'users_listed',
                'Users retrieved successfully',
                $users->through(fn($user) => new UserResource($user)),
                200,
                ['pagination' => $pagination]
            );

        } catch (\Exception $e) {
            return $this->errorResponseWithLog(
                'users_list_error',
                'Failed to retrieve users',
                $e->getMessage(),
                500,
                'USERS_LIST_ERROR'
            );
        }
    }

    /**
     * Store a newly created user.
     */
    public function store(CreateUserRequest $request): JsonResponse
    {
        try {
            $user = $this->userService->createUser($request->validated());

            $this->logApiAction('user_created', [
                'user_id' => $user->id,
                'email' => $user->email,
                'organization_id' => $user->organization_id
            ]);

            return $this->successResponseWithLog(
                'user_created',
                'User created successfully',
                new UserResource($user),
                201
            );

        } catch (\Exception $e) {
            return $this->errorResponseWithLog(
                'user_creation_error',
                'Failed to create user',
                $e->getMessage(),
                500,
                'USER_CREATION_ERROR'
            );
        }
    }

    /**
     * Display the specified user.
     */
    public function show(string $id): JsonResponse
    {
        try {
            $user = $this->userService->getById($id, ['organization', 'roles']);

            if (!$user) {
                return $this->handleResourceNotFound('User', $id);
            }

            $this->logApiAction('user_viewed', [
                'user_id' => $id,
                'viewed_by' => $this->getCurrentUser()?->id
            ]);

            return $this->successResponseWithLog(
                'user_viewed',
                'User retrieved successfully',
                new UserResource($user)
            );

        } catch (\Exception $e) {
            return $this->errorResponseWithLog(
                'user_view_error',
                'Failed to retrieve user',
                $e->getMessage(),
                500,
                'USER_VIEW_ERROR'
            );
        }
    }

    /**
     * Update the specified user.
     */
    public function update(UpdateUserRequest $request, string $id): JsonResponse
    {
        try {
            $user = $this->userService->getById($id);

            if (!$user) {
                return $this->handleResourceNotFound('User', $id);
            }

            $this->userService->updateProfile($id, $request->validated());
            $updatedUser = $this->userService->getById($id, ['organization', 'roles']);

            $this->logApiAction('user_updated', [
                'user_id' => $id,
                'updated_by' => $this->getCurrentUser()?->id,
                'changes' => $request->validated()
            ]);

            return $this->successResponseWithLog(
                'user_updated',
                'User updated successfully',
                new UserResource($updatedUser)
            );

        } catch (\Exception $e) {
            return $this->errorResponseWithLog(
                'user_update_error',
                'Failed to update user',
                $e->getMessage(),
                500,
                'USER_UPDATE_ERROR'
            );
        }
    }

    /**
     * Remove the specified user from storage.
     */
    public function destroy(string $id): JsonResponse
    {
        try {
            $user = $this->userService->getById($id);

            if (!$user) {
                return $this->handleResourceNotFound('User', $id);
            }

            $this->userService->softDeleteUser($id);

            $this->logApiAction('user_deleted', [
                'user_id' => $id,
                'deleted_by' => $this->getCurrentUser()?->id,
                'user_email' => $user->email
            ]);

            return $this->successResponseWithLog(
                'user_deleted',
                'User deleted successfully'
            );

        } catch (\Exception $e) {
            return $this->errorResponseWithLog(
                'user_deletion_error',
                'Failed to delete user',
                $e->getMessage(),
                500,
                'USER_DELETION_ERROR'
            );
        }
    }

    /**
     * Toggle user status.
     */
    public function toggleStatus(string $id): JsonResponse
    {
        try {
            $user = $this->userService->getById($id);

            if (!$user) {
                return $this->handleResourceNotFound('User', $id);
            }

            $this->userService->toggleUserStatus($id);
            $updatedUser = $this->userService->getById($id, ['organization', 'roles']);

            $this->logApiAction('user_status_toggled', [
                'user_id' => $id,
                'toggled_by' => $this->getCurrentUser()?->id,
                'new_status' => $updatedUser->status
            ]);

            return $this->successResponseWithLog(
                'user_status_toggled',
                'User status toggled successfully',
                new UserResource($updatedUser)
            );

        } catch (\Exception $e) {
            return $this->errorResponseWithLog(
                'user_status_toggle_error',
                'Failed to toggle user status',
                $e->getMessage(),
                500,
                'USER_STATUS_TOGGLE_ERROR'
            );
        }
    }

    /**
     * Get user statistics.
     */
    public function statistics(): JsonResponse
    {
        try {
            $statistics = $this->userService->getUserStatistics();

            $this->logApiAction('user_statistics_viewed', [
                'viewed_by' => $this->getCurrentUser()?->id
            ]);

            return $this->successResponseWithLog(
                'user_statistics_viewed',
                'User statistics retrieved successfully',
                $statistics
            );

        } catch (\Exception $e) {
            return $this->errorResponseWithLog(
                'user_statistics_error',
                'Failed to retrieve user statistics',
                $e->getMessage(),
                500,
                'USER_STATISTICS_ERROR'
            );
        }
    }

    /**
     * Bulk update users.
     */
    public function bulkUpdate(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'user_ids' => 'required|array',
                'user_ids.*' => 'required|string|exists:users,id',
                'data' => 'required|array',
            ]);

            $affected = $this->userService->bulkUpdateUsers(
                $request->user_ids,
                $request->data
            );

            $this->logApiAction('users_bulk_updated', [
                'affected_users' => $affected,
                'updated_by' => $this->getCurrentUser()?->id,
                'changes' => $request->data
            ]);

            return $this->successResponseWithLog(
                'users_bulk_updated',
                'Users updated successfully',
                ['affected_count' => $affected]
            );

        } catch (ValidationException $e) {
            return $this->validationErrorResponse($e->errors());
        } catch (\Exception $e) {
            return $this->errorResponseWithLog(
                'users_bulk_update_error',
                'Failed to bulk update users',
                $e->getMessage(),
                500,
                'USERS_BULK_UPDATE_ERROR'
            );
        }
    }

    /**
     * Restore a soft-deleted user.
     */
    public function restore(string $id): JsonResponse
    {
        try {
            $user = $this->userService->getById($id);

            if (!$user) {
                return $this->handleResourceNotFound('User', $id);
            }

            $this->userService->restoreUser($id);
            $restoredUser = $this->userService->getById($id, ['organization', 'roles']);

            $this->logApiAction('user_restored', [
                'user_id' => $id,
                'restored_by' => $this->getCurrentUser()?->id
            ]);

            return $this->successResponseWithLog(
                'user_restored',
                'User restored successfully',
                new UserResource($restoredUser)
            );

        } catch (\Exception $e) {
            return $this->errorResponseWithLog(
                'user_restore_error',
                'Failed to restore user',
                $e->getMessage(),
                500,
                'USER_RESTORE_ERROR'
            );
        }
    }

    /**
     * Search users.
     */
    public function search(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'query' => 'required|string|min:2',
                'filters' => 'sometimes|array',
                'limit' => 'sometimes|integer|min:1|max:100'
            ]);

            $results = $this->userService->searchUsers(
                $request->get('query'),
                $request->get('filters', [])
            );

            $this->logApiAction('users_searched', [
                'query' => $request->query,
                'filters' => $request->get('filters', []),
                'results_count' => $results->count(),
                'searched_by' => $this->getCurrentUser()?->id
            ]);

            return $this->successResponseWithLog(
                'users_searched',
                'Users search completed successfully',
                $results->through(fn($user) => new UserResource($user))
            );

        } catch (ValidationException $e) {
            return $this->validationErrorResponse($e->errors());
        } catch (\Exception $e) {
            return $this->errorResponseWithLog(
                'users_search_error',
                'Failed to search users',
                $e->getMessage(),
                500,
                'USERS_SEARCH_ERROR'
            );
        }
    }
}
