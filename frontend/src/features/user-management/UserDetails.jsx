/**
 * UserDetails Component
 * Detailed view of user information and management actions
 */

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Button,
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Separator,
  Alert,
  AlertDescription
} from '@/components/ui';
import {
  User,
  Mail,
  Phone,
  Calendar,
  Shield,
  Activity,
  Clock,
  MapPin,
  Monitor,
  Smartphone,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader2
} from 'lucide-react';
import { useUserManagement } from '@/hooks/useUserManagement';
import { handleError } from '@/utils/errorHandler';
import toast from 'react-hot-toast';

const UserDetails = ({
  isOpen,
  onClose,
  user,
  onEdit,
  onDelete,
  onToggleStatus,
  getUserActivity,
  getUserSessions,
  getUserPermissions
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [userActivity, setUserActivity] = useState([]);
  const [userSessions, setUserSessions] = useState([]);
  const [userPermissions, setUserPermissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load additional user data when dialog opens
  useEffect(() => {
    if (isOpen && user) {
      loadUserData();
    }
  }, [isOpen, user]);

  const loadUserData = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const [activity, sessions, permissions] = await Promise.allSettled([
        getUserActivity(user.id),
        getUserSessions(user.id),
        getUserPermissions(user.id)
      ]);

      if (activity.status === 'fulfilled') {
        setUserActivity(activity.value || []);
      }
      if (sessions.status === 'fulfilled') {
        setUserSessions(sessions.value || []);
      }
      if (permissions.status === 'fulfilled') {
        setUserPermissions(permissions.value || []);
      }
    } catch (err) {
      const errorMessage = handleError(err);
      setError(errorMessage.message);
      toast.error(`Gagal memuat data pengguna: ${errorMessage.message}`);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-100 text-green-700">Aktif</Badge>;
      case 'inactive':
        return <Badge variant="secondary">Tidak Aktif</Badge>;
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-700">Menunggu</Badge>;
      default:
        return <Badge variant="secondary">Tidak Diketahui</Badge>;
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'org_admin':
        return <Badge variant="default" className="bg-blue-100 text-blue-700">Admin</Badge>;
      case 'agent':
        return <Badge variant="outline" className="bg-gray-100 text-gray-700">Agent</Badge>;
      default:
        return <Badge variant="secondary">Tidak Diketahui</Badge>;
    }
  };

  const getDeviceIcon = (device) => {
    if (device?.toLowerCase().includes('mobile') || device?.toLowerCase().includes('phone')) {
      return <Smartphone className="h-4 w-4" />;
    }
    return <Monitor className="h-4 w-4" />;
  };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <User className="h-5 w-5 mr-2" />
            Detail Pengguna
          </DialogTitle>
          <DialogDescription>
            Informasi lengkap dan manajemen pengguna
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* User Header */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                    <User className="h-8 w-8 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">{user.full_name}</h3>
                    <p className="text-muted-foreground">@{user.username}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      {getRoleBadge(user.role)}
                      {getStatusBadge(user.status)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(user)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onToggleStatus(user)}
                  >
                    {user.status === 'active' ? (
                      <>
                        <UserX className="h-4 w-4 mr-2" />
                        Nonaktifkan
                      </>
                    ) : (
                      <>
                        <UserCheck className="h-4 w-4 mr-2" />
                        Aktifkan
                      </>
                    )}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onDelete(user)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Hapus
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="activity">Aktivitas</TabsTrigger>
              <TabsTrigger value="sessions">Sesi</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Contact Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Informasi Kontak</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Email</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    {user.phone && (
                      <div className="flex items-center space-x-3">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Telepon</p>
                          <p className="text-sm text-muted-foreground">{user.phone}</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Account Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Informasi Akun</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Shield className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Role</p>
                        <p className="text-sm text-muted-foreground">
                          {user.role === 'org_admin' ? 'Organization Admin' : 'Agent'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Bergabung</p>
                        <p className="text-sm text-muted-foreground">
                          {user.created_at ? formatDate(user.created_at) : 'Tidak diketahui'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Terakhir Aktif</p>
                        <p className="text-sm text-muted-foreground">
                          {user.last_active_at ? formatDate(user.last_active_at) : 'Tidak pernah'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Permissions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Izin Pengguna</CardTitle>
                  <CardDescription>
                    Daftar izin yang dimiliki pengguna
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  ) : userPermissions.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {userPermissions.map((permission, index) => (
                        <Badge key={index} variant="outline" className="justify-start">
                          {permission}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-4">
                      Tidak ada izin yang ditemukan
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Activity Tab */}
            <TabsContent value="activity" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Aktivitas Terbaru</CardTitle>
                  <CardDescription>
                    Log aktivitas pengguna dalam sistem
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  ) : userActivity.length > 0 ? (
                    <div className="space-y-3">
                      {userActivity.map((activity, index) => (
                        <div key={index} className="flex items-center space-x-3 p-3 border rounded-lg">
                          <Activity className="h-4 w-4 text-muted-foreground" />
                          <div className="flex-1">
                            <p className="text-sm font-medium">{activity.action || 'Aktivitas'}</p>
                            <p className="text-xs text-muted-foreground">
                              {activity.created_at ? formatDate(activity.created_at) : 'Tidak diketahui'}
                            </p>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {activity.type || 'Info'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-4">
                      Tidak ada aktivitas yang ditemukan
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Sessions Tab */}
            <TabsContent value="sessions" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Sesi Aktif</CardTitle>
                  <CardDescription>
                    Daftar sesi yang sedang aktif
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  ) : userSessions.length > 0 ? (
                    <div className="space-y-3">
                      {userSessions.map((session, index) => (
                        <div key={index} className="flex items-center space-x-3 p-3 border rounded-lg">
                          {getDeviceIcon(session.device)}
                          <div className="flex-1">
                            <p className="text-sm font-medium">{session.device || 'Perangkat Tidak Diketahui'}</p>
                            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                              {session.location && (
                                <>
                                  <MapPin className="h-3 w-3" />
                                  <span>{session.location}</span>
                                </>
                              )}
                              {session.ip_address && (
                                <>
                                  <span>•</span>
                                  <span>{session.ip_address}</span>
                                </>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Terakhir aktif: {session.last_activity ? formatDate(session.last_activity) : 'Tidak diketahui'}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            {session.is_current ? (
                              <Badge variant="default" className="bg-blue-100 text-blue-700">
                                Sesi Saat Ini
                              </Badge>
                            ) : (
                              <Badge variant="outline">Sesi Aktif</Badge>
                            )}
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-4">
                      Tidak ada sesi yang ditemukan
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserDetails;
