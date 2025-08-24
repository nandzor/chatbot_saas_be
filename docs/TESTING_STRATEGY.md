# 🧪 Testing Strategy

## 📋 **Overview**
Strategi testing yang comprehensive untuk memastikan sistem SaaS chatbot berjalan dengan robust dan tanpa error.

## 🎯 **Testing Pyramid**

```
    🔺 E2E Tests (Few)
   🔺🔺 Integration Tests (Some)
  🔺🔺🔺 Unit Tests (Many)
 🔺🔺🔺🔺🔺 Manual Tests (Minimal)
```

## 🧪 **Unit Tests**

### **1. Controller Tests**
```php
// tests/Unit/Controllers/UserControllerTest.php
class UserControllerTest extends TestCase
{
    use RefreshDatabase;
    
    public function test_index_returns_paginated_users()
    {
        // Arrange
        User::factory()->count(20)->create();
        
        // Act
        $response = $this->getJson('/api/v1/users');
        
        // Assert
        $response->assertStatus(200)
                ->assertJsonStructure([
                    'success',
                    'message',
                    'data',
                    'meta' => [
                        'pagination' => [
                            'current_page',
                            'per_page',
                            'total',
                            'last_page'
                        ]
                    ]
                ]);
    }
    
    public function test_store_creates_user_with_valid_data()
    {
        // Arrange
        $userData = [
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'password' => 'password123'
        ];
        
        // Act
        $response = $this->postJson('/api/v1/users', $userData);
        
        // Assert
        $response->assertStatus(201)
                ->assertJson([
                    'success' => true,
                    'message' => 'User created successfully'
                ]);
        
        $this->assertDatabaseHas('users', [
            'name' => 'John Doe',
            'email' => 'john@example.com'
        ]);
    }
    
    public function test_store_validates_required_fields()
    {
        // Act
        $response = $this->postJson('/api/v1/users', []);
        
        // Assert
        $response->assertStatus(422)
                ->assertJsonValidationErrors(['name', 'email', 'password']);
    }
}
```

### **2. Service Tests**
```php
// tests/Unit/Services/UserServiceTest.php
class UserServiceTest extends TestCase
{
    use RefreshDatabase;
    
    protected UserService $userService;
    
    protected function setUp(): void
    {
        parent::setUp();
        $this->userService = app(UserService::class);
    }
    
    public function test_create_user_returns_user_instance()
    {
        // Arrange
        $userData = [
            'name' => 'Jane Doe',
            'email' => 'jane@example.com',
            'password' => 'password123'
        ];
        
        // Act
        $user = $this->userService->createUser($userData);
        
        // Assert
        $this->assertInstanceOf(User::class, $user);
        $this->assertEquals('Jane Doe', $user->name);
        $this->assertEquals('jane@example.com', $user->email);
    }
    
    public function test_get_user_by_id_returns_user()
    {
        // Arrange
        $user = User::factory()->create();
        
        // Act
        $foundUser = $this->userService->getById($user->id);
        
        // Assert
        $this->assertEquals($user->id, $foundUser->id);
    }
    
    public function test_get_user_by_id_returns_null_for_invalid_id()
    {
        // Act
        $user = $this->userService->getById(999);
        
        // Assert
        $this->assertNull($user);
    }
}
```

### **3. Middleware Tests**
```php
// tests/Unit/Middleware/PermissionMiddlewareTest.php
class PermissionMiddlewareTest extends TestCase
{
    public function test_middleware_allows_access_with_valid_permission()
    {
        // Arrange
        $user = User::factory()->create();
        $role = Role::factory()->create(['name' => 'admin']);
        $permission = Permission::factory()->create(['name' => 'users.view']);
        
        $user->roles()->attach($role);
        $role->permissions()->attach($permission);
        
        $request = Request::create('/test', 'GET');
        $request->setUserResolver(fn() => $user);
        
        $middleware = new PermissionMiddleware();
        
        // Act
        $response = $middleware->handle($request, function ($req) {
            return response('success');
        }, 'users.view');
        
        // Assert
        $this->assertEquals('success', $response->getContent());
    }
    
    public function test_middleware_denies_access_without_permission()
    {
        // Arrange
        $user = User::factory()->create();
        
        $request = Request::create('/test', 'GET');
        $request->setUserResolver(fn() => $user);
        
        $middleware = new PermissionMiddleware();
        
        // Act
        $response = $middleware->handle($request, function ($req) {
            return response('success');
        }, 'users.view');
        
        // Assert
        $this->assertEquals(403, $response->getStatusCode());
    }
}
```

## 🔗 **Integration Tests**

### **1. API Endpoint Tests**
```php
// tests/Feature/Api/UserManagementTest.php
class UserManagementTest extends TestCase
{
    use RefreshDatabase;
    
    protected User $user;
    protected Role $adminRole;
    
    protected function setUp(): void
    {
        parent::setUp();
        
        $this->adminRole = Role::factory()->create(['name' => 'admin']);
        $this->user = User::factory()->create();
        $this->user->roles()->attach($this->adminRole);
        
        $this->actingAs($this->user);
    }
    
    public function test_can_list_users_with_pagination()
    {
        // Arrange
        User::factory()->count(25)->create();
        
        // Act
        $response = $this->getJson('/api/v1/users?page=2&per_page=10');
        
        // Assert
        $response->assertStatus(200)
                ->assertJson([
                    'meta' => [
                        'pagination' => [
                            'current_page' => 2,
                            'per_page' => 10,
                            'total' => 26 // 25 + 1 from setUp
                        ]
                    ]
                ]);
    }
    
    public function test_can_create_user_with_valid_data()
    {
        // Arrange
        $userData = [
            'name' => 'New User',
            'email' => 'newuser@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123'
        ];
        
        // Act
        $response = $this->postJson('/api/v1/users', $userData);
        
        // Assert
        $response->assertStatus(201)
                ->assertJson([
                    'success' => true,
                    'message' => 'User created successfully'
                ]);
        
        $this->assertDatabaseHas('users', [
            'name' => 'New User',
            'email' => 'newuser@example.com'
        ]);
    }
    
    public function test_cannot_create_user_without_permission()
    {
        // Arrange
        $regularUser = User::factory()->create();
        $this->actingAs($regularUser);
        
        $userData = [
            'name' => 'New User',
            'email' => 'newuser@example.com',
            'password' => 'password123'
        ];
        
        // Act
        $response = $this->postJson('/api/v1/users', $userData);
        
        // Assert
        $response->assertStatus(403);
    }
    
    public function test_can_update_user()
    {
        // Arrange
        $userToUpdate = User::factory()->create();
        $updateData = ['name' => 'Updated Name'];
        
        // Act
        $response = $this->putJson("/api/v1/users/{$userToUpdate->id}", $updateData);
        
        // Assert
        $response->assertStatus(200)
                ->assertJson([
                    'success' => true,
                    'message' => 'User updated successfully'
                ]);
        
        $this->assertDatabaseHas('users', [
            'id' => $userToUpdate->id,
            'name' => 'Updated Name'
        ]);
    }
    
    public function test_can_delete_user()
    {
        // Arrange
        $userToDelete = User::factory()->create();
        
        // Act
        $response = $this->deleteJson("/api/v1/users/{$userToDelete->id}");
        
        // Assert
        $response->assertStatus(200)
                ->assertJson([
                    'success' => true,
                    'message' => 'User deleted successfully'
                ]);
        
        $this->assertSoftDeleted('users', ['id' => $userToDelete->id]);
    }
}
```

### **2. Permission System Tests**
```php
// tests/Feature/PermissionSystemTest.php
class PermissionSystemTest extends TestCase
{
    use RefreshDatabase;
    
    public function test_user_can_access_endpoint_with_permission()
    {
        // Arrange
        $user = User::factory()->create();
        $role = Role::factory()->create();
        $permission = Permission::factory()->create(['name' => 'users.view']);
        
        $user->roles()->attach($role);
        $role->permissions()->attach($permission);
        
        $this->actingAs($user);
        
        // Act
        $response = $this->getJson('/api/v1/users');
        
        // Assert
        $response->assertStatus(200);
    }
    
    public function test_user_cannot_access_endpoint_without_permission()
    {
        // Arrange
        $user = User::factory()->create();
        $this->actingAs($user);
        
        // Act
        $response = $this->getJson('/api/v1/users');
        
        // Assert
        $response->assertStatus(403);
    }
    
    public function test_wildcard_permission_works()
    {
        // Arrange
        $user = User::factory()->create();
        $role = Role::factory()->create();
        $permission = Permission::factory()->create(['name' => 'users.*']);
        
        $user->roles()->attach($role);
        $role->permissions()->attach($permission);
        
        $this->actingAs($user);
        
        // Act & Assert
        $this->getJson('/api/v1/users')->assertStatus(200);
        $this->postJson('/api/v1/users', [])->assertStatus(422); // Validation error, not permission
    }
}
```

## 🌐 **End-to-End Tests**

### **1. API Workflow Tests**
```php
// tests/Feature/Api/CompleteWorkflowTest.php
class CompleteWorkflowTest extends TestCase
{
    use RefreshDatabase;
    
    public function test_complete_user_management_workflow()
    {
        // Arrange
        $admin = User::factory()->create();
        $adminRole = Role::factory()->create(['name' => 'admin']);
        $admin->roles()->attach($adminRole);
        
        $this->actingAs($admin);
        
        // 1. Create User
        $userData = [
            'name' => 'Test User',
            'email' => 'testuser@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123'
        ];
        
        $createResponse = $this->postJson('/api/v1/users', $userData);
        $createResponse->assertStatus(201);
        
        $userId = $createResponse->json('data.id');
        
        // 2. Get User
        $getResponse = $this->getJson("/api/v1/users/{$userId}");
        $getResponse->assertStatus(200)
                   ->assertJson(['data' => ['name' => 'Test User']]);
        
        // 3. Update User
        $updateResponse = $this->putJson("/api/v1/users/{$userId}", [
            'name' => 'Updated User'
        ]);
        $updateResponse->assertStatus(200);
        
        // 4. Verify Update
        $verifyResponse = $this->getJson("/api/v1/users/{$userId}");
        $verifyResponse->assertStatus(200)
                      ->assertJson(['data' => ['name' => 'Updated User']]);
        
        // 5. Delete User
        $deleteResponse = $this->deleteJson("/api/v1/users/{$userId}");
        $deleteResponse->assertStatus(200);
        
        // 6. Verify Deletion
        $this->assertSoftDeleted('users', ['id' => $userId]);
    }
}
```

## 🔒 **Security Tests**

### **1. Permission Escalation Tests**
```php
// tests/Feature/Security/PermissionEscalationTest.php
class PermissionEscalationTest extends TestCase
{
    use RefreshDatabase;
    
    public function test_user_cannot_escalate_permissions()
    {
        // Arrange
        $user = User::factory()->create();
        $role = Role::factory()->create();
        $permission = Permission::factory()->create(['name' => 'users.view']);
        
        $user->roles()->attach($role);
        $role->permissions()->attach($permission);
        
        $this->actingAs($user);
        
        // Act & Assert - User should only have view permission
        $this->getJson('/api/v1/users')->assertStatus(200); // Can view
        $this->postJson('/api/v1/users', [])->assertStatus(403); // Cannot create
        $this->putJson('/api/v1/users/1', [])->assertStatus(403); // Cannot update
        $this->deleteJson('/api/v1/users/1')->assertStatus(403); // Cannot delete
    }
    
    public function test_user_cannot_access_admin_endpoints()
    {
        // Arrange
        $user = User::factory()->create();
        $this->actingAs($user);
        
        // Act & Assert
        $this->getJson('/api/admin/dashboard/overview')->assertStatus(403);
        $this->postJson('/api/admin/maintenance/clear-cache')->assertStatus(403);
    }
}
```

## 📊 **Performance Tests**

### **1. Database Query Tests**
```php
// tests/Performance/DatabasePerformanceTest.php
class DatabasePerformanceTest extends TestCase
{
    use RefreshDatabase;
    
    public function test_user_listing_performance()
    {
        // Arrange
        User::factory()->count(1000)->create();
        
        // Act
        $startTime = microtime(true);
        $response = $this->getJson('/api/v1/users?per_page=100');
        $endTime = microtime(true);
        
        $executionTime = ($endTime - $startTime) * 1000; // Convert to milliseconds
        
        // Assert
        $response->assertStatus(200);
        $this->assertLessThan(500, $executionTime, 'Response time should be less than 500ms');
    }
    
    public function test_pagination_performance()
    {
        // Arrange
        User::factory()->count(10000)->create();
        
        // Act
        $startTime = microtime(true);
        $response = $this->getJson('/api/v1/users?page=100&per_page=100');
        $endTime = microtime(true);
        
        $executionTime = ($endTime - $startTime) * 1000;
        
        // Assert
        $response->assertStatus(200);
        $this->assertLessThan(1000, $executionTime, 'Pagination should be fast even with large datasets');
    }
}
```

## 🧹 **Test Data Management**

### **1. Factories**
```php
// database/factories/UserFactory.php
class UserFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password' => Hash::make('password'),
            'remember_token' => Str::random(10),
            'status' => 'active',
            'is_active' => true,
        ];
    }
    
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'inactive',
            'is_active' => false,
        ]);
    }
    
    public function admin(): static
    {
        return $this->state(fn (array $attributes) => [
            'role' => 'admin',
        ]);
    }
}
```

### **2. Seeders**
```php
// database/seeders/TestDataSeeder.php
class TestDataSeeder extends Seeder
{
    public function run(): void
    {
        // Create test users
        User::factory()->count(50)->create();
        
        // Create test roles
        Role::factory()->count(5)->create();
        
        // Create test permissions
        Permission::factory()->count(20)->create();
        
        // Create test organizations
        Organization::factory()->count(10)->create();
    }
}
```

## 🚀 **Test Execution**

### **1. Run All Tests**
```bash
# Run all tests
php artisan test

# Run specific test file
php artisan test tests/Feature/Api/UserManagementTest.php

# Run tests with coverage
php artisan test --coverage

# Run tests in parallel
php artisan test --parallel
```

### **2. Continuous Integration**
```yaml
# .github/workflows/tests.yml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup PHP
        uses: shivammathur/setup-php@v2
        with:
          php-version: '8.2'
      - name: Install dependencies
        run: composer install -q --no-ansi --no-interaction --no-scripts --no-progress --prefer-dist
      - name: Run tests
        run: php artisan test
```

## 📈 **Test Metrics**

### **1. Coverage Goals**
- **Unit Tests**: 90%+
- **Integration Tests**: 80%+
- **E2E Tests**: 70%+

### **2. Performance Goals**
- **API Response Time**: < 500ms
- **Database Queries**: < 10 per request
- **Memory Usage**: < 128MB per request

### **3. Quality Goals**
- **Zero Critical Bugs**
- **< 5% Test Failure Rate**
- **100% Security Test Pass**

## 🔍 **Test Monitoring**

### **1. Test Reports**
```bash
# Generate HTML coverage report
php artisan test --coverage-html coverage/

# Generate XML coverage report
php artisan test --coverage-clover coverage.xml
```

### **2. Continuous Monitoring**
- Automated test runs on every commit
- Performance regression detection
- Security vulnerability scanning
- Code quality metrics

## 📚 **Best Practices**

### **1. Test Organization**
- Group related tests together
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)
- Keep tests independent

### **2. Test Data**
- Use factories for test data
- Clean up after each test
- Use realistic test scenarios
- Avoid hardcoded values

### **3. Test Maintenance**
- Update tests when code changes
- Remove obsolete tests
- Refactor test code regularly
- Monitor test performance

## 🎯 **Success Criteria**

### **1. Quality Metrics**
- ✅ All tests pass
- ✅ High test coverage
- ✅ Fast test execution
- ✅ No flaky tests

### **2. Business Value**
- ✅ Confident deployments
- ✅ Reduced bug reports
- ✅ Faster development cycles
- ✅ Better code quality

### **3. Team Confidence**
- ✅ Developers trust the tests
- ✅ QA team relies on tests
- ✅ Stakeholders see test results
- ✅ Continuous improvement culture
