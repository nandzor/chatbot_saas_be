/**
 * Session Manager Component
 * Manages chat sessions with real API integration using DataTable
 */

import { useState, useCallback, useEffect, useMemo } from 'react';
import {
  useLoadingStates
} from '@/utils/loadingStates';
import {
  handleError,
  withErrorHandling
} from '@/utils/errorHandler';
import {
  useAnnouncement,
  useFocusManagement
} from '@/utils/accessibilityUtils';
import { inboxService } from '@/services/InboxService';
import conversationService from '@/services/conversationService';
import { usePaginatedApi } from '@/hooks/useApi';
import {
  Button,
  Badge,
  Avatar,
  AvatarFallback,
  AvatarImage,
  Input,
  Alert,
  AlertDescription,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Textarea,
  Label,
  DataTable,
  Pagination
} from '@/components/ui';
import {
  MessageSquare,
  RefreshCw,
  Bot,
  Clock,
  AlertCircle,
  Phone,
  Video,
  Mail,
  Eye,
  MessageCircle,
  ArrowRightLeft,
  X,
  Tag,
  History,
  Search
} from 'lucide-react';
import ConversationDialog from '@/components/inbox/ConversationDialog';
import RealtimeMessageProvider from '@/components/inbox/RealtimeMessageProvider';
import { useRealtimeMessages } from '@/hooks/useRealtimeMessages';

const SessionManagerComponent = () => {
  const { announce } = useAnnouncement();
  const { focusRef } = useFocusManagement();
  const { setLoading, getLoadingState } = useLoadingStates();

  // State management
  const [selectedSession, setSelectedSession] = useState(null);
  const [showConversationDialog, setShowConversationDialog] = useState(false);
  const [showTransferDialog, setShowTransferDialog] = useState(false);
  const [showPersonalityDialog, setShowPersonalityDialog] = useState(false);
  const [showAiResponseDialog, setShowAiResponseDialog] = useState(false);
  const [showRecentMessagesDialog, setShowRecentMessagesDialog] = useState(false);
  const [showSearchMessagesDialog, setShowSearchMessagesDialog] = useState(false);
  const [recentMessages, setRecentMessages] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [transferData, setTransferData] = useState({
    agent_id: '',
    reason: '',
    notes: ''
  });
  const [aiResponseData, setAiResponseData] = useState({
    message: '',
    personality_id: '',
    context: {}
  });
  const [availablePersonalities, setAvailablePersonalities] = useState([]);

  // Create stable reference for API function
  const getSessions = useCallback((params) => inboxService.getSessions(params), []);

  // Create stable references for initial values
  const initialFilters = useMemo(() => ({}), []);
  const onErrorCallback = useCallback((err) => {
    handleError(err, {
      context: 'Sessions Loading',
      showToast: true
    });
  }, []);

  // API hooks for sessions
  const {
    data: sessions,
    pagination,
    loading: sessionsLoading,
    error: sessionsError,
    handlePageChange,
    handleSearch,
    handleSort: handleApiSort,
    handlePerPageChange,
    refresh
  } = usePaginatedApi(getSessions, {
    initialPage: 1,
    initialPerPage: 15,
    initialSearch: '',
    initialSort: 'last_activity_at',
    initialSortDirection: 'desc',
    initialFilters,
    onError: onErrorCallback
  });


  // Helper functions for DataTable columns
  const getSessionTypeIcon = useCallback((sessionType) => {
    switch (sessionType) {
      case 'voice': return <Phone className="h-4 w-4" />;
      case 'video': return <Video className="h-4 w-4" />;
      case 'email': return <Mail className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  }, []);

  const getPriorityBadgeVariant = useCallback((priority) => {
    switch (priority) {
      case 'urgent': return 'destructive';
      case 'high': return 'default';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  }, []);

  const getStatusBadgeVariant = useCallback((session) => {
    if (!session.is_active) return 'secondary';
    if (session.is_bot_session) return 'default';
    if (session.agent_id) return 'default';
    return 'destructive';
  }, []);

  const formatTimeAgo = useCallback((date) => {
    if (!date) return 'Unknown';
    const now = new Date();
    const diff = now - new Date(date);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  }, []);

  // Define columns for DataTable
  const columns = useMemo(() => [
    {
      key: 'customer',
      header: 'Customer',
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center space-x-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={row.customer?.avatar_url} />
            <AvatarFallback>
              {row.customer?.name?.charAt(0) || 'C'}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium text-sm">
              {row.customer?.name || 'Unknown Customer'}
            </div>
            <div className="text-xs text-muted-foreground">
              {row.session_token}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'session_type',
      header: 'Type',
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center space-x-2">
          {getSessionTypeIcon(row.session_type)}
          <span className="capitalize text-sm">{row.session_type}</span>
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center space-x-2">
          <Badge variant={getStatusBadgeVariant(row)}>
            {row.is_active ? 'Active' : 'Inactive'}
          </Badge>
          {row.priority && (
            <Badge variant={getPriorityBadgeVariant(row.priority)}>
              {row.priority}
            </Badge>
          )}
        </div>
      )
    },
    {
      key: 'agent',
      header: 'Agent',
      sortable: true,
      render: (value, row) => (
        row.agent ? (
          <div className="text-sm">
            <div className="font-medium">{row.agent.name}</div>
            <div className="text-xs text-muted-foreground">Agent</div>
          </div>
        ) : (
          <span className="text-sm text-muted-foreground">Unassigned</span>
        )
      )
    },
    {
      key: 'last_activity_at',
      header: 'Last Activity',
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center space-x-1 text-sm text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>{formatTimeAgo(row.last_activity_at)}</span>
        </div>
      )
    },
    {
      key: 'total_messages',
      header: 'Messages',
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center space-x-1 text-sm">
          <MessageCircle className="h-3 w-3" />
          <span>{row.total_messages || 0}</span>
        </div>
      )
    },
    {
      key: 'intent',
      header: 'Intent',
      sortable: false,
      render: (value, row) => (
        row.intent ? (
          <Badge variant="outline" className="text-xs">
            <Tag className="h-3 w-3 mr-1" />
            {row.intent}
          </Badge>
        ) : null
      )
    },
    {
      key: 'recent_message',
      header: 'Recent Message',
      sortable: false,
      render: (value, row) => (
        <div className="max-w-xs">
          {row.recent_message ? (
            <div className="text-sm text-muted-foreground truncate">
              <span className="font-medium">
                {row.recent_message.sender?.type === 'customer' ? 'Customer' :
                 row.recent_message.sender?.type === 'agent' ? 'Agent' : 'Bot'}:
              </span>
              <span className="ml-1">{row.recent_message.content?.text || 'No text'}</span>
            </div>
          ) : (
            <span className="text-sm text-muted-foreground">No messages</span>
          )}
        </div>
      )
    }
  ], [getSessionTypeIcon, getStatusBadgeVariant, getPriorityBadgeVariant, formatTimeAgo]);

  // Handle session selection
  const handleSessionSelect = useCallback((session) => {
    setSelectedSession(session);
    setShowConversationDialog(true);
    announce(`Selected session ${session.session_token}`);
  }, [announce]);

  // Handle table sorting
  const handleTableSort = useCallback((sortConfig) => {
    if (handleApiSort) {
      handleApiSort(sortConfig.key, sortConfig.direction);
      announce(`Table sorted by ${sortConfig.key} in ${sortConfig.direction}ending order`);
    }
  }, [handleApiSort, announce]);

  // Handle per page change
  const handleTablePerPageChange = useCallback((newPerPage) => {
    if (handlePerPageChange) {
      handlePerPageChange(newPerPage);
      announce(`Changed page size to ${newPerPage} items`);
    }
  }, [handlePerPageChange, announce]);

  // Handle end session
  const handleEndSession = useCallback(async (sessionId, resolutionType = 'resolved') => {
    try {
      setLoading('end', true);
      const result = await inboxService.endSession(sessionId, { resolution_type: resolutionType });

      if (result.success) {
        announce('Session ended successfully');
        refresh();
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      handleError(err, { context: 'End Session' });
    } finally {
      setLoading('end', false);
    }
  }, [setLoading, announce, refresh]);

  // Handle recent messages
  const handleViewRecentMessages = useCallback(async (session) => {
    try {
      setLoading('recent', true);
      setSelectedSession(session);

      const result = await conversationService.getConversationWithRecent(session.id, 10);

      if (result.success) {
        setRecentMessages(result.data.conversation.messages || []);
        setShowRecentMessagesDialog(true);
        announce(`Loaded ${result.data.conversation.messages?.length || 0} recent messages`);
      } else {
        throw new Error(result.error || 'Failed to load recent messages');
      }
    } catch (err) {
      handleError(err, { context: 'Load Recent Messages' });
    } finally {
      setLoading('recent', false);
    }
  }, [setLoading, announce]);

  // Handle search messages
  const handleSearchMessages = useCallback(async (session) => {
    setSelectedSession(session);
    setSearchQuery('');
    setSearchResults([]);
    setShowSearchMessagesDialog(true);
  }, []);

  const handlePerformSearch = useCallback(async () => {
    if (!selectedSession || !searchQuery.trim()) return;

    try {
      setLoading('search', true);

      const result = await conversationService.searchMessages(selectedSession.id, searchQuery.trim());

      if (result.success) {
        setSearchResults(result.data.messages || []);
        announce(`Found ${result.data.total_found || 0} messages`);
      } else {
        throw new Error(result.error || 'Failed to search messages');
      }
    } catch (err) {
      handleError(err, { context: 'Search Messages' });
    } finally {
      setLoading('search', false);
    }
  }, [selectedSession, searchQuery, setLoading, announce]);

  // Define actions for DataTable
  const actions = useMemo(() => [
    {
      label: 'View Details',
      icon: Eye,
      onClick: (row) => handleSessionSelect(row)
    },
    {
      label: 'Recent Messages',
      icon: History,
      onClick: (row) => handleViewRecentMessages(row)
    },
    {
      label: 'Search Messages',
      icon: Search,
      onClick: (row) => handleSearchMessages(row)
    },
    {
      label: 'Transfer',
      icon: ArrowRightLeft,
      onClick: (row) => {
        setSelectedSession(row);
        setShowTransferDialog(true);
      }
    },
    {
      label: 'Assign Bot',
      icon: Bot,
      onClick: (row) => {
        setSelectedSession(row);
        setShowPersonalityDialog(true);
      }
    },
    {
      label: 'AI Response',
      icon: MessageSquare,
      onClick: (row) => {
        setSelectedSession(row);
        setShowAiResponseDialog(true);
      }
    },
    {
      label: 'End Session',
      icon: X,
      onClick: (row) => handleEndSession(row.id),
      disabled: (row) => !row.is_active
    }
  ], [handleSessionSelect, handleViewRecentMessages, handleSearchMessages, handleEndSession]);

  // Load available personalities
  const loadAvailablePersonalities = useCallback(async () => {
    try {
      const result = await inboxService.getAvailableBotPersonalities();
      if (result.success) {
        setAvailablePersonalities(result.data);
      }
    } catch (err) {
      handleError(err, { context: 'Load Personalities' });
    }
  }, []);

  // Load personalities on mount
  useEffect(() => {
    loadAvailablePersonalities();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps


  // Handle transfer session
  const handleTransferSessionAction = useCallback(async () => {
    if (!selectedSession || !transferData.agent_id) return;

    try {
      setLoading('transfer', true);
      const result = await inboxService.transferSession(selectedSession.id, transferData);

      if (result.success) {
        announce('Session transferred successfully');
        setShowTransferDialog(false);
        setTransferData({ agent_id: '', reason: '', notes: '' });
        refresh();
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      handleError(err, { context: 'Session Transfer' });
    } finally {
      setLoading('transfer', false);
    }
  }, [selectedSession, transferData, setLoading, announce, refresh]);

  // Handle assign bot personality
  const handleAssignPersonality = useCallback(async () => {
    if (!selectedSession || !aiResponseData.personality_id) return;

    try {
      setLoading('assign', true);
      const result = await inboxService.assignBotPersonality(selectedSession.id, aiResponseData.personality_id);

      if (result.success) {
        announce('Bot personality assigned successfully');
        setShowPersonalityDialog(false);
        setAiResponseData({ message: '', personality_id: '', context: {} });
        refresh();
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      handleError(err, { context: 'Assign Personality' });
    } finally {
      setLoading('assign', false);
    }
  }, [selectedSession, aiResponseData.personality_id, setLoading, announce, refresh]);

  // Handle generate AI response
  const handleGenerateAiResponse = useCallback(async () => {
    if (!selectedSession || !aiResponseData.message || !aiResponseData.personality_id) return;

    try {
      setLoading('ai', true);
      const result = await inboxService.generateAiResponse(
        selectedSession.id,
        aiResponseData.message,
        aiResponseData.personality_id,
        aiResponseData.context
      );

      if (result.success) {
        announce('AI response generated successfully');
        setShowAiResponseDialog(false);
        setAiResponseData({ message: '', personality_id: '', context: {} });
        refresh();
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      handleError(err, { context: 'Generate AI Response' });
    } finally {
      setLoading('ai', false);
    }
  }, [selectedSession, aiResponseData, setLoading, announce, refresh]);

  // Handle conversation dialog actions
  const handleConversationClose = useCallback(() => {
    setShowConversationDialog(false);
    setSelectedSession(null);
  }, []);

  const handleSendMessage = useCallback((_message) => {
    announce('Message sent successfully');
    refresh();
  }, [announce, refresh]);

  const handleAssignConversation = useCallback(async (session) => {
    try {
      setLoading('assign', true);

      // Use current_agent to let backend handle the logic
      const result = await inboxService.assignSession(session.id, 'current_agent');

      if (result.success) {
        announce('Session assigned successfully');
        refresh();
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      handleError(err, { context: 'Assign Session' });
    } finally {
      setLoading('assign', false);
    }
  }, [setLoading, announce, refresh]);

  const handleResolveConversation = useCallback((_session, _resolveData) => {
    announce('Session resolved successfully');
    refresh();
  }, [announce, refresh]);

  const handleTransferSession = useCallback((_session, _transferData) => {
    announce('Session transferred successfully');
    refresh();
  }, [announce, refresh]);


    return (
    <RealtimeMessageProvider>
      <SessionManagerWithRealtime
        sessions={sessions}
        pagination={pagination}
        sessionsLoading={sessionsLoading}
        sessionsError={sessionsError}
        handlePageChange={handlePageChange}
        handleSearch={handleSearch}
        handleTableSort={handleTableSort}
        handleTablePerPageChange={handleTablePerPageChange}
        refresh={refresh}
        columns={columns}
        actions={actions}
        selectedSession={selectedSession}
        showConversationDialog={showConversationDialog}
        showTransferDialog={showTransferDialog}
        showPersonalityDialog={showPersonalityDialog}
        showAiResponseDialog={showAiResponseDialog}
        showRecentMessagesDialog={showRecentMessagesDialog}
        showSearchMessagesDialog={showSearchMessagesDialog}
        recentMessages={recentMessages}
        searchResults={searchResults}
        searchQuery={searchQuery}
        transferData={transferData}
        aiResponseData={aiResponseData}
        availablePersonalities={availablePersonalities}
        getLoadingState={getLoadingState}
        handleSessionSelect={handleSessionSelect}
        handleViewRecentMessages={handleViewRecentMessages}
        handlePerformSearch={handlePerformSearch}
        handleTransferSessionAction={handleTransferSessionAction}
        handleAssignPersonality={handleAssignPersonality}
        handleGenerateAiResponse={handleGenerateAiResponse}
        handleConversationClose={handleConversationClose}
        handleSendMessage={handleSendMessage}
        handleAssignConversation={handleAssignConversation}
        handleResolveConversation={handleResolveConversation}
        handleTransferSession={handleTransferSession}
        setShowTransferDialog={setShowTransferDialog}
        setShowPersonalityDialog={setShowPersonalityDialog}
        setShowAiResponseDialog={setShowAiResponseDialog}
        setShowRecentMessagesDialog={setShowRecentMessagesDialog}
        setShowSearchMessagesDialog={setShowSearchMessagesDialog}
        setTransferData={setTransferData}
        setAiResponseData={setAiResponseData}
        setSearchQuery={setSearchQuery}
        focusRef={focusRef}
        announce={announce}
      />
    </RealtimeMessageProvider>
  );
};

// Component that uses realtime messages hook inside the provider
const SessionManagerWithRealtime = (props) => {
  const { registerMessageHandler } = useRealtimeMessages();
  const {
    sessions,
    pagination,
    sessionsLoading,
    sessionsError,
    handlePageChange,
    handleSearch,
    handleTableSort,
    handleTablePerPageChange,
    refresh,
    columns,
    actions,
    selectedSession,
    showConversationDialog,
    showTransferDialog,
    showPersonalityDialog,
    showAiResponseDialog,
    showRecentMessagesDialog,
    showSearchMessagesDialog,
    recentMessages,
    searchResults,
    searchQuery,
    transferData,
    aiResponseData,
    availablePersonalities,
    getLoadingState,
    handleSessionSelect,
    handleViewRecentMessages,
    handlePerformSearch,
    handleTransferSessionAction,
    handleAssignPersonality,
    handleGenerateAiResponse,
    handleConversationClose,
    handleSendMessage,
    handleAssignConversation,
    handleResolveConversation,
    handleTransferSession,
    setShowTransferDialog,
    setShowPersonalityDialog,
    setShowAiResponseDialog,
    setShowRecentMessagesDialog,
    setShowSearchMessagesDialog,
    setTransferData,
    setAiResponseData,
    setSearchQuery,
    focusRef: _focusRef,
    announce
  } = props;

  // Register real-time message handler for session updates
  useEffect(() => {
    if (!registerMessageHandler) return;

    const unregisterMessage = registerMessageHandler(null, (data) => {
      // console.log('🔔 SessionManager received data:', data);
      // Handle message.processed event to update session list
      if (data.event === 'message.processed' || data.message_id) {
        // console.log('📨 SessionManager processing message.processed event');
        // Refresh session list to show updated last message and activity
        refresh();

        // Show notification for new messages
        if (data.sender_type === 'customer') {
          announce(`New message from ${data.customer_name || 'customer'}`);
        }
      }
    });

    return () => {
      if (unregisterMessage) {
        unregisterMessage();
      }
    };
  }, [registerMessageHandler, refresh, announce]);

  return (
      <div className="space-y-6" ref={_focusRef}>
      {/* Header and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div>
          <h2 className="text-2xl font-bold">Session Manager</h2>
          <p className="text-muted-foreground">
            Manage and monitor chat sessions
          </p>
        </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
            onClick={refresh}
            disabled={sessionsLoading}
            aria-label="Refresh sessions"
              >
            <RefreshCw className={`h-4 w-4 mr-2 ${sessionsLoading ? 'animate-spin' : ''}`} />
            Refresh
              </Button>
            </div>
          </div>


      {/* Error Alert */}
      {sessionsError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{sessionsError}</AlertDescription>
        </Alert>
      )}

      {/* Sessions DataTable */}
      <DataTable
        data={sessions || []}
        columns={columns}
        actions={actions}
        loading={sessionsLoading}
        error={sessionsError}
        onSort={handleTableSort}
        onFilter={(searchQuery) => {
          handleSearch(searchQuery);
        }}
        onRowClick={(row) => handleSessionSelect(row)}
        pagination={pagination ? {
          currentPage: pagination.currentPage,
          totalPages: pagination.totalPages,
          totalItems: pagination.totalItems,
          perPage: pagination.itemsPerPage,
          onPageChange: handlePageChange,
          onPerPageChange: handleTablePerPageChange
        } : null}
        searchable={true}
        className="w-full"
        ariaLabel="Sessions Table"
      />

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          totalItems={pagination.totalItems}
          perPage={pagination.itemsPerPage}
          onPageChange={handlePageChange}
          variant="table"
          showPerPageSelector={true}
          perPageOptions={[10, 15, 25, 50]}
        />
      )}

      {/* Transfer Dialog */}
      <Dialog open={showTransferDialog} onOpenChange={setShowTransferDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader className="px-6 py-5 border-b bg-gray-50/50">
            <DialogTitle className="text-xl">Transfer Session</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Transfer this session to another agent.
            </DialogDescription>
          </DialogHeader>
          <div className="px-6 py-5 space-y-6">
            <div>
              <Label htmlFor="agent_id" className="text-sm font-medium text-gray-700">Agent</Label>
              <Input
                id="agent_id"
                value={transferData.agent_id}
                onChange={(e) => setTransferData(prev => ({ ...prev, agent_id: e.target.value }))}
                placeholder="Enter agent ID"
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="reason" className="text-sm font-medium text-gray-700">Reason (Optional)</Label>
              <Input
                id="reason"
                value={transferData.reason}
                onChange={(e) => setTransferData(prev => ({ ...prev, reason: e.target.value }))}
                placeholder="Reason for transfer"
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="notes" className="text-sm font-medium text-gray-700">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={transferData.notes}
                onChange={(e) => setTransferData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Additional notes"
                className="mt-2"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter className="px-6 py-4 border-t bg-gray-50/50">
            <Button
              variant="outline"
              onClick={() => setShowTransferDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleTransferSessionAction}
              disabled={!transferData.agent_id || getLoadingState('transfer')}
            >
              {getLoadingState('transfer') ? 'Transferring...' : 'Transfer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bot Personality Assignment Dialog */}
      <Dialog open={showPersonalityDialog} onOpenChange={setShowPersonalityDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="space-y-3">
            <DialogTitle className="text-lg font-semibold">Assign Bot Personality</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Assign a bot personality to handle this session automatically.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="personality_id" className="text-sm font-medium">
                Bot Personality ID
              </Label>
              <Input
                id="personality_id"
                value={aiResponseData.personality_id}
                onChange={(e) => setAiResponseData(prev => ({ ...prev, personality_id: e.target.value }))}
                placeholder="Enter bot personality ID"
                className="w-full"
              />
            </div>

            {aiResponseData.personality_id && (
              <div className="p-4 bg-muted/50 rounded-lg border">
                <h4 className="font-medium text-sm mb-3 text-foreground">Personality Details</h4>
                {(() => {
                  const personality = availablePersonalities.find(p => p.id === aiResponseData.personality_id);
                  return personality ? (
                    <div className="text-sm space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Language:</span>
                        <span className="font-medium">{personality.language}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Tone:</span>
                        <span className="font-medium">{personality.tone}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Style:</span>
                        <span className="font-medium">{personality.communication_style}</span>
                      </div>
                      <div className="pt-2 border-t">
                        <span className="text-muted-foreground">Description:</span>
                        <p className="mt-1 text-foreground">{personality.description}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Personality not found</p>
                  );
                })()}
              </div>
            )}
          </div>
          <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowPersonalityDialog(false)}
              className="mt-2 sm:mt-0"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAssignPersonality}
              disabled={!aiResponseData.personality_id || getLoadingState('assign')}
              className="w-full sm:w-auto"
            >
              {getLoadingState('assign') ? 'Assigning...' : 'Assign Bot'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AI Response Generation Dialog */}
      <Dialog open={showAiResponseDialog} onOpenChange={setShowAiResponseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate AI Response</DialogTitle>
            <DialogDescription>
              Generate an AI response using a bot personality for this session.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
                  <div>
              <Label htmlFor="personality_id">Bot Personality ID</Label>
              <Input
                id="personality_id"
                value={aiResponseData.personality_id}
                onChange={(e) => setAiResponseData(prev => ({ ...prev, personality_id: e.target.value }))}
                placeholder="Enter bot personality ID"
              />
                  </div>
                  <div>
              <Label htmlFor="message">Message to Respond To</Label>
              <Textarea
                id="message"
                value={aiResponseData.message}
                onChange={(e) => setAiResponseData(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Enter the customer message to respond to..."
                rows={4}
              />
                    </div>
            <div>
              <Label htmlFor="context">Additional Context (Optional)</Label>
              <Textarea
                id="context"
                value={JSON.stringify(aiResponseData.context, null, 2)}
                onChange={(e) => {
                  try {
                    const context = JSON.parse(e.target.value);
                    setAiResponseData(prev => ({ ...prev, context }));
                  } catch {
                    // Invalid JSON, ignore
                  }
                }}
                placeholder="Enter additional context as JSON..."
                rows={3}
              />
                    </div>
                  </div>
          <DialogFooter>
                      <Button
                        variant="outline"
              onClick={() => setShowAiResponseDialog(false)}
                      >
              Cancel
                      </Button>
                      <Button
              onClick={handleGenerateAiResponse}
              disabled={!aiResponseData.personality_id || !aiResponseData.message || getLoadingState('ai')}
                      >
              {getLoadingState('ai') ? 'Generating...' : 'Generate Response'}
                      </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Search Messages Dialog */}
      <Dialog open={showSearchMessagesDialog} onOpenChange={setShowSearchMessagesDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Search Messages</DialogTitle>
            <DialogDescription>
              Search messages in session: {selectedSession?.session_token}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex space-x-2">
              <Input
                placeholder="Enter search query..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handlePerformSearch()}
                className="flex-1"
              />
              <Button
                onClick={handlePerformSearch}
                disabled={!searchQuery.trim() || getLoadingState('search')}
              >
                <Search className="h-4 w-4 mr-2" />
                {getLoadingState('search') ? 'Searching...' : 'Search'}
              </Button>
            </div>

            <div className="max-h-[50vh] overflow-y-auto">
              {getLoadingState('search') ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                  <span>Searching messages...</span>
                </div>
              ) : searchResults.length > 0 ? (
                <div className="space-y-3">
                  <div className="text-sm text-muted-foreground mb-4">
                    Found {searchResults.length} messages
                  </div>
                  {searchResults.map((message, index) => (
                    <div
                      key={message.id || index}
                      className={`p-3 rounded-lg border ${
                        message.sender?.type === 'customer'
                          ? 'bg-blue-50 border-blue-200'
                          : message.sender?.type === 'agent'
                          ? 'bg-green-50 border-green-200'
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <Badge
                              variant={
                                message.sender?.type === 'customer' ? 'default' :
                                message.sender?.type === 'agent' ? 'secondary' : 'outline'
                              }
                            >
                              {message.sender?.type === 'customer' ? 'Customer' :
                               message.sender?.type === 'agent' ? 'Agent' : 'Bot'}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {message.sender?.name || 'Unknown'}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {message.created_at ? new Date(message.created_at).toLocaleString() : 'Unknown time'}
                            </span>
                          </div>
                          <div className="text-sm">
                            {message.content?.text || 'No text content'}
                          </div>
                          {message.status && (
                            <div className="flex items-center space-x-2 mt-2">
                              <Badge
                                variant={message.status.is_read ? 'secondary' : 'default'}
                                className="text-xs"
                              >
                                {message.status.is_read ? 'Read' : 'Unread'}
                              </Badge>
                              {message.status.delivered_at && (
                                <span className="text-xs text-muted-foreground">
                                  Delivered: {new Date(message.status.delivered_at).toLocaleString()}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : searchQuery ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No messages found for &quot;{searchQuery}&quot;</p>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Enter a search query to find messages</p>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowSearchMessagesDialog(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Recent Messages Dialog */}
      <Dialog open={showRecentMessagesDialog} onOpenChange={setShowRecentMessagesDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] p-0">
          <DialogHeader className="px-6 py-5 border-b bg-gray-50/50">
            <DialogTitle className="text-xl">Recent Messages</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Recent messages for session: {selectedSession?.session_token}
            </DialogDescription>
          </DialogHeader>
          <div className="px-6 py-5 max-h-[60vh] overflow-y-auto">
            {getLoadingState('recent') ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="h-6 w-6 animate-spin mr-3" />
                <span className="text-gray-600">Loading recent messages...</span>
              </div>
            ) : recentMessages.length > 0 ? (
              <div className="space-y-4">
                {recentMessages.map((message, index) => (
                  <div
                    key={message.id || index}
                    className={`p-4 rounded-lg border shadow-sm ${
                      message.sender?.type === 'customer'
                        ? 'bg-blue-50 border-blue-200'
                        : message.sender?.type === 'agent'
                        ? 'bg-green-50 border-green-200'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <Badge
                            variant={
                              message.sender?.type === 'customer' ? 'default' :
                              message.sender?.type === 'agent' ? 'secondary' : 'outline'
                            }
                            className="text-xs"
                          >
                            {message.sender?.type === 'customer' ? 'Customer' :
                             message.sender?.type === 'agent' ? 'Agent' : 'Bot'}
                          </Badge>
                          <span className="text-sm font-medium text-gray-700">
                            {message.sender?.name || 'Unknown'}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {message.created_at ? new Date(message.created_at).toLocaleString() : 'Unknown time'}
                          </span>
                        </div>
                        <div className="text-sm text-gray-800 leading-relaxed">
                          {message.content?.text || 'No text content'}
                        </div>
                        {message.status && (
                          <div className="flex items-center space-x-3 mt-3 pt-2 border-t border-gray-200/50">
                            <Badge
                              variant={message.status.is_read ? 'secondary' : 'default'}
                              className="text-xs"
                            >
                              {message.status.is_read ? 'Read' : 'Unread'}
                            </Badge>
                            {message.status.delivered_at && (
                              <span className="text-xs text-muted-foreground">
                                Delivered: {new Date(message.status.delivered_at).toLocaleString()}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <MessageCircle className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">No recent messages found</p>
                <p className="text-sm">No recent messages found for this session.</p>
              </div>
            )}
          </div>
          <DialogFooter className="px-6 py-4 border-t bg-gray-50/50">
            <Button
              variant="outline"
              onClick={() => setShowRecentMessagesDialog(false)}
            >
              Close
            </Button>
            <Button
              onClick={() => selectedSession && handleViewRecentMessages(selectedSession)}
              disabled={getLoadingState('recent')}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${getLoadingState('recent') ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Conversation Dialog */}
      <ConversationDialog
        session={selectedSession}
        isOpen={showConversationDialog}
        onClose={handleConversationClose}
        onSendMessage={handleSendMessage}
        onAssignConversation={handleAssignConversation}
        onResolveConversation={handleResolveConversation}
        onTransferSession={handleTransferSession}
      />
      </div>
  );
};

const SessionManager = withErrorHandling(SessionManagerComponent, {
  context: 'Session Manager'
});

export default SessionManager;
