-- Add initial_stock column to item table to store opening inventory
-- This allows products to have an initial stock value before any transactions

ALTER TABLE item
ADD COLUMN IF NOT EXISTS initial_stock numeric(18,4) DEFAULT 0,
ADD COLUMN IF NOT EXISTS initial_warehouse_id uuid REFERENCES warehouse(id) ON DELETE SET NULL;

COMMENT ON COLUMN item.initial_stock IS 'Initial/opening stock quantity for this item (before any inventory transactions)';
COMMENT ON COLUMN item.initial_warehouse_id IS 'Default warehouse for initial stock';
