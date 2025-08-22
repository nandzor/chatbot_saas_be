# 📋 Standar API Response untuk Chatbot SAAS Project

## 🎯 Overview

Dokumen ini mendefinisikan standar response format untuk semua API endpoints dalam project Chatbot SAAS. Standar ini memastikan konsistensi, kemudahan debugging, dan pengalaman developer yang baik.

## 📊 Response Format Structure

### Success Response Format
```json
{
    "success": true,
    "message": "Operation successful",
    "data": {}, // Optional - actual response data
    "pagination": {}, // Optional - for paginated responses
    "meta": {
        "api_version": "1.0",
        "environment": "production",
        "server_time": "2024-01-01T12:00:00.000000Z",
        "execution_time_ms": 150.25,
        "memory_usage_mb": 12.5,
        "queries_count": 3
    },
    "timestamp": "2024-01-01T12:00:00.000000Z",
    "request_id": "req_abc123_def456"
}
```

### Error Response Format
```json
{
    "success": false,
    "message": "Operation failed",
    "error_code": "VALIDATION_ERROR",
    "errors": {
        "field_name": ["Error message 1", "Error message 2"]
    },
    "debug": { // Only in non-production
        "file": "/path/to/file.php",
        "line": 123,
        "class": "App\\Http\\Controllers\\SomeController",
        "function": "someMethod",
        "trace_id": "trace_abc123"
    },
    "meta": {
        "api_version": "1.0",
        "environment": "development"
    },
    "timestamp": "2024-01-01T12:00:00.000000Z",
    "request_id": "req_abc123_def456"
}
```

## 🔧 Implementation Components

### 1. ApiResponseTrait
**File**: `app/Traits/Api/ApiResponseTrait.php`

Trait yang menyediakan method helper untuk response standard:

```php
use App\Traits\Api\ApiResponseTrait;

class YourController extends Controller 
{
    use ApiResponseTrait;
    
    public function index() 
    {
        $data = User::all();
        return $this->successResponse('Users retrieved successfully', $data);
    }
    
    public function store(Request $request) 
    {
        $user = User::create($request->validated());
        return $this->createdResponse($user, 'User created successfully');
    }
}
```

### 2. ApiResponse Helper Class
**File**: `app/Http/Responses/ApiResponse.php`

Static class untuk response standard:

```php
use App\Http\Responses\ApiResponse;

// Success responses
return ApiResponse::success('Data retrieved', $data);
return ApiResponse::created($newResource, 'Resource created');
return ApiResponse::updated($resource, 'Resource updated');
return ApiResponse::deleted('Resource deleted');

// Error responses
return ApiResponse::error('Something went wrong');
return ApiResponse::notFound('User', $userId);
return ApiResponse::validationError($errors);
return ApiResponse::unauthorized();
return ApiResponse::forbidden();
return ApiResponse::serverError('Database connection failed');
```

### 3. BaseApiController
**File**: `app/Http/Controllers/Api/BaseApiController.php`

Base controller dengan common functionality:

```php
use App\Http\Controllers\Api\BaseApiController;

class UserController extends BaseApiController
{
    public function index(Request $request)
    {
        // Get pagination params
        $params = $this->getPaginationParams($request);
        
        // Get filters
        $filters = $this->getFilterParams($request, ['status', 'role']);
        
        // Get sorting
        $sort = $this->getSortParams($request, ['name', 'created_at']);
        
        // Build query
        $query = User::query();
        $query = $this->buildQueryWithParams($query, $request, [
            'searchable_fields' => ['name', 'email'],
            'filterable_fields' => ['status', 'role'],
            'sortable_fields' => ['name', 'email', 'created_at'],
            'default_sort' => 'created_at'
        ]);
        
        $users = $query->paginate($params['per_page']);
        
        return $this->paginatedResponse($users, 'Users retrieved successfully');
    }
}
```

### 4. ApiExceptionHandler
**File**: `app/Exceptions/ApiExceptionHandler.php`

Menangani semua exception dengan response standard:

```php
// Automatic exception handling untuk semua API routes
// - ValidationException → 422 dengan field errors
// - ModelNotFoundException → 404 dengan resource info
// - AuthenticationException → 401
// - AuthorizationException → 403
// - Dan lainnya...
```

### 5. ApiResponseMiddleware
**File**: `app/Http/Middleware/ApiResponseMiddleware.php`

Middleware untuk menambahkan headers dan metadata standard:

```php
// Automatically adds:
// - X-API-Version header
// - X-Request-ID header  
// - X-Response-Time header
// - Security headers
// - CORS headers
// - Performance metrics (non-production)
```

## 📝 Response Types

### 1. Success Responses

#### Basic Success (200)
```php
$this->successResponse('Operation completed successfully', $data);
```

#### Created (201)
```php
$this->createdResponse($newResource, 'Resource created successfully');
```

#### Updated (200)
```php
$this->updatedResponse($updatedResource, 'Resource updated successfully');
```

#### Deleted (200)
```php
$this->deletedResponse('Resource deleted successfully');
```

#### No Content (204)
```php
$this->noContentResponse();
```

### 2. Error Responses

#### Validation Error (422)
```php
$this->validationErrorResponse($errors, 'Validation failed');
```

#### Not Found (404)
```php
$this->notFoundResponse('User', $userId);
```

#### Unauthorized (401)
```php
$this->unauthorizedResponse('Invalid credentials');
```

#### Forbidden (403)
```php
$this->forbiddenResponse('Insufficient permissions');
```

#### Rate Limited (429)
```php
$this->tooManyRequestsResponse('Rate limit exceeded');
```

#### Server Error (500)
```php
$this->serverErrorResponse('Database connection failed');
```

### 3. Collection Responses

#### Paginated Collection
```php
$users = User::paginate(15);
return $this->paginatedResponse($users, 'Users retrieved successfully');
```

#### Simple Collection
```php
$users = User::all();
return $this->collectionResponse($users, 'Users retrieved successfully');
```

#### Batch Operations
```php
$results = [
    ['id' => 1, 'success' => true, 'message' => 'Updated'],
    ['id' => 2, 'success' => false, 'message' => 'Validation failed'],
];
return $this->batchResponse($results, 'Batch operation completed');
```

## 🔐 Error Codes

### Authentication & Authorization
- `UNAUTHORIZED` - No valid authentication
- `FORBIDDEN` - Insufficient permissions
- `TOKEN_EXPIRED` - JWT token expired
- `TOKEN_INVALID` - Invalid JWT token
- `TOKEN_MISSING` - No token provided
- `ACCOUNT_LOCKED` - User account is locked
- `EMAIL_NOT_VERIFIED` - Email verification required

### Validation
- `VALIDATION_ERROR` - Input validation failed
- `INVALID_INPUT` - Invalid input format
- `MISSING_REQUIRED_FIELD` - Required field missing
- `VALUE_TOO_LARGE` - Value exceeds maximum
- `VALUE_TOO_SMALL` - Value below minimum

### Resources
- `RESOURCE_NOT_FOUND` - Resource doesn't exist
- `RESOURCE_ALREADY_EXISTS` - Resource already exists
- `RESOURCE_CONFLICT` - Resource state conflict
- `RESOURCE_GONE` - Resource permanently deleted

### Rate Limiting
- `RATE_LIMIT_EXCEEDED` - API rate limit exceeded
- `QUOTA_EXCEEDED` - Usage quota exceeded
- `USAGE_LIMIT_REACHED` - Usage limit reached

### System Errors
- `INTERNAL_SERVER_ERROR` - Generic server error
- `SERVICE_UNAVAILABLE` - Service temporarily down
- `DATABASE_ERROR` - Database operation failed
- `EXTERNAL_SERVICE_ERROR` - External API failed

## 🎯 Usage Examples

### 1. Authentication Controller
```php
class AuthController extends BaseApiController
{
    public function login(LoginRequest $request)
    {
        try {
            $authData = $this->authService->login(
                $request->email,
                $request->password
            );
            
            return $this->successResponse(
                'Login successful',
                new AuthResource($authData),
                201
            );
        } catch (ValidationException $e) {
            return $this->validationErrorResponse(
                $e->errors(),
                'Authentication failed'
            );
        }
    }
    
    public function logout()
    {
        $this->authService->logout();
        return $this->successResponse('Logged out successfully');
    }
}
```

### 2. Resource Controller
```php
class UserController extends BaseApiController
{
    public function index(Request $request)
    {
        $this->logApiAction('users_list_viewed');
        
        $query = User::query();
        $query = $this->buildQueryWithParams($query, $request, [
            'searchable_fields' => ['name', 'email'],
            'filterable_fields' => ['status', 'role'],
            'sortable_fields' => ['name', 'email', 'created_at']
        ]);
        
        $users = $query->paginate($this->getPaginationParams($request)['per_page']);
        
        return $this->paginatedResponse($users, 'Users retrieved successfully');
    }
    
    public function show(string $id)
    {
        $user = User::find($id);
        
        if (!$user) {
            return $this->handleResourceNotFound('User', $id);
        }
        
        if (!$this->validateOrganizationAccess($user->organization_id)) {
            return $this->handleForbiddenAccess('view this user');
        }
        
        return $this->successResponse(
            'User retrieved successfully',
            new UserResource($user)
        );
    }
    
    public function store(CreateUserRequest $request)
    {
        if (!$this->userHasPermission('users.create')) {
            return $this->handleForbiddenAccess('create users');
        }
        
        $user = User::create($request->validated());
        
        $this->logApiAction('user_created', ['user_id' => $user->id]);
        
        return $this->createdResponse(
            new UserResource($user),
            'User created successfully'
        );
    }
    
    public function destroy(string $id)
    {
        $user = User::find($id);
        
        if (!$user) {
            return $this->handleResourceNotFound('User', $id);
        }
        
        if (!$this->userHasPermission('users.delete')) {
            return $this->handleForbiddenAccess('delete users');
        }
        
        $user->delete();
        
        $this->logApiAction('user_deleted', ['user_id' => $id]);
        
        return $this->deletedResponse('User deleted successfully');
    }
}
```

### 3. Error Handling Examples
```php
try {
    $result = $this->someService->performOperation();
    return $this->successResponse('Operation completed', $result);
} catch (ValidationException $e) {
    return $this->validationErrorResponse($e->errors());
} catch (ModelNotFoundException $e) {
    return $this->notFoundResponse('Resource');
} catch (AuthorizationException $e) {
    return $this->forbiddenResponse();
} catch (\Exception $e) {
    Log::error('Unexpected error', ['exception' => $e]);
    return $this->serverErrorResponse('An unexpected error occurred');
}
```

## 🚀 Headers yang Ditambahkan Otomatis

### Response Headers
```
Content-Type: application/json; charset=utf-8
X-API-Version: 1.0
X-Request-ID: req_abc123_def456
X-Response-Time: 150.25ms
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, X-Request-ID
```

## ✅ Best Practices

### 1. Consistent Messaging
```php
// ✅ Good - Clear and actionable
return $this->validationErrorResponse($errors, 'Please check your input and try again');

// ❌ Bad - Vague
return $this->errorResponse('Error');
```

### 2. Proper HTTP Status Codes
```php
// ✅ Good - Correct status codes
return $this->createdResponse($user, 'User created successfully'); // 201
return $this->notFoundResponse('User', $id); // 404
return $this->validationErrorResponse($errors); // 422

// ❌ Bad - Wrong status codes
return $this->successResponse('User created successfully'); // 200 instead of 201
```

### 3. Meaningful Error Codes
```php
// ✅ Good - Specific error codes
return $this->errorResponse(
    'Email address is already registered',
    ['email' => 'This email is already in use'],
    409,
    'RESOURCE_ALREADY_EXISTS'
);

// ❌ Bad - Generic error codes
return $this->errorResponse('Error', [], 400, 'ERROR');
```

### 4. Resource Transformation
```php
// ✅ Good - Use API resources
return $this->successResponse(
    'User retrieved successfully',
    new UserResource($user)
);

// ❌ Bad - Raw model data
return $this->successResponse('User retrieved successfully', $user);
```

### 5. Logging and Auditing
```php
// ✅ Good - Log important actions
$this->logApiAction('user_created', ['user_id' => $user->id]);
return $this->createdResponse(new UserResource($user));

// ✅ Good - Log access attempts
if (!$this->userHasPermission('users.view')) {
    return $this->handleForbiddenAccess('view users');
}
```

## 🔧 Configuration

### Environment Variables
```env
# API Configuration
API_VERSION=1.0
API_LOG_ACCESS=true
API_DEBUG_MODE=false

# Response Configuration
API_DEFAULT_PER_PAGE=15
API_MAX_PER_PAGE=100
API_INCLUDE_PERFORMANCE_METRICS=true
```

### Config Files
```php
// config/api.php
return [
    'version' => env('API_VERSION', '1.0'),
    'log_access' => env('API_LOG_ACCESS', false),
    'debug_mode' => env('API_DEBUG_MODE', false),
    'pagination' => [
        'default_per_page' => env('API_DEFAULT_PER_PAGE', 15),
        'max_per_page' => env('API_MAX_PER_PAGE', 100),
    ],
];
```

---

## 🎉 Summary

Dengan implementasi standar response ini, semua API endpoints dalam project akan memiliki:

- ✅ **Konsistensi Format** - Response format yang sama di seluruh aplikasi
- ✅ **Error Handling** - Penanganan error yang komprehensif dan informatif  
- ✅ **Debugging Support** - Request tracking dan performance metrics
- ✅ **Security Headers** - Security headers yang proper untuk API
- ✅ **Developer Experience** - Response yang mudah dipahami dan di-debug
- ✅ **Scalability** - Architecture yang mudah di-maintain dan di-extend

**Status: Production Ready** ✅
