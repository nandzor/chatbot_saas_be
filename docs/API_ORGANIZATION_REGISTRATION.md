# Organization Self-Registration API Documentation

## Overview
API endpoint untuk self-registration organization dengan admin user. Endpoint ini memungkinkan organisasi untuk mendaftarkan diri mereka sendiri beserta admin user pertama dengan sistem verifikasi email dan approval admin.

## Base URL
```
http://localhost:9000/api
```

## Authentication
- **Type**: Public endpoint (no authentication required)
- **Rate Limiting**: 3 attempts per 15 minutes per IP/email combination
- **Security Headers**: Applied automatically
- **Input Sanitization**: Applied automatically

## Middleware Stack
- `throttle.organization:3,15` - Custom rate limiting for organization registration
- `security.headers` - Security headers (XSS protection, CSRF, etc.)
- `input.sanitization` - Input sanitization and validation

## Endpoint

### Organization Registration
**POST** `/register-organization`

Mendaftarkan organisasi baru beserta admin user pertama.

**Request Body:**
```json
{
  "organization_name": "PT Example Company",
  "organization_email": "info@example.com",
  "organization_phone": "+6281234567890",
  "organization_address": "Jl. Example No. 123, Jakarta",
  "organization_website": "https://example.com",
  "business_type": "startup",
  "industry": "Technology",
  "company_size": "11-50",
  "tax_id": "123456789012345",
  "description": "A technology startup company",
  "admin_first_name": "John",
  "admin_last_name": "Doe",
  "admin_email": "admin@example.com",
  "admin_username": "johndoe",
  "admin_password": "Password123!",
  "admin_password_confirmation": "Password123!",
  "admin_phone": "+6281234567891",
  "timezone": "Asia/Jakarta",
  "locale": "id",
  "currency": "IDR",
  "terms_accepted": true,
  "privacy_policy_accepted": true,
  "marketing_consent": false
}
```

**Response Success (201):**
```json
{
  "success": true,
  "message": "Organization registration successful. Please check your email for verification.",
  "data": {
    "organization": {
      "id": "uuid",
      "name": "PT Example Company",
      "org_code": "PTEX001",
      "status": "pending_approval",
      "email": "info@example.com"
    },
    "admin_user": {
      "id": "uuid",
      "email": "admin@example.com",
      "full_name": "John Doe",
      "username": "johndoe",
      "status": "pending_verification"
    }
  }
}
```

**Response Error (400):**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "organization_name": ["The organization name field is required."],
    "organization_email": ["The organization email has already been taken."],
    "admin_password": ["The password must be at least 8 characters."]
  }
}
```

## Validation Rules

### Organization Information
- `organization_name`: required, string, max:255, min:2, regex pattern
- `organization_email`: required, email, max:255, unique
- `organization_phone`: optional, string, max:20, phone format
- `organization_address`: optional, string, max:500
- `organization_website`: optional, url, max:255
- `business_type`: optional, enum values
- `industry`: optional, string, max:100
- `company_size`: optional, enum values
- `tax_id`: optional, string, max:50, regex pattern
- `description`: optional, string, max:1000

### Admin User Information
- `admin_first_name`: required, string, max:100, min:2, regex pattern
- `admin_last_name`: required, string, max:100, min:2, regex pattern
- `admin_email`: required, email, max:255, unique
- `admin_username`: optional, string, max:100, min:3, unique, regex pattern
- `admin_password`: required, string, min:8, confirmed, regex pattern
- `admin_password_confirmation`: required, string, must match password
- `admin_phone`: optional, string, max:20, phone format

### Preferences
- `timezone`: optional, string, max:50, valid timezone
- `locale`: optional, enum ['id', 'en']
- `currency`: optional, enum ['IDR', 'USD', 'EUR', 'SGD', 'MYR', 'THB']

### Terms and Conditions
- `terms_accepted`: required, boolean, must be true
- `privacy_policy_accepted`: required, boolean, must be true
- `marketing_consent`: optional, boolean

## Business Type Options
- `startup`
- `small_business`
- `medium_business`
- `enterprise`
- `non_profit`
- `government`
- `education`
- `healthcare`
- `finance`
- `technology`
- `retail`
- `manufacturing`
- `other`

## Company Size Options
- `1-10`
- `11-50`
- `51-200`
- `201-500`
- `501-1000`
- `1000+`

## Password Requirements
- Minimum 8 characters
- Must contain at least one uppercase letter
- Must contain at least one lowercase letter
- Must contain at least one number
- Must contain at least one special character (@$!%*?&)

## Organization Status Flow
1. **pending_approval**: Organization created, waiting for admin approval
2. **active**: Organization approved and active
3. **suspended**: Organization suspended by admin
4. **inactive**: Organization deactivated

## User Status Flow
1. **pending_verification**: User created, waiting for email verification
2. **active**: User verified and active
3. **suspended**: User suspended by admin
4. **inactive**: User deactivated

## Features
- Automatic organization code generation
- 14-day trial period setup
- Email verification required for admin user
- Admin approval workflow for organization
- Comprehensive audit logging
- Input sanitization and validation
- CSRF protection
- Rate limiting (throttle:auth)

## Security Features
- **Input Sanitization**: Automatic sanitization of all input fields
- **XSS Protection**: Content Security Policy and XSS headers
- **SQL Injection Prevention**: Parameterized queries and Eloquent ORM
- **CSRF Protection**: Laravel CSRF token validation
- **Rate Limiting**: 3 attempts per 15 minutes per IP/email combination
- **Password Security**: Bcrypt hashing with salt
- **Email Validation**: RFC and DNS validation
- **Uniqueness Validation**: Email and username uniqueness checks
- **Reserved Username Protection**: Prevents use of reserved usernames
- **Security Headers**: X-Content-Type-Options, X-Frame-Options, X-XSS-Protection
- **Input Length Limits**: Maximum length validation for all fields
- **Character Filtering**: Regex patterns for allowed characters

## Error Handling
- Comprehensive validation error messages
- Detailed error logging
- User-friendly error responses
- Proper HTTP status codes
- Transaction rollback on failure

## Frontend Integration
- Multi-step registration form
- Real-time validation
- Progress indicators
- Error handling and display
- Success confirmation
- Automatic redirect to login

## Email Verification Endpoints

### Verify Organization Email
**POST** `/verify-organization-email`

Verifikasi email admin user setelah registrasi organization.

**Request Body:**
```json
{
  "token": "verification-token-from-email"
}
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Email verified successfully",
  "data": {
    "user": {
      "id": "uuid",
      "email": "admin@example.com",
      "full_name": "John Doe",
      "is_email_verified": true,
      "status": "active"
    },
    "organization": {
      "id": "uuid",
      "name": "PT Example Company",
      "status": "pending_approval"
    }
  }
}
```

### Resend Verification Email
**POST** `/resend-verification`

Kirim ulang email verifikasi untuk admin user.

**Request Body:**
```json
{
  "email": "admin@example.com",
  "type": "organization_verification"
}
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Verification email sent successfully"
}
```

## Organization Approval Endpoints (Super Admin)

### Get Pending Organizations
**GET** `/api/v1/superadmin/organization-approvals`

Mendapatkan daftar organization yang menunggu approval.

**Headers:**
```
Authorization: Bearer {jwt-token}
```

**Response Success (200):**
```json
{
  "success": true,
  "data": {
    "organizations": [
      {
        "id": "uuid",
        "name": "PT Example Company",
        "email": "info@example.com",
        "status": "pending_approval",
        "created_at": "2025-01-21T10:00:00Z",
        "admin_user": {
          "id": "uuid",
          "email": "admin@example.com",
          "full_name": "John Doe",
          "is_email_verified": true
        }
      }
    ],
    "pagination": {
      "current_page": 1,
      "per_page": 15,
      "total": 1
    }
  }
}
```

### Approve Organization
**POST** `/api/v1/superadmin/organization-approvals/{id}/approve`

Approve organization registration.

**Request Body:**
```json
{
  "notes": "Organization approved after review"
}
```

### Reject Organization
**POST** `/api/v1/superadmin/organization-approvals/{id}/reject`

Reject organization registration.

**Request Body:**
```json
{
  "reason": "Incomplete documentation",
  "notes": "Please provide complete business documentation"
}
```

## Testing
Use the following test data for development:

```json
{
  "organization_name": "Test Organization",
  "organization_email": "test@example.com",
  "admin_first_name": "Test",
  "admin_last_name": "User",
  "admin_email": "testuser@example.com",
  "admin_password": "TestPass123!",
  "admin_password_confirmation": "TestPass123!",
  "terms_accepted": true,
  "privacy_policy_accepted": true
}
```

## Postman Collection
Import the following Postman collection for testing:

```json
{
  "info": {
    "name": "Organization Registration API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Register Organization",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"organization_name\": \"Test Organization\",\n  \"organization_email\": \"test@example.com\",\n  \"admin_first_name\": \"Test\",\n  \"admin_last_name\": \"User\",\n  \"admin_email\": \"testuser@example.com\",\n  \"admin_password\": \"TestPass123!\",\n  \"admin_password_confirmation\": \"TestPass123!\",\n  \"terms_accepted\": true,\n  \"privacy_policy_accepted\": true\n}"
        },
        "url": {
          "raw": "{{base_url}}/api/register-organization",
          "host": ["{{base_url}}"],
          "path": ["api", "register-organization"]
        }
      }
    }
  ]
}
```
