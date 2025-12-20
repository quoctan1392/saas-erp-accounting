# Onboarding Implementation Guide

## Tổng quan

Tính năng onboarding đã được triển khai hoàn chỉnh theo thiết kế trong [ONBOARDING_SYSTEM_DESIGN.md](./ONBOARDING_SYSTEM_DESIGN.md).

## Các thành phần đã triển khai

### Backend (Tenant Service)

#### 1. Database Schema
- **File Migration**: `scripts/migrations/001_add_onboarding_tables.sql`
- **Tables mới**:
  - `tenant_business_info`: Lưu thông tin doanh nghiệp
  - `onboarding_audit_logs`: Audit trail cho quá trình onboarding
- **Cập nhật table `tenants`**: Thêm các trường tracking onboarding

#### 2. Entities
- `tenant.entity.ts`: Thêm enum `BusinessType` và các trường onboarding
- `tenant-business-info.entity.ts`: Entity mới cho thông tin doanh nghiệp
- `onboarding-audit-log.entity.ts`: Entity mới cho audit logs

#### 3. DTOs
- `update-business-type.dto.ts`: DTO cho việc cập nhật loại hình kinh doanh
- `save-business-info.dto.ts`: DTO cho việc lưu thông tin doanh nghiệp (có validation)
- `response.dto.ts`: Các response DTOs

#### 4. Services & Controllers
- `onboarding.service.ts`: Business logic cho onboarding
- `onboarding.controller.ts`: API endpoints cho onboarding
- `onboarding.module.ts`: Module configuration

#### 5. API Endpoints

```
GET  /api/tenants/:tenantId/onboarding/status
PUT  /api/tenants/:tenantId/onboarding/business-type
POST /api/tenants/:tenantId/onboarding/business-info
POST /api/tenants/:tenantId/onboarding/complete
GET  /api/tax-info?taxId={taxId}
```

### Frontend (Web App)

#### 1. Types & Interfaces
- `types/onboarding.ts`: TypeScript definitions

#### 2. Context & Hooks
- `context/OnboardingContext.tsx`: State management cho onboarding flow

#### 3. Screens
- `pages/onboarding/WelcomeScreen.tsx`: Màn hình chào mừng
- `pages/onboarding/BusinessTypeScreen.tsx`: Màn hình chọn loại hình kinh doanh
- `pages/onboarding/BusinessInfoScreen.tsx`: Màn hình nhập thông tin doanh nghiệp

#### 4. Routing
- Đã setup routing trong `App.tsx`
- Đã tích hợp vào `SelectTenantScreen.tsx` để redirect đến onboarding nếu chưa hoàn thành

#### 5. API Integration
- Đã thêm các methods vào `services/api.ts`

## Hướng dẫn Deployment

### 1. Chạy Database Migration

```bash
# Connect to your PostgreSQL database
psql -U your_user -d your_database

# Run the migration script
\i scripts/migrations/001_add_onboarding_tables.sql
```

Hoặc sử dụng Docker:
```bash
docker exec -i postgres_container psql -U your_user -d your_database < scripts/migrations/001_add_onboarding_tables.sql
```

### 2. Build & Start Backend

```bash
cd services/tenant-service

# Install dependencies (if needed)
pnpm install

# Build
pnpm build

# Start
pnpm start:dev
```

### 3. Build & Start Frontend

```bash
cd web-app

# Install dependencies (if needed)
pnpm install

# Build
pnpm build

# Start dev server
pnpm dev
```

## Testing

### Manual Testing Flow

1. **Tạo user mới và tenant**:
   - Đăng ký user mới
   - Tạo tenant mới
   - Sau khi tạo tenant, sẽ redirect đến `/onboarding/welcome`

2. **Welcome Screen**:
   - Click "Bắt đầu thiết lập"
   - Redirect đến `/onboarding/business-type`

3. **Business Type Screen**:
   - Chọn "Hộ kinh doanh cá thể" hoặc "Doanh nghiệp tư nhân"
   - Click "Tiếp tục"
   - Redirect đến `/onboarding/business-info`

4. **Business Info Screen**:
   - Nhập mã số thuế (VD: `0123456789`)
   - Click "Lấy thông tin" để test auto-fill
   - Điền các trường còn lại
   - Click "Tiếp tục"
   - Redirect đến dashboard

### Test Auto-fill Feature

Mock data được cài đặt trong `onboarding.service.ts`:
- Mã số thuế `0000000000` → Trả về "Not Found"
- Mã số thuế khác → Trả về mock data

**TODO**: Tích hợp với real tax info service.

## API Documentation

### Get Onboarding Status

```http
GET /api/tenants/:tenantId/onboarding/status
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": {
    "tenantId": "uuid",
    "onboardingCompleted": false,
    "currentStep": 0,
    "totalSteps": 3,
    "businessType": null,
    "startedAt": null,
    "completedAt": null
  }
}
```

### Update Business Type

```http
PUT /api/tenants/:tenantId/onboarding/business-type
Authorization: Bearer {token}
Content-Type: application/json

Body:
{
  "businessType": "HOUSEHOLD_BUSINESS"
}

Response:
{
  "success": true,
  "data": {
    "tenantId": "uuid",
    "businessType": "HOUSEHOLD_BUSINESS",
    "onboardingStep": 1
  }
}
```

### Get Tax Info (Auto-fill)

```http
GET /api/tax-info?taxId=0123456789
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": {
    "taxId": "0123456789",
    "businessName": "Cửa hàng tạp hóa Minh An",
    "registeredAddress": "123 Đường ABC, Phường XYZ, Quận 1, TP.HCM",
    "ownerName": "Nguyễn Văn A",
    "businessType": "HOUSEHOLD_BUSINESS",
    "status": "ACTIVE",
    "registrationDate": "2020-01-15"
  }
}
```

### Save Business Info

```http
POST /api/tenants/:tenantId/onboarding/business-info
Authorization: Bearer {token}
Content-Type: application/json

Body:
{
  "businessType": "HOUSEHOLD_BUSINESS",
  "taxId": "0123456789",
  "businessName": "Cửa hàng tạp hóa Minh An",
  "registeredAddress": "123 Đường ABC, Phường XYZ, Quận 1, TP.HCM",
  "ownerName": "Nguyễn Văn A",
  "nationalId": "012345678901",
  "taxInfoAutoFilled": true
}

Response:
{
  "success": true,
  "data": {
    "id": "uuid",
    "tenantId": "uuid",
    "businessType": "HOUSEHOLD_BUSINESS",
    "taxId": "0123456789",
    "businessName": "Cửa hàng tạp hóa Minh An",
    "onboardingStep": 2,
    "onboardingCompleted": false,
    "createdAt": "2025-12-20T10:30:00Z"
  }
}
```

## Features

### ✅ Đã triển khai

- [x] Database schema và migration
- [x] Backend entities, DTOs, services, controllers
- [x] Frontend screens (Welcome, Business Type, Business Info)
- [x] State management với React Context
- [x] Form validation
- [x] Tax info auto-fill (mock data)
- [x] Routing và navigation flow
- [x] Progress tracking
- [x] Audit logging
- [x] Error handling
- [x] Loading states

### 🚧 Cần hoàn thiện

- [ ] Integration với real Tax Info API
- [ ] Rate limiting cho tax info lookups
- [ ] Redis caching cho tax info results
- [ ] Unit tests
- [ ] Integration tests
- [ ] E2E tests
- [ ] Analytics tracking
- [ ] Responsive mobile optimization
- [ ] Accessibility improvements
- [ ] Dark mode support
- [ ] Multi-language support

## Environment Variables

Cần thêm vào `.env` của tenant-service:

```bash
# Tax Info Service (Future)
TAX_INFO_API_URL=https://api.tax-provider.com
TAX_INFO_API_KEY=your_api_key
TAX_INFO_TIMEOUT=5000
TAX_INFO_CACHE_TTL=300

# Feature Flags
ENABLE_TAX_AUTO_FILL=true
ENABLE_DNTN_ONBOARDING=true
ENABLE_LIMITED_COMPANY=false

# Redis (for caching - Future)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_password
```

## Troubleshooting

### Issue: Migration fails

**Solution**: Kiểm tra database connection và permissions.

### Issue: Auto-fill không hoạt động

**Solution**: Hiện tại đang dùng mock data. Kiểm tra console logs để debug.

### Issue: Redirect loop

**Solution**: Kiểm tra logic onboarding status check trong `SelectTenantScreen.tsx`.

### Issue: Form validation errors

**Solution**: Kiểm tra regex patterns trong DTOs và frontend validation.

## Next Steps (Phase 2)

Theo thiết kế, Phase 2 sẽ bao gồm:

1. **Onboarding bổ sung**:
   - Industry selection
   - Chart of accounts setup
   - Initial inventory setup
   - Bank account connection

2. **Tax Info Service Integration**:
   - Tích hợp với Cổng thông tin quốc gia về đăng ký doanh nghiệp
   - Hoặc third-party provider (Viettel Business, VNPT)

3. **Advanced Features**:
   - OCR for business registration certificate
   - Import data from Excel/CSV
   - Multi-step wizard improvements

## Support

For issues or questions, contact the development team or refer to:
- [ONBOARDING_REQUIREMENTS.md](./ONBOARDING_REQUIREMENTS.md)
- [ONBOARDING_SYSTEM_DESIGN.md](./ONBOARDING_SYSTEM_DESIGN.md)
