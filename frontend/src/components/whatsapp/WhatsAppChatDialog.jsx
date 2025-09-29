import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Button,
  Badge,
  Avatar,
  Input
} from '@/components/ui';
import {
  MessageSquare,
  Phone,
  Video,
  MoreVertical,
  Search,
  X,
  Bot
} from 'lucide-react';
import WhatsAppChatUI from './WhatsAppChatUI';

const WhatsAppChatDialog = ({
  sessionId,
  sessionName,
  isConnected,
  phoneNumber,
  onSendMessage,
  onLoadMessages,
  messages = [],
  loading = false,
  error = null
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  // Mock data for demonstration
  const mockMessages = [
    {
      id: '1',
      content: 'Hello! How can I help you today?',
      direction: 'incoming',
      timestamp: new Date().toISOString(),
      type: 'text',
      status: 'delivered'
    },
    {
      id: '2',
      content: 'I need help with my order',
      direction: 'outgoing',
      timestamp: new Date(Date.now() - 60000).toISOString(),
      type: 'text',
      status: 'read'
    },
    {
      id: '3',
      content: 'Sure! Can you provide your order number?',
      direction: 'incoming',
      timestamp: new Date(Date.now() - 30000).toISOString(),
      type: 'text',
      status: 'delivered'
    }
  ];

  const displayMessages = messages.length > 0 ? messages : mockMessages;

  const handleSendMessage = async (sessionId, message) => {
    try {
      await onSendMessage(sessionId, message);
    } catch (error) {
      // Error handling can be implemented here
      // For now, silently handle the error
    }
  };

  const getConnectionStatus = () => {
    if (isConnected) {
      return { text: 'Connected', variant: 'default', className: 'bg-green-500' };
    }
    return { text: 'Disconnected', variant: 'secondary', className: 'bg-gray-500' };
  };

  const status = getConnectionStatus();

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center space-x-2 hover:bg-green-50 hover:border-green-300"
        >
          <MessageSquare className="w-4 h-4" />
          <span>Chat</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-4xl h-[80vh] p-0 flex flex-col">
        <DialogHeader className="px-6 py-5 border-b border-gray-200 bg-gray-50/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="w-10 h-10">
                <div className="w-full h-full rounded-full bg-green-500 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
              </Avatar>
              <div>
                <DialogTitle className="text-lg font-semibold">
                  {sessionName || 'WhatsApp Chat'}
                </DialogTitle>
                <div className="flex items-center space-x-2">
                  <Badge
                    variant={status.variant}
                    className={`${status.className} text-white`}
                  >
                    {status.text}
                  </Badge>
                  {phoneNumber && (
                    <span className="text-sm text-gray-500">{phoneNumber}</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {/* Search Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSearch(!showSearch)}
                className="hover:bg-gray-100"
              >
                <Search className="w-4 h-4" />
              </Button>

              {/* Call Button */}
              <Button
                variant="ghost"
                size="sm"
                disabled={!isConnected}
                className="hover:bg-gray-100"
              >
                <Phone className="w-4 h-4" />
              </Button>

              {/* Video Call Button */}
              <Button
                variant="ghost"
                size="sm"
                disabled={!isConnected}
                className="hover:bg-gray-100"
              >
                <Video className="w-4 h-4" />
              </Button>

              {/* More Options */}
              <Button
                variant="ghost"
                size="sm"
                className="hover:bg-gray-100"
              >
                <MoreVertical className="w-4 h-4" />
              </Button>

              {/* Close Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Search Bar */}
          {showSearch && (
            <div className="mt-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search messages..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          )}
        </DialogHeader>

        {/* Chat Content */}
        <div className="flex-1 overflow-hidden">
          {sessionId ? (
            <WhatsAppChatUI
              sessionId={sessionId}
              messages={displayMessages}
              onSendMessage={handleSendMessage}
              onLoadMessages={onLoadMessages}
              loading={loading}
              error={error}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No Active Session
                </h3>
                <p className="text-sm text-gray-500 max-w-sm">
                  Please connect a WhatsApp session first to start chatting.
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WhatsAppChatDialog;
