# Organization Management API Documentation

## Overview
This document provides comprehensive documentation for the Organization Management API endpoints. The API follows RESTful conventions and includes authentication, authorization, validation, audit logging, and real-time notifications.

## Base URL
```
https://your-domain.com/api/v1
```

## Authentication
All endpoints require authentication using Bearer token:
```
Authorization: Bearer {your-token}
```

## Middleware
- `organization.management`: Validates organization access and logs activities
- `permission`: Role-based access control
- `api.response`: Standardized API responses

## Organization Management Endpoints

### 1. Get All Organizations
```http
GET /organizations
```

**Query Parameters:**
- `status` (optional): Filter by organization status
- `subscription_status` (optional): Filter by subscription status
- `business_type` (optional): Filter by business type
- `industry` (optional): Filter by industry
- `company_size` (optional): Filter by company size
- `has_active_subscription` (optional): Filter by active subscription

**Response:**
```json
{
  "success": true,
  "message": "Daftar organisasi berhasil diambil",
  "data": {
    "data": [...],
    "current_page": 1,
    "last_page": 5,
    "per_page": 15,
    "total": 75
  }
}
```

### 2. Get Organization Details
```http
GET /organizations/{organizationId}
```

**Response:**
```json
{
  "success": true,
  "message": "Organization details retrieved successfully",
  "data": {
    "id": 1,
    "name": "Sample Organization",
    "display_name": "Sample Org",
    "email": "contact@sampleorg.com",
    "status": "active",
    "created_at": "2025-09-09T06:00:00.000000Z",
    "updated_at": "2025-09-09T06:00:00.000000Z"
  }
}
```

### 3. Update Organization
```http
PUT /organizations/{organizationId}
```

**Request Body:**
```json
{
  "name": "Updated Organization Name",
  "display_name": "Updated Display Name",
  "email": "updated@example.com",
  "phone": "+1234567890",
  "website": "https://example.com",
  "address": "123 Main St, City, State 12345"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Organization updated successfully",
  "data": {
    "id": 1,
    "name": "Updated Organization Name",
    "updated_at": "2025-09-09T06:30:00.000000Z"
  }
}
```

### 4. Get Organization Settings
```http
GET /organizations/{organizationId}/settings
```

**Response:**
```json
{
  "success": true,
  "message": "Organization settings retrieved successfully",
  "data": {
    "general": {
      "name": "Sample Organization",
      "displayName": "Sample Org",
      "email": "contact@sampleorg.com",
      "phone": "+1234567890",
      "website": "https://sampleorg.com",
      "taxId": "TAX123456",
      "address": "123 Main St, City, State 12345",
      "description": "A sample organization",
      "timezone": "UTC",
      "locale": "en",
      "currency": "USD"
    },
    "system": {
      "status": "active",
      "businessType": "saas",
      "industry": "technology",
      "companySize": "small",
      "foundedYear": 2020,
      "employeeCount": 25,
      "annualRevenue": 500000
    },
    "api": {
      "apiKey": "sk-...",
      "webhookUrl": "https://sampleorg.com/webhook",
      "rateLimit": 1000,
      "enableApiAccess": true,
      "enableWebhooks": true
    }
  }
}
```

### 5. Save Organization Settings
```http
PUT /organizations/{organizationId}/settings
```

**Request Body:**
```json
{
  "general": {
    "name": "Updated Organization Name",
    "displayName": "Updated Display Name",
    "email": "updated@example.com",
    "phone": "+1234567890",
    "website": "https://example.com",
    "taxId": "TAX123456",
    "address": "123 Main St, City, State 12345",
    "description": "Updated description",
    "timezone": "UTC",
    "locale": "en",
    "currency": "USD"
  },
  "system": {
    "status": "active",
    "businessType": "saas",
    "industry": "technology",
    "companySize": "medium",
    "foundedYear": 2020,
    "employeeCount": 50,
    "annualRevenue": 1000000
  },
  "api": {
    "webhookUrl": "https://example.com/webhook",
    "rateLimit": 2000,
    "enableApiAccess": true,
    "enableWebhooks": true
  }
}
```

**Validation Rules:**
- `general.name`: string, max 255 characters
- `general.email`: valid email address
- `general.website`: valid URL
- `general.phone`: string, max 20 characters
- `system.status`: one of: active, inactive, suspended
- `api.rateLimit`: integer, min 1, max 100000

**Response:**
```json
{
  "success": true,
  "message": "Organization settings saved successfully",
  "data": {
    "general": {...},
    "system": {...},
    "api": {...}
  }
}
```

### 6. Get Organization Users
```http
GET /organizations/{organizationId}/users
```

**Query Parameters:**
- `page` (optional): Page number for pagination
- `per_page` (optional): Items per page
- `search` (optional): Search term
- `role` (optional): Filter by role
- `status` (optional): Filter by status

**Response:**
```json
{
  "success": true,
  "message": "Organization users retrieved successfully",
  "data": {
    "data": [
      {
        "id": 1,
        "name": "John Doe",
        "email": "john@example.com",
        "role": "admin",
        "status": "active",
        "created_at": "2025-09-09T06:00:00.000000Z"
      }
    ],
    "current_page": 1,
    "last_page": 3,
    "per_page": 15,
    "total": 45
  }
}
```

### 7. Get Organization Analytics
```http
GET /organizations/{organizationId}/analytics
```

**Query Parameters:**
- `period` (optional): Time period (7d, 30d, 90d, 1y)
- `start_date` (optional): Start date (YYYY-MM-DD)
- `end_date` (optional): End date (YYYY-MM-DD)

**Response:**
```json
{
  "success": true,
  "message": "Organization analytics retrieved successfully",
  "data": {
    "growth": {
      "users": 12.5,
      "conversations": 8.3,
      "revenue": 15.2
    },
    "trends": {
      "users": [...],
      "conversations": [...],
      "revenue": [...]
    },
    "metrics": {
      "totalUsers": 156,
      "activeUsers": 142,
      "totalConversations": 2341,
      "totalRevenue": 45600
    }
  }
}
```

### 8. Get Organization Roles
```http
GET /organizations/{organizationId}/roles
```

**Response:**
```json
{
  "success": true,
  "message": "Organization roles retrieved successfully",
  "data": [
    {
      "id": 1,
      "name": "Organization Admin",
      "description": "Full access to organization settings",
      "permissions": ["users.create", "users.read", "users.update", "users.delete"],
      "userCount": 2,
      "isSystem": true
    }
  ]
}
```

### 9. Save Role Permissions
```http
PUT /organizations/{organizationId}/roles/{roleId}/permissions
```

**Request Body:**
```json
{
  "permissions": ["users.create", "users.read", "users.update", "settings.read", "settings.update"]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Role permissions saved successfully",
  "data": {
    "roleId": 1,
    "permissions": ["users.create", "users.read", "users.update", "settings.read", "settings.update"]
  }
}
```

### 10. Test Webhook
```http
POST /organizations/{organizationId}/webhook/test
```

**Request Body:**
```json
{
  "webhookUrl": "https://example.com/webhook"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Webhook test completed",
  "data": {
    "url": "https://example.com/webhook",
    "response_time": 245,
    "status_code": 200,
    "response_body": "OK",
    "test_passed": true
  }
}
```

## Audit Log Endpoints

### 1. Get Audit Logs
```http
GET /organizations/{organizationId}/audit-logs
```

**Query Parameters:**
- `action` (optional): Filter by action type
- `resource_type` (optional): Filter by resource type
- `user_id` (optional): Filter by user ID
- `start_date` (optional): Start date filter
- `end_date` (optional): End date filter
- `limit` (optional): Number of records to return
- `offset` (optional): Number of records to skip

**Response:**
```json
{
  "success": true,
  "message": "Audit logs retrieved successfully",
  "data": [
    {
      "id": 1,
      "organization_id": 1,
      "user_id": 1,
      "action": "settings_updated",
      "resource_type": "organization_settings",
      "resource_id": 1,
      "old_values": {...},
      "new_values": {...},
      "ip_address": "192.168.1.1",
      "user_agent": "Mozilla/5.0...",
      "created_at": "2025-09-09T06:30:00.000000Z"
    }
  ]
}
```

### 2. Get Audit Log Statistics
```http
GET /organizations/{organizationId}/audit-logs/statistics
```

**Query Parameters:**
- `start_date` (optional): Start date filter
- `end_date` (optional): End date filter

**Response:**
```json
{
  "success": true,
  "message": "Audit log statistics retrieved successfully",
  "data": {
    "total_actions": 1250,
    "unique_users": 25,
    "unique_actions": 8,
    "unique_resource_types": 5,
    "action_breakdown": [
      {"action": "settings_updated", "count": 450},
      {"action": "user_added", "count": 200}
    ],
    "resource_type_breakdown": [
      {"resource_type": "organization", "count": 600},
      {"resource_type": "user", "count": 300}
    ]
  }
}
```

### 3. Get Specific Audit Log
```http
GET /organizations/{organizationId}/audit-logs/{auditLogId}
```

**Response:**
```json
{
  "success": true,
  "message": "Audit log retrieved successfully",
  "data": {
    "id": 1,
    "organization_id": 1,
    "user_id": 1,
    "action": "settings_updated",
    "resource_type": "organization_settings",
    "resource_id": 1,
    "old_values": {...},
    "new_values": {...},
    "ip_address": "192.168.1.1",
    "user_agent": "Mozilla/5.0...",
    "metadata": {...},
    "created_at": "2025-09-09T06:30:00.000000Z",
    "user": {...},
    "organization": {...}
  }
}
```

## Notification Endpoints

### 1. Get Notifications
```http
GET /organizations/{organizationId}/notifications
```

**Query Parameters:**
- `per_page` (optional): Items per page

**Response:**
```json
{
  "success": true,
  "message": "Notifications retrieved successfully",
  "data": {
    "data": [
      {
        "id": 1,
        "type": "App\\Notifications\\OrganizationNotification",
        "notifiable_type": "App\\Models\\User",
        "notifiable_id": 1,
        "data": {
          "organization_id": 1,
          "notification_type": "settings_updated",
          "title": "Settings Updated",
          "message": "Organization settings have been updated",
          "priority": "normal"
        },
        "read_at": null,
        "created_at": "2025-09-09T06:30:00.000000Z"
      }
    ],
    "current_page": 1,
    "last_page": 2,
    "per_page": 20,
    "total": 35
  }
}
```

### 2. Send Notification
```http
POST /organizations/{organizationId}/notifications
```

**Request Body:**
```json
{
  "type": "organization_update",
  "title": "Organization Update",
  "message": "Your organization has been updated",
  "priority": "normal",
  "data": {
    "update_type": "settings",
    "updated_by": "admin"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Notification sent successfully",
  "data": {
    "organization_id": 1,
    "users_notified": 25,
    "notification_type": "organization_update"
  }
}
```

### 3. Mark Notification as Read
```http
PATCH /organizations/{organizationId}/notifications/{notificationId}/read
```

**Response:**
```json
{
  "success": true,
  "message": "Notification marked as read",
  "data": {
    "notification_id": 1
  }
}
```

### 4. Mark All Notifications as Read
```http
PATCH /organizations/{organizationId}/notifications/read-all
```

**Response:**
```json
{
  "success": true,
  "message": "All notifications marked as read",
  "data": {
    "updated_count": 15
  }
}
```

### 5. Delete Notification
```http
DELETE /organizations/{organizationId}/notifications/{notificationId}
```

**Response:**
```json
{
  "success": true,
  "message": "Notification deleted successfully",
  "data": {
    "notification_id": 1
  }
}
```

## Superadmin Endpoints

### 1. Login as Admin
```http
POST /superadmin/login-as-admin
```

**Request Body:**
```json
{
  "organization_id": 1,
  "organization_name": "Sample Organization"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Admin token generated successfully",
  "data": {
    "token": "admin_1_abc123_1694246400",
    "organization_id": 1,
    "organization_name": "Sample Organization",
    "expires_at": "2025-09-09T07:30:00.000000Z"
  }
}
```

### 2. Force Password Reset
```http
POST /superadmin/force-password-reset
```

**Request Body:**
```json
{
  "organization_id": 1,
  "email": "user@example.com",
  "organization_name": "Sample Organization"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset email sent successfully",
  "data": {
    "email": "user@example.com",
    "organizationName": "Sample Organization",
    "resetUrl": "https://frontend.com/reset-password?token=...",
    "expiresAt": "2025-09-09T07:30:00.000000Z"
  }
}
```

## Error Responses

### Standard Error Format
```json
{
  "success": false,
  "message": "Error message",
  "error_code": "ERROR_CODE",
  "errors": {
    "field_name": ["Validation error message"]
  }
}
```

### Common HTTP Status Codes
- `200`: Success
- `201`: Created
- `400`: Bad Request (validation errors)
- `401`: Unauthorized
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found
- `422`: Unprocessable Entity (validation failed)
- `500`: Internal Server Error

## Rate Limiting
- API calls are rate limited to prevent abuse
- Standard rate limit: 1000 requests per hour per organization
- Webhook testing: 20 requests per minute

## Webhooks
Organizations can configure webhooks to receive real-time notifications about events:
- Settings updates
- User additions/removals
- Role changes
- Status changes

Webhook payload format:
```json
{
  "event": "organization.settings_updated",
  "organization_id": 1,
  "data": {
    "updated_fields": ["name", "email"],
    "updated_by": 1,
    "timestamp": "2025-09-09T06:30:00.000000Z"
  }
}
```

## Security Features
- JWT-based authentication
- Role-based access control (RBAC)
- IP whitelisting support
- Audit logging for all operations
- Secure token generation for admin access
- Input validation and sanitization
- Rate limiting and throttling

## Real-time Features
- WebSocket support for real-time notifications
- Event broadcasting for organization activities
- Live analytics updates
- Real-time audit log streaming

This API provides a comprehensive solution for organization management with enterprise-grade security, monitoring, and real-time capabilities.
