#!/bin/bash

# Simple Laravel Queue Workers Script
# Focus on running processes in background without complex detection

set -e

CONTAINER_NAME="cte_app"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check if Docker container is running
check_container() {
    if ! docker ps | grep -q "$CONTAINER_NAME"; then
        error "Docker container '$CONTAINER_NAME' is not running!"
        exit 1
    fi
    success "Docker container '$CONTAINER_NAME' is running"
}

# Start Laravel Horizon
start_horizon() {
    log "Starting Laravel Horizon..."

    # Check if Horizon is already running
    if docker exec "$CONTAINER_NAME" php artisan horizon:status > /dev/null 2>&1; then
        warning "Laravel Horizon is already running"
        return 0
    fi

    # Start Horizon in background
    docker exec -d "$CONTAINER_NAME" bash -c "nohup php artisan horizon > /dev/null 2>&1 &"

    # Wait and check
    sleep 3
    if docker exec "$CONTAINER_NAME" php artisan horizon:status > /dev/null 2>&1; then
        success "Laravel Horizon started successfully"
    else
        error "Failed to start Laravel Horizon"
        return 1
    fi
}

# Start queue workers
start_queue_workers() {
    log "Starting queue workers..."

    # Define queues
    local queues=("default" "payment" "billing" "notifications" "webhooks" "high_priority" "whatsapp-messages")

    for queue in "${queues[@]}"; do
        log "Starting queue worker for '$queue'..."

        # Start queue worker in background
        docker exec -d "$CONTAINER_NAME" bash -c "
            nohup php artisan queue:work redis \
                --queue='$queue' \
                --sleep=3 \
                --tries=3 \
                --max-time=3600 \
                --memory=512 \
                --timeout=60 \
                > /dev/null 2>&1 &
        "

        success "Queue worker for '$queue' started"
        sleep 1
    done
}

# Stop all processes
stop_all() {
    log "Stopping all queue processes..."

    # Stop Horizon
    if docker exec "$CONTAINER_NAME" php artisan horizon:status > /dev/null 2>&1; then
        log "Stopping Horizon..."
        docker exec "$CONTAINER_NAME" php artisan horizon:terminate || true
        success "Horizon stopped"
    fi

    # Stop queue workers
    log "Stopping queue workers..."
    docker exec "$CONTAINER_NAME" pkill -f "queue:work" || true
    success "Queue workers stopped"
}

# Show status
show_status() {
    log "Checking status..."

    echo -e "\n${BLUE}=== Laravel Horizon ===${NC}"
    if docker exec "$CONTAINER_NAME" php artisan horizon:status > /dev/null 2>&1; then
        success "Horizon is running"
    else
        warning "Horizon is not running"
    fi

    echo -e "\n${BLUE}=== Queue Workers ===${NC}"
    # Simple check - if we can't find the process, assume it's not running
    if docker exec "$CONTAINER_NAME" pgrep -f "queue:work" > /dev/null 2>&1; then
        success "Queue workers are running"
    else
        warning "No queue workers detected (they might still be starting up)"
    fi
}

# Main function
main() {
    case "${1:-start}" in
        "start")
            check_container
            start_horizon
            start_queue_workers
            show_status
            ;;
        "stop")
            check_container
            stop_all
            ;;
        "restart")
            check_container
            stop_all
            sleep 2
            start_horizon
            start_queue_workers
            show_status
            ;;
        "status")
            check_container
            show_status
            ;;
        "horizon")
            check_container
            start_horizon
            ;;
        "queue")
            check_container
            start_queue_workers
            ;;
        *)
            echo "Usage: $0 {start|stop|restart|status|horizon|queue}"
            echo ""
            echo "Commands:"
            echo "  start     - Start all queue processes (default)"
            echo "  stop      - Stop all queue processes"
            echo "  restart   - Restart all queue processes"
            echo "  status    - Show status of all processes"
            echo "  horizon   - Start only Laravel Horizon"
            echo "  queue     - Start only queue workers"
            echo ""
            echo "Examples:"
            echo "  $0 start                    # Start everything"
            echo "  $0 status                  # Check status"
            echo "  $0 stop                    # Stop everything"
            exit 1
            ;;
    esac
}

main "$@"
