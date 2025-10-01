<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Exception;

/**
 * RAG Workflow Service
 * Service untuk mengelola RAG workflow dengan Google Drive integration
 */
class RagWorkflowService
{
    protected $n8nApiUrl;
    protected $n8nApiKey;
    protected $httpClient;

    public function __construct()
    {
        $this->n8nApiUrl = config('n8n.server.base_url');
        $this->n8nApiKey = config('n8n.server.api_key');
        $this->httpClient = new \GuzzleHttp\Client(['timeout' => config('n8n.server.timeout')]);
    }

    /**
     * Create RAG workflow dengan Google Drive integration
     */
    public function createRagWorkflow(array $workflowData): array
    {
        try {
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

            return [
                'success' => true,
                'data' => [
                    'workflowId' => $workflowResponse['id'],
                    'name' => $workflowResponse['name'],
                    'status' => 'active',
                    'type' => 'rag-integration',
                    'organizationId' => $workflowData['organizationId'],
                    'botPersonalityId' => $workflowData['botPersonalityId'] ?? null,
                    'files' => $workflowData['selectedFiles'] ?? [],
                    'message' => 'RAG workflow created successfully'
                ]
            ];

        } catch (Exception $e) {
            Log::error('Failed to create RAG workflow', [
                'workflowData' => $workflowData,
                'error' => $e->getMessage()
            ]);

            return [
                'success' => false,
                'error' => 'Failed to create RAG workflow: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Validate workflow data
     */
    private function validateWorkflowData(array $data): void
    {
        if (empty($data['organizationId'])) {
            throw new Exception('Organization ID is required');
        }

        if (empty($data['selectedFiles']) || !is_array($data['selectedFiles'])) {
            throw new Exception('Selected files are required');
        }

        if (empty($data['botPersonalityId'])) {
            throw new Exception('Bot Personality ID is required');
        }

        // Validate each file
        foreach ($data['selectedFiles'] as $file) {
            if (empty($file['id']) || empty($file['name']) || empty($file['mimeType'])) {
                throw new Exception('Invalid file data: missing required fields');
            }
        }
    }

    /**
     * Build N8N workflow definition
     */
    private function buildN8nWorkflow(array $workflowData): array
    {
        $organizationId = $workflowData['organizationId'];
        $selectedFiles = $workflowData['selectedFiles'];
        $config = $workflowData['config'] ?? [];
        $ragSettings = $workflowData['ragSettings'] ?? [];

        return [
            'name' => "RAG_Google_Drive_Workflow_{$organizationId}",
            'nodes' => $this->buildWorkflowNodes($selectedFiles, $config, $ragSettings),
            'connections' => $this->buildWorkflowConnections(),
            'settings' => [
                'executionOrder' => 'v1',
                'saveManualExecutions' => true,
                'callerPolicy' => 'workflowsFromSameOwner'
            ]
        ];
    }

    /**
     * Send workflow to N8N API
     */
    private function sendToN8n(array $workflow): array
    {
        $response = $this->httpClient->post("{$this->n8nApiUrl}/api/v1/workflows", [
            'json' => $workflow,
            'headers' => [
                'X-N8N-API-KEY' => $this->n8nApiKey,
                'Content-Type' => 'application/json'
            ]
        ]);

        return json_decode($response->getBody(), true);
    }

    /**
     * Build workflow nodes untuk N8N
     */
    private function buildWorkflowNodes(array $selectedFiles, array $config, array $ragSettings): array
    {
        $nodes = [
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
            ],

            // Webhook response
            [
                'id' => 'webhook_response',
                'type' => 'n8n-nodes-base.webhook',
                'parameters' => [
                    'httpMethod' => 'POST',
                    'path' => 'rag-processing-complete',
                    'responseMode' => 'responseNode'
                ]
            ]
        ];

        // Tambahkan Google Drive monitors untuk setiap file
        foreach ($selectedFiles as $index => $file) {
            $nodes[] = [
                'id' => "google_drive_monitor_{$index}",
                'type' => '@n8n/n8n-nodes-base.googleDriveTrigger',
                'parameters' => [
                    'authentication' => 'oAuth2',
                    'operation' => 'watch',
                    'fileId' => $file['id'],
                    'eventTypes' => ['change', 'delete']
                ],
                'credentials' => [
                    'googleDriveOAuth2Api' => [
                        'id' => '{{ $credentials.googleDriveOAuth2Api.id }}',
                        'name' => 'Google Drive OAuth'
                    ]
                ]
            ];
        }

        return $nodes;
    }

    /**
     * Build workflow connections
     */
    private function buildWorkflowConnections(): array
    {
        return [
            'webhook_trigger' => [
                'main' => [['file_processor']]
            ],
            'file_processor' => [
                'main' => [['text_chunker']]
            ],
            'text_chunker' => [
                'main' => [['embedding_generator']]
            ],
            'embedding_generator' => [
                'main' => [['vector_store']]
            ],
            'vector_store' => [
                'main' => [['webhook_response']]
            ]
        ];
    }

    /**
     * Create RAG documents di database
     */
    private function createRagDocuments(array $workflowData): void
    {
        $organizationId = $workflowData['organizationId'];
        $botPersonalityId = $workflowData['botPersonalityId'];
        $selectedFiles = $workflowData['selectedFiles'];

        foreach ($selectedFiles as $file) {
            DB::table('rag_documents')->insert([
                'id' => Str::uuid(),
                'organization_id' => $organizationId,
                'bot_personality_id' => $botPersonalityId,
                'file_id' => $file['id'],
                'file_name' => $file['name'],
                'file_type' => $this->getFileType($file['mimeType']),
                'content_hash' => hash('sha256', $file['id'] . ($file['modifiedTime'] ?? now())),
                'chunk_count' => 0,
                'last_processed_at' => now(),
                'status' => 'active',
                'created_at' => now(),
                'updated_at' => now()
            ]);
        }
    }

    /**
     * Get file processor code
     */
    private function getFileProcessorCode(array $config, array $ragSettings): string
    {
        $syncInterval = $config['syncInterval'] ?? 300;
        $includeMetadata = $config['includeMetadata'] ?? true;
        $autoProcess = $config['autoProcess'] ?? true;

        return "
// Process different file types for RAG
const fileData = \$input.all()[0].json;
const fileType = fileData.mimeType;

let processedContent = {};

switch (true) {
  case fileType.includes('spreadsheet'):
    // Process Google Sheets
    processedContent = {
      type: 'spreadsheet',
      content: await processGoogleSheets(fileData),
      metadata: {
        fileId: fileData.id,
        fileName: fileData.name,
        lastModified: fileData.modifiedTime,
        source: 'google-sheets',
        syncInterval: {$syncInterval},
        includeMetadata: {$includeMetadata},
        autoProcess: {$autoProcess}
      }
    };
    break;

  case fileType.includes('document'):
    // Process Google Docs
    processedContent = {
      type: 'document',
      content: await processGoogleDocs(fileData),
      metadata: {
        fileId: fileData.id,
        fileName: fileData.name,
        lastModified: fileData.modifiedTime,
        source: 'google-docs',
        syncInterval: {$syncInterval},
        includeMetadata: {$includeMetadata},
        autoProcess: {$autoProcess}
      }
    };
    break;

  case fileType.includes('pdf'):
    // Process PDF
    processedContent = {
      type: 'pdf',
      content: await processPDF(fileData),
      metadata: {
        fileId: fileData.id,
        fileName: fileData.name,
        lastModified: fileData.modifiedTime,
        source: 'google-drive-pdf',
        syncInterval: {$syncInterval},
        includeMetadata: {$includeMetadata},
        autoProcess: {$autoProcess}
      }
    };
    break;
}

return [{ json: processedContent }];
        ";
    }

    /**
     * Get text chunker code
     */
    private function getTextChunkerCode(array $ragSettings): string
    {
        $chunkSize = $ragSettings['chunkSize'] ?? 1000;
        $chunkOverlap = $ragSettings['chunkOverlap'] ?? 200;

        return "
// Chunk text for RAG processing
const content = \$input.all()[0].json.content;
const chunkSize = {$chunkSize};
const chunkOverlap = {$chunkOverlap};

const chunks = [];
let start = 0;

while (start < content.length) {
  const end = Math.min(start + chunkSize, content.length);
  const chunk = content.substring(start, end);

  chunks.push({
    text: chunk,
    start: start,
    end: end,
    metadata: {
      ...\$input.all()[0].json.metadata,
      chunkIndex: chunks.length,
      chunkSize: chunk.length
    }
  });

  start = end - chunkOverlap;
}

return chunks.map(chunk => ({ json: chunk }));
        ";
    }

    /**
     * Store workflow reference ke database
     */
    private function storeWorkflowReference(array $workflowData, string $workflowId): void
    {
        try {
            DB::table('rag_workflows')->insert([
                'id' => Str::uuid(),
                'organization_id' => $workflowData['organizationId'],
                'bot_personality_id' => $workflowData['botPersonalityId'] ?? null,
                'n8n_workflow_id' => $workflowId,
                'workflow_name' => "RAG_Google_Drive_Workflow_{$workflowData['organizationId']}",
                'workflow_type' => 'rag-integration',
                'config' => json_encode($workflowData['config'] ?? []),
                'rag_settings' => json_encode($workflowData['ragSettings'] ?? []),
                'selected_files' => json_encode($workflowData['selectedFiles'] ?? []),
                'status' => 'active',
                'created_at' => now(),
                'updated_at' => now()
            ]);
        } catch (Exception $e) {
            Log::error('Failed to store workflow reference', [
                'workflowData' => $workflowData,
                'workflowId' => $workflowId,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Update RAG documents
     */
    public function updateRagDocuments(array $documentData): array
    {
        try {
            $organizationId = $documentData['organizationId'];
            $botPersonalityId = $documentData['botPersonalityId'];
            $files = $documentData['files'] ?? [];
            $action = $documentData['action'] ?? 'add';

            foreach ($files as $file) {
                $this->processDocumentAction($organizationId, $botPersonalityId, $file, $action);
            }

            return [
                'success' => true,
                'data' => [
                    'organizationId' => $organizationId,
                    'botPersonalityId' => $botPersonalityId,
                    'action' => $action,
                    'filesProcessed' => count($files)
                ]
            ];

        } catch (Exception $e) {
            Log::error('Failed to update RAG documents', [
                'documentData' => $documentData,
                'error' => $e->getMessage()
            ]);

            return [
                'success' => false,
                'error' => 'Failed to update RAG documents: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Process document action (add, remove, update)
     */
    private function processDocumentAction(string $organizationId, string $botPersonalityId, array $file, string $action): void
    {
        switch ($action) {
            case 'add':
                $this->addDocument($organizationId, $botPersonalityId, $file);
                break;
            case 'remove':
                $this->removeDocument($organizationId, $botPersonalityId, $file);
                break;
            case 'update':
                $this->updateDocument($organizationId, $botPersonalityId, $file);
                break;
        }
    }

    /**
     * Add document to RAG system
     */
    private function addDocument(string $organizationId, string $botPersonalityId, array $file): void
    {
        DB::table('rag_documents')->insert([
            'id' => \Str::uuid(),
            'organization_id' => $organizationId,
            'bot_personality_id' => $botPersonalityId,
            'file_id' => $file['id'],
            'file_name' => $file['name'],
            'file_type' => $this->getFileType($file['mimeType']),
            'content_hash' => hash('sha256', $file['id'] . $file['modifiedTime']),
            'chunk_count' => 0,
            'last_processed_at' => now(),
            'status' => 'active',
            'created_at' => now(),
            'updated_at' => now()
        ]);
    }

    /**
     * Remove document from RAG system
     */
    private function removeDocument(string $organizationId, string $botPersonalityId, array $file): void
    {
        DB::table('rag_documents')
            ->where('organization_id', $organizationId)
            ->where('bot_personality_id', $botPersonalityId)
            ->where('file_id', $file['id'])
            ->update([
                'status' => 'inactive',
                'updated_at' => now()
            ]);
    }

    /**
     * Update document in RAG system
     */
    private function updateDocument(string $organizationId, string $botPersonalityId, array $file): void
    {
        DB::table('rag_documents')
            ->where('organization_id', $organizationId)
            ->where('bot_personality_id', $botPersonalityId)
            ->where('file_id', $file['id'])
            ->update([
                'file_name' => $file['name'],
                'content_hash' => hash('sha256', $file['id'] . $file['modifiedTime']),
                'last_processed_at' => now(),
                'status' => 'active',
                'updated_at' => now()
            ]);
    }

    /**
     * Get file type from MIME type
     */
    private function getFileType(string $mimeType): string
    {
        if (str_contains($mimeType, 'spreadsheet')) {
            return 'google-sheets';
        }
        if (str_contains($mimeType, 'document')) {
            return 'google-docs';
        }
        if (str_contains($mimeType, 'pdf')) {
            return 'pdf';
        }
        return 'unknown';
    }

    /**
     * Query RAG system
     */
    public function queryRagSystem(array $queryData): array
    {
        try {
            $query = $queryData['query'];
            $botPersonalityId = $queryData['botPersonalityId'];
            $organizationId = $queryData['organizationId'];
            $maxResults = $queryData['maxResults'] ?? 5;
            $similarityThreshold = $queryData['similarityThreshold'] ?? 0.7;

            // Generate embedding untuk query
            $embedding = $this->generateEmbedding($query);

            // Search di vector store
            $results = $this->searchVectorStore($organizationId, $embedding, $maxResults, $similarityThreshold);

            return [
                'success' => true,
                'data' => [
                    'query' => $query,
                    'results' => $results,
                    'maxResults' => $maxResults,
                    'similarityThreshold' => $similarityThreshold
                ]
            ];

        } catch (Exception $e) {
            Log::error('Failed to query RAG system', [
                'queryData' => $queryData,
                'error' => $e->getMessage()
            ]);

            return [
                'success' => false,
                'error' => 'Failed to query RAG system: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Generate embedding untuk query
     */
    private function generateEmbedding(string $text): array
    {
        // Implementasi untuk generate embedding
        // Bisa menggunakan OpenAI API atau service lain
        return [];
    }

    /**
     * Search di vector store
     */
    private function searchVectorStore(string $organizationId, array $embedding, int $maxResults, float $similarityThreshold): array
    {
        // Implementasi untuk search di vector store
        // Bisa menggunakan Chroma, Pinecone, atau service lain
        return [];
    }
}
