import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui';
import { 
  Shield, 
  AlertTriangle,
  Loader2 
} from 'lucide-react';

const ProtectedRoute = ({ 
  children, 
  requiredRole = null, 
  requiredPermission = null,
  fallback = null 
}) => {
  const { isAuthenticated, isLoading, user, isRole, hasPermission } = useAuth();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, this will be handled by App.jsx
  if (!isAuthenticated) {
    return null;
  }

  // Check role requirement
  if (requiredRole && !isRole(requiredRole)) {
    return fallback || (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-red-600" />
            </div>
            <CardTitle className="text-red-600">Access Denied</CardTitle>
            <CardDescription>
              Anda tidak memiliki role yang diperlukan untuk mengakses halaman ini
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="p-4 bg-red-50 rounded-lg">
              <p className="text-sm text-red-800">
                <strong>Required Role:</strong> {requiredRole}
              </p>
              <p className="text-sm text-red-800">
                <strong>Your Role:</strong> {user?.role || 'Unknown'}
              </p>
            </div>
            <p className="text-sm text-muted-foreground">
              Hubungi administrator untuk mendapatkan akses yang sesuai.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check permission requirement
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return fallback || (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-orange-600" />
            </div>
            <CardTitle className="text-orange-600">Insufficient Permissions</CardTitle>
            <CardDescription>
              Anda tidak memiliki permission yang diperlukan untuk mengakses fitur ini
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="p-4 bg-orange-50 rounded-lg">
              <p className="text-sm text-orange-800">
                <strong>Required Permission:</strong> {requiredPermission}
              </p>
              <p className="text-sm text-orange-800">
                <strong>Your Permissions:</strong> {user?.permissions?.join(', ') || 'None'}
              </p>
            </div>
            <p className="text-sm text-muted-foreground">
              Hubungi administrator untuk mendapatkan permission yang sesuai.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If all checks pass, render the protected content
  return children;
};

export default ProtectedRoute;
