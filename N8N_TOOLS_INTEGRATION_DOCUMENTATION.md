# N8N Tools Integration Documentation

## Overview
Implementasi lengkap untuk integrasi n8n tools dengan Google Docs dan Google Spreadsheet, menggunakan arsitektur yang sudah ada di codebase dengan menerapkan konsep DRY (Don't Repeat Yourself).

## Frontend Implementation

### 1. Custom Hook - useN8nTools
**File**: `frontend/src/hooks/useN8nTools.js`

Hook custom yang mengelola state dan API calls untuk n8n tools integration:
- Menggunakan `useApi` dan `useFormApi` dari hooks yang sudah ada
- Mengelola state untuk API keys, test results, dan integration status
- Menyediakan actions untuk save, test, dan manage workflows
- Error handling dan loading states yang comprehensive

### 2. Service - N8nToolsService
**File**: `frontend/src/services/N8nToolsService.jsx`

Service untuk API calls dengan error handling:
- Menggunakan axios instance yang sudah ada
- Error handling yang konsisten dengan service lainnya
- Response formatting yang standardized
- Timeout dan retry logic

### 3. Reusable Component - ApiKeySettings
**File**: `frontend/src/components/ui/ApiKeySettings.jsx`

Komponen reusable untuk mengatur API keys dengan fitur security:
- Show/hide secrets dengan toggle
- Copy to clipboard functionality
- Form validation dengan error messages
- Security notice dan best practices
- Responsive design dengan grid layout

### 4. Page Component - N8nToolsIntegration
**File**: `frontend/src/pages/n8n-tools/N8nToolsIntegration.jsx`

Halaman utama untuk n8n tools integration:
- Tab-based interface untuk Google Docs dan Sheets
- Menggunakan hook dan service yang sudah dibuat
- Integration status overview
- Error handling dan loading states
- Accessibility features dengan useAnnouncement

## Backend Implementation

### 1. Controller - N8nToolsController
**File**: `app/Http/Controllers/Api/V1/N8nToolsController.php`

Controller yang extends BaseApiController:
- Menggunakan logging dan error handling dari BaseApiController
- Validation dengan Laravel Validator
- Consistent API responses
- Permission-based access control

### 2. Service - N8nToolsService
**File**: `app/Services/N8nToolsService.php`

Business logic service dengan fitur:
- Encryption/decryption API keys dengan Laravel Crypt
- Caching dengan Laravel Cache
- n8n API integration dengan GuzzleHttp
- Google API testing
- Workflow creation dan management

### 3. Routes
**File**: `routes/api.php`

Protected routes dengan middleware:
```php
Route::prefix('n8n-tools')
    ->middleware(['permission:automations.manage', 'organization'])
    ->group(function () {
        // API Keys Management
        Route::get('/api-keys', [N8nToolsController::class, 'getApiKeys']);
        Route::post('/api-keys/{service}', [N8nToolsController::class, 'saveApiKeys']);
        Route::post('/test-connection/{service}', [N8nToolsController::class, 'testConnection']);
        Route::get('/status', [N8nToolsController::class, 'getIntegrationStatus']);

        // Workflow Management
        Route::get('/workflows', [N8nToolsController::class, 'getWorkflows']);
        Route::post('/workflows/google-docs', [N8nToolsController::class, 'createGoogleDocsWorkflow']);
        Route::post('/workflows/google-sheets', [N8nToolsController::class, 'createGoogleSheetsWorkflow']);
        Route::post('/workflows/{workflowId}/execute', [N8nToolsController::class, 'executeWorkflow']);
        Route::get('/workflows/{workflowId}/history', [N8nToolsController::class, 'getWorkflowHistory']);
    });
```

### 4. Configuration
**File**: `config/services.php`

Konfigurasi untuk n8n dan Google services:
```php
'n8n' => [
    'api_url' => env('N8N_API_URL', 'http://localhost:5678'),
    'api_key' => env('N8N_API_KEY'),
    'webhook_url' => env('N8N_WEBHOOK_URL'),
    'timeout' => env('N8N_TIMEOUT', 30),
],

'google' => [
    'docs' => [
        'api_key' => env('GOOGLE_DOCS_API_KEY'),
        'client_id' => env('GOOGLE_DOCS_CLIENT_ID'),
        'client_secret' => env('GOOGLE_DOCS_CLIENT_SECRET'),
        'refresh_token' => env('GOOGLE_DOCS_REFRESH_TOKEN'),
    ],
    'sheets' => [
        'api_key' => env('GOOGLE_SHEETS_API_KEY'),
        'client_id' => env('GOOGLE_SHEETS_CLIENT_ID'),
        'client_secret' => env('GOOGLE_SHEETS_CLIENT_SECRET'),
        'refresh_token' => env('GOOGLE_SHEETS_REFRESH_TOKEN'),
    ],
],
```

## Security Features

### 1. API Key Encryption
- API keys di-encrypt menggunakan Laravel Crypt
- Disimpan di cache dengan TTL 24 jam
- Decryption hanya dilakukan saat diperlukan

### 2. Input Validation
- Frontend validation dengan custom validation rules
- Backend validation dengan Laravel Validator
- Input sanitization dengan security utils

### 3. Permission Control
- Routes protected dengan `permission:automations.manage`
- Organization-scoped access
- Audit logging untuk semua actions

## Usage

### 1. Setup Environment Variables
```env
# N8N Configuration
N8N_API_URL=http://localhost:5678
N8N_API_KEY=your_n8n_api_key
N8N_WEBHOOK_URL=http://localhost:5678/webhook

# Google Services (optional - can be configured via UI)
GOOGLE_DOCS_API_KEY=your_google_docs_api_key
GOOGLE_DOCS_CLIENT_ID=your_google_docs_client_id
GOOGLE_DOCS_CLIENT_SECRET=your_google_docs_client_secret
GOOGLE_DOCS_REFRESH_TOKEN=your_google_docs_refresh_token

GOOGLE_SHEETS_API_KEY=your_google_sheets_api_key
GOOGLE_SHEETS_CLIENT_ID=your_google_sheets_client_id
GOOGLE_SHEETS_CLIENT_SECRET=your_google_sheets_client_secret
GOOGLE_SHEETS_REFRESH_TOKEN=your_google_sheets_refresh_token
```

### 2. Access the Integration Page
Navigate to `/n8n-tools-integration` in your application.

### 3. Configure API Keys
1. Select the service tab (Google Docs or Google Sheets)
2. Enter your API credentials
3. Click "Save Configuration"
4. Test the connection to verify credentials

### 4. Create Workflows
Use the API endpoints to create workflows:
```javascript
// Create Google Docs workflow
const response = await n8nToolsService.createGoogleDocsWorkflow({
  name: 'Document Automation',
  description: 'Automatically create documents',
  trigger: 'webhook',
  actions: ['create_document', 'update_document']
});
```

## API Endpoints

### API Keys Management
- `GET /api/v1/n8n-tools/api-keys` - Get API keys configuration
- `POST /api/v1/n8n-tools/api-keys/{service}` - Save API keys for service
- `POST /api/v1/n8n-tools/test-connection/{service}` - Test API connection
- `GET /api/v1/n8n-tools/status` - Get integration status

### Workflow Management
- `GET /api/v1/n8n-tools/workflows` - Get available workflows
- `POST /api/v1/n8n-tools/workflows/google-docs` - Create Google Docs workflow
- `POST /api/v1/n8n-tools/workflows/google-sheets` - Create Google Sheets workflow
- `POST /api/v1/n8n-tools/workflows/{workflowId}/execute` - Execute workflow
- `GET /api/v1/n8n-tools/workflows/{workflowId}/history` - Get workflow history

## Error Handling

### Frontend
- Comprehensive error handling dengan user-friendly messages
- Loading states untuk semua async operations
- Retry mechanisms untuk failed requests
- Form validation dengan real-time feedback

### Backend
- Structured error responses dengan error codes
- Logging untuk debugging dan monitoring
- Graceful fallbacks untuk external service failures
- Input validation dengan detailed error messages

## Testing

### Frontend Testing
```javascript
// Test API connection
const result = await n8nToolsService.testConnection('googleDocs');
console.log(result); // { success: true/false, error: string }

// Test workflow execution
const execution = await n8nToolsService.executeWorkflow('workflow-id', {
  data: { documentId: 'doc-123' }
});
```

### Backend Testing
```php
// Test service methods
$service = new N8nToolsService();
$apiKeys = $service->getApiKeys();
$status = $service->getIntegrationStatus();
```

## Monitoring and Logging

### Frontend Logging
- Console logging untuk debugging
- Error tracking dengan context
- Performance monitoring untuk API calls

### Backend Logging
- Structured logging dengan context
- Audit trail untuk all operations
- Error tracking dengan stack traces
- Performance metrics untuk external API calls

## Future Enhancements

1. **Workflow Templates**: Pre-built templates untuk common use cases
2. **Scheduled Workflows**: Support untuk scheduled execution
3. **Workflow Monitoring**: Real-time monitoring dan alerting
4. **Bulk Operations**: Support untuk bulk workflow operations
5. **Advanced Security**: Additional security features seperti IP whitelisting
6. **Analytics**: Detailed analytics untuk workflow performance
7. **Multi-tenant Support**: Enhanced multi-tenant support
8. **API Rate Limiting**: Rate limiting untuk external API calls

## Troubleshooting

### Common Issues

1. **API Key Validation Failed**
   - Check if API keys are properly formatted
   - Verify Google API credentials
   - Ensure proper permissions are granted

2. **N8N Connection Failed**
   - Verify N8N server is running
   - Check N8N API key configuration
   - Ensure network connectivity

3. **Workflow Creation Failed**
   - Check workflow data format
   - Verify action types are supported
   - Ensure proper permissions

### Debug Mode
Enable debug mode by setting `APP_DEBUG=true` in your environment for detailed error messages and logging.
