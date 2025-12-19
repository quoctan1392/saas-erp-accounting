#!/usr/bin/env pwsh

Write-Host "🧹 Cleaning up project..." -ForegroundColor Yellow
Write-Host ""

# Stop and remove Docker containers
Write-Host "Stopping Docker containers..." -ForegroundColor Yellow
docker-compose down

# Remove node_modules
Write-Host "Removing node_modules..." -ForegroundColor Yellow
if (Test-Path "node_modules") { Remove-Item -Recurse -Force "node_modules" }
if (Test-Path "services\auth-service\node_modules") { Remove-Item -Recurse -Force "services\auth-service\node_modules" }
if (Test-Path "services\tenant-service\node_modules") { Remove-Item -Recurse -Force "services\tenant-service\node_modules" }
if (Test-Path "packages\common\node_modules") { Remove-Item -Recurse -Force "packages\common\node_modules" }

# Remove dist folders
Write-Host "Removing dist folders..." -ForegroundColor Yellow
if (Test-Path "services\auth-service\dist") { Remove-Item -Recurse -Force "services\auth-service\dist" }
if (Test-Path "services\tenant-service\dist") { Remove-Item -Recurse -Force "services\tenant-service\dist" }
if (Test-Path "packages\common\dist") { Remove-Item -Recurse -Force "packages\common\dist" }

Write-Host ""
Write-Host "✅ Cleanup completed!" -ForegroundColor Green
