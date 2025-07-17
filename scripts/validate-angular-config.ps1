#!/usr/bin/env pwsh
# =============================================================================
# Angular Configuration Validation Script
# =============================================================================
# This script validates the Angular configuration for compatibility with Angular 19
# =============================================================================

param(
    [switch]$Verbose
)

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

Write-Log "Starting Angular configuration validation..."

# Check if angular.json exists
if (-not (Test-Path "angular.json")) {
    Write-Log "angular.json not found!" -Level "ERROR"
    exit 1
}

# Check if package.json exists
if (-not (Test-Path "package.json")) {
    Write-Log "package.json not found!" -Level "ERROR"
    exit 1
}

# Parse angular.json to check for deprecated properties
try {
    $angularConfig = Get-Content "angular.json" | ConvertFrom-Json
    Write-Log "angular.json parsed successfully"
} catch {
    Write-Log "Failed to parse angular.json: $($_.Exception.Message)" -Level "ERROR"
    exit 1
}

# Check for deprecated properties in production configuration
$productionConfig = $angularConfig.projects.'lynx-portfolio'.architect.build.configurations.production

$deprecatedProperties = @(
    "buildOptimizer",
    "aot",
    "vendorChunk",
    "commonChunk",
    "progress",
    "statsJson"
)

$foundDeprecated = @()
foreach ($prop in $deprecatedProperties) {
    if ($productionConfig.PSObject.Properties.Name -contains $prop) {
        $foundDeprecated += $prop
    }
}

if ($foundDeprecated.Count -gt 0) {
    Write-Log "Found deprecated properties in angular.json production configuration:" -Level "ERROR"
    foreach ($prop in $foundDeprecated) {
        Write-Log "  - $prop" -Level "ERROR"
    }
    Write-Log "These properties are not valid in Angular 19. Please remove them." -Level "ERROR"
    exit 1
} else {
    Write-Log "No deprecated properties found in angular.json"
}

# Check for required properties
$requiredProperties = @(
    "optimization",
    "outputHashing",
    "extractLicenses",
    "sourceMap"
)

$missingProperties = @()
foreach ($prop in $requiredProperties) {
    if (-not ($productionConfig.PSObject.Properties.Name -contains $prop)) {
        $missingProperties += $prop
    }
}

if ($missingProperties.Count -gt 0) {
    Write-Log "Missing required properties in angular.json production configuration:" -Level "WARN"
    foreach ($prop in $missingProperties) {
        Write-Log "  - $prop" -Level "WARN"
    }
}

# Parse package.json to check Angular version
try {
    $packageConfig = Get-Content "package.json" | ConvertFrom-Json
    $angularVersion = $packageConfig.dependencies.'@angular/core'
    Write-Log "Angular version: $angularVersion"
    
    if ($angularVersion -like "*19.*") {
        Write-Log "Angular 19 detected - configuration validation passed"
    } else {
        Write-Log "Angular version $angularVersion - please verify compatibility" -Level "WARN"
    }
} catch {
    Write-Log "Failed to parse package.json: $($_.Exception.Message)" -Level "ERROR"
    exit 1
}

Write-Log "Angular configuration validation completed successfully!"

if ($Verbose.IsPresent) {
    Write-Log "Production configuration summary:"
    Write-Log "  - Optimization: $($null -ne $productionConfig.optimization)"
    Write-Log "  - Output Hashing: $($productionConfig.outputHashing)"
    Write-Log "  - Extract Licenses: $($productionConfig.extractLicenses)"
    Write-Log "  - Source Map: $($productionConfig.sourceMap)"
    Write-Log "  - Named Chunks: $($productionConfig.namedChunks)"
}
