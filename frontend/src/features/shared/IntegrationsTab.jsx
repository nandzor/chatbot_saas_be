import React, { useState } from 'react';
import { 
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Button
} from '@/components/ui';
import { Search, Filter, X } from 'lucide-react';
import IntegrationCard from './IntegrationCard';
import { integrationsData } from '@/data/sampleData';

const IntegrationsTab = ({ 
  integrationsState, 
  selectedCategory, 
  setSelectedCategory,
  searchQuery, 
  setSearchQuery,
  handleConfigureIntegration,
  handleToggleIntegrationStatus 
}) => {
  // Filter integrations based on category and search
  const filteredIntegrations = integrationsState.filter(integration => {
    const categoryMatch = selectedCategory === 'all' || integration.category === selectedCategory;
    const searchMatch = searchQuery === '' ||
      integration.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      integration.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      integration.features.some(feature => feature.toLowerCase().includes(searchQuery.toLowerCase()));
    return categoryMatch && searchMatch;
  });

  // Group integrations by category
  const integrationsByCategory = integrationsState.reduce((acc, integration) => {
    if (!acc[integration.category]) {
      acc[integration.category] = [];
    }
    acc[integration.category].push(integration);
    return acc;
  }, {});

  // Category names mapping
  const categoryNames = {
    productivity: 'Productivity',
    communication: 'Communication', 
    shipping: 'Shipping',
    notification: 'Notification',
    security: 'Security',
    automation: 'Automation',
    crm: 'CRM',
    payment: 'Payment',
    location: 'Location',
    marketing: 'Marketing',
    analytics: 'Analytics',
    feedback: 'Feedback',
    inventory: 'Inventory',
    ai: 'AI',
    utility: 'Utility'
  };

  // Statistics
  const activeCount = integrationsState.filter(i => i.status === 'active').length;
  const inactiveCount = integrationsState.filter(i => i.status === 'inactive').length;
  const categoriesCount = Object.keys(integrationsByCategory).length;
  const configuredCount = integrationsState.filter(i => i.config && Object.keys(i.config).length > 0).length;

  const clearFilters = () => {
    setSelectedCategory('all');
    setSearchQuery('');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold mb-2">Connected Apps</h3>
          <p className="text-muted-foreground">
            Connect your chatbot with third-party applications to extend its functionality.
          </p>
        </div>
        
        {/* Filters */}
        <div className="flex gap-3">
          <div className="relative w-64">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search integrations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="w-64">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories ({integrationsState.length})</SelectItem>
                {Object.entries(integrationsByCategory).map(([category, integrations]) => (
                  <SelectItem key={category} value={category}>
                    {categoryNames[category]} ({integrations.length})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-2xl font-bold text-green-700">{activeCount}</span>
          </div>
          <p className="text-sm text-green-600 mt-1">Active</p>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
            <span className="text-2xl font-bold text-gray-700">{inactiveCount}</span>
          </div>
          <p className="text-sm text-gray-600 mt-1">Inactive</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-blue-500" />
            <span className="text-2xl font-bold text-blue-700">{categoriesCount}</span>
          </div>
          <p className="text-sm text-blue-600 mt-1">Categories</p>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <span className="text-2xl font-bold text-purple-700">{configuredCount}</span>
          </div>
          <p className="text-sm text-purple-600 mt-1">Configured</p>
        </div>
      </div>

      {/* Quick Filters */}
      <div className="flex flex-wrap gap-2">
        <Button 
          variant={selectedCategory === 'all' ? 'default' : 'outline'} 
          size="sm"
          onClick={() => setSelectedCategory('all')}
        >
          All ({integrationsState.length})
        </Button>
        <Button 
          variant={selectedCategory === 'communication' ? 'default' : 'outline'} 
          size="sm"
          onClick={() => setSelectedCategory('communication')}
        >
          Communication ({integrationsByCategory.communication?.length || 0})
        </Button>
        <Button 
          variant={selectedCategory === 'payment' ? 'default' : 'outline'} 
          size="sm"
          onClick={() => setSelectedCategory('payment')}
        >
          Payment ({integrationsByCategory.payment?.length || 0})
        </Button>
        <Button 
          variant={selectedCategory === 'automation' ? 'default' : 'outline'} 
          size="sm"
          onClick={() => setSelectedCategory('automation')}
        >
          Automation ({integrationsByCategory.automation?.length || 0})
        </Button>
        <Button 
          variant={selectedCategory === 'productivity' ? 'default' : 'outline'} 
          size="sm"
          onClick={() => setSelectedCategory('productivity')}
        >
          Productivity ({integrationsByCategory.productivity?.length || 0})
        </Button>
      </div>

      {/* Results Info */}
      <div className="flex items-center justify-between py-2 border-t border-b bg-muted/30 px-4 rounded">
        <div className="text-sm text-muted-foreground">
          {selectedCategory === 'all' && searchQuery === '' ? (
            `Showing all ${integrationsState.length} integrations`
          ) : (
            <>
              Showing {filteredIntegrations.length} of {integrationsState.length} integrations
              {selectedCategory !== 'all' && (
                <span className="ml-1">in {categoryNames[selectedCategory]}</span>
              )}
              {searchQuery && (
                <span className="ml-1">matching "{searchQuery}"</span>
              )}
            </>
          )}
        </div>
        {(selectedCategory !== 'all' || searchQuery !== '') && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="h-auto p-1">
            <X className="w-3 h-3 mr-1" />
            Clear filters
          </Button>
        )}
      </div>

      {/* Integration Grid */}
      {filteredIntegrations.length > 0 ? (
        selectedCategory !== 'all' ? (
          // Show category header only when specific category is selected
          <div className="space-y-4">
            <h4 className="text-lg font-semibold flex items-center gap-2">
              {categoryNames[selectedCategory]}
              <span className="text-sm font-normal text-muted-foreground">
                ({filteredIntegrations.length})
              </span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredIntegrations.map((integration) => (
                <IntegrationCard
                  key={integration.id}
                  integration={integration}
                  onConfigure={handleConfigureIntegration}
                  onToggleStatus={handleToggleIntegrationStatus}
                />
              ))}
            </div>
          </div>
        ) : (
          // Flat grid for "All" - no category headers, just all cards mixed together
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredIntegrations.map((integration) => (
              <IntegrationCard
                key={integration.id}
                integration={integration}
                onConfigure={handleConfigureIntegration}
                onToggleStatus={handleToggleIntegrationStatus}
              />
            ))}
          </div>
        )
      ) : (
        // No results
        <div className="text-center py-12 bg-muted/30 rounded-lg">
          <Filter className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h4 className="text-lg font-semibold mb-2">No integrations found</h4>
          <p className="text-muted-foreground mb-4">
            Try adjusting your search terms or category filter.
          </p>
          <Button variant="outline" onClick={clearFilters}>
            Clear all filters
          </Button>
        </div>
      )}
    </div>
  );
};

export default IntegrationsTab;
