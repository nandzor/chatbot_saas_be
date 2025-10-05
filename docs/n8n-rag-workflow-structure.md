# N8N RAG Workflow Structure

## Overview

N8N workflow untuk RAG (Retrieval-Augmented Generation) terintegrasi dengan Google Drive files. Workflow ini secara otomatis dibuat ketika bot personality dibuat dengan RAG files.

## Workflow Architecture

```
Google Drive File Change
    ↓
Webhook Trigger
    ↓
File Processor
    ↓
Text Chunker
    ↓
Embedding Generator
    ↓
Vector Store
    ↓
Database Update
```

## Workflow Nodes Detail

### 1. Webhook Trigger Node

**Node Type:** `n8n-nodes-base.webhook`

**Configuration:**
```json
{
  "id": "webhook_trigger",
  "type": "n8n-nodes-base.webhook",
  "parameters": {
    "httpMethod": "POST",
    "path": "rag-file-update",
    "responseMode": "responseNode",
    "options": {
      "noResponseBody": false
    }
  },
  "webhookId": "rag-file-update-webhook"
}
```

**Purpose:** 
- Menerima webhook dari Google Drive ketika ada file changes
- Trigger workflow execution

**Input:** Google Drive webhook payload
**Output:** File change data

### 2. Google Drive Monitor Nodes

**Node Type:** `@n8n/n8n-nodes-base.googleDriveTrigger`

**Configuration (per file):**
```json
{
  "id": "google_drive_monitor_{index}",
  "type": "@n8n/n8n-nodes-base.googleDriveTrigger",
  "parameters": {
    "authentication": "oAuth2",
    "operation": "watch",
    "fileId": "{{ $json.fileId }}",
    "eventTypes": ["change", "delete"],
    "includeRemoved": true
  },
  "credentials": {
    "googleDriveOAuth2Api": {
      "id": "{{ $credentials.googleDriveOAuth2Api.id }}",
      "name": "Google Drive OAuth"
    }
  }
}
```

**Purpose:**
- Monitor perubahan file Google Drive
- Trigger untuk setiap file yang dipilih
- Event types: change, delete

**Input:** File ID dari selected files
**Output:** File change events

### 3. File Processor Node

**Node Type:** `n8n-nodes-base.function`

**Configuration:**
```json
{
  "id": "file_processor",
  "type": "n8n-nodes-base.function",
  "parameters": {
    "functionCode": "// File Processor Code\nconst items = $input.all();\nconst processedItems = items.map(item => {\n  const data = item.json;\n  const fileContent = data.fileContent;\n  const metadata = {\n    fileId: data.fileId,\n    fileName: data.fileName,\n    mimeType: data.mimeType,\n    source: 'Google Drive',\n    processedAt: new Date().toISOString(),\n    organizationId: data.organizationId,\n    botPersonalityId: data.botPersonalityId\n  };\n\n  return {\n    json: {\n      content: fileContent,\n      metadata: metadata,\n      fileId: data.fileId,\n      fileName: data.fileName,\n      mimeType: data.mimeType\n    }\n  };\n});\n\nreturn processedItems;"
  }
}
```

**Purpose:**
- Process file content dari Google Drive
- Extract text dari Google Docs/Sheets
- Handle PDF files
- Add metadata

**Input:** File change data
**Output:** Processed file content dengan metadata

### 4. Text Chunker Node

**Node Type:** `n8n-nodes-base.function`

**Configuration:**
```json
{
  "id": "text_chunker",
  "type": "n8n-nodes-base.function",
  "parameters": {
    "functionCode": "// Text Chunker Code\nconst items = $input.all();\nconst chunkSize = {{ $json.chunkSize || 1000 }};\nconst chunkOverlap = {{ $json.chunkOverlap || 200 }};\n\nconst processedItems = items.map(item => {\n  const content = item.json.content;\n  const metadata = item.json.metadata;\n  \n  // Split text into chunks\n  const chunks = [];\n  let start = 0;\n  \n  while (start < content.length) {\n    const end = Math.min(start + chunkSize, content.length);\n    const chunk = content.slice(start, end);\n    \n    chunks.push({\n      text: chunk,\n      metadata: {\n        ...metadata,\n        chunkIndex: chunks.length,\n        chunkStart: start,\n        chunkEnd: end\n      }\n    });\n    \n    start = end - chunkOverlap;\n    if (start >= content.length) break;\n  }\n  \n  return chunks.map(chunk => ({ json: chunk }));\n}).flat();\n\nreturn processedItems;"
  }
}
```

**Purpose:**
- Split text menjadi chunks
- Configurable chunk size dan overlap
- Preserve context antar chunks

**Input:** Processed file content
**Output:** Text chunks dengan metadata

### 5. Embedding Generator Node

**Node Type:** `n8n-nodes-base.openAi`

**Configuration:**
```json
{
  "id": "embedding_generator",
  "type": "n8n-nodes-base.openAi",
  "parameters": {
    "resource": "embedding",
    "operation": "create",
    "model": "{{ $json.embeddingModel || 'text-embedding-ada-002' }}",
    "input": "{{ $json.text }}"
  },
  "credentials": {
    "openAiApi": {
      "id": "{{ $credentials.openAiApi.id }}",
      "name": "OpenAI API"
    }
  }
}
```

**Purpose:**
- Generate embeddings untuk setiap chunk
- Menggunakan OpenAI embedding models
- Configurable model selection

**Input:** Text chunks
**Output:** Embeddings dengan metadata

### 6. Vector Store Node

**Node Type:** `n8n-nodes-base.chroma`

**Configuration:**
```json
{
  "id": "vector_store",
  "type": "n8n-nodes-base.chroma",
  "parameters": {
    "operation": "upsert",
    "collection": "rag_documents",
    "documents": "{{ $json.text }}",
    "embeddings": "{{ $json.embedding }}",
    "metadatas": "{{ $json.metadata }}",
    "ids": "{{ $json.metadata.fileId }}_{{ $json.metadata.chunkIndex }}"
  },
  "credentials": {
    "chromaApi": {
      "id": "{{ $credentials.chromaApi.id }}",
      "name": "ChromaDB API"
    }
  }
}
```

**Purpose:**
- Store embeddings di ChromaDB
- Collection: rag_documents
- Metadata preservation

**Input:** Embeddings dengan metadata
**Output:** Stored vectors

### 7. Database Update Node

**Node Type:** `n8n-nodes-base.postgres`

**Configuration:**
```json
{
  "id": "database_update",
  "type": "n8n-nodes-base.postgres",
  "parameters": {
    "operation": "executeQuery",
    "query": "INSERT INTO rag_chunks (id, document_id, chunk_index, content, embedding, metadata) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (document_id, chunk_index) DO UPDATE SET content = $4, embedding = $5, metadata = $6, updated_at = CURRENT_TIMESTAMP",
    "additionalFields": {
      "queryParams": "{{ $json.metadata.fileId }}_{{ $json.metadata.chunkIndex }}, {{ $json.metadata.fileId }}, {{ $json.metadata.chunkIndex }}, {{ $json.text }}, {{ $json.embedding }}, {{ JSON.stringify($json.metadata) }}"
    }
  },
  "credentials": {
    "postgres": {
      "id": "{{ $credentials.postgres.id }}",
      "name": "PostgreSQL"
    }
  }
}
```

**Purpose:**
- Update database dengan chunk data
- Store embeddings di PostgreSQL
- Handle conflicts

**Input:** Processed chunks dengan embeddings
**Output:** Database update confirmation

### 8. Webhook Response Node

**Node Type:** `n8n-nodes-base.webhook`

**Configuration:**
```json
{
  "id": "webhook_response",
  "type": "n8n-nodes-base.webhook",
  "parameters": {
    "httpMethod": "POST",
    "path": "rag-processing-complete",
    "responseMode": "responseNode",
    "options": {
      "responseBody": "{\n  \"success\": true,\n  \"message\": \"RAG processing completed\",\n  \"data\": {\n    \"fileId\": \"{{ $json.metadata.fileId }}\",\n    \"fileName\": \"{{ $json.metadata.fileName }}\",\n    \"chunkCount\": {{ $json.metadata.chunkCount }},\n    \"processedAt\": \"{{ $json.metadata.processedAt }}\"\n  }\n}"
    }
  }
}
```

**Purpose:**
- Send response setelah processing selesai
- Confirm successful processing

**Input:** Final processed data
**Output:** Success response

## Workflow Connections

```json
{
  "connections": {
    "webhook_trigger": {
      "main": [["file_processor"]]
    },
    "google_drive_monitor_0": {
      "main": [["file_processor"]]
    },
    "google_drive_monitor_1": {
      "main": [["file_processor"]]
    },
    "file_processor": {
      "main": [["text_chunker"]]
    },
    "text_chunker": {
      "main": [["embedding_generator"]]
    },
    "embedding_generator": {
      "main": [["vector_store"]]
    },
    "vector_store": {
      "main": [["database_update"]]
    },
    "database_update": {
      "main": [["webhook_response"]]
    }
  }
}
```

## Workflow Settings

```json
{
  "settings": {
    "executionOrder": "v1",
    "saveManualExecutions": true,
    "callerPolicy": "workflowsFromSameOwner",
    "errorWorkflow": "error-handler-workflow",
    "timezone": "UTC"
  }
}
```

## Credentials Required

### 1. Google Drive OAuth2 API
```json
{
  "id": "googleDriveOAuth2Api",
  "name": "Google Drive OAuth",
  "type": "googleDriveOAuth2Api",
  "data": {
    "clientId": "{{ GOOGLE_CLIENT_ID }}",
    "clientSecret": "{{ GOOGLE_CLIENT_SECRET }}",
    "redirectUri": "{{ GOOGLE_REDIRECT_URI }}",
    "scope": "https://www.googleapis.com/auth/drive.readonly"
  }
}
```

### 2. OpenAI API
```json
{
  "id": "openAiApi",
  "name": "OpenAI API",
  "type": "openAiApi",
  "data": {
    "apiKey": "{{ OPENAI_API_KEY }}"
  }
}
```

### 3. ChromaDB API
```json
{
  "id": "chromaApi",
  "name": "ChromaDB API",
  "type": "chromaApi",
  "data": {
    "host": "{{ CHROMA_HOST }}",
    "port": "{{ CHROMA_PORT }}",
    "collection": "rag_documents"
  }
}
```

### 4. PostgreSQL
```json
{
  "id": "postgres",
  "name": "PostgreSQL",
  "type": "postgres",
  "data": {
    "host": "{{ DB_HOST }}",
    "port": "{{ DB_PORT }}",
    "database": "{{ DB_DATABASE }}",
    "user": "{{ DB_USERNAME }}",
    "password": "{{ DB_PASSWORD }}"
  }
}
```

## Workflow Execution Flow

### 1. File Change Detection
```
Google Drive File Modified
    ↓
Google Drive Monitor Trigger
    ↓
Webhook to N8N
    ↓
Webhook Trigger Node
```

### 2. File Processing
```
File Change Data
    ↓
File Processor Node
    ↓
Extract Text Content
    ↓
Add Metadata
```

### 3. Text Chunking
```
File Content
    ↓
Text Chunker Node
    ↓
Split into Chunks
    ↓
Preserve Context
```

### 4. Embedding Generation
```
Text Chunks
    ↓
Embedding Generator Node
    ↓
OpenAI API Call
    ↓
Vector Embeddings
```

### 5. Vector Storage
```
Embeddings + Metadata
    ↓
Vector Store Node
    ↓
ChromaDB Storage
    ↓
Database Update
```

### 6. Completion
```
Processing Complete
    ↓
Webhook Response Node
    ↓
Success Notification
```

## Error Handling

### Error Workflow
```json
{
  "id": "error_handler",
  "type": "n8n-nodes-base.function",
  "parameters": {
    "functionCode": "// Error Handler Code\nconst error = $input.first().json.error;\nconst context = $input.first().json.context;\n\n// Log error\nconsole.error('RAG Workflow Error:', error, context);\n\n// Send error notification\nreturn [{\n  json: {\n    success: false,\n    error: error.message,\n    context: context,\n    timestamp: new Date().toISOString()\n  }\n}];"
  }
}
```

### Retry Logic
```json
{
  "settings": {
    "retryOnFail": true,
    "maxRetries": 3,
    "retryDelay": 5000
  }
}
```

## Monitoring & Logging

### Execution Logs
```json
{
  "executionId": "exec-123",
  "workflowId": "workflow-456",
  "status": "success",
  "startedAt": "2024-01-15T14:20:00.000Z",
  "finishedAt": "2024-01-15T14:20:30.000Z",
  "executionTime": 30000,
  "nodesExecuted": 8,
  "dataProcessed": {
    "fileId": "1ABC123...",
    "fileName": "Sales Data Q4",
    "chunkCount": 15,
    "embeddingCount": 15
  }
}
```

### Performance Metrics
- File processing time
- Embedding generation time
- Vector storage time
- Total execution time
- Success/failure rate

## Webhook Endpoints

### File Update Webhook
**URL:** `{n8n-url}/webhook/rag-file-update`
**Method:** POST
**Payload:**
```json
{
  "fileId": "1ABC123...",
  "fileName": "Sales Data Q4",
  "fileType": "google-sheets",
  "changeType": "modified",
  "timestamp": "2024-01-15T14:20:00.000Z",
  "organizationId": "org-123",
  "botPersonalityId": "bot-456"
}
```

### Processing Complete Webhook
**URL:** `{n8n-url}/webhook/rag-processing-complete`
**Method:** POST
**Payload:**
```json
{
  "success": true,
  "message": "RAG processing completed",
  "data": {
    "fileId": "1ABC123...",
    "fileName": "Sales Data Q4",
    "chunkCount": 15,
    "processedAt": "2024-01-15T14:20:30.000Z"
  }
}
```

## Testing Workflow

### Manual Execution
```bash
curl -X POST "{n8n-url}/webhook/rag-file-update" \
  -H "Content-Type: application/json" \
  -d '{
    "fileId": "test-file-123",
    "fileName": "Test Document",
    "fileType": "google-docs",
    "changeType": "modified",
    "timestamp": "2024-01-15T14:20:00.000Z",
    "organizationId": "test-org",
    "botPersonalityId": "test-bot"
  }'
```

### Test Data
```json
{
  "fileId": "test-file-123",
  "fileName": "Test Document",
  "mimeType": "application/vnd.google-apps.document",
  "fileType": "google-docs",
  "content": "This is a test document for RAG workflow testing. It contains sample text that will be processed and chunked for embedding generation.",
  "organizationId": "test-org-123",
  "botPersonalityId": "test-bot-456",
  "chunkSize": 100,
  "chunkOverlap": 20,
  "embeddingModel": "text-embedding-ada-002"
}
```

## Troubleshooting

### Common Issues

1. **Webhook Not Triggering**
   - Check Google Drive webhook configuration
   - Verify N8N webhook URL accessibility
   - Check OAuth credentials

2. **File Processing Failed**
   - Verify file permissions
   - Check file format support
   - Monitor Google Drive API limits

3. **Embedding Generation Failed**
   - Check OpenAI API key
   - Verify API quota limits
   - Check model availability

4. **Vector Storage Failed**
   - Check ChromaDB connection
   - Verify collection exists
   - Check database permissions

### Debug Steps

1. **Check Workflow Execution**
   ```bash
   curl -X GET "{n8n-url}/api/v1/executions/{execution-id}"
   ```

2. **Test Individual Nodes**
   ```bash
   curl -X POST "{n8n-url}/api/v1/workflows/{workflow-id}/execute" \
     -H "Content-Type: application/json" \
     -d '{"nodeId": "file_processor", "testData": {...}}'
   ```

3. **Monitor Logs**
   ```bash
   tail -f /var/log/n8n/n8n.log
   ```

## Performance Optimization

### 1. Batch Processing
- Process multiple files in parallel
- Batch embedding generation
- Batch vector storage

### 2. Caching
- Cache file metadata
- Cache embeddings untuk repeated content
- Cache workflow results

### 3. Resource Management
- Optimize chunk size
- Limit concurrent executions
- Monitor memory usage

### 4. Error Recovery
- Implement retry logic
- Handle partial failures
- Maintain data consistency
