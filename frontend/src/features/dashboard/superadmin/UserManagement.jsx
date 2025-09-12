/**
 * SuperAdmin User Management
 * Menggunakan GenericTable dengan konfigurasi yang sudah dibuat
 */

import React, { useState } from 'react';
import { GenericTable } from '@/components/common';
import { usePaginatedApi } from '@/hooks';
import { userApi } from '@/api/BaseApiService';
import { USER_TABLE_CONFIG } from '@/config/tableConfigs';
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  MoreHorizontal,
  UserPlus,
  Download,
  Upload
} from 'lucide-react';

const UserManagement = () => {
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({});

  // API Hook untuk paginated data
  const {
    data: users,
    pagination,
    loading,
    error,
    handlePageChange,
    handleItemsPerPageChange,
    handleSearch,
    handleSort,
    handleFilter,
    refresh
  } = usePaginatedApi(userApi.getUsers);

  // Handle user actions
  const handleViewUser = (user) => {
  };

  const handleEditUser = (user) => {
  };

  const handleDeleteUser = (user) => {
  };

  const handleBulkAction = (action, users) => {
  };

  // Handle export
  const handleExport = () => {
  };

  // Handle import
  const handleImport = () => {
  };

  // Handle refresh
  const handleRefresh = () => {
    refresh();
  };

  // Handle row click
  const handleRowClick = (user) => {
    handleViewUser(user);
  };

  // Handle row action
  const handleRowAction = (user) => {
  };

  // Handle selection change
  const handleSelectionChange = (selected) => {
    setSelectedUsers(selected);
  };

  // Handle search
  const handleSearchChange = (value) => {
    setSearchTerm(value);
    handleSearch(value);
  };

  // Handle filter change
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    handleFilter(newFilters);
  };

  // Handle sort
  const handleSortChange = (field, direction) => {
    handleSort(field, direction);
  };

  // Table actions
  const tableActions = [
    {
      key: 'view',
      icon: <Eye className="w-4 h-4" />,
      onClick: handleViewUser,
      label: 'View'
    },
    {
      key: 'edit',
      icon: <Edit className="w-4 h-4" />,
      onClick: handleEditUser,
      label: 'Edit'
    },
    {
      key: 'delete',
      icon: <Trash2 className="w-4 h-4" />,
      onClick: handleDeleteUser,
      label: 'Delete',
      variant: 'destructive'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground">
            Manage all users across the platform
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleImport}
            className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <Upload className="w-4 h-4" />
            <span>Import</span>
          </button>
          <button
            onClick={handleExport}
            className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
          <button
            className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            <span>Add User</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <UserPlus className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Users</p>
              <p className="text-2xl font-semibold text-gray-900">
                {pagination?.totalItems || 0}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Eye className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Active Users</p>
              <p className="text-2xl font-semibold text-gray-900">
                {users?.filter(user => user.status === 'active').length || 0}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="p-2 bg-yellow-100 rounded-lg">
            <Edit className="w-6 h-6 text-yellow-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">Pending Users</p>
            <p className="text-2xl font-semibold text-gray-900">
              {users?.filter(user => user.status === 'pending').length || 0}
            </p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="p-2 bg-red-100 rounded-lg">
            <Trash2 className="w-6 h-6 text-red-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">Suspended Users</p>
            <p className="text-2xl font-semibold text-gray-900">
              {users?.filter(user => user.status === 'suspended').length || 0}
            </p>
          </div>
        </div>
      </div>

      {/* User Table */}
      <GenericTable
        columns={USER_TABLE_CONFIG.columns}
        data={users || []}
        loading={loading}
        error={error}
        pagination={true}
        currentPage={pagination?.currentPage || 1}
        totalPages={pagination?.totalPages || 1}
        totalItems={pagination?.totalItems || 0}
        itemsPerPage={pagination?.itemsPerPage || 10}
        onPageChange={handlePageChange}
        onItemsPerPageChange={handleItemsPerPageChange}
        onSort={handleSortChange}
        onFilter={handleFilterChange}
        onRefresh={handleRefresh}
        onExport={handleExport}
        onImport={handleImport}
        onRowClick={handleRowClick}
        onRowAction={handleRowAction}
        onSelectionChange={handleSelectionChange}
        selectable={true}
        selectedRows={selectedUsers}
        searchable={true}
        searchValue={searchTerm}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Search users..."
        filterable={true}
        sortable={true}
        showHeader={true}
        showFooter={true}
        showSearch={true}
        showActions={true}
        showTotal={true}
        showPageSize={true}
        pageSizeOptions={[10, 25, 50, 100]}
        maxVisiblePages={5}
        rowActions={tableActions}
        emptyText="No users found"
        emptyIcon="Users"
      />
    </div>
  );
};

export default UserManagement;
