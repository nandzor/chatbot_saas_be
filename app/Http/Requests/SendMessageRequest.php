<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SendMessageRequest extends FormRequest
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
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'content' => 'required|string|max:5000',
            'message_type' => 'nullable|string|in:text,image,video,audio,file,location,contact,sticker',
            'media_url' => 'nullable|url|max:500',
            'media_type' => 'nullable|string|max:50',
            'media_size' => 'nullable|integer|min:0',
            'media_metadata' => 'nullable|array',
            'thumbnail_url' => 'nullable|url|max:500',
            'quick_replies' => 'nullable|array',
            'buttons' => 'nullable|array',
            'template_data' => 'nullable|array',
            'intent' => 'nullable|string|max:100',
            'entities' => 'nullable|array',
            'confidence_score' => 'nullable|numeric|between:0,1',
            'ai_generated' => 'nullable|boolean',
            'ai_model_used' => 'nullable|string|max:100',
            'sentiment_score' => 'nullable|numeric|between:-1,1',
            'sentiment_label' => 'nullable|string|in:positive,negative,neutral',
            'emotion_scores' => 'nullable|array',
            'reply_to_message_id' => 'nullable|uuid|exists:messages,id',
            'thread_id' => 'nullable|uuid',
            'context' => 'nullable|array',
            'metadata' => 'nullable|array',
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'content.required' => 'Message content is required.',
            'content.max' => 'Message content must not exceed 5000 characters.',
            'message_type.in' => 'Message type must be one of: text, image, video, audio, file, location, contact, sticker.',
            'media_url.url' => 'Media URL must be a valid URL.',
            'media_url.max' => 'Media URL must not exceed 500 characters.',
            'thumbnail_url.url' => 'Thumbnail URL must be a valid URL.',
            'thumbnail_url.max' => 'Thumbnail URL must not exceed 500 characters.',
            'confidence_score.between' => 'Confidence score must be between 0 and 1.',
            'sentiment_score.between' => 'Sentiment score must be between -1 and 1.',
            'sentiment_label.in' => 'Sentiment label must be one of: positive, negative, neutral.',
            'reply_to_message_id.uuid' => 'Reply to message ID must be a valid UUID.',
            'reply_to_message_id.exists' => 'Reply to message not found.',
            'thread_id.uuid' => 'Thread ID must be a valid UUID.',
        ];
    }
}
