import React, { useState, useEffect } from 'react';
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
  Textarea,
  Switch,
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui';
import { 
  User,
  Settings,
  Bell,
  MessageSquare,
  Upload,
  Camera,
  Edit,
  Trash2,
  Plus,
  Save,
  Eye,
  EyeOff,
  Volume2,
  VolumeX,
  Monitor,
  Smartphone,
  Mail,
  Clock,
  Zap,
  Copy,
  FileText,
  Star,
  Calendar,
  Globe,
  Shield,
  Palette,
  Moon,
  Sun,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Download
} from 'lucide-react';

const AgentProfile = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);

  // Profile data
  const [profileData, setProfileData] = useState({
    fullName: 'Sarah Johnson',
    email: 'sarah.johnson@company.com',
    phone: '+62812345678',
    avatar: null,
    jobTitle: 'Senior Customer Success Agent',
    department: 'Customer Support',
    employeeId: 'EMP-001',
    startDate: '2023-01-15',
    location: 'Jakarta, Indonesia',
    timezone: 'Asia/Jakarta'
  });

  // Availability settings
  const [availabilityData, setAvailabilityData] = useState({
    status: 'online',
    autoStatusChange: true,
    maxConcurrentChats: 5,
    workingHours: {
      start: '09:00',
      end: '18:00',
      timezone: 'Asia/Jakarta'
    },
    workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    breakMode: false,
    awayMessage: 'Saya sedang tidak tersedia. Akan segera membalas pesan Anda.'
  });

  // Notification preferences
  const [notificationSettings, setNotificationSettings] = useState({
    newMessage: {
      desktop: true,
      sound: true,
      email: false,
      mobile: true
    },
    sessionAssigned: {
      desktop: true,
      sound: true,
      email: true,
      mobile: true
    },
    urgentMessage: {
      desktop: true,
      sound: true,
      email: true,
      mobile: true
    },
    teamMention: {
      desktop: true,
      sound: false,
      email: false,
      mobile: true
    },
    systemAlert: {
      desktop: true,
      sound: false,
      email: true,
      mobile: false
    },
    soundVolume: 75,
    quietHours: {
      enabled: true,
      start: '22:00',
      end: '07:00'
    },
    emailDigest: {
      enabled: true,
      frequency: 'daily',
      time: '18:00'
    }
  });

  // Personal templates
  const [personalTemplates, setPersonalTemplates] = useState([
    {
      id: 'temp-001',
      title: 'Salam Pembuka',
      category: 'greeting',
      content: 'Halo! Saya Sarah dari tim Customer Support. Saya akan membantu Anda hari ini. Ada yang bisa saya bantu?',
      tags: ['greeting', 'introduction'],
      usageCount: 45,
      lastUsed: '2024-01-25T10:30:00Z',
      createdAt: '2024-01-10T14:20:00Z'
    },
    {
      id: 'temp-002',
      title: 'Konfirmasi Masalah Teknis',
      category: 'technical',
      content: 'Terima kasih telah melaporkan masalah ini. Saya sedang mengecek sistem dan akan segera memberikan solusi. Mohon ditunggu sebentar ya.',
      tags: ['technical', 'acknowledgment'],
      usageCount: 32,
      lastUsed: '2024-01-24T15:45:00Z',
      createdAt: '2024-01-12T09:15:00Z'
    },
    {
      id: 'temp-003',
      title: 'Eskalasi ke Tim Teknis',
      category: 'escalation',
      content: 'Untuk masalah ini, saya perlu menghubungkan Anda dengan tim teknis kami yang lebih spesialis. Mereka akan segera menghubungi Anda dalam 30 menit.',
      tags: ['escalation', 'technical'],
      usageCount: 18,
      lastUsed: '2024-01-23T11:20:00Z',
      createdAt: '2024-01-15T16:30:00Z'
    },
    {
      id: 'temp-004',
      title: 'Penutup Positif',
      category: 'closing',
      content: 'Senang bisa membantu Anda! Jika ada pertanyaan lain, jangan ragu untuk menghubungi kami kembali. Semoga harinya menyenangkan! 😊',
      tags: ['closing', 'positive'],
      usageCount: 67,
      lastUsed: '2024-01-25T14:10:00Z',
      createdAt: '2024-01-08T11:45:00Z'
    }
  ]);

  // Template form data
  const [templateForm, setTemplateForm] = useState({
    title: '',
    category: '',
    content: '',
    tags: []
  });

  // UI preferences
  const [uiPreferences, setUiPreferences] = useState({
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

  const handleProfileUpdate = () => {
    // Logic to update profile
    console.log('Profile updated:', profileData);
  };

  const handlePasswordChange = () => {
    // Logic to change password
    console.log('Password change requested');
  };

  const handleAvatarUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setAvatarFile(file);
      // Here you would typically upload to server
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileData(prev => ({ ...prev, avatar: e.target.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTemplateSubmit = () => {
    if (editingTemplate) {
      // Update existing template
      setPersonalTemplates(templates => 
        templates.map(t => 
          t.id === editingTemplate.id 
            ? { ...t, ...templateForm, lastModified: new Date().toISOString() }
            : t
        )
      );
    } else {
      // Create new template
      const newTemplate = {
        id: `temp-${Date.now()}`,
        ...templateForm,
        usageCount: 0,
        lastUsed: null,
        createdAt: new Date().toISOString()
      };
      setPersonalTemplates(templates => [newTemplate, ...templates]);
    }
    
    setTemplateForm({ title: '', category: '', content: '', tags: [] });
    setEditingTemplate(null);
    setIsTemplateDialogOpen(false);
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

  const handleTemplateDelete = (templateId) => {
    setPersonalTemplates(templates => templates.filter(t => t.id !== templateId));
  };

  const handleTemplateUse = (template) => {
    // Logic to insert template into active chat
    setPersonalTemplates(templates => 
      templates.map(t => 
        t.id === template.id 
          ? { ...t, usageCount: t.usageCount + 1, lastUsed: new Date().toISOString() }
          : t
      )
    );
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
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${getAvailabilityStatusColor(availabilityData.status)}`}></div>
            <Select value={availabilityData.status} onValueChange={(value) => setAvailabilityData(prev => ({ ...prev, status: value }))}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="online">Online</SelectItem>
                <SelectItem value="away">Away</SelectItem>
                <SelectItem value="busy">Busy</SelectItem>
                <SelectItem value="offline">Offline</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

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
                    <Input
                      id="fullName"
                      value={profileData.fullName}
                      onChange={(e) => setProfileData(prev => ({ ...prev, fullName: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={profileData.phone}
                      onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="jobTitle">Job Title</Label>
                    <Input
                      id="jobTitle"
                      value={profileData.jobTitle}
                      onChange={(e) => setProfileData(prev => ({ ...prev, jobTitle: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="department">Department</Label>
                    <Input
                      id="department"
                      value={profileData.department}
                      onChange={(e) => setProfileData(prev => ({ ...prev, department: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={profileData.location}
                      onChange={(e) => setProfileData(prev => ({ ...prev, location: e.target.value }))}
                    />
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
                    <h3 className="font-medium">{profileData.fullName}</h3>
                    <p className="text-sm text-gray-600">{profileData.jobTitle}</p>
                    <Badge variant="blue" className="mt-2">{profileData.employeeId}</Badge>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="space-y-3 pt-4 border-t">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Start Date</span>
                    <span>{new Date(profileData.startDate).toLocaleDateString('id-ID')}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Timezone</span>
                    <span>{profileData.timezone}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Status</span>
                    <div className="flex items-center space-x-1">
                      <div className={`w-2 h-2 rounded-full ${getAvailabilityStatusColor(availabilityData.status)}`}></div>
                      <span className="capitalize">{availabilityData.status}</span>
                    </div>
                  </div>
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
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="online">🟢 Online</SelectItem>
                      <SelectItem value="away">🟡 Away</SelectItem>
                      <SelectItem value="busy">🔴 Busy</SelectItem>
                      <SelectItem value="offline">⚫ Offline</SelectItem>
                    </SelectContent>
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
                      checked={notificationSettings.quietHours.enabled}
                      onCheckedChange={(checked) => setNotificationSettings(prev => ({
                        ...prev,
                        quietHours: { ...prev.quietHours, enabled: checked }
                      }))}
                    />
                  </div>
                  
                  {notificationSettings.quietHours.enabled && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="quietStart">Start</Label>
                        <Input
                          id="quietStart"
                          type="time"
                          value={notificationSettings.quietHours.start}
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
                          value={notificationSettings.quietHours.end}
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
                      checked={notificationSettings.emailDigest.enabled}
                      onCheckedChange={(checked) => setNotificationSettings(prev => ({
                        ...prev,
                        emailDigest: { ...prev.emailDigest, enabled: checked }
                      }))}
                    />
                  </div>
                  
                  {notificationSettings.emailDigest.enabled && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="digestFreq">Frequency</Label>
                        <Select 
                          value={notificationSettings.emailDigest.frequency}
                          onValueChange={(value) => setNotificationSettings(prev => ({
                            ...prev,
                            emailDigest: { ...prev.emailDigest, frequency: value }
                          }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="digestTime">Time</Label>
                        <Input
                          id="digestTime"
                          type="time"
                          value={notificationSettings.emailDigest.time}
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
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {templateCategories.map(cat => (
                            <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                          ))}
                        </SelectContent>
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
                  {personalTemplates.map((template) => (
                    <TableRow key={template.id}>
                      <TableCell>
                        <div>
                          <h4 className="font-medium text-gray-900">{template.title}</h4>
                          <p className="text-sm text-gray-600 truncate max-w-xs">
                            {template.content}
                          </p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {template.tags.map(tag => (
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
                          <span className="text-sm">{template.usageCount}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">
                          {template.lastUsed 
                            ? new Date(template.lastUsed).toLocaleDateString('id-ID')
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
                  ))}
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
                  <Select value={uiPreferences.theme} onValueChange={(value) => setUiPreferences(prev => ({ ...prev, theme: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">🌞 Light</SelectItem>
                      <SelectItem value="dark">🌙 Dark</SelectItem>
                      <SelectItem value="auto">🔄 Auto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="language">Language</Label>
                  <Select value={uiPreferences.language} onValueChange={(value) => setUiPreferences(prev => ({ ...prev, language: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="id">🇮🇩 Bahasa Indonesia</SelectItem>
                      <SelectItem value="en">🇺🇸 English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="fontSize">Font Size</Label>
                  <Select value={uiPreferences.fontSize} onValueChange={(value) => setUiPreferences(prev => ({ ...prev, fontSize: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Small</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="large">Large</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="density">Density</Label>
                  <Select value={uiPreferences.density} onValueChange={(value) => setUiPreferences(prev => ({ ...prev, density: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="compact">Compact</SelectItem>
                      <SelectItem value="comfortable">Comfortable</SelectItem>
                      <SelectItem value="spacious">Spacious</SelectItem>
                    </SelectContent>
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
                    checked={uiPreferences.showAvatars}
                    onCheckedChange={(checked) => setUiPreferences(prev => ({ ...prev, showAvatars: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">Show Timestamps</Label>
                    <p className="text-sm text-gray-600">Display message timestamps</p>
                  </div>
                  <Switch
                    checked={uiPreferences.showTimestamps}
                    onCheckedChange={(checked) => setUiPreferences(prev => ({ ...prev, showTimestamps: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">Auto Refresh</Label>
                    <p className="text-sm text-gray-600">Automatically refresh data</p>
                  </div>
                  <Switch
                    checked={uiPreferences.autoRefresh}
                    onCheckedChange={(checked) => setUiPreferences(prev => ({ ...prev, autoRefresh: checked }))}
                  />
                </div>

                {uiPreferences.autoRefresh && (
                  <div>
                    <Label htmlFor="refreshInterval">Refresh Interval (seconds)</Label>
                    <Input
                      id="refreshInterval"
                      type="number"
                      min="10"
                      max="300"
                      value={uiPreferences.refreshInterval}
                      onChange={(e) => setUiPreferences(prev => ({ ...prev, refreshInterval: parseInt(e.target.value) }))}
                    />
                  </div>
                )}

                <div>
                  <Label htmlFor="chatLayout">Chat Layout</Label>
                  <Select value={uiPreferences.chatLayout} onValueChange={(value) => setUiPreferences(prev => ({ ...prev, chatLayout: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bubbles">Message Bubbles</SelectItem>
                      <SelectItem value="compact">Compact View</SelectItem>
                      <SelectItem value="threaded">Threaded View</SelectItem>
                    </SelectContent>
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
                <Button variant="outline">
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