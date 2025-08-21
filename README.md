# Chatbot SaaS Backend API

A scalable, secure, and reliable backend API built with Laravel 12, FrankenPHP, PostgreSQL, Redis, and RabbitMQ.

## 🏗️ Architecture Overview

Modern, cloud-native architecture designed for high performance, scalability, and reliability:

- **Framework**: Laravel 12 with MVCS pattern (without repository layer)
- **Runtime**: FrankenPHP for optimal PHP performance
- **Database**: PostgreSQL with read replicas
- **Cache**: Redis for caching and session storage
- **Message Queue**: RabbitMQ for asynchronous processing
- **Containerization**: Docker with multi-service orchestration

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Git

### Installation

1. **Clone and setup**
   ```bash
   git clone <repository-url>
   cd chatbot_saas_be
   cp env.example .env
   ```

2. **Start services**
   ```bash
   docker compose up -d
   ```

3. **Install and migrate**
   ```bash
   docker compose exec app composer install
   docker compose exec app php artisan key:generate
   docker compose exec app php artisan migrate
   ```

## 📊 Service URLs

| Service | URL | Credentials |
|---------|-----|-------------|
| **API** | http://localhost | - |
| **RabbitMQ Management** | http://localhost:15672 | admin/password |
| **Database** | localhost:5432 | postgres/password |
| **Redis** | localhost:6379 | - |

## 🏛️ Architecture Features

### MVCS Pattern (No Repository)
- **Models**: Eloquent models with relationships
- **Views**: API resources for data formatting
- **Controllers**: HTTP handling, minimal business logic
- **Services**: Business logic and data processing

### Performance Optimizations
- FrankenPHP for 5-10x faster execution
- Redis caching with intelligent invalidation
- RabbitMQ priority queues
- Database connection pooling
- Horizontal scaling ready

### Security Features
- JWT/Sanctum authentication
- Role-based access control (RBAC)
- API rate limiting with zones
- Input validation and sanitization
- CORS and security headers

### Monitoring & Reliability
- Laravel Horizon for queue monitoring
- Health checks for all services
- Structured logging with rotation
- Queue job retries with backoff
- Automated database backups

## 📁 Project Structure

```
├── app/
│   ├── Http/Controllers/Api/V1/  # API controllers
│   ├── Services/                 # Business logic
│   ├── Models/                   # Eloquent models
│   ├── Jobs/Events/Listeners/    # Queue & events
│   └── Http/Requests/Resources/  # Validation & formatting
├── docker/                       # Container configs
│   ├── frankenphp/              # FrankenPHP setup
│   ├── supervisor/              # Process management
│   └── {postgres,redis,rabbitmq}/ # Service configs
├── database/migrations/          # Database schema
└── routes/api.php               # API routes
```

## 🔧 Key Technologies

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Runtime** | FrankenPHP | High-performance PHP server |
| **Framework** | Laravel 12 | Modern PHP framework |
| **Database** | PostgreSQL 16 | Primary data storage |
| **Cache** | Redis 7 | Cache & sessions |
| **Queue** | RabbitMQ 3 | Message broker |
| **Containers** | Docker | Orchestration |

## 📈 Scaling Configuration

### Horizontal Scaling
```yaml
# Scale app instances
services:
  app:
    deploy:
      replicas: 3

# Scale queue workers  
  queue-worker:
    deploy:
      replicas: 5
```

### Queue Types
- **high_priority**: Time-sensitive operations
- **default**: Standard processing
- **notifications**: Email & push notifications
- **low_priority**: Background cleanup

## 🧪 Development Commands

```bash
# Run tests
docker compose exec app php artisan test

# Queue monitoring
docker compose exec app php artisan horizon

# Cache optimization
docker compose exec app php artisan config:cache
docker compose exec app php artisan route:cache

# Database operations
docker compose exec app php artisan migrate
docker compose exec app php artisan db:seed
```

## 🔒 Security Best Practices

- Input validation via Form Requests
- SQL injection prevention via Eloquent ORM
- XSS protection with output encoding
- Rate limiting per IP/user
- Role-based permissions
- Activity logging for audit trails

## 📞 API Documentation

### Base URL: `/api/v1`

### Authentication
```bash
Authorization: Bearer <jwt-token>
```

### Example Endpoints
```bash
# Health check
GET /api/health

# User management
GET /api/v1/users
POST /api/v1/users
PUT /api/v1/users/{id}

# Chatbot operations (to be implemented)
GET /api/v1/chatbots
POST /api/v1/chatbots
POST /api/v1/chatbots/{id}/train
POST /api/v1/chatbots/{id}/chat
```

## 🆘 Troubleshooting

```bash
# Check service status
docker compose ps

# View service logs
docker compose logs <service-name>

# Restart services
docker compose restart <service-name>

# Database connection test
docker compose exec app php artisan tinker
>>> DB::connection()->getPdo();
```

---

**Built with Laravel 12 + FrankenPHP for optimal performance and scalability.**
