import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Send, 
  Paperclip, 
  Smile, 
  MoreVertical,
  Phone,
  Video,
  Info,
  Archive,
  Flag,
  User,
  Bot,
  Check,
  CheckCheck,
  Clock,
  AlertCircle
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
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
  Alert,
  AlertDescription,
} from '@/components/ui';
import { inboxService } from '@/services/InboxService';
import { useApi } from '@/hooks/useApi';
import { handleError } from '@/utils/errorHandler';

const ChatWindow = ({ 
  conversation, 
  onSendMessage,
  onAssignConversation,
  onResolveConversation,
  className = "" 
}) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const { data: messagesData, loading: messagesLoading, refetch: refetchMessages } = useApi(
    () => conversation ? inboxService.getSessionMessages(conversation.id) : null,
    [conversation?.id]
  );

  useEffect(() => {
    if (messagesData?.success) {
      setMessages(messagesData.data?.messages?.data || []);
    }
  }, [messagesData]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !conversation || sending) return;

    setSending(true);
    try {
      const response = await inboxService.sendMessage(conversation.id, newMessage.trim());
      
      if (response.success) {
        setNewMessage('');
        // Add message to local state immediately for better UX
        setMessages(prev => [...prev, response.data]);
        onSendMessage?.(response.data);
      } else {
        throw new Error(response.error || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
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
    
    // Set typing indicator
    setIsTyping(true);
    
    // Clear typing indicator after 3 seconds of no typing
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 3000);
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

  if (!conversation) {
    return (
      <Card className={`h-full ${className}`}>
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center text-gray-500">
            <MessageCircle className="h-12 w-12 mx-auto mb-4" />
            <p>Select a conversation to start chatting</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`h-full flex flex-col ${className}`}>
      {/* Chat Header */}
      <CardHeader className="border-b p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={conversation.customer?.avatar_url} />
              <AvatarFallback>
                {conversation.customer?.name?.charAt(0) || 'C'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold">
                {conversation.customer?.name || 'Unknown Customer'}
              </h3>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="text-xs">
                  {conversation.customer?.channel || 'Unknown'}
                </Badge>
                <span className="text-xs text-gray-500">
                  {conversation.status}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {!conversation.agent && (
              <Button
                size="sm"
                onClick={() => onAssignConversation?.(conversation)}
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
                <DropdownMenuItem>
                  <Info className="h-4 w-4 mr-2" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Archive className="h-4 w-4 mr-2" />
                  Archive
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Flag className="h-4 w-4 mr-2" />
                  Flag
                </DropdownMenuItem>
                <Separator />
                <DropdownMenuItem 
                  onClick={() => onResolveConversation?.(conversation)}
                  className="text-green-600"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Resolve
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      {/* Messages Area */}
      <CardContent className="flex-1 p-0 flex flex-col">
        <ScrollArea className="flex-1 p-4">
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
              {messages.map((message) => (
                <div
                  key={message.id}
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
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
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
        <div className="border-t p-4">
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
      </CardContent>
    </Card>
  );
};

export default ChatWindow;
