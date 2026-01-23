-- Migration 022: Create warehouse_item junction table
-- Purpose: Track which items are available in which warehouses
-- This is a configuration/metadata table - actual stock levels come from inventory_transaction

CREATE TABLE IF NOT EXISTS warehouse_item (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  warehouse_id UUID NOT NULL REFERENCES warehouse(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES item(id) ON DELETE CASCADE,
  
  -- Warehouse-specific settings (optional)
  min_stock NUMERIC(18, 4) DEFAULT 0,
  max_stock NUMERIC(18, 4),
  reorder_point NUMERIC(18, 4),
  preferred_location VARCHAR(100), -- Aisle, shelf, bin location
  
  -- Metadata
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by UUID,
  updated_by UUID,
  is_deleted BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMP,
  
  -- Ensure unique combination per tenant
  UNIQUE(tenant_id, warehouse_id, item_id)
);

-- Indexes
CREATE INDEX idx_warehouse_item_tenant_id ON warehouse_item(tenant_id);
CREATE INDEX idx_warehouse_item_warehouse_id ON warehouse_item(warehouse_id);
CREATE INDEX idx_warehouse_item_item_id ON warehouse_item(item_id);
CREATE INDEX idx_warehouse_item_active ON warehouse_item(tenant_id, is_active);

-- Comments
COMMENT ON TABLE warehouse_item IS 'Junction table tracking which items are available in which warehouses (metadata/config only, not stock levels)';
COMMENT ON COLUMN warehouse_item.min_stock IS 'Minimum stock level for this item in this warehouse (warning threshold)';
COMMENT ON COLUMN warehouse_item.max_stock IS 'Maximum stock level for this item in this warehouse';
COMMENT ON COLUMN warehouse_item.reorder_point IS 'Stock level at which to trigger reorder';
COMMENT ON COLUMN warehouse_item.preferred_location IS 'Physical location in warehouse (aisle, shelf, bin)';

-- Migrate existing data: create warehouse_item records for items with stock
INSERT INTO warehouse_item (tenant_id, warehouse_id, item_id, is_active, created_at, updated_at)
SELECT DISTINCT
  i.tenant_id,
  COALESCE(i.default_warehouse_id, i.initial_warehouse_id) AS warehouse_id,
  i.id AS item_id,
  TRUE AS is_active,
  NOW() AS created_at,
  NOW() AS updated_at
FROM item i
WHERE i.is_deleted = FALSE
  AND (i.default_warehouse_id IS NOT NULL OR i.initial_warehouse_id IS NOT NULL)
  AND NOT EXISTS (
    SELECT 1 FROM warehouse_item wi
    WHERE wi.item_id = i.id
      AND wi.warehouse_id = COALESCE(i.default_warehouse_id, i.initial_warehouse_id)
      AND wi.is_deleted = FALSE
  );

-- Also create warehouse_item records for all items with inventory transactions
INSERT INTO warehouse_item (tenant_id, warehouse_id, item_id, is_active, created_at, updated_at)
SELECT DISTINCT
  it.tenant_id,
  it.warehouse_id,
  it.item_id,
  TRUE AS is_active,
  NOW() AS created_at,
  NOW() AS updated_at
FROM inventory_transaction it
WHERE it.is_deleted = FALSE
  AND NOT EXISTS (
    SELECT 1 FROM warehouse_item wi
    WHERE wi.item_id = it.item_id
      AND wi.warehouse_id = it.warehouse_id
      AND wi.is_deleted = FALSE
  );

-- Log how many records were created
DO $$
DECLARE
  record_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO record_count
  FROM warehouse_item
  WHERE is_deleted = FALSE;
  
  RAISE NOTICE 'Created % warehouse_item records', record_count;
END $$;
