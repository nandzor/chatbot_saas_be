# Notification System Documentation

## Overview
Sistem notification telah diimplementasikan menggunakan Laravel Events, Listeners, dan Queue Jobs untuk performa yang optimal dan skalabilitas yang baik.

## Architecture

### 1. Event-Driven Architecture
```
Service → Event → Listener → Queue Jobs → Notification Channels
```

### 2. Components

#### Events
- **`NotificationSent`**: Event yang dipicu ketika notification perlu dikirim

#### Listeners
- **`ProcessNotification`**: Listener yang menangani event dan mendistribusikan ke queue jobs

#### Queue Jobs
- **`SendEmailNotification`**: Job untuk mengirim email notification
- **`SendWebhookNotification`**: Job untuk mengirim webhook notification
- **`SendInAppNotification`**: Job untuk mengirim in-app notification

#### Models
- **`Notification`**: Model dengan status tracking untuk setiap channel

## Implementation Details

### 1. Event System
```php
// Trigger notification
event(new NotificationSent($organization, $notification, $type, $data));
```

### 2. Queue Configuration
```php
// Priority-based queues
'notifications-urgent' => High priority notifications
'notifications-high' => High priority notifications  
'notifications' => Normal priority notifications
'notifications-low' => Low priority notifications
```

### 3. Notification Channels
- **In-App**: Selalu dikirim (default)
- **Email**: Optional, berdasarkan konfigurasi
- **Webhook**: Optional, jika webhook_url tersedia
- **SMS**: Planned (TODO)
- **Push**: Planned (TODO)

### 4. Status Tracking
Setiap notification memiliki status tracking untuk setiap channel:
- `status`: Overall status (pending, sent, failed)
- `email_status`: Email delivery status
- `webhook_status`: Webhook delivery status
- `in_app_status`: In-app delivery status

## Usage Examples

### 1. Basic Notification
```php
$result = $organizationService->sendNotification($organizationId, 'welcome', [
    'title' => 'Welcome to our platform!',
    'message' => 'Thank you for joining us.',
    'channels' => ['in_app', 'email']
]);
```

### 2. High Priority Notification
```php
$result = $organizationService->sendNotification($organizationId, 'urgent', [
    'title' => 'Urgent: Action Required',
    'message' => 'Please update your payment method.',
    'channels' => ['in_app', 'email', 'webhook'],
    'priority' => 'urgent'
]);
```

### 3. Email Only Notification
```php
$result = $organizationService->sendNotification($organizationId, 'newsletter', [
    'title' => 'Monthly Newsletter',
    'message' => 'Check out our latest updates.',
    'channels' => ['email'],
    'send_email' => true,
    'email_template' => 'emails.newsletter'
]);
```

## Database Schema

### Notifications Table
```sql
- id (primary key)
- organization_id (foreign key)
- type (notification type)
- title (notification title)
- message (notification message)
- data (JSON data)
- is_read (boolean)
- status (pending, sent, failed)
- sent_at (timestamp)
- email_sent_at (timestamp)
- email_status (string)
- email_error (text)
- email_failed_at (timestamp)
- webhook_sent_at (timestamp)
- webhook_status (string)
- webhook_error (text)
- webhook_failed_at (timestamp)
- webhook_response (text)
- in_app_sent_at (timestamp)
- in_app_status (string)
- in_app_error (text)
- in_app_failed_at (timestamp)
- error_message (text)
- failed_at (timestamp)
```

## Queue Configuration

### 1. Queue Names
- `notifications-urgent`: Urgent notifications
- `notifications-high`: High priority notifications
- `notifications`: Normal priority notifications
- `notifications-low`: Low priority notifications

### 2. Job Configuration
- **Tries**: 3 attempts for most jobs
- **Timeout**: 30 seconds for email/webhook, 15 seconds for in-app
- **Retry Logic**: Exponential backoff

## Error Handling

### 1. Job Failures
- Automatic retry dengan exponential backoff
- Failed jobs logged dengan detailed error information
- Notification status updated to 'failed'

### 2. Channel Failures
- Individual channel failures don't affect other channels
- Each channel has its own status tracking
- Detailed error logging for debugging

## Performance Benefits

### 1. Asynchronous Processing
- Notifications tidak memblokir response
- Better user experience
- Scalable untuk high volume

### 2. Queue Management
- Priority-based processing
- Load balancing across workers
- Retry mechanism untuk reliability

### 3. Resource Optimization
- Database operations tidak blocking
- HTTP requests handled asynchronously
- Memory efficient processing

## Monitoring & Debugging

### 1. Logging
- Detailed logs untuk setiap step
- Error tracking dengan stack traces
- Performance metrics

### 2. Status Tracking
- Real-time status monitoring
- Failed notification alerts
- Delivery confirmation

## Migration Guide

### 1. Run Migration
```bash
php artisan migrate
```

### 2. Clear Cache
```bash
php artisan cache:clear
php artisan config:clear
php artisan route:clear
```

### 3. Start Queue Workers
```bash
php artisan queue:work --queue=notifications-urgent,notifications-high,notifications,notifications-low
```

## Best Practices

### 1. Notification Design
- Keep messages concise and clear
- Use appropriate priority levels
- Choose right channels for content type

### 2. Error Handling
- Always handle exceptions gracefully
- Log errors for debugging
- Provide fallback mechanisms

### 3. Performance
- Use appropriate queue priorities
- Monitor queue performance
- Scale workers as needed

## Future Enhancements

### 1. Planned Features
- SMS notification support
- Push notification support
- Notification templates
- User preferences
- Delivery analytics

### 2. Integration Points
- Email service providers
- SMS gateways
- Push notification services
- Webhook security enhancements

## Troubleshooting

### 1. Common Issues
- Queue workers not running
- Database connection issues
- Email service configuration
- Webhook URL validation

### 2. Debug Commands
```bash
# Check queue status
php artisan queue:monitor

# Check failed jobs
php artisan queue:failed

# Retry failed jobs
php artisan queue:retry all
```

## Advanced Features

### 1. Real-Time Broadcasting
- Laravel Broadcasting integration
- Browser notification support
- WebSocket/Pusher compatibility
- Auto-cleanup cached notifications

### 2. Notification Scheduling
- Schedule notifications for future delivery
- Timezone-aware scheduling
- Bulk scheduling operations
- Cancel/reschedule capabilities

### 3. Notification Preferences
- Organization-level preferences
- User-level preferences
- Channel-specific settings
- Quiet hours configuration
- Rate limiting per organization

### 4. Read Receipts & Tracking
- Read status tracking
- User agent logging
- IP address logging
- Delivery confirmation
- Correlation ID tracking

### 5. Advanced Analytics
- Delivery rate analysis
- Channel performance metrics
- Time series data
- Error analysis
- Peak hours analysis

## API Endpoints (Complete List)

### Basic Notifications
```
POST /organizations/{id}/send-notification
GET /notifications/templates
GET /notifications/templates/{type}
GET /notifications/analytics
GET /notifications/analytics/platform
POST /notifications/cache/clear
```

### Scheduling
```
POST /organizations/{id}/schedule-notification
GET /organizations/{id}/scheduled-notifications
DELETE /organizations/{id}/scheduled-notifications/{notificationId}
```

### Preferences
```
GET /organizations/{id}/notification-preferences
PUT /organizations/{id}/notification-preferences
```

### Read Receipts
```
PUT /organizations/{id}/notifications/{notificationId}/read
GET /organizations/{id}/browser-notifications
```

## Conclusion

Sistem notification yang telah dienhance memberikan:
- **Complete Channel Support**: In-app, Email, Webhook, SMS, Push
- **Real-Time Broadcasting**: WebSocket/Pusher integration
- **Advanced Scheduling**: Future delivery with timezone support
- **Smart Preferences**: Organization and user-level controls
- **Comprehensive Analytics**: Detailed performance metrics
- **Read Receipts**: Full tracking and confirmation
- **Enterprise Ready**: Production-grade features

Implementasi ini mengikuti Laravel best practices dan enterprise standards untuk high-volume notification processing! 🚀
