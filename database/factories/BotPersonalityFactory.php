<?php

namespace Database\Factories;

use App\Models\AiModel;
use App\Models\BotPersonality;
use App\Models\Organization;
use Illuminate\Database\Eloquent\Factories\Factory;

class BotPersonalityFactory extends Factory
{
    protected $model = BotPersonality::class;

    public function definition(): array
    {
        $languages = ['indonesia', 'english', 'javanese', 'sundanese', 'balinese', 'minang', 'chinese', 'japanese', 'korean', 'spanish', 'french', 'german', 'arabic', 'thai', 'vietnamese'];
        $tones = ['friendly', 'professional', 'casual', 'formal', 'enthusiastic', 'empathetic', 'technical', 'conversational'];
        $communicationStyles = ['direct', 'indirect', 'collaborative', 'authoritative', 'supportive', 'analytical'];
        $formalityLevels = ['formal', 'semi-formal', 'informal'];
        $statuses = ['active', 'inactive', 'suspended', 'pending', 'draft', 'published', 'archived'];

        $language = $this->faker->randomElement($languages);
        $tone = $this->faker->randomElement($tones);
        $communicationStyle = $this->faker->randomElement($communicationStyles);
        $formalityLevel = $this->faker->randomElement($formalityLevels);
        $status = $this->faker->randomElement($statuses);

        // Generate performance metrics
        $totalConversations = $this->faker->numberBetween(0, 1000);
        $avgSatisfactionScore = $this->faker->randomFloat(2, 1.0, 5.0);
        $successRate = $this->faker->randomFloat(2, 60.0, 98.0);

        return [
            'organization_id' => Organization::factory(),
            'name' => $this->faker->words(2, true) . ' Bot',
            'code' => strtolower($this->faker->unique()->words(2, true)) . '_' . uniqid(),
            'display_name' => $this->faker->words(3, true),
            'description' => $this->faker->sentence(10),
            'ai_model_id' => AiModel::factory(),
            'language' => $language,
            'tone' => $tone,
            'communication_style' => $communicationStyle,
            'formality_level' => $formalityLevel,
            'avatar_url' => $this->faker->optional(0.7)->imageUrl(200, 200, 'people'),
            'color_scheme' => [
                'primary' => $this->faker->hexColor(),
                'secondary' => $this->faker->hexColor(),
                'accent' => $this->faker->hexColor(),
            ],
            'greeting_message' => $this->generateGreetingMessage($language, $tone),
            'farewell_message' => $this->generateFarewellMessage($language, $tone),
            'error_message' => $this->generateErrorMessage($language, $tone),
            'waiting_message' => $this->generateWaitingMessage($language, $tone),
            'transfer_message' => $this->generateTransferMessage($language, $tone),
            'fallback_message' => $this->generateFallbackMessage($language, $tone),
            'system_message' => $this->generateSystemMessage($language, $tone, $communicationStyle),
            'personality_traits' => $this->generatePersonalityTraits($tone, $communicationStyle),
            'custom_vocabulary' => $this->generateCustomVocabulary($language),
            'response_templates' => $this->generateResponseTemplates($language, $tone),
            'conversation_starters' => $this->generateConversationStarters($language, $tone),
            'response_delay_ms' => $this->faker->numberBetween(500, 3000),
            'typing_indicator' => $this->faker->boolean(80),
            'max_response_length' => $this->faker->numberBetween(500, 2000),
            'enable_small_talk' => $this->faker->boolean(70),
            'confidence_threshold' => $this->faker->randomFloat(2, 0.5, 0.9),
            'learning_enabled' => $this->faker->boolean(85),
            'training_data_sources' => $this->faker->optional(0.6)->randomElements([
                'knowledge_base', 'chat_history', 'faq_documents', 'user_feedback', 'external_api'
            ], $this->faker->numberBetween(1, 3)),
            'last_trained_at' => $this->faker->optional(0.8)->dateTimeBetween('-30 days', 'now'),
            'total_conversations' => $totalConversations,
            'avg_satisfaction_score' => $avgSatisfactionScore,
            'success_rate' => $successRate,
            'is_default' => $this->faker->boolean(10),
            'status' => $status,
        ];
    }

    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'active',
            'is_default' => false,
        ]);
    }

    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'inactive',
            'is_default' => false,
        ]);
    }

    public function highPerformance(): static
    {
        return $this->state(fn (array $attributes) => [
            'total_conversations' => $this->faker->numberBetween(500, 1000),
            'avg_satisfaction_score' => $this->faker->randomFloat(2, 4.0, 5.0),
            'success_rate' => $this->faker->randomFloat(2, 85.0, 98.0),
            'status' => 'active',
        ]);
    }

    public function lowPerformance(): static
    {
        return $this->state(fn (array $attributes) => [
            'total_conversations' => $this->faker->numberBetween(10, 100),
            'avg_satisfaction_score' => $this->faker->randomFloat(2, 1.0, 3.0),
            'success_rate' => $this->faker->randomFloat(2, 40.0, 70.0),
            'status' => 'active',
        ]);
    }

    public function indonesian(): static
    {
        return $this->state(fn (array $attributes) => [
            'language' => 'indonesia',
            'greeting_message' => 'Halo! Saya di sini untuk membantu Anda. Ada yang bisa saya bantu?',
            'farewell_message' => 'Terima kasih! Semoga hari Anda menyenangkan. Sampai jumpa lagi!',
            'error_message' => 'Maaf, terjadi kesalahan. Silakan coba lagi atau hubungi tim support kami.',
        ]);
    }

    public function english(): static
    {
        return $this->state(fn (array $attributes) => [
            'language' => 'english',
            'greeting_message' => 'Hello! I\'m here to help you. How can I assist you today?',
            'farewell_message' => 'Thank you! Have a great day. See you again soon!',
            'error_message' => 'Sorry, something went wrong. Please try again or contact our support team.',
        ]);
    }

    public function professional(): static
    {
        return $this->state(fn (array $attributes) => [
            'tone' => 'professional',
            'communication_style' => 'direct',
            'formality_level' => 'formal',
            'personality_traits' => [
                'reliable', 'knowledgeable', 'efficient', 'respectful', 'thorough'
            ],
        ]);
    }

    public function friendly(): static
    {
        return $this->state(fn (array $attributes) => [
            'tone' => 'friendly',
            'communication_style' => 'collaborative',
            'formality_level' => 'semi-formal',
            'personality_traits' => [
                'warm', 'approachable', 'empathetic', 'encouraging', 'patient'
            ],
        ]);
    }

    private function generateGreetingMessage(string $language, string $tone): string
    {
        $greetings = [
            'indonesia' => [
                'friendly' => 'Halo! Senang bertemu dengan Anda. Ada yang bisa saya bantu hari ini?',
                'professional' => 'Selamat datang! Saya siap membantu Anda dengan pertanyaan atau kebutuhan Anda.',
                'casual' => 'Hai! Gimana kabarnya? Ada yang bisa saya bantuin?',
            ],
            'english' => [
                'friendly' => 'Hello there! Great to meet you. How can I help you today?',
                'professional' => 'Welcome! I\'m ready to assist you with any questions or needs you may have.',
                'casual' => 'Hey! What\'s up? What can I do for you?',
            ],
        ];

        return $greetings[$language][$tone] ?? $greetings['english']['friendly'];
    }

    private function generateFarewellMessage(string $language, string $tone): string
    {
        $farewells = [
            'indonesia' => [
                'friendly' => 'Terima kasih banyak! Senang bisa membantu. Sampai jumpa lagi!',
                'professional' => 'Terima kasih atas waktu Anda. Semoga informasi yang saya berikan bermanfaat.',
                'casual' => 'Makasih ya! Kapan-kapan butuh bantuan lagi, tinggal chat aja!',
            ],
            'english' => [
                'friendly' => 'Thank you so much! It was great helping you. See you again soon!',
                'professional' => 'Thank you for your time. I hope the information I provided was helpful.',
                'casual' => 'Thanks! Feel free to reach out anytime you need help!',
            ],
        ];

        return $farewells[$language][$tone] ?? $farewells['english']['friendly'];
    }

    private function generateErrorMessage(string $language, string $tone): string
    {
        $errors = [
            'indonesia' => [
                'friendly' => 'Ups, ada yang salah nih. Coba lagi ya, atau kalau masih error bisa hubungi tim support kami.',
                'professional' => 'Maaf, terjadi kesalahan teknis. Silakan coba lagi atau hubungi tim support untuk bantuan lebih lanjut.',
                'casual' => 'Wah error nih. Coba refresh atau hubungi admin ya.',
            ],
            'english' => [
                'friendly' => 'Oops, something went wrong there. Try again, or contact our support team if it keeps happening.',
                'professional' => 'I apologize for the technical error. Please try again or contact our support team for further assistance.',
                'casual' => 'Whoops, that\'s an error. Try refreshing or contact admin.',
            ],
        ];

        return $errors[$language][$tone] ?? $errors['english']['friendly'];
    }

    private function generateWaitingMessage(string $language, string $tone): string
    {
        $waiting = [
            'indonesia' => [
                'friendly' => 'Tunggu sebentar ya, saya cari informasi terbaik untuk Anda...',
                'professional' => 'Mohon tunggu, saya sedang memproses permintaan Anda...',
                'casual' => 'Sebentar ya, lagi cari jawabannya...',
            ],
            'english' => [
                'friendly' => 'Just a moment, let me find the best information for you...',
                'professional' => 'Please wait while I process your request...',
                'casual' => 'Hold on, looking that up for you...',
            ],
        ];

        return $waiting[$language][$tone] ?? $waiting['english']['friendly'];
    }

    private function generateTransferMessage(string $language, string $tone): string
    {
        $transfer = [
            'indonesia' => [
                'friendly' => 'Saya akan menghubungkan Anda dengan agen kami yang siap membantu.',
                'professional' => 'Saya akan mentransfer percakapan ini ke agen yang sesuai untuk menangani pertanyaan Anda.',
                'casual' => 'Oke, saya sambungin ke agen ya.',
            ],
            'english' => [
                'friendly' => 'I\'ll connect you with one of our agents who can help you.',
                'professional' => 'I\'ll transfer this conversation to an agent who can better assist with your inquiry.',
                'casual' => 'Alright, let me connect you to an agent.',
            ],
        ];

        return $transfer[$language][$tone] ?? $transfer['english']['friendly'];
    }

    private function generateFallbackMessage(string $language, string $tone): string
    {
        $fallback = [
            'indonesia' => [
                'friendly' => 'Hmm, saya tidak yakin tentang itu. Bisa tolong jelaskan lebih detail?',
                'professional' => 'Saya memerlukan informasi lebih spesifik untuk membantu Anda dengan pertanyaan tersebut.',
                'casual' => 'Wah, agak bingung nih. Bisa dijelasin lagi?',
            ],
            'english' => [
                'friendly' => 'Hmm, I\'m not sure about that. Could you give me more details?',
                'professional' => 'I need more specific information to help you with that question.',
                'casual' => 'Hmm, not sure about that one. Can you explain more?',
            ],
        ];

        return $fallback[$language][$tone] ?? $fallback['english']['friendly'];
    }

    private function generateSystemMessage(string $language, string $tone, string $communicationStyle): string
    {
        $baseMessages = [
            'indonesia' => "Anda adalah asisten AI yang {$tone} dan {$communicationStyle}. Gunakan bahasa Indonesia yang mudah dipahami.",
            'english' => "You are an AI assistant that is {$tone} and {$communicationStyle}. Use clear and simple English.",
        ];

        return $baseMessages[$language] ?? $baseMessages['english'];
    }

    private function generatePersonalityTraits(string $tone, string $communicationStyle): array
    {
        $traitMap = [
            'friendly' => ['warm', 'approachable', 'empathetic', 'encouraging', 'patient'],
            'professional' => ['reliable', 'knowledgeable', 'efficient', 'respectful', 'thorough'],
            'casual' => ['relaxed', 'conversational', 'easygoing', 'informal', 'fun'],
            'enthusiastic' => ['energetic', 'positive', 'motivating', 'upbeat', 'passionate'],
            'empathetic' => ['understanding', 'compassionate', 'supportive', 'caring', 'sensitive'],
            'technical' => ['precise', 'analytical', 'detailed', 'methodical', 'accurate'],
        ];

        return $traitMap[$tone] ?? $traitMap['friendly'];
    }

    private function generateCustomVocabulary(string $language): array
    {
        $vocabularies = [
            'indonesia' => [
                'terima kasih' => 'thanks',
                'sama-sama' => 'you\'re welcome',
                'tolong' => 'please',
                'maaf' => 'sorry',
                'permisi' => 'excuse me',
            ],
            'english' => [
                'thanks' => 'terima kasih',
                'welcome' => 'sama-sama',
                'please' => 'tolong',
                'sorry' => 'maaf',
                'excuse me' => 'permisi',
            ],
        ];

        return $vocabularies[$language] ?? $vocabularies['english'];
    }

    private function generateResponseTemplates(string $language, string $tone): array
    {
        $templates = [
            'indonesia' => [
                'greeting' => 'Halo! Selamat datang di layanan kami.',
                'question' => 'Bisa tolong jelaskan lebih detail tentang pertanyaan Anda?',
                'confirmation' => 'Baik, saya sudah memahami. Apakah ada yang ingin ditanyakan lagi?',
                'closing' => 'Terima kasih telah menghubungi kami. Semoga membantu!',
            ],
            'english' => [
                'greeting' => 'Hello! Welcome to our service.',
                'question' => 'Could you please provide more details about your question?',
                'confirmation' => 'Great, I understand. Is there anything else you\'d like to know?',
                'closing' => 'Thank you for contacting us. Hope this helps!',
            ],
        ];

        return $templates[$language] ?? $templates['english'];
    }

    private function generateConversationStarters(string $language, string $tone): array
    {
        $starters = [
            'indonesia' => [
                'friendly' => [
                    'Hai! Ada yang bisa saya bantu hari ini?',
                    'Halo! Gimana kabarnya? Ada yang ingin ditanyakan?',
                    'Hai! Saya di sini untuk membantu Anda.',
                ],
                'professional' => [
                    'Selamat datang! Bagaimana saya bisa membantu Anda?',
                    'Halo! Ada pertanyaan atau kebutuhan yang bisa saya bantu?',
                    'Selamat datang di layanan kami. Ada yang bisa saya bantu?',
                ],
            ],
            'english' => [
                'friendly' => [
                    'Hi there! What can I help you with today?',
                    'Hello! How are you doing? Any questions I can answer?',
                    'Hey! I\'m here to help you out.',
                ],
                'professional' => [
                    'Welcome! How may I assist you?',
                    'Hello! Do you have any questions or needs I can help with?',
                    'Welcome to our service. How can I help you today?',
                ],
            ],
        ];

        return $starters[$language][$tone] ?? $starters['english']['friendly'];
    }
}
