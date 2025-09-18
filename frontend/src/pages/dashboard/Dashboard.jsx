import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
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
  useDebounce,
  withPerformanceOptimization
} from '@/utils/performanceOptimization';
import {
  useAnnouncement,
  useFocusManagement
} from '@/utils/accessibilityUtils';
import {
  sanitizeInput,
  validateInput
} from '@/utils/securityUtils';
import {
  Calendar,
  Download,
  TrendingUp,
  Star,
  AlertCircle,
  UserCheck,
  Headphones,
  MessageSquare,
  Smile,
  Users,
  RefreshCw,
  Filter,
  Search
} from 'lucide-react';
import {Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Input, Select, SelectItem, Badge, Alert, AlertDescription, DataTable} from '@/components/ui';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
  Tooltip,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';

// Custom Tooltip component to prevent accessibilityLayer prop warning
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border rounded p-2 shadow-lg">
        <p className="font-medium">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const Dashboard = () => {
  const { user, logout } = useAuth();
  const { announce } = useAnnouncement();
  const { focusRef } = useFocusManagement();
  const { setLoading, isLoading, getLoadingState } = useLoadingStates();

  // State management
  const [dashboardData, setDashboardData] = useState({
    pieData: [],
    sessionsData: [],
    intentsData: [],
    kpis: {},
    recentActivity: []
  });
  const [filters, setFilters] = useState({
    dateRange: '7d',
    search: '',
    status: 'all'
  });
  const [error, setError] = useState(null);

  // Debounced search
  const debouncedSearch = useDebounce(filters.search, 300);

  const handleLogout = useCallback(() => {
    try {
      logout();
      announce('Logged out successfully');
    } catch (err) {
      handleError(err, { context: 'Logout' });
    }
  }, [logout, announce]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Access Denied
          </h1>
          <p className="text-gray-600">
            Please log in to access the dashboard.
          </p>
        </div>
      </div>
    );
  }

  // Sample data - in production, this would come from API
  const sampleData = useMemo(() => ({
    pieData: [
      { name: 'Bot Handled', value: 68, fill: 'hsl(var(--chart-1))' },
      { name: 'Agent Handled', value: 32, fill: 'hsl(var(--chart-4))' }
    ],
    sessionsData: [
      { hour: '00:00', bot: 45, agent: 12 },
      { hour: '04:00', bot: 32, agent: 8 },
      { hour: '08:00', bot: 89, agent: 34 },
      { hour: '12:00', bot: 120, agent: 56 },
      { hour: '16:00', bot: 98, agent: 45 },
      { hour: '20:00', bot: 67, agent: 23 }
    ],
    intentsData: [
      { name: "Customer Support", count: 289, percentage: 24, trending: "stable" },
      { name: "Technical Support", count: 198, percentage: 16, trending: "down" },
      { name: "Product Inquiry", count: 156, percentage: 13, trending: "up" },
      { name: "Billing Question", count: 134, percentage: 11, trending: "stable" },
      { name: "Account Access", count: 98, percentage: 8, trending: "down" }
    ],
    kpis: {
      totalSessions: 1247,
      satisfactionRate: 94.2,
      avgResponseTime: 2.3,
      activeAgents: 12
    },
    recentActivity: [
      { id: 1, type: 'conversation', message: 'New conversation started', time: '2 min ago' },
      { id: 2, type: 'agent', message: 'Agent Sarah joined', time: '5 min ago' },
      { id: 3, type: 'bot', message: 'Bot resolved inquiry', time: '8 min ago' }
    ]
  }), []);

  // Load dashboard data
  const loadDashboardData = useCallback(async () => {
    try {
      setLoading('initial', true);
      setError(null);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      setDashboardData(sampleData);
      announce('Dashboard data loaded successfully');
    } catch (err) {
      const errorResult = handleError(err, {
        context: 'Dashboard Data Loading',
        showToast: true
      });
      setError(errorResult.message);
    } finally {
      setLoading('initial', false);
    }
  }, [sampleData, setLoading, announce]);

  // Load data on mount
  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Filter data based on search
  const filteredIntentsData = useMemo(() => {
    if (!debouncedSearch) return dashboardData.intentsData;

    return dashboardData.intentsData.filter(intent =>
      intent.name.toLowerCase().includes(debouncedSearch.toLowerCase())
    );
  }, [dashboardData.intentsData, debouncedSearch]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
            <p className="text-gray-600">Welcome back, {user?.full_name || user?.username || 'User'}!</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">
                {user?.full_name || user?.username || 'User'}
              </p>
              <p className="text-xs text-gray-500">
                {user?.email || 'No email'}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={loadDashboardData}
              disabled={getLoadingState('refresh')}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${getLoadingState('refresh') ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant="outline" size="sm">
              <Calendar className="w-4 h-4 mr-2" />
              Today
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleLogout}
            >
              Logout
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

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <LoadingWrapper
            isLoading={getLoadingState('initial')}
            loadingComponent={<SkeletonCard />}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total Sessions Today</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {dashboardData.kpis.totalSessions?.toLocaleString() || '1,247'}
                    </p>
                    <div className="flex items-center gap-1 mt-2">
                      <TrendingUp className="w-4 h-4 text-green-500" />
                      <span className="text-xs text-green-500">+15% from yesterday</span>
                    </div>
                  </div>
                  <MessageSquare className="w-10 h-10 text-blue-500 opacity-20" />
                </div>
              </CardContent>
            </Card>
          </LoadingWrapper>

          <LoadingWrapper
            isLoading={getLoadingState('initial')}
            loadingComponent={<SkeletonCard />}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Avg Satisfaction</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {(dashboardData.kpis.satisfactionRate / 20).toFixed(1) || '4.7'}
                    </p>
                    <div className="flex items-center gap-1 mt-2">
                      <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                      <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                      <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                      <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                      <Star className="w-3 h-3 text-yellow-500" />
                    </div>
                  </div>
                  <Smile className="w-10 h-10 text-green-500 opacity-20" />
                </div>
              </CardContent>
            </Card>
          </LoadingWrapper>

          <LoadingWrapper
            isLoading={getLoadingState('initial')}
            loadingComponent={<SkeletonCard />}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Handover Count</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {Math.round((dashboardData.kpis.totalSessions * 0.32) || 89)}
                    </p>
                    <div className="flex items-center gap-1 mt-2">
                      <AlertCircle className="w-4 h-4 text-yellow-500" />
                      <span className="text-xs text-yellow-500">32% of sessions</span>
                    </div>
                  </div>
                  <Users className="w-10 h-10 text-purple-500 opacity-20" />
                </div>
              </CardContent>
            </Card>
          </LoadingWrapper>

          <LoadingWrapper
            isLoading={getLoadingState('initial')}
            loadingComponent={<SkeletonCard />}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Active Agents</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {dashboardData.kpis.activeAgents || 12}/15
                    </p>
                    <div className="flex items-center gap-1 mt-2">
                      <UserCheck className="w-4 h-4 text-green-500" />
                      <span className="text-xs text-green-500">80% online</span>
                    </div>
                  </div>
                  <Headphones className="w-10 h-10 text-indigo-500 opacity-20" />
                </div>
              </CardContent>
            </Card>
          </LoadingWrapper>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Bot vs Agent Sessions</CardTitle>
              <CardDescription>Session distribution over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] border rounded-lg p-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dashboardData.sessionsData || []}>
                    <defs>
                      <linearGradient id="colorBot" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorAgent" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--chart-4))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--chart-4))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="hour" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="bot" stackId="1" stroke="hsl(var(--chart-1))" fill="url(#colorBot)" />
                    <Area type="monotone" dataKey="agent" stackId="1" stroke="hsl(var(--chart-4))" fill="url(#colorAgent)" />
                    <Legend />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Session Distribution</CardTitle>
              <CardDescription>Bot vs Agent handling</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[250px] border rounded-lg p-4">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dashboardData.pieData || []}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {(dashboardData.pieData || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Intents Table */}
        <DataTable
          data={filteredIntentsData}
          columns={[
            {
              key: 'name',
              title: 'Intent',
              sortable: true
            },
            {
              key: 'count',
              title: 'Count',
              sortable: true,
              render: (value) => value.toLocaleString()
            },
            {
              key: 'percentage',
              title: 'Percentage',
              sortable: true,
              render: (value) => (
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                      style={{ width: `${value}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500">{value}%</span>
                </div>
              )
            },
            {
              key: 'trending',
              title: 'Trend',
              sortable: true,
              render: (value) => {
                if (value === 'up') return <TrendingUp className="w-4 h-4 text-green-500" />;
                if (value === 'down') return <TrendingUp className="w-4 h-4 text-red-500 rotate-180" />;
                return <div className="w-4 h-4 text-gray-500">—</div>;
              }
            }
          ]}
          loading={getLoadingState('initial')}
          searchable={true}
          ariaLabel="Top intents table"
        />

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Button variant="outline" className="h-auto p-4 flex flex-col items-start gap-2">
                <MessageSquare className="w-6 h-6 text-blue-500" />
                <div className="text-left">
                  <div className="font-medium">Handle Chats</div>
                  <div className="text-sm text-gray-500">Respond to customer inquiries</div>
                </div>
              </Button>

              <Button variant="outline" className="h-auto p-4 flex flex-col items-start gap-2">
                <TrendingUp className="w-6 h-6 text-green-500" />
                <div className="text-left">
                  <div className="font-medium">View Analytics</div>
                  <div className="text-sm text-gray-500">Check performance metrics</div>
                </div>
              </Button>

              <Button variant="outline" className="h-auto p-4 flex flex-col items-start gap-2">
                <Users className="w-6 h-6 text-purple-500" />
                <div className="text-left">
                  <div className="font-medium">Manage Users</div>
                  <div className="text-sm text-gray-500">Add, edit, or remove users</div>
                </div>
              </Button>

              <Button variant="outline" className="h-auto p-4 flex flex-col items-start gap-2">
                <Star className="w-6 h-6 text-yellow-500" />
                <div className="text-left">
                  <div className="font-medium">Knowledge Base</div>
                  <div className="text-sm text-gray-500">Manage articles and documentation</div>
                </div>
              </Button>

              <Button variant="outline" className="h-auto p-4 flex flex-col items-start gap-2">
                <UserCheck className="w-6 h-6 text-indigo-500" />
                <div className="text-left">
                  <div className="font-medium">Role Management</div>
                  <div className="text-sm text-gray-500">Manage roles and permissions</div>
                </div>
              </Button>

              <Button variant="outline" className="h-auto p-4 flex flex-col items-start gap-2">
                <AlertCircle className="w-6 h-6 text-gray-500" />
                <div className="text-left">
                  <div className="font-medium">Settings</div>
                  <div className="text-sm text-gray-500">Configure system settings</div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default withPerformanceOptimization(Dashboard, {
  memoize: true,
  monitorPerformance: true
});
