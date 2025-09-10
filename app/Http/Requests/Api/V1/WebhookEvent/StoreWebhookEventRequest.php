<?php

namespace App\Http\Requests\Api\V1\WebhookEvent;

use Illuminate\Foundation\Http\FormRequest;

class StoreWebhookEventRequest extends FormRequest
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
            'organization_id' => 'required|exists:organizations,id',
            'subscription_id' => 'nullable|exists:subscriptions,id',
            'gateway' => 'required|string|in:stripe,midtrans,xendit,paypal,razorpay',
            'event_type' => 'required|string|max:100',
            'event_id' => 'required|string|max:100',
            'status' => 'sometimes|string|in:pending,processed,failed,retrying',
            'payload' => 'required|array',
            'signature' => 'nullable|string|max:500',
            'metadata' => 'nullable|array',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'organization_id.required' => 'Organization ID is required',
            'organization_id.exists' => 'Organization not found',
            'subscription_id.exists' => 'Subscription not found',
            'gateway.required' => 'Gateway is required',
            'gateway.in' => 'Gateway must be one of: stripe, midtrans, xendit, paypal, razorpay',
            'event_type.required' => 'Event type is required',
            'event_type.max' => 'Event type must not exceed 100 characters',
            'event_id.required' => 'Event ID is required',
            'event_id.max' => 'Event ID must not exceed 100 characters',
            'status.in' => 'Status must be one of: pending, processed, failed, retrying',
            'payload.required' => 'Payload is required',
            'payload.array' => 'Payload must be an array',
            'signature.max' => 'Signature must not exceed 500 characters',
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
        ];
    }
}
