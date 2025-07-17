#!/usr/bin/env pwsh
# =============================================================================
# Optimized Angular Build Script for Production
# =============================================================================
# This script provides optimized builds for Angular applications with various
# performance optimizations and caching strategies.
# =============================================================================

param(
    [string]$Configuration = "production",
    [string]$Target = "static",
    [switch]$UseCache,
    [switch]$Parallel,
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
    Write-Host "[$timestamp] [$Level] $Message" -ForegroundColor $(
        switch ($Level) {
            "INFO" { "Green" }
            "WARN" { "Yellow" }
            "ERROR" { "Red" }
            default { "White" }
        }
    )
}

# Pre-build optimizations
Write-Log "Starting optimized Angular build process..."
Write-Log "Configuration: $Configuration"
Write-Log "Target: $Target"

# Set environment variables for optimization
$env:NODE_ENV = "production"
$env:NG_CLI_ANALYTICS = "false"
$env:CI = "true"

# Clear previous build artifacts
Write-Log "Cleaning previous build artifacts..."
if (Test-Path "dist") {
    Remove-Item -Recurse -Force "dist"
}
if (Test-Path ".angular/cache" -and -not $UseCache.IsPresent) {
    Remove-Item -Recurse -Force ".angular/cache"
}

# Create cache directory if it doesn't exist
if (-not (Test-Path ".angular/cache")) {
    New-Item -ItemType Directory -Path ".angular/cache" -Force | Out-Null
}

# Build command based on target
$buildArgs = @(
    "build",
    "--configuration=$Configuration"
)

if ($Target -eq "static") {
    $buildArgs += @("--prerender=false", "--ssr=false")
    Write-Log "Building static production bundle..."
} elseif ($Target -eq "ssr") {
    Write-Log "Building SSR production bundle..."
} else {
    Write-Log "Unknown target: $Target" -Level "ERROR"
    exit 1
}

if ($Verbose.IsPresent) {
    $buildArgs += "--verbose"
}

# Execute build
Write-Log "Executing: ng $($buildArgs -join ' ')"
$buildStartTime = Get-Date

try {
    & ng @buildArgs
    if ($LASTEXITCODE -ne 0) {
        throw "Build failed with exit code $LASTEXITCODE"
    }
} catch {
    Write-Log "Build failed: $($_.Exception.Message)" -Level "ERROR"
    exit 1
}

$buildEndTime = Get-Date
$buildDuration = $buildEndTime - $buildStartTime
Write-Log "Build completed successfully in $($buildDuration.ToString('mm\:ss'))"

# Post-build optimizations
Write-Log "Performing post-build optimizations..."

# Display build statistics
if (Test-Path "dist") {
    $distSize = (Get-ChildItem -Path "dist" -Recurse -File | Measure-Object -Property Length -Sum).Sum
    $distSizeMB = [math]::Round($distSize / 1MB, 2)
    Write-Log "Total build size: $distSizeMB MB"
}

# Clean up temporary files
Write-Log "Cleaning up temporary files..."
if (Test-Path ".angular/cache" -and -not $UseCache.IsPresent) {
    Remove-Item -Recurse -Force ".angular/cache"
}

Write-Log "Build process completed successfully!"
