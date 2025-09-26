import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  MessageCircle,
  Clock,
  User,
  Bot,
  AlertCircle,
  CheckCircle,
  MoreVertical,
  Filter,
  RefreshCw
} from 'lucide-react';
import {
  Card,
  CardContent,
  Input,
  Button,
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  ScrollArea,
  Separator,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui';
import { inboxService } from '@/services/InboxService';
import { useApi } from '@/hooks/useApi';
import { handleError } from '@/utils/errorHandler';

const ConversationList = ({
  selectedConversation,
  onSelectConversation,
  onRefresh,
  className = ""
}) => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [stats, setStats] = useState({});

  const { data: conversationsData, loading: conversationsLoading, error: conversationsError, refetch: refetchConversations } = useApi(
    () => inboxService.getActiveSessions({
      filters: {
        status: filterStatus === 'all' ? null : filterStatus,
        search: searchTerm || null
      }
    }),
    [filterStatus, searchTerm]
  );

  const { data: statsData } = useApi(() => inboxService.getStatistics());

  useEffect(() => {
    if (conversationsData?.success) {
      setConversations(conversationsData.data?.data || []);
    }
  }, [conversationsData]);

  useEffect(() => {
    if (statsData?.success) {
      setStats(statsData.data || {});
    }
  }, [statsData]);

  const handleConversationSelect = useCallback((conversation) => {
    onSelectConversation(conversation);
  }, [onSelectConversation]);

  const handleRefresh = useCallback(() => {
    refetchConversations();
    onRefresh?.();
  }, [refetchConversations, onRefresh]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <MessageCircle className="h-4 w-4 text-green-500" />;
      case 'bot_handled':
        return <Bot className="h-4 w-4 text-blue-500" />;
      case 'agent_handled':
        return <User className="h-4 w-4 text-purple-500" />;
      case 'resolved':
        return <CheckCircle className="h-4 w-4 text-gray-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'bot_handled':
        return 'bg-blue-100 text-blue-800';
      case 'agent_handled':
        return 'bg-purple-100 text-purple-800';
      case 'resolved':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  const truncateText = (text, maxLength = 50) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  if (conversationsLoading) {
    return (
      <Card className={`h-full ${className}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-center h-32">
            <RefreshCw className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading conversations...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (conversationsError) {
    return (
      <Card className={`h-full ${className}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-center h-32 text-red-500">
            <AlertCircle className="h-6 w-6" />
            <span className="ml-2">Failed to load conversations</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`h-full flex flex-col ${className}`}>
      <CardContent className="p-0 flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Conversations</h2>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                disabled={conversationsLoading}
              >
                <RefreshCw className={`h-4 w-4 ${conversationsLoading ? 'animate-spin' : ''}`} />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={handleRefresh}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="text-center">
              <div className="text-lg font-semibold text-green-600">
                {stats.active_sessions || 0}
              </div>
              <div className="text-xs text-gray-500">Active</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-blue-600">
                {stats.pending_sessions || 0}
              </div>
              <div className="text-xs text-gray-500">Pending</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-600">
                {stats.resolved_sessions || 0}
              </div>
              <div className="text-xs text-gray-500">Resolved</div>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  <span>
                    {filterStatus === 'all' ? 'All Conversations' :
                     filterStatus === 'active' ? 'Active' :
                     filterStatus === 'bot_handled' ? 'Bot Handled' :
                     filterStatus === 'agent_handled' ? 'Agent Handled' :
                     filterStatus === 'resolved' ? 'Resolved' : 'All Conversations'}
                  </span>
                  <Filter className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-full">
                <DropdownMenuItem onClick={() => setFilterStatus('all')}>
                  All Conversations
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus('active')}>
                  Active
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus('bot_handled')}>
                  Bot Handled
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus('agent_handled')}>
                  Agent Handled
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus('resolved')}>
                  Resolved
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Conversations List */}
        <ScrollArea className="flex-1">
          <div className="p-2">
            {conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-gray-500">
                <MessageCircle className="h-8 w-8 mb-2" />
                <p>No conversations found</p>
              </div>
            ) : (
              conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={`p-3 rounded-lg cursor-pointer transition-colors mb-2 ${
                    selectedConversation?.id === conversation.id
                      ? 'bg-blue-50 border border-blue-200'
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => handleConversationSelect(conversation)}
                >
                  <div className="flex items-start space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={conversation.customer?.avatar_url} />
                      <AvatarFallback>
                        {conversation.customer?.name?.charAt(0) || 'C'}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-medium text-sm truncate">
                          {conversation.customer?.name || 'Unknown Customer'}
                        </h3>
                        <div className="flex items-center space-x-1">
                          {conversation.unread_count > 0 && (
                            <Badge variant="destructive" className="h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                              {conversation.unread_count}
                            </Badge>
                          )}
                          <span className="text-xs text-gray-500">
                            {formatTime(conversation.last_activity_at)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center space-x-2">
                          <Badge className={`text-xs ${getStatusColor(conversation.status)}`}>
                            {getStatusIcon(conversation.status)}
                            <span className="ml-1 capitalize">{conversation.status}</span>
                          </Badge>
                          {conversation.priority && conversation.priority !== 'normal' && (
                            <Badge className={`text-xs ${getPriorityColor(conversation.priority)}`}>
                              {conversation.priority}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center space-x-1">
                          {conversation.customer?.channel && (
                            <Badge variant="outline" className="text-xs">
                              {conversation.customer.channel}
                            </Badge>
                          )}
                        </div>
                      </div>

                      {conversation.last_message && (
                        <p className="text-sm text-gray-600 truncate">
                          <span className="font-medium">
                            {conversation.last_message.sender_type === 'customer' ? '' :
                             conversation.last_message.sender_type === 'agent' ? 'You: ' : 'Bot: '}
                          </span>
                          {truncateText(conversation.last_message.text)}
                        </p>
                      )}

                      {conversation.agent && (
                        <p className="text-xs text-gray-500 mt-1">
                          Agent: {conversation.agent.name}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default ConversationList;
