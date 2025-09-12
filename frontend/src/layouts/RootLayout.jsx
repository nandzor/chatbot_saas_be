import { Outlet } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { RoleProvider } from '@/contexts/RoleContext';
import { Toaster } from '@/components/ui';
import AuthDebugPanel from '@/components/debug/AuthDebugPanel';

const RootLayout = () => {

  return (
    <AuthProvider>
      <RoleProvider>
        <div className="min-h-screen bg-background">
          <Outlet />
          <Toaster />
          <AuthDebugPanel />
        </div>
      </RoleProvider>
    </AuthProvider>
  );
};

export default RootLayout;
