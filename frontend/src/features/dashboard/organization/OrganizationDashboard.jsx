/**
 * Organization Dashboard
 * Dashboard untuk Organization Administrator sesuai spesifikasi
 */

import { useState } from 'react';
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
import { useApi } from '@/hooks';
import { organizationDashboardApi } from '@/api/BaseApiService';
import { formatNumber } from '@/utils/helpers';
import { LoadingStates, ErrorStates } from '@/components/ui';
import toast from 'react-hot-toast';


const OrganizationDashboard = () => {
  const [refreshing, setRefreshing] = useState(false);

  // Set test token for development
  if (!localStorage.getItem('jwt_token') && !localStorage.getItem('chatbot_auth_token')) {
    localStorage.setItem('jwt_token', '19|vRvOeXOCLnLDOF3wjYcOsS9FaWB8aq9VBtlWZMAHab41ee67');
    localStorage.setItem('chatbot_user', JSON.stringify({
      id: '5b968a06-08b3-4d45-8f3a-8096fa1c8b9d',
      name: 'Test User',
      organization_id: '845e49a7-87db-4eb8-a5b6-6c077d0be712'
    }));
  }

  // API Hooks
  const {
    data: dashboardData,
    loading: dashboardLoading,
    error: dashboardError,
    refresh: refreshDashboard
  } = useApi(
    () => organizationDashboardApi.getOverview({ date_from: getDateFrom(), date_to: getDateTo() }),
    { immediate: true }
  );

  const {
    data: realtimeData,
    refresh: refreshRealtime
  } = useApi(
    () => organizationDashboardApi.getRealtime(),
    { immediate: true, interval: 30000 } // Refresh every 30 seconds
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


  // Loading state
  if (dashboardLoading) {
    return <LoadingStates.DashboardLoadingSkeleton />;
  }

  // Error state
  if (dashboardError) {
    return (
      <ErrorStates.GenericErrorState
        title="Failed to load dashboard"
        message="An error occurred while loading the dashboard data"
        onRetry={handleRefresh}
      />
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
            Welcome back, Organization Administrator!
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
        <Card>
          <CardHeader>
            <CardTitle>Bot vs Agent Sessions</CardTitle>
            <CardDescription>Session distribution over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Line/Area Chart */}
              <div className="h-80 bg-white rounded-lg p-6 border border-slate-200">
                {sessionDistributionOverTime.length > 0 ? (
                  <div className="h-full flex flex-col">
                    {/* Chart Area */}
                    <div className="flex-1 relative">
                      {/* Y-axis labels */}
                      <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-slate-500 pr-2">
                        <span>180</span>
                        <span>135</span>
                        <span>90</span>
                        <span>45</span>
                        <span>0</span>
                      </div>

                      {/* Chart SVG */}
                      <div className="ml-8 h-full">
                        <svg className="w-full h-full" viewBox="0 0 400 200">
                          {/* Grid lines */}
                          <defs>
                            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#f1f5f9" strokeWidth="1"/>
                            </pattern>
                          </defs>
                          <rect width="100%" height="100%" fill="url(#grid)" />

                          {/* Bot line and area */}
                          <path
                            d={(() => {
                              const points = sessionDistributionOverTime.slice(0, 12).map((item, index) => {
                                const x = (index / 11) * 360 + 20;
                                const y = 180 - ((item.bot || 0) / 180) * 160;
                                return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
                              }).join(' ');
                              return points;
                            })()}
                            fill="none"
                            stroke="#3b82f6"
                            strokeWidth="2"
                          />

                          {/* Bot area fill */}
                          <path
                            d={(() => {
                              const points = sessionDistributionOverTime.slice(0, 12).map((item, index) => {
                                const x = (index / 11) * 360 + 20;
                                const y = 180 - ((item.bot || 0) / 180) * 160;
                                return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
                              }).join(' ');
                              const firstX = 20;
                              const lastX = 380;
                              return `${points} L ${lastX} 180 L ${firstX} 180 Z`;
                            })()}
                            fill="rgba(59, 130, 246, 0.1)"
                          />

                          {/* Agent line and area */}
                          <path
                            d={(() => {
                              const points = sessionDistributionOverTime.slice(0, 12).map((item, index) => {
                                const x = (index / 11) * 360 + 20;
                                const total = (item.bot || 0) + (item.agent || 0);
                                const y = 180 - (total / 180) * 160;
                                return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
                              }).join(' ');
                              return points;
                            })()}
                            fill="none"
                            stroke="#eab308"
                            strokeWidth="2"
                          />

                          {/* Agent area fill */}
                          <path
                            d={(() => {
                              const points = sessionDistributionOverTime.slice(0, 12).map((item, index) => {
                                const x = (index / 11) * 360 + 20;
                                const total = (item.bot || 0) + (item.agent || 0);
                                const y = 180 - (total / 180) * 160;
                                return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
                              }).join(' ');
                              const firstX = 20;
                              const lastX = 380;
                              return `${points} L ${lastX} 180 L ${firstX} 180 Z`;
                            })()}
                            fill="rgba(234, 179, 8, 0.1)"
                          />
                        </svg>
                      </div>
                    </div>

                    {/* X-axis labels */}
                    <div className="ml-8 flex justify-between text-xs text-slate-500 mt-2">
                      <span>00:00</span>
                      <span>04:00</span>
                      <span>08:00</span>
                      <span>12:00</span>
                      <span>16:00</span>
                      <span>20:00</span>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center text-slate-500">
                      <div className="text-lg font-semibold mb-2">No data available</div>
                      <div className="text-sm">Chart will appear when data is loaded</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Legend */}
              <div className="flex justify-center space-x-6">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-slate-700">bot</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm text-slate-700">agent</span>
                </div>
              </div>
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
            <div className="flex items-center justify-center">
              <div className="relative w-64 h-64">
                {(() => {
                  const totalBot = sessionDistributionOverTime.reduce((sum, item) => sum + (item.bot || 0), 0);
                  const totalAgent = sessionDistributionOverTime.reduce((sum, item) => sum + (item.agent || 0), 0);
                  const total = totalBot + totalAgent;
                  const botPercentage = total > 0 ? (totalBot / total) * 100 : 0;
                  const agentPercentage = total > 0 ? (totalAgent / total) * 100 : 0;

                  if (total === 0) {
                    return (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-center text-slate-500">
                          <div className="text-lg font-semibold mb-2">No data available</div>
                          <div className="text-sm">Chart will appear when data is loaded</div>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <svg className="w-full h-full" viewBox="0 0 200 200">
                      {/* Bot segment */}
                      <path
                        d={`M 100 100 L 100 20 A 80 80 0 ${botPercentage > 50 ? 1 : 0} 1 ${100 + 80 * Math.cos((botPercentage / 100) * 2 * Math.PI - Math.PI / 2)} ${100 + 80 * Math.sin((botPercentage / 100) * 2 * Math.PI - Math.PI / 2)} Z`}
                        fill="#3b82f6"
                      />
                      {/* Agent segment */}
                      <path
                        d={`M 100 100 L ${100 + 80 * Math.cos((botPercentage / 100) * 2 * Math.PI - Math.PI / 2)} ${100 + 80 * Math.sin((botPercentage / 100) * 2 * Math.PI - Math.PI / 2)} A 80 80 0 ${agentPercentage > 50 ? 1 : 0} 1 100 20 Z`}
                        fill="#eab308"
                      />
                      {/* Bot label */}
                      <text
                        x={100 + 40 * Math.cos((botPercentage / 200) * 2 * Math.PI - Math.PI / 2)}
                        y={100 + 40 * Math.sin((botPercentage / 200) * 2 * Math.PI - Math.PI / 2)}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="text-xs font-medium fill-white"
                      >
                        Handled {Math.round(botPercentage)}%
                      </text>
                      {/* Agent label */}
                      <text
                        x={100 + 60 * Math.cos(((botPercentage + agentPercentage / 2) / 100) * 2 * Math.PI - Math.PI / 2)}
                        y={100 + 60 * Math.sin(((botPercentage + agentPercentage / 2) / 100) * 2 * Math.PI - Math.PI / 2)}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="text-xs font-medium fill-slate-700"
                      >
                        Agent Handled
                      </text>
                    </svg>
                  );
                })()}
              </div>
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
