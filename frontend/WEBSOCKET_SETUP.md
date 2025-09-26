# WebSocket Setup untuk Laravel Reverb

Dokumentasi ini menjelaskan cara setup WebSocket connection untuk real-time messaging menggunakan Laravel Reverb.

## Environment Variables

Buat file `.env` di root directory frontend dengan konfigurasi berikut:

```env
# WebSocket Configuration for Laravel Reverb
REACT_APP_WEBSOCKET_HOST=localhost
REACT_APP_WEBSOCKET_PORT=8080
REACT_APP_WEBSOCKET_APP_KEY=app-key

# API Configuration
REACT_APP_API_URL=http://localhost:8000/api

# Application Configuration
REACT_APP_APP_NAME="Chatbot SaaS"
REACT_APP_APP_ENV=local
REACT_APP_DEBUG=true
```

## Konfigurasi Laravel Reverb

### 1. Install Laravel Reverb

```bash
composer require laravel/reverb
```

### 2. Publish Configuration

```bash
php artisan reverb:install
```

### 3. Environment Variables (Backend)

Tambahkan ke `.env` di backend Laravel:

```env
REVERB_APP_ID=app-key
REVERB_APP_KEY=app-key
REVERB_APP_SECRET=app-secret
REVERB_HOST="0.0.0.0"
REVERB_PORT=8080
REVERB_SCHEME=http

BROADCAST_CONNECTION=reverb
```

### 4. Start Reverb Server

```bash
php artisan reverb:start
```

## Komponen yang Sudah Diimplementasikan

### 1. ConversationDialog
- Dialog untuk menampilkan conversation detail
- Real-time message updates
- Typing indicators
- Message status tracking (sent, delivered, read)
- Transfer dan resolve session functionality

### 2. RealtimeMessageProvider
- Context provider untuk real-time messaging
- WebSocket connection management
- Message dan typing handler registration

### 3. useWebSocket Hook
- Custom hook untuk WebSocket connection
- Automatic reconnection
- Heartbeat mechanism
- Channel subscription management

### 4. WebSocket Configuration
- Centralized configuration di `src/config/websocket.js`
- Environment-based settings
- Channel name generation

## Cara Penggunaan

### 1. Wrap Application dengan Provider

```jsx
import RealtimeMessageProvider from '@/components/inbox/RealtimeMessageProvider';

function App() {
  return (
    <RealtimeMessageProvider>
      {/* Your app components */}
    </RealtimeMessageProvider>
  );
}
```

### 2. Gunakan ConversationDialog

```jsx
import ConversationDialog from '@/components/inbox/ConversationDialog';

function SessionManager() {
  const [selectedSession, setSelectedSession] = useState(null);
  const [showDialog, setShowDialog] = useState(false);

  return (
    <>
      {/* Your session list */}
      
      <ConversationDialog
        session={selectedSession}
        isOpen={showDialog}
        onClose={() => setShowDialog(false)}
        onSendMessage={(message) => console.log('Message sent:', message)}
        onAssignConversation={(session) => console.log('Assigned:', session)}
        onResolveConversation={(session, data) => console.log('Resolved:', session, data)}
        onTransferSession={(session, data) => console.log('Transferred:', session, data)}
      />
    </>
  );
}
```

### 3. Gunakan useRealtimeMessages Hook

```jsx
import { useRealtimeMessages } from '@/components/inbox/RealtimeMessageProvider';

function MyComponent() {
  const { 
    isConnected, 
    registerMessageHandler, 
    sendTyping 
  } = useRealtimeMessages();

  useEffect(() => {
    const unregister = registerMessageHandler('session-123', (data) => {
      console.log('New message:', data);
    });

    return unregister;
  }, [registerMessageHandler]);

  return (
    <div>
      Status: {isConnected ? 'Connected' : 'Disconnected'}
    </div>
  );
}
```

## Events yang Didukung

### 1. Message Events
- `MessageSent` - Pesan baru dikirim
- `MessageProcessed` - Pesan diproses
- `MessageRead` - Pesan dibaca

### 2. Typing Events
- `TypingIndicator` - Indikator typing

### 3. Connection Events
- `pusher:connection_established` - Koneksi berhasil
- `pusher:connection_failed` - Koneksi gagal
- `pusher:error` - Error WebSocket

## Channel Structure

### Organization Channel
```
private-organization.{organizationId}
```

### Inbox Channel
```
private-inbox.{organizationId}
```

### Conversation Channel
```
private-conversation.{sessionId}
```

## Troubleshooting

### 1. Connection Failed
- Pastikan Reverb server berjalan
- Check environment variables
- Verify firewall settings

### 2. Messages Not Received
- Check channel subscription
- Verify authentication token
- Check browser console for errors

### 3. Typing Indicators Not Working
- Ensure proper event handling
- Check message handler registration
- Verify WebSocket connection status

## Development Tips

1. Enable debug mode dengan `REACT_APP_DEBUG=true`
2. Check browser Network tab untuk WebSocket connection
3. Monitor Laravel logs untuk server-side issues
4. Use browser dev tools untuk debugging WebSocket messages
