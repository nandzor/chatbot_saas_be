import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Label,
  Textarea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Badge,
  Alert,
  AlertDescription,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  ScrollArea
} from '@/components/ui';
import {
  Send,
  Image,
  File,
  Phone,
  MessageSquare,
  Users,
  Clock,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  Eye,
  EyeOff,
  MoreVertical,
  Trash2,
  Edit,
  Copy
} from 'lucide-react';
import { useWahaSessions } from '@/hooks/useWahaSessions';
import { wahaApi } from '@/services/wahaService';
import toast from 'react-hot-toast';

const WhatsAppMessageManager = () => {
  const {
    connectedSessions,
    sendMessage,
    sendMediaMessage,
    getMessages,
    getContacts,
    getGroups,
    validatePhoneNumber,
    formatPhoneNumber,
    loading
  } = useWahaSessions();

  const [selectedSession, setSelectedSession] = useState('');
  const [messageType, setMessageType] = useState('text');
  const [textMessage, setTextMessage] = useState('');
  const [recipient, setRecipient] = useState('');
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaCaption, setMediaCaption] = useState('');
  const [messages, setMessages] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [groups, setGroups] = useState([]);
  const [showContacts, setShowContacts] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [activeTab, setActiveTab] = useState('send');

  // Load contacts and groups when session changes
  useEffect(() => {
    if (selectedSession) {
      loadContacts();
      loadGroups();
      loadMessages();
    }
  }, [selectedSession]);

  const loadContacts = async () => {
    if (!selectedSession) return;
    try {
      const response = await getContacts(selectedSession);
      setContacts(response.data || []);
    } catch (error) {
      console.error('Error loading contacts:', error);
    }
  };

  const loadGroups = async () => {
    if (!selectedSession) return;
    try {
      const response = await getGroups(selectedSession);
      setGroups(response.data || []);
    } catch (error) {
      console.error('Error loading groups:', error);
    }
  };

  const loadMessages = async () => {
    if (!selectedSession) return;
    try {
      const response = await getMessages(selectedSession, { limit: 50 });
      setMessages(response.data || []);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!selectedSession || !recipient || !textMessage.trim()) {
      toast.error('Session, penerima, dan pesan wajib diisi');
      return;
    }

    setIsSending(true);
    setError(null);

    try {
      const formattedRecipient = formatPhoneNumber(recipient);

      if (messageType === 'text') {
        await sendMessage(selectedSession, formattedRecipient, textMessage);
        toast.success('Pesan berhasil dikirim');
      } else if (messageType === 'media') {
        if (!mediaUrl) {
          toast.error('URL media wajib diisi');
          return;
        }
        await sendMediaMessage(selectedSession, formattedRecipient, mediaUrl, mediaCaption);
        toast.success('Pesan media berhasil dikirim');
      }

      // Reset form
      setTextMessage('');
      setMediaUrl('');
      setMediaCaption('');
      setRecipient('');

      // Reload messages
      await loadMessages();
    } catch (error) {
      const errorMessage = error.message || 'Gagal mengirim pesan';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSending(false);
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // In a real implementation, you would upload the file to a server
      // and get the URL back. For now, we'll use a placeholder.
      const url = URL.createObjectURL(file);
      setMediaUrl(url);
      setMediaFile(file);
    }
  };

  const handleContactSelect = (contact) => {
    setRecipient(contact.id || contact.phone);
    setShowContacts(false);
  };

  const handleGroupSelect = (group) => {
    setRecipient(group.id);
    setShowContacts(false);
  };

  const filteredMessages = messages.filter(message => {
    const matchesSearch = !searchQuery ||
      message.body?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      message.from?.includes(searchQuery) ||
      message.to?.includes(searchQuery);

    const matchesFilter = filterType === 'all' ||
      (filterType === 'incoming' && message.fromMe === false) ||
      (filterType === 'outgoing' && message.fromMe === true);

    return matchesSearch && matchesFilter;
  });

  const getMessageStatus = (message) => {
    if (message.status === 'sent') {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    } else if (message.status === 'delivered') {
      return <CheckCircle className="w-4 h-4 text-blue-500" />;
    } else if (message.status === 'read') {
      return <CheckCircle className="w-4 h-4 text-green-600" />;
    } else {
      return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const formatMessageTime = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleString('id-ID');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Kelola Pesan WhatsApp</h2>
          <p className="text-muted-foreground">
            Kirim dan kelola pesan WhatsApp melalui WAHA
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={loadMessages}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Session Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Pilih Sesi WhatsApp</CardTitle>
          <CardDescription>
            Pilih sesi WhatsApp yang terhubung untuk mengirim pesan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="session">Sesi WhatsApp</Label>
              <Select value={selectedSession} onValueChange={setSelectedSession}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih sesi WhatsApp" />
                </SelectTrigger>
                <SelectContent>
                  {connectedSessions.map((session) => (
                    <SelectItem key={session.id} value={session.id}>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        {session.id}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {connectedSessions.length === 0 && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Tidak ada sesi WhatsApp yang terhubung. Silakan hubungkan sesi terlebih dahulu.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {selectedSession && (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="send">Kirim Pesan</TabsTrigger>
            <TabsTrigger value="history">Riwayat Pesan</TabsTrigger>
          </TabsList>

          {/* Send Message Tab */}
          <TabsContent value="send">
            <Card>
              <CardHeader>
                <CardTitle>Kirim Pesan</CardTitle>
                <CardDescription>
                  Kirim pesan teks atau media ke kontak atau grup WhatsApp
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Message Type Selection */}
                <div>
                  <Label>Jenis Pesan</Label>
                  <Select value={messageType} onValueChange={setMessageType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Pesan Teks</SelectItem>
                      <SelectItem value="media">Pesan Media</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Recipient Selection */}
                <div className="space-y-2">
                  <Label>Penerima</Label>
                  <div className="flex gap-2">
                    <Input
                      value={recipient}
                      onChange={(e) => setRecipient(e.target.value)}
                      placeholder="Nomor telepon (contoh: 081234567890)"
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      onClick={() => setShowContacts(true)}
                      className="flex items-center gap-2"
                    >
                      <Users className="w-4 h-4" />
                      Kontak
                    </Button>
                  </div>
                </div>

                {/* Message Content */}
                {messageType === 'text' ? (
                  <div>
                    <Label htmlFor="message">Pesan</Label>
                    <Textarea
                      id="message"
                      value={textMessage}
                      onChange={(e) => setTextMessage(e.target.value)}
                      placeholder="Ketik pesan Anda di sini..."
                      rows={4}
                      className="mt-1"
                    />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="mediaUrl">URL Media</Label>
                      <div className="flex gap-2">
                        <Input
                          id="mediaUrl"
                          value={mediaUrl}
                          onChange={(e) => setMediaUrl(e.target.value)}
                          placeholder="https://example.com/image.jpg"
                          className="flex-1"
                        />
                        <Button
                          variant="outline"
                          onClick={() => document.getElementById('fileInput').click()}
                          className="flex items-center gap-2"
                        >
                          <Upload className="w-4 h-4" />
                          Upload
                        </Button>
                        <input
                          id="fileInput"
                          type="file"
                          accept="image/*,video/*,audio/*,application/*"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="caption">Caption (Opsional)</Label>
                      <Textarea
                        id="caption"
                        value={mediaCaption}
                        onChange={(e) => setMediaCaption(e.target.value)}
                        placeholder="Tulis caption untuk media..."
                        rows={3}
                        className="mt-1"
                      />
                    </div>
                  </div>
                )}

                {/* Error Display */}
                {error && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* Send Button */}
                <Button
                  onClick={handleSendMessage}
                  disabled={isSending || !selectedSession || !recipient || (!textMessage.trim() && !mediaUrl)}
                  className="w-full flex items-center gap-2"
                >
                  {isSending ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Mengirim...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Kirim Pesan
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Message History Tab */}
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Riwayat Pesan</CardTitle>
                <CardDescription>
                  Lihat riwayat pesan yang telah dikirim dan diterima
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Search and Filter */}
                <div className="flex gap-4 mb-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        placeholder="Cari pesan..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua</SelectItem>
                      <SelectItem value="incoming">Masuk</SelectItem>
                      <SelectItem value="outgoing">Keluar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Messages List */}
                <ScrollArea className="h-96">
                  {filteredMessages.length === 0 ? (
                    <div className="text-center py-8">
                      <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">Tidak ada pesan</h3>
                      <p className="text-muted-foreground">
                        Belum ada pesan yang dikirim atau diterima
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {filteredMessages.map((message, index) => (
                        <div
                          key={index}
                          className={`p-3 rounded-lg border ${
                            message.fromMe
                              ? 'bg-blue-50 border-blue-200 ml-8'
                              : 'bg-gray-50 border-gray-200 mr-8'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm font-medium">
                                  {message.fromMe ? 'Anda' : message.from || message.to}
                                </span>
                                <Badge variant={message.fromMe ? 'default' : 'secondary'}>
                                  {message.fromMe ? 'Keluar' : 'Masuk'}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-700 mb-2">{message.body}</p>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Clock className="w-3 h-3" />
                                {formatMessageTime(message.timestamp)}
                                {getMessageStatus(message)}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Contacts Dialog */}
      <Dialog open={showContacts} onOpenChange={setShowContacts}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Pilih Kontak atau Grup</DialogTitle>
            <DialogDescription>
              Pilih kontak atau grup untuk mengirim pesan
            </DialogDescription>
          </DialogHeader>
          <Tabs defaultValue="contacts" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="contacts">Kontak ({contacts.length})</TabsTrigger>
              <TabsTrigger value="groups">Grup ({groups.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="contacts" className="space-y-2">
              <ScrollArea className="h-64">
                {contacts.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Tidak ada kontak</p>
                  </div>
                ) : (
                  contacts.map((contact, index) => (
                    <div
                      key={index}
                      className="p-3 hover:bg-gray-50 rounded-lg cursor-pointer"
                      onClick={() => handleContactSelect(contact)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <Phone className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">{contact.name || contact.id}</p>
                          <p className="text-sm text-muted-foreground">{contact.id}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </ScrollArea>
            </TabsContent>
            <TabsContent value="groups" className="space-y-2">
              <ScrollArea className="h-64">
                {groups.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Tidak ada grup</p>
                  </div>
                ) : (
                  groups.map((group, index) => (
                    <div
                      key={index}
                      className="p-3 hover:bg-gray-50 rounded-lg cursor-pointer"
                      onClick={() => handleGroupSelect(group)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <Users className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium">{group.name || group.id}</p>
                          <p className="text-sm text-muted-foreground">{group.id}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WhatsAppMessageManager;
