import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

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

  console.log('🔐 Login component rendering...');

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
        console.log('✅ Login successful, redirecting...');

        // Redirect based on role
        console.log('🔄 Login redirect - User role:', result.user.role);

        switch (result.user.role) {
          case 'super_admin':
            console.log('🔄 Redirecting to /superadmin');
            navigate('/superadmin');
            break;
          case 'org_admin':
            console.log('🔄 Redirecting to /dashboard');
            navigate('/dashboard');
            break;
          case 'agent':
            console.log('🔄 Redirecting to /agent');
            navigate('/agent');
            break;
          case 'customer':
            console.log('🔄 Redirecting to /dashboard');
            navigate('/dashboard');
            break;
          default:
            console.log('🔄 Default redirect - checking permissions');
            // Fallback based on permissions
            if (result.user.permissions && result.user.permissions.includes('*')) {
              console.log('🔄 Redirecting to /superadmin (permission fallback)');
              navigate('/superadmin');
            } else {
              console.log('🔄 Redirecting to /dashboard (default fallback)');
              navigate('/dashboard');
            }
        }
      }
    } catch (error) {
      console.error('❌ Login failed:', error);
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
    <div className="bg-white py-8 px-4 shadow-xl sm:rounded-lg sm:px-10 border border-gray-200">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome Back
        </h1>
        <p className="text-gray-600">
          Sign in to your ChatBot Pro account
        </p>
      </div>



      {/* Login Form */}
      <form className="space-y-6" onSubmit={handleSubmit} noValidate>
        {/* Email Field */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <div className="relative">
            <input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              className={`
                appearance-none block w-full px-4 py-3 border rounded-lg shadow-sm
                placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                sm:text-sm transition-colors duration-200
                ${errors.email ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'}
              `}
              placeholder="Enter your email address"
              disabled={isLoading || authLoading}
            />
            {errors.email && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>
          {errors.email && (
            <p className="mt-2 text-sm text-red-600 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.email}
            </p>
          )}
        </div>

        {/* Password Field */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              required
              value={formData.password}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              className={`
                appearance-none block w-full px-4 py-3 pr-12 border rounded-lg shadow-sm
                placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                sm:text-sm transition-colors duration-200
                ${errors.password ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'}
              `}
              placeholder="Enter your password"
              disabled={isLoading || authLoading}
            />

            {/* Password Toggle Button */}
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
              disabled={isLoading || authLoading}
            >
              {showPassword ? (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
          {errors.password && (
            <p className="mt-2 text-sm text-red-600 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.password}
            </p>
          )}
        </div>

        {/* General Error Display */}
        {errors.general && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800">
                  {errors.general}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            disabled={isLoading || authLoading}
            className={`
              w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg
              shadow-sm text-sm font-medium text-white transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
              disabled:opacity-50 disabled:cursor-not-allowed
              ${isLoading || authLoading
                ? 'bg-blue-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
              }
            `}
          >
            {isLoading || authLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Signing in...
              </>
            ) : (
              'Sign in'
            )}
          </button>
        </div>
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
      </div>
    </div>
  );
};

export default Login;
