<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;
use Exception;

class RetryN8nWorkflowOperation implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected string $operation;
    protected string $workflowId;
    protected int $maxRetries;
    protected int $currentRetry;

    /**
     * Create a new job instance.
     */
    public function __construct(string $operation, string $workflowId, int $currentRetry = 1, int $maxRetries = 3)
    {
        $this->operation = $operation;
        $this->workflowId = $workflowId;
        $this->currentRetry = $currentRetry;
        $this->maxRetries = $maxRetries;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        try {
            Log::info('Retrying N8N workflow operation', [
                'operation' => $this->operation,
                'workflow_id' => $this->workflowId,
                'current_retry' => $this->currentRetry,
                'max_retries' => $this->maxRetries,
            ]);

            $success = $this->executeOperation();

            if ($success) {
                Log::info('N8N workflow operation retry successful', [
                    'operation' => $this->operation,
                    'workflow_id' => $this->workflowId,
                    'retry_attempt' => $this->currentRetry,
                ]);
            } else {
                $this->handleRetryFailure();
            }

        } catch (Exception $e) {
            Log::error('N8N workflow operation retry failed with exception', [
                'operation' => $this->operation,
                'workflow_id' => $this->workflowId,
                'retry_attempt' => $this->currentRetry,
                'error' => $e->getMessage(),
            ]);

            $this->handleRetryFailure();
        }
    }

    /**
     * Execute the specific operation
     */
    protected function executeOperation(): bool
    {
        $n8nBaseUrl = config('services.n8n.base_url', 'http://localhost:5678');
        $n8nApiKey = config('services.n8n.api_key');

        switch ($this->operation) {
            case 'activate_n8n_workflow':
                return $this->activateWorkflow($n8nBaseUrl, $n8nApiKey);
            
            case 'update_n8n_workflow':
                return $this->updateWorkflow($n8nBaseUrl, $n8nApiKey);
            
            default:
                Log::warning('Unknown N8N workflow operation', [
                    'operation' => $this->operation,
                    'workflow_id' => $this->workflowId,
                ]);
                return false;
        }
    }

    /**
     * Activate N8N workflow
     */
    protected function activateWorkflow(string $n8nBaseUrl, string $n8nApiKey): bool
    {
        try {
            $response = Http::withHeaders([
                'X-N8N-API-KEY' => $n8nApiKey,
                'Content-Type' => 'application/json',
            ])->post("{$n8nBaseUrl}/api/v1/workflows/{$this->workflowId}/activate");

            return $response->successful();
        } catch (Exception $e) {
            Log::error('Failed to activate N8N workflow in retry', [
                'workflow_id' => $this->workflowId,
                'error' => $e->getMessage(),
            ]);
            return false;
        }
    }

    /**
     * Update N8N workflow
     */
    protected function updateWorkflow(string $n8nBaseUrl, string $n8nApiKey): bool
    {
        try {
            // This would need specific update payload based on the workflow requirements
            $response = Http::withHeaders([
                'X-N8N-API-KEY' => $n8nApiKey,
                'Content-Type' => 'application/json',
            ])->patch("{$n8nBaseUrl}/api/v1/workflows/{$this->workflowId}");

            return $response->successful();
        } catch (Exception $e) {
            Log::error('Failed to update N8N workflow in retry', [
                'workflow_id' => $this->workflowId,
                'error' => $e->getMessage(),
            ]);
            return false;
        }
    }

    /**
     * Handle retry failure
     */
    protected function handleRetryFailure(): void
    {
        if ($this->currentRetry < $this->maxRetries) {
            // Schedule next retry with exponential backoff
            $delayMinutes = pow(2, $this->currentRetry) * 5; // 5, 10, 20 minutes
            
            Log::info('Scheduling next retry for N8N workflow operation', [
                'operation' => $this->operation,
                'workflow_id' => $this->workflowId,
                'next_retry' => $this->currentRetry + 1,
                'delay_minutes' => $delayMinutes,
            ]);

            self::dispatch(
                $this->operation,
                $this->workflowId,
                $this->currentRetry + 1,
                $this->maxRetries
            )->delay(now()->addMinutes($delayMinutes));
        } else {
            // Max retries reached, log for manual intervention
            Log::error('Max retries reached for N8N workflow operation', [
                'operation' => $this->operation,
                'workflow_id' => $this->workflowId,
                'total_retries' => $this->maxRetries,
            ]);

            // Could send notification to admin or add to dead letter queue
            $this->notifyMaxRetriesReached();
        }
    }

    /**
     * Notify that max retries have been reached
     */
    protected function notifyMaxRetriesReached(): void
    {
        // This could send an email notification, create a support ticket, etc.
        Log::critical('N8N workflow operation failed after max retries - manual intervention required', [
            'operation' => $this->operation,
            'workflow_id' => $this->workflowId,
            'max_retries' => $this->maxRetries,
        ]);
    }

    /**
     * Handle a job failure.
     */
    public function failed(Exception $exception): void
    {
        Log::error('N8N workflow operation retry job failed', [
            'operation' => $this->operation,
            'workflow_id' => $this->workflowId,
            'retry_attempt' => $this->currentRetry,
            'error' => $exception->getMessage(),
            'trace' => $exception->getTraceAsString(),
        ]);
    }
}
