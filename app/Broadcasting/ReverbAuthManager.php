<?php

namespace App\Broadcasting;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ReverbAuthManager
{
    /**
     * Authenticate user for Reverb WebSocket connection (optimized)
     */
    public static function authenticate(Request $request): ?object
    {
        $token = $request->bearerToken();
        if (!$token) {
            \Log::warning('No bearer token provided for Reverb authentication');
            return null;
        }

        try {
            // Try JWT authentication first (faster)
            if (self::isJwtToken($token)) {
                $user = self::authenticateJwt($token);
                if ($user) {
                    \Log::info('JWT authentication successful', ['user_id' => $user->id]);
                    return $user;
                }
            }

            // Fallback to Sanctum
            $user = self::authenticateSanctum($request);
            if ($user) {
                \Log::info('Sanctum authentication successful', ['user_id' => $user->id]);
            }
            return $user;
        } catch (\Exception $e) {
            \Log::error('Authentication failed', [
                'error' => $e->getMessage(),
                'token_preview' => substr($token, 0, 20) . '...'
            ]);
            return null;
        }
    }

    /**
     * Check if token looks like JWT
     */
    private static function isJwtToken(string $token): bool
    {
        return substr_count($token, '.') === 2;
    }

    /**
     * Authenticate with JWT
     */
    private static function authenticateJwt(string $token): ?object
    {
        try {
            $payload = \Tymon\JWTAuth\Facades\JWTAuth::setToken($token)->getPayload();
            $userId = $payload->get('sub');
            return \App\Models\User::find($userId);
        } catch (\Exception $e) {
            return null;
        }
    }

    /**
     * Authenticate with Sanctum
     */
    private static function authenticateSanctum(Request $request): ?object
    {
        try {
            return Auth::guard('sanctum')->user();
        } catch (\Exception $e) {
            return null;
        }
    }

    /**
     * Check if user can access the given channel (optimized)
     */
    public static function authorizeChannel($user, string $channelName): bool
    {
        if (!$user) return false;

        // Use match expression for better performance
        return match (true) {
            str_starts_with($channelName, 'private-organization.') =>
                self::authorizeOrganizationChannel($user, $channelName),

            str_starts_with($channelName, 'private-conversation.') =>
                self::authorizeConversationChannel($user, $channelName),

            str_starts_with($channelName, 'private-inbox.') =>
                self::authorizeInboxChannel($user, $channelName),

            default => true // Public channels
        };
    }

    /**
     * Authorize organization channel access
     */
    private static function authorizeOrganizationChannel($user, string $channelName): bool
    {
        $organizationId = substr($channelName, strlen('private-organization.'));
        return (string) $user->organization_id === $organizationId;
    }

    /**
     * Authorize conversation channel access
     */
    private static function authorizeConversationChannel($user, string $channelName): bool
    {
        $sessionId = substr($channelName, strlen('private-conversation.'));

        // Check if user has access to this conversation session
        try {
            $session = \App\Models\InboxSession::find($sessionId);
            if (!$session) {
                \Log::warning('Conversation session not found', ['session_id' => $sessionId]);
                return false;
            }

            // Check if user belongs to the same organization as the session
            return (string) $user->organization_id === (string) $session->organization_id;
        } catch (\Exception $e) {
            \Log::error('Error authorizing conversation channel', [
                'error' => $e->getMessage(),
                'session_id' => $sessionId,
                'user_id' => $user->id
            ]);
            return false;
        }
    }

    /**
     * Authorize inbox channel access
     */
    private static function authorizeInboxChannel($user, string $channelName): bool
    {
        $organizationId = substr($channelName, strlen('private-inbox.'));
        return (string) $user->organization_id === $organizationId;
    }
}
