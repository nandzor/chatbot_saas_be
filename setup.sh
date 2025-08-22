#!/bin/bash

# Chatbot SaaS Backend Setup Script
set -e

echo "🚀 Setting up Chatbot SaaS Backend..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is available
if ! docker compose version &> /dev/null; then
    print_error "Docker Compose is not available. Please install Docker Compose first."
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    print_status "Creating .env file from env.example..."
    cp env.example .env
    print_success ".env file created"
else
    print_warning ".env file already exists, skipping..."
fi

# Generate application key
print_status "Generating application key..."
if grep -q "APP_KEY=$" .env; then
    # Generate a random key
    APP_KEY=$(openssl rand -base64 32)
    sed -i "s/APP_KEY=$/APP_KEY=base64:${APP_KEY}/" .env
    print_success "Application key generated"
else
    print_warning "Application key already exists, skipping..."
fi

# Create necessary directories
print_status "Creating storage directories..."
mkdir -p storage/logs
mkdir -p storage/app/public
mkdir -p storage/framework/cache
mkdir -p storage/framework/sessions
mkdir -p storage/framework/views
mkdir -p bootstrap/cache
print_success "Storage directories created"

# Set proper permissions
print_status "Setting proper permissions..."
chmod -R 755 storage
chmod -R 755 bootstrap/cache
print_success "Permissions set"

# Stop any existing containers
print_status "Stopping existing containers..."
docker compose down --remove-orphans

# Build and start containers
print_status "Building and starting Docker containers..."
docker compose up -d --build

# Wait for services to be ready
print_status "Waiting for services to start..."
sleep 15

# Check if app container is healthy
print_status "Checking container health..."
if ! docker compose ps | grep -q "healthy.*app"; then
    print_warning "App container is not healthy yet. Checking logs..."
    docker compose logs app --tail 20
    print_status "Waiting additional time for services to stabilize..."
    sleep 10
fi

# Install Composer dependencies
print_status "Installing PHP dependencies..."
docker compose exec -T app composer install --optimize-autoloader --no-dev

# Run database migrations
print_status "Running database migrations..."
docker compose exec -T app php artisan migrate --force

# Create storage symlink
print_status "Creating storage symlink..."
docker compose exec -T app php artisan storage:link

# Cache configurations for better performance
print_status "Caching configurations..."
docker compose exec -T app php artisan config:cache
docker compose exec -T app php artisan route:cache
docker compose exec -T app php artisan view:cache

# Note: Spatie packages setup will be added when Laravel 12 compatible versions are available
print_status "Skipping Spatie packages setup (not yet compatible with Laravel 12)..."

# Check service health
print_status "Checking service health..."
sleep 5

# Test API health endpoint (using correct port 9000)
if curl -f http://localhost:9000/api/health > /dev/null 2>&1; then
    print_success "API health check passed"
else
    print_warning "API health check failed - service might still be starting"
    print_status "You can check the logs with: docker compose logs -f app"
fi

# Display service URLs
echo ""
print_success "🎉 Setup completed successfully!"
echo ""
echo -e "${BLUE}Service URLs:${NC}"
echo "  📡 API: http://localhost:9000"
echo "  🔒 API (HTTPS): https://localhost:8443"
echo "  🐰 RabbitMQ Management: http://localhost:15672 (admin/kambin)"
echo "  🗄️  PostgreSQL: localhost:5432 (postgres/kambin)"
echo "  📦 Redis: localhost:6379"
echo ""
echo -e "${BLUE}Useful Commands:${NC}"
echo "  🔍 View logs: docker compose logs -f"
echo "  🔧 Run artisan: docker compose exec app php artisan <command>"
echo "  🧪 Run tests: docker compose exec app php artisan test"
echo "  📊 Queue monitoring: docker compose exec app php artisan horizon"
echo "  🛑 Stop services: docker compose down"
echo ""
echo -e "${BLUE}Troubleshooting:${NC}"
echo "  🔧 If containers are unhealthy: docker compose logs -f"
echo "  🔄 Restart app: docker compose restart app"
echo "  🗑️  Clean restart: docker compose down && docker compose up -d"
echo ""
echo -e "${GREEN}Happy coding! 🚀${NC}"
