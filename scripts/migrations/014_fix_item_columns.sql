-- Migration 014: Fix item table and item_category table
-- Fix the data type conversion issue and add missing columns

-- Step 1: Drop the index first (it was created with the wrong type)
DROP INDEX IF EXISTS idx_item_list_category;

-- Step 2: Drop the column and recreate it with correct type
ALTER TABLE item DROP COLUMN IF EXISTS list_item_category_id CASCADE;
ALTER TABLE item ADD COLUMN list_item_category_id TEXT;

-- Step 3: Recreate the index
CREATE INDEX idx_item_list_category ON item (tenant_id, list_item_category_id);

-- Step 4: Add sort_order to item_category table
ALTER TABLE item_category ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;
