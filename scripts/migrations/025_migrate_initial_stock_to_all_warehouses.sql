-- Migration 025: Migrate initial_stock to warehouse_item + inventory_transaction for all active warehouses
-- For items with initial_stock > 0 and WITHOUT an existing INITIAL_STOCK inventory transaction,
-- create a warehouse_item for each active warehouse (if missing) and insert an IN inventory_transaction
-- with quantity = initial_stock so stock is visible per warehouse.

DO $$
DECLARE
  r_item RECORD;
  r_wh RECORD;
  v_qty numeric;
BEGIN
  FOR r_item IN
    SELECT id, tenant_id, initial_stock, purchase_price
    FROM item
    WHERE COALESCE(initial_stock, 0) > 0
      AND is_deleted = FALSE
      AND NOT EXISTS (
        SELECT 1 FROM inventory_transaction it
        WHERE it.item_id = item.id
          AND it.reference_type = 'INITIAL_STOCK'
          AND it.is_deleted = FALSE
      )
  LOOP
    v_qty := COALESCE(r_item.initial_stock, 0);

    -- iterate active warehouses
    FOR r_wh IN
      SELECT id, tenant_id FROM warehouse WHERE is_deleted = FALSE AND (is_active IS NULL OR is_active = TRUE)
    LOOP
      -- create warehouse_item if missing
      INSERT INTO warehouse_item (id, tenant_id, warehouse_id, item_id, min_stock, is_active, is_deleted, created_at, updated_at)
      SELECT gen_random_uuid(), r_item.tenant_id, r_wh.id, r_item.id, 0, TRUE, FALSE, NOW(), NOW()
      WHERE NOT EXISTS (
        SELECT 1 FROM warehouse_item wi
        WHERE wi.item_id = r_item.id
          AND wi.warehouse_id = r_wh.id
          AND wi.is_deleted = FALSE
      );

      -- insert inventory_transaction IN for this warehouse
      INSERT INTO inventory_transaction (
        id, tenant_id, warehouse_id, item_id,
        transaction_type, quantity, unit_price, total_value,
        transaction_date, reference_type, ref_id, ref_type,
        is_deleted, created_at, updated_at
      )
      SELECT
        gen_random_uuid(), r_item.tenant_id, r_wh.id, r_item.id,
        'in', v_qty, COALESCE(r_item.purchase_price, 0), COALESCE(r_item.purchase_price,0) * v_qty,
        NOW(), 'INITIAL_STOCK', r_item.id, 'item', FALSE, NOW(), NOW()
      WHERE v_qty > 0;

    END LOOP;
  END LOOP;
END$$;

-- Summary notice: count inserted rows (optional)
-- You can check results with queries against warehouse_item, inventory_transaction and stock_level_view.
