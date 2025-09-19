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

      if (response.success) {
        setUserDetails(response.data);
      } else {
        throw new Error(response.message || 'Failed to load user details');
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
                  <CardDescription>User activity and actions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Activity Log</h3>
                    <p className="text-muted-foreground">
                      Activity tracking will be available soon
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Sessions Tab */}
            <TabsContent value="sessions" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Active Sessions</CardTitle>
                  <CardDescription>Current and recent login sessions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {/* Mock session data */}
                    <div className="flex items-center space-x-3 p-3 border rounded-lg">
                      <Monitor className="h-5 w-5 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Chrome on Windows</p>
                        <p className="text-xs text-muted-foreground">
                          Current session • Last active: {formatDate(displayUser.last_active_at)}
                        </p>
                      </div>
                      <Badge variant="default">Current</Badge>
                    </div>
                    <div className="flex items-center space-x-3 p-3 border rounded-lg">
                      <Smartphone className="h-5 w-5 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Safari on iPhone</p>
                        <p className="text-xs text-muted-foreground">
                          Last active: {formatDate(displayUser.last_active_at)}
                        </p>
                      </div>
                      <Badge variant="outline">Active</Badge>
                    </div>
                  </div>
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
