<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\NotificationTemplate\StoreNotificationTemplateRequest;
use App\Http\Requests\Api\V1\NotificationTemplate\UpdateNotificationTemplateRequest;
use App\Http\Resources\Api\V1\NotificationTemplateResource;
use App\Models\NotificationTemplate;
use App\Services\NotificationTemplateService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Log;

class NotificationTemplateController extends Controller
{
    protected NotificationTemplateService $notificationTemplateService;

    public function __construct(NotificationTemplateService $notificationTemplateService)
    {
        $this->notificationTemplateService = $notificationTemplateService;
    }

    /**
     * Display a listing of notification templates
     */
    public function index(Request $request)
    {
        try {
            $query = NotificationTemplate::query();

            // Apply filters
            if ($request->has('type')) {
                $query->byType($request->type);
            }

            if ($request->has('category')) {
                $query->byCategory($request->category);
            }

            if ($request->has('language')) {
                $query->byLanguage($request->language);
            }

            if ($request->has('is_active')) {
                $query->where('is_active', $request->boolean('is_active'));
            }

            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('subject', 'like', "%{$search}%")
                      ->orWhere('description', 'like', "%{$search}%");
                });
            }

            // Apply sorting
            $sortBy = $request->get('sort_by', 'name');
            $sortOrder = $request->get('sort_order', 'asc');
            $query->orderBy($sortBy, $sortOrder);

            // Pagination
            $perPage = $request->get('per_page', 15);
            $templates = $query->paginate($perPage);

            return NotificationTemplateResource::collection($templates);
        } catch (\Exception $e) {
            Log::error('Failed to fetch notification templates', [
                'error' => $e->getMessage(),
                'filters' => $request->all(),
            ]);

            return response()->json([
                'message' => 'Failed to fetch notification templates',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    /**
     * Store a newly created notification template
     */
    public function store(StoreNotificationTemplateRequest $request): JsonResponse
    {
        try {
            $template = $this->notificationTemplateService->createOrUpdate($request->validated());

            Log::info('Notification template created', [
                'template_id' => $template->id,
                'name' => $template->name,
                'type' => $template->type,
            ]);

            return response()->json([
                'message' => 'Notification template created successfully',
                'data' => new NotificationTemplateResource($template),
            ], 201);
        } catch (\Exception $e) {
            Log::error('Failed to create notification template', [
                'error' => $e->getMessage(),
                'data' => $request->validated(),
            ]);

            return response()->json([
                'message' => 'Failed to create notification template',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    /**
     * Display the specified notification template
     */
    public function show(NotificationTemplate $notificationTemplate): JsonResponse
    {
        try {
            return response()->json([
                'data' => new NotificationTemplateResource($notificationTemplate),
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to fetch notification template', [
                'template_id' => $notificationTemplate->id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'Failed to fetch notification template',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    /**
     * Update the specified notification template
     */
    public function update(UpdateNotificationTemplateRequest $request, NotificationTemplate $notificationTemplate): JsonResponse
    {
        try {
            $updatedTemplate = $this->notificationTemplateService->createOrUpdate($request->validated());

            Log::info('Notification template updated', [
                'template_id' => $notificationTemplate->id,
                'name' => $notificationTemplate->name,
                'changes' => $request->validated(),
            ]);

            return response()->json([
                'message' => 'Notification template updated successfully',
                'data' => new NotificationTemplateResource($updatedTemplate),
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to update notification template', [
                'template_id' => $notificationTemplate->id,
                'error' => $e->getMessage(),
                'data' => $request->validated(),
            ]);

            return response()->json([
                'message' => 'Failed to update notification template',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    /**
     * Remove the specified notification template
     */
    public function destroy(NotificationTemplate $notificationTemplate): JsonResponse
    {
        try {
            $success = $this->notificationTemplateService->delete(
                $notificationTemplate->name,
                $notificationTemplate->type,
                $notificationTemplate->language
            );

            if ($success) {
                Log::info('Notification template deleted', [
                    'template_id' => $notificationTemplate->id,
                    'name' => $notificationTemplate->name,
                ]);

                return response()->json([
                    'message' => 'Notification template deleted successfully',
                ]);
            } else {
                return response()->json([
                    'message' => 'Failed to delete notification template',
                ], 500);
            }
        } catch (\Exception $e) {
            Log::error('Failed to delete notification template', [
                'template_id' => $notificationTemplate->id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'Failed to delete notification template',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    /**
     * Get template preview
     */
    public function preview(Request $request, string $name): JsonResponse
    {
        try {
            $type = $request->get('type');
            $language = $request->get('language', 'id');

            $preview = $this->notificationTemplateService->getPreview($name, $type, $language);

            if (isset($preview['error'])) {
                return response()->json([
                    'message' => 'Failed to get template preview',
                    'error' => $preview['error'],
                ], 400);
            }

            return response()->json([
                'data' => $preview,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to get template preview', [
                'name' => $name,
                'type' => $request->get('type'),
                'language' => $request->get('language', 'id'),
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'Failed to get template preview',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    /**
     * Send notification using template
     */
    public function send(Request $request, string $name): JsonResponse
    {
        try {
            $request->validate([
                'data' => 'required|array',
                'recipients' => 'required|array',
                'recipients.*' => 'required|string',
                'type' => 'sometimes|string|in:email,sms,push,webhook',
                'language' => 'sometimes|string|in:id,en',
            ]);

            $type = $request->get('type');
            $language = $request->get('language', 'id');

            $results = $this->notificationTemplateService->send(
                $name,
                $request->data,
                $request->recipients,
                $type,
                $language
            );

            Log::info('Notification sent using template', [
                'template_name' => $name,
                'type' => $type,
                'language' => $language,
                'recipients_count' => count($request->recipients),
            ]);

            return response()->json([
                'message' => 'Notification sent successfully',
                'data' => $results,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to send notification using template', [
                'template_name' => $name,
                'error' => $e->getMessage(),
                'data' => $request->all(),
            ]);

            return response()->json([
                'message' => 'Failed to send notification using template',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    /**
     * Validate template data
     */
    public function validateData(Request $request, string $name): JsonResponse
    {
        try {
            $request->validate([
                'data' => 'required|array',
                'type' => 'sometimes|string|in:email,sms,push,webhook',
                'language' => 'sometimes|string|in:id,en',
            ]);

            $type = $request->get('type');
            $language = $request->get('language', 'id');

            $errors = $this->notificationTemplateService->validateTemplateData(
                $name,
                $request->data,
                $type,
                $language
            );

            return response()->json([
                'data' => [
                    'valid' => empty($errors),
                    'errors' => $errors,
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to validate template data', [
                'template_name' => $name,
                'error' => $e->getMessage(),
                'data' => $request->all(),
            ]);

            return response()->json([
                'message' => 'Failed to validate template data',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    /**
     * Get templates by category
     */
    public function getByCategory(string $category, Request $request): JsonResponse
    {
        try {
            $type = $request->get('type');
            $language = $request->get('language', 'id');

            $templates = $this->notificationTemplateService->getTemplatesByCategory(
                $category,
                $type,
                $language
            );

            return response()->json([
                'data' => $templates,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to fetch templates by category', [
                'category' => $category,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'Failed to fetch templates by category',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    /**
     * Get available templates
     */
    public function getAvailable(Request $request): JsonResponse
    {
        try {
            $category = $request->get('category');
            $type = $request->get('type');
            $language = $request->get('language', 'id');

            $templates = $this->notificationTemplateService->getAvailableTemplates(
                $category,
                $type,
                $language
            );

            return response()->json([
                'data' => $templates,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to fetch available templates', [
                'error' => $e->getMessage(),
                'filters' => $request->all(),
            ]);

            return response()->json([
                'message' => 'Failed to fetch available templates',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    /**
     * Toggle template active status
     */
    public function toggleStatus(NotificationTemplate $notificationTemplate): JsonResponse
    {
        try {
            $notificationTemplate->update([
                'is_active' => !$notificationTemplate->is_active,
            ]);

            Log::info('Notification template status toggled', [
                'template_id' => $notificationTemplate->id,
                'name' => $notificationTemplate->name,
                'new_status' => $notificationTemplate->is_active,
            ]);

            return response()->json([
                'message' => 'Template status updated successfully',
                'data' => new NotificationTemplateResource($notificationTemplate->fresh()),
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to toggle template status', [
                'template_id' => $notificationTemplate->id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'Failed to toggle template status',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    /**
     * Clear template cache
     */
    public function clearCache(Request $request): JsonResponse
    {
        try {
            $name = $request->get('name');
            $this->notificationTemplateService->clearCache($name);

            Log::info('Notification template cache cleared', [
                'name' => $name,
            ]);

            return response()->json([
                'message' => 'Template cache cleared successfully',
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to clear template cache', [
                'error' => $e->getMessage(),
                'name' => $request->get('name'),
            ]);

            return response()->json([
                'message' => 'Failed to clear template cache',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }
}
