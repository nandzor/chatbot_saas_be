# Organization Management API Documentation

## Overview
This document provides comprehensive documentation for the Organization Management API endpoints. All endpoints require authentication and are designed to manage organizations, users, roles, permissions, analytics, and settings.

## Base URL
```
http://localhost:9000/api/v1
```

## Authentication
All API endpoints require a valid Bearer token in the Authorization header:
```
Authorization: Bearer {your_token}
```

## Organization Management Endpoints

### 1. Get Organization Analytics
**Endpoint:** `GET /organizations/{organization}/analytics`

**Description:** Retrieve analytics data for a specific organization including growth metrics, trends, and performance data.

**Parameters:**
- `organization` (string, required): Organization UUID
- `time_range` (string, optional): Time range for analytics (7d, 30d, 90d, 1y). Default: 30d

**Response:**
```json
{
  "success": true,
  "data": {
    "growth": {
      "users": 15.2,
      "conversations": 8.7,
      "revenue": 12.5
    },
    "trends": {
      "users": [
        {"date": "2024-01-01", "value": 100},
        {"date": "2024-01-02", "value": 105}
      ],
      "conversations": [...],
      "revenue": [...]
    },
    "metrics": {
      "totalUsers": 150,
      "activeUsers": 120,
      "totalConversations": 2500,
      "totalRevenue": 15000,
      "avgResponseTime": 2.5,
      "satisfactionScore": 4.2
    },
    "topFeatures": [
      {
        "name": "Chatbot Integration",
        "usage": 85,
        "growth": 12.5
      }
    ],
    "activityLog": [
      {
        "id": 1,
        "action": "User Created",
        "user": "John Doe",
        "timestamp": "2024-01-15T10:30:00Z",
        "details": "New user added to organization"
      }
    ]
  }
}
```

### 2. Get Organization Settings
**Endpoint:** `GET /organizations/{organization}/settings`

**Description:** Retrieve all settings for a specific organization.

**Parameters:**
- `organization` (string, required): Organization UUID

**Response:**
```json
{
  "success": true,
  "data": {
    "general": {
      "name": "Acme Corporation",
      "displayName": "Acme Corp",
      "email": "contact@acme.com",
      "phone": "+1-555-0123",
      "website": "https://acme.com",
      "taxId": "TAX123456",
      "address": "123 Main St, City, State 12345",
      "description": "Leading technology company",
      "logo": "https://acme.com/logo.png",
      "timezone": "UTC",
      "locale": "en",
      "currency": "USD"
    },
    "system": {
      "status": "active",
      "businessType": "corporation",
      "industry": "technology",
      "companySize": "medium",
      "foundedYear": 2020,
      "employeeCount": 150,
      "annualRevenue": 5000000,
      "socialMedia": {
        "twitter": "@acme",
        "linkedin": "acme-corp"
      }
    },
    "api": {
      "apiKey": "sk_...",
      "webhookUrl": "https://acme.com/webhook",
      "webhookSecret": "whsec_...",
      "rateLimit": 1000,
      "allowedOrigins": ["https://acme.com"],
      "enableApiAccess": true,
      "enableWebhooks": true
    },
    "subscription": {
      "plan": "professional",
      "billingCycle": "monthly",
      "status": "active",
      "startDate": "2024-01-01T00:00:00Z",
      "endDate": "2024-12-31T23:59:59Z",
      "autoRenew": true,
      "features": ["chatbot", "analytics", "api"],
      "limits": {
        "users": 1000,
        "conversations": 10000
      }
    },
    "security": {
      "twoFactorAuth": true,
      "ssoEnabled": false,
      "ssoProvider": null,
      "passwordPolicy": {
        "minLength": 8,
        "requireUppercase": true,
        "requireNumbers": true
      },
      "sessionTimeout": 30,
      "ipWhitelist": [],
      "allowedDomains": ["acme.com"]
    },
    "notifications": {
      "email": {
        "enabled": true,
        "types": ["user_created", "subscription_expired"]
      },
      "push": {
        "enabled": false
      },
      "webhook": {
        "enabled": true,
        "events": ["user.created", "subscription.expired"]
      }
    },
    "features": {
      "chatbot": {
        "enabled": true,
        "maxBots": 10
      },
      "analytics": {
        "enabled": true,
        "retentionDays": 365
      },
      "integrations": {
        "enabled": true,
        "available": ["slack", "teams"]
      },
      "customBranding": {
        "enabled": true,
        "allowCustomLogo": true
      }
    }
  }
}
```

### 3. Update Organization Settings
**Endpoint:** `PUT /organizations/{organization}/settings`

**Description:** Update organization settings. Only provided fields will be updated.

**Parameters:**
- `organization` (string, required): Organization UUID

**Request Body:**
```json
{
  "general": {
    "name": "Updated Organization Name",
    "email": "newemail@acme.com"
  },
  "api": {
    "rateLimit": 2000,
    "enableApiAccess": true
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Organization settings updated successfully",
  "data": {
    // Updated settings object
  }
}
```

### 4. Test Webhook
**Endpoint:** `POST /organizations/{organization}/webhook/test`

**Description:** Test webhook URL by sending a test payload.

**Parameters:**
- `organization` (string, required): Organization UUID

**Request Body:**
```json
{
  "webhookUrl": "https://acme.com/webhook"
}
```

**Response:**
```json
{
  "success": true,
  "url": "https://acme.com/webhook",
  "response_time": 150,
  "status_code": 200,
  "message": "Webhook test successful",
  "payload": {
    "event": "webhook.test",
    "organization_id": "6a41536f-26a8-4738-a901-0fe248724648",
    "organization_name": "Acme Corporation",
    "timestamp": "2024-01-15T10:30:00Z",
    "data": {
      "message": "This is a test webhook from Acme Corporation",
      "test_id": "unique_id",
      "version": "1.0"
    }
  }
}
```

### 5. Get Organization Roles
**Endpoint:** `GET /organizations/{organization}/roles`

**Description:** Retrieve all roles for a specific organization.

**Parameters:**
- `organization` (string, required): Organization UUID

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Organization Admin",
      "slug": "organization_admin",
      "description": "Full access to organization settings and user management",
      "permissions": [
        "users.view",
        "users.create",
        "users.update",
        "users.delete",
        "organization.view",
        "organization.update"
      ],
      "userCount": 2,
      "isSystem": true,
      "isActive": true,
      "sortOrder": 0,
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### 6. Update Role Permissions
**Endpoint:** `PUT /organizations/{organization}/roles/{roleId}/permissions`

**Description:** Update permissions for a specific role.

**Parameters:**
- `organization` (string, required): Organization UUID
- `roleId` (integer, required): Role ID

**Request Body:**
```json
{
  "permissions": [
    "users.view",
    "users.create",
    "users.update",
    "organization.view"
  ]
}
```

**Response:**
```json
{
  "success": true,
  "roleId": 1,
  "permissions": [
    "users.view",
    "users.create",
    "users.update",
    "organization.view"
  ],
  "message": "Role permissions saved successfully"
}
```

### 7. Update All Permissions
**Endpoint:** `PUT /organizations/{organization}/permissions`

**Description:** Update permissions for multiple roles at once.

**Parameters:**
- `organization` (string, required): Organization UUID

**Request Body:**
```json
{
  "1": [
    "users.view",
    "users.create",
    "users.update"
  ],
  "2": [
    "users.view",
    "organization.view"
  ]
}
```

**Response:**
```json
{
  "success": true,
  "rolePermissions": {
    "1": ["users.view", "users.create", "users.update"],
    "2": ["users.view", "organization.view"]
  },
  "message": "All permissions saved successfully"
}
```

### 8. Get Organization Users
**Endpoint:** `GET /organizations/{organization}/users`

**Description:** Retrieve users for a specific organization with pagination and filtering.

**Parameters:**
- `organization` (string, required): Organization UUID
- `page` (integer, optional): Page number. Default: 1
- `limit` (integer, optional): Items per page. Default: 10
- `search` (string, optional): Search term for name or email
- `role` (string, optional): Filter by role slug
- `status` (string, optional): Filter by user status

**Response:**
```json
{
  "success": true,
  "data": {
    "organization": {
      "id": "6a41536f-26a8-4738-a901-0fe248724648",
      "name": "Acme Corporation",
      "org_code": "ACME001"
    },
    "users": [
      {
        "id": "91544318-0dce-4652-a15c-ef36735499dc",
        "name": "John Doe",
        "email": "john@acme.com",
        "role": "Organization Admin",
        "roleSlug": "organization_admin",
        "status": "active",
        "lastLogin": "2024-01-15T10:30:00Z",
        "createdAt": "2024-01-01T00:00:00Z"
      }
    ],
    "total_users": 25,
    "pagination": {
      "current_page": 1,
      "per_page": 10,
      "total": 25,
      "last_page": 3
    }
  }
}
```

## Error Responses

All endpoints return standardized error responses:

```json
{
  "success": false,
  "message": "Error description",
  "error_code": "ERROR_CODE",
  "timestamp": "2024-01-15T10:30:00Z",
  "request_id": "req_unique_id",
  "debug": {
    "exception": "ExceptionClass",
    "message": "Detailed error message",
    "file": "/path/to/file.php",
    "line": 123,
    "trace": "Stack trace..."
  }
}
```

## Common Error Codes

- `UNAUTHORIZED`: Authentication required
- `FORBIDDEN`: Access denied
- `VALIDATION_ERROR`: Request validation failed
- `RESOURCE_NOT_FOUND`: Requested resource not found
- `INTERNAL_SERVER_ERROR`: Internal server error

## Rate Limiting

API endpoints are rate limited to prevent abuse:
- **Analytics endpoints**: 100 requests per minute
- **Settings endpoints**: 50 requests per minute
- **User management**: 200 requests per minute
- **Role/Permission management**: 100 requests per minute

## Caching

Responses are cached for performance:
- **Analytics data**: 5 minutes
- **Settings data**: 10 minutes
- **Roles/Permissions**: 15 minutes
- **User data**: 2 minutes

Cache headers are included in responses:
- `X-Cache`: HIT/MISS
- `X-Cache-Key`: Cache key used
- `X-Cache-Duration`: Cache duration in seconds

## Performance Monitoring

All API requests are logged for monitoring:
- Request/response times
- Error rates
- User activity
- Organization usage patterns

Logs are available in: `storage/logs/organization.log`

## Security

- All endpoints require authentication
- Role-based access control (RBAC)
- Input validation and sanitization
- SQL injection prevention
- XSS protection
- Rate limiting
- Audit logging

## Support

For API support and questions:
- Email: api-support@chatbot-saas.com
- Documentation: https://docs.chatbot-saas.com
- Status Page: https://status.chatbot-saas.com
