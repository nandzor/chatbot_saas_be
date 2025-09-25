/**
 * Inbox Management Component
 * Manages inbox settings and configurations
 */

import { useState, useCallback } from 'react';
import {
  useLoadingStates
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
import { useApi } from '@/hooks/useApi';
import {
  BotPersonalityDashboard,
  PersonalityPreview,
  PersonalityComparison
} from '@/components/bot-personalities';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Label,
  Switch,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Separator,
} from '@/components/ui';
import {
  Settings,
  Save,
  Bell,
  Users,
  MessageSquare,
  Shield,
  Zap,
  Bot,
  Eye,
  BarChart3
} from 'lucide-react';

const InboxManagementComponent = () => {
  const { announce } = useAnnouncement();
  const { focusRef } = useFocusManagement();
  const { setLoading, getLoadingState } = useLoadingStates();

  // State management
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    auto_assign_sessions: true,
    max_concurrent_sessions: 5,
    session_timeout_minutes: 30,
    enable_notifications: true,
    notification_sound: true,
    auto_escalation_enabled: true,
    escalation_timeout_minutes: 10,
    ai_sentiment_analysis: true,
    ai_intent_detection: true,
    track_analytics: true,
    real_time_metrics: true,
    require_authentication: true,
    session_encryption: true,
    audit_logging: true
  });
  // const [botPersonalities, setBotPersonalities] = useState([]);
  // const [personalityStats, setPersonalityStats] = useState(null);

  // API hooks for settings
  // Note: getSessionFilters is not available in current API
  // const {
  //   loading: settingsLoading,
  //   error: settingsError,
  //   refresh: refreshSettings
  // } = useApi(inboxService.getSessionFilters, {
  //   immediate: true,
  //   onError: (err) => {
  //     handleError(err, {
  //       context: 'Settings Loading',
  //       showToast: true
  //     });
  //   }
  // });

  // Create stable reference for API function
  const getBotPersonalities = useCallback(() => inboxService.getBotPersonalities(), []);

  // Create stable error callback
  const onErrorCallback = useCallback((err) => {
    handleError(err, {
      context: 'Personalities Loading',
      showToast: true
    });
  }, []);

  // API hooks for bot personalities
  const {
    data: personalitiesData
  } = useApi(getBotPersonalities, {
    immediate: true,
    onError: onErrorCallback
  });

  // API hooks for personality statistics
  // const {
  //   data: statsData
  // } = useApi(inboxService.getBotPersonalityStatistics, {
  //   immediate: true,
  //   onError: (err) => {
  //     handleError(err, {
  //       context: 'Personality Stats Loading',
  //       showToast: true
  //     });
  //   }
  // });

  // Handle setting change
  const handleSettingChange = useCallback((key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  // Save settings
  const handleSaveSettings = useCallback(async () => {
    try {
      setLoading('save', true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      announce('Settings saved successfully');
    } catch (err) {
      handleError(err, { context: 'Save Settings' });
    } finally {
      setLoading('save', false);
    }
  }, [setLoading, announce]);

  // Handle personality selection
  // const handlePersonalitySelect = useCallback((personality) => {
  //   console.log('Selected personality:', personality);
  //   // TODO: Implement personality details view
  // }, []);

  // Load personalities data
  // React.useEffect(() => {
  //   if (personalitiesData) {
  //     setBotPersonalities(personalitiesData);
  //   }
  // }, [personalitiesData]);

  // Load stats data
  // React.useEffect(() => {
  //   if (statsData) {
  //     setPersonalityStats(statsData);
  //   }
  // }, [statsData]);

  return (
    <div className="space-y-6" ref={focusRef}>
      {/* Header */}
      <div className="flex items-center justify-between">
      <div>
          <h2 className="text-2xl font-bold">Inbox Management</h2>
          <p className="text-muted-foreground">
            Configure inbox settings and preferences
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={handleSaveSettings}
            disabled={getLoadingState('save')}
          >
            <Save className="h-4 w-4 mr-2" />
            {getLoadingState('save') ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </div>

      {/* Error Alert - Removed settingsError as it's not available in current API */}

      {/* Settings Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="workflow" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Workflow
          </TabsTrigger>
          <TabsTrigger value="ai" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            AI
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="bot-personalities" className="flex items-center gap-2">
            <Bot className="h-4 w-4" />
            Bot Personalities
          </TabsTrigger>
          <TabsTrigger value="personality-preview" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Preview
          </TabsTrigger>
          <TabsTrigger value="personality-comparison" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Comparison
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6">
            <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Session Management
              </CardTitle>
              <CardDescription>
                Configure how sessions are managed and assigned
              </CardDescription>
              </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto-assign sessions</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically assign new sessions to available agents
                  </p>
                </div>
                <Switch
                  checked={settings.auto_assign_sessions}
                  onCheckedChange={(checked) => handleSettingChange('auto_assign_sessions', checked)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="max_concurrent">Max concurrent sessions</Label>
                  <Input
                    id="max_concurrent"
                    type="number"
                    min="1"
                    max="20"
                    value={settings.max_concurrent_sessions}
                    onChange={(e) => handleSettingChange('max_concurrent_sessions', parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="session_timeout">Session timeout (minutes)</Label>
                  <Input
                    id="session_timeout"
                    type="number"
                    min="5"
                    max="120"
                    value={settings.session_timeout_minutes}
                    onChange={(e) => handleSettingChange('session_timeout_minutes', parseInt(e.target.value))}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  Notifications
                </h4>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enable notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications for new sessions and messages
                    </p>
                  </div>
                  <Switch
                    checked={settings.enable_notifications}
                    onCheckedChange={(checked) => handleSettingChange('enable_notifications', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Notification sound</Label>
                    <p className="text-sm text-muted-foreground">
                      Play sound for notifications
                    </p>
                  </div>
                  <Switch
                    checked={settings.notification_sound}
                    onCheckedChange={(checked) => handleSettingChange('notification_sound', checked)}
                    disabled={!settings.enable_notifications}
                  />
                </div>
              </div>
              </CardContent>
            </Card>
        </TabsContent>

        {/* Workflow Settings */}
        <TabsContent value="workflow" className="space-y-6">
            <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Workflow Automation
              </CardTitle>
              <CardDescription>
                Configure automated workflows and escalations
              </CardDescription>
              </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto-escalation</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically escalate sessions based on priority and time
                  </p>
                </div>
                <Switch
                  checked={settings.auto_escalation_enabled}
                  onCheckedChange={(checked) => handleSettingChange('auto_escalation_enabled', checked)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="escalation_timeout">Escalation timeout (minutes)</Label>
                <Input
                  id="escalation_timeout"
                  type="number"
                  min="1"
                  max="60"
                  value={settings.escalation_timeout_minutes}
                  onChange={(e) => handleSettingChange('escalation_timeout_minutes', parseInt(e.target.value))}
                  disabled={!settings.auto_escalation_enabled}
                />
              </div>
              </CardContent>
            </Card>
        </TabsContent>

        {/* AI Settings */}
        <TabsContent value="ai" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                AI Configuration
              </CardTitle>
              <CardDescription>
                Configure AI features and automation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Sentiment analysis</Label>
                  <p className="text-sm text-muted-foreground">
                    Analyze customer sentiment in real-time
                  </p>
                </div>
                <Switch
                  checked={settings.ai_sentiment_analysis}
                  onCheckedChange={(checked) => handleSettingChange('ai_sentiment_analysis', checked)}
                />
                </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Intent detection</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically detect customer intent
                  </p>
                </div>
                <Switch
                  checked={settings.ai_intent_detection}
                  onCheckedChange={(checked) => handleSettingChange('ai_intent_detection', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security & Privacy
              </CardTitle>
              <CardDescription>
                Configure security settings and access controls
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Require authentication</Label>
                  <p className="text-sm text-muted-foreground">
                    Require user authentication for all operations
                            </p>
                          </div>
                <Switch
                  checked={settings.require_authentication}
                  onCheckedChange={(checked) => handleSettingChange('require_authentication', checked)}
                />
                        </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Session encryption</Label>
                  <p className="text-sm text-muted-foreground">
                    Encrypt session data in transit and at rest
                  </p>
                          </div>
                <Switch
                  checked={settings.session_encryption}
                  onCheckedChange={(checked) => handleSettingChange('session_encryption', checked)}
                />
                          </div>

                        <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Audit logging</Label>
                  <p className="text-sm text-muted-foreground">
                    Log all user actions and system events
                  </p>
                        </div>
                <Switch
                  checked={settings.audit_logging}
                  onCheckedChange={(checked) => handleSettingChange('audit_logging', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Bot Personalities Tab */}
        <TabsContent value="bot-personalities" className="space-y-6">
          <BotPersonalityDashboard
            organizationId={personalitiesData?.organization_id}
            showFilters={true}
            showExport={true}
            autoRefresh={true}
          />
        </TabsContent>

        {/* Personality Preview Tab */}
        <TabsContent value="personality-preview" className="space-y-6">
          <PersonalityPreview
            personality={null} // Will be set when a personality is selected
            onPersonalityUpdate={(_personality) => {
              // Handle personality updates
              // console.log('Personality updated:', personality);
            }}
            showAdvanced={true}
            showMetrics={true}
            showExport={true}
            autoRefresh={false}
          />
        </TabsContent>

        {/* Personality Comparison Tab */}
        <TabsContent value="personality-comparison" className="space-y-6">
          <PersonalityComparison
            personalities={[]} // Will be loaded from API
            onPersonalitySelect={(_personality) => {
              // Handle personality selection
              // console.log('Personality selected:', personality);
            }}
            showFilters={true}
            showExport={true}
            showCharts={true}
            maxComparisons={4}
            autoRefresh={false}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

const InboxManagement = withErrorHandling(InboxManagementComponent, {
  context: 'Inbox Management'
});

export default InboxManagement;
