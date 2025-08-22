# Multi-stage build for Chatbot SaaS
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build the application
RUN npm run build:prod

# Production stage
FROM nginx:alpine

# Copy built application
COPY --from=builder /app/dist /usr/share/nginx/html/chatbot-saas

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy .htaccess for Apache compatibility
COPY public/.htaccess /usr/share/nginx/html/chatbot-saas/

# Create nginx user if it doesn't exist
RUN addgroup -g 1001 -S nginx && \
    adduser -S -D -H -u 1001 -h /var/cache/nginx -s /sbin/nologin -G nginx -g nginx nginx

# Set proper permissions
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/chatbot-saas/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
