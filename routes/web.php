<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\LogViewerController;

Route::get('/', function () {
    return view('welcome');
});

/*
|--------------------------------------------------------------------------
| Log Viewer Web Routes
|--------------------------------------------------------------------------
|
| These routes are for the Laravel Log Viewer functionality.
| They provide web endpoints to view, download, and manage log files.
|
*/

// Log Viewer Web Interface
Route::prefix('logs')->group(function () {

    // Main log viewer page
    Route::get('/', [LogViewerController::class, 'index'])->name('logs.index');

    // Handle log operations (delete, etc.)
    Route::any('/handle', [LogViewerController::class, 'handle'])->name('logs.handle');

});

// Public routes for testing (remove in production)
Route::prefix('logs')->group(function () {

    // Public log viewer page
    Route::get('/public', [LogViewerController::class, 'index'])->name('logs.public.index');

});
