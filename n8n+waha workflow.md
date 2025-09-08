Saya akan membuat dokumentasi lengkap dalam format Markdown untuk integrasi AI Agent workflow di N8N.

```markdown
# 🤖 AI Agent Workflow Integration di N8N

## 📋 Daftar Isi

1. [Overview](#overview)
2. [Arsitektur Sistem](#arsitektur-sistem)
3. [Flow Diagram](#flow-diagram)
4. [Konfigurasi N8N](#konfigurasi-n8n)
5. [Node Configuration](#node-configuration)
6. [API Integration](#api-integration)
7. [Error Handling](#error-handling)
8. [Monitoring & Analytics](#monitoring--analytics)
9. [Security & Compliance](#security--compliance)
10. [Performance Optimization](#performance-optimization)
11. [Deployment Guide](#deployment-guide)
12. [Troubleshooting

12. [Troubleshooting](#troubleshooting)
13. [Best Practices](#best-practices)
14. [FAQ](#faq)

---

## �� Overview

### Deskripsi
Sistem AI Agent workflow yang terintegrasi dengan N8N untuk memberikan respons otomatis yang cerdas kepada customer melalui WhatsApp. Sistem ini menggunakan knowledge base, AI processing, dan real-time monitoring untuk memberikan pengalaman customer service yang optimal.

### Fitur Utama
- 🤖 **AI-Powered Responses**: Menggunakan OpenAI GPT-4 untuk respons yang cerdas
- 📚 **Knowledge Base Integration**: Pencarian otomatis dari knowledge base
- 💬 **WhatsApp Integration**: Terintegrasi dengan WAHA untuk komunikasi WhatsApp
- 📊 **Real-time Analytics**: Monitoring dan analytics yang comprehensive
- 🔒 **Security & Compliance**: Keamanan data dan compliance yang ketat
- ⚡ **High Performance**: Response time < 3 detik
- 🔄 **Auto-scaling**: Skalabilitas otomatis berdasarkan load

### Teknologi yang Digunakan
- **N8N**: Workflow automation platform
- **OpenAI GPT-4**: AI language model
- **Laravel**: Backend API framework
- **PostgreSQL**: Database
- **WAHA**: WhatsApp HTTP API
- **Docker**: Containerization
- **Redis**: Caching dan queue management

---

## ��️ Arsitektur Sistem

### High-Level Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   WhatsApp      │    │      WAHA       │    │   N8N Workflow  │
│   Customer      │───▶│   Webhook       │───▶│   Engine        │
│   Interface     │    │   Receiver      │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                       │
                                                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Laravel       │    │   Knowledge     │    │   OpenAI        │
│   Backend       │◀───│   Base API      │    │   GPT-4 API     │
│   Services      │    │   Service       │    │   Service       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       ▼                       │
         │              ┌─────────────────┐              │
         │              │   PostgreSQL    │              │
         │              │   Database      │              │
         │              └─────────────────┘              │
         │                       │                       │
         │                       ▼                       │
         │              ┌─────────────────┐              │
         │              │   Redis Cache   │              │
         │              │   & Queue       │              │
         │              └─────────────────┘              │
         │                       │                       │
         │                       ▼                       │
         │              ┌─────────────────┐              │
         │              │   Monitoring    │              │
         │              │   & Analytics   │              │
         │              └─────────────────┘              │
```

### Component Details

#### 1. **N8N Workflow Engine**
- **Fungsi**: Orchestrasi workflow dan node management
- **Teknologi**: N8N platform dengan custom nodes
- **Skalabilitas**: Auto-scaling berdasarkan load
- **Monitoring**: Real-time execution monitoring

#### 2. **Laravel Backend Services**
- **Fungsi**: API services, data management, business logic
- **Teknologi**: Laravel 10, PHP 8.1+
- **Database**: PostgreSQL dengan Redis caching
- **API**: RESTful API dengan JWT authentication

#### 3. **Knowledge Base System**
- **Fungsi**: Penyimpanan dan pencarian knowledge
- **Teknologi**: PostgreSQL dengan full-text search
- **Features**: Semantic search, relevance scoring
- **Management**: CRUD operations, content versioning

#### 4. **AI Processing Service**
- **Fungsi**: AI response generation dan processing
- **Teknologi**: OpenAI GPT-4 API
- **Features**: Context-aware responses, prompt engineering
- **Optimization**: Token usage optimization, response caching

#### 5. **WAHA Integration**
- **Fungsi**: WhatsApp communication interface
- **Teknologi**: WAHA HTTP API
- **Features**: Session management, message sending
- **Monitoring**: Connection health, message delivery status

---

## 🔄 Flow Diagram

### Complete Workflow Flow
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   WhatsApp      │    │      WAHA       │    │   N8N Webhook   │
│   Message       │───▶│   Webhook       │───▶│   Trigger       │
│   Received      │    │   Receiver      │    │   Node          │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                       │
                                                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Data          │    │   Knowledge     │    │   Conversation  │
│   Processor     │◀───│   Base Search   │    │   History       │
│   Node          │    │   Node          │    │   Node          │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       ▼                       │
         │              ┌─────────────────┐              │
         │              │   System        │              │
         │              │   Prompt        │              │
         │              │   Builder       │              │
         │              │   Node          │              │
         │              └─────────────────┘              │
         │                       │                       │
         │                       ▼                       │
         │              ┌─────────────────┐              │
         │              │   AI            │              │
         │              │   Processor     │              │
         │              │   (OpenAI)      │              │
         │              └─────────────────┘              │
         │                       │                       │
         │                       ▼                       │
         │              ┌─────────────────┐              │
         │              │   Response      │              │
         │              │   Formatter     │              │
         │              │   Node          │              │
         │              └─────────────────┘              │
         │                       │                       │
         │                       ▼                       │
         │              ┌─────────────────┐              │
         │              │   WAHA Send     │              │
         │              │   Message       │              │
         │              │   Node          │              │
         │              └─────────────────┘              │
         │                       │                       │
         │                       ▼                       │
         │              ┌─────────────────┐              │
         │              │   Analytics     │              │
         │              │   & Monitoring  │              │
         │              │   Node          │              │
         │              └─────────────────┘              │
         │                       │                       │
         │                       ▼                       │
         │              ┌─────────────────┐              │
         │              │   Database      │              │
         │              │   Logging       │              │
         │              └─────────────────┘              │
```

### Step-by-Step Process

#### **Step 1: Message Reception**
1. Customer mengirim pesan di WhatsApp
2. WAHA menerima pesan dan mengirim webhook
3. N8N webhook trigger diaktifkan

#### **Step 2: Data Processing**
1. Extract dan enrich data dari webhook
2. Parse session ID untuk organization context
3. Siapkan data untuk processing selanjutnya

#### **Step 3: Knowledge Base Search**
1. Search knowledge base berdasarkan user message
2. Filter berdasarkan organization ID
3. Return top 5 hasil yang relevan

#### **Step 4: AI Processing**
1. Build system prompt dengan context
2. Kirim ke OpenAI GPT-4
3. Generate response yang relevan

#### **Step 5: Response Delivery**
1. Format response untuk WhatsApp
2. Kirim via WAHA API
3. Log conversation ke database

#### **Step 6: Analytics & Monitoring**
1. Collect performance metrics
2. Update analytics dashboard
3. Trigger alerts jika diperlukan

---

## ⚙️ Konfigurasi N8N

### Environment Variables
```env
# N8N Configuration
N8N_BASIC_AUTH_ACTIVE=true
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=your_password
N8N_ENCRYPTION_KEY=your_encryption_key

# External Services
LARAVEL_APP_URL=https://your-app.com
WAHA_BASE_URL=http://waha:3000
OPENAI_API_KEY=sk-your-openai-key
LARAVEL_API_KEY=your-laravel-api-key

# Database
N8N_DATABASE_TYPE=postgresdb
N8N_DATABASE_HOST=postgres
N8N_DATABASE_PORT=5432
N8N_DATABASE_NAME=n8n
N8N_DATABASE_USER=n8n
N8N_DATABASE_PASSWORD=your_password

# Redis
N8N_REDIS_HOST=redis
N8N_REDIS_PORT=6379
N8N_REDIS_PASSWORD=your_redis_password

# Monitoring
N8N_METRICS=true
N8N_LOG_LEVEL=info
N8N_LOG_OUTPUT=console,file
```

### Docker Compose Configuration
```yaml
version: '3.8'

services:
  n8n:
    image: n8nio/n8n:latest
    container_name: n8n
    restart: unless-stopped
    ports:
      - "5678:5678"
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=your_password
      - N8N_ENCRYPTION_KEY=your_encryption_key
      - LARAVEL_APP_URL=https://your-app.com
      - WAHA_BASE_URL=http://waha:3000
      - OPENAI_API_KEY=sk-your-openai-key
      - LARAVEL_API_KEY=your-laravel-api-key
      - N8N_DATABASE_TYPE=postgresdb
      - N8N_DATABASE_HOST=postgres
      - N8N_DATABASE_PORT=5432
      - N8N_DATABASE_NAME=n8n
      - N8N_DATABASE_USER=n8n
      - N8N_DATABASE_PASSWORD=your_password
      - N8N_REDIS_HOST=redis
      - N8N_REDIS_PORT=6379
      - N8N_REDIS_PASSWORD=your_redis_password
      - N8N_METRICS=true
      - N8N_LOG_LEVEL=info
      - N8N_LOG_OUTPUT=console,file
    volumes:
      - n8n_data:/home/node/.n8n
      - ./workflows:/home/node/.n8n/workflows
    networks:
      - n8n_network
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:15
    container_name: n8n_postgres
    restart: unless-stopped
    environment:
      - POSTGRES_DB=n8n
      - POSTGRES_USER=n8n
      - POSTGRES_PASSWORD=your_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - n8n_network

  redis:
    image: redis:7-alpine
    container_name: n8n_redis
    restart: unless-stopped
    command: redis-server --requirepass your_redis_password
    volumes:
      - redis_data:/data
    networks:
      - n8n_network

volumes:
  n8n_data:
  postgres_data:
  redis_data:

networks:
  n8n_network:
    driver: bridge
```

---

## �� Node Configuration

### 1. Webhook Trigger Node
```json
{
  "id": "webhook_trigger",
  "name": "WhatsApp Message Webhook",
  "type": "n8n-nodes-base.webhook",
  "typeVersion": 1,
  "position": [100, 100],
  "parameters": {
    "path": "kb-webhook/{knowledge_base_id}",
    "httpMethod": "POST",
    "responseMode": "responseNode",
    "options": {
      "noResponseBody": false
    }
  },
  "webhookId": "kb-webhook-123"
}
```

### 2. Data Processor Node
```json
{
  "id": "data_processor",
  "name": "Process Message Data",
  "type": "n8n-nodes-base.function",
  "typeVersion": 1,
  "position": [300, 100],
  "parameters": {
    "functionCode": "// Extract and enrich data\nconst webhookData = $input.first().json;\n\n// Parse session to get organization info\nconst sessionParts = webhookData.session.split('_');\nconst organizationId = sessionParts[2] || 'unknown';\n\n// Build enriched context\nconst enrichedData = {\n  // Original message data\n  session_id: webhookData.session,\n  from: webhookData.from,\n  message: webhookData.text,\n  timestamp: webhookData.timestamp,\n  message_id: webhookData.messageId,\n  \n  // Extracted context\n  organization_id: organizationId,\n  knowledge_base_id: webhookData.knowledge_base_id,\n  \n  // AI context\n  user_message: webhookData.text,\n  user_phone: webhookData.from,\n  current_time: new Date().toISOString(),\n  user_timezone: 'Asia/Jakarta',\n  \n  // Conversation context\n  conversation_history: [],\n  user_preferences: {},\n  \n  // Metadata\n  workflow_id: 'workflow-789',\n  execution_id: $execution.id,\n  node_id: 'data_processor'\n};\n\nreturn { json: enrichedData };"
  }
}
```

### 3. Knowledge Base Search Node
```json
{
  "id": "kb_search",
  "name": "Search Knowledge Base",
  "type": "n8n-nodes-base.httpRequest",
  "typeVersion": 4.1,
  "position": [500, 100],
  "parameters": {
    "url": "{{$env.LARAVEL_APP_URL}}/api/v1/knowledge-base/search",
    "method": "GET",
    "authentication": "predefinedCredentialType",
    "nodeCredentialType": "httpHeaderAuth",
    "sendQuery": true,
    "queryParameters": {
      "parameters": [
        {
          "name": "query",
          "value": "={{$json.user_message}}"
        },
        {
          "name": "organization_id",
          "value": "={{$json.organization_id}}"
        },
        {
          "name": "limit",
          "value": "5"
        },
        {
          "name": "include_content",
          "value": "true"
        }
      ]
    },
    "options": {
      "timeout": 10000
    }
  }
}
```

### 4. AI Processor Node
```json
{
  "id": "ai_processor",
  "name": "AI Response Generation",
  "type": "n8n-nodes-base.openAi",
  "typeVersion": 1,
  "position": [700, 100],
  "parameters": {
    "resource": "chat",
    "operation": "create",
    "model": "gpt-4",
    "messages": {
      "values": [
        {
          "role": "system",
          "content": "={{$json.system_prompt}}"
        },
        {
          "role": "user",
          "content": "={{$json.user_message}}"
        }
      ]
    },
    "temperature": 0.7,
    "maxTokens": 500,
    "options": {
      "presencePenalty": 0.1,
      "frequencyPenalty": 0.1
    }
  }
}
```

### 5. WAHA Send Message Node
```json
{
  "id": "waha_send",
  "name": "Send WhatsApp Message",
  "type": "n8n-nodes-base.httpRequest",
  "typeVersion": 4.1,
  "position": [1100, 100],
  "parameters": {
    "url": "{{$env.WAHA_BASE_URL}}/api/sendText",
    "method": "POST",
    "authentication": "predefinedCredentialType",
    "nodeCredentialType": "httpHeaderAuth",
    "sendBody": true,
    "bodyParameters": {
      "parameters": [
        {
          "name": "session",
          "value": "={{$json.session}}"
        },
        {
          "name": "to",
          "value": "={{$json.to}}"
        },
        {
          "name": "text",
          "value": "={{$json.text}}"
        }
      ]
    },
    "options": {
      "timeout": 15000,
      "retry": {
        "enabled": true,
        "maxRetries": 3,
        "retryDelay": 1000
      }
    }
  }
}
```

---

## 🔌 API Integration

### Laravel API Endpoints

#### Knowledge Base Search
```http
GET /api/v1/knowledge-base/search
Authorization: Bearer {token}
Content-Type: application/json

Query Parameters:
- query: string (required) - Search query
- organization_id: string (required) - Organization ID
- limit: integer (optional) - Number of results (default: 5)
- include_content: boolean (optional) - Include full content (default: false)
```

#### Conversation History
```http
GET /api/v1/conversations/history
Authorization: Bearer {token}
Content-Type: application/json

Query Parameters:
- session_id: string (required) - Session ID
- limit: integer (optional) - Number of messages (default: 10)
```

#### Analytics Logging
```http
POST /api/v1/analytics/workflow-execution
Authorization: Bearer {token}
Content-Type: application/json

Body:
{
  "workflow_id": "string",
  "execution_id": "string",
  "organization_id": "string",
  "session_id": "string",
  "user_phone": "string",
  "metrics": "object",
  "event_type": "string",
  "timestamp": "string"
}
```

### WAHA API Integration

#### Send Text Message
```http
POST /api/sendText
Authorization: Bearer {waha_token}
Content-Type: application/json

Body:
{
  "session": "string",
  "to": "string",
  "text": "string"
}
```

#### Get Sessions
```http
GET /api/sessions
Authorization: Bearer {waha_token}
Content-Type: application/json
```

#### Start Session
```http
POST /api/sessions/{sessionId}/start
Authorization: Bearer {waha_token}
Content-Type: application/json
```

### OpenAI API Integration

#### Chat Completion
```http
POST https://api.openai.com/v1/chat/completions
Authorization: Bearer {openai_token}
Content-Type: application/json

Body:
{
  "model": "gpt-4",
  "messages": [
    {
      "role": "system",
      "content": "string"
    },
    {
      "role": "user",
      "content": "string"
    }
  ],
  "temperature": 0.7,
  "max_tokens": 500
}
```

---

## 🚨 Error Handling

### Error Types & Handling

#### 1. **Network Errors**
```json
{
  "type": "network_error",
  "severity": "high",
  "handling": {
    "retry": true,
    "max_retries": 3,
    "retry_delay": 1000,
    "fallback": "Send error message to customer"
  }
}
```

#### 2. **API Errors**
```json
{
  "type": "api_error",
  "severity": "medium",
  "handling": {
    "retry": true,
    "max_retries": 2,
    "retry_delay": 2000,
    "fallback": "Use cached response or default message"
  }
}
```

#### 3. **Authentication Errors**
```json
{
  "type": "auth_error",
  "severity": "critical",
  "handling": {
    "retry": false,
    "fallback": "Escalate to human support",
    "alert": "Notify admin immediately"
  }
}
```

#### 4. **Rate Limit Errors**
```json
{
  "type": "rate_limit",
  "severity": "medium",
  "handling": {
    "retry": true,
    "max_retries": 1,
    "retry_delay": 5000,
    "fallback": "Queue message for later processing"
  }
}
```

### Error Response Format
```json
{
  "success": false,
  "error": {
    "type": "string",
    "message": "string",
    "code": "string",
    "details": "object",
    "timestamp": "string",
    "request_id": "string"
  },
  "fallback_response": {
    "message": "string",
    "escalated": "boolean",
    "support_contact": "string"
  }
}
```

---

## 📊 Monitoring & Analytics

### Key Performance Indicators (KPIs)

#### 1. **Response Time Metrics**
- **Target**: < 3 seconds
- **Measurement**: End-to-end processing time
- **Alert Threshold**: > 5 seconds
- **Monitoring**: Real-time dashboard

#### 2. **Success Rate Metrics**
- **Target**: > 95%
- **Measurement**: Successful workflow executions
- **Alert Threshold**: < 90%
- **Monitoring**: Hourly reports

#### 3. **Customer Satisfaction**
- **Target**: > 80%
- **Measurement**: Response quality scoring
- **Alert Threshold**: < 70%
- **Monitoring**: Daily reports

#### 4. **Knowledge Base Relevance**
- **Target**: > 70%
- **Measurement**: Search result relevance
- **Alert Threshold**: < 60%
- **Monitoring**: Weekly reports

#### 5. **Cost per Interaction**
- **Target**: < $0.10
- **Measurement**: Total cost / interactions
- **Alert Threshold**: > $0.15
- **Monitoring**: Daily reports

### Analytics Dashboard

#### Real-time Metrics
```json
{
  "current_status": {
    "active_workflows": 15,
    "processing_time_avg": 2.3,
    "success_rate": 96.5,
    "error_rate": 3.5,
    "cost_per_hour": 12.50
  },
  "performance_trends": {
    "response_time": [2.1, 2.3, 2.2, 2.4, 2.1],
    "success_rate": [95.2, 96.1, 96.5, 95.8, 96.5],
    "cost_trend": [11.20, 12.10, 12.50, 11.80, 12.50]
  },
  "alerts": [
    {
      "type": "performance",
      "severity": "warning",
      "message": "Response time exceeded threshold",
      "timestamp": "2024-01-15T10:30:00Z"
    }
  ]
}
```

#### Historical Reports
```json
{
  "daily_report": {
    "date": "2024-01-15",
    "total_interactions": 1250,
    "successful_interactions": 1206,
    "failed_interactions": 44,
    "avg_response_time": 2.3,
    "total_cost": 125.50,
    "customer_satisfaction": 82.5
  },
  "weekly_report": {
    "week": "2024-W03",
    "total_interactions": 8750,
    "successful_interactions": 8437,
    "failed_interactions": 313,
    "avg_response_time": 2.2,
    "total_cost": 875.25,
    "customer_satisfaction": 83.2
  }
}
```

---

## 🔒 Security & Compliance

### Security Measures

#### 1. **Data Encryption**
- **In Transit**: TLS 1.3 untuk semua komunikasi
- **At Rest**: AES-256 encryption untuk data sensitif
- **API Keys**: Encrypted storage dengan rotation

#### 2. **Authentication & Authorization**
- **JWT Tokens**: Secure token-based authentication
- **API Keys**: Rotated setiap 30 hari
- **Role-based Access**: Granular permission system

#### 3. **Input Validation**
- **Sanitization**: All inputs sanitized dan validated
- **SQL Injection**: Parameterized queries
- **XSS Protection**: Content sanitization

#### 4. **PII Protection**
- **Detection**: Automatic PII detection
- **Masking**: Sensitive data masking
- **Retention**: Automatic data purging

### Compliance Standards

#### 1. **GDPR Compliance**
- **Data Minimization**: Only necessary data collected
- **Purpose Limitation**: Data used only for intended purpose
- **Storage Limitation**: Data retained only as needed
- **Consent Management**: Explicit consent required

#### 2. **SOC 2 Type II**
- **Security**: Comprehensive security controls
- **Availability**: 99.9% uptime guarantee
- **Processing Integrity**: Data processing accuracy
- **Confidentiality**: Data protection measures

#### 3. **ISO 27001**
- **Information Security**: Comprehensive ISMS
- **Risk Management**: Regular risk assessments
- **Continuous Improvement**: Regular audits

---

## ⚡ Performance Optimization

### Optimization Strategies

#### 1. **Caching Strategy**
```json
{
  "cache_layers": {
    "redis": {
      "purpose": "Session data, API responses",
      "ttl": "3600 seconds",
      "hit_rate": "85%"
    },
    "database": {
      "purpose": "Query result caching",
      "ttl": "1800 seconds",
      "hit_rate": "70%"
    },
    "cdn": {
      "purpose": "Static content, API responses",
      "ttl": "86400 seconds",
      "hit_rate": "95%"
    }
  }
}
```

#### 2. **Database Optimization**
```sql
-- Indexes for performance
CREATE INDEX idx_kb_search ON knowledge_base_items 
USING gin(to_tsvector('english', title || ' ' || description || ' ' || content));

CREATE INDEX idx_org_kb ON knowledge_base_items (organization_id, is_searchable);

CREATE INDEX idx_conversation_session ON conversations (session_id, created_at);
```

#### 3. **API Optimization**
- **Connection Pooling**: Reuse database connections
- **Request Batching**: Batch multiple requests
- **Response Compression**: Gzip compression
- **Rate Limiting**: Prevent API abuse

#### 4. **AI Model Optimization**
- **Prompt Engineering**: Optimize prompts for efficiency
- **Token Usage**: Minimize token consumption
- **Response Caching**: Cache similar responses
- **Model Selection**: Use appropriate model for task

### Performance Monitoring

#### 1. **Real-time Metrics**
```json
{
  "performance_metrics": {
    "response_time": {
      "current": 2.3,
      "target": 3.0,
      "trend": "stable"
    },
    "throughput": {
      "current": 150,
      "target": 200,
      "trend": "increasing"
    },
    "error_rate": {
      "current": 3.5,
      "target": 5.0,
      "trend": "decreasing"
    }
  }
}
```

#### 2. **Resource Usage**
```json
{
  "resource_usage": {
    "cpu": {
      "current": 65,
      "target": 80,
      "trend": "stable"
    },
    "memory": {
      "current": 512,
      "target": 1024,
      "trend": "stable"
    },
    "disk": {
      "current": 75,
      "target": 90,
      "trend": "increasing"
    }
  }
}
```

---

## �� Deployment Guide

### Prerequisites
- Docker & Docker Compose
- PostgreSQL 15+
- Redis 7+
- Node.js 18+ (untuk development)
- PHP 8.1+ (untuk Laravel)

### Step 1: Environment Setup
```bash
# Clone repository
git clone https://github.com/your-org/ai-agent-workflow.git
cd ai-agent-workflow

# Copy environment files
cp .env.example .env
cp docker-compose.example.yml docker-compose.yml

# Update environment variables
nano .env
```

### Step 2: Database Setup
```bash
# Start PostgreSQL
docker-compose up -d postgres

# Run migrations
docker-compose exec app php artisan migrate

# Seed database
docker-compose exec app php artisan db:seed
```

### Step 3: N8N Setup
```bash
# Start N8N
docker-compose up -d n8n

# Import workflows
docker-compose exec n8n n8n import:workflow --input=/home/node/.n8n/workflows/ai-agent-workflow.json

# Configure credentials
# Access N8N UI at http://localhost:5678
# Add credentials for Laravel API, WAHA, OpenAI
```

### Step 4: WAHA Setup
```bash
# Start WAHA
docker-compose up -d waha

# Configure WhatsApp session
curl -X POST http://localhost:3000/api/sessions \
  -H "Content-Type: application/json" \
  -d '{"name": "agent_session", "config": {"webhook": "http://n8n:5678/webhook/kb-webhook/kb-456"}}'
```

### Step 5: Testing
```bash
# Test workflow
curl -X POST http://localhost:5678/webhook/kb-webhook/kb-456 \
  -H "Content-Type: application/json" \
  -d '{"session": "agent_session", "from": "+6281234567890", "text": "Test message"}'

# Check logs
docker-compose logs -f n8n
docker-compose logs -f app
```

---

## 🔧 Troubleshooting

### Common Issues

#### 1. **N8N Workflow Not Triggering**
**Symptoms:**
- Webhook not receiving requests
- Workflow not executing

**Solutions:**
```bash
# Check N8N status
docker-compose ps n8n

# Check webhook URL
curl -X GET http://localhost:5678/webhook/kb-webhook/kb-456

# Check N8N logs
docker-compose logs n8n
```

#### 2. **API Connection Errors**
**Symptoms:**
- 401 Unauthorized errors
- 404 Not Found errors
- Connection timeout

**Solutions:**
```bash
# Check API credentials
docker-compose exec n8n n8n credentials:list

# Test API connectivity
curl -X GET http://localhost:8000/api/v1/knowledge-base/search \
  -H "Authorization: Bearer your-token"

# Check network connectivity
docker-compose exec n8n ping app
```

#### 3. **Database Connection Issues**
**Symptoms:**
- Database connection errors
- Query timeout
- Data not found

**Solutions:**
```bash
# Check database status
docker-compose ps postgres

# Test database connection
docker-compose exec app php artisan tinker
>>> DB::connection()->getPdo();

# Check database logs
docker-compose logs postgres
```

#### 4. **Performance Issues**
**Symptoms:**
- Slow response times
- High memory usage
- Timeout errors

**Solutions:**
```bash
# Check resource usage
docker stats

# Optimize database queries
docker-compose exec app php artisan optimize

# Clear caches
docker-compose exec app php artisan cache:clear
docker-compose exec app php artisan config:clear
```

### Debugging Tools

#### 1. **N8N Debug Mode**
```bash
# Enable debug logging
export N8N_LOG_LEVEL=debug
docker-compose up -d n8n

# Check debug logs
docker-compose logs -f n8n
```

#### 2. **Laravel Debug Mode**
```bash
# Enable debug mode
echo "APP_DEBUG=true" >> .env

# Check debug logs
docker-compose exec app tail -f storage/logs/laravel.log
```

#### 3. **Database Query Logging**
```bash
# Enable query logging
echo "DB_LOG_QUERIES=true" >> .env

# Check query logs
docker-compose exec app tail -f storage/logs/query.log
```

---

## 📚 Best Practices

### 1. **Workflow Design**
- **Modular Design**: Break workflows into smaller, reusable components
- **Error Handling**: Implement comprehensive error handling
- **Logging**: Add detailed logging for debugging
- **Testing**: Test workflows thoroughly before deployment

### 2. **API Design**
- **RESTful**: Follow REST principles
- **Versioning**: Use API versioning
- **Documentation**: Maintain comprehensive API documentation
- **Rate Limiting**: Implement rate limiting

### 3. **Security**
- **Input Validation**: Validate all inputs
- **Authentication**: Use secure authentication
- **Encryption**: Encrypt sensitive data
- **Monitoring**: Monitor for security threats

### 4. **Performance**
- **Caching**: Implement appropriate caching
- **Optimization**: Optimize database queries
- **Monitoring**: Monitor performance metrics
- **Scaling**: Plan for scalability

### 5. **Maintenance**
- **Documentation**: Keep documentation updated
- **Monitoring**: Monitor system health
- **Backups**: Regular backups
- **Updates**: Keep dependencies updated

---

## ❓ FAQ

### Q: Bagaimana cara menambahkan knowledge base baru?
**A:** 
1. Tambahkan knowledge base di Laravel admin panel
2. Update N8N workflow dengan knowledge base ID baru
3. Test workflow dengan knowledge base baru

### Q: Bagaimana cara mengoptimalkan response time?
**A:**
1. Implement caching untuk API responses
2. Optimize database queries
3. Use connection pooling
4. Implement response compression

### Q: Bagaimana cara menangani error yang sering terjadi?
**A:**
1. Implement retry mechanism
2. Add fallback responses
3. Monitor error patterns
4. Update error handling logic

### Q: Bagaimana cara menambah fitur baru ke workflow?
**A:**
1. Design fitur baru di N8N
2. Update Laravel API jika diperlukan
3. Test fitur baru thoroughly
4. Deploy ke production

### Q: Bagaimana cara monitoring sistem?
**A:**
1. Use N8N built-in monitoring
2. Implement custom analytics
3. Set up alerts untuk critical issues
4. Regular performance reviews

---

## 📞 Support

### Contact Information
- **Email**: support@your-company.com
- **Phone**: +62-21-1234-5678
- **Documentation**: https://docs.your-company.com
- **GitHub**: https://github.com/your-org/ai-agent-workflow

### Support Hours
- **Monday - Friday**: 09:00 - 18:00 WIB
- **Saturday**: 09:00 - 12:00 WIB
- **Sunday**: Closed

### Emergency Support
- **24/7 Hotline**: +62-21-1234-5679
- **Emergency Email**: emergency@your-company.com

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

---

## 📝 Changelog

### Version 1.0.0 (2024-01-15)
- Initial release
- Basic AI Agent workflow
- N8N integration
- WAHA integration
- Analytics dashboard

---

**Dokumentasi ini dibuat dengan ❤️ untuk membantu implementasi AI Agent workflow yang optimal dan production-ready!** 🚀
```

Dokumentasi lengkap ini mencakup semua aspek yang diperlukan untuk implementasi AI Agent workflow di N8N, mulai dari overview, arsitektur, konfigurasi, hingga troubleshooting dan best practices. Dokumentasi ini dapat digunakan sebagai referensi lengkap untuk tim development dan operations.
