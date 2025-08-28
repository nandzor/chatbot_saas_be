# Subscription Plans API Documentation

## Overview

Subscription Plans API memungkinkan manajemen paket berlangganan untuk platform SaaS chatbot. API ini mendukung operasi CRUD lengkap dengan fitur tambahan seperti pengelolaan popularitas, pengurutan, dan statistik.

## Base URL

```
https://api.example.com/api/v1/subscription-plans
```

## Authentication

Semua endpoint memerlukan autentikasi menggunakan JWT token atau Sanctum token.

**Header:**
```
Authorization: Bearer <token>
```

## Endpoints

### 1. Get All Subscription Plans

**GET** `/api/v1/subscription-plans`

Mengambil daftar semua paket berlangganan dengan opsi filter dan pagination.

**Query Parameters:**
- `tier` (string, optional): Filter berdasarkan tier (basic, professional, enterprise, custom)
- `is_popular` (boolean, optional): Filter berdasarkan status populer
- `is_custom` (boolean, optional): Filter berdasarkan status kustom
- `status` (string, optional): Filter berdasarkan status (active, inactive, draft)
- `per_page` (integer, optional): Jumlah item per halaman (default: 15, max: 100)

**Response:**
```json
{
    "success": true,
    "message": "Daftar paket berlangganan berhasil diambil",
    "data": [
        {
            "id": "uuid",
            "name": "basic",
            "display_name": "Basic Plan",
            "description": "Paket dasar untuk bisnis kecil",
            "tier": "basic",
            "pricing": {
                "monthly": {
                    "price": 29.99,
                    "currency": "USD"
                },
                "quarterly": {
                    "price": 79.99,
                    "currency": "USD"
                },
                "yearly": {
                    "price": 299.99,
                    "currency": "USD"
                }
            },
            "limits": {
                "max_agents": 2,
                "max_channels": 3,
                "max_knowledge_articles": 100,
                "max_monthly_messages": 1000,
                "max_monthly_ai_requests": 500,
                "max_storage_gb": 5,
                "max_api_calls_per_day": 1000
            },
            "features": {
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
            "trial_days": 14,
            "is_popular": false,
            "is_custom": false,
            "sort_order": 1,
            "status": "active",
            "created_at": "2024-01-01T00:00:00.000000Z",
            "updated_at": "2024-01-01T00:00:00.000000Z"
        }
    ],
    "meta": {
        "total": 1,
        "tiers": {
            "basic": 1
        },
        "popular_count": 0,
        "custom_count": 0,
        "active_count": 1
    }
}
```

### 2. Get Popular Plans

**GET** `/api/v1/subscription-plans/popular`

Mengambil daftar paket berlangganan yang ditandai sebagai populer.

**Response:**
```json
{
    "success": true,
    "message": "Daftar paket populer berhasil diambil",
    "data": [...]
}
```

### 3. Get Plans by Tier

**GET** `/api/v1/subscription-plans/tier/{tier}`

Mengambil daftar paket berlangganan berdasarkan tier tertentu.

**Path Parameters:**
- `tier` (string, required): Tier paket (basic, professional, enterprise, custom)

**Response:**
```json
{
    "success": true,
    "message": "Daftar paket tier basic berhasil diambil",
    "data": [...]
}
```

### 4. Get Custom Plans

**GET** `/api/v1/subscription-plans/custom`

Mengambil daftar paket berlangganan kustom.

**Response:**
```json
{
    "success": true,
    "message": "Daftar paket kustom berhasil diambil",
    "data": [...]
}
```

### 5. Get Single Plan

**GET** `/api/v1/subscription-plans/{id}`

Mengambil detail paket berlangganan berdasarkan ID.

**Path Parameters:**
- `id` (string, required): ID paket berlangganan

**Response:**
```json
{
    "success": true,
    "message": "Detail paket berlangganan berhasil diambil",
    "data": {
        "id": "uuid",
        "name": "basic",
        "display_name": "Basic Plan",
        // ... same structure as list response
    }
}
```

### 6. Create Plan

**POST** `/api/v1/subscription-plans`

Membuat paket berlangganan baru.

**Required Permissions:** `subscription_plans.create`

**Request Body:**
```json
{
    "name": "premium-plan",
    "display_name": "Premium Plan",
    "description": "Paket premium untuk bisnis menengah",
    "tier": "professional",
    "price_monthly": 99.99,
    "price_quarterly": 269.99,
    "price_yearly": 999.99,
    "currency": "USD",
    "max_agents": 10,
    "max_channels": 10,
    "max_knowledge_articles": 1000,
    "max_monthly_messages": 10000,
    "max_monthly_ai_requests": 5000,
    "max_storage_gb": 50,
    "max_api_calls_per_day": 10000,
    "features": {
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
    "trial_days": 30,
    "is_popular": false,
    "is_custom": false,
    "status": "active"
}
```

**Validation Rules:**
- `name`: required, string, max 100 chars, unique
- `display_name`: required, string, max 255 chars
- `description`: optional, string, max 1000 chars
- `tier`: required, in: basic, professional, enterprise, custom
- `price_monthly`: required, numeric, min 0, max 999999.99
- `price_quarterly`: optional, numeric, min 0, max 999999.99
- `price_yearly`: optional, numeric, min 0, max 999999.99
- `currency`: required, size 3, in: USD, IDR, EUR, GBP
- `max_agents`: required, integer, min 1, max 1000
- `max_channels`: required, integer, min 1, max 100
- `max_knowledge_articles`: required, integer, min 0, max 10000
- `max_monthly_messages`: required, integer, min 0, max 1000000
- `max_monthly_ai_requests`: required, integer, min 0, max 1000000
- `max_storage_gb`: required, integer, min 1, max 10000
- `max_api_calls_per_day`: required, integer, min 0, max 1000000
- `features`: optional, array
- `trial_days`: optional, integer, min 0, max 365
- `is_popular`: optional, boolean
- `is_custom`: optional, boolean
- `status`: optional, in: active, inactive, draft

**Response:**
```json
{
    "success": true,
    "message": "Paket berlangganan berhasil dibuat",
    "data": {
        "id": "uuid",
        "name": "premium-plan",
        // ... complete plan data
    }
}
```

### 7. Update Plan

**PUT** `/api/v1/subscription-plans/{id}`

Memperbarui paket berlangganan yang ada.

**Required Permissions:** `subscription_plans.update`

**Path Parameters:**
- `id` (string, required): ID paket berlangganan

**Request Body:** Same as create, but all fields are optional

**Response:**
```json
{
    "success": true,
    "message": "Paket berlangganan berhasil diperbarui",
    "data": {
        "id": "uuid",
        // ... updated plan data
    }
}
```

### 8. Delete Plan

**DELETE** `/api/v1/subscription-plans/{id}`

Menghapus paket berlangganan.

**Required Permissions:** `subscription_plans.delete`

**Path Parameters:**
- `id` (string, required): ID paket berlangganan

**Response:**
```json
{
    "success": true,
    "message": "Paket berlangganan berhasil dihapus"
}
```

### 9. Toggle Plan Popularity

**PATCH** `/api/v1/subscription-plans/{id}/toggle-popular`

Mengubah status populer paket berlangganan.

**Required Permissions:** `subscription_plans.update`

**Path Parameters:**
- `id` (string, required): ID paket berlangganan

**Response:**
```json
{
    "success": true,
    "message": "Paket berlangganan berhasil ditandai sebagai populer",
    "data": {
        "id": "uuid",
        "is_popular": true,
        // ... complete plan data
    }
}
```

### 10. Update Sort Order

**PATCH** `/api/v1/subscription-plans/sort-order`

Memperbarui urutan paket berlangganan.

**Required Permissions:** `subscription_plans.update`

**Request Body:**
```json
{
    "sort_data": [
        {
            "id": "plan-1-uuid",
            "sort_order": 1
        },
        {
            "id": "plan-2-uuid",
            "sort_order": 2
        }
    ]
}
```

**Response:**
```json
{
    "success": true,
    "message": "Urutan paket berlangganan berhasil diperbarui"
}
```

### 11. Get Statistics

**GET** `/api/v1/subscription-plans/statistics`

Mengambil statistik paket berlangganan.

**Response:**
```json
{
    "success": true,
    "message": "Statistik paket berlangganan berhasil diambil",
    "data": {
        "total_plans": 4,
        "active_plans": 3,
        "popular_plans": 1,
        "custom_plans": 1,
        "plans_by_tier": {
            "basic": 1,
            "professional": 1,
            "enterprise": 1,
            "custom": 1
        }
    }
}
```

## Error Responses

### Validation Error (422)
```json
{
    "success": false,
    "message": "The given data was invalid.",
    "errors": {
        "name": ["Nama paket berlangganan sudah ada."],
        "price_monthly": ["Harga bulanan tidak boleh negatif."]
    }
}
```

### Not Found Error (404)
```json
{
    "success": false,
    "message": "Paket berlangganan tidak ditemukan"
}
```

### Permission Error (403)
```json
{
    "success": false,
    "message": "You do not have permission to perform this action"
}
```

### Server Error (500)
```json
{
    "success": false,
    "message": "Gagal mengambil daftar paket berlangganan"
}
```

## Rate Limiting

- **Default:** 60 requests per minute per user
- **Create/Update/Delete:** 30 requests per minute per user

## Caching

- **Popular Plans:** Cached for 1 hour
- **Plan Lists:** Cached for 30 minutes
- **Individual Plans:** Cached for 15 minutes

## Notes

1. **Unlimited Values:** Untuk paket kustom, nilai -1 menandakan unlimited
2. **Features:** Semua fitur bersifat boolean (true/false)
3. **Pricing:** Harga dalam format decimal dengan 2 digit desimal
4. **Currency:** Mendukung USD, IDR, EUR, GBP
5. **Sort Order:** Digunakan untuk mengurutkan paket dalam UI
6. **Status:** active, inactive, draft
7. **Tiers:** basic, professional, enterprise, custom

## Examples

### Create Basic Plan
```bash
curl -X POST https://api.example.com/api/v1/subscription-plans \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "basic",
    "display_name": "Basic Plan",
    "tier": "basic",
    "price_monthly": 29.99,
    "currency": "USD",
    "max_agents": 2,
    "max_channels": 3,
    "max_knowledge_articles": 100,
    "max_monthly_messages": 1000,
    "max_monthly_ai_requests": 500,
    "max_storage_gb": 5,
    "max_api_calls_per_day": 1000
  }'
```

### Get Popular Plans
```bash
curl -X GET https://api.example.com/api/v1/subscription-plans/popular \
  -H "Authorization: Bearer <token>"
```

### Update Plan Price
```bash
curl -X PUT https://api.example.com/api/v1/subscription-plans/plan-uuid \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "price_monthly": 39.99
  }'
```
