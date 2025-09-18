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
  Filter
} from 'lucide-react';
import { useWahaSessions } from '@/hooks/useWahaSessions';
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
  const [mediaCaption, setMediaCaption] = useState('');
  const [messages, setMessages] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [groups, setGroups] = useState([]);
  const [showContacts, setShowContacts] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState(null);

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
      const result = await getContacts(selectedSession);
      setContacts(result.data || result || []);
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error('Error loading contacts:', err);
      }
    }
  };

  const loadGroups = async () => {
    if (!selectedSession) return;

    try {
      const result = await getGroups(selectedSession);
      setGroups(result.data || result || []);
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error('Error loading groups:', err);
      }
    }
  };

  const loadMessages = async () => {
    if (!selectedSession) return;

    try {
      const result = await getMessages(selectedSession, { limit: 50 });
      setMessages(result.data || result || []);
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error('Error loading messages:', err);
      }
    }
  };

  const handleSendMessage = async () => {
    if (!selectedSession) {
      toast.error('Pilih sesi terlebih dahulu');
      return;
    }

    if (!recipient.trim()) {
      toast.error('Masukkan nomor penerima');
      return;
    }

    // Validate phone number
    const phoneValidation = validatePhoneNumber(recipient);
    if (!phoneValidation.valid) {
      toast.error(`Nomor telepon tidak valid: ${phoneValidation.error}`);
      return;
    }

    if (messageType === 'text' && !textMessage.trim()) {
      toast.error('Masukkan pesan');
      return;
    }

    if (messageType === 'media' && !mediaFile) {
      toast.error('Pilih file media');
      return;
    }

    try {
      setIsSending(true);
      setError(null);

      const messageData = {
        to: recipient.trim(),
        ...(messageType === 'text'
          ? { text: textMessage.trim() }
          : {
              media: mediaFile,
              caption: mediaCaption.trim() || undefined
            }
        )
      };

      if (messageType === 'text') {
        await sendMessage(selectedSession, messageData);
      } else {
        await sendMediaMessage(selectedSession, messageData);
      }

      // Clear form
      setTextMessage('');
      setMediaFile(null);
      setMediaCaption('');
      setRecipient('');

      // Reload messages
      await loadMessages();
    } catch (err) {
      const errorMessage = err.message || 'Gagal mengirim pesan';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSending(false);
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setMediaFile(file);
    }
  };

  const formatMessageTime = (timestamp) => {
    if (!timestamp) return '-';
    return new Date(timestamp).toLocaleString('id-ID');
  };

  const getMessageStatus = (message) => {
    if (message.status === 'sent') {
      return (
        <Badge variant="outline" className="text-green-600">
          <CheckCircle className="w-3 h-3 mr-1" />
          Terkirim
        </Badge>
      );
    }
    if (message.status === 'failed') {
      return (
        <Badge variant="outline" className="text-red-600">
          <AlertTriangle className="w-3 h-3 mr-1" />
          Gagal
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="text-yellow-600">
        <Clock className="w-3 h-3 mr-1" />
        Mengirim
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">WhatsApp Message Manager</h2>
          <p className="text-muted-foreground">
            Kirim dan kelola pesan WhatsApp melalui WAHA
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={loadMessages}
            disabled={loading || !selectedSession}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Send Message Form */}
        <Card>
          <CardHeader>
            <CardTitle>Kirim Pesan</CardTitle>
            <CardDescription>
              Kirim pesan teks atau media melalui WhatsApp
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Session Selection */}
            <div className="space-y-2">
              <Label htmlFor="session">Sesi WAHA</Label>
              <Select value={selectedSession} onValueChange={setSelectedSession}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih sesi WAHA" />
                </SelectTrigger>
                <SelectContent>
                  {connectedSessions.map((session) => (
                    <SelectItem key={session.id} value={session.id}>
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4" />
                        {session.id}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {connectedSessions.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Tidak ada sesi yang terhubung. Buat sesi WAHA terlebih dahulu.
                </p>
              )}
            </div>

            {/* Message Type */}
            <div className="space-y-2">
              <Label htmlFor="messageType">Tipe Pesan</Label>
              <Select value={messageType} onValueChange={setMessageType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      Pesan Teks
                    </div>
                  </SelectItem>
                  <SelectItem value="media">
                    <div className="flex items-center gap-2">
                      <Image className="w-4 h-4" />
                      Media (Gambar/Dokumen)
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Recipient */}
            <div className="space-y-2">
              <Label htmlFor="recipient">Nomor Penerima</Label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    id="recipient"
                    placeholder="6281234567890 (dengan kode negara)"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    className={recipient && !validatePhoneNumber(recipient).valid ? 'border-red-500' : ''}
                  />
                  {recipient && (
                    <div className="mt-1">
                      {validatePhoneNumber(recipient).valid ? (
                        <p className="text-xs text-green-600 flex items-center">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Nomor telepon valid
                        </p>
                      ) : (
                        <p className="text-xs text-red-600 flex items-center">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          {validatePhoneNumber(recipient).error}
                        </p>
                      )}
                    </div>
                  )}
                </div>
                <Dialog open={showContacts} onOpenChange={setShowContacts}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Users className="w-4 h-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Pilih Kontak</DialogTitle>
                      <DialogDescription>
                        Pilih dari daftar kontak yang tersedia
                      </DialogDescription>
                    </DialogHeader>
                    <div className="h-64 overflow-y-auto">
                      <div className="space-y-2">
                        {contacts.map((contact) => (
                          <div
                            key={contact.id}
                            className="flex items-center justify-between p-2 border rounded cursor-pointer hover:bg-gray-50"
                            onClick={() => {
                              setRecipient(contact.phone || contact.id);
                              setShowContacts(false);
                            }}
                          >
                            <div>
                              <p className="font-medium">{contact.name || contact.id}</p>
                              <p className="text-sm text-muted-foreground">
                                {contact.phone || contact.id}
                              </p>
                            </div>
                          </div>
                        ))}
                        {contacts.length === 0 && (
                          <p className="text-sm text-muted-foreground text-center py-4">
                            Tidak ada kontak tersedia
                          </p>
                        )}
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Message Content */}
            {messageType === 'text' ? (
              <div className="space-y-2">
                <Label htmlFor="textMessage">Pesan</Label>
                <Textarea
                  id="textMessage"
                  placeholder="Ketik pesan Anda di sini..."
                  value={textMessage}
                  onChange={(e) => setTextMessage(e.target.value)}
                  rows={4}
                />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="mediaFile">File Media</Label>
                  <Input
                    id="mediaFile"
                    type="file"
                    accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
                    onChange={handleFileChange}
                  />
                  {mediaFile && (
                    <p className="text-sm text-muted-foreground">
                      File: {mediaFile.name} ({(mediaFile.size / 1024 / 1024).toFixed(2)} MB)
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mediaCaption">Caption (Opsional)</Label>
                  <Textarea
                    id="mediaCaption"
                    placeholder="Tulis caption untuk media..."
                    value={mediaCaption}
                    onChange={(e) => setMediaCaption(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
            )}

            {/* Send Button */}
            <Button
              onClick={handleSendMessage}
              disabled={isSending || !selectedSession || !recipient.trim()}
              className="w-full"
            >
              {isSending ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Mengirim...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Kirim Pesan
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Messages History */}
        <Card>
          <CardHeader>
            <CardTitle>Riwayat Pesan</CardTitle>
            <CardDescription>
              Pesan yang telah dikirim melalui sesi ini
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!selectedSession ? (
              <div className="text-center py-8">
                <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Pilih sesi untuk melihat riwayat pesan</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Belum ada pesan</p>
              </div>
            ) : (
              <div className="h-96 overflow-y-auto">
                <div className="space-y-4">
                  {messages.map((message, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <p className="font-medium text-sm">
                            Ke: {message.to || message.recipient}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatMessageTime(message.timestamp || message.createdAt)}
                          </p>
                        </div>
                        {getMessageStatus(message)}
                      </div>

                      <div className="space-y-2">
                        {message.text && (
                          <p className="text-sm">{message.text}</p>
                        )}
                        {message.media && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <File className="w-4 h-4" />
                            <span>Media: {message.media.name || 'File'}</span>
                          </div>
                        )}
                        {message.caption && (
                          <p className="text-sm text-muted-foreground italic">
                            "{message.caption}"
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WhatsAppMessageManager;
