<?php

namespace App\Http\Requests\Subscription;

use App\Http\Requests\BaseRequest;

class DowngradeSubscriptionRequest extends BaseRequest
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
            'new_plan_id' => 'required|string|exists:subscription_plans,id',
            'effective_date' => 'nullable|date|after:today',
            'reason' => 'nullable|string|max:500',
            'notify_customer' => 'nullable|boolean',
            'notes' => 'nullable|string|max:1000',
            'keep_features' => 'nullable|boolean',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return array_merge(parent::messages(), [
            'new_plan_id.required' => 'New subscription plan is required.',
            'new_plan_id.exists' => 'Selected subscription plan does not exist.',
            'effective_date.date' => 'Effective date must be a valid date.',
            'effective_date.after' => 'Effective date must be in the future.',
            'reason.max' => 'The reason may not be greater than 500 characters.',
            'notes.max' => 'The notes may not be greater than 1000 characters.',
        ]);
    }
}
