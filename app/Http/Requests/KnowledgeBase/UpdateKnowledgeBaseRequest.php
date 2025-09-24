<?php

namespace App\Http\Requests\KnowledgeBase;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateKnowledgeBaseRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Authorization handled in service layer
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        $itemId = $this->route('id');

        return [
            'category_id' => [
                'sometimes',
                'uuid',
                Rule::exists('knowledge_base_categories', 'id')->where(function ($query) {
                    $query->where('organization_id', $this->user()->organization_id);
                })
            ],
            'title' => [
                'sometimes',
                'string',
                'max:255',
                'min:3'
            ],
            'slug' => [
                'nullable',
                'string',
                'max:255',
                'regex:/^[a-z0-9-]+$/',
                Rule::unique('knowledge_base_items', 'slug')
                    ->where(function ($query) {
                        $query->where('organization_id', $this->user()->organization_id);
                    })
                    ->ignore($itemId)
            ],
            'description' => [
                'sometimes',
                'string',
                'max:1000',
                'min:10'
            ],
            'content_type' => [
                'sometimes',
                'string',
                'in:article,guide,tutorial,qa_collection,faq,documentation,reference'
            ],
            'content' => [
                'sometimes',
                'string',
                'min:7000'
            ],
            'summary' => [
                'nullable',
                'string',
                'max:500'
            ],
            'excerpt' => [
                'nullable',
                'string',
                'max:200'
            ],
            'tags' => [
                'nullable',
                'array'
            ],
            'tags.*' => [
                'string',
                'max:50'
            ],
            'keywords' => [
                'nullable',
                'array'
            ],
            'keywords.*' => [
                'string',
                'max:100'
            ],
            'language' => [
                'nullable',
                'string',
                'in:indonesia,english,javanese,sundanese,balinese,minang,chinese,japanese,korean,spanish,french,german,arabic,thai,vietnamese'
            ],
            'difficulty_level' => [
                'nullable',
                'string',
                'in:basic,intermediate,advanced,expert'
            ],
            'priority' => [
                'nullable',
                'string',
                'in:low,medium,high,critical'
            ],
            'estimated_read_time' => [
                'nullable',
                'integer',
                'min:1',
                'max:480'
            ],
            'meta_title' => [
                'nullable',
                'string',
                'max:60'
            ],
            'meta_description' => [
                'nullable',
                'string',
                'max:160'
            ],
            'featured_image_url' => [
                'nullable',
                'url',
                'max:500'
            ],
            'is_featured' => [
                'nullable',
                'boolean'
            ],
            'is_public' => [
                'nullable',
                'boolean'
            ],
            'is_searchable' => [
                'nullable',
                'boolean'
            ],
            'is_ai_trainable' => [
                'nullable',
                'boolean'
            ],
            'requires_approval' => [
                'nullable',
                'boolean'
            ],
            'workflow_status' => [
                'nullable',
                'string',
                'in:draft,review,published,archived'
            ],
            'approval_status' => [
                'nullable',
                'string',
                'in:pending,approved,rejected'
            ],
            'published_at' => [
                'nullable',
                'date'
            ],
            'metadata' => [
                'nullable',
                'array'
            ],
            'configuration' => [
                'nullable',
                'array'
            ],
            'qa_items' => [
                'nullable',
                'array'
            ],
            'qa_items.*.question' => [
                'required_with:qa_items',
                'string',
                'max:500'
            ],
            'qa_items.*.answer' => [
                'required_with:qa_items',
                'string',
                'max:2000'
            ],
            'qa_items.*.question_variations' => [
                'nullable',
                'array'
            ],
            'qa_items.*.question_variations.*' => [
                'string',
                'max:500'
            ],
            'qa_items.*.answer_variations' => [
                'nullable',
                'array'
            ],
            'qa_items.*.answer_variations.*' => [
                'string',
                'max:2000'
            ],
            'qa_items.*.context' => [
                'nullable',
                'string',
                'max:1000'
            ],
            'qa_items.*.intent' => [
                'nullable',
                'string',
                'max:200'
            ],
            'qa_items.*.confidence_level' => [
                'nullable',
                'string',
                'in:low,medium,high'
            ],
            'qa_items.*.keywords' => [
                'nullable',
                'array'
            ],
            'qa_items.*.keywords.*' => [
                'string',
                'max:100'
            ],
            'qa_items.*.search_keywords' => [
                'nullable',
                'array'
            ],
            'qa_items.*.search_keywords.*' => [
                'string',
                'max:100'
            ],
            'qa_items.*.trigger_phrases' => [
                'nullable',
                'array'
            ],
            'qa_items.*.trigger_phrases.*' => [
                'string',
                'max:200'
            ],
            'qa_items.*.conditions' => [
                'nullable',
                'array'
            ],
            'qa_items.*.response_rules' => [
                'nullable',
                'array'
            ],
            'qa_items.*.order_index' => [
                'nullable',
                'integer',
                'min:0'
            ],
            'qa_items.*.is_primary' => [
                'nullable',
                'boolean'
            ],
            'qa_items.*.is_active' => [
                'nullable',
                'boolean'
            ],
            'qa_items.*.metadata' => [
                'nullable',
                'array'
            ]
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'category_id.exists' => 'Selected category does not exist.',
            'title.min' => 'Title must be at least 3 characters.',
            'title.max' => 'Title cannot exceed 255 characters.',
            'slug.regex' => 'Slug can only contain lowercase letters, numbers, and hyphens.',
            'slug.unique' => 'This slug is already taken.',
            'description.min' => 'Description must be at least 10 characters.',
            'description.max' => 'Description cannot exceed 1000 characters.',
            'content_type.in' => 'Invalid content type selected.',
            'content.min' => 'Content must be at least 7000 characters.',
            'language.in' => 'Invalid language selected.',
            'difficulty_level.in' => 'Invalid difficulty level selected.',
            'priority.in' => 'Invalid priority selected.',
            'estimated_read_time.min' => 'Estimated read time must be at least 1 minute.',
            'estimated_read_time.max' => 'Estimated read time cannot exceed 480 minutes.',
            'meta_title.max' => 'Meta title cannot exceed 60 characters.',
            'meta_description.max' => 'Meta description cannot exceed 160 characters.',
            'featured_image_url.url' => 'Featured image URL must be a valid URL.',
            'workflow_status.in' => 'Invalid workflow status selected.',
            'approval_status.in' => 'Invalid approval status selected.',
            'published_at.date' => 'Published at must be a valid date.',
            'qa_items.*.question.required_with' => 'Question is required for Q&A items.',
            'qa_items.*.answer.required_with' => 'Answer is required for Q&A items.',
            'qa_items.*.confidence_level.in' => 'Invalid confidence level selected.',
            'qa_items.*.order_index.min' => 'Order index must be at least 0.'
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'category_id' => 'category',
            'content_type' => 'content type',
            'difficulty_level' => 'difficulty level',
            'estimated_read_time' => 'estimated read time',
            'featured_image_url' => 'featured image URL',
            'is_featured' => 'featured status',
            'is_public' => 'public status',
            'is_searchable' => 'searchable status',
            'is_ai_trainable' => 'AI trainable status',
            'requires_approval' => 'approval requirement',
            'workflow_status' => 'workflow status',
            'approval_status' => 'approval status',
            'published_at' => 'published date',
            'qa_items' => 'Q&A items',
            'qa_items.*.question' => 'question',
            'qa_items.*.answer' => 'answer',
            'qa_items.*.question_variations' => 'question variations',
            'qa_items.*.answer_variations' => 'answer variations',
            'qa_items.*.confidence_level' => 'confidence level',
            'qa_items.*.search_keywords' => 'search keywords',
            'qa_items.*.trigger_phrases' => 'trigger phrases',
            'qa_items.*.response_rules' => 'response rules',
            'qa_items.*.order_index' => 'order index',
            'qa_items.*.is_primary' => 'primary status',
            'qa_items.*.is_active' => 'active status'
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Convert boolean strings to actual booleans
        $booleanFields = [
            'is_featured', 'is_public', 'is_searchable', 'is_ai_trainable',
            'requires_approval'
        ];

        foreach ($booleanFields as $field) {
            if ($this->has($field)) {
                $this->merge([$field => filter_var($this->input($field), FILTER_VALIDATE_BOOLEAN)]);
            }
        }

        // Handle Q&A items boolean fields
        if ($this->has('qa_items') && is_array($this->input('qa_items'))) {
            $qaItems = $this->input('qa_items');
            foreach ($qaItems as $index => $qaItem) {
                if (isset($qaItem['is_primary'])) {
                    $qaItems[$index]['is_primary'] = filter_var($qaItem['is_primary'], FILTER_VALIDATE_BOOLEAN);
                }
                if (isset($qaItem['is_active'])) {
                    $qaItems[$index]['is_active'] = filter_var($qaItem['is_active'], FILTER_VALIDATE_BOOLEAN);
                }
            }
            $this->merge(['qa_items' => $qaItems]);
        }
    }
}
