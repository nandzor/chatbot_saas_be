# 🧪 Unified Authentication System - Testing Guide

## 📋 Testing Checklist

### ✅ **Backend Testing**

#### **1. Database Migration**
```bash
# Run migration for refresh tokens
php artisan migrate

# Verify table exists
php artisan tinker
>>> Schema::hasTable('refresh_tokens')
# Should return: true
```

#### **2. Middleware Registration**
```bash
# Check if middleware is registered
php artisan route:list --middleware=unified.auth
# Should show routes with unified.auth middleware
```

#### **3. Route Testing**
```bash
# Test public routes
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'

# Test protected routes (should fail without token)
curl -X GET http://localhost:8000/api/auth/me
# Should return 401 Unauthorized
```

#### **4. Token Generation Test**
```bash
# Login and get tokens
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}' \
  | jq '.data'

# Expected response structure:
{
  "user": {
    "id": 1,
    "name": "Test User",
    "email": "test@example.com"
  },
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh_token": "refresh_token_here",
  "sanctum_token": "1|abcdef123456...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "refresh_expires_in": 604800
}
```

#### **5. JWT Authentication Test**
```bash
# Use JWT token for API call
curl -X GET http://localhost:8000/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Should return user data
```

#### **6. Sanctum Fallback Test**
```bash
# Use Sanctum token for API call
curl -X GET http://localhost:8000/api/auth/me \
  -H "X-Sanctum-Token: YOUR_SANCTUM_TOKEN"

# Should return user data
```

#### **7. Token Refresh Test**
```bash
# Refresh JWT token
curl -X POST http://localhost:8000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refresh_token":"YOUR_REFRESH_TOKEN"}'

# Should return new tokens
```

### ✅ **Frontend Testing**

#### **1. Dependencies Installation**
```bash
cd frontend
npm install
# Should install all dependencies without errors
```

#### **2. Environment Setup**
```bash
# Create .env file
echo "REACT_APP_API_URL=http://localhost:8000/api" > .env
```

#### **3. Development Server**
```bash
npm start
# Should start on http://localhost:3000
```

#### **4. Component Testing**
```bash
# Test AuthService
npm test -- --testNamePattern="AuthService"

# Test AuthContext
npm test -- --testNamePattern="AuthContext"
```

#### **5. Browser Testing**

**Login Flow:**
1. Navigate to `http://localhost:3000/login`
2. Enter credentials
3. Should redirect to dashboard
4. Check localStorage for tokens

**Token Management:**
1. Open browser dev tools
2. Check Application > Local Storage
3. Verify tokens are stored:
   - `jwt_token`
   - `sanctum_token`
   - `refresh_token`

**API Calls:**
1. Navigate to dashboard
2. Check Network tab
3. Verify Authorization headers are sent
4. Test automatic token refresh

### ✅ **Integration Testing**

#### **1. Full Authentication Flow**
```bash
# 1. Start backend
php artisan serve

# 2. Start frontend
cd frontend && npm start

# 3. Test complete flow
# - Login
# - API calls
# - Token refresh
# - Logout
```

#### **2. Token Expiration Test**
```bash
# 1. Login and get tokens
# 2. Manually expire JWT in database
# 3. Make API call
# 4. Should automatically use Sanctum fallback
# 5. Should refresh JWT in background
```

#### **3. Error Handling Test**
```bash
# Test invalid credentials
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"wrong@example.com","password":"wrong"}'

# Should return 401 with proper error message

# Test expired refresh token
curl -X POST http://localhost:8000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refresh_token":"expired_token"}'

# Should return 401 with token expired message
```

### ✅ **Security Testing**

#### **1. Rate Limiting**
```bash
# Test login rate limiting
for i in {1..10}; do
  curl -X POST http://localhost:8000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"wrong"}'
done

# Should get rate limited after 5 attempts
```

#### **2. Token Validation**
```bash
# Test invalid JWT
curl -X GET http://localhost:8000/api/auth/me \
  -H "Authorization: Bearer invalid_token"

# Should return 401

# Test invalid Sanctum token
curl -X GET http://localhost:8000/api/auth/me \
  -H "X-Sanctum-Token: invalid_token"

# Should return 401
```

#### **3. CORS Testing**
```bash
# Test from different origin
curl -X GET http://localhost:8000/api/auth/me \
  -H "Origin: http://malicious-site.com" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Should handle CORS properly
```

### ✅ **Performance Testing**

#### **1. Response Time**
```bash
# Test JWT authentication speed
time curl -X GET http://localhost:8000/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Test Sanctum authentication speed
time curl -X GET http://localhost:8000/api/auth/me \
  -H "X-Sanctum-Token: YOUR_SANCTUM_TOKEN"
```

#### **2. Concurrent Requests**
```bash
# Test multiple concurrent requests
for i in {1..10}; do
  curl -X GET http://localhost:8000/api/auth/me \
    -H "Authorization: Bearer YOUR_JWT_TOKEN" &
done
wait
```

### ✅ **Monitoring & Logging**

#### **1. Check Logs**
```bash
# Check Laravel logs
tail -f storage/logs/laravel.log

# Look for authentication events
grep "API Access" storage/logs/laravel.log
grep "Using Sanctum fallback" storage/logs/laravel.log
```

#### **2. Database Monitoring**
```bash
# Check refresh tokens table
php artisan tinker
>>> DB::table('refresh_tokens')->count()
>>> DB::table('personal_access_tokens')->count()
```

### ✅ **Common Issues & Solutions**

#### **1. CORS Issues**
```bash
# Check CORS configuration
php artisan config:show cors

# Update .env
SANCTUM_STATEFUL_DOMAINS=localhost,localhost:3000
```

#### **2. Token Storage Issues**
```bash
# Check localStorage in browser
localStorage.getItem('jwt_token')
localStorage.getItem('sanctum_token')
localStorage.getItem('refresh_token')
```

#### **3. Middleware Issues**
```bash
# Clear route cache
php artisan route:clear
php artisan config:clear

# Check middleware registration
php artisan route:list --middleware=unified.auth
```

### ✅ **Production Testing**

#### **1. Environment Variables**
```bash
# Set production environment
APP_ENV=production
APP_DEBUG=false
JWT_SECRET=your-secure-jwt-secret
```

#### **2. HTTPS Testing**
```bash
# Test with HTTPS
curl -X GET https://your-domain.com/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### **3. Load Testing**
```bash
# Use Apache Bench for load testing
ab -n 1000 -c 10 http://localhost:8000/api/auth/me
```

## 🎯 **Success Criteria**

### **Backend**
- ✅ All routes respond correctly
- ✅ JWT authentication works
- ✅ Sanctum fallback works
- ✅ Token refresh works
- ✅ Rate limiting works
- ✅ Error handling works

### **Frontend**
- ✅ Login flow works
- ✅ Token storage works
- ✅ Automatic refresh works
- ✅ Protected routes work
- ✅ Error handling works

### **Integration**
- ✅ End-to-end authentication works
- ✅ Token expiration handling works
- ✅ Security measures work
- ✅ Performance is acceptable

## 🚀 **Next Steps**

After successful testing:

1. **Deploy to staging environment**
2. **Run full integration tests**
3. **Performance testing**
4. **Security audit**
5. **Deploy to production**
6. **Monitor in production**

---

**Happy Testing! 🧪**
