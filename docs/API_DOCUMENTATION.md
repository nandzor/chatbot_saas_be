# 🚀 Chatbot SaaS API Documentation

## 📋 Overview

This document provides comprehensive documentation for the Chatbot SaaS API, including all endpoints, authentication, request/response formats, and examples.

## 🔐 Authentication

The API uses a unified authentication system with JWT + Sanctum + Refresh Token strategy.

### Authentication Headers

```http
Authorization: Bearer {jwt_token}
X-API-Token: {sanctum_token}
X-Refresh-Token: {refresh_token}
```

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/register` | User registration |
| POST | `/api/auth/logout` | User logout |
| POST | `/api/auth/refresh` | Refresh token |
| POST | `/api/auth/forgot-password` | Forgot password |
| POST | `/api/auth/reset-password` | Reset password |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/profile` | Update profile |

## 🏢 Organization Management

### Organization Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/organizations` | List organizations |
| POST | `/api/organizations` | Create organization |
| GET | `/api/organizations/{id}` | Get organization |
| PUT | `/api/organizations/{id}` | Update organization |
| DELETE | `/api/organizations/{id}` | Delete organization |

### Example: Create Organization

```http
POST /api/organizations
Content-Type: application/json
Authorization: Bearer {token}

{
    "name": "Acme Corporation",
    "email": "contact@acme.com",
    "phone": "+1234567890",
    "address": "123 Main St, City, State 12345",
    "website": "https://acme.com",
    "industry": "Technology",
    "size": "medium"
}
```

### Example: Update Organization

```http
PUT /api/organizations/1
Content-Type: application/json
Authorization: Bearer {token}

{
    "name": "Acme Corporation Updated",
    "email": "newcontact@acme.com",
    "phone": "+1234567890",
    "address": "456 New St, City, State 12345"
}
```

## 💳 Payment Management

### Payment Transaction Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/payment-transactions` | List payment transactions |
| POST | `/api/payment-transactions` | Create payment transaction |
| GET | `/api/payment-transactions/{id}` | Get payment transaction |
| PUT | `/api/payment-transactions/{id}` | Update payment transaction |
| DELETE | `/api/payment-transactions/{id}` | Delete payment transaction |
| POST | `/api/payment-transactions/{id}/refund` | Refund transaction |
| POST | `/api/payment-transactions/bulk-refund` | Bulk refund transactions |
| GET | `/api/payment-transactions/export` | Export transactions |

### Example: Create Payment Transaction

```http
POST /api/payment-transactions
Content-Type: application/json
Authorization: Bearer {token}

{
    "organization_id": 1,
    "subscription_id": 1,
    "amount": 99.99,
    "currency": "USD",
    "gateway": "stripe",
    "payment_method": "credit_card",
    "description": "Monthly subscription payment"
}
```

### Example: Refund Transaction

```http
POST /api/payment-transactions/1/refund
Content-Type: application/json
Authorization: Bearer {token}

{
    "amount": 99.99,
    "reason": "Customer request",
    "refund_type": "full"
}
```

## 📊 Subscription Management

### Subscription Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/subscriptions` | List subscriptions |
| POST | `/api/subscriptions` | Create subscription |
| GET | `/api/subscriptions/{id}` | Get subscription |
| PUT | `/api/subscriptions/{id}` | Update subscription |
| DELETE | `/api/subscriptions/{id}` | Delete subscription |
| POST | `/api/subscriptions/{id}/upgrade` | Upgrade subscription |
| POST | `/api/subscriptions/{id}/downgrade` | Downgrade subscription |
| POST | `/api/subscriptions/{id}/cancel` | Cancel subscription |

### Example: Create Subscription

```http
POST /api/subscriptions
Content-Type: application/json
Authorization: Bearer {token}

{
    "organization_id": 1,
    "subscription_plan_id": 1,
    "billing_cycle": "monthly",
    "status": "active",
    "start_date": "2024-01-01",
    "end_date": "2024-12-31"
}
```

### Example: Upgrade Subscription

```http
POST /api/subscriptions/1/upgrade
Content-Type: application/json
Authorization: Bearer {token}

{
    "new_plan_id": 2,
    "upgrade_date": "2024-01-15",
    "proration": true
}
```

## 📋 Subscription Plans

### Subscription Plan Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/subscription-plans` | List subscription plans |
| POST | `/api/subscription-plans` | Create subscription plan |
| GET | `/api/subscription-plans/{id}` | Get subscription plan |
| PUT | `/api/subscription-plans/{id}` | Update subscription plan |
| DELETE | `/api/subscription-plans/{id}` | Delete subscription plan |
| GET | `/api/subscription-plans/compare` | Compare plans |
| GET | `/api/subscription-plans/recommendations` | Get plan recommendations |

### Example: Create Subscription Plan

```http
POST /api/subscription-plans
Content-Type: application/json
Authorization: Bearer {token}

{
    "name": "Professional Plan",
    "description": "Professional plan for growing businesses",
    "price": 99.99,
    "currency": "USD",
    "billing_cycle": "monthly",
    "features": {
        "max_users": 50,
        "max_chatbots": 10,
        "api_calls": 10000,
        "storage": "10GB"
    },
    "is_active": true
}
```

## 🧾 Billing Invoices

### Billing Invoice Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/billing-invoices` | List billing invoices |
| POST | `/api/billing-invoices` | Create billing invoice |
| GET | `/api/billing-invoices/{id}` | Get billing invoice |
| PUT | `/api/billing-invoices/{id}` | Update billing invoice |
| PATCH | `/api/billing-invoices/{id}/mark-paid` | Mark invoice as paid |
| PATCH | `/api/billing-invoices/{id}/mark-overdue` | Mark invoice as overdue |
| PATCH | `/api/billing-invoices/{id}/cancel` | Cancel invoice |
| GET | `/api/billing-invoices/organization/{id}` | Get organization invoices |
| GET | `/api/billing-invoices/subscription/{id}` | Get subscription invoices |
| GET | `/api/billing-invoices/overdue/list` | Get overdue invoices |
| GET | `/api/billing-invoices/upcoming/list` | Get upcoming invoices |
| GET | `/api/billing-invoices/statistics/summary` | Get invoice statistics |

### Example: Create Billing Invoice

```http
POST /api/billing-invoices
Content-Type: application/json
Authorization: Bearer {token}

{
    "organization_id": 1,
    "subscription_id": 1,
    "total_amount": 99.99,
    "currency": "USD",
    "billing_cycle": "monthly",
    "due_date": "2024-02-01",
    "period_start": "2024-01-01",
    "period_end": "2024-01-31"
}
```

### Example: Mark Invoice as Paid

```http
PATCH /api/billing-invoices/1/mark-paid
Content-Type: application/json
Authorization: Bearer {token}

{
    "paid_date": "2024-01-15",
    "payment_method": "stripe",
    "payment_reference": "pi_1234567890"
}
```

## 👥 User Management

### User Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | List users |
| POST | `/api/users` | Create user |
| GET | `/api/users/{id}` | Get user |
| PUT | `/api/users/{id}` | Update user |
| DELETE | `/api/users/{id}` | Delete user |
| GET | `/api/users/{id}/profile` | Get user profile |
| PUT | `/api/users/{id}/profile` | Update user profile |

### Example: Create User

```http
POST /api/users
Content-Type: application/json
Authorization: Bearer {token}

{
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@example.com",
    "username": "johndoe",
    "password": "securepassword123",
    "role": "user",
    "organization_id": 1
}
```

## 🔍 Health Check & Monitoring

### Health Check Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health/basic` | Basic health check |
| GET | `/api/health/detailed` | Detailed health check |
| GET | `/api/health/metrics` | System metrics |

### Example: Basic Health Check

```http
GET /api/health/basic
```

Response:
```json
{
    "success": true,
    "message": "Application is healthy",
    "data": {
        "status": "healthy",
        "timestamp": "2024-01-15T10:30:00Z",
        "version": "1.0.0",
        "environment": "production"
    }
}
```

## 📝 Request/Response Format

### Standard Response Format

All API responses follow this standard format:

```json
{
    "success": true,
    "message": "Operation completed successfully",
    "data": {
        // Response data here
    },
    "meta": {
        "pagination": {
            "current_page": 1,
            "per_page": 15,
            "total": 100,
            "last_page": 7
        }
    }
}
```

### Error Response Format

```json
{
    "success": false,
    "message": "Error message",
    "error": "ERROR_CODE",
    "errors": {
        "field_name": ["Validation error message"]
    }
}
```

## 🔒 Rate Limiting

The API implements rate limiting to ensure fair usage:

- **Authentication endpoints**: 5 requests per minute
- **General API endpoints**: 60 requests per minute
- **Webhook endpoints**: 100 requests per minute
- **Subscription endpoints**: 30 requests per minute

Rate limit headers are included in responses:
- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Remaining requests
- `X-RateLimit-Reset`: Time when limit resets

## 📊 Pagination

List endpoints support pagination with these parameters:

- `page`: Page number (default: 1)
- `per_page`: Items per page (default: 15, max: 100)

Example:
```http
GET /api/organizations?page=2&per_page=20
```

## 🔍 Filtering & Search

Many endpoints support filtering and search:

- `search`: Search term
- `filter[field]`: Filter by specific field
- `sort`: Sort field
- `order`: Sort order (asc/desc)

Example:
```http
GET /api/payment-transactions?search=stripe&filter[status]=completed&sort=created_at&order=desc
```

## 🚨 Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 422 | Validation Error |
| 429 | Too Many Requests |
| 500 | Internal Server Error |

## 📚 SDKs & Libraries

### JavaScript/Node.js

```javascript
const api = new ChatbotSaaSAPI({
    baseURL: 'https://api.chatbotsaas.com',
    token: 'your-jwt-token'
});

// Create organization
const organization = await api.organizations.create({
    name: 'Acme Corp',
    email: 'contact@acme.com'
});
```

### PHP

```php
$api = new ChatbotSaaSAPI([
    'base_url' => 'https://api.chatbotsaas.com',
    'token' => 'your-jwt-token'
]);

// Create organization
$organization = $api->organizations()->create([
    'name' => 'Acme Corp',
    'email' => 'contact@acme.com'
]);
```

## 🔧 Webhooks

The API supports webhooks for real-time notifications:

### Webhook Events

- `payment.completed`
- `payment.failed`
- `subscription.created`
- `subscription.updated`
- `subscription.cancelled`
- `invoice.generated`
- `invoice.overdue`

### Webhook Payload

```json
{
    "event": "payment.completed",
    "data": {
        "id": 123,
        "amount": 99.99,
        "currency": "USD",
        "status": "completed"
    },
    "timestamp": "2024-01-15T10:30:00Z"
}
```

## 📞 Support

For API support and questions:

- **Email**: api-support@chatbotsaas.com
- **Documentation**: https://docs.chatbotsaas.com
- **Status Page**: https://status.chatbotsaas.com

## 🔄 Changelog

### Version 1.0.0 (2024-01-15)
- Initial API release
- Organization management
- Payment processing
- Subscription management
- Billing invoices
- User management
- Health monitoring
