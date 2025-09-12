/**
 * SuperAdmin Organization Management
 * Menggunakan GenericTable dengan konfigurasi yang sudah dibuat
 */

import React, { useState } from 'react';
import { GenericTable } from '@/components/common';
import { usePaginatedApi } from '@/hooks';
import { organizationApi } from '@/api/BaseApiService';
import { ORGANIZATION_TABLE_CONFIG } from '@/config/tableConfigs';
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Building2,
  Users,
  Download,
  Upload
} from 'lucide-react';

const OrganizationManagement = () => {
  const [selectedOrganizations, setSelectedOrganizations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({});

  // API Hook untuk paginated data
  const {
    data: organizations,
    pagination,
    loading,
    error,
    handlePageChange,
    handleItemsPerPageChange,
    handleSearch,
    handleSort,
    handleFilter,
    refresh
  } = usePaginatedApi(organizationApi.getOrganizations);

  // Handle organization actions
  const handleViewOrganization = (organization) => {
  };

  const handleEditOrganization = (organization) => {
  };

  const handleDeleteOrganization = (organization) => {
  };

  const handleViewUsers = (organization) => {
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
  const handleRowClick = (organization) => {
    handleViewOrganization(organization);
  };

  // Handle row action
  const handleRowAction = (organization) => {
  };

  // Handle selection change
  const handleSelectionChange = (selected) => {
    setSelectedOrganizations(selected);
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
      onClick: handleViewOrganization,
      label: 'View'
    },
    {
      key: 'edit',
      icon: <Edit className="w-4 h-4" />,
      onClick: handleEditOrganization,
      label: 'Edit'
    },
    {
      key: 'users',
      icon: <Users className="w-4 h-4" />,
      onClick: handleViewUsers,
      label: 'Users'
    },
    {
      key: 'delete',
      icon: <Trash2 className="w-4 h-4" />,
      onClick: handleDeleteOrganization,
      label: 'Delete',
      variant: 'destructive'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Organization Management</h1>
          <p className="text-muted-foreground">
            Manage all organizations and their settings
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
            <span>Add Organization</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Building2 className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Organizations</p>
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
              <p className="text-sm font-medium text-gray-500">Active Organizations</p>
              <p className="text-2xl font-semibold text-gray-900">
                {organizations?.filter(org => org.status === 'active').length || 0}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Users className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Trial Organizations</p>
              <p className="text-2xl font-semibold text-gray-900">
                {organizations?.filter(org => org.status === 'trial').length || 0}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <Trash2 className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Suspended Organizations</p>
              <p className="text-2xl font-semibold text-gray-900">
                {organizations?.filter(org => org.status === 'suspended').length || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Organization Table */}
      <GenericTable
        columns={ORGANIZATION_TABLE_CONFIG.columns}
        data={organizations || []}
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
        selectedRows={selectedOrganizations}
        searchable={true}
        searchValue={searchTerm}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Search organizations..."
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
        emptyText="No organizations found"
        emptyIcon="Building2"
      />
    </div>
  );
};

export default OrganizationManagement;
