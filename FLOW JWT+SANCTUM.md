Saya akan menjelaskan diagram sequence ini dengan lebih detail dan mudah dipahami:

## 📋 **Penjelasan Diagram Sequence: JWT + Sanctum + Refresh Token**

### **🎯 Tujuan Sistem**
Sistem ini dirancang untuk memberikan **keamanan maksimal** dengan **performansi optimal** menggunakan 3 jenis token yang bekerja bersama.

---

## **🔄 Fase 1: Login Process (Baris 1-5)**

### **1. Client → API: POST /login**
```typescript
// Frontend mengirim request login
const response = await fetch('/api/auth/login', {
  method: 'POST',
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123'
  })
});
```

### **2. API → JWT: Generate JWT (1 hour)**
```php
// Backend generate JWT token yang berlaku 1 jam
$jwtToken = JWTAuth::fromUser($user);
// JWT berisi: user_id, email, exp (expires in 1 hour)
```

### **3. API → Sanctum: Generate Sanctum (1 year)**
```php
// Backend generate Sanctum token yang berlaku 1 tahun
$sanctumToken = $user->createToken('api-token', ['*'], now()->addYear());
// Sanctum disimpan di database personal_access_tokens
```

### **4. API → DB: Store Refresh Token (7 days)**
```php
// Backend simpan refresh token di database
DB::table('refresh_tokens')->insert([
  'user_id' => $user->id,
  'token' => hash('sha256', $refreshToken),
  'expires_at' => now()->addDays(7)
]);
```

### **5. API → Client: Return all tokens**
```json
{
  "success": true,
  "data": {
    "user": { "id": 123, "email": "user@example.com" },
    "jwt_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "sanctum_token": "1|abcdef123456...",
    "refresh_token": "refresh_token_here",
    "expires_in": 3600
  }
}
```

---

## **✅ Fase 2: Normal API Usage (Baris 6-10)**

### **6. Client → API: API call with JWT**
```typescript
// Frontend menggunakan JWT untuk API call
const response = await fetch('/api/users', {
  headers: {
    'Authorization': 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...'
  }
});
```

### **7. API → JWT: Validate JWT**
```php
// Backend validasi JWT token
try {
  $user = JWTAuth::parseToken()->authenticate();
  // JWT valid, user authenticated
} catch (Exception $e) {
  // JWT invalid atau expired
}
```

### **8. JWT → API: Valid ✅**
```php
// JWT masih valid, user berhasil diauthenticate
return response()->json([
  'success' => true,
  'data' => $users
]);
```

### **9. API → Client: Response**
```json
{
  "success": true,
  "data": [
    { "id": 1, "name": "John Doe" },
    { "id": 2, "name": "Jane Smith" }
  ]
}
```

---

## **⚠️ Fase 3: JWT Expired Scenario (Baris 11-20)**

### **10. Client → API: API call with JWT**
```typescript
// Frontend masih menggunakan JWT yang sudah expired
const response = await fetch('/api/users', {
  headers: {
    'Authorization': 'Bearer expired_jwt_token_here'
  }
});
```

### **11. API → JWT: Validate JWT**
```php
// Backend coba validasi JWT
try {
  $user = JWTAuth::parseToken()->authenticate();
} catch (TokenExpiredException $e) {
  // JWT sudah expired! ❌
  // Sekarang coba Sanctum sebagai fallback
}
```

### **12. JWT → API: Expired ❌**
```php
// JWT expired, return error atau coba Sanctum
if ($jwtExpired) {
  // Coba Sanctum sebagai fallback
  $sanctumUser = $this->authenticateWithSanctum($request);
}
```

### **13. API → Sanctum: Validate Sanctum**
```php
// Backend coba validasi Sanctum token
$sanctumToken = $request->header('X-Sanctum-Token');
$accessToken = PersonalAccessToken::findToken($sanctumToken);

if ($accessToken && !$accessToken->expires_at?->isPast()) {
  // Sanctum masih valid! ✅
  $user = $accessToken->tokenable;
}
```

### **14. Sanctum → DB: Check token**
```sql
-- Database query untuk cek Sanctum token
SELECT * FROM personal_access_tokens 
WHERE token = 'hashed_token_here' 
AND expires_at > NOW();
```

### **15. DB → Sanctum: Valid ✅**
```php
// Database mengkonfirmasi Sanctum token masih valid
$tokenRecord = DB::table('personal_access_tokens')
  ->where('token', $hashedToken)
  ->where('expires_at', '>', now())
  ->first();

if ($tokenRecord) {
  // Token valid! ✅
}
```

### **16. Sanctum → API: User authenticated**
```php
// Sanctum berhasil mengauthenticate user
Auth::setUser($user);
Log::info('Using Sanctum fallback for user', ['user_id' => $user->id]);
```

### **17. API → Client: Response + Background JWT refresh**
```php
// API response dengan user data
$response = response()->json([
  'success' => true,
  'data' => $users
]);

// Background: Refresh JWT token
$this->refreshJWTInBackground($user);
```

### **18. Client → API: Background JWT refresh**
```typescript
// Frontend otomatis refresh JWT di background
const refreshResponse = await fetch('/api/auth/refresh', {
  method: 'POST',
  body: JSON.stringify({
    refresh_token: localStorage.getItem('refresh_token')
  })
});

// Update JWT token
const newJWT = refreshResponse.data.jwt_token;
localStorage.setItem('jwt_token', newJWT);
```

---

## **🎯 Keuntungan Sistem Ini**

### **1. Performance (JWT)**
- ✅ **Fast**: Validasi JWT tanpa database query
- ✅ **Stateless**: Tidak perlu koneksi database
- ✅ **Scalable**: Bisa handle banyak request

### **2. Reliability (Sanctum)**
- ✅ **Fallback**: Jika JWT expired, Sanctum masih bisa digunakan
- ✅ **Long-lived**: Sanctum berlaku 1 tahun
- ✅ **Revokable**: Bisa dibatalkan kapan saja

### **3. Security (Refresh Token)**
- ✅ **Auto-refresh**: JWT otomatis diperbarui
- ✅ **Short-lived**: JWT hanya 1 jam
- ✅ **Rotatable**: Refresh token bisa di-rotate

---

## **�� Implementasi Praktis**

### **Frontend (React)**
```typescript
class SmartAuth {
  async apiCall(endpoint: string) {
    try {
      // 1. Coba dengan JWT dulu (fast)
      return await this.callWithJWT(endpoint);
    } catch (error) {
      if (error.status === 401) {
        // 2. JWT expired, coba Sanctum
        const result = await this.callWithSanctum(endpoint);
        
        // 3. Background refresh JWT
        this.refreshJWTInBackground();
        
        return result;
      }
      throw error;
    }
  }
}
```

### **Backend (Laravel)**
```php
class UnifiedAuthMiddleware {
  public function handle($request, $next) {
    // 1. Try JWT first (fast)
    $user = $this->authenticateWithJWT($request);
    
    if (!$user) {
      // 2. JWT failed, try Sanctum (reliable)
      $user = $this->authenticateWithSanctum($request);
    }
    
    if ($user) {
      Auth::setUser($user);
      return $next($request);
    }
    
    return response()->json(['error' => 'Unauthorized'], 401);
  }
}
```

---

## **�� Perbandingan Token**

| Token | Durasi | Kecepatan | Database | Use Case |
|-------|--------|-----------|----------|----------|
| **JWT** | 1 jam | ⚡ Fast | ❌ No | Primary API calls |
| **Sanctum** | 1 tahun | 🐌 Slow | ✅ Yes | Fallback security |
| **Refresh** | 7 hari | 🐌 Slow | ✅ Yes | Auto-renew JWT |

**Kesimpulan**: Sistem ini memberikan **best of both worlds** - kecepatan JWT dengan keamanan Sanctum! 🚀
