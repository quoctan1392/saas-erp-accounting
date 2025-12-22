# YÊU CẦU LUỒNG ONBOARDING - PHÂN NHÁNH THEO LOẠI HÌNH KINH DOANH

## 1. TỔNG QUAN QUY TRÌNH (WIZARD FLOW)

Hệ thống dẫn dắt người dùng qua 4 bước chính:
1. **Chọn loại hình kinh doanh** (BusinessTypeScreen)
2. **Nhập thông tin định danh** (BusinessInfoScreen hoặc BusinessInfoScreenDNTN)
3. **Chọn lĩnh vực và ngành nghề** (BusinessSectorScreen)
4. **Thiết lập cấu hình kế toán** (AccountingSetupScreen)

### Progress Indicator
- Bước 1: 25%
- Bước 2: 50%
- Bước 3: 75%
- Bước 4: 100%

---

## 2. BƯỚC 1: CHỌN LOẠI HÌNH KINH DOANH (BusinessTypeScreen)

### Mục đích
Đây là bước quyết định logic hiển thị cho toàn bộ các bước phía sau.

### Danh sách lựa chọn
1. **Hộ kinh doanh cá thể (HKD)** - Enabled
   - Icon: Business Type Image 1
   - Mô tả: "Phù hợp cho cửa hàng, quán ăn, dịch vụ nhỏ"
   
2. **Doanh nghiệp tư nhân (DNTN)** - Enabled
   - Icon: Business Type Image 2
   - Mô tả: "Dành cho doanh nghiệp có quy mô vừa"
   
3. **Công ty TNHH/Cổ phần** - Disabled (Coming Soon)
   - Icon: Business Type Image 3 (Opacity 60%)
   - Mô tả: "Dành cho công ty có pháp nhân"
   - Badge: "Sắp ra mắt"

### Yêu cầu Logic
- Người dùng **bắt buộc** phải chọn 1 loại hình để nhấn "Tiếp tục"
- Mặc định tick chọn loại hình "Hộ kinh doanh cá thể (HKD)"
- Hệ thống ghi nhận loại hình đã chọn (State) để thay đổi giao diện các bước sau
- Khi nhấn "Tiếp tục":
  - Nếu chọn HKD → Navigate đến `/onboarding/business-info`
  - Nếu chọn DNTN → Navigate đến `/onboarding/business-info-dntn`
  - Lưu businessType vào localStorage và API
  

### UI/UX Requirements
- Background: Welcome screen.png
- FontFamily: SF Pro Display
- Selected state: 5% orange overlay + 2px orange border
- Mobile sticky footer: 68px white bar with neutral shadow
- Progress: 25%

---

## 3. BƯỚC 2: NHẬP THÔNG TIN ĐỊNH DANH

### 3.1. Đối với Hộ kinh doanh cá thể (HKD) - BusinessInfoScreen.tsx

#### Route
`/onboarding/business-info`

#### Tiêu đề màn hình
"Thông tin Hộ kinh doanh"

#### Các trường dữ liệu

| Tên trường | Label | Placeholder | Icon | Bắt buộc | Validation |
|------------|-------|-------------|------|----------|------------|
| taxId | Mã số thuế | Nhập mã số thuế | ReceiptText | ✅ | Regex: /^[0-9]{10}$\|^[0-9]{13}$/ |
| businessName | Tên Hộ kinh doanh | VD: Cửa hàng tạp hóa Minh An | Building | ✅ | Min 2 ký tự |
| registeredAddress | Địa chỉ đăng ký | Nhập địa chỉ đăng ký | Location | ✅ | Min 10 ký tự |
| ownerName | Tên chủ hộ kinh doanh | Nhập họ và tên | User | ❌ | - |
| nationalId | CCCD | Nhập CCCD 12 chữ số | Personalcard | ❌ | Regex: /^[0-9]{12}$/ |

#### Tính năng đặc biệt
- **Nút "Lấy thông tin"** bên cạnh trường Mã số thuế:
  - Khi nhấn: Gọi API để tự động điền thông tin từ cơ quan thuế
  - Các trường được tự động điền vẫn cho phép chỉnh sửa
  - Hiển thị toast message: "Đã tự động điền thông tin từ cơ quan thuế" (success) hoặc "Không tìm thấy thông tin. Vui lòng kiểm tra lại mã số thuế" (error)

#### Navigation
- Back button: Quay về BusinessTypeScreen (nếu có thay đổi, hiển thị confirm dialog)
- Continue button: Navigate đến `/onboarding/business-sector`
- Progress: 50%

---

### 3.2. Đối với Doanh nghiệp tư nhân (DNTN) - BusinessInfoScreenDNTN.tsx

#### Route
`/onboarding/business-info-dntn`

#### Tiêu đề màn hình
"Thông tin Doanh nghiệp"

#### Các trường dữ liệu

| Tên trường | Label | Placeholder | Icon | Bắt buộc | Validation |
|------------|-------|-------------|------|----------|------------|
| taxId | Mã số thuế | Nhập mã số thuế | ReceiptText | ✅ | Regex: /^[0-9]{10}$\|^[0-9]{13}$/ |
| businessName | Tên doanh nghiệp | VD: Doanh nghiệp tư nhân ABC | Building | ✅ | Min 2 ký tự |
| registeredAddress | Địa chỉ đăng ký | Nhập địa chỉ đăng | Location | ✅ | Min 10 ký tự |
| ownerName | Tên chủ doanh nghiệp | Nhập họ và tên | User | ❌ | - |
| nationalId | CCCD | Nhập CCCD chủ doanh nghiệp | Personalcard | ❌ | Regex: /^[0-9]{12}$/ |

#### Điểm khác biệt so với HKD
- **Label khác**: "Tên doanh nghiệp" thay vì "Tên Hộ kinh doanh", "Tên chủ doanh nghiệp" thay vì "Tên chủ hộ kinh doanh"

#### Tính năng đặc biệt
- Giống HKD: Nút "Lấy thông tin" bên cạnh trường Mã số thuế

#### Navigation
- Back button: Quay về BusinessTypeScreen (nếu có thay đổi, hiển thị confirm dialog)
- Continue button: Navigate đến `/onboarding/business-sector`
- Progress: 50%

---

## 4. BƯỚC 3: CHỌN LĨNH VỰC VÀ NGÀNH NGHỀ (BusinessSectorScreen)

### Route
`/onboarding/business-sector`

### Tiêu đề màn hình
"Lĩnh vực hoạt động"

### Mô tả
"Chọn lĩnh vực và ngành nghề kinh doanh chính của bạn."

### Các trường dữ liệu

#### 4.1. Lĩnh vực hoạt động (Bắt buộc)
Radio buttons (chọn 1 trong 4), tick chọn mặc định vào "Thương mại", user có thể chọn lại
1. **Thương mại**
   - Icon: Shop
   - Mô tả: "Mua bán, phân phối hàng hóa"
   
2. **Dịch vụ**
   - Icon: Setting2
   - Mô tả: "Cung cấp dịch vụ, tư vấn"
   
3. **Sản xuất**
   - Icon: Chart
   - Mô tả: "Sản xuất, chế biến sản phẩm"
   
4. **Xây lắp**
   - Icon: Buildings
   - Mô tả: "Thi công xây dựng, lắp đặt"

#### 4.2. Ngành nghề kinh doanh chính (Bắt buộc)
- Component: Autocomplete (searchable dropdown)
- Placeholder: "Tìm kiếm và chọn ngành nghề kinh doanh chính"
- Data source: API endpoint `/api/business-sectors`
- Format: "Số thứ tự - Tên ngành nghề"
- Ví dụ: "1-Dịch vụ chăm sóc sức khoẻ, sắc đẹp"
- Hiển thị tối đa 1 dòng
### UI Pattern
- 4 lĩnh vực hoạt động chia thành 4 dòng radio buttons
- Background: Welcome screen.png
- Mobile sticky footer

### Logic áp dụng cho cả HKD và DNTN
Không có sự khác biệt về logic hay UI giữa HKD và DNTN ở bước này.

### Navigation
- Back button: Quay về BusinessInfoScreen hoặc BusinessInfoScreenDNTN (tùy theo businessType)
- Continue button: Navigate đến `/onboarding/accounting-setup`
- Progress: 75%

---

## 5. BƯỚC 4: THIẾT LẬP CẤU HÌNH KẾ TOÁN (AccountingSetupScreen)

### Route
`/onboarding/accounting-setup`

### Tiêu đề màn hình
- Cả 2 option đều hiển thị tiêu đề và mô tả giống nhau
- Tiêu đề: "Thiết lập dữ liệu kế toán"
### Mô tả
"Thiết lập dữ liệu kế toán ban đầu."

### 5.1. Đối với Hộ kinh doanh cá thể (HKD)

#### Các trường cấu hình

| Tên trường | Label | Type | Bắt buộc | Giá trị |
|------------|-------|------|----------|---------|
| accountingRegime | Chế độ kế toán | Display only | - | "Thông tư 88/2021/TT-BTC" (Cố định, không cho chọn) |
| dataStartDate | Ngày bắt đầu dữ liệu | Date picker | ✅ | Format: DD/MM/YYYY |
| taxFilingFrequency | Chọn tần suất kê khai thuế và mẫu tờ khai| Radio buttons | ✅ | "Hàng quý" hoặc "Hàng tháng" (Mẫu 01/CNKD) |
| usePOSDevice | Có sử dụng máy tính tiền xuất hóa đơn | Radio buttons | ✅ | "Có" hoặc "Không" |
| inventoryValuationMethod | Phương pháp tính giá xuất kho | Display only | - | "Bình quân cuối kỳ" (Mặc định) |
| taxIndustryGroup | Nhóm ngành nghề tính thuế GTGT, TNCN* | Dropdown | ✅ | Danh sách các nhóm ngành (101, 102...) |

#### Mô tả chi tiết

**Chế độ kế toán:**
- Hiển thị text: "Thông tư 88/2021/TT-BTC (Dành riêng cho hộ kinh doanh)"
- Background: Light gray (#F5F5F5)
- Không cho chỉnh sửa
**Ngày bắt đầu dữ liệu:**
- Mặc định là ngày đầu tiên của năm hiện tại
- Click vào hiển thị bottomsheet Datepicker

**Chọn tần suất kê khai thuế và mẫu tờ khai:**
- Option 1: "Hàng quý" (Mặc định chọn)
- Option 2: "Hàng tháng"
- Helper text: "Mẫu 01/CNKD là tờ khai thuế dành cho hộ kinh doanh, cá nhân tự kê khai thuế theo phương pháp kê khai"

**Nhóm ngành nghề tính thuế:**
- Dropdown với danh sách: click vào trường thông tin sẽ mở 1 screen Danh sách ngành nghề tính thuế GTGT, TNCN (cập nhật sau)

---

### 5.2. Đối với Doanh nghiệp tư nhân (DNTN)

#### Các trường cấu hình

| Tên trường | Label | Type | Bắt buộc | Giá trị |
|------------|-------|------|----------|---------|
| accountingRegime | Chế độ kế toán | Radio buttons | ✅ | Thông tư 200/2014 hoặc 133/2016 |
| dataStartDate | Ngày bắt đầu dữ liệu | Date picker | ✅ | Format: DD/MM/YYYY |
| taxCalculationMethod | Phương pháp tính thuế | Radio buttons | ✅ | "Khấu trừ" hoặc "Trực tiếp trên doanh thu" |
| baseCurrency | Đồng tiền hạch toán | Radio buttons | ✅ | "VND" hoặc "USD" |
| hasForeignCurrency | Phát sinh nghiệp vụ liên quan đến ngoại tệ | Checkbox | ❌ | true/false |
| inventoryValuationMethod | Phương pháp tính giá xuất kho | Radio buttons | ✅ | "Bình quân cuối kỳ", "Bình quân tức thời", "Giá đích danh", "Nhập trước xuất trước" |

#### Mô tả chi tiết

**Chế độ kế toán:**
- Option 1: "Thông tư 200/2014/TT-BTC - Chế độ kế toán doanh nghiệp" 
- Option 2: "Thông tư 133/2016/TT-BTC - Chế độ kế toán doanh nghiệp nhỏ và vừa"
- Mặc định chọn option 1, người dùng có thể chọn lại

**Phương pháp tính thuế:**
- Option 1: "Phương pháp khấu trừ" 
  - Mặc định tick chọn option 1, user có thể chọn lại
- Option 2: "Phương pháp trực tiếp trên doanh thu"
  - Mô tả: "Doanh thu × Tỷ lệ %"

**Đồng tiền hạch toán:**
- Option 1: "Việt Nam Đồng (VND)" (Default)
- Option 2: "Đô-la Mỹ (USD)"

**Phương pháp tính giá xuất kho:**
- Option 1: "Bình quân cuối kỳ" (Default, Enabled)
- Option 2: "Bình quân tức thời" (Disabled, badge "Đang phát triển")
- Option 3: "Giá đích danh" (Disabled, badge "Đang phát triển")
- Option 4: "Nhập trước xuất trước" (Disabled, badge "Đang phát triển")

---

### Navigation cho cả HKD và DNTN
- Back button: Quay về BusinessSectorScreen
- Continue button text: "Hoàn tất thiết lập"
- Khi nhấn "Hoàn tất thiết lập":
  1. Validate tất cả các trường bắt buộc
  2. Gọi API `POST /api/tenants/{tenantId}/accounting-setup`
  3. Gọi API `POST /api/tenants/{tenantId}/complete-onboarding`
  4. Hiển thị Snackbar: "Thiết lập hoàn tất! Đang chuyển đến trang chủ..."
  5. Navigate đến `/home` (ROUTES.HOME)
- Progress: 100%

---

## 6. YÊU CẦU CHUNG VỀ UI/UX

### 6.1. Progress Bar
- Hiển thị ở header trên mọi màn hình
- Component: OnboardingHeader
- Props: `onBack` và `progress` (25/50/75/100)

### 6.2. Background
- Tất cả màn hình: `Welcome screen.png` (cover, center)

### 6.3. Typography
- Tiêu đề: Bricolage Grotesque, 28px, weight 600, color #BA5C00
- Body text: SF Pro Display, 16px, color rgba(0,0,0,0.6)
- Label: SF Pro Display, 14px

### 6.4. Button States
- Primary button: Orange (#FB7E00), pill-shaped (borderRadius 100px)
- Disabled: Gray (#E0E0E0), cursor not-allowed
- Loading: CircularProgress inside button

### 6.5. Mobile Sticky Footer
- Height: 68px + safe-area-inset-bottom
- Background: White (#FFFFFF)
- Shadow: 0 -8px 16px rgba(0,0,0,0.12)
- Content padding bottom: calc(68px + env(safe-area-inset-bottom) + 16px)

### 6.6. Validation
- Real-time validation khi blur khỏi input
- Error message màu đỏ (#D32F2F) hiển thị dưới field
- Button "Tiếp tục" disabled khi có lỗi validation hoặc thiếu trường bắt buộc
- Các trường bắt buộc hiển thị dấu sao * màu đỏ bên cạnh label

### 6.7. Confirm Dialog
- Hiển thị khi nhấn Back button và có thay đổi chưa lưu
- Title: "Xác nhận rời trang"
- Description: "Thông tin trên biểu mẫu chưa được lưu. Nếu bạn rời trang, các thay đổi sẽ bị mất. Bạn có chắc muốn thoát?"
- Buttons: "Hủy" (outlined) và "Rời đi" (error color)

---

## 7. STATE MANAGEMENT

### 7.1. LocalStorage Structure
```typescript
interface OnboardingData {
  businessType: BusinessType; // HKD | DNTN
  businessInfo: {
    taxId: string;
    businessName: string;
    registeredAddress: string;
    ownerName?: string;
    nationalId?: string;
    // DNTN only:
    businessCode?: string;
    establishmentDate?: string;
    employeeCount?: number;
  };
  businessSector: {
    sector: 'THUONG_MAI' | 'DICH_VU' | 'SAN_XUAT' | 'XAY_LAP';
    industryCode: string; // Format: "4711 - Bán lẻ..."
  };
  accountingSetup: {
    // HKD fields:
    accountingRegime?: 'TT88_2021';
    taxFilingFrequency?: 'MONTHLY' | 'QUARTERLY';
    usePOSDevice?: boolean;
    taxIndustryGroup?: string;
    // DNTN fields:
    accountingRegime?: 'TT200_2014' | 'TT133_2016';
    taxCalculationMethod?: 'DEDUCTION' | 'DIRECT';
    baseCurrency?: 'VND' | 'USD';
    hasForeignCurrency?: boolean;
    // Common:
    dataStartDate: string; // ISO format
    inventoryValuationMethod: 'WEIGHTED_AVERAGE' | 'FIFO' | 'LIFO' | 'SPECIFIC';
  };
  isEdit: boolean;
  cachedAt: number;
}
```

### 7.2. API Endpoints

| Endpoint | Method | Payload | Purpose |
|----------|--------|---------|---------|
| `/api/tenants/{id}/business-type` | PUT | `{ businessType }` | Lưu loại hình kinh doanh |
| `/api/tenants/{id}/business-info` | PUT | `{ businessInfo }` | Lưu thông tin định danh |
| `/api/tenants/{id}/business-sector` | PUT | `{ sector, industryCode }` | Lưu lĩnh vực và ngành nghề |
| `/api/tenants/{id}/accounting-setup` | PUT | `{ accountingSetup }` | Lưu cấu hình kế toán |
| `/api/tenants/{id}/complete-onboarding` | POST | - | Hoàn tất onboarding |
| `/api/business-sectors` | GET | - | Lấy danh sách ngành nghề |
| `/api/tax/auto-fill` | POST | `{ taxId }` | Tự động điền thông tin từ MST |

---

## 8. ROUTE MAPPING

| Route | Component | Business Type | Progress |
|-------|-----------|---------------|----------|
| `/onboarding/welcome` | WelcomeScreen | - | 0% |
| `/onboarding/business-type` | BusinessTypeScreen | - | 25% |
| `/onboarding/business-info` | BusinessInfoScreen | HKD | 50% |
| `/onboarding/business-info-dntn` | BusinessInfoScreenDNTN | DNTN | 50% |
| `/onboarding/business-sector` | BusinessSectorScreen | Both | 75% |
| `/onboarding/accounting-setup` | AccountingSetupScreen | Both | 100% |

---

## 9. CHECKLIST IMPLEMENTATION

### Bước 1: Cấu trúc cơ bản
- [x] File requirement này đã hoàn thiện
- [ ] Cập nhật constants.ts với routes mới
- [ ] Tạo types/enums mới trong onboarding.ts

### Bước 2: Components mới
- [ ] BusinessInfoScreenDNTN.tsx
- [ ] BusinessSectorScreen.tsx
- [ ] AccountingSetupScreen.tsx

### Bước 3: Cập nhật logic
- [ ] BusinessTypeScreen: Routing logic dựa trên businessType
- [ ] API services: Thêm endpoints mới

### Bước 4: Testing
- [ ] Test flow HKD từ đầu đến cuối
- [ ] Test flow DNTN từ đầu đến cuối
- [ ] Test validation tất cả các trường
- [ ] Test confirm dialog khi back với unsaved changes
- [ ] Test mobile responsive và sticky footer
- [ ] Test localStorage persistence

---

## 10. NOTES & BEST PRACTICES

1. **Tái sử dụng components**: RoundedTextField, PrimaryButton, OnboardingHeader, Icon, ImageWithSkeleton
2. **Consistent styling**: Sử dụng theme colors, spacing, và typography đã định nghĩa
3. **Error handling**: Tất cả API calls cần try-catch và hiển thị error message
4. **Loading states**: Hiển thị CircularProgress hoặc skeleton khi loading data
5. **Accessibility**: Tất cả input phải có label, error message rõ ràng
6. **Mobile-first**: Ưu tiên mobile UX, sticky footer pattern
7. **Data persistence**: Lưu state vào localStorage sau mỗi bước thành công
