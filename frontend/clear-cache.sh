#!/bin/bash

# Clear Cache Script for ChatBot Pro
# This script clears all browser cache and local storage that might contain old redirects

echo "🧹 Clearing ChatBot Pro Cache..."

# Clear browser cache (if running in development)
if [ -d "node_modules/.vite" ]; then
    echo "📁 Clearing Vite cache..."
    rm -rf node_modules/.vite
fi

# Clear build cache
if [ -d "dist" ]; then
    echo "📁 Clearing build cache..."
    rm -rf dist
fi

# Clear npm cache
echo "📦 Clearing npm cache..."
npm cache clean --force

# Clear any temporary files
echo "🗑️ Clearing temporary files..."
find . -name "*.tmp" -delete
find . -name "*.log" -delete
find . -name ".DS_Store" -delete

echo "✅ Cache cleared successfully!"
echo "🚀 You can now run 'npm run dev' to start the development server"
echo "🌐 Open http://localhost:3002 in your browser"
echo "💡 If you still see redirects to /chatbot-saas/, clear your browser cache manually"
