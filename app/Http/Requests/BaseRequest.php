<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;

abstract class BaseRequest extends FormRequest
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
     */
    abstract public function rules(): array;

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'required' => 'The :attribute field is required.',
            'string' => 'The :attribute must be a string.',
            'email' => 'The :attribute must be a valid email address.',
            'unique' => 'The :attribute has already been taken.',
            'exists' => 'The selected :attribute is invalid.',
            'min' => [
                'string' => 'The :attribute must be at least :min characters.',
                'numeric' => 'The :attribute must be at least :min.',
                'array' => 'The :attribute must have at least :min items.',
            ],
            'max' => [
                'string' => 'The :attribute may not be greater than :max characters.',
                'numeric' => 'The :attribute may not be greater than :max.',
                'array' => 'The :attribute may not have more than :max items.',
            ],
            'between' => [
                'string' => 'The :attribute must be between :min and :max characters.',
                'numeric' => 'The :attribute must be between :min and :max.',
                'array' => 'The :attribute must have between :min and :max items.',
            ],
            'in' => 'The selected :attribute is invalid.',
            'not_in' => 'The selected :attribute is invalid.',
            'alpha' => 'The :attribute may only contain letters.',
            'alpha_num' => 'The :attribute may only contain letters and numbers.',
            'alpha_dash' => 'The :attribute may only contain letters, numbers, dashes and underscores.',
            'numeric' => 'The :attribute must be a number.',
            'integer' => 'The :attribute must be an integer.',
            'boolean' => 'The :attribute field must be true or false.',
            'date' => 'The :attribute is not a valid date.',
            'date_format' => 'The :attribute does not match the format :format.',
            'before' => 'The :attribute must be a date before :date.',
            'after' => 'The :attribute must be a date after :date.',
            'before_or_equal' => 'The :attribute must be a date before or equal to :date.',
            'after_or_equal' => 'The :attribute must be a date after or equal to :date.',
            'url' => 'The :attribute format is invalid.',
            'active_url' => 'The :attribute is not a valid URL.',
            'image' => 'The :attribute must be an image.',
            'mimes' => 'The :attribute must be a file of type: :values.',
            'mimetypes' => 'The :attribute must be a file of type: :values.',
            'file' => 'The :attribute must be a file.',
            'size' => 'The :attribute may not be larger than :size kilobytes.',
            'dimensions' => 'The :attribute has invalid image dimensions.',
            'distinct' => 'The :attribute field has a duplicate value.',
            'confirmed' => 'The :attribute confirmation does not match.',
            'different' => 'The :attribute and :other must be different.',
            'same' => 'The :attribute and :other must match.',
            'regex' => 'The :attribute format is invalid.',
            'uuid' => 'The :attribute must be a valid UUID.',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'name' => 'name',
            'email' => 'email address',
            'password' => 'password',
            'password_confirmation' => 'password confirmation',
            'phone' => 'phone number',
            'address' => 'address',
            'city' => 'city',
            'state' => 'state',
            'country' => 'country',
            'postal_code' => 'postal code',
            'description' => 'description',
            'content' => 'content',
            'title' => 'title',
            'slug' => 'slug',
            'status' => 'status',
            'type' => 'type',
            'category' => 'category',
            'tags' => 'tags',
            'image' => 'image',
            'file' => 'file',
            'url' => 'URL',
            'code' => 'code',
            'display_name' => 'display name',
            'permissions' => 'permissions',
            'roles' => 'roles',
            'organization_id' => 'organization',
            'user_id' => 'user',
            'role_id' => 'role',
            'permission_id' => 'permission',
        ];
    }

    /**
     * Handle a failed validation attempt.
     */
    protected function failedValidation(Validator $validator): void
    {
        $errors = $validator->errors();

        $response = [
            'success' => false,
            'message' => 'Validation failed',
            'errors' => $errors->toArray(),
            'timestamp' => now()->toISOString(),
        ];

        throw new HttpResponseException(
            response()->json($response, JsonResponse::HTTP_UNPROCESSABLE_ENTITY)
        );
    }

    /**
     * Handle a failed authorization attempt.
     */
    protected function failedAuthorization(): void
    {
        $response = [
            'success' => false,
            'message' => 'Access denied',
            'detail' => 'You are not authorized to perform this action.',
            'timestamp' => now()->toISOString(),
        ];

        throw new HttpResponseException(
            response()->json($response, JsonResponse::HTTP_FORBIDDEN)
        );
    }

    /**
     * Get validation rules for specific scenarios
     */
    protected function getRulesForScenario(string $scenario): array
    {
        $method = 'rulesFor' . ucfirst($scenario);

        if (method_exists($this, $method)) {
            return $this->$method();
        }

        return $this->rules();
    }

    /**
     * Get common validation rules
     */
    protected function getCommonRules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'is_active' => 'boolean',
            'sort_order' => 'nullable|integer|min:0|max:999999',
        ];
    }

    /**
     * Get UUID validation rules
     */
    protected function getUuidRules(): array
    {
        return [
            'id' => 'required|uuid',
            'organization_id' => 'required|uuid|exists:organizations,id',
            'user_id' => 'required|uuid|exists:users,id',
            'role_id' => 'required|uuid|exists:roles,id',
            'permission_id' => 'required|uuid|exists:permissions,id',
        ];
    }

    /**
     * Get pagination validation rules
     */
    protected function getPaginationRules(): array
    {
        return [
            'page' => 'nullable|integer|min:1',
            'per_page' => 'nullable|integer|min:1|max:100',
            'sort_by' => 'nullable|string|in:created_at,updated_at,name,email,status',
            'sort_order' => 'nullable|string|in:asc,desc',
        ];
    }

    /**
     * Get search validation rules
     */
    protected function getSearchRules(): array
    {
        return [
            'search' => 'nullable|string|min:2|max:100',
            'category' => 'nullable|string|max:100',
            'status' => 'nullable|string|in:active,inactive,pending,suspended',
            'date_from' => 'nullable|date|before_or_equal:today',
            'date_to' => 'nullable|date|after_or_equal:date_from',
        ];
    }

    /**
     * Get filter validation rules
     */
    protected function getFilterRules(): array
    {
        return [
            'filters' => 'nullable|array',
            'filters.*' => 'nullable|string|max:255',
            'include' => 'nullable|string|max:500',
            'exclude' => 'nullable|string|max:500',
        ];
    }

    /**
     * Validate UUID format
     */
    protected function validateUuid(string $value): bool
    {
        return preg_match('/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i', $value);
    }

    /**
     * Validate email format
     */
    protected function validateEmail(string $value): bool
    {
        return filter_var($value, FILTER_VALIDATE_EMAIL) !== false;
    }

    /**
     * Validate phone format
     */
    protected function validatePhone(string $value): bool
    {
        // Basic phone validation - can be customized per region
        return preg_match('/^[\+]?[1-9][\d]{0,15}$/', $value);
    }

    /**
     * Validate URL format
     */
    protected function validateUrl(string $value): bool
    {
        return filter_var($value, FILTER_VALIDATE_URL) !== false;
    }

    /**
     * Validate date format
     */
    protected function validateDate(string $value, string $format = 'Y-m-d'): bool
    {
        $date = \DateTime::createFromFormat($format, $value);
        return $date && $date->format($format) === $value;
    }

    /**
     * Validate time format
     */
    protected function validateTime(string $value, string $format = 'H:i:s'): bool
    {
        $time = \DateTime::createFromFormat($format, $value);
        return $time && $time->format($format) === $value;
    }

    /**
     * Validate datetime format
     */
    protected function validateDateTime(string $value, string $format = 'Y-m-d H:i:s'): bool
    {
        $datetime = \DateTime::createFromFormat($format, $value);
        return $datetime && $datetime->format($format) === $value;
    }

    /**
     * Validate JSON format
     */
    protected function validateJson(string $value): bool
    {
        json_decode($value);
        return json_last_error() === JSON_ERROR_NONE;
    }

    /**
     * Validate base64 format
     */
    protected function validateBase64(string $value): bool
    {
        if (preg_match('%^[a-zA-Z0-9/+]*={0,2}$%', $value)) {
            return true;
        }
        return false;
    }

    /**
     * Validate hex color format
     */
    protected function validateHexColor(string $value): bool
    {
        return preg_match('/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/', $value);
    }

    /**
     * Validate IP address format
     */
    protected function validateIpAddress(string $value): bool
    {
        return filter_var($value, FILTER_VALIDATE_IP) !== false;
    }

    /**
     * Validate MAC address format
     */
    protected function validateMacAddress(string $value): bool
    {
        return filter_var($value, FILTER_VALIDATE_MAC) !== false;
    }

    /**
     * Validate credit card number format
     */
    protected function validateCreditCard(string $value): bool
    {
        // Remove spaces and dashes
        $value = preg_replace('/\D/', '', $value);

        // Check if it's a valid length
        if (strlen($value) < 13 || strlen($value) > 19) {
            return false;
        }

        // Luhn algorithm
        $sum = 0;
        $length = strlen($value);
        $parity = $length % 2;

        for ($i = 0; $i < $length; $i++) {
            $digit = $value[$i];
            if ($i % 2 == $parity) {
                $digit *= 2;
                if ($digit > 9) {
                    $digit -= 9;
                }
            }
            $sum += $digit;
        }

        return $sum % 10 == 0;
    }

    /**
     * Get sanitized data
     */
    public function getSanitizedData(): array
    {
        $data = $this->validated();

        // Remove null values
        $data = array_filter($data, function ($value) {
            return $value !== null;
        });

        // Trim string values
        $data = array_map(function ($value) {
            if (is_string($value)) {
                return trim($value);
            }
            return $value;
        }, $data);

        return $data;
    }

    /**
     * Check if request is for creation
     */
    public function isCreating(): bool
    {
        return $this->isMethod('POST');
    }

    /**
     * Check if request is for update
     */
    public function isUpdating(): bool
    {
        return $this->isMethod('PUT') || $this->isMethod('PATCH');
    }

    /**
     * Check if request is for deletion
     */
    public function isDeleting(): bool
    {
        return $this->isMethod('DELETE');
    }

    /**
     * Check if request is for viewing
     */
    public function isViewing(): bool
    {
        return $this->isMethod('GET');
    }

    /**
     * Get request context
     */
    public function getContext(): array
    {
        return [
            'method' => $this->method(),
            'url' => $this->url(),
            'user_id' => $this->user()?->id,
            'organization_id' => $this->user()?->organization_id,
            'ip_address' => $this->ip(),
            'user_agent' => $this->userAgent(),
            'timestamp' => now()->toISOString(),
        ];
    }
}
