import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Label,
  Alert,
  AlertDescription
} from '@/components/ui';
import { Eye, EyeOff, Mail, Lock, Loader2 } from 'lucide-react';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const { login, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();


  // Form validation
  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      // Prepare credentials for email login
      const credentials = { email: formData.email, password: formData.password };

      const result = await login(credentials.email, credentials.password);
      if (result.success) {
        // Redirect based on role
        switch (result.user.role) {
          case 'super_admin':
            navigate('/superadmin');
            break;
          case 'org_admin':
            navigate('/dashboard');
            break;
          case 'agent':
            navigate('/agent');
            break;
          case 'customer':
            navigate('/dashboard');
            break;
          default:
            // Fallback based on permissions
            if (result.user.permissions && result.user.permissions.includes('*')) {
              navigate('/superadmin');
            } else {
              navigate('/dashboard');
            }
        }
      }
    } catch (error) {
      setErrors({ general: error.message || 'Login failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear field-specific error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Handle demo user login with email only
  const handleDemoLogin = (demoUser) => {
    setFormData({
      email: demoUser.email,
      password: demoUser.password
    });
    setErrors({});
  };



  // Handle key press events
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isLoading) {
      handleSubmit(e);
    }
  };

  // Auto-focus email field on mount
  useEffect(() => {
    const emailInput = document.getElementById('email');
    if (emailInput) {
      emailInput.focus();
    }
  }, []);

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-bold">
          Welcome Back
        </CardTitle>
        <CardDescription>
          Sign in to your ChatBot Pro account
        </CardDescription>
      </CardHeader>

      <CardContent>



      {/* Login Form */}
      <form className="space-y-6" onSubmit={handleSubmit} noValidate>
        {/* Email Field */}
        <div className="space-y-2">
          <Label htmlFor="email" className="flex items-center space-x-2">
            <Mail className="h-4 w-4" />
            <span>Email Address</span>
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            value={formData.email}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="Enter your email address"
            disabled={isLoading || authLoading}
            className={errors.email ? 'border-red-500' : ''}
          />
          {errors.email && (
            <Alert variant="destructive" className="py-2">
              <AlertDescription className="text-sm">
                {errors.email}
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <Label htmlFor="password" className="flex items-center space-x-2">
            <Lock className="h-4 w-4" />
            <span>Password</span>
          </Label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              required
              value={formData.password}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Enter your password"
              disabled={isLoading || authLoading}
              className={errors.password ? 'border-red-500 pr-12' : 'pr-12'}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-gray-600"
              disabled={isLoading || authLoading}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          </div>
          {errors.password && (
            <Alert variant="destructive" className="py-2">
              <AlertDescription className="text-sm">
                {errors.password}
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* General Error Display */}
        {errors.general && (
          <Alert variant="destructive">
            <AlertDescription>
              {errors.general}
            </AlertDescription>
          </Alert>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full"
          disabled={isLoading || authLoading}
        >
          {isLoading || authLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            'Sign in'
          )}
        </Button>
      </form>

      {/* Demo Users Section */}
      <div className="mt-8">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-gray-500 font-medium">
              Demo Accounts
            </span>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-3">
          {/* Unified Auth Demo Users */}
          <button
            onClick={() => handleDemoLogin({ email: 'admin@test.com', password: 'Password123!' })}
            disabled={isLoading || authLoading}
            className={`
              w-full inline-flex justify-center items-center py-3 px-4 border border-gray-300
              rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700
              transition-all duration-200 hover:bg-gray-50 hover:border-gray-400
              disabled:opacity-50 disabled:cursor-not-allowed
              ${isLoading || authLoading ? 'cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            <div className="text-center">
              <div className="font-semibold text-gray-900 mb-1">ORGANIZATION ADMIN</div>
              <div className="text-xs text-gray-500">
                <span className="font-mono">admin@test.com</span>
                <span className="mx-2">•</span>
                <span className="font-mono">Password123!</span>
              </div>
            </div>
          </button>

          <button
            onClick={() => handleDemoLogin({ email: 'customer@test.com', password: 'Password123!' })}
            disabled={isLoading || authLoading}
            className={`
              w-full inline-flex justify-center items-center py-3 px-4 border border-gray-300
              rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700
              transition-all duration-200 hover:bg-gray-50 hover:border-gray-400
              disabled:opacity-50 disabled:cursor-not-allowed
              ${isLoading || authLoading ? 'cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            <div className="text-center">
              <div className="font-semibold text-gray-900 mb-1">CUSTOMER</div>
              <div className="text-xs text-gray-500">
                <span className="font-mono">customer@test.com</span>
                <span className="mx-2">•</span>
                <span className="font-mono">Password123!</span>
              </div>
            </div>
          </button>

          <button
            onClick={() => handleDemoLogin({ email: 'agent@test.com', password: 'Password123!' })}
            disabled={isLoading || authLoading}
            className={`
              w-full inline-flex justify-center items-center py-3 px-4 border border-gray-300
              rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700
              transition-all duration-200 hover:bg-gray-50 hover:border-gray-400
              disabled:opacity-50 disabled:cursor-not-allowed
              ${isLoading || authLoading ? 'cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            <div className="text-center">
              <div className="font-semibold text-gray-900 mb-1">AGENT</div>
              <div className="text-xs text-gray-500">
                <span className="font-mono">agent@test.com</span>
                <span className="mx-2">•</span>
                <span className="font-mono">Password123!</span>
              </div>
            </div>
          </button>

          <button
            onClick={() => handleDemoLogin({ email: 'superadmin@test.com', password: 'Password123!' })}
            disabled={isLoading || authLoading}
            className={`
              w-full inline-flex justify-center items-center py-3 px-4 border border-gray-300
              rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700
              transition-all duration-200 hover:bg-gray-50 hover:border-gray-400
              disabled:opacity-50 disabled:cursor-not-allowed
              ${isLoading || authLoading ? 'cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            <div className="text-center">
              <div className="font-semibold text-gray-900 mb-1">SUPER ADMIN</div>
              <div className="text-xs text-gray-500">
                <span className="font-mono">superadmin@test.com</span>
                <span className="mx-2">•</span>
                <span className="font-mono">Password123!</span>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Footer Links */}
      <div className="mt-8 text-center space-y-3">
        <Link
          to="/auth/forgot-password"
          className="text-sm text-blue-600 hover:text-blue-500 hover:underline transition-colors duration-200"
        >
          Forgot your password?
        </Link>

        <div className="text-sm text-gray-600">
          Don't have an account?{' '}
          <Link
            to="/auth/register"
            className="text-blue-600 hover:text-blue-500 hover:underline font-medium transition-colors duration-200"
          >
            Sign up
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default Login;
