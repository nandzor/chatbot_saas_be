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

        if (!$user) {
            return response('Unauthorized', 401);
        }

        // Fast channel authorization
        $channelName = $request->channel_name;
        if (!ReverbAuthManager::authorizeChannel($user, $channelName)) {
            return response('Forbidden', 403);
        }

        // Generate auth signature efficiently
        $socketId = $request->socket_id;
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
