import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';
import { Button } from './button';
import { Badge } from './badge';
import {
  Bell,
  BellRing,
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
  Zap
} from 'lucide-react';

/**
 * Real-time notification component
 */
export const RealTimeNotification = ({
  notification,
  onDismiss,
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

  const handleDismiss = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setIsVisible(false);
      onDismiss?.(notification.id);
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
      <Card className={`border-l-4 ${getNotificationColor()}`}>
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
                  {notification.priority === 'high' && (
                    <Badge variant="destructive" className="text-xs">
                      High
                    </Badge>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDismiss}
                    className="h-6 w-6 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {notification.message}
              </p>
              {notification.timestamp && (
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(notification.timestamp).toLocaleTimeString('id-ID')}
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
 * Real-time notification container
 */
export const RealTimeNotificationContainer = ({
  notifications = [],
  onDismiss,
  onAction,
  maxNotifications = 5,
  position = 'top-right',
  className = ''
}) => {
  const [visibleNotifications, setVisibleNotifications] = useState([]);

  useEffect(() => {
    setVisibleNotifications(notifications.slice(0, maxNotifications));
  }, [notifications, maxNotifications]);

  const handleDismiss = (notificationId) => {
    setVisibleNotifications(prev =>
      prev.filter(notification => notification.id !== notificationId)
    );
    onDismiss?.(notificationId);
  };

  const getPositionClasses = () => {
    switch (position) {
      case 'top-left':
        return 'top-4 left-4';
      case 'top-right':
        return 'top-4 right-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'bottom-right':
        return 'bottom-4 right-4';
      default:
        return 'top-4 right-4';
    }
  };

  if (visibleNotifications.length === 0) return null;

  return (
    <div
      className={`fixed z-50 space-y-2 w-96 max-w-sm ${getPositionClasses()} ${className}`}
    >
      {visibleNotifications.map((notification) => (
        <RealTimeNotification
          key={notification.id}
          notification={notification}
          onDismiss={handleDismiss}
          onAction={onAction}
        />
      ))}
    </div>
  );
};

/**
 * Notification bell with badge
 */
export const NotificationBell = ({
  notificationCount = 0,
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
        {notificationCount > 0 ? (
          <BellRing className="h-5 w-5" />
        ) : (
          <Bell className="h-5 w-5" />
        )}
        {notificationCount > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
          >
            {notificationCount > 99 ? '99+' : notificationCount}
          </Badge>
        )}
      </Button>
    </div>
  );
};

/**
 * Real-time activity indicator
 */
export const RealTimeActivityIndicator = ({
  isActive = false,
  activity = 'idle',
  className = ''
}) => {
  const getActivityColor = () => {
    switch (activity) {
      case 'active':
        return 'text-green-500';
      case 'warning':
        return 'text-yellow-500';
      case 'error':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const getActivityText = () => {
    switch (activity) {
      case 'active':
        return 'Active';
      case 'warning':
        return 'Warning';
      case 'error':
        return 'Error';
      default:
        return 'Idle';
    }
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className={`relative`}>
        <Activity className={`h-4 w-4 ${getActivityColor()}`} />
        {isActive && (
          <div className={`absolute -top-1 -right-1 h-2 w-2 bg-green-500 rounded-full animate-pulse`} />
        )}
      </div>
      <span className={`text-sm ${getActivityColor()}`}>
        {getActivityText()}
      </span>
    </div>
  );
};

/**
 * Real-time status indicator
 */
export const RealTimeStatusIndicator = ({
  status = 'offline',
  className = ''
}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'online':
        return 'text-green-500';
      case 'offline':
        return 'text-gray-500';
      case 'connecting':
        return 'text-yellow-500';
      case 'error':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'online':
        return 'Online';
      case 'offline':
        return 'Offline';
      case 'connecting':
        return 'Connecting...';
      case 'error':
        return 'Connection Error';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className={`h-2 w-2 rounded-full ${getStatusColor().replace('text-', 'bg-')}`} />
      <span className={`text-sm ${getStatusColor()}`}>
        {getStatusText()}
      </span>
    </div>
  );
};

/**
 * Real-time data refresh indicator
 */
export const RealTimeRefreshIndicator = ({
  isRefreshing = false,
  lastUpdated = null,
  onRefresh,
  className = ''
}) => {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <Button
        variant="ghost"
        size="sm"
        onClick={onRefresh}
        disabled={isRefreshing}
      >
        <Zap className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
      </Button>
      {lastUpdated && (
        <span className="text-xs text-muted-foreground">
          Updated {new Date(lastUpdated).toLocaleTimeString('id-ID')}
        </span>
      )}
    </div>
  );
};

/**
 * Real-time connection status
 */
export const RealTimeConnectionStatus = ({
  isConnected = false,
  connectionType = 'websocket',
  className = ''
}) => {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
      <span className="text-sm text-muted-foreground">
        {isConnected ? `Connected via ${connectionType}` : 'Disconnected'}
      </span>
    </div>
  );
};

export default {
  RealTimeNotification,
  RealTimeNotificationContainer,
  NotificationBell,
  RealTimeActivityIndicator,
  RealTimeStatusIndicator,
  RealTimeRefreshIndicator,
  RealTimeConnectionStatus
};
