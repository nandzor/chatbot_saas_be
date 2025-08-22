import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import UserProfile from '@/features/auth/UserProfile';
import Sidebar from '@/components/layout/Sidebar';
import SidebarProvider from '@/components/layout/SidebarProvider';
import SidebarToggle from '@/components/layout/SidebarToggle';
import { useSidebar } from '@/components/layout/SidebarProvider';
import { 
  BarChart3, 
  DollarSign, 
  Users, 
  Settings,
  LogOut 
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const SuperAdminContent = () => {
  const { logout } = useAuth();
  const { isCollapsed, isMobile, closeSidebar, toggleSidebar } = useSidebar();

  const handleLogout = () => {
    if (window.confirm('Apakah Anda yakin ingin keluar dari sistem?')) {
      logout();
    }
  };

  const navigation = [
    { name: 'Dashboard', href: '/superadmin', icon: BarChart3 },
    { name: 'Financials', href: '/superadmin/financials', icon: DollarSign },
    { 
      name: 'Client Success & Management', 
      href: '/superadmin/clients', 
      icon: Users,
      submenu: [
        { name: 'Client Health Dashboard', href: '/superadmin/client-health' },
        { name: 'Organizations', href: '/superadmin/clients' },
        { name: 'Onboarding Pipeline', href: '/superadmin/onboarding' },
        { name: 'Automation & Playbooks', href: '/superadmin/automation' },
        { name: 'Communication Center', href: '/superadmin/communication' }
      ]
    },
    { 
      name: 'Platform Engineering & DevOps', 
      href: '/superadmin/platform/configuration', 
      icon: Settings,
      submenu: [
        { name: 'Platform Configuration', href: '/superadmin/platform/configuration' },
        { name: 'Service & Infrastructure Health', href: '/superadmin/platform/health' },
        { name: 'Security & Compliance', href: '/superadmin/platform/security' }
      ]
    },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar 
        role="superadmin" 
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
              <h2 className="text-lg font-semibold text-gray-900">Super Admin Panel</h2>
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

const SuperAdminLayout = () => {
  return (
    <SidebarProvider>
      <SuperAdminContent />
    </SidebarProvider>
  );
};

export default SuperAdminLayout;
