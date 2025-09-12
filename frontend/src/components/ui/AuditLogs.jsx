import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Shield,
  User,
  Building2,
  Settings,
  Eye,
  Edit,
  Trash2,
  Plus,
  Filter,
  Download,
  RefreshCw,
  Activity,
  Lock,
  Unlock,
  CreditCard,
  Mail,
  Phone,
  Globe,
  Zap,
  RotateCcw
} from 'lucide-react';

/**
 * Audit log entry
 */
export const AuditLogEntry = ({
  log,
  onViewDetails,
  className = ''
}) => {
  const getActionIcon = (action) => {
    switch (action) {
      case 'create':
        return <Plus className="w-4 h-4 text-green-500" />;
      case 'update':
        return <Edit className="w-4 h-4 text-blue-500" />;
      case 'delete':
        return <Trash2 className="w-4 h-4 text-red-500" />;
      case 'login':
        return <Lock className="w-4 h-4 text-green-500" />;
      case 'logout':
        return <Unlock className="w-4 h-4 text-gray-500" />;
      case 'view':
        return <Eye className="w-4 h-4 text-blue-500" />;
      case 'export':
        return <Download className="w-4 h-4 text-purple-500" />;
      case 'import':
        return <Upload className="w-4 h-4 text-orange-500" />;
      case 'permission':
        return <Shield className="w-4 h-4 text-yellow-500" />;
      case 'payment':
        return <CreditCard className="w-4 h-4 text-green-500" />;
      case 'email':
        return <Mail className="w-4 h-4 text-blue-500" />;
      case 'phone':
        return <Phone className="w-4 h-4 text-green-500" />;
      case 'api':
        return <Zap className="w-4 h-4 text-purple-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getActionColor = (action) => {
    switch (action) {
      case 'create':
        return 'text-green-600';
      case 'update':
        return 'text-blue-600';
      case 'delete':
        return 'text-red-600';
      case 'login':
        return 'text-green-600';
      case 'logout':
        return 'text-gray-600';
      case 'view':
        return 'text-blue-600';
      case 'export':
        return 'text-purple-600';
      case 'import':
        return 'text-orange-600';
      case 'permission':
        return 'text-yellow-600';
      case 'payment':
        return 'text-green-600';
      case 'email':
        return 'text-blue-600';
      case 'phone':
        return 'text-green-600';
      case 'api':
        return 'text-purple-600';
      default:
        return 'text-gray-600';
    }
  };

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case 'high':
        return <Badge className="bg-red-100 text-red-800">High</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>;
      case 'low':
        return <Badge className="bg-green-100 text-green-800">Low</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Info</Badge>;
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString('id-ID', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className={`border rounded-lg p-4 hover:bg-muted/50 transition-colors ${className}`}>
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 mt-1">
          {getActionIcon(log.action)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <span className={`font-medium ${getActionColor(log.action)}`}>
                {log.action.toUpperCase()}
              </span>
              {log.severity && getSeverityBadge(log.severity)}
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">
                {formatTimestamp(log.timestamp)}
              </span>
              {onViewDetails && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onViewDetails(log)}
                >
                  <Eye className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm">{log.description}</p>

            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <User className="w-4 h-4" />
                <span>{log.user?.name || 'Unknown User'}</span>
              </div>
              {log.organization && (
                <div className="flex items-center space-x-1">
                  <Building2 className="w-4 h-4" />
                  <span>{log.organization.name}</span>
                </div>
              )}
              {log.ipAddress && (
                <div className="flex items-center space-x-1">
                  <Globe className="w-4 h-4" />
                  <span>{log.ipAddress}</span>
                </div>
              )}
            </div>

            {log.resource && (
              <div className="text-sm text-muted-foreground">
                Resource: <span className="font-medium">{log.resource}</span>
              </div>
            )}

            {log.changes && log.changes.length > 0 && (
              <div className="text-sm">
                <div className="font-medium mb-1">Changes:</div>
                <div className="space-y-1">
                  {log.changes.map((change, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <span className="text-muted-foreground">{change.field}:</span>
                      <span className="text-red-600 line-through">{change.oldValue}</span>
                      <span className="text-muted-foreground">→</span>
                      <span className="text-green-600">{change.newValue}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Audit logs list
 */
export const AuditLogsList = ({
  logs = [],
  onViewDetails,
  onLoadMore,
  hasMore = false,
  loading = false,
  className = ''
}) => {
  return (
    <div className={`space-y-4 ${className}`}>
      {logs.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No audit logs found
        </div>
      ) : (
        logs.map((log) => (
          <AuditLogEntry
            key={log.id}
            log={log}
            onViewDetails={onViewDetails}
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
              <Activity className="w-4 h-4 mr-2" />
            )}
            Load More
          </Button>
        </div>
      )}
    </div>
  );
};

/**
 * Audit log filters
 */
export const AuditLogFilters = ({
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

  const actionOptions = [
    { value: 'create', label: 'Create' },
    { value: 'update', label: 'Update' },
    { value: 'delete', label: 'Delete' },
    { value: 'login', label: 'Login' },
    { value: 'logout', label: 'Logout' },
    { value: 'view', label: 'View' },
    { value: 'export', label: 'Export' },
    { value: 'import', label: 'Import' },
    { value: 'permission', label: 'Permission' },
    { value: 'payment', label: 'Payment' },
    { value: 'email', label: 'Email' },
    { value: 'phone', label: 'Phone' },
    { value: 'api', label: 'API' }
  ];

  const severityOptions = [
    { value: 'high', label: 'High' },
    { value: 'medium', label: 'Medium' },
    { value: 'low', label: 'Low' },
    { value: 'info', label: 'Info' }
  ];

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Filter className="w-5 h-5" />
          <span>Filters</span>
        </CardTitle>
        <CardDescription>
          Filter audit logs by various criteria
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Action</label>
              <select
                value={localFilters.action || ''}
                onChange={(e) => handleFilterChange('action', e.target.value)}
                className="w-full px-3 py-2 border rounded-md text-sm"
              >
                <option value="">All Actions</option>
                {actionOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Severity</label>
              <select
                value={localFilters.severity || ''}
                onChange={(e) => handleFilterChange('severity', e.target.value)}
                className="w-full px-3 py-2 border rounded-md text-sm"
              >
                <option value="">All Severities</option>
                {severityOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">User</label>
              <Input
                placeholder="Search by user name or email"
                value={localFilters.user || ''}
                onChange={(e) => handleFilterChange('user', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Organization</label>
              <Input
                placeholder="Search by organization name"
                value={localFilters.organization || ''}
                onChange={(e) => handleFilterChange('organization', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Date From</label>
              <Input
                type="date"
                value={localFilters.dateFrom || ''}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Date To</label>
              <Input
                type="date"
                value={localFilters.dateTo || ''}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
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
 * Audit log details modal
 */
export const AuditLogDetailsModal = ({
  log,
  isOpen,
  onClose,
  className = ''
}) => {
  if (!isOpen || !log) return null;

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="w-5 h-5" />
            <span>Audit Log Details</span>
          </CardTitle>
          <CardDescription>
            Detailed information about this audit log entry
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-medium text-muted-foreground">Action</div>
              <div className="text-lg font-semibold">{log.action.toUpperCase()}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Timestamp</div>
              <div className="text-lg">{formatTimestamp(log.timestamp)}</div>
            </div>
          </div>

          <div>
            <div className="text-sm font-medium text-muted-foreground mb-2">Description</div>
            <div className="text-sm">{log.description}</div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-medium text-muted-foreground">User</div>
              <div className="text-sm">{log.user?.name || 'Unknown User'}</div>
              <div className="text-xs text-muted-foreground">{log.user?.email}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">IP Address</div>
              <div className="text-sm">{log.ipAddress || 'Unknown'}</div>
            </div>
          </div>

          {log.organization && (
            <div>
              <div className="text-sm font-medium text-muted-foreground mb-2">Organization</div>
              <div className="text-sm">{log.organization.name}</div>
            </div>
          )}

          {log.resource && (
            <div>
              <div className="text-sm font-medium text-muted-foreground mb-2">Resource</div>
              <div className="text-sm">{log.resource}</div>
            </div>
          )}

          {log.changes && log.changes.length > 0 && (
            <div>
              <div className="text-sm font-medium text-muted-foreground mb-2">Changes</div>
              <div className="space-y-2">
                {log.changes.map((change, index) => (
                  <div key={index} className="p-3 border rounded-lg">
                    <div className="font-medium text-sm mb-1">{change.field}</div>
                    <div className="flex items-center space-x-2 text-sm">
                      <span className="text-red-600 line-through">{change.oldValue}</span>
                      <span className="text-muted-foreground">→</span>
                      <span className="text-green-600">{change.newValue}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {log.metadata && (
            <div>
              <div className="text-sm font-medium text-muted-foreground mb-2">Metadata</div>
              <pre className="text-xs bg-muted p-3 rounded-lg overflow-x-auto">
                {JSON.stringify(log.metadata, null, 2)}
              </pre>
            </div>
          )}

          <div className="flex justify-end">
            <Button onClick={onClose}>
              Close
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

/**
 * Activity timeline
 */
export const ActivityTimeline = ({
  activities = [],
  onLoadMore,
  hasMore = false,
  loading = false,
  className = ''
}) => {
  const getActivityIcon = (type) => {
    switch (type) {
      case 'user':
        return <User className="w-4 h-4 text-blue-500" />;
      case 'organization':
        return <Building2 className="w-4 h-4 text-purple-500" />;
      case 'payment':
        return <CreditCard className="w-4 h-4 text-green-500" />;
      case 'system':
        return <Settings className="w-4 h-4 text-gray-500" />;
      case 'api':
        return <Zap className="w-4 h-4 text-orange-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {activities.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No activities found
        </div>
      ) : (
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <div key={index} className="flex items-start space-x-3">
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
        </div>
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
  );
};

export default {
  AuditLogEntry,
  AuditLogsList,
  AuditLogFilters,
  AuditLogDetailsModal,
  ActivityTimeline
};
