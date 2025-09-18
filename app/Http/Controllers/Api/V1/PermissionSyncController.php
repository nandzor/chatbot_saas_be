<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\PermissionSyncService;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class PermissionSyncController extends Controller
{
    protected $permissionSyncService;

    public function __construct(PermissionSyncService $permissionSyncService)
    {
        $this->permissionSyncService = $permissionSyncService;
    }

    /**
     * Sync permissions for a specific user
     */
    public function syncUser(Request $request, $userId): JsonResponse
    {
        try {
            $user = User::findOrFail($userId);
            $force = $request->boolean('force', false);

            $result = $this->permissionSyncService->syncUserPermissions($user, $force);

            return response()->json([
                'success' => true,
                'message' => 'User permissions synced successfully',
                'data' => $result
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to sync user permissions',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Sync permissions for all users with a specific role
     */
    public function syncByRole(Request $request): JsonResponse
    {
        $request->validate([
            'role' => 'required|string|exists:roles,code',
            'force' => 'boolean'
        ]);

        try {
            $role = $request->input('role');
            $force = $request->boolean('force', false);

            $result = $this->permissionSyncService->syncUsersByRole($role, $force);

            return response()->json([
                'success' => true,
                'message' => "Permissions synced for role: {$role}",
                'data' => $result
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to sync permissions by role',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Sync permissions for all users
     */
    public function syncAll(Request $request): JsonResponse
    {
        try {
            $force = $request->boolean('force', false);

            $result = $this->permissionSyncService->syncAllUsers($force);

            return response()->json([
                'success' => true,
                'message' => 'All user permissions synced successfully',
                'data' => $result
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to sync all user permissions',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Compare user permissions with role permissions
     */
    public function compareUser(Request $request, $userId): JsonResponse
    {
        try {
            $user = User::findOrFail($userId);
            $comparison = $this->permissionSyncService->compareUserPermissions($user);

            return response()->json([
                'success' => true,
                'message' => 'Permission comparison completed',
                'data' => $comparison
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to compare user permissions',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get sync statistics
     */
    public function statistics(): JsonResponse
    {
        try {
            $stats = $this->permissionSyncService->getSyncStatistics();

            return response()->json([
                'success' => true,
                'message' => 'Sync statistics retrieved successfully',
                'data' => $stats
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get sync statistics',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
