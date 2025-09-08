<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\BaseApiController;
use App\Services\AnalyticsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class AnalyticsController extends BaseApiController
{
    protected AnalyticsService $analyticsService;

    public function __construct(AnalyticsService $analyticsService)
    {
        $this->analyticsService = $analyticsService;
    }

    /**
     * Get dashboard analytics
     */
    public function dashboard(Request $request): JsonResponse
    {
        try {
            $filters = $this->getFilterParams($request, [
                'date_from', 'date_to', 'period', 'organization_id'
            ]);

            $analytics = $this->analyticsService->getDashboardAnalytics($filters);

            $this->logApiAction('dashboard_analytics_viewed', [
                'filters' => $filters
            ]);

            return $this->successResponseWithLog(
                'dashboard_analytics_viewed',
                'Dashboard analytics retrieved successfully',
                $analytics
            );
        } catch (\Exception $e) {
            return $this->errorResponseWithLog(
                'dashboard_analytics_error',
                'Failed to retrieve dashboard analytics',
                $e->getMessage(),
                500,
                'DASHBOARD_ANALYTICS_ERROR'
            );
        }
    }

    /**
     * Get usage analytics
     */
    public function usage(Request $request): JsonResponse
    {
        try {
            $filters = $this->getFilterParams($request, [
                'date_from', 'date_to', 'period', 'user_id', 'feature'
            ]);

            $analytics = $this->analyticsService->getUsageAnalytics($filters);

            $this->logApiAction('usage_analytics_viewed', [
                'filters' => $filters
            ]);

            return $this->successResponseWithLog(
                'usage_analytics_viewed',
                'Usage analytics retrieved successfully',
                $analytics
            );
        } catch (\Exception $e) {
            return $this->errorResponseWithLog(
                'usage_analytics_error',
                'Failed to retrieve usage analytics',
                $e->getMessage(),
                500,
                'USAGE_ANALYTICS_ERROR'
            );
        }
    }

    /**
     * Get performance analytics
     */
    public function performance(Request $request): JsonResponse
    {
        try {
            $filters = $this->getFilterParams($request, [
                'date_from', 'date_to', 'period', 'metric_type'
            ]);

            $analytics = $this->analyticsService->getPerformanceAnalytics($filters);

            $this->logApiAction('performance_analytics_viewed', [
                'filters' => $filters
            ]);

            return $this->successResponseWithLog(
                'performance_analytics_viewed',
                'Performance analytics retrieved successfully',
                $analytics
            );
        } catch (\Exception $e) {
            return $this->errorResponseWithLog(
                'performance_analytics_error',
                'Failed to retrieve performance analytics',
                $e->getMessage(),
                500,
                'PERFORMANCE_ANALYTICS_ERROR'
            );
        }
    }

    /**
     * Get chatbot analytics
     */
    public function chatbot(Request $request, string $chatbotId): JsonResponse
    {
        try {
            $filters = $this->getFilterParams($request, [
                'date_from', 'date_to', 'period'
            ]);

            $analytics = $this->analyticsService->getChatbotAnalytics($chatbotId, $filters);

            if (!$analytics) {
                return $this->errorResponseWithLog(
                    'chatbot_not_found',
                    'Chatbot not found',
                    "Chatbot with ID {$chatbotId} not found",
                    404,
                    'CHATBOT_NOT_FOUND'
                );
            }

            $this->logApiAction('chatbot_analytics_viewed', [
                'chatbot_id' => $chatbotId,
                'filters' => $filters
            ]);

            return $this->successResponseWithLog(
                'chatbot_analytics_viewed',
                'Chatbot analytics retrieved successfully',
                $analytics
            );
        } catch (\Exception $e) {
            return $this->errorResponseWithLog(
                'chatbot_analytics_error',
                'Failed to retrieve chatbot analytics',
                $e->getMessage(),
                500,
                'CHATBOT_ANALYTICS_ERROR'
            );
        }
    }

    /**
     * Get conversation analytics
     */
    public function conversations(Request $request): JsonResponse
    {
        try {
            $filters = $this->getFilterParams($request, [
                'date_from', 'date_to', 'period', 'session_type', 'agent_id'
            ]);

            $analytics = $this->analyticsService->getConversationAnalytics($filters);

            $this->logApiAction('conversation_analytics_viewed', [
                'filters' => $filters
            ]);

            return $this->successResponseWithLog(
                'conversation_analytics_viewed',
                'Conversation analytics retrieved successfully',
                $analytics
            );
        } catch (\Exception $e) {
            return $this->errorResponseWithLog(
                'conversation_analytics_error',
                'Failed to retrieve conversation analytics',
                $e->getMessage(),
                500,
                'CONVERSATION_ANALYTICS_ERROR'
            );
        }
    }

    /**
     * Get user analytics
     */
    public function users(Request $request): JsonResponse
    {
        try {
            $filters = $this->getFilterParams($request, [
                'date_from', 'date_to', 'period', 'role', 'department'
            ]);

            $analytics = $this->analyticsService->getUserAnalytics($filters);

            $this->logApiAction('user_analytics_viewed', [
                'filters' => $filters
            ]);

            return $this->successResponseWithLog(
                'user_analytics_viewed',
                'User analytics retrieved successfully',
                $analytics
            );
        } catch (\Exception $e) {
            return $this->errorResponseWithLog(
                'user_analytics_error',
                'Failed to retrieve user analytics',
                $e->getMessage(),
                500,
                'USER_ANALYTICS_ERROR'
            );
        }
    }

    /**
     * Get revenue analytics
     */
    public function revenue(Request $request): JsonResponse
    {
        try {
            $filters = $this->getFilterParams($request, [
                'date_from', 'date_to', 'period', 'subscription_tier'
            ]);

            $analytics = $this->analyticsService->getRevenueAnalytics($filters);

            $this->logApiAction('revenue_analytics_viewed', [
                'filters' => $filters
            ]);

            return $this->successResponseWithLog(
                'revenue_analytics_viewed',
                'Revenue analytics retrieved successfully',
                $analytics
            );
        } catch (\Exception $e) {
            return $this->errorResponseWithLog(
                'revenue_analytics_error',
                'Failed to retrieve revenue analytics',
                $e->getMessage(),
                500,
                'REVENUE_ANALYTICS_ERROR'
            );
        }
    }

    /**
     * Export analytics data
     */
    public function export(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'type' => 'required|string|in:dashboard,usage,performance,conversations,users,revenue',
                'format' => 'required|string|in:json,csv,xlsx',
                'date_from' => 'nullable|date',
                'date_to' => 'nullable|date|after_or_equal:date_from',
                'filters' => 'nullable|array'
            ]);

            $exportData = $this->analyticsService->exportAnalytics($request->validated());

            $this->logApiAction('analytics_exported', [
                'type' => $request->type,
                'format' => $request->format,
                'filters' => $request->filters
            ]);

            return $this->successResponseWithLog(
                'analytics_exported',
                'Analytics data exported successfully',
                $exportData
            );
        } catch (ValidationException $e) {
            return $this->errorResponseWithLog(
                'analytics_export_validation_error',
                'Export validation failed',
                $e->getMessage(),
                422,
                'VALIDATION_ERROR'
            );
        } catch (\Exception $e) {
            return $this->errorResponseWithLog(
                'analytics_export_error',
                'Failed to export analytics data',
                $e->getMessage(),
                500,
                'ANALYTICS_EXPORT_ERROR'
            );
        }
    }

    /**
     * Get real-time metrics
     */
    public function realtime(Request $request): JsonResponse
    {
        try {
            $metrics = $this->analyticsService->getRealtimeMetrics();

            return $this->successResponse(
                'Real-time metrics retrieved successfully',
                $metrics
            );
        } catch (\Exception $e) {
            return $this->errorResponseWithLog(
                'realtime_metrics_error',
                'Failed to retrieve real-time metrics',
                $e->getMessage(),
                500,
                'REALTIME_METRICS_ERROR'
            );
        }
    }
}
