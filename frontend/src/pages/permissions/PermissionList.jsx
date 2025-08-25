import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Plus,
  Eye,
  Edit,
  Copy as CopyIcon,
  Trash2,
  CheckCircle,
  XCircle,
  Shield,
  Settings,
  Key,
  Lock,
  Users,
  FileText
} from 'lucide-react';
import { toast } from 'react-hot-toast';

import { usePermissionManagement } from '@/hooks/usePermissionManagement';
import { usePermissionCheck } from '@/hooks/usePermissionCheck';

import CreatePermissionDialog from './CreatePermissionDialog';
import ViewPermissionDetailsDialog from './ViewPermissionDetailsDialog';
import EditPermissionDialog from './EditPermissionDialog';

import {
  // Header & container
  PageHeaderWithActions,
  DataContainer,
  // Filters
  FilterBar,
  // Badges & Buttons
  Badge,
  Button,
  // Table & pagination
  DataTable,
  Pagination,
  // Confirm dialog
  DeleteConfirmDialog,
  // States
  Skeleton,
  EmptyState,
  ErrorMessage
} from '@/components/ui';

const PermissionList = () => {
  // Hooks
  const {
    permissions,
    loading,
    error,
    filters,
    pagination,
    loadPermissions,
    createPermission,
    updatePermission,
    deletePermission,
    clearError,
    handlePageChange,
    handlePerPageChange,
    refreshPermissions,
    setFilters,
  } = usePermissionManagement();
  const { can } = usePermissionCheck();

  // Local UI state
  const [selected, setSelected] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Handle filter changes
  const handleFilterChange = useCallback((key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  }, [setFilters]);

  const handleClearFilters = useCallback((cleared) => {
    setFilters(cleared);
  }, [setFilters]);

  // Get permission category icon and color
  const getCategoryInfo = useCallback((category) => {
    switch (category) {
      case 'system':
        return { icon: Shield, color: 'bg-red-100 text-red-800', label: 'System' };
      case 'user_management':
        return { icon: Users, color: 'bg-blue-100 text-blue-800', label: 'User Management' };
      case 'role_management':
        return { icon: Key, color: 'bg-purple-100 text-purple-800', label: 'Role Management' };
      case 'permission_management':
        return { icon: Lock, color: 'bg-green-100 text-green-800', label: 'Permission Management' };
      case 'content_management':
        return { icon: FileText, color: 'bg-yellow-100 text-yellow-800', label: 'Content Management' };
      case 'settings':
        return { icon: Settings, color: 'bg-gray-100 text-gray-800', label: 'Settings' };
      default:
        return { icon: Settings, color: 'bg-gray-100 text-gray-800', label: category?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Other' };
    }
  }, []);

  // Load permissions when filters change
  useEffect(() => {
    loadPermissions();
  }, [filters]);

  // Error surface
  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  // Derived data
  const categoryOptions = useMemo(() => {
    const set = new Set(permissions.map(p => p.category).filter(Boolean));
    return Array.from(set);
  }, [permissions]);

  const filteredPermissions = useMemo(() => {
    let result = permissions;

    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(p =>
        (p.name || '').toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q) ||
        (p.category || '').toLowerCase().includes(q) ||
        (p.resource || '').toLowerCase().includes(q) ||
        (p.action || '').toLowerCase().includes(q)
      );
    }

    if (filters.category) result = result.filter(p => p.category === filters.category);
    if (filters.is_system !== '') result = result.filter(p => p.is_system === (filters.is_system === 'true'));
    if (filters.is_visible !== '') result = result.filter(p => p.is_visible === (filters.is_visible === 'true'));
    if (filters.status) result = result.filter(p => p.status === filters.status);

    return result;
  }, [permissions, filters]);

  // Filter options config for FilterBar
  const filterOptions = useMemo(() => ([
    {
      key: 'category',
      label: 'Category',
      placeholder: 'All Categories',
      options: [
        { value: '', label: 'All Categories' },
        ...categoryOptions.map(c => ({ value: c, label: c.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) }))
      ]
    },
    {
      key: 'is_system',
      label: 'Type',
      placeholder: 'All Types',
      options: [
        { value: '', label: 'All Types' },
        { value: 'true', label: 'System Permissions' },
        { value: 'false', label: 'Custom Permissions' }
      ]
    },
    {
      key: 'status',
      label: 'Status',
      placeholder: 'All Status',
      options: [
        { value: '', label: 'All Status' },
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' }
      ]
    }
  ]), [categoryOptions]);

  // Columns config for DataTable
  const columns = useMemo(() => {
    return [
      {
        header: 'Permission',
        key: 'name',
        className: 'w-[30%] min-w-[240px]',
        render: (_val, item) => (
          <div className="flex items-center">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center mr-3"
              style={{ backgroundColor: (item.color || '#6B7280') + '20' }}
            >
              <Shield className="w-5 h-5" style={{ color: item.color || '#6B7280' }} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-gray-900">{item.name}</h3>
                {item.is_system && (
                  <Badge variant="destructive" className="text-xs">SYS</Badge>
                )}
              </div>
              <p className="text-sm text-gray-500 font-mono">{item.code}</p>
              {item.description && (
                <p className="text-xs text-gray-400 mt-1 max-w-xs truncate">{item.description}</p>
              )}
            </div>
          </div>
        )
      },
      {
        header: 'Category & Resource',
        key: 'category',
        className: 'w-[30%] min-w-[220px]',
        render: (_val, item) => {
          const categoryInfo = getCategoryInfo(item.category);
          return (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge className={categoryInfo.color}>
                  <categoryInfo.icon className="w-3 h-3 mr-1" />
                  {categoryInfo.label}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Resource:</span>
                <Badge variant="outline" className="font-mono">
                  {item.resource || 'N/A'}
                </Badge>
              </div>
              <div className="text-xs text-gray-400">Action: {item.action || 'N/A'}</div>
            </div>
          );
        }
      },
      {
        header: 'Access & Scope',
        key: 'scope',
        className: 'w-[20%] min-w-[180px]',
        render: (_val, item) => (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Type:</span>
              <Badge variant={item.is_system ? 'destructive' : 'outline'}>
                {item.is_system ? 'System' : 'Custom'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Visible:</span>
              <Badge variant={item.is_visible ? 'default' : 'secondary'}>
                {item.is_visible ? 'Yes' : 'No'}
              </Badge>
            </div>
            <div className="text-xs text-gray-400">{item.metadata?.scope || 'Global'} scope</div>
          </div>
        )
      },
      {
        header: 'Status',
        key: 'status',
        className: 'w-[10%] min-w-[120px]',
        render: (val) => (
          val === 'active' ? (
            <Badge className="bg-green-100 text-green-800">
              <CheckCircle className="w-3 h-3 mr-1" />
              Active
            </Badge>
          ) : (
            <Badge variant="secondary">
              <XCircle className="w-3 h-3 mr-1" />
              {val || 'Inactive'}
            </Badge>
          )
        )
      }
    ];
  }, [getCategoryInfo]);

  // Actions for DataTable
  const rowActions = useMemo(() => {
    return [
      {
        label: 'View Details',
        icon: Eye,
        onClick: (item) => onView(item)
      },
      {
        label: 'Edit Permission',
        icon: Edit,
        onClick: (item) => onEdit(item),
        className: !can('permissions.update') ? 'pointer-events-none opacity-50' : '',
        separator: true
      },
      {
        label: 'Clone Permission',
        icon: CopyIcon,
        onClick: (item) => onClone(item)
      },
      {
        label: 'Delete Permission',
        icon: Trash2,
        onClick: (item) => onAskDelete(item),
        className: `text-red-600 focus:text-red-600 ${!can('permissions.delete') ? 'pointer-events-none opacity-50' : ''}`,
        separator: true
      }
    ];
  }, [can]);

  // Handlers
  const handleCreateSubmit = async (data) => {
    try {
      setActionLoading(true);
      const res = await createPermission(data);
      if (res.success) {
        toast.success('Permission created');
        setShowCreate(false);
      } else {
        toast.error(res.error || 'Failed to create');
      }
    } finally {
      setActionLoading(false);
    }
  };

  const onEdit = (permission) => {
    setSelected(permission);
    setShowEdit(true);
  };

  const handleEditSubmit = async (data) => {
    try {
      if (!selected) return;
      setActionLoading(true);
      const res = await updatePermission(selected.id, data);
      if (res.success) {
        toast.success('Permission updated');
        setShowEdit(false);
        setSelected(null);
      } else {
        toast.error(res.error || 'Failed to update');
      }
    } finally {
      setActionLoading(false);
    }
  };

  const onView = (permission) => {
    setSelected(permission);
    setShowDetails(true);
  };

  const onClone = (permission) => {
    setSelected({ ...permission, id: undefined, name: `${permission.name} (Copy)` });
    setShowCreate(true);
  };

  const onAskDelete = (permission) => {
    setSelected(permission);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      if (!selected) return;
      setActionLoading(true);
      const res = await deletePermission(selected.id);
      if (res.success) {
        toast.success('Permission deleted');
        setShowDeleteConfirm(false);
        setSelected(null);
      } else {
        toast.error(res.error || 'Failed to delete');
      }
    } finally {
      setActionLoading(false);
    }
  };

  // Loading state (skeleton) - AFTER all hooks
  if (loading && permissions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-32 w-full" />
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const showEmpty = !loading && filteredPermissions.length === 0;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <PageHeaderWithActions
          title="Permission Management"
          description="Manage system permissions, access controls, and security policies across the system"
          primaryAction={{
            text: 'Create Permission',
            icon: Plus,
            onClick: () => { setSelected(null); setShowCreate(true); },
            disabled: !can('permissions.create')
          }}
        />

        {/* Error message (non-blocking) */}
        <ErrorMessage error={error} className="" />

        {/* Filters */}
        <FilterBar
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
          searchPlaceholder="Search permissions by name, code, description, or resource..."
          filterOptions={filterOptions}
          className=""
        />

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <DataContainer>
            <div className="p-0">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Shield className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Permissions</p>
                  <p className="text-2xl font-bold text-gray-900">{pagination.total || permissions.length}</p>
                </div>
              </div>
            </div>
          </DataContainer>

          <DataContainer>
            <div className="p-0">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Permissions</p>
                  <p className="text-2xl font-bold text-gray-900">{permissions.filter(p => p.status === 'active').length}</p>
                </div>
              </div>
            </div>
          </DataContainer>

          <DataContainer>
            <div className="p-0">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Shield className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">System Permissions</p>
                  <p className="text-2xl font-bold text-gray-900">{permissions.filter(p => p.is_system).length}</p>
                </div>
              </div>
            </div>
          </DataContainer>

          <DataContainer>
            <div className="p-0">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <CopyIcon className="w-6 h-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Custom Permissions</p>
                  <p className="text-2xl font-bold text-gray-900">{permissions.filter(p => !p.is_system).length}</p>
                </div>
              </div>
            </div>
          </DataContainer>
        </div>

        {/* Table or Empty */}
        <DataContainer>
          <div className="mb-2">
            <h3 className="text-lg font-semibold text-gray-900">Permissions Overview</h3>
            <p className="text-sm text-gray-600">
              {pagination.total} permissions found • Showing {pagination.current_page} of {pagination.last_page} pages
            </p>
          </div>

          {showEmpty ? (
            <EmptyState
              title="No permissions found"
              description="Try adjusting filters or create a new permission."
              actionText={can('permissions.create') ? 'Create Permission' : undefined}
              onAction={can('permissions.create') ? () => { setSelected(null); setShowCreate(true); } : undefined}
              className=""
            />
          ) : (
            <>
              <DataTable
                data={filteredPermissions}
                columns={columns}
                actions={rowActions}
                loading={loading}
                emptyMessage="No permissions found."
              />

              <Pagination
                className="mt-6"
                currentPage={pagination.current_page}
                totalPages={pagination.last_page}
                totalItems={pagination.total}
                perPage={pagination.per_page}
                onPageChange={handlePageChange}
                onPerPageChange={handlePerPageChange}
              />
            </>
          )}
        </DataContainer>
      </div>

      {/* Create */}
      <CreatePermissionDialog isOpen={showCreate} onClose={() => setShowCreate(false)} onSubmit={handleCreateSubmit} loading={actionLoading} />

      {/* Edit */}
      <EditPermissionDialog isOpen={showEdit} onClose={() => setShowEdit(false)} permission={selected} onSubmit={handleEditSubmit} loading={actionLoading} />

      {/* Details */}
      <ViewPermissionDetailsDialog isOpen={showDetails} onClose={() => setShowDetails(false)} permission={selected} onEdit={onEdit} onClone={onClone} onDelete={onAskDelete} />

      {/* Delete confirm */}
      <DeleteConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={confirmDelete}
        itemName={selected?.name}
        itemType="permission"
        loading={actionLoading}
      />
    </div>
  );
};

export default PermissionList;
