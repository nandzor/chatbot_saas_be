<?php

namespace App\Helpers;

class AiInstructionGenerator
{
    /**
     * Generate AI instruction based on language, formality level, and knowledge base
     */
    public static function generate(string $language = 'indonesia', string $formalityLevel = 'friendly', string $knowledgeBase = ''): string
    {
        $instructionBuilder = new self();

        return $instructionBuilder
            ->setLanguage($language)
            ->setFormalityLevel($formalityLevel)
            ->setKnowledgeBase($knowledgeBase)
            ->build();
    }

    private string $language;
    private string $formalityLevel;
    private string $knowledgeBase;
    private array $phrases = [];

    public function setLanguage(string $language): self
    {
        $this->language = strtolower($language);
        $this->loadLanguagePhrases();
        return $this;
    }

    public function setFormalityLevel(string $formalityLevel): self
    {
        $this->formalityLevel = strtolower($formalityLevel);
        return $this;
    }

    public function setKnowledgeBase(string $knowledgeBase): self
    {
        $this->knowledgeBase = trim($knowledgeBase);
        return $this;
    }

    public function build(): string
    {
        $instructions = [];

        // Add persona instruction
        $instructions[] = $this->getPersonaInstruction();

        // Add language mandate
        $instructions[] = $this->getLanguageMandate();

        // Add knowledge base if provided
        if (!empty($this->knowledgeBase)) {
            $instructions[] = $this->getKnowledgeBaseInstruction();
        }

        return implode("\n", $instructions);
    }

    private function loadLanguagePhrases(): void
    {
        $this->phrases = match ($this->language) {
            'english' => $this->getEnglishPhrases(),
            'javanese', 'jawa' => $this->getJavanesePhrases(),
            'sundanese' => $this->getSundanesePhrases(),
            default => $this->getIndonesianPhrases(),
        };
    }

    private function getPersonaInstruction(): string
    {
        return match ($this->formalityLevel) {
            'formal' => $this->phrases['formal_persona'],
            'casual' => $this->phrases['casual_persona'],
            default => $this->phrases['friendly_persona'],
        };
    }

    private function getLanguageMandate(): string
    {
        return $this->phrases['language_mandate'];
    }

    private function getKnowledgeBaseInstruction(): string
    {
        return "\n" . $this->phrases['kb_header'] . "\n" .
               "====================\n" .
               $this->knowledgeBase .
               "\n====================";
    }

    private function getEnglishPhrases(): array
    {
        return [
            'friendly_persona' => 'You are a friendly and helpful AI assistant.',
            'formal_persona' => 'You are a professional and informative AI assistant.',
            'casual_persona' => 'You are a casual and approachable AI assistant.',
            'language_mandate' => 'You must always communicate in English.',
            'kb_header' => 'Use the following information as your primary knowledge base to answer user queries. This includes both general content and frequently asked questions. Prioritize answers from the FAQ section when relevant, then use the general content. If the answer is not found in this knowledge base, say that you don\'t know.',
        ];
    }

    private function getIndonesianPhrases(): array
    {
        return [
            'friendly_persona' => 'Anda adalah asisten AI yang ramah dan siap membantu.',
            'formal_persona' => 'Anda adalah seorang asisten AI yang profesional dan informatif.',
            'casual_persona' => 'Anda adalah asisten AI yang santai dan mudah didekati.',
            'language_mandate' => 'Anda harus selalu berkomunikasi menggunakan Bahasa Indonesia.',
            'kb_header' => 'Gunakan informasi berikut sebagai basis pengetahuan utama Anda untuk menjawab pertanyaan pengguna. Informasi ini mencakup konten umum dan pertanyaan yang sering diajukan. Prioritaskan jawaban dari bagian FAQ jika relevan, kemudian gunakan konten umum. Jika jawaban tidak ditemukan dalam basis pengetahuan ini, katakan bahwa Anda tidak mengetahuinya.',
        ];
    }

    private function getJavanesePhrases(): array
    {
        return [
            'friendly_persona' => 'Sampeyan iku asisten AI sing grapyak lan seneng mbiyantu.',
            'formal_persona' => 'Njenengan inggih punika setunggaling asisten AI ingkang profesional lan tansah paring informasi.',
            'casual_persona' => 'Sampeyan iku asisten AI sing santai lan gampang diajak ngomong.',
            'language_mandate' => 'Sampeyan kedah tansah mangsuli pitakonan nganggo Basa Jawa.',
            'kb_header' => 'Gunakake informasi ing ngisor iki minangka dhasar kawruh utama kanggo njawab pitakonan. Informasi iki kalebu konten umum lan pitakonan sing asring ditakoni. Utamakake jawaban saka bagian FAQ yen relevan, banjur gunakake konten umum. Menawa wangsulane ora ana ing dhasar kawruh iki, matura yen sampeyan ora ngerti.',
        ];
    }

    private function getSundanesePhrases(): array
    {
        return [
            'friendly_persona' => 'Anjeun teh asisten AI anu ramah tur siap ngabantosan.',
            'formal_persona' => 'Anjeun teh asisten AI anu profesional tur informatif.',
            'casual_persona' => 'Anjeun teh asisten AI anu santai tur gampang diajak ngobrol.',
            'language_mandate' => 'Anjeun kedah salawasna ngobrol ngagunakeun Basa Sunda.',
            'kb_header' => 'Anggo inpormasi di handap ieu salaku dasar pangaweruh utama pikeun ngajawab patarosan. Inpormasi ieu kalebet konten umum sareng patarosan anu sering ditaroskeun. Utamakeun jawaban tina bagian FAQ upami relevan, teras anggo konten umum. Upami jawabanana teu aya dina dasar pangaweruh ieu, nyarios yén anjeun henteu terang.',
        ];
    }
}
