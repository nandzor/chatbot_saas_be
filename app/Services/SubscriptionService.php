<?php

namespace App\Services;

use App\Models\Subscription;
use App\Models\Organization;
use App\Models\SubscriptionPlan;
use Illuminate\Pagination\LengthAwarePaginator;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class SubscriptionService
{
    /**
     * Get subscriptions with filtering and pagination.
     *
     * @param array $filters
     * @return LengthAwarePaginator
     */
    public function getSubscriptions(array $filters = []): LengthAwarePaginator
    {
        $query = Subscription::with(['organization', 'plan']);

        // Apply filters
        if (!empty($filters['organization_id'])) {
            $query->where('organization_id', $filters['organization_id']);
        }

        if (!empty($filters['plan_id'])) {
            $query->where('plan_id', $filters['plan_id']);
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['billing_cycle'])) {
            $query->where('billing_cycle', $filters['billing_cycle']);
        }

        if (!empty($filters['search'])) {
            $searchTerm = $filters['search'];
            $query->where(function ($q) use ($searchTerm) {
                $q->whereHas('organization', function ($orgQuery) use ($searchTerm) {
                    $orgQuery->where('name', 'ilike', "%{$searchTerm}%")
                        ->orWhere('display_name', 'ilike', "%{$searchTerm}%")
                        ->orWhere('email', 'ilike', "%{$searchTerm}%");
                })
                ->orWhereHas('plan', function ($planQuery) use ($searchTerm) {
                    $planQuery->where('name', 'ilike', "%{$searchTerm}%")
                        ->orWhere('display_name', 'ilike', "%{$searchTerm}%");
                })
                ->orWhere('currency', 'ilike', "%{$searchTerm}%")
                ->orWhere('cancellation_reason', 'ilike', "%{$searchTerm}%");
            });
        }

        if (!empty($filters['date_from'])) {
            $query->where('created_at', '>=', Carbon::parse($filters['date_from'])->startOfDay());
        }

        if (!empty($filters['date_to'])) {
            $query->where('created_at', '<=', Carbon::parse($filters['date_to'])->endOfDay());
        }

        // Apply sorting
        $sortBy = $filters['sort_by'] ?? 'created_at';
        $sortDirection = $filters['sort_direction'] ?? 'desc';

        // Handle special sorting cases
        switch ($sortBy) {
            case 'organization_name':
                $query->join('organizations', 'subscriptions.organization_id', '=', 'organizations.id')
                    ->orderBy('organizations.name', $sortDirection)
                    ->select('subscriptions.*');
                break;
            case 'plan_name':
                $query->join('subscription_plans', 'subscriptions.plan_id', '=', 'subscription_plans.id')
                    ->orderBy('subscription_plans.name', $sortDirection)
                    ->select('subscriptions.*');
                break;
            case 'amount':
                $query->orderBy('unit_amount', $sortDirection);
                break;
            default:
                $query->orderBy($sortBy, $sortDirection);
                break;
        }

        // Pagination
        $perPage = min($filters['per_page'] ?? 15, 100); // Max 100 per page
        $page = $filters['page'] ?? 1;

        return $query->paginate($perPage, ['*'], 'page', $page);
    }

    /**
     * Get subscription by ID.
     *
     * @param string $id
     * @return Subscription|null
     */
    public function getSubscriptionById(string $id): ?Subscription
    {
        return Subscription::with(['organization', 'plan'])->find($id);
    }

    /**
     * Get subscription statistics.
     *
     * @param array $filters
     * @return array
     */
    public function getSubscriptionStatistics(array $filters = []): array
    {
        $query = Subscription::query();

        // Apply filters
        if (!empty($filters['organization_id'])) {
            $query->where('organization_id', $filters['organization_id']);
        }

        if (!empty($filters['date_from'])) {
            $query->where('created_at', '>=', Carbon::parse($filters['date_from'])->startOfDay());
        }

        if (!empty($filters['date_to'])) {
            $query->where('created_at', '<=', Carbon::parse($filters['date_to'])->endOfDay());
        }

        $totalSubscriptions = $query->count();
        $activeSubscriptions = $query->clone()->where('status', 'success')->count();
        $pendingSubscriptions = $query->clone()->where('status', 'pending')->count();
        $cancelledSubscriptions = $query->clone()->where('status', 'cancelled')->count();
        $failedSubscriptions = $query->clone()->where('status', 'failed')->count();

        // Revenue statistics
        $totalRevenue = $query->clone()->where('status', 'success')->sum('unit_amount');
        $monthlyRevenue = $query->clone()
            ->where('status', 'success')
            ->where('billing_cycle', 'monthly')
            ->sum('unit_amount');
        $quarterlyRevenue = $query->clone()
            ->where('status', 'success')
            ->where('billing_cycle', 'quarterly')
            ->sum('unit_amount');
        $yearlyRevenue = $query->clone()
            ->where('status', 'success')
            ->where('billing_cycle', 'yearly')
            ->sum('unit_amount');

        // Billing cycle distribution
        $billingCycleStats = $query->clone()
            ->selectRaw('billing_cycle, COUNT(*) as count')
            ->groupBy('billing_cycle')
            ->pluck('count', 'billing_cycle')
            ->toArray();

        // Status distribution
        $statusStats = $query->clone()
            ->selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status')
            ->toArray();

        // Plan distribution
        $planStats = $query->clone()
            ->join('subscription_plans', 'subscriptions.plan_id', '=', 'subscription_plans.id')
            ->selectRaw('subscription_plans.name as plan_name, COUNT(*) as count')
            ->groupBy('subscription_plans.name')
            ->pluck('count', 'plan_name')
            ->toArray();

        // Monthly trends (last 12 months)
        $monthlyTrends = $query->clone()
            ->where('created_at', '>=', now()->subMonths(12))
            ->selectRaw('DATE_TRUNC(\'month\', created_at) as month, COUNT(*) as count, SUM(unit_amount) as total_amount')
            ->groupBy('month')
            ->orderBy('month')
            ->get()
            ->map(function ($item) {
                return [
                    'month' => $item->month->format('Y-m-d H:i:s'),
                    'count' => $item->count,
                    'total_amount' => (float) $item->total_amount,
                ];
            });

        // Success rate calculation
        $successRate = $totalSubscriptions > 0 ? ($activeSubscriptions / $totalSubscriptions) * 100 : 0;

        return [
            'total_subscriptions' => $totalSubscriptions,
            'active_subscriptions' => $activeSubscriptions,
            'pending_subscriptions' => $pendingSubscriptions,
            'cancelled_subscriptions' => $cancelledSubscriptions,
            'failed_subscriptions' => $failedSubscriptions,
            'total_revenue' => (float) $totalRevenue,
            'monthly_revenue' => (float) $monthlyRevenue,
            'quarterly_revenue' => (float) $quarterlyRevenue,
            'yearly_revenue' => (float) $yearlyRevenue,
            'success_rate' => round($successRate, 2),
            'billing_cycle_distribution' => $billingCycleStats,
            'status_distribution' => $statusStats,
            'plan_distribution' => $planStats,
            'monthly_trends' => $monthlyTrends,
        ];
    }

    /**
     * Get subscriptions by organization.
     *
     * @param string $organizationId
     * @param array $filters
     * @return LengthAwarePaginator
     */
    public function getSubscriptionsByOrganization(string $organizationId, array $filters = []): LengthAwarePaginator
    {
        $filters['organization_id'] = $organizationId;
        return $this->getSubscriptions($filters);
    }

    /**
     * Get subscriptions by status.
     *
     * @param string $status
     * @param array $filters
     * @return LengthAwarePaginator
     */
    public function getSubscriptionsByStatus(string $status, array $filters = []): LengthAwarePaginator
    {
        $filters['status'] = $status;
        return $this->getSubscriptions($filters);
    }

    /**
     * Get subscriptions by billing cycle.
     *
     * @param string $billingCycle
     * @param array $filters
     * @return LengthAwarePaginator
     */
    public function getSubscriptionsByBillingCycle(string $billingCycle, array $filters = []): LengthAwarePaginator
    {
        $filters['billing_cycle'] = $billingCycle;
        return $this->getSubscriptions($filters);
    }

    /**
     * Create a new subscription.
     *
     * @param array $data
     * @return Subscription
     */
    public function createSubscription(array $data): Subscription
    {
        return DB::transaction(function () use ($data) {
            $subscription = Subscription::create([
                'organization_id' => $data['organization_id'],
                'plan_id' => $data['plan_id'],
                'status' => 'pending',
                'billing_cycle' => $data['billing_cycle'],
                'unit_amount' => $data['unit_amount'],
                'currency' => $data['currency'],
                'discount_amount' => $data['discount_amount'] ?? 0,
                'tax_amount' => $data['tax_amount'] ?? 0,
                'trial_start' => $data['trial_start'] ?? null,
                'trial_end' => $data['trial_end'] ?? null,
                'current_period_start' => $data['current_period_start'],
                'current_period_end' => $data['current_period_end'],
                'metadata' => $data['metadata'] ?? [],
            ]);

            // Load relationships
            $subscription->load(['organization', 'plan']);

            return $subscription;
        });
    }

    /**
     * Update a subscription.
     *
     * @param string $id
     * @param array $data
     * @return Subscription|null
     */
    public function updateSubscription(string $id, array $data): ?Subscription
    {
        return DB::transaction(function () use ($id, $data) {
            $subscription = Subscription::find($id);

            if (!$subscription) {
                return null;
            }

            $subscription->update($data);
            $subscription->load(['organization', 'plan']);

            return $subscription;
        });
    }

    /**
     * Cancel a subscription.
     *
     * @param string $id
     * @param array $data
     * @return Subscription|null
     */
    public function cancelSubscription(string $id, array $data): ?Subscription
    {
        return DB::transaction(function () use ($id, $data) {
            $subscription = Subscription::find($id);

            if (!$subscription) {
                return null;
            }

            $subscription->update([
                'status' => 'cancelled',
                'canceled_at' => now(),
                'cancel_at_period_end' => $data['cancel_at_period_end'] ?? true,
                'cancellation_reason' => $data['cancellation_reason'] ?? null,
            ]);

            $subscription->load(['organization', 'plan']);

            return $subscription;
        });
    }

    /**
     * Renew a subscription.
     *
     * @param string $id
     * @param array $data
     * @return Subscription|null
     */
    public function renewSubscription(string $id, array $data): ?Subscription
    {
        return DB::transaction(function () use ($id, $data) {
            $subscription = Subscription::find($id);

            if (!$subscription) {
                return null;
            }

            $updateData = [];

            if (isset($data['billing_cycle'])) {
                $updateData['billing_cycle'] = $data['billing_cycle'];
            }

            if (isset($data['unit_amount'])) {
                $updateData['unit_amount'] = $data['unit_amount'];
            }

            // Calculate new period dates based on billing cycle
            $billingCycle = $data['billing_cycle'] ?? $subscription->billing_cycle;
            $currentEnd = Carbon::parse($subscription->current_period_end);

            switch ($billingCycle) {
                case 'monthly':
                    $newEnd = $currentEnd->copy()->addMonth();
                    break;
                case 'quarterly':
                    $newEnd = $currentEnd->copy()->addMonths(3);
                    break;
                case 'yearly':
                    $newEnd = $currentEnd->copy()->addYear();
                    break;
                case 'lifetime':
                    $newEnd = $currentEnd->copy()->addYears(100); // Effectively lifetime
                    break;
                default:
                    $newEnd = $currentEnd->copy()->addMonth();
            }

            $updateData['current_period_start'] = $currentEnd->copy();
            $updateData['current_period_end'] = $newEnd;
            $updateData['status'] = 'success';
            $updateData['next_payment_date'] = $newEnd;

            $subscription->update($updateData);
            $subscription->load(['organization', 'plan']);

            return $subscription;
        });
    }

    /**
     * Bulk update subscriptions.
     *
     * @param array $data
     * @return array
     */
    public function bulkUpdateSubscriptions(array $data): array
    {
        return DB::transaction(function () use ($data) {
            $subscriptionIds = $data['subscription_ids'];
            $updateData = collect($data)->except('subscription_ids')->toArray();

            $updated = Subscription::whereIn('id', $subscriptionIds)
                ->update($updateData);

            return [
                'updated' => $updated,
                'total' => count($subscriptionIds),
                'failed' => count($subscriptionIds) - $updated,
            ];
        });
    }

    /**
     * Export subscriptions.
     *
     * @param array $filters
     * @return array
     */
    public function exportSubscriptions(array $filters = []): array
    {
        $query = Subscription::with(['organization', 'plan']);

        // Apply same filters as getSubscriptions
        if (!empty($filters['organization_id'])) {
            $query->where('organization_id', $filters['organization_id']);
        }

        if (!empty($filters['plan_id'])) {
            $query->where('plan_id', $filters['plan_id']);
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['billing_cycle'])) {
            $query->where('billing_cycle', $filters['billing_cycle']);
        }

        if (!empty($filters['search'])) {
            $searchTerm = $filters['search'];
            $query->where(function ($q) use ($searchTerm) {
                $q->whereHas('organization', function ($orgQuery) use ($searchTerm) {
                    $orgQuery->where('name', 'ilike', "%{$searchTerm}%")
                        ->orWhere('display_name', 'ilike', "%{$searchTerm}%")
                        ->orWhere('email', 'ilike', "%{$searchTerm}%");
                })
                ->orWhereHas('plan', function ($planQuery) use ($searchTerm) {
                    $planQuery->where('name', 'ilike', "%{$searchTerm}%")
                        ->orWhere('display_name', 'ilike', "%{$searchTerm}%");
                });
            });
        }

        if (!empty($filters['date_from'])) {
            $query->where('created_at', '>=', Carbon::parse($filters['date_from'])->startOfDay());
        }

        if (!empty($filters['date_to'])) {
            $query->where('created_at', '<=', Carbon::parse($filters['date_to'])->endOfDay());
        }

        $subscriptions = $query->get();

        return $subscriptions->map(function ($subscription) {
            return [
                'id' => $subscription->id,
                'organization_name' => $subscription->organization->name,
                'organization_email' => $subscription->organization->email,
                'plan_name' => $subscription->plan->name,
                'plan_tier' => $subscription->plan->tier,
                'status' => $subscription->status,
                'billing_cycle' => $subscription->billing_cycle,
                'unit_amount' => $subscription->unit_amount,
                'currency' => $subscription->currency,
                'discount_amount' => $subscription->discount_amount,
                'tax_amount' => $subscription->tax_amount,
                'total_amount' => $subscription->unit_amount - $subscription->discount_amount + $subscription->tax_amount,
                'current_period_start' => $subscription->current_period_start?->format('Y-m-d H:i:s'),
                'current_period_end' => $subscription->current_period_end?->format('Y-m-d H:i:s'),
                'trial_start' => $subscription->trial_start?->format('Y-m-d H:i:s'),
                'trial_end' => $subscription->trial_end?->format('Y-m-d H:i:s'),
                'last_payment_date' => $subscription->last_payment_date?->format('Y-m-d H:i:s'),
                'next_payment_date' => $subscription->next_payment_date?->format('Y-m-d H:i:s'),
                'cancel_at_period_end' => $subscription->cancel_at_period_end,
                'canceled_at' => $subscription->canceled_at?->format('Y-m-d H:i:s'),
                'cancellation_reason' => $subscription->cancellation_reason,
                'created_at' => $subscription->created_at->format('Y-m-d H:i:s'),
                'updated_at' => $subscription->updated_at->format('Y-m-d H:i:s'),
            ];
        })->toArray();
    }

    /**
     * Get subscription analytics.
     *
     * @param array $filters
     * @return array
     */
    public function getSubscriptionAnalytics(array $filters = []): array
    {
        $query = Subscription::query();

        // Apply filters
        if (!empty($filters['organization_id'])) {
            $query->where('organization_id', $filters['organization_id']);
        }

        if (!empty($filters['date_from'])) {
            $query->where('created_at', '>=', Carbon::parse($filters['date_from'])->startOfDay());
        }

        if (!empty($filters['date_to'])) {
            $query->where('created_at', '<=', Carbon::parse($filters['date_to'])->endOfDay());
        }

        $period = $filters['period'] ?? 'monthly';
        $dateFormat = $this->getDateFormatForPeriod($period);

        // Growth metrics
        $growthData = $query->clone()
            ->selectRaw("DATE_TRUNC('{$period}', created_at) as period, COUNT(*) as count")
            ->where('created_at', '>=', now()->subMonths(12))
            ->groupBy('period')
            ->orderBy('period')
            ->get()
            ->map(function ($item) {
                return [
                    'period' => $item->period->format('Y-m-d'),
                    'count' => $item->count,
                ];
            });

        // Revenue trends
        $revenueData = $query->clone()
            ->selectRaw("DATE_TRUNC('{$period}', created_at) as period, SUM(unit_amount) as revenue")
            ->where('status', 'success')
            ->where('created_at', '>=', now()->subMonths(12))
            ->groupBy('period')
            ->orderBy('period')
            ->get()
            ->map(function ($item) {
                return [
                    'period' => $item->period->format('Y-m-d'),
                    'revenue' => (float) $item->revenue,
                ];
            });

        // Churn analysis
        $churnData = $query->clone()
            ->selectRaw("DATE_TRUNC('{$period}', canceled_at) as period, COUNT(*) as churned")
            ->whereNotNull('canceled_at')
            ->where('created_at', '>=', now()->subMonths(12))
            ->groupBy('period')
            ->orderBy('period')
            ->get()
            ->map(function ($item) {
                return [
                    'period' => $item->period->format('Y-m-d'),
                    'churned' => $item->churned,
                ];
            });

        // Plan performance
        $planPerformance = $query->clone()
            ->join('subscription_plans', 'subscriptions.plan_id', '=', 'subscription_plans.id')
            ->selectRaw('subscription_plans.name as plan_name, COUNT(*) as count, SUM(unit_amount) as revenue')
            ->groupBy('subscription_plans.name')
            ->get()
            ->map(function ($item) {
                return [
                    'plan_name' => $item->plan_name,
                    'count' => $item->count,
                    'revenue' => (float) $item->revenue,
                ];
            });

        // Geographic distribution (if organization has location data)
        $geographicData = $query->clone()
            ->join('organizations', 'subscriptions.organization_id', '=', 'organizations.id')
            ->selectRaw('organizations.timezone, COUNT(*) as count')
            ->groupBy('organizations.timezone')
            ->get()
            ->map(function ($item) {
                return [
                    'timezone' => $item->timezone,
                    'count' => $item->count,
                ];
            });

        return [
            'growth_metrics' => $growthData,
            'revenue_trends' => $revenueData,
            'churn_analysis' => $churnData,
            'plan_performance' => $planPerformance,
            'geographic_distribution' => $geographicData,
            'period' => $period,
            'generated_at' => now()->toISOString(),
        ];
    }

    /**
     * Get date format for period.
     *
     * @param string $period
     * @return string
     */
    private function getDateFormatForPeriod(string $period): string
    {
        return match ($period) {
            'daily' => 'day',
            'weekly' => 'week',
            'monthly' => 'month',
            'yearly' => 'year',
            default => 'month',
        };
    }

    /**
     * Handle webhook events for subscriptions.
     *
     * @param string $eventType
     * @param array $subscriptionData
     * @return array
     */
    public function handleWebhookEvent(string $eventType, array $subscriptionData): array
    {
        return DB::transaction(function () use ($eventType, $subscriptionData) {
            $subscriptionId = $subscriptionData['id'] ?? null;

            if (!$subscriptionId) {
                throw new \Exception('Subscription ID is required for webhook events');
            }

            $subscription = Subscription::find($subscriptionId);
            if (!$subscription) {
                throw new \Exception('Subscription not found');
            }

            $result = ['processed' => false, 'event_type' => $eventType];

            switch ($eventType) {
                case 'subscription.created':
                    $result['processed'] = true;
                    $result['message'] = 'Subscription created event processed';
                    break;

                case 'subscription.updated':
                    if (isset($subscriptionData['status'])) {
                        $subscription->update(['status' => $subscriptionData['status']]);
                    }
                    $result['processed'] = true;
                    $result['message'] = 'Subscription updated event processed';
                    break;

                case 'subscription.cancelled':
                    $subscription->update([
                        'status' => 'cancelled',
                        'canceled_at' => now(),
                        'cancellation_reason' => $subscriptionData['cancellation_reason'] ?? 'Webhook cancellation',
                    ]);
                    $result['processed'] = true;
                    $result['message'] = 'Subscription cancelled event processed';
                    break;

                case 'subscription.renewed':
                    $subscription->update([
                        'status' => 'success',
                        'current_period_start' => $subscriptionData['current_period_start'] ?? now(),
                        'current_period_end' => $subscriptionData['current_period_end'] ?? now()->addMonth(),
                        'next_payment_date' => $subscriptionData['next_payment_date'] ?? now()->addMonth(),
                    ]);
                    $result['processed'] = true;
                    $result['message'] = 'Subscription renewed event processed';
                    break;

                case 'payment.succeeded':
                    $subscription->update([
                        'status' => 'success',
                        'last_payment_date' => now(),
                    ]);
                    $result['processed'] = true;
                    $result['message'] = 'Payment succeeded event processed';
                    break;

                case 'payment.failed':
                    $subscription->update(['status' => 'failed']);
                    $result['processed'] = true;
                    $result['message'] = 'Payment failed event processed';
                    break;

                default:
                    $result['message'] = 'Unknown event type';
                    break;
            }

            // Log the webhook event
            Log::info('Subscription webhook processed', [
                'subscription_id' => $subscriptionId,
                'event_type' => $eventType,
                'processed' => $result['processed'],
            ]);

            return $result;
        });
    }

    /**
     * Get subscription usage statistics.
     *
     * @param array $filters
     * @return array
     */
    public function getSubscriptionUsage(array $filters = []): array
    {
        $query = Subscription::with(['organization', 'plan']);

        // Apply filters
        if (!empty($filters['organization_id'])) {
            $query->where('organization_id', $filters['organization_id']);
        }

        if (!empty($filters['subscription_id'])) {
            $query->where('id', $filters['subscription_id']);
        }

        if (!empty($filters['date_from'])) {
            $query->where('created_at', '>=', Carbon::parse($filters['date_from'])->startOfDay());
        }

        if (!empty($filters['date_to'])) {
            $query->where('created_at', '<=', Carbon::parse($filters['date_to'])->endOfDay());
        }

        $subscriptions = $query->get();

        $usageStats = [
            'total_subscriptions' => $subscriptions->count(),
            'active_subscriptions' => $subscriptions->where('status', 'success')->count(),
            'trial_subscriptions' => $subscriptions->where('status', 'pending')->count(),
            'cancelled_subscriptions' => $subscriptions->where('status', 'cancelled')->count(),
            'failed_subscriptions' => $subscriptions->where('status', 'failed')->count(),
            'total_revenue' => $subscriptions->where('status', 'success')->sum('unit_amount'),
            'average_revenue_per_subscription' => $subscriptions->where('status', 'success')->avg('unit_amount'),
            'billing_cycle_distribution' => $subscriptions->groupBy('billing_cycle')->map->count(),
            'plan_distribution' => $subscriptions->groupBy('plan.name')->map->count(),
            'monthly_recurring_revenue' => $subscriptions->where('status', 'success')
                ->where('billing_cycle', 'monthly')->sum('unit_amount'),
            'quarterly_recurring_revenue' => $subscriptions->where('status', 'success')
                ->where('billing_cycle', 'quarterly')->sum('unit_amount'),
            'yearly_recurring_revenue' => $subscriptions->where('status', 'success')
                ->where('billing_cycle', 'yearly')->sum('unit_amount'),
        ];

        return $usageStats;
    }

    /**
     * Get subscription history/audit log.
     *
     * @param string $subscriptionId
     * @param array $filters
     * @return LengthAwarePaginator
     */
    public function getSubscriptionHistory(string $subscriptionId, array $filters = []): LengthAwarePaginator
    {
        // For now, we'll create a mock history based on subscription changes
        // In a real implementation, you would have a separate audit_logs table

        $subscription = Subscription::find($subscriptionId);
        if (!$subscription) {
            return new LengthAwarePaginator([], 0, 15, 1);
        }

        $history = collect([
            [
                'id' => 1,
                'subscription_id' => $subscriptionId,
                'action' => 'created',
                'description' => 'Subscription created',
                'old_values' => null,
                'new_values' => $subscription->toArray(),
                'user_id' => null,
                'user_name' => 'System',
                'created_at' => $subscription->created_at,
            ],
            [
                'id' => 2,
                'subscription_id' => $subscriptionId,
                'action' => 'updated',
                'description' => 'Subscription status updated',
                'old_values' => ['status' => 'pending'],
                'new_values' => ['status' => $subscription->status],
                'user_id' => null,
                'user_name' => 'System',
                'created_at' => $subscription->updated_at,
            ],
        ]);

        // Apply filters
        if (!empty($filters['action'])) {
            $history = $history->where('action', $filters['action']);
        }

        if (!empty($filters['date_from'])) {
            $history = $history->where('created_at', '>=', Carbon::parse($filters['date_from'])->startOfDay());
        }

        if (!empty($filters['date_to'])) {
            $history = $history->where('created_at', '<=', Carbon::parse($filters['date_to'])->endOfDay());
        }

        $perPage = $filters['per_page'] ?? 15;
        $page = $filters['page'] ?? 1;

        return new LengthAwarePaginator(
            $history->forPage($page, $perPage)->values(),
            $history->count(),
            $perPage,
            $page,
            ['path' => request()->url()]
        );
    }

    /**
     * Activate a subscription.
     */
    public function activateSubscription(string $id): ?Subscription
    {
        return DB::transaction(function () use ($id) {
            $subscription = Subscription::find($id);
            if (!$subscription) {
                return null;
            }

            $subscription->update([
                'status' => 'success',
                'activated_at' => now(),
            ]);

            $subscription->load(['organization', 'plan']);
            return $subscription;
        });
    }

    /**
     * Suspend a subscription.
     */
    public function suspendSubscription(string $id): ?Subscription
    {
        return DB::transaction(function () use ($id) {
            $subscription = Subscription::find($id);
            if (!$subscription) {
                return null;
            }

            $subscription->update([
                'status' => 'suspended',
                'suspended_at' => now(),
            ]);

            $subscription->load(['organization', 'plan']);
            return $subscription;
        });
    }

    /**
     * Upgrade a subscription.
     */
    public function upgradeSubscription(string $id, array $data): ?Subscription
    {
        return DB::transaction(function () use ($id, $data) {
            $subscription = Subscription::find($id);
            if (!$subscription) {
                return null;
            }

            $newPlan = SubscriptionPlan::find($data['new_plan_id']);
            if (!$newPlan) {
                throw new \Exception('New plan not found');
            }

            $effectiveDate = $data['effective_date'] ?? now();
            $proration = $data['proration'] ?? true;

            // Calculate prorated amount if needed
            if ($proration) {
                $remainingDays = Carbon::parse($subscription->current_period_end)->diffInDays(now());
                $totalDays = Carbon::parse($subscription->current_period_start)->diffInDays($subscription->current_period_end);
                $prorationFactor = $remainingDays / $totalDays;

                $oldAmount = $subscription->unit_amount;
                $newAmount = $newPlan->unit_amount;
                $proratedAmount = ($newAmount - $oldAmount) * $prorationFactor;
            }

            $subscription->update([
                'plan_id' => $data['new_plan_id'],
                'unit_amount' => $newPlan->unit_amount,
                'status' => 'success',
                'upgraded_at' => now(),
            ]);

            $subscription->load(['organization', 'plan']);
            return $subscription;
        });
    }

    /**
     * Downgrade a subscription.
     */
    public function downgradeSubscription(string $id, array $data): ?Subscription
    {
        return DB::transaction(function () use ($id, $data) {
            $subscription = Subscription::find($id);
            if (!$subscription) {
                return null;
            }

            $newPlan = SubscriptionPlan::find($data['new_plan_id']);
            if (!$newPlan) {
                throw new \Exception('New plan not found');
            }

            $effectiveDate = $data['effective_date'] ?? $subscription->current_period_end;

            $subscription->update([
                'plan_id' => $data['new_plan_id'],
                'unit_amount' => $newPlan->unit_amount,
                'status' => 'success',
                'downgraded_at' => now(),
                'effective_date' => $effectiveDate,
            ]);

            $subscription->load(['organization', 'plan']);
            return $subscription;
        });
    }

    /**
     * Get subscription billing information.
     */
    public function getSubscriptionBilling(string $id): ?array
    {
        $subscription = Subscription::with(['organization', 'plan'])->find($id);
        if (!$subscription) {
            return null;
        }

        return [
            'subscription_id' => $subscription->id,
            'organization' => $subscription->organization,
            'plan' => $subscription->plan,
            'billing_cycle' => $subscription->billing_cycle,
            'unit_amount' => $subscription->unit_amount,
            'currency' => $subscription->currency,
            'discount_amount' => $subscription->discount_amount,
            'tax_amount' => $subscription->tax_amount,
            'total_amount' => $subscription->unit_amount - $subscription->discount_amount + $subscription->tax_amount,
            'current_period_start' => $subscription->current_period_start,
            'current_period_end' => $subscription->current_period_end,
            'next_payment_date' => $subscription->next_payment_date,
            'last_payment_date' => $subscription->last_payment_date,
            'payment_method' => $subscription->payment_method ?? 'card',
            'billing_address' => $subscription->billing_address ?? null,
        ];
    }

    /**
     * Process subscription billing.
     */
    public function processSubscriptionBilling(string $id): ?array
    {
        $subscription = Subscription::find($id);
        if (!$subscription) {
            return null;
        }

        // Simulate billing process
        $billingResult = [
            'subscription_id' => $id,
            'billing_date' => now(),
            'amount' => $subscription->unit_amount,
            'currency' => $subscription->currency,
            'status' => 'success',
            'transaction_id' => 'txn_' . uniqid(),
            'next_billing_date' => Carbon::parse($subscription->current_period_end)->addMonth(),
        ];

        // Update subscription
        $subscription->update([
            'last_payment_date' => now(),
            'next_payment_date' => $billingResult['next_billing_date'],
            'status' => 'success',
        ]);

        return $billingResult;
    }

    /**
     * Get subscription invoices.
     */
    public function getSubscriptionInvoices(string $id, array $filters = []): LengthAwarePaginator
    {
        $query = DB::table('invoices')
            ->where('subscription_id', $id);

        // Apply filters
        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['date_from'])) {
            $query->where('created_at', '>=', Carbon::parse($filters['date_from'])->startOfDay());
        }

        if (!empty($filters['date_to'])) {
            $query->where('created_at', '<=', Carbon::parse($filters['date_to'])->endOfDay());
        }

        $perPage = $filters['per_page'] ?? 15;
        $page = $filters['page'] ?? 1;

        return new LengthAwarePaginator(
            $query->orderBy('created_at', 'desc')->get(),
            $query->count(),
            $perPage,
            $page,
            ['path' => request()->url()]
        );
    }

    /**
     * Get specific subscription invoice.
     */
    public function getSubscriptionInvoice(string $id, string $invoiceId): ?array
    {
        $invoice = DB::table('invoices')
            ->where('id', $invoiceId)
            ->where('subscription_id', $id)
            ->first();

        return $invoice ? (array) $invoice : null;
    }

    /**
     * Get subscription metrics.
     */
    public function getSubscriptionMetrics(string $id): ?array
    {
        $subscription = Subscription::with(['organization', 'plan'])->find($id);
        if (!$subscription) {
            return null;
        }

        // Calculate metrics
        $daysActive = $subscription->created_at->diffInDays(now());
        $totalRevenue = $subscription->unit_amount * $daysActive / 30; // Approximate

        return [
            'subscription_id' => $id,
            'days_active' => $daysActive,
            'total_revenue' => $totalRevenue,
            'average_monthly_revenue' => $subscription->unit_amount,
            'billing_cycle' => $subscription->billing_cycle,
            'status' => $subscription->status,
            'plan_tier' => $subscription->plan->tier ?? 'basic',
            'organization_size' => $subscription->organization->company_size ?? 'unknown',
            'created_at' => $subscription->created_at,
            'last_payment_date' => $subscription->last_payment_date,
            'next_payment_date' => $subscription->next_payment_date,
        ];
    }

    /**
     * Get usage overview.
     */
    public function getUsageOverview(array $filters = []): array
    {
        $query = Subscription::query();

        if (!empty($filters['organization_id'])) {
            $query->where('organization_id', $filters['organization_id']);
        }

        if (!empty($filters['date_from'])) {
            $query->where('created_at', '>=', Carbon::parse($filters['date_from'])->startOfDay());
        }

        if (!empty($filters['date_to'])) {
            $query->where('created_at', '<=', Carbon::parse($filters['date_to'])->endOfDay());
        }

        $subscriptions = $query->get();

        return [
            'total_subscriptions' => $subscriptions->count(),
            'active_subscriptions' => $subscriptions->where('status', 'success')->count(),
            'total_revenue' => $subscriptions->where('status', 'success')->sum('unit_amount'),
            'average_revenue_per_subscription' => $subscriptions->where('status', 'success')->avg('unit_amount'),
            'billing_cycle_distribution' => $subscriptions->groupBy('billing_cycle')->map->count(),
            'plan_distribution' => $subscriptions->groupBy('plan.name')->map->count(),
        ];
    }

    /**
     * Get my subscription (organization-scoped).
     */
    public function getMySubscription(string $organizationId): ?Subscription
    {
        return Subscription::with(['organization', 'plan'])
            ->where('organization_id', $organizationId)
            ->where('status', 'success')
            ->first();
    }

    /**
     * Get my usage (organization-scoped).
     */
    public function getMyUsage(string $organizationId): array
    {
        $subscription = $this->getMySubscription($organizationId);
        if (!$subscription) {
            return [];
        }

        return [
            'subscription' => $subscription,
            'usage_metrics' => $this->getSubscriptionMetrics($subscription->id),
            'billing_info' => $this->getSubscriptionBilling($subscription->id),
        ];
    }

    /**
     * Get my billing (organization-scoped).
     */
    public function getMyBilling(string $organizationId): ?array
    {
        $subscription = $this->getMySubscription($organizationId);
        return $subscription ? $this->getSubscriptionBilling($subscription->id) : null;
    }

    /**
     * Get my invoices (organization-scoped).
     */
    public function getMyInvoices(string $organizationId, array $filters = []): LengthAwarePaginator
    {
        $subscription = $this->getMySubscription($organizationId);
        if (!$subscription) {
            return new LengthAwarePaginator([], 0, 15, 1);
        }

        return $this->getSubscriptionInvoices($subscription->id, $filters);
    }

    /**
     * Get my history (organization-scoped).
     */
    public function getMyHistory(string $organizationId, array $filters = []): LengthAwarePaginator
    {
        $subscription = $this->getMySubscription($organizationId);
        if (!$subscription) {
            return new LengthAwarePaginator([], 0, 15, 1);
        }

        return $this->getSubscriptionHistory($subscription->id, $filters);
    }

    /**
     * Get my metrics (organization-scoped).
     */
    public function getMyMetrics(string $organizationId): ?array
    {
        $subscription = $this->getMySubscription($organizationId);
        return $subscription ? $this->getSubscriptionMetrics($subscription->id) : null;
    }

    /**
     * Request subscription upgrade.
     */
    public function requestUpgrade(string $organizationId, array $data): array
    {
        $subscription = $this->getMySubscription($organizationId);
        if (!$subscription) {
            throw new \Exception('No active subscription found');
        }

        // Create upgrade request
        $request = [
            'id' => uniqid('upgrade_'),
            'organization_id' => $organizationId,
            'subscription_id' => $subscription->id,
            'current_plan_id' => $subscription->plan_id,
            'new_plan_id' => $data['new_plan_id'],
            'reason' => $data['reason'] ?? null,
            'status' => 'pending',
            'created_at' => now(),
        ];

        // In a real implementation, save to database
        Log::info('Subscription upgrade requested', $request);

        return $request;
    }

    /**
     * Request subscription downgrade.
     */
    public function requestDowngrade(string $organizationId, array $data): array
    {
        $subscription = $this->getMySubscription($organizationId);
        if (!$subscription) {
            throw new \Exception('No active subscription found');
        }

        // Create downgrade request
        $request = [
            'id' => uniqid('downgrade_'),
            'organization_id' => $organizationId,
            'subscription_id' => $subscription->id,
            'current_plan_id' => $subscription->plan_id,
            'new_plan_id' => $data['new_plan_id'],
            'reason' => $data['reason'] ?? null,
            'status' => 'pending',
            'created_at' => now(),
        ];

        Log::info('Subscription downgrade requested', $request);

        return $request;
    }

    /**
     * Request subscription cancellation.
     */
    public function requestCancellation(string $organizationId, array $data): array
    {
        $subscription = $this->getMySubscription($organizationId);
        if (!$subscription) {
            throw new \Exception('No active subscription found');
        }

        // Create cancellation request
        $request = [
            'id' => uniqid('cancel_'),
            'organization_id' => $organizationId,
            'subscription_id' => $subscription->id,
            'reason' => $data['reason'] ?? null,
            'cancel_at_period_end' => $data['cancel_at_period_end'] ?? true,
            'status' => 'pending',
            'created_at' => now(),
        ];

        Log::info('Subscription cancellation requested', $request);

        return $request;
    }

    /**
     * Request subscription renewal.
     */
    public function requestRenewal(string $organizationId, array $data): array
    {
        $subscription = $this->getMySubscription($organizationId);
        if (!$subscription) {
            throw new \Exception('No active subscription found');
        }

        // Create renewal request
        $request = [
            'id' => uniqid('renewal_'),
            'organization_id' => $organizationId,
            'subscription_id' => $subscription->id,
            'billing_cycle' => $data['billing_cycle'] ?? $subscription->billing_cycle,
            'status' => 'pending',
            'created_at' => now(),
        ];

        Log::info('Subscription renewal requested', $request);

        return $request;
    }

    /**
     * Compare subscription plans.
     */
    public function comparePlans(array $planIds): array
    {
        $plans = SubscriptionPlan::whereIn('id', $planIds)->get();

        $comparison = [];
        foreach ($plans as $plan) {
            $comparison[] = [
                'id' => $plan->id,
                'name' => $plan->name,
                'display_name' => $plan->display_name,
                'description' => $plan->description,
                'tier' => $plan->tier,
                'unit_amount' => $plan->unit_amount,
                'currency' => $plan->currency,
                'billing_cycle' => $plan->billing_cycle,
                'features' => $plan->features ?? [],
                'limits' => $plan->limits ?? [],
                'is_popular' => $plan->is_popular ?? false,
                'is_active' => $plan->is_active ?? true,
            ];
        }

        return $comparison;
    }

    /**
     * Get available plans.
     */
    public function getAvailablePlans(array $filters = []): array
    {
        $query = SubscriptionPlan::where('is_active', true);

        if (!empty($filters['tier'])) {
            $query->where('tier', $filters['tier']);
        }

        if (!empty($filters['billing_cycle'])) {
            $query->where('billing_cycle', $filters['billing_cycle']);
        }

        return $query->orderBy('sort_order')->get()->toArray();
    }

    /**
     * Get recommended plans.
     */
    public function getRecommendedPlans(array $filters = []): array
    {
        $query = SubscriptionPlan::where('is_active', true);

        if (!empty($filters['current_plan_id'])) {
            $currentPlan = SubscriptionPlan::find($filters['current_plan_id']);
            if ($currentPlan) {
                // Recommend higher tier plans
                $query->where('tier', '>', $currentPlan->tier);
            }
        }

        if (!empty($filters['usage_pattern'])) {
            // Recommend based on usage pattern
            switch ($filters['usage_pattern']) {
                case 'high':
                    $query->where('tier', 'enterprise');
                    break;
                case 'medium':
                    $query->where('tier', 'professional');
                    break;
                case 'low':
                    $query->where('tier', 'basic');
                    break;
            }
        }

        return $query->orderBy('sort_order')->limit(3)->get()->toArray();
    }

    /**
     * Get upgrade options.
     */
    public function getUpgradeOptions(string $organizationId): array
    {
        $subscription = $this->getMySubscription($organizationId);
        if (!$subscription) {
            return [];
        }

        $currentPlan = $subscription->plan;
        $upgradeOptions = SubscriptionPlan::where('is_active', true)
            ->where('tier', '>', $currentPlan->tier)
            ->orderBy('sort_order')
            ->get();

        return $upgradeOptions->map(function ($plan) use ($currentPlan) {
            return [
                'id' => $plan->id,
                'name' => $plan->name,
                'display_name' => $plan->display_name,
                'tier' => $plan->tier,
                'unit_amount' => $plan->unit_amount,
                'currency' => $plan->currency,
                'billing_cycle' => $plan->billing_cycle,
                'features' => $plan->features ?? [],
                'price_difference' => $plan->unit_amount - $currentPlan->unit_amount,
                'is_popular' => $plan->is_popular ?? false,
            ];
        })->toArray();
    }

    /**
     * Validate webhook.
     */
    public function validateWebhook(array $data): array
    {
        // Basic webhook validation
        $requiredFields = ['event_type', 'subscription_id'];
        $missingFields = [];

        foreach ($requiredFields as $field) {
            if (!isset($data[$field])) {
                $missingFields[] = $field;
            }
        }

        return [
            'valid' => empty($missingFields),
            'missing_fields' => $missingFields,
            'event_type' => $data['event_type'] ?? null,
            'subscription_id' => $data['subscription_id'] ?? null,
        ];
    }

    /**
     * Get webhook logs.
     */
    public function getWebhookLogs(array $filters = []): LengthAwarePaginator
    {
        $query = DB::table('webhook_logs');

        if (!empty($filters['event_type'])) {
            $query->where('event_type', $filters['event_type']);
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['date_from'])) {
            $query->where('created_at', '>=', Carbon::parse($filters['date_from'])->startOfDay());
        }

        if (!empty($filters['date_to'])) {
            $query->where('created_at', '<=', Carbon::parse($filters['date_to'])->endOfDay());
        }

        $perPage = $filters['per_page'] ?? 15;
        $page = $filters['page'] ?? 1;

        return new LengthAwarePaginator(
            $query->orderBy('created_at', 'desc')->get(),
            $query->count(),
            $perPage,
            $page,
            ['path' => request()->url()]
        );
    }

    /**
     * Get specific webhook log.
     */
    public function getWebhookLog(string $id): ?array
    {
        $log = DB::table('webhook_logs')->where('id', $id)->first();
        return $log ? (array) $log : null;
    }

    /**
     * Test webhook.
     */
    public function testWebhook(array $data): array
    {
        $webhookUrl = $data['webhook_url'];
        $eventType = $data['event_type'];
        $testData = $data['test_data'] ?? [];

        // Simulate webhook test
        $testResult = [
            'webhook_url' => $webhookUrl,
            'event_type' => $eventType,
            'status' => 'success',
            'response_code' => 200,
            'response_time_ms' => rand(50, 500),
            'tested_at' => now(),
            'test_data' => $testData,
        ];

        Log::info('Webhook test performed', $testResult);

        return $testResult;
    }

    /**
     * Retry webhook.
     */
    public function retryWebhook(string $id): ?array
    {
        $log = $this->getWebhookLog($id);
        if (!$log) {
            return null;
        }

        // Simulate webhook retry
        $retryResult = [
            'webhook_log_id' => $id,
            'status' => 'success',
            'response_code' => 200,
            'response_time_ms' => rand(50, 500),
            'retried_at' => now(),
            'retry_count' => ($log['retry_count'] ?? 0) + 1,
        ];

        Log::info('Webhook retry performed', $retryResult);

        return $retryResult;
    }

    /**
     * Get subscriptions by plan.
     */
    public function getSubscriptionsByPlan(string $planId, array $filters = []): LengthAwarePaginator
    {
        $filters['plan_id'] = $planId;
        return $this->getSubscriptions($filters);
    }

    /**
     * Get active trials.
     */
    public function getActiveTrials(array $filters = []): LengthAwarePaginator
    {
        $filters['status'] = 'pending';
        $query = Subscription::with(['organization', 'plan'])
            ->where('status', 'pending')
            ->whereNotNull('trial_start')
            ->where('trial_end', '>', now());

        // Apply additional filters
        if (!empty($filters['organization_id'])) {
            $query->where('organization_id', $filters['organization_id']);
        }

        $perPage = $filters['per_page'] ?? 15;
        $page = $filters['page'] ?? 1;

        return $query->orderBy('created_at', 'desc')->paginate($perPage, ['*'], 'page', $page);
    }

    /**
     * Get expired trials.
     */
    public function getExpiredTrials(array $filters = []): LengthAwarePaginator
    {
        $query = Subscription::with(['organization', 'plan'])
            ->where('status', 'pending')
            ->whereNotNull('trial_start')
            ->where('trial_end', '<', now());

        // Apply additional filters
        if (!empty($filters['organization_id'])) {
            $query->where('organization_id', $filters['organization_id']);
        }

        $perPage = $filters['per_page'] ?? 15;
        $page = $filters['page'] ?? 1;

        return $query->orderBy('trial_end', 'desc')->paginate($perPage, ['*'], 'page', $page);
    }

    /**
     * Get expiring subscriptions.
     */
    public function getExpiringSubscriptions(array $filters = []): LengthAwarePaginator
    {
        $daysAhead = $filters['days_ahead'] ?? 7;
        $expiryDate = now()->addDays($daysAhead);

        $query = Subscription::with(['organization', 'plan'])
            ->where('status', 'success')
            ->where('current_period_end', '<=', $expiryDate)
            ->where('current_period_end', '>', now());

        // Apply additional filters
        if (!empty($filters['organization_id'])) {
            $query->where('organization_id', $filters['organization_id']);
        }

        $perPage = $filters['per_page'] ?? 15;
        $page = $filters['page'] ?? 1;

        return $query->orderBy('current_period_end', 'asc')->paginate($perPage, ['*'], 'page', $page);
    }

    /**
     * Bulk cancel subscriptions.
     */
    public function bulkCancelSubscriptions(array $data): array
    {
        return DB::transaction(function () use ($data) {
            $subscriptionIds = $data['subscription_ids'];
            $cancellationData = collect($data)->except('subscription_ids')->toArray();

            $cancelled = 0;
            foreach ($subscriptionIds as $id) {
                $result = $this->cancelSubscription($id, $cancellationData);
                if ($result) {
                    $cancelled++;
                }
            }

            return [
                'cancelled' => $cancelled,
                'total' => count($subscriptionIds),
                'failed' => count($subscriptionIds) - $cancelled,
            ];
        });
    }

    /**
     * Bulk renew subscriptions.
     */
    public function bulkRenewSubscriptions(array $data): array
    {
        return DB::transaction(function () use ($data) {
            $subscriptionIds = $data['subscription_ids'];
            $renewalData = collect($data)->except('subscription_ids')->toArray();

            $renewed = 0;
            foreach ($subscriptionIds as $id) {
                $result = $this->renewSubscription($id, $renewalData);
                if ($result) {
                    $renewed++;
                }
            }

            return [
                'renewed' => $renewed,
                'total' => count($subscriptionIds),
                'failed' => count($subscriptionIds) - $renewed,
            ];
        });
    }

    /**
     * Delete subscription.
     */
    public function deleteSubscription(string $id): bool
    {
        return DB::transaction(function () use ($id) {
            $subscription = Subscription::find($id);
            if (!$subscription) {
                return false;
            }

            // Soft delete or hard delete based on business logic
            $subscription->delete();
            return true;
        });
    }
}
