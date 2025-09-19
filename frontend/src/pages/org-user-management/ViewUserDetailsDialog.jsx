/**
 * View User Details Dialog
 * Dialog untuk melihat detail user
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
  Avatar,
  AvatarFallback,
  AvatarImage,
  Separator
} from '@/components/ui';
import {
  User,
  Mail,
  Calendar,
  Shield,
  Clock,
  MapPin,
  Phone,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  Settings,
  Activity,
  Monitor,
  Smartphone
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { handleError } from '@/utils/errorHandler';
import UserManagementService from '@/services/UserManagementService';

const userManagementService = new UserManagementService();

const ViewUserDetailsDialog = ({ open, onOpenChange, user, onEdit, onDelete, onToggleStatus }) => {
  const [loading, setLoading] = useState(false);
  const [userDetails, setUserDetails] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');

  // Load user details when dialog opens
  useEffect(() => {
    if (open && user) {
      loadUserDetails();
    }
  }, [open, user]);

  const loadUserDetails = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const response = await userManagementService.getUserById(user.id);

      if (response) {
        setUserDetails(response);
      } else {
        throw new Error('Failed to load user details');
      }
    } catch (err) {
      handleError(err, { context: 'Load User Details' });
    } finally {
      setLoading(false);
    }
  }, [user]);

  const handleToggleStatus = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const response = await userManagementService.toggleUserStatus(user.id);

      if (response.success) {
        toast.success(`User ${user.full_name} status toggled successfully`);
        if (onToggleStatus) {
          onToggleStatus(response.data);
        }
        // Reload user details
        await loadUserDetails();
      } else {
        throw new Error(response.message || 'Failed to toggle user status');
      }
    } catch (err) {
      handleError(err, { context: 'Toggle User Status' });
    } finally {
      setLoading(false);
    }
  }, [user, onToggleStatus, loadUserDetails]);

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
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
        return <Badge variant="default" className="bg-green-100 text-green-700">Active</Badge>;
      case 'inactive':
        return <Badge variant="secondary">Inactive</Badge>;
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-700">Pending</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'org_admin':
        return <Badge variant="default" className="bg-blue-100 text-blue-700">Admin</Badge>;
      case 'agent':
        return <Badge variant="outline" className="bg-gray-100 text-gray-700">Agent</Badge>;
      case 'user':
        return <Badge variant="outline" className="bg-gray-100 text-gray-700">User</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  if (!user) return null;

  const displayUser = userDetails || user;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <User className="h-5 w-5 mr-2" />
            User Details
          </DialogTitle>
          <DialogDescription>
            View detailed information about this user.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* User Header */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={displayUser.avatar_url} />
                  <AvatarFallback className="text-lg">
                    {displayUser.full_name?.split(' ').map(n => n[0]).join('') || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-xl font-semibold">{displayUser.full_name}</h3>
                    {getStatusBadge(displayUser.status)}
                    {getRoleBadge(displayUser.role)}
                  </div>
                  <p className="text-muted-foreground">@{displayUser.username}</p>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-1" />
                      {displayUser.email}
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      Joined {formatDate(displayUser.created_at)}
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit?.(displayUser)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleToggleStatus}
                    disabled={loading}
                  >
                    {displayUser.status === 'active' ? (
                      <>
                        <UserX className="h-4 w-4 mr-2" />
                        Deactivate
                      </>
                    ) : (
                      <>
                        <UserCheck className="h-4 w-4 mr-2" />
                        Activate
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
              <TabsTrigger value="sessions">Sessions</TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Basic Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                      <p className="text-sm">{displayUser.full_name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Username</label>
                      <p className="text-sm">@{displayUser.username}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Email</label>
                      <p className="text-sm">{displayUser.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Phone</label>
                      <p className="text-sm">{displayUser.phone || 'Not provided'}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Account Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Role</label>
                      <div className="mt-1">{getRoleBadge(displayUser.role)}</div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Status</label>
                      <div className="mt-1">{getStatusBadge(displayUser.status)}</div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Created At</label>
                      <p className="text-sm">{formatDate(displayUser.created_at)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
                      <p className="text-sm">{formatDate(displayUser.updated_at)}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Activity Tab */}
            <TabsContent value="activity" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Recent Activity</CardTitle>
                  <CardDescription>
                    {displayUser?.activity?.total_activities || 0} total activities
                    {displayUser?.activity?.last_activity && (
                      <span className="ml-2 text-xs text-muted-foreground">
                        • Last activity: {formatDate(displayUser.activity.last_activity)}
                      </span>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="text-sm text-muted-foreground mt-2">Loading activities...</p>
                    </div>
                  ) : displayUser?.activity?.recent_activities?.length > 0 ? (
                    <div className="space-y-3">
                      {displayUser.activity.recent_activities.map((activity, index) => (
                        <div key={activity.id || index} className="flex items-start space-x-3 p-3 border rounded-lg">
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                              <Activity className="h-4 w-4 text-blue-600" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium text-gray-900">
                                {activity.description || activity.action}
                              </p>
                              <span className="text-xs text-muted-foreground">
                                {formatDate(activity.created_at)}
                              </span>
                            </div>
                            <div className="mt-1 flex items-center space-x-4 text-xs text-muted-foreground">
                              <span className="flex items-center">
                                <Shield className="h-3 w-3 mr-1" />
                                {activity.action}
                              </span>
                              {activity.resource_type && (
                                <span className="flex items-center">
                                  <User className="h-3 w-3 mr-1" />
                                  {activity.resource_type}
                                </span>
                              )}
                              {activity.ip_address && (
                                <span className="flex items-center">
                                  <MapPin className="h-3 w-3 mr-1" />
                                  {activity.ip_address}
                                </span>
                              )}
                            </div>
                            {activity.changes && Object.keys(activity.changes).length > 0 && (
                              <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                                <p className="font-medium text-gray-700 mb-1">Changes:</p>
                                <pre className="text-gray-600 whitespace-pre-wrap">
                                  {JSON.stringify(activity.changes, null, 2)}
                                </pre>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No Activity</h3>
                      <p className="text-muted-foreground">
                        No recent activity found for this user
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Sessions Tab */}
            <TabsContent value="sessions" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Active Sessions</CardTitle>
                  <CardDescription>
                    {displayUser?.sessions?.total_sessions || 0} active sessions
                    {displayUser?.sessions?.last_session && (
                      <span className="ml-2 text-xs text-muted-foreground">
                        • Last session: {formatDate(displayUser.sessions.last_session)}
                      </span>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="text-sm text-muted-foreground mt-2">Loading sessions...</p>
                    </div>
                  ) : displayUser?.sessions?.active_sessions?.length > 0 ? (
                    <div className="space-y-3">
                      {displayUser.sessions.active_sessions.map((session, index) => (
                        <div key={session.id || index} className="flex items-start space-x-3 p-3 border rounded-lg">
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                              {session.device_info?.device === 'Desktop' ? (
                                <Monitor className="h-4 w-4 text-green-600" />
                              ) : (
                                <Smartphone className="h-4 w-4 text-green-600" />
                              )}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium text-gray-900">
                                {session.device_info?.browser || 'Unknown Browser'} on {session.device_info?.os || 'Unknown OS'}
                              </p>
                              <Badge variant={session.is_active ? "default" : "outline"}>
                                {session.is_active ? 'Active' : 'Inactive'}
                              </Badge>
                            </div>
                            <div className="mt-1 space-y-1">
                              <p className="text-xs text-muted-foreground">
                                <Clock className="h-3 w-3 inline mr-1" />
                                Last active: {formatDate(session.last_activity_at)}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                <MapPin className="h-3 w-3 inline mr-1" />
                                IP: {session.ip_address}
                                {session.location_info?.city && session.location_info?.country && (
                                  <span className="ml-1">
                                    • {session.location_info.city}, {session.location_info.country}
                                  </span>
                                )}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                <Shield className="h-3 w-3 inline mr-1" />
                                Token: {session.session_token}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                <Calendar className="h-3 w-3 inline mr-1" />
                                Expires: {formatDate(session.expires_at)}
                              </p>
                            </div>
                            {session.user_agent && (
                              <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                                <p className="font-medium text-gray-700 mb-1">User Agent:</p>
                                <p className="text-gray-600 break-all">{session.user_agent}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Monitor className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No Active Sessions</h3>
                      <p className="text-muted-foreground">
                        No active sessions found for this user
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
          <Button
            variant="destructive"
            onClick={() => onDelete?.(displayUser)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete User
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ViewUserDetailsDialog;
