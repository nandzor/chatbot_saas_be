<?php

namespace App\Http\Requests\SubscriptionPlan;

use App\Http\Requests\BaseRequest;
use Illuminate\Validation\Rule;

class UpdateSubscriptionPlanRequest extends BaseRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->hasPermission('subscription_plans.update');
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        $planId = $this->route('subscription_plan');

        return [
            'name' => [
                'sometimes',
                'string',
                'max:100',
                Rule::unique('subscription_plans', 'name')->ignore($planId)
            ],
            'display_name' => [
                'sometimes',
                'string',
                'max:255'
            ],
            'description' => [
                'nullable',
                'string',
                'max:1000'
            ],
            'tier' => [
                'sometimes',
                'string',
                'in:basic,professional,enterprise,custom'
            ],
            'price_monthly' => [
                'sometimes',
                'numeric',
                'min:0',
                'max:999999.99'
            ],
            'price_quarterly' => [
                'nullable',
                'numeric',
                'min:0',
                'max:999999.99'
            ],
            'price_yearly' => [
                'nullable',
                'numeric',
                'min:0',
                'max:999999.99'
            ],
            'currency' => [
                'sometimes',
                'string',
                'size:3',
                'in:USD,IDR,EUR,GBP'
            ],
            'max_agents' => [
                'sometimes',
                'integer',
                'min:1',
                'max:1000'
            ],
            'max_channels' => [
                'sometimes',
                'integer',
                'min:1',
                'max:100'
            ],
            'max_knowledge_articles' => [
                'sometimes',
                'integer',
                'min:0',
                'max:10000'
            ],
            'max_monthly_messages' => [
                'sometimes',
                'integer',
                'min:0',
                'max:1000000'
            ],
            'max_monthly_ai_requests' => [
                'sometimes',
                'integer',
                'min:0',
                'max:1000000'
            ],
            'max_storage_gb' => [
                'sometimes',
                'integer',
                'min:1',
                'max:10000'
            ],
            'max_api_calls_per_day' => [
                'sometimes',
                'integer',
                'min:0',
                'max:1000000'
            ],
            'features' => [
                'nullable',
                'array'
            ],
            'features.*' => [
                'boolean'
            ],
            'trial_days' => [
                'nullable',
                'integer',
                'min:0',
                'max:365'
            ],
            'is_popular' => [
                'nullable',
                'boolean'
            ],
            'is_custom' => [
                'nullable',
                'boolean'
            ],
            'sort_order' => [
                'nullable',
                'integer',
                'min:1'
            ],
            'status' => [
                'nullable',
                'string',
                'in:active,inactive,draft'
            ]
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'name.unique' => 'Nama paket berlangganan sudah ada.',
            'tier.in' => 'Tier harus salah satu dari: basic, professional, enterprise, custom.',
            'currency.in' => 'Mata uang harus salah satu dari: USD, IDR, EUR, GBP.',
            'price_monthly.min' => 'Harga bulanan tidak boleh negatif.',
            'max_agents.min' => 'Jumlah maksimal agent minimal 1.',
            'max_channels.min' => 'Jumlah maksimal channel minimal 1.',
            'max_storage_gb.min' => 'Penyimpanan maksimal minimal 1 GB.',
            'trial_days.max' => 'Masa trial maksimal 365 hari.'
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'name' => 'nama paket',
            'display_name' => 'nama tampilan',
            'description' => 'deskripsi',
            'tier' => 'tier',
            'price_monthly' => 'harga bulanan',
            'price_quarterly' => 'harga triwulan',
            'price_yearly' => 'harga tahunan',
            'currency' => 'mata uang',
            'max_agents' => 'maksimal agent',
            'max_channels' => 'maksimal channel',
            'max_knowledge_articles' => 'maksimal artikel pengetahuan',
            'max_monthly_messages' => 'maksimal pesan bulanan',
            'max_monthly_ai_requests' => 'maksimal permintaan AI bulanan',
            'max_storage_gb' => 'maksimal penyimpanan (GB)',
            'max_api_calls_per_day' => 'maksimal panggilan API per hari',
            'features' => 'fitur',
            'trial_days' => 'masa trial',
            'is_popular' => 'populer',
            'is_custom' => 'kustom',
            'sort_order' => 'urutan',
            'status' => 'status'
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Set default values for boolean fields
        if ($this->has('is_popular')) {
            $this->merge(['is_popular' => $this->boolean('is_popular')]);
        }

        if ($this->has('is_custom')) {
            $this->merge(['is_custom' => $this->boolean('is_custom')]);
        }

        // Set features if provided
        if ($this->has('features')) {
            $this->merge(['features' => $this->get('features', [])]);
        }
    }
}
