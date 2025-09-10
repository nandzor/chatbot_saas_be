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

    /**
     * Activate a subscription.
     */
    public function activate(string $id): JsonResponse
    {
        try {
            $subscription = $this->subscriptionService->activateSubscription($id);

            if (!$subscription) {
                return $this->notFoundResponse('Subscription', $id);
            }

            Log::info('Subscription activated', [
                'user_id' => $this->getCurrentUser()?->id,
                'subscription_id' => $id
            ]);

            return $this->successResponse(
                'Subscription activated successfully',
                new SubscriptionResource($subscription)
            );
        } catch (\Exception $e) {
            Log::error('Error activating subscription', [
                'error' => $e->getMessage(),
                'subscription_id' => $id,
                'user_id' => $this->getCurrentUser()?->id
            ]);

            return $this->serverErrorResponse('Gagal mengaktifkan subscription');
        }
    }

    /**
     * Suspend a subscription.
     */
    public function suspend(string $id): JsonResponse
    {
        try {
            $subscription = $this->subscriptionService->suspendSubscription($id);

            if (!$subscription) {
                return $this->notFoundResponse('Subscription', $id);
            }

            Log::info('Subscription suspended', [
                'user_id' => $this->getCurrentUser()?->id,
                'subscription_id' => $id
            ]);

            return $this->successResponse(
                'Subscription suspended successfully',
                new SubscriptionResource($subscription)
            );
        } catch (\Exception $e) {
            Log::error('Error suspending subscription', [
                'error' => $e->getMessage(),
                'subscription_id' => $id,
                'user_id' => $this->getCurrentUser()?->id
            ]);

            return $this->serverErrorResponse('Gagal menangguhkan subscription');
        }
    }

    /**
     * Upgrade a subscription.
     */
    public function upgrade(Request $request, string $id): JsonResponse
    {
        try {
            $validatedData = $request->validate([
                'new_plan_id' => 'required|string|exists:subscription_plans,id',
                'proration' => 'nullable|boolean',
                'effective_date' => 'nullable|date|after:today'
            ]);

            $subscription = $this->subscriptionService->upgradeSubscription($id, $validatedData);

            if (!$subscription) {
                return $this->notFoundResponse('Subscription', $id);
            }

            Log::info('Subscription upgraded', [
                'user_id' => $this->getCurrentUser()?->id,
                'subscription_id' => $id,
                'new_plan_id' => $validatedData['new_plan_id']
            ]);

            return $this->successResponse(
                'Subscription upgraded successfully',
                new SubscriptionResource($subscription)
            );
        } catch (\Exception $e) {
            Log::error('Error upgrading subscription', [
                'error' => $e->getMessage(),
                'subscription_id' => $id,
                'user_id' => $this->getCurrentUser()?->id
            ]);

            return $this->serverErrorResponse('Gagal mengupgrade subscription');
        }
    }

    /**
     * Downgrade a subscription.
     */
    public function downgrade(Request $request, string $id): JsonResponse
    {
        try {
            $validatedData = $request->validate([
                'new_plan_id' => 'required|string|exists:subscription_plans,id',
                'effective_date' => 'nullable|date|after:today'
            ]);

            $subscription = $this->subscriptionService->downgradeSubscription($id, $validatedData);

            if (!$subscription) {
                return $this->notFoundResponse('Subscription', $id);
            }

            Log::info('Subscription downgraded', [
                'user_id' => $this->getCurrentUser()?->id,
                'subscription_id' => $id,
                'new_plan_id' => $validatedData['new_plan_id']
            ]);

            return $this->successResponse(
                'Subscription downgraded successfully',
                new SubscriptionResource($subscription)
            );
        } catch (\Exception $e) {
            Log::error('Error downgrading subscription', [
                'error' => $e->getMessage(),
                'subscription_id' => $id,
                'user_id' => $this->getCurrentUser()?->id
            ]);

            return $this->serverErrorResponse('Gagal menurunkan subscription');
        }
    }

    /**
     * Get subscription billing information.
     */
    public function billing(string $id): JsonResponse
    {
        try {
            $billing = $this->subscriptionService->getSubscriptionBilling($id);

            if (!$billing) {
                return $this->notFoundResponse('Subscription', $id);
            }

            return $this->successResponse(
                'Subscription billing retrieved successfully',
                $billing
            );
        } catch (\Exception $e) {
            Log::error('Error fetching subscription billing', [
                'error' => $e->getMessage(),
                'subscription_id' => $id,
                'user_id' => $this->getCurrentUser()?->id
            ]);

            return $this->serverErrorResponse('Gagal mengambil billing subscription');
        }
    }

    /**
     * Process subscription billing.
     */
    public function processBilling(string $id): JsonResponse
    {
        try {
            $result = $this->subscriptionService->processSubscriptionBilling($id);

            if (!$result) {
                return $this->notFoundResponse('Subscription', $id);
            }

            Log::info('Subscription billing processed', [
                'user_id' => $this->getCurrentUser()?->id,
                'subscription_id' => $id
            ]);

            return $this->successResponse(
                'Subscription billing processed successfully',
                $result
            );
        } catch (\Exception $e) {
            Log::error('Error processing subscription billing', [
                'error' => $e->getMessage(),
                'subscription_id' => $id,
                'user_id' => $this->getCurrentUser()?->id
            ]);

            return $this->serverErrorResponse('Gagal memproses billing subscription');
        }
    }

    /**
     * Get subscription invoices.
     */
    public function invoices(string $id, Request $request): JsonResponse
    {
        try {
            $filters = [
                'status' => $request->get('status'),
                'date_from' => $request->get('date_from'),
                'date_to' => $request->get('date_to'),
                'per_page' => $request->get('per_page', 15),
                'page' => $request->get('page', 1),
            ];

            $invoices = $this->subscriptionService->getSubscriptionInvoices($id, $filters);

            return $this->successResponse(
                'Subscription invoices retrieved successfully',
                $invoices
            );
        } catch (\Exception $e) {
            Log::error('Error fetching subscription invoices', [
                'error' => $e->getMessage(),
                'subscription_id' => $id,
                'user_id' => $this->getCurrentUser()?->id
            ]);

            return $this->serverErrorResponse('Gagal mengambil invoice subscription');
        }
    }

    /**
     * Get specific subscription invoice.
     */
    public function invoice(string $id, string $invoiceId): JsonResponse
    {
        try {
            $invoice = $this->subscriptionService->getSubscriptionInvoice($id, $invoiceId);

            if (!$invoice) {
                return $this->notFoundResponse('Invoice', $invoiceId);
            }

            return $this->successResponse(
                'Subscription invoice retrieved successfully',
                $invoice
            );
        } catch (\Exception $e) {
            Log::error('Error fetching subscription invoice', [
                'error' => $e->getMessage(),
                'subscription_id' => $id,
                'invoice_id' => $invoiceId,
                'user_id' => $this->getCurrentUser()?->id
            ]);

            return $this->serverErrorResponse('Gagal mengambil invoice subscription');
        }
    }

    /**
     * Get subscription metrics.
     */
    public function metrics(string $id): JsonResponse
    {
        try {
            $metrics = $this->subscriptionService->getSubscriptionMetrics($id);

            if (!$metrics) {
                return $this->notFoundResponse('Subscription', $id);
            }

            return $this->successResponse(
                'Subscription metrics retrieved successfully',
                $metrics
            );
        } catch (\Exception $e) {
            Log::error('Error fetching subscription metrics', [
                'error' => $e->getMessage(),
                'subscription_id' => $id,
                'user_id' => $this->getCurrentUser()?->id
            ]);

            return $this->serverErrorResponse('Gagal mengambil metrics subscription');
        }
    }

    /**
     * Get usage overview.
     */
    public function usageOverview(Request $request): JsonResponse
    {
        try {
            $filters = [
                'organization_id' => $request->get('organization_id'),
                'date_from' => $request->get('date_from'),
                'date_to' => $request->get('date_to'),
            ];

            $overview = $this->subscriptionService->getUsageOverview($filters);

            return $this->successResponse(
                'Usage overview retrieved successfully',
                $overview
            );
        } catch (\Exception $e) {
            Log::error('Error fetching usage overview', [
                'error' => $e->getMessage(),
                'user_id' => $this->getCurrentUser()?->id
            ]);

            return $this->serverErrorResponse('Gagal mengambil overview usage');
        }
    }

    /**
     * Get my subscription (organization-scoped).
     */
    public function mySubscription(): JsonResponse
    {
        try {
            $user = $this->getCurrentUser();
            $subscription = $this->subscriptionService->getMySubscription($user->organization_id);

            return $this->successResponse(
                'My subscription retrieved successfully',
                $subscription ? new SubscriptionResource($subscription) : null
            );
        } catch (\Exception $e) {
            Log::error('Error fetching my subscription', [
                'error' => $e->getMessage(),
                'user_id' => $this->getCurrentUser()?->id
            ]);

            return $this->serverErrorResponse('Gagal mengambil subscription saya');
        }
    }

    /**
     * Get my usage (organization-scoped).
     */
    public function myUsage(): JsonResponse
    {
        try {
            $user = $this->getCurrentUser();
            $usage = $this->subscriptionService->getMyUsage($user->organization_id);

            return $this->successResponse(
                'My usage retrieved successfully',
                $usage
            );
        } catch (\Exception $e) {
            Log::error('Error fetching my usage', [
                'error' => $e->getMessage(),
                'user_id' => $this->getCurrentUser()?->id
            ]);

            return $this->serverErrorResponse('Gagal mengambil usage saya');
        }
    }

    /**
     * Get my billing (organization-scoped).
     */
    public function myBilling(): JsonResponse
    {
        try {
            $user = $this->getCurrentUser();
            $billing = $this->subscriptionService->getMyBilling($user->organization_id);

            return $this->successResponse(
                'My billing retrieved successfully',
                $billing
            );
        } catch (\Exception $e) {
            Log::error('Error fetching my billing', [
                'error' => $e->getMessage(),
                'user_id' => $this->getCurrentUser()?->id
            ]);

            return $this->serverErrorResponse('Gagal mengambil billing saya');
        }
    }

    /**
     * Get my invoices (organization-scoped).
     */
    public function myInvoices(Request $request): JsonResponse
    {
        try {
            $user = $this->getCurrentUser();
            $filters = [
                'status' => $request->get('status'),
                'date_from' => $request->get('date_from'),
                'date_to' => $request->get('date_to'),
                'per_page' => $request->get('per_page', 15),
                'page' => $request->get('page', 1),
            ];

            $invoices = $this->subscriptionService->getMyInvoices($user->organization_id, $filters);

            return $this->successResponse(
                'My invoices retrieved successfully',
                $invoices
            );
        } catch (\Exception $e) {
            Log::error('Error fetching my invoices', [
                'error' => $e->getMessage(),
                'user_id' => $this->getCurrentUser()?->id
            ]);

            return $this->serverErrorResponse('Gagal mengambil invoice saya');
        }
    }

    /**
     * Get my history (organization-scoped).
     */
    public function myHistory(Request $request): JsonResponse
    {
        try {
            $user = $this->getCurrentUser();
            $filters = [
                'date_from' => $request->get('date_from'),
                'date_to' => $request->get('date_to'),
                'action' => $request->get('action'),
                'per_page' => $request->get('per_page', 15),
                'page' => $request->get('page', 1),
            ];

            $history = $this->subscriptionService->getMyHistory($user->organization_id, $filters);

            return $this->successResponse(
                'My history retrieved successfully',
                $history
            );
        } catch (\Exception $e) {
            Log::error('Error fetching my history', [
                'error' => $e->getMessage(),
                'user_id' => $this->getCurrentUser()?->id
            ]);

            return $this->serverErrorResponse('Gagal mengambil history saya');
        }
    }

    /**
     * Get my metrics (organization-scoped).
     */
    public function myMetrics(): JsonResponse
    {
        try {
            $user = $this->getCurrentUser();
            $metrics = $this->subscriptionService->getMyMetrics($user->organization_id);

            return $this->successResponse(
                'My metrics retrieved successfully',
                $metrics
            );
        } catch (\Exception $e) {
            Log::error('Error fetching my metrics', [
                'error' => $e->getMessage(),
                'user_id' => $this->getCurrentUser()?->id
            ]);

            return $this->serverErrorResponse('Gagal mengambil metrics saya');
        }
    }

    /**
     * Request subscription upgrade.
     */
    public function requestUpgrade(Request $request): JsonResponse
    {
        try {
            $validatedData = $request->validate([
                'new_plan_id' => 'required|string|exists:subscription_plans,id',
                'reason' => 'nullable|string|max:500'
            ]);

            $user = $this->getCurrentUser();
            $result = $this->subscriptionService->requestUpgrade($user->organization_id, $validatedData);

            Log::info('Subscription upgrade requested', [
                'user_id' => $user->id,
                'organization_id' => $user->organization_id,
                'new_plan_id' => $validatedData['new_plan_id']
            ]);

            return $this->successResponse(
                'Subscription upgrade requested successfully',
                $result
            );
        } catch (\Exception $e) {
            Log::error('Error requesting subscription upgrade', [
                'error' => $e->getMessage(),
                'user_id' => $this->getCurrentUser()?->id
            ]);

            return $this->serverErrorResponse('Gagal meminta upgrade subscription');
        }
    }

    /**
     * Request subscription downgrade.
     */
    public function requestDowngrade(Request $request): JsonResponse
    {
        try {
            $validatedData = $request->validate([
                'new_plan_id' => 'required|string|exists:subscription_plans,id',
                'reason' => 'nullable|string|max:500'
            ]);

            $user = $this->getCurrentUser();
            $result = $this->subscriptionService->requestDowngrade($user->organization_id, $validatedData);

            Log::info('Subscription downgrade requested', [
                'user_id' => $user->id,
                'organization_id' => $user->organization_id,
                'new_plan_id' => $validatedData['new_plan_id']
            ]);

            return $this->successResponse(
                'Subscription downgrade requested successfully',
                $result
            );
        } catch (\Exception $e) {
            Log::error('Error requesting subscription downgrade', [
                'error' => $e->getMessage(),
                'user_id' => $this->getCurrentUser()?->id
            ]);

            return $this->serverErrorResponse('Gagal meminta downgrade subscription');
        }
    }

    /**
     * Request subscription cancellation.
     */
    public function requestCancellation(Request $request): JsonResponse
    {
        try {
            $validatedData = $request->validate([
                'reason' => 'nullable|string|max:500',
                'cancel_at_period_end' => 'nullable|boolean'
            ]);

            $user = $this->getCurrentUser();
            $result = $this->subscriptionService->requestCancellation($user->organization_id, $validatedData);

            Log::info('Subscription cancellation requested', [
                'user_id' => $user->id,
                'organization_id' => $user->organization_id,
                'reason' => $validatedData['reason'] ?? null
            ]);

            return $this->successResponse(
                'Subscription cancellation requested successfully',
                $result
            );
        } catch (\Exception $e) {
            Log::error('Error requesting subscription cancellation', [
                'error' => $e->getMessage(),
                'user_id' => $this->getCurrentUser()?->id
            ]);

            return $this->serverErrorResponse('Gagal meminta pembatalan subscription');
        }
    }

    /**
     * Request subscription renewal.
     */
    public function requestRenewal(Request $request): JsonResponse
    {
        try {
            $validatedData = $request->validate([
                'billing_cycle' => 'nullable|in:monthly,quarterly,yearly,lifetime'
            ]);

            $user = $this->getCurrentUser();
            $result = $this->subscriptionService->requestRenewal($user->organization_id, $validatedData);

            Log::info('Subscription renewal requested', [
                'user_id' => $user->id,
                'organization_id' => $user->organization_id
            ]);

            return $this->successResponse(
                'Subscription renewal requested successfully',
                $result
            );
        } catch (\Exception $e) {
            Log::error('Error requesting subscription renewal', [
                'error' => $e->getMessage(),
                'user_id' => $this->getCurrentUser()?->id
            ]);

            return $this->serverErrorResponse('Gagal meminta perpanjangan subscription');
        }
    }

    /**
     * Compare subscription plans.
     */
    public function comparePlans(Request $request): JsonResponse
    {
        try {
            $validatedData = $request->validate([
                'plan_ids' => 'required|array|min:2|max:5',
                'plan_ids.*' => 'required|string|exists:subscription_plans,id'
            ]);

            $comparison = $this->subscriptionService->comparePlans($validatedData['plan_ids']);

            return $this->successResponse(
                'Plan comparison retrieved successfully',
                $comparison
            );
        } catch (\Exception $e) {
            Log::error('Error comparing plans', [
                'error' => $e->getMessage(),
                'user_id' => $this->getCurrentUser()?->id
            ]);

            return $this->serverErrorResponse('Gagal membandingkan paket');
        }
    }

    /**
     * Get available plans.
     */
    public function availablePlans(Request $request): JsonResponse
    {
        try {
            $filters = [
                'tier' => $request->get('tier'),
                'billing_cycle' => $request->get('billing_cycle'),
                'status' => 'active'
            ];

            $plans = $this->subscriptionService->getAvailablePlans($filters);

            return $this->successResponse(
                'Available plans retrieved successfully',
                $plans
            );
        } catch (\Exception $e) {
            Log::error('Error fetching available plans', [
                'error' => $e->getMessage(),
                'user_id' => $this->getCurrentUser()?->id
            ]);

            return $this->serverErrorResponse('Gagal mengambil paket yang tersedia');
        }
    }

    /**
     * Get recommended plans.
     */
    public function recommendedPlans(Request $request): JsonResponse
    {
        try {
            $filters = [
                'organization_id' => $request->get('organization_id'),
                'current_plan_id' => $request->get('current_plan_id'),
                'usage_pattern' => $request->get('usage_pattern')
            ];

            $plans = $this->subscriptionService->getRecommendedPlans($filters);

            return $this->successResponse(
                'Recommended plans retrieved successfully',
                $plans
            );
        } catch (\Exception $e) {
            Log::error('Error fetching recommended plans', [
                'error' => $e->getMessage(),
                'user_id' => $this->getCurrentUser()?->id
            ]);

            return $this->serverErrorResponse('Gagal mengambil paket rekomendasi');
        }
    }

    /**
     * Get upgrade options.
     */
    public function upgradeOptions(): JsonResponse
    {
        try {
            $user = $this->getCurrentUser();
            $options = $this->subscriptionService->getUpgradeOptions($user->organization_id);

            return $this->successResponse(
                'Upgrade options retrieved successfully',
                $options
            );
        } catch (\Exception $e) {
            Log::error('Error fetching upgrade options', [
                'error' => $e->getMessage(),
                'user_id' => $this->getCurrentUser()?->id
            ]);

            return $this->serverErrorResponse('Gagal mengambil opsi upgrade');
        }
    }

    /**
     * Validate webhook.
     */
    public function validateWebhook(Request $request): JsonResponse
    {
        try {
            $result = $this->subscriptionService->validateWebhook($request->all());

            return $this->successResponse(
                'Webhook validation completed',
                $result
            );
        } catch (\Exception $e) {
            Log::error('Error validating webhook', [
                'error' => $e->getMessage(),
                'user_id' => $this->getCurrentUser()?->id
            ]);

            return $this->serverErrorResponse('Gagal memvalidasi webhook');
        }
    }

    /**
     * Get webhook logs.
     */
    public function webhookLogs(Request $request): JsonResponse
    {
        try {
            $filters = [
                'event_type' => $request->get('event_type'),
                'status' => $request->get('status'),
                'date_from' => $request->get('date_from'),
                'date_to' => $request->get('date_to'),
                'per_page' => $request->get('per_page', 15),
                'page' => $request->get('page', 1),
            ];

            $logs = $this->subscriptionService->getWebhookLogs($filters);

            return $this->successResponse(
                'Webhook logs retrieved successfully',
                $logs
            );
        } catch (\Exception $e) {
            Log::error('Error fetching webhook logs', [
                'error' => $e->getMessage(),
                'user_id' => $this->getCurrentUser()?->id
            ]);

            return $this->serverErrorResponse('Gagal mengambil log webhook');
        }
    }

    /**
     * Get specific webhook log.
     */
    public function webhookLog(string $id): JsonResponse
    {
        try {
            $log = $this->subscriptionService->getWebhookLog($id);

            if (!$log) {
                return $this->notFoundResponse('Webhook log', $id);
            }

            return $this->successResponse(
                'Webhook log retrieved successfully',
                $log
            );
        } catch (\Exception $e) {
            Log::error('Error fetching webhook log', [
                'error' => $e->getMessage(),
                'log_id' => $id,
                'user_id' => $this->getCurrentUser()?->id
            ]);

            return $this->serverErrorResponse('Gagal mengambil log webhook');
        }
    }

    /**
     * Test webhook.
     */
    public function testWebhook(Request $request): JsonResponse
    {
        try {
            $validatedData = $request->validate([
                'webhook_url' => 'required|url',
                'event_type' => 'required|string',
                'test_data' => 'nullable|array'
            ]);

            $result = $this->subscriptionService->testWebhook($validatedData);

            return $this->successResponse(
                'Webhook test completed',
                $result
            );
        } catch (\Exception $e) {
            Log::error('Error testing webhook', [
                'error' => $e->getMessage(),
                'user_id' => $this->getCurrentUser()?->id
            ]);

            return $this->serverErrorResponse('Gagal menguji webhook');
        }
    }

    /**
     * Retry webhook.
     */
    public function retryWebhook(string $id): JsonResponse
    {
        try {
            $result = $this->subscriptionService->retryWebhook($id);

            if (!$result) {
                return $this->notFoundResponse('Webhook log', $id);
            }

            Log::info('Webhook retry initiated', [
                'user_id' => $this->getCurrentUser()?->id,
                'webhook_log_id' => $id
            ]);

            return $this->successResponse(
                'Webhook retry initiated successfully',
                $result
            );
        } catch (\Exception $e) {
            Log::error('Error retrying webhook', [
                'error' => $e->getMessage(),
                'webhook_log_id' => $id,
                'user_id' => $this->getCurrentUser()?->id
            ]);

            return $this->serverErrorResponse('Gagal mengulang webhook');
        }
    }

    /**
     * Get subscriptions by plan.
     */
    public function byPlan(string $planId, Request $request): JsonResponse
    {
        try {
            $filters = [
                'plan_id' => $planId,
                'organization_id' => $request->get('organization_id'),
                'status' => $request->get('status'),
                'sort_by' => $request->get('sort_by', 'created_at'),
                'sort_direction' => $request->get('sort_direction', 'desc'),
                'per_page' => $request->get('per_page', 15),
                'page' => $request->get('page', 1),
            ];

            $subscriptions = $this->subscriptionService->getSubscriptions($filters);

            return $this->successResponse(
                "Subscriptions for plan '{$planId}' retrieved successfully",
                $subscriptions->through(fn($subscription) => new SubscriptionResource($subscription))
            );
        } catch (\Exception $e) {
            Log::error('Error fetching subscriptions by plan', [
                'error' => $e->getMessage(),
                'plan_id' => $planId,
                'user_id' => $this->getCurrentUser()?->id
            ]);

            return $this->serverErrorResponse('Gagal mengambil subscription berdasarkan paket');
        }
    }

    /**
     * Get active trials.
     */
    public function activeTrials(Request $request): JsonResponse
    {
        try {
            $filters = [
                'organization_id' => $request->get('organization_id'),
                'sort_by' => $request->get('sort_by', 'created_at'),
                'sort_direction' => $request->get('sort_direction', 'desc'),
                'per_page' => $request->get('per_page', 15),
                'page' => $request->get('page', 1),
            ];

            $trials = $this->subscriptionService->getActiveTrials($filters);

            return $this->successResponse(
                'Active trials retrieved successfully',
                $trials->through(fn($subscription) => new SubscriptionResource($subscription))
            );
        } catch (\Exception $e) {
            Log::error('Error fetching active trials', [
                'error' => $e->getMessage(),
                'user_id' => $this->getCurrentUser()?->id
            ]);

            return $this->serverErrorResponse('Gagal mengambil trial aktif');
        }
    }

    /**
     * Get expired trials.
     */
    public function expiredTrials(Request $request): JsonResponse
    {
        try {
            $filters = [
                'organization_id' => $request->get('organization_id'),
                'sort_by' => $request->get('sort_by', 'created_at'),
                'sort_direction' => $request->get('sort_direction', 'desc'),
                'per_page' => $request->get('per_page', 15),
                'page' => $request->get('page', 1),
            ];

            $trials = $this->subscriptionService->getExpiredTrials($filters);

            return $this->successResponse(
                'Expired trials retrieved successfully',
                $trials->through(fn($subscription) => new SubscriptionResource($subscription))
            );
        } catch (\Exception $e) {
            Log::error('Error fetching expired trials', [
                'error' => $e->getMessage(),
                'user_id' => $this->getCurrentUser()?->id
            ]);

            return $this->serverErrorResponse('Gagal mengambil trial yang expired');
        }
    }

    /**
     * Get expiring subscriptions.
     */
    public function expiringSubscriptions(Request $request): JsonResponse
    {
        try {
            $filters = [
                'organization_id' => $request->get('organization_id'),
                'days_ahead' => $request->get('days_ahead', 7),
                'sort_by' => $request->get('sort_by', 'ends_at'),
                'sort_direction' => $request->get('sort_direction', 'asc'),
                'per_page' => $request->get('per_page', 15),
                'page' => $request->get('page', 1),
            ];

            $subscriptions = $this->subscriptionService->getExpiringSubscriptions($filters);

            return $this->successResponse(
                'Expiring subscriptions retrieved successfully',
                $subscriptions->through(fn($subscription) => new SubscriptionResource($subscription))
            );
        } catch (\Exception $e) {
            Log::error('Error fetching expiring subscriptions', [
                'error' => $e->getMessage(),
                'user_id' => $this->getCurrentUser()?->id
            ]);

            return $this->serverErrorResponse('Gagal mengambil subscription yang akan berakhir');
        }
    }

    /**
     * Bulk cancel subscriptions.
     */
    public function bulkCancel(Request $request): JsonResponse
    {
        try {
            $validatedData = $request->validate([
                'subscription_ids' => 'required|array|min:1',
                'subscription_ids.*' => 'required|string|exists:subscriptions,id',
                'cancellation_reason' => 'nullable|string|max:500',
                'cancel_at_period_end' => 'nullable|boolean'
            ]);

            $result = $this->subscriptionService->bulkCancelSubscriptions($validatedData);

            Log::info('Bulk subscription cancellation', [
                'user_id' => $this->getCurrentUser()?->id,
                'subscription_count' => count($validatedData['subscription_ids']),
                'reason' => $validatedData['cancellation_reason'] ?? null
            ]);

            return $this->successResponse(
                "Successfully cancelled {$result['cancelled']} subscriptions",
                $result
            );
        } catch (\Exception $e) {
            Log::error('Error bulk cancelling subscriptions', [
                'error' => $e->getMessage(),
                'user_id' => $this->getCurrentUser()?->id
            ]);

            return $this->serverErrorResponse('Gagal melakukan bulk cancel subscription');
        }
    }

    /**
     * Bulk renew subscriptions.
     */
    public function bulkRenew(Request $request): JsonResponse
    {
        try {
            $validatedData = $request->validate([
                'subscription_ids' => 'required|array|min:1',
                'subscription_ids.*' => 'required|string|exists:subscriptions,id',
                'billing_cycle' => 'nullable|in:monthly,quarterly,yearly,lifetime',
                'unit_amount' => 'nullable|numeric|min:0'
            ]);

            $result = $this->subscriptionService->bulkRenewSubscriptions($validatedData);

            Log::info('Bulk subscription renewal', [
                'user_id' => $this->getCurrentUser()?->id,
                'subscription_count' => count($validatedData['subscription_ids'])
            ]);

            return $this->successResponse(
                "Successfully renewed {$result['renewed']} subscriptions",
                $result
            );
        } catch (\Exception $e) {
            Log::error('Error bulk renewing subscriptions', [
                'error' => $e->getMessage(),
                'user_id' => $this->getCurrentUser()?->id
            ]);

            return $this->serverErrorResponse('Gagal melakukan bulk renew subscription');
        }
    }

    /**
     * Delete subscription.
     */
    public function destroy(string $id): JsonResponse
    {
        try {
            $deleted = $this->subscriptionService->deleteSubscription($id);

            if (!$deleted) {
                return $this->notFoundResponse('Subscription', $id);
            }

            Log::info('Subscription deleted', [
                'user_id' => $this->getCurrentUser()?->id,
                'subscription_id' => $id
            ]);

            return $this->successResponse(
                'Subscription deleted successfully',
                null
            );
        } catch (\Exception $e) {
            Log::error('Error deleting subscription', [
                'error' => $e->getMessage(),
                'subscription_id' => $id,
                'user_id' => $this->getCurrentUser()?->id
            ]);

            return $this->serverErrorResponse('Gagal menghapus subscription');
        }
    }
}
