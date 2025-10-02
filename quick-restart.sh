#!/bin/bash

# Simple script untuk restart Queue, Reverb, dan Horizon
# Usage: ./quick-restart.sh

echo "🚀 Quick restart services..."

# Clear caches
echo "Clearing caches..."
docker exec cte_app php artisan config:clear
docker exec cte_app php artisan cache:clear
docker exec cte_app php artisan route:clear
docker exec cte_app php artisan view:clear

# Restart queue
echo "Restarting queue..."
docker exec cte_app php artisan queue:restart

# Restart horizon
echo "Restarting horizon..."
docker exec cte_app php artisan horizon:terminate

# Restart reverb
echo "Restarting reverb..."
docker exec cte_app php artisan reverb:restart

echo "✅ All services restarted!"
