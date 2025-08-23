<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProfileRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return \Illuminate\Support\Facades\Auth::check(); // User must be authenticated
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'first_name' => [
                'sometimes',
                'string',
                'max:100',
            ],
            'last_name' => [
                'sometimes',
                'string',
                'max:100',
            ],
            'phone' => [
                'sometimes',
                'nullable',
                'string',
                'max:20',
                'regex:/^[\+]?[1-9][\d]{0,15}$/',
            ],
            'timezone' => [
                'sometimes',
                'nullable',
                'string',
                'max:50',
                'timezone',
            ],
            'language' => [
                'sometimes',
                'nullable',
                'string',
                'max:10',
                'in:id,en',
            ],
            'bio' => [
                'sometimes',
                'nullable',
                'string',
                'max:1000',
            ],
            'location' => [
                'sometimes',
                'nullable',
                'string',
                'max:255',
            ],
            'department' => [
                'sometimes',
                'nullable',
                'string',
                'max:100',
            ],
            'job_title' => [
                'sometimes',
                'nullable',
                'string',
                'max:100',
            ],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'first_name.max' => 'Nama depan maksimal 100 karakter',
            'last_name.max' => 'Nama belakang maksimal 100 karakter',
            'phone.regex' => 'Format nomor telepon tidak valid',
            'timezone.timezone' => 'Timezone tidak valid',
            'language.in' => 'Bahasa tidak didukung',
            'bio.max' => 'Bio maksimal 1000 karakter',
            'location.max' => 'Lokasi maksimal 255 karakter',
            'department.max' => 'Departemen maksimal 100 karakter',
            'job_title.max' => 'Jabatan maksimal 100 karakter',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'first_name' => 'nama depan',
            'last_name' => 'nama belakang',
            'phone' => 'nomor telepon',
            'timezone' => 'timezone',
            'language' => 'bahasa',
            'bio' => 'bio',
            'location' => 'lokasi',
            'department' => 'departemen',
            'job_title' => 'jabatan',
        ];
    }
}
