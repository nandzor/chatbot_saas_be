import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  Button,
  Badge,
  Alert,
  AlertDescription,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui';
import { 
  ArrowLeft,
  MessageSquare,
  Globe,
  CheckCircle,
  XCircle,
  AlertCircle,
  Activity,
  Users,
  Clock,
  TrendingUp,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Zap,
  Shield,
  Settings,
  Bot,
  Edit,
  Trash2
} from 'lucide-react';

const PlatformDetails = ({ platformId, onBack, onEdit, onDelete, onConfigure, onManageAgents, onAISettings }) => {
  // Sample platform data - in real app this would come from API/props
  const platformData = {
    'inbox-001': {
      id: 'inbox-001',
      name: 'CS Tim Marketing',
      platform: 'whatsapp',
      status: 'connected',
      method: 'qr_scan',
      connectedAt: '2024-03-15 10:30:00',
      lastActivity: '2024-03-20 14:25:12',
      totalMessages: 342,
      activeChats: 8,
      assignedAgents: 3,
      phoneNumber: '+62 812-3456-7890',
      description: 'WhatsApp inbox untuk tim marketing menangani inquiry produk dan penjualan',
      configuration: {
        autoReply: true,
        workingHours: '09:00 - 17:00',
        timezone: 'Asia/Jakarta',
        language: 'id',
        welcomeMessage: 'Halo! Terima kasih telah menghubungi CS Marketing kami. Bagaimana kami bisa membantu Anda hari ini?'
      },
      agents: [
        { id: 1, name: 'Sarah Johnson', email: 'sarah@company.com', status: 'online', assignedChats: 3 },
        { id: 2, name: 'Mike Chen', email: 'mike@company.com', status: 'away', assignedChats: 2 },
        { id: 3, name: 'Lisa Wong', email: 'lisa@company.com', status: 'offline', assignedChats: 0 }
      ],
      aiSettings: {
        enabled: true,
        autoSuggest: true,
        sentimentAnalysis: true,
        languageDetection: true,
        smartRouting: false
      },
      metrics: {
        todayMessages: 45,
        weeklyMessages: 342,
        monthlyMessages: 1456,
        avgResponseTime: '2.5 min',
        satisfactionScore: 4.2,
        resolutionRate: 89
      }
    }
  };

  const platform = platformData[platformId];
  
  if (!platform) {
    return (
      <div className="p-6 text-center">
        <AlertCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Platform Not Found</h3>
        <p className="text-muted-foreground mb-4">The platform you're looking for doesn't exist.</p>
        <Button onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Platforms
        </Button>
      </div>
    );
  }

  const getPlatformIcon = (platformType) => {
    const icons = {
      whatsapp: MessageSquare,
      webchat: Globe,
      facebook: MessageSquare
    };
    const IconComponent = icons[platformType] || MessageSquare;
    return <IconComponent className="w-5 h-5" />;
  };

  const getStatusBadge = (status) => {
    const variants = {
      connected: { variant: 'green', color: 'text-green-600', icon: CheckCircle },
      error: { variant: 'red', color: 'text-red-600', icon: XCircle },
      disconnected: { variant: 'default', color: 'text-gray-600', icon: AlertCircle }
    };
    
    const config = variants[status] || variants.disconnected;
    const IconComponent = config.icon;
    
    return (
      <Badge variant={config.variant} className="capitalize">
        <IconComponent className="w-3 h-3 mr-1" />
        {status}
      </Badge>
    );
  };

  const getAgentStatusBadge = (status) => {
    const variants = {
      online: 'bg-green-100 text-green-700',
      away: 'bg-yellow-100 text-yellow-700',
      offline: 'bg-gray-100 text-gray-700'
    };
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${variants[status]}`}>
        <div className={`w-2 h-2 rounded-full mr-1 ${
          status === 'online' ? 'bg-green-500' :
          status === 'away' ? 'bg-yellow-500' : 'bg-gray-400'
        }`}></div>
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-lg ${
              platform.platform === 'whatsapp' ? 'bg-green-100' :
              platform.platform === 'webchat' ? 'bg-blue-100' :
              'bg-gray-100'
            }`}>
              {getPlatformIcon(platform.platform)}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{platform.name}</h1>
              <p className="text-muted-foreground capitalize">
                {platform.platform} • {platform.method.replace('_', ' ')}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {getStatusBadge(platform.status)}
          <div className="flex gap-2 ml-4">
            <Button variant="outline" size="sm" onClick={() => onEdit(platform.id)}>
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
            <Button variant="outline" size="sm" onClick={() => onConfigure(platform.id)}>
              <Settings className="w-4 h-4 mr-2" />
              Configure
            </Button>
            <Button variant="destructive" size="sm" onClick={() => onDelete(platform.id)}>
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{platform.metrics.todayMessages}</div>
            <p className="text-xs text-muted-foreground">
              +12% from yesterday
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Chats</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{platform.activeChats}</div>
            <p className="text-xs text-muted-foreground">
              Currently ongoing
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{platform.metrics.avgResponseTime}</div>
            <p className="text-xs text-muted-foreground">
              -30s from last week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Satisfaction</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{platform.metrics.satisfactionScore}/5</div>
            <p className="text-xs text-muted-foreground">
              {platform.metrics.resolutionRate}% resolution rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="agents">Agents ({platform.agents.length})</TabsTrigger>
          <TabsTrigger value="configuration">Configuration</TabsTrigger>
          <TabsTrigger value="ai-settings">AI Settings</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Platform Info */}
            <Card>
              <CardHeader>
                <CardTitle>Platform Information</CardTitle>
                <CardDescription>Basic details about this platform connection</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Phone Number:</span>
                    <span className="text-sm">{platform.phoneNumber}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Connected:</span>
                    <span className="text-sm">{new Date(platform.connectedAt).toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Last Activity:</span>
                    <span className="text-sm">{new Date(platform.lastActivity).toLocaleString('id-ID')}</span>
                  </div>
                </div>
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground">{platform.description}</p>
                </div>
              </CardContent>
            </Card>

            {/* Activity Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Activity Summary</CardTitle>
                <CardDescription>Recent activity and performance metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{platform.metrics.weeklyMessages}</div>
                    <div className="text-xs text-muted-foreground">This Week</div>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{platform.metrics.monthlyMessages}</div>
                    <div className="text-xs text-muted-foreground">This Month</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Resolution Rate</span>
                    <span className="font-medium">{platform.metrics.resolutionRate}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ width: `${platform.metrics.resolutionRate}%` }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Manage this platform connection</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button 
                  variant="outline" 
                  className="h-auto p-4 flex-col gap-2"
                  onClick={() => onConfigure(platform.id)}
                >
                  <Settings className="w-6 h-6" />
                  <span>Configure Platform</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-auto p-4 flex-col gap-2"
                  onClick={() => onManageAgents(platform.id)}
                >
                  <Users className="w-6 h-6" />
                  <span>Manage Agents</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-auto p-4 flex-col gap-2"
                  onClick={() => onAISettings(platform.id)}
                >
                  <Bot className="w-6 h-6" />
                  <span>AI Settings</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-auto p-4 flex-col gap-2"
                  onClick={() => onEdit(platform.id)}
                >
                  <Edit className="w-6 h-6" />
                  <span>Edit Details</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Agents Tab */}
        <TabsContent value="agents" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Assigned Agents</h3>
              <p className="text-sm text-muted-foreground">Manage agents who can handle conversations from this platform</p>
            </div>
            <Button onClick={() => onManageAgents(platform.id)}>
              <Users className="w-4 h-4 mr-2" />
              Manage Agents
            </Button>
          </div>

          <div className="grid gap-4">
            {platform.agents.map((agent) => (
              <Card key={agent.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-medium text-primary">
                          {agent.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{agent.name}</p>
                        <p className="text-sm text-muted-foreground">{agent.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-medium">{agent.assignedChats} active chats</p>
                        {getAgentStatusBadge(agent.status)}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Configuration Tab */}
        <TabsContent value="configuration" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Platform Configuration</h3>
              <p className="text-sm text-muted-foreground">Current settings for this platform connection</p>
            </div>
            <Button onClick={() => onConfigure(platform.id)}>
              <Settings className="w-4 h-4 mr-2" />
              Edit Configuration
            </Button>
          </div>

          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Working Hours</label>
                    <p className="text-sm text-muted-foreground">{platform.configuration.workingHours}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Timezone</label>
                    <p className="text-sm text-muted-foreground">{platform.configuration.timezone}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Language</label>
                    <p className="text-sm text-muted-foreground">{platform.configuration.language}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Auto Reply</label>
                    <p className="text-sm text-muted-foreground">
                      {platform.configuration.autoReply ? 'Enabled' : 'Disabled'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Welcome Message</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm">{platform.configuration.welcomeMessage}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* AI Settings Tab */}
        <TabsContent value="ai-settings" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">AI Features</h3>
              <p className="text-sm text-muted-foreground">Configure AI-powered features for this platform</p>
            </div>
            <Button onClick={() => onAISettings(platform.id)}>
              <Bot className="w-4 h-4 mr-2" />
              Configure AI
            </Button>
          </div>

          <div className="grid gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">AI Assistant</h4>
                    <p className="text-sm text-muted-foreground">Enable AI-powered conversation assistance</p>
                  </div>
                  <Badge variant={platform.aiSettings.enabled ? 'green' : 'default'}>
                    {platform.aiSettings.enabled ? 'Enabled' : 'Disabled'}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Auto Suggestions</h4>
                    <p className="text-sm text-muted-foreground">Suggest responses to agents</p>
                  </div>
                  <Badge variant={platform.aiSettings.autoSuggest ? 'green' : 'default'}>
                    {platform.aiSettings.autoSuggest ? 'Enabled' : 'Disabled'}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Sentiment Analysis</h4>
                    <p className="text-sm text-muted-foreground">Analyze customer sentiment in real-time</p>
                  </div>
                  <Badge variant={platform.aiSettings.sentimentAnalysis ? 'green' : 'default'}>
                    {platform.aiSettings.sentimentAnalysis ? 'Enabled' : 'Disabled'}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Language Detection</h4>
                    <p className="text-sm text-muted-foreground">Automatically detect customer language</p>
                  </div>
                  <Badge variant={platform.aiSettings.languageDetection ? 'green' : 'default'}>
                    {platform.aiSettings.languageDetection ? 'Enabled' : 'Disabled'}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Smart Routing</h4>
                    <p className="text-sm text-muted-foreground">Route conversations to best available agent</p>
                  </div>
                  <Badge variant={platform.aiSettings.smartRouting ? 'green' : 'default'}>
                    {platform.aiSettings.smartRouting ? 'Enabled' : 'Disabled'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PlatformDetails;
