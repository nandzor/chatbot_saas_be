<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class RegisterRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Registration is open to everyone
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'email' => [
                'required',
                'email',
                'max:255',
                'unique:users,email',
            ],
            'username' => [
                'sometimes',
                'string',
                'max:100',
                'unique:users,username',
                'regex:/^[a-zA-Z0-9._-]+$/',
            ],
            'password' => [
                'required',
                'string',
                'min:8',
                'confirmed',
                'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/',
            ],
            'first_name' => [
                'required',
                'string',
                'max:100',
            ],
            'last_name' => [
                'required',
                'string',
                'max:100',
            ],
            'organization_code' => [
                'required',
                'string',
                'exists:organizations,org_code',
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
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'email.required' => 'Email wajib diisi',
            'email.email' => 'Format email tidak valid',
            'email.unique' => 'Email sudah terdaftar',
            'username.unique' => 'Username sudah digunakan',
            'username.regex' => 'Username hanya boleh berisi huruf, angka, titik, underscore, dan dash',
            'password.required' => 'Password wajib diisi',
            'password.min' => 'Password minimal 8 karakter',
            'password.confirmed' => 'Konfirmasi password tidak cocok',
            'password.regex' => 'Password harus mengandung huruf besar, huruf kecil, angka, dan karakter khusus',
            'first_name.required' => 'Nama depan wajib diisi',
            'last_name.required' => 'Nama belakang wajib diisi',
            'organization_code.required' => 'Kode organisasi wajib diisi',
            'organization_code.exists' => 'Kode organisasi tidak valid',
            'phone.regex' => 'Format nomor telepon tidak valid',
            'timezone.timezone' => 'Timezone tidak valid',
            'language.in' => 'Bahasa tidak didukung',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'email' => 'email',
            'username' => 'username',
            'password' => 'password',
            'first_name' => 'nama depan',
            'last_name' => 'nama belakang',
            'organization_code' => 'kode organisasi',
            'phone' => 'nomor telepon',
            'timezone' => 'timezone',
            'language' => 'bahasa',
        ];
    }
}
