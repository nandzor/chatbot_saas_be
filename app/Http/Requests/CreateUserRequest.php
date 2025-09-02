<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\Rule;

class CreateUserRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Add authorization logic here
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'full_name' => [
                'required',
                'string',
                'max:255',
                'min:2',
            ],
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                'unique:users,email',
            ],
            'username' => [
                'sometimes',
                'string',
                'max:50',
                'min:3',
                'unique:users,username',
                'regex:/^[a-zA-Z0-9_]+$/',
            ],
            'password_hash' => [
                'required',
                'string',
                'confirmed',
                Password::min(8)
                    ->letters()
                    ->mixedCase()
                    ->numbers()
                    ->symbols()
                    ->uncompromised(),
            ],
            'role' => [
                'required',
                'string',
                Rule::in(['super_admin', 'org_admin', 'agent', 'client']),
            ],
            'organization_id' => [
                'required',
                'string',
                'exists:organizations,id',
            ],
            'phone' => [
                'sometimes',
                'nullable',
                'string',
                'max:20',
                'regex:/^[\+]?[1-9][\d]{0,15}$/',
            ],
            'bio' => [
                'sometimes',
                'nullable',
                'string',
                'max:1000',
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
            'location' => [
                'sometimes',
                'nullable',
                'string',
                'max:255',
            ],
            'timezone' => [
                'sometimes',
                'nullable',
                'string',
                'max:50',
            ],
            'is_email_verified' => [
                'sometimes',
                'boolean',
            ],
            'is_phone_verified' => [
                'sometimes',
                'boolean',
            ],
            'two_factor_enabled' => [
                'sometimes',
                'boolean',
            ],
            'status' => [
                'sometimes',
                'string',
                Rule::in(['active', 'inactive', 'pending', 'suspended']),
            ],
            'avatar_url' => [
                'sometimes',
                'nullable',
                'url',
                'max:500',
            ],
            'permissions' => [
                'sometimes',
                'array',
            ],
            'permissions.*' => [
                'string',
                'max:100',
            ],
            'metadata' => [
                'sometimes',
                'array',
            ],
            'metadata.employee_id' => [
                'sometimes',
                'nullable',
                'string',
                'max:50',
            ],
            'metadata.hire_date' => [
                'sometimes',
                'nullable',
                'date',
            ],
            'metadata.manager' => [
                'sometimes',
                'nullable',
                'string',
                'max:255',
            ],
            'metadata.cost_center' => [
                'sometimes',
                'nullable',
                'string',
                'max:50',
            ],
        ];
    }

    /**
     * Get the error messages for the defined validation rules.
     */
    public function messages(): array
    {
        return [
            'full_name.required' => 'The full name field is required.',
            'full_name.min' => 'The full name must be at least 2 characters.',
            'email.required' => 'The email field is required.',
            'email.email' => 'Please enter a valid email address.',
            'email.unique' => 'This email address is already registered.',
            'username.unique' => 'This username is already taken.',
            'username.regex' => 'Username can only contain letters, numbers, and underscores.',
            'password_hash.required' => 'The password field is required.',
            'password_hash.confirmed' => 'The password confirmation does not match.',
            'role.required' => 'The role field is required.',
            'role.in' => 'The selected role is invalid.',
            'organization_id.required' => 'The organization field is required.',
            'organization_id.exists' => 'The selected organization is invalid.',
            'phone.regex' => 'Please enter a valid phone number.',
            'avatar_url.url' => 'The avatar URL must be a valid URL.',
            'permissions.array' => 'Permissions must be an array.',
            'metadata.array' => 'Metadata must be an array.',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'full_name' => 'full name',
            'email' => 'email address',
            'username' => 'username',
            'password_hash' => 'password',
            'role' => 'user role',
            'organization_id' => 'organization',
            'phone' => 'phone number',
            'bio' => 'biography',
            'job_title' => 'job title',
            'location' => 'location',
            'timezone' => 'timezone',
            'is_email_verified' => 'email verification status',
            'is_phone_verified' => 'phone verification status',
            'two_factor_enabled' => 'two-factor authentication',
            'status' => 'account status',
            'avatar_url' => 'avatar URL',
            'permissions' => 'permissions',
            'metadata' => 'metadata',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        if ($this->has('email')) {
            $this->merge([
                'email' => strtolower(trim($this->email)),
            ]);
        }

        if ($this->has('full_name')) {
            $this->merge([
                'full_name' => trim($this->full_name),
            ]);
        }

        if ($this->has('username')) {
            $this->merge([
                'username' => strtolower(trim($this->username)),
            ]);
        }

        // Generate username from email if not provided
        if (!$this->has('username') && $this->has('email')) {
            $email = $this->email;
            $username = strtolower(explode('@', $email)[0]);
            $this->merge(['username' => $username]);
        }
    }
}
