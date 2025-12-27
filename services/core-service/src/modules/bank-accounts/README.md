# Bank Accounts Module

Module quản lý tài khoản ngân hàng trong hệ thống ERP.

## 📋 Mô tả

Module này cung cấp các chức năng quản lý tài khoản ngân hàng của doanh nghiệp, bao gồm:
- Tạo, sửa, xóa tài khoản ngân hàng
- Tự động tạo tài khoản kế toán tương ứng trong hệ thống tài khoản (112x)
- Theo dõi số dư tài khoản
- Sao kê giao dịch
- Đối soát ngân hàng

## 🏗️ Kiến trúc

### Entities

#### BankAccount
```typescript
{
  id: string;
  tenantId: string;
  bankName: string;          // Tên ngân hàng
  accountNumber: string;     // Số tài khoản
  initialBalance: number;    // Số dư ban đầu
  accountId: string;         // Link tới chart_of_accounts_custom
  isActive: boolean;         // Trạng thái hoạt động
  description?: string;      // Mô tả
}
```

### DTOs

#### CreateBankAccountDto
- `bankName`: Tên ngân hàng (required)
- `accountNumber`: Số tài khoản (required)
- `initialBalance`: Số dư ban đầu (required, default: 0)
- `description`: Mô tả (optional)
- `isActive`: Trạng thái hoạt động (optional, default: true)

#### UpdateBankAccountDto
- Tất cả các trường đều optional
- **Note**: Không cho phép thay đổi `accountNumber` sau khi tạo

## 🔌 API Endpoints

### 1. Lấy danh sách tài khoản ngân hàng
```http
GET /bank-accounts
Query Parameters:
  - page: number (default: 1)
  - limit: number (default: 20)
  - search: string (tìm kiếm theo tên ngân hàng, số tài khoản)
  - isActive: boolean (lọc theo trạng thái)
  - sortBy: string
  - sortOrder: 'ASC' | 'DESC'
```

### 2. Lấy chi tiết tài khoản ngân hàng
```http
GET /bank-accounts/:id
```

### 3. Tạo tài khoản ngân hàng mới
```http
POST /bank-accounts
Body: CreateBankAccountDto
```

**Business Logic:**
- Kiểm tra số tài khoản chưa tồn tại
- Tự động tạo tài khoản kế toán trong `chart_of_accounts_custom`
  - Số tài khoản: 112x (1121, 1122, ..., 1129)
  - Tên: "TK {bankName} - {accountNumber}"
  - Parent: 112 (Tiền gửi ngân hàng)
  - Nature: DEBIT
- Link `accountId` từ `bank_account` → `chart_of_accounts_custom`

### 4. Cập nhật tài khoản ngân hàng
```http
PUT /bank-accounts/:id
Body: UpdateBankAccountDto
```

**Lưu ý:**
- Không được thay đổi `accountNumber`
- Có thể cập nhật: `bankName`, `description`, `isActive`

### 5. Xóa tài khoản ngân hàng
```http
DELETE /bank-accounts/:id
```

**Business Logic:**
- Soft delete (set `isDeleted = true`)
- TODO: Kiểm tra chưa phát sinh nghiệp vụ trước khi xóa

### 6. Lấy số dư hiện tại
```http
GET /bank-accounts/:id/balance
Response: { balance: number }
```

**Công thức:**
```
Số dư hiện tại = initialBalance + sum(transactions)
```

### 7. Sao kê giao dịch
```http
GET /bank-accounts/:id/transactions
Query Parameters: PaginationDto
```

**TODO:** Implement khi có module bank transactions

### 8. Đối soát tài khoản
```http
POST /bank-accounts/:id/reconcile
Body: {
  statementBalance: number,
  statementDate: Date
}
Response: {
  bankBalance: number,    // Số dư trên sao kê ngân hàng
  bookBalance: number,    // Số dư sổ sách
  difference: number      // Chênh lệch
}
```

## 🔐 Authentication & Authorization

- **Guard**: `JwtAuthGuard`
- **Required**: JWT token với `tenantId` và `userId`
- **Tenant Isolation**: Tất cả queries tự động filter theo `tenantId`

## 📊 Database

### Migration
File: `006_create_bank_account_table.sql`

### Indexes
- `idx_bank_account_tenant_id`
- `idx_bank_account_account_id`
- `idx_bank_account_is_active`
- `idx_bank_account_is_deleted`

### Constraints
- `uk_bank_account_number`: Unique (tenant_id, account_number, is_deleted)

## 🔄 Integration

### Dependencies
- **ChartOfAccountsModule**: Tạo tài khoản kế toán tự động

### Events (Future)
Module này sẽ publish các events:
- `bank_account.created`
- `bank_account.updated`
- `bank_account.deleted`

## 📝 TODO

### Phase 1 (Completed)
- [x] Entity, DTOs, Controller, Service
- [x] CRUD operations
- [x] Tự động tạo chart of accounts
- [x] Pagination, search, filter
- [x] Migration script

### Phase 2 (Future)
- [ ] Bank transactions module
- [ ] Tính số dư thực tế từ transactions
- [ ] Đối soát với sao kê ngân hàng
- [ ] Validate không xóa khi đã phát sinh nghiệp vụ
- [ ] Export/Import bank statements
- [ ] Bank reconciliation report

### Phase 3 (Advanced)
- [ ] Integration với ngân hàng qua API (Open Banking)
- [ ] Tự động import transactions
- [ ] AI matching transactions
- [ ] Multi-currency support

## 🧪 Testing

```bash
# Unit tests
npm run test bank-accounts

# E2E tests
npm run test:e2e bank-accounts
```

## 📖 Examples

### Tạo tài khoản ngân hàng
```typescript
POST /bank-accounts
{
  "bankName": "Vietcombank",
  "accountNumber": "1234567890",
  "initialBalance": 100000000,
  "description": "Tài khoản chính"
}
```

**Kết quả:**
- Tạo record trong `bank_account`
- Tự động tạo account `1121` trong `chart_of_accounts_custom`
  - accountName: "TK Vietcombank - 1234567890"
  - accountNature: DEBIT
  - parentAccountNumber: "112"

### Lấy danh sách
```typescript
GET /bank-accounts?page=1&limit=10&search=Vietcombank&isActive=true
```

## 🔗 Related Modules
- **ChartOfAccountsModule**: Hệ thống tài khoản kế toán
- **SalesModule**: Phiếu thu từ bán hàng
- **InventoryModule**: Phiếu chi mua hàng
- **AccountingModule** (future): Bút toán kế toán

## 👥 Contributors
- Core Service Team
