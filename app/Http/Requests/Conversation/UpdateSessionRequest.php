<?php

namespace App\Http\Requests\Conversation;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateSessionRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'priority' => [
                'nullable',
                'string',
                Rule::in(['low', 'normal', 'high', 'urgent'])
            ],
            'category' => [
                'nullable',
                'string',
                'max:100'
            ],
            'subcategory' => [
                'nullable',
                'string',
                'max:100'
            ],
            'tags' => [
                'nullable',
                'array',
                'max:10'
            ],
            'tags.*' => [
                'string',
                'max:50'
            ],
            'intent' => [
                'nullable',
                'string',
                'max:200'
            ],
            'sentiment_analysis' => [
                'nullable',
                'array'
            ],
            'sentiment_analysis.label' => [
                'nullable',
                'string',
                Rule::in(['positive', 'negative', 'neutral', 'mixed'])
            ],
            'sentiment_analysis.score' => [
                'nullable',
                'numeric',
                'between:-1,1'
            ],
            'sentiment_analysis.confidence' => [
                'nullable',
                'numeric',
                'between:0,1'
            ],
            'ai_summary' => [
                'nullable',
                'string',
                'max:2000'
            ],
            'topics_discussed' => [
                'nullable',
                'array',
                'max:20'
            ],
            'topics_discussed.*' => [
                'string',
                'max:100'
            ],
            'metadata' => [
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
            'priority.in' => 'Priority must be one of: low, normal, high, urgent.',
            'category.max' => 'Category cannot exceed 100 characters.',
            'subcategory.max' => 'Subcategory cannot exceed 100 characters.',
            'tags.max' => 'Cannot have more than 10 tags.',
            'tags.*.max' => 'Tag cannot exceed 50 characters.',
            'intent.max' => 'Intent cannot exceed 200 characters.',
            'sentiment_analysis.label.in' => 'Sentiment label must be one of: positive, negative, neutral, mixed.',
            'sentiment_analysis.score.between' => 'Sentiment score must be between -1 and 1.',
            'sentiment_analysis.confidence.between' => 'Sentiment confidence must be between 0 and 1.',
            'ai_summary.max' => 'AI summary cannot exceed 2000 characters.',
            'topics_discussed.max' => 'Cannot have more than 20 topics.',
            'topics_discussed.*.max' => 'Topic cannot exceed 100 characters.'
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'priority' => 'priority',
            'category' => 'category',
            'subcategory' => 'subcategory',
            'tags' => 'tags',
            'intent' => 'intent',
            'sentiment_analysis' => 'sentiment analysis',
            'ai_summary' => 'AI summary',
            'topics_discussed' => 'topics discussed',
            'metadata' => 'metadata'
        ];
    }
}
