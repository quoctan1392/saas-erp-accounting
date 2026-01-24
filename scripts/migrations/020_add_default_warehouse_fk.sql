-- Migration: Add foreign key constraint for items.default_warehouse_id
-- Description: Establishes proper relation between items and warehouses for default warehouse assignment

-- Check if constraint already exists
DO $$
BEGIN
  -- Add foreign key constraint if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_item_default_warehouse'
  ) THEN
    ALTER TABLE item
    ADD CONSTRAINT fk_item_default_warehouse
    FOREIGN KEY (default_warehouse_id)
    REFERENCES warehouse(id)
    ON DELETE SET NULL;
    
    RAISE NOTICE 'Added foreign key constraint fk_item_default_warehouse';
  ELSE
    RAISE NOTICE 'Foreign key constraint fk_item_default_warehouse already exists';
  END IF;
END $$;

-- Create index for performance on lookups
CREATE INDEX IF NOT EXISTS idx_item_default_warehouse_id ON item(default_warehouse_id)
WHERE default_warehouse_id IS NOT NULL;

COMMENT ON COLUMN item.default_warehouse_id IS 'Default warehouse for this item - used for initial stock and default sales location';
