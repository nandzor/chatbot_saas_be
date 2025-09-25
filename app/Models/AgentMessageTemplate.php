<?php

namespace App\Models;

use App\Traits\BelongsToOrganization;
use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AgentMessageTemplate extends Model
{
    use HasFactory, HasUuid, BelongsToOrganization;

    protected $fillable = [
        'organization_id',
        'created_by_agent_id',
        'name',
        'category',
        'content',
        'variables',
        'metadata',
        'usage_count',
        'success_rate',
        'is_active',
        'is_public',
    ];

    protected $casts = [
        'variables' => 'array',
        'metadata' => 'array',
        'usage_count' => 'integer',
        'success_rate' => 'decimal:2',
        'is_active' => 'boolean',
        'is_public' => 'boolean',
    ];

    /**
     * Get the agent who created this template.
     */
    public function createdByAgent(): BelongsTo
    {
        return $this->belongsTo(Agent::class, 'created_by_agent_id');
    }

    /**
     * Get the organization for this template.
     */
    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    /**
     * Scope for active templates.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope for public templates.
     */
    public function scopePublic($query)
    {
        return $query->where('is_public', true);
    }

    /**
     * Scope for templates by category.
     */
    public function scopeByCategory($query, string $category)
    {
        return $query->where('category', $category);
    }

    /**
     * Scope for templates created by specific agent.
     */
    public function scopeByAgent($query, string $agentId)
    {
        return $query->where('created_by_agent_id', $agentId);
    }

    /**
     * Scope for popular templates (high usage).
     */
    public function scopePopular($query, int $minUsage = 10)
    {
        return $query->where('usage_count', '>=', $minUsage)
                    ->orderBy('usage_count', 'desc');
    }

    /**
     * Scope for effective templates (high success rate).
     */
    public function scopeEffective($query, float $minSuccessRate = 0.8)
    {
        return $query->where('success_rate', '>=', $minSuccessRate)
                    ->orderBy('success_rate', 'desc');
    }

    /**
     * Increment usage count.
     */
    public function incrementUsage(): void
    {
        $this->increment('usage_count');
    }

    /**
     * Update success rate.
     */
    public function updateSuccessRate(float $successRate): void
    {
        $this->update(['success_rate' => $successRate]);
    }

    /**
     * Process template with variables.
     */
    public function processTemplate(array $variables = []): string
    {
        $content = $this->content;
        
        if ($this->variables && !empty($variables)) {
            foreach ($this->variables as $variable) {
                $placeholder = '{{' . $variable['name'] . '}}';
                $value = $variables[$variable['name']] ?? $variable['default'] ?? '';
                $content = str_replace($placeholder, $value, $content);
            }
        }
        
        return $content;
    }

    /**
     * Get available variables for this template.
     */
    public function getAvailableVariables(): array
    {
        if (!$this->variables) {
            return [];
        }
        
        return array_map(function ($variable) {
            return [
                'name' => $variable['name'],
                'description' => $variable['description'] ?? '',
                'type' => $variable['type'] ?? 'text',
                'default' => $variable['default'] ?? '',
                'required' => $variable['required'] ?? false,
            ];
        }, $this->variables);
    }

    /**
     * Validate variables against template requirements.
     */
    public function validateVariables(array $variables): array
    {
        $errors = [];
        
        if (!$this->variables) {
            return $errors;
        }
        
        foreach ($this->variables as $variable) {
            $name = $variable['name'];
            $required = $variable['required'] ?? false;
            
            if ($required && (!isset($variables[$name]) || empty($variables[$name]))) {
                $errors[] = "Variable '{$name}' is required";
            }
            
            if (isset($variables[$name])) {
                $type = $variable['type'] ?? 'text';
                $value = $variables[$name];
                
                switch ($type) {
                    case 'email':
                        if (!filter_var($value, FILTER_VALIDATE_EMAIL)) {
                            $errors[] = "Variable '{$name}' must be a valid email";
                        }
                        break;
                    case 'number':
                        if (!is_numeric($value)) {
                            $errors[] = "Variable '{$name}' must be a number";
                        }
                        break;
                    case 'date':
                        if (!strtotime($value)) {
                            $errors[] = "Variable '{$name}' must be a valid date";
                        }
                        break;
                }
            }
        }
        
        return $errors;
    }

    /**
     * Get category color for UI.
     */
    public function getCategoryColorAttribute(): string
    {
        return match($this->category) {
            'greeting' => 'green',
            'closing' => 'blue',
            'escalation' => 'orange',
            'information' => 'purple',
            'support' => 'yellow',
            'sales' => 'red',
            default => 'gray',
        };
    }

    /**
     * Get effectiveness badge for UI.
     */
    public function getEffectivenessBadgeAttribute(): string
    {
        if ($this->success_rate >= 0.9) {
            return 'excellent';
        } elseif ($this->success_rate >= 0.8) {
            return 'good';
        } elseif ($this->success_rate >= 0.7) {
            return 'average';
        } else {
            return 'poor';
        }
    }

    /**
     * Get usage level for UI.
     */
    public function getUsageLevelAttribute(): string
    {
        if ($this->usage_count >= 100) {
            return 'high';
        } elseif ($this->usage_count >= 50) {
            return 'medium';
        } elseif ($this->usage_count >= 10) {
            return 'low';
        } else {
            return 'minimal';
        }
    }

    /**
     * Duplicate template for another agent.
     */
    public function duplicateForAgent(string $agentId, string $newName = null): self
    {
        return self::create([
            'organization_id' => $this->organization_id,
            'created_by_agent_id' => $agentId,
            'name' => $newName ?? $this->name . ' (Copy)',
            'category' => $this->category,
            'content' => $this->content,
            'variables' => $this->variables,
            'metadata' => $this->metadata,
            'is_active' => true,
            'is_public' => false, // Private by default when duplicated
        ]);
    }
}
