import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSuperAdminAuth } from '@/contexts/SuperAdminAuthContext';
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
  AlertDescription,
  Checkbox
} from '@/components/ui';
import { Eye, EyeOff, Mail, Lock, Loader2, Shield } from 'lucide-react';

const SuperAdminLogin = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login, isAuthenticated, isLoading, error, clearError } = useSuperAdminAuth();

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        remember: false
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated) {
            const from = location.state?.from?.pathname || '/superadmin/dashboard';
            navigate(from, { replace: true });
        }
    }, [isAuthenticated, navigate, location]);

    // Clear error when component mounts
    useEffect(() => {
        clearError();
    }, [clearError]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (isSubmitting) return;

        try {
            setIsSubmitting(true);
            clearError();

            await login(formData.email, formData.password, formData.remember);

            // Navigation will be handled by useEffect when isAuthenticated changes
        } catch (error) {
            // Error is already set in the context
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleForgotPassword = () => {
        navigate('/superadmin/forgot-password');
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="max-w-md w-full space-y-8">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Initializing...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
            <Card className="max-w-md w-full">
                <CardHeader className="text-center">
                    <div className="mx-auto h-16 w-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mb-4">
                        <Shield className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle className="text-3xl font-extrabold text-gray-900">
                        SuperAdmin Access
                    </CardTitle>
                    <CardDescription>
                        Enter your credentials to access the admin panel
                    </CardDescription>
                </CardHeader>

                <CardContent>

                {/* Login Form */}
                <form className="space-y-6" onSubmit={handleSubmit}>
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
                            autoComplete="email"
                            required
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="Enter your email address"
                        />
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
                                autoComplete="current-password"
                                required
                                value={formData.password}
                                onChange={handleInputChange}
                                placeholder="Enter your password"
                                className="pr-12"
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-gray-600"
                            >
                                {showPassword ? (
                                    <EyeOff className="h-4 w-4" />
                                ) : (
                                    <Eye className="h-4 w-4" />
                                )}
                            </Button>
                        </div>
                    </div>

                    {/* Remember Me & Forgot Password */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="remember"
                                name="remember"
                                checked={formData.remember}
                                onCheckedChange={(checked) =>
                                    setFormData(prev => ({ ...prev, remember: checked }))
                                }
                            />
                            <Label htmlFor="remember" className="text-sm text-gray-900">
                                Remember me
                            </Label>
                        </div>

                        <Button
                            type="button"
                            variant="link"
                            onClick={handleForgotPassword}
                            className="p-0 h-auto text-sm"
                        >
                            Forgot your password?
                        </Button>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <Alert variant="destructive">
                            <AlertDescription>
                                <strong>Authentication Error:</strong> {error}
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Submit Button */}
                    <Button
                        type="submit"
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Signing in...
                            </>
                        ) : (
                            <>
                                <Shield className="mr-2 h-4 w-4" />
                                Sign in
                            </>
                        )}
                    </Button>

                    {/* Security Notice */}
                    <div className="text-center">
                        <p className="text-xs text-gray-500">
                            This is a secure SuperAdmin portal. All activities are logged and monitored.
                        </p>
                    </div>
                </form>

                {/* Demo Accounts */}
                <Card className="mt-6">
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
                        {/* Test Super Admin */}
                        <div
                            className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 cursor-pointer hover:shadow-md hover:border-indigo-300 transition-all duration-200 active:scale-95"
                            onClick={() => {
                                setFormData({
                                    email: 'superadmin@test.com',
                                    password: 'Password123!',
                                    remember: false
                                });
                            }}
                        >
                            <div className="font-bold text-gray-800 uppercase text-sm">TEST SUPER ADMIN</div>
                            <div className="text-sm text-gray-600 mt-1">
                                <span className="font-medium">superadmin@test.com</span>
                                <span className="mx-2">•</span>
                                <span className="font-mono">Password123!</span>
                            </div>
                        </div>

                        {/* Production Super Admin */}
                        <div
                            className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg shadow-sm border-2 border-purple-200 p-4 cursor-pointer hover:shadow-md hover:border-purple-300 transition-all duration-200 active:scale-95"
                            onClick={() => {
                                setFormData({
                                    email: 'superadmin@chatbot-saas.com',
                                    password: 'SuperAdmin123!',
                                    remember: false
                                });
                            }}
                        >
                            <div className="font-bold text-purple-800 uppercase text-sm flex items-center">
                                <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                                PRODUCTION SUPER ADMIN
                            </div>
                            <div className="text-sm text-purple-600 mt-1">
                                <span className="font-medium">superadmin@chatbot-saas.com</span>
                                <span className="mx-2">•</span>
                                <span className="font-mono">SuperAdmin123!</span>
                            </div>
                            <div className="text-xs text-purple-500 mt-1 italic">
                                Production environment access
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Back to Main Site */}
                <div className="text-center">
                    <Button
                        type="button"
                        variant="link"
                        onClick={() => navigate('/')}
                        className="text-sm text-gray-600 hover:text-gray-900 p-0 h-auto"
                    >
                        ← Back to main site
                    </Button>
                </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default SuperAdminLogin;
