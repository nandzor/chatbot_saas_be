<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Requests\CreateUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Http\Resources\UserResource;
use App\Services\UserService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Log;

class UserController extends BaseController
{
    /**
     * Create a new controller instance.
     */
    public function __construct(
        protected UserService $userService
    ) {}

    /**
     * Display a listing of users.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $perPage = $this->getPerPage($request);
            $users = $this->userService->getPaginated($request, $perPage);

            return $this->paginatedResponse(
                $users->through(fn($user) => new UserResource($user)),
                'Users retrieved successfully'
            );
        } catch (\Exception $e) {
            Log::error('Error retrieving users: ' . $e->getMessage());
            return $this->serverErrorResponse('Failed to retrieve users');
        }
    }

    /**
     * Store a newly created user.
     */
    public function store(CreateUserRequest $request): JsonResponse
    {
        try {
            $user = $this->userService->createUser($request->validated());

            return $this->successResponse(
                new UserResource($user),
                'User created successfully',
                Response::HTTP_CREATED
            );
        } catch (\Exception $e) {
            Log::error('Error creating user: ' . $e->getMessage());
            return $this->serverErrorResponse('Failed to create user');
        }
    }

    /**
     * Display the specified user.
     */
    public function show(int $id): JsonResponse
    {
        try {
            $user = $this->userService->findById($id);

            if (!$user) {
                return $this->notFoundResponse('User not found');
            }

            return $this->successResponse(
                new UserResource($user),
                'User retrieved successfully'
            );
        } catch (\Exception $e) {
            Log::error('Error retrieving user: ' . $e->getMessage());
            return $this->serverErrorResponse('Failed to retrieve user');
        }
    }

    /**
     * Update the specified user.
     */
    public function update(UpdateUserRequest $request, int $id): JsonResponse
    {
        try {
            $user = $this->userService->findById($id);

            if (!$user) {
                return $this->notFoundResponse('User not found');
            }

            $this->userService->updateProfile($id, $request->validated());
            $updatedUser = $this->userService->findById($id);

            return $this->successResponse(
                new UserResource($updatedUser),
                'User updated successfully'
            );
        } catch (\Exception $e) {
            Log::error('Error updating user: ' . $e->getMessage());
            return $this->serverErrorResponse('Failed to update user');
        }
    }

    /**
     * Remove the specified user.
     */
    public function destroy(int $id): JsonResponse
    {
        try {
            $user = $this->userService->findById($id);

            if (!$user) {
                return $this->notFoundResponse('User not found');
            }

            // Soft delete (deactivate) instead of hard delete
            $this->userService->softDeleteUser($id);

            return $this->successResponse(
                null,
                'User deleted successfully'
            );
        } catch (\Exception $e) {
            Log::error('Error deleting user: ' . $e->getMessage());
            return $this->serverErrorResponse('Failed to delete user');
        }
    }

    /**
     * Search users.
     */
    public function search(Request $request): JsonResponse
    {
        try {
            $query = $request->get('q', '');
            $perPage = $this->getPerPage($request);

            if (empty($query)) {
                return $this->errorResponse('Search query is required');
            }

            $users = $this->userService->searchUsers($query, $perPage);

            return $this->paginatedResponse(
                $users->through(fn($user) => new UserResource($user)),
                'Search completed successfully'
            );
        } catch (\Exception $e) {
            Log::error('Error searching users: ' . $e->getMessage());
            return $this->serverErrorResponse('Failed to search users');
        }
    }

    /**
     * Toggle user status.
     */
    public function toggleStatus(int $id): JsonResponse
    {
        try {
            $user = $this->userService->findById($id);

            if (!$user) {
                return $this->notFoundResponse('User not found');
            }

            $this->userService->toggleUserStatus($id);
            $updatedUser = $this->userService->findById($id);

            return $this->successResponse(
                new UserResource($updatedUser),
                'User status updated successfully'
            );
        } catch (\Exception $e) {
            Log::error('Error toggling user status: ' . $e->getMessage());
            return $this->serverErrorResponse('Failed to update user status');
        }
    }

    /**
     * Get user statistics.
     */
    public function statistics(): JsonResponse
    {
        try {
            $statistics = $this->userService->getUserStatistics();

            return $this->successResponse(
                $statistics,
                'User statistics retrieved successfully'
            );
        } catch (\Exception $e) {
            Log::error('Error retrieving user statistics: ' . $e->getMessage());
            return $this->serverErrorResponse('Failed to retrieve user statistics');
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
                'user_ids.*' => 'required|integer|exists:users,id',
                'data' => 'required|array',
                'data.is_active' => 'sometimes|boolean',
            ]);

            $affected = $this->userService->bulkUpdateUsers(
                $request->user_ids,
                $request->data
            );

            return $this->successResponse(
                ['affected_rows' => $affected],
                'Users updated successfully'
            );
        } catch (\Exception $e) {
            Log::error('Error bulk updating users: ' . $e->getMessage());
            return $this->serverErrorResponse('Failed to update users');
        }
    }

    /**
     * Restore soft deleted user.
     */
    public function restore(int $id): JsonResponse
    {
        try {
            $user = $this->userService->findById($id);

            if (!$user) {
                return $this->notFoundResponse('User not found');
            }

            $this->userService->restoreUser($id);
            $restoredUser = $this->userService->findById($id);

            return $this->successResponse(
                new UserResource($restoredUser),
                'User restored successfully'
            );
        } catch (\Exception $e) {
            Log::error('Error restoring user: ' . $e->getMessage());
            return $this->serverErrorResponse('Failed to restore user');
        }
    }
}
