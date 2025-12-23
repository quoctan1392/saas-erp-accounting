# ADVANCED SETUP SCREEN - IMPLEMENTATION SUMMARY

## Files Created/Modified

### 1. Created Files

#### `/web-app/src/pages/onboarding/AdvancedSetupScreen.tsx`
- **Full implementation of Advanced Setup screen**
- Features:
  - E-Invoice connection toggle
  - Connection setup form with validation
  - Provider selection from database (API ready)
  - Auto-fill tax code from previous steps
  - Password visibility toggle
  - Auto-issue on sale checkbox
  - Connection status badge
  - Two bottom sheets: connection form & provider selection
  - Complete error handling and validation
  - Mobile responsive with sticky footer
  - Confirm dialogs for disconnect and navigation
  - Loading states and success/error messages

### 2. Modified Files

#### `/web-app/src/types/onboarding.ts`
Added new interfaces:
```typescript
export interface EInvoiceProvider {
  id: string;
  code: string;
  name: string;
  description: string;
  logo?: string;
  apiEndpoint?: string;
  isActive: boolean;
}

export interface EInvoiceConnection {
  provider: string;
  providerName: string;
  taxCode: string;
  username: string;
  password: string;
  autoIssueOnSale: boolean;
  connectedAt?: string;
}

export interface AdvancedSetupForm {
  eInvoiceEnabled: boolean;
  eInvoiceConnection?: EInvoiceConnection;
}
```

#### `/web-app/src/config/constants.ts`
Added new route:
```typescript
ONBOARDING_ADVANCED_SETUP: '/onboarding/advanced-setup'
```

#### `/web-app/src/App.tsx`
- Imported `AdvancedSetupScreen`
- Added route: `/onboarding/advanced-setup`

#### `/web-app/src/pages/onboarding/AccountingSetupScreen.tsx`
- Modified navigation to go to `ROUTES.ONBOARDING_ADVANCED_SETUP` instead of `ROUTES.HOME`
- Updated success message to indicate moving to next step
- Removed `localStorage.removeItem('onboardingData')` (now handled in AdvancedSetupScreen)

---

## Key Features Implemented

### 1. **E-Invoice Toggle Card**
- Toggle switch to enable/disable e-invoice feature
- Shows connection status badge when connected
- Click on card when connected to edit configuration
- Confirmation dialog when disconnecting

### 2. **Connection Bottom Sheet**
- All required fields with validation
- Auto-fill tax code from business identification step
- Provider selection (opens provider sheet)
- Password field with show/hide toggle
- Auto-issue on sale checkbox (default: checked)
- Error banner at top when validation fails
- Cancel and Connect buttons

### 3. **Provider Selection Bottom Sheet**
- Radio button list of providers
- Fetches from database (API ready, mock data included)
- Selected provider highlighted with orange background
- Auto-closes and fills provider field on selection

### 4. **Validation & Error Handling**
- All required fields validated
- Tax code must match previous entry
- Clear error messages
- Error banner in connection sheet
- Snackbar notifications for success/error states

### 5. **Navigation & Confirm Dialogs**
- Back button with confirm dialog if unsaved changes
- Disconnect confirm dialog
- Navigate back to Accounting Setup screen
- Complete onboarding and navigate to Homepage

### 6. **Data Management**
- Load data from localStorage on mount
- Save connection details to localStorage
- Clean up localStorage only on final completion
- Prepare payload for backend API

### 7. **Mobile Responsive**
- Sticky footer on mobile
- Full width buttons on mobile
- Bottom sheets for forms
- Touch-friendly design
- Safe area inset handling

---

## API Integration Points

### 1. **Fetch E-Invoice Providers**
```typescript
// TODO: Implement in component
// const response = await apiService.getEInvoiceProviders();
// GET /api/v1/integrations/e-invoice/providers

// Expected response:
{
  success: true,
  data: [
    {
      id: string,
      code: string,
      name: string,
      description: string,
      logo?: string,
      apiEndpoint?: string,
      isActive: boolean
    }
  ]
}
```

### 2. **Verify E-Invoice Connection**
```typescript
// TODO: Implement in component (handleConnect function)
// const response = await apiService.verifyEInvoiceConnection({
//   provider: selectedProvider,
//   taxCode,
//   username,
//   password
// });
// POST /api/v1/integrations/e-invoice/verify

// Request body:
{
  provider: string,
  taxCode: string,
  username: string,
  password: string
}

// Success response:
{
  success: true,
  data: {
    verified: boolean,
    providerInfo: {
      name: string,
      taxCode: string,
      businessName: string
    }
  }
}

// Error response:
{
  success: false,
  error: {
    code: 'INVALID_CREDENTIALS' | 'TAX_CODE_MISMATCH',
    message: string
  }
}
```

### 3. **Complete Onboarding**
```typescript
// TODO: Implement in component (handleSubmit function)
// const currentTenant = JSON.parse(localStorage.getItem('currentTenant') || '{}');
// await apiService.completeOnboarding(currentTenant.id, updatedData);
// POST /api/v1/tenants/{tenantId}/onboarding/complete

// Request body:
{
  businessIdentification: { ... },
  businessSector: { ... },
  accountingSetup: { ... },
  advancedSetup: {
    eInvoiceEnabled: boolean,
    eInvoiceConnection?: {
      provider: string,
      providerName: string,
      taxCode: string,
      username: string,
      password: string, // Should be encrypted
      autoIssueOnSale: boolean,
      connectedAt: string
    }
  },
  completedAt: string
}

// Success response:
{
  success: true,
  data: {
    tenantId: string,
    onboardingCompleted: boolean,
    redirectUrl: string
  }
}
```

---

## Mock Data (Temporary)

The component includes mock provider data that should be replaced with API call:

```typescript
setProviders([
  {
    id: '1',
    code: 'VIETTEL_SINVOICE',
    name: 'Viettel S-Invoice',
    description: 'Dịch vụ hoá đơn điện tử của Viettel',
    isActive: true,
  },
  {
    id: '2',
    code: 'VNPT_MINVOICE',
    name: 'M-Invoice',
    description: 'Dịch vụ hoá đơn điện tử của VNPT',
    isActive: true,
  },
  {
    id: '3',
    code: 'MISA_MEINVOICE',
    name: 'MISA meInvoice',
    description: 'Dịch vụ hoá đơn điện tử của MISA',
    isActive: true,
  },
]);
```

---

## Backend Requirements

### Database Schema

#### Table: `e_invoice_providers`
```sql
CREATE TABLE e_invoice_providers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  logo VARCHAR(500),
  api_endpoint VARCHAR(500),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed data
INSERT INTO e_invoice_providers (code, name, description, is_active) VALUES
('VIETTEL_SINVOICE', 'Viettel S-Invoice', 'Dịch vụ hoá đơn điện tử của Viettel', true),
('VNPT_MINVOICE', 'M-Invoice', 'Dịch vụ hoá đơn điện tử của VNPT', true),
('MISA_MEINVOICE', 'MISA meInvoice', 'Dịch vụ hoá đơn điện tử của MISA', true);
```

#### Table: `tenant_e_invoice_connections`
```sql
CREATE TABLE tenant_e_invoice_connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES e_invoice_providers(id),
  tax_code VARCHAR(20) NOT NULL,
  username VARCHAR(255) NOT NULL,
  password_encrypted TEXT NOT NULL,
  auto_issue_on_sale BOOLEAN DEFAULT true,
  connected_at TIMESTAMP NOT NULL,
  last_sync_at TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(tenant_id)
);
```

### API Endpoints

#### 1. GET `/api/v1/integrations/e-invoice/providers`
- Returns list of active e-invoice providers
- Public endpoint (no auth required for onboarding)

#### 2. POST `/api/v1/integrations/e-invoice/verify`
- Verifies credentials with provider's API
- Returns provider info if successful
- Rate limited to prevent brute force

#### 3. POST `/api/v1/tenants/:tenantId/onboarding/complete`
- Saves all onboarding data
- Encrypts e-invoice password before storing
- Marks tenant as onboarding_completed
- Returns redirect URL to dashboard

---

## Testing Checklist

- [ ] Screen loads with correct initial state
- [ ] Toggle opens connection sheet
- [ ] Provider selection works correctly
- [ ] Tax code auto-fills from previous step
- [ ] Tax code mismatch validation works
- [ ] All required field validations work
- [ ] Password show/hide toggle works
- [ ] Connection success flow works
- [ ] Connection failure shows error banner
- [ ] Can edit connection after connecting
- [ ] Disconnect confirmation works
- [ ] Auto-issue checkbox works
- [ ] Skip e-invoice setup (complete without connecting)
- [ ] Back button with unsaved changes shows confirm dialog
- [ ] Mobile responsive layout works
- [ ] Complete onboarding navigates to homepage
- [ ] localStorage cleaned up on completion

---

## Notes for Backend Team

1. **Provider Data from Database**: The frontend expects providers to come from API, not hardcoded. Create migration to seed initial providers.

2. **Password Encryption**: Passwords must be encrypted before storing in database. Use AES-256 or similar.

3. **Verification API**: The verify endpoint should make actual calls to provider APIs to validate credentials. Consider caching results temporarily.

4. **Rate Limiting**: Implement rate limiting on verify endpoint to prevent abuse.

5. **Provider API Endpoints**: Each provider may have different API endpoints and authentication methods. Store this in database.

6. **Sync Jobs**: Consider background jobs to periodically sync invoice data from providers.

7. **Webhook Support**: Some providers may support webhooks for real-time updates.

---

## Next Steps

1. **Backend Implementation**:
   - Create database tables
   - Implement API endpoints
   - Integrate with provider APIs
   - Add encryption for credentials

2. **Frontend Integration**:
   - Replace mock data with API calls
   - Add proper error handling for API failures
   - Implement retry logic
   - Add loading skeletons

3. **Testing**:
   - Unit tests for validation logic
   - Integration tests with API
   - E2E tests for complete flow
   - Mobile device testing

4. **Documentation**:
   - API documentation
   - Provider integration guides
   - User help documentation
   - Video tutorials

---

## Dependencies

### Existing Components Used
- `PrimaryButton` - Primary action button
- `OnboardingHeader` - Header with back and progress
- `RoundedTextField` - Custom text field
- `ConfirmDialog` - Confirmation dialogs
- `Icon` - Icon component

### MUI Components Used
- `Switch` - Toggle switch
- `Drawer` - Bottom sheets
- `RadioGroup`, `Radio` - Provider selection
- `Checkbox` - Auto-issue option
- `Chip` - Connected badge
- `Snackbar`, `Alert` - Notifications
- `CircularProgress` - Loading indicator

---

## Security Considerations

1. **Password Handling**:
   - Never log passwords
   - Encrypt before sending to backend
   - Use HTTPS only
   - Clear from memory after use

2. **Input Validation**:
   - Sanitize all inputs
   - Validate tax code format
   - Limit input lengths
   - Prevent SQL injection

3. **Rate Limiting**:
   - Limit verification attempts
   - Implement CAPTCHA if needed
   - Monitor for abuse

4. **Data Storage**:
   - Encrypt credentials in database
   - Use secure connection strings
   - Implement audit logging
   - Regular security audits

---

## Accessibility Features

- Keyboard navigation support
- Screen reader labels (ARIA)
- Focus management in bottom sheets
- Color contrast compliance
- Touch target sizes (44x44px minimum)
- Error announcements

---

## Performance Optimizations

- Lazy load provider logos
- Debounce input validation
- Optimize re-renders with useMemo/useCallback
- Compress API responses
- Cache provider list
- Minimize bundle size

---

## Future Enhancements

1. Test connection button (verify before saving)
2. Import existing invoices from provider
3. Multi-provider support (connect multiple)
4. Invoice template customization
5. Notification settings for reminders
6. Sync schedule configuration
7. Provider comparison/recommendation
8. Integration with accounting reports

---

## Contact for Questions

For questions about this implementation, contact:
- Frontend Team: Implementation details
- Backend Team: API integration
- DevOps Team: Deployment and security
- Product Team: Requirements clarification
