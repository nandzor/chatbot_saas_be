import React, { useState, useEffect } from 'react';
import { roleManagementService } from '@/services/RoleManagementService';
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

const RoleForm = ({ role = null, onSubmit, onCancel, submitting = false }) => {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    display_name: '',
    description: '',
    level: 50,
    scope: 'organization',
    is_active: true,
    is_system_role: false,
    permission_ids: []
  });
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Load permissions on mount
  useEffect(() => {
    loadPermissions();
  }, []);

  // Load role data if editing
  useEffect(() => {
    if (role) {
      setFormData({
        name: role.name || '',
        code: role.code || '',
        display_name: role.display_name || '',
        description: role.description || '',
        level: role.level || 50,
        scope: role.scope || 'organization',
        is_active: role.is_active ?? true,
        is_system_role: role.is_system_role ?? false,
        permission_ids: role.permissions?.map(p => p.id) || []
      });
    }
  }, [role]);

  const loadPermissions = async () => {
    try {
      setLoading(true);
      const response = await roleManagementService.getPermissions();
      if (response.success) {
        // Group permissions by category
        const groupedPermissions = response.data.reduce((acc, permission) => {
          const category = permission.category || 'general';
          if (!acc[category]) {
            acc[category] = [];
          }
          acc[category].push(permission);
          return acc;
        }, {});
        setPermissions(groupedPermissions);
      }
    } catch (error) {
      console.error('Error loading permissions:', error);
      setErrors(prev => ({ ...prev, permissions: 'Failed to load permissions' }));
    } finally {
      setLoading(false);
    }
  };

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

  const handlePermissionChange = (permissionId, checked) => {
    setFormData(prev => ({
      ...prev,
      permission_ids: checked
        ? [...prev.permission_ids, permissionId]
        : prev.permission_ids.filter(id => id !== permissionId)
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Role name is required';
    }

    if (!formData.code.trim()) {
      newErrors.code = 'Role code is required';
    } else if (!/^[a-z_]+$/.test(formData.code)) {
      newErrors.code = 'Role code must contain only lowercase letters and underscores';
    }

    if (!formData.display_name.trim()) {
      newErrors.display_name = 'Display name is required';
    }

    if (formData.level < 1 || formData.level > 100) {
      newErrors.level = 'Level must be between 1 and 100';
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
      const formattedData = roleManagementService.formatRoleData(formData);
      await onSubmit(formattedData);
    } catch (error) {
      setErrors({ submit: error.message });
    } finally {
      setLoading(false);
    }
  };

  const generateCodeFromName = () => {
    const code = formData.name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');

    handleInputChange('code', code);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {role ? 'Edit Role' : 'Create New Role'}
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          </CardTitle>
          <CardDescription>
            {role ? 'Update role settings and permissions' : 'Create a new role with specific permissions and settings'}
          </CardDescription>
        </CardHeader>
        <CardContent>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Role Name *</Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter role name"
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            {/* Code */}
            <div className="space-y-2">
              <Label htmlFor="code">Role Code *</Label>
              <div className="flex gap-2">
                <Input
                  id="code"
                  type="text"
                  value={formData.code}
                  onChange={(e) => handleInputChange('code', e.target.value)}
                  placeholder="role_code"
                  className={errors.code ? 'border-red-500' : ''}
                />
                <Button
                  type="button"
                  onClick={generateCodeFromName}
                  variant="outline"
                  size="sm"
                >
                  Generate
                </Button>
              </div>
              {errors.code && (
                <p className="text-sm text-red-600">{errors.code}</p>
              )}
            </div>

            {/* Display Name */}
            <div className="space-y-2">
              <Label htmlFor="display_name">Display Name *</Label>
              <Input
                id="display_name"
                type="text"
                value={formData.display_name}
                onChange={(e) => handleInputChange('display_name', e.target.value)}
                placeholder="Enter display name"
                className={errors.display_name ? 'border-red-500' : ''}
              />
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
                placeholder="Enter role description"
              />
            </div>

            {/* Level and Scope */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="level">Level *</Label>
                <Input
                  id="level"
                  type="number"
                  min="1"
                  max="100"
                  value={formData.level}
                  onChange={(e) => handleInputChange('level', parseInt(e.target.value))}
                  className={errors.level ? 'border-red-500' : ''}
                />
                {errors.level && (
                  <p className="text-sm text-red-600">{errors.level}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="scope">Scope *</Label>
                <Select
                  value={formData.scope}
                  onValueChange={(value) => handleInputChange('scope', value)}
                >
                  <SelectItem value="global">Global</SelectItem>
                  <SelectItem value="organization">Organization</SelectItem>
                  <SelectItem value="department">Department</SelectItem>
                  <SelectItem value="team">Team</SelectItem>
                  <SelectItem value="personal">Personal</SelectItem>
                </Select>
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center space-x-6">
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
                  id="is_system_role"
                  checked={formData.is_system_role}
                  onCheckedChange={(checked) => handleInputChange('is_system_role', checked)}
                />
                <Label htmlFor="is_system_role">System Role</Label>
              </div>
            </div>

            {/* Permissions */}
            <div className="space-y-2">
              <Label>Permissions</Label>
              <div className="max-h-60 overflow-y-auto border border-gray-300 rounded-md p-4">
                {permissions && Object.entries(permissions).map(([category, categoryPermissions]) => (
                  <div key={category} className="mb-4">
                    <h4 className="font-medium text-gray-900 mb-2 capitalize">
                      {category.replace('_', ' ')}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {categoryPermissions.map((permission) => (
                        <div key={permission.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`permission_${permission.id}`}
                            checked={formData.permission_ids.includes(permission.id)}
                            onCheckedChange={(checked) => handlePermissionChange(permission.id, checked)}
                          />
                          <Label htmlFor={`permission_${permission.id}`} className="text-sm">
                            {permission.display_name || permission.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                {(!permissions || Object.keys(permissions).length === 0) && (
                  <p className="text-gray-500 text-sm">No permissions available</p>
                )}
              </div>
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
                    {role ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    {role ? 'Update Role' : 'Create Role'}
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

export default RoleForm;
