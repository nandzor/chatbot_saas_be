<?php

use App\Http\Controllers\Api\V1\GoogleDriveController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Google Drive API Routes
|--------------------------------------------------------------------------
|
| Routes untuk mengelola file di Google Drive menggunakan OAuth credentials
|
*/

Route::prefix('drive')->middleware(['unified.auth', 'permission:automations.manage', 'organization'])->group(function () {

    // OAuth status
    Route::get('/status', [GoogleDriveController::class, 'getOAuthStatus']);

    // File management
    Route::get('/files', [GoogleDriveController::class, 'getFiles']);
    Route::get('/files/{fileId}', [GoogleDriveController::class, 'getFileDetails']);
    Route::post('/files', [GoogleDriveController::class, 'createFile']);
    Route::put('/files/{fileId}', [GoogleDriveController::class, 'updateFile']);
    Route::delete('/files/{fileId}', [GoogleDriveController::class, 'deleteFile']);
    Route::get('/files/{fileId}/download', [GoogleDriveController::class, 'downloadFile']);

    // Search and storage
    Route::get('/search', [GoogleDriveController::class, 'searchFiles']);
    Route::get('/storage', [GoogleDriveController::class, 'getStorageInfo']);

});
