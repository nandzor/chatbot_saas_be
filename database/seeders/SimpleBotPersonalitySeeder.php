<?php

namespace Database\Seeders;

use App\Models\AiModel;
use App\Models\BotPersonality;
use App\Models\Organization;
use Illuminate\Database\Seeder;

class SimpleBotPersonalitySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('🤖 Seeding Simple Bot Personalities...');

        // Get first organization
        $organization = Organization::first();

        if (!$organization) {
            $this->command->warn('No organizations found. Please run OrganizationSeeder first.');
            return;
        }

        // Get AI models for this organization
        $aiModels = AiModel::where('organization_id', $organization->id)->get();

        if ($aiModels->isEmpty()) {
            $this->command->warn("No AI models found for organization: {$organization->name}");
            return;
        }

        $this->createPersonalitiesForOrganization($organization, $aiModels);

        $this->command->info('✅ Simple Bot Personalities seeded successfully!');
    }

    private function createPersonalitiesForOrganization(Organization $organization, $aiModels): void
    {
        $this->command->info("   Creating personalities for organization: {$organization->name}");

        // Create 10 diverse personalities
        $personalities = [
            [
                'name' => 'Customer Support Bot',
                'code' => 'customer_support',
                'display_name' => 'Customer Support Assistant',
                'description' => 'Specialized bot for handling customer support inquiries',
                'language' => 'indonesia',
                'tone' => 'friendly',
                'communication_style' => 'supportive',
                'formality_level' => 'semi-formal',
                'status' => 'active',
                'is_default' => true,
                'total_conversations' => 1250,
                'avg_satisfaction_score' => 4.2,
                'success_rate' => 87.5,
            ],
            [
                'name' => 'Sales Assistant',
                'code' => 'sales_assistant',
                'display_name' => 'Sales Bot',
                'description' => 'Bot specialized in sales inquiries and product recommendations',
                'language' => 'english',
                'tone' => 'enthusiastic',
                'communication_style' => 'persuasive',
                'formality_level' => 'semi-formal',
                'status' => 'active',
                'is_default' => false,
                'total_conversations' => 890,
                'avg_satisfaction_score' => 3.8,
                'success_rate' => 82.3,
            ],
            [
                'name' => 'Technical Support Bot',
                'code' => 'tech_support',
                'display_name' => 'Technical Support Assistant',
                'description' => 'Bot specialized in technical support and troubleshooting',
                'language' => 'indonesia',
                'tone' => 'professional',
                'communication_style' => 'analytical',
                'formality_level' => 'formal',
                'status' => 'active',
                'is_default' => false,
                'total_conversations' => 2100,
                'avg_satisfaction_score' => 4.5,
                'success_rate' => 91.2,
            ],
            [
                'name' => 'General Information Bot',
                'code' => 'info_bot',
                'display_name' => 'Information Assistant',
                'description' => 'Bot for providing general information and answering FAQs',
                'language' => 'english',
                'tone' => 'friendly',
                'communication_style' => 'informative',
                'formality_level' => 'semi-formal',
                'status' => 'active',
                'is_default' => false,
                'total_conversations' => 3200,
                'avg_satisfaction_score' => 4.0,
                'success_rate' => 85.7,
            ],
            [
                'name' => 'Billing Support Bot',
                'code' => 'billing_support',
                'display_name' => 'Billing Assistant',
                'description' => 'Bot specialized in billing and payment inquiries',
                'language' => 'indonesia',
                'tone' => 'professional',
                'communication_style' => 'direct',
                'formality_level' => 'formal',
                'status' => 'active',
                'is_default' => false,
                'total_conversations' => 750,
                'avg_satisfaction_score' => 3.9,
                'success_rate' => 79.4,
            ],
            [
                'name' => 'Product Inquiry Bot',
                'code' => 'product_inquiry',
                'display_name' => 'Product Assistant',
                'description' => 'Bot for handling product-related questions and recommendations',
                'language' => 'english',
                'tone' => 'enthusiastic',
                'communication_style' => 'collaborative',
                'formality_level' => 'semi-formal',
                'status' => 'active',
                'is_default' => false,
                'total_conversations' => 1800,
                'avg_satisfaction_score' => 4.3,
                'success_rate' => 88.9,
            ],
            [
                'name' => 'Complaint Handler Bot',
                'code' => 'complaint_handler',
                'display_name' => 'Complaint Resolution Assistant',
                'description' => 'Bot specialized in handling customer complaints and issues',
                'language' => 'indonesia',
                'tone' => 'empathetic',
                'communication_style' => 'supportive',
                'formality_level' => 'semi-formal',
                'status' => 'active',
                'is_default' => false,
                'total_conversations' => 650,
                'avg_satisfaction_score' => 4.1,
                'success_rate' => 83.6,
            ],
            [
                'name' => 'Appointment Scheduler Bot',
                'code' => 'appointment_scheduler',
                'display_name' => 'Scheduling Assistant',
                'description' => 'Bot for scheduling appointments and managing bookings',
                'language' => 'english',
                'tone' => 'professional',
                'communication_style' => 'efficient',
                'formality_level' => 'formal',
                'status' => 'active',
                'is_default' => false,
                'total_conversations' => 420,
                'avg_satisfaction_score' => 4.4,
                'success_rate' => 92.1,
            ],
            [
                'name' => 'Low Performance Bot',
                'code' => 'low_performance',
                'display_name' => 'Test Bot',
                'description' => 'Low performance bot for testing purposes',
                'language' => 'indonesia',
                'tone' => 'casual',
                'communication_style' => 'informal',
                'formality_level' => 'informal',
                'status' => 'active',
                'is_default' => false,
                'total_conversations' => 45,
                'avg_satisfaction_score' => 2.1,
                'success_rate' => 45.2,
            ],
            [
                'name' => 'Inactive Bot',
                'code' => 'inactive_bot',
                'display_name' => 'Inactive Assistant',
                'description' => 'Inactive bot for testing purposes',
                'language' => 'english',
                'tone' => 'professional',
                'communication_style' => 'direct',
                'formality_level' => 'formal',
                'status' => 'inactive',
                'is_default' => false,
                'total_conversations' => 0,
                'avg_satisfaction_score' => 0,
                'success_rate' => 0,
            ],
        ];

        foreach ($personalities as $personalityData) {
            BotPersonality::create([
                'organization_id' => $organization->id,
                'ai_model_id' => $aiModels->random()->id,
                'name' => $personalityData['name'],
                'code' => $personalityData['code'],
                'display_name' => $personalityData['display_name'],
                'description' => $personalityData['description'],
                'language' => $personalityData['language'],
                'tone' => $personalityData['tone'],
                'communication_style' => $personalityData['communication_style'],
                'formality_level' => $personalityData['formality_level'],
                'status' => $personalityData['status'],
                'is_default' => $personalityData['is_default'],
                'total_conversations' => $personalityData['total_conversations'],
                'avg_satisfaction_score' => $personalityData['avg_satisfaction_score'],
                'success_rate' => $personalityData['success_rate'],
                'greeting_message' => $this->getGreetingMessage($personalityData['language'], $personalityData['tone']),
                'farewell_message' => $this->getFarewellMessage($personalityData['language'], $personalityData['tone']),
                'error_message' => $this->getErrorMessage($personalityData['language'], $personalityData['tone']),
                'waiting_message' => $this->getWaitingMessage($personalityData['language'], $personalityData['tone']),
                'transfer_message' => $this->getTransferMessage($personalityData['language'], $personalityData['tone']),
                'fallback_message' => $this->getFallbackMessage($personalityData['language'], $personalityData['tone']),
                'system_message' => $this->getSystemMessage($personalityData['language'], $personalityData['tone'], $personalityData['communication_style']),
                'personality_traits' => $this->getPersonalityTraits($personalityData['tone'], $personalityData['communication_style']),
                'custom_vocabulary' => $this->getCustomVocabulary($personalityData['language']),
                'response_templates' => $this->getResponseTemplates($personalityData['language'], $personalityData['tone']),
                'conversation_starters' => $this->getConversationStarters($personalityData['language'], $personalityData['tone']),
                'response_delay_ms' => rand(500, 2000),
                'typing_indicator' => true,
                'max_response_length' => rand(500, 1500),
                'enable_small_talk' => true,
                'confidence_threshold' => rand(60, 90) / 100,
                'learning_enabled' => true,
                'training_data_sources' => ['knowledge_base', 'chat_history', 'user_feedback'],
                'last_trained_at' => now()->subDays(rand(1, 30)),
                'color_scheme' => [
                    'primary' => $this->getRandomColor(),
                    'secondary' => $this->getRandomColor(),
                    'accent' => $this->getRandomColor(),
                ],
            ]);
        }

        $totalPersonalities = BotPersonality::where('organization_id', $organization->id)->count();
        $this->command->info("   ✓ Created {$totalPersonalities} personalities for {$organization->name}");
    }

    private function getGreetingMessage(string $language, string $tone): string
    {
        $greetings = [
            'indonesia' => [
                'friendly' => 'Halo! Senang bertemu dengan Anda. Ada yang bisa saya bantu hari ini?',
                'professional' => 'Selamat datang! Saya siap membantu Anda dengan pertanyaan atau kebutuhan Anda.',
                'casual' => 'Hai! Gimana kabarnya? Ada yang ingin ditanyakan?',
                'enthusiastic' => 'Halo! Senang sekali bisa membantu Anda! Ada yang bisa saya bantuin?',
                'empathetic' => 'Halo! Saya di sini untuk mendengarkan dan membantu Anda. Ceritakan apa yang Anda butuhkan.',
            ],
            'english' => [
                'friendly' => 'Hello there! Great to meet you. How can I help you today?',
                'professional' => 'Welcome! I\'m ready to assist you with any questions or needs you may have.',
                'casual' => 'Hey! What\'s up? What can I do for you?',
                'enthusiastic' => 'Hello! I\'m so excited to help you! What can I do for you today?',
                'empathetic' => 'Hello! I\'m here to listen and help. Please tell me what you need.',
            ],
        ];

        return $greetings[$language][$tone] ?? $greetings['english']['friendly'];
    }

    private function getFarewellMessage(string $language, string $tone): string
    {
        $farewells = [
            'indonesia' => [
                'friendly' => 'Terima kasih banyak! Senang bisa membantu. Sampai jumpa lagi!',
                'professional' => 'Terima kasih atas waktu Anda. Semoga informasi yang saya berikan bermanfaat.',
                'casual' => 'Makasih ya! Kapan-kapan butuh bantuan lagi, tinggal chat aja!',
                'enthusiastic' => 'Terima kasih! Senang sekali bisa membantu Anda! Sampai jumpa lagi!',
                'empathetic' => 'Terima kasih telah mempercayai saya. Semoga masalah Anda teratasi dengan baik.',
            ],
            'english' => [
                'friendly' => 'Thank you so much! It was great helping you. See you again soon!',
                'professional' => 'Thank you for your time. I hope the information I provided was helpful.',
                'casual' => 'Thanks! Feel free to reach out anytime you need help!',
                'enthusiastic' => 'Thank you! I was so happy to help you! See you again soon!',
                'empathetic' => 'Thank you for trusting me. I hope your issue gets resolved well.',
            ],
        ];

        return $farewells[$language][$tone] ?? $farewells['english']['friendly'];
    }

    private function getErrorMessage(string $language, string $tone): string
    {
        $errors = [
            'indonesia' => [
                'friendly' => 'Ups, ada yang salah nih. Coba lagi ya, atau kalau masih error bisa hubungi tim support kami.',
                'professional' => 'Maaf, terjadi kesalahan teknis. Silakan coba lagi atau hubungi tim support untuk bantuan lebih lanjut.',
                'casual' => 'Wah error nih. Coba refresh atau hubungi admin ya.',
                'enthusiastic' => 'Wah, ada masalah nih! Tapi jangan khawatir, coba lagi atau hubungi tim support kami!',
                'empathetic' => 'Maaf, ada kesalahan yang terjadi. Saya mengerti ini mungkin membuat frustrasi. Coba lagi atau hubungi tim support.',
            ],
            'english' => [
                'friendly' => 'Oops, something went wrong there. Try again, or contact our support team if it keeps happening.',
                'professional' => 'I apologize for the technical error. Please try again or contact our support team for further assistance.',
                'casual' => 'Whoops, that\'s an error. Try refreshing or contact admin.',
                'enthusiastic' => 'Oops! There\'s a problem, but don\'t worry! Try again or contact our support team!',
                'empathetic' => 'I\'m sorry, there was an error. I understand this might be frustrating. Please try again or contact support.',
            ],
        ];

        return $errors[$language][$tone] ?? $errors['english']['friendly'];
    }

    private function getWaitingMessage(string $language, string $tone): string
    {
        $waiting = [
            'indonesia' => [
                'friendly' => 'Tunggu sebentar ya, saya cari informasi terbaik untuk Anda...',
                'professional' => 'Mohon tunggu, saya sedang memproses permintaan Anda...',
                'casual' => 'Sebentar ya, lagi cari jawabannya...',
                'enthusiastic' => 'Tunggu sebentar! Saya lagi cari info terbaik untuk Anda!',
                'empathetic' => 'Mohon tunggu sebentar, saya sedang mencari solusi terbaik untuk Anda...',
            ],
            'english' => [
                'friendly' => 'Just a moment, let me find the best information for you...',
                'professional' => 'Please wait while I process your request...',
                'casual' => 'Hold on, looking that up for you...',
                'enthusiastic' => 'Just a moment! I\'m finding the best info for you!',
                'empathetic' => 'Please wait a moment, I\'m finding the best solution for you...',
            ],
        ];

        return $waiting[$language][$tone] ?? $waiting['english']['friendly'];
    }

    private function getTransferMessage(string $language, string $tone): string
    {
        $transfer = [
            'indonesia' => [
                'friendly' => 'Saya akan menghubungkan Anda dengan agen kami yang siap membantu.',
                'professional' => 'Saya akan mentransfer percakapan ini ke agen yang sesuai untuk menangani pertanyaan Anda.',
                'casual' => 'Oke, saya sambungin ke agen ya.',
                'enthusiastic' => 'Saya akan sambungkan Anda ke agen terbaik kami!',
                'empathetic' => 'Saya akan menghubungkan Anda dengan agen yang akan memberikan perhatian penuh.',
            ],
            'english' => [
                'friendly' => 'I\'ll connect you with one of our agents who can help you.',
                'professional' => 'I\'ll transfer this conversation to an agent who can better assist with your inquiry.',
                'casual' => 'Alright, let me connect you to an agent.',
                'enthusiastic' => 'I\'ll connect you to one of our best agents!',
                'empathetic' => 'I\'ll connect you with an agent who will give you their full attention.',
            ],
        ];

        return $transfer[$language][$tone] ?? $transfer['english']['friendly'];
    }

    private function getFallbackMessage(string $language, string $tone): string
    {
        $fallback = [
            'indonesia' => [
                'friendly' => 'Hmm, saya tidak yakin tentang itu. Bisa tolong jelaskan lebih detail?',
                'professional' => 'Saya memerlukan informasi lebih spesifik untuk membantu Anda dengan pertanyaan tersebut.',
                'casual' => 'Wah, agak bingung nih. Bisa dijelasin lagi?',
                'enthusiastic' => 'Hmm, saya perlu info lebih detail nih! Bisa jelasin lagi?',
                'empathetic' => 'Saya ingin membantu, tapi perlu informasi lebih detail. Bisa jelaskan lebih lanjut?',
            ],
            'english' => [
                'friendly' => 'Hmm, I\'m not sure about that. Could you give me more details?',
                'professional' => 'I need more specific information to help you with that question.',
                'casual' => 'Hmm, not sure about that one. Can you explain more?',
                'enthusiastic' => 'Hmm, I need more details! Can you explain more?',
                'empathetic' => 'I want to help, but I need more information. Could you explain further?',
            ],
        ];

        return $fallback[$language][$tone] ?? $fallback['english']['friendly'];
    }

    private function getSystemMessage(string $language, string $tone, string $communicationStyle): string
    {
        $baseMessages = [
            'indonesia' => "Anda adalah asisten AI yang {$tone} dan {$communicationStyle}. Gunakan bahasa Indonesia yang mudah dipahami.",
            'english' => "You are an AI assistant that is {$tone} and {$communicationStyle}. Use clear and simple English.",
        ];

        return $baseMessages[$language] ?? $baseMessages['english'];
    }

    private function getPersonalityTraits(string $tone, string $communicationStyle): array
    {
        $traitMap = [
            'friendly' => ['warm', 'approachable', 'empathetic', 'encouraging', 'patient'],
            'professional' => ['reliable', 'knowledgeable', 'efficient', 'respectful', 'thorough'],
            'casual' => ['relaxed', 'conversational', 'easygoing', 'informal', 'fun'],
            'enthusiastic' => ['energetic', 'positive', 'motivating', 'upbeat', 'passionate'],
            'empathetic' => ['understanding', 'compassionate', 'supportive', 'caring', 'sensitive'],
        ];

        return $traitMap[$tone] ?? $traitMap['friendly'];
    }

    private function getCustomVocabulary(string $language): array
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

    private function getResponseTemplates(string $language, string $tone): array
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

    private function getConversationStarters(string $language, string $tone): array
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

    private function getRandomColor(): string
    {
        $colors = [
            '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
            '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1',
            '#14B8A6', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'
        ];

        return $colors[array_rand($colors)];
    }
}
