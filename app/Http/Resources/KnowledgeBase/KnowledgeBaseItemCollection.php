<?php

namespace App\Http\Resources\KnowledgeBase;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\ResourceCollection;

class KnowledgeBaseItemCollection extends ResourceCollection
{
    /**
     * Transform the resource collection into an array.
     */
    public function toArray(Request $request): array
    {
        return [
            'data' => $this->collection->map(function ($item) use ($request) {
                return [
                    'id' => $item->id,
                    'category_id' => $item->category_id,
                    'title' => $item->title,
                    'slug' => $item->slug,
                    'description' => $item->description,
                    'content_type' => $item->content_type,
                    'summary' => $item->summary,
                    'excerpt' => $item->excerpt,
                    'tags' => $item->tags,
                    'keywords' => $item->keywords,
                    'language' => $item->language,
                    'difficulty_level' => $item->difficulty_level,
                    'priority' => $item->priority,
                    'estimated_read_time' => $item->estimated_read_time,
                    'reading_time' => $item->reading_time,
                    'word_count' => $item->word_count,
                    'meta_title' => $item->meta_title,
                    'meta_description' => $item->meta_description,
                    'featured_image_url' => $item->featured_image_url,
                    'is_featured' => $item->is_featured,
                    'is_public' => $item->is_public,
                    'is_searchable' => $item->is_searchable,
                    'is_ai_trainable' => $item->is_ai_trainable,
                    'requires_approval' => $item->requires_approval,
                    'workflow_status' => $item->workflow_status,
                    'approval_status' => $item->approval_status,
                    'published_at' => $item->published_at?->toISOString(),
                    'last_reviewed_at' => $item->last_reviewed_at?->toISOString(),
                    'approved_at' => $item->approved_at?->toISOString(),
                    'view_count' => $item->view_count,
                    'helpful_count' => $item->helpful_count,
                    'not_helpful_count' => $item->not_helpful_count,
                    'share_count' => $item->share_count,
                    'comment_count' => $item->comment_count,
                    'search_hit_count' => $item->search_hit_count,
                    'ai_usage_count' => $item->ai_usage_count,
                    'ai_generated' => $item->ai_generated,
                    'ai_confidence_score' => $item->ai_confidence_score,
                    'ai_last_processed_at' => $item->ai_last_processed_at?->toISOString(),
                    'version' => $item->version,
                    'is_latest_version' => $item->is_latest_version,
                    'change_summary' => $item->change_summary,
                    'quality_score' => $item->quality_score,
                    'quality_percentage' => $item->quality_percentage,
                    'effectiveness_score' => $item->effectiveness_score,
                    'effectiveness_percentage' => $item->effectiveness_percentage,
                    'last_effectiveness_update' => $item->last_effectiveness_update?->toISOString(),
                    'metadata' => $item->metadata,
                    'configuration' => $item->configuration,
                    'status' => $item->status,
                    'created_at' => $item->created_at->toISOString(),
                    'updated_at' => $item->updated_at->toISOString(),

                    // Computed attributes
                    'is_published' => $item->isPublished(),
                    'is_approved' => $item->isApproved(),
                    'is_draft' => $item->isDraft(),
                    'needs_review' => $item->needsReview(),
                    'is_article' => $item->isArticle(),
                    'is_qa_collection' => $item->isQaCollection(),
                    'is_faq' => $item->isFaq(),
                    'total_feedback' => $item->total_feedback,
                    'feedback_percentage' => $item->feedback_percentage,
                    'url' => $item->url,

                    // Relationships (simplified for collection)
                    'category' => $item->whenLoaded('category', function () use ($item) {
                        return [
                            'id' => $item->category->id,
                            'name' => $item->category->name,
                            'slug' => $item->category->slug,
                            'description' => $item->category->description,
                            'icon' => $item->category->icon,
                            'color' => $item->category->color
                        ];
                    }),

                    'author' => $item->whenLoaded('author', function () use ($item) {
                        return [
                            'id' => $item->author->id,
                            'name' => $item->author->name,
                            'email' => $item->author->email,
                            'avatar_url' => $item->author->avatar_url
                        ];
                    }),

                    'knowledge_tags' => $item->whenLoaded('knowledgeTags', function () use ($item) {
                        return $item->knowledgeTags->map(function ($tag) {
                            return [
                                'id' => $tag->id,
                                'name' => $tag->name,
                                'slug' => $tag->slug,
                                'color' => $tag->color,
                                'icon' => $tag->icon
                            ];
                        });
                    }),

                    'qa_items_count' => $item->whenLoaded('qaItems', function () use ($item) {
                        return $item->qaItems->count();
                    }),

                    // Permissions (for frontend use)
                    'permissions' => [
                        'can_edit' => $request->user()?->hasPermission('knowledge.edit') ||
                                     $request->user()?->id === $item->author_id,
                        'can_delete' => $request->user()?->hasPermission('knowledge.delete') ||
                                       $request->user()?->id === $item->author_id,
                        'can_publish' => $request->user()?->hasPermission('knowledge.publish'),
                        'can_approve' => $request->user()?->hasPermission('knowledge.approve'),
                        'can_view_content' => $request->user()?->hasPermission('knowledge.view_content')
                    ]
                ];
            }),

            // Pagination metadata (if paginated)
            'pagination' => $this->resource instanceof \Illuminate\Pagination\LengthAwarePaginator ? [
                'current_page' => $this->resource->currentPage(),
                'last_page' => $this->resource->lastPage(),
                'per_page' => $this->resource->perPage(),
                'total' => $this->resource->total(),
                'from' => $this->resource->firstItem(),
                'to' => $this->resource->lastItem(),
                'has_more_pages' => $this->resource->hasMorePages(),
                'has_pages' => $this->resource->hasPages(),
                'first_page_url' => $this->resource->url(1),
                'last_page_url' => $this->resource->url($this->resource->lastPage()),
                'next_page_url' => $this->resource->nextPageUrl(),
                'prev_page_url' => $this->resource->previousPageUrl(),
                'path' => $this->resource->path(),
                'links' => $this->resource->linkCollection()->toArray()
            ] : null,

            // Collection metadata
            'meta' => [
                'total_count' => $this->collection->count(),
                'content_types' => $this->collection->pluck('content_type')->unique()->values(),
                'languages' => $this->collection->pluck('language')->unique()->filter()->values(),
                'difficulty_levels' => $this->collection->pluck('difficulty_level')->unique()->filter()->values(),
                'priorities' => $this->collection->pluck('priority')->unique()->filter()->values(),
                'workflow_statuses' => $this->collection->pluck('workflow_status')->unique()->values(),
                'approval_statuses' => $this->collection->pluck('approval_status')->unique()->values(),
                'published_count' => $this->collection->where('workflow_status', 'published')->count(),
                'draft_count' => $this->collection->where('workflow_status', 'draft')->count(),
                'review_count' => $this->collection->where('workflow_status', 'review')->count(),
                'featured_count' => $this->collection->where('is_featured', true)->count(),
                'public_count' => $this->collection->where('is_public', true)->count(),
                'ai_trainable_count' => $this->collection->where('is_ai_trainable', true)->count(),
                'total_views' => $this->collection->sum('view_count'),
                'total_helpful' => $this->collection->sum('helpful_count'),
                'total_not_helpful' => $this->collection->sum('not_helpful_count'),
                'total_ai_usage' => $this->collection->sum('ai_usage_count'),
                'average_quality_score' => $this->collection->whereNotNull('quality_score')->avg('quality_score'),
                'average_effectiveness_score' => $this->collection->whereNotNull('effectiveness_score')->avg('effectiveness_score')
            ]
        ];
    }
}
