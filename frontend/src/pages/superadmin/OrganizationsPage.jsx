import React, { useState, useCallback } from 'react';
import {
  Building2,
  Plus,
  BarChart3,
  Users,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  RefreshCw
} from 'lucide-react';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Badge,
  Skeleton,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui';
import { useClientManagement } from '@/hooks/useClientManagement';
import ClientManagementTable from '@/features/superadmin/ClientManagementTable';
import CreateOrganizationDialog from '@/components/organization/CreateOrganizationDialog';
import EditOrganizationDialog from '@/components/organization/EditOrganizationDialog';
import OrganizationDetailsModal from '@/components/organization/OrganizationDetailsModal';
import OrganizationQuickActions from '@/components/organization/OrganizationQuickActions';
import OrganizationAnalytics from '@/components/organization/OrganizationAnalytics';

const OrganizationsPage = () => {
  // State for dialogs and modals
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedOrganization, setSelectedOrganization] = useState(null);

  // State for view modes
  const [viewMode, setViewMode] = useState('table'); // 'table', 'analytics', 'quick-actions'

  // Use client management hook
  const {
    organizations,
    loading,
    error,
    pagination,
    filters,
    sorting,
    loadOrganizations,
    createOrganization,
    updateOrganization,
    deleteOrganization,
    getOrganizationById,
    getOrganizationStatistics,
    updateFilters,
    updatePagination,
    updateSorting,
    resetFilters
  } = useClientManagement();

  // State for statistics
  const [statistics, setStatistics] = useState({});
  const [statisticsLoading, setStatisticsLoading] = useState(true);

  // Load statistics
  const loadStatistics = useCallback(async () => {
    try {
      setStatisticsLoading(true);
      const response = await getOrganizationStatistics();

      if (response.success) {
        setStatistics(response.data);
      }
    } catch (error) {
      console.error('Error loading statistics:', error);
    } finally {
      setStatisticsLoading(false);
    }
  }, [getOrganizationStatistics]);

  // Load statistics on component mount
  React.useEffect(() => {
    loadStatistics();
  }, [loadStatistics]);

  // Handle create organization
  const handleCreateOrganization = useCallback(async (organizationData) => {
    try {
      const result = await createOrganization(organizationData);
      if (result.success) {
        setShowCreateDialog(false);
        await loadStatistics(); // Reload statistics
      }
      return result;
    } catch (error) {
      console.error('Error creating organization:', error);
      return { success: false, error: error.message };
    }
  }, [createOrganization, loadStatistics]);

  // Handle edit organization
  const handleEditOrganization = useCallback(async (id, organizationData) => {
    try {
      const result = await updateOrganization(id, organizationData);
      if (result.success) {
        setShowEditDialog(false);
        setSelectedOrganization(null);
        await loadStatistics(); // Reload statistics
      }
      return result;
    } catch (error) {
      console.error('Error updating organization:', error);
      return { success: false, error: error.message };
    }
  }, [updateOrganization, loadStatistics]);

  // Handle delete organization
  const handleDeleteOrganization = useCallback(async (id) => {
    try {
      const result = await deleteOrganization(id);
      if (result.success) {
        await loadStatistics(); // Reload statistics
      }
      return result;
    } catch (error) {
      console.error('Error deleting organization:', error);
      return { success: false, error: error.message };
    }
  }, [deleteOrganization, loadStatistics]);

  // Handle view details
  const handleViewDetails = useCallback(async (id) => {
    try {
      const response = await getOrganizationById(id);
      if (response.success) {
        setSelectedOrganization(response.data);
        setShowDetailsModal(true);
      }
    } catch (error) {
      console.error('Error fetching organization details:', error);
    }
  }, [getOrganizationById]);

  // Handle edit
  const handleEdit = useCallback(async (id) => {
    try {
      const response = await getOrganizationById(id);
      if (response.success) {
        setSelectedOrganization(response.data);
        setShowEditDialog(true);
      }
    } catch (error) {
      console.error('Error fetching organization for edit:', error);
    }
  }, [getOrganizationById]);

  // Handle refresh
  const handleRefresh = useCallback(() => {
    loadOrganizations(true);
    loadStatistics();
  }, [loadOrganizations, loadStatistics]);

  // Statistics cards
  const statisticsCards = [
    {
      title: 'Total Organizations',
      value: statistics.total_organizations || 0,
      icon: Building2,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      loading: statisticsLoading
    },
    {
      title: 'Active Organizations',
      value: statistics.active_organizations || 0,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      loading: statisticsLoading
    },
    {
      title: 'Trial Organizations',
      value: statistics.trial_organizations || 0,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      loading: statisticsLoading
    },
    {
      title: 'Suspended Organizations',
      value: statistics.inactive_organizations || 0,
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      loading: statisticsLoading
    }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Organizations</h1>
          <p className="text-gray-600 mt-1">
            Manajemen semua klien/tenant yang terdaftar di platform
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Select value={viewMode} onValueChange={setViewMode}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="table">Table View</SelectItem>
              <SelectItem value="analytics">Analytics</SelectItem>
              <SelectItem value="quick-actions">Quick Actions</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleRefresh} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Organization
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statisticsCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{card.title}</p>
                    {card.loading ? (
                      <Skeleton className="h-8 w-16 mt-2" />
                    ) : (
                      <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
                    )}
                  </div>
                  <div className={`h-12 w-12 ${card.bgColor} rounded-lg flex items-center justify-center`}>
                    <Icon className={`h-6 w-6 ${card.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Conditional Content Based on View Mode */}
      {viewMode === 'table' && (
        <ClientManagementTable />
      )}

      {viewMode === 'analytics' && (
        <OrganizationAnalytics
          statistics={statistics}
          loading={statisticsLoading}
          onRefresh={handleRefresh}
        />
      )}

      {viewMode === 'quick-actions' && (
        <OrganizationQuickActions
          statistics={statistics}
          onRefresh={handleRefresh}
          onCreateNew={() => setShowCreateDialog(true)}
          onExport={() => console.log('Export functionality not implemented yet')}
          onImport={() => console.log('Import functionality not implemented yet')}
          loading={loading}
        />
      )}

      {/* Create Organization Dialog */}
      <CreateOrganizationDialog
        isOpen={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onSubmit={handleCreateOrganization}
        loading={loading}
      />

      {/* Edit Organization Dialog */}
      <EditOrganizationDialog
        isOpen={showEditDialog}
        onClose={() => {
          setShowEditDialog(false);
          setSelectedOrganization(null);
        }}
        onSubmit={handleEditOrganization}
        organization={selectedOrganization}
        loading={loading}
      />

      {/* Organization Details Modal */}
      <OrganizationDetailsModal
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedOrganization(null);
        }}
        organization={selectedOrganization}
        onEdit={handleEdit}
        onDelete={handleDeleteOrganization}
      />
    </div>
  );
};

export default OrganizationsPage;
