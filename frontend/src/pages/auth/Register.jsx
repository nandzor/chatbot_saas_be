/**
 * Enhanced Register Page
 * Register dengan Form component dan enhanced validation
 */

import React, { useState, useCallback, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
import { Eye, EyeOff, Mail, Lock, User, Building, CheckCircle } from 'lucide-react';

const Register = () => {
  const navigate = useNavigate();
  const { announce } = useAnnouncement();
  const { focusRef, setFocus } = useFocusManagement();
  const { setLoading, getLoadingState } = useLoadingStates();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    organization: '',
    role: 'manager',
    termsAccepted: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Form fields configuration
  const formFields = [
    {
      name: 'name',
      type: 'text',
      label: 'Full Name',
      placeholder: 'Enter your full name',
      autoComplete: 'name',
      required: true,
      icon: User
    },
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
      placeholder: 'Create a password',
      autoComplete: 'new-password',
      required: true,
      icon: Lock,
      showPasswordToggle: true
    },
    {
      name: 'confirmPassword',
      type: 'password',
      label: 'Confirm Password',
      placeholder: 'Confirm your password',
      autoComplete: 'new-password',
      required: true,
      icon: Lock,
      showPasswordToggle: true
    },
    {
      name: 'organization',
      type: 'text',
      label: 'Organization',
      placeholder: 'Enter your organization name',
      autoComplete: 'organization',
      required: true,
      icon: Building
    },
    {
      name: 'role',
      type: 'select',
      label: 'Role',
      required: true,
      options: [
        { value: 'manager', label: 'Manager' },
        { value: 'admin', label: 'Admin' },
        { value: 'user', label: 'User' }
      ]
    }
  ];

  // Validation rules
  const validationRules = {
    name: {
      required: true,
      minLength: 2,
      maxLength: 50,
      custom: (value) => {
        if (!validateInput.noScriptTags(value)) {
          return 'Invalid characters detected';
        }
        return null;
      }
    },
    email: {
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      patternMessage: 'Please enter a valid email address',
      custom: (value) => {
        if (!validateInput.email(value)) {
          return 'Please enter a valid email address';
        }
        return null;
      }
    },
    password: {
      required: true,
      minLength: 8,
      custom: (value) => {
        if (!validateInput.password(value)) {
          return 'Password must be at least 8 characters with uppercase, lowercase, number, and special character';
        }
        return null;
      }
    },
    confirmPassword: {
      required: true,
      custom: (value, allValues) => {
        if (value !== allValues.password) {
          return 'Passwords do not match';
        }
        return null;
      }
    },
    organization: {
      required: true,
      minLength: 2,
      maxLength: 100,
      custom: (value) => {
        if (!validateInput.noScriptTags(value)) {
          return 'Invalid characters detected';
        }
        return null;
      }
    },
    role: {
      required: true
    }
  };

  // Handle form submission
  const handleSubmit = useCallback(async (values, options = {}) => {
    try {
      setLoading('submit', true);
      setError(null);
      setSuccess(false);

      // Sanitize input
      const sanitizedData = {
        name: sanitizeInput(values.name),
        email: sanitizeInput(values.email),
        password: sanitizeInput(values.password),
        confirmPassword: sanitizeInput(values.confirmPassword),
        organization: sanitizeInput(values.organization),
        role: values.role
      };

      // Validate passwords match
      if (sanitizedData.password !== sanitizedData.confirmPassword) {
        throw new Error('Passwords do not match');
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      setSuccess(true);
      announce('Registration successful! Redirecting to login...');

      // Redirect to login after success
      setTimeout(() => {
        navigate('/auth/login');
      }, 2000);
    } catch (err) {
      const errorResult = handleError(err, {
        context: 'Registration',
        showToast: true
      });
      setError(errorResult.message);
      announce('Registration failed. Please try again.');
    } finally {
      setLoading('submit', false);
    }
  }, [navigate, setLoading, announce]);

  // Handle login navigation
  const handleLogin = useCallback(() => {
    navigate('/auth/login');
    announce('Navigating to login page');
  }, [navigate, announce]);

  // Focus management on mount
  useEffect(() => {
    setFocus();
  }, [setFocus]);

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <Card className="max-w-md w-full">
          <CardContent className="p-6">
            <div className="text-center">
              <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
              <h2 className="mt-4 text-2xl font-bold text-gray-900">
                Registration Successful!
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Your account has been created. Redirecting to login...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Or{' '}
            <button
              onClick={handleLogin}
              className="font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:underline"
            >
              sign in to your existing account
            </button>
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Registration Form */}
        <Form
          title=""
          description=""
          fields={formFields}
          initialValues={formData}
          validationRules={validationRules}
          onSubmit={handleSubmit}
          submitText="Create Account"
          showProgress={true}
          autoSave={false}
          className="bg-white shadow-xl rounded-lg"
        >
          {/* Terms and Conditions */}
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                required
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="terms" className="text-gray-700">
                I agree to the{' '}
                <a href="#" className="text-indigo-600 hover:text-indigo-500">
                  Terms and Conditions
                </a>{' '}
                and{' '}
                <a href="#" className="text-indigo-600 hover:text-indigo-500">
                  Privacy Policy
                </a>
              </label>
            </div>
          </div>
        </Form>

        {/* Loading Overlay */}
        {getLoadingState('submit') && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="p-6">
              <CardContent className="flex flex-col items-center space-y-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                <p className="text-sm text-gray-600">Creating your account...</p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default withErrorHandling(Register, {
  context: 'Register Page'
});
