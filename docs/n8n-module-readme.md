# n8n Module for Laravel

A comprehensive Laravel module for integrating with n8n workflows, providing API testing, workflow management, and execution monitoring capabilities.

## Features

### 🔌 **Workflow Integration**
- Connect to n8n servers via REST API
- Execute workflows with custom input data
- Activate/deactivate workflows remotely
- Monitor workflow status and health

### 🧪 **API Testing Framework**
- Test workflows with sample data
- Validate expected outputs
- Save and reuse test cases
- Track test execution history and success rates

### 📊 **Execution Monitoring**
- Track workflow execution history
- Monitor performance metrics
- Analyze success/failure rates
- Real-time execution logging

### 🛡️ **Security & Reliability**
- Authentication and authorization
- Webhook signature verification
- Rate limiting and IP whitelisting
- Comprehensive error handling and logging

## Installation

### 1. Prerequisites
- Laravel 10+ with PHP 8.1+
- n8n server running and accessible
- Database with JSON column support

### 2. Environment Configuration
Add the following environment variables to your `.env` file:

```env
# n8n Server Configuration
N8N_SERVER_URL=http://localhost:5678
N8N_API_KEY=your_api_key_here
N8N_WEBHOOK_SECRET=your_webhook_secret
N8N_TIMEOUT=30

# Testing Configuration
N8N_TESTING_ENABLED=true
N8N_MOCK_RESPONSES=false
N8N_LOG_EXECUTIONS=true

# Webhook Configuration
N8N_VERIFY_WEBHOOK_SIGNATURE=true
N8N_ALLOWED_IPS=127.0.0.1,::1
N8N_WEBHOOK_RATE_LIMIT=100
```

### 3. Database Setup
Run the migrations to create the necessary database tables:

```bash
php artisan migrate
```

This will create:
- `n8n_workflows` - Workflow metadata and statistics
- `n8n_workflow_executions` - Execution history and logs
- `n8n_workflow_tests` - Test cases and results

## Quick Start

### 1. Test Connection
```php
use App\Services\N8nService;

$n8nService = new N8nService();
$result = $n8nService->testConnection();

if ($result['success']) {
    echo "Connected to n8n server!";
} else {
    echo "Connection failed: " . $result['message'];
}
```

### 2. Execute a Workflow
```php
$result = $n8nService->executeWorkflow('workflow-id', [
    'input_key' => 'input_value',
    'timestamp' => now()->toISOString()
]);

if ($result['success']) {
    $output = $result['data'];
    // Process the workflow output
}
```

### 3. Test a Workflow
```php
$result = $n8nService->testWorkflow('workflow-id', [
    'test_input' => 'test_value'
], [
    'expected_output' => 'expected_value'
]);

if ($result['test_passed']) {
    echo "Test passed!";
} else {
    echo "Test failed. Actual output: " . json_encode($result['actual_output']);
}
```

## API Endpoints

The module provides RESTful API endpoints organized by functionality:

### Connection & Health
- `GET /api/v1/n8n/connection/test` - Test n8n server connection

### Workflow Management
- `GET /api/v1/n8n/workflows` - List all workflows
- `GET /api/v1/n8n/workflows/{id}` - Get specific workflow
- `POST /api/v1/n8n/workflows/{id}/execute` - Execute workflow
- `POST /api/v1/n8n/workflows/{id}/activate` - Activate workflow
- `POST /api/v1/n8n/workflows/{id}/deactivate` - Deactivate workflow
- `GET /api/v1/n8n/workflows/{id}/stats` - Get workflow statistics

### Testing
- `POST /api/v1/n8n/testing/workflows/{id}/test` - Test workflow
- `GET /api/v1/n8n/testing/workflows/{id}/tests` - Get workflow tests
- `POST /api/v1/n8n/testing/tests/{id}/run` - Run saved test

### Execution History
- `GET /api/v1/n8n/executions/workflows/{id}` - Get execution history

## Models

### N8nWorkflow
Represents a workflow in the n8n system with metadata and statistics.

```php
use App\Models\N8nWorkflow;

$workflow = N8nWorkflow::where('workflow_id', 'n8n-workflow-id')->first();

// Get workflow statistics
$stats = $workflow->statistics;

// Check workflow health
$isHealthy = $workflow->isHealthy();
$healthStatus = $workflow->health_status;
```

### N8nWorkflowExecution
Tracks individual workflow executions with input/output data and timing.

```php
use App\Models\N8nWorkflowExecution;

$executions = N8nWorkflowExecution::where('workflow_id', $workflowId)
    ->successful()
    ->latest()
    ->limit(10)
    ->get();

foreach ($executions as $execution) {
    echo "Execution {$execution->execution_id}: {$execution->duration_human}";
}
```

### N8nWorkflowTest
Manages test cases for workflows with execution history and validation.

```php
use App\Models\N8nWorkflowTest;

$tests = N8nWorkflowTest::where('workflow_id', $workflowId)
    ->byTag('api')
    ->get();

foreach ($tests as $test) {
    echo "Test {$test->name}: {$test->success_rate}% success rate";
}
```

## Services

### N8nService
The main service class that handles all n8n API interactions.

```php
use App\Services\N8nService;

$n8nService = new N8nService();

// Test connection
$connection = $n8nService->testConnection();

// Get workflows
$workflows = $n8nService->getWorkflows();

// Execute workflow
$result = $n8nService->executeWorkflow('workflow-id', $inputData);

// Test workflow
$testResult = $n8nService->testWorkflow('workflow-id', $testData, $expectedOutput);
```

## Configuration

### Server Settings
- **URL**: n8n server base URL
- **API Key**: Authentication key for n8n API
- **Timeout**: Request timeout in seconds
- **Webhook Secret**: Secret for webhook signature verification

### Testing Options
- **Mock Responses**: Enable for development without n8n server
- **Log Executions**: Track all workflow executions
- **Test Workflow ID**: Default workflow for testing

### Webhook Security
- **Signature Verification**: Verify webhook authenticity
- **IP Whitelisting**: Restrict webhook sources
- **Rate Limiting**: Prevent abuse

## Testing

### Mock Mode
Enable mock responses for development and testing:

```env
N8N_MOCK_RESPONSES=true
```

When enabled, the service returns simulated responses without connecting to n8n.

### Test Cases
Create comprehensive test cases for your workflows:

```php
$testData = [
    'input' => 'test_value',
    'timestamp' => now()->toISOString()
];

$expectedOutput = [
    'output' => 'processed_value',
    'status' => 'success'
];

$result = $n8nService->testWorkflow($workflowId, $testData, $expectedOutput);
```

### Test Management
Organize tests with tags and descriptions:

```php
$test = N8nWorkflowTest::create([
    'workflow_id' => $workflowId,
    'name' => 'API Integration Test',
    'description' => 'Test workflow with API data',
    'test_data' => $testData,
    'expected_output' => $expectedOutput,
    'tags' => ['api', 'integration', 'critical']
]);
```

## Monitoring & Analytics

### Execution Metrics
Track workflow performance over time:

```php
$workflow = N8nWorkflow::find($id);

echo "Total executions: {$workflow->execution_count}";
echo "Success rate: {$workflow->statistics['success_rate']}%";
echo "Average execution time: {$workflow->average_execution_time}ms";
echo "Last execution: {$workflow->last_executed_at}";
```

### Health Monitoring
Monitor workflow health and performance:

```php
$workflows = N8nWorkflow::all();

foreach ($workflows as $workflow) {
    $status = $workflow->health_status;
    $isHealthy = $workflow->isHealthy();
    
    if (!$isHealthy) {
        // Send alert or notification
        Log::warning("Workflow {$workflow->name} is unhealthy: {$status}");
    }
}
```

## Security Considerations

### Authentication
- All endpoints require valid authentication tokens
- Use unified authentication (JWT or Sanctum)
- Implement proper role-based access control

### Webhook Security
- Verify webhook signatures
- Whitelist allowed IP addresses
- Implement rate limiting
- Log all webhook activities

### Data Validation
- Validate all input data
- Sanitize workflow outputs
- Implement proper error handling
- Log security events

## Error Handling

### Service Errors
The service returns structured error responses:

```php
$result = $n8nService->executeWorkflow($workflowId, $inputData);

if (!$result['success']) {
    Log::error('Workflow execution failed', [
        'workflow_id' => $workflowId,
        'error' => $result['message'],
        'details' => $result['error'] ?? null
    ]);
    
    // Handle error appropriately
    throw new WorkflowExecutionException($result['message']);
}
```

### API Errors
API endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Workflow execution failed",
  "detail": "Connection timeout",
  "errors": {
    "workflow_id": ["Invalid workflow ID"]
  },
  "timestamp": "2024-01-01T00:00:00.000000Z"
}
```

## Best Practices

### 1. **Error Handling**
- Always check the `success` field in responses
- Implement proper exception handling
- Log errors with context information
- Provide meaningful error messages to users

### 2. **Performance**
- Use appropriate timeouts for API calls
- Implement caching for frequently accessed data
- Monitor execution times and optimize workflows
- Use async processing for long-running workflows

### 3. **Testing**
- Create comprehensive test cases
- Test with various input scenarios
- Validate expected outputs
- Monitor test success rates

### 4. **Monitoring**
- Track workflow execution metrics
- Monitor system health
- Set up alerts for failures
- Analyze performance trends

### 5. **Security**
- Validate all inputs
- Implement proper authentication
- Monitor for suspicious activities
- Keep dependencies updated

## Troubleshooting

### Common Issues

#### Connection Failures
```bash
# Check n8n server status
curl -X GET "http://localhost:5678/api/v1/health"

# Verify environment variables
echo $N8N_SERVER_URL
echo $N8N_API_KEY
```

#### Authentication Errors
- Verify API key is correct
- Check token expiration
- Ensure proper permissions

#### Workflow Execution Failures
- Check workflow status in n8n
- Verify input data format
- Review n8n server logs
- Check workflow node configurations

### Debug Mode
Enable detailed logging for debugging:

```env
N8N_LOG_EXECUTIONS=true
LOG_LEVEL=debug
```

### Health Checks
Use the health endpoint to monitor system status:

```bash
curl -X GET "https://your-domain.com/api/v1/n8n/connection/test" \
  -H "Authorization: Bearer {token}"
```

## Contributing

### Development Setup
1. Clone the repository
2. Install dependencies: `composer install`
3. Configure environment variables
4. Run migrations: `php artisan migrate`
5. Start development server: `php artisan serve`

### Code Standards
- Follow PSR-12 coding standards
- Write comprehensive tests
- Document all public methods
- Use type hints and return types

### Testing
- Run tests: `php artisan test`
- Check code coverage
- Validate API endpoints
- Test error scenarios

## Support

### Documentation
- [API Documentation](docs/api/n8n-api-documentation.md)
- [Configuration Guide](docs/configuration.md)
- [Troubleshooting Guide](docs/troubleshooting.md)

### Issues
- Report bugs via GitHub issues
- Include error logs and context
- Provide reproduction steps
- Check existing issues first

### Community
- Join our Discord server
- Participate in discussions
- Share use cases and examples
- Contribute improvements

## License

This module is open-sourced software licensed under the [MIT license](LICENSE).

## Changelog

### v1.0.0 (2024-01-01)
- Initial release
- Basic workflow integration
- API testing framework
- Execution monitoring
- Comprehensive documentation

---

**Happy workflow automation! 🚀**
