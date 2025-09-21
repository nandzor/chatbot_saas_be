<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class RegisterOrganizationRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Organization registration is open to everyone
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            // Organization Information
            'organization_name' => [
                'required',
                'string',
                'max:255',
                'min:2',
                'regex:/^[a-zA-Z0-9\s\-\.\&\(\)]+$/',
            ],
            'organization_email' => [
                'required',
                'email:rfc,dns',
                'max:255',
                'unique:organizations,email',
                'different:admin_email',
            ],
            'organization_phone' => [
                'sometimes',
                'nullable',
                'string',
                'max:20',
                'regex:/^[\+]?[1-9][\d]{0,15}$/',
            ],
            'organization_address' => [
                'sometimes',
                'nullable',
                'string',
                'max:500',
            ],
            'organization_website' => [
                'sometimes',
                'nullable',
                'url',
                'max:255',
            ],
            'business_type' => [
                'sometimes',
                'nullable',
                'string',
                'max:100',
                Rule::in([
                    'startup', 'small_business', 'medium_business', 'enterprise',
                    'non_profit', 'government', 'education', 'healthcare',
                    'finance', 'technology', 'retail', 'manufacturing', 'other'
                ]),
            ],
            'industry' => [
                'sometimes',
                'nullable',
                'string',
                'max:100',
            ],
            'company_size' => [
                'sometimes',
                'nullable',
                'string',
                Rule::in(['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+']),
            ],
            'tax_id' => [
                'sometimes',
                'nullable',
                'string',
                'max:50',
                'regex:/^[A-Z0-9\-]+$/',
            ],
            'description' => [
                'sometimes',
                'nullable',
                'string',
                'max:1000',
            ],

            // Admin User Information
            'admin_first_name' => [
                'required',
                'string',
                'max:100',
                'min:2',
                'regex:/^[a-zA-Z\s\-\.]+$/',
            ],
            'admin_last_name' => [
                'required',
                'string',
                'max:100',
                'min:2',
                'regex:/^[a-zA-Z\s\-\.]+$/',
            ],
            'admin_email' => [
                'required',
                'email:rfc,dns',
                'max:255',
                'unique:users,email',
                'different:organization_email',
            ],
            'admin_username' => [
                'sometimes',
                'string',
                'max:100',
                'min:3',
                'unique:users,username',
                'regex:/^[a-zA-Z0-9._-]+$/',
                'not_in:admin,root,user,test,guest,administrator',
            ],
            'admin_password' => [
                'required',
                'string',
                'min:8',
                'max:128',
                'confirmed',
                'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/',
            ],
            'admin_phone' => [
                'sometimes',
                'nullable',
                'string',
                'max:20',
                'regex:/^[\+]?[1-9][\d]{0,15}$/',
            ],

            // Preferences
            'timezone' => [
                'sometimes',
                'nullable',
                'string',
                'max:50',
                'timezone',
            ],
            'locale' => [
                'sometimes',
                'nullable',
                'string',
                'max:10',
                Rule::in(['id', 'en']),
            ],
            'currency' => [
                'sometimes',
                'nullable',
                'string',
                'max:3',
                Rule::in(['IDR', 'USD', 'EUR', 'SGD', 'MYR', 'THB']),
            ],

            // Terms and Conditions
            'terms_accepted' => [
                'required',
                'boolean',
                'accepted',
            ],
            'privacy_policy_accepted' => [
                'required',
                'boolean',
                'accepted',
            ],
            'marketing_consent' => [
                'sometimes',
                'boolean',
            ],
        ];
    }

    /**
     * Get custom validation messages.
     */
    public function messages(): array
    {
        return [
            'organization_name.required' => 'Nama organisasi wajib diisi.',
            'organization_name.regex' => 'Nama organisasi hanya boleh mengandung huruf, angka, spasi, dan karakter khusus: - . & ( ).',
            'organization_email.required' => 'Email organisasi wajib diisi.',
            'organization_email.unique' => 'Email organisasi sudah terdaftar.',
            'organization_email.different' => 'Email organisasi harus berbeda dengan email admin.',
            'organization_phone.regex' => 'Format nomor telepon tidak valid.',
            'organization_website.url' => 'Format website tidak valid.',
            'business_type.in' => 'Tipe bisnis tidak valid.',
            'company_size.in' => 'Ukuran perusahaan tidak valid.',
            'tax_id.regex' => 'Format NPWP tidak valid.',
            'admin_first_name.required' => 'Nama depan admin wajib diisi.',
            'admin_first_name.regex' => 'Nama depan hanya boleh mengandung huruf, spasi, dan karakter khusus: - .',
            'admin_last_name.required' => 'Nama belakang admin wajib diisi.',
            'admin_last_name.regex' => 'Nama belakang hanya boleh mengandung huruf, spasi, dan karakter khusus: - .',
            'admin_email.required' => 'Email admin wajib diisi.',
            'admin_email.unique' => 'Email admin sudah terdaftar.',
            'admin_email.different' => 'Email admin harus berbeda dengan email organisasi.',
            'admin_username.unique' => 'Username sudah digunakan.',
            'admin_username.regex' => 'Username hanya boleh mengandung huruf, angka, dan karakter: . _ -',
            'admin_username.not_in' => 'Username tidak boleh menggunakan kata yang sudah dipesan.',
            'admin_password.required' => 'Password admin wajib diisi.',
            'admin_password.min' => 'Password minimal 8 karakter.',
            'admin_password.regex' => 'Password harus mengandung huruf besar, huruf kecil, angka, dan karakter khusus.',
            'admin_password.confirmed' => 'Konfirmasi password tidak cocok.',
            'admin_phone.regex' => 'Format nomor telepon admin tidak valid.',
            'timezone.timezone' => 'Timezone tidak valid.',
            'locale.in' => 'Bahasa tidak didukung.',
            'currency.in' => 'Mata uang tidak didukung.',
            'terms_accepted.required' => 'Anda harus menyetujui syarat dan ketentuan.',
            'terms_accepted.accepted' => 'Anda harus menyetujui syarat dan ketentuan.',
            'privacy_policy_accepted.required' => 'Anda harus menyetujui kebijakan privasi.',
            'privacy_policy_accepted.accepted' => 'Anda harus menyetujui kebijakan privasi.',
        ];
    }

    /**
     * Get custom attribute names for validation errors.
     */
    public function attributes(): array
    {
        return [
            'organization_name' => 'nama organisasi',
            'organization_email' => 'email organisasi',
            'organization_phone' => 'telepon organisasi',
            'organization_address' => 'alamat organisasi',
            'organization_website' => 'website organisasi',
            'business_type' => 'tipe bisnis',
            'industry' => 'industri',
            'company_size' => 'ukuran perusahaan',
            'tax_id' => 'NPWP',
            'description' => 'deskripsi',
            'admin_first_name' => 'nama depan admin',
            'admin_last_name' => 'nama belakang admin',
            'admin_email' => 'email admin',
            'admin_username' => 'username admin',
            'admin_password' => 'password admin',
            'admin_password_confirmation' => 'konfirmasi password admin',
            'admin_phone' => 'telepon admin',
            'timezone' => 'zona waktu',
            'locale' => 'bahasa',
            'currency' => 'mata uang',
            'terms_accepted' => 'syarat dan ketentuan',
            'privacy_policy_accepted' => 'kebijakan privasi',
            'marketing_consent' => 'persetujuan marketing',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Sanitize string inputs
        $this->merge([
            'organization_name' => trim($this->organization_name ?? ''),
            'organization_email' => strtolower(trim($this->organization_email ?? '')),
            'organization_phone' => $this->organization_phone ? trim($this->organization_phone) : null,
            'organization_address' => $this->organization_address ? trim($this->organization_address) : null,
            'organization_website' => $this->organization_website ? trim($this->organization_website) : null,
            'business_type' => $this->business_type ? trim($this->business_type) : null,
            'industry' => $this->industry ? trim($this->industry) : null,
            'tax_id' => $this->tax_id ? strtoupper(trim($this->tax_id)) : null,
            'description' => $this->description ? trim($this->description) : null,
            'admin_first_name' => trim($this->admin_first_name ?? ''),
            'admin_last_name' => trim($this->admin_last_name ?? ''),
            'admin_email' => strtolower(trim($this->admin_email ?? '')),
            'admin_username' => $this->admin_username ? trim($this->admin_username) : null,
            'admin_phone' => $this->admin_phone ? trim($this->admin_phone) : null,
            'timezone' => $this->timezone ?: 'Asia/Jakarta',
            'locale' => $this->locale ?: 'id',
            'currency' => $this->currency ?: 'IDR',
        ]);
    }
}
