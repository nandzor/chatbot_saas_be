import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  Badge,
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
  Switch
} from '@/components/ui';
import { 
  Search,
  Filter,
  Eye,
  Settings,
  Users,
  Bot,
  Edit,
  Trash2,
  Plus,
  MessageSquare,
  Globe,
  Zap,
  CheckCircle,
  AlertCircle,
  Clock,
  Activity,
  BarChart3,
  TrendingUp,
  Users2,
  MessageCircle,
  Phone,
  Mail,
  Building,
  Star,
  Calendar,
  ArrowUpRight,
  ExternalLink,
  MoreVertical,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Play,
  Pause,
  Stop,
  RotateCcw,
  Shield,
  Key,
  Lock,
  Unlock,
  Database,
  Server,
  Cloud,
  Wifi,
  WifiOff,
  Signal,
  SignalHigh,
  SignalMedium,
  SignalLow
} from 'lucide-react';

const AdminInbox = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPlatform, setFilterPlatform] = useState('all');
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data untuk connection platforms
  const [connectionPlatforms, setConnectionPlatforms] = useState([
    {
      id: 'platform-001',
      name: 'WhatsApp Business API',
      type: 'messaging',
      status: 'active',
      connectionStatus: 'connected',
      agentCount: 12,
      activeChats: 45,
      totalMessages: 1250,
      lastActivity: '2024-01-25T14:30:00Z',
      uptime: '99.8%',
      responseTime: '2.3s',
      apiKey: 'wha_****_****_****',
      webhookUrl: 'https://webhook.example.com/whatsapp',
      rateLimit: '1000/min',
      features: ['text', 'media', 'location', 'contacts'],
      config: {
        autoReply: true,
        aiEnabled: true,
        workingHours: '24/7',
        language: 'id,en'
      }
    },
    {
      id: 'platform-002',
      name: 'Telegram Bot',
      type: 'messaging',
      status: 'active',
      connectionStatus: 'connected',
      agentCount: 8,
      activeChats: 23,
      totalMessages: 890,
      lastActivity: '2024-01-25T14:25:00Z',
      uptime: '99.9%',
      responseTime: '1.8s',
      apiKey: 'tel_****_****_****',
      webhookUrl: 'https://webhook.example.com/telegram',
      rateLimit: '500/min',
      features: ['text', 'media', 'inline_keyboard', 'polls'],
      config: {
        autoReply: false,
        aiEnabled: true,
        workingHours: '9:00-18:00',
        language: 'id,en'
      }
    },
    {
      id: 'platform-003',
      name: 'Facebook Messenger',
      type: 'social',
      status: 'active',
      connectionStatus: 'connected',
      agentCount: 15,
      activeChats: 67,
      totalMessages: 2100,
      lastActivity: '2024-01-25T14:35:00Z',
      uptime: '99.7%',
      responseTime: '3.1s',
      apiKey: 'fb_****_****_****',
      webhookUrl: 'https://webhook.example.com/facebook',
      rateLimit: '2000/min',
      features: ['text', 'media', 'quick_replies', 'typing_indicators'],
      config: {
        autoReply: true,
        aiEnabled: false,
        workingHours: '24/7',
        language: 'id,en'
      }
    },
    {
      id: 'platform-004',
      name: 'Instagram Direct',
      type: 'social',
      status: 'inactive',
      connectionStatus: 'disconnected',
      agentCount: 6,
      activeChats: 0,
      totalMessages: 450,
      lastActivity: '2024-01-20T10:15:00Z',
      uptime: '0%',
      responseTime: 'N/A',
      apiKey: 'ig_****_****_****',
      webhookUrl: 'https://webhook.example.com/instagram',
      rateLimit: '100/min',
      features: ['text', 'media', 'stories'],
      config: {
        autoReply: false,
        aiEnabled: false,
        workingHours: '9:00-17:00',
        language: 'id,en'
      }
    },
    {
      id: 'platform-005',
      name: 'Email Integration',
      type: 'email',
      status: 'active',
      connectionStatus: 'connected',
      agentCount: 10,
      activeChats: 34,
      totalMessages: 780,
      lastActivity: '2024-01-25T14:28:00Z',
      uptime: '99.5%',
      responseTime: '5.2s',
      apiKey: 'eml_****_****_****',
      webhookUrl: 'https://webhook.example.com/email',
      rateLimit: '100/min',
      features: ['text', 'attachments', 'threading', 'signatures'],
      config: {
        autoReply: true,
        aiEnabled: true,
        workingHours: '24/7',
        language: 'id,en'
      }
    },
    {
      id: 'platform-006',
      name: 'SMS Gateway',
      type: 'sms',
      status: 'maintenance',
      connectionStatus: 'limited',
      agentCount: 4,
      activeChats: 12,
      totalMessages: 320,
      lastActivity: '2024-01-25T13:45:00Z',
      uptime: '85.2%',
      responseTime: '8.7s',
      apiKey: 'sms_****_****_****',
      webhookUrl: 'https://webhook.example.com/sms',
      rateLimit: '50/min',
      features: ['text', 'delivery_reports', 'bulk_sms'],
      config: {
        autoReply: false,
        aiEnabled: false,
        workingHours: '24/7',
        language: 'id,en'
      }
    }
  ]);

  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [isViewDetailsOpen, setIsViewDetailsOpen] = useState(false);
  const [isConfigureOpen, setIsConfigureOpen] = useState(false);
  const [isManageAgentsOpen, setIsManageAgentsOpen] = useState(false);
  const [isAISettingsOpen, setIsAISettingsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'error': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getConnectionStatusIcon = (status) => {
    switch (status) {
      case 'connected': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'disconnected': return <AlertCircle className="w-4 h-4 text-red-600" />;
      case 'limited': return <Clock className="w-4 h-4 text-yellow-600" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getPlatformIcon = (type) => {
    switch (type) {
      case 'messaging': return <MessageSquare className="w-5 h-5 text-blue-600" />;
      case 'social': return <Globe className="w-5 h-5 text-purple-600" />;
      case 'email': return <Mail className="w-5 h-5 text-green-600" />;
      case 'sms': return <Phone className="w-5 h-5 text-orange-600" />;
      default: return <Zap className="w-5 h-5 text-gray-600" />;
    }
  };

  const filteredPlatforms = connectionPlatforms.filter(platform => {
    const matchesSearch = platform.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         platform.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || platform.status === filterStatus;
    const matchesPlatform = filterPlatform === 'all' || platform.type === filterPlatform;
    return matchesSearch && matchesStatus && matchesPlatform;
  });

  const handleDeletePlatform = (platformId) => {
    setConnectionPlatforms(platforms => platforms.filter(p => p.id !== platformId));
    setIsDeleteOpen(false);
    setSelectedPlatform(null);
  };

  return (
    <div className="h-screen bg-gray-50 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Connection Platforms</h1>
            <p className="text-sm text-gray-600 mt-1">Manage and monitor all your communication platforms</p>
          </div>
          <div className="flex items-center space-x-3">
            <Badge variant="blue" className="px-3 py-1">
              {connectionPlatforms.length} Platforms
            </Badge>
            <Button variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full flex">
          {/* Left Panel - Filters & Stats */}
          <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
            {/* Filters */}
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Filters</h3>
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search platforms..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <div>
                  <Label className="text-xs text-gray-700 mb-1 block">Status</Label>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="error">Error</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs text-gray-700 mb-1 block">Platform Type</Label>
                  <Select value={filterPlatform} onValueChange={setFilterPlatform}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="messaging">Messaging</SelectItem>
                      <SelectItem value="social">Social Media</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="sms">SMS</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-blue-600" />
                    <span className="text-sm text-blue-700">Connected</span>
                  </div>
                  <Badge variant="blue" className="px-2 py-1">
                    {connectionPlatforms.filter(p => p.connectionStatus === 'connected').length}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Activity className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-green-700">Active</span>
                  </div>
                  <Badge variant="green" className="px-2 py-1">
                    {connectionPlatforms.filter(p => p.status === 'active').length}
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Users2 className="w-4 h-4 text-yellow-600" />
                    <span className="text-sm text-yellow-700">Total Agents</span>
                  </div>
                  <Badge variant="yellow" className="px-2 py-1">
                    {connectionPlatforms.reduce((sum, p) => sum + p.agentCount, 0)}
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <MessageCircle className="w-4 h-4 text-purple-600" />
                    <span className="text-sm text-purple-700">Total Messages</span>
                  </div>
                  <Badge variant="purple" className="px-2 py-1">
                    {connectionPlatforms.reduce((sum, p) => sum + p.totalMessages, 0).toLocaleString()}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="flex-1 p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Recent Activity</h3>
              <div className="space-y-2">
                {connectionPlatforms
                  .sort((a, b) => new Date(b.lastActivity) - new Date(a.lastActivity))
                  .slice(0, 5)
                  .map(platform => (
                    <div key={platform.id} className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
                      {getPlatformIcon(platform.type)}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-900 truncate">{platform.name}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(platform.lastActivity).toLocaleTimeString('id-ID', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </p>
                      </div>
                      <div className={`w-2 h-2 rounded-full ${
                        platform.connectionStatus === 'connected' ? 'bg-green-500' :
                        platform.connectionStatus === 'disconnected' ? 'bg-red-500' : 'bg-yellow-500'
                      }`}></div>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Right Panel - Platforms Table */}
          <div className="flex-1 bg-white">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Platforms Overview</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Showing {filteredPlatforms.length} of {connectionPlatforms.length} platforms
                  </p>
                </div>
              </div>

              {/* Platforms Table */}
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="w-12"></TableHead>
                      <TableHead>Platform</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Connection</TableHead>
                      <TableHead>Agents</TableHead>
                      <TableHead>Active Chats</TableHead>
                      <TableHead>Uptime</TableHead>
                      <TableHead>Response Time</TableHead>
                      <TableHead className="w-32">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPlatforms.map((platform) => (
                      <TableRow key={platform.id} className="hover:bg-gray-50">
                        <TableCell>
                          {getPlatformIcon(platform.type)}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium text-gray-900">{platform.name}</div>
                            <div className="text-sm text-gray-500 capitalize">{platform.type}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline" 
                            className={`${getStatusColor(platform.status)}`}
                          >
                            {platform.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getConnectionStatusIcon(platform.connectionStatus)}
                            <span className="text-sm text-gray-900 capitalize">
                              {platform.connectionStatus}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-gray-900">{platform.agentCount}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-gray-900">{platform.activeChats}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-gray-900">{platform.uptime}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-gray-900">{platform.responseTime}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedPlatform(platform);
                                setIsViewDetailsOpen(true);
                              }}
                              className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedPlatform(platform);
                                setIsConfigureOpen(true);
                              }}
                              className="h-8 w-8 p-0 hover:bg-green-50 hover:text-green-600"
                              title="Configure"
                            >
                              <Settings className="w-4 h-4" />
                            </Button>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedPlatform(platform);
                                setIsManageAgentsOpen(true);
                              }}
                              className="h-8 w-8 p-0 hover:bg-purple-50 hover:text-purple-600"
                              title="Manage Agents"
                            >
                              <Users className="w-4 h-4" />
                            </Button>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedPlatform(platform);
                                setIsAISettingsOpen(true);
                              }}
                              className="h-8 w-8 p-0 hover:bg-orange-50 hover:text-orange-600"
                              title="AI Settings"
                            >
                              <Bot className="w-4 h-4" />
                            </Button>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedPlatform(platform);
                                setIsEditOpen(true);
                              }}
                              className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedPlatform(platform);
                                setIsDeleteOpen(true);
                              }}
                              className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* View Details Dialog */}
      <Dialog open={isViewDetailsOpen} onOpenChange={setIsViewDetailsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              {selectedPlatform && getPlatformIcon(selectedPlatform.type)}
              <span>Platform Details - {selectedPlatform?.name}</span>
            </DialogTitle>
            <DialogDescription>
              Detailed information about the platform configuration and performance
            </DialogDescription>
          </DialogHeader>
          
          {selectedPlatform && (
            <div className="space-y-6">
              {/* Basic Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Platform Name</Label>
                    <p className="text-sm text-gray-900 mt-1">{selectedPlatform.name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Type</Label>
                    <p className="text-sm text-gray-900 mt-1 capitalize">{selectedPlatform.type}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Status</Label>
                    <Badge className={`mt-1 ${getStatusColor(selectedPlatform.status)}`}>
                      {selectedPlatform.status}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Connection Status</Label>
                    <div className="flex items-center space-x-2 mt-1">
                      {getConnectionStatusIcon(selectedPlatform.connectionStatus)}
                      <span className="text-sm text-gray-900 capitalize">{selectedPlatform.connectionStatus}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Performance Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Uptime</Label>
                    <p className="text-2xl font-bold text-green-600 mt-1">{selectedPlatform.uptime}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Response Time</Label>
                    <p className="text-2xl font-bold text-blue-600 mt-1">{selectedPlatform.responseTime}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Active Agents</Label>
                    <p className="text-2xl font-bold text-purple-600 mt-1">{selectedPlatform.agentCount}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Active Chats</Label>
                    <p className="text-2xl font-bold text-orange-600 mt-1">{selectedPlatform.activeChats}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Configuration */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-700">API Key</Label>
                      <p className="text-sm text-gray-900 mt-1 font-mono">{selectedPlatform.apiKey}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Rate Limit</Label>
                      <p className="text-sm text-gray-900 mt-1">{selectedPlatform.rateLimit}</p>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Webhook URL</Label>
                    <p className="text-sm text-gray-900 mt-1 font-mono break-all">{selectedPlatform.webhookUrl}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Features</Label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {selectedPlatform.features.map(feature => (
                        <Badge key={feature} variant="outline" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* AI & Auto-Reply Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">AI & Auto-Reply Settings</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Auto Reply</Label>
                    <div className="flex items-center space-x-2 mt-1">
                      <Switch checked={selectedPlatform.config.autoReply} disabled />
                      <span className="text-sm text-gray-900">
                        {selectedPlatform.config.autoReply ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">AI Enabled</Label>
                    <div className="flex items-center space-x-2 mt-1">
                      <Switch checked={selectedPlatform.config.aiEnabled} disabled />
                      <span className="text-sm text-gray-900">
                        {selectedPlatform.config.aiEnabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Working Hours</Label>
                    <p className="text-sm text-gray-900 mt-1">{selectedPlatform.config.workingHours}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Languages</Label>
                    <p className="text-sm text-gray-900 mt-1">{selectedPlatform.config.language}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Configure Dialog */}
      <Dialog open={isConfigureOpen} onOpenChange={setIsConfigureOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Settings className="w-5 h-5 text-green-600" />
              <span>Configure Platform - {selectedPlatform?.name}</span>
            </DialogTitle>
            <DialogDescription>
              Configure platform settings, webhooks, and connection parameters
            </DialogDescription>
          </DialogHeader>
          
          {selectedPlatform && (
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-700">Webhook URL</Label>
                <Input 
                  value={selectedPlatform.webhookUrl} 
                  className="mt-1 font-mono"
                  readOnly
                />
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-700">Rate Limit</Label>
                <Input 
                  value={selectedPlatform.rateLimit} 
                  className="mt-1"
                  readOnly
                />
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-700">Working Hours</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select working hours" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="9:00-17:00">9:00 AM - 5:00 PM</SelectItem>
                    <SelectItem value="8:00-18:00">8:00 AM - 6:00 PM</SelectItem>
                    <SelectItem value="24/7">24/7</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-700">Languages</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select languages" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="id">Indonesian</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="id,en">Indonesian + English</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setIsConfigureOpen(false)}>
                  Cancel
                </Button>
                <Button className="bg-green-600 hover:bg-green-700">
                  Save Configuration
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Manage Agents Dialog */}
      <Dialog open={isManageAgentsOpen} onOpenChange={setIsManageAgentsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-purple-600" />
              <span>Manage Agents - {selectedPlatform?.name}</span>
            </DialogTitle>
            <DialogDescription>
              Manage agents assigned to this platform, their roles, and permissions
            </DialogDescription>
          </DialogHeader>
          
          {selectedPlatform && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">
                    Total Agents: <span className="font-semibold text-gray-900">{selectedPlatform.agentCount}</span>
                  </p>
                  <p className="text-sm text-gray-600">
                    Active Chats: <span className="font-semibold text-gray-900">{selectedPlatform.activeChats}</span>
                  </p>
                </div>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Agent
                </Button>
              </div>
              
              <div className="border border-gray-200 rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead>Agent</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Active Chats</TableHead>
                      <TableHead>Performance</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Array.from({ length: selectedPlatform.agentCount }, (_, i) => ({
                      id: `agent-${i + 1}`,
                      name: `Agent ${String.fromCharCode(65 + i)}`,
                      role: i === 0 ? 'Supervisor' : 'Agent',
                      status: Math.random() > 0.3 ? 'online' : 'offline',
                      activeChats: Math.floor(Math.random() * 10) + 1,
                      performance: Math.floor(Math.random() * 20) + 80
                    })).map(agent => (
                      <TableRow key={agent.id}>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
                              {agent.name.charAt(0)}
                            </div>
                            <span className="font-medium text-gray-900">{agent.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={agent.role === 'Supervisor' ? 'blue' : 'gray'}>
                            {agent.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline" 
                            className={agent.status === 'online' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-gray-100 text-gray-800 border-gray-200'}
                          >
                            {agent.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-900">{agent.activeChats}</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-green-600 h-2 rounded-full" 
                                style={{ width: `${agent.performance}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-900">{agent.performance}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-600 hover:bg-red-50">
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* AI Settings Dialog */}
      <Dialog open={isAISettingsOpen} onOpenChange={setIsAISettingsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Bot className="w-5 h-5 text-orange-600" />
              <span>AI Settings - {selectedPlatform?.name}</span>
            </DialogTitle>
            <DialogDescription>
              Configure AI behavior, auto-replies, and intelligent responses
            </DialogDescription>
          </DialogHeader>
          
          {selectedPlatform && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Enable AI Assistant</Label>
                  <p className="text-xs text-gray-500 mt-1">Allow AI to handle basic queries automatically</p>
                </div>
                <Switch checked={selectedPlatform.config.aiEnabled} />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Auto Reply</Label>
                  <p className="text-xs text-gray-500 mt-1">Send automatic responses for common questions</p>
                </div>
                <Switch checked={selectedPlatform.config.autoReply} />
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-700">AI Model</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select AI model" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gpt-4">GPT-4 (Advanced)</SelectItem>
                    <SelectItem value="gpt-3.5">GPT-3.5 (Standard)</SelectItem>
                    <SelectItem value="claude">Claude (Alternative)</SelectItem>
                    <SelectItem value="custom">Custom Model</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-700">Response Style</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select response style" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="friendly">Friendly</SelectItem>
                    <SelectItem value="casual">Casual</SelectItem>
                    <SelectItem value="technical">Technical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-700">Auto Reply Templates</Label>
                <Textarea 
                  placeholder="Enter common auto-reply templates..."
                  rows={4}
                  className="mt-1"
                />
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setIsAISettingsOpen(false)}>
                  Cancel
                </Button>
                <Button className="bg-orange-600 hover:bg-orange-700">
                  Save AI Settings
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Edit className="w-5 h-5 text-blue-600" />
              <span>Edit Platform - {selectedPlatform?.name}</span>
            </DialogTitle>
            <DialogDescription>
              Modify platform settings and configuration
            </DialogDescription>
          </DialogHeader>
          
          {selectedPlatform && (
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-700">Platform Name</Label>
                <Input 
                  value={selectedPlatform.name} 
                  className="mt-1"
                  readOnly
                />
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-700">Platform Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select platform type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="messaging">Messaging</SelectItem>
                    <SelectItem value="social">Social Media</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="sms">SMS</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-700">Status</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-700">Description</Label>
                <Textarea 
                  placeholder="Enter platform description..."
                  rows={3}
                  className="mt-1"
                />
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setIsEditOpen(false)}>
                  Cancel
                </Button>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Trash2 className="w-5 h-5 text-red-600" />
              <span>Delete Platform</span>
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this platform? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {selectedPlatform && (
            <div className="space-y-4">
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <div>
                    <p className="text-sm font-medium text-red-800">
                      Platform: {selectedPlatform.name}
                    </p>
                    <p className="text-xs text-red-600 mt-1">
                      This will remove all connections, configurations, and data associated with this platform.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={() => handleDeletePlatform(selectedPlatform.id)}
                >
                  Delete Platform
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminInbox;
