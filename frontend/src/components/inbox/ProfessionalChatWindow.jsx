import { useState, useRef, useEffect } from 'react';
import {
  Send,
  Paperclip,
  Smile,
  MoreVertical,
  Phone,
  Video,
  Info,
  Check,
  CheckCheck,
  Clock,
  AlertCircle
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { Separator } from '@/components/ui/Separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { useConversation } from '@/hooks/useConversation';
import ConversationSummary from '../conversation/ConversationSummary';
import ConversationSearch from '../conversation/ConversationSearch';
import { cn } from '@/lib/utils';

const ProfessionalChatWindow = ({ sessionId, onClose: _onClose }) => {
  const [messageText, setMessageText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [activeTab, setActiveTab] = useState('chat'); // chat, summary, search
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const {
    conversation,
    messages,
    summary,
    unreadCount,
    loading,
    error,
    sendMessage,
    markAsRead,
    loadSummary,
    searchMessages,
    // sendTypingIndicator, // Disabled - realtime messaging removed
    clearError,
    // isConnected, // Disabled - realtime messaging removed
    // typingUsers // Disabled - realtime messaging removed
  } = useConversation(sessionId);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Mark messages as read when component mounts
  useEffect(() => {
    if (messages.length > 0) {
      const unreadMessageIds = messages
        .filter(msg => !msg.status?.is_read && msg.sender?.type !== 'agent')
        .map(msg => msg.id);

      if (unreadMessageIds.length > 0) {
        markAsRead(unreadMessageIds);
      }
    }
  }, [messages, markAsRead]);

  // Handle typing indicator
  const handleTyping = (text) => {
    setMessageText(text);

    if (!isTyping && text.length > 0) {
      setIsTyping(true);
      // sendTypingIndicator(true); // Disabled - realtime messaging removed
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      // sendTypingIndicator(false); // Disabled - realtime messaging removed
    }, 1000);
  };

  // Handle send message
  const handleSendMessage = async () => {
    if (!messageText.trim()) return;

    const text = messageText.trim();
    setMessageText('');
    setIsTyping(false);
    // sendTypingIndicator(false); // Disabled - realtime messaging removed

    try {
      const messageData = {
        message_text: text,
        message_type: 'text',
        sender_type: 'agent'
      };
      await sendMessage(messageData);
    } catch (error) {
      // console.error('Failed to send message:', error);
    }
  };

  // Handle key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Get message status icons (proper WhatsApp-like status)
  const getMessageStatusIcons = (message) => {
    // Only show status for non-customer messages
    if (message.sender?.type === 'customer') {
      return null;
    }

    // Debug log
    console.log('getMessageStatusIcons called for message:', {
      id: message.id,
      sender_type: message.sender?.type,
      status: message.status
    });

    // Check if message has status data
    if (!message.status) {
      return <Clock className="w-3 h-3 text-gray-400" />;
    }

    // Failed message
    if (message.status?.failed_at) {
      return <AlertCircle className="w-3 h-3 text-red-500" />;
    }

    // Delivered and read (double checkmark - blue)
    if (message.status?.delivered_at && message.status?.read_at) {
      return <CheckCheck className="w-3 h-3 text-blue-500" />;
    }

    // Delivered but not read (double checkmark - gray)
    if (message.status?.delivered_at) {
      return <CheckCheck className="w-3 h-3 text-gray-400" />;
    }

    // Sent but not delivered (single checkmark)
    if (message.status?.sent_at) {
      return <Check className="w-3 h-3 text-gray-400" />;
    }

    // Default: sending (clock)
    return <Clock className="w-3 h-3 text-gray-400" />;
  };

  // Format message time
  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Get sender avatar
  const getSenderAvatar = (message) => {
    if (message.sender?.type === 'customer') {
      return conversation?.customer?.avatar_url || '/images/default-customer-avatar.png';
    } else if (message.sender?.type === 'agent') {
      return conversation?.agent?.avatar_url || '/images/default-agent-avatar.png';
    }
    return '/images/default-bot-avatar.png';
  };

  // Get sender name
  const getSenderName = (message) => {
    if (message.sender?.type === 'customer') {
      return conversation?.customer?.name || 'Customer';
    } else if (message.sender?.type === 'agent') {
      return conversation?.agent?.name || 'Agent';
    }
    return message.sender?.name || 'Bot';
  };

  if (loading && !conversation) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={clearError} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gray-50">
        <div className="flex items-center space-x-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src={conversation?.customer?.avatar_url} />
            <AvatarFallback>
              {conversation?.customer?.name?.charAt(0) || 'C'}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-gray-900">
              {conversation?.customer?.name || 'Unknown Customer'}
            </h3>
            <div className="flex items-center space-x-2">
              <div className={cn(
                "w-2 h-2 rounded-full",
                // isConnected ? "bg-green-500" : "bg-red-500" // Disabled - realtime messaging removed
                "bg-gray-500" // Default status
              )} />
              <span className="text-sm text-gray-500">
                {/* {isConnected ? 'Online' : 'Offline'} */} {/* Disabled - realtime messaging removed */}
                Status Unknown
              </span>
              {conversation?.session_info?.is_active && (
                <Badge variant="secondary" className="text-xs">
                  Active
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm">
            <Phone className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Video className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Info className="w-4 h-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>View Profile</DropdownMenuItem>
              <DropdownMenuItem>Transfer Chat</DropdownMenuItem>
              <DropdownMenuItem>Resolve Chat</DropdownMenuItem>
              <Separator />
              <DropdownMenuItem className="text-red-600">
                Close Chat
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b bg-white">
        <div className="flex space-x-8 px-4">
          <button
            onClick={() => setActiveTab('chat')}
            className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'chat'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Chat
            {unreadCount > 0 && (
              <span className="ml-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>
          <button
            onClick={() => {
              setActiveTab('summary');
              if (!summary) {
                loadSummary();
              }
            }}
            className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'summary'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Ringkasan
          </button>
          <button
            onClick={() => setActiveTab('search')}
            className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'search'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Cari Pesan
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'chat' && (
        <>
          {/* Messages Area */}
          <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message, _index) => {
            const isCustomer = message.sender?.type === 'customer';
            const isAgent = message.sender?.type === 'agent';

            return (
              <div
                key={message.id}
                className={cn(
                  "flex items-end space-x-2",
                  isCustomer ? "justify-start" : "justify-end"
                )}
              >
                {isCustomer && (
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={getSenderAvatar(message)} />
                    <AvatarFallback>
                      {getSenderName(message).charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                )}

                <div
                  className={cn(
                    "max-w-xs lg:max-w-md px-4 py-2 rounded-2xl",
                    isCustomer
                      ? "bg-gray-100 text-gray-900"
                      : isAgent
                      ? "bg-blue-600 text-white"
                      : "bg-green-600 text-white"
                  )}
                >
                  <p className="text-sm">{message.content?.text}</p>

                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs opacity-70">
                      {formatMessageTime(message.created_at)}
                    </span>
                    {(() => {
                      const statusIcon = getMessageStatusIcons(message);
                      console.log('Rendering status icon for message:', message.id, 'icon:', statusIcon);
                      return statusIcon && (
                        <div key={`status-${message.id}`} className="ml-2">
                          {statusIcon}
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {!isCustomer && (
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={getSenderAvatar(message)} />
                    <AvatarFallback>
                      {getSenderName(message).charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            );
          })}

          {/* Typing Indicator */}
          {typingUsers.length > 0 && (
            <div className="flex items-end space-x-2">
              <Avatar className="w-8 h-8">
                <AvatarFallback>?</AvatarFallback>
              </Avatar>
              <div className="bg-gray-100 px-4 py-2 rounded-2xl">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
        </>
      )}

      {/* Tab Content */}
      {activeTab === 'summary' && (
        <div className="flex-1 p-4">
          <ConversationSummary
            summary={summary}
            loading={loading}
            onRefresh={loadSummary}
          />
        </div>
      )}

      {activeTab === 'search' && (
        <div className="flex-1 p-4">
          <ConversationSearch
            onSearch={searchMessages}
            loading={loading}
          />
        </div>
      )}

      {/* Message Input - Only show for chat tab */}
      {activeTab === 'chat' && (
      <div className="p-4 border-t bg-gray-50">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm">
            <Paperclip className="w-4 h-4" />
          </Button>

          <div className="flex-1 relative">
            <Input
              value={messageText}
              onChange={(e) => handleTyping(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="pr-10"
            />
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 transform -translate-y-1/2"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            >
              <Smile className="w-4 h-4" />
            </Button>
          </div>

          <Button
            onClick={handleSendMessage}
            disabled={!messageText.trim()}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
      )}
    </div>
  );
};

export default ProfessionalChatWindow;
