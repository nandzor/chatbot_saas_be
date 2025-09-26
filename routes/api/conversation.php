<?php

use App\Http\Controllers\Api\V1\ConversationController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Conversation API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register conversation API routes for your application.
| These routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware(['unified.auth', 'organization'])->group(function () {

    // Conversation management routes
    Route::prefix('conversations')->group(function () {

        // Get conversation details with messages
        Route::get('{sessionId}', [ConversationController::class, 'show'])
            ->name('conversations.show');

        // Get session messages with pagination
        Route::get('{sessionId}/messages', [ConversationController::class, 'getMessages'])
            ->name('conversations.messages');

        // Send a new message
        Route::post('{sessionId}/messages', [ConversationController::class, 'sendMessage'])
            ->name('conversations.send-message');

        // Update session details
        Route::put('{sessionId}', [ConversationController::class, 'updateSession'])
            ->name('conversations.update');

        // Assign session to current user
        Route::post('{sessionId}/assign', [ConversationController::class, 'assignToMe'])
            ->name('conversations.assign');

        // Transfer session to another agent
        Route::post('{sessionId}/transfer', [ConversationController::class, 'transferSession'])
            ->name('conversations.transfer');

        // Resolve/End session
        Route::post('{sessionId}/resolve', [ConversationController::class, 'resolveSession'])
            ->name('conversations.resolve');

        // Get session analytics
        Route::get('{sessionId}/analytics', [ConversationController::class, 'getAnalytics'])
            ->name('conversations.analytics');

        // Mark messages as read
        Route::post('{sessionId}/mark-read', [ConversationController::class, 'markAsRead'])
            ->name('conversations.mark-read');

        // Get typing indicators
        Route::get('{sessionId}/typing', [ConversationController::class, 'getTypingStatus'])
            ->name('conversations.typing-status');

        // Send typing indicator
        Route::post('{sessionId}/typing', [ConversationController::class, 'sendTypingIndicator'])
            ->name('conversations.send-typing');

        // Get conversation summary
        Route::get('{sessionId}/summary', [ConversationController::class, 'getConversationSummary'])
            ->name('conversations.summary');

        // Search messages in conversation
        Route::get('{sessionId}/search', [ConversationController::class, 'searchMessages'])
            ->name('conversations.search-messages');

        // Get unread message count
        Route::get('{sessionId}/unread-count', [ConversationController::class, 'getUnreadCount'])
            ->name('conversations.unread-count');

        // Get conversation with recent messages
        Route::get('{sessionId}/recent', [ConversationController::class, 'getConversationWithRecent'])
            ->name('conversations.recent');
    });
});
