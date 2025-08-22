import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import UserAvatar from '@/components/common/UserAvatar';
import { 
  Home, 
  Building2, 
  Users, 
  CreditCard, 
  Activity, 
  Shield,
  MessageSquare, 
  BarChart3, 
  BookOpen, 
  Workflow, 
  Settings, 
  User,
  Bot,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Heart,
  UserPlus,
  Zap
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui';

const Sidebar = ({ role, isCollapsed, onToggle, isMobile }) => {
  const { user } = useAuth();
  const location = useLocation();
  
  const getSidebarItems = () => {
    switch(role) {
      case 'superadmin':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: BarChart3, href: '/superadmin' },
          { id: 'financials', label: 'Financials', icon: DollarSign, href: '/superadmin/financials' },
          { id: 'clients', label: 'Client Success & Management', icon: Users, href: '/superadmin/clients' },
          { id: 'client-health', label: 'Client Health Dashboard', icon: Heart, href: '/superadmin/client-health' },
          { id: 'onboarding', label: 'Onboarding Pipeline', icon: UserPlus, href: '/superadmin/onboarding' },
          { id: 'automation', label: 'Automation & Playbooks', icon: Zap, href: '/superadmin/automation' },
          { id: 'platform', label: 'Platform Engineering & DevOps', icon: Settings, href: '/superadmin/platform/configuration' }
        ];
      case 'organization_admin':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: Home, href: '/dashboard' },
          { id: 'inbox', label: 'Inbox', icon: MessageSquare, href: '/dashboard/inbox' },
          { id: 'analytics', label: 'Analytics', icon: BarChart3, href: '/dashboard/analytics' },
          { id: 'knowledge', label: 'Knowledge Base', icon: BookOpen, href: '/dashboard/knowledge' },
          { id: 'automations', label: 'Automations', icon: Workflow, href: '/dashboard/automations' },
          { id: 'settings', label: 'Settings', icon: Settings, href: '/dashboard/settings' },
          { id: 'profile', label: 'Profile Settings', icon: User, href: '/dashboard/profile' }
        ];
      case 'agent':
        return [
          { id: 'dashboard', label: 'My Dashboard', icon: Home, href: '/agent' },
          { id: 'inbox', label: 'Inbox (Percakapan)', icon: MessageSquare, href: '/agent/inbox' },
          { id: 'profile', label: 'My Profile & Settings', icon: User, href: '/agent/profile' }
        ];
      default:
        return [];
    }
  };

  const sidebarItems = getSidebarItems();

  const renderNavItem = (item) => {
    const Icon = item.icon;
    
    // Special handling for dashboard items to prevent false active states
    let isActive = false;
    if (item.href === '/superadmin') {
      // Platform Dashboard should only be active when exactly on /superadmin
      isActive = location.pathname === '/superadmin';
    } else if (item.href === '/dashboard') {
      // Organization Dashboard should only be active when exactly on /dashboard
      isActive = location.pathname === '/dashboard';
    } else if (item.href === '/agent') {
      // Agent Dashboard should only be active when exactly on /agent
      isActive = location.pathname === '/agent';
    } else {
      // For other items, check if current path starts with the href
      isActive = location.pathname.startsWith(item.href);
    }
    
    if (isCollapsed) {
      return (
        <div key={item.id} className="group relative">
          <NavLink
            to={item.href}
            className={`w-full flex items-center justify-center p-3 rounded-lg transition-all ${
              isActive
                ? 'bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-primary border-l-4 border-primary' 
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            }`}
            title={item.label}
          >
            <Icon className="w-5 h-5" />
          </NavLink>
          {/* Tooltip for collapsed state */}
          <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
            {item.label}
          </div>
        </div>
      );
    }

    return (
      <NavLink
        key={item.id}
        to={item.href}
        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
          isActive
            ? 'bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-primary border-l-4 border-primary' 
            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
        }`}
      >
        <Icon className="w-5 h-5" />
        <span className="text-sm font-medium">{item.label}</span>
      </NavLink>
    );
  };

  return (
    <div className={`relative h-full bg-card border-r border-border transition-all duration-300 ease-in-out ${
      isCollapsed ? 'w-16' : 'w-64'
    } ${isMobile ? 'fixed left-0 top-0 z-50' : ''}`}>

      {/* Header */}
      <div className={`p-6 ${isCollapsed ? 'px-2' : ''}`}>
        <div className={`flex items-center gap-3 mb-8 ${isCollapsed ? 'justify-center' : ''}`}>
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
            <Bot className="w-6 h-6 text-white" />
          </div>
          {!isCollapsed && (
            <div>
              <h1 className="text-lg font-bold text-foreground">ChatBot Pro</h1>
              <p className="text-xs text-muted-foreground capitalize">
                {role === 'superadmin' ? 'Super Admin' : 
                 role === 'organization_admin' ? 'Organization Admin' : 
                 role === 'agent' ? 'Agent' : role.replace('_', ' ')}
              </p>
            </div>
          )}
        </div>
        
        {/* Navigation */}
        <nav className="space-y-2">
          {sidebarItems.map(renderNavItem)}
        </nav>
      </div>
      
      {/* User Profile Section */}
      <div className={`absolute bottom-0 left-0 right-0 p-4 border-t border-border ${
        isCollapsed ? 'px-2' : ''
      }`}>
        {isCollapsed ? (
          <div className="flex justify-center">
            <div className="group relative">
              <div className="cursor-pointer">
                <UserAvatar user={user} size="sm" />
              </div>
              {/* Tooltip for collapsed state */}
              <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                <div className="text-center">
                  <p className="font-medium">{user?.name || 'Admin User'}</p>
                  <p className="text-xs text-gray-300">Click to view profile</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <UserAvatar user={user} size="default" />
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">{user?.name || 'Admin User'}</p>
              <Select defaultValue="online">
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
        )}
      </div>
    </div>
  );
};

export default Sidebar;
