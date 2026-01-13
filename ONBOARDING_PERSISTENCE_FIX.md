# Onboarding Data Persistence Fix - Summary

## Problem
User's onboarding data (Business Sector and Accounting Setup) was only saved to localStorage and not persisted to the server. This meant:
- Data would be lost if user cleared browser cache
- Data would be lost when switching browsers or devices
- Only Business Type and Business Info were actually saved to the database

## Solution Implemented

### Backend Changes

#### 1. New Database Tables (Migration 007)
Created two new tables to store the missing onboarding data:

**tenant_business_sector**
- `id` (UUID)
- `tenant_id` (UUID)
- `sector` (VARCHAR)
- `industry_code` (VARCHAR)
- `industry_name` (VARCHAR)
- `created_at`, `updated_at`

**tenant_accounting_setup**
- `id` (UUID)
- `tenant_id` (UUID)
- `data_start_date` (DATE)
- HKD fields: `tax_filing_frequency`, `use_pos_device`, `tax_industry_group`
- DNTN fields: `accounting_regime`, `tax_calculation_method`, `base_currency`, `has_foreign_currency`, `inventory_valuation_method`
- `created_at`, `updated_at`

#### 2. New DTOs
- `SaveBusinessSectorDto` - validates business sector data
- `SaveAccountingSetupDto` - validates accounting setup data

#### 3. New Controller Endpoints
- `POST /tenants/:tenantId/onboarding/business-sector`
- `POST /tenants/:tenantId/onboarding/accounting-setup`

#### 4. Service Methods
Added methods in `OnboardingService`:
- `saveBusinessSector()` - upserts business sector data
- `saveAccountingSetup()` - upserts accounting setup data
- Updated `getOnboardingStatus()` - now returns `businessSector` and `accountingSetup` fields

### Frontend Changes

#### 1. API Client (`src/services/api.ts`)
Added new methods:
- `saveBusinessSector(tenantId, data)`
- `saveAccountingSetup(tenantId, data)`

#### 2. BusinessSectorScreen
- Now calls `apiService.saveBusinessSector()` before navigating to next step
- Saves data to both server and localStorage

#### 3. AccountingSetupScreen  
- Now calls `apiService.saveAccountingSetup()` before navigating to next step
- Saves data to both server and localStorage

#### 4. HomeScreen
- Updated `handleBusinessSetup()` to load and cache `businessSector` and `accountingSetup` from server
- All onboarding screens now have access to this cached data via localStorage

#### 5. AdvancedSetupScreen
- Fixed to save "off" state when user leaves without enabling e-invoice
- Now calls `apiService.completeOnboarding()` to mark onboarding as done

## Flow After Fix

### When User Completes Onboarding:
1. **Business Type** → Saved to server ✅
2. **Business Info** → Saved to server ✅
3. **Business Sector** → Saved to server ✅ (NEW)
4. **Accounting Setup** → Saved to server ✅ (NEW)
5. **Advanced Setup** → Saved to server ✅ (FIXED)
6. `onboardingCompleted` flag set in database

### When User Returns:
1. `getOnboardingStatus()` API fetches ALL data from server
2. Data is cached in localStorage (`onboardingData`)
3. Each screen loads from cache and displays saved values
4. User can continue from where they left off

## Files Modified

### Backend
- `services/tenant-service/src/modules/onboarding/dto/save-accounting-setup.dto.ts` (NEW)
- `services/tenant-service/src/modules/onboarding/dto/save-business-sector.dto.ts` (NEW)
- `services/tenant-service/src/modules/tenants/entities/tenant-accounting-setup.entity.ts` (NEW)
- `services/tenant-service/src/modules/tenants/entities/tenant-business-sector.entity.ts` (NEW)
- `services/tenant-service/src/modules/onboarding/onboarding.controller.ts` (UPDATED)
- `services/tenant-service/src/modules/onboarding/onboarding.service.ts` (UPDATED)
- `scripts/migrations/007_create_onboarding_extended_tables.sql` (NEW)

### Frontend
- `web-app/src/services/api.ts` (UPDATED)
- `web-app/src/pages/onboarding/BusinessSectorScreen.tsx` (UPDATED)
- `web-app/src/pages/onboarding/AccountingSetupScreen.tsx` (UPDATED)
- `web-app/src/pages/onboarding/AdvancedSetupScreen.tsx` (UPDATED)
- `web-app/src/pages/HomeScreen.tsx` (UPDATED)

## Testing Checklist

- [ ] Start fresh onboarding and complete all steps
- [ ] Close browser and reopen - verify data is still there
- [ ] Clear localStorage only - verify data loads from server
- [ ] Skip Advanced Setup (don't enable e-invoice) - verify it still completes onboarding
- [ ] Test on different device - verify same data appears
- [ ] Test partially completed onboarding - verify can resume from correct step

## Migration Instructions

Run the migration:
```bash
cd /Users/lammaidangvu/saas-erp-accounting/saas-erp-accounting
docker exec -i erp-postgres psql -U erp_admin -d tenant_db < scripts/migrations/007_create_onboarding_extended_tables.sql
```

## Status
✅ All changes implemented and TypeScript compiled successfully
✅ Migration executed successfully
✅ Ready for testing
