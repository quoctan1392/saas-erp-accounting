-- Migration: Migrate existing initial_stock values to inventory_transaction records
-- Description: For items with initial_stock > 0, create inventory_transaction IN records

-- Insert inventory_transaction records for items with initial_stock > 0 and default_warehouse_id
INSERT INTO inventory_transaction (
  tenant_id,
  item_id,
  warehouse_id,
  transaction_type,
  transaction_date,
  quantity,
  unit_price,
  total_value,
  description,
  reference_id,
  reference_type,
  created_at,
  updated_at
)
SELECT 
  i.tenant_id,
  i.id AS item_id,
  COALESCE(i.default_warehouse_id, i.initial_warehouse_id) AS warehouse_id,
  'in' AS transaction_type,
  i.created_at::date AS transaction_date,
  i.initial_stock AS quantity,
  COALESCE(i.purchase_price, 0) AS unit_price,
  i.initial_stock * COALESCE(i.purchase_price, 0) AS total_value,
  'Tồn kho ban đầu từ migration (initial_stock)' AS description,
  i.id AS reference_id,
  'INITIAL_STOCK_MIGRATION' AS reference_type,
  NOW() AS created_at,
  NOW() AS updated_at
FROM item i
WHERE i.is_deleted = FALSE
  AND i.initial_stock > 0
  AND (i.default_warehouse_id IS NOT NULL OR i.initial_warehouse_id IS NOT NULL)
  AND NOT EXISTS (
    -- Avoid duplicates if migration runs multiple times
    SELECT 1 FROM inventory_transaction it
    WHERE it.item_id = i.id
      AND it.reference_type = 'INITIAL_STOCK_MIGRATION'
      AND it.is_deleted = FALSE
  );

-- Log how many records were migrated
DO $$
DECLARE
  migrated_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO migrated_count
  FROM inventory_transaction
  WHERE reference_type = 'INITIAL_STOCK_MIGRATION'
    AND is_deleted = FALSE;
  
  RAISE NOTICE 'Migrated % initial stock records to inventory_transaction', migrated_count;
END $$;
