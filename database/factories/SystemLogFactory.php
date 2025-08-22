<?php

namespace Database\Factories;

use App\Models\Organization;
use App\Models\SystemLog;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class SystemLogFactory extends Factory
{
    protected $model = SystemLog::class;

    public function definition(): array
    {
        $level = $this->faker->randomElement(['debug', 'info', 'warn', 'error', 'fatal']);
        $component = $this->faker->randomElement([
            'api', 'worker', 'scheduler', 'webhook', 'queue', 'auth',
            'database', 'cache', 'storage', 'email', 'sms', 'ai',
            'chat', 'knowledge', 'billing'
        ]);

        return [
            'organization_id' => $this->faker->optional(70)->randomElement([Organization::factory()]),
            'level' => $level,
            'logger_name' => $this->generateLoggerName($component),
            'message' => $this->generateMessage($level, $component),
            'formatted_message' => $this->generateFormattedMessage($level, $component),
            'component' => $component,
            'service' => $this->generateServiceName($component),
            'instance_id' => 'instance-' . $this->faker->randomElement(['01', '02', '03']) . '-' . $this->faker->randomElement(['web', 'worker', 'scheduler']),
            'request_id' => $this->faker->optional(60)->uuid(),
            'session_id' => $this->faker->optional(40)->uuid(),
            'user_id' => $this->faker->optional(30)->randomElement([User::factory()]),
            'ip_address' => $this->faker->optional(50)->ipv4(),
            'user_agent' => $this->faker->optional(40)->userAgent(),
            'error_code' => $level === 'error' || $level === 'fatal' ? $this->generateErrorCode() : null,
            'error_type' => $level === 'error' || $level === 'fatal' ? $this->generateErrorType() : null,
            'stack_trace' => $level === 'error' || $level === 'fatal' ? $this->generateStackTrace() : null,
            'duration_ms' => $this->faker->optional(30)->numberBetween(1, 5000),
            'memory_usage_mb' => $this->faker->optional(25)->numberBetween(50, 512),
            'cpu_usage_percent' => $this->faker->optional(20)->randomFloat(2, 0, 100),
            'extra_data' => $this->generateExtraData($component),
            'tags' => $this->generateTags($level, $component),
            'timestamp' => $this->faker->dateTimeBetween('-30 days', 'now'),
        ];
    }

    private function generateLoggerName(string $component): string
    {
        return match ($component) {
            'api' => 'App\\Http\\Controllers\\' . $this->faker->randomElement(['ChatController', 'UserController', 'WebhookController']),
            'worker' => 'App\\Jobs\\' . $this->faker->randomElement(['ProcessMessage', 'SendWebhook', 'SyncData']),
            'scheduler' => 'App\\Console\\Commands\\' . $this->faker->randomElement(['SendDigest', 'CleanupLogs', 'ProcessMetrics']),
            'auth' => 'App\\Services\\AuthService',
            'database' => 'Illuminate\\Database\\QueryException',
            'cache' => 'Illuminate\\Cache\\RedisStore',
            default => 'App\\Services\\' . ucfirst($component) . 'Service',
        };
    }

    private function generateMessage(string $level, string $component): string
    {
        return match ([$level, $component]) {
            ['info', 'api'] => $this->faker->randomElement([
                'API request completed successfully',
                'User authenticated successfully',
                'Chat session created',
                'Message processed and sent',
                'Webhook delivered successfully'
            ]),
            ['error', 'api'] => $this->faker->randomElement([
                'Failed to process API request',
                'Authentication failed for user',
                'Rate limit exceeded',
                'Invalid request payload',
                'Database connection failed'
            ]),
            ['warn', 'worker'] => $this->faker->randomElement([
                'Job execution took longer than expected',
                'Queue is backing up',
                'Memory usage approaching limit',
                'External API rate limit warning'
            ]),
            ['error', 'database'] => $this->faker->randomElement([
                'Query execution failed',
                'Connection timeout',
                'Deadlock detected',
                'Table lock timeout'
            ]),
            ['info', 'chat'] => $this->faker->randomElement([
                'New chat session started',
                'Message sent successfully',
                'Agent assigned to chat',
                'Chat session ended'
            ]),
            default => $this->faker->sentence(),
        };
    }

    private function generateFormattedMessage(string $level, string $component): string
    {
        $timestamp = now()->toISOString();
        $message = $this->generateMessage($level, $component);
        return "[{$timestamp}] {$level}.{$component}: {$message}";
    }

    private function generateServiceName(string $component): string
    {
        return match ($component) {
            'api' => $this->faker->randomElement(['web-api', 'admin-api', 'webhook-api']),
            'worker' => $this->faker->randomElement(['message-worker', 'email-worker', 'notification-worker']),
            'scheduler' => 'task-scheduler',
            'auth' => 'auth-service',
            'chat' => 'chat-service',
            'ai' => 'ai-service',
            'billing' => 'billing-service',
            default => $component . '-service',
        };
    }

    private function generateErrorCode(): string
    {
        return $this->faker->randomElement([
            'E001', 'E002', 'E404', 'E500', 'E503', 'E429', 'E401', 'E403',
            'DB001', 'DB002', 'API001', 'API002', 'AUTH001', 'CHAT001'
        ]);
    }

    private function generateErrorType(): string
    {
        return $this->faker->randomElement([
            'PDOException', 'HttpException', 'ValidationException', 'AuthenticationException',
            'RateLimitException', 'TimeoutException', 'ConnectionException', 'QueryException',
            'UnauthorizedException', 'ForbiddenException', 'NotFoundException'
        ]);
    }

    private function generateStackTrace(): string
    {
        $frames = [];
        $files = [
            'app/Http/Controllers/ChatController.php',
            'app/Services/ChatService.php',
            'app/Models/Message.php',
            'vendor/laravel/framework/src/Illuminate/Database/Eloquent/Model.php',
            'vendor/laravel/framework/src/Illuminate/Database/Connection.php'
        ];

        for ($i = 0; $i < $this->faker->numberBetween(3, 8); $i++) {
            $file = $this->faker->randomElement($files);
            $line = $this->faker->numberBetween(10, 500);
            $function = $this->faker->randomElement(['handle', 'store', 'create', 'execute', 'process']);
            $frames[] = "#{$i} {$file}({$line}): {$function}()";
        }

        return implode("\n", $frames);
    }

    private function generateExtraData(string $component): array
    {
        return match ($component) {
            'api' => [
                'endpoint' => '/' . $this->faker->word(),
                'method' => $this->faker->randomElement(['GET', 'POST', 'PUT', 'DELETE']),
                'status_code' => $this->faker->randomElement([200, 201, 400, 401, 403, 404, 500]),
                'response_time' => $this->faker->numberBetween(10, 2000),
            ],
            'database' => [
                'query' => 'SELECT * FROM ' . $this->faker->word() . ' WHERE id = ?',
                'bindings' => [$this->faker->uuid()],
                'connection' => 'mysql',
                'time' => $this->faker->numberBetween(1, 1000),
            ],
            'worker' => [
                'job_class' => 'App\\Jobs\\' . $this->faker->word(),
                'queue' => $this->faker->randomElement(['default', 'high', 'low']),
                'attempts' => $this->faker->numberBetween(1, 3),
                'timeout' => $this->faker->numberBetween(60, 300),
            ],
            'chat' => [
                'session_id' => $this->faker->uuid(),
                'message_count' => $this->faker->numberBetween(1, 50),
                'participants' => $this->faker->numberBetween(2, 5),
                'channel' => $this->faker->randomElement(['webchat', 'whatsapp', 'telegram']),
            ],
            default => [
                'context' => $this->faker->word(),
                'data' => $this->faker->words(3),
            ],
        };
    }

    private function generateTags(string $level, string $component): array
    {
        $tags = [$level, $component];

        if ($level === 'error' || $level === 'fatal') {
            $tags[] = 'alert';
        }

        if ($component === 'api') {
            $tags[] = 'http';
        }

        if ($this->faker->boolean(20)) {
            $tags[] = $this->faker->randomElement(['slow', 'memory_high', 'critical', 'production']);
        }

        return array_unique($tags);
    }

    public function debug(): static
    {
        return $this->state(fn (array $attributes) => [
            'level' => 'debug',
            'error_code' => null,
            'error_type' => null,
            'stack_trace' => null,
        ]);
    }

    public function info(): static
    {
        return $this->state(fn (array $attributes) => [
            'level' => 'info',
            'error_code' => null,
            'error_type' => null,
            'stack_trace' => null,
        ]);
    }

    public function warning(): static
    {
        return $this->state(fn (array $attributes) => [
            'level' => 'warn',
            'error_code' => null,
            'error_type' => null,
            'stack_trace' => null,
        ]);
    }

    public function error(): static
    {
        return $this->state(fn (array $attributes) => [
            'level' => 'error',
            'error_code' => $this->generateErrorCode(),
            'error_type' => $this->generateErrorType(),
            'stack_trace' => $this->generateStackTrace(),
        ]);
    }

    public function fatal(): static
    {
        return $this->state(fn (array $attributes) => [
            'level' => 'fatal',
            'error_code' => $this->generateErrorCode(),
            'error_type' => $this->generateErrorType(),
            'stack_trace' => $this->generateStackTrace(),
        ]);
    }

    public function api(): static
    {
        return $this->state(fn (array $attributes) => [
            'component' => 'api',
            'service' => 'web-api',
            'request_id' => $this->faker->uuid(),
        ]);
    }

    public function worker(): static
    {
        return $this->state(fn (array $attributes) => [
            'component' => 'worker',
            'service' => 'background-worker',
        ]);
    }

    public function database(): static
    {
        return $this->state(fn (array $attributes) => [
            'component' => 'database',
            'service' => 'database-service',
        ]);
    }

    public function withUser(User $user): static
    {
        return $this->state(fn (array $attributes) => [
            'user_id' => $user->id,
            'session_id' => $this->faker->uuid(),
        ]);
    }

    public function withPerformanceData(): static
    {
        return $this->state(fn (array $attributes) => [
            'duration_ms' => $this->faker->numberBetween(100, 5000),
            'memory_usage_mb' => $this->faker->numberBetween(100, 512),
            'cpu_usage_percent' => $this->faker->randomFloat(2, 10, 95),
        ]);
    }

    public function slow(): static
    {
        return $this->state(fn (array $attributes) => [
            'duration_ms' => $this->faker->numberBetween(2000, 10000),
            'tags' => array_merge($attributes['tags'] ?? [], ['slow']),
        ]);
    }

    public function recent(): static
    {
        return $this->state(fn (array $attributes) => [
            'timestamp' => $this->faker->dateTimeBetween('-1 hour', 'now'),
        ]);
    }
}
