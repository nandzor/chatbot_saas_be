/**
 * SuperAdmin Dashboard
 * Dashboard khusus untuk Super Admin dengan akses penuh
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Users,
  Building2,
  CreditCard,
  DollarSign,
  Activity,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Download,
  Settings,
  Shield,
  Database,
  Server,
  BarChart3,
  PieChart,
  LineChart
} from 'lucide-react';
import { GenericCard, StatsCard } from '@/components/common';
import { useApi } from '@/hooks';
import { analyticsApi, userApi, organizationApi, subscriptionApi } from '@/api/BaseApiService';
import { formatNumber, formatCurrency, formatDate } from '@/utils/helpers';
import { LoadingStates, ErrorStates } from '@/components/ui';

const SuperAdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [refreshing, setRefreshing] = useState(false);

  // API Hooks
  const { data: analytics, loading: analyticsLoading, error: analyticsError, refresh: refreshAnalytics } = useApi(
    analyticsApi.getDashboard,
    { immediate: true }
  );

  const { data: users, loading: usersLoading, error: usersError, refresh: refreshUsers } = useApi(
    userApi.getStatistics,
    { immediate: true }
  );

  const { data: organizations, loading: orgsLoading, error: orgsError, refresh: refreshOrgs } = useApi(
    organizationApi.getStatistics,
    { immediate: true }
  );

  const { data: subscriptions, loading: subsLoading, error: subsError, refresh: refreshSubs } = useApi(
    subscriptionApi.getStatistics,
    { immediate: true }
  );

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        refreshAnalytics(),
        refreshUsers(),
        refreshOrgs(),
        refreshSubs()
      ]);
    } finally {
      setRefreshing(false);
    }
  };

  // Handle export
  const handleExport = () => {
    // Implement export functionality
  };

  // Loading state
  if (analyticsLoading || usersLoading || orgsLoading || subsLoading) {
    return <LoadingStates.DashboardLoadingSkeleton />;
  }

  // Error state
  if (analyticsError || usersError || orgsError || subsError) {
    return (
      <ErrorStates.GenericErrorState
        title="Failed to load dashboard"
        message="An error occurred while loading the dashboard data"
        onRetry={handleRefresh}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">SuperAdmin Dashboard</h1>
          <p className="text-muted-foreground">
            Complete system overview and management
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            variant="outline"
            onClick={handleExport}
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="organizations">Organizations</TabsTrigger>
          <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard
              title="Total Users"
              value={formatNumber(users?.total_users || 0)}
              change={`+${formatNumber(users?.new_users_this_month || 0)} this month`}
              changeType="positive"
              icon={Users}
            />
            <StatsCard
              title="Organizations"
              value={formatNumber(organizations?.total_organizations || 0)}
              change={`+${formatNumber(organizations?.new_organizations_this_month || 0)} this month`}
              changeType="positive"
              icon={Building2}
            />
            <StatsCard
              title="Active Subscriptions"
              value={formatNumber(subscriptions?.active_subscriptions || 0)}
              change={`${formatNumber(subscriptions?.renewal_rate || 0)}% renewal rate`}
              changeType="positive"
              icon={CreditCard}
            />
            <StatsCard
              title="Monthly Revenue"
              value={formatCurrency(subscriptions?.monthly_revenue || 0)}
              change={`+${formatNumber(subscriptions?.revenue_growth || 0)}% growth`}
              changeType="positive"
              icon={DollarSign}
            />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5" />
                  <span>User Growth</span>
                </CardTitle>
                <CardDescription>
                  User registration over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  Chart placeholder - User Growth
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <PieChart className="w-5 h-5" />
                  <span>Subscription Distribution</span>
                </CardTitle>
                <CardDescription>
                  Distribution by subscription plans
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  Chart placeholder - Subscription Distribution
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="w-5 h-5" />
                <span>Recent Activity</span>
              </CardTitle>
              <CardDescription>
                Latest system activities and events
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics?.recent_activities?.map((activity, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 border rounded-lg">
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(activity.created_at, 'DD/MM/YYYY HH:mm')}
                      </p>
                    </div>
                    <Badge variant="outline">{activity.type}</Badge>
                  </div>
                )) || (
                  <div className="text-center py-8 text-muted-foreground">
                    No recent activity
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                Manage all users across the platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                User management interface will be implemented here
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Organizations Tab */}
        <TabsContent value="organizations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Organization Management</CardTitle>
              <CardDescription>
                Manage all organizations and their settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Organization management interface will be implemented here
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Subscriptions Tab */}
        <TabsContent value="subscriptions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Subscription Management</CardTitle>
              <CardDescription>
                Manage all subscriptions and billing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Subscription management interface will be implemented here
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Analytics</CardTitle>
              <CardDescription>
                Detailed analytics and reporting
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Advanced analytics interface will be implemented here
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Tab */}
        <TabsContent value="system" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>System Administration</CardTitle>
              <CardDescription>
                System settings and configuration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                System administration interface will be implemented here
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SuperAdminDashboard;
