<?php

namespace App\Http\Requests\KnowledgeBase;

use Illuminate\Foundation\Http\FormRequest;

class SearchKnowledgeBaseRequest extends FormRequest
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
        return [
            'query' => [
                'required',
                'string',
                'min:2',
                'max:500'
            ],
            'limit' => [
                'nullable',
                'integer',
                'min:1',
                'max:100'
            ],
            'category_id' => [
                'nullable',
                'uuid'
            ],
            'content_type' => [
                'nullable',
                'string',
                'in:article,guide,tutorial,qa_collection,faq,documentation,reference'
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
            'is_public' => [
                'nullable',
                'boolean'
            ],
            'is_featured' => [
                'nullable',
                'boolean'
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
            ]
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'query.required' => 'Search query is required.',
            'query.min' => 'Search query must be at least 2 characters.',
            'query.max' => 'Search query cannot exceed 500 characters.',
            'limit.min' => 'Limit must be at least 1.',
            'limit.max' => 'Limit cannot exceed 100.',
            'content_type.in' => 'Invalid content type selected.',
            'language.in' => 'Invalid language selected.',
            'difficulty_level.in' => 'Invalid difficulty level selected.'
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'query' => 'search query',
            'content_type' => 'content type',
            'difficulty_level' => 'difficulty level'
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Convert boolean strings to actual booleans
        $booleanFields = ['is_public', 'is_featured'];

        foreach ($booleanFields as $field) {
            if ($this->has($field)) {
                $this->merge([$field => filter_var($this->input($field), FILTER_VALIDATE_BOOLEAN)]);
            }
        }

        // Trim whitespace from search query
        if ($this->has('query')) {
            $this->merge(['query' => trim($this->input('query'))]);
        }
    }
}
