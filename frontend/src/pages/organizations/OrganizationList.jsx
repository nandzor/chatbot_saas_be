import React, { useState, useCallback } from 'react';
import { useDataList } from '@/hooks/useDataList';
import { useForm } from '@/hooks/useForm';
import { useModal } from '@/hooks/useModal';
import { organizationService } from '@/services/OrganizationService';
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
  Building2,
  Users,
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
  Globe,
  MapPin
} from 'lucide-react';

// Organization table columns configuration
const organizationColumns = [
  {
    key: 'name',
    header: 'Organization',
    sortable: true,
    type: 'text',
    render: (value, item) => (
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-green-100 rounded-lg">
          <Building2 className="w-4 h-4 text-green-600" />
        </div>
        <div>
          <div className="font-medium text-gray-900">{item.name}</div>
          <div className="text-sm text-gray-500 font-mono">{item.slug}</div>
        </div>
      </div>
    )
  },
  {
    key: 'type',
    header: 'Type',
    sortable: true,
    type: 'badge',
    render: (value) => {
      const typeConfig = {
        company: { label: 'Company', variant: 'default' },
        nonprofit: { label: 'Non-Profit', variant: 'secondary' },
        government: { label: 'Government', variant: 'outline' },
        educational: { label: 'Educational', variant: 'destructive' }
      };
      const config = typeConfig[value] || { label: value, variant: 'default' };
      return <Badge variant={config.variant}>{config.label}</Badge>;
    }
  },
  {
    key: 'industry',
    header: 'Industry',
    sortable: true,
    type: 'text',
    render: (value) => (
      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-600">{value || 'N/A'}</span>
      </div>
    )
  },
  {
    key: 'user_count',
    header: 'Users',
    sortable: true,
    type: 'number',
    render: (value) => (
      <div className="flex items-center space-x-2">
        <Users className="w-4 h-4 text-gray-400" />
        <span className="font-medium">{value || 0}</span>
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
    key: 'location',
    header: 'Location',
    sortable: true,
    type: 'text',
    render: (value) => (
      <div className="flex items-center space-x-2">
        <MapPin className="w-4 h-4 text-gray-400" />
        <span className="text-sm text-gray-600">{value || 'N/A'}</span>
      </div>
    )
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
const organizationFilterConfig = [
  {
    key: 'search',
    type: 'search',
    label: 'Search',
    placeholder: 'Search organizations...'
  },
  {
    key: 'type',
    type: 'select',
    label: 'Type',
    options: [
      { value: 'company', label: 'Company' },
      { value: 'nonprofit', label: 'Non-Profit' },
      { value: 'government', label: 'Government' },
      { value: 'educational', label: 'Educational' }
    ]
  },
  {
    key: 'industry',
    type: 'select',
    label: 'Industry',
    options: [
      { value: 'technology', label: 'Technology' },
      { value: 'healthcare', label: 'Healthcare' },
      { value: 'finance', label: 'Finance' },
      { value: 'education', label: 'Education' },
      { value: 'retail', label: 'Retail' },
      { value: 'manufacturing', label: 'Manufacturing' }
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
    key: 'location',
    type: 'select',
    label: 'Location',
    options: [
      { value: 'us', label: 'United States' },
      { value: 'eu', label: 'Europe' },
      { value: 'asia', label: 'Asia' },
      { value: 'other', label: 'Other' }
    ]
  },
  {
    key: 'created_at_start',
    type: 'date',
    label: 'Created From'
  },
  {
    key: 'created_at_end',
    type: 'date',
    label: 'Created To'
  }
];

// Quick filters
const quickFilters = [
  { label: 'Active Organizations', filters: { status: 'active' } },
  { label: 'Companies', filters: { type: 'company' } },
  { label: 'Technology', filters: { industry: 'technology' } },
  { label: 'Large Organizations', filters: { user_count_min: '100' } },
  { label: 'Recent Organizations', filters: { created_at_start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] } }
];

// Organization form fields
const organizationFormFields = [
  {
    name: 'name',
    label: 'Organization Name',
    type: 'text',
    placeholder: 'Enter organization name',
    required: true
  },
  {
    name: 'slug',
    label: 'Organization Slug',
    type: 'text',
    placeholder: 'Enter organization slug',
    required: true,
    helpText: 'Unique identifier for the organization (lowercase, hyphens only)'
  },
  {
    name: 'description',
    label: 'Description',
    type: 'textarea',
    placeholder: 'Enter organization description',
    rows: 3
  },
  {
    name: 'type',
    label: 'Type',
    type: 'select',
    options: [
      { value: 'company', label: 'Company' },
      { value: 'nonprofit', label: 'Non-Profit' },
      { value: 'government', label: 'Government' },
      { value: 'educational', label: 'Educational' }
    ],
    required: true
  },
  {
    name: 'industry',
    label: 'Industry',
    type: 'select',
    options: [
      { value: 'technology', label: 'Technology' },
      { value: 'healthcare', label: 'Healthcare' },
      { value: 'finance', label: 'Finance' },
      { value: 'education', label: 'Education' },
      { value: 'retail', label: 'Retail' },
      { value: 'manufacturing', label: 'Manufacturing' }
    ]
  },
  {
    name: 'email',
    label: 'Contact Email',
    type: 'email',
    placeholder: 'Enter contact email'
  },
  {
    name: 'phone',
    label: 'Contact Phone',
    type: 'tel',
    placeholder: 'Enter contact phone'
  },
  {
    name: 'website',
    label: 'Website',
    type: 'url',
    placeholder: 'Enter website URL'
  },
  {
    name: 'location',
    label: 'Location',
    type: 'text',
    placeholder: 'Enter location'
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
  }
];

// Organization details fields
const organizationDetailsFields = [
  {
    key: 'name',
    label: 'Organization Name',
    type: 'text'
  },
  {
    key: 'slug',
    label: 'Organization Slug',
    type: 'text'
  },
  {
    key: 'description',
    label: 'Description',
    type: 'text'
  },
  {
    key: 'type',
    label: 'Type',
    type: 'badge'
  },
  {
    key: 'industry',
    label: 'Industry',
    type: 'text'
  },
  {
    key: 'email',
    label: 'Contact Email',
    type: 'text'
  },
  {
    key: 'phone',
    label: 'Contact Phone',
    type: 'text'
  },
  {
    key: 'website',
    label: 'Website',
    type: 'text'
  },
  {
    key: 'location',
    label: 'Location',
    type: 'text'
  },
  {
    key: 'user_count',
    label: 'Users',
    type: 'number'
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

const OrganizationList = () => {
  // Modal states
  const formModal = useModal();
  const detailsModal = useModal();
  const deleteModal = useModal();

  // Use generic data list hook
  const {
    data: organizations,
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
  } = useDataList(organizationService, {
    defaultFilters: {
      search: '',
      type: '',
      industry: '',
      status: '',
      location: '',
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
    slug: [
      { type: 'required', message: 'Slug is required' },
      { type: 'pattern', value: /^[a-z0-9-]+$/, message: 'Slug must contain only lowercase letters, numbers, and hyphens' }
    ],
    type: [
      { type: 'required', message: 'Type is required' }
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
      label: 'Edit Organization',
      icon: Edit,
      action: 'edit'
    },
    {
      label: 'Delete Organization',
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
      const selectedOrganization = modalData?.data;
      if (!selectedOrganization) return { success: false };
      result = await updateItem(selectedOrganization.id, formData);
    }

    if (result.success) {
      formModal.close();
      form.resetForm();
    }
    return result;
  }, [createItem, updateItem, formModal, form]);

  // Handle create organization
  const handleCreateOrganization = useCallback(() => {
    form.resetForm();
    formModal.open({ mode: 'create' });
  }, [formModal, form]);

  // Handle delete organization
  const handleDeleteOrganization = useCallback(async () => {
    const selectedOrganization = deleteModal.data;
    if (!selectedOrganization) return { success: false };

    const result = await deleteItem(selectedOrganization.id);
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
        title="Organization Management"
        description="Manage organizations, users, and settings"
        icon={Building2}
        primaryAction={{
          label: 'Create Organization',
          icon: Plus,
          onClick: handleCreateOrganization,
          disabled: loading
        }}
        secondaryActions={[
          {
            label: 'Import Organizations',
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
          { label: 'Total Organizations', value: pagination.total },
          { label: 'Active Organizations', value: organizations.filter(o => o.status === 'active').length },
          { label: 'Total Users', value: organizations.reduce((sum, org) => sum + (org.user_count || 0), 0) }
        ]}
      />

      {/* Filters */}
      <FilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleFiltersReset}
        filterConfig={organizationFilterConfig}
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
            icon: Building2,
            variant: 'outline',
            onClick: () => {/* Handle bulk activate */}
          }
        ]}
      />

      {/* Data Table */}
      <DataTable
        data={organizations}
        columns={organizationColumns}
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
        emptyMessage="No organizations found"
        emptyActionText="Create Organization"
        onEmptyAction={handleCreateOrganization}
        errorMessage="Failed to load organizations"
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
        title={formModal.data?.mode === 'edit' ? 'Edit Organization' : 'Create New Organization'}
        description={formModal.data?.mode === 'edit' ? 'Update organization information and settings' : 'Create a new organization with specific settings and users'}
        icon={formModal.data?.mode === 'edit' ? Edit : Building2}
        fields={organizationFormFields}
        formData={form.formData}
        errors={form.errors}
        touched={form.touched}
        isSubmitting={form.isSubmitting}
        isValid={form.isValid}
        handleChange={form.handleChange}
        handleBlur={form.handleBlur}
        resetForm={form.resetForm}
        submitText={formModal.data?.mode === 'edit' ? 'Update Organization' : 'Create Organization'}
        size="lg"
      />

      {/* Organization Details Modal */}
      <DetailsModal
        isOpen={detailsModal.isOpen}
        onClose={detailsModal.close}
        title="Organization Details"
        description="View detailed information about this organization"
        icon={Building2}
        data={detailsModal.data || {}}
        fields={organizationDetailsFields}
        primaryAction={{
          label: 'Edit Organization',
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
          label: 'Delete Organization',
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
        onConfirm={handleDeleteOrganization}
        title="Delete Organization"
        description={`Are you sure you want to delete "${deleteModal.data?.name}"? This action cannot be undone.`}
        variant="destructive"
        confirmText="Delete Organization"
        cancelText="Cancel"
        confirmVariant="destructive"
      />
    </PageContainer>
  );
};

export default OrganizationList;
