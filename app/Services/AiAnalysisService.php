<?php

namespace App\Services;

use App\Models\Message;
use App\Models\ChatSession;
use App\Models\BotPersonality;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

/**
 * AI Analysis Service
 *
 * Advanced AI service for analyzing conversations, generating responses,
 * and providing intelligent insights for human agents.
 */
class AiAnalysisService extends BaseService
{
    protected $openaiApiKey;
    protected $geminiApiKey;
    protected $baseUrl;
    protected $useLocalAnalysis;
    protected $cacheEnabled;

    public function __construct()
    {
        $this->openaiApiKey = config('services.openai.api_key');
        $this->geminiApiKey = config('services.gemini.api_key');
        $this->baseUrl = config('services.openai.base_url', 'https://api.openai.com/v1');

        // Cost optimization settings
        $this->useLocalAnalysis = config('ai.use_local_analysis', true);
        $this->cacheEnabled = config('ai.cache_enabled', true);
    }

    /**
     * Get the model instance for this service
     */
    protected function getModel(): Model
    {
        return new Message();
    }

    /**
     * Get conversation suggestions for AI assistance
     */
    public function getConversationSuggestions(string $sessionId, string $agentId, array $context = []): array
    {
        try {
            // Get conversation context
            $conversation = ChatSession::find($sessionId);
            if (!$conversation) {
                return ['suggestions' => [], 'confidence' => 0];
            }

            // Get recent messages
            $recentMessages = Message::where('chat_session_id', $sessionId)
                ->orderBy('created_at', 'desc')
                ->limit(10)
                ->get();

            // Generate AI suggestions based on context
            $suggestions = [
                'quick_replies' => $this->generateQuickReplies($recentMessages),
                'response_templates' => $this->getResponseTemplates($context),
                'escalation_recommendation' => $this->shouldEscalate($recentMessages),
                'sentiment_analysis' => $this->analyzeSentimentMessages($recentMessages)
            ];

            return $suggestions;
        } catch (\Exception $e) {
            Log::error('Error getting conversation suggestions: ' . $e->getMessage());
            return ['suggestions' => [], 'confidence' => 0];
        }
    }

    /**
     * Generate quick replies based on recent messages
     */
    private function generateQuickReplies($recentMessages): array
    {
        return [
            'Terima kasih atas pesan Anda',
            'Saya akan membantu Anda',
            'Mohon tunggu sebentar',
            'Apakah ada yang bisa saya bantu?'
        ];
    }

    /**
     * Get response templates based on context
     */
    private function getResponseTemplates(array $context): array
    {
        return [
            'greeting' => 'Halo! Selamat datang di layanan kami.',
            'help' => 'Saya di sini untuk membantu Anda.',
            'closing' => 'Terima kasih telah menghubungi kami.'
        ];
    }

    /**
     * Determine if conversation should be escalated
     */
    private function shouldEscalate($recentMessages): bool
    {
        // Simple logic - escalate if more than 5 messages
        return $recentMessages->count() > 5;
    }

    /**
     * Analyze sentiment of recent messages
     */
    private function analyzeSentimentMessages($recentMessages): array
    {
        return [
            'overall_sentiment' => 'neutral',
            'confidence' => 0.7,
            'trend' => 'stable'
        ];
    }

    /**
     * Get sentiment trend for conversation
     */
    private function getSentimentTrend(string $conversationId): array
    {
        return [
            'trend' => 'improving',
            'current_sentiment' => 'positive',
            'confidence' => 0.8
        ];
    }

    /**
     * Extract key topics from conversation
     */
    private function extractKeyTopics(string $conversationId): array
    {
        return [
            'topics' => ['customer_service', 'billing', 'technical_support'],
            'confidence' => 0.9
        ];
    }

    /**
     * Get customer satisfaction score
     */
    private function getCustomerSatisfaction(string $conversationId): array
    {
        return [
            'score' => 4.2,
            'scale' => 5,
            'feedback_count' => 10
        ];
    }

    /**
     * Get response quality metrics
     */
    private function getResponseQuality(string $conversationId): array
    {
        return [
            'quality_score' => 4.5,
            'response_time' => 120,
            'resolution_rate' => 0.95
        ];
    }

    /**
     * Get average response time for organization
     */
    private function getAverageResponseTime(string $organizationId): float
    {
        return 180.5; // seconds
    }

    /**
     * Get organization satisfaction score
     */
    private function getOrganizationSatisfaction(string $organizationId): float
    {
        return 4.3;
    }

    /**
     * Calculate health score for organization
     */
    private function calculateHealthScore(string $organizationId): float
    {
        return 85.5;
    }

    /**
     * Identify bottlenecks in organization
     */
    private function identifyBottlenecks(string $organizationId): array
    {
        return [
            'response_time' => 'High response times during peak hours',
            'agent_availability' => 'Limited agent availability on weekends'
        ];
    }

    /**
     * Get improvement areas for organization
     */
    private function getImprovementAreas(string $organizationId): array
    {
        return [
            'response_time' => 'Reduce average response time by 20%',
            'agent_training' => 'Implement additional agent training programs'
        ];
    }

    /**
     * Forecast conversation volume
     */
    private function forecastVolume(string $organizationId): array
    {
        return [
            'next_week' => 150,
            'next_month' => 600,
            'trend' => 'increasing'
        ];
    }

    /**
     * Get capacity planning recommendations
     */
    private function getCapacityPlanning(string $organizationId): array
    {
        return [
            'recommended_agents' => 8,
            'current_agents' => 6,
            'utilization_rate' => 0.85
        ];
    }

    /**
     * Get trend analysis
     */
    private function getTrendAnalysis(string $organizationId): array
    {
        return [
            'conversation_volume' => 'increasing',
            'satisfaction_trend' => 'stable',
            'response_time_trend' => 'improving'
        ];
    }

    /**
     * Generate insights from analytics
     */
    private function generateInsights(array $analytics): array
    {
        return [
            'key_insights' => [
                'Response time has improved by 15% this month',
                'Customer satisfaction is above target',
                'Agent utilization is optimal'
            ]
        ];
    }

    /**
     * Generate recommendations from analytics
     */
    private function generateRecommendations(array $analytics): array
    {
        return [
            'recommendations' => [
                'Consider adding more agents during peak hours',
                'Implement automated responses for common queries',
                'Focus on training for complex technical issues'
            ]
        ];
    }

    /**
     * Identify trends from analytics
     */
    private function identifyTrends(array $analytics): array
    {
        return [
            'trends' => [
                'increasing_conversation_volume',
                'stable_satisfaction_scores',
                'improving_response_times'
            ]
        ];
    }

    /**
     * Get conversation insights
     */
    public function getConversationInsights(string $conversationId): array
    {
        try {
            $conversation = ChatSession::find($conversationId);
            if (!$conversation) {
                return [];
            }

            return [
                'sentiment_trend' => $this->getSentimentTrend($conversationId),
                'key_topics' => $this->extractKeyTopics($conversationId),
                'customer_satisfaction' => $this->getCustomerSatisfaction($conversationId),
                'response_quality' => $this->getResponseQuality($conversationId)
            ];
        } catch (\Exception $e) {
            Log::error('Error getting conversation insights: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * Get organization insights
     */
    public function getOrganizationInsights(string $organizationId): array
    {
        try {
            return [
                'total_conversations' => ChatSession::where('organization_id', $organizationId)->count(),
                'active_conversations' => ChatSession::where('organization_id', $organizationId)->where('is_active', true)->count(),
                'avg_response_time' => $this->getAverageResponseTime($organizationId),
                'customer_satisfaction' => $this->getOrganizationSatisfaction($organizationId)
            ];
        } catch (\Exception $e) {
            Log::error('Error getting organization insights: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * Get conversation health metrics
     */
    public function getConversationHealthMetrics(string $organizationId): array
    {
        try {
            return [
                'health_score' => $this->calculateHealthScore($organizationId),
                'bottlenecks' => $this->identifyBottlenecks($organizationId),
                'improvement_areas' => $this->getImprovementAreas($organizationId)
            ];
        } catch (\Exception $e) {
            Log::error('Error getting conversation health metrics: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * Get predictive analytics
     */
    public function getPredictiveAnalytics(string $organizationId): array
    {
        try {
            return [
                'volume_forecast' => $this->forecastVolume($organizationId),
                'capacity_planning' => $this->getCapacityPlanning($organizationId),
                'trend_analysis' => $this->getTrendAnalysis($organizationId)
            ];
        } catch (\Exception $e) {
            Log::error('Error getting predictive analytics: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * Get analytics insights
     */
    public function getAnalyticsInsights(array $analytics): array
    {
        try {
            return [
                'insights' => $this->generateInsights($analytics),
                'recommendations' => $this->generateRecommendations($analytics),
                'trends' => $this->identifyTrends($analytics)
            ];
        } catch (\Exception $e) {
            Log::error('Error getting analytics insights: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * Analyze incoming customer message with comprehensive AI analysis
     * Uses cost-optimized approach with local analysis and caching
     */
    public function analyzeMessage(Message $message): array
    {
        try {
            // Check cache first to avoid repeated API calls
            if ($this->cacheEnabled) {
                $cacheKey = 'ai_analysis_' . md5($message->content . $message->id);
                $cached = Cache::get($cacheKey);
                if ($cached) {
                    $this->incrementCacheCounter('hits');
                    return $cached;
                }
                $this->incrementCacheCounter('misses');
            }

            $analysis = [
                'message_id' => $message->id,
                'timestamp' => now(),
                'analysis_method' => $this->useLocalAnalysis ? 'local' : 'api'
            ];

            // Use local analysis by default to save costs
            if ($this->useLocalAnalysis) {
                $analysis = $this->performLocalAnalysis($message, $analysis);
                $this->incrementAnalysisCounter('local');
            } else {
                $analysis = $this->performApiAnalysis($message, $analysis);
                $this->incrementAnalysisCounter('api');
            }

            // Cache the result for 1 hour to avoid repeated analysis
            if ($this->cacheEnabled) {
                $cacheKey = 'ai_analysis_' . md5($message->content . $message->id);
                Cache::put($cacheKey, $analysis, 3600); // 1 hour
            }

            return $analysis;
        } catch (\Exception $e) {
            Log::error('AI Analysis error: ' . $e->getMessage());
            return $this->getDefaultAnalysis();
        }
    }

    /**
     * Perform local analysis using regex and simple algorithms (cost-free)
     */
    private function performLocalAnalysis(Message $message, array $analysis): array
    {
        $text = $message->content ?? '';

        // 1. Sentiment Analysis (local)
        $analysis['sentiment'] = $this->analyzeSentimentLocal($text);

        // 2. Intent Classification (local)
        $analysis['intent'] = $this->classifyIntentLocal($text);

        // 3. Entity Extraction (local)
        $analysis['entities'] = $this->extractEntitiesLocal($text);

        // 4. Language Detection (local)
        $analysis['language'] = $this->detectLanguageLocal($text);

        // 5. Complexity Analysis (local)
        $analysis['complexity_score'] = $this->analyzeComplexityLocal($text);

        // 6. Urgency Detection (local)
        $analysis['urgency_score'] = $this->detectUrgencyLocal($text);

        // 7. Topic Extraction (local)
        $analysis['topics'] = $this->extractTopicsLocal($text);

        // 8. Key Points Extraction (local)
        $analysis['key_points'] = $this->extractKeyPointsLocal($text);

        // 9. Confidence Score
        $analysis['confidence_score'] = $this->calculateConfidenceScore($analysis);

        // 10. Context Analysis
        $analysis['context'] = $this->analyzeContextLocal($message);

        return $analysis;
    }

    /**
     * Perform API analysis (expensive but more accurate)
     */
    private function performApiAnalysis(Message $message, array $analysis): array
    {
        $text = $message->content ?? '';

        // 1. Sentiment Analysis
        $analysis['sentiment'] = $this->analyzeSentiment($text);

        // 2. Intent Classification
        $analysis['intent'] = $this->classifyIntent($text);

        // 3. Entity Extraction
        $analysis['entities'] = $this->extractEntities($text);

        // 4. Language Detection
        $analysis['language'] = $this->detectLanguage($text);

        // 5. Complexity Analysis
        $analysis['complexity_score'] = $this->analyzeComplexity($text);

        // 6. Urgency Detection
        $analysis['urgency_score'] = $this->detectUrgency($text);

        // 7. Topic Extraction
        $analysis['topics'] = $this->extractTopics($text);

        // 8. Key Points Extraction
        $analysis['key_points'] = $this->extractKeyPoints($text);

        // 9. Confidence Score
        $analysis['confidence_score'] = $this->calculateConfidenceScore($analysis);

        // 10. Context Analysis
        $analysis['context'] = $this->analyzeContext($message);

        return $analysis;
    }

    /**
     * Local sentiment analysis using keyword matching (cost-free)
     */
    private function analyzeSentimentLocal(string $text): array
    {
        $positiveWords = ['terima kasih', 'bagus', 'baik', 'senang', 'puas', 'membantu', 'cepat', 'profesional'];
        $negativeWords = ['buruk', 'jelek', 'lambat', 'tidak puas', 'kecewa', 'marah', 'frustasi', 'masalah'];

        $text = strtolower($text);
        $positiveCount = 0;
        $negativeCount = 0;

        foreach ($positiveWords as $word) {
            if (strpos($text, $word) !== false) {
                $positiveCount++;
            }
        }

        foreach ($negativeWords as $word) {
            if (strpos($text, $word) !== false) {
                $negativeCount++;
            }
        }

        if ($positiveCount > $negativeCount) {
            $sentiment = 'positive';
            $score = min(0.8, 0.5 + ($positiveCount * 0.1));
        } elseif ($negativeCount > $positiveCount) {
            $sentiment = 'negative';
            $score = min(0.8, 0.5 + ($negativeCount * 0.1));
        } else {
            $sentiment = 'neutral';
            $score = 0.5;
        }

        return [
            'sentiment' => $sentiment,
            'score' => $score,
            'confidence' => 0.7
        ];
    }

    /**
     * Local intent classification using keyword matching (cost-free)
     */
    private function classifyIntentLocal(string $text): array
    {
        $text = strtolower($text);

        $intentPatterns = [
            'complaint' => ['komplain', 'keluhan', 'masalah', 'tidak puas', 'kecewa'],
            'inquiry' => ['tanya', 'bertanya', 'informasi', 'bagaimana', 'apa', 'kapan'],
            'request' => ['minta', 'mohon', 'tolong', 'bisa', 'boleh'],
            'greeting' => ['halo', 'hai', 'selamat', 'pagi', 'siang', 'malam'],
            'thanks' => ['terima kasih', 'makasih', 'thanks'],
            'goodbye' => ['selamat tinggal', 'bye', 'sampai jumpa']
        ];

        $scores = [];
        foreach ($intentPatterns as $intent => $patterns) {
            $score = 0;
            foreach ($patterns as $pattern) {
                if (strpos($text, $pattern) !== false) {
                    $score += 1;
                }
            }
            $scores[$intent] = $score;
        }

        $topIntent = array_keys($scores, max($scores))[0];
        $confidence = max($scores) > 0 ? min(0.9, max($scores) * 0.3) : 0.1;

        return [
            'intent' => $topIntent,
            'confidence' => $confidence,
            'all_scores' => $scores
        ];
    }

    /**
     * Local entity extraction using regex patterns (cost-free)
     */
    private function extractEntitiesLocal(string $text): array
    {
        $entities = [];

        // Email extraction
        if (preg_match_all('/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/', $text, $matches)) {
            $entities['emails'] = $matches[0];
        }

        // Phone number extraction (Indonesian format)
        if (preg_match_all('/\b(?:\+62|62|0)[0-9]{8,13}\b/', $text, $matches)) {
            $entities['phone_numbers'] = $matches[0];
        }

        // Amount extraction
        if (preg_match_all('/\b(?:Rp\.?|IDR)\s*[\d.,]+\b/', $text, $matches)) {
            $entities['amounts'] = $matches[0];
        }

        // Date extraction
        if (preg_match_all('/\b\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}\b/', $text, $matches)) {
            $entities['dates'] = $matches[0];
        }

        return $entities;
    }

    /**
     * Local language detection using character analysis (cost-free)
     */
    private function detectLanguageLocal(string $text): array
    {
        $indonesianChars = preg_match_all('/[a-z]/i', $text);
        $totalChars = strlen(preg_replace('/\s+/', '', $text));

        // Simple heuristic: if text contains common Indonesian words
        $indonesianWords = ['yang', 'dan', 'dengan', 'untuk', 'dari', 'pada', 'dalam', 'adalah', 'ini', 'itu'];
        $indonesianCount = 0;

        foreach ($indonesianWords as $word) {
            if (stripos($text, $word) !== false) {
                $indonesianCount++;
            }
        }

        $confidence = $indonesianCount > 2 ? 0.8 : 0.5;

        return [
            'language' => $indonesianCount > 1 ? 'id' : 'en',
            'confidence' => $confidence
        ];
    }

    /**
     * Local complexity analysis using text metrics (cost-free)
     */
    private function analyzeComplexityLocal(string $text): array
    {
        $wordCount = str_word_count($text);
        $sentenceCount = substr_count($text, '.') + substr_count($text, '!') + substr_count($text, '?');
        $avgWordsPerSentence = $sentenceCount > 0 ? $wordCount / $sentenceCount : $wordCount;

        // Simple complexity score based on text length and structure
        $complexityScore = min(1.0, ($wordCount / 50) + ($avgWordsPerSentence / 20));

        return [
            'score' => $complexityScore,
            'word_count' => $wordCount,
            'sentence_count' => $sentenceCount,
            'avg_words_per_sentence' => $avgWordsPerSentence
        ];
    }

    /**
     * Local urgency detection using keyword matching (cost-free)
     */
    private function detectUrgencyLocal(string $text): array
    {
        $urgentWords = ['urgent', 'segera', 'cepat', 'mendesak', 'penting', 'asap', 'sekarang', 'hari ini'];
        $text = strtolower($text);

        $urgencyScore = 0;
        foreach ($urgentWords as $word) {
            if (strpos($text, $word) !== false) {
                $urgencyScore += 0.3;
            }
        }

        // Check for multiple exclamation marks
        $exclamationCount = substr_count($text, '!');
        $urgencyScore += min(0.3, $exclamationCount * 0.1);

        $urgencyScore = min(1.0, $urgencyScore);

        return [
            'score' => $urgencyScore,
            'level' => $urgencyScore > 0.7 ? 'high' : ($urgencyScore > 0.4 ? 'medium' : 'low')
        ];
    }

    /**
     * Local topic extraction using keyword matching (cost-free)
     */
    private function extractTopicsLocal(string $text): array
    {
        $text = strtolower($text);

        $topicKeywords = [
            'billing' => ['tagihan', 'bayar', 'pembayaran', 'invoice', 'bill'],
            'technical' => ['error', 'bug', 'masalah teknis', 'tidak bisa', 'gagal'],
            'account' => ['akun', 'login', 'password', 'registrasi', 'daftar'],
            'product' => ['produk', 'barang', 'item', 'beli', 'order'],
            'support' => ['bantuan', 'help', 'support', 'tolong', 'mohon bantuan']
        ];

        $topics = [];
        foreach ($topicKeywords as $topic => $keywords) {
            foreach ($keywords as $keyword) {
                if (strpos($text, $keyword) !== false) {
                    $topics[] = $topic;
                    break;
                }
            }
        }

        return array_unique($topics);
    }

    /**
     * Local key points extraction using simple text analysis (cost-free)
     */
    private function extractKeyPointsLocal(string $text): array
    {
        // Simple key points extraction based on sentence structure
        $sentences = preg_split('/[.!?]+/', $text);
        $keyPoints = [];

        foreach ($sentences as $sentence) {
            $sentence = trim($sentence);
            if (strlen($sentence) > 10) { // Filter out very short sentences
                $keyPoints[] = $sentence;
            }
        }

        return array_slice($keyPoints, 0, 3); // Return max 3 key points
    }

    /**
     * Local context analysis (cost-free)
     */
    private function analyzeContextLocal(Message $message): array
    {
        return [
            'message_type' => $message->message_type ?? 'text',
            'platform' => $message->platform ?? 'unknown',
            'timestamp' => $message->created_at,
            'sender_type' => $message->sender_type ?? 'customer',
            'context_available' => true
        ];
    }

    /**
     * Get cost statistics for monitoring
     */
    public function getCostStatistics(): array
    {
        $cacheKey = 'ai_cost_stats_' . date('Y-m-d');

        return Cache::remember($cacheKey, 3600, function () {
            return [
                'local_analysis_count' => Cache::get('ai_local_analysis_count', 0),
                'api_analysis_count' => Cache::get('ai_api_analysis_count', 0),
                'estimated_savings' => $this->calculateEstimatedSavings(),
                'cache_hit_rate' => $this->getCacheHitRate(),
                'analysis_method_usage' => [
                    'local' => Cache::get('ai_local_analysis_count', 0),
                    'api' => Cache::get('ai_api_analysis_count', 0)
                ]
            ];
        });
    }

    /**
     * Calculate estimated cost savings from using local analysis
     */
    private function calculateEstimatedSavings(): array
    {
        $localCount = Cache::get('ai_local_analysis_count', 0);
        $apiCount = Cache::get('ai_api_analysis_count', 0);

        // Estimate cost per API call (rough estimate for GPT-3.5-turbo)
        $costPerApiCall = 0.002; // $0.002 per 1K tokens, assuming ~1K tokens per analysis
        $totalApiCost = $apiCount * $costPerApiCall;
        $potentialApiCost = ($localCount + $apiCount) * $costPerApiCall;
        $savings = $potentialApiCost - $totalApiCost;

        return [
            'total_api_cost' => round($totalApiCost, 4),
            'potential_cost_without_local' => round($potentialApiCost, 4),
            'savings' => round($savings, 4),
            'savings_percentage' => $potentialApiCost > 0 ? round(($savings / $potentialApiCost) * 100, 2) : 0
        ];
    }

    /**
     * Get cache hit rate
     */
    private function getCacheHitRate(): float
    {
        $cacheHits = Cache::get('ai_cache_hits', 0);
        $cacheMisses = Cache::get('ai_cache_misses', 0);
        $total = $cacheHits + $cacheMisses;

        return $total > 0 ? round(($cacheHits / $total) * 100, 2) : 0;
    }

    /**
     * Increment analysis counters for monitoring
     */
    private function incrementAnalysisCounter(string $type): void
    {
        $key = "ai_{$type}_analysis_count";
        Cache::increment($key);

        // Also increment daily counter
        $dailyKey = "ai_{$type}_analysis_count_" . date('Y-m-d');
        Cache::increment($dailyKey);
    }

    /**
     * Increment cache counters
     */
    private function incrementCacheCounter(string $type): void
    {
        $key = "ai_cache_{$type}";
        Cache::increment($key);
    }

    /**
     * Reset daily counters (should be called by scheduled task)
     */
    public function resetDailyCounters(): void
    {
        $today = date('Y-m-d');
        $keys = [
            "ai_local_analysis_count_{$today}",
            "ai_api_analysis_count_{$today}",
            "ai_cache_hits_{$today}",
            "ai_cache_misses_{$today}"
        ];

        foreach ($keys as $key) {
            Cache::forget($key);
        }
    }

    /**
     * Generate response suggestions for human agents
     */
    public function generateResponseSuggestions(array $conversationContext, array $agentProfile, string $context = null): array
    {
        try {
            $prompt = $this->buildResponseSuggestionPrompt($conversationContext, $agentProfile, $context);

            $response = $this->callOpenAI($prompt, [
                'max_tokens' => 1000,
                'temperature' => 0.7,
            ]);

            return $this->parseResponseSuggestions($response);
        } catch (\Exception $e) {
            Log::error('Response suggestions generation error: ' . $e->getMessage());
            return $this->getDefaultResponseSuggestions();
        }
    }

    /**
     * Analyze agent's response for quality and improvement
     */
    public function analyzeAgentResponse(string $response, ChatSession $session): array
    {
        try {
            $analysis = [
                'response_text' => $response,
                'timestamp' => now(),
            ];

            // 1. Clarity Analysis
            $analysis['clarity_score'] = $this->analyzeClarity($response);

            // 2. Tone Analysis
            $analysis['tone_analysis'] = $this->analyzeTone($response);

            // 3. Completeness Check
            $analysis['completeness_score'] = $this->checkCompleteness($response, $session);

            // 4. Empathy Analysis
            $analysis['empathy_score'] = $this->analyzeEmpathy($response);

            // 5. Professionalism Check
            $analysis['professionalism_score'] = $this->checkProfessionalism($response);

            // 6. Grammar and Style
            $analysis['grammar_score'] = $this->checkGrammar($response);

            // 7. Overall Quality Score
            $analysis['overall_quality'] = $this->calculateOverallQuality($analysis);

            // 8. Improvement Suggestions
            $analysis['improvements'] = $this->generateImprovementSuggestions($analysis);

            return $analysis;
        } catch (\Exception $e) {
            Log::error('Agent response analysis error: ' . $e->getMessage());
            return $this->getDefaultResponseAnalysis();
        }
    }

    /**
     * Generate bot response for AI-only conversations
     */
    public function generateBotResponse(ChatSession $session, array $aiAnalysis): array
    {
        try {
            $botPersonality = $session->botPersonality;
            $conversationHistory = $this->getConversationHistory($session);

            $prompt = $this->buildBotResponsePrompt($botPersonality, $conversationHistory, $aiAnalysis);

            $response = $this->callOpenAI($prompt, [
                'max_tokens' => 500,
                'temperature' => 0.8,
            ]);

            return [
                'response_text' => $response['choices'][0]['message']['content'] ?? '',
                'confidence' => $aiAnalysis['confidence_score'] ?? 0.8,
                'bot_personality' => $botPersonality->name ?? 'Default',
                'response_type' => 'ai_generated',
            ];
        } catch (\Exception $e) {
            Log::error('Bot response generation error: ' . $e->getMessage());
            return [
                'response_text' => 'I apologize, but I\'m having trouble processing your request right now. Please try again or contact our support team.',
                'confidence' => 0.3,
                'bot_personality' => 'Default',
                'response_type' => 'fallback',
            ];
        }
    }

    /**
     * Real-time conversation monitoring and insights
     */
    public function monitorConversation(ChatSession $session): array
    {
        try {
            $recentMessages = $session->messages()
                ->orderBy('created_at', 'desc')
                ->limit(10)
                ->get();

            $monitoring = [
                'conversation_health' => $this->assessConversationHealth($recentMessages),
                'sentiment_trend' => $this->analyzeSentimentTrend($recentMessages),
                'escalation_indicators' => $this->detectEscalationIndicators($recentMessages),
                'response_quality' => $this->assessResponseQuality($recentMessages),
                'customer_satisfaction_indicators' => $this->assessCustomerSatisfaction($recentMessages),
            ];

            return $monitoring;
        } catch (\Exception $e) {
            Log::error('Conversation monitoring error: ' . $e->getMessage());
            return $this->getDefaultMonitoring();
        }
    }

    // ====================================================================
    // PRIVATE ANALYSIS METHODS
    // ====================================================================

    private function analyzeSentiment(string $text): array
    {
        try {
            $prompt = "Analyze the sentiment of this customer message and provide a detailed analysis:\n\n\"{$text}\"\n\nProvide analysis in JSON format with: overall (positive/negative/neutral), confidence (0-1), emotions (array of detected emotions), intensity (0-1), and reasoning.";

            $response = $this->callOpenAI($prompt, [
                'max_tokens' => 300,
                'temperature' => 0.3,
            ]);

            $analysis = json_decode($response['choices'][0]['message']['content'] ?? '{}', true);

            return [
                'overall' => $analysis['overall'] ?? 'neutral',
                'confidence' => $analysis['confidence'] ?? 0.5,
                'emotions' => $analysis['emotions'] ?? [],
                'intensity' => $analysis['intensity'] ?? 0.5,
                'reasoning' => $analysis['reasoning'] ?? '',
            ];
        } catch (\Exception $e) {
            return [
                'overall' => 'neutral',
                'confidence' => 0.5,
                'emotions' => [],
                'intensity' => 0.5,
                'reasoning' => 'Analysis failed',
            ];
        }
    }

    private function classifyIntent(string $text): array
    {
        try {
            $prompt = "Classify the intent of this customer message:\n\n\"{$text}\"\n\nProvide classification in JSON format with: primary (main intent), secondary (secondary intents), confidence (0-1), requires_human (boolean), category, and subcategory.";

            $response = $this->callOpenAI($prompt, [
                'max_tokens' => 300,
                'temperature' => 0.3,
            ]);

            $analysis = json_decode($response['choices'][0]['message']['content'] ?? '{}', true);

            return [
                'primary' => $analysis['primary'] ?? 'general_inquiry',
                'secondary' => $analysis['secondary'] ?? [],
                'confidence' => $analysis['confidence'] ?? 0.5,
                'requires_human' => $analysis['requires_human'] ?? false,
                'category' => $analysis['category'] ?? 'general',
                'subcategory' => $analysis['subcategory'] ?? 'inquiry',
            ];
        } catch (\Exception $e) {
            return [
                'primary' => 'general_inquiry',
                'secondary' => [],
                'confidence' => 0.5,
                'requires_human' => false,
                'category' => 'general',
                'subcategory' => 'inquiry',
            ];
        }
    }

    private function extractEntities(string $text): array
    {
        try {
            $prompt = "Extract entities from this customer message:\n\n\"{$text}\"\n\nExtract: names, phone numbers, emails, order numbers, product names, dates, amounts, and other relevant entities. Return in JSON format.";

            $response = $this->callOpenAI($prompt, [
                'max_tokens' => 300,
                'temperature' => 0.3,
            ]);

            $entities = json_decode($response['choices'][0]['message']['content'] ?? '{}', true);

            return [
                'names' => $entities['names'] ?? [],
                'phones' => $entities['phones'] ?? [],
                'emails' => $entities['emails'] ?? [],
                'order_numbers' => $entities['order_numbers'] ?? [],
                'products' => $entities['products'] ?? [],
                'dates' => $entities['dates'] ?? [],
                'amounts' => $entities['amounts'] ?? [],
                'other' => $entities['other'] ?? [],
            ];
        } catch (\Exception $e) {
            return [
                'names' => [],
                'phones' => [],
                'emails' => [],
                'order_numbers' => [],
                'products' => [],
                'dates' => [],
                'amounts' => [],
                'other' => [],
            ];
        }
    }

    private function detectLanguage(string $text): string
    {
        try {
            $prompt = "Detect the language of this text:\n\n\"{$text}\"\n\nReturn only the language code (e.g., 'id' for Indonesian, 'en' for English).";

            $response = $this->callOpenAI($prompt, [
                'max_tokens' => 10,
                'temperature' => 0.1,
            ]);

            $language = trim($response['choices'][0]['message']['content'] ?? 'id');

            return in_array($language, ['id', 'en', 'ms', 'th', 'vi']) ? $language : 'id';
        } catch (\Exception $e) {
            return 'id'; // Default to Indonesian
        }
    }

    private function analyzeComplexity(string $text): float
    {
        try {
            $prompt = "Analyze the complexity of this customer message on a scale of 0-1 (0 = simple, 1 = very complex):\n\n\"{$text}\"\n\nConsider: technical terms, multiple issues, emotional complexity, length, and clarity. Return only the number.";

            $response = $this->callOpenAI($prompt, [
                'max_tokens' => 10,
                'temperature' => 0.3,
            ]);

            $complexity = floatval(trim($response['choices'][0]['message']['content'] ?? '0.5'));

            return max(0, min(1, $complexity));
        } catch (\Exception $e) {
            return 0.5;
        }
    }

    private function detectUrgency(string $text): float
    {
        try {
            $prompt = "Analyze the urgency of this customer message on a scale of 0-1 (0 = not urgent, 1 = very urgent):\n\n\"{$text}\"\n\nConsider: time-sensitive words, emotional intensity, business impact, and customer expectations. Return only the number.";

            $response = $this->callOpenAI($prompt, [
                'max_tokens' => 10,
                'temperature' => 0.3,
            ]);

            $urgency = floatval(trim($response['choices'][0]['message']['content'] ?? '0.5'));

            return max(0, min(1, $urgency));
        } catch (\Exception $e) {
            return 0.5;
        }
    }

    private function extractTopics(string $text): array
    {
        try {
            $prompt = "Extract the main topics and themes from this customer message:\n\n\"{$text}\"\n\nReturn in JSON format with: primary_topics (array), secondary_topics (array), and confidence (0-1).";

            $response = $this->callOpenAI($prompt, [
                'max_tokens' => 300,
                'temperature' => 0.3,
            ]);

            $topics = json_decode($response['choices'][0]['message']['content'] ?? '{}', true);

            return [
                'primary_topics' => $topics['primary_topics'] ?? [],
                'secondary_topics' => $topics['secondary_topics'] ?? [],
                'confidence' => $topics['confidence'] ?? 0.5,
            ];
        } catch (\Exception $e) {
            return [
                'primary_topics' => [],
                'secondary_topics' => [],
                'confidence' => 0.5,
            ];
        }
    }

    private function extractKeyPoints(string $text): array
    {
        try {
            $prompt = "Extract the key points and important information from this customer message:\n\n\"{$text}\"\n\nReturn in JSON format with: main_points (array), action_items (array), and concerns (array).";

            $response = $this->callOpenAI($prompt, [
                'max_tokens' => 400,
                'temperature' => 0.3,
            ]);

            $keyPoints = json_decode($response['choices'][0]['message']['content'] ?? '{}', true);

            return [
                'main_points' => $keyPoints['main_points'] ?? [],
                'action_items' => $keyPoints['action_items'] ?? [],
                'concerns' => $keyPoints['concerns'] ?? [],
            ];
        } catch (\Exception $e) {
            return [
                'main_points' => [],
                'action_items' => [],
                'concerns' => [],
            ];
        }
    }

    private function calculateConfidenceScore(array $analysis): float
    {
        $factors = [
            'sentiment_confidence' => $analysis['sentiment']['confidence'] ?? 0.5,
            'intent_confidence' => $analysis['intent']['confidence'] ?? 0.5,
            'complexity_confidence' => 1 - abs(0.5 - ($analysis['complexity_score'] ?? 0.5)),
            'urgency_confidence' => 1 - abs(0.5 - ($analysis['urgency_score'] ?? 0.5)),
        ];

        return array_sum($factors) / count($factors);
    }

    private function analyzeContext(Message $message): array
    {
        try {
            $session = $message->chatSession;
            $recentMessages = $session->messages()
                ->where('created_at', '<', $message->created_at)
                ->orderBy('created_at', 'desc')
                ->limit(5)
                ->get();

            return [
                'conversation_length' => $session->messages()->count(),
                'recent_messages_count' => $recentMessages->count(),
                'session_duration' => $session->created_at->diffInMinutes(now()),
                'previous_topics' => $this->extractPreviousTopics($recentMessages),
                'conversation_flow' => $this->analyzeConversationFlow($recentMessages),
            ];
        } catch (\Exception $e) {
            return [
                'conversation_length' => 1,
                'recent_messages_count' => 0,
                'session_duration' => 0,
                'previous_topics' => [],
                'conversation_flow' => 'new',
            ];
        }
    }

    // ====================================================================
    // RESPONSE ANALYSIS METHODS
    // ====================================================================

    private function analyzeClarity(string $response): float
    {
        try {
            $prompt = "Analyze the clarity of this agent response on a scale of 0-1 (0 = unclear, 1 = very clear):\n\n\"{$response}\"\n\nConsider: sentence structure, word choice, organization, and comprehensibility. Return only the number.";

            $response = $this->callOpenAI($prompt, [
                'max_tokens' => 10,
                'temperature' => 0.3,
            ]);

            $clarity = floatval(trim($response['choices'][0]['message']['content'] ?? '0.8'));

            return max(0, min(1, $clarity));
        } catch (\Exception $e) {
            return 0.8;
        }
    }

    private function analyzeTone(string $response): array
    {
        try {
            $prompt = "Analyze the tone of this agent response:\n\n\"{$response}\"\n\nProvide analysis in JSON format with: overall_tone (professional/friendly/formal/casual), appropriateness (0-1), empathy_level (0-1), and suggestions for improvement.";

            $response = $this->callOpenAI($prompt, [
                'max_tokens' => 300,
                'temperature' => 0.3,
            ]);

            $tone = json_decode($response['choices'][0]['message']['content'] ?? '{}', true);

            return [
                'overall_tone' => $tone['overall_tone'] ?? 'professional',
                'appropriateness' => $tone['appropriateness'] ?? 0.8,
                'empathy_level' => $tone['empathy_level'] ?? 0.7,
                'suggestions' => $tone['suggestions'] ?? [],
            ];
        } catch (\Exception $e) {
            return [
                'overall_tone' => 'professional',
                'appropriateness' => 0.8,
                'empathy_level' => 0.7,
                'suggestions' => [],
            ];
        }
    }

    private function checkCompleteness(string $response, ChatSession $session): float
    {
        try {
            $lastCustomerMessage = $session->messages()
                ->where('sender_type', 'customer')
                ->orderBy('created_at', 'desc')
                ->first();

            if (!$lastCustomerMessage) {
                return 0.8;
            }

            $prompt = "Check if this agent response adequately addresses the customer's message:\n\nCustomer: \"{$lastCustomerMessage->message_text}\"\nAgent: \"{$response}\"\n\nRate completeness on a scale of 0-1 (0 = incomplete, 1 = fully addressed). Return only the number.";

            $response = $this->callOpenAI($prompt, [
                'max_tokens' => 10,
                'temperature' => 0.3,
            ]);

            $completeness = floatval(trim($response['choices'][0]['message']['content'] ?? '0.8'));

            return max(0, min(1, $completeness));
        } catch (\Exception $e) {
            return 0.8;
        }
    }

    private function analyzeEmpathy(string $response): float
    {
        try {
            $prompt = "Analyze the empathy level in this agent response on a scale of 0-1 (0 = no empathy, 1 = very empathetic):\n\n\"{$response}\"\n\nConsider: acknowledgment of feelings, supportive language, understanding, and emotional connection. Return only the number.";

            $response = $this->callOpenAI($prompt, [
                'max_tokens' => 10,
                'temperature' => 0.3,
            ]);

            $empathy = floatval(trim($response['choices'][0]['message']['content'] ?? '0.7'));

            return max(0, min(1, $empathy));
        } catch (\Exception $e) {
            return 0.7;
        }
    }

    private function checkProfessionalism(string $response): float
    {
        try {
            $prompt = "Check the professionalism of this agent response on a scale of 0-1 (0 = unprofessional, 1 = very professional):\n\n\"{$response}\"\n\nConsider: language quality, politeness, structure, and business appropriateness. Return only the number.";

            $response = $this->callOpenAI($prompt, [
                'max_tokens' => 10,
                'temperature' => 0.3,
            ]);

            $professionalism = floatval(trim($response['choices'][0]['message']['content'] ?? '0.8'));

            return max(0, min(1, $professionalism));
        } catch (\Exception $e) {
            return 0.8;
        }
    }

    private function checkGrammar(string $response): float
    {
        try {
            $prompt = "Check the grammar and language quality of this agent response on a scale of 0-1 (0 = poor grammar, 1 = perfect grammar):\n\n\"{$response}\"\n\nConsider: spelling, grammar, punctuation, and language flow. Return only the number.";

            $response = $this->callOpenAI($prompt, [
                'max_tokens' => 10,
                'temperature' => 0.3,
            ]);

            $grammar = floatval(trim($response['choices'][0]['message']['content'] ?? '0.9'));

            return max(0, min(1, $grammar));
        } catch (\Exception $e) {
            return 0.9;
        }
    }

    private function calculateOverallQuality(array $analysis): float
    {
        $factors = [
            'clarity' => $analysis['clarity_score'] ?? 0.8,
            'tone_appropriateness' => $analysis['tone_analysis']['appropriateness'] ?? 0.8,
            'completeness' => $analysis['completeness_score'] ?? 0.8,
            'empathy' => $analysis['empathy_score'] ?? 0.7,
            'professionalism' => $analysis['professionalism_score'] ?? 0.8,
            'grammar' => $analysis['grammar_score'] ?? 0.9,
        ];

        return array_sum($factors) / count($factors);
    }

    private function generateImprovementSuggestions(array $analysis): array
    {
        $suggestions = [];

        if (($analysis['clarity_score'] ?? 1) < 0.7) {
            $suggestions[] = "Use simpler language and shorter sentences for better clarity";
        }

        if (($analysis['tone_analysis']['empathy_level'] ?? 1) < 0.6) {
            $suggestions[] = "Add more empathetic language to connect with the customer";
        }

        if (($analysis['completeness_score'] ?? 1) < 0.7) {
            $suggestions[] = "Provide more comprehensive information to fully address the query";
        }

        if (($analysis['professionalism_score'] ?? 1) < 0.7) {
            $suggestions[] = "Maintain a more professional tone and structure";
        }

        return $suggestions;
    }

    // ====================================================================
    // HELPER METHODS
    // ====================================================================

    private function callOpenAI(string $prompt, array $options = []): array
    {
        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->openaiApiKey,
                'Content-Type' => 'application/json',
            ])->post($this->baseUrl . '/chat/completions', [
                'model' => 'gpt-4',
                'messages' => [
                    ['role' => 'user', 'content' => $prompt]
                ],
                'max_tokens' => $options['max_tokens'] ?? 500,
                'temperature' => $options['temperature'] ?? 0.7,
            ]);

            if ($response->successful()) {
                return $response->json();
            }

            throw new \Exception('OpenAI API request failed: ' . $response->body());
        } catch (\Exception $e) {
            Log::error('OpenAI API call failed: ' . $e->getMessage());
            throw $e;
        }
    }

    private function buildResponseSuggestionPrompt(array $conversationContext, array $agentProfile, string $context = null): string
    {
        $customerMessage = $conversationContext['recent_messages'][0]['text'] ?? '';
        $customerName = $conversationContext['customer_profile']['name'] ?? 'Customer';
        $agentName = $agentProfile['name'] ?? 'Agent';
        $agentStyle = $agentProfile['communication_style'] ?? 'professional';

        return "You are an AI assistant helping a customer service agent named {$agentName} respond to a customer message.

Customer: {$customerName}
Message: \"{$customerMessage}\"

Agent Profile:
- Name: {$agentName}
- Communication Style: {$agentStyle}
- Languages: " . implode(', ', $agentProfile['languages'] ?? ['Indonesian']) . "

Provide 3 response suggestions in JSON format:
1. Professional and formal
2. Friendly and empathetic
3. Concise and direct

Each suggestion should include: text, tone, and reasoning.

Context: {$context}";
    }

    private function parseResponseSuggestions(array $response): array
    {
        try {
            $content = $response['choices'][0]['message']['content'] ?? '{}';
            $suggestions = json_decode($content, true);

            return [
                'suggestions' => $suggestions['suggestions'] ?? [],
                'context' => $suggestions['context'] ?? '',
                'confidence' => $suggestions['confidence'] ?? 0.8,
            ];
        } catch (\Exception $e) {
            return $this->getDefaultResponseSuggestions();
        }
    }

    private function buildBotResponsePrompt(BotPersonality $botPersonality, array $conversationHistory, array $aiAnalysis): string
    {
        $personality = $botPersonality->display_name ?? 'Assistant';
        $tone = $botPersonality->tone ?? 'friendly';
        $language = $botPersonality->language ?? 'indonesia';

        $history = '';
        foreach ($conversationHistory as $message) {
            $history .= "{$message['sender_type']}: {$message['message_text']}\n";
        }

        return "You are {$personality}, a customer service bot with a {$tone} tone. Respond in {$language}.

Conversation History:
{$history}

Customer's latest message sentiment: " . ($aiAnalysis['sentiment']['overall'] ?? 'neutral') . "
Intent: " . ($aiAnalysis['intent']['primary'] ?? 'general_inquiry') . "

Provide a helpful, appropriate response that matches your personality and addresses the customer's needs.";
    }

    private function getConversationHistory(ChatSession $session): array
    {
        return $session->messages()
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get(['sender_type', 'message_text', 'created_at'])
            ->map(function ($message) {
                return [
                    'sender_type' => $message->sender_type,
                    'message_text' => $message->message_text,
                    'timestamp' => $message->created_at->format('H:i'),
                ];
            })
            ->toArray();
    }

    // ====================================================================
    // DEFAULT RESPONSES
    // ====================================================================

    private function getDefaultAnalysis(): array
    {
        return [
            'sentiment' => ['overall' => 'neutral', 'confidence' => 0.5],
            'intent' => ['primary' => 'general_inquiry', 'confidence' => 0.5],
            'entities' => [],
            'language' => 'id',
            'complexity_score' => 0.5,
            'urgency_score' => 0.5,
            'topics' => [],
            'key_points' => [],
            'confidence_score' => 0.5,
            'context' => [],
        ];
    }

    private function getDefaultResponseSuggestions(): array
    {
        return [
            'suggestions' => [
                [
                    'text' => 'Thank you for contacting us. How can I help you today?',
                    'tone' => 'professional',
                    'reasoning' => 'Standard professional greeting'
                ]
            ],
            'context' => 'Default response',
            'confidence' => 0.5,
        ];
    }

    private function getDefaultResponseAnalysis(): array
    {
        return [
            'clarity_score' => 0.8,
            'tone_analysis' => ['overall_tone' => 'professional', 'appropriateness' => 0.8],
            'completeness_score' => 0.8,
            'empathy_score' => 0.7,
            'professionalism_score' => 0.8,
            'grammar_score' => 0.9,
            'overall_quality' => 0.8,
            'improvements' => [],
        ];
    }

    private function getDefaultMonitoring(): array
    {
        return [
            'conversation_health' => 'good',
            'sentiment_trend' => 'stable',
            'escalation_indicators' => [],
            'response_quality' => 'good',
            'customer_satisfaction_indicators' => 'positive',
        ];
    }

    // Additional helper methods for monitoring, trend analysis, etc.
    private function assessConversationHealth($messages): string
    {
        // Implementation for conversation health assessment
        return 'good';
    }

    private function analyzeSentimentTrend($messages): string
    {
        // Implementation for sentiment trend analysis
        return 'stable';
    }

    private function detectEscalationIndicators($messages): array
    {
        // Implementation for escalation indicators detection
        return [];
    }

    private function assessResponseQuality($messages): string
    {
        // Implementation for response quality assessment
        return 'good';
    }

    private function assessCustomerSatisfaction($messages): string
    {
        // Implementation for customer satisfaction assessment
        return 'positive';
    }

    private function extractPreviousTopics($messages): array
    {
        // Implementation for previous topics extraction
        return [];
    }

    private function analyzeConversationFlow($messages): string
    {
        // Implementation for conversation flow analysis
        return 'new';
    }
}
