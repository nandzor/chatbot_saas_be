import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import UserProfile from '@/features/auth/UserProfile';
import Sidebar from '@/components/layout/Sidebar';
import SidebarProvider from '@/components/layout/SidebarProvider';
import SidebarToggle from '@/components/layout/SidebarToggle';
import { useSidebar } from '@/components/layout/SidebarProvider';
import { 
  BarChart3, 
  MessageSquare, 
  User,
  LogOut 
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const AgentContent = () => {
  const { logout } = useAuth();
  const { isCollapsed, isMobile, closeSidebar, toggleSidebar } = useSidebar();

  const handleLogout = () => {
    if (window.confirm('Apakah Anda yakin ingin keluar dari sistem?')) {
      logout();
    }
  };

  const navigation = [
    { name: 'Dashboard', href: '/agent', icon: BarChart3 },
    { name: 'Inbox', href: '/agent/inbox', icon: MessageSquare },
    { name: 'Profile', href: '/agent/profile', icon: User },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar 
        role="agent" 
        isCollapsed={isCollapsed}
        onToggle={toggleSidebar}
        isMobile={isMobile}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <SidebarToggle />
              <h2 className="text-lg font-semibold text-gray-900">Agent Dashboard</h2>
            </div>
            <UserProfile />
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto p-6" onClick={closeSidebar}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

const AgentLayout = () => {
  return (
    <SidebarProvider>
      <AgentContent />
    </SidebarProvider>
  );
};

export default AgentLayout;
