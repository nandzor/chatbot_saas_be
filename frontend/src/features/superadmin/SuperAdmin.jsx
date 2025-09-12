import React, { useState } from 'react';
import SuperAdminSidebar from './SuperAdminSidebar';
import SuperAdminDashboard from './SuperAdminDashboard';
import ClientManagement from './ClientManagement';
import Financials from './Financials';
import Platform from './Platform';
import SystemSettings from './SystemSettings';
import RoleList from '@/pages/roles/RoleList';
import PermissionList from '@/pages/permissions/PermissionList';
import UserProfile from '@/pages/auth/UserProfile';

const SuperAdmin = () => {
  const [activeMenu, setActiveMenu] = useState('dashboard');

  const renderContent = () => {
    switch (activeMenu) {
      case 'dashboard':
        return <SuperAdminDashboard />;
      case 'clients':
        return <ClientManagement />;
      case 'financials':
        return <Financials />;
      case 'platform':
        return <Platform />;
      case 'system':
        return <SystemSettings />;
      case 'system-roles':
        return <RoleList />;
      case 'system-permissions':
        return <PermissionList />;
      case 'system-settings':
        return <SystemSettings />;
      default:
        return <SuperAdminDashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <SuperAdminSidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
      <main className="flex-1 overflow-auto">
        {/* Header with User Profile */}
        <div className="border-b bg-white p-4 flex justify-end">
          <UserProfile />
        </div>
        <div className="container mx-auto p-6">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default SuperAdmin;
