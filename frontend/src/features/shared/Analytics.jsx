/**
 * Enhanced Analytics Component
 * Analytics dengan DataTable dan enhanced components
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Badge,
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Alert,
  AlertDescription,
  DataTable
} from '@/components/ui';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
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
// div and div removed - using simple divs instead
import {
  channelPerformanceData,
  sessionsData,
  intentsData,
  agentsData
} from '@/data/sampleData';
import {
  TrendingUp,
  TrendingDown,
  Users,
  MessageSquare,
  Clock,
  Star,
  Download,
  RefreshCw,
  Filter,
  Search,
  AlertCircle,
  BarChart3,
  PieChart as PieChartIcon,
  Activity
} from 'lucide-react';

// Custom Tooltip component to avoid accessibilityLayer prop warning
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

const Analytics = () => {
  const { announce } = useAnnouncement();
  const { focusRef, setFocus } = useFocusManagement();
  const { setLoading, getLoadingState } = useLoadingStates();

  // State management
  const [analyticsData, setAnalyticsData] = useState({
    sessions: [],
    intents: [],
    agents: [],
    channels: [],
    kpis: {}
  });
  const [filteredIntents, setFilteredIntents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState('7d');
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Sample data - in production, this would come from API
  const sampleData = useMemo(() => ({
    sessions: sessionsData,
    intents: intentsData,
    agents: agentsData,
    channels: channelPerformanceData,
    kpis: {
      totalSessions: 1247,
      satisfactionRate: 94.2,
      avgResponseTime: 2.3,
      activeAgents: 12,
      resolutionRate: 87.5,
      firstContactResolution: 78.3
    }
  }), []);

  // Load analytics data
  const loadAnalyticsData = useCallback(async () => {
    try {
      setLoading('initial', true);
      setError(null);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      setAnalyticsData(sampleData);
      setFilteredIntents(sampleData.intents);
      announce('Analytics data loaded successfully');
    } catch (err) {
      const errorResult = handleError(err, {
        context: 'Analytics Data Loading',
        showToast: true
      });
      setError(errorResult.message);
    } finally {
      setLoading('initial', false);
    }
  }, [sampleData, setLoading, announce]);

  // Filter intents based on search
  const filterIntents = useCallback(() => {
    if (!searchQuery) {
      setFilteredIntents(analyticsData.intents);
      return;
    }

    const sanitizedQuery = sanitizeInput(searchQuery.toLowerCase());
    const filtered = analyticsData.intents.filter(intent =>
      intent.name.toLowerCase().includes(sanitizedQuery) ||
      intent.description?.toLowerCase().includes(sanitizedQuery)
    );

    setFilteredIntents(filtered);
  }, [analyticsData.intents, searchQuery]);

  // Load data on mount
  useEffect(() => {
    loadAnalyticsData();
  }, [loadAnalyticsData]);

  // Filter intents when search changes
  useEffect(() => {
    filterIntents();
  }, [filterIntents]);

  // Handle search
  const handleSearch = useCallback((e) => {
    const value = sanitizeInput(e.target.value);
    setSearchQuery(value);
  }, []);

  // Handle date range change
  const handleDateRangeChange = useCallback((value) => {
    setDateRange(value);
    announce(`Date range changed to ${value}`);
  }, [announce]);

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    try {
      setLoading('refresh', true);
      await loadAnalyticsData();
      announce('Analytics data refreshed successfully');
    } catch (err) {
      handleError(err, { context: 'Analytics Refresh' });
    } finally {
      setLoading('refresh', false);
    }
  }, [loadAnalyticsData, setLoading, announce]);

  // Handle export
  const handleExport = useCallback(async () => {
    try {
      setLoading('export', true);

      // Simulate export
      await new Promise(resolve => setTimeout(resolve, 2000));

      announce('Analytics data exported successfully');
    } catch (err) {
      handleError(err, { context: 'Analytics Export' });
    } finally {
      setLoading('export', false);
    }
  }, [setLoading, announce]);

  // Handle tab change
  const handleTabChange = useCallback((value) => {
    setActiveTab(value);
    announce(`Switched to ${value} analytics`);
  }, [announce]);

  // DataTable columns for intents
  const intentColumns = [
    {
      key: 'name',
      title: 'Intent',
      sortable: true,
      render: (value, intent) => (
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
            <MessageSquare className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <div className="font-medium text-gray-900">{value}</div>
            <div className="text-sm text-gray-500">{intent.description}</div>
          </div>
        </div>
      )
    },
    {
      key: 'count',
      title: 'Count',
      sortable: true,
      render: (value) => (
        <div className="text-sm font-medium text-gray-900">
          {value ? value.toLocaleString() : '0'}
        </div>
      )
    },
    {
      key: 'percentage',
      title: 'Percentage',
      sortable: true,
      render: (value) => (
        <div className="flex items-center space-x-2">
          <div className="w-20 bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full"
              style={{ width: `${value}%` }}
            />
          </div>
          <span className="text-sm text-gray-600">{value}%</span>
        </div>
      )
    },
    {
      key: 'trend',
      title: 'Trend',
      sortable: true,
      render: (value) => (
        <div className="flex items-center space-x-1">
          {value === 'up' ? (
            <TrendingUp className="w-4 h-4 text-green-500" />
          ) : value === 'down' ? (
            <TrendingDown className="w-4 h-4 text-red-500" />
          ) : (
            <div className="w-4 h-4 text-gray-400">—</div>
          )}
          <span className="text-sm text-gray-600 capitalize">{value}</span>
        </div>
      )
    }
  ];

  // DataTable columns for agents
  const agentColumns = [
    {
      key: 'name',
      title: 'Agent',
      sortable: true,
      render: (value, agent) => (
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
            <Users className="h-4 w-4 text-green-600" />
          </div>
          <div>
            <div className="font-medium text-gray-900">{value}</div>
            <div className="text-sm text-gray-500">{agent.email}</div>
          </div>
        </div>
      )
    },
    {
      key: 'sessionsHandled',
      title: 'Sessions',
      sortable: true,
      render: (value) => (
        <div className="text-sm font-medium text-gray-900">
          {value ? value.toLocaleString() : '0'}
        </div>
      )
    },
    {
      key: 'satisfactionRate',
      title: 'Satisfaction',
      sortable: true,
      render: (value) => (
        <div className="flex items-center space-x-2">
          <Star className="w-4 h-4 text-yellow-500" />
          <span className="text-sm text-gray-900">{value}%</span>
        </div>
      )
    },
    {
      key: 'avgResponseTime',
      title: 'Avg Response',
      sortable: true,
      render: (value) => (
        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-900">{value}s</span>
        </div>
      )
    },
    {
      key: 'status',
      title: 'Status',
      sortable: true,
      render: (value) => (
        <Badge variant={value === 'online' ? 'default' : 'secondary'}>
          {value ? value.charAt(0).toUpperCase() + value.slice(1) : 'Unknown'}
        </Badge>
      )
    }
  ];

  // Focus management on mount
  useEffect(() => {
    setFocus();
  }, [setFocus]);

  return (
    <div className="space-y-6" ref={focusRef}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">
            Monitor performance, insights, and key metrics
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={getLoadingState('refresh')}
            aria-label="Refresh analytics"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${getLoadingState('refresh') ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          <Button
            variant="outline"
            onClick={handleExport}
            disabled={getLoadingState('export')}
            aria-label="Export analytics"
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

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Date Range</label>
              <Select value={dateRange} onValueChange={handleDateRangeChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select date range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1d">Last 24 hours</SelectItem>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Search Intents</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search intents..."
                  value={searchQuery}
                  onChange={handleSearch}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPI Cards */}
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
                {analyticsData.kpis.totalSessions?.toLocaleString() || '0'}
              </div>
              <p className="text-xs text-muted-foreground">
                +12% from last month
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
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analyticsData.kpis.satisfactionRate || 0}%
              </div>
              <p className="text-xs text-muted-foreground">
                +2.1% from last month
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
              <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analyticsData.kpis.avgResponseTime || 0}s
              </div>
              <p className="text-xs text-muted-foreground">
                -5.2% from last month
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
              <CardTitle className="text-sm font-medium">Active Agents</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analyticsData.kpis.activeAgents || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                +2 from last week
              </p>
            </CardContent>
          </Card>
        </LoadingWrapper>
      </div>

      {/* Analytics Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="intents">Intents</TabsTrigger>
          <TabsTrigger value="agents">Agents</TabsTrigger>
          <TabsTrigger value="channels">Channels</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Sessions Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Sessions Over Time</CardTitle>
              <CardDescription>Bot vs Agent handled sessions</CardDescription>
            </CardHeader>
            <CardContent>
              <LoadingWrapper
                isLoading={getLoadingState('initial')}
                loadingComponent={<SkeletonCard />}
              >
                <div className="h-[300px] border rounded-lg p-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analyticsData.sessions}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="hour" />
                      <YAxis />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="bot"
                        stroke="hsl(var(--chart-1))"
                        strokeWidth={2}
                      />
                      <Line
                        type="monotone"
                        dataKey="agent"
                        stroke="hsl(var(--chart-4))"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </LoadingWrapper>
            </CardContent>
          </Card>

          {/* Distribution Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Session Distribution</CardTitle>
              <CardDescription>Bot vs Agent handling</CardDescription>
            </CardHeader>
            <CardContent>
              <LoadingWrapper
                isLoading={getLoadingState('initial')}
                loadingComponent={<SkeletonCard />}
              >
                <div className="h-[300px] border rounded-lg p-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Bot Handled', value: 68, fill: 'hsl(var(--chart-1))' },
                          { name: 'Agent Handled', value: 32, fill: 'hsl(var(--chart-4))' }
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        <Cell fill="hsl(var(--chart-1))" />
                        <Cell fill="hsl(var(--chart-4))" />
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </LoadingWrapper>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Intents Tab */}
        <TabsContent value="intents">
          <DataTable
            data={filteredIntents}
            columns={intentColumns}
            loading={getLoadingState('initial')}
            error={error}
            searchable={false} // We handle search in filters
            ariaLabel="Intents analytics table"
            pagination={{
              currentPage: 1,
              totalPages: 1,
              hasNext: false,
              hasPrevious: false,
              onNext: () => {},
              onPrevious: () => {}
            }}
          />
        </TabsContent>

        {/* Agents Tab */}
        <TabsContent value="agents">
          <DataTable
            data={analyticsData.agents}
            columns={agentColumns}
            loading={getLoadingState('initial')}
            error={error}
            searchable={true}
            ariaLabel="Agents analytics table"
            pagination={{
              currentPage: 1,
              totalPages: 1,
              hasNext: false,
              hasPrevious: false,
              onNext: () => {},
              onPrevious: () => {}
            }}
          />
        </TabsContent>

        {/* Channels Tab */}
        <TabsContent value="channels">
          <Card>
            <CardHeader>
              <CardTitle>Channel Performance</CardTitle>
              <CardDescription>Performance metrics by channel</CardDescription>
            </CardHeader>
            <CardContent>
              <LoadingWrapper
                isLoading={getLoadingState('initial')}
                loadingComponent={<SkeletonCard />}
              >
                <div className="h-[300px] border rounded-lg p-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analyticsData.channels}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="channel" />
                      <YAxis />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Bar dataKey="sessions" fill="hsl(var(--chart-1))" />
                      <Bar dataKey="satisfaction" fill="hsl(var(--chart-2))" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </LoadingWrapper>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default withErrorHandling(Analytics, {
  context: 'Analytics Component'
});
