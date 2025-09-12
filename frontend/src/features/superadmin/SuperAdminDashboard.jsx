import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Badge,
  Button,
  Alert,
  AlertDescription,
  Skeleton
} from '@/components/ui';
import {
  DollarSign,
  Building2,
  CreditCard,
  TrendingDown,
  Activity,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Users,
  MessageSquare,
  Clock,
  Zap,
  Eye,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import superAdminService from '@/api/superAdminService';

const SuperAdminDashboard = () => {
  // State management
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Business Intelligence data
  const [biMetrics, setBiMetrics] = useState({
    mrr: 0,
    activeOrganizations: 0,
    activeSubscriptions: 0,
    churnRate: 0,
    mrrGrowth: 0,
    orgGrowth: 0,
    subGrowth: 0,
    churnChange: 0
  });

  // Operational Health data
  const [operationalHealth, setOperationalHealth] = useState({
    systemHealth: {
      status: 'unknown',
      errorRate: 0,
      responseTime: 0
    },
    n8nStatus: {
      successRate: 0,
      totalExecutions: 0,
      failedExecutions: 0
    }
  });

  // Recent Activity data
  const [recentActivities, setRecentActivities] = useState([]);

  // Real-time data refresh interval
  const [refreshInterval, setRefreshInterval] = useState(null);

  // Load dashboard data
  const loadDashboardData = async (showRefreshing = false) => {
    try {
      if (showRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      // Load all dashboard data in parallel
      const [
        dashboardResult,
        realtimeResult,
        usageResult,
        performanceResult,
        revenueResult,
        userStatsResult,
        orgStatsResult,
        subStatsResult,
        healthResult
      ] = await Promise.allSettled([
        superAdminService.getDashboardAnalytics(),
        superAdminService.getRealtimeAnalytics(),
        superAdminService.getUsageAnalytics(),
        superAdminService.getPerformanceAnalytics(),
        superAdminService.getRevenueAnalytics(),
        superAdminService.getUserStatistics(),
        superAdminService.getOrganizationStatistics(),
        superAdminService.getSubscriptionStatistics(),
        superAdminService.getSystemHealth()
      ]);

      // Process dashboard analytics
      if (dashboardResult.status === 'fulfilled' && dashboardResult.value.success) {
        const data = dashboardResult.value.data.data;
        setBiMetrics({
          mrr: data.mrr || 0,
          activeOrganizations: data.active_organizations || 0,
          activeSubscriptions: data.active_subscriptions || 0,
          churnRate: data.churn_rate || 0,
          mrrGrowth: data.mrr_growth || 0,
          orgGrowth: data.org_growth || 0,
          subGrowth: data.sub_growth || 0,
          churnChange: data.churn_change || 0
        });
      }

      // Process realtime analytics
      if (realtimeResult.status === 'fulfilled' && realtimeResult.value.success) {
        const data = realtimeResult.value.data.data;
        setOperationalHealth(prev => ({
          ...prev,
          systemHealth: {
            status: data.system_status || 'unknown',
            errorRate: data.error_rate || 0,
            responseTime: data.avg_response_time || 0
          },
          n8nStatus: {
            successRate: data.n8n_success_rate || 0,
            totalExecutions: data.n8n_total_executions || 0,
            failedExecutions: data.n8n_failed_executions || 0
          }
        }));
      }

      // Process recent activities from various sources
      const activities = [];

      // Get recent user activities
      if (userStatsResult.status === 'fulfilled' && userStatsResult.value.success) {
        const userData = userStatsResult.value.data.data;
        if (userData.recent_activities) {
          activities.push(...userData.recent_activities.map(activity => ({
            ...activity,
            type: 'user_management'
          })));
        }
      }

      // Get recent organization activities
      if (orgStatsResult.status === 'fulfilled' && orgStatsResult.value.success) {
        const orgData = orgStatsResult.value.data.data;
        if (orgData.recent_activities) {
          activities.push(...orgData.recent_activities.map(activity => ({
            ...activity,
            type: 'organization'
          })));
        }
      }

      // Get recent subscription activities
      if (subStatsResult.status === 'fulfilled' && subStatsResult.value.success) {
        const subData = subStatsResult.value.data.data;
        if (subData.recent_activities) {
          activities.push(...subData.recent_activities.map(activity => ({
            ...activity,
            type: 'subscription'
          })));
        }
      }

      // Sort activities by timestamp and take latest 10
      setRecentActivities(
        activities
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
          .slice(0, 10)
      );

    } catch (err) {
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Auto-refresh data every 30 seconds
  useEffect(() => {
    loadDashboardData();

    // Set up auto-refresh
    const interval = setInterval(() => {
      loadDashboardData(true);
    }, 30000);

    setRefreshInterval(interval);

    // Cleanup interval on unmount
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, []);

  // Manual refresh function
  const handleRefresh = () => {
    loadDashboardData(true);
  };

  const getHealthIcon = (status) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Activity className="w-5 h-5 text-gray-500" />;
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'user_management':
        return <Users className="w-4 h-4 text-blue-500" />;
      case 'subscription':
        return <CreditCard className="w-4 h-4 text-green-500" />;
      case 'payment':
        return <DollarSign className="w-4 h-4 text-emerald-500" />;
      case 'automation':
        return <Zap className="w-4 h-4 text-purple-500" />;
      case 'trial':
        return <Clock className="w-4 h-4 text-orange-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatPercentage = (value) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const getGrowthColor = (value) => {
    if (value > 0) return 'text-green-600';
    if (value < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  // Loading skeleton component
  const MetricSkeleton = () => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-4" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-24 mb-2" />
        <Skeleton className="h-3 w-20" />
      </CardContent>
    </Card>
  );

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Super Admin Dashboard</h1>
          <p className="text-muted-foreground">Platform overview dan business intelligence</p>
        </div>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
            <Button
              variant="outline"
              size="sm"
              className="ml-4"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              {refreshing ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              Try Again
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Super Admin Dashboard</h1>
          <p className="text-muted-foreground">Platform overview dan business intelligence</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing}
        >
          {refreshing ? (
            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4 mr-2" />
          )}
          Refresh
        </Button>
      </div>

      {/* Business Intelligence Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading ? (
          <>
            <MetricSkeleton />
            <MetricSkeleton />
            <MetricSkeleton />
            <MetricSkeleton />
          </>
        ) : (
          <>
            {/* MRR */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monthly Recurring Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(biMetrics.mrr)}</div>
                <p className="text-xs text-muted-foreground">
                  <span className={getGrowthColor(biMetrics.mrrGrowth)}>
                    {formatPercentage(biMetrics.mrrGrowth)}
                  </span> dari bulan lalu
                </p>
              </CardContent>
            </Card>

            {/* Active Organizations */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Organizations</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{biMetrics.activeOrganizations.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  <span className={getGrowthColor(biMetrics.orgGrowth)}>
                    {formatPercentage(biMetrics.orgGrowth)}
                  </span> dari bulan lalu
                </p>
              </CardContent>
            </Card>

            {/* Active Subscriptions */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{biMetrics.activeSubscriptions.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  <span className={getGrowthColor(biMetrics.subGrowth)}>
                    {formatPercentage(biMetrics.subGrowth)}
                  </span> dari bulan lalu
                </p>
              </CardContent>
            </Card>

            {/* Churn Rate */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Churn Rate</CardTitle>
                <TrendingDown className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{biMetrics.churnRate.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground">
                  <span className={getGrowthColor(-biMetrics.churnChange)}>
                    {formatPercentage(-biMetrics.churnChange)}
                  </span> dari bulan lalu
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Operational Health */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {loading ? (
          <>
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-64" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-8 w-full" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-64" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-2 w-full" />
                <Skeleton className="h-8 w-full" />
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            {/* System Health Monitor */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {getHealthIcon(operationalHealth.systemHealth.status)}
                  System Health Monitor
                </CardTitle>
                <CardDescription>Real-time platform health metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <Badge variant={operationalHealth.systemHealth.status === 'healthy' ? 'default' : 'destructive'}>
                    {operationalHealth.systemHealth.status === 'healthy' ? 'Healthy' :
                     operationalHealth.systemHealth.status === 'warning' ? 'Warning' : 'Issues Detected'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Error Rate</span>
                  <span className="text-sm font-medium">{operationalHealth.systemHealth.errorRate.toFixed(2)}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Avg Response Time</span>
                  <span className="text-sm font-medium">{operationalHealth.systemHealth.responseTime.toFixed(0)}ms</span>
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  <Eye className="w-4 h-4 mr-2" />
                  View Detailed Logs
                </Button>
              </CardContent>
            </Card>

            {/* N8N Execution Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-purple-500" />
                  N8N Execution Status
                </CardTitle>
                <CardDescription>Workflow automation platform status</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Success Rate</span>
                  <span className="text-sm font-medium text-green-600">{operationalHealth.n8nStatus.successRate.toFixed(1)}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Executions</span>
                  <span className="text-sm font-medium">{operationalHealth.n8nStatus.totalExecutions.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Failed Executions</span>
                  <span className="text-sm font-medium text-red-600">{operationalHealth.n8nStatus.failedExecutions.toLocaleString()}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{width: `${Math.min(operationalHealth.n8nStatus.successRate, 100)}%`}}
                  ></div>
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  <Activity className="w-4 h-4 mr-2" />
                  View N8N Dashboard
                </Button>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Recent Activity Feed */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Recent Platform Activity
          </CardTitle>
          <CardDescription>Latest activities across all organizations</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg">
                  <Skeleton className="w-4 h-4 mt-1" />
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
              ))}
            </div>
          ) : recentActivities.length > 0 ? (
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex-shrink-0 mt-1">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{activity.action || 'Activity'}</span>
                      {activity.organization && (
                        <Badge variant="outline" className="text-xs">
                          {activity.organization}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{activity.description || 'No description available'}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {activity.timestamp ? new Date(activity.timestamp).toLocaleString('id-ID') : 'Unknown time'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No recent activities found</p>
            </div>
          )}

          <div className="mt-4 pt-4 border-t">
            <Button variant="outline" className="w-full">
              View All Activities
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SuperAdminDashboard;
