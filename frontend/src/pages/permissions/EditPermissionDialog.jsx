import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Button,
  Input,
  Label,
  Textarea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
  Alert,
  AlertDescription
} from '@/components/ui';
import { Loader2, AlertCircle } from 'lucide-react';

const EditPermissionDialog = ({
  isOpen,
  onClose,
  permission,
  onSubmit,
  loading = false
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    resource: '',
    action: '',
    is_system: false,
    is_visible: true,
    status: 'active'
  });
  const [errors, setErrors] = useState({});
  const [categories, setCategories] = useState([]);
  const [resources, setResources] = useState([]);
  const [actions, setActions] = useState([]);

  // Initialize form data when permission changes
  useEffect(() => {
    if (permission) {
      setFormData({
        name: permission.name || '',
        description: permission.description || '',
        category: permission.category || '',
        resource: permission.resource || '',
        action: permission.action || '',
        is_system: permission.is_system || false,
        is_visible: permission.is_visible !== undefined ? permission.is_visible : true,
        status: permission.status || 'active'
      });
      setErrors({});
    }
  }, [permission]);

  // Predefined options for form fields
  useEffect(() => {
    setCategories([
      'user_management',
      'role_management',
      'permission_management',
      'system_administration',
      'content_management',
      'analytics',
      'billing',
      'api_management',
      'workflows',
      'automations'
    ]);

    setResources([
      'users',
      'roles',
      'permissions',
      'organizations',
      'clients',
      'knowledge',
      'chat_sessions',
      'analytics',
      'billing',
      'api_keys',
      'workflows',
      'automations'
    ]);

    setActions([
      'view',
      'create',
      'update',
      'delete',
      'manage',
      'execute',
      'publish',
      'export',
      'import',
      'assign',
      'revoke'
    ]);
  }, []);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Permission name is required';
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  if (!permission) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Permission</DialogTitle>
          <DialogDescription>
            Update the permission details. System permissions cannot be modified.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Permission Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="e.g., users.create"
                disabled={permission.is_system}
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name}</p>
              )}
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleInputChange('category', value)}
                disabled={permission.is_system}
              >
                <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-sm text-red-500">{errors.category}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Resource */}
            <div className="space-y-2">
              <Label htmlFor="resource">Resource *</Label>
              <Select
                value={formData.resource}
                onValueChange={(value) => handleInputChange('resource', value)}
                disabled={permission.is_system}
              >
                <SelectTrigger className={errors.resource ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select resource" />
                </SelectTrigger>
                <SelectContent>
                  {resources.map((resource) => (
                    <SelectItem key={resource} value={resource}>
                      {resource.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.resource && (
                <p className="text-sm text-red-500">{errors.resource}</p>
              )}
            </div>

            {/* Action */}
            <div className="space-y-2">
              <Label htmlFor="action">Action *</Label>
              <Select
                value={formData.action}
                onValueChange={(value) => handleInputChange('action', value)}
                disabled={permission.is_system}
              >
                <SelectTrigger className={errors.action ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select action" />
                </SelectTrigger>
                <SelectContent>
                  {actions.map((action) => (
                    <SelectItem key={action} value={action}>
                      {action.replace(/\b\w/g, l => l.toUpperCase())}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.action && (
                <p className="text-sm text-red-500">{errors.action}</p>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe what this permission allows users to do..."
              rows={3}
            />
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => handleInputChange('status', value)}
              disabled={permission.is_system}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Switches */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Switch
                id="is_visible"
                checked={formData.is_visible}
                onCheckedChange={(checked) => handleInputChange('is_visible', checked)}
                disabled={permission.is_system}
              />
              <Label htmlFor="is_visible">Visible to users</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_system"
                checked={formData.is_system}
                disabled={true}
              />
              <Label htmlFor="is_system">System permission</Label>
            </div>
          </div>

          {/* System Permission Warning */}
          {permission.is_system && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                This is a system permission and cannot be modified. Only the description and visibility can be changed.
              </AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || permission.is_system}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Permission'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditPermissionDialog;
