import React, { useState, useMemo } from 'react';
import InboxManagement from './InboxManagement';
import { 
  Search, 
  Send, 
  MessageCircle, 
  Globe, 
  Users, 
  Send as SendIcon,
  Smile,
  AlertCircle,
  Filter,
  Tag,
  Clock,
  User,
  Phone,
  Mail,
  MapPin,
  FileText,
  Image,
  Download,
  X,
  Plus,
  UserCheck,
  Settings,
  MessageSquare,
  Info,
  ChevronDown,
  Upload
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
  SelectValue,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea
} from '@/components/ui';
import { 
  chatSessionsData, 
  customersData, 
  channelConfigsData, 
  agentsData, 
  sessionsMessagesData 
} from '@/data/sampleData';
import { formatTimeAgo, formatTime } from '../../utils/dateUtils';

const SessionManager = () => {
  // Main view state
  const [activeView, setActiveView] = useState('sessions'); // 'sessions' or 'manage-inbox'
  
  // State untuk panel kiri
  const [selectedSession, setSelectedSession] = useState(null);
  const [filterChannel, setFilterChannel] = useState('all');
  const [filterAgent, setFilterAgent] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterTags, setFilterTags] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // State untuk panel tengah
  const [messageInput, setMessageInput] = useState('');
  const [replyMode, setReplyMode] = useState('text');

  // State untuk panel kanan
  const [rightPanelTab, setRightPanelTab] = useState('info');
  const [newTag, setNewTag] = useState('');
  const [sessionStatus, setSessionStatus] = useState('');
  const [assignedAgent, setAssignedAgent] = useState('');

  // Gabungkan data untuk sesi lengkap
  const enrichedSessions = useMemo(() => {
    return chatSessionsData.map(session => {
      const customer = customersData.find(c => c.id === session.customer_id);
      const channelConfig = channelConfigsData.find(cc => cc.id === session.channel_config_id);
      const agent = agentsData.find(a => a.id === session.agent_id);
      const messages = sessionsMessagesData.filter(m => m.session_id === session.id);
      const lastMessage = messages[messages.length - 1];
      
      return {
        ...session,
        customer,
        channelConfig,
        agent,
        messages,
        lastMessage,
        unreadCount: messages.filter(m => m.sender_type === 'customer' && m.created_at > (session.last_read_at || '2024-03-20T14:00:00Z')).length
      };
    });
  }, []);

  // Filter sesi berdasarkan kriteria
  const filteredSessions = useMemo(() => {
    return enrichedSessions.filter(session => {
      // Filter berdasarkan channel
      if (filterChannel !== 'all' && session.channelConfig?.channel_type !== filterChannel) {
        return false;
      }
      
      // Filter berdasarkan agent
      if (filterAgent !== 'all') {
        if (filterAgent === 'unassigned' && session.agent_id !== null) return false;
        if (filterAgent !== 'unassigned' && session.agent_id !== parseInt(filterAgent)) return false;
      }
      
      // Filter berdasarkan status
      if (filterStatus !== 'all' && session.status !== filterStatus) {
        return false;
      }
      
      // Filter berdasarkan tags
      if (filterTags && !session.tags.some(tag => tag.toLowerCase().includes(filterTags.toLowerCase()))) {
        return false;
      }
      
      // Filter berdasarkan pencarian
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        const customerName = session.customer?.name?.toLowerCase() || '';
        const lastMessageContent = session.lastMessage?.content?.toLowerCase() || '';
        
        if (!customerName.includes(searchLower) && !lastMessageContent.includes(searchLower)) {
          return false;
        }
      }
      
      return true;
    });
  }, [enrichedSessions, filterChannel, filterAgent, filterStatus, filterTags, searchQuery]);

  // Fungsi untuk mendapatkan ikon kanal
  const getChannelIcon = (channelType) => {
    switch(channelType) {
      case 'whatsapp': 
        return <MessageCircle className="w-4 h-4 text-green-500" />;
      case 'web': 
        return <Globe className="w-4 h-4 text-blue-500" />;
      case 'facebook': 
        return <Users className="w-4 h-4 text-blue-600" />;
      case 'telegram': 
        return <SendIcon className="w-4 h-4 text-sky-500" />;
      default: 
        return <MessageCircle className="w-4 h-4" />;
    }
  };

  // Fungsi untuk mendapatkan warna status
  const getStatusColor = (status) => {
    switch(status) {
      case 'active': return 'destructive';
      case 'bot_handled': return 'default';
      case 'agent_handled': return 'secondary';
      case 'completed': return 'outline';
      default: return 'default';
    }
  };

  // Fungsi untuk upload file
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && selectedSession) {
      console.log('Uploading file:', file.name, 'to session:', selectedSession.id);
      // Implementasi upload file akan ditambahkan di sini
    }
  };

  // Fungsi untuk mengirim pesan
  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedSession) return;
    
    console.log('Sending message:', messageInput, 'to session:', selectedSession.id);
    setMessageInput('');
  };

  // Fungsi untuk mengubah status sesi
  const handleStatusChange = (newStatus) => {
    if (!selectedSession) return;
    
    console.log('Changing session status to:', newStatus, 'for session:', selectedSession.id);
    setSessionStatus(newStatus);
  };

  // Fungsi untuk menetapkan agen
  const handleAssignAgent = (agentId) => {
    if (!selectedSession) return;
    
    console.log('Assigning agent:', agentId, 'to session:', selectedSession.id);
    setAssignedAgent(agentId);
  };

  // Fungsi untuk menambah tag
  const handleAddTag = () => {
    if (!newTag.trim() || !selectedSession) return;
    
    console.log('Adding tag:', newTag, 'to session:', selectedSession.id);
    setNewTag('');
  };

  // Component untuk render pesan
  const MessageItem = ({ message, session }) => {
    const isCustomer = message.sender_type === 'customer';
    const isBot = message.sender_type === 'bot';
    const isAgent = message.sender_type === 'agent';
    
    const senderName = isCustomer 
      ? session.customer?.name 
      : isBot 
        ? 'Bot'
        : agentsData.find(a => a.id === message.sender_id)?.name || 'Agent';

    return (
      <div className={`flex mb-4 ${isCustomer ? 'justify-end' : 'justify-start'}`}>
        <div className={`max-w-[70%] ${isCustomer ? 'order-2' : 'order-1'}`}>
          {!isCustomer && (
            <p className="text-xs text-muted-foreground mb-1 px-1">{senderName}</p>
          )}
          
          <div className={`rounded-lg px-4 py-2 ${
            isCustomer 
              ? 'bg-primary text-primary-foreground' 
              : isAgent
                ? 'bg-secondary text-secondary-foreground'
                : 'bg-muted text-muted-foreground'
          }`}>
            {message.message_type === 'text' && (
              <p className="text-sm">{message.content}</p>
            )}
            
            {message.message_type === 'image' && (
              <div>
                <p className="text-sm mb-2">{message.content}</p>
                <img 
                  src={message.media_url} 
                  alt="Image message" 
                  className="max-w-full rounded-md cursor-pointer hover:opacity-80"
                  onClick={() => window.open(message.media_url, '_blank')}
                />
              </div>
            )}
            
            {message.message_type === 'document' && (
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                <div>
                  <p className="text-sm">{message.content}</p>
                  <a 
                    href={message.media_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs underline flex items-center gap-1 mt-1"
                  >
                    <Download className="w-3 h-3" />
                    Download
                  </a>
                </div>
              </div>
            )}
          </div>
          
          {message.quick_replies && (
            <div className="mt-2 flex flex-wrap gap-1">
              {message.quick_replies.map((reply, index) => (
                <Button 
                  key={index} 
                  variant="outline" 
                  size="sm" 
                  className="text-xs h-7"
                  onClick={() => setMessageInput(reply)}
                >
                  {reply}
                </Button>
              ))}
            </div>
          )}
          
          <p className="text-xs text-muted-foreground mt-1 text-center">
            {formatTime(message.created_at)}
          </p>
        </div>
      </div>
    );
  };

  // Conditional rendering based on activeView
  if (activeView === 'manage-inbox') {
    return <InboxManagement />;
  }

  return (
    <div className="h-[calc(100vh-6rem)] flex gap-4">
      {/* Panel Kiri - Daftar Sesi */}
      <Card className="w-80 flex flex-col">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Session Manager</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                {filteredSessions.filter(s => s.status === 'active').length} Aktif
              </Badge>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setActiveView('manage-inbox')}
              >
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          {/* Pencarian */}
          <div className="mt-4 space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Cari sesi..." 
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            {/* Filter Kanal */}
            <Select value={filterChannel} onValueChange={setFilterChannel}>
              <SelectTrigger>
                <SelectValue placeholder="Filter berdasarkan kanal" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Kanal</SelectItem>
                <SelectItem value="whatsapp">WhatsApp</SelectItem>
                <SelectItem value="web">Website</SelectItem>
                <SelectItem value="telegram">Telegram</SelectItem>
                <SelectItem value="facebook">Facebook</SelectItem>
              </SelectContent>
            </Select>
            
            {/* Filter Status */}
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Filter berdasarkan status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="active">Aktif</SelectItem>
                <SelectItem value="bot_handled">Ditangani Bot</SelectItem>
                <SelectItem value="agent_handled">Ditangani Agent</SelectItem>
                <SelectItem value="completed">Selesai</SelectItem>
              </SelectContent>
            </Select>
            
            {/* Filter Agent */}
            <Select value={filterAgent} onValueChange={setFilterAgent}>
              <SelectTrigger>
                <SelectValue placeholder="Filter berdasarkan agent" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Agent</SelectItem>
                <SelectItem value="unassigned">Belum Ditugaskan</SelectItem>
                {agentsData.map(agent => (
                  <SelectItem key={agent.id} value={agent.id.toString()}>
                    {agent.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {/* Filter Tags */}
            <Input 
              placeholder="Filter berdasarkan tag..." 
              value={filterTags}
              onChange={(e) => setFilterTags(e.target.value)}
            />
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 overflow-y-auto p-2">
          <div className="space-y-2">
            {filteredSessions.map(session => (
              <div
                key={session.id}
                onClick={() => setSelectedSession(session)}
                className={`p-3 rounded-lg cursor-pointer transition-all ${
                  selectedSession?.id === session.id 
                    ? 'bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-primary/20' 
                    : 'hover:bg-accent'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback>
                        {session.customer?.name?.split(' ').map(n => n[0]).join('') || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {session.customer?.name || 'Unknown User'}
                      </p>
                      <div className="flex items-center gap-1">
                        {getChannelIcon(session.channelConfig?.channel_type)}
                        <span className="text-xs text-muted-foreground">
                          {session.channelConfig?.channel_type || 'Unknown'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-1">
                    <Badge variant={getStatusColor(session.status)} className="text-xs">
                      {session.status === 'active' ? 'Aktif' :
                       session.status === 'bot_handled' ? 'Bot' :
                       session.status === 'agent_handled' ? 'Agent' : 'Selesai'}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatTimeAgo(session.lastMessage?.created_at || session.started_at)}
                    </span>
                    {session.unreadCount > 0 && (
                      <Badge variant="destructive" className="text-xs">
                        {session.unreadCount}
                      </Badge>
                    )}
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                  {session.lastMessage?.content || 'Tidak ada pesan'}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    {session.agent && (
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        <span className="text-xs text-muted-foreground">
                          {session.agent.name}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-1">
                    {session.tags.slice(0, 2).map(tag => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {session.tags.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{session.tags.length - 2}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Panel Tengah - Jendela Percakapan */}
      <Card className="flex-1 flex flex-col">
        {selectedSession ? (
          <>
            {/* Header Percakapan */}
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback>
                      {selectedSession.customer?.name?.split(' ').map(n => n[0]).join('') || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">
                      {selectedSession.customer?.name || 'Unknown User'}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      {getChannelIcon(selectedSession.channelConfig?.channel_type)}
                      <span className="text-sm text-muted-foreground">
                        {selectedSession.channelConfig?.name || 'Unknown Channel'}
                      </span>
                      <Badge variant={getStatusColor(selectedSession.status)} className="text-xs">
                        {selectedSession.status === 'active' ? 'Aktif' :
                         selectedSession.status === 'bot_handled' ? 'Ditangani Bot' :
                         selectedSession.status === 'agent_handled' ? 'Ditangani Agent' : 'Selesai'}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {selectedSession.handover_reason && (
                    <Badge variant="outline" className="text-xs">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Eskalasi
                    </Badge>
                  )}
                  <Button variant="outline" size="sm">
                    <Settings className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            {/* Area Percakapan */}
            <CardContent className="flex-1 overflow-y-auto p-4">
              <div className="space-y-4">
                {selectedSession.messages.map(message => (
                  <MessageItem 
                    key={message.id} 
                    message={message} 
                    session={selectedSession}
                  />
                ))}
              </div>
            </CardContent>
            
            {/* Input Pesan */}
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <div className="flex-1">
                  <Textarea
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder="Ketik pesan Anda..."
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    className="min-h-[60px] resize-none"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <Upload className="w-4 h-4" />
                      <input
                        id="file-upload"
                        type="file"
                        className="hidden"
                        onChange={handleFileUpload}
                        accept="image/*,.pdf,.doc,.docx"
                      />
                    </label>
                  </Button>
                  <Button onClick={handleSendMessage} size="sm">
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Pilih Sesi untuk Memulai</h3>
              <p className="text-muted-foreground">
                Pilih sesi dari daftar di sebelah kiri untuk melihat percakapan dan mengelola sesi.
              </p>
            </div>
          </div>
        )}
      </Card>

      {/* Panel Kanan - Manajemen Sesi & Konteks */}
      <Card className="w-80 flex flex-col">
        {selectedSession ? (
          <>
            <CardHeader>
              <CardTitle className="text-lg">Manajemen Sesi</CardTitle>
            </CardHeader>
            
            <CardContent className="flex-1 overflow-y-auto">
              <Tabs value={rightPanelTab} onValueChange={setRightPanelTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="info">Info Pelanggan</TabsTrigger>
                  <TabsTrigger value="manage">Kelola Sesi</TabsTrigger>
                </TabsList>
                
                {/* Tab Info Pelanggan */}
                <TabsContent value="info" className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-3">Detail Pelanggan</h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{selectedSession.customer?.name || '-'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{selectedSession.customer?.email || '-'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{selectedSession.customer?.phone || '-'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">
                          {selectedSession.customer?.metadata?.location || '-'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">
                          Pelanggan sejak {selectedSession.customer?.metadata?.customer_since || '-'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-3">Riwayat Interaksi</h4>
                    <p className="text-sm text-muted-foreground">
                      Ini adalah sesi #{selectedSession.id} untuk pelanggan ini.
                    </p>
                  </div>
                </TabsContent>
                
                {/* Tab Kelola Sesi */}
                <TabsContent value="manage" className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-3">Detail Sesi</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Dimulai:</span>
                        <span>{formatTimeAgo(selectedSession.started_at)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Kanal:</span>
                        <span>{selectedSession.channelConfig?.name}</span>
                      </div>
                      {selectedSession.handover_reason && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Alasan Eskalasi:</span>
                          <span className="text-right">{selectedSession.handover_reason}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-3">Tetapkan Agent</h4>
                    <Select 
                      value={assignedAgent || selectedSession.agent_id?.toString() || ''} 
                      onValueChange={handleAssignAgent}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih agent..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Belum ditugaskan</SelectItem>
                        {agentsData.filter(agent => agent.status === 'online').map(agent => (
                          <SelectItem key={agent.id} value={agent.id.toString()}>
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              {agent.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-3">Tags</h4>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {selectedSession.tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                          <X className="w-3 h-3 ml-1 cursor-pointer" />
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Tambah tag..."
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                        className="text-sm"
                      />
                      <Button size="sm" onClick={handleAddTag}>
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-3">Status Sesi</h4>
                    <div className="space-y-2">
                      <Button 
                        variant="outline" 
                        className="w-full justify-start"
                        onClick={() => handleStatusChange('active')}
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Aktifkan Sesi
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full justify-start"
                        onClick={() => handleStatusChange('completed')}
                      >
                        <UserCheck className="w-4 h-4 mr-2" />
                        Tutup Sesi
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Info className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Tidak Ada Sesi Dipilih</h3>
              <p className="text-muted-foreground text-sm">
                Pilih sesi untuk melihat detail pelanggan dan opsi manajemen.
              </p>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default SessionManager;
