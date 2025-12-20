# Onboarding System Design - Phase 1

## System Overview

Hệ thống onboarding được thiết kế để thu thập thông tin doanh nghiệp từ người dùng mới sau khi tạo tenant. Thông tin này sẽ được lưu trữ theo từng tenant và làm cơ sở cho các nghiệp vụ kế toán/ERP sau này.

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        Web App (React)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Welcome    │→ │ Business Type│→ │  Business    │     │
│  │   Screen     │  │   Selection  │  │  Info Form   │     │
│  └──────────────┘  └──────────────┘  └──────┬───────┘     │
│                                              │              │
│                    Onboarding Context/State  │              │
└──────────────────────────────────────────────┼──────────────┘
                                              │
                                              ▼
                        ┌────────────────────────────────────┐
                        │      API Gateway / BFF             │
                        └────────┬──────────────┬────────────┘
                                 │              │
                    ┌────────────┴───┐    ┌─────┴─────────────┐
                    │                │    │                   │
                    ▼                ▼    ▼                   │
         ┌──────────────────┐  ┌──────────────┐  ┌───────────┴──────┐
         │  Tenant Service  │  │ Tax Info API │  │  Analytics API   │
         │  (NestJS)        │  │ (External)   │  │  (External)      │
         └────────┬─────────┘  └──────────────┘  └──────────────────┘
                  │
                  ▼
         ┌──────────────────┐
         │   PostgreSQL     │
         │  (Tenant DB)     │
         │                  │
         │  - tenants       │
         │  - business_info │
         └──────────────────┘
```

---

## Data Model

### Database Schema

#### 1. Tenants Table (Extended)

```sql
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  owner_id UUID NOT NULL REFERENCES users(id),
  slug VARCHAR(100) UNIQUE NOT NULL,
  
  -- Onboarding tracking
  onboarding_completed BOOLEAN DEFAULT FALSE,
  onboarding_step INTEGER DEFAULT 0,
  onboarding_started_at TIMESTAMP,
  onboarding_completed_at TIMESTAMP,
  
  -- Business basic info
  business_type VARCHAR(50), -- HOUSEHOLD_BUSINESS, PRIVATE_ENTERPRISE, LIMITED_COMPANY
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);

-- Indexes
CREATE INDEX idx_tenants_owner_id ON tenants(owner_id);
CREATE INDEX idx_tenants_onboarding_completed ON tenants(onboarding_completed);
```

#### 2. Business Information Table (New)

```sql
CREATE TABLE tenant_business_info (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  
  -- Legal Information
  business_type VARCHAR(50) NOT NULL, -- HOUSEHOLD_BUSINESS, PRIVATE_ENTERPRISE
  tax_id VARCHAR(13) NOT NULL,
  business_name VARCHAR(255) NOT NULL,
  registered_address TEXT NOT NULL,
  
  -- Owner/Director Information
  owner_name VARCHAR(100),
  national_id VARCHAR(12),
  
  -- DNTN specific
  business_code VARCHAR(13), -- Mã doanh nghiệp
  establishment_date DATE,
  employee_count INTEGER,
  
  -- Metadata
  tax_info_auto_filled BOOLEAN DEFAULT FALSE,
  tax_info_verified BOOLEAN DEFAULT FALSE,
  tax_info_last_updated TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(tenant_id)
);

-- Indexes
CREATE INDEX idx_business_info_tenant_id ON tenant_business_info(tenant_id);
CREATE INDEX idx_business_info_tax_id ON tenant_business_info(tax_id);
```

#### 3. Onboarding Audit Log Table (Optional)

```sql
CREATE TABLE onboarding_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  user_id UUID NOT NULL REFERENCES users(id),
  
  step_name VARCHAR(50) NOT NULL,
  action VARCHAR(50) NOT NULL, -- started, completed, skipped, abandoned
  data JSONB,
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_audit_logs_tenant_id ON onboarding_audit_logs(tenant_id);
CREATE INDEX idx_audit_logs_created_at ON onboarding_audit_logs(created_at);
```

---

## API Specifications

### Tenant Service APIs

#### 1. Get Onboarding Status

```http
GET /api/tenants/:tenantId/onboarding/status
Authorization: Bearer {token}
```

**Response 200**
```json
{
  "success": true,
  "data": {
    "tenantId": "uuid",
    "onboardingCompleted": false,
    "currentStep": 0,
    "totalSteps": 3,
    "businessType": null,
    "startedAt": "2025-12-20T10:00:00Z",
    "completedAt": null
  }
}
```

#### 2. Save Business Type

```http
PUT /api/tenants/:tenantId/onboarding/business-type
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body**
```json
{
  "businessType": "HOUSEHOLD_BUSINESS"
}
```

**Response 200**
```json
{
  "success": true,
  "data": {
    "tenantId": "uuid",
    "businessType": "HOUSEHOLD_BUSINESS",
    "onboardingStep": 1
  }
}
```

**Validation**
- businessType: Required, enum ['HOUSEHOLD_BUSINESS', 'PRIVATE_ENTERPRISE']

#### 3. Get Tax Information (Auto-fill)

```http
GET /api/tax-info?taxId={taxId}
Authorization: Bearer {token}
```

**Response 200 - Success**
```json
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

**Response 404 - Not Found**
```json
{
  "success": false,
  "error": {
    "code": "TAX_ID_NOT_FOUND",
    "message": "Không tìm thấy thông tin với mã số thuế này"
  }
}
```

**Response 400 - Invalid Format**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_TAX_ID_FORMAT",
    "message": "Mã số thuế phải là 10 hoặc 13 chữ số"
  }
}
```

#### 4. Save Business Information

```http
POST /api/tenants/:tenantId/onboarding/business-info
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body - HKD**
```json
{
  "businessType": "HOUSEHOLD_BUSINESS",
  "taxId": "0123456789",
  "businessName": "Cửa hàng tạp hóa Minh An",
  "registeredAddress": "123 Đường ABC, Phường XYZ, Quận 1, TP.HCM",
  "ownerName": "Nguyễn Văn A",
  "nationalId": "012345678901",
  "taxInfoAutoFilled": true
}
```

**Request Body - DNTN**
```json
{
  "businessType": "PRIVATE_ENTERPRISE",
  "taxId": "0123456789012",
  "businessName": "Doanh nghiệp tư nhân ABC",
  "registeredAddress": "456 Đường DEF, Quận 2, TP.HCM",
  "ownerName": "Trần Thị B",
  "nationalId": "012345678902",
  "businessCode": "0123456789012",
  "establishmentDate": "2020-01-15",
  "employeeCount": 10,
  "taxInfoAutoFilled": false
}
```

**Response 200**
```json
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

**Validation Rules**
```typescript
{
  businessType: required, enum,
  taxId: required, regex(/^[0-9]{10}$|^[0-9]{13}$/),
  businessName: required, minLength(2), maxLength(255),
  registeredAddress: required, minLength(10), maxLength(500),
  ownerName: optional, maxLength(100),
  nationalId: optional, regex(/^[0-9]{12}$/),
  businessCode: optional (DNTN), maxLength(13),
  establishmentDate: optional (DNTN), date,
  employeeCount: optional (DNTN), integer, min(1)
}
```

#### 5. Complete Onboarding

```http
POST /api/tenants/:tenantId/onboarding/complete
Authorization: Bearer {token}
```

**Response 200**
```json
{
  "success": true,
  "data": {
    "tenantId": "uuid",
    "onboardingCompleted": true,
    "completedAt": "2025-12-20T11:00:00Z"
  }
}
```

---

## External Service Integration

### Tax Information Service

#### Service Provider Options

1. **Cổng thông tin quốc gia về đăng ký doanh nghiệp**
   - URL: https://dangkykinhdoanh.gov.vn
   - API: Public lookup (nếu có)

2. **Tổng cục Thuế**
   - URL: https://tracuunnt.gdt.gov.vn
   - Method: Web scraping hoặc API (nếu có)

3. **Third-party Provider**
   - Viettel Business
   - VNPT
   - Custom integration service

#### Integration Architecture

```typescript
// Tax Info Service Interface
interface ITaxInfoService {
  lookup(taxId: string): Promise<TaxInfoResult>;
  validate(taxId: string): Promise<boolean>;
}

// Implementation
class TaxInfoService implements ITaxInfoService {
  async lookup(taxId: string): Promise<TaxInfoResult> {
    // 1. Validate format
    if (!this.isValidFormat(taxId)) {
      throw new BadRequestException('Invalid tax ID format');
    }
    
    // 2. Check cache
    const cached = await this.cache.get(`tax_info:${taxId}`);
    if (cached) return cached;
    
    // 3. Call external API
    const result = await this.externalApiClient.lookup(taxId);
    
    // 4. Transform data
    const transformed = this.transformResponse(result);
    
    // 5. Cache result (5 minutes)
    await this.cache.set(`tax_info:${taxId}`, transformed, 300);
    
    return transformed;
  }
}
```

#### Caching Strategy

- **Cache Layer**: Redis
- **TTL**: 5 minutes for successful lookups
- **Cache Key**: `tax_info:{taxId}`
- **Invalidation**: Manual or TTL expiry

#### Fallback Strategy

```
1. Try Primary Provider
   ↓ (timeout: 5s)
2. Try Secondary Provider (if available)
   ↓ (timeout: 5s)
3. Return "Not Found" with manual entry option
```

---

## Business Logic

### Service Layer Architecture

```typescript
// onboarding.service.ts

@Injectable()
export class OnboardingService {
  constructor(
    private readonly tenantRepository: TenantRepository,
    private readonly businessInfoRepository: BusinessInfoRepository,
    private readonly taxInfoService: TaxInfoService,
    private readonly auditLogger: AuditLogger,
  ) {}

  async getOnboardingStatus(tenantId: string): Promise<OnboardingStatus> {
    const tenant = await this.tenantRepository.findById(tenantId);
    
    return {
      tenantId: tenant.id,
      onboardingCompleted: tenant.onboarding_completed,
      currentStep: tenant.onboarding_step,
      totalSteps: 3,
      businessType: tenant.business_type,
      startedAt: tenant.onboarding_started_at,
      completedAt: tenant.onboarding_completed_at,
    };
  }

  async updateBusinessType(
    tenantId: string,
    businessType: BusinessType,
  ): Promise<void> {
    await this.tenantRepository.update(tenantId, {
      business_type: businessType,
      onboarding_step: 1,
      onboarding_started_at: new Date(),
    });

    await this.auditLogger.log({
      tenantId,
      stepName: 'business_type_selection',
      action: 'completed',
      data: { businessType },
    });
  }

  async getTaxInfo(taxId: string): Promise<TaxInfoResult> {
    // Validate format
    this.validateTaxId(taxId);
    
    // Lookup from external service
    const result = await this.taxInfoService.lookup(taxId);
    
    return result;
  }

  async saveBusinessInfo(
    tenantId: string,
    dto: SaveBusinessInfoDto,
  ): Promise<BusinessInfo> {
    // Start transaction
    return await this.dataSource.transaction(async (manager) => {
      // Update tenant
      await manager.update(Tenant, tenantId, {
        business_type: dto.businessType,
        onboarding_step: 2,
      });

      // Upsert business info
      const businessInfo = await manager.upsert(
        BusinessInfo,
        {
          tenant_id: tenantId,
          ...dto,
        },
        ['tenant_id'],
      );

      // Log audit
      await manager.insert(OnboardingAuditLog, {
        tenant_id: tenantId,
        step_name: 'business_info',
        action: 'completed',
        data: dto,
      });

      return businessInfo;
    });
  }

  async completeOnboarding(tenantId: string): Promise<void> {
    await this.tenantRepository.update(tenantId, {
      onboarding_completed: true,
      onboarding_completed_at: new Date(),
    });

    await this.auditLogger.log({
      tenantId,
      stepName: 'onboarding',
      action: 'completed',
    });
  }

  private validateTaxId(taxId: string): void {
    const regex = /^[0-9]{10}$|^[0-9]{13}$/;
    if (!regex.test(taxId)) {
      throw new BadRequestException('Invalid tax ID format');
    }
  }
}
```

---

## Frontend State Management

### Onboarding Context

```typescript
// OnboardingContext.tsx

interface OnboardingState {
  currentStep: number;
  businessType: BusinessType | null;
  businessInfo: BusinessInfoForm | null;
  isLoading: boolean;
  error: string | null;
}

interface OnboardingContextValue extends OnboardingState {
  // Actions
  setBusinessType: (type: BusinessType) => void;
  saveBusinessInfo: (info: BusinessInfoForm) => Promise<void>;
  getTaxInfo: (taxId: string) => Promise<TaxInfoResult>;
  completeOnboarding: () => Promise<void>;
  goToStep: (step: number) => void;
}

export const OnboardingProvider: React.FC = ({ children }) => {
  const [state, setState] = useState<OnboardingState>({
    currentStep: 0,
    businessType: null,
    businessInfo: null,
    isLoading: false,
    error: null,
  });

  const setBusinessType = async (type: BusinessType) => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      await api.updateBusinessType(tenantId, type);
      setState(prev => ({
        ...prev,
        businessType: type,
        currentStep: 2,
        isLoading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error.message,
        isLoading: false,
      }));
    }
  };

  const getTaxInfo = async (taxId: string): Promise<TaxInfoResult> => {
    const result = await api.getTaxInfo(taxId);
    return result;
  };

  const saveBusinessInfo = async (info: BusinessInfoForm) => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      await api.saveBusinessInfo(tenantId, info);
      setState(prev => ({
        ...prev,
        businessInfo: info,
        isLoading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error.message,
        isLoading: false,
      }));
      throw error;
    }
  };

  return (
    <OnboardingContext.Provider value={{
      ...state,
      setBusinessType,
      saveBusinessInfo,
      getTaxInfo,
      completeOnboarding,
      goToStep,
    }}>
      {children}
    </OnboardingContext.Provider>
  );
};
```

### Routing Structure

```typescript
// App routing

<Routes>
  <Route path="/onboarding" element={<OnboardingLayout />}>
    <Route index element={<Navigate to="welcome" />} />
    <Route path="welcome" element={<WelcomeScreen />} />
    <Route path="business-type" element={<BusinessTypeScreen />} />
    <Route path="business-info" element={<BusinessInfoScreen />} />
  </Route>
</Routes>

// Route guards
const OnboardingLayout: React.FC = () => {
  const { onboardingCompleted } = useOnboarding();
  
  if (onboardingCompleted) {
    return <Navigate to="/dashboard" />;
  }
  
  return <Outlet />;
};
```

---

## Security Considerations

### Authorization

```typescript
// Guard: User must be tenant owner to complete onboarding
@UseGuards(JwtAuthGuard, TenantOwnerGuard)
@Controller('tenants/:tenantId/onboarding')
export class OnboardingController {
  // ...
}
```

### Data Validation

- **Backend**: DTO validation với class-validator
- **Frontend**: Zod schema validation
- **Sanitization**: Trim whitespace, prevent XSS

### Rate Limiting

```typescript
// Limit tax info lookups per user
@UseGuards(ThrottlerGuard)
@Throttle(5, 60) // 5 requests per minute
@Get('tax-info')
async getTaxInfo() {
  // ...
}
```

---

## Error Handling

### Error Categories

1. **Validation Errors** (400)
   - Invalid tax ID format
   - Missing required fields
   - Field length violations

2. **Not Found Errors** (404)
   - Tax ID not found
   - Tenant not found

3. **External Service Errors** (502/503)
   - Tax info service timeout
   - External API unavailable

4. **Server Errors** (500)
   - Database errors
   - Unexpected exceptions

### Error Response Format

```typescript
interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
}

// Examples
{
  "success": false,
  "error": {
    "code": "INVALID_TAX_ID_FORMAT",
    "message": "Mã số thuế phải là 10 hoặc 13 chữ số"
  }
}

{
  "success": false,
  "error": {
    "code": "TAX_SERVICE_UNAVAILABLE",
    "message": "Dịch vụtra cứu thuế tạm thời không khả dụng. Vui lòng thử lại sau"
  }
}
```

---

## Monitoring & Analytics

### Metrics to Track

#### Onboarding Funnel
```
Welcome Screen → Business Type → Business Info → Complete

Metrics:
- Conversion rate at each step
- Drop-off rate
- Average time per step
- Total completion time
```

#### Auto-fill Usage
```
Metrics:
- Auto-fill click rate
- Auto-fill success rate
- Manual entry rate
- Top failing tax IDs (for debugging)
```

#### Performance
```
Metrics:
- API response times
- Tax info lookup latency
- Database query times
- Frontend page load times
```

### Logging

```typescript
// Structured logging with Winston

logger.info('Onboarding started', {
  tenantId,
  userId,
  timestamp: new Date(),
});

logger.info('Business type selected', {
  tenantId,
  businessType: 'HOUSEHOLD_BUSINESS',
});

logger.info('Tax info auto-fill requested', {
  tenantId,
  taxId: '0123******89', // Masked for privacy
});

logger.info('Business info saved', {
  tenantId,
  autoFilled: true,
});

logger.info('Onboarding completed', {
  tenantId,
  duration: 245, // seconds
  autoFillUsed: true,
});
```

---

## Deployment Considerations

### Environment Variables

```bash
# .env

# Tax Info Service
TAX_INFO_API_URL=https://api.tax-provider.com
TAX_INFO_API_KEY=your_api_key
TAX_INFO_TIMEOUT=5000 # ms
TAX_INFO_CACHE_TTL=300 # seconds

# Feature Flags
ENABLE_TAX_AUTO_FILL=true
ENABLE_DNTN_ONBOARDING=true
ENABLE_LIMITED_COMPANY=false

# Redis (for caching)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_password
```

### Database Migration

```sql
-- Migration: add_onboarding_tables

-- Step 1: Extend tenants table
ALTER TABLE tenants
  ADD COLUMN onboarding_completed BOOLEAN DEFAULT FALSE,
  ADD COLUMN onboarding_step INTEGER DEFAULT 0,
  ADD COLUMN onboarding_started_at TIMESTAMP,
  ADD COLUMN onboarding_completed_at TIMESTAMP,
  ADD COLUMN business_type VARCHAR(50);

-- Step 2: Create business_info table
CREATE TABLE tenant_business_info (
  -- ... (see schema above)
);

-- Step 3: Create audit log table
CREATE TABLE onboarding_audit_logs (
  -- ... (see schema above)
);

-- Step 4: Add indexes
-- ... (see schema above)
```

### Feature Flags

```typescript
// feature-flags.service.ts

@Injectable()
export class FeatureFlagsService {
  isEnabled(flag: string): boolean {
    return process.env[`ENABLE_${flag}`] === 'true';
  }
}

// Usage
if (this.featureFlags.isEnabled('TAX_AUTO_FILL')) {
  return await this.taxInfoService.lookup(taxId);
} else {
  throw new ServiceUnavailableException('Feature disabled');
}
```

---

## Testing Strategy

### Unit Tests

```typescript
// onboarding.service.spec.ts

describe('OnboardingService', () => {
  describe('saveBusinessInfo', () => {
    it('should save business info and update tenant', async () => {
      // Arrange
      const dto = createMockBusinessInfoDto();
      
      // Act
      const result = await service.saveBusinessInfo(tenantId, dto);
      
      // Assert
      expect(result).toBeDefined();
      expect(result.tax_id).toBe(dto.taxId);
      expect(tenantRepository.update).toHaveBeenCalledWith(
        tenantId,
        expect.objectContaining({ onboarding_step: 2 }),
      );
    });
    
    it('should validate tax ID format', async () => {
      // Arrange
      const dto = { ...createMockDto(), taxId: 'invalid' };
      
      // Act & Assert
      await expect(
        service.saveBusinessInfo(tenantId, dto)
      ).rejects.toThrow('Invalid tax ID format');
    });
  });
});
```

### Integration Tests

```typescript
// onboarding.e2e-spec.ts

describe('Onboarding API (e2e)', () => {
  it('POST /onboarding/business-info - should save business info', () => {
    return request(app.getHttpServer())
      .post(`/tenants/${tenantId}/onboarding/business-info`)
      .set('Authorization', `Bearer ${token}`)
      .send(mockBusinessInfoDto)
      .expect(200)
      .expect((res) => {
        expect(res.body.success).toBe(true);
        expect(res.body.data.taxId).toBe(mockDto.taxId);
      });
  });
});
```

### E2E Tests (Cypress/Playwright)

```typescript
// onboarding.cy.ts

describe('Onboarding Flow', () => {
  it('should complete full onboarding flow', () => {
    // Welcome screen
    cy.visit('/onboarding/welcome');
    cy.contains('Bắt đầu thiết lập').click();
    
    // Business type
    cy.url().should('include', '/business-type');
    cy.get('[data-testid="business-type-hkd"]').click();
    cy.contains('Tiếp tục').click();
    
    // Business info
    cy.url().should('include', '/business-info');
    cy.get('[name="taxId"]').type('0123456789');
    cy.contains('Lấy thông tin').click();
    
    cy.wait('@getTaxInfo');
    cy.get('[name="businessName"]').should('have.value', 'Cửa hàng tạp hóa Minh An');
    
    cy.contains('Tiếp tục').click();
    
    // Verify completion
    cy.url().should('include', '/dashboard');
  });
});
```

---

## Scalability Considerations

### Caching Strategy
- Tax info results cached in Redis
- TTL: 5 minutes
- Reduces load on external API

### Database Indexing
- Index on `tenant_id`, `tax_id`
- Partial index on `onboarding_completed = false`

### API Rate Limiting
- Per-user limits on tax info lookups
- Prevent abuse of external API

### CDN for Static Assets
- Illustrations, icons
- Reduce server load

---

## Internationalization (Future)

### Language Support
```typescript
// i18n structure
{
  "en": {
    "onboarding.welcome.title": "Get Started",
    "onboarding.welcome.description": "Setup helps the app...",
  },
  "vi": {
    "onboarding.welcome.title": "Bắt đầu thiết lập",
    "onboarding.welcome.description": "Thiết lập giúp ứng dụng...",
  }
}
```

---

## Documentation

### API Documentation (Swagger)

```typescript
@ApiTags('Onboarding')
@Controller('tenants/:tenantId/onboarding')
export class OnboardingController {
  
  @ApiOperation({ summary: 'Save business information' })
  @ApiResponse({ status: 200, description: 'Success', type: BusinessInfoResponse })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @Post('business-info')
  async saveBusinessInfo(
    @Param('tenantId') tenantId: string,
    @Body() dto: SaveBusinessInfoDto,
  ) {
    // ...
  }
}
```

---

## Future Enhancements

### Phase 2 Ideas

1. **OCR for Business Registration**
   - Upload Giấy chứng nhận đăng ký kinh doanh
   - Auto-extract information

2. **Bank Account Setup**
   - Connect bank account
   - Import transactions

3. **Tax Configuration**
   - VAT settings
   - Tax calculation methods

4. **Employee Setup**
   - Add initial employees
   - Payroll configuration

5. **Chart of Accounts**
   - Industry-specific templates
   - Customization wizard

---

## Success Criteria

### Technical
- ✅ All APIs functional with < 200ms response time
- ✅ 99.9% uptime
- ✅ Zero data loss
- ✅ Auto-fill success rate > 90%

### Business
- ✅ > 80% onboarding completion rate
- ✅ < 5 minutes average completion time
- ✅ < 10% drop-off rate per step

### User Experience
- ✅ Clear, intuitive UI
- ✅ Helpful error messages
- ✅ No dead ends
- ✅ Mobile responsive

---

## Conclusion

This system design provides a comprehensive foundation for the onboarding flow Phase 1. The architecture is scalable, secure, and user-friendly, with clear separation of concerns and proper error handling.

Next steps:
1. Implementation of backend APIs
2. Frontend screen development
3. Tax info service integration
4. Testing and QA
5. Deployment and monitoring setup
