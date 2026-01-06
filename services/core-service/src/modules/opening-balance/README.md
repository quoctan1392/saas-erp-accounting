# Opening Balance Module - Implementation Guide

## 📁 File Structure

```
opening-balance/
├── opening-balance.module.ts           # Module definition
├── opening-balance.controller.ts       # REST API endpoints
├── opening-balance.service.ts          # Business logic
├── entities/
│   ├── opening-period.entity.ts       # Kỳ khởi tạo
│   ├── opening-balance.entity.ts      # Số dư tài khoản
│   └── opening-balance-detail.entity.ts # Chi tiết số dư
└── dto/
    ├── create-opening-period.dto.ts
    ├── update-opening-period.dto.ts
    ├── create-opening-balance.dto.ts
    ├── update-opening-balance.dto.ts
    ├── create-opening-balance-detail.dto.ts
    ├── query-opening-balance.dto.ts
    └── index.ts
```

## 🚀 Setup Instructions

### 1. Import Module vào AppModule

```typescript
// src/app.module.ts
import { OpeningBalanceModule } from './opening-balance/opening-balance.module';

@Module({
  imports: [
    // ... other modules
    OpeningBalanceModule,
  ],
})
export class AppModule {}
```

### 2. Run Migration

```bash
# Chạy migration để tạo tables
npm run migration:run -- 007_create_opening_balance_tables.sql
```

### 3. Configure Guards (TODO)

Trong controller, uncomment các guards khi đã có auth module:

```typescript
// opening-balance.controller.ts
@UseGuards(JwtAuthGuard) // Uncomment
@Controller('opening-balance')
export class OpeningBalanceController {
  // Replace temp IDs with decorators:
  // @TenantId() tenantId: string
  // @UserId() userId: string
}
```

### 4. TODO: Integrate with Chart of Accounts

Trong service, cần fetch thông tin account từ chart_of_accounts:

```typescript
// opening-balance.service.ts - Line ~350
// TODO: Fetch from chart_of_accounts table
// const account = await this.chartOfAccountsRepo.findOne({
//   where: { id: item.accountId, tenantId },
// });
```

## 📖 API Documentation

### Opening Period APIs

#### 1. Tạo kỳ khởi tạo

```http
POST /opening-balance/periods
Content-Type: application/json

{
  "periodName": "Kỳ đầu năm 2024",
  "openingDate": "2024-01-01",
  "description": "Số dư đầu năm 2024"
}
```

#### 2. Lấy danh sách kỳ khởi tạo

```http
GET /opening-balance/periods
```

#### 3. Chi tiết kỳ khởi tạo

```http
GET /opening-balance/periods/{periodId}
```

#### 4. Cập nhật kỳ khởi tạo

```http
PUT /opening-balance/periods/{periodId}
Content-Type: application/json

{
  "periodName": "Kỳ đầu năm 2024 (Cập nhật)",
  "description": "Mô tả mới"
}
```

#### 5. Xóa kỳ khởi tạo

```http
DELETE /opening-balance/periods/{periodId}
```

#### 6. Chốt kỳ khởi tạo

```http
POST /opening-balance/periods/{periodId}/lock
```

#### 7. Mở chốt kỳ (Admin only)

```http
POST /opening-balance/periods/{periodId}/unlock
```

### Opening Balance APIs

#### 1. Tạo số dư đơn lẻ

```http
POST /opening-balance
Content-Type: application/json

{
  "periodId": "uuid",
  "currencyId": "uuid",
  "accountId": "uuid",
  "debitBalance": 10000000,
  "creditBalance": 0,
  "hasDetails": false,
  "note": "Tiền mặt đầu kỳ"
}
```

#### 2. Batch create/update (🌟 NEW)

```http
POST /opening-balance/batch
Content-Type: application/json

{
  "periodId": "uuid",
  "currencyId": "uuid",
  "mode": "fail-fast",  // or "continue-on-error"
  "balances": [
    {
      "accountId": "uuid",
      "debitBalance": 50000000,
      "creditBalance": 0,
      "note": "Tiền mặt"
    },
    {
      "accountId": "uuid",
      "debitBalance": 100000000,
      "creditBalance": 0,
      "note": "Tiền gửi ngân hàng"
    },
    {
      "accountId": "uuid",
      "debitBalance": 0,
      "creditBalance": 30000000,
      "note": "Công nợ phải thu",
      "hasDetails": true,
      "details": [
        {
          "accountObjectId": "uuid",
          "debitBalance": 0,
          "creditBalance": 15000000,
          "description": "Khách hàng A"
        },
        {
          "accountObjectId": "uuid",
          "debitBalance": 0,
          "creditBalance": 15000000,
          "description": "Khách hàng B"
        }
      ]
    }
  ]
}
```

**Response:**

```json
{
  "success": true,
  "created": 2,
  "updated": 1,
  "failed": 0,
  "total": 3,
  "results": [
    {
      "accountNumber": "111",
      "accountName": "Tiền mặt",
      "status": "created",
      "balanceId": "uuid"
    },
    {
      "accountNumber": "112",
      "accountName": "Tiền gửi ngân hàng",
      "status": "created",
      "balanceId": "uuid"
    },
    {
      "accountNumber": "131",
      "accountName": "Phải thu khách hàng",
      "status": "updated",
      "balanceId": "uuid"
    }
  ]
}
```

#### 3. Lấy danh sách số dư

```http
GET /opening-balance?periodId=uuid&page=1&limit=50
```

Query params:

- `periodId`: Required - ID kỳ khởi tạo
- `currencyId`: Optional - Lọc theo loại tiền
- `accountNumber`: Optional - Tìm kiếm theo số TK
- `hasDetails`: Optional - Lọc có/không có chi tiết
- `page`: Optional - Trang hiện tại (default: 1)
- `limit`: Optional - Số lượng/trang (default: 50)

#### 4. Chi tiết số dư

```http
GET /opening-balance/{balanceId}
```

#### 5. Cập nhật số dư

```http
PUT /opening-balance/{balanceId}
Content-Type: application/json

{
  "debitBalance": 12000000,
  "note": "Cập nhật số dư"
}
```

#### 6. Xóa số dư

```http
DELETE /opening-balance/{balanceId}
```

### Opening Balance Details APIs

#### 1. Lấy chi tiết số dư

```http
GET /opening-balance/{balanceId}/details
```

#### 2. Tạo chi tiết đơn lẻ

```http
POST /opening-balance/{balanceId}/details
Content-Type: application/json

{
  "balanceId": "uuid",
  "accountObjectId": "uuid",
  "debitBalance": 0,
  "creditBalance": 5000000,
  "description": "Công nợ Khách hàng A"
}
```

#### 3. Cập nhật chi tiết

```http
PUT /opening-balance/{balanceId}/details/{detailId}
Content-Type: application/json

{
  "creditBalance": 6000000,
  "description": "Cập nhật công nợ"
}
```

#### 4. Xóa chi tiết

```http
DELETE /opening-balance/{balanceId}/details/{detailId}
```

### Validation & Reports APIs

#### 1. Validate số dư

```http
POST /opening-balance/validate
Content-Type: application/json

{
  "periodId": "uuid"
}
```

**Response:**

```json
{
  "valid": false,
  "errors": [
    {
      "balanceId": "uuid",
      "accountNumber": "131",
      "errorType": "sum_mismatch",
      "message": "Credit detail sum does not match balance total",
      "expected": 30000000,
      "actual": 28000000
    }
  ]
}
```

#### 2. Tổng hợp số dư (Trial Balance)

```http
GET /opening-balance/summary?periodId=uuid
```

**Response:**

```json
{
  "totalDebit": 150000000,
  "totalCredit": 150000000,
  "totalBalances": 10,
  "isBalanced": true
}
```

## 🔒 Business Rules

### Validation Rules

1. **Debit/Credit**: Không cho phép cả 2 > 0 cùng lúc
2. **Details Sum**: Tổng chi tiết phải bằng tổng header
3. **Locked Period**: Không sửa/xóa khi period đã lock
4. **At least one dimension**: Chi tiết phải có ít nhất 1 chiều phân tích

### Transaction Handling

- Batch operations sử dụng database transaction
- Mode "fail-fast": Rollback tất cả nếu có 1 lỗi
- Mode "continue-on-error": Tiếp tục, chỉ rollback record lỗi

### Conflict Resolution

- Nếu trùng (periodId + accountId + currencyId) → UPDATE
- Nếu mới → CREATE

## 🧪 Testing

### Unit Tests (TODO)

```typescript
// opening-balance.service.spec.ts
describe('OpeningBalanceService', () => {
  it('should create opening period', async () => {
    // Test implementation
  });

  it('should not allow both debit and credit > 0', async () => {
    // Test implementation
  });

  it('should validate detail sum equals balance', async () => {
    // Test implementation
  });
});
```

### Integration Tests (TODO)

```bash
npm run test:e2e
```

## 📊 Swagger Documentation

Access Swagger UI at: `http://localhost:3003/api`

All endpoints are documented with:

- Request/Response schemas
- Example payloads
- Error responses

## 🐛 Common Issues

### Issue 1: Account not found in batch operation

**Solution**: Tích hợp với chart-of-accounts module để fetch account info

### Issue 2: Period locked error

**Solution**: Unlock period trước khi sửa/xóa

### Issue 3: Detail sum mismatch

**Solution**: Validate tổng chi tiết = tổng header trước khi save

## 📝 Next Steps

1. ✅ Tích hợp với Auth Service (JwtAuthGuard, TenantId, UserId decorators)
2. ✅ Tích hợp với Chart of Accounts module
3. ✅ Implement Import/Export Excel
4. ✅ Implement Generate Opening Entries (khi lock period)
5. ✅ Add caching (Redis)
6. ✅ Write unit tests & e2e tests
7. ✅ Add audit logging
8. ✅ Implement RLS (Row Level Security) policies

## 🔗 Related Modules

- Chart of Accounts (để fetch account info)
- Currency (để validate currency)
- Accounting Objects (để validate đối tượng trong details)
- Journal Entries (để sinh bút toán mở đầu)

## 📚 References

- [Module Documentation](./OPENING_BALANCE_MODULE.md)
- [Database Schema](../migrations/007_create_opening_balance_tables.sql)
- [System Design](../../saas-accounting-erp-system-design.md)
