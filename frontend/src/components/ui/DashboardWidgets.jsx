import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  TrendingUp,
  TrendingDown,
  Users,
  Building2,
  CreditCard,
  Activity,
  Zap,
  Settings,
  RefreshCw,
  Download,
  AlertCircle,
  CheckCircle,
  Info,
  BarChart3,
  Server,
  XCircle
} from 'lucide-react';

/**
 * Metric widget
 */
export const MetricWidget = ({
  title,
  value,
  change,
  changeType = 'percentage',
  trend = 'neutral',
  icon: Icon,
  color = 'blue',
  loading = false,
  className = ''
}) => {
  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatValue = (val) => {
    if (changeType === 'percentage') {
      return `${val}%`;
    } else if (changeType === 'currency') {
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'USD'
      }).format(val);
    } else if (changeType === 'number') {
      return val.toLocaleString('id-ID');
    } else {
      return val;
    }
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <div className="w-4 h-4 bg-muted animate-pulse rounded" />
        </CardHeader>
        <CardContent>
          <div className="w-16 h-8 bg-muted animate-pulse rounded mb-2" />
          <div className="w-24 h-4 bg-muted animate-pulse rounded" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {Icon && <Icon className="w-4 h-4 text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formatValue(value)}</div>
        {change !== undefined && (
          <div className={`flex items-center space-x-1 text-sm ${getTrendColor()}`}>
            {getTrendIcon()}
            <span>
              {change > 0 ? '+' : ''}{change}%
            </span>
            <span className="text-muted-foreground">from last period</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

/**
 * Progress widget
 */
export const ProgressWidget = ({
  title,
  value,
  max,
  unit = '%',
  color = 'blue',
  showPercentage = true,
  loading = false,
  className = ''
}) => {
  const percentage = (value / max) * 100;

  const getColorClass = () => {
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-green-600';
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full h-2 bg-muted animate-pulse rounded mb-2" />
          <div className="w-16 h-4 bg-muted animate-pulse rounded" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold">{value}{unit}</span>
            {showPercentage && (
              <span className={`text-sm font-medium ${getColorClass()}`}>
                {Math.round(percentage)}%
              </span>
            )}
          </div>
          <Progress value={percentage} className="h-2" />
          <div className="text-xs text-muted-foreground">
            {value} / {max} {unit}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * Chart widget
 */
export const ChartWidget = ({
  title,
  description,
  children,
  onRefresh,
  onDownload,
  onSettings,
  loading = false,
  error = null,
  className = ''
}) => {
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5" />
              <span>{title}</span>
            </CardTitle>
            {description && (
              <CardDescription>{description}</CardDescription>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {onRefresh && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            )}
            {onDownload && (
              <Button
                variant="outline"
                size="sm"
                onClick={onDownload}
              >
                <Download className="w-4 h-4" />
              </Button>
            )}
            {onSettings && (
              <Button
                variant="outline"
                size="sm"
                onClick={onSettings}
              >
                <Settings className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {error ? (
          <div className="flex items-center justify-center h-64 text-center">
            <div className="space-y-2">
              <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
};

/**
 * Activity feed widget
 */
export const ActivityFeedWidget = ({
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
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Activity className="w-5 h-5" />
          <span>Recent Activity</span>
        </CardTitle>
        <CardDescription>
          Latest activities across the platform
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No activities found
            </div>
          ) : (
            activities.map((activity, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
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
 * Status widget
 */
export const StatusWidget = ({
  title,
  status,
  message,
  lastUpdate,
  onRefresh,
  loading = false,
  className = ''
}) => {
  const getStatusIcon = () => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'unknown':
        return <Info className="w-5 h-5 text-gray-500" />;
      default:
        return <Activity className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'healthy':
        return 'text-green-600';
      case 'warning':
        return 'text-yellow-600';
      case 'error':
        return 'text-red-600';
      case 'unknown':
        return 'text-gray-600';
      default:
        return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-16 h-4 bg-muted animate-pulse rounded mb-2" />
          <div className="w-24 h-3 bg-muted animate-pulse rounded" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          {onRefresh && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-3">
          {getStatusIcon()}
          <div className="flex-1">
            <div className={`font-medium ${getStatusColor()}`}>
              {message || status}
            </div>
            {lastUpdate && (
              <p className="text-sm text-muted-foreground">
                Last updated: {new Date(lastUpdate).toLocaleString('id-ID')}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * Quick actions widget
 */
export const QuickActionsWidget = ({
  actions = [],
  onAction,
  className = ''
}) => {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Zap className="w-5 h-5" />
          <span>Quick Actions</span>
        </CardTitle>
        <CardDescription>
          Common actions you can perform
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant="outline"
              onClick={() => onAction?.(action)}
              className="h-auto p-4 flex flex-col items-center space-y-2"
            >
              {action.icon && <action.icon className="w-5 h-5" />}
              <span className="text-sm">{action.label}</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * Resource usage widget
 */
export const ResourceUsageWidget = ({
  resources = [],
  onRefresh,
  loading = false,
  className = ''
}) => {
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Server className="w-5 h-5" />
            <span>Resource Usage</span>
          </CardTitle>
          {onRefresh && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {resources.map((resource, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{resource.name}</span>
                <span className="text-sm text-muted-foreground">
                  {resource.used} / {resource.total} {resource.unit}
                </span>
              </div>
              <Progress value={(resource.used / resource.total) * 100} className="h-2" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * Dashboard grid
 */
export const DashboardGrid = ({
  children,
  columns = 4,
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
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4';
    }
  };

  return (
    <div className={`grid ${getGridClass()} gap-4 ${className}`}>
      {children}
    </div>
  );
};

export default {
  MetricWidget,
  ProgressWidget,
  ChartWidget,
  ActivityFeedWidget,
  StatusWidget,
  QuickActionsWidget,
  ResourceUsageWidget,
  DashboardGrid
};
