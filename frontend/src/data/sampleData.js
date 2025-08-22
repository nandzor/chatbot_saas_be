// Sample data untuk semua komponen
export const conversationsData = [
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

export const chatMessages = [
  { id: 1, sender: "customer", message: "Hi, I need help with my recent order", time: "10:23 AM", type: "text" },
  { id: 2, sender: "bot", message: "Hello! I'd be happy to help you with your order. Could you please provide your order number?", time: "10:23 AM", type: "text" },
  { id: 3, sender: "customer", message: "It's order #12345", time: "10:24 AM", type: "text" },
  { id: 4, sender: "bot", message: "Thank you! I can see your order #12345 was placed on March 15th. Let me transfer you to an agent who can assist you better.", time: "10:24 AM", type: "text" },
  { id: 5, sender: "agent", message: "Hi John! This is Sarah from customer support. I can see you have an issue with order #12345. How can I help you today?", time: "10:25 AM", type: "text", agentName: "Sarah Wilson" },
  { id: 6, sender: "customer", message: "The product arrived damaged. I need a replacement.", time: "10:26 AM", type: "text" },
  { id: 7, sender: "agent", message: "I'm sorry to hear that! I'll immediately process a replacement for you. You should receive it within 2-3 business days.", time: "10:27 AM", type: "text", agentName: "Sarah Wilson" }
];

export const knowledgeArticles = [
  { 
    id: 1, 
    title: "Base knowledge utama", 
    content: "Selamat datang di platform kami! Panduan ini akan membantu Anda memahami cara menggunakan fitur-fitur utama. Pertama, pastikan Anda telah login ke akun Anda. Kemudian, navigasi ke dashboard utama untuk melihat ringkasan aktivitas. Menu sidebar kiri berisi semua fitur yang tersedia seperti Inbox untuk mengelola percakapan, Analytics untuk melihat performa, dan Knowledge Base untuk mengelola informasi. Untuk memulai, cobalah mengeksplorasi setiap menu dan familiarkan diri dengan antarmuka pengguna.", 
    status: "active", 
    created_at: "2024-03-20T14:30:00Z",
    updated_at: "2024-03-20T14:30:00Z",
    tags: ["panduan", "tutorial", "dasar"],
    language: "id",
    metadata: {
      type: "article",
      wordCount: 89
    }
  },
  { 
    id: 2, 
    title: "Base knowledge 2", 
    content: "Kami memahami bahwa terkadang produk atau layanan yang diterima mungkin tidak sesuai harapan. Oleh karena itu, kami menyediakan kebijakan pengembalian dana yang jelas dan mudah dipahami. Pengembalian dana dapat diajukan dalam waktu 30 hari sejak pembelian dengan syarat produk masih dalam kondisi asli. Untuk mengajukan pengembalian, silakan hubungi tim customer service kami melalui chat atau email dengan menyertakan nomor pesanan dan alasan pengembalian. Tim kami akan memproses permintaan Anda dalam waktu 3-5 hari kerja.", 
    status: "inactive", 
    created_at: "2024-03-19T10:15:00Z",
    updated_at: "2024-03-19T10:15:00Z",
    tags: ["refund", "kebijakan", "customer service"],
    language: "id",
    metadata: {
      type: "article",
      wordCount: 76
    }
  },
  { 
    id: 3, 
    title: "Base knowledge 99 ", 
    content: "Pengaturan profil akun yang lengkap dan akurat sangat penting untuk pengalaman yang optimal. Untuk mengakses pengaturan profil, klik pada avatar Anda di pojok kanan atas, kemudian pilih 'Pengaturan Akun'. Di halaman ini, Anda dapat memperbarui informasi personal seperti nama, email, nomor telepon, dan alamat. Pastikan juga untuk mengatur preferensi notifikasi sesuai kebutuhan Anda. Jangan lupa untuk menyimpan perubahan yang telah dibuat dengan mengklik tombol 'Simpan' di bagian bawah halaman.", 
    status: "inactive", 
    created_at: "2024-03-18T16:45:00Z",
    updated_at: "2024-03-18T16:45:00Z",
    tags: ["profil", "pengaturan", "akun"],
    language: "id",
    metadata: {
      type: "article",
      wordCount: 82
    }
  }
];

export const agentsData = [
  { 
    id: 1, 
    name: "Sarah Wilson", 
    email: "sarah@company.com", 
    status: "online", 
    activeChats: 3, 
    satisfaction: 4.8, 
    avgHandlingTime: "4m 32s", 
    totalHandled: 152, 
    specialization: "Technical Support",
    botPersonalityId: 1,
    maxConcurrentChats: 5
  },
  { 
    id: 2, 
    name: "John Davis", 
    email: "john@company.com", 
    status: "busy", 
    activeChats: 5, 
    satisfaction: 4.6, 
    avgHandlingTime: "5m 12s", 
    totalHandled: 98, 
    specialization: "Billing",
    botPersonalityId: 2,
    maxConcurrentChats: 6
  },
  { 
    id: 3, 
    name: "Mike Chen", 
    email: "mike@company.com", 
    status: "offline", 
    activeChats: 0, 
    satisfaction: 4.9, 
    avgHandlingTime: "3m 45s", 
    totalHandled: 203, 
    specialization: "General Support",
    botPersonalityId: 3,
    maxConcurrentChats: 4
  },
  { 
    id: 4, 
    name: "Emily Rodriguez", 
    email: "emily@company.com", 
    status: "online", 
    activeChats: 2, 
    satisfaction: 4.7, 
    avgHandlingTime: "4m 10s", 
    totalHandled: 176, 
    specialization: "Product Expert",
    botPersonalityId: 1,
    maxConcurrentChats: 3
  }
];

// Data untuk Session Manager
export const channelConfigsData = [
  {
    id: 1,
    name: "Website Chat",
    channel: "webchat",
    channel_type: "web",
    settings: {
      widget_color: "#2563eb",
      greeting_message: "Halo! Ada yang bisa kami bantu?",
      offline_message: "Maaf, kami sedang offline. Silakan tinggalkan pesan."
    },
    is_active: true
  },
  {
    id: 2,
    name: "WhatsApp Business",
    channel: "whatsapp",
    channel_type: "whatsapp",
    settings: {
      phone_number: "+6281234567890",
      webhook_url: "https://api.whatsapp.com/webhook",
      verify_token: "whatsapp_verify_token"
    },
    is_active: true
  },
  {
    id: 3,
    name: "Telegram Bot",
    channel: "telegram",
    channel_type: "telegram",
    settings: {
      bot_token: "123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11",
      webhook_url: "https://api.telegram.org/webhook"
    },
    is_active: true
  },
  {
    id: 4,
    name: "Facebook Messenger",
    channel: "facebook",
    channel_type: "facebook",
    settings: {
      page_id: "123456789",
      app_secret: "facebook_app_secret",
      verify_token: "facebook_verify_token"
    },
    is_active: false
  }
];

export const customersData = [
  {
    id: 1,
    name: "John Doe",
    email: "john.doe@email.com",
    phone: "+6281234567890",
    created_at: "2024-03-15T08:30:00Z",
    last_seen: "2024-03-20T14:25:00Z",
    metadata: {
      location: "Jakarta",
      source: "website",
      customer_since: "2023-01-15"
    }
  },
  {
    id: 2,
    name: "Emma Smith",
    email: "emma.smith@email.com",
    phone: "+6281234567891",
    created_at: "2024-02-10T10:15:00Z",
    last_seen: "2024-03-20T14:20:00Z",
    metadata: {
      location: "Bandung",
      source: "whatsapp",
      customer_since: "2024-02-10"
    }
  },
  {
    id: 3,
    name: "Michael Brown",
    email: "michael.brown@email.com",
    phone: "+6281234567892",
    created_at: "2024-01-20T16:45:00Z",
    last_seen: "2024-03-20T14:15:00Z",
    metadata: {
      location: "Surabaya",
      source: "facebook",
      customer_since: "2024-01-20"
    }
  },
  {
    id: 4,
    name: "Lisa Johnson",
    email: "lisa.johnson@email.com",
    phone: "+6281234567893",
    created_at: "2024-03-01T09:20:00Z",
    last_seen: "2024-03-20T13:30:00Z",
    metadata: {
      location: "Medan",
      source: "website",
      customer_since: "2024-03-01"
    }
  },
  {
    id: 5,
    name: "Robert Taylor",
    email: "robert.taylor@email.com",
    phone: "+6281234567894",
    created_at: "2024-02-28T11:10:00Z",
    last_seen: "2024-03-20T14:10:00Z",
    metadata: {
      location: "Yogyakarta",
      source: "telegram",
      customer_since: "2024-02-28"
    }
  }
];

export const chatSessionsData = [
  {
    id: 1,
    customer_id: 1,
    channel_config_id: 1,
    agent_id: 1,
    status: "active",
    started_at: "2024-03-20T14:23:00Z",
    ended_at: null,
    is_active: true,
    tags: ["urgent", "order_issue"],
    handover_reason: "Customer requested human agent",
    metadata: {
      session_source: "bot_escalation",
      initial_intent: "order_help"
    }
  },
  {
    id: 2,
    customer_id: 2,
    channel_config_id: 2,
    agent_id: null,
    status: "bot_handled",
    started_at: "2024-03-20T14:18:00Z",
    ended_at: null,
    is_active: true,
    tags: ["info_request"],
    handover_reason: null,
    metadata: {
      session_source: "direct_message",
      initial_intent: "business_hours"
    }
  },
  {
    id: 3,
    customer_id: 3,
    channel_config_id: 4,
    agent_id: 2,
    status: "completed",
    started_at: "2024-03-20T14:05:00Z",
    ended_at: "2024-03-20T14:13:00Z",
    is_active: false,
    tags: ["satisfied", "product_help"],
    handover_reason: null,
    metadata: {
      session_source: "direct_contact",
      initial_intent: "product_inquiry"
    }
  },
  {
    id: 4,
    customer_id: 4,
    channel_config_id: 1,
    agent_id: 1,
    status: "completed",
    started_at: "2024-03-20T13:30:00Z",
    ended_at: "2024-03-20T13:45:00Z",
    is_active: false,
    tags: ["resolved"],
    handover_reason: null,
    metadata: {
      session_source: "website_widget",
      initial_intent: "general_inquiry"
    }
  },
  {
    id: 5,
    customer_id: 5,
    channel_config_id: 3,
    agent_id: 3,
    status: "active",
    started_at: "2024-03-20T14:10:00Z",
    ended_at: null,
    is_active: true,
    tags: ["refund", "urgent"],
    handover_reason: "Complex refund request",
    metadata: {
      session_source: "bot_escalation",
      initial_intent: "refund_request"
    }
  }
];

export const sessionsMessagesData = [
  // Session 1 messages
  {
    id: 1,
    session_id: 1,
    sender_type: "customer",
    sender_id: 1,
    message_type: "text",
    content: "Hi, I need help with my recent order",
    media_url: null,
    quick_replies: null,
    created_at: "2024-03-20T14:23:15Z"
  },
  {
    id: 2,
    session_id: 1,
    sender_type: "bot",
    sender_id: null,
    message_type: "text",
    content: "Hello! I'd be happy to help you with your order. Could you please provide your order number?",
    media_url: null,
    quick_replies: ["Check Order Status", "Track Package", "Cancel Order"],
    created_at: "2024-03-20T14:23:20Z"
  },
  {
    id: 3,
    session_id: 1,
    sender_type: "customer",
    sender_id: 1,
    message_type: "text",
    content: "It's order #12345",
    media_url: null,
    quick_replies: null,
    created_at: "2024-03-20T14:24:00Z"
  },
  {
    id: 4,
    session_id: 1,
    sender_type: "bot",
    sender_id: null,
    message_type: "text",
    content: "Thank you! I can see your order #12345 was placed on March 15th. Let me transfer you to an agent who can assist you better.",
    media_url: null,
    quick_replies: null,
    created_at: "2024-03-20T14:24:10Z"
  },
  {
    id: 5,
    session_id: 1,
    sender_type: "agent",
    sender_id: 1,
    message_type: "text",
    content: "Hi John! This is Sarah from customer support. I can see you have an issue with order #12345. How can I help you today?",
    media_url: null,
    quick_replies: null,
    created_at: "2024-03-20T14:25:00Z"
  },
  {
    id: 6,
    session_id: 1,
    sender_type: "customer",
    sender_id: 1,
    message_type: "text",
    content: "The product arrived damaged. I need a replacement.",
    media_url: null,
    quick_replies: null,
    created_at: "2024-03-20T14:26:00Z"
  },
  {
    id: 7,
    session_id: 1,
    sender_type: "customer",
    sender_id: 1,
    message_type: "image",
    content: "Here's the photo of the damaged product",
    media_url: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=300&h=200&fit=crop",
    quick_replies: null,
    created_at: "2024-03-20T14:26:30Z"
  },
  {
    id: 8,
    session_id: 1,
    sender_type: "agent",
    sender_id: 1,
    message_type: "text",
    content: "I'm sorry to hear that! I can see the damage in the photo. I'll immediately process a replacement for you. You should receive it within 2-3 business days.",
    media_url: null,
    quick_replies: null,
    created_at: "2024-03-20T14:27:00Z"
  },
  // Session 2 messages
  {
    id: 9,
    session_id: 2,
    sender_type: "customer",
    sender_id: 2,
    message_type: "text",
    content: "What are your business hours?",
    media_url: null,
    quick_replies: null,
    created_at: "2024-03-20T14:18:15Z"
  },
  {
    id: 10,
    session_id: 2,
    sender_type: "bot",
    sender_id: null,
    message_type: "text",
    content: "Our business hours are Monday-Friday 9AM-6PM WIB, and Saturday 9AM-3PM WIB. We're closed on Sundays and public holidays.",
    media_url: null,
    quick_replies: ["Contact Support", "Visit Store", "More Info"],
    created_at: "2024-03-20T14:18:20Z"
  },
  // Session 3 messages
  {
    id: 11,
    session_id: 3,
    sender_type: "customer",
    sender_id: 3,
    message_type: "text",
    content: "Hi, I'm looking for information about your latest products",
    media_url: null,
    quick_replies: null,
    created_at: "2024-03-20T14:05:15Z"
  },
  {
    id: 12,
    session_id: 3,
    sender_type: "agent",
    sender_id: 2,
    message_type: "text",
    content: "Hello! I'd be happy to help you with product information. What specific products are you interested in?",
    media_url: null,
    quick_replies: null,
    created_at: "2024-03-20T14:06:00Z"
  },
  {
    id: 13,
    session_id: 3,
    sender_type: "agent",
    sender_id: 2,
    message_type: "document",
    content: "Here's our latest product catalog",
    media_url: "https://example.com/catalog.pdf",
    quick_replies: null,
    created_at: "2024-03-20T14:07:00Z"
  },
  {
    id: 14,
    session_id: 3,
    sender_type: "customer",
    sender_id: 3,
    message_type: "text",
    content: "Thank you for your help! This is exactly what I needed.",
    media_url: null,
    quick_replies: null,
    created_at: "2024-03-20T14:12:00Z"
  }
];

export const channelPerformanceData = [
  { channel: 'WhatsApp', sessions: 450, satisfaction: 4.8, avgDuration: '5m 23s', fill: "hsl(var(--chart-1))" },
  { channel: 'WebChat', sessions: 380, satisfaction: 4.6, avgDuration: '4m 15s', fill: "hsl(var(--chart-2))" },
  { channel: 'Facebook', sessions: 290, satisfaction: 4.5, avgDuration: '6m 45s', fill: "hsl(var(--chart-3))" },
  { channel: 'Telegram', sessions: 180, satisfaction: 4.7, avgDuration: '3m 50s', fill: "hsl(var(--chart-4))" },
  { channel: 'Email', sessions: 120, satisfaction: 4.4, avgDuration: '15m 30s', fill: "hsl(var(--chart-5))" }
];

export const sessionsData = [
  { hour: '00:00', bot: 45, agent: 12 },
  { hour: '04:00', bot: 32, agent: 8 },
  { hour: '08:00', bot: 89, agent: 34 },
  { hour: '12:00', bot: 120, agent: 56 },
  { hour: '16:00', bot: 98, agent: 45 },
  { hour: '20:00', bot: 67, agent: 23 }
];

export const intentsData = [
  { name: "Customer Service", count: 289, percentage: 24, trending: "stable" },
  { name: "Technical Support", count: 198, percentage: 16, trending: "down" },
];

export const workflowsData = [
  { id: 1, name: "Order Status Check", webhook: "https://n8n.company.com/webhook/order-status", status: "active", triggers: ["order_status", "track_order"], executions: 234 },
  { id: 2, name: "Refund Processing", webhook: "https://n8n.company.com/webhook/refund", status: "active", triggers: ["refund_request", "return"], executions: 89 },
  { id: 3, name: "Customer Escalation", webhook: "https://n8n.company.com/webhook/escalate", status: "inactive", triggers: ["escalate", "complaint"], executions: 45 },
  { id: 4, name: "Appointment Booking", webhook: "https://n8n.company.com/webhook/appointment", status: "active", triggers: ["book_appointment", "schedule"], executions: 167 }
];

export const auditLogsData = [
  { id: 1, timestamp: "2024-03-20 14:32:15", user: "admin@company.com", action: "UPDATE", resource: "bot_personality", details: "Changed greeting message", ip: "192.168.1.100" },
  { id: 2, timestamp: "2024-03-20 13:45:22", user: "sarah@company.com", action: "CREATE", resource: "knowledge_article", details: "Created article: Refund Policy", ip: "192.168.1.101" },
  { id: 3, timestamp: "2024-03-20 12:18:30", user: "system", action: "DELETE", resource: "api_key", details: "Expired API key removed", ip: "system" },
  { id: 4, timestamp: "2024-03-20 11:22:45", user: "john@company.com", action: "LOGIN", resource: "auth", details: "Successful login", ip: "192.168.1.102" }
];

// Data untuk Integrations
export const integrationsData = [
  {
    id: 1,
    name: "Google Sheets",
    description: "Hubungkan ke Google Sheets untuk membaca dan menulis data pelanggan secara otomatis",
    icon: "Sheet",
    category: "productivity",
    status: "active",
    configRequired: true,
    config: {
      googleAccountConnected: true,
      sheetId: "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms",
      sheetName: "Customers",
      permissions: ["read", "write"]
    },
    features: [
      "Sinkronisasi data pelanggan",
      "Export chat history",
      "Real-time updates"
    ],
    setupSteps: [
      "Hubungkan akun Google",
      "Pilih Google Sheet",
      "Konfigurasi permissions"
    ]
  },
  {
    id: 2,
    name: "WhatsApp Business API",
    description: "Integrasi resmi dengan WhatsApp Business API untuk fitur lanjutan dan analytics",
    icon: "MessageSquare",
    category: "communication",
    status: "active",
    configRequired: true,
    config: {
      businessAccountId: "123456789",
      phoneNumberId: "987654321",
      accessToken: "EAABwzLixnjYBOZB...",
      webhookVerifyToken: "your_verify_token"
    },
    features: [
      "Verified business badge",
      "Template messages",
      "Rich media support",
      "Advanced analytics"
    ],
    setupSteps: [
      "Verifikasi Business Account",
      "Konfigurasi webhook",
      "Setup templates"
    ]
  },
  {
    id: 3,
    name: "Cek Ongkos Kirim",
    description: "Integrasi dengan API pengiriman untuk cek ongkos kirim otomatis (JNE, TIKI, POS)",
    icon: "Truck",
    category: "shipping",
    status: "inactive",
    configRequired: true,
    config: {
      jneApiKey: "",
      tikiApiKey: "",
      posApiKey: "",
      defaultOriginCity: "Jakarta"
    },
    features: [
      "Multi-carrier support",
      "Real-time pricing",
      "Weight calculation",
      "Distance estimation"
    ],
    setupSteps: [
      "Daftar API key carrier",
      "Set origin location",
      "Test connection"
    ]
  },
  {
    id: 4,
    name: "Kirim Notifikasi Pribadi",
    description: "Kirim notifikasi push atau email ke admin ketika ada percakapan prioritas tinggi",
    icon: "Bell",
    category: "notification",
    status: "active",
    configRequired: true,
    config: {
      pushNotificationApiKey: "fcm_server_key_...",
      emailProvider: "smtp",
      smtpConfig: {
        host: "smtp.gmail.com",
        port: 587,
        username: "admin@company.com",
        password: "app_password"
      },
      notificationRules: [
        {
          trigger: "high_priority_conversation",
          enabled: true,
          pushNotification: true,
          emailNotification: true
        },
        {
          trigger: "escalation_to_human",
          enabled: true,
          pushNotification: true,
          emailNotification: false
        }
      ]
    },
    features: [
      "Push notifications",
      "Email alerts",
      "Custom rules",
      "Priority filtering"
    ],
    setupSteps: [
      "Konfigurasi FCM",
      "Setup SMTP",
      "Set notification rules"
    ]
  },
  {
    id: 5,
    name: "Allow List (Whitelist Numbers)",
    description: "Batasi akses chatbot hanya untuk nomor telepon yang terdaftar dalam whitelist",
    icon: "Shield",
    category: "security",
    status: "inactive",
    configRequired: true,
    config: {
      enabled: false,
      allowedNumbers: [
        "+6281234567890",
        "+6281234567891",
        "+6281234567892"
      ],
      blockMessage: "Maaf, nomor Anda tidak terdaftar untuk menggunakan layanan ini.",
      adminNumbers: ["+6281234567890"]
    },
    features: [
      "Number verification",
      "Admin bypass",
      "Custom block message",
      "Bulk import"
    ],
    setupSteps: [
      "Enable whitelist mode",
      "Add allowed numbers",
      "Set block message"
    ]
  },
  {
    id: 6,
    name: "Zapier Integration",
    description: "Hubungkan dengan 5000+ aplikasi melalui Zapier untuk automasi workflow",
    icon: "Zap",
    category: "automation",
    status: "inactive",
    configRequired: true,
    config: {
      zapierApiKey: "",
      webhookUrl: "https://hooks.zapier.com/hooks/catch/...",
      activeZaps: []
    },
    features: [
      "5000+ app connections",
      "Custom triggers",
      "Multi-step workflows",
      "Real-time sync"
    ],
    setupSteps: [
      "Connect Zapier account",
      "Create webhook trigger",
      "Build workflows"
    ]
  },
  {
    id: 7,
    name: "CRM Integration",
    description: "Sinkronisasi otomatis dengan sistem CRM untuk tracking customer journey",
    icon: "Users",
    category: "crm",
    status: "inactive",
    configRequired: true,
    config: {
      crmProvider: "salesforce", // salesforce, hubspot, pipedrive
      apiEndpoint: "",
      apiKey: "",
      syncFields: ["name", "email", "phone", "notes"],
      autoCreateContacts: true
    },
    features: [
      "Contact sync",
      "Lead tracking",
      "Activity logging",
      "Custom field mapping"
    ],
    setupSteps: [
      "Select CRM provider",
      "Configure API access",
      "Map data fields"
    ]
  },
  {
    id: 8,
    name: "Payment Gateway",
    description: "Terima pembayaran langsung dalam chat menggunakan payment gateway",
    icon: "CreditCard",
    category: "payment",
    status: "inactive",
    configRequired: true,
    config: {
      provider: "midtrans", // midtrans, xendit, stripe
      merchantId: "",
      clientKey: "",
      serverKey: "",
      environment: "sandbox", // sandbox, production
      supportedMethods: ["credit_card", "bank_transfer", "e_wallet"]
    },
    features: [
      "In-chat payments",
      "Multiple methods",
      "Transaction tracking",
      "Refund processing"
    ],
    setupSteps: [
      "Choose payment provider",
      "Configure merchant account",
      "Test transactions"
    ]
  },
  {
    id: 9,
    name: "Auto Reminder",
    description: "Buat reminder untuk melakukan tugas tertentu pada waktu tertentu",
    icon: "Calendar",
    category: "automation",
    status: "inactive",
    configRequired: true,
    config: {
      timezone: "Asia/Jakarta",
      defaultReminderTime: "09:00",
      maxRemindersPerUser: 10,
      reminderTypes: ["appointment", "follow_up", "task", "custom"],
      notificationChannels: ["chat", "email", "sms"]
    },
    features: [
      "Scheduled reminders",
      "Multiple reminder types",
      "Timezone support",
      "Recurring reminders"
    ],
    setupSteps: [
      "Set default timezone",
      "Configure notification channels",
      "Test reminder delivery"
    ]
  },
  {
    id: 10,
    name: "Nearest Location",
    description: "Mencari lokasi terdekat dari customer",
    icon: "MapPin",
    category: "location",
    status: "inactive",
    configRequired: true,
    config: {
      mapProvider: "google_maps", // google_maps, mapbox, here
      apiKey: "",
      searchRadius: 5000, // meters
      maxResults: 10,
      locationTypes: ["store", "atm", "service_center", "distributor"],
      enableDirections: true
    },
    features: [
      "Real-time location search",
      "Distance calculation",
      "Turn-by-turn directions",
      "Store locator"
    ],
    setupSteps: [
      "Choose map provider",
      "Configure API access",
      "Add business locations"
    ]
  },
  {
    id: 11,
    name: "Netzme",
    description: "Pembayaran transaksi melalui dompet digital Netzme",
    icon: "Wallet",
    category: "payment",
    status: "inactive",
    configRequired: true,
    config: {
      merchantId: "",
      apiKey: "",
      secretKey: "",
      environment: "sandbox", // sandbox, production
      supportedCurrencies: ["IDR"],
      webhookUrl: ""
    },
    features: [
      "Digital wallet payments",
      "QR code generation",
      "Transaction verification",
      "Instant settlement"
    ],
    setupSteps: [
      "Register merchant account",
      "Configure API credentials",
      "Setup webhook notifications"
    ]
  },
  {
    id: 12,
    name: "Email Marketing",
    description: "Integrasi dengan platform email marketing untuk campaign otomatis",
    icon: "Mail",
    category: "marketing",
    status: "inactive",
    configRequired: true,
    config: {
      provider: "mailchimp", // mailchimp, sendgrid, mailerlite
      apiKey: "",
      defaultListId: "",
      autoSubscribe: true,
      segmentationRules: [],
      campaignTriggers: ["new_customer", "abandoned_cart", "purchase"]
    },
    features: [
      "Auto-subscribe customers",
      "Triggered campaigns",
      "Segmentation",
      "Analytics tracking"
    ],
    setupSteps: [
      "Connect email provider",
      "Configure subscriber lists",
      "Setup campaign triggers"
    ]
  },
  {
    id: 13,
    name: "Social Media Analytics",
    description: "Pantau mention brand dan sentiment analysis dari media sosial",
    icon: "TrendingUp",
    category: "analytics",
    status: "inactive",
    configRequired: true,
    config: {
      platforms: ["twitter", "instagram", "facebook", "tiktok"],
      keywords: [],
      brandNames: [],
      sentimentAnalysis: true,
      reportFrequency: "daily", // daily, weekly, monthly
      alertThreshold: -0.3 // negative sentiment threshold
    },
    features: [
      "Multi-platform monitoring",
      "Sentiment analysis",
      "Brand mention alerts",
      "Competitor tracking"
    ],
    setupSteps: [
      "Connect social accounts",
      "Setup monitoring keywords",
      "Configure alert thresholds"
    ]
  },
  {
    id: 14,
    name: "Live Chat Handover",
    description: "Transfer chat ke agent manusia dengan konteks lengkap",
    icon: "UserCheck",
    category: "communication",
    status: "active",
    configRequired: true,
    config: {
      handoverTriggers: ["escalation_keyword", "sentiment_negative", "human_request"],
      availableAgents: [],
      workingHours: {
        start: "09:00",
        end: "17:00",
        timezone: "Asia/Jakarta",
        workingDays: [1, 2, 3, 4, 5] // Monday to Friday
      },
      queueManagement: true,
      contextTransfer: true
    },
    features: [
      "Smart routing",
      "Context preservation",
      "Queue management",
      "Working hours support"
    ],
    setupSteps: [
      "Configure handover triggers",
      "Setup agent routing",
      "Test handover flow"
    ]
  },
  {
    id: 15,
    name: "Survey & Feedback",
    description: "Kumpulkan feedback pelanggan melalui survey interaktif",
    icon: "ClipboardCheck",
    category: "feedback",
    status: "inactive",
    configRequired: true,
    config: {
      surveyTypes: ["satisfaction", "nps", "product_feedback", "custom"],
      triggerEvents: ["conversation_end", "purchase_complete", "manual"],
      questionFormats: ["multiple_choice", "rating", "text", "yes_no"],
      responseAnalysis: true,
      exportFormats: ["csv", "pdf", "excel"]
    },
    features: [
      "Interactive surveys",
      "NPS tracking",
      "Response analytics",
      "Export capabilities"
    ],
    setupSteps: [
      "Create survey templates",
      "Configure trigger events",
      "Setup analytics dashboard"
    ]
  },
  {
    id: 16,
    name: "Inventory Checker",
    description: "Cek stok produk real-time dan notifikasi ketersediaan",
    icon: "Package",
    category: "inventory",
    status: "inactive",
    configRequired: true,
    config: {
      inventorySystem: "custom", // custom, shopify, woocommerce, magento
      apiEndpoint: "",
      apiKey: "",
      autoUpdate: true,
      lowStockThreshold: 10,
      notifyOnLowStock: true,
      updateInterval: 300 // seconds
    },
    features: [
      "Real-time stock check",
      "Low stock alerts",
      "Multi-location inventory",
      "Auto-sync with POS"
    ],
    setupSteps: [
      "Connect inventory system",
      "Configure stock thresholds",
      "Test stock queries"
    ]
  },
  {
    id: 17,
    name: "Voice to Text",
    description: "Konversi pesan suara menjadi teks menggunakan AI",
    icon: "Mic",
    category: "ai",
    status: "inactive",
    configRequired: true,
    config: {
      provider: "google_cloud", // google_cloud, aws_transcribe, azure
      apiKey: "",
      supportedLanguages: ["id-ID", "en-US", "ms-MY"],
      autoTranslate: false,
      confidenceThreshold: 0.8,
      maxDuration: 60 // seconds
    },
    features: [
      "Multi-language support",
      "High accuracy",
      "Real-time processing",
      "Confidence scoring"
    ],
    setupSteps: [
      "Choose speech provider",
      "Configure language settings",
      "Test voice recognition"
    ]
  },
  {
    id: 18,
    name: "QR Code Generator",
    description: "Generate QR code untuk berbagai keperluan (payment, link, contact)",
    icon: "QrCode",
    category: "utility",
    status: "inactive",
    configRequired: false,
    config: {
      defaultSize: 256,
      errorCorrection: "M", // L, M, Q, H
      logoSupport: true,
      formats: ["png", "jpeg", "svg"],
      qrTypes: ["url", "text", "payment", "contact", "wifi"]
    },
    features: [
      "Multiple QR types",
      "Custom branding",
      "High resolution",
      "Batch generation"
    ],
    setupSteps: [
      "Configure default settings",
      "Upload brand logo",
      "Test QR generation"
    ]
  }
];

// Subscription Plans Data
export const subscriptionPlansData = [
  {
    id: 'basic',
    name: 'Starter',
    tier: 'basic',
    priceMonthly: 299000,
    priceYearly: 2990000,
    currency: 'IDR',
    maxAgents: 3,
    maxMessagesPerMonth: 500,
    features: [
      'Live Chat Widget',
      'Basic Analytics Dashboard',
      'Email Support',
      '3 Chat Agents',
      '500 Messages/Bulan',
      'Template Dasar',
      'Integrasi WhatsApp',
      'Auto-Reply Basic',
      'Chat History (30 hari)',
      'Mobile App Support'
    ],
    highlights: ['Terpopuler'],
    description: 'Cocok untuk UMKM dan bisnis kecil yang baru memulai dengan chatbot. Fitur lengkap untuk customer service yang efektif.',
    isActive: true,
    activeSubscriptions: 156,
    totalRevenue: 46644000,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-03-20T14:30:00Z'
  },
  {
    id: 'pro',
    name: 'Business', 
    tier: 'professional',
    priceMonthly: 799000,
    priceYearly: 7990000,
    currency: 'IDR',
    maxAgents: 10,
    maxMessagesPerMonth: 2000,
    features: [
      'Semua Fitur Starter',
      'Analytics Lanjutan',
      'API Access',
      'Priority Support',
      'Integrasi Custom',
      '10 Chat Agents',
      '2,000 Messages/Bulan',
      'Template Premium',
      'Custom Branding',
      'Multi-language (ID/EN)',
      'Advanced Reporting',
      'Webhook Integrations',
      'Auto-Reply Advanced',
      'Chat History (90 hari)',
      'Team Management',
      'Performance Analytics'
    ],
    highlights: ['Nilai Terbaik'],
    description: 'Ideal untuk bisnis yang sedang berkembang. Fitur lengkap dengan analitik mendalam dan integrasi yang fleksibel.',
    isActive: true,
    activeSubscriptions: 89,
    totalRevenue: 71111000,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-03-20T14:30:00Z'
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    tier: 'enterprise', 
    priceMonthly: 1999000,
    priceYearly: 19990000,
    currency: 'IDR',
    maxAgents: 50,
    maxMessagesPerMonth: 10000,
    features: [
      'Semua Fitur Business',
      'White Label Solution',
      'Custom Workflows',
      'Dedicated Support',
      'SLA Guarantee',
      '50 Chat Agents',
      '10,000 Messages/Bulan',
      'Custom Development',
      'Advanced Security',
      'Multi-tenant Support',
      'Custom AI Training',
      '24/7 Phone Support',
      'On-premise Option',
      'Custom Integrations',
      'Advanced Analytics Dashboard',
      'Chat History (1 tahun)',
      'Unlimited Templates',
      'Advanced AI Features',
      'Custom Branding Full',
      'Multi-language Unlimited'
    ],
    highlights: ['Paling Powerful'],
    description: 'Solusi lengkap untuk perusahaan besar dengan kebutuhan khusus. Dukungan dedicated dan fitur enterprise untuk skalabilitas maksimal.',
    isActive: true,
    activeSubscriptions: 23,
    totalRevenue: 45977000,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-03-20T14:30:00Z'
  }
];

// Subscription Plans Metadata
export const subscriptionPlansMetadata = {
  lastUpdated: '2024-03-20T14:30:00Z',
  version: '1.0.0',
  totalPlans: 3,
  totalActiveSubscriptions: 268,
  totalMonthlyRevenue: 163732000,
  currency: 'IDR'
};
