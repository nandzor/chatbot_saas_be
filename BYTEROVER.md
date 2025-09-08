# Byterover Handbook

*Generated: 2024-01-15*

## Layer 1: System Overview

**Purpose**: Chatbot SaaS Backend API - A scalable, secure, and reliable backend API for chatbot management with AI integration, WhatsApp communication, and workflow automation.

**Tech Stack**: 
- Laravel 12 Framework with MVCS pattern
- FrankenPHP runtime for high performance
- PostgreSQL 16 for primary data storage
- Redis 7 for caching and sessions
- RabbitMQ 3 for message broker
- N8N integration (kayedspace/laravel-n8n)
- WAHA WhatsApp integration (chengkangzai/laravel-waha-saloon-sdk)
- JWT/Sanctum authentication
- Laravel Horizon for queue monitoring

**Architecture**: Modern cloud-native MVCS (Model-View-Controller-Service) pattern without repository layer, designed for horizontal scaling and microservices readiness.

**Key Technical Decisions**:
- No repository layer - direct Eloquent model usage for simplicity
- Service layer for business logic separation
- FrankenPHP for 5-10x performance improvement
- Docker containerization for orchestration
- RabbitMQ priority queues for async processing
- AI Agent workflow automation with N8N

**Entry Points**: 
- `/api/v1/*` - Main API endpoints
- `/api/health` - Health check endpoint
- `artisan` - CLI commands
- Queue workers via Laravel Horizon

---

## Layer 2: Module Map

**Core Modules**:
- **AuthService**: JWT/Sanctum authentication, role-based access control
- **ChatbotService**: Core chatbot management and operations
- **ConversationService**: Chat session and message handling
- **KnowledgeBaseService**: AI knowledge base management and search
- **N8nService**: Workflow automation integration
- **WahaService**: WhatsApp HTTP API integration
- **OrganizationService**: Multi-tenant organization management
- **UserService**: User management and permissions

**Data Layer**:
- **Models/**: Eloquent ORM models with relationships
- **Database/Migrations**: Schema management
- **Database/Seeders**: Data seeding for development

**Integration Points**:
- **N8N Integration**: Workflow automation via kayedspace/laravel-n8n
- **WAHA Integration**: WhatsApp API via chengkangzai/laravel-waha-saloon-sdk
- **AI Processing**: OpenAI GPT integration for intelligent responses
- **Queue System**: RabbitMQ for async processing

**Utilities**:
- **BaseService**: Common service functionality
- **Traits/**: Reusable model and service traits
- **Jobs/**: Queue job implementations
- **Events/Listeners**: Event-driven architecture components

**Module Dependencies**:
```
AuthService → UserService → OrganizationService
ChatbotService → ConversationService → KnowledgeBaseService
N8nService → WahaService → ConversationService
```

---

## Layer 3: Integration Guide

**API Endpoints**:
- **Auth**: `/api/v1/auth/*` - Authentication and authorization
- **Users**: `/api/v1/users/*` - User management
- **Chatbots**: `/api/v1/chatbots/*` - Chatbot operations
- **Conversations**: `/api/v1/conversations/*` - Chat management
- **Knowledge Base**: `/api/v1/knowledge-base/*` - KB operations
- **N8N**: `/api/v1/n8n/*` - Workflow management
- **WAHA**: `/api/v1/waha/*` - WhatsApp operations

**Configuration Files**:
- `.env` - Environment configuration
- `config/app.php` - Application settings
- `config/database.php` - Database connections
- `config/queue.php` - Queue configuration
- `config/n8n.php` - N8N integration settings
- `config/waha.php` - WAHA integration settings

**External Integrations**:
- **OpenAI API**: GPT-4 for AI responses
- **N8N API**: Workflow automation platform
- **WAHA API**: WhatsApp HTTP API
- **PostgreSQL**: Primary database
- **Redis**: Caching and sessions
- **RabbitMQ**: Message queuing

**Workflows**:
1. **AI Agent Workflow**: WhatsApp → WAHA → N8N → Laravel → AI Processing → Response
2. **Knowledge Base Search**: User Query → Full-text Search → Relevance Scoring → Results
3. **Conversation Flow**: Message Received → Processing → Knowledge Base → AI Response → Send
4. **Queue Processing**: Job Dispatch → RabbitMQ → Worker → Processing → Completion

**Interface Definitions**:
- **HTTP Resources**: API response formatting
- **Form Requests**: Input validation
- **Service Contracts**: Business logic interfaces
- **Event Contracts**: Event system interfaces

---

## Layer 4: Extension Points

**Design Patterns**:
- **Service Layer Pattern**: Business logic separation
- **Repository Pattern**: Avoided for simplicity (direct Eloquent usage)
- **Observer Pattern**: Laravel Events and Listeners
- **Factory Pattern**: Model factories for testing
- **Strategy Pattern**: Multiple AI providers support
- **Command Pattern**: Artisan commands and queue jobs

**Extension Points**:
- **Service Classes**: Extend BaseService for new business logic
- **Middleware**: Custom HTTP middleware for request processing
- **Events/Listeners**: Event-driven architecture extensions
- **Queue Jobs**: Async processing extensions
- **Artisan Commands**: CLI command extensions
- **API Resources**: Response formatting customization

**Customization Areas**:
- **AI Providers**: Extend AI processing with new providers
- **Workflow Nodes**: Custom N8N node implementations
- **Authentication**: Custom auth providers via Laravel Sanctum
- **Notification Channels**: Custom notification delivery
- **Queue Drivers**: Custom queue implementations
- **Cache Stores**: Custom caching mechanisms

**Plugin Architecture**:
- **Service Providers**: Laravel service container bindings
- **Package Development**: Custom Laravel packages
- **Event System**: Loosely coupled component communication
- **Middleware Stack**: Request/response processing pipeline
- **Configuration System**: Environment-based customization

**Recent Changes**:
- Added N8N workflow integration
- Implemented WAHA WhatsApp API
- Enhanced knowledge base search with PostgreSQL full-text search
- Added AI Agent workflow automation
- Improved error handling and fallback mechanisms
- Implemented comprehensive monitoring and analytics

---

*Byterover handbook optimized for agent navigation and human developer onboarding*
