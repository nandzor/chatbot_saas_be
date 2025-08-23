# Postman Environments for Chatbot SaaS API

This directory contains professional Postman environment configurations for different deployment stages of the Chatbot SaaS API.

## 📁 Available Environments

### 1. **Local Development** (`Local.postman_environment.json`)
- **Purpose**: Local development and testing
- **Base URL**: `http://localhost:8000`
- **Security**: Relaxed settings for development
- **Features**:
  - SSL verification disabled
  - Rate limiting disabled
  - Debug mode enabled
  - File-based caching
  - Sync queue processing
  - Log-based email driver

### 2. **Staging Environment** (`Staging.postman_environment.json`)
- **Purpose**: Pre-production testing and QA
- **Base URL**: `https://staging-api.chatbot-saas.com`
- **Security**: Production-like with testing flexibility
- **Features**:
  - SSL verification enabled
  - Rate limiting enabled
  - Debug mode enabled for testing
  - Redis caching and queuing
  - SMTP email driver
  - CDN and WebSocket support

### 3. **Production Environment** (`Production.postman_environment.json`)
- **Purpose**: Live production API
- **Base URL**: `https://api.chatbot-saas.com`
- **Security**: Maximum security settings
- **Features**:
  - SSL verification strictly enabled
  - Rate limiting enabled (1000 req/min)
  - Debug mode disabled
  - Redis caching and queuing
  - SMTP email driver
  - Full monitoring and analytics
  - Advanced security features

## 🔧 Setup Instructions

### 1. Import Environments to Postman

1. Open Postman application
2. Click on **Environments** tab (left sidebar)
3. Click **Import** button
4. Select the environment files:
   - `Local.postman_environment.json`
   - `Staging.postman_environment.json`
   - `Production.postman_environment.json`
5. Click **Import**

### 2. Configure Environment Variables

#### For Local Development:
```json
{
  "base_url": "http://localhost:8000",
  "test_email": "test@localhost.dev",
  "test_password": "password123"
}
```

#### For Staging:
```json
{
  "base_url": "https://staging-api.chatbot-saas.com",
  "test_email": "tester@staging.chatbot-saas.com",
  "test_password": "StageTest2024!"
}
```

#### For Production:
```json
{
  "base_url": "https://api.chatbot-saas.com",
  "test_email": "support@chatbot-saas.com",
  "test_password": "[SECURE_PASSWORD]"
}
```

### 3. Security Best Practices

#### 🔒 **Secret Variables**
- `jwt_token` - Marked as secret
- `refresh_token` - Marked as secret
- `sanctum_token` - Marked as secret
- `test_password` - Marked as secret (staging/production)
- `admin_password` - Disabled in production

#### 🛡️ **Production Security**
- Passwords are disabled by default
- Use secure authentication methods
- Enable monitoring and logging
- SSL verification is mandatory

## 📊 Environment Comparison

| Feature | Local | Staging | Production |
|---------|-------|---------|------------|
| **SSL Verification** | ❌ Disabled | ✅ Enabled | ✅ Strict |
| **Rate Limiting** | ❌ Disabled | ✅ Enabled | ✅ Enabled |
| **Debug Mode** | ✅ Enabled | ✅ Enabled | ❌ Disabled |
| **Cache Driver** | File | Redis | Redis |
| **Queue Driver** | Sync | Redis | Redis |
| **Mail Driver** | Log | SMTP | SMTP |
| **Request Timeout** | 30s | 45s | 60s |
| **Rate Limit** | N/A | 100/min | 1000/min |
| **Max File Size** | N/A | 10MB | 50MB |
| **Monitoring** | ❌ Disabled | ✅ Basic | ✅ Full |

## 🚀 Usage Guidelines

### Local Development
1. Select **"Chatbot SaaS - Local Development"** environment
2. Start your Laravel development server: `php artisan serve`
3. Run authentication endpoints first
4. Test all functionality without restrictions

### Staging Testing
1. Select **"Chatbot SaaS - Staging Environment"** environment
2. Use staging credentials
3. Test production-like scenarios
4. Verify rate limiting and security features
5. Test real email delivery

### Production Operations
1. Select **"Chatbot SaaS - Production Environment"** environment
2. **⚠️ USE WITH EXTREME CAUTION**
3. Never use test endpoints on production
4. Always backup before making changes
5. Monitor all API calls
6. Use secure authentication methods only

## 🔄 Dynamic Variables

All environments support dynamic variables that are automatically populated:

- `{{timestamp}}` - Current ISO timestamp
- `{{jwt_token}}` - Auto-populated from login response
- `{{refresh_token}}` - Auto-populated from login response
- `{{user_id}}` - Auto-populated from user data
- `{{organization_id}}` - Auto-populated from user data

## 📝 Environment Variables Reference

### Core Variables
- `base_url` - API base URL
- `api_version` - API version (v1)
- `environment` - Environment identifier

### Authentication
- `jwt_token` - JWT access token
- `refresh_token` - Token refresh
- `sanctum_token` - Laravel Sanctum token

### Test Data
- `user_id` - Test user ID
- `organization_id` - Test organization ID
- `chatbot_id` - Test chatbot ID
- `conversation_id` - Test conversation ID

### Configuration
- `request_timeout` - API timeout
- `pagination_limit` - Default page size
- `debug_mode` - Debug logging
- `rate_limit_enabled` - Rate limiting
- `ssl_verification` - SSL checks

### Infrastructure
- `cdn_url` - CDN endpoint
- `websocket_url` - WebSocket endpoint
- `storage_url` - File storage endpoint

## 🔧 Troubleshooting

### Common Issues

1. **SSL Certificate Errors**
   - Solution: Check `ssl_verification` setting
   - Local: Set to `false`
   - Production: Must be `true`

2. **Rate Limit Exceeded**
   - Solution: Check `api_rate_limit` value
   - Wait for rate limit reset
   - Use different environment for testing

3. **Authentication Failures**
   - Solution: Verify token variables
   - Check token expiration
   - Re-authenticate if needed

4. **Timeout Errors**
   - Solution: Increase `request_timeout`
   - Check server response times
   - Verify network connectivity

### Support

For issues with environments:
1. Check variable values
2. Verify environment selection
3. Review API documentation
4. Contact development team

---

**⚠️ Security Notice**: Never commit sensitive credentials to version control. Use Postman's secret variables and secure storage methods for production credentials.
