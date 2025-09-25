<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\BaseApiController;
use App\Models\ChatSession;
use App\Models\Agent;
use App\Models\AgentQueue;
use App\Models\AgentAvailability;
use App\Models\Message;
use App\Models\BotPersonality;
use App\Models\WahaSession;
use App\Services\InboxManagementService;
use App\Services\AgentAssignmentService;
use App\Services\MessageRoutingService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class InboxController extends BaseApiController
{
    protected $inboxService;
    protected $agentAssignmentService;
    protected $messageRoutingService;

    public function __construct(
        InboxManagementService $inboxService,
        AgentAssignmentService $agentAssignmentService,
        MessageRoutingService $messageRoutingService
    ) {
        $this->inboxService = $inboxService;
        $this->agentAssignmentService = $agentAssignmentService;
        $this->messageRoutingService = $messageRoutingService;
    }

    /**
     * Get inbox dashboard data with statistics and recent conversations.
     */
    public function dashboard(Request $request): JsonResponse
    {
        try {
            $organizationId = $this->getCurrentUser()->organization_id;

            $stats = $this->inboxService->getDashboardStats($organizationId);
            $recentConversations = $this->inboxService->getRecentConversations($organizationId, 20);
            $agentAvailability = $this->inboxService->getAgentAvailability($organizationId);
            $queueStats = $this->inboxService->getQueueStats($organizationId);

            return response()->json([
                'success' => true,
                'data' => [
                    'stats' => $stats,
                    'recent_conversations' => $recentConversations,
                    'agent_availability' => $agentAvailability,
                    'queue_stats' => $queueStats,
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Inbox dashboard error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to load inbox dashboard',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get conversations with filtering and pagination.
     */
    public function conversations(Request $request): JsonResponse
    {
        try {
            $organizationId = $this->getCurrentUser()->organization_id;

            $validator = Validator::make($request->all(), [
                'status' => 'sometimes|in:bot_handled,agent_assigned,agent_handling,escalated,resolved,closed',
                'priority' => 'sometimes|in:low,medium,high,urgent',
                'channel' => 'sometimes|string',
                'agent_id' => 'sometimes|uuid|exists:agents,id',
                'search' => 'sometimes|string|max:255',
                'page' => 'sometimes|integer|min:1',
                'per_page' => 'sometimes|integer|min:1|max:100',
                'sort_by' => 'sometimes|in:created_at,last_activity_at,priority,status',
                'sort_order' => 'sometimes|in:asc,desc',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $conversations = $this->inboxService->getConversations($organizationId, $request->all());

            return response()->json([
                'success' => true,
                'data' => $conversations
            ]);
        } catch (\Exception $e) {
            Log::error('Get conversations error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to load conversations',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get specific conversation with messages.
     */
    public function conversation(Request $request, string $id): JsonResponse
    {
        try {
            $organizationId = $this->getCurrentUser()->organization_id;

            $conversation = ChatSession::where('id', $id)
                ->where('organization_id', $organizationId)
                ->with([
                    'customer',
                    'assignedAgent',
                    'botPersonality',
                    'wahaSession',
                    'channelConfig',
                    'messages' => function ($query) {
                        $query->orderBy('created_at', 'asc');
                    }
                ])
                ->first();

            if (!$conversation) {
                return response()->json([
                    'success' => false,
                    'message' => 'Conversation not found'
                ], 404);
            }

            // Get conversation analytics
            $analytics = $this->inboxService->getConversationAnalytics($conversation->id);

            return response()->json([
                'success' => true,
                'data' => [
                    'conversation' => $conversation,
                    'analytics' => $analytics,
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Get conversation error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to load conversation',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Send message in conversation.
     */
    public function sendMessage(Request $request, string $id): JsonResponse
    {
        try {
            $organizationId = $this->getCurrentUser()->organization_id;
            $agentId = $this->getCurrentUser()->agent_id;

            $validator = Validator::make($request->all(), [
                'content' => 'required|string|max:4000',
                'message_type' => 'sometimes|in:text,image,file,audio,video',
                'attachments' => 'sometimes|array',
                'attachments.*.url' => 'required_with:attachments|url',
                'attachments.*.type' => 'required_with:attachments|string',
                'is_auto_response' => 'sometimes|boolean',
                'agent_notes' => 'sometimes|string|max:1000',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $conversation = ChatSession::where('id', $id)
                ->where('organization_id', $organizationId)
                ->first();

            if (!$conversation) {
                return response()->json([
                    'success' => false,
                    'message' => 'Conversation not found'
                ], 404);
            }

            // Check if agent is assigned to this conversation
            if ($conversation->assigned_agent_id !== $agentId) {
                return response()->json([
                    'success' => false,
                    'message' => 'You are not assigned to this conversation'
                ], 403);
            }

            $message = $this->messageRoutingService->sendAgentMessage(
                $conversation,
                $request->all(),
                $agentId
            );

            return response()->json([
                'success' => true,
                'data' => $message,
                'message' => 'Message sent successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Send message error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to send message',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Assign conversation to agent.
     */
    public function assignToAgent(Request $request, string $id): JsonResponse
    {
        try {
            $organizationId = $this->getCurrentUser()->organization_id;

            $validator = Validator::make($request->all(), [
                'agent_id' => 'required|uuid|exists:agents,id',
                'priority' => 'sometimes|in:low,medium,high,urgent',
                'notes' => 'sometimes|string|max:1000',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $conversation = ChatSession::where('id', $id)
                ->where('organization_id', $organizationId)
                ->first();

            if (!$conversation) {
                return response()->json([
                    'success' => false,
                    'message' => 'Conversation not found'
                ], 404);
            }

            $agent = Agent::where('id', $request->agent_id)
                ->where('organization_id', $organizationId)
                ->first();

            if (!$agent) {
                return response()->json([
                    'success' => false,
                    'message' => 'Agent not found'
                ], 404);
            }

            $success = $this->agentAssignmentService->assignConversationToAgent(
                $conversation,
                $agent,
                $request->all()
            );

            if (!$success) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to assign conversation to agent'
                ], 400);
            }

            return response()->json([
                'success' => true,
                'message' => 'Conversation assigned successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Assign to agent error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to assign conversation',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Start handling conversation.
     */
    public function startHandling(Request $request, string $id): JsonResponse
    {
        try {
            $organizationId = $this->getCurrentUser()->organization_id;
            $agentId = $this->getCurrentUser()->agent_id;

            $conversation = ChatSession::where('id', $id)
                ->where('organization_id', $organizationId)
                ->where('assigned_agent_id', $agentId)
                ->first();

            if (!$conversation) {
                return response()->json([
                    'success' => false,
                    'message' => 'Conversation not found or not assigned to you'
                ], 404);
            }

            $conversation->startAgentHandling();

            return response()->json([
                'success' => true,
                'message' => 'Started handling conversation'
            ]);
        } catch (\Exception $e) {
            Log::error('Start handling error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to start handling conversation',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * End handling conversation.
     */
    public function endHandling(Request $request, string $id): JsonResponse
    {
        try {
            $organizationId = $this->getCurrentUser()->organization_id;
            $agentId = $this->getCurrentUser()->agent_id;

            $validator = Validator::make($request->all(), [
                'resolution_type' => 'sometimes|string|max:100',
                'resolution_notes' => 'sometimes|string|max:1000',
                'satisfaction_rating' => 'sometimes|integer|min:1|max:5',
                'feedback_text' => 'sometimes|string|max:1000',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $conversation = ChatSession::where('id', $id)
                ->where('organization_id', $organizationId)
                ->where('assigned_agent_id', $agentId)
                ->first();

            if (!$conversation) {
                return response()->json([
                    'success' => false,
                    'message' => 'Conversation not found or not assigned to you'
                ], 404);
            }

            $conversation->endAgentHandling();

            // Record feedback if provided
            if ($request->has('satisfaction_rating')) {
                $conversation->recordFeedback(
                    $request->satisfaction_rating,
                    $request->feedback_text
                );
            }

            return response()->json([
                'success' => true,
                'message' => 'Ended handling conversation'
            ]);
        } catch (\Exception $e) {
            Log::error('End handling error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to end handling conversation',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Transfer conversation to another agent.
     */
    public function transferToAgent(Request $request, string $id): JsonResponse
    {
        try {
            $organizationId = $this->getCurrentUser()->organization_id;
            $currentAgentId = $request->user()->agent_id;

            $validator = Validator::make($request->all(), [
                'agent_id' => 'required|uuid|exists:agents,id',
                'notes' => 'required|string|max:1000',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $conversation = ChatSession::where('id', $id)
                ->where('organization_id', $organizationId)
                ->where('assigned_agent_id', $currentAgentId)
                ->first();

            if (!$conversation) {
                return response()->json([
                    'success' => false,
                    'message' => 'Conversation not found or not assigned to you'
                ], 404);
            }

            $newAgent = Agent::where('id', $request->agent_id)
                ->where('organization_id', $organizationId)
                ->first();

            if (!$newAgent) {
                return response()->json([
                    'success' => false,
                    'message' => 'Target agent not found'
                ], 404);
            }

            $success = $conversation->transferToAgent($newAgent, $request->notes);

            if (!$success) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to transfer conversation'
                ], 400);
            }

            return response()->json([
                'success' => true,
                'message' => 'Conversation transferred successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Transfer to agent error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to transfer conversation',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Escalate conversation to another agent.
     */
    public function escalateToAgent(Request $request, string $id): JsonResponse
    {
        try {
            $organizationId = $this->getCurrentUser()->organization_id;
            $currentAgentId = $request->user()->agent_id;

            $validator = Validator::make($request->all(), [
                'agent_id' => 'required|uuid|exists:agents,id',
                'reason' => 'required|string|max:1000',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $conversation = ChatSession::where('id', $id)
                ->where('organization_id', $organizationId)
                ->where('assigned_agent_id', $currentAgentId)
                ->first();

            if (!$conversation) {
                return response()->json([
                    'success' => false,
                    'message' => 'Conversation not found or not assigned to you'
                ], 404);
            }

            $newAgent = Agent::where('id', $request->agent_id)
                ->where('organization_id', $organizationId)
                ->first();

            if (!$newAgent) {
                return response()->json([
                    'success' => false,
                    'message' => 'Target agent not found'
                ], 404);
            }

            $success = $conversation->escalateToAgent($newAgent, $request->reason);

            if (!$success) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to escalate conversation'
                ], 400);
            }

            return response()->json([
                'success' => true,
                'message' => 'Conversation escalated successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Escalate to agent error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to escalate conversation',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Request human intervention for bot-handled conversation.
     */
    public function requestHumanIntervention(Request $request, string $id): JsonResponse
    {
        try {
            $organizationId = $this->getCurrentUser()->organization_id;

            $validator = Validator::make($request->all(), [
                'reason' => 'sometimes|string|max:1000',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $conversation = ChatSession::where('id', $id)
                ->where('organization_id', $organizationId)
                ->where('session_status', 'bot_handled')
                ->first();

            if (!$conversation) {
                return response()->json([
                    'success' => false,
                    'message' => 'Conversation not found or already handled by human'
                ], 404);
            }

            $conversation->requestHumanIntervention($request->reason);

            return response()->json([
                'success' => true,
                'message' => 'Human intervention requested successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Request human intervention error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to request human intervention',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get agent queue for current agent.
     */
    public function agentQueue(Request $request): JsonResponse
    {
        try {
            $organizationId = $this->getCurrentUser()->organization_id;
            $agentId = $this->getCurrentUser()->agent_id;

            $queue = AgentQueue::where('organization_id', $organizationId)
                ->where('agent_id', $agentId)
                ->with(['chatSession.customer', 'chatSession.botPersonality'])
                ->orderBy('priority', 'desc')
                ->orderBy('queued_at', 'asc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $queue
            ]);
        } catch (\Exception $e) {
            Log::error('Get agent queue error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to load agent queue',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get available agents for assignment.
     */
    public function availableAgents(Request $request): JsonResponse
    {
        try {
            $organizationId = $this->getCurrentUser()->organization_id;

            $agents = Agent::where('organization_id', $organizationId)
                ->whereHas('availability', function ($query) {
                    $query->where('status', 'online')
                          ->where('work_mode', 'available')
                          ->whereRaw('current_active_chats < max_concurrent_chats');
                })
                ->with(['availability', 'user'])
                ->get();

            return response()->json([
                'success' => true,
                'data' => $agents
            ]);
        } catch (\Exception $e) {
            Log::error('Get available agents error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to load available agents',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get message templates for agents.
     */
    public function messageTemplates(Request $request): JsonResponse
    {
        try {
            $organizationId = $this->getCurrentUser()->organization_id;
            $agentId = $this->getCurrentUser()->agent_id;

            $templates = \App\Models\AgentMessageTemplate::where('organization_id', $organizationId)
                ->where(function ($query) use ($agentId) {
                    $query->where('is_public', true)
                          ->orWhere('created_by_agent_id', $agentId);
                })
                ->where('is_active', true)
                ->orderBy('category')
                ->orderBy('name')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $templates
            ]);
        } catch (\Exception $e) {
            Log::error('Get message templates error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to load message templates',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
