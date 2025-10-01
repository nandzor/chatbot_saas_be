# OAuth Integration API Documentation

## Base URL
```
http://localhost:9000/api/oauth
```

## Authentication
All endpoints require JWT authentication via Bearer token in the Authorization header.

```http
Authorization: Bearer <jwt_token>
```

## Endpoints

### 1. Generate OAuth Authorization URL

Generate Google OAuth authorization URL for a specific service.

**Endpoint:** `POST /generate-auth-url`

**Request Body:**
```json
{
  "service": "google-sheets|google-docs|google-drive",
  "organizationId": "string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OAuth authorization URL generated successfully",
  "data": {
    "authUrl": "string",
    "service": "string",
    "organizationId": "string",
    "expiresIn": 600,
    "state": "string"
  },
  "timestamp": "2025-10-01T19:30:35.233303Z",
  "request_id": "req_68dd815b3903f_24482474"
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Service and organization ID are required",
  "error_code": "invalid_request",
  "user_message": "The request is invalid. Please check your input and try again.",
  "technical_message": "Service and organization ID are required",
  "is_retryable": false,
  "context": "Generate OAuth URL",
  "timestamp": "2025-10-01T19:30:35.233303Z",
  "suggestions": [
    "Check your input parameters",
    "Ensure service is one of: google-sheets, google-docs, google-drive"
  ]
}
```

### 2. Handle OAuth Callback

Handle OAuth callback from Google and create N8N credentials.

**Endpoint:** `POST /callback`

**Request Body:**
```json
{
  "code": "string",
  "state": "string",
  "service": "string",
  "organizationId": "string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OAuth integration completed successfully",
  "data": {
    "credential": {
      "id": "string",
      "name": "string",
      "type": "string",
      "status": "active"
    },
    "credentialRef": {
      "organization_id": "string",
      "service": "string",
      "n8n_credential_id": "string",
      "expires_at": "2025-10-02T20:30:00Z"
    },
    "testResult": {
      "success": true,
      "data": {}
    },
    "workflow": {
      "workflowId": "string",
      "name": "string",
      "status": "active"
    }
  }
}
```

### 3. Test OAuth Connection

Test OAuth connection for a specific service.

**Endpoint:** `POST /test-connection`

**Request Body:**
```json
{
  "service": "string",
  "organizationId": "string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Connection test successful",
  "data": {
    "service": "string",
    "status": "connected",
    "expiresAt": "2025-10-02T20:30:00Z",
    "testResult": {}
  }
}
```

### 4. Revoke OAuth Credential

Revoke OAuth credential and disconnect service.

**Endpoint:** `POST /revoke-credential`

**Request Body:**
```json
{
  "service": "string",
  "organizationId": "string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Credential revoked successfully",
  "data": {
    "service": "string",
    "status": "disconnected"
  }
}
```

### 5. Get Files

Retrieve files from Google service.

**Endpoint:** `GET /files`

**Query Parameters:**
- `service` (required): Service name
- `query` (optional): Search query
- `page` (optional): Page number (default: 1)
- `per_page` (optional): Items per page (default: 20)

**Response:**
```json
{
  "success": true,
  "message": "Files retrieved successfully",
  "data": {
    "files": [
      {
        "id": "string",
        "name": "string",
        "mimeType": "string",
        "createdTime": "2025-10-01T19:30:35.233303Z",
        "modifiedTime": "2025-10-01T19:30:35.233303Z",
        "size": "string",
        "owners": [
          {
            "displayName": "string",
            "emailAddress": "string"
          }
        ],
        "webViewLink": "string",
        "webContentLink": "string"
      }
    ],
    "pagination": {
      "current_page": 1,
      "per_page": 20,
      "total": 100,
      "has_more": true
    }
  }
}
```

### 6. Get File Details

Get detailed information about a specific file.

**Endpoint:** `GET /file-details`

**Query Parameters:**
- `service` (required): Service name
- `fileId` (required): File ID

**Response:**
```json
{
  "success": true,
  "message": "File details retrieved successfully",
  "data": {
    "id": "string",
    "name": "string",
    "mimeType": "string",
    "description": "string",
    "createdTime": "2025-10-01T19:30:35.233303Z",
    "modifiedTime": "2025-10-01T19:30:35.233303Z",
    "size": "string",
    "version": "string",
    "owners": [
      {
        "displayName": "string",
        "emailAddress": "string"
      }
    ],
    "permissions": [
      {
        "role": "string",
        "displayName": "string",
        "emailAddress": "string",
        "type": "string"
      }
    ],
    "webViewLink": "string",
    "webContentLink": "string",
    "viewedByMeTime": "2025-10-01T19:30:35.233303Z",
    "shared": true,
    "starred": false,
    "trashed": false
  }
}
```

### 7. Create Workflow

Create N8N workflow with OAuth credentials.

**Endpoint:** `POST /create-workflow`

**Request Body:**
```json
{
  "service": "string",
  "organizationId": "string",
  "selectedFiles": [
    {
      "id": "string",
      "name": "string",
      "mimeType": "string"
    }
  ],
  "workflowConfig": {
    "syncInterval": 300,
    "includeMetadata": true,
    "autoProcess": true,
    "notificationEnabled": true,
    "retryAttempts": 3,
    "retryDelay": 1000
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Workflow created successfully",
  "data": {
    "workflows": [
      {
        "workflowId": "string",
        "name": "string",
        "status": "active",
        "type": "string",
        "credentialId": "string",
        "fileId": "string",
        "fileName": "string"
      }
    ],
    "totalCreated": 1,
    "failed": 0
  }
}
```

### 8. Get Error Statistics

Retrieve error statistics for monitoring and debugging.

**Endpoint:** `GET /error-statistics`

**Query Parameters:**
- `context` (optional): Error context filter
- `hours` (optional): Time range in hours (default: 24)

**Response:**
```json
{
  "success": true,
  "message": "Error statistics retrieved successfully",
  "data": {
    "statistics": [
      {
        "error_code": "network_timeout",
        "total_count": 5,
        "contexts": {
          "Generate OAuth URL": 3,
          "Test Connection": 2
        }
      }
    ],
    "context": "OAuth",
    "hours": 24,
    "total_errors": 5
  }
}
```

### 9. Clear Error Statistics

Clear all error statistics.

**Endpoint:** `DELETE /error-statistics`

**Response:**
```json
{
  "success": true,
  "message": "Error statistics cleared successfully",
  "data": {
    "cleared_at": "2025-10-01T19:30:35.233303Z"
  }
}
```

## Error Codes

### OAuth 2.0 Standard Errors

| Code | Description | HTTP Status | Retryable |
|------|-------------|-------------|-----------|
| `invalid_request` | Malformed request | 400 | No |
| `invalid_client` | Client authentication failed | 401 | No |
| `invalid_grant` | Invalid authorization grant | 401 | No |
| `unauthorized_client` | Client not authorized | 403 | No |
| `unsupported_grant_type` | Grant type not supported | 400 | No |
| `invalid_scope` | Invalid scope | 400 | No |
| `access_denied` | Access denied | 403 | No |
| `server_error` | Server error | 503 | Yes |
| `temporarily_unavailable` | Service temporarily unavailable | 503 | Yes |

### Google API Specific Errors

| Code | Description | HTTP Status | Retryable |
|------|-------------|-------------|-----------|
| `quota_exceeded` | API quota exceeded | 429 | Yes |
| `rate_limit_exceeded` | Rate limit exceeded | 429 | Yes |
| `insufficient_permissions` | Insufficient permissions | 403 | No |
| `invalid_credentials` | Invalid credentials | 401 | No |
| `token_expired` | Access token expired | 401 | No |
| `refresh_token_expired` | Refresh token expired | 401 | No |
| `invalid_token` | Invalid token | 401 | No |

### N8N Integration Errors

| Code | Description | HTTP Status | Retryable |
|------|-------------|-------------|-----------|
| `n8n_connection_failed` | N8N connection failed | 503 | Yes |
| `n8n_credential_creation_failed` | Credential creation failed | 503 | Yes |
| `n8n_workflow_creation_failed` | Workflow creation failed | 503 | Yes |
| `n8n_credential_test_failed` | Credential test failed | 503 | Yes |

### Network Errors

| Code | Description | HTTP Status | Retryable |
|------|-------------|-------------|-----------|
| `network_timeout` | Network timeout | 408 | Yes |
| `network_unreachable` | Network unreachable | 408 | Yes |
| `dns_resolution_failed` | DNS resolution failed | 408 | Yes |
| `ssl_certificate_error` | SSL certificate error | 408 | No |

### Application Errors

| Code | Description | HTTP Status | Retryable |
|------|-------------|-------------|-----------|
| `configuration_error` | Configuration error | 503 | No |
| `service_unavailable` | Service unavailable | 503 | Yes |
| `maintenance_mode` | Maintenance mode | 503 | Yes |
| `feature_disabled` | Feature disabled | 503 | No |

## Rate Limiting

The API implements rate limiting to prevent abuse:

- **Authentication endpoints**: 1000 requests per hour
- **OAuth endpoints**: 100 requests per hour
- **File endpoints**: 500 requests per hour
- **Workflow endpoints**: 100 requests per hour

Rate limit headers are included in responses:

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## Pagination

List endpoints support pagination:

**Query Parameters:**
- `page`: Page number (default: 1)
- `per_page`: Items per page (default: 20, max: 100)

**Response Headers:**
```http
X-Pagination-Current-Page: 1
X-Pagination-Per-Page: 20
X-Pagination-Total: 100
X-Pagination-Last-Page: 5
```

## Webhooks

N8N workflows can send webhooks to notify about file changes:

**Webhook URL Format:**
```
http://localhost:9000/api/n8n-tools/webhooks/change-notification
```

**Webhook Payload:**
```json
{
  "fileId": "string",
  "fileName": "string",
  "service": "string",
  "changeType": "modified|created|deleted",
  "timestamp": "2025-10-01T19:30:35.233303Z",
  "organizationId": "string"
}
```

## SDK Examples

### JavaScript/TypeScript

```javascript
import { OAuthService } from './services/OAuthService';

const oauthService = new OAuthService();

// Generate OAuth URL
const authResult = await oauthService.generateAuthUrl('google-sheets', 'org_123');
if (authResult.success) {
  window.location.href = authResult.data.authUrl;
}

// Handle callback
const callbackResult = await oauthService.handleCallback(code, state);
if (callbackResult.success) {
  console.log('OAuth integration completed');
}

// Get files
const filesResult = await oauthService.getFiles('google-sheets', 'search query');
if (filesResult.success) {
  console.log('Files:', filesResult.data.files);
}

// Create workflow
const workflowResult = await oauthService.createWorkflow({
  service: 'google-sheets',
  organizationId: 'org_123',
  selectedFiles: [file1, file2],
  workflowConfig: {
    syncInterval: 300,
    includeMetadata: true,
    autoProcess: true
  }
});
```

### PHP

```php
use App\Services\GoogleOAuthService;
use App\Services\N8nCredentialService;

$googleService = new GoogleOAuthService();
$n8nService = new N8nCredentialService();

// Generate OAuth URL
$authUrl = $googleService->generateAuthUrl('google-sheets', 'org_123');

// Exchange code for token
$tokenData = $googleService->exchangeCodeForToken($code);

// Create N8N credential
$credentialResult = $n8nService->createOAuthCredential(
    'google-sheets',
    $tokenData['access_token'],
    $tokenData['refresh_token'],
    now()->addSeconds($tokenData['expires_in'])
);
```

## Testing

### Test OAuth Flow

1. **Generate OAuth URL**
   ```bash
   curl -X POST http://localhost:9000/api/oauth/generate-auth-url \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer <token>" \
     -d '{"service":"google-sheets","organizationId":"org_123"}'
   ```

2. **Test Connection**
   ```bash
   curl -X POST http://localhost:9000/api/oauth/test-connection \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer <token>" \
     -d '{"service":"google-sheets","organizationId":"org_123"}'
   ```

3. **Get Files**
   ```bash
   curl -X GET "http://localhost:9000/api/oauth/files?service=google-sheets&query=test" \
     -H "Authorization: Bearer <token>"
   ```

### Error Testing

Test error handling by sending invalid requests:

```bash
# Invalid service
curl -X POST http://localhost:9000/api/oauth/generate-auth-url \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"service":"invalid-service","organizationId":"org_123"}'

# Missing parameters
curl -X POST http://localhost:9000/api/oauth/generate-auth-url \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{}'
```

---

**Last Updated**: October 2025  
**Version**: 1.0.0  
**API Version**: v1
