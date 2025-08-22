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
  Alert,
  AlertDescription,
  Separator
} from '@/components/ui';
import { 
  ArrowLeft,
  Save,
  Settings,
  Clock,
  Globe,
  MessageSquare,
  Shield,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

const PlatformConfiguration = ({ platformId, onBack, onSave }) => {
  // Sample platform data - in real app this would come from API/props
  const [config, setConfig] = useState({
    name: 'CS Tim Marketing',
    description: 'WhatsApp inbox untuk tim marketing menangani inquiry produk dan penjualan',
    workingHours: {
      enabled: true,
      start: '09:00',
      end: '17:00',
      timezone: 'Asia/Jakarta',
      workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
    },
    autoReply: {
      enabled: true,
      welcomeMessage: 'Halo! Terima kasih telah menghubungi CS Marketing kami. Bagaimana kami bisa membantu Anda hari ini?',
      awayMessage: 'Terima kasih atas pesan Anda. Saat ini kami sedang di luar jam kerja. Kami akan merespons pesan Anda pada jam kerja berikutnya.',
      busyMessage: 'Semua agent kami sedang sibuk melayani pelanggan lain. Mohon tunggu sebentar, kami akan segera merespons.'
    },
    language: 'id',
    maxConcurrentChats: 5,
    chatTimeout: 30,
    notifications: {
      newMessage: true,
      agentAssignment: true,
      escalation: true,
      emailNotifications: true
    },
    security: {
      requireAuth: false,
      allowedDomains: [],
      blockSpam: true,
      rateLimiting: true
    }
  });

  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const handleInputChange = (section, field, value) => {
    setConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
    setHasChanges(true);
  };

  const handleDirectChange = (field, value) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));
    setHasChanges(true);
  };

  const handleWorkingDayToggle = (day) => {
    const currentDays = config.workingHours.workingDays;
    const newDays = currentDays.includes(day) 
      ? currentDays.filter(d => d !== day)
      : [...currentDays, day];
    
    handleInputChange('workingHours', 'workingDays', newDays);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (onSave) {
        onSave(config);
      }
      
      setHasChanges(false);
      // Show success message
    } catch (error) {
      console.error('Failed to save configuration:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const workingDays = [
    { key: 'monday', label: 'Senin' },
    { key: 'tuesday', label: 'Selasa' },
    { key: 'wednesday', label: 'Rabu' },
    { key: 'thursday', label: 'Kamis' },
    { key: 'friday', label: 'Jumat' },
    { key: 'saturday', label: 'Sabtu' },
    { key: 'sunday', label: 'Minggu' }
  ];

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
            <h1 className="text-2xl font-bold">Platform Configuration</h1>
            <p className="text-muted-foreground">Configure settings for your platform connection</p>
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
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Configuration */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Basic Settings
              </CardTitle>
              <CardDescription>Configure basic platform information and settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Platform Name</Label>
                  <Input
                    id="name"
                    value={config.name}
                    onChange={(e) => handleDirectChange('name', e.target.value)}
                    placeholder="Enter platform name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Select value={config.language} onValueChange={(value) => handleDirectChange('language', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="id">Bahasa Indonesia</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="ms">Bahasa Malaysia</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={config.description}
                  onChange={(e) => handleDirectChange('description', e.target.value)}
                  placeholder="Describe the purpose of this platform"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maxChats">Max Concurrent Chats per Agent</Label>
                  <Input
                    id="maxChats"
                    type="number"
                    value={config.maxConcurrentChats}
                    onChange={(e) => handleDirectChange('maxConcurrentChats', parseInt(e.target.value))}
                    min="1"
                    max="20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timeout">Chat Timeout (minutes)</Label>
                  <Input
                    id="timeout"
                    type="number"
                    value={config.chatTimeout}
                    onChange={(e) => handleDirectChange('chatTimeout', parseInt(e.target.value))}
                    min="5"
                    max="120"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Working Hours */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Working Hours
              </CardTitle>
              <CardDescription>Set operating hours and availability</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="working-hours"
                  checked={config.workingHours.enabled}
                  onCheckedChange={(checked) => handleInputChange('workingHours', 'enabled', checked)}
                />
                <Label htmlFor="working-hours">Enable working hours</Label>
              </div>
              
              {config.workingHours.enabled && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="start-time">Start Time</Label>
                      <Input
                        id="start-time"
                        type="time"
                        value={config.workingHours.start}
                        onChange={(e) => handleInputChange('workingHours', 'start', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="end-time">End Time</Label>
                      <Input
                        id="end-time"
                        type="time"
                        value={config.workingHours.end}
                        onChange={(e) => handleInputChange('workingHours', 'end', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="timezone">Timezone</Label>
                      <Select 
                        value={config.workingHours.timezone} 
                        onValueChange={(value) => handleInputChange('workingHours', 'timezone', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Asia/Jakarta">Asia/Jakarta (WIB)</SelectItem>
                          <SelectItem value="Asia/Makassar">Asia/Makassar (WITA)</SelectItem>
                          <SelectItem value="Asia/Jayapura">Asia/Jayapura (WIT)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Working Days</Label>
                    <div className="flex flex-wrap gap-2">
                      {workingDays.map((day) => (
                        <div key={day.key} className="flex items-center space-x-2">
                          <Switch
                            id={day.key}
                            checked={config.workingHours.workingDays.includes(day.key)}
                            onCheckedChange={() => handleWorkingDayToggle(day.key)}
                          />
                          <Label htmlFor={day.key} className="text-sm">{day.label}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Auto Reply Messages */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Auto Reply Messages
              </CardTitle>
              <CardDescription>Configure automatic messages for different scenarios</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="auto-reply"
                  checked={config.autoReply.enabled}
                  onCheckedChange={(checked) => handleInputChange('autoReply', 'enabled', checked)}
                />
                <Label htmlFor="auto-reply">Enable auto reply</Label>
              </div>

              {config.autoReply.enabled && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="welcome-message">Welcome Message</Label>
                    <Textarea
                      id="welcome-message"
                      value={config.autoReply.welcomeMessage}
                      onChange={(e) => handleInputChange('autoReply', 'welcomeMessage', e.target.value)}
                      placeholder="Message sent when customer starts a conversation"
                      rows={3}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="away-message">Away Message</Label>
                    <Textarea
                      id="away-message"
                      value={config.autoReply.awayMessage}
                      onChange={(e) => handleInputChange('autoReply', 'awayMessage', e.target.value)}
                      placeholder="Message sent outside working hours"
                      rows={3}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="busy-message">Busy Message</Label>
                    <Textarea
                      id="busy-message"
                      value={config.autoReply.busyMessage}
                      onChange={(e) => handleInputChange('autoReply', 'busyMessage', e.target.value)}
                      placeholder="Message sent when all agents are busy"
                      rows={3}
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Security Settings
              </CardTitle>
              <CardDescription>Configure security and access control settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Block Spam Messages</Label>
                    <p className="text-sm text-muted-foreground">Automatically filter spam and suspicious messages</p>
                  </div>
                  <Switch
                    checked={config.security.blockSpam}
                    onCheckedChange={(checked) => handleInputChange('security', 'blockSpam', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Rate Limiting</Label>
                    <p className="text-sm text-muted-foreground">Limit message frequency from same contact</p>
                  </div>
                  <Switch
                    checked={config.security.rateLimiting}
                    onCheckedChange={(checked) => handleInputChange('security', 'rateLimiting', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>Configure notification preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="new-message" className="text-sm">New Messages</Label>
                  <Switch
                    id="new-message"
                    checked={config.notifications.newMessage}
                    onCheckedChange={(checked) => handleInputChange('notifications', 'newMessage', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="assignment" className="text-sm">Agent Assignment</Label>
                  <Switch
                    id="assignment"
                    checked={config.notifications.agentAssignment}
                    onCheckedChange={(checked) => handleInputChange('notifications', 'agentAssignment', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="escalation" className="text-sm">Escalations</Label>
                  <Switch
                    id="escalation"
                    checked={config.notifications.escalation}
                    onCheckedChange={(checked) => handleInputChange('notifications', 'escalation', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="email" className="text-sm">Email Notifications</Label>
                  <Switch
                    id="email"
                    checked={config.notifications.emailNotifications}
                    onCheckedChange={(checked) => handleInputChange('notifications', 'emailNotifications', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Configuration Status */}
          <Card>
            <CardHeader>
              <CardTitle>Configuration Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Basic settings configured</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Working hours set</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Auto-reply enabled</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Security settings active</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Help & Tips */}
          <Card>
            <CardHeader>
              <CardTitle>Configuration Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm text-muted-foreground">
                <p>• Set working hours to manage customer expectations</p>
                <p>• Use auto-reply to provide immediate responses</p>
                <p>• Enable security features to protect from spam</p>
                <p>• Configure notifications to stay updated</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Save Alert */}
      {hasChanges && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-700">
            You have unsaved changes. Don't forget to save your configuration.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default PlatformConfiguration;
