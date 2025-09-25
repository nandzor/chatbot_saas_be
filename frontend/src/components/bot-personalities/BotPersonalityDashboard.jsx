/**
 * Bot Personality Dashboard Component
 * Comprehensive dashboard for monitoring and managing bot personalities
 */

import React, { useState, useEffect, useCallback } from 'react';
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
import { inboxService } from '@/services/InboxService';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Avatar,
  AvatarFallback,
  AvatarImage,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Alert,
  AlertDescription,
  Progress,
  Separator,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui';
import {
  Bot,
  Star,
  TrendingUp,
  TrendingDown,
  Activity,
  Clock,
  CheckCircle,
  AlertCircle,
  Eye,
  Play,
  Settings,
  BarChart3,
  Zap,
  MessageSquare,
  Users,
  Globe,
  Brain,
  Target,
  Award,
  RefreshCw,
  Download,
  Filter,
  Search,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Minus
} from 'lucide-react';

const BotPersonalityDashboard = ({
  organizationId,
  className = '',
  showFilters = true,
  showExport = true,
  autoRefresh = true,
  refreshInterval = 30000
}) => {
  const { announce } = useAnnouncement();
  const { focusRef } = useFocusManagement();
  const { setLoading, getLoadingState } = useLoadingStates();

  // State management
  const [personalities, setPersonalities] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [selectedPersonality, setSelectedPersonality] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [filters, setFilters] = useState({
    dateRange: '30d',
    performance: 'all',
    status: 'all',
    language: 'all'
  });
  const [sortBy, setSortBy] = useState('performance');
  const [sortDirection, setSortDirection] = useState('desc');

  // Load personalities
  const loadPersonalities = useCallback(async () => {
    try {
      setLoading('personalities', true);
      const result = await inboxService.getBotPersonalities({
        filters: {
          ...filters,
          organization_id: organizationId
        },
        sort_by: sortBy,
        sort_direction: sortDirection
      });

      if (result.success) {
        setPersonalities(result.data);
        announce(`Loaded ${result.data.length} personalities`);
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      handleError(err, { context: 'Load Personalities' });
    } finally {
      setLoading('personalities', false);
    }
  }, [filters, sortBy, sortDirection, organizationId, setLoading, announce]);

  // Load statistics
  const loadStatistics = useCallback(async () => {
    try {
      setLoading('statistics', true);
      const result = await inboxService.getBotPersonalityStatistics(filters);

      if (result.success) {
        setStatistics(result.data);
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      handleError(err, { context: 'Load Statistics' });
    } finally {
      setLoading('statistics', false);
    }
  }, [filters, setLoading]);

  // Load performance data for selected personality
  const loadPerformanceData = useCallback(async (personalityId) => {
    if (!personalityId) return;

    try {
      setLoading('performance', true);
      const result = await inboxService.getBotPersonalityPerformance(personalityId, 30);

      if (result.success) {
        setSelectedPersonality(prev => ({
          ...prev,
          performanceData: result.data
        }));
      }
    } catch (err) {
      handleError(err, { context: 'Load Performance Data' });
    } finally {
      setLoading('performance', false);
    }
  }, [setLoading]);

  // Handle filter change
  const handleFilterChange = useCallback((key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  // Handle personality selection
  const handlePersonalitySelect = useCallback((personality) => {
    setSelectedPersonality(personality);
    setShowDetails(true);
    loadPerformanceData(personality.id);
  }, [loadPerformanceData]);

  // Export data
  const handleExport = useCallback(async () => {
    try {
      setLoading('export', true);
      // TODO: Implement export functionality
      announce('Export started');
    } catch (err) {
      handleError(err, { context: 'Export Data' });
    } finally {
      setLoading('export', false);
    }
  }, [setLoading, announce]);

  // Auto refresh
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        loadPersonalities();
        loadStatistics();
      }, refreshInterval);

      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval, loadPersonalities, loadStatistics]);

  // Load data on mount
  useEffect(() => {
    loadPersonalities();
    loadStatistics();
  }, [loadPersonalities, loadStatistics]);

  // Get performance trend
  const getPerformanceTrend = (current, previous) => {
    if (!previous) return { trend: 'stable', icon: Minus, color: 'text-gray-500' };

    const change = ((current - previous) / previous) * 100;

    if (change > 5) return { trend: 'up', icon: ArrowUpRight, color: 'text-green-500' };
    if (change < -5) return { trend: 'down', icon: ArrowDownRight, color: 'text-red-500' };
    return { trend: 'stable', icon: Minus, color: 'text-gray-500' };
  };

  // Get performance color
  const getPerformanceColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Get performance badge variant
  const getPerformanceBadge = (score) => {
    if (score >= 80) return 'default';
    if (score >= 60) return 'secondary';
    return 'destructive';
  };

  return (
    <div className={`space-y-6 ${className}`} ref={focusRef}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Bot Personality Dashboard</h2>
          <p className="text-muted-foreground">
            Monitor and manage your AI personalities
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {showExport && (
            <Button
              variant="outline"
              onClick={handleExport}
              disabled={getLoadingState('export')}
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          )}

          <Button
            variant="outline"
            onClick={() => {
              loadPersonalities();
              loadStatistics();
            }}
            disabled={getLoadingState('personalities') || getLoadingState('statistics')}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${getLoadingState('personalities') || getLoadingState('statistics') ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium">Date Range</label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                      {filters.dateRange === '7d' ? 'Last 7 days' :
                       filters.dateRange === '30d' ? 'Last 30 days' :
                       filters.dateRange === '90d' ? 'Last 90 days' : 'Last year'}
                      <TrendingUp className="h-4 w-4 ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuLabel>Date Range</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleFilterChange('dateRange', '7d')}>
                      Last 7 days
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleFilterChange('dateRange', '30d')}>
                      Last 30 days
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleFilterChange('dateRange', '90d')}>
                      Last 90 days
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleFilterChange('dateRange', '1y')}>
                      Last year
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div>
                <label className="text-sm font-medium">Performance</label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                      {filters.performance === 'all' ? 'All' :
                       filters.performance === 'high' ? 'High (80%+)' :
                       filters.performance === 'medium' ? 'Medium (60-80%)' : 'Low (&lt;60%)'}
                      <TrendingUp className="h-4 w-4 ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuLabel>Performance</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleFilterChange('performance', 'all')}>
                      All
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleFilterChange('performance', 'high')}>
                      High (80%+)
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleFilterChange('performance', 'medium')}>
                      Medium (60-80%)
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleFilterChange('performance', 'low')}>
                      Low (&lt;60%)
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div>
                <label className="text-sm font-medium">Status</label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                      {filters.status === 'all' ? 'All' :
                       filters.status === 'active' ? 'Active' :
                       filters.status === 'inactive' ? 'Inactive' : 'Training'}
                      <Activity className="h-4 w-4 ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuLabel>Status</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleFilterChange('status', 'all')}>
                      All
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleFilterChange('status', 'active')}>
                      Active
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleFilterChange('status', 'inactive')}>
                      Inactive
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleFilterChange('status', 'training')}>
                      Training
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div>
                <label className="text-sm font-medium">Language</label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                      {filters.language === 'all' ? 'All' :
                       filters.language === 'en' ? 'English' :
                       filters.language === 'id' ? 'Indonesian' :
                       filters.language === 'jv' ? 'Javanese' : 'Sundanese'}
                      <Globe className="h-4 w-4 ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuLabel>Language</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleFilterChange('language', 'all')}>
                      All
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleFilterChange('language', 'en')}>
                      English
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleFilterChange('language', 'id')}>
                      Indonesian
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleFilterChange('language', 'jv')}>
                      Javanese
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleFilterChange('language', 'su')}>
                      Sundanese
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statistics Overview */}
      {statistics && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Personalities</CardTitle>
              <Bot className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.total_personalities || 0}</div>
              <p className="text-xs text-muted-foreground">
                {statistics.active_personalities || 0} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Performance</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.avg_performance_score || 0}%</div>
              <p className="text-xs text-muted-foreground">
                Overall performance
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Conversations</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.total_conversations || 0}</div>
              <p className="text-xs text-muted-foreground">
                All time conversations
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Learning Enabled</CardTitle>
              <Brain className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.learning_enabled || 0}</div>
              <p className="text-xs text-muted-foreground">
                AI learning enabled
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personalities</CardTitle>
              <CardDescription>
                Manage and monitor your bot personalities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LoadingWrapper
                isLoading={getLoadingState('personalities')}
                loadingComponent={<SkeletonCard />}
              >
                <div className="space-y-4">
                  {personalities.map((personality) => (
                    <div
                      key={personality.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer"
                      onClick={() => handlePersonalitySelect(personality)}
                    >
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={personality.avatar_url} />
                          <AvatarFallback>
                            <Bot className="h-5 w-5" />
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-medium">{personality.display_name}</h3>
                          <p className="text-sm text-muted-foreground">{personality.description}</p>
                          <div className="flex items-center space-x-4 mt-1">
                            <span className="text-xs text-muted-foreground">
                              {personality.language} • {personality.tone}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {personality.total_conversations || 0} conversations
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={getPerformanceBadge(personality.performance_score)}>
                          {personality.performance_score}%
                        </Badge>
                        <Badge variant={personality.status === 'active' ? 'default' : 'secondary'}>
                          {personality.status}
                        </Badge>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </LoadingWrapper>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Top Performers</CardTitle>
                <CardDescription>
                  Best performing personalities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {personalities
                    .sort((a, b) => (b.performance_score || 0) - (a.performance_score || 0))
                    .slice(0, 5)
                    .map((personality, index) => (
                      <div key={personality.id} className="flex items-center space-x-3">
                        <div className="flex items-center justify-center w-6 h-6 bg-primary text-primary-foreground rounded-full text-xs font-bold">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-sm">{personality.display_name}</div>
                          <div className="text-xs text-muted-foreground">
                            {personality.total_conversations || 0} conversations
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`font-bold ${getPerformanceColor(personality.performance_score)}`}>
                            {personality.performance_score}%
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Trends</CardTitle>
                <CardDescription>
                  Recent performance changes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {personalities
                    .filter(p => p.performance_score > 0)
                    .sort((a, b) => (b.performance_score || 0) - (a.performance_score || 0))
                    .slice(0, 5)
                    .map((personality) => {
                      const trend = getPerformanceTrend(personality.performance_score, personality.previous_performance_score);
                      return (
                        <div key={personality.id} className="flex items-center space-x-3">
                          <div className="flex-1">
                            <div className="font-medium text-sm">{personality.display_name}</div>
                            <div className="flex items-center space-x-2">
                              <Progress value={personality.performance_score} className="flex-1 h-2" />
                              <span className="text-xs text-muted-foreground">
                                {personality.performance_score}%
                              </span>
                            </div>
                          </div>
                          <div className={`flex items-center space-x-1 ${trend.color}`}>
                            <trend.icon className="h-4 w-4" />
                            <span className="text-xs">
                              {trend.trend === 'up' ? '+' : trend.trend === 'down' ? '-' : '='}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Conversation Volume</CardTitle>
                <CardDescription>
                  Total conversations by personality
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {personalities
                    .sort((a, b) => (b.total_conversations || 0) - (a.total_conversations || 0))
                    .slice(0, 5)
                    .map((personality) => (
                      <div key={personality.id} className="flex items-center space-x-3">
                        <div className="flex-1">
                          <div className="font-medium text-sm">{personality.display_name}</div>
                          <div className="flex items-center space-x-2">
                            <Progress
                              value={(personality.total_conversations || 0) / Math.max(...personalities.map(p => p.total_conversations || 0)) * 100}
                              className="flex-1 h-2"
                            />
                            <span className="text-xs text-muted-foreground">
                              {personality.total_conversations || 0}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Satisfaction Scores</CardTitle>
                <CardDescription>
                  Average satisfaction by personality
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {personalities
                    .filter(p => p.avg_satisfaction_score > 0)
                    .sort((a, b) => (b.avg_satisfaction_score || 0) - (a.avg_satisfaction_score || 0))
                    .slice(0, 5)
                    .map((personality) => (
                      <div key={personality.id} className="flex items-center space-x-3">
                        <div className="flex-1">
                          <div className="font-medium text-sm">{personality.display_name}</div>
                          <div className="flex items-center space-x-2">
                            <Progress
                              value={(personality.avg_satisfaction_score || 0) / 5 * 100}
                              className="flex-1 h-2"
                            />
                            <span className="text-xs text-muted-foreground">
                              {(personality.avg_satisfaction_score || 0).toFixed(1)}/5
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Personality Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              {selectedPersonality?.display_name}
            </DialogTitle>
            <DialogDescription>
              Detailed information and performance metrics
            </DialogDescription>
          </DialogHeader>

          {selectedPersonality && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold">{selectedPersonality.performance_score}%</div>
                  <div className="text-xs text-muted-foreground">Performance</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold">{selectedPersonality.total_conversations || 0}</div>
                  <div className="text-xs text-muted-foreground">Conversations</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold">{selectedPersonality.avg_satisfaction_score || 0}/5</div>
                  <div className="text-xs text-muted-foreground">Satisfaction</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold">{selectedPersonality.success_rate || 0}%</div>
                  <div className="text-xs text-muted-foreground">Success Rate</div>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Language</label>
                  <p className="text-sm text-muted-foreground">{selectedPersonality.language}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Tone</label>
                  <p className="text-sm text-muted-foreground">{selectedPersonality.tone}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Communication Style</label>
                  <p className="text-sm text-muted-foreground">{selectedPersonality.communication_style}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Formality Level</label>
                  <p className="text-sm text-muted-foreground">{selectedPersonality.formality_level}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Description</label>
                <p className="text-sm text-muted-foreground mt-1">{selectedPersonality.description}</p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetails(false)}>
              Close
            </Button>
            <Button>
              <Settings className="h-4 w-4 mr-2" />
              Configure
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default withErrorHandling(BotPersonalityDashboard, {
  context: 'Bot Personality Dashboard'
});
