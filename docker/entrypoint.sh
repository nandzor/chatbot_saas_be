#!/bin/bash

# Exit on any error
set -e

echo "Starting Laravel application initialization..."

# Wait for database to be ready
echo "Waiting for PostgreSQL to be ready..."
until php -r "
    \$maxAttempts = 30;
    \$attempt = 0;
    while (\$attempt < \$maxAttempts) {
        try {
            \$pdo = new PDO('pgsql:host=postgres;port=5432;dbname=chatbot_saas', 'postgres', 'kambin');
            echo 'PostgreSQL is ready!';
            exit(0);
        } catch (PDOException \$e) {
            \$attempt++;
            if (\$attempt >= \$maxAttempts) {
                echo 'PostgreSQL connection failed after ' . \$maxAttempts . ' attempts';
                exit(1);
            }
            sleep(2);
        }
    }
"; do
    echo "Waiting for PostgreSQL..."
    sleep 2
done

# Wait for Redis to be ready
echo "Waiting for Redis to be ready..."
until php -r "
    \$maxAttempts = 30;
    \$attempt = 0;
    while (\$attempt < \$maxAttempts) {
        try {
            \$redis = new Redis();
            \$redis->connect('redis', 6379);
            echo 'Redis is ready!';
            exit(0);
        } catch (Exception \$e) {
            \$attempt++;
            if (\$attempt >= \$maxAttempts) {
                echo 'Redis connection failed after ' . \$maxAttempts . ' attempts';
                exit(1);
            }
            sleep(2);
        }
    }
"; do
    echo "Waiting for Redis..."
    sleep 2
done

# Wait for RabbitMQ to be ready (simplified)
echo "Waiting for RabbitMQ to be ready..."
for i in {1..15}; do
    if timeout 5 bash -c "</dev/tcp/rabbitmq/5672" 2>/dev/null; then
        echo "RabbitMQ is ready!"
        break
    fi
    echo "Waiting for RabbitMQ... attempt $i/15"
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
