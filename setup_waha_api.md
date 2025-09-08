# WAHA API Setup Guide

## Current Status
✅ WAHA package integrated (`chengkangzai/laravel-waha-saloon-sdk`)  
✅ WAHA service created (`App\Services\WahaService`)  
✅ WAHA controller created (`App\Http\Controllers\Api\V1\WahaController`)  
✅ WAHA routes configured  
✅ API endpoints configured correctly  
❌ WAHA server needs to be configured  

## Steps to Complete Setup

### 1. Set Up WAHA Server
WAHA (WhatsApp HTTP API) is a REST API that connects to WhatsApp Web.

**Option A: Docker Setup**
```bash
# Run WAHA server with Docker
docker run -it --rm --name waha \
  -p 3000:3000 \
  -e WHATSAPP_API_SESSION_MANAGEMENT_MODE=local \
  -e WHATSAPP_API_SESSION_STORAGE_TYPE=file \
  -e WHATSAPP_API_SESSION_STORAGE_PATH=/app/sessions \
  -e WHATSAPP_API_WEBHOOK_URL=http://your-app.com/webhook \
  -e WHATSAPP_API_WEBHOOK_EVENTS=message,session.status \
  devlikeapro/waha-plus
```

**Option B: Local Installation**
```bash
# Install WAHA via npm
npm install -g @devlikeapro/waha-plus

# Run WAHA server
waha-plus
```

### 2. Configure Laravel App
**Note**: The WAHA service uses a custom configuration file (`config/waha.php`) instead of the package's default config. This provides better organization and more comprehensive configuration options.

Add WAHA configuration to your `.env` file:

```env
# WAHA Server Configuration
WAHA_BASE_URL=http://localhost:3000
WAHA_API_KEY=your-waha-api-key-if-needed
WAHA_TIMEOUT=30

# WAHA Webhook Configuration
WAHA_WEBHOOK_URL=http://your-app.com/webhook
WAHA_WEBHOOK_USERNAME=webhook_user
WAHA_WEBHOOK_PASSWORD=webhook_pass

# WAHA Testing Configuration
WAHA_MOCK_RESPONSES=false
WAHA_TESTING_ENABLED=true
WAHA_LOG_REQUESTS=true
WAHA_LOG_RESPONSES=true

# WAHA Retry Configuration
WAHA_RETRY_ATTEMPTS=3
WAHA_RETRY_DELAY=1000

# WAHA Security Configuration
WAHA_VERIFY_WEBHOOK_SIGNATURE=true
WAHA_ALLOWED_IPS=127.0.0.1,::1
WAHA_REQUIRE_AUTH=true
```

### 3. Test the Connection
Run this command to test:

```bash
docker exec -ti cte_app php artisan tinker --execute="
\$service = new App\Services\WahaService();
\$result = \$service->testConnection();
echo json_encode(\$result, JSON_PRETTY_PRINT);
"
```

## Current Configuration
- **WAHA Server URL**: `http://localhost:3000` (default)
- **Mock Responses**: `false` (using real API)
- **Package**: `chengkangzai/laravel-waha-saloon-sdk` integrated
- **Configuration**: Uses `config/waha.php` (custom configuration)
- **API Endpoints**: All WAHA routes configured

## Configuration Files
- **`config/waha.php`**: Main WAHA configuration file
- **`.env`**: Environment variables for WAHA settings

## Environment Variables Reference
```env
# Server Configuration
WAHA_BASE_URL=http://localhost:3000
WAHA_API_KEY=your-waha-api-key-if-needed
WAHA_TIMEOUT=30

# Webhook Configuration
WAHA_WEBHOOK_URL=http://your-app.com/webhook
WAHA_WEBHOOK_USERNAME=webhook_user
WAHA_WEBHOOK_PASSWORD=webhook_pass

# Testing Configuration
WAHA_MOCK_RESPONSES=false
WAHA_TESTING_ENABLED=true
WAHA_LOG_REQUESTS=true
WAHA_LOG_RESPONSES=true

# Retry Configuration
WAHA_RETRY_ATTEMPTS=3
WAHA_RETRY_DELAY=1000

# Security Configuration
WAHA_VERIFY_WEBHOOK_SIGNATURE=true
WAHA_ALLOWED_IPS=127.0.0.1,::1
WAHA_REQUIRE_AUTH=true

# Session Configuration
WAHA_MAX_SESSIONS=10
WAHA_SESSION_TIMEOUT=3600

# Notification Configuration
WAHA_NOTIFY_ON_MESSAGE=true
WAHA_NOTIFY_ON_SESSION_STATUS=true
WAHA_NOTIFICATION_CHANNELS=mail,slack
```

## Troubleshooting

### If you get "Connection failed" error:
- Make sure WAHA server is running on the configured port
- Verify the WAHA_BASE_URL is correct
- Check WAHA server logs for errors

### If you get "404 Not Found" errors:
- Verify WAHA server is accessible at the configured URL
- Check that WAHA server is properly started

### If you get authentication errors:
- Verify WAHA_API_KEY is correct (if required)
- Check WAHA server authentication settings

## Test Commands

### Test WAHA Connection Directly
```bash
curl http://localhost:3000/api/status
```

### Test from Laravel Container
```bash
docker exec -ti cte_app curl http://localhost:3000/api/status
```

### Test Laravel API Endpoints
```bash
# Test connection
curl -X GET "http://localhost:9000/api/v1/waha/connection/test" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer YOUR_LARAVEL_TOKEN"

# Test sessions
curl -X GET "http://localhost:9000/api/v1/waha/sessions" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer YOUR_LARAVEL_TOKEN"
```

## Available WAHA API Endpoints

### Connection
- `GET /api/v1/waha/connection/test` - Test WAHA connection

### Sessions
- `GET /api/v1/waha/sessions` - List all sessions
- `GET /api/v1/waha/sessions/{sessionId}` - Get session information
- `POST /api/v1/waha/sessions/{sessionId}/start` - Start session
- `POST /api/v1/waha/sessions/{sessionId}/stop` - Stop session
- `DELETE /api/v1/waha/sessions/{sessionId}` - Delete session

### Messages
- `POST /api/v1/waha/sessions/{sessionId}/send/text` - Send text message
- `GET /api/v1/waha/sessions/{sessionId}/chats` - Get chats
- `GET /api/v1/waha/sessions/{sessionId}/chats/{chatId}/messages` - Get messages
- `GET /api/v1/waha/sessions/{sessionId}/contacts` - Get contacts

## Example Usage

### Start a WhatsApp Session
```bash
curl -X POST "http://localhost:9000/api/v1/waha/sessions/my-session/start" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_LARAVEL_TOKEN" \
  -d '{
    "config": {
      "webhook": "http://your-app.com/webhook",
      "events": ["message", "session.status"]
    }
  }'
```

### Send a Text Message
```bash
curl -X POST "http://localhost:9000/api/v1/waha/sessions/my-session/send/text" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_LARAVEL_TOKEN" \
  -d '{
    "to": "+1234567890",
    "text": "Hello from WAHA!"
  }'
```

### Get Session Information
```bash
curl -X GET "http://localhost:9000/api/v1/waha/sessions/my-session" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer YOUR_LARAVEL_TOKEN"
```

## Next Steps
Once WAHA server is configured, you can:
1. Test all WAHA endpoints via the Laravel API
2. Start WhatsApp sessions
3. Send and receive messages
4. Manage contacts and chats
5. Set up webhooks for real-time message handling

## Package Integration Details
- **Package**: `chengkangzai/laravel-waha-saloon-sdk`
- **Configuration**: Uses custom `config/waha.php` (not the package's default config)
- **Service**: `App\Services\WahaService` wraps the package functionality
- **Routes**: All WAHA routes are in `routes/waha.php`
- **Controller**: `App\Http\Controllers\Api\V1\WahaController`

## Configuration Notes
- The package's default config file (`config/waha-saloon-sdk.php`) has been removed
- All configuration is handled through the custom `config/waha.php` file
- Environment variables are mapped to the custom configuration structure
- This provides better organization and more comprehensive configuration options

---

**Note**: The Laravel app is now fully integrated with WAHA. You just need to set up and configure the WAHA server to complete the setup.
