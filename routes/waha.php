<?php

use App\Http\Controllers\Api\V1\WahaController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| WAHA API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register WAHA API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::prefix('v1/waha')->middleware(['unified.auth', 'permission:waha.view'])->group(function () {
    // Connection test
    Route::get('/connection/test', [WahaController::class, 'testConnection']);

    // Sessions
    Route::prefix('sessions')->group(function () {
        Route::get('/', [WahaController::class, 'getSessions']);
        Route::get('/{sessionId}', [WahaController::class, 'getSession']);
        Route::post('/{sessionId}/start', [WahaController::class, 'startSession']);
        Route::post('/{sessionId}/stop', [WahaController::class, 'stopSession']);
        Route::delete('/{sessionId}', [WahaController::class, 'deleteSession']);
    });

    // Messages
    Route::prefix('sessions/{sessionId}')->group(function () {
        Route::post('/send/text', [WahaController::class, 'sendTextMessage']);
        Route::get('/chats', [WahaController::class, 'getChats']);
        Route::get('/chats/{chatId}/messages', [WahaController::class, 'getMessages']);
        Route::get('/contacts', [WahaController::class, 'getContacts']);
    });
});
