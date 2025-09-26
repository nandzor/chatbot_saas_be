import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  MoreVertical,
  MessageCircle,
  Clock,
  CheckCircle,
  AlertCircle,
  User,
  Bot,
  Phone,
  Mail
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

const ProfessionalConversationList = ({
  conversations = [],
  onSelectConversation,
  selectedConversationId,
  loading = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [filteredConversations, setFilteredConversations] = useState(conversations);

  // Filter conversations based on search and filters
  useEffect(() => {
    let filtered = conversations;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(conv =>
        conv.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        conv.customer?.phone?.includes(searchTerm) ||
        conv.last_message?.content?.text?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(conv => {
        switch (statusFilter) {
          case 'active':
            return conv.session_info?.is_active;
          case 'resolved':
            return conv.session_info?.is_resolved;
          case 'unassigned':
            return !conv.agent;
          case 'assigned':
            return conv.agent;
          default:
            return true;
        }
      });
    }

    // Priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(conv =>
        conv.classification?.priority === priorityFilter
      );
    }

    setFilteredConversations(filtered);
  }, [conversations, searchTerm, statusFilter, priorityFilter]);

  // Get priority color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'normal':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'low':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Get status icon
  const getStatusIcon = (conversation) => {
    if (conversation.session_info?.is_resolved) {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
    if (conversation.session_info?.is_active) {
      return <MessageCircle className="w-4 h-4 text-blue-500" />;
    }
    return <Clock className="w-4 h-4 text-gray-400" />;
  };

  // Get agent type icon
  const getAgentTypeIcon = (conversation) => {
    if (conversation.agent) {
      return <User className="w-3 h-3" />;
    }
    if (conversation.session_info?.is_bot_session) {
      return <Bot className="w-3 h-3" />;
    }
    return null;
  };

  // Format last message time
  const formatLastMessageTime = (timestamp) => {
    if (!timestamp) return '';

    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  // Get unread count
  const getUnreadCount = (conversation) => {
    // This would come from your conversation data
    return conversation.unread_count || 0;
  };

  // Get customer avatar
  const getCustomerAvatar = (conversation) => {
    return conversation.customer?.avatar_url || '/images/default-customer-avatar.png';
  };

  // Get customer name
  const getCustomerName = (conversation) => {
    return conversation.customer?.name || 'Unknown Customer';
  };

  // Get customer contact info
  const getCustomerContact = (conversation) => {
    const phone = conversation.customer?.phone;
    const email = conversation.customer?.email;

    if (phone && email) {
      return `${phone} • ${email}`;
    } else if (phone) {
      return phone;
    } else if (email) {
      return email;
    }
    return 'No contact info';
  };

  return (
    <div className="flex flex-col h-full bg-white border-r">
      {/* Header */}
      <div className="p-4 border-b bg-gray-50">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Conversations</h2>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm">
              <Filter className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filters */}
        <div className="flex space-x-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="unassigned">Unassigned</SelectItem>
              <SelectItem value="assigned">Assigned</SelectItem>
            </SelectContent>
          </Select>

          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priority</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Conversations List */}
      <ScrollArea className="flex-1">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-gray-500">
            <MessageCircle className="w-8 h-8 mb-2" />
            <p>No conversations found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredConversations.map((conversation) => (
              <div
                key={conversation.id}
                className={cn(
                  "p-4 hover:bg-gray-50 cursor-pointer transition-colors",
                  selectedConversationId === conversation.id && "bg-blue-50 border-r-2 border-blue-500"
                )}
                onClick={() => onSelectConversation(conversation)}
              >
                <div className="flex items-start space-x-3">
                  {/* Avatar */}
                  <div className="relative">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={getCustomerAvatar(conversation)} />
                      <AvatarFallback>
                        {getCustomerName(conversation).charAt(0)}
                      </AvatarFallback>
                    </Avatar>

                    {/* Status indicator */}
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center">
                      {getStatusIcon(conversation)}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-medium text-gray-900 truncate">
                        {getCustomerName(conversation)}
                      </h3>
                      <div className="flex items-center space-x-2">
                        {conversation.classification?.priority && (
                          <Badge
                            variant="outline"
                            className={cn("text-xs", getPriorityColor(conversation.classification.priority))}
                          >
                            {conversation.classification.priority}
                          </Badge>
                        )}
                        <span className="text-xs text-gray-500">
                          {formatLastMessageTime(conversation.last_message?.created_at)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 mb-2">
                      <div className="flex items-center space-x-1 text-xs text-gray-500">
                        {getAgentTypeIcon(conversation)}
                        <span>
                          {conversation.agent?.name ||
                           (conversation.session_info?.is_bot_session ? 'Bot' : 'Unassigned')}
                        </span>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 truncate mb-2">
                      {conversation.last_message?.content?.text || 'No messages yet'}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Phone className="w-3 h-3" />
                          <span>{conversation.customer?.phone || 'No phone'}</span>
                        </div>
                        {conversation.customer?.email && (
                          <div className="flex items-center space-x-1">
                            <Mail className="w-3 h-3" />
                            <span>{conversation.customer.email}</span>
                          </div>
                        )}
                      </div>

                      {getUnreadCount(conversation) > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          {getUnreadCount(conversation)}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>View Details</DropdownMenuItem>
                      <DropdownMenuItem>Assign to Me</DropdownMenuItem>
                      <DropdownMenuItem>Transfer</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>Resolve</DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">Close</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default ProfessionalConversationList;
