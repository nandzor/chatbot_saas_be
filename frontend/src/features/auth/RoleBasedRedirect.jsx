import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const RoleBasedRedirect = () => {
  const { isAuthenticated, isLoading, user } = useAuth();

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated || !user) {
    return <Navigate to="/auth/login" replace />;
  }

  // Redirect based on user role
  switch (user.role) {
    case 'super_admin':
      return <Navigate to="/superadmin" replace />;
    case 'org_admin':
      return <Navigate to="/dashboard" replace />;
    case 'agent':
      return <Navigate to="/agent" replace />;
    case 'customer':
      return <Navigate to="/customer" replace />;
    default:
      // If role is not recognized, redirect to login
      return <Navigate to="/auth/login" replace />;
  }
};

export default RoleBasedRedirect;
