<?php

namespace App\Http\Requests\Organization;

use App\Http\Requests\BaseRequest;
use Illuminate\Validation\Rule;

class CreateOrganizationRequest extends BaseRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->hasPermission('organizations.create');
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'org_code' => [
                'nullable',
                'string',
                'max:50',
                'unique:organizations,org_code'
            ],
            'name' => [
                'required',
                'string',
                'max:255'
            ],
            'display_name' => [
                'nullable',
                'string',
                'max:255'
            ],
            'email' => [
                'required',
                'email',
                'max:255',
                'unique:organizations,email'
            ],
            'phone' => [
                'nullable',
                'string',
                'max:20'
            ],
            'address' => [
                'nullable',
                'string',
                'max:500'
            ],
            'logo_url' => [
                'nullable',
                'url',
                'max:500'
            ],
            'favicon_url' => [
                'nullable',
                'url',
                'max:500'
            ],
            'website' => [
                'nullable',
                'url',
                'max:255'
            ],
            'tax_id' => [
                'nullable',
                'string',
                'max:50'
            ],
            'business_type' => [
                'nullable',
                'string',
                'in:startup,small_business,medium_business,large_enterprise,non_profit,government,educational,healthcare,financial,retail,manufacturing,technology,consulting,other'
            ],
            'industry' => [
                'nullable',
                'string',
                'in:technology,healthcare,finance,education,retail,manufacturing,consulting,non_profit,government,media,real_estate,transportation,energy,agriculture,other'
            ],
            'company_size' => [
                'nullable',
                'string',
                'in:1-10,11-50,51-200,201-500,501-1000,1001-5000,5001-10000,10000+'
            ],
            'timezone' => [
                'nullable',
                'string',
                'max:50'
            ],
            'locale' => [
                'nullable',
                'string',
                'size:2'
            ],
            'currency' => [
                'nullable',
                'string',
                'size:3',
                'in:IDR,USD,EUR,GBP,SGD,MYR,THB,JPY,KRW,CNY'
            ],
            'subscription_plan_id' => [
                'nullable',
                'string',
                'exists:subscription_plans,id'
            ],
            'subscription_status' => [
                'nullable',
                'string',
                'in:trial,active,inactive,suspended,cancelled'
            ],
            'trial_ends_at' => [
                'nullable',
                'date',
                'after:now'
            ],
            'subscription_starts_at' => [
                'nullable',
                'date'
            ],
            'subscription_ends_at' => [
                'nullable',
                'date',
                'after:subscription_starts_at'
            ],
            'billing_cycle' => [
                'nullable',
                'string',
                'in:monthly,quarterly,yearly'
            ],
            'current_usage' => [
                'nullable',
                'array'
            ],
            'theme_config' => [
                'nullable',
                'array'
            ],
            'branding_config' => [
                'nullable',
                'array'
            ],
            'feature_flags' => [
                'nullable',
                'array'
            ],
            'ui_preferences' => [
                'nullable',
                'array'
            ],
            'business_hours' => [
                'nullable',
                'array'
            ],
            'contact_info' => [
                'nullable',
                'array'
            ],
            'social_media' => [
                'nullable',
                'array'
            ],
            'security_settings' => [
                'nullable',
                'array'
            ],
            'api_enabled' => [
                'nullable',
                'boolean'
            ],
            'webhook_url' => [
                'nullable',
                'url',
                'max:500'
            ],
            'webhook_secret' => [
                'nullable',
                'string',
                'max:255'
            ],
            'settings' => [
                'nullable',
                'array'
            ],
            'metadata' => [
                'nullable',
                'array'
            ],
            'status' => [
                'nullable',
                'string',
                'in:active,inactive,suspended'
            ]
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'org_code.unique' => 'Kode organisasi sudah ada.',
            'email.unique' => 'Email organisasi sudah terdaftar.',
            'email.email' => 'Format email tidak valid.',
            'business_type.in' => 'Tipe bisnis harus salah satu dari: startup, small_business, medium_business, large_enterprise, non_profit, government, educational, healthcare, financial, retail, manufacturing, technology, consulting, other.',
            'industry.in' => 'Industri harus salah satu dari: technology, healthcare, finance, education, retail, manufacturing, consulting, non_profit, government, media, real_estate, transportation, energy, agriculture, other.',
            'company_size.in' => 'Ukuran perusahaan harus salah satu dari: 1-10, 11-50, 51-200, 201-500, 501-1000, 1001-5000, 5001-10000, 10000+.',
            'currency.in' => 'Mata uang harus salah satu dari: IDR, USD, EUR, GBP, SGD, MYR, THB, JPY, KRW, CNY.',
            'subscription_status.in' => 'Status berlangganan harus salah satu dari: trial, active, inactive, suspended, cancelled.',
            'billing_cycle.in' => 'Siklus penagihan harus salah satu dari: monthly, quarterly, yearly.',
            'status.in' => 'Status harus salah satu dari: active, inactive, suspended.',
            'trial_ends_at.after' => 'Masa trial harus berakhir setelah waktu sekarang.',
            'subscription_ends_at.after' => 'Berakhirnya berlangganan harus setelah mulai berlangganan.'
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'org_code' => 'kode organisasi',
            'name' => 'nama organisasi',
            'display_name' => 'nama tampilan',
            'email' => 'email',
            'phone' => 'telepon',
            'address' => 'alamat',
            'logo_url' => 'URL logo',
            'favicon_url' => 'URL favicon',
            'website' => 'website',
            'tax_id' => 'NPWP',
            'business_type' => 'tipe bisnis',
            'industry' => 'industri',
            'company_size' => 'ukuran perusahaan',
            'timezone' => 'zona waktu',
            'locale' => 'bahasa',
            'currency' => 'mata uang',
            'subscription_plan_id' => 'paket berlangganan',
            'subscription_status' => 'status berlangganan',
            'trial_ends_at' => 'berakhirnya trial',
            'subscription_starts_at' => 'mulai berlangganan',
            'subscription_ends_at' => 'berakhirnya berlangganan',
            'billing_cycle' => 'siklus penagihan',
            'current_usage' => 'penggunaan saat ini',
            'theme_config' => 'konfigurasi tema',
            'branding_config' => 'konfigurasi branding',
            'feature_flags' => 'flag fitur',
            'ui_preferences' => 'preferensi UI',
            'business_hours' => 'jam operasional',
            'contact_info' => 'informasi kontak',
            'social_media' => 'media sosial',
            'security_settings' => 'pengaturan keamanan',
            'api_enabled' => 'API diaktifkan',
            'webhook_url' => 'URL webhook',
            'webhook_secret' => 'secret webhook',
            'settings' => 'pengaturan',
            'metadata' => 'metadata',
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
            'status' => $this->get('status', 'active'),
            'subscription_status' => $this->get('subscription_status', 'trial'),
            'currency' => $this->get('currency', 'IDR'),
            'timezone' => $this->get('timezone', 'Asia/Jakarta'),
            'locale' => $this->get('locale', 'id'),
            'api_enabled' => $this->boolean('api_enabled', false),
            'current_usage' => $this->get('current_usage', []),
            'theme_config' => $this->get('theme_config', []),
            'branding_config' => $this->get('branding_config', []),
            'feature_flags' => $this->get('feature_flags', []),
            'ui_preferences' => $this->get('ui_preferences', []),
            'business_hours' => $this->get('business_hours', []),
            'contact_info' => $this->get('contact_info', []),
            'social_media' => $this->get('social_media', []),
            'security_settings' => $this->get('security_settings', []),
            'settings' => $this->get('settings', []),
            'metadata' => $this->get('metadata', [])
        ]);
    }
}
