# Google OAuth 2.0 Setup Guide

## Overview
Panduan lengkap untuk mengatur Google OAuth 2.0 authentication menggunakan Laravel Socialite pada aplikasi chatbot SaaS.

## Prerequisites
- Laravel 11.x
- Laravel Socialite 5.23+
- Google Cloud Console Account
- Valid Google OAuth 2.0 credentials

## Installation

### 1. Install Laravel Socialite
```bash
composer require laravel/socialite
```

### 2. Google Cloud Console Setup

#### Create OAuth 2.0 Credentials
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** > **Credentials**
3. Click **Create Credentials** > **OAuth client ID**
4. Select **Web application**
5. Add the following **Authorized redirect URIs**:
   ```
   http://localhost:9000/auth/google/callback
   https://yourdomain.com/auth/google/callback
   ```
6. Add the following **Authorized JavaScript origins**:
   ```
   http://localhost:9000
   https://yourdomain.com
   ```

#### Enable Required APIs
Enable these APIs in Google Cloud Console:
- Google+ API
- Google Drive API
- Google Sheets API
- Google Docs API

## Configuration

### 1. Environment Variables
Add these variables to your `.env` file:

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=451134512349-0qr900stguhpd51clbi2jhbkiubc46e1.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
GOOGLE_REDIRECT_URI=http://localhost:9000/auth/google/callback
```

### 2. Services Configuration
The configuration is already set up in `config/services.php`:

```php
'google_oauth' => [
    'client_id' => env('GOOGLE_CLIENT_ID'),
    'client_secret' => env('GOOGLE_CLIENT_SECRET'),
    'redirect' => env('GOOGLE_REDIRECT_URI', env('APP_URL') . '/auth/google/callback'),
],
```

### 3. Clear Cache
After configuration, clear Laravel cache:

```bash
docker exec cte_app php artisan config:clear
docker exec cte_app php artisan route:clear
docker exec cte_app php artisan cache:clear
```

## API Endpoints

### 1. Redirect to Google OAuth
**Endpoint:** `GET /api/auth/google/redirect`

**Query Parameters:**
- `organization_id` (required): Organization ID (must be valid UUID)
- `redirect_url` (optional): Backend callback URL (default: http://localhost:9000/auth/google/callback)

**Example Request:**
```bash
curl -X GET "http://localhost:9000/api/auth/google/redirect?organization_id=6a9f9f22-ef84-4375-a793-dd1af45ccdc0&redirect_url=http://localhost:9000/oauth/callback"
```

**Response:**
Redirects to Google OAuth consent screen.

---

### 2. Handle Google OAuth Callback
**Endpoint:** `GET /api/auth/google/callback`

**Query Parameters:**
- `code` (required): Authorization code from Google
- `state` (required): State parameter for security

**Example:**
```
http://localhost:9000/api/auth/google/callback?code=4/0AeaYSHBxxx...&state=eyJvcmdhbml6YXRpb25faWQiOiJvcmdfMTIzIn0=
```

**Success Response:**
Redirects to frontend with JWT token:
```
http://localhost:3001/oauth/callback?success=true&token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
```

**Error Response:**
Redirects to frontend with error message:
```
http://localhost:3001/oauth/callback?success=false&error=OAuth%20error%3A%20access_denied
```

---

### 3. Get OAuth Status
**Endpoint:** `GET /api/oauth/google/status`

**Headers:**
- `Authorization: Bearer {jwt_token}`

**Example Request:**
```bash
curl -X GET "http://localhost:9000/api/oauth/google/status" \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
```

**Success Response:**
```json
{
  "success": true,
  "message": "OAuth status retrieved",
  "data": {
    "has_oauth": true,
    "service": "google",
    "is_expired": false,
    "needs_refresh": false,
    "expires_at": "2025-10-06T06:00:00.000000Z",
    "scope": "openid,profile,email,https://www.googleapis.com/auth/drive,https://www.googleapis.com/auth/spreadsheets"
  },
  "timestamp": "2025-10-05T06:00:00.000000Z",
  "request_id": "req_123456789"
}
```

---

### 4. Revoke OAuth Credential
**Endpoint:** `POST /api/oauth/google/revoke`

**Headers:**
- `Authorization: Bearer {jwt_token}`

**Example Request:**
```bash
curl -X POST "http://localhost:9000/api/oauth/google/revoke" \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
```

**Success Response:**
```json
{
  "success": true,
  "message": "OAuth credential revoked successfully",
  "data": {
    "revoked": true,
    "service": "google"
  },
  "timestamp": "2025-10-05T06:00:00.000000Z",
  "request_id": "req_123456789"
}
```

## Frontend Integration

### React Example

```javascript
import axios from 'axios';

// Redirect to Google OAuth
const handleGoogleLogin = async () => {
  const organizationId = '6a9f9f22-ef84-4375-a793-dd1af45ccdc0'; // Valid UUID
  const redirectUrl = `http://localhost:3001/oauth/callback`; // Frontend callback URL
  
  // Redirect to backend OAuth endpoint
  window.location.href = `http://localhost:9000/api/auth/google/redirect?organization_id=${organizationId}&redirect_url=${encodeURIComponent(redirectUrl)}`;
};

// Handle OAuth callback
const handleOAuthCallback = () => {
  const params = new URLSearchParams(window.location.search);
  const success = params.get('success');
  const token = params.get('token');
  const error = params.get('error');
  
  if (success === 'true' && token) {
    // Store token
    localStorage.setItem('jwt_token', token);
    
    // Redirect to dashboard
    window.location.href = '/dashboard';
  } else {
    // Show error
    console.error('OAuth error:', error);
    alert(`OAuth failed: ${error}`);
  }
};

// Check OAuth status
const checkOAuthStatus = async () => {
  const token = localStorage.getItem('jwt_token');
  
  try {
    const response = await axios.get('http://localhost:9000/api/oauth/google/status', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('OAuth status:', response.data);
    return response.data;
  } catch (error) {
    console.error('Failed to check OAuth status:', error);
  }
};

// Revoke OAuth
const revokeOAuth = async () => {
  const token = localStorage.getItem('jwt_token');
  
  try {
    const response = await axios.post('http://localhost:9000/api/oauth/google/revoke', {}, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('OAuth revoked:', response.data);
    return response.data;
  } catch (error) {
    console.error('Failed to revoke OAuth:', error);
  }
};
```

### Vue.js Example

```vue
<template>
  <div>
    <button @click="loginWithGoogle">Login with Google</button>
    <button @click="checkStatus">Check OAuth Status</button>
    <button @click="revoke">Revoke OAuth</button>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'GoogleOAuthComponent',
  methods: {
    loginWithGoogle() {
      const organizationId = '6a9f9f22-ef84-4375-a793-dd1af45ccdc0'; // Valid UUID
      const redirectUrl = `http://localhost:3001/oauth/callback`; // Frontend callback URL
      
      window.location.href = `http://localhost:9000/api/auth/google/redirect?organization_id=${organizationId}&redirect_url=${encodeURIComponent(redirectUrl)}`;
    },
    
    async checkStatus() {
      const token = localStorage.getItem('jwt_token');
      
      try {
        const response = await axios.get('http://localhost:9000/api/oauth/google/status', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        console.log('OAuth status:', response.data);
      } catch (error) {
        console.error('Failed to check OAuth status:', error);
      }
    },
    
    async revoke() {
      const token = localStorage.getItem('jwt_token');
      
      try {
        const response = await axios.post('http://localhost:9000/api/oauth/google/revoke', {}, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        console.log('OAuth revoked:', response.data);
      } catch (error) {
        console.error('Failed to revoke OAuth:', error);
      }
    }
  },
  
  mounted() {
    // Handle OAuth callback
    const params = new URLSearchParams(window.location.search);
    const success = params.get('success');
    const token = params.get('token');
    const error = params.get('error');
    
    if (success === 'true' && token) {
      localStorage.setItem('jwt_token', token);
      this.$router.push('/dashboard');
    } else if (error) {
      alert(`OAuth failed: ${error}`);
    }
  }
};
</script>
```

## OAuth Flow Diagram

```
┌─────────┐      ┌─────────────┐      ┌──────────────┐      ┌─────────┐
│Frontend │      │   Backend   │      │    Google    │      │ Database│
│:3001    │      │   :9000     │      │              │      │         │
└────┬────┘      └──────┬──────┘      └──────┬───────┘      └────┬────┘
     │                  │                     │                   │
     │ 1. Redirect to   │                     │                   │
     │    Backend OAuth │                     │                   │
     │ ────────────────>│                     │                   │
     │                  │ 2. Redirect to      │                   │
     │                  │    Google OAuth     │                   │
     │                  │ ────────────────────>│                   │
     │                  │                     │                   │
     │                  │    3. User Login    │                   │
     │                  │       & Consent     │                   │
     │                  │<────────────────────│                   │
     │                  │                     │                   │
     │                  │ 4. Callback to     │                   │
     │                  │    Backend          │                   │
     │                  │<────────────────────│                   │
     │                  │                     │                   │
     │                  │ 5. Exchange Code    │                   │
     │                  │    for Tokens       │                   │
     │                  │ ────────────────────>│                   │
     │                  │                     │                   │
     │                  │ 6. Access & Refresh │                   │
     │                  │    Tokens           │                   │
     │                  │<────────────────────│                   │
     │                  │                     │                   │
     │                  │ 7. Store Credential │                   │
     │                  │ ──────────────────────────────────────> │
     │                  │                     │                   │
     │ 8. Redirect to   │                     │                   │
     │    Frontend      │                     │                   │
     │    with JWT      │                     │                   │
     │<─────────────────│                     │                   │
     │                  │                     │                   │
```

### Detailed Flow:

1. **Frontend → Backend**: User clicks "Login with Google" → Frontend redirects to backend OAuth endpoint
2. **Backend → Google**: Backend generates Google OAuth URL and redirects user to Google
3. **Google → User**: User sees Google login/consent screen
4. **Google → Backend**: After user consent, Google redirects back to backend callback URL
5. **Backend → Google**: Backend exchanges authorization code for access/refresh tokens
6. **Backend → Database**: Backend stores OAuth credentials in database
7. **Backend → Frontend**: Backend redirects user back to frontend with JWT token

## OAuth Scopes

The following Google OAuth scopes are requested by default:

- `openid`: OpenID Connect authentication
- `profile`: User profile information
- `email`: User email address
- `https://www.googleapis.com/auth/drive`: Full access to Google Drive

### Google Drive Scope Explained

- **`https://www.googleapis.com/auth/drive`**: Provides full access to Google Drive, including the ability to read, create, modify, and delete files and folders. This scope allows your application to:
  - Read and write files
  - Create and delete files
  - Manage file permissions
  - Access file metadata
  - Upload and download files
  - Manage folders and shared drives

### Other Available Scopes (More Restrictive)

- `https://www.googleapis.com/auth/drive.file`: Only access to files created or opened by the app
- `https://www.googleapis.com/auth/drive.metadata.readonly`: Read-only access to file metadata
- `https://www.googleapis.com/auth/drive.readonly`: Read-only access to all files

## Database Schema

OAuth credentials are stored in the `oauth_credentials` table:

```sql
CREATE TABLE oauth_credentials (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    organization_id VARCHAR(255) NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    service VARCHAR(50) NOT NULL,
    google_id VARCHAR(255),
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    expires_at TIMESTAMP NULL,
    scope TEXT,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    UNIQUE KEY unique_oauth_credential (organization_id, user_id, service)
);
```

## Security Considerations

1. **State Parameter**: Always use state parameter to prevent CSRF attacks
2. **Token Storage**: Store tokens securely using encryption
3. **Token Expiration**: Check token expiration and refresh when needed
4. **Scope Limitation**: Request only necessary scopes
5. **HTTPS**: Use HTTPS in production

## Troubleshooting

### Error: "redirect_uri_mismatch"
**Solution**: Ensure the redirect URI in your Google Cloud Console matches exactly with the one configured in your `.env` file.

### Error: "invalid_client"
**Solution**: Verify your client ID and client secret are correct.

### Error: "access_denied"
**Solution**: User denied permission. Ask the user to try again and grant necessary permissions.

### Error: "Token expired"
**Solution**: Implement token refresh logic using the refresh token.

## Production Deployment

### 1. Update Environment Variables
```env
GOOGLE_CLIENT_ID=your_production_client_id
GOOGLE_CLIENT_SECRET=your_production_client_secret
GOOGLE_REDIRECT_URI=https://yourdomain.com/auth/google/callback
```

### 2. Update Google Cloud Console
Add production redirect URIs:
```
https://yourdomain.com/auth/google/callback
```

### 3. Enable HTTPS
Ensure your application is running over HTTPS in production.

## Testing

### Manual Testing
1. Navigate to: `http://localhost:9000/api/auth/google/redirect?organization_id=6a9f9f22-ef84-4375-a793-dd1af45ccdc0&redirect_url=http://localhost:3001/oauth/callback`
2. Complete Google OAuth flow
3. Verify token is received
4. Check OAuth status: `GET /api/oauth/google/status`

### Automated Testing
```bash
# Test redirect endpoint
curl -X GET "http://localhost:9000/api/auth/google/redirect?organization_id=6a9f9f22-ef84-4375-a793-dd1af45ccdc0&redirect_url=http://localhost:3001/oauth/callback"

# Test status endpoint (with valid JWT token)
curl -X GET "http://localhost:9000/api/oauth/google/status" \
  -H "Authorization: Bearer {your_jwt_token}"
```

## Support

For issues or questions, please contact the development team or refer to:
- [Laravel Socialite Documentation](https://laravel.com/docs/11.x/socialite)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)

---

**Last Updated:** October 5, 2025
**Version:** 1.0.0

