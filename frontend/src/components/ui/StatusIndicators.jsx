import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui';
import { Button } from '@/components/ui';
import { Badge } from '@/components/ui';
import { Progress } from '@/components/ui';
import {
  Activity,
  Server,
  Cpu,
  MemoryStick,
  HardDrive,
  Wifi,
  CheckCircle,
  AlertCircle,
  XCircle,
  RefreshCw,
  Eye,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Info,
  RotateCcw,
  Trash2
} from 'lucide-react';

/**
 * System health indicator
 */
export const SystemHealthIndicator = ({
  status,
  message,
  lastCheck,
  onRefresh,
  loading = false,
  className = ''
}) => {
  const getStatusIcon = () => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'critical':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'unknown':
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
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
      case 'critical':
        return 'text-red-600';
      case 'unknown':
        return 'text-gray-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusBadge = () => {
    switch (status) {
      case 'healthy':
        return <Badge className="bg-green-100 text-green-800">Healthy</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-100 text-yellow-800">Warning</Badge>;
      case 'critical':
        return <Badge className="bg-red-100 text-red-800">Critical</Badge>;
      case 'unknown':
        return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>;
    }
  };

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {getStatusIcon()}
      <div className="flex-1">
        <div className="flex items-center space-x-2">
          <span className={`font-medium ${getStatusColor()}`}>
            {message || status}
          </span>
          {getStatusBadge()}
        </div>
        {lastCheck && (
          <p className="text-sm text-muted-foreground">
            Last checked: {new Date(lastCheck).toLocaleString('id-ID')}
          </p>
        )}
      </div>
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
  );
};

/**
 * Resource usage indicator
 */
export const ResourceUsageIndicator = ({
  label,
  value,
  max,
  unit = '%',
  color = 'blue',
  trend = 'neutral',
  className = ''
}) => {
  const percentage = (value / max) * 100;

  const getColorClass = () => {
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-red-500" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-green-500" />;
      default:
        return null;
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{label}</span>
        <div className="flex items-center space-x-1">
          {getTrendIcon()}
          <span className={`text-sm font-medium ${getColorClass()}`}>
            {value.toLocaleString('id-ID')}{unit}
          </span>
        </div>
      </div>
      <Progress value={percentage} className="h-2" />
      <div className="text-xs text-muted-foreground">
        {value.toLocaleString('id-ID')} / {max.toLocaleString('id-ID')} {unit}
      </div>
    </div>
  );
};

/**
 * Service status card
 */
export const ServiceStatusCard = ({
  service,
  status,
  uptime,
  responseTime,
  lastCheck,
  onRestart,
  onViewLogs,
  className = ''
}) => {
  const getStatusIcon = () => {
    switch (status) {
      case 'running':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'stopped':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'starting':
        return <RefreshCw className="w-5 h-5 text-yellow-500 animate-spin" />;
      case 'stopping':
        return <RefreshCw className="w-5 h-5 text-yellow-500 animate-spin" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'running':
        return 'text-green-600';
      case 'stopped':
        return 'text-red-600';
      case 'starting':
      case 'stopping':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatUptime = (seconds) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Server className="w-5 h-5" />
            <span>{service.name}</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            {getStatusIcon()}
            <span className={`text-sm font-medium ${getStatusColor()}`}>
              {status}
            </span>
          </div>
        </div>
        <CardDescription>{service.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Uptime</div>
              <div className="font-medium">
                {uptime ? formatUptime(uptime) : 'Unknown'}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Response Time</div>
              <div className="font-medium">
                {responseTime ? `${responseTime}ms` : 'Unknown'}
              </div>
            </div>
          </div>

          {lastCheck && (
            <div className="text-sm text-muted-foreground">
              Last checked: {new Date(lastCheck).toLocaleString('id-ID')}
            </div>
          )}

          <div className="flex space-x-2">
            {onRestart && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRestart}
                disabled={status === 'starting' || status === 'stopping'}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Restart
              </Button>
            )}
            {onViewLogs && (
              <Button
                variant="outline"
                size="sm"
                onClick={onViewLogs}
              >
                <Eye className="w-4 h-4 mr-2" />
                View Logs
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * System metrics dashboard
 */
export const SystemMetricsDashboard = ({
  metrics = {},
  onRefresh,
  loading = false,
  className = ''
}) => {
  const {
    cpu = { used: 0, total: 100 },
    memory = { used: 0, total: 100 },
    disk = { used: 0, total: 100 },
    network = { in: 0, out: 0 }
  } = metrics;

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">System Metrics</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={loading}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
            <Cpu className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <ResourceUsageIndicator
              label="CPU"
              value={cpu.used}
              max={cpu.total}
              unit="%"
              trend={cpu.trend}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
            <MemoryStick className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <ResourceUsageIndicator
              label="Memory"
              value={memory.used}
              max={memory.total}
              unit="%"
              trend={memory.trend}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Disk Usage</CardTitle>
            <HardDrive className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <ResourceUsageIndicator
              label="Disk"
              value={disk.used}
              max={disk.total}
              unit="%"
              trend={disk.trend}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Network</CardTitle>
            <Wifi className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>In: {network.in} MB/s</span>
                <span>Out: {network.out} MB/s</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

/**
 * Alert notification
 */
export const AlertNotification = ({
  alert,
  onDismiss,
  onAction,
  className = ''
}) => {
  const getAlertIcon = () => {
    switch (alert.severity) {
      case 'critical':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getAlertColor = () => {
    switch (alert.severity) {
      case 'critical':
        return 'border-red-200 bg-red-50';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50';
      case 'info':
        return 'border-blue-200 bg-blue-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <div className={`border-l-4 ${getAlertColor()} p-4 ${className}`}>
      <div className="flex items-start space-x-3">
        {getAlertIcon()}
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">{alert.title}</h4>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-xs">
                {alert.severity}
              </Badge>
              {onDismiss && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDismiss(alert.id)}
                  className="h-6 w-6 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {alert.message}
          </p>
          {alert.timestamp && (
            <p className="text-xs text-muted-foreground mt-1">
              {new Date(alert.timestamp).toLocaleString('id-ID')}
            </p>
          )}
          {alert.actions && alert.actions.length > 0 && (
            <div className="flex space-x-2 mt-3">
              {alert.actions.map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => onAction?.(action)}
                >
                  {action.label}
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * System logs viewer
 */
export const SystemLogsViewer = ({
  logs = [],
  onRefresh,
  onClear,
  loading = false,
  className = ''
}) => {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const filteredLogs = logs.filter(log => {
    if (filter !== 'all' && log.level !== filter) return false;
    if (search && !log.message.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const getLogIcon = (level) => {
    switch (level) {
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'info':
        return <Info className="w-4 h-4 text-blue-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Activity className="w-5 h-5" />
            <span>System Logs</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onClear}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex space-x-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-2 border rounded-md text-sm"
            >
              <option value="all">All Levels</option>
              <option value="error">Error</option>
              <option value="warning">Warning</option>
              <option value="info">Info</option>
            </select>
            <input
              type="text"
              placeholder="Search logs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 px-3 py-2 border rounded-md text-sm"
            />
          </div>

          <div className="max-h-96 overflow-y-auto space-y-2">
            {filteredLogs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No logs found
              </div>
            ) : (
              filteredLogs.map((log, index) => (
                <div
                  key={index}
                  className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  {getLogIcon(log.level)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-sm font-medium">{log.level}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(log.timestamp).toLocaleString('id-ID')}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{log.message}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default {
  SystemHealthIndicator,
  ResourceUsageIndicator,
  ServiceStatusCard,
  SystemMetricsDashboard,
  AlertNotification,
  SystemLogsViewer
};
