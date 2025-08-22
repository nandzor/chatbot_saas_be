import React, { useState } from 'react';
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Input,
  Label,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea
} from '@/components/ui';
import { 
  MessageSquare, 
  Plus, 
  Key, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  X, 
  Save,
  Globe,
  Phone,
  Mail,
  Instagram,
  Twitter,
  Linkedin,
  Youtube,
  AlertCircle,
  Info
} from 'lucide-react';

const ChannelsTab = ({ channels, showApiKey, setShowApiKey }) => {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editingChannel, setEditingChannel] = useState(null);
  const [deletingChannel, setDeletingChannel] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    description: '',
    apiToken: '',
    webhookUrl: '',
    phoneNumber: '',
    appId: '',
    appSecret: '',
    pageId: '',
    accessToken: '',
    enableWebhook: true,
    enableNotifications: true
  });

  const channelTypes = [
    { 
      id: 'whatsapp', 
      name: 'WhatsApp Business', 
      icon: MessageSquare,
      description: 'Connect your WhatsApp Business account',
      fields: ['apiToken', 'phoneNumber', 'webhookUrl']
    },
    { 
      id: 'webchat', 
      name: 'Website Chat Widget', 
      icon: Globe,
      description: 'Embed chat widget on your website',
      fields: ['webhookUrl']
    },
    { 
      id: 'facebook', 
      name: 'Facebook Messenger', 
      icon: MessageSquare,
      description: 'Connect your Facebook Page',
      fields: ['pageId', 'accessToken', 'appSecret']
    },
    { 
      id: 'instagram', 
      name: 'Instagram Direct', 
      icon: Instagram,
      description: 'Connect Instagram Business account',
      fields: ['pageId', 'accessToken']
    },
    { 
      id: 'email', 
      name: 'Email Support', 
      icon: Mail,
      description: 'Handle customer emails',
      fields: ['webhookUrl']
    },
    { 
      id: 'sms', 
      name: 'SMS Gateway', 
      icon: Phone,
      description: 'Send and receive SMS messages',
      fields: ['apiToken', 'phoneNumber']
    }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Channel data:', formData);
    // Here you would typically send the data to your API
    setShowAddDialog(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: '',
      description: '',
      apiToken: '',
      webhookUrl: '',
      phoneNumber: '',
      appId: '',
      appSecret: '',
      pageId: '',
      accessToken: '',
      enableWebhook: true,
      enableNotifications: true
    });
  };

  const closeDialog = () => {
    setShowAddDialog(false);
    resetForm();
  };

  const handleEditChannel = (channel) => {
    setEditingChannel(channel);
    
    // Map channel type from display name to id
    const getChannelTypeId = (type) => {
      const typeMap = {
        'WhatsApp': 'whatsapp',
        'Web Widget': 'webchat',
        'Facebook': 'facebook',
        'Instagram': 'instagram',
        'Email': 'email',
        'SMS': 'sms'
      };
      return typeMap[type] || 'webchat';
    };

    // Populate form with existing channel data
    setFormData({
      name: channel.name,
      type: getChannelTypeId(channel.type),
      description: channel.description || '',
      apiToken: '••••••••••••••••', // Masked for security
      webhookUrl: channel.webhookUrl || 'https://your-domain.com/webhook',
      phoneNumber: channel.phoneNumber || '',
      appId: channel.appId || '',
      appSecret: '••••••••••••••••', // Masked for security
      pageId: channel.pageId || '',
      accessToken: '••••••••••••••••', // Masked for security
      enableWebhook: channel.enableWebhook !== false,
      enableNotifications: channel.enableNotifications !== false
    });
    
    setShowEditDialog(true);
  };

  const closeEditDialog = () => {
    setShowEditDialog(false);
    setEditingChannel(null);
    resetForm();
  };

  const handleUpdateChannel = (e) => {
    e.preventDefault();
    console.log('Updating channel:', editingChannel.id, formData);
    // Here you would typically send the updated data to your API
    setShowEditDialog(false);
    setEditingChannel(null);
    resetForm();
  };

  const handleDeleteChannel = (channel) => {
    setDeletingChannel(channel);
    setShowDeleteDialog(true);
  };

  const confirmDeleteChannel = () => {
    console.log('Deleting channel:', deletingChannel.id);
    // Here you would typically send the delete request to your API
    setShowDeleteDialog(false);
    setDeletingChannel(null);
  };

  const closeDeleteDialog = () => {
    setShowDeleteDialog(false);
    setDeletingChannel(null);
  };

  const selectedChannelType = channelTypes.find(type => type.id === formData.type);

  const renderFieldsByType = () => {
    if (!selectedChannelType) return null;

    return selectedChannelType.fields.map(field => {
      switch (field) {
        case 'apiToken':
          return (
            <div key={field} className="space-y-2">
              <Label htmlFor={field}>API Token *</Label>
              <Input
                id={field}
                type="password"
                placeholder="Enter your API token"
                value={formData[field]}
                onChange={(e) => handleInputChange(field, e.target.value)}
                required
              />
            </div>
          );
        case 'phoneNumber':
          return (
            <div key={field} className="space-y-2">
              <Label htmlFor={field}>Phone Number *</Label>
              <Input
                id={field}
                placeholder="+62 812-3456-7890"
                value={formData[field]}
                onChange={(e) => handleInputChange(field, e.target.value)}
                required
              />
            </div>
          );
        case 'webhookUrl':
          return (
            <div key={field} className="space-y-2">
              <Label htmlFor={field}>Webhook URL</Label>
              <Input
                id={field}
                placeholder="https://your-domain.com/webhook"
                value={formData[field]}
                onChange={(e) => handleInputChange(field, e.target.value)}
              />
            </div>
          );
        case 'pageId':
          return (
            <div key={field} className="space-y-2">
              <Label htmlFor={field}>Page ID *</Label>
              <Input
                id={field}
                placeholder="Your Facebook/Instagram Page ID"
                value={formData[field]}
                onChange={(e) => handleInputChange(field, e.target.value)}
                required
              />
            </div>
          );
        case 'accessToken':
          return (
            <div key={field} className="space-y-2">
              <Label htmlFor={field}>Access Token *</Label>
              <Input
                id={field}
                type="password"
                placeholder="Page access token"
                value={formData[field]}
                onChange={(e) => handleInputChange(field, e.target.value)}
                required
              />
            </div>
          );
        case 'appSecret':
          return (
            <div key={field} className="space-y-2">
              <Label htmlFor={field}>App Secret *</Label>
              <Input
                id={field}
                type="password"
                placeholder="Facebook App Secret"
                value={formData[field]}
                onChange={(e) => handleInputChange(field, e.target.value)}
                required
              />
            </div>
          );
        default:
          return null;
      }
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Channel Configurations
              </CardTitle>
              <CardDescription>Kelola channel_configs yang aktif dan konfigurasi kredensial API</CardDescription>
            </div>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Channel
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[150px]">Nama Channel</TableHead>
                  <TableHead className="min-w-[120px]">Tipe</TableHead>
                  <TableHead className="min-w-[100px]">Status</TableHead>
                  <TableHead className="min-w-[150px]">Terakhir Digunakan</TableHead>
                  <TableHead className="min-w-[100px]">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {channels.map((channel) => (
                  <TableRow key={channel.id}>
                    <TableCell className="font-medium">{channel.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{channel.type}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={channel.status === 'Aktif' ? 'default' : 'secondary'}>
                        {channel.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{channel.lastUsed}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEditChannel(channel)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDeleteChannel(channel)}
                          className="text-red-600 hover:text-red-700 hover:border-red-300"
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="w-5 h-5" />
            API Credentials & Webhook
          </CardTitle>
          <CardDescription>Konfigurasi kredensial API dan webhook untuk integrasi channel</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label htmlFor="whatsapp-token">WhatsApp Business Token</Label>
              <div className="flex gap-2">
                <Input 
                  id="whatsapp-token" 
                  type={showApiKey ? "text" : "password"}
                  defaultValue="EAABwzLixnjYBOZB..." 
                  className="flex-1"
                />
                <Button variant="outline" size="sm" onClick={() => setShowApiKey(!showApiKey)}>
                  {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </div>
            <div className="space-y-3">
              <Label htmlFor="facebook-app-secret">Facebook App Secret</Label>
              <div className="flex gap-2">
                <Input 
                  id="facebook-app-secret" 
                  type="password"
                  defaultValue="**********************" 
                  className="flex-1"
                />
                <Button variant="outline" size="sm">
                  <Eye className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <Label htmlFor="webhook-url">Webhook URL</Label>
            <Input 
              id="webhook-url" 
              defaultValue="https://your-domain.com/api/webhook"
              placeholder="https://your-domain.com/webhook" 
            />
          </div>

          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1 flex-1">
              <Label>Enable Webhook Verification</Label>
              <p className="text-sm text-muted-foreground">Verifikasi webhook untuk keamanan tambahan</p>
            </div>
            <Switch defaultChecked className="mt-1" />
          </div>
        </CardContent>
      </Card>

      {/* Add Channel Dialog */}
      {showAddDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Dialog Header */}
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Add New Channel</h2>
                <Button variant="ghost" size="sm" onClick={closeDialog}>
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Channel Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">Channel Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Main WhatsApp, Support Chat"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required
                  />
                </div>

                {/* Channel Type Selection */}
                <div className="space-y-2">
                  <Label htmlFor="type">Channel Type *</Label>
                  <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a channel type" />
                    </SelectTrigger>
                    <SelectContent>
                      {channelTypes.map((type) => {
                        const IconComponent = type.icon;
                        return (
                          <SelectItem key={type.id} value={type.id}>
                            <div className="flex items-center gap-2">
                              <IconComponent className="w-4 h-4" />
                              <span>{type.name}</span>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  {selectedChannelType && (
                    <p className="text-sm text-gray-600">{selectedChannelType.description}</p>
                  )}
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Brief description of this channel's purpose"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={3}
                  />
                </div>

                {/* Dynamic Fields Based on Channel Type */}
                {formData.type && (
                  <div className="space-y-4">
                    <div className="border-t pt-4">
                      <h3 className="text-lg font-medium mb-4">Configuration</h3>
                      <div className="grid grid-cols-1 gap-4">
                        {renderFieldsByType()}
                      </div>
                    </div>
                  </div>
                )}

                {/* Settings */}
                {formData.type && (
                  <div className="space-y-4">
                    <div className="border-t pt-4">
                      <h3 className="text-lg font-medium mb-4">Settings</h3>
                      
                      {/* Enable Webhook */}
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Enable Webhook</Label>
                          <p className="text-sm text-gray-600">
                            Automatically receive messages via webhook
                          </p>
                        </div>
                        <Switch
                          checked={formData.enableWebhook}
                          onCheckedChange={(checked) => handleInputChange('enableWebhook', checked)}
                        />
                      </div>

                      {/* Enable Notifications */}
                      <div className="flex items-center justify-between mt-4">
                        <div className="space-y-0.5">
                          <Label>Enable Notifications</Label>
                          <p className="text-sm text-gray-600">
                            Send notifications for new messages
                          </p>
                        </div>
                        <Switch
                          checked={formData.enableNotifications}
                          onCheckedChange={(checked) => handleInputChange('enableNotifications', checked)}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Info Alert */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-blue-900">Setup Information</p>
                      <p className="text-blue-700 mt-1">
                        After creating this channel, you'll need to configure the webhook endpoint in your platform's settings. 
                        We'll provide you with the specific webhook URL and verification token.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-6 border-t">
                  <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
                    <Save className="w-4 h-4 mr-2" />
                    Create Channel
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={closeDialog}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Channel Dialog */}
      {showEditDialog && editingChannel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Dialog Header */}
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Edit Channel</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Editing: <span className="font-medium">{editingChannel.name}</span>
                  </p>
                </div>
                <Button variant="ghost" size="sm" onClick={closeEditDialog}>
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <form onSubmit={handleUpdateChannel} className="space-y-6">
                {/* Channel Name */}
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Channel Name *</Label>
                  <Input
                    id="edit-name"
                    placeholder="e.g., Main WhatsApp, Support Chat"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required
                  />
                </div>

                {/* Channel Type Selection - Read Only in Edit Mode */}
                <div className="space-y-2">
                  <Label htmlFor="edit-type">Channel Type</Label>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 border rounded-md">
                    {selectedChannelType && (
                      <>
                        <selectedChannelType.icon className="w-5 h-5 text-gray-600" />
                        <div>
                          <p className="font-medium text-gray-900">{selectedChannelType.name}</p>
                          <p className="text-sm text-gray-600">{selectedChannelType.description}</p>
                        </div>
                      </>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    Channel type cannot be changed after creation
                  </p>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="edit-description">Description</Label>
                  <Textarea
                    id="edit-description"
                    placeholder="Brief description of this channel's purpose"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={3}
                  />
                </div>

                {/* Current Configuration Display */}
                {formData.type && (
                  <div className="space-y-4">
                    <div className="border-t pt-4">
                      <h3 className="text-lg font-medium mb-4">Current Configuration</h3>
                      
                      {/* Status Indicator */}
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <div>
                            <p className="font-medium text-green-900">Channel is Active</p>
                            <p className="text-sm text-green-700">
                              Last activity: {editingChannel.lastUsed}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-4">
                        {renderFieldsByType()}
                        
                        {/* Additional Edit-specific fields */}
                        <div className="space-y-2">
                          <Label>Current Status</Label>
                          <div className="flex items-center gap-2">
                            <Badge variant={editingChannel.status === 'Aktif' ? 'default' : 'secondary'}>
                              {editingChannel.status}
                            </Badge>
                            <span className="text-sm text-gray-600">
                              • Created: {new Date().toLocaleDateString('id-ID')}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Settings */}
                {formData.type && (
                  <div className="space-y-4">
                    <div className="border-t pt-4">
                      <h3 className="text-lg font-medium mb-4">Settings</h3>
                      
                      {/* Enable Webhook */}
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Enable Webhook</Label>
                          <p className="text-sm text-gray-600">
                            Automatically receive messages via webhook
                          </p>
                        </div>
                        <Switch
                          checked={formData.enableWebhook}
                          onCheckedChange={(checked) => handleInputChange('enableWebhook', checked)}
                        />
                      </div>

                      {/* Enable Notifications */}
                      <div className="flex items-center justify-between mt-4">
                        <div className="space-y-0.5">
                          <Label>Enable Notifications</Label>
                          <p className="text-sm text-gray-600">
                            Send notifications for new messages
                          </p>
                        </div>
                        <Switch
                          checked={formData.enableNotifications}
                          onCheckedChange={(checked) => handleInputChange('enableNotifications', checked)}
                        />
                      </div>

                      {/* Test Connection Button */}
                      <div className="flex items-center justify-between mt-4 pt-4 border-t">
                        <div className="space-y-0.5">
                          <Label>Connection Test</Label>
                          <p className="text-sm text-gray-600">
                            Test the current channel configuration
                          </p>
                        </div>
                        <Button type="button" variant="outline" size="sm">
                          Test Connection
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Warning Alert for Sensitive Data */}
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-amber-900">Security Notice</p>
                      <p className="text-amber-700 mt-1">
                        For security reasons, sensitive data like API tokens and secrets are masked. 
                        Only update these fields if you need to change the credentials.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-6 border-t">
                  <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
                    <Save className="w-4 h-4 mr-2" />
                    Update Channel
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={closeEditDialog}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Channel Confirmation Dialog */}
      {showDeleteDialog && deletingChannel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="p-6">
              {/* Dialog Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Delete Channel</h2>
                  <p className="text-sm text-gray-600">This action cannot be undone</p>
                </div>
              </div>

              {/* Channel Information */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{deletingChannel.name}</p>
                    <p className="text-sm text-gray-600">{deletingChannel.type}</p>
                  </div>
                </div>
              </div>

              {/* Warning Message */}
              <div className="space-y-3 mb-6">
                <p className="text-gray-700">
                  Are you sure you want to delete this channel? This will:
                </p>
                <ul className="text-sm text-gray-600 space-y-1 ml-4">
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-1">•</span>
                    <span>Permanently remove the channel configuration</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-1">•</span>
                    <span>Stop all incoming messages from this channel</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-1">•</span>
                    <span>Disable webhook endpoints and integrations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-1">•</span>
                    <span>Remove access for assigned agents</span>
                  </li>
                </ul>
              </div>

              {/* Current Status Info */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-6">
                <div className="flex items-center gap-2 text-sm">
                  <Info className="w-4 h-4 text-amber-600" />
                  <span className="text-amber-800">
                    <strong>Current Status:</strong> {deletingChannel.status} • 
                    Last used: {deletingChannel.lastUsed}
                  </span>
                </div>
              </div>

              {/* Confirmation Input */}
              <div className="space-y-3 mb-6">
                <Label htmlFor="delete-confirmation" className="text-sm font-medium">
                  Type <span className="font-mono bg-gray-100 px-1 rounded">DELETE</span> to confirm:
                </Label>
                <Input
                  id="delete-confirmation"
                  placeholder="Type DELETE to confirm"
                  className="font-mono"
                  onChange={(e) => {
                    const deleteButton = document.getElementById('confirm-delete-btn');
                    if (e.target.value === 'DELETE') {
                      deleteButton.disabled = false;
                      deleteButton.classList.remove('opacity-50', 'cursor-not-allowed');
                    } else {
                      deleteButton.disabled = true;
                      deleteButton.classList.add('opacity-50', 'cursor-not-allowed');
                    }
                  }}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  id="confirm-delete-btn"
                  onClick={confirmDeleteChannel}
                  disabled={true}
                  className="flex-1 bg-red-600 hover:bg-red-700 opacity-50 cursor-not-allowed"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Channel
                </Button>
                <Button
                  variant="outline"
                  onClick={closeDeleteDialog}
                  className="flex-1"
                >
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

export default ChannelsTab;
