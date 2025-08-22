# Laravel Artisan Commands from Host

## Quick Start

### 1. Load Aliases (Optional)
```bash
source docker-aliases.sh
```

### 2. Run Artisan Commands
```bash
./artisan <command>
# or if aliases loaded:
artisan <command>
```

## Available Commands

### Basic Artisan Commands
```bash
./artisan --version                    # Check Laravel version
./artisan list                        # List all available commands
./artisan help <command>              # Get help for specific command
```

### Database Commands
```bash
./artisan migrate                      # Run migrations
./artisan migrate:status              # Check migration status
./artisan migrate:rollback            # Rollback last migration
./artisan migrate:fresh --seed        # Fresh install with seeding
./artisan db:seed                     # Run seeders
./artisan db:seed --class=UserSeeder  # Run specific seeder
```

### Cache Commands
```bash
./artisan cache:clear                 # Clear application cache
./artisan config:cache               # Cache configuration
./artisan route:cache                # Cache routes
./artisan view:cache                 # Cache views
./artisan optimize                   # Cache everything
```

### Queue Commands
```bash
./artisan queue:work                  # Start queue worker
./artisan queue:failed               # List failed jobs
./artisan queue:retry all            # Retry all failed jobs
./artisan queue:flush                # Flush all failed jobs
```

### Development Commands
```bash
./artisan test                        # Run tests
./artisan test --filter=UserTest     # Run specific test
./artisan tinker                     # Start Tinker REPL
./artisan serve                      # Start development server
```

### Make Commands
```bash
./artisan make:controller UserController
./artisan make:model User
./artisan make:migration create_users_table
./artisan make:seeder UserSeeder
./artisan make:middleware AuthMiddleware
```

## Docker Aliases (After loading docker-aliases.sh)

### Shortcuts
```bash
artisan migrate                       # Instead of ./artisan migrate
db-migrate                           # Same as above
db-seed                              # Run seeders
cache-clear                          # Clear cache
queue-work                           # Start queue worker
```

### Docker Compose Shortcuts
```bash
dcup                                 # docker compose up -d
dcdown                               # docker compose down
dcrestart                            # docker compose restart
dclogs                               # docker compose logs -f
dcps                                 # docker compose ps
```

### Container Access
```bash
dapp bash                            # Access app container
dworker bash                         # Access queue worker
dscheduler bash                      # Access scheduler
```

## Troubleshooting

### Container Not Running
```bash
# Start containers
docker compose up -d

# Check status
docker compose ps
```

### Container Unhealthy
```bash
# Check logs
docker compose logs app

# Restart container
docker compose restart app
```

### Permission Issues
```bash
# Make artisan executable
chmod +x artisan
```

### Environment Issues
```bash
# Check if .env is mounted
docker exec chatbot_saas_app ls -la /app/.env

# Verify environment variables
docker exec chatbot_saas_app php artisan env
```

## Examples

### Complete Development Workflow
```bash
# 1. Start containers
docker compose up -d

# 2. Load aliases
source docker-aliases.sh

# 3. Run migrations
db-migrate

# 4. Seed database
db-seed

# 5. Clear cache
cache-clear

# 6. Check status
health

# 7. View logs
logs
```

### Quick Commands
```bash
# Create new controller
./artisan make:controller Api/UserController --api

# Run specific test
./artisan test --filter=UserTest

# Check queue status
./artisan queue:failed

# Access Tinker
./artisan tinker
```

## Notes

- All commands run inside the Docker container
- Environment variables are automatically synced via volume mount
- Container health is checked before running commands
- Failed commands will show error messages with colored output
