# MODULE OPENING BALANCE DECLARATION - Khai báo số dư đầu kỳ

## 📋 Tổng Quan

Module **Opening Balance Declaration** (Khai báo số dư đầu kỳ) cho phép doanh nghiệp khai báo số dư ban đầu của các tài khoản kế toán khi bắt đầu sử dụng hệ thống Symper One. Đây là module quan trọng để đảm bảo tính liên tục của dữ liệu kế toán và là cơ sở cho việc tạo các báo cáo tài chính.

## 🎯 Mục Tiêu Nghiệp Vụ

1. **Khai báo số dư ban đầu** theo tài khoản kế toán
2. **Hỗ trợ nhập linh hoạt**: Nhập tổng số dư hoặc chi tiết cấu thành
3. **Đa chiều phân tích**: Hỗ trợ 10+ chiều phân tích nghiệp vụ
4. **Đảm bảo tính chính xác**: Validation nghiêm ngặt, không cho phép sai sót
5. **Tích hợp hệ thống**: Tự động sinh bút toán mở đầu khi chốt kỳ

## 🏗️ Kiến Trúc Database

### Schema Overview

```
opening_period (Kỳ khởi tạo)
    ↓ 1:N
opening_balance (Số dư tài khoản)
    ↓ 1:N
opening_balance_detail (Chi tiết số dư)
```

### 1. Table: `opening_period` (Kỳ khởi tạo)

Quản lý các kỳ khởi tạo số dư. Một tenant có thể có nhiều kỳ khởi tạo (cho phép reset hệ thống).

**Columns:**

- `id` (UUID): Primary key
- `tenant_id` (UUID): Tenant identifier - RLS
- `period_name` (VARCHAR 255): Tên kỳ (VD: "Kỳ đầu năm 2024")
- `opening_date` (DATE): Ngày khởi tạo số dư
- `description` (TEXT): Mô tả kỳ khởi tạo
- `is_locked` (BOOLEAN): Trạng thái chốt kỳ
- `locked_at` (TIMESTAMP): Thời gian chốt
- `locked_by` (UUID): User thực hiện chốt
- `created_at`, `created_by`, `updated_at`, `updated_by`: Audit fields

**Constraints:**

- UNIQUE(tenant_id, period_name)

**Indexes:**

- `idx_opening_period_tenant` (tenant_id)
- `idx_opening_period_date` (tenant_id, opening_date)
- `idx_opening_period_locked` (tenant_id, is_locked)

### 2. Table: `opening_balance` (Số dư tài khoản)

Lưu số dư ban đầu của mỗi tài khoản kế toán.

**Columns:**

- `id` (UUID): Primary key
- `tenant_id` (UUID): Tenant identifier - RLS
- `period_id` (UUID): FK to opening_period
- `currency_id` (UUID): Loại tiền (VND, USD, ...)
- `account_id` (UUID): FK to chart_of_accounts
- `account_number` (VARCHAR 50): Số tài khoản (cached)
- `account_name` (VARCHAR 255): Tên tài khoản (cached)
- `debit_balance` (DECIMAL 19,4): Dư Nợ (≥ 0)
- `credit_balance` (DECIMAL 19,4): Dư Có (≥ 0)
- `has_details` (BOOLEAN): Có chi tiết hay không
- `note` (TEXT): Ghi chú
- `created_at`, `created_by`, `updated_at`, `updated_by`: Audit fields

**Constraints:**

- UNIQUE(tenant_id, period_id, account_id, currency_id)
- CHECK(debit_balance >= 0)
- CHECK(credit_balance >= 0)
- CHECK(NOT (debit_balance > 0 AND credit_balance > 0)) - Không cho dư nợ và dư có cùng lúc

**Indexes:**

- `idx_opening_balance_tenant` (tenant_id)
- `idx_opening_balance_period` (period_id)
- `idx_opening_balance_account` (account_id)
- `idx_opening_balance_currency` (currency_id)
- `idx_opening_balance_has_details` (tenant_id, has_details)
- `idx_opening_balance_account_number` (tenant_id, account_number)

### 3. Table: `opening_balance_detail` (Chi tiết số dư)

Chi tiết cấu thành số dư theo các chiều phân tích nghiệp vụ.

**Columns:**

- `id` (UUID): Primary key
- `tenant_id` (UUID): Tenant identifier - RLS
- `balance_id` (UUID): FK to opening_balance

**Các chiều phân tích (tất cả optional):**

- `department_id` (UUID): Đơn vị
- `cost_item_id` (UUID): Khoản mục chi phí
- `cost_object_id` (UUID): Đối tượng tổng hợp chi phí
- `project_id` (UUID): Công trình
- `sales_order_id` (UUID): Đơn đặt hàng
- `purchase_order_id` (UUID): Đơn mua hàng
- `sales_contract_id` (UUID): Hợp đồng bán
- `purchase_contract_id` (UUID): Hợp đồng mua
- `statistical_code_id` (UUID): Mã thống kê
- `account_object_id` (UUID): Đối tượng (KH, NCC, NV)

**Giá trị:**

- `debit_balance` (DECIMAL 19,4): Dư Nợ chi tiết (≥ 0)
- `credit_balance` (DECIMAL 19,4): Dư Có chi tiết (≥ 0)
- `description` (TEXT): Diễn giải
- `created_at`, `created_by`, `updated_at`, `updated_by`: Audit fields

**Constraints:**

- CHECK(debit_balance >= 0)
- CHECK(credit_balance >= 0)
- CHECK(NOT (debit_balance > 0 AND credit_balance > 0))
- CHECK(at least one dimension IS NOT NULL)

**Indexes:**

- Partial indexes on each dimension field (WHERE field IS NOT NULL)

## 🔐 Row Level Security (RLS)

Tất cả 3 bảng đều enable RLS để đảm bảo tenant isolation:

```sql
ALTER TABLE opening_period ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_policy_opening_period ON opening_period
    USING (tenant_id = current_setting('app.current_tenant')::UUID);
```

## 🔄 Database Triggers & Functions

### 1. Trigger: `validate_opening_balance_before_lock`

**Mục đích**: Validate tổng chi tiết = tổng header trước khi chốt kỳ

**Logic:**

- Chỉ chạy khi `is_locked` chuyển từ `false` → `true`
- Kiểm tra tất cả các opening_balance có `has_details = true`
- Đảm bảo: `SUM(details.debit_balance) = balance.debit_balance`
- Đảm bảo: `SUM(details.credit_balance) = balance.credit_balance`
- Raise exception nếu có sai lệch > 0.01

### 2. Trigger: `prevent_update_when_locked`

**Mục đích**: Không cho phép sửa/xóa khi kỳ đã chốt

**Logic:**

- Kiểm tra `is_locked` của period
- Raise exception nếu locked = true
- Áp dụng cho cả `opening_balance` và `opening_balance_detail`

### 3. Function: `generate_opening_entries(period_id)`

**Mục đích**: Sinh bút toán mở đầu khi chốt kỳ

**Logic:**

- Tạo journal_entry với entry_type = 'opening_balance'
- Tạo journal_entry_lines từ opening_balance
- Transaction date = opening_date
- Auto post to ledger

**Returns:**

```sql
TABLE (
    journal_entry_id UUID,
    lines_created INTEGER
)
```

### 4. Function: `validate_opening_balance_consistency(period_id)`

**Mục đích**: Kiểm tra tính nhất quán của dữ liệu

**Returns:**

```sql
TABLE (
    account_number VARCHAR,
    account_name VARCHAR,
    error_type VARCHAR, -- DEBIT_MISMATCH, CREDIT_MISMATCH, BOTH_DEBIT_CREDIT, MISSING_DETAILS
    expected_debit DECIMAL,
    actual_debit DECIMAL,
    expected_credit DECIMAL,
    actual_credit DECIMAL,
    difference DECIMAL
)
```

## 🌐 API Endpoints

### Opening Period Management

```
GET    /opening-balance/periods              # Danh sách các kỳ khởi tạo
POST   /opening-balance/periods              # Tạo kỳ khởi tạo mới
GET    /opening-balance/periods/:periodId    # Chi tiết kỳ
DELETE /opening-balance/periods/:periodId    # Xóa kỳ (nếu chưa lock)
POST   /opening-balance/periods/:periodId/lock    # Chốt kỳ
POST   /opening-balance/periods/:periodId/unlock  # Mở chốt (admin only)
```

### Opening Balance Management

```
GET    /opening-balance                      # Danh sách số dư
POST   /opening-balance                      # Tạo/cập nhật số dư đơn lẻ
POST   /opening-balance/batch                # Tạo/cập nhật nhiều số dư cùng lúc ✅
GET    /opening-balance/:id                  # Chi tiết số dư
PUT    /opening-balance/:id                  # Cập nhật số dư
DELETE /opening-balance/:id                  # Xóa số dư
POST   /opening-balance/import               # Import từ Excel
GET    /opening-balance/export               # Export to Excel
```

### Opening Balance Details

```
GET    /opening-balance/:balanceId/details   # Danh sách chi tiết
POST   /opening-balance/:balanceId/details   # Tạo chi tiết đơn lẻ
POST   /opening-balance/:balanceId/details/batch # Tạo/cập nhật nhiều chi tiết cùng lúc ✅
PUT    /opening-balance/:balanceId/details/:id  # Cập nhật chi tiết
DELETE /opening-balance/:balanceId/details/:id  # Xóa chi tiết
```

### Validation & Reports

```
POST   /opening-balance/validate             # Kiểm tra tính hợp lệ
GET    /opening-balance/summary              # Tổng hợp số dư (trial balance)
POST   /opening-balance/generate-entries     # Sinh bút toán mở đầu
```

## 📊 Query Params

### GET /opening-balance

```
?periodId=xxx           # Required - Lọc theo kỳ khởi tạo
?currencyId=xxx         # Optional - Lọc theo loại tiền
?accountNumber=xxx      # Optional - Tìm theo số tài khoản
?hasDetails=true|false  # Optional - Lọc TK có/không có chi tiết
?page=1&limit=50        # Optional - Phân trang
```

## 📝 Business Rules

### 1. Quy tắc kỳ khởi tạo

- ✅ Một tenant có thể có nhiều kỳ khởi tạo (reset system)
- ✅ Mỗi kỳ chỉ có 1 opening date
- ❌ Khi lock: không được sửa/xóa số dư
- ⚠️ Chỉ admin mới unlock được

### 2. Quy tắc số dư tài khoản

- ✅ Mỗi tài khoản chỉ có 1 số dư trong 1 kỳ (unique: periodId + accountId + currencyId)
- ✅ Dư Nợ >= 0, Dư Có >= 0
- ❌ Dư Nợ > 0 và Dư Có > 0 cùng lúc: KHÔNG cho phép
- ⚠️ Nếu hasDetails = true: Bắt buộc có ít nhất 1 detail
- ✅ Nếu hasDetails = false: Không có details, chỉ nhập tổng

### 3. Quy tắc chi tiết số dư

- ✅ Sum(details.debitBalance) = balance.debitBalance
- ✅ Sum(details.creditBalance) = balance.creditBalance
- ⚠️ Validate trước khi lock kỳ
- ✅ Mỗi detail phải có ít nhất 1 chiều phân tích

### 4. Quy tắc phân quyền

**Permissions:**

- `OPENING_BALANCE_VIEW`: Xem số dư
- `OPENING_BALANCE_CREATE`: Tạo/nhập số dư
- `OPENING_BALANCE_EDIT`: Sửa số dư
- `OPENING_BALANCE_DELETE`: Xóa số dư
- `OPENING_BALANCE_LOCK`: Chốt kỳ
- `OPENING_BALANCE_ADMIN`: Mở chốt kỳ (admin only)

### 5. Quy tắc validation

- ❌ debitBalance < 0 hoặc creditBalance < 0
- ❌ debitBalance > 0 VÀ creditBalance > 0 cùng lúc
- ✅ Số dư chi tiết phải cân bằng với tổng
- ❌ Opening date không được sau ngày hiện tại
- ✅ Tài khoản phải tồn tại và active

## 🔗 Tích Hợp Hệ Thống

### 1. Khi lock kỳ (POST /periods/:id/lock)

```typescript
// Flow
1. Validate all opening balances (sum details = header)
2. Call generate_opening_entries(periodId)
3. Create journal_entries with entry_type = 'opening_balance'
4. Auto post to general ledger
5. Set is_locked = true, locked_at = now(), locked_by = current_user
6. Publish event: opening_balance.locked
```

### 2. Báo cáo sử dụng Opening Balance

**Sổ cái (General Ledger):**

- Opening balance là dòng đầu tiên của mỗi tài khoản
- Tính: Beginning Balance + Transactions = Ending Balance

**Bảng cân đối kế toán (Balance Sheet):**

- Assets = Opening Balances (debit) + Period Movements
- Liabilities + Equity = Opening Balances (credit) + Period Movements

**Báo cáo kết quả kinh doanh (Income Statement):**

- Revenue/Expense accounts: Opening balance = 0 (nếu start of year)
- Hoặc có opening balance nếu mid-year

### 3. Link với các bảng khác

```typescript
opening_balance.account_id -> chart_of_accounts.id
opening_balance_detail.account_object_id -> object.id
opening_balance_detail.department_id -> department.id (future)
opening_balance_detail.project_id -> project.id (future)
```

## 💾 Caching Strategy

```typescript
Cache Keys:
- tenant:{tenantId}:opening-balance:periods          // List of periods
- tenant:{tenantId}:opening-balance:{periodId}       // Period detail
- tenant:{tenantId}:opening-balance:{periodId}:list  // List of balances

TTL:
- Periods list: 1 hour
- Period detail: 1 hour
- Balances list: 30 minutes

Invalidation:
- On create/update/delete: Clear all related caches
- On lock: Clear period cache
```

## 🎯 Background Jobs

```typescript
Jobs:
1. validate-opening-balance        // Tự động validate trước khi lock
2. generate-opening-entries        // Sinh bút toán mở đầu khi lock
3. export-opening-balance          // Export Excel async (cho data lớn)
4. sync-opening-balance-report     // Đồng bộ báo cáo
```

## 📋 Data Model (TypeScript/NestJS)

### DTO Examples

```typescript
// CreateOpeningPeriodDto
export class CreateOpeningPeriodDto {
  @IsNotEmpty()
  @IsString()
  periodName: string;

  @IsNotEmpty()
  @IsDateString()
  openingDate: Date;

  @IsOptional()
  @IsString()
  description?: string;
}

// CreateOpeningBalanceDto (Single)
export class CreateOpeningBalanceDto {
  @IsNotEmpty()
  @IsUUID()
  periodId: string;

  @IsNotEmpty()
  @IsUUID()
  currencyId: string;

  @IsNotEmpty()
  @IsUUID()
  accountId: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  debitBalance: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  creditBalance: number;

  @IsBoolean()
  hasDetails: boolean = false;

  @IsOptional()
  @IsString()
  note?: string;

  @ValidateIf((o) => o.debitBalance > 0)
  @IsTrue({ message: 'Credit balance must be 0 when debit balance > 0' })
  creditBalanceIsZero: boolean;
}

// BatchCreateOpeningBalanceDto (NEW)
export class BatchOpeningBalanceItemDto {
  @IsNotEmpty()
  @IsUUID()
  accountId: string;

  @IsOptional()
  @IsString()
  accountNumber?: string;

  @IsOptional()
  @IsString()
  accountName?: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  debitBalance: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  creditBalance: number;

  @IsOptional()
  @IsBoolean()
  hasDetails?: boolean = false;

  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOpeningBalanceDetailDto)
  details?: CreateOpeningBalanceDetailDto[];

  // Validation: Not both debit and credit at the same time
  @ValidateIf((o) => o.debitBalance > 0)
  @Equals(0, { message: 'Credit balance must be 0 when debit balance > 0' })
  get creditBalanceCheck() {
    return this.debitBalance > 0 ? this.creditBalance : 0;
  }
}

export class BatchCreateOpeningBalanceDto {
  @IsNotEmpty()
  @IsUUID()
  periodId: string;

  @IsNotEmpty()
  @IsUUID()
  currencyId: string;

  @IsOptional()
  @IsEnum(['fail-fast', 'continue-on-error'])
  mode?: 'fail-fast' | 'continue-on-error' = 'fail-fast';

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BatchOpeningBalanceItemDto)
  @ArrayMinSize(1)
  @ArrayMaxSize(100, { message: 'Maximum 100 records per batch' })
  balances: BatchOpeningBalanceItemDto[];
}

// BatchCreateOpeningBalanceResponseDto
export class BatchResultItemDto {
  @IsString()
  accountNumber: string;

  @IsString()
  accountName: string;

  @IsEnum(['created', 'updated', 'failed'])
  status: 'created' | 'updated' | 'failed';

  @IsOptional()
  @IsUUID()
  balanceId?: string;

  @IsOptional()
  @IsString()
  error?: string;
}

export class BatchCreateOpeningBalanceResponseDto {
  @IsBoolean()
  success: boolean;

  @IsNumber()
  created: number;

  @IsNumber()
  updated: number;

  @IsNumber()
  failed: number;

  @IsNumber()
  total: number;

  @IsArray()
  results: BatchResultItemDto[];

  @IsOptional()
  @IsArray()
  errors?: Array<{
    field: string;
    message: string;
    accountNumber?: string;
  }>;
}

// CreateOpeningBalanceDetailDto
export class CreateOpeningBalanceDetailDto {
  @IsNotEmpty()
  @IsUUID()
  balanceId: string;

  // At least one dimension required
  @IsOptional()
  @IsUUID()
  departmentId?: string;

  @IsOptional()
  @IsUUID()
  accountObjectId?: string;

  // ... other dimensions

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  debitBalance: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  creditBalance: number;

  @IsOptional()
  @IsString()
  description?: string;
}

// BatchCreateOpeningBalanceDetailsDto
export class BatchCreateOpeningBalanceDetailsDto {
  @IsNotEmpty()
  @IsUUID()
  balanceId: string;

  @IsOptional()
  @IsEnum(['fail-fast', 'continue-on-error'])
  mode?: 'fail-fast' | 'continue-on-error' = 'fail-fast';

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOpeningBalanceDetailDto)
  @ArrayMinSize(1)
  @ArrayMaxSize(200, { message: 'Maximum 200 detail records per batch' })
  details: Omit<CreateOpeningBalanceDetailDto, 'balanceId'>[];
}
```

### Service Implementation Example

```typescript
// opening-balance.service.ts
@Injectable()
export class OpeningBalanceService {
  constructor(
    @InjectRepository(OpeningBalance)
    private openingBalanceRepo: Repository<OpeningBalance>,
    @InjectRepository(OpeningBalanceDetail)
    private detailRepo: Repository<OpeningBalanceDetail>,
    @InjectRepository(ChartOfAccounts)
    private accountRepo: Repository<ChartOfAccounts>,
    private dataSource: DataSource,
  ) {}

  async batchCreateOrUpdate(
    tenantId: string,
    userId: string,
    dto: BatchCreateOpeningBalanceDto,
  ): Promise<BatchCreateOpeningBalanceResponseDto> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const results: BatchResultItemDto[] = [];
    let created = 0,
      updated = 0,
      failed = 0;
    const errors: any[] = [];

    try {
      // 1. Validate period exists and not locked
      const period = await queryRunner.manager.findOne(OpeningPeriod, {
        where: { id: dto.periodId, tenantId, isLocked: false },
      });

      if (!period) {
        throw new BadRequestException('Period not found or locked');
      }

      // 2. Fetch all accounts to validate and get names
      const accountIds = dto.balances.map((b) => b.accountId);
      const accounts = await queryRunner.manager.find(ChartOfAccounts, {
        where: { id: In(accountIds), tenantId },
      });

      const accountMap = new Map(accounts.map((a) => [a.id, a]));

      // 3. Process each balance
      for (const item of dto.balances) {
        try {
          const account = accountMap.get(item.accountId);

          if (!account) {
            throw new Error(`Account ${item.accountId} not found`);
          }

          // Validate debit/credit rules
          if (item.debitBalance > 0 && item.creditBalance > 0) {
            throw new Error('Cannot have both debit and credit balance');
          }

          // Check if exists
          let balance = await queryRunner.manager.findOne(OpeningBalance, {
            where: {
              tenantId,
              periodId: dto.periodId,
              accountId: item.accountId,
              currencyId: dto.currencyId,
            },
          });

          if (balance) {
            // Update existing
            balance.debitBalance = item.debitBalance;
            balance.creditBalance = item.creditBalance;
            balance.hasDetails = item.hasDetails || false;
            balance.note = item.note;
            balance.updatedBy = userId;
            balance.updatedAt = new Date();

            await queryRunner.manager.save(balance);

            results.push({
              accountNumber: account.accountNumber,
              accountName: account.accountName,
              status: 'updated',
              balanceId: balance.id,
            });
            updated++;
          } else {
            // Create new
            balance = queryRunner.manager.create(OpeningBalance, {
              tenantId,
              periodId: dto.periodId,
              currencyId: dto.currencyId,
              accountId: item.accountId,
              accountNumber: account.accountNumber,
              accountName: account.accountName,
              debitBalance: item.debitBalance,
              creditBalance: item.creditBalance,
              hasDetails: item.hasDetails || false,
              note: item.note,
              createdBy: userId,
            });

            await queryRunner.manager.save(balance);

            results.push({
              accountNumber: account.accountNumber,
              accountName: account.accountName,
              status: 'created',
              balanceId: balance.id,
            });
            created++;
          }

          // 4. Process details if provided
          if (item.details && item.details.length > 0) {
            // Delete existing details
            await queryRunner.manager.delete(OpeningBalanceDetail, {
              balanceId: balance.id,
            });

            // Create new details
            const details = item.details.map((d) =>
              queryRunner.manager.create(OpeningBalanceDetail, {
                ...d,
                tenantId,
                balanceId: balance.id,
                createdBy: userId,
              }),
            );

            await queryRunner.manager.save(details);

            // Validate sum
            const sumDebit = details.reduce((sum, d) => sum + Number(d.debitBalance), 0);
            const sumCredit = details.reduce((sum, d) => sum + Number(d.creditBalance), 0);

            if (
              Math.abs(sumDebit - balance.debitBalance) > 0.01 ||
              Math.abs(sumCredit - balance.creditBalance) > 0.01
            ) {
              throw new Error('Detail sum does not match balance total');
            }
          }
        } catch (error) {
          failed++;
          results.push({
            accountNumber: item.accountNumber || 'unknown',
            accountName: item.accountName || 'unknown',
            status: 'failed',
            error: error.message,
          });
          errors.push({
            field: 'balances',
            message: error.message,
            accountNumber: item.accountNumber,
          });

          if (dto.mode === 'fail-fast') {
            throw error; // Will trigger rollback
          }
        }
      }

      // 5. Commit transaction
      if (dto.mode === 'fail-fast' || failed === 0) {
        await queryRunner.commitTransaction();
      } else {
        // In continue-on-error mode, still commit successful ones
        await queryRunner.commitTransaction();
      }

      return {
        success: failed === 0,
        created,
        updated,
        failed,
        total: dto.balances.length,
        results,
        errors: errors.length > 0 ? errors : undefined,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
```

### Controller Implementation Example

```typescript
// opening-balance.controller.ts
@Controller('opening-balance')
@UseGuards(JwtAuthGuard, TenantGuard)
export class OpeningBalanceController {
  constructor(private readonly service: OpeningBalanceService) {}

  @Post('batch')
  @RequirePermissions('OPENING_BALANCE_CREATE', 'OPENING_BALANCE_EDIT')
  @ApiOperation({ summary: 'Batch create/update opening balances' })
  @ApiResponse({
    status: 200,
    description: 'Batch operation completed',
    type: BatchCreateOpeningBalanceResponseDto,
  })
  async batchCreateOrUpdate(
    @TenantId() tenantId: string,
    @UserId() userId: string,
    @Body() dto: BatchCreateOpeningBalanceDto,
  ): Promise<BatchCreateOpeningBalanceResponseDto> {
    return this.service.batchCreateOrUpdate(tenantId, userId, dto);
  }
}
```

## ✅ Testing Checklist

### Unit Tests

- [ ] Validate debit/credit balance constraints
- [ ] Validate sum of details equals header
- [ ] Prevent update when period is locked
- [ ] Generate opening entries correctly

### Integration Tests

- [ ] Create opening period
- [ ] Create opening balance
- [ ] Create opening balance details
- [ ] Lock period (success case)
- [ ] Lock period (validation failure)
- [ ] Unlock period (admin only)
- [ ] Query with filters and pagination

### E2E Tests

- [ ] Complete flow: Create period → Add balances → Add details → Lock
- [ ] Import from Excel
- [ ] Export to Excel
- [ ] Generate journal entries
- [ ] Validation errors display correctly

## 📚 Implementation Guide

### Phase 1: Database Setup ✅

1. Run migration: `007_create_opening_balance_tables.sql`
2. Verify tables created
3. Test RLS policies
4. Test triggers and functions

### Phase 2: Backend Module

```bash
# Create NestJS module
cd services/core-service/src
nest g module opening-balance
nest g service opening-balance
nest g controller opening-balance
```

### Phase 3: Frontend Module

```bash
# Create React components
cd web-app/src/pages
mkdir opening-balance
# Components:
# - OpeningPeriodList
# - OpeningBalanceForm
# - OpeningBalanceDetailForm
# - ValidationResults
```

### Phase 4: Testing & QA

- Unit tests
- Integration tests
- E2E tests
- User acceptance testing

## 🚀 Quick Start

### 1. Run Migration

```bash
cd services/core-service
npm run migration:run -- 007_create_opening_balance_tables.sql
```

### 2. Test Database Functions

```sql
-- Create test period
INSERT INTO opening_period (tenant_id, period_name, opening_date, created_by)
VALUES ('test-tenant-id', 'Test Period 2024', '2024-01-01', 'test-user-id');

-- Create test balance
INSERT INTO opening_balance (
  tenant_id, period_id, currency_id, account_id,
  account_number, account_name, debit_balance, created_by
)
VALUES (
  'test-tenant-id', 'period-id', 'VND', 'account-id',
  '111', 'Tiền mặt', 10000000, 'test-user-id'
);

-- Validate
SELECT * FROM validate_opening_balance_consistency('period-id');

-- Lock period
UPDATE opening_period SET is_locked = true WHERE id = 'period-id';
```

## 📖 References

- [Vietnamese Accounting Standards (VAS)](https://www.mof.gov.vn/)
- [Chart of Accounts Documentation](./chart-of-accounts-guide.md)
- [Database Design](./core-service-db-design.md)
- [API Documentation](./API_SPECIFICATIONS.md)

---

**Module Status**: ✅ Design Complete | 🚧 Implementation In Progress

**Last Updated**: 2026-01-04

**Maintainer**: Core Service Team
