<?php

namespace App\Services\N8n\Exceptions;

use App\Services\Http\Exceptions\HttpClientException;

class N8nException extends HttpClientException
{
    public static function workflowNotFound(string $workflowId): self
    {
        return new self("N8N workflow '{$workflowId}' not found", 404);
    }

    public static function workflowAlreadyExists(string $workflowId): self
    {
        return new self("N8N workflow '{$workflowId}' already exists", 409);
    }

    public static function workflowNotActive(string $workflowId): self
    {
        return new self("N8N workflow '{$workflowId}' is not active", 400);
    }

    public static function executionNotFound(string $executionId): self
    {
        return new self("N8N execution '{$executionId}' not found", 404);
    }

    public static function credentialNotFound(string $credentialId): self
    {
        return new self("N8N credential '{$credentialId}' not found", 404);
    }

    public static function credentialTestFailed(string $reason): self
    {
        return new self("Credential test failed: {$reason}", 400);
    }

    public static function workflowExecutionFailed(string $reason): self
    {
        return new self("Workflow execution failed: {$reason}", 500);
    }

    public static function invalidWorkflowData(string $field): self
    {
        return new self("Invalid workflow data: {$field} is required", 400);
    }

    public static function rateLimitExceeded(): self
    {
        return new self("Rate limit exceeded", 429);
    }
}
