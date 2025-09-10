<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateSubscriptionRequest extends FormRequest
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
            'status' => 'nullable|in:pending,processing,success,failed,expired,refunded,cancelled,disputed',
            'billing_cycle' => 'nullable|in:monthly,quarterly,yearly,lifetime',
            'unit_amount' => 'nullable|numeric|min:0',
            'discount_amount' => 'nullable|numeric|min:0',
            'tax_amount' => 'nullable|numeric|min:0',
            'current_period_start' => 'nullable|date',
            'current_period_end' => 'nullable|date|after:current_period_start',
            'cancel_at_period_end' => 'nullable|boolean',
            'cancellation_reason' => 'nullable|string|max:500',
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
            'status.in' => 'Status must be one of: pending, processing, success, failed, expired, refunded, cancelled, disputed',
            'billing_cycle.in' => 'Billing cycle must be one of: monthly, quarterly, yearly, lifetime',
            'unit_amount.numeric' => 'Unit amount must be a number',
            'unit_amount.min' => 'Unit amount must be at least 0',
            'discount_amount.numeric' => 'Discount amount must be a number',
            'discount_amount.min' => 'Discount amount must be at least 0',
            'tax_amount.numeric' => 'Tax amount must be a number',
            'tax_amount.min' => 'Tax amount must be at least 0',
            'current_period_start.date' => 'Current period start must be a valid date',
            'current_period_end.date' => 'Current period end must be a valid date',
            'current_period_end.after' => 'Current period end must be after current period start',
            'cancel_at_period_end.boolean' => 'Cancel at period end must be true or false',
            'cancellation_reason.string' => 'Cancellation reason must be a string',
            'cancellation_reason.max' => 'Cancellation reason must not exceed 500 characters',
            'metadata.array' => 'Metadata must be an array',
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
            'billing_cycle' => 'billing cycle',
            'unit_amount' => 'unit amount',
            'discount_amount' => 'discount amount',
            'tax_amount' => 'tax amount',
            'current_period_start' => 'current period start',
            'current_period_end' => 'current period end',
            'cancel_at_period_end' => 'cancel at period end',
            'cancellation_reason' => 'cancellation reason',
        ];
    }
}
