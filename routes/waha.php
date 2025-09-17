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

Route::prefix('waha')->group(function () {
    // Connection test route
    Route::get('/test', [WahaController::class, 'testConnection']);

    // Session management routes
    Route::get('/sessions', [WahaController::class, 'getSessions']);
    Route::post('/sessions/{sessionId}/start', [WahaController::class, 'startSession']);
    Route::post('/sessions/{sessionId}/stop', [WahaController::class, 'stopSession']);
    Route::get('/sessions/{sessionId}/status', [WahaController::class, 'getSessionStatus']);
    Route::get('/sessions/{sessionId}/info', [WahaController::class, 'getSessionInfo']);
    Route::delete('/sessions/{sessionId}', [WahaController::class, 'deleteSession']);
    Route::get('/sessions/{sessionId}/qr', [WahaController::class, 'getQrCode']);

    // Message routes
    Route::post('/sessions/{sessionId}/send-text', [WahaController::class, 'sendTextMessage']);
    Route::post('/sessions/{sessionId}/send-media', [WahaController::class, 'sendMediaMessage']);
    Route::get('/sessions/{sessionId}/messages', [WahaController::class, 'getMessages']);

    // Contact and group routes
    Route::get('/sessions/{sessionId}/contacts', [WahaController::class, 'getContacts']);
    Route::get('/sessions/{sessionId}/groups', [WahaController::class, 'getGroups']);

    // Health and status routes
    Route::get('/sessions/{sessionId}/connected', [WahaController::class, 'isSessionConnected']);
    Route::get('/sessions/{sessionId}/health', [WahaController::class, 'getSessionHealth']);
});
