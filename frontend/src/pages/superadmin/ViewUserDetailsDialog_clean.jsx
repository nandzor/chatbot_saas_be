import React, { useState, useCallback } from 'react';
import {
  X,
  Users,
  Edit,
  Copy,
  Trash2
} from 'lucide-react';
import {
  Button,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui';
import UserPermissionsTab from '@/components/UserPermissionsTab';
import UserOverviewTab from '@/components/UserOverviewTab';
import UserSessionsTab from '@/components/UserSessionsTab';
import UserActivityTab from '@/components/UserActivityTab';
import UserAnalyticsTab from '@/components/UserAnalyticsTab';

const ViewUserDetailsDialog = ({ isOpen, onClose, user, onEdit, onClone, onDelete }) => {
  const [activeTab, setActiveTab] = useState('overview');

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  const handleEdit = useCallback(() => {
    onEdit(user);
    onClose();
  }, [onEdit, user, onClose]);

  const handleClone = useCallback(() => {
    onClone(user);
    onClose();
  }, [onClone, user, onClose]);

  const handleDelete = useCallback(() => {
    onDelete(user);
    onClose();
  }, [onDelete, user, onClose]);

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-gray-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{user.name}</h2>
              <p className="text-sm text-gray-600">{user.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleEdit}
              className="flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClone}
              className="flex items-center gap-2"
            >
              <Copy className="w-4 h-4" />
              Clone
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDelete}
              className="flex items-center gap-2 text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="permissions">Permissions</TabsTrigger>
                <TabsTrigger value="sessions">Sessions</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                <UserOverviewTab user={user} />
              </TabsContent>

              {/* Permissions Tab */}
              <TabsContent value="permissions" className="space-y-6">
                <UserPermissionsTab userId={user?.id} user={user} />
              </TabsContent>

              {/* Sessions Tab */}
              <TabsContent value="sessions" className="space-y-6">
                <UserSessionsTab userId={user?.id} user={user} />
              </TabsContent>

              {/* Activity Tab */}
              <TabsContent value="activity" className="space-y-6">
                <UserActivityTab userId={user?.id} user={user} />
              </TabsContent>

              {/* Analytics Tab */}
              <TabsContent value="analytics" className="space-y-6">
                <UserAnalyticsTab userId={user?.id} user={user} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewUserDetailsDialog;
