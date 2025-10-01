# OAuth Integration Documentation

## Overview

This document provides comprehensive documentation for the OAuth integration system that enables secure authentication with Google services (Sheets, Docs, Drive) and seamless integration with N8N workflows.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Backend Implementation](#backend-implementation)
3. [Frontend Implementation](#frontend-implementation)
4. [Error Handling](#error-handling)
5. [API Reference](#api-reference)
6. [Configuration](#configuration)
7. [Security](#security)
8. [Troubleshooting](#troubleshooting)
9. [Best Practices](#best-practices)

## Architecture Overview

### System Components

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   External      │
│   (React)       │    │   (Laravel)     │    │   Services      │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ • OAuth Hook    │◄──►│ • OAuth Controller│◄──►│ • Google OAuth │
│ • Error Handler │    │ • Error Handler  │    │ • N8N API       │
│ • File Browser  │    │ • Services       │    │ • Google APIs   │
│ • Notifications │    │ • Database       │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### OAuth Flow

1. **Initiation**: User clicks "Connect" for a Google service
2. **Authorization**: Redirect to Google OAuth consent screen
3. **Callback**: Google redirects back with authorization code
4. **Token Exchange**: Backend exchanges code for access/refresh tokens
5. **Credential Creation**: Create N8N credential with OAuth tokens
6. **Workflow Creation**: Create N8N workflow using the credential
7. **File Selection**: User selects files for monitoring
8. **Monitoring**: N8N monitors file changes and processes data

## Backend Implementation

### Services

#### 1. GoogleOAuthService

Handles Google OAuth 2.0 flow and API interactions.

```php
class GoogleOAuthService
{
    public function generateAuthUrl($service, $organizationId): string
    public function exchangeCodeForToken($code): array
    public function refreshAccessToken($refreshToken): array
    public function testOAuthConnection($service, $tokenData): array
}
```

**Key Features:**
- OAuth URL generation with proper scopes
- Token exchange and refresh
- Connection testing
- Error handling

#### 2. N8nCredentialService

Manages N8N credential creation and management.

```php
class N8nCredentialService
{
    public function createOAuthCredential($service, $accessToken, $refreshToken, $expiresAt): array
    public function updateOAuthCredential($credentialId, $newAccessToken, $newExpiresAt): array
    public function testCredential($credentialId): array
}
```

**Key Features:**
- OAuth credential creation in N8N
- Token updates
- Credential testing
- N8N API integration

#### 3. OAuthErrorHandler

Comprehensive error handling for OAuth operations.

```php
class OAuthErrorHandler
{
    public function handleOAuthError(Exception $exception, string $context): array
    public function handleGoogleApiError(RequestException $exception): array
    public function handleN8nApiError(RequestException $exception): array
    public function handleDatabaseError(Exception $exception): array
    public function handleNetworkError(Exception $exception): array
}
```

**Key Features:**
- Error code determination
- User-friendly messages
- Retry logic
- Error statistics
- Suggestions

### Controllers

#### OAuthController

Main controller for OAuth operations.

```php
class OAuthController extends BaseApiController
{
    public function generateAuthUrl(Request $request)
    public function handleCallback(Request $request)
    public function testConnection(Request $request)
    public function revokeCredential(Request $request)
    public function getFiles(Request $request)
    public function getFileDetails(Request $request)
    public function createWorkflow(Request $request)
    public function getErrorStatistics(Request $request)
    public function clearErrorStatistics(Request $request)
}
```

### Database Schema

#### oauth_credentials Table

```sql
CREATE TABLE oauth_credentials (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    organization_id VARCHAR(255) NOT NULL,
    service VARCHAR(255) NOT NULL,
    n8n_credential_id VARCHAR(255) NULL,
    access_token TEXT NOT NULL,
    refresh_token TEXT NULL,
    expires_at TIMESTAMP NULL,
    scope TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    UNIQUE KEY unique_org_service (organization_id, service),
    INDEX idx_org_service (organization_id, service)
);
```

## Frontend Implementation

### Components

#### 1. OAuthFileSelectionPage

Main page for OAuth file selection and workflow configuration.

**Features:**
- Service connection management
- File browser with search and filter
- File selection with preview
- Workflow configuration
- Error handling and notifications

#### 2. FileBrowser

Component for browsing and selecting files.

**Features:**
- Grid and list view modes
- File type filtering
- Search functionality
- Bulk selection
- File preview

#### 3. FilePreview

Modal component for file details.

**Features:**
- File metadata display
- Permission information
- File statistics
- Action buttons (open, download)

#### 4. WorkflowConfig

Modal component for workflow configuration.

**Features:**
- Sync settings
- Notification preferences
- Error handling configuration
- File summary
- Validation

#### 5. OAuthErrorNotification

Component for error notifications.

**Features:**
- Error severity indicators
- Retry functionality
- Suggestions display
- Auto-dismiss
- Context information

### Hooks

#### 1. useOAuth

Main hook for OAuth operations.

```javascript
const {
  oauthStatus,
  loading,
  error,
  errorStatistics,
  retryCount,
  initiateOAuth,
  handleOAuthCallback,
  testOAuthConnection,
  revokeCredential,
  getErrorStatistics,
  clearErrorStatistics,
  retryOperation
} = useOAuth();
```

#### 2. useOAuthFiles

Hook for file management.

```javascript
const {
  files,
  loading,
  error,
  pagination,
  getFiles,
  searchFiles,
  loadMoreFiles,
  refreshFiles
} = useOAuthFiles(service, organizationId);
```

#### 3. useOAuthWorkflow

Hook for workflow creation.

```javascript
const {
  workflows,
  loading,
  error,
  createWorkflow
} = useOAuthWorkflow();
```

### Services

#### OAuthService

Frontend service for OAuth operations.

```javascript
class OAuthService {
  async generateAuthUrl(service, organizationId)
  async handleCallback(code, state)
  async testConnection(service)
  async getFiles(service, query)
  async getFileDetails(service, fileId)
  async createWorkflow(workflowData)
}
```

#### OAuthErrorHandler

Frontend error handling utility.

```javascript
class OAuthErrorHandler {
  handleOAuthError(error, context)
  handleApiError(response, context)
  handleNetworkError(error, context)
  getUserFriendlyMessage(errorCode)
  getErrorSuggestions(errorCode)
  showErrorNotification(errorResult, options)
  handleRetry(operation, errorResult, maxRetries)
}
```

## Error Handling

### Error Categories

#### 1. OAuth 2.0 Standard Errors
- `invalid_request`: Malformed request
- `invalid_client`: Client authentication failed
- `invalid_grant`: Invalid authorization grant
- `unauthorized_client`: Client not authorized
- `unsupported_grant_type`: Grant type not supported
- `invalid_scope`: Invalid scope
- `access_denied`: Access denied
- `server_error`: Server error
- `temporarily_unavailable`: Service temporarily unavailable

#### 2. Google API Specific Errors
- `quota_exceeded`: API quota exceeded
- `rate_limit_exceeded`: Rate limit exceeded
- `insufficient_permissions`: Insufficient permissions
- `invalid_credentials`: Invalid credentials
- `token_expired`: Access token expired
- `refresh_token_expired`: Refresh token expired
- `invalid_token`: Invalid token

#### 3. N8N Integration Errors
- `n8n_connection_failed`: N8N connection failed
- `n8n_credential_creation_failed`: Credential creation failed
- `n8n_workflow_creation_failed`: Workflow creation failed
- `n8n_credential_test_failed`: Credential test failed

#### 4. Network Errors
- `network_timeout`: Network timeout
- `network_unreachable`: Network unreachable
- `dns_resolution_failed`: DNS resolution failed
- `ssl_certificate_error`: SSL certificate error

#### 5. Application Errors
- `configuration_error`: Configuration error
- `service_unavailable`: Service unavailable
- `maintenance_mode`: Maintenance mode
- `feature_disabled`: Feature disabled

### Error Handling Flow

1. **Error Detection**: Error occurs in operation
2. **Error Classification**: Determine error code and category
3. **Error Processing**: Generate user-friendly message and suggestions
4. **Error Logging**: Log technical details for debugging
5. **Error Notification**: Show user-friendly notification
6. **Error Statistics**: Store error metrics for analytics
7. **Retry Logic**: Handle retryable errors automatically

### Retry Logic

```javascript
// Automatic retry for retryable errors
const retryableErrors = [
  'server_error',
  'temporarily_unavailable',
  'network_timeout',
  'network_unreachable',
  'n8n_connection_failed',
  'service_unavailable'
];

// Retry with exponential backoff
const retryAfter = {
  429: 60,    // Rate limit - 1 minute
  503: 300,   // Service unavailable - 5 minutes
  500: 30,    // Server error - 30 seconds
  502: 30,    // Bad gateway - 30 seconds
  504: 30     // Gateway timeout - 30 seconds
};
```

## API Reference

### OAuth Endpoints

#### Generate OAuth URL

```http
POST /api/oauth/generate-auth-url
Content-Type: application/json
Authorization: Bearer <token>

{
  "service": "google-sheets",
  "organizationId": "org_123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OAuth authorization URL generated successfully",
  "data": {
    "authUrl": "https://accounts.google.com/o/oauth2/v2/auth?...",
    "service": "google-sheets",
    "organizationId": "org_123",
    "expiresIn": 600,
    "state": "{\"service\":\"google-sheets\",\"organization_id\":\"org_123\",\"timestamp\":1234567890}"
  }
}
```

#### Handle OAuth Callback

```http
POST /api/oauth/callback
Content-Type: application/json
Authorization: Bearer <token>

{
  "code": "authorization_code",
  "state": "state_data",
  "service": "google-sheets",
  "organizationId": "org_123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OAuth integration completed successfully",
  "data": {
    "credential": {
      "id": "cred_123",
      "name": "Google Sheets OAuth",
      "type": "googleSheetsOAuth2Api",
      "status": "active"
    },
    "credentialRef": {
      "organization_id": "org_123",
      "service": "google-sheets",
      "n8n_credential_id": "cred_123",
      "expires_at": "2025-10-02T20:30:00Z"
    },
    "workflow": {
      "workflowId": "wf_123",
      "name": "OAuth_google-sheets_Workflow",
      "status": "active"
    }
  }
}
```

#### Test Connection

```http
POST /api/oauth/test-connection
Content-Type: application/json
Authorization: Bearer <token>

{
  "service": "google-sheets",
  "organizationId": "org_123"
}
```

#### Get Files

```http
GET /api/oauth/files?service=google-sheets&query=search_term&page=1&per_page=20
Authorization: Bearer <token>
```

#### Create Workflow

```http
POST /api/oauth/create-workflow
Content-Type: application/json
Authorization: Bearer <token>

{
  "service": "google-sheets",
  "organizationId": "org_123",
  "selectedFiles": [
    {
      "id": "file_123",
      "name": "My Spreadsheet",
      "mimeType": "application/vnd.google-apps.spreadsheet"
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

#### Error Statistics

```http
GET /api/oauth/error-statistics?context=OAuth&hours=24
Authorization: Bearer <token>
```

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

## Configuration

### Environment Variables

#### Backend (.env)

```bash
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:9000/oauth/callback

# N8N Configuration
N8N_BASE_URL=http://localhost:5678
N8N_API_KEY=your_n8n_api_key
N8N_WEBHOOK_BASE_URL=http://localhost:5678/webhook

# Database Configuration
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=chatbot_saas
DB_USERNAME=root
DB_PASSWORD=password

# Encryption
APP_KEY=base64:your_app_key
```

#### Frontend (.env)

```bash
# API Configuration
VITE_API_BASE_URL=http://localhost:9000/api
VITE_GOOGLE_CLIENT_ID=your_google_client_id

# Application Configuration
VITE_APP_NAME=Chatbot SaaS
VITE_APP_URL=http://localhost:3000
```

### Google OAuth Setup

1. **Create Google Cloud Project**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create new project or select existing
   - Enable required APIs (Sheets, Docs, Drive)

2. **Configure OAuth Consent Screen**
   - Go to OAuth consent screen
   - Configure application information
   - Add authorized domains
   - Configure scopes

3. **Create OAuth Credentials**
   - Go to Credentials
   - Create OAuth 2.0 Client ID
   - Configure authorized redirect URIs
   - Download credentials

4. **Required Scopes**
   ```javascript
   const scopes = {
     'google-sheets': [
       'https://www.googleapis.com/auth/spreadsheets.readonly',
       'https://www.googleapis.com/auth/drive.readonly'
     ],
     'google-docs': [
       'https://www.googleapis.com/auth/documents.readonly',
       'https://www.googleapis.com/auth/drive.readonly'
     ],
     'google-drive': [
       'https://www.googleapis.com/auth/drive.readonly',
       'https://www.googleapis.com/auth/drive.metadata.readonly'
     ]
   };
   ```

### N8N Configuration

1. **Enable API Access**
   - Configure N8N with API key
   - Enable webhook endpoints
   - Configure CORS if needed

2. **Required N8N Nodes**
   - Google Sheets OAuth2
   - Google Docs OAuth2
   - Google Drive OAuth2
   - Webhook
   - Function

## Security

### Token Security

1. **Encryption**: All tokens stored encrypted using Laravel Crypt
2. **Expiration**: Tokens have expiration times
3. **Refresh**: Automatic token refresh before expiration
4. **Revocation**: Tokens can be revoked when needed

### Access Control

1. **Authentication**: JWT token required for all endpoints
2. **Authorization**: Permission-based access control
3. **Organization Isolation**: Each organization has separate credentials
4. **Audit Trail**: Complete audit trail for all operations

### Data Protection

1. **Encryption**: Sensitive data encrypted at rest
2. **Transmission**: HTTPS for all communications
3. **Validation**: Input validation and sanitization
4. **Rate Limiting**: API rate limiting to prevent abuse

## Troubleshooting

### Common Issues

#### 1. OAuth URL Generation Fails

**Symptoms:**
- Error: "Failed to generate OAuth URL"
- HTTP 500 error

**Solutions:**
- Check Google OAuth configuration
- Verify environment variables
- Check Google Cloud Console settings
- Ensure required APIs are enabled

#### 2. Token Exchange Fails

**Symptoms:**
- Error: "Token exchange failed"
- Invalid authorization code

**Solutions:**
- Check authorization code validity
- Verify redirect URI matches configuration
- Check client ID and secret
- Ensure code hasn't expired

#### 3. N8N Connection Fails

**Symptoms:**
- Error: "N8N connection failed"
- HTTP 503 error

**Solutions:**
- Check N8N server status
- Verify N8N API key
- Check network connectivity
- Ensure N8N is running

#### 4. File Access Denied

**Symptoms:**
- Error: "Access denied"
- HTTP 403 error

**Solutions:**
- Check Google account permissions
- Verify OAuth scopes
- Ensure files are accessible
- Check organization access

### Debug Mode

Enable debug mode for detailed logging:

```bash
# Backend
LOG_LEVEL=debug

# Frontend
VITE_DEBUG=true
```

### Error Logs

Check error logs for detailed information:

```bash
# Laravel logs
tail -f storage/logs/laravel.log

# N8N logs
docker logs n8n_container

# Browser console
# Check browser developer tools
```

## Best Practices

### Development

1. **Error Handling**: Always implement comprehensive error handling
2. **Validation**: Validate all inputs and outputs
3. **Logging**: Log important operations and errors
4. **Testing**: Write tests for critical functionality
5. **Documentation**: Keep documentation up to date

### Security

1. **Token Management**: Never log or expose tokens
2. **HTTPS**: Always use HTTPS in production
3. **Permissions**: Follow principle of least privilege
4. **Auditing**: Implement audit trails
5. **Updates**: Keep dependencies updated

### Performance

1. **Caching**: Cache frequently accessed data
2. **Pagination**: Use pagination for large datasets
3. **Rate Limiting**: Implement rate limiting
4. **Monitoring**: Monitor performance metrics
5. **Optimization**: Optimize database queries

### User Experience

1. **Loading States**: Show loading indicators
2. **Error Messages**: Provide clear error messages
3. **Retry Logic**: Implement retry for transient errors
4. **Feedback**: Provide user feedback for actions
5. **Accessibility**: Ensure accessibility compliance

## Support

For additional support:

1. **Documentation**: Check this documentation first
2. **Logs**: Check error logs for details
3. **Community**: Check community forums
4. **Issues**: Report issues with detailed information
5. **Contact**: Contact support team for critical issues

---

**Last Updated**: October 2025  
**Version**: 1.0.0  
**Maintainer**: Development Team
