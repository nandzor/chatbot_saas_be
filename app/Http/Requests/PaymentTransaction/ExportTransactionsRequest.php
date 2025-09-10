<?php

namespace App\Http\Requests\PaymentTransaction;

use App\Http\Requests\BaseRequest;

class ExportTransactionsRequest extends BaseRequest
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
            'format' => 'required|string|in:csv,xlsx,pdf',
            'filters' => 'nullable|array',
            'filters.status' => 'nullable|string|in:pending,processing,completed,failed,refunded,cancelled',
            'filters.payment_method' => 'nullable|string',
            'filters.payment_gateway' => 'nullable|string',
            'filters.organization_id' => 'nullable|uuid|exists:organizations,id',
            'filters.plan_id' => 'nullable|uuid|exists:subscription_plans,id',
            'filters.amount_min' => 'nullable|numeric|min:0',
            'filters.amount_max' => 'nullable|numeric|min:0|gte:filters.amount_min',
            'filters.date_from' => 'nullable|date|before_or_equal:filters.date_to',
            'filters.date_to' => 'nullable|date|after_or_equal:filters.date_from',
            'filters.currency' => 'nullable|string|size:3',
            'include_metadata' => 'nullable|boolean',
            'include_gateway_response' => 'nullable|boolean',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return array_merge(parent::messages(), [
            'format.required' => 'Export format is required.',
            'format.in' => 'Export format must be csv, xlsx, or pdf.',
            'filters.status.in' => 'Invalid status filter value.',
            'filters.organization_id.exists' => 'Selected organization does not exist.',
            'filters.plan_id.exists' => 'Selected subscription plan does not exist.',
            'filters.amount_min.numeric' => 'Minimum amount must be a valid number.',
            'filters.amount_min.min' => 'Minimum amount must be at least 0.',
            'filters.amount_max.numeric' => 'Maximum amount must be a valid number.',
            'filters.amount_max.gte' => 'Maximum amount must be greater than or equal to minimum amount.',
            'filters.date_from.date' => 'Date from must be a valid date.',
            'filters.date_from.before_or_equal' => 'Date from must be before or equal to date to.',
            'filters.date_to.date' => 'Date to must be a valid date.',
            'filters.date_to.after_or_equal' => 'Date to must be after or equal to date from.',
            'filters.currency.size' => 'Currency must be exactly 3 characters.',
        ]);
    }
}
