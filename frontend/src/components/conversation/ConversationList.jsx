import React, { useState, useEffect, useCallback } from 'react';
import {
  MessageSquare,
  User,
  Clock,
  Search,
  Filter,
  MoreVertical,
  Phone,
  Bot,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';
import { useConversationList } from '../../hooks/useConversation';
import ConversationSearch from './ConversationSearch';

const ConversationList = ({
  sessionIds = [],
  onConversationSelect,
  selectedSessionId,
  showSearch = true
}) => {
  const { conversations, loading, loadConversationSummaries, loadUnreadCounts } = useConversationList();
  const [unreadCounts, setUnreadCounts] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [selectedSessionForSearch, setSelectedSessionForSearch] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all'); // all, active, resolved, unread

  /**
   * Load conversation data
   */
  const loadConversations = useCallback(async () => {
    if (sessionIds.length > 0) {
      await loadConversationSummaries(sessionIds);
      const counts = await loadUnreadCounts(sessionIds);
      setUnreadCounts(counts);
    }
  }, [sessionIds, loadConversationSummaries, loadUnreadCounts]);

  /**
   * Load data on mount and when sessionIds change
   */
  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  /**
   * Filter conversations based on search and status
   */
  const filteredConversations = conversations.filter(conversation => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const customerName = conversation.customer?.name?.toLowerCase() || '';
      const customerPhone = conversation.customer?.phone?.toLowerCase() || '';
      const intent = conversation.classification?.intent?.toLowerCase() || '';

      if (!customerName.includes(query) &&
          !customerPhone.includes(query) &&
          !intent.includes(query)) {
        return false;
      }
    }

    // Status filter
    switch (filterStatus) {
      case 'active':
        return conversation.session_info?.is_active;
      case 'resolved':
        return conversation.session_info?.is_resolved;
      case 'unread':
        return (unreadCounts[conversation.session_id] || 0) > 0;
      default:
        return true;
    }
  });

  /**
   * Get conversation status
   */
  const getConversationStatus = (conversation) => {
    if (conversation.session_info?.is_resolved) {
      return { label: 'Selesai', color: 'text-green-600 bg-green-100', icon: CheckCircle };
    }
    if (conversation.session_info?.is_active) {
      return { label: 'Aktif', color: 'text-blue-600 bg-blue-100', icon: MessageSquare };
    }
    return { label: 'Tidak Aktif', color: 'text-gray-600 bg-gray-100', icon: AlertCircle };
  };

  /**
   * Get sender type icon
   */
  const getSenderIcon = (senderType) => {
    switch (senderType) {
      case 'customer':
        return <User className="w-4 h-4 text-blue-500" />;
      case 'agent':
        return <User className="w-4 h-4 text-green-500" />;
      case 'bot':
        return <Bot className="w-4 h-4 text-purple-500" />;
      default:
        return <MessageSquare className="w-4 h-4 text-gray-500" />;
    }
  };

  /**
   * Handle conversation click
   */
  const handleConversationClick = (conversation) => {
    if (onConversationSelect) {
      onConversationSelect(conversation);
    }
  };

  /**
   * Handle search in conversation
   */
  const handleSearchInConversation = (conversation) => {
    setSelectedSessionForSearch(conversation.session_id);
    setShowSearchModal(true);
  };

  /**
   * Get priority color
   */
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-4 border-b">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
        <div className="p-4 space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse">
              <div className="h-16 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">
            Daftar Percakapan
          </h3>
          <span className="text-sm text-gray-500">
            {filteredConversations.length} dari {conversations.length}
          </span>
        </div>

        {/* Search and Filters */}
        <div className="space-y-3">
          {/* Search Input */}
          {showSearch && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari percakapan..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
          )}

          {/* Status Filter */}
          <div className="flex space-x-2">
            {[
              { key: 'all', label: 'Semua' },
              { key: 'active', label: 'Aktif' },
              { key: 'unread', label: 'Belum Dibaca' },
              { key: 'resolved', label: 'Selesai' }
            ].map(filter => (
              <button
                key={filter.key}
                onClick={() => setFilterStatus(filter.key)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  filterStatus === filter.key
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Conversation List */}
      <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="p-8 text-center">
            <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">
              {searchQuery ? 'Tidak ada percakapan yang cocok' : 'Belum ada percakapan'}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-blue-600 hover:text-blue-700 text-sm mt-2"
              >
                Hapus filter pencarian
              </button>
            )}
          </div>
        ) : (
          filteredConversations.map((conversation) => {
            const status = getConversationStatus(conversation);
            const unreadCount = unreadCounts[conversation.session_id] || 0;
            const isSelected = selectedSessionId === conversation.session_id;
            const StatusIcon = status.icon;

            return (
              <div
                key={conversation.session_id}
                onClick={() => handleConversationClick(conversation)}
                className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                  isSelected ? 'bg-blue-50 border-r-4 border-blue-500' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    {/* Customer Info */}
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-blue-600" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {conversation.customer?.name || 'Unknown Customer'}
                        </p>
                        <p className="text-xs text-gray-500 flex items-center">
                          <Phone className="w-3 h-3 mr-1" />
                          {conversation.customer?.phone || 'No phone'}
                        </p>
                      </div>
                    </div>

                    {/* Conversation Stats */}
                    <div className="flex items-center space-x-4 text-xs text-gray-500 mb-2">
                      <span className="flex items-center">
                        <MessageSquare className="w-3 h-3 mr-1" />
                        {conversation.statistics?.total_messages || 0} pesan
                      </span>
                      <span className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {formatDistanceToNow(new Date(conversation.timeline?.last_activity_at), {
                          addSuffix: true,
                          locale: id
                        })}
                      </span>
                    </div>

                    {/* Status and Priority */}
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center ${status.color}`}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {status.label}
                      </span>

                      {conversation.classification?.priority && (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(conversation.classification.priority)}`}>
                          {conversation.classification.priority}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions and Unread Count */}
                  <div className="flex items-center space-x-2">
                    {/* Unread Count */}
                    {unreadCount > 0 && (
                      <span className="bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}

                    {/* Actions */}
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSearchInConversation(conversation);
                        }}
                        className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                        title="Cari dalam percakapan"
                      >
                        <Search className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Search Modal */}
      {showSearchModal && selectedSessionForSearch && (
        <ConversationSearch
          sessionId={selectedSessionForSearch}
          onClose={() => {
            setShowSearchModal(false);
            setSelectedSessionForSearch(null);
          }}
          onMessageSelect={(message) => {
            // Handle message selection if needed
            setShowSearchModal(false);
            setSelectedSessionForSearch(null);
          }}
        />
      )}
    </div>
  );
};

export default ConversationList;
