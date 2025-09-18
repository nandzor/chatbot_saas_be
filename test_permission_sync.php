<?php

require_once __DIR__ . '/vendor/autoload.php';

use App\Services\PermissionSyncService;
use App\Models\User;

// Bootstrap Laravel
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "🔄 Testing Permission Sync System\n";
echo "================================\n\n";

try {
    $syncService = new PermissionSyncService();

    // Test 1: Get sync statistics
    echo "📊 Getting sync statistics...\n";
    $stats = $syncService->getSyncStatistics();
    echo "Total users: {$stats['total_users']}\n";
    echo "Needs sync: {$stats['needs_sync']}\n";
    echo "Up to date: {$stats['up_to_date']}\n";
    echo "Errors: {$stats['errors']}\n\n";

    // Test 2: Find a user to test with
    $user = User::where('email', 'admin@test.com')->first();

    if (!$user) {
        echo "❌ User admin@test.com not found\n";
        exit(1);
    }

    echo "👤 Testing with user: {$user->email} (ID: {$user->id})\n\n";

    // Test 3: Compare user permissions
    echo "🔍 Comparing user permissions...\n";
    $comparison = $syncService->compareUserPermissions($user);

    echo "Current permissions: " . count($comparison['current_permissions']) . "\n";
    echo "Role permissions: " . count($comparison['role_permissions']) . "\n";
    echo "Added permissions: " . count($comparison['added_permissions']) . "\n";
    echo "Removed permissions: " . count($comparison['removed_permissions']) . "\n";
    echo "Needs sync: " . ($comparison['needs_sync'] ? 'Yes' : 'No') . "\n\n";

    if ($comparison['needs_sync']) {
        echo "Added permissions:\n";
        foreach ($comparison['added_permissions'] as $permission => $value) {
            echo "  ➕ {$permission}\n";
        }

        echo "\nRemoved permissions:\n";
        foreach ($comparison['removed_permissions'] as $permission => $value) {
            echo "  ➖ {$permission}\n";
        }
    }

    // Test 4: Sync user permissions (dry run)
    echo "\n🔄 Syncing user permissions (dry run)...\n";
    $result = $syncService->syncUserPermissions($user, false);

    if ($result['success']) {
        echo "✅ Sync completed successfully\n";
        echo "Permissions added: " . count($result['permissions_added']) . "\n";
        echo "Permissions removed: " . count($result['permissions_removed']) . "\n";
        echo "Total permissions: {$result['total_permissions']}\n";
    } else {
        echo "❌ Sync failed: {$result['error']}\n";
    }

    // Test 5: Sync by role
    echo "\n🔄 Testing sync by role (org_admin)...\n";
    $roleResult = $syncService->syncUsersByRole('org_admin', false);

    if ($roleResult['success']) {
        echo "✅ Role sync completed\n";
        echo "Users processed: {$roleResult['users_processed']}\n";
    } else {
        echo "❌ Role sync failed\n";
    }

    echo "\n✅ All tests completed successfully!\n";

} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
    exit(1);
}
