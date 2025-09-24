<?php

namespace App\Services;

use App\Helpers\AiInstructionGenerator;
use App\Models\BotPersonality;
use App\Models\KnowledgeBaseItem;

class AiInstructionService
{
    /**
     * Generate AI instruction for a bot personality
     */
    public function generateForBotPersonality(BotPersonality $botPersonality): string
    {
        $knowledgeBase = $this->getKnowledgeBaseContent($botPersonality);

        return AiInstructionGenerator::generate(
            language: $botPersonality->language ?? 'indonesia',
            formalityLevel: $botPersonality->formality_level ?? 'friendly',
            knowledgeBase: $knowledgeBase
        );
    }

    /**
     * Generate AI instruction with custom parameters
     */
    public function generateCustom(
        string $language = 'indonesia',
        string $formalityLevel = 'friendly',
        ?string $knowledgeBaseId = null
    ): string {
        $knowledgeBase = $knowledgeBaseId
            ? $this->getKnowledgeBaseContentById($knowledgeBaseId)
            : '';

        return AiInstructionGenerator::generate(
            language: $language,
            formalityLevel: $formalityLevel,
            knowledgeBase: $knowledgeBase
        );
    }

    /**
     * Get knowledge base content for bot personality
     */
    private function getKnowledgeBaseContent(BotPersonality $botPersonality): string
    {
        if (!$botPersonality->knowledge_base_item_id) {
            return '';
        }

        $knowledgeBaseItem = KnowledgeBaseItem::with(['activeQaItems'])->find($botPersonality->knowledge_base_item_id);

        if (!$knowledgeBaseItem) {
            return '';
        }

        return $this->combineKnowledgeBaseContent($knowledgeBaseItem);
    }

    /**
     * Get knowledge base content by ID
     */
    private function getKnowledgeBaseContentById(string $knowledgeBaseId): string
    {
        $knowledgeBaseItem = KnowledgeBaseItem::with(['activeQaItems'])->find($knowledgeBaseId);

        if (!$knowledgeBaseItem) {
            return '';
        }

        return $this->combineKnowledgeBaseContent($knowledgeBaseItem);
    }

    /**
     * Combine knowledge base content with QA items
     */
    private function combineKnowledgeBaseContent(KnowledgeBaseItem $knowledgeBaseItem): string
    {
        $combinedContent = [];

        // Add main knowledge base content
        if (!empty(trim($knowledgeBaseItem->content))) {
            $combinedContent[] = "=== KNOWLEDGE BASE CONTENT ===";
            $combinedContent[] = trim($knowledgeBaseItem->content);
        }

        // Add QA items if available
        $qaItems = $knowledgeBaseItem->activeQaItems;
        if ($qaItems->isNotEmpty()) {
            $combinedContent[] = "\n=== FREQUENTLY ASKED QUESTIONS ===";

            foreach ($qaItems as $index => $qaItem) {
                $qaNumber = $index + 1;
                $combinedContent[] = "\nQ{$qaNumber}: {$qaItem->question}";
                $combinedContent[] = "A{$qaNumber}: {$qaItem->answer}";

                // Add context if available
                if (!empty(trim($qaItem->context))) {
                    $combinedContent[] = "Context: {$qaItem->context}";
                }

                // Add keywords if available
                if (!empty($qaItem->keywords) && is_array($qaItem->keywords)) {
                    $keywords = implode(', ', $qaItem->keywords);
                    $combinedContent[] = "Keywords: {$keywords}";
                }
            }
        }

        return implode("\n", $combinedContent);
    }

    /**
     * Get available languages
     */
    public function getAvailableLanguages(): array
    {
        return [
            'indonesia' => 'Bahasa Indonesia',
            'english' => 'English',
            'javanese' => 'Basa Jawa',
            'sundanese' => 'Basa Sunda',
        ];
    }

    /**
     * Get available formality levels
     */
    public function getAvailableFormalityLevels(): array
    {
        return [
            'friendly' => 'Friendly',
            'formal' => 'Formal',
            'casual' => 'Casual',
        ];
    }

    /**
     * Validate language parameter
     */
    public function isValidLanguage(string $language): bool
    {
        return array_key_exists(strtolower($language), $this->getAvailableLanguages());
    }

    /**
     * Validate formality level parameter
     */
    public function isValidFormalityLevel(string $formalityLevel): bool
    {
        return array_key_exists(strtolower($formalityLevel), $this->getAvailableFormalityLevels());
    }
}
