<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class TrainChatbotRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->hasPermission('bots.train');
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'training_data' => 'required|array|min:1',
            'training_data.*.input' => 'required|string|max:2000',
            'training_data.*.output' => 'required|string|max:2000',
            'training_data.*.context' => 'nullable|string|max:1000',
            'training_data.*.category' => 'nullable|string|max:100',
            'training_data.*.confidence' => 'nullable|numeric|min:0|max:1',

            'source' => 'nullable|string|max:100',
            'overwrite_existing' => 'nullable|boolean',
            'validate_data' => 'nullable|boolean'
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'training_data.required' => 'Training data is required.',
            'training_data.min' => 'At least one training item is required.',
            'training_data.*.input.required' => 'Input text is required for each training item.',
            'training_data.*.input.max' => 'Input text cannot exceed 2000 characters.',
            'training_data.*.output.required' => 'Output text is required for each training item.',
            'training_data.*.output.max' => 'Output text cannot exceed 2000 characters.',
            'training_data.*.context.max' => 'Context cannot exceed 1000 characters.',
            'training_data.*.category.max' => 'Category cannot exceed 100 characters.',
            'training_data.*.confidence.min' => 'Confidence must be between 0 and 1.',
            'training_data.*.confidence.max' => 'Confidence must be between 0 and 1.',
            'source.max' => 'Source cannot exceed 100 characters.'
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'training_data' => 'training data',
            'training_data.*.input' => 'input text',
            'training_data.*.output' => 'output text',
            'training_data.*.context' => 'context',
            'training_data.*.category' => 'category',
            'training_data.*.confidence' => 'confidence score'
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Set default values
        $this->merge([
            'source' => $this->source ?? 'manual_training',
            'overwrite_existing' => $this->overwrite_existing ?? false,
            'validate_data' => $this->validate_data ?? true
        ]);

        // Set default confidence for training items if not provided
        if ($this->has('training_data')) {
            $trainingData = $this->training_data;
            foreach ($trainingData as $index => $item) {
                if (!isset($item['confidence'])) {
                    $trainingData[$index]['confidence'] = 1.0;
                }
                if (!isset($item['category'])) {
                    $trainingData[$index]['category'] = 'general';
                }
            }
            $this->merge(['training_data' => $trainingData]);
        }
    }
}
