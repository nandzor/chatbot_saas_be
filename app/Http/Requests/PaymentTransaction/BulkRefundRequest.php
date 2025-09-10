<?php

namespace App\Http\Requests\PaymentTransaction;

use App\Http\Requests\BaseRequest;

class BulkRefundRequest extends BaseRequest
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
            'transaction_ids' => 'required|array|min:1|max:100',
            'transaction_ids.*' => 'required|string|exists:payment_transactions,id',
            'reason' => 'required|string|max:500',
            'notify_customers' => 'nullable|boolean',
            'refund_method' => 'nullable|string|in:original,manual',
            'notes' => 'nullable|string|max:1000',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return array_merge(parent::messages(), [
            'transaction_ids.required' => 'At least one transaction ID is required.',
            'transaction_ids.array' => 'Transaction IDs must be provided as an array.',
            'transaction_ids.min' => 'At least one transaction ID is required.',
            'transaction_ids.max' => 'Maximum 100 transactions can be refunded at once.',
            'transaction_ids.*.required' => 'Each transaction ID is required.',
            'transaction_ids.*.exists' => 'One or more transaction IDs are invalid.',
            'reason.required' => 'The refund reason is required.',
            'reason.max' => 'The refund reason may not be greater than 500 characters.',
            'refund_method.in' => 'The refund method must be either original or manual.',
            'notes.max' => 'The notes may not be greater than 1000 characters.',
        ]);
    }
}
