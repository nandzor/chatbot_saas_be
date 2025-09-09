# Production Deployment Guide - Organization Management System

## Overview
This guide provides comprehensive instructions for deploying the Organization Management System to production. The system includes Laravel backend API, React frontend, PostgreSQL database, Redis caching, and real-time WebSocket support.

## Prerequisites

### System Requirements
- **Server**: Ubuntu 20.04+ or CentOS 8+
- **RAM**: Minimum 4GB, Recommended 8GB+
- **CPU**: Minimum 2 cores, Recommended 4+ cores
- **Storage**: Minimum 50GB SSD
- **Network**: Stable internet connection with static IP

### Software Requirements
- **PHP**: 8.1 or higher
- **Composer**: Latest version
- **Node.js**: 18+ and npm
- **PostgreSQL**: 13+
- **Redis**: 6+
- **Nginx**: Latest version
- **SSL Certificate**: Let's Encrypt or commercial certificate

## Environment Setup

### 1. Server Preparation
```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install required packages
sudo apt install -y software-properties-common curl wget git unzip

# Add PHP repository
sudo add-apt-repository ppa:ondrej/php -y
sudo apt update

# Install PHP and extensions
sudo apt install -y php8.1 php8.1-fpm php8.1-cli php8.1-common \
    php8.1-mysql php8.1-pgsql php8.1-zip php8.1-gd php8.1-mbstring \
    php8.1-curl php8.1-xml php8.1-bcmath php8.1-json php8.1-redis \
    php8.1-intl php8.1-xmlrpc php8.1-soap

# Install Composer
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install Redis
sudo apt install -y redis-server

# Install Nginx
sudo apt install -y nginx
```

### 2. Database Setup
```bash
# Switch to postgres user
sudo -u postgres psql

# Create database and user
CREATE DATABASE chatbot_saas_production;
CREATE USER chatbot_user WITH PASSWORD 'secure_password_here';
GRANT ALL PRIVILEGES ON DATABASE chatbot_saas_production TO chatbot_user;
\q

# Configure PostgreSQL
sudo nano /etc/postgresql/13/main/postgresql.conf

# Update these settings:
# listen_addresses = 'localhost'
# max_connections = 200
# shared_buffers = 256MB
# effective_cache_size = 1GB
# maintenance_work_mem = 64MB
# checkpoint_completion_target = 0.9
# wal_buffers = 16MB
# default_statistics_target = 100

# Restart PostgreSQL
sudo systemctl restart postgresql
sudo systemctl enable postgresql
```

### 3. Redis Configuration
```bash
# Configure Redis
sudo nano /etc/redis/redis.conf

# Update these settings:
# maxmemory 256mb
# maxmemory-policy allkeys-lru
# save 900 1
# save 300 10
# save 60 10000

# Restart Redis
sudo systemctl restart redis-server
sudo systemctl enable redis-server
```

## Application Deployment

### 1. Clone and Setup Application
```bash
# Create application directory
sudo mkdir -p /var/www/chatbot-saas
sudo chown -R $USER:$USER /var/www/chatbot-saas

# Clone repository
cd /var/www/chatbot-saas
git clone https://github.com/your-repo/chatbot-saas-be.git backend
git clone https://github.com/your-repo/chatbot-saas-fe.git frontend

# Set permissions
sudo chown -R www-data:www-data /var/www/chatbot-saas
sudo chmod -R 755 /var/www/chatbot-saas
```

### 2. Backend Setup
```bash
cd /var/www/chatbot-saas/backend

# Install dependencies
composer install --optimize-autoloader --no-dev

# Copy environment file
cp .env.example .env

# Configure environment
nano .env
```

### 3. Environment Configuration
```env
APP_NAME="Chatbot SaaS"
APP_ENV=production
APP_KEY=base64:your_app_key_here
APP_DEBUG=false
APP_URL=https://your-domain.com

LOG_CHANNEL=stack
LOG_LEVEL=error

DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=chatbot_saas_production
DB_USERNAME=chatbot_user
DB_PASSWORD=secure_password_here

BROADCAST_DRIVER=redis
CACHE_DRIVER=redis
FILESYSTEM_DISK=local
QUEUE_CONNECTION=redis
SESSION_DRIVER=redis
SESSION_LIFETIME=120

REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379

MAIL_MAILER=smtp
MAIL_HOST=your-smtp-host
MAIL_PORT=587
MAIL_USERNAME=your-email@domain.com
MAIL_PASSWORD=your-email-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@your-domain.com
MAIL_FROM_NAME="${APP_NAME}"

PUSHER_APP_ID=your-pusher-app-id
PUSHER_APP_KEY=your-pusher-app-key
PUSHER_APP_SECRET=your-pusher-app-secret
PUSHER_HOST=your-pusher-host
PUSHER_PORT=443
PUSHER_SCHEME=https
PUSHER_APP_CLUSTER=mt1

VITE_PUSHER_APP_KEY="${PUSHER_APP_KEY}"
VITE_PUSHER_HOST="${PUSHER_HOST}"
VITE_PUSHER_PORT="${PUSHER_PORT}"
VITE_PUSHER_SCHEME="${PUSHER_SCHEME}"
VITE_PUSHER_APP_CLUSTER="${PUSHER_APP_CLUSTER}"
```

### 4. Backend Deployment Commands
```bash
# Generate application key
php artisan key:generate

# Run database migrations
php artisan migrate --force

# Seed database
php artisan db:seed --force

# Clear and cache configuration
php artisan config:clear
php artisan config:cache
php artisan route:clear
php artisan route:cache
php artisan view:clear
php artisan view:cache

# Set storage permissions
sudo chown -R www-data:www-data storage
sudo chown -R www-data:www-data bootstrap/cache
sudo chmod -R 775 storage
sudo chmod -R 775 bootstrap/cache

# Create symbolic link for storage
php artisan storage:link
```

### 5. Frontend Setup
```bash
cd /var/www/chatbot-saas/frontend

# Install dependencies
npm install

# Build for production
npm run build

# Set permissions
sudo chown -R www-data:www-data /var/www/chatbot-saas/frontend/dist
sudo chmod -R 755 /var/www/chatbot-saas/frontend/dist
```

## Web Server Configuration

### 1. Nginx Configuration
```bash
# Create Nginx configuration
sudo nano /etc/nginx/sites-available/chatbot-saas
```

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;
    root /var/www/chatbot-saas/frontend/dist;
    index index.html;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript;

    # API routes
    location /api {
        try_files $uri $uri/ /index.php?$query_string;
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket support
    location /ws {
        proxy_pass http://127.0.0.1:6001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Frontend routes
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Logs
    access_log /var/log/nginx/chatbot-saas-access.log;
    error_log /var/log/nginx/chatbot-saas-error.log;
}
```

### 2. Enable Site and Restart Nginx
```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/chatbot-saas /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx
```

## SSL Certificate Setup

### 1. Install Certbot
```bash
sudo apt install -y certbot python3-certbot-nginx
```

### 2. Obtain SSL Certificate
```bash
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

### 3. Auto-renewal Setup
```bash
sudo crontab -e

# Add this line for auto-renewal
0 12 * * * /usr/bin/certbot renew --quiet
```

## Process Management

### 1. Create Systemd Service for Laravel
```bash
sudo nano /etc/systemd/system/chatbot-saas.service
```

```ini
[Unit]
Description=Chatbot SaaS Laravel Application
After=network.target

[Service]
Type=simple
User=www-data
Group=www-data
WorkingDirectory=/var/www/chatbot-saas/backend
ExecStart=/usr/bin/php artisan serve --host=127.0.0.1 --port=8000
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

### 2. Create Queue Worker Service
```bash
sudo nano /etc/systemd/system/chatbot-saas-queue.service
```

```ini
[Unit]
Description=Chatbot SaaS Queue Worker
After=network.target

[Service]
Type=simple
User=www-data
Group=www-data
WorkingDirectory=/var/www/chatbot-saas/backend
ExecStart=/usr/bin/php artisan queue:work redis --sleep=3 --tries=3 --max-time=3600
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

### 3. Create WebSocket Service
```bash
sudo nano /etc/systemd/system/chatbot-saas-websocket.service
```

```ini
[Unit]
Description=Chatbot SaaS WebSocket Server
After=network.target

[Service]
Type=simple
User=www-data
Group=www-data
WorkingDirectory=/var/www/chatbot-saas/backend
ExecStart=/usr/bin/php artisan websockets:serve --host=127.0.0.1 --port=6001
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

### 4. Start Services
```bash
# Reload systemd
sudo systemctl daemon-reload

# Start and enable services
sudo systemctl start chatbot-saas
sudo systemctl enable chatbot-saas

sudo systemctl start chatbot-saas-queue
sudo systemctl enable chatbot-saas-queue

sudo systemctl start chatbot-saas-websocket
sudo systemctl enable chatbot-saas-websocket

# Check status
sudo systemctl status chatbot-saas
sudo systemctl status chatbot-saas-queue
sudo systemctl status chatbot-saas-websocket
```

## Monitoring and Logging

### 1. Log Rotation Setup
```bash
sudo nano /etc/logrotate.d/chatbot-saas
```

```
/var/www/chatbot-saas/backend/storage/logs/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
    postrotate
        sudo systemctl reload chatbot-saas
    endscript
}

/var/log/nginx/chatbot-saas-*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
    postrotate
        sudo systemctl reload nginx
    endscript
}
```

### 2. Health Check Script
```bash
sudo nano /usr/local/bin/chatbot-saas-health-check.sh
```

```bash
#!/bin/bash

# Health check script for Chatbot SaaS
LOG_FILE="/var/log/chatbot-saas-health.log"
DATE=$(date '+%Y-%m-%d %H:%M:%S')

# Check if services are running
check_service() {
    local service=$1
    if systemctl is-active --quiet $service; then
        echo "[$DATE] $service: OK" >> $LOG_FILE
        return 0
    else
        echo "[$DATE] $service: FAILED" >> $LOG_FILE
        return 1
    fi
}

# Check database connection
check_database() {
    if php /var/www/chatbot-saas/backend/artisan tinker --execute="DB::connection()->getPdo();" > /dev/null 2>&1; then
        echo "[$DATE] Database: OK" >> $LOG_FILE
        return 0
    else
        echo "[$DATE] Database: FAILED" >> $LOG_FILE
        return 1
    fi
}

# Check Redis connection
check_redis() {
    if redis-cli ping > /dev/null 2>&1; then
        echo "[$DATE] Redis: OK" >> $LOG_FILE
        return 0
    else
        echo "[$DATE] Redis: FAILED" >> $LOG_FILE
        return 1
    fi
}

# Run checks
check_service "chatbot-saas"
check_service "chatbot-saas-queue"
check_service "chatbot-saas-websocket"
check_service "nginx"
check_service "postgresql"
check_service "redis-server"
check_database
check_redis

# Send alert if any service is down
if [ $? -ne 0 ]; then
    # Send email alert (configure with your email service)
    echo "Chatbot SaaS health check failed at $DATE" | mail -s "Chatbot SaaS Alert" admin@your-domain.com
fi
```

```bash
# Make script executable
sudo chmod +x /usr/local/bin/chatbot-saas-health-check.sh

# Add to crontab for every 5 minutes
sudo crontab -e

# Add this line
*/5 * * * * /usr/local/bin/chatbot-saas-health-check.sh
```

## Backup Strategy

### 1. Database Backup Script
```bash
sudo nano /usr/local/bin/chatbot-saas-backup.sh
```

```bash
#!/bin/bash

# Database backup script
BACKUP_DIR="/var/backups/chatbot-saas"
DATE=$(date '+%Y-%m-%d_%H-%M-%S')
DB_NAME="chatbot_saas_production"
DB_USER="chatbot_user"

# Create backup directory
mkdir -p $BACKUP_DIR

# Create database backup
pg_dump -h localhost -U $DB_USER -d $DB_NAME > $BACKUP_DIR/db_backup_$DATE.sql

# Compress backup
gzip $BACKUP_DIR/db_backup_$DATE.sql

# Keep only last 7 days of backups
find $BACKUP_DIR -name "db_backup_*.sql.gz" -mtime +7 -delete

echo "Database backup completed: db_backup_$DATE.sql.gz"
```

### 2. Application Backup Script
```bash
sudo nano /usr/local/bin/chatbot-saas-app-backup.sh
```

```bash
#!/bin/bash

# Application backup script
BACKUP_DIR="/var/backups/chatbot-saas"
DATE=$(date '+%Y-%m-%d_%H-%M-%S')
APP_DIR="/var/www/chatbot-saas"

# Create backup directory
mkdir -p $BACKUP_DIR

# Create application backup
tar -czf $BACKUP_DIR/app_backup_$DATE.tar.gz -C $APP_DIR .

# Keep only last 7 days of backups
find $BACKUP_DIR -name "app_backup_*.tar.gz" -mtime +7 -delete

echo "Application backup completed: app_backup_$DATE.tar.gz"
```

### 3. Setup Backup Cron Jobs
```bash
sudo crontab -e

# Add these lines
0 2 * * * /usr/local/bin/chatbot-saas-backup.sh
0 3 * * * /usr/local/bin/chatbot-saas-app-backup.sh
```

## Security Hardening

### 1. Firewall Configuration
```bash
# Install UFW
sudo apt install -y ufw

# Configure firewall
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### 2. Fail2Ban Setup
```bash
# Install Fail2Ban
sudo apt install -y fail2ban

# Configure Fail2Ban
sudo nano /etc/fail2ban/jail.local
```

```ini
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 3

[sshd]
enabled = true
port = ssh
logpath = /var/log/auth.log

[nginx-http-auth]
enabled = true
filter = nginx-http-auth
port = http,https
logpath = /var/log/nginx/error.log

[nginx-limit-req]
enabled = true
filter = nginx-limit-req
port = http,https
logpath = /var/log/nginx/error.log
maxretry = 10
```

### 3. PHP Security Configuration
```bash
sudo nano /etc/php/8.1/fpm/php.ini
```

```ini
# Security settings
expose_php = Off
allow_url_fopen = Off
allow_url_include = Off
display_errors = Off
log_errors = On
error_log = /var/log/php_errors.log
max_execution_time = 30
max_input_time = 30
memory_limit = 256M
post_max_size = 32M
upload_max_filesize = 32M
max_file_uploads = 20
```

## Performance Optimization

### 1. PHP-FPM Configuration
```bash
sudo nano /etc/php/8.1/fpm/pool.d/www.conf
```

```ini
[www]
user = www-data
group = www-data
listen = /run/php/php8.1-fpm.sock
listen.owner = www-data
listen.group = www-data
listen.mode = 0660

pm = dynamic
pm.max_children = 50
pm.start_servers = 5
pm.min_spare_servers = 5
pm.max_spare_servers = 35
pm.max_requests = 1000

slowlog = /var/log/php8.1-fpm-slow.log
request_slowlog_timeout = 10s
```

### 2. Redis Optimization
```bash
sudo nano /etc/redis/redis.conf
```

```ini
# Performance settings
maxmemory 512mb
maxmemory-policy allkeys-lru
tcp-keepalive 300
timeout 0
```

## Deployment Checklist

### Pre-deployment
- [ ] Server requirements met
- [ ] SSL certificate obtained
- [ ] Database configured
- [ ] Redis configured
- [ ] Environment variables set
- [ ] Dependencies installed

### Deployment
- [ ] Application code deployed
- [ ] Database migrations run
- [ ] Database seeded
- [ ] Frontend built
- [ ] Services configured
- [ ] Nginx configured
- [ ] SSL certificate installed

### Post-deployment
- [ ] Services started and enabled
- [ ] Health checks passing
- [ ] Monitoring configured
- [ ] Backup strategy implemented
- [ ] Security hardening applied
- [ ] Performance optimization applied
- [ ] Documentation updated

## Troubleshooting

### Common Issues

1. **Service won't start**
   ```bash
   sudo systemctl status chatbot-saas
   sudo journalctl -u chatbot-saas -f
   ```

2. **Database connection issues**
   ```bash
   sudo -u postgres psql -c "SELECT version();"
   php artisan tinker --execute="DB::connection()->getPdo();"
   ```

3. **Permission issues**
   ```bash
   sudo chown -R www-data:www-data /var/www/chatbot-saas
   sudo chmod -R 755 /var/www/chatbot-saas
   ```

4. **Nginx configuration issues**
   ```bash
   sudo nginx -t
   sudo systemctl reload nginx
   ```

### Log Locations
- Application logs: `/var/www/chatbot-saas/backend/storage/logs/`
- Nginx logs: `/var/log/nginx/`
- System logs: `/var/log/syslog`
- PHP logs: `/var/log/php_errors.log`

This deployment guide provides a comprehensive foundation for deploying the Organization Management System to production with proper security, monitoring, and backup strategies.
