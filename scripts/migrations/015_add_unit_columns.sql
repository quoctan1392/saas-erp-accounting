-- Migration 015: Add missing columns to unit table
-- Add is_base_unit and conversion_rate columns

ALTER TABLE unit ADD COLUMN IF NOT EXISTS is_base_unit BOOLEAN DEFAULT false;
ALTER TABLE unit ADD COLUMN IF NOT EXISTS conversion_rate NUMERIC(15,4) DEFAULT 1.0;
