# Core Service

## Description

Core Service - Main ERP Business Logic for SaaS ERP System. Handles all business operations including:

- Business Profile Management
- Chart of Accounts
- Accounting Objects (Customers, Vendors, Employees)
- Items Management
- Warehouse Management
- Sales Operations
- Invoices
- Inventory Tracking
- Bank Accounts
- Financial Reports

## Technology Stack

- **Framework**: NestJS 10+
- **Language**: TypeScript
- **Database**: PostgreSQL 16+
- **ORM**: TypeORM
- **Cache**: Redis
- **Message Queue**: RabbitMQ
- **Validation**: class-validator, class-transformer
- **Documentation**: Swagger/OpenAPI

## Installation

```bash
# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env

# Update .env with your configuration
```

## Running the service

```bash
# Development
pnpm run start:dev

# Production
pnpm run build
pnpm run start:prod
```

## API Documentation

Once the service is running in development mode, access Swagger documentation at:

```
http://localhost:3003/api/docs
```

## Environment Variables

See `.env.example` for all available configuration options.

## Database Migrations

```bash
# Generate migration
pnpm run migration:generate -- -n MigrationName

# Run migrations
pnpm run migration:run

# Revert migration
pnpm run migration:revert
```

## Testing

```bash
# Unit tests
pnpm run test

# E2E tests
pnpm run test:e2e

# Test coverage
pnpm run test:cov
```

## Project Structure

```
src/
├── common/              # Shared utilities
│   ├── decorators/     # Custom decorators
│   ├── guards/         # Auth guards
│   ├── interceptors/   # Request/Response interceptors
│   ├── filters/        # Exception filters
│   ├── entities/       # Base entities
│   └── dto/            # Common DTOs
├── modules/            # Feature modules
│   ├── business-profile/
│   ├── chart-of-accounts/
│   ├── accounting-objects/
│   ├── items/
│   ├── warehouses/
│   ├── sales/
│   ├── invoices/
│   ├── inventory/
│   └── bank-accounts/
├── app.module.ts       # Root module
└── main.ts             # Application entry point
```

## API Endpoints

### Business Profile
- `POST /api/business-profile` - Create business profile
- `GET /api/business-profile` - Get business profile
- `PUT /api/business-profile` - Update business profile
- `GET /api/business-profile/settings` - Get settings

### Chart of Accounts
- `GET /api/chart-of-accounts/general` - Get general accounts
- `GET /api/chart-of-accounts/custom` - Get custom accounts
- `POST /api/chart-of-accounts/custom` - Create custom account
- `PUT /api/chart-of-accounts/custom/:id` - Update account
- `DELETE /api/chart-of-accounts/custom/:id` - Delete account

### Accounting Objects
- `GET /api/objects` - List all objects
- `POST /api/objects` - Create object
- `GET /api/objects/:id` - Get object details
- `PUT /api/objects/:id` - Update object
- `DELETE /api/objects/:id` - Delete object

For complete API documentation, see Swagger UI.

## License

Proprietary
