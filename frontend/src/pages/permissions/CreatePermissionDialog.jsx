import React, { useState, useCallback } from 'react';
import { 
  X, 
  Lock, 
  Key, 
  Settings, 
  Eye,
  Save,
  Plus,
  AlertTriangle,
  Shield,
  Users,
  MessageSquare,
  FileText,
  BarChart3,
  Bot,
  Webhook,
  Workflow,
  CreditCard,
  Zap
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
  Switch,
  Textarea
} from '@/components/ui';

const CreatePermissionDialog = ({ isOpen, onClose, onSubmit, loading = false }) => {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    scope: 'organization',
    category: 'user_management',
    risk_level: 'medium',
    is_system_permission: false,
    is_dangerous: false,
    is_active: true,
    inherits_from: null,
    metadata: {
      created_via: 'manual',
      system_permission: false,
      dangerous_permission: false,
      requires_approval: false,
      audit_required: false
    }
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

  // Handle metadata changes
  const handleMetadataChange = useCallback((field, value) => {
    setFormData(prev => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        [field]: value
      }
    }));
  }, []);

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
    } else if (!/^[a-z0-9.]+$/.test(formData.code)) {
      newErrors.code = 'Permission code must contain only lowercase letters, numbers, and dots';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (formData.risk_level === 'critical' && !formData.metadata.audit_required) {
      newErrors.risk_level = 'Critical permissions require audit logging';
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
        description: '',
        scope: 'organization',
        category: 'user_management',
        risk_level: 'medium',
        is_system_permission: false,
        is_dangerous: false,
        is_active: true,
        inherits_from: null,
        metadata: {
          created_via: 'manual',
          system_permission: false,
          dangerous_permission: false,
          requires_approval: false,
          audit_required: false
        }
      });
      setErrors({});
    } catch (error) {
      console.error('Failed to create permission:', error);
    }
  }, [formData, onSubmit, validateForm]);

  // Handle close
  const handleClose = useCallback(() => {
    if (!loading) {
      setFormData({
        name: '',
        code: '',
        description: '',
        scope: 'organization',
        category: 'user_management',
        risk_level: 'medium',
        is_system_permission: false,
        is_dangerous: false,
        is_active: true,
        inherits_from: null,
        metadata: {
          created_via: 'manual',
          system_permission: false,
          dangerous_permission: false,
          requires_approval: false,
          audit_required: false
        }
      });
      setErrors({});
      onClose();
    }
  }, [loading, onClose]);

  // Get category icon
  const getCategoryIcon = (category) => {
    switch (category) {
      case 'user_management':
        return Users;
      case 'role_management':
        return Shield;
      case 'chat_management':
        return MessageSquare;
      case 'knowledge_management':
        return FileText;
      case 'analytics':
        return BarChart3;
      case 'bot_management':
        return Bot;
      case 'api_management':
        return Webhook;
      case 'workflow_management':
        return Workflow;
      case 'billing':
        return CreditCard;
      case 'automation':
        return Zap;
      default:
        return Settings;
    }
  };

  // Get risk level color
  const getRiskLevelColor = (riskLevel) => {
    switch (riskLevel) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (!isOpen) return null;

  const CategoryIcon = getCategoryIcon(formData.category);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Plus className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Create New Permission</h2>
              <p className="text-sm text-gray-600">Define a new permission with specific access rights and security settings</p>
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
                  <Key className="w-5 h-5" />
                  Basic Information
                </CardTitle>
                <CardDescription>
                  Define the permission's identity and basic properties
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Permission Name *
                    </label>
                    <Input
                      placeholder="e.g., User Management"
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
                      Permission Code *
                    </label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="e.g., users.manage"
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <Textarea
                    placeholder="Describe what this permission allows users to do..."
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={3}
                    className={errors.description ? 'border-red-300' : ''}
                  />
                  {errors.description && (
                    <p className="text-sm text-red-600 mt-1">{errors.description}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Permission Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Permission Configuration
                </CardTitle>
                <CardDescription>
                  Configure permission scope, category, and risk assessment
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
                      Category *
                    </label>
                    <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user_management">User Management</SelectItem>
                        <SelectItem value="role_management">Role Management</SelectItem>
                        <SelectItem value="chat_management">Chat Management</SelectItem>
                        <SelectItem value="knowledge_management">Knowledge Management</SelectItem>
                        <SelectItem value="analytics">Analytics</SelectItem>
                        <SelectItem value="bot_management">Bot Management</SelectItem>
                        <SelectItem value="api_management">API Management</SelectItem>
                        <SelectItem value="workflow_management">Workflow Management</SelectItem>
                        <SelectItem value="billing">Billing</SelectItem>
                        <SelectItem value="automation">Automation</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Risk Level *
                    </label>
                    <Select value={formData.risk_level} onValueChange={(value) => handleInputChange('risk_level', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.risk_level && (
                      <p className="text-sm text-red-600 mt-1">{errors.risk_level}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Security Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Security Settings
                </CardTitle>
                <CardDescription>
                  Configure security and compliance requirements
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-700">System Permission</label>
                        <p className="text-xs text-gray-500">Protected permission that cannot be modified</p>
                      </div>
                      <Switch
                        checked={formData.is_system_permission}
                        onCheckedChange={(checked) => handleInputChange('is_system_permission', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Dangerous Permission</label>
                        <p className="text-xs text-gray-500">High-risk permission requiring special attention</p>
                      </div>
                      <Switch
                        checked={formData.is_dangerous}
                        onCheckedChange={(checked) => handleInputChange('is_dangerous', checked)}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Active</label>
                        <p className="text-xs text-gray-500">Permission is currently available</p>
                      </div>
                      <Switch
                        checked={formData.is_active}
                        onCheckedChange={(checked) => handleInputChange('is_active', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Requires Approval</label>
                        <p className="text-xs text-gray-500">Permission assignment needs approval</p>
                      </div>
                      <Switch
                        checked={formData.metadata.requires_approval}
                        onCheckedChange={(checked) => handleMetadataChange('requires_approval', checked)}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Audit Required</label>
                    <p className="text-xs text-gray-500">All usage must be logged for compliance</p>
                  </div>
                  <Switch
                    checked={formData.metadata.audit_required}
                    onCheckedChange={(checked) => handleMetadataChange('audit_required', checked)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Permission Preview
                </CardTitle>
                <CardDescription>
                  See how the permission will appear in the system
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    <CategoryIcon className="w-6 h-6 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {formData.name || 'Permission Name'}
                      </h3>
                      {formData.is_system_permission && (
                        <Badge variant="destructive">System</Badge>
                      )}
                      {formData.is_dangerous && (
                        <Badge variant="outline" className="border-red-300 text-red-700">
                          Dangerous
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 font-mono">
                      {formData.code || 'permission.code'}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {formData.description || 'Permission description will appear here...'}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className="bg-blue-100 text-blue-800">
                        {formData.scope || 'scope'}
                      </Badge>
                      <Badge className="bg-purple-100 text-purple-800">
                        {formData.category || 'category'}
                      </Badge>
                      <Badge className={`${getRiskLevelColor(formData.risk_level)} border`}>
                        {formData.risk_level.charAt(0).toUpperCase() + formData.risk_level.slice(1)}
                      </Badge>
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
