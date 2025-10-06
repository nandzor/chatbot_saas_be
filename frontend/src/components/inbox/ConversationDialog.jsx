import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
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
  Check,
  CheckCheck,
  Clock,
  User,
  MessageSquare,
  Calendar,
  MapPin,
  Mail,
  Phone as PhoneIcon
} from 'lucide-react';
import { useApi } from '@/hooks/useApi';
import { inboxService } from '@/services/InboxService';
import { toast } from 'sonner';

const ConversationDialog = ({
  session,
  isOpen,
  onClose,
  onRefresh
}) => {
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showTransferDialog, setShowTransferDialog] = useState(false);
  const [transferAgent, setTransferAgent] = useState('');
  const [transferReason, setTransferReason] = useState('');
  const [showResolveDialog, setShowResolveDialog] = useState(false);
  const [resolveData, setResolveData] = useState({ resolution_type: 'resolved', notes: '' });
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Realtime messaging disabled
  // const {
  //   isConnected,
  //   registerMessageHandler,
  //   registerTypingHandler,
  //   sendTyping
  // } = useRealtimeMessages();

  const { data: messagesData, loading: messagesLoading } = useApi(
    () => session ? inboxService.getSessionMessages(session.id) : null,
    [session?.id]
  );

  const { data: agentsData } = useApi(
    () => inboxService.getAvailableAgents(),
    []
  );

  // Load messages when session changes
  useEffect(() => {
    if (messagesData?.data) {
      setMessages(messagesData.data);
    }
  }, [messagesData]);

  // Auto scroll to bottom when messages change
  useEffect(() => {
    setTimeout(() => {
      scrollToBottom();
    }, 100);
  }, [messages]);

  // Register real-time message handlers (disabled - realtime messaging removed)
  // useEffect(() => {
  //   if (!session?.id) return;
  //   // Realtime messaging disabled
  // }, [session?.id]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !session?.id) return;

    const text = messageText.trim();
    setMessageText('');
    setIsLoading(true);

    try {
      const messageData = {
        message_text: text,
        message_type: 'text',
        sender_type: 'agent'
      };

      const response = await inboxService.sendMessage(session.id, messageData);

      if (response?.success) {
        // Refresh messages
        if (onRefresh) {
          onRefresh();
        }
        toast.success('Message sent successfully');
      } else {
        throw new Error(response?.message || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleTyping = (text) => {
    setMessageText(text);
    // Realtime typing indicator disabled
  };

  const handleTransfer = async () => {
    if (!transferAgent || !session?.id) return;

    try {
      const response = await inboxService.transferSession(session.id, {
        agent_id: transferAgent,
        reason: transferReason
      });

      if (response?.success) {
        toast.success('Session transferred successfully');
        setShowTransferDialog(false);
        setTransferAgent('');
        setTransferReason('');
        if (onRefresh) {
          onRefresh();
        }
      } else {
        throw new Error(response?.message || 'Failed to transfer session');
      }
    } catch (error) {
      console.error('Error transferring session:', error);
      toast.error('Failed to transfer session');
    }
  };

  const handleResolve = async () => {
    if (!session?.id) return;

    try {
      const response = await inboxService.resolveSession(session.id, resolveData);

      if (response?.success) {
        toast.success('Session resolved successfully');
        setShowResolveDialog(false);
        setResolveData({ resolution_type: 'resolved', notes: '' });
        if (onRefresh) {
          onRefresh();
        }
        onClose();
      } else {
        throw new Error(response?.message || 'Failed to resolve session');
      }
    } catch (error) {
      console.error('Error resolving session:', error);
      toast.error('Failed to resolve session');
    }
  };

  const formatMessageTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getMessageStatus = (message) => {
    if (message.sender_type === 'agent') {
      if (message.is_read) {
        return <CheckCheck className="w-4 h-4 text-blue-500" />;
      } else if (message.delivered_at) {
        return <Check className="w-4 h-4 text-gray-400" />;
      } else {
        return <Clock className="w-4 h-4 text-gray-400" />;
      }
    }
    return null;
  };

  if (!session) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 py-5 border-b bg-gray-50/50 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {/* Connection Status Indicator - Disabled */}
              <Avatar className="h-12 w-12">
                <AvatarImage src={session.customer?.avatar_url} />
                <AvatarFallback>
                  {session.customer?.name?.charAt(0) || 'C'}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-lg font-semibold">
                  {session.customer?.name || 'Unknown Customer'}
                </h3>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-gray-500" />
                  <span className="text-sm text-gray-500">Status Unknown</span>
                  {session.session_info?.is_active && (
                    <Badge variant="secondary" className="text-xs">
                      Active
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={() => setShowTransferDialog(true)}>
                <User className="w-4 h-4 mr-2" />
                Transfer
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowResolveDialog(true)}>
                <Check className="w-4 h-4 mr-2" />
                Resolve
              </Button>
              <Button variant="outline" size="sm">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Messages Area */}
        <div className="flex-1 flex flex-col min-h-0">
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messagesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-gray-500">Loading messages...</div>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No messages yet</p>
                  </div>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender_type === 'agent' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex items-end space-x-2 max-w-[70%] ${
                      message.sender_type === 'agent' ? 'flex-row-reverse space-x-reverse' : ''
                    }`}>
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarImage src={
                          message.sender_type === 'agent'
                            ? session.agent?.avatar_url
                            : session.customer?.avatar_url
                        } />
                        <AvatarFallback>
                          {message.sender_type === 'agent' ? 'A' : 'C'}
                        </AvatarFallback>
                      </Avatar>
                      <div className={`rounded-lg px-4 py-2 ${
                        message.sender_type === 'agent'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}>
                        <p className="text-sm">{message.message_text || message.text}</p>
                        <div className={`flex items-center justify-between mt-1 text-xs ${
                          message.sender_type === 'agent' ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          <span>{formatMessageTime(message.created_at || message.sent_at)}</span>
                          {getMessageStatus(message)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Message Input */}
          <div className="border-t p-4 bg-white">
            <div className="flex items-end space-x-2">
              <div className="flex-1">
                <Textarea
                  value={messageText}
                  onChange={(e) => handleTyping(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="min-h-[40px] max-h-32 resize-none"
                  rows={1}
                />
              </div>
              <Button
                onClick={handleSendMessage}
                disabled={!messageText.trim() || isLoading}
                size="sm"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Transfer Dialog */}
        {showTransferDialog && (
          <Dialog open={showTransferDialog} onOpenChange={setShowTransferDialog}>
            <DialogContent>
              <DialogHeader>
                <h3 className="text-lg font-semibold">Transfer Session</h3>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="agent">Transfer to Agent</Label>
                  <Select value={transferAgent} onValueChange={setTransferAgent}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an agent" />
                    </SelectTrigger>
                    <SelectContent>
                      {agentsData?.data?.map((agent) => (
                        <SelectItem key={agent.id} value={agent.id}>
                          {agent.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="reason">Reason (Optional)</Label>
                  <Input
                    id="reason"
                    value={transferReason}
                    onChange={(e) => setTransferReason(e.target.value)}
                    placeholder="Reason for transfer..."
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowTransferDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleTransfer} disabled={!transferAgent}>
                    Transfer
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Resolve Dialog */}
        {showResolveDialog && (
          <Dialog open={showResolveDialog} onOpenChange={setShowResolveDialog}>
            <DialogContent>
              <DialogHeader>
                <h3 className="text-lg font-semibold">Resolve Session</h3>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="resolution_type">Resolution Type</Label>
                  <Select
                    value={resolveData.resolution_type}
                    onValueChange={(value) => setResolveData(prev => ({ ...prev, resolution_type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="escalated">Escalated</SelectItem>
                      <SelectItem value="follow_up">Follow Up Required</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={resolveData.notes}
                    onChange={(e) => setResolveData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Resolution notes..."
                    rows={3}
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
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ConversationDialog;
