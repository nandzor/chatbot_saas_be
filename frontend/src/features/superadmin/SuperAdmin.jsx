import React, { useState } from 'react';
import SuperAdminSidebar from './SuperAdminSidebar';
import SuperAdminDashboard from './SuperAdminDashboard';
import ClientManagement from './ClientManagement';
import Financials from './Financials';
import Platform from './Platform';
import UserProfile from '../auth/UserProfile';

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
