import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Badge,
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Skeleton
} from '@/components/ui';
import {
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Play,
  Pause,
  LogIn,
  Key,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  RefreshCw
} from 'lucide-react';
import { formatDate } from '@/utils/formatters';
import { useClientManagement } from '@/hooks/useClientManagement';
import { Pagination } from '@/pagination';

const ClientManagementTable = () => {
  // Use the client management hook
  const {
    organizations,
    loading,
    error,
    pagination,
    filters,
    sorting,
    loadOrganizations,
    updateOrganizationStatus,
    updateFilters,
    updatePagination,
    updateSorting,
    resetFilters
  } = useClientManagement();

  // Debug logging
  React.useEffect(() => {
  }, [organizations, loading, error, pagination]);

  // Local state for search
  const [searchTerm, setSearchTerm] = useState('');
  const [searchTimeout, setSearchTimeout] = useState(null);

  // Debounced search
  const handleSearchChange = useCallback((value) => {
    setSearchTerm(value);

    // Clear existing timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    // Set new timeout for debounced search
    const timeout = setTimeout(() => {
      updateFilters({ search: value });
    }, 500);

    setSearchTimeout(timeout);
  }, [searchTerm, updateFilters]);

  // Handle status filter change
  const handleStatusFilterChange = useCallback((status) => {
    updateFilters({ status: status === 'all' ? 'active' : status });
  }, [updateFilters]);

  // Handle sorting
  const handleSort = useCallback((field) => {
    const newOrder = sorting.sortBy === field && sorting.sortOrder === 'asc' ? 'desc' : 'asc';
    updateSorting({ sortBy: field, sortOrder: newOrder });
  }, [sorting, updateSorting]);

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { variant: 'green', label: 'Active' },
      trial: { variant: 'default', label: 'Trial' },
      suspended: { variant: 'red', label: 'Suspended' }
    };

    const config = statusConfig[status] || { variant: 'default', label: status };

    return (
      <Badge variant={config.variant}>
        {config.label}
      </Badge>
    );
  };

  const getPlanBadge = (planName) => {
    const planConfig = {
      'Basic': { variant: 'blue', className: '' },
      'Professional': { variant: 'purple', className: '' },
      'Enterprise': { variant: 'green', className: '' }
    };

    const config = planConfig[planName] || { variant: 'default', className: '' };

    return (
      <Badge variant={config.variant} className={config.className}>
        {planName}
      </Badge>
    );
  };

  // Handle status change
  const handleStatusChange = useCallback(async (orgId, newStatus) => {
    await updateOrganizationStatus(orgId, newStatus);
  }, [updateOrganizationStatus]);

  // Handle login as admin
  const handleLoginAsAdmin = useCallback(async (org) => {
    try {
      const response = await fetch('/api/v1/superadmin/login-as-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          organization_id: org.id,
          organization_name: org.name
        })
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(`Redirecting to ${org.name} admin dashboard...`);

        // Store the temporary admin token
        localStorage.setItem('admin_token', data.token);
        localStorage.setItem('admin_organization_id', org.id);

        // Redirect to admin dashboard
        window.open(`/admin/organizations/${org.id}/dashboard?token=${data.token}`, '_blank');
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to login as admin');
      }
    } catch (error) {
      toast.error('Failed to login as admin');
    }
  }, []);

  // Handle force password reset
  const handleForcePasswordReset = useCallback(async (org) => {
    try {
      const response = await fetch('/api/v1/superadmin/force-password-reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          organization_id: org.id,
          email: org.email,
          organization_name: org.name
        })
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(`Password reset email sent to ${org.email}`);
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to send password reset email');
      }
    } catch (error) {
      toast.error('Failed to send password reset email');
    }
  }, []);

  // Handle refresh
  const handleRefresh = useCallback(() => {
    loadOrganizations(true);
  }, [loadOrganizations]);

  // Get sort icon
  const getSortIcon = (field) => {
    if (sorting.sortBy !== field) {
      return <ArrowUpDown className="h-4 w-4" />;
    }
    return sorting.sortOrder === 'asc' ?
      <ArrowUp className="h-4 w-4" /> :
      <ArrowDown className="h-4 w-4" />;
  };

  // Loading skeleton
  const LoadingSkeleton = () => (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center space-x-4">
          <Skeleton className="h-4 w-[200px]" />
          <Skeleton className="h-4 w-[100px]" />
          <Skeleton className="h-4 w-[150px]" />
          <Skeleton className="h-4 w-[80px]" />
          <Skeleton className="h-4 w-[100px]" />
          <Skeleton className="h-4 w-[120px]" />
          <Skeleton className="h-4 w-[40px]" />
        </div>
      ))}
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Organizations</CardTitle>
            <CardDescription>
              Manajemen semua klien/tenant yang terdaftar di platform
            </CardDescription>
          </div>
          <Button variant="outline" onClick={handleRefresh} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            variant="outline"
            onClick={() => {
            }}
          >
            Debug
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Search and Filter */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search organizations..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={filters.status} onValueChange={handleStatusFilterChange}>
            <SelectTrigger className="w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="trial">Trial</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Organizations Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort('name')}
                    className="h-auto p-0 font-semibold"
                  >
                    Organization
                    {getSortIcon('name')}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort('org_code')}
                    className="h-auto p-0 font-semibold"
                  >
                    Code
                    {getSortIcon('org_code')}
                  </Button>
                </TableHead>
                <TableHead>Email</TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort('status')}
                    className="h-auto p-0 font-semibold"
                  >
                    Status
                    {getSortIcon('status')}
                  </Button>
                </TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort('created_at')}
                    className="h-auto p-0 font-semibold"
                  >
                    Created
                    {getSortIcon('created_at')}
                  </Button>
                </TableHead>
                <TableHead className="w-20">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7}>
                    <LoadingSkeleton />
                  </TableCell>
                </TableRow>
              ) : organizations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="text-gray-500">
                      {error ? (
                        <div>
                          <p className="text-red-600">Error loading organizations</p>
                          <p className="text-sm">{error}</p>
                        </div>
                      ) : (
                        <div>
                          <p>No organizations found</p>
                          <p className="text-xs mt-2 text-gray-400">
                            Debug: organizations.length = {organizations?.length || 0},
                            loading = {loading ? 'true' : 'false'},
                            error = {error || 'none'}
                          </p>
                        </div>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                organizations.map((org) => (
                  <TableRow key={org.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{org.name}</div>
                        <div className="text-sm text-gray-500">
                          {org.agentsCount || 0} agents • {org.messagesSent?.toLocaleString() || 0} messages
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                        {org.orgCode}
                      </code>
                    </TableCell>
                    <TableCell>{org.email}</TableCell>
                    <TableCell>{getStatusBadge(org.status)}</TableCell>
                    <TableCell>{getPlanBadge(org.subscriptionPlan?.name || 'N/A')}</TableCell>
                    <TableCell>{formatDate(org.createdAt, { format: 'short' })}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => window.location.href = `/superadmin/clients/${org.id}`}>
                            <Eye className="h-4 w-4 mr-2" />
                            Client 360° View
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleLoginAsAdmin(org)}>
                            <LogIn className="h-4 w-4 mr-2" />
                            Login as Admin
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleForcePasswordReset(org)}>
                            <Key className="h-4 w-4 mr-2" />
                            Force Password Reset
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleStatusChange(org.id, org.status === 'active' ? 'suspended' : 'active')}
                            className={org.status === 'suspended' ? 'text-green-600' : 'text-red-600'}
                          >
                            {org.status === 'suspended' ? (
                              <>
                                <Play className="h-4 w-4 mr-2" />
                                Activate
                              </>
                            ) : (
                              <>
                                <Pause className="h-4 w-4 mr-2" />
                                Suspend
                              </>
                            )}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="mt-6">
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              totalItems={pagination.totalItems}
              itemsPerPage={pagination.itemsPerPage}
              onPageChange={(page) => updatePagination({ currentPage: page })}
              onItemsPerPageChange={(itemsPerPage) => updatePagination({ itemsPerPage, currentPage: 1 })}
            />
          </div>
        )}

        {/* Summary */}
        <div className="mt-6 flex justify-between items-center text-sm text-gray-500">
          <span>
            Showing {organizations.length} of {pagination.totalItems} organizations
            {pagination.totalPages > 1 && (
              <span> (Page {pagination.currentPage} of {pagination.totalPages})</span>
            )}
          </span>
          <div className="flex items-center space-x-4">
            <span>
              Sorted by: <span className="font-medium">{sorting.sortBy}</span> ({sorting.sortOrder})
            </span>
            <span>
              Status: <span className="font-medium">{filters.status}</span>
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ClientManagementTable;
