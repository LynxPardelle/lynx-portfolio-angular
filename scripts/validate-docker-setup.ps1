# =============================================================================
# Docker Setup Validation Script (PowerShell)
# =============================================================================
# This script validates the Docker configuration and ensures everything
# is set up correctly for the Lynx Portfolio Angular application.
# =============================================================================

# Set error action preference
$ErrorActionPreference = "Stop"

# Color functions
function Write-Info {
    param($Message)
    Write-Host "[INFO] $Message" -ForegroundColor Blue
}

function Write-Success {
    param($Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-Warning {
    param($Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param($Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

# Header
Write-Host "🐳 Docker Setup Validation for Lynx Portfolio Angular" -ForegroundColor Blue
Write-Host "=====================================================" -ForegroundColor Blue
Write-Host ""

# Check if Docker is installed
Write-Info "Checking Docker installation..."
try {
    $dockerVersion = docker --version
    Write-Success "Docker is installed: $dockerVersion"
} catch {
    Write-Error "Docker is not installed. Please install Docker Desktop first."
    exit 1
}

# Check if Docker Compose is installed
Write-Info "Checking Docker Compose installation..."
try {
    $composeVersion = docker-compose --version
    Write-Success "Docker Compose is installed: $composeVersion"
} catch {
    Write-Error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
}

# Check if Docker daemon is running
Write-Info "Checking Docker daemon status..."
try {
    docker info | Out-Null
    Write-Success "Docker daemon is running"
} catch {
    Write-Error "Docker daemon is not running. Please start Docker Desktop first."
    exit 1
}

# Check required files
Write-Info "Checking required files..."
$requiredFiles = @("Dockerfile", "docker-compose.yml", ".env", "package.json", "nginx.conf")

foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Success "Found: $file"
    } else {
        Write-Error "Missing required file: $file"
        exit 1
    }
}

# Check .dockerignore
if (Test-Path ".dockerignore") {
    Write-Success "Found: .dockerignore"
} else {
    Write-Warning "Missing .dockerignore file (recommended but not required)"
}

# Validate Dockerfile
Write-Info "Validating Dockerfile..."
$dockerfileContent = Get-Content "Dockerfile" -Raw
if ($dockerfileContent -match "FROM node:" -and $dockerfileContent -match "AS development") {
    Write-Success "Dockerfile appears to be properly structured"
} else {
    Write-Warning "Dockerfile might need review"
}

# Validate docker-compose.yml
Write-Info "Validating docker-compose.yml..."
try {
    docker-compose config | Out-Null
    Write-Success "docker-compose.yml is valid"
} catch {
    Write-Error "docker-compose.yml has syntax errors"
    exit 1
}

# Check environment variables
Write-Info "Checking environment variables..."
if (Test-Path ".env") {
    $envContent = Get-Content ".env"
    $appName = ($envContent | Where-Object { $_ -match "^APP_NAME=" }) -replace "APP_NAME=", ""
    $devPort = ($envContent | Where-Object { $_ -match "^DEV_PORT=" }) -replace "DEV_PORT=", ""
    $prodPort = ($envContent | Where-Object { $_ -match "^PROD_PORT=" }) -replace "PROD_PORT=", ""
    
    if ($appName -and $devPort -and $prodPort) {
        Write-Success "Required environment variables are set"
        Write-Host "  - APP_NAME: $appName"
        Write-Host "  - DEV_PORT: $devPort"
        Write-Host "  - PROD_PORT: $prodPort"
    } else {
        Write-Warning "Some environment variables might be missing"
    }
}

# Check Angular project structure
Write-Info "Checking Angular project structure..."
if ((Test-Path "angular.json") -and (Test-Path "package.json") -and (Test-Path "src")) {
    Write-Success "Angular project structure looks correct"
} else {
    Write-Warning "Angular project structure might be incomplete"
}

# Test Docker build (development stage only)
Write-Info "Testing Docker build (development stage)..."
try {
    docker build --target development -t lynx-portfolio-test . | Out-Null
    Write-Success "Docker build test passed"
    # Clean up test image
    try { docker rmi lynx-portfolio-test | Out-Null } catch {}
} catch {
    Write-Error "Docker build test failed"
    exit 1
}

# Check available ports
Write-Info "Checking port availability..."
if ($devPort) {
    $portInUse = Get-NetTCPConnection -LocalPort $devPort -ErrorAction SilentlyContinue
    if ($portInUse) {
        Write-Warning "Port $devPort appears to be in use"
    } else {
        Write-Success "Port $devPort is available"
    }
}

if ($prodPort) {
    $portInUse = Get-NetTCPConnection -LocalPort $prodPort -ErrorAction SilentlyContinue
    if ($portInUse) {
        Write-Warning "Port $prodPort appears to be in use"
    } else {
        Write-Success "Port $prodPort is available"
    }
}

# System requirements check
Write-Info "Checking system requirements..."
$totalMemory = [math]::Round((Get-CimInstance Win32_PhysicalMemory | Measure-Object -Property capacity -Sum).sum / 1mb)
if ($totalMemory -gt 2048) {
    Write-Success "Sufficient memory available: ${totalMemory}MB"
} else {
    Write-Warning "Limited memory available. Docker builds might be slow."
}

# Final summary
Write-Host ""
Write-Host "📋 Validation Summary" -ForegroundColor Blue
Write-Host "===================" -ForegroundColor Blue
Write-Success "Docker setup validation completed successfully!"
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Green
Write-Host "  1. Run 'make dev' to start development environment"
Write-Host "  2. Run 'make prod' to test production build"
Write-Host "  3. Run 'make help' to see all available commands"
Write-Host ""
Write-Host "Useful commands:" -ForegroundColor Yellow
Write-Host "  - make dev          # Start development server"
Write-Host "  - make prod         # Start production server"
Write-Host "  - make status       # Check container status"
Write-Host "  - make logs         # View container logs"
Write-Host "  - make clean        # Clean up containers"
Write-Host ""

exit 0
