# RAG Workflow API Reference

## Overview

RAG (Retrieval-Augmented Generation) workflow API terintegrasi dengan Bot Personality API. Tidak ada endpoint terpisah untuk RAG - semua operasi dilakukan melalui Bot Personality endpoints dengan payload JSON.

## Base URL
```
https://your-domain.com/api
```

## Authentication
Semua endpoints memerlukan JWT authentication dengan header:
```
Authorization: Bearer {jwt_token}
```

## Bot Personality API dengan RAG Integration

### Create Bot Personality dengan RAG

**Endpoint:** `POST /bot-personalities`

**Description:** Membuat bot personality baru dengan RAG workflow integration

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {jwt_token}
```

**Request Body:**
```json
{
  "name": "Sales Assistant",
  "display_name": "Sales Bot",
  "description": "AI assistant for sales team",
  "system_message": "You are a helpful sales assistant...",
  "ai_model_id": "gpt-4",
  "max_response_length": 500,
  "response_delay_ms": 1000,
  "confidence_threshold": 0.7,
  "communication_style": "professional",
  "language": "en",
  "personality_traits": ["helpful", "knowledgeable"],
  "color_scheme": {
    "primary": "#3B82F6",
    "secondary": "#10B981"
  },
  "status": "active",
  
  // RAG Integration Fields
  "rag_files": [
    {
      "id": "1ABC123def456GHI789jkl012MNO345pqr678STU901vwx234YZA567bcd890EFG123hij456KLM789nop012PQR345stu678VWX901yz",
      "name": "Sales Data Q4 2024",
      "mimeType": "application/vnd.google-apps.spreadsheet",
      "type": "google-sheets",
      "webViewLink": "https://docs.google.com/spreadsheets/d/1ABC123.../edit",
      "modifiedTime": "2024-01-02T10:30:00.000Z",
      "size": "245KB"
    },
    {
      "id": "2DEF456ghi789JKL012mno345PQR678stu901VWX234yza567BCD890efg123HIJ456klm789NOP012pqr345STU678vwx901YZA234bcd567EFG890hij123KLM456nop789PQR012stu345VWX678yz",
      "name": "Product Catalog 2024",
      "mimeType": "application/vnd.google-apps.document",
      "type": "google-docs",
      "webViewLink": "https://docs.google.com/document/d/2DEF456.../edit",
      "modifiedTime": "2024-01-01T15:45:00.000Z",
      "size": "1.2MB"
    },
    {
      "id": "3GHI789jkl012MNO345pqr678STU901vwx234YZA567bcd890EFG123hij456KLM789nop012PQR345stu678VWX901yz",
      "name": "Company Policies",
      "mimeType": "application/pdf",
      "type": "pdf",
      "webViewLink": "https://drive.google.com/file/d/3GHI789.../view",
      "modifiedTime": "2023-12-15T09:20:00.000Z",
      "size": "856KB"
    }
  ],
  
  // RAG Settings (Optional)
  "rag_settings": {
    "chunkSize": 1000,
    "chunkOverlap": 200,
    "embeddingModel": "text-embedding-ada-002",
    "vectorStore": "chroma",
    "similarityThreshold": 0.7,
    "maxResults": 5,
    "includeMetadata": true,
    "autoProcess": true,
    "syncInterval": 300
  }
}
```

**Response Success (201):**
```json
{
  "success": true,
  "message": "Bot personality created successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Sales Assistant",
    "display_name": "Sales Bot",
    "description": "AI assistant for sales team",
    "system_message": "You are a helpful sales assistant...",
    "ai_model_id": "gpt-4",
    "max_response_length": 500,
    "response_delay_ms": 1000,
    "confidence_threshold": 0.7,
    "communication_style": "professional",
    "language": "en",
    "personality_traits": ["helpful", "knowledgeable"],
    "color_scheme": {
      "primary": "#3B82F6",
      "secondary": "#10B981"
    },
    "status": "active",
    "organization_id": "6a9f9f22-ef84-4375-a793-dd1af45ccdc0",
    "created_by": "user-123",
    "updated_by": "user-123",
    "created_at": "2024-01-02T12:00:00.000Z",
    "updated_at": "2024-01-02T12:00:00.000Z",
    
    // RAG Integration Response
    "rag_settings": {
      "enabled": true,
      "workflowId": "n8n-workflow-456789",
      "sources": [
        {
          "id": "1ABC123...",
          "name": "Sales Data Q4 2024",
          "type": "google-sheets"
        },
        {
          "id": "2DEF456...",
          "name": "Product Catalog 2024",
          "type": "google-docs"
        },
        {
          "id": "3GHI789...",
          "name": "Company Policies",
          "type": "pdf"
        }
      ],
      "lastUpdated": "2024-01-02T12:00:00.000Z"
    },
    
    // RAG Workflow Information
    "rag_workflow": {
      "workflowId": "n8n-workflow-456789",
      "name": "RAG_Google_Drive_Workflow_6a9f9f22-ef84-4375-a793-dd1af45ccdc0",
      "status": "active",
      "documentCount": 3,
      "config": {
        "syncInterval": 300,
        "includeMetadata": true,
        "autoProcess": true,
        "notificationEnabled": true
      },
      "ragSettings": {
        "chunkSize": 1000,
        "chunkOverlap": 200,
        "embeddingModel": "text-embedding-ada-002",
        "vectorStore": "chroma",
        "similarityThreshold": 0.7,
        "maxResults": 5
      }
    }
  }
}
```

**Response Error (400):**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "name": ["Name is required"],
    "rag_files.0.id": ["File ID is required"],
    "rag_files.0.name": ["File name is required"]
  }
}
```

**Response Error (500):**
```json
{
  "success": false,
  "message": "Failed to create RAG workflow: N8N connection timeout",
  "error": "Failed to create RAG workflow: N8N connection timeout"
}
```

### Update Bot Personality dengan RAG

**Endpoint:** `PUT /bot-personalities/{id}`

**Description:** Update bot personality dengan RAG workflow changes

**Path Parameters:**
- `id` (string, required): Bot personality ID

**Request Body:**
```json
{
  "name": "Updated Sales Assistant",
  "description": "Enhanced AI assistant for sales team",
  
  // Update RAG files
  "rag_files": [
    {
      "id": "4JKL012mno345PQR678stu901VWX234yza567BCD890efg123HIJ456klm789NOP012pqr345STU678vwx901YZA234bcd567EFG890hij123KLM456nop789PQR012stu345VWX678yz",
      "name": "Updated Sales Data Q1 2025",
      "mimeType": "application/vnd.google-apps.spreadsheet",
      "type": "google-sheets",
      "webViewLink": "https://docs.google.com/spreadsheets/d/4JKL012.../edit",
      "modifiedTime": "2024-01-15T14:20:00.000Z",
      "size": "312KB"
    }
  ],
  
  // Update RAG settings
  "rag_settings": {
    "chunkSize": 1500,
    "similarityThreshold": 0.8,
    "maxResults": 7
  }
}
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Bot personality updated successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Updated Sales Assistant",
    "description": "Enhanced AI assistant for sales team",
    "updated_at": "2024-01-15T14:20:00.000Z",
    
    "rag_settings": {
      "enabled": true,
      "workflowId": "n8n-workflow-456789",
      "sources": [
        {
          "id": "4JKL012...",
          "name": "Updated Sales Data Q1 2025",
          "type": "google-sheets"
        }
      ],
      "lastUpdated": "2024-01-15T14:20:00.000Z"
    },
    
    "rag_workflow": {
      "workflowId": "n8n-workflow-456789",
      "status": "active",
      "documentCount": 1,
      "ragSettings": {
        "chunkSize": 1500,
        "similarityThreshold": 0.8,
        "maxResults": 7
      }
    }
  }
}
```

### Disable RAG untuk Bot Personality

**Endpoint:** `PUT /bot-personalities/{id}`

**Description:** Disable RAG dengan mengirim empty array untuk rag_files

**Request Body:**
```json
{
  "name": "Sales Assistant",
  "rag_files": []
}
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Bot personality updated successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "rag_settings": {
      "enabled": false,
      "sources": [],
      "workflowId": null,
      "lastUpdated": "2024-01-15T14:20:00.000Z"
    }
  }
}
```

### Get Bot Personality dengan RAG Status

**Endpoint:** `GET /bot-personalities/{id}`

**Description:** Get bot personality details termasuk RAG status

**Response Success (200):**
```json
{
  "success": true,
  "message": "Bot personality retrieved successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Sales Assistant",
    "display_name": "Sales Bot",
    "description": "AI assistant for sales team",
    "system_message": "You are a helpful sales assistant...",
    "status": "active",
    "created_at": "2024-01-02T12:00:00.000Z",
    "updated_at": "2024-01-15T14:20:00.000Z",
    
    "rag_settings": {
      "enabled": true,
      "workflowId": "n8n-workflow-456789",
      "sources": [
        {
          "id": "4JKL012...",
          "name": "Updated Sales Data Q1 2025",
          "type": "google-sheets"
        }
      ],
      "lastUpdated": "2024-01-15T14:20:00.000Z"
    },
    
    "rag_workflow_status": {
      "workflowId": "n8n-workflow-456789",
      "status": "active",
      "documentCount": 1,
      "lastProcessedAt": "2024-01-15T14:20:00.000Z",
      "totalChunks": 45,
      "lastQueryAt": "2024-01-15T16:30:00.000Z",
      "queryCount": 23
    }
  }
}
```

## RAG File Object Structure

### File Object Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `id` | string | Yes | Google Drive file ID |
| `name` | string | Yes | File name |
| `mimeType` | string | Yes | MIME type of the file |
| `type` | string | Yes | File type (`google-sheets`, `google-docs`, `pdf`) |
| `webViewLink` | string | No | Direct link to view file in Google Drive |
| `modifiedTime` | string | No | Last modified timestamp (ISO 8601) |
| `size` | string | No | File size in human-readable format |

### Supported File Types

| File Type | MIME Type | Description |
|-----------|-----------|-------------|
| `google-sheets` | `application/vnd.google-apps.spreadsheet` | Google Sheets spreadsheet |
| `google-docs` | `application/vnd.google-apps.document` | Google Docs document |
| `pdf` | `application/pdf` | PDF document |

## RAG Settings Object Structure

### RAG Settings Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `chunkSize` | integer | 1000 | Size of text chunks in characters |
| `chunkOverlap` | integer | 200 | Overlap between chunks in characters |
| `embeddingModel` | string | `text-embedding-ada-002` | OpenAI embedding model |
| `vectorStore` | string | `chroma` | Vector database type |
| `similarityThreshold` | float | 0.7 | Minimum similarity score for results |
| `maxResults` | integer | 5 | Maximum number of results to return |
| `includeMetadata` | boolean | true | Include file metadata in results |
| `autoProcess` | boolean | true | Automatically process file changes |
| `syncInterval` | integer | 300 | Sync interval in seconds |

### Available Embedding Models

| Model | Dimensions | Description |
|-------|------------|-------------|
| `text-embedding-ada-002` | 1536 | Default model, good balance of speed and quality |
| `text-embedding-3-small` | 1536 | Faster and cheaper than ada-002 |
| `text-embedding-3-large` | 3072 | Higher quality, more expensive |

## Error Codes

### HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created successfully |
| 400 | Bad request - validation error |
| 401 | Unauthorized - invalid or missing token |
| 403 | Forbidden - insufficient permissions |
| 404 | Not found - bot personality not found |
| 422 | Unprocessable entity - RAG workflow creation failed |
| 500 | Internal server error |

### Error Response Format

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message",
  "code": "ERROR_CODE",
  "details": {
    "field": "Additional error details"
  }
}
```

### Common Error Codes

| Code | Description |
|------|-------------|
| `RAG_WORKFLOW_CREATION_FAILED` | Failed to create N8N workflow |
| `OAUTH_CREDENTIAL_MISSING` | Google Drive OAuth credential not found |
| `FILE_ACCESS_DENIED` | No access to specified Google Drive files |
| `N8N_CONNECTION_FAILED` | Cannot connect to N8N instance |
| `EMBEDDING_GENERATION_FAILED` | Failed to generate embeddings |
| `VECTOR_STORE_ERROR` | Vector database operation failed |

## Rate Limits

| Endpoint | Limit | Window |
|----------|-------|--------|
| Create Bot Personality | 10 requests | 1 minute |
| Update Bot Personality | 20 requests | 1 minute |
| Get Bot Personality | 100 requests | 1 minute |

## Examples

### Create Bot Personality dengan Multiple Files

```bash
curl -X POST "https://your-domain.com/api/bot-personalities" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-jwt-token" \
  -d '{
    "name": "Customer Support Bot",
    "display_name": "Support Assistant",
    "description": "AI assistant for customer support",
    "system_message": "You are a helpful customer support assistant...",
    "rag_files": [
      {
        "id": "1ABC123...",
        "name": "FAQ Document",
        "mimeType": "application/vnd.google-apps.document",
        "type": "google-docs"
      },
      {
        "id": "2DEF456...",
        "name": "Product Manual",
        "mimeType": "application/pdf",
        "type": "pdf"
      }
    ],
    "rag_settings": {
      "chunkSize": 800,
      "similarityThreshold": 0.75,
      "maxResults": 3
    }
  }'
```

### Update RAG Files

```bash
curl -X PUT "https://your-domain.com/api/bot-personalities/550e8400-e29b-41d4-a716-446655440000" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-jwt-token" \
  -d '{
    "rag_files": [
      {
        "id": "3GHI789...",
        "name": "Updated FAQ",
        "mimeType": "application/vnd.google-apps.document",
        "type": "google-docs"
      }
    ]
  }'
```

### Disable RAG

```bash
curl -X PUT "https://your-domain.com/api/bot-personalities/550e8400-e29b-41d4-a716-446655440000" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-jwt-token" \
  -d '{
    "rag_files": []
  }'
```

## Webhooks

### RAG Workflow Webhooks

N8N workflow mengirim webhook notifications untuk file changes:

**Webhook URL:** `{your-domain}/api/webhooks/rag-file-update`

**Webhook Payload:**
```json
{
  "fileId": "1ABC123...",
  "fileName": "Sales Data Q4 2024",
  "fileType": "google-sheets",
  "changeType": "modified",
  "timestamp": "2024-01-15T14:20:00.000Z",
  "organizationId": "6a9f9f22-ef84-4375-a793-dd1af45ccdc0",
  "botPersonalityId": "550e8400-e29b-41d4-a716-446655440000"
}
```

## Testing

### Test RAG Integration

```bash
# Test bot personality creation dengan RAG
curl -X POST "https://your-domain.com/api/bot-personalities" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-jwt-token" \
  -d '{
    "name": "Test Bot",
    "display_name": "Test Assistant",
    "description": "Test bot for RAG integration",
    "system_message": "You are a test assistant...",
    "rag_files": [
      {
        "id": "test-file-123",
        "name": "Test Document",
        "mimeType": "application/vnd.google-apps.document",
        "type": "google-docs"
      }
    ]
  }'
```

### Validate RAG Settings

```bash
# Test dengan invalid RAG settings
curl -X POST "https://your-domain.com/api/bot-personalities" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-jwt-token" \
  -d '{
    "name": "Test Bot",
    "rag_files": [
      {
        "id": "test-file-123",
        "name": "Test Document",
        "type": "google-docs"
      }
    ],
    "rag_settings": {
      "chunkSize": -100,
      "similarityThreshold": 2.0
    }
  }'
```
