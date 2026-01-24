# Stock Consistency Fix Summary

## Vấn đề (Problem)

Items VT00003 và VT00004 hiển thị `totalStock = 0` mặc dù có `initialStock` được thiết lập, trong khi VT00001 và VT00002 hiển thị đúng.

## Nguyên nhân (Root Cause)

### Cách hoạt động của hệ thống tồn kho:

1. **`item` table**: Lưu `initial_stock` (tồn kho ban đầu) và `default_warehouse_id`
2. **`inventory_transaction` table**: Lưu tất cả giao dịch xuất/nhập kho
3. **`stock_level_view` (materialized view)**: Tính tổng tồn kho từ các transaction trong `inventory_transaction`
4. **`warehouse_item` table**: Junction table liên kết item và warehouse

### Vấn đề xảy ra:

- **ItemsService** tính `totalStock` từ `stock_level_view` (aggregates từ `inventory_transaction`)
- VT00001, VT00002: Có INITIAL_STOCK transactions (được tạo ngày 23/01)
- VT00003, VT00004: **KHÔNG có** INITIAL_STOCK transactions → `totalStock` = 0
- VT00003, VT00004: **KHÔNG có** `warehouse_item` records → không xuất hiện trong `stock_level_view`

## Giải pháp (Solution)

### 1. Migration được tạo: `011_insert_initial_stock_transactions.sql`

Migration này thực hiện 2 bước:

**Bước 1**: Tạo `warehouse_item` records cho items thiếu:
```sql
INSERT INTO warehouse_item (...)
SELECT ... FROM item i
WHERE i.initial_stock > 0
  AND i.default_warehouse_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM warehouse_item WHERE ...)
```

**Bước 2**: Tạo INITIAL_STOCK inventory transactions:
```sql
INSERT INTO inventory_transaction (...)
SELECT ... FROM item i
WHERE i.initial_stock > 0
  AND i.default_warehouse_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM inventory_transaction WHERE reference_type = 'INITIAL_STOCK')
```

### 2. Service Logic đã có sẵn

`ItemsService.createItem()` (line 254-262) đã có logic tự động tạo INITIAL_STOCK transaction:

```typescript
if (dto.initialStock && dto.initialStock > 0) {
  await this.inventoryService.recordInventoryIn(
    tenantId,
    savedItem.id,
    warehouseId,
    dto.initialStock,
    dto.purchasePrice || 0,
    savedItem.id,
    'INITIAL_STOCK',
    `Tồn kho ban đầu cho ${savedItem.name}`,
  );
}
```

**→ Items mới tạo từ bây giờ sẽ TỰ ĐỘNG có INITIAL_STOCK transaction**

## Kết quả sau khi fix (Results)

### Database consistency check:

```
  code   | has_initial_stock | has_initial_txn | has_warehouse_item 
---------+-------------------+-----------------+--------------------
 VT00001 | YES               | YES             | YES
 VT00002 | YES               | YES             | YES
 VT00003 | YES               | YES             | YES ✅ Fixed
 VT00004 | YES               | YES             | YES ✅ Fixed
```

### API verification:

```json
{
  "code": "VT00003",
  "initialStock": "400.0000",
  "totalStock": 400,  // ✅ Was 0, now correct
  "stockByWarehouse": {
    "dd461757-6c9e-427f-8ece-f337889eb5f1": 400
  }
}

{
  "code": "VT00004",
  "initialStock": "3000.0000",
  "totalStock": 3000,  // ✅ Was 0, now correct
  "stockByWarehouse": {
    "95e56a76-fd5b-4124-8e79-10242aad0b1a": 3000
  }
}
```

## Đảm bảo tính nhất quán trong tương lai (Future Consistency)

### ✅ Items mới (New items):
- `ItemsService.createItem()` tự động tạo:
  1. `warehouse_item` record
  2. INITIAL_STOCK `inventory_transaction` nếu `initialStock > 0`

### ✅ Items hiện tại (Existing items):
- Migration `011_insert_initial_stock_transactions.sql` đã fix tất cả items thiếu
- Migration có thể chạy lại an toàn (uses `NOT EXISTS` checks và `ON CONFLICT DO NOTHING`)

### ✅ Data flow:
```
item.initial_stock (DB field)
    ↓ (on create)
inventory_transaction (transaction_type='in', reference_type='INITIAL_STOCK')
    ↓ (aggregated by)
stock_level_view
    ↓ (queried by)
ItemsService.getItemStockData()
    ↓ (returns)
API response: totalStock, stockByWarehouse
```

## Lưu ý khi triển khai (Deployment Notes)

1. **Run migration trên staging trước**: Test với data thực
2. **Backup database trước khi chạy production**
3. **Migration là idempotent**: Có thể chạy nhiều lần an toàn
4. **Items không có warehouse sẽ bị skip**: Cần manually assign warehouse nếu cần

## Monitoring

Để check tính nhất quán sau này, chạy query:

```sql
-- Find items with initial_stock but missing transactions
SELECT i.code, i.initial_stock
FROM item i
WHERE i.initial_stock > 0 
  AND i.is_deleted = false
  AND NOT EXISTS (
    SELECT 1 FROM inventory_transaction it 
    WHERE it.item_id = i.id 
      AND it.reference_type = 'INITIAL_STOCK'
  );
```

Nếu query trả về rows → có items bị thiếu transactions.
