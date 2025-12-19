# Thiết Kế Hệ Thống SaaS ERP/Kế Toán Multi-Tenant

## 📋 Tổng Quan Dự Án

### Mục Tiêu

Xây dựng nền tảng SaaS ERP tập trung vào kế toán cho doanh nghiệp vừa và nhỏ (SME), với kiến trúc multi-tenant, hỗ trợ responsive và tối ưu cho mobile.

### Đặc Điểm Chính

- ✅ Multi-tenant architecture
- ✅ Web-based, responsive design (mobile-first)
- ✅ Google Authentication (mở rộng cho nhiều nhà cung cấp)
- ✅ Module ERP đầy đủ (tập trung kế toán)
- ✅ Khả năng scale cao
- ✅ UX/UI hiện đại, mượt mà

### ✅ Tuân Thủ 100% Kiến Trúc Microservices

| Nguyên Tắc Microservices     | Triển Khai                       | Status |
| ---------------------------- | -------------------------------- | ------ |
| **Single Responsibility**    | Mỗi service = 1 business domain  | ✅     |
| **Independently Deployable** | Docker + Kubernetes, CI/CD riêng | ✅     |
| **Decentralized Data**       | Database per service             | ✅     |
| **API Communication**        | REST, gRPC, Events               | ✅     |
| **Fault Isolation**          | Circuit Breaker, Retry           | ✅     |
| **Service Discovery**        | Consul/Kubernetes                | ✅     |
| **API Gateway**              | Kong Gateway                     | ✅     |
| **Event-Driven**             | RabbitMQ/Kafka                   | ✅     |

**9 Core Microservices**: Auth • Tenant • Accounting • Sales • Inventory • Purchase • HR • Notification • Reporting

---

## 🏗️ Kiến Trúc Tổng Thể

### 1. Kiến Trúc High-Level

```
┌─────────────────────────────────────────────────────────────┐
│                        CDN Layer                             │
│              (CloudFlare / CloudFront)                       │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    Load Balancer                             │
│              (AWS ALB / Nginx / Kong)                        │
└─────────────────────────────────────────────────────────────┘
                            ↓
        ┌───────────────────┴───────────────────┐
        ↓                                       ↓
┌──────────────────┐                  ┌──────────────────┐
│   Web Frontend   │                  │   API Gateway    │
│   (React/Next.js)│                  │   (Kong/Express) │
└──────────────────┘                  └──────────────────┘
                                              ↓
                    ┌─────────────────────────┼─────────────────────────┐
                    ↓                         ↓                         ↓
          ┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐
          │  Auth Service    │    │  Tenant Service  │    │  Core Services   │
          │  (OAuth/JWT)     │    │  (Multi-tenant)  │    │  (Microservices) │
          └──────────────────┘    └──────────────────┘    └──────────────────┘
                    ↓                         ↓                         ↓
          ┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐
          │  User Database   │    │  Tenant Config   │    │  Business Data   │
          │  (PostgreSQL)    │    │  (PostgreSQL)    │    │  (PostgreSQL)    │
          └──────────────────┘    └──────────────────┘    └──────────────────┘
```

---

## 🎯 Kiến Trúc Chi Tiết

### 2. Frontend Architecture (Mobile-First)

#### Technology Stack

```yaml
Framework: Next.js 14+ (App Router)
  - Server Components cho SEO
  - Client Components cho tương tác
  - Progressive Web App (PWA)

UI Framework:
  - TailwindCSS (utility-first CSS)
  - Shadcn/ui (component library)
  - Framer Motion (animations)

State Management:
  - Zustand (client state)
  - React Query / TanStack Query (server state)
  - Jotai (atomic state)

Mobile Optimization:
  - Responsive breakpoints: 320px, 768px, 1024px, 1440px
  - Touch gestures support
  - Virtual scrolling cho danh sách dài
  - Lazy loading images & components
```

#### Cấu Trúc Frontend

```
frontend/
├── app/                      # Next.js App Router
│   ├── (auth)/              # Authentication routes
│   │   ├── login/
│   │   ├── register/
│   │   └── callback/
│   ├── (dashboard)/         # Main app routes
│   │   ├── dashboard/
│   │   ├── accounting/      # Module kế toán
│   │   ├── inventory/       # Module kho
│   │   ├── sales/           # Module bán hàng
│   │   ├── purchase/        # Module mua hàng
│   │   ├── hr/              # Module nhân sự
│   │   └── reports/         # Module báo cáo
│   └── api/                 # API routes (BFF pattern)
├── components/
│   ├── ui/                  # Base components
│   ├── modules/             # Feature components
│   └── layouts/             # Layout components
├── lib/
│   ├── hooks/               # Custom hooks
│   ├── utils/               # Utility functions
│   └── api/                 # API client
├── stores/                  # State management
└── styles/                  # Global styles
```

---

### 3. Backend Architecture (Microservices)

#### 3.0 Microservices Design Principles ✅

**Tuân thủ đầy đủ các nguyên tắc Microservices:**

1. **Single Responsibility Principle**: Mỗi service phụ trách một business domain cụ thể
2. **Independently Deployable**: Deploy độc lập, không ảnh hưởng services khác
3. **Decentralized Data Management**: Mỗi service có database/schema riêng
4. **API-First Communication**: REST/gRPC/Message Queue
5. **Fault Isolation**: Circuit breaker, fallback mechanisms
6. **Autonomous Teams**: Mỗi team tự quản lý service của mình
7. **Polyglot Architecture**: Có thể dùng tech stack khác nhau cho từng service
8. **Smart Endpoints, Dumb Pipes**: Logic ở services, không ở middleware

#### Microservices Architecture Diagram

```
┌───────────────────────────────────────────────────────────────┐
│                     API Gateway / BFF                          │
│            (Kong Gateway + Service Mesh)                       │
│  - Authentication        - Rate Limiting                       │
│  - Request Routing       - Load Balancing                      │
│  - Response Aggregation  - Circuit Breaker                     │
└────────────────────────┬──────────────────────────────────────┘
                         │
    ┌────────────────────┼────────────────┬───────────────┬─────────┐
    │                    │                │               │         │
    ↓                    ↓                ↓               ↓         ↓
┌──────────┐      ┌──────────┐      ┌──────────┐   ┌──────────┐  ┌────┐
│   Auth   │      │  Tenant  │      │Accounting│   │  Sales   │  │... │
│ Service  │      │ Service  │      │ Service  │   │ Service  │  │    │
│          │      │          │      │          │   │          │  │    │
│ :3001    │      │ :3002    │      │ :3003    │   │ :3004    │  │    │
└────┬─────┘      └────┬─────┘      └────┬─────┘   └────┬─────┘  └─┬──┘
     │                 │                 │              │           │
     │  ┌──────────────┴─────────────────┴──────────────┴───────────┘
     │  │
     ↓  ↓
┌─────────────────────────────────────────────────────────────────┐
│                      Message Bus Layer                           │
│            RabbitMQ / Apache Kafka (Event-Driven)               │
│  - order.created      - invoice.paid                            │
│  - payment.completed  - inventory.updated                       │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    ┌─────────┴─────────┐
                    │  Service Discovery │
                    │   (Consul/etcd)    │
                    └────────────────────┘
```

#### Technology Stack

```yaml
Runtime: Node.js 20+ / Bun (high performance)
Framework: NestJS (enterprise-grade)
Language: TypeScript

Alternative Stack (cho performance cao):
  - Rust (Actix-web) cho services quan trọng
  - Go (Gin) cho services cần xử lý đồng thời cao

Communication Protocols:
  Synchronous:
    - REST API (HTTP/JSON)
    - gRPC (Protocol Buffers) - cho internal services

  Asynchronous:
    - RabbitMQ (Message Queue)
    - Apache Kafka (Event Streaming)
    - Redis Pub/Sub (Real-time events)

  Real-time:
    - WebSocket (Socket.io)
    - Server-Sent Events (SSE)

Service Discovery:
  - Consul (HashiCorp)
  - etcd (CoreOS)
  - Kubernetes Service Discovery
  - AWS Cloud Map

API Gateway:
  - Kong Gateway (recommended)
  - AWS API Gateway
  - Express Gateway
  - Traefik

Service Mesh (Optional):
  - Istio (complete solution)
  - Linkerd (lightweight)
  - Consul Connect
```

#### Service Communication Patterns

```typescript
// Pattern 1: Synchronous REST API Call
// ✅ Sử dụng khi: Cần response ngay lập tức
// ❌ Nhược điểm: Tạo coupling, có thể timeout

// Sales Service → Inventory Service
@Injectable()
export class SalesOrderService {
  constructor(
    private httpService: HttpService,
    private circuitBreaker: CircuitBreakerService,
  ) {}

  async createOrder(dto: CreateOrderDto): Promise<Order> {
    try {
      // Call Inventory Service với Circuit Breaker
      const stockCheck = await this.circuitBreaker.execute(
        'inventory-service',
        () => this.httpService.get(
          `${INVENTORY_SERVICE_URL}/products/${dto.productId}/stock`
        ).toPromise()
      );

      if (!stockCheck.data.available) {
        throw new BadRequestException('Product out of stock');
      }

      return await this.orderRepository.save(dto);
    } catch (error) {
      // Fallback logic
      if (error instanceof CircuitBreakerOpenException) {
        // Circuit breaker is open, use cached data or default behavior
        return this.createOrderWithoutStockCheck(dto);
      }
      throw error;
    }
  }
}

// Pattern 2: Asynchronous Event-Driven (Recommended)
// ✅ Sử dụng khi: Không cần response ngay, eventual consistency OK
// ✅ Ưu điểm: Loose coupling, high availability, scalable

// Sales Service: Publish Event
@Injectable()
export class SalesOrderService {
  constructor(
    private messageBus: RabbitMQService,
  ) {}

  async createOrder(dto: CreateOrderDto): Promise<Order> {
    const order = await this.orderRepository.save(dto);

    // Publish event (fire-and-forget)
    await this.messageBus.publish('order.created', {
      eventId: uuidv4(),
      timestamp: new Date(),
      payload: {
        orderId: order.id,
        tenantId: order.tenantId,
        items: order.items,
        totalAmount: order.totalAmount,
      },
    });

    return order;
  }
}

// Inventory Service: Subscribe Event
@Injectable()
export class InventoryEventConsumer {
  @RabbitSubscribe({
    exchange: 'erp.events',
    routingKey: 'order.created',
    queue: 'inventory.order-created',
  })
  async handleOrderCreated(event: OrderCreatedEvent) {
    try {
      // Reserve stock
      await this.inventoryService.reserveStock(event.payload.items);

      // Publish success event
      await this.messageBus.publish('inventory.reserved', {
        orderId: event.payload.orderId,
        status: 'reserved',
      });
    } catch (error) {
      // Publish failure event
      await this.messageBus.publish('inventory.reservation-failed', {
        orderId: event.payload.orderId,
        error: error.message,
      });
    }
  }
}

// Accounting Service: Subscribe Multiple Events
@Injectable()
export class AccountingEventConsumer {
  @RabbitSubscribe({
    exchange: 'erp.events',
    routingKey: 'order.created',
    queue: 'accounting.order-created',
  })
  async handleOrderCreated(event: OrderCreatedEvent) {
    // Create accounts receivable entry
    await this.journalEntryService.createFromOrder(event.payload);
  }

  @RabbitSubscribe({
    exchange: 'erp.events',
    routingKey: 'invoice.paid',
    queue: 'accounting.invoice-paid',
  })
  async handleInvoicePaid(event: InvoicePaidEvent) {
    // Update accounts receivable and cash account
    await this.journalEntryService.recordPayment(event.payload);
  }
}

// Pattern 3: gRPC for High-Performance Internal Communication
// ✅ Sử dụng khi: Cần performance cao, type-safe, internal services

// accounting.proto
syntax = "proto3";

package accounting;

service AccountingService {
  rpc CreateJournalEntry(JournalEntryRequest) returns (JournalEntryResponse);
  rpc GetAccountBalance(AccountBalanceRequest) returns (AccountBalanceResponse);
  rpc GetFinancialReport(ReportRequest) returns (ReportResponse);
}

message JournalEntryRequest {
  string tenant_id = 1;
  string description = 2;
  repeated JournalLine lines = 3;
}

// Sales Service gọi Accounting via gRPC
@Injectable()
export class SalesInvoiceService {
  constructor(
    @Inject('ACCOUNTING_SERVICE')
    private accountingClient: AccountingServiceClient,
  ) {}

  async createInvoice(dto: CreateInvoiceDto): Promise<Invoice> {
    const invoice = await this.invoiceRepository.save(dto);

    // gRPC call
    const journalEntry = await this.accountingClient.createJournalEntry({
      tenantId: dto.tenantId,
      description: `Invoice ${invoice.number}`,
      lines: [
        {
          accountCode: '131', // Accounts Receivable
          debitAmount: invoice.totalAmount,
          creditAmount: 0,
        },
        {
          accountCode: '511', // Sales Revenue
          debitAmount: 0,
          creditAmount: invoice.totalAmount,
        },
      ],
    }).toPromise();

    return invoice;
  }
}

// Pattern 4: Saga Pattern for Distributed Transactions
// ✅ Sử dụng khi: Cần đảm bảo consistency across multiple services

// Order Creation Saga (Orchestrator Pattern)
@Injectable()
export class OrderCreationSaga {
  async execute(orderData: CreateOrderDto): Promise<SagaResult> {
    const saga = new Saga();

    try {
      // Step 1: Create Order
      const order = await saga.step(
        'create-order',
        () => this.orderService.create(orderData),
        (order) => this.orderService.delete(order.id), // Compensating transaction
      );

      // Step 2: Reserve Inventory
      await saga.step(
        'reserve-inventory',
        () => this.inventoryService.reserve(order.items),
        () => this.inventoryService.release(order.items),
      );

      // Step 3: Create Invoice
      await saga.step(
        'create-invoice',
        () => this.invoiceService.create(order),
        (invoice) => this.invoiceService.cancel(invoice.id),
      );

      // Step 4: Record in Accounting
      await saga.step(
        'record-accounting',
        () => this.accountingService.recordSale(order),
        () => this.accountingService.reverse(order.id),
      );

      await saga.commit();
      return { success: true, order };

    } catch (error) {
      // Rollback all steps
      await saga.rollback();
      throw error;
    }
  }
}
```

#### Service Resilience Patterns

```typescript
// Circuit Breaker Pattern
@Injectable()
export class CircuitBreakerService {
  private circuits = new Map<string, CircuitBreaker>();

  async execute<T>(
    serviceName: string,
    operation: () => Promise<T>
  ): Promise<T> {
    const circuit = this.getCircuit(serviceName);

    if (circuit.isOpen()) {
      throw new CircuitBreakerOpenException(
        `Circuit breaker is open for ${serviceName}`
      );
    }

    try {
      const result = await operation();
      circuit.recordSuccess();
      return result;
    } catch (error) {
      circuit.recordFailure();
      throw error;
    }
  }
}

// Retry Pattern with Exponential Backoff
async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      if (i === maxRetries - 1) throw error;

      const delay = baseDelay * Math.pow(2, i);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}

// Timeout Pattern
async function withTimeout<T>(
  operation: () => Promise<T>,
  timeoutMs: number = 5000
): Promise<T> {
  return Promise.race([
    operation(),
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new TimeoutException()), timeoutMs)
    ),
  ]);
}

// Bulkhead Pattern (Resource Isolation)
@Injectable()
export class BulkheadService {
  private semaphores = new Map<string, Semaphore>();

  async execute<T>(
    poolName: string,
    operation: () => Promise<T>,
    maxConcurrent: number = 10
  ): Promise<T> {
    const semaphore = this.getSemaphore(poolName, maxConcurrent);

    await semaphore.acquire();
    try {
      return await operation();
    } finally {
      semaphore.release();
    }
  }
}
```

#### Service Discovery & Registry

```yaml
# Consul Service Discovery
Services:
  - auth-service:
      address: auth-service.default.svc.cluster.local
      port: 3001
      health_check: /health
      tags: [authentication, oauth]

  - accounting-service:
      address: accounting-service.default.svc.cluster.local
      port: 3003
      health_check: /health
      tags: [accounting, financial]

  - sales-service:
      address: sales-service.default.svc.cluster.local
      port: 3004
      health_check: /health
      tags: [sales, crm]

# Service Discovery Client
import { Consul } from 'consul';

@Injectable()
export class ServiceDiscoveryClient {
  private consul: Consul;

  async getServiceUrl(serviceName: string): Promise<string> {
    const services = await this.consul.health.service({
      service: serviceName,
      passing: true, // Only healthy instances
    });

    // Load balancing: Round-robin or Random
    const service = this.selectService(services);
    return `http://${service.Service.Address}:${service.Service.Port}`;
  }

  async registerService(config: ServiceConfig): Promise<void> {
    await this.consul.agent.service.register({
      name: config.name,
      address: config.address,
      port: config.port,
      check: {
        http: `http://${config.address}:${config.port}/health`,
        interval: '10s',
        timeout: '5s',
      },
    });
  }
}
```

#### Service Mesh with Istio (Advanced)

```yaml
# Istio Configuration for Traffic Management
apiVersion: networking.istio.io/v1alpha3
kind: VirtualService
metadata:
  name: accounting-service
spec:
  hosts:
    - accounting-service
  http:
    - match:
        - headers:
            version:
              exact: v2
      route:
        - destination:
            host: accounting-service
            subset: v2
          weight: 20 # Canary deployment: 20% traffic to v2
    - route:
        - destination:
            host: accounting-service
            subset: v1
          weight: 80 # 80% traffic to v1

---
# Circuit Breaker with Istio
apiVersion: networking.istio.io/v1alpha3
kind: DestinationRule
metadata:
  name: inventory-service-circuit-breaker
spec:
  host: inventory-service
  trafficPolicy:
    connectionPool:
      tcp:
        maxConnections: 100
      http:
        http1MaxPendingRequests: 50
        maxRequestsPerConnection: 2
    outlierDetection:
      consecutiveErrors: 5
      interval: 30s
      baseEjectionTime: 30s
      maxEjectionPercent: 50

---
# Retry Policy
apiVersion: networking.istio.io/v1alpha3
kind: VirtualService
metadata:
  name: sales-service-retry
spec:
  hosts:
    - sales-service
  http:
    - route:
        - destination:
            host: sales-service
      retries:
        attempts: 3
        perTryTimeout: 2s
        retryOn: 5xx,reset,connect-failure
```

#### Database per Service (Microservices Data Pattern)

```yaml
# Mỗi service có database riêng hoặc schema riêng

Services với Database riêng:
  auth-service:
    database: auth_db
    schema: public
    tables:
      - users
      - roles
      - permissions
      - sessions

  tenant-service:
    database: tenant_db
    schema: public
    tables:
      - tenants
      - subscriptions
      - feature_flags
      - billing_info

  accounting-service:
    database: accounting_db # Hoặc shared_db với schema: accounting
    schema: accounting
    tables:
      - chart_of_accounts
      - journal_entries
      - journal_entry_lines
      - invoices
      - payments

  sales-service:
    database: sales_db
    schema: sales
    tables:
      - customers
      - orders
      - order_lines
      - quotations

  inventory-service:
    database: inventory_db
    schema: inventory
    tables:
      - products
      - warehouses
      - stock_movements
      - stock_levels
# Cross-Service Data Access via APIs only
# ❌ KHÔNG truy cập trực tiếp database của service khác
# ✅ SỬ DỤNG API hoặc Events để lấy dữ liệu
```

#### Distributed Tracing & Observability

```typescript
// OpenTelemetry for Distributed Tracing
import { trace, SpanStatusCode } from "@opentelemetry/api";

@Injectable()
export class SalesOrderService {
  private tracer = trace.getTracer("sales-service");

  async createOrder(dto: CreateOrderDto): Promise<Order> {
    const span = this.tracer.startSpan("createOrder", {
      attributes: {
        "tenant.id": dto.tenantId,
        "user.id": dto.userId,
        "order.total": dto.totalAmount,
      },
    });

    try {
      // Step 1: Validate
      const validationSpan = this.tracer.startSpan("validateOrder", {
        parent: span,
      });
      await this.validateOrder(dto);
      validationSpan.end();

      // Step 2: Create order
      const order = await this.orderRepository.save(dto);

      // Step 3: Call other services
      const inventorySpan = this.tracer.startSpan("checkInventory", {
        parent: span,
        attributes: {
          service: "inventory-service",
        },
      });
      await this.inventoryClient.checkStock(order.items);
      inventorySpan.end();

      span.setStatus({ code: SpanStatusCode.OK });
      return order;
    } catch (error) {
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: error.message,
      });
      span.recordException(error);
      throw error;
    } finally {
      span.end();
    }
  }
}

// Jaeger/Zipkin UI sẽ hiển thị:
// Request: POST /orders
// ├─ createOrder (sales-service) - 450ms
//    ├─ validateOrder - 50ms
//    ├─ database.save - 100ms
//    └─ checkInventory → inventory-service - 200ms
//       ├─ database.query - 50ms
//       └─ cache.get - 10ms
```

#### API Gateway Configuration (Kong)

```yaml
# Kong API Gateway Routes
services:
  - name: auth-service
    url: http://auth-service:3001
    routes:
      - name: auth-routes
        paths:
          - /api/auth
        methods:
          - GET
          - POST
        plugins:
          - name: rate-limiting
            config:
              minute: 100
              hour: 1000
          - name: cors
            config:
              origins: ["*"]

  - name: accounting-service
    url: http://accounting-service:3003
    routes:
      - name: accounting-routes
        paths:
          - /api/accounting
        methods:
          - GET
          - POST
          - PUT
          - DELETE
        plugins:
          - name: jwt
            config:
              secret_is_base64: false
          - name: rate-limiting
            config:
              minute: 200
          - name: request-transformer
            config:
              add:
                headers:
                  - X-Service:accounting

  - name: sales-service
    url: http://sales-service:3004
    routes:
      - name: sales-routes
        paths:
          - /api/sales
        plugins:
          - name: jwt
          - name: acl
            config:
              whitelist: ["admin", "sales"]
```

#### Core Services

##### 3.1 Authentication Service

```typescript
Port: 3001
Database: auth_db (PostgreSQL)
Cache: Redis

Chức năng:
- Multi-provider authentication (Google, Microsoft, Apple)
- JWT token management (access + refresh tokens)
- SSO (Single Sign-On)
- MFA (Multi-Factor Authentication)
- Session management
- Rate limiting

Tech Stack:
- Passport.js (OAuth strategies)
- JWT (jsonwebtoken)
- Redis (session storage)
- PostgreSQL (user data)

Endpoints:
POST   /auth/login
POST   /auth/register
POST   /auth/refresh
POST   /auth/logout
GET    /auth/google
GET    /auth/google/callback
POST   /auth/mfa/enable
POST   /auth/mfa/verify
```

##### 3.2 Tenant Management Service

```typescript
Chức năng:
- Tenant registration & provisioning
- Subscription management
- Feature flags per tenant
- Tenant isolation
- Multi-tenant data routing
- Billing & usage tracking

Database Strategy: Hybrid Approach
- Shared Database, Shared Schema (với tenant_id)
- Isolated Database per tenant (cho enterprise)

Tech Stack:
- PostgreSQL (tenant config)
- Redis (tenant cache)
- RabbitMQ (async provisioning)

Endpoints:
POST   /tenants                    # Create tenant
GET    /tenants/:id                # Get tenant info
PUT    /tenants/:id                # Update tenant
GET    /tenants/:id/subscription   # Get subscription
POST   /tenants/:id/provision      # Provision resources
```

##### 3.3 Accounting Service (Core)

```typescript
Modules:
- General Ledger (Sổ cái)
- Accounts Payable (Công nợ phải trả)
- Accounts Receivable (Công nợ phải thu)
- Journal Entries (Bút toán)
- Financial Statements (Báo cáo tài chính)
- Tax Management (Quản lý thuế)
- Bank Reconciliation (Đối soát ngân hàng)

Tech Stack:
- PostgreSQL (transactional data)
- TimescaleDB extension (time-series financial data)
- Redis (caching)
- Elasticsearch (search & analytics)

Endpoints:
POST   /accounting/accounts        # Create account
GET    /accounting/accounts        # List accounts
POST   /accounting/journal-entries # Create journal entry
GET    /accounting/reports/balance-sheet
GET    /accounting/reports/income-statement
GET    /accounting/reports/cash-flow
```

##### 3.4 Inventory Service

```typescript
Chức năng:
- Product management
- Stock tracking
- Warehouse management
- Batch & serial number tracking
- Stock movements
- Low stock alerts

Endpoints:
POST   /inventory/products
GET    /inventory/products
POST   /inventory/stock-movements
GET    /inventory/stock-levels
```

##### 3.5 Sales Service

```typescript
Chức năng:
- Quotations
- Sales Orders
- Invoices
- Delivery Notes
- Customer management
- Pricing rules

Endpoints:
POST   /sales/orders
GET    /sales/orders
POST   /sales/invoices
GET    /sales/customers
```

##### 3.6 Purchase Service

```typescript
Chức năng:
- Purchase Requests
- Purchase Orders
- Vendor management
- Goods Receipt
- Purchase Invoices

Endpoints:
POST   /purchase/orders
GET    /purchase/orders
POST   /purchase/receipts
GET    /purchase/vendors
```

##### 3.7 HR Service

```typescript
Chức năng:
- Employee management
- Payroll processing
- Attendance tracking
- Leave management
- Expense claims

Endpoints:
POST   /hr/employees
GET    /hr/employees
POST   /hr/payroll/process
GET    /hr/attendance
```

##### 3.8 Notification Service

```typescript
Port: 3008
Queue: RabbitMQ
Cache: Redis

Chức năng:
- Email notifications
- Push notifications (PWA)
- In-app notifications
- SMS (optional)
- Webhook notifications

Tech Stack:
- Bull/BullMQ (job queue)
- SendGrid/AWS SES (email)
- Firebase Cloud Messaging (push)
- WebSocket (real-time)

Event Subscriptions:
- order.created → Send order confirmation email
- invoice.paid → Send payment receipt
- stock.low → Alert warehouse manager
```

#### 3.10 Microservices Deployment Architecture

```yaml
# Docker Compose (Development)
version: "3.8"

services:
  # API Gateway
  api-gateway:
    image: kong:3.4
    ports:
      - "8000:8000"
      - "8443:8443"
      - "8001:8001"
    environment:
      KONG_DATABASE: postgres
      KONG_PG_HOST: postgres
    depends_on:
      - postgres
    networks:
      - erp-network

  # Authentication Service
  auth-service:
    build: ./services/auth
    ports:
      - "3001:3001"
    environment:
      DATABASE_URL: postgresql://auth_user:password@postgres:5432/auth_db
      REDIS_URL: redis://redis:6379/0
      JWT_SECRET: ${JWT_SECRET}
    depends_on:
      - postgres
      - redis
    networks:
      - erp-network
    deploy:
      replicas: 2
      resources:
        limits:
          cpus: "0.5"
          memory: 512M

  # Tenant Service
  tenant-service:
    build: ./services/tenant
    ports:
      - "3002:3002"
    environment:
      DATABASE_URL: postgresql://tenant_user:password@postgres:5432/tenant_db
      REDIS_URL: redis://redis:6379/1
    depends_on:
      - postgres
      - redis
    networks:
      - erp-network

  # Accounting Service (Stateless, Scalable)
  accounting-service:
    build: ./services/accounting
    ports:
      - "3003:3003"
    environment:
      DATABASE_URL: postgresql://accounting_user:password@postgres:5432/accounting_db
      REDIS_URL: redis://redis:6379/2
      RABBITMQ_URL: amqp://rabbitmq:5672
      ELASTICSEARCH_URL: http://elasticsearch:9200
    depends_on:
      - postgres
      - redis
      - rabbitmq
      - elasticsearch
    networks:
      - erp-network
    deploy:
      replicas: 3
      resources:
        limits:
          cpus: "1.0"
          memory: 1024M

  # Sales Service
  sales-service:
    build: ./services/sales
    ports:
      - "3004:3004"
    environment:
      DATABASE_URL: postgresql://sales_user:password@postgres:5432/sales_db
      RABBITMQ_URL: amqp://rabbitmq:5672
    networks:
      - erp-network

  # Inventory Service
  inventory-service:
    build: ./services/inventory
    ports:
      - "3005:3005"
    environment:
      DATABASE_URL: postgresql://inventory_user:password@postgres:5432/inventory_db
      RABBITMQ_URL: amqp://rabbitmq:5672
    networks:
      - erp-network

  # Infrastructure Services
  postgres:
    image: postgres:15
    environment:
      POSTGRES_PASSWORD: rootpassword
    volumes:
      - postgres-data:/var/lib/postgresql/data
    networks:
      - erp-network

  redis:
    image: redis:7-alpine
    volumes:
      - redis-data:/data
    networks:
      - erp-network

  rabbitmq:
    image: rabbitmq:3-management
    ports:
      - "5672:5672"
      - "15672:15672"
    volumes:
      - rabbitmq-data:/var/lib/rabbitmq
    networks:
      - erp-network

  elasticsearch:
    image: elasticsearch:8.11.0
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
    volumes:
      - elasticsearch-data:/usr/share/elasticsearch/data
    networks:
      - erp-network

  # Service Discovery
  consul:
    image: consul:1.16
    ports:
      - "8500:8500"
    networks:
      - erp-network

networks:
  erp-network:
    driver: bridge

volumes:
  postgres-data:
  redis-data:
  rabbitmq-data:
  elasticsearch-data:
```

```yaml
# Kubernetes Deployment (Production)
---
# Accounting Service Deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: accounting-service
  namespace: erp-production
spec:
  replicas: 3
  selector:
    matchLabels:
      app: accounting-service
  template:
    metadata:
      labels:
        app: accounting-service
        version: v1
    spec:
      containers:
        - name: accounting-service
          image: registry.example.com/accounting-service:v1.0.0
          ports:
            - containerPort: 3003
          env:
            - name: DATABASE_URL
              valueFrom:
                secretKeyRef:
                  name: accounting-secrets
                  key: database-url
            - name: REDIS_URL
              value: redis://redis-cluster:6379
          resources:
            requests:
              memory: "512Mi"
              cpu: "250m"
            limits:
              memory: "1Gi"
              cpu: "1000m"
          livenessProbe:
            httpGet:
              path: /health
              port: 3003
            initialDelaySeconds: 30
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /ready
              port: 3003
            initialDelaySeconds: 5
            periodSeconds: 5

---
# Accounting Service - Horizontal Pod Autoscaler
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: accounting-service-hpa
  namespace: erp-production
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: accounting-service
  minReplicas: 3
  maxReplicas: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
    - type: Resource
      resource:
        name: memory
        target:
          type: Utilization
          averageUtilization: 80

---
# Accounting Service - Service
apiVersion: v1
kind: Service
metadata:
  name: accounting-service
  namespace: erp-production
spec:
  selector:
    app: accounting-service
  ports:
    - protocol: TCP
      port: 80
      targetPort: 3003
  type: ClusterIP

---
# Istio VirtualService for Canary Deployment
apiVersion: networking.istio.io/v1alpha3
kind: VirtualService
metadata:
  name: accounting-service-canary
  namespace: erp-production
spec:
  hosts:
    - accounting-service
  http:
    - match:
        - headers:
            x-version:
              exact: canary
      route:
        - destination:
            host: accounting-service
            subset: v2
    - route:
        - destination:
            host: accounting-service
            subset: v1
          weight: 90
        - destination:
            host: accounting-service
            subset: v2
          weight: 10 # 10% traffic to canary version
```

#### 3.11 Inter-Service Communication Matrix

```
┌──────────────┬───────┬────────┬───────────┬───────┬──────────┬────────┐
│   Service    │ Auth  │ Tenant │Accounting │ Sales │Inventory │   HR   │
├──────────────┼───────┼────────┼───────────┼───────┼──────────┼────────┤
│ Auth         │   -   │  REST  │   gRPC    │ gRPC  │  gRPC    │  gRPC  │
├──────────────┼───────┼────────┼───────────┼───────┼──────────┼────────┤
│ Tenant       │  REST │   -    │   Event   │ Event │  Event   │  Event │
├──────────────┼───────┼────────┼───────────┼───────┼──────────┼────────┤
│ Accounting   │ gRPC  │  Event │     -     │ Event │  Event   │  Event │
├──────────────┼───────┼────────┼───────────┼───────┼──────────┼────────┤
│ Sales        │ gRPC  │  Event │   Event   │   -   │   REST   │  Event │
├──────────────┼───────┼────────┼───────────┼───────┼──────────┼────────┤
│ Inventory    │ gRPC  │  Event │   Event   │ Event │    -     │  Event │
├──────────────┼───────┼────────┼───────────┼───────┼──────────┼────────┤
│ HR           │ gRPC  │  Event │   Event   │   -   │    -     │   -    │
└──────────────┴───────┴────────┴───────────┴───────┴──────────┴────────┘

Legend:
- REST: Synchronous HTTP REST API
- gRPC: High-performance RPC (Auth/Authorization checks)
- Event: Asynchronous via RabbitMQ/Kafka
```

##### 3.9 Reporting Service

```typescript
Chức năng:
- Custom report builder
- Scheduled reports
- Export (PDF, Excel, CSV)
- Data visualization
- Dashboard analytics

Tech Stack:
- Apache Superset / Metabase
- PostgreSQL (data warehouse)
- Redis (cache)
```

---

### 4. Database Architecture

#### 4.1 Multi-Tenant Strategy

**Approach: Hybrid Model**

```sql
-- Option 1: Shared Database, Shared Schema (Recommended cho SME)
-- Mỗi bảng có tenant_id

CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    subdomain VARCHAR(100) UNIQUE NOT NULL,
    plan VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    email VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    role VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, email)
);

CREATE INDEX idx_users_tenant_id ON users(tenant_id);

-- Row Level Security (RLS) for data isolation
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_policy ON users
    USING (tenant_id = current_setting('app.current_tenant')::UUID);

-- Option 2: Separate Database per Tenant (cho Enterprise)
-- Provisioning script tạo database riêng cho từng tenant
```

#### 4.2 Database Schema (Core Accounting)

```sql
-- Chart of Accounts
CREATE TABLE chart_of_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    account_code VARCHAR(50) NOT NULL,
    account_name VARCHAR(255) NOT NULL,
    account_type VARCHAR(50) NOT NULL, -- Asset, Liability, Equity, Revenue, Expense
    parent_account_id UUID REFERENCES chart_of_accounts(id),
    balance_type VARCHAR(10) NOT NULL, -- Debit, Credit
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, account_code)
);

-- Journal Entries
CREATE TABLE journal_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    entry_number VARCHAR(50) NOT NULL,
    entry_date DATE NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL, -- Draft, Posted, Reversed
    created_by UUID NOT NULL REFERENCES users(id),
    posted_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, entry_number)
);

-- Journal Entry Lines
CREATE TABLE journal_entry_lines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    journal_entry_id UUID NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES chart_of_accounts(id),
    debit_amount DECIMAL(15, 2) DEFAULT 0,
    credit_amount DECIMAL(15, 2) DEFAULT 0,
    description TEXT,
    line_number INT NOT NULL,
    CONSTRAINT check_debit_credit CHECK (
        (debit_amount > 0 AND credit_amount = 0) OR
        (credit_amount > 0 AND debit_amount = 0)
    )
);

-- Invoices
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    invoice_number VARCHAR(50) NOT NULL,
    customer_id UUID NOT NULL,
    invoice_date DATE NOT NULL,
    due_date DATE NOT NULL,
    total_amount DECIMAL(15, 2) NOT NULL,
    tax_amount DECIMAL(15, 2) DEFAULT 0,
    status VARCHAR(50) NOT NULL, -- Draft, Sent, Paid, Overdue, Cancelled
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, invoice_number)
);
```

#### 4.3 Database Optimization

```sql
-- Partitioning for large tables (by tenant or date)
CREATE TABLE journal_entries_partitioned (
    LIKE journal_entries INCLUDING ALL
) PARTITION BY RANGE (entry_date);

CREATE TABLE journal_entries_2024 PARTITION OF journal_entries_partitioned
    FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');

-- Indexes
CREATE INDEX idx_journal_entries_tenant_date
    ON journal_entries(tenant_id, entry_date);

CREATE INDEX idx_invoices_tenant_status
    ON invoices(tenant_id, status);

-- Materialized views for reporting
CREATE MATERIALIZED VIEW mv_account_balances AS
SELECT
    tenant_id,
    account_id,
    SUM(debit_amount - credit_amount) as balance,
    MAX(created_at) as last_updated
FROM journal_entry_lines jel
JOIN journal_entries je ON je.id = jel.journal_entry_id
WHERE je.status = 'Posted'
GROUP BY tenant_id, account_id;

CREATE UNIQUE INDEX ON mv_account_balances(tenant_id, account_id);
```

---

### 5. API Gateway & BFF Pattern

```typescript
// Backend for Frontend (BFF) Pattern
// API Gateway aggregates multiple microservices

import { Injectable } from "@nestjs/common";

@Injectable()
export class DashboardBFFService {
  constructor(
    private accountingService: AccountingService,
    private salesService: SalesService,
    private inventoryService: InventoryService
  ) {}

  async getDashboardData(tenantId: string, userId: string) {
    // Parallel calls to multiple services
    const [accountingSummary, salesSummary, inventorySummary] =
      await Promise.all([
        this.accountingService.getSummary(tenantId),
        this.salesService.getSummary(tenantId),
        this.inventoryService.getSummary(tenantId),
      ]);

    return {
      accounting: accountingSummary,
      sales: salesSummary,
      inventory: inventorySummary,
      lastUpdated: new Date(),
    };
  }
}
```

---

### 6. Security Architecture

#### 6.1 Authentication & Authorization

```typescript
// JWT Strategy
{
  "sub": "user-id",
  "email": "user@example.com",
  "tenant_id": "tenant-id",
  "roles": ["admin", "accountant"],
  "permissions": [
    "accounting:read",
    "accounting:write",
    "reports:generate"
  ],
  "iat": 1734480000,
  "exp": 1734483600
}

// Role-Based Access Control (RBAC)
const roles = {
  owner: ['*'], // All permissions
  admin: ['accounting:*', 'inventory:*', 'sales:*', 'hr:*'],
  accountant: ['accounting:*', 'reports:read'],
  salesperson: ['sales:*', 'customers:read'],
  viewer: ['*:read'],
};
```

#### 6.2 Data Security

```yaml
Encryption:
  - At Rest: AES-256 (database encryption)
  - In Transit: TLS 1.3
  - Sensitive Fields: Application-level encryption (PII)

API Security:
  - Rate Limiting: Redis-based (100 req/min per user)
  - CORS: Whitelist domains
  - API Keys: For integrations
  - Webhook Signatures: HMAC-SHA256

Audit Logging:
  - All data modifications
  - User actions
  - Failed login attempts
  - Permission changes
```

---

### 7. Scalability & Performance

#### 7.1 Horizontal Scaling

```yaml
Frontend:
  - Static assets: CDN (CloudFlare/CloudFront)
  - Next.js: Multiple instances behind load balancer
  - Edge Functions: Vercel/CloudFlare Workers

Backend:
  - Microservices: Kubernetes (auto-scaling)
  - Database: Read replicas (PostgreSQL)
  - Caching: Redis Cluster
  - Message Queue: RabbitMQ Cluster

Load Balancing:
  - Application: AWS ALB / Nginx
  - Database: PgBouncer (connection pooling)
```

#### 7.2 Caching Strategy

```typescript
// Multi-layer caching
const cache = {
  L1: "Browser Cache (Service Worker)",
  L2: "CDN Cache (Static assets)",
  L3: "Redis Cache (API responses)",
  L4: "Database Query Cache",
};

// Cache invalidation
// Event-driven approach
eventBus.on("invoice.updated", async (event) => {
  await cache.invalidate(`invoice:${event.invoiceId}`);
  await cache.invalidate(`customer:${event.customerId}:invoices`);
});
```

#### 7.3 Performance Optimization

```typescript
// Frontend
- Code splitting (dynamic imports)
- Image optimization (Next.js Image)
- Prefetching & preloading
- Virtual scrolling (react-window)
- Debouncing & throttling

// Backend
- Database indexing
- Query optimization (EXPLAIN ANALYZE)
- Connection pooling
- Async processing (job queues)
- GraphQL DataLoader (N+1 prevention)
```

---

### 8. DevOps & Infrastructure

#### 8.1 CI/CD Pipeline

```yaml
Source Control: GitHub/GitLab
CI/CD: GitHub Actions / GitLab CI

Pipeline: 1. Code Push
  2. Linting & Formatting (ESLint, Prettier)
  3. Unit Tests (Jest)
  4. Integration Tests
  5. Security Scan (Snyk, SonarQube)
  6. Build Docker Images
  7. Push to Registry (Docker Hub, ECR)
  8. Deploy to Staging
  9. E2E Tests (Playwright)
  10. Deploy to Production (Blue-Green)
  11. Health Checks
  12. Rollback on failure
```

#### 8.2 Infrastructure as Code

```yaml
Platform: AWS / Google Cloud / Azure

Infrastructure:
  - Terraform (IaC)
  - Kubernetes (container orchestration)
  - Helm (package management)

Services:
  - Compute: ECS/EKS (AWS) or GKE (Google Cloud)
  - Database: RDS PostgreSQL (Multi-AZ)
  - Cache: ElastiCache Redis
  - Storage: S3/Cloud Storage
  - CDN: CloudFront/Cloud CDN
  - Monitoring: DataDog / New Relic
  - Logging: ELK Stack / CloudWatch
```

#### 8.3 Monitoring & Observability

```yaml
Application Monitoring:
  - APM: DataDog / New Relic
  - Error Tracking: Sentry
  - Uptime: Pingdom / UptimeRobot

Logging:
  - Centralized: ELK Stack (Elasticsearch, Logstash, Kibana)
  - Structured logging (JSON format)

Metrics:
  - Prometheus + Grafana
  - Custom business metrics
  - SLA tracking (99.9% uptime)

Alerting:
  - PagerDuty / Opsgenie
  - Slack notifications
  - Email alerts
```

---

### 9. UX/UI Design System

#### 9.1 Design Principles

```yaml
Mobile-First:
  - Touch-friendly (min 44x44px tap targets)
  - Thumb-zone optimization
  - Gesture support (swipe, pinch, etc.)

Progressive Disclosure:
  - Show essential info first
  - Drill-down for details
  - Contextual actions

Performance:
  - < 2s initial load
  - < 100ms interactions
  - Skeleton screens
  - Optimistic UI updates

Accessibility:
  - WCAG 2.1 AA compliance
  - Keyboard navigation
  - Screen reader support
  - Color contrast (4.5:1)
```

#### 9.2 Component Library

```typescript
// Base components (Shadcn/ui)
-Button,
  Input,
  Select,
  Checkbox,
  Radio - Dialog,
  Dropdown,
  Tooltip,
  Popover - Table,
  DataGrid(virtualized) - Form,
  FormField,
  FormValidation - Card,
  Badge,
  Avatar - Navigation,
  Sidebar,
  Breadcrumbs -
    // Business components
    InvoiceForm -
    JournalEntryForm -
    FinancialDashboard -
    ReportViewer -
    ChartOfAccountsTree -
    TransactionList;
```

#### 9.3 Responsive Breakpoints

```css
/* Mobile-first approach */
:root {
  --breakpoint-xs: 320px; /* Small phone */
  --breakpoint-sm: 640px; /* Phone */
  --breakpoint-md: 768px; /* Tablet */
  --breakpoint-lg: 1024px; /* Desktop */
  --breakpoint-xl: 1280px; /* Large desktop */
  --breakpoint-2xl: 1536px; /* Extra large */
}

/* Layout adaptation */
.dashboard-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: 1fr; /* Mobile */
}

@media (min-width: 768px) {
  .dashboard-grid {
    grid-template-columns: repeat(2, 1fr); /* Tablet */
  }
}

@media (min-width: 1024px) {
  .dashboard-grid {
    grid-template-columns: repeat(3, 1fr); /* Desktop */
  }
}
```

---

### 10. Integration & Extensibility

#### 10.1 API Integration

```typescript
// REST API
- Standard JSON API
- Pagination, filtering, sorting
- Webhooks for events
- API documentation (Swagger/OpenAPI)

// GraphQL API (optional)
- Flexible queries
- Real-time subscriptions
- Better for mobile (reduce over-fetching)

// Third-party integrations
- Payment gateways (Stripe, PayPal)
- Banking APIs (Plaid, TrueLayer)
- E-commerce platforms (Shopify, WooCommerce)
- Accounting software (QuickBooks, Xero)
- Email (SendGrid, Mailgun)
- SMS (Twilio)
```

#### 10.2 Plugin System

```typescript
// Plugin architecture for extensibility
interface Plugin {
  name: string;
  version: string;
  initialize: (app: App) => void;
  hooks: {
    [key: string]: Function;
  };
}

// Example: Custom report plugin
const customReportPlugin: Plugin = {
  name: "custom-report-plugin",
  version: "1.0.0",
  initialize: (app) => {
    app.registerRoute("/reports/custom", CustomReportHandler);
  },
  hooks: {
    "invoice.created": async (invoice) => {
      // Custom logic
    },
  },
};
```

---

### 11. Deployment Strategy

#### 11.1 Environment Setup

```yaml
Environments:
  - Development: Local + dev server
  - Staging: Pre-production testing
  - Production: Live environment

Configuration:
  - Environment variables
  - Secret management (AWS Secrets Manager)
  - Feature flags (LaunchDarkly, Flagsmith)
```

#### 11.2 Deployment Process

```bash
# Blue-Green Deployment
# Zero-downtime deployment

# Step 1: Deploy to green environment
kubectl apply -f k8s/deployment-green.yaml

# Step 2: Run health checks
curl https://green.api.example.com/health

# Step 3: Switch traffic (gradually)
kubectl patch service api-service -p '{"spec":{"selector":{"version":"green"}}}'

# Step 4: Monitor metrics

# Step 5: Rollback if needed (switch back to blue)
kubectl patch service api-service -p '{"spec":{"selector":{"version":"blue"}}}'
```

---

### 12. Cost Optimization

```yaml
Infrastructure:
  - Use spot instances for non-critical workloads
  - Auto-scaling based on traffic
  - Database: Right-sizing, reserved instances
  - CDN: Compression, cache optimization
  - Object storage: Lifecycle policies

Development:
  - Shared staging environment
  - Ephemeral preview environments (per PR)
  - Local development with Docker Compose

Monitoring:
  - Cost tracking per tenant
  - Budget alerts
  - Resource utilization reports
```

---

### 13. Data Backup & Disaster Recovery

```yaml
Backup Strategy:
  Database:
    - Automated daily backups (retention: 30 days)
    - Point-in-time recovery (PITR)
    - Cross-region replication

  Files:
    - S3 versioning enabled
    - Cross-region replication

  Configuration:
    - Git-based (Infrastructure as Code)

Disaster Recovery:
  - RTO (Recovery Time Objective): < 1 hour
  - RPO (Recovery Point Objective): < 5 minutes
  - Multi-region deployment (active-active or active-passive)
  - Regular DR drills (quarterly)
```

---

### 14. Compliance & Legal

```yaml
Data Protection:
  - GDPR compliance (EU)
  - Data residency options
  - Right to be forgotten
  - Data export functionality

Financial Compliance:
  - Audit trails
  - Immutable financial records
  - Vietnamese accounting standards (VAS)
  - Tax compliance features

Security Standards:
  - SOC 2 Type II
  - ISO 27001
  - PCI DSS (if handling payments)
```

---

### 15. Roadmap & Future Enhancements

#### Phase 1: MVP (3-4 months)

```yaml
- User authentication (Google)
- Tenant management
- Basic accounting module
  - Chart of accounts
  - Journal entries
  - Basic reports
- Invoice management
- Responsive UI
```

#### Phase 2: Core Features (3-4 months)

```yaml
- Sales module
- Purchase module
- Inventory module
- Bank reconciliation
- Advanced reporting
- Mobile PWA
- Multi-currency support
```

#### Phase 3: Advanced Features (3-4 months)

```yaml
- HR module
- Payroll
- Project management
- Time tracking
- Advanced analytics
- AI-powered insights
- Mobile apps (React Native)
```

#### Phase 4: Enterprise Features (Ongoing)

```yaml
- Multi-company support
- Workflow automation
- Custom fields & forms
- Advanced integrations
- White-labeling
- API marketplace
```

---

## 📊 Technical Decisions Summary

### Frontend

- **Framework**: Next.js 14+ (React)
- **UI Library**: TailwindCSS + Shadcn/ui
- **State**: Zustand + React Query
- **Mobile**: PWA + Responsive design

### Backend

- **Runtime**: Node.js + TypeScript
- **Framework**: NestJS
- **Architecture**: Microservices
- **API**: REST + GraphQL (optional)

### Database

- **Primary**: PostgreSQL (with RLS)
- **Cache**: Redis
- **Search**: Elasticsearch
- **Message Queue**: RabbitMQ

### Infrastructure

- **Cloud**: AWS / GCP
- **Containers**: Docker + Kubernetes
- **CI/CD**: GitHub Actions
- **Monitoring**: DataDog / Prometheus

### Security

- **Auth**: OAuth 2.0 + JWT
- **Encryption**: TLS 1.3 + AES-256
- **RBAC**: Role-based access control

---

## 🎯 Success Metrics (KPIs)

```yaml
Performance:
  - Page load time: < 2s
  - API response time: < 200ms (p95)
  - Uptime: 99.9%

Business:
  - User acquisition rate
  - Monthly Active Users (MAU)
  - Churn rate < 5%
  - Customer Satisfaction (CSAT) > 4.5/5

Technical:
  - Code coverage: > 80%
  - Bug resolution time: < 24h
  - Deployment frequency: Multiple times per week
  - Mean Time to Recovery (MTTR): < 1 hour
```

---

## 📝 Development Best Practices

```yaml
Code Quality:
  - TypeScript strict mode
  - ESLint + Prettier
  - Husky (pre-commit hooks)
  - Conventional commits

Testing:
  - Unit tests: Jest
  - Integration tests: Supertest
  - E2E tests: Playwright
  - Visual regression: Chromatic

Documentation:
  - API documentation: Swagger/OpenAPI
  - Code documentation: JSDoc/TSDoc
  - Architecture decision records (ADR)
  - Runbooks for operations

Code Review:
  - Peer review required
  - Automated checks (CI)
  - Security review for sensitive changes
```

---

## 🚀 Getting Started (Development)

### Prerequisites

```bash
- Node.js 20+
- PostgreSQL 15+
- Redis 7+
- Docker & Docker Compose
```

### Local Setup

```bash
# Clone repository
git clone https://github.com/yourorg/saas-erp.git
cd saas-erp

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your configuration

# Start infrastructure (Docker Compose)
docker-compose up -d

# Run database migrations
npm run migrate

# Start development servers
npm run dev

# Frontend: http://localhost:3000
# API: http://localhost:4000
```

---

## 📚 Additional Resources

- [Architecture Decision Records](./docs/adr/)
- [API Documentation](./docs/api/)
- [Database Schema](./docs/database/)
- [Deployment Guide](./docs/deployment/)
- [Contributing Guidelines](./CONTRIBUTING.md)

---

## 👥 Team Structure (Suggested)

```yaml
Core Team:
  - Product Manager: 1
  - UI/UX Designer: 1
  - Frontend Developers: 2-3
  - Backend Developers: 3-4
  - DevOps Engineer: 1
  - QA Engineer: 1
  - Technical Lead: 1

Extended Team:
  - Accounting Domain Expert: 1 (consultant)
  - Security Consultant: 1 (part-time)
  - Technical Writer: 1 (part-time)
```

---

**Document Version**: 1.0  
**Last Updated**: December 17, 2025  
**Author**: System Architecture Team  
**Status**: ✅ Ready for Implementation

---

_Lưu ý: Đây là thiết kế high-level. Mỗi component sẽ cần thiết kế chi tiết riêng trước khi implementation._
