/**
 * TestChatbotResponse Component
 * Reusable component for testing chatbot responses with knowledge content
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { Button, Input, Label } from '@/components/ui';
import {
  MessageSquare,
  Send,
  Clock,
  Zap,
  Sparkles
} from 'lucide-react';

const TestChatbotResponse = ({ knowledgeContent = '' }) => {
  // Chat testing state
  const [testMessage, setTestMessage] = useState('');
  const [selectedQuickMessage, setSelectedQuickMessage] = useState('');
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

  // Quick test messages
  const quickTestMessages = [
    'Bagaimana cara mengajukan gadai emas?',
    'Berapa lama proses approval?',
    'Apa saja syarat dokumen yang diperlukan?',
    'Berapa bunga yang dikenakan?',
    'Bisa bayar cicilan tidak?'
  ];
  const [isScrolling, setIsScrolling] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);

  // Chat container ref and scroll functions
  const chatContainerRef = useRef(null);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      setIsScrolling(true);
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });

      setTimeout(() => setIsScrolling(false), 500);
    }
  };

  const forceScrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  const handleScroll = () => {
    if (chatContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10;
      setShowScrollButton(!isAtBottom);
    }
  };

  // AI Response generation function
  const generateAIResponse = useCallback((message, _knowledgeContent) => {
    if (!message.trim()) return "Silakan ketik pesan untuk mendapatkan respons dari AI.";

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
  }, []);

  const handleTestMessage = () => {
    if (testMessage.trim()) {
      const response = generateAIResponse(testMessage, knowledgeContent);

      const newMessage = {
        id: Date.now(),
        type: 'user',
        message: testMessage,
        timestamp: new Date()
      };

      const botResponse = {
        id: Date.now() + 1,
        type: 'bot',
        message: response,
        timestamp: new Date()
      };

      setConversationHistory(prev => [...prev, newMessage, botResponse]);
      setTestMessage('');
    }
  };

  // Handle quick message selection
  const handleQuickMessage = (message) => {
    setSelectedQuickMessage(message);

    // Generate AI response directly
    const response = generateAIResponse(message, knowledgeContent);

    const newMessage = {
      id: Date.now(),
      type: 'user',
      message: message,
      timestamp: new Date()
    };

    const botResponse = {
      id: Date.now() + 1,
      type: 'bot',
      message: response,
      timestamp: new Date()
    };

    setConversationHistory(prev => [...prev, newMessage, botResponse]);
  };

  const clearChat = () => {
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
    setSelectedQuickMessage('');
    setTestMessage('');
  };

  // Auto-scroll when conversation updates
  useEffect(() => {
    forceScrollToBottom();
    const timer = setTimeout(() => {
      scrollToBottom();
    }, 100);
    return () => clearTimeout(timer);
  }, [conversationHistory]);

  return (
    <div className="space-y-6">
      {/* Quick Test Messages */}
      <div className="space-y-3">
        <Label className="text-sm font-medium flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-blue-600" />
          Quick Test Messages
        </Label>
        <div className="space-y-2">
          {quickTestMessages.map((message, index) => (
            <button
              key={index}
              onClick={() => handleQuickMessage(message)}
              className={`w-full text-left p-3 rounded-lg border transition-all duration-200 hover:shadow-md ${
                selectedQuickMessage === message
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <MessageSquare className="w-4 h-4 text-gray-500 flex-shrink-0" />
                <span className="text-sm">{message}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

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
              onScroll={handleScroll}
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
              onClick={clearChat}
              className="text-blue-600 hover:text-blue-800 hover:underline"
            >
              Clear Chat
            </button>
          </div>
        </div>
      </div>

      {/* AI Response Preview */}
      <div className="space-y-3">
        <Label className="text-sm font-medium flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-green-600" />
          AI Response Preview
        </Label>
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          {selectedQuickMessage || testMessage ? (
            <div className="p-4 space-y-3">
              <div className="text-sm text-gray-600">
                <strong>Pertanyaan:</strong> &ldquo;{selectedQuickMessage || testMessage}&rdquo;
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-green-800">AI Response:</span>
                </div>
                <div className="text-sm text-gray-700">
                  {generateAIResponse(selectedQuickMessage || testMessage, knowledgeContent)}
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Response length: {generateAIResponse(selectedQuickMessage || testMessage, knowledgeContent).length} chars</span>
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Confidence: High
                </span>
              </div>
            </div>
          ) : (
            <div className="p-4 text-sm text-gray-500 italic text-center">
              Pilih quick test message atau ketik pesan untuk melihat preview response
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default TestChatbotResponse;
