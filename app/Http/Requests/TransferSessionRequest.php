<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class TransferSessionRequest extends FormRequest
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
            'agent_id' => 'required|uuid|exists:agents,id',
            'reason' => 'nullable|string|max:500',
            'notes' => 'nullable|string|max:1000',
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
            'agent_id.required' => 'Agent ID is required.',
            'agent_id.uuid' => 'Agent ID must be a valid UUID.',
            'agent_id.exists' => 'Agent not found.',
            'reason.max' => 'Reason must not exceed 500 characters.',
            'notes.max' => 'Notes must not exceed 1000 characters.',
        ];
    }
}
