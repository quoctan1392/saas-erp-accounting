# Invoice Module (Hóa đơn)

Module quản lý hóa đơn bán hàng và hóa đơn điện tử trong hệ thống kế toán.

## Tổng quan

Module này cung cấp đầy đủ các chức năng để:
- Tạo và quản lý hóa đơn (draft/published/cancelled)
- Tự động sinh số hóa đơn khi phát hành
- Tích hợp với nhà cung cấp hóa đơn điện tử
- Xuất hóa đơn PDF
- Gửi hóa đơn qua email

## Entities

### Invoice
Bảng chính lưu trữ thông tin hóa đơn.

**Trạng thái (Status):**
- `draft` - Hóa đơn nháp, có thể sửa/xóa
- `published` - Đã phát hành, có số hóa đơn, không thể sửa/xóa
- `cancelled` - Đã hủy

### InvoiceDetail
Chi tiết các dòng hàng hóa/dịch vụ trong hóa đơn.

## API Endpoints

### 1. Tạo hóa đơn
```http
POST /invoices
Content-Type: application/json

{
  "invoiceForm": "01GTKT0/001",
  "invoiceSign": "AA/24E",
  "invoiceDate": "2024-12-23",
  "accountObjectId": "uuid",
  "accountObjectName": "Công ty ABC",
  "accountObjectTaxCode": "0123456789",
  "paymentMethod": "cash",
  "currencyId": "uuid",
  "totalAmount": 1000000,
  "totalVatAmount": 100000,
  "totalPayment": 1100000,
  "details": [
    {
      "itemId": "uuid",
      "itemCode": "SP001",
      "itemName": "Sản phẩm A",
      "unitId": "uuid",
      "unitName": "Cái",
      "quantity": 10,
      "unitPrice": 100000,
      "amount": 1000000,
      "vatRate": 10,
      "vatAmount": 100000,
      "totalAmount": 1100000,
      "lineNumber": 1
    }
  ]
}
```

### 2. Lấy danh sách hóa đơn
```http
GET /invoices?status=published&fromDate=2024-01-01&toDate=2024-12-31&page=1&limit=20
```

**Query Parameters:**
- `status` - Lọc theo trạng thái (draft/published/cancelled)
- `fromDate` - Từ ngày (YYYY-MM-DD)
- `toDate` - Đến ngày (YYYY-MM-DD)
- `accountObjectId` - Lọc theo khách hàng
- `invoiceNumber` - Tìm theo số hóa đơn
- `invoiceForm` - Lọc theo mẫu số
- `page` - Số trang (default: 1)
- `limit` - Số bản ghi/trang (default: 20)

**Response:**
```json
{
  "data": [...],
  "total": 100,
  "page": 1,
  "limit": 20
}
```

### 3. Lấy chi tiết hóa đơn
```http
GET /invoices/:id
```

### 4. Cập nhật hóa đơn (chỉ draft)
```http
PUT /invoices/:id
Content-Type: application/json

{
  "accountObjectName": "Công ty XYZ",
  ...
}
```

### 5. Xóa hóa đơn (chỉ draft)
```http
DELETE /invoices/:id
```

### 6. Phát hành hóa đơn
```http
POST /invoices/:id/publish
```

**Chức năng:**
- Chuyển trạng thái từ `draft` -> `published`
- Tự động sinh số hóa đơn (nếu chưa có)
- Gọi API nhà cung cấp hóa đơn điện tử (nếu có cấu hình)
- Lưu metadata: publishedBy, publishedAt

### 7. Hủy hóa đơn
```http
POST /invoices/:id/cancel
Content-Type: application/json

{
  "cancelledBy": "user-uuid",
  "cancelReason": "Lý do hủy hóa đơn"
}
```

### 8. Xuất PDF
```http
GET /invoices/:id/pdf
```

**TODO:** Implement PDF generation với pdfkit hoặc puppeteer

### 9. Gửi email
```http
POST /invoices/:id/send-email
Content-Type: application/json

{
  "toEmail": "customer@example.com",
  "subject": "Hóa đơn GTGT số 0000001",
  "message": "Kính gửi quý khách..."
}
```

**TODO:** Implement email service

## Business Rules

### Trạng thái Draft
- ✅ Có thể sửa tất cả thông tin
- ✅ Có thể xóa
- ✅ Chưa có số hóa đơn
- ✅ Có thể phát hành

### Trạng thái Published
- ❌ Không thể sửa
- ❌ Không thể xóa
- ✅ Có số hóa đơn
- ✅ Có thể hủy
- ✅ Có thể xuất PDF
- ✅ Có thể gửi email

### Trạng thái Cancelled
- ❌ Không thể sửa
- ❌ Không thể xóa
- ✅ Có lưu lý do hủy
- ✅ Có metadata: cancelledBy, cancelledAt

## Sinh Số Hóa Đơn

**Format:** `{invoiceForm}/{invoiceSign}/{sequence}`

**Example:** `01GTKT0/001/AA/24E/0000001`

**Logic:**
1. Lấy hóa đơn cuối cùng cùng mẫu số (invoiceForm) và ký hiệu (invoiceSign)
2. Tách sequence từ invoice_number
3. Tăng sequence lên 1
4. Format với 7 chữ số (leading zeros)

## Multi-tenancy

- Tất cả query đều filter theo `tenant_id`
- Row Level Security (RLS) được áp dụng ở database level
- Invoice number unique trong scope của tenant

## Caching Strategy

Không cache vì:
- Dữ liệu thay đổi thường xuyên
- Cần real-time accuracy cho số hóa đơn
- Thông tin hóa đơn là dữ liệu nhạy cảm

## Integration Points

### 1. Sales Module
- Invoice có thể được tạo từ Sale Voucher (refType='sale_voucher', refId=sale_voucher_id)

### 2. E-Invoice Provider
- Khi publish: gọi API nhà cung cấp hóa đơn điện tử
- Lưu einvoiceTransactionId và einvoiceUrl
- Khi cancel: thông báo nhà cung cấp

### 3. Email Service
- Gửi hóa đơn PDF qua email
- Queue-based để tránh block request

### 4. Accounting Module (future)
- Khi publish invoice: tạo bút toán kế toán tự động
- Ghi nhận doanh thu và thuế GTGT

## Database Migration

File: `migrations/004_create_invoice_tables.sql`

Chạy migration:
```bash
psql -U postgres -d core_db -f migrations/004_create_invoice_tables.sql
```

## Testing

### Unit Tests
```bash
npm test -- invoices
```

### Integration Tests
```bash
npm run test:e2e -- invoices
```

### Manual Testing với HTTP Client

Tạo file `test-invoice.http`:

```http
### 1. Create Invoice
POST http://localhost:3003/invoices
Content-Type: application/json

{
  "invoiceForm": "01GTKT0/001",
  "invoiceSign": "AA/24E",
  ...
}

### 2. Get all invoices
GET http://localhost:3003/invoices?page=1&limit=10

### 3. Publish invoice
POST http://localhost:3003/invoices/{{invoiceId}}/publish

### 4. Cancel invoice
POST http://localhost:3003/invoices/{{invoiceId}}/cancel
Content-Type: application/json

{
  "cancelledBy": "user-id",
  "cancelReason": "Test cancellation"
}
```

## TODO

- [ ] Implement PDF generation
- [ ] Implement email service integration
- [ ] Implement e-invoice provider integration
- [ ] Add comprehensive validation rules
- [ ] Add audit logging
- [ ] Add event publishing (invoice.created, invoice.published, etc)
- [ ] Add unit tests
- [ ] Add integration tests
- [ ] Add permission checks (role-based access control)
- [ ] Optimize queries with indexes
- [ ] Add caching for read-heavy operations (if needed)

## Files Structure

```
invoices/
├── entities/
│   ├── invoice.entity.ts
│   └── invoice-detail.entity.ts
├── dto/
│   ├── create-invoice.dto.ts
│   ├── update-invoice.dto.ts
│   ├── query-invoice.dto.ts
│   └── invoice-actions.dto.ts
├── services/
│   └── invoice.service.ts
├── controllers/
│   └── invoice.controller.ts
├── invoices.module.ts
└── README.md
```

## Dependencies

- `@nestjs/typeorm` - Database ORM
- `@nestjs/swagger` - API documentation
- `class-validator` - DTO validation
- `class-transformer` - DTO transformation

## Author

System Generated - Core Service Team

## Last Updated

2024-12-23
