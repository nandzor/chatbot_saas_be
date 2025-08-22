# 🚀 Chatbot SaaS Platform

A modern, professional chatbot management platform built with React, Vite, and Tailwind CSS.

## ✨ Features

- **🤖 Chatbot Management**: Create, configure, and manage multiple chatbots
- **📚 Knowledge Base**: Comprehensive Q&A and article management system
- **👥 User Management**: Role-based access control (Superadmin, Organization Admin, User)
- **📊 Analytics Dashboard**: Real-time insights and performance metrics
- **🔧 Settings Management**: Channels, bot personalities, team, billing, and more
- **📱 Responsive Design**: Mobile-first, modern UI/UX design
- **⚡ Performance**: Optimized with Vite and modern React patterns

## 🏗️ Architecture

```
src/
├── components/          # Reusable UI components
├── features/           # Feature-specific components
├── pages/             # Page components and routing
├── layouts/           # Layout components
├── hooks/             # Custom React hooks
├── contexts/          # React contexts
├── utils/             # Utility functions
├── data/              # Sample data and mockups
└── styles/            # Global styles and Tailwind config
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm 8+ or yarn 1.22+

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd chatbot-uiux

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:3000`

## 🛠️ Development

### Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run preview          # Preview production build

# Building
npm run build            # Build for development
npm run build:staging    # Build for staging
npm run build:prod       # Build for production

# Quality
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint issues
npm test                 # Run tests
```

### Environment Configuration

The application automatically detects the environment and configures the base URL:

- **Development**: `/` (localhost:3000)
- **Staging/Production**: `/chatbot-saas/` (your-domain.com/chatbot-saas/)

## 🚀 Deployment

### Method 1: Traditional Server Deployment

#### 1. Build the Application

```bash
# Build for production
npm run build:prod

# Or use the deployment script
./deploy.sh full production
```

#### 2. Server Configuration

**Apache (.htaccess)**
```apache
RewriteBase /chatbot-saas/
RewriteRule ^(.*)$ index.html [L]
```

**Nginx (nginx.conf)**
```nginx
location /chatbot-saas/ {
    alias /var/www/html/chatbot-saas/;
    try_files $uri $uri/ /chatbot-saas/index.html;
}
```

#### 3. Deploy Files

```bash
# Copy built files to server
sudo cp -r dist/* /var/www/html/chatbot-saas/

# Set permissions
sudo chown -R www-data:www-data /var/www/html/chatbot-saas/
sudo chmod -R 755 /var/www/html/chatbot-saas/
```

### Method 2: Docker Deployment

#### 1. Build and Run

```bash
# Build Docker image
make docker-build

# Run with Docker Compose
make docker-run

# Or manually
docker-compose up -d
```

#### 2. Access Application

- **Application**: http://localhost:8080/chatbot-saas/
- **Health Check**: http://localhost:8080/health

#### 3. Management

```bash
# Stop containers
make docker-stop

# View logs
make logs

# Clean up
make docker-clean
```

### Method 3: Vercel Deployment

#### 1. Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

#### 2. Configuration

The `vercel.json` file is pre-configured for the `/chatbot-saas/` base path.

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file:

```env
VITE_BASE_URL=/chatbot-saas/
VITE_API_BASE_URL=http://100.81.120.54:9999
VITE_APP_TITLE=Chatbot SaaS Platform
```

### Build Configuration

The `vite.config.js` automatically handles:

- Base URL configuration based on environment
- Path aliases for clean imports
- Build optimization settings

### Deployment Configuration

Use `deploy.config.js` for environment-specific settings:

```javascript
const config = require('./deploy.config.js');
const currentConfig = config.getConfig('production');
```

## 📁 File Structure

```
├── src/                    # Source code
├── public/                 # Public assets
│   └── .htaccess          # Apache configuration
├── dist/                   # Build output
├── deploy.sh               # Deployment script
├── deploy.config.js        # Deployment configuration
├── docker-compose.yml      # Docker configuration
├── Dockerfile              # Docker image definition
├── nginx.conf              # Nginx configuration
├── nginx-proxy.conf        # Nginx reverse proxy
├── vercel.json             # Vercel configuration
├── Makefile                # Build automation
└── README.md               # This file
```

## 🚀 Deployment Commands

### Using Makefile (Recommended)

```bash
# Show all available commands
make help

# Build and deploy
make deploy-full

# Docker operations
make docker-build
make docker-run
make docker-stop

# Utility commands
make clean
make status
make health
```

### Using Deployment Script

```bash
# Make executable
chmod +x deploy.sh

# Build and deploy
./deploy.sh full production

# Build only
./deploy.sh build production

# Deploy only
./deploy.sh deploy production
```

## 🔒 Security

### Security Headers

The application includes comprehensive security headers:

- **X-Content-Type-Options**: nosniff
- **X-Frame-Options**: DENY
- **X-XSS-Protection**: 1; mode=block
- **Referrer-Policy**: strict-origin-when-cross-origin
- **Strict-Transport-Security**: max-age=31536000 (HTTPS)

### Rate Limiting

Nginx configuration includes rate limiting:

- **API endpoints**: 10 requests/second
- **Login endpoints**: 5 requests/minute

## 📊 Monitoring

### Health Checks

```bash
# Application health
make health

# Docker status
make status

# Monitor in real-time
make monitor
```

### Logs

```bash
# Docker logs
make logs

# Or manually
docker-compose logs -f
```

## 🧪 Testing

### Run Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test file
npm test -- --testPathPattern=Knowledge
```

### Linting

```bash
# Check code quality
npm run lint

# Auto-fix issues
npm run lint:fix
```

## 🔄 CI/CD

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build:prod
      - run: npm run deploy:prod
```

## 🐛 Troubleshooting

### Common Issues

#### 1. "Not Found" Errors

**Problem**: Application shows 404 errors after deployment

**Solution**: 
- Verify base URL configuration in `vite.config.js`
- Check server configuration (`.htaccess` or `nginx.conf`)
- Ensure all routes serve `index.html`

#### 2. Assets Not Loading

**Problem**: CSS/JS files return 404

**Solution**:
- Check asset paths in built files
- Verify file permissions on server
- Clear browser cache

#### 3. Routing Issues

**Problem**: Direct URL access doesn't work

**Solution**:
- Configure server for SPA routing
- Ensure `index.html` is served for all routes
- Check base path configuration

### Debug Commands

```bash
# Check configuration
make config

# Verify build output
ls -la dist/
grep -r "/chatbot-saas/" dist/

# Test server configuration
curl -I http://your-domain.com/chatbot-saas/
```

## 📚 Documentation

- **Deployment Guide**: [DEPLOYMENT.md](./DEPLOYMENT.md)
- **API Documentation**: [API.md](./docs/API.md)
- **Component Library**: [COMPONENTS.md](./docs/COMPONENTS.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 🆘 Support

For support and questions:

- **Issues**: Create a GitHub issue
- **Documentation**: Check the docs folder
- **Deployment**: Refer to [DEPLOYMENT.md](./DEPLOYMENT.md)

---

**Built with ❤️ using React, Vite, and Tailwind CSS**
