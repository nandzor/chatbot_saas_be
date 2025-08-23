# Postman Setup Guide - Chatbot SaaS API

Complete setup guide untuk Postman collection dan environments untuk Chatbot SaaS API.

## 📦 Files Overview

### Collection File
- `Chatbot_SaaS_API.postman_collection.json` - Main API collection (42 endpoints)

### Environment Files
- `environments/Local.postman_environment.json` - Local development
- `environments/Staging.postman_environment.json` - Staging environment
- `environments/Production.postman_environment.json` - Production environment
- `environments/README.md` - Detailed environment documentation

## 🚀 Quick Start

### 1. Import Collection
1. Open Postman
2. Click **Import** button
3. Select `Chatbot_SaaS_API.postman_collection.json`
4. Click **Import**

### 2. Import Environments
1. In Postman, go to **Environments** tab
2. Click **Import** button
3. Select all 3 environment files from `environments/` directory
4. Click **Import**

### 3. Select Environment
- For local development: Select **"Chatbot SaaS - Local Development"**
- For staging testing: Select **"Chatbot SaaS - Staging Environment"**
- For production: Select **"Chatbot SaaS - Production Environment"**

## 🔧 Environment Configuration

### Local Development Setup
```bash
# Start Laravel development server
php artisan serve

# Environment will use:
# - Base URL: http://localhost:8000
# - SSL: Disabled
# - Rate limiting: Disabled
# - Debug: Enabled
```

### Staging Setup
```bash
# Environment configured for:
# - Base URL: https://staging-api.chatbot-saas.com
# - SSL: Enabled
# - Rate limiting: Enabled (100 req/min)
# - Debug: Enabled
```

### Production Setup
```bash
# Environment configured for:
# - Base URL: https://api.chatbot-saas.com
# - SSL: Strictly enabled
# - Rate limiting: Enabled (1000 req/min)
# - Debug: Disabled
# - Security: Maximum
```

## 📊 API Collection Structure

### 🔐 Authentication (6 endpoints)
- Login
- Register
- Refresh Token
- Validate Token
- Forgot Password
- Reset Password

### 👤 User Management (6 endpoints)
- Get Current User
- Update Profile
- Change Password
- Logout
- Logout All Devices
- Get Active Sessions

### 👥 User Management Admin (10 endpoints)
- List Users
- Search Users
- Get User Statistics
- Create User
- Get User by ID
- Update User
- Delete User
- Bulk Update Users
- Toggle User Status
- Restore User

### 🤖 Chatbot Operations (7 endpoints)
- List Chatbots
- Create Chatbot
- Get Chatbot
- Update Chatbot
- Delete Chatbot
- Train Chatbot
- Chat with Bot

### 💬 Conversations (4 endpoints)
- List Conversations
- Create Conversation
- Get Conversation
- Send Message

### 📊 Analytics (3 endpoints)
- Dashboard Analytics
- Usage Analytics
- Performance Analytics

### ⚙️ System (1 endpoint)
- Health Check

### 👑 Admin Panel (9 endpoints)
- Admin Dashboard Overview
- Admin System Logs
- Admin User Management
- Admin Export Users
- Admin Bulk User Actions
- Admin Force Logout User
- Admin Lock User Account
- Admin Unlock User Account
- Admin Revoke Session

## 🔄 Automated Features

### Pre-request Scripts
- Auto-generate timestamps
- Token expiration checking
- Dynamic variable population

### Test Scripts
- Response validation
- Auto-token storage
- Response time monitoring
- Success property checking

### Environment Variables
All required variables are automatically available:
- `base_url` - API base URL
- `jwt_token` - Authentication token
- `refresh_token` - Token refresh
- `user_id` - Current user ID
- `organization_id` - Organization ID
- `chatbot_id` - Chatbot ID
- `conversation_id` - Conversation ID
- `session_id` - Session ID
- `timestamp` - Auto-generated timestamp

## 🛡️ Security Features

### Local Development
- Relaxed security for development
- SSL verification disabled
- Rate limiting disabled
- Debug mode enabled

### Staging Environment
- Production-like security
- SSL verification enabled
- Rate limiting enabled
- Debug mode for testing

### Production Environment
- Maximum security settings
- SSL strictly enforced
- Rate limiting active
- Debug mode disabled
- Monitoring enabled
- Encryption enabled

## 🔧 Testing Workflow

### 1. Authentication Flow
```
1. Select appropriate environment
2. Run "Login" request
3. JWT token auto-stored
4. All other requests now authenticated
```

### 2. API Testing Flow
```
1. Start with Health Check
2. Authenticate with Login
3. Test User Management endpoints
4. Test Chatbot Operations
5. Test Conversations
6. Test Analytics
7. Test Admin Panel (if admin)
```

### 3. Environment Switching
```
Local → Staging → Production
(Test locally first, then staging, finally production)
```

## ⚠️ Important Notes

### Security Warnings
- **Production**: Never use test credentials
- **Secrets**: Use Postman's secret variables
- **Tokens**: Auto-expire, re-authenticate as needed
- **Admin**: Admin endpoints require special permissions

### Best Practices
- Always test in Local first
- Use Staging for integration testing
- Use Production with extreme caution
- Monitor API usage and performance
- Keep environments updated

## 📞 Support

For issues or questions:
1. Check environment configuration
2. Verify variable values
3. Review API documentation
4. Check server status
5. Contact development team

---

**Status**: ✅ All files validated and ready for use
**Last Updated**: January 2024
**Version**: 1.0.0
