# RAG Workflow Backend Implementation

## Overview

RAG (Retrieval-Augmented Generation) workflow di backend terintegrasi langsung dengan Bot Personality system. Tidak ada API terpisah untuk RAG - semua workflow creation dan management dilakukan melalui Bot Personality API dengan payload JSON.

## Architecture

```
Bot Personality Form (Frontend)
    ↓ (payload dengan rag_files)
Bot Personality Controller
    ↓
Bot Personality Service
    ↓
RagWorkflowService
    ↓
N8N API + Database
```

## Database Schema

### 1. rag_workflows Table
```sql
CREATE TABLE rag_workflows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id VARCHAR(255) NOT NULL,
    bot_personality_id UUID NOT NULL,
    n8n_workflow_id VARCHAR(255) NOT NULL,
    workflow_name VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'active',
    config JSONB,
    rag_settings JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(organization_id, bot_personality_id),
    INDEX idx_rag_workflows_org_bot (organization_id, bot_personality_id)
);
```

### 2. rag_documents Table
```sql
CREATE TABLE rag_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id VARCHAR(255) NOT NULL,
    bot_personality_id UUID NOT NULL,
    file_id VARCHAR(255) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    content_hash VARCHAR(255),
    chunk_count INTEGER DEFAULT 0,
    last_processed_at TIMESTAMP,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_rag_documents_org_bot (organization_id, bot_personality_id),
    INDEX idx_rag_documents_file (file_id)
);
```

### 3. rag_chunks Table
```sql
CREATE TABLE rag_chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES rag_documents(id),
    chunk_index INTEGER NOT NULL,
    content TEXT NOT NULL,
    embedding VECTOR(1536), -- OpenAI embedding dimension
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_rag_chunks_document (document_id),
    INDEX idx_rag_chunks_embedding USING ivfflat (embedding vector_cosine_ops)
);
```

### 4. rag_queries Table
```sql
CREATE TABLE rag_queries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id VARCHAR(255) NOT NULL,
    bot_personality_id UUID NOT NULL,
    query_text TEXT NOT NULL,
    results JSONB,
    execution_time_ms INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_rag_queries_org_bot (organization_id, bot_personality_id),
    INDEX idx_rag_queries_created (created_at)
);
```

## Backend Services

### 1. BotPersonalityService

#### createPersonalityWithRag()
```php
public function createPersonalityWithRag(array $data): array
{
    DB::beginTransaction();
    
    // Create bot personality
    $personality = BotPersonality::create([...]);
    
    // Create RAG workflow jika ada selected files
    if (!empty($data['rag_files'])) {
        $ragResult = $this->createRagWorkflowForPersonality(
            $personality, 
            $data['rag_files'], 
            $data['rag_settings'] ?? []
        );
        
        if (!$ragResult['success']) {
            DB::rollBack();
            return ['success' => false, 'error' => $ragResult['error']];
        }
        
        // Update personality dengan RAG settings
        $personality->update([
            'rag_settings' => json_encode([
                'enabled' => true,
                'workflowId' => $ragResult['data']['workflowId'],
                'sources' => $data['rag_files'],
                'lastUpdated' => now()->toISOString()
            ])
        ]);
    }
    
    DB::commit();
    return ['success' => true, 'data' => ['personality' => $personality]];
}
```

#### updatePersonalityWithRag()
```php
public function updatePersonalityWithRag(string $personalityId, array $data): array
{
    $personality = BotPersonality::find($personalityId);
    
    DB::beginTransaction();
    
    // Update basic personality data
    $personality->update([...]);
    
    // Handle RAG files update
    if (isset($data['rag_files'])) {
        if (!empty($data['rag_files'])) {
            // Update RAG workflow
            $ragResult = $this->updateRagWorkflowForPersonality(
                $personality, 
                $data['rag_files'], 
                $data['rag_settings'] ?? []
            );
        } else {
            // Disable RAG
            $this->disableRagWorkflowForPersonality($personality);
        }
    }
    
    DB::commit();
    return ['success' => true, 'data' => ['personality' => $personality]];
}
```

### 2. RagWorkflowService

#### createRagWorkflow()
```php
public function createRagWorkflow(array $workflowData): array
{
    // Validasi input
    $this->validateWorkflowData($workflowData);
    
    // Buat N8N workflow
    $workflow = $this->buildN8nWorkflow($workflowData);
    
    // Kirim ke N8N API
    $workflowResponse = $this->sendToN8n($workflow);
    
    // Simpan ke database
    $this->storeWorkflowReference($workflowData, $workflowResponse['id']);
    
    // Buat RAG documents
    $this->createRagDocuments($workflowData);
    
    return ['success' => true, 'data' => $workflowResponse];
}
```

#### buildN8nWorkflow()
```php
private function buildN8nWorkflow(array $workflowData): array
{
    return [
        'name' => "RAG_Google_Drive_Workflow_{$workflowData['organizationId']}",
        'nodes' => [
            // Webhook trigger
            [
                'id' => 'webhook_trigger',
                'type' => 'n8n-nodes-base.webhook',
                'parameters' => [
                    'httpMethod' => 'POST',
                    'path' => 'rag-file-update',
                    'responseMode' => 'responseNode'
                ]
            ],
            
            // File processor
            [
                'id' => 'file_processor',
                'type' => 'n8n-nodes-base.function',
                'parameters' => [
                    'functionCode' => $this->getFileProcessorCode($config, $ragSettings)
                ]
            ],
            
            // Text chunker
            [
                'id' => 'text_chunker',
                'type' => 'n8n-nodes-base.function',
                'parameters' => [
                    'functionCode' => $this->getTextChunkerCode($ragSettings)
                ]
            ],
            
            // Embedding generator
            [
                'id' => 'embedding_generator',
                'type' => 'n8n-nodes-base.openAi',
                'parameters' => [
                    'resource' => 'embedding',
                    'operation' => 'create',
                    'model' => $ragSettings['embeddingModel'] ?? 'text-embedding-ada-002',
                    'input' => '{{ $json.text }}'
                ]
            ],
            
            // Vector store
            [
                'id' => 'vector_store',
                'type' => 'n8n-nodes-base.chroma',
                'parameters' => [
                    'operation' => 'upsert',
                    'collection' => 'rag_documents',
                    'documents' => '{{ $json.text }}',
                    'embeddings' => '{{ $json.embedding }}',
                    'metadatas' => '{{ $json.metadata }}'
                ]
            ]
        ],
        'connections' => [
            'webhook_trigger' => [['file_processor']],
            'file_processor' => [['text_chunker']],
            'text_chunker' => [['embedding_generator']],
            'embedding_generator' => [['vector_store']]
        ]
    ];
}
```

## API Endpoints

### Bot Personality API dengan RAG Integration

#### POST /api/bot-personalities
Create bot personality dengan RAG workflow

**Request Body:**
```json
{
  "name": "Sales Assistant",
  "display_name": "Sales Bot",
  "description": "AI assistant for sales team",
  "system_message": "You are a helpful sales assistant...",
  "rag_files": [
    {
      "id": "1ABC123...",
      "name": "Sales Data Q4",
      "mimeType": "application/vnd.google-apps.spreadsheet",
      "type": "google-sheets",
      "webViewLink": "https://docs.google.com/spreadsheets/..."
    },
    {
      "id": "2DEF456...",
      "name": "Product Catalog",
      "mimeType": "application/vnd.google-apps.document",
      "type": "google-docs",
      "webViewLink": "https://docs.google.com/document/..."
    }
  ],
  "rag_settings": {
    "chunkSize": 1000,
    "chunkOverlap": 200,
    "embeddingModel": "text-embedding-ada-002",
    "similarityThreshold": 0.7,
    "maxResults": 5
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Bot personality created successfully",
  "data": {
    "id": "bot-123",
    "name": "Sales Assistant",
    "rag_settings": {
      "enabled": true,
      "workflowId": "n8n-workflow-456",
      "sources": [...],
      "lastUpdated": "2024-01-02T12:00:00Z"
    }
  }
}
```

#### PUT /api/bot-personalities/{id}
Update bot personality dengan RAG workflow

**Request Body:**
```json
{
  "name": "Updated Sales Assistant",
  "rag_files": [
    {
      "id": "3GHI789...",
      "name": "New Sales Data",
      "mimeType": "application/vnd.google-apps.spreadsheet",
      "type": "google-sheets"
    }
  ],
  "rag_settings": {
    "chunkSize": 1500,
    "similarityThreshold": 0.8
  }
}
```

## N8N Workflow Structure

### Workflow Nodes

1. **Webhook Trigger**
   - Path: `/rag-file-update`
   - Method: POST
   - Triggers workflow ketika ada file update

2. **Google Drive Monitor**
   - Monitors file changes
   - Triggers untuk setiap selected file
   - Event types: change, delete

3. **File Processor**
   - Processes file content
   - Extracts text dari Google Docs/Sheets
   - Handles PDF files

4. **Text Chunker**
   - Splits text into chunks
   - Configurable chunk size dan overlap
   - Preserves context

5. **Embedding Generator**
   - Generates embeddings menggunakan OpenAI
   - Model: text-embedding-ada-002
   - Vector dimension: 1536

6. **Vector Store**
   - Stores embeddings di ChromaDB
   - Collection: rag_documents
   - Metadata preservation

### Workflow Execution Flow

```
Google Drive File Change
    ↓
Webhook Trigger
    ↓
File Processor (extract content)
    ↓
Text Chunker (split into chunks)
    ↓
Embedding Generator (create vectors)
    ↓
Vector Store (store embeddings)
    ↓
Database Update (update rag_chunks)
```

## RAG Query Processing

### Query Flow
```php
// Bot Personality Service
public function processRagQuery(string $botPersonalityId, string $query, string $organizationId): array
{
    // Get bot personality
    $botPersonality = BotPersonality::find($botPersonalityId);
    
    // Check RAG enabled
    $ragSettings = json_decode($botPersonality->rag_settings, true);
    if (!($ragSettings['enabled'] ?? false)) {
        return ['success' => false, 'error' => 'RAG not enabled'];
    }
    
    // Query RAG system
    $queryData = [
        'query' => $query,
        'botPersonalityId' => $botPersonalityId,
        'organizationId' => $organizationId,
        'maxResults' => 5,
        'similarityThreshold' => 0.7
    ];
    
    $result = $this->ragWorkflowService->queryRagSystem($queryData);
    
    return [
        'success' => true,
        'data' => [
            'query' => $query,
            'results' => $result['data']['results'] ?? [],
            'context' => $this->buildContextFromResults($result['data']['results'] ?? [])
        ]
    ];
}
```

### Vector Search
```sql
-- Similarity search menggunakan cosine similarity
SELECT 
    c.content,
    c.metadata,
    1 - (c.embedding <=> $1::vector) as similarity
FROM rag_chunks c
JOIN rag_documents d ON c.document_id = d.id
WHERE d.organization_id = $2 
  AND d.bot_personality_id = $3
  AND d.status = 'active'
  AND 1 - (c.embedding <=> $1::vector) > $4
ORDER BY similarity DESC
LIMIT $5;
```

## Configuration

### Environment Variables
```env
# N8N Configuration
N8N_API_URL=http://localhost:5678
N8N_API_KEY=your-n8n-api-key

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3000/oauth/callback

# OpenAI Configuration
OPENAI_API_KEY=your-openai-api-key

# Database Configuration
DB_CONNECTION=pgsql
DB_HOST=localhost
DB_PORT=5432
DB_DATABASE=chatbot_saas
DB_USERNAME=your-username
DB_PASSWORD=your-password
```

### Default RAG Settings
```php
$defaultRagSettings = [
    'chunkSize' => 1000,
    'chunkOverlap' => 200,
    'embeddingModel' => 'text-embedding-ada-002',
    'vectorStore' => 'chroma',
    'similarityThreshold' => 0.7,
    'maxResults' => 5
];
```

## Error Handling

### Common Error Scenarios

1. **OAuth Credential Missing**
   ```php
   return [
       'success' => false,
       'error' => 'Google Drive OAuth credential not found for this organization'
   ];
   ```

2. **N8N Connection Failed**
   ```php
   return [
       'success' => false,
       'error' => 'Failed to create N8N workflow: Connection timeout'
   ];
   ```

3. **File Processing Error**
   ```php
   return [
       'success' => false,
       'error' => 'Failed to process file: Invalid file format'
   ];
   ```

4. **Vector Store Error**
   ```php
   return [
       'success' => false,
       'error' => 'Failed to store embeddings: ChromaDB connection failed'
   ];
   ```

## Monitoring & Logging

### Logging Points
```php
// Bot Personality Service
Log::info('RAG workflow created', [
    'botPersonalityId' => $personality->id,
    'workflowId' => $workflowResponse['id'],
    'fileCount' => count($ragFiles)
]);

// RagWorkflowService
Log::error('Failed to create RAG workflow', [
    'workflowData' => $workflowData,
    'error' => $e->getMessage()
]);
```

### Monitoring Metrics
- RAG workflow creation success rate
- File processing time
- Embedding generation time
- Vector search performance
- Query response time

## Security Considerations

1. **OAuth Token Encryption**
   - Access tokens encrypted menggunakan Laravel Crypt
   - Refresh tokens stored securely
   - Automatic token refresh

2. **File Access Control**
   - Organization-level isolation
   - Bot personality-specific access
   - File permission validation

3. **API Security**
   - JWT authentication required
   - Permission-based access control
   - Rate limiting

## Performance Optimization

1. **Database Indexing**
   - Vector similarity search indexes
   - Organization and bot personality indexes
   - File ID indexes

2. **Caching Strategy**
   - Embedding cache untuk repeated queries
   - File metadata cache
   - Workflow status cache

3. **Batch Processing**
   - Batch file processing
   - Batch embedding generation
   - Batch vector storage

## Troubleshooting

### Common Issues

1. **Workflow Not Created**
   - Check N8N connection
   - Verify OAuth credentials
   - Check file permissions

2. **Files Not Processing**
   - Verify Google Drive access
   - Check file format support
   - Monitor N8N execution logs

3. **Poor Query Results**
   - Adjust similarity threshold
   - Optimize chunk size
   - Check embedding quality

### Debug Commands
```bash
# Check RAG workflow status
php artisan rag:status {bot-personality-id}

# Test N8N connection
php artisan rag:test-n8n

# Refresh file embeddings
php artisan rag:refresh {bot-personality-id}
```

## Future Enhancements

1. **Advanced RAG Features**
   - Multi-modal embeddings
   - Hybrid search (vector + keyword)
   - Query expansion

2. **Performance Improvements**
   - Streaming embeddings
   - Incremental updates
   - Distributed processing

3. **Integration Enhancements**
   - More file format support
   - Real-time collaboration
   - Advanced analytics
