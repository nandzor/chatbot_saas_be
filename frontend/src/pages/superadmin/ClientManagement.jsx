import React, { useState } from 'react';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui';
import ClientManagementDashboard from '@/components/client/ClientManagementDashboard';
import ClientManagementTable from '@/components/client/ClientManagementTable';
import ClientAnalytics from '@/components/client/ClientAnalytics';

const ClientManagement = () => {
  const [activeTab, setActiveTab] = useState('overview');

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
          <ClientManagementTable />
        </TabsContent>

        <TabsContent value="analytics">
          <ClientAnalytics />
        </TabsContent>

        <TabsContent value="settings">
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Settings</h3>
            <p className="text-gray-500">Client management settings will be available here.</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClientManagement;
