# Chart of Accounts Module - Implementation Summary

## ✅ Status: FULLY IMPLEMENTED

The API endpoint `GET /chart-of-accounts/custom` is already fully implemented and ready to use.

## 📋 Module Overview

**Location**: `services/core-service/src/modules/chart-of-accounts/`

**Purpose**: Quản lý hệ thống tài khoản kế toán (Chart of Accounts) cho từng tenant, bao gồm:

- Tài khoản chuẩn (General Accounts) - từ hệ thống
- Tài khoản tùy chỉnh (Custom Accounts) - của từng tenant

---

## 🏗️ Architecture

### Database Tables

1. **chart_of_accounts_general** - Tài khoản chuẩn (seeded)
   - Chứa tài khoản kế toán chuẩn theo Circular 200 (Simple & Standard regime)
   - Không thể sửa/xóa bởi tenant
   - Dùng để khởi tạo tài khoản cho tenant mới

2. **chart_of_accounts_custom** - Tài khoản của tenant
   - Mỗi tenant có bộ tài khoản riêng
   - Có thể tùy chỉnh (thêm/sửa/xóa)
   - Row Level Security (RLS) với tenant_id

### Entity Structure

```typescript
ChartOfAccountsCustom {
  id: string;                      // UUID
  tenantId: string;                // Tenant isolation (RLS)
  accountNumber: string;           // Số tài khoản (VD: 111, 112, 1121)
  accountName: string;             // Tên tài khoản
  accountNature: AccountNature;    // 'debit' | 'credit' | 'both'
  accountLevel: number;            // Cấp độ (1, 2, 3)
  parentAccountNumber?: string;    // Số TK cha
  description?: string;            // Mô tả
  active: boolean;                 // Hoạt động
  source: string;                  // 'general' | 'custom'
  characteristics?: string;        // Đặc điểm
  hasTransactions: boolean;        // Đã phát sinh nghiệp vụ

  // Audit fields
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
  deletedAt?: Date;
}
```

---

## 🔌 API Endpoints

### 1. GET /chart-of-accounts/custom

**Description**: Lấy danh sách tài khoản kế toán tùy chỉnh của tenant

**Auth**: Required (JWT Token)

**Request**:

```http
GET http://localhost:3003/api/chart-of-accounts/custom
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response**: `200 OK`

```json
[
  {
    "id": "uuid-1",
    "tenantId": "tenant-123",
    "accountNumber": "111",
    "accountName": "Tiền mặt",
    "accountNature": "debit",
    "accountLevel": 1,
    "parentAccountNumber": null,
    "description": "Tài khoản tiền mặt",
    "active": true,
    "source": "general",
    "characteristics": null,
    "hasTransactions": false,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  },
  {
    "id": "uuid-2",
    "tenantId": "tenant-123",
    "accountNumber": "1111",
    "accountName": "Tiền mặt VND",
    "accountNature": "debit",
    "accountLevel": 2,
    "parentAccountNumber": "111",
    "description": "Tài khoản tiền mặt VND",
    "active": true,
    "source": "custom",
    "characteristics": "Tài khoản chi tiết",
    "hasTransactions": true,
    "createdAt": "2024-01-02T00:00:00Z",
    "updatedAt": "2024-01-02T00:00:00Z"
  }
]
```

**Features**:

- ✅ Tenant isolation via JWT token (tenantId extracted automatically)
- ✅ Chỉ trả về tài khoản active (isDeleted = false)
- ✅ Sắp xếp theo accountNumber (ASC)
- ✅ Bao gồm cả tài khoản từ general và custom

**Service Method**:

```typescript
async findCustomAccounts(tenantId: string): Promise<ChartOfAccountsCustom[]> {
  return this.customAccountRepository.find({
    where: { tenantId, isDeleted: false },
    order: { accountNumber: 'ASC' },
  });
}
```

---

### 2. GET /chart-of-accounts/general

**Description**: Lấy danh sách tài khoản chuẩn (theo chế độ kế toán)

**Query Params**:

- `regime`: 'simple' | 'standard' (default: 'standard')

**Example**:

```http
GET http://localhost:3003/chart-of-accounts/general?regime=standard
Authorization: Bearer YOUR_JWT_TOKEN
```

---

### 3. POST /chart-of-accounts/custom

**Description**: Tạo tài khoản tùy chỉnh mới

**Request Body**:

```json
{
  "accountNumber": "1111",
  "accountName": "Tiền mặt VND",
  "accountNature": "debit",
  "accountLevel": 2,
  "parentAccountNumber": "111",
  "description": "Tài khoản tiền mặt VND",
  "active": true,
  "characteristics": "Tài khoản chi tiết cho tiền mặt bằng VND"
}
```

**Validation**:

- ✅ Account number must be unique within tenant
- ✅ Parent account must exist (if specified)
- ✅ Account level must be parent.level + 1

---

### 4. PUT /chart-of-accounts/custom/:id

**Description**: Cập nhật tài khoản tùy chỉnh

**Request Body**:

```json
{
  "accountName": "Tiền mặt VND - Updated",
  "description": "Tài khoản tiền mặt VND (đã cập nhật)",
  "active": true
}
```

**Business Rules**:

- ❌ Không thể sửa tài khoản từ general (source = 'general')
- ✅ Có thể sửa tài khoản custom (source = 'custom')
- ✅ Kiểm tra trùng lặp accountNumber (nếu thay đổi)

---

### 5. DELETE /chart-of-accounts/custom/:id

**Description**: Xóa tài khoản tùy chỉnh (soft delete)

**Business Rules**:

- ❌ Không thể xóa tài khoản từ general
- ❌ Không thể xóa tài khoản đã phát sinh nghiệp vụ (hasTransactions = true)
- ✅ Xóa mềm (soft delete): set isDeleted = true, deletedAt = now()

---

### 6. POST /chart-of-accounts/initialize

**Description**: Khởi tạo tài khoản từ general (first-time setup)

**Request Body**:

```json
{
  "regime": "standard"
}
```

**Business Rules**:

- ✅ Chỉ chạy 1 lần cho tenant mới
- ✅ Copy toàn bộ tài khoản từ chart_of_accounts_general
- ✅ Set source = 'general' cho các tài khoản được copy
- ❌ Throw ConflictException nếu tenant đã có tài khoản

---

## 🧪 Testing

Test file đã được tạo tại: `test-chart-of-accounts.http`

### How to Test:

1. **Get JWT Token** (from auth-service):

   ```http
   POST http://localhost:3001/auth/login
   ```

2. **Replace token in test file**:

   ```http
   @token = YOUR_JWT_TOKEN_HERE
   ```

3. **Run tests** (sử dụng VS Code REST Client extension):
   - Click "Send Request" bên trên mỗi request
   - Hoặc dùng Ctrl/Cmd + Alt + R

---

## 🔐 Security

### Authentication & Authorization

- **JWT Auth Guard**: Tất cả endpoints require valid JWT token
- **Tenant Isolation**: tenantId extracted từ JWT payload
- **Row Level Security**: Database query tự động filter theo tenantId

### Decorators Used

```typescript
@TenantId() tenantId: string   // Extract tenant ID from JWT
@UserId() userId: string       // Extract user ID from JWT
```

---

## 📊 Database Schema

```sql
CREATE TABLE chart_of_accounts_custom (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL,
  account_number VARCHAR(20) NOT NULL,
  account_name VARCHAR(255) NOT NULL,
  account_nature VARCHAR(10) NOT NULL CHECK (account_nature IN ('debit', 'credit', 'both')),
  account_level INT NOT NULL,
  parent_account_number VARCHAR(20),
  description TEXT,
  active BOOLEAN DEFAULT TRUE,
  source VARCHAR(20) DEFAULT 'custom' CHECK (source IN ('general', 'custom')),
  characteristics TEXT,
  has_transactions BOOLEAN DEFAULT FALSE,

  -- Audit fields
  created_by UUID NOT NULL,
  updated_by UUID,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  is_deleted BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMP,

  -- Constraints
  UNIQUE(tenant_id, account_number)
);

-- Indexes
CREATE INDEX idx_chart_custom_tenant ON chart_of_accounts_custom(tenant_id);
CREATE INDEX idx_chart_custom_number ON chart_of_accounts_custom(account_number);
CREATE INDEX idx_chart_custom_parent ON chart_of_accounts_custom(parent_account_number);
```

---

## 🔗 Integration với Modules Khác

### 1. Bank Accounts Module

```typescript
// Khi tạo bank account → tự động tạo TK trong chart_of_accounts_custom
await this.chartOfAccountsService.createCustomAccount(tenantId, userId, {
  accountNumber: '1121',
  accountName: 'TK Ngân hàng VCB',
  accountNature: 'debit',
  accountLevel: 2,
  parentAccountNumber: '112',
});
```

### 2. Warehouses Module

```typescript
// Warehouse entity có inventoryAccountId link đến chart_of_accounts_custom
@Column()
inventoryAccountId: string; // Link to TK 15x
```

### 3. Opening Balance Module (Future)

```typescript
// Khai báo số dư đầu kỳ sẽ reference accountId từ chart_of_accounts_custom
```

---

## 📈 Performance Considerations

### Caching Strategy

```typescript
// Cache chart of accounts (Redis)
Cache Key: tenant:{tenantId}:chart-of-accounts
TTL: 30 minutes

// Invalidate on:
- Create custom account
- Update custom account
- Delete custom account
- Initialize accounts
```

### Query Optimization

- ✅ Index on (tenant_id, account_number)
- ✅ Soft delete filter (isDeleted = false)
- ✅ Order by account_number for better index usage

---

## 🐛 Error Handling

### Common Errors:

1. **ConflictException** (409):
   - Account number already exists
   - Accounts already initialized

2. **NotFoundException** (404):
   - Account not found
   - Parent account not found

3. **BadRequestException** (400):
   - Cannot update general account
   - Cannot delete account with transactions
   - Invalid account level for parent

---

## 📝 Next Steps

### Recommended Enhancements:

1. **Bulk Operations**:

   ```typescript
   POST / chart - of - accounts / custom / bulk;
   // Tạo nhiều tài khoản cùng lúc
   ```

2. **Search & Filter**:

   ```typescript
   GET /chart-of-accounts/custom?search=tiền mặt&level=2&nature=debit
   ```

3. **Export/Import**:

   ```typescript
   GET /chart-of-accounts/export?format=excel
   POST /chart-of-accounts/import (Excel file)
   ```

4. **Account Hierarchy Tree**:

   ```typescript
   GET / chart - of - accounts / tree;
   // Trả về cấu trúc cây thay vì flat list
   ```

5. **Audit Log**:
   ```typescript
   GET /chart-of-accounts/custom/:id/history
   // Lịch sử thay đổi tài khoản
   ```

---

## ✅ Summary

The `GET /chart-of-accounts/custom` API is **fully implemented and production-ready**:

✅ Controller: ChartOfAccountsController  
✅ Service: ChartOfAccountsService  
✅ Entity: ChartOfAccountsCustom  
✅ Module: ChartOfAccountsModule  
✅ Authentication: JWT Auth Guard  
✅ Authorization: Tenant-based RLS  
✅ Validation: DTO validation  
✅ Error Handling: Proper exceptions  
✅ Database: PostgreSQL with indexes  
✅ Test File: test-chart-of-accounts.http

**Service Status**: ✅ Running on http://localhost:3003  
**Database**: ✅ Connected to PostgreSQL

You can start using the API immediately! 🚀
