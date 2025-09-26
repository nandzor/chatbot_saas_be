/**
 * Enhanced Profile Settings Component
 * Profile Settings dengan Form components dan enhanced error handling
 */

import React, { useState, useCallback, useEffect, useContext } from 'react';
import {
  useLoadingStates,
  LoadingWrapper,
  SkeletonCard
} from '@/utils/loadingStates';
import {
  handleError,
  withErrorHandling
} from '@/utils/errorHandler';
import {
  useAnnouncement,
  useFocusManagement
} from '@/utils/accessibilityUtils';
import {
  sanitizeInput,
  validateInput
} from '@/utils/securityUtils';
import {Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Badge, Input, Label, Textarea, Select, SelectItem, Switch, Separator, Alert, AlertDescription, Tabs, TabsContent, TabsList, TabsTrigger, Progress, Avatar, AvatarFallback, AvatarImage, Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, Form} from '@/components/ui';
import SafeAvatar from '@/components/ui/SafeAvatar';
import ProfileService from '@/services/ProfileService';

const profileService = new ProfileService();
import { useAuth } from '@/contexts/AuthContext';
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
  const { user, updateUser } = useAuth();

  // Loading states
  const {
    isLoading,
    setLoading,
    loadingStates,
    getLoadingState
  } = useLoadingStates();

  // Accessibility
  const { announce, AnnouncementRegion } = useAnnouncement();
  const { manageFocus } = useFocusManagement();

  const [activeTab, setActiveTab] = useState('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isAvatarDialogOpen, setIsAvatarDialogOpen] = useState(false);

  // Form data state - using single state object like Settings.jsx
  const [formData, setFormData] = useState({
    profile: {
      full_name: '',
      email: '',
      phone: '',
      avatar_url: null,
      bio: '',
      timezone: 'Asia/Jakarta',
      language: 'id'
    },
    password: {
      current_password: '',
      new_password: '',
      confirm_password: ''
    },
    preferences: {
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

  // Profile fields definition - similar to Settings.jsx
  const profileFields = [
    {
      name: 'profile.full_name',
      type: 'text',
      label: 'Nama Lengkap',
      placeholder: 'Masukkan nama lengkap Anda',
      required: true,
      description: 'Nama lengkap yang akan ditampilkan di profil Anda'
    },
    {
      name: 'profile.email',
      type: 'email',
      label: 'Alamat Email',
      placeholder: 'Masukkan alamat email Anda',
      required: true,
      description: 'Alamat email utama untuk akun Anda'
    },
    {
      name: 'profile.phone',
      type: 'tel',
      label: 'Nomor Telepon',
      placeholder: 'Masukkan nomor telepon Anda',
      required: false,
      description: 'Nomor telepon untuk verifikasi dan notifikasi'
    },
    {
      name: 'profile.bio',
      type: 'textarea',
      label: 'Bio',
      placeholder: 'Ceritakan sedikit tentang diri Anda',
      required: false,
      description: 'Deskripsi singkat tentang diri Anda'
    },
    {
      name: 'profile.timezone',
      type: 'select',
      label: 'Zona Waktu',
      required: true,
      options: [
        { value: 'UTC', label: 'UTC' },
        { value: 'Asia/Jakarta', label: 'Jakarta (WIB)' },
        { value: 'Asia/Makassar', label: 'Makassar (WITA)' },
        { value: 'Asia/Jayapura', label: 'Jayapura (WIT)' },
        { value: 'America/New_York', label: 'Eastern Time' },
        { value: 'America/Chicago', label: 'Central Time' },
        { value: 'America/Denver', label: 'Mountain Time' },
        { value: 'America/Los_Angeles', label: 'Pacific Time' },
        { value: 'Europe/London', label: 'London' },
        { value: 'Europe/Paris', label: 'Paris' },
        { value: 'Asia/Tokyo', label: 'Tokyo' },
        { value: 'Asia/Singapore', label: 'Singapore' }
      ]
    },
    {
      name: 'profile.language',
      type: 'select',
      label: 'Bahasa',
      required: true,
      options: [
        { value: 'id', label: 'Bahasa Indonesia' },
        { value: 'en', label: 'English (US)' }
      ]
    }
  ];

  // Password fields definition
  const passwordFields = [
    {
      name: 'password.current_password',
      type: 'password',
      label: 'Kata Sandi Saat Ini',
      placeholder: 'Masukkan kata sandi saat ini',
      required: true,
      description: 'Kata sandi yang sedang Anda gunakan'
    },
    {
      name: 'password.new_password',
      type: 'password',
      label: 'Kata Sandi Baru',
      placeholder: 'Masukkan kata sandi baru',
      required: true,
      description: 'Kata sandi baru yang akan Anda gunakan'
    },
    {
      name: 'password.confirm_password',
      type: 'password',
      label: 'Konfirmasi Kata Sandi',
      placeholder: 'Konfirmasi kata sandi baru',
      required: true,
      description: 'Ulangi kata sandi baru untuk konfirmasi'
    }
  ];

  // Preferences fields definition
  const preferencesFields = [
    {
      name: 'preferences.language',
      type: 'select',
      label: 'Bahasa Interface',
      required: true,
      options: [
        { value: 'id', label: 'Bahasa Indonesia' },
        { value: 'en', label: 'English (US)' }
      ]
    },
    {
      name: 'preferences.theme',
      type: 'select',
      label: 'Tema',
      required: true,
      options: [
        { value: 'light', label: 'Terang' },
        { value: 'dark', label: 'Gelap' },
        { value: 'auto', label: 'Otomatis' }
      ]
    },
    {
      name: 'preferences.notifications.email.weeklyReport',
      type: 'checkbox',
      label: 'Laporan Mingguan',
      description: 'Terima laporan mingguan via email'
    },
    {
      name: 'preferences.notifications.email.billing',
      type: 'checkbox',
      label: 'Notifikasi Tagihan',
      description: 'Terima notifikasi terkait tagihan dan pembayaran'
    },
    {
      name: 'preferences.notifications.email.securityAlerts',
      type: 'checkbox',
      label: 'Peringatan Keamanan',
      description: 'Terima peringatan keamanan penting'
    },
    {
      name: 'preferences.notifications.inApp.newTeamMember',
      type: 'checkbox',
      label: 'Anggota Tim Baru',
      description: 'Notifikasi saat ada anggota tim baru'
    },
    {
      name: 'preferences.notifications.inApp.integrationStatus',
      type: 'checkbox',
      label: 'Status Integrasi',
      description: 'Notifikasi tentang status integrasi'
    }
  ];

  // Load profile data from backend
  const loadProfileData = useCallback(async () => {
    try {
      setLoading('profile', true);
      announce('Memuat data profil...');

      const profile = await profileService.getCurrentProfile();

      setFormData(prev => ({
        ...prev,
        profile: {
          full_name: profile.full_name || '',
          email: profile.email || '',
          phone: profile.phone || '',
          avatar_url: profile.avatar_url || null,
          bio: profile.bio || '',
          timezone: profile.timezone || 'Asia/Jakarta',
          language: profile.language || 'id'
        }
      }));

      // Load preferences - using default values since backend endpoint doesn't exist
      try {
        setLoading('preferences', true);
        // Set default preferences since getPreferences method doesn't exist
        const defaultPreferences = {
          notifications: {
            email: true,
            push: true,
            sms: false
          },
          privacy: {
            profileVisibility: 'public',
            showEmail: false,
            showPhone: false
          },
          security: {
            twoFactorAuth: false,
            loginNotifications: true
          }
        };
        setFormData(prev => ({
          ...prev,
          preferences: {
            ...prev.preferences,
            ...defaultPreferences
          }
        }));
        setLoading('preferences', false);
      } catch (error) {
        console.warn('Could not load preferences:', error);
        setLoading('preferences', false);
      }

      // Load sessions
      try {
        setLoading('sessions', true);
        const sessions = await profileService.getActiveSessions();
        setActiveSessions(sessions);
        setLoading('sessions', false);
      } catch (error) {
        console.warn('Could not load sessions:', error);
        setLoading('sessions', false);
      }

      announce('Data profil berhasil dimuat');
    } catch (error) {
      console.error('Error loading profile data:', error);
      handleError(error, 'Gagal memuat data profil');
      announce('Gagal memuat data profil');
    } finally {
      setLoading('profile', false);
    }
  }, [announce, setLoading]);

  // Load data on component mount
  useEffect(() => {
    loadProfileData();
  }, [loadProfileData]);

  // Check for profile changes
  useEffect(() => {
    if (!user) return;

    const originalData = {
      full_name: user.full_name || '',
      email: user.email || '',
      phone: user.phone || ''
    };

    const hasChanges =
      formData.profile.full_name !== originalData.full_name ||
      formData.profile.email !== originalData.email ||
      formData.profile.phone !== originalData.phone;

    setHasProfileChanges(hasChanges);
  }, [formData.profile, user]);

  // Check for password changes
  useEffect(() => {
    const hasChanges =
      formData.password.current_password !== '' ||
      formData.password.new_password !== '' ||
      formData.password.confirm_password !== '';

    setHasPasswordChanges(hasChanges);
  }, [formData.password]);

  // Check for preference changes
  useEffect(() => {
    setHasPreferenceChanges(true);
  }, [formData.preferences]);

  // Calculate password strength
  useEffect(() => {
    if (formData.password.new_password) {
      let strength = 0;
      const password = formData.password.new_password;

      if (password.length >= 8) strength += 25;
      if (/[a-z]/.test(password)) strength += 25;
      if (/[A-Z]/.test(password)) strength += 25;
      if (/[0-9]/.test(password)) strength += 25;

      setPasswordStrength(strength);
    } else {
      setPasswordStrength(0);
    }
  }, [formData.password.new_password]);

  // Handle form data changes - similar to Settings.jsx
  const handleFormChange = (field, value) => {
    const sanitizedValue = sanitizeInput(value);
    setFormData(prev => {
      const keys = field.split('.');
      const newData = { ...prev };
      let current = newData;

      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {};
        }
        current = current[keys[i]];
      }

      current[keys[keys.length - 1]] = sanitizedValue;
      return newData;
    });
  };

  // Handle preference changes
  const handlePreferenceChange = (category, setting, value) => {
    setFormData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        notifications: {
          ...prev.preferences.notifications,
      [category]: {
            ...prev.preferences.notifications[category],
        [setting]: value
          }
        }
      }
    }));
  };

  // Handle general preference changes
  const handleGeneralPreferenceChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [field]: value
      }
    }));
  };

  // Save profile changes
  const handleSaveProfile = async (values) => {
    try {
      setLoading('saveProfile', true);
      announce('Menyimpan perubahan profil...');

      const updatedProfile = await profileService.updateProfile(values.profile);

      // Update auth context
      updateUser(updatedProfile);

      // Reset changes flag
      setHasProfileChanges(false);

      console.log('Announcing: Profil berhasil diperbarui'); // Debug log
      announce('Profil berhasil diperbarui', 'success');
    } catch (error) {
      handleError(error, 'Gagal menyimpan profil. Silakan coba lagi.');
      announce('Gagal menyimpan profil', 'error');
    } finally {
      setLoading('saveProfile', false);
    }
  };

  // Save password changes
  const handleSavePassword = async (values) => {
    // Validate password
    if (values.password.new_password !== values.password.confirm_password) {
      setErrors({ confirm_password: 'Konfirmasi kata sandi tidak cocok' });
      announce('Konfirmasi kata sandi tidak cocok');
      return;
    }

    if (passwordStrength < 75) {
      setErrors({ new_password: 'Kata sandi terlalu lemah' });
      announce('Kata sandi terlalu lemah');
      return;
    }

    try {
      setLoading('changePassword', true);
      announce('Mengubah kata sandi...');

      await profileService.changePassword({
        current_password: values.password.current_password,
        new_password: values.password.new_password
      });

      // Reset form
      setFormData(prev => ({
        ...prev,
        password: {
          current_password: '',
          new_password: '',
          confirm_password: ''
        }
      }));

      // Reset changes flag
      setHasPasswordChanges(false);

      // Clear errors
      setErrors({});

      // Logout all other sessions
      setActiveSessions(prev => prev.filter(session => session.isCurrent));

      announce('Kata sandi berhasil diubah', 'success');
    } catch (error) {
      handleError(error, 'Gagal mengubah kata sandi. Silakan coba lagi.');
      announce('Gagal mengubah kata sandi', 'error');
    } finally {
      setLoading('changePassword', false);
    }
  };

  // Save preference changes
  const handleSavePreferences = async (values) => {
    try {
      setLoading('savePreferences', true);
      announce('Menyimpan preferensi...');

      // Convert nested preferences structure to backend format
      const backendData = {
        language: values.preferences?.language,
        timezone: values.preferences?.timezone || 'Asia/Jakarta',
        notifications: {
          email: values.preferences?.notifications?.email?.weeklyReport ||
                 values.preferences?.notifications?.email?.billing ||
                 values.preferences?.notifications?.email?.securityAlerts || false,
          push: values.preferences?.notifications?.inApp?.newTeamMember ||
                values.preferences?.notifications?.inApp?.integrationStatus || false,
          sms: false // Default to false as not implemented
        }
      };

      // Update preferences using ProfileService
      const updatedProfile = await profileService.updatePreferences(backendData);

      // Update auth context with new preferences
      updateUser(updatedProfile);

      // Reset changes flag
      setHasPreferenceChanges(false);

      announce('Preferensi berhasil disimpan', 'success');
    } catch (error) {
      handleError(error, 'Gagal menyimpan preferensi. Silakan coba lagi.');
      announce('Gagal menyimpan preferensi', 'error');
    } finally {
      setLoading('savePreferences', false);
    }
  };

  // Handle avatar upload
  const handleAvatarUpload = async (file) => {
    try {
      setLoading('avatarUpload', true);
      announce('Mengunggah foto profil...');

      // Mock avatar upload - replace with actual implementation
      const avatarUrl = URL.createObjectURL(file);

      // Update form data
      setFormData(prev => ({
        ...prev,
        profile: {
          ...prev.profile,
          avatar_url: avatarUrl
        }
      }));

      announce('Foto profil berhasil diunggah', 'success');
      setIsAvatarDialogOpen(false);
    } catch (error) {
      handleError(error, 'Gagal mengunggah foto profil. Silakan coba lagi.');
      announce('Gagal mengunggah foto profil', 'error');
    } finally {
      setLoading('avatarUpload', false);
    }
  };

  // Handle avatar delete
  const handleDeleteAvatar = async () => {
    try {
      setLoading('avatarDelete', true);
      announce('Menghapus foto profil...');

      // Update form data
      setFormData(prev => ({
        ...prev,
        profile: {
          ...prev.profile,
          avatar_url: null
        }
      }));

      announce('Foto profil berhasil dihapus', 'success');
    } catch (error) {
      handleError(error, 'Gagal menghapus foto profil. Silakan coba lagi.');
      announce('Gagal menghapus foto profil', 'error');
    } finally {
      setLoading('avatarDelete', false);
    }
  };

  // Logout from all other devices
  const handleLogoutAllDevices = async () => {
    if (window.confirm('Anda yakin ingin keluar dari semua perangkat lain? Ini akan mengakhiri semua sesi aktif di perangkat lain.')) {
      try {
        setLoading('logoutAll', true);
        announce('Keluar dari semua perangkat lain...');

        await profileService.logoutAllDevices();

        // Remove all sessions except current
        setActiveSessions(prev => prev.filter(session => session.isCurrent));

        announce('Berhasil keluar dari semua perangkat lain', 'success');
      } catch (error) {
        handleError(error, 'Gagal keluar dari semua perangkat. Silakan coba lagi.');
        announce('Gagal keluar dari semua perangkat', 'error');
      } finally {
        setLoading('logoutAll', false);
      }
    }
  };

  // Logout from specific session
  const handleLogoutSession = async (sessionId) => {
    if (window.confirm('Anda yakin ingin keluar dari sesi ini?')) {
      try {
        setLoading(`logoutSession-${sessionId}`, true);
        announce('Keluar dari sesi...');

        await profileService.logoutSession(sessionId);

        // Remove the session from list
        setActiveSessions(prev => prev.filter(session => session.id !== sessionId));

        announce('Berhasil keluar dari sesi', 'success');
      } catch (error) {
        handleError(error, 'Gagal keluar dari sesi. Silakan coba lagi.');
        announce('Gagal keluar dari sesi', 'error');
      } finally {
        setLoading(`logoutSession-${sessionId}`, false);
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

  // Show loading state while profile is loading
  if (loadingStates.profile) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
            <p className="text-gray-600">Kelola profil, keamanan, dan preferensi akun Anda</p>
          </div>
        </div>
        <LoadingWrapper isLoading={true}>
          <SkeletonCard />
        </LoadingWrapper>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AnnouncementRegion />
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
          <LoadingWrapper
            isLoading={loadingStates.profile}
            loadingComponent={<SkeletonCard />}
          >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Form */}
              <div className="lg:col-span-2">
                <Form
                  title="Informasi Personal"
                  description="Kelola data identitas fundamental yang terasosiasi dengan akun admin"
                  fields={profileFields}
                  initialValues={formData}
                  validationRules={{
                    'profile.full_name': { required: true, minLength: 2, maxLength: 255 },
                    'profile.email': { required: true, email: true, maxLength: 255 },
                    'profile.phone': { maxLength: 20 },
                    'profile.bio': { maxLength: 1000 },
                    'profile.timezone': { required: true, maxLength: 50 },
                    'profile.language': { required: true, maxLength: 10 }
                  }}
                  onSubmit={handleSaveProfile}
                  submitText="Simpan Perubahan"
                  showProgress={true}
                  autoSave={false}
                  loading={loadingStates.saveProfile}
                  externalErrors={errors}
                />
                </div>

                {/* Right Column - Avatar */}
                <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-center">Avatar</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <div className="relative inline-block">
                      <SafeAvatar
                        src={formData.profile.avatar_url}
                        name={formData.profile.full_name}
                        size="2xl"
                        className="w-32 h-32 mx-auto"
                      />

                      <Button
                        size="sm"
                        variant="outline"
                        className="absolute bottom-0 right-0 rounded-full w-8 h-8 p-0"
                        onClick={() => setIsAvatarDialogOpen(true)}
                      >
                        <Camera className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="mt-4">
                      <h3 className="font-medium text-gray-900">
                        {formData.profile.full_name || 'Nama Lengkap'}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {formData.profile.email || 'email@example.com'}
                      </p>
                  </div>

                    <div className="text-center space-y-2 mt-4">
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
                        {formData.profile.avatar_url && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:text-red-700"
                          onClick={handleDeleteAvatar}
                          disabled={loadingStates.avatarDelete}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          {loadingStates.avatarDelete ? 'Menghapus...' : 'Hapus Foto'}
                        </Button>
                        )}
                </div>
              </div>
            </CardContent>
          </Card>
              </div>
            </div>
          </LoadingWrapper>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6 mt-6">
          <LoadingWrapper
            isLoading={loadingStates.profile}
            loadingComponent={<SkeletonCard />}
          >
            <Form
              title="Manajemen Kata Sandi & Keamanan"
              description="Antarmuka yang aman dan jelas untuk mengelola kredensial login dan sesi akun"
              fields={passwordFields}
              initialValues={formData}
              validationRules={{
                'password.current_password': { required: true, minLength: 6 },
                'password.new_password': { required: true, minLength: 8 },
                'password.confirm_password': { required: true, minLength: 8 }
              }}
              onSubmit={handleSavePassword}
              submitText="Ubah Kata Sandi"
              showProgress={true}
              autoSave={false}
              loading={loadingStates.changePassword}
              externalErrors={errors}
            />

              <Separator />

              {/* Active Sessions */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Sesi Aktif</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLogoutAllDevices}
                  disabled={activeSessions.length <= 1 || loadingStates.logoutAll}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                  {loadingStates.logoutAll ? 'Keluar...' : 'Keluar dari Semua Perangkat Lain'}
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
          </LoadingWrapper>
        </TabsContent>

        {/* Preferences Tab */}
        <TabsContent value="preferences" className="space-y-6 mt-6">
          <LoadingWrapper
            isLoading={loadingStates.profile}
            loadingComponent={<SkeletonCard />}
          >
            <Form
              title="Preferensi Antarmuka & Notifikasi"
              description="Sesuaikan lingkungan kerja Anda di dalam platform sesuai preferensi pribadi"
              fields={preferencesFields}
              initialValues={formData}
              validationRules={{
                'preferences.language': { required: true, maxLength: 10 },
                'preferences.theme': { required: true, maxLength: 10 }
              }}
              onSubmit={handleSavePreferences}
              submitText="Simpan Preferensi"
              showProgress={true}
              autoSave={false}
              loading={loadingStates.savePreferences}
              externalErrors={errors}
            />
          </LoadingWrapper>
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
            <div className="space-y-4">
              <div>
                <Label htmlFor="avatar-upload" className="sr-only">
                  Pilih Foto Profil
                </Label>
                <Input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleAvatarUpload(file);
                    }
                  }}
                  disabled={loadingStates.avatarUpload}
                  className="w-full"
                />
                <p className="text-sm text-muted-foreground mt-2">
                  Pilih file gambar (JPG, PNG, GIF) maksimal 5MB
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsAvatarDialogOpen(false)}
                  className="flex-1"
                >
                  Batal
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const ProfileSettingsWithErrorHandling = withErrorHandling(ProfileSettings);
export default ProfileSettingsWithErrorHandling;
