<?php

namespace App\Http\Requests\SubscriptionPlan;

use App\Http\Requests\BaseRequest;

class GetRecommendationsRequest extends BaseRequest
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
            'organization_id' => 'nullable|uuid|exists:organizations,id',
            'current_plan_id' => 'nullable|string|exists:subscription_plans,id',
            'usage_pattern' => 'nullable|string|in:light,moderate,heavy',
            'budget_range' => 'nullable|string|in:low,medium,high,enterprise',
            'features_needed' => 'nullable|array',
            'features_needed.*' => 'string|in:ai_chat,knowledge_base,multi_channel,api_access,analytics,custom_branding,priority_support,white_label,advanced_analytics,custom_integrations',
            'team_size' => 'nullable|integer|min:1|max:10000',
            'industry' => 'nullable|string|max:100',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return array_merge(parent::messages(), [
            'organization_id.exists' => 'Selected organization does not exist.',
            'current_plan_id.exists' => 'Current subscription plan does not exist.',
            'usage_pattern.in' => 'Usage pattern must be light, moderate, or heavy.',
            'budget_range.in' => 'Budget range must be low, medium, high, or enterprise.',
            'features_needed.*.in' => 'One or more requested features are invalid.',
            'team_size.integer' => 'Team size must be a valid number.',
            'team_size.min' => 'Team size must be at least 1.',
            'team_size.max' => 'Team size cannot exceed 10,000.',
            'industry.max' => 'Industry name may not be greater than 100 characters.',
        ]);
    }
}
