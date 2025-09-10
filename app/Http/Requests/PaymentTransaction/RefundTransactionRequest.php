<?php

namespace App\Http\Requests\PaymentTransaction;

use App\Http\Requests\BaseRequest;

class RefundTransactionRequest extends BaseRequest
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
            'amount' => 'nullable|numeric|min:0.01',
            'reason' => 'required|string|max:500',
            'notify_customer' => 'nullable|boolean',
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
            'amount.numeric' => 'The refund amount must be a valid number.',
            'amount.min' => 'The refund amount must be at least 0.01.',
            'reason.required' => 'The refund reason is required.',
            'reason.max' => 'The refund reason may not be greater than 500 characters.',
            'refund_method.in' => 'The refund method must be either original or manual.',
            'notes.max' => 'The notes may not be greater than 1000 characters.',
        ]);
    }
}
