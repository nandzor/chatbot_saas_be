<?php

namespace App\Http\Requests\Api\V1\WebhookEvent;

use Illuminate\Foundation\Http\FormRequest;

class UpdateWebhookEventRequest extends FormRequest
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
            'organization_id' => 'sometimes|exists:organizations,id',
            'subscription_id' => 'nullable|exists:subscriptions,id',
            'gateway' => 'sometimes|string|in:stripe,midtrans,xendit,paypal,razorpay',
            'event_type' => 'sometimes|string|max:100',
            'event_id' => 'sometimes|string|max:100',
            'status' => 'sometimes|string|in:pending,processing,processed,failed,retrying',
            'payload' => 'sometimes|array',
            'signature' => 'nullable|string|max:500',
            'processed_at' => 'nullable|date',
            'retry_count' => 'sometimes|integer|min:0|max:10',
            'next_retry_at' => 'nullable|date',
            'error_message' => 'nullable|string|max:1000',
            'metadata' => 'nullable|array',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'organization_id.exists' => 'Organization not found',
            'subscription_id.exists' => 'Subscription not found',
            'gateway.in' => 'Gateway must be one of: stripe, midtrans, xendit, paypal, razorpay',
            'event_type.max' => 'Event type must not exceed 100 characters',
            'event_id.max' => 'Event ID must not exceed 100 characters',
            'status.in' => 'Status must be one of: pending, processing, processed, failed, retrying',
            'payload.array' => 'Payload must be an array',
            'signature.max' => 'Signature must not exceed 500 characters',
            'processed_at.date' => 'Processed at must be a valid date',
            'retry_count.integer' => 'Retry count must be an integer',
            'retry_count.min' => 'Retry count must be at least 0',
            'retry_count.max' => 'Retry count must not exceed 10',
            'next_retry_at.date' => 'Next retry at must be a valid date',
            'error_message.max' => 'Error message must not exceed 1000 characters',
            'metadata.array' => 'Metadata must be an array',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'organization_id' => 'organization',
            'subscription_id' => 'subscription',
            'event_type' => 'event type',
            'event_id' => 'event ID',
            'processed_at' => 'processed at',
            'retry_count' => 'retry count',
            'next_retry_at' => 'next retry at',
            'error_message' => 'error message',
        ];
    }
}
