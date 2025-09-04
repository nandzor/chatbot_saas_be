<?php

namespace App\Http\Requests\SubscriptionPlan;

use App\Http\Requests\BaseRequest;
use Illuminate\Validation\Rule;

class CreateSubscriptionPlanRequest extends BaseRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->hasPermission('subscription_plans.create');
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'name' => [
                'required',
                'string',
                'max:100',
                'unique:subscription_plans,name'
            ],
            'display_name' => [
                'required',
                'string',
                'max:255'
            ],
            'description' => [
                'nullable',
                'string',
                'max:1000'
            ],
            'tier' => [
                'required',
                'string',
                'in:trial,starter,professional,enterprise,custom'
            ],
            'price_monthly' => [
                'required',
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
                'max:9999999.99'
            ],
            'currency' => [
                'required',
                'string',
                'size:3',
                'in:USD,IDR,EUR,GBP'
            ],
            'max_agents' => [
                'required',
                'integer',
                'min:1',
                'max:1000'
            ],
            'max_channels' => [
                'required',
                'integer',
                'min:1',
                'max:100'
            ],
            'max_knowledge_articles' => [
                'required',
                'integer',
                'min:0',
                'max:10000'
            ],
            'max_monthly_messages' => [
                'required',
                'integer',
                'min:0',
                'max:1000000'
            ],
            'max_monthly_ai_requests' => [
                'required',
                'integer',
                'min:0',
                'max:1000000'
            ],
            'max_storage_gb' => [
                'required',
                'integer',
                'min:1',
                'max:10000'
            ],
            'max_api_calls_per_day' => [
                'required',
                'integer',
                'min:0',
                'max:1000000'
            ],
            'features' => [
                'nullable',
                'array'
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
            'tier.in' => 'Tier harus salah satu dari: trial, starter, professional, enterprise, custom.',
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
        // Set default values
        $this->merge([
            'is_popular' => $this->boolean('is_popular', false),
            'is_custom' => $this->boolean('is_custom', false),
            'status' => $this->get('status', 'active'),
            'features' => $this->get('features', [])
        ]);
    }
}
