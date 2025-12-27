-- Migration: Add missing fields to accounting_object table
-- Date: 2025-12-27
-- Description: Add email, website, tax_code columns and is_deleted/deleted_at
-- Add email column
ALTER TABLE
    accounting_object
ADD
    COLUMN IF NOT EXISTS email VARCHAR(255);

-- Add website column
ALTER TABLE
    accounting_object
ADD
    COLUMN IF NOT EXISTS website VARCHAR(255);

-- Add tax_code column
ALTER TABLE
    accounting_object
ADD
    COLUMN IF NOT EXISTS tax_code VARCHAR(50);

-- Add is_deleted column (for soft delete)
ALTER TABLE
    accounting_object
ADD
    COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;

-- Add deleted_at column
ALTER TABLE
    accounting_object
ADD
    COLUMN IF NOT EXISTS deleted_at TIMESTAMP;

-- Create index for soft delete queries
CREATE INDEX IF NOT EXISTS idx_accounting_object_is_deleted ON accounting_object(tenant_id, is_deleted);

-- Comment
COMMENT ON COLUMN accounting_object.email IS 'Email address of the accounting object';

COMMENT ON COLUMN accounting_object.website IS 'Website URL of the accounting object';

COMMENT ON COLUMN accounting_object.tax_code IS 'Tax code (can be same as company_tax_code or personal tax code)';

COMMENT ON COLUMN accounting_object.is_deleted IS 'Soft delete flag';

COMMENT ON COLUMN accounting_object.deleted_at IS 'Timestamp when record was soft deleted';