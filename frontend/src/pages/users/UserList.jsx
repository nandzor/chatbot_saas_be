import React, { useState, useCallback } from 'react';
import { useDataList } from '@/hooks/useDataList';
import { useForm } from '@/hooks/useForm';
import { useModal } from '@/hooks/useModal';
import { userService } from '@/services/UserService';
import {
  DataTable,
  FilterBar,
  PageHeader,
  PageContainer,
  UnifiedFormModal,
  DetailsModal,
  ConfirmDialog,
  BulkActions,
  StatusBadge
} from '@/components/common';
import {
  Button,
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Pagination,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui';
import {
  Plus,
  Users,
  User,
  Settings,
  BarChart3,
  Download,
  Upload,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  Mail,
  Phone,
  Calendar,
  Shield,
  Crown
} from 'lucide-react';

// User table columns configuration
const userColumns = [
  {
    key: 'name',
    header: 'User',
    sortable: true,
    type: 'text',
    render: (value, item) => (
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-blue-100 rounded-lg">
          <User className="w-4 h-4 text-blue-600" />
        </div>
        <div>
          <div className="font-medium text-gray-900">{item.name}</div>
          <div className="text-sm text-gray-500">{item.email}</div>
        </div>
      </div>
    )
  },
  {
    key: 'username',
    header: 'Username',
    sortable: true,
    type: 'text',
    render: (value) => (
      <div className="flex items-center space-x-2">
        <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
          {value}
        </span>
      </div>
    )
  },
  {
    key: 'role',
    header: 'Role',
    sortable: true,
    type: 'badge',
    render: (value, item) => {
      const roleConfig = {
        super_admin: { label: 'Super Admin', variant: 'destructive', icon: Crown },
        admin: { label: 'Admin', variant: 'default', icon: Shield },
        manager: { label: 'Manager', variant: 'secondary', icon: Shield },
        user: { label: 'User', variant: 'outline', icon: User }
      };
      const config = roleConfig[value] || { label: value, variant: 'default', icon: User };
      const Icon = config.icon;
      return (
        <div className="flex items-center space-x-2">
          <Icon className="w-4 h-4 text-gray-400" />
          <Badge variant={config.variant}>{config.label}</Badge>
        </div>
      );
    }
  },
  {
    key: 'organization',
    header: 'Organization',
    sortable: true,
    type: 'text',
    render: (value) => (
      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-600">{value || 'N/A'}</span>
      </div>
    )
  },
  {
    key: 'status',
    header: 'Status',
    sortable: true,
    type: 'status',
    statusConfig: {
      active: { label: 'Active', variant: 'success' },
      inactive: { label: 'Inactive', variant: 'secondary' },
      suspended: { label: 'Suspended', variant: 'destructive' },
      pending: { label: 'Pending', variant: 'warning' }
    }
  },
  {
    key: 'email_verified_at',
    header: 'Verified',
    sortable: true,
    type: 'status',
    render: (value) => (
      <StatusBadge
        status={value ? 'verified' : 'unverified'}
        statusConfig={{
          verified: { label: 'Verified', variant: 'success', icon: '✓' },
          unverified: { label: 'Unverified', variant: 'secondary', icon: '✗' }
        }}
      />
    )
  },
  {
    key: 'last_login_at',
    header: 'Last Login',
    sortable: true,
    type: 'date',
    render: (value) => value ? new Date(value).toLocaleDateString() : 'Never'
  },
  {
    key: 'created_at',
    header: 'Joined',
    sortable: true,
    type: 'date',
    render: (value) => new Date(value).toLocaleDateString()
  }
];

// Filter configuration
const userFilterConfig = [
  {
    key: 'search',
    type: 'search',
    label: 'Search',
    placeholder: 'Search users...'
  },
  {
    key: 'role',
    type: 'select',
    label: 'Role',
    options: [
      { value: 'super_admin', label: 'Super Admin' },
      { value: 'admin', label: 'Admin' },
      { value: 'manager', label: 'Manager' },
      { value: 'user', label: 'User' }
    ]
  },
  {
    key: 'status',
    type: 'select',
    label: 'Status',
    options: [
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' },
      { value: 'suspended', label: 'Suspended' },
      { value: 'pending', label: 'Pending' }
    ]
  },
  {
    key: 'organization',
    type: 'select',
    label: 'Organization',
    options: [
      { value: 'org1', label: 'Organization 1' },
      { value: 'org2', label: 'Organization 2' },
      { value: 'org3', label: 'Organization 3' }
    ]
  },
  {
    key: 'email_verified',
    type: 'select',
    label: 'Email Verified',
    options: [
      { value: 'true', label: 'Verified' },
      { value: 'false', label: 'Unverified' }
    ]
  },
  {
    key: 'created_at_start',
    type: 'date',
    label: 'Joined From'
  },
  {
    key: 'created_at_end',
    type: 'date',
    label: 'Joined To'
  }
];

// Quick filters
const quickFilters = [
  { label: 'Active Users', filters: { status: 'active' } },
  { label: 'Inactive Users', filters: { status: 'inactive' } },
  { label: 'Verified Users', filters: { email_verified: 'true' } },
  { label: 'Admins', filters: { role: 'admin' } },
  { label: 'Recent Users', filters: { created_at_start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] } }
];

// User form fields
const userFormFields = [
  {
    name: 'name',
    label: 'Full Name',
    type: 'text',
    placeholder: 'Enter full name',
    required: true
  },
  {
    name: 'email',
    label: 'Email Address',
    type: 'email',
    placeholder: 'Enter email address',
    required: true
  },
  {
    name: 'username',
    label: 'Username',
    type: 'text',
    placeholder: 'Enter username',
    required: true,
    helpText: 'Unique username for login'
  },
  {
    name: 'password',
    label: 'Password',
    type: 'password',
    placeholder: 'Enter password',
    required: true,
    helpText: 'Minimum 8 characters'
  },
  {
    name: 'phone',
    label: 'Phone Number',
    type: 'tel',
    placeholder: 'Enter phone number'
  },
  {
    name: 'role',
    label: 'Role',
    type: 'select',
    options: [
      { value: 'user', label: 'User' },
      { value: 'manager', label: 'Manager' },
      { value: 'admin', label: 'Admin' },
      { value: 'super_admin', label: 'Super Admin' }
    ],
    required: true
  },
  {
    name: 'organization',
    label: 'Organization',
    type: 'select',
    options: [
      { value: 'org1', label: 'Organization 1' },
      { value: 'org2', label: 'Organization 2' },
      { value: 'org3', label: 'Organization 3' }
    ]
  },
  {
    name: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' },
      { value: 'suspended', label: 'Suspended' },
      { value: 'pending', label: 'Pending' }
    ],
    required: true
  },
  {
    name: 'send_welcome_email',
    label: 'Send Welcome Email',
    type: 'switch',
    helpText: 'Send welcome email to new user'
  }
];

// User details fields
const userDetailsFields = [
  {
    key: 'name',
    label: 'Full Name',
    type: 'text'
  },
  {
    key: 'email',
    label: 'Email Address',
    type: 'text'
  },
  {
    key: 'username',
    label: 'Username',
    type: 'text'
  },
  {
    key: 'phone',
    label: 'Phone Number',
    type: 'text'
  },
  {
    key: 'role',
    label: 'Role',
    type: 'badge'
  },
  {
    key: 'organization',
    label: 'Organization',
    type: 'text'
  },
  {
    key: 'status',
    label: 'Status',
    type: 'status',
    statusConfig: {
      active: { label: 'Active', variant: 'success' },
      inactive: { label: 'Inactive', variant: 'secondary' },
      suspended: { label: 'Suspended', variant: 'destructive' },
      pending: { label: 'Pending', variant: 'warning' }
    }
  },
  {
    key: 'email_verified_at',
    label: 'Email Verified',
    type: 'status',
    statusConfig: {
      verified: { label: 'Verified', variant: 'success' },
      unverified: { label: 'Unverified', variant: 'secondary' }
    },
    render: (value) => value ? 'verified' : 'unverified'
  },
  {
    key: 'last_login_at',
    label: 'Last Login',
    type: 'date'
  },
  {
    key: 'created_at',
    label: 'Joined',
    type: 'date'
  },
  {
    key: 'updated_at',
    label: 'Updated',
    type: 'date'
  }
];

const UserList = () => {
  // Modal states
  const formModal = useModal();
  const detailsModal = useModal();
  const deleteModal = useModal();

  // Use generic data list hook
  const {
    data: users,
    loading,
    error,
    pagination,
    filters,
    selectedItems,
    hasSelectedItems,
    allItemsSelected,
    handleFilterChange,
    handleFiltersReset,
    handlePageChange,
    handleItemSelection,
    handleBulkSelection,
    clearSelection,
    createItem,
    updateItem,
    deleteItem,
    bulkDeleteItems,
    handleSortChange,
    sorting,
    retryLoad,
    refreshData,
    exportData
  } = useDataList(userService, {
    defaultFilters: {
      search: '',
      role: '',
      status: '',
      organization: '',
      email_verified: '',
      created_at_start: '',
      created_at_end: ''
    },
    defaultPerPage: 15,
    enableSelection: true,
    enableBulkActions: true
  });

  // Form hook
  const form = useForm({}, {
    name: [
      { type: 'required', message: 'Name is required' },
      { type: 'minLength', value: 2, message: 'Name must be at least 2 characters' }
    ],
    email: [
      { type: 'required', message: 'Email is required' },
      { type: 'email', message: 'Invalid email format' }
    ],
    username: [
      { type: 'required', message: 'Username is required' },
      { type: 'minLength', value: 3, message: 'Username must be at least 3 characters' }
    ],
    password: [
      { type: 'required', message: 'Password is required' },
      { type: 'minLength', value: 8, message: 'Password must be at least 8 characters' }
    ],
    role: [
      { type: 'required', message: 'Role is required' }
    ],
    status: [
      { type: 'required', message: 'Status is required' }
    ]
  });

  // Row actions configuration
  const rowActions = [
    {
      label: 'View Details',
      icon: Eye,
      action: 'view'
    },
    {
      label: 'Edit User',
      icon: Edit,
      action: 'edit'
    },
    {
      label: 'Delete User',
      icon: Trash2,
      action: 'delete'
    }
  ];

  // Handle row actions
  const handleRowAction = useCallback((action, item) => {
    switch (action.action) {
      case 'view':
        detailsModal.open(item);
        break;
      case 'edit':
        form.setFormData(item);
        formModal.open({ mode: 'edit', data: item });
        break;
      case 'delete':
        deleteModal.open(item);
        break;
    }
  }, [detailsModal, formModal, deleteModal, form]);

  // Handle row click
  const handleRowClick = useCallback((item) => {
    detailsModal.open(item);
  }, [detailsModal]);

  // Handle form submission
  const handleFormSubmit = useCallback(async (formData) => {
    const modalData = formModal.data;
    const mode = modalData?.mode || 'create';

    let result;
    if (mode === 'create') {
      result = await createItem(formData);
    } else {
      const selectedUser = modalData?.data;
      if (!selectedUser) return { success: false };
      result = await updateItem(selectedUser.id, formData);
    }

    if (result.success) {
      formModal.close();
      form.resetForm();
    }
    return result;
  }, [createItem, updateItem, formModal, form]);

  // Handle create user
  const handleCreateUser = useCallback(() => {
    form.resetForm();
    formModal.open({ mode: 'create' });
  }, [formModal, form]);

  // Handle delete user
  const handleDeleteUser = useCallback(async () => {
    const selectedUser = deleteModal.data;
    if (!selectedUser) return { success: false };

    const result = await deleteItem(selectedUser.id);
    if (result.success) {
      deleteModal.close();
    }
    return result;
  }, [deleteItem, deleteModal]);

  // Handle bulk delete
  const handleBulkDelete = useCallback(async () => {
    if (!hasSelectedItems) return;

    const result = await bulkDeleteItems(selectedItems);
    if (result.success) {
      clearSelection();
    }
    return result;
  }, [bulkDeleteItems, selectedItems, hasSelectedItems, clearSelection]);

  // Handle export
  const handleExport = useCallback(async () => {
    return await exportData('json');
  }, [exportData]);

  // Handle quick filter
  const handleQuickFilter = useCallback((filter) => {
    handleFilterChange(filter.filters);
  }, [handleFilterChange]);

  return (
    <PageContainer>
      {/* Page Header */}
      <PageHeader
        title="User Management"
        description="Manage system users, roles, and permissions"
        icon={Users}
        primaryAction={{
          label: 'Create User',
          icon: Plus,
          onClick: handleCreateUser,
          disabled: loading
        }}
        secondaryActions={[
          {
            label: 'Import Users',
            icon: Upload,
            onClick: () => {/* Handle import */},
            disabled: loading
          },
          {
            label: 'Refresh',
            icon: RefreshCw,
            onClick: refreshData,
            disabled: loading
          },
          {
            label: 'Export',
            icon: Download,
            onClick: handleExport,
            disabled: loading
          }
        ]}
        metadata={[
          { label: 'Total Users', value: pagination.total },
          { label: 'Active Users', value: users.filter(u => u.status === 'active').length },
          { label: 'Verified Users', value: users.filter(u => u.email_verified_at).length }
        ]}
      />

      {/* Filters */}
      <FilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleFiltersReset}
        filterConfig={userFilterConfig}
        enableQuickFilters={true}
        quickFilters={quickFilters}
        onQuickFilter={handleQuickFilter}
        showExportImport={true}
        onExport={handleExport}
        loading={loading}
        hasActiveFilters={Object.values(filters).some(v => v !== '' && v !== null && v !== undefined)}
        activeFilterCount={Object.values(filters).filter(v => v !== '' && v !== null && v !== undefined).length}
      />

      {/* Bulk Actions */}
      <BulkActions
        selectedCount={selectedItems.length}
        totalCount={pagination.total}
        onClearSelection={clearSelection}
        primaryAction={{
          label: 'Delete Selected',
          icon: Trash2,
          variant: 'destructive',
          onClick: handleBulkDelete
        }}
        actions={[
          {
            label: 'Export Selected',
            icon: Download,
            variant: 'outline',
            onClick: () => exportData('json', { ids: selectedItems })
          },
          {
            label: 'Activate Selected',
            icon: Shield,
            variant: 'outline',
            onClick: () => {/* Handle bulk activate */}
          }
        ]}
      />

      {/* Data Table */}
      <DataTable
        data={users}
        columns={userColumns}
        loading={loading}
        error={error}
        selectedItems={selectedItems}
        onItemSelect={handleItemSelection}
        onBulkSelect={handleBulkSelection}
        enableSelection={true}
        sorting={sorting}
        onSortChange={handleSortChange}
        enableSorting={true}
        onRowClick={handleRowClick}
        rowActions={rowActions}
        onRowAction={handleRowAction}
        emptyMessage="No users found"
        emptyActionText="Create User"
        onEmptyAction={handleCreateUser}
        errorMessage="Failed to load users"
        onRetry={retryLoad}
        showPaginationInfo={true}
        pagination={pagination}
        variant="default"
        striped={true}
        hoverable={true}
      />

      {/* Pagination */}
      {pagination.last_page > 1 && (
        <div className="flex justify-center">
          <Pagination
            currentPage={pagination.current_page}
            totalPages={pagination.last_page}
            totalItems={pagination.total}
            onPageChange={handlePageChange}
            itemsPerPage={pagination.per_page}
            showItemsPerPage={true}
            onItemsPerPageChange={(perPage) => {
              // Handle per page change
            }}
          />
        </div>
      )}

      {/* Unified Form Modal */}
      <UnifiedFormModal
        isOpen={formModal.isOpen}
        onClose={formModal.close}
        mode={formModal.data?.mode || 'create'}
        onSubmit={handleFormSubmit}
        title={formModal.data?.mode === 'edit' ? 'Edit User' : 'Create New User'}
        description={formModal.data?.mode === 'edit' ? 'Update user information and settings' : 'Create a new user account with specific role and permissions'}
        icon={formModal.data?.mode === 'edit' ? Edit : User}
        fields={formModal.data?.mode === 'edit' ? userFormFields.filter(field => field.name !== 'password') : userFormFields}
        formData={form.formData}
        errors={form.errors}
        touched={form.touched}
        isSubmitting={form.isSubmitting}
        isValid={form.isValid}
        handleChange={form.handleChange}
        handleBlur={form.handleBlur}
        resetForm={form.resetForm}
        submitText={formModal.data?.mode === 'edit' ? 'Update User' : 'Create User'}
        size="lg"
      />

      {/* User Details Modal */}
      <DetailsModal
        isOpen={detailsModal.isOpen}
        onClose={detailsModal.close}
        title="User Details"
        description="View detailed information about this user"
        icon={User}
        data={detailsModal.data || {}}
        fields={userDetailsFields}
        primaryAction={{
          label: 'Edit User',
          icon: Edit,
          onClick: () => {
            if (detailsModal.data) {
              form.setFormData(detailsModal.data);
              detailsModal.close();
              formModal.open({ mode: 'edit', data: detailsModal.data });
            }
          }
        }}
        secondaryAction={{
          label: 'Delete User',
          icon: Trash2,
          variant: 'destructive',
          onClick: () => {
            if (detailsModal.data) {
              detailsModal.close();
              deleteModal.open(detailsModal.data);
            }
          }
        }}
        size="xl"
      />

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.close}
        onConfirm={handleDeleteUser}
        title="Delete User"
        description={`Are you sure you want to delete "${deleteModal.data?.name}"? This action cannot be undone.`}
        variant="destructive"
        confirmText="Delete User"
        cancelText="Cancel"
        confirmVariant="destructive"
      />
    </PageContainer>
  );
};

export default UserList;
