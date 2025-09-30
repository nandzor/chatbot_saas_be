<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Api\BaseApiController;

class BroadcastingController extends BaseApiController
{
    /**
     * Authenticate the request for channel access.
     */
    public function authenticate(Request $request)
    {

        // Use our unified auth middleware to get the authenticated user
        $user = $request->user();

        if (!$user) {
            return $this->unauthorizedResponse(
                'No valid authentication token provided'
            );
        }

        $channelName = $request->input('channel_name');
        $socketId = $request->input('socket_id');


        // Check channel authorization based on our custom logic
        if (str_starts_with($channelName, 'private-organization.')) {
            $organizationId = str_replace('private-organization.', '', $channelName);

            // Check if user belongs to this organization
            if ((string) $user->organization_id !== (string) $organizationId) {
                return $this->forbiddenResponse(
                    'Access denied to this channel'
                );
            }
        }

        // Generate auth signature for Reverb
        $authString = $socketId . ':' . $channelName;
        $authSignature = hash_hmac('sha256', $authString, config('broadcasting.connections.reverb.secret'));

        $authResponse = [
            'auth' => config('broadcasting.connections.reverb.key') . ':' . $authSignature,
            'channel_data' => null
        ];


        return $this->successResponse(
            'Channel authentication successful',
            $authResponse
        );
    }
}
