<?php

namespace App\Services;

/**
 * Google OAuth User Service
 * Service untuk mengelola Google OAuth user data
 */
class GoogleOAuthUserService
{
    private array $userData;
    private array $tokenData;

    public function __construct(array $userData, array $tokenData)
    {
        $this->userData = $userData;
        $this->tokenData = $tokenData;
    }

    public function getId(): string
    {
        return $this->userData['id'];
    }

    public function getName(): string
    {
        return $this->userData['name'];
    }

    public function getEmail(): string
    {
        return $this->userData['email'];
    }

    public function getAvatar(): ?string
    {
        return $this->userData['picture'] ?? null;
    }

    public function getAccessToken(): string
    {
        return $this->tokenData['access_token'];
    }

    public function getRefreshToken(): ?string
    {
        return $this->tokenData['refresh_token'] ?? null;
    }

    public function getExpiresIn(): ?int
    {
        return $this->tokenData['expires_in'] ?? null;
    }

    public function getTokenType(): ?string
    {
        return $this->tokenData['token_type'] ?? null;
    }

    public function getScope(): ?string
    {
        return $this->tokenData['scope'] ?? null;
    }

    /**
     * Get all user data as array
     */
    public function toArray(): array
    {
        return [
            'id' => $this->getId(),
            'name' => $this->getName(),
            'email' => $this->getEmail(),
            'avatar' => $this->getAvatar(),
            'access_token' => $this->getAccessToken(),
            'refresh_token' => $this->getRefreshToken(),
            'expires_in' => $this->getExpiresIn(),
            'token_type' => $this->getTokenType(),
            'scope' => $this->getScope(),
        ];
    }
}
