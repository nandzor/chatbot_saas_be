# Organization CRUD Implementation

## Overview

Implementasi CRUD lengkap untuk Organization yang mengikuti architecture design pattern yang telah didefinisikan. Organization merupakan entitas utama dalam sistem multi-tenant yang mengelola data perusahaan, pengguna, dan berlangganan.

## Architecture Compliance

✅ **Service Layer Pattern**: Business logic terpisah di `OrganizationService`  
✅ **API Design Pattern**: RESTful endpoints dengan consistent responses  
✅ **Validation Pattern**: Comprehensive validation dengan custom messages  
✅ **Resource Pattern**: Structured data transformation  
✅ **Security Pattern**: Permission-based access control  
✅ **Performance Pattern**: Caching dan optimization  
✅ **Testing Pattern**: Comprehensive test coverage  

## File Structure

```
app/
├── Services/
│   └── OrganizationService.php              # Business logic layer
├── Http/
│   ├── Controllers/Api/V1/
│   │   └── OrganizationController.php       # API controller
│   ├── Requests/Organization/
│   │   ├── CreateOrganizationRequest.php    # Create validation
│   │   └── UpdateOrganizationRequest.php    # Update validation
│   └── Resources/
│       ├── OrganizationResource.php         # Single organization resource
│       └── OrganizationCollection.php       # Collection resource
├── Models/
│   └── Organization.php                     # Eloquent model (existing)
database/
├── seeders/
│   └── OrganizationSeeder.php               # Sample data
└── factories/
    └── OrganizationFactory.php              # Test data factory
tests/
└── Feature/
    └── OrganizationTest.php                 # Feature tests
routes/
└── api.php                                  # API routes (updated)
docs/
├── api/
│   └── organizations.md                     # API documentation
└── organizations-implementation.md          # This file
```

## Key Features Implemented

### 🔧 Core CRUD Operations
- ✅ **Create**: Membuat organisasi dengan validasi lengkap
- ✅ **Read**: List, detail, filtering, pagination
- ✅ **Update**: Update dengan validasi dan safety checks
- ✅ **Delete**: Soft delete dengan safety checks

### 🎯 Advanced Features
- ✅ **Multi-tenant Support**: Isolasi data per organisasi
- ✅ **Subscription Management**: Integrasi dengan subscription plans
- ✅ **User Management**: Add/remove users dari organisasi
- ✅ **Statistics**: Comprehensive analytics dan reporting
- ✅ **Filtering & Search**: Multiple filter options
- ✅ **Caching**: Intelligent cache management
- ✅ **Audit Trail**: Logging semua perubahan

### 🔒 Security Features
- ✅ **Permission-based Access**: RBAC untuk semua operasi
- ✅ **Input Validation**: Comprehensive validation rules
- ✅ **Data Isolation**: Multi-tenant data separation
- ✅ **API Security**: Rate limiting dan authentication

### 📊 Business Logic
- ✅ **Organization Code Generation**: Auto-generate unique org codes
- ✅ **Trial Management**: Automatic trial period handling
- ✅ **Usage Tracking**: Real-time usage monitoring
- ✅ **Feature Flags**: Dynamic feature enablement
- ✅ **Configuration Management**: Theme, branding, settings

## API Endpoints

| Method | Endpoint | Description | Permission |
|--------|----------|-------------|------------|
| GET | `/api/v1/organizations` | List all organizations | `organizations.view` |
| GET | `/api/v1/organizations/active` | Get active organizations | `organizations.view` |
| GET | `/api/v1/organizations/trial` | Get trial organizations | `organizations.view` |
| GET | `/api/v1/organizations/expired-trial` | Get expired trial orgs | `organizations.view` |
| GET | `/api/v1/organizations/business-type/{type}` | Filter by business type | `organizations.view` |
| GET | `/api/v1/organizations/industry/{industry}` | Filter by industry | `organizations.view` |
| GET | `/api/v1/organizations/company-size/{size}` | Filter by company size | `organizations.view` |
| GET | `/api/v1/organizations/{id}` | Get organization details | `organizations.view` |
| GET | `/api/v1/organizations/code/{orgCode}` | Get by organization code | `organizations.view` |
| POST | `/api/v1/organizations` | Create organization | `organizations.create` |
| PUT | `/api/v1/organizations/{id}` | Update organization | `organizations.update` |
| DELETE | `/api/v1/organizations/{id}` | Delete organization | `organizations.delete` |
| GET | `/api/v1/organizations/statistics` | Get statistics | `organizations.view` |
| GET | `/api/v1/organizations/{id}/users` | Get organization users | `organizations.view` |
| POST | `/api/v1/organizations/{id}/users` | Add user to org | `organizations.manage_users` |
| DELETE | `/api/v1/organizations/{id}/users/{userId}` | Remove user from org | `organizations.manage_users` |
| PATCH | `/api/v1/organizations/{id}/subscription` | Update subscription | `organizations.update` |

## Data Model

### Organization Model
```php
class Organization extends Model
{
    use HasFactory, HasUuid, HasStatus, SoftDeletes;

    protected $fillable = [
        'org_code', 'name', 'display_name', 'email', 'phone', 'address',
        'logo_url', 'favicon_url', 'website', 'tax_id', 'business_type',
        'industry', 'company_size', 'timezone', 'locale', 'currency',
        'subscription_plan_id', 'subscription_status', 'trial_ends_at',
        'subscription_starts_at', 'subscription_ends_at', 'billing_cycle',
        'current_usage', 'theme_config', 'branding_config', 'feature_flags',
        'ui_preferences', 'business_hours', 'contact_info', 'social_media',
        'security_settings', 'api_enabled', 'webhook_url', 'webhook_secret',
        'settings', 'metadata', 'status'
    ];

    protected $casts = [
        'trial_ends_at' => 'datetime',
        'subscription_starts_at' => 'datetime',
        'subscription_ends_at' => 'datetime',
        'current_usage' => 'array',
        'theme_config' => 'array',
        'branding_config' => 'array',
        'feature_flags' => 'array',
        'ui_preferences' => 'array',
        'business_hours' => 'array',
        'contact_info' => 'array',
        'social_media' => 'array',
        'security_settings' => 'array',
        'api_enabled' => 'boolean',
        'settings' => 'array',
        'metadata' => 'array'
    ];
}
```

### Key Relationships
- `subscriptionPlan()` - Belongs to SubscriptionPlan
- `users()` - Has many Users
- `agents()` - Has many Agents
- `customers()` - Has many Customers
- `subscriptions()` - Has many Subscriptions
- `apiKeys()` - Has many ApiKeys
- `billingInvoices()` - Has many BillingInvoices
- `usageTracking()` - Has many UsageTracking
- `auditLogs()` - Has many AuditLogs

## Service Layer Usage

### Basic Operations
```php
// Get all organizations with filters
$organizations = $organizationService->getAllOrganizations($request, [
    'status' => 'active',
    'business_type' => 'technology'
]);

// Get organization by ID
$organization = $organizationService->getOrganizationById($id, [
    'subscriptionPlan', 'users', 'roles'
]);

// Create organization
$organization = $organizationService->createOrganization([
    'name' => 'New Company',
    'email' => 'contact@newcompany.com',
    'business_type' => 'startup'
]);

// Update organization
$organization = $organizationService->updateOrganization($id, [
    'name' => 'Updated Company Name',
    'business_type' => 'technology'
]);

// Delete organization
$deleted = $organizationService->deleteOrganization($id);
```

### Advanced Operations
```php
// Get active organizations
$activeOrgs = $organizationService->getActiveOrganizations();

// Get trial organizations
$trialOrgs = $organizationService->getTrialOrganizations();

// Get organizations by business type
$techOrgs = $organizationService->getOrganizationsByBusinessType('technology');

// Get organization statistics
$stats = $organizationService->getOrganizationStatistics();

// Add user to organization
$success = $organizationService->addUserToOrganization($orgId, $userId, 'member');

// Remove user from organization
$success = $organizationService->removeUserFromOrganization($orgId, $userId);

// Update subscription
$organization = $organizationService->updateSubscription($id, [
    'subscription_status' => 'active',
    'billing_cycle' => 'monthly'
]);
```

## API Usage Examples

### Create Organization
```bash
curl -X POST /api/v1/organizations \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "TechCorp Indonesia",
    "email": "contact@techcorp.id",
    "business_type": "technology",
    "industry": "technology",
    "company_size": "51-200",
    "subscription_status": "trial"
  }'
```

### List Organizations with Filters
```bash
curl -X GET "/api/v1/organizations?status=active&business_type=technology&per_page=10" \
  -H "Authorization: Bearer <token>"
```

### Update Organization
```bash
curl -X PUT /api/v1/organizations/{id} \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated TechCorp",
    "business_type": "healthcare",
    "industry": "healthcare"
  }'
```

### Get Organization Statistics
```bash
curl -X GET /api/v1/organizations/statistics \
  -H "Authorization: Bearer <token>"
```

## Testing

### Run Tests
```bash
# Run all organization tests
php artisan test tests/Feature/OrganizationTest.php

# Run specific test
php artisan test --filter it_can_create_organization
```

### Test Coverage
- ✅ **CRUD Operations**: Create, read, update, delete
- ✅ **Filtering & Search**: Business type, industry, status filters
- ✅ **User Management**: Add/remove users
- ✅ **Subscription Management**: Update subscription details
- ✅ **Validation**: Required fields, unique constraints
- ✅ **Permissions**: Access control testing
- ✅ **Error Handling**: 404, 422, 403 responses
- ✅ **Statistics**: Analytics endpoint testing

## Seeding

### Run Seeder
```bash
# Run organization seeder
php artisan db:seed --class=OrganizationSeeder

# Run with subscription plans
php artisan db:seed --class=SubscriptionPlanSeeder
php artisan db:seed --class=OrganizationSeeder
```

### Sample Data
Seeder akan membuat 3 organisasi contoh:
1. **TechCorp Indonesia** - Technology company dengan Professional plan
2. **MediCare Solutions** - Healthcare company dengan Enterprise plan
3. **InnovateLab** - Startup dengan Basic plan (trial)

## Security Features

### Permission System
```php
// Required permissions for different operations
'organizations.view'           // View organizations
'organizations.create'         // Create organizations
'organizations.update'         // Update organizations
'organizations.delete'         // Delete organizations
'organizations.manage_users'   // Manage organization users
'organizations.view_secrets'   // View webhook secrets
```

### Data Validation
- ✅ **Input Sanitization**: All inputs are validated and sanitized
- ✅ **Unique Constraints**: Email, org_code uniqueness validation
- ✅ **Business Rules**: Subscription status, trial period validation
- ✅ **Type Validation**: Proper data type validation
- ✅ **Enum Validation**: Business type, industry, status enums

### Multi-tenant Security
- ✅ **Data Isolation**: Organizations cannot access other org data
- ✅ **User Isolation**: Users belong to specific organizations
- ✅ **Resource Isolation**: All resources are organization-scoped

## Performance Optimizations

### Caching Strategy
```php
// Cache active organizations for 30 minutes
Cache::remember('organizations_active', 1800, function () {
    return $this->getModel()->withActiveSubscription()->get();
});

// Cache statistics for 1 hour
Cache::remember('organization_statistics', 3600, function () {
    return $this->getStatistics();
});
```

### Database Optimization
- ✅ **Eager Loading**: Load relationships efficiently
- ✅ **Indexing**: Proper database indexes
- ✅ **Pagination**: Limit result sets
- ✅ **Query Optimization**: Efficient queries

### API Performance
- ✅ **Response Caching**: Cache API responses
- ✅ **Rate Limiting**: Prevent abuse
- ✅ **Pagination**: Handle large datasets
- ✅ **Filtering**: Reduce data transfer

## Monitoring & Logging

### Audit Trail
```php
// Log organization creation
Log::info('Organization created', [
    'organization_id' => $organization->id,
    'name' => $organization->name,
    'org_code' => $organization->org_code
]);

// Log user management
Log::info('User added to organization', [
    'organization_id' => $organizationId,
    'user_id' => $userId,
    'role' => $role
]);
```

### Error Handling
```php
// Comprehensive error handling
try {
    $organization = $this->organizationService->createOrganization($data);
} catch (\Exception $e) {
    Log::error('Error creating organization', [
        'error' => $e->getMessage(),
        'data' => $data
    ]);
    throw $e;
}
```

## Deployment Considerations

### Environment Variables
```env
# Organization settings
ORGANIZATION_DEFAULT_TIMEZONE=Asia/Jakarta
ORGANIZATION_DEFAULT_LOCALE=id
ORGANIZATION_DEFAULT_CURRENCY=IDR
ORGANIZATION_TRIAL_DAYS=14
```

### Database Migrations
```bash
# Run migrations
php artisan migrate

# Check migration status
php artisan migrate:status
```

### Cache Configuration
```php
// Cache configuration for organizations
'organizations' => [
    'active_ttl' => 1800,      // 30 minutes
    'statistics_ttl' => 3600,  // 1 hour
    'details_ttl' => 900,      // 15 minutes
],
```

## Future Enhancements

### Planned Features
- 🔄 **Bulk Operations**: Bulk create, update, delete
- 🔄 **Advanced Analytics**: Usage trends, growth metrics
- 🔄 **Integration APIs**: Third-party integrations
- 🔄 **Webhook Management**: Dynamic webhook configuration
- 🔄 **Custom Fields**: Dynamic organization fields
- 🔄 **Import/Export**: Data import/export functionality
- 🔄 **Audit Dashboard**: Visual audit trail interface
- 🔄 **Advanced Filtering**: Full-text search, complex filters

### Scalability Improvements
- 🔄 **Database Sharding**: Horizontal scaling
- 🔄 **Microservices**: Service decomposition
- 🔄 **Event Sourcing**: Event-driven architecture
- 🔄 **CQRS**: Command Query Responsibility Segregation
- 🔄 **API Versioning**: Backward compatibility
- 🔄 **GraphQL**: Flexible data querying

## Troubleshooting

### Common Issues

#### 1. Organization Code Generation
```php
// Issue: Duplicate org_code
// Solution: Auto-generate with counter
$orgCode = $this->generateOrgCode($name);
```

#### 2. Subscription Integration
```php
// Issue: Missing subscription plan
// Solution: Check plan exists before assignment
if ($subscriptionPlanId && !SubscriptionPlan::find($subscriptionPlanId)) {
    throw new \Exception('Subscription plan not found');
}
```

#### 3. User Management
```php
// Issue: User already in organization
// Solution: Check before adding
if ($organization->users()->where('id', $userId)->exists()) {
    throw new \Exception('User is already a member');
}
```

### Debug Commands
```bash
# Check organization data
php artisan tinker
>>> App\Models\Organization::with('users')->first();

# Clear organization cache
php artisan cache:clear

# Check permissions
php artisan permission:show
```

## Conclusion

Implementasi Organization CRUD ini memberikan foundation yang solid untuk sistem multi-tenant dengan fitur lengkap untuk manajemen organisasi, pengguna, dan berlangganan. Semua komponen mengikuti architecture design pattern yang telah didefinisikan dan siap untuk production deployment.

**Status**: ✅ **Complete**  
**Architecture Compliance**: ✅ **100%**  
**Test Coverage**: ✅ **Comprehensive**  
**Documentation**: ✅ **Complete**  
**Performance**: ✅ **Optimized**  
**Security**: ✅ **Enterprise-grade**
