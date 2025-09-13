/**
 * Enhanced Login Page
 * Login dengan Form component dan enhanced error handling
 */

import React, { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import {
  useLoadingStates,
  LoadingButton
} from '@/utils/loadingStates';
import {
  handleError,
  withErrorHandling
} from '@/utils/errorHandler';
import {
  useAnnouncement,
  useFocusManagement
} from '@/utils/accessibilityUtils';
import {
  sanitizeInput,
  validateInput
} from '@/utils/securityUtils';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Alert,
  AlertDescription,
  Form
} from '@/components/ui';
import { Eye, EyeOff, Mail, Lock, Loader2, AlertCircle } from 'lucide-react';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [rememberMe, setRememberMe] = useState(false);

  const { login, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { announce } = useAnnouncement();
  const { focusRef, setFocus } = useFocusManagement();
  const { setLoading, getLoadingState } = useLoadingStates();

  // Form fields configuration
  const formFields = [
    {
      name: 'email',
      type: 'email',
      label: 'Email Address',
      placeholder: 'Enter your email',
      autoComplete: 'email',
      required: true,
      icon: Mail
    },
    {
      name: 'password',
      type: 'password',
      label: 'Password',
      placeholder: 'Enter your password',
      autoComplete: 'current-password',
      required: true,
      icon: Lock,
      showPasswordToggle: true
    }
  ];

  // Validation rules
  const validationRules = {
    email: {
      required: true,
      custom: (value) => {
        if (!value || !value.includes('@')) {
          return 'Please enter a valid email address';
        }
        return null;
      }
    },
    password: {
      required: true,
      minLength: 6,
      custom: (value) => {
        if (!value || value.length < 6) {
          return 'Password must be at least 6 characters';
        }
        return null;
      }
    }
  };

  // Get redirect path based on user role
  const getRedirectPath = useCallback((user) => {
    if (!user) return '/dashboard';

    const role = user.role || user.userRole;

    switch (role) {
      case 'super_admin':
      case 'superadmin':
        return '/superadmin';
      case 'admin':
      case 'organization_admin':
        return '/admin';
      case 'agent':
        return '/agent';
      case 'customer':
        return '/customer';
      default:
        return '/dashboard';
    }
  }, []);

  // Handle form submission
  const handleSubmit = useCallback(async (values, options = {}) => {
    try {
      setLoading('submit', true);
      setError(null);

      // Sanitize input
      const sanitizedData = {
        email: sanitizeInput(values.email),
        password: sanitizeInput(values.password)
      };

      // Perform login
      const loginResult = await login(sanitizedData.email, sanitizedData.password, rememberMe);

      // Get redirect path based on user role
      const redirectPath = getRedirectPath(loginResult?.user);

      announce(`Login successful! Redirecting to ${redirectPath}...`);
      navigate(redirectPath);
    } catch (err) {
      const errorResult = handleError(err, {
        context: 'Login',
        showToast: true
      });
      setError(errorResult.message);
      announce('Login failed. Please check your credentials.');
    } finally {
      setLoading('submit', false);
    }
  }, [login, navigate, rememberMe, setLoading, announce, getRedirectPath]);

  // Handle remember me change
  const handleRememberMeChange = useCallback((e) => {
    setRememberMe(e.target.checked);
  }, []);

  // Handle forgot password
  const handleForgotPassword = useCallback(() => {
    navigate('/auth/forgot-password');
    announce('Navigating to forgot password page');
  }, [navigate, announce]);

  // Handle register navigation
  const handleRegister = useCallback(() => {
    navigate('/auth/register');
    announce('Navigating to register page');
  }, [navigate, announce]);

  // Focus management on mount
  useEffect(() => {
    setFocus();
  }, [setFocus]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Or{' '}
            <button
              onClick={handleRegister}
              className="font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:underline"
            >
              create a new account
            </button>
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Login Form */}
        <Form
          title=""
          description=""
          fields={formFields}
          initialValues={formData}
          validationRules={validationRules}
          onSubmit={handleSubmit}
          submitText="Sign In"
          showProgress={false}
          autoSave={false}
          maxAttempts={1000}
          className="bg-white shadow-xl rounded-lg"
        >
          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={handleRememberMeChange}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <button
                type="button"
                onClick={handleForgotPassword}
                className="font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:underline"
              >
                Forgot your password?
              </button>
            </div>
          </div>
        </Form>

        {/* Demo Accounts */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-lg font-semibold text-gray-800">
              <span className="border-t border-gray-300 w-8 inline-block mr-3"></span>
              Demo Accounts
              <span className="border-t border-gray-300 w-8 inline-block ml-3"></span>
            </CardTitle>
            <CardDescription className="text-center text-sm text-gray-600">
              Click on any account to auto-fill the login form
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Organization Admin */}
            <div
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 cursor-pointer hover:shadow-md hover:border-indigo-300 transition-all duration-200 active:scale-95"
              onClick={() => {
                setFormData({
                  email: 'admin@test.com',
                  password: 'Password123!'
                });
                announce('Organization Admin credentials filled - will redirect to /admin');
              }}
            >
              <div className="font-bold text-gray-800 uppercase text-sm">ORGANIZATION ADMIN</div>
              <div className="text-sm text-gray-600 mt-1">
                <span className="font-medium">admin@test.com</span>
                <span className="mx-2">•</span>
                <span className="font-mono">Password123!</span>
              </div>
            </div>

            {/* Customer */}
            <div
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 cursor-pointer hover:shadow-md hover:border-indigo-300 transition-all duration-200 active:scale-95"
              onClick={() => {
                setFormData({
                  email: 'customer@test.com',
                  password: 'Password123!'
                });
                announce('Customer credentials filled - will redirect to /customer');
              }}
            >
              <div className="font-bold text-gray-800 uppercase text-sm">CUSTOMER</div>
              <div className="text-sm text-gray-600 mt-1">
                <span className="font-medium">customer@test.com</span>
                <span className="mx-2">•</span>
                <span className="font-mono">Password123!</span>
              </div>
            </div>

            {/* Agent */}
            <div
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 cursor-pointer hover:shadow-md hover:border-indigo-300 transition-all duration-200 active:scale-95"
              onClick={() => {
                setFormData({
                  email: 'agent@test.com',
                  password: 'Password123!'
                });
                announce('Agent credentials filled - will redirect to /agent');
              }}
            >
              <div className="font-bold text-gray-800 uppercase text-sm">AGENT</div>
              <div className="text-sm text-gray-600 mt-1">
                <span className="font-medium">agent@test.com</span>
                <span className="mx-2">•</span>
                <span className="font-mono">Password123!</span>
              </div>
            </div>

            {/* Super Admin */}
            <div
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 cursor-pointer hover:shadow-md hover:border-indigo-300 transition-all duration-200 active:scale-95"
              onClick={() => {
                setFormData({
                  email: 'superadmin@test.com',
                  password: 'Password123!'
                });
                announce('Super Admin credentials filled - will redirect to /superadmin');
              }}
            >
              <div className="font-bold text-gray-800 uppercase text-sm">SUPER ADMIN</div>
              <div className="text-sm text-gray-600 mt-1">
                <span className="font-medium">superadmin@test.com</span>
                <span className="mx-2">•</span>
                <span className="font-mono">Password123!</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Loading Overlay */}
        {getLoadingState('submit') && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="p-6">
              <CardContent className="flex flex-col items-center space-y-4">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                <p className="text-sm text-gray-600">Signing you in...</p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default withErrorHandling(Login, {
  context: 'Login Page'
});
