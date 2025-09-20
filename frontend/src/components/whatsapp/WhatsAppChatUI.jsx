import { useState, useRef, useEffect } from 'react';
import { Button, Input, ScrollArea, Avatar, Badge } from '@/components/ui';
import { Send, Smile, Paperclip, MoreVertical, Phone, Video, Search, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';

const WhatsAppChatUI = ({
  sessionId,
  messages = [],
  onSendMessage,
  onLoadMessages,
  loading = false,
  error = null
}) => {
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto focus input
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || loading) return;

    const messageText = newMessage.trim();
    setNewMessage('');
    setIsTyping(true);

    try {
      await onSendMessage(sessionId, messageText);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsTyping(false);
    }
  };

  const formatMessageTime = (timestamp) => {
    return formatDistanceToNow(new Date(timestamp), {
      addSuffix: true,
      locale: id
    });
  };

  const getMessageStatusIcon = (status) => {
    switch (status) {
      case 'sent':
        return <div className="w-2 h-2 bg-gray-400 rounded-full" />;
      case 'delivered':
        return <div className="w-2 h-2 bg-blue-500 rounded-full" />;
      case 'read':
        return <div className="w-2 h-2 bg-green-500 rounded-full" />;
      default:
        return null;
    }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 text-red-400">⚠️</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Chat</h3>
          <p className="text-gray-500 mb-4">{error}</p>
          <Button onClick={() => onLoadMessages(sessionId)}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.length === 0 && !loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 text-gray-400">💬</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Messages Yet</h3>
                <p className="text-gray-500">Start a conversation by sending a message below.</p>
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.direction === 'outgoing' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.direction === 'outgoing'
                      ? 'bg-green-500 text-white'
                      : 'bg-white text-gray-900 border border-gray-200'
                  }`}
                >
                  <div className="flex items-start space-x-2">
                    {message.direction === 'incoming' && (
                      <Avatar className="w-6 h-6 mt-1">
                        <div className="w-full h-full rounded-full bg-gray-300 flex items-center justify-center">
                          <span className="text-xs font-medium text-gray-600">
                            {message.senderName?.charAt(0) || 'U'}
                          </span>
                        </div>
                      </Avatar>
                    )}
                    <div className="flex-1">
                      <p className="text-sm">{message.content}</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className={`text-xs ${
                          message.direction === 'outgoing' ? 'text-green-100' : 'text-gray-500'
                        }`}>
                          {formatMessageTime(message.timestamp)}
                        </span>
                        {message.direction === 'outgoing' && (
                          <div className="flex items-center space-x-1">
                            {getMessageStatusIcon(message.status)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}

          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 rounded-lg px-4 py-2">
                <div className="flex items-center space-x-1">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                  <span className="text-xs text-gray-500 ml-2">Typing...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Message Input */}
      <div className="border-t border-gray-200 bg-white p-4">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="p-2"
          >
            <Paperclip className="w-4 h-4" />
          </Button>

          <div className="flex-1 relative">
            <Input
              ref={inputRef}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="pr-10"
              disabled={loading}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 p-1"
            >
              <Smile className="w-4 h-4" />
            </Button>
          </div>

          <Button
            type="submit"
            size="sm"
            disabled={!newMessage.trim() || loading}
            className="bg-green-500 hover:bg-green-600 text-white"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
};

export default WhatsAppChatUI;
