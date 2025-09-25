import { useState, useEffect, useCallback } from 'react';
import {
  MessageCircle,
  TrendingUp,
  Brain,
  Target,
  Clock,
  Star,
  AlertTriangle,
  CheckCircle,
  Activity,
  BarChart3,
  Lightbulb,
  UserCheck,
  Bot,
  User,
  Filter,
  Search,
  Plus,
  UserPlus,
  Eye,
  Edit,
  Copy,
  MoreHorizontal
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Badge,
  Button,
  Progress,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Textarea,
  Label,
  Checkbox
} from '@/components/ui';
import { useModernInbox } from '@/hooks/useModernInbox';
import AgentAssignmentDialog from './AgentAssignmentDialog';
import BulkActionsDialog from './BulkActionsDialog';

const ModernInboxDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // New state for enhanced features
  const [availableAgents, setAvailableAgents] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [selectedConversations, setSelectedConversations] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [showAgentAssignment, setShowAgentAssignment] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [selectedConversationForAssignment, setSelectedConversationForAssignment] = useState(null);

  // Modern Inbox hook
  const {
    loading: hookLoading,
    error: hookError,
    loadDashboard,
    loadAvailableAgents,
    loadConversations,
    loadTemplates,
    assignConversationToAgent,
    performBulkActions,
    saveConversationTemplate
  } = useModernInbox();


  // Load dashboard data
  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await loadDashboard();

      if (response.success) {
        setDashboardData(response.data);
      }
    } catch (error) {
      // Dashboard load error
    } finally {
      setLoading(false);
    }
  }, [loadDashboard]);

  // Load available agents
  const loadAvailableAgentsData = useCallback(async () => {
    try {
      const response = await loadAvailableAgents();
      if (response.success) {
        setAvailableAgents(response.data.agents || []);
      }
    } catch (error) {
      // Error loading available agents
    }
  }, [loadAvailableAgents]);

  // Load conversation filters
  const loadConversationFiltersData = useCallback(async () => {
    try {
      // Load conversation filters logic here
    } catch (error) {
      // Error loading conversation filters
    }
  }, []);

  // Load conversations
  const loadConversationsData = useCallback(async (filters = {}) => {
    try {
      const response = await loadConversations(filters);
      if (response.success) {
        setConversations(response.data.conversations || []);
      }
    } catch (error) {
      // Error loading conversations
    }
  }, [loadConversations]);

  // Load templates
  const loadTemplatesData = useCallback(async () => {
    try {
      const response = await loadTemplates();
      if (response.success) {
        setTemplates(response.data.templates || []);
      }
    } catch (error) {
      // Error loading templates
    }
  }, [loadTemplates]);

  // Load agent performance
  const loadAgentPerformanceData = useCallback(async () => {
    try {
      // Load agent performance logic here
    } catch (error) {
      // Error loading agent performance
    }
  }, []);

  // Refresh data
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  }, [loadDashboardData]);

  // Handle conversation assignment
  const handleAssignConversation = useCallback(async (conversationId, agentId, reason) => {
    try {
      await assignConversationToAgent(conversationId, agentId, reason);
      loadConversationsData();
    } catch (error) {
      // Error assigning conversation
    }
  }, [assignConversationToAgent, loadConversationsData]);

  // Handle bulk actions
  const handleBulkAction = useCallback(async (action, actionData = {}) => {
    if (selectedConversations.length === 0) {
      alert('Please select conversations first');
      return;
    }

    try {
      await performBulkActions(selectedConversations, action, actionData);
      setSelectedConversations([]);
      loadConversationsData();
    } catch (error) {
      // Error applying bulk action
    }
  }, [selectedConversations, performBulkActions, loadConversationsData]);

  // Handle template save
  const handleSaveTemplate = useCallback(async (templateData) => {
    try {
      await saveConversationTemplate(templateData);
      setShowTemplateDialog(false);
      loadTemplatesData();
    } catch (error) {
      // Error saving template
    }
  }, [saveConversationTemplate, loadTemplatesData]);

  // Load data on component mount
  useEffect(() => {
    loadDashboardData();
    loadAvailableAgentsData();
    loadConversationFiltersData();
    loadConversationsData();
    loadTemplatesData();
    loadAgentPerformanceData();

    // Set up auto-refresh every 30 seconds
    const interval = setInterval(() => {
      loadDashboardData();
      loadConversationsData();
    }, 30000);
    return () => clearInterval(interval);
  }, [loadDashboardData, loadAvailableAgentsData, loadConversationFiltersData, loadConversationsData, loadTemplatesData, loadAgentPerformanceData]);


  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Failed to load dashboard data</p>
        <Button onClick={handleRefresh} className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }

  const { overview, ai_insights, agent_performance, conversation_health, predictive_analytics, real_time_alerts } = dashboardData || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Modern Inbox Dashboard</h1>
          <p className="text-muted-foreground">
            AI-powered conversation management with human agent assistance
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <Activity className="h-4 w-4 mr-2" />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {hookError && (
        <div className="p-4 rounded-lg border border-red-200 bg-red-50">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2 text-red-600" />
            <div>
              <p className="font-medium text-red-800">Error Loading Data</p>
              <p className="text-sm text-red-700">{hookError}</p>
            </div>
          </div>
        </div>
      )}

      {/* Real-time Alerts */}
      {real_time_alerts && (
        <div className="space-y-2">
          {real_time_alerts.high_priority_conversations > 0 && (
            <div className="p-4 rounded-lg border-l-4 border-red-500 bg-red-50 dark:bg-red-950">
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-red-600" />
                <div>
                  <p className="font-medium text-red-800">High Priority Conversations</p>
                  <p className="text-sm text-red-700">{real_time_alerts.high_priority_conversations} conversations need immediate attention</p>
                </div>
              </div>
            </div>
          )}
          {real_time_alerts.overdue_conversations > 0 && (
            <div className="p-4 rounded-lg border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-yellow-600" />
                <div>
                  <p className="font-medium text-yellow-800">Overdue Conversations</p>
                  <p className="text-sm text-yellow-700">{real_time_alerts.overdue_conversations} conversations are overdue</p>
                </div>
              </div>
            </div>
          )}
          {real_time_alerts.agent_capacity_alerts > 0 && (
            <div className="p-4 rounded-lg border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-950">
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-blue-600" />
                <div>
                  <p className="font-medium text-blue-800">Agent Capacity Alerts</p>
                  <p className="text-sm text-blue-700">{real_time_alerts.agent_capacity_alerts} agents at capacity</p>
                </div>
              </div>
            </div>
          )}
          {real_time_alerts.escalation_alerts > 0 && (
            <div className="p-4 rounded-lg border-l-4 border-purple-500 bg-purple-50 dark:bg-purple-950">
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-purple-600" />
                <div>
                  <p className="font-medium text-purple-800">Escalation Alerts</p>
                  <p className="text-sm text-purple-700">{real_time_alerts.escalation_alerts} conversations escalated</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main Dashboard Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="conversations">Conversations</TabsTrigger>
          <TabsTrigger value="agents">Agents</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="ai-insights">AI Insights</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Conversations</CardTitle>
                <MessageCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{overview?.total_conversations || 0}</div>
                <p className="text-xs text-muted-foreground">
                  +12% from last hour
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Conversations</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{overview?.active_conversations || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {overview?.pending_conversations || 0} pending
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Resolved Today</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{overview?.resolved_conversations || 0}</div>
                <p className="text-xs text-muted-foreground">
                  +8% from yesterday
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Customer Satisfaction</CardTitle>
                <Brain className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{ai_insights?.customer_satisfaction || 0}/5</div>
                <Progress value={((ai_insights?.customer_satisfaction || 0) / 5) * 100} className="mt-2" />
              </CardContent>
            </Card>
          </div>

          {/* Conversation Health */}
          <Card>
            <CardHeader>
              <CardTitle>Conversation Health</CardTitle>
              <CardDescription>
                Real-time monitoring of conversation quality and customer satisfaction
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {conversation_health?.health_score || 0}%
                  </div>
                  <p className="text-sm text-muted-foreground">Health Score</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-600">
                    {Object.keys(conversation_health?.bottlenecks || {}).length}
                  </div>
                  <p className="text-sm text-muted-foreground">Bottlenecks</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {Object.keys(conversation_health?.improvement_areas || {}).length}
                  </div>
                  <p className="text-sm text-muted-foreground">Improvement Areas</p>
                </div>
              </div>
              <div className="mt-4 space-y-3">
                {conversation_health?.bottlenecks && Object.entries(conversation_health.bottlenecks).map(([key, value], index) => (
                  <div key={index} className="p-3 rounded-lg bg-yellow-50 border border-yellow-200">
                    <div className="text-sm font-medium text-yellow-800 capitalize">{key.replace('_', ' ')}</div>
                    <div className="text-sm text-yellow-700">{value}</div>
                  </div>
                ))}
                {conversation_health?.improvement_areas && Object.entries(conversation_health.improvement_areas).map(([key, value], index) => (
                  <div key={index} className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                    <div className="text-sm font-medium text-blue-800 capitalize">{key.replace('_', ' ')}</div>
                    <div className="text-sm text-blue-700">{value}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Insights Tab */}
        <TabsContent value="ai-insights" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sentiment Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Brain className="h-5 w-5 mr-2" />
                  Sentiment Analysis
                </CardTitle>
                <CardDescription>
                  Current customer sentiment trends
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Total Conversations</span>
                    <Badge variant="default">
                      {ai_insights?.total_conversations || 0}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Active Conversations</span>
                      <span>{ai_insights?.active_conversations || 0}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Avg Response Time</span>
                      <span>{ai_insights?.avg_response_time || 0}s</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Customer Satisfaction</span>
                      <span>{ai_insights?.customer_satisfaction || 0}/5</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="h-5 w-5 mr-2" />
                  Performance Metrics
                </CardTitle>
                <CardDescription>
                  Key performance indicators
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Response Time</span>
                    <Badge variant="outline">
                      {ai_insights?.avg_response_time || 0}s
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Satisfaction</span>
                    <Badge variant="outline">
                      {ai_insights?.customer_satisfaction || 0}/5
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Active Chats</span>
                    <Badge variant="outline">
                      {ai_insights?.active_conversations || 0}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Summary */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Lightbulb className="h-5 w-5 mr-2" />
                  AI Insights Summary
                </CardTitle>
                <CardDescription>
                  Overview of AI-powered analytics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 rounded-lg bg-blue-50">
                    <div className="text-2xl font-bold text-blue-600">{ai_insights?.total_conversations || 0}</div>
                    <div className="text-sm text-blue-800">Total Conversations</div>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-green-50">
                    <div className="text-2xl font-bold text-green-600">{ai_insights?.active_conversations || 0}</div>
                    <div className="text-sm text-green-800">Active Now</div>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-purple-50">
                    <div className="text-2xl font-bold text-purple-600">{ai_insights?.customer_satisfaction || 0}/5</div>
                    <div className="text-sm text-purple-800">Satisfaction</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Agent Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <UserCheck className="h-5 w-5 mr-2" />
                  Your Performance
                </CardTitle>
                <CardDescription>
                  Your current performance metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                {agent_performance && agent_performance.length > 0 ? (
                  <div className="space-y-4">
                    {agent_performance.map((agent, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{agent.name || 'Agent'}</span>
                          <Badge variant="outline">{agent.status || 'Active'}</Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Satisfaction:</span>
                            <span className="ml-2 font-medium">{agent.satisfaction || 0}/5</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Response Time:</span>
                            <span className="ml-2 font-medium">{agent.response_time || 0}s</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <UserCheck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No agent performance data available</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Performance metrics will appear here once agents start handling conversations
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Predictive Analytics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Predictive Analytics
                </CardTitle>
                <CardDescription>
                  Forecasted metrics and trends
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Volume Forecast</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Next Week</span>
                        <span>{predictive_analytics?.volume_forecast?.next_week || 0}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Next Month</span>
                        <span>{predictive_analytics?.volume_forecast?.next_month || 0}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Trend</span>
                        <Badge variant={predictive_analytics?.volume_forecast?.trend === 'increasing' ? 'default' : 'secondary'}>
                          {predictive_analytics?.volume_forecast?.trend || 'stable'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-2">Capacity Planning</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Current Agents</span>
                        <span>{predictive_analytics?.capacity_planning?.current_agents || 0}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Recommended Agents</span>
                        <span>{predictive_analytics?.capacity_planning?.recommended_agents || 0}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Utilization Rate</span>
                        <span>{((predictive_analytics?.capacity_planning?.utilization_rate || 0) * 100).toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Conversation Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Conversation Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Bot className="h-4 w-4 mr-2 text-blue-500" />
                      <span className="text-sm">AI Handled</span>
                    </div>
                    <span className="text-sm font-medium">65%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2 text-green-500" />
                      <span className="text-sm">Human Handled</span>
                    </div>
                    <span className="text-sm font-medium">35%</span>
                  </div>
                  <Progress value={65} className="mt-2" />
                </div>
              </CardContent>
            </Card>

            {/* Response Time Trends */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Response Time Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Average Response Time</span>
                    <span className="font-medium">45s</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>First Response Time</span>
                    <span className="font-medium">12s</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Resolution Time</span>
                    <span className="font-medium">8m 30s</span>
                  </div>
                  <div className="text-xs text-green-600 mt-2">
                    ↓ 15% improvement from last week
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quality Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Star className="h-5 w-5 mr-2" />
                  Quality Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Customer Satisfaction</span>
                    <span className="font-medium">4.3/5</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>First Contact Resolution</span>
                    <span className="font-medium">87%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>AI Accuracy</span>
                    <span className="font-medium">92%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Escalation Rate</span>
                    <span className="font-medium">8%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Conversations Tab */}
        <TabsContent value="conversations" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Conversation Management</h2>
              <p className="text-muted-foreground">Manage and assign conversations to agents</p>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowBulkActions(true)}
                disabled={selectedConversations.length === 0}
              >
                <MoreHorizontal className="h-4 w-4 mr-2" />
                Bulk Actions ({selectedConversations.length})
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => loadConversationsData()}
              >
                <Activity className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>

          {/* Conversation Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Filter className="h-5 w-5 mr-2" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="status-filter">Status</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="priority-filter">Priority</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="All Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priority</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="agent-filter">Assigned Agent</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="All Agents" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Agents</SelectItem>
                      {availableAgents.map((agent) => (
                        <SelectItem key={agent.id} value={agent.id}>
                          {agent.display_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="search">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Search conversations..."
                      className="pl-8"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Conversations List */}
          <Card>
            <CardHeader>
              <CardTitle>Conversations</CardTitle>
              <CardDescription>
                {conversations.length} conversations found
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {conversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50"
                  >
                    <div className="flex items-center space-x-4">
                      <Checkbox
                        checked={selectedConversations.includes(conversation.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedConversations([...selectedConversations, conversation.id]);
                          } else {
                            setSelectedConversations(selectedConversations.filter(id => id !== conversation.id));
                          }
                        }}
                      />
                      <div className="flex items-center space-x-2">
                        <Badge variant={conversation.priority === 'urgent' ? 'destructive' : 'secondary'}>
                          {conversation.priority}
                        </Badge>
                        <Badge variant="outline">
                          {conversation.status}
                        </Badge>
                      </div>
                      <div>
                        <p className="font-medium">{conversation.customer_name || 'Unknown Customer'}</p>
                        <p className="text-sm text-muted-foreground">
                          {conversation.last_message?.substring(0, 100)}...
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedConversationForAssignment(conversation.id);
                          setShowAgentAssignment(true);
                        }}
                      >
                        <UserPlus className="h-4 w-4 mr-2" />
                        Assign
                      </Button>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Agents Tab */}
        <TabsContent value="agents" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Agent Management</h2>
              <p className="text-muted-foreground">View and manage available agents</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadAvailableAgentsData()}
            >
              <Activity className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>

          {/* Available Agents */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableAgents.map((agent) => (
              <Card key={agent.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{agent.display_name}</CardTitle>
                    <Badge variant={agent.availability_status === 'online' ? 'default' : 'secondary'}>
                      {agent.availability_status}
                    </Badge>
                  </div>
                  <CardDescription>{agent.department}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Current Load</span>
                      <span>{agent.current_active_chats}/{agent.max_concurrent_chats}</span>
                    </div>
                    <Progress
                      value={(agent.current_active_chats / agent.max_concurrent_chats) * 100}
                      className="h-2"
                    />
                    <div className="flex justify-between text-sm">
                      <span>Capacity Utilization</span>
                      <span>{agent.capacity_utilization}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Rating</span>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 mr-1 fill-yellow-400 text-yellow-400" />
                        <span>{agent.rating || 'N/A'}</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {agent.skills?.slice(0, 3).map((skill, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {agent.skills?.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{agent.skills.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Conversation Templates</h2>
              <p className="text-muted-foreground">Manage quick response templates</p>
            </div>
            <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Template
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Template</DialogTitle>
                  <DialogDescription>
                    Create a new conversation template for quick responses
                  </DialogDescription>
                </DialogHeader>
                <TemplateForm onSave={handleSaveTemplate} />
              </DialogContent>
            </Dialog>
          </div>

          {/* Templates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template) => (
              <Card key={template.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <Badge variant="outline">{template.category}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    {template.content.substring(0, 100)}...
                  </p>
                  <div className="flex items-center justify-between text-sm">
                    <span>Used {template.usage_count} times</span>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Agent Assignment Dialog */}
      <AgentAssignmentDialog
        isOpen={showAgentAssignment}
        onClose={() => {
          setShowAgentAssignment(false);
          setSelectedConversationForAssignment(null);
        }}
        conversationId={selectedConversationForAssignment}
        availableAgents={availableAgents}
        onAssign={handleAssignConversation}
      />

      {/* Bulk Actions Dialog */}
      <BulkActionsDialog
        isOpen={showBulkActions}
        onClose={() => setShowBulkActions(false)}
        selectedCount={selectedConversations.length}
        availableAgents={availableAgents}
        onBulkAction={handleBulkAction}
      />
    </div>
  );
};

// Template Form Component
const TemplateForm = ({ onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    content: '',
    category: 'general_inquiry',
    variables: [],
    tags: [],
    is_favorite: false
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="template-name">Template Name</Label>
        <Input
          id="template-name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Enter template name"
          required
        />
      </div>

      <div>
        <Label htmlFor="template-category">Category</Label>
        <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="greeting">Greeting</SelectItem>
            <SelectItem value="closing">Closing</SelectItem>
            <SelectItem value="escalation">Escalation</SelectItem>
            <SelectItem value="follow_up">Follow Up</SelectItem>
            <SelectItem value="technical_support">Technical Support</SelectItem>
            <SelectItem value="billing">Billing</SelectItem>
            <SelectItem value="general_inquiry">General Inquiry</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="template-content">Content</Label>
        <Textarea
          id="template-content"
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          placeholder="Enter template content..."
          rows={4}
          required
        />
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="is-favorite"
          checked={formData.is_favorite}
          onCheckedChange={(checked) => setFormData({ ...formData, is_favorite: checked })}
        />
        <Label htmlFor="is-favorite">Mark as favorite</Label>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline">
          Cancel
        </Button>
        <Button type="submit">
          Save Template
        </Button>
      </div>
    </form>
  );
};

export default ModernInboxDashboard;
