-- Rollback migration 025: Remove incorrect warehouse_item and inventory_transaction records
-- Migration 025 incorrectly created records for ALL warehouses, but initial_stock should only go to default warehouse

-- Delete inventory_transaction records created by migration 025 (INITIAL_STOCK for wrong warehouses)
-- Keep only transactions where warehouse_id matches item's default_warehouse_id or initial_warehouse_id
DELETE FROM inventory_transaction
WHERE reference_type = 'INITIAL_STOCK'
  AND is_deleted = FALSE
  AND EXISTS (
    SELECT 1 FROM item i
    WHERE i.id = inventory_transaction.item_id
      AND i.is_deleted = FALSE
      AND COALESCE(i.initial_stock, 0) > 0
      AND inventory_transaction.warehouse_id NOT IN (
        SELECT w_id FROM (
          VALUES (i.default_warehouse_id), (i.initial_warehouse_id)
        ) AS t(w_id)
        WHERE w_id IS NOT NULL
      )
  );

-- Delete warehouse_item records for warehouses that don't match default/initial warehouse
-- This cleans up the junction table entries created by migration 025
DELETE FROM warehouse_item
WHERE is_deleted = FALSE
  AND NOT EXISTS (
    SELECT 1 FROM inventory_transaction it
    WHERE it.item_id = warehouse_item.item_id
      AND it.warehouse_id = warehouse_item.warehouse_id
      AND it.is_deleted = FALSE
  );

-- Summary
DO $$
BEGIN
  RAISE NOTICE 'Rollback complete: Removed incorrect warehouse_item and inventory_transaction records from migration 025';
END$$;
