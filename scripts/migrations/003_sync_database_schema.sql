-- Migration 003: Sync database schema between erp_db and core_db
-- This migration ensures all tables have required columns
-- Run this against the database that core-service is using

-- Rename 'object' table to 'accounting_object' if needed
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'object' AND table_schema = 'public')
       AND NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'accounting_object' AND table_schema = 'public') THEN
        ALTER TABLE object RENAME TO accounting_object;
    END IF;
END $$;

-- Add missing columns to warehouse table
ALTER TABLE warehouse ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE warehouse ADD COLUMN IF NOT EXISTS manager_name VARCHAR(100);
ALTER TABLE warehouse ADD COLUMN IF NOT EXISTS manager_phone VARCHAR(20);

-- Ensure unit table has all required columns
ALTER TABLE unit ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE unit ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE unit ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false;
ALTER TABLE unit ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;

-- Ensure item table has all required columns
ALTER TABLE item ADD COLUMN IF NOT EXISTS list_item_category_id TEXT;
ALTER TABLE item ADD COLUMN IF NOT EXISTS sell_price NUMERIC(15,2) DEFAULT 0;
ALTER TABLE item ADD COLUMN IF NOT EXISTS purchase_price NUMERIC(15,2);
ALTER TABLE item ADD COLUMN IF NOT EXISTS import_tax_rate NUMERIC(5,2) DEFAULT 0;
ALTER TABLE item ADD COLUMN IF NOT EXISTS export_tax_rate NUMERIC(5,2) DEFAULT 0;
ALTER TABLE item ADD COLUMN IF NOT EXISTS special_consumption_tax_rate NUMERIC(5,2) DEFAULT 0;
ALTER TABLE item ADD COLUMN IF NOT EXISTS discount_account_id UUID;
ALTER TABLE item ADD COLUMN IF NOT EXISTS sale_off_account_id UUID;
ALTER TABLE item ADD COLUMN IF NOT EXISTS revenue_account_id UUID;
ALTER TABLE item ADD COLUMN IF NOT EXISTS purchase_description TEXT;
ALTER TABLE item ADD COLUMN IF NOT EXISTS sale_description TEXT;
ALTER TABLE item ADD COLUMN IF NOT EXISTS note TEXT;
ALTER TABLE item ADD COLUMN IF NOT EXISTS list_image_url TEXT;
ALTER TABLE item ADD COLUMN IF NOT EXISTS weight NUMERIC(15,4);
ALTER TABLE item ADD COLUMN IF NOT EXISTS length NUMERIC(15,4);
ALTER TABLE item ADD COLUMN IF NOT EXISTS width NUMERIC(15,4);
ALTER TABLE item ADD COLUMN IF NOT EXISTS height NUMERIC(15,4);
ALTER TABLE item ADD COLUMN IF NOT EXISTS warranty_period INTEGER;
ALTER TABLE item ADD COLUMN IF NOT EXISTS warranty_type VARCHAR(100);

-- Insert default units if not exist
INSERT INTO unit (tenant_id, code, name, is_active)
SELECT tenant_id, 'CHIEC', 'Chiếc', true FROM unit LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO unit (tenant_id, code, name, is_active)
SELECT tenant_id, 'BO', 'Bộ', true FROM unit LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO unit (tenant_id, code, name, is_active)
SELECT tenant_id, 'KG', 'Kg', true FROM unit LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO unit (tenant_id, code, name, is_active)
SELECT tenant_id, 'GAM', 'Gam', true FROM unit LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO unit (tenant_id, code, name, is_active)
SELECT tenant_id, 'LIT', 'Lít', true FROM unit LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO unit (tenant_id, code, name, is_active)
SELECT tenant_id, 'HOP', 'Hộp', true FROM unit LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO unit (tenant_id, code, name, is_active)
SELECT tenant_id, 'THUNG', 'Thùng', true FROM unit LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO unit (tenant_id, code, name, is_active)
SELECT tenant_id, 'MET', 'Mét', true FROM unit LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO unit (tenant_id, code, name, is_active)
SELECT tenant_id, 'PACK', 'Pack', true FROM unit LIMIT 1
ON CONFLICT DO NOTHING;

-- Note: Core service should connect to core_db (not erp_db)
-- Update docker-compose.yml: DB_DATABASE: core_db
