# n8n API Documentation

This document provides comprehensive API documentation for the n8n workflow integration and testing module.

## Base URL
```
https://your-domain.com/api/v1/n8n
```

## Authentication
All endpoints require authentication using the unified authentication middleware (JWT or Sanctum).

**Header:**
```
Authorization: Bearer {token}
```

## API Endpoints

### 1. Connection & Health Check

#### Test Connection
**GET** `/connection/test`

Test the connection to the n8n server.

**Response:**
```json
{
  "success": true,
  "message": "Connection successful",
  "data": {
    "version": "1.0.0",
    "status": "running",
    "timestamp": "2024-01-01T00:00:00.000000Z"
  }
}
```

### 2. Workflow Management

#### Get All Workflows
**GET** `/workflows`

Retrieve all workflows from the n8n server.

**Query Parameters:**
- `limit` (optional): Number of workflows to return (default: 50, max: 100)
- `status` (optional): Filter by workflow status
- `active` (optional): Filter by active status (true/false)

**Response:**
```json
{
  "success": true,
  "message": "Workflows retrieved successfully",
  "data": [
    {
      "id": "workflow-1",
      "name": "Data Processing Workflow",
      "active": true,
      "nodes": [],
      "connections": []
    }
  ]
}
```

#### Get Specific Workflow
**GET** `/workflows/{workflowId}`

Retrieve a specific workflow by ID.

**Path Parameters:**
- `workflowId`: The unique identifier of the workflow

**Response:**
```json
{
  "success": true,
  "message": "Workflow retrieved successfully",
  "data": {
    "id": "workflow-1",
    "name": "Data Processing Workflow",
    "active": true,
    "nodes": [
      {
        "id": "node-1",
        "type": "n8n-nodes-base.webhook",
        "position": [100, 100]
      }
    ],
    "connections": {
      "node-1": {
        "main": [
          {
            "node": "node-2",
            "type": "main",
            "index": 0
          }
        ]
      }
    }
  }
}
```

#### Execute Workflow
**POST** `/workflows/{workflowId}/execute`

Execute a workflow with input data.

**Path Parameters:**
- `workflowId`: The unique identifier of the workflow

**Request Body:**
```json
{
  "input_data": {
    "key1": "value1",
    "key2": "value2"
  },
  "test_mode": false
}
```

**Response:**
```json
{
  "success": true,
  "message": "Workflow executed successfully",
  "data": {
    "executionId": "exec-123",
    "workflowId": "workflow-1",
    "status": "success",
    "data": {
      "output": {
        "processed_data": {
          "key1": "value1",
          "key2": "value2"
        },
        "timestamp": "2024-01-01T00:00:00.000000Z"
      }
    }
  }
}
```

#### Activate Workflow
**POST** `/workflows/{workflowId}/activate`

Activate a workflow in the n8n server.

**Path Parameters:**
- `workflowId`: The unique identifier of the workflow

**Response:**
```json
{
  "success": true,
  "message": "Workflow activated successfully",
  "data": {
    "workflow_id": "workflow-1",
    "status": "active"
  }
}
```

#### Deactivate Workflow
**POST** `/workflows/{workflowId}/deactivate`

Deactivate a workflow in the n8n server.

**Path Parameters:**
- `workflowId`: The unique identifier of the workflow

**Response:**
```json
{
  "success": true,
  "message": "Workflow deactivated successfully",
  "data": {
    "workflow_id": "workflow-1",
    "status": "inactive"
  }
}
```

#### Get Workflow Statistics
**GET** `/workflows/{workflowId}/stats`

Retrieve statistics for a specific workflow.

**Path Parameters:**
- `workflowId`: The unique identifier of the workflow

**Response:**
```json
{
  "success": true,
  "message": "Workflow statistics retrieved successfully",
  "data": {
    "totalExecutions": 100,
    "successfulExecutions": 85,
    "failedExecutions": 15,
    "averageExecutionTime": 2500,
    "lastExecution": "2024-01-01T00:00:00.000000Z"
  }
}
```

### 3. Workflow Testing

#### Test Workflow
**POST** `/testing/workflows/{workflowId}/test`

Test a workflow with test data and expected output validation.

**Path Parameters:**
- `workflowId`: The unique identifier of the workflow

**Request Body:**
```json
{
  "test_data": {
    "input_key": "test_value"
  },
  "expected_output": {
    "output_key": "expected_value"
  },
  "test_name": "API Test 001",
  "test_description": "Test workflow with sample data",
  "tags": ["api", "test", "automation"]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Workflow test completed",
  "data": {
    "test_passed": true,
    "test_data": {
      "input_key": "test_value"
    },
    "expected_output": {
      "output_key": "expected_value"
    },
    "actual_output": {
      "output_key": "expected_value"
    },
    "execution_result": {
      "executionId": "exec-123",
      "status": "success"
    }
  }
}
```

#### Get Workflow Tests
**GET** `/testing/workflows/{workflowId}/tests`

Retrieve all saved tests for a specific workflow.

**Path Parameters:**
- `workflowId`: The unique identifier of the workflow

**Response:**
```json
{
  "success": true,
  "message": "Workflow tests retrieved successfully",
  "data": {
    "tests": [
      {
        "id": 1,
        "name": "API Test 001",
        "description": "Test workflow with sample data",
        "status": "success",
        "success_rate": 100.0,
        "run_count": 5,
        "last_run": "2024-01-01T00:00:00.000000Z"
      }
    ],
    "total": 1,
    "workflow_id": "workflow-1"
  }
}
```

#### Run Saved Test
**POST** `/testing/tests/{testId}/run`

Execute a saved test.

**Path Parameters:**
- `testId`: The unique identifier of the test

**Response:**
```json
{
  "success": true,
  "message": "Test executed successfully",
  "data": {
    "test_passed": true,
    "test": {
      "id": 1,
      "name": "API Test 001",
      "status": "success",
      "success_count": 6,
      "failure_count": 0
    },
    "execution_result": {
      "executionId": "exec-124",
      "status": "success"
    }
  }
}
```

### 4. Execution History

#### Get Workflow Executions
**GET** `/executions/workflows/{workflowId}`

Retrieve execution history for a specific workflow.

**Path Parameters:**
- `workflowId`: The unique identifier of the workflow

**Query Parameters:**
- `limit` (optional): Number of executions to return (default: 50, max: 100)
- `status` (optional): Filter by execution status (success, failed, running)

**Response:**
```json
{
  "success": true,
  "message": "Workflow executions retrieved successfully",
  "data": {
    "executions": [
      {
        "id": "exec-123",
        "workflowId": "workflow-1",
        "status": "success",
        "startedAt": "2024-01-01T00:00:00.000000Z",
        "finishedAt": "2024-01-01T00:00:01.000000Z"
      }
    ],
    "total": 1,
    "workflow_id": "workflow-1"
  }
}
```

## Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "detail": "Additional error details",
  "errors": {
    "field_name": ["Validation error message"]
  },
  "timestamp": "2024-01-01T00:00:00.000000Z"
}
```

### Common HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `422` - Validation Error
- `500` - Internal Server Error

## Configuration

The n8n module can be configured through environment variables:

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

## Testing with Mock Data

For development and testing purposes, you can enable mock responses:

```env
N8N_MOCK_RESPONSES=true
```

When mock mode is enabled, the API will return simulated responses without actually connecting to an n8n server.

## Rate Limiting

API endpoints are subject to rate limiting to prevent abuse. The current limits are:

- **General endpoints**: 100 requests per minute per user
- **Workflow execution**: 20 executions per minute per user
- **Testing endpoints**: 50 tests per minute per user

## Webhook Support

The n8n module supports webhook integration for real-time workflow execution:

- Webhook URLs are automatically generated for each workflow
- Webhook signatures are verified for security
- IP whitelisting is supported
- Rate limiting is applied to webhook endpoints

## Best Practices

1. **Error Handling**: Always check the `success` field in responses
2. **Validation**: Validate input data before sending to the API
3. **Rate Limiting**: Implement exponential backoff for failed requests
4. **Logging**: Log all workflow executions for debugging
5. **Testing**: Use the testing endpoints to validate workflows before production use
6. **Monitoring**: Monitor workflow execution statistics for performance issues

## Examples

### Complete Workflow Testing Flow

```bash
# 1. Test connection
curl -X GET "https://your-domain.com/api/v1/n8n/connection/test" \
  -H "Authorization: Bearer {token}"

# 2. Get available workflows
curl -X GET "https://your-domain.com/api/v1/n8n/workflows" \
  -H "Authorization: Bearer {token}"

# 3. Test a specific workflow
curl -X POST "https://your-domain.com/api/v1/n8n/testing/workflows/{workflowId}/test" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "test_data": {"input": "test"},
    "expected_output": {"output": "processed"},
    "test_name": "Integration Test"
  }'

# 4. Execute workflow in production
curl -X POST "https://your-domain.com/api/v1/n8n/workflows/{workflowId}/execute" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "input_data": {"input": "production_data"}
  }'
```

### JavaScript/Node.js Example

```javascript
const axios = require('axios');

class N8nAPI {
  constructor(baseURL, token) {
    this.api = axios.create({
      baseURL: `${baseURL}/api/v1/n8n`,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
  }

  async testConnection() {
    const response = await this.api.get('/connection/test');
    return response.data;
  }

  async executeWorkflow(workflowId, inputData) {
    const response = await this.api.post(`/workflows/${workflowId}/execute`, {
      input_data: inputData
    });
    return response.data;
  }

  async testWorkflow(workflowId, testData, expectedOutput) {
    const response = await this.api.post(`/testing/workflows/${workflowId}/test`, {
      test_data: testData,
      expected_output: expectedOutput,
      test_name: 'API Test'
    });
    return response.data;
  }
}

// Usage
const n8n = new N8nAPI('https://your-domain.com', 'your_token');

// Test connection
n8n.testConnection().then(console.log);

// Execute workflow
n8n.executeWorkflow('workflow-1', { data: 'test' }).then(console.log);
```

## Support

For technical support or questions about the n8n API:

- **Documentation**: This document
- **API Status**: Check the health endpoint
- **Error Logs**: Review application logs for detailed error information
- **Configuration**: Verify environment variables and n8n server connectivity
