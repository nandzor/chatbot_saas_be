import React, { useState, useCallback } from 'react';
import { useDataList } from '@/hooks/useDataList';
import { useForm } from '@/hooks/useForm';
import { useModal } from '@/hooks/useModal';
import { permissionService } from '@/services/PermissionService';
import {
  DataTable,
  FilterBar,
  PageHeader,
  PageContainer,
  UnifiedFormModal,
  DetailsModal,
  ConfirmDialog,
  BulkActions
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
  Shield,
  Users,
  Settings,
  BarChart3,
  Download,
  Upload,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  Key,
  Crown
} from 'lucide-react';

// Permission table columns configuration
const permissionColumns = [
  {
    key: 'name',
    header: 'Permission Name',
    sortable: true,
    type: 'text',
    render: (value, item) => (
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-purple-100 rounded-lg">
          <Key className="w-4 h-4 text-purple-600" />
        </div>
        <div>
          <div className="font-medium text-gray-900">{item.name}</div>
          <div className="text-sm text-gray-500 font-mono">{item.code}</div>
        </div>
      </div>
    )
  },
  {
    key: 'category',
    header: 'Category',
    sortable: true,
    type: 'badge',
    render: (value) => {
      const categoryConfig = {
        user_management: { label: 'User Management', variant: 'default' },
        role_management: { label: 'Role Management', variant: 'secondary' },
        permission_management: { label: 'Permission Management', variant: 'outline' },
        system_admin: { label: 'System Admin', variant: 'destructive' },
        organization: { label: 'Organization', variant: 'default' },
        analytics: { label: 'Analytics', variant: 'secondary' }
      };
      const config = categoryConfig[value] || { label: value, variant: 'default' };
      return <Badge variant={config.variant}>{config.label}</Badge>;
    }
  },
  {
    key: 'resource',
    header: 'Resource',
    sortable: true,
    type: 'text',
    render: (value) => (
      <div className="flex items-center space-x-2">
        <Shield className="w-4 h-4 text-gray-400" />
        <span className="font-medium">{value}</span>
      </div>
    )
  },
  {
    key: 'action',
    header: 'Action',
    sortable: true,
    type: 'badge',
    render: (value) => {
      const actionConfig = {
        create: { label: 'Create', variant: 'success' },
        read: { label: 'Read', variant: 'default' },
        update: { label: 'Update', variant: 'warning' },
        delete: { label: 'Delete', variant: 'destructive' },
        manage: { label: 'Manage', variant: 'outline' }
      };
      const config = actionConfig[value] || { label: value, variant: 'default' };
      return <Badge variant={config.variant}>{config.label}</Badge>;
    }
  },
  {
    key: 'is_system',
    header: 'Type',
    sortable: true,
    type: 'badge',
    render: (value) => (
      <Badge variant={value ? 'outline' : 'secondary'}>
        {value ? 'System' : 'Custom'}
      </Badge>
    )
  },
  {
    key: 'is_active',
    header: 'Status',
    sortable: true,
    type: 'status',
    statusConfig: {
      true: { label: 'Active', variant: 'success' },
      false: { label: 'Inactive', variant: 'secondary' }
    }
  },
  {
    key: 'created_at',
    header: 'Created',
    sortable: true,
    type: 'date',
    render: (value) => new Date(value).toLocaleDateString()
  }
];

// Filter configuration
const permissionFilterConfig = [
  {
    key: 'search',
    type: 'search',
    label: 'Search',
    placeholder: 'Search permissions...'
  },
    {
      key: 'category',
    type: 'select',
      label: 'Category',
    options: [
      { value: 'user_management', label: 'User Management' },
      { value: 'role_management', label: 'Role Management' },
      { value: 'permission_management', label: 'Permission Management' },
      { value: 'system_admin', label: 'System Admin' },
      { value: 'organization', label: 'Organization' },
      { value: 'analytics', label: 'Analytics' }
    ]
  },
  {
    key: 'resource',
    type: 'select',
    label: 'Resource',
    options: [
      { value: 'users', label: 'Users' },
      { value: 'roles', label: 'Roles' },
      { value: 'permissions', label: 'Permissions' },
      { value: 'organizations', label: 'Organizations' },
      { value: 'analytics', label: 'Analytics' }
    ]
  },
  {
    key: 'action',
    type: 'select',
    label: 'Action',
      options: [
      { value: 'create', label: 'Create' },
      { value: 'read', label: 'Read' },
      { value: 'update', label: 'Update' },
      { value: 'delete', label: 'Delete' },
      { value: 'manage', label: 'Manage' }
      ]
    },
    {
      key: 'is_system',
    type: 'select',
      label: 'Type',
      options: [
      { value: 'true', label: 'System' },
      { value: 'false', label: 'Custom' }
      ]
    },
    {
    key: 'is_active',
    type: 'select',
      label: 'Status',
      options: [
      { value: 'true', label: 'Active' },
      { value: 'false', label: 'Inactive' }
    ]
  }
];

// Quick filters
const quickFilters = [
  { label: 'System Permissions', filters: { is_system: 'true' } },
  { label: 'Custom Permissions', filters: { is_system: 'false' } },
  { label: 'Active Permissions', filters: { is_active: 'true' } },
  { label: 'User Management', filters: { category: 'user_management' } },
  { label: 'Role Management', filters: { category: 'role_management' } }
];

// Permission form fields
const permissionFormFields = [
  {
    name: 'name',
    label: 'Permission Name',
    type: 'text',
    placeholder: 'Enter permission name',
    required: true
  },
  {
    name: 'code',
    label: 'Permission Code',
    type: 'text',
    placeholder: 'Enter permission code',
    required: true,
    helpText: 'Unique identifier for the permission'
  },
  {
    name: 'description',
    label: 'Description',
    type: 'textarea',
    placeholder: 'Enter permission description',
    rows: 3
  },
  {
    name: 'category',
    label: 'Category',
    type: 'select',
    options: [
      { value: 'user_management', label: 'User Management' },
      { value: 'role_management', label: 'Role Management' },
      { value: 'permission_management', label: 'Permission Management' },
      { value: 'system_admin', label: 'System Admin' },
      { value: 'organization', label: 'Organization' },
      { value: 'analytics', label: 'Analytics' }
    ],
    required: true
  },
  {
    name: 'resource',
    label: 'Resource',
    type: 'select',
    options: [
      { value: 'users', label: 'Users' },
      { value: 'roles', label: 'Roles' },
      { value: 'permissions', label: 'Permissions' },
      { value: 'organizations', label: 'Organizations' },
      { value: 'analytics', label: 'Analytics' }
    ],
    required: true
  },
  {
    name: 'action',
    label: 'Action',
    type: 'select',
    options: [
      { value: 'create', label: 'Create' },
      { value: 'read', label: 'Read' },
      { value: 'update', label: 'Update' },
      { value: 'delete', label: 'Delete' },
      { value: 'manage', label: 'Manage' }
    ],
    required: true
  },
  {
    name: 'is_active',
    label: 'Active',
    type: 'switch',
    helpText: 'Enable or disable this permission'
  }
];

// Permission details fields
const permissionDetailsFields = [
  {
        key: 'name',
    label: 'Permission Name',
    type: 'text'
  },
  {
    key: 'code',
    label: 'Permission Code',
    type: 'text'
  },
  {
    key: 'description',
    label: 'Description',
    type: 'text'
  },
  {
        key: 'category',
    label: 'Category',
    type: 'badge'
  },
  {
    key: 'resource',
    label: 'Resource',
    type: 'text'
  },
  {
    key: 'action',
    label: 'Action',
    type: 'badge'
  },
  {
    key: 'is_system',
    label: 'Type',
    type: 'badge'
  },
  {
    key: 'is_active',
    label: 'Status',
    type: 'status',
    statusConfig: {
      true: { label: 'Active', variant: 'success' },
      false: { label: 'Inactive', variant: 'secondary' }
    }
  },
  {
    key: 'created_at',
    label: 'Created',
    type: 'date'
  },
  {
    key: 'updated_at',
    label: 'Updated',
    type: 'date'
  }
];

const PermissionList = () => {
  // Modal states
  const formModal = useModal();
  const detailsModal = useModal();
  const deleteModal = useModal();

  // Use generic data list hook
  const {
    data: permissions,
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
  } = useDataList(permissionService, {
    defaultFilters: {
      search: '',
      category: '',
      resource: '',
      action: '',
      is_system: '',
      is_active: ''
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
    code: [
      { type: 'required', message: 'Code is required' },
      { type: 'pattern', value: /^[a-zA-Z0-9_]+$/, message: 'Code must contain only letters, numbers, and underscores' }
    ],
    category: [
      { type: 'required', message: 'Category is required' }
    ],
    resource: [
      { type: 'required', message: 'Resource is required' }
    ],
    action: [
      { type: 'required', message: 'Action is required' }
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
        label: 'Edit Permission',
        icon: Edit,
      action: 'edit'
      },
      {
        label: 'Delete Permission',
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
      const selectedPermission = modalData?.data;
      if (!selectedPermission) return { success: false };
      result = await updateItem(selectedPermission.id, formData);
    }

    if (result.success) {
      formModal.close();
      form.resetForm();
    }
    return result;
  }, [createItem, updateItem, formModal, form]);

  // Handle create permission
  const handleCreatePermission = useCallback(() => {
    form.resetForm();
    formModal.open({ mode: 'create' });
  }, [formModal, form]);

  // Handle delete permission
  const handleDeletePermission = useCallback(async () => {
    const selectedPermission = deleteModal.data;
    if (!selectedPermission) return { success: false };

    const result = await deleteItem(selectedPermission.id);
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
          title="Permission Management"
        description="Manage system permissions and access control"
        icon={Key}
          primaryAction={{
          label: 'Create Permission',
            icon: Plus,
          onClick: handleCreatePermission,
          disabled: loading
        }}
        secondaryActions={[
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
          { label: 'Total Permissions', value: pagination.total },
          { label: 'Active Permissions', value: permissions.filter(p => p.is_active).length },
          { label: 'System Permissions', value: permissions.filter(p => p.is_system).length }
        ]}
      />

        {/* Filters */}
        <FilterBar
          filters={filters}
          onFilterChange={handleFilterChange}
        onReset={handleFiltersReset}
        filterConfig={permissionFilterConfig}
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
          }
        ]}
      />

      {/* Data Table */}
              <DataTable
        data={permissions}
        columns={permissionColumns}
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
        emptyMessage="No permissions found"
        emptyActionText="Create Permission"
        onEmptyAction={handleCreatePermission}
        errorMessage="Failed to load permissions"
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
        title={formModal.data?.mode === 'edit' ? 'Edit Permission' : 'Create New Permission'}
        description={formModal.data?.mode === 'edit' ? 'Update permission information and settings' : 'Create a new permission with specific access controls'}
        icon={formModal.data?.mode === 'edit' ? Edit : Key}
        fields={permissionFormFields}
        formData={form.formData}
        errors={form.errors}
        touched={form.touched}
        isSubmitting={form.isSubmitting}
        isValid={form.isValid}
        handleChange={form.handleChange}
        handleBlur={form.handleBlur}
        resetForm={form.resetForm}
        submitText={formModal.data?.mode === 'edit' ? 'Update Permission' : 'Create Permission'}
        size="lg"
      />

      {/* Permission Details Modal */}
      <DetailsModal
        isOpen={detailsModal.isOpen}
        onClose={detailsModal.close}
        title="Permission Details"
        description="View detailed information about this permission"
        icon={Key}
        data={detailsModal.data || {}}
        fields={permissionDetailsFields}
        primaryAction={{
          label: 'Edit Permission',
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
          label: 'Delete Permission',
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
        onConfirm={handleDeletePermission}
        title="Delete Permission"
        description={`Are you sure you want to delete "${deleteModal.data?.name}"? This action cannot be undone.`}
        variant="destructive"
        confirmText="Delete Permission"
        cancelText="Cancel"
        confirmVariant="destructive"
      />
    </PageContainer>
  );
};

export default PermissionList;
