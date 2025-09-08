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
        return $this->user()->hasPermission('conversations.send_message');
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
            'sender_type' => 'required|string|in:customer,agent,bot,system',
            'sender_id' => 'nullable|uuid',
            'message_type' => 'nullable|string|in:text,image,file,audio,video,location,contact,sticker',
            'status' => 'nullable|string|in:sent,delivered,read,failed',
            'is_read' => 'nullable|boolean',
            'metadata' => 'nullable|array',
            'metadata.attachments' => 'nullable|array',
            'metadata.attachments.*.type' => 'nullable|string|max:50',
            'metadata.attachments.*.url' => 'nullable|url|max:500',
            'metadata.attachments.*.name' => 'nullable|string|max:255',
            'metadata.attachments.*.size' => 'nullable|integer|min:0',
            'metadata.reactions' => 'nullable|array',
            'metadata.reactions.*.type' => 'nullable|string|max:20',
            'metadata.reactions.*.user_id' => 'nullable|uuid',
            'metadata.reactions.*.created_at' => 'nullable|date',
            'metadata.quick_replies' => 'nullable|array',
            'metadata.quick_replies.*' => 'nullable|string|max:100',
            'metadata.buttons' => 'nullable|array',
            'metadata.buttons.*.text' => 'nullable|string|max:50',
            'metadata.buttons.*.action' => 'nullable|string|max:100',
            'metadata.buttons.*.url' => 'nullable|url|max:500',
            'metadata.buttons.*.payload' => 'nullable|string|max:500',
            'sentiment_score' => 'nullable|numeric|min:-1|max:1',
            'intent' => 'nullable|string|max:100',
            'entities' => 'nullable|array',
            'confidence_score' => 'nullable|numeric|min:0|max:1',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'content.required' => 'Message content is required.',
            'content.max' => 'Message content cannot exceed 5000 characters.',
            'sender_type.required' => 'Sender type is required.',
            'sender_type.in' => 'Sender type must be one of: customer, agent, bot, system.',
            'sender_id.uuid' => 'Sender ID must be a valid UUID.',
            'message_type.in' => 'Message type must be one of: text, image, file, audio, video, location, contact, sticker.',
            'status.in' => 'Status must be one of: sent, delivered, read, failed.',
            'metadata.attachments.*.type.max' => 'Attachment type cannot exceed 50 characters.',
            'metadata.attachments.*.url.url' => 'Attachment URL must be a valid URL.',
            'metadata.attachments.*.url.max' => 'Attachment URL cannot exceed 500 characters.',
            'metadata.attachments.*.name.max' => 'Attachment name cannot exceed 255 characters.',
            'metadata.attachments.*.size.min' => 'Attachment size cannot be negative.',
            'metadata.reactions.*.type.max' => 'Reaction type cannot exceed 20 characters.',
            'metadata.reactions.*.user_id.uuid' => 'Reaction user ID must be a valid UUID.',
            'metadata.reactions.*.created_at.date' => 'Reaction created at must be a valid date.',
            'metadata.quick_replies.*.max' => 'Quick reply cannot exceed 100 characters.',
            'metadata.buttons.*.text.max' => 'Button text cannot exceed 50 characters.',
            'metadata.buttons.*.action.max' => 'Button action cannot exceed 100 characters.',
            'metadata.buttons.*.url.url' => 'Button URL must be a valid URL.',
            'metadata.buttons.*.url.max' => 'Button URL cannot exceed 500 characters.',
            'metadata.buttons.*.payload.max' => 'Button payload cannot exceed 500 characters.',
            'sentiment_score.min' => 'Sentiment score must be between -1 and 1.',
            'sentiment_score.max' => 'Sentiment score must be between -1 and 1.',
            'intent.max' => 'Intent cannot exceed 100 characters.',
            'confidence_score.min' => 'Confidence score must be between 0 and 1.',
            'confidence_score.max' => 'Confidence score must be between 0 and 1.',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'sender_type' => 'sender type',
            'sender_id' => 'sender ID',
            'message_type' => 'message type',
            'metadata.attachments' => 'attachments',
            'metadata.reactions' => 'reactions',
            'metadata.quick_replies' => 'quick replies',
            'metadata.buttons' => 'buttons',
            'sentiment_score' => 'sentiment score',
            'confidence_score' => 'confidence score',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Set default values
        $this->merge([
            'message_type' => $this->message_type ?? 'text',
            'status' => $this->status ?? 'sent',
            'is_read' => $this->is_read ?? false,
        ]);

        // Trim content
        if ($this->has('content')) {
            $this->merge([
                'content' => trim($this->content)
            ]);
        }
    }
}
