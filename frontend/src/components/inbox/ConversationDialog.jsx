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
  BarChart3,
  Sparkles
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
      const loadedMessages = messagesData.data?.messages?.data || [];
      // console.log('📨 Loaded messages:', loadedMessages);
      setMessages(loadedMessages);
    }
  }, [messagesData]);

  useEffect(() => {
    // Auto-scroll to bottom when messages change
    setTimeout(() => {
      scrollToBottom();
    }, 100);
  }, [messages]);

  // Register real-time message handlers
  useEffect(() => {
    if (!session?.id) return;

    // console.log('🔗 Registering message handler for session:', session.id);

    const unregisterMessage = registerMessageHandler(session.id, (data) => {
      // console.log('🔔 ConversationDialog received data:', data);

      // Handle different message types and events
      if (data.type === 'message' ||
          data.event === 'message.processed' ||
          data.event === 'message.sent' ||
          data.event === 'MessageSent' ||
          data.event === 'MessageProcessed' ||
          data.message_id) {

        // console.log('📨 Processing message event:', data.event || data.type, data);

        // For message.processed event, we need to fetch the full message data
        if (data.event === 'message.processed' ||
            data.event === 'MessageProcessed' ||
            data.message_id) {

          // Add the new message from WAHA to the messages list
          const newMessage = {
            id: data.message_id || data.id,
            sender_type: data.sender_type || (data.from_me ? 'agent' : 'customer'),
            sender_name: data.sender_name || (data.from_me ? 'You' : 'Customer'),
            message_text: data.message_content || data.content || data.text || data.body,
            text: data.message_content || data.content || data.text || data.body, // For compatibility
            content: { text: data.message_content || data.content || data.text || data.body },
            message_type: data.message_type || data.type || 'text',
            media_url: data.media_url,
            media_type: data.media_type,
            is_read: data.is_read || false,
            delivered_at: data.delivered_at,
            created_at: data.sent_at || data.timestamp || data.created_at || new Date().toISOString(),
            sent_at: data.sent_at || data.timestamp || data.created_at || new Date().toISOString()
          };

          // console.log('📝 Formatted new message:', newMessage);

          setMessages(prev => {
            // Check if message already exists to avoid duplicates
            const exists = prev.some(msg => msg.id === newMessage.id);
            if (exists) {
              // console.log('⚠️ Message already exists, skipping:', newMessage.id);
              return prev;
            }

            // Don't add agent messages from real-time handler to avoid duplicates
            if (newMessage.sender_type === 'agent') {
              // console.log('⚠️ Skipping agent message from real-time handler');
              return prev;
            }

            // Ensure customer messages are properly identified
            if (!newMessage.sender_type || newMessage.sender_type === 'customer') {
              newMessage.sender_type = 'customer';
              newMessage.sender_name = newMessage.sender_name || 'Customer';
            }

            // Add new message and sort by created_at
            const updatedMessages = [...prev, newMessage];
            const sortedMessages = updatedMessages.sort((a, b) =>
              new Date(a.created_at || a.sent_at) - new Date(b.created_at || b.sent_at)
            );

            // console.log('✅ Added new message to conversation:', newMessage.sender_type, newMessage.message_text);

            // Show notification for new message from customer
            if (newMessage.sender_type === 'customer') {
              // console.log('🔔 New message from customer:', newMessage.message_text);
              // Auto-scroll to bottom when new customer message arrives
              setTimeout(() => {
                scrollToBottom();
              }, 100);
              // You can add a toast notification here if needed
            }

            return sortedMessages;
          });
        } else {
          // Handle regular message type
          // console.log('📨 Handling regular message type:', data);

          // Format the message data to ensure consistency
          const formattedMessage = {
            id: data.id || `msg-${Date.now()}`,
            sender_type: data.sender_type || (data.from_me ? 'agent' : 'customer'),
            sender_name: data.sender_name || (data.from_me ? 'You' : 'Customer'),
            message_text: data.content || data.text || data.body || data.message,
            text: data.content || data.text || data.body || data.message,
            content: { text: data.content || data.text || data.body || data.message },
            message_type: data.type || 'text',
            is_read: data.is_read || false,
            created_at: data.timestamp || data.created_at || new Date().toISOString(),
            sent_at: data.timestamp || data.created_at || new Date().toISOString(),
            ...data // Include any additional properties
          };

          setMessages(prev => {
            // Check if message already exists to avoid duplicates
            const exists = prev.some(msg => msg.id === formattedMessage.id);
            if (exists) {
              // console.log('⚠️ Regular message already exists, skipping:', formattedMessage.id);
              return prev;
            }

            // console.log('✅ Added regular message to conversation:', formattedMessage.sender_type, formattedMessage.message_text);

            // Auto-scroll to bottom when new customer message arrives
            if (formattedMessage.sender_type === 'customer') {
              setTimeout(() => {
                scrollToBottom();
              }, 100);
            }

            return [...prev, formattedMessage];
          });
        }
      } else if (data.type === 'message_read' || data.event === 'message.read') {
        // console.log('📖 Message read event:', data);
        setMessages(prev => prev.map(msg =>
          msg.id === data.message_id
            ? { ...msg, is_read: true, read_at: data.read_at }
            : msg
        ));
      } else {
        // console.log('❓ Unknown message event type:', data.type || data.event, data);
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
      // console.log('🔌 Unregistering message handler for session:', session.id);
      unregisterMessage();
      unregisterTyping();
    };
  }, [session?.id, registerMessageHandler, registerTypingHandler]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !session || sending) return;

    setSending(true);
    try {
      const response = await inboxService.sendMessage(session.id, newMessage.trim());

      if (response.success) {
        setNewMessage('');
        // Add message to local state immediately for better UX
        const agentMessage = {
          id: response.data.id || `agent-${Date.now()}`,
          sender_type: 'agent',
          sender_name: 'You',
          message_text: newMessage.trim(),
          text: newMessage.trim(),
          content: { text: newMessage.trim() },
          message_type: 'text',
          is_read: true,
          created_at: new Date().toISOString(),
          sent_at: new Date().toISOString()
        };
        // console.log('📤 Sending agent message:', agentMessage);
        setMessages(prev => {
          const updated = [...prev, agentMessage];
          // console.log('📨 Updated messages after sending:', updated);
          return updated;
        });

        // Auto-scroll to bottom after sending message
        setTimeout(() => {
          scrollToBottom();
        }, 100);

        onSendMessage?.(agentMessage);
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

  const getTemplateIndicator = (message) => {
    if (message.sender_type !== 'bot' || !message.metadata) return null;

    const { template_used, ai_model, conversation_template_applied } = message.metadata;

    if (conversation_template_applied && template_used) {
      return (
        <div className="flex items-center text-xs text-purple-600 mt-1">
          <Sparkles className="h-3 w-3 mr-1" />
          {template_used === 'greeting_message' ? 'Template: Greeting' :
           template_used === 'response_template' ? 'Template: Response' :
           'Template Used'}
        </div>
      );
    }

    if (ai_model && ai_model !== 'conversation_template') {
      return (
        <div className="flex items-center text-xs text-purple-600 mt-1">
          <Bot className="h-3 w-3 mr-1" />
          AI Generated
        </div>
      );
    }

    return null;
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
      <DialogContent className="max-w-6xl h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 py-5 border-b bg-gray-50/50 flex-shrink-0">
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

        <div className="flex-1 flex overflow-hidden min-h-0">
          {/* Main Content */}
          <div className="flex-1 flex flex-col min-h-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
              <TabsList className="mx-6 mt-4 flex-shrink-0">
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
              <TabsContent value="messages" className="flex-1 flex flex-col px-6 py-5 min-h-0">
                <ScrollArea className="flex-1 pr-4 min-h-0">
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
                    <div className="space-y-6">
                      {messages.map((message, index) => (
                        <div
                          key={message.id || `message-${index}`}
                          className={`flex ${message.sender_type === 'agent' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`flex items-start space-x-3 max-w-[70%] ${message.sender_type === 'agent' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                            {/* Avatar - only for incoming messages */}
                            {message.sender_type !== 'agent' && (
                              <Avatar className="h-8 w-8 flex-shrink-0">
                                <AvatarFallback className={`text-xs ${getSenderColor(message.sender_type)}`}>
                                  {getSenderIcon(message.sender_type)}
                                </AvatarFallback>
                              </Avatar>
                            )}

                            {/* Message Content */}
                            <div className={`flex flex-col space-y-1 ${message.sender_type === 'agent' ? 'items-end' : 'items-start'}`}>
                              {/* Sender Info */}
                              <div className={`flex items-center space-x-2 ${message.sender_type === 'agent' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                                <span className="text-xs font-medium text-gray-600">
                                  {message.sender_type === 'agent'
                                    ? 'You'
                                    : message.sender_type === 'bot'
                                    ? 'Bot'
                                    : message.sender_name || 'Customer'
                                  }
                                </span>
                                <span className="text-xs text-gray-400">
                                  {formatMessageTime(message.created_at)}
                                </span>
                              </div>

                              {/* Message Bubble */}
                              <div className={`relative rounded-2xl px-4 py-3 shadow-sm ${
                                message.sender_type === 'agent'
                                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-md'
                                  : message.sender_type === 'bot'
                                  ? 'bg-gradient-to-r from-purple-100 to-purple-50 text-purple-800 border border-purple-200 rounded-bl-md'
                                  : 'bg-white text-gray-800 border border-gray-200 rounded-bl-md'
                              }`}>
                                {/* Message Text */}
                                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                                  {message.text || message.message_text || message.content?.text}
                                </p>

                                {/* Template Indicator for Bot Messages */}
                                {message.sender_type === 'bot' && getTemplateIndicator(message)}

                                {/* Message Status for Agent Messages */}
                                {message.sender_type === 'agent' && (
                                  <div className="flex items-center justify-end mt-2">
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
                          <div className="flex items-start space-x-3">
                            <Avatar className="h-8 w-8 flex-shrink-0">
                              <AvatarFallback className="text-xs bg-gray-200 text-gray-600">
                                <User className="h-4 w-4" />
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col space-y-1">
                              <div className="flex items-center space-x-2">
                                <span className="text-xs font-medium text-gray-600">
                                  {typingUsers.join(', ')}
                                </span>
                                <span className="text-xs text-gray-400">
                                  {typingUsers.length === 1 ? 'is' : 'are'} typing...
                                </span>
                              </div>
                              <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                                <div className="flex items-center space-x-1">
                                  <div className="flex space-x-1">
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </ScrollArea>

                {/* Message Input */}
                <div className="border-t bg-gray-50/50 pt-4 mt-5 flex-shrink-0">
                  <div className="flex items-end space-x-3">
                    <div className="flex-1">
                      <div className="relative">
                        <Textarea
                          placeholder="Type a message..."
                          value={newMessage}
                          onChange={handleTyping}
                          onKeyPress={handleKeyPress}
                          className="min-h-[44px] max-h-32 resize-none rounded-2xl border-gray-200 bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                          disabled={sending}
                        />
                        <div className="absolute right-3 bottom-3 flex items-center space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 hover:bg-gray-100"
                          >
                            <Paperclip className="h-4 w-4 text-gray-500" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 hover:bg-gray-100"
                          >
                            <Smile className="h-4 w-4 text-gray-500" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    <Button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim() || sending}
                      size="sm"
                      className="h-11 w-11 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {sending ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </TabsContent>

              {/* Details Tab */}
              <TabsContent value="details" className="flex-1 px-6 py-5 min-h-0 overflow-y-auto">
                <div className="space-y-6">
                  {/* Header Section */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-16 w-16 border-4 border-white shadow-lg">
                        <AvatarImage src={session.customer?.avatar_url} />
                        <AvatarFallback className="text-lg font-semibold bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                          {session.customer?.name?.charAt(0) || 'C'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h2 className="text-2xl font-bold text-gray-900">
                          {session.customer?.name || 'Unknown Customer'}
                        </h2>
                        <p className="text-gray-600 mt-1">{session.customer?.email || 'No email provided'}</p>
                        <div className="flex items-center space-x-3 mt-3">
                          <Badge variant="outline" className="bg-white">
                            {session.customer?.channel || 'Unknown Channel'}
                          </Badge>
                          <Badge variant={session.is_active ? 'default' : 'secondary'}>
                            {session.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                          {session.priority && (
                            <Badge variant="outline" className="bg-white">
                              {session.priority}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Information Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Customer Information */}
                    <Card className="border-0 shadow-lg">
                      <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-t-lg">
                        <CardTitle className="text-lg flex items-center space-x-2">
                          <User className="h-5 w-5 text-blue-600" />
                          <span>Customer Information</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-6 space-y-4">
                        <div className="space-y-3">
                          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                            <Building className="h-5 w-5 text-gray-500" />
                            <div>
                              <p className="text-sm font-medium text-gray-500">Company</p>
                              <p className="text-sm text-gray-900">{session.customer?.company || 'Not specified'}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                            <Phone className="h-5 w-5 text-gray-500" />
                            <div>
                              <p className="text-sm font-medium text-gray-500">Phone</p>
                              <p className="text-sm text-gray-900">{session.customer?.phone || 'Not provided'}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                            <Calendar className="h-5 w-5 text-gray-500" />
                            <div>
                              <p className="text-sm font-medium text-gray-500">Customer Since</p>
                              <p className="text-sm text-gray-900">{formatTimeAgo(session.customer?.created_at)}</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Session Information */}
                    <Card className="border-0 shadow-lg">
                      <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-t-lg">
                        <CardTitle className="text-lg flex items-center space-x-2">
                          <MessageSquare className="h-5 w-5 text-green-600" />
                          <span>Session Information</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-6 space-y-4">
                        <div className="grid grid-cols-1 gap-3">
                          <div className="p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm font-medium text-gray-500">Session ID</p>
                            <p className="text-sm font-mono text-gray-900 break-all">{session.id}</p>
                          </div>
                          <div className="p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm font-medium text-gray-500">Session Type</p>
                            <p className="text-sm capitalize text-gray-900">{session.session_type}</p>
                          </div>
                          <div className="p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm font-medium text-gray-500">Started</p>
                            <p className="text-sm text-gray-900">{formatTimeAgo(session.started_at)}</p>
                          </div>
                          <div className="p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm font-medium text-gray-500">Last Activity</p>
                            <p className="text-sm text-gray-900">{formatTimeAgo(session.last_activity_at)}</p>
                          </div>
                        </div>

                        {session.tags && session.tags.length > 0 && (
                          <div className="pt-4 border-t">
                            <p className="text-sm font-medium text-gray-500 mb-3">Tags</p>
                            <div className="flex flex-wrap gap-2">
                              {session.tags.map((tag, index) => (
                                <Badge key={`tag-${index}-${tag}`} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                  <Tag className="h-3 w-3 mr-1" />
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Conversation Template Information */}
                    {session.metadata?.conversation_template && (
                      <Card className="border-0 shadow-lg">
                        <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-t-lg">
                          <CardTitle className="text-lg flex items-center space-x-2">
                            <Sparkles className="h-5 w-5 text-purple-600" />
                            <span>Conversation Template</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                          <div className="space-y-3">
                            <div className="p-3 bg-purple-50 rounded-lg">
                              <p className="text-sm font-medium text-purple-700">Template Applied</p>
                              <p className="text-sm text-purple-900">
                                {session.metadata.template_applied ? 'Yes' : 'No'}
                              </p>
                            </div>

                            {session.metadata.conversation_template.language && (
                              <div className="p-3 bg-purple-50 rounded-lg">
                                <p className="text-sm font-medium text-purple-700">Language</p>
                                <p className="text-sm text-purple-900 capitalize">
                                  {session.metadata.conversation_template.language}
                                </p>
                              </div>
                            )}

                            {session.metadata.conversation_template.tone && (
                              <div className="p-3 bg-purple-50 rounded-lg">
                                <p className="text-sm font-medium text-purple-700">Tone</p>
                                <p className="text-sm text-purple-900 capitalize">
                                  {session.metadata.conversation_template.tone}
                                </p>
                              </div>
                            )}

                            {session.metadata.conversation_template.communication_style && (
                              <div className="p-3 bg-purple-50 rounded-lg">
                                <p className="text-sm font-medium text-purple-700">Communication Style</p>
                                <p className="text-sm text-purple-900 capitalize">
                                  {session.metadata.conversation_template.communication_style}
                                </p>
                              </div>
                            )}

                            {session.metadata.conversation_template.greeting_message && (
                              <div className="p-3 bg-purple-50 rounded-lg">
                                <p className="text-sm font-medium text-purple-700">Greeting Message</p>
                                <p className="text-sm text-purple-900 italic">
                                  &ldquo;{session.metadata.conversation_template.greeting_message}&rdquo;
                                </p>
                              </div>
                            )}

                            {session.metadata.conversation_template.response_templates &&
                             Object.keys(session.metadata.conversation_template.response_templates).length > 0 && (
                              <div className="p-3 bg-purple-50 rounded-lg">
                                <p className="text-sm font-medium text-purple-700">Response Templates</p>
                                <p className="text-sm text-purple-900">
                                  {Object.keys(session.metadata.conversation_template.response_templates).length} templates available
                                </p>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>
              </TabsContent>

              {/* Analytics Tab */}
              <TabsContent value="analytics" className="flex-1 p-6 pt-4 min-h-0 overflow-y-auto">
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

                    {/* Template Usage Analytics */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center space-x-2">
                          <Sparkles className="h-5 w-5 text-purple-600" />
                          <span>Template Usage</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex justify-between">
                          <span className="text-sm">Template Applied</span>
                          <Badge variant={session.metadata?.template_applied ? 'default' : 'secondary'}>
                            {session.metadata?.template_applied ? 'Yes' : 'No'}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Greeting Used</span>
                          <span className="font-semibold">
                            {messages.some(m => m.metadata?.template_used === 'greeting_message') ? 'Yes' : 'No'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Response Templates Used</span>
                          <span className="font-semibold">
                            {messages.filter(m => m.metadata?.template_used === 'response_template').length}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">AI Generated</span>
                          <span className="font-semibold">
                            {messages.filter(m => m.metadata?.ai_model && m.metadata?.ai_model !== 'conversation_template').length}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Template Success Rate</span>
                          <span className="font-semibold">
                            {(() => {
                              const templateMessages = messages.filter(m => m.sender_type === 'bot' && m.metadata?.conversation_template_applied);
                              const totalBotMessages = messages.filter(m => m.sender_type === 'bot').length;
                              if (totalBotMessages === 0) return 'N/A';
                              return `${Math.round((templateMessages.length / totalBotMessages) * 100)}%`;
                            })()}
                          </span>
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
