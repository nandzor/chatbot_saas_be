# N8N API Setup Guide

## Current Status
✅ N8N server is running and accessible  
✅ Laravel app can connect to N8N server  
✅ N8N package integrated (`kayedspace/laravel-n8n`)  
✅ API endpoints configured correctly  
✅ Network connectivity established  
❌ API key needs to be configured  

## Steps to Complete Setup

### 1. Access N8N Web Interface
Open your browser and go to: **http://localhost:5678**

### 2. Set Up N8N (if not already done)
- Complete the initial setup if this is your first time
- Create an account or sign in

### 3. Generate API Key
1. Go to **Settings** → **API Keys** (or **Personal Access Tokens**)
2. Click **Create API Key** or **Generate API Key**
3. Give it a name (e.g., "Laravel App")
4. Copy the generated API key

### 4. Configure Laravel App
Add the API key to your `.env` file:

```env
N8N_API_KEY=your-generated-api-key-here
```

### 5. Test the Connection
Run this command to test:

```bash
docker exec -ti cte_app php artisan tinker --execute="
\$service = new App\Services\N8nService();
\$result = \$service->testConnection();
echo json_encode(\$result, JSON_PRETTY_PRINT);
"
```

## Current Configuration
- **N8N Server URL**: `http://n8n:5678/api/v1` (includes API path)
- **Mock Responses**: `false` (using real API)
- **Network**: Connected to N8N network
- **Package**: `kayedspace/laravel-n8n` integrated
- **API Endpoints**: All N8N routes configured

## Environment Variables
```env
N8N_API_BASE_URL=http://n8n:5678/api/v1
N8N_API_KEY=your-generated-api-key-here
N8N_WEBHOOK_BASE_URL=http://n8n:5678/webhook/
N8N_WEBHOOK_USERNAME=nandz.id@gmail.com
N8N_WEBHOOK_PASSWORD=Admin123
N8N_TIMEOUT=30
N8N_THROW=true
N8N_RETRY=3
N8N_MOCK_RESPONSES=false
```

## Troubleshooting

### If you get "API key required" error:
- Make sure you've generated an API key in N8N
- Verify the API key is correctly set in `.env`
- Check that `N8N_MOCK_RESPONSES=false`

### If you get "404 Not Found" errors:
- Verify the API base URL includes `/api/v1`: `http://n8n:5678/api/v1`
- Check that N8N public API is enabled in settings

### If you get "401 Unauthorized" errors:
- The API key is invalid or expired
- Generate a new API key from N8N web interface
- Update the `N8N_API_KEY` in your `.env` file

### If you get connection errors:
- Verify N8N container is running: `docker ps | grep n8n`
- Check N8N logs: `docker logs n8n --tail 20`
- Ensure containers are on the same network: `docker network ls`

## Test Commands

### Test N8N Connection Directly
```bash
curl -H "X-N8N-API-KEY: your-api-key" http://localhost:5678/api/v1/workflows
```

### Test from Laravel Container
```bash
docker exec -ti cte_app curl -H "X-N8N-API-KEY: your-api-key" http://n8n:5678/api/v1/workflows
```

### Test Laravel API Endpoints
```bash
# Test connection
curl -X GET "http://localhost:9000/api/v1/n8n/connection/test" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer YOUR_LARAVEL_TOKEN"

# Test workflows
curl -X GET "http://localhost:9000/api/v1/n8n/workflows" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer YOUR_LARAVEL_TOKEN"
```

## Available N8N API Endpoints

### Connection
- `GET /api/v1/n8n/connection/test` - Test N8N connection

### Workflows
- `GET /api/v1/n8n/workflows` - List all workflows
- `POST /api/v1/n8n/workflows` - Create new workflow
- `GET /api/v1/n8n/workflows/{id}` - Get specific workflow
- `PUT /api/v1/n8n/workflows/{id}` - Update workflow
- `DELETE /api/v1/n8n/workflows/{id}` - Delete workflow
- `POST /api/v1/n8n/workflows/{id}/activate` - Activate workflow
- `POST /api/v1/n8n/workflows/{id}/deactivate` - Deactivate workflow
- `POST /api/v1/n8n/workflows/{id}/execute` - Execute workflow
- `GET /api/v1/n8n/workflows/{id}/executions` - Get workflow executions
- `GET /api/v1/n8n/workflows/{id}/stats` - Get workflow statistics

## Next Steps
Once the API key is configured, you can:
1. Test all N8N endpoints via the Laravel API
2. Create, update, and manage workflows
3. Execute workflows with real data
4. Monitor workflow executions
5. Use the Postman collection for API testing

## Package Integration Details
- **Package**: `kayedspace/laravel-n8n`
- **Configuration**: Uses `config/n8n.php` and environment variables
- **Service**: `App\Services\N8nService` wraps the package functionality
- **Routes**: All N8N routes are in `routes/n8n.php`
- **Controller**: `App\Http\Controllers\Api\V1\N8nController`

---

**Note**: The Laravel app is now fully integrated with N8N. You just need to generate and configure the API key to complete the setup.
