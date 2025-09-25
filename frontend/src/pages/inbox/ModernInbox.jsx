/**
 * Modern AI-Human Hybrid Inbox Page
 * Advanced inbox management with AI assistance and human agent collaboration
 */

import { useState, useCallback, useEffect } from 'react';
import { useModernInbox } from '@/hooks/useModernInbox';

// Components
import ModernInboxDashboard from '@/components/modern-inbox/ModernInboxDashboard';

// UI Components
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Button
} from '@/components/ui';

// Icons
import {
  Brain,
  BarChart3,
  RefreshCw
} from 'lucide-react';

const ModernInboxPage = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);

  // Use the existing modern inbox hook
  const {
    loadDashboard,
    loading: modernInboxLoading
  } = useModernInbox();

  // Handle tab change
  const handleTabChange = useCallback((value) => {
    setActiveTab(value);
  }, []);

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    try {
      setLoading(true);
      await loadDashboard();
    } catch (error) {
      // Handle error silently
    } finally {
      setLoading(false);
    }
  }, [loadDashboard]);

  // Load data on mount
  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  if (loading || modernInboxLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Brain className="h-8 w-8 text-primary" />
            Modern AI-Human Hybrid Inbox
          </h1>
          <p className="text-muted-foreground">
            Advanced conversation management with AI assistance and human agent collaboration
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={loading}
            aria-label="Refresh modern inbox"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Main Tab Interface */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-1">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Dashboard
          </TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="mt-6">
          <ModernInboxDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ModernInboxPage;
