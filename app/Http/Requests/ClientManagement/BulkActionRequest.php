<?php

namespace App\Http\Requests\ClientManagement;

use Illuminate\Foundation\Http\FormRequest;

class BulkActionRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()?->hasRole('super_admin') ?? false;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'action' => 'required|string|in:activate,suspend,inactivate,delete',
            'organization_ids' => 'required|array|min:1|max:100',
            'organization_ids.*' => 'required|uuid|exists:organizations,id',
            'options' => 'sometimes|array',
            'options.batch_size' => 'sometimes|integer|min:1|max:100',
            'options.continue_on_error' => 'sometimes|boolean'
        ];
    }

    /**
     * Get custom validation messages.
     */
    public function messages(): array
    {
        return [
            'action.required' => 'Action tidak boleh kosong',
            'action.in' => 'Action harus salah satu dari: activate, suspend, inactivate, delete',
            'organization_ids.required' => 'Pilih minimal satu organisasi',
            'organization_ids.array' => 'Organization IDs harus berupa array',
            'organization_ids.min' => 'Pilih minimal satu organisasi',
            'organization_ids.max' => 'Maksimal 100 organisasi per batch',
            'organization_ids.*.required' => 'Organization ID tidak boleh kosong',
            'organization_ids.*.uuid' => 'Organization ID harus berupa UUID yang valid',
            'organization_ids.*.exists' => 'Organization tidak ditemukan',
            'options.batch_size.min' => 'Batch size minimal 1',
            'options.batch_size.max' => 'Batch size maksimal 100'
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'action' => 'Action',
            'organization_ids' => 'Daftar Organisasi',
            'organization_ids.*' => 'ID Organisasi',
            'options.batch_size' => 'Ukuran Batch',
            'options.continue_on_error' => 'Lanjutkan Jika Error'
        ];
    }
}
