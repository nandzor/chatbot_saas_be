import React, { useState, useEffect, useRef } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  Badge,
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
  Switch,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui';
import { 
  MessageSquare,
  Clock,
  User,
  Send,
  Paperclip,
  Search,
  Filter,
  MoreVertical,
  ArrowRight,
  AlertCircle,
  CheckCircle,
  Timer,
  Flag,
  Star,
  UserPlus,
  Phone,
  Mail,
  Calendar,
  Building,
  Tag,
  FileText,
  Zap,
  ThumbsUp,
  ThumbsDown,
  Eye,
  EyeOff,
  ArrowRightLeft,
  Archive,
  Ban,
  Plus,
  Edit,
  Trash2,
  Copy,
  BookOpen,
  Info,
  History,
  Users,
  MessageCircle,
  X
} from 'lucide-react';

const AgentInbox = () => {
  const [selectedSession, setSelectedSession] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [activeTab, setActiveTab] = useState('my-queue');
  const [contextTab, setContextTab] = useState('customer-info');
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false);
  const [isWrapUpDialogOpen, setIsWrapUpDialogOpen] = useState(false);
  const [internalNotes, setInternalNotes] = useState('');
  const [showInternalNotes, setShowInternalNotes] = useState(false);
  const messagesEndRef = useRef(null);

  // Mock data untuk chat sessions
  const [chatSessions, setChatSessions] = useState([
    {
      id: 'session-001',
      customer: {
        id: 'cust-001',
        name: 'Ahmad Rahman',
        email: 'ahmad.rahman@abccorp.com',
        company: 'PT ABC Corporation',
        plan: 'Enterprise',
        avatar: null,
        phone: '+62812345678',
        lastActivity: '2024-01-25T15:30:00Z',
        joinDate: '2023-06-15',
        totalSessions: 12,
        avgRating: 4.5
      },
      status: 'active',
      priority: 'high',
      startTime: '2024-01-25T15:15:00Z',
      lastMessage: '2024-01-25T15:29:00Z',
      waitingTime: 2,
      slaStatus: 'warning',
      unreadCount: 2,
      category: 'technical',
      tags: ['api', 'integration'],
      messages: [
        {
          id: 'msg-001',
          type: 'customer',
          content: 'Halo, saya mengalami masalah dengan integrasi API. Status code 401 terus muncul.',
          timestamp: '2024-01-25T15:15:00Z',
          delivered: true,
          read: true
        },
        {
          id: 'msg-002',
          type: 'agent',
          content: 'Halo Ahmad! Saya akan membantu Anda dengan masalah API ini. Bisakah Anda share endpoint yang Anda gunakan?',
          timestamp: '2024-01-25T15:17:00Z',
          delivered: true,
          read: true
        },
        {
          id: 'msg-003',
          type: 'customer',
          content: 'Saya menggunakan POST /api/v1/users untuk membuat user baru. API key sudah benar.',
          timestamp: '2024-01-25T15:20:00Z',
          delivered: true,
          read: true
        },
        {
          id: 'msg-004',
          type: 'customer',
          content: 'Apakah ada perubahan pada authentikasi?',
          timestamp: '2024-01-25T15:29:00Z',
          delivered: true,
          read: false
        }
      ],
      internalNotes: 'Customer menggunakan old API key. Perlu update ke v2. Follow up untuk training tim development mereka.'
    },
    {
      id: 'session-002',
      customer: {
        id: 'cust-002',
        name: 'Sari Dewi',
        email: 'sari.dewi@techstart.id',
        company: 'CV TechStart Indonesia',
        plan: 'Professional',
        avatar: null,
        phone: '+62821234567',
        lastActivity: '2024-01-25T14:45:00Z',
        joinDate: '2023-09-20',
        totalSessions: 8,
        avgRating: 4.8
      },
      status: 'waiting',
      priority: 'medium',
      startTime: '2024-01-25T14:30:00Z',
      lastMessage: '2024-01-25T14:45:00Z',
      waitingTime: 45,
      slaStatus: 'danger',
      unreadCount: 1,
      category: 'billing',
      tags: ['payment', 'upgrade'],
      messages: [
        {
          id: 'msg-005',
          type: 'customer',
          content: 'Saya ingin upgrade ke plan Enterprise. Bagaimana prosesnya?',
          timestamp: '2024-01-25T14:30:00Z',
          delivered: true,
          read: true
        },
        {
          id: 'msg-006',
          type: 'customer',
          content: 'Apakah ada diskon untuk upgrade annual?',
          timestamp: '2024-01-25T14:45:00Z',
          delivered: true,
          read: false
        }
      ],
      internalNotes: 'High-value customer. Tanyakan ke sales team tentang diskon khusus. Potential upsell opportunity.'
    },
    {
      id: 'session-003',
      customer: {
        id: 'cust-003',
        name: 'Budi Santoso',
        email: 'budi@digitalsolutions.com',
        company: 'Digital Solutions Pro',
        plan: 'Basic',
        avatar: null,
        phone: '+62813456789',
        lastActivity: '2024-01-25T13:20:00Z',
        joinDate: '2024-01-10',
        totalSessions: 3,
        avgRating: 4.2
      },
      status: 'pending',
      priority: 'low',
      startTime: '2024-01-25T13:00:00Z',
      lastMessage: '2024-01-25T13:20:00Z',
      waitingTime: 125,
      slaStatus: 'safe',
      unreadCount: 0,
      category: 'general',
      tags: ['onboarding', 'training'],
      messages: [
        {
          id: 'msg-007',
          type: 'customer',
          content: 'Terima kasih atas bantuan setup awal. Semuanya sudah berjalan dengan baik.',
          timestamp: '2024-01-25T13:20:00Z',
          delivered: true,
          read: true
        }
      ],
      internalNotes: 'New customer. Perlu follow-up training untuk advanced features. Schedule demo session.'
    }
  ]);

  // Mock data untuk quick replies
  const [quickReplies, setQuickReplies] = useState([
    'Halo! Saya akan membantu Anda hari ini.',
    'Terima kasih telah menghubungi support. Saya sedang mengecek masalah Anda.',
    'Apakah masalah ini sudah teratasi?',
    'Saya akan eskalasi masalah ini ke tim teknis.',
    'Terima kasih atas kesabaran Anda.'
  ]);

  // Mock data untuk knowledge base
  const [knowledgeArticles, setKnowledgeArticles] = useState([
    {
      id: 'kb-001',
      title: 'API Authentication Setup',
      category: 'technical',
      relevance: 95,
      url: '/kb/api-auth'
    },
    {
      id: 'kb-002',
      title: 'Troubleshooting 401 Errors',
      category: 'technical',
      relevance: 90,
      url: '/kb/401-errors'
    },
    {
      id: 'kb-003',
      title: 'Upgrade Pricing Plans',
      category: 'billing',
      relevance: 85,
      url: '/kb/pricing'
    }
  ]);

  // Mock data untuk customer history
  const [customerHistory, setCustomerHistory] = useState([
    {
      id: 'hist-001',
      date: '2024-01-20',
      type: 'chat',
      summary: 'Setup initial configuration',
      rating: 5,
      agent: 'Agent Sarah'
    },
    {
      id: 'hist-002',
      date: '2024-01-15',
      type: 'email',
      summary: 'Welcome onboarding sequence',
      rating: null,
      agent: 'System'
    },
    {
      id: 'hist-003',
      date: '2024-01-10',
      type: 'phone',
      summary: 'Account activation assistance',
      rating: 4,
      agent: 'Agent Mike'
    }
  ]);

  const getSLAIndicator = (slaStatus, waitingTime) => {
    const colors = {
      safe: 'bg-green-500',
      warning: 'bg-yellow-500',
      danger: 'bg-red-500'
    };
    
    return (
      <div className="flex items-center space-x-2">
        <div className={`w-3 h-3 rounded-full ${colors[slaStatus]} ${slaStatus === 'danger' ? 'animate-pulse' : ''}`}></div>
        <span className={`text-xs ${
          slaStatus === 'danger' ? 'text-red-600' : 
          slaStatus === 'warning' ? 'text-yellow-600' : 'text-green-600'
        }`}>
          {waitingTime}m
        </span>
      </div>
    );
  };

  const getPriorityBadge = (priority) => {
    const config = {
      high: { color: 'red', label: 'High' },
      medium: { color: 'yellow', label: 'Medium' },
      low: { color: 'green', label: 'Low' }
    };
    const priorityConfig = config[priority] || config.medium;
    return <Badge variant={priorityConfig.color} className="text-xs">{priorityConfig.label}</Badge>;
  };

  const handleSendMessage = () => {
    if (!messageText.trim() || !selectedSession) return;

    const newMessage = {
      id: `msg-${Date.now()}`,
      type: 'agent',
      content: messageText,
      timestamp: new Date().toISOString(),
      delivered: true,
      read: false
    };

    setChatSessions(sessions => 
      sessions.map(session => 
        session.id === selectedSession.id 
          ? { ...session, messages: [...session.messages, newMessage] }
          : session
      )
    );

    setMessageText('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSessionSelect = (session) => {
    setSelectedSession(session);
    // Mark messages as read
    setChatSessions(sessions => 
      sessions.map(s => 
        s.id === session.id 
          ? { ...s, unreadCount: 0, messages: s.messages.map(msg => ({ ...msg, read: true })) }
          : s
      )
    );
  };

  const handleTransferSession = () => {
    // Logic for transferring session
    setIsTransferDialogOpen(false);
  };

  const handleWrapUpSession = () => {
    // Logic for wrapping up session
    setIsWrapUpDialogOpen(false);
  };

  const filteredSessions = chatSessions.filter(session => {
    const matchesSearch = session.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         session.customer.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || session.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedSession?.messages]);

  return (
    <div className="h-screen flex bg-gray-50 overflow-hidden">
      {/* Left Panel - Chat Queue */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col shadow-sm flex-shrink-0">
        {/* Queue Header */}
        <div className="p-3 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 flex-shrink-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <MessageSquare className="w-4 h-4 text-blue-600" />
              <h2 className="text-sm font-semibold text-gray-900">My Queue</h2>
            </div>
            <Badge variant="blue" className="px-2 py-0.5 text-xs">
              {filteredSessions.length}
            </Badge>
          </div>
          
          {/* Search & Filter */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="absolute left-2 top-2 h-3 w-3 text-gray-400" />
              <Input
                placeholder="Cari customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-7 h-7 text-xs bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="h-7 text-xs bg-white border-gray-300">
                <SelectValue placeholder="Filter status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="waiting">Waiting</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Chat Sessions List */}
        <div className="flex-1 overflow-y-auto">
          {filteredSessions.map((session) => (
            <div
              key={session.id}
              onClick={() => handleSessionSelect(session)}
              className={`p-2.5 border-b border-gray-100 cursor-pointer transition-all duration-200 ${
                selectedSession?.id === session.id 
                  ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-l-blue-500' 
                  : 'hover:bg-gray-50 hover:border-l-4 hover:border-l-gray-300'
              }`}
            >
              {/* Session Header */}
              <div className="flex items-start justify-between mb-1.5">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-medium text-xs">
                    {session.customer.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 text-xs truncate">
                      {session.customer.name}
                    </h3>
                    <p className="text-xs text-gray-500 truncate">
                      {session.customer.company}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end space-y-1">
                  {getSLAIndicator(session.slaStatus, session.waitingTime)}
                  {session.unreadCount > 0 && (
                    <Badge variant="red" className="text-xs px-1 py-0.5 animate-pulse">
                      {session.unreadCount}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Session Info */}
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center space-x-1">
                  {getPriorityBadge(session.priority)}
                  <Badge variant="blue" className="text-xs px-1 py-0.5">
                    {session.category}
                  </Badge>
                </div>
                <div className="flex items-center space-x-1">
                  {session.tags.slice(0, 1).map(tag => (
                    <Badge key={tag} variant="gray" className="text-xs px-1 py-0.5 bg-gray-100 text-gray-700 border-gray-200">
                      {tag}
                    </Badge>
                  ))}
                  {session.tags.length > 1 && (
                    <Badge variant="gray" className="text-xs px-1 py-0.5">
                      +{session.tags.length - 1}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Last Message Preview */}
              <div className="mb-1.5">
                <p className="text-xs text-gray-600 line-clamp-1 leading-relaxed">
                  {session.messages[session.messages.length - 1]?.content}
                </p>
              </div>
              
              {/* Timestamp & Status */}
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-400">
                  {new Date(session.lastMessage).toLocaleTimeString('id-ID', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
                <div className="flex items-center space-x-1">
                  <div className={`w-2 h-2 rounded-full ${
                    session.status === 'active' ? 'bg-green-500' :
                    session.status === 'waiting' ? 'bg-yellow-500' : 'bg-gray-400'
                  }`}></div>
                  <span className="text-xs text-gray-500 capitalize">{session.status}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Center Panel - Chat Window */}
      <div className="flex-1 flex flex-col bg-white min-w-0">
        {selectedSession ? (
          <>
            {/* Chat Header */}
            <div className="p-3 border-b border-gray-200 bg-gradient-to-r from-white to-gray-50 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 min-w-0">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                    {selectedSession.customer.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-gray-900 mb-1 truncate">
                      {selectedSession.customer.name}
                    </h3>
                    <div className="flex items-center space-x-1 text-xs">
                      <div className="flex items-center space-x-1 min-w-0">
                        <Building className="w-3 h-3 text-gray-400 flex-shrink-0" />
                        <span className="text-gray-600 truncate">{selectedSession.customer.company}</span>
                      </div>
                      <div className="w-1 h-1 bg-gray-300 rounded-full flex-shrink-0"></div>
                      <Badge variant="blue" className="text-xs px-1 py-0.5 flex-shrink-0">
                        {selectedSession.customer.plan}
                      </Badge>
                      <div className="w-1 h-1 bg-gray-300 rounded-full flex-shrink-0"></div>
                      <div className="flex items-center space-x-1 flex-shrink-0">
                        <Star className="w-3 h-3 text-yellow-500 fill-current" />
                        <span className="text-gray-600">{selectedSession.customer.avgRating}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-1 flex-shrink-0">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setShowInternalNotes(!showInternalNotes)}
                    className={`hover:bg-yellow-50 hover:text-yellow-700 p-2 ${
                      showInternalNotes ? 'bg-yellow-100 text-yellow-700' : ''
                    }`}
                  >
                    <FileText className="w-3 h-3" />
                  </Button>
                  
                  <Dialog open={isTransferDialogOpen} onOpenChange={setIsTransferDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="hover:bg-orange-50 hover:text-orange-700">
                        <ArrowRightLeft className="w-4 h-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle className="flex items-center space-x-2">
                          <ArrowRightLeft className="w-5 h-5 text-orange-600" />
                          <span>Transfer Session</span>
                        </DialogTitle>
                        <DialogDescription>
                          Transfer chat ini ke agent atau departemen lain
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="transferTo" className="text-sm font-medium">Transfer ke</Label>
                          <Select>
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Pilih agent atau departemen" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="agent-sarah">Agent Sarah</SelectItem>
                              <SelectItem value="agent-mike">Agent Mike</SelectItem>
                              <SelectItem value="technical-team">Tim Teknis</SelectItem>
                              <SelectItem value="billing-team">Tim Billing</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="transferReason" className="text-sm font-medium">Alasan Transfer</Label>
                          <Textarea 
                            placeholder="Jelaskan alasan transfer..." 
                            rows={3}
                            className="mt-1"
                          />
                        </div>
                        <div className="flex justify-end space-x-2 pt-2">
                          <Button variant="outline" onClick={() => setIsTransferDialogOpen(false)}>
                            Batal
                          </Button>
                          <Button onClick={handleTransferSession} className="bg-orange-600 hover:bg-orange-700">
                            Transfer
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Dialog open={isWrapUpDialogOpen} onOpenChange={setIsWrapUpDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="hover:bg-green-50 hover:text-green-700">
                        <CheckCircle className="w-4 h-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle className="flex items-center space-x-2">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <span>Wrap-Up Session</span>
                        </DialogTitle>
                        <DialogDescription>
                          Selesaikan chat session ini
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="category" className="text-sm font-medium">Kategori Sesi</Label>
                          <Select>
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Pilih kategori" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="technical">Masalah Teknis</SelectItem>
                              <SelectItem value="billing">Pertanyaan Billing</SelectItem>
                              <SelectItem value="general">Pertanyaan Umum</SelectItem>
                              <SelectItem value="feature">Permintaan Fitur</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Tandai untuk Tim Lain</Label>
                          <div className="space-y-2 mt-2">
                            <div className="flex items-center space-x-2">
                              <input type="checkbox" id="sales" className="rounded border-gray-300" />
                              <Label htmlFor="sales" className="text-sm">Peluang Sales</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <input type="checkbox" id="churn" className="rounded border-gray-300" />
                              <Label htmlFor="churn" className="text-sm">Risiko Churn</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <input type="checkbox" id="feedback" className="rounded border-gray-300" />
                              <Label htmlFor="feedback" className="text-sm">Feedback Produk</Label>
                            </div>
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="summary" className="text-sm font-medium">Ringkasan Session</Label>
                          <Textarea 
                            placeholder="Ringkas masalah dan solusi yang diberikan..." 
                            rows={3}
                            className="mt-1"
                          />
                        </div>
                        <div className="flex justify-end space-x-2 pt-2">
                          <Button variant="outline" onClick={() => setIsWrapUpDialogOpen(false)}>
                            Batal
                          </Button>
                          <Button onClick={handleWrapUpSession} className="bg-green-600 hover:bg-green-700">
                            Selesaikan Session
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </div>

            {/* Internal Notes (Collapsible) */}
            {showInternalNotes && (
              <div className="p-4 bg-gradient-to-r from-yellow-50 to-amber-50 border-b border-yellow-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-yellow-700" />
                    <Label className="text-sm font-semibold text-yellow-800">Internal Notes</Label>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setShowInternalNotes(false)}
                    className="hover:bg-yellow-100 hover:text-yellow-800"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <Textarea 
                  value={internalNotes || selectedSession.internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                  placeholder="Catatan internal untuk tim..."
                  rows={2}
                  className="bg-white border-yellow-300 focus:border-yellow-500 focus:ring-yellow-500 resize-none text-sm"
                />
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-yellow-700">
                    💡 Hanya visible untuk tim internal
                  </p>
                  <Button size="sm" className="bg-yellow-600 hover:bg-yellow-700 text-white text-xs px-3 py-1">
                    <FileText className="w-3 h-3 mr-1" />
                    Simpan
                  </Button>
                </div>
              </div>
            )}

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-gray-50 to-white">
              {selectedSession.messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'agent' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-xs lg:max-w-md px-3 py-2 rounded-xl shadow-sm ${
                    message.type === 'agent' 
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white' 
                      : 'bg-white text-gray-900 border border-gray-200 shadow-md'
                  }`}>
                    <p className="text-sm leading-relaxed">{message.content}</p>
                    <div className={`text-xs mt-1.5 flex items-center justify-between ${
                      message.type === 'agent' ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      <span className="font-medium">
                        {new Date(message.timestamp).toLocaleTimeString('id-ID', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                      {message.type === 'agent' && (
                        <div className="flex items-center space-x-1">
                          {message.delivered && (
                            <div className="flex items-center space-x-1">
                              <CheckCircle className="w-3 h-3" />
                              <span className="text-xs">✓</span>
                            </div>
                          )}
                          {message.read && (
                            <div className="flex items-center space-x-1">
                              <Eye className="w-3 h-3" />
                              <span className="text-xs">👁</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Replies */}
            <div className="px-4 py-2 bg-gradient-to-r from-gray-50 to-blue-50 border-t border-gray-200">
              <div className="flex items-center space-x-2 mb-1">
                <Zap className="w-3 h-3 text-blue-600" />
                <span className="text-xs font-medium text-gray-700">Quick Replies</span>
              </div>
              <div className="flex space-x-1 overflow-x-auto pb-1">
                {quickReplies.map((reply, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="whitespace-nowrap text-xs px-2 py-1 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-all duration-200"
                    onClick={() => setMessageText(reply)}
                  >
                    {reply}
                  </Button>
                ))}
              </div>
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200 bg-white shadow-sm">
              <div className="flex items-end space-x-2">
                <div className="flex-1">
                  <Textarea
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ketik pesan..."
                    rows={2}
                    className="resize-none border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm"
                  />
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-gray-500">
                      💡 Quick replies untuk respon cepat
                    </p>
                    <div className="text-xs text-gray-500">
                      Enter untuk kirim
                    </div>
                  </div>
                </div>
                <div className="flex flex-col space-y-1">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="hover:bg-gray-100 hover:text-gray-700 p-2"
                    title="Attach file"
                  >
                    <Paperclip className="w-3 h-3" />
                  </Button>
                  <Button 
                    onClick={handleSendMessage} 
                    disabled={!messageText.trim()}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed p-2"
                    title="Send message"
                  >
                    <Send className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Pilih Chat Session</h3>
              <p className="text-gray-600">Pilih chat dari antrian untuk mulai membantu customer</p>
            </div>
          </div>
        )}
      </div>

      {/* Right Panel - Context & Help */}
      <div className="w-64 bg-white border-l border-gray-200 shadow-sm flex-shrink-0">
        <Tabs value={contextTab} onValueChange={setContextTab} className="h-full flex flex-col">
          <div className="p-2.5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50 flex-shrink-0">
            <h3 className="text-xs font-semibold text-gray-700 mb-1.5">Context & Help</h3>
            <TabsList className="grid w-full grid-cols-3 p-1 bg-white border border-gray-200">
              <TabsTrigger value="customer-info" className="text-xs data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700">
                Customer
              </TabsTrigger>
              <TabsTrigger value="knowledge" className="text-xs data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700">
                Knowledge
              </TabsTrigger>
              <TabsTrigger value="history" className="text-xs data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700">
                History
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Customer Info Tab */}
          <TabsContent value="customer-info" className="flex-1 overflow-y-auto p-2.5 pt-0">
            {selectedSession ? (
              <div className="space-y-2.5">
                {/* Customer Details */}
                <Card className="border-gray-200 hover:shadow-sm transition-shadow">
                  <CardHeader className="pb-1.5">
                    <CardTitle className="text-xs font-semibold text-gray-800">Customer Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2.5">
                    <div className="flex items-center space-x-2">
                      <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold text-xs flex-shrink-0">
                        {selectedSession.customer.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-gray-900 text-xs truncate">{selectedSession.customer.name}</h3>
                        <p className="text-xs text-gray-600 truncate">{selectedSession.customer.email}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-1.5 text-xs">
                      <div className="flex items-center space-x-2 p-1 bg-gray-50 rounded-lg">
                        <Building className="w-3 h-3 text-blue-600 flex-shrink-0" />
                        <span className="text-gray-700 font-medium truncate">{selectedSession.customer.company}</span>
                      </div>
                      <div className="flex items-center space-x-2 p-1 bg-gray-50 rounded-lg">
                        <Phone className="w-3 h-3 text-green-600 flex-shrink-0" />
                        <span className="text-gray-700 font-medium truncate">{selectedSession.customer.phone}</span>
                      </div>
                      <div className="flex items-center space-x-2 p-1 bg-gray-50 rounded-lg">
                        <Calendar className="w-3 h-3 text-purple-600 flex-shrink-0" />
                        <span className="text-gray-700 font-medium truncate">
                          Member since {new Date(selectedSession.customer.joinDate).toLocaleDateString('id-ID')}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Plan & Stats */}
                <Card className="border-gray-200 hover:shadow-sm transition-shadow">
                  <CardHeader className="pb-1.5">
                    <CardTitle className="text-xs font-semibold text-gray-800">Plan & Statistics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1.5">
                    <div className="flex items-center justify-between p-1 bg-blue-50 rounded-lg">
                      <span className="text-xs text-blue-700 font-medium truncate">Current Plan</span>
                      <Badge variant="blue" className="px-1 py-0.5 text-xs flex-shrink-0">{selectedSession.customer.plan}</Badge>
                    </div>
                    <div className="flex items-center justify-between p-1 bg-green-50 rounded-lg">
                      <span className="text-xs text-green-700 font-medium truncate">Total Sessions</span>
                      <span className="text-xs font-bold text-green-700 flex-shrink-0">{selectedSession.customer.totalSessions}</span>
                    </div>
                    <div className="flex items-center justify-between p-1 bg-yellow-50 rounded-lg">
                      <span className="text-xs text-yellow-700 font-medium truncate">Avg Rating</span>
                      <div className="flex items-center space-x-1 flex-shrink-0">
                        <Star className="w-3 h-3 text-yellow-500 fill-current" />
                        <span className="text-xs font-bold text-yellow-700">{selectedSession.customer.avgRating}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-1 bg-purple-50 rounded-lg">
                      <span className="text-xs text-purple-700 font-medium truncate">Last Activity</span>
                      <span className="text-xs font-bold text-purple-700 flex-shrink-0">
                        {new Date(selectedSession.customer.lastActivity).toLocaleDateString('id-ID')}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {/* Session Tags */}
                <Card className="border-gray-200 hover:shadow-sm transition-shadow">
                  <CardHeader className="pb-1.5">
                    <CardTitle className="text-xs font-semibold text-gray-800">Session Tags</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-1">
                      {selectedSession.tags.map(tag => (
                        <Badge key={tag} variant="gray" className="text-xs px-1 py-0.5 bg-gray-100 text-gray-700 border-gray-200">
                          {tag}
                        </Badge>
                      ))}
                      <Button variant="ghost" size="sm" className="h-4 px-1 hover:bg-gray-100 hover:text-gray-700">
                        <Plus className="w-2.5 h-2.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <Info className="w-6 h-6 mx-auto mb-1 text-gray-400" />
                  <p className="text-xs">Pilih chat untuk melihat info customer</p>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Knowledge Base Tab */}
          <TabsContent value="knowledge" className="flex-1 overflow-y-auto p-2.5 pt-0">
            <div className="space-y-2.5">
              <div className="relative">
                <Search className="absolute left-2 top-2 h-3 w-3 text-gray-400" />
                <Input
                  placeholder="Cari knowledge..."
                  className="pl-7 h-7 text-xs border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              
              <div className="space-y-1.5">
                {knowledgeArticles.map((article) => (
                  <Card key={article.id} className="p-2.5 hover:shadow-md cursor-pointer transition-all duration-200 border-gray-200 hover:border-blue-300">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-semibold text-gray-900 mb-1 truncate">{article.title}</h4>
                        <div className="flex items-center space-x-1">
                          <Badge variant="blue" className="text-xs px-1 py-0.5">
                            {article.category}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {article.relevance}%
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1 flex-shrink-0">
                        <BookOpen className="w-3 h-3 text-blue-600" />
                        <Badge variant="green" className="text-xs px-1 py-0.5">
                          {article.relevance}%
                        </Badge>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="flex-1 overflow-y-auto p-2.5 pt-0">
            {selectedSession ? (
              <div className="space-y-1.5">
                {customerHistory.map((item) => (
                  <Card key={item.id} className="p-2.5 hover:shadow-sm transition-shadow border-gray-200">
                    <div className="flex items-start justify-between mb-1.5">
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${
                          item.type === 'chat' ? 'bg-blue-500' :
                          item.type === 'email' ? 'bg-green-500' : 'bg-purple-500'
                        }`}></div>
                        <span className="text-xs font-medium text-gray-600">{item.date}</span>
                      </div>
                      {item.rating && (
                        <div className="flex items-center space-x-1 flex-shrink-0">
                          <Star className="w-3 h-3 text-yellow-500 fill-current" />
                          <span className="text-xs font-medium text-yellow-700">{item.rating}</span>
                        </div>
                      )}
                    </div>
                    <h4 className="text-xs font-semibold text-gray-900 mb-1 truncate">{item.summary}</h4>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-600 truncate">by {item.agent}</p>
                      <Badge variant="gray" className="text-xs px-1 py-0.5 bg-gray-100 text-gray-700 flex-shrink-0">
                        {item.type}
                      </Badge>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <History className="w-5 h-5 mx-auto mb-1 text-gray-400" />
                  <p className="text-xs">Pilih chat untuk melihat history</p>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AgentInbox;