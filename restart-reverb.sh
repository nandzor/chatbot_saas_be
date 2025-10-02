#!/bin/bash

# Laravel Services Restart Script
# Usage: ./restart.sh [reverb|queue|horizon|all]

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Container name
CONTAINER_NAME="cte_app"

# Function to print colored output
log() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

info() {
    echo -e "${CYAN}[INFO]${NC} $1"
}

debug() {
    echo -e "${PURPLE}[DEBUG]${NC} $1"
}

# Function to check if Reverb is running
is_reverb_running() {
    # Check if port 8081 is accessible
    if curl -s http://localhost:8081/apps/14823957/events > /dev/null 2>&1; then
        return 0
    fi
    return 1
}

# Function to start Laravel Reverb
start_reverb() {
    log "Starting Laravel Reverb server on port 8081..."

    if is_reverb_running; then
        warning "Laravel Reverb is already running"
        return 0
    fi

    # Start Reverb in background
    docker exec -d "$CONTAINER_NAME" php artisan reverb:start --host=0.0.0.0 --port=8081 --debug

    # Wait for startup
    sleep 3

    if is_reverb_running; then
        success "Laravel Reverb started successfully on port 8081"
    else
        error "Failed to start Laravel Reverb"
        return 1
    fi
}

# Function to stop Laravel Reverb
stop_reverb() {
    log "Stopping Laravel Reverb server..."

    if ! is_reverb_running; then
        warning "Laravel Reverb is not running"
        return 0
    fi

    # Send terminate signal to Reverb
    docker exec "$CONTAINER_NAME" php artisan reverb:stop 2>/dev/null || true

    # Wait for graceful shutdown
    sleep 3

    if ! is_reverb_running; then
        success "Laravel Reverb stopped successfully"
    else
        warning "Reverb still running, may need manual termination"
    fi
}

# Function to restart Laravel Reverb
restart_reverb() {
    log "Restarting Laravel Reverb server..."
    stop_reverb
    sleep 2
    start_reverb
}

# Function to start queue workers
start_queue() {
    log "Starting Laravel queue workers..."

    # Start queue workers in background
    docker exec -d "$CONTAINER_NAME" php artisan queue:work --verbose --tries=3 --timeout=90

    success "Queue workers started"
}

# Function to stop queue workers
stop_queue() {
    log "Stopping queue workers..."

    docker exec "$CONTAINER_NAME" bash -c "
        for pid in \$(ps aux | grep 'queue:work' | grep -v grep | awk '{print \$2}'); do
            kill \$pid 2>/dev/null || true
        done
    "

    success "Queue workers stopped"
}

# Function to restart queue workers
restart_queue() {
    log "Restarting queue workers..."
    stop_queue
    sleep 2
    start_queue
}

# Function to start Horizon
start_horizon() {
    log "Starting Laravel Horizon..."

    # Start Horizon in background
    docker exec -d "$CONTAINER_NAME" php artisan horizon

    success "Laravel Horizon started"
}

# Function to stop Horizon
stop_horizon() {
    log "Stopping Laravel Horizon..."

    # Send TERM signal to Horizon
    docker exec "$CONTAINER_NAME" php artisan horizon:terminate

    success "Laravel Horizon stopped"
}

# Function to restart Horizon
restart_horizon() {
    log "Restarting Laravel Horizon..."
    stop_horizon
    sleep 2
    start_horizon
}

# Function to clear caches
clear_caches() {
    log "Clearing Laravel caches..."

    docker exec "$CONTAINER_NAME" php artisan config:clear
    docker exec "$CONTAINER_NAME" php artisan cache:clear
    docker exec "$CONTAINER_NAME" php artisan route:clear
    docker exec "$CONTAINER_NAME" php artisan view:clear

    success "Caches cleared successfully"
}

# Function to show status
show_status() {
    echo -e "${BLUE}=== Laravel Services Status ===${NC}"

    # Check Reverb
    if is_reverb_running; then
        success "Laravel Reverb: ✅ Running (port 8081)"
    else
        error "Laravel Reverb: ❌ Not running"
    fi

    # Check Queue Workers (check if jobs are being processed)
    if docker exec "$CONTAINER_NAME" php artisan queue:work --once --timeout=1 > /dev/null 2>&1; then
        success "Queue Workers: ✅ Running"
    else
        error "Queue Workers: ❌ Not running"
    fi

    # Check Horizon (check if Horizon status command works)
    if docker exec "$CONTAINER_NAME" php artisan horizon:status > /dev/null 2>&1; then
        success "Laravel Horizon: ✅ Running"
    else
        error "Laravel Horizon: ❌ Not running"
    fi

    # Test Reverb connection
    if curl -s http://localhost:8081/apps/14823957/events > /dev/null 2>&1; then
        success "Reverb Connection: ✅ Accessible"
    else
        warning "Reverb Connection: ⚠️ Not accessible"
    fi
}

# Function to restart all services
restart_all() {
    log "Restarting all Laravel services..."

    clear_caches
    stop_queue
    stop_horizon
    stop_reverb

    sleep 3

    start_queue
    start_horizon
    start_reverb

    success "All services restarted successfully!"
}

# Main script logic
case "${1:-all}" in
    "reverb")
        restart_reverb
        ;;
    "queue")
        restart_queue
        ;;
    "horizon")
        restart_horizon
        ;;
    "all")
        restart_all
        ;;
    "status")
        show_status
        ;;
    "start")
        case "${2:-all}" in
            "reverb")
                start_reverb
                ;;
            "queue")
                start_queue
                ;;
            "horizon")
                start_horizon
                ;;
            "all")
                start_queue
                start_horizon
                start_reverb
                ;;
            *)
                echo "Usage: $0 start [reverb|queue|horizon|all]"
                exit 1
                ;;
        esac
        ;;
    "stop")
        case "${2:-all}" in
            "reverb")
                stop_reverb
                ;;
            "queue")
                stop_queue
                ;;
            "horizon")
                stop_horizon
                ;;
            "all")
                stop_queue
                stop_horizon
                stop_reverb
                ;;
            *)
                echo "Usage: $0 stop [reverb|queue|horizon|all]"
                exit 1
                ;;
        esac
        ;;
    "help"|"-h"|"--help")
        echo "Laravel Services Management Script"
        echo ""
        echo "Usage: $0 [COMMAND] [SERVICE]"
        echo ""
        echo "Commands:"
        echo "  restart [reverb|queue|horizon|all]  Restart services (default: all)"
        echo "  start   [reverb|queue|horizon|all]  Start services"
        echo "  stop    [reverb|queue|horizon|all]  Stop services"
        echo "  status                              Show services status"
        echo "  help                                Show this help"
        echo ""
        echo "Examples:"
        echo "  $0                    # Restart all services"
        echo "  $0 restart reverb     # Restart only Reverb"
        echo "  $0 start queue        # Start only queue workers"
        echo "  $0 stop horizon       # Stop only Horizon"
        echo "  $0 status             # Show services status"
        ;;
    *)
        error "Unknown command: $1"
        echo "Use '$0 help' for usage information"
        exit 1
        ;;
esac
