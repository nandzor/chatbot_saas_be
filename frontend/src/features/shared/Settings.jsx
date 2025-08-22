import React, { useState } from 'react';
import { 
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui';
// Icons tidak diperlukan di Settings.jsx karena sudah dipindah ke komponen masing-masing
import { agentsData, integrationsData } from '@/data/sampleData';
import IntegrationCard from './IntegrationCard';
import IntegrationModal from './IntegrationModal';
import ChannelsTab from './ChannelsTab';
import IntegrationsTab from './IntegrationsTab';
import BillingTab from './BillingTab';
import DeveloperTab from './DeveloperTab';
import BotPersonalitiesTab from './BotPersonalitiesTab';
import TeamTab from './TeamTab';
import SecurityTab from './SecurityTab';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('channels');
  const [showApiKey, setShowApiKey] = useState(false);
  const [editingAgent, setEditingAgent] = useState(null);
  const [integrationsState, setIntegrationsState] = useState(integrationsData);
  const [selectedIntegration, setSelectedIntegration] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Sample data hanya untuk channels (data lain sudah dipindah ke komponen masing-masing)
  const channels = [
    { id: 1, name: 'Website Chat', type: 'Web Widget', status: 'Aktif', lastUsed: '2 menit lalu' },
    { id: 2, name: 'WhatsApp Business', type: 'WhatsApp', status: 'Aktif', lastUsed: '5 menit lalu' },
    { id: 3, name: 'Facebook Messenger', type: 'Facebook', status: 'Nonaktif', lastUsed: '2 jam lalu' },
  ];

  // Integration handlers
  const handleConfigureIntegration = (integration) => {
    setSelectedIntegration(integration);
    setIsModalOpen(true);
  };

  const handleSaveIntegrationConfig = (config) => {
    if (selectedIntegration) {
      setIntegrationsState(prev => 
        prev.map(integration => 
          integration.id === selectedIntegration.id 
            ? { ...integration, config }
            : integration
        )
      );
    }
    setIsModalOpen(false);
    setSelectedIntegration(null);
  };

  const handleToggleIntegrationStatus = (integrationId) => {
    setIntegrationsState(prev => 
      prev.map(integration => 
        integration.id === integrationId 
          ? { ...integration, status: integration.status === 'active' ? 'inactive' : 'active' }
          : integration
      )
    );
  };

  const updateAgentPersonality = (agentId, personalityId) => {
    // Update agent personality logic here
    console.log('Updating agent', agentId, 'with personality', personalityId);
    setEditingAgent(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Pengaturan</h2>
          <p className="text-muted-foreground">Konfigurasi teknis dan administratif untuk organisasi</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="overflow-x-auto scrollbar-hide mb-6">
            <TabsList className="inline-flex h-10 min-w-full lg:grid lg:grid-cols-7 lg:h-10">
              <TabsTrigger value="channels" className="text-xs lg:text-sm whitespace-nowrap px-3 lg:px-4">Channels</TabsTrigger>
              <TabsTrigger value="bot-personalities" className="text-xs lg:text-sm whitespace-nowrap px-3 lg:px-4">Bot Personalities</TabsTrigger>
              <TabsTrigger value="integrations" className="text-xs lg:text-sm whitespace-nowrap px-3 lg:px-4">Integrations</TabsTrigger>
              <TabsTrigger value="team-management" className="text-xs lg:text-sm whitespace-nowrap px-3 lg:px-4">Team</TabsTrigger>
              <TabsTrigger value="billing" className="text-xs lg:text-sm whitespace-nowrap px-3 lg:px-4">Billing</TabsTrigger>
              <TabsTrigger value="developer" className="text-xs lg:text-sm whitespace-nowrap px-3 lg:px-4">Developer</TabsTrigger>
              <TabsTrigger value="security" className="text-xs lg:text-sm whitespace-nowrap px-3 lg:px-4">Security</TabsTrigger>
            </TabsList>
          </div>

          {/* Channels Tab */}
          <TabsContent value="channels" className="space-y-6 focus:outline-none data-[state=inactive]:hidden">
            <ChannelsTab 
              channels={channels}
              showApiKey={showApiKey}
              setShowApiKey={setShowApiKey}
            />
          </TabsContent>

          {/* Bot Personalities Tab */}
          <TabsContent value="bot-personalities" className="space-y-6 focus:outline-none data-[state=inactive]:hidden">
            <BotPersonalitiesTab />
          </TabsContent>

          {/* Integrations Tab */}
          <TabsContent value="integrations" className="space-y-6 focus:outline-none data-[state=inactive]:hidden">
            <IntegrationsTab
              integrationsState={integrationsState}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              handleConfigureIntegration={handleConfigureIntegration}
              handleToggleIntegrationStatus={handleToggleIntegrationStatus}
            />
          </TabsContent>

          {/* Team Management Tab */}
          <TabsContent value="team-management" className="space-y-6 focus:outline-none data-[state=inactive]:hidden">
            <TeamTab 
              editingAgent={editingAgent}
              setEditingAgent={setEditingAgent}
              updateAgentPersonality={updateAgentPersonality}
            />
          </TabsContent>

          {/* Billing Tab */}
          <TabsContent value="billing" className="space-y-6 focus:outline-none data-[state=inactive]:hidden">
            <BillingTab />
          </TabsContent>

          {/* Developer Tab */}
          <TabsContent value="developer" className="space-y-6 focus:outline-none data-[state=inactive]:hidden">
            <DeveloperTab />
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6 focus:outline-none data-[state=inactive]:hidden">
            <SecurityTab />
          </TabsContent>

        </Tabs>

        {/* Integration Configuration Modal */}
        <IntegrationModal
          integration={selectedIntegration}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedIntegration(null);
          }}
          onSave={handleSaveIntegrationConfig}
        />

        {/* Modal sudah dipindah ke TeamTab component */}
      </div>
    </div>
  );
};

export default Settings;