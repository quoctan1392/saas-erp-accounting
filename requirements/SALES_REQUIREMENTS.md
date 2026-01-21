# Yêu cầu chi tiết - Module Bán hàng (Sales)

## Tổng quan
Module Bán hàng là hệ thống quản lý toàn bộ quy trình giao dịch bán hàng từ khởi tạo đơn, xuất kho, thu tiền đến phát hành hóa đơn điện tử. Module này tích hợp chặt chẽ với các module Kho (Inventory), Kế toán (Accounting) và Hóa đơn điện tử (E-Invoice).

**Phân hệ**: ERP / Sales Management

**PRD Reference**: 250724 - [PRD] - Module Bán hàng (Sales)

**Design**: [Figma - Symper One Project - Sales Module](https://www.figma.com/design/92RAC4jchoVErx2FBWeHjW/Symper-One-Project--Mobile-?node-id=1306-5886)

---

## 1. BUSINESS RULES CHUNG (GENERAL RULES)

### BR01 - Định dạng mã chứng từ
| Rule | Description |
|------|-------------|
| BR01.01 | Mã chứng từ tự động sinh theo pattern: `#[PREFIX]/YYYY/[SEQUENCE]` |
| BR01.02 | PREFIX theo loại chứng từ: BH (Bán hàng), XK (Phiếu xuất kho), NK (Phiếu nhập kho),  PT (Phiếu thu tiền mặt), BTL (Trả hàng), BGG (Giảm giá), NTTK(Phiếu thu tiền gửi) , PC (Phiếu chi tiền mặt),  UNC (Phiếu chi tiền gửi) |
| BR01.03 | SEQUENCE bắt đầu từ 00001, padding 5 chữ số, reset về 00001 mỗi năm mới |
| BR01.04 | Ví dụ: `#BH/2025/00003`, `#PX/2025/00128`, `#PT/2025/00045` |
| BR01.05 | Mã chứng từ không thể trùng lặp trong cùng một tenant |

### BR02 - Quy tắc hạch toán tự động
| Rule | Description |
|------|-------------|
| BR02.01 | Khi chứng từ bán hàng chuyển sang trạng thái "Hoàn thành" → Tự động sinh bút toán kép (tạm thời define theo các rule bên dưới, sau này sẽ config đầy đủ trong Module Policy Management) |
| BR02.02 | Bút toán doanh thu: **Nợ TK 131** (Phải thu khách hàng) - **Có TK 511** (Doanh thu bán hàng) |
| BR02.03 | Bút toán giá vốn: **Nợ TK 632** (Giá vốn hàng bán) - **Có TK 156** (Hàng hóa) |
| BR02.04 | Bút toán thuế GTGT: **Nợ TK 131** - **Có TK 33311** (Thuế GTGT đầu ra) |
| BR02.05 | Nếu có chiết khấu: Ghi giảm doanh thu (Nợ TK 521 - **Có TK 511**) |
| BR02.06 | Nếu Thu tiền khách hàng ghi nhận tiền thu từ hàng hoá vào Nợ TK 111/112 (Tiền mặt/ Tiền gửi) - Có TK 131 (Phải thu khách hàng). Số tiền phải thu của khách hàng bằng tổng số tiền của TK nợ 131 bên trên bao gồm cả tiền thuế GTGT |

### BR03 - Quản lý trạng thái chứng từ
| Rule | Description |
|------|-------------|
| BR03.01 | Trạng thái đơn hàng: **Nháp (Bỏ ghi)** → **Hoàn thành** → **Hủy** |
| BR03.02 | Chỉ cho phép **Sửa/Xóa** chứng từ ở trạng thái **Nháp** |
| BR03.03 | Chứng từ **Hoàn thành** cho phép **Bỏ ghi** (chuyển về Nháp) nếu chưa phát sinh chứng từ liên quan |
| BR03.04 | Chứng từ đã phát hành HĐĐT không thể **Sửa/Xóa**, chỉ cho phép **Hủy** hoặc lập **Hóa đơn điều chỉnh** |
| BR03.05 | Khi **Hủy** chứng từ đã hoàn thành: Tự động bỏ ghi bút toán |

### BR04 - Tích hợp tự động
| Rule | Description |
|------|-------------|
| BR04.01 | Khi `isSaleWithOutward = true`: Tự động sinh **Phiếu xuất kho** tham chiếu đến chứng từ bán |
| BR04.02 | Khi `isSaleWithInvoice = true`: Tự động sinh **Hóa đơn điện tử** nháp tham chiếu đến chứng từ bán |
| BR04.03 | Khi `paymentType = pay_now`: Tự động sinh **Phiếu thu** với số tiền đã thanh toán tham chiếu đến chứng từ bán |
| BR04.04 | Phiếu xuất kho tự động trừ tồn kho theo phương pháp FIFO (mặc định) |
| BR04.05 | Phiếu thu tự động giảm công nợ khách hàng (Nợ TK 111/112 - **Có TK 131**) |

### BR05 - Validation chung
| Rule | Description |
|------|-------------|
| BR05.01 | Không cho phép xuất kho vượt quá số lượng tồn kho khả dụng đối với hàng hoá không cho phép bán hàng âm  |
| BR05.02 | Chiết khấu không được vượt quá 100% hoặc lớn hơn tổng giá trị đơn hàng |
| BR05.03 | Ngày chứng từ không được lớn hơn ngày hiện tại |
| BR05.04 | Ngày hạch toán phải >= Ngày chứng từ |
| BR05.05 | Mỗi đơn hàng phải có ít nhất 1 mặt hàng |

---

## 2. UC01 - QUẢN LÝ DANH SÁCH HÓA ĐƠN BÁN HÀNG

### 2.1. Tổng quan
**Mục đích**: Cung cấp giao diện tổng quan để người dùng tra cứu, lọc và thao tác nhanh với các đơn hàng bán.

**Route**: `/sales/orders`

**Screen**: SalesOrderListScreen

### 2.2. UI Components

#### 2.2.1. Header
```
┌──────────────────────────────────────────────────────────┐
│  [←]  Hoá đơn bán hàng                      [⋮ More]     │
│                                                          │
│  [🔍 Tìm kiếm hoá đơn, khách hàng...]                    │
└──────────────────────────────────────────────────────────┘
```
- **Title**: "Hoá đơn bán hàng" - 18px, fontWeight 600, color #212529
- **Back button**: Icon `ArrowLeft2` - 24px, color #212529
- **More button**: Icon `More` (3 dots vertical) - 24px, color #212529
- **Search input**: 
  - Height: 52px
  - Background: rgba(0,0,0,0.04)
  - Border radius: 12px
  - Icon: `SearchNormal1` - 20px, color rgba(0,0,0,0.6)
  - Placeholder: "Tìm kiếm hoá đơn, khách hàng..." - 14px, color rgba(0,0,0,0.38)

#### 2.2.2. Tabs & Filters
```
┌──────────────────────────────────────────────────────────┐
│  [Tất cả] [Nháp] [Hoàn thành] [Hủy]     [Tháng này ▾]   │
│                                                          │
│  🗂 54 hoá đơn                                           │
└──────────────────────────────────────────────────────────┘
```
- **Tabs**: Horizontal scrollable, height 45px
  - Active: Background #FFF7ED, Border bottom 2px #FB7E00, Color #BA5C00
  - Inactive: Color rgba(0,0,0,0.6)
- **Date filter**: 
  - Icon: `Calendar` - 16px
  - Text: "Tháng này" - 14px, fontWeight 500
  - Dropdown icon: `ArrowDown2`
- **Result count**: "🗂 X hoá đơn" - 14px, color rgba(0,0,0,0.6)

#### 2.2.3. Order Card (List Item)
```
┌──────────────────────────────────────────────────────────┐
│  🏪 #BH/2025/00123                      [Hoàn thành]     │
│  25/12/2024 • 14:30 • Nguyễn Văn A                       │
│                                                          │
│  👤 Nguyễn Thị B                                         │
│  📞 0987654321                                           │
│                                                          │
│  📦 Sản phẩm A             2 x 150,000đ   = 300,000đ     │
│  Xem tất cả sản phẩm                                     │
│                                                          │
│  ├─ Tổng tiền hàng              1,200,000đ               │
│  ├─ Chiết khấu                    -50,000đ               │
│  ├─ Thuế GTGT (10%)                 +115,000đ            │
│  └─ Tổng thanh toán             1,265,000đ               │
│                                                          │
│  💰 Trạng thái TT: [Đã thanh toán]                       │
│  🧾 Trạng thái HĐĐT: [Đã phát hành: 5AA04BJ73...]       │
└──────────────────────────────────────────────────────────┘
```

**Card Styling**:
- Container: 
  - Background: #FFFFFF
  - Border radius: 12px
  - Padding: 12px
  - Shadow: 0px 2px 8px rgba(0,0,0,0.08)
  - Margin bottom: 12px

**Header Section**:
- Order Code: 
  - Icon: `Shop` - 20px, color #FB7E00
  - Text: "#BH/2025/00123" - 16px, fontWeight 600, color #212529
- Status Badge:
  - Height: 22px
  - Border radius: 4px
  - Padding: 4px 12px
  - Font: 12px, fontWeight 500
  - Colors:
    - Nháp: Background #F8F9FA, Text #6C757D
    - Hoàn thành: Background #D1FAE5, Text #065F46
    - Hủy: Background #FEE2E2, Text #991B1B

**Meta Info**:
- Text: "25/12/2024 • 14:30 • Nguyễn Văn A"
- Font: 12px, color rgba(0,0,0,0.6)
- Icons: Circle bullet `•` between items

**Customer Section**:
- Background: rgba(0,0,0,0.04)
- Border radius: 8px
- Padding: 8px 12px
- Customer name: Icon `User` + Text - 14px, fontWeight 500
- Phone: Icon `Call` + Text - 14px, color rgba(0,0,0,0.6)

**Items Section**:
- Item row: 
  - Icon: `Box` - 16px
  - Name: 14px, fontWeight 500
  - Quantity x Price: 14px, color rgba(0,0,0,0.6)
  - Amount: 14px, fontWeight 600, right aligned
- "Xem thêm X sản phẩm": 
  - Font: 13px, color #FB7E00, fontWeight 500
  - Underline on press

**Summary Section**:
- Label: 14px, color rgba(0,0,0,0.6)
- Value: 14px, fontWeight 600, right aligned
- Discount: Color #DC2626 (red)
- Tax: Color #059669 (green)
- Total: 16px, fontWeight 700, color #FB7E00

**Payment Status**:
- Icon: `Wallet` - 16px
- Badge colors:
  - Đã thanh toán: Background #D1FAE5, Text #065F46
  - Chưa thanh toán: Background #FEF3C7, Text #92400E
  - TT một phần: Background #DBEAFE, Text #1E40AF

**Invoice Status**:
- Icon: `Receipt` - 16px
- Colors:
  - Đã phát hành: Background #D1FAE5, Text #065F46
  - Chờ cấp mã: Background #FEF3C7, Text #92400E
  - Chưa lập: Background #F3F4F6, Text #6B7280

### 2.3. Functional Requirements

#### FR01 - Hiển thị danh sách
| ID | Requirement | Priority |
|----|-------------|----------|
| FR01.01 | Hiển thị danh sách hóa đơn dạng Card với đầy đủ thông tin tóm tắt | Must |
| FR01.02 | Lazy load: Tải 20 đơn hàng/lần, tự động load thêm khi scroll gần cuối danh sách | Must |
| FR01.03 | Pull to refresh: Vuốt xuống để làm mới danh sách | Must |
| FR01.04 | Hiển thị empty state khi không có dữ liệu: "Chưa có đơn hàng nào. Tạo đơn hàng đầu tiên?" | Must |
| FR01.05 | Hiển thị skeleton loading khi đang tải dữ liệu | Must |
| FR01.06 | Click vào Card → Navigate sang màn chi tiết `/sales/orders/:id` | Must |

#### FR02 - Tìm kiếm thông minh
| ID | Requirement | Priority |
|----|-------------|----------|
| FR02.01 | Tìm kiếm theo: Mã hóa đơn, Tên khách hàng, Mã khách hàng, Tên sản phẩm | Must |
| FR02.02 | Debounce 500ms để tránh gọi API liên tục khi gõ | Must |
| FR02.03 | Không phân biệt hoa thường và không dấu tiếng Việt | Must |
| FR02.04 | Hiển thị "Không tìm thấy kết quả trùng khớp. Vui lòng thử lại" nếu không có đơn hàng nào match | Must |
| FR02.05 | Clear search button (X) xuất hiện khi có text trong ô tìm kiếm | Must |

#### FR03 - Bộ lọc dữ liệu
| ID | Requirement | Priority |
|----|-------------|----------|
| FR03.01 | Lọc theo Tab: Tất cả / Nháp / Hoàn thành / Hủy | Must |
| FR03.02 | Lọc theo thời gian: Hôm nay/ Hôm qua/ 7 ngày qua/ 30 ngày qua/ Tuần này/ Tuần trước/ Tháng này/ Tháng trước/ Tuỳ chọn (component TimeFilter) | Must |
| FR03.03 | Lọc theo trạng thái thanh toán: Lọc theo trạng thái thanh toán: Đã thanh toán / Chưa thanh toán / Thanh toán một phần  | Should |
| FR03.04 | Lọc theo trạng thái HĐĐT: Đã phát hành / Chờ cấp mã / Chưa lập | Should |
| FR03.05 | Bottom sheet cho bộ lọc nâng cao (Advanced Filter) | Should |
| FR03.06 | Hiển thị số lượng filter đang áp dụng: "🗂 54 hoá đơn (3 bộ lọc)" | Should |

#### FR04 - Thao tác hàng loạt (Bulk Actions) - Chưa implement
| ID | Requirement | Priority |
|----|-------------|----------|
| FR04.01 | Long press vào Card để bật chế độ chọn nhiều | Should |
| FR04.02 | Checkbox xuất hiện ở góc trái mỗi Card khi ở chế độ chọn | Should |
| FR04.03 | Bottom action bar: [Ghi sổ] [Bỏ ghi] [Hủy] [In] [Chia sẻ] | Should |
| FR04.04 | Hiển thị số lượng đơn đã chọn: "Đã chọn 5 hoá đơn" | Should |
| FR04.05 | Validate: Chỉ cho phép bulk action trên các đơn cùng trạng thái | Should |
| FR04.06 | Hiển thị progress bar khi xử lý bulk action | Should |
| FR04.07 | Toast message thành công/thất bại cho từng đơn | Should |

### 2.4. API Endpoints

#### GET /sales/vouchers
**Query Parameters**:
```typescript
{
  page?: number;                    // Default: 1
  limit?: number;                   // Default: 20
  search?: string;                  // Keyword search
  status?: 'draft' | 'posted' | 'cancelled';
  paymentStatus?: 'paid' | 'unpaid' | 'partial';
  invoiceStatus?: 'published' | 'pending' | 'not_created';
  fromDate?: string;                // ISO 8601 format
  toDate?: string;                  // ISO 8601 format
  sortBy?: 'transactionDate' | 'totalAmount' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}
```

**Response**:
```typescript
{
  success: true,
  data: {
    items: SaleVoucher[];
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
  }
}
```

---

## 3. UC02 - NHẬP LIỆU HÓA ĐƠN BÁN HÀNG (TẠO ĐƠN MỚI)

### 3.1. Tổng quan
**Mục đích**: Cho phép người dùng tạo mới giao dịch bán hàng một cách nhanh chóng và chính xác.

**Route**: `/sales/orders/new`

**Screen**: SalesOrderCreateScreen

### 3.2. UI Components

#### 3.2.1. Header
```
┌──────────────────────────────────────────────────────────┐
│  [←]  Tạo hoá đơn bán hàng                    [Lưu]      │
└──────────────────────────────────────────────────────────┘
```
- **Title**: "Tạo hoá đơn bán hàng" - 18px, fontWeight 600
- **Save button**: 
  - Text: "Lưu" - 16px, fontWeight 600, color #FB7E00
  - Disabled state: color #D1D5DB

#### 3.2.2. Form Sections

**Section 1: Thông tin chung**
```
┌──────────────────────────────────────────────────────────┐
│  📋 Thông tin chung                                      │
│                                                          │
│  [📅 Ngày chứng từ]        [25/12/2024]                  │
│  [📅 Ngày hạch toán]       [25/12/2024]                  │
│                                                          │
└──────────────────────────────────────────────────────────┘
```
- Section title: 14px, fontWeight 600, color #212529
- Input field:
  - Height: 48px
  - Background: rgba(0,0,0,0.04)
  - Border radius: 12px
  - Label: 12px, color rgba(0,0,0,0.6)
  - Value: 14px, color #212529
  - Icon: 20px, color rgba(0,0,0,0.6)

**Section 2: Khách hàng**
```
┌──────────────────────────────────────────────────────────┐
│  👤 Thông tin khách hàng                     [+ Thêm]    │
│                                                          │
│  [🔍 Chọn khách hàng]                                    │
│                                                          │
│  ┌────────────────────────────────────────────────┐     │
│  │  👤 Nguyễn Văn A                               │     │
│  │  📞 0987654321                                 │     │
│  │  📍 123 Lê Lợi, Q1, TP.HCM                     │     │
│  │  🏢 MST: 0123456789                            │     │
│  └────────────────────────────────────────────────┘     │
└──────────────────────────────────────────────────────────┘
```
- **Add quick button**: 
  - Icon: `AddCircle` - 20px
  - Text: "Thêm" - 14px, fontWeight 500, color #FB7E00
- **Customer search**:
  - Autocomplete dropdown
  - Show recent customers
  - Highlight matching text
- **Customer info card**:
  - Background: rgba(251,126,0,0.05)
  - Border: 1px solid rgba(251,126,0,0.2)
  - Border radius: 12px
  - Padding: 12px

**Section 3: Giỏ hàng (Items)**
```
┌──────────────────────────────────────────────────────────┐
│  🛒 Hàng hoá dịch vụ                        [+ Thêm]     │
│                                                          │
│  ┌────────────────────────────────────────────────┐     │
│  │  📦 Sản phẩm A                          [✕]    │     │
│  │                                                │     │
│  │  SL: [2] ▾    Đơn giá: [150,000]              │     │
│  │                                                │     │
│  │  Chiết khấu: [0]đ    Thành tiền: 300,000đ     │     │
│  │                                                │     │
│  │  ⚠️ Tồn kho: 50 • Kho chính                    │     │
│  └────────────────────────────────────────────────┘     │
│                                                          │
│  [+ Thêm hàng hoá]                                       │
└──────────────────────────────────────────────────────────┘
```
- **Item card**:
  - Background: #FFFFFF
  - Border: 1px solid #E5E7EB
  - Border radius: 12px
  - Padding: 12px
  - Remove button: Icon `CloseCircle` - 20px, color #DC2626

- **Quantity input**:
  - Number input with stepper
  - Min: 1, Max: 999999
  - Default: 1

- **Price input**:
  - Currency format: ### ###đ
  - Editable inline

- **Discount row**:
  - Switch between % and fixed amount
  - Icon: `Percentage` or `MoneyBag`

- **Stock warning**:
  - Icon: `Warning2` - 16px, color #F59E0B
  - Text: "Tồn kho: X • Tên kho" - 12px, color #F59E0B
  - Red if quantity > available stock

**Section 4: Tóm tắt đơn hàng**
```
┌──────────────────────────────────────────────────────────┐
│  💰 Tổng tiền hàng                    1,200,000đ         │
│  🎁 Chiết khấu                           -50,000đ        │
│  📊 Thuế GTGT (10%)                     +115,000đ        │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│  💵 Tổng thanh toán                   1,265,000đ         │
└──────────────────────────────────────────────────────────┘
```
- **Row styling**:
  - Label: 14px, color rgba(0,0,0,0.6)
  - Value: 14px, fontWeight 600, right aligned
  - Discount: color #DC2626
  - Tax: color #059669
  - Divider: 1px solid #E5E7EB

- **Total row**:
  - Background: rgba(251,126,0,0.1)
  - Padding: 12px
  - Border radius: 8px
  - Label: 16px, fontWeight 600
  - Value: 20px, fontWeight 700, color #FB7E00

**Section 5: Thanh toán & Ghi chú**
```
┌──────────────────────────────────────────────────────────┐
│  💳 Thanh toán                                           │
│                                                          │
│  ○ Thanh toán ngay                                       │
│  ● Thanh toán sau (Ghi nợ)                               │
│                                                          │
│  [Nếu chọn "Thanh toán ngay"]                            │
│  ┌────────────────────────────────────────────────┐     │
│  │  Khách trả:     [1,300,000]đ                   │     │
│  │  Tiền thừa:         35,000đ                    │     │
│  │                                                │     │
│  │  Hình thức: [💵 Tiền mặt ▾]                    │     │
│  └────────────────────────────────────────────────┘     │
│                                                          │
│  📝 Ghi chú                                              │
│  [Nhập ghi chú cho đơn hàng...]                          │
│                                                          │
│  ☑ Lập phiếu xuất kho                                    │
│  ☑ Lập hoá đơn điện tử                                   │
└──────────────────────────────────────────────────────────┘
```
- **Radio buttons**:
  - Size: 20px
  - Active: border 2px #FB7E00, fill #FB7E00
  - Inactive: border 2px #D1D5DB

- **Payment detail card**:
  - Background: rgba(251,126,0,0.05)
  - Border radius: 12px
  - Padding: 16px

- **Customer paid input**:
  - Auto-format currency
  - Auto-fill with total amount
  - Calculate change automatically

- **Payment method dropdown**:
  - Options: Tiền mặt / Chuyển khoản / Thẻ
  - Icon for each method

- **Note textarea**:
  - Min height: 80px
  - Max length: 500 characters
  - Character counter

- **Checkboxes**:
  - Size: 20px
  - Checked: background #FB7E00, checkmark white
  - Label: 14px, color #212529

**Section 6: Đính kèm & Diễn giải (Attachments & Description)**
```
┌──────────────────────────────────────────────────────────┐
│  📎 Đính kèm tài liệu                                    │
│                                                          │
│  [Đính kèm file]  (Drag & drop hoặc chọn file)           │
│                                                          │
│  ┌────────────────────────────────────────────────┐     │
│  │  📄 delivery_note.pdf         1.2MB    [X] [Preview] │     │
│  │  🧾 contract.pdf              0.8MB    [X] [Preview] │     │
│  └────────────────────────────────────────────────┘     │
│                                                          │
│  Loại tài liệu: [Giao nhận ▾]  [Hợp đồng ▾] [Biên lai CK ▾] │
│                                                          │
│  📝 Diễn giải: [Bán hàng Nguyễn Văn A - #BH/2025/00123]   │
└──────────────────────────────────────────────────────────┘
```

- **Functionality**:
  - Nút `Đính kèm file`: hỗ trợ chọn file từ thiết bị và drag-&-drop.
  - Hiển thị danh sách file đã đính kèm với `fileName`, `size`, `mimeType`, nút `Preview` và `Xóa`.
  - Mỗi file có dropdown `Loại tài liệu` (Delivery Note, Contract, Payment Slip, Customer ID, Other) để người dùng phân loại.
  - `Preview`: mở modal hoặc trình preview native (PDF, image) - hỗ trợ download.
  - `Preview`: mở modal hoặc trình preview native (PDF, image) - hỗ trợ download.
  - Limit: tối đa 10 file, tối đa 5MB/file, tổng tối đa 50MB; loại file cho phép: `pdf`, `png`, `jpg`, `jpeg`, `docx`.
  - Hiển thị progress bar upload cho từng file.

- **Diễn giải (Description) field**:
  - Vị trí: nằm dưới phần Payment & Notes.
  - Giới hạn: max 500 ký tự.
  - Auto-fill: gợi ý nội dung "Bán hàng {Customer_name} - {OrderCode}"; có thể chỉnh sửa.
  - Nếu user chọn thu tiền (paymentType = pay_now), trường `Diễn giải` auto-fill thành "Thu tiền {OrderCode} - {Customer_name}" (configurable).
  - Trường này map vào `description` trong API request body và cũng được dùng làm `description` cho các chứng từ con (receipt, outward, invoice) khi cần.

- **Validation rules**:
  - Nếu `isSaleWithInvoice = true` và invoice cần tài liệu kèm theo (tenant policy): require ít nhất 1 file có `Loại tài liệu = Delivery Note` hoặc `Contract`.
  - File vượt quá limit size/type → hiển thị error inline và chặn hoàn thành.
  - Nếu total attachment size > 50MB → cảnh báo và chặn upload thêm.

### Acceptance Criteria - Attachments & Description

| Code | Title | Acceptance Criteria |
|------|-------|---------------------|
| AC01 | Cho phép user thêm tệp đính kèm bằng nhiều hình thức | • Khi user chọn đính kèm → hiển thị bottom sheet với 3 options: Chụp ảnh, Chọn ảnh từ thư viện, Tải file từ thiết bị. |
| AC02 | Chụp ảnh từ camera | • User chọn chụp ảnh → hiển thị modal permission yêu cầu truy cập camera. Nếu chọn "Cho phép" mở trình chụp ảnh; nếu chọn "Từ chối" quay về màn hoá đơn bán hàng. • Tại trình chụp ảnh, user có thể chọn "Hủy" hoặc "Chụp lại". Sau khi chụp ảnh hiển thị preview và user có 2 action: "Sử dụng ảnh" (lưu vào thư viện app + thêm vào danh sách đính kèm) hoặc "Chụp lại". |
| AC03 | Đính kèm tệp/ảnh từ thư viện thiết bị | • User chọn "Chọn ảnh từ thư viện" → hiển thị modal permission truy cập thư viện. Sau khi chọn ảnh/file, show preview và allow multiple selection. |
| AC04 | Hiển thị sau đính kèm tệp | • Hệ thống hiển thị thumbnail của tối đa 4 ảnh/file PDF. Nếu có >4, hiển thị +[N] (N = số lượng còn lại) ở thumbnail cuối cùng. • User chọn "xem tất cả" → mở màn hình danh sách tất cả file/ảnh được đính kèm trong HĐBH. |
| AC05 | Xem chi tiết file/ảnh đính kèm | • Có thể chạm vào thumbnail để mở preview chi tiết; với mỗi file có nút xóa; khi xem chi tiết có nút download/save.

### Edge Cases / Corner Cases

| Code | Title | Edge Cases / Handling |
|------|-------|-----------------------|
| CC01 | Chọn file/ảnh quá dung lượng cho phép | • Khi user đính kèm file > 5MB → hiển thị modal alert "Tệp đính kèm vượt quá 5MB. Vui lòng thử lại" và không upload file đó. |
| CC02 | User chưa cấp quyền truy cập camera/thư viện | • Hiển thị popup yêu cầu quyền: "Symper One muốn truy cập Camera/Thư viện." với các action "Từ chối" & "Cho phép". Nếu user chọn "Từ chối" → quay về màn hoá đơn bán hàng. |
| CC03 | Chặn thêm mới tệp khi vượt mức số lượng tối đa | • Hiển thị cảnh báo "Bạn chỉ có thể đính kèm tối đa 10 ảnh/file. Vui lòng bỏ bớt để tiếp tục" và chặn upload thêm file đó.

### UX Notes & Defaults

- Khi user mở màn hình "Tạo hoá đơn bán hàng":
  - Auto-fill `Diễn giải` mặc định: "Bán hàng + {customer_name}" (AC05). User có thể chỉnh sửa.
  - Nếu user chọn "Thanh toán ngay" thì `Diễn giải` gợi ý: "Thu tiền {OrderCode} - {Customer_name}".



#### 3.2.3. Bottom Action Bar
```
┌──────────────────────────────────────────────────────────┐
│  [Hủy]                                   [Hoàn thành]    │
└──────────────────────────────────────────────────────────┘
```
- **Container**:
  - Position: Sticky bottom
  - Height: 68px
  - Background: #FFFFFF
  - Shadow: 0px -2px 8px rgba(0,0,0,0.08)
  - Padding: 8px 16px

- **Cancel button**:
  - Background: transparent
  - Border: 1px solid #E5E7EB
  - Color: #6B7280
  - Height: 52px
  - Border radius: 12px
  - Font: 16px, fontWeight 600

- **Complete button**:
  - Background: #FB7E00
  - Color: #FFFFFF
  - Height: 52px
  - Border radius: 12px
  - Font: 16px, fontWeight 700
  - Disabled: background #D1D5DB, not clickable

### 3.3. Functional Requirements

#### FR05 - Thông tin chung & Khách hàng
| ID | Requirement | Priority |
|----|-------------|----------|
| FR05.01 | Tự động điền ngày chứng từ và ngày hạch toán là ngày hiện tại. Trường ngày hạch toán không hiển thị trên form nhập liệu của user | Must |
| FR05.02 | Cho phép chỉnh sửa ngày chứng từ (ngày chứng từ không được > ngày hiện tại)  | Must |
| FR05.03 | Date picker: Sử dụng component bottom sheet, Mobile-friendly, support swipe | Must |
| FR05.04 | Search khách hàng: Autocomplete, debounce 300ms. Tiêu chí tìm kiếm bao gồm: Mã khách, tên khách | Must |
| FR05.05 | Hiển thị danh sách tất cả các khách hàng trong danh mục với điều kiện trạng thái là đang hoạt động (Active) | Must |
| FR05.06 | "Thêm nhanh khách hàng": Mở màn mới với đầy đủ các trường thông tin của màn Thêm mới khách hàng | Must |
| FR05.07 | Validate MST khách hàng (10 hoặc 13 chữ số) | Must |
| FR05.08 | Hiển thị thông tin nhận diện: SĐT (cá nhân) hoặc MST (tổ chức) | Must |
| FR05.09 | Sau khi user chọn lưu, hệ thống gán thông tin khách hàng vừa thêm mới vào chi tiết Hoá đơn bán hàng (bỏ qua màn chọn danh sách Khách hàng)  | Must |
| FR05.10 | Cảnh báo khi rời trang nếu có thay đổi chưa lưu | Must |

#### FR06 - Xử lý Hàng hóa (Giỏ hàng)
| ID | Requirement | Priority |
|----|-------------|----------|
| FR06.01 | Search hàng hóa: autocomplete theo mã hoặc tên hàng hóa. Hiển thị card hàng hóa và tồn kho hiện tại tại tất cả các kho. | Must |
| FR06.02 | Hiển thị ảnh thumbnail hàng hóa (nếu không có thì hiển thị ảnh dạng placeholder image)  | Must |
| FR06.03 | Khi chọn hàng hóa vào giỏ, tự động điền tính chất, đơn giá bán, đơn vị tính, thuế, kho ngầm định (đã được config ở danh mục hàng hoá dịch vụ)  | Must |
| FR06.04 | Hiển thị số tồn kho khả dụng real-time theo từng kho được chọn | Must |
| FR06.05 | Cảnh báo màu đỏ nếu số lượng xuất > tồn kho | Must |
| FR06.06 | Cho phép xuất âm kho (warning) nếu hàng hoá đó đã config “Cho phép bán hàng âm” | Should |
| FR06.07 | "Thêm nhanh hàng hóa": Fullscreen form với đầy đủ các trường thông tin của màn hình Thêm mới hàng hóa dịch vụ | Should |
| FR06.08 | Swipe left để xóa hàng hóa khỏi giỏ | Must |
| FR06.09 | Tự động tính thành tiền = Số lượng * Đơn giá | Must |
| FR06.10 | Số lượng có nút +/- stepper, hỗ trợ nhập trực tiếp | Must |
| FR06.11 | Cho phép chỉnh sửa đơn giá và kho hàng (không ảnh hưởng đến giá trị mặc định tại danh mục hàng hóa) | Must |
| FR06.12 | Tự động format currency khi nhập giá | Must |

#### FR07 - Quản lý Giá & Chiết khấu
| ID | Requirement | Priority |
|----|-------------|----------|
| FR07.01 | Chiết khấu theo dòng: Cho phép nhập % hoặc số tiền | Must |
| FR07.02 | Chiết khấu theo dòng: Hiển thị trường thông tin %Chiết khấu và Tiền chiết khấu bằng cách bật toggle | Must |
| FR07.03 | Validate chiết khấu: Không vượt 100% hoặc > giá trị dòng | Must |
| FR07.04 | Chiết khấu tổng đơn: Bottom sheet Hình thức chiết khấu riêng  | Should |
| FR07.05 | Tự động phân bổ chiết khấu tổng vào từng dòng theo tỷ lệ | Should |
| FR07.06 | Hiển thị tooltip giải thích cách tính chiết khấu | Should |
| FR07.07 | Tự động tính lại tổng khi thay đổi chiết khấu | Must |

#### FR08 - Thanh toán & Công nợ
| ID | Requirement | Priority |
|----|-------------|----------|
| FR08.01 | Radio button: Thanh toán ngay / Thanh toán sau | Must |
| FR08.02 | Mặc định chọn "Thanh toán sau" | Must |
| FR08.03 | Khi chọn "Thanh toán ngay" hiển thị số tiền khách phải trả và hình thức thanh toán. Khi chọn hình thức thanh toán mở form (fullscreen) Thu tiền ngay cho phép nhập số tiền thu lần này và chọn hình thức thanh toán dạng radio button. | Must |
| FR08.04 | Tự động điền số tiền khách trả = Tổng thanh toán | Must |
| FR08.05 | Hiển thị công nợ còn lại nếu thanh toán một phần. Công nợ còn lại = Tổng tiền phải thu - Số tiền thu lần này | Must |
| FR08.06 | Chọn hình thức thanh toán: Tiền mặt / Chuyển khoản | Must |
| FR08.07 | Nếu chọn "Chuyển khoản": Hiển thị danh sách chọn TK ngân hàng (expand) | Must |

#### FR09 - Lưu & Hạch toán tự động
| ID | Requirement | Priority |
|----|-------------|----------|
| FR09.01 | Nút "Hủy": Hiện confirm dialog, không lưu gì | Must |
| FR09.02 | Nút "Hoàn thành": Disable khi chưa điền đầy đủ/sai format các trường bắt buộc. Enabled khi đã điền đầy đủ | Must |
| FR09.03 | Validation errors: Hiển thị inline ở từng trường | Must |
| FR09.04 | Loading indicator khi đang xử lý | Must |
| FR09.05 | Khi complete: Gọi API POST /sales/vouchers với `status=posted` | Must |
| FR09.06 | Backend tự động sinh Phiếu xuất kho nếu `isSaleWithOutward=true` | Must |
| FR09.07 | Backend tự động sinh Phiếu thu nếu `paymentType=pay_now` | Must |
| FR09.08 | Backend tự động sinh HĐĐT nháp nếu `isSaleWithInvoice=true` | Must |
| FR09.09 | Tự động trừ tồn kho real-time khi hoàn thành | Must |
| FR09.10 | Toast success: "Tạo hoá đơn thành công #BH/2025/00123" | Must |
| FR09.11 | Navigate sang màn chi tiết đơn hàng vừa tạo | Must |
| FR09.12 | Rollback toàn bộ nếu có lỗi phát sinh | Must |

### 3.4. API Endpoints

#### POST /sales/vouchers
**Request Body**:
```typescript
{
  transactionDate: string;              // ISO 8601
  postedDate: string;                   // ISO 8601
  accountObjectId: string;              // Customer ID
  paymentType: 'pay_now' | 'pay_later';
  paymentMethod?: 'cash' | 'bank_transfer' | 'card';
  bankAccountId?: string;               // If payment_method = bank_transfer
  isSaleWithOutward: boolean;           // Default: true
  isSaleWithInvoice: boolean;           // Default: false
  discountType: 'not_discount' | 'by_item' | 'by_invoice_amount' | 'by_percent';
  totalDiscountAmount?: number;
  discountRate?: number;
  description?: string;
  attachedFileIds?: string[];
  details: [
    {
      itemId: string;
      quantity: number;
      unitPrice: number;
      discountRate?: number;
      discountAmount?: number;
      vatRate: number;                  // Default: 10
      description?: string;
    }
  ];
  paymentDetail?: {                     // If paymentType = pay_now
    amountPaid: number;
    changeAmount: number;
  };
}
```

**Response**:
```typescript
{
  success: true,
  data: {
    saleVoucher: SaleVoucher;
    outwardVoucher?: OutwardVoucher;   // If isSaleWithOutward = true
    receiptVoucher?: ReceiptVoucher;   // If paymentType = pay_now
    invoice?: Invoice;                 // If isSaleWithInvoice = true (draft)
  }
}

### File upload API (Tải lên file đính kèm)

#### POST /files/uploads
**Description**: Upload file đính kèm (form-data). Trả về `fileId` dùng trong `attachedFileIds` của `POST /sales/vouchers`.

**Request (multipart/form-data)**:
```
file: File
documentType: 'delivery_note' | 'contract' | 'payment_slip' | 'customer_id' | 'other'
originalFileName?: string
tenantId: string
uploadedBy: string (userId)
```

**Response**:
```json
{
  "success": true,
  "data": {
    "fileId": "uuid",
    "fileName": "delivery_note.pdf",
    "mimeType": "application/pdf",
    "size": 1234567,
    "url": "https://cdn.symper.vn/files/xxx",
    "documentType": "delivery_note",
    "uploadedAt": "2026-01-20T10:00:00Z"
  }
}
```

**Validation (server)**:
- Chấp nhận `pdf`, `png`, `jpg`, `jpeg`, `docx`.
- Max file size = 10MB; max files per upload request = 10; tổng size tối đa cho 1 voucher = 50MB.
- Nếu upload thất bại trả lỗi kèm mã `FILE_UPLOAD_ERROR`.

**Notes**:
- Frontend phải upload file trước, nhận `fileId`, sau đó include `attachedFileIds` vào payload `POST /sales/vouchers`.
- `documentType` được dùng để map tài liệu khi in hóa đơn hoặc xuất báo cáo, và để kiểm tra bắt buộc khi phát hành HĐĐT.

```

---

## 4. UC03 - XEM CHI TIẾT HÓA ĐƠN BÁN HÀNG

### 4.1. Tổng quan
**Mục đích**: Cho phép xem lại thông tin đầy đủ và thực hiện các nghiệp vụ sau bán hàng.

**Route**: `/sales/orders/:id`

**Screen**: SalesOrderDetailScreen

### 4.2. UI Components

#### 4.2.1. Header với Action Menu
```
┌──────────────────────────────────────────────────────────┐
│  [←]  Hoá đơn bán hàng                      [⋮ More]     │
└──────────────────────────────────────────────────────────┘
```
- **More menu**: Bottom sheet với các action:
  - Sửa (chỉ hiện nếu status = draft)
  - Bỏ ghi (chỉ hiện nếu status = posted và chưa có chứng từ liên quan)
  - Hủy (chỉ hiện nếu status = posted)
  - In
  - Chia sẻ (Zalo / Email)
  - Xóa (chỉ hiện nếu status = draft)

#### 4.2.2. Order Header Card
```
┌──────────────────────────────────────────────────────────┐
│  🏪 #BH/2025/00123                      [Hoàn thành]     │
│  25/12/2024 • 14:30 • Nguyễn Văn A                       │
│                                                          │
│  Ngày hạch toán: 25/12/2024                              │
└──────────────────────────────────────────────────────────┘
```

#### 4.2.3. Customer Info Card
```
┌──────────────────────────────────────────────────────────┐
│  👤 Thông tin khách hàng                                 │
│                                                          │
│  Nguyễn Thị B                                            │
│  📞 0987654321                  [📞]                     │
│  📍 123 Lê Lợi, Q1, TP.HCM                               │
│  🏢 MST: 0123456789                                      │
└──────────────────────────────────────────────────────────┘
```
- Phone call button: Mở dialer với SĐT đã điền

#### 4.2.4. Items List
```
┌──────────────────────────────────────────────────────────┐
│  📦 Hàng hoá dịch vụ                                     │
│                                                          │
│  ┌────────────────────────────────────────────────┐     │
│  │  Sản phẩm A                                    │     │
│  │  2 x 150,000đ              CK: 10,000đ        │     │
│  │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │     │
│  │                            290,000đ            │     │
│  └────────────────────────────────────────────────┘     │
│                                                          │
│  ┌────────────────────────────────────────────────┐     │
│  │  Sản phẩm B                                    │     │
│  │  3 x 200,000đ              CK: 0đ             │     │
│  │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │     │
│  │                            600,000đ            │     │
│  └────────────────────────────────────────────────┘     │
└──────────────────────────────────────────────────────────┘
```

#### 4.2.5. Payment Summary
```
┌──────────────────────────────────────────────────────────┐
│  💰 Thông tin thanh toán                                 │
│                                                          │
│  ├─ Tổng tiền hàng              1,200,000đ               │
│  ├─ Chiết khấu                    -50,000đ               │
│  ├─ Thuế GTGT (10%)                 +115,000đ            │
│  └─ Tổng thanh toán             1,265,000đ               │
│                                                          │
│  💵 Đã thanh toán                1,265,000đ              │
│  💰 Trạng thái TT: [Đã thanh toán]                       │
│                                                          │
│  🔗 Phương thức: Tiền mặt                                │
└──────────────────────────────────────────────────────────┘
```

#### 4.2.6. Related Documents (Chứng từ liên quan)
```
┌──────────────────────────────────────────────────────────┐
│  🔗 Chứng từ liên quan                                   │
│                                                          │
│  📦 Phiếu xuất kho    #PX/2025/00078        [Xem]       │
│  💵 Phiếu thu         #PT/2025/00045        [Xem]       │
│  🧾 Hóa đơn GTGT      5AA04BJ73...          [Xem PDF]   │
└──────────────────────────────────────────────────────────┘
```
- Mỗi dòng là link clickable
- Phiếu xuất kho → `/inventory/outward-vouchers/:id`
- Phiếu thu → `/receipts/:id`
- Hóa đơn → `/invoices/:id` hoặc preview PDF

#### 4.2.7. Activity Log
```
┌──────────────────────────────────────────────────────────┐
│  📝 Lịch sử hoạt động                          [Xem tất cả] │
│                                                          │
│  ● Nguyễn Văn A đã tạo đơn hàng                          │
│    25/12/2024 14:30                                      │
│                                                          │
│  ● Hệ thống đã tự động ghi sổ                            │
│    25/12/2024 14:30                                      │
│                                                          │
│  ● Hệ thống đã tạo phiếu xuất kho #PX/2025/00078        │
│    25/12/2024 14:31                                      │
└──────────────────────────────────────────────────────────┘
```

### 4.3. Functional Requirements

#### FR10 - Hiển thị chi tiết
| ID | Requirement | Priority |
|----|-------------|----------|
| FR10.01 | Hiển thị đầy đủ thông tin đơn hàng ở chế độ read-only | Must |
| FR10.02 | Highlight status badge với màu sắc phù hợp | Must |
| FR10.03 | Hiển thị thông tin khách hàng với chip loại khách hàng và thông tin phụ (cá nhân: số điện thoại, tổ chức: mã số thuế)  | Must |
| FR10.04 | List items với đầy đủ hình ảnh, tên, mã hàng hóa, số lượng, đơn giá, chiết khấu, thành tiền  | Must |
| FR10.05 | Hiển thị summary với tổng tiền, chiết khấu, thuế, tổng TT | Must |
| FR10.06 | Hiển thị trạng thái thanh toán: Đã thanh toán / Chưa thanh toán / Thanh toán một phần  | Must |
| FR10.07 | Hiển thị trạng thái HĐĐT: Đã phát hành / Chờ cấp mã / Chưa lập | Must |
| FR10.08 | List chứng từ liên quan với link navigate | Must |
| FR10.09 | Activity log: Timeline với timestamp và user | Must |
| FR10.10 | Pull to refresh để cập nhật dữ liệu mới nhất | Should |

#### FR11 - Action Matrix (Ma trận thao tác)
| ID | Requirement | Priority |
|----|-------------|----------|
| FR11.01 | **Đơn Nháp**: Hiển thị 2 button Chỉnh sửa (secondary) và Ghi sổ (primary). Các action khác (xem thêm): [In] [Xóa] | Must |
| FR11.02 | **Đơn Hoàn thành**: Hiển thị 2 button Xem phiếu tính tiền (secondary) và Phát hành hóa đơn (primary). Các action khác (xem thêm): [Bỏ ghi] [Hủy] [In] [Chia sẻ] [Trả hàng] [Giảm giá hàng bán] [Xem hóa đơn nháp] | Must |
| FR11.03 | **Đơn đã có HĐĐT**: Hiển thị 2 button Xem phiếu tính tiền (secondary) và Xem hóa đơn (primary). Các action khác: [In] [Chia sẻ]  [Lập hóa đơn điều chỉnh] [Lập hóa đơn thay thế] | Must |
| FR11.04 | **Đơn Hủy**: Hiển thị button Khôi phục (primary) và Xóa (secondary) | Must |
| FR11.05 | Validate: Không cho phép Bỏ ghi nếu có chứng từ con đã ghi sổ | Must |
| FR11.06 | Validate: Không cho phép Hủy nếu đã phát hành HĐĐT | Must |
| FR11.07 | Confirm dialog trước khi thực hiện action quan trọng | Must |

#### FR12 - Tiện ích
| ID | Requirement | Priority |
|----|-------------|----------|
| FR12.01 | Nút "In": Generate PDF phiếu tính tiền và mở print dialog | Must |
| FR12.02 | Nút "Chia sẻ": Mở trình chia sẻ mặc định của thiết bị | Must |
| FR12.03 | Preview PDF trước khi in/gửi | Should |
| FR12.04 | Template PDF theo chuẩn doanh nghiệp (Logo, thông tin công ty) | Must |
| FR12.05 | Gửi Zalo: Open Zalo app với PDF attached | Should |

### 4.4. API Endpoints

#### GET /sales/vouchers/:id
**Response**:
```typescript
{
  success: true,
  data: {
    saleVoucher: SaleVoucher;
    relatedDocuments: {
      outwardVoucher?: OutwardVoucher;
      receiptVoucher?: ReceiptVoucher;
      invoice?: Invoice;
    };
    activityLog: Activity[];
  }
}
```

#### PUT /sales/vouchers/:id
**Request Body**: Same as POST /sales/vouchers

#### DELETE /sales/vouchers/:id
**Response**:
```typescript
{
  success: true,
  message: "Xóa hoá đơn #BH/2025/00123 thành công"
}
```

#### POST /sales/vouchers/:id/unpost
**Response**:
```typescript
{
  success: true,
  message: "Bỏ ghi hoá đơn #BH/2025/00123 thành công"
}
```

#### POST /sales/vouchers/:id/cancel
**Request Body**:
```typescript
{
  reason: string;  // Lý do hủy
}
```

**Response**:
```typescript
{
  success: true,
  message: "Hủy hoá đơn #BH/2025/00123 thành công!"
}
```

---

## 5. UC04 - NHẬP LIỆU PHIẾU TRẢ LẠI HÀNG BÁN (RETURN)

### 5.1. Tổng quan
**Mục đích**: Xử lý trường hợp khách trả lại hàng, hệ thống nhập lại kho và hoàn tiền.

**Route**: `/sales/orders/:id/return`

**Screen**: SalesReturnCreateScreen

### 5.2. Business Rules

| Rule | Description |
|------|-------------|
| BR06.01 | Chỉ cho phép tạo phiếu trả hàng từ đơn hàng đã "Hoàn thành" |
| BR06.02 | Dữ liệu hàng hóa pre-fill từ đơn gốc, không cho thêm mặt hàng ngoài đơn |
| BR06.03 | Số lượng trả <= Số lượng đã mua - Số lượng đã trả trước đó |
| BR06.04 | Giá trị trả = (Số lượng trả / Số lượng mua) * Giá trị đơn gốc |
| BR06.05 | Tự động tính lại chiết khấu, thuế theo tỷ lệ |
| BR06.06 | Tự động sinh Phiếu nhập kho để tăng tồn |
| BR06.07 | Tự động sinh Phiếu chi (nếu hoàn tiền) hoặc giảm công nợ |

### 5.3. UI Components

#### 5.3.1. Header
```
┌──────────────────────────────────────────────────────────┐
│  [←]  Trả hàng từ #BH/2025/00123            [Lưu]       │
└──────────────────────────────────────────────────────────┘
```

#### 5.3.2. Original Order Summary
```
┌──────────────────────────────────────────────────────────┐
│  🔗 Đơn hàng gốc: #BH/2025/00123                         │
│  👤 Nguyễn Văn A • 25/12/2024                            │
│  💰 Tổng đơn: 1,265,000đ                                 │
└──────────────────────────────────────────────────────────┘
```

#### 5.3.3. Return Items
```
┌──────────────────────────────────────────────────────────┐
│  ↩️ Hàng hoá trả lại                                     │
│                                                          │
│  ┌────────────────────────────────────────────────┐     │
│  │  ☑ Sản phẩm A                                  │     │
│  │                                                │     │
│  │  Đã mua: 2      SL trả: [1] ▾                 │     │
│  │  Đơn giá: 150,000đ    CK: 10,000đ             │     │
│  │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │     │
│  │  Tiền trả lại:                  145,000đ      │     │
│  └────────────────────────────────────────────────┘     │
│                                                          │
│  ┌────────────────────────────────────────────────┐     │
│  │  ☐ Sản phẩm B                                  │     │
│  │  Đã mua: 3      SL trả: -                     │     │
│  └────────────────────────────────────────────────┘     │
└──────────────────────────────────────────────────────────┘
```
- Checkbox để chọn mặt hàng muốn trả
- Disable các mặt hàng không thể trả (đã trả hết)
- SL trả: Number input với max = Số lượng khả dụng
- Tự động tính tiền trả lại theo tỷ lệ

#### 5.3.4. Return Summary
```
┌──────────────────────────────────────────────────────────┐
│  ↩️ Tổng trả lại                                         │
│                                                          │
│  Tổng tiền hàng trả:              145,000đ              │
│  Chiết khấu (tỷ lệ):               -7,250đ              │
│  Thuế GTGT (10%):                 -13,775đ              │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│  Tổng hoàn lại khách:             123,975đ              │
└──────────────────────────────────────────────────────────┘
```

#### 5.3.5. Refund Method
```
┌──────────────────────────────────────────────────────────┐
│  💵 Phương thức hoàn tiền                                │
│                                                          │
│  ○ Hoàn tiền mặt                                         │
│  ● Giảm trừ công nợ                                      │
│  ○ Chuyển khoản                                          │
│                                                          │
│  [Nếu chọn "Chuyển khoản"]                               │
│  ┌────────────────────────────────────────────────┐     │
│  │  TK ngân hàng: [Chọn tài khoản ▾]             │     │
│  │  Nội dung CK: Hoàn tiền đơn #BH/2025/00123    │     │
│  └────────────────────────────────────────────────┘     │
│                                                          │
│  📝 Lý do trả hàng                                       │
│  [Hàng lỗi / Không đúng mô tả / Khác...]                 │
└──────────────────────────────────────────────────────────┘
```

### 5.4. Functional Requirements

#### FR13 - Khởi tạo từ gốc
| ID | Requirement | Priority |
|----|-------------|----------|
| FR13.01 | Chỉ hiện nút "Trả hàng" nếu đơn ở trạng thái "Hoàn thành" | Must |
| FR13.02 | Pre-fill toàn bộ thông tin đơn gốc (khách, hàng hóa, giá) | Must |
| FR13.03 | Disable các mặt hàng đã trả hết (số lượng khả dụng = 0) | Must |
| FR13.04 | Không cho phép thêm mặt hàng ngoài đơn gốc | Must |
| FR13.05 | Validate: Ít nhất 1 mặt hàng được chọn để trả | Must |

#### FR14 - Xử lý Số lượng & Giá trị
| ID | Requirement | Priority |
|----|-------------|----------|
| FR14.01 | Số lượng trả: Min = 1, Max = Số lượng khả dụng | Must |
| FR14.02 | Tự động tính giá trị trả = SL trả * Đơn giá của đơn gốc  | Must |
| FR14.03 | Tự động tính tiền chiết khấu trả theo tỷ lệ | Must |
| FR14.04 | Tự động tính tiền thuế trả theo tỷ lệ | Must |
| FR14.05 | Real-time update tổng hoàn lại khi thay đổi SL | Must |
| FR14.06 | Hiển thị breakdown: Tiền hàng + CK + Thuế = Tổng hoàn | Must |

#### FR15 - Hạch toán Trả hàng
| ID | Requirement | Priority |
|----|-------------|----------|
| FR15.01 | Khi hoàn thành: Gọi API POST /sales/return-vouchers | Must |
| FR15.02 | Backend tự động sinh Phiếu nhập kho (tăng tồn) | Must |
| FR15.03 | Backend tự động sinh Phiếu chi/Ủy nhiệm chi (nếu chọn hoàn tiền mặt/ chuyển khoản)  | Must |
| FR15.05 | Backend tự động cập nhật bút toán doanh thu và giá vốn | Must |
| FR15.08 | Link reference giữa Phiếu trả hàng và Đơn gốc | Must |
| FR15.09 | Toast success: "Tạo phiếu trả hàng thành công #TH/2025/00001" | Must |
| FR15.10 | Navigate sang màn chi tiết phiếu trả hàng | Must |

### 5.5. API Endpoints

#### POST /sales/return-vouchers
**Request Body**:
```typescript
{
  saleVoucherRefId: string;         // ID đơn gốc
  transactionDate: string;          // ISO 8601
  postedDate: string;               // ISO 8601
  refundMethod: 'cash' | 'debt_deduction' | 'bank_transfer';
  bankAccountId?: string;           // If refundMethod = bank_transfer
  reason: string;                   // Lý do trả hàng
  description?: string;
  details: [
    {
      itemId: string;
      quantityReturned: number;     // Số lượng trả
      unitPrice: number;            // Đơn giá gốc
      discountRate: number;         // CK gốc
      discountAmount: number;
      vatRate: number;
      returnAmount: number;         // Tiền hoàn lại
    }
  ];
}
```

**Response**:
```typescript
{
  success: true,
  data: {
    returnVoucher: ReturnVoucher;
    inwardVoucher: InwardVoucher;   // Phiếu nhập kho
    paymentVoucher?: PaymentVoucher; // Phiếu chi (nếu hoàn tiền)
    saleVoucherUpdated: SaleVoucher; // Đơn gốc đã update trạng thái
  }
}
```

---

## 6. UC05 - NHẬP LIỆU PHIẾU GIẢM GIÁ HÀNG BÁN (DISCOUNT)

### 6.1. Tổng quan
**Mục đích**: Xử lý trường hợp giảm tiền cho khách (hàng lỗi nhẹ, khuyến mãi sau) nhưng khách KHÔNG trả lại hàng.

**Route**: `/sales/orders/:id/discount`

**Screen**: SalesDiscountCreateScreen

### 6.2. Business Rules

| Rule | Description |
|------|-------------|
| BR07.01 | Chỉ áp dụng cho đơn hàng đã "Hoàn thành" |
| BR07.02 | KHÔNG sinh Phiếu nhập kho (hàng vẫn ở chỗ khách) |
| BR07.03 | Cho phép giảm đơn giá hoặc giảm thành tiền cho từng mặt hàng |
| BR07.04 | Tổng giảm giá <= Giá trị đơn hàng gốc |
| BR07.05 | Hạch toán: Ghi giảm doanh thu (Nợ TK 521 - Có TK 511) |
| BR07.06 | Hạch toán: Ghi giảm thuế đầu ra tương ứng |
| BR07.07 | KHÔNG cập nhật bút toán giá vốn (hàng không về kho)  |
| BR07.08 | Nếu hoàn tiền: Tự động sinh Phiếu chi hoặc Uỷ nhiệm chi |

### 6.3. UI Components

UI tương tự UC04 (Trả hàng) nhưng có một số điểm khác:

#### 6.3.1. Header
```
┌──────────────────────────────────────────────────────────┐
│  [←]  Giảm giá từ #BH/2025/00123            [Lưu]       │
└──────────────────────────────────────────────────────────┘
```

#### 6.3.2. Discount Items
```
┌──────────────────────────────────────────────────────────┐
│  🎁 Hàng hoá được giảm giá                               │
│                                                          │
│  ┌────────────────────────────────────────────────┐     │
│  │  ☑ Sản phẩm A                                  │     │
│  │                                                │     │
│  │  Đơn giá gốc: 150,000đ                        │     │
│  │                                                │     │
│  │  [Đơn giá giảm]  [Thành tiền giảm]            │     │
│  │                                                │     │
│  │  Đơn giá giảm: [120,000]đ                     │     │
│  │  Số lượng: 2                                   │     │
│  │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │     │
│  │  Tiền giảm:                     60,000đ       │     │
│  └────────────────────────────────────────────────┘     │
└──────────────────────────────────────────────────────────┘
```
- Tab switch: "Đơn giá giảm" / "Thành tiền giảm"
- Nếu chọn "Đơn giá giảm": Nhập đơn giá mới (< đơn giá gốc)
- Nếu chọn "Thành tiền giảm": Nhập số tiền giảm trực tiếp

#### 6.3.3. Discount Summary
```
┌──────────────────────────────────────────────────────────┐
│  🎁 Tổng giảm giá                                        │
│                                                          │
│  Tổng tiền hàng giảm:              60,000đ              │
│  Thuế GTGT giảm (10%):             -5,454đ              │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│  Tổng hoàn lại khách:              54,546đ              │
└──────────────────────────────────────────────────────────┘
```

### 6.4. Functional Requirements

#### FR16 - Khác biệt với Trả hàng
| ID | Requirement | Priority |
|----|-------------|----------|
| FR16.01 | Không có checkbox chọn hàng, chỉ nhập số tiền giảm | Must |
| FR16.02 | Không sinh Phiếu nhập kho | Must |

#### FR17 - Tính toán giảm giá
| ID | Requirement | Priority |
|----|-------------|----------|
| FR17.01 | Cho phép nhập "Đơn giá giảm" hoặc "Thành tiền giảm" | Must |
| FR17.02 | Validate: Đơn giá giảm < Đơn giá gốc | Must |
| FR17.03 | Validate: Thành tiền giảm <= Thành tiền gốc | Must |
| FR17.04 | Tự động tính tổng giảm giá và thuế giảm tương ứng | Must |
| FR17.05 | Real-time update khi thay đổi giá trị giảm | Must |

### 6.5. API Endpoints

#### POST /sales/discount-vouchers
**Request Body**:
```typescript
{
  saleVoucherRefId: string;
  transactionDate: string;
  postedDate: string;
  refundMethod: 'cash' | 'debt_deduction' | 'bank_transfer';
  bankAccountId?: string;
  reason: string;
  description?: string;
  details: [
    {
      itemId: string;
      discountType: 'by_unit_price' | 'by_amount';
      discountedUnitPrice?: number;   // If discountType = by_unit_price
      discountedAmount?: number;      // If discountType = by_amount
      quantity: number;               // Số lượng áp dụng giảm
      totalDiscountAmount: number;    // Tổng tiền giảm
      vatRate: number;
    }
  ];
}
```

**Response**:
```typescript
{
  success: true,
  data: {
    discountVoucher: DiscountVoucher;
    paymentVoucher?: PaymentVoucher;  // Phiếu chi (nếu hoàn tiền)
    saleVoucherUpdated: SaleVoucher;  // Đơn gốc đã update
  }
}
```

---

## 7. UC06 - PHÁT HÀNH HÓA ĐƠN ĐIỆN TỬ (E-INVOICE)

### 7.1. Tổng quan
**Mục đích**: Kết nối với nhà cung cấp dịch vụ hóa đơn (TVAN) để phát hành hóa đơn đỏ theo quy định.

**Route**: `/sales/orders/:id/e-invoice`

**Screen**: EInvoicePublishScreen

### 7.2. Business Rules

| Rule | Description |
|------|-------------|
| BR08.01 | Chỉ phát hành HĐĐT cho đơn hàng đã "Hoàn thành" |
| BR08.02 | Đơn hàng chưa từng phát hành HĐĐT trước đó |
| BR08.03 | Bắt buộc có đầy đủ: MST người mua, Tên công ty, Địa chỉ |
| BR08.04 | Validate MST: 10 hoặc 13 chữ số |
| BR08.05 | Tạo file XML theo chuẩn Tổng cục Thuế (TT78/2021) (làm sau) |
| BR08.06 | Ký số bằng USB Token hoặc HSM |
| BR08.07 | Gửi lên CQT qua TVAN (vd: VNPT, Viettel, Meinvoice) |
| BR08.08 | Cập nhật trạng thái: Chờ cấp mã → Đã cấp mã / Từ chối |
| BR08.09 | Lưu số hóa đơn, mã CQT, lookup code |

### 7.3. UI Components

#### 7.3.1. Invoice Preview Card
```
┌──────────────────────────────────────────────────────────┐
│  🧾 Xem trước hóa đơn                       [Preview PDF]│
│                                                          │
│  Mẫu số: 01GTKT0/001                                     │
│  Ký hiệu: AA/24E                                         │
│  Số: 0000123 (Tự động)                                   │
│                                                          │
│  ┌────────────────────────────────────────────────┐     │
│  │  Đơn vị bán hàng:                              │     │
│  │  CÔNG TY TNHH ABC                              │     │
│  │  MST: 0123456789                               │     │
│  │  Địa chỉ: 123 Nguyễn Huệ, Q1, TP.HCM          │     │
│  └────────────────────────────────────────────────┘     │
│                                                          │
│  ┌────────────────────────────────────────────────┐     │
│  │  Người mua hàng:                               │     │
│  │  Nguyễn Văn A                                  │     │
│  │  MST: 0987654321                               │     │
│  │  Địa chỉ: 456 Lê Lợi, Q1, TP.HCM              │     │
│  └────────────────────────────────────────────────┘     │
│                                                          │
│  📦 Danh sách hàng hóa                                   │
│  ...                                                     │
│                                                          │
│  💰 Tổng thanh toán: 1,265,000đ                          │
└──────────────────────────────────────────────────────────┘
```

#### 7.3.2. Digital Signature Section
```
┌──────────────────────────────────────────────────────────┐
│  🔐 Chữ ký số                                            │
│                                                          │
│  [Chọn chữ ký số ▾]                                      │
│  • USB Token: VIETTEL-CA (Nguyễn Văn A)                 │
│  • HSM: VNPT-CA (CÔNG TY ABC)                            │
│                                                          │
│  ⚠️ Đảm bảo USB Token đã cắm và cài driver               │
└──────────────────────────────────────────────────────────┘
```

#### 7.3.3. Publish Button
```
┌──────────────────────────────────────────────────────────┐
│  [Hủy]                               [Phát hành hóa đơn] │
└──────────────────────────────────────────────────────────┘
```

### 7.4. Functional Requirements

#### FR18 - Điều kiện phát hành
| ID | Requirement | Priority |
|----|-------------|----------|
| FR18.01 | Validate trạng thái đơn hàng = "Hoàn thành" | Must |
| FR18.02 | Validate chưa từng phát hành HĐĐT | Must |
| FR18.03 | Validate đầy đủ thông tin người mua (MST, Tên, Địa chỉ) | Must |

#### FR19 - Xem nháp (Preview)
| ID | Requirement | Priority |
|----|-------------|----------|
| FR19.01 | Nút "Xem hoá đơn nháp": Tạo file PDF nháp với watermark "BẢN NHÁP"  | Must |
| FR19.02 | PDF hiển thị đầy đủ: Logo, Thông tin DN, Khách, Hàng hóa, Tổng tiền | Must |
| FR19.03 | Format số tiền: ### ### ### VNĐ | Must |
| FR19.04 | Format ngày: DD/MM/YYYY | Must |
| FR19.05 | QR code placeholder (chưa có mã CQT) | Should |
| FR19.06 | Cho phép zoom in/out, download, chia sẻ PDF nháp  | Must |

#### FR20 - Ký số & Phát hành
| ID | Requirement | Priority |
|----|-------------|----------|
| FR20.01 | Cho phép chọn chứng thư số (HSM)  | Must |
| FR20.04 | Loading indicator: "Đang ký số..." | Must |
| FR20.05 | Gọi API POST /invoices/:id/sign với cert info | Must |
| FR20.06 | Backend tạo file XML, ký XML bằng cert | Must |
| FR20.07 | Backend gửi XML lên TVAN qua API | Must |
| FR20.08 | Poll status từ TVAN: Chờ cấp mã (pending) | Must |
| FR20.09 | Cập nhật trạng thái: Đã cấp mã (success) hoặc Từ chối (failed) | Must |
| FR20.10 | Lưu số HĐĐT, mã CQT, lookup code vào database | Must |
| FR20.11 | Toast success: "Phát hành hóa đơn thành công. Số: 0000123" | Must |
| FR20.12 | Navigate sang màn xem PDF HĐĐT đã phát hành | Must |

#### FR21 - Xử lý sai sót
| ID | Requirement | Priority |
|----|-------------|----------|
| FR21.01 | Nếu HĐĐT đã phát hành: Ẩn nút "Sửa" ở màn chi tiết đơn | Must |
| FR21.02 | Hiển thị nút "Yêu cầu điều chỉnh" thay vì "Sửa" | Must |
| FR21.03 | Click "Yêu cầu điều chỉnh": Navigate sang màn lập Hóa đơn điều chỉnh | Must |
| FR21.04 | Hóa đơn điều chỉnh tham chiếu đến HĐĐT gốc | Must |
| FR21.05 | Cập nhật trạng thái HĐĐT gốc: "Đã điều chỉnh" | Must |
| FR21.06 | Hiển thị thông báo: "Hóa đơn đã phát hành không thể sửa trực tiếp" | Must |

### 7.5. API Endpoints

#### POST /invoices
**Request Body**:
```typescript
{
  saleVoucherRefId: string;
  invoiceForm: string;          // Mẫu số: 01GTKT0/001
  invoiceSerial: string;        // Ký hiệu: AA/24E
  sellerInfo: {
    name: string;
    taxCode: string;
    address: string;
    phone?: string;
    email?: string;
  };
  buyerInfo: {
    name: string;
    taxCode?: string;
    address?: string;
    phone?: string;
    email?: string;
  };
  details: [
    {
      itemName: string;
      unit: string;
      quantity: number;
      unitPrice: number;
      amount: number;
      vatRate: number;
      vatAmount: number;
    }
  ];
  totalAmount: number;
  totalVatAmount: number;
  totalPayment: number;
}
```

#### POST /invoices/:id/sign
**Request Body**:
```typescript
{
  certificateType: 'usb_token' | 'hsm';
  certificateInfo: {
    serialNumber: string;
    issuer: string;
    validFrom: string;
    validTo: string;
  };
  pin?: string;  // PIN for USB Token
}
```

**Response**:
```typescript
{
  success: true,
  data: {
    invoice: Invoice;
    xmlSigned: string;        // Base64 XML đã ký
    status: 'pending';        // Chờ CQT cấp mã
  }
}
```

#### POST /invoices/:id/publish
**Description**: Gửi hóa đơn lên CQT qua TVAN

**Response**:
```typescript
{
  success: true,
  data: {
    invoice: Invoice;
    status: 'published';
    invoiceNo: '0000123';
    cqtCode: '5AA04BJ73WER...';
    lookupCode: 'ABC123XYZ';
    publishedAt: '2024-12-25T14:35:00Z';
  }
}
```

#### GET /invoices/:id/status
**Description**: Poll trạng thái HĐĐT từ TVAN

**Response**:
```typescript
{
  success: true,
  data: {
    status: 'pending' | 'published' | 'rejected';
    message?: string;         // Lý do từ chối (nếu có)
  }
}
```

---

## 8. UC07 - THU TIỀN HÀNG CHƯA THANH TOÁN (DEBT COLLECTION)

### 8.1. Tổng quan
**Mục đích**: Xử lý công nợ cho các đơn hàng bán chịu ("Thanh toán sau").

**Route**: `/sales/orders/:id/collect`

**Screen**: DebtCollectionScreen

### 8.2. Business Rules

| Rule | Description |
|------|-------------|
| BR09.01 | Chỉ áp dụng cho đơn có trạng thái TT: "Chưa thanh toán" hoặc "TT một phần" |
| BR09.02 | Số tiền thu <= Số tiền còn nợ |
| BR09.03 | Tự động sinh Phiếu thu gắn với đơn hàng này |
| BR09.04 | Cập nhật trạng thái thanh toán ngay lập tức |
| BR09.05 | Hạch toán: Nợ TK 111/112 (Tiền) - Có TK 131 (Công nợ) |

### 8.3. UI Components

#### 8.3.1. Debt Summary Card
```
┌──────────────────────────────────────────────────────────┐
│  💰 Thông tin công nợ                                    │
│                                                          │
│  Tổng giá trị đơn:           1,265,000đ                 │
│  Đã thanh toán:                      0đ                  │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│  Còn nợ:                     1,265,000đ                  │
└──────────────────────────────────────────────────────────┘
```

#### 8.3.2. Collection Form
```
┌──────────────────────────────────────────────────────────┐
│  💵 Thu tiền                                             │
│                                                          │
│  [Số tiền thu]                                           │
│  [1,265,000]đ                                            │
│                                                          │
│  [Phương thức thanh toán ▾]                              │
│  • 💵 Tiền mặt                                           │
│  • 🏦 Chuyển khoản                                       │
│  • 💳 Thẻ                                                │
│                                                          │
│  [Nếu chọn "Chuyển khoản"]                               │
│  ┌────────────────────────────────────────────────┐     │
│  │  Tài khoản nhận: [Chọn TK ▾]                   │     │
│  │  Ngày nhận: [25/12/2024]                       │     │
│  └────────────────────────────────────────────────┘     │
│                                                          │
│  📝 Ghi chú                                              │
│  [Thu tiền đơn #BH/2025/00123]                           │
└──────────────────────────────────────────────────────────┘
```

#### 8.3.3. Quick Amount Buttons
```
┌──────────────────────────────────────────────────────────┐
│  [100K]  [500K]  [1M]  [Toàn bộ]                         │
└──────────────────────────────────────────────────────────┘
```

### 8.4. Functional Requirements

#### FR22 - Thu tiền tại đơn
| ID | Requirement | Priority |
|----|-------------|----------|
| FR22.01 | Nút "Thu tiền" xuất hiện khi trạng thái thanh toán = "Chưa thanh toán" hoặc "Thanh toán 1 phần"  | Must |
| FR22.02 | Hiển thị tổng giá trị, đã thanh toán, còn nợ  | Must |
| FR22.03 | Input số tiền thu: Auto-format currency, max = Số tiền còn nợ | Must |
| FR22.05 | Cho phép chọn phương thức: Tiền mặt / Chuyển khoản | Must |
| FR22.06 | Nếu CK: Cho phép chọn TK ngân hàng nhận tiền | Must |
| FR22.07 | Date picker: Ngày nhận tiền (mặc định hôm nay) | Must |
| FR22.08 | Diễn giải auto-fill: "Thu tiền bán hàng + {Customer_name} | Must |
| FR22.09 | Validate: Số tiền thu > 0 và <= Số tiền còn nợ | Must |

#### FR23 - Cập nhật tự động
| ID | Requirement | Priority |
|----|-------------|----------|
| FR23.01 | Khi hoàn thành: Gọi API POST /receipts | Must |
| FR23.02 | Backend tự động sinh Phiếu thu gắn với đơn hàng | Must |
| FR23.03 | Backend cập nhật trạng thái thanh toán của đơn: "Đã Thanh toán" hoặc "Thanh toán 1 phần"  | Must |
| FR23.04 | Backend hạch toán: Nợ TK 111/112 - Có TK 131 | Must |
| FR23.05 | Real-time update số tiền còn nợ trên UI | Must |
| FR23.06 | Toast success: "Thu tiền thành công. Phiếu thu #PT/2025/00045" | Must |
| FR23.07 | Hiển thị badge "Đã thanh toán" nếu thu hết | Must |
| FR23.08 | Thêm Phiếu thu vào section "Chứng từ liên quan" | Must |
| FR23.09 | Activity log: "Đã thu tiền 1,265,000đ - 25/12/2024" | Must |

### 8.5. API Endpoints

#### POST /sales/receipt-vouchers
**Request Body**:
```typescript
{
  saleVoucherRefId: string;
  transactionDate: string;      // ISO 8601
  postedDate: string;
  accountObjectId: string;      // Customer ID
  paymentMethod: 'cash' | 'bank_transfer' | 'card';
  bankAccountId?: string;       // If payment_method = bank_transfer
  amountReceived: number;
  description?: string;
  details: [
    {
      debitAccountId: string;   // TK Nợ (111/112)
      creditAccountId: string;  // TK Có (131)
      amount: number;
      description?: string;
    }
  ];
}
```

**Response**:
```typescript
{
  success: true,
  data: {
    receiptVoucher: ReceiptVoucher;
    saleVoucherUpdated: SaleVoucher;  // Trạng thái TT đã update
    remainingDebt: number;            // Công nợ còn lại
  }
}
```

---

## 9. PERMISSIONS & ROLES

### 9.1. Permission Matrix

| Action | Owner | Admin | Accountant | Salesperson | Viewer |
|--------|-------|-------|------------|-------------|--------|
| Xem danh sách đơn hàng | ✅ | ✅ | ✅ | ✅ | ✅ |
| Tạo đơn hàng mới | ✅ | ✅ | ✅ | ✅ | ❌ |
| Sửa đơn (Nháp) | ✅ | ✅ | ✅ | ✅ | ❌ |
| Xóa đơn (Nháp) | ✅ | ✅ | ✅ | ❌ | ❌ |
| Hoàn thành đơn (Ghi sổ) | ✅ | ✅ | ✅ | ❌ | ❌ |
| Bỏ ghi đơn | ✅ | ✅ | ✅ | ❌ | ❌ |
| Hủy đơn | ✅ | ✅ | ❌ | ❌ | ❌ |
| Tạo phiếu trả hàng | ✅ | ✅ | ✅ | ❌ | ❌ |
| Tạo phiếu giảm giá | ✅ | ✅ | ✅ | ❌ | ❌ |
| Phát hành HĐĐT | ✅ | ✅ | ✅ | ❌ | ❌ |
| Thu tiền công nợ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Xuất báo cáo | ✅ | ✅ | ✅ | ✅ | ❌ |

### 9.2. Row Level Security (RLS)

- User chỉ xem được đơn hàng thuộc tenant của mình
- Filter theo `tenant_id` trong mọi query
- Không cho phép cross-tenant data access

---

## 10. NOTIFICATIONS & ALERTS

### 10.1. Real-time Notifications

| Event | Notification | Recipients |
|-------|-------------|------------|
| Đơn hàng mới | "Đơn hàng #BH/2025/00123 vừa được tạo" | Owner, Admin |
| Đơn hàng hoàn thành | "Đơn hàng #BH/2025/00123 đã hoàn thành" | Salesperson, Accountant |
| Tồn kho thấp | "Cảnh báo: Sản phẩm A sắp hết hàng (còn 5)" | Owner, Admin |
| HĐĐT thành công | "Hóa đơn 0000123 đã phát hành thành công" | Accountant, Customer (Email) |
| HĐĐT thất bại | "Lỗi phát hành hóa đơn: [Lý do]" | Accountant |
| Đã thu tiền | "Đã thu 1,265,000đ từ Nguyễn Văn A" | Owner, Admin |

### 10.2. Email Templates

- **Email xác nhận đơn hàng**: Gửi cho khách sau khi tạo đơn
- **Email hóa đơn điện tử**: Đính kèm PDF HĐĐT
- **Email nhắc nợ**: Gửi tự động khi đến hạn thanh toán

---

## 11. REPORTS & ANALYTICS

### 11.1. Sales Dashboard

- **Doanh thu hôm nay**: Tổng doanh thu các đơn đã hoàn thành
- **Đơn hàng chờ xử lý**: Số lượng đơn ở trạng thái Nháp
- **Công nợ**: Tổng công nợ khách hàng (chưa TT + TT 1 phần)
- **Top sản phẩm bán chạy**: 10 sản phẩm có doanh thu cao nhất
- **Biểu đồ doanh thu**: Line chart theo ngày/tuần/tháng

### 11.2. Export Reports

- **Báo cáo doanh thu**: Excel/PDF theo khoảng thời gian
- **Báo cáo công nợ**: Danh sách khách hàng còn nợ
- **Báo cáo hàng bán**: Theo sản phẩm, khách hàng, nhân viên

---

## 12. ERROR HANDLING & VALIDATION

### 12.1. Common Errors

| Error Code | Message | Resolution |
|------------|---------|------------|
| SALE_001 | Không tìm thấy đơn hàng | Kiểm tra lại ID |
| SALE_002 | Đơn hàng không thể sửa (đã ghi sổ) | Bỏ ghi trước khi sửa |
| SALE_003 | Số lượng xuất vượt quá tồn kho | Giảm số lượng hoặc nhập thêm hàng |
| SALE_004 | Chiết khấu vượt quá giá trị đơn | Nhập lại chiết khấu |
| SALE_005 | Thông tin khách hàng không hợp lệ | Cập nhật thông tin khách |
| SALE_006 | Không thể hủy đơn đã phát hành HĐĐT | Lập hóa đơn điều chỉnh |
| SALE_007 | Số tiền thu vượt quá công nợ | Kiểm tra lại số tiền |
| SALE_008 | Phát hành HĐĐT thất bại | Kiểm tra kết nối TVAN |

### 12.2. Validation Rules

- **Số điện thoại**: Regex `/^0[0-9]{9}$/`
- **MST**: Regex `/^[0-9]{10}$|^[0-9]{13}$/`
- **Email**: Regex `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
- **Số tiền**: Min = 0, Max = 999,999,999,999
- **Số lượng**: Min = 1, Max = 999,999

---

## 13. PERFORMANCE REQUIREMENTS

### 13.1. Response Time

- **Tải danh sách (20 items)**: < 500ms
- **Tạo đơn hàng mới**: < 1s
- **Hoàn thành đơn (với tích hợp)**: < 3s
- **Phát hành HĐĐT**: < 5s (chờ TVAN response)
- **Search/Filter**: < 300ms

### 13.2. Optimization

- **Lazy load**: Chỉ tải 20 đơn hàng/lần
- **Debounce search**: 500ms
- **Image optimization**: Resize thumbnail 100x100px
- **Cache**: Redis cho danh sách khách hàng, hàng hóa thường dùng
- **Indexing**: Index trên `tenant_id`, `transaction_date`, `status`

---

## 14. MOBILE-FIRST DESIGN PRINCIPLES

### 14.1. Touch Targets

- **Minimum size**: 44x44px (iOS) / 48x48px (Android)
- **Spacing**: 8px between interactive elements
- **Button**: Height 52px, Border radius 12px

### 14.2. Typography Scale

- **H1 (Page Title)**: 24px, fontWeight 700
- **H2 (Section Title)**: 18px, fontWeight 600
- **H3 (Card Title)**: 16px, fontWeight 600
- **Body**: 14px, fontWeight 400
- **Small**: 12px, fontWeight 400
- **Caption**: 11px, fontWeight 400

### 14.3. Color Palette

- **Primary**: #FB7E00 (Orange)
- **Primary Dark**: #BA5C00
- **Success**: #059669 (Green)
- **Error**: #DC2626 (Red)
- **Warning**: #F59E0B (Yellow)
- **Info**: #3B82F6 (Blue)
- **Neutral**: 
  - 900: #212529
  - 700: #495057
  - 500: #6C757D
  - 300: #ADB5BD
  - 100: #E9ECEF
  - 50: #F8F9FA

### 14.4. Spacing Scale

- **xs**: 4px
- **sm**: 8px
- **md**: 12px
- **lg**: 16px
- **xl**: 24px
- **2xl**: 32px
- **3xl**: 48px

---

## 15. TECHNICAL IMPLEMENTATION NOTES

### 15.1. State Management

```typescript
// Zustand store for Sales module
interface SalesStore {
  orders: SaleVoucher[];
  currentOrder: SaleVoucher | null;
  filters: SalesFilters;
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchOrders: (filters?: SalesFilters) => Promise<void>;
  createOrder: (data: CreateSaleVoucherDto) => Promise<SaleVoucher>;
  updateOrder: (id: string, data: UpdateSaleVoucherDto) => Promise<SaleVoucher>;
  deleteOrder: (id: string) => Promise<void>;
  postOrder: (id: string) => Promise<void>;
  unpostOrder: (id: string) => Promise<void>;
  cancelOrder: (id: string, reason: string) => Promise<void>;
}
```

### 15.2. API Client

```typescript
// React Query hooks
export const useSalesOrders = (filters?: SalesFilters) => {
  return useInfiniteQuery({
    queryKey: ['sales-orders', filters],
    queryFn: ({ pageParam = 1 }) => 
      apiClient.get('/sales/vouchers', { params: { page: pageParam, ...filters } }),
    getNextPageParam: (lastPage) => lastPage.hasMore ? lastPage.page + 1 : undefined,
  });
};

export const useCreateSalesOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateSaleVoucherDto) => 
      apiClient.post('/sales/vouchers', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales-orders'] });
    },
  });
};
```

### 15.3. Form Validation (Zod)

```typescript
const saleVoucherSchema = z.object({
  transactionDate: z.date(),
  postedDate: z.date(),
  accountObjectId: z.string().uuid(),
  paymentType: z.enum(['pay_now', 'pay_later']),
  paymentMethod: z.enum(['cash', 'bank_transfer', 'card']).optional(),
  details: z.array(z.object({
    itemId: z.string().uuid(),
    quantity: z.number().min(1).max(999999),
    unitPrice: z.number().min(0),
    discountRate: z.number().min(0).max(100).optional(),
    discountAmount: z.number().min(0).optional(),
  })).min(1, 'Phải có ít nhất 1 mặt hàng'),
});
```

---

## 16. TESTING REQUIREMENTS

### 16.1. Unit Tests

- Validate form inputs (Zod schema)
- Calculate discount/tax/total
- Format currency/date
- Generate voucher code

### 16.2. Integration Tests

- Create sale voucher with outward voucher
- Create sale voucher with receipt
- Return voucher flow
- Discount voucher flow
- E-invoice publish flow

### 16.3. E2E Tests (Playwright)

- User creates new sale order
- User searches and filters orders
- User views order detail
- User collects debt
- User publishes e-invoice

---

## 17. DEPLOYMENT & MONITORING

### 17.1. Environment Variables

```env
# Sales Service
SALES_SERVICE_PORT=3003
SALES_DB_HOST=localhost
SALES_DB_PORT=5432
SALES_DB_NAME=sales_db
SALES_DB_USER=sales_user
SALES_DB_PASSWORD=***

# E-Invoice Integration
EINVOICE_PROVIDER=VNPT
EINVOICE_API_URL=https://api-einvoice.vnpt.vn
EINVOICE_API_KEY=***
EINVOICE_CERT_PATH=/path/to/cert.pem
```

### 17.2. Monitoring Metrics

- **API Response Time**: P50, P95, P99
- **Error Rate**: % failed requests
- **Orders Created**: Count per day
- **E-Invoice Success Rate**: % published successfully
- **Database Queries**: Slow query log (> 1s)

### 17.3. Logging

```typescript
// Structured logging với Winston
logger.info('Sale order created', {
  orderId: 'uuid',
  tenantId: 'uuid',
  customerId: 'uuid',
  totalAmount: 1265000,
  userId: 'uuid',
  timestamp: new Date().toISOString(),
});
```

---

## 18. FUTURE ENHANCEMENTS (V2)

- **Multi-currency support**: USD, EUR, JPY
- **Recurring orders**: Đơn hàng định kỳ
- **Sales quotation**: Báo giá trước khi bán
- **Sales promotion**: Chương trình khuyến mãi tự động
- **Loyalty program**: Tích điểm khách hàng
- **Warehouse transfer**: Chuyển kho giữa các chi nhánh
- **Advanced analytics**: AI predict demand, recommend products
- **Mobile POS**: Tablet app cho cửa hàng
- **Barcode scanner**: Quét mã vạch để thêm sản phẩm
- **Integration**: Shopee, Lazada, TikTok Shop sync

---

## APPENDIX A - GLOSSARY

| Term | Vietnamese | Description |
|------|------------|-------------|
| Sale Voucher | Chứng từ bán hàng | Document ghi nhận giao dịch bán |
| Outward Voucher | Phiếu xuất kho | Document xuất hàng khỏi kho |
| Receipt Voucher | Phiếu thu | Document thu tiền từ khách |
| Return Voucher | Phiếu trả hàng | Document trả hàng về kho |
| Discount Voucher | Phiếu giảm giá | Document giảm giá (không trả hàng) |
| E-Invoice | Hóa đơn điện tử | Electronic invoice theo quy định |
| TVAN | Tổ chức cung cấp HĐĐT | E-invoice service provider |
| CQT | Cơ quan thuế | Tax authority |
| FIFO | First In First Out | Phương pháp xuất kho |
| RLS | Row Level Security | Bảo mật cấp dòng |
| HSM | Hardware Security Module | Thiết bị ký số phần cứng |

---

## APPENDIX B - SAMPLE DATA

### Sample Sale Voucher JSON
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "code": "#BH/2025/00123",
  "transactionNo": "BH-20250125-001",
  "transactionDate": "2024-12-25T14:30:00Z",
  "postedDate": "2024-12-25T14:30:00Z",
  "status": "posted",
  "paymentType": "pay_later",
  "paymentStatus": "unpaid",
  "isSaleWithOutward": true,
  "isSaleWithInvoice": false,
  "accountObjectId": "660e8400-e29b-41d4-a716-446655440001",
  "accountObjectName": "Nguyễn Văn A",
  "accountObjectPhone": "0987654321",
  "accountObjectAddress": "123 Lê Lợi, Q1, TP.HCM",
  "totalSaleAmount": 1200000,
  "totalDiscountAmount": 50000,
  "totalVatAmount": 115000,
  "totalAmount": 1265000,
  "details": [
    {
      "itemId": "770e8400-e29b-41d4-a716-446655440002",
      "itemName": "Sản phẩm A",
      "itemCode": "SP001",
      "quantity": 2,
      "unitPrice": 150000,
      "amount": 300000,
      "discountRate": 10,
      "discountAmount": 30000,
      "vatRate": 10,
      "vatAmount": 27000
    },
    {
      "itemId": "770e8400-e29b-41d4-a716-446655440003",
      "itemName": "Sản phẩm B",
      "itemCode": "SP002",
      "quantity": 3,
      "unitPrice": 300000,
      "amount": 900000,
      "discountRate": 0,
      "discountAmount": 0,
      "vatRate": 10,
      "vatAmount": 90000
    }
  ],
  "createdBy": "880e8400-e29b-41d4-a716-446655440004",
  "createdAt": "2024-12-25T14:30:00Z",
  "updatedAt": "2024-12-25T14:30:00Z"
}
```

---

**END OF DOCUMENT**

**Version**: 1.0  
**Last Updated**: 2026-01-20  
**Prepared By**: GitHub Copilot  
**Reviewed By**: [Pending]  
**Approved By**: [Pending]
