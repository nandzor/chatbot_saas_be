# 🚀 AI Agent Workflow - Postman Collection

## 📋 Deskripsi
Collection Postman lengkap untuk testing dan integrasi AI Agent Workflow API dengan N8N dan WAHA. Collection ini mencakup semua endpoint yang diperlukan untuk mengelola workflow AI Agent, conversation history, dan analytics.

## 🔧 Setup & Konfigurasi

### 1. Import Collection
1. Buka Postman
2. Klik **Import** 
3. Pilih file `AI_Agent_Workflow_Postman_Collection.json`
4. Collection akan otomatis ter-import dengan semua endpoint

### 2. Authentication Setup
Collection menggunakan **Bearer Token Authentication** dengan variable `{{jwt_token}}`.

**Cara mendapatkan JWT Token:**
```bash
# Login untuk mendapatkan token
curl -X POST http://localhost:9000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "password123"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "user": { ... }
  }
}
```

**Update Token di Collection:**
1. Klik pada Collection name "AI Agent Workflow API"
2. Tab **Variables**
3. Update value `jwt_token` dengan token yang didapat
4. Save collection

## 📚 Endpoint Categories

### 🤖 **AI Agent Workflow Management**
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| POST | `/ai-agent-workflow/create` | Membuat workflow AI Agent baru |
| DELETE | `/ai-agent-workflow/delete` | Menghapus workflow AI Agent |
| GET | `/ai-agent-workflow/status` | Cek status workflow |
| GET | `/ai-agent-workflow/analytics` | Analytics workflow |
| POST | `/ai-agent-workflow/process-message` | Proses pesan melalui workflow |
| POST | `/ai-agent-workflow/test` | Test workflow dengan pesan sample |

### 💬 **Conversation Management**
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/conversations/history` | Ambil riwayat percakapan |
| POST | `/conversations/log` | Log percakapan AI Agent |

### 📊 **Analytics & Monitoring**
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| POST | `/analytics/workflow-execution` | Log eksekusi workflow |
| GET | `/analytics/ai-agent-workflow` | Analytics AI Agent |
| GET | `/analytics/workflow-performance` | Performance metrics |

### 🔍 **Health Check & Testing**
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/health` | Health check API |
| POST | `/webhook/kb-webhook/{kb_id}` | Test N8N webhook trigger |

## 🎯 Contoh Usage

### 1. **Membuat AI Agent Workflow**
```json
{
  "organization_id": "550e8400-e29b-41d4-a716-446655440000",
  "knowledge_base_id": "660e8400-e29b-41d4-a716-446655440001",
  "workflow_config": {
    "workflow_name": "AI Agent - Customer Service",
    "ai_model": "gpt-4",
    "ai_temperature": 0.7,
    "ai_max_tokens": 500,
    "timezone": "Asia/Jakarta"
  }
}
```

### 2. **Process Message**
```json
{
  "session": "session_550e8400-e29b-41d4-a716-446655440000_660e8400-e29b-41d4-a716-446655440001",
  "from": "+6281234567890",
  "text": "Bagaimana cara menggunakan fitur chatbot?",
  "timestamp": "2024-01-15T10:30:00Z",
  "messageId": "msg_12345",
  "type": "text"
}
```

### 3. **Log Analytics**
```json
{
  "workflow_id": "ai-agent-workflow",
  "execution_id": "exec_12345_67890",
  "organization_id": "550e8400-e29b-41d4-a716-446655440000",
  "session_id": "session_550e8400-e29b-41d4-a716-446655440000_660e8400-e29b-41d4-a716-446655440001",
  "user_phone": "+6281234567890",
  "metrics": {
    "processing_time": 2.3,
    "response_length": 245,
    "kb_results_count": 3,
    "ai_tokens_used": 245,
    "success": true
  },
  "event_type": "workflow_execution",
  "timestamp": "2024-01-15T10:30:25Z"
}
```

## 🔐 Security & Headers

### Required Headers
```
Content-Type: application/json
Accept: application/json
Authorization: Bearer {{jwt_token}}
```

### Authentication
- **Type**: Bearer Token
- **Token**: JWT token dari login endpoint
- **Scope**: All endpoints require authentication kecuali health check

## 📋 Testing Workflow

### 1. **Setup Sequence**
1. **Health Check** - Pastikan API running
2. **Login** - Dapatkan JWT token (di luar collection)
3. **Update Token** - Set `jwt_token` variable
4. **Create Workflow** - Buat AI Agent workflow
5. **Test Workflow** - Test dengan sample message

### 2. **Monitoring Sequence**
1. **Process Message** - Kirim pesan real
2. **Get Analytics** - Cek performance metrics
3. **Get History** - Lihat conversation history
4. **Log Execution** - Manual logging untuk testing

### 3. **Cleanup Sequence**
1. **Get Status** - Cek workflow status
2. **Delete Workflow** - Hapus workflow jika tidak diperlukan

## 🚨 Error Handling

### Common Error Responses
```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error info",
  "code": "ERROR_CODE"
}
```

### HTTP Status Codes
- **200** - Success
- **201** - Created
- **400** - Bad Request
- **401** - Unauthorized
- **404** - Not Found
- **422** - Validation Error
- **500** - Internal Server Error

## 🔧 Environment Variables

### Collection Variables
```json
{
  "jwt_token": "your_jwt_token_here",
  "base_url": "http://localhost:9000",
  "n8n_url": "http://localhost:5678",
  "organization_id": "550e8400-e29b-41d4-a716-446655440000",
  "knowledge_base_id": "660e8400-e29b-41d4-a716-446655440001"
}
```

### Sample UUIDs for Testing
- **Organization ID**: `550e8400-e29b-41d4-a716-446655440000`
- **Knowledge Base ID**: `660e8400-e29b-41d4-a716-446655440001`
- **Session Pattern**: `session_{org_id}_{kb_id}`

## 📞 Support

Jika mengalami masalah:
1. Cek API health endpoint
2. Verify JWT token masih valid
3. Pastikan Docker containers running
4. Cek logs di Laravel dan N8N

---

**Collection ini telah dioptimasi untuk development dan testing AI Agent Workflow dengan best practices dan clean code!** 🚀
