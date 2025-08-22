import React from 'react';
import { Outlet } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { RoleProvider } from '@/contexts/RoleContext';
import { Toaster } from '@/components/ui/Toaster';

const RootLayout = () => {
  return (
    <AuthProvider>
      <RoleProvider>
        <div className="min-h-screen bg-background">
          <Outlet />
          <Toaster />
        </div>
      </RoleProvider>
    </AuthProvider>
  );
};

export default RootLayout;
