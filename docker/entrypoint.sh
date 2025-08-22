#!/bin/bash

# Exit on any error
set -e

echo "Starting Laravel application initialization..."

# Wait for database to be ready
echo "Waiting for PostgreSQL to be ready..."
until nc -z postgres 5432; do
  echo "Waiting for PostgreSQL..."
  sleep 2
done

# Wait for Redis to be ready
echo "Waiting for Redis to be ready..."
until nc -z redis 6379; do
  echo "Waiting for Redis..."
  sleep 2
done

# Wait for RabbitMQ to be ready
echo "Waiting for RabbitMQ to be ready..."
until nc -z rabbitmq 5672; do
  echo "Waiting for RabbitMQ..."
  sleep 2
done

# Run database migrations
echo "Running database migrations..."
php artisan migrate --force

# Clear and cache configurations
echo "Optimizing application..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Create storage symlink if it doesn't exist
if [ ! -L "/app/public/storage" ]; then
    php artisan storage:link
fi

# Start supervisor to manage background processes
echo "Starting supervisor..."
/usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf &

# Start cron daemon
echo "Starting cron..."
service cron start

echo "Application initialization completed!"

# Execute the main command
exec "$@"
