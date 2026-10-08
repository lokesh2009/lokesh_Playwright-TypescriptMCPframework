#!/usr/bin/env powershell

# K6 Performance Test Suite Runner
$projectRoot = "c:\Users\lokesh.sharma\playwright-js-E2E-Automation"
$testScript = "tests/features/performance/k6-multi-stage-load-test.js"
$resultsDir = "test-results"
$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$resultsFile = "$resultsDir/performance-suite-$timestamp.json"

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  K6 PERFORMANCE TEST SUITE - MULTI-STAGE LOAD TEST        ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

Write-Host "📊 Test Configuration:" -ForegroundColor Yellow
Write-Host "  • Stage 1: 20 VUs for 3 minutes (Light Load)" -ForegroundColor Gray
Write-Host "  • Stage 2: 50 VUs for 3 minutes (Medium Load)" -ForegroundColor Gray
Write-Host "  • Stage 3: 100 VUs for 3 minutes (Heavy Load)" -ForegroundColor Gray
Write-Host "  • Total Duration: ~9 minutes" -ForegroundColor Gray
Write-Host ""

Write-Host "🎯 Target:" -ForegroundColor Yellow
Write-Host "  • URL: https://www.arsenalharley.com/showroom/harley-davidson" -ForegroundColor Gray
Write-Host ""

Write-Host "📁 Output:" -ForegroundColor Yellow
Write-Host "  • Results: $resultsFile" -ForegroundColor Gray
Write-Host ""

# Create results directory if needed
if (-not (Test-Path $resultsDir)) {
    New-Item -ItemType Directory -Path $resultsDir | Out-Null
}

# Run K6 test
Write-Host "🚀 Starting K6 test suite..." -ForegroundColor Green
Write-Host ""

$startTime = Get-Date

try {
    # Change to project directory
    Set-Location $projectRoot

    # Run K6 with verbose output
    & k6 run $testScript --out json=$resultsFile -v

    $endTime = Get-Date
    $duration = $endTime - $startTime

    Write-Host ""
    Write-Host "═════════════════════════════════════════════════════════════" -ForegroundColor Green
    Write-Host "✅ TEST SUITE COMPLETED SUCCESSFULLY" -ForegroundColor Green
    Write-Host "═════════════════════════════════════════════════════════════" -ForegroundColor Green
    Write-Host ""
    Write-Host "📊 Execution Summary:" -ForegroundColor Yellow
    Write-Host "  • Start Time: $startTime" -ForegroundColor Gray
    Write-Host "  • End Time: $endTime" -ForegroundColor Gray
    Write-Host "  • Duration: $($duration.ToString('hh\:mm\:ss'))" -ForegroundColor Gray
    Write-Host ""

    # Check if results file was created
    if (Test-Path $resultsFile) {
        $fileSize = (Get-Item $resultsFile).Length / 1MB
        Write-Host "📁 Results File:" -ForegroundColor Yellow
        Write-Host "  • Path: $resultsFile" -ForegroundColor Gray
        Write-Host "  • Size: $([Math]::Round($fileSize, 2)) MB" -ForegroundColor Gray
        Write-Host ""

        Write-Host "📈 Next Steps:" -ForegroundColor Yellow
        Write-Host "  1. Open K6 Dashboard: tests/features/performance/k6-ac-dashboard.html" -ForegroundColor Gray
        Write-Host "  2. Upload JSON results file: $resultsFile" -ForegroundColor Gray
        Write-Host "  3. View performance metrics across all stages" -ForegroundColor Gray
        Write-Host ""
    }

} catch {
    Write-Host ""
    Write-Host "❌ TEST SUITE FAILED" -ForegroundColor Red
    Write-Host "═════════════════════════════════════════════════════════════" -ForegroundColor Red
    Write-Host ""
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    exit 1
}

Write-Host "🎉 Performance test suite execution complete!" -ForegroundColor Green
Write-Host ""
