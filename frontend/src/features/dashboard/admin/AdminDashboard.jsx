/**
 * Admin Dashboard
 * Dashboard untuk Organization Admin
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui';
import { Button } from '@/components/ui';
import { Badge } from '@/components/ui';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui';
import {
  Users,
  Bot,
  MessageCircle,
  BarChart3,
  Settings,
  RefreshCw,
  Download,
  Plus,
  Activity,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { GenericCard, StatsCard } from '@/components/common';
import { useApi } from '@/hooks';
import { analyticsApi, userApi, chatbotApi, conversationApi } from '@/api/BaseApiService';
import { formatNumber, formatDate } from '@/utils/helpers';
import { LoadingStates, ErrorStates } from '@/components/ui';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [refreshing, setRefreshing] = useState(false);

  // API Hooks
  const { data: analytics, loading: analyticsLoading, error: analyticsError, refresh: refreshAnalytics } = useApi(
    analyticsApi.getDashboard,
    { immediate: true }
  );

  const { data: users, loading: usersLoading, error: usersError, refresh: refreshUsers } = useApi(
    userApi.getStatistics,
    { immediate: true }
  );

  const { data: chatbots, loading: chatbotsLoading, error: chatbotsError, refresh: refreshChatbots } = useApi(
    chatbotApi.getStatistics,
    { immediate: true }
  );

  const { data: conversations, loading: conversationsLoading, error: conversationsError, refresh: refreshConversations } = useApi(
    conversationApi.getStatistics,
    { immediate: true }
  );

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        refreshAnalytics(),
        refreshUsers(),
        refreshChatbots(),
        refreshConversations()
      ]);
    } finally {
      setRefreshing(false);
    }
  };

  // Handle export
  const handleExport = () => {
  };

  // Handle create chatbot
  const handleCreateChatbot = () => {
  };

  // Loading state
  if (analyticsLoading || usersLoading || chatbotsLoading || conversationsLoading) {
    return <LoadingStates.DashboardLoadingSkeleton />;
  }

  // Error state
  if (analyticsError || usersError || chatbotsError || conversationsError) {
    return (
      <ErrorStates.GenericErrorState
        title="Failed to load dashboard"
        message="An error occurred while loading the dashboard data"
        onRetry={handleRefresh}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your organization's chatbots and users
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            variant="outline"
            onClick={handleExport}
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button onClick={handleCreateChatbot}>
            <Plus className="w-4 h-4 mr-2" />
            New Chatbot
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="chatbots">Chatbots</TabsTrigger>
          <TabsTrigger value="conversations">Conversations</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard
              title="Total Users"
              value={formatNumber(users?.total_users || 0)}
              change={`+${formatNumber(users?.new_users_this_month || 0)} this month`}
              changeType="positive"
              icon={Users}
            />
            <StatsCard
              title="Active Chatbots"
              value={formatNumber(chatbots?.active_chatbots || 0)}
              change={`${formatNumber(chatbots?.total_chatbots || 0)} total`}
              changeType="neutral"
              icon={Bot}
            />
            <StatsCard
              title="Total Conversations"
              value={formatNumber(conversations?.total_conversations || 0)}
              change={`+${formatNumber(conversations?.conversations_today || 0)} today`}
              changeType="positive"
              icon={MessageCircle}
            />
            <StatsCard
              title="Response Rate"
              value={`${formatNumber(conversations?.response_rate || 0)}%`}
              change={`${formatNumber(conversations?.avg_response_time || 0)}s avg`}
              changeType="positive"
              icon={Clock}
            />
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <GenericCard
              title="Create New Chatbot"
              description="Build and deploy a new AI chatbot for your organization"
              icon={<Bot className="w-8 h-8 text-blue-500" />}
              onClick={handleCreateChatbot}
              clickable
            />
            <GenericCard
              title="View Analytics"
              description="Analyze chatbot performance and user interactions"
              icon={<BarChart3 className="w-8 h-8 text-green-500" />}
              onClick={() => setActiveTab('analytics')}
              clickable
            />
            <GenericCard
              title="Manage Users"
              description="Add, edit, and manage organization users"
              icon={<Users className="w-8 h-8 text-purple-500" />}
              onClick={() => setActiveTab('users')}
              clickable
            />
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="w-5 h-5" />
                <span>Recent Activity</span>
              </CardTitle>
              <CardDescription>
                Latest activities in your organization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics?.recent_activities?.map((activity, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 border rounded-lg">
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(activity.created_at, 'DD/MM/YYYY HH:mm')}
                      </p>
                    </div>
                    <Badge variant="outline">{activity.type}</Badge>
                  </div>
                )) || (
                  <div className="text-center py-8 text-muted-foreground">
                    No recent activity
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Chatbots Tab */}
        <TabsContent value="chatbots" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Chatbot Management</CardTitle>
              <CardDescription>
                Manage your organization's chatbots
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Chatbot management interface will be implemented here
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Conversations Tab */}
        <TabsContent value="conversations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Conversation Management</CardTitle>
              <CardDescription>
                View and manage chatbot conversations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Conversation management interface will be implemented here
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                Manage organization users and permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                User management interface will be implemented here
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Analytics</CardTitle>
              <CardDescription>
                Detailed analytics for your organization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Analytics interface will be implemented here
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Organization Settings</CardTitle>
              <CardDescription>
                Configure your organization settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Settings interface will be implemented here
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
