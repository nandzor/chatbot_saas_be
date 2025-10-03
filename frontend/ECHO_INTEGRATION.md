# Laravel Echo Integration with Reverb

This document describes the implementation of Laravel Echo on the frontend and its integration with Laravel Reverb backend.

## Overview

The implementation provides real-time WebSocket communication using Laravel Echo with the following features:

- Real-time messaging
- Typing indicators
- User presence tracking
- Session management
- Connection status monitoring
- Automatic reconnection
- Event broadcasting

## Architecture

### Core Components

1. **Echo Configuration** (`src/config/echo.js`)
   - Laravel Echo setup with Reverb configuration
   - Channel name helpers
   - Event name constants

2. **Echo Service** (`src/services/EchoService.js`)
   - Singleton service for managing Echo connections
   - Channel subscription management
   - Event handling and broadcasting

3. **Echo Hook** (`src/hooks/useEcho.js`)
   - React hook for Echo integration
   - Connection state management
   - Event listener setup

4. **Echo Provider** (`src/components/EchoProvider.jsx`)
   - React context provider for Echo
   - Global state management
   - Organization-based initialization

5. **Echo Status** (`src/components/EchoStatus.jsx`)
   - Connection status display component
   - User count indicator
   - Error state handling

## Installation

### Dependencies

```bash
npm install laravel-echo pusher-js
```

### Environment Variables

Add the following to your `.env` file:

```env
# Laravel Reverb Configuration
VITE_REVERB_HOST=localhost
VITE_REVERB_PORT=8081
VITE_REVERB_APP_KEY=p8z4t7y2m9x6c1v5
VITE_REVERB_APP_SECRET=aK9sL3jH7gP5fD2rB8nV1cM0xZ4qW6eT
VITE_REVERB_APP_CLUSTER=mt1

# API Configuration
VITE_API_BASE_URL=http://localhost:9000
```

## Usage

### 1. Wrap Application with EchoProvider

```jsx
import { EchoProvider } from '@/components/EchoProvider';

function App() {
  return (
    <EchoProvider>
      {/* Your app components */}
    </EchoProvider>
  );
}
```

### 2. Use Echo Hook in Components

```jsx
import { useEcho } from '@/hooks/useEcho';

function MyComponent() {
  const {
    isConnected,
    users,
    subscribeToConversation,
    sendTypingIndicator,
    markMessageAsRead
  } = useEcho({
    onMessage: (data) => {
      console.log('New message:', data);
    },
    onTyping: (data) => {
      console.log('Typing indicator:', data);
    }
  });

  return (
    <div>
      Status: {isConnected ? 'Connected' : 'Disconnected'}
      Users online: {users.length}
    </div>
  );
}
```

### 3. Use Echo Context

```jsx
import { useEchoContext } from '@/components/EchoProvider';

function MyComponent() {
  const { isConnected, sendTypingIndicator } = useEchoContext();

  const handleTyping = () => {
    sendTypingIndicator('session-123', true);
  };

  return (
    <div>
      <EchoStatus showUsers={true} />
      <button onClick={handleTyping}>Start Typing</button>
    </div>
  );
}
```

## Channel Structure

### Organization Channels

- **Private Organization**: `private-organization.{organizationId}`
- **Presence Organization**: `presence-organization.{organizationId}`

### Inbox Channels

- **Private Inbox**: `private-inbox.{organizationId}`

### Conversation Channels

- **Private Conversation**: `private-conversation.{sessionId}`

## Events

### Message Events

- `MessageSent` - New message sent
- `MessageProcessed` - Message processed by system
- `MessageRead` - Message marked as read

### Session Events

- `SessionUpdated` - Session data updated
- `SessionAssigned` - Session assigned to agent
- `SessionTransferred` - Session transferred
- `SessionEnded` - Session ended

### Typing Events

- `TypingStart` - User started typing
- `TypingStop` - User stopped typing

### User Events

- `UserOnline` - User came online
- `UserOffline` - User went offline

## API Integration

### Authentication

Echo automatically handles authentication using the JWT token from localStorage:

```javascript
// Token is automatically retrieved from localStorage
const token = localStorage.getItem('jwt_token') || localStorage.getItem('sanctum_token');
```

### Broadcasting Auth Endpoint

The backend should provide a broadcasting auth endpoint:

```
POST /broadcasting/auth
Content-Type: application/x-www-form-urlencoded
Authorization: Bearer {token}

channel_name=private-organization.123&socket_id=abc123
```

## Backend Requirements

### Laravel Reverb Setup

1. Install Laravel Reverb:
```bash
composer require laravel/reverb
```

2. Publish configuration:
```bash
php artisan reverb:install
```

3. Configure environment variables:
```env
REVERB_APP_ID=app-key
REVERB_APP_KEY=p8z4t7y2m9x6c1v5
REVERB_APP_SECRET=aK9sL3jH7gP5fD2rB8nV1cM0xZ4qW6eT
REVERB_HOST="0.0.0.0"
REVERB_PORT=8081
REVERB_SCHEME=http

BROADCAST_CONNECTION=reverb
```

4. Start Reverb server:
```bash
php artisan reverb:start
```

### Event Broadcasting

Create events that implement `ShouldBroadcast`:

```php
<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MessageSent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public $message,
        public $sessionId
    ) {}

    public function broadcastOn()
    {
        return new PrivateChannel("conversation.{$this->sessionId}");
    }

    public function broadcastAs()
    {
        return 'MessageSent';
    }
}
```

## Testing

### Echo Test Component

Use the `EchoTest` component to test the integration:

```jsx
import EchoTest from '@/components/EchoTest';

function TestPage() {
  return (
    <EchoProvider>
      <EchoTest />
    </EchoProvider>
  );
}
```

### Manual Testing

1. Check connection status in browser console
2. Send test messages through the test component
3. Verify typing indicators work
4. Test reconnection by stopping/starting Reverb server

## Troubleshooting

### Common Issues

1. **Connection Failed**
   - Check Reverb server is running
   - Verify environment variables
   - Check firewall settings

2. **Authentication Failed**
   - Verify JWT token is valid
   - Check broadcasting auth endpoint
   - Ensure user has proper permissions

3. **Events Not Received**
   - Check channel subscription
   - Verify event names match
   - Check browser console for errors

### Debug Mode

Enable debug mode by setting:

```env
VITE_ENABLE_DEBUG_MODE=true
```

This will show detailed console logs for Echo events.

## Performance Considerations

1. **Connection Pooling**: Echo automatically manages connections
2. **Event Throttling**: Use throttling for high-frequency events
3. **Memory Management**: Properly unsubscribe from channels
4. **Reconnection**: Automatic reconnection with exponential backoff

## Security

1. **Private Channels**: All channels are private and require authentication
2. **Token Validation**: JWT tokens are validated on each connection
3. **Channel Authorization**: Backend validates channel access permissions
4. **Event Validation**: All events are validated before processing

## Migration from WebSocket

If migrating from the previous WebSocket implementation:

1. Replace `useWebSocket` with `useEcho`
2. Update event handlers to use new event names
3. Update channel subscription logic
4. Test all real-time features

## Support

For issues or questions:

1. Check the browser console for errors
2. Verify Reverb server logs
3. Test with the EchoTest component
4. Check network connectivity
