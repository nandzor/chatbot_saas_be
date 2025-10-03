# Agent Inbox Integration Documentation

## Overview
This document describes the integration between the frontend Agent Inbox component and the backend API for real-time chat management.

## Architecture

### Frontend Components
- **AgentInbox.jsx**: Main component for agent interface
- **useAgentInbox.js**: Custom hook for state management and API calls
- **useAgentInboxOptimized.js**: Performance-optimized version with debouncing and throttling

### Backend APIs
- **InboxController**: Handles session and message operations
- **InboxService**: Business logic for inbox operations
- **MessageProcessed Event**: Real-time message broadcasting

## Features

### 1. Session Management
- **View Sessions**: Display active, pending, and ended sessions
- **Filter Sessions**: Search by customer name, company, email
- **Sort Sessions**: By priority, status, category
- **Assign Sessions**: Assign pending sessions to current agent

### 2. Real-time Messaging
- **Send Messages**: Send text messages to customers
- **Receive Messages**: Real-time message updates via WebSocket
- **Typing Indicators**: Show when agent is typing
- **Message Status**: Delivery and read receipts

### 3. Session Operations
- **Transfer Session**: Transfer to another agent
- **End Session**: Close session with summary
- **Internal Notes**: Add private notes for team
- **Quick Replies**: Pre-defined response templates

### 4. Context & Help
- **Customer Info**: View customer details and history
- **Knowledge Base**: Search help articles
- **Session History**: Previous interactions

## API Endpoints

### Sessions
```
GET /api/v1/inbox/sessions - List all sessions
GET /api/v1/inbox/sessions/active - Active sessions
GET /api/v1/inbox/sessions/pending - Pending sessions
GET /api/v1/inbox/sessions/{id} - Get session details
POST /api/v1/inbox/sessions/{id}/assign - Assign session
POST /api/v1/inbox/sessions/{id}/transfer - Transfer session
POST /api/v1/inbox/sessions/{id}/end - End session
```

### Messages
```
GET /api/v1/inbox/sessions/{id}/messages - Get session messages
POST /api/v1/inbox/sessions/{id}/messages - Send message
POST /api/v1/inbox/sessions/{sessionId}/messages/{messageId}/read - Mark as read
```

### Agents & Knowledge
```
GET /api/v1/inbox/agents - List available agents
GET /api/v1/inbox/bot-personalities - Knowledge base articles
GET /api/v1/inbox/sessions/{id}/analytics - Session analytics
```

## Real-time Events

### WebSocket Channels
- `organization.{organizationId}` - Organization-wide events
- `inbox.{organizationId}` - Inbox-specific events
- `conversation.{sessionId}` - Session-specific events

### Event Types
- `message.processed` - New message received
- `message.sent` - Message sent successfully
- `session.updated` - Session status changed
- `session.assigned` - Session assigned to agent
- `session.status_changed` - Session status updated

## State Management

### useAgentInbox Hook
```javascript
const {
  // State
  sessions,
  selectedSession,
  messages,
  loading,
  error,
  filters,
  pagination,
  isConnected,
  
  // Actions
  loadSessions,
  selectSession,
  sendMessage,
  transferSession,
  endSession,
  assignSession,
  updateFilters,
  refreshSessions,
  handleTyping
} = useAgentInbox();
```

### State Structure
```javascript
// Session object
{
  id: string,
  customer: {
    name: string,
    email: string,
    company: string,
    plan: string,
    avg_rating: number
  },
  status: 'active' | 'waiting' | 'pending' | 'ended',
  priority: 'high' | 'medium' | 'low',
  category: string,
  last_message: string,
  last_message_at: string,
  unread_count: number,
  tags: string[],
  internal_notes: string
}

// Message object
{
  id: string,
  session_id: string,
  sender_type: 'agent' | 'customer',
  sender_name: string,
  message_text: string,
  message_type: 'text' | 'image' | 'file',
  is_read: boolean,
  created_at: string,
  sent_at: string
}
```

## Performance Optimizations

### 1. Debouncing
- Search input debounced by 300ms
- Filter changes debounced by 300ms

### 2. Throttling
- API calls throttled to 1 second intervals
- Prevents excessive API requests

### 3. Memoization
- Filtered sessions memoized
- Prevents unnecessary re-renders

### 4. Optimistic Updates
- Messages appear immediately when sent
- Session updates applied optimistically
- Rollback on error

### 5. Pagination
- Messages loaded in pages of 50
- Sessions loaded in pages of 20
- Lazy loading for better performance

## Error Handling

### 1. API Errors
- Network errors caught and displayed
- Retry mechanism for failed requests
- Graceful degradation

### 2. Real-time Errors
- WebSocket connection status monitoring
- Automatic reconnection attempts
- Fallback to polling if WebSocket fails

### 3. User Feedback
- Loading states for all operations
- Error messages displayed to user
- Success confirmations

## Testing

### Unit Tests
```bash
npm test -- AgentInbox.test.js
```

### Manual Testing Checklist

#### Session Management
- [ ] Load sessions on page load
- [ ] Filter sessions by status
- [ ] Search sessions by customer name
- [ ] Assign pending sessions
- [ ] Transfer sessions to other agents
- [ ] End sessions with summary

#### Messaging
- [ ] Send text messages
- [ ] Receive real-time messages
- [ ] Typing indicators work
- [ ] Message status updates
- [ ] Quick replies functionality

#### Real-time Features
- [ ] WebSocket connection established
- [ ] Messages appear in real-time
- [ ] Session updates reflect immediately
- [ ] Connection status indicator

#### Performance
- [ ] Search debouncing works
- [ ] API throttling prevents spam
- [ ] Large message lists scroll smoothly
- [ ] No memory leaks on component unmount

## Troubleshooting

### Common Issues

#### 1. Messages Not Appearing
- Check WebSocket connection status
- Verify session ID matches
- Check browser console for errors
- Ensure message event types are correct

#### 2. Slow Performance
- Check for excessive API calls
- Verify debouncing is working
- Check for memory leaks
- Monitor network tab for duplicate requests

#### 3. Session Not Updating
- Verify real-time events are firing
- Check session ID in event data
- Ensure proper event handling
- Check for race conditions

### Debug Mode
Enable debug logging by setting:
```javascript
localStorage.setItem('debug', 'agent-inbox:*');
```

## Security Considerations

### 1. Authentication
- All API calls require valid JWT token
- Token refreshed automatically
- Logout on token expiration

### 2. Authorization
- Agent can only see assigned sessions
- Organization-level data isolation
- Permission-based feature access

### 3. Data Validation
- Input sanitization on frontend
- Server-side validation
- XSS protection

## Future Enhancements

### 1. Features
- File upload support
- Voice messages
- Screen sharing
- Video calls
- Advanced analytics

### 2. Performance
- Virtual scrolling for large lists
- Service worker for offline support
- Caching strategies
- CDN integration

### 3. UX Improvements
- Keyboard shortcuts
- Drag and drop
- Customizable interface
- Dark mode support
