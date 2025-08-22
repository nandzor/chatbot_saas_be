import React, { useState, useEffect, useRef } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  Button,
  Badge,
  Input,
  Label,
  Textarea,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Alert,
  AlertDescription,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Progress,
  Separator
} from '@/components/ui';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  BookOpen, 
  Calendar,
  AlertCircle,
  Save,
  X,
  Crown,
  Info,
  MessageSquare,
  FileText,
  Tag,
  Globe,
  Hash,
  Send,
  CheckCircle,
  Clock,
  Eye,
  EyeOff,
  Zap,
  Target,
  Brain,
  Sparkles,
  Shield,
  TrendingUp,
  Users,
  BarChart3,
  FileCheck,
  AlertTriangle,
  Package,
  Settings,
  HelpCircle
} from 'lucide-react';
import { knowledgeArticles } from '@/data/sampleData';

// Utility function to safely parse and format dates
const parseDate = (dateString) => {
  try {
    let date = new Date(dateString);
    
    // If invalid, try parsing "YYYY-MM-DD HH:mm:ss" format
    if (isNaN(date.getTime()) && typeof dateString === 'string') {
      // Convert "YYYY-MM-DD HH:mm:ss" to ISO format
      if (dateString.match(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/)) {
        date = new Date(dateString.replace(' ', 'T') + 'Z');
      }
    }
    
    return isNaN(date.getTime()) ? new Date() : date;
  } catch (error) {
    return new Date();
  }
};

const Knowledge = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [articles, setArticles] = useState(knowledgeArticles.filter(article => article.status !== 'deleted'));
  const [isCreating, setIsCreating] = useState(false);
  const [editingArticle, setEditingArticle] = useState(null);
  const [activeTab, setActiveTab] = useState('qa');
  
  // Enhanced form data with professional fields
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    category: 'general',
    priority: 'medium',
    tags: [],
    language: 'id',
    isPublic: true,
    requiresApproval: false,
    qaItems: [
      {
        question: '',
        variations: '',
        answer: '',
        confidence: 'high',
        keywords: []
      }
    ]
  });
  
  const [charCount, setCharCount] = useState(0);
  const [testMessage, setTestMessage] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([
    {
      id: 1,
      type: 'user',
      message: 'Hallo, ada yang bisa dibantu?',
      timestamp: new Date()
    },
    {
      id: 2,
      type: 'bot',
      message: 'Halo! Selamat datang di platform kami. Saya asisten AI yang akan membantu menjawab pertanyaan Anda. Ada yang bisa saya bantu hari ini? 😊',
      timestamp: new Date()
    }
  ]);
  const MAX_CHARS = 7000;
  
  // Ref untuk chat container
  const chatContainerRef = useRef(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  
  // Enhanced auto-scroll function with smooth behavior
  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      setIsScrolling(true);
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
      
      // Reset scrolling state after animation
      setTimeout(() => setIsScrolling(false), 500);
    }
  };
  
  // Force scroll to bottom (for immediate scroll)
  const forceScrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };
  
  // Check scroll position and show/hide scroll button
  const handleScroll = () => {
    if (chatContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10; // 10px tolerance
      setShowScrollButton(!isAtBottom);
    }
  };
  
  // Auto-scroll when conversation updates
  useEffect(() => {
    // Use force scroll for immediate response
    forceScrollToBottom();
    
    // Add a small delay for smooth scroll effect
    const timer = setTimeout(() => {
      scrollToBottom();
    }, 100);
    
    return () => clearTimeout(timer);
  }, [conversationHistory]);
  
  // Add scroll event listener
  useEffect(() => {
    const chatContainer = chatContainerRef.current;
    if (chatContainer) {
      chatContainer.addEventListener('scroll', handleScroll);
      
      // Initial check
      handleScroll();
      
      return () => {
        chatContainer.removeEventListener('scroll', handleScroll);
      };
    }
  }, []);
  
  // Predefined categories and priorities
  const categories = [
    { value: 'general', label: 'Umum', icon: Info },
    { value: 'product', label: 'Produk', icon: Package },
    { value: 'service', label: 'Layanan', icon: Settings },
    { value: 'technical', label: 'Teknis', icon: Zap },
    { value: 'policy', label: 'Kebijakan', icon: Shield },
    { value: 'faq', label: 'FAQ', icon: HelpCircle }
  ];
  
  const priorities = [
    { value: 'low', label: 'Rendah', color: 'text-gray-500' },
    { value: 'medium', label: 'Sedang', color: 'text-blue-600' },
    { value: 'high', label: 'Tinggi', color: 'text-orange-600' },
    { value: 'critical', label: 'Kritis', color: 'text-red-600' }
  ];
  
  const languages = [
    { value: 'id', label: 'Bahasa Indonesia' },
    { value: 'en', label: 'English' },
    { value: 'ja', label: '日本語' },
    { value: 'ko', label: '한국어' },
    { value: 'zh', label: '中文' }
  ];
  
  const confidenceLevels = [
    { value: 'low', label: 'Rendah', color: 'text-red-500' },
    { value: 'medium', label: 'Sedang', color: 'text-yellow-500' },
    { value: 'high', label: 'Tinggi', color: 'text-green-500' }
  ];

  // Get active article count
  const activeArticleCount = articles.filter(article => article.status === 'active').length;
  const activeArticle = articles.find(article => article.status === 'active');

  // Filter articles berdasarkan search term
  const filteredArticles = articles.filter(article => 
    article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Fungsi untuk toggle status active/inactive (hanya 1 yang bisa aktif)
  const toggleStatus = (id) => {
    const targetArticle = articles.find(article => article.id === id);
    const currentActiveArticle = articles.find(article => article.status === 'active');
    
    if (targetArticle.status === 'active') {
      // Jika knowledge sedang aktif, nonaktifkan
      setArticles(prevArticles =>
        prevArticles.map(article =>
          article.id === id
            ? { ...article, status: 'inactive' }
            : article
        )
      );
    } else {
      // Jika knowledge inactive, konfirmasi jika ada knowledge aktif lain
      if (currentActiveArticle && currentActiveArticle.id !== id) {
        const confirmed = window.confirm(
          `Mengaktifkan "${targetArticle.title}" akan menonaktifkan "${currentActiveArticle.title}". Lanjutkan?`
        );
        if (!confirmed) return;
      }
      
      // Aktifkan knowledge target dan nonaktifkan yang lain
      setArticles(prevArticles =>
        prevArticles.map(article =>
          article.id === id
            ? { ...article, status: 'active' }
            : { ...article, status: 'inactive' }
        )
      );
    }
  };

  // Fungsi untuk soft delete
  const handleDelete = (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus knowledge ini?')) {
      setArticles(prevArticles =>
        prevArticles.map(article =>
          article.id === id
            ? { ...article, status: 'deleted' }
            : article
        ).filter(article => article.status !== 'deleted')
      );
    }
  };

  // Fungsi untuk menambah Q&A item baru
  const addQAItem = () => {
    setFormData(prev => ({
      ...prev,
      qaItems: [
        ...prev.qaItems,
        { question: '', variations: '', answer: '' }
      ]
    }));
  };

  // Fungsi untuk menghapus Q&A item
  const removeQAItem = (index) => {
    if (formData.qaItems.length > 1) {
      setFormData(prev => ({
        ...prev,
        qaItems: prev.qaItems.filter((_, i) => i !== index)
      }));
    }
  };

  // Fungsi untuk update Q&A item
  const updateQAItem = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      qaItems: prev.qaItems.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  // Fungsi untuk handle form input
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Update character count untuk content
    if (field === 'content') {
      setCharCount(value.length);
    }
  };

  // Enhanced form validation
  const validateForm = () => {
    const errors = {};
    
    if (!formData.title.trim()) {
      errors.title = 'Judul knowledge wajib diisi';
    } else if (formData.title.length < 10) {
      errors.title = 'Judul minimal 10 karakter';
    }
    
    if (!formData.description.trim()) {
      errors.description = 'Deskripsi knowledge wajib diisi';
    }
    
    if (activeTab === 'qa') {
      const hasValidQA = formData.qaItems.some(item => 
        item.question.trim() && item.answer.trim()
      );
      
      if (!hasValidQA) {
        errors.qa = 'Minimal satu Q&A harus diisi dengan lengkap';
      }
      
      // Validate individual QA items
      formData.qaItems.forEach((item, index) => {
        if (item.question.trim() && !item.answer.trim()) {
          errors[`qa-${index}-answer`] = 'Jawaban wajib diisi jika pertanyaan diisi';
        }
        if (!item.question.trim() && item.answer.trim()) {
          errors[`qa-${index}-question`] = 'Pertanyaan wajib diisi jika jawaban diisi';
        }
      });
    } else {
      if (!formData.content.trim()) {
        errors.content = 'Konten knowledge wajib diisi';
      } else if (formData.content.length < 100) {
        errors.content = 'Konten minimal 100 karakter';
      }
    }
    
    if (formData.tags.length === 0) {
      errors.tags = 'Minimal satu tag harus dipilih';
    }
    
    return errors;
  };

  // Enhanced form submission with validation
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Prepare enhanced data untuk disimpan
      const articleData = {
        id: editingArticle ? editingArticle.id : Date.now().toString(),
        title: formData.title.trim(),
        description: formData.description.trim(),
        content: activeTab === 'qa' ? '' : formData.content.trim(),
        category: formData.category,
        priority: formData.priority,
        tags: formData.tags,
        language: formData.language,
        isPublic: formData.isPublic,
        requiresApproval: formData.requiresApproval,
        metadata: activeTab === 'qa' ? {
          type: 'qa',
          qaItems: formData.qaItems.filter(item => 
            item.question.trim() && item.answer.trim()
          ).map(item => ({
            ...item,
            keywords: item.keywords.length > 0 ? item.keywords : 
              item.question.toLowerCase().split(' ').filter(word => word.length > 3)
          }))
        } : {
          type: 'article',
          wordCount: formData.content.trim().split(/\s+/).length,
          readingTime: Math.ceil(formData.content.trim().split(/\s+/).length / 200) // 200 words per minute
        },
        status: 'inactive',
        created_at: editingArticle ? editingArticle.created_at : new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: editingArticle ? editingArticle.created_by : 'Current User',
        version: editingArticle ? (editingArticle.version || 1) + 1 : 1
      };

      if (editingArticle) {
        // Update existing article
        setArticles(prevArticles =>
          prevArticles.map(article =>
            article.id === editingArticle.id ? articleData : article
          )
        );
      } else {
        // Create new article
        setArticles(prevArticles => [...prevArticles, articleData]);
      }

      // Reset form dan close modal
      resetForm();
      setIsCreating(false);
      setEditingArticle(null);
      setFormErrors({});
      
      // Show success message (in real app, use toast notification)
      console.log('Knowledge saved successfully!');
      
    } catch (error) {
      console.error('Error saving knowledge:', error);
      setFormErrors({ submit: 'Terjadi kesalahan saat menyimpan. Silakan coba lagi.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Enhanced reset form function
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      content: '',
      category: 'general',
      priority: 'medium',
      tags: [],
      language: 'id',
      isPublic: true,
      requiresApproval: false,
      qaItems: [{ question: '', variations: '', answer: '', confidence: 'high', keywords: [] }]
    });
    setCharCount(0);
    setActiveTab('qa');
    setTestMessage('');
    setShowAdvanced(false);
    setFormErrors({});
    setConversationHistory([
      {
        id: 1,
        type: 'user',
        message: 'Hallo, ada yang bisa dibantu?',
        timestamp: new Date()
      },
      {
        id: 2,
        type: 'bot',
        message: 'Halo! Selamat datang di platform kami. Saya asisten AI yang akan membantu menjawab pertanyaan Anda. Ada yang bisa saya bantu hari ini? 😊',
        timestamp: new Date()
      }
    ]);
  };

  // Tag management functions
  const addTag = (tag) => {
    if (tag.trim() && !formData.tags.includes(tag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag.trim()]
      }));
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  // Predefined tag suggestions
  const tagSuggestions = [
    'gadai', 'emas', 'cicilan', 'pembayaran', 'persetujuan', 'dokumen', 'syarat', 'proses',
    'bunga', 'jasa', 'admin', 'biaya', 'jaminan', 'pelunasan', 'perpanjangan', 'penarikan'
  ];

  // Reset form to default values
  const handleResetSettings = () => {
    if (editingArticle) {
      // Reset to original values when editing
      handleEdit(editingArticle);
    } else {
      // Reset to empty form when creating
      resetForm();
    }
  };

  // Enhanced edit article function
  const handleEdit = (article) => {
    setEditingArticle(article);
    setFormData({
      title: article.title || '',
      description: article.description || '',
      content: article.content || '',
      category: article.category || 'general',
      priority: article.priority || 'medium',
      tags: article.tags || [],
      language: article.language || 'id',
      isPublic: article.isPublic !== undefined ? article.isPublic : true,
      requiresApproval: article.requiresApproval || false,
      qaItems: article.metadata?.type === 'qa' ? 
        article.metadata.qaItems.map(qa => ({
          ...qa,
          confidence: qa.confidence || 'high',
          keywords: qa.keywords || []
        })) : 
        [{ question: '', variations: '', answer: '', confidence: 'high', keywords: [] }]
    });
    setActiveTab(article.metadata?.type === 'qa' ? 'qa' : 'article');
    setCharCount(article.content ? article.content.length : 0);
    setFormErrors({});
    setIsCreating(true);
  };

  // Enhanced test message handler with conversation history
  const handleTestMessage = () => {
    if (testMessage.trim()) {
      // Generate AI response
      const response = generateAIResponse(testMessage, formData.content);
      
      // Add user message to conversation
      const userMessage = {
        id: Date.now(),
        type: 'user',
        message: testMessage,
        timestamp: new Date()
      };
      
      // Add bot response to conversation
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        message: response,
        timestamp: new Date()
      };
      
      // Update conversation history
      setConversationHistory(prev => [...prev, userMessage, botMessage]);
      
      // Log for debugging
      console.log('Test message:', testMessage);
      console.log('AI Response:', response);
      
      // Clear the input after sending
      setTestMessage('');
      
      // In a real implementation, you might want to:
      // 1. Call actual AI API
      // 2. Track usage metrics
      // 3. Store in database
      // 4. Real-time updates
    }
  };

  // Enhanced AI response generation with random responses
  const generateAIResponse = (message, knowledgeContent) => {
    if (!message.trim()) return "Silakan ketik pesan untuk mendapatkan respons dari AI.";
    
    // Enhanced random responses based on message content
    const messageLower = message.toLowerCase();
    
    // Context-aware responses
    if (messageLower.includes('hallo') || messageLower.includes('hai') || messageLower.includes('hello')) {
      const greetings = [
        "Halo! Selamat datang di platform kami. Saya asisten AI yang siap membantu Anda. Ada yang bisa saya bantu hari ini? 😊",
        "Hai! Senang bertemu dengan Anda. Saya di sini untuk membantu menjawab pertanyaan seputar layanan kami. Apa yang ingin Anda ketahui?",
        "Hello! Terima kasih telah menghubungi kami. Saya asisten AI yang akan membantu Anda. Ada pertanyaan spesifik yang ingin Anda ajukan?",
        "Halo! Selamat datang kembali. Saya siap membantu Anda dengan informasi yang Anda butuhkan. Apa yang ingin Anda tanyakan?"
      ];
      return greetings[Math.floor(Math.random() * greetings.length)];
    }
    
    if (messageLower.includes('gadai') || messageLower.includes('emas')) {
      const gadaiResponses = [
        "Untuk layanan gadai emas, kami menyediakan berbagai pilihan dengan proses yang mudah dan cepat. Berdasarkan knowledge base kami, Anda dapat mengajukan gadai emas dengan dokumen yang diperlukan.",
        "Layanan gadai emas kami sangat fleksibel dengan berbagai tenor dan bunga yang kompetitif. Saya dapat membantu menjelaskan detail proses dan persyaratannya.",
        "Gadai emas adalah salah satu layanan unggulan kami. Berdasarkan informasi terbaru, proses approval membutuhkan waktu 1-3 hari kerja dengan jaminan keamanan yang terjamin."
      ];
      return gadaiResponses[Math.floor(Math.random() * gadaiResponses.length)];
    }
    
    if (messageLower.includes('cicilan') || messageLower.includes('bayar') || messageLower.includes('pembayaran')) {
      const paymentResponses = [
        "Untuk pembayaran cicilan, kami menyediakan berbagai metode pembayaran yang fleksibel. Anda dapat memilih tenor 3, 6, 12, atau 24 bulan sesuai kemampuan finansial.",
        "Pembayaran cicilan dapat dilakukan melalui transfer bank, e-wallet, atau pembayaran langsung di kantor kami. Setiap metode memiliki keunggulan masing-masing.",
        "Berdasarkan knowledge base kami, cicilan dapat diatur sesuai dengan penghasilan bulanan Anda. Kami juga menyediakan opsi pembayaran di muka untuk mengurangi beban bunga."
      ];
      return paymentResponses[Math.floor(Math.random() * paymentResponses.length)];
    }
    
    if (messageLower.includes('proses') || messageLower.includes('cara') || messageLower.includes('langkah')) {
      const processResponses = [
        "Proses pengajuan sangat sederhana. Pertama, siapkan dokumen yang diperlukan. Kedua, ajukan melalui aplikasi atau datang ke kantor kami. Ketiga, tunggu approval yang biasanya 1-3 hari kerja.",
        "Langkah-langkahnya mudah sekali! Mulai dari pengisian formulir, verifikasi dokumen, hingga pencairan dana. Saya dapat menjelaskan detail setiap tahap jika diperlukan.",
        "Cara mengajukan layanan kami sangat straightforward. Berdasarkan knowledge base, proses dari awal hingga selesai membutuhkan waktu maksimal 5 hari kerja."
      ];
      return processResponses[Math.floor(Math.random() * processResponses.length)];
    }
    
    if (messageLower.includes('biaya') || messageLower.includes('harga') || messageLower.includes('tarif')) {
      const costResponses = [
        "Biaya layanan kami sangat transparan dan kompetitif. Untuk detail lengkap, saya dapat memberikan breakdown biaya administrasi, bunga, dan biaya lainnya.",
        "Tarif yang kami kenakan sudah termasuk semua biaya tersembunyi. Berdasarkan knowledge base, tidak ada biaya tambahan yang akan dikenakan di luar yang sudah disepakati.",
        "Harga layanan kami sangat terjangkau dengan berbagai pilihan paket. Saya dapat membantu menghitung total biaya berdasarkan jumlah pinjaman dan tenor yang Anda pilih."
      ];
      return costResponses[Math.floor(Math.random() * costResponses.length)];
    }
    
    // Default responses for other questions
    const defaultResponses = [
      "Terima kasih atas pertanyaannya. Berdasarkan knowledge base kami, saya dapat membantu menjelaskan detail layanan yang Anda butuhkan.",
      "Pertanyaan yang sangat bagus! Saya menemukan informasi relevan dalam knowledge base kami yang dapat membantu menjawab pertanyaan Anda.",
      "Berdasarkan data yang tersedia, saya dapat memberikan informasi lengkap seputar layanan yang Anda tanyakan. Ada detail spesifik yang ingin Anda ketahui?",
      "Saya senang Anda bertanya tentang hal ini. Knowledge base kami memiliki informasi yang komprehensif untuk menjawab pertanyaan Anda.",
      "Pertanyaan yang tepat! Saya dapat membantu Anda dengan informasi yang akurat berdasarkan knowledge base terbaru kami.",
      "Terima kasih telah menghubungi kami. Saya menemukan beberapa informasi relevan yang dapat membantu menjawab pertanyaan Anda.",
      "Berdasarkan knowledge yang tersedia, saya dapat memberikan panduan lengkap untuk pertanyaan Anda. Ada aspek tertentu yang ingin Anda ketahui lebih detail?",
      "Saya di sini untuk membantu! Knowledge base kami memiliki informasi yang dapat menjawab pertanyaan Anda dengan lengkap dan akurat."
    ];
    
    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
  };

  // Fungsi untuk close modal
  const closeModal = () => {
    setIsCreating(false);
    setEditingArticle(null);
    resetForm();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Knowledge Base</h1>
          <p className="text-gray-600">Kelola pengetahuan dan FAQ untuk bot</p>
        </div>
        <Button onClick={() => setIsCreating(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Tambah Pengetahuan Baru
        </Button>
      </div>

      {/* Active Knowledge Status */}
      {activeArticle && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Knowledge Aktif:</strong> {activeArticle.title}
            {activeArticle.metadata?.type === 'qa' && (
              <span className="ml-2 text-blue-600">
                ({activeArticle.metadata.qaItems.length} Q&A)
              </span>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Cari knowledge..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Articles Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Knowledge</CardTitle>
          <CardDescription>
            {filteredArticles.length} knowledge tersedia
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Judul</TableHead>
                <TableHead>Tipe</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Dibuat</TableHead>
                <TableHead className="w-20">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredArticles.map((article) => (
                <TableRow key={article.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{article.title}</div>
                      <div className="text-sm text-gray-500">
                        {article.metadata?.type === 'qa' ? 
                          `${article.metadata.qaItems.length} Q&A` : 
                          `${article.metadata?.wordCount || 0} kata`
                        }
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={article.metadata?.type === 'qa' ? 'default' : 'secondary'}>
                      {article.metadata?.type === 'qa' ? 'Q&A' : 'Knowledge'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {article.tags?.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={article.status === 'active'}
                        onCheckedChange={() => toggleStatus(article.id)}
                      />
                      <Badge variant={article.status === 'active' ? 'default' : 'secondary'}>
                        {article.status === 'active' ? 'Aktif' : 'Tidak Aktif'}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-500">
                      {parseDate(article.created_at).toLocaleDateString('id-ID')}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(article)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(article.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create/Edit Modal */}
      {isCreating && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              closeModal();
            }
          }}
        >
          <div 
            className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-8">
              {/* Enhanced Header */}
              <div className="flex justify-between items-start mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Brain className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {editingArticle ? 'Edit Knowledge' : 'Tambah Knowledge Baru'}
                    </h2>
                    <p className="text-gray-600 mt-1">
                      {editingArticle ? 'Perbarui informasi knowledge yang sudah ada' : 'Buat knowledge baru untuk meningkatkan kemampuan bot'}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={closeModal} className="hover:bg-gray-100 rounded-full">
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Progress Indicator */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Progress Form</span>
                  <span className="text-sm text-gray-500">
                    {activeTab === 'qa' ? 'Step 1 of 2' : 'Step 2 of 2'}
                  </span>
                </div>
                <Progress value={activeTab === 'qa' ? 50 : 100} className="h-2" />
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Title */}
                  <div className="lg:col-span-2 space-y-2">
                    <Label htmlFor="title" className="text-sm font-medium flex items-center gap-2">
                      <Target className="w-4 h-4 text-blue-600" />
                      Judul Knowledge *
                    </Label>
                    <Input
                      id="title"
                      placeholder="Contoh: Pertanyaan Seputar Gadai Emas, Panduan Lengkap Pembayaran Cicilan"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      className={formErrors.title ? 'border-red-500' : ''}
                      required
                    />
                    {formErrors.title && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {formErrors.title}
                      </p>
                    )}
                  </div>

                  {/* Description */}
                  <div className="lg:col-span-2 space-y-2">
                    <Label htmlFor="description" className="text-sm font-medium flex items-center gap-2">
                      <FileText className="w-4 h-4 text-green-600" />
                      Deskripsi Singkat *
                    </Label>
                    <Textarea
                      id="description"
                      placeholder="Jelaskan secara singkat tentang knowledge ini (maksimal 200 karakter)"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      rows={3}
                      maxLength={200}
                      className={formErrors.description ? 'border-red-500' : ''}
                      required
                    />
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>{formData.description.length}/200 karakter</span>
                      {formErrors.description && (
                        <span className="text-red-600 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {formErrors.description}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Category and Priority */}
                  <div className="space-y-2">
                    <Label htmlFor="category" className="text-sm font-medium flex items-center gap-2">
                      <Tag className="w-4 h-4 text-purple-600" />
                      Kategori *
                    </Label>
                    <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => {
                          const IconComponent = category.icon;
                          return (
                            <SelectItem key={category.value} value={category.value}>
                              <div className="flex items-center gap-2">
                                <IconComponent className="w-4 h-4" />
                                {category.label}
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="priority" className="text-sm font-medium flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-orange-600" />
                      Prioritas
                    </Label>
                    <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {priorities.map((priority) => (
                          <SelectItem key={priority.value} value={priority.value}>
                            <span className={priority.color}>{priority.label}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Language and Visibility */}
                  <div className="space-y-2">
                    <Label htmlFor="language" className="text-sm font-medium flex items-center gap-2">
                      <Globe className="w-4 h-4 text-blue-600" />
                      Bahasa
                    </Label>
                    <Select value={formData.language} onValueChange={(value) => handleInputChange('language', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {languages.map((lang) => (
                          <SelectItem key={lang.value} value={lang.value}>
                            {lang.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="visibility" className="text-sm font-medium flex items-center gap-2">
                      <Eye className="w-4 h-4 text-gray-600" />
                      Visibilitas
                    </Label>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <Switch
                          id="isPublic"
                          checked={formData.isPublic}
                          onCheckedChange={(checked) => handleInputChange('isPublic', checked)}
                        />
                        <Label htmlFor="isPublic">Knowledge Publik</Label>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Switch
                          id="requiresApproval"
                          checked={formData.requiresApproval}
                          onCheckedChange={(checked) => handleInputChange('requiresApproval', checked)}
                        />
                        <Label htmlFor="requiresApproval">Perlu Persetujuan</Label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tags Section */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Hash className="w-4 h-4 text-indigo-600" />
                    Tags *
                  </Label>
                  <div className="space-y-3">
                    {/* Current Tags */}
                    {formData.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {formData.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="px-3 py-1">
                            {tag}
                            <button
                              type="button"
                              onClick={() => removeTag(tag)}
                              className="ml-2 hover:text-red-600"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                    
                    {/* Tag Input */}
                    <div className="flex gap-2">
                      <Input
                        placeholder="Ketik tag dan tekan Enter"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addTag(e.target.value);
                            e.target.value = '';
                          }
                        }}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          const input = document.querySelector('input[placeholder="Ketik tag dan tekan Enter"]');
                          if (input && input.value.trim()) {
                            addTag(input.value);
                            input.value = '';
                          }
                        }}
                      >
                        Tambah
                      </Button>
                    </div>
                    
                    {/* Tag Suggestions */}
                    <div className="space-y-2">
                      <p className="text-xs text-gray-500">Tag yang sering digunakan:</p>
                      <div className="flex flex-wrap gap-2">
                        {tagSuggestions.slice(0, 8).map((tag) => (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => addTag(tag)}
                            className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-md text-gray-700 transition-colors"
                          >
                            + {tag}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    {formErrors.tags && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {formErrors.tags}
                      </p>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Tab Interface */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="qa" className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      Input Q&A
                    </TabsTrigger>
                    <TabsTrigger value="article" className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Input Knowledge
                    </TabsTrigger>
                  </TabsList>

                  {/* Tab 1: Input Q&A */}
                  <TabsContent value="qa" className="space-y-6 mt-6">
                    <div className="space-y-4">
                      {formData.qaItems.map((item, index) => (
                        <Card key={index} className="border-l-4 border-l-blue-500">
                          <CardHeader>
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                  <MessageSquare className="w-4 h-4 text-blue-600" />
                                </div>
                                <div>
                                  <CardTitle className="text-lg">Q&A #{index + 1}</CardTitle>
                                  <p className="text-sm text-gray-500">Pertanyaan dan jawaban untuk bot</p>
                                </div>
                              </div>
                              {formData.qaItems.length > 1 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeQAItem(index)}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-6">
                            {/* Question Section */}
                            <div className="space-y-3">
                              <Label htmlFor={`question-${index}`} className="text-sm font-medium flex items-center gap-2">
                                <Target className="w-4 h-4 text-blue-600" />
                                Pertanyaan Pengguna *
                              </Label>
                              <Input
                                id={`question-${index}`}
                                placeholder="Contoh: Berapa lama proses persetujuan gadai?"
                                value={item.question}
                                onChange={(e) => updateQAItem(index, 'question', e.target.value)}
                                className={formErrors[`qa-${index}-question`] ? 'border-red-500' : ''}
                                required
                              />
                              {formErrors[`qa-${index}-question`] && (
                                <p className="text-sm text-red-600 flex items-center gap-1">
                                  <AlertCircle className="w-4 h-4" />
                                  {formErrors[`qa-${index}-question`]}
                                </p>
                              )}
                            </div>

                            {/* Answer Section */}
                            <div className="space-y-3">
                              <Label htmlFor={`answer-${index}`} className="text-sm font-medium flex items-center gap-2">
                                <Brain className="w-4 h-4 text-green-600" />
                                Jawaban Bot *
                              </Label>
                              <Textarea
                                id={`answer-${index}`}
                                placeholder="Tulis jawaban yang singkat, jelas, dan langsung untuk pertanyaan tersebut"
                                value={item.answer}
                                onChange={(e) => updateQAItem(index, 'answer', e.target.value)}
                                rows={4}
                                className={formErrors[`qa-${index}-answer`] ? 'border-red-500' : ''}
                                required
                              />
                              {formErrors[`qa-${index}-answer`] && (
                                <p className="text-sm text-red-600 flex items-center gap-1">
                                  <AlertCircle className="w-4 h-4" />
                                  {formErrors[`qa-${index}-answer`]}
                                </p>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}

                      <Button
                        type="button"
                        variant="outline"
                        onClick={addQAItem}
                        className="w-full h-12 border-dashed border-2 hover:border-blue-500 hover:bg-blue-50 transition-all"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        + Tambah Q&A Baru
                      </Button>
                    </div>

                    {formErrors.qa && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{formErrors.qa}</AlertDescription>
                      </Alert>
                    )}
                  </TabsContent>

                  {/* Tab 2: Input Knowledge */}
                  <TabsContent value="article" className="space-y-6 mt-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Editor Teks Kaya */}
                      <div className="lg:col-span-2 space-y-4">
                        <Label htmlFor="content" className="text-sm font-medium">
                          Konten Knowledge *
                        </Label>
                        <Textarea
                          id="content"
                          placeholder="Tulis konten knowledge Anda di sini..."
                          value={formData.content}
                          onChange={(e) => handleInputChange('content', e.target.value)}
                          rows={20}
                          className="font-mono"
                          required
                        />
                        <div className="flex justify-between text-sm text-gray-500">
                          <span>{charCount} karakter</span>
                          <span>{MAX_CHARS - charCount} tersisa</span>
                        </div>
                        
                        {/* Testing Tips - Moved here below Konten Knowledge */}
                        <div className="space-y-3 pt-4 border-t border-gray-200">
                          <Label className="text-sm font-medium flex items-center gap-2">
                            <Info className="w-4 h-4 text-blue-600" />
                            Testing Tips
                          </Label>
                          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                            <div className="text-xs text-yellow-800 space-y-1">
                              <p className="font-medium">💡 Tips untuk testing yang efektif:</p>
                              <ul className="space-y-1 ml-2">
                                <li>• Gunakan pertanyaan yang spesifik dan jelas</li>
                                <li>• Test berbagai jenis pertanyaan (umum, teknis, spesifik)</li>
                                <li>• Perhatikan konteks dan relevansi jawaban</li>
                                <li>• Test dengan bahasa yang berbeda</li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Enhanced Chatbot Testing Panel */}
                      <div className="space-y-6">
                        {/* Chat Testing Interface */}
                        <div className="space-y-3">
                          <Label className="text-sm font-medium flex items-center gap-2">
                            <MessageSquare className="w-4 h-4 text-blue-600" />
                            Test Chatbot Response
                          </Label>
                          <div className="border-2 border-gray-200 rounded-xl p-4 bg-gradient-to-br from-gray-50 to-white shadow-sm">
                            {/* Dynamic Chat Preview */}
                            <div className="relative">
                              {/* Scroll Position Indicator */}
                              {showScrollButton && (
                                <div className="absolute top-0 right-0 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-bl-lg z-10">
                                  <div className="flex items-center gap-1">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                                    Scroll ke atas
                                  </div>
                                </div>
                              )}
                              
                              <div 
                                ref={chatContainerRef}
                                className={`space-y-3 mb-4 max-h-48 overflow-y-auto scroll-smooth transition-all duration-200 ${
                                  isScrolling ? 'ring-2 ring-green-500 ring-opacity-50' : ''
                                }`}
                                style={{ scrollBehavior: 'smooth' }}
                              >
                                {conversationHistory.map((msg) => (
                                  <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`px-3 py-2 rounded-2xl max-w-[85%] shadow-sm ${
                                      msg.type === 'user' 
                                        ? 'bg-blue-500 text-white' 
                                        : 'bg-white border border-gray-200 text-gray-800'
                                    }`}>
                                      <p className="text-sm font-medium">{msg.message}</p>
                                      <div className={`text-xs mt-1 ${
                                        msg.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                                      }`}>
                                        {msg.timestamp.toLocaleTimeString('id-ID', { 
                                          hour: '2-digit', 
                                          minute: '2-digit' 
                                        })}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                              
                              {/* Scroll to Bottom Button - Only show when not at bottom */}
                              <div 
                                className={`absolute bottom-2 right-2 transition-all duration-300 group ${
                                  showScrollButton 
                                    ? 'opacity-100 translate-y-0' 
                                    : 'opacity-0 translate-y-2 pointer-events-none'
                                }`}
                              >
                                <button
                                  type="button"
                                  onClick={scrollToBottom}
                                  className={`w-8 h-8 rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110 ${
                                    isScrolling 
                                      ? 'bg-green-600 hover:bg-green-700' 
                                      : 'bg-blue-600 hover:bg-blue-700'
                                  }`}
                                  title={isScrolling ? 'Scrolling...' : 'Scroll ke pesan terbaru'}
                                  disabled={isScrolling}
                                >
                                  {isScrolling ? (
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                  ) : (
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                    </svg>
                                  )}
                                </button>
                                
                                {/* Scroll Status Indicator */}
                                {showScrollButton && !isScrolling && (
                                  <div className="absolute -top-8 right-0 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                    Scroll ke bawah
                                    <div className="absolute top-full right-2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            {/* Test Input */}
                            <div className="space-y-3">
                              <div className="flex gap-2">
                                <Input
                                  placeholder="Ketik pesan test untuk bot..."
                                  className="flex-1 h-10 text-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                  value={testMessage}
                                  onChange={(e) => setTestMessage(e.target.value)}
                                  onKeyPress={(e) => e.key === 'Enter' && handleTestMessage()}
                                />
                                <Button
                                  type="button"
                                  size="sm"
                                  onClick={handleTestMessage}
                                  className="h-10 px-4 bg-blue-600 hover:bg-blue-700 shadow-sm"
                                  disabled={!testMessage.trim()}
                                >
                                  <Send className="w-4 h-4" />
                                </Button>
                              </div>
                              
                              {/* Character count */}
                              <div className="text-xs text-gray-500 text-center">
                                {testMessage.length}/500 karakter
                              </div>
                            </div>
                            
                            {/* AI Credits Info & Actions */}
                            <div className="flex items-center justify-between text-xs text-gray-500 mt-3 pt-3 border-t border-gray-200">
                              <div className="flex items-center gap-3">
                                <span className="flex items-center gap-1">
                                  <Zap className="w-3 h-3 text-yellow-500" />
                                  AI credits used: {conversationHistory.length - 2}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-blue-500" />
                                  Response time: ~2s
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => setConversationHistory([
                                  {
                                    id: 1,
                                    type: 'user',
                                    message: 'Hallo, ada yang bisa dibantu?',
                                    timestamp: new Date()
                                  },
                                  {
                                    id: 2,
                                    type: 'bot',
                                    message: 'Halo! Selamat datang di platform kami. Saya asisten AI yang akan membantu menjawab pertanyaan Anda. Ada yang bisa saya bantu hari ini? 😊',
                                    timestamp: new Date()
                                  }
                                ])}
                                className="text-blue-600 hover:text-blue-800 hover:underline"
                              >
                                Clear Chat
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Quick Test Messages */}
                        <div className="space-y-3">
                          <Label className="text-sm font-medium flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-purple-600" />
                            Quick Test Messages
                          </Label>
                          <div className="space-y-2">
                            {[
                              'Bagaimana cara mengajukan gadai emas?',
                              'Berapa lama proses approval?',
                              'Apa saja syarat dokumen yang diperlukan?',
                              'Berapa bunga yang dikenakan?',
                              'Bisa bayar cicilan tidak?'
                            ].map((msg, index) => (
                              <Button
                                key={index}
                                type="button"
                                variant="outline"
                                size="sm"
                                className="w-full h-9 justify-start text-sm hover:bg-blue-50 hover:border-blue-300 transition-colors"
                                onClick={() => setTestMessage(msg)}
                              >
                                <MessageSquare className="w-3 h-3 mr-2 text-blue-600" />
                                {msg}
                              </Button>
                            ))}
                          </div>
                        </div>

                        {/* Enhanced Response Preview */}
                        <div className="space-y-3">
                          <Label className="text-sm font-medium flex items-center gap-2">
                            <Brain className="w-4 h-4 text-green-600" />
                            AI Response Preview
                          </Label>
                          <div className="border-2 border-gray-200 rounded-xl p-4 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-sm">
                            <div className="flex items-center gap-2 mb-3">
                              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                              <span className="text-sm font-medium text-gray-700">AI Response:</span>
                            </div>
                            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm min-h-[80px]">
                              {testMessage ? (
                                <div className="space-y-2">
                                  <div className="text-sm text-gray-600">
                                    <strong>Pertanyaan:</strong> "{testMessage}"
                                  </div>
                                  <div className="text-sm text-gray-800 leading-relaxed">
                                    {generateAIResponse(testMessage, formData.content)}
                                  </div>
                                </div>
                              ) : (
                                <div className="text-sm text-gray-500 text-center py-4">
                                  <MessageSquare className="w-6 h-6 mx-auto mb-2 text-gray-400" />
                                  Ketik pesan test untuk melihat preview response AI...
                                </div>
                              )}
                            </div>
                            
                            {/* Response Stats */}
                            {testMessage && (
                              <div className="flex items-center justify-between text-xs text-gray-500 mt-3 pt-3 border-t border-gray-200">
                                <span>Response length: {generateAIResponse(testMessage, formData.content).length} chars</span>
                                <span>Confidence: High</span>
                              </div>
                            )}
                          </div>
                        </div>


                      </div>
                    </div>
                  </TabsContent>
                </Tabs>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-8 border-t mt-8">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={closeModal}
                    className="flex-1 h-12"
                    disabled={isSubmitting}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Batal
                  </Button>
                  
                  <div className="flex gap-3 flex-1">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleResetSettings}
                      className="h-12"
                      disabled={isSubmitting}
                    >
                      Reset
                    </Button>
                    
                    <Button 
                      type="submit" 
                      className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Menyimpan...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          {editingArticle ? 'Update Knowledge' : 'Simpan Knowledge'}
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Submit Error */}
                {formErrors.submit && (
                  <Alert variant="destructive" className="mt-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{formErrors.submit}</AlertDescription>
                  </Alert>
                )}
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Knowledge;