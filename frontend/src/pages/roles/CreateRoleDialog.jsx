import React, { useState, useCallback } from 'react';
import { 
  X, 
  Shield, 
  Users, 
  Settings, 
  Palette, 
  Eye,
  EyeOff,
  Save,
  Plus
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
  Switch
} from '@/components/ui';

const CreateRoleDialog = ({ isOpen, onClose, onSubmit, loading = false }) => {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    display_name: '',
    description: '',
    scope: 'organization',
    level: 50,
    is_system_role: false,
    is_default: false,
    is_active: true,
    max_users: null,
    color: '#3B82F6',
    icon: 'shield',
    badge_text: '',
    inherits_permissions: true,
    parent_role_id: null
  });

  const [errors, setErrors] = useState({});

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
        .replace(/\s+/g, '_');
      handleInputChange('code', code);
    }
  }, [formData.name, handleInputChange]);

  // Validate form
  const validateForm = useCallback(() => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Role name is required';
    }

    if (!formData.code.trim()) {
      newErrors.code = 'Role code is required';
    } else if (!/^[a-z0-9_]+$/.test(formData.code)) {
      newErrors.code = 'Role code must contain only lowercase letters, numbers, and underscores';
    }

    if (formData.level < 1 || formData.level > 100) {
      newErrors.level = 'Level must be between 1 and 100';
    }

    if (formData.max_users && formData.max_users < 1) {
      newErrors.max_users = 'Max users must be at least 1';
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
      await onSubmit(formData);
      // Reset form on success
      setFormData({
        name: '',
        code: '',
        display_name: '',
        description: '',
        scope: 'organization',
        level: 50,
        is_system_role: false,
        is_default: false,
        is_active: true,
        max_users: null,
        color: '#3B82F6',
        icon: 'shield',
        badge_text: '',
        inherits_permissions: true,
        parent_role_id: null
      });
      setErrors({});
    } catch (error) {
      console.error('Failed to create role:', error);
    }
  }, [formData, onSubmit, validateForm]);

  // Handle close
  const handleClose = useCallback(() => {
    if (!loading) {
      setFormData({
        name: '',
        code: '',
        display_name: '',
        description: '',
        scope: 'organization',
        level: 50,
        is_system_role: false,
        is_default: false,
        is_active: true,
        max_users: null,
        color: '#3B82F6',
        icon: 'shield',
        badge_text: '',
        inherits_permissions: true,
        parent_role_id: null
      });
      setErrors({});
      onClose();
    }
  }, [loading, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Plus className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Create New Role</h2>
              <p className="text-sm text-gray-600">Define a new role with specific permissions and settings</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="p-6 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Basic Information
                </CardTitle>
                <CardDescription>
                  Define the role's identity and basic properties
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Role Name *
                    </label>
                    <Input
                      placeholder="e.g., Content Manager"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className={errors.name ? 'border-red-300' : ''}
                    />
                    {errors.name && (
                      <p className="text-sm text-red-600 mt-1">{errors.name}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Role Code *
                    </label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="e.g., content_manager"
                        value={formData.code}
                        onChange={(e) => handleInputChange('code', e.target.value)}
                        className={errors.code ? 'border-red-300' : ''}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={generateCode}
                        className="whitespace-nowrap"
                      >
                        Generate
                      </Button>
                    </div>
                    {errors.code && (
                      <p className="text-sm text-red-600 mt-1">{errors.code}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Display Name
                    </label>
                    <Input
                      placeholder="e.g., Content Manager"
                      value={formData.display_name}
                      onChange={(e) => handleInputChange('display_name', e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Badge Text
                    </label>
                    <Input
                      placeholder="e.g., CONTENT"
                      value={formData.badge_text}
                      onChange={(e) => handleInputChange('badge_text', e.target.value)}
                      maxLength={20}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    placeholder="Describe the role's purpose and responsibilities..."
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Role Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Role Configuration
                </CardTitle>
                <CardDescription>
                  Configure role scope, level, and access controls
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Scope *
                    </label>
                    <Select value={formData.scope} onValueChange={(value) => handleInputChange('scope', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="global">Global</SelectItem>
                        <SelectItem value="organization">Organization</SelectItem>
                        <SelectItem value="department">Department</SelectItem>
                        <SelectItem value="team">Team</SelectItem>
                        <SelectItem value="personal">Personal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Level *
                    </label>
                    <Input
                      type="number"
                      min="1"
                      max="100"
                      value={formData.level}
                      onChange={(e) => handleInputChange('level', parseInt(e.target.value))}
                      className={errors.level ? 'border-red-300' : ''}
                    />
                    {errors.level && (
                      <p className="text-sm text-red-600 mt-1">{errors.level}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max Users
                    </label>
                    <Input
                      type="number"
                      min="1"
                      placeholder="No limit"
                      value={formData.max_users || ''}
                      onChange={(e) => handleInputChange('max_users', e.target.value ? parseInt(e.target.value) : null)}
                      className={errors.max_users ? 'border-red-300' : ''}
                    />
                    {errors.max_users && (
                      <p className="text-sm text-red-600 mt-1">{errors.max_users}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Icon
                    </label>
                    <Select value={formData.icon} onValueChange={(value) => handleInputChange('icon', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="shield">Shield</SelectItem>
                        <SelectItem value="users">Users</SelectItem>
                        <SelectItem value="settings">Settings</SelectItem>
                        <SelectItem value="eye">Eye</SelectItem>
                        <SelectItem value="key">Key</SelectItem>
                        <SelectItem value="lock">Lock</SelectItem>
                        <SelectItem value="star">Star</SelectItem>
                        <SelectItem value="heart">Heart</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Color
                    </label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={formData.color}
                        onChange={(e) => handleInputChange('color', e.target.value)}
                        className="w-16 h-10 p-1"
                      />
                      <Input
                        value={formData.color}
                        onChange={(e) => handleInputChange('color', e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Role Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Role Settings
                </CardTitle>
                <CardDescription>
                  Configure role behavior and inheritance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-700">System Role</label>
                        <p className="text-xs text-gray-500">Protected role that cannot be modified</p>
                      </div>
                      <Switch
                        checked={formData.is_system_role}
                        onCheckedChange={(checked) => handleInputChange('is_system_role', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Default Role</label>
                        <p className="text-xs text-gray-500">Automatically assigned to new users</p>
                      </div>
                      <Switch
                        checked={formData.is_default}
                        onCheckedChange={(checked) => handleInputChange('is_default', checked)}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Active</label>
                        <p className="text-xs text-gray-500">Role is currently available</p>
                      </div>
                      <Switch
                        checked={formData.is_active}
                        onCheckedChange={(checked) => handleInputChange('is_active', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Inherit Permissions</label>
                        <p className="text-xs text-gray-500">Inherit from parent role</p>
                      </div>
                      <Switch
                        checked={formData.inherits_permissions}
                        onCheckedChange={(checked) => handleInputChange('inherits_permissions', checked)}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Role Preview
                </CardTitle>
                <CardDescription>
                  See how the role will appear in the system
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg">
                  <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: formData.color + '20' }}
                  >
                    <Shield className="w-6 h-6" style={{ color: formData.color }} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {formData.name || 'Role Name'}
                      </h3>
                      {formData.is_system_role && (
                        <Badge variant="destructive">System</Badge>
                      )}
                      {formData.is_default && (
                        <Badge variant="secondary">Default</Badge>
                      )}
                      {formData.badge_text && (
                        <Badge variant="outline">{formData.badge_text}</Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 font-mono">
                      {formData.code || 'role_code'}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {formData.description || 'Role description will appear here...'}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className="bg-blue-100 text-blue-800">
                        {formData.scope || 'scope'}
                      </Badge>
                      <Badge variant="outline">Level {formData.level || '50'}</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
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
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Create Role
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateRoleDialog;
