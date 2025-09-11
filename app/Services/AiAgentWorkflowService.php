<?php

namespace App\Services;

use Exception;
use App\Models\Agent;
use App\Models\N8nWorkflow;
use App\Models\Conversation;
use App\Models\Organization;
use App\Services\N8n\N8nService;
use App\Models\KnowledgeBase;
use App\Services\BaseService;
use App\Services\Waha\WahaService;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;
use App\Services\ConversationService;
use Illuminate\Support\Facades\Cache;
use App\Services\KnowledgeBaseService;

class AiAgentWorkflowService extends BaseService
{
    protected N8nService $n8nService;
    protected WahaService $wahaService;
    protected KnowledgeBaseService $knowledgeBaseService;
    protected ConversationService $conversationService;

    public function __construct(
        N8nService $n8nService,
        WahaService $wahaService,
        KnowledgeBaseService $knowledgeBaseService,
        ConversationService $conversationService
    ) {
        $this->n8nService = $n8nService;
        $this->wahaService = $wahaService;
        $this->knowledgeBaseService = $knowledgeBaseService;
        $this->conversationService = $conversationService;
    }

    /**
     * Get the model instance (required by BaseService)
     */
    protected function getModel(): \Illuminate\Database\Eloquent\Model
    {
        // This service doesn't work with a specific model, return a dummy model
        return new Organization();
    }

    /**
     * Create a complete AI Agent workflow for an organization
     */
    public function createAiAgentWorkflow(
        string $organizationId,
        string $knowledgeBaseId,
        array $workflowConfig = []
    ): array {
        try {
            Log::info('Creating AI Agent workflow', [
                'organization_id' => $organizationId,
                'knowledge_base_id' => $knowledgeBaseId,
                'config' => $workflowConfig
            ]);

            // Step 1: Create N8N Workflow
            $workflowResult = $this->createN8nWorkflow($organizationId, $knowledgeBaseId, $workflowConfig);
            if (!$workflowResult['success']) {
                return $workflowResult;
            }

            $workflowId = $workflowResult['data']['id'];

            // Step 2: Create WAHA Session
            $sessionResult = $this->createWahaSession($organizationId, $workflowId, $workflowConfig);
            if (!$sessionResult['success']) {
                // Cleanup workflow if session creation fails
                $this->n8nService->deleteWorkflow($workflowId);
                return $sessionResult;
            }

            $sessionId = $sessionResult['data']['id'];

            // Step 3: Activate the workflow
            $activationResult = $this->n8nService->activateWorkflow($workflowId);
            if (!$activationResult['success']) {
                // Cleanup on failure
                $this->wahaService->deleteSession($sessionId);
                $this->n8nService->deleteWorkflow($workflowId);
                return $activationResult;
            }

            // Step 4: Store workflow metadata
            $metadata = [
                'workflow_id' => $workflowId,
                'session_id' => $sessionId,
                'organization_id' => $organizationId,
                'knowledge_base_id' => $knowledgeBaseId,
                'status' => 'active',
                'created_at' => now()->toISOString(),
            ];

            Cache::put("ai_workflow_{$organizationId}_{$knowledgeBaseId}", $metadata, 86400);

            return [
                'success' => true,
                'message' => 'AI Agent workflow created successfully',
                'data' => $metadata,
            ];

        } catch (Exception $e) {
            Log::error('Failed to create AI Agent workflow', [
                'organization_id' => $organizationId,
                'knowledge_base_id' => $knowledgeBaseId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return [
                'success' => false,
                'message' => 'Failed to create AI Agent workflow: ' . $e->getMessage(),
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Create N8N workflow with AI Agent nodes
     */
    protected function createN8nWorkflow(
        string $organizationId,
        string $knowledgeBaseId,
        array $config = []
    ): array {
        $workflowName = $config['workflow_name'] ?? "AI Agent - Org {$organizationId} - KB {$knowledgeBaseId}";

        $workflowData = [
            'name' => $workflowName,
            'nodes' => $this->getWorkflowNodes($organizationId, $knowledgeBaseId, $config),
            'connections' => $this->getWorkflowConnections(),
            'settings' => $this->getWorkflowSettings($config),
        ];

        return $this->n8nService->createWorkflow($workflowData);
    }

    /**
     * Get AI Agent workflow nodes configuration
     */
    protected function getWorkflowNodes(string $organizationId, string $knowledgeBaseId, array $config): array
    {
        return [
            // 1. Webhook Trigger Node
            [
                'id' => 'webhook_trigger',
                'name' => 'WhatsApp Message Webhook',
                'type' => 'n8n-nodes-base.webhook',
                'typeVersion' => 1,
                'position' => [100, 100],
                'parameters' => [
                    'path' => "kb-webhook/{$knowledgeBaseId}",
                    'httpMethod' => 'POST',
                    'responseMode' => 'responseNode',
                    'options' => [
                        'noResponseBody' => false
                    ]
                ],
                'webhookId' => "kb-webhook-{$knowledgeBaseId}"
            ],

            // 2. Data Processor Node
            [
                'id' => 'data_processor',
                'name' => 'Process Message Data',
                'type' => 'n8n-nodes-base.function',
                'typeVersion' => 1,
                'position' => [300, 100],
                'parameters' => [
                    'functionCode' => $this->getDataProcessorCode($organizationId, $knowledgeBaseId)
                ]
            ],

            // 3. Knowledge Base Search Node
            [
                'id' => 'kb_search',
                'name' => 'Search Knowledge Base',
                'type' => 'n8n-nodes-base.httpRequest',
                'typeVersion' => 4.1,
                'position' => [500, 100],
                'parameters' => [
                    'url' => '{{$env.LARAVEL_APP_URL}}/api/v1/knowledge-base/search',
                    'method' => 'GET',
                    'authentication' => 'predefinedCredentialType',
                    'nodeCredentialType' => 'httpHeaderAuth',
                    'sendQuery' => true,
                    'queryParameters' => [
                        'parameters' => [
                            ['name' => 'query', 'value' => '={{$json.user_message}}'],
                            ['name' => 'organization_id', 'value' => '={{$json.organization_id}}'],
                            ['name' => 'knowledge_base_id', 'value' => '={{$json.knowledge_base_id}}'],
                            ['name' => 'limit', 'value' => '5'],
                            ['name' => 'include_content', 'value' => 'true']
                        ]
                    ],
                    'options' => ['timeout' => 10000]
                ]
            ],

            // 4. Conversation History Node
            [
                'id' => 'conversation_history',
                'name' => 'Get Conversation History',
                'type' => 'n8n-nodes-base.httpRequest',
                'typeVersion' => 4.1,
                'position' => [500, 300],
                'parameters' => [
                    'url' => '{{$env.LARAVEL_APP_URL}}/api/v1/conversations/history',
                    'method' => 'GET',
                    'authentication' => 'predefinedCredentialType',
                    'nodeCredentialType' => 'httpHeaderAuth',
                    'sendQuery' => true,
                    'queryParameters' => [
                        'parameters' => [
                            ['name' => 'session_id', 'value' => '={{$json.session_id}}'],
                            ['name' => 'limit', 'value' => '10']
                        ]
                    ]
                ]
            ],

            // 5. System Prompt Builder Node
            [
                'id' => 'prompt_builder',
                'name' => 'Build System Prompt',
                'type' => 'n8n-nodes-base.function',
                'typeVersion' => 1,
                'position' => [700, 200],
                'parameters' => [
                    'functionCode' => $this->getPromptBuilderCode()
                ]
            ],

            // 6. AI Processor Node
            [
                'id' => 'ai_processor',
                'name' => 'AI Response Generation',
                'type' => 'n8n-nodes-base.openAi',
                'typeVersion' => 1,
                'position' => [900, 200],
                'parameters' => [
                    'resource' => 'chat',
                    'operation' => 'create',
                    'model' => $config['ai_model'] ?? 'gpt-4',
                    'messages' => [
                        'values' => [
                            ['role' => 'system', 'content' => '={{$json.system_prompt}}'],
                            ['role' => 'user', 'content' => '={{$json.user_message}}']
                        ]
                    ],
                    'temperature' => $config['ai_temperature'] ?? 0.7,
                    'maxTokens' => $config['ai_max_tokens'] ?? 500,
                    'options' => [
                        'presencePenalty' => 0.1,
                        'frequencyPenalty' => 0.1
                    ]
                ]
            ],

            // 7. Response Formatter Node
            [
                'id' => 'response_formatter',
                'name' => 'Format Response',
                'type' => 'n8n-nodes-base.function',
                'typeVersion' => 1,
                'position' => [1100, 200],
                'parameters' => [
                    'functionCode' => $this->getResponseFormatterCode()
                ]
            ],

            // 8. WAHA Send Message Node
            [
                'id' => 'waha_send',
                'name' => 'Send WhatsApp Message',
                'type' => 'n8n-nodes-base.httpRequest',
                'typeVersion' => 4.1,
                'position' => [1300, 200],
                'parameters' => [
                    'url' => '{{$env.WAHA_BASE_URL}}/api/sendText',
                    'method' => 'POST',
                    'authentication' => 'predefinedCredentialType',
                    'nodeCredentialType' => 'httpHeaderAuth',
                    'sendBody' => true,
                    'bodyParameters' => [
                        'parameters' => [
                            ['name' => 'session', 'value' => '={{$json.session}}'],
                            ['name' => 'to', 'value' => '={{$json.to}}'],
                            ['name' => 'text', 'value' => '={{$json.text}}']
                        ]
                    ],
                    'options' => [
                        'timeout' => 15000,
                        'retry' => [
                            'enabled' => true,
                            'maxRetries' => 3,
                            'retryDelay' => 1000
                        ]
                    ]
                ]
            ],

            // 9. Analytics Logger Node
            [
                'id' => 'analytics_logger',
                'name' => 'Log Analytics',
                'type' => 'n8n-nodes-base.httpRequest',
                'typeVersion' => 4.1,
                'position' => [1300, 400],
                'parameters' => [
                    'url' => '{{$env.LARAVEL_APP_URL}}/api/v1/analytics/workflow-execution',
                    'method' => 'POST',
                    'authentication' => 'predefinedCredentialType',
                    'nodeCredentialType' => 'httpHeaderAuth',
                    'sendBody' => true,
                    'bodyParameters' => [
                        'parameters' => [
                            ['name' => 'workflow_id', 'value' => '={{$json.workflow_id}}'],
                            ['name' => 'execution_id', 'value' => '={{$json.execution_id}}'],
                            ['name' => 'organization_id', 'value' => '={{$json.organization_id}}'],
                            ['name' => 'session_id', 'value' => '={{$json.session_id}}'],
                            ['name' => 'user_phone', 'value' => '={{$json.user_phone}}'],
                            ['name' => 'metrics', 'value' => '={{$json.metrics}}'],
                            ['name' => 'event_type', 'value' => 'workflow_execution'],
                            ['name' => 'timestamp', 'value' => '={{$json.timestamp}}']
                        ]
                    ]
                ]
            ],

            // 10. Error Handler Node
            [
                'id' => 'error_handler',
                'name' => 'Error Handler',
                'type' => 'n8n-nodes-base.function',
                'typeVersion' => 1,
                'position' => [700, 500],
                'parameters' => [
                    'functionCode' => $this->getErrorHandlerCode()
                ]
            ]
        ];
    }

    /**
     * Get workflow connections configuration
     */
    protected function getWorkflowConnections(): array
    {
        return [
            'webhook_trigger' => [
                'main' => [
                    [
                        ['node' => 'data_processor', 'type' => 'main', 'index' => 0]
                    ]
                ]
            ],
            'data_processor' => [
                'main' => [
                    [
                        ['node' => 'kb_search', 'type' => 'main', 'index' => 0],
                        ['node' => 'conversation_history', 'type' => 'main', 'index' => 0]
                    ]
                ]
            ],
            'kb_search' => [
                'main' => [
                    [
                        ['node' => 'prompt_builder', 'type' => 'main', 'index' => 0]
                    ]
                ]
            ],
            'conversation_history' => [
                'main' => [
                    [
                        ['node' => 'prompt_builder', 'type' => 'main', 'index' => 0]
                    ]
                ]
            ],
            'prompt_builder' => [
                'main' => [
                    [
                        ['node' => 'ai_processor', 'type' => 'main', 'index' => 0]
                    ]
                ]
            ],
            'ai_processor' => [
                'main' => [
                    [
                        ['node' => 'response_formatter', 'type' => 'main', 'index' => 0]
                    ]
                ]
            ],
            'response_formatter' => [
                'main' => [
                    [
                        ['node' => 'waha_send', 'type' => 'main', 'index' => 0],
                        ['node' => 'analytics_logger', 'type' => 'main', 'index' => 0]
                    ]
                ]
            ]
        ];
    }

    /**
     * Get workflow settings
     */
    protected function getWorkflowSettings(array $config): array
    {
        return [
            'executionOrder' => 'v1',
            'saveManualExecutions' => true,
            'callerPolicy' => 'workflowsFromSameOwner',
            'timezone' => $config['timezone'] ?? 'Asia/Jakarta',
            'executionTimeout' => $config['timeout'] ?? 300,
            'maxExecutionTime' => $config['max_execution_time'] ?? 300,
        ];
    }

    /**
     * Create WAHA session for the workflow
     */
    protected function createWahaSession(string $organizationId, string $workflowId, array $config): array
    {
        $knowledgeBaseId = $config['knowledge_base_id'] ?? 'default';
        $sessionId = "session_{$organizationId}_{$knowledgeBaseId}";

        $sessionConfig = [
            'name' => $sessionId,
            'webhook' => [
                'url' => config('n8n.server.url') . "/webhook/kb-webhook/{$knowledgeBaseId}",
                'events' => ['message'],
                'hmac' => [
                    'key' => config('app.key')
                ]
            ],
            'noweb' => [
                'store' => [
                    'enabled' => true,
                    'fullHistory' => false
                ]
            ]
        ];

        return $this->wahaService->startSession($sessionId, $sessionConfig);
    }

    /**
     * Process incoming WhatsApp message through the workflow
     */
    public function processMessage(array $messageData): array
    {
        try {
            $organizationId = $this->extractOrganizationId($messageData);
            $knowledgeBaseId = $this->extractKnowledgeBaseId($messageData);

            // Get workflow metadata
            $workflowMetadata = Cache::get("ai_workflow_{$organizationId}_{$knowledgeBaseId}");
            if (!$workflowMetadata) {
                return [
                    'success' => false,
                    'message' => 'Workflow not found for this organization and knowledge base',
                ];
            }

            // Execute the workflow via webhook
            $webhookUrl = config('n8n.server.url') . "/webhook/kb-webhook/{$knowledgeBaseId}";

            $response = Http::timeout(30)
                ->post($webhookUrl, $messageData);

            if ($response->successful()) {
                return [
                    'success' => true,
                    'message' => 'Message processed successfully',
                    'data' => $response->json(),
                ];
            }

            return [
                'success' => false,
                'message' => 'Failed to process message through workflow',
                'error' => $response->body(),
            ];

        } catch (Exception $e) {
            Log::error('Failed to process message through AI Agent workflow', [
                'message_data' => $messageData,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return [
                'success' => false,
                'message' => 'Failed to process message: ' . $e->getMessage(),
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Get workflow analytics and metrics
     */
    public function getWorkflowAnalytics(string $organizationId, string $knowledgeBaseId): array
    {
        try {
            $workflowMetadata = Cache::get("ai_workflow_{$organizationId}_{$knowledgeBaseId}");
            if (!$workflowMetadata) {
                return [
                    'success' => false,
                    'message' => 'Workflow not found',
                ];
            }

            $workflowId = $workflowMetadata['workflow_id'];

            // Get workflow statistics
            $stats = $this->n8nService->getWorkflowStats($workflowId);
            $executions = $this->n8nService->getWorkflowExecutions($workflowId, 50);

            return [
                'success' => true,
                'data' => [
                    'workflow_metadata' => $workflowMetadata,
                    'statistics' => $stats,
                    'recent_executions' => $executions,
                    'performance_metrics' => $this->calculatePerformanceMetrics($executions['data'] ?? []),
                ],
            ];

        } catch (Exception $e) {
            Log::error('Failed to get workflow analytics', [
                'organization_id' => $organizationId,
                'knowledge_base_id' => $knowledgeBaseId,
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'message' => 'Failed to get workflow analytics: ' . $e->getMessage(),
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Delete AI Agent workflow and cleanup resources
     */
    public function deleteAiAgentWorkflow(string $organizationId, string $knowledgeBaseId): array
    {
        try {
            $workflowMetadata = Cache::get("ai_workflow_{$organizationId}_{$knowledgeBaseId}");
            if (!$workflowMetadata) {
                return [
                    'success' => false,
                    'message' => 'Workflow not found',
                ];
            }

            $workflowId = $workflowMetadata['workflow_id'];
            $sessionId = $workflowMetadata['session_id'];

            // Deactivate and delete workflow
            $this->n8nService->deactivateWorkflow($workflowId);
            $workflowResult = $this->n8nService->deleteWorkflow($workflowId);

            // Delete WAHA session
            $sessionResult = $this->wahaService->deleteSession($sessionId);

            // Clear cache
            Cache::forget("ai_workflow_{$organizationId}_{$knowledgeBaseId}");

            return [
                'success' => true,
                'message' => 'AI Agent workflow deleted successfully',
                'data' => [
                    'workflow_deletion' => $workflowResult,
                    'session_deletion' => $sessionResult,
                ],
            ];

        } catch (Exception $e) {
            Log::error('Failed to delete AI Agent workflow', [
                'organization_id' => $organizationId,
                'knowledge_base_id' => $knowledgeBaseId,
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'message' => 'Failed to delete AI Agent workflow: ' . $e->getMessage(),
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Extract organization ID from message data
     */
    protected function extractOrganizationId(array $messageData): ?string
    {
        // Extract from session ID pattern: session_{org_id}_{kb_id}
        if (isset($messageData['session'])) {
            $parts = explode('_', $messageData['session']);
            if (count($parts) >= 3 && $parts[0] === 'session') {
                return $parts[1];
            }
        }

        return $messageData['organization_id'] ?? null;
    }

    /**
     * Extract knowledge base ID from message data
     */
    protected function extractKnowledgeBaseId(array $messageData): ?string
    {
        // Extract from session ID pattern: session_{org_id}_{kb_id}
        if (isset($messageData['session'])) {
            $parts = explode('_', $messageData['session']);
            if (count($parts) >= 3 && $parts[0] === 'session') {
                return $parts[2];
            }
        }

        return $messageData['knowledge_base_id'] ?? 'default';
    }

    /**
     * Calculate performance metrics from execution data
     */
    protected function calculatePerformanceMetrics(array $executions): array
    {
        if (empty($executions)) {
            return [
                'total_executions' => 0,
                'success_rate' => 0,
                'average_duration' => 0,
                'error_rate' => 0,
            ];
        }

        $total = count($executions);
        $successful = array_filter($executions, fn($exec) => ($exec['status'] ?? '') === 'success');
        $successCount = count($successful);

        $durations = array_filter(array_map(function($exec) {
            if (isset($exec['startedAt']) && isset($exec['finishedAt'])) {
                $start = new \DateTime($exec['startedAt']);
                $end = new \DateTime($exec['finishedAt']);
                return $end->getTimestamp() - $start->getTimestamp();
            }
            return null;
        }, $executions));

        return [
            'total_executions' => $total,
            'success_rate' => $total > 0 ? round(($successCount / $total) * 100, 2) : 0,
            'error_rate' => $total > 0 ? round((($total - $successCount) / $total) * 100, 2) : 0,
            'average_duration' => !empty($durations) ? round(array_sum($durations) / count($durations), 2) : 0,
            'min_duration' => !empty($durations) ? min($durations) : 0,
            'max_duration' => !empty($durations) ? max($durations) : 0,
        ];
    }

    /**
     * Get JavaScript code for data processor node
     */
    protected function getDataProcessorCode(string $organizationId, string $knowledgeBaseId): string
    {
        return "
// Extract and enrich data from webhook
const webhookData = \$input.first().json;

// Parse session to get organization info
const sessionParts = webhookData.session ? webhookData.session.split('_') : [];
const extractedOrgId = sessionParts.length >= 3 ? sessionParts[2] : '{$organizationId}';

// Build enriched context
const enrichedData = {
  // Original message data
  session_id: webhookData.session,
  from: webhookData.from,
  message: webhookData.text || webhookData.message,
  timestamp: webhookData.timestamp || new Date().toISOString(),
  message_id: webhookData.messageId || webhookData.id,

  // Extracted context
  organization_id: extractedOrgId,
  knowledge_base_id: '{$knowledgeBaseId}',

  // AI context
  user_message: webhookData.text || webhookData.message,
  user_phone: webhookData.from,
  current_time: new Date().toISOString(),
  user_timezone: 'Asia/Jakarta',

  // Conversation context
  conversation_history: [],
  user_preferences: {},

  // Metadata
  workflow_id: 'ai-agent-workflow',
  execution_id: \$execution.id,
  node_id: 'data_processor'
};

return { json: enrichedData };
        ";
    }

    /**
     * Get JavaScript code for prompt builder node
     */
    protected function getPromptBuilderCode(): string
    {
        return "
// Get data from previous nodes
const kbResults = \$('kb_search').first().json.data || [];
const conversationHistory = \$('conversation_history').first().json.data || [];
const userMessage = \$('data_processor').first().json.user_message;
const organizationId = \$('data_processor').first().json.organization_id;
const userPhone = \$('data_processor').first().json.user_phone;

// Build knowledge base context
let kbContext = '';
if (kbResults.length > 0) {
  kbContext = '\\n\\n📚 Pengetahuan yang tersedia:\\n';
  kbResults.forEach((item, index) => {
    kbContext += `\${index + 1}. **\${item.title}**\\n   \${item.excerpt || item.description}\\n   Kategori: \${item.category || 'General'}\\n   Relevansi: \${Math.round((item.relevance_score || 0) * 100)}%\\n\\n`;
  });
}

// Build conversation context
let convContext = '';
if (conversationHistory.length > 0) {
  convContext = '\\n\\n💬 Riwayat Percakapan:\\n';
  conversationHistory.slice(-5).forEach((msg, index) => {
    const sender = msg.sender === 'customer' ? 'Customer' : 'Agent';
    convContext += `\${sender}: \${msg.message}\\n`;
  });
}

// Build system prompt
const systemPrompt = `Anda adalah asisten AI untuk customer service yang profesional dan ramah. Berikut adalah panduan untuk menjawab pertanyaan customer:

🎯 **PANDUAN RESPON:**
1. Selalu gunakan bahasa Indonesia yang sopan dan profesional
2. Berikan jawaban yang jelas, terstruktur, dan mudah dipahami
3. Gunakan emoji dengan bijak untuk membuat respons lebih ramah
4. Jika ada informasi yang tidak tersedia, minta customer untuk menghubungi tim support
5. Selalu akhiri dengan menanyakan apakah ada yang bisa dibantu lagi
6. Gunakan format yang rapi dengan bullet points atau numbering

📊 **INFORMASI CONTEXT:**
- Organization ID: \${organizationId}
- Customer Phone: \${userPhone}
- Waktu: \${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}
- Pertanyaan: \${userMessage}\${kbContext}\${convContext}

🎨 **FORMAT RESPON:**
- Gunakan heading dengan **bold**
- Gunakan bullet points (•) atau numbering (1. 2. 3.)
- Gunakan emoji yang relevan
- Akhiri dengan signature yang ramah

Jawablah dengan format yang rapi dan mudah dibaca.`;

return {
  json: {
    system_prompt: systemPrompt,
    user_message: userMessage,
    knowledge_base_results: kbResults,
    conversation_history: conversationHistory,
    organization_id: organizationId,
    user_phone: userPhone
  }
};
        ";
    }

    /**
     * Get JavaScript code for response formatter node
     */
    protected function getResponseFormatterCode(): string
    {
        return "
// Get AI response
const aiResponse = \$input.first().json.choices[0].message.content;
const userPhone = \$('data_processor').first().json.user_phone;
const sessionId = \$('data_processor').first().json.session_id;
const organizationId = \$('data_processor').first().json.organization_id;
const messageId = \$('data_processor').first().json.message_id;

// Clean up response
let formattedResponse = aiResponse.trim();

// Add metadata if not present
if (!formattedResponse.includes('Tim Support')) {
  formattedResponse += '\\n\\n💬 Jika ada pertanyaan lain, silakan hubungi Tim Support kami.';
}

// Add execution metadata
const executionMetadata = {
  workflow_id: 'ai-agent-workflow',
  execution_id: \$execution.id,
  node_id: 'response_formatter',
  timestamp: new Date().toISOString(),
  processing_time: Date.now() - new Date(\$('data_processor').first().json.timestamp).getTime()
};

// Prepare WAHA payload
const wahaPayload = {
  session: sessionId,
  to: userPhone,
  text: formattedResponse,
  timestamp: new Date().toISOString(),
  metadata: {
    organization_id: organizationId,
    message_id: messageId,
    response_type: 'ai_generated',
    execution_metadata: executionMetadata
  }
};

// Prepare analytics payload
const analyticsPayload = {
  workflow_id: 'ai-agent-workflow',
  execution_id: \$execution.id,
  organization_id: organizationId,
  session_id: sessionId,
  user_phone: userPhone,
  metrics: {
    processing_time: executionMetadata.processing_time,
    response_length: formattedResponse.length,
    kb_results_count: \$('kb_search').first().json.data ? \$('kb_search').first().json.data.length : 0,
    conversation_history_count: \$('conversation_history').first().json.data ? \$('conversation_history').first().json.data.length : 0
  },
  timestamp: new Date().toISOString()
};

return {
  json: {
    ...wahaPayload,
    analytics: analyticsPayload
  }
};
        ";
    }

    /**
     * Get JavaScript code for error handler node
     */
    protected function getErrorHandlerCode(): string
    {
        return "
// Handle errors gracefully
const error = \$input.first().json.error || 'Unknown error';
const userPhone = \$('data_processor').first().json.user_phone;
const sessionId = \$('data_processor').first().json.session_id;
const organizationId = \$('data_processor').first().json.organization_id;
const originalMessage = \$('data_processor').first().json.message;

// Log error with context
console.error('AI Agent Workflow error:', {
  error: error,
  session_id: sessionId,
  organization_id: organizationId,
  user_phone: userPhone,
  original_message: originalMessage,
  timestamp: new Date().toISOString(),
  workflow_id: 'ai-agent-workflow',
  execution_id: \$execution.id
});

// Determine error type and response
let fallbackMessage = '';
let errorType = 'unknown';

if (error.includes('timeout') || error.includes('TIMEOUT')) {
  errorType = 'timeout';
  fallbackMessage = `⏰ Maaf, sistem sedang sibuk. Tim support kami akan segera menghubungi Anda.\\n\\n🆔 Error ID: \${Date.now()}\\n\\nTerima kasih atas kesabaran Anda.`;
} else if (error.includes('unauthorized') || error.includes('401')) {
  errorType = 'auth';
  fallbackMessage = `🔐 Terjadi masalah autentikasi. Tim support kami akan segera menghubungi Anda.\\n\\n🆔 Error ID: \${Date.now()}\\n\\nTerima kasih atas kesabaran Anda.`;
} else if (error.includes('rate limit') || error.includes('429')) {
  errorType = 'rate_limit';
  fallbackMessage = `🚦 Terlalu banyak permintaan. Silakan coba lagi dalam beberapa menit.\\n\\n🆔 Error ID: \${Date.now()}\\n\\nTerima kasih atas kesabaran Anda.`;
} else if (error.includes('network') || error.includes('connection')) {
  errorType = 'network';
  fallbackMessage = `🌐 Terjadi masalah koneksi. Tim support kami akan segera menghubungi Anda.\\n\\n🆔 Error ID: \${Date.now()}\\n\\nTerima kasih atas kesabaran Anda.`;
} else {
  errorType = 'general';
  fallbackMessage = `❌ Maaf, terjadi kesalahan teknis. Tim support kami akan segera menghubungi Anda.\\n\\n🆔 Error ID: \${Date.now()}\\n\\nTerima kasih atas kesabaran Anda.`;
}

// Prepare fallback payload
const fallbackPayload = {
  session: sessionId,
  to: userPhone,
  text: fallbackMessage,
  timestamp: new Date().toISOString(),
  metadata: {
    organization_id: organizationId,
    error_type: errorType,
    error_message: error,
    fallback_response: true,
    original_message: originalMessage,
    execution_id: \$execution.id,
    workflow_id: 'ai-agent-workflow'
  }
};

return {
  json: fallbackPayload
};
        ";
    }
}
