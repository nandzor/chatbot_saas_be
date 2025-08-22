<?php

namespace Database\Factories;

use App\Models\Organization;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\AiModel>
 */
class AiModelFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $modelTypes = [
            'gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo', 'claude-3-sonnet', 
            'claude-3-opus', 'gemini-pro', 'custom'
        ];
        
        $modelType = $this->faker->randomElement($modelTypes);
        
        // Generate model configuration based on type
        $modelConfig = $this->generateModelConfig($modelType);
        
        // Generate system prompts based on model type
        $systemPrompts = $this->generateSystemPrompts($modelType);
        
        // Generate fallback responses
        $fallbackResponses = [
            'I apologize, but I am unable to process your request at the moment. Please try again later.',
            'I\'m experiencing some technical difficulties. Could you please rephrase your question?',
            'I don\'t have enough information to provide a complete answer. Could you provide more details?',
            'I\'m sorry, but I cannot assist with that request. Please contact a human agent for help.',
            'I\'m having trouble understanding your request. Could you please clarify?'
        ];
        
        // Generate performance metrics
        $totalRequests = $this->faker->numberBetween(100, 100000);
        $successRate = $this->faker->randomFloat(2, 85, 99.5);
        $avgResponseTime = $this->faker->numberBetween(500, 5000);
        $costPerRequest = $this->faker->randomFloat(6, 0.0001, 0.05);
        
        return [
            'organization_id' => Organization::factory(),
            'name' => $this->faker->unique()->words(3, true),
            'model_type' => $modelType,
            
            // Configuration
            'api_endpoint' => $modelConfig['api_endpoint'],
            'api_key_encrypted' => $modelConfig['api_key_encrypted'],
            'model_version' => $modelConfig['model_version'],
            
            // Parameters
            'temperature' => $this->faker->randomFloat(2, 0.1, 1.0),
            'max_tokens' => $this->faker->randomElement([150, 300, 500, 1000, 2000, 4000]),
            'top_p' => $this->faker->randomFloat(2, 0.8, 1.0),
            'frequency_penalty' => $this->faker->randomFloat(2, -0.5, 0.5),
            'presence_penalty' => $this->faker->randomFloat(2, -0.5, 0.5),
            
            // System Prompts
            'system_prompt' => $systemPrompts['system'],
            'context_prompt' => $systemPrompts['context'],
            'fallback_responses' => $this->faker->randomElements($fallbackResponses, $this->faker->numberBetween(3, 5)),
            
            // Usage & Performance
            'total_requests' => $totalRequests,
            'avg_response_time' => $avgResponseTime,
            'success_rate' => $successRate,
            'cost_per_request' => $costPerRequest,
            
            // System fields
            'is_default' => $this->faker->boolean(20),
            'status' => 'active',
        ];
    }
    
    /**
     * Generate model configuration based on type
     */
    private function generateModelConfig(string $modelType): array
    {
        $configs = [
            'gpt-3.5-turbo' => [
                'api_endpoint' => 'https://api.openai.com/v1/chat/completions',
                'api_key_encrypted' => 'encrypted_openai_key_' . $this->faker->sha1(),
                'model_version' => 'gpt-3.5-turbo-0125'
            ],
            'gpt-4' => [
                'api_endpoint' => 'https://api.openai.com/v1/chat/completions',
                'api_key_encrypted' => 'encrypted_openai_key_' . $this->faker->sha1(),
                'model_version' => 'gpt-4-0613'
            ],
            'gpt-4-turbo' => [
                'api_endpoint' => 'https://api.openai.com/v1/chat/completions',
                'api_key_encrypted' => 'encrypted_openai_key_' . $this->faker->sha1(),
                'model_version' => 'gpt-4-1106-preview'
            ],
            'claude-3-sonnet' => [
                'api_endpoint' => 'https://api.anthropic.com/v1/messages',
                'api_key_encrypted' => 'encrypted_anthropic_key_' . $this->faker->sha1(),
                'model_version' => 'claude-3-sonnet-20240229'
            ],
            'claude-3-opus' => [
                'api_endpoint' => 'https://api.anthropic.com/v1/messages',
                'api_key_encrypted' => 'encrypted_anthropic_key_' . $this->faker->sha1(),
                'model_version' => 'claude-3-opus-20240229'
            ],
            'gemini-pro' => [
                'api_endpoint' => 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
                'api_key_encrypted' => 'encrypted_google_key_' . $this->faker->sha1(),
                'model_version' => 'gemini-1.0-pro'
            ],
            'custom' => [
                'api_endpoint' => $this->faker->url(),
                'api_key_encrypted' => 'encrypted_custom_key_' . $this->faker->sha1(),
                'model_version' => 'v1.0.0'
            ]
        ];
        
        return $configs[$modelType] ?? $configs['gpt-3.5-turbo'];
    }
    
    /**
     * Generate system prompts based on model type
     */
    private function generateSystemPrompts(string $modelType): array
    {
        $baseSystemPrompt = "You are a helpful AI assistant for customer service. ";
        
        $modelSpecificPrompts = [
            'gpt-3.5-turbo' => [
                'system' => $baseSystemPrompt . "You are powered by OpenAI's GPT-3.5 Turbo model. Provide clear, helpful, and accurate responses to customer inquiries. Always maintain a professional and friendly tone.",
                'context' => "You have access to the organization's knowledge base and can provide information about products, services, policies, and procedures. If you don't have enough information, politely ask for clarification or suggest contacting a human agent."
            ],
            'gpt-4' => [
                'system' => $baseSystemPrompt . "You are powered by OpenAI's GPT-4 model, which provides advanced reasoning and analysis capabilities. Use your enhanced understanding to provide comprehensive and insightful responses to customer inquiries.",
                'context' => "You have access to the organization's knowledge base and can perform complex analysis, provide detailed explanations, and offer creative solutions to customer problems. Always maintain accuracy and professionalism."
            ],
            'gpt-4-turbo' => [
                'system' => $baseSystemPrompt . "You are powered by OpenAI's GPT-4 Turbo model, which offers the latest capabilities including knowledge cutoff and improved reasoning. Provide up-to-date and accurate information to customers.",
                'context' => "You have access to current information and can provide real-time assistance. Use your advanced capabilities to offer personalized solutions and maintain high customer satisfaction."
            ],
            'claude-3-sonnet' => [
                'system' => $baseSystemPrompt . "You are powered by Anthropic's Claude 3 Sonnet model. You excel at providing helpful, harmless, and honest responses. Focus on being genuinely useful while maintaining safety and ethical standards.",
                'context' => "You have access to the organization's knowledge base and can provide thoughtful, well-reasoned responses. Always prioritize customer needs while ensuring responses are safe and appropriate."
            ],
            'claude-3-opus' => [
                'system' => $baseSystemPrompt . "You are powered by Anthropic's Claude 3 Opus model, which offers the highest level of reasoning and analysis. Use your advanced capabilities to provide exceptional customer service and problem-solving.",
                'context' => "You have access to the organization's knowledge base and can handle complex inquiries with sophisticated analysis. Provide comprehensive solutions while maintaining the highest standards of helpfulness and safety."
            ],
            'gemini-pro' => [
                'system' => $baseSystemPrompt . "You are powered by Google's Gemini Pro model. You excel at understanding context and providing relevant, accurate information. Focus on being helpful and informative in all customer interactions.",
                'context' => "You have access to the organization's knowledge base and can provide detailed, contextually relevant responses. Use your understanding capabilities to offer personalized assistance."
            ],
            'custom' => [
                'system' => $baseSystemPrompt . "You are a custom AI model trained specifically for this organization. You have deep knowledge of the company's products, services, and policies. Provide accurate and brand-aligned responses.",
                'context' => "You have been trained on the organization's specific knowledge base and can provide highly relevant and accurate information. Always maintain the organization's voice and values in your responses."
            ]
        ];
        
        return $modelSpecificPrompts[$modelType] ?? $modelSpecificPrompts['gpt-3.5-turbo'];
    }
    
    /**
     * Indicate that the model is GPT-3.5 Turbo.
     */
    public function gpt35Turbo(): static
    {
        return $this->state(fn (array $attributes) => [
            'model_type' => 'gpt-3.5-turbo',
            'name' => 'GPT-3.5 Turbo Assistant',
            'api_endpoint' => 'https://api.openai.com/v1/chat/completions',
            'model_version' => 'gpt-3.5-turbo-0125',
            'temperature' => 0.7,
            'max_tokens' => 1000,
            'cost_per_request' => 0.000002,
        ]);
    }
    
    /**
     * Indicate that the model is GPT-4.
     */
    public function gpt4(): static
    {
        return $this->state(fn (array $attributes) => [
            'model_type' => 'gpt-4',
            'name' => 'GPT-4 Assistant',
            'api_endpoint' => 'https://api.openai.com/v1/chat/completions',
            'model_version' => 'gpt-4-0613',
            'temperature' => 0.7,
            'max_tokens' => 2000,
            'cost_per_request' => 0.00003,
        ]);
    }
    
    /**
     * Indicate that the model is GPT-4 Turbo.
     */
    public function gpt4Turbo(): static
    {
        return $this->state(fn (array $attributes) => [
            'model_type' => 'gpt-4-turbo',
            'name' => 'GPT-4 Turbo Assistant',
            'api_endpoint' => 'https://api.openai.com/v1/chat/completions',
            'model_version' => 'gpt-4-1106-preview',
            'temperature' => 0.7,
            'max_tokens' => 4000,
            'cost_per_request' => 0.00001,
        ]);
    }
    
    /**
     * Indicate that the model is Claude 3 Sonnet.
     */
    public function claude3Sonnet(): static
    {
        return $this->state(fn (array $attributes) => [
            'model_type' => 'claude-3-sonnet',
            'name' => 'Claude 3 Sonnet Assistant',
            'api_endpoint' => 'https://api.anthropic.com/v1/messages',
            'model_version' => 'claude-3-sonnet-20240229',
            'temperature' => 0.7,
            'max_tokens' => 1000,
            'cost_per_request' => 0.000015,
        ]);
    }
    
    /**
     * Indicate that the model is Claude 3 Opus.
     */
    public function claude3Opus(): static
    {
        return $this->state(fn (array $attributes) => [
            'model_type' => 'claude-3-opus',
            'name' => 'Claude 3 Opus Assistant',
            'api_endpoint' => 'https://api.anthropic.com/v1/messages',
            'model_version' => 'claude-3-opus-20240229',
            'temperature' => 0.7,
            'max_tokens' => 2000,
            'cost_per_request' => 0.000075,
        ]);
    }
    
    /**
     * Indicate that the model is Gemini Pro.
     */
    public function geminiPro(): static
    {
        return $this->state(fn (array $attributes) => [
            'model_type' => 'gemini-pro',
            'name' => 'Gemini Pro Assistant',
            'api_endpoint' => 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
            'model_version' => 'gemini-1.0-pro',
            'temperature' => 0.7,
            'max_tokens' => 1000,
            'cost_per_request' => 0.0000005,
        ]);
    }
    
    /**
     * Indicate that the model is custom.
     */
    public function custom(): static
    {
        return $this->state(fn (array $attributes) => [
            'model_type' => 'custom',
            'name' => 'Custom AI Assistant',
            'api_endpoint' => $this->faker->url(),
            'model_version' => 'v1.0.0',
            'temperature' => 0.7,
            'max_tokens' => 1000,
            'cost_per_request' => 0.00001,
        ]);
    }
    
    /**
     * Indicate that the model is the default model.
     */
    public function default(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_default' => true,
            'name' => 'Default AI Assistant',
        ]);
    }
    
    /**
     * Indicate that the model is optimized for low temperature (more focused).
     */
    public function lowTemperature(): static
    {
        return $this->state(fn (array $attributes) => [
            'temperature' => $this->faker->randomFloat(2, 0.1, 0.3),
            'name' => $attributes['name'] . ' (Focused)',
        ]);
    }
    
    /**
     * Indicate that the model is optimized for high temperature (more creative).
     */
    public function highTemperature(): static
    {
        return $this->state(fn (array $attributes) => [
            'temperature' => $this->faker->randomFloat(2, 0.8, 1.0),
            'name' => $attributes['name'] . ' (Creative)',
        ]);
    }
    
    /**
     * Indicate that the model is optimized for long responses.
     */
    public function longResponse(): static
    {
        return $this->state(fn (array $attributes) => [
            'max_tokens' => $this->faker->randomElement([2000, 4000, 8000]),
            'name' => $attributes['name'] . ' (Long Response)',
        ]);
    }
    
    /**
     * Indicate that the model is optimized for short responses.
     */
    public function shortResponse(): static
    {
        return $this->state(fn (array $attributes) => [
            'max_tokens' => $this->faker->randomElement([150, 300, 500]),
            'name' => $attributes['name'] . ' (Short Response)',
        ]);
    }
    
    /**
     * Indicate that the model is high performance.
     */
    public function highPerformance(): static
    {
        return $this->state(fn (array $attributes) => [
            'avg_response_time' => $this->faker->numberBetween(100, 500),
            'success_rate' => $this->faker->randomFloat(2, 95, 99.5),
            'name' => $attributes['name'] . ' (High Performance)',
        ]);
    }
    
    /**
     * Indicate that the model is cost optimized.
     */
    public function costOptimized(): static
    {
        return $this->state(fn (array $attributes) => [
            'cost_per_request' => $this->faker->randomFloat(6, 0.000001, 0.00001),
            'name' => $attributes['name'] . ' (Cost Optimized)',
        ]);
    }
    
    /**
     * Indicate that the model is inactive.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'inactive',
        ]);
    }
    
    /**
     * Indicate that the model is suspended.
     */
    public function suspended(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'suspended',
        ]);
    }
}
