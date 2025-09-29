import { useState, useEffect, useRef } from 'react';
import {
  Send,
  Paperclip,
  Smile,
  MoreVertical,
  Phone,
  Info,
  Archive,
  Flag,
  User,
  Bot,
  Check,
  CheckCheck,
  MessageSquare,
  ArrowRightLeft,
  CheckCircle,
  Star,
  Building,
  Calendar,
  Tag,
  BarChart3
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
  Separator,
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
import { useRealtimeMessages } from '@/hooks/useRealtimeMessages';

const ConversationDialog = ({
  session,
  isOpen,
  onClose,
  onSendMessage,
  onAssignConversation,
  onResolveConversation,
  onTransferSession
}) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [typingUsers, setTypingUsers] = useState([]);
  const [sending, setSending] = useState(false);
  const [activeTab, setActiveTab] = useState('messages');
  const [showTransferDialog, setShowTransferDialog] = useState(false);
  const [showResolveDialog, setShowResolveDialog] = useState(false);
  const [transferData, setTransferData] = useState({ agent_id: '', reason: '' });
  const [resolveData, setResolveData] = useState({ resolution_type: 'resolved', notes: '' });
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Real-time messaging
  const {
    isConnected,
    registerMessageHandler,
    registerTypingHandler,
    sendTyping
  } = useRealtimeMessages();

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
      setMessages(messagesData.data?.messages?.data || []);
    }
  }, [messagesData]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Register real-time message handlers
  useEffect(() => {
    if (!session?.id) return;

    const unregisterMessage = registerMessageHandler(session.id, (data) => {
      if (data.type === 'message') {
        setMessages(prev => {
          // Check if message already exists to avoid duplicates
          const exists = prev.some(msg => msg.id === data.id);
          if (exists) return prev;

          return [...prev, data];
        });
      } else if (data.type === 'message_read') {
        setMessages(prev => prev.map(msg =>
          msg.id === data.message_id
            ? { ...msg, is_read: true, read_at: data.read_at }
            : msg
        ));
      }
    });

    const unregisterTyping = registerTypingHandler(session.id, (data) => {
      setTypingUsers(prev => {
        if (data.is_typing) {
          return [...prev.filter(user => user !== data.user_name), data.user_name];
        } else {
          return prev.filter(user => user !== data.user_name);
        }
      });
    });

    return () => {
      unregisterMessage();
      unregisterTyping();
    };
  }, [session?.id, registerMessageHandler, registerTypingHandler]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !session || sending) return;

    setSending(true);
    try {
      const response = await inboxService.sendMessage(session.id, newMessage.trim());

      if (response.success) {
        setNewMessage('');
        // Add message to local state immediately for better UX
        setMessages(prev => [...prev, response.data]);
        onSendMessage?.(response.data);
      } else {
        throw new Error(response.error || 'Failed to send message');
      }
    } catch (error) {
      // Handle error - could show toast notification
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

    // Send typing indicator to other users
    if (session?.id) {
      sendTyping(session.id, true);
    }

    // Clear typing indicator after 3 seconds of no typing
    typingTimeoutRef.current = setTimeout(() => {
      if (session?.id) {
        sendTyping(session.id, false);
      }
    }, 3000);
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
      // Handle error
    }
  };

  const handleResolve = async () => {
    try {
      const response = await inboxService.endSession(session.id, resolveData);
      if (response.success) {
        setShowResolveDialog(false);
        setResolveData({ resolution_type: 'resolved', notes: '' });
        onResolveConversation?.(session, resolveData);
      }
    } catch (error) {
      // Handle error
    }
  };

  const getMessageStatus = (message) => {
    if (message.sender_type !== 'agent') return null;

    if (message.is_read) {
      return <CheckCheck className="h-4 w-4 text-blue-500" />;
    } else if (message.delivered_at) {
      return <CheckCheck className="h-4 w-4 text-gray-400" />;
    } else {
      return <Check className="h-4 w-4 text-gray-400" />;
    }
  };

  const formatMessageTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getSenderIcon = (senderType) => {
    switch (senderType) {
      case 'agent':
        return <User className="h-4 w-4" />;
      case 'bot':
        return <Bot className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getSenderColor = (senderType) => {
    switch (senderType) {
      case 'agent':
        return 'bg-blue-500 text-white';
      case 'bot':
        return 'bg-purple-500 text-white';
      case 'customer':
        return 'bg-gray-200 text-gray-800';
      default:
        return 'bg-gray-200 text-gray-800';
    }
  };

  const formatTimeAgo = (date) => {
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
  };

  if (!session) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 py-5 border-b bg-gray-50/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {/* Connection Status Indicator */}
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}
                   title={isConnected ? 'Connected' : 'Disconnected'} />
              <Avatar className="h-12 w-12">
                <AvatarImage src={session.customer?.avatar_url} />
                <AvatarFallback>
                  {session.customer?.name?.charAt(0) || 'C'}
                </AvatarFallback>
              </Avatar>
              <div>
                <DialogTitle className="text-xl">
                  {session.customer?.name || 'Unknown Customer'}
                </DialogTitle>
                <div className="flex items-center space-x-2 mt-1">
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
              {!session.agent && (
                <Button
                  size="sm"
                  onClick={() => onAssignConversation?.(session)}
                >
                  Assign to Me
                </Button>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setShowTransferDialog(true)}>
                    <ArrowRightLeft className="h-4 w-4 mr-2" />
                    Transfer Session
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowResolveDialog(true)}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Resolve Session
                  </DropdownMenuItem>
                  <Separator />
                  <DropdownMenuItem>
                    <Archive className="h-4 w-4 mr-2" />
                    Archive
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Flag className="h-4 w-4 mr-2" />
                    Flag
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 flex overflow-hidden">
          {/* Main Content */}
          <div className="flex-1 flex flex-col">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
              <TabsList className="mx-6 mt-4">
                <TabsTrigger value="messages" className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Messages
                </TabsTrigger>
                <TabsTrigger value="details" className="flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  Details
                </TabsTrigger>
                <TabsTrigger value="analytics" className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Analytics
                </TabsTrigger>
              </TabsList>

              {/* Messages Tab */}
              <TabsContent value="messages" className="flex-1 flex flex-col px-6 py-5">
                <ScrollArea className="flex-1 pr-4">
                  {messagesLoading ? (
                    <div className="flex items-center justify-center h-32">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                      <span className="ml-2">Loading messages...</span>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex items-center justify-center h-32 text-gray-500">
                      <p>No messages yet. Start the conversation!</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((message, index) => (
                        <div
                          key={message.id || `message-${index}`}
                          className={`flex ${message.sender_type === 'agent' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`flex items-end space-x-2 max-w-xs lg:max-w-md ${message.sender_type === 'agent' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                            {message.sender_type !== 'agent' && (
                              <Avatar className="h-6 w-6">
                                <AvatarFallback className={`text-xs ${getSenderColor(message.sender_type)}`}>
                                  {getSenderIcon(message.sender_type)}
                                </AvatarFallback>
                              </Avatar>
                            )}

                            <div className={`rounded-lg px-3 py-2 ${
                              message.sender_type === 'agent'
                                ? 'bg-blue-500 text-white'
                                : message.sender_type === 'bot'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-gray-200 text-gray-800'
                            }`}>
                              <p className="text-sm">{message.text}</p>

                              <div className={`flex items-center justify-between mt-1 text-xs ${
                                message.sender_type === 'agent' ? 'text-blue-100' : 'text-gray-500'
                              }`}>
                                <span>{formatMessageTime(message.created_at)}</span>
                                {message.sender_type === 'agent' && (
                                  <div className="ml-2">
                                    {getMessageStatus(message)}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Typing Indicator */}
                      {typingUsers.length > 0 && (
                        <div className="flex justify-start">
                          <div className="bg-gray-200 rounded-lg px-3 py-2">
                            <div className="flex items-center space-x-1">
                              <div className="flex space-x-1">
                                <div key="typing-dot-1" className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                <div key="typing-dot-2" className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                <div key="typing-dot-3" className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                              </div>
                              <span className="text-xs text-gray-500 ml-2">
                                {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </ScrollArea>

                {/* Message Input */}
                <div className="border-t pt-5 mt-5">
                  <div className="flex items-end space-x-2">
                    <div className="flex-1">
                      <Textarea
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={handleTyping}
                        onKeyPress={handleKeyPress}
                        className="min-h-[40px] max-h-32 resize-none"
                        disabled={sending}
                      />
                    </div>
                    <div className="flex items-center space-x-1">
                      <Button variant="ghost" size="sm">
                        <Paperclip className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Smile className="h-4 w-4" />
                      </Button>
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
                </div>
              </TabsContent>

              {/* Details Tab */}
              <TabsContent value="details" className="flex-1 px-6 py-5">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Customer Information */}
                  <Card>
                    <CardHeader className="px-6 py-4">
                      <CardTitle className="text-lg">Customer Information</CardTitle>
                    </CardHeader>
                    <CardContent className="px-6 py-4 space-y-4">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={session.customer?.avatar_url} />
                          <AvatarFallback>
                            {session.customer?.name?.charAt(0) || 'C'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold">{session.customer?.name || 'Unknown Customer'}</h3>
                          <p className="text-sm text-gray-500">{session.customer?.email || 'No email'}</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Building className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{session.customer?.company || 'No company'}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{session.customer?.phone || 'No phone'}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">Joined {formatTimeAgo(session.customer?.created_at)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Session Information */}
                  <Card>
                    <CardHeader className="px-6 py-4">
                      <CardTitle className="text-lg">Session Information</CardTitle>
                    </CardHeader>
                    <CardContent className="px-6 py-4 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-500">Session ID</label>
                          <p className="text-sm font-mono">{session.id}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Session Type</label>
                          <p className="text-sm capitalize">{session.session_type}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Started</label>
                          <p className="text-sm">{formatTimeAgo(session.started_at)}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Last Activity</label>
                          <p className="text-sm">{formatTimeAgo(session.last_activity_at)}</p>
                        </div>
                      </div>

                      {session.tags && session.tags.length > 0 && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">Tags</label>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {session.tags.map((tag, index) => (
                              <Badge key={`tag-${index}-${tag}`} variant="outline" className="text-xs">
                                <Tag className="h-3 w-3 mr-1" />
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Analytics Tab */}
              <TabsContent value="analytics" className="flex-1 p-6 pt-4">
                {sessionAnalytics?.success ? (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Message Statistics</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex justify-between">
                          <span className="text-sm">Total Messages</span>
                          <span className="font-semibold">{sessionAnalytics.data.total_messages || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Customer Messages</span>
                          <span className="font-semibold">{sessionAnalytics.data.customer_messages || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Agent Messages</span>
                          <span className="font-semibold">{sessionAnalytics.data.agent_messages || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Bot Messages</span>
                          <span className="font-semibold">{sessionAnalytics.data.bot_messages || 0}</span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Performance</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex justify-between">
                          <span className="text-sm">Avg Response Time</span>
                          <span className="font-semibold">{sessionAnalytics.data.avg_response_time || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Session Duration</span>
                          <span className="font-semibold">{sessionAnalytics.data.session_duration || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Wait Time</span>
                          <span className="font-semibold">{sessionAnalytics.data.wait_time || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Satisfaction</span>
                          <div className="flex items-center space-x-1">
                            <Star className="h-4 w-4 text-yellow-500" />
                            <span className="font-semibold">{sessionAnalytics.data.satisfaction_rating || 'N/A'}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">AI Analysis</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex justify-between">
                          <span className="text-sm">AI Generated</span>
                          <span className="font-semibold">{sessionAnalytics.data.ai_generated_messages || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Media Messages</span>
                          <span className="font-semibold">{sessionAnalytics.data.media_messages || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Handover Count</span>
                          <span className="font-semibold">{sessionAnalytics.data.handover_count || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Resolution</span>
                          <Badge variant={sessionAnalytics.data.is_resolved ? 'default' : 'secondary'}>
                            {sessionAnalytics.data.is_resolved ? 'Resolved' : 'Open'}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-32 text-gray-500">
                    <p>No analytics data available</p>
                  </div>
                )}
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
                <label className="text-sm font-medium">Transfer to Agent ID</label>
                <Input
                  value={transferData.agent_id}
                  onChange={(e) => setTransferData(prev => ({ ...prev, agent_id: e.target.value }))}
                  placeholder="Enter agent ID"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Reason (Optional)</label>
                <Textarea
                  value={transferData.reason}
                  onChange={(e) => setTransferData(prev => ({ ...prev, reason: e.target.value }))}
                  placeholder="Reason for transfer"
                  rows={3}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setShowTransferDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleTransfer} disabled={!transferData.agent_id}>
                Transfer
              </Button>
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
                  <option value="transferred">Transferred</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Resolution Notes</label>
                <Textarea
                  value={resolveData.notes}
                  onChange={(e) => setResolveData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Resolution notes"
                  rows={3}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setShowResolveDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleResolve}>
                Resolve Session
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
};

export default ConversationDialog;
