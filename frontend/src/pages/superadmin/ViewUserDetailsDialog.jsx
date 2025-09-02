import React, { useState, useCallback, Suspense } from 'react';
import {
  X,
  Users,
  Edit,
  Copy,
  Trash2,
  Loader2
} from 'lucide-react';
import {
  Button,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Skeleton
} from '@/components/ui';
import UserPermissionsTab from '@/components/UserPermissionsTab';
import UserOverviewTab from '@/components/UserOverviewTab';
import UserSessionsTab from '@/components/UserSessionsTab';
import UserActivityTab from '@/components/UserActivityTab';
import UserAnalyticsTab from '@/components/UserAnalyticsTab';

// Loading component for tab content
const TabLoadingFallback = () => (
  <div className="space-y-4">
    <Skeleton className="h-8 w-full" />
    <Skeleton className="h-32 w-full" />
    <Skeleton className="h-24 w-full" />
  </div>
);

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

  // Handle escape key
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      handleClose();
    }
  }, [handleClose]);

  if (!isOpen || !user) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{user.name}</h2>
              <p className="text-sm text-gray-600">{user.email}</p>
              {user.role && (
                <p className="text-xs text-blue-600 font-medium capitalize">{user.role}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleEdit}
              className="flex items-center gap-2 hover:bg-blue-50 hover:border-blue-300"
            >
              <Edit className="w-4 h-4" />
              Edit
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClone}
              className="flex items-center gap-2 hover:bg-green-50 hover:border-green-300"
            >
              <Copy className="w-4 h-4" />
              Clone
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleDelete}
              className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-300"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 hover:bg-gray-100"
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
                <Suspense fallback={<TabLoadingFallback />}>
                  <UserOverviewTab user={user} />
                </Suspense>
              </TabsContent>

              {/* Permissions Tab */}
              <TabsContent value="permissions" className="space-y-6">
                <Suspense fallback={<TabLoadingFallback />}>
                  <UserPermissionsTab userId={user?.id} user={user} />
                </Suspense>
              </TabsContent>

              {/* Sessions Tab */}
              <TabsContent value="sessions" className="space-y-6">
                <Suspense fallback={<TabLoadingFallback />}>
                  <UserSessionsTab userId={user?.id} user={user} />
                </Suspense>
              </TabsContent>

              {/* Activity Tab */}
              <TabsContent value="activity" className="space-y-6">
                <Suspense fallback={<TabLoadingFallback />}>
                  <UserActivityTab userId={user?.id} user={user} />
                </Suspense>
              </TabsContent>

              {/* Analytics Tab */}
              <TabsContent value="analytics" className="space-y-6">
                <Suspense fallback={<TabLoadingFallback />}>
                  <UserAnalyticsTab userId={user?.id} user={user} />
                </Suspense>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewUserDetailsDialog;
