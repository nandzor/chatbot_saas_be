/**
 * Enhanced Inbox Page
 * Inbox dengan enhanced components dan error handling
 */

import { useState, useCallback, useEffect } from 'react';
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
// import {
//   sanitizeInput,
//   validateInput
// } from '@/utils/securityUtils';
import { inboxService } from '@/services/InboxService';
import { useApi } from '@/hooks/useApi';
import SessionManager from '@/features/shared/SessionManager';
import InboxManagement from '@/features/shared/InboxManagement';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Card,
  CardContent,
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
  AlertCircle,
  CheckCircle,
  Clock,
  Activity
} from 'lucide-react';

const InboxPageComponent = () => {
  const { announce } = useAnnouncement();
  const { focusRef, setFocus } = useFocusManagement();
  const { setLoading, getLoadingState } = useLoadingStates();

  // State management
  const [activeTab, setActiveTab] = useState('session-manager');
  const [error, setError] = useState(null);

  // Create stable reference for API function
  const getStatistics = useCallback(() => inboxService.getStatistics(), []);

  // Create stable error callback
  const onErrorCallback = useCallback((err) => {
    const errorResult = handleError(err, {
      context: 'Inbox Stats Loading',
      showToast: true
    });
    setError(errorResult.message);
  }, []);

  // API hooks for statistics
  const {
    data: inboxStats,
    loading: statsLoading,
    refresh: refreshStats
  } = useApi(getStatistics, {
    immediate: true,
    onError: onErrorCallback
  });

  // Handle tab change
  const handleTabChange = useCallback((value) => {
    setActiveTab(value);
    announce(`Switched to ${value === 'session-manager' ? 'Session Manager' : 'Inbox Management'}`);
  }, [announce]);

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    try {
      setLoading('refresh', true);
      await refreshStats();
      announce('Inbox data refreshed successfully');
    } catch (err) {
      handleError(err, { context: 'Inbox Refresh' });
    } finally {
      setLoading('refresh', false);
    }
  }, [refreshStats, setLoading, announce]);

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

  // Data is loaded automatically by useApi with immediate: true

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
          isLoading={statsLoading || getLoadingState('initial')}
          loadingComponent={<SkeletonCard />}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {inboxStats?.total_sessions?.toLocaleString() || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                All time sessions
              </p>
            </CardContent>
          </Card>
        </LoadingWrapper>

        <LoadingWrapper
          isLoading={statsLoading || getLoadingState('initial')}
          loadingComponent={<SkeletonCard />}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {inboxStats?.active_sessions || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Currently active
              </p>
            </CardContent>
          </Card>
        </LoadingWrapper>

        <LoadingWrapper
          isLoading={statsLoading || getLoadingState('initial')}
          loadingComponent={<SkeletonCard />}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Sessions</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {inboxStats?.pending_sessions || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Awaiting response
              </p>
            </CardContent>
          </Card>
        </LoadingWrapper>

        <LoadingWrapper
          isLoading={statsLoading || getLoadingState('initial')}
          loadingComponent={<SkeletonCard />}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Satisfaction Rate</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {inboxStats?.satisfaction_rate?.toFixed(1) || 0}%
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

const InboxPage = withErrorHandling(InboxPageComponent, {
  context: 'Inbox Page'
});

export default InboxPage;
