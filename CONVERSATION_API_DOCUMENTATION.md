# Conversation API Documentation

## Overview

The Conversation API provides comprehensive endpoints for managing chat sessions, messages, and real-time communication features. This API is designed to support WhatsApp-like inbox functionality with professional chat management capabilities.

## Base URL

```
/api/conversations
```

## Authentication

All endpoints require authentication using the `auth:api` middleware and organization access validation.

## Endpoints

### 1. Get Conversation Details

**GET** `/conversations/{sessionId}`

Retrieves detailed information about a specific conversation including customer, agent, and message data.

**Response:**
```json
{
  "success": true,
  "message": "Conversation retrieved successfully",
  "data": {
    "id": "uuid",
    "organization_id": "uuid",
    "customer": {
      "id": "uuid",
      "name": "John Doe",
      "phone": "+1234567890",
      "email": "john@example.com",
      "avatar_url": "https://example.com/avatar.jpg"
    },
    "agent": {
      "id": "uuid",
      "name": "Agent Smith",
      "email": "agent@example.com",
      "avatar_url": "https://example.com/agent.jpg",
      "status": "active"
    },
    "session_info": {
      "session_token": "uuid",
      "session_type": "customer",
      "started_at": "2024-01-15T10:30:00Z",
      "ended_at": null,
      "last_activity_at": "2024-01-15T14:30:00Z",
      "is_active": true,
      "is_bot_session": false,
      "is_resolved": false
    },
    "statistics": {
      "total_messages": 15,
      "customer_messages": 8,
      "bot_messages": 5,
      "agent_messages": 2,
      "response_time_avg": 120,
      "resolution_time": null
    },
    "classification": {
      "intent": "billing_support",
      "category": "support",
      "subcategory": "billing",
      "priority": "high",
      "tags": ["urgent", "billing"]
    },
    "ai_analysis": {
      "sentiment_analysis": {
        "label": "neutral",
        "score": 0.2
      },
      "ai_summary": "Customer inquiry about billing issue",
      "topics_discussed": ["billing", "payment", "refund"]
    },
    "messages": [...],
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T14:30:00Z"
  }
}
```

### 2. Get Session Messages

**GET** `/conversations/{sessionId}/messages`

Retrieves messages for a specific session with pagination support.

**Query Parameters:**
- `per_page` (optional): Number of messages per page (default: 50)
- `page` (optional): Page number (default: 1)
- `sort_by` (optional): Sort field (default: created_at)
- `sort_direction` (optional): Sort direction (asc/desc, default: asc)

**Response:**
```json
{
  "success": true,
  "message": "Messages retrieved successfully",
  "data": {
    "messages": [
      {
        "id": "uuid",
        "session_id": "uuid",
        "sender": {
          "type": "customer",
          "id": "uuid",
          "name": "John Doe"
        },
        "content": {
          "text": "I need help with my billing",
          "type": "text",
          "media_url": null,
          "media_type": null,
          "media_size": null
        },
        "status": {
          "is_read": true,
          "read_at": "2024-01-15T10:35:00Z",
          "delivered_at": "2024-01-15T10:30:00Z",
          "failed_at": null
        },
        "ai_analysis": {
          "intent": "billing_support",
          "confidence_score": 0.95,
          "sentiment_score": 0.2,
          "sentiment_label": "neutral",
          "ai_generated": false
        },
        "metadata": {},
        "created_at": "2024-01-15T10:30:00Z"
      }
    ],
    "pagination": {
      "current_page": 1,
      "last_page": 3,
      "per_page": 50,
      "total": 150,
      "from": 1,
      "to": 50
    }
  }
}
```

### 3. Send Message

**POST** `/conversations/{sessionId}/messages`

Sends a new message in the conversation.

**Request Body:**
```json
{
  "message_text": "Hello, how can I help you?",
  "message_type": "text",
  "sender_type": "agent",
  "sender_id": "uuid",
  "sender_name": "Agent Smith",
  "media_url": null,
  "media_type": null,
  "media_size": null,
  "thumbnail_url": null,
  "quick_replies": null,
  "buttons": null,
  "template_data": null,
  "reply_to_message_id": null,
  "metadata": {}
}
```

**Response:**
```json
{
  "success": true,
  "message": "Message sent successfully",
  "data": {
    "id": "uuid",
    "session_id": "uuid",
    "sender": {
      "type": "agent",
      "id": "uuid",
      "name": "Agent Smith"
    },
    "content": {
      "text": "Hello, how can I help you?",
      "type": "text",
      "media_url": null,
      "media_type": null,
      "media_size": null
    },
    "status": {
      "is_read": false,
      "read_at": null,
      "delivered_at": null,
      "failed_at": null
    },
    "ai_analysis": {
      "intent": null,
      "confidence_score": null,
      "sentiment_score": null,
      "sentiment_label": null,
      "ai_generated": false
    },
    "metadata": {},
    "created_at": "2024-01-15T14:30:00Z"
  }
}
```

### 4. Update Session

**PUT** `/conversations/{sessionId}`

Updates session details like priority, category, tags, etc.

**Request Body:**
```json
{
  "priority": "high",
  "category": "support",
  "subcategory": "billing",
  "tags": ["urgent", "billing"],
  "intent": "billing_support",
  "sentiment_analysis": {
    "label": "neutral",
    "score": 0.2
  },
  "ai_summary": "Customer inquiry about billing issue",
  "topics_discussed": ["billing", "payment"],
  "metadata": {}
}
```

### 5. Assign Session to Current User

**POST** `/conversations/{sessionId}/assign`

Assigns the session to the currently authenticated user.

**Response:**
```json
{
  "success": true,
  "message": "Session assigned successfully",
  "data": {
    // Updated conversation data
  }
}
```

### 6. Transfer Session

**POST** `/conversations/{sessionId}/transfer`

Transfers the session to another agent.

**Request Body:**
```json
{
  "agent_id": "uuid",
  "reason": "Specialized support needed",
  "notes": "Customer needs billing specialist",
  "priority": "high",
  "notify_agent": true
}
```

### 7. Resolve Session

**POST** `/conversations/{sessionId}/resolve`

Resolves/ends the session.

**Request Body:**
```json
{
  "resolution_type": "resolved",
  "resolution_notes": "Issue resolved successfully",
  "satisfaction_rating": 5,
  "feedback_text": "Great service!",
  "feedback_tags": ["helpful", "quick"],
  "follow_up_required": false,
  "follow_up_date": null,
  "escalation_reason": null
}
```

### 8. Get Session Analytics

**GET** `/conversations/{sessionId}/analytics`

Retrieves analytics data for the session.

**Response:**
```json
{
  "success": true,
  "message": "Analytics retrieved successfully",
  "data": {
    "session_id": "uuid",
    "total_messages": 15,
    "customer_messages": 8,
    "bot_messages": 5,
    "agent_messages": 2,
    "session_duration": 240,
    "wait_time": 30,
    "response_time_avg": 120,
    "satisfaction_rating": 5,
    "sentiment_analysis": {
      "label": "positive",
      "score": 0.8
    },
    "topics_discussed": ["billing", "payment", "refund"],
    "is_resolved": true,
    "resolution_type": "resolved",
    "created_at": "2024-01-15T10:30:00Z",
    "last_activity_at": "2024-01-15T14:30:00Z",
    "resolved_at": "2024-01-15T14:30:00Z"
  }
}
```

### 9. Mark Messages as Read

**POST** `/conversations/{sessionId}/mark-read`

Marks messages as read.

**Request Body:**
```json
{
  "message_ids": ["uuid1", "uuid2"]
}
```

### 10. Get Typing Status

**GET** `/conversations/{sessionId}/typing`

Gets current typing indicators for the session.

**Response:**
```json
{
  "success": true,
  "message": "Typing status retrieved successfully",
  "data": {
    "typing_users": [
      {
        "user_id": "uuid",
        "user_name": "Agent Smith",
        "started_at": "2024-01-15T14:30:00Z"
      }
    ]
  }
}
```

### 11. Send Typing Indicator

**POST** `/conversations/{sessionId}/typing`

Sends typing indicator.

**Request Body:**
```json
{
  "is_typing": true
}
```

## Real-time Events

The API integrates with Laravel Reverb for real-time communication:

### Message Events

- **MessageProcessed**: Fired when a message is sent
- **MessageReadEvent**: Fired when messages are marked as read
- **TypingIndicatorEvent**: Fired when typing indicators are sent

### WebSocket Channels

- `organization.{organizationId}`: Organization-wide events
- `inbox.{organizationId}`: Inbox-specific events
- `conversation.{sessionId}`: Session-specific events

## Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "error_code": "ERROR_CODE",
  "errors": {
    "field": ["Validation error message"]
  },
  "timestamp": "2024-01-15T14:30:00Z",
  "request_id": "req_1234567890_abcdef12"
}
```

## Frontend Integration

### Service Usage

```javascript
import conversationService from '@/services/conversationService';

// Get conversation
const conversation = await conversationService.getConversation(sessionId);

// Send message
const message = await conversationService.sendMessage(sessionId, {
  message_text: 'Hello!',
  message_type: 'text',
  sender_type: 'agent'
});

// Transfer session
await conversationService.transferSession(sessionId, {
  agent_id: 'uuid',
  reason: 'Specialized support needed'
});
```

### Hook Usage

```javascript
import { useConversation } from '@/hooks/useConversation';

const {
  conversation,
  messages,
  loading,
  error,
  sendMessage,
  transferSession,
  resolveSession
} = useConversation(sessionId);
```

## Components

### ProfessionalInbox
Main inbox component that combines conversation list and chat window.

### ProfessionalConversationList
Displays list of conversations with filtering and search capabilities.

### ProfessionalChatWindow
Chat interface with real-time messaging, typing indicators, and message status.

## Security

- All endpoints require authentication
- Organization access validation
- Input validation and sanitization
- Rate limiting on message sending
- WebSocket authentication

## Rate Limits

- Message sending: 60 messages per minute per user
- Typing indicators: 10 per minute per user
- API calls: 1000 per hour per user
