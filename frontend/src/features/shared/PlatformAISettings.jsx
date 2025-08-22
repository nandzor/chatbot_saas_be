import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  Button,
  Input,
  Textarea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
  Label,
  Badge,
  Alert,
  AlertDescription,
  Separator,
  Slider,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui';
import { 
  ArrowLeft,
  Bot,
  Brain,
  MessageSquare,
  Zap,
  Target,
  Languages,
  TrendingUp,
  Shield,
  Settings,
  Save,
  AlertTriangle,
  CheckCircle,
  Lightbulb,
  Activity,
  BarChart3,
  Sparkles
} from 'lucide-react';

const PlatformAISettings = ({ platformId, onBack, onSave }) => {
  const [settings, setSettings] = useState({
    aiAssistant: {
      enabled: true,
      model: 'gpt-4',
      temperature: 0.7,
      maxTokens: 150,
      systemPrompt: 'You are a helpful customer service assistant. Be polite, professional, and concise in your responses.'
    },
    autoSuggestions: {
      enabled: true,
      suggestionCount: 3,
      confidence: 0.8,
      showConfidence: true,
      categories: ['greeting', 'product_info', 'support', 'closing']
    },
    sentimentAnalysis: {
      enabled: true,
      realTimeAnalysis: true,
      alertThreshold: 0.3,
      escalationEnabled: true,
      sentimentHistory: true
    },
    languageDetection: {
      enabled: true,
      autoTranslate: false,
      supportedLanguages: ['id', 'en', 'ms'],
      confidenceThreshold: 0.9
    },
    smartRouting: {
      enabled: false,
      routingCriteria: ['sentiment', 'language', 'complexity', 'agent_expertise'],
      fallbackAgent: 'any_available',
      maxWaitTime: 300
    },
    chatSummary: {
      enabled: true,
      autoGenerate: true,
      includeKeyPoints: true,
      includeSentiment: true,
      includeResolution: true
    },
    knowledgeBase: {
      enabled: true,
      autoSearch: true,
      suggestionMode: 'contextual',
      confidenceThreshold: 0.7
    },
    analytics: {
      enabled: true,
      trackPerformance: true,
      generateInsights: true,
      weeklyReports: true
    }
  });

  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const handleSettingChange = (section, field, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (onSave) {
        onSave(settings);
      }
      
      setHasChanges(false);
    } catch (error) {
      console.error('Failed to save AI settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const getFeatureStatus = (enabled) => (
    <Badge variant={enabled ? 'green' : 'default'} className="ml-2">
      {enabled ? 'Enabled' : 'Disabled'}
    </Badge>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Bot className="w-7 h-7 text-blue-600" />
              AI Settings
            </h1>
            <p className="text-muted-foreground">Configure AI-powered features for this platform</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {hasChanges && (
            <span className="text-sm text-orange-600 flex items-center gap-1">
              <AlertTriangle className="w-4 h-4" />
              Unsaved changes
            </span>
          )}
          <Button onClick={handleSave} disabled={!hasChanges || isSaving}>
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </div>

      {/* AI Features Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Assistant</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {settings.aiAssistant.enabled ? 'Active' : 'Inactive'}
            </div>
            <p className="text-xs text-muted-foreground">
              Conversation assistance
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Auto Suggestions</CardTitle>
            <Lightbulb className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {settings.autoSuggestions.enabled ? settings.autoSuggestions.suggestionCount : '0'}
            </div>
            <p className="text-xs text-muted-foreground">
              Suggestions per chat
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sentiment Analysis</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {settings.sentimentAnalysis.enabled ? 'Real-time' : 'Off'}
            </div>
            <p className="text-xs text-muted-foreground">
              Emotion detection
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Smart Routing</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {settings.smartRouting.enabled ? 'Enabled' : 'Manual'}
            </div>
            <p className="text-xs text-muted-foreground">
              Intelligent assignment
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Settings Tabs */}
      <Tabs defaultValue="assistant" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="assistant">AI Assistant</TabsTrigger>
          <TabsTrigger value="analysis">Analysis & Routing</TabsTrigger>
          <TabsTrigger value="automation">Automation</TabsTrigger>
          <TabsTrigger value="insights">Insights & Reports</TabsTrigger>
        </TabsList>

        {/* AI Assistant Tab */}
        <TabsContent value="assistant" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="w-5 h-5" />
                AI Conversation Assistant
                {getFeatureStatus(settings.aiAssistant.enabled)}
              </CardTitle>
              <CardDescription>
                Configure the AI assistant that helps agents with conversation responses
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-2">
                <Switch
                  id="ai-assistant"
                  checked={settings.aiAssistant.enabled}
                  onCheckedChange={(checked) => handleSettingChange('aiAssistant', 'enabled', checked)}
                />
                <Label htmlFor="ai-assistant">Enable AI Assistant</Label>
              </div>

              {settings.aiAssistant.enabled && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="ai-model">AI Model</Label>
                      <Select 
                        value={settings.aiAssistant.model} 
                        onValueChange={(value) => handleSettingChange('aiAssistant', 'model', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="gpt-4">GPT-4 (Recommended)</SelectItem>
                          <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                          <SelectItem value="claude-3">Claude 3</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="max-tokens">Max Response Length</Label>
                      <Input
                        id="max-tokens"
                        type="number"
                        value={settings.aiAssistant.maxTokens}
                        onChange={(e) => handleSettingChange('aiAssistant', 'maxTokens', parseInt(e.target.value))}
                        min="50"
                        max="500"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="temperature">Response Creativity: {settings.aiAssistant.temperature}</Label>
                    <Slider
                      id="temperature"
                      min={0}
                      max={1}
                      step={0.1}
                      value={[settings.aiAssistant.temperature]}
                      onValueChange={(value) => handleSettingChange('aiAssistant', 'temperature', value[0])}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Conservative</span>
                      <span>Creative</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="system-prompt">System Prompt</Label>
                    <Textarea
                      id="system-prompt"
                      value={settings.aiAssistant.systemPrompt}
                      onChange={(e) => handleSettingChange('aiAssistant', 'systemPrompt', e.target.value)}
                      placeholder="Define how the AI should behave and respond"
                      rows={4}
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5" />
                Auto Suggestions
                {getFeatureStatus(settings.autoSuggestions.enabled)}
              </CardTitle>
              <CardDescription>
                Provide intelligent response suggestions to agents
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-2">
                <Switch
                  id="auto-suggestions"
                  checked={settings.autoSuggestions.enabled}
                  onCheckedChange={(checked) => handleSettingChange('autoSuggestions', 'enabled', checked)}
                />
                <Label htmlFor="auto-suggestions">Enable Auto Suggestions</Label>
              </div>

              {settings.autoSuggestions.enabled && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="suggestion-count">Number of Suggestions</Label>
                      <Select 
                        value={settings.autoSuggestions.suggestionCount.toString()} 
                        onValueChange={(value) => handleSettingChange('autoSuggestions', 'suggestionCount', parseInt(value))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 suggestion</SelectItem>
                          <SelectItem value="2">2 suggestions</SelectItem>
                          <SelectItem value="3">3 suggestions</SelectItem>
                          <SelectItem value="5">5 suggestions</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confidence">Min Confidence: {settings.autoSuggestions.confidence}</Label>
                      <Slider
                        id="confidence"
                        min={0.5}
                        max={1}
                        step={0.1}
                        value={[settings.autoSuggestions.confidence]}
                        onValueChange={(value) => handleSettingChange('autoSuggestions', 'confidence', value[0])}
                        className="w-full"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="show-confidence"
                      checked={settings.autoSuggestions.showConfidence}
                      onCheckedChange={(checked) => handleSettingChange('autoSuggestions', 'showConfidence', checked)}
                    />
                    <Label htmlFor="show-confidence">Show confidence scores to agents</Label>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analysis & Routing Tab */}
        <TabsContent value="analysis" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Sentiment Analysis
                {getFeatureStatus(settings.sentimentAnalysis.enabled)}
              </CardTitle>
              <CardDescription>
                Analyze customer emotions and escalate negative sentiment automatically
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-2">
                <Switch
                  id="sentiment-analysis"
                  checked={settings.sentimentAnalysis.enabled}
                  onCheckedChange={(checked) => handleSettingChange('sentimentAnalysis', 'enabled', checked)}
                />
                <Label htmlFor="sentiment-analysis">Enable Sentiment Analysis</Label>
              </div>

              {settings.sentimentAnalysis.enabled && (
                <>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="realtime-analysis"
                        checked={settings.sentimentAnalysis.realTimeAnalysis}
                        onCheckedChange={(checked) => handleSettingChange('sentimentAnalysis', 'realTimeAnalysis', checked)}
                      />
                      <Label htmlFor="realtime-analysis">Real-time sentiment tracking</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="escalation-enabled"
                        checked={settings.sentimentAnalysis.escalationEnabled}
                        onCheckedChange={(checked) => handleSettingChange('sentimentAnalysis', 'escalationEnabled', checked)}
                      />
                      <Label htmlFor="escalation-enabled">Auto-escalate negative sentiment</Label>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="alert-threshold">Negative Sentiment Threshold: {settings.sentimentAnalysis.alertThreshold}</Label>
                    <Slider
                      id="alert-threshold"
                      min={0.1}
                      max={0.9}
                      step={0.1}
                      value={[settings.sentimentAnalysis.alertThreshold]}
                      onValueChange={(value) => handleSettingChange('sentimentAnalysis', 'alertThreshold', value[0])}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Very Sensitive</span>
                      <span>Less Sensitive</span>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Languages className="w-5 h-5" />
                Language Detection
                {getFeatureStatus(settings.languageDetection.enabled)}
              </CardTitle>
              <CardDescription>
                Automatically detect customer language and route accordingly
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-2">
                <Switch
                  id="language-detection"
                  checked={settings.languageDetection.enabled}
                  onCheckedChange={(checked) => handleSettingChange('languageDetection', 'enabled', checked)}
                />
                <Label htmlFor="language-detection">Enable Language Detection</Label>
              </div>

              {settings.languageDetection.enabled && (
                <>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="auto-translate"
                      checked={settings.languageDetection.autoTranslate}
                      onCheckedChange={(checked) => handleSettingChange('languageDetection', 'autoTranslate', checked)}
                    />
                    <Label htmlFor="auto-translate">Enable auto-translation for agents</Label>
                  </div>

                  <div className="space-y-2">
                    <Label>Supported Languages</Label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { code: 'id', name: 'Bahasa Indonesia' },
                        { code: 'en', name: 'English' },
                        { code: 'ms', name: 'Bahasa Malaysia' },
                        { code: 'zh', name: 'Chinese' },
                        { code: 'ja', name: 'Japanese' }
                      ].map((lang) => (
                        <Badge 
                          key={lang.code}
                          variant={settings.languageDetection.supportedLanguages.includes(lang.code) ? 'default' : 'outline'}
                          className="cursor-pointer"
                          onClick={() => {
                            const current = settings.languageDetection.supportedLanguages;
                            const updated = current.includes(lang.code)
                              ? current.filter(l => l !== lang.code)
                              : [...current, lang.code];
                            handleSettingChange('languageDetection', 'supportedLanguages', updated);
                          }}
                        >
                          {lang.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Smart Routing
                {getFeatureStatus(settings.smartRouting.enabled)}
              </CardTitle>
              <CardDescription>
                Intelligently route conversations to the best available agent
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-2">
                <Switch
                  id="smart-routing"
                  checked={settings.smartRouting.enabled}
                  onCheckedChange={(checked) => handleSettingChange('smartRouting', 'enabled', checked)}
                />
                <Label htmlFor="smart-routing">Enable Smart Routing</Label>
              </div>

              {settings.smartRouting.enabled && (
                <>
                  <div className="space-y-2">
                    <Label>Routing Criteria</Label>
                    <div className="space-y-2">
                      {[
                        { key: 'sentiment', label: 'Customer Sentiment' },
                        { key: 'language', label: 'Language Match' },
                        { key: 'complexity', label: 'Query Complexity' },
                        { key: 'agent_expertise', label: 'Agent Expertise' }
                      ].map((criteria) => (
                        <div key={criteria.key} className="flex items-center space-x-2">
                          <Switch
                            id={criteria.key}
                            checked={settings.smartRouting.routingCriteria.includes(criteria.key)}
                            onCheckedChange={(checked) => {
                              const current = settings.smartRouting.routingCriteria;
                              const updated = checked
                                ? [...current, criteria.key]
                                : current.filter(c => c !== criteria.key);
                              handleSettingChange('smartRouting', 'routingCriteria', updated);
                            }}
                          />
                          <Label htmlFor={criteria.key}>{criteria.label}</Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="max-wait">Max Wait Time (seconds)</Label>
                    <Input
                      id="max-wait"
                      type="number"
                      value={settings.smartRouting.maxWaitTime}
                      onChange={(e) => handleSettingChange('smartRouting', 'maxWaitTime', parseInt(e.target.value))}
                      min="60"
                      max="600"
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Automation Tab */}
        <TabsContent value="automation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Chat Summary
                {getFeatureStatus(settings.chatSummary.enabled)}
              </CardTitle>
              <CardDescription>
                Automatically generate conversation summaries for better handoffs
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-2">
                <Switch
                  id="chat-summary"
                  checked={settings.chatSummary.enabled}
                  onCheckedChange={(checked) => handleSettingChange('chatSummary', 'enabled', checked)}
                />
                <Label htmlFor="chat-summary">Enable Chat Summary</Label>
              </div>

              {settings.chatSummary.enabled && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="auto-generate"
                      checked={settings.chatSummary.autoGenerate}
                      onCheckedChange={(checked) => handleSettingChange('chatSummary', 'autoGenerate', checked)}
                    />
                    <Label htmlFor="auto-generate">Auto-generate on chat close</Label>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Include in Summary</Label>
                    <div className="space-y-2">
                      {[
                        { key: 'includeKeyPoints', label: 'Key Discussion Points' },
                        { key: 'includeSentiment', label: 'Customer Sentiment' },
                        { key: 'includeResolution', label: 'Resolution Status' }
                      ].map((option) => (
                        <div key={option.key} className="flex items-center space-x-2">
                          <Switch
                            id={option.key}
                            checked={settings.chatSummary[option.key]}
                            onCheckedChange={(checked) => handleSettingChange('chatSummary', option.key, checked)}
                          />
                          <Label htmlFor={option.key}>{option.label}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5" />
                Knowledge Base Integration
                {getFeatureStatus(settings.knowledgeBase.enabled)}
              </CardTitle>
              <CardDescription>
                Connect with your knowledge base to provide accurate information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-2">
                <Switch
                  id="knowledge-base"
                  checked={settings.knowledgeBase.enabled}
                  onCheckedChange={(checked) => handleSettingChange('knowledgeBase', 'enabled', checked)}
                />
                <Label htmlFor="knowledge-base">Enable Knowledge Base Integration</Label>
              </div>

              {settings.knowledgeBase.enabled && (
                <>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="auto-search"
                      checked={settings.knowledgeBase.autoSearch}
                      onCheckedChange={(checked) => handleSettingChange('knowledgeBase', 'autoSearch', checked)}
                    />
                    <Label htmlFor="auto-search">Auto-search relevant articles</Label>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="suggestion-mode">Suggestion Mode</Label>
                    <Select 
                      value={settings.knowledgeBase.suggestionMode} 
                      onValueChange={(value) => handleSettingChange('knowledgeBase', 'suggestionMode', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="contextual">Contextual (based on conversation)</SelectItem>
                        <SelectItem value="keyword">Keyword-based</SelectItem>
                        <SelectItem value="manual">Manual search only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Insights & Reports Tab */}
        <TabsContent value="insights" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                AI Analytics
                {getFeatureStatus(settings.analytics.enabled)}
              </CardTitle>
              <CardDescription>
                Generate insights and performance reports using AI analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-2">
                <Switch
                  id="analytics"
                  checked={settings.analytics.enabled}
                  onCheckedChange={(checked) => handleSettingChange('analytics', 'enabled', checked)}
                />
                <Label htmlFor="analytics">Enable AI Analytics</Label>
              </div>

              {settings.analytics.enabled && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="track-performance"
                      checked={settings.analytics.trackPerformance}
                      onCheckedChange={(checked) => handleSettingChange('analytics', 'trackPerformance', checked)}
                    />
                    <Label htmlFor="track-performance">Track AI feature performance</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="generate-insights"
                      checked={settings.analytics.generateInsights}
                      onCheckedChange={(checked) => handleSettingChange('analytics', 'generateInsights', checked)}
                    />
                    <Label htmlFor="generate-insights">Generate automated insights</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="weekly-reports"
                      checked={settings.analytics.weeklyReports}
                      onCheckedChange={(checked) => handleSettingChange('analytics', 'weeklyReports', checked)}
                    />
                    <Label htmlFor="weekly-reports">Send weekly AI performance reports</Label>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* AI Performance Preview */}
          <Card>
            <CardHeader>
              <CardTitle>AI Performance Overview</CardTitle>
              <CardDescription>Current AI feature usage and effectiveness</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Suggestion Acceptance Rate</span>
                    <span className="text-sm font-bold text-green-600">78%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '78%' }}></div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Sentiment Accuracy</span>
                    <span className="text-sm font-bold text-blue-600">92%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '92%' }}></div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Response Time Improvement</span>
                    <span className="text-sm font-bold text-purple-600">-35%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-purple-500 h-2 rounded-full" style={{ width: '65%' }}></div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Customer Satisfaction</span>
                    <span className="text-sm font-bold text-orange-600">4.6/5</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-orange-500 h-2 rounded-full" style={{ width: '92%' }}></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save Alert */}
      {hasChanges && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-700">
            You have unsaved changes. Don't forget to save your AI configuration.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default PlatformAISettings;
