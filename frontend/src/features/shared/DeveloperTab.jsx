import React, { useState } from 'react';
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
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
  Switch,
  Alert,
  AlertDescription,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui';
import { 
  Key,
  Webhook,
  Plus,
  Edit,
  Trash2,
  Copy,
  Eye,
  EyeOff,
  X,
  Save,
  AlertTriangle,
  Info,
  CheckCircle,
  Clock,
  Activity,
  Shield,
  Globe,
  Settings,
  Zap,
  Bell,
  Database,
  Code,
  Link,
  ExternalLink
} from 'lucide-react';

const DeveloperTab = () => {
  // State for API Keys
  const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);
  const [showEditApiKeyDialog, setShowEditApiKeyDialog] = useState(false);
  const [showDeleteApiKeyDialog, setShowDeleteApiKeyDialog] = useState(false);
  const [showViewApiKeyDialog, setShowViewApiKeyDialog] = useState(false);
  const [editingApiKey, setEditingApiKey] = useState(null);
  const [deletingApiKey, setDeletingApiKey] = useState(null);
  const [viewingApiKey, setViewingApiKey] = useState(null);
  const [apiKeyFormData, setApiKeyFormData] = useState({
    name: '',
    description: '',
    permissions: [],
    expiresAt: '',
    isActive: true
  });

  // State for Webhooks
  const [showWebhookDialog, setShowWebhookDialog] = useState(false);
  const [showEditWebhookDialog, setShowEditWebhookDialog] = useState(false);
  const [showDeleteWebhookDialog, setShowDeleteWebhookDialog] = useState(false);
  const [editingWebhook, setEditingWebhook] = useState(null);
  const [deletingWebhook, setDeletingWebhook] = useState(null);
  const [webhookFormData, setWebhookFormData] = useState({
    name: '',
    url: '',
    description: '',
    events: [],
    secret: '',
    isActive: true,
    retryCount: 3,
    timeout: 30
  });

  // Available permissions for API keys
  const availablePermissions = [
    { id: 'read', name: 'Read Access', description: 'Membaca data dan informasi' },
    { id: 'write', name: 'Write Access', description: 'Membuat dan mengubah data' },
    { id: 'delete', name: 'Delete Access', description: 'Menghapus data' },
    { id: 'admin', name: 'Admin Access', description: 'Akses penuh ke sistem' }
  ];

  // Available webhook events
  const availableEvents = [
    { id: 'message.received', name: 'Message Received', description: 'Ketika pesan baru diterima' },
    { id: 'conversation.started', name: 'Conversation Started', description: 'Ketika percakapan dimulai' },
    { id: 'conversation.ended', name: 'Conversation Ended', description: 'Ketika percakapan berakhir' },
    { id: 'customer.updated', name: 'Customer Updated', description: 'Ketika data customer diperbarui' },
    { id: 'agent.assigned', name: 'Agent Assigned', description: 'Ketika agent ditugaskan' },
    { id: 'ticket.created', name: 'Ticket Created', description: 'Ketika ticket baru dibuat' }
  ];

  // Sample data untuk API Keys
  const [apiKeys, setApiKeys] = useState([
    { 
      id: 1, 
      name: 'Production API', 
      prefix: 'pk_live_', 
      key: 'pk_live_1234567890abcdef',
      description: 'API key untuk production environment',
      permissions: ['read', 'write'],
      created: '15 Mar 2024', 
      lastUsed: '2 jam lalu', 
      status: 'Aktif',
      expiresAt: '15 Mar 2025',
      usageCount: 1247
    },
    { 
      id: 2, 
      name: 'Development API', 
      prefix: 'pk_test_', 
      key: 'pk_test_0987654321fedcba',
      description: 'API key untuk development environment',
      permissions: ['read', 'write', 'delete'],
      created: '10 Mar 2024', 
      lastUsed: '1 hari lalu', 
      status: 'Aktif',
      expiresAt: '10 Mar 2025',
      usageCount: 892
    },
    { 
      id: 3, 
      name: 'Staging API', 
      prefix: 'pk_test_', 
      key: 'pk_test_staging123456',
      description: 'API key untuk staging environment',
      permissions: ['read'],
      created: '5 Mar 2024', 
      lastUsed: '3 hari lalu', 
      status: 'Nonaktif',
      expiresAt: '5 Mar 2025',
      usageCount: 156
    },
  ]);

  // Sample data untuk Webhooks
  const [webhooks, setWebhooks] = useState([
    { 
      id: 1, 
      name: 'Order Notifications', 
      url: 'https://api.company.com/webhook/orders', 
      description: 'Webhook untuk notifikasi order baru',
      events: ['message.received', 'conversation.ended'], 
      status: 'Aktif',
      secret: 'whsec_1234567890abcdef',
      retryCount: 3,
      timeout: 30,
      lastDelivery: '2 menit lalu',
      successRate: 98.5,
      totalDeliveries: 1247
    },
    { 
      id: 2, 
      name: 'Customer Updates', 
      url: 'https://crm.company.com/webhook', 
      description: 'Webhook untuk update data customer',
      events: ['customer.updated'], 
      status: 'Nonaktif',
      secret: 'whsec_0987654321fedcba',
      retryCount: 5,
      timeout: 45,
      lastDelivery: '1 jam lalu',
      successRate: 95.2,
      totalDeliveries: 892
    },
  ]);

  // API Key handlers
  const handleCreateApiKey = () => {
    setApiKeyFormData({
      name: '',
      description: '',
      permissions: [],
      expiresAt: '',
      isActive: true
    });
    setShowApiKeyDialog(true);
  };

  const handleEditApiKey = (apiKey) => {
    setEditingApiKey(apiKey);
    setApiKeyFormData({
      name: apiKey.name,
      description: apiKey.description,
      permissions: apiKey.permissions,
      expiresAt: apiKey.expiresAt,
      isActive: apiKey.status === 'Aktif'
    });
    setShowEditApiKeyDialog(true);
  };

  const handleViewApiKey = (apiKey) => {
    setViewingApiKey(apiKey);
    setShowViewApiKeyDialog(true);
  };

  const handleDeleteApiKey = (apiKey) => {
    setDeletingApiKey(apiKey);
    setShowDeleteApiKeyDialog(true);
  };

  const handleSubmitApiKey = (e) => {
    e.preventDefault();
    const newApiKey = {
      id: Date.now(),
      name: apiKeyFormData.name,
      description: apiKeyFormData.description,
      prefix: 'pk_test_',
      key: `pk_test_${Math.random().toString(36).substr(2, 9)}`,
      permissions: apiKeyFormData.permissions,
      created: new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }),
      lastUsed: 'Never',
      status: apiKeyFormData.isActive ? 'Aktif' : 'Nonaktif',
      expiresAt: apiKeyFormData.expiresAt,
      usageCount: 0
    };
    setApiKeys(prev => [...prev, newApiKey]);
    setShowApiKeyDialog(false);
  };

  const handleUpdateApiKey = (e) => {
    e.preventDefault();
    setApiKeys(prev => prev.map(key => 
      key.id === editingApiKey.id 
        ? {
            ...key,
            name: apiKeyFormData.name,
            description: apiKeyFormData.description,
            permissions: apiKeyFormData.permissions,
            status: apiKeyFormData.isActive ? 'Aktif' : 'Nonaktif',
            expiresAt: apiKeyFormData.expiresAt
          }
        : key
    ));
    setShowEditApiKeyDialog(false);
    setEditingApiKey(null);
  };

  const handleConfirmDeleteApiKey = () => {
    setApiKeys(prev => prev.filter(key => key.id !== deletingApiKey.id));
    setShowDeleteApiKeyDialog(false);
    setDeletingApiKey(null);
  };

  // Webhook handlers
  const handleCreateWebhook = () => {
    setWebhookFormData({
      name: '',
      url: '',
      description: '',
      events: [],
      secret: '',
      isActive: true,
      retryCount: 3,
      timeout: 30
    });
    setShowWebhookDialog(true);
  };

  const handleEditWebhook = (webhook) => {
    setEditingWebhook(webhook);
    setWebhookFormData({
      name: webhook.name,
      url: webhook.url,
      description: webhook.description,
      events: webhook.events,
      secret: webhook.secret,
      isActive: webhook.status === 'Aktif',
      retryCount: webhook.retryCount,
      timeout: webhook.timeout
    });
    setShowEditWebhookDialog(true);
  };

  const handleDeleteWebhook = (webhook) => {
    setDeletingWebhook(webhook);
    setShowDeleteWebhookDialog(true);
  };

  const handleSubmitWebhook = (e) => {
    e.preventDefault();
    const newWebhook = {
      id: Date.now(),
      name: webhookFormData.name,
      url: webhookFormData.url,
      description: webhookFormData.description,
      events: webhookFormData.events,
      status: webhookFormData.isActive ? 'Aktif' : 'Nonaktif',
      secret: `whsec_${Math.random().toString(36).substr(2, 9)}`,
      retryCount: webhookFormData.retryCount,
      timeout: webhookFormData.timeout,
      lastDelivery: 'Never',
      successRate: 0,
      totalDeliveries: 0
    };
    setWebhooks(prev => [...prev, newWebhook]);
    setShowWebhookDialog(false);
  };

  const handleUpdateWebhook = (e) => {
    e.preventDefault();
    setWebhooks(prev => prev.map(webhook => 
      webhook.id === editingWebhook.id 
        ? {
            ...webhook,
            name: webhookFormData.name,
            url: webhook.url,
            description: webhookFormData.description,
            events: webhookFormData.events,
            status: webhookFormData.isActive ? 'Aktif' : 'Nonaktif',
            retryCount: webhookFormData.retryCount,
            timeout: webhookFormData.timeout
          }
        : webhook
    ));
    setShowEditWebhookDialog(false);
    setEditingWebhook(null);
  };

  const handleConfirmDeleteWebhook = () => {
    setWebhooks(prev => prev.filter(webhook => webhook.id !== deletingWebhook.id));
    setShowDeleteWebhookDialog(false);
    setDeletingWebhook(null);
  };

  const closeDialogs = () => {
    setShowApiKeyDialog(false);
    setShowEditApiKeyDialog(false);
    setShowDeleteApiKeyDialog(false);
    setShowViewApiKeyDialog(false);
    setShowWebhookDialog(false);
    setShowEditWebhookDialog(false);
    setShowDeleteWebhookDialog(false);
    setEditingApiKey(null);
    setDeletingApiKey(null);
    setViewingApiKey(null);
    setEditingWebhook(null);
    setDeletingWebhook(null);
  };

  return (
    <div className="space-y-6">
      {/* API Keys Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="w-5 h-5" />
            API Keys
          </CardTitle>
          <CardDescription>Membuat, melihat prefix, dan menonaktifkan API key</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Kelola API keys untuk integrasi aplikasi</p>
            <Button onClick={handleCreateApiKey}>
              <Plus className="w-4 h-4 mr-2" />
              Create API Key
            </Button>
          </div>
          
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Prefix</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Last Used</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {apiKeys.map((apiKey) => (
                <TableRow key={apiKey.id}>
                  <TableCell className="font-medium">{apiKey.name}</TableCell>
                  <TableCell>
                    <code className="bg-muted px-2 py-1 rounded text-sm">{apiKey.prefix}***</code>
                  </TableCell>
                  <TableCell>{apiKey.created}</TableCell>
                  <TableCell className="text-muted-foreground">{apiKey.lastUsed}</TableCell>
                  <TableCell>
                    <Badge variant={apiKey.status === 'Aktif' ? 'default' : 'secondary'}>
                      {apiKey.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" title="Copy API Key">
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" title="View Details" onClick={() => handleViewApiKey(apiKey)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" title="Edit API Key" onClick={() => handleEditApiKey(apiKey)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" title="Delete API Key" onClick={() => handleDeleteApiKey(apiKey)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Webhooks Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Webhook className="w-5 h-5" />
            Webhooks
          </CardTitle>
          <CardDescription>Konfigurasi URL endpoint untuk menerima notifikasi event-driven</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Setup webhook endpoints untuk event notifications</p>
            <Button onClick={handleCreateWebhook}>
              <Plus className="w-4 h-4 mr-2" />
              Add Webhook
            </Button>
          </div>
          
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>URL</TableHead>
                <TableHead>Events</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {webhooks.map((webhook) => (
                <TableRow key={webhook.id}>
                  <TableCell className="font-medium">{webhook.name}</TableCell>
                  <TableCell>
                    <code className="bg-muted px-2 py-1 rounded text-xs">{webhook.url}</code>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {webhook.events.map((event, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {event}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={webhook.status === 'Aktif' ? 'default' : 'secondary'}>
                      {webhook.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" title="Edit Webhook" onClick={() => handleEditWebhook(webhook)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" title="Delete Webhook" onClick={() => handleDeleteWebhook(webhook)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* API Key Dialogs */}
      {/* Create API Key Dialog */}
      {showApiKeyDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-8">
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Key className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">Create New API Key</h3>
                    <p className="text-sm text-gray-600">Generate API key untuk integrasi aplikasi</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={closeDialogs} className="hover:bg-gray-100 rounded-full">
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <form onSubmit={handleSubmitApiKey} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nama API Key</Label>
                    <Input
                      id="name"
                      value={apiKeyFormData.name}
                      onChange={(e) => setApiKeyFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Production API"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="expiresAt">Tanggal Expired</Label>
                    <Input
                      id="expiresAt"
                      type="date"
                      value={apiKeyFormData.expiresAt}
                      onChange={(e) => setApiKeyFormData(prev => ({ ...prev, expiresAt: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Deskripsi</Label>
                  <Textarea
                    id="description"
                    value={apiKeyFormData.description}
                    onChange={(e) => setApiKeyFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Jelaskan tujuan penggunaan API key ini"
                    rows={3}
                  />
                </div>

                <div className="space-y-3">
                  <Label>Permissions</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {availablePermissions.map((permission) => (
                      <div key={permission.id} className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          id={permission.id}
                          checked={apiKeyFormData.permissions.includes(permission.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setApiKeyFormData(prev => ({
                                ...prev,
                                permissions: [...prev.permissions, permission.id]
                              }));
                            } else {
                              setApiKeyFormData(prev => ({
                                ...prev,
                                permissions: prev.permissions.filter(p => p !== permission.id)
                              }));
                            }
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <div>
                          <label htmlFor={permission.id} className="text-sm font-medium text-gray-900">
                            {permission.name}
                          </label>
                          <p className="text-xs text-gray-500">{permission.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Switch
                    id="isActive"
                    checked={apiKeyFormData.isActive}
                    onCheckedChange={(checked) => setApiKeyFormData(prev => ({ ...prev, isActive: checked }))}
                  />
                  <Label htmlFor="isActive">API Key aktif</Label>
                </div>

                <div className="flex gap-4 pt-6 border-t">
                  <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
                    <Save className="w-4 h-4 mr-2" />
                    Create API Key
                  </Button>
                  <Button type="button" variant="outline" onClick={closeDialogs} className="flex-1">
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit API Key Dialog */}
      {showEditApiKeyDialog && editingApiKey && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-8">
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <Edit className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">Edit API Key</h3>
                    <p className="text-sm text-gray-600">Update informasi API key</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={closeDialogs} className="hover:bg-gray-100 rounded-full">
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <form onSubmit={handleUpdateApiKey} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="edit-name">Nama API Key</Label>
                    <Input
                      id="edit-name"
                      value={apiKeyFormData.name}
                      onChange={(e) => setApiKeyFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Production API"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-expiresAt">Tanggal Expired</Label>
                    <Input
                      id="edit-expiresAt"
                      type="date"
                      value={apiKeyFormData.expiresAt}
                      onChange={(e) => setApiKeyFormData(prev => ({ ...prev, expiresAt: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-description">Deskripsi</Label>
                  <Textarea
                    id="edit-description"
                    value={apiKeyFormData.description}
                    onChange={(e) => setApiKeyFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Jelaskan tujuan penggunaan API key ini"
                    rows={3}
                  />
                </div>

                <div className="space-y-3">
                  <Label>Permissions</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {availablePermissions.map((permission) => (
                      <div key={permission.id} className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          id={`edit-${permission.id}`}
                          checked={apiKeyFormData.permissions.includes(permission.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setApiKeyFormData(prev => ({
                                ...prev,
                                permissions: [...prev.permissions, permission.id]
                              }));
                            } else {
                              setApiKeyFormData(prev => ({
                                ...prev,
                                permissions: prev.permissions.filter(p => p !== permission.id)
                              }));
                            }
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <div>
                          <label htmlFor={`edit-${permission.id}`} className="text-sm font-medium text-gray-900">
                            {permission.name}
                          </label>
                          <p className="text-xs text-gray-500">{permission.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Switch
                    id="edit-isActive"
                    checked={apiKeyFormData.isActive}
                    onCheckedChange={(checked) => setApiKeyFormData(prev => ({ ...prev, isActive: checked }))}
                  />
                  <Label htmlFor="edit-isActive">API Key aktif</Label>
                </div>

                <div className="flex gap-4 pt-6 border-t">
                  <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700">
                    <Save className="w-4 h-4 mr-2" />
                    Update API Key
                  </Button>
                  <Button type="button" variant="outline" onClick={closeDialogs} className="flex-1">
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* View API Key Dialog */}
      {showViewApiKeyDialog && viewingApiKey && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl">
            <div className="p-8">
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Eye className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">API Key Details</h3>
                    <p className="text-sm text-gray-600">Informasi lengkap API key</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={closeDialogs} className="hover:bg-gray-100 rounded-full">
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-sm font-medium text-gray-700">Full API Key</Label>
                    <Button variant="outline" size="sm" className="hover:bg-blue-50 hover:border-blue-300">
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </Button>
                  </div>
                  <code className="bg-white border rounded px-3 py-2 text-sm font-mono block w-full break-all">
                    {viewingApiKey.key}
                  </code>
                  <p className="text-xs text-gray-500 mt-2">⚠️ Simpan dengan aman, tidak akan ditampilkan lagi</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Nama</Label>
                      <p className="text-gray-900">{viewingApiKey.name}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Deskripsi</Label>
                      <p className="text-gray-900">{viewingApiKey.description}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Status</Label>
                      <Badge variant={viewingApiKey.status === 'Aktif' ? 'default' : 'secondary'}>
                        {viewingApiKey.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Dibuat</Label>
                      <p className="text-gray-900">{viewingApiKey.created}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Terakhir Digunakan</Label>
                      <p className="text-gray-900">{viewingApiKey.lastUsed}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Jumlah Penggunaan</Label>
                      <p className="text-gray-900">{viewingApiKey.usageCount.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-700">Permissions</Label>
                  <div className="flex flex-wrap gap-2">
                    {viewingApiKey.permissions.map((permission) => {
                      const perm = availablePermissions.find(p => p.id === permission);
                      return (
                        <Badge key={permission} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          {perm ? perm.name : permission}
                        </Badge>
                      );
                    })}
                  </div>
                </div>

                <div className="flex gap-4 pt-6 border-t">
                  <Button variant="outline" onClick={closeDialogs} className="flex-1">
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete API Key Dialog */}
      {showDeleteApiKeyDialog && deletingApiKey && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="p-8">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                </div>
              </div>

              <div className="text-center mb-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Delete API Key</h3>
                <p className="text-gray-600">Anda yakin ingin menghapus API key ini?</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="text-center">
                  <p className="font-medium text-gray-900">{deletingApiKey.name}</p>
                  <p className="text-sm text-gray-500">{deletingApiKey.description}</p>
                  <code className="text-xs text-gray-600 mt-1 block">{deletingApiKey.prefix}***</code>
                </div>
              </div>

              <Alert className="mb-6">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Peringatan:</strong> API key yang dihapus tidak dapat dipulihkan. Semua aplikasi yang menggunakan key ini akan berhenti berfungsi.
                </AlertDescription>
              </Alert>

              <div className="flex gap-4">
                <Button 
                  onClick={handleConfirmDeleteApiKey}
                  variant="destructive" 
                  className="flex-1"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete API Key
                </Button>
                <Button variant="outline" onClick={closeDialogs} className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Webhook Dialogs */}
      {/* Create Webhook Dialog */}
      {showWebhookDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-8">
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <Webhook className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">Create New Webhook</h3>
                    <p className="text-sm text-gray-600">Setup endpoint untuk menerima notifikasi event</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={closeDialogs} className="hover:bg-gray-100 rounded-full">
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <form onSubmit={handleSubmitWebhook} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="webhook-name">Nama Webhook</Label>
                    <Input
                      id="webhook-name"
                      value={webhookFormData.name}
                      onChange={(e) => setWebhookFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Order Notifications"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="webhook-url">URL Endpoint</Label>
                    <Input
                      id="webhook-url"
                      value={webhookFormData.url}
                      onChange={(e) => setWebhookFormData(prev => ({ ...prev, url: e.target.value }))}
                      placeholder="https://api.company.com/webhook"
                      type="url"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="webhook-description">Deskripsi</Label>
                  <Textarea
                    id="webhook-description"
                    value={webhookFormData.description}
                    onChange={(e) => setWebhookFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Jelaskan tujuan webhook ini"
                    rows={3}
                  />
                </div>

                <div className="space-y-3">
                  <Label>Events yang akan dikirim</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {availableEvents.map((event) => (
                      <div key={event.id} className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          id={event.id}
                          checked={webhookFormData.events.includes(event.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setWebhookFormData(prev => ({
                                ...prev,
                                events: [...prev.events, event.id]
                              }));
                            } else {
                              setWebhookFormData(prev => ({
                                ...prev,
                                events: prev.events.filter(e => e !== event.id)
                              }));
                            }
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <div>
                          <label htmlFor={event.id} className="text-sm font-medium text-gray-900">
                            {event.name}
                          </label>
                          <p className="text-xs text-gray-500">{event.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="retryCount">Jumlah Retry</Label>
                    <Select value={webhookFormData.retryCount.toString()} onValueChange={(value) => setWebhookFormData(prev => ({ ...prev, retryCount: parseInt(value) }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 kali</SelectItem>
                        <SelectItem value="3">3 kali</SelectItem>
                        <SelectItem value="5">5 kali</SelectItem>
                        <SelectItem value="10">10 kali</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timeout">Timeout (detik)</Label>
                    <Select value={webhookFormData.timeout.toString()} onValueChange={(value) => setWebhookFormData(prev => ({ ...prev, timeout: parseInt(value) }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 detik</SelectItem>
                        <SelectItem value="30">30 detik</SelectItem>
                        <SelectItem value="45">45 detik</SelectItem>
                        <SelectItem value="60">60 detik</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Switch
                    id="webhook-isActive"
                    checked={webhookFormData.isActive}
                    onCheckedChange={(checked) => setWebhookFormData(prev => ({ ...prev, isActive: checked }))}
                  />
                  <Label htmlFor="webhook-isActive">Webhook aktif</Label>
                </div>

                <div className="flex gap-4 pt-6 border-t">
                  <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700">
                    <Save className="w-4 h-4 mr-2" />
                    Create Webhook
                  </Button>
                  <Button type="button" variant="outline" onClick={closeDialogs} className="flex-1">
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Webhook Dialog */}
      {showEditWebhookDialog && editingWebhook && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-8">
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Edit className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">Edit Webhook</h3>
                    <p className="text-sm text-gray-600">Update konfigurasi webhook</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={closeDialogs} className="hover:bg-gray-100 rounded-full">
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <form onSubmit={handleUpdateWebhook} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="edit-webhook-name">Nama Webhook</Label>
                    <Input
                      id="edit-webhook-name"
                      value={webhookFormData.name}
                      onChange={(e) => setWebhookFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Order Notifications"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-webhook-url">URL Endpoint</Label>
                    <Input
                      id="edit-webhook-url"
                      value={webhookFormData.url}
                      onChange={(e) => setWebhookFormData(prev => ({ ...prev, url: e.target.value }))}
                      placeholder="https://api.company.com/webhook"
                      type="url"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-webhook-description">Deskripsi</Label>
                  <Textarea
                    id="edit-webhook-description"
                    value={webhookFormData.description}
                    onChange={(e) => setWebhookFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Jelaskan tujuan webhook ini"
                    rows={3}
                  />
                </div>

                <div className="space-y-3">
                  <Label>Events yang akan dikirim</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {availableEvents.map((event) => (
                      <div key={event.id} className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          id={`edit-${event.id}`}
                          checked={webhookFormData.events.includes(event.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setWebhookFormData(prev => ({
                                ...prev,
                                events: [...prev.events, event.id]
                              }));
                            } else {
                              setWebhookFormData(prev => ({
                                ...prev,
                                events: prev.events.filter(e => e !== event.id)
                              }));
                            }
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <div>
                          <label htmlFor={`edit-${event.id}`} className="text-sm font-medium text-gray-900">
                            {event.name}
                          </label>
                          <p className="text-xs text-gray-500">{event.description}</p>
                          <p className="text-xs text-gray-500">{event.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="edit-retryCount">Jumlah Retry</Label>
                    <Select value={webhookFormData.retryCount.toString()} onValueChange={(value) => setWebhookFormData(prev => ({ ...prev, retryCount: parseInt(value) }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 kali</SelectItem>
                        <SelectItem value="3">3 kali</SelectItem>
                        <SelectItem value="5">5 kali</SelectItem>
                        <SelectItem value="10">10 kali</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-timeout">Timeout (detik)</Label>
                    <Select value={webhookFormData.timeout.toString()} onValueChange={(value) => setWebhookFormData(prev => ({ ...prev, timeout: parseInt(value) }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 detik</SelectItem>
                        <SelectItem value="30">30 detik</SelectItem>
                        <SelectItem value="45">45 detik</SelectItem>
                        <SelectItem value="60">60 detik</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Switch
                    id="edit-webhook-isActive"
                    checked={webhookFormData.isActive}
                    onCheckedChange={(checked) => setWebhookFormData(prev => ({ ...prev, isActive: checked }))}
                  />
                  <Label htmlFor="edit-webhook-isActive">Webhook aktif</Label>
                </div>

                <div className="flex gap-4 pt-6 border-t">
                  <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
                    <Save className="w-4 h-4 mr-2" />
                    Update Webhook
                  </Button>
                  <Button type="button" variant="outline" onClick={closeDialogs} className="flex-1">
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Webhook Dialog */}
      {showDeleteWebhookDialog && deletingWebhook && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="p-8">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                </div>
              </div>

              <div className="text-center mb-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Delete Webhook</h3>
                <p className="text-gray-600">Anda yakin ingin menghapus webhook ini?</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="text-center">
                  <p className="font-medium text-gray-900">{deletingWebhook.name}</p>
                  <p className="text-sm text-gray-500">{deletingWebhook.description}</p>
                  <code className="text-xs text-gray-600 mt-1 block break-all">{deletingWebhook.url}</code>
                </div>
              </div>

              <Alert className="mb-6">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Peringatan:</strong> Webhook yang dihapus tidak dapat dipulihkan. Semua notifikasi event akan berhenti dikirim ke endpoint ini.
                </AlertDescription>
              </Alert>

              <div className="flex gap-4">
                <Button 
                  onClick={handleConfirmDeleteWebhook}
                  variant="destructive" 
                  className="flex-1"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Webhook
                </Button>
                <Button variant="outline" onClick={closeDialogs} className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeveloperTab;
