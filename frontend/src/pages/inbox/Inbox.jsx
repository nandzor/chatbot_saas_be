/**
 * Enhanced Inbox Page
 * Inbox dengan enhanced components dan error handling
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  useLoadingStates,
  LoadingWrapper,
  SkeletonCard
} from '@/utils/loadingStates';
import {
  handleError,
  withErrorHandling
} from '@/utils/errorHandler';
import {
  useAnnouncement,
  useFocusManagement
} from '@/utils/accessibilityUtils';
import {
  sanitizeInput,
  validateInput
} from '@/utils/securityUtils';
import SessionManager from '@/features/shared/SessionManager';
import InboxManagement from '@/features/shared/InboxManagement';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Alert,
  AlertDescription
} from '@/components/ui';
import {
  MessageSquare,
  Settings,
  RefreshCw,
  Download,
  Filter,
  Search,
  AlertCircle,
  CheckCircle,
  Users,
  Clock,
  Activity
} from 'lucide-react';

const InboxPage = () => {
  const { announce } = useAnnouncement();
  const { focusRef, setFocus } = useFocusManagement();
  const { setLoading, getLoadingState } = useLoadingStates();

  // State management
  const [activeTab, setActiveTab] = useState('session-manager');
  const [error, setError] = useState(null);
  const [inboxStats, setInboxStats] = useState({
    totalSessions: 0,
    activeSessions: 0,
    pendingSessions: 0,
    resolvedSessions: 0,
    avgResponseTime: 0,
    satisfactionRate: 0
  });

  // Load inbox stats
  const loadInboxStats = useCallback(async () => {
    try {
      setLoading('initial', true);
      setError(null);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      setInboxStats({
        totalSessions: 1247,
        activeSessions: 23,
        pendingSessions: 8,
        resolvedSessions: 1216,
        avgResponseTime: 2.3,
        satisfactionRate: 94.2
      });

      announce('Inbox stats loaded successfully');
    } catch (err) {
      const errorResult = handleError(err, {
        context: 'Inbox Stats Loading',
        showToast: true
      });
      setError(errorResult.message);
    } finally {
      setLoading('initial', false);
    }
  }, [setLoading, announce]);

  // Handle tab change
  const handleTabChange = useCallback((value) => {
    setActiveTab(value);
    announce(`Switched to ${value === 'session-manager' ? 'Session Manager' : 'Inbox Management'}`);
  }, [announce]);

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    try {
      setLoading('refresh', true);
      await loadInboxStats();
      announce('Inbox data refreshed successfully');
    } catch (err) {
      handleError(err, { context: 'Inbox Refresh' });
    } finally {
      setLoading('refresh', false);
    }
  }, [loadInboxStats, setLoading, announce]);

  // Handle export
  const handleExport = useCallback(async () => {
    try {
      setLoading('export', true);

      // Simulate export
      await new Promise(resolve => setTimeout(resolve, 2000));

      announce('Inbox data exported successfully');
    } catch (err) {
      handleError(err, { context: 'Inbox Export' });
    } finally {
      setLoading('export', false);
    }
  }, [setLoading, announce]);

  // Load data on mount
  useEffect(() => {
    loadInboxStats();
  }, [loadInboxStats]);

  // Focus management on mount
  useEffect(() => {
    setFocus();
  }, [setFocus]);

  return (
    <div className="space-y-6" ref={focusRef}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inbox</h1>
          <p className="text-muted-foreground">
            Kelola session chat dan konfigurasi inbox
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={getLoadingState('refresh')}
            aria-label="Refresh inbox"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${getLoadingState('refresh') ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          <Button
            variant="outline"
            onClick={handleExport}
            disabled={getLoadingState('export')}
            aria-label="Export inbox data"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <LoadingWrapper
          isLoading={getLoadingState('initial')}
          loadingComponent={<SkeletonCard />}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {inboxStats.totalSessions.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                All time sessions
              </p>
            </CardContent>
          </Card>
        </LoadingWrapper>

        <LoadingWrapper
          isLoading={getLoadingState('initial')}
          loadingComponent={<SkeletonCard />}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {inboxStats.activeSessions}
              </div>
              <p className="text-xs text-muted-foreground">
                Currently active
              </p>
            </CardContent>
          </Card>
        </LoadingWrapper>

        <LoadingWrapper
          isLoading={getLoadingState('initial')}
          loadingComponent={<SkeletonCard />}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Sessions</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {inboxStats.pendingSessions}
              </div>
              <p className="text-xs text-muted-foreground">
                Awaiting response
              </p>
            </CardContent>
          </Card>
        </LoadingWrapper>

        <LoadingWrapper
          isLoading={getLoadingState('initial')}
          loadingComponent={<SkeletonCard />}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Satisfaction Rate</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {inboxStats.satisfactionRate}%
              </div>
              <p className="text-xs text-muted-foreground">
                Customer satisfaction
              </p>
            </CardContent>
          </Card>
        </LoadingWrapper>
      </div>

      {/* Tab Interface */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="session-manager" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Session Manager
          </TabsTrigger>
          <TabsTrigger value="inbox-management" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Inbox Management
          </TabsTrigger>
        </TabsList>

        {/* Session Manager Tab */}
        <TabsContent value="session-manager" className="mt-6">
          <LoadingWrapper
            isLoading={getLoadingState('initial')}
            loadingComponent={<SkeletonCard />}
          >
            <SessionManager />
          </LoadingWrapper>
        </TabsContent>

        {/* Inbox Management Tab */}
        <TabsContent value="inbox-management" className="mt-6">
          <LoadingWrapper
            isLoading={getLoadingState('initial')}
            loadingComponent={<SkeletonCard />}
          >
            <InboxManagement />
          </LoadingWrapper>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default withErrorHandling(InboxPage, {
  context: 'Inbox Page'
});
