# Laravel Sanctum + JWT Authentication Configuration

## Environment Variables yang perlu ditambahkan ke .env

```env
# JWT Authentication Configuration
JWT_SECRET=your-jwt-secret-key-here
JWT_TTL=60
JWT_REFRESH_TTL=20160
JWT_ALGO=HS256
JWT_REQUIRED_CLAIMS=iss,iat,exp,nbf,sub,jti
JWT_PERSISTENT_CLAIMS=
JWT_LOCK_SUBJECT=true
JWT_LEEWAY=0
JWT_BLACKLIST_ENABLED=true
JWT_BLACKLIST_GRACE_PERIOD=0
JWT_DECRYPT_COOKIES=false

# Authentication Security Settings
AUTH_PASSWORD_MAX_AGE=90
AUTH_MAX_LOGIN_ATTEMPTS=5
AUTH_LOCKOUT_DURATION=30
AUTH_MAX_CONCURRENT_SESSIONS=3
AUTH_SESSION_TIMEOUT=3600
AUTH_LOG_API_ACCESS=false
AUTH_LOG_FAILED_ATTEMPTS=true
AUTH_REQUIRE_EMAIL_VERIFICATION=true
AUTH_ENFORCE_2FA_FOR_ADMINS=false

# Rate Limiting for Auth Endpoints
AUTH_LOGIN_MAX_ATTEMPTS=5
AUTH_LOGIN_DECAY_MINUTES=1
AUTH_REFRESH_MAX_ATTEMPTS=10
AUTH_REFRESH_DECAY_MINUTES=1
AUTH_VALIDATION_MAX_ATTEMPTS=60
AUTH_VALIDATION_DECAY_MINUTES=1

# Sanctum Configuration
SANCTUM_STATEFUL_DOMAINS=localhost,localhost:3000,localhost:9000,127.0.0.1,127.0.0.1:8000,127.0.0.1:9000,::1
```

## API Endpoints

### Public Endpoints (No Authentication Required)

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
    "email": "user@example.com",
    "password": "password123",
    "remember": false,
    "device_name": "Web Browser"
}
```

#### Refresh Token
```http
POST /api/auth/refresh
Authorization: Bearer {jwt_token}
```

#### Validate Token
```http
POST /api/auth/validate
Authorization: Bearer {jwt_token}
```

### Protected Endpoints (Require JWT Token)

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer {jwt_token}
```

#### Logout
```http
POST /api/auth/logout
Authorization: Bearer {jwt_token}
```

#### Logout from All Devices
```http
POST /api/auth/logout-all
Authorization: Bearer {jwt_token}
```

#### Get Active Sessions
```http
GET /api/auth/sessions
Authorization: Bearer {jwt_token}
```

#### Revoke Specific Session
```http
DELETE /api/auth/sessions/{sessionId}
Authorization: Bearer {jwt_token}
```

## Response Format

### Successful Login Response
```json
{
    "success": true,
    "message": "Login successful",
    "data": {
        "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
        "token_type": "bearer",
        "expires_in": 3600,
        "expires_at": "2024-01-01T12:00:00.000000Z",
        "sanctum_token": "1|abcdef...",
        "user": {
            "id": "uuid",
            "email": "user@example.com",
            "full_name": "User Name",
            "role": "org_admin",
            "organization": {
                "id": "uuid",
                "name": "Organization Name"
            }
        },
        "session": {
            "id": "uuid",
            "device_info": {...},
            "ip_address": "127.0.0.1"
        },
        "security": {
            "two_factor_enabled": false,
            "password_needs_change": false,
            "login_count": 15,
            "last_login_at": "2024-01-01T11:00:00.000000Z"
        }
    },
    "timestamp": "2024-01-01T12:00:00.000000Z"
}
```

### Error Response
```json
{
    "success": false,
    "message": "Authentication failed",
    "errors": {
        "email": ["Invalid credentials provided."]
    },
    "timestamp": "2024-01-01T12:00:00.000000Z"
}
```

## Security Features

1. **JWT Token Management**
   - Configurable TTL (Time To Live)
   - Token refresh mechanism
   - Token blacklisting
   - Custom claims

2. **Rate Limiting**
   - Login attempts: 5 per minute
   - Token refresh: 10 per minute
   - Token validation: 60 per minute

3. **Session Management**
   - Multiple device support
   - Session tracking with device info
   - Concurrent session limits
   - Force logout capabilities

4. **Account Security**
   - Failed login attempt tracking
   - Account lockout mechanism
   - Password age enforcement
   - Email verification requirement

5. **Audit & Logging**
   - Login/logout events
   - Failed authentication attempts
   - API access logging (optional)
   - Device and location tracking

## Usage Examples

### Frontend JavaScript
```javascript
// Login
const loginResponse = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    body: JSON.stringify({
        email: 'user@example.com',
        password: 'password123',
        remember: false
    })
});

const loginData = await loginResponse.json();
const token = loginData.data.access_token;

// Store token securely (localStorage, sessionStorage, or httpOnly cookie)
localStorage.setItem('auth_token', token);

// Make authenticated requests
const userResponse = await fetch('/api/auth/me', {
    headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
    }
});
```

### Mobile App (React Native)
```javascript
import AsyncStorage from '@react-native-async-storage/async-storage';

// Login and store token
const login = async (email, password) => {
    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            await AsyncStorage.setItem('auth_token', data.data.access_token);
            return data.data.user;
        }
    } catch (error) {
        console.error('Login failed:', error);
    }
};

// Add token to all requests
const apiCall = async (endpoint, options = {}) => {
    const token = await AsyncStorage.getItem('auth_token');
    
    return fetch(endpoint, {
        ...options,
        headers: {
            ...options.headers,
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
        }
    });
};
```

## Troubleshooting

### Common Issues

1. **"Token not provided" Error**
   - Ensure Authorization header is set: `Authorization: Bearer {token}`
   - Check if token is being sent correctly

2. **"Token has expired" Error**
   - Use refresh endpoint to get new token
   - Implement automatic token refresh in your app

3. **"Invalid credentials" Error**
   - Verify email and password
   - Check if account is active and verified

4. **Rate Limiting**
   - Wait for the specified time before retrying
   - Implement exponential backoff in your client

### Migration Commands

```bash
# Generate JWT secret
php artisan jwt:secret

# Publish Sanctum configuration
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"

# Run migrations for user_sessions table
php artisan migrate
```

## Best Practices

1. **Token Storage**
   - Use httpOnly cookies for web apps
   - Use secure storage for mobile apps
   - Never store tokens in localStorage for sensitive data

2. **Token Refresh**
   - Implement automatic token refresh
   - Handle refresh failures gracefully
   - Refresh before token expires

3. **Error Handling**
   - Always check response status
   - Handle different error codes appropriately
   - Provide user-friendly error messages

4. **Security**
   - Use HTTPS in production
   - Implement CSRF protection for web apps
   - Regularly rotate JWT secrets
   - Monitor for suspicious activities
