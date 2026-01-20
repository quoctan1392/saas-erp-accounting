-- Migration: 010_add_tax_industry_group_to_business_profile.sql
-- Description: Add tax_industry_group_id column to business_profile and create FK
-- Created: 2026-01-19

ALTER TABLE business_profile
  ADD COLUMN IF NOT EXISTS tax_industry_group_id UUID;

CREATE INDEX IF NOT EXISTS idx_business_profile_tax_industry_group_id ON business_profile(tax_industry_group_id);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_business_profile_tax_industry_group'
  ) THEN
    ALTER TABLE business_profile
      ADD CONSTRAINT fk_business_profile_tax_industry_group
      FOREIGN KEY (tax_industry_group_id) REFERENCES tax_industry_groups(id);
  END IF;
END$$;

-- Note: column is nullable by default. Application code should set it when available.
