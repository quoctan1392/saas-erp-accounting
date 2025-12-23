# Core Service - Thiết Kế Chi Tiết

## 📋 Tổng Quan

**Core Service** là service trung tâm của hệ thống SaaS ERP, xử lý toàn bộ nghiệp vụ kinh doanh chính bao gồm:
- Kế toán (Accounting)
- Bán hàng (Sales)
- Kho (Inventory)
- Mua hàng (Purchase)
- Hóa đơn điện tử (E-Invoice)

## 🔧 Thông Tin Kỹ Thuật

- **Port**: 3003
- **Database**: core_db (PostgreSQL 16+)
- **Cache**: Redis
- **Message Queue**: RabbitMQ
- **Background Jobs**: Bull/BullMQ

## 🗂️ Cấu Trúc Module

```
core-service/
├── business-profile/          # Hồ sơ doanh nghiệp
├── chart-of-accounts/         # Hệ thống tài khoản kế toán
├── accounting-objects/        # Khách hàng, NCC, Nhân viên
├── items/                     # Hàng hóa dịch vụ
├── warehouses/                # Quản lý kho
├── sales/                     # Bán hàng
├── purchases/                 # Mua hàng (future)
├── inventory/                 # Xuất nhập tồn
├── invoices/                  # Hóa đơn điện tử
├── vouchers/                  # Chứng từ thu/chi
├── reports/                   # Báo cáo
├── bank-accounts/             # Tài khoản ngân hàng
└── einvoice/                  # Tích hợp hóa đơn điện tử
```

## 📊 Database Schema

Chi tiết schema: [core-service-db-design.md](./core-service-db-design.md)

**Bảng chính** (29 tables):
- business_profile
- einvoice_provider
- bank_account
- chart_of_accounts_general
- chart_of_accounts_custom
- object (customers, vendors, employees)
- subject_group
- item
- item_category
- unit
- warehouse
- special_consumption_tax_group
- inventory_transactions
- sale_voucher + sale_voucher_detail
- outward_voucher + outward_voucher_detail
- receipt_voucher + receipt_voucher_detail
- invoice + invoice_detail

**Multi-tenant Strategy**: Shared schema với tenant_id + Row Level Security (RLS)

## 🔌 API Endpoints (Summary)

### Business Profile
- `POST /business-profile` - Tạo hồ sơ doanh nghiệp
- `GET /business-profile` - Lấy thông tin hồ sơ
- `PUT /business-profile` - Cập nhật hồ sơ

### Chart of Accounts
- `GET /chart-of-accounts/general` - Danh sách tài khoản chuẩn
- `GET /chart-of-accounts/custom` - Danh sách tài khoản tùy chỉnh
- `POST /chart-of-accounts/custom` - Tạo tài khoản mới

### Accounting Objects
- `GET /objects` - Danh sách đối tượng (filter: customer/vendor/employee)
- `POST /objects` - Tạo đối tượng mới
- `GET /objects/:id` - Chi tiết đối tượng
- `PUT /objects/:id` - Cập nhật

### Items (Hàng hóa)
- `GET /items` - Danh sách hàng hóa
- `POST /items` - Tạo hàng hóa mới
- `GET /items/:id` - Chi tiết hàng hóa
- `PUT /items/:id` - Cập nhật

### Sales (Bán hàng)
- `GET /sales/vouchers` - Danh sách chứng từ bán
- `POST /sales/vouchers` - Tạo chứng từ bán
- `POST /sales/vouchers/:id/post` - Ghi sổ
- `GET /sales/outward-vouchers` - Danh sách phiếu xuất kho
- `POST /sales/outward-vouchers` - Tạo phiếu xuất
- `GET /sales/receipt-vouchers` - Danh sách phiếu thu
- `POST /sales/receipt-vouchers` - Tạo phiếu thu

### Invoices (Hóa đơn)
- `GET /invoices` - Danh sách hóa đơn
- `POST /invoices` - Tạo hóa đơn
- `POST /invoices/:id/publish` - Phát hành hóa đơn
- `POST /invoices/:id/cancel` - Hủy hóa đơn
- `GET /invoices/:id/pdf` - Xuất PDF

### Inventory (Kho)
- `GET /inventory/stock-levels` - Tồn kho hiện tại
- `GET /inventory/transactions` - Lịch sử xuất nhập
- `GET /inventory/low-stock` - Cảnh báo hàng sắp hết
- `POST /inventory/adjust` - Điều chỉnh tồn kho

### Reports (Báo cáo)
- `GET /reports/balance-sheet` - Bảng cân đối kế toán
- `GET /reports/income-statement` - Báo cáo KQKD
- `GET /reports/cash-flow` - Lưu chuyển tiền tệ
- `GET /reports/sales-by-customer` - Doanh thu theo khách
- `GET /reports/inventory-by-warehouse` - Tồn kho theo kho
- `GET /reports/vat-report` - Báo cáo thuế GTGT

## 🔄 Event Publishing (RabbitMQ)

**Events Published**:
- `sale.created` - Khi tạo đơn bán hàng
- `sale.posted` - Khi ghi sổ đơn bán
- `invoice.created` - Khi tạo hóa đơn
- `invoice.published` - Khi phát hành hóa đơn
- `inventory.out` - Khi xuất kho
- `inventory.in` - Khi nhập kho
- `payment.received` - Khi thu tiền
- `low.stock.alert` - Cảnh báo tồn kho thấp

**Events Subscribed**:
- `tenant.created` - Từ Tenant Service
- `user.created` - Từ Auth Service

## 💾 Caching Strategy

**Redis Cache Keys**:
```
tenant:{tenantId}:business-profile          # TTL: 1 hour
tenant:{tenantId}:chart-of-accounts         # TTL: 30 minutes
tenant:{tenantId}:item:{itemId}             # TTL: 15 minutes
tenant:{tenantId}:stock:{itemId}:{warehouseId} # TTL: 5 minutes
tenant:{tenantId}:object:{objectId}         # TTL: 15 minutes
tenant:{tenantId}:reports:{reportType}      # TTL: 10 minutes
```

**Cache Invalidation**:
- On write operations → Delete relevant cache keys
- Event-driven: Subscribe to update events

## 🔐 Security & Validation

### Validation Rules
1. **Tenant Isolation**: Tất cả queries có tenant_id filter
2. **Row Level Security**: PostgreSQL RLS policies
3. **Date Validation**: transactionDate >= business_profile.startDataDate
4. **Amount Validation**: Không âm, precision 2 decimals
5. **Inventory Validation**: Không xuất kho vượt tồn
6. **Account Validation**: Tài khoản phải tồn tại và active

### Authorization
- JWT token với tenant_id và user roles
- Permission-based: read, create, update, delete, post
- "Ghi sổ" (post) operations cần quyền cao hơn

### Audit Log
- Log tất cả create/update/delete operations
- Lưu user, timestamp, before/after values
- Không cho xóa audit logs

## ⚙️ Background Jobs (Bull/BullMQ)

**Scheduled Jobs**:
1. `calculate-stock-levels` - Tính tồn kho (mỗi 5 phút)
2. `low-stock-alert` - Kiểm tra tồn kho thấp (mỗi giờ)
3. `auto-post-vouchers` - Tự động ghi sổ (scheduled)
4. `generate-reports` - Tạo báo cáo định kỳ
5. `sync-einvoice` - Đồng bộ hóa đơn điện tử
6. `cleanup-old-data` - Dọn dẹp dữ liệu cũ (mỗi ngày)

## 🚀 Performance Optimization

### Database
- **Indexes**: tenant_id, posted_date, transaction_no
- **Partitioning**: Partition by tenant_id hoặc date cho large tables
- **Connection Pooling**: PgBouncer
- **Read Replicas**: Cho reports

### Application
- **Pagination**: Default 20 items/page, max 100
- **Lazy Loading**: Load details on demand
- **Batch Operations**: Bulk create/update support
- **Query Optimization**: Prevent N+1 queries

### Caching
- Cache frequently accessed data (accounts, items)
- Cache-aside pattern
- Invalidate on write

## 🔗 Service Communication

### Synchronous (REST/gRPC)
- Auth Service → Validate JWT token
- Tenant Service → Get tenant configuration

### Asynchronous (Events)
- Publish events to RabbitMQ for:
  - Notification Service
  - Reporting Service (future)
  - Analytics Service (future)

## 📈 Scaling Strategy

### Horizontal Scaling
- Stateless design → Dễ dàng scale out
- Load balancer: Round-robin / Least connections
- Kubernetes HPA: Auto-scale based on CPU/Memory

### Database Scaling
- Read replicas for reports
- Connection pooling
- Query optimization
- Partitioning cho large tables

### Caching
- Redis cluster for high availability
- Cache warm-up on startup
- Distributed caching

## 🧪 Testing Strategy

### Unit Tests
- Business logic trong services
- Validation rules
- Data transformations

### Integration Tests
- API endpoints
- Database operations
- Event publishing/subscribing

### E2E Tests
- Complete flows: Bán hàng → Xuất kho → Thu tiền
- Invoice workflow: Tạo → Phát hành → Gửi email

## 📦 Deployment

### Development
```bash
docker-compose up core-service
```

### Production (Kubernetes)
```yaml
replicas: 3
resources:
  limits:
    cpus: "1.5"
    memory: 2048M
  requests:
    cpus: "500m"
    memory: 1024M
```

### Health Checks
- `/health` - Liveness probe
- `/ready` - Readiness probe
- Check database, redis, rabbitmq connections

## 🔍 Monitoring

### Metrics
- Request rate, latency, error rate
- Database query performance
- Cache hit rate
- Background job success/failure rate

### Alerts
- High error rate (> 1%)
- Slow queries (> 1s)
- Low stock alerts
- Failed background jobs

### Logging
- Structured JSON logs
- Log levels: DEBUG, INFO, WARN, ERROR
- Correlation IDs for request tracing

## 📚 References

- Database Schema: [core-service-db-design.md](./core-service-db-design.md)
- System Design: [saas-accounting-erp-system-design.md](./saas-accounting-erp-system-design.md)
- API Documentation: Swagger UI tại `/api/docs`
