# 📚 Postman Collection - Permission Management Module

## 🎯 Overview

This Postman Collection provides a comprehensive testing suite for the Permission Management Module API. It includes all CRUD operations, permission groups, role assignments, and user permission checks with proper authentication and validation.

## 📁 Collection Structure

```
🔐 Permission Management
├── 📋 Permissions
│   ├── Get All Permissions
│   ├── Get Permission by ID
│   ├── Create New Permission
│   ├── Update Permission
│   └── Delete Permission
├── 📁 Permission Groups
│   ├── Get All Permission Groups
│   └── Create Permission Group
├── 👥 Role Permissions
│   ├── Get Role Permissions
│   ├── Assign Permissions to Role
│   └── Remove Permissions from Role
└── 👤 User Permissions
    ├── Get User Permissions
    └── Check User Permission

🔧 Utility & Testing
├── Health Check
└── Authentication Test
```

## 🚀 Quick Start

### 1. Import Collection
1. Download `POSTMAN_PERMISSION_MANAGEMENT_COLLECTION.json`
2. Open Postman
3. Click **Import** → **Upload Files**
4. Select the downloaded JSON file
5. Click **Import**

### 2. Set Environment Variables
1. Create a new environment in Postman
2. Add the following variables:

| Variable | Value | Description |
|----------|-------|-------------|
| `base_url` | `http://localhost:8000` | Your API server URL |
| `auth_token` | `your_jwt_or_sanctum_token` | Authentication token |
| `organization_id` | `your_org_uuid` | Organization UUID |
| `permission_id` | `permission_uuid` | Permission UUID for testing |
| `role_id` | `role_uuid` | Role UUID for testing |

### 3. Select Environment
- Choose your environment from the dropdown in the top-right corner
- Ensure all variables are properly set

## 🔐 Authentication Setup

### JWT Token
```bash
# Get JWT token from login endpoint
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password"
  }'
```

### Sanctum Token
```bash
# Get Sanctum token from login endpoint
curl -X POST http://localhost:8000/api/auth/sanctum/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password"
  }'
```

## 📋 API Endpoints

### Permissions CRUD

#### Get All Permissions
- **Method**: `GET`
- **URL**: `{{base_url}}/api/v1/permissions`
- **Description**: Retrieve all permissions for the organization
- **Headers**: `Authorization: Bearer {{auth_token}}`

#### Get Permission by ID
- **Method**: `GET`
- **URL**: `{{base_url}}/api/v1/permissions/{{permission_id}}`
- **Description**: Get specific permission details
- **Headers**: `Authorization: Bearer {{auth_token}}`

#### Create New Permission
- **Method**: `POST`
- **URL**: `{{base_url}}/api/v1/permissions`
- **Description**: Create a new permission
- **Headers**: 
  - `Authorization: Bearer {{auth_token}}`
  - `Content-Type: application/json`
- **Body Example**:
```json
{
  "name": "Delete Users",
  "code": "delete_users",
  "display_name": "Delete Users",
  "description": "Allow users to delete other user accounts",
  "resource": "users",
  "action": "delete",
  "scope": "organization",
  "category": "user_management",
  "is_dangerous": true,
  "requires_approval": true,
  "sort_order": 100,
  "is_visible": true
}
```

#### Update Permission
- **Method**: `PUT`
- **URL**: `{{base_url}}/api/v1/permissions/{{permission_id}}`
- **Description**: Update existing permission
- **Headers**: 
  - `Authorization: Bearer {{auth_token}}`
  - `Content-Type: application/json`
- **Body Example**:
```json
{
  "display_name": "Updated Permission Name",
  "description": "Updated description",
  "sort_order": 150,
  "is_visible": true
}
```

#### Delete Permission
- **Method**: `DELETE`
- **URL**: `{{base_url}}/api/v1/permissions/{{permission_id}}`
- **Description**: Delete a permission
- **Headers**: `Authorization: Bearer {{auth_token}}`

### Permission Groups

#### Get All Permission Groups
- **Method**: `GET`
- **URL**: `{{base_url}}/api/v1/permissions/groups`
- **Description**: Retrieve all permission groups
- **Headers**: `Authorization: Bearer {{auth_token}}`

#### Create Permission Group
- **Method**: `POST`
- **URL**: `{{base_url}}/api/v1/permissions/groups`
- **Description**: Create a new permission group
- **Headers**: 
  - `Authorization: Bearer {{auth_token}}`
  - `Content-Type: application/json`
- **Body Example**:
```json
{
  "name": "User Management",
  "code": "user_management",
  "display_name": "User Management",
  "description": "Permissions related to user management operations",
  "category": "administration",
  "parent_group_id": null,
  "icon": "users",
  "color": "#3B82F6",
  "sort_order": 10,
  "permission_ids": ["{{permission_id_1}}", "{{permission_id_2}}"]
}
```

### Role Permissions

#### Get Role Permissions
- **Method**: `GET`
- **URL**: `{{base_url}}/api/v1/permissions/roles/{{role_id}}/permissions`
- **Description**: Get permissions assigned to a role
- **Headers**: `Authorization: Bearer {{auth_token}}`

#### Assign Permissions to Role
- **Method**: `POST`
- **URL**: `{{base_url}}/api/v1/permissions/roles/{{role_id}}/permissions`
- **Description**: Assign permissions to a role
- **Headers**: 
  - `Authorization: Bearer {{auth_token}}`
  - `Content-Type: application/json`
- **Body Example**:
```json
{
  "permission_ids": [
    "{{permission_id_1}}",
    "{{permission_id_2}}",
    "{{permission_id_3}}"
  ]
}
```

#### Remove Permissions from Role
- **Method**: `DELETE`
- **URL**: `{{base_url}}/api/v1/permissions/roles/{{role_id}}/permissions`
- **Description**: Remove permissions from a role
- **Headers**: 
  - `Authorization: Bearer {{auth_token}}`
  - `Content-Type: application/json`
- **Body Example**:
```json
{
  "permission_ids": [
    "{{permission_id_1}}",
    "{{permission_id_2}}"
  ]
}
```

### User Permissions

#### Get User Permissions
- **Method**: `GET`
- **URL**: `{{base_url}}/api/v1/permissions/users/permissions`
- **Description**: Get current user's permissions
- **Headers**: `Authorization: Bearer {{auth_token}}`

#### Check User Permission
- **Method**: `POST`
- **URL**: `{{base_url}}/api/v1/permissions/users/check-permission`
- **Description**: Check if user has specific permission
- **Headers**: 
  - `Authorization: Bearer {{auth_token}}`
  - `Content-Type: application/json`
- **Body Example**:
```json
{
  "resource": "users",
  "action": "delete",
  "scope": "organization"
}
```

## 🧪 Testing Features

### Pre-request Scripts
- Automatically sets default headers
- Logs request details for debugging
- Ensures consistent request structure

### Test Scripts
- **Response Time**: Ensures API responds within 2000ms
- **JSON Structure**: Validates response format
- **Success Field**: Checks for success indicator
- **Message Field**: Verifies response message
- **Endpoint-specific Tests**: Custom validation for each endpoint
- **Error Handling**: Proper error response validation

### Automated Tests
```javascript
// Example test structure
pm.test('Response time is less than 2000ms', function () {
    pm.expect(pm.response.responseTime).to.be.below(2000);
});

pm.test('Response has valid JSON structure', function () {
    pm.response.to.have.jsonBody();
});

pm.test('Response includes success field', function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('success');
});
```

## 🔧 Environment Variables

### Required Variables
- `base_url`: API server base URL
- `auth_token`: Authentication token

### Optional Variables
- `organization_id`: Organization UUID
- `permission_id`: Permission UUID for testing
- `permission_id_1`, `permission_id_2`, `permission_id_3`: Multiple permission UUIDs
- `role_id`: Role UUID for testing
- `user_id`: User UUID for testing

## 📊 Response Examples

### Success Response
```json
{
  "success": true,
  "message": "Permission created successfully",
  "data": {
    "id": "uuid-here",
    "name": "Delete Users",
    "code": "delete_users",
    "resource": "users",
    "action": "delete",
    "scope": "organization",
    "category": "user_management",
    "is_dangerous": true,
    "requires_approval": true,
    "created_at": "2025-01-27T10:00:00.000000Z"
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Invalid permission data",
  "detail": "Permission code 'delete_users' already exists in this organization."
}
```

## 🚨 Common Issues & Solutions

### 1. Authentication Errors
- **Issue**: `401 Unauthorized`
- **Solution**: Check `auth_token` variable and ensure token is valid

### 2. Validation Errors
- **Issue**: `422 Unprocessable Entity`
- **Solution**: Verify request body format and required fields

### 3. Permission Denied
- **Issue**: `403 Forbidden`
- **Solution**: Ensure user has required permissions for the operation

### 4. Not Found
- **Issue**: `404 Not Found`
- **Solution**: Check if resource IDs exist and are correct

## 📝 Best Practices

### 1. Testing Order
1. Start with Health Check (no auth required)
2. Test Authentication
3. Create test permissions
4. Test CRUD operations
5. Test permission groups
6. Test role assignments
7. Test user permissions

### 2. Data Management
- Use unique names and codes for test data
- Clean up test data after testing
- Use descriptive test data for better debugging

### 3. Error Handling
- Always test error scenarios
- Verify error response structure
- Test boundary conditions

### 4. Performance Testing
- Monitor response times
- Test with different data sizes
- Verify caching behavior

## 🔄 Collection Updates

### Version History
- **v1.0.0**: Initial release with all core endpoints
- **v1.1.0**: Added comprehensive test scripts
- **v1.2.0**: Enhanced error handling and validation

### Updating Collection
1. Export current collection
2. Make modifications
3. Re-import updated collection
4. Update environment variables if needed

## 📞 Support

### Documentation
- API Documentation: Check project docs folder
- Permission Management Module: `PERMISSION_MANAGEMENT_MODULE.md`

### Issues
- Create issue in project repository
- Include Postman collection version
- Provide error details and request/response examples

### Development Team
- Contact development team for technical support
- Provide environment details and error logs

---

**Collection Version**: 1.0.0  
**Last Updated**: January 2025  
**Compatible API Version**: v1.0.0
