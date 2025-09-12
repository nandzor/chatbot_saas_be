import React, { useState, useCallback, useEffect } from 'react';
import {
  Activity,
  AlertCircle,
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

const UserSessionsTab = ({ userId, user }) => {
  const { getUserSessions } = useUserManagement();

  // Sessions data state
  const [sessionsData, setSessionsData] = useState(null);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [sessionsError, setSessionsError] = useState(null);

  // Load user sessions data
  const loadUserSessions = useCallback(async () => {
    if (!userId) return;

    try {
      setSessionsLoading(true);
      setSessionsError(null);
      const result = await getUserSessions(userId);

      if (result.success) {
        setSessionsData(result.data);
      } else {
        setSessionsError(result.error || 'Failed to load user sessions');
      }
    } catch (err) {
      setSessionsError('Failed to load user sessions');
    } finally {
      setSessionsLoading(false);
    }
  }, [userId, getUserSessions]);

  // Load data when component mounts
  useEffect(() => {
    if (userId && !sessionsData && !sessionsLoading) {
      loadUserSessions();
    }
  }, [userId, sessionsData, sessionsLoading, loadUserSessions]);

  // Reset data when user changes
  useEffect(() => {
    if (userId) {
      setSessionsData(null);
      setSessionsError(null);
    }
  }, [userId]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5" />
          User Sessions
        </CardTitle>
        <CardDescription>
          {sessionsData ? `${sessionsData.active_sessions} active sessions` : 'Loading sessions...'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {sessionsLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : sessionsError ? (
          <div className="text-center py-8">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Sessions</h3>
            <p className="text-gray-600 mb-4">{sessionsError}</p>
            <div className="flex gap-2 justify-center">
              <Button onClick={loadUserSessions} variant="outline" disabled={sessionsLoading}>
                <RefreshCw className="w-4 h-4 mr-2" />
                {sessionsLoading ? 'Loading...' : 'Try Again'}
              </Button>
              <Button onClick={() => setSessionsError(null)} variant="ghost">
                Dismiss
              </Button>
            </div>
          </div>
        ) : sessionsData && sessionsData.sessions ? (
          <div className="space-y-6">
            {/* Sessions Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{sessionsData.total_sessions}</div>
                <div className="text-sm text-gray-500">Total Sessions</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{sessionsData.active_sessions}</div>
                <div className="text-sm text-gray-500">Active Sessions</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-600">{sessionsData.expired_sessions}</div>
                <div className="text-sm text-gray-500">Expired Sessions</div>
              </div>
            </div>

            {/* Sessions List */}
            <div className="space-y-3">
              {sessionsData.sessions.map((session) => (
                <div key={session.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Activity className="w-5 h-5 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-gray-900">
                          {session.browser_info.name} {session.browser_info.version}
                        </h4>
                        <Badge className="text-xs">
                          {session.device_type}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-500 space-y-1">
                        <p>IP: {session.ip_address || 'N/A'}</p>
                        <p>Location: {session.location}</p>
                        <p>User Agent: {session.browser_info.full_ua}</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className={
                      session.status === 'active' ? 'bg-green-100 text-green-800' :
                      session.status === 'expired' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }>
                      {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                    </Badge>
                    <div className="mt-2 text-xs text-gray-500">
                      <p>Created: {new Date(session.created_at).toLocaleDateString()}</p>
                      {session.last_activity_at && (
                        <p>Last Activity: {new Date(session.last_activity_at).toLocaleString()}</p>
                      )}
                      {session.expires_at && (
                        <p>Expires: {new Date(session.expires_at).toLocaleString()}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Sessions Found</h3>
            <p className="text-gray-600 mb-4">No session information available for this user.</p>
            <Button onClick={loadUserSessions} variant="outline">
              Load Sessions
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UserSessionsTab;
