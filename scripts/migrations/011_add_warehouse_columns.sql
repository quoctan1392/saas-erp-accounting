-- Migration: Add missing columns to warehouse
-- Date: 2026-01-21

ALTER TABLE warehouse
ADD COLUMN IF NOT EXISTS description TEXT;

ALTER TABLE warehouse
ADD COLUMN IF NOT EXISTS manager_name VARCHAR(100);

ALTER TABLE warehouse
ADD COLUMN IF NOT EXISTS manager_phone VARCHAR(20);

COMMENT ON COLUMN warehouse.description IS 'Optional description for the warehouse';
COMMENT ON COLUMN warehouse.manager_name IS 'Warehouse manager name';
COMMENT ON COLUMN warehouse.manager_phone IS 'Warehouse manager phone number';
