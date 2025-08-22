import React, { createContext, useContext, useState, useEffect } from 'react';
import { getUserAvatarData } from '@/utils/avatarUtils';

// Import toaster hook safely
const useToaster = () => {
  try {
    const { useToaster: useToasterHook } = require('@/components/ui/Toaster');
    return useToasterHook();
  } catch {
    return { addToast: () => {} };
  }
};

// Test users dengan 3 role berbeda
export const testUsers = [
  {
    id: 1,
    username: 'superadmin',
    password: 'super123',
    name: 'Super Administrator',
    email: 'superadmin@system.com',
    role: 'superadmin',
    avatar: getUserAvatarData('superadmin@system.com', 'Super Administrator').avatar,
    permissions: ['*'], // All permissions
    description: 'Full system access across all organizations'
  },
  {
    id: 2,
    username: 'orgadmin',
    password: 'admin123',
    name: 'Ahmad Rahman',
    email: 'ahmad.rahman@company.com',
    role: 'organization_admin',
    organizationId: 'org-001',
    organizationName: 'PT Teknologi Nusantara',
    avatar: getUserAvatarData('ahmad.rahman@company.com', 'Ahmad Rahman').avatar,
    permissions: ['handle_chats', 'manage_users', 'manage_agents', 'manage_settings', 'view_analytics', 'manage_billing', 'manage_automations'],
    description: 'Organization administrator with full org management access'
  },
  {
    id: 3,
    username: 'agent1',
    password: 'agent123',
    name: 'Sari Dewi',
    email: 'sari.dewi@company.com',
    role: 'agent',
    organizationId: 'org-001',
    organizationName: 'PT Teknologi Nusantara',
    avatar: getUserAvatarData('sari.dewi@company.com', 'Sari Dewi').avatar,
    specialization: 'Customer Support',
    permissions: ['handle_chats', 'view_conversations', 'update_profile'],
    description: 'Customer support agent with chat handling capabilities'
  }
];

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { addToast } = useToaster();

  // Check for existing session on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('chatbot_user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error parsing saved user data:', error);
        localStorage.removeItem('chatbot_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (username, password) => {
    setIsLoading(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Find user in test users
      const foundUser = testUsers.find(
        u => u.username === username && u.password === password
      );

      if (foundUser) {
        // Remove password from user object for security
        const { password: _, ...userWithoutPassword } = foundUser;
        
        setUser(userWithoutPassword);
        setIsAuthenticated(true);
        
        // Save to localStorage for persistence
        localStorage.setItem('chatbot_user', JSON.stringify(userWithoutPassword));
        
        // Show success notification
        addToast(`Selamat datang, ${userWithoutPassword.name}!`, 'success');
        
        setIsLoading(false);
        
        // Redirect based on role after successful login
        setTimeout(() => {
          switch (userWithoutPassword.role) {
            case 'superadmin':
              window.location.href = '/superadmin';
              break;
            case 'organization_admin':
              window.location.href = '/dashboard';
              break;
            case 'agent':
              window.location.href = '/agent';
              break;
            default:
              window.location.href = '/';
          }
        }, 500);
        
        return { success: true, user: userWithoutPassword };
      } else {
        setIsLoading(false);
        addToast('Username atau password salah', 'error');
        return { success: false, error: 'Username atau password salah' };
      }
    } catch (error) {
      setIsLoading(false);
      addToast('Terjadi kesalahan saat login', 'error');
      return { success: false, error: 'Terjadi kesalahan saat login' };
    }
  };

  const logout = () => {
    // Set loading state
    setIsLoading(true);
    
    // Show logout notification
    addToast('Logout berhasil', 'success');
    
    // Clear user data
    setUser(null);
    setIsAuthenticated(false);
    
    // Clear localStorage
    localStorage.removeItem('chatbot_user');
    
    // Clear any other stored data
    localStorage.removeItem('chatbot_session');
    sessionStorage.clear();
    
    // Force redirect to login page after a short delay
    setTimeout(() => {
      window.location.href = '/auth/login';
    }, 500);
  };

  const hasPermission = (permission) => {
    if (!user || !user.permissions) return false;
    return user.permissions.includes('*') || user.permissions.includes(permission);
  };

  const isRole = (role) => {
    return user?.role === role;
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    hasPermission,
    isRole,
    testUsers // Export test users for login page
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
