<?php

use App\Http\Controllers\Api\V1\WahaController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| WAHA API Routes
|--------------------------------------------------------------------------
|
| Here are the routes for WAHA (WhatsApp HTTP API) integration.
| These routes provide endpoints to manage WhatsApp sessions,
| send messages, and handle WhatsApp-related operations.
|
*/

Route::prefix('waha')->middleware(['unified.auth', 'waha.organization'])->group(function () {
    // Connection test route
    Route::get('/test', [WahaController::class, 'testConnection']);

    // Session management routes
    Route::get('/sessions', [WahaController::class, 'getSessions']);
    Route::post('/sessions/create', [WahaController::class, 'createSession']);
    Route::post('/sessions/{sessionId}/start', [WahaController::class, 'startSession']);
    Route::post('/sessions/{sessionId}/stop', [WahaController::class, 'stopSession']);
    Route::get('/sessions/{sessionId}/status', [WahaController::class, 'getSessionStatus']);
    Route::get('/sessions/{sessionId}/info', [WahaController::class, 'getSessionInfo']);
    Route::delete('/sessions/{sessionName}', [WahaController::class, 'deleteSession']);
    Route::get('/sessions/{sessionId}/qr', [WahaController::class, 'getQrCode']);
    Route::post('/sessions/{sessionId}/qr/regenerate', [WahaController::class, 'regenerateQrCode']);

    // Message routes
    Route::post('/sessions/{sessionId}/send-text', [WahaController::class, 'sendTextMessage']);
    Route::post('/sessions/{sessionId}/send-media', [WahaController::class, 'sendMediaMessage']);
    Route::get('/sessions/{sessionId}/messages', [WahaController::class, 'getMessages']);

    // Chat list and overview routes
    Route::get('/sessions/{sessionId}/chats', [WahaController::class, 'getChatList']);
    Route::get('/sessions/{sessionId}/chats/overview', [WahaController::class, 'getChatOverview']);
    Route::get('/sessions/{sessionId}/chats/{contactId}/profile-picture', [WahaController::class, 'getProfilePicture']);
    Route::get('/sessions/{sessionId}/chats/{contactId}/messages', [WahaController::class, 'getChatMessages']);
    Route::post('/sessions/{sessionId}/chats/{contactId}/send-message', [WahaController::class, 'sendChatMessage']);

    // Contact and group routes
    Route::get('/sessions/{sessionId}/contacts', [WahaController::class, 'getContacts']);
    Route::get('/sessions/{sessionId}/groups', [WahaController::class, 'getGroups']);

    // Health and status routes
    Route::get('/sessions/{sessionId}/connected', [WahaController::class, 'isSessionConnected']);
    Route::get('/sessions/{sessionId}/health', [WahaController::class, 'getSessionHealth']);
    Route::post('/sessions/{sessionId}/sync', [WahaController::class, 'syncSessionStatus']);

    // Webhook management routes
    Route::get('/sessions/{sessionId}/webhook', [WahaController::class, 'getWebhookConfig']);
    Route::post('/sessions/{sessionId}/webhook', [WahaController::class, 'configureWebhook']);
    Route::put('/sessions/{sessionId}/webhook', [WahaController::class, 'updateWebhookConfig']);

    // Webhook routes (no authentication required for WAHA server callbacks)
    Route::post('/webhook/{sessionName}', [WahaController::class, 'handleWebhook'])->withoutMiddleware(['unified.auth', 'waha.organization']);
    Route::post('/webhook/{sessionName}/message', [WahaController::class, 'handleMessageWebhook'])->withoutMiddleware(['unified.auth', 'waha.organization']);
});
