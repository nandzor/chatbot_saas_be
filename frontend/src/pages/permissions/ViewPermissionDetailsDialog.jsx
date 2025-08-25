import React from 'react';
import {
  X,
  Shield,
  Settings,
  Eye,
  Edit,
  Copy,
  Trash2,
  CheckCircle,
  XCircle,
  Calendar,
  User,
  Clock,
  AlertCircle
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

const ViewPermissionDetailsDialog = ({
  isOpen,
  onClose,
  permission,
  onEdit,
  onClone,
  onDelete
}) => {
  if (!isOpen || !permission) return null;

  // Get category icon
  const getCategoryIcon = (category) => {
    switch (category) {
      case 'user_management':
        return User;
      case 'role_management':
        return Shield;
      case 'permission_management':
        return Shield;
      case 'system_administration':
        return Settings;
      default:
        return Settings;
    }
  };

  const CategoryIcon = getCategoryIcon(permission.category);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Permission Details</h2>
              <p className="text-sm text-gray-600">View permission information and settings</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
              <CardDescription>Core permission details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start space-x-4">
                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                  <CategoryIcon className="w-8 h-8 text-gray-600" />
                </div>
                <div className="flex-1 space-y-3">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{permission.name}</h3>
                    <p className="text-sm text-gray-500 font-mono">{permission.code}</p>
                  </div>
                  {permission.description && (
                    <p className="text-gray-600">{permission.description}</p>
                  )}
                  <div className="flex items-center space-x-2">
                    <Badge variant={permission.status === 'active' ? 'default' : 'secondary'}>
                      {permission.status === 'active' ? (
                        <>
                          <CheckCircle className="w-3 h-3 mr-1" /> Active
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3 mr-1" /> Inactive
                        </>
                      )}
                    </Badge>
                    {permission.is_system && (
                      <Badge variant="destructive">System</Badge>
                    )}
                    {permission.is_visible ? (
                      <Badge variant="outline">Visible</Badge>
                    ) : (
                      <Badge variant="outline">Hidden</Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Permission Structure */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Permission Structure</CardTitle>
              <CardDescription>Permission scope and action details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500">Category</label>
                  <div className="flex items-center space-x-2">
                    <CategoryIcon className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-900">
                      {permission.category?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500">Resource</label>
                  <Badge variant="outline">
                    {permission.resource?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500">Action</label>
                  <Badge variant="outline">
                    {permission.action?.replace(/\b\w/g, l => l.toUpperCase())}
                  </Badge>
                </div>
              </div>

              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Shield className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">Full Permission Code</span>
                </div>
                <div className="mt-2">
                  <Badge variant="outline" className="text-sm font-mono">
                    {permission.category && permission.resource && permission.action
                      ? `${permission.category}.${permission.resource}.${permission.action}`
                      : 'N/A'
                    }
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Additional Information</CardTitle>
              <CardDescription>System metadata and timestamps</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500">Created</label>
                  <div className="flex items-center space-x-2 text-sm text-gray-900">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span>
                      {permission.created_at
                        ? new Date(permission.created_at).toLocaleDateString()
                        : 'N/A'
                      }
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500">Last Updated</label>
                  <div className="flex items-center space-x-2 text-sm text-gray-900">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span>
                      {permission.updated_at
                        ? new Date(permission.updated_at).toLocaleDateString()
                        : 'N/A'
                      }
                    </span>
                  </div>
                </div>

                {permission.created_by && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-500">Created By</label>
                    <div className="flex items-center space-x-2 text-sm text-gray-900">
                      <User className="w-4 h-4 text-gray-400" />
                      <span>{permission.created_by}</span>
                    </div>
                  </div>
                )}

                {permission.updated_by && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-500">Last Updated By</label>
                    <div className="flex items-center space-x-2 text-sm text-gray-900">
                      <User className="w-4 h-4 text-gray-400" />
                      <span>{permission.updated_by}</span>
                    </div>
                  </div>
                )}
              </div>

              {permission.metadata && Object.keys(permission.metadata).length > 0 && (
                <>
                  <Separator className="my-4" />
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-500">Custom Metadata</label>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <pre className="text-xs text-gray-700 overflow-x-auto">
                        {JSON.stringify(permission.metadata, null, 2)}
                      </pre>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* System Permission Warning */}
          {permission.is_system && (
            <Card className="border-orange-200 bg-orange-50">
              <CardHeader>
                <CardTitle className="text-lg text-orange-800 flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5" />
                  System Permission
                </CardTitle>
                <CardDescription className="text-orange-700">
                  This is a system permission with restricted editing capabilities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-orange-700 space-y-2">
                  <p>• System permissions cannot be deleted</p>
                  <p>• Limited editing capabilities for security reasons</p>
                  <p>• Changes may affect core system functionality</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t">
            <Button
              variant="outline"
              onClick={onClose}
            >
              Close
            </Button>

            <Button
              variant="outline"
              onClick={() => onClone(permission)}
            >
              <Copy className="w-4 h-4 mr-2" />
              Clone
            </Button>

            {!permission.is_system && (
              <>
                <Button
                  variant="outline"
                  onClick={() => onEdit(permission)}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>

                <Button
                  variant="destructive"
                  onClick={() => onDelete(permission)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewPermissionDetailsDialog;
