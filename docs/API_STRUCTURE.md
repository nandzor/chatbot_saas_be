# 🚀 API Structure Documentation

## 📋 **Overview**
Dokumentasi ini menjelaskan struktur API yang sudah robust dan best practice untuk sistem SaaS chatbot.

## 🏗️ **Architecture Pattern**

### **1. Base Controllers**
```
BaseController (Laravel Standard)
├── BaseApiController (Enhanced API Features)
    ├── UserController
    ├── RoleManagementController
    ├── PermissionManagementController
    └── OrganizationManagementController
```

### **2. Route Structure**
```
/api/v1/*          ← Management APIs (ROBUST)
/api/admin/*       ← Admin-only Features
/api/auth/*        ← Authentication
```

## 🔐 **Permission System**

### **Middleware Stack**
```php
Route::middleware([
    'unified.auth',           // Authentication
    'permission:users.view',  // Permission check
    'organization'            // Organization access
])->group(function () {
    // Protected routes
});
```

### **Permission Patterns**
- **Single**: `permission:users.view`
- **Multiple AND**: `permission:users.view,users.create`
- **Multiple OR**: `permission:users.view|users.create`
- **Wildcard**: `permission:users.*`

## 📡 **API Endpoints**

### **User Management** (`/api/v1/users`)
| Method | Endpoint | Permission | Description |
|--------|----------|------------|-------------|
| GET | `/` | `users.view` | List users with pagination |
| POST | `/` | `users.create` | Create new user |
| GET | `/{id}` | `users.view` | Get user details |
| PUT | `/{id}` | `users.update` | Update user |
| DELETE | `/{id}` | `users.delete` | Delete user |
| PATCH | `/{id}/toggle-status` | `users.update` | Toggle user status |
| GET | `/statistics` | `users.view` | Get user statistics |
| GET | `/search` | `users.view` | Search users |
| PATCH | `/bulk-update` | `users.bulk_update` | Bulk update users |
| PATCH | `/{id}/restore` | `users.restore` | Restore deleted user |

### **Role Management** (`/api/v1/roles`)
| Method | Endpoint | Permission | Description |
|--------|----------|------------|-------------|
| GET | `/` | `roles.view` | List roles with pagination |
| POST | `/` | `roles.create` | Create new role |
| GET | `/{id}` | `roles.view` | Get role details |
| PUT | `/{id}` | `roles.update` | Update role |
| DELETE | `/{id}` | `roles.delete` | Delete role |
| GET | `/available` | `roles.view` | Get available roles |
| GET | `/{id}/users` | `roles.view` | Get users in role |
| POST | `/assign` | `roles.assign` | Assign role to user |
| POST | `/revoke` | `roles.revoke` | Revoke role from user |
| GET | `/statistics` | `roles.view` | Get role statistics |

### **Permission Management** (`/api/v1/permissions`)
| Method | Endpoint | Permission | Description |
|--------|----------|------------|-------------|
| GET | `/` | `permissions.view` | List permissions |
| POST | `/` | `permissions.create` | Create new permission |
| GET | `/{id}` | `permissions.view` | Get permission details |
| PUT | `/{id}` | `permissions.update` | Update permission |
| DELETE | `/{id}` | `permissions.delete` | Delete permission |
| GET | `/groups` | `permissions.view` | Get permission groups |
| POST | `/groups` | `permissions.manage_groups` | Create permission group |
| GET | `/roles/{roleId}/permissions` | `permissions.view` | Get role permissions |
| POST | `/roles/{roleId}/permissions` | `permissions.assign` | Assign permissions to role |
| DELETE | `/roles/{roleId}/permissions` | `permissions.revoke` | Remove permissions from role |
| GET | `/users/permissions` | `permissions.view` | Get user permissions |
| POST | `/users/check-permission` | `permissions.check` | Check user permission |

### **Organization Management** (`/api/v1/organizations`)
| Method | Endpoint | Permission | Description |
|--------|----------|------------|-------------|
| GET | `/` | `organizations.view` | List organizations |
| POST | `/` | `organizations.create` | Create new organization |
| GET | `/{id}` | `organizations.view` | Get organization details |
| PUT | `/{id}` | `organizations.update` | Update organization |
| DELETE | `/{id}` | `organizations.delete` | Delete organization |
| GET | `/statistics` | `organizations.view` | Get organization statistics |
| GET | `/{id}/users` | `organizations.view` | Get organization users |
| POST | `/{id}/users` | `organizations.add_user` | Add user to organization |
| DELETE | `/{id}/users/{userId}` | `organizations.remove_user` | Remove user from organization |

## 🔧 **Admin Features** (`/api/admin/*`)

### **Dashboard & Monitoring**
- `/dashboard/overview` - System overview
- `/dashboard/logs` - System logs
- `/analytics/performance` - System performance
- `/analytics/user-activity` - User activity patterns

### **System Maintenance**
- `/maintenance/clear-cache` - Clear all caches
- `/maintenance/backup` - System backup
- `/maintenance/optimize-db` - Database optimization

## 📊 **Response Format**

### **Success Response**
```json
{
    "success": true,
    "message": "Operation successful",
    "data": {...},
    "timestamp": "2024-01-01T00:00:00Z",
    "meta": {
        "pagination": {...}
    }
}
```

### **Error Response**
```json
{
    "success": false,
    "message": "Error message",
    "detail": "Detailed error information",
    "timestamp": "2024-01-01T00:00:00Z",
    "errors": {...}
}
```

### **Pagination Response**
```json
{
    "success": true,
    "message": "Data retrieved successfully",
    "data": [...],
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

## 🛡️ **Security Features**

### **Authentication**
- JWT + Sanctum unified authentication
- Token refresh mechanism
- Session management

### **Authorization**
- Role-based access control (RBAC)
- Granular permissions
- Organization-level access control
- Middleware-based permission checking

### **Input Validation**
- Laravel Form Request validation
- Input sanitization
- SQL injection prevention
- XSS protection

## 📈 **Performance Features**

### **Database Optimization**
- Efficient queries with proper indexing
- Pagination for large datasets
- Eager loading for relationships
- Query optimization

### **Caching Strategy**
- Route caching
- Configuration caching
- Query result caching
- Permission caching

## 🧪 **Testing Strategy**

### **Unit Tests**
- Controller method testing
- Service layer testing
- Permission logic testing
- Validation testing

### **Feature Tests**
- API endpoint testing
- Middleware testing
- Permission system testing
- Integration testing

## 📝 **Best Practices**

### **Code Quality**
- PSR-12 coding standards
- Consistent naming conventions
- Proper error handling
- Comprehensive logging

### **API Design**
- RESTful principles
- Consistent response formats
- Proper HTTP status codes
- Comprehensive error messages

### **Security**
- Input validation
- Permission checking
- Rate limiting
- Audit logging

## 🔄 **Migration Guide**

### **From Old System**
1. Update frontend to use `/api/v1/*` endpoints
2. Remove references to `/api/admin/*` management routes
3. Update permission checks to use new middleware
4. Test all endpoints thoroughly

### **Backward Compatibility**
- Redirect routes for old endpoints
- Deprecation warnings
- Migration documentation

## 📚 **Additional Resources**

- [Laravel Documentation](https://laravel.com/docs)
- [API Design Guidelines](https://github.com/microsoft/api-guidelines)
- [REST API Best Practices](https://restfulapi.net/)
- [Security Best Practices](https://owasp.org/www-project-api-security/)
