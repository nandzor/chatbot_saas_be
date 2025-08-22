import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ProtectedRoute, PublicRoute } from './components/ProtectedRoute';
import { Login } from './components/Login';

// Example Dashboard Component
const Dashboard = () => {
  const { user, logout } = useAuth();
  
  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold">Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span>Welcome, {user?.name}</span>
              <button
                onClick={logout}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 flex items-center justify-center">
            <h2 className="text-2xl font-bold text-gray-500">
              Welcome to your Dashboard!
            </h2>
          </div>
        </div>
      </main>
    </div>
  );
};

// Example API Usage Component
const ApiExample = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const { authService } = useAuth();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await authService.getApi().get('/v1/users');
      setUsers(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Users List</h2>
      {loading ? (
        <div>Loading users...</div>
      ) : (
        <div className="space-y-2">
          {users.map(user => (
            <div key={user.id} className="p-4 border rounded">
              <h3 className="font-semibold">{user.name}</h3>
              <p className="text-gray-600">{user.email}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Main App Component
const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route 
            path="/login" 
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } 
          />
          
          {/* Protected Routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/api-example" 
            element={
              <ProtectedRoute>
                <ApiExample />
              </ProtectedRoute>
            } 
          />
          
          {/* Default redirect */}
          <Route 
            path="/" 
            element={<Navigate to="/dashboard" replace />} 
          />
          
          {/* 404 route */}
          <Route 
            path="*" 
            element={
              <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-4xl font-bold text-gray-900">404</h1>
                  <p className="text-gray-600">Page not found</p>
                  <a 
                    href="/dashboard" 
                    className="text-indigo-600 hover:text-indigo-500"
                  >
                    Go to Dashboard
                  </a>
                </div>
              </div>
            } 
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
