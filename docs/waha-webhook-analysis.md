# WAHA Webhook Analysis & Implementation

## Overview

This document provides a comprehensive analysis of WAHA (WhatsApp HTTP API) webhook structure and the complete implementation for handling all webhook events in our chatbot SaaS backend.

## WAHA Webhook Events Analysis

### **📋 Complete Event Types Supported**

#### **1. Core Message Events**
- `message` - Incoming messages (primary focus)
- `message.reaction` - User reactions to messages
- `message.any` - All message creations (including sent messages)
- `message.ack` - Message acknowledgments (sent, delivered, read, played)
- `message.revoked` - Message revocation events
- `message.edited` - Message edit events

#### **2. Group Management Events**
- `group.v2.join` - User joined/added to group
- `group.v2.leave` - User left/removed from group
- `group.v2.update` - Group information updates
- `group.v2.participants` - Participant changes (join, leave, promote)

#### **3. Chat Management Events**
- `chat.archive` - Chat archive/unarchive events
- `presence.update` - User presence status updates

#### **4. Interactive Events**
- `poll.vote` - Poll voting events
- `call.received/accepted/rejected` - Voice/video call events

#### **5. Label Events (Business Accounts)**
- `label.upsert` - Label creation/updates
- `label.deleted` - Label deletion
- `label.chat.added/deleted` - Label-chat associations

#### **6. System Events**
- `session.status` - Session status changes
- `engine.event` - Internal engine events
- `event.response` - Event response handling

## WAHA Webhook Payload Structure

### **Standard WAHA Webhook Format**

```json
{
  "id": "evt_01aaaaaaaaaaaaaaaaaaaaaaaa",
  "timestamp": 1634567890123,
  "session": "default",
  "metadata": {
    "user.id": "123",
    "user.email": "email@example.com"
  },
  "engine": "WEBJS",
  "event": "message",
  "payload": {
    "id": "false_11111111111@c.us_AAAAAAAAAAAAAAAAAAAA",
    "timestamp": 1666943582,
    "from": "11111111111@c.us",
    "fromMe": true,
    "source": "api",
    "to": "11111111111@c.us",
    "participant": "string",
    "body": "string",
    "hasMedia": true,
    "media": {
      "url": "http://localhost:3000/api/files/...",
      "mimetype": "audio/jpeg",
      "filename": "example.pdf",
      "s3": {
        "Bucket": "my-bucket",
        "Key": "default/false_11111111111@c.us_AAAAAAAAAAAAAAAAAAAA.oga"
      },
      "error": null
    },
    "ack": -1,
    "ackName": "string",
    "author": "string",
    "location": {
      "description": "string",
      "latitude": "string",
      "longitude": "string"
    },
    "vCards": ["string"],
    "_data": {},
    "replyTo": {
      "id": "AAAAAAAAAAAAAAAAAAAA",
      "participant": "11111111111@c.us",
      "body": "Hello!",
      "_data": {}
    }
  },
  "me": {
    "id": "11111111111@c.us",
    "pushName": "string"
  },
  "environment": {
    "version": "YYYY.MM.BUILD",
    "engine": "WEBJS",
    "tier": "PLUS",
    "browser": "/usr/path/to/bin/google-chrome"
  }
}
```

### **Key Payload Fields**

#### **Event Metadata**
- `id` - Unique event identifier
- `timestamp` - Event timestamp
- `session` - WAHA session name
- `event` - Event type
- `engine` - WAHA engine type (WEBJS, NOWEB, etc.)
- `metadata` - Custom metadata

#### **Message Payload**
- `id` - Message ID
- `from` - Sender phone number
- `to` - Recipient phone number
- `body` - Message content
- `hasMedia` - Media attachment flag
- `media` - Media information
- `ack` - Acknowledgment status
- `fromMe` - Sent by current session
- `source` - Message source
- `participant` - Group participant (for group messages)
- `author` - Message author
- `location` - Location data
- `vCards` - Contact cards
- `replyTo` - Reply reference

## Implementation Details

### **1. Enhanced Webhook Handler**

#### **Multi-Event Support**
```php
private function handleWahaWebhookEvent(array $payload, string $organizationId): array
{
    $eventType = $payload['event'] ?? 'unknown';
    
    switch ($eventType) {
        case 'message':
            return $this->handleMessageEvent($payload, $organizationId);
        case 'message.reaction':
            return $this->handleMessageReactionEvent($payload, $organizationId);
        case 'message.ack':
            return $this->handleMessageAckEvent($payload, $organizationId);
        // ... other event types
    }
}
```

#### **Event-Specific Handlers**
- **Message Events**: Process incoming messages with full media support
- **Reaction Events**: Handle message reactions and emoji responses
- **ACK Events**: Track message delivery status
- **Group Events**: Manage group membership and updates
- **Call Events**: Log and handle voice/video calls

### **2. Advanced Message Data Extraction**

#### **Message Type Detection**
```php
private function determineMessageType(array $message): string
{
    if (isset($message['hasMedia']) && $message['hasMedia']) {
        $mimetype = $message['media']['mimetype'] ?? '';
        if (str_starts_with($mimetype, 'image/')) return 'image';
        if (str_starts_with($mimetype, 'video/')) return 'video';
        if (str_starts_with($mimetype, 'audio/')) return 'audio';
        if (str_starts_with($mimetype, 'application/')) return 'document';
        return 'media';
    }
    
    if (isset($message['location'])) return 'location';
    if (isset($message['vCards']) && !empty($message['vCards'])) return 'contact';
    
    return 'text';
}
```

#### **Phone Number Extraction**
```php
private function extractPhoneNumber(?string $from): ?string
{
    if (!$from) return null;
    return str_replace('@c.us', '', $from);
}
```

#### **Customer Name Resolution**
```php
private function extractCustomerName(array $message): ?string
{
    return $message['contact']['name'] ?? 
           $message['author'] ?? 
           $message['pushName'] ?? 
           null;
}
```

### **3. Webhook Security**

#### **Signature Validation**
```php
private function validateWahaWebhookSignature(Request $request): bool
{
    if (!config('waha.webhook.validate_signature', false)) {
        return true; // Skip if not configured
    }

    $signature = $request->header('X-WAHA-Signature');
    $payload = $request->getContent();
    $secret = config('waha.webhook.secret');

    if (!$signature || !$secret) {
        return false;
    }

    $expectedSignature = hash_hmac('sha256', $payload, $secret);
    return hash_equals($expectedSignature, $signature);
}
```

### **4. Configuration Management**

#### **Environment Variables**
```env
# WAHA Webhook Configuration
WAHA_WEBHOOK_VALIDATE_SIGNATURE=true
WAHA_WEBHOOK_SECRET=your-webhook-secret
WAHA_WEBHOOK_URL=https://your-app.com/api/waha/webhook/message
WAHA_WEBHOOK_TIMEOUT=30
WAHA_WEBHOOK_RETRY_ATTEMPTS=3
```

#### **Supported Events Configuration**
```php
'events' => [
    'message',
    'message.reaction',
    'message.ack',
    'message.revoked',
    'message.edited',
    'group.v2.join',
    'group.v2.leave',
    'group.v2.update',
    'group.v2.participants',
    'chat.archive',
    'presence.update',
    'poll.vote',
    'call.received',
    'call.accepted',
    'call.rejected',
    'session.status',
],
```

## Event Processing Flow

### **1. Webhook Reception**
```
WAHA Server → POST /api/waha/webhook/message → WahaController::handleMessageWebhook
```

### **2. Event Processing**
```
1. Validate webhook signature
2. Extract organization ID from session
3. Route to appropriate event handler
4. Process event-specific logic
5. Return acknowledgment to WAHA
```

### **3. Message Event Flow**
```
Message Event → Extract Message Data → Fire WhatsAppMessageReceived Event → 
ProcessWhatsAppMessageListener → ProcessWhatsAppMessageJob → 
Message Processing → MessageProcessed Event → Real-time Updates
```

## Supported Message Types

### **1. Text Messages**
- Standard text content
- Emoji support
- Unicode characters

### **2. Media Messages**
- **Images**: JPEG, PNG, GIF, WebP
- **Videos**: MP4, AVI, MOV
- **Audio**: MP3, OGG, WAV
- **Documents**: PDF, DOC, XLS, etc.

### **3. Interactive Messages**
- **Location**: GPS coordinates and description
- **Contact Cards**: vCard format
- **Polls**: Voting and results
- **Buttons**: Interactive responses

### **4. System Messages**
- **Reactions**: Emoji reactions
- **Replies**: Message threading
- **Forwards**: Message forwarding
- **Edits**: Message modifications

## Error Handling & Logging

### **1. Comprehensive Logging**
```php
Log::info('WAHA webhook received', [
    'event' => $payload['event'] ?? 'unknown',
    'session' => $payload['session'] ?? 'unknown',
    'timestamp' => now()
]);
```

### **2. Error Recovery**
- Graceful handling of unknown event types
- Fallback processing for malformed payloads
- Retry mechanisms for failed processing

### **3. Monitoring**
- Event processing metrics
- Error rate tracking
- Performance monitoring

## Testing & Validation

### **1. Webhook Testing**
```bash
# Test message webhook
curl -X POST "https://your-app.com/api/waha/webhook/message" \
  -H "Content-Type: application/json" \
  -H "X-WAHA-Signature: your-signature" \
  -d '{
    "id": "evt_test",
    "timestamp": 1640995200,
    "session": "test-session",
    "event": "message",
    "payload": {
      "id": "msg_test",
      "from": "6281234567890@c.us",
      "body": "Test message",
      "timestamp": 1640995200
    }
  }'
```

### **2. Event Simulation**
- Mock webhook payloads for testing
- Event type validation
- Payload structure verification

## Performance Considerations

### **1. Asynchronous Processing**
- Immediate webhook acknowledgment
- Background event processing
- Queue-based message handling

### **2. Scalability**
- Event-driven architecture
- Horizontal scaling support
- Load balancing capabilities

### **3. Resource Management**
- Efficient memory usage
- Database connection pooling
- Cache optimization

## Security Best Practices

### **1. Webhook Security**
- Signature validation
- Rate limiting
- IP whitelisting (optional)

### **2. Data Protection**
- Sensitive data encryption
- Secure storage practices
- Access control

### **3. Monitoring**
- Security event logging
- Anomaly detection
- Audit trails

## Future Enhancements

### **1. Advanced Features**
- Message sentiment analysis
- Auto-reply capabilities
- Smart routing

### **2. Analytics**
- Message flow analytics
- User behavior tracking
- Performance metrics

### **3. Integration**
- CRM system integration
- Third-party service connections
- API extensions

## Troubleshooting

### **Common Issues**

1. **Webhook Not Receiving Events**
   - Check WAHA webhook configuration
   - Verify URL accessibility
   - Check firewall settings

2. **Signature Validation Failures**
   - Verify webhook secret
   - Check signature header
   - Validate payload format

3. **Event Processing Errors**
   - Check organization ID extraction
   - Verify session mapping
   - Review error logs

### **Debug Commands**
```bash
# Check webhook configuration
php artisan tinker
>>> config('waha.webhook')

# Test webhook endpoint
curl -X POST "http://localhost:9000/api/waha/webhook/message" \
  -H "Content-Type: application/json" \
  -d '{"test": "payload"}'

# Monitor queue processing
php artisan queue:monitor whatsapp-messages
```

This comprehensive implementation provides full support for all WAHA webhook events with robust error handling, security features, and scalable architecture.
