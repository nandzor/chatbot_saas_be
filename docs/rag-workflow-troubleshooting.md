# RAG Workflow Troubleshooting & Best Practices

## Troubleshooting Guide

### Common Issues dan Solutions

#### 1. RAG Workflow Creation Failed

**Symptoms:**
- Bot personality created but RAG workflow not created
- Error: "Failed to create RAG workflow"
- N8N connection timeout

**Diagnosis:**
```bash
# Check N8N connection
curl -X GET "http://localhost:5678/api/v1/workflows" \
  -H "X-N8N-API-KEY: your-api-key"

# Check N8N logs
docker logs n8n-container
```

**Solutions:**
1. **Verify N8N Configuration**
   ```env
   N8N_API_URL=http://localhost:5678
   N8N_API_KEY=your-valid-api-key
   ```

2. **Check N8N Service Status**
   ```bash
   # Check if N8N is running
   docker ps | grep n8n
   
   # Restart N8N if needed
   docker restart n8n-container
   ```

3. **Verify Network Connectivity**
   ```bash
   # Test connection from backend
   curl -X GET "http://localhost:5678/api/v1/workflows" \
     -H "X-N8N-API-KEY: your-api-key" \
     --connect-timeout 10
   ```

#### 2. Google Drive OAuth Issues

**Symptoms:**
- Error: "Google Drive OAuth credential not found"
- OAuth flow fails
- File access denied

**Diagnosis:**
```bash
# Check OAuth credentials in database
psql -d chatbot_saas -c "
SELECT organization_id, service, expires_at, created_at 
FROM oauth_credentials 
WHERE service = 'google-drive';
"
```

**Solutions:**
1. **Verify OAuth Configuration**
   ```env
   GOOGLE_CLIENT_ID=your-client-id
   GOOGLE_CLIENT_SECRET=your-client-secret
   GOOGLE_REDIRECT_URI=http://localhost:3000/oauth/callback
   ```

2. **Check OAuth Credentials**
   ```bash
   # Test OAuth connection
   curl -X POST "http://localhost:9000/api/oauth/test-connection" \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer your-jwt-token" \
     -d '{
       "service": "google-drive",
       "organizationId": "your-org-id"
     }'
   ```

3. **Refresh OAuth Token**
   ```bash
   # Manual token refresh
   curl -X POST "https://oauth2.googleapis.com/token" \
     -H "Content-Type: application/x-www-form-urlencoded" \
     -d "client_id=your-client-id&client_secret=your-client-secret&refresh_token=your-refresh-token&grant_type=refresh_token"
   ```

#### 3. File Processing Errors

**Symptoms:**
- Files not being processed
- Error: "Failed to process file"
- Empty chunks generated

**Diagnosis:**
```bash
# Check file permissions
curl -X GET "https://www.googleapis.com/drive/v3/files/{file-id}" \
  -H "Authorization: Bearer {access-token}"

# Check N8N execution logs
curl -X GET "http://localhost:5678/api/v1/executions" \
  -H "X-N8N-API-KEY: your-api-key"
```

**Solutions:**
1. **Verify File Access**
   ```bash
   # Test file access
   curl -X GET "https://www.googleapis.com/drive/v3/files/{file-id}?fields=id,name,mimeType,webViewLink" \
     -H "Authorization: Bearer {access-token}"
   ```

2. **Check File Format Support**
   - Google Docs: `application/vnd.google-apps.document`
   - Google Sheets: `application/vnd.google-apps.spreadsheet`
   - PDF: `application/pdf`

3. **Verify File Content**
   ```bash
   # Check if file has content
   curl -X GET "https://docs.googleapis.com/v1/documents/{file-id}" \
     -H "Authorization: Bearer {access-token}"
   ```

#### 4. Embedding Generation Failed

**Symptoms:**
- Error: "Failed to generate embeddings"
- OpenAI API errors
- Empty embeddings

**Diagnosis:**
```bash
# Check OpenAI API key
curl -X GET "https://api.openai.com/v1/models" \
  -H "Authorization: Bearer your-openai-api-key"

# Check API quota
curl -X GET "https://api.openai.com/v1/usage" \
  -H "Authorization: Bearer your-openai-api-key"
```

**Solutions:**
1. **Verify OpenAI Configuration**
   ```env
   OPENAI_API_KEY=sk-your-valid-api-key
   ```

2. **Check API Quota**
   ```bash
   # Check usage
   curl -X GET "https://api.openai.com/v1/usage" \
     -H "Authorization: Bearer your-openai-api-key"
   ```

3. **Test Embedding Generation**
   ```bash
   curl -X POST "https://api.openai.com/v1/embeddings" \
     -H "Authorization: Bearer your-openai-api-key" \
     -H "Content-Type: application/json" \
     -d '{
       "model": "text-embedding-ada-002",
       "input": "Test text for embedding"
     }'
   ```

#### 5. Vector Storage Issues

**Symptoms:**
- Error: "Vector storage failed"
- ChromaDB connection errors
- Embeddings not stored

**Diagnosis:**
```bash
# Check ChromaDB status
curl -X GET "http://localhost:8000/api/v1/heartbeat"

# Check collection
curl -X GET "http://localhost:8000/api/v1/collections/rag_documents"
```

**Solutions:**
1. **Verify ChromaDB Configuration**
   ```env
   CHROMA_HOST=localhost
   CHROMA_PORT=8000
   CHROMA_COLLECTION=rag_documents
   ```

2. **Check ChromaDB Service**
   ```bash
   # Start ChromaDB
   docker run -p 8000:8000 chromadb/chroma
   
   # Check service status
   curl -X GET "http://localhost:8000/api/v1/heartbeat"
   ```

3. **Create Collection**
   ```bash
   curl -X POST "http://localhost:8000/api/v1/collections" \
     -H "Content-Type: application/json" \
     -d '{
       "name": "rag_documents",
       "metadata": {"description": "RAG documents collection"}
     }'
   ```

### Database Issues

#### 1. RAG Tables Not Created

**Symptoms:**
- Error: "Table rag_workflows does not exist"
- Migration failed

**Solutions:**
```bash
# Run migrations
php artisan migrate

# Check migration status
php artisan migrate:status

# Rollback and re-run if needed
php artisan migrate:rollback
php artisan migrate
```

#### 2. Vector Extension Missing

**Symptoms:**
- Error: "Vector extension not available"
- Embedding storage failed

**Solutions:**
```sql
-- Install pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Check if extension is installed
SELECT * FROM pg_extension WHERE extname = 'vector';
```

#### 3. Performance Issues

**Symptoms:**
- Slow vector searches
- High CPU usage
- Timeout errors

**Solutions:**
```sql
-- Create indexes for better performance
CREATE INDEX CONCURRENTLY idx_rag_chunks_embedding 
ON rag_chunks USING ivfflat (embedding vector_cosine_ops) 
WITH (lists = 100);

-- Analyze tables for better query planning
ANALYZE rag_chunks;
ANALYZE rag_documents;
ANALYZE rag_workflows;
```

## Best Practices

### 1. File Selection

**Do:**
- Select files dengan content yang relevan
- Use descriptive file names
- Keep files updated
- Limit file size (< 10MB per file)

**Don't:**
- Select empty files
- Use files dengan sensitive data
- Select too many files (> 20 files)
- Use files dengan complex formatting

### 2. RAG Settings Configuration

**Optimal Settings:**
```json
{
  "chunkSize": 1000,           // Good balance of context and performance
  "chunkOverlap": 200,         // Preserve context between chunks
  "similarityThreshold": 0.7,  // Good balance of relevance and recall
  "maxResults": 5,             // Optimal for most use cases
  "embeddingModel": "text-embedding-ada-002"  // Cost-effective model
}
```

**Performance Settings:**
```json
{
  "chunkSize": 800,            // Faster processing
  "chunkOverlap": 100,         // Less overlap for speed
  "similarityThreshold": 0.8,  // Higher threshold for precision
  "maxResults": 3,             // Fewer results for speed
  "embeddingModel": "text-embedding-3-small"  // Faster model
}
```

**Quality Settings:**
```json
{
  "chunkSize": 1500,           // More context
  "chunkOverlap": 300,         // Better context preservation
  "similarityThreshold": 0.6,  // Lower threshold for recall
  "maxResults": 7,             // More results for completeness
  "embeddingModel": "text-embedding-3-large"  // Higher quality model
}
```

### 3. Monitoring & Maintenance

**Regular Checks:**
```bash
# Check RAG workflow status
curl -X GET "http://localhost:9000/api/bot-personalities/{id}" \
  -H "Authorization: Bearer your-jwt-token"

# Check database performance
psql -d chatbot_saas -c "
SELECT 
  schemaname,
  tablename,
  n_tup_ins,
  n_tup_upd,
  n_tup_del,
  n_live_tup,
  n_dead_tup
FROM pg_stat_user_tables 
WHERE tablename LIKE 'rag_%';
"

# Check N8N execution status
curl -X GET "http://localhost:5678/api/v1/executions?limit=10" \
  -H "X-N8N-API-KEY: your-api-key"
```

**Performance Monitoring:**
```sql
-- Monitor query performance
SELECT 
  query,
  calls,
  total_time,
  mean_time,
  rows
FROM pg_stat_statements 
WHERE query LIKE '%rag_%'
ORDER BY total_time DESC
LIMIT 10;

-- Check index usage
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes 
WHERE tablename LIKE 'rag_%';
```

### 4. Security Best Practices

**OAuth Security:**
```php
// Encrypt tokens
$encryptedToken = Crypt::encrypt($accessToken);

// Store securely
DB::table('oauth_credentials')->insert([
    'access_token' => $encryptedToken,
    'expires_at' => now()->addSeconds($expiresIn)
]);
```

**File Access Control:**
```php
// Verify file ownership
$file = DB::table('rag_documents')
    ->where('file_id', $fileId)
    ->where('organization_id', $organizationId)
    ->first();

if (!$file) {
    throw new UnauthorizedException('File access denied');
}
```

**API Security:**
```php
// Rate limiting
Route::middleware(['throttle:rag-api'])->group(function () {
    Route::post('/bot-personalities', [BotPersonalityController::class, 'store']);
});

// Permission checks
if (!$user->hasPermission('automations.manage')) {
    return $this->handleForbiddenAccess('manage RAG workflows');
}
```

### 5. Error Handling

**Comprehensive Error Handling:**
```php
try {
    $result = $this->ragWorkflowService->createRagWorkflow($workflowData);
    
    if (!$result['success']) {
        Log::error('RAG workflow creation failed', [
            'workflowData' => $workflowData,
            'error' => $result['error']
        ]);
        
        return $this->errorResponse(
            'Failed to create RAG workflow: ' . $result['error'],
            500
        );
    }
    
    return $this->successResponse($result['data']);
    
} catch (Exception $e) {
    Log::error('RAG workflow exception', [
        'workflowData' => $workflowData,
        'exception' => $e->getMessage(),
        'trace' => $e->getTraceAsString()
    ]);
    
    return $this->errorResponse(
        'Internal server error: ' . $e->getMessage(),
        500
    );
}
```

**Retry Logic:**
```php
public function createRagWorkflowWithRetry(array $workflowData, int $maxRetries = 3): array
{
    $attempt = 0;
    
    while ($attempt < $maxRetries) {
        try {
            $result = $this->createRagWorkflow($workflowData);
            
            if ($result['success']) {
                return $result;
            }
            
            $attempt++;
            
            if ($attempt < $maxRetries) {
                sleep(pow(2, $attempt)); // Exponential backoff
            }
            
        } catch (Exception $e) {
            $attempt++;
            
            if ($attempt >= $maxRetries) {
                throw $e;
            }
            
            sleep(pow(2, $attempt));
        }
    }
    
    return [
        'success' => false,
        'error' => 'Max retries exceeded'
    ];
}
```

### 6. Performance Optimization

**Database Optimization:**
```sql
-- Optimize vector search
CREATE INDEX CONCURRENTLY idx_rag_chunks_embedding_cosine 
ON rag_chunks USING ivfflat (embedding vector_cosine_ops) 
WITH (lists = 100);

-- Optimize metadata queries
CREATE INDEX CONCURRENTLY idx_rag_documents_org_bot_status 
ON rag_documents (organization_id, bot_personality_id, status);

-- Optimize workflow queries
CREATE INDEX CONCURRENTLY idx_rag_workflows_org_bot_status 
ON rag_workflows (organization_id, bot_personality_id, status);
```

**Caching Strategy:**
```php
// Cache embeddings
$cacheKey = "embedding:" . md5($text);
$embedding = Cache::remember($cacheKey, 3600, function () use ($text) {
    return $this->generateEmbedding($text);
});

// Cache file metadata
$cacheKey = "file_metadata:" . $fileId;
$metadata = Cache::remember($cacheKey, 1800, function () use ($fileId) {
    return $this->getFileMetadata($fileId);
});
```

**Batch Processing:**
```php
// Process multiple files in batches
$batches = array_chunk($files, 5); // Process 5 files at a time

foreach ($batches as $batch) {
    $this->processBatch($batch);
    
    // Add delay between batches
    usleep(100000); // 100ms delay
}
```

## Monitoring Dashboard

### Key Metrics to Track

1. **RAG Workflow Metrics**
   - Workflow creation success rate
   - Average processing time
   - File processing success rate
   - Embedding generation time

2. **Performance Metrics**
   - Vector search response time
   - Database query performance
   - Memory usage
   - CPU utilization

3. **Error Metrics**
   - Error rate by type
   - Retry success rate
   - Timeout occurrences
   - API quota usage

### Monitoring Queries

```sql
-- RAG workflow statistics
SELECT 
    DATE(created_at) as date,
    COUNT(*) as total_workflows,
    COUNT(CASE WHEN status = 'active' THEN 1 END) as active_workflows,
    COUNT(CASE WHEN status = 'inactive' THEN 1 END) as inactive_workflows
FROM rag_workflows
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- Document processing statistics
SELECT 
    file_type,
    COUNT(*) as total_documents,
    AVG(chunk_count) as avg_chunks,
    SUM(chunk_count) as total_chunks
FROM rag_documents
WHERE status = 'active'
GROUP BY file_type;

-- Query performance statistics
SELECT 
    DATE(created_at) as date,
    COUNT(*) as total_queries,
    AVG(execution_time_ms) as avg_execution_time,
    COUNT(CASE WHEN execution_time_ms > 5000 THEN 1 END) as slow_queries
FROM rag_queries
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

## Recovery Procedures

### 1. Workflow Recovery

```bash
# Restart failed workflows
curl -X POST "http://localhost:5678/api/v1/workflows/{workflow-id}/activate" \
  -H "X-N8N-API-KEY: your-api-key"

# Re-run failed executions
curl -X POST "http://localhost:5678/api/v1/executions/{execution-id}/retry" \
  -H "X-N8N-API-KEY: your-api-key"
```

### 2. Data Recovery

```sql
-- Rebuild missing chunks
INSERT INTO rag_chunks (id, document_id, chunk_index, content, metadata)
SELECT 
    gen_random_uuid(),
    d.id,
    generate_series(0, d.chunk_count - 1),
    'PLACEHOLDER_CONTENT',
    '{"recovered": true, "recovered_at": "' || NOW() || '"}'
FROM rag_documents d
WHERE d.id NOT IN (SELECT DISTINCT document_id FROM rag_chunks);
```

### 3. Service Recovery

```bash
# Restart services
docker restart n8n-container
docker restart chromadb-container
docker restart postgres-container

# Check service health
curl -X GET "http://localhost:5678/api/v1/workflows"
curl -X GET "http://localhost:8000/api/v1/heartbeat"
curl -X GET "http://localhost:5432/health"
```
