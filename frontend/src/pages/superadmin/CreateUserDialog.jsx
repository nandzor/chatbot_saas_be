import React, { useState, useCallback } from 'react';
import {
  X,
  UserPlus,
  Save,
  Users,
  Mail,
  Phone,
  Building2,
  MapPin,
  Clock,
  Shield,
  Key,
  Settings,
  Eye,
  EyeOff,
  Globe,
  UserCheck,
  Calendar,
  Hash,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import {
  Button,
  Input,
  Select,
  SelectItem,
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Switch,
  Textarea,
  Label
} from '@/components/ui';

const CreateUserDialog = ({ isOpen, onClose, onSubmit, loading = false }) => {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    password_hash: '',
    confirmPassword: '',
    role: 'agent',
    organization_id: '1',
    department: 'IT',
    job_title: '',
    location: '',
    timezone: 'America/New_York',
    is_email_verified: false,
    two_factor_enabled: false,
    status: 'pending',
    permissions: [],
    metadata: {
      employee_id: '',
      hire_date: '',
      manager: '',
      cost_center: ''
    }
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

  // Handle permission changes
  const handlePermissionChange = useCallback((permission, checked) => {
    setFormData(prev => ({
      ...prev,
      permissions: checked
        ? [...prev.permissions, permission]
        : prev.permissions.filter(p => p !== permission)
    }));
  }, []);

  // Generate employee ID
  const generateEmployeeId = useCallback(() => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const employeeId = `EMP${timestamp}${random}`;
    handleMetadataChange('employee_id', employeeId);
  }, [handleMetadataChange]);

  // Validate form
  const validateForm = useCallback(() => {
    const newErrors = {};

    if (!formData.full_name.trim()) {
      newErrors.full_name = 'User name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password_hash) {
      newErrors.password_hash = 'Password is required';
    } else if (formData.password_hash.length < 8) {
      newErrors.password_hash = 'Password must be at least 8 characters long';
    }

    if (formData.password_hash !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.role) {
      newErrors.role = 'Role is required';
    }

    if (!formData.organization_id) {
      newErrors.organization_id = 'Organization is required';
    }

    if (!formData.department) {
      newErrors.department = 'Department is required';
    }

    if (!formData.job_title) {
      newErrors.job_title = 'Position is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // Handle form submission
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
      // Reset form on success
      setFormData({
        full_name: '',
        email: '',
        phone: '',
        password_hash: '',
        confirmPassword: '',
        role: 'agent',
        organization_id: '1',
        department: 'IT',
        job_title: '',
        location: '',
        timezone: 'America/New_York',
        is_email_verified: false,
        two_factor_enabled: false,
        status: 'pending',
        permissions: [],
        metadata: {
          employee_id: '',
          hire_date: '',
          manager: '',
          cost_center: ''
        }
      });
      setErrors({});
    } catch (error) {
    }
  }, [formData, onSubmit, validateForm]);

  // Handle close
  const handleClose = useCallback(() => {
    if (!loading) {
      setFormData({
        full_name: '',
        email: '',
        phone: '',
        password_hash: '',
        confirmPassword: '',
        role: 'agent',
        organization_id: '1',
        department: 'IT',
        job_title: '',
        location: '',
        timezone: 'America/New_York',
        is_email_verified: false,
        two_factor_enabled: false,
        status: 'pending',
        permissions: [],
        metadata: {
          employee_id: '',
          hire_date: '',
          manager: '',
          cost_center: ''
        }
      });
      setErrors({});
      onClose();
    }
  }, [loading, onClose]);

  // Get role info
  const getRoleInfo = (role) => {
    switch (role) {
      case 'super_admin':
        return { icon: Shield, color: 'bg-red-100 text-red-800', label: 'Super Admin' };
      case 'org_admin':
        return { icon: Building2, color: 'bg-blue-100 text-blue-800', label: 'Org Admin' };
      case 'agent':
        return { icon: Users, color: 'bg-green-100 text-green-800', label: 'Agent' };
      case 'client':
        return { icon: UserCheck, color: 'bg-purple-100 text-purple-800', label: 'Client' };
      default:
        return { icon: Settings, color: 'bg-gray-100 text-gray-800', label: role };
    }
  };

  // Get status info
  const getStatusInfo = (status) => {
    switch (status) {
      case 'active':
        return { icon: CheckCircle, color: 'bg-green-100 text-green-800', label: 'Active' };
      case 'inactive':
        return { icon: XCircle, color: 'bg-gray-100 text-gray-800', label: 'Inactive' };
      case 'pending':
        return { icon: Clock, color: 'bg-yellow-100 text-yellow-800', label: 'Pending' };
      case 'suspended':
        return { icon: AlertTriangle, color: 'bg-red-100 text-red-800', label: 'Suspended' };
      default:
        return { icon: Settings, color: 'bg-gray-100 text-gray-800', label: status };
    }
  };

  if (!isOpen) return null;

  const RoleIcon = getRoleInfo(formData.role).icon;
  const StatusIcon = getStatusInfo(formData.status).icon;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={(e) => e.stopPropagation()}>
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden pointer-events-auto" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <UserPlus className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Create New User</h2>
              <p className="text-sm text-gray-600">Add a new user to the system with appropriate roles and permissions</p>
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
        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-140px)] pointer-events-auto" onClick={(e) => e.stopPropagation()}>
          <div className="p-6 space-y-6 pointer-events-auto">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Basic Information
                </CardTitle>
                <CardDescription>
                  Enter the user's personal and contact information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </Label>
                    <Input
                      id="full_name"
                      placeholder="e.g., John Doe"
                      value={formData.full_name}
                      onChange={(e) => handleInputChange('full_name', e.target.value)}
                      className={errors.full_name ? 'border-red-300' : ''}
                    />
                    {errors.full_name && (
                      <p className="text-sm text-red-600 mt-1">{errors.full_name}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="e.g., john.doe@example.com"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={errors.email ? 'border-red-300' : ''}
                    />
                    {errors.email && (
                      <p className="text-sm text-red-600 mt-1">{errors.email}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="e.g., +1-555-0123"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="job_title" className="block text-sm font-medium text-gray-700 mb-2">
                      Position *
                    </Label>
                    <Input
                      id="job_title"
                      placeholder="e.g., Software Engineer"
                      value={formData.job_title}
                      onChange={(e) => handleInputChange('job_title', e.target.value)}
                      className={errors.job_title ? 'border-red-300' : ''}
                    />
                    {errors.job_title && (
                      <p className="text-sm text-red-600 mt-1">{errors.job_title}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                      Location
                    </Label>
                    <Input
                      id="location"
                      placeholder="e.g., San Francisco, CA"
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="timezone" className="block text-sm font-medium text-gray-700 mb-2">
                      Timezone
                    </Label>
                    <Select value={formData.timezone} onValueChange={(value) => handleInputChange('timezone', value)} placeholder="Select timezone">
                      <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                      <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                      <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                      <SelectItem value="Europe/London">London (GMT)</SelectItem>
                      <SelectItem value="Europe/Paris">Paris (CET)</SelectItem>
                      <SelectItem value="Asia/Tokyo">Tokyo (JST)</SelectItem>
                      <SelectItem value="Asia/Shanghai">Shanghai (CST)</SelectItem>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Account Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="w-5 h-5" />
                  Account Settings
                </CardTitle>
                <CardDescription>
                  Configure user account and security settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="password_hash" className="block text-sm font-medium text-gray-700 mb-2">
                      Password *
                    </Label>
                    <div className="relative">
                      <Input
                        id="password_hash"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter password"
                        value={formData.password_hash}
                        onChange={(e) => handleInputChange('password_hash', e.target.value)}
                        className={errors.password_hash ? 'border-red-300 pr-10' : 'pr-10'}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                    {errors.password_hash && (
                      <p className="text-sm text-red-600 mt-1">{errors.password_hash}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm Password *
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Confirm password"
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                        className={errors.confirmPassword ? 'border-red-300 pr-10' : 'pr-10'}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-sm text-red-600 mt-1">{errors.confirmPassword}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Email Verified</Label>
                        <p className="text-xs text-gray-500">User has verified their email address</p>
                      </div>
                      <Switch
                        checked={formData.is_email_verified}
                        onCheckedChange={(checked) => handleInputChange('is_email_verified', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm font-medium text-gray-700">2FA Enabled</Label>
                        <p className="text-xs text-gray-500">Enable two-factor authentication</p>
                      </div>
                      <Switch
                        checked={formData.two_factor_enabled}
                        onCheckedChange={(checked) => handleInputChange('two_factor_enabled', checked)}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label className="block text-sm font-medium text-gray-700 mb-2">Account Status</Label>
                      <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)} placeholder="Select status">
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="suspended">Suspended</SelectItem>
                      </Select>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Organization & Role */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Organization & Role
                </CardTitle>
                <CardDescription>
                  Assign user to organization, department, and role
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="block text-sm font-medium text-gray-700 mb-2">
                      Organization *
                    </Label>
                    <Select value={formData.organization_id} onValueChange={(value) => handleInputChange('organization_id', value)} placeholder="Select organization">
                      <SelectItem value="1">TechCorp Inc.</SelectItem>
                      <SelectItem value="2">ClientCorp Ltd.</SelectItem>
                      <SelectItem value="3">PartnerOrg LLC</SelectItem>
                    </Select>
                    {errors.organization_id && (
                      <p className="text-sm text-red-600 mt-1">{errors.organization_id}</p>
                    )}
                  </div>

                  <div>
                    <Label className="block text-sm font-medium text-gray-700 mb-2">
                      Department *
                    </Label>
                    <Select value={formData.department} onValueChange={(value) => handleInputChange('department', value)} placeholder="Select department">
                      <SelectItem value="IT">IT</SelectItem>
                      <SelectItem value="HR">HR</SelectItem>
                      <SelectItem value="Support">Support</SelectItem>
                      <SelectItem value="Sales">Sales</SelectItem>
                      <SelectItem value="Marketing">Marketing</SelectItem>
                      <SelectItem value="Finance">Finance</SelectItem>
                      <SelectItem value="Operations">Operations</SelectItem>
                    </Select>
                    {errors.department && (
                      <p className="text-sm text-red-600 mt-1">{errors.department}</p>
                    )}
                  </div>

                  <div>
                    <Label className="block text-sm font-medium text-gray-700 mb-2">
                      Role *
                    </Label>
                    <Select value={formData.role} onValueChange={(value) => handleInputChange('role', value)} placeholder="Select role">
                      <SelectItem value="super_admin">Super Administrator</SelectItem>
                      <SelectItem value="org_admin">Organization Administrator</SelectItem>
                      <SelectItem value="agent">Agent</SelectItem>
                      <SelectItem value="client">Client</SelectItem>
                    </Select>
                    {errors.role && (
                      <p className="text-sm text-red-600 mt-1">{errors.role}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Employee Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Hash className="w-5 h-5" />
                  Employee Information
                </CardTitle>
                <CardDescription>
                  Additional employee details and metadata
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="block text-sm font-medium text-gray-700 mb-2">
                      Employee ID
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="e.g., EMP001"
                        value={formData.metadata.employee_id}
                        onChange={(e) => handleMetadataChange('employee_id', e.target.value)}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={generateEmployeeId}
                        className="whitespace-nowrap"
                      >
                        Generate
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label className="block text-sm font-medium text-gray-700 mb-2">
                      Hire Date
                    </Label>
                    <Input
                      type="date"
                      value={formData.metadata.hire_date}
                      onChange={(e) => handleMetadataChange('hire_date', e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="block text-sm font-medium text-gray-700 mb-2">
                      Manager
                    </Label>
                    <Input
                      placeholder="e.g., John Smith"
                      value={formData.metadata.manager}
                      onChange={(e) => handleMetadataChange('manager', e.target.value)}
                    />
                  </div>

                  <div>
                    <Label className="block text-sm font-medium text-gray-700 mb-2">
                      Cost Center
                    </Label>
                    <Input
                      placeholder="e.g., IT-001"
                      value={formData.metadata.cost_center}
                      onChange={(e) => handleMetadataChange('cost_center', e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* User Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  User Preview
                </CardTitle>
                <CardDescription>
                  See how the user will appear in the system
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {formData.full_name || 'User Name'}
                      </h3>
                      {formData.is_email_verified && (
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                      {formData.two_factor_enabled && (
                        <Badge className="bg-blue-100 text-blue-800">
                          <Shield className="w-3 h-3 mr-1" />
                          2FA
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">
                      {formData.email || 'user@example.com'}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {formData.job_title || 'Position'} • {formData.organization_id === '1' ? 'TechCorp Inc.' : formData.organization_id === '2' ? 'ClientCorp Ltd.' : 'PartnerOrg LLC'}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className={getRoleInfo(formData.role).color}>
                        <RoleIcon className="w-3 h-3 mr-1" />
                        {getRoleInfo(formData.role).label}
                      </Badge>
                      <Badge className={getStatusInfo(formData.status).color}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {getStatusInfo(formData.status).label}
                      </Badge>
                      {formData.department && (
                        <Badge className="bg-purple-100 text-purple-800">
                          {formData.department}
                        </Badge>
                      )}
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
                  Create User
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateUserDialog;
