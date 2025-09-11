<?php

namespace App\Http\Requests\ClientManagement;

use Illuminate\Foundation\Http\FormRequest;

class ExportOrganizationsRequest extends FormRequest
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
            'format' => 'sometimes|string|in:csv,excel',
            'generate_file' => 'sometimes|boolean',
            'search' => 'sometimes|string|max:255',
            'status' => 'sometimes|string|in:active,trial,suspended,inactive,deleted',
            'business_type' => 'sometimes|string|max:100',
            'industry' => 'sometimes|string|max:100',
            'company_size' => 'sometimes|string|max:50',
            'plan_id' => 'sometimes|uuid|exists:subscription_plans,id',
            'subscription_status' => 'sometimes|string|in:active,trial,expired,cancelled',
            'date_from' => 'sometimes|date',
            'date_to' => 'sometimes|date|after_or_equal:date_from',
            'sort_by' => 'sometimes|string|in:name,email,created_at,updated_at,status',
            'sort_order' => 'sometimes|string|in:asc,desc'
        ];
    }

    /**
     * Get custom validation messages.
     */
    public function messages(): array
    {
        return [
            'format.in' => 'Format harus berupa csv atau excel',
            'search.max' => 'Query pencarian maksimal 255 karakter',
            'status.in' => 'Status harus salah satu dari: active, trial, suspended, inactive, deleted',
            'business_type.max' => 'Business type maksimal 100 karakter',
            'industry.max' => 'Industry maksimal 100 karakter',
            'company_size.max' => 'Company size maksimal 50 karakter',
            'plan_id.uuid' => 'Plan ID harus berupa UUID yang valid',
            'plan_id.exists' => 'Subscription plan tidak ditemukan',
            'subscription_status.in' => 'Subscription status harus salah satu dari: active, trial, expired, cancelled',
            'date_from.date' => 'Tanggal mulai harus berupa tanggal yang valid',
            'date_to.date' => 'Tanggal akhir harus berupa tanggal yang valid',
            'date_to.after_or_equal' => 'Tanggal akhir harus sama atau setelah tanggal mulai',
            'sort_by.in' => 'Sort by harus salah satu dari: name, email, created_at, updated_at, status',
            'sort_order.in' => 'Sort order harus asc atau desc'
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'format' => 'Format Export',
            'generate_file' => 'Generate File',
            'search' => 'Pencarian',
            'status' => 'Status',
            'business_type' => 'Tipe Bisnis',
            'industry' => 'Industri',
            'company_size' => 'Ukuran Perusahaan',
            'plan_id' => 'ID Plan',
            'subscription_status' => 'Status Subscription',
            'date_from' => 'Tanggal Mulai',
            'date_to' => 'Tanggal Akhir',
            'sort_by' => 'Urutkan Berdasarkan',
            'sort_order' => 'Urutan'
        ];
    }
}
