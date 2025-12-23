# Inventory Module - Quick Reference

## API Endpoints Quick Guide

### 📦 Inventory Transactions

```bash
# List all transactions
GET /inventory/transactions?page=1&limit=20&warehouseId=xxx&itemId=xxx&transactionType=in&fromDate=2024-01-01&toDate=2024-12-31

# Create transaction
POST /inventory/transactions
{
  "itemId": "uuid",
  "warehouseId": "uuid",
  "transactionType": "in",
  "transactionNo": "IN20241223001",
  "transactionDate": "2024-12-23",
  "quantity": 100,
  "unitPrice": 50000,
  "amount": 5000000,
  "description": "Nhập kho đầu kỳ"
}

# Post transaction (change status to posted)
POST /inventory/transactions/:id/post

# Delete transaction (draft only)
DELETE /inventory/transactions/:id
```

### 📊 Stock Levels

```bash
# List all stock levels
GET /inventory/stock-levels?page=1&limit=20&warehouseId=xxx&itemId=xxx

# Get stock by specific item
GET /inventory/stock-levels/:itemId

# Get low stock items
GET /inventory/low-stock
```

### 🔧 Inventory Operations

```bash
# Adjust inventory
POST /inventory/adjust
{
  "itemId": "uuid",
  "warehouseId": "uuid",
  "adjustmentQuantity": -5,
  "unitPrice": 50000,
  "reason": "Hàng hư hỏng"
}

# Transfer between warehouses
POST /inventory/transfer
{
  "itemId": "uuid",
  "fromWarehouseId": "uuid",
  "toWarehouseId": "uuid",
  "quantity": 100,
  "unitPrice": 50000,
  "reason": "Chuyển hàng sang chi nhánh"
}
```

## Transaction Types

| Type | Description | Quantity | Use Case |
|------|-------------|----------|----------|
| `in` | Nhập kho | Positive | Mua hàng, nhập đầu kỳ |
| `out` | Xuất kho | Negative | Bán hàng, xuất tiêu hao |
| `transfer` | Chuyển kho | +/- | Chuyển giữa các kho |
| `adjust` | Điều chỉnh | +/- | Kiểm kê, hư hỏng |

## Transaction Number Format

| Prefix | Type | Example |
|--------|------|---------|
| `IN` | Nhập kho | IN20241223001 |
| `OUT` | Xuất kho | OUT20241223001 |
| `TRF` | Chuyển kho | TRF20241223001 |
| `ADJ` | Điều chỉnh | ADJ20241223001 |

Format: `{PREFIX}{YYYYMMDD}{SEQUENCE(4 digits)}`

## Service Methods for Integration

```typescript
import { InventoryService } from './modules/inventory';

// Record inventory out (called from Sales module)
await inventoryService.recordInventoryOut(
  tenantId: string,
  itemId: string,
  warehouseId: string,
  quantity: number,
  unitPrice: number,
  refId: string,
  refType: string,
  description?: string
);

// Record inventory in (called from Purchase module)
await inventoryService.recordInventoryIn(
  tenantId: string,
  itemId: string,
  warehouseId: string,
  quantity: number,
  unitPrice: number,
  refId: string,
  refType: string,
  description?: string
);

// Get stock level
const stock = await inventoryService.getStockLevel(
  tenantId: string,
  itemId: string,
  warehouseId: string
);

// Find low stock items
const lowStockItems = await inventoryService.findLowStock(tenantId: string);
```

## Response Examples

### Stock Level Response
```json
{
  "data": [
    {
      "itemId": "123e4567-e89b-12d3-a456-426614174000",
      "itemCode": "HH001",
      "itemName": "Sản phẩm A",
      "warehouseId": "223e4567-e89b-12d3-a456-426614174000",
      "warehouseName": "Kho chính",
      "quantityOnHand": 500,
      "quantityReserved": 50,
      "quantityAvailable": 450,
      "averageUnitPrice": 48000,
      "totalValue": 24000000
    }
  ],
  "total": 100,
  "page": 1,
  "limit": 20,
  "totalPages": 5
}
```

### Low Stock Response
```json
[
  {
    "itemId": "123e4567-e89b-12d3-a456-426614174000",
    "itemCode": "HH001",
    "itemName": "Sản phẩm A",
    "warehouseId": "223e4567-e89b-12d3-a456-426614174000",
    "warehouseName": "Kho chính",
    "quantityOnHand": 10,
    "quantityReserved": 0,
    "quantityAvailable": 10,
    "minimumStock": 50,
    "deficit": 40
  }
]
```

## Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `Item with ID xxx not found` | Invalid itemId | Check item exists |
| `Warehouse with ID xxx not found` | Invalid warehouseId | Check warehouse exists |
| `Insufficient stock` | Out quantity > available | Check stock before |
| `Cannot delete posted transaction` | Transaction already posted | Create adjustment instead |
| `Source and target must be different` | Transfer to same warehouse | Use different warehouses |

## Business Rules

1. ✅ Only `draft` transactions can be deleted
2. ✅ Cannot withdraw more than available stock
3. ✅ Transfer requires different source and target warehouses
4. ✅ Posted transactions affect stock levels
5. ✅ Low stock alert when `quantityOnHand < minimumStock`
6. ✅ All transactions must have valid tenant_id
7. ✅ Transaction numbers are auto-generated
8. ✅ Stock calculated from posted transactions only

## Database Schema

### inventory_transaction
```sql
id                  UUID PRIMARY KEY
tenant_id           UUID NOT NULL
item_id             UUID NOT NULL (FK → item)
warehouse_id        UUID NOT NULL (FK → warehouse)
transaction_type    ENUM ('in', 'out', 'transfer', 'adjust')
transaction_no      VARCHAR(50) NOT NULL
transaction_date    DATE NOT NULL
posted_date         TIMESTAMP
quantity            DECIMAL(15,4) NOT NULL
unit_price          DECIMAL(15,2) NOT NULL
amount              DECIMAL(15,2) NOT NULL
description         TEXT
target_warehouse_id UUID (FK → warehouse)
ref_id              UUID
ref_type            VARCHAR(50)
employee_id         UUID
status              VARCHAR(20) DEFAULT 'draft'
is_deleted          BOOLEAN DEFAULT FALSE
created_at          TIMESTAMP
updated_at          TIMESTAMP
```

## Migration

```bash
# Run migration
psql -h localhost -U postgres -d core_db -f services/core-service/migrations/005_create_inventory_tables.sql

# Verify
psql -h localhost -U postgres -d core_db -c "SELECT * FROM inventory_transaction LIMIT 1;"
psql -h localhost -U postgres -d core_db -c "SELECT * FROM stock_level_view LIMIT 5;"
```

## Testing Checklist

- [ ] Create IN transaction
- [ ] Create OUT transaction (check stock validation)
- [ ] Post transaction
- [ ] Try to delete posted transaction (should fail)
- [ ] Delete draft transaction
- [ ] Adjust inventory
- [ ] Transfer between warehouses
- [ ] Query stock levels
- [ ] Check low stock alerts
- [ ] Verify tenant isolation
- [ ] Test pagination
- [ ] Test filters (date, type, warehouse, item)
