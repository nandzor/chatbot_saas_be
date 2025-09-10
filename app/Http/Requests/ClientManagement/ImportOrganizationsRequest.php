<?php

namespace App\Http\Requests\ClientManagement;

use Illuminate\Foundation\Http\FormRequest;

class ImportOrganizationsRequest extends FormRequest
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
            'file' => 'required|file|mimes:csv,xlsx,xls|max:10240', // 10MB max
            'mapping' => 'required|array',
            'mapping.name' => 'required|string',
            'mapping.email' => 'required|string',
            'mapping.org_code' => 'sometimes|string',
            'mapping.display_name' => 'sometimes|string',
            'mapping.phone' => 'sometimes|string',
            'mapping.address' => 'sometimes|string',
            'mapping.website' => 'sometimes|string',
            'mapping.business_type' => 'sometimes|string',
            'mapping.industry' => 'sometimes|string',
            'mapping.company_size' => 'sometimes|string',
            'mapping.timezone' => 'sometimes|string',
            'mapping.locale' => 'sometimes|string',
            'mapping.currency' => 'sometimes|string',
            'options' => 'sometimes|array',
            'options.batch_size' => 'sometimes|integer|min:1|max:1000',
            'options.skip_duplicates' => 'sometimes|boolean',
            'options.update_existing' => 'sometimes|boolean'
        ];
    }

    /**
     * Get custom validation messages.
     */
    public function messages(): array
    {
        return [
            'file.required' => 'File tidak boleh kosong',
            'file.file' => 'File harus berupa file yang valid',
            'file.mimes' => 'File harus berupa CSV, XLSX, atau XLS',
            'file.max' => 'Ukuran file maksimal 10MB',
            'mapping.required' => 'Mapping field tidak boleh kosong',
            'mapping.array' => 'Mapping harus berupa array',
            'mapping.name.required' => 'Mapping untuk field name wajib diisi',
            'mapping.email.required' => 'Mapping untuk field email wajib diisi',
            'options.batch_size.min' => 'Batch size minimal 1',
            'options.batch_size.max' => 'Batch size maksimal 1000'
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'file' => 'File',
            'mapping' => 'Mapping Field',
            'mapping.name' => 'Mapping Name',
            'mapping.email' => 'Mapping Email',
            'options.batch_size' => 'Ukuran Batch',
            'options.skip_duplicates' => 'Skip Duplikat',
            'options.update_existing' => 'Update Existing'
        ];
    }
}
