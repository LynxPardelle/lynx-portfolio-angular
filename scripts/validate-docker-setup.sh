#!/bin/bash

# =============================================================================
# Docker Setup Validation Script
# =============================================================================
# This script validates the Docker configuration and ensures everything
# is set up correctly for the Lynx Portfolio Angular application.
# =============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Header
echo -e "${BLUE}🐳 Docker Setup Validation for Lynx Portfolio Angular${NC}"
echo -e "${BLUE}=====================================================${NC}"
echo

# Check if Docker is installed
print_status "Checking Docker installation..."
if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker --version)
    print_success "Docker is installed: $DOCKER_VERSION"
else
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
print_status "Checking Docker Compose installation..."
if command -v docker-compose &> /dev/null; then
    COMPOSE_VERSION=$(docker-compose --version)
    print_success "Docker Compose is installed: $COMPOSE_VERSION"
else
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Check if Docker daemon is running
print_status "Checking Docker daemon status..."
if docker info &> /dev/null; then
    print_success "Docker daemon is running"
else
    print_error "Docker daemon is not running. Please start Docker first."
    exit 1
fi

# Check required files
print_status "Checking required files..."
REQUIRED_FILES=("Dockerfile" "docker-compose.yml" ".env" "package.json" "nginx.conf")

for file in "${REQUIRED_FILES[@]}"; do
    if [[ -f "$file" ]]; then
        print_success "Found: $file"
    else
        print_error "Missing required file: $file"
        exit 1
    fi
done

# Check .dockerignore
if [[ -f ".dockerignore" ]]; then
    print_success "Found: .dockerignore"
else
    print_warning "Missing .dockerignore file (recommended but not required)"
fi

# Validate Dockerfile
print_status "Validating Dockerfile..."
if grep -q "FROM node:" Dockerfile && grep -q "AS development" Dockerfile; then
    print_success "Dockerfile appears to be properly structured"
else
    print_warning "Dockerfile might need review"
fi

# Validate docker-compose.yml
print_status "Validating docker-compose.yml..."
if docker-compose config &> /dev/null; then
    print_success "docker-compose.yml is valid"
else
    print_error "docker-compose.yml has syntax errors"
    exit 1
fi

# Check environment variables
print_status "Checking environment variables..."
if [[ -f ".env" ]]; then
    source .env
    if [[ -n "$APP_NAME" && -n "$DEV_PORT" && -n "$PROD_PORT" ]]; then
        print_success "Required environment variables are set"
        echo -e "  - APP_NAME: ${APP_NAME}"
        echo -e "  - DEV_PORT: ${DEV_PORT}"
        echo -e "  - PROD_PORT: ${PROD_PORT}"
    else
        print_warning "Some environment variables might be missing"
    fi
fi

# Check Angular project structure
print_status "Checking Angular project structure..."
if [[ -f "angular.json" && -f "package.json" && -d "src" ]]; then
    print_success "Angular project structure looks correct"
else
    print_warning "Angular project structure might be incomplete"
fi

# Test Docker build (development stage only)
print_status "Testing Docker build (development stage)..."
if docker build --target development -t lynx-portfolio-test . &> /dev/null; then
    print_success "Docker build test passed"
    # Clean up test image
    docker rmi lynx-portfolio-test &> /dev/null || true
else
    print_error "Docker build test failed"
    exit 1
fi

# Check available ports
print_status "Checking port availability..."
if [[ -n "$DEV_PORT" ]]; then
    if netstat -tuln 2>/dev/null | grep -q ":${DEV_PORT} "; then
        print_warning "Port $DEV_PORT appears to be in use"
    else
        print_success "Port $DEV_PORT is available"
    fi
fi

if [[ -n "$PROD_PORT" ]]; then
    if netstat -tuln 2>/dev/null | grep -q ":${PROD_PORT} "; then
        print_warning "Port $PROD_PORT appears to be in use"
    else
        print_success "Port $PROD_PORT is available"
    fi
fi

# System requirements check
print_status "Checking system requirements..."
AVAILABLE_MEMORY=$(free -m 2>/dev/null | awk 'NR==2{print $2}' || echo "unknown")
if [[ "$AVAILABLE_MEMORY" != "unknown" && "$AVAILABLE_MEMORY" -gt 2048 ]]; then
    print_success "Sufficient memory available: ${AVAILABLE_MEMORY}MB"
else
    print_warning "Limited memory available. Docker builds might be slow."
fi

# Final summary
echo
echo -e "${BLUE}📋 Validation Summary${NC}"
echo -e "${BLUE}===================${NC}"
print_success "Docker setup validation completed successfully!"
echo
echo -e "${GREEN}Next steps:${NC}"
echo -e "  1. Run 'make dev' to start development environment"
echo -e "  2. Run 'make prod' to test production build"
echo -e "  3. Run 'make help' to see all available commands"
echo
echo -e "${YELLOW}Useful commands:${NC}"
echo -e "  - make dev          # Start development server"
echo -e "  - make prod         # Start production server"
echo -e "  - make status       # Check container status"
echo -e "  - make logs         # View container logs"
echo -e "  - make clean        # Clean up containers"
echo

exit 0
