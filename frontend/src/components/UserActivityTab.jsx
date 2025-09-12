import React, { useState, useCallback, useEffect } from 'react';
import {
  Activity,
  AlertCircle,
  CheckCircle,
  XCircle,
  Settings,
  RefreshCw
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Badge,
  Button,
  Skeleton
} from '@/components/ui';
import { useUserManagement } from '@/hooks/useUserManagement';

const UserActivityTab = ({ userId, user }) => {
  const { getUserActivity } = useUserManagement();

  // Activity data state
  const [activityData, setActivityData] = useState(null);
  const [activityLoading, setActivityLoading] = useState(false);
  const [activityError, setActivityError] = useState(null);

  // Load user activity data
  const loadUserActivity = useCallback(async () => {
    if (!userId) {
      return;
    }

    try {
      setActivityLoading(true);
      setActivityError(null);

      const result = await getUserActivity(userId);

      if (result.success) {
        setActivityData(result.data);
      } else {
        setActivityError(result.error || 'Failed to load user activity');
      }
    } catch (err) {
      setActivityError('Failed to load user activity');
    } finally {
      setActivityLoading(false);
    }
  }, [userId, getUserActivity]);

  // Load data when component mounts
  useEffect(() => {
    if (userId && !activityData && !activityLoading) {
      loadUserActivity();
    }
  }, [userId, activityData, activityLoading, loadUserActivity]);

  // Reset data when user changes
  useEffect(() => {
    if (userId) {
      setActivityData(null);
      setActivityError(null);
    }
  }, [userId]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              User Activity
            </CardTitle>
            <CardDescription>
              Account activity and security information for this user
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={loadUserActivity}
            disabled={activityLoading}
            className="flex items-center gap-2"
          >
            <Settings className="w-4 h-4" />
            {activityLoading ? 'Loading...' : 'Refresh'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {activityLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : activityError ? (
          <div className="text-center py-8">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Activity</h3>
            <p className="text-gray-600 mb-4">{activityError}</p>
            <div className="flex gap-2 justify-center">
              <Button onClick={loadUserActivity} variant="outline" disabled={activityLoading}>
                <RefreshCw className="w-4 h-4 mr-2" />
                {activityLoading ? 'Loading...' : 'Try Again'}
              </Button>
              <Button onClick={() => setActivityError(null)} variant="ghost">
                Dismiss
              </Button>
            </div>
          </div>
        ) : activityData ? (
          <div className="space-y-6">
            {/* Account Status */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-600">Total Logins</span>
                <span className="text-lg font-semibold text-gray-900">
                  {activityData.login_count !== undefined ? activityData.login_count : 0}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-600">Failed Attempts</span>
                <span className="text-lg font-semibold text-gray-900">
                  {activityData.failed_login_attempts !== undefined ? activityData.failed_login_attempts : 0}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-600">Active Sessions</span>
                <span className="text-lg font-semibold text-gray-900">
                  {activityData.active_sessions !== undefined ? activityData.active_sessions : 0}
                </span>
              </div>
            </div>

            {/* Login Information */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Login Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 border border-gray-200 rounded-lg">
                  <label className="text-sm font-medium text-gray-500">Last Login</label>
                  <p className="text-sm text-gray-900 mt-1">
                    {activityData.last_login_at ? new Date(activityData.last_login_at).toLocaleString() : 'Never'}
                  </p>
                  {activityData.last_login_at && (
                    <p className="text-xs text-gray-500 mt-1">
                      {(() => {
                        const date = new Date(activityData.last_login_at);
                        const now = new Date();
                        const diffInSeconds = Math.floor((now - date) / 1000);

                        if (diffInSeconds < 60) return 'Just now';
                        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
                        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
                        if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
                        return date.toLocaleDateString();
                      })()}
                    </p>
                  )}
                </div>
                <div className="p-3 border border-gray-200 rounded-lg">
                  <label className="text-sm font-medium text-gray-500">Last Login IP</label>
                  <p className="text-sm text-gray-900 mt-1">{activityData.last_login_ip || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Account Timeline */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Account Timeline</h4>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Account Created</p>
                    <p className="text-xs text-gray-500">
                      {activityData.created_at ? new Date(activityData.created_at).toLocaleString() : 'Unknown'}
                    </p>
                  </div>
                </div>

                {activityData.last_login_at && (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Last Login</p>
                      <p className="text-xs text-gray-500">{new Date(activityData.last_login_at).toLocaleString()}</p>
                      {activityData.last_login_ip && (
                        <p className="text-xs text-gray-400">IP: {activityData.last_login_ip}</p>
                      )}
                    </div>
                  </div>
                )}

                {activityData.updated_at && activityData.updated_at !== activityData.created_at && (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Last Updated</p>
                      <p className="text-xs text-gray-500">{new Date(activityData.updated_at).toLocaleString()}</p>
                    </div>
                  </div>
                )}

                {activityData.failed_login_attempts > 0 && (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Failed Login Attempts</p>
                      <p className="text-xs text-gray-500">{activityData.failed_login_attempts} failed attempts</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Security Status */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Security Status</h4>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-600">Account Status:</span>
                {activityData.is_locked ? (
                  <Badge className="bg-red-100 text-red-800">
                    <XCircle className="w-3 h-3 mr-1" />
                    Locked
                  </Badge>
                ) : activityData.failed_login_attempts > 0 ? (
                  <Badge className="bg-yellow-100 text-yellow-800">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Failed Attempts
                  </Badge>
                ) : (
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Active
                  </Badge>
                )}
              </div>
            </div>

            {/* Debug Info */}
            <div className="mt-6 p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 mb-2">Debug Info:</p>
              <p className="text-xs text-gray-600">User ID: {userId}</p>
              <p className="text-xs text-gray-600">Data loaded: {activityData ? 'Yes' : 'No'}</p>
              <p className="text-xs text-gray-600">Raw data: {JSON.stringify(activityData, null, 2)}</p>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Activity Data</h3>
            <p className="text-gray-600 mb-4">No activity information available for this user.</p>
            <div className="flex gap-2 justify-center">
              <Button onClick={loadUserActivity} variant="outline" disabled={activityLoading}>
                <RefreshCw className="w-4 h-4 mr-2" />
                {activityLoading ? 'Loading...' : 'Load Activity'}
              </Button>
              <Button onClick={() => setActivityError(null)} variant="ghost">
                Dismiss
              </Button>
            </div>
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 mb-2">Debug Info:</p>
              <p className="text-xs text-gray-600">User ID: {userId}</p>
              <p className="text-xs text-gray-600">Loading: {activityLoading ? 'Yes' : 'No'}</p>
              <p className="text-xs text-gray-600">Has Data: {activityData ? 'Yes' : 'No'}</p>
              <p className="text-xs text-gray-600">Error: {activityError || 'None'}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UserActivityTab;
