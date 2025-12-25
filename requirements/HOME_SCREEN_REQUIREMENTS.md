# Yêu cầu chi tiết - Luồng Khai báo Danh mục (Declaration Flow)

## Tổng quan
Luồng Khai báo Danh mục được thiết kế để hỗ trợ người dùng thiết lập các danh mục cơ bản sau khi hoàn thành onboarding. Hệ thống sử dụng các chuẩn UX/UI đã được thiết lập ở màn hình Onboarding và Home screen để đảm bảo tính nhất quán.

---

## 1. Hướng dẫn Thiết lập Ban đầu (Setup Modal)

### 1.1. Điều kiện kích hoạt
- **Trigger**: Modal hiển thị tự động ở màn hình Home sau khi user click "Bắt đầu sử dụng" ở màn `AdvancedSetupScreen.tsx`
- **Timing**: Hiển thị sau 500ms khi Home screen được load
- **Condition**: Chỉ hiển thị khi `justCompletedOnboarding === 'true'` và `!hasSeenSetupGuideModal`

### 1.2. Nội dung Modal

#### Header
- **Icon**: Setting2 (Bold variant) - size 32px, color #FB7E00
- **Background**: Vòng tròn 64x64px, màu #FFE8D6
- **Title**: "Bắt đầu sử dụng" - 20px, fontWeight 700, color #212529
- **Description**: "Để bắt đầu sử dụng, bạn hãy hoàn thành các bước dưới đây!" - 14px, color #6C757D

#### Danh sách bước hướng dẫn

**Bước 1: Khai báo danh mục**
- Badge: Badge dạng filled, bên trong có số 1, bgcolor #FB7E00, textColor White
- Background container: borderRadius 12px, bgcolor #F9F9F9
- Title: "Khai báo danh mục" - 16px, fontWeight 600

**Bước 2: Khai báo số dư ban đầu**
- Badge: Badge dạng filled, bên trong có số 2, bgcolor #FB7E00, textColor White
- Background container: borderRadius 12px, bgcolor #F9F9F9
- Title: "Khai báo số dư ban đầu" - 16px, fontWeight 600
#### Action Buttons
- **Nút "Bỏ qua"**: 
  - Variant: outlined
  - BorderColor: #DEE2E6, color: #6C757D
  - BorderRadius: 12px, padding: 12px 24px
  - Action: Đóng modal, set `hasSeenSetupGuideModal = 'true'`

### 1.3. Technical Implementation
```typescript
// LocalStorage flags
localStorage.setItem('justCompletedOnboarding', 'true'); // Set in AdvancedSetupScreen
localStorage.removeItem('hasSeenSetupGuideModal'); // Clear to ensure modal shows
localStorage.setItem('hasSeenSetupGuideModal', 'true'); // Set when user interacts with modal
```

---

## 2. Màn hình Khai báo Danh mục

### 2.1. Layout và Components

#### Header
- Component: `OnboardingHeader`
- Props:
  - `onBack`: Navigate to HOME
  - `progress`: 50 (Bước 1/2)
  - Title: "Khai báo danh mục" - 28px, fontWeight 600, color #BA5C00
  - Subtitle: "Thiết lập các danh mục cơ bản để hệ thống tự động ghi nhận và quản lý giao dịch một cách chính xách" - 16px, color rgba(0,0,0,0.8)

#### Content Container
- Background: #F5F5F5
- BorderRadius: 16px (mobile top only), 16px (desktop all)
- Padding: 16px (mobile), 48px (desktop)
- Position: fixed on mobile from top: 160px, relative on desktop

### 2.2. Danh sách 4 Danh mục Cơ bản

Các danh mục hiển thị theo thứ tự:
1. Danh mục khách hàng
2. Danh mục nhà cung cấp
3. Danh mục Kho
4. Danh mục Hàng hoá dịch vụ

#### Card Component cho mỗi danh mục

**Layout**:
```
[Checkbox] [Tên danh mục] [Count]  [Arrow]                      
```

**Styling**:
- Background: #F9F9F9
- BorderRadius: 12px
- Padding: 16px
- Gap: 16px
- Cursor: pointer
- Hover: background rgba(0,0,0,0.02)

**Trạng thái hoàn thành**:

*Chưa có dữ liệu*:
- Hiển thị checkbox trạng thái unchecked
*Đã có dữ liệu*:
-Hiển thị checkbox trạng thái checked
- Text: "{count} mục" - 14px, color #28A745, fontWeight 600
- Badge background: #E8F5E9

**Navigation**:
- Click vào từng card navigate đến màn hình thêm mới tương ứng:
  - Danh mục khách hàng → `/declaration/customers/new`
  - Danh mục nhà cung cấp → `/declaration/suppliers/new`
  - Danh mục kho → `/declaration/warehouses/new`
  - Danh mục hàng hoá dịch vụ → `/declaration/products/new`

### 2.3. Action Buttons

#### Desktop Layout (bottom, 2 buttons side by side)
- Container: flex row, gap 12px, mt 4

**Nút "Khai báo số dư ban đầu"**:
- Variant: text
- Border: 1px solid #FB7E00, color: #FB7E00
- BorderRadius: 100px, height: 48px
- Icon: `MoneyRecive` (Outline) - 20px
- Action: Navigate to `/declaration/initial-balance`

**Nút "Bắt đầu sử dụng"**:
- Variant: contained
- Background: #FB7E00, color: white
- BorderRadius: 100px, height: 48px
- Action: Complete declaration flow, navigate to HOME

#### Mobile Layout (sticky footer)
- Position: fixed, bottom: 0
- Background: white
- Box shadow: 0 -8px 16px rgba(0,0,0,0.12)
- Min height: calc(80px + env(safe-area-inset-bottom))
- Z-index: 1400

Buttons stacked vertically:
1. "Bắt đầu sử dụng" (contained)
2. "Khai báo số dư ban đầu" (outlined)

---

## 3. Biểu mẫu Khai báo Khách hàng

### 3.1. Route và Navigation
- **Route**: `/declaration/customers/new`
- **Edit Route**: `/declaration/customers/:id/edit`
- **Back Navigation**: Return to `/declaration/categories`

### 3.2. Header
- Component: `OnboardingHeader`
- Title: "Thêm khách hàng" (new)
- Back button: Show confirm dialog if form has changes

### 3.3. Form Fields

#### Section 1: Phân loại đối tượng

**Radio Button "Loại khách hàng"** (*required)
- Component: `RoundedTextField` with select
- Options: 
  - "Tổ chức" (default)
  - "Cá nhân"
- Behavior: Thay đổi các trường hiển thị dựa trên lựa chọn

**Checkbox "Đồng thời là nhà cung cấp"**
- Component: MUI Checkbox
- CheckedColor: #FB7E00
- Position: Dưới dropdown loại khách hàng
- Behavior: Khi checked, dữ liệu sẽ được sync sang bảng suppliers với `dualRole = true`

#### Section 2: Thông tin định danh (Tổ chức)

**Mã khách hàng** (*required)
- Component: `RoundedTextField`
- Auto-generate: Format "KH{timestamp}" nếu để trống
- Validation: Unique trong tenant, không chứa ký tự đặc biệt
- Max length: 20

**Mã số thuế** (*required)
- Component: `RoundedTextField`
- EndAdornment: IconButton `SearchNormal` để lookup mã số thuế từ API cục thuế
- InputProps: inputMode numeric, pattern [0-9]*
- Length: 10 hoặc 13 chữ số
- Validation: Format MST hợp lệ
- Lookup behavior: 
  - Call API `/api/tax-lookup?taxCode={value}`
  - Auto-fill: businessName, address nếu tìm thấy
  - Show notification nếu không tìm thấy

**Tên khách hàng** (*required)
- Component: `RoundedTextField`
- Max length: 255
- Auto-fill từ tax lookup

**Địa chỉ**
- Component: `RoundedTextField`
- Multiline: 2 rows
- Max length: 500
- Auto-fill từ tax lookup

**Số điện thoại**
- Component: `RoundedTextField`
- InputProps: inputMode tel
- Validation: Format số điện thoại VN (10số)
- Pattern: ^(0|\+84)[0-9]{9,10}$

**Nhóm khách hàng**
- Component: `RoundedTextField` with select/autocomplete
- Options: Load from `/api/customer-groups`
- Searchable screen (danh sách nhóm khách hàng)
- IconButton `Add` để thêm nhóm mới
- Behavior: Click Add → Open full screen "Thêm nhóm khách hàng"

#### Section 2b: Thông tin định danh (Cá nhân)

**Mã khách hàng** (*required)
- Same as Tổ chức

**Số CCCD** (*required)
- Component: `RoundedTextField`
- EndAdornment: IconButton `SearchNormal` để lookup
- Length: 9 hoặc 12 chữ số
- Validation: Format CCCD hợp lệ
- Lookup behavior: Call API `/api/id-lookup?idNumber={value}`

**Tên khách hàng** (*required)
- Same as Tổ chức

**Nhóm khách hàng**
- Same as Tổ chức

#### Section 3: Người liên hệ

**Expandable Section "Người liên hệ"**
- Collapsed by default
- Click to expand/collapse

**Họ và tên**
- Component: `RoundedTextField`
- Max length: 100

**Số điện thoại**
- Component: `RoundedTextField`
- Validation: Same as above

**Email**
- Component: `RoundedTextField`
- Validation: Email format
- Pattern: ^[^\s@]+@[^\s@]+\.[^\s@]+$

#### Section 4: Người nhận hoá đơn điện tử (Tổ chức)

**Expandable Section "Người nhận hoá đơn điện tử"**
- Collapsed by default
- Description: "Email nhận hoá đơn tự động khi phát hành"

**Họ tên**
- Component: `RoundedTextField`
- Max length: 100

**Số điện thoại**
- Component: `RoundedTextField`

**Email** (*required if section filled)
- Component: `RoundedTextField`
- Validation: Email format

#### Section 5: Tài khoản ngân hàng (Tổ chức)

**Expandable Section "Tài khoản ngân hàng"**
- Collapsed by default
- Icon: `Bank` (Outline) - 20px

**Số tài khoản**
- Component: `RoundedTextField`
- InputProps: inputMode numeric
- Validation: 6-20 chữ số

**Tên ngân hàng**
- Component: `RoundedTextField` with select
- Options: Load from `/api/banks`
- Searchable screen (danh sách ngân hàng)
- Format: "{bankCode} - {bankName}"

**Chi nhánh**
- Component: `RoundedTextField`
- Max length: 255

**Lưu ý**: Đối với khách hàng là cá nhân thì mục thông tin liên hệ chỉ có 2 text fields là Số điện thoại và Email, validate như trên

### 3.4. Action Buttons

#### Desktop Layout
- Container: flex row, gap 12px, justifyContent flex-end, mt 4

**Nút "Lưu"**:
- Variant: outlined
- Background: #FB7E00
- Disabled: !isFormValid
- Action: 
  - POST `/api/customers`
  - Show success notification
  - Navigate back to categories list

**Nút "Lưu và thêm mới"**:
- Variant: contained
- Background: #007DFB
- Disabled: !isFormValid
- Action:
  - POST `/api/customers`
  - Show success notification
  - Reset form
  - Keep modal open

#### Mobile Layout (sticky footer)
- Position: fixed bottom
- 2 buttons: "Lưu" (50% width), "Lưu và thêm mới" (50% width, icon only), gap 2

### 3.5. Validation Rules

**Client-side**:
- Required fields: Mã khách hàng, MST/CCCD, Tên khách hàng, Địa chỉ
- Format validation: Phone, email, tax code, ID number
- Length validation: All text fields
- Real-time validation on blur

**Server-side**:
- Unique: Mã khách hàng, MST/CCCD per tenant
- Business rules: If dualRole, check supplier table for duplicates

### 3.6. Confirm Dialog (Unsaved Changes)

**Trigger**: User clicks back/cancel with form changes

**Content**:
- Title: "Thay đổi chưa được lưu"
- Description: "Bạn có muốn lưu thay đổi trước khi rời khỏi trang?"
- Icon: `Warning2` (Bold) - color #FFA500

**Buttons**:
- "Hủy bỏ thay đổi" - variant text, color error
- "Tiếp tục chỉnh sửa" - variant outlined
- "Lưu" - variant contained, bgcolor #FB7E00

---

## 4. Biểu mẫu Khai báo Nhà cung cấp

### 4.1. Route và Navigation
- **Route**: `/declaration/suppliers/new`
- **Edit Route**: `/declaration/suppliers/:id/edit`
- **Back Navigation**: Return to `/declaration/categories`

### 4.2. Header
- Component: `OnboardingHeader`
- Title: "Thêm mới nhà cung cấp"
### 4.3. Form Fields

#### Section 1: Phân loại

**Radio button "Loại nhà cung cấp"** (*required)
- Options: "Tổ chức" (default), "Cá nhân"
**Checkbox "Đồng thời là khách hàng"**
- Sync dữ liệu sang bảng customers với `dualRole = true`

#### Section 2: Thông tin định danh (Tổ chức)

**Mã nhà cung cấp** (*required)
- Auto-generate: Format "NCC{timestamp}"
- Max length: 20
- Unique validation

**Mã số thuế** (*required)
- Length: 10-13 digits
- Lookup integration

**Tên nhà cung cấp** (*required)
- Max length: 255

**Địa chỉ**
- Multiline: 2 rows

**Số điện thoại**
- Validation: VN phone format

**Nhóm nhà cung cấp**
- Mở danh sách nhà cung cấp có sẵn (chưa có thì hiển thị empty state)
- Add new group option

#### Section 2b: Thông tin định danh (Cá nhân)

**Mã nhà cung cấp** (*required)
- Same as above

**Số CCCD** (*required)
- Length: 9-12 digits

**Tên nhà cung cấp** (*required)
- 
**Nhóm nhà cung cấp**
- Same as above

#### Section 3: Trạng thái

**Switch "Đang sử dụng"**
- Component: MUI Switch
- CheckedColor: #FB7E00
- Default: true
- Title: Đang sử dụng

#### Section 4: Người liên hệ chính

**Expandable Section**
- Fields: Họ và tên, Số điện thoại, Email
- Same structure as Khách hàng form


#### Section 5: Tài khoản ngân hàng

**Expandable Section**
- Fields: Số tài khoản, Tên ngân hàng, Chi nhánh
- Note: "Thông tin này sẽ tự động điền vào phiếu chi"

### 4.4. Action Buttons
- Same structure as Khách hàng form
- API endpoint: `/api/suppliers`

### 4.5. Validation Rules
- Same rules as Khách hàng
- Additional: Check status field on save

---

## 5. Biểu mẫu Khai báo Danh mục Kho

### 5.1. Route và Navigation
- **Route**: `/declaration/warehouses/new`
- **Edit Route**: `/declaration/warehouses/:id/edit`

### 5.2. Form Fields

#### Section 1: Thông tin cơ bản

**Mã kho** (*required)
- Component: `RoundedTextField`
- Auto-generate: Format "KHO{indexnumber}" - tịnh tiến từ 1
- Max length: 20
- Unique per tenant

**Tên kho** (*required)
- Component: `RoundedTextField`
- Max length: 255
- Example: "Kho tổng", "Kho chi nhánh HN"

#### Section 2: Địa chỉ

**Địa chỉ kho**
- Component: `RoundedTextField`
- Max length: 255

#### Section 3: Trạng thái

**Switch "Đang sử dụng"**
- Default: true
- Description: "Kho sẽ hiển thị trong các giao dịch nhập/xuất"

### 5.3. Action Buttons
- Same structure: Lưu, Lưu và thêm mới
- API endpoint: `/api/warehouses`

### 5.4. Validation
- Required: Mã kho, Tên kho
- Unique: Mã kho per tenant
- Format: Phone number if provided

---

## 6. Biểu mẫu Khai báo Hàng hoá và Dịch vụ

### 6.1. Route và Navigation
- **Route**: `/declaration/products/new`
- **Edit Route**: `/declaration/products/:id/edit`

### 6.2. Header
- Title: "Thêm mới hàng hoá/dịch vụ"
- Additional: Barcode scan button top-right
  - Icon: `ScanBarcode` (Outline) - 24px, color #FB7E00
  - Action: Open camera to scan barcode/QR code
  - On scan success: Auto-fill Mã sản phẩm field

### 6.3. Form Fields

#### Section 1: Hình ảnh sản phẩm

**Image Upload**
- Component: ImageUpload with preview
- Size: 120x120px, borderRadius 12px
- Border: 2px dashed #DEE2E6
- Center icon: `Gallery` (Outline) - 32px, color #ADB5BD
- Accept: image/jpeg, image/png, image/webp
- Max size: 5MB
- Preview: Show uploaded image with edit/remove icons
- Storage: Upload to `/api/uploads/products`

#### Section 2: Thông tin chung
**Bottom sheet "Tính chất"** 
- Component: `RoundedTextField`
- Barcode scan button right
  - Icon: `ScanBarcode` (Outline) - 24px, color #FB7E00
  - Action: Open camera to scan barcode/QR code
  - On scan success: Auto-fill barcode dạng series
**Bottom sheet "Tính chất"** (*required)
- Component: `RoundedTextField` with select
- Options:
  - "Hàng hoá" (default)
  - "Dịch vụ"
  - "Nguyên vật liệu"
  - "Thành phẩm"

**Mã sản phẩm** (*required)
- Component: `RoundedTextField`
- Auto-generate: Format "VT{product-code}" dạng 0000x (tịnh tiến từ 00001)
- Max length: 50
- Unique per tenant
- Can be edited by users

**Tên hàng hoá** (*required)
- Component: `RoundedTextField`
- Max length: 255

**Nhóm hàng hoá dịch vụ**
- Component: `RoundedTextField` with select/autocomplete
- Options: Load from `/api/product-groups`
- Searchable screen (danh sách nhóm hàng hoá dịch vụ) - chưa có hiển thị empty state
- EndAdornment: IconButton `Add` để thêm nhóm mới
- On click Add:
  - Open bottom sheet "Thêm nhóm hàng hoá"
  - Fields: Mã nhóm (auto), Tên nhóm (*required)
  - On save: Add to danh sách and auto-select

**Đơn vị tính chính** (*required)
- Component: `RoundedTextField` with select/autocomplete
- Options: Load from `/api/units`
  - Examples: "Cái", "Đôi", "Kg", "Lít", "Gói", "Thùng"
- Searchable screen (danh sách đơn vị tính) - chưa có hiển thị empty state 
- EndAdornment: IconButton `Add` để thêm đơn vị mới

#### Section 3: Giá và tồn kho

**Đơn giá bán**
- Component: `RoundedTextField`
- Type: number
- InputProps: 
  - inputMode: decimal
  - InputAdornment end: "₫"
- Format: Thousand separator (123,456,789) và hiển thị dấu phẩy realtime khi user nhập
- Min: 0
- Step: 1000

**Đơn giá mua**
- Component: `RoundedTextField`
- Same props as Đơn giá bán

**Kho ngầm định**
- Component: `RoundedTextField` with select, click mở danh sách kho hiện có ở full screen, chưa có hiển thị empty state và có button add new
- Options: Load from `/api/warehouses` where status = active
- Description: "Kho sử dụng mặc định khi bán hàng"

**Tồn kho ban đầu**
- Component: `RoundedTextField`
- Type: number
- InputProps: inputMode decimal
- Format: Thousand separator
- Default: 0

**Switch "Cho phép bán hàng âm"**
- Component: MUI Switch
- CheckedColor: #FB7E00
- Default: false
- Warning snack (when checked):
  - Icon: `Warning2` (Outline)
  - Text: "Lưu ý: Tồn kho có thể bị âm nếu bật tính năng này"

#### Section 5: Thuế

**Đối với hộ kinh doanh**
**Thuế GTGT mua vào (%)**
- Component: `RoundedTextField` with select
- Icon: `ReceiptDiscount` (Outline)
- Default value chưa chọn option nào
- Options:
  - "0%" 
  - "2%"
  - "5%"
  - "8%"
  - "10%"

**Nhóm ngành nghề tính thuế** (*required)
- Component: `RoundedTextField` with select
- Icon: `Briefcase` (Outline)
- Placeholder: "Chọn nhóm ngành nghề"
- Click behavior: Open bottom sheet with industry list
- Display selected: "{industryName} (GTGT: {vatRate}%, TNCN: {pitRate}%)"

**Bottom Sheet** - Chọn Nhóm Ngành nghề, lấy từ bottom sheet Chọn Nhóm ngành nghê tính thuế

**Đối với doanh nghiệp tư nhân**
- **Thuế GTGT (%)** (áp dụng cho cả thuế mua vào và thuế bán ra)
- Component: `RoundedTextField` with select
- Icon: `ReceiptDiscount` (Outline)
- Default value chưa chọn option nào
- Options:
  - "0%" 
  - "2%"
  - "5%"
  - "8%"
  - "10%"

### 6.4. Action Buttons
- Same structure: Lưu, Lưu và thêm mới
- API endpoint: `/api/products`
- Additional validation: Required tax industry selection

### 6.5. Validation Rules

**Required fields**:
- Tính chất
- Mã sản phẩm (unique)
- Tên hàng hoá
- Đơn vị tính
- Nhóm ngành nghề tính thuế

**Format validation**:
- Đơn giá bán/mua: >= 0
- Tồn kho ban đầu: >= 0
- Image: valid format, max 5MB

**Business rules**:
- Nếu "Cho phép bán hàng âm" = false, kiểm tra tồn kho khi xuất
- Kho ngầm định phải active
- Barcode unique per tenant (if provided)

---

## 7. Yêu cầu về Tương tác và Luồng dữ liệu (UX/UI)

### 7.1. Design System Tokens

**Colors**:
- Primary Orange: #FB7E00
- Primary Blue: #007DFB
- Link Blue: #0D6EFD
- Success Green: #28A745
- Error Red: #DC3545
- Warning Orange: #FFA500
- Text Primary: #212529
- Text Secondary: #6C757D
- Border: #DEE2E6
- Background: #F8F9FA
- Surface: #FFFFFF

**Typography**:
- Heading 1: 28px, fontWeight 600, Bricolage Grotesque
- Heading 2: 20px, fontWeight 700
- Body: 16px, fontWeight 400
- Body Small: 14px
- Caption: 12px

**Spacing**:
- xs: 4px
- sm: 8px
- md: 16px
- lg: 24px
- xl: 32px

**Border Radius**:
- Small: 8px
- Medium: 12px
- Large: 16px
- XLarge: 24px
- Pill: 100px

### 7.2. Component Reusability

**Shared Components** (from Onboarding):
- `OnboardingHeader`: Header with back button and progress
- `RoundedTextField`: Custom text field with rounded corners
- `PrimaryButton`: Primary action button
- `BottomSheet`: Modal bottom sheet with drag handle
- `ConfirmDialog`: Confirmation dialog with 3 actions
- `Icon`: Dynamic icon loader from iconsax-react

### 7.3. Form Behavior

#### Auto-save Draft (Optional enhancement)
- Save form data to localStorage every 30s
- Key format: `declaration_draft_{entity}_{tenantId}`
- Show "Khôi phục bản nháp" option on form mount if draft exists
- Clear draft on successful save

#### Field Dependencies
- Tax code lookup → Auto-fill name, address
- ID number lookup → Auto-fill name
- Select warehouse → Show current stock if editing product
- Dual role checkbox → Show sync notification

#### Error Handling
- **Client-side validation**: Real-time on blur
- **Server-side validation**: Show errors below fields
- **Network errors**: Show retry button with error message
- **Duplicate errors**: Highlight field with specific message

#### Loading States
- Form submit: Button shows CircularProgress
- Lookup API: Show small spinner in EndAdornment
- Dropdown loading: Show skeleton items

### 7.4. Responsive Design

#### Mobile (< 600px)
- Stack all form sections vertically
- Sticky footer for action buttons
- Full-width inputs
- Collapsible sections closed by default (except required)
- Bottom sheet height: 90vh max

#### Tablet (600px - 960px)
- 2-column grid for short fields (phone, email)
- Side-by-side action buttons
- Bottom sheet height: 70vh max

#### Desktop (> 960px)
- Max width: 800px container
- 3-column grid for short fields
- Inline action buttons (right-aligned)
- Modal dialog instead of bottom sheet for sub-forms

### 7.5. Accessibility

- All form fields have proper labels
- Required fields marked with * (aria-required)
- Error messages linked to fields (aria-describedby)
- Keyboard navigation: Tab order logical
- Focus visible: 2px outline #FB7E00
- Color contrast: WCAG AA compliant
- Screen reader: Announce validation errors

### 7.6. Performance

- Debounce search inputs: 300ms
- Lazy load dropdown options: Virtual scroll for > 50 items
- Image optimization: Compress to max 500KB before upload
- Form validation: Async validation only for unique fields
- Cache API responses: 5 minutes for reference data (banks, units, groups)

### 7.7. Notification System

**Success Notification** (Snackbar):
- Position: bottom center
- Background: #28A745
- Icon: `TickCircle` (Bold)
- Duration: 3000ms
- Messages:
  - "Đã thêm {entity} thành công"
  - "Đã cập nhật {entity} thành công"

**Error Notification** (Snackbar):
- Position: bottom center
- Background: #DC3545
- Icon: `CloseCircle` (Bold)
- Duration: 5000ms
- Action button: "Thử lại"

**Warning Notification** (Alert inline):
- Background: #FFF3E0
- Border: 1px solid #FFB74D
- Icon: `Warning2` (Outline)
- Use cases: Negative inventory warning, duplicate warning

### 7.8. Navigation Flow

```
HomeScreen (Setup Modal)
  ↓ [Bắt đầu thiết lập]
DeclarationCategoriesScreen (Hub)
  ↓ [Click Khách hàng]
CustomerFormScreen
  ↓ [Lưu]
DeclarationCategoriesScreen (updated with count)
  ↓ [Click Nhà cung cấp]
SupplierFormScreen
  ↓ [Lưu và thêm mới]
SupplierFormScreen (reset form)
  ↓ [Lưu]
DeclarationCategoriesScreen
  ↓ [Bắt đầu sử dụng]
HomeScreen (declarationComplete = true)
```

### 7.9. Data Persistence

#### LocalStorage Keys
```typescript
// Flags
'justCompletedOnboarding': 'true' | null
'hasSeenSetupGuideModal': 'true' | null
'declarationCompleted': 'true' | null

// Draft data (optional)
'declaration_draft_customer_{tenantId}': FormData
'declaration_draft_supplier_{tenantId}': FormData
'declaration_draft_warehouse_{tenantId}': FormData
'declaration_draft_product_{tenantId}': FormData

// Cached reference data
'ref_banks': Bank[]
'ref_units': Unit[]
'ref_customer_groups': Group[]
'ref_supplier_groups': Group[]
'ref_product_groups': Group[]
'ref_tax_industries': Industry[]
```

#### API Endpoints

**Create**:
- `POST /api/customers`
- `POST /api/suppliers`
- `POST /api/warehouses`
- `POST /api/products`

**Read**:
- `GET /api/customers?tenantId={id}&page={page}&limit={limit}`
- `GET /api/customers/{id}`
- Similar for suppliers, warehouses, products

**Update**:
- `PUT /api/customers/{id}`
- Similar for other entities

**Delete**:
- `DELETE /api/customers/{id}`

**Reference Data**:
- `GET /api/banks`
- `GET /api/units`
- `GET /api/customer-groups?tenantId={id}`
- `GET /api/tax-industries`

**Lookup**:
- `GET /api/tax-lookup?taxCode={code}`
- `GET /api/id-lookup?idNumber={number}`

---

## 8. Implementation Priority

### Phase 1 (MVP)
1. DeclarationCategoriesScreen (hub)
2. CustomerFormScreen (basic fields)
3. SupplierFormScreen (basic fields)
4. WarehouseFormScreen
5. ProductFormScreen (without tax industry)

### Phase 2 (Enhanced)
1. Tax code lookup integration
2. ID number lookup integration
3. Dual role sync logic
4. Tax industry selection bottom sheet
5. Image upload for products

### Phase 3 (Polish)
1. Auto-save draft functionality
2. Barcode scanner integration
3. Advanced validation rules
4. Performance optimization (virtual scroll)
5. Analytics tracking

---

## 9. Testing Requirements

### Unit Tests
- Form validation logic
- Field dependencies
- Auto-fill behavior
- Format functions (phone, currency)

### Integration Tests
- Form submission flow
- API error handling
- Dual role sync
- Navigation flow

### E2E Tests
- Complete declaration flow
- Save and continue flow
- Edit existing entries
- Back navigation with unsaved changes

### Accessibility Tests
- Keyboard navigation
- Screen reader compatibility
- Color contrast
- Focus management

---

## 10. Success Metrics

- **Completion Rate**: % users who complete at least 1 category
- **Time to Complete**: Average time per form submission
- **Error Rate**: % submissions with validation errors
- **Adoption Rate**: % users who use "Lưu và thêm mới"
- **Return Rate**: % users who return to edit entries

---

## Phụ lục A: Wireframes

### A.1. Setup Modal
```
┌─────────────────────────────────────┐
│            [Setting Icon]            │
│                                     │
│      Khai báo danh mục             │
│  Để bắt đầu sử dụng, vui lòng...   │
│                                     │
│  [Icon] Khai báo danh mục           │
│         Khách hàng, nhà cung cấp... │
│                                     │
│  [Icon] Khai báo số dư ban đầu      │
│         Tiền mặt, ngân hàng...      │
│                                     │
│  [Bỏ qua]    [Bắt đầu thiết lập]   │
└─────────────────────────────────────┘
```

### A.2. Categories Hub Screen
```
┌─────────────────────────────────────┐
│  [←] Khai báo danh mục        50%   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ [👤] Khách hàng    [✓] 12   │   │
│  │      Tổ chức, cá nhân       │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ [🚚] Nhà cung cấp  [○]      │   │
│  │      Chưa khai báo          │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ [📦] Kho           [✓] 3    │   │
│  │      Địa điểm lưu trữ       │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ [🛒] Hàng hoá      [○]      │   │
│  │      Chưa khai báo          │   │
│  └─────────────────────────────┘   │
│                                     │
│  [Khai báo số dư] [Bắt đầu SD]    │
└─────────────────────────────────────┘
```

### A.3. Customer Form (Mobile)
```
┌─────────────────────────────────────┐
│  [←] Thêm khách hàng                │
│  ─────────────────────────────────  │
│  Loại khách hàng *                  │
│  [🏢] [Tổ chức            ▼]        │
│                                     │
│  ☑ Đồng thời là nhà cung cấp        │
│                                     │
│  Mã khách hàng *                    │
│  [📄] [KH1234567890           ]    │
│                                     │
│  Mã số thuế *                       │
│  [🧾] [0108344905        ] [🔍]    │
│                                     │
│  Tên khách hàng *                   │
│  [🏢] [Công ty ABC           ]     │
│                                     │
│  Địa chỉ                            │
│  [📍] [Hà Nội                ]     │
│       [                       ]     │
│                                     │
│  ▶ Người liên hệ                    │
│  ▶ Người nhận hoá đơn điện tử       │
│  ▶ Tài khoản ngân hàng              │
│  ─────────────────────────────────  │
│  [Lưu]         [Lưu và thêm mới]   │
└─────────────────────────────────────┘
```

---

## Phụ lục B: API Payload Examples

### B.1. Create Customer (Tổ chức)
```json
{
  "type": "organization",
  "code": "KH1234567890",
  "taxCode": "0108344905",
  "name": "Công ty TNHH ABC",
  "address": "123 Nguyễn Văn Linh, Hà Nội",
  "phone": "0987654321",
  "groupId": "group_001",
  "isDualRole": true,
  "contact": {
    "name": "Nguyễn Văn A",
    "phone": "0912345678",
    "email": "nva@abc.com"
  },
  "eInvoiceRecipient": {
    "name": "Trần Thị B",
    "phone": "0923456789",
    "email": "ttb@abc.com"
  },
  "bankAccount": {
    "accountNumber": "1234567890",
    "bankCode": "VCB",
    "branch": "Chi nhánh Hoàn Kiếm"
  }
}
```

### B.2. Create Product
```json
{
  "type": "goods",
  "code": "SP1234567890",
  "barcode": "8934567890123",
  "name": "Áo thun nam cotton",
  "groupId": "group_001",
  "unitId": "unit_001",
  "imageUrl": "https://cdn.example.com/products/ao-thun.jpg",
  "sellingPrice": 250000,
  "buyingPrice": 150000,
  "defaultWarehouseId": "warehouse_001",
  "initialStock": 100,
  "allowNegativeStock": false,
  "inputVat": 10,
  "taxIndustryId": "industry_001"
}
```

---

## Changelog

| Version | Date       | Author | Changes                              |
|---------|------------|--------|--------------------------------------|
| 1.0     | 2024-12-24 | AI     | Initial requirements document        |

