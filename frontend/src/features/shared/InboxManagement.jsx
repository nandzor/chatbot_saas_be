import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import UserAvatar from '@/components/common/UserAvatar';
import WhatsAppQRConnector from './WhatsAppQRConnector';
import PlatformDetails from './PlatformDetails';
import PlatformConfiguration from './PlatformConfiguration';
import PlatformAgentManagement from './PlatformAgentManagement';
import PlatformAISettings from './PlatformAISettings';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  Button,
  Badge,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
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
  Input,
  Label
} from '@/components/ui';
import { 
  Plus,
  MessageSquare,
  QrCode,
  Globe,
  Mail,
  Phone,
  Instagram,
  CheckCircle,
  AlertCircle,
  XCircle,
  MoreHorizontal,
  Settings,
  Users,
  Bot,
  Trash2,
  Edit,
  Eye,
  Zap,
  Shield,
  Activity,
  Clock,
  TrendingUp,
  AlertTriangle,
  Save
} from 'lucide-react';

const InboxManagement = () => {
  const { user } = useAuth();
  const [showWhatsAppConnector, setShowWhatsAppConnector] = useState(false);
  const [activeTab, setActiveTab] = useState('connected-platforms');
  const [currentView, setCurrentView] = useState('main'); // 'main', 'details', 'configure', 'agents', 'ai-settings', 'edit'
  const [selectedPlatformId, setSelectedPlatformId] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingPlatform, setEditingPlatform] = useState(null);

  // Sample data untuk connected platforms
  const [connectedPlatforms, setConnectedPlatforms] = useState([
    {
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
      phoneNumber: '+62 812-3456-7890'
    },
    {
      id: 'inbox-002',
      name: 'Support Technical',
      platform: 'webchat',
      status: 'connected',
      method: 'api_integration',
      connectedAt: '2024-03-10 09:15:00',
      lastActivity: '2024-03-20 13:50:45',
      totalMessages: 156,
      activeChats: 3,
      assignedAgents: 2,
      websiteUrl: 'https://company.com'
    },
    {
      id: 'inbox-003',
      name: 'Facebook Page',
      platform: 'facebook',
      status: 'error',
      method: 'oauth',
      connectedAt: '2024-03-12 14:20:00',
      lastActivity: '2024-03-18 16:30:22',
      totalMessages: 89,
      activeChats: 0,
      assignedAgents: 1,
      pageId: '@company.official'
    }
  ]);

  // Available platforms for connection
  const availablePlatforms = [
    {
      id: 'whatsapp-qr',
      name: 'WhatsApp QR Scan',
      description: 'Hubungkan nomor WhatsApp melalui QR Code (WAHA Session)',
      icon: MessageSquare,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      popular: true,
      riskLevel: 'medium'
    },
    {
      id: 'whatsapp-api',
      name: 'WhatsApp Business API',
      description: 'Koneksi resmi WhatsApp untuk bisnis (Coming Soon)',
      icon: Shield,
      color: 'text-green-700',
      bgColor: 'bg-green-50',
      popular: false,
      riskLevel: 'low',
      comingSoon: true
    },
    {
      id: 'webchat',
      name: 'Website Chat Widget',
      description: 'Embed chat widget di website Anda',
      icon: Globe,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      popular: true,
      riskLevel: 'low'
    },
    {
      id: 'facebook',
      name: 'Facebook Messenger',
      description: 'Hubungkan halaman Facebook bisnis Anda',
      icon: MessageSquare,
      color: 'text-blue-700',
      bgColor: 'bg-blue-50',
      popular: false,
      riskLevel: 'low'
    },
    {
      id: 'instagram',
      name: 'Instagram Direct',
      description: 'Kelola pesan Instagram bisnis (Coming Soon)',
      icon: Instagram,
      color: 'text-pink-600',
      bgColor: 'bg-pink-100',
      popular: false,
      riskLevel: 'low',
      comingSoon: true
    },
    {
      id: 'email',
      name: 'Email Integration',
      description: 'Kelola email support melalui platform',
      icon: Mail,
      color: 'text-gray-600',
      bgColor: 'bg-gray-100',
      popular: false,
      riskLevel: 'low'
    }
  ];

  const getPlatformIcon = (platform) => {
    const icons = {
      whatsapp: MessageSquare,
      webchat: Globe,
      facebook: MessageSquare,
      instagram: Instagram,
      email: Mail,
      phone: Phone
    };
    const IconComponent = icons[platform] || MessageSquare;
    return <IconComponent className="w-4 h-4" />;
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

  const getRiskBadge = (riskLevel) => {
    const configs = {
      low: { color: 'text-green-600', bg: 'bg-green-100', label: 'Rendah' },
      medium: { color: 'text-yellow-600', bg: 'bg-yellow-100', label: 'Sedang' },
      high: { color: 'text-red-600', bg: 'bg-red-100', label: 'Tinggi' }
    };
    
    const config = configs[riskLevel] || configs.low;
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.color}`}>
        Risk: {config.label}
      </span>
    );
  };

  const handleConnectPlatform = (platformId) => {
    if (platformId === 'whatsapp-qr') {
      setShowWhatsAppConnector(true);
    } else {
      // Handle other platform connections
      alert(`Koneksi ${platformId} akan segera tersedia`);
    }
  };

  const handleWhatsAppSuccess = (newInbox) => {
    setConnectedPlatforms(prev => [...prev, {
      ...newInbox,
      connectedAt: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      totalMessages: 0,
      activeChats: 0,
      assignedAgents: 0,
      phoneNumber: '+62 XXX-XXXX-XXXX'
    }]);
    setShowWhatsAppConnector(false);
  };

  const handleInboxAction = (action, inboxId) => {
    const platform = connectedPlatforms.find(p => p.id === inboxId);
    
    switch (action) {
      case 'view':
        setSelectedPlatformId(inboxId);
        setCurrentView('details');
        break;
      case 'configure':
        setSelectedPlatformId(inboxId);
        setCurrentView('configure');
        break;
      case 'agents':
        setSelectedPlatformId(inboxId);
        setCurrentView('agents');
        break;
      case 'ai':
        setSelectedPlatformId(inboxId);
        setCurrentView('ai-settings');
        break;
      case 'edit':
        setEditingPlatform(platform);
        setShowEditDialog(true);
        break;
      case 'delete':
        setSelectedPlatformId(inboxId);
        setShowDeleteDialog(true);
        break;
      default:
        console.log(`${action} inbox:`, inboxId);
    }
  };

  const handleDeletePlatform = () => {
    setConnectedPlatforms(prev => prev.filter(p => p.id !== selectedPlatformId));
    setShowDeleteDialog(false);
    setSelectedPlatformId(null);
  };

  const handleEditPlatform = (updatedData) => {
    setConnectedPlatforms(prev => 
      prev.map(p => p.id === editingPlatform.id ? { ...p, ...updatedData } : p)
    );
    setShowEditDialog(false);
    setEditingPlatform(null);
  };

  const handleBackToMain = () => {
    setCurrentView('main');
    setSelectedPlatformId(null);
  };

  // Render different views based on currentView
  if (currentView === 'details') {
    return (
      <PlatformDetails
        platformId={selectedPlatformId}
        onBack={handleBackToMain}
        onEdit={(id) => handleInboxAction('edit', id)}
        onDelete={(id) => handleInboxAction('delete', id)}
        onConfigure={(id) => handleInboxAction('configure', id)}
        onManageAgents={(id) => handleInboxAction('agents', id)}
        onAISettings={(id) => handleInboxAction('ai', id)}
      />
    );
  }

  if (currentView === 'configure') {
    return (
      <PlatformConfiguration
        platformId={selectedPlatformId}
        onBack={handleBackToMain}
        onSave={(config) => {
          console.log('Saving configuration:', config);
          handleBackToMain();
        }}
      />
    );
  }

  if (currentView === 'agents') {
    return (
      <PlatformAgentManagement
        platformId={selectedPlatformId}
        onBack={handleBackToMain}
      />
    );
  }

  if (currentView === 'ai-settings') {
    return (
      <PlatformAISettings
        platformId={selectedPlatformId}
        onBack={handleBackToMain}
        onSave={(settings) => {
          console.log('Saving AI settings:', settings);
          handleBackToMain();
        }}
      />
    );
  }

  return (
    <div className="space-y-4 lg:space-y-6 max-w-full overflow-hidden">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Inbox Management</h1>
        <p className="text-sm lg:text-base text-muted-foreground">
          Kelola koneksi platform dan inbox untuk menangani percakapan pelanggan
        </p>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="connected-platforms">Connected Platforms</TabsTrigger>
          <TabsTrigger value="add-platform">Add New Platform</TabsTrigger>
        </TabsList>

        {/* Connected Platforms Tab */}
        <TabsContent value="connected-platforms" className="space-y-4 lg:space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Platforms</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{connectedPlatforms.length}</div>
                <p className="text-xs text-muted-foreground">
                  {connectedPlatforms.filter(p => p.status === 'connected').length} aktif
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {connectedPlatforms.reduce((sum, p) => sum + p.totalMessages, 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Minggu ini
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Chats</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {connectedPlatforms.reduce((sum, p) => sum + p.activeChats, 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Sedang berlangsung
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Assigned Agents</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {connectedPlatforms.reduce((sum, p) => sum + p.assignedAgents, 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Total agent
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Connected Platforms Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Connected Platforms</CardTitle>
                  <CardDescription>Kelola semua platform yang terhubung dengan akun Anda</CardDescription>
                </div>
                
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Platform</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Activity</TableHead>
                    <TableHead>Stats</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {connectedPlatforms.map((platform) => (
                    <TableRow key={platform.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${
                            platform.platform === 'whatsapp' ? 'bg-green-100' :
                            platform.platform === 'webchat' ? 'bg-blue-100' :
                            platform.platform === 'facebook' ? 'bg-blue-50' :
                            'bg-gray-100'
                          }`}>
                            {getPlatformIcon(platform.platform)}
                          </div>
                          <div>
                            <p className="font-medium">{platform.name}</p>
                            <p className="text-sm text-muted-foreground capitalize">
                              {platform.platform} • {platform.method.replace('_', ' ')}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(platform.status)}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-sm">
                            <Clock className="w-3 h-3 text-muted-foreground" />
                            <span className="text-muted-foreground">
                              {new Date(platform.lastActivity).toLocaleString('id-ID')}
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Connected: {new Date(platform.connectedAt).toLocaleDateString('id-ID')}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1 text-sm">
                          <div>Messages: <span className="font-medium">{platform.totalMessages}</span></div>
                          <div>Active: <span className="font-medium">{platform.activeChats}</span></div>
                          <div>Agents: <span className="font-medium">{platform.assignedAgents}</span></div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleInboxAction('view', platform.id)}>
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleInboxAction('configure', platform.id)}>
                              <Settings className="w-4 h-4 mr-2" />
                              Configure
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleInboxAction('agents', platform.id)}>
                              <Users className="w-4 h-4 mr-2" />
                              Manage Agents
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleInboxAction('ai', platform.id)}>
                              <Bot className="w-4 h-4 mr-2" />
                              AI Settings
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleInboxAction('edit', platform.id)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleInboxAction('delete', platform.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Add Platform Tab */}
        <TabsContent value="add-platform" className="space-y-4 lg:space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Add New Platform</CardTitle>
              <CardDescription>
                Pilih platform yang ingin Anda hubungkan untuk menangani percakapan pelanggan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                {availablePlatforms.map((platform) => {
                  const IconComponent = platform.icon;
                  return (
                    <Card 
                      key={platform.id} 
                      className={`relative cursor-pointer transition-all hover:shadow-md ${
                        platform.comingSoon ? 'opacity-60' : 'hover:border-primary'
                      }`}
                      onClick={() => !platform.comingSoon && handleConnectPlatform(platform.id)}
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`p-3 rounded-lg ${platform.bgColor}`}>
                              <IconComponent className={`w-6 h-6 ${platform.color}`} />
                            </div>
                            <div>
                              <CardTitle className="text-base">{platform.name}</CardTitle>
                              {platform.popular && (
                                <Badge variant="secondary" className="mt-1">Popular</Badge>
                              )}
                            </div>
                          </div>
                          {platform.comingSoon && (
                            <Badge variant="outline">Coming Soon</Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-3">
                          {platform.description}
                        </p>
                        <div className="flex items-center justify-between">
                          {getRiskBadge(platform.riskLevel)}
                          <Button 
                            size="sm" 
                            disabled={platform.comingSoon}
                            variant={platform.comingSoon ? "ghost" : "default"}
                          >
                            {platform.comingSoon ? 'Coming Soon' : 'Connect'}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Risk Information */}
              <Alert className="mt-6">
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  <strong>Informasi Risiko:</strong>
                  <ul className="mt-2 text-sm space-y-1">
                    <li>• <strong>Rendah:</strong> API resmi, stabil untuk produksi</li>
                    <li>• <strong>Sedang:</strong> Tidak resmi, cocok untuk testing/skala kecil</li>
                    <li>• <strong>Tinggi:</strong> Eksperimental, dapat berubah sewaktu-waktu</li>
                  </ul>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* WhatsApp QR Connector Modal */}
      {showWhatsAppConnector && (
        <WhatsAppQRConnector
          onClose={() => setShowWhatsAppConnector(false)}
          onSuccess={handleWhatsAppSuccess}
        />
      )}

      {/* Delete Platform Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Platform Connection</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this platform connection? This action cannot be undone.
              All conversations and data associated with this platform will be permanently removed.
            </DialogDescription>
          </DialogHeader>
          
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700">
              <strong>Warning:</strong> This will permanently delete:
              <ul className="mt-2 list-disc list-inside space-y-1">
                <li>All conversation history</li>
                <li>Agent assignments</li>
                <li>Platform configuration</li>
                <li>AI settings and analytics data</li>
              </ul>
            </AlertDescription>
          </Alert>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeletePlatform}>
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Platform
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Platform Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-lg p-6">
          <DialogHeader className="pb-8">
            <DialogTitle className="text-xl font-semibold">Edit Platform Details</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground mt-3">
              Update the basic information for this platform connection.
            </DialogDescription>
          </DialogHeader>
          
          {editingPlatform && (
            <div className="space-y-8">
              {/* Platform Type Indicator */}
              <div className="flex items-center gap-4 p-5 bg-muted/50 rounded-lg border border-border/50">
                <div className={`p-3 rounded-lg ${
                  editingPlatform.platform === 'whatsapp' ? 'bg-green-100' :
                  editingPlatform.platform === 'webchat' ? 'bg-blue-100' :
                  editingPlatform.platform === 'facebook' ? 'bg-blue-50' :
                  'bg-gray-100'
                }`}>
                  {editingPlatform.platform === 'whatsapp' && <MessageSquare className="w-5 h-5 text-green-600" />}
                  {editingPlatform.platform === 'webchat' && <Globe className="w-5 h-5 text-blue-600" />}
                  {editingPlatform.platform === 'facebook' && <MessageSquare className="w-5 h-5 text-blue-600" />}
                </div>
                <div>
                  <p className="font-semibold text-sm capitalize">{editingPlatform.platform}</p>
                  <p className="text-xs text-muted-foreground mt-1">Platform Type</p>
                </div>
              </div>

              {/* Form Fields */}
              <div className="space-y-7">
                <div className="space-y-3">
                  <Label htmlFor="platform-name" className="text-sm font-medium">
                    Platform Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="platform-name"
                    value={editingPlatform.name}
                    onChange={(e) => setEditingPlatform(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter platform name"
                    className="h-11 px-4"
                  />
                  <p className="text-xs text-muted-foreground">
                    This name will be displayed in the platform list
                  </p>
                </div>
                
                {editingPlatform.platform === 'whatsapp' && (
                  <div className="space-y-3">
                    <Label htmlFor="platform-phone" className="text-sm font-medium">
                      Phone Number
                    </Label>
                    <Input
                      id="platform-phone"
                      value={editingPlatform.phoneNumber || ''}
                      onChange={(e) => setEditingPlatform(prev => ({ ...prev, phoneNumber: e.target.value }))}
                      placeholder="e.g., +62 812-3456-7890"
                      className="h-11 px-4"
                    />
                    <p className="text-xs text-muted-foreground">
                      WhatsApp number connected to this platform
                    </p>
                  </div>
                )}
                
                {editingPlatform.platform === 'webchat' && (
                  <div className="space-y-3">
                    <Label htmlFor="platform-url" className="text-sm font-medium">
                      Website URL
                    </Label>
                    <Input
                      id="platform-url"
                      value={editingPlatform.websiteUrl || ''}
                      onChange={(e) => setEditingPlatform(prev => ({ ...prev, websiteUrl: e.target.value }))}
                      placeholder="https://example.com"
                      className="h-11 px-4"
                    />
                    <p className="text-xs text-muted-foreground">
                      Website where the chat widget is installed
                    </p>
                  </div>
                )}
                
                {editingPlatform.platform === 'facebook' && (
                  <div className="space-y-3">
                    <Label htmlFor="platform-page" className="text-sm font-medium">
                      Facebook Page ID
                    </Label>
                    <Input
                      id="platform-page"
                      value={editingPlatform.pageId || ''}
                      onChange={(e) => setEditingPlatform(prev => ({ ...prev, pageId: e.target.value }))}
                      placeholder="@company.official"
                      className="h-11 px-4"
                    />
                    <p className="text-xs text-muted-foreground">
                      Facebook page handle or ID connected to this platform
                    </p>
                  </div>
                )}

                {/* Connection Status */}
                <div className="pt-6 border-t border-border/50">
                  <div className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-sm font-medium">Connection Status</p>
                      <p className="text-xs text-muted-foreground mt-1">Current platform status</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {editingPlatform.status === 'connected' && (
                        <>
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-sm font-medium text-green-600">Connected</span>
                        </>
                      )}
                      {editingPlatform.status === 'error' && (
                        <>
                          <XCircle className="w-4 h-4 text-red-500" />
                          <span className="text-sm font-medium text-red-600">Error</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter className="pt-8 border-t border-border/50">
            <div className="flex gap-3 w-full sm:w-auto">
              <Button 
                variant="outline" 
                onClick={() => setShowEditDialog(false)}
                className="flex-1 sm:flex-none h-11 px-6"
              >
                Cancel
              </Button>
              <Button 
                onClick={() => handleEditPlatform(editingPlatform)}
                className="flex-1 sm:flex-none h-11 px-6"
                disabled={!editingPlatform?.name?.trim()}
              >
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InboxManagement;
