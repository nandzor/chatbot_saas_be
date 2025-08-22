import React from 'react';
import { Menu } from 'lucide-react';
import { useSidebar } from './SidebarProvider';

const SidebarToggle = () => {
  const { isCollapsed, toggleSidebar, isMobile } = useSidebar();

  return (
    <button
      onClick={toggleSidebar}
      className="p-2 rounded-lg hover:bg-accent transition-colors"
      title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
    >
      <Menu className="w-5 h-5" />
    </button>
  );
};

export default SidebarToggle;
