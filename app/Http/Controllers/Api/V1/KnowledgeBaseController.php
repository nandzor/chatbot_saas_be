<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\KnowledgeBase\CreateKnowledgeBaseRequest;
use App\Http\Requests\KnowledgeBase\UpdateKnowledgeBaseRequest;
use App\Http\Requests\KnowledgeBase\SearchKnowledgeBaseRequest;
use App\Http\Resources\KnowledgeBase\KnowledgeBaseItemResource;
use App\Http\Resources\KnowledgeBase\KnowledgeBaseItemCollection;
use App\Services\KnowledgeBaseService;
use App\Models\KnowledgeBaseCategory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class KnowledgeBaseController extends BaseApiController
{
    protected KnowledgeBaseService $knowledgeBaseService;

    public function __construct(KnowledgeBaseService $knowledgeBaseService)
    {
        $this->knowledgeBaseService = $knowledgeBaseService;
    }

    /**
     * Get all knowledge base items with pagination and filtering.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            // Build filters from request
            $filters = $this->buildFilters($request);

            // Use optimized items for better performance with minimal queries
            $items = $this->knowledgeBaseService->getListItems($request, $filters, true);

            // Return paginated response
            if ($items instanceof \Illuminate\Pagination\LengthAwarePaginator) {
                return $this->paginatedResponse(
                    $items,
                    'Knowledge base items retrieved successfully'
                );
            }

            // Return collection response
            return $this->successResponse(
                'Knowledge base items retrieved successfully',
                new KnowledgeBaseItemCollection($items)
            );
        } catch (\Exception $e) {
            Log::error('Error retrieving knowledge base items', [
                'error' => $e->getMessage(),
                'user_id' => $this->getCurrentUser()?->id
            ]);

            return $this->errorResponse('Failed to retrieve knowledge base items', 500);
        }
    }

    /**
     * Get a specific knowledge base item by ID.
     */
    public function show(string $id): JsonResponse
    {
        try {
            $item = $this->knowledgeBaseService->getItemById($id);

            if (!$item) {
                return $this->errorResponse('Knowledge base item not found', 404);
            }

            // Increment view count
            $this->knowledgeBaseService->incrementViewCount($id);

            // Clear cache after view count increment
            $this->knowledgeBaseService->clearKnowledgeBaseCache();

            return $this->successResponse(
                'Knowledge base item retrieved successfully',
                new KnowledgeBaseItemResource($item)
            );
        } catch (\Exception $e) {
            Log::error('Error retrieving knowledge base item', [
                'item_id' => $id,
                'error' => $e->getMessage(),
                'user_id' => $this->getCurrentUser()?->id,
                'organization_id' => $this->getCurrentUser()?->organization_id
            ]);

            return $this->errorResponse('Failed to retrieve knowledge base item', 500);
        }
    }

    /**
     * Get a knowledge base item by slug.
     */
    public function showBySlug(string $slug): JsonResponse
    {
        try {
            $item = $this->knowledgeBaseService->getItemBySlug($slug);

            if (!$item) {
                return $this->errorResponse('Knowledge base item not found', 404);
            }

            // Increment view count
            $this->knowledgeBaseService->incrementViewCount($item->id);

            // Clear cache after view count increment
            $this->knowledgeBaseService->clearKnowledgeBaseCache();

            return $this->successResponse(
                'Knowledge base item retrieved successfully',
                new KnowledgeBaseItemResource($item)
            );
        } catch (\Exception $e) {
            Log::error('Error retrieving knowledge base item by slug', [
                'slug' => $slug,
                'error' => $e->getMessage(),
                'user_id' => $this->getCurrentUser()?->id,
                'organization_id' => $this->getCurrentUser()?->organization_id
            ]);

            return $this->errorResponse('Failed to retrieve knowledge base item', 500);
        }
    }

    /**
     * Create a new knowledge base item.
     */
    public function store(CreateKnowledgeBaseRequest $request): JsonResponse
    {
        try {
            $item = $this->knowledgeBaseService->createItem($request->validated());

            // Clear cache after creation
            $this->knowledgeBaseService->clearKnowledgeBaseCache();

            return $this->createdResponse(
                new KnowledgeBaseItemResource($item),
                'Knowledge base item created successfully'
            );
        } catch (\Exception $e) {
            Log::error('Error creating knowledge base item', [
                'error' => $e->getMessage(),
                'user_id' => $this->getCurrentUser()?->id,
                'data' => $request->validated()
            ]);

            return $this->errorResponse('Failed to create knowledge base item', 500);
        }
    }

    /**
     * Update a knowledge base item.
     */
    public function update(UpdateKnowledgeBaseRequest $request, string $id): JsonResponse
    {
        try {
            $item = $this->knowledgeBaseService->updateItem($id, $request->validated());

            // Clear cache after update
            $this->knowledgeBaseService->clearKnowledgeBaseCache();

            return $this->successResponse(
                'Knowledge base item updated successfully',
                new KnowledgeBaseItemResource($item)
            );
        } catch (\Exception $e) {
            Log::error('Error updating knowledge base item', [
                'item_id' => $id,
                'error' => $e->getMessage(),
                'user_id' => $this->getCurrentUser()?->id,
                'organization_id' => $this->getCurrentUser()?->organization_id
            ]);

            return $this->errorResponse('Failed to update knowledge base item', 500);
        }
    }

    /**
     * Delete a knowledge base item.
     */
    public function destroy(string $id): JsonResponse
    {
        try {
            $deleted = $this->knowledgeBaseService->deleteItem($id);

            if (!$deleted) {
                return $this->errorResponse('Failed to delete knowledge base item', 500);
            }

            // Clear cache after deletion
            $this->knowledgeBaseService->clearKnowledgeBaseCache();

            return $this->successResponse(
                'Knowledge base item deleted successfully',
                null
            );
        } catch (\Exception $e) {
            Log::error('Error deleting knowledge base item', [
                'item_id' => $id,
                'error' => $e->getMessage(),
                'user_id' => $this->getCurrentUser()?->id,
                'organization_id' => $this->getCurrentUser()?->organization_id
            ]);

            return $this->errorResponse('Failed to delete knowledge base item', 500);
        }
    }

    /**
     * Search knowledge base items.
     */
    public function search(SearchKnowledgeBaseRequest $request): JsonResponse
    {
        try {
            $query = $request->get('query');
            $filters = $this->buildFilters($request);
            $limit = $request->get('limit', 20);

            $items = $this->knowledgeBaseService->searchItems($query, $filters, $limit);

            // Clear cache after search (for search hit count updates)
            $this->knowledgeBaseService->clearKnowledgeBaseCache();

            return $this->successResponse(
                'Search completed successfully',
                new KnowledgeBaseItemCollection($items)
            );
        } catch (\Exception $e) {
            Log::error('Error searching knowledge base items', [
                'query' => $request->get('query'),
                'error' => $e->getMessage(),
                'user_id' => $this->getCurrentUser()?->id
            ]);

            return $this->errorResponse('Failed to search knowledge base items', 500);
        }
    }

    /**
     * List knowledge base categories for current organization.
     */
    public function categories(Request $request): JsonResponse
    {
        try {
            $orgId = $this->getCurrentUser()?->organization_id;
            $query = KnowledgeBaseCategory::query()
                ->where('organization_id', $orgId)
                ->orderBy('order_index')
                ->orderBy('name');

            // Optional filters
            if ($request->boolean('only_public')) {
                $query->where('is_public', true);
            }

            $categories = $query->get(['id','name','slug','description','icon','color','order_index','is_public']);

            return $this->successResponse('Categories retrieved successfully', $categories);
        } catch (\Exception $e) {
            Log::error('Error retrieving knowledge base categories', [
                'error' => $e->getMessage(),
                'user_id' => $this->getCurrentUser()?->id
            ]);

            return $this->errorResponse('Failed to retrieve categories', 500);
        }
    }

    /**
     * Get items by category.
     */
    public function byCategory(Request $request, string $categoryId): JsonResponse
    {
        try {
            $filters = $this->buildFilters($request);
            $items = $this->knowledgeBaseService->getItemsByCategory($categoryId, $filters);

            // Clear cache after category items retrieval
            $this->knowledgeBaseService->clearKnowledgeBaseCache();

            return $this->successResponse(
                'Category items retrieved successfully',
                new KnowledgeBaseItemCollection($items)
            );
        } catch (\Exception $e) {
            Log::error('Error retrieving category items', [
                'category_id' => $categoryId,
                'error' => $e->getMessage(),
                'user_id' => $this->getCurrentUser()?->id
            ]);

            return $this->errorResponse('Failed to retrieve category items', 500);
        }
    }

    /**
     * Get items by tag.
     */
    public function byTag(Request $request, string $tagId): JsonResponse
    {
        try {
            $filters = $this->buildFilters($request);
            $items = $this->knowledgeBaseService->getItemsByTag($tagId, $filters);

            // Clear cache after tag items retrieval
            $this->knowledgeBaseService->clearKnowledgeBaseCache();

            return $this->successResponse(
                'Tag items retrieved successfully',
                new KnowledgeBaseItemCollection($items)
            );
        } catch (\Exception $e) {
            Log::error('Error retrieving tag items', [
                'tag_id' => $tagId,
                'error' => $e->getMessage(),
                'user_id' => $this->getCurrentUser()?->id
            ]);

            return $this->errorResponse('Failed to retrieve tag items', 500);
        }
    }

    /**
     * Get related items.
     */
    public function related(string $id): JsonResponse
    {
        try {
            $limit = request()->get('limit', 5);
            $items = $this->knowledgeBaseService->getRelatedItems($id, $limit);

            // Clear cache after related items retrieval
            $this->knowledgeBaseService->clearKnowledgeBaseCache();

            return $this->successResponse(
                'Related items retrieved successfully',
                new KnowledgeBaseItemCollection($items)
            );
        } catch (\Exception $e) {
            Log::error('Error retrieving related items', [
                'item_id' => $id,
                'error' => $e->getMessage(),
                'user_id' => $this->getCurrentUser()?->id,
                'organization_id' => $this->getCurrentUser()?->organization_id
            ]);

            return $this->errorResponse('Failed to retrieve related items', 500);
        }
    }

    /**
     * Publish a knowledge base item.
     */
    public function publish(string $id): JsonResponse
    {
        try {
            $item = $this->knowledgeBaseService->publishItem($id);

            // Clear cache after publishing
            $this->knowledgeBaseService->clearKnowledgeBaseCache();

            return $this->successResponse(
                'Knowledge base item published successfully',
                new KnowledgeBaseItemResource($item)
            );
        } catch (\Exception $e) {
            Log::error('Error publishing knowledge base item', [
                'item_id' => $id,
                'error' => $e->getMessage(),
                'user_id' => $this->getCurrentUser()?->id,
                'organization_id' => $this->getCurrentUser()?->organization_id
            ]);

            return $this->errorResponse('Failed to publish knowledge base item', 500);
        }
    }

    /**
     * Approve a knowledge base item.
     */
    public function approve(Request $request, string $id): JsonResponse
    {
        try {
            $comment = $request->get('comment');
            $item = $this->knowledgeBaseService->approveItem($id, $comment);

            // Clear cache after approval
            $this->knowledgeBaseService->clearKnowledgeBaseCache();

            return $this->successResponse(
                'Knowledge base item approved successfully',
                new KnowledgeBaseItemResource($item)
            );
        } catch (\Exception $e) {
            Log::error('Error approving knowledge base item', [
                'item_id' => $id,
                'error' => $e->getMessage(),
                'user_id' => $this->getCurrentUser()?->id,
                'organization_id' => $this->getCurrentUser()?->organization_id
            ]);

            return $this->errorResponse('Failed to approve knowledge base item', 500);
        }
    }

    /**
     * Reject a knowledge base item.
     */
    public function reject(Request $request, string $id): JsonResponse
    {
        try {
            $reason = $request->get('reason');

            if (!$reason) {
                return $this->errorResponse('Rejection reason is required', 400);
            }

            $item = $this->knowledgeBaseService->rejectItem($id, $reason);

            // Clear cache after rejection
            $this->knowledgeBaseService->clearKnowledgeBaseCache();

            return $this->successResponse(
                'Knowledge base item rejected successfully',
                new KnowledgeBaseItemResource($item)
            );
        } catch (\Exception $e) {
            Log::error('Error rejecting knowledge base item', [
                'item_id' => $id,
                'error' => $e->getMessage(),
                'user_id' => $this->getCurrentUser()?->id,
                'organization_id' => $this->getCurrentUser()?->organization_id
            ]);

            return $this->errorResponse('Failed to reject knowledge base item', 500);
        }
    }

    /**
     * Mark item as helpful.
     */
    public function markHelpful(string $id): JsonResponse
    {
        try {
            $this->knowledgeBaseService->markAsHelpful($id);

            // Clear cache after marking as helpful
            $this->knowledgeBaseService->clearKnowledgeBaseCache();

            return $this->successResponse(
                'Item marked as helpful successfully',
                null
            );
        } catch (\Exception $e) {
            Log::error('Error marking item as helpful', [
                'item_id' => $id,
                'error' => $e->getMessage(),
                'user_id' => $this->getCurrentUser()?->id,
                'organization_id' => $this->getCurrentUser()?->organization_id
            ]);

            return $this->errorResponse('Failed to mark item as helpful', 500);
        }
    }

    /**
     * Mark item as not helpful.
     */
    public function markNotHelpful(string $id): JsonResponse
    {
        try {
            $this->knowledgeBaseService->markAsNotHelpful($id);

            // Clear cache after marking as not helpful
            $this->knowledgeBaseService->clearKnowledgeBaseCache();

            return $this->successResponse(
                'Item marked as not helpful successfully',
                null
            );
        } catch (\Exception $e) {
            Log::error('Error marking item as not helpful', [
                'item_id' => $id,
                'error' => $e->getMessage(),
                'user_id' => $this->getCurrentUser()?->id,
                'organization_id' => $this->getCurrentUser()?->organization_id
            ]);

            return $this->errorResponse('Failed to mark item as not helpful', 500);
        }
    }

    /**
     * Build filters from request.
     */
    protected function buildFilters(Request $request): array
    {
        $filters = [];

        // Category filter
        if ($request->has('category_id')) {
            $filters['category_id'] = $request->get('category_id');
        }

        // Author filter
        if ($request->has('author_id')) {
            $filters['author_id'] = $request->get('author_id');
        }

        // Workflow status filter
        if ($request->has('workflow_status')) {
            $filters['workflow_status'] = $request->get('workflow_status');
        }

        // Approval status filter
        if ($request->has('approval_status')) {
            $filters['approval_status'] = $request->get('approval_status');
        }

        // Content type filter
        if ($request->has('content_type')) {
            $filters['content_type'] = $request->get('content_type');
        }

        // Language filter
        if ($request->has('language')) {
            $filters['language'] = $request->get('language');
        }

        // Difficulty level filter
        if ($request->has('difficulty_level')) {
            $filters['difficulty_level'] = $request->get('difficulty_level');
        }

        // Public filter
        if ($request->has('is_public')) {
            $filters['is_public'] = $request->boolean('is_public');
        }

        // Featured filter
        if ($request->has('is_featured')) {
            $filters['is_featured'] = $request->boolean('is_featured');
        }

        // AI trainable filter
        if ($request->has('is_ai_trainable')) {
            $filters['is_ai_trainable'] = $request->boolean('is_ai_trainable');
        }

        // Tags filter
        if ($request->has('tags')) {
            $filters['tags'] = $request->get('tags');
        }

        // Keywords filter
        if ($request->has('keywords')) {
            $filters['keywords'] = $request->get('keywords');
        }

        return $filters;
    }

}
