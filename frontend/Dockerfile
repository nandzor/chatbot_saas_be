# Multi-stage build for Chatbot SaaS
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (include devDependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Build-time environment (forwarded from docker-compose build args)
ARG VITE_API_BASE_URL
ARG VITE_NODE_ENV
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL \
    VITE_NODE_ENV=${VITE_NODE_ENV:-production}

# Build the application
RUN npm run build:prod

# Production stage
FROM nginx:alpine

# Copy built application
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 3001

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
