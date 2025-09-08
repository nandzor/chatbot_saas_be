<?php

namespace App\Services;

use App\Models\User;
use App\Traits\CacheHelper;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use App\Models\KnowledgeQaItem;
use App\Models\KnowledgeBaseTag;
use App\Models\KnowledgeBaseItem;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use App\Models\KnowledgeBaseCategory;
use Illuminate\Support\Facades\Cache;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Validation\ValidationException;
use Illuminate\Pagination\LengthAwarePaginator;

class KnowledgeBaseService extends BaseService
{
    use CacheHelper;
    /**
     * Get the model for the service.
     */
    protected function getModel(): \Illuminate\Database\Eloquent\Model
    {
        return new KnowledgeBaseItem();
    }

    /**
     * Get all knowledge base items with advanced filtering and pagination.
     */
    public function getAllItems(
        ?Request $request = null,
        array $filters = [],
        array $relations = null
    ): Collection|LengthAwarePaginator {
        // Use optimized relations by default
        if ($relations === null) {
            $relations = $this->getOptimizedRelations($request);
        }

        $query = $this->getModel()->newQuery();

        // Apply optimized eager loading
        $query->with($relations);

        // Select only necessary columns for list view
        if ($request && $request->get('list_view', true)) {
            $query->select([
                'id', 'organization_id', 'category_id', 'title', 'slug', 'description',
                'content_type', 'excerpt', 'language', 'difficulty_level', 'priority',
                'estimated_read_time', 'word_count', 'featured_image_url', 'is_featured',
                'is_public', 'is_searchable', 'is_ai_trainable', 'workflow_status',
                'approval_status', 'author_id', 'reviewer_id', 'approved_by',
                'published_at', 'last_reviewed_at', 'approved_at', 'view_count',
                'helpful_count', 'not_helpful_count', 'share_count', 'comment_count',
                'search_hit_count', 'ai_usage_count', 'ai_generated', 'ai_confidence_score',
                'ai_last_processed_at', 'version', 'is_latest_version', 'change_summary',
                'quality_score', 'effectiveness_score', 'last_effectiveness_update',
                'status', 'created_at', 'updated_at'
            ]);
        }

        if (Auth::user()->role !== 'super_admin') {
            // Apply organization filter for non-super admins
            $query->where('organization_id', $this->getCurrentOrganizationId());
        }

        // Apply filters
        $this->applyKnowledgeFilters($query, $filters);

        // Apply search
        if ($request && $request->has('search')) {
            $query->search($request->get('search'));
        }

        // Apply sorting
        if ($request) {
            $this->applyKnowledgeSorting($query, $request);
        }

        // Return paginated or all results
        if ($request && $request->has('per_page')) {
            $perPage = min(100, max(1, (int) $request->get('per_page', 15)));
            return $query->paginate($perPage);
        }

        return $query->get();
    }

    /**
     * Get knowledge base item by ID with relations.
     */
    public function getItemById(string $id, array $relations = ['category', 'author', 'reviewer', 'approvedBy', 'knowledgeTags', 'qaItems']): ?KnowledgeBaseItem
    {
        $query = $this->getModel()->newQuery();

        if (!empty($relations)) {
            $query->with($relations);
        }

        return $query->where('organization_id', $this->getCurrentOrganizationId())
                    ->find($id);
    }

    /**
     * Get knowledge base item by slug.
     */
    public function getItemBySlug(string $slug, array $relations = ['category', 'author', 'knowledgeTags', 'qaItems']): ?KnowledgeBaseItem
    {
        $query = $this->getModel()->newQuery();

        if (!empty($relations)) {
            $query->with($relations);
        }

        return $query->where('organization_id', $this->getCurrentOrganizationId())
                    ->where('slug', $slug)
                    ->first();
    }

    /**
     * Create a new knowledge base item.
     */
    public function createItem(array $data): KnowledgeBaseItem
    {
        return DB::transaction(function () use ($data) {
            // Set organization ID
            $data['organization_id'] = $this->getCurrentOrganizationId();

            // Set author ID
            $data['author_id'] = $this->getCurrentUserId();

            // Generate slug if not provided
            if (!isset($data['slug'])) {
                $data['slug'] = $this->generateUniqueSlug($data['title']);
            }

            // Set default values
            $data['workflow_status'] = $data['workflow_status'] ?? 'draft';
            $data['approval_status'] = $data['approval_status'] ?? 'pending';
            $data['is_latest_version'] = true;
            $data['version'] = 1;

            // Calculate word count
            if (isset($data['content'])) {
                $data['word_count'] = str_word_count(strip_tags($data['content']));
            }

            // Create the item
            $item = $this->getModel()->create($data);

            // Handle tags
            if (isset($data['tags'])) {
                $this->syncTags($item, $data['tags']);
            }

            // Handle Q&A items if present
            if (isset($data['qa_items']) && is_array($data['qa_items'])) {
                $this->createQaItems($item, $data['qa_items']);
            }

            // Clear cache
            $this->clearKnowledgeBaseCache();

            // Log the creation
            Log::info('Knowledge base item created', [
                'item_id' => $item->id,
                'title' => $item->title,
                'author_id' => $item->author_id,
                'organization_id' => $item->organization_id
            ]);

            return $item;
        });
    }

    /**
     * Update a knowledge base item.
     */
    public function updateItem(string $id, array $data): KnowledgeBaseItem
    {
        return DB::transaction(function () use ($id, $data) {
            $item = $this->getItemById($id);

            if (!$item) {
                throw ValidationException::withMessages([
                    'id' => ['Knowledge base item not found.']
                ]);
            }

            // Check if user has permission to edit
            if (!$this->canEditItem($item)) {
                throw ValidationException::withMessages([
                    'permission' => ['You do not have permission to edit this item.']
                ]);
            }

            // Generate new slug if title changed
            if (isset($data['title']) && $data['title'] !== $item->title) {
                $data['slug'] = $this->generateUniqueSlug($data['title'], $id);
            }

            // Calculate word count if content changed
            if (isset($data['content'])) {
                $data['word_count'] = str_word_count(strip_tags($data['content']));
            }

            // Update the item
            $item->update($data);

            // Handle tags
            if (isset($data['tags'])) {
                $this->syncTags($item, $data['tags']);
            }

            // Handle Q&A items if present
            if (isset($data['qa_items']) && is_array($data['qa_items'])) {
                $this->updateQaItems($item, $data['qa_items']);
            }

            // Clear cache
            $this->clearKnowledgeBaseCache();

            // Log the update
            Log::info('Knowledge base item updated', [
                'item_id' => $item->id,
                'title' => $item->title,
                'updated_by' => $this->getCurrentUserId()
            ]);

            return $item->fresh(['category', 'author', 'knowledgeTags', 'qaItems']);
        });
    }

    /**
     * Delete a knowledge base item.
     */
    public function deleteItem(string $id): bool
    {
        return DB::transaction(function () use ($id) {
            $item = $this->getItemById($id);

            if (!$item) {
                throw ValidationException::withMessages([
                    'id' => ['Knowledge base item not found.']
                ]);
            }

            // Check if user has permission to delete
            if (!$this->canDeleteItem($item)) {
                throw ValidationException::withMessages([
                    'permission' => ['You do not have permission to delete this item.']
                ]);
            }

            // Soft delete the item
            $deleted = $item->delete();

            if ($deleted) {
                // Clear cache
                $this->clearKnowledgeCache();

                // Log the deletion
                Log::info('Knowledge base item deleted', [
                    'item_id' => $item->id,
                    'title' => $item->title,
                    'deleted_by' => $this->getCurrentUserId()
                ]);
            }

            return $deleted;
        });
    }

    /**
     * Publish a knowledge base item.
     */
    public function publishItem(string $id): KnowledgeBaseItem
    {
        return DB::transaction(function () use ($id) {
            $item = $this->getItemById($id);

            if (!$item) {
                throw ValidationException::withMessages([
                    'id' => ['Knowledge base item not found.']
                ]);
            }

            // Check if user has permission to publish
            if (!$this->canPublishItem($item)) {
                throw ValidationException::withMessages([
                    'permission' => ['You do not have permission to publish this item.']
                ]);
            }

            // Update status
            $item->update([
                'workflow_status' => 'published',
                'published_at' => now(),
                'published_by' => $this->getCurrentUserId()
            ]);

            // Clear cache
            $this->clearKnowledgeBaseCache();

            // Log the publication
            Log::info('Knowledge base item published', [
                'item_id' => $item->id,
                'title' => $item->title,
                'published_by' => $this->getCurrentUserId()
            ]);

            return $item->fresh(['category', 'author']);
        });
    }

    /**
     * Approve a knowledge base item.
     */
    public function approveItem(string $id, ?string $comment = null): KnowledgeBaseItem
    {
        return DB::transaction(function () use ($id, $comment) {
            $item = $this->getItemById($id);

            if (!$item) {
                throw ValidationException::withMessages([
                    'id' => ['Knowledge base item not found.']
                ]);
            }

            // Check if user has permission to approve
            if (!$this->canApproveItem($item)) {
                throw ValidationException::withMessages([
                    'permission' => ['You do not have permission to approve this item.']
                ]);
            }

            // Update approval status
            $item->update([
                'approval_status' => 'approved',
                'approved_at' => now(),
                'approved_by' => $this->getCurrentUserId(),
                'reviewer_id' => $this->getCurrentUserId()
            ]);

            // Clear cache
            $this->clearKnowledgeBaseCache();

            // Log the approval
            Log::info('Knowledge base item approved', [
                'item_id' => $item->id,
                'title' => $item->title,
                'approved_by' => $this->getCurrentUserId(),
                'comment' => $comment
            ]);

            return $item->fresh(['category', 'author', 'approvedBy']);
        });
    }

    /**
     * Reject a knowledge base item.
     */
    public function rejectItem(string $id, string $reason): KnowledgeBaseItem
    {
        return DB::transaction(function () use ($id, $reason) {
            $item = $this->getItemById($id);

            if (!$item) {
                throw ValidationException::withMessages([
                    'id' => ['Knowledge base item not found.']
                ]);
            }

            // Check if user has permission to reject
            if (!$this->canApproveItem($item)) {
                throw ValidationException::withMessages([
                    'permission' => ['You do not have permission to reject this item.']
                ]);
            }

            // Update approval status
            $item->update([
                'approval_status' => 'rejected',
                'reviewer_id' => $this->getCurrentUserId(),
                'metadata' => array_merge($item->metadata ?? [], ['rejection_reason' => $reason])
            ]);

            // Clear cache
            $this->clearKnowledgeBaseCache();

            // Log the rejection
            Log::info('Knowledge base item rejected', [
                'item_id' => $item->id,
                'title' => $item->title,
                'rejected_by' => $this->getCurrentUserId(),
                'reason' => $reason
            ]);

            return $item->fresh(['category', 'author', 'reviewer']);
        });
    }

    /**
     * Search knowledge base items.
     */
    public function searchItems(string $query, array $filters = [], int $limit = 20): Collection
    {
        $cacheKey = "knowledge_search:" . md5($query . serialize($filters) . $limit);

        return Cache::remember($cacheKey, 300, function () use ($query, $filters, $limit) {
            $queryBuilder = $this->getModel()->newQuery()
                ->where('organization_id', $this->getCurrentOrganizationId())
                ->where('is_searchable', true)
                ->search($query);

            // Apply filters
            $this->applyKnowledgeFilters($queryBuilder, $filters);

            return $queryBuilder->limit($limit)->get(['id', 'title', 'description', 'excerpt', 'slug']);
        });
    }

    /**
     * Get items by category.
     */
    public function getItemsByCategory(string $categoryId, array $filters = []): Collection
    {
        $query = $this->getModel()->newQuery()
            ->where('organization_id', $this->getCurrentOrganizationId())
            ->where('category_id', $categoryId);

        // Apply filters
        $this->applyKnowledgeFilters($query, $filters);

        return $query->with(['category', 'author'])->get();
    }

    /**
     * Get items by tag.
     */
    public function getItemsByTag(string $tagId, array $filters = []): Collection
    {
        $query = $this->getModel()->newQuery()
            ->where('organization_id', $this->getCurrentOrganizationId())
            ->whereHas('knowledgeTags', function ($q) use ($tagId) {
                $q->where('tag_id', $tagId);
            });

        // Apply filters
        $this->applyKnowledgeFilters($query, $filters);

        return $query->with(['category', 'author', 'knowledgeTags'])->get();
    }

    /**
     * Get related items.
     */
    public function getRelatedItems(string $itemId, int $limit = 5): Collection
    {
        $item = $this->getItemById($itemId);

        if (!$item) {
            return collect();
        }

        return $this->getModel()->newQuery()
            ->where('organization_id', $this->getCurrentOrganizationId())
            ->where('id', '!=', $itemId)
            ->where('category_id', $item->category_id)
            ->where('is_public', true)
            ->limit($limit)
            ->get();
    }

    /**
     * Increment view count for an item.
     */
    public function incrementViewCount(string $id): void
    {
        $item = $this->getItemById($id);
        if ($item) {
            $item->incrementViews();
        }
    }

    /**
     * Mark item as helpful.
     */
    public function markAsHelpful(string $id): void
    {
        $item = $this->getItemById($id);
        if ($item) {
            $item->incrementHelpful();
        }
    }

    /**
     * Mark item as not helpful.
     */
    public function markAsNotHelpful(string $id): void
    {
        $item = $this->getItemById($id);
        if ($item) {
            $item->incrementNotHelpful();
        }
    }

    /**
     * Apply knowledge base specific filters.
     */
    protected function applyKnowledgeFilters($query, array $filters): void
    {
        if (isset($filters['category_id'])) {
            $query->byCategory($filters['category_id']);
        }

        if (isset($filters['author_id'])) {
            $query->byAuthor($filters['author_id']);
        }

        if (isset($filters['workflow_status'])) {
            $query->byWorkflowStatus($filters['workflow_status']);
        }

        if (isset($filters['approval_status'])) {
            $query->byApprovalStatus($filters['approval_status']);
        }

        if (isset($filters['content_type'])) {
            $query->byContentType($filters['content_type']);
        }

        if (isset($filters['language'])) {
            $query->byLanguage($filters['language']);
        }

        if (isset($filters['difficulty_level'])) {
            $query->byDifficultyLevel($filters['difficulty_level']);
        }

        if (isset($filters['is_public'])) {
            $query->public();
        }

        if (isset($filters['is_featured'])) {
            $query->featured();
        }

        if (isset($filters['is_ai_trainable'])) {
            $query->aiTrainable();
        }

        if (isset($filters['tags']) && is_array($filters['tags'])) {
            $query->byTags($filters['tags']);
        }

        if (isset($filters['keywords']) && is_array($filters['keywords'])) {
            $query->byKeywords($filters['keywords']);
        }
    }

    /**
     * Apply knowledge base specific sorting.
     */
    protected function applyKnowledgeSorting($query, Request $request): void
    {
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');

        $allowedSortFields = [
            'title', 'created_at', 'updated_at', 'published_at',
            'view_count', 'helpful_count', 'priority', 'quality_score'
        ];

        if (in_array($sortBy, $allowedSortFields)) {
            $query->orderBy($sortBy, $sortOrder);
        } else {
            $query->ordered();
        }
    }

    /**
     * Generate unique slug for knowledge base item.
     */
    protected function generateUniqueSlug(string $title, ?string $excludeId = null): string
    {
        $baseSlug = Str::slug($title);
        $slug = $baseSlug;
        $counter = 1;

        $query = $this->getModel()->newQuery()
            ->where('organization_id', $this->getCurrentOrganizationId())
            ->where('slug', $slug);

        if ($excludeId) {
            $query->where('id', '!=', $excludeId);
        }

        while ($query->exists()) {
            $slug = $baseSlug . '-' . $counter;
            $query->where('slug', $slug);
            $counter++;
        }

        return $slug;
    }

    /**
     * Sync tags for a knowledge base item.
     */
    protected function syncTags(KnowledgeBaseItem $item, array $tags): void
    {
        $tagIds = [];

        foreach ($tags as $tag) {
            if (is_string($tag)) {
                // Create or find tag by name
                $tagModel = KnowledgeBaseTag::firstOrCreate([
                    'organization_id' => $this->getCurrentOrganizationId(),
                    'name' => $tag
                ], [
                    'slug' => Str::slug($tag),
                    'status' => 'active'
                ]);
                $tagIds[] = $tagModel->id;
            } elseif (is_array($tag) && isset($tag['id'])) {
                $tagIds[] = $tag['id'];
            } elseif (is_string($tag) && is_numeric($tag)) {
                $tagIds[] = $tag;
            }
        }

        $item->knowledgeTags()->sync($tagIds);
    }

    /**
     * Create Q&A items for a knowledge base item.
     */
    protected function createQaItems(KnowledgeBaseItem $item, array $qaItems): void
    {
        foreach ($qaItems as $qaData) {
            $qaData['organization_id'] = $this->getCurrentOrganizationId();
            $qaData['knowledge_item_id'] = $item->id;

            KnowledgeQaItem::create($qaData);
        }
    }

    /**
     * Update Q&A items for a knowledge base item.
     */
    protected function updateQaItems(KnowledgeBaseItem $item, array $qaItems): void
    {
        // Delete existing Q&A items
        $item->qaItems()->delete();

        // Create new Q&A items
        $this->createQaItems($item, $qaItems);
    }

    /**
     * Check if user can edit the item.
     */
    protected function canEditItem(KnowledgeBaseItem $item): bool
    {
        $user = $this->getCurrentUser();

        // Super admin can edit anything
        if ($user->isSuperAdmin()) {
            return true;
        }

        // Author can edit their own items
        if ($item->author_id === $user->id) {
            return true;
        }

        // Check if user has edit permission
        return $user->hasPermission('knowledge.edit');
    }

    /**
     * Check if user can delete the item.
     */
    protected function canDeleteItem(KnowledgeBaseItem $item): bool
    {
        $user = $this->getCurrentUser();

        // Super admin can delete anything
        if ($user->isSuperAdmin()) {
            return true;
        }

        // Author can delete their own items
        if ($item->author_id === $user->id) {
            return true;
        }

        // Check if user has delete permission
        return $user->hasPermission('knowledge.delete');
    }

    /**
     * Check if user can publish the item.
     */
    protected function canPublishItem(KnowledgeBaseItem $item): bool
    {
        $user = $this->getCurrentUser();

        // Super admin can publish anything
        if ($user->isSuperAdmin()) {
            return true;
        }

        // Check if user has publish permission
        return $user->hasPermission('knowledge.publish');
    }

    /**
     * Check if user can approve the item.
     */
    protected function canApproveItem(KnowledgeBaseItem $item): bool
    {
        $user = $this->getCurrentUser();

        // Super admin can approve anything
        if ($user->isSuperAdmin()) {
            return true;
        }

        // Check if user has approve permission
        return $user->hasPermission('knowledge.approve');
    }

    /**
     * Clear knowledge base cache (legacy method for backward compatibility).
     */
    protected function clearKnowledgeCache(): void
    {
        $this->clearKnowledgeBaseCache();
    }

    /**
     * Get current organization ID.
     */
    protected function getCurrentOrganizationId(): string
    {
        $user = $this->getCurrentUser();
        return $user->organization_id ?? '';
    }

    /**
     * Get current user ID.
     */
    protected function getCurrentUserId(): string
    {
        return $this->getCurrentUser()->id;
    }

    /**
     * Get current user.
     */
    protected function getCurrentUser(): User
    {
        return Auth::user();
    }

    /**
     * Get optimized relations based on request parameters.
     */
    protected function getOptimizedRelations(?Request $request = null): array
    {
        // Base relations that are always needed
        $baseRelations = [
            'category:id,name,slug,description,icon,color',
            'author:id,name,email,avatar_url'
        ];

        // Add relations based on request parameters or context
        if ($request) {
            // If include parameter is specified, use it
            if ($request->has('include')) {
                $includeRelations = explode(',', $request->get('include'));
                $baseRelations = array_merge($baseRelations, $includeRelations);
            }

            // Add reviewer and approvedBy if user has admin permissions
            if ($request->user()?->hasPermission('knowledge.approve')) {
                $baseRelations[] = 'reviewer:id,name,email';
                $baseRelations[] = 'approvedBy:id,name,email';
            }

            // Add tags if needed for display
            if ($request->get('include_tags', true)) {
                $baseRelations[] = 'knowledgeTags:id,name,slug,color,icon';
            }

            // Add QA items only if specifically requested
            if ($request->get('include_qa_items', false)) {
                $baseRelations[] = 'qaItems:id,knowledge_item_id,question,answer,is_primary,is_active,order_index';
            }
        }

        return array_unique($baseRelations);
    }

    /**
     * Get cached knowledge base items with optimized query.
     */
    public function getCachedItems(
        ?Request $request = null,
        array $filters = [],
        int $cacheTtl = 300
    ): Collection|LengthAwarePaginator {
        $cacheKey = $this->generateCacheKey($request, $filters);

        return Cache::remember($cacheKey, $cacheTtl, function () use ($request, $filters) {
            return $this->getAllItems($request, $filters);
        });
    }

    /**
     * Get optimized knowledge base items with minimal queries.
     */
    public function getOptimizedItems(
        ?Request $request = null,
        array $filters = [],
        bool $useCache = true
    ): Collection|LengthAwarePaginator {
        if ($useCache) {
            return $this->getCachedItems($request, $filters, 300);
        }

        // Build optimized query with minimal relations
        $query = $this->getModel()->newQuery();

        // Apply organization filter
        if (Auth::user()->role !== 'super_admin') {
            $query->where('organization_id', $this->getCurrentOrganizationId());
        }

        // Apply filters using optimized scopes
        $this->applyKnowledgeFilters($query, $filters);

        // Apply search
        if ($request && $request->has('search')) {
            $query->search($request->get('search'));
        }

        // Apply sorting
        if ($request) {
            $this->applyKnowledgeSorting($query, $request);
        }

        // Select only essential columns for list view
        $query->select([
            'id', 'organization_id', 'category_id', 'title', 'slug', 'description',
            'content_type', 'excerpt', 'language', 'difficulty_level', 'priority',
            'is_featured', 'is_public', 'workflow_status', 'approval_status',
            'author_id', 'published_at', 'view_count', 'helpful_count',
            'quality_score', 'effectiveness_score', 'status', 'created_at', 'updated_at'
        ]);

        // Eager load only essential relations
        $query->with([
            'category:id,name,slug,icon,color',
            'author:id,name,email'
        ]);

        // Return paginated or all results
        if ($request && $request->has('per_page')) {
            $perPage = min(100, max(1, (int) $request->get('per_page', 15)));
            return $query->paginate($perPage);
        }

        return $query->get();
    }

    /**
     * Get knowledge base items with minimal queries for list view.
     */
    public function getListItems(
        ?Request $request = null,
        array $filters = [],
        bool $useCache = true
    ): Collection|LengthAwarePaginator {
        if ($useCache) {
            $cacheKey = $this->generateCacheKey($request, $filters) . '_list';
            return Cache::remember($cacheKey, 300, function () use ($request, $filters) {
                return $this->getListItems($request, $filters, false);
            });
        }

        // Build minimal query for list view
        $query = $this->getModel()->newQuery();

        // Apply organization filter
        if (Auth::user()->role !== 'super_admin') {
            $query->where('organization_id', $this->getCurrentOrganizationId());
        }

        // Apply filters using optimized scopes
        $this->applyKnowledgeFilters($query, $filters);

        // Apply search
        if ($request && $request->has('search')) {
            $query->search($request->get('search'));
        }

        // Apply sorting
        if ($request) {
            $this->applyKnowledgeSorting($query, $request);
        }

        // Select only essential columns for list view
        $query->select([
            'id', 'organization_id', 'category_id', 'title', 'slug', 'description',
            'content_type', 'excerpt', 'language', 'difficulty_level', 'priority',
            'is_featured', 'is_public', 'workflow_status', 'approval_status',
            'author_id', 'published_at', 'view_count', 'helpful_count',
            'quality_score', 'effectiveness_score', 'status', 'created_at', 'updated_at'
        ]);

        // Eager load only essential relations
        $query->with([
            'category:id,name,slug,icon,color',
            'author:id,name,email'
        ]);

        // Return paginated or all results
        if ($request && $request->has('per_page')) {
            $perPage = min(100, max(1, (int) $request->get('per_page', 15)));
            return $query->paginate($perPage);
        }

        return $query->get();
    }

    /**
     * Generate cache key for knowledge base queries.
     */
    protected function generateCacheKey(?Request $request = null, array $filters = []): string
    {
        $organizationId = $this->getCurrentOrganizationId();
        $userId = $this->getCurrentUserId();

        $keyParts = [
            'knowledge_base_items',
            "org_{$organizationId}",
            "user_{$userId}",
            md5(serialize($filters))
        ];

        if ($request) {
            $keyParts[] = md5($request->getQueryString() ?? '');
        }

        return implode('_', $keyParts);
    }

    /**
     * Clear knowledge base cache with pattern matching.
     */
    public function clearKnowledgeBaseCache(): void
    {
        $organizationId = $this->getCurrentOrganizationId();

        $patterns = [
            "knowledge_base_items_org_{$organizationId}_*",
            "knowledge_search_*",
            "knowledge_organization_{$organizationId}",
            "knowledge_categories_{$organizationId}",
            "knowledge_tags_{$organizationId}"
        ];

        $this->clearCacheByPatterns($patterns);
    }

}
