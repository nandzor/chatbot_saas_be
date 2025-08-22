import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
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
  Badge
} from '@/components/ui';
import { 
  LogIn,
  Eye,
  EyeOff,
  User,
  Shield,
  UserCheck,
  Loader2,
  Users
} from 'lucide-react';

const Login = () => {
  const { login, isLoading, testUsers } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.username || !formData.password) {
      setError('Username dan password harus diisi');
      return;
    }

    const result = await login(formData.username, formData.password);
    if (!result.success) {
      setError(result.error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const useTestUser = (user) => {
    setFormData({
      username: user.username,
      password: user.password
    });
    setError('');
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'superadmin':
        return <Shield className="w-4 h-4" />;
      case 'organization_admin':
        return <Users className="w-4 h-4" />;
      case 'agent':
        return <UserCheck className="w-4 h-4" />;
      default:
        return <User className="w-4 h-4" />;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'superadmin':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'organization_admin':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'agent':
        return 'bg-green-100 text-green-700 border-green-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'superadmin':
        return 'Super Admin';
      case 'organization_admin':
        return 'Org Admin';
      case 'agent':
        return 'Agent';
      default:
        return role;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-6 lg:py-8">
        {/* Header */}
        <div className="text-center mb-6 lg:mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">ChatBot Pro</h1>
          <p className="text-sm lg:text-base text-gray-600">Sistem Manajemen Chatbot</p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-12">
            
            {/* Login Form */}
            <div className="flex items-center justify-center">
              <Card className="w-full max-w-md shadow-lg">
                <CardHeader className="text-center pb-6">
                  <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
                    <LogIn className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl font-bold text-gray-900">Login</CardTitle>
                  <CardDescription className="text-gray-600">
                    Masuk ke sistem chatbot management
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="username" className="text-sm font-medium text-gray-700">Username</Label>
                      <Input
                        id="username"
                        name="username"
                        type="text"
                        value={formData.username}
                        onChange={handleInputChange}
                        placeholder="Masukkan username"
                        disabled={isLoading}
                        className="h-11"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-sm font-medium text-gray-700">Password</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          value={formData.password}
                          onChange={handleInputChange}
                          placeholder="Masukkan password"
                          disabled={isLoading}
                          className="h-11 pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                          disabled={isLoading}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full h-11 text-base font-medium" 
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Logging in...
                        </>
                      ) : (
                        <>
                          <LogIn className="mr-2 h-4 w-4" />
                          Login
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Test Users */}
            <div className="space-y-6">
              <div className="text-center xl:text-left">
                <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-2">Test Users</h2>
                <p className="text-sm lg:text-base text-gray-600">Klik "Use" untuk auto-fill username dan password</p>
              </div>

              <div className="space-y-4">
                {testUsers.map((user) => (
                  <Card key={user.id} className="transition-all hover:shadow-md border-gray-200">
                    <CardContent className="p-4">
                      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3">
                            <div className="flex items-center gap-2 min-w-0">
                              {getRoleIcon(user.role)}
                              <h3 className="font-semibold text-gray-900 truncate">{user.name}</h3>
                            </div>
                            <Badge className={`${getRoleColor(user.role)} flex-shrink-0 w-fit`}>
                              {getRoleLabel(user.role)}
                            </Badge>
                          </div>
                          
                          <div className="space-y-1 text-sm text-gray-600">
                            <p><strong>Username:</strong> <span className="font-mono">{user.username}</span></p>
                            <p><strong>Password:</strong> <span className="font-mono">{user.password}</span></p>
                            <p><strong>Email:</strong> {user.email}</p>
                            {user.organizationName && (
                              <p><strong>Organization:</strong> {user.organizationName}</p>
                            )}
                            <p className="text-xs text-gray-500 mt-2">{user.description}</p>
                          </div>

                          <div className="mt-3">
                            <div className="flex flex-wrap gap-1">
                              {user.permissions.slice(0, 3).map((permission, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {permission === '*' ? 'All Permissions' : permission}
                                </Badge>
                              ))}
                              {user.permissions.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{user.permissions.length - 3} more
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>

                                                <Button
                          onClick={() => useTestUser(user)}
                          variant="outline"
                          size="sm"
                          disabled={isLoading}
                          className="flex-shrink-0 w-full sm:w-auto"
                        >
                          Use
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <h4 className="font-semibold text-blue-900 mb-3 text-sm lg:text-base">Role Permissions</h4>
                  <div className="space-y-3 text-xs lg:text-sm text-blue-800">
                    <div className="flex items-start gap-3">
                      <Shield className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong>Super Admin:</strong> Full system access across all organizations
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Users className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong>Organization Admin:</strong> Manage users, settings, billing within organization
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <UserCheck className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong>Agent:</strong> Handle customer chats and conversations
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
