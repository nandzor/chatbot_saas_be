# Permission Synchronization System

Sistem sinkronisasi permission antara `role_permissions` table dengan field `permissions` di table `users`.

## Overview

Sistem ini memungkinkan sinkronisasi otomatis dan manual antara:
- **Source**: `role_permissions` table (melalui relasi roles)
- **Target**: `user.permissions` JSONB field

## Komponen Sistem

### 1. Artisan Command
```bash
# Sync specific user
php artisan permissions:sync-user --user-id=123

# Sync all users with specific role
php artisan permissions:sync-user --role=org_admin

# Sync all users
php artisan permissions:sync-user --all

# Dry run (show changes without applying)
php artisan permissions:sync-user --all --dry-run
```

### 2. API Endpoints

#### Sync User Permissions
```http
POST /api/v1/permissions/sync/user/{userId}
Content-Type: application/json

{
    "force": true
}
```

#### Sync by Role
```http
POST /api/v1/permissions/sync/role
Content-Type: application/json

{
    "role": "org_admin",
    "force": true
}
```

#### Sync All Users
```http
POST /api/v1/permissions/sync/all
Content-Type: application/json

{
    "force": true
}
```

#### Compare User Permissions
```http
GET /api/v1/permissions/sync/user/{userId}/compare
```

#### Get Sync Statistics
```http
GET /api/v1/permissions/sync/statistics
```

### 3. Service Class Usage

```php
use App\Services\PermissionSyncService;

$syncService = new PermissionSyncService();

// Sync specific user
$result = $syncService->syncUserPermissions($user, $force = false);

// Sync users by role
$result = $syncService->syncUsersByRole('org_admin', $force = false);

// Sync all users
$result = $syncService->syncAllUsers($force = false);

// Compare permissions
$comparison = $syncService->compareUserPermissions($user);

// Get statistics
$stats = $syncService->getSyncStatistics();
```

## Alur Sinkronisasi

### 1. **Auto-Sync (Observer)**
- Triggered ketika user dibuat atau role diubah
- Otomatis sync permissions dari roles ke user.permissions

### 2. **Manual Sync (Command/API)**
- Sync specific user
- Sync by role
- Sync all users
- Dry run mode untuk preview changes

### 3. **Permission Resolution Priority**
1. **Direct permissions** (user.permissions) - checked first
2. **Role permissions** (role_permissions table) - fallback
3. **Super admin** - has all permissions

## Contoh Penggunaan

### Sync User Specific
```bash
# Sync user dengan ID 123
php artisan permissions:sync-user --user-id=123

# Dry run untuk melihat perubahan
php artisan permissions:sync-user --user-id=123 --dry-run
```

### Sync by Role
```bash
# Sync semua user dengan role org_admin
php artisan permissions:sync-user --role=org_admin
```

### Sync All Users
```bash
# Sync semua user di sistem
php artisan permissions:sync-user --all
```

### API Usage
```javascript
// Sync user permissions via API
const response = await fetch('/api/v1/permissions/sync/user/123', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
    },
    body: JSON.stringify({
        force: true
    })
});

const result = await response.json();
console.log(result);
```

## Monitoring dan Statistics

### Get Sync Statistics
```http
GET /api/v1/permissions/sync/statistics
```

Response:
```json
{
    "success": true,
    "data": {
        "total_users": 150,
        "needs_sync": 5,
        "up_to_date": 145,
        "errors": 0
    }
}
```

### Compare User Permissions
```http
GET /api/v1/permissions/sync/user/123/compare
```

Response:
```json
{
    "success": true,
    "data": {
        "user_id": 123,
        "email": "admin@test.com",
        "current_permissions": {
            "knowledge_base.view": true,
            "organizations.view": true
        },
        "role_permissions": {
            "knowledge_base.view": true,
            "knowledge_base.create": true,
            "organizations.view": true
        },
        "added_permissions": {
            "knowledge_base.create": true
        },
        "removed_permissions": {},
        "unchanged_permissions": {
            "knowledge_base.view": true,
            "organizations.view": true
        },
        "needs_sync": true
    }
}
```

## Error Handling

Sistem ini memiliki error handling yang komprehensif:
- Log semua operasi sync
- Return detailed error messages
- Continue processing meskipun ada error pada user tertentu
- Statistics untuk monitoring

## Best Practices

1. **Regular Sync**: Jalankan sync secara berkala untuk memastikan data konsisten
2. **Dry Run**: Selalu gunakan `--dry-run` untuk preview changes
3. **Monitoring**: Monitor statistics untuk mendeteksi inconsistencies
4. **Backup**: Backup database sebelum melakukan bulk sync
5. **Testing**: Test di environment development terlebih dahulu

## Troubleshooting

### Permission tidak tersync
1. Check apakah role memiliki permissions di `role_permissions` table
2. Check apakah user memiliki role yang benar
3. Check logs untuk error messages

### Sync lambat
1. Gunakan `--dry-run` untuk preview
2. Sync per role instead of all users
3. Check database performance

### API errors
1. Check authentication token
2. Check permission requirements
3. Check request payload format
