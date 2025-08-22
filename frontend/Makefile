# Makefile for Chatbot SaaS Deployment
# This file provides easy commands for building and deploying the application

.PHONY: help build build-staging build-prod clean deploy deploy-staging deploy-prod deploy-full docker-build docker-run docker-stop docker-clean test lint

# Default target
help:
	@echo "🚀 Chatbot SaaS Deployment Commands"
	@echo ""
	@echo "📦 Build Commands:"
	@echo "  build          - Build for development"
	@echo "  build-staging  - Build for staging environment"
	@echo "  build-prod     - Build for production environment"
	@echo ""
	@echo "🚀 Deploy Commands:"
	@echo "  deploy         - Deploy to default environment"
	@echo "  deploy-staging - Deploy to staging environment"
	@echo "  deploy-prod    - Deploy to production environment"
	@echo "  deploy-full    - Build and deploy in one command"
	@echo ""
	@echo "🐳 Docker Commands:"
	@echo "  docker-build   - Build Docker image"
	@echo "  docker-run     - Run Docker container"
	@echo "  docker-stop    - Stop Docker container"
	@echo "  docker-clean   - Clean Docker resources"
	@echo ""
	@echo "🔧 Utility Commands:"
	@echo "  clean          - Clean build directory"
	@echo "  test           - Run tests"
	@echo "  lint           - Run linting"
	@echo "  install        - Install dependencies"
	@echo ""

# Install dependencies
install:
	@echo "📦 Installing dependencies..."
	npm install

# Build commands
build:
	@echo "🔨 Building for development..."
	npm run build

build-staging:
	@echo "🔨 Building for staging..."
	npm run build:staging

build-prod:
	@echo "🔨 Building for production..."
	npm run build:prod

# Deploy commands
deploy:
	@echo "🚀 Deploying to default environment..."
	./deploy.sh deploy

deploy-staging:
	@echo "🚀 Deploying to staging environment..."
	./deploy.sh deploy staging

deploy-prod:
	@echo "🚀 Deploying to production environment..."
	./deploy.sh deploy production

deploy-full:
	@echo "🚀 Building and deploying to production..."
	./deploy.sh full production

# Docker commands
docker-build:
	@echo "🐳 Building Docker image..."
	docker build -t chatbot-saas .

docker-run:
	@echo "🐳 Running Docker container..."
	docker-compose up -d

docker-stop:
	@echo "🐳 Stopping Docker container..."
	docker-compose down

docker-clean:
	@echo "🐳 Cleaning Docker resources..."
	docker-compose down -v --remove-orphans
	docker image prune -f
	docker container prune -f

# Utility commands
clean:
	@echo "🧹 Cleaning build directory..."
	rm -rf dist
	rm -rf node_modules/.cache

test:
	@echo "🧪 Running tests..."
	npm test

lint:
	@echo "🔍 Running linting..."
	npm run lint

lint-fix:
	@echo "🔍 Fixing linting issues..."
	npm run lint:fix

# Development commands
dev:
	@echo "🚀 Starting development server..."
	npm run dev

preview:
	@echo "👀 Starting preview server..."
	npm run preview

# Production commands
start:
	@echo "🚀 Starting production server..."
	npm start

# Health check
health:
	@echo "🏥 Checking application health..."
	curl -f http://localhost:8080/chatbot-saas/ || echo "❌ Application is not healthy"

# Show configuration
config:
	@echo "⚙️  Showing deployment configuration..."
	node deploy.config.js

# Show logs
logs:
	@echo "📋 Showing Docker logs..."
	docker-compose logs -f

# Backup
backup:
	@echo "💾 Creating backup..."
	tar -czf backup-$(shell date +%Y%m%d-%H%M%S).tar.gz dist/

# Restore
restore:
	@echo "📥 Restoring from backup..."
	@read -p "Enter backup filename: " backup_file; \
	tar -xzf $$backup_file

# Monitor
monitor:
	@echo "📊 Monitoring application..."
	watch -n 5 'curl -s http://localhost:8080/chatbot-saas/ | head -c 100'

# Security check
security-check:
	@echo "🔒 Running security checks..."
	npm audit
	npm outdated

# Update dependencies
update-deps:
	@echo "🔄 Updating dependencies..."
	npm update
	npm audit fix

# Show status
status:
	@echo "📊 Application Status:"
	@echo "  - Build directory: $(shell if [ -d "dist" ]; then echo "✅ Exists"; else echo "❌ Missing"; fi)"
	@echo "  - Docker containers: $(shell docker-compose ps --format "table {{.Name}}\t{{.Status}}")"
	@echo "  - Port 8080: $(shell if lsof -Pi :8080 -sTCP:LISTEN -t >/dev/null ; then echo "✅ In use"; else echo "❌ Available"; fi)"
