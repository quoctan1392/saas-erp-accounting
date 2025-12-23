# Inventory Module - Xuất nhập tồn kho

## Tổng quan

Module Inventory quản lý toàn bộ các giao dịch xuất nhập tồn kho, tính toán tồn kho real-time, và cảnh báo hàng hóa sắp hết. Module này là một phần quan trọng trong hệ thống ERP, liên kết chặt chẽ với các module Sales, Items, và Warehouses.

## Cấu trúc

```
inventory/
├── dto/
│   ├── create-inventory-transaction.dto.ts
│   ├── adjust-inventory.dto.ts
│   ├── transfer-inventory.dto.ts
│   ├── query-inventory-transaction.dto.ts
│   └── query-stock-level.dto.ts
├── entities/
│   ├── inventory-transaction.entity.ts
│   └── stock-level.view.ts
├── inventory.controller.ts
├── inventory.service.ts
└── inventory.module.ts
```

## Entities

### InventoryTransaction

Lưu trữ tất cả các giao dịch xuất nhập kho.

**Các loại giao dịch (TransactionType):**
- `in`: Nhập kho
- `out`: Xuất kho
- `transfer`: Chuyển kho
- `adjust`: Điều chỉnh tồn kho

**Trường dữ liệu chính:**
- `itemId`: ID hàng hóa
- `warehouseId`: ID kho nguồn
- `transactionType`: Loại giao dịch
- `transactionNo`: Mã giao dịch (auto-generated)
- `transactionDate`: Ngày giao dịch
- `quantity`: Số lượng (dương cho IN, âm cho OUT)
- `unitPrice`: Đơn giá
- `amount`: Thành tiền
- `targetWarehouseId`: Kho đích (dùng cho transfer)
- `refId`, `refType`: Tham chiếu đến chứng từ gốc
- `status`: Trạng thái (draft/posted)

### StockLevelView

View tính toán real-time tồn kho theo hàng hóa và kho.

**Trường dữ liệu:**
- `itemId`, `itemCode`, `itemName`
- `warehouseId`, `warehouseName`
- `quantityOnHand`: Tồn kho thực tế
- `quantityReserved`: Số lượng đã đặt
- `quantityAvailable`: Khả dụng = onHand - reserved
- `averageUnitPrice`: Giá vốn bình quân
- `totalValue`: Giá trị tồn kho

## API Endpoints

### 1. Lấy danh sách giao dịch

```http
GET /inventory/transactions
```

**Query Parameters:**
- `warehouseId` (optional): Lọc theo kho
- `itemId` (optional): Lọc theo hàng hóa
- `transactionType` (optional): Lọc theo loại giao dịch
- `fromDate`, `toDate` (optional): Lọc theo ngày
- `page`, `limit`: Phân trang

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "itemId": "uuid",
      "item": { "code": "HH001", "name": "Sản phẩm A" },
      "warehouseId": "uuid",
      "warehouse": { "code": "KHO01", "name": "Kho chính" },
      "transactionType": "in",
      "transactionNo": "IN20241223001",
      "transactionDate": "2024-12-23",
      "quantity": 100,
      "unitPrice": 50000,
      "amount": 5000000,
      "status": "posted"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "totalPages": 3
  }
}
```

### 2. Tạo giao dịch thủ công

```http
POST /inventory/transactions
```

**Request Body:**
```json
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
```

### 3. Ghi sổ giao dịch

```http
POST /inventory/transactions/:id/post
```

Chuyển trạng thái từ `draft` sang `posted`. Sau khi posted:
- Giao dịch ảnh hưởng đến tồn kho
- Không thể sửa/xóa
- Tính vào báo cáo

### 4. Xóa giao dịch

```http
DELETE /inventory/transactions/:id
```

Chỉ xóa được giao dịch ở trạng thái `draft`.

### 5. Lấy danh sách tồn kho

```http
GET /inventory/stock-levels
```

**Query Parameters:**
- `warehouseId` (optional): Lọc theo kho
- `itemId` (optional): Lọc theo hàng hóa
- `page`, `limit`: Phân trang

**Response:**
```json
{
  "data": [
    {
      "itemId": "uuid",
      "itemCode": "HH001",
      "itemName": "Sản phẩm A",
      "warehouseId": "uuid",
      "warehouseName": "Kho chính",
      "quantityOnHand": 500,
      "quantityReserved": 50,
      "quantityAvailable": 450,
      "averageUnitPrice": 48000,
      "totalValue": 24000000
    }
  ],
  "meta": { ... }
}
```

### 6. Lấy tồn kho theo hàng hóa

```http
GET /inventory/stock-levels/:itemId
```

Trả về tồn kho của 1 hàng hóa ở tất cả các kho.

### 7. Hàng hóa sắp hết

```http
GET /inventory/low-stock
```

Trả về danh sách hàng hóa có `quantityOnHand < minimumStock`.

**Response:**
```json
[
  {
    "itemId": "uuid",
    "itemCode": "HH001",
    "itemName": "Sản phẩm A",
    "warehouseId": "uuid",
    "warehouseName": "Kho chính",
    "quantityOnHand": 10,
    "minimumStock": 50,
    "deficit": 40
  }
]
```

### 8. Điều chỉnh tồn kho

```http
POST /inventory/adjust
```

Dùng để điều chỉnh tồn kho khi kiểm kê, phát hiện lỗi, v.v.

**Request Body:**
```json
{
  "itemId": "uuid",
  "warehouseId": "uuid",
  "adjustmentQuantity": -5,
  "unitPrice": 50000,
  "reason": "Hàng hư hỏng"
}
```

- `adjustmentQuantity > 0`: Tăng tồn
- `adjustmentQuantity < 0`: Giảm tồn

### 9. Chuyển kho

```http
POST /inventory/transfer
```

Chuyển hàng hóa từ kho này sang kho khác.

**Request Body:**
```json
{
  "itemId": "uuid",
  "fromWarehouseId": "uuid",
  "toWarehouseId": "uuid",
  "quantity": 100,
  "unitPrice": 50000,
  "reason": "Chuyển hàng sang chi nhánh"
}
```

Tạo 2 giao dịch:
1. OUT từ `fromWarehouseId` (quantity âm)
2. IN vào `toWarehouseId` (quantity dương)

## Business Logic

### 1. Tính tồn kho

```typescript
quantityOnHand = SUM(
  CASE 
    WHEN transaction_type = 'in' THEN quantity
    WHEN transaction_type = 'out' THEN -quantity
    WHEN transaction_type = 'adjust' THEN quantity
    ELSE 0
  END
) WHERE status = 'posted'
```

### 2. Giá vốn bình quân

```typescript
averageUnitPrice = SUM(amount_in) / SUM(quantity_on_hand)
```

### 3. Kiểm tra tồn kho khi xuất

```typescript
if (transactionType === 'OUT') {
  const stockLevel = await getStockLevel(itemId, warehouseId);
  if (stockLevel.quantityAvailable < quantity) {
    throw new BadRequestException('Insufficient stock');
  }
}
```

### 4. Mã giao dịch tự động

Format: `{PREFIX}{YYYYMMDD}{SEQUENCE}`

- `IN20241223001`: Nhập kho ngày 23/12/2024, số 001
- `OUT20241223001`: Xuất kho
- `TRF20241223001`: Chuyển kho
- `ADJ20241223001`: Điều chỉnh

## Integration với modules khác

### Sales Module

Khi ghi sổ phiếu xuất kho (outward voucher):

```typescript
// In SalesService
await this.inventoryService.recordInventoryOut(
  tenantId,
  itemId,
  warehouseId,
  quantity,
  unitPrice,
  saleVoucherId,
  'sale_voucher',
  'Xuất hàng bán'
);
```

### Purchase Module (Future)

Khi ghi sổ phiếu nhập kho:

```typescript
await this.inventoryService.recordInventoryIn(
  tenantId,
  itemId,
  warehouseId,
  quantity,
  unitPrice,
  purchaseVoucherId,
  'purchase_voucher',
  'Nhập hàng mua'
);
```

## Validation Rules

1. **Tenant Isolation**: Tất cả query phải có `tenantId`
2. **Stock Validation**: Không xuất kho vượt tồn
3. **Status Validation**: Chỉ xóa/sửa giao dịch `draft`
4. **Transfer Validation**: Kho nguồn ≠ kho đích
5. **Quantity Validation**: Số lượng > 0

## Caching Strategy

```typescript
// Cache stock levels (TTL: 5 minutes)
const cacheKey = `tenant:${tenantId}:stock:${itemId}:${warehouseId}`;

// Invalidate on:
- Khi post transaction
- Khi adjust/transfer inventory
```

## Background Jobs

### 1. Calculate Stock Levels (Every 5 minutes)

```typescript
// Tính lại tồn kho từ inventory_transactions
// Phát hiện sai lệch và cảnh báo
```

### 2. Low Stock Alert (Every hour)

```typescript
// Kiểm tra hàng hóa sắp hết
// Gửi notification cho người quản lý kho
```

## Testing

### Unit Tests

```typescript
describe('InventoryService', () => {
  it('should create inventory transaction', async () => { ... });
  it('should prevent overdraft', async () => { ... });
  it('should calculate stock level correctly', async () => { ... });
  it('should transfer between warehouses', async () => { ... });
});
```

### Integration Tests

```typescript
describe('Inventory API', () => {
  it('POST /inventory/transactions - should create transaction', async () => { ... });
  it('GET /inventory/stock-levels - should return stock', async () => { ... });
  it('POST /inventory/transfer - should transfer stock', async () => { ... });
});
```

## Migration

Database migration: `005_create_inventory_tables.sql`

Chạy migration:
```bash
psql -h localhost -U postgres -d core_db -f migrations/005_create_inventory_tables.sql
```

## Best Practices

1. **Luôn post transaction** để ảnh hưởng tồn kho
2. **Không xóa posted transaction** - dùng điều chỉnh thay vì
3. **Kiểm tra tồn trước khi xuất** - tránh số âm
4. **Sử dụng ref_id, ref_type** để trace nguồn gốc
5. **Log tất cả thao tác** cho audit trail

## Future Enhancements

1. **Serial/Batch tracking**: Theo dõi theo lô/serial number
2. **FIFO/LIFO**: Tính giá xuất kho chính xác hơn
3. **Reserved quantity**: Tồn kho đã đặt (sales order)
4. **Warehouse zones**: Vị trí trong kho
5. **Barcode scanning**: Quét mã vạch xuất/nhập
6. **Cycle counting**: Kiểm kê luân phiên
