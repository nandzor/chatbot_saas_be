# 🔐 Permission Management Module

## 📋 Overview

The Permission Management Module is a comprehensive, enterprise-grade solution for managing user permissions, roles, and access control in the Chatbot SAAS application. Built following Laravel best practices, it provides granular permission control with caching, audit logging, and multi-tenant support.

## 🏗️ Architecture

### Core Components

```
Permission Management Module
├── Services
│   └── PermissionManagementService.php
├── Controllers
│   └── PermissionManagementController.php
├── Middleware
│   └── PermissionMiddleware.php
├── Requests (Validation)
│   ├── CreatePermissionRequest.php
│   ├── UpdatePermissionRequest.php
│   ├── CreatePermissionGroupRequest.php
│   └── AssignPermissionsRequest.php
├── Resources (API Responses)
│   ├── PermissionResource.php
│   ├── PermissionCollection.php
│   ├── PermissionGroupResource.php
│   └── PermissionGroupCollection.php
├── Exceptions
│   ├── InvalidPermissionException.php
│   └── PermissionDeniedException.php
└── Routes
    └── api/v1/permissions.php
```

## 🚀 Features

### ✅ Core Features
- **Granular Permission Control**: Resource-based permissions with actions and scopes
- **Role-Based Access Control (RBAC)**: Flexible role assignment and inheritance
- **Permission Groups**: Organized permission management with hierarchical grouping
- **Multi-Tenant Support**: Organization-scoped permissions and isolation
- **Caching System**: High-performance permission checks with configurable TTL
- **Audit Logging**: Comprehensive tracking of permission changes and access attempts

### ✅ Advanced Features
- **Dynamic Conditions**: JSON-based permission conditions and constraints
- **Scope Management**: Global, organization, department, team, and personal scopes
- **System Permissions**: Protected system permissions that cannot be modified
- **Dangerous Permission Flags**: Special handling for high-risk permissions
- **Approval Workflows**: Support for permission approval processes
- **Permission Inheritance**: Role hierarchy with automatic permission inheritance

## 📊 Database Schema

### Core Tables

#### `permissions`
```sql
- id (UUID, Primary Key)
- organization_id (UUID, Foreign Key)
- name (VARCHAR 100)
- code (VARCHAR 100, Unique)
- display_name (VARCHAR 255)
- description (TEXT)
- resource (VARCHAR 100)
- action (VARCHAR 100)
- scope (ENUM: global, organization, department, team, personal)
- conditions (JSONB)
- constraints (JSONB)
- category (VARCHAR 100)
- group_name (VARCHAR 100)
- is_system_permission (BOOLEAN)
- is_dangerous (BOOLEAN)
- requires_approval (BOOLEAN)
- sort_order (INTEGER)
- is_visible (BOOLEAN)
- metadata (JSONB)
- status (ENUM)
- created_at, updated_at (TIMESTAMPTZ)
```

#### `permission_groups`
```sql
- id (UUID, Primary Key)
- organization_id (UUID, Foreign Key)
- name (VARCHAR 100)
- code (VARCHAR 50, Unique)
- display_name (VARCHAR 255)
- description (TEXT)
- category (VARCHAR 100)
- parent_group_id (UUID, Self-Reference)
- icon (VARCHAR 50)
- color (VARCHAR 7)
- sort_order (INTEGER)
- status (ENUM)
- created_at, updated_at (TIMESTAMPTZ)
```

#### `role_permissions`
```sql
- id (UUID, Primary Key)
- role_id (UUID, Foreign Key)
- permission_id (UUID, Foreign Key)
- is_granted (BOOLEAN)
- is_inherited (BOOLEAN)
- conditions (JSONB)
- constraints (JSONB)
- granted_by (UUID, Foreign Key)
- granted_at (TIMESTAMPTZ)
- created_at, updated_at (TIMESTAMPTZ)
```

## 🔧 Usage Examples

### 1. Basic Permission Check

```php
// In a controller or service
use App\Services\PermissionManagementService;

class UserController extends Controller
{
    public function __construct(
        private PermissionManagementService $permissionService
    ) {}

    public function index()
    {
        $userId = auth()->id();
        $organizationId = auth()->user()->organization_id;

        // Check if user has permission to read users
        if (!$this->permissionService->userHasPermission(
            $userId, 
            $organizationId, 
            'users', 
            'read'
        )) {
            abort(403, 'Access denied');
        }

        // Proceed with user listing
        return User::paginate();
    }
}
```

### 2. Middleware Usage

```php
// In routes/api.php
Route::middleware('permission:users.read')->group(function () {
    Route::get('/users', [UserController::class, 'index']);
});

// With custom scope
Route::middleware('permission:users.update,organization')->group(function () {
    Route::put('/users/{user}', [UserController::class, 'update']);
});
```

### 3. Creating Permissions

```php
// Create a new permission
$permission = $this->permissionService->createPermission([
    'name' => 'Delete Users',
    'code' => 'delete_users',
    'display_name' => 'Delete Users',
    'description' => 'Allow users to delete other user accounts',
    'resource' => 'users',
    'action' => 'delete',
    'scope' => 'organization',
    'category' => 'user_management',
    'is_dangerous' => true,
    'requires_approval' => true,
], $organizationId);
```

### 4. Assigning Permissions to Roles

```php
// Assign permissions to a role
$success = $this->permissionService->assignPermissionsToRole(
    $roleId,
    ['permission-uuid-1', 'permission-uuid-2'],
    $organizationId,
    auth()->id()
);
```

### 5. Permission Groups

```php
// Create a permission group
$group = $this->permissionService->createPermissionGroup([
    'name' => 'User Management',
    'code' => 'user_management',
    'display_name' => 'User Management',
    'description' => 'Permissions related to user management',
    'category' => 'administration',
    'icon' => 'users',
    'color' => '#3B82F6',
    'permission_ids' => ['perm-1', 'perm-2', 'perm-3']
], $organizationId);
```

## 🛡️ Security Features

### Permission Validation
- **Input Sanitization**: All permission data is validated and sanitized
- **Code Format Validation**: Permission codes must follow naming conventions
- **Scope Validation**: Only valid scope values are accepted
- **Organization Isolation**: Users can only manage permissions within their organization

### Access Control
- **System Permission Protection**: System permissions cannot be modified or deleted
- **Dangerous Permission Handling**: Special handling for high-risk permissions
- **Approval Workflows**: Support for permission approval processes
- **Audit Logging**: All permission changes are logged for compliance

### Caching Security
- **Cache Invalidation**: Automatic cache clearing on permission changes
- **User-Specific Caching**: Permissions are cached per user and organization
- **TTL Management**: Configurable cache expiration times

## 📈 Performance Features

### Caching Strategy
```php
// Cache TTL configuration
const CACHE_TTL = 300; // 5 minutes

// Cache key structure
'user_permissions:{organization_id}:{user_id}'
'role_permissions:{role_id}'
```

### Database Optimization
- **Efficient Queries**: Optimized JOIN queries for permission checks
- **Indexed Fields**: Database indexes on frequently queried fields
- **Batch Operations**: Support for bulk permission operations

### Memory Management
- **Lazy Loading**: Permissions are loaded only when needed
- **Cache Warming**: Automatic cache population for active users
- **Memory Cleanup**: Automatic cache expiration and cleanup

## 🔍 API Endpoints

### Permission Management

| Method | Endpoint | Description | Middleware |
|--------|----------|-------------|------------|
| `GET` | `/api/v1/permissions` | List all permissions | `permission:permissions.read` |
| `GET` | `/api/v1/permissions/{id}` | Get permission details | `permission:permissions.read` |
| `POST` | `/api/v1/permissions` | Create new permission | `permission:permissions.create` |
| `PUT` | `/api/v1/permissions/{id}` | Update permission | `permission:permissions.update` |
| `DELETE` | `/api/v1/permissions/{id}` | Delete permission | `permission:permissions.delete` |

### Permission Groups

| Method | Endpoint | Description | Middleware |
|--------|----------|-------------|------------|
| `GET` | `/api/v1/permissions/groups` | List permission groups | `permission:permissions.read` |
| `POST` | `/api/v1/permissions/groups` | Create permission group | `permission:permissions.create` |

### Role Permissions

| Method | Endpoint | Description | Middleware |
|--------|----------|-------------|------------|
| `GET` | `/api/v1/permissions/roles/{roleId}/permissions` | Get role permissions | `permission:permissions.read` |
| `POST` | `/api/v1/permissions/roles/{roleId}/permissions` | Assign permissions to role | `permission:permissions.update` |
| `DELETE` | `/api/v1/permissions/roles/{roleId}/permissions` | Remove permissions from role | `permission:permissions.update` |

### User Permissions

| Method | Endpoint | Description | Middleware |
|--------|----------|-------------|------------|
| `GET` | `/api/v1/permissions/users/permissions` | Get user permissions | `permission:permissions.read` |
| `POST` | `/api/v1/permissions/users/check-permission` | Check specific permission | `permission:permissions.read` |

## 🧪 Testing

### Unit Tests
```bash
# Run permission management tests
php artisan test --filter=PermissionManagementTest

# Run specific test methods
php artisan test --filter=testCreatePermission
php artisan test --filter=testUserHasPermission
```

### Feature Tests
```bash
# Run API endpoint tests
php artisan test --filter=PermissionApiTest

# Test permission middleware
php artisan test --filter=testPermissionMiddleware
```

### Test Coverage
```bash
# Generate test coverage report
php artisan test --coverage --filter=PermissionManagement
```

## 📚 Best Practices

### 1. Permission Naming Convention
```php
// Use descriptive, hierarchical names
'users.read'           // Read user data
'users.create'         // Create new users
'users.update'         // Update user data
'users.delete'         // Delete users
'users.export'         // Export user data
'users.import'         // Import user data
```

### 2. Scope Usage
```php
// Global scope - affects entire system
'global' => 'System-wide access'

// Organization scope - affects entire organization
'organization' => 'Organization-wide access'

// Department scope - affects specific department
'department' => 'Department-specific access'

// Team scope - affects specific team
'team' => 'Team-specific access'

// Personal scope - affects only the user
'personal' => 'User-specific access'
```

### 3. Permission Categories
```php
// Group permissions by functional areas
'user_management'      // User-related permissions
'content_management'   // Content-related permissions
'financial_management' // Financial-related permissions
'system_administration' // System administration permissions
'reporting'           // Reporting and analytics permissions
```

### 4. Caching Strategy
```php
// Clear cache when permissions change
$this->permissionService->clearPermissionCache($organizationId);

// Clear specific user cache
$this->permissionService->clearUserPermissionCache($userId, $organizationId);

// Clear role cache
$this->permissionService->clearRolePermissionCache($roleId);
```

## 🚨 Error Handling

### Common Exceptions

#### InvalidPermissionException
```php
try {
    $permission = $this->permissionService->createPermission($data, $orgId);
} catch (InvalidPermissionException $e) {
    return response()->json([
        'error' => 'Invalid permission data',
        'message' => $e->getMessage()
    ], 422);
}
```

#### PermissionDeniedException
```php
try {
    // Check permission
    if (!$this->permissionService->userHasPermission($userId, $orgId, 'users', 'delete')) {
        throw new PermissionDeniedException('Access denied', 403, null, 'users', 'delete', 'organization');
    }
} catch (PermissionDeniedException $e) {
    return response()->json([
        'error' => 'Permission denied',
        'resource' => $e->getResource(),
        'action' => $e->getAction(),
        'scope' => $e->getScope()
    ], 403);
}
```

## 🔧 Configuration

### Environment Variables
```env
# Permission cache TTL (seconds)
PERMISSION_CACHE_TTL=300

# Enable permission debugging
PERMISSION_DEBUG=false

# Permission audit logging
PERMISSION_AUDIT_LOG=true
```

### Cache Configuration
```php
// config/cache.php
'permissions' => [
    'driver' => 'redis',
    'connection' => 'permissions',
    'ttl' => env('PERMISSION_CACHE_TTL', 300),
],
```

## 📊 Monitoring & Analytics

### Permission Usage Metrics
- **Permission Check Counts**: Track how often permissions are checked
- **Cache Hit Rates**: Monitor cache performance
- **Permission Denial Rates**: Track access control effectiveness
- **Role Assignment Analytics**: Monitor role usage patterns

### Audit Logging
```php
// All permission changes are logged
Log::info('Permission created', [
    'permission_id' => $permission->id,
    'created_by' => auth()->id(),
    'organization_id' => $organizationId
]);

// Permission denials are logged
Log::warning('Permission denied', [
    'user_id' => $userId,
    'resource' => $resource,
    'action' => $action,
    'scope' => $scope
]);
```

## 🔄 Migration & Deployment

### Database Migrations
```bash
# Run permission-related migrations
php artisan migrate --path=database/migrations/permissions

# Rollback if needed
php artisan migrate:rollback --path=database/migrations/permissions
```

### Seeding Default Permissions
```bash
# Seed default permissions and roles
php artisan db:seed --class=PermissionSeeder
php artisan db:seed --class=RoleSeeder
```

### Cache Warmup
```bash
# Warm up permission cache for all users
php artisan permissions:cache-warmup

# Clear all permission caches
php artisan permissions:cache-clear
```

## 🤝 Contributing

### Code Standards
- Follow PSR-12 coding standards
- Use type hints and return types
- Write comprehensive PHPDoc comments
- Include unit tests for all new features

### Testing Requirements
- Minimum 90% test coverage
- All new features must include tests
- Integration tests for API endpoints
- Performance tests for caching operations

### Documentation
- Update this README for new features
- Include usage examples
- Document any breaking changes
- Maintain API documentation

## 📄 License

This module is part of the Chatbot SAAS application and follows the same licensing terms.

## 🆘 Support

For support and questions:
- Create an issue in the project repository
- Contact the development team
- Check the project documentation
- Review the troubleshooting guide

---

**Last Updated**: January 2025  
**Version**: 1.0.0  
**Maintainer**: Development Team
