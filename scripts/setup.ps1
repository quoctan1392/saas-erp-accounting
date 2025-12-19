#!/usr/bin/env pwsh

Write-Host "🚀 Setting up SaaS ERP/Accounting System..." -ForegroundColor Green
Write-Host ""

# Check if pnpm is installed
Write-Host "Checking prerequisites..." -ForegroundColor Yellow
if (-not (Get-Command pnpm -ErrorAction SilentlyContinue)) {
    Write-Host "❌ pnpm is not installed. Installing..." -ForegroundColor Red
    npm install -g pnpm
}

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Docker is not installed. Please install Docker Desktop first." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Prerequisites check passed" -ForegroundColor Green
Write-Host ""

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
pnpm install

# Create .env files from examples
Write-Host "⚙️  Setting up environment files..." -ForegroundColor Yellow

$authEnvExample = "services\auth-service\.env.example"
$authEnv = "services\auth-service\.env"
if (-not (Test-Path $authEnv)) {
    Copy-Item $authEnvExample $authEnv
    Write-Host "✅ Created $authEnv" -ForegroundColor Green
}

$tenantEnvExample = "services\tenant-service\.env.example"
$tenantEnv = "services\tenant-service\.env"
if (-not (Test-Path $tenantEnv)) {
    Copy-Item $tenantEnvExample $tenantEnv
    Write-Host "✅ Created $tenantEnv" -ForegroundColor Green
}

Write-Host ""
Write-Host "🐳 Starting infrastructure (PostgreSQL, Redis, RabbitMQ)..." -ForegroundColor Yellow
docker-compose up -d postgres redis rabbitmq

Write-Host ""
Write-Host "⏳ Waiting for databases to be ready (30 seconds)..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

Write-Host ""
Write-Host "✅ Setup completed!" -ForegroundColor Green
Write-Host ""
Write-Host "📚 Next steps:" -ForegroundColor Cyan
Write-Host "  1. Update .env files with your configurations:" -ForegroundColor White
Write-Host "     - services/auth-service/.env" -ForegroundColor Gray
Write-Host "     - services/tenant-service/.env" -ForegroundColor Gray
Write-Host ""
Write-Host "  2. Start the services:" -ForegroundColor White
Write-Host "     pnpm dev                    # Start all services" -ForegroundColor Gray
Write-Host "     OR" -ForegroundColor Gray
Write-Host "     docker-compose up -d        # Start with Docker" -ForegroundColor Gray
Write-Host ""
Write-Host "  3. Access the APIs:" -ForegroundColor White
Write-Host "     Auth Service:   http://localhost:3001/api/v1/docs" -ForegroundColor Gray
Write-Host "     Tenant Service: http://localhost:3002/api/v1/docs" -ForegroundColor Gray
Write-Host ""
Write-Host "  4. RabbitMQ Management: http://localhost:15672" -ForegroundColor White
Write-Host "     Username: erp_admin" -ForegroundColor Gray
Write-Host "     Password: erp_password_123" -ForegroundColor Gray
Write-Host ""
