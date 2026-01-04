# Yêu cầu chi tiết - Luồng Khai báo Số dư Ban đầu (Initial Balance Setup)

## Tổng quan
Luồng Khai báo Số dư Ban đầu được thiết kế để giúp chủ doanh nghiệp nhập liệu các chỉ số tài chính cơ bản (Tiền mặt, Tiền gửi ngân hàng, Công nợ đầu kỳ) để hệ thống bắt đầu ghi nhận báo cáo dòng tiền chính xác ngay khi sử dụng.

**Phân hệ**: Quản trị doanh nghiệp / Thiết lập ban đầu

**PRD Reference**: 250708 - [PRD] - [Mobile] - Onboarding và setup hệ thống cho user mới

**Design**: [Figma - Symper One Project](https://www.figma.com/design/92RAC4jchoVErx2FBWeHjW/Symper-One-Project?node-id=861-44113)

**Userflow**: [Userflow Luồng Onboarding](https://www.figma.com/board/VHxlNQekaRvvC7YKM77rj2/Userflow-Symper-One?node-id=43-1113)

---

## User Stories Reference

| Code | User Story | Acceptance Criteria |
|------|------------|---------------------|
| US04 | Khai báo danh mục và số dư ban đầu | AC04: Khai báo số dư tiền mặt, tiền gửi |
| | | AC05: Khai báo công nợ khách hàng & NCC |
| | | AC06: Có thể bỏ qua modal tour ở bất kỳ bước nào |
| | | AC07: Cho phép truy cập lại Modal tour từ Cài đặt |
| US06 | Khai báo số dư quỹ | Khai báo tiền mặt tại quỹ và tiền gửi ngân hàng |
| US07 | Khai báo công nợ Khách hàng & NCC | Khai báo số tiền phải thu từ khách hàng và phải trả cho nhà cung cấp |

---

## Business Rules

### US06 - Khai báo số dư quỹ

| Code | Business Rule |
|------|---------------|
| BR01 | Tổng số dư quỹ theo công thức: **Tổng số dư quỹ = Số dư tiền mặt + Tổng số dư tiền gửi** |
| BR02 | Công thức tính số dư tiền gửi: **sum(số dư tiền gửi của tất cả các tài khoản NH)** |
| BR03 | User có thể nhập số dư tiền mặt hoặc tiền tài khoản ngân hàng |
| BR04 | Cập nhật số dư tiền mặt, tiền tài khoản ngân hàng là số dư đầu kỳ trên báo cáo **Cân đối kế toán** |
| BR05 | Hệ thống tạo bút toán lưu mặc định vào TK mẹ, nếu có TK con thì lưu vào TK con tương ứng: |
| | • Tiền mặt: **Nợ 1111 - Tiền Việt Nam** |
| | • Tiền gửi: **Nợ 1121 - Tiền VN gửi ngân hàng** |

### US07 - Khai báo công nợ Khách hàng & NCC

| Code | Business Rule |
|------|---------------|
| BR01 | • User chọn KH/NCC từ danh mục KH/NCC → nhập số tiền phải thu/phải trả cho KH/NCC |
| | • Nếu chưa khai báo danh mục KH/NCC → user có thể thêm mới KH/NCC |
| | • Khi user thêm mới KH/NCC → hiển thị form thêm mới KH/NCC tương ứng |
| | • Khi user nhập đầy đủ các trường bắt buộc của form → Nút "Lưu" enabled |
| | • Sau khi nhập công nợ xong và bấm "Hoàn tất" → hệ thống hiển thị số tiền công nợ mà user đã khai báo |
| | • Hệ thống tính và cập nhật **Tổng công nợ KH/NCC = Sum(Công nợ của tất cả các KH/NCC)** |
| BR02 | Hệ thống mặc định tạo bút toán công nợ KH/NCC vào TK mẹ, nếu có TK con thì lưu vào TK con tương ứng: |
| | • **Nợ 131 - Phải thu khách hàng** |
| | &nbsp;&nbsp;- 1311: Phải thu khách hàng trong nước |
| | • **Ghi Có 331 - Phải trả người bán, nhà cung cấp** |
| | &nbsp;&nbsp;- 3311: Phải trả người bán trong nước |
| BR03 | Cho phép Bỏ qua tại bất kì bước nào trong flow "Khai báo số dư ban đầu": |
| | • User có thể chọn "Bỏ qua" tại bất kỳ bước nào |
| | • Khi bỏ qua → hệ thống hiển thị modal confirm "Bạn có thể khai báo sau hoặc xem lại tại mục Hướng dẫn sử dụng" → điều hướng về Homepage |
| | • Hệ thống lưu thông tin ở các bước trước đó và **không lưu** thông tin ở bước hiện tại |
| BR04 | Cho phép user Bỏ qua các step trong màn khai báo số dư ban đầu: |
| | • Step nào user đã nhập thông tin, hệ thống lưu dữ liệu của step đó |

---

## 1. Tổng quan Quy trình (User Journey)

### 1.1. Điểm vào (Entry Points)
- **Từ DeclarationCategoriesScreen**: Click nút "Khai báo số dư ban đầu"
- **Từ Setup Modal**: Click vào bước 2 "Khai báo số dư ban đầu"
- **Route**: `/declaration/initial-balance`

### 1.2. Stepper 3 bước
```
[Bước 1: Tiền mặt & Tiền gửi] → [Bước 2: Công nợ khách hàng] → [Bước 3: Công nợ nhà cung cấp]
        ↓                              ↓                              ↓
   Cash & Bank                    Receivables                     Payables
```

### 1.3. Navigation Flow
```
DeclarationCategoriesScreen
  ↓ [Khai báo số dư ban đầu]
InitialBalanceStep1Screen (Tiền mặt & Tiền gửi)
  ↓ [Tiếp tục]
InitialBalanceStep2Screen (Công nợ khách hàng)
  ↓ [Tiếp tục]
InitialBalanceStep3Screen (Công nợ nhà cung cấp)
  ↓ [Bắt đầu sử dụng]
HomeScreen (declarationComplete = true)
```

---

## 2. Header Component (Chung cho cả 3 bước)

### 2.1. Layout
```
┌─────────────────────────────────────────────────────────────┐
│  [←]  Khai báo số dư ban đầu                    [Bỏ qua]   │
│  ─────────────────────────────────────────────────────────  │
│  [●━━━━━━━━━━━━━━━●━━━━━━━━━━━━━━━○]  Bước 1/3             │
│                                                             │
│  Title: "Tiền mặt & Tiền gửi ngân hàng"                    │
│  Subtitle: "Nhập số dư tiền mặt và tài khoản ngân hàng..." │
└─────────────────────────────────────────────────────────────┘
```

### 2.2. Styling
- **Back button**: Icon `ArrowLeft2` (Outline) - 24px, color #212529
- **Title**: "Khai báo số dư ban đầu" - 18px, fontWeight 600, color #212529
- **Skip button**: "Bỏ qua" - 14px, fontWeight 500, color #6C757D
- **Progress bar**: 
  - Height: 4px
  - Background: #E9ECEF
  - Active: #FB7E00
  - Progress: Bước 1 = 33%, Bước 2 = 66%, Bước 3 = 100%
- **Step indicator**: "Bước X/3" - 12px, color #6C757D

### 2.3. Step Titles & Subtitles

**Bước 1:**
- Title: "Tiền mặt & Tiền gửi ngân hàng" - 24px, fontWeight 600, color #BA5C00
- Subtitle: "Nhập số dư tiền mặt tại quỹ và số dư các tài khoản ngân hàng hiện có" - 14px, color rgba(0,0,0,0.6)

**Bước 2:**
- Title: "Công nợ khách hàng" - 24px, fontWeight 600, color #BA5C00
- Subtitle: "Khai báo số tiền khách hàng đang còn nợ doanh nghiệp (Phải thu)" - 14px, color rgba(0,0,0,0.6)

**Bước 3:**
- Title: "Công nợ nhà cung cấp" - 24px, fontWeight 600, color #BA5C00
- Subtitle: "Khai báo số tiền doanh nghiệp đang còn nợ nhà cung cấp (Phải trả)" - 14px, color rgba(0,0,0,0.6)

---

## 3. Bước 1: Khai báo Tiền mặt & Tiền gửi

### 3.1. Route
- **Route**: `/declaration/initial-balance/step-1`

### 3.2. Layout màn hình chính

```
┌─────────────────────────────────────────────────────────────┐
│  [Header với Stepper]                                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  💰 Tổng số dư quỹ                                  │   │
│  │  ─────────────────────────────────────────────────  │   │
│  │           125,500,000 ₫                             │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ── Tiền mặt tại quỹ ─────────────────────────────────────  │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Số dư tiền mặt *                                   │   │
│  │  [💵] [25,500,000                              ] ₫  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ── Tiền gửi ngân hàng ───────────────────────────────────  │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  [🏦 VCB]  Vietcombank - 1234567890                 │   │
│  │           50,000,000 ₫                    [✏️] [🗑️] │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  [🏦 TCB]  Techcombank - 9876543210                 │   │
│  │           50,000,000 ₫                    [✏️] [🗑️] │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  [+] Khai báo số dư tiền gửi                        │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  [                    Tiếp tục                         ]   │
└─────────────────────────────────────────────────────────────┘
```

### 3.3. Component: Tổng số dư quỹ Card

**Layout:**
- Background: linear-gradient(135deg, #FFE8D6 0%, #FFF5EB 100%)
- BorderRadius: 16px
- Padding: 20px
- Box shadow: 0 2px 8px rgba(251, 126, 0, 0.1)

**Content:**
- Icon: `Wallet` (Bold) - 24px, color #FB7E00
- Label: "Tổng số dư quỹ" - 14px, fontWeight 500, color #6C757D
- Amount: "{formattedAmount} ₫" - 28px, fontWeight 700, color #FB7E00
- Real-time update khi thay đổi tiền mặt hoặc tiền gửi

### 3.4. Section: Tiền mặt tại quỹ

**Section Header:**
- Divider với text "Tiền mặt tại quỹ"
- Font: 14px, fontWeight 600, color #495057
- Background line: #DEE2E6

**Input Field:**
- Component: `RoundedTextField`
- Label: "Số dư tiền mặt" (*required)
- StartAdornment: Icon `Moneys` (Outline) - 20px, color #6C757D
- EndAdornment: "₫" - 16px, color #495057
- InputProps: inputMode decimal
- Format: Thousand separator (realtime khi nhập)
- Default: 0
- Validation: >= 0

### 3.5. Section: Tiền gửi ngân hàng

**Section Header:**
- Divider với text "Tiền gửi ngân hàng"
- Font: 14px, fontWeight 600, color #495057

**Empty State (khi chưa có tiền gửi):**
```
┌─────────────────────────────────────────────────────────────┐
│                      [🏦 Icon Bank]                         │
│                                                             │
│           Chưa có tài khoản ngân hàng nào                  │
│     Thêm tài khoản để quản lý số dư tiền gửi               │
│                                                             │
│         [+ Khai báo số dư tiền gửi]                        │
└─────────────────────────────────────────────────────────────┘
```
- Icon: `Bank` (Outline) - 48px, color #ADB5BD
- Title: 16px, fontWeight 500, color #495057
- Subtitle: 14px, color #6C757D

**Bank Deposit Card (khi có dữ liệu):**
- Background: #FFFFFF
- Border: 1px solid #E9ECEF
- BorderRadius: 12px
- Padding: 16px
- Gap: 12px

**Card Content:**
```
[Bank Logo]  [Bank Info]                              [Actions]
   40x40     Tên ngân hàng - Số tài khoản              ✏️  🗑️
             Số dư: 50,000,000 ₫
```

- Bank Logo: Avatar 40x40, borderRadius 50%, từ SePay CDN
- Bank Name: 16px, fontWeight 500, color #212529
- Account Number: 14px, color #6C757D
- Balance: 16px, fontWeight 600, color #28A745
- Edit Icon: `Edit2` (Outline) - 20px, color #6C757D
- Delete Icon: `Trash` (Outline) - 20px, color #DC3545

**Add Button:**
- Component: Box với border dashed
- Border: 2px dashed #DEE2E6
- BorderRadius: 12px
- Padding: 16px
- Background: transparent
- Hover: background #F8F9FA, border-color #FB7E00
- Icon: `Add` (Outline) - 20px, color #FB7E00
- Text: "Khai báo số dư tiền gửi" - 16px, fontWeight 500, color #FB7E00

### 3.6. Form: Khai báo số dư tiền gửi (Slide-in Panel)

**Trigger:** Click "+ Khai báo số dư tiền gửi"

**Animation:** Slide in từ phải, duration 300ms

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│  [←]  Khai báo số dư tiền gửi                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Chọn ngân hàng *                                          │
│  [🏦] [Chọn ngân hàng                              ▼]      │
│                                                             │
│  Số tài khoản *                                            │
│  [📄] [Nhập số tài khoản                            ]      │
│                                                             │
│  Số dư hiện tại *                                          │
│  [💰] [0                                            ] ₫    │
│                                                             │
│  Ghi chú                                                   │
│  [📝] [Nhập ghi chú (tuỳ chọn)                      ]      │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  [                    Hoàn tất                         ]   │
└─────────────────────────────────────────────────────────────┘
```

**Form Fields:**

**Chọn ngân hàng** (*required)
- Component: `RoundedTextField` (read-only, click to open)
- StartAdornment: Icon `Bank` (Outline) - 20px
- EndAdornment: Icon `ArrowDown2` (Outline) - 20px
- Click Action: Mở `BankSelectionScreen`
- Display: "{shortName} - {fullName}"

**Số tài khoản** (*required)
- Component: `RoundedTextField`
- StartAdornment: Icon `Card` (Outline) - 20px
- InputProps: inputMode numeric
- Max length: 20
- Validation: 6-20 chữ số

**Số dư hiện tại** (*required)
- Component: `RoundedTextField`
- StartAdornment: Icon `Moneys` (Outline) - 20px
- EndAdornment: "₫"
- InputProps: inputMode decimal
- Format: Thousand separator
- Validation: >= 0

**Ghi chú** (optional)
- Component: `RoundedTextField`
- StartAdornment: Icon `Note` (Outline) - 20px
- Max length: 255

**Action Button:**
- Text: "Hoàn tất"
- Variant: contained
- Background: #FB7E00
- BorderRadius: 100px
- Height: 48px
- Disabled: !isFormValid (thiếu ngân hàng, số TK, hoặc số dư)

### 3.7. Logic tính toán

```typescript
// BR01: Tổng số dư quỹ = Tiền mặt + Tổng tiền gửi
const totalBalance = cashBalance + bankDeposits.reduce((sum, deposit) => sum + deposit.balance, 0);

// BR02: Tổng tiền gửi = Sum(số dư tiền gửi của tất cả các tài khoản NH)
const totalBankDeposit = bankDeposits.reduce((sum, deposit) => sum + deposit.balance, 0);
```

### 3.8. Tạo tài khoản kế toán con (Accounting Sub-accounts)

Khi user thêm mới tài khoản ngân hàng:

```typescript
// Quy tắc tạo TK con 1121x theo BR05 và CC06
const createBankSubAccount = (bankAccountIndex: number): string => {
  // Tạo TK con theo quy tắc tịnh tiến: 11211, 11212, 11213...
  return `1121${bankAccountIndex}`;
};

// Khi xóa tài khoản NH → Không tái sử dụng số TK con đã xóa
// Ví dụ: Nếu đã có 11211, 11212, 11213, xóa 11212
// TK mới sẽ là 11214, không phải 11212
```

**Bút toán khi hoàn tất bước 1 (theo BR05):**
- Tiền mặt: Nợ TK 1111 / Có TK 411 (hoặc TK thích hợp)
- Tiền gửi: Nợ TK 1121x / Có TK 411 (hoặc TK thích hợp)

### 3.8. Action Buttons (Footer)

**Desktop:**
- Container: fixed bottom, height 80px + safe-area
- Background: white
- Box shadow: 0 -4px 12px rgba(0,0,0,0.08)
- Padding: 16px 24px

**Button "Tiếp tục":**
- Variant: contained
- Background: #FB7E00
- BorderRadius: 100px
- Height: 48px
- Full width
- Icon: `ArrowRight` (Outline) - 20px (end)
- Action: Lưu dữ liệu Bước 1, navigate to Step 2

---

## 4. Bước 2: Khai báo Công nợ Khách hàng

### 4.1. Route
- **Route**: `/declaration/initial-balance/step-2`

### 4.2. Layout màn hình chính

```
┌─────────────────────────────────────────────────────────────┐
│  [Header với Stepper - Bước 2/3]                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  📥 Tổng công nợ khách hàng                         │   │
│  │  ─────────────────────────────────────────────────  │   │
│  │           75,000,000 ₫                              │   │
│  │           (Phải thu)                                │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ── Danh sách công nợ ────────────────────────────────────  │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  [👤]  Công ty ABC - KH00001                        │   │
│  │        Còn phải thu: 50,000,000 ₫         [✏️] [🗑️] │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  [👤]  Nguyễn Văn A - KH00002                       │   │
│  │        Còn phải thu: 25,000,000 ₫         [✏️] [🗑️] │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  [+] Khai báo công nợ khách hàng                    │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  [                    Tiếp tục                         ]   │
└─────────────────────────────────────────────────────────────┘
```

### 4.3. Component: Tổng công nợ Card

**Layout:**
- Background: linear-gradient(135deg, #E3F2FD 0%, #F5F9FF 100%)
- BorderRadius: 16px
- Padding: 20px

**Content:**
- Icon: `ReceiveSquare` (Bold) - 24px, color #1976D2
- Label: "Tổng công nợ khách hàng" - 14px, fontWeight 500, color #6C757D
- Amount: "{formattedAmount} ₫" - 28px, fontWeight 700, color #1976D2
- Sublabel: "(Phải thu)" - 12px, color #6C757D

### 4.4. Empty State

```
┌─────────────────────────────────────────────────────────────┐
│                    [📥 ReceiveSquare Icon]                  │
│                                                             │
│              Chưa có công nợ khách hàng nào                │
│      Thêm công nợ để theo dõi số tiền phải thu             │
│                                                             │
│          [+ Khai báo công nợ khách hàng]                   │
└─────────────────────────────────────────────────────────────┘
```

### 4.5. Customer Debt Card

**Layout:**
- Background: #FFFFFF
- Border: 1px solid #E9ECEF
- BorderRadius: 12px
- Padding: 16px

**Content:**
```
[Avatar]  [Customer Info]                           [Actions]
  40x40   Tên khách hàng - Mã KH                     ✏️  🗑️
          Còn phải thu: 50,000,000 ₫
```

- Avatar: 40x40, borderRadius 50%, bgcolor #E3F2FD
  - Icon inside: `Profile` (Bold) - 20px, color #1976D2
- Customer Name: 16px, fontWeight 500, color #212529
- Customer Code: 14px, color #6C757D
- Debt Amount: 16px, fontWeight 600, color #1976D2
- Label "Còn phải thu:": 14px, color #6C757D

### 4.6. Form: Khai báo công nợ khách hàng

**Trigger:** Click "+ Khai báo công nợ khách hàng"

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│  [←]  Khai báo công nợ khách hàng                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Chọn khách hàng *                                         │
│  [👤] [Chọn khách hàng                             ▼]      │
│                                                             │
│  Số tiền còn phải thu *                                    │
│  [💰] [0                                            ] ₫    │
│                                                             │
│  Ngày phát sinh nợ                                         │
│  [📅] [Chọn ngày                                    ]      │
│                                                             │
│  Ghi chú                                                   │
│  [📝] [Nhập ghi chú (tuỳ chọn)                      ]      │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  [                    Hoàn tất                         ]   │
└─────────────────────────────────────────────────────────────┘
```

**Form Fields:**

**Chọn khách hàng** (*required)
- Component: `RoundedTextField` (read-only, click to open)
- StartAdornment: Icon `Profile` (Outline) - 20px
- EndAdornment: Icon `ArrowDown2` (Outline) - 20px
- Click Action: Mở `CustomerSelectionScreen`
- Display: "{customerName} - {customerCode}"

**Số tiền còn phải thu** (*required)
- Component: `RoundedTextField`
- StartAdornment: Icon `Moneys` (Outline) - 20px
- EndAdornment: "₫"
- InputProps: inputMode decimal
- Format: Thousand separator
- Validation: > 0 (phải lớn hơn 0)

**Ngày phát sinh nợ** (optional)
- Component: `RoundedTextField` with DatePicker
- StartAdornment: Icon `Calendar` (Outline) - 20px
- Default: Hôm nay
- Format: DD/MM/YYYY

**Ghi chú** (optional)
- Component: `RoundedTextField`
- Max length: 255

### 4.7. Customer Selection Screen

**Route:** Modal full-screen hoặc slide-in

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│  [←]  Chọn khách hàng                              [+ Add] │
├─────────────────────────────────────────────────────────────┤
│  [🔍] Tìm kiếm khách hàng...                               │
├─────────────────────────────────────────────────────────────┤
│  [Tất cả]  [Tổ chức]  [Cá nhân]                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  [👤]  Công ty ABC                                  │   │
│  │        KH00001 • MST: 0108344905                    │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  [👤]  Nguyễn Văn A                                 │   │
│  │        KH00002 • CCCD: 001234567890                 │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Header:**
- Back button: Close selection
- Add button: Icon `Add` (Outline) - 24px, color #FB7E00
  - Click: Mở `CustomerFormScreen` → Sau khi tạo xong, auto-select và quay lại

**Search Bar:**
- Component: TextField với search icon
- Placeholder: "Tìm kiếm khách hàng..."
- Debounce: 300ms

**Filter Tabs:**
- Tabs: "Tất cả", "Tổ chức", "Cá nhân"
- Active tab: underline #FB7E00

**Customer Item:**
- Avatar: 40x40, borderRadius 50%
  - Tổ chức: Icon `Building` (Bold), bgcolor #E3F2FD
  - Cá nhân: Icon `Profile` (Bold), bgcolor #FFF3E0
- Name: 16px, fontWeight 500, color #212529
- Code + Tax/ID: 14px, color #6C757D
- Click: Select customer và close

**Empty State:**
- Khi search không có kết quả hoặc danh sách rỗng
- Show button "Thêm khách hàng mới"

---

## 5. Bước 3: Khai báo Công nợ Nhà cung cấp

### 5.1. Route
- **Route**: `/declaration/initial-balance/step-3`

### 5.2. Layout màn hình chính

Tương tự Bước 2, với các thay đổi:

**Tổng công nợ Card:**
- Background: linear-gradient(135deg, #FFEBEE 0%, #FFF5F5 100%)
- Icon: `SendSquare` (Bold) - 24px, color #D32F2F
- Label: "Tổng công nợ nhà cung cấp"
- Sublabel: "(Phải trả)"
- Amount color: #D32F2F

**Supplier Debt Card:**
- Avatar bgcolor: #FFEBEE
- Icon inside: `Building` (Bold) - 20px, color #D32F2F
- Debt Amount color: #D32F2F
- Label: "Còn phải trả:"

### 5.3. Form: Khai báo công nợ nhà cung cấp

Tương tự form khách hàng với các thay đổi:
- Title: "Khai báo công nợ nhà cung cấp"
- Field: "Chọn nhà cung cấp" → Mở `SupplierSelectionScreen`
- Field: "Số tiền còn phải trả"

### 5.4. Supplier Selection Screen

Tương tự Customer Selection với:
- Title: "Chọn nhà cung cấp"
- Filter tabs: "Tất cả", "Tổ chức", "Cá nhân"
- Add action: Mở `SupplierFormScreen`

### 5.5. Action Button (Bước cuối)

**Button "Bắt đầu sử dụng":**
- Text: "Bắt đầu sử dụng"
- Variant: contained
- Background: #28A745 (Success green)
- Icon: `TickCircle` (Bold) - 20px (start)
- Action:
  1. Lưu toàn bộ dữ liệu 3 bước
  2. Set localStorage `declarationCompleted = 'true'`
  3. Show success snackbar
  4. Navigate to HomeScreen

---

## 6. Các luồng Thay thế & Phụ (Alternative Flows)

### 6.1. Luồng Chỉnh sửa (Edit)

**Trigger:** Click icon ✏️ trên card item

**Behavior:**
1. Mở lại form với dữ liệu đã điền
2. Cho phép sửa tất cả các trường
3. Click "Hoàn tất":
   - Cập nhật item trong danh sách
   - Tính lại Tổng

### 6.2. Luồng Xóa (Delete)

**Trigger:** Click icon 🗑️ trên card item

**Confirm Dialog:**
```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                    [⚠️ Warning Icon]                        │
│                                                             │
│              Xác nhận xóa công nợ?                         │
│                                                             │
│    Bạn chắc chắn muốn xóa công nợ này.                     │
│    Thao tác này không thể khôi phục.                       │
│                                                             │
│         [Hủy]                    [Đồng ý]                  │
└─────────────────────────────────────────────────────────────┘
```

**Dialog Styling:**
- Background overlay: rgba(0,0,0,0.5)
- Card: bgcolor white, borderRadius 16px, padding 24px
- Icon: `Warning2` (Bold) - 48px, color #FFA500
- Title: 18px, fontWeight 600, color #212529
- Description: 14px, color #6C757D
- Button "Hủy": variant text, color #6C757D
- Button "Đồng ý": variant contained, bgcolor #DC3545

**After Delete:**
1. Xóa item khỏi danh sách
2. Tính lại Tổng
3. Show success snackbar: "Đã xóa thành công"

### 6.3. Luồng Bỏ qua (Skip)

**Trigger:** Click "Bỏ qua" ở header

**Confirm Dialog:**
```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                    [ℹ️ Info Icon]                           │
│                                                             │
│              Bỏ qua khai báo số dư?                        │
│                                                             │
│    Dữ liệu đã nhập ở các bước trước sẽ được lưu.           │
│    Bạn có thể quay lại khai báo sau trong phần             │
│    Cài đặt.                                                │
│                                                             │
│      [Tiếp tục khai báo]              [Bỏ qua]             │
└─────────────────────────────────────────────────────────────┘
```

**Behavior:**
- "Tiếp tục khai báo": Đóng dialog, ở lại màn hình hiện tại
- "Bỏ qua":
  1. Lưu dữ liệu các bước đã hoàn thành
  2. Set localStorage `initialBalanceSkipped = 'true'`
  3. Navigate to HomeScreen

### 6.4. Luồng Quay lại (Back)

**Trigger:** Click mũi tên ← ở header

**Logic:**
- Bước 3 → Bước 2
- Bước 2 → Bước 1
- Bước 1 → DeclarationCategoriesScreen (hoặc màn hình trước đó)

**Confirm if has unsaved changes:**
- Nếu đang nhập form, show confirm dialog
- "Hủy thay đổi" / "Tiếp tục chỉnh sửa"

---

## 7. Validation Rules

### 7.1. Bước 1 - Tiền mặt & Tiền gửi

**Tiền mặt:**
- Required: Không (có thể để 0)
- Format: Number >= 0
- Max: 999,999,999,999

**Tiền gửi:**
- Ngân hàng: Required
- Số tài khoản: Required, 6-20 chữ số, unique trong danh sách
- Số dư: Required, >= 0

### 7.2. Bước 2 - Công nợ khách hàng

**Công nợ:**
- Khách hàng: Required, không trùng lặp trong danh sách
- Số tiền: Required, > 0

### 7.3. Bước 3 - Công nợ nhà cung cấp

**Công nợ:**
- Nhà cung cấp: Required, không trùng lặp trong danh sách
- Số tiền: Required, > 0

---

## 8. API Endpoints

### 8.1. Initial Balance

**Lưu dữ liệu từng bước:**
```
POST /api/initial-balance/cash
Body: { cashBalance: number, tenantId: string }

POST /api/initial-balance/bank-deposits
Body: { deposits: BankDeposit[], tenantId: string }

POST /api/initial-balance/customer-debts
Body: { debts: CustomerDebt[], tenantId: string }

POST /api/initial-balance/supplier-debts
Body: { debts: SupplierDebt[], tenantId: string }
```

**Lấy dữ liệu đã khai báo:**
```
GET /api/initial-balance?tenantId={id}
Response: {
  cashBalance: number,
  bankDeposits: BankDeposit[],
  customerDebts: CustomerDebt[],
  supplierDebts: SupplierDebt[],
  completedSteps: number[],
  isCompleted: boolean
}
```

### 8.2. Data Interfaces

```typescript
interface BankDeposit {
  id: string;
  bankCode: string;
  bankName: string;
  accountNumber: string;
  balance: number;
  note?: string;
  createdAt: Date;
}

interface CustomerDebt {
  id: string;
  customerId: string;
  customerName: string;
  customerCode: string;
  amount: number;
  debtDate?: Date;
  note?: string;
  createdAt: Date;
}

interface SupplierDebt {
  id: string;
  supplierId: string;
  supplierName: string;
  supplierCode: string;
  amount: number;
  debtDate?: Date;
  note?: string;
  createdAt: Date;
}
```

---

## 9. LocalStorage Keys

```typescript
// Flags
'initialBalanceStep': '1' | '2' | '3' | 'completed'
'initialBalanceSkipped': 'true' | null

// Draft data (auto-save)
'initial_balance_draft_step1': { cashBalance: number, bankDeposits: BankDeposit[] }
'initial_balance_draft_step2': { customerDebts: CustomerDebt[] }
'initial_balance_draft_step3': { supplierDebts: SupplierDebt[] }
```

---

## 10. UI/UX Specifications

### 10.1. Design Tokens (Đồng bộ với hệ thống)

**Colors:**
- Primary Orange: #FB7E00
- Primary Blue: #007DFB (Phải thu)
- Success Green: #28A745
- Error Red: #DC3545 (Phải trả)
- Warning Orange: #FFA500
- Text Primary: #212529
- Text Secondary: #6C757D
- Border: #DEE2E6
- Background: #F8F9FA

**Typography:**
- Heading: 24px, fontWeight 600, Bricolage Grotesque
- Body: 16px, fontWeight 400
- Caption: 14px
- Amount Large: 28px, fontWeight 700

### 10.2. Animations

**Slide-in Form:**
- Direction: Right to Left
- Duration: 300ms
- Easing: ease-out

**Card Add/Remove:**
- Add: Fade in + slide down, 200ms
- Remove: Fade out + slide up, 200ms

**Total Update:**
- Number counter animation, 300ms

### 10.3. Responsive Design

**Mobile (< 600px):**
- Stack tất cả elements vertically
- Sticky footer với action button
- Form mở full-screen

**Tablet/Desktop (>= 600px):**
- Max width container: 600px
- Form mở slide-in panel (width 400px)
- Action buttons inline

---

## 11. Notifications

**Success Snackbar:**
- Position: bottom center
- Background: #28A745
- Icon: `TickCircle` (Bold)
- Duration: 3000ms
- Messages:
  - "Đã thêm số dư tiền gửi"
  - "Đã cập nhật thành công"
  - "Đã xóa thành công"
  - "Hoàn tất khai báo số dư ban đầu"

**Error Snackbar:**
- Background: #DC3545
- Duration: 5000ms
- Messages:
  - "Vui lòng kiểm tra lại thông tin"
  - "Có lỗi xảy ra, vui lòng thử lại"

---

## 12. Implementation Priority

### Phase 1 (MVP)
1. InitialBalanceStep1Screen (Tiền mặt & Tiền gửi)
2. InitialBalanceStep2Screen (Công nợ khách hàng - basic)
3. InitialBalanceStep3Screen (Công nợ nhà cung cấp - basic)
4. Customer/Supplier Selection screens
5. Delete confirmation dialog

### Phase 2 (Enhanced)
1. Edit flow cho từng bước
2. Auto-save draft
3. Animation polish
4. Date picker cho ngày phát sinh nợ

### Phase 3 (Polish)
1. Offline support
2. Import from Excel
3. Báo cáo tổng hợp số dư ban đầu

---

## 13. Testing Requirements

### Unit Tests
- Calculation logic (Tổng tiền)
- Validation rules
- Format functions

### Integration Tests
- Form submission flow
- Navigation between steps
- Delete/Edit operations

### E2E Tests
- Complete 3-step flow
- Skip flow
- Back navigation

---

## 14. Acceptance Criteria Details (US06 - Khai báo số dư quỹ)

### AC01: Truy cập luồng khai báo số dư ban đầu

| Step | Description |
|------|-------------|
| **Given** | Modal tour đang hiển thị |
| | • Or: User đang ở màn danh sách khai báo danh mục |
| **When** | Khi user bấm button "Khai báo số dư ban đầu" |
| **Then** | Hệ thống điều hướng sang màn hình **Khai báo số dư ban đầu** |
| | • And: Màn hình "Khai báo số dư ban đầu" hiển thị 3 steps: |
| | &nbsp;&nbsp;○ Tiền mặt, tiền gửi |
| | &nbsp;&nbsp;○ Công nợ khách hàng |
| | &nbsp;&nbsp;○ Công nợ nhà cung cấp |

### AC02: Khai báo số dư tiền mặt

| Step | Description |
|------|-------------|
| **Given** | User đang ở step 1: Khai báo số dư tiền mặt, tiền gửi |
| | • And: Chưa có bút toán khai báo số dư nào cho tài khoản **111 - Tiền mặt** |
| **When** | User nhập số tiền mặt hợp lệ |
| **Then** | Hệ thống lưu và cập nhật tổng số dư tiền mặt |
| | • And: Cập nhật tổng số dư quỹ theo **BR01** |

### AC03: Khai báo số dư tiền gửi

| Step | Description |
|------|-------------|
| **Given** | User đang ở step khai báo số dư tiền mặt, tiền gửi |
| | • And: Chưa có bút toán khai báo số dư nào cho tài khoản **112** |
| **When** | User chọn nút "Khai báo số dư tiền gửi" |
| **Then** | Hệ thống hiển thị màn Khai báo số dư tiền gửi |
| **When** | User chọn "Tài khoản ngân hàng" |
| **Then** | Hệ thống hiển thị danh sách ngân hàng |
| **When** | User chọn tài khoản ngân hàng |
| | • And: Nhập số dư tài khoản ngân hàng và chọn "Hoàn tất" |
| **Then** | Hệ thống lưu và cập nhật số dư tiền gửi theo **BR02** |
| | • And: Hệ thống tự động tính và cập nhật **Tổng số dư quỹ** |

### AC04: Hoàn tất khai báo số dư quỹ

| Step | Description |
|------|-------------|
| **Given** | User đã nhập xong số dư tiền mặt + tiền gửi |
| **When** | User chọn "Tiếp tục" |
| **Then** | Hệ thống tạo bút toán khai báo số dư tiền gửi/tiền mặt theo TK kế toán tương ứng (**BR05**) |
| | • And: Hệ thống điều hướng tới step tiếp theo |

---

## 15. Corner Cases/Edge Cases (US06)

| Code | Corner Cases/Edge Cases | Ref AC |
|------|-------------------------|--------|
| CC01 | User bấm "Back" tại step đầu tiên "Khai báo số dư tiền mặt, tiền gửi" → hệ thống điều hướng về modal tour | AC02 |
| CC02 | Chưa nhập đầy đủ các trường bắt buộc của form Thêm mới tài khoản ngân hàng → button Lưu disabled | AC02 |
| CC03 | Nhập số dư tiền mặt = số âm, kí tự đặc biệt → hệ thống không cho phép user nhập kí tự gì khác ngoài số | AC02 |
| CC04 | User cố gắng chọn 2 ngân hàng trong 1 lần thao tác → hệ thống chỉ cho phép chọn 1, disable multi-select | AC02 |
| CC05 | Khi chỉnh sửa/xoá số dư của 1 tài khoản ngân hàng/số dư tiền mặt → tổng quỹ phải cập nhật lại **ngay lập tức** | AC02 |
| CC06 | **Hệ thống xử lý khi chưa có TKNH**: | AC03 |
| | • Nếu chưa có TKNH → Cho phép user thêm mới tài khoản ngân hàng | |
| | • Khi thêm mới → hệ thống hiển thị form nhập liệu "Thêm mới tài khoản ngân hàng" với đầy đủ các trường thông tin | |
| | • Khi Lưu TKNH → Hệ thống tự động tạo các tài khoản kế toán con **1121** theo quy tắc tịnh tiến tương ứng **1121x** với mỗi tài khoản ngân hàng được khai báo. (Chỉ lưu dưới DB và hiển thị trên màn kế toán) | |
| | • Trong trường hợp user xoá một tài khoản ngân hàng đã khai báo, hệ thống **không tái sử dụng** số sub-account đã xóa mà tiếp tục tạo sub-account mới theo thứ tự tăng dần | |

---

## 16. Acceptance Criteria Details (US07 - Khai báo công nợ KH & NCC)

### AC01: Khai báo công nợ khách hàng

| Step | Description |
|------|-------------|
| **Given** | User đang ở "Step 2 Khai báo công nợ KH" ở màn Khai báo số dư ban đầu |
| **When** | User chọn "Khai báo công nợ KH" |
| **Then** | Hệ thống hiển thị màn khai báo công nợ KH |
| **When** | User đã nhập đầy đủ thông tin số tiền phải thu của khách hàng |
| | • And: Chọn "Hoàn tất" |
| **Then** | Hệ thống lưu và cập nhật Tổng công nợ khách hàng theo **BR01** |

### AC02: Hoàn tất khai báo công nợ khách hàng

| Step | Description |
|------|-------------|
| **Given** | User đang ở "Step 2 Khai báo công nợ KH" ở màn Khai báo số dư ban đầu |
| | • And: User đã nhập xong công nợ khách hàng |
| **When** | User chọn "Tiếp tục" |
| **Then** | Hệ thống ghi nhận công nợ khách hàng theo **BR02** |
| | • Nợ 131 - Phải thu khách hàng (hoặc 1311 nếu có TK con) |

### AC03: Khai báo công nợ Nhà cung cấp

| Step | Description |
|------|-------------|
| **Given** | User đang ở "Step 3 Khai báo công nợ NCC" ở màn Khai báo số dư ban đầu |
| **When** | User chọn "Khai báo công nợ NCC" |
| **Then** | Hệ thống hiển thị màn "Khai báo công nợ NCC" |
| **When** | User nhập đầy đủ thông tin số tiền phải trả cho NCC |
| | • And: User chọn "Hoàn tất" |
| **Then** | Hệ thống điều hướng về step 3 Khai báo số dư ban đầu |
| | • And: Hệ thống lưu và cập nhật Tổng công nợ NCC theo **BR01** |

### AC04: Hoàn tất khai báo công nợ nhà cung cấp

| Step | Description |
|------|-------------|
| **Given** | User đang ở "Step 3 Khai báo công nợ NCC" ở màn Khai báo số dư ban đầu |
| | • And: User đã nhập xong công nợ NCC |
| **When** | User chọn "Tiếp tục" (hoặc "Bắt đầu sử dụng") |
| **Then** | Hệ thống ghi nhận công nợ NCC theo **BR02** |
| | • Có 331 - Phải trả người bán (hoặc 3311 nếu có TK con) |
| | • And: Điều hướng về HomeScreen |

---

## 17. Corner Cases/Edge Cases (US07)

| Code | Corner Cases/Edge Cases | Ref |
|------|-------------------------|-----|
| CC01 | Khi chỉnh sửa/xoá công nợ KH/NCC → Hệ thống cập nhật tổng số công nợ **ngay lập tức** | BR01 |
| CC02 | Nếu user chưa điền thông tin và bấm "Tiếp tục" → hệ thống lưu dữ liệu rỗng ở bước đó & điều hướng tới step tiếp theo | BR04 |

---

## 18. Accounting Entries (Bút toán kế toán)

### Khai báo số dư quỹ (US06)

| Loại | Tài khoản Nợ | Tài khoản Có | Mô tả |
|------|--------------|--------------|-------|
| Tiền mặt | 1111 - Tiền Việt Nam | - | Số dư đầu kỳ tiền mặt |
| Tiền gửi NH | 1121 - Tiền VN gửi ngân hàng | - | Số dư đầu kỳ tiền gửi |
| | 1121x - TK con theo từng NH | - | Nếu có nhiều tài khoản NH |

**Quy tắc tạo TK con 1121x:**
- Mỗi tài khoản ngân hàng được khai báo → Tạo TK con 1121 theo quy tắc tịnh tiến: 11211, 11212, 11213...
- Khi xóa tài khoản NH → Không tái sử dụng số TK con đã xóa
- TK con chỉ lưu trong DB và hiển thị trên màn kế toán

### Khai báo công nợ (US07)

| Loại | Tài khoản Nợ | Tài khoản Có | Mô tả |
|------|--------------|--------------|-------|
| Công nợ KH (Phải thu) | 131 - Phải thu khách hàng | - | Số dư công nợ KH đầu kỳ |
| | 1311 - Phải thu KH trong nước | - | Nếu có TK con |
| Công nợ NCC (Phải trả) | - | 331 - Phải trả người bán | Số dư công nợ NCC đầu kỳ |
| | - | 3311 - Phải trả người bán trong nước | Nếu có TK con |

---

## Changelog

| Version | Date       | Author | Changes                              |
|---------|------------|--------|--------------------------------------|
| 1.0     | 2024-12-31 | AI     | Initial requirements document        |
| 1.1     | 2024-12-31 | AI     | Added Business Rules from PRD (BR01-BR05 for US06, BR01-BR04 for US07) |
| | | | Added detailed Acceptance Criteria with Given/When/Then format |
| | | | Added Corner Cases/Edge Cases (CC01-CC06 for US06, CC01-CC02 for US07) |
| | | | Added Accounting Entries section with account codes (TK 1111, 1121, 131, 331) |
| | | | Added sub-account creation rules for bank accounts (1121x) |
