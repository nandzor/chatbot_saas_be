import React, { useState, useCallback, useMemo, useRef } from 'react';
import {
  Building2,
  Plus,
  Download,
  Upload,
  RefreshCw,
  BarChart3,
  Users,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle
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
import { useOrganizationManagement } from '@/hooks/useOrganizationManagement';
import OrganizationList from '@/components/organization/OrganizationList';
import CreateOrganizationDialog from '@/components/organization/CreateOrganizationDialog';
import EditOrganizationDialog from '@/components/organization/EditOrganizationDialog';
import OrganizationDetailsModal from '@/components/organization/OrganizationDetailsModal';
import OrganizationQuickActions from '@/components/organization/OrganizationQuickActions';
import OrganizationAnalytics from '@/components/organization/OrganizationAnalytics';

// Constants
const INITIAL_STATISTICS = {
  totalOrganizations: 0,
  activeOrganizations: 0,
  inactiveOrganizations: 0,
  trialOrganizations: 0,
  expiredTrialOrganizations: 0,
  organizationsWithUsers: 0,
  organizationsWithoutUsers: 0
};

const OrganizationManagement = () => {
  // State for dialogs and modals
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedOrganization, setSelectedOrganization] = useState(null);

  // State for view modes
  const [viewMode, setViewMode] = useState('list'); // 'list', 'analytics', 'quick-actions'

  // State for statistics
  const [statistics, setStatistics] = useState(INITIAL_STATISTICS);
  const [statisticsLoading, setStatisticsLoading] = useState(true);
  const statisticsLoaded = useRef(false);
  const statisticsLoadingRef = useRef(false);

  // Use organization management hook
  const {
    organizations,
    loading,
    error,
    pagination,
    filters,
    loadOrganizations,
    createOrganization,
    updateOrganization,
    deleteOrganization,
    getOrganizationById,
    getOrganizationStatistics,
    updateFilters,
    updatePagination,
    resetFilters
  } = useOrganizationManagement();

  // Load statistics
  const loadStatistics = useCallback(async () => {
    if (statisticsLoadingRef.current || statisticsLoaded.current) {
      console.log('🔍 Statistics: Skipping load - already loaded or loading');
      return;
    }

    statisticsLoadingRef.current = true;
    setStatisticsLoading(true);

    try {
      console.log('🔍 Statistics: Loading organization statistics...');
      const response = await getOrganizationStatistics();

      if (response.success) {
        console.log('🔍 Statistics: Statistics loaded successfully:', response.data);
        setStatistics(response.data);
        statisticsLoaded.current = true;
      } else {
        console.error('❌ Statistics: Failed to load statistics:', response.error);
      }
    } catch (error) {
      console.error('❌ Statistics: Error loading statistics:', error);
    } finally {
      statisticsLoadingRef.current = false;
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
        // Reload statistics
        statisticsLoaded.current = false;
        loadStatistics();
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
        // Reload statistics
        statisticsLoaded.current = false;
        loadStatistics();
      }
      return result;
    } catch (error) {
      console.error('Error updating organization:', error);
      return { success: false, error: error.message };
    }
  }, [updateOrganization, loadStatistics]);

  // Handle delete organization
  const handleDeleteOrganization = useCallback(async (organization) => {
    if (window.confirm(`Are you sure you want to delete "${organization.name}"? This action cannot be undone.`)) {
      try {
        const result = await deleteOrganization(organization.id);
        if (result.success) {
          // Reload statistics
          statisticsLoaded.current = false;
          loadStatistics();
        }
        return result;
      } catch (error) {
        console.error('Error deleting organization:', error);
        return { success: false, error: error.message };
      }
    }
    return { success: false, cancelled: true };
  }, [deleteOrganization, loadStatistics]);

  // Handle view details
  const handleViewDetails = useCallback(async (organization) => {
    try {
      // Fetch full organization details
      const result = await getOrganizationById(organization.id);
      if (result.success) {
        setSelectedOrganization(result.data);
        setShowDetailsModal(true);
      }
    } catch (error) {
      console.error('Error fetching organization details:', error);
    }
  }, [getOrganizationById]);

  // Handle edit
  const handleEdit = useCallback((organization) => {
    setSelectedOrganization(organization);
    setShowEditDialog(true);
  }, []);

  // Handle add user (placeholder)
  const handleAddUser = useCallback((organization) => {
    console.log('Add user to organization:', organization);
    // TODO: Implement add user functionality
  }, []);

  // Handle remove user (placeholder)
  const handleRemoveUser = useCallback((organization, user) => {
    console.log('Remove user from organization:', organization, user);
    // TODO: Implement remove user functionality
  }, []);

  // Handle update subscription (placeholder)
  const handleUpdateSubscription = useCallback((organization) => {
    console.log('Update subscription for organization:', organization);
    // TODO: Implement update subscription functionality
  }, []);

  // Handle refresh
  const handleRefresh = useCallback(() => {
    loadOrganizations(true);
    statisticsLoaded.current = false;
    loadStatistics();
  }, [loadOrganizations, loadStatistics]);

  // Handle quick actions
  const handleQuickAction = useCallback((action) => {
    switch (action) {
      case 'create':
        setShowCreateDialog(true);
        break;
      case 'refresh':
        handleRefresh();
        break;
      case 'export':
        // TODO: Implement export functionality
        console.log('Export functionality not implemented yet');
        break;
      case 'import':
        // TODO: Implement import functionality
        console.log('Import functionality not implemented yet');
        break;
      default:
        break;
    }
  }, [handleRefresh]);

  // Statistics cards
  const statisticsCards = useMemo(() => [
    {
      title: 'Total Organizations',
      value: statistics.totalOrganizations,
      icon: Building2,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      loading: statisticsLoading
    },
    {
      title: 'Active Organizations',
      value: statistics.activeOrganizations,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      loading: statisticsLoading
    },
    {
      title: 'Trial Organizations',
      value: statistics.trialOrganizations,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      loading: statisticsLoading
    },
    {
      title: 'Organizations with Users',
      value: statistics.organizationsWithUsers,
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      loading: statisticsLoading
    }
  ], [statistics, statisticsLoading]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Organization Management</h1>
          <p className="text-gray-600 mt-1">
            Manage organizations, subscriptions, and user access
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Select value={viewMode} onValueChange={setViewMode}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="list">List View</SelectItem>
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

      {/* Business Type Distribution */}
      {statistics.businessTypeStats && Object.keys(statistics.businessTypeStats).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Business Type Distribution</span>
            </CardTitle>
            <CardDescription>
              Distribution of organizations by business type
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {Object.entries(statistics.businessTypeStats).map(([type, count]) => (
                <div key={type} className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{count}</div>
                  <div className="text-sm text-gray-600 capitalize">
                    {type.replace('_', ' ')}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Industry Distribution */}
      {statistics.industryStats && Object.keys(statistics.industryStats).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Industry Distribution</span>
            </CardTitle>
            <CardDescription>
              Distribution of organizations by industry
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {Object.entries(statistics.industryStats).map(([industry, count]) => (
                <div key={industry} className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{count}</div>
                  <div className="text-sm text-gray-600 capitalize">{industry}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Organizations List */}
      {/* Conditional Content Based on View Mode */}
      {viewMode === 'list' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Building2 className="h-5 w-5" />
              <span>Organizations</span>
            </CardTitle>
            <CardDescription>
              Manage and monitor all organizations in the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <OrganizationList
              organizations={organizations}
              loading={loading}
              pagination={pagination}
              filters={filters}
              onFiltersChange={updateFilters}
              onPaginationChange={updatePagination}
              onViewDetails={handleViewDetails}
              onEdit={handleEdit}
              onDelete={handleDeleteOrganization}
              onAddUser={handleAddUser}
              onRemoveUser={handleRemoveUser}
              onUpdateSubscription={handleUpdateSubscription}
              showActions={true}
            />
          </CardContent>
        </Card>
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
          onExport={() => handleQuickAction('export')}
          onImport={() => handleQuickAction('import')}
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
        onAddUser={handleAddUser}
        onRemoveUser={handleRemoveUser}
        onUpdateSubscription={handleUpdateSubscription}
        loading={loading}
      />
    </div>
  );
};

export default OrganizationManagement;
