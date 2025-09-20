import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Avatar,
  Input,
  ScrollArea,
  Separator
} from '@/components/ui';
import {
  ArrowLeft,
  Search,
  Filter,
  MoreVertical,
  Phone,
  Video,
  MessageSquare,
  Users,
  Settings,
  Archive,
  Star,
  Trash2,
  Download,
  Upload,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  Wifi,
  WifiOff
} from 'lucide-react';
import WhatsAppChatUI from '@/components/whatsapp/WhatsAppChatUI';
import { useWahaSessions } from '@/hooks/useWahaSessions';
import { useWhatsAppChat } from '@/hooks/useWhatsAppChat';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';

const WhatsAppChat = () => {
  const [selectedSession, setSelectedSession] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSessions, setShowSessions] = useState(true);
  
  const { sessions, loading: sessionsLoading, loadSessions } = useWahaSessions();
  const { 
    messages, 
    loading: messagesLoading, 
    sending,
    error: chatError,
    unreadCount,
    sendMessage,
    loadMessages,
    markAsRead
  } = useWhatsAppChat(selectedSession?.id);

  // Filter sessions based on search query
  const filteredSessions = sessions.filter(session => {
    const query = searchQuery.toLowerCase();
    return (
      session.session_name?.toLowerCase().includes(query) ||
      session.phone_number?.toLowerCase().includes(query) ||
      session.business_name?.toLowerCase().includes(query)
    );
  });

  // Get session status info
  const getSessionStatus = (session) => {
    if (session.is_connected && session.is_authenticated) {
      return { status: 'connected', label: 'Connected', color: 'green' };
    } else if (session.is_connected) {
      return { status: 'connecting', label: 'Connecting', color: 'yellow' };
    } else {
      return { status: 'disconnected', label: 'Disconnected', color: 'red' };
    }
  };

  // Handle session selection
  const handleSessionSelect = (session) => {
    setSelectedSession(session);
    setShowSessions(false);
    
    // Mark messages as read when selecting session
    if (session.id) {
      const unreadMessageIds = messages
        .filter(msg => msg.direction === 'incoming' && msg.status !== 'read')
        .map(msg => msg.id);
      
      if (unreadMessageIds.length > 0) {
        markAsRead(session.id, unreadMessageIds);
      }
    }
  };

  // Handle back to sessions
  const handleBackToSessions = () => {
    setSelectedSession(null);
    setShowSessions(true);
  };

  // Handle send message
  const handleSendMessage = async (sessionId, content) => {
    try {
      await sendMessage(sessionId, content, {
        to: selectedSession?.phone_number,
        from: selectedSession?.session_name
      });
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sessions Sidebar */}
      {showSessions && (
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-xl font-bold text-gray-900">WhatsApp Chat</h1>
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm">
                  <Settings className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={loadSessions}>
                  <RefreshCw className={`w-4 h-4 ${sessionsLoading ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search sessions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Sessions List */}
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-2">
              {sessionsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="flex items-center space-x-2 text-gray-500">
                    <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
                    <span className="text-sm">Loading sessions...</span>
                  </div>
                </div>
              ) : filteredSessions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                  <MessageSquare className="w-12 h-12 mb-4" />
                  <h3 className="text-lg font-medium mb-2">No sessions found</h3>
                  <p className="text-sm text-center">
                    {searchQuery ? 'No sessions match your search.' : 'No WhatsApp sessions available.'}
                  </p>
                </div>
              ) : (
                filteredSessions.map((session) => {
                  const status = getSessionStatus(session);
                  return (
                    <Card
                      key={session.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        selectedSession?.id === session.id ? 'ring-2 ring-blue-500' : ''
                      }`}
                      onClick={() => handleSessionSelect(session)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="relative">
                            <Avatar className="w-12 h-12">
                              <div className="w-full h-full bg-green-500 rounded-full flex items-center justify-center">
                                <MessageSquare className="w-6 h-6 text-white" />
                              </div>
                            </Avatar>
                            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                              status.color === 'green' ? 'bg-green-500' :
                              status.color === 'yellow' ? 'bg-yellow-500' : 'bg-red-500'
                            }`}></div>
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h3 className="text-sm font-semibold text-gray-900 truncate">
                                {session.business_name || session.session_name || 'WhatsApp Session'}
                              </h3>
                              {session.last_message_time && (
                                <span className="text-xs text-gray-500">
                                  {formatDistanceToNow(new Date(session.last_message_time), { 
                                    addSuffix: true, 
                                    locale: id 
                                  })}
                                </span>
                              )}
                            </div>
                            
                            <div className="flex items-center justify-between mt-1">
                              <p className="text-sm text-gray-500 truncate">
                                {session.phone_number || 'No phone number'}
                              </p>
                              <div className="flex items-center space-x-1">
                                <Badge 
                                  variant={status.color === 'green' ? 'default' : 'secondary'}
                                  className="text-xs"
                                >
                                  {status.label}
                                </Badge>
                                {unreadCount > 0 && (
                                  <Badge variant="destructive" className="text-xs">
                                    {unreadCount}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </div>
      )}

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedSession ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleBackToSessions}
                    className="lg:hidden"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                  
                  <Avatar className="w-10 h-10">
                    <div className="w-full h-full bg-green-500 rounded-full flex items-center justify-center">
                      <MessageSquare className="w-5 h-5 text-white" />
                    </div>
                  </Avatar>
                  
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      {selectedSession.business_name || selectedSession.session_name || 'WhatsApp Session'}
                    </h2>
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${
                        selectedSession.is_connected && selectedSession.is_authenticated 
                          ? 'bg-green-500' 
                          : 'bg-red-500'
                      }`}></div>
                      <span className="text-sm text-gray-500">
                        {selectedSession.phone_number || 'No phone number'}
                      </span>
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
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Chat UI */}
            <div className="flex-1">
              <WhatsAppChatUI
                sessionId={selectedSession.id}
                messages={messages}
                onSendMessage={handleSendMessage}
                onLoadMessages={loadMessages}
                loading={messagesLoading}
                error={chatError}
              />
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Select a WhatsApp Session
              </h3>
              <p className="text-gray-500 max-w-sm">
                Choose a connected WhatsApp session from the sidebar to start chatting.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WhatsAppChat;
