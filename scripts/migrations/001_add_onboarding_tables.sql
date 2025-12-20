-- Migration: Add onboarding tables
-- Date: 2025-12-20
-- Description: Extend tenants table and add business info and audit log tables

-- Step 1: Extend tenants table with onboarding tracking
ALTER TABLE tenants
  ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS onboarding_step INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS onboarding_started_at TIMESTAMP,
  ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMP,
  ADD COLUMN IF NOT EXISTS business_type VARCHAR(50);

-- Step 2: Create tenant_business_info table
CREATE TABLE IF NOT EXISTS tenant_business_info (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  
  -- Legal Information
  business_type VARCHAR(50) NOT NULL,
  tax_id VARCHAR(13) NOT NULL,
  business_name VARCHAR(255) NOT NULL,
  registered_address TEXT NOT NULL,
  
  -- Owner/Director Information
  owner_name VARCHAR(100),
  national_id VARCHAR(12),
  
  -- DNTN specific
  business_code VARCHAR(13),
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

-- Step 3: Create onboarding_audit_logs table
CREATE TABLE IF NOT EXISTS onboarding_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  user_id UUID NOT NULL REFERENCES users(id),
  
  step_name VARCHAR(50) NOT NULL,
  action VARCHAR(50) NOT NULL,
  data JSONB,
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- Step 4: Create indexes
CREATE INDEX IF NOT EXISTS idx_tenants_owner_id ON tenants(owner_id);
CREATE INDEX IF NOT EXISTS idx_tenants_onboarding_completed ON tenants(onboarding_completed);
CREATE INDEX IF NOT EXISTS idx_business_info_tenant_id ON tenant_business_info(tenant_id);
CREATE INDEX IF NOT EXISTS idx_business_info_tax_id ON tenant_business_info(tax_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant_id ON onboarding_audit_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON onboarding_audit_logs(created_at);

-- Step 5: Add comments
COMMENT ON TABLE tenant_business_info IS 'Stores business information collected during onboarding';
COMMENT ON TABLE onboarding_audit_logs IS 'Audit trail for onboarding process';
COMMENT ON COLUMN tenants.onboarding_completed IS 'Whether user has completed onboarding';
COMMENT ON COLUMN tenants.onboarding_step IS 'Current step in onboarding process (0-3)';
COMMENT ON COLUMN tenants.business_type IS 'Type of business: HOUSEHOLD_BUSINESS, PRIVATE_ENTERPRISE, LIMITED_COMPANY';
