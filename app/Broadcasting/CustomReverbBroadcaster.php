<?php

namespace App\Broadcasting;

use Illuminate\Broadcasting\Broadcasters\PusherBroadcaster;
use Illuminate\Http\Request;
use App\Broadcasting\ReverbAuthManager;

class CustomReverbBroadcaster extends PusherBroadcaster
{
    /**
     * Authenticate the incoming request for the given channel (optimized)
     */
    public function auth($request)
    {
        // Fast authentication using optimized auth manager
        $user = ReverbAuthManager::authenticate($request);

        // Debug logging (simplified)
        \Log::info('Broadcasting auth request', [
            'channel_name' => $request->input('channel_name') ?: $request->channel_name,
            'socket_id' => $request->input('socket_id') ?: $request->socket_id,
            'user_id' => $user->id ?? 'unknown'
        ]);

        if (!$user) {
            return response('Unauthorized', 401);
        }

        // Fast channel authorization
        // Handle both JSON and form-encoded requests
        $channelName = $request->input('channel_name') ?: $request->channel_name;
        $socketId = $request->input('socket_id') ?: $request->socket_id;

        // If still null, try parsing raw content manually
        if (!$channelName || !$socketId) {
            $rawContent = $request->getContent();
            if ($rawContent) {
                parse_str($rawContent, $parsedData);
                $channelName = $channelName ?: ($parsedData['channel_name'] ?? null);
                $socketId = $socketId ?: ($parsedData['socket_id'] ?? null);
            }
        }

        if (!$channelName || !$socketId) {
            \Log::warning('Missing channel_name or socket_id in broadcasting auth', [
                'channel_name' => $channelName,
                'socket_id' => $socketId,
                'request_data' => $request->all(),
                'user_id' => $user->id
            ]);
            return response('Channel name and socket ID required', 400);
        }

        if (!ReverbAuthManager::authorizeChannel($user, $channelName)) {
            return response('Forbidden', 403);
        }

        // Generate auth signature efficiently
        $authString = $socketId . ':' . $channelName;
        $secret = config('broadcasting.connections.reverb.secret');
        $key = config('broadcasting.connections.reverb.key');
        $authSignature = hash_hmac('sha256', $authString, $secret);

        return response()->json([
            'auth' => $key . ':' . $authSignature,
            'channel_data' => null
        ]);
    }
}
