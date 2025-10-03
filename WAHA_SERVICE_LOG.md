# WAHA Service Log Documentation

## Overview
WAHA Service Log adalah sistem logging yang komprehensif untuk tracking semua aktivitas WAHA service, termasuk typing indicators, outgoing/incoming messages, media upload/download, dan webhook events.

## Features

### 🔍 **Logging Capabilities**
- **Typing Indicators**: TypingStart dan TypingStop events
- **Outgoing Messages**: Pesan yang dikirim ke WhatsApp
- **Incoming Messages**: Pesan yang diterima dari WhatsApp
- **Media Operations**: Upload dan download media files
- **Session Management**: Status session dan koneksi
- **Webhook Events**: Event dari WAHA server
- **API Calls**: Semua panggilan API ke WAHA

### 📊 **Log Structure**
```json
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "service": "typing-indicator",
  "action": "TypingStart",
  "status": "success",
  "data": {
    "session_id": "session_123",
    "to": "+1234567890",
    "is_typing": true,
    "direction": "outgoing"
  },
  "error": null,
  "request_id": "waha_abc123"
}
```

## Usage

### 1. **View Recent Logs**
```bash
# View last 50 logs
php artisan waha:logs

# View last 100 logs
php artisan waha:logs --limit=100
```

### 2. **Filter by Service**
```bash
# View typing indicator logs
php artisan waha:logs --service=typing-indicator

# View outgoing message logs
php artisan waha:logs --service=outgoing-message

# View media upload logs
php artisan waha:logs --service=media-upload
```

### 3. **Filter by Session**
```bash
# View logs for specific session
php artisan waha:logs --session=session_123
```

### 4. **View Statistics**
```bash
# Show statistics for last 24 hours
php artisan waha:logs --stats

# Show statistics for last 7 days
php artisan waha:logs --stats --hours=168
```

## Service Types

### ⌨️ **Typing Indicators**
- **Service**: `typing-indicator`
- **Actions**: `TypingStart`, `TypingStop`
- **Data**: session_id, to, is_typing, direction

### 📤 **Outgoing Messages**
- **Service**: `outgoing-message`
- **Actions**: `MessageSent`
- **Data**: session_id, to, message, type, direction

### 📥 **Incoming Messages**
- **Service**: `incoming-message`
- **Actions**: `MessageReceived`
- **Data**: session_id, from, message, type, direction

### 📎 **Media Upload**
- **Service**: `media-upload`
- **Actions**: `MediaUpload`
- **Data**: session_id, to, media_type, file_name, direction

### 📁 **Media Download**
- **Service**: `media-download`
- **Actions**: `MediaDownload`
- **Data**: session_id, from, media_type, file_name, direction

### 🔗 **Session Status**
- **Service**: `session-status`
- **Actions**: `StatusUpdate`
- **Data**: session_id, status, additional data

### 🌐 **API Calls**
- **Service**: `api-call`
- **Actions**: `GET /endpoint`, `POST /endpoint`
- **Data**: endpoint, method, payload

## Log Files

### 📁 **File Locations**
- **Main Log**: `storage/logs/waha-service.log`
- **Laravel Log**: `storage/logs/waha.log` (daily rotation)
- **Rotated Logs**: `storage/logs/waha-service.log.1`, `.2`, etc.

### 🔄 **Log Rotation**
- **Max Size**: 10MB per file
- **Max Files**: 5 files (50MB total)
- **Auto Rotation**: Automatic when size limit reached

## Integration

### 🔧 **Backend Integration**
```php
use App\Services\Waha\WahaServiceLog;

// Log typing indicator
WahaServiceLog::logTypingIndicator($sessionId, $to, $isTyping, 'success');

// Log outgoing message
WahaServiceLog::logOutgoingMessage($sessionId, $to, $message, 'text', 'success');

// Log incoming message
WahaServiceLog::logIncomingMessage($sessionId, $from, $message, 'text', 'success');

// Log media upload
WahaServiceLog::logMediaUpload($sessionId, $to, 'image', $fileName, 'success');

// Log API call
WahaServiceLog::logApiCall('/api/sendText', 'POST', $payload, 'success');
```

### 📊 **Statistics Methods**
```php
// Get recent logs
$logs = WahaServiceLog::getRecentLogs(100);

// Get logs by service
$typingLogs = WahaServiceLog::getLogsByService('typing-indicator', 50);

// Get logs by session
$sessionLogs = WahaServiceLog::getLogsBySession('session_123', 50);

// Get statistics
$stats = WahaServiceLog::getStatistics(24); // Last 24 hours
```

## Monitoring

### 📈 **Key Metrics**
- **Total Requests**: Jumlah total request ke WAHA
- **Success Rate**: Persentase request yang berhasil
- **Service Breakdown**: Distribusi per service type
- **Action Breakdown**: Distribusi per action type
- **Error Analysis**: Analisis error dan failure patterns

### ⚠️ **Error Tracking**
- **Error Messages**: Detail error message
- **Error Frequency**: Frekuensi error per service
- **Error Patterns**: Pola error yang berulang
- **Recovery Time**: Waktu recovery dari error

## Examples

### 📋 **View All Typing Indicators**
```bash
php artisan waha:logs --service=typing-indicator --limit=20
```

### 📊 **Check Service Statistics**
```bash
php artisan waha:logs --stats --hours=24
```

### 🔍 **Debug Specific Session**
```bash
php artisan waha:logs --session=session_123 --limit=50
```

### 📈 **Monitor Media Operations**
```bash
php artisan waha:logs --service=media-upload --limit=30
```

## Configuration

### ⚙️ **Environment Variables**
```env
# WAHA Log Level
WAHA_LOG_LEVEL=info

# WAHA Log Retention (days)
WAHA_LOG_DAYS=30
```

### 🔧 **Log Channel Configuration**
```php
// config/logging.php
'waha' => [
    'driver' => 'daily',
    'path' => storage_path('logs/waha.log'),
    'level' => env('WAHA_LOG_LEVEL', 'info'),
    'days' => env('WAHA_LOG_DAYS', 30),
    'replace_placeholders' => true,
],
```

## Troubleshooting

### 🐛 **Common Issues**

1. **Log File Not Found**
   - Check file permissions
   - Ensure storage/logs directory exists
   - Verify WAHA service is running

2. **Empty Logs**
   - Check if WAHA service is being called
   - Verify logging configuration
   - Check log level settings

3. **Performance Issues**
   - Monitor log file sizes
   - Check disk space
   - Consider log rotation settings

### 🔍 **Debug Commands**
```bash
# Check log file exists
ls -la storage/logs/waha-service.log

# Check log file size
du -h storage/logs/waha-service.log

# View raw log content
tail -f storage/logs/waha-service.log

# Check Laravel logs
tail -f storage/logs/waha.log
```

## Best Practices

### ✅ **Recommended Usage**
1. **Regular Monitoring**: Check logs daily for errors
2. **Performance Tracking**: Monitor success rates and response times
3. **Error Analysis**: Analyze error patterns for improvements
4. **Log Rotation**: Ensure proper log rotation to prevent disk space issues
5. **Backup Strategy**: Consider backing up important log data

### 🚫 **Avoid**
1. **Log Spam**: Don't log too frequently for non-critical events
2. **Sensitive Data**: Avoid logging sensitive information like passwords
3. **Large Payloads**: Don't log large data payloads
4. **Infinite Loops**: Ensure logging doesn't cause infinite loops

## Support

Untuk bantuan lebih lanjut:
- Check log files: `storage/logs/waha-service.log`
- View statistics: `php artisan waha:logs --stats`
- Monitor real-time: `tail -f storage/logs/waha-service.log`
