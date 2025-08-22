# 🚀 Frontend React JSX - Unified Authentication

Frontend React application dengan sistem authentication yang menggabungkan JWT + Sanctum + Refresh Token.

## 📋 Features

- ✅ **Unified Authentication** - JWT + Sanctum + Refresh Token
- ✅ **Automatic Token Management** - Background refresh dan fallback
- ✅ **Protected Routes** - Route protection dengan authentication
- ✅ **Modern UI** - Tailwind CSS styling
- ✅ **Responsive Design** - Mobile-friendly interface

## 🏗️ Project Structure

```
frontend/src/
├── components/
│   ├── Login.jsx              # Login form component
│   └── ProtectedRoute.jsx     # Route protection components
├── contexts/
│   └── AuthContext.jsx        # React authentication context
├── services/
│   └── AuthService.jsx        # Authentication service
└── App.jsx                    # Main application component
```

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Environment Setup
Create `.env` file:
```env
REACT_APP_API_URL=http://localhost:8000/api
```

### 3. Start Development Server
```bash
npm start
```

The app will be available at `http://localhost:3000`

## 🎯 Usage Examples

### Authentication Flow

```jsx
import { useAuth } from './contexts/AuthContext';

const MyComponent = () => {
  const { user, login, logout, isAuthenticated } = useAuth();

  const handleLogin = async () => {
    try {
      await login('user@example.com', 'password', true);
      // Redirect will be handled automatically
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <div>
      {isAuthenticated ? (
        <div>
          <p>Welcome, {user?.name}!</p>
          <button onClick={logout}>Logout</button>
        </div>
      ) : (
        <button onClick={handleLogin}>Login</button>
      )}
    </div>
  );
};
```

### Protected Routes

```jsx
import { ProtectedRoute } from './components/ProtectedRoute';

const App = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
};
```

### API Calls

```jsx
import { useAuth } from './contexts/AuthContext';

const ApiComponent = () => {
  const { authService } = useAuth();

  const fetchData = async () => {
    try {
      // Automatic token management - no need to handle tokens manually
      const response = await authService.getApi().get('/v1/users');
      console.log(response.data);
    } catch (error) {
      console.error('API call failed:', error);
    }
  };

  return <button onClick={fetchData}>Fetch Data</button>;
};
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `REACT_APP_API_URL` | Backend API URL | `http://localhost:8000/api` |

### Proxy Configuration

The app is configured to proxy API requests to the Laravel backend:

```json
{
  "proxy": "http://localhost:8000"
}
```

## 🎨 Styling

This project uses **Tailwind CSS** for styling. To customize:

1. Install Tailwind CSS:
```bash
npm install -D tailwindcss autoprefixer postcss
npx tailwindcss init -p
```

2. Configure `tailwind.config.js`:
```js
module.exports = {
  content: ["./src/**/*.{js,jsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

3. Add Tailwind directives to `src/index.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

## 🔒 Authentication Features

### Token Management
- **JWT Token**: Fast API calls (1 hour expiry)
- **Sanctum Token**: Reliable fallback (1 year expiry)
- **Refresh Token**: Auto-renew JWT (7 days expiry)

### Automatic Features
- ✅ Background token refresh
- ✅ Automatic fallback to Sanctum
- ✅ Seamless user experience
- ✅ Token rotation for security

### Security Features
- ✅ Rate limiting
- ✅ Token validation
- ✅ Secure storage
- ✅ Automatic logout on token expiry

## 📱 Responsive Design

The application is fully responsive and works on:
- ✅ Desktop browsers
- ✅ Tablet devices
- ✅ Mobile phones
- ✅ Progressive Web App (PWA) ready

## 🧪 Testing

### Run Tests
```bash
npm test
```

### Test Coverage
```bash
npm test -- --coverage --watchAll=false
```

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Environment Setup
1. Set `REACT_APP_API_URL` to your production API URL
2. Ensure HTTPS is enabled
3. Configure CORS on backend if needed

### Deployment Options
- **Netlify**: Drag and drop `build` folder
- **Vercel**: Connect GitHub repository
- **AWS S3**: Upload `build` folder to S3 bucket
- **Docker**: Use nginx to serve static files

## 🔧 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure backend CORS is configured
   - Check `REACT_APP_API_URL` is correct

2. **Authentication Issues**
   - Check browser console for errors
   - Verify tokens are stored in localStorage
   - Ensure backend is running

3. **Build Errors**
   - Clear `node_modules` and reinstall
   - Check for syntax errors in JSX files

### Debug Mode
Enable debug logging in browser console:
```js
localStorage.setItem('debug', 'auth:*');
```

## 📚 API Integration

### Backend Requirements
- Laravel backend with unified authentication
- CORS configured for frontend domain
- API endpoints matching frontend expectations

### API Endpoints Used
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Token refresh
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - User logout
- `GET /api/v1/users` - Example API call

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

## 📄 License

This project is licensed under the MIT License.

---

**Happy Coding! 🚀**
