# 🚀 API Endpoints Documentation

## 📋 Overview

This document provides comprehensive documentation for all API endpoints in the Client Management and Organization system.

## 🎯 Endpoint Categories

### 1. **Organization Endpoints** (`/api/v1/organizations/`)
**Purpose**: Universal access for both super admin and organization users
**Controller**: `OrganizationController` (Hybrid)

### 2. **Client Management Endpoints** (`/api/admin/clients/`)
**Purpose**: Super admin only operations
**Controller**: `ClientManagementController` (Dedicated Admin)

---

## 🔄 Organization Endpoints (Hybrid)

### **Base URL**: `/api/v1/organizations/`

| Method | Endpoint | Description | Super Admin | Org Users |
|--------|----------|-------------|-------------|-----------|
| GET | `/` | List organizations | ✅ All orgs | ✅ Own org only |
| GET | `/active` | List active organizations | ✅ All active | ✅ Own if active |
| GET | `/trial` | List trial organizations | ✅ All trial | ✅ Own if trial |
| GET | `/expired-trial` | List expired trial orgs | ✅ All expired | ✅ Own if expired |
| GET | `/business-type/{type}` | List by business type | ✅ All by type | ✅ Own if matches |
| GET | `/industry/{industry}` | List by industry | ✅ All by industry | ✅ Own if matches |
| GET | `/company-size/{size}` | List by company size | ✅ All by size | ✅ Own if matches |
| GET | `/code/{code}` | Get by organization code | ✅ Any org | ✅ Own org only |
| GET | `/statistics` | Get statistics | ✅ Platform stats | ✅ Org stats |
| GET | `/search` | Search organizations | ✅ All orgs | ✅ Own org only |
| GET | `/analytics` | Get analytics | ✅ Platform analytics | ✅ Org analytics |
| GET | `/export` | Export organizations | ✅ All orgs | ✅ Own org only |
| GET | `/deleted` | List deleted orgs | ✅ All deleted | ❌ Restricted |
| POST | `/bulk-action` | Bulk operations | ✅ All orgs | ❌ Restricted |
| POST | `/import` | Import organizations | ✅ All orgs | ❌ Restricted |
| POST | `/` | Create organization | ✅ Any org | ❌ Restricted |

### **Individual Organization Endpoints**

| Method | Endpoint | Description | Super Admin | Org Users |
|--------|----------|-------------|-------------|-----------|
| GET | `/{id}` | Get organization details | ✅ Any org | ✅ Own org only |
| PUT | `/{id}` | Update organization | ✅ Any org | ✅ Own org only |
| DELETE | `/{id}` | Delete organization | ✅ Any org | ❌ Restricted |
| GET | `/{id}/users` | Get organization users | ✅ Any org | ✅ Own org only |
| POST | `/{id}/users` | Add user to org | ✅ Any org | ✅ Own org only |
| DELETE | `/{id}/users/{userId}` | Remove user from org | ✅ Any org | ✅ Own org only |
| PATCH | `/{id}/subscription` | Update subscription | ✅ Any org | ✅ Own org only |
| GET | `/{id}/activity-logs` | Get activity logs | ✅ Any org | ✅ Own org only |
| PATCH | `/{id}/status` | Update status | ✅ Any org | ❌ Restricted |
| GET | `/{id}/settings` | Get settings | ✅ Any org | ✅ Own org only |
| PUT | `/{id}/settings` | Save settings | ✅ Any org | ✅ Own org only |
| POST | `/{id}/webhook/test` | Test webhook | ✅ Any org | ✅ Own org only |
| GET | `/{id}/analytics` | Get analytics | ✅ Any org | ✅ Own org only |
| GET | `/{id}/roles` | Get roles | ✅ Any org | ✅ Own org only |
| PUT | `/{id}/roles/{roleId}/permissions` | Save role permissions | ✅ Any org | ✅ Own org only |
| PUT | `/{id}/permissions` | Save all permissions | ✅ Any org | ✅ Own org only |
| GET | `/{id}/health` | Get health status | ✅ Any org | ✅ Own org only |
| GET | `/{id}/metrics` | Get metrics | ✅ Any org | ✅ Own org only |
| POST | `/{id}/restore` | Restore deleted org | ✅ Any org | ❌ Restricted |

---

## 👑 Client Management Endpoints (Admin Only)

### **Base URL**: `/api/admin/clients/`

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/` | List all organizations | Super Admin |
| GET | `/search` | Search all organizations | Super Admin |
| GET | `/statistics` | Platform statistics | Super Admin |
| GET | `/deleted` | List deleted organizations | Super Admin |
| GET | `/export` | Export all organizations | Super Admin |
| POST | `/import` | Import organizations | Super Admin |
| POST | `/bulk-action` | Bulk operations | Super Admin |
| POST | `/clear-cache` | Clear all caches | Super Admin |

### **Individual Organization Management**

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/{id}` | Get organization details | Super Admin |
| POST | `/` | Create organization | Super Admin |
| PUT | `/{id}` | Update organization | Super Admin |
| DELETE | `/{id}` | Delete organization | Super Admin |
| DELETE | `/{id}/soft` | Soft delete organization | Super Admin |
| POST | `/{id}/restore` | Restore organization | Super Admin |
| PATCH | `/{id}/status` | Update status | Super Admin |
| GET | `/{id}/health` | Get health status | Super Admin |
| GET | `/{id}/analytics` | Get analytics | Super Admin |
| GET | `/{id}/metrics` | Get metrics | Super Admin |
| GET | `/{id}/users` | Get users | Super Admin |
| GET | `/{id}/activity-logs` | Get activity logs | Super Admin |
| POST | `/{id}/clear-cache` | Clear organization cache | Super Admin |

---

## 🔐 Access Control Matrix

### **Super Admin Access**
- ✅ **Full Platform Access**: All organizations, all features
- ✅ **Admin Operations**: Create, update, delete any organization
- ✅ **Bulk Operations**: Mass operations across organizations
- ✅ **Platform Analytics**: System-wide statistics and monitoring
- ✅ **Advanced Features**: Health monitoring, metrics, cache management

### **Organization Admin Access**
- ✅ **Own Organization**: Full access to their organization
- ✅ **User Management**: Add/remove users within their organization
- ✅ **Settings Management**: Configure organization settings
- ✅ **Analytics**: View organization-specific analytics
- ❌ **Other Organizations**: Cannot access other organizations
- ❌ **Admin Operations**: Cannot create/delete organizations
- ❌ **Bulk Operations**: Cannot perform mass operations

### **Organization Member Access**
- ✅ **Read Access**: View organization information
- ✅ **Limited Analytics**: Basic organization metrics
- ❌ **Write Operations**: Cannot modify organization data
- ❌ **User Management**: Cannot manage users
- ❌ **Settings**: Cannot modify settings

---

## 📊 Response Examples

### **Super Admin Response**
```json
{
  "success": true,
  "message": "Daftar organisasi berhasil diambil (Admin View)",
  "data": {
    "organizations": [...],
    "pagination": {...},
    "filters": {...}
  }
}
```

### **Organization User Response**
```json
{
  "success": true,
  "message": "Daftar organisasi berhasil diambil",
  "data": {
    "organizations": [...],
    "pagination": {...}
  }
}
```

---

## 🛡️ Security Considerations

### **Authentication**
- All endpoints require authentication
- JWT token validation
- Session management

### **Authorization**
- Role-based access control (RBAC)
- Permission-based restrictions
- Organization-scoped access

### **Rate Limiting**
- API rate limiting per user
- Bulk operation restrictions
- Export/import limits

### **Data Validation**
- Request validation
- Input sanitization
- SQL injection prevention

---

## 🔧 Error Handling

### **Common Error Responses**
```json
{
  "success": false,
  "message": "Error message",
  "errors": {
    "field": ["Validation error"]
  },
  "status_code": 400
}
```

### **Error Codes**
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `422`: Validation Error
- `500`: Internal Server Error

---

## 📈 Performance Considerations

### **Caching Strategy**
- Organization data caching
- Statistics caching
- Query result caching

### **Pagination**
- Default page size: 15
- Maximum page size: 100
- Cursor-based pagination

### **Filtering**
- Database-level filtering
- Index optimization
- Query performance monitoring

---

## 🚀 Future Enhancements

### **API Versioning**
- Version 2.0 planning
- Backward compatibility
- Feature deprecation

### **GraphQL Support**
- Query optimization
- Real-time subscriptions
- Schema federation

### **Webhook Integration**
- Event-driven architecture
- Real-time notifications
- Third-party integrations
