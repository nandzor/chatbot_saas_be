import React, { useState, useCallback, useEffect } from 'react';
import {
  X,
  Shield,
  Users,
  Settings,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Save,
  RefreshCw,
  Eye,
  EyeOff,
  Lock,
  Unlock
} from 'lucide-react';
import {
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Switch,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Separator,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  Skeleton,
  Checkbox
} from '@/components/ui';
import { useOrganizationPermissions } from '@/hooks/useOrganizationPermissions';

const OrganizationPermissionsDialog = ({
  isOpen,
  onClose,
  organization,
  onSavePermissions,
  loading = false
}) => {
  const [activeTab, setActiveTab] = useState('roles');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState(null);

  // Use organization permissions hook
  const {
    roles,
    permissions,
    rolePermissions,
    loading: permissionsLoading,
    error: permissionsError,
    hasChanges,
    updateRolePermissions,
    saveRolePermissions,
    saveAllPermissions,
    resetPermissions,
    isPermissionGranted,
    getPermissionInfo,
    refreshData
  } = useOrganizationPermissions(organization?.id);

  // Handle permission toggle
  const handlePermissionToggle = useCallback((roleId, permissionId) => {
    const isGranted = isPermissionGranted(roleId, permissionId);
    updateRolePermissions(roleId, permissionId, !isGranted);
  }, [isPermissionGranted, updateRolePermissions]);

  // Handle role selection
  const handleRoleSelect = (role) => {
    setSelectedRole(role);
  };

  // Handle save permissions
  const handleSavePermissions = async () => {
    try {
      await saveAllPermissions();
    } catch (error) {
      console.error('Error saving permissions:', error);
    }
  };

  // Handle reset permissions
  const handleResetPermissions = () => {
    resetPermissions();
  };

  // Reset state when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setActiveTab('roles');
      setSearchTerm('');
      setSelectedRole(null);
      setHasChanges(false);
    }
  }, [isOpen]);

  if (!isOpen || !organization) return null;

  const tabs = [
    { id: 'roles', label: 'Roles & Permissions', icon: Shield },
    { id: 'users', label: 'User Assignments', icon: Users },
    { id: 'settings', label: 'Permission Settings', icon: Settings }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <div className="h-12 w-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Manage Permissions</h2>
              <p className="text-sm text-gray-500">{organization.name}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {hasChanges && (
              <Button variant="outline" onClick={handleResetPermissions}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset
              </Button>
            )}
            <Button
              onClick={handleSavePermissions}
              disabled={!hasChanges || loading}
            >
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b">
          <div className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Roles & Permissions Tab */}
          {activeTab === 'roles' && (
            <div className="space-y-6">
              {/* Search and Filter */}
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search roles..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Button variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Role
                </Button>
              </div>

              {/* Roles List */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {permissionsLoading ? (
                  Array.from({ length: 3 }).map((_, index) => (
                    <Card key={index}>
                      <CardHeader>
                        <Skeleton className="h-6 w-32" />
                        <Skeleton className="h-4 w-48" />
                      </CardHeader>
                      <CardContent>
                        <Skeleton className="h-4 w-24" />
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  roles
                    .filter(role =>
                      !searchTerm ||
                      role.name.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((role) => (
                      <Card
                        key={role.id}
                        className={`cursor-pointer transition-all ${
                          selectedRole?.id === role.id
                            ? 'ring-2 ring-purple-500 border-purple-200'
                            : 'hover:shadow-md'
                        }`}
                        onClick={() => handleRoleSelect(role)}
                      >
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Shield className="h-5 w-5 text-purple-600" />
                              <CardTitle className="text-lg">{role.name}</CardTitle>
                              {role.isSystem && (
                                <Badge variant="outline" className="text-xs">
                                  System
                                </Badge>
                              )}
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {role.userCount} users
                            </Badge>
                          </div>
                          <CardDescription>{role.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-600">
                              {permissions[role.id]?.length || 0} permissions
                            </span>
                            <Badge
                              variant="outline"
                              className={`text-xs ${
                                permissions[role.id]?.length > 0
                                  ? 'text-green-600 border-green-200'
                                  : 'text-gray-600 border-gray-200'
                              }`}
                            >
                              {permissions[role.id]?.length > 0 ? 'Active' : 'No Permissions'}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                )}
              </div>

              {/* Selected Role Permissions */}
              {selectedRole && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Shield className="h-5 w-5" />
                      <span>{selectedRole.name} Permissions</span>
                    </CardTitle>
                    <CardDescription>
                      Configure permissions for this role
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {permissions.map((category) => (
                        <div key={category.category}>
                          <h4 className="text-sm font-medium text-gray-900 mb-3">
                            {category.category}
                          </h4>
                          <div className="space-y-2">
                            {category.permissions.map((permission) => {
                              const isGranted = isPermissionGranted(selectedRole.id, permission.id);
                              return (
                                <div
                                  key={permission.id}
                                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                                >
                                  <div className="flex-1">
                                    <div className="flex items-center space-x-2">
                                      <Checkbox
                                        checked={isGranted}
                                        onChange={() => handlePermissionToggle(selectedRole.id, permission.id)}
                                        className="rounded"
                                      />
                                      <div>
                                        <p className="text-sm font-medium">{permission.name}</p>
                                        <p className="text-xs text-gray-500">{permission.description}</p>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    {isGranted ? (
                                      <CheckCircle className="h-4 w-4 text-green-600" />
                                    ) : (
                                      <XCircle className="h-4 w-4 text-gray-400" />
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* User Assignments Tab */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5" />
                    <span>User Role Assignments</span>
                  </CardTitle>
                  <CardDescription>
                    Manage which users have which roles
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">User Assignments</h3>
                    <p className="text-gray-500 mb-4">
                      This feature will be available in the next update.
                    </p>
                    <Button variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      Assign Roles
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Permission Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Settings className="h-5 w-5" />
                    <span>Permission Settings</span>
                  </CardTitle>
                  <CardDescription>
                    Configure global permission settings for this organization
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium">Inherit Parent Permissions</h4>
                        <p className="text-xs text-gray-500">
                          Allow roles to inherit permissions from parent roles
                        </p>
                      </div>
                      <Switch />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium">Require Permission Approval</h4>
                        <p className="text-xs text-gray-500">
                          Require admin approval for sensitive permission changes
                        </p>
                      </div>
                      <Switch />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium">Audit Permission Changes</h4>
                        <p className="text-xs text-gray-500">
                          Log all permission changes for security auditing
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrganizationPermissionsDialog;
