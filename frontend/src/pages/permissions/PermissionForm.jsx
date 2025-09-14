import React, { useState, useEffect } from 'react';
import { permissionManagementService } from '@/services/PermissionManagementService';
import {
  Button,
  Input,
  Label,
  Select,
  SelectItem,
  Checkbox,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Badge,
  Alert,
  AlertDescription
} from '@/components/ui';
import { Loader2, Save, X, AlertTriangle } from 'lucide-react';

const PermissionForm = ({ permission = null, onSubmit, onCancel, submitting = false }) => {
  const [formData, setFormData] = useState({
    name: '',
    display_name: '',
    description: '',
    category: 'general',
    resource: '',
    action: '',
    is_active: true,
    is_system_permission: false,
    is_dangerous: false,
    is_visible: true,
    sort_order: 0,
    guard_name: 'web'
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Load permission data if editing
  useEffect(() => {
    if (permission) {
      setFormData({
        name: permission.name || '',
        display_name: permission.display_name || '',
        description: permission.description || '',
        category: permission.category || 'general',
        resource: permission.resource || '',
        action: permission.action || '',
        is_active: permission.is_active ?? true,
        is_system_permission: permission.is_system_permission ?? false,
        is_dangerous: permission.is_dangerous ?? false,
        is_visible: permission.is_visible ?? true,
        sort_order: permission.sort_order || 0,
        guard_name: permission.guard_name || 'web'
      });
    }
  }, [permission]);

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
    } else if (!/^[a-z._-]+$/.test(formData.name)) {
      newErrors.name = 'Permission name must contain only lowercase letters, dots, underscores, and hyphens';
    }

    if (!formData.display_name.trim()) {
      newErrors.display_name = 'Display name is required';
    }

    if (!formData.category.trim()) {
      newErrors.category = 'Category is required';
    }

    if (formData.sort_order < 0) {
      newErrors.sort_order = 'Sort order must be a positive number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const formattedData = permissionManagementService.formatPermissionData(formData);
      await onSubmit(formattedData);
    } catch (error) {
      setErrors({ submit: error.message });
    } finally {
      setLoading(false);
    }
  };

  const generateNameFromDisplayName = () => {
    const name = formData.display_name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '.')
      .replace(/\.+/g, '.')
      .replace(/^\.|\.$/g, '');

    handleInputChange('name', name);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {permission ? 'Edit Permission' : 'Create New Permission'}
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          </CardTitle>
          <CardDescription>
            {permission ? 'Update permission settings and configurations' : 'Create a new permission with specific settings and configurations'}
          </CardDescription>
        </CardHeader>
        <CardContent>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Permission Name *</Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="permission.name"
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            {/* Display Name */}
            <div className="space-y-2">
              <Label htmlFor="display_name">Display Name *</Label>
              <div className="flex gap-2">
                <Input
                  id="display_name"
                  type="text"
                  value={formData.display_name}
                  onChange={(e) => handleInputChange('display_name', e.target.value)}
                  placeholder="Permission Display Name"
                  className={errors.display_name ? 'border-red-500' : ''}
                />
                <Button
                  type="button"
                  onClick={generateNameFromDisplayName}
                  variant="outline"
                  size="sm"
                >
                  Generate
                </Button>
              </div>
              {errors.display_name && (
                <p className="text-sm text-red-600">{errors.display_name}</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Enter permission description"
              />
            </div>

            {/* Category and Resource */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => handleInputChange('category', value)}
                >
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="role">Role</SelectItem>
                  <SelectItem value="permission">Permission</SelectItem>
                  <SelectItem value="organization">Organization</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                  <SelectItem value="api">API</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </Select>
                {errors.category && (
                  <p className="text-sm text-red-600">{errors.category}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="resource">Resource</Label>
                <Input
                  id="resource"
                  type="text"
                  value={formData.resource}
                  onChange={(e) => handleInputChange('resource', e.target.value)}
                  placeholder="Resource name"
                />
              </div>
            </div>

            {/* Action and Sort Order */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="action">Action</Label>
                <Input
                  id="action"
                  type="text"
                  value={formData.action}
                  onChange={(e) => handleInputChange('action', e.target.value)}
                  placeholder="Action name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sort_order">Sort Order</Label>
                <Input
                  id="sort_order"
                  type="number"
                  min="0"
                  value={formData.sort_order}
                  onChange={(e) => handleInputChange('sort_order', parseInt(e.target.value))}
                  className={errors.sort_order ? 'border-red-500' : ''}
                />
                {errors.sort_order && (
                  <p className="text-sm text-red-600">{errors.sort_order}</p>
                )}
              </div>
            </div>

            {/* Status Options */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <Label>Status Options</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="is_active"
                      checked={formData.is_active}
                      onCheckedChange={(checked) => handleInputChange('is_active', checked)}
                    />
                    <Label htmlFor="is_active">Active</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="is_visible"
                      checked={formData.is_visible}
                      onCheckedChange={(checked) => handleInputChange('is_visible', checked)}
                    />
                    <Label htmlFor="is_visible">Visible</Label>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Label>Permission Type</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="is_system_permission"
                      checked={formData.is_system_permission}
                      onCheckedChange={(checked) => handleInputChange('is_system_permission', checked)}
                    />
                    <Label htmlFor="is_system_permission">System Permission</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="is_dangerous"
                      checked={formData.is_dangerous}
                      onCheckedChange={(checked) => handleInputChange('is_dangerous', checked)}
                    />
                    <Label htmlFor="is_dangerous">Dangerous</Label>
                  </div>
                </div>
              </div>
            </div>

            {/* Guard Name */}
            <div className="space-y-2">
              <Label htmlFor="guard_name">Guard Name</Label>
              <Select
                value={formData.guard_name}
                onValueChange={(value) => handleInputChange('guard_name', value)}
              >
                <SelectItem value="web">Web</SelectItem>
                <SelectItem value="api">API</SelectItem>
                <SelectItem value="sanctum">Sanctum</SelectItem>
              </Select>
            </div>

            {/* Submit Error */}
            {errors.submit && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{errors.submit}</AlertDescription>
              </Alert>
            )}

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                onClick={onCancel}
                variant="outline"
                disabled={submitting}
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting || loading}
              >
                {submitting || loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {permission ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    {permission ? 'Update Permission' : 'Create Permission'}
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default PermissionForm;
