import {
  Shield,
  X,
  Edit,
  Copy,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Key,
  Users,
  FileText,
  Settings,
  Building2,
  Lock,
  Calendar,
  User
} from 'lucide-react';
import {
  Button,
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Separator
} from '@/components/ui';

const CATEGORY_MAP = {
  system_administration: { icon: Shield, color: 'bg-red-100 text-red-800', label: 'System Administration' },
  user_management: { icon: Users, color: 'bg-blue-100 text-blue-800', label: 'User Management' },
  role_management: { icon: Key, color: 'bg-purple-100 text-purple-800', label: 'Role Management' },
  permission_management: { icon: Lock, color: 'bg-green-100 text-green-800', label: 'Permission Management' },
  content_management: { icon: FileText, color: 'bg-yellow-100 text-yellow-800', label: 'Content Management' },
  analytics: { icon: Settings, color: 'bg-gray-100 text-gray-800', label: 'Analytics' },
  billing: { icon: Building2, color: 'bg-orange-100 text-orange-800', label: 'Billing' },
  api_management: { icon: Settings, color: 'bg-indigo-100 text-indigo-800', label: 'API Management' }
};

const STATUS_MAP = {
  active: { icon: CheckCircle, color: 'bg-green-100 text-green-800', label: 'Active' },
  inactive: { icon: XCircle, color: 'bg-gray-100 text-gray-800', label: 'Inactive' },
  pending: { icon: Clock, color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
  suspended: { icon: AlertCircle, color: 'bg-red-100 text-red-800', label: 'Suspended' }
};

const ViewPermissionDetailsDialog = ({ isOpen, onClose, permission, onEdit, onClone, onDelete }) => {
  if (!isOpen || !permission) return null;

  const categoryInfo = CATEGORY_MAP[permission.category] || {
    icon: Settings,
    color: 'bg-gray-100 text-gray-800',
    label: permission.category?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Unknown'
  };

  const statusInfo = STATUS_MAP[permission.status] || {
    icon: XCircle,
    color: 'bg-gray-100 text-gray-800',
    label: permission.status || 'Unknown'
  };

  const CategoryIcon = categoryInfo.icon;
  const StatusIcon = statusInfo.icon;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${categoryInfo.color.split(' ')[0].replace('bg-', '')}20` }}>
              <CategoryIcon className="w-6 h-6" style={{ color: categoryInfo.color.split(' ')[1].replace('text-', '') }} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{permission.name}</h2>
              <p className="text-sm text-gray-500 font-mono">{permission.code}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(permission)}
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onClone(permission)}
            >
              <Copy className="w-4 h-4 mr-2" />
              Clone
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(permission)}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Shield className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Category</p>
                    <Badge className={categoryInfo.color}>
                      <CategoryIcon className="w-3 h-3 mr-1" />
                      {categoryInfo.label}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <StatusIcon className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Status</p>
                    <Badge className={statusInfo.color}>
                      <StatusIcon className="w-3 h-3 mr-1" />
                      {statusInfo.label}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Settings className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Type</p>
                    <Badge variant={permission.is_system ? 'destructive' : 'outline'}>
                      {permission.is_system ? 'System' : 'Custom'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Basic Information</CardTitle>
                <CardDescription>
                  Core permission details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <p className="text-sm text-gray-900">{permission.name}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
                  <p className="text-sm text-gray-900 font-mono bg-gray-100 px-2 py-1 rounded">{permission.code}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <p className="text-sm text-gray-900">
                    {permission.description || 'No description provided'}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Permission Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Permission Details</CardTitle>
                <CardDescription>
                  Resource and action information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Resource</label>
                  <Badge variant="outline" className="font-mono">
                    {permission.resource || 'N/A'}
                  </Badge>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Action</label>
                  <Badge variant="outline" className="font-mono">
                    {permission.action || 'N/A'}
                  </Badge>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Scope</label>
                  <Badge variant="outline">
                    {permission.metadata?.scope || 'Global'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Settings</CardTitle>
              <CardDescription>
                Permission configuration and visibility settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">System Permission</label>
                      <p className="text-sm text-gray-500">Marked as system-level permission</p>
                    </div>
                    <Badge variant={permission.is_system ? 'destructive' : 'outline'}>
                      {permission.is_system ? 'Yes' : 'No'}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Visible</label>
                      <p className="text-sm text-gray-500">Shown in permission lists</p>
                    </div>
                    <Badge variant={permission.is_visible ? 'default' : 'secondary'}>
                      {permission.is_visible ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Created At</label>
                    <p className="text-sm text-gray-900">{formatDate(permission.created_at)}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Updated At</label>
                    <p className="text-sm text-gray-900">{formatDate(permission.updated_at)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Metadata */}
          {permission.metadata && Object.keys(permission.metadata).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Additional Metadata</CardTitle>
                <CardDescription>
                  Extended permission configuration
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 rounded-lg p-4">
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                    {JSON.stringify(permission.metadata, null, 2)}
                  </pre>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Usage Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Usage Information</CardTitle>
              <CardDescription>
                How this permission is used in the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">0</div>
                  <div className="text-sm text-gray-500">Roles Using</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">0</div>
                  <div className="text-sm text-gray-500">Users Assigned</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">0</div>
                  <div className="text-sm text-gray-500">Recent Usage</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t bg-gray-50">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button
            onClick={() => onEdit(permission)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit Permission
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ViewPermissionDetailsDialog;
