# Organization Self-Registration System

## Overview
Sistem self-registration organization yang comprehensive dengan fitur email verification, admin approval workflow, dan security yang robust. Sistem ini memungkinkan organisasi untuk mendaftarkan diri mereka sendiri beserta admin user pertama dengan proses yang aman dan terstruktur.

## Architecture

### Backend (Laravel 12)
- **Framework**: Laravel 12 dengan PHP 8.3+
- **Database**: PostgreSQL 16
- **Authentication**: JWT/Sanctum
- **Design Patterns**: Service Layer, Repository Pattern, Observer Pattern
- **Security**: Input sanitization, XSS protection, CSRF protection, Rate limiting

### Frontend (React)
- **Framework**: React 18 dengan TypeScript
- **UI Components**: Custom component library
- **Form Handling**: Multi-step form dengan real-time validation
- **State Management**: React hooks dengan context
- **Accessibility**: WCAG 2.1 compliant

## Features

### Core Features
1. **Organization Self-Registration**
   - Multi-step registration form
   - Real-time validation
   - Automatic organization code generation
   - 14-day trial period setup

2. **Email Verification System**
   - Admin user email verification
   - Token-based verification
   - Resend verification functionality
   - Expired token handling

3. **Admin Approval Workflow**
   - Super admin approval system
   - Approval/rejection with reasons
   - Email notifications
   - Audit logging

4. **Security Features**
   - Input sanitization
   - XSS protection
   - SQL injection prevention
   - Rate limiting (3 attempts per 15 minutes)
   - Security headers
   - Password complexity requirements

### Advanced Features
1. **Comprehensive Validation**
   - Server-side validation dengan Form Requests
   - Client-side validation dengan real-time feedback
   - Custom validation rules
   - Reserved username protection

2. **Error Handling**
   - Structured error responses
   - Comprehensive logging
   - User-friendly error messages
   - Transaction rollback on failure

3. **Audit Logging**
   - Complete activity tracking
   - User actions logging
   - System events logging
   - Compliance-ready logging

## File Structure

### Backend Files
```
app/
├── Http/
│   ├── Controllers/Api/
│   │   ├── AuthController.php
│   │   ├── EmailVerificationController.php
│   │   └── V1/OrganizationApprovalController.php
│   ├── Middleware/
│   │   ├── OrganizationRegistrationThrottle.php
│   │   ├── SecurityHeaders.php
│   │   └── InputSanitization.php
│   └── Requests/Auth/
│       └── RegisterOrganizationRequest.php
├── Services/
│   ├── OrganizationService.php
│   ├── EmailVerificationService.php
│   └── OrganizationApprovalService.php
├── Models/
│   └── EmailVerificationToken.php
├── Mail/
│   ├── OrganizationEmailVerificationMail.php
│   ├── OrganizationApprovedMail.php
│   └── OrganizationRejectedMail.php
└── resources/views/emails/
    ├── organization-email-verification.blade.php
    ├── organization-approved.blade.php
    └── organization-rejected.blade.php

database/migrations/
└── 2025_09_21_085000_create_email_verification_tokens_table.php

routes/
└── api.php
```

### Frontend Files
```
frontend/src/
├── components/forms/
│   └── OrganizationRegistrationForm.jsx
├── pages/auth/
│   ├── RegisterOrganization.jsx
│   ├── VerifyOrganizationEmail.jsx
│   └── Login.jsx
└── routes/
    └── index.jsx
```

## API Endpoints

### Public Endpoints
- `POST /api/register-organization` - Organization registration
- `POST /api/verify-organization-email` - Email verification
- `POST /api/resend-verification` - Resend verification email

### Protected Endpoints (Super Admin)
- `GET /api/v1/superadmin/organization-approvals` - Get pending organizations
- `GET /api/v1/superadmin/organization-approvals/statistics` - Get approval statistics
- `POST /api/v1/superadmin/organization-approvals/{id}/approve` - Approve organization
- `POST /api/v1/superadmin/organization-approvals/{id}/reject` - Reject organization

## Security Implementation

### Middleware Stack
1. **OrganizationRegistrationThrottle** - Custom rate limiting
2. **SecurityHeaders** - Security headers (XSS, CSRF, etc.)
3. **InputSanitization** - Input sanitization and validation

### Validation Rules
- **Organization Name**: Required, 2-255 chars, alphanumeric + special chars
- **Organization Email**: Required, valid email, unique, different from admin email
- **Admin Email**: Required, valid email, unique, different from organization email
- **Admin Password**: Required, 8+ chars, uppercase, lowercase, number, special char
- **Admin Username**: Optional, 3-100 chars, alphanumeric + dots/underscores/hyphens
- **Phone Numbers**: Optional, international format validation
- **Website**: Optional, valid URL format
- **Business Type**: Optional, predefined enum values
- **Company Size**: Optional, predefined enum values

### Security Headers
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Content-Security-Policy: default-src 'self'`
- `Cache-Control: no-cache, no-store, must-revalidate` (for sensitive endpoints)

## Database Schema

### Organizations Table
- `id` (UUID, Primary Key)
- `name` (String, 255 chars)
- `email` (String, 255 chars, Unique)
- `org_code` (String, 50 chars, Unique)
- `status` (Enum: pending_approval, active, suspended, inactive)
- `trial_ends_at` (Timestamp)
- `created_at`, `updated_at` (Timestamps)

### Users Table
- `id` (UUID, Primary Key)
- `email` (String, 255 chars, Unique)
- `username` (String, 100 chars, Unique, Nullable)
- `full_name` (String, 255 chars)
- `password` (String, Hashed)
- `is_email_verified` (Boolean, Default: false)
- `status` (Enum: pending_verification, active, suspended, inactive)
- `organization_id` (UUID, Foreign Key)
- `created_at`, `updated_at` (Timestamps)

### Email Verification Tokens Table
- `id` (UUID, Primary Key)
- `email` (String, 255 chars)
- `token` (String, 255 chars, Unique)
- `type` (String, 50 chars, Default: organization_verification)
- `user_id` (UUID, Foreign Key, Nullable)
- `organization_id` (UUID, Foreign Key, Nullable)
- `expires_at` (Timestamp)
- `is_used` (Boolean, Default: false)
- `used_at` (Timestamp, Nullable)
- `created_at`, `updated_at` (Timestamps)

## Workflow

### Registration Workflow
1. **User fills registration form** → Frontend validation
2. **Form submission** → Backend validation & sanitization
3. **Organization creation** → Database transaction
4. **Admin user creation** → With org_admin role
5. **Email verification sent** → Admin user receives verification email
6. **Audit logging** → All actions logged
7. **Response sent** → Success/error response to frontend

### Email Verification Workflow
1. **User clicks verification link** → Token validation
2. **Token verification** → Check expiry and usage
3. **User activation** → Set is_email_verified = true, status = active
4. **Token cleanup** → Mark token as used
5. **Audit logging** → Verification action logged

### Admin Approval Workflow
1. **Super admin reviews** → Pending organizations list
2. **Approval decision** → Approve or reject with reason
3. **Organization status update** → Set status to active or rejected
4. **Email notification** → Send approval/rejection email
5. **Audit logging** → Approval action logged

## Error Handling

### Backend Error Handling
- **ValidationException**: 422 status with validation errors
- **QueryException**: 500 status with database error details
- **General Exception**: 500 status with generic error message
- **Rate Limiting**: 429 status with retry information

### Frontend Error Handling
- **Form Validation**: Real-time validation with error messages
- **API Errors**: Structured error display
- **Network Errors**: Retry mechanism with user feedback
- **Accessibility**: Screen reader announcements for errors

## Testing

### Backend Testing
- Unit tests for services
- Integration tests for API endpoints
- Feature tests for complete workflows
- Security tests for validation and sanitization

### Frontend Testing
- Component tests for form validation
- Integration tests for API calls
- Accessibility tests for WCAG compliance
- E2E tests for complete user journey

## Performance Optimization

### Backend Optimization
- Database indexing on frequently queried fields
- Query optimization with eager loading
- Caching for organization data
- Rate limiting to prevent abuse

### Frontend Optimization
- Lazy loading for form components
- Debounced validation to reduce API calls
- Optimized bundle size
- Progressive enhancement

## Monitoring and Logging

### Application Logs
- Registration attempts and results
- Email verification activities
- Admin approval actions
- Security events and violations

### Performance Metrics
- Registration success rate
- Email verification rate
- Admin approval time
- API response times

## Deployment Considerations

### Environment Variables
- Database connection settings
- Email service configuration
- JWT secret keys
- Rate limiting configuration
- Security headers configuration

### Security Checklist
- [ ] Input sanitization enabled
- [ ] Security headers configured
- [ ] Rate limiting active
- [ ] CSRF protection enabled
- [ ] Password hashing configured
- [ ] Email verification required
- [ ] Admin approval workflow active
- [ ] Audit logging enabled

## Maintenance

### Regular Tasks
- Clean up expired verification tokens
- Monitor registration success rates
- Review admin approval queue
- Update security configurations
- Backup audit logs

### Monitoring Alerts
- High registration failure rates
- Unusual registration patterns
- Admin approval delays
- Security violations
- System performance issues

## Future Enhancements

### Planned Features
- Multi-language support
- Advanced organization settings
- Bulk organization import
- Advanced reporting and analytics
- Integration with external services
- Mobile app support

### Technical Improvements
- GraphQL API support
- Real-time notifications
- Advanced caching strategies
- Microservices architecture
- Container deployment
- CI/CD pipeline optimization

## Support and Documentation

### Documentation
- API documentation with examples
- Frontend component documentation
- Deployment guides
- Security best practices
- Troubleshooting guides

### Support Channels
- Technical documentation
- Code comments and inline documentation
- Error logging and monitoring
- Performance monitoring
- Security monitoring

---

**Last Updated**: January 21, 2025  
**Version**: 1.0.0  
**Maintainer**: Development Team
