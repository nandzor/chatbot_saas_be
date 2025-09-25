/**
 * AI Response Generator Component
 * Enhanced component for generating AI responses with better UX
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
  DialogTitle
} from '@/components/ui';
import {
  Bot,
  Star,
  TrendingUp,
  Activity,
  Clock,
  CheckCircle,
  Eye,
  Play,
  BarChart3,
  Zap,
  MessageSquare,
  Users,
  Globe,
  Brain,
  Target,
  Award,
  RefreshCw,
  Send,
  Copy,
  ThumbsUp,
  ThumbsDown,
  Edit,
  Trash2,
  MoreHorizontal,
  Sparkles,
  Timer,
  Shield,
  Lightbulb
} from 'lucide-react';

const AIResponseGenerator = ({
  sessionId,
  onResponseGenerated,
  selectedPersonality,
  onPersonalityChange,
  className = '',
  showPersonalitySelector = true,
  showContextEditor = true,
  showResponseHistory = false,
  maxHistoryItems = 5
}) => {
  const { announce } = useAnnouncement();
  const { focusRef } = useFocusManagement();
  const { setLoading, getLoadingState } = useLoadingStates();

  // State management
  const [message, setMessage] = useState('');
  const [context, setContext] = useState({});
  const [response, setResponse] = useState(null);
  const [responseHistory, setResponseHistory] = useState([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [personalities, setPersonalities] = useState([]);
  const [showPersonalityDialog, setShowPersonalityDialog] = useState(false);
  const [responseRating, setResponseRating] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Load personalities
  const loadPersonalities = useCallback(async () => {
    try {
      setLoading('personalities', true);
      const result = await inboxService.getAvailableBotPersonalities();

      if (result.success) {
        setPersonalities(result.data);
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      handleError(err, { context: 'Load Personalities' });
    } finally {
      setLoading('personalities', false);
    }
  }, [setLoading]);

  // Generate AI response
  const generateResponse = useCallback(async () => {
    if (!message.trim() || !selectedPersonality) return;

    try {
      setIsGenerating(true);
      setLoading('generate', true);

      const result = await inboxService.generateAiResponse(
        sessionId,
        message,
        selectedPersonality.id,
        context
      );

      if (result.success) {
        const newResponse = {
          id: Date.now().toString(),
          content: result.data.content,
          confidence: result.data.confidence,
          intent: result.data.intent,
          sentiment: result.data.sentiment,
          processingTime: result.data.processing_time_ms,
          personality: selectedPersonality,
          message: message,
          context: context,
          timestamp: new Date(),
          rating: null
        };

        setResponse(newResponse);
        setResponseHistory(prev => [newResponse, ...prev.slice(0, maxHistoryItems - 1)]);
        onResponseGenerated?.(newResponse);
        announce('AI response generated successfully');
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      handleError(err, { context: 'Generate AI Response' });
    } finally {
      setIsGenerating(false);
      setLoading('generate', false);
    }
  }, [message, selectedPersonality, context, sessionId, onResponseGenerated, maxHistoryItems, setLoading, announce]);

  // Handle personality selection
  const handlePersonalitySelect = useCallback((personality) => {
    onPersonalityChange?.(personality);
    setShowPersonalityDialog(false);
    announce(`Selected ${personality.display_name}`);
  }, [onPersonalityChange, announce]);

  // Handle response rating
  const handleResponseRating = useCallback((rating) => {
    setResponseRating(rating);
    if (response) {
      setResponse(prev => ({ ...prev, rating }));
      setResponseHistory(prev =>
        prev.map(item =>
          item.id === response.id ? { ...item, rating } : item
        )
      );
    }
    announce(`Response rated as ${rating === 'positive' ? 'positive' : 'negative'}`);
  }, [response, announce]);

  // Copy response to clipboard
  const copyResponse = useCallback(() => {
    if (response?.content) {
      navigator.clipboard.writeText(response.content);
      announce('Response copied to clipboard');
    }
  }, [response, announce]);

  // Clear form
  const clearForm = useCallback(() => {
    setMessage('');
    setContext({});
    setResponse(null);
    announce('Form cleared');
  }, [announce]);

  // Load personalities on mount
  useEffect(() => {
    loadPersonalities();
  }, [loadPersonalities]);


  // Get confidence badge variant
  const getConfidenceBadge = (confidence) => {
    if (confidence >= 0.8) return 'default';
    if (confidence >= 0.6) return 'secondary';
    return 'destructive';
  };

  return (
    <div className={`space-y-6 ${className}`} ref={focusRef}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            AI Response Generator
          </h3>
          <p className="text-sm text-muted-foreground">
            Generate intelligent responses using bot personalities
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            <Settings className="h-4 w-4 mr-2" />
            {showAdvanced ? 'Simple' : 'Advanced'}
          </Button>
        </div>
      </div>

      {/* Personality Selection */}
      {showPersonalitySelector && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              Bot Personality
            </CardTitle>
            <CardDescription>
              Select a personality to generate responses
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedPersonality ? (
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={selectedPersonality.avatar_url} />
                    <AvatarFallback>
                      <Bot className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-medium">{selectedPersonality.display_name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {selectedPersonality.language} • {selectedPersonality.tone}
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant={getConfidenceBadge(selectedPersonality.performance_score / 100)}>
                        {selectedPersonality.performance_score}% performance
                      </Badge>
                      <Badge variant="outline">
                        {selectedPersonality.total_conversations || 0} conversations
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPersonalityDialog(true)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Change
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Bot className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Personality Selected</h3>
                <p className="text-muted-foreground mb-4">
                  Select a bot personality to start generating responses
                </p>
                <Button onClick={() => setShowPersonalityDialog(true)}>
                  <Bot className="h-4 w-4 mr-2" />
                  Select Personality
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Message Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Message Input
          </CardTitle>
          <CardDescription>
            Enter the message you want to respond to
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="message">Customer Message</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter the customer message to respond to..."
              rows={4}
              className="mt-1"
            />
          </div>

          {showAdvanced && showContextEditor && (
            <div>
              <Label htmlFor="context">Additional Context (JSON)</Label>
              <Textarea
                id="context"
                value={JSON.stringify(context, null, 2)}
                onChange={(e) => {
                  try {
                    const parsed = JSON.parse(e.target.value);
                    setContext(parsed);
                  } catch {
                    // Invalid JSON, ignore
                  }
                }}
                placeholder="Enter additional context as JSON..."
                rows={3}
                className="mt-1 font-mono text-sm"
              />
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button
                onClick={generateResponse}
                disabled={!message.trim() || !selectedPersonality || isGenerating}
                className="flex items-center gap-2"
              >
                {isGenerating ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                {isGenerating ? 'Generating...' : 'Generate Response'}
              </Button>

              <Button
                variant="outline"
                onClick={clearForm}
                disabled={!message && !response}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear
              </Button>
            </div>

            <div className="text-sm text-muted-foreground">
              {message.length}/500 characters
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Generated Response */}
      {response && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Generated Response
            </CardTitle>
            <CardDescription>
              AI-generated response using {selectedPersonality?.display_name}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-start space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-sm whitespace-pre-wrap">{response.content}</p>
                  <div className="flex items-center space-x-4 mt-3 text-xs text-muted-foreground">
                    <span className="flex items-center space-x-1">
                      <Shield className="h-3 w-3" />
                      <span>Confidence: {Math.round(response.confidence * 100)}%</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Timer className="h-3 w-3" />
                      <span>{response.processingTime}ms</span>
                    </span>
                    {response.intent && (
                      <span className="flex items-center space-x-1">
                        <Target className="h-3 w-3" />
                        <span>{response.intent}</span>
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
                  onClick={copyResponse}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>

                <div className="flex items-center space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleResponseRating('positive')}
                    className={responseRating === 'positive' ? 'bg-green-100 text-green-700' : ''}
                  >
                    <ThumbsUp className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleResponseRating('negative')}
                    className={responseRating === 'negative' ? 'bg-red-100 text-red-700' : ''}
                  >
                    <ThumbsDown className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Badge variant={getConfidenceBadge(response.confidence)}>
                  {Math.round(response.confidence * 100)}% confidence
                </Badge>
                <Badge variant="outline">
                  {response.sentiment || 'neutral'} sentiment
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Response History */}
      {showResponseHistory && responseHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Response History
            </CardTitle>
            <CardDescription>
              Recent AI responses generated
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {responseHistory.map((item) => (
                <div key={item.id} className="p-3 border rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm line-clamp-2">{item.content}</p>
                      <div className="flex items-center space-x-2 mt-2 text-xs text-muted-foreground">
                        <span>{item.personality.display_name}</span>
                        <span>•</span>
                        <span>{Math.round(item.confidence * 100)}% confidence</span>
                        <span>•</span>
                        <span>{item.timestamp.toLocaleTimeString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 ml-2">
                      {item.rating === 'positive' && (
                        <ThumbsUp className="h-4 w-4 text-green-500" />
                      )}
                      {item.rating === 'negative' && (
                        <ThumbsDown className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Personality Selection Dialog */}
      <Dialog open={showPersonalityDialog} onOpenChange={setShowPersonalityDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Select Bot Personality</DialogTitle>
            <DialogDescription>
              Choose a personality for generating AI responses
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <LoadingWrapper
              isLoading={getLoadingState('personalities')}
              loadingComponent={<SkeletonCard />}
            >
              <div className="grid gap-3">
                {personalities.map((personality) => (
                  <div
                    key={personality.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                    onClick={() => handlePersonalitySelect(personality)}
                  >
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={personality.avatar_url} />
                        <AvatarFallback>
                          <Bot className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-medium text-sm">{personality.display_name}</h4>
                        <p className="text-xs text-muted-foreground">
                          {personality.language} • {personality.tone}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={getConfidenceBadge(personality.performance_score / 100)}>
                        {personality.performance_score}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </LoadingWrapper>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPersonalityDialog(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const AIResponseGeneratorComponent = withErrorHandling(AIResponseGenerator, {
  context: 'AI Response Generator'
});

export default AIResponseGeneratorComponent;
