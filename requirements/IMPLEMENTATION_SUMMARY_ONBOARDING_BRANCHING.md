# IMPLEMENTATION SUMMARY - Onboarding Flow Branching

## Tổng quan thay đổi

Đã triển khai luồng phân nhánh onboarding dựa trên loại hình kinh doanh được chọn, với các màn hình và routing riêng biệt cho **Hộ kinh doanh cá thể (HKD)** và **Doanh nghiệp tư nhân (DNTN)**.

---

## Files đã tạo mới

### 1. `/requirements/ONBOARDING_FLOW_REQUIREMENTS.md`
File requirement chi tiết cho toàn bộ luồng onboarding 4 bước:
- Bước 1: Chọn loại hình kinh doanh
- Bước 2: Nhập thông tin định danh (HKD vs DNTN)
- Bước 3: Chọn lĩnh vực và ngành nghề
- Bước 4: Thiết lập cấu hình kế toán

**Nội dung chính:**
- Mô tả chi tiết từng bước với validation rules
- So sánh điểm khác biệt giữa HKD và DNTN
- API endpoints và data structures
- UI/UX requirements và best practices

### 2. `/web-app/src/pages/onboarding/BusinessInfoScreenDNTN.tsx`
Màn hình nhập thông tin cho **Doanh nghiệp tư nhân** (DNTN).

**Điểm khác biệt so với BusinessInfoScreen (HKD):**
- **3 trường bổ sung:**
  - `businessCode`: Mã doanh nghiệp
  - `establishmentDate`: Ngày thành lập (date picker)
  - `employeeCount`: Số lượng nhân sự (number input)
  
- **Labels khác:**
  - "Tên doanh nghiệp" thay vì "Tên Hộ kinh doanh"
  - "Tên chủ doanh nghiệp" thay vì "Tên chủ hộ kinh doanh"
  
- **Progress:** 50%
- **Navigation:** Sau khi submit thành công → `/onboarding/business-sector`

---

## Files đã cập nhật

### 3. `/web-app/src/config/constants.ts`
**Thêm 3 routes mới:**
```typescript
ONBOARDING_BUSINESS_INFO_DNTN: '/onboarding/business-info-dntn',
ONBOARDING_BUSINESS_SECTOR: '/onboarding/business-sector',
ONBOARDING_ACCOUNTING_SETUP: '/onboarding/accounting-setup',
```

### 4. `/web-app/src/types/onboarding.ts`
**Thêm các enums và interfaces mới:**

**Enums:**
- `BusinessSector`: THUONG_MAI, DICH_VU, SAN_XUAT, XAY_LAP
- `TaxFilingFrequency`: MONTHLY, QUARTERLY
- `AccountingRegime`: TT88_2021, TT200_2014, TT133_2016
- `TaxCalculationMethod`: DEDUCTION, DIRECT
- `Currency`: VND, USD
- `InventoryValuationMethod`: WEIGHTED_AVERAGE, INSTANT_WEIGHTED_AVERAGE, SPECIFIC_IDENTIFICATION, FIFO

**Interfaces:**
- `BusinessSectorForm`: sector, industryCode, industryName
- `AccountingSetupFormHKD`: Cấu hình kế toán cho HKD
- `AccountingSetupFormDNTN`: Cấu hình kế toán cho DNTN
- `AccountingSetupForm`: Union type của HKD và DNTN

### 5. `/web-app/src/pages/onboarding/BusinessTypeScreen.tsx`
**Cập nhật logic routing:**
```typescript
// Navigate to appropriate screen based on business type
if (selectedType === BusinessType.HOUSEHOLD_BUSINESS) {
  navigate(ROUTES.ONBOARDING_BUSINESS_INFO);
} else if (selectedType === BusinessType.PRIVATE_ENTERPRISE) {
  navigate(ROUTES.ONBOARDING_BUSINESS_INFO_DNTN);
}
```

**Behavior:**
- Chọn "Hộ kinh doanh cá thể" → `/onboarding/business-info`
- Chọn "Doanh nghiệp tư nhân" → `/onboarding/business-info-dntn`

### 6. `/web-app/src/pages/onboarding/BusinessInfoScreen.tsx`
**Thay đổi navigation logic:**
- Không còn hoàn tất onboarding ngay sau bước này
- Thay vào đó, navigate đến `/onboarding/business-sector` (Bước 3)
- Lưu `businessInfo` vào localStorage để tiếp tục ở bước sau
- Thông báo: "Đã lưu thông tin hộ kinh doanh!"

### 7. `/web-app/src/App.tsx`
**Thêm route mới:**
```tsx
import BusinessInfoScreenDNTN from './pages/onboarding/BusinessInfoScreenDNTN';

// ...
<Route path="/onboarding/business-info-dntn" element={<BusinessInfoScreenDNTN />} />
```

---

## Luồng hoạt động mới

### Flow hiện tại (Đã triển khai)

```
1. WelcomeScreen
   ↓
2. BusinessTypeScreen
   ↓
   ├─ [Chọn HKD] → BusinessInfoScreen (HKD)
   │                ↓
   │                BusinessSectorScreen (TODO)
   │
   └─ [Chọn DNTN] → BusinessInfoScreenDNTN (DNTN)
                     ↓
                     BusinessSectorScreen (TODO)
                     ↓
3. BusinessSectorScreen (Chung cho cả HKD và DNTN)
   ↓
4. AccountingSetupScreen (Logic khác nhau cho HKD vs DNTN)
   ↓
5. Home (Hoàn tất onboarding)
```

### Progress bar
- Bước 1 (BusinessTypeScreen): 25%
- Bước 2 (BusinessInfoScreen/DNTN): 50%
- Bước 3 (BusinessSectorScreen): 75%
- Bước 4 (AccountingSetupScreen): 100%

---

## Các màn hình còn lại cần triển khai

### TODO: BusinessSectorScreen.tsx
**Mục đích:** Chọn lĩnh vực và ngành nghề kinh doanh

**UI Components:**
- 4 option cards cho lĩnh vực: Thương mại, Dịch vụ, Sản xuất, Xây lắp
- Autocomplete (searchable dropdown) cho ngành nghề
- Selected state: 5% orange overlay + border

**Data:**
- API endpoint: `/api/business-sectors`
- Format: "Mã ngành - Tên ngành nghề"

**Navigation:**
- Back → BusinessInfoScreen hoặc BusinessInfoScreenDNTN (tùy businessType)
- Continue → `/onboarding/accounting-setup`
- Progress: 75%

### TODO: AccountingSetupScreen.tsx
**Mục đích:** Thiết lập cấu hình kế toán

**Logic phân nhánh:**
- Load `businessType` từ localStorage
- Hiển thị form tương ứng (HKD vs DNTN)

**Cho HKD:**
- Chế độ kế toán: TT88/2021 (cố định)
- Tần suất khai thuế: Tháng/Quý
- Sử dụng máy tính tiền: Có/Không
- Nhóm ngành nghề tính thuế: Dropdown

**Cho DNTN:**
- Chế độ kế toán: TT200/2014 hoặc TT133/2016
- Phương pháp tính thuế: Khấu trừ / Trực tiếp
- Đồng tiền: VND / USD
- Nghiệp vụ ngoại tệ: Checkbox
- Phương pháp tính giá xuất kho: Bình quân cuối kỳ / FIFO / ...

**Navigation:**
- Back → BusinessSectorScreen
- Continue → Gọi API `completeOnboarding`, navigate `/home`
- Progress: 100%

---

## LocalStorage Structure

```typescript
{
  "onboardingData": {
    "businessType": "HOUSEHOLD_BUSINESS" | "PRIVATE_ENTERPRISE",
    "businessInfo": {
      "taxId": "0123456789",
      "businessName": "...",
      "registeredAddress": "...",
      "ownerName": "...",
      "nationalId": "...",
      // DNTN only:
      "businessCode": "...",
      "establishmentDate": "2020-01-15",
      "employeeCount": 10
    },
    "businessSector": {
      "sector": "THUONG_MAI",
      "industryCode": "4711 - Bán lẻ..."
    },
    "accountingSetup": {
      // HKD or DNTN specific fields
    },
    "isEdit": false,
    "cachedAt": 1234567890
  }
}
```

---

## Testing Checklist

### ✅ Completed
- [x] BusinessTypeScreen routing based on selection
- [x] BusinessInfoScreen for HKD (updated to navigate to sector)
- [x] BusinessInfoScreenDNTN for DNTN (3 extra fields)
- [x] Constants và types đã được cập nhật
- [x] App.tsx routing đã được thêm

### 🔲 Pending
- [ ] BusinessSectorScreen.tsx (Bước 3)
- [ ] AccountingSetupScreen.tsx (Bước 4)
- [ ] API integration cho business sectors
- [ ] API integration cho accounting setup
- [ ] E2E testing toàn bộ luồng HKD
- [ ] E2E testing toàn bộ luồng DNTN
- [ ] Validation toàn diện cho tất cả các trường
- [ ] Error handling và retry logic

---

## Next Steps

1. **Tạo BusinessSectorScreen.tsx**
   - 4 option cards với icon và description
   - Autocomplete component cho ngành nghề
   - Validation: Bắt buộc chọn cả 2 trường
   - Progress: 75%

2. **Tạo AccountingSetupScreen.tsx**
   - Conditional rendering dựa trên businessType
   - Form cho HKD với các trường cụ thể
   - Form cho DNTN với các trường cụ thể
   - Progress: 100%
   - Complete onboarding khi submit thành công

3. **Backend Integration**
   - API endpoint `/api/business-sectors` (GET)
   - API endpoint `/api/tenants/{id}/business-sector` (PUT)
   - API endpoint `/api/tenants/{id}/accounting-setup` (PUT)

4. **Testing**
   - Unit tests cho components mới
   - Integration tests cho API calls
   - E2E tests cho cả 2 flows (HKD và DNTN)

---

## Notes

- Toàn bộ màn hình onboarding sử dụng chung:
  - Background: `Welcome screen.png`
  - Font: SF Pro Display (body), Bricolage Grotesque (titles)
  - Color scheme: Orange (#FB7E00) primary
  - Mobile sticky footer pattern (68px white bar)
  - OnboardingHeader component với progress bar

- Validation được thực hiện real-time khi blur khỏi input
- Confirm dialog hiển thị khi back với unsaved changes
- localStorage được sử dụng để cache data giữa các bước
- Progress bar update theo từng bước (25% → 50% → 75% → 100%)
