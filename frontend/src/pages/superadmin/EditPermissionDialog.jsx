import React, { useState, useEffect } from 'react';
import {
  Shield,
  X,
  Save,
  AlertCircle,
  Info
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import {
  Button,
  Input,
  Label,
  Textarea,
  Select,
  SelectItem,
  Switch,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Alert,
  AlertDescription
} from '@/components/ui';

const CATEGORY_OPTIONS = [
  { value: 'system_administration', label: 'System Administration' },
  { value: 'user_management', label: 'User Management' },
  { value: 'role_management', label: 'Role Management' },
  { value: 'permission_management', label: 'Permission Management' },
  { value: 'content_management', label: 'Content Management' },
  { value: 'analytics', label: 'Analytics' },
  { value: 'billing', label: 'Billing' },
  { value: 'api_management', label: 'API Management' },
  { value: 'workflows', label: 'Workflows' },
  { value: 'n8n-automations', label: 'N8N Automations' }
];

const RESOURCE_OPTIONS = [
  { value: 'users', label: 'Users' },
  { value: 'roles', label: 'Roles' },
  { value: 'permissions', label: 'Permissions' },
  { value: 'organizations', label: 'Organizations' },
  { value: 'clients', label: 'Clients' },
  { value: 'knowledge', label: 'Knowledge Base' },
  { value: 'chat_sessions', label: 'Chat Sessions' },
  { value: 'analytics', label: 'Analytics' },
  { value: 'billing', label: 'Billing' },
  { value: 'api_keys', label: 'API Keys' },
  { value: 'workflows', label: 'Workflows' },
  { value: 'n8n-automations', label: 'N8N Automations' }
];

const ACTION_OPTIONS = [
  { value: 'view', label: 'View' },
  { value: 'create', label: 'Create' },
  { value: 'update', label: 'Update' },
  { value: 'delete', label: 'Delete' },
  { value: 'manage', label: 'Manage' },
  { value: 'execute', label: 'Execute' },
  { value: 'publish', label: 'Publish' },
  { value: 'export', label: 'Export' },
  { value: 'import', label: 'Import' },
  { value: 'assign', label: 'Assign' },
  { value: 'revoke', label: 'Revoke' }
];

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' }
];

const EditPermissionDialog = ({ isOpen, onClose, permission, onSubmit, loading = false }) => {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    category: '',
    resource: '',
    action: '',
    is_system: false,
    is_visible: true,
    status: 'active',
    metadata: {
      scope: 'global'
    }
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form data when permission changes
  useEffect(() => {
    if (permission) {
      setFormData({
        name: permission.name || '',
        code: permission.code || '',
        description: permission.description || '',
        category: permission.category || '',
        resource: permission.resource || '',
        action: permission.action || '',
        is_system: permission.is_system || false,
        is_visible: permission.is_visible !== undefined ? permission.is_visible : true,
        status: permission.status || 'active',
        metadata: {
          scope: permission.metadata?.scope || 'global',
          ...permission.metadata
        }
      });
      setErrors({});
    }
  }, [permission]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Permission name is required';
    }

    if (!formData.code.trim()) {
      newErrors.code = 'Permission code is required';
    } else if (!/^[a-z][a-z0-9_.]*[a-z0-9]$/.test(formData.code)) {
      newErrors.code = 'Code must be lowercase, start with letter, and contain only letters, numbers, dots, and underscores';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (!formData.resource) {
      newErrors.resource = 'Resource is required';
    }

    if (!formData.action) {
      newErrors.action = 'Action is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleMetadataChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      metadata: { ...prev.metadata, [field]: value }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      toast.success('Permission updated successfully!');
    } catch (error) {
      toast.error('Failed to update permission. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting && !loading) {
      setErrors({});
      onClose();
    }
  };

  if (!isOpen || !permission) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Edit Permission</h2>
              <p className="text-sm text-gray-500">Update permission details</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            disabled={isSubmitting || loading}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
              <CardDescription>
                Define the core details of the permission
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Permission Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="e.g., View User Dashboard"
                    className={errors.name ? 'border-red-500' : ''}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-600 mt-1">{errors.name}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="code">Permission Code *</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => handleInputChange('code', e.target.value)}
                    placeholder="e.g., users.dashboard.view"
                    className={errors.code ? 'border-red-500' : ''}
                    disabled={permission.is_system}
                  />
                  {permission.is_system && (
                    <p className="text-xs text-gray-500 mt-1">System permission codes cannot be modified</p>
                  )}
                  {errors.code && (
                    <p className="text-sm text-red-600 mt-1">{errors.code}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe what this permission allows users to do..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Permission Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Permission Details</CardTitle>
              <CardDescription>
                Define the category, resource, and action for this permission
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => handleInputChange('category', value)}
                    placeholder="Select category"
                    className={errors.category ? 'border-red-500' : ''}
                  >
                    {CATEGORY_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </Select>
                  {errors.category && (
                    <p className="text-sm text-red-600 mt-1">{errors.category}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="resource">Resource *</Label>
                  <Select
                    value={formData.resource}
                    onValueChange={(value) => handleInputChange('resource', value)}
                    placeholder="Select resource"
                    className={errors.resource ? 'border-red-500' : ''}
                  >
                    {RESOURCE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </Select>
                  {errors.resource && (
                    <p className="text-sm text-red-600 mt-1">{errors.resource}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="action">Action *</Label>
                  <Select
                    value={formData.action}
                    onValueChange={(value) => handleInputChange('action', value)}
                    placeholder="Select action"
                    className={errors.action ? 'border-red-500' : ''}
                  >
                    {ACTION_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </Select>
                  {errors.action && (
                    <p className="text-sm text-red-600 mt-1">{errors.action}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Settings</CardTitle>
              <CardDescription>
                Configure additional permission settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="is_system">System Permission</Label>
                      <p className="text-sm text-gray-500">Mark as system-level permission</p>
                    </div>
                    <Switch
                      id="is_system"
                      checked={formData.is_system}
                      onCheckedChange={(checked) => handleInputChange('is_system', checked)}
                      disabled={permission.is_system}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="is_visible">Visible</Label>
                      <p className="text-sm text-gray-500">Show in permission lists</p>
                    </div>
                    <Switch
                      id="is_visible"
                      checked={formData.is_visible}
                      onCheckedChange={(checked) => handleInputChange('is_visible', checked)}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)} placeholder="Select status">
                      {STATUS_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="scope">Scope</Label>
                    <Select
                      value={formData.metadata.scope}
                      onValueChange={(value) => handleMetadataChange('scope', value)}
                      placeholder="Select scope"
                    >
                      <SelectItem value="global">Global</SelectItem>
                      <SelectItem value="organization">Organization</SelectItem>
                      <SelectItem value="user">User</SelectItem>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* System Permission Warning */}
          {permission.is_system && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                This is a system permission. Some fields may be restricted from modification to maintain system integrity.
              </AlertDescription>
            </Alert>
          )}

          {/* Info Alert */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Permission codes should follow the format: <code>resource.action</code> (e.g., users.view, roles.create).
              Changes to system permissions may affect system functionality.
            </AlertDescription>
          </Alert>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting || loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting || loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Updating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Update Permission
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPermissionDialog;
