<?php

namespace App\Http\Requests\Subscription;

use App\Http\Requests\BaseRequest;

class CancelSubscriptionRequest extends BaseRequest
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
            'cancel_at_period_end' => 'nullable|boolean',
            'cancellation_reason' => 'required|string|max:500',
            'effective_date' => 'nullable|date|after:today',
            'notify_customer' => 'nullable|boolean',
            'notes' => 'nullable|string|max:1000',
            'refund_policy' => 'nullable|string|in:no_refund,prorated,full',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return array_merge(parent::messages(), [
            'cancellation_reason.required' => 'Cancellation reason is required.',
            'cancellation_reason.max' => 'The cancellation reason may not be greater than 500 characters.',
            'effective_date.date' => 'Effective date must be a valid date.',
            'effective_date.after' => 'Effective date must be in the future.',
            'notes.max' => 'The notes may not be greater than 1000 characters.',
            'refund_policy.in' => 'Refund policy must be no_refund, prorated, or full.',
        ]);
    }
}
