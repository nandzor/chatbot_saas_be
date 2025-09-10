<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Resources\SubscriptionResource;
use App\Http\Requests\StoreSubscriptionRequest;
use App\Http\Requests\UpdateSubscriptionRequest;
use App\Http\Requests\BulkUpdateSubscriptionRequest;
use App\Services\SubscriptionService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;

class SubscriptionController extends BaseApiController
{

    protected $subscriptionService;

    public function __construct(SubscriptionService $subscriptionService)
    {
        $this->subscriptionService = $subscriptionService;
    }

    /**
     * Display a listing of subscriptions with filtering and pagination.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $filters = [
                'organization_id' => $request->get('organization_id'),
                'plan_id' => $request->get('plan_id'),
                'status' => $request->get('status'),
                'billing_cycle' => $request->get('billing_cycle'),
                'search' => $request->get('search'),
                'date_from' => $request->get('date_from'),
                'date_to' => $request->get('date_to'),
                'sort_by' => $request->get('sort_by', 'created_at'),
                'sort_direction' => $request->get('sort_direction', 'desc'),
                'per_page' => $request->get('per_page', 15),
                'page' => $request->get('page', 1),
            ];

            $subscriptions = $this->subscriptionService->getSubscriptions($filters);

            return $this->successResponse(
                'Subscriptions retrieved successfully',
                $subscriptions->through(fn($subscription) => new SubscriptionResource($subscription))
            );
        } catch (\Exception $e) {
            Log::error('Error fetching subscriptions', [
                'error' => $e->getMessage(),
                'user_id' => $this->getCurrentUser()?->id
            ]);

            return $this->serverErrorResponse(
                'Gagal mengambil daftar subscription'
            );
        }
    }

    /**
     * Display the specified subscription.
     *
     * @param string $id
     * @return JsonResponse
     */
    public function show(string $id): JsonResponse
    {
        try {
            $subscription = $this->subscriptionService->getSubscriptionById($id);

            if (!$subscription) {
                return $this->notFoundResponse('Subscription', $id);
            }

            return $this->successResponse(
                'Subscription retrieved successfully',
                new SubscriptionResource($subscription)
            );
        } catch (\Exception $e) {
            Log::error('Error fetching subscription', [
                'error' => $e->getMessage(),
                'subscription_id' => $id,
                'user_id' => $this->getCurrentUser()?->id
            ]);

            return $this->serverErrorResponse(
                'Gagal mengambil detail subscription'
            );
        }
    }

    /**
     * Get subscription statistics.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function statistics(Request $request): JsonResponse
    {
        try {
            $filters = [
                'organization_id' => $request->get('organization_id'),
                'date_from' => $request->get('date_from'),
                'date_to' => $request->get('date_to'),
            ];

            $statistics = $this->subscriptionService->getSubscriptionStatistics($filters);

            return $this->successResponse('Subscription statistics retrieved successfully', $statistics);
        } catch (\Exception $e) {
            Log::error('Error fetching subscription statistics', [
                'error' => $e->getMessage(),
                'user_id' => $this->getCurrentUser()?->id
            ]);

            return $this->serverErrorResponse(
                'Gagal mengambil statistik subscription'
            );
        }
    }

    /**
     * Get subscriptions by organization.
     *
     * @param string $organizationId
     * @param Request $request
     * @return JsonResponse
     */
    public function byOrganization(string $organizationId, Request $request): JsonResponse
    {
        try {
            $filters = [
                'organization_id' => $organizationId,
                'status' => $request->get('status'),
                'billing_cycle' => $request->get('billing_cycle'),
                'sort_by' => $request->get('sort_by', 'created_at'),
                'sort_direction' => $request->get('sort_direction', 'desc'),
                'per_page' => $request->get('per_page', 15),
                'page' => $request->get('page', 1),
            ];

            $subscriptions = $this->subscriptionService->getSubscriptions($filters);

            return $this->successResponse(
                'Organization subscriptions retrieved successfully',
                $subscriptions->through(fn($subscription) => new SubscriptionResource($subscription))
            );
        } catch (\Exception $e) {
            Log::error('Error fetching organization subscriptions', [
                'error' => $e->getMessage(),
                'organization_id' => $organizationId,
                'user_id' => $this->getCurrentUser()?->id
            ]);

            return $this->serverErrorResponse(
                'Gagal mengambil subscription organisasi'
            );
        }
    }

    /**
     * Get subscriptions by status.
     *
     * @param string $status
     * @param Request $request
     * @return JsonResponse
     */
    public function byStatus(string $status, Request $request): JsonResponse
    {
        try {
            $filters = [
                'status' => $status,
                'organization_id' => $request->get('organization_id'),
                'plan_id' => $request->get('plan_id'),
                'sort_by' => $request->get('sort_by', 'created_at'),
                'sort_direction' => $request->get('sort_direction', 'desc'),
                'per_page' => $request->get('per_page', 15),
                'page' => $request->get('page', 1),
            ];

            $subscriptions = $this->subscriptionService->getSubscriptions($filters);

            return $this->successResponse(
                "Subscriptions with status '{$status}' retrieved successfully",
                $subscriptions->through(fn($subscription) => new SubscriptionResource($subscription))
            );
        } catch (\Exception $e) {
            Log::error('Error fetching subscriptions by status', [
                'error' => $e->getMessage(),
                'status' => $status,
                'user_id' => $this->getCurrentUser()?->id
            ]);

            return $this->serverErrorResponse(
                'Gagal mengambil subscription berdasarkan status'
            );
        }
    }

    /**
     * Get subscriptions by billing cycle.
     *
     * @param string $billingCycle
     * @param Request $request
     * @return JsonResponse
     */
    public function byBillingCycle(string $billingCycle, Request $request): JsonResponse
    {
        try {
            $filters = [
                'billing_cycle' => $billingCycle,
                'organization_id' => $request->get('organization_id'),
                'plan_id' => $request->get('plan_id'),
                'status' => $request->get('status'),
                'sort_by' => $request->get('sort_by', 'created_at'),
                'sort_direction' => $request->get('sort_direction', 'desc'),
                'per_page' => $request->get('per_page', 15),
                'page' => $request->get('page', 1),
            ];

            $subscriptions = $this->subscriptionService->getSubscriptions($filters);

            return $this->successResponse(
                "Subscriptions with billing cycle '{$billingCycle}' retrieved successfully",
                $subscriptions->through(fn($subscription) => new SubscriptionResource($subscription))
            );
        } catch (\Exception $e) {
            Log::error('Error fetching subscriptions by billing cycle', [
                'error' => $e->getMessage(),
                'billing_cycle' => $billingCycle,
                'user_id' => $this->getCurrentUser()?->id
            ]);

            return $this->serverErrorResponse(
                'Gagal mengambil subscription berdasarkan billing cycle'
            );
        }
    }

    /**
     * Export subscriptions to CSV/Excel.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function export(Request $request): JsonResponse
    {
        try {
            $filters = [
                'organization_id' => $request->get('organization_id'),
                'plan_id' => $request->get('plan_id'),
                'status' => $request->get('status'),
                'billing_cycle' => $request->get('billing_cycle'),
                'search' => $request->get('search'),
                'date_from' => $request->get('date_from'),
                'date_to' => $request->get('date_to'),
                'format' => $request->get('format', 'csv'),
            ];

            $exportData = $this->subscriptionService->exportSubscriptions($filters);

            Log::info('Subscriptions exported', [
                'user_id' => $this->getCurrentUser()?->id,
                'filters' => $filters,
                'export_count' => count($exportData)
            ]);

            return $this->successResponse(
                'Subscriptions exported successfully',
                $exportData
            );
        } catch (\Exception $e) {
            Log::error('Error exporting subscriptions', [
                'error' => $e->getMessage(),
                'user_id' => $this->getCurrentUser()?->id
            ]);

            return $this->serverErrorResponse(
                'Gagal mengekspor subscription'
            );
        }
    }

    /**
     * Create a new subscription.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function store(StoreSubscriptionRequest $request): JsonResponse
    {
        try {
            $validatedData = $request->validated();
            $subscription = $this->subscriptionService->createSubscription($validatedData);

            Log::info('Subscription created', [
                'user_id' => $this->getCurrentUser()?->id,
                'subscription_id' => $subscription->id,
                'organization_id' => $validatedData['organization_id']
            ]);

            return $this->successResponse(
                'Subscription created successfully',
                new SubscriptionResource($subscription),
                201
            );
        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->validationErrorResponse($e->errors());
        } catch (\Exception $e) {
            Log::error('Error creating subscription', [
                'error' => $e->getMessage(),
                'user_id' => $this->getCurrentUser()?->id
            ]);

            return $this->serverErrorResponse(
                'Gagal membuat subscription'
            );
        }
    }

    /**
     * Update a subscription.
     *
     * @param Request $request
     * @param string $id
     * @return JsonResponse
     */
    public function update(UpdateSubscriptionRequest $request, string $id): JsonResponse
    {
        try {
            $validatedData = $request->validated();
            $subscription = $this->subscriptionService->updateSubscription($id, $validatedData);

            if (!$subscription) {
                return $this->notFoundResponse('Subscription', $id);
            }

            Log::info('Subscription updated', [
                'user_id' => $this->getCurrentUser()?->id,
                'subscription_id' => $id,
                'changes' => $validatedData
            ]);

            return $this->successResponse(
                'Subscription updated successfully',
                new SubscriptionResource($subscription)
            );
        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->validationErrorResponse($e->errors());
        } catch (\Exception $e) {
            Log::error('Error updating subscription', [
                'error' => $e->getMessage(),
                'user_id' => $this->getCurrentUser()?->id,
                'subscription_id' => $id
            ]);

            return $this->serverErrorResponse(
                'Gagal mengupdate subscription'
            );
        }
    }

    /**
     * Cancel a subscription.
     *
     * @param Request $request
     * @param string $id
     * @return JsonResponse
     */
    public function cancel(Request $request, string $id): JsonResponse
    {
        try {
            $validatedData = $request->validate([
                'cancellation_reason' => 'nullable|string|max:500',
                'cancel_at_period_end' => 'nullable|boolean',
            ]);

            $subscription = $this->subscriptionService->cancelSubscription($id, $validatedData);

            if (!$subscription) {
                return $this->notFoundResponse('Subscription', $id);
            }

            Log::info('Subscription cancelled', [
                'user_id' => $this->getCurrentUser()?->id,
                'subscription_id' => $id,
                'reason' => $validatedData['cancellation_reason'] ?? null
            ]);

            return $this->successResponse(
                'Subscription cancelled successfully',
                new SubscriptionResource($subscription)
            );
        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->validationErrorResponse($e->errors());
        } catch (\Exception $e) {
            Log::error('Error cancelling subscription', [
                'error' => $e->getMessage(),
                'user_id' => $this->getCurrentUser()?->id,
                'subscription_id' => $id
            ]);

            return $this->serverErrorResponse(
                'Gagal membatalkan subscription'
            );
        }
    }

    /**
     * Renew a subscription.
     *
     * @param Request $request
     * @param string $id
     * @return JsonResponse
     */
    public function renew(Request $request, string $id): JsonResponse
    {
        try {
            $validatedData = $request->validate([
                'billing_cycle' => 'nullable|in:monthly,quarterly,yearly,lifetime',
                'unit_amount' => 'nullable|numeric|min:0',
            ]);

            $subscription = $this->subscriptionService->renewSubscription($id, $validatedData);

            if (!$subscription) {
                return $this->notFoundResponse('Subscription', $id);
            }

            Log::info('Subscription renewed', [
                'user_id' => $this->getCurrentUser()?->id,
                'subscription_id' => $id,
                'changes' => $validatedData
            ]);

            return $this->successResponse(
                'Subscription renewed successfully',
                new SubscriptionResource($subscription)
            );
        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->validationErrorResponse($e->errors());
        } catch (\Exception $e) {
            Log::error('Error renewing subscription', [
                'error' => $e->getMessage(),
                'user_id' => $this->getCurrentUser()?->id,
                'subscription_id' => $id
            ]);

            return $this->serverErrorResponse(
                'Gagal memperpanjang subscription'
            );
        }
    }

    /**
     * Bulk update subscriptions.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function bulkUpdate(BulkUpdateSubscriptionRequest $request): JsonResponse
    {
        try {
            $validatedData = $request->validated();
            $result = $this->subscriptionService->bulkUpdateSubscriptions($validatedData);

            Log::info('Bulk subscription update', [
                'user_id' => $this->getCurrentUser()?->id,
                'subscription_count' => count($validatedData['subscription_ids']),
                'updates' => $validatedData
            ]);

            return $this->successResponse(
                "Successfully updated {$result['updated']} subscriptions",
                $result
            );
        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->validationErrorResponse($e->errors());
        } catch (\Exception $e) {
            Log::error('Error bulk updating subscriptions', [
                'error' => $e->getMessage(),
                'user_id' => $this->getCurrentUser()?->id
            ]);

            return $this->serverErrorResponse(
                'Gagal melakukan bulk update subscription'
            );
        }
    }

    /**
     * Get subscription analytics.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function analytics(Request $request): JsonResponse
    {
        try {
            $filters = [
                'organization_id' => $request->get('organization_id'),
                'date_from' => $request->get('date_from'),
                'date_to' => $request->get('date_to'),
                'period' => $request->get('period', 'monthly'), // daily, weekly, monthly, yearly
            ];

            $analytics = $this->subscriptionService->getSubscriptionAnalytics($filters);

            return $this->successResponse(
                'Subscription analytics retrieved successfully',
                $analytics
            );
        } catch (\Exception $e) {
            Log::error('Error fetching subscription analytics', [
                'error' => $e->getMessage(),
                'user_id' => $this->getCurrentUser()?->id
            ]);

            return $this->serverErrorResponse(
                'Gagal mengambil analytics subscription'
            );
        }
    }

    /**
     * Handle subscription webhook events.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function webhook(Request $request): JsonResponse
    {
        try {
            $eventType = $request->get('event_type');
            $subscriptionData = $request->get('subscription_data', []);

            Log::info('Subscription webhook received', [
                'event_type' => $eventType,
                'subscription_data' => $subscriptionData,
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);

            $result = $this->subscriptionService->handleWebhookEvent($eventType, $subscriptionData);

            return $this->successResponse(
                'Webhook processed successfully',
                $result
            );
        } catch (\Exception $e) {
            Log::error('Error processing subscription webhook', [
                'error' => $e->getMessage(),
                'event_type' => $request->get('event_type'),
                'ip_address' => $request->ip(),
            ]);

            return $this->serverErrorResponse(
                'Gagal memproses webhook subscription'
            );
        }
    }

    /**
     * Get subscription usage statistics.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function usage(Request $request): JsonResponse
    {
        try {
            $filters = [
                'organization_id' => $request->get('organization_id'),
                'subscription_id' => $request->get('subscription_id'),
                'date_from' => $request->get('date_from'),
                'date_to' => $request->get('date_to'),
            ];

            $usage = $this->subscriptionService->getSubscriptionUsage($filters);

            return $this->successResponse(
                'Subscription usage retrieved successfully',
                $usage
            );
        } catch (\Exception $e) {
            Log::error('Error fetching subscription usage', [
                'error' => $e->getMessage(),
                'user_id' => $this->getCurrentUser()?->id
            ]);

            return $this->serverErrorResponse(
                'Gagal mengambil usage subscription'
            );
        }
    }

    /**
     * Get subscription history/audit log.
     *
     * @param Request $request
     * @param string $id
     * @return JsonResponse
     */
    public function history(Request $request, string $id): JsonResponse
    {
        try {
            $filters = [
                'date_from' => $request->get('date_from'),
                'date_to' => $request->get('date_to'),
                'action' => $request->get('action'),
                'per_page' => $request->get('per_page', 15),
                'page' => $request->get('page', 1),
            ];

            $history = $this->subscriptionService->getSubscriptionHistory($id, $filters);

            return $this->successResponse(
                'Subscription history retrieved successfully',
                $history
            );
        } catch (\Exception $e) {
            Log::error('Error fetching subscription history', [
                'error' => $e->getMessage(),
                'subscription_id' => $id,
                'user_id' => $this->getCurrentUser()?->id
            ]);

            return $this->serverErrorResponse(
                'Gagal mengambil history subscription'
            );
        }
    }
}
