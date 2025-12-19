# Quick Start Guide

This guide will help you get the SaaS ERP/Accounting system up and running quickly.

## Prerequisites

- Node.js >= 20.0.0
- pnpm >= 8.0.0
- Docker & Docker Compose
- Git

## Setup (5 minutes)

### 1. Quick Setup Script

```powershell
# Run the setup script (Windows)
.\scripts\setup.ps1
```

This will:
- Install all dependencies
- Copy environment files
- Start infrastructure (PostgreSQL, Redis, RabbitMQ)

### 2. Configure Environment

Edit these files with your settings:

**services/auth-service/.env**
```env
# Important: Change these in production!
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-jwt-key

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

**services/tenant-service/.env**
```env
# JWT Secret (should match auth-service)
JWT_SECRET=your-super-secret-jwt-key-change-in-production
```

### 3. Start Services

**Option A: Development Mode**
```bash
pnpm dev
```

**Option B: Docker Compose**
```bash
docker-compose up -d
```

### 4. Verify Installation

```powershell
.\scripts\health-check.ps1
```

Or manually check:
- Auth Service: http://localhost:3001/api/v1/health
- Tenant Service: http://localhost:3002/api/v1/health

## API Documentation

- **Auth Service Docs**: http://localhost:3001/api/v1/docs
- **Tenant Service Docs**: http://localhost:3002/api/v1/docs

## First Steps

### 1. Register a User

```bash
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "Admin123!",
    "firstName": "Admin",
    "lastName": "User"
  }'
```

### 2. Login

```bash
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "Admin123!"
  }'
```

Save the `accessToken` from the response.

### 3. Create a Tenant

```bash
curl -X POST http://localhost:3002/api/v1/tenants \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "name": "My Company",
    "description": "My first tenant",
    "plan": "free"
  }'
```

## Common Commands

```bash
# Development
pnpm dev              # Start all services
pnpm build            # Build all services
pnpm test             # Run tests

# Docker
docker-compose up -d          # Start all containers
docker-compose down           # Stop all containers
docker-compose logs -f        # View logs
docker-compose ps             # Check status

# Database
docker exec -it erp-postgres psql -U erp_admin -d auth_db

# Cleanup
.\scripts\clean.ps1   # Clean everything
```

## Troubleshooting

### Services not starting?

1. Check if ports are available:
   ```bash
   netstat -ano | findstr :3001
   netstat -ano | findstr :3002
   ```

2. Check Docker logs:
   ```bash
   docker-compose logs postgres
   docker-compose logs redis
   docker-compose logs rabbitmq
   ```

### Database connection errors?

Wait 30 seconds after starting Docker containers for databases to initialize.

### JWT errors?

Make sure `JWT_SECRET` is the same in both auth-service and tenant-service `.env` files.

## Next Steps

1. Explore the API documentation (Swagger)
2. Check the full README.md for detailed information
3. Review the architecture in saas-accounting-erp-system-design.md
4. Start building additional microservices!

## Getting Help

- Check the logs: `docker-compose logs -f`
- Run health checks: `.\scripts\health-check.ps1`
- Review error messages in service terminals
