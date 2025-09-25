/**
 * Personality Preview and Testing Interface
 * Comprehensive preview and testing component for bot personalities
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
  Label,
  Textarea,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Alert,
  AlertDescription,
  Progress,
  Separator,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  ScrollArea
} from '@/components/ui';
import {
  Bot,
  Activity,
  Clock,
  CheckCircle,
  Eye,
  Play,
  Settings,
  BarChart3,
  Target,
  RefreshCw,
  Send,
  Copy,
  Trash2,
  Shield,
  Timer,
  Download
} from 'lucide-react';

const PersonalityPreview = ({
  personality,
  className = '',
  showExport = true,
  autoRefresh = false,
  refreshInterval = 30000
}) => {
  const { announce } = useAnnouncement();
  const { focusRef } = useFocusManagement();
  const { setLoading, getLoadingState } = useLoadingStates();

  // State management
  const [activeTab, setActiveTab] = useState('preview');
  const [testMessage, setTestMessage] = useState('');
  const [testContext, setTestContext] = useState({});
  const [testResponse, setTestResponse] = useState(null);
  const [testHistory, setTestHistory] = useState([]);
  const [showTestDialog, setShowTestDialog] = useState(false);
  const [showMetricsDialog, setShowMetricsDialog] = useState(false);
  const [personalityMetrics, setPersonalityMetrics] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Load personality metrics
  const loadPersonalityMetrics = useCallback(async () => {
    if (!personality?.id) return;

    try {
      setLoading('metrics', true);
      const result = await inboxService.getBotPersonalityPerformance(personality.id, 30);

      if (result.success) {
        setPersonalityMetrics(result.data);
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      handleError(err, { context: 'Load Personality Metrics' });
    } finally {
      setLoading('metrics', false);
    }
  }, [personality?.id, setLoading]);

  // Generate test response
  const generateTestResponse = useCallback(async () => {
    if (!testMessage.trim() || !personality?.id) return;

    try {
      setIsGenerating(true);
      setLoading('test', true);

      const result = await inboxService.generateAiResponse(
        'test-session',
        testMessage,
        personality.id,
        testContext
      );

      if (result.success) {
        const newResponse = {
          id: Date.now().toString(),
          message: testMessage,
          response: result.data.content,
          confidence: result.data.confidence,
          intent: result.data.intent,
          sentiment: result.data.sentiment,
          processingTime: result.data.processing_time_ms,
          timestamp: new Date(),
          context: testContext
        };

        setTestResponse(newResponse);
        setTestHistory(prev => [newResponse, ...prev.slice(0, 9)]);
        announce('Test response generated successfully');
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      handleError(err, { context: 'Generate Test Response' });
    } finally {
      setIsGenerating(false);
      setLoading('test', false);
    }
  }, [testMessage, personality?.id, testContext, setLoading, announce]);

  // Clear test data
  const clearTestData = useCallback(() => {
    setTestMessage('');
    setTestContext({});
    setTestResponse(null);
    announce('Test data cleared');
  }, [announce]);

  // Export personality data
  const exportPersonalityData = useCallback(async () => {
    try {
      setLoading('export', true);

      const exportData = {
        personality: personality,
        metrics: personalityMetrics,
        testHistory: testHistory,
        exportedAt: new Date().toISOString()
      };

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `personality-${personality?.name || 'preview'}-${Date.now()}.json`;
      link.click();

      URL.revokeObjectURL(url);
      announce('Personality data exported successfully');
    } catch (err) {
      handleError(err, { context: 'Export Personality Data' });
    } finally {
      setLoading('export', false);
    }
  }, [personality, personalityMetrics, testHistory, setLoading, announce]);

  // Load data on mount
  useEffect(() => {
    if (personality?.id) {
      loadPersonalityMetrics();
    }
  }, [personality?.id, loadPersonalityMetrics]);

  // Auto refresh
  useEffect(() => {
    if (autoRefresh && personality?.id) {
      const interval = setInterval(() => {
        loadPersonalityMetrics();
      }, refreshInterval);

      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval, personality?.id, loadPersonalityMetrics]);


  // Get confidence badge variant
  const getConfidenceBadge = (confidence) => {
    if (confidence >= 0.8) return 'default';
    if (confidence >= 0.6) return 'secondary';
    return 'destructive';
  };

  if (!personality) {
    return (
      <Card className={className}>
        <CardContent className="text-center py-8">
          <Bot className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No Personality Selected</h3>
          <p className="text-muted-foreground">
            Select a personality to preview and test
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`} ref={focusRef}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={personality.avatar_url} />
            <AvatarFallback>
              <Bot className="h-6 w-6" />
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-xl font-semibold">{personality.display_name}</h2>
            <p className="text-sm text-muted-foreground">{personality.description}</p>
            <div className="flex items-center space-x-2 mt-1">
              <Badge variant="outline">{personality.language}</Badge>
              <Badge variant="outline">{personality.tone}</Badge>
              <Badge variant={getConfidenceBadge(personality.performance_score / 100)}>
                {personality.performance_score}% performance
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowMetricsDialog(true)}
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Metrics
          </Button>

          {showExport && (
            <Button
              variant="outline"
              size="sm"
              onClick={exportPersonalityData}
              disabled={getLoadingState('export')}
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowTestDialog(true)}
          >
            <Play className="h-4 w-4 mr-2" />
            Test
          </Button>
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="testing">Testing</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Preview Tab */}
        <TabsContent value="preview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Personality Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Language</Label>
                    <p className="text-sm text-muted-foreground">{personality.language}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Tone</Label>
                    <p className="text-sm text-muted-foreground">{personality.tone}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Communication Style</Label>
                    <p className="text-sm text-muted-foreground">{personality.communication_style}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Formality Level</Label>
                    <p className="text-sm text-muted-foreground">{personality.formality_level}</p>
                  </div>
                </div>

                <Separator />

                <div>
                  <Label className="text-sm font-medium">Personality Traits</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {personality.personality_traits?.map((trait, index) => (
                      <Badge key={index} variant="secondary">
                        {trait}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <LoadingWrapper
                  isLoading={getLoadingState('metrics')}
                  loadingComponent={<SkeletonCard />}
                >
                  {personalityMetrics ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-3 bg-muted rounded-lg">
                          <div className="text-2xl font-bold">{personalityMetrics.current_metrics?.total_conversations || 0}</div>
                          <div className="text-xs text-muted-foreground">Total Conversations</div>
                        </div>
                        <div className="text-center p-3 bg-muted rounded-lg">
                          <div className="text-2xl font-bold">{personalityMetrics.current_metrics?.avg_satisfaction_score || 0}/5</div>
                          <div className="text-xs text-muted-foreground">Avg Satisfaction</div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Success Rate</span>
                          <span>{personalityMetrics.current_metrics?.success_rate || 0}%</span>
                        </div>
                        <Progress value={personalityMetrics.current_metrics?.success_rate || 0} className="h-2" />
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-sm text-muted-foreground">No metrics available</p>
                    </div>
                  )}
                </LoadingWrapper>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Testing Tab */}
        <TabsContent value="testing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="h-5 w-5" />
                Interactive Testing
              </CardTitle>
              <CardDescription>
                Test the personality with different messages and contexts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="test-message">Test Message</Label>
                  <Textarea
                    id="test-message"
                    value={testMessage}
                    onChange={(e) => setTestMessage(e.target.value)}
                    placeholder="Enter a test message..."
                    rows={4}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="test-context">Context (JSON)</Label>
                  <Textarea
                    id="test-context"
                    value={JSON.stringify(testContext, null, 2)}
                    onChange={(e) => {
                      try {
                        const parsed = JSON.parse(e.target.value);
                        setTestContext(parsed);
                      } catch {
                        // Invalid JSON, ignore
                      }
                    }}
                    placeholder="Enter context as JSON..."
                    rows={4}
                    className="mt-1 font-mono text-sm"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Button
                    onClick={generateTestResponse}
                    disabled={!testMessage.trim() || isGenerating}
                  >
                    {isGenerating ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4 mr-2" />
                    )}
                    {isGenerating ? 'Generating...' : 'Generate Response'}
                  </Button>

                  <Button
                    variant="outline"
                    onClick={clearTestData}
                    disabled={!testMessage && !testResponse}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear
                  </Button>
                </div>

                <div className="text-sm text-muted-foreground">
                  {testMessage.length}/500 characters
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Test Response */}
          {testResponse && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Generated Response
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="flex items-start space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          <Bot className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm whitespace-pre-wrap">{testResponse.response}</p>
                        <div className="flex items-center space-x-4 mt-3 text-xs text-muted-foreground">
                          <span className="flex items-center space-x-1">
                            <Shield className="h-3 w-3" />
                            <span>Confidence: {Math.round(testResponse.confidence * 100)}%</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Timer className="h-3 w-3" />
                            <span>{testResponse.processingTime}ms</span>
                          </span>
                          {testResponse.intent && (
                            <span className="flex items-center space-x-1">
                              <Target className="h-3 w-3" />
                              <span>{testResponse.intent}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(testResponse.response);
                          announce('Response copied to clipboard');
                        }}
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </Button>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Badge variant={getConfidenceBadge(testResponse.confidence)}>
                        {Math.round(testResponse.confidence * 100)}% confidence
                      </Badge>
                      <Badge variant="outline">
                        {testResponse.sentiment || 'neutral'} sentiment
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Test History */}
          {testHistory.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Test History
                </CardTitle>
                <CardDescription>
                  Recent test responses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  <div className="space-y-3">
                    {testHistory.map((item) => (
                      <div key={item.id} className="p-3 border rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-sm font-medium mb-1">{item.message}</p>
                            <p className="text-sm text-muted-foreground line-clamp-2">{item.response}</p>
                            <div className="flex items-center space-x-2 mt-2 text-xs text-muted-foreground">
                              <span>{Math.round(item.confidence * 100)}% confidence</span>
                              <span>•</span>
                              <span>{item.timestamp.toLocaleTimeString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <LoadingWrapper
            isLoading={getLoadingState('metrics')}
            loadingComponent={<SkeletonCard />}
          >
            {personalityMetrics ? (
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Performance Trends</CardTitle>
                    <CardDescription>
                      Performance metrics over time
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Current Performance</span>
                        <span className="text-2xl font-bold">{personalityMetrics.current_metrics?.performance_score || 0}%</span>
                      </div>
                      <Progress value={personalityMetrics.current_metrics?.performance_score || 0} className="h-2" />

                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div className="p-3 bg-muted rounded-lg">
                          <div className="text-lg font-bold">{personalityMetrics.current_metrics?.total_conversations || 0}</div>
                          <div className="text-xs text-muted-foreground">Conversations</div>
                        </div>
                        <div className="p-3 bg-muted rounded-lg">
                          <div className="text-lg font-bold">{personalityMetrics.current_metrics?.avg_satisfaction_score || 0}/5</div>
                          <div className="text-xs text-muted-foreground">Satisfaction</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Response Quality</CardTitle>
                    <CardDescription>
                      Quality metrics and analysis
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Success Rate</span>
                        <span className="text-lg font-bold">{personalityMetrics.current_metrics?.success_rate || 0}%</span>
                      </div>
                      <Progress value={personalityMetrics.current_metrics?.success_rate || 0} className="h-2" />

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Response Time</span>
                          <span>{personalityMetrics.current_metrics?.avg_response_time || 0}ms</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span>Error Rate</span>
                          <span>{personalityMetrics.current_metrics?.error_rate || 0}%</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Analytics Data</h3>
                  <p className="text-muted-foreground">
                    Analytics data will appear here once the personality is used
                  </p>
                </CardContent>
              </Card>
            )}
          </LoadingWrapper>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personality Settings</CardTitle>
              <CardDescription>
                Configure personality behavior and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Settings className="h-4 w-4" />
                <AlertDescription>
                  Personality settings configuration will be implemented in future updates.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Test Dialog */}
      <Dialog open={showTestDialog} onOpenChange={setShowTestDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Quick Test</DialogTitle>
            <DialogDescription>
              Test the personality with a quick message
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="quick-test-message">Test Message</Label>
              <Textarea
                id="quick-test-message"
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                placeholder="Enter a test message..."
                rows={3}
                className="mt-1"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTestDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                generateTestResponse();
                setShowTestDialog(false);
              }}
              disabled={!testMessage.trim() || isGenerating}
            >
              {isGenerating ? 'Generating...' : 'Test Response'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Metrics Dialog */}
      <Dialog open={showMetricsDialog} onOpenChange={setShowMetricsDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Detailed Metrics</DialogTitle>
            <DialogDescription>
              Comprehensive performance metrics for {personality.display_name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {personalityMetrics ? (
              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-3xl font-bold">{personalityMetrics.current_metrics?.total_conversations || 0}</div>
                  <div className="text-sm text-muted-foreground">Total Conversations</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-3xl font-bold">{personalityMetrics.current_metrics?.avg_satisfaction_score || 0}/5</div>
                  <div className="text-sm text-muted-foreground">Avg Satisfaction</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-3xl font-bold">{personalityMetrics.current_metrics?.success_rate || 0}%</div>
                  <div className="text-sm text-muted-foreground">Success Rate</div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No metrics data available</p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMetricsDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const PersonalityPreviewComponent = withErrorHandling(PersonalityPreview, {
  context: 'Personality Preview'
});

export default PersonalityPreviewComponent;
