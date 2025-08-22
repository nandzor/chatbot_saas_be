import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const RoleBasedRoute = ({ 
  children, 
  requiredRole, 
  requiredPermission, 
  fallbackPath = '/unauthorized' 
}) => {
  const { isAuthenticated, isLoading, user, hasPermission, isRole } = useAuth();
  const location = useLocation();

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // Check role-based access
  if (requiredRole && !isRole(requiredRole)) {
    return <Navigate to={fallbackPath} replace />;
  }

  // Check permission-based access
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <Navigate to={fallbackPath} replace />;
  }

  return children;
};

export default RoleBasedRoute;
