/**
 * Agent Dashboard
 * Dashboard untuk AI Agent/User biasa
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui';
import { Button } from '@/components/ui';
import { Badge } from '@/components/ui';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui';
import {
  MessageCircle,
  Bot,
  History,
  Settings,
  RefreshCw,
  Plus,
  Activity,
  Clock,
  CheckCircle,
  AlertCircle,
  Star,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';
import { GenericCard, StatsCard } from '@/components/common';
import { useApi } from '@/hooks';
import { chatbotApi, conversationApi } from '@/api/BaseApiService';
import { formatNumber, formatDate } from '@/utils/helpers';
import { LoadingStates, ErrorStates } from '@/components/ui';

const AgentDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [refreshing, setRefreshing] = useState(false);

  // API Hooks
  const { data: chatbots, loading: chatbotsLoading, error: chatbotsError, refresh: refreshChatbots } = useApi(
    chatbotApi.getStatistics,
    { immediate: true }
  );

  const { data: conversations, loading: conversationsLoading, error: conversationsError, refresh: refreshConversations } = useApi(
    conversationApi.getStatistics,
    { immediate: true }
  );

  const { data: myConversations, loading: myConversationsLoading, error: myConversationsError, refresh: refreshMyConversations } = useApi(
    conversationApi.getHistory,
    { immediate: true }
  );

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        refreshChatbots(),
        refreshConversations(),
        refreshMyConversations()
      ]);
    } finally {
      setRefreshing(false);
    }
  };

  // Handle start conversation
  const handleStartConversation = () => {
  };

  // Handle view chatbot
  const handleViewChatbot = (chatbotId) => {
  };

  // Loading state
  if (chatbotsLoading || conversationsLoading || myConversationsLoading) {
    return <LoadingStates.DashboardLoadingSkeleton />;
  }

  // Error state
  if (chatbotsError || conversationsError || myConversationsError) {
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
          <h1 className="text-3xl font-bold">Agent Dashboard</h1>
          <p className="text-muted-foreground">
            Interact with AI chatbots and manage conversations
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
          <Button onClick={handleStartConversation}>
            <Plus className="w-4 h-4 mr-2" />
            New Conversation
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="chatbots">Available Chatbots</TabsTrigger>
          <TabsTrigger value="conversations">My Conversations</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard
              title="Available Chatbots"
              value={formatNumber(chatbots?.available_chatbots || 0)}
              change={`${formatNumber(chatbots?.active_chatbots || 0)} active`}
              changeType="neutral"
              icon={Bot}
            />
            <StatsCard
              title="My Conversations"
              value={formatNumber(conversations?.my_conversations || 0)}
              change={`+${formatNumber(conversations?.conversations_today || 0)} today`}
              changeType="positive"
              icon={MessageCircle}
            />
            <StatsCard
              title="Total Messages"
              value={formatNumber(conversations?.total_messages || 0)}
              change={`${formatNumber(conversations?.avg_messages_per_conversation || 0)} avg per chat`}
              changeType="neutral"
              icon={Activity}
            />
            <StatsCard
              title="Response Time"
              value={`${formatNumber(conversations?.avg_response_time || 0)}s`}
              change="Average response time"
              changeType="neutral"
              icon={Clock}
            />
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <GenericCard
              title="Start New Conversation"
              description="Begin a new chat with an AI chatbot"
              icon={<MessageCircle className="w-8 h-8 text-blue-500" />}
              onClick={handleStartConversation}
              clickable
            />
            <GenericCard
              title="View My Conversations"
              description="See all your previous conversations"
              icon={<History className="w-8 h-8 text-green-500" />}
              onClick={() => setActiveTab('conversations')}
              clickable
            />
            <GenericCard
              title="Browse Chatbots"
              description="Explore available AI chatbots"
              icon={<Bot className="w-8 h-8 text-purple-500" />}
              onClick={() => setActiveTab('chatbots')}
              clickable
            />
          </div>

          {/* Recent Conversations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageCircle className="w-5 h-5" />
                <span>Recent Conversations</span>
              </CardTitle>
              <CardDescription>
                Your latest chatbot interactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {myConversations?.slice(0, 5).map((conversation, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        {conversation.chatbot_name || 'Unknown Chatbot'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {conversation.last_message || 'No messages yet'}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">
                        {conversation.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(conversation.updated_at, 'DD/MM/YYYY HH:mm')}
                      </span>
                    </div>
                  </div>
                )) || (
                  <div className="text-center py-8 text-muted-foreground">
                    No recent conversations
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
              <CardTitle>Available Chatbots</CardTitle>
              <CardDescription>
                Choose from available AI chatbots to start a conversation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {chatbots?.available_chatbots?.map((chatbot) => (
                  <GenericCard
                    key={chatbot.id}
                    title={chatbot.name}
                    description={chatbot.description}
                    icon={<Bot className="w-6 h-6 text-blue-500" />}
                    onClick={() => handleViewChatbot(chatbot.id)}
                    clickable
                    actions={[
                      {
                        icon: <MessageCircle className="w-4 h-4" />,
                        label: 'Start Chat'
                      }
                    ]}
                  />
                )) || (
                  <div className="col-span-full text-center py-8 text-muted-foreground">
                    No chatbots available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Conversations Tab */}
        <TabsContent value="conversations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>My Conversations</CardTitle>
              <CardDescription>
                Manage your chatbot conversations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Conversation management interface will be implemented here
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Conversation History</CardTitle>
              <CardDescription>
                View your complete conversation history
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                History interface will be implemented here
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Agent Settings</CardTitle>
              <CardDescription>
                Configure your agent preferences
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

export default AgentDashboard;
