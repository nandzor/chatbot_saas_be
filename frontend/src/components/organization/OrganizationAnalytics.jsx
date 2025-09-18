import React, { useState, useEffect } from 'react';
import { useOrganizationAnalytics } from '@/hooks/useOrganizationAnalytics';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Building2,
  Calendar,
  DollarSign,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Minus
} from 'lucide-react';
import {Card, CardContent, CardDescription, CardHeader, CardTitle, Badge, Button, Select, SelectItem, Skeleton} from '@/components/ui';

const OrganizationAnalytics = ({
  organization,
  statistics = {},
  loading = false,
  onRefresh
}) => {
  // Use organization analytics hook
  const {
    analyticsData,
    loading: analyticsLoading,
    error: analyticsError,
    timeRange,
    metrics,
    updateTimeRange,
    refreshAnalytics,
    getGrowthIcon,
    getGrowthColor,
    formatNumber,
    formatCurrency,
    formatPercentage
  } = useOrganizationAnalytics(organization?.id);

  // Handle time range change
  const handleTimeRangeChange = (value) => {
    updateTimeRange(value);
  };

  // Handle refresh
  const handleRefresh = () => {
    refreshAnalytics();
    if (onRefresh) onRefresh();
  };

  if (loading || analyticsLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Analytics Overview</h3>
          <p className="text-sm text-gray-600">Organization performance and trends</p>
        </div>
        <div className="flex items-center space-x-3">
          <Select value={timeRange} onValueChange={handleTimeRangeChange} className="w-32">
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
</Select>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading || analyticsLoading}>
            <Activity className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Growth Metrics */}
      {analyticsData && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatNumber(metrics.totalUsers)}
                  </p>
                </div>
                <div className="flex items-center space-x-1">
                  {getGrowthIcon(analyticsData?.growth?.users)}
                  <span className={`text-sm font-medium ${getGrowthColor(analyticsData?.growth?.users)}`}>
                    {formatPercentage(analyticsData?.growth?.users || 0)}
                  </span>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">vs previous period</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Users</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatNumber(metrics.activeUsers)}
                  </p>
                </div>
                <div className="flex items-center space-x-1">
                  {getGrowthIcon(analyticsData?.growth?.users)}
                  <span className={`text-sm font-medium ${getGrowthColor(analyticsData?.growth?.users)}`}>
                    {formatPercentage(analyticsData?.growth?.users || 0)}
                  </span>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">vs previous period</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Conversations</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatNumber(metrics.totalConversations)}
                  </p>
                </div>
                <div className="flex items-center space-x-1">
                  {getGrowthIcon(analyticsData?.growth?.conversations)}
                  <span className={`text-sm font-medium ${getGrowthColor(analyticsData?.growth?.conversations)}`}>
                    {formatPercentage(analyticsData?.growth?.conversations || 0)}
                  </span>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">vs previous period</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Status Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Building2 className="h-5 w-5" />
              <span>Organization Status</span>
            </CardTitle>
            <CardDescription>
              Distribution of organizations by status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium">Active</span>
                </div>
                <span className="text-sm font-bold">{statistics.active_organizations || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm font-medium">Trial</span>
                </div>
                <span className="text-sm font-bold">{statistics.trial_organizations || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <span className="text-sm font-medium">Expired Trial</span>
                </div>
                <span className="text-sm font-bold">{statistics.expired_trial_organizations || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                  <span className="text-sm font-medium">Inactive</span>
                </div>
                <span className="text-sm font-bold">{statistics.inactive_organizations || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>User Distribution</span>
            </CardTitle>
            <CardDescription>
              Organizations with and without users
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span className="text-sm font-medium">With Users</span>
                </div>
                <span className="text-sm font-bold">{statistics.organizations_with_users || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                  <span className="text-sm font-medium">Without Users</span>
                </div>
                <span className="text-sm font-bold">{statistics.organizations_without_users || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Recent Activity</span>
          </CardTitle>
          <CardDescription>
            Latest organization activities and changes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">New organization created</p>
                <p className="text-xs text-gray-500">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Trial period started</p>
                <p className="text-xs text-gray-500">4 hours ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Trial period expired</p>
                <p className="text-xs text-gray-500">6 hours ago</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrganizationAnalytics;
