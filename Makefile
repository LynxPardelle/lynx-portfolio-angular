# Global setup
# export COMPOSE_BAKE=true

# Variables
PROJECT_NAME=lynx-portfolio-angular

# Colors for output
CYAN=\033[0;36m
GREEN=\033[0;32m
YELLOW=\033[1;33m
RED=\033[0;31m
NC=\033[0m

# Commands
help:
	@echo "$(CYAN)🐳 Lynx Portfolio Angular - Docker Commands$(NC)"
	@echo "$(CYAN)============================================$(NC)"
	@echo "$(GREEN)Available commands:$(NC)"
	@echo "  dev           - Start development server"
	@echo "  prod          - Start production server with SSR"
	@echo "  prod-no-ssr   - Start production server without SSR"
	@echo "  stop          - Stop all containers"
	@echo "  clean         - Clean containers and volumes"
	@echo "  logs          - Show container logs"
	@echo "  rebuild       - Rebuild containers from scratch"
	@echo "  install       - Install package (use: make install pkg=package-name)"
	@echo "  install-dev   - Install dev package (use: make install-dev pkg=package-name)"
	@echo "  status        - Show container status"


dev:
	@echo "$(CYAN)🚀 Starting development server...$(NC)"
	@set "COMPOSE_BAKE=true" && docker-compose -p $(PROJECT_NAME) --profile dev up --build

prod:
	@echo "$(CYAN)🏗️ Starting production server with SSR...$(NC)"
	@set "COMPOSE_BAKE=true" && docker-compose -p $(PROJECT_NAME) --profile prod up --build

prod-no-ssr:
	@echo "$(CYAN)🏗️ Starting production server without SSR...$(NC)"
	@set "COMPOSE_BAKE=true" && docker-compose -p $(PROJECT_NAME) --profile production-no-ssr up --build

stop:
	@echo "$(CYAN)🛑 Stopping containers...$(NC)"
	docker-compose down

clean:
	@echo "$(CYAN)🧹 Cleaning containers and volumes...$(NC)"
	docker-compose down --volumes --remove-orphans
	@if exist "node_modules" rmdir /s /q node_modules
	@if exist "package-lock.json" del package-lock.json

logs:
	@echo "$(CYAN)📋 Showing container logs...$(NC)"
	docker-compose logs -f

rebuild:
	@echo "$(CYAN)🔄 Rebuilding containers...$(NC)"
	docker-compose down --volumes --remove-orphans
	@set "COMPOSE_BAKE=true" && docker-compose up --build

install:
	@echo "$(CYAN)📦 Installing package: $(pkg)$(NC)"
	docker-compose exec dev npm install $(pkg)

install-dev:
	@echo "$(CYAN)📦 Installing dev package: $(pkg)$(NC)"
	docker-compose exec dev npm install --save-dev $(pkg)

status:
	@echo "$(CYAN)📊 Container status:$(NC)"
	docker-compose ps

# WSL compatibility check
wsl-check:
	@echo "$(CYAN)🔍 Checking WSL compatibility...$(NC)"
	@if grep -q microsoft /proc/version 2>/dev/null; then \
		echo "$(GREEN)✅ Running in WSL environment$(NC)"; \
	else \
		echo "$(YELLOW)⚠️ Not detected as WSL environment$(NC)"; \
	fi
	@if command -v docker >/dev/null 2>&1; then \
		echo "$(GREEN)✅ Docker is available$(NC)"; \
		docker --version; \
	else \
		echo "$(RED)❌ Docker not found$(NC)"; \
	fi

# Debug compilation errors
debug:
	@echo "$(CYAN)🐛 Debug mode - checking for compilation errors...$(NC)"
	docker-compose exec dev ng build --configuration development || echo "$(RED)❌ Build failed - check logs above$(NC)"

.PHONY: help create dev prod prod-no-ssr stop clean logs rebuild install install-dev shell test-migration status wsl-check debug