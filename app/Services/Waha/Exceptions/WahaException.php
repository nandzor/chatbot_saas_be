<?php

namespace App\Services\Waha\Exceptions;

use App\Services\Http\Exceptions\HttpClientException;

class WahaException extends HttpClientException
{
    public static function sessionNotFound(string $sessionId): self
    {
        return new self("WAHA session '{$sessionId}' not found", 404);
    }

    public static function sessionAlreadyExists(string $sessionId): self
    {
        return new self("WAHA session '{$sessionId}' already exists", 409);
    }

    public static function sessionNotConnected(string $sessionId): self
    {
        return new self("WAHA session '{$sessionId}' is not connected", 400);
    }

    public static function invalidPhoneNumber(string $phoneNumber): self
    {
        return new self("Invalid phone number format: {$phoneNumber}", 400);
    }

    public static function messageSendFailed(string $reason): self
    {
        return new self("Failed to send message: {$reason}", 500);
    }

    public static function qrCodeExpired(): self
    {
        return new self("QR code has expired", 410);
    }

    public static function rateLimitExceeded(): self
    {
        return new self("Rate limit exceeded", 429);
    }
}
