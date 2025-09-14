/**
 * View User Permissions Dialog
 * Dialog untuk melihat permissions yang dimiliki oleh user
 */

import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import {
  Shield,
  CheckCircle,
  XCircle,
  Loader2,
  Search,
  Filter,
  AlertCircle
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Button,
  Input,
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  DataTable,
  EmptyState,
  Skeleton
} from '@/components/ui';
import userManagementService from '@/services/UserManagementService';

const ViewUserPermissionsDialog = ({
  isOpen,
  onClose,
  user
}) => {
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Load user permissions
  useEffect(() => {
    if (isOpen && user?.id) {
      loadUserPermissions();
    }
  }, [isOpen, user?.id]);

  const loadUserPermissions = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await userManagementService.getUserPermissions(user.id);

      if (response.success) {
        // Ensure permissions is always an array
        const permissionsData = response.data;
        if (Array.isArray(permissionsData)) {
          setPermissions(permissionsData);
        } else if (permissionsData && Array.isArray(permissionsData.permissions)) {
          setPermissions(permissionsData.permissions);
        } else if (permissionsData && Array.isArray(permissionsData.data)) {
          setPermissions(permissionsData.data);
        } else {
          setPermissions([]);
        }
      } else {
        setError(response.message || 'Failed to load user permissions');
        toast.error(response.message || 'Failed to load user permissions');
      }
    } catch (error) {
      setError('Failed to load user permissions');
      toast.error('Failed to load user permissions');
      console.error('Load user permissions error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter permissions
  const filteredPermissions = Array.isArray(permissions) ? permissions : [].filter(permission => {
    const matchesSearch = permission.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         permission.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || permission.type === filterType;
    const matchesStatus = filterStatus === 'all' ||
                         (filterStatus === 'granted' && permission.granted) ||
                         (filterStatus === 'denied' && !permission.granted);

    return matchesSearch && matchesType && matchesStatus;
  });

  // Group permissions by category
  const groupedPermissions = (filteredPermissions || []).reduce((groups, permission) => {
    const category = permission.category || 'Other';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(permission);
    return groups;
  }, {});

  const columns = [
    {
      key: 'name',
      title: 'Permission',
      render: (value, permission) => (
        <div className="space-y-1">
          <div className="font-medium text-gray-900">{permission.name}</div>
          {permission.description && (
            <div className="text-sm text-gray-500">{permission.description}</div>
          )}
        </div>
      )
    },
    {
      key: 'type',
      title: 'Type',
      render: (value) => (
        <Badge variant={value === 'system' ? 'default' : 'secondary'}>
          {value ? value.charAt(0).toUpperCase() + value.slice(1) : 'N/A'}
        </Badge>
      )
    },
    {
      key: 'granted',
      title: 'Status',
      render: (value) => (
        <div className="flex items-center space-x-2">
          {value ? (
            <CheckCircle className="w-4 h-4 text-green-600" />
          ) : (
            <XCircle className="w-4 h-4 text-red-600" />
          )}
          <span className={value ? 'text-green-600' : 'text-red-600'}>
            {value ? 'Granted' : 'Denied'}
          </span>
        </div>
      )
    }
  ];

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Shield className="w-5 h-5" />
            <span>User Permissions: {user.name}</span>
          </DialogTitle>
          <DialogDescription>
            View and manage permissions for {user.email}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col space-y-4">
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search Permissions</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search permissions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Type</label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="granted">Granted</SelectItem>
                  <SelectItem value="denied">Denied</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden">
            {loading ? (
              <div className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-8">
                <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Permissions</h3>
                <p className="text-gray-500 text-center mb-4">{error}</p>
                <Button onClick={loadUserPermissions} variant="outline">
                  Try Again
                </Button>
              </div>
            ) : filteredPermissions.length === 0 ? (
              <EmptyState
                title="No permissions found"
                description="No permissions match your current filters."
                actionText="Clear Filters"
                onAction={() => {
                  setSearchQuery('');
                  setFilterType('all');
                  setFilterStatus('all');
                }}
              />
            ) : (
              <div className="space-y-6">
                {Object.entries(groupedPermissions || {}).map(([category, categoryPermissions]) => (
                  <Card key={category}>
                    <CardHeader>
                      <CardTitle className="text-lg">{category}</CardTitle>
                      <CardDescription>
                        {categoryPermissions.length} permission{categoryPermissions.length !== 1 ? 's' : ''}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <DataTable
                        data={categoryPermissions}
                        columns={columns}
                        loading={false}
                        error={null}
                        searchable={false}
                        ariaLabel={`${category} permissions table`}
                        pagination={null}
                        selectable={false}
                      />
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ViewUserPermissionsDialog;
