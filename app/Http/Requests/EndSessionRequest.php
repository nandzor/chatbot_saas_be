<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class EndSessionRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'resolution_type' => 'nullable|string|in:resolved,escalated,abandoned,transferred',
            'resolution_notes' => 'nullable|string|max:1000',
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'resolution_type.in' => 'Resolution type must be one of: resolved, escalated, abandoned, transferred.',
            'resolution_notes.max' => 'Resolution notes must not exceed 1000 characters.',
        ];
    }
}
