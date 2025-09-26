<?php

namespace App\Http\Requests\Conversation;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

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
     */
    public function rules(): array
    {
        return [
            'message_text' => [
                'required',
                'string',
                'max:4000',
                'min:1'
            ],
            'message_type' => [
                'required',
                'string',
                Rule::in(['text', 'image', 'audio', 'video', 'document', 'location', 'contact', 'sticker'])
            ],
            'sender_type' => [
                'required',
                'string',
                Rule::in(['agent', 'bot', 'system'])
            ],
            'sender_id' => [
                'nullable',
                'string',
                'exists:users,id'
            ],
            'sender_name' => [
                'nullable',
                'string',
                'max:255'
            ],
            'media_url' => [
                'nullable',
                'string',
                'url',
                'max:2048'
            ],
            'media_type' => [
                'nullable',
                'string',
                Rule::in(['image', 'audio', 'video', 'document'])
            ],
            'media_size' => [
                'nullable',
                'integer',
                'min:1',
                'max:104857600' // 100MB
            ],
            'thumbnail_url' => [
                'nullable',
                'string',
                'url',
                'max:2048'
            ],
            'quick_replies' => [
                'nullable',
                'array',
                'max:10'
            ],
            'quick_replies.*' => [
                'string',
                'max:100'
            ],
            'buttons' => [
                'nullable',
                'array',
                'max:10'
            ],
            'buttons.*.text' => [
                'required_with:buttons',
                'string',
                'max:50'
            ],
            'buttons.*.value' => [
                'required_with:buttons',
                'string',
                'max:100'
            ],
            'template_data' => [
                'nullable',
                'array'
            ],
            'reply_to_message_id' => [
                'nullable',
                'string',
                'exists:messages,id'
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
            'message_text.required' => 'Message content is required.',
            'message_text.max' => 'Message content cannot exceed 4000 characters.',
            'message_text.min' => 'Message content cannot be empty.',
            'message_type.required' => 'Message type is required.',
            'message_type.in' => 'Invalid message type.',
            'sender_type.required' => 'Sender type is required.',
            'sender_type.in' => 'Invalid sender type.',
            'sender_id.exists' => 'Invalid sender ID.',
            'sender_name.max' => 'Sender name cannot exceed 255 characters.',
            'media_url.url' => 'Media URL must be a valid URL.',
            'media_url.max' => 'Media URL cannot exceed 2048 characters.',
            'media_type.in' => 'Invalid media type.',
            'media_size.max' => 'Media size cannot exceed 100MB.',
            'thumbnail_url.url' => 'Thumbnail URL must be a valid URL.',
            'thumbnail_url.max' => 'Thumbnail URL cannot exceed 2048 characters.',
            'quick_replies.max' => 'Cannot have more than 10 quick replies.',
            'quick_replies.*.max' => 'Quick reply text cannot exceed 100 characters.',
            'buttons.max' => 'Cannot have more than 10 buttons.',
            'buttons.*.text.required_with' => 'Button text is required.',
            'buttons.*.text.max' => 'Button text cannot exceed 50 characters.',
            'buttons.*.value.required_with' => 'Button value is required.',
            'buttons.*.value.max' => 'Button value cannot exceed 100 characters.',
            'reply_to_message_id.exists' => 'Invalid reply message ID.'
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'message_text' => 'message content',
            'message_type' => 'message type',
            'sender_type' => 'sender type',
            'sender_id' => 'sender ID',
            'sender_name' => 'sender name',
            'media_url' => 'media URL',
            'media_type' => 'media type',
            'media_size' => 'media size',
            'thumbnail_url' => 'thumbnail URL',
            'quick_replies' => 'quick replies',
            'buttons' => 'buttons',
            'template_data' => 'template data',
            'reply_to_message_id' => 'reply to message ID',
            'metadata' => 'metadata'
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Set default sender if not provided
        if (!$this->has('sender_id') && auth()->check()) {
            $this->merge([
                'sender_id' => auth()->id(),
                'sender_name' => auth()->user()->name
            ]);
        }

        // Set default message type if not provided
        if (!$this->has('message_type')) {
            $this->merge(['message_type' => 'text']);
        }

        // Set default sender type if not provided
        if (!$this->has('sender_type')) {
            $this->merge(['sender_type' => 'agent']);
        }
    }
}
