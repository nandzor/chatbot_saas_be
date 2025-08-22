<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\Admin\CreateUserRequest;
use App\Http\Requests\Admin\UpdateUserRequest;
use App\Http\Requests\Admin\BulkActionRequest;
use App\Http\Resources\Admin\UserResource;
use App\Http\Resources\Admin\UserCollection;
use App\Services\Admin\UserManagementService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;

class UserManagementController extends BaseApiController
{
    protected UserManagementService $userService;

    public function __construct()
    {
        $this->userService = new UserManagementService();
    }

    /**
     * Get paginated list of users with filters and search.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $filters = $request->only([
                'search', 'status', 'role', 'organization_id',
                'department', 'is_email_verified', 'two_factor_enabled'
            ]);

            $users = $this->userService->getPaginatedUsers(
                page: $request->get('page', 1),
                perPage: $request->get('per_page', 15),
                filters: $filters,
                sortBy: $request->get('sort_by', 'created_at'),
                sortOrder: $request->get('sort_order', 'desc')
            );

            return $this->successResponse(
                'Users retrieved successfully',
                new UserCollection($users)
            );
        } catch (\Exception $e) {
            Log::error('User management index error', [
                'error' => $e->getMessage(),
                'user_id' => Auth::id()
            ]);

            return $this->errorResponse(
                'Failed to retrieve users',
                ['error' => 'An unexpected error occurred'],
                500
            );
        }
    }

    /**
     * Get specific user details.
     */
    public function show(string $userId): JsonResponse
    {
        try {
            $user = $this->userService->getUserWithDetails($userId);

            if (!$user) {
                return $this->errorResponse(
                    'User not found',
                    ['error' => 'The specified user does not exist'],
                    404
                );
            }

            return $this->successResponse(
                'User details retrieved successfully',
                new UserResource($user)
            );
        } catch (\Exception $e) {
            Log::error('User management show error', [
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
                'target_user_id' => $userId
            ]);

            return $this->errorResponse(
                'Failed to retrieve user details',
                ['error' => 'An unexpected error occurred'],
                500
            );
        }
    }

    /**
     * Create a new user.
     */
    public function store(CreateUserRequest $request): JsonResponse
    {
        try {
            $userData = $request->validated();

            $user = $this->userService->createUser($userData, Auth::user());

            Log::info('User created by admin', [
                'admin_id' => Auth::id(),
                'new_user_id' => $user->id,
                'email' => $user->email
            ]);

            return $this->successResponse(
                'User created successfully',
                new UserResource($user),
                201
            );
        } catch (\Exception $e) {
            Log::error('User management store error', [
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
                'data' => $request->validated()
            ]);

            return $this->errorResponse(
                'Failed to create user',
                ['error' => 'An unexpected error occurred'],
                500
            );
        }
    }

    /**
     * Update user information.
     */
    public function update(UpdateUserRequest $request, string $userId): JsonResponse
    {
        try {
            $userData = $request->validated();

            $user = $this->userService->updateUser($userId, $userData, Auth::user());

            if (!$user) {
                return $this->errorResponse(
                    'User not found',
                    ['error' => 'The specified user does not exist'],
                    404
                );
            }

            Log::info('User updated by admin', [
                'admin_id' => Auth::id(),
                'target_user_id' => $userId,
                'updated_fields' => array_keys($userData)
            ]);

            return $this->successResponse(
                'User updated successfully',
                new UserResource($user)
            );
        } catch (\Exception $e) {
            Log::error('User management update error', [
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
                'target_user_id' => $userId
            ]);

            return $this->errorResponse(
                'Failed to update user',
                ['error' => 'An unexpected error occurred'],
                500
            );
        }
    }

    /**
     * Delete user (soft delete).
     */
    public function destroy(string $userId): JsonResponse
    {
        try {
            $result = $this->userService->deleteUser($userId, Auth::user());

            if (!$result) {
                return $this->errorResponse(
                    'User not found',
                    ['error' => 'The specified user does not exist'],
                    404
                );
            }

            Log::info('User deleted by admin', [
                'admin_id' => Auth::id(),
                'target_user_id' => $userId
            ]);

            return $this->successResponse(
                'User deleted successfully',
                null
            );
        } catch (\Exception $e) {
            Log::error('User management destroy error', [
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
                'target_user_id' => $userId
            ]);

            return $this->errorResponse(
                'Failed to delete user',
                ['error' => 'An unexpected error occurred'],
                500
            );
        }
    }

    /**
     * Restore deleted user.
     */
    public function restore(string $userId): JsonResponse
    {
        try {
            $user = $this->userService->restoreUser($userId, Auth::user());

            if (!$user) {
                return $this->errorResponse(
                    'User not found or not deleted',
                    ['error' => 'The specified user does not exist or is not deleted'],
                    404
                );
            }

            Log::info('User restored by admin', [
                'admin_id' => Auth::id(),
                'target_user_id' => $userId
            ]);

            return $this->successResponse(
                'User restored successfully',
                new UserResource($user)
            );
        } catch (\Exception $e) {
            Log::error('User management restore error', [
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
                'target_user_id' => $userId
            ]);

            return $this->errorResponse(
                'Failed to restore user',
                ['error' => 'An unexpected error occurred'],
                500
            );
        }
    }

    /**
     * Force delete user (permanent).
     */
    public function forceDelete(string $userId): JsonResponse
    {
        try {
            $result = $this->userService->forceDeleteUser($userId, Auth::user());

            if (!$result) {
                return $this->errorResponse(
                    'User not found',
                    ['error' => 'The specified user does not exist'],
                    404
                );
            }

            Log::warning('User force deleted by admin', [
                'admin_id' => Auth::id(),
                'target_user_id' => $userId
            ]);

            return $this->successResponse(
                'User permanently deleted successfully',
                null
            );
        } catch (\Exception $e) {
            Log::error('User management force delete error', [
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
                'target_user_id' => $userId
            ]);

            return $this->errorResponse(
                'Failed to permanently delete user',
                ['error' => 'An unexpected error occurred'],
                500
            );
        }
    }

    /**
     * Bulk actions on users.
     */
    public function bulkAction(BulkActionRequest $request): JsonResponse
    {
        try {
            $action = $request->validated('action');
            $userIds = $request->validated('user_ids');

            $result = $this->userService->performBulkAction($action, $userIds, Auth::user());

            Log::info('Bulk action performed by admin', [
                'admin_id' => Auth::id(),
                'action' => $action,
                'user_count' => count($userIds),
                'success_count' => $result['success_count'],
                'failed_count' => $result['failed_count']
            ]);

            return $this->successResponse(
                "Bulk action '{$action}' completed",
                $result
            );
        } catch (\Exception $e) {
            Log::error('User management bulk action error', [
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
                'action' => $request->validated('action')
            ]);

            return $this->errorResponse(
                'Failed to perform bulk action',
                ['error' => 'An unexpected error occurred'],
                500
            );
        }
    }

    /**
     * Get user statistics.
     */
    public function statistics(): JsonResponse
    {
        try {
            $stats = $this->userService->getUserStatistics();

            return $this->successResponse(
                'User statistics retrieved successfully',
                $stats
            );
        } catch (\Exception $e) {
            Log::error('User management statistics error', [
                'error' => $e->getMessage(),
                'user_id' => Auth::id()
            ]);

            return $this->errorResponse(
                'Failed to retrieve user statistics',
                ['error' => 'An unexpected error occurred'],
                500
            );
        }
    }

    /**
     * Export users data.
     */
    public function export(Request $request): JsonResponse
    {
        try {
            $filters = $request->only([
                'search', 'status', 'role', 'organization_id',
                'department', 'is_email_verified', 'two_factor_enabled'
            ]);

            $format = $request->get('format', 'csv');

            $exportData = $this->userService->exportUsers($filters, $format);

            return $this->successResponse(
                'Users exported successfully',
                $exportData
            );
        } catch (\Exception $e) {
            Log::error('User management export error', [
                'error' => $e->getMessage(),
                'user_id' => Auth::id()
            ]);

            return $this->errorResponse(
                'Failed to export users',
                ['error' => 'An unexpected error occurred'],
                500
            );
        }
    }
}
