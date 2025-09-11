<?php

namespace App\Services\Http;

use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Services\Http\Exceptions\HttpClientException;
use Exception;

abstract class BaseHttpClient
{
    protected string $baseUrl;
    protected array $defaultHeaders = [];
    protected int $timeout = 30;
    protected int $retryAttempts = 3;
    protected int $retryDelay = 1000; // milliseconds
    protected bool $logRequests = true;
    protected bool $logResponses = true;

    public function __construct(string $baseUrl, array $config = [])
    {
        $this->baseUrl = rtrim($baseUrl, '/');
        $this->configure($config);
    }

    protected function configure(array $config): void
    {
        $this->timeout = $config['timeout'] ?? $this->timeout;
        $this->retryAttempts = $config['retry_attempts'] ?? $this->retryAttempts;
        $this->retryDelay = $config['retry_delay'] ?? $this->retryDelay;
        $this->logRequests = $config['log_requests'] ?? $this->logRequests;
        $this->logResponses = $config['log_responses'] ?? $this->logResponses;
        $this->defaultHeaders = array_merge($this->defaultHeaders, $config['headers'] ?? []);
    }

    protected function makeRequest(string $method, string $endpoint, array $data = [], array $headers = []): Response
    {
        $url = $this->baseUrl . '/' . ltrim($endpoint, '/');
        $requestHeaders = array_merge($this->defaultHeaders, $headers);

        if ($this->logRequests) {
            Log::info("HTTP Request: {$method} {$url}", [
                'headers' => $requestHeaders,
                'data' => $data,
                'service' => static::class
            ]);
        }

        $attempt = 0;
        $lastException = null;

        while ($attempt < $this->retryAttempts) {
            try {
                $response = Http::timeout($this->timeout)
                    ->withHeaders($requestHeaders)
                    ->{strtolower($method)}($url, $data);

                if ($this->logResponses) {
                    Log::info("HTTP Response: {$method} {$url}", [
                        'status' => $response->status(),
                        'body' => $response->body(),
                        'service' => static::class
                    ]);
                }

                return $response;

            } catch (Exception $e) {
                $lastException = $e;
                $attempt++;

                if ($attempt < $this->retryAttempts) {
                    Log::warning("HTTP Request failed, retrying...", [
                        'attempt' => $attempt,
                        'error' => $e->getMessage(),
                        'url' => $url,
                        'service' => static::class
                    ]);

                    usleep($this->retryDelay * 1000); // Convert to microseconds
                }
            }
        }

        Log::error("HTTP Request failed after {$this->retryAttempts} attempts", [
            'url' => $url,
            'error' => $lastException?->getMessage(),
            'service' => static::class
        ]);

        throw new HttpClientException(
            "HTTP request failed after {$this->retryAttempts} attempts: " . ($lastException?->getMessage() ?? 'Unknown error'),
            0,
            [],
            $lastException
        );
    }

    protected function get(string $endpoint, array $query = [], array $headers = []): Response
    {
        return $this->makeRequest('GET', $endpoint, $query, $headers);
    }

    protected function post(string $endpoint, array $data = [], array $headers = []): Response
    {
        return $this->makeRequest('POST', $endpoint, $data, $headers);
    }

    protected function put(string $endpoint, array $data = [], array $headers = []): Response
    {
        return $this->makeRequest('PUT', $endpoint, $data, $headers);
    }

    protected function delete(string $endpoint, array $data = [], array $headers = []): Response
    {
        return $this->makeRequest('DELETE', $endpoint, $data, $headers);
    }

    protected function handleResponse(Response $response, string $operation = 'request'): array
    {
        if ($response->successful()) {
            return $response->json() ?? [];
        }

        $errorMessage = "HTTP {$response->status()} error during {$operation}";
        $errorData = $response->json() ?? ['message' => $response->body()];

        Log::error($errorMessage, [
            'status' => $response->status(),
            'error' => $errorData,
            'service' => static::class
        ]);

        throw new HttpClientException(
            $errorMessage . ': ' . ($errorData['message'] ?? $response->body()),
            $response->status(),
            $errorData
        );
    }
}
