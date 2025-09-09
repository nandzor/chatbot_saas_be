<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\BaseApiController;
use App\Notifications\OrganizationNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;

class OrganizationNotificationController extends BaseApiController
{
    /**
     * Get notifications for organization
     */
    public function index(Request $request, $organizationId): JsonResponse
    {
        try {
            $notifications = DB::table('notifications')
                ->where('data->organization_id', $organizationId)
                ->orderBy('created_at', 'desc')
                ->paginate($request->get('per_page', 20));

            return $this->successResponse(
                'Notifications retrieved successfully',
                $notifications
            );
        } catch (\Exception $e) {
            return $this->errorResponseWithDebug(
                message: 'Failed to retrieve notifications',
                statusCode: 500,
                errors: $e->getMessage(),
                exception: $e
            );
        }
    }

    /**
     * Mark notification as read
     */
    public function markAsRead($organizationId, $notificationId): JsonResponse
    {
        try {
            $notification = DB::table('notifications')
                ->where('id', $notificationId)
                ->where('data->organization_id', $organizationId)
                ->first();

            if (!$notification) {
                return $this->errorResponse(
                    'Notification not found',
                    404
                );
            }

            DB::table('notifications')
                ->where('id', $notificationId)
                ->update([
                    'read_at' => now(),
                    'updated_at' => now()
                ]);

            return $this->successResponse(
                'Notification marked as read',
                ['notification_id' => $notificationId]
            );
        } catch (\Exception $e) {
            return $this->errorResponseWithDebug(
                message: 'Failed to mark notification as read',
                statusCode: 500,
                errors: $e->getMessage(),
                exception: $e
            );
        }
    }

    /**
     * Mark all notifications as read
     */
    public function markAllAsRead($organizationId): JsonResponse
    {
        try {
            $updated = DB::table('notifications')
                ->where('data->organization_id', $organizationId)
                ->whereNull('read_at')
                ->update([
                    'read_at' => now(),
                    'updated_at' => now()
                ]);

            return $this->successResponse(
                'All notifications marked as read',
                ['updated_count' => $updated]
            );
        } catch (\Exception $e) {
            return $this->errorResponseWithDebug(
                message: 'Failed to mark all notifications as read',
                statusCode: 500,
                errors: $e->getMessage(),
                exception: $e
            );
        }
    }

    /**
     * Delete notification
     */
    public function destroy($organizationId, $notificationId): JsonResponse
    {
        try {
            $deleted = DB::table('notifications')
                ->where('id', $notificationId)
                ->where('data->organization_id', $organizationId)
                ->delete();

            if (!$deleted) {
                return $this->errorResponse(
                    'Notification not found',
                    404
                );
            }

            return $this->successResponse(
                'Notification deleted successfully',
                ['notification_id' => $notificationId]
            );
        } catch (\Exception $e) {
            return $this->errorResponseWithDebug(
                message: 'Failed to delete notification',
                statusCode: 500,
                errors: $e->getMessage(),
                exception: $e
            );
        }
    }

    /**
     * Send notification to organization users
     */
    public function send(Request $request, $organizationId): JsonResponse
    {
        try {
            $request->validate([
                'type' => 'required|string',
                'title' => 'required|string',
                'message' => 'required|string',
                'priority' => 'sometimes|in:low,normal,high,urgent',
                'data' => 'sometimes|array'
            ]);

            // Get organization users
            $users = DB::table('users')
                ->where('organization_id', $organizationId)
                ->where('status', 'active')
                ->get();

            if ($users->isEmpty()) {
                return $this->errorResponse(
                    'No active users found in organization',
                    404
                );
            }

            // Send notification to all users
            $notification = new OrganizationNotification(
                $organizationId,
                $request->type,
                $request->title,
                $request->message,
                $request->get('data', []),
                $request->get('priority', 'normal')
            );

            foreach ($users as $user) {
                $userModel = \App\Models\User::find($user->id);
                if ($userModel) {
                    $userModel->notify($notification);
                }
            }

            return $this->successResponse(
                'Notification sent successfully',
                [
                    'organization_id' => $organizationId,
                    'users_notified' => $users->count(),
                    'notification_type' => $request->type
                ]
            );
        } catch (\Exception $e) {
            return $this->errorResponseWithDebug(
                message: 'Failed to send notification',
                statusCode: 500,
                errors: $e->getMessage(),
                exception: $e
            );
        }
    }
}
