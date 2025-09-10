<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\WebhookEvent\StoreWebhookEventRequest;
use App\Http\Requests\Api\V1\WebhookEvent\UpdateWebhookEventRequest;
use App\Http\Resources\Api\V1\WebhookEventResource;
use App\Models\WebhookEvent;
use App\Services\WebhookEventService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Log;

class WebhookEventController extends Controller
{
    protected WebhookEventService $webhookEventService;

    public function __construct(WebhookEventService $webhookEventService)
    {
        $this->webhookEventService = $webhookEventService;
    }

    /**
     * Display a listing of webhook events
     */
    public function index(Request $request)
    {
        try {
            $query = WebhookEvent::query();

            // Apply filters
            if ($request->has('gateway')) {
                $query->byGateway($request->gateway);
            }

            if ($request->has('event_type')) {
                $query->byEventType($request->event_type);
            }

            if ($request->has('status')) {
                $query->where('status', $request->status);
            }

            if ($request->has('organization_id')) {
                $query->byOrganization($request->organization_id);
            }

            if ($request->has('date_from')) {
                $query->where('created_at', '>=', $request->date_from);
            }

            if ($request->has('date_to')) {
                $query->where('created_at', '<=', $request->date_to);
            }

            // Apply sorting
            $sortBy = $request->get('sort_by', 'created_at');
            $sortOrder = $request->get('sort_order', 'desc');
            $query->orderBy($sortBy, $sortOrder);

            // Pagination
            $perPage = $request->get('per_page', 15);
            $webhookEvents = $query->paginate($perPage);

            return WebhookEventResource::collection($webhookEvents);
        } catch (\Exception $e) {
            Log::error('Failed to fetch webhook events', [
                'error' => $e->getMessage(),
                'filters' => $request->all(),
            ]);

            return response()->json([
                'message' => 'Failed to fetch webhook events',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    /**
     * Store a newly created webhook event
     */
    public function store(StoreWebhookEventRequest $request): JsonResponse
    {
        try {
            $webhookEvent = $this->webhookEventService->create($request->validated());

            Log::info('Webhook event created', [
                'webhook_event_id' => $webhookEvent->id,
                'gateway' => $webhookEvent->gateway,
                'event_type' => $webhookEvent->event_type,
            ]);

            return response()->json([
                'message' => 'Webhook event created successfully',
                'data' => new WebhookEventResource($webhookEvent),
            ], 201);
        } catch (\Exception $e) {
            Log::error('Failed to create webhook event', [
                'error' => $e->getMessage(),
                'data' => $request->validated(),
            ]);

            return response()->json([
                'message' => 'Failed to create webhook event',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    /**
     * Display the specified webhook event
     */
    public function show(WebhookEvent $webhookEvent): JsonResponse
    {
        try {
            return response()->json([
                'data' => new WebhookEventResource($webhookEvent),
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to fetch webhook event', [
                'webhook_event_id' => $webhookEvent->id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'Failed to fetch webhook event',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    /**
     * Update the specified webhook event
     */
    public function update(UpdateWebhookEventRequest $request, WebhookEvent $webhookEvent): JsonResponse
    {
        try {
            $updatedWebhookEvent = $this->webhookEventService->update($webhookEvent, $request->validated());

            Log::info('Webhook event updated', [
                'webhook_event_id' => $webhookEvent->id,
                'changes' => $request->validated(),
            ]);

            return response()->json([
                'message' => 'Webhook event updated successfully',
                'data' => new WebhookEventResource($updatedWebhookEvent),
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to update webhook event', [
                'webhook_event_id' => $webhookEvent->id,
                'error' => $e->getMessage(),
                'data' => $request->validated(),
            ]);

            return response()->json([
                'message' => 'Failed to update webhook event',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    /**
     * Remove the specified webhook event
     */
    public function destroy(WebhookEvent $webhookEvent): JsonResponse
    {
        try {
            $this->webhookEventService->delete($webhookEvent);

            Log::info('Webhook event deleted', [
                'webhook_event_id' => $webhookEvent->id,
            ]);

            return response()->json([
                'message' => 'Webhook event deleted successfully',
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to delete webhook event', [
                'webhook_event_id' => $webhookEvent->id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'Failed to delete webhook event',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    /**
     * Retry failed webhook event
     */
    public function retry(WebhookEvent $webhookEvent): JsonResponse
    {
        try {
            if (!$webhookEvent->can_retry) {
                return response()->json([
                    'message' => 'Webhook event cannot be retried',
                    'error' => 'Maximum retry count reached or status not eligible for retry',
                ], 400);
            }

            $this->webhookEventService->retry($webhookEvent);

            Log::info('Webhook event retry initiated', [
                'webhook_event_id' => $webhookEvent->id,
                'retry_count' => $webhookEvent->retry_count,
            ]);

            return response()->json([
                'message' => 'Webhook event retry initiated successfully',
                'data' => new WebhookEventResource($webhookEvent->fresh()),
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to retry webhook event', [
                'webhook_event_id' => $webhookEvent->id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'Failed to retry webhook event',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    /**
     * Get webhook event statistics
     */
    public function statistics(Request $request): JsonResponse
    {
        try {
            $stats = $this->webhookEventService->getStatistics($request->all());

            return response()->json([
                'data' => $stats,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to fetch webhook event statistics', [
                'error' => $e->getMessage(),
                'filters' => $request->all(),
            ]);

            return response()->json([
                'message' => 'Failed to fetch webhook event statistics',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    /**
     * Get webhook events ready for retry
     */
    public function readyForRetry()
    {
        try {
            $webhookEvents = WebhookEvent::readyForRetry()->get();

            return WebhookEventResource::collection($webhookEvents);
        } catch (\Exception $e) {
            Log::error('Failed to fetch webhook events ready for retry', [
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'Failed to fetch webhook events ready for retry',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    /**
     * Bulk retry failed webhook events
     */
    public function bulkRetry(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'webhook_event_ids' => 'required|array',
                'webhook_event_ids.*' => 'exists:webhook_events,id',
            ]);

            $results = $this->webhookEventService->bulkRetry($request->webhook_event_ids);

            Log::info('Bulk webhook event retry completed', [
                'total_requested' => count($request->webhook_event_ids),
                'successful' => count(array_filter($results)),
                'failed' => count(array_filter($results, fn($result) => !$result)),
            ]);

            return response()->json([
                'message' => 'Bulk retry completed',
                'data' => [
                    'total_requested' => count($request->webhook_event_ids),
                    'successful' => count(array_filter($results)),
                    'failed' => count(array_filter($results, fn($result) => !$result)),
                    'results' => $results,
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to bulk retry webhook events', [
                'error' => $e->getMessage(),
                'webhook_event_ids' => $request->webhook_event_ids ?? [],
            ]);

            return response()->json([
                'message' => 'Failed to bulk retry webhook events',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    /**
     * Get webhook event logs
     */
    public function logs(WebhookEvent $webhookEvent): JsonResponse
    {
        try {
            $logs = $this->webhookEventService->getLogs($webhookEvent);

            return response()->json([
                'data' => $logs,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to fetch webhook event logs', [
                'webhook_event_id' => $webhookEvent->id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'Failed to fetch webhook event logs',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }
}
