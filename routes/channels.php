<?php

use Illuminate\Support\Facades\Broadcast;

/*
|--------------------------------------------------------------------------
| Broadcast Channels
|--------------------------------------------------------------------------
|
| Here you may register all of the event broadcasting channels that your
| application supports. The given channel authorization callbacks are
| used to check if an authenticated user can listen to the channel.
|
*/

// User-specific channel
Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

// Organization-specific channels (both public and private)
Broadcast::channel('organization.{organizationId}', function ($user, $organizationId) {
    // Check if user belongs to this organization (handle string/UUID comparison)
    return (string) $user->organization_id === (string) $organizationId;
});

Broadcast::channel('private-organization.{organizationId}', function ($user, $organizationId) {

    // Check if user belongs to this organization (handle string/UUID comparison)
    return (string) $user->organization_id === (string) $organizationId;
});

// Conversation-specific channels (within organization)
Broadcast::channel('conversation.{conversationId}', function ($user, $conversationId) {
    // You can add more specific logic here to check if user has access to this conversation
    // For now, we'll allow if user is authenticated and belongs to an organization
    return $user && $user->organization_id;
});

Broadcast::channel('private-conversation.{conversationId}', function ($user, $conversationId) {
    // You can add more specific logic here to check if user has access to this conversation
    // For now, we'll allow if user is authenticated and belongs to an organization
    return $user && $user->organization_id;
});

// Inbox channels (organization-scoped)
Broadcast::channel('inbox.{organizationId}', function ($user, $organizationId) {
    return (string) $user->organization_id === (string) $organizationId;
});

Broadcast::channel('private-inbox.{organizationId}', function ($user, $organizationId) {
    return (string) $user->organization_id === (string) $organizationId;
});

// Private user channels
Broadcast::channel('private.user.{userId}', function ($user, $userId) {
    return (int) $user->id === (int) $userId;
});
