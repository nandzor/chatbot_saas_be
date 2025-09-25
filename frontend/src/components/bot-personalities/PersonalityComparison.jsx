/**
 * Personality Comparison and Analytics Dashboard
 * Comprehensive comparison and analytics component for multiple personalities
 */

import { useState, useCallback, useEffect } from 'react';
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
  Input,
  Label,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Progress,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui';
import {
  Bot,
  Star,
  CheckCircle,
  Eye,
  BarChart3,
  MessageSquare,
  Download,
  Filter,
  Search,
  Plus,
  X,
  ChevronDown,
  Grid,
  List,
  Lightbulb
} from 'lucide-react';

const PersonalityComparison = ({
  personalities = [],
  onPersonalitySelect,
  className = '',
  showFilters = true,
  showExport = true,
  showCharts = true,
  maxComparisons = 4,
  autoRefresh = false,
  refreshInterval = 30000
}) => {
  const { announce } = useAnnouncement();
  const { focusRef } = useFocusManagement();
  const { setLoading, getLoadingState } = useLoadingStates();

  // State management
  const [selectedPersonalities, setSelectedPersonalities] = useState([]);
  const [comparisonData, setComparisonData] = useState({});
  const [activeTab, setActiveTab] = useState('overview');
  const [viewMode, setViewMode] = useState('grid'); // grid, list, chart
  const [sortBy, setSortBy] = useState('performance');
  const [sortDirection] = useState('desc');
  const [filters, setFilters] = useState({
    language: 'all',
    performance: 'all',
    status: 'all',
    category: 'all'
  });
  const [showComparisonDialog, setShowComparisonDialog] = useState(false);
  const [showAnalyticsDialog, setShowAnalyticsDialog] = useState(false);
  // const [expandedSections, setExpandedSections] = useState({});
  const [searchQuery, setSearchQuery] = useState('');

  // Load comparison data for selected personalities
  const loadComparisonData = useCallback(async (personalityIds) => {
    if (personalityIds.length === 0) return;

    try {
      setLoading('comparison', true);
      const promises = personalityIds.map(id =>
        inboxService.getBotPersonalityPerformance(id, 30)
      );

      const results = await Promise.all(promises);
      const data = {};

      results.forEach((result, index) => {
        if (result.success) {
          data[personalityIds[index]] = result.data;
        }
      });

      setComparisonData(data);
    } catch (err) {
      handleError(err, { context: 'Load Comparison Data' });
    } finally {
      setLoading('comparison', false);
    }
  }, [setLoading]);

  // Handle personality selection for comparison
  const handlePersonalityToggle = useCallback((personality) => {
    setSelectedPersonalities(prev => {
      const isSelected = prev.some(p => p.id === personality.id);

      if (isSelected) {
        const newSelection = prev.filter(p => p.id !== personality.id);
        setComparisonData(prevData => {
          const newData = { ...prevData };
          delete newData[personality.id];
          return newData;
        });
        return newSelection;
      } else if (prev.length < maxComparisons) {
        const newSelection = [...prev, personality];
        loadComparisonData([...prev.map(p => p.id), personality.id]);
        return newSelection;
      } else {
        announce(`Maximum ${maxComparisons} personalities can be compared`);
        return prev;
      }
    });
  }, [maxComparisons, loadComparisonData, announce]);

  // Clear all selections
  const clearSelections = useCallback(() => {
    setSelectedPersonalities([]);
    setComparisonData({});
    announce('All selections cleared');
  }, [announce]);

  // Filter personalities
  const filteredPersonalities = personalities.filter(personality => {
    const matchesSearch = personality.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         personality.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLanguage = filters.language === 'all' || personality.language === filters.language;
    const matchesPerformance = filters.performance === 'all' ||
      (filters.performance === 'high' && personality.performance_score >= 80) ||
      (filters.performance === 'medium' && personality.performance_score >= 60 && personality.performance_score < 80) ||
      (filters.performance === 'low' && personality.performance_score < 60);
    const matchesStatus = filters.status === 'all' || personality.status === filters.status;

    return matchesSearch && matchesLanguage && matchesPerformance && matchesStatus;
  });

  // Sort personalities
  const sortedPersonalities = filteredPersonalities.sort((a, b) => {
    let aValue, bValue;

    switch (sortBy) {
      case 'performance':
        aValue = a.performance_score || 0;
        bValue = b.performance_score || 0;
        break;
      case 'name':
        aValue = a.display_name || a.name;
        bValue = b.display_name || b.name;
        break;
      case 'conversations':
        aValue = a.total_conversations || 0;
        bValue = b.total_conversations || 0;
        break;
      case 'satisfaction':
        aValue = a.avg_satisfaction_score || 0;
        bValue = b.avg_satisfaction_score || 0;
        break;
      default:
        aValue = a.performance_score || 0;
        bValue = b.performance_score || 0;
    }

    return sortDirection === 'desc' ? bValue - aValue : aValue - bValue;
  });

  // Toggle section expansion
  // const toggleSection = useCallback((section) => {
  //   setExpandedSections(prev => ({
  //     ...prev,
  //     [section]: !prev[section]
  //   }));
  // }, []);

  // Export comparison data
  const exportComparisonData = useCallback(async () => {
    try {
      setLoading('export', true);

      const exportData = {
        personalities: selectedPersonalities,
        comparisonData: comparisonData,
        filters: filters,
        exportedAt: new Date().toISOString()
      };

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `personality-comparison-${Date.now()}.json`;
      link.click();

      URL.revokeObjectURL(url);
      announce('Comparison data exported successfully');
    } catch (err) {
      handleError(err, { context: 'Export Comparison Data' });
    } finally {
      setLoading('export', false);
    }
  }, [selectedPersonalities, comparisonData, filters, setLoading, announce]);

  // Auto refresh
  useEffect(() => {
    if (autoRefresh && selectedPersonalities.length > 0) {
      const interval = setInterval(() => {
        loadComparisonData(selectedPersonalities.map(p => p.id));
      }, refreshInterval);

      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval, selectedPersonalities, loadComparisonData]);

  // Get performance trend
  // const getPerformanceTrend = (current, previous) => {
  //   if (!previous) return { trend: 'stable', icon: Minus, color: 'text-gray-500' };
  //
  //   const change = ((current - previous) / previous) * 100;
  //
  //   if (change > 5) return { trend: 'up', icon: ArrowUpRight, color: 'text-green-500' };
  //   if (change < -5) return { trend: 'down', icon: ArrowDownRight, color: 'text-red-500' };
  //   return { trend: 'stable', icon: Minus, color: 'text-gray-500' };
  // };

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
          <h2 className="text-2xl font-bold">Personality Comparison</h2>
          <p className="text-muted-foreground">
            Compare and analyze bot personalities
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAnalyticsDialog(true)}
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </Button>

          {showExport && (
            <Button
              variant="outline"
              size="sm"
              onClick={exportComparisonData}
              disabled={selectedPersonalities.length === 0 || getLoadingState('export')}
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowComparisonDialog(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add to Comparison
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters & Search
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              <div>
                <Label className="text-sm font-medium">Search</Label>
                <div className="relative mt-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search personalities..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Language</Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-between mt-1">
                      {filters.language === 'all' ? 'All Languages' :
                       filters.language === 'en' ? 'English' :
                       filters.language === 'id' ? 'Indonesian' :
                       filters.language === 'jv' ? 'Javanese' : 'Sundanese'}
                      <ChevronDown className="h-4 w-4 ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setFilters(prev => ({ ...prev, language: 'all' }))}>
                      All Languages
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilters(prev => ({ ...prev, language: 'en' }))}>
                      English
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilters(prev => ({ ...prev, language: 'id' }))}>
                      Indonesian
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilters(prev => ({ ...prev, language: 'jv' }))}>
                      Javanese
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilters(prev => ({ ...prev, language: 'su' }))}>
                      Sundanese
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div>
                <Label className="text-sm font-medium">Performance</Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-between mt-1">
                      {filters.performance === 'all' ? 'All Performance' :
                       filters.performance === 'high' ? 'High (80%+)' :
                       filters.performance === 'medium' ? 'Medium (60-80%)' : 'Low (&lt;60%)'}
                      <ChevronDown className="h-4 w-4 ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setFilters(prev => ({ ...prev, performance: 'all' }))}>
                      All Performance
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilters(prev => ({ ...prev, performance: 'high' }))}>
                      High (80%+)
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilters(prev => ({ ...prev, performance: 'medium' }))}>
                      Medium (60-80%)
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilters(prev => ({ ...prev, performance: 'low' }))}>
                      Low (&lt;60%)
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div>
                <Label className="text-sm font-medium">Status</Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-between mt-1">
                      {filters.status === 'all' ? 'All Status' :
                       filters.status === 'active' ? 'Active' :
                       filters.status === 'inactive' ? 'Inactive' : 'Training'}
                      <ChevronDown className="h-4 w-4 ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setFilters(prev => ({ ...prev, status: 'all' }))}>
                      All Status
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilters(prev => ({ ...prev, status: 'active' }))}>
                      Active
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilters(prev => ({ ...prev, status: 'inactive' }))}>
                      Inactive
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilters(prev => ({ ...prev, status: 'training' }))}>
                      Training
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div>
                <Label className="text-sm font-medium">Sort By</Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-between mt-1">
                      {sortBy === 'performance' ? 'Performance' :
                       sortBy === 'name' ? 'Name' :
                       sortBy === 'conversations' ? 'Conversations' : 'Satisfaction'}
                      <ChevronDown className="h-4 w-4 ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setSortBy('performance')}>
                      Performance
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortBy('name')}>
                      Name
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortBy('conversations')}>
                      Conversations
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortBy('satisfaction')}>
                      Satisfaction
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Selected Personalities */}
      {selectedPersonalities.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Selected for Comparison ({selectedPersonalities.length}/{maxComparisons})</span>
              <Button
                variant="outline"
                size="sm"
                onClick={clearSelections}
              >
                <X className="h-4 w-4 mr-2" />
                Clear All
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {selectedPersonalities.map((personality) => (
                <div
                  key={personality.id}
                  className="flex items-center space-x-2 p-2 border rounded-lg bg-muted/50"
                >
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={personality.avatar_url} />
                    <AvatarFallback>
                      <Bot className="h-3 w-3" />
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">{personality.display_name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handlePersonalityToggle(personality)}
                    className="h-6 w-6 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="comparison">Comparison</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'chart' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('chart')}
              >
                <BarChart3 className="h-4 w-4" />
              </Button>
            </div>

            <div className="text-sm text-muted-foreground">
              {sortedPersonalities.length} personalities found
            </div>
          </div>

          {viewMode === 'grid' && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {sortedPersonalities.map((personality) => (
                <Card
                  key={personality.id}
                  className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                    selectedPersonalities.some(p => p.id === personality.id)
                      ? 'ring-2 ring-primary bg-primary/5'
                      : 'hover:bg-muted/50'
                  }`}
                  onClick={() => handlePersonalityToggle(personality)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={personality.avatar_url} />
                          <AvatarFallback>
                            <Bot className="h-5 w-5" />
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-base">{personality.display_name}</CardTitle>
                          <CardDescription className="text-xs">
                            {personality.language} • {personality.tone}
                          </CardDescription>
                        </div>
                      </div>

                      <div className="flex items-center space-x-1">
                        <Badge variant={getPerformanceBadge(personality.performance_score)}>
                          {personality.performance_score}%
                        </Badge>
                        {selectedPersonalities.some(p => p.id === personality.id) && (
                          <CheckCircle className="h-4 w-4 text-primary" />
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {personality.description}
                    </p>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span>Performance</span>
                        <span className={getPerformanceColor(personality.performance_score)}>
                          {personality.performance_score}%
                        </span>
                      </div>
                      <Progress value={personality.performance_score} className="h-2" />

                      <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <MessageSquare className="h-3 w-3" />
                          <span>{personality.total_conversations || 0}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Star className="h-3 w-3" />
                          <span>{personality.avg_satisfaction_score || 0}/5</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {viewMode === 'list' && (
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Personality</TableHead>
                    <TableHead>Language</TableHead>
                    <TableHead>Performance</TableHead>
                    <TableHead>Conversations</TableHead>
                    <TableHead>Satisfaction</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedPersonalities.map((personality) => (
                    <TableRow key={personality.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={personality.avatar_url} />
                            <AvatarFallback>
                              <Bot className="h-4 w-4" />
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{personality.display_name}</div>
                            <div className="text-sm text-muted-foreground">{personality.description}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{personality.language}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <span className={getPerformanceColor(personality.performance_score)}>
                            {personality.performance_score}%
                          </span>
                          <Progress value={personality.performance_score} className="w-16 h-2" />
                        </div>
                      </TableCell>
                      <TableCell>{personality.total_conversations || 0}</TableCell>
                      <TableCell>{personality.avg_satisfaction_score || 0}/5</TableCell>
                      <TableCell>
                        <Badge variant={personality.status === 'active' ? 'default' : 'secondary'}>
                          {personality.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handlePersonalityToggle(personality)}
                          >
                            {selectedPersonalities.some(p => p.id === personality.id) ? (
                              <X className="h-4 w-4" />
                            ) : (
                              <Plus className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onPersonalitySelect?.(personality)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}

          {viewMode === 'chart' && showCharts && (
            <Card>
              <CardHeader>
                <CardTitle>Performance Overview</CardTitle>
                <CardDescription>
                  Performance metrics across all personalities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 mx-auto mb-4" />
                    <p>Chart visualization will be implemented here</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Comparison Tab */}
        <TabsContent value="comparison" className="space-y-6">
          {selectedPersonalities.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Bot className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Personalities Selected</h3>
                <p className="text-muted-foreground mb-4">
                  Select personalities to compare their performance and metrics
                </p>
                <Button onClick={() => setShowComparisonDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Personalities
                </Button>
              </CardContent>
            </Card>
          ) : (
            <LoadingWrapper
              isLoading={getLoadingState('comparison')}
              loadingComponent={<SkeletonCard />}
            >
              <div className="space-y-6">
                {/* Comparison Table */}
                <Card>
                  <CardHeader>
                    <CardTitle>Performance Comparison</CardTitle>
                    <CardDescription>
                      Side-by-side comparison of selected personalities
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Metric</TableHead>
                            {selectedPersonalities.map((personality) => (
                              <TableHead key={personality.id} className="text-center">
                                <div className="flex items-center justify-center space-x-2">
                                  <Avatar className="h-6 w-6">
                                    <AvatarImage src={personality.avatar_url} />
                                    <AvatarFallback>
                                      <Bot className="h-3 w-3" />
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="text-sm font-medium">{personality.display_name}</span>
                                </div>
                              </TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow>
                            <TableCell className="font-medium">Performance Score</TableCell>
                            {selectedPersonalities.map((personality) => (
                              <TableCell key={personality.id} className="text-center">
                                <div className="flex items-center justify-center space-x-2">
                                  <span className={getPerformanceColor(personality.performance_score)}>
                                    {personality.performance_score}%
                                  </span>
                                  <Progress value={personality.performance_score} className="w-16 h-2" />
                                </div>
                              </TableCell>
                            ))}
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">Total Conversations</TableCell>
                            {selectedPersonalities.map((personality) => (
                              <TableCell key={personality.id} className="text-center">
                                {personality.total_conversations || 0}
                              </TableCell>
                            ))}
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">Avg Satisfaction</TableCell>
                            {selectedPersonalities.map((personality) => (
                              <TableCell key={personality.id} className="text-center">
                                {personality.avg_satisfaction_score || 0}/5
                              </TableCell>
                            ))}
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">Language</TableCell>
                            {selectedPersonalities.map((personality) => (
                              <TableCell key={personality.id} className="text-center">
                                <Badge variant="outline">{personality.language}</Badge>
                              </TableCell>
                            ))}
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">Tone</TableCell>
                            {selectedPersonalities.map((personality) => (
                              <TableCell key={personality.id} className="text-center">
                                {personality.tone}
                              </TableCell>
                            ))}
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>

                {/* Detailed Metrics Comparison */}
                {Object.keys(comparisonData).length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Detailed Metrics</CardTitle>
                      <CardDescription>
                        Advanced metrics comparison
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {selectedPersonalities.map((personality) => {
                          const metrics = comparisonData[personality.id];
                          return (
                            <div key={personality.id} className="p-4 border rounded-lg">
                              <div className="flex items-center space-x-2 mb-4">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={personality.avatar_url} />
                                  <AvatarFallback>
                                    <Bot className="h-4 w-4" />
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <h4 className="font-medium">{personality.display_name}</h4>
                                  <p className="text-sm text-muted-foreground">{personality.language}</p>
                                </div>
                              </div>

                              {metrics ? (
                                <div className="space-y-3">
                                  <div className="flex items-center justify-between text-sm">
                                    <span>Success Rate</span>
                                    <span>{metrics.current_metrics?.success_rate || 0}%</span>
                                  </div>
                                  <div className="flex items-center justify-between text-sm">
                                    <span>Response Time</span>
                                    <span>{metrics.current_metrics?.avg_response_time || 0}ms</span>
                                  </div>
                                  <div className="flex items-center justify-between text-sm">
                                    <span>Error Rate</span>
                                    <span>{metrics.current_metrics?.error_rate || 0}%</span>
                                  </div>
                                </div>
                              ) : (
                                <div className="text-sm text-muted-foreground">
                                  No detailed metrics available
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </LoadingWrapper>
          )}
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Analytics Dashboard</CardTitle>
              <CardDescription>
                Comprehensive analytics and insights
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4" />
                  <p>Advanced analytics dashboard will be implemented here</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>AI Insights</CardTitle>
              <CardDescription>
                AI-powered insights and recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <Lightbulb className="h-12 w-12 mx-auto mb-4" />
                  <p>AI insights and recommendations will be implemented here</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Comparison Dialog */}
      <Dialog open={showComparisonDialog} onOpenChange={setShowComparisonDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Add Personalities to Comparison</DialogTitle>
            <DialogDescription>
              Select personalities to compare (max {maxComparisons})
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="max-h-96 overflow-y-auto">
              <div className="grid gap-2">
                {sortedPersonalities.map((personality) => (
                  <div
                    key={personality.id}
                    className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedPersonalities.some(p => p.id === personality.id)
                        ? 'bg-primary/5 border-primary'
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => handlePersonalityToggle(personality)}
                  >
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={personality.avatar_url} />
                        <AvatarFallback>
                          <Bot className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-medium">{personality.display_name}</h4>
                        <p className="text-sm text-muted-foreground">{personality.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={getPerformanceBadge(personality.performance_score)}>
                        {personality.performance_score}%
                      </Badge>
                      {selectedPersonalities.some(p => p.id === personality.id) && (
                        <CheckCircle className="h-4 w-4 text-primary" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowComparisonDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowComparisonDialog(false)}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Analytics Dialog */}
      <Dialog open={showAnalyticsDialog} onOpenChange={setShowAnalyticsDialog}>
        <DialogContent className="max-w-6xl">
          <DialogHeader>
            <DialogTitle>Advanced Analytics</DialogTitle>
            <DialogDescription>
              Comprehensive analytics and data visualization
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div className="h-96 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 mx-auto mb-4" />
                <p>Advanced analytics dashboard will be implemented here</p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAnalyticsDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const PersonalityComparisonComponent = withErrorHandling(PersonalityComparison, {
  context: 'Personality Comparison'
});

export default PersonalityComparisonComponent;
