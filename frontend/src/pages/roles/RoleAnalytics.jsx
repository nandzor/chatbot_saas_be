import React, { useState, useCallback, useEffect } from 'react';
import {
  BarChart3,
  Users,
  Shield,
  TrendingUp,
  TrendingDown,
  Activity,
  Calendar,
  Target,
  PieChart,
  BarChart,
  LineChart
} from 'lucide-react';
import { roleManagementService } from '@/services/RoleManagementService';
import { toast } from 'react-hot-toast';
import {Card, CardContent, CardDescription, CardHeader, CardTitle, Badge, Select, SelectItem, Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui';

const RoleAnalytics = () => {
  const [analytics, setAnalytics] = useState({
    overview: {},
    trends: [],
    roleDistribution: [],
    userActivity: [],
    permissionStats: [],
    recentActivity: []
  });
  const [loading, setLoading] = useState(false);
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedRole, setSelectedRole] = useState('all');

  // Load analytics data
  useEffect(() => {
    loadAnalytics();
  }, [timeRange, selectedRole]);

  const loadAnalytics = useCallback(async () => {
    try {
      setLoading(true);

      const response = await roleManagementService.getAnalytics({
        time_range: timeRange,
        role_id: selectedRole === 'all' ? null : selectedRole
      });

      if (response.success) {
        setAnalytics(response.data);
      } else {
        toast.error('Failed to load analytics data');
      }
    } catch (error) {
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  }, [timeRange, selectedRole]);

  // Format number with commas
  const formatNumber = (num) => {
    return new Intl.NumberFormat().format(num);
  };

  // Calculate percentage change
  const calculatePercentageChange = (current, previous) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous * 100).toFixed(1);
  };

  // Get trend icon and color
  const getTrendIcon = (change) => {
    const isPositive = parseFloat(change) > 0;
    return {
      icon: isPositive ? TrendingUp : TrendingDown,
      color: isPositive ? 'text-green-600' : 'text-red-600',
      bgColor: isPositive ? 'bg-green-100' : 'bg-red-100'
    };
  };

  return (
    <div className="space-y-6">


      {/* Charts and Detailed Analytics */}
      <Tabs defaultValue="overview" className="space-y-4">
        <div className="border-b border-gray-200">
          <TabsList className="inline-flex h-10 items-center justify-center rounded-lg bg-gray-100 p-1 text-gray-500 w-auto">
            <TabsTrigger
              value="overview"
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-gray-200"
            >
              Overview
            </TabsTrigger>

            <TabsTrigger
              value="distribution"
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-gray-200"
            >
              Distribution
            </TabsTrigger>
            <TabsTrigger
              value="activity"
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-gray-200"
            >
              Activity
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Role Distribution Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Role Distribution</CardTitle>
                <CardDescription>Distribution of roles by scope and type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.roleDistribution?.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: item.color || '#6B7280' }}
                        />
                        <span className="text-sm font-medium">{item.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {item.count}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-500">
                        {item.percentage}%
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest role management activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.recentActivity?.slice(0, 5).map((activity, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{activity.action}</p>
                        <p className="text-xs text-gray-500">
                          {activity.description}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(activity.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>



        <TabsContent value="distribution" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Permission Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Permission Distribution</CardTitle>
                <CardDescription>Most commonly used permissions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.permissionStats?.slice(0, 8).map((permission, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{permission.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {permission.category}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-500">
                        {permission.usage_count} roles
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Scope Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Scope Distribution</CardTitle>
                <CardDescription>Roles distributed by scope</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {['global', 'organization', 'department', 'team', 'personal'].map((scope) => {
                    const scopeData = analytics.roleDistribution?.find(item => item.scope === scope);
                    return (
                      <div key={scope} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge className="capitalize">
                            {scope}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-500">
                          {scopeData?.count || 0} roles
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Activity by Role</CardTitle>
              <CardDescription>Most active roles and their usage patterns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.userActivity?.map((activity, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: (activity.color || '#6B7280') + '20' }}
                        >
                          <Shield className="w-4 h-4" style={{ color: activity.color || '#6B7280' }} />
                        </div>
                        <div>
                          <h4 className="font-medium">{activity.role_name}</h4>
                          <p className="text-sm text-gray-500">{activity.role_code}</p>
                        </div>
                      </div>
                      <Badge variant="outline">
                        {activity.active_users} active users
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Total Assignments</p>
                        <p className="font-medium">{activity.total_assignments}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Avg. Session Time</p>
                        <p className="font-medium">{activity.avg_session_time || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Last Activity</p>
                        <p className="font-medium">
                          {activity.last_activity ? new Date(activity.last_activity).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RoleAnalytics;
