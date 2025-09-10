<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class BulkUpdateSubscriptionRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user() && $this->user()->isSuperAdmin();
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'subscription_ids' => 'required|array|min:1|max:100',
            'subscription_ids.*' => 'uuid|exists:subscriptions,id',
            'status' => 'nullable|in:pending,processing,success,failed,expired,refunded,cancelled,disputed',
            'billing_cycle' => 'nullable|in:monthly,quarterly,yearly,lifetime',
            'cancellation_reason' => 'nullable|string|max:500',
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
            'subscription_ids.required' => 'Subscription IDs are required',
            'subscription_ids.array' => 'Subscription IDs must be an array',
            'subscription_ids.min' => 'At least one subscription ID is required',
            'subscription_ids.max' => 'Maximum 100 subscriptions can be updated at once',
            'subscription_ids.*.uuid' => 'Each subscription ID must be a valid UUID',
            'subscription_ids.*.exists' => 'One or more subscription IDs do not exist',
            'status.in' => 'Status must be one of: pending, processing, success, failed, expired, refunded, cancelled, disputed',
            'billing_cycle.in' => 'Billing cycle must be one of: monthly, quarterly, yearly, lifetime',
            'cancellation_reason.string' => 'Cancellation reason must be a string',
            'cancellation_reason.max' => 'Cancellation reason must not exceed 500 characters',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     *
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'subscription_ids' => 'subscription IDs',
            'subscription_ids.*' => 'subscription ID',
            'billing_cycle' => 'billing cycle',
            'cancellation_reason' => 'cancellation reason',
        ];
    }
}
