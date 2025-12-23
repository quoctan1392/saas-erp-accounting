# Sales Module - Core Service

## Overview

The Sales module handles all sales-related operations for the ERP system, including sale vouchers, outward (delivery) vouchers, and receipt vouchers.

## Features

### 1. Sale Vouchers (Chứng từ bán hàng)
- Create, read, update, delete sale vouchers
- Support for both immediate and deferred payment
- Integration with outward vouchers and invoices
- Multi-currency support
- Various discount types (by item, by amount, by percentage)
- VAT and export tax calculations

### 2. Outward Vouchers (Phiếu xuất kho)
- Manage inventory outward movements
- Link to sale vouchers
- Support multiple warehouses
- Track cost of goods sold (COGS)

### 3. Receipt Vouchers (Phiếu thu tiền)
- Record customer payments
- Link to sale vouchers
- Support multiple accounting entries

## API Endpoints

### Sale Vouchers

```
POST   /sales/vouchers              Create a new sale voucher
GET    /sales/vouchers              Get all sale vouchers (with filters)
GET    /sales/vouchers/:id          Get a specific sale voucher
PATCH  /sales/vouchers/:id          Update a sale voucher
DELETE /sales/vouchers/:id          Delete a sale voucher (draft only)
POST   /sales/vouchers/:id/post     Post voucher to ledger
```

**Query Parameters:**
- `status`: Filter by status (draft, posted)
- `fromDate`: Filter by transaction date (start)
- `toDate`: Filter by transaction date (end)
- `objectId`: Filter by customer ID
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)

### Outward Vouchers

```
POST   /sales/outward-vouchers              Create a new outward voucher
GET    /sales/outward-vouchers              Get all outward vouchers
GET    /sales/outward-vouchers/:id          Get a specific outward voucher
PATCH  /sales/outward-vouchers/:id          Update an outward voucher
DELETE /sales/outward-vouchers/:id          Delete an outward voucher (draft only)
POST   /sales/outward-vouchers/:id/post     Post voucher to ledger
```

### Receipt Vouchers

```
POST   /sales/receipt-vouchers              Create a new receipt voucher
GET    /sales/receipt-vouchers              Get all receipt vouchers
GET    /sales/receipt-vouchers/:id          Get a specific receipt voucher
PATCH  /sales/receipt-vouchers/:id          Update a receipt voucher
DELETE /sales/receipt-vouchers/:id          Delete a receipt voucher (draft only)
POST   /sales/receipt-vouchers/:id/post     Post voucher to ledger
```

## Data Models

### Sale Voucher

```typescript
{
  code: string,                              // Voucher code
  transactionNo: string,                     // Transaction number
  transactionDate: Date,                     // Transaction date
  paymentType: 'pay_later' | 'pay_now',      // Payment type
  paymentMethod: 'cash' | 'bank_transfer',   // Payment method
  isSaleWithOutward: boolean,                // Auto-create outward voucher
  isSaleWithInvoice: boolean,                // Auto-create invoice
  accountObjectId: string,                   // Customer ID
  currencyId: string,                        // Currency
  exchangeRate: number,                      // Exchange rate
  totalAmount: number,                       // Total amount
  discountType: string,                      // Discount type
  totalVatAmount: number,                    // Total VAT
  status: 'draft' | 'posted',                // Status
  details: [                                 // Line items
    {
      itemId: string,
      quantity: number,
      unitPrice: number,
      amount: number,
      vatRate: number,
      ...
    }
  ]
}
```

### Outward Voucher

```typescript
{
  code: string,
  saleVoucherRefId: string,                  // Reference to sale voucher
  transactionNo: string,
  transactionDate: Date,
  accountObjectId: string,                   // Customer ID
  status: 'draft' | 'posted',
  details: [
    {
      itemId: string,
      quantity: number,
      warehouseId: string,
      inventoryAccountId: string,
      cogsAccountId: string,
      ...
    }
  ]
}
```

### Receipt Voucher

```typescript
{
  saleVoucherRefId: string,                  // Reference to sale voucher
  transactionNo: string,
  transactionDate: Date,
  accountObjectId: string,                   // Customer ID
  status: 'draft' | 'posted',
  details: [
    {
      debitAccountId: string,                // Debit account (cash/bank)
      creditAccountId: string,               // Credit account (AR)
      amount: number,
      ...
    }
  ]
}
```

## Business Rules

1. **Voucher Status**
   - Only `draft` vouchers can be updated or deleted
   - Once `posted`, vouchers become immutable

2. **Sale Voucher Posting**
   - Creates accounting journal entries
   - If `isSaleWithOutward = true`, automatically creates outward voucher
   - If `isSaleWithInvoice = true`, automatically creates invoice

3. **Outward Voucher Posting**
   - Reduces inventory stock
   - Creates inventory transactions
   - Records COGS

4. **Receipt Voucher Posting**
   - Reduces customer accounts receivable
   - Updates cash/bank balances

5. **Multi-currency**
   - All amounts stored in both original currency (OC) and base currency
   - Exchange rate applied at transaction date

## Integration Points

### Events Published

- `sale.created` - When a sale voucher is created
- `sale.posted` - When a sale voucher is posted
- `inventory.out` - When outward voucher is posted
- `payment.received` - When receipt voucher is posted

### Events Subscribed

- None (currently independent module)

## Database Tables

- `sale_voucher` - Sale voucher headers
- `sale_voucher_detail` - Sale voucher line items
- `outward_voucher` - Outward voucher headers
- `outward_voucher_detail` - Outward voucher line items
- `receipt_voucher` - Receipt voucher headers
- `receipt_voucher_detail` - Receipt voucher line items

### Migration

Run the migration file:
```sql
-- Located at: services/core-service/migrations/003_create_sales_tables.sql
```

## Authentication & Authorization

All endpoints require:
- Valid JWT token
- `tenantId` in token payload
- Appropriate permissions (read, create, update, delete, post)

## Example Usage

### Create a Sale Voucher

```typescript
POST /sales/vouchers
Authorization: Bearer <token>

{
  "code": "BH001",
  "transactionNo": "BH-2024-001",
  "transactionDate": "2024-12-23",
  "transactionCode": "BH",
  "paymentType": "pay_later",
  "paymentMethod": "bank_transfer",
  "isSaleWithOutward": true,
  "isSaleWithInvoice": true,
  "accountObjectId": "customer-uuid",
  "accountObjectName": "Customer Name",
  "currencyId": "VND",
  "exchangeRate": 1,
  "totalAmount": 11000000,
  "discountType": "not_discount",
  "totalVatAmount": 1000000,
  "details": [
    {
      "itemId": "item-uuid",
      "unitId": "unit-uuid",
      "quantity": 10,
      "unitPrice": 1000000,
      "amount": 10000000,
      "vatRate": 10,
      "vatAmount": 1000000,
      "revenueAccountId": "account-uuid"
    }
  ]
}
```

### Post a Sale Voucher

```typescript
POST /sales/vouchers/{id}/post
Authorization: Bearer <token>

// Response: Posted voucher with updated status
```

## TODO / Future Enhancements

- [ ] Implement automatic accounting entry generation
- [ ] Implement automatic outward voucher creation
- [ ] Implement automatic invoice creation
- [ ] Add event publishing to RabbitMQ
- [ ] Add comprehensive validation rules
- [ ] Add serial number tracking for items
- [ ] Add batch/lot number tracking
- [ ] Add approval workflow
- [ ] Add credit limit checking for customers
- [ ] Add sales analytics and reports

## Testing

```bash
# Unit tests
npm run test sales

# Integration tests
npm run test:e2e sales

# Test coverage
npm run test:cov sales
```

## Related Modules

- **Accounting Objects Module**: Customer management
- **Items Module**: Product catalog
- **Warehouses Module**: Inventory management
- **Chart of Accounts Module**: Account mapping
- **Invoices Module** (future): E-invoice generation
- **Inventory Module** (future): Stock movement tracking

## Support

For issues or questions about the Sales module, please contact the development team.
