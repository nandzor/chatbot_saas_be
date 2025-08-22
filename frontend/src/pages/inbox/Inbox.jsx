import React, { useState } from 'react';
import SessionManager from '@/features/shared/SessionManager';
import InboxManagement from '@/features/shared/InboxManagement';
import { 
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui';
import { 
  MessageSquare, 
  Settings 
} from 'lucide-react';

const InboxPage = () => {
  const [activeTab, setActiveTab] = useState('session-manager');

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inbox</h1>
          <p className="text-gray-600">Kelola session chat dan konfigurasi inbox</p>
        </div>
      </div>

      {/* Tab Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="session-manager" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Session Manager
          </TabsTrigger>
          <TabsTrigger value="inbox-management" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Inbox Management
          </TabsTrigger>
        </TabsList>

        {/* Session Manager Tab */}
        <TabsContent value="session-manager" className="mt-6">
          <SessionManager />
        </TabsContent>

        {/* Inbox Management Tab */}
        <TabsContent value="inbox-management" className="mt-6">
          <InboxManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InboxPage;
