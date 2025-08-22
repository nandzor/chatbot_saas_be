#!/bin/bash

# Chatbot SaaS Deployment Script
# This script helps deploy the application to different environments

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="chatbot-saas"
BUILD_DIR="dist"
DEPLOY_DIR="/var/www/html/$APP_NAME"  # Change this to your actual deploy path

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

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to build the application
build_app() {
    local env=$1
    
    print_status "Building application for $env environment..."
    
    case $env in
        "staging")
            npm run build:staging
            ;;
        "production")
            npm run build:prod
            ;;
        *)
            npm run build
            ;;
    esac
    
    if [ $? -eq 0 ]; then
        print_success "Build completed successfully!"
    else
        print_error "Build failed!"
        exit 1
    fi
}

# Function to deploy the application
deploy_app() {
    local env=$1
    
    print_status "Deploying to $env environment..."
    
    # Check if build directory exists
    if [ ! -d "$BUILD_DIR" ]; then
        print_error "Build directory not found. Please run build first."
        exit 1
    fi
    
    # Create deploy directory if it doesn't exist
    if [ ! -d "$DEPLOY_DIR" ]; then
        print_status "Creating deploy directory: $DEPLOY_DIR"
        sudo mkdir -p "$DEPLOY_DIR"
    fi
    
    # Copy files to deploy directory
    print_status "Copying files to deploy directory..."
    sudo cp -r "$BUILD_DIR"/* "$DEPLOY_DIR/"
    
    # Copy .htaccess file if using Apache
    if [ -f "public/.htaccess" ]; then
        print_status "Copying .htaccess file..."
        sudo cp "public/.htaccess" "$DEPLOY_DIR/"
    fi
    
    # Set proper permissions
    print_status "Setting proper permissions..."
    sudo chown -R www-data:www-data "$DEPLOY_DIR"
    sudo chmod -R 755 "$DEPLOY_DIR"
    
    print_success "Deployment completed successfully!"
    print_status "Application deployed to: $DEPLOY_DIR"
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  build [env]     Build the application (env: staging, production, default)"
    echo "  deploy [env]    Deploy the application (env: staging, production, default)"
    echo "  full [env]      Build and deploy in one command"
    echo "  clean           Clean build directory"
    echo "  help            Show this help message"
    echo ""
    echo "Environments:"
    echo "  staging         Build/deploy for staging environment"
    echo "  production      Build/deploy for production environment"
    echo "  default         Build/deploy for default environment (if no env specified)"
    echo ""
    echo "Examples:"
    echo "  $0 build staging"
    echo "  $0 deploy production"
    echo "  $0 full staging"
    echo "  $0 clean"
}

# Function to clean build directory
clean_build() {
    print_status "Cleaning build directory..."
    if [ -d "$BUILD_DIR" ]; then
        rm -rf "$BUILD_DIR"
        print_success "Build directory cleaned!"
    else
        print_warning "Build directory does not exist."
    fi
}

# Main script logic
main() {
    local action=$1
    local env=$2
    
    case $action in
        "build")
            build_app "${env:-default}"
            ;;
        "deploy")
            deploy_app "${env:-default}"
            ;;
        "full")
            build_app "${env:-default}"
            deploy_app "${env:-default}"
            ;;
        "clean")
            clean_build
            ;;
        "help"|"--help"|"-h")
            show_usage
            ;;
        *)
            print_error "Unknown action: $action"
            show_usage
            exit 1
            ;;
    esac
}

# Check if no arguments provided
if [ $# -eq 0 ]; then
    show_usage
    exit 1
fi

# Run main function
main "$@"
