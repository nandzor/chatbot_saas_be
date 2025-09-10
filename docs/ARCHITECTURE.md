# 🏗️ Client Management & Organization Architecture

## 📋 Overview

Sistem ini menggunakan **Hybrid Architecture Pattern** dengan dua layer utama:

1. **Organization Layer** - Self-service untuk organization users
2. **Client Management Layer** - Platform administration untuk super admins

## 🎯 Architecture Principles

### 1. **Single Responsibility Principle**
- **OrganizationController**: Hybrid controller yang melayani kedua role
- **ClientManagementController**: Dedicated admin controller
- **OrganizationService**: Organization-specific operations
- **ClientManagementService**: Platform-wide operations

### 2. **Role-Based Access Control (RBAC)**
- **Super Admin**: Akses penuh ke semua fitur
- **Organization Admin**: Akses terbatas ke organisasi mereka
- **Organization Member**: Akses read-only ke organisasi mereka

### 3. **Service Layer Pattern**
- **OrganizationService**: Business logic untuk single organization
- **ClientManagementService**: Business logic untuk platform-wide operations

## 🔄 Controller Responsibilities

### OrganizationController (Hybrid)
```php
// Role Detection
if ($isAdmin) {
    // Use ClientManagementService for admin-level operations
    $result = $this->clientManagementService->getOrganizations($filters);
} else {
    // Use OrganizationService for organization-level operations
    $organizations = $this->organizationService->getAllOrganizations($request, $filters);
}
```

**Responsibilities:**
- ✅ Serve both super admin and organization users
- ✅ Route requests to appropriate service based on user role
- ✅ Provide unified API interface
- ✅ Handle organization-specific operations

### ClientManagementController (Dedicated Admin)
```php
// Always uses ClientManagementService
$result = $this->clientManagementService->getOrganizations($params);
```

**Responsibilities:**
- ✅ Serve super admin only
- ✅ Provide advanced admin features
- ✅ Handle bulk operations
- ✅ Platform-wide monitoring and analytics

## 🎭 User Access Patterns

### Super Admin Access
```php
// Via OrganizationController (Hybrid)
GET /api/v1/organizations/                    // All organizations
GET /api/v1/organizations/statistics          // Platform statistics
GET /api/v1/organizations/123/health          // Organization health

// Via ClientManagementController (Dedicated)
GET /api/admin/clients/                       // All organizations
GET /api/admin/clients/statistics             // Platform statistics
GET /api/admin/clients/123/health             // Organization health
```

### Organization User Access
```php
// Via OrganizationController (Hybrid)
GET /api/v1/organizations/                    // Own organization only
GET /api/v1/organizations/123/settings        // Own organization settings
GET /api/v1/organizations/123/users           // Own organization users
```

## 🔧 Service Layer Architecture

### OrganizationService
**Scope**: Single organization operations
```php
// Organization-specific methods
- getOrganizationById()
- updateOrganization()
- getOrganizationUsers()
- getOrganizationSettings()
- getOrganizationAnalytics()
```

### ClientManagementService
**Scope**: Platform-wide operations
```php
// Platform-wide methods
- getOrganizations()           // All organizations
- getStatistics()              // Platform statistics
- bulkAction()                 // Bulk operations
- exportOrganizations()        // Export all
- getOrganizationHealth()      // Health monitoring
```

## 🛣️ Route Architecture

### Organization Routes (`/api/v1/organizations/`)
- **Purpose**: Universal access (admin + organization users)
- **Middleware**: `permission:organizations.view`
- **Controller**: OrganizationController (Hybrid)

### Admin Routes (`/api/admin/clients/`)
- **Purpose**: Super admin only
- **Middleware**: `client.management`
- **Controller**: ClientManagementController (Dedicated)

## 🔐 Security Model

### Permission Matrix
| Feature | Super Admin | Org Admin | Org Member |
|---------|-------------|-----------|------------|
| View All Organizations | ✅ | ❌ | ❌ |
| View Own Organization | ✅ | ✅ | ✅ |
| Create Organization | ✅ | ❌ | ❌ |
| Update Own Organization | ✅ | ✅ | ❌ |
| Delete Organization | ✅ | ❌ | ❌ |
| Bulk Operations | ✅ | ❌ | ❌ |
| Platform Analytics | ✅ | ❌ | ❌ |

## 🎨 Benefits of This Architecture

### 1. **Flexibility**
- Single endpoint serves multiple user types
- Role-based service routing
- Unified API interface

### 2. **Maintainability**
- Clear separation of concerns
- Dedicated controllers for specific roles
- Service layer abstraction

### 3. **Scalability**
- Easy to add new features
- Service layer can be extended
- Clear boundaries between components

### 4. **Security**
- Role-based access control
- Service-level authorization
- Clear permission boundaries

## 🚀 Future Enhancements

### 1. **API Versioning**
- Separate API versions for different user types
- Backward compatibility
- Feature flags

### 2. **Microservices**
- Split services into separate microservices
- API Gateway for routing
- Service discovery

### 3. **Caching Strategy**
- Organization-level caching
- Platform-level caching
- Cache invalidation strategies

## 📊 Monitoring & Analytics

### Organization Level
- User activity within organization
- Organization-specific metrics
- Performance monitoring

### Platform Level
- Cross-organization analytics
- Platform health monitoring
- System-wide metrics
