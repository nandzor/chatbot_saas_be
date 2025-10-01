import { useState, useEffect } from 'react';
import {Card, CardContent, CardDescription, CardHeader, CardTitle, Badge, Button, Input, Label, Select, SelectItem, Textarea, Switch, Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, Tabs, TabsContent, TabsList, TabsTrigger, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Skeleton, Alert, AlertDescription} from '@/components/ui';
import {
  User,
  Settings,
  Bell,
  MessageSquare,
  Camera,
  Edit,
  Trash2,
  Plus,
  Save,
  Eye,
  EyeOff,
  Volume2,
  Monitor,
  Smartphone,
  Mail,
  Clock,
  Zap,
  Copy,
  Star,
  Shield,
  RefreshCw,
  Download,
  AlertTriangle
} from 'lucide-react';
import { useAgentProfile } from '@/hooks/useAgentProfile';

const AgentProfile = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  // Use agent profile hook
  const {
    userProfile,
    agentInfo,
    agentStatistics,
    notificationPreferences,
    personalTemplates,
    uiPreferences,
    loading,
    isLoading,
    hasErrors,
    refresh,
    lastUpdated,
    updateProfile,
    updateAvailability,
    uploadAvatar,
    changePassword,
    updateNotificationPreferences,
    createPersonalTemplate,
    updatePersonalTemplate,
    deletePersonalTemplate,
    updateUIPreferences,
    exportUserData
  } = useAgentProfile({
    autoRefresh: true,
    refreshInterval: 60000, // 60 seconds
    onError: (type, error) => {
      console.error(`Error in ${type}:`, error);
    },
    onSuccess: (type, data) => {
      console.log(`Successfully loaded ${type}:`, data);
    }
  });

  // Local state for form data
  const [profileData, setProfileData] = useState({
    fullName: '',
    email: '',
    phone: '',
    avatar: null,
    bio: '',
    timezone: 'Asia/Jakarta',
    language: 'id'
  });

  const [availabilityData, setAvailabilityData] = useState({
    status: 'online',
    isAvailable: true,
    maxConcurrentChats: 5,
    workingHours: {
      start: '09:00',
      end: '18:00',
      timezone: 'Asia/Jakarta'
    },
    workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    awayMessage: 'Saya sedang tidak tersedia. Akan segera membalas pesan Anda.'
  });

  const [notificationSettings, setNotificationSettings] = useState({
    newMessage: { desktop: true, sound: true, email: false, mobile: true },
    sessionAssigned: { desktop: true, sound: true, email: true, mobile: true },
    urgentMessage: { desktop: true, sound: true, email: true, mobile: true },
    teamMention: { desktop: true, sound: false, email: false, mobile: true },
    systemAlert: { desktop: true, sound: false, email: true, mobile: false },
    soundVolume: 75,
    quietHours: { enabled: true, start: '22:00', end: '07:00' },
    emailDigest: { enabled: true, frequency: 'daily', time: '18:00' }
  });

  const [templateForm, setTemplateForm] = useState({
    title: '',
    category: '',
    content: '',
    tags: []
  });

  const [uiPrefs, setUiPrefs] = useState({
    theme: 'light',
    language: 'id',
    fontSize: 'medium',
    density: 'comfortable',
    showAvatars: true,
    showTimestamps: true,
    autoRefresh: true,
    refreshInterval: 30,
    chatLayout: 'bubbles',
    sidebarCollapsed: false
  });

  // Update local state when data is loaded
  useEffect(() => {
    if (userProfile) {
      setProfileData({
        fullName: userProfile.full_name || userProfile.name || '',
        email: userProfile.email || '',
        phone: userProfile.phone || '',
        avatar: userProfile.avatar_url || userProfile.avatar || null,
        bio: userProfile.bio || '',
        timezone: userProfile.timezone || 'Asia/Jakarta',
        language: userProfile.language || 'id'
      });
    }
  }, [userProfile]);

  useEffect(() => {
    if (agentInfo) {
      setAvailabilityData({
        status: agentInfo.status || 'online',
        isAvailable: agentInfo.is_available !== undefined ? agentInfo.is_available : true,
        maxConcurrentChats: agentInfo.max_concurrent_chats || agentInfo.max_concurrent_sessions || 5,
        workingHours: agentInfo.working_hours || {
          start: '09:00',
          end: '18:00',
          timezone: 'Asia/Jakarta'
        },
        workingDays: agentInfo.working_days || ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
        awayMessage: agentInfo.away_message || 'Saya sedang tidak tersedia. Akan segera membalas pesan Anda.'
      });
    }
  }, [agentInfo]);

  useEffect(() => {
    if (notificationPreferences) {
      setNotificationSettings(prev => ({
        ...prev,
        ...notificationPreferences
      }));
    }
  }, [notificationPreferences]);

  useEffect(() => {
    if (uiPreferences) {
      setUiPrefs(uiPreferences);
    }
  }, [uiPreferences]);

  const handleProfileUpdate = async () => {
    try {
      await updateProfile(profileData);
      // Profile will be automatically refreshed by the hook
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handlePasswordChange = async () => {
    try {
      const passwordData = {
        current_password: document.getElementById('currentPassword').value,
        new_password: document.getElementById('newPassword').value,
        new_password_confirmation: document.getElementById('confirmPassword').value
      };

      await changePassword(passwordData);

      // Clear password fields
      document.getElementById('currentPassword').value = '';
      document.getElementById('newPassword').value = '';
      document.getElementById('confirmPassword').value = '';
    } catch (error) {
      console.error('Error changing password:', error);
    }
  };

  const handleAvatarUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        await uploadAvatar(file);
        // Avatar will be automatically refreshed by the hook
      } catch (error) {
        console.error('Error uploading avatar:', error);
      }
    }
  };

  const handleTemplateSubmit = async () => {
    try {
      if (editingTemplate) {
        await updatePersonalTemplate(editingTemplate.id, templateForm);
      } else {
        await createPersonalTemplate(templateForm);
      }

      setTemplateForm({ title: '', category: '', content: '', tags: [] });
      setEditingTemplate(null);
      setIsTemplateDialogOpen(false);
    } catch (error) {
      console.error('Error saving template:', error);
    }
  };

  const handleTemplateEdit = (template) => {
    setEditingTemplate(template);
    setTemplateForm({
      title: template.title,
      category: template.category,
      content: template.content,
      tags: template.tags
    });
    setIsTemplateDialogOpen(true);
  };

  const handleTemplateDelete = async (templateId) => {
    try {
      await deletePersonalTemplate(templateId);
    } catch (error) {
      console.error('Error deleting template:', error);
    }
  };

  const handleTemplateUse = (template) => {
    // Logic to insert template into active chat
    // This would typically copy the template content to clipboard or insert into active chat
    navigator.clipboard.writeText(template.content);
  };

  const handleAvailabilityUpdate = async () => {
    try {
      await updateAvailability(availabilityData);
    } catch (error) {
      console.error('Error updating availability:', error);
    }
  };

  const handleExportData = async () => {
    try {
      const data = await exportUserData('json');
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `user-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };

  const handleRefresh = () => {
    refresh('all');
  };

  const getAvailabilityStatusColor = (status) => {
    const colors = {
      online: 'bg-green-500',
      away: 'bg-yellow-500',
      busy: 'bg-red-500',
      offline: 'bg-gray-500'
    };
    return colors[status] || colors.offline;
  };

  const templateCategories = [
    { value: 'greeting', label: 'Salam Pembuka' },
    { value: 'technical', label: 'Teknis' },
    { value: 'billing', label: 'Billing' },
    { value: 'escalation', label: 'Eskalasi' },
    { value: 'closing', label: 'Penutup' },
    { value: 'general', label: 'Umum' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Profile & Settings</h1>
          <p className="text-gray-600">Kelola profil dan preferensi akun Anda</p>
          {lastUpdated && (
            <p className="text-xs text-gray-400 mt-1">
              Terakhir update: {lastUpdated.toLocaleTimeString('id-ID')}
            </p>
          )}
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <div className="flex items-center space-x-2">
            {loading.agentInfo ? (
              <Skeleton className="w-3 h-3 rounded-full" />
            ) : (
              <div className={`w-3 h-3 rounded-full ${getAvailabilityStatusColor(availabilityData.status)}`}></div>
            )}
            <Select
              value={availabilityData.status}
              onValueChange={(value) => {
                setAvailabilityData(prev => ({ ...prev, status: value }));
                handleAvailabilityUpdate();
              }}
              disabled={loading.agentInfo}
            >
              <SelectItem value="online">Online</SelectItem>
              <SelectItem value="away">Away</SelectItem>
              <SelectItem value="busy">Busy</SelectItem>
              <SelectItem value="offline">Offline</SelectItem>
            </Select>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {hasErrors && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Terjadi kesalahan saat memuat data profil. Beberapa data mungkin tidak tersedia.
            <Button variant="link" onClick={handleRefresh} className="ml-2 p-0 h-auto">
              Coba lagi
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Profile Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile" className="flex items-center space-x-2">
            <User className="w-4 h-4" />
            <span>Profile</span>
          </TabsTrigger>
          <TabsTrigger value="availability" className="flex items-center space-x-2">
            <Clock className="w-4 h-4" />
            <span>Availability</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center space-x-2">
            <Bell className="w-4 h-4" />
            <span>Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center space-x-2">
            <MessageSquare className="w-4 h-4" />
            <span>Templates</span>
          </TabsTrigger>
          <TabsTrigger value="preferences" className="flex items-center space-x-2">
            <Settings className="w-4 h-4" />
            <span>Preferences</span>
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <div className="grid grid-cols-3 gap-6">
            {/* Profile Information */}
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your personal information and contact details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fullName">Full Name</Label>
                    {loading.userProfile ? (
                      <Skeleton className="h-10 w-full" />
                    ) : (
                      <Input
                        id="fullName"
                        value={profileData.fullName}
                        onChange={(e) => setProfileData(prev => ({ ...prev, fullName: e.target.value }))}
                      />
                    )}
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    {loading.userProfile ? (
                      <Skeleton className="h-10 w-full" />
                    ) : (
                      <Input
                        id="email"
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                      />
                    )}
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    {loading.userProfile ? (
                      <Skeleton className="h-10 w-full" />
                    ) : (
                      <Input
                        id="phone"
                        value={profileData.phone}
                        onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                      />
                    )}
                  </div>
                  <div>
                    <Label htmlFor="bio">Bio</Label>
                    {loading.userProfile ? (
                      <Skeleton className="h-10 w-full" />
                    ) : (
                      <Input
                        id="bio"
                        value={profileData.bio}
                        onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                        placeholder="Tell us about yourself"
                      />
                    )}
                  </div>
                  <div>
                    <Label htmlFor="timezone">Timezone</Label>
                    {loading.userProfile ? (
                      <Skeleton className="h-10 w-full" />
                    ) : (
                      <Select
                        value={profileData.timezone}
                        onValueChange={(value) => setProfileData(prev => ({ ...prev, timezone: value }))}
                      >
                        <SelectItem value="Asia/Jakarta">Asia/Jakarta (WIB)</SelectItem>
                        <SelectItem value="Asia/Makassar">Asia/Makassar (WITA)</SelectItem>
                        <SelectItem value="Asia/Jayapura">Asia/Jayapura (WIT)</SelectItem>
                      </Select>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="language">Language</Label>
                    {loading.userProfile ? (
                      <Skeleton className="h-10 w-full" />
                    ) : (
                      <Select
                        value={profileData.language}
                        onValueChange={(value) => setProfileData(prev => ({ ...prev, language: value }))}
                      >
                        <SelectItem value="id">🇮🇩 Bahasa Indonesia</SelectItem>
                        <SelectItem value="en">🇺🇸 English</SelectItem>
                      </Select>
                    )}
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline">Cancel</Button>
                  <Button onClick={handleProfileUpdate}>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Avatar & Quick Info */}
            <Card>
              <CardHeader>
                <CardTitle>Profile Picture</CardTitle>
                <CardDescription>Upload your profile picture</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative">
                    <div className="w-24 h-24 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden">
                      {profileData.avatar ? (
                        <img src={profileData.avatar} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-12 h-12 text-gray-600" />
                      )}
                    </div>
                    <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 p-1 bg-blue-600 rounded-full cursor-pointer hover:bg-blue-700">
                      <Camera className="w-4 h-4 text-white" />
                      <input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <div className="text-center">
                    {loading.userProfile ? (
                      <>
                        <Skeleton className="h-6 w-32 mx-auto mb-2" />
                        <Skeleton className="h-4 w-24 mx-auto mb-2" />
                        <Skeleton className="h-6 w-16 mx-auto" />
                      </>
                    ) : (
                      <>
                        <h3 className="font-medium">{profileData.fullName || 'Unknown User'}</h3>
                        <p className="text-sm text-gray-600">{agentInfo?.department || 'Agent'}</p>
                        <Badge variant="blue" className="mt-2">{agentInfo?.id?.slice(-8) || 'N/A'}</Badge>
                      </>
                    )}
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="space-y-3 pt-4 border-t">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Timezone</span>
                    {loading.userProfile ? (
                      <Skeleton className="h-4 w-20" />
                    ) : (
                      <span>{profileData.timezone}</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Language</span>
                    {loading.userProfile ? (
                      <Skeleton className="h-4 w-16" />
                    ) : (
                      <span>{profileData.language === 'id' ? 'Indonesian' : 'English'}</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Status</span>
                    {loading.agentInfo ? (
                      <Skeleton className="h-4 w-16" />
                    ) : (
                      <div className="flex items-center space-x-1">
                        <div className={`w-2 h-2 rounded-full ${getAvailabilityStatusColor(availabilityData.status)}`}></div>
                        <span className="capitalize">{availabilityData.status}</span>
                      </div>
                    )}
                  </div>
                  {agentStatistics && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Avg Rating</span>
                      <div className="flex items-center space-x-1">
                        <Star className="w-3 h-3 text-yellow-500 fill-current" />
                        <span>{agentStatistics.performance?.avg_rating?.toFixed(1) || '0.0'}</span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Password Change */}
          <Card>
            <CardHeader>
              <CardTitle>Security</CardTitle>
              <CardDescription>Change your password and security settings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter current password"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-2 h-6 w-6 p-0"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter new password"
                  />
                </div>
                <div>
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Confirm new password"
                  />
                </div>
              </div>
              <div className="flex justify-end mt-4">
                <Button onClick={handlePasswordChange}>
                  <Shield className="w-4 h-4 mr-2" />
                  Change Password
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Availability Tab */}
        <TabsContent value="availability" className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            {/* Current Status */}
            <Card>
              <CardHeader>
                <CardTitle>Current Status</CardTitle>
                <CardDescription>Manage your availability status</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={availabilityData.status} onValueChange={(value) => setAvailabilityData(prev => ({ ...prev, status: value }))}>
                    18528
                    <SelectItem value="online">🟢 Online</SelectItem>
                      <SelectItem value="away">🟡 Away</SelectItem>
                      <SelectItem value="busy">🔴 Busy</SelectItem>
                      <SelectItem value="offline">⚫ Offline</SelectItem>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="awayMessage">Away Message</Label>
                  <Textarea
                    id="awayMessage"
                    value={availabilityData.awayMessage}
                    onChange={(e) => setAvailabilityData(prev => ({ ...prev, awayMessage: e.target.value }))}
                    rows={3}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">Auto Status Change</Label>
                    <p className="text-sm text-gray-600">Automatically change status based on activity</p>
                  </div>
                  <Switch
                    checked={availabilityData.autoStatusChange}
                    onCheckedChange={(checked) => setAvailabilityData(prev => ({ ...prev, autoStatusChange: checked }))}
                  />
                </div>

                <div>
                  <Label htmlFor="maxChats">Max Concurrent Chats</Label>
                  <Input
                    id="maxChats"
                    type="number"
                    min="1"
                    max="10"
                    value={availabilityData.maxConcurrentChats}
                    onChange={(e) => setAvailabilityData(prev => ({ ...prev, maxConcurrentChats: parseInt(e.target.value) }))}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Working Hours */}
            <Card>
              <CardHeader>
                <CardTitle>Working Hours</CardTitle>
                <CardDescription>Set your regular working schedule</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startTime">Start Time</Label>
                    <Input
                      id="startTime"
                      type="time"
                      value={availabilityData.workingHours.start}
                      onChange={(e) => setAvailabilityData(prev => ({
                        ...prev,
                        workingHours: { ...prev.workingHours, start: e.target.value }
                      }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="endTime">End Time</Label>
                    <Input
                      id="endTime"
                      type="time"
                      value={availabilityData.workingHours.end}
                      onChange={(e) => setAvailabilityData(prev => ({
                        ...prev,
                        workingHours: { ...prev.workingHours, end: e.target.value }
                      }))}
                    />
                  </div>
                </div>

                <div>
                  <Label>Working Days</Label>
                  <div className="grid grid-cols-7 gap-2 mt-2">
                    {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => {
                      const dayLabels = {
                        monday: 'Sen', tuesday: 'Sel', wednesday: 'Rab', thursday: 'Kam',
                        friday: 'Jum', saturday: 'Sab', sunday: 'Min'
                      };

                      return (
                        <Button
                          key={day}
                          variant={availabilityData.workingDays.includes(day) ? 'default' : 'outline'}
                          size="sm"
                          className="h-8"
                          onClick={() => {
                            setAvailabilityData(prev => ({
                              ...prev,
                              workingDays: prev.workingDays.includes(day)
                                ? prev.workingDays.filter(d => d !== day)
                                : [...prev.workingDays, day]
                            }));
                          }}
                        >
                          {dayLabels[day]}
                        </Button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select value={availabilityData.workingHours.timezone}>
              <SelectItem value="Asia/Jakarta">Asia/Jakarta (WIB)</SelectItem>
                      <SelectItem value="Asia/Makassar">Asia/Makassar (WITA)</SelectItem>
                      <SelectItem value="Asia/Jayapura">Asia/Jayapura (WIT)</SelectItem>
</Select>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            {/* Notification Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Choose how you want to receive notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {Object.entries(notificationSettings).filter(([key]) => !['soundVolume', 'quietHours', 'emailDigest'].includes(key)).map(([key, settings]) => (
                  <div key={key} className="space-y-3">
                    <h4 className="font-medium text-sm capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </h4>
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={settings.desktop}
                          onCheckedChange={(checked) => setNotificationSettings(prev => ({
                            ...prev,
                            [key]: { ...prev[key], desktop: checked }
                          }))}
                        />
                        <Monitor className="w-4 h-4" />
                        <span>Desktop</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={settings.sound}
                          onCheckedChange={(checked) => setNotificationSettings(prev => ({
                            ...prev,
                            [key]: { ...prev[key], sound: checked }
                          }))}
                        />
                        <Volume2 className="w-4 h-4" />
                        <span>Sound</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={settings.email}
                          onCheckedChange={(checked) => setNotificationSettings(prev => ({
                            ...prev,
                            [key]: { ...prev[key], email: checked }
                          }))}
                        />
                        <Mail className="w-4 h-4" />
                        <span>Email</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={settings.mobile}
                          onCheckedChange={(checked) => setNotificationSettings(prev => ({
                            ...prev,
                            [key]: { ...prev[key], mobile: checked }
                          }))}
                        />
                        <Smartphone className="w-4 h-4" />
                        <span>Mobile</span>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Advanced Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Advanced Settings</CardTitle>
                <CardDescription>Fine-tune your notification experience</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="soundVolume">Sound Volume ({notificationSettings.soundVolume}%)</Label>
                  <input
                    id="soundVolume"
                    type="range"
                    min="0"
                    max="100"
                    value={notificationSettings.soundVolume}
                    onChange={(e) => setNotificationSettings(prev => ({ ...prev, soundVolume: parseInt(e.target.value) }))}
                    className="w-full mt-2"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <Label className="font-medium">Quiet Hours</Label>
                      <p className="text-sm text-gray-600">Disable notifications during specific hours</p>
                    </div>
                    <Switch
                      checked={notificationSettings.quietHours?.enabled ?? false}
                      onCheckedChange={(checked) => setNotificationSettings(prev => ({
                        ...prev,
                        quietHours: { ...prev.quietHours, enabled: checked }
                      }))}
                    />
                  </div>

                  {notificationSettings.quietHours?.enabled && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="quietStart">Start</Label>
                        <Input
                          id="quietStart"
                          type="time"
                          value={notificationSettings.quietHours?.start ?? '22:00'}
                          onChange={(e) => setNotificationSettings(prev => ({
                            ...prev,
                            quietHours: { ...prev.quietHours, start: e.target.value }
                          }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="quietEnd">End</Label>
                        <Input
                          id="quietEnd"
                          type="time"
                          value={notificationSettings.quietHours?.end ?? '07:00'}
                          onChange={(e) => setNotificationSettings(prev => ({
                            ...prev,
                            quietHours: { ...prev.quietHours, end: e.target.value }
                          }))}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <Label className="font-medium">Email Digest</Label>
                      <p className="text-sm text-gray-600">Receive summary of activities</p>
                    </div>
                    <Switch
                      checked={notificationSettings.emailDigest?.enabled ?? false}
                      onCheckedChange={(checked) => setNotificationSettings(prev => ({
                        ...prev,
                        emailDigest: { ...prev.emailDigest, enabled: checked }
                      }))}
                    />
                  </div>

                  {notificationSettings.emailDigest?.enabled && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="digestFreq">Frequency</Label>
                        <Select
                          value={notificationSettings.emailDigest?.frequency ?? 'daily'}
                          onValueChange={(value) => setNotificationSettings(prev => ({
                            ...prev,
                            emailDigest: { ...prev.emailDigest, frequency: value }
                          }))}
                        >
                          31244
                          <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="digestTime">Time</Label>
                        <Input
                          id="digestTime"
                          type="time"
                          value={notificationSettings.emailDigest?.time ?? '18:00'}
                          onChange={(e) => setNotificationSettings(prev => ({
                            ...prev,
                            emailDigest: { ...prev.emailDigest, time: e.target.value }
                          }))}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Personal Templates</h3>
              <p className="text-sm text-gray-600">Create and manage your custom response templates</p>
            </div>
            <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  New Template
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{editingTemplate ? 'Edit Template' : 'Create New Template'}</DialogTitle>
                  <DialogDescription>
                    Create a reusable template for common responses
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="templateTitle">Title</Label>
                      <Input
                        id="templateTitle"
                        placeholder="Template name"
                        value={templateForm.title}
                        onChange={(e) => setTemplateForm(prev => ({ ...prev, title: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="templateCategory">Category</Label>
                      <Select value={templateForm.category} onValueChange={(value) => setTemplateForm(prev => ({ ...prev, category: value }))}>
                        34279
                        {templateCategories.map(cat => (
                            <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                          ))}
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="templateContent">Content</Label>
                    <Textarea
                      id="templateContent"
                      placeholder="Enter your template content..."
                      rows={6}
                      value={templateForm.content}
                      onChange={(e) => setTemplateForm(prev => ({ ...prev, content: e.target.value }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="templateTags">Tags (comma separated)</Label>
                    <Input
                      id="templateTags"
                      placeholder="e.g., greeting, technical, urgent"
                      value={templateForm.tags.join(', ')}
                      onChange={(e) => setTemplateForm(prev => ({
                        ...prev,
                        tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag)
                      }))}
                    />
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsTemplateDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleTemplateSubmit}>
                      {editingTemplate ? 'Update' : 'Create'} Template
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Template</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Usage</TableHead>
                    <TableHead>Last Used</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading.personalTemplates ? (
                    Array.from({ length: 3 }).map((_, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Skeleton className="h-6 w-32 mb-2" />
                          <Skeleton className="h-4 w-48 mb-2" />
                          <div className="flex space-x-1">
                            <Skeleton className="h-5 w-16" />
                            <Skeleton className="h-5 w-20" />
                          </div>
                        </TableCell>
                        <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-12" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Skeleton className="h-8 w-8" />
                            <Skeleton className="h-8 w-8" />
                            <Skeleton className="h-8 w-8" />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : personalTemplates?.data?.length > 0 ? (
                    personalTemplates.data.map((template) => (
                      <TableRow key={template.id}>
                        <TableCell>
                          <div>
                            <h4 className="font-medium text-gray-900">{template.title}</h4>
                            <p className="text-sm text-gray-600 truncate max-w-xs">
                              {template.content}
                            </p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {template.tags?.map(tag => (
                                <Badge key={tag} variant="gray" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="blue" className="text-xs">
                            {templateCategories.find(cat => cat.value === template.category)?.label || template.category}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <Zap className="w-4 h-4 text-gray-400" />
                            <span className="text-sm">{template.usage_count || 0}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-600">
                            {template.last_used
                              ? new Date(template.last_used).toLocaleDateString('id-ID')
                              : 'Never'
                            }
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm" onClick={() => handleTemplateUse(template)}>
                              <Copy className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleTemplateEdit(template)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleTemplateDelete(template.id)} className="text-red-600">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                        <MessageSquare className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                        <p className="text-sm">Tidak ada template tersedia</p>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preferences Tab */}
        <TabsContent value="preferences" className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            {/* UI Preferences */}
            <Card>
              <CardHeader>
                <CardTitle>Interface Preferences</CardTitle>
                <CardDescription>Customize your workspace appearance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="theme">Theme</Label>
                  <Select value={uiPrefs.theme} onValueChange={(value) => setUiPrefs(prev => ({ ...prev, theme: value }))}>
                    40312
                    <SelectItem value="light">🌞 Light</SelectItem>
                      <SelectItem value="dark">🌙 Dark</SelectItem>
                      <SelectItem value="auto">🔄 Auto</SelectItem>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="language">Language</Label>
                  <Select value={uiPrefs.language} onValueChange={(value) => setUiPrefs(prev => ({ ...prev, language: value }))}>
                    40979
                    <SelectItem value="id">🇮🇩 Bahasa Indonesia</SelectItem>
                      <SelectItem value="en">🇺🇸 English</SelectItem>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="fontSize">Font Size</Label>
                  <Select value={uiPrefs.fontSize} onValueChange={(value) => setUiPrefs(prev => ({ ...prev, fontSize: value }))}>
                    41592
                    <SelectItem value="small">Small</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="large">Large</SelectItem>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="density">Density</Label>
                  <Select value={uiPrefs.density} onValueChange={(value) => setUiPrefs(prev => ({ ...prev, density: value }))}>
                    42252
                    <SelectItem value="compact">Compact</SelectItem>
                      <SelectItem value="comfortable">Comfortable</SelectItem>
                      <SelectItem value="spacious">Spacious</SelectItem>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Chat Preferences */}
            <Card>
              <CardHeader>
                <CardTitle>Chat Preferences</CardTitle>
                <CardDescription>Customize your chat experience</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">Show Avatars</Label>
                    <p className="text-sm text-gray-600">Display profile pictures in chat</p>
                  </div>
                  <Switch
                    checked={uiPrefs.showAvatars}
                    onCheckedChange={(checked) => setUiPrefs(prev => ({ ...prev, showAvatars: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">Show Timestamps</Label>
                    <p className="text-sm text-gray-600">Display message timestamps</p>
                  </div>
                  <Switch
                    checked={uiPrefs.showTimestamps}
                    onCheckedChange={(checked) => setUiPrefs(prev => ({ ...prev, showTimestamps: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">Auto Refresh</Label>
                    <p className="text-sm text-gray-600">Automatically refresh data</p>
                  </div>
                  <Switch
                    checked={uiPrefs.autoRefresh}
                    onCheckedChange={(checked) => setUiPrefs(prev => ({ ...prev, autoRefresh: checked }))}
                  />
                </div>

                {uiPrefs.autoRefresh && (
                  <div>
                    <Label htmlFor="refreshInterval">Refresh Interval (seconds)</Label>
                    <Input
                      id="refreshInterval"
                      type="number"
                      min="10"
                      max="300"
                      value={uiPrefs.refreshInterval}
                      onChange={(e) => setUiPrefs(prev => ({ ...prev, refreshInterval: parseInt(e.target.value) }))}
                    />
                  </div>
                )}

                <div>
                  <Label htmlFor="chatLayout">Chat Layout</Label>
                  <Select value={uiPrefs.chatLayout} onValueChange={(value) => setUiPrefs(prev => ({ ...prev, chatLayout: value }))}>
                    45439
                    <SelectItem value="bubbles">Message Bubbles</SelectItem>
                      <SelectItem value="compact">Compact View</SelectItem>
                      <SelectItem value="threaded">Threaded View</SelectItem>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Export Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Data & Export</CardTitle>
              <CardDescription>Manage your data and export preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Export Settings</h4>
                  <p className="text-sm text-gray-600">Download your personal data and settings</p>
                </div>
                <Button variant="outline" onClick={handleExportData}>
                  <Download className="w-4 h-4 mr-2" />
                  Export Data
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AgentProfile;
