import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  Zap,
  RefreshCw,
  Clock
} from 'lucide-react';

/**
 * Real-time update notification
 */
export const RealTimeUpdateNotification = ({
  update,
  onDismiss,
  onAction,
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);

  const getUpdateIcon = () => {
    switch (update.type) {
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

  const getUpdateColor = () => {
    switch (update.type) {
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
      onDismiss?.(update.id);
    }, 300);
  };

  const handleAction = () => {
    onAction?.(update);
  };

  if (!isVisible) return null;

  return (
    <div
      className={`transition-all duration-300 ${
        isAnimating ? 'opacity-0 transform translate-x-full' : 'opacity-100 transform translate-x-0'
      } ${className}`}
    >
      <Card className={`border-l-4 ${getUpdateColor()}`}>
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 mt-0.5">
              {getUpdateIcon()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-gray-900">
                  {update.title}
                </h4>
                <div className="flex items-center space-x-2">
                  {update.priority === 'high' && (
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
                {update.message}
              </p>
              {update.timestamp && (
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(update.timestamp).toLocaleTimeString('id-ID')}
                </p>
              )}
              {update.actions && update.actions.length > 0 && (
                <div className="flex space-x-2 mt-3">
                  {update.actions.map((action, index) => (
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
 * Real-time updates container
 */
export const RealTimeUpdatesContainer = ({
  updates = [],
  onDismiss,
  onAction,
  maxUpdates = 5,
  position = 'top-right',
  className = ''
}) => {
  const [visibleUpdates, setVisibleUpdates] = useState([]);

  useEffect(() => {
    setVisibleUpdates(updates.slice(0, maxUpdates));
  }, [updates, maxUpdates]);

  const handleDismiss = (updateId) => {
    setVisibleUpdates(prev =>
      prev.filter(update => update.id !== updateId)
    );
    onDismiss?.(updateId);
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

  if (visibleUpdates.length === 0) return null;

  return (
    <div
      className={`fixed z-50 space-y-2 w-96 max-w-sm ${getPositionClasses()} ${className}`}
    >
      {visibleUpdates.map((update) => (
        <RealTimeUpdateNotification
          key={update.id}
          update={update}
          onDismiss={handleDismiss}
          onAction={onAction}
        />
      ))}
    </div>
  );
};

/**
 * Real-time activity feed
 */
export const RealTimeActivityFeed = ({
  activities = [],
  onLoadMore,
  hasMore = false,
  loading = false,
  className = ''
}) => {
  const getActivityIcon = (type) => {
    switch (type) {
      case 'user':
        return <Users className="w-4 h-4 text-blue-500" />;
      case 'organization':
        return <Building2 className="w-4 h-4 text-purple-500" />;
      case 'payment':
        return <CreditCard className="w-4 h-4 text-green-500" />;
      case 'system':
        return <Settings className="w-4 h-4 text-gray-500" />;
      case 'activity':
        return <Activity className="w-4 h-4 text-orange-500" />;
      default:
        return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Activity className="w-5 h-5" />
          <span>Real-time Activity</span>
        </CardTitle>
        <CardDescription>
          Latest activities across the platform
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex-shrink-0 mt-1">
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="font-medium text-sm">{activity.action}</span>
                  {activity.organization && (
                    <Badge variant="outline" className="text-xs">
                      {activity.organization}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{activity.description}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(activity.timestamp).toLocaleString('id-ID')}
                </p>
              </div>
            </div>
          ))}

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
                  <Activity className="w-4 h-4 mr-2" />
                )}
                Load More
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * Real-time metrics display
 */
export const RealTimeMetricsDisplay = ({
  metrics = [],
  lastUpdated,
  onRefresh,
  className = ''
}) => {
  const getMetricIcon = (type) => {
    switch (type) {
      case 'revenue':
        return <CreditCard className="w-4 h-4" />;
      case 'users':
        return <Users className="w-4 h-4" />;
      case 'organizations':
        return <Building2 className="w-4 h-4" />;
      case 'activity':
        return <Activity className="w-4 h-4" />;
      default:
        return <Zap className="w-4 h-4" />;
    }
  };

  const formatValue = (value, type) => {
    switch (type) {
      case 'currency':
        return new Intl.NumberFormat('id-ID', {
          style: 'currency',
          currency: 'USD'
        }).format(value);
      case 'number':
        return new Intl.NumberFormat('id-ID').format(value);
      case 'percentage':
        return `${value}%`;
      default:
        return value;
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Real-time Metrics</h3>
        <div className="flex items-center space-x-2">
          {lastUpdated && (
            <span className="text-xs text-muted-foreground">
              Updated {new Date(lastUpdated).toLocaleTimeString('id-ID')}
            </span>
          )}
          {onRefresh && (
            <Button variant="outline" size="sm" onClick={onRefresh}>
              <RefreshCw className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.label}</CardTitle>
              {getMetricIcon(metric.type)}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatValue(metric.value, metric.format)}
              </div>
              {metric.change && (
                <p className="text-xs text-muted-foreground">
                  <span className={metric.change > 0 ? 'text-green-600' : 'text-red-600'}>
                    {metric.change > 0 ? '+' : ''}{metric.change}%
                  </span> from last hour
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

/**
 * Real-time status indicator
 */
export const RealTimeStatusIndicator = ({
  status,
  message,
  lastUpdate,
  className = ''
}) => {
  const getStatusIcon = () => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'connecting':
        return <RefreshCw className="w-4 h-4 text-yellow-500 animate-spin" />;
      case 'disconnected':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'connected':
        return 'text-green-600';
      case 'connecting':
        return 'text-yellow-600';
      case 'disconnected':
        return 'text-red-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {getStatusIcon()}
      <span className={`text-sm ${getStatusColor()}`}>
        {message || status}
      </span>
      {lastUpdate && (
        <span className="text-xs text-muted-foreground">
          ({new Date(lastUpdate).toLocaleTimeString('id-ID')})
        </span>
      )}
    </div>
  );
};

/**
 * Real-time connection status
 */
export const RealTimeConnectionStatus = ({
  isConnected,
  connectionType = 'websocket',
  lastMessage,
  onReconnect,
  className = ''
}) => {
  return (
    <div className={`flex items-center justify-between p-3 border rounded-lg ${className}`}>
      <div className="flex items-center space-x-3">
        <RealTimeStatusIndicator
          status={isConnected ? 'connected' : 'disconnected'}
          message={isConnected ? `Connected via ${connectionType}` : 'Disconnected'}
        />
        {lastMessage && (
          <span className="text-xs text-muted-foreground">
            Last message: {new Date(lastMessage).toLocaleTimeString('id-ID')}
          </span>
        )}
      </div>
      {!isConnected && onReconnect && (
        <Button variant="outline" size="sm" onClick={onReconnect}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Reconnect
        </Button>
      )}
    </div>
  );
};

export default {
  RealTimeUpdateNotification,
  RealTimeUpdatesContainer,
  RealTimeActivityFeed,
  RealTimeMetricsDisplay,
  RealTimeStatusIndicator,
  RealTimeConnectionStatus
};
