import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '@/components/layout/Sidebar';
import SidebarProvider from '@/components/layout/SidebarProvider';
import SidebarToggle from '@/components/layout/SidebarToggle';
import { useSidebar } from '@/components/layout/SidebarProvider';
import UserProfile from '@/features/auth/UserProfile';
import { useAuth } from '@/contexts/AuthContext';

const DashboardContent = () => {
  const { user } = useAuth();
  const { isCollapsed, isMobile, closeSidebar, toggleSidebar } = useSidebar();

  return (
    <div className="flex h-screen bg-background">
      <Sidebar 
        role={user?.role} 
        isCollapsed={isCollapsed}
        onToggle={toggleSidebar}
        isMobile={isMobile}
      />
      <main className="flex-1 overflow-auto">
        {/* Header with User Profile */}
        <div className="border-b bg-white p-4 flex justify-between items-center">
          <SidebarToggle />
          <UserProfile />
        </div>
        <div className="container mx-auto p-6" onClick={closeSidebar}>
          <Outlet />
        </div>
      </main>
    </div>
  );
};

const DashboardLayout = () => {
  return (
    <SidebarProvider>
      <DashboardContent />
    </SidebarProvider>
  );
};

export default DashboardLayout;
