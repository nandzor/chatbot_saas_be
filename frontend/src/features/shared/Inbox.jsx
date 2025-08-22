import React, { useState } from 'react';
import { 
  Search, 
  Send, 
  MessageCircle, 
  Globe, 
  Users, 
  Send as SendIcon,
  Smile,
  AlertCircle
} from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
CardTitle,
  Badge,
  Input,
  Button,
  Avatar,
  AvatarFallback,
  AvatarImage,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui';

const Inbox = () => {
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messageInput, setMessageInput] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Sample data - seharusnya dipindah ke file data terpisah
  const conversationsData = [
    { 
      id: 1, 
      customer: "John Doe", 
      status: "active", 
      channel: "webchat", 
      lastMessage: "I need help with my order #12345", 
      time: "2 min ago", 
      agent: "Sarah Wilson", 
      sentiment: "neutral",
      unread: 2,
      priority: "high"
    },
    { 
      id: 2, 
      customer: "Emma Smith", 
      status: "bot_handled", 
      channel: "whatsapp", 
      lastMessage: "What are your business hours?", 
      time: "5 min ago", 
      agent: "Bot", 
      sentiment: "positive",
      unread: 0,
      priority: "low"
    },
    { 
      id: 3, 
      customer: "Michael Brown", 
      status: "agent_handled", 
      channel: "facebook", 
      lastMessage: "Thank you for your help!", 
      time: "10 min ago", 
      agent: "John Davis", 
      sentiment: "positive",
      unread: 0,
      priority: "medium"
    },
    { 
      id: 4, 
      customer: "Lisa Johnson", 
      status: "completed", 
      channel: "webchat", 
      lastMessage: "Issue resolved", 
      time: "1 hour ago", 
      agent: "Sarah Wilson", 
      sentiment: "positive",
      unread: 0,
      priority: "low"
    },
    { 
      id: 5, 
      customer: "Robert Taylor", 
      status: "active", 
      channel: "telegram", 
      lastMessage: "Can you check my refund status?", 
      time: "15 min ago", 
      agent: "Mike Chen", 
      sentiment: "negative",
      unread: 3,
      priority: "high"
    }
  ];

  const chatMessages = [
    { id: 1, sender: "customer", message: "Hi, I need help with my recent order", time: "10:23 AM", type: "text" },
    { id: 2, sender: "bot", message: "Hello! I'd be happy to help you with your order. Could you please provide your order number?", time: "10:23 AM", type: "text" },
    { id: 3, sender: "customer", message: "It's order #12345", time: "10:24 AM", type: "text" },
    { id: 4, sender: "bot", message: "Thank you! I can see your order #12345 was placed on March 15th. Let me transfer you to an agent who can assist you better.", time: "10:24 AM", type: "text" },
    { id: 5, sender: "agent", message: "Hi John! This is Sarah from customer support. I can see you have an issue with order #12345. How can I help you today?", time: "10:25 AM", type: "text", agentName: "Sarah Wilson" },
    { id: 6, sender: "customer", message: "The product arrived damaged. I need a replacement.", time: "10:26 AM", type: "text" },
    { id: 7, sender: "agent", message: "I'm sorry to hear that! I'll immediately process a replacement for you. You should receive it within 2-3 business days.", time: "10:27 AM", type: "text", agentName: "Sarah Wilson" }
  ];

  const getChannelIcon = (channel) => {
    switch(channel) {
      case 'whatsapp': return <MessageCircle className="w-4 h-4 text-green-500" />;
      case 'webchat': return <Globe className="w-4 h-4 text-blue-500" />;
      case 'facebook': return <Users className="w-4 h-4 text-blue-600" />;
      case 'telegram': return <SendIcon className="w-4 h-4 text-sky-500" />;
      default: return <MessageCircle className="w-4 h-4" />;
    }
  };

  const getSentimentIcon = (sentiment) => {
    switch(sentiment) {
      case 'positive': return <Smile className="w-4 h-4 text-green-500" />;
      case 'negative': return <AlertCircle className="w-4 h-4 text-red-500" />;
      default: return <Smile className="w-4 h-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      // Handle sending message
      console.log('Sending message:', messageInput);
      setMessageInput('');
    }
  };

  const filteredConversations = conversationsData.filter(conv => {
    if (filterStatus === 'all') return true;
    return conv.status === filterStatus;
  });

  return (
    <div className="h-[calc(100vh-6rem)] flex gap-4">
      {/* Left Panel - Conversations List */}
      <Card className="w-80 flex flex-col">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Conversations</CardTitle>
            <Badge variant="secondary">
              {conversationsData.filter(c => c.status === 'active').length} Active
            </Badge>
          </div>
          <div className="mt-4 space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search conversations..." className="pl-9" />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Conversations</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="bot_handled">Bot Handled</SelectItem>
                <SelectItem value="agent_handled">Agent Handled</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto p-2">
          <div className="space-y-2">
            {filteredConversations.map(conversation => (
              <div
                key={conversation.id}
                onClick={() => setSelectedConversation(conversation)}
                className={`p-3 rounded-lg cursor-pointer transition-all ${
                  selectedConversation?.id === conversation.id 
                    ? 'bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-primary/20' 
                    : 'hover:bg-accent'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback>{conversation.customer.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium text-foreground">{conversation.customer}</p>
                      <div className="flex items-center gap-1">
                        {getChannelIcon(conversation.channel)}
                        <span className="text-xs text-muted-foreground">{conversation.channel}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge variant={getPriorityColor(conversation.priority)} className="text-xs">
                      {conversation.priority}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{conversation.time}</span>
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                  {conversation.lastMessage}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getSentimentIcon(conversation.sentiment)}
                    <span className="text-xs text-muted-foreground capitalize">{conversation.sentiment}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{conversation.agent}</span>
                    {conversation.unread > 0 && (
                      <Badge variant="default" className="w-5 h-5 p-0 text-xs flex items-center justify-center">
                        {conversation.unread}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Right Panel - Chat Area */}
      <Card className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback>{selectedConversation.customer.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{selectedConversation.customer}</CardTitle>
                    <div className="flex items-center gap-2">
                      {getChannelIcon(selectedConversation.channel)}
                      <span className="text-sm text-muted-foreground capitalize">{selectedConversation.channel}</span>
                      <Badge variant={getPriorityColor(selectedConversation.priority)}>
                        {selectedConversation.priority}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{selectedConversation.status.replace('_', ' ')}</Badge>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="flex-1 overflow-y-auto p-4">
              <div className="space-y-4">
                {chatMessages.map(message => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'customer' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[70%] ${message.sender === 'customer' ? 'order-2' : 'order-1'}`}>
                      <div className={`rounded-lg px-4 py-2 ${
                        message.sender === 'customer' 
                          ? 'bg-primary text-primary-foreground' 
                          : message.sender === 'agent'
                          ? 'bg-secondary text-secondary-foreground'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        <p className="text-sm">{message.message}</p>
                        {message.agentName && (
                          <p className="text-xs opacity-70 mt-1">{message.agentName}</p>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 text-center">
                        {message.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Input
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="Type your message..."
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1"
                />
                <Button onClick={handleSendMessage} size="icon">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground">Select a conversation</h3>
              <p className="text-sm text-muted-foreground">Choose a conversation from the list to start chatting</p>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Inbox;
