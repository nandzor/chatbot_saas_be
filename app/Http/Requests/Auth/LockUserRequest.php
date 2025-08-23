<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class LockUserRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Only super admin and org admin can lock users
        $user = \Illuminate\Support\Facades\Auth::user();
        return $user && in_array($user->role, ['super_admin', 'org_admin']);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'reason' => [
                'sometimes',
                'nullable',
                'string',
                'max:500',
            ],
            'duration_minutes' => [
                'sometimes',
                'nullable',
                'integer',
                'min:1',
                'max:1440', // Max 24 hours
            ],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'reason.max' => 'Alasan maksimal 500 karakter',
            'duration_minutes.integer' => 'Durasi harus berupa angka',
            'duration_minutes.min' => 'Durasi minimal 1 menit',
            'duration_minutes.max' => 'Durasi maksimal 24 jam (1440 menit)',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'reason' => 'alasan',
            'duration_minutes' => 'durasi (menit)',
        ];
    }
}
