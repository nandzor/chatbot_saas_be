import React, { useState, useEffect } from 'react';
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
  Textarea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
  Separator,
  Alert,
  AlertDescription,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Progress,
  Avatar,
  AvatarFallback,
  AvatarImage,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui';
import { 
  User,
  Mail,
  Phone,
  Lock,
  Shield,
  Bell,
  Globe,
  Palette,
  Camera,
  Trash2,
  Save,
  Eye,
  EyeOff,
  CheckCircle,
  AlertTriangle,
  Smartphone,
  Monitor,
  MapPin,
  Clock,
  LogOut,
  Settings,
  Key,
  Smartphone as DeviceIcon
} from 'lucide-react';

const ProfileSettings = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isAvatarDialogOpen, setIsAvatarDialogOpen] = useState(false);
  
  // Profile data state
  const [profileData, setProfileData] = useState({
    fullName: 'John Doe',
    email: 'john.doe@company.com',
    phone: '+62 812-3456-7890',
    avatarUrl: null
  });

  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Interface preferences state
  const [preferences, setPreferences] = useState({
    language: 'id',
    theme: 'auto',
    notifications: {
      email: {
        weeklyReport: true,
        billing: true,
        securityAlerts: true
      },
      inApp: {
        newTeamMember: true,
        integrationStatus: true
      }
    }
  });

  // Active sessions state
  const [activeSessions, setActiveSessions] = useState([
    {
      id: 'session-1',
      device: 'Chrome on Windows',
      location: 'Jakarta, Indonesia',
      lastActive: '2024-01-15T10:30:00Z',
      isCurrent: true,
      ipAddress: '192.168.1.100'
    },
    {
      id: 'session-2',
      device: 'Safari on iPhone',
      location: 'Bandung, Indonesia',
      lastActive: '2024-01-14T15:45:00Z',
      isCurrent: false,
      ipAddress: '10.0.0.50'
    },
    {
      id: 'session-3',
      device: 'Firefox on Mac',
      location: 'Surabaya, Indonesia',
      lastActive: '2024-01-13T09:15:00Z',
      isCurrent: false,
      ipAddress: '172.16.0.25'
    }
  ]);

  // Form states
  const [hasProfileChanges, setHasProfileChanges] = useState(false);
  const [hasPasswordChanges, setHasPasswordChanges] = useState(false);
  const [hasPreferenceChanges, setHasPreferenceChanges] = useState(false);

  // Validation states
  const [errors, setErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState(0);

  // Check for profile changes
  useEffect(() => {
    const originalData = {
      fullName: 'John Doe',
      email: 'john.doe@company.com',
      phone: '+62 812-3456-7890'
    };

    const hasChanges = 
      profileData.fullName !== originalData.fullName ||
      profileData.email !== originalData.email ||
      profileData.phone !== originalData.phone;

    setHasProfileChanges(hasChanges);
  }, [profileData]);

  // Check for password changes
  useEffect(() => {
    const hasChanges = 
      passwordData.currentPassword !== '' ||
      passwordData.newPassword !== '' ||
      passwordData.confirmPassword !== '';

    setHasPasswordChanges(hasChanges);
  }, [passwordData]);

  // Check for preference changes
  useEffect(() => {
    setHasPreferenceChanges(true);
  }, [preferences]);

  // Calculate password strength
  useEffect(() => {
    if (passwordData.newPassword) {
      let strength = 0;
      const password = passwordData.newPassword;

      if (password.length >= 8) strength += 25;
      if (/[a-z]/.test(password)) strength += 25;
      if (/[A-Z]/.test(password)) strength += 25;
      if (/[0-9]/.test(password)) strength += 25;

      setPasswordStrength(strength);
    } else {
      setPasswordStrength(0);
    }
  }, [passwordData.newPassword]);

  // Handle profile input changes
  const handleProfileChange = (field, value) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  // Handle password input changes
  const handlePasswordChange = (field, value) => {
    setPasswordData(prev => ({ ...prev, [field]: value }));
  };

  // Handle preference changes
  const handlePreferenceChange = (category, setting, value) => {
    setPreferences(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: value
      }
    }));
  };

  // Handle general preference changes
  const handleGeneralPreferenceChange = (field, value) => {
    setPreferences(prev => ({ ...prev, [field]: value }));
  };

  // Save profile changes
  const handleSaveProfile = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Reset changes flag
      setHasProfileChanges(false);
      
      // Show success message
      alert('Profil berhasil diperbarui!');
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Gagal menyimpan profil. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  // Save password changes
  const handleSavePassword = async () => {
    // Validate password
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setErrors({ confirmPassword: 'Konfirmasi kata sandi tidak cocok' });
      return;
    }

    if (passwordStrength < 75) {
      setErrors({ newPassword: 'Kata sandi terlalu lemah' });
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Reset form
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      // Reset changes flag
      setHasPasswordChanges(false);
      
      // Show success message
      alert('Kata sandi berhasil diubah! Semua sesi lain akan diakhiri.');
      
      // Logout all other sessions
      setActiveSessions(prev => prev.filter(session => session.isCurrent));
    } catch (error) {
      console.error('Error changing password:', error);
      alert('Gagal mengubah kata sandi. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  // Save preference changes
  const handleSavePreferences = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Reset changes flag
      setHasPreferenceChanges(false);
      
      // Show success message
      alert('Preferensi berhasil disimpan!');
    } catch (error) {
      console.error('Error saving preferences:', error);
      alert('Gagal menyimpan preferensi. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  // Logout from all other devices
  const handleLogoutAllDevices = async () => {
    if (window.confirm('Anda yakin ingin keluar dari semua perangkat lain? Ini akan mengakhiri semua sesi aktif di perangkat lain.')) {
      setIsLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Remove all sessions except current
        setActiveSessions(prev => prev.filter(session => session.isCurrent));
        
        alert('Berhasil keluar dari semua perangkat lain!');
      } catch (error) {
        console.error('Error logging out from all devices:', error);
        alert('Gagal keluar dari semua perangkat. Silakan coba lagi.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Get password strength color
  const getPasswordStrengthColor = () => {
    if (passwordStrength < 25) return 'bg-red-500';
    if (passwordStrength < 50) return 'bg-orange-500';
    if (passwordStrength < 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  // Get password strength text
  const getPasswordStrengthText = () => {
    if (passwordStrength < 25) return 'Sangat Lemah';
    if (passwordStrength < 50) return 'Lemah';
    if (passwordStrength < 75) return 'Sedang';
    return 'Kuat';
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
          <p className="text-gray-600">Kelola profil, keamanan, dan preferensi akun Anda</p>
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            My Profile
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="preferences" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Preferences
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Informasi Personal
              </CardTitle>
              <CardDescription>
                Kelola data identitas fundamental yang terasosiasi dengan akun admin
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Form */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName" className="text-sm font-medium">
                        Nama Lengkap *
                      </Label>
                      <Input
                        id="fullName"
                        value={profileData.fullName}
                        onChange={(e) => handleProfileChange('fullName', e.target.value)}
                        placeholder="Masukkan nama lengkap Anda"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium">
                        Alamat Email *
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={profileData.email}
                        onChange={(e) => handleProfileChange('email', e.target.value)}
                        placeholder="Masukkan alamat email Anda"
                      />
                      {profileData.email !== 'john.doe@company.com' && (
                        <div className="flex items-center gap-2 text-amber-600 text-sm">
                          <AlertTriangle className="w-4 h-4" />
                          <span>Verifikasi Tertunda - Email verifikasi akan dikirim</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-sm font-medium">
                        Nomor Telepon
                      </Label>
                      <Input
                        id="phone"
                        value={profileData.phone}
                        onChange={(e) => handleProfileChange('phone', e.target.value)}
                        placeholder="Masukkan nomor telepon Anda"
                      />
                      {profileData.phone !== '+62 812-3456-7890' && (
                        <div className="flex items-center gap-2 text-amber-600 text-sm">
                          <AlertTriangle className="w-4 h-4" />
                          <span>Verifikasi Tertunda - OTP akan dikirim</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button 
                      onClick={handleSaveProfile}
                      disabled={!hasProfileChanges || isLoading}
                      className="w-full"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {isLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
                    </Button>
                  </div>
                </div>

                {/* Right Column - Avatar */}
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="relative inline-block">
                      <Avatar className="w-32 h-32 mx-auto">
                        <AvatarImage src={profileData.avatarUrl} />
                        <AvatarFallback className="text-2xl">
                          {profileData.fullName.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        className="absolute bottom-0 right-0 rounded-full w-8 h-8 p-0"
                        onClick={() => setIsAvatarDialogOpen(true)}
                      >
                        <Camera className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="text-center space-y-2">
                    <p className="text-sm font-medium">Foto Profil</p>
                    <p className="text-xs text-gray-500">
                      JPG/PNG, maks 2MB
                    </p>
                    <div className="flex gap-2 justify-center">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setIsAvatarDialogOpen(true)}
                      >
                        <Camera className="w-4 h-4 mr-2" />
                        Unggah Foto Baru
                      </Button>
                      {profileData.avatarUrl && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Hapus Foto
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6 mt-6">
          {/* Password Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Manajemen Kata Sandi & Keamanan
              </CardTitle>
              <CardDescription>
                Antarmuka yang aman dan jelas untuk mengelola kredensial login dan sesi akun
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={(e) => { e.preventDefault(); handleSavePassword(); }} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword" className="text-sm font-medium">
                    Kata Sandi Saat Ini *
                  </Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showPassword ? 'text' : 'password'}
                      value={passwordData.currentPassword}
                      onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                      placeholder="Masukkan kata sandi saat ini"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="text-sm font-medium">
                    Kata Sandi Baru *
                  </Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showNewPassword ? 'text' : 'password'}
                      value={passwordData.newPassword}
                      onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                      placeholder="Masukkan kata sandi baru"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                  
                  {/* Password Strength Indicator */}
                  {passwordData.newPassword && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Kekuatan Kata Sandi:</span>
                        <span className={passwordStrength < 75 ? 'text-red-600' : 'text-green-600'}>
                          {getPasswordStrengthText()}
                        </span>
                      </div>
                      <Progress value={passwordStrength} className="h-2">
                        <div className={`h-full transition-all duration-300 ${getPasswordStrengthColor()}`} />
                      </Progress>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium">
                    Konfirmasi Kata Sandi Baru *
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={passwordData.confirmPassword}
                      onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                      placeholder="Konfirmasi kata sandi baru"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-sm text-red-600">{errors.confirmPassword}</p>
                  )}
                </div>

                <div className="pt-4">
                  <Button 
                    type="submit"
                    disabled={!hasPasswordChanges || isLoading}
                    className="w-full"
                  >
                    <Key className="w-4 h-4 mr-2" />
                    {isLoading ? 'Mengubah...' : 'Ubah Kata Sandi'}
                  </Button>
                </div>
              </form>

              <Separator />

              {/* Active Sessions */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Sesi Aktif</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLogoutAllDevices}
                    disabled={activeSessions.length <= 1}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Keluar dari Semua Perangkat Lain
                  </Button>
                </div>

                <div className="space-y-3">
                  {activeSessions.map((session) => (
                    <div
                      key={session.id}
                      className={`flex items-center gap-4 p-4 rounded-lg border ${
                        session.isCurrent ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex-shrink-0">
                        {session.isCurrent ? (
                          <Badge variant="default" className="bg-blue-600">
                            Sesi Saat Ini
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Sesi Aktif</Badge>
                        )}
                      </div>
                      
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <DeviceIcon className="w-4 h-4 text-gray-500" />
                          <span className="font-medium">{session.device}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="w-4 h-4" />
                          <span>{session.location}</span>
                          <span>•</span>
                          <span>{session.ipAddress}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Clock className="w-4 h-4" />
                          <span>Terakhir aktif: {formatDate(session.lastActive)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preferences Tab */}
        <TabsContent value="preferences" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Preferensi Antarmuka & Notifikasi
              </CardTitle>
              <CardDescription>
                Sesuaikan lingkungan kerja Anda di dalam platform sesuai preferensi pribadi
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Display Settings */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  Pengaturan Tampilan
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="language" className="text-sm font-medium">
                      Bahasa / Language
                    </Label>
                    <Select 
                      value={preferences.language} 
                      onValueChange={(value) => handleGeneralPreferenceChange('language', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="id">Bahasa Indonesia</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500">
                      Perubahan akan langsung diterapkan setelah disimpan
                    </p>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Tema</Label>
                    <div className="flex gap-3">
                      {[
                        { value: 'light', label: 'Terang', icon: '☀️' },
                        { value: 'dark', label: 'Gelap', icon: '🌙' },
                        { value: 'auto', label: 'Otomatis', icon: '🔄' }
                      ].map((theme) => (
                        <div key={theme.value} className="flex items-center space-x-2">
                          <input
                            type="radio"
                            id={theme.value}
                            name="theme"
                            value={theme.value}
                            checked={preferences.theme === theme.value}
                            onChange={(e) => handleGeneralPreferenceChange('theme', e.target.value)}
                            className="w-4 h-4 text-blue-600"
                          />
                          <Label htmlFor={theme.value} className="text-sm cursor-pointer">
                            <span className="mr-2">{theme.icon}</span>
                            {theme.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Notification Settings */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Pengaturan Notifikasi
                </h3>
                
                <div className="space-y-6">
                  {/* Email Notifications */}
                  <div className="space-y-4">
                    <h4 className="text-md font-medium text-gray-700">Notifikasi Email</h4>
                    <div className="space-y-3">
                      {[
                        { key: 'weeklyReport', label: 'Kirim ringkasan laporan performa mingguan' },
                        { key: 'billing', label: 'Kirim notifikasi tagihan (faktur terbit, pembayaran berhasil/gagal)' },
                        { key: 'securityAlerts', label: 'Kirim lansiran keamanan penting (login dari perangkat baru)' }
                      ].map((setting) => (
                        <div key={setting.key} className="flex items-center justify-between">
                          <Label htmlFor={setting.key} className="text-sm cursor-pointer">
                            {setting.label}
                          </Label>
                          <Switch
                            id={setting.key}
                            checked={preferences.notifications.email[setting.key]}
                            onCheckedChange={(checked) => 
                              handlePreferenceChange('email', setting.key, checked)
                            }
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* In-App Notifications */}
                  <div className="space-y-4">
                    <h4 className="text-md font-medium text-gray-700">Notifikasi Dalam Aplikasi</h4>
                    <div className="space-y-3">
                      {[
                        { key: 'newTeamMember', label: 'Tampilkan notifikasi saat pengguna baru berhasil bergabung dengan tim' },
                        { key: 'integrationStatus', label: 'Tampilkan notifikasi saat integrasi penting (WhatsApp) terputus' }
                      ].map((setting) => (
                        <div key={setting.key} className="flex items-center justify-between">
                          <Label htmlFor={setting.key} className="text-sm cursor-pointer">
                            {setting.label}
                          </Label>
                          <Switch
                            id={setting.key}
                            checked={preferences.notifications.inApp[setting.key]}
                            onCheckedChange={(checked) => 
                              handlePreferenceChange('inApp', setting.key, checked)
                            }
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Save Preferences */}
              <div className="pt-4">
                <Button 
                  onClick={handleSavePreferences}
                  disabled={!hasPreferenceChanges || isLoading}
                  className="w-full"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isLoading ? 'Menyimpan...' : 'Simpan Preferensi'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Avatar Upload Dialog */}
      <Dialog open={isAvatarDialogOpen} onOpenChange={setIsAvatarDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Unggah Foto Profil</DialogTitle>
            <DialogDescription>
              Pilih foto profil baru untuk akun Anda
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-sm text-gray-600 mb-2">
                Klik untuk memilih file atau drag & drop
              </p>
              <p className="text-xs text-gray-500">
                JPG, PNG atau GIF. Maksimal 2MB.
              </p>
            </div>
            <div className="flex gap-2">
              <Button className="flex-1">Pilih File</Button>
              <Button variant="outline" onClick={() => setIsAvatarDialogOpen(false)}>
                Batal
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProfileSettings;
