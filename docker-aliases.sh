#!/bin/bash

# Docker and Laravel Aliases for ChatBot SaaS
# Source this file: source docker-aliases.sh

# Laravel Artisan Commands
alias artisan='./artisan'
alias art='./artisan'

# Docker Compose Shortcuts
alias dc='docker compose'
alias dcup='docker compose up -d'
alias dcdown='docker compose down'
alias dcrestart='docker compose restart'
alias dclogs='docker compose logs -f'
alias dcps='docker compose ps'

# Container Access
alias dapp='docker compose exec app'
alias dworker='docker compose exec queue-worker'
alias dscheduler='docker compose exec scheduler'

# Database Commands
alias db-migrate='./artisan migrate'
alias db-seed='./artisan db:seed'
alias db-fresh='./artisan migrate:fresh --seed'
alias db-rollback='./artisan migrate:rollback'

# Cache Commands
alias cache-clear='./artisan cache:clear'
alias config-cache='./artisan config:cache'
alias route-cache='./artisan route:cache'
alias view-cache='./artisan view:cache'

# Queue Commands
alias queue-work='./artisan queue:work'
alias queue-failed='./artisan queue:failed'
alias queue-retry='./artisan queue:retry all'

# Development Commands
alias test='./artisan test'
alias serve='./artisan serve --host=0.0.0.0 --port=8000'
alias tinker='./artisan tinker'

# Log Commands
alias logs='docker compose logs -f app'
alias logs-worker='docker compose logs -f queue-worker'
alias logs-scheduler='docker compose logs -f scheduler'

# Health Check
alias health='docker compose ps'

# Quick Restart
alias restart='docker compose restart app'

echo "Docker aliases loaded! Available commands:"
echo "  artisan, art          - Run artisan commands"
echo "  dc, dcup, dcdown      - Docker compose shortcuts"
echo "  dapp, dworker         - Access containers"
echo "  db-migrate, db-seed   - Database commands"
echo "  cache-clear           - Cache commands"
echo "  queue-work            - Queue commands"
echo "  logs, health          - Monitoring commands"
