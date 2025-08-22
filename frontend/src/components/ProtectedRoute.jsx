import React from 'react';
import { useAuth } from '../contexts/AuthContext';

/**
 * Protected Route Component
 * Wraps routes that require authentication
 */
export const ProtectedRoute = ({ 
  children, 
  fallback = <div>Loading...</div>,
  redirectTo = '/login'
}) => {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading while checking authentication
  if (isLoading) {
    return <>{fallback}</>;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    window.location.href = redirectTo;
    return null;
  }

  // Render protected content
  return <>{children}</>;
};

/**
 * Public Route Component
 * Redirects authenticated users away from public routes (like login)
 */
export const PublicRoute = ({ 
  children, 
  redirectTo = '/dashboard'
}) => {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading while checking authentication
  if (isLoading) {
    return <div>Loading...</div>;
  }

  // Redirect authenticated users
  if (isAuthenticated) {
    window.location.href = redirectTo;
    return null;
  }

  // Render public content
  return <>{children}</>;
};

/**
 * Role-based Protected Route
 * Protects routes based on user roles/permissions
 */
export const RoleProtectedRoute = ({ 
  children, 
  requiredRoles = [],
  requiredPermissions = [],
  fallback = <div>Access Denied</div>,
  redirectTo = '/unauthorized'
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  // Show loading while checking authentication
  if (isLoading) {
    return <div>Loading...</div>;
  }

  // Check authentication first
  if (!isAuthenticated) {
    window.location.href = '/login';
    return null;
  }

  // Check roles if specified
  if (requiredRoles.length > 0) {
    // Add your role checking logic here
    // const hasRole = user?.roles?.some(role => requiredRoles.includes(role));
    // if (!hasRole) {
    //   window.location.href = redirectTo;
    //   return null;
    // }
  }

  // Check permissions if specified
  if (requiredPermissions.length > 0) {
    // Add your permission checking logic here
    // const hasPermission = user?.permissions?.some(permission => requiredPermissions.includes(permission));
    // if (!hasPermission) {
    //   window.location.href = redirectTo;
    //   return null;
    // }
  }

  // Render protected content
  return <>{children}</>;
};
