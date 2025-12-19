# Developer Guide - Hướng Dẫn Phát Triển

## 🚀 Common Commands (Lệnh Thường Dùng)

### Project Management

```bash
# Install dependencies (first time or after pulling changes)
pnpm install

# Install a new package in a specific service
cd services/auth-service
pnpm add package-name

# Install a dev dependency
pnpm add -D package-name

# Update all dependencies
pnpm update

# Clean everything
.\scripts\clean.ps1
```

### Development

```bash
# Start all services in development mode (with hot reload)
pnpm dev

# Start specific service
cd services/auth-service
pnpm dev

# Build all services
pnpm build

# Build specific service
cd services/auth-service
pnpm build

# Format code
pnpm format

# Lint code
pnpm lint
```

### Docker Operations

```bash
# Start infrastructure only (PostgreSQL, Redis, RabbitMQ)
docker-compose up -d postgres redis rabbitmq

# Start all services including microservices
docker-compose up -d

# Stop all containers
docker-compose down

# Stop and remove volumes (WARNING: deletes data)
docker-compose down -v

# View logs
docker-compose logs -f

# View logs for specific service
docker-compose logs -f auth-service

# Restart a specific service
docker-compose restart auth-service

# Check container status
docker-compose ps

# Rebuild containers
docker-compose up -d --build
```

### Database Operations

```bash
# Connect to PostgreSQL
docker exec -it erp-postgres psql -U erp_admin -d auth_db

# List all databases
docker exec -it erp-postgres psql -U erp_admin -c "\l"

# Backup database
docker exec erp-postgres pg_dump -U erp_admin auth_db > backup.sql

# Restore database
cat backup.sql | docker exec -i erp-postgres psql -U erp_admin auth_db

# Common SQL commands in psql
\l              # List databases
\c auth_db      # Connect to database
\dt             # List tables
\d users        # Describe table
\q              # Quit
```

### Redis Operations

```bash
# Connect to Redis CLI
docker exec -it erp-redis redis-cli

# Common Redis commands
KEYS *          # List all keys
GET key         # Get value
DEL key         # Delete key
FLUSHALL        # Clear all data (WARNING!)
INFO            # Redis info
```

### RabbitMQ Operations

```bash
# Access RabbitMQ Management UI
# http://localhost:15672
# Username: erp_admin
# Password: erp_password_123

# List queues
docker exec erp-rabbitmq rabbitmqctl list_queues

# List exchanges
docker exec erp-rabbitmq rabbitmqctl list_exchanges

# Purge a queue
docker exec erp-rabbitmq rabbitmqctl purge_queue queue_name
```

## 🧪 Testing

### API Testing with cURL

#### Auth Service

```bash
# Register
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!",
    "firstName": "Test",
    "lastName": "User"
  }'

# Login
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!"
  }'

# Get current user (need token from login)
curl -X GET http://localhost:3001/api/v1/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Health check
curl http://localhost:3001/api/v1/health
```

#### Tenant Service

```bash
# Create tenant
curl -X POST http://localhost:3002/api/v1/tenants \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "name": "My Company",
    "description": "Test company",
    "plan": "free"
  }'

# Get my tenants
curl -X GET http://localhost:3002/api/v1/tenants/my-tenants \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Get tenant details
curl -X GET http://localhost:3002/api/v1/tenants/TENANT_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Health check
curl http://localhost:3002/api/v1/health
```

### Testing with Postman

1. Import Swagger JSON:
   - Auth: http://localhost:3001/api/v1/docs-json
   - Tenant: http://localhost:3002/api/v1/docs-json

2. Setup Environment Variables:
   ```
   base_url_auth: http://localhost:3001/api/v1
   base_url_tenant: http://localhost:3002/api/v1
   access_token: (set after login)
   ```

3. Use Collection Runner for automated testing

## 🐛 Debugging

### View Service Logs

```bash
# Development mode logs (in terminal where you ran pnpm dev)
# Logs appear in real-time

# Docker logs
docker-compose logs -f auth-service
docker-compose logs -f tenant-service

# Follow logs from specific time
docker-compose logs --since 5m auth-service

# Save logs to file
docker-compose logs auth-service > auth-service.log
```

### Database Debugging

```sql
-- Check user count
SELECT COUNT(*) FROM users;

-- Find users by email
SELECT * FROM users WHERE email LIKE '%test%';

-- Check recent users
SELECT id, email, "createdAt" FROM users 
ORDER BY "createdAt" DESC 
LIMIT 10;

-- Check tenant count
SELECT COUNT(*) FROM tenants;

-- Check tenants by status
SELECT name, status, plan FROM tenants 
WHERE status = 'active';
```

### Common Issues & Solutions

#### Issue: Port already in use

```bash
# Find process using port 3001
netstat -ano | findstr :3001

# Kill process (replace PID)
taskkill /PID <PID> /F
```

#### Issue: Database connection error

```bash
# Check if PostgreSQL is running
docker-compose ps postgres

# Restart PostgreSQL
docker-compose restart postgres

# Check logs
docker-compose logs postgres
```

#### Issue: JWT token invalid

1. Check JWT_SECRET matches in both services
2. Token might be expired (default 7 days)
3. Use refresh token to get new access token

#### Issue: Module not found

```bash
# Clean and reinstall
.\scripts\clean.ps1
pnpm install
```

## 📝 Code Standards

### Naming Conventions

```typescript
// Files
user.entity.ts          // Entities
user.service.ts         // Services
user.controller.ts      // Controllers
user.module.ts          // Modules
create-user.dto.ts      // DTOs
jwt-auth.guard.ts       // Guards

// Classes
export class User {}
export class UserService {}
export class UserController {}

// Interfaces
export interface IUser {}
export interface IUserResponse {}

// Enums
export enum UserRole {}
export enum UserStatus {}

// Constants
export const MAX_USERS = 100;
export const JWT_EXPIRATION = '7d';
```

### File Structure

```typescript
// controller.ts
import { Controller } from '@nestjs/common';

@Controller('resource')
export class ResourceController {
  constructor(private readonly service: ResourceService) {}
  
  // CRUD operations
}

// service.ts
import { Injectable } from '@nestjs/common';

@Injectable()
export class ResourceService {
  constructor(
    @InjectRepository(Entity)
    private repository: Repository<Entity>,
  ) {}
  
  // Business logic
}

// entity.ts
import { Entity, Column } from 'typeorm';

@Entity('table_name')
export class EntityName {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  
  // Other columns
}
```

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/add-new-service

# Stage changes
git add .

# Commit with meaningful message
git commit -m "feat: add accounting service"

# Push to remote
git push origin feature/add-new-service

# Commit message prefixes:
# feat:     New feature
# fix:      Bug fix
# docs:     Documentation
# style:    Formatting
# refactor: Code restructuring
# test:     Adding tests
# chore:    Maintenance
```

## 🔧 Environment Variables

### Development

```env
# .env.development
NODE_ENV=development
DEBUG=true
LOG_LEVEL=debug
```

### Production

```env
# .env.production
NODE_ENV=production
DEBUG=false
LOG_LEVEL=error

# Use strong secrets
JWT_SECRET=use-a-strong-random-secret-here
JWT_REFRESH_SECRET=use-another-strong-secret

# Use managed database URLs
DATABASE_URL=postgresql://user:pass@prod-host:5432/db
REDIS_URL=redis://prod-redis:6379
```

## 📊 Performance Tips

### Database Queries

```typescript
// ❌ Bad: N+1 queries
const users = await userRepository.find();
for (const user of users) {
  user.tenant = await tenantRepository.findOne(user.tenantId);
}

// ✅ Good: Use relations
const users = await userRepository.find({
  relations: ['tenant'],
});

// ✅ Good: Use query builder with join
const users = await userRepository
  .createQueryBuilder('user')
  .leftJoinAndSelect('user.tenant', 'tenant')
  .getMany();
```

### Caching

```typescript
// Cache frequently accessed data
@Injectable()
export class UserService {
  async findOne(id: string): Promise<User> {
    const cacheKey = `user:${id}`;
    
    // Try cache first
    const cached = await this.redis.get(cacheKey);
    if (cached) return JSON.parse(cached);
    
    // Query database
    const user = await this.repository.findOne(id);
    
    // Store in cache
    await this.redis.setex(cacheKey, 3600, JSON.stringify(user));
    
    return user;
  }
}
```

### Pagination

```typescript
// Always use pagination for list endpoints
@Get()
async findAll(
  @Query('page') page = 1,
  @Query('limit') limit = 10,
) {
  const [data, total] = await this.repository.findAndCount({
    skip: (page - 1) * limit,
    take: limit,
  });
  
  return {
    data,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}
```

## 🚀 Production Deployment Checklist

- [ ] Update all environment variables with production values
- [ ] Change all default passwords
- [ ] Use strong JWT secrets (minimum 32 characters)
- [ ] Setup SSL/TLS certificates
- [ ] Configure proper CORS origins
- [ ] Enable rate limiting
- [ ] Setup monitoring and logging
- [ ] Configure backup strategy
- [ ] Setup CI/CD pipeline
- [ ] Run security audit: `pnpm audit`
- [ ] Test all endpoints
- [ ] Load testing
- [ ] Setup error tracking (Sentry)
- [ ] Configure CDN for static assets

## 📚 Useful Resources

### Documentation
- NestJS: https://docs.nestjs.com
- TypeORM: https://typeorm.io
- PostgreSQL: https://www.postgresql.org/docs
- Docker: https://docs.docker.com

### Tools
- Postman: API testing
- pgAdmin: PostgreSQL GUI
- Redis Commander: Redis GUI
- RabbitMQ Management: Built-in UI

### Extensions (VS Code)
- ESLint
- Prettier
- Docker
- REST Client
- PostgreSQL
- Git Lens

## 💡 Tips & Tricks

```bash
# Quick health check all services
curl http://localhost:3001/api/v1/health && \
curl http://localhost:3002/api/v1/health

# Quick restart all services
docker-compose restart

# View resource usage
docker stats

# Clean up Docker
docker system prune -a

# Export environment variables (PowerShell)
Get-Content .env | ForEach-Object {
  $name, $value = $_.split('=')
  Set-Content env:\$name $value
}

# Generate random secret (PowerShell)
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | % {[char]$_})
```

---

Happy Coding! 🚀
