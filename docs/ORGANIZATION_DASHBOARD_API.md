# Organization Dashboard API Documentation

## Overview
API endpoints untuk Organization Administrator Dashboard yang menyediakan data analytics dan metrics untuk organisasi.

## Base URL
```
/api/v1/organization-dashboard
```

## Authentication
Semua endpoint memerlukan authentication dan permission `analytics.view`.

## Endpoints

### 1. Dashboard Overview
**GET** `/overview`

Mengembalikan data overview dashboard termasuk metrics utama, distribusi session, dan analisis intent.

#### Parameters
- `date_from` (optional): Tanggal mulai (format: Y-m-d H:i:s)
- `date_to` (optional): Tanggal akhir (format: Y-m-d H:i:s)

#### Response
```json
{
  "success": true,
  "message": "Organization dashboard overview retrieved successfully",
  "data": {
    "overview": {
      "total_sessions_today": 31,
      "sessions_change_percentage": 933.3,
      "avg_satisfaction": 0,
      "handover_count": 2,
      "handover_percentage": 6.5,
      "active_agents": 0,
      "total_agents": 2,
      "active_agents_percentage": 0
    },
    "session_distribution": {
      "bot_sessions": 25,
      "agent_sessions": 6,
      "bot_percentage": 80.6,
      "agent_percentage": 19.4
    },
    "session_distribution_over_time": [
      {
        "time": "00:00",
        "bot": 0,
        "agent": 0
      }
    ],
    "intent_analysis": [
      {
        "intent": "Customer Support",
        "count": 15,
        "percentage": 48.4,
        "trend": "↗"
      }
    ],
    "period": {
      "from": "2025-09-26T00:00:00.000000Z",
      "to": "2025-09-26T22:32:40.000000Z"
    }
  }
}
```

### 2. Real-time Metrics
**GET** `/realtime`

Mengembalikan metrics real-time untuk dashboard.

#### Response
```json
{
  "success": true,
  "message": "Real-time metrics retrieved successfully",
  "data": {
    "active_sessions": 5,
    "recent_sessions": 2,
    "online_agents": 1,
    "timestamp": "2025-09-26T22:32:40.000000Z"
  }
}
```

### 3. Session Distribution Chart
**GET** `/session-distribution`

Mengembalikan data untuk chart distribusi session bot vs agent.

#### Parameters
- `period` (optional): Periode data - `24h`, `7d`, `30d` (default: `24h`)

#### Response
```json
{
  "success": true,
  "message": "Session distribution chart data retrieved successfully",
  "data": {
    "labels": ["00:00", "01:00", "02:00"],
    "datasets": [
      {
        "label": "Bot Sessions",
        "data": [0, 1, 2],
        "backgroundColor": "rgba(59, 130, 246, 0.1)",
        "borderColor": "rgba(59, 130, 246, 1)",
        "borderWidth": 2
      },
      {
        "label": "Agent Sessions",
        "data": [0, 0, 1],
        "backgroundColor": "rgba(34, 197, 94, 0.1)",
        "borderColor": "rgba(34, 197, 94, 1)",
        "borderWidth": 2
      }
    ],
    "period": "24h"
  }
}
```

### 4. Export Data
**POST** `/export`

Export data dashboard ke format yang ditentukan.

#### Request Body
```json
{
  "format": "csv|excel|pdf",
  "date_from": "2025-09-26",
  "date_to": "2025-09-26",
  "data_types": ["overview", "sessions", "intents"]
}
```

#### Response
```json
{
  "success": true,
  "message": "Data exported successfully",
  "data": {
    "download_url": "/downloads/export_12345.csv",
    "expires_at": "2025-09-27T22:32:40.000000Z"
  }
}
```

## Error Responses

### 403 Forbidden
```json
{
  "success": false,
  "message": "No organization found for current user",
  "error_code": "NO_ORGANIZATION_ERROR",
  "errors": ["User must be associated with an organization"]
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Failed to retrieve organization dashboard overview",
  "error_code": "DASHBOARD_OVERVIEW_ERROR",
  "errors": ["Database error message"]
}
```

## Frontend Integration

### API Service Usage
```javascript
import { organizationDashboardApi } from '@/api/BaseApiService';

// Get overview data
const overviewData = await organizationDashboardApi.getOverview({
  date_from: '2025-09-26',
  date_to: '2025-09-26'
});

// Get real-time data
const realtimeData = await organizationDashboardApi.getRealtime();

// Get session distribution
const chartData = await organizationDashboardApi.getSessionDistribution({
  period: '24h'
});
```

### React Hook Usage
```javascript
import { useApi } from '@/hooks/useApi';
import { organizationDashboardApi } from '@/api/BaseApiService';

const { data, loading, error, refresh } = useApi(
  () => organizationDashboardApi.getOverview(),
  { immediate: true, interval: 30000 }
);
```

## Database Schema

### Tables Used
- `chat_sessions`: Session data
- `users`: User and agent data
- `messages`: Message data for intent analysis
- `organizations`: Organization data

### Key Columns
- `chat_sessions.is_bot_session`: Boolean untuk membedakan bot vs agent session
- `chat_sessions.handover_at`: Timestamp untuk session yang di-handover
- `chat_sessions.satisfaction_rating`: Rating kepuasan customer
- `users.last_login_at`: Timestamp login terakhir untuk menentukan agent aktif

## Performance Considerations

1. **Caching**: Data overview di-cache selama 5 menit
2. **Database Indexing**: Pastikan ada index pada:
   - `chat_sessions.organization_id`
   - `chat_sessions.started_at`
   - `users.organization_id`
   - `users.role`
3. **Pagination**: Untuk data besar, gunakan pagination
4. **Real-time Updates**: Endpoint realtime di-refresh setiap 30 detik

## Security

1. **Authentication**: Semua endpoint memerlukan valid JWT token
2. **Authorization**: Permission `analytics.view` diperlukan
3. **Organization Scoping**: Data hanya bisa diakses oleh user dalam organization yang sama
4. **Rate Limiting**: API dibatasi 100 requests per menit per user

## Testing

### Manual Testing
```bash
# Test overview endpoint
curl -H "Authorization: Bearer YOUR_TOKEN" \
     "http://localhost/api/v1/organization-dashboard/overview"

# Test realtime endpoint
curl -H "Authorization: Bearer YOUR_TOKEN" \
     "http://localhost/api/v1/organization-dashboard/realtime"

# Test session distribution
curl -H "Authorization: Bearer YOUR_TOKEN" \
     "http://localhost/api/v1/organization-dashboard/session-distribution?period=24h"
```

### Automated Testing
```php
// Test dengan PHPUnit
public function test_organization_dashboard_overview()
{
    $user = User::factory()->create(['organization_id' => $this->organization->id]);
    $this->actingAs($user, 'api');
    
    $response = $this->getJson('/api/v1/organization-dashboard/overview');
    
    $response->assertStatus(200)
             ->assertJsonStructure([
                 'data' => [
                     'overview',
                     'session_distribution',
                     'intent_analysis'
                 ]
             ]);
}
```

## Troubleshooting

### Common Issues

1. **403 Forbidden**: Pastikan user memiliki organization_id dan permission yang benar
2. **500 Database Error**: Cek apakah column yang digunakan ada di database
3. **Empty Data**: Pastikan ada data di database untuk organization yang di-test

### Debug Mode
Untuk debugging, tambahkan logging di controller:
```php
Log::info('Debug info', ['data' => $data]);
```

## Changelog

### v1.0.0 (2025-09-26)
- Initial release
- Overview, realtime, dan session distribution endpoints
- Frontend integration dengan React hooks
- Export functionality (placeholder)
- Comprehensive error handling
- Organization scoping
- Performance optimizations
