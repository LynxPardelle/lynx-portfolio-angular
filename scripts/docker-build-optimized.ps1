#!/usr/bin/env pwsh
# =============================================================================
# Docker Build Hook Script for Optimized Angular Builds
# =============================================================================
# This script provides pre-build and post-build hooks for optimizing
# the Docker build process with Angular applications.
# =============================================================================

param(
    [string]$Stage = "all",
    [string]$Target = "production-no-ssr",
    [switch]$UseCache,
    [switch]$BuildKit,
    [switch]$Verbose
)

# Set script directory
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$ProjectRoot = Split-Path -Parent $ScriptDir

# Change to project directory
Set-Location $ProjectRoot

# Function to log messages
function Write-Log {
    param([string]$Message, [string]$Level = "INFO")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $color = switch ($Level) {
        "INFO" { "Green" }
        "WARN" { "Yellow" }
        "ERROR" { "Red" }
        default { "White" }
    }
    Write-Host "[$timestamp] [$Level] $Message" -ForegroundColor $color
}

# Enable Docker BuildKit for better caching
if ($BuildKit.IsPresent) {
    $env:DOCKER_BUILDKIT = "1"
    $env:COMPOSE_DOCKER_CLI_BUILD = "1"
    Write-Log "Docker BuildKit enabled"
}

# Pre-build optimizations
Write-Log "Starting Docker build optimization process..."
Write-Log "Stage: $Stage"
Write-Log "Target: $Target"

# Build arguments for optimization
$buildArgs = @(
    "build",
    "--target", $Target,
    "--build-arg", "NODE_ENV=production",
    "--build-arg", "NG_CLI_ANALYTICS=false",
    "--build-arg", "CI=true"
)

if ($UseCache.IsPresent) {
    $buildArgs += @(
        "--cache-from", "node:22-alpine",
        "--cache-from", "lynx-portfolio:latest"
    )
    Write-Log "Using build cache"
}

# Add tag
$buildArgs += @("-t", "lynx-portfolio:$Target")

# Add context
$buildArgs += "."

# Execute build
Write-Log "Executing Docker build..."
$buildStartTime = Get-Date

try {
    if ($Verbose.IsPresent) {
        $buildArgs += "--progress=plain"
        Write-Log "Build command: docker $($buildArgs -join ' ')"
    }
    
    & docker @buildArgs
    
    if ($LASTEXITCODE -ne 0) {
        throw "Docker build failed with exit code $LASTEXITCODE"
    }
} catch {
    Write-Log "Docker build failed: $($_.Exception.Message)" -Level "ERROR"
    exit 1
}

$buildEndTime = Get-Date
$buildDuration = $buildEndTime - $buildStartTime
Write-Log "Docker build completed successfully in $($buildDuration.ToString('mm\:ss'))"

# Post-build optimizations
Write-Log "Performing post-build optimizations..."

# Check image size
try {
    $imageSize = (docker image inspect lynx-portfolio:$Target --format="{{.Size}}") -as [long]
    $imageSizeMB = [math]::Round($imageSize / 1MB, 2)
    Write-Log "Image size: $imageSizeMB MB"
} catch {
    Write-Log "Could not determine image size" -Level "WARN"
}

# Clean up dangling images
Write-Log "Cleaning up dangling images..."
try {
    docker image prune -f | Out-Null
    Write-Log "Dangling images cleaned up"
} catch {
    Write-Log "Could not clean up dangling images" -Level "WARN"
}

# Display build layers for analysis
if ($Verbose.IsPresent) {
    Write-Log "Build layers:"
    docker history lynx-portfolio:$Target --format "table {{.CreatedBy}}\t{{.Size}}"
}

Write-Log "Docker build optimization completed successfully!"

# Optional: Run container to verify it works
if ($Stage -eq "verify") {
    Write-Log "Starting container verification..."
    $port = switch ($Target) {
        "production-no-ssr" { "6163" }
        "build" { "6162" }
        default { "8080" }
    }
    
    try {
        docker run -d --name lynx-portfolio-test -p "${port}:80" lynx-portfolio:$Target
        Start-Sleep -Seconds 10
        
        $response = Invoke-WebRequest -Uri "http://localhost:$port" -UseBasicParsing -TimeoutSec 10
        if ($response.StatusCode -eq 200) {
            Write-Log "Container verification successful"
        } else {
            Write-Log "Container verification failed: HTTP $($response.StatusCode)" -Level "ERROR"
        }
    } catch {
        Write-Log "Container verification failed: $($_.Exception.Message)" -Level "ERROR"
    } finally {
        docker stop lynx-portfolio-test 2>&1 | Out-Null
        docker rm lynx-portfolio-test 2>&1 | Out-Null
    }
}
