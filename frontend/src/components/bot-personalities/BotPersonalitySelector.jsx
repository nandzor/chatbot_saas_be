/**
 * Bot Personality Selector Component
 * Reusable component for selecting bot personalities with enhanced features
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Progress
} from '@/components/ui';
import {
  Bot,
  Star,
  TrendingUp,
  Eye,
  Play,
  BarChart3,
  Zap,
  MessageSquare,
  RefreshCw,
  Brain
} from 'lucide-react';

const BotPersonalitySelector = ({
  onSelect,
  selectedPersonalityId,
  showPreview = true,
  showPerformance = true,
  showStats = false,
  filters = {},
  className = '',
  disabled = false,
  showCreateButton = false,
  onCreateNew = null
}) => {
  const { announce } = useAnnouncement();
  const { focusRef } = useFocusManagement();
  const { setLoading, getLoadingState } = useLoadingStates();

  // State management
  const [personalities, setPersonalities] = useState([]);
  const [selectedPersonality, setSelectedPersonality] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [previewMessage, setPreviewMessage] = useState('');
  const [previewResponse, setPreviewResponse] = useState(null);
  const [performanceData, setPerformanceData] = useState(null);
  const [sortBy, setSortBy] = useState('performance');
  const [sortDirection, setSortDirection] = useState('desc');

  // Load personalities
  const loadPersonalities = useCallback(async () => {
    try {
      setLoading('personalities', true);
      const result = await inboxService.getAvailableBotPersonalities(filters);

      if (result.success) {
        setPersonalities(result.data);
        announce(`Loaded ${result.data.length} bot personalities`);
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      handleError(err, { context: 'Load Personalities' });
    } finally {
      setLoading('personalities', false);
    }
  }, [filters, setLoading, announce]);

  // Load performance data for selected personality
  const loadPerformanceData = useCallback(async (personalityId) => {
    if (!showPerformance || !personalityId) return;

    try {
      setLoading('performance', true);
      const result = await inboxService.getBotPersonalityPerformance(personalityId, 30);

      if (result.success) {
        setPerformanceData(result.data);
      }
    } catch (err) {
      handleError(err, { context: 'Load Performance Data' });
    } finally {
      setLoading('performance', false);
    }
  }, [showPerformance, setLoading]);

  // Generate preview response
  const generatePreview = useCallback(async (personalityId, message) => {
    if (!message.trim()) return;

    try {
      setLoading('preview', true);
      const result = await inboxService.generateAiResponse(
        'preview-session',
        message,
        personalityId,
        { preview: true }
      );

      if (result.success) {
        setPreviewResponse(result.data);
        announce('Preview response generated');
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      handleError(err, { context: 'Generate Preview' });
    } finally {
      setLoading('preview', false);
    }
  }, [setLoading, announce]);

  // Handle personality selection
  const handlePersonalitySelect = useCallback((personalityId) => {
    const personality = personalities.find(p => p.id === personalityId);
    if (personality) {
      setSelectedPersonality(personality);
      onSelect?.(personality);
      announce(`Selected ${personality.display_name}`);

      if (showPerformance) {
        loadPerformanceData(personalityId);
      }
    }
  }, [personalities, onSelect, showPerformance, loadPerformanceData, announce]);

  // Handle preview generation
  const handlePreview = useCallback(() => {
    if (selectedPersonality && previewMessage.trim()) {
      generatePreview(selectedPersonality.id, previewMessage);
    }
  }, [selectedPersonality, previewMessage, generatePreview]);

  // Sort personalities
  const sortedPersonalities = useMemo(() => {
    return [...personalities].sort((a, b) => {
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
  }, [personalities, sortBy, sortDirection]);

  // Load data on mount
  useEffect(() => {
    loadPersonalities();
  }, [loadPersonalities]);

  // Set selected personality when selectedPersonalityId changes
  useEffect(() => {
    if (selectedPersonalityId && personalities.length > 0) {
      const personality = personalities.find(p => p.id === selectedPersonalityId);
      if (personality) {
        setSelectedPersonality(personality);
        if (showPerformance) {
          loadPerformanceData(selectedPersonalityId);
        }
      }
    }
  }, [selectedPersonalityId, personalities, showPerformance, loadPerformanceData]);

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
    <div className={`space-y-4 ${className}`} ref={focusRef}>
      {/* Header with controls */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Bot Personalities</h3>
          <p className="text-sm text-muted-foreground">
            Select a personality for AI-powered conversations
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="w-32 justify-between">
                {sortBy === 'performance' ? 'Performance' :
                 sortBy === 'name' ? 'Name' :
                 sortBy === 'conversations' ? 'Conversations' : 'Satisfaction'}
                <TrendingUp className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Sort by</DropdownMenuLabel>
              <DropdownMenuSeparator />
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

          <Button
            variant="outline"
            size="sm"
            onClick={() => setSortDirection(prev => prev === 'desc' ? 'asc' : 'desc')}
          >
            <TrendingUp className={`h-4 w-4 ${sortDirection === 'desc' ? 'rotate-180' : ''}`} />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={loadPersonalities}
            disabled={getLoadingState('personalities')}
          >
            <RefreshCw className={`h-4 w-4 ${getLoadingState('personalities') ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Personalities Grid */}
      <LoadingWrapper
        isLoading={getLoadingState('personalities')}
        loadingComponent={<SkeletonCard />}
      >
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {sortedPersonalities.map((personality) => (
            <Card
              key={personality.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                selectedPersonality?.id === personality.id
                  ? 'ring-2 ring-primary bg-primary/5'
                  : 'hover:bg-muted/50'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => !disabled && handlePersonalitySelect(personality.id)}
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
                    {personality.status === 'active' && (
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {personality.description}
                </p>

                {showPerformance && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span>Performance</span>
                      <span className={getPerformanceColor(personality.performance_score)}>
                        {personality.performance_score}%
                      </span>
                    </div>
                    <Progress
                      value={personality.performance_score}
                      className="h-2"
                    />

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
                )}

                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center space-x-2">
                    {personality.has_workflow && (
                      <Badge variant="outline" className="text-xs">
                        <Zap className="h-3 w-3 mr-1" />
                        Workflow
                      </Badge>
                    )}
                    {personality.has_waha_session && (
                      <Badge variant="outline" className="text-xs">
                        <MessageSquare className="h-3 w-3 mr-1" />
                        WhatsApp
                      </Badge>
                    )}
                    {personality.has_knowledge_base && (
                      <Badge variant="outline" className="text-xs">
                        <Brain className="h-3 w-3 mr-1" />
                        Knowledge
                      </Badge>
                    )}
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPersonality(personality);
                      setShowDetails(true);
                    }}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </LoadingWrapper>

      {/* Empty State */}
      {personalities.length === 0 && !getLoadingState('personalities') && (
        <Card>
          <CardContent className="text-center py-8">
            <Bot className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Bot Personalities</h3>
            <p className="text-muted-foreground mb-4">
              No bot personalities found matching your criteria.
            </p>
            {showCreateButton && onCreateNew && (
              <Button onClick={onCreateNew}>
                <Bot className="h-4 w-4 mr-2" />
                Create Bot Personality
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Preview Section */}
      {showPreview && selectedPersonality && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="h-5 w-5" />
              Preview Response
            </CardTitle>
            <CardDescription>
              Test how {selectedPersonality.display_name} would respond
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Test Message</label>
              <div className="flex space-x-2 mt-1">
                <input
                  type="text"
                  value={previewMessage}
                  onChange={(e) => setPreviewMessage(e.target.value)}
                  placeholder="Enter a test message..."
                  className="flex-1 px-3 py-2 border rounded-md text-sm"
                />
                <Button
                  onClick={handlePreview}
                  disabled={!previewMessage.trim() || getLoadingState('preview')}
                  size="sm"
                >
                  {getLoadingState('preview') ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {previewResponse && (
              <div className="p-3 bg-muted rounded-lg">
                <div className="flex items-start space-x-2">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback>
                      <Bot className="h-3 w-3" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm">{previewResponse.content}</p>
                    <div className="flex items-center space-x-2 mt-2 text-xs text-muted-foreground">
                      <span>Confidence: {previewResponse.confidence}</span>
                      <span>•</span>
                      <span>{previewResponse.processing_time_ms}ms</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Performance Data */}
      {showStats && performanceData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Performance Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{performanceData.current_metrics?.total_conversations || 0}</div>
                <div className="text-xs text-muted-foreground">Total Conversations</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{performanceData.current_metrics?.avg_satisfaction_score || 0}/5</div>
                <div className="text-xs text-muted-foreground">Avg Satisfaction</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{performanceData.current_metrics?.success_rate || 0}%</div>
                <div className="text-xs text-muted-foreground">Success Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{performanceData.current_metrics?.performance_score || 0}%</div>
                <div className="text-xs text-muted-foreground">Performance</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Personality Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              {selectedPersonality?.display_name}
            </DialogTitle>
            <DialogDescription>
              Detailed information about this bot personality
            </DialogDescription>
          </DialogHeader>

          {selectedPersonality && (
            <div className="space-y-6">
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

              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="text-2xl font-bold">{selectedPersonality.performance_score}%</div>
                  <div className="text-xs text-muted-foreground">Performance</div>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="text-2xl font-bold">{selectedPersonality.total_conversations || 0}</div>
                  <div className="text-xs text-muted-foreground">Conversations</div>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="text-2xl font-bold">{selectedPersonality.avg_satisfaction_score || 0}/5</div>
                  <div className="text-xs text-muted-foreground">Satisfaction</div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetails(false)}>
              Close
            </Button>
            <Button onClick={() => {
              handlePersonalitySelect(selectedPersonality?.id);
              setShowDetails(false);
            }}>
              Select This Personality
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const BotPersonalitySelectorComponent = withErrorHandling(BotPersonalitySelector, {
  context: 'Bot Personality Selector'
});

export default BotPersonalitySelectorComponent;
