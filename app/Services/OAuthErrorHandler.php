<?php

namespace App\Services;

use Exception;
use GuzzleHttp\Exception\RequestException;
use GuzzleHttp\Exception\ConnectException;
use GuzzleHttp\Exception\ClientException;
use GuzzleHttp\Exception\ServerException;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

/**
 * OAuth Error Handling Service
 * Comprehensive error handling untuk OAuth flow
 */
class OAuthErrorHandler
{
    protected $errorCodes = [
        // OAuth 2.0 Standard Errors
        'invalid_request' => 'The request is missing a required parameter or is otherwise malformed.',
        'invalid_client' => 'Client authentication failed.',
        'invalid_grant' => 'The provided authorization grant is invalid, expired, or revoked.',
        'unauthorized_client' => 'The client is not authorized to request an authorization code.',
        'unsupported_grant_type' => 'The authorization grant type is not supported.',
        'invalid_scope' => 'The requested scope is invalid, unknown, or malformed.',
        'access_denied' => 'The resource owner or authorization server denied the request.',
        'server_error' => 'The authorization server encountered an unexpected condition.',
        'temporarily_unavailable' => 'The authorization server is temporarily unable to handle the request.',
        
        // Google API Specific Errors
        'quota_exceeded' => 'The request cannot be completed because you have exceeded your quota.',
        'rate_limit_exceeded' => 'The request rate limit has been exceeded.',
        'insufficient_permissions' => 'The request requires higher privileges than provided.',
        'invalid_credentials' => 'The provided credentials are invalid.',
        'token_expired' => 'The access token has expired.',
        'refresh_token_expired' => 'The refresh token has expired.',
        'invalid_token' => 'The provided token is invalid or malformed.',
        
        // N8N Integration Errors
        'n8n_connection_failed' => 'Failed to connect to N8N server.',
        'n8n_credential_creation_failed' => 'Failed to create credential in N8N.',
        'n8n_workflow_creation_failed' => 'Failed to create workflow in N8N.',
        'n8n_credential_test_failed' => 'Failed to test N8N credential.',
        
        // Database Errors
        'database_connection_failed' => 'Database connection failed.',
        'credential_storage_failed' => 'Failed to store credential in database.',
        'credential_retrieval_failed' => 'Failed to retrieve credential from database.',
        'credential_update_failed' => 'Failed to update credential in database.',
        
        // Network Errors
        'network_timeout' => 'Network request timed out.',
        'network_unreachable' => 'Network is unreachable.',
        'dns_resolution_failed' => 'DNS resolution failed.',
        'ssl_certificate_error' => 'SSL certificate verification failed.',
        
        // Application Errors
        'configuration_error' => 'Application configuration error.',
        'service_unavailable' => 'Service is temporarily unavailable.',
        'maintenance_mode' => 'Service is in maintenance mode.',
        'feature_disabled' => 'Feature is disabled.',
    ];

    protected $retryableErrors = [
        'server_error',
        'temporarily_unavailable',
        'network_timeout',
        'network_unreachable',
        'n8n_connection_failed',
        'database_connection_failed',
        'service_unavailable',
    ];

    protected $userFriendlyMessages = [
        'invalid_request' => 'The request is invalid. Please check your input and try again.',
        'invalid_client' => 'Authentication failed. Please contact support.',
        'invalid_grant' => 'Your authorization has expired. Please reconnect your Google account.',
        'unauthorized_client' => 'You are not authorized to perform this action.',
        'unsupported_grant_type' => 'This authorization method is not supported.',
        'invalid_scope' => 'The requested permissions are invalid.',
        'access_denied' => 'Access denied. Please grant the required permissions.',
        'server_error' => 'Google services are temporarily unavailable. Please try again later.',
        'temporarily_unavailable' => 'Google services are temporarily unavailable. Please try again later.',
        'quota_exceeded' => 'You have exceeded your Google API quota. Please try again later.',
        'rate_limit_exceeded' => 'Too many requests. Please wait a moment and try again.',
        'insufficient_permissions' => 'Insufficient permissions. Please check your Google account settings.',
        'invalid_credentials' => 'Your Google credentials are invalid. Please reconnect your account.',
        'token_expired' => 'Your session has expired. Please reconnect your Google account.',
        'refresh_token_expired' => 'Your authorization has expired. Please reconnect your Google account.',
        'invalid_token' => 'Your session is invalid. Please reconnect your Google account.',
        'n8n_connection_failed' => 'Unable to connect to automation service. Please try again later.',
        'n8n_credential_creation_failed' => 'Failed to create automation credential. Please try again.',
        'n8n_workflow_creation_failed' => 'Failed to create automation workflow. Please try again.',
        'n8n_credential_test_failed' => 'Failed to test automation credential. Please check your settings.',
        'database_connection_failed' => 'Database connection failed. Please try again later.',
        'credential_storage_failed' => 'Failed to save your credentials. Please try again.',
        'credential_retrieval_failed' => 'Failed to retrieve your credentials. Please try again.',
        'credential_update_failed' => 'Failed to update your credentials. Please try again.',
        'network_timeout' => 'Request timed out. Please check your internet connection and try again.',
        'network_unreachable' => 'Network error. Please check your internet connection.',
        'dns_resolution_failed' => 'Network error. Please check your internet connection.',
        'ssl_certificate_error' => 'Security error. Please contact support.',
        'configuration_error' => 'System configuration error. Please contact support.',
        'service_unavailable' => 'Service is temporarily unavailable. Please try again later.',
        'maintenance_mode' => 'Service is under maintenance. Please try again later.',
        'feature_disabled' => 'This feature is currently disabled.',
    ];

    /**
     * Handle OAuth errors dengan comprehensive error handling
     */
    public function handleOAuthError(Exception $exception, string $context = 'OAuth operation'): array
    {
        $errorCode = $this->determineErrorCode($exception);
        $userMessage = $this->getUserFriendlyMessage($errorCode);
        $technicalMessage = $this->getTechnicalMessage($exception);
        $isRetryable = $this->isRetryableError($errorCode);
        $retryAfter = $isRetryable ? $this->calculateRetryAfter($exception) : null;

        // Log error dengan context
        $this->logError($exception, $context, $errorCode, $technicalMessage);

        // Store error untuk analytics
        $this->storeErrorMetrics($errorCode, $context);

        return [
            'success' => false,
            'error_code' => $errorCode,
            'user_message' => $userMessage,
            'technical_message' => $technicalMessage,
            'is_retryable' => $isRetryable,
            'retry_after' => $retryAfter,
            'context' => $context,
            'timestamp' => now()->toISOString(),
            'suggestions' => $this->getErrorSuggestions($errorCode),
        ];
    }

    /**
     * Handle Google API errors
     */
    public function handleGoogleApiError(RequestException $exception): array
    {
        $response = $exception->getResponse();
        $statusCode = $response ? $response->getStatusCode() : 500;
        $body = $response ? $response->getBody()->getContents() : '';
        
        $errorData = json_decode($body, true);
        $googleError = $errorData['error'] ?? null;
        
        if ($googleError) {
            $errorCode = $googleError['code'] ?? 'google_api_error';
            $errorMessage = $googleError['message'] ?? 'Google API error';
            $errorDetails = $googleError['details'] ?? [];
            
            return $this->handleOAuthError(
                new Exception("Google API Error: {$errorMessage}", $statusCode),
                'Google API'
            );
        }

        return $this->handleOAuthError($exception, 'Google API');
    }

    /**
     * Handle N8N API errors
     */
    public function handleN8nApiError(RequestException $exception): array
    {
        $response = $exception->getResponse();
        $statusCode = $response ? $response->getStatusCode() : 500;
        $body = $response ? $response->getBody()->getContents() : '';
        
        $errorData = json_decode($body, true);
        
        if (isset($errorData['message'])) {
            return $this->handleOAuthError(
                new Exception("N8N API Error: {$errorData['message']}", $statusCode),
                'N8N API'
            );
        }

        return $this->handleOAuthError($exception, 'N8N API');
    }

    /**
     * Handle database errors
     */
    public function handleDatabaseError(Exception $exception): array
    {
        $errorCode = 'database_connection_failed';
        
        if (str_contains($exception->getMessage(), 'connection')) {
            $errorCode = 'database_connection_failed';
        } elseif (str_contains($exception->getMessage(), 'insert')) {
            $errorCode = 'credential_storage_failed';
        } elseif (str_contains($exception->getMessage(), 'select')) {
            $errorCode = 'credential_retrieval_failed';
        } elseif (str_contains($exception->getMessage(), 'update')) {
            $errorCode = 'credential_update_failed';
        }

        return $this->handleOAuthError($exception, 'Database');
    }

    /**
     * Handle network errors
     */
    public function handleNetworkError(Exception $exception): array
    {
        $errorCode = 'network_timeout';
        
        if ($exception instanceof ConnectException) {
            $errorCode = 'network_unreachable';
        } elseif (str_contains($exception->getMessage(), 'timeout')) {
            $errorCode = 'network_timeout';
        } elseif (str_contains($exception->getMessage(), 'DNS')) {
            $errorCode = 'dns_resolution_failed';
        } elseif (str_contains($exception->getMessage(), 'SSL')) {
            $errorCode = 'ssl_certificate_error';
        }

        return $this->handleOAuthError($exception, 'Network');
    }

    /**
     * Determine error code dari exception
     */
    protected function determineErrorCode(Exception $exception): string
    {
        $message = $exception->getMessage();
        $code = $exception->getCode();

        // Check untuk specific error patterns
        foreach ($this->errorCodes as $errorCode => $description) {
            if (str_contains(strtolower($message), str_replace('_', ' ', $errorCode))) {
                return $errorCode;
            }
        }

        // Check untuk HTTP status codes
        if ($code >= 400 && $code < 500) {
            return match($code) {
                400 => 'invalid_request',
                401 => 'invalid_credentials',
                403 => 'access_denied',
                404 => 'invalid_request',
                429 => 'rate_limit_exceeded',
                default => 'invalid_request'
            };
        }

        if ($code >= 500) {
            return 'server_error';
        }

        // Default error code
        return 'server_error';
    }

    /**
     * Get user-friendly message
     */
    protected function getUserFriendlyMessage(string $errorCode): string
    {
        return $this->userFriendlyMessages[$errorCode] ?? 'An unexpected error occurred. Please try again.';
    }

    /**
     * Get technical message untuk logging
     */
    protected function getTechnicalMessage(Exception $exception): string
    {
        return $exception->getMessage() . ' (File: ' . $exception->getFile() . ', Line: ' . $exception->getLine() . ')';
    }

    /**
     * Check if error is retryable
     */
    protected function isRetryableError(string $errorCode): bool
    {
        return in_array($errorCode, $this->retryableErrors);
    }

    /**
     * Calculate retry after time
     */
    protected function calculateRetryAfter(Exception $exception): ?int
    {
        $code = $exception->getCode();
        
        return match($code) {
            429 => 60, // Rate limit - wait 1 minute
            503 => 300, // Service unavailable - wait 5 minutes
            500, 502, 504 => 30, // Server errors - wait 30 seconds
            default => $this->isRetryableError($this->determineErrorCode($exception)) ? 30 : null
        };
    }

    /**
     * Log error dengan context
     */
    protected function logError(Exception $exception, string $context, string $errorCode, string $technicalMessage): void
    {
        Log::error("OAuth Error in {$context}", [
            'error_code' => $errorCode,
            'technical_message' => $technicalMessage,
            'context' => $context,
            'exception_class' => get_class($exception),
            'file' => $exception->getFile(),
            'line' => $exception->getLine(),
            'trace' => $exception->getTraceAsString(),
        ]);
    }

    /**
     * Store error metrics untuk analytics
     */
    protected function storeErrorMetrics(string $errorCode, string $context): void
    {
        $key = "oauth_errors:{$errorCode}:{$context}:" . now()->format('Y-m-d-H');
        Cache::increment($key, 1);
        Cache::expire($key, 86400); // 24 hours
    }

    /**
     * Get error suggestions
     */
    protected function getErrorSuggestions(string $errorCode): array
    {
        return match($errorCode) {
            'invalid_credentials', 'token_expired', 'refresh_token_expired' => [
                'Reconnect your Google account',
                'Check your Google account permissions',
                'Ensure your Google account is active'
            ],
            'quota_exceeded', 'rate_limit_exceeded' => [
                'Wait a few minutes before trying again',
                'Check your Google API quota limits',
                'Contact support if the issue persists'
            ],
            'access_denied', 'insufficient_permissions' => [
                'Grant the required permissions',
                'Check your Google account settings',
                'Ensure you have the necessary access rights'
            ],
            'network_timeout', 'network_unreachable' => [
                'Check your internet connection',
                'Try again in a few moments',
                'Contact your network administrator if the issue persists'
            ],
            'n8n_connection_failed', 'n8n_credential_creation_failed' => [
                'Check N8N server status',
                'Verify N8N configuration',
                'Contact support for assistance'
            ],
            default => [
                'Try again in a few moments',
                'Contact support if the issue persists'
            ]
        };
    }

    /**
     * Get error statistics
     */
    public function getErrorStatistics(string $context = null, int $hours = 24): array
    {
        $pattern = $context ? "oauth_errors:*:{$context}:*" : "oauth_errors:*:*:*";
        $keys = Cache::getRedis()->keys($pattern);
        
        $statistics = [];
        foreach ($keys as $key) {
            $count = Cache::get($key, 0);
            $parts = explode(':', $key);
            $errorCode = $parts[1] ?? 'unknown';
            $context = $parts[2] ?? 'unknown';
            
            if (!isset($statistics[$errorCode])) {
                $statistics[$errorCode] = [
                    'error_code' => $errorCode,
                    'total_count' => 0,
                    'contexts' => []
                ];
            }
            
            $statistics[$errorCode]['total_count'] += $count;
            $statistics[$errorCode]['contexts'][$context] = $count;
        }
        
        return array_values($statistics);
    }

    /**
     * Clear error statistics
     */
    public function clearErrorStatistics(): void
    {
        $keys = Cache::getRedis()->keys("oauth_errors:*");
        foreach ($keys as $key) {
            Cache::forget($key);
        }
    }
}
