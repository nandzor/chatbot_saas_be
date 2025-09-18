# Organization Users Update API

## Overview
Enhanced API endpoints for managing users within organizations, providing comprehensive user update capabilities with proper validation and security.

## Endpoints

### 1. Update Organization User

**PUT/PATCH** `/api/v1/organizations/{organization}/users/{userId}`

Update a user within a specific organization.

#### Path Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| `organization` | string | Organization UUID |
| `userId` | string | User UUID |

#### Required Permissions
- `organizations.manage_users`

#### Request Body
```json
{
  "full_name": "John Doe",
  "email": "john.doe@example.com",
  "phone": "+62812345678",
  "username": "johndoe",
  "role": "org_admin",
  "status": "active",
  "bio": "Senior Developer",
  "timezone": "Asia/Jakarta",
  "language": "id",
  "permissions": [1, 2, 3],
  "preferences": {
    "theme": "dark",
    "notifications": {
      "email": true,
      "push": false
    }
  }
}
```

#### Field Validation
| Field | Type | Validation | Description |
|-------|------|------------|-------------|
| `full_name` | string | max:255 | User's full name |
| `email` | string | email, max:255 | Must be unique within organization |
| `phone` | string | max:20 | Phone number |
| `username` | string | max:50, alpha_dash | Must be unique within organization |
| `role` | string | in:org_admin,agent,viewer | User role within organization |
| `status` | string | in:active,inactive,suspended | User status |
| `bio` | string | max:1000 | User biography |
| `timezone` | string | max:50 | User timezone |
| `language` | string | max:10 | User language preference |
| `permissions` | array | integer[], exists:permissions,id | Array of permission IDs |
| `preferences` | object | - | User preferences object |

#### Response

**Success (200)**
```json
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "id": "uuid",
    "full_name": "John Doe",
    "email": "john.doe@example.com",
    "phone": "+62812345678",
    "username": "johndoe",
    "status": "active",
    "bio": "Senior Developer",
    "timezone": "Asia/Jakarta",
    "language": "id",
    "organization_id": "uuid",
    "roles": [
      {
        "id": 1,
        "name": "Organization Admin",
        "slug": "org_admin"
      }
    ],
    "permissions": [
      {
        "id": 1,
        "name": "users.view",
        "description": "View users"
      }
    ],
    "preferences": {
      "theme": "dark",
      "notifications": {
        "email": true,
        "push": false
      }
    },
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-20T15:45:00Z"
  }
}
```

**Error (400)**
```json
{
  "success": false,
  "message": "Email already exists in this organization"
}
```

**Error (422)**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "email": ["The email field must be a valid email address."],
    "role": ["The selected role is invalid."]
  }
}
```

### 2. Toggle User Status

**PATCH** `/api/v1/organizations/{organization}/users/{userId}/toggle-status`

Toggle user status within an organization.

#### Path Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| `organization` | string | Organization UUID |
| `userId` | string | User UUID |

#### Required Permissions
- `organizations.manage_users`

#### Request Body
```json
{
  "status": "inactive"
}
```

#### Field Validation
| Field | Type | Validation | Description |
|-------|------|------------|-------------|
| `status` | string | required, in:active,inactive,suspended | New user status |

#### Response

**Success (200)**
```json
{
  "success": true,
  "message": "Status user berhasil diubah",
  "data": {
    "id": "uuid",
    "status": "inactive",
    "updated_at": "2024-01-20T15:45:00Z"
  }
}
```

### 3. Remove User from Organization

**DELETE** `/api/v1/organizations/{organization}/users/{userId}`

Remove a user from an organization.

#### Path Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| `organization` | string | Organization UUID |
| `userId` | string | User UUID |

#### Required Permissions
- `organizations.manage_users`

#### Response

**Success (200)**
```json
{
  "success": true,
  "message": "User berhasil dihapus dari organisasi"
}
```

## Security Features

### 1. Organization Scoping
- All operations are scoped to the specific organization
- Users can only be managed within their assigned organization
- Super admins can manage users across all organizations

### 2. Permission Validation
- All endpoints require `organizations.manage_users` permission
- Permission checks are enforced at the middleware level

### 3. Data Validation
- Comprehensive input validation for all fields
- Unique constraints within organization scope
- Proper error handling and messaging

### 4. Audit Logging
- All user updates are logged with:
  - Organization ID
  - User ID
  - Updated by (current user)
  - Updated fields
  - Timestamp

## Error Handling

### Common Error Responses

**400 Bad Request**
```json
{
  "success": false,
  "message": "User not found in this organization"
}
```

**403 Forbidden**
```json
{
  "success": false,
  "message": "Insufficient permissions"
}
```

**404 Not Found**
```json
{
  "success": false,
  "message": "Organization not found"
}
```

**422 Validation Error**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "field_name": ["Error message"]
  }
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "message": "Failed to update user: [error details]"
}
```

## Usage Examples

### Update User Profile
```bash
curl -X PUT "https://api.example.com/api/v1/organizations/123e4567-e89b-12d3-a456-426614174000/users/987fcdeb-51a2-43d1-9f12-345678901234" \
  -H "Authorization: Bearer your-token" \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "John Doe Updated",
    "email": "john.updated@example.com",
    "phone": "+62812345679",
    "bio": "Senior Full Stack Developer"
  }'
```

### Change User Role
```bash
curl -X PATCH "https://api.example.com/api/v1/organizations/123e4567-e89b-12d3-a456-426614174000/users/987fcdeb-51a2-43d1-9f12-345678901234" \
  -H "Authorization: Bearer your-token" \
  -H "Content-Type: application/json" \
  -d '{
    "role": "agent"
  }'
```

### Suspend User
```bash
curl -X PATCH "https://api.example.com/api/v1/organizations/123e4567-e89b-12d3-a456-426614174000/users/987fcdeb-51a2-43d1-9f12-345678901234/toggle-status" \
  -H "Authorization: Bearer your-token" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "suspended"
  }'
```

### Update User Permissions
```bash
curl -X PATCH "https://api.example.com/api/v1/organizations/123e4567-e89b-12d3-a456-426614174000/users/987fcdeb-51a2-43d1-9f12-345678901234" \
  -H "Authorization: Bearer your-token" \
  -H "Content-Type: application/json" \
  -d '{
    "permissions": [1, 2, 3, 4, 5]
  }'
```

## Notes

1. **Partial Updates**: All fields are optional, allowing for partial updates
2. **Uniqueness**: Email and username must be unique within the organization scope
3. **Role Validation**: Roles must exist and be valid for the organization
4. **Permission Validation**: All permission IDs must exist in the system
5. **Audit Trail**: All changes are logged for compliance and debugging
6. **Soft Validation**: Invalid fields are rejected with detailed error messages
