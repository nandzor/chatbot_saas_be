# 🔐 Middleware-Based Permission System

## 📋 **Overview**

Sistem permission yang robust dan flexible menggunakan Laravel middleware untuk centralized security management. Menggantikan implementasi permission checking yang scattered di setiap controller method.

## 🎯 **Keuntungan**

### **1. Centralized Security**
- ✅ Semua permission logic di satu tempat
- ✅ Consistent security implementation
- ✅ Easy to audit dan maintain

### **2. Performance**
- ✅ Permission check sekali per request
- ✅ Tidak ada duplicate checks
- ✅ Efficient caching support

### **3. Flexibility**
- ✅ Multiple permission formats
- ✅ AND/OR logic support
- ✅ Wildcard permissions
- ✅ Organization access control

### **4. Clean Code**
- ✅ Controllers fokus pada business logic
- ✅ Tidak ada security concerns di controllers
- ✅ Easy to test

## 🚀 **Middleware Components**

### **1. PermissionMiddleware**

#### **Features:**
- Single permission: `permission:users.view`
- Multiple AND: `permission:users.view,users.create`
- Multiple OR: `permission:users.view|users.create`
- Wildcard: `permission:users.*`

#### **Usage Examples:**
```php
// Single permission
Route::middleware(['permission:users.view'])->group(function () {
    Route::get('/users', [UserController::class, 'index']);
});

// Multiple permissions (AND)
Route::middleware(['permission:users.view,users.export'])->group(function () {
    Route::get('/users/export', [UserController::class, 'export']);
});

// Multiple permissions (OR)
Route::middleware(['permission:users.view|users.admin'])->group(function () {
    Route::get('/users/admin', [UserController::class, 'adminPanel']);
});

// Wildcard permission
Route::middleware(['permission:users.*'])->group(function () {
    // All user operations
});
```

### **2. OrganizationAccessMiddleware**

#### **Features:**
- Strict mode: User hanya bisa akses organization mereka
- Flexible mode: User bisa akses organization mereka atau jika tidak ada specific org
- None mode: Tidak ada organization restriction

#### **Usage Examples:**
```php
// Strict mode (default)
Route::middleware(['organization'])->group(function () {
    Route::get('/org/info', [OrgController::class, 'info']);
});

// Flexible mode
Route::middleware(['organization:flexible'])->group(function () {
    Route::get('/shared/resources', [ResourceController::class, 'shared']);
});

// No organization restriction
Route::middleware(['organization:none'])->group(function () {
    Route::get('/public/data', [PublicController::class, 'data']);
});
```

## 📝 **Route Configuration Examples**

### **User Management Routes**
```php
Route::prefix('users')->middleware(['permission:users.view', 'organization'])->group(function () {
    // View operations - requires users.view permission
    Route::get('/', [UserController::class, 'index']);
    Route::get('/{id}', [UserController::class, 'show']);
    Route::get('/search', [UserController::class, 'search']);
    
    // Create operations - requires users.create permission
    Route::middleware(['permission:users.create'])->post('/', [UserController::class, 'store']);
    
    // Update operations - requires users.update permission
    Route::middleware(['permission:users.update'])->group(function () {
        Route::put('/{id}', [UserController::class, 'update']);
        Route::patch('/{id}', [UserController::class, 'update']);
        Route::patch('/{id}/toggle-status', [UserController::class, 'toggleStatus']);
    });
    
    // Delete operations - requires users.delete permission
    Route::middleware(['permission:users.delete'])->delete('/{id}', [UserController::class, 'destroy']);
});
```

### **Role Management Routes**
```php
Route::prefix('roles')->middleware(['permission:roles.view', 'organization'])->group(function () {
    // View operations
    Route::get('/', [RoleController::class, 'index']);
    Route::get('/{id}', [RoleController::class, 'show']);
    
    // CRUD operations with specific permissions
    Route::middleware(['permission:roles.create'])->post('/', [RoleController::class, 'store']);
    Route::middleware(['permission:roles.update'])->put('/{id}', [RoleController::class, 'update']);
    Route::middleware(['permission:roles.delete'])->delete('/{id}', [RoleController::class, 'destroy']);
    
    // Special operations
    Route::middleware(['permission:roles.assign'])->post('/assign', [RoleController::class, 'assignRole']);
    Route::middleware(['permission:roles.revoke'])->post('/revoke', [RoleController::class, 'revokeRole']);
});
```

## 🔧 **Controller Implementation**

### **Before (Old Implementation)**
```php
public function index(Request $request): JsonResponse
{
    try {
        // Check permission - REDUNDANT!
        if (!$this->userHasPermission('users.view')) {
            return $this->handleForbiddenAccess('view users');
        }

        // Validate organization access - REDUNDANT!
        if (!$this->validateOrganizationAccess($request->get('organization_id'))) {
            return $this->handleUnauthorizedAccess('access users in this organization');
        }

        // Business logic...
        $users = $this->userService->getAll($request);
        return $this->successResponse('Users retrieved', $users);

    } catch (\Exception $e) {
        return $this->errorResponse('Failed to retrieve users', $e->getMessage());
    }
}
```

### **After (Clean Implementation)**
```php
public function index(Request $request): JsonResponse
{
    try {
        // Business logic langsung - NO PERMISSION CHECKS!
        $pagination = $this->getPaginationParams($request);
        $filters = $this->getFilterParams($request, ['status', 'role']);
        
        $users = $this->userService->getAll($request, $filters);

        return $this->successResponse(
            'Users retrieved successfully',
            $users->through(fn($user) => new UserResource($user)),
            200,
            ['pagination' => $pagination]
        );

    } catch (\Exception $e) {
        return $this->errorResponse('Failed to retrieve users', $e->getMessage(), 500);
    }
}
```

## 🎨 **Advanced Permission Patterns**

### **1. Hierarchical Permissions**
```php
// User can access if they have ANY permission in the hierarchy
Route::middleware(['permission:users.*|admin.*|super.*'])->group(function () {
    Route::get('/admin/dashboard', [AdminController::class, 'dashboard']);
});
```

### **2. Conditional Permissions**
```php
// User needs BOTH permissions for sensitive operations
Route::middleware(['permission:users.view,users.audit'])->group(function () {
    Route::get('/users/audit-log', [UserController::class, 'auditLog']);
});
```

### **3. Resource-Based Permissions**
```php
// Wildcard for specific resource types
Route::middleware(['permission:reports.*'])->group(function () {
    Route::get('/reports/sales', [ReportController::class, 'sales']);
    Route::get('/reports/users', [ReportController::class, 'users']);
    Route::get('/reports/analytics', [ReportController::class, 'analytics']);
});
```

## 🧪 **Testing**

### **Unit Testing Controllers**
```php
public function test_user_index_returns_users()
{
    // No need to mock permissions - middleware handles it
    $response = $this->getJson('/api/users');
    
    $response->assertStatus(200);
    $response->assertJsonStructure([
        'success',
        'data',
        'message'
    ]);
}
```

### **Middleware Testing**
```php
public function test_permission_middleware_denies_access()
{
    $user = User::factory()->create(['role' => 'agent']);
    
    $response = $this->actingAs($user)
        ->getJson('/api/users');
    
    $response->assertStatus(403);
    $response->assertJson([
        'error_code' => 'PERMISSION_DENIED'
    ]);
}
```

## 📊 **Performance Monitoring**

### **Middleware Metrics**
```php
// Permission check timing
$startTime = microtime(true);
$hasPermission = $this->checkUserPermissions($user, $organizationId, $parsedPermissions);
$endTime = microtime(true);

Log::info('Permission check timing', [
    'duration_ms' => ($endTime - $startTime) * 1000,
    'permissions' => $parsedPermissions,
    'user_id' => $user->id
]);
```

### **Cache Implementation**
```php
// Cache permission results for 5 minutes
$cacheKey = "user_permissions_{$userId}_{$organizationId}";
$permissions = Cache::remember($cacheKey, 300, function () use ($userId, $organizationId) {
    return $this->permissionService->getUserPermissions($userId, $organizationId);
});
```

## 🚨 **Security Considerations**

### **1. Permission Validation**
- ✅ Validate permission format (resource.action)
- ✅ Check against allowed permission list
- ✅ Prevent permission injection attacks

### **2. Organization Isolation**
- ✅ Strict organization boundaries
- ✅ Prevent cross-organization access
- ✅ Audit organization access attempts

### **3. Rate Limiting**
- ✅ Limit permission check attempts
- ✅ Prevent brute force attacks
- ✅ Monitor suspicious patterns

## 🔄 **Migration Guide**

### **Step 1: Update Routes**
```php
// Old
Route::get('/users', [UserController::class, 'index']);

// New
Route::middleware(['permission:users.view', 'organization'])
    ->get('/users', [UserController::class, 'index']);
```

### **Step 2: Clean Controllers**
```php
// Remove all permission checks
// Remove all organization access validation
// Focus on business logic only
```

### **Step 3: Test Permissions**
```php
// Test with different user roles
// Verify permission enforcement
// Check organization access
```

## 📚 **Best Practices**

### **1. Permission Naming**
```php
// Use consistent format: resource.action
'users.view'      // View users
'users.create'    // Create users
'users.update'    // Update users
'users.delete'    // Delete users
'users.export'    // Export users
```

### **2. Route Organization**
```php
// Group by base permission
Route::middleware(['permission:users.view'])->group(function () {
    // All user view operations
});

// Add specific permissions for actions
Route::middleware(['permission:users.create'])->post('/', [UserController::class, 'store']);
```

### **3. Error Handling**
```php
// Consistent error responses
{
    "success": false,
    "message": "Access denied",
    "error_code": "PERMISSION_DENIED",
    "details": {
        "permissions": ["users.create"],
        "check_type": "single"
    },
    "status_code": 403
}
```

## 🎯 **Conclusion**

Middleware-based permission system memberikan:

- **Security**: Centralized dan consistent
- **Performance**: Efficient dan scalable
- **Maintainability**: Easy to manage dan update
- **Flexibility**: Support berbagai permission patterns
- **Clean Code**: Controllers fokus pada business logic

Implementasi ini menggantikan anti-pattern permission checking di setiap controller method dengan robust, maintainable, dan performant solution.
