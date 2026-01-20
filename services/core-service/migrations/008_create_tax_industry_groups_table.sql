-- Migration: 008_create_tax_industry_groups_table.sql
-- Description: Create tax_industry_groups table with UUID primary key
-- Created: 2024-12-27

-- Ensure UUID extension is enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create tax_industry_groups table
CREATE TABLE IF NOT EXISTS tax_industry_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(20) NOT NULL UNIQUE,
    name TEXT NOT NULL,
    group_name VARCHAR(255) NOT NULL,
    vat_rate NUMERIC(5, 2),
    pit_rate NUMERIC(5, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_tax_industry_groups_code ON tax_industry_groups(code);
CREATE INDEX idx_tax_industry_groups_group_name ON tax_industry_groups(group_name);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_tax_industry_groups_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_tax_industry_groups_updated_at
    BEFORE UPDATE ON tax_industry_groups
    FOR EACH ROW
    EXECUTE FUNCTION update_tax_industry_groups_updated_at();
