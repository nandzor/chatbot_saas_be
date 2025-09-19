/**
 * Edit User Dialog
 * Dialog untuk mengedit user yang sudah ada
 */

import React, { useState, useCallback, useEffect } from 'react';
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
  Select,
  SelectItem,
  Alert,
  AlertDescription,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui';
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  Loader2,
  Shield,
  Settings
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { handleError } from '@/utils/errorHandler';
import { sanitizeInput, validateInput } from '@/utils/securityUtils';
import UserManagementService from '@/services/UserManagementService';

const userManagementService = new UserManagementService();

const EditUserDialog = ({ open, onOpenChange, user, onUserUpdated }) => {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [activeTab, setActiveTab] = useState('profile');
  const [formData, setFormData] = useState({
    full_name: '',
    username: '',
    email: '',
    role: 'agent',
    status: 'active',
    password: '',
    confirm_password: ''
  });

  // Update form data when user changes
  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || '',
        username: user.username || '',
        email: user.email || '',
        role: user.role || 'agent',
        status: user.status || 'active',
        password: '',
        confirm_password: ''
      });
      setErrors({});
    }
  }, [user]);

  // Handle form input changes
  const handleInputChange = useCallback((field, value) => {
    const sanitizedValue = sanitizeInput(value);
    setFormData(prev => ({ ...prev, [field]: sanitizedValue }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  }, [errors]);

  // Validate form
  const validateForm = useCallback(() => {
    const newErrors = {};

    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Full name is required';
    } else if (formData.full_name.length < 2) {
      newErrors.full_name = 'Full name must be at least 2 characters';
    }

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Only validate password if it's provided
    if (formData.password) {
      if (formData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters';
      }
      if (formData.password !== formData.confirm_password) {
        newErrors.confirm_password = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // Handle form submission
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors before submitting');
      return;
    }

    try {
      setLoading(true);

      const updateData = {
        full_name: formData.full_name,
        username: formData.username,
        email: formData.email,
        role: formData.role,
        status: formData.status
      };

      // Only include password if it's provided
      if (formData.password) {
        updateData.password = formData.password;
      }

      const response = await userManagementService.updateUser(user.id, updateData);

      if (response.success) {
        toast.success('User updated successfully');
        onUserUpdated(response.data);
        onOpenChange(false);
      } else {
        throw new Error(response.message || 'Failed to update user');
      }
    } catch (err) {
      const errorResult = handleError(err, {
        context: 'Update User',
        showToast: true
      });

      // Handle validation errors from backend
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      }
    } finally {
      setLoading(false);
    }
  }, [formData, validateForm, user, onUserUpdated, onOpenChange]);

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-100">
          <DialogTitle className="flex items-center text-xl font-semibold text-gray-900">
            <User className="h-5 w-5 mr-3 text-blue-600" />
            Edit User
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-600 mt-1">
            Update user information and settings.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="px-6 py-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 bg-gray-100">
              <TabsTrigger value="profile" className="text-sm font-medium">Profile</TabsTrigger>
              <TabsTrigger value="security" className="text-sm font-medium">Security</TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Full Name */}
                <div className="space-y-2.5">
                  <Label htmlFor="full_name" className="text-sm font-semibold text-gray-700 block">
                    Full Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => handleInputChange('full_name', e.target.value)}
                    placeholder="Enter full name"
                    className={`h-12 px-4 text-sm ${errors.full_name ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : 'focus:border-blue-500 focus:ring-blue-200'}`}
                  />
                  {errors.full_name && (
                    <p className="text-xs text-red-600 flex items-center mt-1">
                      <AlertCircle className="h-3 w-3 mr-1.5 flex-shrink-0" />
                      {errors.full_name}
                    </p>
                  )}
                </div>

                {/* Username */}
                <div className="space-y-2.5">
                  <Label htmlFor="username" className="text-sm font-semibold text-gray-700 block">
                    Username <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                    placeholder="Enter username"
                    className={`h-12 px-4 text-sm ${errors.username ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : 'focus:border-blue-500 focus:ring-blue-200'}`}
                  />
                  {errors.username && (
                    <p className="text-xs text-red-600 flex items-center mt-1">
                      <AlertCircle className="h-3 w-3 mr-1.5 flex-shrink-0" />
                      {errors.username}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-2.5">
                  <Label htmlFor="email" className="text-sm font-semibold text-gray-700 block">
                    Email <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="Enter email address"
                      className={`h-12 pl-12 pr-4 text-sm ${errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : 'focus:border-blue-500 focus:ring-blue-200'}`}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-xs text-red-600 flex items-center mt-1">
                      <AlertCircle className="h-3 w-3 mr-1.5 flex-shrink-0" />
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Role */}
                <div className="space-y-2.5">
                  <Label htmlFor="role" className="text-sm font-semibold text-gray-700 block">
                    Role <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value) => handleInputChange('role', value)}
                  >
                    <SelectItem value="org_admin">Admin</SelectItem>
                    <SelectItem value="agent">Agent</SelectItem>
                    <SelectItem value="user">User</SelectItem>
                  </Select>
                </div>

                {/* Status */}
                <div className="space-y-2.5">
                  <Label htmlFor="status" className="text-sm font-semibold text-gray-700 block">
                    Status <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => handleInputChange('status', value)}
                  >
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </Select>
                </div>
              </div>
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security" className="space-y-6">
              <Alert className="bg-amber-50 border-amber-200">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-800">
                  Leave password fields empty to keep the current password.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* New Password */}
                <div className="space-y-2.5">
                  <Label htmlFor="password" className="text-sm font-semibold text-gray-700 block">
                    New Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      placeholder="Enter new password"
                      className={`h-12 pl-12 pr-14 text-sm ${errors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : 'focus:border-blue-500 focus:ring-blue-200'}`}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-gray-100 rounded-md"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-500" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-500" />
                      )}
                    </Button>
                  </div>
                  {errors.password && (
                    <p className="text-xs text-red-600 flex items-center mt-1">
                      <AlertCircle className="h-3 w-3 mr-1.5 flex-shrink-0" />
                      {errors.password}
                    </p>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="space-y-2.5">
                  <Label htmlFor="confirm_password" className="text-sm font-semibold text-gray-700 block">
                    Confirm New Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="confirm_password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.confirm_password}
                      onChange={(e) => handleInputChange('confirm_password', e.target.value)}
                      placeholder="Confirm new password"
                      className={`h-12 pl-12 pr-4 text-sm ${errors.confirm_password ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : 'focus:border-blue-500 focus:ring-blue-200'}`}
                    />
                  </div>
                  {errors.confirm_password && (
                    <p className="text-xs text-red-600 flex items-center mt-1">
                      <AlertCircle className="h-3 w-3 mr-1.5 flex-shrink-0" />
                      {errors.confirm_password}
                    </p>
                  )}
                </div>
              </div>

              {/* Password Requirements */}
              {formData.password && (
                <div className="mt-8">
                  <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 shadow-sm">
                    <CardHeader className="px-5 py-4 pb-3">
                      <CardTitle className="text-sm font-semibold text-blue-900 flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2 text-blue-600" />
                        Password Requirements
                      </CardTitle>
                      <CardDescription className="text-xs text-blue-700 mt-1">
                        Password must meet the following criteria:
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="px-5 pt-0 pb-4">
                      <ul className="text-xs text-blue-700 space-y-2.5">
                        <li className="flex items-start">
                          <CheckCircle className="h-3.5 w-3.5 mr-2.5 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>At least 8 characters long</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle className="h-3.5 w-3.5 mr-2.5 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>Contains uppercase and lowercase letters</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle className="h-3.5 w-3.5 mr-2.5 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>Contains at least one number</span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>
          </Tabs>

          <DialogFooter className="px-0 pt-8 pb-0 border-t border-gray-100 mt-8">
            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
                className="w-full sm:w-32 h-11 text-sm font-medium"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="w-full sm:w-40 h-11 text-sm font-medium bg-blue-600 hover:bg-blue-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <User className="h-4 w-4 mr-2" />
                    Update User
                  </>
                )}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditUserDialog;
