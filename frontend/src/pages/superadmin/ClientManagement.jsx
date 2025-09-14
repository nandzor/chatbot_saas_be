import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import {
  Button,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui';
import ClientManagementDashboard from '@/components/client/ClientManagementDashboard';
import OrganizationList from '@/components/organization/OrganizationList';
import ClientAnalytics from '@/components/client/ClientAnalytics';
import ClientSettings from '@/components/client/ClientSettings';
import CreateOrganizationDialog from '@/components/organization/CreateOrganizationDialog';
import EditOrganizationDialog from '@/components/organization/EditOrganizationDialog';
import OrganizationDetailsModal from '@/components/organization/OrganizationDetailsModal';
import OrganizationUsersDialog from '@/components/organization/OrganizationUsersDialog';
import { useOrganizationManagement } from '@/hooks/useOrganizationManagement';

const ClientManagement = () => {
  const [activeTab, setActiveTab] = useState('overview');

  // Dialog state management
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showUsersDialog, setShowUsersDialog] = useState(false);
  const [selectedOrganization, setSelectedOrganization] = useState(null);

  // Use organization management hook for data
  const {
    organizations,
    loading,
    pagination,
    filters,
    updateFilters,
    updatePagination,
    loadOrganizations,
    handleViewDetails,
    handleEdit,
    handleDeleteOrganization,
    handleAddUser,
    handleRemoveUser,
    handleCreateOrganization,
    handleUpdateOrganization,
    handleUpdateSubscription
  } = useOrganizationManagement();

  // Dialog handlers
  const handleCreateOrganizationClick = () => {
    setShowCreateDialog(true);
  };

  const handleEditOrganizationClick = (organization) => {
    setSelectedOrganization(organization);
    setShowEditDialog(true);
  };

  const handleViewDetailsClick = (organization) => {
    setSelectedOrganization(organization);
    setShowDetailsModal(true);
  };

  const handleManageUsersClick = (organization) => {
    setSelectedOrganization(organization);
    setShowUsersDialog(true);
  };

  const handleCreateOrganizationSubmit = async (data) => {
    try {
      await handleCreateOrganization(data);
      setShowCreateDialog(false);
    } catch (error) {
      console.error('Error creating organization:', error);
    }
  };

  const handleEditOrganizationSubmit = async (data) => {
    try {
      await handleUpdateOrganization(selectedOrganization.id, data);
      setShowEditDialog(false);
      setSelectedOrganization(null);
    } catch (error) {
      console.error('Error updating organization:', error);
    }
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="table">Table View</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <ClientManagementDashboard />
        </TabsContent>

        <TabsContent value="table">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Organizations</h2>
              <Button onClick={handleCreateOrganizationClick} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Organization
              </Button>
            </div>
            <OrganizationList
              organizations={organizations}
              loading={loading}
              pagination={pagination}
              filters={filters}
              onFiltersChange={updateFilters}
              onPaginationChange={updatePagination}
              onViewDetails={handleViewDetailsClick}
              onEdit={handleEditOrganizationClick}
              onDelete={handleDeleteOrganization}
              onAddUser={handleManageUsersClick}
              onRemoveUser={handleRemoveUser}
            />
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <ClientAnalytics />
        </TabsContent>

        <TabsContent value="settings">
          <ClientSettings />
        </TabsContent>
      </Tabs>

      {/* Dialog Components */}
      <CreateOrganizationDialog
        isOpen={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onSubmit={handleCreateOrganizationSubmit}
        loading={loading}
      />

      <EditOrganizationDialog
        isOpen={showEditDialog}
        onClose={() => {
          setShowEditDialog(false);
          setSelectedOrganization(null);
        }}
        onSubmit={handleEditOrganizationSubmit}
        organization={selectedOrganization}
        loading={loading}
      />

      <OrganizationDetailsModal
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedOrganization(null);
        }}
        organization={selectedOrganization}
        onEdit={handleEditOrganizationClick}
        onDelete={handleDeleteOrganization}
        onManageUsers={handleManageUsersClick}
        onUpdateSubscription={handleUpdateSubscription}
        loading={loading}
      />

      <OrganizationUsersDialog
        isOpen={showUsersDialog}
        onClose={() => {
          setShowUsersDialog(false);
          setSelectedOrganization(null);
        }}
        organization={selectedOrganization}
        onAddUser={handleAddUser}
        onRemoveUser={handleRemoveUser}
        loading={loading}
      />
    </div>
  );
};

export default ClientManagement;
