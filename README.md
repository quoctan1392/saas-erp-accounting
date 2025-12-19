# SaaS ERP/Accounting System

Multi-tenant SaaS ERP system focused on accounting for SMEs, built with microservices architecture.

> 📖 **New to this project?** Check out the [DOCS_INDEX.md](DOCS_INDEX.md) for a complete guide to all documentation!  
> ⚡ **Want to start quickly?** Jump to [QUICK_START.md](QUICK_START.md)!

## 🏗️ Architecture

This project follows a **microservices architecture** with:

- **Auth Service** (Port 3001) - Authentication & Authorization with JWT and Google OAuth
- **Tenant Service** (Port 3002) - Multi-tenant management and subscriptions
- More services coming soon: Accounting, Sales, Inventory, Purchase, HR, Reporting

## 🚀 Tech Stack

### Backend
- **Framework**: NestJS (Node.js 20+)
- **Language**: TypeScript
- **Database**: PostgreSQL 16
- **Cache**: Redis 7
- **Message Queue**: RabbitMQ 3
- **Authentication**: JWT, Passport, Google OAuth 2.0
- **API Documentation**: Swagger/OpenAPI

### Infrastructure
- **Container**: Docker & Docker Compose
- **Package Manager**: pnpm (workspace)
- **Monorepo**: pnpm workspaces

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) >= 20.0.0
- [pnpm](https://pnpm.io/) >= 8.0.0
- [Docker](https://www.docker.com/) & Docker Compose
- [Git](https://git-scm.com/)

## 🛠️ Installation & Setup

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd saas-erp-accounting
```

### 2. Install Dependencies

```bash
# Install pnpm globally if you haven't
npm install -g pnpm

# Install all dependencies
pnpm install
```

### 3. Setup Environment Variables

```bash
# Copy environment files for each service
cp services/auth-service/.env.example services/auth-service/.env
cp services/tenant-service/.env.example services/tenant-service/.env

# Edit the .env files with your configurations
# Important: Update JWT_SECRET, database credentials, and Google OAuth credentials
```

### 4. Start Infrastructure with Docker

```bash
# Start PostgreSQL, Redis, and RabbitMQ
docker-compose up -d postgres redis rabbitmq

# Check if services are running
docker-compose ps
```

### 5. Run Database Migrations

```bash
# The databases will be automatically created by init script
# Wait for PostgreSQL to be ready (check docker logs)
docker-compose logs -f postgres
```

### 6. Start Microservices

#### Option A: Start All Services (Development)

```bash
pnpm dev
```

#### Option B: Start Individual Services

```bash
# Terminal 1 - Auth Service
cd services/auth-service
pnpm dev

# Terminal 2 - Tenant Service
cd services/tenant-service
pnpm dev
```

#### Option C: Using Docker Compose (Full Stack)

```bash
# Start everything including services
docker-compose up -d

# View logs
docker-compose logs -f
```

## 📚 API Documentation

Once services are running, access the Swagger documentation:

- **Auth Service**: http://localhost:3001/api/v1/docs
- **Tenant Service**: http://localhost:3002/api/v1/docs

## 🔑 Authentication Flow

### 1. Register a New User

```bash
POST http://localhost:3001/api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "Password123!",
  "firstName": "John",
  "lastName": "Doe"
}
```

### 2. Login

```bash
POST http://localhost:3001/api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "Password123!"
}
```

Response:
```json
{
  "user": { ... },
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc..."
}
```

### 3. Google OAuth

Navigate to: http://localhost:3001/api/v1/auth/google

## 🏢 Tenant Management

### Create a Tenant

```bash
POST http://localhost:3002/api/v1/tenants
Authorization: Bearer <your-access-token>
Content-Type: application/json

{
  "name": "Acme Corporation",
  "description": "Leading provider of innovative solutions",
  "plan": "free"
}
```

### Get My Tenants

```bash
GET http://localhost:3002/api/v1/tenants/my-tenants
Authorization: Bearer <your-access-token>
```

## 🗄️ Database Access

### PostgreSQL

```bash
# Connect to PostgreSQL
docker exec -it erp-postgres psql -U erp_admin -d erp_db

# List all databases
\l

# Connect to specific database
\c auth_db

# List tables
\dt
```

### Redis

```bash
# Connect to Redis
docker exec -it erp-redis redis-cli

# Check keys
KEYS *
```

### RabbitMQ Management UI

Access: http://localhost:15672
- Username: `erp_admin`
- Password: `erp_password_123`

## 📁 Project Structure

```
saas-erp-accounting/
├── services/                    # Microservices
│   ├── auth-service/           # Authentication & Authorization
│   │   ├── src/
│   │   │   ├── modules/
│   │   │   │   ├── auth/       # Auth logic, strategies, guards
│   │   │   │   ├── users/      # User management
│   │   │   │   └── health/     # Health checks
│   │   │   ├── app.module.ts
│   │   │   └── main.ts
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   └── tenant-service/         # Multi-tenant management
│       ├── src/
│       │   ├── modules/
│       │   │   ├── tenants/    # Tenant CRUD
│       │   │   ├── subscriptions/ # Subscription management
│       │   │   └── health/
│       │   ├── common/         # Shared guards, filters
│       │   ├── app.module.ts
│       │   └── main.ts
│       ├── Dockerfile
│       └── package.json
│
├── packages/                   # Shared libraries (coming soon)
│   └── common/                 # Common utilities
│
├── scripts/                    # Database & deployment scripts
│   └── init-databases.sql
│
├── docker-compose.yml          # Infrastructure & services
├── pnpm-workspace.yaml         # Workspace configuration
├── package.json                # Root package
└── README.md
```

## 🧪 Testing

```bash
# Run tests for all services
pnpm test

# Run tests for specific service
cd services/auth-service
pnpm test

# Run tests with coverage
pnpm test:cov
```

## 🔧 Available Scripts

```bash
# Development
pnpm dev              # Start all services in dev mode
pnpm build            # Build all services
pnpm test             # Run all tests
pnpm lint             # Lint all services
pnpm format           # Format code with Prettier

# Docker
pnpm docker:up        # Start infrastructure
pnpm docker:down      # Stop infrastructure
pnpm docker:logs      # View logs

# Cleanup
pnpm clean            # Remove all node_modules and build artifacts
```

## 🌟 Key Features

### Auth Service
✅ Local authentication (email/password)
✅ Google OAuth 2.0
✅ JWT with refresh tokens
✅ Password hashing with bcrypt
✅ Role-based access control (RBAC)
✅ User management
✅ Swagger documentation

### Tenant Service
✅ Multi-tenant architecture
✅ Tenant CRUD operations
✅ Subscription management
✅ Plan-based features (Free, Starter, Business, Enterprise)
✅ User limits per plan
✅ Trial period management
✅ Tenant status management
✅ Swagger documentation

## 🔐 Security

- Passwords are hashed using bcrypt
- JWT tokens for stateless authentication
- Refresh tokens stored securely
- CORS enabled with configurable origins
- Input validation using class-validator
- SQL injection protection via TypeORM

## 📊 Database Schema

### Auth Service (auth_db)

**Users Table**
- id (UUID)
- email (unique)
- password (hashed)
- firstName, lastName
- role (enum: super_admin, tenant_admin, accountant, manager, employee, viewer)
- provider (local, google, microsoft)
- isActive, isEmailVerified
- timestamps

### Tenant Service (tenant_db)

**Tenants Table**
- id (UUID)
- name, slug (unique)
- status (active, suspended, trial, cancelled)
- plan (free, starter, business, enterprise)
- ownerId
- maxUsers, currentUsers
- features (jsonb)
- timestamps

**Subscriptions Table**
- id (UUID)
- tenantId (FK)
- plan, status
- billingCycle (monthly, yearly)
- amount
- dates (start, end, nextBilling)
- timestamps

## 🚧 Roadmap

- [x] Authentication Service
- [x] Tenant Service
- [ ] Accounting Service
- [ ] Sales Service
- [ ] Inventory Service
- [ ] Purchase Service
- [ ] HR Service
- [ ] Reporting Service
- [ ] API Gateway (Kong)
- [ ] Frontend (Next.js)
- [ ] CI/CD Pipeline
- [ ] Kubernetes Deployment

## 📝 License

MIT License

## 👥 Contributing

Contributions are welcome! Please read the contributing guidelines first.

## 📧 Contact

For questions or support, please contact: [your-email@example.com]