<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

class AgentTemplateService extends BaseService
{
    /**
     * Get the model for the service.
     */
    protected function getModel(): \Illuminate\Database\Eloquent\Model
    {
        return new User();
    }

    /**
     * Get personal templates for current agent
     */
    public function getPersonalTemplates(Request $request): array
    {
        try {
            $user = Auth::user();

            // Try to get from cache first
            $cacheKey = "agent_personal_templates_{$user->id}";
            $templates = Cache::get($cacheKey);

            if (!$templates) {
                // Return empty templates array for now
                $templates = [
                    'data' => [],
                    'total' => 0,
                    'per_page' => 20,
                    'current_page' => 1,
                    'last_page' => 1
                ];

                // Cache for 30 minutes
                Cache::put($cacheKey, $templates, 1800);
            }

            // Apply pagination if needed
            $perPage = $request->get('per_page', 20);
            $page = $request->get('page', 1);

            if ($perPage !== 20 || $page !== 1) {
                $templates['per_page'] = $perPage;
                $templates['current_page'] = $page;
            }

            return $templates;
        } catch (\Exception $e) {
            Log::error('Error in getPersonalTemplates: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Create personal template for current agent
     */
    public function createPersonalTemplate(array $data): array
    {
        try {
            $user = Auth::user();

            // Validate template data
            $this->validateTemplateData($data);

            // Generate unique ID
            $templateId = uniqid();

            $template = [
                'id' => $templateId,
                'title' => $data['title'],
                'category' => $data['category'],
                'content' => $data['content'],
                'tags' => $data['tags'] ?? [],
                'usage_count' => 0,
                'last_used' => null,
                'created_at' => now(),
                'updated_at' => now()
            ];

            // Get existing templates
            $cacheKey = "agent_personal_templates_{$user->id}";
            $templates = Cache::get($cacheKey, ['data' => [], 'total' => 0, 'per_page' => 20, 'current_page' => 1, 'last_page' => 1]);

            // Add new template
            $templates['data'][] = $template;
            $templates['total'] = count($templates['data']);

            // Update cache
            Cache::put($cacheKey, $templates, 1800);

            // Log the creation
            Log::info("Personal template created for user {$user->id}: {$template['title']}");

            return $template;
        } catch (\Exception $e) {
            Log::error('Error in createPersonalTemplate: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Update personal template for current agent
     */
    public function updatePersonalTemplate(string $id, array $data): array
    {
        try {
            $user = Auth::user();

            // Validate template data
            $this->validateTemplateData($data, false);

            // Get existing templates
            $cacheKey = "agent_personal_templates_{$user->id}";
            $templates = Cache::get($cacheKey, ['data' => [], 'total' => 0, 'per_page' => 20, 'current_page' => 1, 'last_page' => 1]);

            // Find template by ID
            $templateIndex = null;
            foreach ($templates['data'] as $index => $template) {
                if ($template['id'] === $id) {
                    $templateIndex = $index;
                    break;
                }
            }

            if ($templateIndex === null) {
                throw new \Exception("Template with ID {$id} not found");
            }

            // Update template
            $templates['data'][$templateIndex] = array_merge($templates['data'][$templateIndex], [
                'title' => $data['title'] ?? $templates['data'][$templateIndex]['title'],
                'category' => $data['category'] ?? $templates['data'][$templateIndex]['category'],
                'content' => $data['content'] ?? $templates['data'][$templateIndex]['content'],
                'tags' => $data['tags'] ?? $templates['data'][$templateIndex]['tags'],
                'updated_at' => now()
            ]);

            // Update cache
            Cache::put($cacheKey, $templates, 1800);

            // Log the update
            Log::info("Personal template updated for user {$user->id}: {$id}");

            return $templates['data'][$templateIndex];
        } catch (\Exception $e) {
            Log::error('Error in updatePersonalTemplate: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Delete personal template for current agent
     */
    public function deletePersonalTemplate(string $id): array
    {
        try {
            $user = Auth::user();

            // Get existing templates
            $cacheKey = "agent_personal_templates_{$user->id}";
            $templates = Cache::get($cacheKey, ['data' => [], 'total' => 0, 'per_page' => 20, 'current_page' => 1, 'last_page' => 1]);

            // Find template by ID
            $templateIndex = null;
            foreach ($templates['data'] as $index => $template) {
                if ($template['id'] === $id) {
                    $templateIndex = $index;
                    break;
                }
            }

            if ($templateIndex === null) {
                throw new \Exception("Template with ID {$id} not found");
            }

            // Remove template
            unset($templates['data'][$templateIndex]);
            $templates['data'] = array_values($templates['data']); // Reindex array
            $templates['total'] = count($templates['data']);

            // Update cache
            Cache::put($cacheKey, $templates, 1800);

            // Log the deletion
            Log::info("Personal template deleted for user {$user->id}: {$id}");

            return ['id' => $id];
        } catch (\Exception $e) {
            Log::error('Error in deletePersonalTemplate: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Validate template data
     */
    private function validateTemplateData(array $data, bool $isRequired = true): void
    {
        if ($isRequired) {
            if (!isset($data['title']) || empty($data['title'])) {
                throw new \Exception('Title is required');
            }
            if (!isset($data['category']) || empty($data['category'])) {
                throw new \Exception('Category is required');
            }
            if (!isset($data['content']) || empty($data['content'])) {
                throw new \Exception('Content is required');
            }
        }

        // Validate title
        if (isset($data['title'])) {
            if (strlen($data['title']) > 255) {
                throw new \Exception('Title must not exceed 255 characters');
            }
        }

        // Validate category
        if (isset($data['category'])) {
            if (strlen($data['category']) > 100) {
                throw new \Exception('Category must not exceed 100 characters');
            }
        }

        // Validate content
        if (isset($data['content'])) {
            if (strlen($data['content']) > 2000) {
                throw new \Exception('Content must not exceed 2000 characters');
            }
        }

        // Validate tags
        if (isset($data['tags'])) {
            if (!is_array($data['tags'])) {
                throw new \Exception('Tags must be an array');
            }
        }
    }

    /**
     * Get template categories
     */
    public function getTemplateCategories(): array
    {
        return [
            ['value' => 'greeting', 'label' => 'Salam Pembuka'],
            ['value' => 'technical', 'label' => 'Teknis'],
            ['value' => 'billing', 'label' => 'Billing'],
            ['value' => 'escalation', 'label' => 'Eskalasi'],
            ['value' => 'closing', 'label' => 'Penutup'],
            ['value' => 'general', 'label' => 'Umum']
        ];
    }
}
