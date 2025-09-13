import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui';
import { Button } from '@/components/ui';
import { Badge } from '@/components/ui';
import {
  Bell,
  X,
  CheckCircle,
  AlertCircle,
  Info,
  AlertTriangle,
  Activity,
  Users,
  CreditCard,
  Building2,
  Settings,
  RefreshCw,
  Trash2,
  CheckCircle2,
  Circle,
  Filter,
  RotateCcw
} from 'lucide-react';

/**
 * Notification item
 */
export const NotificationItem = ({
  notification,
  onCheckCircle2,
  onCircle,
  onDelete,
  onAction,
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);

  const getNotificationIcon = () => {
    switch (notification.type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-500" />;
      case 'user':
        return <Users className="w-5 h-5 text-blue-500" />;
      case 'organization':
        return <Building2 className="w-5 h-5 text-purple-500" />;
      case 'payment':
        return <CreditCard className="w-5 h-5 text-green-500" />;
      case 'system':
        return <Settings className="w-5 h-5 text-gray-500" />;
      case 'activity':
        return <Activity className="w-5 h-5 text-orange-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const getNotificationColor = () => {
    switch (notification.type) {
      case 'success':
        return 'border-green-200 bg-green-50';
      case 'error':
        return 'border-red-200 bg-red-50';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50';
      case 'info':
        return 'border-blue-200 bg-blue-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const handleCheckCircle2 = () => {
    onCheckCircle2?.(notification.id);
  };

  const handleCircle = () => {
    onCircle?.(notification.id);
  };

  const handleDelete = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setIsVisible(false);
      onDelete?.(notification.id);
    }, 300);
  };

  const handleAction = () => {
    onAction?.(notification);
  };

  if (!isVisible) return null;

  return (
    <div
      className={`transition-all duration-300 ${
        isAnimating ? 'opacity-0 transform translate-x-full' : 'opacity-100 transform translate-x-0'
      } ${className}`}
    >
      <Card className={`border-l-4 ${getNotificationColor()} ${!notification.read ? 'ring-2 ring-primary/20' : ''}`}>
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 mt-0.5">
              {getNotificationIcon()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-gray-900">
                  {notification.title}
                </h4>
                <div className="flex items-center space-x-2">
                  {!notification.read && (
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                  )}
                  <div className="flex items-center space-x-1">
                    {!notification.read ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCheckCircle2}
                        className="h-6 w-6 p-0"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCircle}
                        className="h-6 w-6 p-0"
                      >
                        <Circle className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleDelete}
                      className="h-6 w-6 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {notification.message}
              </p>
              {notification.timestamp && (
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(notification.timestamp).toLocaleString('id-ID')}
                </p>
              )}
              {notification.actions && notification.actions.length > 0 && (
                <div className="flex space-x-2 mt-3">
                  {notification.actions.map((action, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => handleAction()}
                    >
                      {action.label}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

/**
 * Notifications list
 */
export const NotificationsList = ({
  notifications = [],
  onCheckCircle2,
  onCircle,
  onDelete,
  onAction,
  onLoadMore,
  hasMore = false,
  loading = false,
  className = ''
}) => {
  return (
    <div className={`space-y-4 ${className}`}>
      {notifications.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No notifications found
        </div>
      ) : (
        notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onCheckCircle2={onCheckCircle2}
            onCircle={onCircle}
            onDelete={onDelete}
            onAction={onAction}
          />
        ))
      )}

      {hasMore && (
        <div className="text-center pt-4">
          <Button
            variant="outline"
            onClick={onLoadMore}
            disabled={loading}
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Bell className="w-4 h-4 mr-2" />
            )}
            Load More
          </Button>
        </div>
      )}
    </div>
  );
};

/**
 * Notifications header
 */
export const NotificationsHeader = ({
  totalCount,
  unreadCount,
  onMarkAllAsRead,
  onClearAll,
  onRefresh,
  loading = false,
  className = ''
}) => {
  return (
    <div className={`flex items-center justify-between ${className}`}>
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          <Bell className="w-5 h-5" />
          <h2 className="text-lg font-semibold">Notifications</h2>
          {unreadCount > 0 && (
            <Badge className="bg-primary text-primary-foreground">
              {unreadCount}
            </Badge>
          )}
        </div>
        <div className="text-sm text-muted-foreground">
          {totalCount} total
        </div>
      </div>

      <div className="flex items-center space-x-2">
        {onMarkAllAsRead && unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={onMarkAllAsRead}
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Mark All Read
          </Button>
        )}
        {onClearAll && (
          <Button
            variant="outline"
            size="sm"
            onClick={onClearAll}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear All
          </Button>
        )}
        {onRefresh && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        )}
      </div>
    </div>
  );
};

/**
 * Notifications filters
 */
export const NotificationsFilters = ({
  filters = {},
  onFiltersChange,
  onFiltersReset,
  className = ''
}) => {
  const [localFilters, setLocalFilters] = useState(filters);

  const handleFilterChange = (key, value) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFiltersChange?.(newFilters);
  };

  const handleReset = () => {
    setLocalFilters({});
    onFiltersReset?.();
  };

  const typeOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'success', label: 'Success' },
    { value: 'error', label: 'Error' },
    { value: 'warning', label: 'Warning' },
    { value: 'info', label: 'Info' },
    { value: 'user', label: 'User' },
    { value: 'organization', label: 'Organization' },
    { value: 'payment', label: 'Payment' },
    { value: 'system', label: 'System' },
    { value: 'activity', label: 'Activity' }
  ];

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'unread', label: 'Unread' },
    { value: 'read', label: 'Read' },
    { value: 'archived', label: 'Archived' }
  ];

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Filter className="w-5 h-5" />
          <span>Filters</span>
        </CardTitle>
        <CardDescription>
          Filter notifications by type and status
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Type</label>
              <select
                value={localFilters.type || 'all'}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                className="w-full px-3 py-2 border rounded-md text-sm"
              >
                {typeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <select
                value={localFilters.status || 'all'}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border rounded-md text-sm"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Date From</label>
              <input
                type="date"
                value={localFilters.dateFrom || ''}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                className="w-full px-3 py-2 border rounded-md text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Date To</label>
              <input
                type="date"
                value={localFilters.dateTo || ''}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                className="w-full px-3 py-2 border rounded-md text-sm"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={handleReset}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * Notification settings
 */
export const NotificationSettings = ({
  settings = {},
  onSettingsChange,
  onSave,
  loading = false,
  className = ''
}) => {
  const [localSettings, setLocalSettings] = useState(settings);

  const handleSettingChange = (key, value) => {
    const newSettings = { ...localSettings, [key]: value };
    setLocalSettings(newSettings);
    onSettingsChange?.(newSettings);
  };

  const handleSave = () => {
    onSave?.(localSettings);
  };

  const notificationTypes = [
    { key: 'email', label: 'Email Notifications', description: 'Receive notifications via email' },
    { key: 'push', label: 'Push Notifications', description: 'Receive push notifications in browser' },
    { key: 'sms', label: 'SMS Notifications', description: 'Receive notifications via SMS' },
    { key: 'inApp', label: 'In-App Notifications', description: 'Receive notifications within the application' }
  ];

  const notificationCategories = [
    { key: 'user', label: 'User Management', description: 'Notifications about user activities' },
    { key: 'organization', label: 'Organization', description: 'Notifications about organization changes' },
    { key: 'payment', label: 'Payment', description: 'Notifications about payment activities' },
    { key: 'system', label: 'System', description: 'Notifications about system events' },
    { key: 'security', label: 'Security', description: 'Notifications about security events' }
  ];

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Settings className="w-5 h-5" />
          <span>Notification Settings</span>
        </CardTitle>
        <CardDescription>
          Configure your notification preferences
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-base font-medium mb-3">Notification Methods</h3>
            <div className="space-y-3">
              {notificationTypes.map((type) => (
                <div key={type.key} className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{type.label}</div>
                    <div className="text-sm text-muted-foreground">{type.description}</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={localSettings[type.key] || false}
                    onChange={(e) => handleSettingChange(type.key, e.target.checked)}
                    className="rounded"
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-base font-medium mb-3">Notification Categories</h3>
            <div className="space-y-3">
              {notificationCategories.map((category) => (
                <div key={category.key} className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{category.label}</div>
                    <div className="text-sm text-muted-foreground">{category.description}</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={localSettings[category.key] || false}
                    onChange={(e) => handleSettingChange(category.key, e.target.checked)}
                    className="rounded"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={loading}>
            {loading ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <CheckCircle className="w-4 h-4 mr-2" />
            )}
            Save Settings
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * Notification bell with badge
 */
export const NotificationBell = ({
  unreadCount,
  onClick,
  className = ''
}) => {
  return (
    <div className={`relative ${className}`}>
      <Button
        variant="ghost"
        size="sm"
        onClick={onClick}
        className="relative"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Button>
    </div>
  );
};

export default {
  NotificationItem,
  NotificationsList,
  NotificationsHeader,
  NotificationsFilters,
  NotificationSettings,
  NotificationBell
};
