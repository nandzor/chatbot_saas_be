<?php

namespace App\Services\Http\Exceptions;

use Exception;

class HttpClientException extends Exception
{
    protected int $statusCode;
    protected array $responseData;

    public function __construct(string $message, int $statusCode = 0, array $responseData = [], Exception $previous = null)
    {
        parent::__construct($message, 0, $previous);
        $this->statusCode = $statusCode;
        $this->responseData = $responseData;
    }

    public function getStatusCode(): int
    {
        return $this->statusCode;
    }

    public function getResponseData(): array
    {
        return $this->responseData;
    }
}
