/**
 * Organization Dashboard
 * Dashboard untuk Organization Administrator sesuai spesifikasi
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui';
import { Button } from '@/components/ui';
import {
  Users,
  MessageCircle,
  RefreshCw,
  Download,
  TrendingUp,
  TrendingDown,
  Activity,
  CheckCircle
} from 'lucide-react';
import { useApi, useAuth } from '@/hooks';
import { organizationDashboardApi } from '@/api/BaseApiService';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { formatNumber } from '@/utils/helpers';
import toast from 'react-hot-toast';


const OrganizationDashboard = () => {
  const [refreshing, setRefreshing] = useState(false);
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  // API Hooks - only fetch data if user is authenticated
  const {
    data: dashboardData,
    loading: dashboardLoading,
    error: dashboardError,
    refresh: refreshDashboard
  } = useApi(
    () => organizationDashboardApi.getOverview({ date_from: getDateFrom(), date_to: getDateTo() }),
    { immediate: isAuthenticated }
  );

  const {
    data: realtimeData,
    refresh: refreshRealtime
  } = useApi(
    () => organizationDashboardApi.getRealtime(),
    { immediate: isAuthenticated, interval: 30000 } // Refresh every 30 seconds
  );


  // Helper functions
  function getDateFrom() {
    return new Date().toISOString().split('T')[0];
  }

  function getDateTo() {
    return new Date().toISOString();
  }

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        refreshDashboard(),
        refreshRealtime()
      ]);
      toast.success('Dashboard refreshed successfully');
    } catch (error) {
      toast.error('Failed to refresh dashboard');
    } finally {
      setRefreshing(false);
    }
  };

  // Handle export
  const handleExport = async () => {
    try {
      const response = await organizationDashboardApi.export({
        type: 'overview',
        format: 'csv',
        date_from: getDateFrom(),
        date_to: getDateTo()
      });

      if (response.success) {
        toast.success('Data exported successfully');
        // Handle file download
        const blob = new Blob([response.data], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `dashboard-export-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      toast.error('Failed to export data');
    }
  };


  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Show authentication required if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2">Authentication Required</h3>
          <p className="text-muted-foreground mb-4">Please log in to access the dashboard</p>
          <Button onClick={() => window.location.href = '/auth/login'}>
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  // Show loading state while fetching dashboard data
  if (dashboardLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  // Show error state if dashboard data failed to load
  if (dashboardError) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2">Failed to load dashboard</h3>
          <p className="text-muted-foreground mb-4">An error occurred while loading the dashboard data</p>
          <Button onClick={handleRefresh}>Try Again</Button>
        </div>
      </div>
    );
  }



  const overview = dashboardData?.overview || {};
  const sessionDistributionOverTime = dashboardData?.session_distribution_over_time || [];
  const intentAnalysis = dashboardData?.intent_analysis || [];




  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard Overview</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.full_name || user?.name || 'Organization Administrator'}!
          </p>
          {/* Real-time status */}
          {realtimeData?.data && (
            <div className="flex items-center space-x-4 mt-2">
              <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>{realtimeData.data.active_sessions || 0} active sessions</span>
              </div>
              <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>{realtimeData.data.online_agents || 0} online agents</span>
              </div>
              <div className="text-xs text-muted-foreground">
                Last updated: {new Date(realtimeData.data.timestamp).toLocaleTimeString()}
              </div>
            </div>
          )}
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

      {/* Real-time Status Card */}
      {realtimeData?.data && (
        <Card className="border-green-200 bg-green-50/50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Live Status</span>
            </CardTitle>
            <CardDescription>Real-time dashboard metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {realtimeData.data.active_sessions || 0}
                </div>
                <div className="text-sm text-muted-foreground">Active Sessions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {realtimeData.data.recent_sessions || 0}
                </div>
                <div className="text-sm text-muted-foreground">Recent Sessions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {realtimeData.data.online_agents || 0}
                </div>
                <div className="text-sm text-muted-foreground">Online Agents</div>
              </div>
            </div>
            <div className="mt-3 text-xs text-muted-foreground text-center">
              Last updated: {new Date(realtimeData.data.timestamp).toLocaleString()}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Sessions Today */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions Today</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(overview.total_sessions_today || 0)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {overview.sessions_change_percentage > 0 ? (
                <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
              )}
              <span className={overview.sessions_change_percentage > 0 ? 'text-green-500' : 'text-red-500'}>
                {Math.abs(overview.sessions_change_percentage || 0)}% from yesterday
              </span>
            </div>
            {realtimeData?.data && (
              <div className="flex items-center mt-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-1"></div>
                <span className="text-xs text-green-600">
                  {realtimeData.data.active_sessions || 0} active now
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Average Satisfaction */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Satisfaction</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.avg_satisfaction || 0}</div>
            <p className="text-xs text-muted-foreground">
              Based on user feedback
            </p>
          </CardContent>
        </Card>

        {/* Handover Count */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Handover Count</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(overview.handover_count || 0)}</div>
            <p className="text-xs text-muted-foreground">
              {overview.handover_percentage || 0}% of sessions
            </p>
          </CardContent>
        </Card>

        {/* Active Agents */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Agents</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {realtimeData?.data?.online_agents || overview.active_agents || 0}/{overview.total_agents || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {realtimeData?.data?.online_agents ?
                Math.round(((realtimeData.data.online_agents / (overview.total_agents || 1)) * 100)) :
                (overview.active_agents_percentage || 0)
              }% online
            </p>
            {realtimeData?.data && (
              <div className="flex items-center mt-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-1"></div>
                <span className="text-xs text-green-600">Live</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bot vs Agent Sessions */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Bot vs Agent Sessions</CardTitle>
            <CardDescription>Session distribution over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] border rounded-lg p-4">
              {sessionDistributionOverTime.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={sessionDistributionOverTime.slice(0, 12)}>
                    <defs>
                      <linearGradient id="colorBot" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorAgent" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#eab308" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#eab308" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="time" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-white p-3 border rounded-lg shadow-lg">
                              <p className="text-sm font-medium">{label}</p>
                              <p className="text-sm text-blue-600">bot: {payload[0]?.value || 0}</p>
                              <p className="text-sm text-yellow-600">agent: {payload[1]?.value || 0}</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Area type="monotone" dataKey="bot" stackId="1" stroke="#3b82f6" fill="url(#colorBot)" />
                    <Area type="monotone" dataKey="agent" stackId="1" stroke="#eab308" fill="url(#colorAgent)" />
                    <Legend />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center text-slate-500">
                    <div className="text-lg font-semibold mb-2">No data available</div>
                    <div className="text-sm">Chart will appear when data is loaded</div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Session Distribution Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Session Distribution</CardTitle>
            <CardDescription>Bot vs Agent handling</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] border rounded-lg p-4">
              {(() => {
                const totalBot = sessionDistributionOverTime.reduce((sum, item) => sum + (item.bot || 0), 0);
                const totalAgent = sessionDistributionOverTime.reduce((sum, item) => sum + (item.agent || 0), 0);
                const total = totalBot + totalAgent;

                if (total === 0) {
                  return (
                    <div className="h-full flex items-center justify-center">
                      <div className="text-center text-slate-500">
                        <div className="text-lg font-semibold mb-2">No data available</div>
                        <div className="text-sm">Chart will appear when data is loaded</div>
                      </div>
                    </div>
                  );
                }

                const pieData = [
                  { name: 'Bot', value: totalBot, fill: '#3b82f6' },
                  { name: 'Agent', value: totalAgent, fill: '#eab308' }
                ];

                return (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0];
                            return (
                              <div className="bg-white p-3 border rounded-lg shadow-lg">
                                <p className="text-sm font-medium">{data.name}</p>
                                <p className="text-sm text-slate-600">{data.value} sessions</p>
                                <p className="text-sm text-slate-500">{((data.value / total) * 100).toFixed(1)}%</p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                );
              })()}
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Intent Analysis Table */}
      <Card>
        <CardHeader>
          <CardTitle>Intent Analysis</CardTitle>
          <CardDescription>Top intents and their distribution</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="Search table..."
                  className="px-3 py-2 border rounded-md text-sm"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Intent</th>
                    <th className="text-left py-2">Count</th>
                    <th className="text-left py-2">Percentage</th>
                    <th className="text-left py-2">Trend</th>
                  </tr>
                </thead>
                <tbody>
                  {intentAnalysis.map((intent, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-2 font-medium">{intent.intent}</td>
                      <td className="py-2">{formatNumber(intent.count)}</td>
                      <td className="py-2">{intent.percentage}%</td>
                      <td className="py-2">
                        <div className="flex items-center space-x-1">
                          {intent.trend === '↗' && (
                            <TrendingUp className="h-4 w-4 text-green-500" />
                          )}
                          {intent.trend === '↘' && (
                            <TrendingDown className="h-4 w-4 text-red-500" />
                          )}
                          {intent.trend === '—' && (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {intentAnalysis.length === 0 && (
                    <tr>
                      <td colSpan="4" className="text-center py-8 text-muted-foreground">
                        No intent data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrganizationDashboard;
