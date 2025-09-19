# WAHA Organization Enhancement Documentation

## Overview
Enhancement ini menambahkan filtering berdasarkan `organization_id` untuk WAHA API dan memastikan sinkronisasi antara WAHA 3rd party service dengan database lokal.

## Key Features

### 1. Organization-Based Data Isolation
- Semua WAHA sessions hanya dapat diakses oleh organization yang memiliki session tersebut
- Middleware `WahaOrganizationMiddleware` memastikan user terautentikasi dan memiliki organization
- Setiap endpoint memverifikasi bahwa session belongs to current user's organization

### 2. Database Synchronization
- `WahaSyncService` menangani sinkronisasi antara WAHA 3rd party dengan database lokal
- Automatic sync saat mengambil sessions, status, dan info
- Local database menyimpan metadata tambahan seperti business info, statistics, dll.

### 3. Service Layer Architecture
- Semua database queries dipindahkan ke service layer
- `WahaController` hanya menangani HTTP requests/responses
- `WahaSyncService` menangani business logic dan data synchronization

## File Changes

### 1. New Files
- `app/Services/Waha/WahaSyncService.php` - Service untuk sinkronisasi data
- `app/Http/Middleware/WahaOrganizationMiddleware.php` - Middleware untuk organization validation
- `docs/WAHA_ORGANIZATION_ENHANCEMENT.md` - Dokumentasi ini

### 2. Modified Files
- `app/Http/Controllers/Api/V1/WahaController.php` - Enhanced dengan organization filtering
- `routes/waha.php` - Added middleware protection
- `bootstrap/app.php` - Registered WAHA middleware

## API Endpoints

Semua WAHA endpoints sekarang memerlukan:
1. Authentication (`auth:sanctum`)
2. Organization membership (`waha.organization`)

### Session Management
- `GET /api/waha/sessions` - Get sessions for current organization
- `POST /api/waha/sessions/{sessionId}/start` - Start session (organization-scoped)
- `POST /api/waha/sessions/{sessionId}/stop` - Stop session (organization-scoped)
- `DELETE /api/waha/sessions/{sessionId}` - Delete session (organization-scoped)

### Session Information
- `GET /api/waha/sessions/{sessionId}/status` - Get session status (organization-scoped)
- `GET /api/waha/sessions/{sessionId}/info` - Get session info (organization-scoped)
- `GET /api/waha/sessions/{sessionId}/qr` - Get QR code (organization-scoped)

### Messaging
- `POST /api/waha/sessions/{sessionId}/send-text` - Send text message (organization-scoped)
- `POST /api/waha/sessions/{sessionId}/send-media` - Send media message (organization-scoped)
- `GET /api/waha/sessions/{sessionId}/messages` - Get messages (organization-scoped)

### Contacts & Groups
- `GET /api/waha/sessions/{sessionId}/contacts` - Get contacts (organization-scoped)
- `GET /api/waha/sessions/{sessionId}/groups` - Get groups (organization-scoped)

### Health & Status
- `GET /api/waha/sessions/{sessionId}/connected` - Check connection (organization-scoped)
- `GET /api/waha/sessions/{sessionId}/health` - Get health status (organization-scoped)

## Data Flow

### 1. Session Retrieval
```
GET /api/waha/sessions
├── WahaOrganizationMiddleware (auth + organization check)
├── WahaController::getSessions()
├── WahaSyncService::getSessionsForOrganization()
├── WahaService::getSessions() (WAHA 3rd party)
├── Database query (organization-scoped)
└── Merge WAHA data with local data
```

### 2. Session Creation
```
POST /api/waha/sessions/{sessionId}/start
├── WahaOrganizationMiddleware (auth + organization check)
├── WahaController::startSession()
├── WahaSyncService::createSessionForOrganization()
├── WahaService::startSession() (WAHA 3rd party)
└── Create local database record
```

### 3. Session Operations
```
Any session operation
├── WahaOrganizationMiddleware (auth + organization check)
├── WahaController::operation()
├── WahaSyncService::verifySessionAccess()
├── Verify session belongs to organization
├── Execute operation
└── Update local database if needed
```

## Security Features

### 1. Organization Isolation
- Setiap organization hanya dapat mengakses sessions milik mereka
- Session verification di setiap endpoint
- Database queries selalu include `organization_id` filter

### 2. Authentication & Authorization
- Sanctum authentication required
- Organization membership validation
- Session ownership verification

### 3. Data Synchronization
- Automatic sync antara WAHA server dan database lokal
- Local database menyimpan additional metadata
- Real-time status updates

## Database Schema

### WahaSession Model
```php
// Key fields for organization isolation
'organization_id' => 'required|uuid|exists:organizations,id'
'session_name' => 'unique per organization'
'phone_number' => 'unique per organization'

// Additional metadata
'business_name' => 'nullable'
'business_description' => 'nullable'
'total_messages_sent' => 'integer'
'total_messages_received' => 'integer'
// ... other fields
```

## Error Handling

### 1. Authentication Errors
```json
{
  "success": false,
  "message": "Authentication required",
  "error_code": "UNAUTHENTICATED"
}
```

### 2. Organization Errors
```json
{
  "success": false,
  "message": "User must belong to an organization to access WAHA features",
  "error_code": "NO_ORGANIZATION"
}
```

### 3. Session Not Found
```json
{
  "success": false,
  "message": "WAHA session not found",
  "error_code": "SESSION_NOT_FOUND"
}
```

## Logging

Semua WAHA operations dicatat dengan:
- User ID
- Organization ID
- Session ID
- Operation type
- Timestamp
- Success/failure status

## Testing

Untuk test organization filtering:

1. **Create sessions for different organizations**
2. **Verify data isolation** - Organization A cannot see Organization B's sessions
3. **Test middleware protection** - Unauthenticated requests are rejected
4. **Test session operations** - Only session owner can perform operations
5. **Test synchronization** - Local database stays in sync with WAHA server

## Migration Notes

### Existing Data
- Existing WAHA sessions perlu di-assign ke organization
- Migration script mungkin diperlukan untuk update existing records

### Frontend Updates
- Frontend perlu handle organization-scoped responses
- Error handling untuk organization-related errors
- UI updates untuk show organization context

## Performance Considerations

### 1. Database Queries
- Organization filtering menggunakan indexed `organization_id` field
- Eager loading untuk related models
- Efficient session verification

### 2. WAHA API Calls
- Caching untuk session status (optional)
- Rate limiting untuk WAHA API calls
- Error handling untuk WAHA server unavailability

### 3. Synchronization
- Batch operations untuk multiple sessions
- Background jobs untuk heavy sync operations
- Incremental updates untuk better performance

## Future Enhancements

1. **Multi-tenant WAHA instances** - Different WAHA servers per organization
2. **Advanced caching** - Redis caching untuk session data
3. **Webhook integration** - Real-time updates dari WAHA server
4. **Analytics dashboard** - Organization-specific usage statistics
5. **Bulk operations** - Mass session management
6. **Session templates** - Pre-configured session setups per organization
