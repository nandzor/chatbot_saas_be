# API Authentication Endpoints Documentation

## Overview
Sistem authentication yang lengkap dengan JWT + Sanctum + Refresh Token untuk keamanan maksimal. Semua endpoint menggunakan prefix `/api/auth` dan return JSON responses.

## Base URL
```
http://localhost:8000/api/auth
```

## Public Endpoints (No Authentication Required)

### 1. User Registration
**POST** `/register`

Mendaftarkan user baru ke sistem.

**Request Body:**
```json
{
    "email": "user@example.com",
    "password": "Password123!",
    "password_confirmation": "Password123!",
    "first_name": "John",
    "last_name": "Doe",
    "organization_code": "ORG001",
    "username": "johndoe", // optional
    "phone": "+6281234567890", // optional
    "timezone": "Asia/Jakarta", // optional
    "language": "id" // optional
}
```

**Response Success (201):**
```json
{
    "success": true,
    "message": "User registered successfully",
    "data": {
        "id": "uuid",
        "email": "user@example.com",
        "username": "johndoe",
        "full_name": "John Doe",
        "first_name": "John",
        "last_name": "Doe",
        "role": "customer",
        "status": "active",
        "organization": {
            "id": "uuid",
            "name": "Organization Name",
            "org_code": "ORG001"
        }
    }
}
```

**Validation Rules:**
- `email`: required, email, unique
- `password`: required, min:8, confirmed, regex pattern
- `first_name`: required, max:100
- `last_name`: required, max:100
- `organization_code`: required, exists in organizations table
- `username`: optional, unique, alphanumeric + ._-
- `phone`: optional, phone format
- `timezone`: optional, valid timezone
- `language`: optional, in: id,en

### 2. User Login
**POST** `/login`

Login user dan mendapatkan access token.

**Request Body:**
```json
{
    "email": "user@example.com",
    "password": "Password123!",
    "remember": false // optional
}
```

**Response Success (201):**
```json
{
    "success": true,
    "message": "Login successful",
    "data": {
        "access_token": "jwt_token_here",
        "refresh_token": "refresh_token_here",
        "sanctum_token": "sanctum_token_here",
        "token_type": "Bearer",
        "expires_in": 3600,
        "refresh_expires_in": 604800,
        "user": {
            "id": "uuid",
            "email": "user@example.com",
            "full_name": "John Doe",
            "role": "customer",
            "status": "active"
        },
        "session": {
            "id": "uuid",
            "ip_address": "127.0.0.1",
            "device_info": "Desktop",
            "created_at": "2025-08-23T10:00:00Z"
        }
    }
}
```

**Rate Limiting:** 5 attempts per minute per IP

### 3. Forgot Password
**POST** `/forgot-password`

Mengirim link reset password ke email user.

**Request Body:**
```json
{
    "email": "user@example.com"
}
```

**Response Success (200):**
```json
{
    "success": true,
    "message": "Password reset link sent to your email",
    "data": {
        "email": "user@example.com",
        "message": "Check your email for password reset instructions"
    }
}
```

### 4. Reset Password
**POST** `/reset-password`

Reset password menggunakan token dari email.

**Request Body:**
```json
{
    "token": "64_character_token",
    "email": "user@example.com",
    "password": "NewPassword123!",
    "password_confirmation": "NewPassword123!"
}
```

**Response Success (200):**
```json
{
    "success": true,
    "message": "Password reset successfully",
    "data": {
        "email": "user@example.com",
        "message": "Your password has been reset successfully. You can now login with your new password."
    }
}
```

### 5. Token Refresh
**POST** `/refresh`

Refresh JWT token menggunakan refresh token.

**Request Body:**
```json
{
    "refresh_token": "refresh_token_here"
}
```

**Response Success (200):**
```json
{
    "success": true,
    "message": "Token refreshed successfully",
    "data": {
        "access_token": "new_jwt_token",
        "refresh_token": "new_refresh_token",
        "token_type": "Bearer",
        "expires_in": 3600,
        "refresh_expires_in": 604800
    }
}
```

## Protected Endpoints (Authentication Required)

### 6. Get Current User
**GET** `/me`

Mendapatkan informasi user yang sedang login.

**Headers:**
```
Authorization: Bearer {jwt_token}
```

**Response Success (200):**
```json
{
    "success": true,
    "message": "User data retrieved successfully",
    "data": {
        "id": "uuid",
        "email": "user@example.com",
        "full_name": "John Doe",
        "role": "customer",
        "status": "active",
        "organization": {
            "id": "uuid",
            "name": "Organization Name",
            "org_code": "ORG001"
        },
        "active_sessions": [
            {
                "id": "uuid",
                "ip_address": "127.0.0.1",
                "device_info": "Desktop",
                "last_activity_at": "2025-08-23T10:00:00Z"
            }
        ]
    }
}
```

### 7. Update Profile
**PUT** `/profile`

Update profil user yang sedang login.

**Headers:**
```
Authorization: Bearer {jwt_token}
```

**Request Body:**
```json
{
    "first_name": "John",
    "last_name": "Smith",
    "phone": "+6281234567890",
    "timezone": "Asia/Jakarta",
    "language": "id",
    "bio": "Software Developer",
    "location": "Jakarta",
    "department": "Engineering",
    "job_title": "Senior Developer"
}
```

**Response Success (200):**
```json
{
    "success": true,
    "message": "Profile updated successfully",
    "data": {
        "id": "uuid",
        "full_name": "John Smith",
        "first_name": "John",
        "last_name": "Smith",
        "phone": "+6281234567890",
        "timezone": "Asia/Jakarta",
        "language": "id",
        "bio": "Software Developer",
        "location": "Jakarta",
        "department": "Engineering",
        "job_title": "Senior Developer"
    }
}
```

### 8. Change Password
**PUT** `/change-password`

Mengubah password user yang sedang login.

**Headers:**
```
Authorization: Bearer {jwt_token}
```

**Request Body:**
```json
{
    "current_password": "OldPassword123!",
    "new_password": "NewPassword123!",
    "new_password_confirmation": "NewPassword123!"
}
```

**Response Success (200):**
```json
{
    "success": true,
    "message": "Password changed successfully",
    "data": null
}
```

### 9. Logout
**POST** `/logout`

Logout user dan invalidate current session.

**Headers:**
```
Authorization: Bearer {jwt_token}
```

**Response Success (200):**
```json
{
    "success": true,
    "message": "Successfully logged out",
    "data": null
}
```

### 10. Logout All Devices
**POST** `/logout-all`

Logout user dari semua device dan invalidate semua sessions.

**Headers:**
```
Authorization: Bearer {jwt_token}
```

**Response Success (200):**
```json
{
    "success": true,
    "message": "Successfully logged out from all devices",
    "data": null
}
```

### 11. Validate Token
**POST** `/validate`

Validasi current token dan return user info.

**Headers:**
```
Authorization: Bearer {jwt_token}
```

**Response Success (200):**
```json
{
    "success": true,
    "message": "Token is valid",
    "data": {
        "valid": true,
        "user": {
            "id": "uuid",
            "email": "user@example.com",
            "full_name": "John Doe"
        },
        "expires_in": 3600
    }
}
```

### 12. Get Active Sessions
**GET** `/sessions`

Mendapatkan daftar active sessions user.

**Headers:**
```
Authorization: Bearer {jwt_token}
```

**Response Success (200):**
```json
{
    "success": true,
    "message": "Sessions retrieved successfully",
    "data": [
        {
            "id": "uuid",
            "ip_address": "127.0.0.1",
            "device_info": "Desktop",
            "location_info": null,
            "last_activity": "2 minutes ago",
            "created_at": "2025-08-23T10:00:00Z",
            "is_current": true
        }
    ]
}
```

### 13. Revoke Session
**DELETE** `/sessions/{sessionId}`

Revoke specific session (tidak bisa revoke current session).

**Headers:**
```
Authorization: Bearer {jwt_token}
```

**Response Success (200):**
```json
{
    "success": true,
    "message": "Session revoked successfully",
    "data": null
}
```

## Admin Only Endpoints

### 14. Force Logout User
**POST** `/force-logout/{userId}`

Force logout user dari semua device (admin only).

**Headers:**
```
Authorization: Bearer {jwt_token}
```

**Response Success (200):**
```json
{
    "success": true,
    "message": "User force logged out successfully",
    "data": {
        "user_id": "uuid"
    }
}
```

### 15. Lock User Account
**POST** `/lock-user/{userId}`

Lock user account (admin only).

**Headers:**
```
Authorization: Bearer {jwt_token}
```

**Request Body:**
```json
{
    "reason": "Suspicious activity detected",
    "duration_minutes": 60
}
```

**Response Success (200):**
```json
{
    "success": true,
    "message": "User account locked successfully",
    "data": {
        "user_id": "uuid",
        "locked_until": "2025-08-23T11:00:00Z",
        "reason": "Suspicious activity detected"
    }
}
```

### 16. Unlock User Account
**POST** `/unlock-user/{userId}`

Unlock user account (admin only).

**Headers:**
```
Authorization: Bearer {jwt_token}
```

**Response Success (200):**
```json
{
    "success": true,
    "message": "User account unlocked successfully",
    "data": {
        "user_id": "uuid"
    }
}
```

## Error Responses

### Validation Error (422)
```json
{
    "success": false,
    "message": "Validation failed",
    "errors": {
        "email": ["Email wajib diisi"],
        "password": ["Password minimal 8 karakter"]
    }
}
```

### Authentication Error (401)
```json
{
    "success": false,
    "message": "Authentication failed",
    "errors": {
        "email": ["Invalid credentials provided."]
    }
}
```

### Authorization Error (403)
```json
{
    "success": false,
    "message": "Forbidden",
    "errors": {
        "error": "Insufficient permissions. Admin access required."
    }
}
```

### Server Error (500)
```json
{
    "success": false,
    "message": "Login failed",
    "errors": {
        "error": "An unexpected error occurred. Please try again."
    }
}
```

## Rate Limiting

- **Login/Register**: 5 attempts per minute per IP
- **Password Reset**: 5 attempts per minute per IP
- **Token Refresh**: 10 attempts per minute per user
- **API Calls**: 60 requests per minute per user

## Security Features

1. **JWT + Sanctum Dual Authentication**: JWT untuk stateless API, Sanctum untuk additional security
2. **Refresh Token Rotation**: Auto-rotate refresh tokens untuk security
3. **Session Management**: Track dan manage user sessions
4. **Rate Limiting**: Prevent brute force attacks
5. **Account Locking**: Auto-lock setelah failed attempts
6. **Password Policy**: Strong password requirements
7. **Audit Logging**: Log semua authentication events

## Testing

Gunakan test data dari seeder:
```bash
php artisan db:seed --class=AuthTestDataSeeder
```

**Test Users:**
- `superadmin@test.com` / `Password123!` (Super Admin)
- `admin@test.com` / `Password123!` (Org Admin)
- `customer@test.com` / `Password123!` (Customer)
- `agent@test.com` / `Password123!` (Agent)
- `locked@test.com` / `Password123!` (Locked User)

## Notes

- Semua password harus mengandung huruf besar, huruf kecil, angka, dan karakter khusus
- Token JWT expired dalam 1 jam, Sanctum dalam 1 tahun, Refresh dalam 7 hari
- User yang locked tidak bisa login sampai unlocked atau lock expired
- Admin bisa force logout, lock, dan unlock user lain
- Semua authentication events di-log untuk audit trail
