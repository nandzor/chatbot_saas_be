import React from 'react';
import ClientManagementTable from '@/features/superadmin/ClientManagementTable';

const ClientManagement = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Client Management</h1>
        <p className="text-gray-600">Pusat komando untuk semua hal yang berkaitan dengan klien/tenant</p>
      </div>
      
      <ClientManagementTable />
    </div>
  );
};

export default ClientManagement;
