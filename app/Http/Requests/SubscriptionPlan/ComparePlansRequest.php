<?php

namespace App\Http\Requests\SubscriptionPlan;

use App\Http\Requests\BaseRequest;

class ComparePlansRequest extends BaseRequest
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
            'plan_ids' => 'required|array|min:2|max:5',
            'plan_ids.*' => 'required|string|exists:subscription_plans,id',
            'include_features' => 'nullable|boolean',
            'include_pricing' => 'nullable|boolean',
            'include_limits' => 'nullable|boolean',
            'include_statistics' => 'nullable|boolean',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return array_merge(parent::messages(), [
            'plan_ids.required' => 'At least 2 plan IDs are required for comparison.',
            'plan_ids.array' => 'Plan IDs must be provided as an array.',
            'plan_ids.min' => 'At least 2 plans are required for comparison.',
            'plan_ids.max' => 'Maximum 5 plans can be compared at once.',
            'plan_ids.*.required' => 'Each plan ID is required.',
            'plan_ids.*.exists' => 'One or more plan IDs are invalid.',
        ]);
    }
}
