import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import UserAvatar from '@/components/common/UserAvatar';
import { 
  Home, 
  Building2, 
  DollarSign, 
  Settings,
  Shield,
  BarChart3,
  Zap,
  Users,
  Database,
  Bot,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { 
  Avatar, 
  AvatarFallback, 
  AvatarImage, 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui';

const SuperAdminSidebar = ({ activeMenu, setActiveMenu }) => {
  const { user } = useAuth();
  const [userStatus, setUserStatus] = useState('online');

  const sidebarItems = [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      icon: Home,
      description: 'Business Intelligence & Platform Overview'
    },
    { 
      id: 'clients', 
      label: 'Client Management', 
      icon: Building2,
      description: 'Organizations & Subscriptions'
    },
    { 
      id: 'financials', 
      label: 'Financials', 
      icon: DollarSign,
      description: 'Revenue, Plans & Transactions'
    },
    { 
      id: 'platform', 
      label: 'Platform', 
      icon: Settings,
      description: 'Configuration & Security'
    }
  ];

  // Sub-menu untuk setiap section (seperti organization admin)
  const getSubMenuItems = (mainMenuId) => {
    switch(mainMenuId) {
      case 'dashboard':
        return [
          { id: 'dashboard-overview', label: 'Overview', icon: BarChart3 },
          { id: 'dashboard-health', label: 'System Health', icon: Shield },
          { id: 'dashboard-activity', label: 'Recent Activity', icon: Database }
        ];
      case 'clients':
        return [
          { id: 'clients-organizations', label: 'Organizations', icon: Building2 },
          { id: 'clients-users', label: 'All Users', icon: Users },
          { id: 'clients-analytics', label: 'Client Analytics', icon: BarChart3 }
        ];
      case 'financials':
        return [
          { id: 'financials-plans', label: 'Subscription Plans', icon: Database },
          { id: 'financials-transactions', label: 'Transactions', icon: DollarSign },
          { id: 'financials-reports', label: 'Financial Reports', icon: BarChart3 }
        ];
      case 'platform':
        return [
          { id: 'platform-settings', label: 'Platform Settings', icon: Settings },
          { id: 'platform-n8n', label: 'N8N Service', icon: Zap },
          { id: 'platform-security', label: 'Security & Audit', icon: Shield }
        ];
      default:
        return [];
    }
  };

  const getInitials = () => {
    if (!user?.name) return 'SA';
    return user.name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="w-64 h-full bg-card border-r border-border flex flex-col">
      {/* Header */}
      <div className="p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">Super Admin</h1>
            <p className="text-xs text-muted-foreground">Platform Management</p>
          </div>
        </div>
        
        {/* Main Navigation */}
        <nav className="space-y-2">
          {sidebarItems.map(item => {
            const Icon = item.icon;
            const isActive = activeMenu === item.id;
            
            return (
              <div key={item.id}>
                <button
                  onClick={() => setActiveMenu(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all group ${
                    isActive 
                      ? 'bg-gradient-to-r from-red-500/10 to-orange-500/10 text-red-600 border-l-4 border-red-500' 
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <div className="flex-1 text-left">
                    <div className="text-sm font-medium">{item.label}</div>
                    <div className="text-xs text-muted-foreground">{item.description}</div>
                  </div>
                  {isActive ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </button>
              </div>
            );
          })}
        </nav>

        {/* Quick Stats Card */}
        <div className="mt-6 p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">Platform Stats</span>
          </div>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-blue-700">Organizations</span>
              <span className="font-medium text-blue-900">342</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-700">Revenue</span>
              <span className="font-medium text-blue-900">$125K</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-700">Uptime</span>
              <span className="font-medium text-green-600">99.9%</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* User Profile Footer */}
      <div className="mt-auto p-4 border-t border-border">
        <div className="flex items-center gap-3">
          <UserAvatar user={user} size="default" />
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">
              {user?.name || 'Super Admin'}
            </p>
            <Select value={userStatus} onValueChange={setUserStatus}>
              <SelectTrigger className="h-6 text-xs border-0 p-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="online">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    Online
                  </div>
                </SelectItem>
                <SelectItem value="busy">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-yellow-500" />
                    Busy
                  </div>
                </SelectItem>
                <SelectItem value="offline">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-gray-500" />
                    Offline
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Role Badge */}
        <div className="mt-2 px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-md text-center">
          Super Administrator
        </div>
      </div>
    </div>
  );
};

export default SuperAdminSidebar;
