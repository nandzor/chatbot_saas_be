/**
 * Personality Training Status Component
 * Shows training progress and learning status for bot personalities
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
  Progress,
  Alert,
  AlertDescription,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui';
import {
  Bot,
  Brain,
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Play,
  Pause,
  Settings,
  BarChart3,
  TrendingUp,
  Activity,
  Target,
  Award,
  BookOpen,
  Zap,
  Lightbulb,
  AlertTriangle,
  Info,
  MoreHorizontal,
  Calendar,
  Timer,
  Star,
  Users,
  MessageSquare
} from 'lucide-react';

const PersonalityTrainingStatus = ({
  personalityId,
  className = '',
  showDetails = true,
  showActions = true,
  autoRefresh = true,
  refreshInterval = 30000
}) => {
  const { announce } = useAnnouncement();
  const { focusRef } = useFocusManagement();
  const { setLoading, getLoadingState } = useLoadingStates();

  // State management
  const [personality, setPersonality] = useState(null);
  const [trainingData, setTrainingData] = useState(null);
  const [learningMetrics, setLearningMetrics] = useState(null);
  const [showTrainingDialog, setShowTrainingDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Load personality data
  const loadPersonality = useCallback(async () => {
    if (!personalityId) return;

    try {
      setLoading('personality', true);
      const result = await inboxService.getBotPersonalityPerformance(personalityId, 30);

      if (result.success) {
        setPersonality(result.data);
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      handleError(err, { context: 'Load Personality' });
    } finally {
      setLoading('personality', false);
    }
  }, [personalityId, setLoading]);

  // Load training data
  const loadTrainingData = useCallback(async () => {
    if (!personalityId) return;

    try {
      setLoading('training', true);
      // Mock training data - in real implementation, this would come from API
      const mockTrainingData = {
        status: 'training',
        progress: 75,
        currentEpoch: 15,
        totalEpochs: 20,
        loss: 0.0234,
        accuracy: 0.8765,
        lastTrained: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        nextTraining: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 hours from now
        trainingHistory: [
          { epoch: 1, loss: 0.1234, accuracy: 0.6543, timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000) },
          { epoch: 5, loss: 0.0876, accuracy: 0.7123, timestamp: new Date(Date.now() - 20 * 60 * 60 * 1000) },
          { epoch: 10, loss: 0.0456, accuracy: 0.8234, timestamp: new Date(Date.now() - 16 * 60 * 60 * 1000) },
          { epoch: 15, loss: 0.0234, accuracy: 0.8765, timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000) }
        ],
        learningRate: 0.001,
        batchSize: 32,
        datasetSize: 10000,
        trainedSamples: 7500
      };

      setTrainingData(mockTrainingData);
    } catch (err) {
      handleError(err, { context: 'Load Training Data' });
    } finally {
      setLoading('training', false);
    }
  }, [personalityId, setLoading]);

  // Load learning metrics
  const loadLearningMetrics = useCallback(async () => {
    if (!personalityId) return;

    try {
      setLoading('metrics', true);
      // Mock learning metrics - in real implementation, this would come from API
      const mockMetrics = {
        totalConversations: 1250,
        learningEnabled: true,
        adaptationRate: 0.85,
        improvementScore: 0.78,
        recentImprovements: [
          { metric: 'Response Accuracy', improvement: 12.5, period: 'Last 7 days' },
          { metric: 'User Satisfaction', improvement: 8.3, period: 'Last 7 days' },
          { metric: 'Response Time', improvement: -15.2, period: 'Last 7 days' },
          { metric: 'Intent Recognition', improvement: 6.7, period: 'Last 7 days' }
        ],
        learningSources: [
          { source: 'User Feedback', weight: 0.4, samples: 500 },
          { source: 'Conversation Patterns', weight: 0.3, samples: 750 },
          { source: 'Performance Metrics', weight: 0.2, samples: 1000 },
          { source: 'External Data', weight: 0.1, samples: 250 }
        ],
        nextRetraining: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        retrainingThreshold: 0.8
      };

      setLearningMetrics(mockMetrics);
    } catch (err) {
      handleError(err, { context: 'Load Learning Metrics' });
    } finally {
      setLoading('metrics', false);
    }
  }, [personalityId, setLoading]);

  // Start training
  const startTraining = useCallback(async () => {
    try {
      setLoading('startTraining', true);
      // Mock start training - in real implementation, this would call API
      await new Promise(resolve => setTimeout(resolve, 1000));
      announce('Training started successfully');
      loadTrainingData();
    } catch (err) {
      handleError(err, { context: 'Start Training' });
    } finally {
      setLoading('startTraining', false);
    }
  }, [setLoading, announce, loadTrainingData]);

  // Pause training
  const pauseTraining = useCallback(async () => {
    try {
      setLoading('pauseTraining', true);
      // Mock pause training - in real implementation, this would call API
      await new Promise(resolve => setTimeout(resolve, 1000));
      announce('Training paused');
      loadTrainingData();
    } catch (err) {
      handleError(err, { context: 'Pause Training' });
    } finally {
      setLoading('pauseTraining', false);
    }
  }, [setLoading, announce, loadTrainingData]);

  // Auto refresh
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        loadPersonality();
        loadTrainingData();
        loadLearningMetrics();
      }, refreshInterval);

      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval, loadPersonality, loadTrainingData, loadLearningMetrics]);

  // Load data on mount
  useEffect(() => {
    loadPersonality();
    loadTrainingData();
    loadLearningMetrics();
  }, [loadPersonality, loadTrainingData, loadLearningMetrics]);

  // Get training status color
  const getTrainingStatusColor = (status) => {
    switch (status) {
      case 'training': return 'text-blue-600';
      case 'completed': return 'text-green-600';
      case 'paused': return 'text-yellow-600';
      case 'failed': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  // Get training status badge variant
  const getTrainingStatusBadge = (status) => {
    switch (status) {
      case 'training': return 'default';
      case 'completed': return 'default';
      case 'paused': return 'secondary';
      case 'failed': return 'destructive';
      default: return 'secondary';
    }
  };

  // Format time ago
  const formatTimeAgo = (date) => {
    const now = new Date();
    const diff = now - date;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) return `${hours}h ${minutes}m ago`;
    return `${minutes}m ago`;
  };

  return (
    <div className={`space-y-6 ${className}`} ref={focusRef}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Training Status
          </h3>
          <p className="text-sm text-muted-foreground">
            Monitor personality learning and training progress
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              loadPersonality();
              loadTrainingData();
              loadLearningMetrics();
            }}
            disabled={getLoadingState('personality') || getLoadingState('training') || getLoadingState('metrics')}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${getLoadingState('personality') || getLoadingState('training') || getLoadingState('metrics') ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          {showActions && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setShowTrainingDialog(true)}>
                  <Settings className="h-4 w-4 mr-2" />
                  Configure Training
                </DropdownMenuItem>
                <DropdownMenuItem onClick={startTraining} disabled={getLoadingState('startTraining')}>
                  <Play className="h-4 w-4 mr-2" />
                  Start Training
                </DropdownMenuItem>
                <DropdownMenuItem onClick={pauseTraining} disabled={getLoadingState('pauseTraining')}>
                  <Pause className="h-4 w-4 mr-2" />
                  Pause Training
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Training Status Overview */}
      {trainingData && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Training Status</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Badge variant={getTrainingStatusBadge(trainingData.status)}>
                  {trainingData.status}
                </Badge>
                <span className={`text-sm ${getTrainingStatusColor(trainingData.status)}`}>
                  {trainingData.progress}% complete
                </span>
              </div>
              <Progress value={trainingData.progress} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Epoch</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {trainingData.currentEpoch}/{trainingData.totalEpochs}
              </div>
              <p className="text-xs text-muted-foreground">
                Epochs completed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Loss</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {trainingData.loss.toFixed(4)}
              </div>
              <p className="text-xs text-muted-foreground">
                Current loss value
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Accuracy</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(trainingData.accuracy * 100).toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">
                Current accuracy
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Detailed Training Information */}
      {showDetails && (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
            <TabsTrigger value="learning">Learning</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Training Schedule
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Last Trained</span>
                    <span className="text-sm text-muted-foreground">
                      {trainingData ? formatTimeAgo(trainingData.lastTrained) : 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Next Training</span>
                    <span className="text-sm text-muted-foreground">
                      {trainingData ? formatTimeAgo(trainingData.nextTraining) : 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Learning Rate</span>
                    <span className="text-sm text-muted-foreground">
                      {trainingData?.learningRate || 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Batch Size</span>
                    <span className="text-sm text-muted-foreground">
                      {trainingData?.batchSize || 'N/A'}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Dataset Info
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Total Samples</span>
                    <span className="text-sm text-muted-foreground">
                      {trainingData?.datasetSize?.toLocaleString() || 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Trained Samples</span>
                    <span className="text-sm text-muted-foreground">
                      {trainingData?.trainedSamples?.toLocaleString() || 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Progress</span>
                    <span className="text-sm text-muted-foreground">
                      {trainingData ? Math.round((trainingData.trainedSamples / trainingData.datasetSize) * 100) : 0}%
                    </span>
                  </div>
                  <Progress
                    value={trainingData ? (trainingData.trainedSamples / trainingData.datasetSize) * 100 : 0}
                    className="mt-2"
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Progress Tab */}
          <TabsContent value="progress" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Training History
                </CardTitle>
                <CardDescription>
                  Loss and accuracy over training epochs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {trainingData?.trainingHistory?.map((entry, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                          {entry.epoch}
                        </div>
                        <div>
                          <div className="font-medium text-sm">Epoch {entry.epoch}</div>
                          <div className="text-xs text-muted-foreground">
                            {formatTimeAgo(entry.timestamp)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="text-sm font-medium">Loss: {entry.loss.toFixed(4)}</div>
                          <div className="text-xs text-muted-foreground">Accuracy: {(entry.accuracy * 100).toFixed(1)}%</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Learning Tab */}
          <TabsContent value="learning" className="space-y-6">
            {learningMetrics && (
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lightbulb className="h-5 w-5" />
                      Learning Metrics
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Adaptation Rate</span>
                      <span className="text-sm text-muted-foreground">
                        {(learningMetrics.adaptationRate * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Improvement Score</span>
                      <span className="text-sm text-muted-foreground">
                        {(learningMetrics.improvementScore * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Total Conversations</span>
                      <span className="text-sm text-muted-foreground">
                        {learningMetrics.totalConversations.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Learning Enabled</span>
                      <Badge variant={learningMetrics.learningEnabled ? 'default' : 'secondary'}>
                        {learningMetrics.learningEnabled ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Recent Improvements
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {learningMetrics.recentImprovements.map((improvement, index) => (
                        <div key={index} className="flex items-center justify-between p-2 border rounded">
                          <div>
                            <div className="font-medium text-sm">{improvement.metric}</div>
                            <div className="text-xs text-muted-foreground">{improvement.period}</div>
                          </div>
                          <div className={`text-sm font-medium ${
                            improvement.improvement > 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {improvement.improvement > 0 ? '+' : ''}{improvement.improvement}%
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {learningMetrics && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Learning Sources
                  </CardTitle>
                  <CardDescription>
                    Data sources used for personality learning
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {learningMetrics.learningSources.map((source, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="font-medium text-sm">{source.source}</div>
                          <div className="text-xs text-muted-foreground">
                            {source.samples.toLocaleString()} samples
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 bg-muted rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full"
                              style={{ width: `${source.weight * 100}%` }}
                            />
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {(source.weight * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      )}

      {/* Training Configuration Dialog */}
      <Dialog open={showTrainingDialog} onOpenChange={setShowTrainingDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Configure Training</DialogTitle>
            <DialogDescription>
              Adjust training parameters for this personality
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Training configuration will be implemented in future updates.
              </AlertDescription>
            </Alert>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTrainingDialog(false)}>
              Close
            </Button>
            <Button onClick={() => setShowTrainingDialog(false)}>
              Save Configuration
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default withErrorHandling(PersonalityTrainingStatus, {
  context: 'Personality Training Status'
});
