import React, { useState, useEffect, useRef } from 'react';
import {Card, CardContent, CardDescription, CardHeader, CardTitle, Badge, Button, Input, Label, Select, SelectItem, Textarea, Switch, Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, Tabs, TabsContent, TabsList, TabsTrigger, Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '@/components/ui';
import {
  MessageSquare,
  Clock,
  User,
  Send,
  Paperclip,
  Search,
  Filter,
  MoreVertical,
  ArrowRight,
  AlertCircle,
  CheckCircle,
  Timer,
  Flag,
  Star,
  UserPlus,
  Phone,
  Mail,
  Calendar,
  Building,
  Tag,
  FileText,
  Zap,
  ThumbsUp,
  ThumbsDown,
  Eye,
  EyeOff,
  ArrowRightLeft,
  Archive,
  Ban,
  Plus,
  Edit,
  Trash2,
  Copy,
  BookOpen,
  Info,
  History,
  Users,
  MessageCircle,
  X,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { useAgentInbox } from '@/hooks/useAgentInbox';
import { useApi } from '@/hooks/useApi';
import { inboxService } from '@/services/InboxService';
import ErrorBoundary from '@/components/ErrorBoundary';
import {
  SessionListSkeleton,
  MessagesSkeleton,
  CustomerInfoSkeleton,
  KnowledgeSkeleton,
  HistorySkeleton,
  LoadingSpinner,
  EmptySessions,
  EmptyMessages,
  EmptyKnowledge,
  EmptyHistory,
  ErrorState,
  ConnectionStatus
} from '@/components/LoadingStates';

const AgentInbox = () => {
  // Use custom hook for inbox functionality
  const {
    sessions,
    selectedSession,
    messages,
    loading,
    sendingMessage,
    error,
    filters,
    pagination,
    isConnected,
    filteredSessions,
    loadSessions,
    loadActiveSessions,
    loadPendingSessions,
    selectSession,
    sendMessage,
    transferSession,
    endSession,
    assignSession,
    updateFilters,
    refreshSessions,
    handleTyping,
    debouncedSearch,
    messagesEndRef,
    typingTimeoutRef
  } = useAgentInbox();

  // Local state for UI
  const [messageText, setMessageText] = useState('');
  const [activeTab, setActiveTab] = useState('my-queue');
  const [contextTab, setContextTab] = useState('customer-info');
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false);
  const [isWrapUpDialogOpen, setIsWrapUpDialogOpen] = useState(false);
  const [internalNotes, setInternalNotes] = useState('');
  const [showInternalNotes, setShowInternalNotes] = useState(false);
  const [transferData, setTransferData] = useState({
    agent_id: '',
    reason: '',
    notes: ''
  });
  const [endData, setEndData] = useState({
    category: '',
    summary: '',
    tags: []
  });

  // API hooks for additional data
  const { data: agents, loading: agentsLoading, error: agentsError } = useApi('/inbox/agents', { per_page: 100 });
  const { data: knowledgeArticles, loading: knowledgeLoading } = useApi('/inbox/bot-personalities', { per_page: 50 });
  const { data: customerHistory, loading: historyLoading } = useApi(`/inbox/sessions/${selectedSession?.id}/analytics`, {}, !!selectedSession?.id);

  // Quick replies data
  const quickReplies = [
    'Halo! Saya akan membantu Anda hari ini.',
    'Terima kasih telah menghubungi support. Saya sedang mengecek masalah Anda.',
    'Apakah masalah ini sudah teratasi?',
    'Saya akan eskalasi masalah ini ke tim teknis.',
    'Terima kasih atas kesabaran Anda.'
  ];

  const getSLAIndicator = (slaStatus, waitingTime) => {
    const colors = {
      safe: 'bg-green-500',
      warning: 'bg-yellow-500',
      danger: 'bg-red-500'
    };

    return (
      <div className="flex items-center space-x-2">
        <div className={`w-3 h-3 rounded-full ${colors[slaStatus]} ${slaStatus === 'danger' ? 'animate-pulse' : ''}`}></div>
        <span className={`text-xs ${
          slaStatus === 'danger' ? 'text-red-600' :
          slaStatus === 'warning' ? 'text-yellow-600' : 'text-green-600'
        }`}>
          {waitingTime}m
        </span>
      </div>
    );
  };

  const getPriorityBadge = (priority) => {
    const config = {
      high: { color: 'red', label: 'High' },
      medium: { color: 'yellow', label: 'Medium' },
      low: { color: 'green', label: 'Low' }
    };
    const priorityConfig = config[priority] || config.medium;
    return <Badge variant={priorityConfig.color} className="text-xs">{priorityConfig.label}</Badge>;
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedSession) return;

    try {
      await sendMessage(selectedSession.id, messageText, 'text');
    setMessageText('');
      // Stop typing indicator
      handleTypingStop();
    } catch (error) {
      console.error('Error sending message:', error);
      // You could add a toast notification here
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSessionSelect = async (session) => {
    try {
      await selectSession(session);
    } catch (error) {
      console.error('Error selecting session:', error);
    }
  };

  const handleTransferSession = async () => {
    if (!selectedSession || !transferData.agent_id) return;

    try {
      await transferSession(selectedSession.id, transferData);
    setIsTransferDialogOpen(false);
      setTransferData({ agent_id: '', reason: '', notes: '' });
    } catch (error) {
      console.error('Error transferring session:', error);
    }
  };

  const handleWrapUpSession = async () => {
    if (!selectedSession) return;

    try {
      await endSession(selectedSession.id, endData);
    setIsWrapUpDialogOpen(false);
      setEndData({ category: '', summary: '', tags: [] });
    } catch (error) {
      console.error('Error ending session:', error);
    }
  };

  const handleAssignSession = async (sessionId) => {
    try {
      await assignSession(sessionId);
    } catch (error) {
      console.error('Error assigning session:', error);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    switch (tab) {
      case 'my-queue':
        loadSessions();
        break;
      case 'active':
        loadActiveSessions();
        break;
      case 'pending':
        loadPendingSessions();
        break;
      default:
        loadSessions();
    }
  };

  const handleFilterChange = (key, value) => {
    updateFilters({ [key]: value });
  };

  const handleTypingStart = () => {
    if (selectedSession) {
      handleTyping(selectedSession.id, true);
    }
  };

  const handleTypingStop = () => {
    if (selectedSession) {
      handleTyping(selectedSession.id, false);
    }
  };

  // Filtered sessions are now handled in the hook for better performance

  // Auto-scroll effect is handled in the hook

  // Cleanup typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
    }
    };
  }, []);

  return (
    <ErrorBoundary>
      <div className="h-screen flex bg-gray-50 overflow-hidden">
      {/* Left Panel - Chat Queue */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col shadow-sm flex-shrink-0">
        {/* Queue Header */}
        <div className="p-3 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 flex-shrink-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <MessageSquare className="w-4 h-4 text-blue-600" />
              <h2 className="text-sm font-semibold text-gray-900">Agent Inbox</h2>
              <ConnectionStatus isConnected={isConnected} isConnecting={loading} />
            </div>
            <div className="flex items-center space-x-2">
            <Badge variant="blue" className="px-2 py-0.5 text-xs">
                {filteredSessions.length}
            </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={refreshSessions}
                disabled={loading}
                className="p-1 h-6 w-6 disabled:opacity-50"
              >
                <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>

          {/* Queue Tabs */}
          <div className="flex space-x-1 mb-2">
            <Button
              variant={activeTab === 'my-queue' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handleTabChange('my-queue')}
              disabled={loading}
              className="text-xs px-2 py-1 h-6 disabled:opacity-50"
            >
              My Queue
            </Button>
            <Button
              variant={activeTab === 'active' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handleTabChange('active')}
              disabled={loading}
              className="text-xs px-2 py-1 h-6 disabled:opacity-50"
            >
              Active
            </Button>
            <Button
              variant={activeTab === 'pending' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handleTabChange('pending')}
              disabled={loading}
              className="text-xs px-2 py-1 h-6 disabled:opacity-50"
            >
              Pending
            </Button>
          </div>

          {/* Search & Filter */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="absolute left-2 top-2 h-3 w-3 text-gray-400" />
              <Input
                placeholder="Cari customer..."
                value={filters.search}
                onChange={(e) => debouncedSearch(e.target.value)}
                disabled={loading}
                className="pl-7 h-7 text-xs bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50"
              />
            </div>

            <div className="grid grid-cols-2 gap-1">
            <Select
                value={filters.status}
                onValueChange={(value) => handleFilterChange('status', value)}
                disabled={loading}
                className="h-7 text-xs bg-white border-gray-300 disabled:opacity-50"
                placeholder="Status"
            >
              <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="waiting">Waiting</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="ended">Ended</SelectItem>
              </Select>

              <Select
                value={filters.priority}
                onValueChange={(value) => handleFilterChange('priority', value)}
                disabled={loading}
                className="h-7 text-xs bg-white border-gray-300 disabled:opacity-50"
                placeholder="Priority"
              >
                <SelectItem value="all">Semua Priority</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
</Select>
            </div>
          </div>
        </div>

        {/* Chat Sessions List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <SessionListSkeleton />
          ) : error ? (
            <ErrorState error={error} onRetry={refreshSessions} />
          ) : filteredSessions.length === 0 ? (
            <EmptySessions />
          ) : (
            filteredSessions.map((session) => {
              const customer = session.customer || {};
              const waitingTime = session.wait_time || 0;
              const slaStatus = waitingTime > 30 ? 'danger' : waitingTime > 15 ? 'warning' : 'safe';

              return (
            <div
              key={session.id}
                  onClick={() => handleSessionSelect(session)}
              className={`p-2.5 border-b border-gray-100 cursor-pointer transition-all duration-200 ${
                selectedSession?.id === session.id
                  ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-l-blue-500'
                  : 'hover:bg-gray-50 hover:border-l-4 hover:border-l-gray-300'
                  }`}
            >
              {/* Session Header */}
              <div className="flex items-start justify-between mb-1.5">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-medium text-xs">
                        {(customer.name || customer.first_name || 'C').charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 text-xs truncate">
                          {customer.name || `${customer.first_name || ''} ${customer.last_name || ''}`.trim() || 'Unknown Customer'}
                    </h3>
                    <p className="text-xs text-gray-500 truncate">
                          {customer.email || 'No email'}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end space-y-1">
                      {getSLAIndicator(slaStatus, waitingTime)}
                    {session.unread_count > 0 && (
                    <Badge variant="red" className="text-xs px-1 py-0.5 animate-pulse">
                        {session.unread_count}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Session Info */}
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center space-x-1">
                    {getPriorityBadge(session.priority || 'medium')}
                  <Badge variant="blue" className="text-xs px-1 py-0.5">
                      {session.category || 'general'}
                  </Badge>
                </div>
                <div className="flex items-center space-x-1">
                      {(session.tags || []).slice(0, 1).map(tag => (
                    <Badge key={tag} variant="gray" className="text-xs px-1 py-0.5 bg-gray-100 text-gray-700 border-gray-200">
                      {tag}
                    </Badge>
                  ))}
                      {(session.tags || []).length > 1 && (
                    <Badge variant="gray" className="text-xs px-1 py-0.5">
                          +{(session.tags || []).length - 1}
                    </Badge>
                  )}
                      {session.status === 'pending' && !session.agent_id && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAssignSession(session.id);
                          }}
                          disabled={loading}
                          className="text-xs px-1 py-0.5 h-5 text-green-600 hover:text-green-700 hover:bg-green-50 disabled:opacity-50"
                        >
                          {loading ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <UserPlus className="w-3 h-3" />
                          )}
                        </Button>
                  )}
                </div>
              </div>

              {/* Last Message Preview */}
              <div className="mb-1.5">
                <p className="text-xs text-gray-600 line-clamp-1 leading-relaxed">
                      {session.last_message?.body || session.last_message || 'No messages yet'}
                </p>
              </div>

              {/* Timestamp & Status */}
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-400">
                      {session.last_activity_at ? new Date(session.last_activity_at).toLocaleTimeString('id-ID', {
                    hour: '2-digit',
                    minute: '2-digit'
                      }) : 'No activity'}
                </p>
                <div className="flex items-center space-x-1">
                  <div className={`w-2 h-2 rounded-full ${
                    session.is_active ? 'bg-green-500' :
                        session.session_type === 'bot' ? 'bg-blue-500' :
                        session.session_type === 'agent' ? 'bg-purple-500' : 'bg-gray-400'
                  }`}></div>
                      <span className="text-xs text-gray-500 capitalize">{session.session_type || 'unknown'}</span>
                </div>
              </div>
            </div>
              );
            })
          )}
        </div>
      </div>

      {/* Center Panel - Chat Window */}
      <div className="flex-1 flex flex-col bg-white min-w-0">
        {selectedSession ? (
          <>
            {/* Chat Header */}
            <div className="p-3 border-b border-gray-200 bg-gradient-to-r from-white to-gray-50 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 min-w-0">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                    {(selectedSession.customer?.name || selectedSession.customer?.first_name || 'C').charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-gray-900 mb-1 truncate">
                      {selectedSession.customer?.name || `${selectedSession.customer?.first_name || ''} ${selectedSession.customer?.last_name || ''}`.trim() || 'Unknown Customer'}
                    </h3>
                    <div className="flex items-center space-x-1 text-xs">
                      <div className="flex items-center space-x-1 min-w-0">
                        <Building className="w-3 h-3 text-gray-400 flex-shrink-0" />
                        <span className="text-gray-600 truncate">{selectedSession.customer?.email || 'No email'}</span>
                      </div>
                      <div className="w-1 h-1 bg-gray-300 rounded-full flex-shrink-0"></div>
                      <Badge variant="blue" className="text-xs px-1 py-0.5 flex-shrink-0">
                        {selectedSession.priority || 'normal'}
                      </Badge>
                      <div className="w-1 h-1 bg-gray-300 rounded-full flex-shrink-0"></div>
                      <div className="flex items-center space-x-1 flex-shrink-0">
                        <Star className="w-3 h-3 text-yellow-500 fill-current" />
                        <span className="text-gray-600">{selectedSession.satisfaction_rating || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-1 flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowInternalNotes(!showInternalNotes)}
                    disabled={loading}
                    className={`hover:bg-yellow-50 hover:text-yellow-700 p-2 disabled:opacity-50 ${
                      showInternalNotes ? 'bg-yellow-100 text-yellow-700' : ''
                    }`}
                  >
                    <FileText className="w-3 h-3" />
                  </Button>

                  <Dialog open={isTransferDialogOpen} onOpenChange={setIsTransferDialogOpen}>
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={loading}
                        className="hover:bg-orange-50 hover:text-orange-700 disabled:opacity-50"
                      >
                        <ArrowRightLeft className="w-4 h-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader className="px-6 py-5">
                        <DialogTitle className="flex items-center space-x-2">
                          <ArrowRightLeft className="w-5 h-5 text-orange-600" />
                          <span>Transfer Session</span>
                        </DialogTitle>
                        <DialogDescription>
                          Transfer chat ini ke agent atau departemen lain
                        </DialogDescription>
                      </DialogHeader>
                      <div className="px-6 py-4 space-y-4">
                        <div>
                          <Label htmlFor="transferTo" className="text-sm font-medium">Transfer ke</Label>
                          <Select
                            value={transferData.agent_id}
                            onValueChange={(value) => setTransferData(prev => ({ ...prev, agent_id: value }))}
                            disabled={loading}
                            className="mt-1 disabled:opacity-50"
                            placeholder="Pilih agent atau departemen"
                          >
                            {agentsLoading ? (
                              <SelectItem value="loading" disabled>
                                <div className="flex items-center">
                                  <Loader2 className="w-3 h-3 animate-spin mr-2" />
                                  Loading agents...
                                </div>
                              </SelectItem>
                            ) : agentsError ? (
                              <SelectItem value="error" disabled>
                                <div className="flex items-center text-gray-500">
                                  Agents unavailable
                                </div>
                              </SelectItem>
                            ) : (agents?.data || []).length > 0 ? (
                              (agents?.data || []).map((agent) => (
                                <SelectItem key={agent.id} value={agent.id}>
                                  {agent.name} ({agent.email})
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="no-agents" disabled>
                                <div className="flex items-center text-gray-500">
                                  No agents available
                                </div>
                              </SelectItem>
                            )}
</Select>
                        </div>
                        <div>
                          <Label htmlFor="transferReason" className="text-sm font-medium">Alasan Transfer</Label>
                          <Textarea
                            value={transferData.reason}
                            onChange={(e) => setTransferData(prev => ({ ...prev, reason: e.target.value }))}
                            placeholder="Jelaskan alasan transfer..."
                            rows={3}
                            disabled={loading}
                            className="mt-1 disabled:opacity-50"
                          />
                        </div>
                        <div>
                          <Label htmlFor="transferNotes" className="text-sm font-medium">Catatan Tambahan</Label>
                          <Textarea
                            value={transferData.notes}
                            onChange={(e) => setTransferData(prev => ({ ...prev, notes: e.target.value }))}
                            placeholder="Catatan internal untuk agent yang menerima..."
                            rows={2}
                            disabled={loading}
                            className="mt-1 disabled:opacity-50"
                          />
                        </div>
                        <div className="flex justify-end space-x-2 pt-2">
                          <Button
                            variant="outline"
                            onClick={() => setIsTransferDialogOpen(false)}
                            disabled={loading}
                          >
                            Batal
                          </Button>
                          <Button
                            onClick={handleTransferSession}
                            disabled={loading || !transferData.agent_id}
                            className="bg-orange-600 hover:bg-orange-700 disabled:bg-gray-300"
                          >
                            {loading ? (
                              <Loader2 className="w-3 h-3 animate-spin mr-1" />
                            ) : null}
                            Transfer
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Dialog open={isWrapUpDialogOpen} onOpenChange={setIsWrapUpDialogOpen}>
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={loading}
                        className="hover:bg-green-50 hover:text-green-700 disabled:opacity-50"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader className="px-6 py-5">
                        <DialogTitle className="flex items-center space-x-2">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <span>Wrap-Up Session</span>
                        </DialogTitle>
                        <DialogDescription>
                          Selesaikan chat session ini
                        </DialogDescription>
                      </DialogHeader>
                      <div className="px-6 py-4 space-y-4">
                        <div>
                          <Label htmlFor="category" className="text-sm font-medium">Kategori Sesi</Label>
                          <Select
                            value={endData.category}
                            onValueChange={(value) => setEndData(prev => ({ ...prev, category: value }))}
                            disabled={loading}
                            className="mt-1 disabled:opacity-50"
                            placeholder="Pilih kategori"
                          >
              <SelectItem value="technical">Masalah Teknis</SelectItem>
                              <SelectItem value="billing">Pertanyaan Billing</SelectItem>
                              <SelectItem value="general">Pertanyaan Umum</SelectItem>
                              <SelectItem value="feature">Permintaan Fitur</SelectItem>
                            <SelectItem value="support">Support Request</SelectItem>
                            <SelectItem value="complaint">Complaint</SelectItem>
</Select>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Tandai untuk Tim Lain</Label>
                          <div className="space-y-2 mt-2">
                            <div className="flex items-center space-x-2">
                              <input type="checkbox" id="sales" disabled={loading} className="rounded border-gray-300 disabled:opacity-50" />
                              <Label htmlFor="sales" className="text-sm">Peluang Sales</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <input type="checkbox" id="churn" disabled={loading} className="rounded border-gray-300 disabled:opacity-50" />
                              <Label htmlFor="churn" className="text-sm">Risiko Churn</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <input type="checkbox" id="feedback" disabled={loading} className="rounded border-gray-300 disabled:opacity-50" />
                              <Label htmlFor="feedback" className="text-sm">Feedback Produk</Label>
                            </div>
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="summary" className="text-sm font-medium">Ringkasan Session</Label>
                          <Textarea
                            value={endData.summary}
                            onChange={(e) => setEndData(prev => ({ ...prev, summary: e.target.value }))}
                            placeholder="Ringkas masalah dan solusi yang diberikan..."
                            rows={3}
                            disabled={loading}
                            className="mt-1 disabled:opacity-50"
                          />
                        </div>
                        <div className="flex justify-end space-x-2 pt-2">
                          <Button
                            variant="outline"
                            onClick={() => setIsWrapUpDialogOpen(false)}
                            disabled={loading}
                          >
                            Batal
                          </Button>
                          <Button
                            onClick={handleWrapUpSession}
                            disabled={loading || !endData.category}
                            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-300"
                          >
                            {loading ? (
                              <Loader2 className="w-3 h-3 animate-spin mr-1" />
                            ) : null}
                            Selesaikan Session
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </div>

            {/* Internal Notes (Collapsible) */}
            {showInternalNotes && (
              <div className="p-4 bg-gradient-to-r from-yellow-50 to-amber-50 border-b border-yellow-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-yellow-700" />
                    <Label className="text-sm font-semibold text-yellow-800">Internal Notes</Label>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowInternalNotes(false)}
                    disabled={loading}
                    className="hover:bg-yellow-100 hover:text-yellow-800 disabled:opacity-50"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <Textarea
                  value={internalNotes || selectedSession.internal_notes || ''}
                  onChange={(e) => setInternalNotes(e.target.value)}
                  placeholder="Catatan internal untuk tim..."
                  rows={2}
                  disabled={loading}
                  className="bg-white border-yellow-300 focus:border-yellow-500 focus:ring-yellow-500 resize-none text-sm disabled:opacity-50"
                />
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-yellow-700">
                    💡 Hanya visible untuk tim internal
                  </p>
                  <Button
                    size="sm"
                    disabled={loading}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white text-xs px-3 py-1 disabled:bg-gray-300"
                  >
                    {loading ? (
                      <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    ) : (
                    <FileText className="w-3 h-3 mr-1" />
                    )}
                    Simpan
                  </Button>
                </div>
              </div>
            )}

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-gray-50 to-white">
              {loading ? (
                <MessagesSkeleton />
              ) : messages.length === 0 ? (
                <EmptyMessages />
              ) : (
                messages.map((message) => {
                  const isAgent = message.sender_type === 'agent' || message.sender_type === 'bot';
                  const messageContent = message.message_text || message.text || message.content?.text || message.content || 'No content';

                  return (
                <div
                  key={message.id}
                      className={`flex ${isAgent ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-xs lg:max-w-md px-3 py-2 rounded-xl shadow-sm ${
                        isAgent
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white'
                      : 'bg-white text-gray-900 border border-gray-200 shadow-md'
                  }`}>
                        <p className="text-sm leading-relaxed">{messageContent}</p>
                    <div className={`text-xs mt-1.5 flex items-center justify-between ${
                          isAgent ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      <span className="font-medium">
                          {new Date(message.created_at || message.sent_at).toLocaleTimeString('id-ID', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                          {isAgent && (
                        <div className="flex items-center space-x-1">
                            {message.delivered_at && (
                              <CheckCircle className="w-3 h-3" />
                            )}
                            {message.is_read && (
                              <Eye className="w-3 h-3" />
                            )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Replies */}
            <div className="px-4 py-2 bg-gradient-to-r from-gray-50 to-blue-50 border-t border-gray-200">
              <div className="flex items-center space-x-2 mb-1">
                <Zap className="w-3 h-3 text-blue-600" />
                <span className="text-xs font-medium text-gray-700">Quick Replies</span>
              </div>
              <div className="flex space-x-1 overflow-x-auto pb-1">
                {quickReplies.map((reply, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    disabled={sendingMessage}
                    className="whitespace-nowrap text-xs px-2 py-1 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-all duration-200 disabled:opacity-50"
                    onClick={() => setMessageText(reply)}
                  >
                    {reply}
                  </Button>
                ))}
              </div>
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200 bg-white shadow-sm">
              <div className="flex items-end space-x-2">
                <div className="flex-1">
                  <Textarea
                    value={messageText}
                    onChange={(e) => {
                      setMessageText(e.target.value);
                      if (e.target.value.length > 0) {
                        handleTypingStart();
                        // Clear previous timeout
                        if (typingTimeoutRef.current) {
                          clearTimeout(typingTimeoutRef.current);
                        }
                        // Set new timeout to stop typing
                        typingTimeoutRef.current = setTimeout(() => {
                          handleTypingStop();
                        }, 1000);
                      } else {
                        handleTypingStop();
                      }
                    }}
                    onKeyPress={handleKeyPress}
                    placeholder="Ketik pesan..."
                    rows={2}
                    disabled={sendingMessage}
                    className="resize-none border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm disabled:opacity-50"
                  />
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-gray-500">
                      💡 Quick replies untuk respon cepat
                    </p>
                    <div className="text-xs text-gray-500">
                      Enter untuk kirim
                    </div>
                  </div>
                </div>
                <div className="flex flex-col space-y-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={loading}
                    className="hover:bg-gray-100 hover:text-gray-700 p-2 disabled:opacity-50"
                    title="Attach file"
                  >
                    <Paperclip className="w-3 h-3" />
                  </Button>
                  <Button
                    onClick={handleSendMessage}
                    disabled={!messageText.trim() || sendingMessage}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed p-2"
                    title="Send message"
                  >
                    {sendingMessage ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                    <Send className="w-3 h-3" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Pilih Chat Session</h3>
              <p className="text-gray-600">Pilih chat dari antrian untuk mulai membantu customer</p>
              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center">
                    <AlertCircle className="w-4 h-4 text-red-600 mr-2" />
                    <span className="text-sm text-red-700">{error}</span>
              </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Right Panel - Context & Help */}
      <div className="w-64 bg-white border-l border-gray-200 shadow-sm flex-shrink-0">
        <Tabs value={contextTab} onValueChange={setContextTab} className="h-full flex flex-col">
          <div className="p-2.5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50 flex-shrink-0">
            <h3 className="text-xs font-semibold text-gray-700 mb-1.5">Context & Help</h3>
            <TabsList className="grid w-full grid-cols-3 p-1 bg-white border border-gray-200">
              <TabsTrigger value="customer-info" className="text-xs data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700">
                Customer
              </TabsTrigger>
              <TabsTrigger value="knowledge" className="text-xs data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700">
                Knowledge
              </TabsTrigger>
              <TabsTrigger value="history" className="text-xs data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700">
                History
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Customer Info Tab */}
          <TabsContent value="customer-info" className="flex-1 overflow-y-auto p-2.5 pt-0">
            {selectedSession ? (
              <div className="space-y-2.5">
                {/* Customer Details */}
                <Card className="border-gray-200 hover:shadow-sm transition-shadow">
                  <CardHeader className="pb-1.5">
                    <CardTitle className="text-xs font-semibold text-gray-800">Customer Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2.5">
                    <div className="flex items-center space-x-2">
                      <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold text-xs flex-shrink-0">
                        {(selectedSession.customer.name || selectedSession.customer.first_name || 'C').charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-gray-900 text-xs truncate">{selectedSession.customer.name || `${selectedSession.customer.first_name || ''} ${selectedSession.customer.last_name || ''}`.trim()}</h3>
                        <p className="text-xs text-gray-600 truncate">{selectedSession.customer.email}</p>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs">
                      <div className="flex items-center space-x-2 p-1 bg-gray-50 rounded-lg">
                        <Building className="w-3 h-3 text-blue-600 flex-shrink-0" />
                        <span className="text-gray-700 font-medium truncate">{selectedSession.customer.profile_data?.company_name || 'No company'}</span>
                      </div>
                      <div className="flex items-center space-x-2 p-1 bg-gray-50 rounded-lg">
                        <Phone className="w-3 h-3 text-green-600 flex-shrink-0" />
                        <span className="text-gray-700 font-medium truncate">{selectedSession.customer.phone || 'No phone'}</span>
                      </div>
                      <div className="flex items-center space-x-2 p-1 bg-gray-50 rounded-lg">
                        <Calendar className="w-3 h-3 text-purple-600 flex-shrink-0" />
                        <span className="text-gray-700 font-medium truncate">
                          Member since {new Date(selectedSession.customer.created_at).toLocaleDateString('id-ID')}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Plan & Stats */}
                <Card className="border-gray-200 hover:shadow-sm transition-shadow">
                  <CardHeader className="pb-1.5">
                    <CardTitle className="text-xs font-semibold text-gray-800">Plan & Statistics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1.5">
                    <div className="flex items-center justify-between p-1 bg-blue-50 rounded-lg">
                      <span className="text-xs text-blue-700 font-medium truncate">Current Plan</span>
                      <Badge variant="blue" className="px-1 py-0.5 text-xs flex-shrink-0">{selectedSession.customer.profile_data?.company_size || 'Unknown'}</Badge>
                    </div>
                    <div className="flex items-center justify-between p-1 bg-green-50 rounded-lg">
                      <span className="text-xs text-green-700 font-medium truncate">Total Sessions</span>
                      <span className="text-xs font-bold text-green-700 flex-shrink-0">{selectedSession.customer.total_interactions || 0}</span>
                    </div>
                    <div className="flex items-center justify-between p-1 bg-yellow-50 rounded-lg">
                      <span className="text-xs text-yellow-700 font-medium truncate">Avg Rating</span>
                      <div className="flex items-center space-x-1 flex-shrink-0">
                        <Star className="w-3 h-3 text-yellow-500 fill-current" />
                        <span className="text-xs font-bold text-yellow-700">{selectedSession.customer.satisfaction_score || 'N/A'}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-1 bg-purple-50 rounded-lg">
                      <span className="text-xs text-purple-700 font-medium truncate">Last Activity</span>
                      <span className="text-xs font-bold text-purple-700 flex-shrink-0">
                        {new Date(selectedSession.customer.last_interaction_at || selectedSession.customer.created_at).toLocaleDateString('id-ID')}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {/* Session Tags */}
                <Card className="border-gray-200 hover:shadow-sm transition-shadow">
                  <CardHeader className="pb-1.5">
                    <CardTitle className="text-xs font-semibold text-gray-800">Session Tags</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-1">
                      {(selectedSession.tags || []).map(tag => (
                        <Badge key={tag} variant="gray" className="text-xs px-1 py-0.5 bg-gray-100 text-gray-700 border-gray-200">
                          {tag}
                        </Badge>
                      ))}
                      <Button variant="ghost" size="sm" className="h-4 px-1 hover:bg-gray-100 hover:text-gray-700">
                        <Plus className="w-2.5 h-2.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <Info className="w-6 h-6 mx-auto mb-1 text-gray-400" />
                  <p className="text-xs">Pilih chat untuk melihat info customer</p>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Knowledge Base Tab */}
          <TabsContent value="knowledge" className="flex-1 overflow-y-auto p-2.5 pt-0">
            <div className="space-y-2.5">
              <div className="relative">
                <Search className="absolute left-2 top-2 h-3 w-3 text-gray-400" />
                <Input
                  placeholder="Cari knowledge..."
                  disabled={knowledgeLoading}
                  className="pl-7 h-7 text-xs border-gray-300 focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50"
                />
              </div>

              <div className="space-y-1.5">
                {knowledgeLoading ? (
                  <KnowledgeSkeleton />
                ) : (knowledgeArticles?.data || []).length === 0 ? (
                  <EmptyKnowledge />
                ) : (
                  (knowledgeArticles?.data || []).map((article) => (
                    <Card
                      key={article.id}
                      className="p-2.5 hover:shadow-md cursor-pointer transition-all duration-200 border-gray-200 hover:border-blue-300 disabled:opacity-50"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-semibold text-gray-900 mb-1 truncate">{article.name || article.title}</h4>
                          <div className="flex items-center space-x-1">
                            <Badge variant="blue" className="text-xs px-1 py-0.5">
                              {article.category || 'general'}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {article.relevance || 0}%
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1 flex-shrink-0">
                          <BookOpen className="w-3 h-3 text-blue-600" />
                          <Badge variant="green" className="text-xs px-1 py-0.5">
                            {article.relevance || 0}%
                          </Badge>
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="flex-1 overflow-y-auto p-2.5 pt-0">
            {selectedSession ? (
              <div className="space-y-1.5">
                {historyLoading ? (
                  <HistorySkeleton />
                ) : (customerHistory?.data || []).length === 0 ? (
                  <EmptyHistory />
                ) : (
                  (customerHistory?.data || []).map((item) => (
                    <Card
                      key={item.id}
                      className="p-2.5 hover:shadow-sm transition-shadow border-gray-200 disabled:opacity-50"
                    >
                      <div className="flex items-start justify-between mb-1.5">
                        <div className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${
                            item.type === 'chat' ? 'bg-blue-500' :
                            item.type === 'email' ? 'bg-green-500' : 'bg-purple-500'
                          }`}></div>
                          <span className="text-xs font-medium text-gray-600">
                            {new Date(item.created_at || item.date).toLocaleDateString('id-ID')}
                          </span>
                        </div>
                        {item.rating && (
                          <div className="flex items-center space-x-1 flex-shrink-0">
                            <Star className="w-3 h-3 text-yellow-500 fill-current" />
                            <span className="text-xs font-medium text-yellow-700">{item.rating}</span>
                          </div>
                        )}
                      </div>
                      <h4 className="text-xs font-semibold text-gray-900 mb-1 truncate">{item.summary || item.description || 'No summary'}</h4>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-600 truncate">by {item.agent?.name || item.agent || 'System'}</p>
                        <Badge variant="gray" className="text-xs px-1 py-0.5 bg-gray-100 text-gray-700 flex-shrink-0">
                          {item.type || 'unknown'}
                        </Badge>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <History className="w-5 h-5 mx-auto mb-1 text-gray-400" />
                  <p className="text-xs">Pilih chat untuk melihat history</p>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
    </ErrorBoundary>
  );
};

export default AgentInbox;
