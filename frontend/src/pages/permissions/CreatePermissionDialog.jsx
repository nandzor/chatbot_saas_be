import React, { useState, useCallback, useEffect } from 'react';
import {
  X,
  Shield,
  Settings,
  Save,
  Plus,
  Loader2,
  Eye,
  EyeOff
} from 'lucide-react';
import { permissionManagementService } from '@/services/PermissionManagementService';
import { toast } from 'react-hot-toast';
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
  Switch,
  Textarea
} from '@/components/ui';

const CreatePermissionDialog = ({ isOpen, onClose, onSubmit, loading = false }) => {
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
    metadata: {}
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [categories, setCategories] = useState([]);
  const [resources, setResources] = useState([]);
  const [actions, setActions] = useState([]);

  // Load predefined options
  useEffect(() => {
    setCategories(permissionManagementService.getCategories());
    setResources(permissionManagementService.getResources());
    setActions(permissionManagementService.getActions());
  }, []);

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen]);

  // Reset form to initial state
  const resetForm = useCallback(() => {
    setFormData({
      name: '',
      code: '',
      description: '',
      category: '',
      resource: '',
      action: '',
      is_system: false,
      is_visible: true,
      status: 'active',
      metadata: {}
    });
    setErrors({});
  }, []);

  // Handle form input changes
  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  }, [errors]);

  // Generate code from name
  const generateCode = useCallback(() => {
    if (formData.name) {
      const code = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '.');
      handleInputChange('code', code);
    }
  }, [formData.name, handleInputChange]);

  // Validate form
  const validateForm = useCallback(() => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Permission name is required';
    }

    if (!formData.code.trim()) {
      newErrors.code = 'Permission code is required';
    } else if (!/^[a-z0-9._-]+$/.test(formData.code)) {
      newErrors.code = 'Code can only contain lowercase letters, numbers, dots, underscores, and hyphens';
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
  }, [formData]);

  // Handle form submission
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);
      await onSubmit(formData);
      resetForm();
      onClose();
    } catch (error) {
      toast.error(error.message || 'Failed to create permission');
    } finally {
      setSubmitting(false);
    }
  }, [formData, validateForm, onSubmit, resetForm, onClose]);

  // Handle close
  const handleClose = useCallback(() => {
    if (!submitting && !loading) {
      onClose();
    }
  }, [submitting, loading, onClose]);

  if (!isOpen) return null;

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
              <h2 className="text-xl font-semibold text-gray-900">Create New Permission</h2>
              <p className="text-sm text-gray-600">Define a new permission for the system</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            disabled={submitting || loading}
            className="text-gray-400 hover:text-gray-600"
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
              <CardDescription>Core permission details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Permission Name *</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="e.g., Create Users"
                    className={errors.name ? 'border-red-500' : ''}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500">{errors.name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Permission Code *</label>
                  <div className="flex space-x-2">
                    <Input
                      value={formData.code}
                      onChange={(e) => handleInputChange('code', e.target.value)}
                      placeholder="e.g., users.create"
                      className={errors.code ? 'border-red-500' : ''}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={generateCode}
                      className="px-3"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  {errors.code && (
                    <p className="text-sm text-red-500">{errors.code}</p>
                  )}
                  <p className="text-xs text-gray-500">Auto-generate from name or enter manually</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe what this permission allows users to do..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Permission Structure */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Permission Structure</CardTitle>
              <CardDescription>Define the permission's scope and action</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Category *</label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => handleInputChange('category', value)}
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

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Resource *</label>
                  <Select
                    value={formData.resource}
                    onValueChange={(value) => handleInputChange('resource', value)}
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

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Action *</label>
                  <Select
                    value={formData.action}
                    onValueChange={(value) => handleInputChange('action', value)}
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

              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Shield className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">Permission Code Preview</span>
                </div>
                <div className="mt-2">
                  <Badge variant="outline" className="text-sm font-mono">
                    {formData.category && formData.resource && formData.action
                      ? `${formData.category}.${formData.resource}.${formData.action}`
                      : 'category.resource.action'
                    }
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Settings</CardTitle>
              <CardDescription>Configure permission behavior</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Status</label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => handleInputChange('status', value)}
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

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Visibility</label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_visible"
                      checked={formData.is_visible}
                      onCheckedChange={(checked) => handleInputChange('is_visible', checked)}
                    />
                    <label htmlFor="is_visible" className="text-sm text-gray-700">
                      Visible to users
                    </label>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">System Permission</label>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_system"
                    checked={formData.is_system}
                    onCheckedChange={(checked) => handleInputChange('is_system', checked)}
                  />
                  <label htmlFor="is_system" className="text-sm text-gray-700">
                    Mark as system permission
                  </label>
                </div>
                <p className="text-xs text-gray-500">System permissions cannot be deleted and have restricted editing</p>
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={submitting || loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting || loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Create Permission
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePermissionDialog;
