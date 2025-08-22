import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Sidebar from '@/components/layout/Sidebar';
import UserProfile from '@/features/auth/UserProfile';
import AgentDashboard from './AgentDashboard';
import AgentInbox from './AgentInbox';
import AgentProfile from './AgentProfile';
import ProtectedRoute from '@/features/auth/ProtectedRoute';

const Agent = () => {
  const { user } = useAuth();
  const [activeMenu, setActiveMenu] = useState('my-dashboard');

  const renderContent = () => {
    switch (activeMenu) {
      case 'my-dashboard':
        return (
          <ProtectedRoute requiredPermission="handle_chats">
            <AgentDashboard />
          </ProtectedRoute>
        );
      case 'inbox':
        return (
          <ProtectedRoute requiredPermission="handle_chats">
            <AgentInbox />
          </ProtectedRoute>
        );
      case 'my-profile':
        return (
          <ProtectedRoute requiredPermission="update_profile">
            <AgentProfile />
          </ProtectedRoute>
        );
      default:
        return (
          <ProtectedRoute requiredPermission="handle_chats">
            <AgentDashboard />
          </ProtectedRoute>
        );
    }
  };

  return (
    <div className="flex min-h-screen bg-background max-w-full overflow-hidden">
      <Sidebar 
        role={user?.role} 
        activeMenu={activeMenu} 
        setActiveMenu={setActiveMenu} 
      />
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="border-b bg-card px-4 lg:px-6 py-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <h1 className="text-lg lg:text-xl font-semibold truncate">
                {user?.organizationName || 'Customer Service Platform'}
              </h1>
              <p className="text-xs lg:text-sm text-muted-foreground">
                Agent Workspace
              </p>
            </div>
            <div className="flex-shrink-0">
              <UserProfile />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-4 lg:p-6 min-h-0">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default Agent;
