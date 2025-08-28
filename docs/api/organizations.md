# Organizations API Documentation

## Overview

The Organizations API provides comprehensive management capabilities for organizations within the chatbot SaaS platform. This API supports multi-tenant architecture and includes features for organization management, user management, subscription handling, and analytics.

## Base URL

```
https://api.example.com/api/v1/organizations
```

## Authentication

All endpoints require authentication using Bearer token:

```
Authorization: Bearer <your-token>
```

## Endpoints

### 1. List All Organizations

**GET** `/api/v1/organizations`

Retrieve a paginated list of all organizations with optional filtering.

#### Query Parameters

| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| `page` | integer | Page number for pagination | 1 |
| `per_page` | integer | Number of items per page (max: 100) | 15 |
| `status` | string | Filter by status: `active`, `inactive`, `suspended` | - |
| `subscription_status` | string | Filter by subscription status: `trial`, `active`, `inactive`, `suspended`, `cancelled` | - |
| `business_type` | string | Filter by business type | - |
| `industry` | string | Filter by industry | - |
| `company_size` | string | Filter by company size | - |
| `has_active_subscription` | boolean | Filter organizations with active subscriptions | - |
| `sort_by` | string | Sort field: `name`, `created_at`, `updated_at` | `created_at` |
| `sort_order` | string | Sort order: `asc`, `desc` | `desc` |

#### Required Permissions

- `organizations.view`

#### Response

```json
{
  "success": true,
  "message": "Daftar organisasi berhasil diambil",
  "data": [
    {
      "id": "uuid",
      "org_code": "TECH001",
      "name": "TechCorp Indonesia",
      "display_name": "TechCorp ID",
      "email": "contact@techcorp.id",
      "phone": "+62-21-1234-5678",
      "address": "Jl. Sudirman No. 123, Jakarta Pusat",
      "business_type": "technology",
      "industry": "technology",
      "company_size": "51-200",
      "status": "active",
      "subscription_status": "active",
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    }
  ],
  "meta": {
    "total": 25,
    "business_types": {
      "technology": 10,
      "healthcare": 5,
      "finance": 3
    },
    "industries": {
      "technology": 12,
      "healthcare": 6,
      "finance": 4
    },
    "company_sizes": {
      "11-50": 8,
      "51-200": 12,
      "201-500": 5
    },
    "subscription_statuses": {
      "active": 18,
      "trial": 5,
      "inactive": 2
    },
    "active_organizations": 18,
    "trial_organizations": 5,
    "organizations_with_users": 20
  }
}
```

### 2. List Active Organizations

**GET** `/api/v1/organizations/active`

Retrieve all organizations with active subscriptions.

#### Required Permissions

- `organizations.view`

#### Response

```json
{
  "success": true,
  "message": "Daftar organisasi aktif berhasil diambil",
  "data": [
    {
      "id": "uuid",
      "org_code": "TECH001",
      "name": "TechCorp Indonesia",
      "status": "active",
      "subscription_status": "active"
    }
  ]
}
```

### 3. List Trial Organizations

**GET** `/api/v1/organizations/trial`

Retrieve all organizations currently in trial period.

#### Required Permissions

- `organizations.view`

#### Response

```json
{
  "success": true,
  "message": "Daftar organisasi dalam masa trial berhasil diambil",
  "data": [
    {
      "id": "uuid",
      "org_code": "STARTUP001",
      "name": "InnovateLab",
      "subscription_status": "trial"
    }
  ]
}
```

### 4. List Organizations by Business Type

**GET** `/api/v1/organizations/business-type/{businessType}`

Retrieve organizations filtered by business type.

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `businessType` | string | Business type: `startup`, `small_business`, `medium_business`, `large_enterprise`, `healthcare`, `financial`, etc. |

#### Required Permissions

- `organizations.view`

#### Response

```json
{
  "success": true,
  "message": "Daftar organisasi tipe bisnis startup berhasil diambil",
  "data": [
    {
      "id": "uuid",
      "org_code": "STARTUP001",
      "name": "InnovateLab",
      "business_type": "startup"
    }
  ]
}
```

### 5. List Organizations by Industry

**GET** `/api/v1/organizations/industry/{industry}`

Retrieve organizations filtered by industry.

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `industry` | string | Industry: `technology`, `healthcare`, `finance`, `education`, `retail`, etc. |

#### Required Permissions

- `organizations.view`

#### Response

```json
{
  "success": true,
  "message": "Daftar organisasi industri technology berhasil diambil",
  "data": [
    {
      "id": "uuid",
      "org_code": "TECH001",
      "name": "TechCorp Indonesia",
      "industry": "technology"
    }
  ]
}
```

### 6. Get Organization Details

**GET** `/api/v1/organizations/{id}`

Retrieve detailed information about a specific organization.

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Organization UUID |

#### Required Permissions

- `organizations.view`

#### Response

```json
{
  "success": true,
  "message": "Detail organisasi berhasil diambil",
  "data": {
    "id": "uuid",
    "org_code": "TECH001",
    "name": "TechCorp Indonesia",
    "display_name": "TechCorp ID",
    "email": "contact@techcorp.id",
    "phone": "+62-21-1234-5678",
    "address": "Jl. Sudirman No. 123, Jakarta Pusat",
    "logo_url": "https://example.com/logos/techcorp.png",
    "website": "https://techcorp.id",
    "tax_id": "12.345.678.9-123.456",
    "business_type": "technology",
    "industry": "technology",
    "company_size": "51-200",
    "timezone": "Asia/Jakarta",
    "locale": "id",
    "currency": "IDR",
    "subscription": {
      "plan": {
        "id": "uuid",
        "name": "professional",
        "display_name": "Professional Plan",
        "tier": "professional"
      },
      "status": "active",
      "trial_ends_at": null,
      "subscription_starts_at": "2024-01-01T00:00:00Z",
      "subscription_ends_at": "2024-12-31T23:59:59Z",
      "billing_cycle": "monthly",
      "is_active": true,
      "is_in_trial": false,
      "has_trial_expired": false
    },
    "usage": {
      "current": {
        "agents": 5,
        "channels": 3,
        "knowledge_articles": 150,
        "monthly_messages": 2500,
        "monthly_ai_requests": 1200,
        "storage_gb": 8,
        "api_calls_today": 150
      },
      "limits": {
        "max_agents": 10,
        "max_channels": 10,
        "max_knowledge_articles": 1000,
        "max_monthly_messages": 10000,
        "max_monthly_ai_requests": 5000,
        "max_storage_gb": 50,
        "max_api_calls_per_day": 10000
      }
    },
    "configuration": {
      "theme": {
        "primary_color": "#2563eb",
        "secondary_color": "#64748b",
        "logo_position": "left"
      },
      "branding": {
        "company_name": "TechCorp Indonesia",
        "slogan": "Innovating for Tomorrow",
        "custom_domain": "chat.techcorp.id"
      },
      "feature_flags": {
        "ai_chat": true,
        "knowledge_base": true,
        "multi_channel": true,
        "api_access": true,
        "analytics": true,
        "custom_branding": true,
        "priority_support": false,
        "white_label": false,
        "advanced_analytics": false,
        "custom_integrations": false
      },
      "ui_preferences": {
        "language": "id",
        "theme": "light",
        "notifications": true
      },
      "business_hours": {
        "monday": ["09:00", "17:00"],
        "tuesday": ["09:00", "17:00"],
        "wednesday": ["09:00", "17:00"],
        "thursday": ["09:00", "17:00"],
        "friday": ["09:00", "17:00"],
        "saturday": ["09:00", "12:00"],
        "sunday": []
      },
      "contact_info": {
        "primary_contact": {
          "name": "Budi Santoso",
          "email": "budi@techcorp.id",
          "phone": "+62-812-3456-7890"
        },
        "support_email": "support@techcorp.id",
        "sales_email": "sales@techcorp.id"
      },
      "social_media": {
        "linkedin": "https://linkedin.com/company/techcorp-id",
        "twitter": "https://twitter.com/techcorp_id",
        "facebook": "https://facebook.com/techcorp.id"
      },
      "security_settings": {
        "two_factor_required": true,
        "session_timeout": 3600,
        "ip_whitelist": [],
        "password_policy": "strong"
      },
      "settings": {
        "auto_backup": true,
        "backup_frequency": "daily",
        "retention_days": 30
      }
    },
    "api": {
      "enabled": true,
      "webhook_url": "https://techcorp.id/webhooks/chatbot",
      "webhook_secret": "techcorp_webhook_secret_123"
    },
    "users": [
      {
        "id": "uuid",
        "email": "user@techcorp.id",
        "full_name": "John Doe",
        "username": "johndoe",
        "role": "admin",
        "status": "active",
        "created_at": "2024-01-15T10:30:00Z"
      }
    ],
    "metadata": {
      "founded_year": 2020,
      "headquarters": "Jakarta, Indonesia",
      "employee_count": 150
    },
    "status": "active",
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  }
}
```

### 7. Get Organization by Code

**GET** `/api/v1/organizations/code/{orgCode}`

Retrieve organization details by organization code.

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `orgCode` | string | Organization code (e.g., "TECH001") |

#### Required Permissions

- `organizations.view`

#### Response

```json
{
  "success": true,
  "message": "Detail organisasi berhasil diambil",
  "data": {
    "id": "uuid",
    "org_code": "TECH001",
    "name": "TechCorp Indonesia",
    "email": "contact@techcorp.id"
  }
}
```

### 8. Create Organization

**POST** `/api/v1/organizations`

Create a new organization.

#### Required Permissions

- `organizations.create`

#### Request Body

```json
{
  "org_code": "TECH002",
  "name": "New Tech Company",
  "display_name": "NewTech",
  "email": "contact@newtech.com",
  "phone": "+62-21-9876-5432",
  "address": "Jl. Thamrin No. 456, Jakarta",
  "logo_url": "https://example.com/logos/newtech.png",
  "website": "https://newtech.com",
  "tax_id": "12.345.678.9-987.654",
  "business_type": "technology",
  "industry": "technology",
  "company_size": "11-50",
  "timezone": "Asia/Jakarta",
  "locale": "id",
  "currency": "IDR",
  "subscription_plan_id": "uuid",
  "subscription_status": "trial",
  "trial_ends_at": "2024-02-15T00:00:00Z",
  "billing_cycle": "monthly",
  "current_usage": {
    "agents": 0,
    "channels": 0,
    "knowledge_articles": 0,
    "monthly_messages": 0,
    "monthly_ai_requests": 0,
    "storage_gb": 0,
    "api_calls_today": 0
  },
  "theme_config": {
    "primary_color": "#3b82f6",
    "secondary_color": "#64748b",
    "logo_position": "left"
  },
  "branding_config": {
    "company_name": "New Tech Company",
    "slogan": "Building the Future",
    "custom_domain": null
  },
  "feature_flags": {
    "ai_chat": true,
    "knowledge_base": true,
    "multi_channel": true,
    "api_access": false,
    "analytics": false,
    "custom_branding": false,
    "priority_support": false,
    "white_label": false,
    "advanced_analytics": false,
    "custom_integrations": false
  },
  "ui_preferences": {
    "language": "id",
    "theme": "light",
    "notifications": true
  },
  "business_hours": {
    "monday": ["09:00", "17:00"],
    "tuesday": ["09:00", "17:00"],
    "wednesday": ["09:00", "17:00"],
    "thursday": ["09:00", "17:00"],
    "friday": ["09:00", "17:00"],
    "saturday": [],
    "sunday": []
  },
  "contact_info": {
    "primary_contact": {
      "name": "Jane Doe",
      "email": "jane@newtech.com",
      "phone": "+62-812-3456-7890"
    },
    "support_email": "support@newtech.com"
  },
  "social_media": {
    "linkedin": "https://linkedin.com/company/newtech",
    "twitter": "https://twitter.com/newtech"
  },
  "security_settings": {
    "two_factor_required": false,
    "session_timeout": 3600,
    "ip_whitelist": [],
    "password_policy": "medium"
  },
  "api_enabled": false,
  "webhook_url": null,
  "webhook_secret": null,
  "settings": {
    "auto_backup": false,
    "backup_frequency": "weekly",
    "retention_days": 7
  },
  "metadata": {
    "founded_year": 2024,
    "headquarters": "Jakarta, Indonesia",
    "employee_count": 25
  },
  "status": "active"
}
```

#### Validation Rules

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `org_code` | string | No | Unique, max 50 chars |
| `name` | string | Yes | Max 255 chars |
| `display_name` | string | No | Max 255 chars |
| `email` | string | Yes | Valid email, unique |
| `phone` | string | No | Max 20 chars |
| `address` | string | No | Max 500 chars |
| `logo_url` | string | No | Valid URL, max 500 chars |
| `website` | string | No | Valid URL, max 255 chars |
| `tax_id` | string | No | Max 50 chars |
| `business_type` | string | No | Enum values |
| `industry` | string | No | Enum values |
| `company_size` | string | No | Enum values |
| `timezone` | string | No | Max 50 chars |
| `locale` | string | No | 2 chars |
| `currency` | string | No | 3 chars, enum values |
| `subscription_plan_id` | string | No | Exists in subscription_plans |
| `subscription_status` | string | No | Enum values |
| `trial_ends_at` | date | No | After now |
| `billing_cycle` | string | No | Enum values |

#### Response

```json
{
  "success": true,
  "message": "Organisasi berhasil dibuat",
  "data": {
    "id": "uuid",
    "org_code": "TECH002",
    "name": "New Tech Company",
    "email": "contact@newtech.com",
    "business_type": "technology",
    "industry": "technology",
    "subscription_status": "trial"
  }
}
```

### 9. Update Organization

**PUT** `/api/v1/organizations/{id}`

Update an existing organization.

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Organization UUID |

#### Required Permissions

- `organizations.update`

#### Request Body

Same as create organization, but all fields are optional.

#### Response

```json
{
  "success": true,
  "message": "Organisasi berhasil diperbarui",
  "data": {
    "id": "uuid",
    "name": "Updated Tech Company",
    "display_name": "UpdatedTech",
    "phone": "+62-21-9876-5432",
    "business_type": "healthcare",
    "industry": "healthcare"
  }
}
```

### 10. Delete Organization

**DELETE** `/api/v1/organizations/{id}`

Delete an organization (soft delete).

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Organization UUID |

#### Required Permissions

- `organizations.delete`

#### Response

```json
{
  "success": true,
  "message": "Organisasi berhasil dihapus"
}
```

### 11. Get Organization Statistics

**GET** `/api/v1/organizations/statistics`

Retrieve comprehensive statistics about organizations.

#### Required Permissions

- `organizations.view`

#### Response

```json
{
  "success": true,
  "message": "Statistik organisasi berhasil diambil",
  "data": {
    "total_organizations": 25,
    "active_organizations": 18,
    "inactive_organizations": 5,
    "trial_organizations": 8,
    "expired_trial_organizations": 2,
    "organizations_with_users": 20,
    "organizations_without_users": 5,
    "business_type_stats": {
      "technology": 10,
      "healthcare": 5,
      "finance": 3,
      "startup": 4,
      "small_business": 3
    },
    "industry_stats": {
      "technology": 12,
      "healthcare": 6,
      "finance": 4,
      "education": 2,
      "retail": 1
    },
    "company_size_stats": {
      "1-10": 5,
      "11-50": 8,
      "51-200": 12,
      "201-500": 0
    },
    "subscription_status_stats": {
      "active": 18,
      "trial": 5,
      "inactive": 2,
      "suspended": 0
    }
  }
}
```

### 12. Get Organization Users

**GET** `/api/v1/organizations/{id}/users`

Retrieve all users belonging to an organization.

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Organization UUID |

#### Required Permissions

- `organizations.view`

#### Response

```json
{
  "success": true,
  "message": "Daftar pengguna organisasi berhasil diambil",
  "data": {
    "organization": {
      "id": "uuid",
      "name": "TechCorp Indonesia",
      "org_code": "TECH001"
    },
    "users": [
      {
        "id": "uuid",
        "email": "user@techcorp.id",
        "full_name": "John Doe",
        "username": "johndoe",
        "role": "admin",
        "status": "active",
        "created_at": "2024-01-15T10:30:00Z"
      }
    ],
    "total_users": 1
  }
}
```

### 13. Add User to Organization

**POST** `/api/v1/organizations/{id}/users`

Add a user to an organization.

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Organization UUID |

#### Required Permissions

- `organizations.manage_users`

#### Request Body

```json
{
  "user_id": "uuid",
  "role": "member"
}
```

#### Validation Rules

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `user_id` | string | Yes | Exists in users table |
| `role` | string | No | Enum: `admin`, `manager`, `member`, `viewer` |

#### Response

```json
{
  "success": true,
  "message": "Pengguna berhasil ditambahkan ke organisasi"
}
```

### 14. Remove User from Organization

**DELETE** `/api/v1/organizations/{id}/users/{userId}`

Remove a user from an organization.

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Organization UUID |
| `userId` | string | User UUID |

#### Required Permissions

- `organizations.manage_users`

#### Response

```json
{
  "success": true,
  "message": "Pengguna berhasil dihapus dari organisasi"
}
```

### 15. Update Organization Subscription

**PATCH** `/api/v1/organizations/{id}/subscription`

Update organization subscription details.

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Organization UUID |

#### Required Permissions

- `organizations.update`

#### Request Body

```json
{
  "subscription_plan_id": "uuid",
  "subscription_status": "active",
  "trial_ends_at": "2024-02-15T00:00:00Z",
  "subscription_starts_at": "2024-01-15T00:00:00Z",
  "subscription_ends_at": "2024-12-31T23:59:59Z",
  "billing_cycle": "monthly"
}
```

#### Validation Rules

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `subscription_plan_id` | string | No | Exists in subscription_plans |
| `subscription_status` | string | No | Enum values |
| `trial_ends_at` | date | No | After now |
| `subscription_starts_at` | date | No | Valid date |
| `subscription_ends_at` | date | No | After subscription_starts_at |
| `billing_cycle` | string | No | Enum: `monthly`, `quarterly`, `yearly` |

#### Response

```json
{
  "success": true,
  "message": "Berlangganan organisasi berhasil diperbarui",
  "data": {
    "id": "uuid",
    "subscription": {
      "status": "active",
      "is_active": true
    }
  }
}
```

## Error Responses

### 422 Validation Error

```json
{
  "success": false,
  "message": "The given data was invalid.",
  "errors": {
    "email": [
      "Email organisasi sudah terdaftar."
    ],
    "name": [
      "Nama organisasi wajib diisi."
    ]
  }
}
```

### 404 Not Found

```json
{
  "success": false,
  "message": "Organisasi tidak ditemukan"
}
```

### 403 Forbidden

```json
{
  "success": false,
  "message": "You do not have permission to perform this action."
}
```

### 500 Internal Server Error

```json
{
  "success": false,
  "message": "Gagal mengambil daftar organisasi"
}
```

## Rate Limiting

- **Standard endpoints**: 60 requests per minute
- **Statistics endpoint**: 10 requests per minute
- **Create/Update endpoints**: 30 requests per minute

## Caching

- Organization lists are cached for 30 minutes
- Organization details are cached for 15 minutes
- Statistics are cached for 1 hour
- Cache is automatically invalidated when organizations are created, updated, or deleted

## Notes

1. **Multi-tenancy**: All organizations are isolated and cannot access each other's data
2. **Soft Deletes**: Organizations are soft deleted and can be restored if needed
3. **Audit Trail**: All organization changes are logged for compliance
4. **Webhook Secrets**: Webhook secrets are only visible to users with `organizations.view_secrets` permission
5. **Trial Management**: Trial organizations automatically transition to inactive status when trial expires
6. **Usage Tracking**: Current usage is updated in real-time and affects feature availability

## Business Types

- `startup` - Startup companies
- `small_business` - Small businesses (1-50 employees)
- `medium_business` - Medium businesses (51-200 employees)
- `large_enterprise` - Large enterprises (200+ employees)
- `non_profit` - Non-profit organizations
- `government` - Government agencies
- `educational` - Educational institutions
- `healthcare` - Healthcare organizations
- `financial` - Financial institutions
- `retail` - Retail businesses
- `manufacturing` - Manufacturing companies
- `technology` - Technology companies
- `consulting` - Consulting firms
- `other` - Other business types

## Industries

- `technology` - Technology
- `healthcare` - Healthcare
- `finance` - Finance
- `education` - Education
- `retail` - Retail
- `manufacturing` - Manufacturing
- `consulting` - Consulting
- `non_profit` - Non-profit
- `government` - Government
- `media` - Media
- `real_estate` - Real Estate
- `transportation` - Transportation
- `energy` - Energy
- `agriculture` - Agriculture
- `other` - Other industries

## Company Sizes

- `1-10` - 1-10 employees
- `11-50` - 11-50 employees
- `51-200` - 51-200 employees
- `201-500` - 201-500 employees
- `501-1000` - 501-1000 employees
- `1001-5000` - 1001-5000 employees
- `5001-10000` - 5001-10000 employees
- `10000+` - 10000+ employees

## Subscription Statuses

- `trial` - In trial period
- `active` - Active subscription
- `inactive` - Inactive subscription
- `suspended` - Suspended subscription
- `cancelled` - Cancelled subscription

## Billing Cycles

- `monthly` - Monthly billing
- `quarterly` - Quarterly billing
- `yearly` - Yearly billing
