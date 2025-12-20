# Onboarding Flow Requirements - Phase 1

## Tổng quan

Luồng onboarding được kích hoạt sau khi người dùng mới tạo tenant thành công lần đầu tiên. Mục tiêu là thu thập thông tin doanh nghiệp cần thiết để:
- Cá nhân hóa trải nghiệm người dùng
- Cung cấp tính năng phù hợp với loại hình kinh doanh
- Thiết lập cơ sở dữ liệu cho các nghiệp vụ kế toán/ERP

## User Story

**Là** người dùng mới  
**Tôi muốn** được hướng dẫn thiết lập thông tin doanh nghiệp  
**Để** có thể bắt đầu sử dụng hệ thống phù hợp với nhu cầu của mình

## Điều kiện kích hoạt

- User vừa tạo tenant mới thành công
- User chưa hoàn thành quá trình onboarding (`onboarding_completed` = false)
- Redirect từ màn hình tenant selection/creation

## User Flow

```
1. Welcome Screen
   ↓ (Nhấn "Bắt đầu thiết lập")
2. Business Type Selection
   ↓ (Chọn loại hình + "Tiếp tục")
3. Business Information
   ↓ (Điền form + "Tiếp tục")
4. [Phase 2 - TBD]
```

---

## 1. Welcome Screen (Màn hình Chào mừng)

### Mục tiêu
- Giới thiệu mục đích của quá trình onboarding
- Tạo động lực cho user hoàn thành thiết lập
- Dẫn dắt user vào luồng một cách tự nhiên

### UI Components

#### Header
- **Title**: "Bắt đầu thiết lập"
- **Style**: Typography H4, Bold, Center aligned

#### Content Area
- **Illustration**: Mascot chú chó mang kính lúp
  - Size: 240x240px
  - Position: Center, top of screen
  - Format: SVG hoặc PNG với background transparent

- **Description Text**: 
  ```
  Thiết lập giúp ứng dụng hỗ trợ tối đa 
  nghiệp vụ hàng ngày và cá nhân hóa 
  trải nghiệm của bạn
  ```
  - Style: Body text, Center aligned, Color: Gray-600
  - Max width: 320px

#### Action Button
- **Label**: "Bắt đầu thiết lập"
- **Style**: 
  - Primary button (Orange/Brand color)
  - Full width (với padding 24px)
  - Height: 48px
  - Border radius: 8px
  - Font weight: 600

### Behavior
- **Initial State**: Button luôn enabled
- **On Click**: Navigate to Business Type Selection screen
- **Animation**: Smooth fade-in khi load screen (300ms)

### Technical Notes
- Route: `/onboarding/welcome`
- Không có back button (user không thể quay lại)
- Screen không có auto-redirect

---

## 2. Business Type Selection (Chọn loại hình kinh doanh)

### Mục tiêu
- Phân loại user theo loại hình pháp lý
- Xác định feature set phù hợp cho từng loại hình
- Thu thập thông tin cơ bản về quy mô doanh nghiệp

### UI Components

#### Progress Bar
- **Position**: Top of screen, below header
- **Current Step**: 1/3
- **Style**: Linear progress indicator
- **Color**: Primary color for filled portion

#### Header
- **Back Button**: `<` icon, top-left
- **Title**: "Loại hình kinh doanh"
- **Style**: Typography H5, Bold

#### Business Type Cards

##### 1. Hộ Kinh Doanh Cá Thể (HKD)
- **Icon**: Cửa hàng icon
- **Label**: "Hộ kinh doanh cá thể"
- **Description**: "Phù hợp cho cửa hàng, quán ăn, dịch vụ nhỏ"
- **Status**: Enabled
- **Value**: `HOUSEHOLD_BUSINESS`

##### 2. Doanh Nghiệp Tư Nhân (DNTN)
- **Icon**: Tòa nhà + nhân sự icon
- **Label**: "Doanh nghiệp tư nhân"
- **Description**: "Dành cho doanh nghiệp có nhân sự và quy mô vừa"
- **Status**: Enabled
- **Value**: `PRIVATE_ENTERPRISE`

##### 3. Công ty TNHH/Cổ phần
- **Icon**: Tòa nhà lớn icon
- **Label**: "Công ty TNHH/Cổ phần"
- **Description**: "Dành cho công ty có pháp nhân"
- **Status**: Coming soon (Disabled)
- **Badge**: "Sắp ra mắt"
- **Value**: `LIMITED_COMPANY` (không thể chọn)

**Card Styling**:
- Default: Border 1px solid Gray-300, Background White
- Selected: Border 2px solid Primary-500, Background Primary-50
- Disabled: Opacity 0.6, Cursor not-allowed
- Spacing: 12px between cards

#### Action Button
- **Label**: "Tiếp tục"
- **Style**: Primary button, Full width
- **Enabled State**: Chỉ khi đã chọn 1 business type (enabled option)

### Behavior

#### Selection Logic
- **Selection Type**: Single choice (radio behavior)
- **On Card Click**: 
  - Deselect previous selection
  - Select current card
  - Enable "Tiếp tục" button
  - Visual feedback: Card border change + background color

#### Validation
- **Required**: Phải chọn 1 loại hình
- **Error Message**: Không hiển thị error (button disable thay vì error)

#### Navigation
- **Back Button**: Return to Welcome Screen (show confirmation dialog)
- **Continue Button**: 
  - Save selected business type to state
  - Navigate to Business Information screen

### State Management
```typescript
interface BusinessTypeState {
  selectedType: 'HOUSEHOLD_BUSINESS' | 'PRIVATE_ENTERPRISE' | null;
  isValid: boolean;
}
```

### Technical Notes
- Route: `/onboarding/business-type`
- Save selection to session/context
- No API call at this step (save later)

---

## 3. Business Information - HKD (Thông tin Hộ Kinh Doanh)

### Mục tiêu
- Thu thập thông tin pháp lý bắt buộc
- Tự động điền thông tin từ hệ thống thuế (nếu có)
- Validate dữ liệu đầu vào

### UI Components

#### Progress Bar
- **Current Step**: 2/3

#### Header
- **Back Button**: `<` icon
- **Title**: "Thông tin Hộ kinh doanh"

#### Form Fields

##### 1. Mã số thuế (Tax ID)
- **Label**: "Mã số thuế" *
- **Type**: Text input (numeric)
- **Placeholder**: "Nhập mã số thuế"
- **Max Length**: 13
- **Pattern**: 10 hoặc 13 chữ số
- **Required**: Yes
- **Actions**: 
  - Button "Lấy thông tin" (secondary button, inline)
  - Icon: Refresh/Download icon

##### 2. Tên Hộ kinh doanh
- **Label**: "Tên Hộ kinh doanh" *
- **Type**: Text input
- **Placeholder**: "VD: Cửa hàng tạp hóa Minh An"
- **Max Length**: 255
- **Required**: Yes
- **Auto-fill**: Yes (từ API thuế)

##### 3. Địa chỉ đăng ký
- **Label**: "Địa chỉ đăng ký" *
- **Type**: Textarea
- **Placeholder**: "Nhập địa chỉ đầy đủ"
- **Rows**: 3
- **Max Length**: 500
- **Required**: Yes
- **Auto-fill**: Yes (từ API thuế)

##### 4. Tên chủ hộ kinh doanh
- **Label**: "Tên chủ hộ kinh doanh"
- **Type**: Text input
- **Placeholder**: "Nhập họ và tên"
- **Max Length**: 100
- **Required**: No
- **Auto-fill**: Yes (từ API thuế, nếu có)

##### 5. CCCD
- **Label**: "CCCD"
- **Type**: Text input (numeric)
- **Placeholder**: "Nhập số CCCD"
- **Length**: 12 chữ số
- **Required**: No
- **Auto-fill**: No

**Field Layout**:
- Stack vertically
- Spacing: 16px between fields
- Label: 14px, Medium weight, Gray-700
- Required indicator (*): Red-500
- Input height: 44px
- Border radius: 6px

#### Helper Text & Validation Messages

##### Mã số thuế
- **Pattern Error**: "Mã số thuế phải là 10 hoặc 13 chữ số"
- **API Error**: "Không tìm thấy thông tin. Vui lòng kiểm tra lại mã số thuế"
- **Success**: Auto-fill các trường khác (không hiển thị message)

##### Tên Hộ kinh doanh
- **Required Error**: "Vui lòng nhập tên hộ kinh doanh"

##### Địa chỉ
- **Required Error**: "Vui lòng nhập địa chỉ đăng ký"

##### CCCD
- **Pattern Error**: "CCCD phải là 12 chữ số"

#### Action Buttons
- **Primary**: "Tiếp tục"
  - Enabled: Khi tất cả required fields hợp lệ
  - Disabled: Default state
- **Secondary**: "Lấy thông tin" (inline với Mã số thuế)

### Behavior

#### Auto-fill Feature

**Trigger**: User clicks "Lấy thông tin" button

**Prerequisites**:
- Mã số thuế phải hợp lệ (10 hoặc 13 số)
- Input không rỗng

**Process**:
1. Disable "Lấy thông tin" button
2. Show loading indicator
3. Call API: `GET /api/tax-info?taxId={value}`
4. Handle Response:
   - **Success**: 
     - Fill fields: Tên HKD, Địa chỉ, Tên chủ hộ
     - Show success toast: "Đã lấy thông tin thành công"
     - Focus on first empty field
   - **Not Found**: 
     - Show warning toast: "Không tìm thấy thông tin"
     - Keep current values
   - **Error**: 
     - Show error toast: "Có lỗi xảy ra. Vui lòng thử lại"
5. Re-enable button

**UX Notes**:
- User có thể edit các trường đã auto-fill
- Auto-fill không overwrite nếu field đã có giá trị (show confirmation dialog)

#### Validation

**Real-time Validation** (on blur):
- Mã số thuế: Pattern check
- CCCD: Length check
- Required fields: Empty check

**Submit Validation**:
- All required fields filled
- All fields pass pattern validation
- Enable "Tiếp tục" button only when valid

#### Form State
```typescript
interface BusinessInfoForm {
  taxId: string;              // Required, 10-13 digits
  businessName: string;       // Required
  registeredAddress: string;  // Required
  ownerName: string;          // Optional
  nationalId: string;         // Optional, 12 digits
}

interface FormErrors {
  taxId?: string;
  businessName?: string;
  registeredAddress?: string;
  nationalId?: string;
}
```

#### Navigation
- **Back**: Return to Business Type Selection
  - Show confirmation if form has data: "Bạn có chắc muốn quay lại? Thông tin đã nhập sẽ bị mất."
- **Continue**: 
  - Validate form
  - Call API to save business info
  - Navigate to next onboarding step (Phase 2 - TBD)

### API Integration

#### Auto-fill Tax Information
```
GET /api/tax-info
Query Params:
  - taxId: string (required)

Response 200:
{
  "success": true,
  "data": {
    "taxId": "0123456789",
    "businessName": "Cửa hàng tạp hóa Minh An",
    "registeredAddress": "123 Đường ABC, Phường XYZ, Quận 1, TP.HCM",
    "ownerName": "Nguyễn Văn A",
    "businessType": "HOUSEHOLD_BUSINESS"
  }
}

Response 404:
{
  "success": false,
  "message": "Tax ID not found"
}
```

#### Save Business Information
```
POST /api/tenants/{tenantId}/onboarding/business-info
Headers:
  - Authorization: Bearer {token}

Body:
{
  "businessType": "HOUSEHOLD_BUSINESS",
  "taxId": "0123456789",
  "businessName": "Cửa hàng tạp hóa Minh An",
  "registeredAddress": "123 Đường ABC, Phường XYZ, Quận 1, TP.HCM",
  "ownerName": "Nguyễn Văn A",
  "nationalId": "012345678901"
}

Response 200:
{
  "success": true,
  "data": {
    "tenantId": "uuid",
    "onboardingStep": 2,
    "onboardingCompleted": false
  }
}
```

### Technical Notes
- Route: `/onboarding/business-info`
- Form validation: React Hook Form + Zod
- Auto-fill service integration required
- Save form state to prevent data loss on navigation

---

## 4. Business Information - DNTN (Doanh Nghiệp Tư Nhân)

### Differences from HKD

Sử dụng form tương tự HKD với các điều chỉnh:

#### Label Changes
- "Tên Hộ kinh doanh" → "Tên doanh nghiệp"
- "Tên chủ hộ kinh doanh" → "Tên giám đốc"

#### Additional Fields
- **Mã doanh nghiệp**: Input text, 13 ký tự, Optional
- **Ngày thành lập**: Date picker, Optional
- **Số lượng nhân sự**: Number input, Optional

---

## Validation Rules

### Mã số thuế
- **Format**: 10 hoặc 13 chữ số
- **Required**: Yes
- **Regex**: `^[0-9]{10}$|^[0-9]{13}$`

### CCCD
- **Format**: 12 chữ số
- **Required**: No
- **Regex**: `^[0-9]{12}$`

### Text Fields
- **Min Length**: 2 characters
- **Max Length**: 255 characters (name), 500 (address)
- **Allowed Characters**: Unicode (Vietnamese)

---

## Error Handling

### Network Errors
- **Timeout**: "Kết nối quá chậm. Vui lòng thử lại"
- **500 Error**: "Có lỗi xảy ra. Vui lòng thử lại sau"
- **No Internet**: "Không có kết nối Internet"

### Form Errors
- Show inline error messages below each field
- Error color: Red-500
- Icon: Alert circle icon

### User Actions on Error
- **Retry**: Allow user to retry auto-fill
- **Manual Entry**: Always allow manual input as fallback
- **Skip**: Optional fields can be left empty

---

## Data Persistence

### Session Storage
- Store form data temporarily during onboarding
- Clear after completion or logout

### Database Storage
- Save to tenant-specific table: `tenant_business_info`
- Update `tenants.onboarding_step` field
- Set `tenants.onboarding_completed = true` after Phase 1

---

## Analytics Events

Track user behavior for improvement:

```javascript
// Screen views
analytics.track('onboarding_welcome_viewed');
analytics.track('onboarding_business_type_viewed');
analytics.track('onboarding_business_info_viewed');

// User actions
analytics.track('onboarding_started');
analytics.track('business_type_selected', { type: 'HOUSEHOLD_BUSINESS' });
analytics.track('tax_info_autofill_clicked');
analytics.track('tax_info_autofill_success');
analytics.track('tax_info_autofill_failed', { error: 'not_found' });
analytics.track('onboarding_phase1_completed');

// Drop-off points
analytics.track('onboarding_abandoned', { step: 'business_type' });
```

---

## Accessibility

### Keyboard Navigation
- Tab order: Logical flow through form
- Enter key: Submit form/click primary button
- Escape key: Close dialogs

### Screen Readers
- All form fields have proper labels
- Error messages announced
- Progress bar with aria-label

### Visual
- Minimum contrast ratio: 4.5:1
- Focus indicators on all interactive elements
- Text size: Minimum 14px

---

## Performance

### Load Time
- Target: < 2 seconds for screen load
- Images: Lazy load, optimized size
- API calls: Max 5 seconds timeout

### Optimization
- Debounce validation: 300ms
- Cache tax info results: 5 minutes
- Preload next screen assets

---

## Future Enhancements (Out of Scope for Phase 1)

- Import business info từ Business Registration Certificate (OCR)
- Integration với Cổng thông tin quốc gia về đăng ký doanh nghiệp
- Multi-language support
- Dark mode
- Công ty TNHH/Cổ phần flow

---

## Success Metrics

### Completion Rate
- Target: > 80% users complete Phase 1
- Measure drop-off at each step

### Auto-fill Usage
- Track usage rate of "Lấy thông tin"
- Success rate of auto-fill API

### Time to Complete
- Target: < 5 minutes for entire flow
- Average time per screen

---

## Dependencies

### External Services
- Tax Information API (Cục Thuế)
- Analytics service

### Internal Services
- Auth Service (verify user session)
- Tenant Service (save business info)

### UI Libraries
- React Hook Form
- Zod (validation)
- Material-UI or Ant Design (components)

---

## Testing Requirements

### Unit Tests
- Form validation logic
- Auto-fill transformation logic
- Error handling

### Integration Tests
- API calls and responses
- Form submission flow
- Navigation between screens

### E2E Tests
- Complete onboarding flow
- Auto-fill feature
- Error scenarios
- Back navigation with confirmation

### Manual Testing Scenarios
1. Happy path: HKD with auto-fill
2. Happy path: DNTN with manual entry
3. Invalid tax ID
4. API timeout/error
5. Navigation back and forth
6. Form data persistence
