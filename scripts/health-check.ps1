#!/usr/bin/env pwsh

Write-Host "🔍 Checking service health..." -ForegroundColor Yellow
Write-Host ""

function Test-ServiceHealth {
    param(
        [string]$Name,
        [string]$Url
    )
    
    try {
        $response = Invoke-RestMethod -Uri $Url -Method Get -TimeoutSec 5
        Write-Host "✅ $Name is healthy" -ForegroundColor Green
        return $true
    }
    catch {
        Write-Host "❌ $Name is not responding" -ForegroundColor Red
        return $false
    }
}

# Check Docker services
Write-Host "Docker Services:" -ForegroundColor Cyan
docker-compose ps

Write-Host ""
Write-Host "Microservices Health:" -ForegroundColor Cyan

$authHealth = Test-ServiceHealth -Name "Auth Service" -Url "http://localhost:3001/api/v1/health"
$tenantHealth = Test-ServiceHealth -Name "Tenant Service" -Url "http://localhost:3002/api/v1/health"

Write-Host ""
if ($authHealth -and $tenantHealth) {
    Write-Host "✅ All services are healthy!" -ForegroundColor Green
} else {
    Write-Host "⚠️  Some services are not responding" -ForegroundColor Yellow
}
