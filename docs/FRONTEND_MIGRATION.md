# 🚀 Frontend Migration Guide

## 📋 **Overview**
Panduan ini membantu developer frontend untuk migrasi dari old routes ke new robust API routes.

## 🔄 **Route Changes**

### **Before (Old Routes)**
```javascript
// ❌ OLD - Don't use these anymore
const API_BASE = '/api/admin';

// User Management
const usersApi = `${API_BASE}/users`;
const rolesApi = `${API_BASE}/roles`;
const permissionsApi = `${API_BASE}/permissions`;
const organizationsApi = `${API_BASE}/organizations`;
```

### **After (New Robust Routes)**
```javascript
// ✅ NEW - Use these robust routes
const API_BASE = '/api/v1';

// User Management
const usersApi = `${API_BASE}/users`;
const rolesApi = `${API_BASE}/roles`;
const permissionsApi = `${API_BASE}/permissions`;
const organizationsApi = `${API_BASE}/organizations`;
```

## 📡 **API Endpoint Mapping**

### **User Management**
| Old Endpoint | New Endpoint | Method | Permission |
|--------------|--------------|--------|------------|
| `/api/admin/users` | `/api/v1/users` | GET | `users.view` |
| `/api/admin/users/{id}` | `/api/v1/users/{id}` | GET | `users.view` |
| `/api/admin/users` | `/api/v1/users` | POST | `users.create` |
| `/api/admin/users/{id}` | `/api/v1/users/{id}` | PUT | `users.update` |
| `/api/admin/users/{id}` | `/api/v1/users/{id}` | DELETE | `users.delete` |
| `/api/admin/users/statistics` | `/api/v1/users/statistics` | GET | `users.view` |
| `/api/admin/users/search` | `/api/v1/users/search` | GET | `users.view` |
| `/api/admin/users/bulk-action` | `/api/v1/users/bulk-update` | PATCH | `users.bulk_update` |

### **Role Management**
| Old Endpoint | New Endpoint | Method | Permission |
|--------------|--------------|--------|------------|
| `/api/admin/roles` | `/api/v1/roles` | GET | `roles.view` |
| `/api/admin/roles/{id}` | `/api/v1/roles/{id}` | GET | `roles.view` |
| `/api/admin/roles` | `/api/v1/roles` | POST | `roles.create` |
| `/api/admin/roles/{id}` | `/api/v1/roles/{id}` | PUT | `roles.update` |
| `/api/admin/roles/{id}` | `/api/v1/roles/{id}` | DELETE | `roles.delete` |
| `/api/admin/roles/statistics` | `/api/v1/roles/statistics` | GET | `roles.view` |
| `/api/admin/roles/assign` | `/api/v1/roles/assign` | POST | `roles.assign` |
| `/api/admin/roles/revoke` | `/api/v1/roles/revoke` | POST | `roles.revoke` |

### **Permission Management**
| Old Endpoint | New Endpoint | Method | Permission |
|--------------|--------------|--------|------------|
| `/api/admin/permissions` | `/api/v1/permissions` | GET | `permissions.view` |
| `/api/admin/permissions/{id}` | `/api/v1/permissions/{id}` | GET | `permissions.view` |
| `/api/admin/permissions` | `/api/v1/permissions` | POST | `permissions.create` |
| `/api/admin/permissions/{id}` | `/api/v1/permissions/{id}` | PUT | `permissions.update` |
| `/api/admin/permissions/{id}` | `/api/v1/permissions/{id}` | DELETE | `permissions.delete` |
| `/api/admin/permissions/groups` | `/api/v1/permissions/groups` | GET | `permissions.view` |

### **Organization Management**
| Old Endpoint | New Endpoint | Method | Permission |
|--------------|--------------|--------|------------|
| `/api/admin/organizations` | `/api/v1/organizations` | GET | `organizations.view` |
| `/api/admin/organizations/{id}` | `/api/v1/organizations/{id}` | GET | `organizations.view` |
| `/api/admin/organizations` | `/api/v1/organizations` | POST | `organizations.create` |
| `/api/admin/organizations/{id}` | `/api/v1/organizations/{id}` | PUT | `organizations.update` |
| `/api/admin/organizations/{id}` | `/api/v1/organizations/{id}` | DELETE | `organizations.delete` |
| `/api/admin/organizations/statistics` | `/api/v1/organizations/statistics` | GET | `organizations.view` |

## 🔧 **Implementation Examples**

### **1. Update API Service**
```javascript
// ❌ OLD
class UserService {
    constructor() {
        this.baseUrl = '/api/admin/users';
    }
    
    async getUsers() {
        return axios.get(this.baseUrl);
    }
}

// ✅ NEW
class UserService {
    constructor() {
        this.baseUrl = '/api/v1/users';
    }
    
    async getUsers(params = {}) {
        return axios.get(this.baseUrl, { params });
    }
    
    async createUser(userData) {
        return axios.post(this.baseUrl, userData);
    }
    
    async updateUser(id, userData) {
        return axios.put(`${this.baseUrl}/${id}`, userData);
    }
    
    async deleteUser(id) {
        return axios.delete(`${this.baseUrl}/${id}`);
    }
    
    async getUserStatistics() {
        return axios.get(`${this.baseUrl}/statistics`);
    }
    
    async searchUsers(query, filters = {}) {
        return axios.get(`${this.baseUrl}/search`, {
            params: { query, ...filters }
        });
    }
}
```

### **2. Update React Components**
```javascript
// ❌ OLD
const UserList = () => {
    const [users, setUsers] = useState([]);
    
    useEffect(() => {
        // Old endpoint
        fetch('/api/admin/users')
            .then(res => res.json())
            .then(data => setUsers(data));
    }, []);
    
    return <div>...</div>;
};

// ✅ NEW
const UserList = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({});
    
    const fetchUsers = async (params = {}) => {
        setLoading(true);
        try {
            const response = await userService.getUsers(params);
            setUsers(response.data.data);
            setPagination(response.data.meta.pagination);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        fetchUsers();
    }, []);
    
    return (
        <div>
            {loading ? <LoadingSpinner /> : (
                <UserTable 
                    users={users} 
                    pagination={pagination}
                    onPageChange={(page) => fetchUsers({ page })}
                />
            )}
        </div>
    );
};
```

### **3. Update Permission Checks**
```javascript
// ❌ OLD - Inline permission checks
const canCreateUser = user.permissions.includes('users.create');

// ✅ NEW - Use permission utilities
import { hasPermission } from '@/utils/permissionUtils';

const canCreateUser = hasPermission('users.create');
const canManageUsers = hasPermission('users.*');
const canViewOrCreate = hasAnyPermission(['users.view', 'users.create']);
```

## 🚨 **Breaking Changes**

### **1. Response Format Changes**
```javascript
// ❌ OLD Response Format
{
    "users": [...],
    "total": 100,
    "page": 1
}

// ✅ NEW Response Format
{
    "success": true,
    "message": "Users retrieved successfully",
    "data": [...],
    "meta": {
        "pagination": {
            "current_page": 1,
            "per_page": 15,
            "total": 100,
            "last_page": 7
        }
    }
}
```

### **2. Error Handling Changes**
```javascript
// ❌ OLD Error Handling
try {
    const response = await api.get('/users');
    // Handle success
} catch (error) {
    console.error(error.message);
}

// ✅ NEW Error Handling
try {
    const response = await api.get('/users');
    // Handle success
} catch (error) {
    if (error.response?.data) {
        const { message, detail, errors } = error.response.data;
        console.error('API Error:', message);
        console.error('Details:', detail);
        console.error('Validation Errors:', errors);
    }
}
```

## 📱 **Frontend Components Update**

### **1. Update API Configuration**
```javascript
// config/api.js
export const API_CONFIG = {
    // ✅ NEW - Use robust endpoints
    BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:8000',
    V1_BASE: '/api/v1',
    ADMIN_BASE: '/api/admin',
    
    // Management endpoints
    USERS: '/api/v1/users',
    ROLES: '/api/v1/roles',
    PERMISSIONS: '/api/v1/permissions',
    ORGANIZATIONS: '/api/v1/organizations',
    
    // Admin-only endpoints
    ADMIN_DASHBOARD: '/api/admin/dashboard',
    ADMIN_MAINTENANCE: '/api/admin/maintenance',
    ADMIN_ANALYTICS: '/api/admin/analytics',
};
```

### **2. Update Service Classes**
```javascript
// services/UserService.js
import { API_CONFIG } from '@/config/api';

export class UserService {
    constructor() {
        this.baseUrl = API_CONFIG.USERS;
    }
    
    async getUsers(params = {}) {
        const response = await axios.get(this.baseUrl, { params });
        return response.data;
    }
    
    async createUser(userData) {
        const response = await axios.post(this.baseUrl, userData);
        return response.data;
    }
    
    async updateUser(id, userData) {
        const response = await axios.put(`${this.baseUrl}/${id}`, userData);
        return response.data;
    }
    
    async deleteUser(id) {
        const response = await axios.delete(`${this.baseUrl}/${id}`);
        return response.data;
    }
    
    async getUserStatistics() {
        const response = await axios.get(`${this.baseUrl}/statistics`);
        return response.data;
    }
    
    async searchUsers(query, filters = {}) {
        const response = await axios.get(`${this.baseUrl}/search`, {
            params: { query, ...filters }
        });
        return response.data;
    }
    
    async bulkUpdateUsers(userIds, data) {
        const response = await axios.patch(`${this.baseUrl}/bulk-update`, {
            user_ids: userIds,
            data
        });
        return response.data;
    }
    
    async toggleUserStatus(id) {
        const response = await axios.patch(`${this.baseUrl}/${id}/toggle-status`);
        return response.data;
    }
    
    async restoreUser(id) {
        const response = await axios.patch(`${this.baseUrl}/${id}/restore`);
        return response.data;
    }
}
```

## 🧪 **Testing Updates**

### **1. Update API Mocks**
```javascript
// tests/mocks/api.js
export const mockUsersResponse = {
    success: true,
    message: 'Users retrieved successfully',
    data: [
        { id: 1, name: 'John Doe', email: 'john@example.com' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
    ],
    meta: {
        pagination: {
            current_page: 1,
            per_page: 15,
            total: 2,
            last_page: 1
        }
    }
};
```

### **2. Update Test Cases**
```javascript
// tests/components/UserList.test.js
describe('UserList Component', () => {
    it('should fetch users from new API endpoint', async () => {
        // Mock the new API endpoint
        apiMock.get('/api/v1/users').mockResolvedValue({
            data: mockUsersResponse
        });
        
        render(<UserList />);
        
        await waitFor(() => {
            expect(screen.getByText('John Doe')).toBeInTheDocument();
        });
    });
});
```

## 📋 **Migration Checklist**

### **Phase 1: Update API Configuration**
- [ ] Update API base URLs
- [ ] Update service classes
- [ ] Update API constants

### **Phase 2: Update Components**
- [ ] Update API calls in components
- [ ] Update response handling
- [ ] Update error handling

### **Phase 3: Update Tests**
- [ ] Update API mocks
- [ ] Update test cases
- [ ] Update test utilities

### **Phase 4: Testing & Validation**
- [ ] Test all endpoints
- [ ] Validate response formats
- [ ] Test error scenarios
- [ ] Test permission system

### **Phase 5: Cleanup**
- [ ] Remove old API references
- [ ] Remove unused imports
- [ ] Update documentation

## 🚀 **Benefits of Migration**

### **1. Better Performance**
- Optimized database queries
- Efficient pagination
- Better caching

### **2. Enhanced Security**
- Robust permission system
- Better input validation
- Audit logging

### **3. Improved Maintainability**
- Consistent API structure
- Better error handling
- Comprehensive documentation

### **4. Future-Proof**
- Scalable architecture
- Easy to extend
- Industry best practices

## 📞 **Support**

Jika ada pertanyaan atau masalah selama migrasi, silakan:
1. Cek dokumentasi ini
2. Lihat API documentation
3. Hubungi backend team
4. Buat issue di repository
