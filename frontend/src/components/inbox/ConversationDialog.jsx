import { useState, useEffect, useRef } from 'react';
import {
  Send,
  MoreVertical,
  Archive,
  Flag,
  Check,
  CheckCheck,
  MessageSquare,
  ArrowRightLeft,
  CheckCircle
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Button,
  Input,
  Textarea,
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  ScrollArea,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui';
import { inboxService } from '@/services/InboxService';
import { useApi } from '@/hooks/useApi';

const ConversationDialog = ({
  session,
  isOpen,
  onClose,
  onSendMessage,
  onResolveConversation,
  onTransferSession
}) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [typingUsers] = useState([]);
  const [sending, setSending] = useState(false);
  const [activeTab, setActiveTab] = useState('messages');
  const [showTransferDialog, setShowTransferDialog] = useState(false);
  const [showResolveDialog, setShowResolveDialog] = useState(false);
  const [transferData, setTransferData] = useState({ agent_id: '', reason: '' });
  const [resolveData, setResolveData] = useState({ resolution_type: 'resolved', notes: '' });
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Note: Real-time messaging now handled by EchoProvider in main.jsx

  const { data: messagesData, loading: messagesLoading } = useApi(
    () => session ? inboxService.getSessionMessages(session.id) : null,
    [session?.id]
  );

  const { data: sessionAnalytics } = useApi(
    () => session ? inboxService.getSessionAnalytics(session.id) : null,
    [session?.id]
  );

  useEffect(() => {
    if (messagesData?.success) {
      const loadedMessages = messagesData.data?.messages?.data || [];
      setMessages(loadedMessages);
    }
  }, [messagesData]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    setTimeout(() => {
      scrollToBottom();
    }, 100);
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !session?.id) return;

    setSending(true);
    try {
      const response = await inboxService.sendMessage(session.id, newMessage);
      if (response.success) {
        setNewMessage('');
        // Refresh messages
        if (onSendMessage) {
          onSendMessage(session, newMessage);
        }
      }
    } catch (error) {
      // Handle error silently or show user-friendly message
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Note: Typing indicators now handled by EchoProvider
    // Typing functionality will be integrated with Echo in the future
  };

  const handleTransfer = async () => {
    if (!transferData.agent_id) return;

    try {
      const response = await inboxService.transferSession(session.id, transferData);
      if (response.success) {
        setShowTransferDialog(false);
        setTransferData({ agent_id: '', reason: '' });
        onTransferSession?.(session, transferData);
      }
    } catch (error) {
      // Handle error silently or show user-friendly message
    }
  };

  const handleResolve = async () => {
    try {
      const response = await inboxService.resolveSession(session.id, resolveData);
      if (response.success) {
        setShowResolveDialog(false);
        setResolveData({ resolution_type: 'resolved', notes: '' });
        onResolveConversation?.(session, resolveData);
      }
    } catch (error) {
      // Handle error silently or show user-friendly message
    }
  };

  const formatMessageTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatMessageDate = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    }
  };

  if (!session) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 py-5 border-b bg-gray-50/50 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {/* Connection Status Indicator - Now handled by EchoProvider */}
              <div className="w-2 h-2 rounded-full bg-gray-400"
                   title="Connection status managed by EchoProvider" />
              <Avatar className="h-12 w-12">
                <AvatarImage src={session.customer?.avatar_url} />
                <AvatarFallback>
                  {session.customer?.name?.charAt(0) || 'C'}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {session.customer?.name || 'Unknown Customer'}
                </h3>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-xs">
                    {session.customer?.channel || 'Unknown'}
                  </Badge>
                  <Badge variant={session.is_active ? 'default' : 'secondary'} className="text-xs">
                    {session.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                  {session.priority && (
                    <Badge variant="outline" className="text-xs">
                      {session.priority}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setShowTransferDialog(true)}>
                    <ArrowRightLeft className="mr-2 h-4 w-4" />
                    Transfer
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowResolveDialog(true)}>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Resolve
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Archive className="mr-2 h-4 w-4" />
                    Archive
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Flag className="mr-2 h-4 w-4" />
                    Flag
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button variant="ghost" size="sm" onClick={onClose}>
                ×
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 flex overflow-hidden">
          {/* Main Content */}
          <div className="flex-1 flex flex-col">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
              <TabsList className="grid w-full grid-cols-4 mx-6 mt-4">
                <TabsTrigger value="messages">Messages</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
                <TabsTrigger value="info">Info</TabsTrigger>
              </TabsList>

              <TabsContent value="messages" className="flex-1 flex flex-col mt-0">
                {/* Messages Area */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messagesLoading ? (
                      <div className="flex justify-center items-center h-32">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="text-center text-gray-500 py-8">
                        <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>No messages yet</p>
                      </div>
                    ) : (
                      messages.map((message, index) => {
                        const isAgent = message.sender_type === 'agent' || message.sender_type === 'bot';
                        const showDate = index === 0 ||
                          formatMessageDate(message.created_at) !== formatMessageDate(messages[index - 1]?.created_at);

                        return (
                          <div key={message.id}>
                            {showDate && (
                              <div className="text-center text-xs text-gray-500 py-2">
                                {formatMessageDate(message.created_at)}
                              </div>
                            )}
                            <div className={`flex ${isAgent ? 'justify-end' : 'justify-start'}`}>
                              <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                                isAgent
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-gray-100 text-gray-900'
                              }`}>
                                <p className="text-sm">{message.message_text || message.text || message.content?.text || 'No content'}</p>
                                <div className={`text-xs mt-1 flex items-center justify-between ${
                                  isAgent ? 'text-blue-100' : 'text-gray-500'
                                }`}>
                                  <span>{formatMessageTime(message.created_at)}</span>
                                  {isAgent && (
                                    <div className="flex items-center space-x-1">
                                      {message.delivered_at && <Check className="h-3 w-3" />}
                                      {message.is_read && <CheckCheck className="h-3 w-3" />}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}

                    {/* Typing Indicators */}
                    {typingUsers.length > 0 && (
                      <div className="flex justify-start">
                        <div className="max-w-xs lg:max-w-md px-4 py-2 rounded-2xl bg-gray-100">
                          <div className="flex items-center space-x-2">
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            </div>
                            <span className="text-xs text-gray-600">
                              {typingUsers.join(', ')} sedang mengetik...
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Message Input */}
                <div className="p-4 border-t bg-white">
                  <div className="flex items-end space-x-2">
                    <div className="flex-1">
                      <Textarea
                        value={newMessage}
                        onChange={handleTyping}
                        onKeyPress={handleKeyPress}
                        placeholder="Ketik pesan..."
                        rows={2}
                        disabled={sending}
                        className="resize-none"
                      />
                    </div>
                    <Button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim() || sending}
                      size="sm"
                    >
                      {sending ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="analytics" className="flex-1 p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{sessionAnalytics?.data?.total_messages || 0}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Response Time</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{sessionAnalytics?.data?.avg_response_time || '0'}s</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Satisfaction</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{sessionAnalytics?.data?.satisfaction_score || 'N/A'}</div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="history" className="flex-1 p-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Session History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Created</span>
                        <span className="text-sm font-medium">
                          {new Date(session.created_at).toLocaleString('id-ID')}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Last Activity</span>
                        <span className="text-sm font-medium">
                          {new Date(session.updated_at).toLocaleString('id-ID')}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Status</span>
                        <Badge variant={session.is_active ? 'default' : 'secondary'}>
                          {session.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="info" className="flex-1 p-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Session Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Customer</span>
                        <span className="text-sm font-medium">{session.customer?.name || 'Unknown'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Channel</span>
                        <Badge variant="outline">{session.customer?.channel || 'Unknown'}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Priority</span>
                        <Badge variant="outline">{session.priority || 'Normal'}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Assigned Agent</span>
                        <span className="text-sm font-medium">{session.agent?.name || 'Unassigned'}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Transfer Dialog */}
        <Dialog open={showTransferDialog} onOpenChange={setShowTransferDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Transfer Session</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Agent</label>
                <Input
                  value={transferData.agent_id}
                  onChange={(e) => setTransferData(prev => ({ ...prev, agent_id: e.target.value }))}
                  placeholder="Enter agent ID"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Reason</label>
                <Textarea
                  value={transferData.reason}
                  onChange={(e) => setTransferData(prev => ({ ...prev, reason: e.target.value }))}
                  placeholder="Enter transfer reason"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowTransferDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleTransfer}>
                  Transfer
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Resolve Dialog */}
        <Dialog open={showResolveDialog} onOpenChange={setShowResolveDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Resolve Session</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Resolution Type</label>
                <select
                  value={resolveData.resolution_type}
                  onChange={(e) => setResolveData(prev => ({ ...prev, resolution_type: e.target.value }))}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="resolved">Resolved</option>
                  <option value="escalated">Escalated</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Notes</label>
                <Textarea
                  value={resolveData.notes}
                  onChange={(e) => setResolveData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Enter resolution notes"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowResolveDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleResolve}>
                  Resolve
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
};

export default ConversationDialog;
