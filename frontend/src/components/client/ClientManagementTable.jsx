import React, { useState, useCallback } from 'react';
import {
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Settings,
  Users,
  Shield,
  Activity,
  Upload,
  Download
} from 'lucide-react';
import {Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Badge, Skeleton, Select, SelectItem, Input, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, Avatar, AvatarFallback, AvatarImage} from '@/components/ui';
import { useClientManagement } from '@/hooks/useClientManagement';
import { formatDate } from '@/utils/formatters';

const ClientManagementTable = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrganizations, setSelectedOrganizations] = useState([]);

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

  const handleSearchChange = useCallback((value) => {
    setSearchTerm(value);
    updateFilters({ search: value });
  }, [updateFilters]);

  const handleStatusFilterChange = useCallback((status) => {
    setStatusFilter(status);
    updateFilters({ status: status === 'all' ? 'active' : status });
  }, [updateFilters]);

  const handleOrganizationSelect = useCallback((id, selected) => {
    if (selected) {
      setSelectedOrganizations(prev => [...prev, id]);
    } else {
      setSelectedOrganizations(prev => prev.filter(orgId => orgId !== id));
    }
  }, []);

  const handleSelectAll = useCallback((selected) => {
    if (selected) {
      setSelectedOrganizations(organizations.map(org => org.id));
    } else {
      setSelectedOrganizations([]);
    }
  }, [organizations]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Organizations</CardTitle>
            <CardDescription>
              Manage all client organizations and their settings
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            {selectedOrganizations.length > 0 && (
              <Button variant="outline">
                <MoreHorizontal className="h-4 w-4 mr-2" />
                Bulk Actions ({selectedOrganizations.length})
              </Button>
            )}
            <Button variant="outline">
              <Upload className="h-4 w-4 mr-2" />
              Import
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters and Search */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex-1 min-w-[300px]">
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
          <Select value={statusFilter} onValueChange={handleStatusFilterChange} className="w-48" placeholder="Filter by status">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="trial">Trial</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
</Select>
        </div>

        {/* Organizations Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300"
                    checked={selectedOrganizations.length === organizations.length && organizations.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                  />
                </TableHead>
                <TableHead>Organization</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Users</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Last Activity</TableHead>
                <TableHead className="w-20">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9}>
                    <div className="space-y-4">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-center space-x-4">
                          <Skeleton className="h-4 w-4" />
                          <Skeleton className="h-4 w-[200px]" />
                          <Skeleton className="h-4 w-[150px]" />
                          <Skeleton className="h-4 w-[80px]" />
                          <Skeleton className="h-4 w-[100px]" />
                          <Skeleton className="h-4 w-[60px]" />
                          <Skeleton className="h-4 w-[120px]" />
                          <Skeleton className="h-4 w-[120px]" />
                          <Skeleton className="h-4 w-[40px]" />
                        </div>
                      ))}
                    </div>
                  </TableCell>
                </TableRow>
              ) : organizations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
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
                      <input
                        type="checkbox"
                        className="rounded border-gray-300"
                        checked={selectedOrganizations.includes(org.id)}
                        onChange={(e) => handleOrganizationSelect(org.id, e.target.checked)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={org.logo} />
                          <AvatarFallback>
                            {org.name?.charAt(0)?.toUpperCase() || 'O'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{org.name}</div>
                          <div className="text-sm text-gray-500">
                            {org.orgCode}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="text-sm font-medium">{org.email}</div>
                        <div className="text-sm text-gray-500">{org.phone}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        org.status === 'active' ? 'green' :
                        org.status === 'trial' ? 'default' :
                        org.status === 'suspended' ? 'red' : 'gray'
                      }>
                        {org.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {org.subscriptionPlan?.name || 'N/A'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span>{org.usersCount || 0}</span>
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(org.createdAt, { format: 'short' })}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Activity className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">
                          {formatDate(org.updatedAt, { format: 'short' })}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Settings className="h-4 w-4 mr-2" />
                            Settings
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Users className="h-4 w-4 mr-2" />
                            Manage Users
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Shield className="h-4 w-4 mr-2" />
                            Permissions
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
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
      </CardContent>
    </Card>
  );
};

export default ClientManagementTable;
