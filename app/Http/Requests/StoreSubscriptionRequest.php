<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreSubscriptionRequest extends FormRequest
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
            'organization_id' => 'required|uuid|exists:organizations,id',
            'plan_id' => 'required|uuid|exists:subscription_plans,id',
            'billing_cycle' => 'required|in:monthly,quarterly,yearly,lifetime',
            'unit_amount' => 'required|numeric|min:0',
            'currency' => 'required|string|size:3',
            'discount_amount' => 'nullable|numeric|min:0',
            'tax_amount' => 'nullable|numeric|min:0',
            'trial_start' => 'nullable|date',
            'trial_end' => 'nullable|date|after:trial_start',
            'current_period_start' => 'required|date',
            'current_period_end' => 'required|date|after:current_period_start',
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
            'organization_id.required' => 'Organization ID is required',
            'organization_id.uuid' => 'Organization ID must be a valid UUID',
            'organization_id.exists' => 'Organization not found',
            'plan_id.required' => 'Plan ID is required',
            'plan_id.uuid' => 'Plan ID must be a valid UUID',
            'plan_id.exists' => 'Subscription plan not found',
            'billing_cycle.required' => 'Billing cycle is required',
            'billing_cycle.in' => 'Billing cycle must be one of: monthly, quarterly, yearly, lifetime',
            'unit_amount.required' => 'Unit amount is required',
            'unit_amount.numeric' => 'Unit amount must be a number',
            'unit_amount.min' => 'Unit amount must be at least 0',
            'currency.required' => 'Currency is required',
            'currency.size' => 'Currency must be exactly 3 characters',
            'discount_amount.numeric' => 'Discount amount must be a number',
            'discount_amount.min' => 'Discount amount must be at least 0',
            'tax_amount.numeric' => 'Tax amount must be a number',
            'tax_amount.min' => 'Tax amount must be at least 0',
            'trial_start.date' => 'Trial start must be a valid date',
            'trial_end.date' => 'Trial end must be a valid date',
            'trial_end.after' => 'Trial end must be after trial start',
            'current_period_start.required' => 'Current period start is required',
            'current_period_start.date' => 'Current period start must be a valid date',
            'current_period_end.required' => 'Current period end is required',
            'current_period_end.date' => 'Current period end must be a valid date',
            'current_period_end.after' => 'Current period end must be after current period start',
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
            'organization_id' => 'organization',
            'plan_id' => 'subscription plan',
            'billing_cycle' => 'billing cycle',
            'unit_amount' => 'unit amount',
            'discount_amount' => 'discount amount',
            'tax_amount' => 'tax amount',
            'trial_start' => 'trial start date',
            'trial_end' => 'trial end date',
            'current_period_start' => 'current period start',
            'current_period_end' => 'current period end',
        ];
    }
}
