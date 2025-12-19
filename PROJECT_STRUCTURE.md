# Project Structure Overview

```
saas-erp-accounting/
│
├── 📄 Configuration Files
│   ├── package.json                 # Root package with workspace config
│   ├── pnpm-workspace.yaml          # pnpm workspace definition
│   ├── tsconfig.json                # Base TypeScript config
│   ├── .prettierrc                  # Code formatting rules
│   ├── .gitignore                   # Git ignore patterns
│   ├── docker-compose.yml           # Docker orchestration
│   ├── README.md                    # Main documentation
│   └── QUICK_START.md               # Quick start guide
│
├── 🔧 Scripts
│   ├── setup.ps1                    # Automated setup script
│   ├── clean.ps1                    # Cleanup script
│   ├── health-check.ps1             # Health check script
│   └── init-databases.sql           # Database initialization
│
├── 📦 Packages (Shared Libraries)
│   └── common/                      # Shared utilities
│       ├── src/
│       │   ├── interfaces/          # TypeScript interfaces
│       │   ├── decorators/          # Custom decorators
│       │   ├── types/               # Type definitions
│       │   └── index.ts
│       ├── package.json
│       └── tsconfig.json
│
└── 🚀 Services (Microservices)
    │
    ├── auth-service/                # Authentication & Authorization
    │   ├── src/
    │   │   ├── modules/
    │   │   │   ├── auth/
    │   │   │   │   ├── strategies/  # Passport strategies (JWT, Local, Google)
    │   │   │   │   ├── guards/      # Auth guards
    │   │   │   │   ├── dto/         # Data transfer objects
    │   │   │   │   ├── auth.controller.ts
    │   │   │   │   ├── auth.service.ts
    │   │   │   │   └── auth.module.ts
    │   │   │   │
    │   │   │   ├── users/
    │   │   │   │   ├── entities/    # User entity
    │   │   │   │   ├── users.controller.ts
    │   │   │   │   ├── users.service.ts
    │   │   │   │   └── users.module.ts
    │   │   │   │
    │   │   │   └── health/          # Health check endpoints
    │   │   │
    │   │   ├── app.module.ts        # Main app module
    │   │   └── main.ts              # Bootstrap file
    │   │
    │   ├── Dockerfile               # Container definition
    │   ├── nest-cli.json
    │   ├── tsconfig.json
    │   ├── package.json
    │   └── .env.example
    │
    └── tenant-service/              # Multi-Tenant Management
        ├── src/
        │   ├── modules/
        │   │   ├── tenants/
        │   │   │   ├── entities/    # Tenant entity
        │   │   │   ├── dto/         # Data transfer objects
        │   │   │   ├── tenants.controller.ts
        │   │   │   ├── tenants.service.ts
        │   │   │   └── tenants.module.ts
        │   │   │
        │   │   ├── subscriptions/
        │   │   │   ├── entities/    # Subscription entity
        │   │   │   ├── dto/
        │   │   │   ├── subscriptions.controller.ts
        │   │   │   ├── subscriptions.service.ts
        │   │   │   └── subscriptions.module.ts
        │   │   │
        │   │   └── health/
        │   │
        │   ├── common/
        │   │   └── guards/          # JWT auth guard
        │   │
        │   ├── app.module.ts
        │   └── main.ts
        │
        ├── Dockerfile
        ├── nest-cli.json
        ├── tsconfig.json
        ├── package.json
        └── .env.example
```

## Infrastructure Components

### Docker Services

```
┌─────────────────────────────────────────────────────┐
│  PostgreSQL (Port 5432)                             │
│  ├── auth_db       - Auth service database          │
│  ├── tenant_db     - Tenant service database        │
│  ├── accounting_db - Reserved for accounting        │
│  ├── sales_db      - Reserved for sales             │
│  ├── inventory_db  - Reserved for inventory         │
│  ├── purchase_db   - Reserved for purchase          │
│  └── hr_db         - Reserved for HR                │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  Redis (Port 6379)                                  │
│  - Caching                                          │
│  - Session storage                                  │
│  - Rate limiting                                    │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  RabbitMQ (Port 5672, Management: 15672)           │
│  - Message queue for async communication           │
│  - Event-driven architecture                       │
│  - Service-to-service messaging                    │
└─────────────────────────────────────────────────────┘
```

## Service Ports

| Service | Port | Swagger Docs | Health Check |
|---------|------|--------------|--------------|
| Auth Service | 3001 | /api/v1/docs | /api/v1/health |
| Tenant Service | 3002 | /api/v1/docs | /api/v1/health |
| PostgreSQL | 5432 | - | - |
| Redis | 6379 | - | - |
| RabbitMQ | 5672 | - | - |
| RabbitMQ Management | 15672 | ✅ Web UI | - |

## Technology Stack by Layer

### Backend Services
- **Runtime**: Node.js 20+
- **Framework**: NestJS 10
- **Language**: TypeScript 5
- **Validation**: class-validator + class-transformer

### Database Layer
- **Primary DB**: PostgreSQL 16
- **Cache**: Redis 7
- **ORM**: TypeORM 0.3

### Message Queue
- **Broker**: RabbitMQ 3
- **Pattern**: Event-driven architecture

### Authentication
- **Strategy**: JWT + Refresh Tokens
- **OAuth**: Google OAuth 2.0
- **Password**: bcrypt hashing
- **Library**: Passport.js

### API Documentation
- **Tool**: Swagger/OpenAPI 3.0
- **UI**: Swagger UI (built-in)

### Development Tools
- **Package Manager**: pnpm 8+
- **Monorepo**: pnpm workspaces
- **Code Quality**: ESLint + Prettier
- **Container**: Docker + Docker Compose

## Data Flow

### Authentication Flow
```
1. Client → POST /auth/register → Auth Service
2. Auth Service → Hash Password → PostgreSQL (auth_db)
3. Client → POST /auth/login → Auth Service
4. Auth Service → Validate → Generate JWT
5. Client receives: accessToken + refreshToken
6. Client → GET /users/me (with Bearer token)
7. Auth Service → Verify JWT → Return User Data
```

### Tenant Creation Flow
```
1. Client → POST /tenants (with JWT) → Tenant Service
2. Tenant Service → Verify JWT
3. Tenant Service → Create Tenant → PostgreSQL (tenant_db)
4. Tenant Service → Set Trial Period (14 days)
5. Tenant Service → Assign Default Features
6. Client receives: Tenant Object
```

## Environment Variables

### Auth Service
- `DATABASE_URL` - PostgreSQL connection
- `JWT_SECRET` - JWT signing secret
- `JWT_REFRESH_SECRET` - Refresh token secret
- `GOOGLE_CLIENT_ID` - Google OAuth
- `GOOGLE_CLIENT_SECRET` - Google OAuth
- `REDIS_URL` - Redis connection
- `RABBITMQ_URL` - RabbitMQ connection

### Tenant Service
- `DATABASE_URL` - PostgreSQL connection
- `JWT_SECRET` - JWT validation (must match auth)
- `AUTH_SERVICE_URL` - Auth service endpoint
- `REDIS_URL` - Redis connection
- `RABBITMQ_URL` - RabbitMQ connection

## Future Services (Roadmap)

```
services/
├── auth-service/          ✅ Completed
├── tenant-service/        ✅ Completed
├── accounting-service/    📋 Planned
├── sales-service/         📋 Planned
├── inventory-service/     📋 Planned
├── purchase-service/      📋 Planned
├── hr-service/            📋 Planned
├── reporting-service/     📋 Planned
└── api-gateway/          📋 Planned (Kong)
```
