<?php

namespace App\Traits;

use App\Services\AiInstructionService;

trait GeneratesAiInstruction
{
    /**
     * Generate AI instruction for this bot personality
     */
    public function generateAiInstruction(): string
    {
        $service = app(AiInstructionService::class);

        return $service->generateForBotPersonality($this);
    }

    /**
     * Get the AI instruction as an attribute
     */
    public function getAiInstructionAttribute(): string
    {
        return $this->generateAiInstruction();
    }

    /**
     * Check if this personality has knowledge base
     */
    public function hasKnowledgeBase(): bool
    {
        return !empty($this->knowledge_base_item_id);
    }

    /**
     * Get knowledge base content
     */
    public function getKnowledgeBaseContent(): ?string
    {
        if (!$this->hasKnowledgeBase()) {
            return null;
        }

        return $this->knowledgeBaseItem?->content;
    }
}
