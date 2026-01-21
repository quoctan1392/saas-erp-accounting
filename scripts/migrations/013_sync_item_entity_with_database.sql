-- Migration 013: Sync item entity with database schema
-- This migration aligns the item table with the TypeORM entity definition

-- Step 1: Rename category_id to list_item_category_id and change to TEXT
-- We keep single category support, just store as comma-separated text for compatibility with simple-array
ALTER TABLE item RENAME COLUMN category_id TO list_item_category_id;
ALTER TABLE item ALTER COLUMN list_item_category_id TYPE TEXT USING list_item_category_id::TEXT;

-- Step 2: Rename sale_price to sell_price to match entity
ALTER TABLE item RENAME COLUMN sale_price TO sell_price;

-- Step 3: Add missing tax rate columns
ALTER TABLE item ADD COLUMN IF NOT EXISTS import_tax_rate NUMERIC(5,2) DEFAULT 0;
ALTER TABLE item ADD COLUMN IF NOT EXISTS export_tax_rate NUMERIC(5,2) DEFAULT 0;
ALTER TABLE item ADD COLUMN IF NOT EXISTS special_consumption_tax_rate NUMERIC(5,2) DEFAULT 0;

-- Step 4: Add missing account columns
ALTER TABLE item ADD COLUMN IF NOT EXISTS discount_account_id UUID;
ALTER TABLE item ADD COLUMN IF NOT EXISTS sale_off_account_id UUID;
ALTER TABLE item ADD COLUMN IF NOT EXISTS revenue_account_id UUID;

-- Step 5: Rename sale_account_id to revenue_account_id (if needed)
-- We'll keep both for now since DB already has sale_account_id

-- Step 6: Add description columns
ALTER TABLE item ADD COLUMN IF NOT EXISTS purchase_description TEXT;
ALTER TABLE item ADD COLUMN IF NOT EXISTS sale_description TEXT;
ALTER TABLE item ADD COLUMN IF NOT EXISTS note TEXT;

-- Step 7: Add image columns
ALTER TABLE item ADD COLUMN IF NOT EXISTS list_image_url TEXT;

-- Step 8: Add dimension columns
ALTER TABLE item ADD COLUMN IF NOT EXISTS weight NUMERIC(15,4);
ALTER TABLE item ADD COLUMN IF NOT EXISTS length NUMERIC(15,4);
ALTER TABLE item ADD COLUMN IF NOT EXISTS width NUMERIC(15,4);
ALTER TABLE item ADD COLUMN IF NOT EXISTS height NUMERIC(15,4);

-- Step 9: Add warranty columns
ALTER TABLE item ADD COLUMN IF NOT EXISTS warranty_period INTEGER;
ALTER TABLE item ADD COLUMN IF NOT EXISTS warranty_type VARCHAR(50);

-- Step 10: Update foreign key constraint for list_item_category_id
-- Drop the old foreign key constraint
ALTER TABLE item DROP CONSTRAINT IF EXISTS item_category_id_fkey;

-- Step 11: Drop unused indexes and recreate with new column name
DROP INDEX IF EXISTS idx_item_category;
CREATE INDEX IF NOT EXISTS idx_item_list_category ON item (tenant_id, list_item_category_id);

-- Note: list_item_category_id is now TEXT (comma-separated), not UUID
-- When querying, you'll need to use string operations or adjust queries
