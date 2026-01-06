# Initial Balance Integration Guide

## Tổng quan

Màn hình khai báo số dư ban đầu được chia thành 3 bước:
1. **Step 1**: Tiền mặt và tiền gửi ngân hàng
2. **Step 2**: Phải thu khách hàng (Customer Receivables)
3. **Step 3**: Phải trả nhà cung cấp (Supplier Payables)

## API Endpoints

### Opening Balance Module
Base URL: `/api/opening-balance`

#### 1. Period Management
- `POST /periods` - Tạo kỳ khởi tạo mới
- `GET /periods` - Lấy danh sách kỳ
- `GET /periods/:id` - Chi tiết kỳ
- `PUT /periods/:id` - Cập nhật kỳ
- `DELETE /periods/:id` - Xóa kỳ
- `POST /periods/:id/lock` - Chốt kỳ

#### 2. Balance Management
- `POST /` - Tạo số dư đơn lẻ
- `POST /batch` - Tạo nhiều số dư cùng lúc
- `GET /` - Lấy danh sách số dư
- `GET /:id` - Chi tiết số dư
- `PUT /:id` - Cập nhật số dư
- `DELETE /:id` - Xóa số dư

#### 3. Balance Details (Chi tiết theo đối tượng)
- `GET /:balanceId/details` - Lấy chi tiết
- `POST /:balanceId/details` - Tạo chi tiết
- `POST /:balanceId/details/batch` - Tạo nhiều chi tiết

## Chart of Accounts Mapping

### Step 1: Cash & Bank
| UI Field | Account Code | Account Name | API Field |
|----------|--------------|--------------|-----------|
| Tiền mặt | 1111 | Tiền Việt Nam | debitBalance |
| Tiền gửi ngân hàng | 1121 | Tiền Việt Nam | debitBalance |

### Step 2: Customer Receivables
| UI Field | Account Code | Account Name | API Field |
|----------|--------------|--------------|-----------|
| Phải thu khách hàng | 131 | Phải thu của khách hàng | debitBalance |

Chi tiết: Sử dụng `opening_balance_detail` với `accountingObjectId` là customer ID

### Step 3: Supplier Payables  
| UI Field | Account Code | Account Name | API Field |
|----------|--------------|--------------|-----------|
| Phải trả nhà cung cấp | 331 | Phải trả cho người bán | creditBalance |

Chi tiết: Sử dụng `opening_balance_detail` với `accountingObjectId` là supplier ID

## Integration Flow

### 1. Khởi tạo Period (Lần đầu)
```typescript
// Khi user bắt đầu khai báo lần đầu
const period = await api.createOpeningPeriod({
  periodName: "Số dư đầu kỳ",
  openingDate: "2024-01-01",
  description: "Khai báo số dư ban đầu"
});
// Lưu periodId vào localStorage
localStorage.setItem('currentOpeningPeriodId', period.id);
```

### 2. Step 1: Save Cash & Bank Deposits
```typescript
// Get periodId from localStorage
const periodId = localStorage.getItem('currentOpeningPeriodId');
const currencyId = 'VND_CURRENCY_ID'; // TODO: Fetch from currencies table

// Batch create for cash and banks
const balances = [];

// 1. Cash balance (Account 1111)
if (cashBalance > 0) {
  balances.push({
    accountId: 'ACCOUNT_1111_ID', // Fetch from chart_of_accounts
    debitBalance: cashBalance,
    creditBalance: 0,
    hasDetails: false,
    note: 'Tiền mặt đầu kỳ'
  });
}

// 2. Bank deposits (Account 1121 for each bank)
bankDeposits.forEach(deposit => {
  balances.push({
    accountId: 'ACCOUNT_1121_ID',
    debitBalance: deposit.balance,
    creditBalance: 0,
    hasDetails: false,
    note: `Tiền gửi ${deposit.bankShortName} - ${deposit.accountNumber}`
  });
});

// Batch create
await api.batchCreateOpeningBalances({
  periodId,
  currencyId,
  balances
});
```

### 3. Step 2: Save Customer Receivables
```typescript
// Account 131 with details
const account131Id = 'ACCOUNT_131_ID'; // Fetch from chart_of_accounts

// Create parent balance
const balance = await api.createOpeningBalance({
  periodId,
  currencyId,
  accountId: account131Id,
  debitBalance: totalCustomerDebt,
  creditBalance: 0,
  hasDetails: true,
  note: 'Phải thu khách hàng đầu kỳ'
});

// Create details for each customer
const details = customerDebts.map(debt => ({
  accountingObjectId: debt.customerId,
  debitBalance: debt.amount,
  creditBalance: 0,
  note: debt.note
}));

await api.batchCreateOpeningBalanceDetails(balance.id, { details });
```

### 4. Step 3: Save Supplier Payables
```typescript
// Account 331 with details
const account331Id = 'ACCOUNT_331_ID';

const balance = await api.createOpeningBalance({
  periodId,
  currencyId,
  accountId: account331Id,
  debitBalance: 0,
  creditBalance: totalSupplierDebt,
  hasDetails: true,
  note: 'Phải trả nhà cung cấp đầu kỳ'
});

const details = supplierDebts.map(debt => ({
  accountingObjectId: debt.supplierId,
  debitBalance: 0,
  creditBalance: debt.amount,
  note: debt.note
}));

await api.batchCreateOpeningBalanceDetails(balance.id, { details });
```

### 5. Complete & Lock Period
```typescript
// Sau khi hoàn thành tất cả 3 bước
await api.lockOpeningPeriod(periodId);
```

## TODO: Implementation Tasks

### Backend
- [x] Opening Balance Module đã implement
- [ ] Fetch account IDs from chart_of_accounts (by account_number)
- [ ] Fetch currency ID (VND default)
- [ ] Add endpoint to get account by number: `GET /chart-of-accounts/by-number/:number`

### Frontend  
- [ ] Create `useOpeningBalance` hook
- [ ] Add API integration to Step1Screen
- [ ] Add API integration to Step2Screen
- [ ] Add API integration to Step3Screen
- [ ] Add loading states
- [ ] Add error handling with ErrorDialog
- [ ] Test complete flow

## Helper Utilities Needed

```typescript
// Fetch account ID by account number
async function getAccountIdByNumber(accountNumber: string): Promise<string> {
  const response = await api.getChartOfAccounts({ accountNumber });
  return response.data[0]?.id;
}

// Get or create opening period
async function getOrCreateOpeningPeriod(): Promise<string> {
  const saved = localStorage.getItem('currentOpeningPeriodId');
  if (saved) return saved;
  
  const period = await api.createOpeningPeriod({
    periodName: "Số dư đầu kỳ",
    openingDate: new Date().toISOString().split('T')[0],
    description: "Khai báo số dư ban đầu"
  });
  
  localStorage.setItem('currentOpeningPeriodId', period.id);
  return period.id;
}
```

## Notes

1. **Currency**: Hiện tại hardcode VND, sau cần fetch từ currencies table
2. **Account IDs**: Cần fetch từ chart_of_accounts based on account_number
3. **Validation**: Backend đã có validation, frontend cần handle errors
4. **Draft Mode**: Vẫn giữ localStorage cho draft, chỉ save to API khi user click "Tiếp tục" hoặc "Hoàn thành"
5. **Edit Mode**: Nếu đã tạo period rồi, cần check và update thay vì tạo mới
