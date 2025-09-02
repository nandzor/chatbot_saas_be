import React from 'react';
import { Outlet } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { RoleProvider } from '@/contexts/RoleContext';
import { ToasterProvider } from '@/components/ui/Toaster';
import { Toaster } from '@/components/ui/Toaster';
import AuthDebugPanel from '@/components/debug/AuthDebugPanel';

const RootLayout = () => {
  console.log('RootLayout rendering...');

  return (
    <ToasterProvider>
      <AuthProvider>
        <RoleProvider>
          <div className="min-h-screen bg-background">
            <Outlet />
            <Toaster />
            <AuthDebugPanel />
          </div>
        </RoleProvider>
      </AuthProvider>
    </ToasterProvider>
  );
};

export default RootLayout;
