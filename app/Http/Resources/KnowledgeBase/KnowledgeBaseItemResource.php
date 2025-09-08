<?php

namespace App\Http\Resources\KnowledgeBase;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class KnowledgeBaseItemResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'category_id' => $this->category_id,
            'title' => $this->title,
            'slug' => $this->slug,
            'description' => $this->description,
            'content_type' => $this->content_type,
            'content' => $this->when($request->user()?->hasPermission('knowledge.view_content'), $this->content),
            'summary' => $this->summary,
            'excerpt' => $this->excerpt,
            'tags' => $this->tags,
            'keywords' => $this->keywords,
            'language' => $this->language,
            'difficulty_level' => $this->difficulty_level,
            'priority' => $this->priority,
            'estimated_read_time' => $this->estimated_read_time,
            'reading_time' => $this->reading_time,
            'word_count' => $this->word_count,
            'meta_title' => $this->meta_title,
            'meta_description' => $this->meta_description,
            'featured_image_url' => $this->featured_image_url,
            'is_featured' => $this->is_featured,
            'is_public' => $this->is_public,
            'is_searchable' => $this->is_searchable,
            'is_ai_trainable' => $this->is_ai_trainable,
            'requires_approval' => $this->requires_approval,
            'workflow_status' => $this->workflow_status,
            'approval_status' => $this->approval_status,
            'published_at' => $this->published_at?->toISOString(),
            'last_reviewed_at' => $this->last_reviewed_at?->toISOString(),
            'approved_at' => $this->approved_at?->toISOString(),
            'view_count' => $this->view_count,
            'helpful_count' => $this->helpful_count,
            'not_helpful_count' => $this->not_helpful_count,
            'share_count' => $this->share_count,
            'comment_count' => $this->comment_count,
            'search_hit_count' => $this->search_hit_count,
            'ai_usage_count' => $this->ai_usage_count,
            'ai_generated' => $this->ai_generated,
            'ai_confidence_score' => $this->ai_confidence_score,
            'ai_last_processed_at' => $this->ai_last_processed_at?->toISOString(),
            'version' => $this->version,
            'is_latest_version' => $this->is_latest_version,
            'change_summary' => $this->change_summary,
            'quality_score' => $this->quality_score,
            'quality_percentage' => $this->quality_percentage,
            'effectiveness_score' => $this->effectiveness_score,
            'effectiveness_percentage' => $this->effectiveness_percentage,
            'last_effectiveness_update' => $this->last_effectiveness_update?->toISOString(),
            'metadata' => $this->metadata,
            'configuration' => $this->configuration,
            'status' => $this->status,
            'created_at' => $this->created_at->toISOString(),
            'updated_at' => $this->updated_at->toISOString(),

            // Computed attributes
            'is_published' => $this->isPublished(),
            'is_approved' => $this->isApproved(),
            'is_draft' => $this->isDraft(),
            'needs_review' => $this->needsReview(),
            'is_article' => $this->isArticle(),
            'is_qa_collection' => $this->isQaCollection(),
            'is_faq' => $this->isFaq(),
            'total_feedback' => $this->total_feedback,
            'feedback_percentage' => $this->feedback_percentage,
            'url' => $this->url,

            // Relationships - Optimized with selective loading
            'category' => $this->whenLoaded('category', function () {
                return [
                    'id' => $this->category->id,
                    'name' => $this->category->name,
                    'slug' => $this->category->slug,
                    'description' => $this->category->description,
                    'icon' => $this->category->icon,
                    'color' => $this->category->color
                ];
            }),

            'author' => $this->whenLoaded('author', function () {
                return [
                    'id' => $this->author->id,
                    'name' => $this->author->name,
                    'email' => $this->author->email,
                    'avatar_url' => $this->author->avatar_url
                ];
            }),

            'reviewer' => $this->whenLoaded('reviewer', function () {
                return [
                    'id' => $this->reviewer->id,
                    'name' => $this->reviewer->name,
                    'email' => $this->reviewer->email
                ];
            }),

            'approved_by' => $this->whenLoaded('approvedBy', function () {
                return [
                    'id' => $this->approvedBy->id,
                    'name' => $this->approvedBy->name,
                    'email' => $this->approvedBy->email
                ];
            }),

            'knowledge_tags' => $this->whenLoaded('knowledgeTags', function () {
                return $this->knowledgeTags->map(function ($tag) {
                    return [
                        'id' => $tag->id,
                        'name' => $tag->name,
                        'slug' => $tag->slug,
                        'color' => $tag->color,
                        'icon' => $tag->icon,
                        'pivot' => [
                            'assigned_by' => $tag->pivot->assigned_by ?? null,
                            'assigned_at' => $tag->pivot->assigned_at?->toISOString(),
                            'is_auto_assigned' => $tag->pivot->is_auto_assigned ?? false,
                            'confidence_score' => $tag->pivot->confidence_score ?? null
                        ]
                    ];
                });
            }),

            'qa_items' => $this->whenLoaded('qaItems', function () {
                return $this->qaItems->map(function ($qaItem) {
                    return [
                        'id' => $qaItem->id,
                        'question' => $qaItem->question,
                        'answer' => $qaItem->answer,
                        'question_variations' => $qaItem->question_variations,
                        'answer_variations' => $qaItem->answer_variations,
                        'context' => $qaItem->context,
                        'intent' => $qaItem->intent,
                        'confidence_level' => $qaItem->confidence_level,
                        'confidence_percentage' => $qaItem->confidence_percentage,
                        'keywords' => $qaItem->keywords,
                        'search_keywords' => $qaItem->search_keywords,
                        'trigger_phrases' => $qaItem->trigger_phrases,
                        'conditions' => $qaItem->conditions,
                        'response_rules' => $qaItem->response_rules,
                        'usage_count' => $qaItem->usage_count,
                        'success_rate' => $qaItem->success_rate,
                        'user_satisfaction' => $qaItem->user_satisfaction,
                        'last_used_at' => $qaItem->last_used_at?->toISOString(),
                        'ai_confidence' => $qaItem->ai_confidence,
                        'ai_last_trained_at' => $qaItem->ai_last_trained_at?->toISOString(),
                        'order_index' => $qaItem->order_index,
                        'is_primary' => $qaItem->is_primary,
                        'is_active' => $qaItem->is_active,
                        'metadata' => $qaItem->metadata,
                        'created_at' => $qaItem->created_at->toISOString(),
                        'updated_at' => $qaItem->updated_at->toISOString()
                    ];
                });
            }),

            // Previous and next versions
            'previous_version' => $this->whenLoaded('previousVersion', function () {
                return [
                    'id' => $this->previousVersion->id,
                    'title' => $this->previousVersion->title,
                    'slug' => $this->previousVersion->slug,
                    'version' => $this->previousVersion->version,
                    'created_at' => $this->previousVersion->created_at->toISOString()
                ];
            }),

            'next_versions' => $this->whenLoaded('nextVersions', function () {
                return $this->nextVersions->map(function ($version) {
                    return [
                        'id' => $version->id,
                        'title' => $version->title,
                        'slug' => $version->slug,
                        'version' => $version->version,
                        'created_at' => $version->created_at->toISOString()
                    ];
                });
            }),

            // Related items
            'related_items' => $this->whenLoaded('relatedItems', function () {
                return $this->relatedItems->map(function ($item) {
                    return [
                        'id' => $item->id,
                        'title' => $item->title,
                        'slug' => $item->slug,
                        'description' => $item->description,
                        'content_type' => $item->content_type,
                        'excerpt' => $item->excerpt,
                        'view_count' => $item->view_count,
                        'pivot' => [
                            'relationship_type' => $item->pivot->relationship_type,
                            'strength' => $item->pivot->strength,
                            'description' => $item->pivot->description,
                            'is_auto_discovered' => $item->pivot->is_auto_discovered
                        ]
                    ];
                });
            }),

            // Permissions (for frontend use)
            'permissions' => [
                'can_edit' => $request->user()?->hasPermission('knowledge.edit') ||
                             $request->user()?->id === $this->author_id,
                'can_delete' => $request->user()?->hasPermission('knowledge.delete') ||
                               $request->user()?->id === $this->author_id,
                'can_publish' => $request->user()?->hasPermission('knowledge.publish'),
                'can_approve' => $request->user()?->hasPermission('knowledge.approve'),
                'can_view_content' => $request->user()?->hasPermission('knowledge.view_content')
            ]
        ];
    }
}
