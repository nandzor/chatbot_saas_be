import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui';
import { Button } from '@/components/ui';
import { Badge } from '@/components/ui';
import {
  Menu,
  Bell,
  Search,
  ChevronRight
} from 'lucide-react';

/**
 * Sidebar component
 */
export const Sidebar = ({
  items = [],
  activeItem,
  onItemClick,
  collapsed = false,
  onToggle,
  className = ''
}) => {
  const [expandedItems, setExpandedItems] = useState(new Set());

  const handleItemClick = (item) => {
    if (item.children && item.children.length > 0) {
      // Toggle expanded state for items with children
      setExpandedItems(prev => {
        const newSet = new Set(prev);
        if (newSet.has(item.key)) {
          newSet.delete(item.key);
        } else {
          newSet.add(item.key);
        }
        return newSet;
      });
    } else {
      // Click on leaf item
      onItemClick?.(item);
    }
  };

  const renderItem = (item, level = 0) => {
    const isActive = activeItem === item.key;
    const isExpanded = expandedItems.has(item.key);
    const hasChildren = item.children && item.children.length > 0;

    return (
      <div key={item.key} className="space-y-1">
        <div
          className={`flex items-center space-x-2 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
            isActive
              ? 'bg-primary text-primary-foreground'
              : 'hover:bg-muted'
          } ${level > 0 ? 'ml-4' : ''}`}
          onClick={() => handleItemClick(item)}
        >
          {item.icon && <item.icon className="w-4 h-4" />}
          {!collapsed && (
            <>
              <span className="text-sm font-medium">{item.label}</span>
              {item.badge && (
                <Badge variant="secondary" className="ml-auto">
                  {item.badge}
                </Badge>
              )}
              {hasChildren && (
                <ChevronRight
                  className={`w-4 h-4 ml-auto transition-transform ${
                    isExpanded ? 'rotate-90' : ''
                  }`}
                />
              )}
            </>
          )}
        </div>

        {hasChildren && isExpanded && !collapsed && (
          <div className="space-y-1">
            {item.children.map((child) => renderItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`bg-card border-r ${collapsed ? 'w-16' : 'w-64'} transition-all duration-300 ${className}`}>
      <div className="p-4">
        <div className="flex items-center space-x-2 mb-6">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">L</span>
          </div>
          {!collapsed && (
            <div>
              <h1 className="text-lg font-semibold">Logo</h1>
              <p className="text-xs text-muted-foreground">Dashboard</p>
            </div>
          )}
        </div>

        <nav className="space-y-2">
          {items.map((item) => renderItem(item))}
        </nav>
      </div>
    </div>
  );
};

/**
 * Header component
 */
export const Header = ({
  title,
  subtitle,
  actions = [],
  onMenuClick,
  onSearch,
  onNotificationClick,
  onProfileClick,
  notificationCount = 0,
  user,
  className = ''
}) => {
  return (
    <header className={`bg-card border-b px-6 py-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {onMenuClick && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onMenuClick}
              className="lg:hidden"
            >
              <Menu className="w-5 h-5" />
            </Button>
          )}
          <div>
            <h1 className="text-xl font-semibold">{title}</h1>
            {subtitle && (
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {onSearch && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 border rounded-md text-sm"
                onChange={(e) => onSearch(e.target.value)}
              />
            </div>
          )}

          {actions.map((action, index) => (
            <Button
              key={index}
              variant={action.variant || 'outline'}
              size="sm"
              onClick={action.onClick}
            >
              {action.icon && <action.icon className="w-4 h-4 mr-2" />}
              {action.label}
            </Button>
          ))}

          {onNotificationClick && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onNotificationClick}
              className="relative"
            >
              <Bell className="w-5 h-5" />
              {notificationCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                  {notificationCount > 99 ? '99+' : notificationCount}
                </Badge>
              )}
            </Button>
          )}

          {onProfileClick && user && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onProfileClick}
              className="flex items-center space-x-2"
            >
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-primary-foreground text-sm font-medium">
                  {user.name?.charAt(0) || 'U'}
                </span>
              </div>
              <span className="hidden md:block text-sm">{user.name}</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

/**
 * Breadcrumb component
 */
export const Breadcrumb = ({
  items = [],
  onItemClick,
  className = ''
}) => {
  return (
    <nav className={`flex items-center space-x-2 text-sm ${className}`}>
      {items.map((item, index) => (
        <div key={index} className="flex items-center space-x-2">
          {index > 0 && (
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          )}
          <button
            onClick={() => onItemClick?.(item)}
            className={`hover:text-primary transition-colors ${
              index === items.length - 1 ? 'text-foreground font-medium' : 'text-muted-foreground'
            }`}
          >
            {item.label}
          </button>
        </div>
      ))}
    </nav>
  );
};

/**
 * Page header component
 */
export const PageHeader = ({
  title,
  subtitle,
  breadcrumbs = [],
  actions = [],
  onBreadcrumbClick,
  className = ''
}) => {
  return (
    <div className={`space-y-4 ${className}`}>
      {breadcrumbs.length > 0 && (
        <Breadcrumb items={breadcrumbs} onItemClick={onBreadcrumbClick} />
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          {subtitle && (
            <p className="text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>

        {actions.length > 0 && (
          <div className="flex items-center space-x-2">
            {actions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant || 'default'}
                size="sm"
                onClick={action.onClick}
              >
                {action.icon && <action.icon className="w-4 h-4 mr-2" />}
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Main layout component
 */
export const MainLayout = ({
  children,
  sidebar,
  header,
  className = ''
}) => {
  return (
    <div className={`min-h-screen bg-background ${className}`}>
      <div className="flex">
        {sidebar}
        <div className="flex-1 flex flex-col">
          {header}
          <main className="flex-1 p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

/**
 * Grid layout component
 */
export const GridLayout = ({
  children,
  columns = 1,
  gap = 4,
  className = ''
}) => {
  const getGridClass = () => {
    switch (columns) {
      case 1:
        return 'grid-cols-1';
      case 2:
        return 'grid-cols-1 md:grid-cols-2';
      case 3:
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
      case 4:
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4';
      case 6:
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6';
      default:
        return 'grid-cols-1';
    }
  };

  const getGapClass = () => {
    switch (gap) {
      case 1:
        return 'gap-1';
      case 2:
        return 'gap-2';
      case 3:
        return 'gap-3';
      case 4:
        return 'gap-4';
      case 6:
        return 'gap-6';
      case 8:
        return 'gap-8';
      default:
        return 'gap-4';
    }
  };

  return (
    <div className={`grid ${getGridClass()} ${getGapClass()} ${className}`}>
      {children}
    </div>
  );
};

/**
 * Flex layout component
 */
export const FlexLayout = ({
  children,
  direction = 'row',
  justify = 'start',
  align = 'start',
  wrap = false,
  gap = 4,
  className = ''
}) => {
  const getDirectionClass = () => {
    switch (direction) {
      case 'row':
        return 'flex-row';
      case 'column':
        return 'flex-col';
      case 'row-reverse':
        return 'flex-row-reverse';
      case 'column-reverse':
        return 'flex-col-reverse';
      default:
        return 'flex-row';
    }
  };

  const getJustifyClass = () => {
    switch (justify) {
      case 'start':
        return 'justify-start';
      case 'end':
        return 'justify-end';
      case 'center':
        return 'justify-center';
      case 'between':
        return 'justify-between';
      case 'around':
        return 'justify-around';
      case 'evenly':
        return 'justify-evenly';
      default:
        return 'justify-start';
    }
  };

  const getAlignClass = () => {
    switch (align) {
      case 'start':
        return 'items-start';
      case 'end':
        return 'items-end';
      case 'center':
        return 'items-center';
      case 'baseline':
        return 'items-baseline';
      case 'stretch':
        return 'items-stretch';
      default:
        return 'items-start';
    }
  };

  const getGapClass = () => {
    switch (gap) {
      case 1:
        return 'gap-1';
      case 2:
        return 'gap-2';
      case 3:
        return 'gap-3';
      case 4:
        return 'gap-4';
      case 6:
        return 'gap-6';
      case 8:
        return 'gap-8';
      default:
        return 'gap-4';
    }
  };

  return (
    <div
      className={`flex ${getDirectionClass()} ${getJustifyClass()} ${getAlignClass()} ${
        wrap ? 'flex-wrap' : ''
      } ${getGapClass()} ${className}`}
    >
      {children}
    </div>
  );
};

/**
 * Container component
 */
export const Container = ({
  children,
  size = 'md',
  className = ''
}) => {
  const getSizeClass = () => {
    switch (size) {
      case 'sm':
        return 'max-w-2xl';
      case 'md':
        return 'max-w-4xl';
      case 'lg':
        return 'max-w-6xl';
      case 'xl':
        return 'max-w-7xl';
      case 'full':
        return 'max-w-full';
      default:
        return 'max-w-4xl';
    }
  };

  return (
    <div className={`mx-auto px-4 ${getSizeClass()} ${className}`}>
      {children}
    </div>
  );
};

/**
 * Section component
 */
export const Section = ({
  title,
  subtitle,
  children,
  actions = [],
  className = ''
}) => {
  return (
    <section className={`space-y-4 ${className}`}>
      {(title || subtitle || actions.length > 0) && (
        <div className="flex items-center justify-between">
          <div>
            {title && <h2 className="text-lg font-semibold">{title}</h2>}
            {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
          </div>
          {actions.length > 0 && (
            <div className="flex items-center space-x-2">
              {actions.map((action, index) => (
                <Button
                  key={index}
                  variant={action.variant || 'outline'}
                  size="sm"
                  onClick={action.onClick}
                >
                  {action.icon && <action.icon className="w-4 h-4 mr-2" />}
                  {action.label}
                </Button>
              ))}
            </div>
          )}
        </div>
      )}
      {children}
    </section>
  );
};

export default {
  Sidebar,
  Header,
  Breadcrumb,
  PageHeader,
  MainLayout,
  GridLayout,
  FlexLayout,
  Container,
  Section
};
